var mongoose = require('mongoose');
var Category = require('../schemas/dailyCategory');
var	dailyCategory = mongoose.model('dailyCategory', Category);

module.exports = dailyCategory;