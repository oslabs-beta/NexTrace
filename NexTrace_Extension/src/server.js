const express = require('express');
const app = express();
const port = 9999;

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
