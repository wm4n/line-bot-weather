const bodyParser = require('body-parser');

module.exports = app => {

    // For testing purpose (Adding this prevent line bot parser from working)
    // app.use(bodyParser.json());

    // For testing purpose
    app.use( (req, res, next) => {
        console.log(`${req.method} ${req.originalUrl}`)
        next();
    });
}