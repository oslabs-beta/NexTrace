// const express = require('express');
// const app = express();
// const port = 9999;

// app.get('/', (req, res) => {
//   res.send('Hello, world!');
// });

// app.use('/otel', (req, res, next) => {
//   res.locals.trace = req.body;
//   console.log(req.body);
//   return next();
// }, (req, res) => {
//   return res.status(200).json(res.locals.trace);
// });


// app.listen(port, () => {
//   console.log(`Server is listening on port ${port}`);
// });

const express = require('express');
const app = express();
const port = 9999;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, world!');
  console.log('in get / request')
});

app.use('/otel', (req, res, next) => {
  res.locals.trace = req.body;
  console.log('TRACE', res.locals.trace);
  // const span = req.body.resourceSpans[0].scopeSpans[0].spans[0]; 
  // if (span) {
  //   const startTime = span.startTimeUnixNano / 1000; // Convert to milliseconds
  //   const endTime = span.endTimeUnixNano / 1000; // Convert to milliseconds
  //   const duration = endTime - startTime;
  //   console.log('Duration:', duration, 'ms');
  // }

  return next();
}, (req, res) => {
  return res.status(200).json('Span Received');
});


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

