const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/line-bot-weather');

module.exports = dbConnection = mongoose.connection;