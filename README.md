## LINE bot weather

A LINE bot that responds to weather questions (In Traditional Chinese)

### Screenshot
<img src="https://github.com/wm4n/line-bot-weather/blob/master/readme/screen01.jpg" width="480"/>

### How to setup

1. Follow the [link](https://github.com/wm4n/nodejs-starter/blob/line-bot/doc/node_express_linebot.md) to setup your minimal LINE bot, node and deploy on Heroku server.

2. Register an [和風天氣](https://www.heweather.com) (free) account and write down the API key. I used this services because it recognize the city in Chinese so there's no extra mapping required.

3. Add this API key to your heroku server like adding LINE channel ID and access token. Run the heroku command below
```
heroku config:set heweather_key="<YOUR API KEY>"
```

4. Your LINE bot should be able to answer few weather questions.
