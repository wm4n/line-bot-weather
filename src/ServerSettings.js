require('dotenv').config();

module.exports = {
    serverDomain: 'https://43697aef.ngrok.io',
    serverPort: process.env.PORT || 4321,
    googleKey: process.env.google_key,
    weatherKey: process.env.openWeatherMap_key 
}