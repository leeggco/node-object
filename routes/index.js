var express = require('express');
var router = express.Router();
var Index = require('../controllers/index');
var BK = require('../controllers/bk');
var BKx = require('../controllers/bkx');
var Book = require('../controllers/book');
var User = require('../controllers/user');
var Comment = require('../controllers/comment');
var Community = require('../controllers/community');
var superDaily = require('../controllers/daily');

// Test
router.get('/test', Index.test);

// Index
router.get('', Index.index);

// Community
router.get('/community', Community.index);
router.get('/cmsearch', Community.search);
router.get('/community/:cmid', Community.issuePage);

router.post('/newIssue', User.singinRequired, Community.newIssue);
router.post('/issueDel', User.singinRequired, Community.issueDel);

// Book
router.get('/book/new', User.singinRequired, Book.new);
router.get('/book/edit/:bid', User.singinRequired, Book.ownership, Book.edit);
router.get('/detail/:bid', Book.detail);
router.get('/newbooks', Book.newbooks);
router.get('/category/:name', Book.category);
router.get('/s', Book.search);

router.post('/tothx', User.singinRequired, Book.tothx);
router.post('/record_download', Book.recordDownload);
router.post('/book/save', User.singinRequired, User.adminRequired, Book.save);

// User
router.get('/signin', User.showSignin);
router.get('/signup', User.showSignup);
router.get('/signout', User.Signout);
router.get('/regnotify', User.regnotify);
router.get('/comfirm', User.comfirm);
router.get('/dedicate', User.dedicate);
router.get('/u/:name', User.singinRequired, User.userCenter);
router.get('/people/uedit', User.singinRequired, User.uedit);
router.get('/setting/password', User.singinRequired, User.Rspassword);

router.post('/user/signup', User.signup);
router.post('/user/signin', User.signin);
router.post('/people/updateUserInfos', User.singinRequired, User.updateUserInfos);
router.post('/fileUpload', User.singinRequired, User.fileUpload);
router.post('/setting/Rpassword', User.singinRequired, User.Rpassword);

// Admin
router.get('/admin', User.singinRequired, User.isAdmin);
router.get('/books-config', User.singinRequired, User.adminCheck, User.booksConfig);
router.get('/tiezi-config', User.singinRequired, User.adminCheck, User.tieziConfig);
router.get('/user-config', User.singinRequired, User.adminCheck, User.userConfig);
router.get('/cate-config', User.singinRequired, User.adminCheck, User.cateConfig);

router.post('/admin/AjaxBookDel', User.singinRequired, User.adminCheck, User.AjaxBookDel);
router.post('/admin/AjaxInvalidBookDel', User.singinRequired, User.adminCheck, User.AjaxInvalidBookDel);
router.post('/admin/AjaxCategoryDel', User.singinRequired, User.adminCheck, User.AjaxCategoryDel);
router.post('/admin/AjaxEditCategory', User.singinRequired, User.adminCheck, User.AjaxEditCategory);
router.post('/admin/AjaxTieziDel', User.singinRequired, User.adminCheck, User.AjaxTieziDel);
router.post('/admin/AjaxUserDel', User.singinRequired, User.adminCheck, User.AjaxUserDel);

// Comment
router.get('/issue_operate', User.singinRequired, Comment.isOperate);

router.post('/user/comment', User.singinRequired, Comment.save);
router.post('/set_comment', User.singinRequired, Comment.save);
router.post('/issue_comment', User.singinRequired, Comment.isSave);
router.post('/commentDel', User.singinRequired, Comment.commentDel);

// Others
router.post('/tolaud', User.singinRequired, Book.tolaud);

// Download remote images
router.post('/downimg', User.downImg);
router.post('/bkUpload', User.bkUpload);

// BK 
router.get('/bkpage',　User.singinRequired, User.adminCheck, BK.page);
router.get('/bkpage2', User.singinRequired, BKx.page);
router.post('/bkrecord2', BKx.record);
router.post('/bkrecord', BK.record);

// daily of superButer
router.post('/superButter/dailyAddNew', superDaily.dailyAddNew);
router.get('/superButter/dailyGet', superDaily.dailyGet);

module.exports = router;


