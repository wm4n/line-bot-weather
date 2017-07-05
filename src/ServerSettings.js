require('dotenv').config();

module.exports = {
    serverDomain: 'https://line-bot-weather.herokuapp.com',
    serverPort: process.env.PORT || 4321,
    googleKey: process.env.google_key,
    weatherKey: process.env.openWeatherMap_key 
}