var mongoose = require('mongoose')
var BK = require('../models/bkx')
var moment = require('moment');
var http = require("http");
var fs = require("fs");


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
    
		BK
			.find({})
			.sort({'create_time': -1})
			.skip(skipCount)
			.limit(1000)
			.exec(function(err, data){
					res.render('bkpage2', { 
					title: '百科页面2 | 天天书屋', 
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


exports.downImg = function(req, res){
    var url = req.body.img;
    console.log(url);
    http.get(url, function(res){
    var imgData = "";

    res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开


    res.on("data", function(chunk){
        imgData+=chunk;
    });

    res.on("end", function(){
        var imgPath= url.split(".").pop();
        fs.writeFile(__dirname + "/imgs/x."+imgPath,imgData,"binary",function(err){
           console.log(err);
        })
    });
});
}






















