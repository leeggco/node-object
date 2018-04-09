var mongoose = require('mongoose');
var User = require('../models/user');
var Book = require('../models/book');
var Category = require('../models/category');
var Community = require('../models/community');
var moment = require('moment') ;
var _ = require('underscore');
var fs = require('fs');
var Pics = require('../models/pics');
var path = require('path');
var formidable = require('formidable');
var util = require('util');
var uuid = require('node-uuid');
var qn = require('qn');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var http = require('http');
var fs = require('fs');
var request = require('request');

// 后台管理页面
exports.isAdmin = function(req, res){
  var username = req.session.user;
  var role = 0;
  
  User.find({'username': username}, function(err, user){
    role = user[0].role;
    User.count({}, function(err, ut){
      Book.count({}, function(err, bt){
        Community.count({}, function(err, ct){
          Category.count({}, function(err, cat){
            if (role >= 10){
              res.render('admin', {
                title: '管理 | 天天书屋',
                current: 'admin',
                ut: ut,
                bt: bt,
                ct: ct,
                cat: cat
              })
            }
          })
        })
      })
    })
  })
}

exports.adminCheck = function(req, res, next){
  var username = req.session.user;
  var role = 0;
  User.find({'username': username}, function(err, user){
    role = user[0].role;
    if (role >= 10){
      next();
    }else {
      res.redirect('/');
    }
  })
}


exports.booksConfig = function(req, res){
  Book
    .find({})
    .populate({
      path:'category from',
      select: 'name username'
    })
    .exec(function(err, data){
      console.log(data);
      res.render('books-config', {
        title: '书籍管理 | 天天书屋',
        current: 'books-config',
        books: data
      })
    })
}

// 删除书籍
exports.AjaxBookDel = function(req, res){
  var bid = req.body.bid;
  var uid = req.body.uid;
  var cid = req.body.cid;
  
  User.update({'_id': uid}, {$inc: {devote_count: -10}}, {$pull: {'devote_list': bid}}, function(err, status){
    if(err) {
      console.log(err)
    }
    
    Category.update({'_id': cid}, {$pull: {'books': bid}}, function(err, status){
      Book.remove({'_id': bid}, function(err, data){
        if(err){
          console.log(err);
        }
        res.send({'status': 'success', 'resTxt': '已删除！'});
      })
    });
  })
}

// 删除分类中无效的书籍
exports.AjaxInvalidBookDel = function(req, res){
  var bid = req.body.bid;
  var cid = req.body.cid;
  
  Category.update({'_id': cid}, {$pull: {'books': bid}}, function(err, status){
    if(err) {
      console.log(err)
    }
    res.send({'status': 'success', 'resTxt': '已删除！'});
  })
}

// 删除分类
exports.AjaxCategoryDel = function(req, res){
  var cid = req.body.cid;
  
  Category.remove({'_id': cid},function(err, status){
    if(err) {
      console.log(err)
    }
    res.send({'status': 'success', 'resTxt': '已删除！'});
  })
}

// 分类重命名
exports.AjaxEditCategory = function(req, res){
  var cid = req.body.cid;
  var val = req.body.val;
  var UPval = val.toUpperCase();
  
  Category.update({'_id': cid}, {$set: {'name': val, 'upperCase': UPval}}, function(err, data){
    if(err) {
      console.log(err)
    }
    res.send({'status': 'success', 'resTxt': '已修改！', 'newVal': val});
  })
}

// 分类查询
exports.cateConfig = function(req, res){
  Category
    .find({})
    .populate({
      path: 'books',
      select: 'name '
    })
    .exec(function(err, data){
      if(err){
        console.log(err)
      }
      Category.find({}, function(err, data2){
        res.render('cate-config', {
          title: '分类管理 | 天天书屋',
          current: 'cate-config',
          data: data,
          data2: data2
        })
      })
  })
}

// 帖子查询
exports.tieziConfig = function(req, res){
  Community
    .find({})
    .populate({
      path: 'from',
      select: 'username'
    })
    .exec(function(err, data){
      if(err){
        console.log(err)
      }
      res.render('tiezi-config', {
        title: '帖子管理 | 天天书屋',
        current: 'tiezi-config',
        data: data,
      })
    })
}

// 帖子删除
exports.AjaxTieziDel = function(req, res){
  var uid = req.body.uid;
  var id = req.body.id;
  
  Community.remove({'_id': id}, function(err, status){
    if(err){
      console.log(err);
    }
    
    User.update({'_id': uid}, {$pull: {'topics': id}}, function(){
      if(err){
        console.log(err);
      }
      
      res.send({'status': 'success', 'resTxt': '已删除！'});
    })
  })
}

// 用户查询
exports.userConfig = function(req, res){
  User
    .find({}, function(err, data){
      if(err){
        console.log(err)
      }
      
      res.render('user-config', {
        title: '用户管理 | 天天书屋',
        current: 'user-config',
        moment: moment,
        data: data,
      })
    })
}

// 用户删除
exports.AjaxUserDel = function(req, res){
  var uid = req.body.uid;
  
  User.remove({'_id': uid}, function(err, data){
    if(err){
      console.log(err)
    }
    
    res.send({'status': 'success', 'resTxt': '已删除！'});
  })
  
}

// 登录页面
exports.showSignin = function(req, res){
	res.render('signin',{
		title: '登录 | 天天书屋',
    current: 'signin'
	});
};

// 注册页面
exports.showSignup = function(req, res){
	res.render('signup',{
		title: '注册 | 天天书屋',
    current: 'signup'
	});
};

// 登出页面
exports.Signout = function(req, res){
	delete req.session.user;

	res.redirect('/')
};

//验证邮箱
exports.regnotify = function(req, res){
    var email = req.query.email;
    var username = req.query.username;
    var link = '';

    //加密
    function cipher(algorithm, key, buf ){
        var encrypted = "";
        var cip = crypto.createCipher(algorithm, key);
        encrypted += cip.update(buf, 'binary', 'hex');
        encrypted += cip.final('hex');
        console.log(encrypted);
        link = req.headers.host + '/comfirm?code=' + encrypted;
    }
    cipher('aes-256-cbc', 'lee', username);

    var transporter = nodemailer.createTransport({
        service: '126',
        auth: {
            user: 'li5433243@126.com',
            pass: 'wonderfull123!!!'
        }
    });
    var mailOptions = {
        from: 'li5433243@126.com ',
        to: email,
        subject: '还差一步即可完成注册 —— SMZWS',
        text: 'Hello world ',
        html: '<table cellpadding="0" cellspacing="0" align="center" border="0" width="660"><tbody><tr><td style="margin:0;padding:0;font-size:0;line-height:0;border:0" align="left" bgcolor="#ffffff" height="180" width="20"></td><td style="font-family:Helvetica,sans-serif;font-size:13px;line-height:20px;color:#323232" align="left"><span style="font-size:30px;line-height:38px">请验证您的帐户。</span><br><br>感谢您执行验证帐户这一重要步骤。点击下面的按钮后，您即可通过自己的帐户使用 SMZWS 的全部服务。<br><br><table cellspacing="0" cellpadding="0"><tbody><tr><td align="center" width="150" height="40" bgcolor="#5887f5" style="-webkit-border-radius:5px;-moz-border-radius:5px;border-radius:5px;color:#fff;display:block"><a href="'+ link +'" style="color:#fff;font-size:16px;font-family:Helvetica,sans-serif;font-size:18px;text-decoration:none;line-height:40px;width:100%;display:inline-block" target="_blank">立即验证</a></td></tr></tbody></table><br>如果按钮无效请点击下面链接：<br>'+ link +' <br> ※如果此邮件和您无关，或许是电子邮件的误送导致的问题。<br>如遇到这样的情况请将此邮件删除。</td></tr></tbody></table>'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
            res.render('regnotify',{
                title: '验证邮箱 | 天天书屋',
                current: 'register_oms',
                email: email
            });
        }
    });
};

//完成验证
exports.comfirm = function(req, res){
    var encrypted = req.query.code;
    res.render('comfirm', {
        title: '验证结果 | 天天书屋',
        current: 'comfirm'
    });
    console.log(encrypted);
    decipher('aes-256-cbc', 'lee', encrypted, function(username){
        console.log(username);
        User.update({'username': username}, {$set: {'role': 1}}, function(err, data){
            if(err) console.log(err);
            console.log(data);

            User.find({'username': username}, function(err, info){
                console.log(info);
            })
        });
    });

    //解密
    function decipher(algorithm, key, encrypted,cb){
        var decrypted = "";
        var decipher = crypto.createDecipher(algorithm, key);
        decrypted += decipher.update(encrypted, 'hex', 'binary');
        decrypted += decipher.final('binary');
        cb(decrypted);
    }
}

// 个人资料编辑
exports.uedit = function(req, res){
  var username = req.session.user;
  User.findOne({username: username}, function(err, user){
	Pics.find({}, function(err, pic){
        var lauded = false;
        /*for (var i = 0; i < pic[0].lauds.length; i++){
            if(pic[0].lauds[i].username == req.session.user && req.session.user != undefined){
                lauded = true
            }
        }*/
        res.render('uedit', {
            title: '编辑个人资料 | 天天书屋',
            current: 'uedit',
            lauded: lauded,
            pic: pic,
            json: user
        })
    }).sort({_id: -1}).limit(1)

  })
};

// 修改用户密码
exports.Rspassword = function(req, res){
  var username = req.session.user;
  User.findOne({username: username}, function(err, user){
	Pics.find({}, function(err, pic){
    var lauded = false;
    /*for (var i = 0; i < pic[0].lauds.length; i++){
        if(pic[0].lauds[i].username == req.session.user && req.session.user != undefined){
            lauded = true
        }
    }*/
    res.render('password', {
      title: '编辑个人资料 | 天天书屋',
      current: 'uedit',
      lauded: lauded,
      pic: pic,
      json: user
    })
    

    }).sort({_id: -1}).limit(1)

  })
}

exports.Rpassword = function(req, res){
  var username = req.session.user;
  var newPassword = req.body.password;
  
  var md5sum = crypto.createHash('sha1');
  md5sum.update(newPassword, 'utf8');
  var str = md5sum.digest('hex');
  newPassword = str;
  
  User.update({'username': username}, {$set: {'password': newPassword}}, function(err, data){
    if(err){
      console.log(err)
    }
    
    res.redirect('/');
  })
  
}

// 编辑个人资料
exports.updateUserInfos = function(req, res){
  var editData = req.body;
  var username = req.session.user;
  var intro = editData.intro;
  var sex = editData.sex;
  var location = editData.location;
  var gravatar = editData.gravatar;

  User.update(
    {username: username}, 
    {$set: {'intro': intro, 'sex': sex, 'location': location, 'gravatar': gravatar }}, 
    function(err, data){
      if(err){
        console.log(err)
      }else {
		console.log(username);
        res.redirect('/u/' + encodeURI(username))
      }
    }
  )
};

// 头像上传
exports.fileUpload = function(req, res){

  var form = new formidable.IncomingForm();
      form.uploadDir = 'public/avatars/';       //设置上传目录
      form.keepExtensions = true;               //保留后缀
      form.maxFieldsSize = 2 * 1024 * 1024;     //文件大小

  form.parse(req, function(err, fields, files) {
    var extName = '';  //后缀名

    switch (files.inputfile.type) {
        case 'image/pjpeg':
            extName = 'jpg';
            break;
        case 'image/jpeg':
            extName = 'jpg';
            break;         
        case 'image/png':
            extName = 'png';
            break;
        case 'image/x-png':
            extName = 'png';
            break;         
    }

    if(extName.length == 0){
      res.locals.error = '只支持png和jpg格式图片';
      res.render('/', { title: TITLE });
      return;                   
    }

    var avatarName = uuid.v1() + '.' + extName;
    var newPath = form.uploadDir + avatarName;

    fs.renameSync(files.inputfile.path, newPath);   //重命名
		
		var qnurl = 'http://7xwlro.com1.z0.glb.clouddn.com/';
		var client = qn.create({
			accessKey: 'b8T--dSC-MiUe9St8zKbicb6BU8RxPJsTIBxsj-I',
			secretKey: 'Z_pw1clvrmvginYUwycttV0yX36jEHfVT4F0GpNf',
			bucket: 'ttbooks',
			domain: 'http://ttbooks.u.qiniudn.com'
		});

		// upload a file with custom key
		client.uploadFile(newPath, {key: avatarName}, function (err, result) {
			res.send({'imgurl': qnurl + result['x:filename']});
			console.log('imgurl:' + qnurl + result['x:filename']);
			fs.unlinkSync(newPath);
		});

  });
};

exports.downImg = function(req, res){
  var type = req.body.type;
  console.log(type);
  
  if(type == 'book'){

    var imgUrl = req.body.img;
    var referer = req.headers.referer;
    var finiResult;
    console.log(typeof imgUrl);
    console.log(imgUrl);
     
    var d = new Date();
    var imageName = "./public/images/" + d.getTime() + '.jpg';
    request(imgUrl, function(err, response, body) {
      fs.readFile(imageName, function(err, data) {
        if (err) {
           return console.error(err);
        }
        
        //console.log(data);
        
        var Canvas = require('canvas')
        , Image = Canvas.Image
        , canvas = new Canvas(400, 400)
        , ctx = canvas.getContext('2d');
        
        var img = new Canvas.Image;   //Create a new Image
        img.src = data;
        //ctx.drawImage(img, 0, 0, 400, 400); 
    
        // 图片加白处理
        var iw = img.width;
        var ih = img.height;
        
        if(iw < 483 ){
          iw = 483
        }
        
        if(ih < 320 ){
          ih = 320
        }
        //  书籍专用
        canvas.width = iw;
        canvas.height = ih;
        canvas.getContext("2d").drawImage(img, 0, 0);
        
        
        
        /*
        var iw2 = img.width * 3;
        var ih2 = img.height * 3;
        canvas.width = iw2;
        canvas.height = ih2;
        canvas.getContext("2d").drawImage(img, 0, 0,iw2,ih2 );
        */
      
        
        var imageData = canvas.toDataURL();
        var d = new Date();
        var imageName = d.getTime() + '.jpg';
        imageData = imageData.replace(/^data:image\/\w+;base64,/, "");
        var dataBuffer = new Buffer(imageData, 'base64');
        var client = qn.create({
          accessKey: 'b8T--dSC-MiUe9St8zKbicb6BU8RxPJsTIBxsj-I',
          secretKey: 'Z_pw1clvrmvginYUwycttV0yX36jEHfVT4F0GpNf',
          bucket: 'ttbooks',
          domain: 'http://7xwlro.com1.z0.glb.clouddn.com/'
        });
        
        client.upload(dataBuffer, {
            key: imageName
        }, function(err, result) {
          if (err) {
            res.json({
              state: false,
              imgname: imageName,
              imgurl: "",
              imghash: ""
            });
          } else {
            res.json({
              state: true,
              imgname: result.key,
              imgurl: result.url,
              imghash: result.hash
            });
          }
          console.log(result.url);
          
        });
        
        //res.send({'status': dataBuffer});
        //console.log(dataBuffer);
        //console.log(imageData);
        
      })
    }).pipe(fs.createWriteStream(imageName));

  }

  if(type == 'word'){


    fs.readFile('./public/2222.jpg', function(err, data) {

      function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var words = text.split('');
        var line = '';

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
            if(n == words.length -1){
            console.log('testWidth:' + testWidth);
            console.log('maxWidth:' + maxWidth);
            //var x2 = 175 - 17 * words.length;
            var x2 = (350 - 92 * words.length) /2;
            console.log('X2:' + x2);
            //if(x2 < 0) x2 = 175 - (13 * words.length)/2;
            if(x2 < 0) x2 = 55;
            context.fillText(line, x2, y);
            console.log('line:' + line);
            console.log('n:' + n);
            console.log('W:' + words.length);
            }
          }
          //context.textAlign = 'center';
        }
        
      }

      var Canvas = require('canvas')
      , Image = Canvas.Image
      , canvas = new Canvas(364, 242)
      , ctx = canvas.getContext('2d');
      
      
      var maxWidth = 300;
      var lineHeight = 120;
      var x = (canvas.width - maxWidth) / 2 + 30;
      var y = 140;
      var text = req.body.tit;
      ctx.font="80px 'Microsoft Yahei'";
      ctx.fillStyle = "#000000";
      console.log(111);
      console.log('run')
      
      var img = new Canvas.Image; // Create a new Image
      img.src = data;
      ctx.drawImage(img, 0, 0, 400, 400); 
      wrapText(ctx, text, x, y, maxWidth, lineHeight);
       
        var imageData = canvas.toDataURL();
        var d = new Date();
        var imageName = d.getTime() + '.png';
        imageData = imageData.replace(/^data:image\/\w+;base64,/, "");
        var dataBuffer = new Buffer(imageData, 'base64');
        //var dataBuffer = new Buffer(base64Data, 'base64');
        var client = qn.create({
          accessKey: 'b8T--dSC-MiUe9St8zKbicb6BU8RxPJsTIBxsj-I',
          secretKey: 'Z_pw1clvrmvginYUwycttV0yX36jEHfVT4F0GpNf',
          bucket: 'ttbooks',
          domain: 'http://7xwlro.com1.z0.glb.clouddn.com/'
        });
        
        client.upload(dataBuffer, {
            key: imageName
        }, function(err, result) {
          if (err) {
            res.json({
              state: false,
              imgname: imageName,
              imgurl: "",
              imghash: ""
            });
          } else {
            res.json({
              state: true,
              imgname: result.key,
              imgurl: result.url,
              imghash: result.hash
            });
            
          }
          
          console.log(result);
        });

      console.log(data)
    }); 


  }

}

// 百科概述图上传
exports.bkUpload = function(req, res){

  /*
  var img = new Image();
  img.src = "../bg.jpg";
  //img.setAttribute('crossOrigin', 'anonymous');
  img.onload = function(){
    console.log(1)
    ctx.drawImage(img, 0, 0, 400, 492);  
    //wrapText(ctx, text, x, y, maxWidth, lineHeight);  
    console.log(222)
  };
  */
  
  //wrapText(ctx, text, x, y, maxWidth, lineHeight);
  console.log(333);

  
//fs.readFile('./public/bg.jpg', function(err, data) {
fs.readFile('./public/20160721100628.jpg', function(err, data) {

  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    var words = text.split('');
    var line = '';

    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
        if(n == words.length -1){
        console.log('testWidth:' + testWidth);
        console.log('maxWidth:' + maxWidth);
        //var x2 = 175 - 17 * words.length;
        var x2 = (400 - 92 * words.length) /2;
        console.log('X2:' + x2);
        //if(x2 < 0) x2 = 175 - (13 * words.length)/2;
        if(x2 < 0) x2 = 55;
        context.fillText(line, x2, y);
        console.log('line:' + line);
        console.log('n:' + n);
        console.log('W:' + words.length);
        }
      }
      //context.textAlign = 'center';
    }
    
  }

  var Canvas = require('canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(400, 400)
  , ctx = canvas.getContext('2d');
  
  
  var maxWidth = 350;
  var lineHeight = 120;
  var x = (canvas.width - maxWidth) / 2 + 30;
  var y = 210;
  var text = req.body.title;
  ctx.font="80px 'Microsoft Yahei'";
  ctx.fillStyle = "#000000";
  console.log(111);
  console.log('run')
  
  var img = new Canvas.Image; // Create a new Image
  img.src = data;
  ctx.drawImage(img, 0, 0, 400, 400); 
  wrapText(ctx, text, x, y, maxWidth, lineHeight);
   
    var imageData = canvas.toDataURL();
    var d = new Date();
    var imageName = d.getTime() + '.png';
    imageData = imageData.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(imageData, 'base64');
    //var dataBuffer = new Buffer(base64Data, 'base64');
		var client = qn.create({
			accessKey: 'b8T--dSC-MiUe9St8zKbicb6BU8RxPJsTIBxsj-I',
			secretKey: 'Z_pw1clvrmvginYUwycttV0yX36jEHfVT4F0GpNf',
			bucket: 'ttbooks',
			domain: 'http://ttbooks.u.qiniudn.com'
		});
    
    client.upload(dataBuffer, {
        key: imageName
    }, function(err, result) {
      if (err) {
        res.json({
          state: false,
          imgname: imageName,
          imgurl: "",
          imghash: ""
        });
      } else {
        res.json({
          state: true,
          imgname: result.key,
          imgurl: result.url,
          imghash: result.hash
        });
        
      }
      
      console.log(result);
    });

  console.log(data)
}); 
  
  
  
  
/*
ctx.font = '30px Impact';

ctx.fillText("Awesome!", 50, 100);

var te = ctx.measureText('Awesome!');
ctx.strokeStyle = 'rgba(0,0,0,0.5)';
ctx.beginPath();
ctx.lineTo(50, 102);
ctx.lineTo(50 + te.width, 102);
ctx.stroke(); 
*/
//console.log('<img src="' + canvas.toDataURL() + '" />');
 
 
 
/*  
  var form = new formidable.IncomingForm();
      form.uploadDir = 'public/avatars/';       //设置上传目录
      form.keepExtensions = true;               //保留后缀
      form.maxFieldsSize = 2 * 1024 * 1024;     //文件大小

  form.parse(req, function(err, fields, files) {
    var extName = '';  //后缀名

    switch (files.inputfile.type) {
        case 'image/pjpeg':
            extName = 'jpg';
            break;
        case 'image/jpeg':
            extName = 'jpg';
            break;         
        case 'image/png':
            extName = 'png';
            break;
        case 'image/x-png':
            extName = 'png';
            break;         
    }

    if(extName.length == 0){
      res.locals.error = '只支持png和jpg格式图片';
      res.render('/', { title: TITLE });
      return;                   
    }

    var avatarName = uuid.v1() + '.' + extName;
    var newPath = form.uploadDir + avatarName;

    fs.renameSync(files.inputfile.path, newPath);   //重命名
		
		var qnurl = 'http://7xkl18.com1.z0.glb.clouddn.com/';


		// upload a file with custom key
		client.uploadFile(newPath, {key: avatarName}, function (err, result) {
			res.send({'imgurl': qnurl + result['x:filename']});
			console.log('imgurl:' + qnurl + result['x:filename']);
			fs.unlinkSync(newPath);
		});

  });
  */
};



/*
// 百科概述图上传
exports.bkUpload = function(req, res){
	//接收前台POST过来的base64
	var imgData = req.body.imageData;
  
	//过滤data:URL
	var base64Data = imgData;
	//var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
	//var base64Data = imgData.replace(/^data:image\/(png|jpg);base64,/, "");
  //var base64Data = imgData.replace(/\s/g,"+");
	var dataBuffer = new Buffer(base64Data, 'base64');
 
  console.log(dataBuffer)
	fs.writeFile("out.png", dataBuffer, function(err) {
    console.log('write');
    console.log(err);
		if(err){
		  res.send(err);
		}else{
		  res.send("保存成功！");
      console.log("保存成功！");
		}
    
    fs.readFile('out.png', function (err, data) {
      if (err) {
         return console.error(err);
      }
      console.log("异步读取文件数据: " + data.toString());
   });
	});

};
*/


// 个人中心
exports.userCenter = function(req, res){
  var username = req.params.name;
  var visitname = req.session.user;
  var visitors;

  User.aggregate([
      {$match: {'username': username}},
      {$unwind: '$visitors'},
      {$sort: {'visitors.at': -1}},
      {$project: {_id: 0, 'visitors.at': 1, 'visitors.user': 1}},
      {$limit: 3}
    ], function(err, data){
      visitors = data
  });

  User
    .findOne({username: username})
    .populate({
      path:'devote_list', 
      select: 'bid name image pv dv create_time thanks',
			options: {sort: {"create_time": -1}, limit: 3}
    })
		.populate({
      path:'topics', 
      select: 'cmid title create_time pv reply_count',
			options: {sort: {"create_time": -1}, limit: 3}
    })
    .exec(function(err, data){
      if(err){
        console.log(err)
      }
      
        Pics.find({}, function(err, pic){
            var lauded = false;
            /*for (var i = 0; i < pic[0].lauds.length; i++){
                if(pic[0].lauds[i].username == req.session.user && req.session.user != undefined){
                    lauded = true
                }
            }*/
            res.render('u',{
                title: username + ' | 天天书屋',
                current: 'userCenter',
                json: data,
                moment: moment,
                lauded: lauded,
                pic: pic,
                visitors: visitors
            });
        }).sort({_id: -1}).limit(1);

      if(username != visitname){
        User.findOne({username: visitname}, function(err, user){
          var d = new Date();
          var y = d.getFullYear();
          var m = d.getMonth();
          var d = d.getDate();
          var x = new Date(y,m,d);
          var isHased = false;

          if(err){
            console.log(err)
          }

          if(user){
            for (var i=0; i< data.visitors.length; i++){
              if(user._id.toString() === data.visitors[i].user.uid.toString() && data.visitors[i].at > x){
                isHased = true;
                break
              }
            }
          }

          if(!isHased && user){
            console.log('update!!!');
            User.update(
              {username: username}, 
              {$push: {
                visitors: {
                    user: {
                      uid: user._id,
                      username: user.username,
                      gravatar: user.gravatar
                    }
                  }
                }
              },
              function(err, data){
                console.log(data)
              }
            )
          }else {
            console.log('hased!')
          }
        })
      }
    })
};

// 贡献排行
exports.dedicate = function(req, res){
  User.find({}, function(err, data){
    console.log(data);
    res.render('dedicate', {
      title: '贡献排行 | 天天书屋',
      json: data,
      current: 'dedicate'
    })
  }).sort({'devote_count': -1}).limit(20)

};

exports.signup = function(req, res){
	var _user = req.body;
  User.findOne({username: _user.username}, function(err, data){
  	if(err){
  		console.log(err)
  	}
  	if(data){
  		res.redirect('/signin')
  	}
  	else{
  		user = new User(_user);
  		user.gravatar = 'http://cn.gravatar.com/avatar/' + User.beMD5(user.email)
  		user.save(function(err, data){
  			if(err){
  				console.log(err)
  			}
  			res.redirect('/regnotify?email=' + data.email + '&username=' + data.username);
  		})
  	}
  })
};

exports.signin = function(req, res){
  var _user = req.body;
  var username = _user.username;
  var password = _user.password;

  User.findOne({username: username}, function(err, data){
  	if(err){
  		console.log(err)
  	}
  	if (!data) {
      return res.redirect('/signup')
    }
  	else{
	    data.comparePassword(password, data.password, function(err, isMatch) {
	      if (err) {
	        console.log(err)
	      }
	      if (isMatch) {
	        req.session.user = data.username;
	        console.log('登录成功！');
	        return res.redirect('/');
	      }
	      else {
	      	console.log('登录失败！');
	        return res.redirect('/signin')
	      }
	    })
  	}
  })
};

exports.singinRequired = function(req, res, next){
	var user = req.session.user;

	if(!user){
		res.redirect('/signin')
	}

	next()
};

exports.adminRequired = function(req, res, next){
	var user = req.session.user ;

	if(user.role < 10){
		res.redirect('/')
	}

	next()
};




















