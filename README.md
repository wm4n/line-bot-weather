## LINE Bot Weather

A LINE bot that responds to weather queries (In Traditional Chinese)

查詢天氣用的LINE聊天機器人

### Purpose
To experiment with LINE bot and Next.JS

### Screenshot
<img src="https://github.com/wm4n/line-bot-weather/blob/master/readme/screen02.jpg" width="280"/> <img src="https://github.com/wm4n/line-bot-weather/blob/master/readme/screen03.jpg" width="280"/> <img src="https://github.com/wm4n/line-bot-weather/blob/master/readme/screen04.jpg" width="280"/>

### Packages and services used
* Node.js and Express for backend request handling and respond to LINE queries

* [linebot API from boybundit](https://github.com/boybundit/linebot)

* Mongodb for storing LINE friends' preferences

* React and Next.js for rendering UI

* GraphicsMagick for generating images

* Google API for geolocation lookup

* Openweathermap for weather data

* Unsplash for background image

* Heroku and Mongolab for hosting

* LINE developer account

### How to setup
1. must have a LINE developer (Message API) account (Free for simply reply message or 1000/day for broadcast/push message）

2. Signup Unsplash account (Free for limited query/hr)

3. Signup Google API (Free for limited query/day)

4. Heroku account or other similar services (Heroku is free. For MongoLab Addon, using sandbox plan is free but require to add credit card)

5. Grab the repo and setup your Heroku repo. In addition, setup following environment variable using `Heroku config:set`
  ```
  * MONGODB_URI             // if you're using Heroku addon, this will be filled automatically
  * Unsplash_applicationId: // from Unsplash signup
  * Unsplash_callbackUrl:   // from Unsplash signup
  * Unsplash_secret:        // from Unsplash signup
  * channelAccessToken:     // from LINE developer signup
  * channelId:              // from LINE developer signup
  * channelSecret:          // from LINE developer signup
  * google_key:             // Google API key
  * openWeatherMap_key:     // Open Weather Map key
  * server_domain:          // Your herokup app hostname e.g. https://line-bot-weather.herokuapp.com
  ```
  
### How to use (Currently command only supports Traditional Chinese Keywords)
1. `丞丞 使用說明` or `丞丞 help`
   
  顯示 ImageMap 功能說明

2. `丞丞 [地點1] [地點2] [地點3]`
  
  顯示地點的氣象 e.g. 丞丞 高雄市

3. `丞丞 單位`
  
  切換顯示單位
  
4. 直接使用LINE送出位址資訊

  顯示地點的氣象
  
