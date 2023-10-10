const express = require('express');
const { request } = require('http');
const cors = require('cors');
const app = express();
const port = 3695;

app.use(express.json());
app.use(cors());


let requestArray = [];
let consoleLogArray = [];

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use('/otel', (req, res, next) => {
  res.locals.trace = req.body;
  const span = req.body.resourceSpans[0].scopeSpans[0].spans[0]; 
  const obj = {name: '', type: '', method: '', duration: 0, status: '', rendering : ''}

  if (span) {
    const name = span.name;
    obj.name = name;
    
    //TYPE, METHOD, STATUS_CODE FROM ATTRIBUTES ARRAY
    for (let i = 0; i < span.attributes.length; i++){
      if(span.attributes[i].key === 'next.span_type') {const type = span.attributes[i].value.stringValue; 
        // console.log('Type', type); 
        obj.type = type;
      }
      if(span.attributes[i].key === 'http.method') {const method = span.attributes[i].value.stringValue; 
        // console.log('Method', method); 
        obj.method = method;
      }
      if(span.attributes[i].key === 'http.status_code') {const status = span.attributes[i].value.intValue; 
        // console.log('Status', status); 
        obj.status = status;
      }
    }
    
    //DURATION IN MS DONE
    const duration = (span.endTimeUnixNano  - span.startTimeUnixNano) / 1000000 //converts to milliseconds
    // console.log('Duration:', duration, 'ms');
    obj.duration = Math.floor(duration);

      if (span.kind === 3){
        obj.rendering = 'server';
      }
      else if (span.kind === 2){
        obj.rendering = 'client';
      }
      else{
        obj.rendering = '';
      }

      // Using for console logs 
      if (requestArray.some(item => item.name === obj.name && item.type === obj.type && item.method === obj.method && item.rendering === obj.rendering && item.status === obj.status)) {
        console.log('Duplicate, SKIP');
      } else if (obj.type === 'AppRouteRouteHandlers.runHandler' || obj.type === 'AppRender.getBodyResult') {
        console.log('Don\'t want!, SKIP');
      } else {
        requestArray.push(obj);
        console.log('Inserted new request');
        console.log(requestArray);
      }

      // Refactored w/out console logs ^^
      // if (!requestArray.some(item =>
      //   item.name === obj.name &&
      //   item.type === obj.type &&
      //   item.method === obj.method &&
      //   item.rendering === obj.rendering &&
      //   item.status === obj.status
      // ) && obj.type !== 'AppRouteRouteHandlers.runHandler' && obj.type !== 'AppRender.getBodyResult') {
      //   requestArray.push(obj);
      // }
      
    }
  
    //ping our Metrics component with new requestArray.
    return res.status(200).json('Span Received');
  });


// app.get('/getLogs', (req,res,next) => {
//   const consoleLog = req.body; 
//   consoleLogArray.push(consoleLog);
// })
 

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



let serverInstance;
function server () {
  serverInstance = app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
  });
};
function closeServer () {
  console.log(`Server is closing port: ${port}`);
  serverInstance.close();
}

module.exports = { server, closeServer };
