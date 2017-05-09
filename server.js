require('dotenv').config();
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

//console.log(process.env.channelId, "\n", process.env.channelSecret, "\n", process.env.channelAccessToken);

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

//app.use(bodyParser.json());
app.use(function (req, res, next) {
  // console.log(JSON.stringify(req, (key, value) => {
  //   if("res" === key || "req" === key || "_httpMessage" === key || "HTTPParser" === key || "TimersList" === key || "TCP" === key || "ServerResponse" === key) {
  //     return;
  //   }
  //   return value;
  // }, 2));
  console.log("=== HEADER ===", JSON.stringify(req.headers, null, 2));
  console.log("=== RAW BODY ===\n", req.rawBody);
  console.log("=== BODY ===", JSON.stringify(req.body, null, 2));
  next();
});

app.post('/', linebotParser);

app.listen(PORT, function () {
  console.log(`Express server is up on port ${PORT}`);
});
