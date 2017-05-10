require('dotenv').config();
const express = require("express");
const linebot = require("linebot");
const chat = require("./chat.js");

// for test
//var bodyParser = require('body-parser');

const PORT = process.env.PORT || 4321;
const HEWEATHER_KEY = process.env.heweather_key;

const bot = linebot({
  channelId: process.env.channelId,
  channelSecret: process.env.channelSecret,
  channelAccessToken: process.env.channelAccessToken
});

// const proxy = require('http-proxy').createProxyServer({
//     host: 'http://10.0.108.220:4001',
//     // port: 80
// });


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

// === Proxy ===
// const httpProxy = require('http-proxy');
// app.use('/', function(req, res, next) {
//     httpProxy.web(req, res, {
//         target: 'http://10.0.108.220:4001'
//     }, next);
// });

//app.use(bodyParser.json());
// app.use(function (req, res, next) {
//   console.log("=== HEADER ===", JSON.stringify(req.headers, null, 2));
//   console.log("=== RAW BODY ===\n", req.rawBody);
//   console.log("=== BODY ===", JSON.stringify(req.body, null, 2));
//   next();
// });

// app.post('/', linebotParser);
app.post('/', function (req, res) {
  res.redirect("http://wman.ddns.net:4321/");
});

app.listen(PORT, function () {
  console.log(`Express server is up on port ${PORT}`);
});
