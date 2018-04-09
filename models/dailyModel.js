var mongoose = require('mongoose');
var daily = require('../schemas/daily');
var	dailySchema = mongoose.model('dailySchema', daily);

module.exports = dailySchema;