const { request } = require('http');
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const port = 3695;

app.use(express.json());
app.use(cors());

let [requestArray, consoleLogArray, serverStatus] = [[], [], false];
const stagedData = {};

//Sets up new Websocket Instance
const wss = new WebSocket.Server({ noServer: true });

//Routes request from CRUD app's boiler plate code using /otel route
app.use('/otel', (req, res, next) => {
  res.locals.trace = req.body;
  const span = req.body.resourceSpans[0].scopeSpans[0].spans[0];
  const obj = { name: '', type: '', method: '', duration: 0, status: '', rendering: '' }
  if (span && serverStatus === true) {
    //Storing name of span
    const name = span.name;
    obj.name = name;
    //Storing Type, Method, and Status_code from Attribute Array
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
    //Storing duration of Span
    const duration = (span.endTimeUnixNano - span.startTimeUnixNano) / 1000000 //converts to milliseconds
    obj.duration = Math.floor(duration);
    obj.start = Math.floor(span.startTimeUnixNano / 1000000);
    //Stores server side / client side rendering data
    if (span.kind === 3) obj.rendering = 'server';
    else if (span.kind === 2) obj.rendering = 'client';
    else obj.rendering = '';
    //Filters requests, stages requests and sends requests back to Metrics Component
    if (obj.type === 'AppRouteRouteHandlers.runHandler' || obj.type === 'AppRender.getBodyResult' || obj.name.split(' ').pop() === '/' || obj.name.includes('http://localhost:3695')) {
    } else {
      if (obj.status === '') {
        const stagedName = obj.name.split(' ').pop();
        if (stagedData[stagedName]) {
          stagedData[stagedName] = { name: obj.name, type: obj.type, method: obj.method, duration: Number(obj.duration), status: stagedData[stagedName].status, rendering: obj.rendering, start: obj.start }
          requestArray.push(stagedData[stagedName]);
          sendToSocketBySocketId('Metric', requestArray);
          delete stagedData[stagedName];
        } else {
          stagedData[stagedName] = obj;
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

//Routes request from CRUD App's boiler plate code using POST /getLogs route
app.post('/getLogs', (req, res, next) => {
  let consoleLog = req.body.log.map(arg => JSON.parse(arg));
  try {
    if (consoleLog[2] === 'NTASYNC'  && serverStatus === true) {
      //Checks if staging area currently has endpoint
      if (stagedData[consoleLog[0]]) {
        stagedData[consoleLog[0]].status = consoleLog[1];
        if (stagedData[consoleLog[0]].name !== '') {
          requestArray.push(stagedData[consoleLog[0]])
          sendToSocketBySocketId('Metric', requestArray);
          delete stagedData[consoleLog[0]];
        }
      } else {
        stagedData[consoleLog[0]] = { name: '', type: '', method: '', duration: 0, status: consoleLog[1], rendering: '', start: 0 };
      }
    }
    else {
      const path = req.body.path;
      if (typeof consoleLog === 'string') {
        consoleLog = consoleLog
      }
      else if (typeof consoleLog === 'object'  && serverStatus === true) {
        consoleLog = JSON.stringify(consoleLog)
      }
      consoleLogArray.push({ consoleLog, path });
      sendToSocketBySocketId('Console', consoleLogArray);
    }
    return res.status(200).send('Received');
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

//Websocket connection & Function to send data to respective panel
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
//Function to send data to respective socketId
function sendToSocketBySocketId(socketId, message) {
  const socket = connectedClients.get(socketId);
  if (socket) {
    socket.send(JSON.stringify(message));
  }
}

//Server instance to Open and Close Server with Websocket Functionality
let serverInstance;
function server() {
  serverInstance = app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
    requestArray = [];
    consoleLogArray = [];
    serverStatus = true;
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
  serverStatus = false;
}
//Returns current port of server instance
function getPort() {
  if (serverInstance) return serverInstance.address().port;
}

module.exports = { server, closeServer, app, getPort };