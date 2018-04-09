var mongoose = require('mongoose');
var daily = require('../models/dailyModel');
var dailyCategory = require('../models/dailyCategoryModel');
var dailyTags = require('../models/dailyTagsModel');
var moment = require('moment');

exports.dailyAddNew = function(req, res){
  var data = req.body;
  var _daily = new daily(data);
  var tagsName = data.tagsName.toUpperCase();
  var categoryName = data.categoryName.toUpperCase();
  console.log(data);

  _daily.save(function(err, daily){
    if (err) {
      console.log(err)
    }
	
	console.log(daily);
	
	  dailyCategory.findOne({'name': categoryName}, function(err, data){
		if(data){
		  var _categoryId = data._id;
		  console.log('Tips: 分类已存在');
		  
		  dailyCategory.update({
				_id: data._id
			}, {
				$push: {
					'dailys': daily._id
				}
			}, function(err, data) {
				if (err) {
					console.log(err)
				}
				_daily.category.push(_categoryId);
				_daily.save(function(err, data) {
					if (err) {
						console.log(err)
					}
					console.log('Tips: 分类已更新');
					console.log(data);
					//res.redirect('/detail/' + data.bid)
				})
			})
		  
			var tempArr = [];
			var tagsArr = tagsName.split(',');
			console.log('tagsArr' + tagsArr);
			
			tagsArr.forEach(function(val,index,arr){
			  var _dailyTags = new dailyTags({
				name: val,
				upperCase: val,
			  });
			  
			  console.log(val);
			  
			  dailyTags.findOne({'name': val}, function(err, data){
				if(err){
				  console.log(err)
				}
				
				if(data){
				  var _tagId = data._id;
				  console.log('Tips: 标签已存在');
				  tempArr.push(data._id);
				  
					_daily.tags.push(data._id);
					_daily.save(function(err, data) {
						if (err) {
							console.log(err)
						}
						//res.redirect('/detail/' + data.bid)
						
						console.log('标签保存成功！');
					})
				}else {
				  _dailyTags.save(function(err, data){
					console.log('Tips: 标签已新增');
					tempArr.push(data._id);
					
					_daily.tags.push(data._id);
					_daily.save(function(err, data) {
						if (err) {
							console.log(err)
						}
						//res.redirect('/detail/' + data.bid)
						
						console.log('标签保存成功2！');
					})
				  })
				}
			  });
			});
		  
		}else {
		  
		  var _dailyCategory = new dailyCategory({
			  name: categoryName,
			  upperCase: categoryName,
			  dailys: [daily._id]
			});
			
		  _dailyCategory.save(function(err, data){
			if(err){
			  console.log(err)
			}
			console.log('Tips: 分类已新增');

			_daily.category.push(data._id);
			_daily.save(function(err, data) {
				if (err) {
					console.log(err)
				}
				//res.redirect('/detail/' + data.bid)
				
				console.log('保存成功！');
			})
			
			
			
			var tempArr = [];
			var tagsArr = tagsName.split(',');
			console.log('tagsArr' + tagsArr);
			
			tagsArr.forEach(function(val,index,arr){
			  var _dailyTags = new dailyTags({
				name: val,
				upperCase: val,
			  });
			  
			  console.log(val);
			  
			  dailyTags.findOne({'name': val}, function(err, data){
				if(err){
				  console.log(err)
				}
				
				if(data){
				  var _tagId = data._id;
				  console.log('Tips: 标签已存在');
				  tempArr.push(data._id);
				  
					_daily.tags.push(data._id);
					_daily.save(function(err, data) {
						if (err) {
							console.log(err)
						}
						//res.redirect('/detail/' + data.bid)
						
						console.log('标签保存成功！');
					})
				}else {
				  _dailyTags.save(function(err, data){
					console.log('Tips: 标签已新增');
					tempArr.push(data._id);
					
					_daily.tags.push(data._id);
					_daily.save(function(err, data) {
						if (err) {
							console.log(err)
						}
						//res.redirect('/detail/' + data.bid)
						
						console.log('标签保存成功2！');
					})
				  })
				}
			  });
			});
			
			//_daily.update({'_id': dailyItem._id}, {$set:{'category': data._id}})
		  })
		}
	  })
   
  })
  
/*  
  dailyCategory.findOne({'name': categoryName}, function(err, data){
    if(data){
      var _categoryId = data._id;
      console.log('Tips: 分类已存在');
      
    }else {
      
      var _dailyCategory = new dailyCategory({
          name: categoryName,
          upperCase: categoryName,
          //dailys: [dailyItem._id]
        });
        
      _dailyCategory.save(function(err, data){
        if(err){
          console.log(err)
        }
        console.log('Tips: 分类已新增');
        
        _daily.category = _categoryId;
        
        var tempArr = [];
        var tagsArr = tagsName.split(',');
        console.log('tagsArr' + tagsArr);
        
        tagsArr.forEach(function(val,index,arr){
          var _dailyTags = new dailyTags({
            name: val,
            upperCase: val,
          });
          console.log(val);
          dailyTags.findOne({'name': val}, function(err, data){
            if(err){
              console.log(err)
            }
            
            if(data){
              var _tagId = data._id;
              console.log('Tips: 标签已存在');
              tempArr.push(data._id);
            }else {
              _dailyTags.save(function(err, data){
                console.log('Tips: 标签已新增');
                tempArr.push(data._id);
              })
            }
          });
        });
        
        
        _daily.save(function(err, data){
          if (err) {
            console.log(err)
          }
          
          var dailyItem = data;
          console.log(data);
        })
        
        //_daily.update({'_id': dailyItem._id}, {$set:{'category': data._id}})
      })
    }
  })
*/
  
  
}

exports.dailyGet = function(req, res){
  res.send({msg:'111'});
  console.log(111);
}


