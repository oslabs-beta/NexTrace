const { request } = require('http');
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const app = express();
const port = 3695;

app.use(express.json());
app.use(cors());

let requestArray = [];
let consoleLogArray = [];
const wss = new WebSocket.Server({ noServer: true });

app.get('/', (req, res) => res.send('Hello, world!'));

app.use('/otel', (req, res, next) => {
  res.locals.trace = req.body;
  const span = req.body.resourceSpans[0].scopeSpans[0].spans[0]; 
  const obj = {name: '', type: '', method: '', duration: 0, status: '', rendering : ''}

  if (span) {
    //STORING NAME OF SPAN
    const name = span.name;
    obj.name = name;
    //STORING TYPE, METHOD, STATUS_CODE FROM ATTRIBUTES ARRAY
    for (let i = 0; i < span.attributes.length; i++){
      if(span.attributes[i].key === 'next.span_type') {const type = span.attributes[i].value.stringValue; 
        obj.type = type;
      }
      if(span.attributes[i].key === 'http.method') {const method = span.attributes[i].value.stringValue; 
        obj.method = method;
      }
      if(span.attributes[i].key === 'http.status_code') {const status = span.attributes[i].value.intValue; 
        obj.status = status;
      }
    }
    //STORING DURATION OF SPAN
    const duration = (span.endTimeUnixNano  - span.startTimeUnixNano) / 1000000 //converts to milliseconds
    obj.duration = Math.floor(duration);
    //STORES SERVER SIDE / CLIENT SIDE RENDERING DATA
    if (span.kind === 3) obj.rendering = 'server';
    else if (span.kind === 2) obj.rendering = 'client';
    else obj.rendering = '';

    //CHECKS FOR DUPLICATES AND UPDATES / PUSHES NEW REQUESTS
    if (requestArray.some(item => item.name === obj.name && item.type === obj.type && item.method === obj.method && item.rendering === obj.rendering && item.status === obj.status)){
      requestArray[requestArray.findIndex(item => item.name === obj.name && item.type === obj.type && item.method === obj.method && item.rendering === obj.rendering && item.status === obj.status)] = obj;
    }
    else if (obj.type === 'AppRouteRouteHandlers.runHandler' || obj.type === 'AppRender.getBodyResult' || obj.name.split(' ').pop() === '/') {
    } else {
      requestArray.push(obj);
      console.log('Inserted new request', requestArray);
    }

      broadcastRequestArray(wss, requestArray);
    }
    return res.status(200).json('Span Received');
  });


app.post('/getLogs', (req,res,next) => {
  const consoleLog = JSON.parse(req.body.log);
  consoleLogArray.push(consoleLog);
  console.log('Log Array', consoleLogArray);
  //Send to console react component only
  
  return res.status(200).send('Received');
})

app.get('/sendLogs', (req,res,next) =>{
  return res.status(200).json(consoleLogArray)
})


app.get('/getData', (req,res) =>{
  return res.status(200).json(requestArray);
})

/*Catch unkown Routes*/
app.use((req, res) => res.status(404).send('This is not the page you\'re looking for...'));

/*Catch unkown Middleware errors*/
app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

//WEBSOCKET CONNECTION & FUNCTION TO BROADCAST REQUEST ARRAY TO METRICS PANEL
wss.on('connection', (socket) => {
  socket.on('message', (message) => {
    console.log('Received message from client:', message);
  });
});

function broadcastRequestArray(wss, requestArray) {
  const message = JSON.stringify(requestArray);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

//SERVER INSTANCE TO OPEN AND CLOSE SERVER & WEBSOCKET FUNCTIONALITY
let serverInstance;
function server () {
  serverInstance = app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
  });

  serverInstance.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (socket) => {
      wss.emit('connection', socket, request);
    });
  });
};

function closeServer () {
  console.log(`Server is closing port: ${port}`);
  serverInstance.close();
}


module.exports = { server, closeServer };
