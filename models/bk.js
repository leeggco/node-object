var mongoose = require('mongoose');
var BKSchema = require('../schemas/bk')
var	BKs = mongoose.model('Bks', BKSchema)

module.exports = BKs