var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectId = Schema.Types.ObjectId;
var autoIncrement = require('mongoose-auto-increment');
    autoIncrement.initialize(mongoose.connection); 

var dailySchema = new Schema({
  author: {type: String, default: 'self' },												
  title: String,																					
  content: String,																					
  addrees: String,																		
  weaher: String,																		
  client: String,
  level: {type: Date, default: 0 },
  tags: [{type: objectId, ref: 'dailytags'}],
  category: [{type: objectId, ref: 'dailycategories'}],
  pics: [{type: Array, default: 'null'}], 
  createTime: {type: Date, default: Date.now },
  updateTime: {type: Date, default: Date.now },
});

dailySchema.plugin(autoIncrement.plugin, {
  model: 'dailySchema',
  field: 'spid',
  startAt: 50000,
  incrementBy: 1
});

dailySchema.pre('save', function(next) {
  if (this.isNew) {
    this.create_time = this.update_time = Date.now()
  }
  else {
    this.update_time = Date.now()
  }

  next()
});

module.exports = dailySchema;



