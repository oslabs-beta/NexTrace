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
    obj.start = Math.floor(span.startTimeUnixNano / 1000000);
    //STORES SERVER SIDE / CLIENT SIDE RENDERING DATA
    if (span.kind === 3) obj.rendering = 'server';
    else if (span.kind === 2) obj.rendering = 'client';
    else obj.rendering = '';

    //CHECKS FOR DUPLICATES AND UPDATES / PUSHES NEW REQUESTS
    if (requestArray.some(item => item.name === obj.name && item.type === obj.type && item.method === obj.method && item.rendering === obj.rendering && item.status === obj.status)){
      requestArray[requestArray.findIndex(item => item.name === obj.name && item.type === obj.type && item.method === obj.method && item.rendering === obj.rendering && item.status === obj.status)] = obj;
    }
    else if (obj.type === 'AppRouteRouteHandlers.runHandler' || obj.type === 'AppRender.getBodyResult' || obj.name.split(' ').pop() === '/' || obj.name.includes('http://localhost:3695')) {
    } else {
      requestArray.push(obj);
    }
      sendToSocketBySocketId('Metric', requestArray);
    }
    return res.status(200).json('Span Received');
  });


app.post('/getLogs', (req,res,next) => {
  let consoleLog = JSON.parse(req.body.log);
  const path = req.body.path;

  if (typeof consoleLog === 'string'){
    consoleLog = consoleLog
  }
  else if (typeof consoleLog === 'object'){
    consoleLog = JSON.stringify(consoleLog)
  }

  if (consoleLogArray.some(item => JSON.stringify(item.consoleLog) === JSON.stringify(consoleLog))) {
  } else {
    consoleLogArray.push({ consoleLog, path });
    sendToSocketBySocketId('Console', consoleLogArray);
    return res.status(200).send('Received');
  }
});


/*Catch unkown Routes*/
app.use((req, res) => res.status(404).send('This is not the page you\'re looking for...'));

/*Catch unkown Middleware errors*/
app.use((err, req, res, next) => {
  console.log('error here: ', err);
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

//WEBSOCKET CONNECTION & FUNCTION TO SEND DATA TO RESPECTIVE PANEL
const connectedClients = new Map();
wss.on('connection', (socket) => {
  socket.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.socketId) {
      connectedClients.set(data.socketId, socket);
    } else {
    }
    if (data.socketId === 'Metric') sendToSocketBySocketId('Metric', requestArray);
    else if (data.socketId === 'Console') sendToSocketBySocketId('Console', consoleLogArray);
  });

  socket.on('close', () => {
    connectedClients.forEach((client, socketId) => {
      if (client === socket) {
        connectedClients.delete(socketId);
      }
    });
  });
});

function sendToSocketBySocketId(socketId, message) {
  const socket = connectedClients.get(socketId);
  if (socket) {
    socket.send(JSON.stringify(message));
  }
}

//SERVER INSTANCE TO OPEN AND CLOSE SERVER & WEBSOCKET FUNCTIONALITY
let serverInstance;
function server () {
  serverInstance = app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
    requestArray = [];
    consoleLogArray = [];
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
