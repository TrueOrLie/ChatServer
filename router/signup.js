var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/', function (req, res) {
    res.render('signup', {
        message: req.flash('signupMessage')
    });
});

router.post('/', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
}));
module.exports = router;
