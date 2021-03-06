var moment = require('moment');
var _ = require('underscore');
var fs = require('fs');
var request = require('request');
var mongoose = require('mongoose');
var Pics = require('../models/pics');
var Book = require('../models/book');
var User = require('../models/user');
var Category = require('../models/category');
var Comment = require('../models/comment');

// 书籍所有权判断
exports.ownership = function(req, res, next) {
	var bid = req.params.bid;
	var username = req.session.user;
	var role;

	if (username != undefined) {
		User.find({
			'username': username
		}, function(err, user) {
			var role = 0;
			if (err) {
				console.log(err)
			} else {

				role = user[0].role;
				Book.findOne({
					bid: bid
				}).populate({
					path: 'from',
					select: 'username'
				}).exec(function(err, data) {
					if (role >= 10) {
						next()
					} else {
						if (data.from.length >= 1) {
							if (data.from[0].username == username) {
								next()
							} else {
								res.redirect('/')
							}
						} else {
							res.redirect('/')
						}
					}
				})
			}
		})
	}
};

// 编辑书籍
exports.edit = function(req, res) {
	var bid = req.params.bid;
	console.log(bid);
	Book.findOne({
		bid: bid
	}).populate({
		path: 'category',
		select: 'name'
	}).exec(function(err, data) {
		res.render('edit', {
			title: '修改书籍信息',
			data: data,
			current: 'edit'
		})
		console.log(data)
	})
};

// 最新收录页面
exports.newbooks = function(req, res) {
	Book.count({}, function(err, total) {
		var rp = req.query.p || 1;
		var p = Math.ceil(total / 10);
		var skipCount = (rp - 1) * 10;
		var pageOpts = {};
		var sinx = (req.url).indexOf('?');
		var url = (req.url).substring(0, sinx);
		if (p >= 1) {
			pageOpts = {
				url: url + '?p=',
				showPage: true,
				current: rp,
				totalPage: (p <= 5 ? p : 5)
			}
		}

		Book.find({}).sort({
			'create_time': -1
		}).skip(skipCount).limit(10).populate({
			path: 'category',
			select: 'name'
		}).exec(function(err, data) {
			res.render('newbooks', {
				title: '最新收录 | 天天书屋',
				current: 'newbooks',
				json: data,
				pageOpts: pageOpts
			});
		})
	})
};

// 获得感谢
exports.tothx = function(req, res) {
	var from = req.body.from;
	var bid = req.body.bid;
	var _user = req.session.user;

	User.findOne({
		'username': from
	}, function(err, data) {
		var uid = data._id;
		Book.update({
			'_id': bid
		}, {
			$push: {
				thanks: {
					'user': uid,
					'username': data.username,
					'thanks.at': Date.now
				}
			}
		}, {
			upsert: true
		}, function(err, data) {
			res.send({
				'status': 'success',
				'resTxt': '已感谢 ^_^！'
			})
		})
	})
};

// 赞每日一图
exports.tolaud = function(req, res) {
	var from = req.body.from;
	var pid = req.body.pid;
	var _user = req.session.user;

	User.findOne({
		'username': from
	}, function(err, data) {
		var uid = data._id;
		Pics.update({
			'_id': pid
		}, {
			$push: {
				lauds: {
					'user': uid,
					'username': data.username,
					'thanks.at': Date.now
				}
			}
		}, {
			upsert: true
		}, function(err, data) {
			res.send({
				'status': 'success',
				'resTxt': '已赞 ^_^！'
			})
		})
	})
};

// 下载记录
exports.recordDownload = function(req, res) {
	var bid = req.body.bid;

	Book.update({
		'bid': bid
	}, {
		$inc: {
			'dv': 1
		}
	}, function(err, data) {
		console.log(data)
	})
};

// 分类页面
exports.category = function(req, res) {
	var catName = req.params.name;
	Category.find({
		name: catName
	}).populate({
		path: 'books',
		limit: 10
	}).exec(function(err, data) {
		res.render('category', {
			title: '分类 | 天天书屋',
			current: 'category',
			json: data
		})
	})
};

// 搜索页面
exports.search = function(req, res) {
	var wd = req.query.wd;

	Book.find({
		name: {
			$regex: wd,
			$options: 'i'
		}
	}).populate('category', 'name').exec(function(err, data) {
		res.render('s', {
			title: '搜索结果页 | 天天书屋',
			current: 'search',
			json: data,
			wd: wd
		});
		console.log(data)
	})
};

// 详情页
exports.detail = function(req, res) {
	var _bid = req.params.bid;
	var id = req.params.id;
	var _user = req.session.user;

	User.findOne({
		username: req.session.user
	}, function(err, user) {
		Book.findOne({
			bid: _bid
		}, {
			description: 0
		}, function(err, data) {
			var d = new Date();
			var y = d.getFullYear();
			var m = d.getMonth();
			var d = d.getDate();
			var x = new Date(y, m, d);
			var isHased = false;

			if (err) {
				console.log(err)
			}
			console.log('+++' + data);
			if (user) {
				for (var i = 0; i < data.visitors.length; i++) {
					if (user._id.toString() === data.visitors[i].user.toString() && data.visitors[i].at > x) {
						isHased = true;
						break
					}
				}
			}

			if (!isHased && user) {
				Book.update({
					bid: _bid
				}, {
					$inc: {
						pv: 1
					},
					$push: {
						visitors: {
							user: user._id,
							username: user.username,
							gravatar: user.gravatar
						}
					}
				}, function(err, data) {
					if (err) {
						console.log(err)
					}
					console.log(data)
				})
			} else {
				Book.update({
					bid: _bid
				}, {
					$inc: {
						pv: 1
					}
				}, function(err, data) {
					if (!err) {
						console.log('success')
					}
				})
			}
		})
	});

	var temp_bid = +_bid;
	var visitors = [];

	Book.aggregate([{
		$match: {
			'bid': temp_bid
		}
	}, {
		$unwind: '$visitors'
	}, {
		$sort: {
			'visitors.at': -1
		}
	}, {
		$project: {
			_id: 0,
			'visitors.at': 1,
			'visitors.user': 1,
			'visitors.username': 1,
			'visitors.gravatar': 1
		}
	}, {
		$limit: 3
	}], function(err, data) {
		visitors = data
	});

	Book.findOne({
		bid: _bid
	}).populate('category from visitors.user', 'uid username gravatar visitors.username role').exec(function(err, book) {
		var thxed = false;
		console.log(book);
		for (var i = 0; i < book.thanks.length; i++) {
			if (book.thanks[i].username == _user && _user != undefined) {
				console.log('yes');
				thxed = true
			}
		}

		Comment.find({
			book: book._id
		}).populate('from').populate('reply.from reply.to', 'username gravatar').sort({
			'create_time': -1
		}).exec(function(err, comments) {
			Category.findOne({
				_id: book.category[0]._id
			}).populate({
				path: 'books',
				select: 'bid name author category image average',
				options: {
					sort: {
						pv: -1
					},
					limit: 4
				}
			}).exec(function(err, books) {
				book.description = '<p class="elp">' + book.description.replace(/\n/img, '</p><p class="elp">') + '</p>';
				for (var i = 0; i < books.books.length; i++) {
					var b1 = books.books[i]._id.toString();
					var b2 = book._id.toString();
					if (b1 == b2) {
						books.books.splice(i, 1);
					}
				}

				// 下载地址字符串处理
				var sky_drive = book.sky_drive;
				if (sky_drive != '') {
					if (sky_drive.indexOf('http://pan') > -1 && sky_drive.indexOf('密码') > -1) {
						var passinx = sky_drive.indexOf('密码') - 4;
						var temp = sky_drive.substr(3);
						sky_drive = '<a class="download-link" href="' + temp.substring(0, passinx) + '" bid="' + book.bid + '" target="_blank"> Download </a>' + temp.substr(passinx);
						book.sky_drive = sky_drive;
					}
				}

				Pics.find({}, function(err, pic) {
					var lauded = false;
					for (var i = 0; i < pic[0].lauds.length; i++) {
						if (pic[0].lauds[i].username == req.session.user && req.session.user != undefined) {
							lauded = true
						}
					}

					res.render('detail', {
						title: book.name + ' | 天天书屋',
						current: 'detail',
						json: book,
						category: books.name,
						comments: comments,
						visitors: visitors,
						moment: moment,
						thxed: thxed,
						lauded: lauded,
						pic: pic,
						books: books
					})
				}).sort({
					_id: -1
				}).limit(1);
			})
		})
	})

};

// 新书上传
exports.new = function(req, res) {
	res.render('new', {
		title: '新书上传',
		current: 'new',
		book: false
	})
};

// 书籍保存
exports.save = function(req, res) {
	var bookObj = req.body;
	var id = req.body.id;
	var _book = new Book(bookObj);
	var _user = req.session.user;
	var categoryId = bookObj.category;
	var categoryName = bookObj.categoryName;
	var upperCN = categoryName.toUpperCase();
	console.log(bookObj);
	if (id) {
		Book.findById(id, function(err, book) {
			if (err) {
				console.log(err)
			}
			if (bookObj.image.indexOf('http') > -1) {
				var filename = bookObj.image.substring(bookObj.image.lastIndexOf('/') + 1)
				request(bookObj.image).pipe(fs.createWriteStream('public/frontCover/' + filename)).on('close', function() {
					console.log(filename + 'Done')
				});
				bookObj.image = filename;
				console.log(bookObj.image);
			}
			_book = _.extend(book, bookObj);
			_book.save(function(err, data) {
				if (err) {
					console.log(err)
				}
				console.log(data);
				res.redirect('/detail/' + data.bid)
			})
		})
	} else {
		Book.findOne({
			name: bookObj.name
		}, function(err, data) {
			if (err) {
				console.log(err)
			}

			if (data) {
				console.log('Tips: 书籍已存在');
				res.redirect('/')
			} else {
				User.findOne({
					username: _user
				}, function(err, user) {
					if (bookObj.image.indexOf('http') > -1) {
						var filename = _book.image.substring(_book.image.lastIndexOf('/') + 1)
						request(_book.image).pipe(fs.createWriteStream('public/frontCover/' + filename)).on('close', function() {
							console.log(filename + 'Done')
						});
						_book.image = filename;
						console.log(_book.image);
					}
					_book.from = user._id;
					_book.save(function(err, data) {
						var book = data;
						if (err) {
							console.log(err)
						}
						console.log('DATA:' + data)

						User.update({
							username: _user
						}, {
							$inc: {
								devote_count: 10
							},
							$push: {
								devote_list: book._id
							}
						}, function(err, data) {
							if (err) {
								console.log(err)
							}
							console.log(data)
						})

						Category.findOne({
							'upperCase': upperCN
						}, function(err, data) {
							if (data) {
								var _categoryId = data._id;
								console.log('Tips: 分类已存在');
								Category.update({
									_id: data._id
								}, {
									$push: {
										'books': book._id
									}
								}, function(err, data) {
									if (err) {
										console.log(err)
									}
									_book.category.push(_categoryId);
									_book.save(function(err, data) {
										if (err) {
											console.log(err)
										}
										console.log('Tips: 分类已更新');
										res.redirect('/detail/' + data.bid)
									})
								})
							} else {
								var _category = new Category({
									name: categoryName,
									upperCase: upperCN,
									books: [book._id]
								});

								_category.save(function(err, data) {
									if (err) {
										console.log(err)
									}
									console.log('Tips: 分类已新增');

									_book.category.push(data._id);
									_book.save(function(err, data) {
										if (err) {
											console.log(err)
										}
										res.redirect('/detail/' + data.bid)
									})
								})
							}
						})
					})
				})
			}
		})
	}
};