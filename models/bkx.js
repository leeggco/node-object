var mongoose = require('mongoose');
var BKSchema = require('../schemas/bkx')
var	BKxs = mongoose.model('Bkxs', BKSchema)

module.exports = BKxs