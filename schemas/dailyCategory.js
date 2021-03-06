var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectId = Schema.Types.ObjectId;
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
    autoIncrement.initialize(mongoose.connection);        //初始化

var dailyCategory = new Schema({
  name : String,
  upperCase : String,
  dailys: [{type: objectId, ref: 'dailyschemas'}],
  createTime : { type: Date, default: Date.now },      //创建时间
  updateTime : { type: Date, default: Date.now },      //更新时间
});

dailyCategory.plugin(autoIncrement.plugin, {
  model: 'dailyCategory',
  field: 'dailyCID',
  startAt: 1,
  incrementBy: 1
});

module.exports = dailyCategory