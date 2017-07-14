const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);

module.exports = dbConnection = mongoose.connection;