var mongoose = require('mongoose');
var tags = require('../schemas/dailyTags');
var	dailytags = mongoose.model('dailytags', tags);

module.exports = dailytags;