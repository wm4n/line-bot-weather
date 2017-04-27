const express = require('express');

// port for our server...
// evn.PORT is for heroku deployment
const PORT = process.env.PORT || 3123;

// Create our app...
const app = express();

// Serve the public folder...
app.use(express.static(__dirname + '/public'));

app.listen(PORT, function () {
  console.log(`Express server is up running on port ${PORT}`);
});
