var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var crypto = require('crypto')
var objectId = Schema.Types.ObjectId
var autoIncrement = require('mongoose-auto-increment')  	//自增ID 模块
    autoIncrement.initialize(mongoose.connection)         //初始化

var BKSchema = new Schema({
  author: String,																					
  title: String,																					
  content: String,																					
  url: String,																					
	create_time: { type: Date, default: Date.now },        //创建时间
  update_time: { type: Date, default: Date.now },        //更新时间
});

BKSchema.plugin(autoIncrement.plugin, {
  model: 'Bks',
  field: 'bkid',
  startAt: 1,
  incrementBy: 1
});


module.exports = BKSchema



