const { currentGeoWeather } = require('./GeoWeather');
const { createThumbnail } = require('./Thumbnails');
const bot = require('./LineBot');

module.exports = app => {

    // Handle LINE bot request
    app.post('/', bot);

    // Handle image request for card
    app.get('/img/:id', (req, res) => {
        const { location, temp, humidity, desc } = req.query;
        createThumbnail(req.params.id, '#5e99f3', location, temp, humidity, desc)
            .then( buffer => res.status(200).send(buffer) )
            .catch( err => res.status(404).send(`Icon ${req.params.id} cannot be found!`) );
    });
}