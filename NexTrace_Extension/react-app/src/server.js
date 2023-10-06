const express = require('express');
const { request } = require('http');
const app = express();
const port = 3695;

app.use(express.json());

let requestArray = [];

app.get('/', (req, res) => {
  res.send('Hello, world!');
  console.log('in get / request')
});

app.use('/otel', (req, res, next) => {
  res.locals.trace = req.body;
  console.log('THE SPAN TRACE', res.locals.trace.resourceSpans[0].scopeSpans[0].spans[0]);
  const span = req.body.resourceSpans[0].scopeSpans[0].spans[0]; 
  const obj = {name: '', type: '', method: '', duration: 0, status: ''}

  if (span) {
    //ENDPOINT - NAME
    const name = span.name;
    console.log('Name:', name)
    obj.name = name;
    
    //TYPE, METHOD, STATUS_CODE FROM ATTRIBUTES ARRAY
    for (let i = 0; i < span.attributes.length; i++){
      if(span.attributes[i].key === 'next.span_type') {const type = span.attributes[i].value.stringValue; 
        console.log('Type', type); 
        obj.type = type;
      }
      if(span.attributes[i].key === 'http.method') {const method = span.attributes[i].value.stringValue; 
        console.log('Method', method); 
        obj.method = method;
      }
      if(span.attributes[i].key === 'http.status_code') {const status = span.attributes[i].value.intValue; 
        console.log('Status', status); 
        obj.status = status;
      }
    }
    
    //DURATION IN MS DONE
    const duration = (span.endTimeUnixNano  - span.startTimeUnixNano) / 1000000 //converts to milliseconds
    console.log('Duration:', duration, 'ms');
    obj.duration = duration;

  }
  requestArray.push(obj)
  console.log(requestArray);
  return res.status(200).json('Span Received');
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


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
