/**
 * Created by york on 2015/11/28.
 */

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: '126',
    auth: {
        user: 'li5433243@126.com',
        pass: 'wonderfull123@@@'
    }
});

var mailOptions = {
    from: 'li5433243@126.com ',
    to: '2248610362@qq.com',
    subject: 'fuck world',
    text: 'Hello world ',
    html: '<b>粥，这是一封测试邮件，收到请勿回复！</b>'
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});