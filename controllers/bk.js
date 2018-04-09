var mongoose = require('mongoose')
var BK = require('../models/bk')
var moment = require('moment');

exports.page = function(req, res){
  /*BK.find({},function(err, data){
    res.render('bkpage2', {
        title: '百科页面2', 
        current:'x',
        data: data,
        moment: moment
    })
  })*/
  
	BK.count({}, function(err, total){
		var rp = req.query.p || 1;
		var p = Math.ceil(total / 1000);
		var skipCount = (rp - 1) * 1000;
		var pageOpts = {};
		var sinx = (req.url).indexOf('?');
		var url = (req.url).substring(0, sinx);
		if(p >= 1){
			pageOpts = {
				url: url + '?p=',
				showPage: true,
				current: rp,
				totalPage: p //(p <= 5? p : 5)
			}
		} 
    
		BK.find({})
			.sort({'create_time': -1})
			.skip(skipCount)
			.limit(1000)
			.exec(function(err, data){
					res.render('bkpage', { 
					title: '百科页面1 | 天天书屋', 
					current:'x', 
					data: data, 
          moment: moment,
					pageOpts: pageOpts 
				});
			})
	})
  
  
  
  
}

exports.record = function(req, res){
	var data = req.body;
  var _bk = new BK(data);
  if(data.content != ''){
    _bk.save(function(err, data){

    })
  }

}

























