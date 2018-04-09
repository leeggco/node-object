var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var crypto = require('crypto')
var objectId = Schema.Types.ObjectId
var autoIncrement = require('mongoose-auto-increment')  	//自增ID 模块
    autoIncrement.initialize(mongoose.connection)         //初始化

var BKxSchema = new Schema({
  author: String,																					
  title: String,																					
  content: String,																					
  url: String,																					
	create_time: { type: Date, default: Date.now },        //创建时间
  update_time: { type: Date, default: Date.now },        //更新时间
});

BKxSchema.plugin(autoIncrement.plugin, {
  model: 'Bkxs',
  field: 'bkxid',
  startAt: 1,
  incrementBy: 1
});


module.exports = BKxSchema



