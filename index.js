const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/telegram', (req, res) => {
  const jsonData = req.body;
  console.log(jsonData); // Add this line to log the JSON data
  // Process the JSON data from the Telegram bot
  // ...

  res.sendStatus(200); // Send a success response
});

app.listen(3000, () => {
  console.log('Express server is running on port 3000');
});
