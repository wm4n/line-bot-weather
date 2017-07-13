const { currentGeoWeather } = require('./GeoWeather');
const { getImageMap, createImageMap, createThumbnail } = require('./Thumbnails');
const axios = require('axios');
const bot = require('./LineBot');

const getGuideContent = (req, res) => {
  const cache = getImageMap();
  if(cache) {
    const {buffer} = cache;
    res.status(200).send(buffer);
  }
  else {
    res.status(404).send('Image not found!');
  }
}

const getCardContent = (req, res) => {
  const { location, temp, humidity, desc, unit } = req.query;
  createThumbnail(req.params.id, '#5e99f3', location, temp, humidity, desc, unit)
    .then(buffer => res.status(200).send(buffer))
    .catch(err => {
      console.log(err);
      res.status(404).send(`Icon ${req.params.id} cannot be found!`);
    });
}

module.exports = app => {

  // Handle LINE bot request
  app.post('/', bot);

  app.get('/guide/:time/:size', getGuideContent);
  app.get('/guide', getGuideContent);

  // Handle image request for card
  app.get('/img/:id', getCardContent);
}