const express = require("express");
const linebot = require("linebot");
const chat = require("./chat.js");

// for test
var bodyParser = require('body-parser');

const PORT = process.env.PORT || 3123;
const HEWEATHER_KEY = process.env.heweather_key;

const bot = linebot({
  channelId: process.env.channelId,
  channelSecret: process.env.channelSecret,
  channelAccessToken: process.env.channelAccessToken
});

bot.on('message', function(event) {
  if (event.message.type = 'text') {
    const msg = event.message.text;
    let r = chat.resolve(msg);
    if(null !== r) {
      r.then(res => event.reply(res));
    } 
  }
});

// Create our app
const app = express();
const linebotParser = bot.parser();

// app.post('/', linebotParser);

app.use(bodyParser.json());
app.use(function (req, res) {
  console.log(JSON.stringify(req, null, 2));
});

app.listen(PORT, function () {
  console.log(`Express server is up on port ${PORT}`);
});
