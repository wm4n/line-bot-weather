require('dotenv').config();

module.exports = {
    serverDomain: process.env.server_domain,
    serverPort: process.env.PORT || 4321,
    googleKey: process.env.google_key,
    weatherKey: process.env.openWeatherMap_key 
}