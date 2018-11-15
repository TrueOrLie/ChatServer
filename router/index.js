var express = require('express');
var router = express.Router();
var passport = require('passport'); // passport를 가져와야되요
var user = require('../db/User.js');

router.get('/', function (req, res) {
    if (req.isAuthenticated())
        return res.redirect('/chat');
    res.render('index', {
        login: req.user,
        message: req.flash('signinMessage')
    });
});

var signin = require('./signin');
router.use('/signin', signin);

var signup = require('./signup');
router.use('/signup', signup);

router.get('/chat', function (req, res) {
    user.findOne({
        '_id': req.session.passport.user
    }, function (err, result) {
        res.render('chat', {
            name: result.user_id
        });
    });
});

// 로그아웃
router.get('/logout', function (req, res) {
    res.clearCookie("connect.sid"); // connect.sid는 클라이언트의 세션
    req.session = null;
    req.logout();
    res.redirect('/');


});

module.exports = router;
