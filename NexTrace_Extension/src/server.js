const express = require('express');
const app = express();
const port = 9999;

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use('/otel', (req, res, next) => {
  res.locals.trace = req.body;
  return next();
}, (req, res) => {
  return res.status(200).json(res.locals.trace);
});




app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
