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
const stagedData = {};
// setInterval(() => console.log(stagedData), 10000)

const wss = new WebSocket.Server({ noServer: true });

app.get('/', (req, res) => res.send('Hello, world!'));

app.use('/otel', (req, res, next) => {
  res.locals.trace = req.body;
  const span = req.body.resourceSpans[0].scopeSpans[0].spans[0];
  const obj = { name: '', type: '', method: '', duration: 0, status: '', rendering: '' }

  if (span) {
    //STORING NAME OF SPAN
    const name = span.name;
    obj.name = name;
    //STORING TYPE, METHOD, STATUS_CODE FROM ATTRIBUTES ARRAY
    for (let i = 0; i < span.attributes.length; i++) {
      if (span.attributes[i].key === 'next.span_type') {
        const type = span.attributes[i].value.stringValue;
        obj.type = type;
      }
      if (span.attributes[i].key === 'http.method') {
        const method = span.attributes[i].value.stringValue;
        obj.method = method;
      }
      if (span.attributes[i].key === 'http.status_code') {
        const status = span.attributes[i].value.intValue;
        obj.status = status;
      }
    }
    //STORING DURATION OF SPAN
    const duration = (span.endTimeUnixNano - span.startTimeUnixNano) / 1000000 //converts to milliseconds
    obj.duration = Math.floor(duration);
    obj.start = Math.floor(span.startTimeUnixNano / 1000000);
    //STORES SERVER SIDE / CLIENT SIDE RENDERING DATA
    if (span.kind === 3) obj.rendering = 'server';
    else if (span.kind === 2) obj.rendering = 'client';
    else obj.rendering = '';

    //CHECKS FOR DUPLICATES AND UPDATES / PUSHES NEW REQUESTS
    // if (requestArray.some(item => item.name === obj.name && item.type === obj.type && item.method === obj.method && item.rendering === obj.rendering && item.status === obj.status)) {
    //   requestArray[requestArray.findIndex(item => item.name === obj.name && item.type === obj.type && item.method === obj.method && item.rendering === obj.rendering && item.status === obj.status)] = obj;
    // }
    if (obj.type === 'AppRouteRouteHandlers.runHandler' || obj.type === 'AppRender.getBodyResult' || obj.name.split(' ').pop() === '/' || obj.name.includes('http://localhost:3695')) {
    } else {
      if (obj.status === '') {
        const stagedName = obj.name.split(' ').pop();
        if (stagedData[stagedName]) {
          stagedData[stagedName] = { name: obj.name, type: obj.type, method: obj.method, duration: Number(obj.duration), status: stagedData[stagedName].status, rendering: obj.rendering, start: obj.start }
          console.log('the element already existed in staging, so we  added our properties: ', stagedData[stagedName]);
          requestArray.push(stagedData[stagedName]);
          console.log('shipping out: ', stagedData[stagedName]);
          sendToSocketBySocketId('Metric', requestArray);
          delete stagedData[stagedName];
        } else {
          stagedData[stagedName] = obj;
          console.log('there was no matching obj in storage, we added it, but the obj didnt have a status. we added it', stagedData[stagedName]);
        }
      } else {
        requestArray.push(obj);
      }
    }

    if (requestArray.length > 0 && obj.status !== '') {
      sendToSocketBySocketId('Metric', requestArray);
    }
  }
  return res.status(200).json('Span Received');
});


app.post('/getLogs', (req, res, next) => {
  let consoleLog = req.body.log.map(arg => JSON.parse(arg));
  try {
    // let consoleLog = JSON.parse(req.body.log);
    // console.log('here is the console log: ', consoleLog);
    if (consoleLog[2] === 'NTASYNC') {
      console.log('NTASYNC RECEIVED!: ', consoleLog);
      //Check if staging area has endpoint currently.
      if (stagedData[consoleLog[0]]) {
        console.log('it already existed in staged, so we added its status: ', stagedData[consoleLog[0]]);
        stagedData[consoleLog[0]].status = consoleLog[1];

        // if (requestArray.some(item => item.name === stagedData[consoleLog[0]].name && item.type === stagedData[consoleLog[0]].type && item.method === stagedData[consoleLog[0]].method && item.rendering === stagedData[consoleLog[0]].rendering && item.status === stagedData[consoleLog[0]].status)) {
        //   requestArray[requestArray.findIndex(item => item.name === stagedData[consoleLog[0]].name && item.type === stagedData[consoleLog[0]].type && item.method === stagedData[consoleLog[0]].method && item.rendering === stagedData[consoleLog[0]].rendering && item.status === stagedData[consoleLog[0]].status)] = stagedData[consoleLog[0]];
        // }
        if (stagedData[consoleLog[0]].status === '') {
          console.log('the stagedData is not ready. ', stagedData[consoleLog[0]]);
        }
        else {
          requestArray.push(stagedData[consoleLog[0]])
          sendToSocketBySocketId('Metric', requestArray);
          delete stagedData[consoleLog[0]];
        }

      } else {
        stagedData[consoleLog[0]] = { name: '', type: '', method: '', duration: 0, status: consoleLog[1], rendering: '' };
      }
    }

    else {
      const path = req.body.path;

      if (typeof consoleLog === 'string') {
        consoleLog = consoleLog
      }
      else if (typeof consoleLog === 'object') {
        consoleLog = JSON.stringify(consoleLog)
      }

      // if (consoleLogArray.some(item => JSON.stringify(item.consoleLog) === JSON.stringify(consoleLog))) {
      // } else {
      consoleLogArray.push({ consoleLog, path });
      sendToSocketBySocketId('Console', consoleLogArray);
    }
    return res.status(200).send('Received');
    // }
  }
  catch (err) {
    return next(err);
  }
});


/*Catch unkown Routes*/
app.use((req, res) => res.status(404).send('This is not the page you\'re looking for...'));

/*Catch unkown Middleware errors*/
app.use((err, req, res, next) => {
  console.log('ERROR HERE: ', err);
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
function server() {
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

function closeServer() {
  console.log(`Server is closing port: ${port}`);
  serverInstance.close();
}


module.exports = { server, closeServer };
