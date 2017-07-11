const mongoose = require('mongoose');

const UserConfigSchema = mongoose.Schema({
    _id: {
      type: String,
      unique: true
    },
    tempUnitPref: String
});

const UserConfig = mongoose.model('userConfig', UserConfigSchema);

module.exports = UserConfig;