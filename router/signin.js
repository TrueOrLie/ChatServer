var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/', function (req, res) {

});

// 요청에따른 전략설정입니다.
router.post('/', passport.authenticate('local-signin', {
    successRedirect: '/chat', // 성공시 보내질 요청입니다.
    failureRedirect: '/', // 실패시 보내질 요청입니다.
    failureFlash: true
}));

module.exports = router;
