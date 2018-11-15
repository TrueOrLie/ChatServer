var LocalStrategy = require('passport-local').Strategy;
var User = require('../db/User');

module.exports = function (passport) {
    // index.js에서 넘겨준 passport입니다.
    passport.serializeUser(function (user, done) { // req.session.passport.user에 세션에 저장하는 과정입니다.
        done(null, user.id); // deserializeUser에 값을 넘겨줍니다.
    });

    passport.deserializeUser(function (id, done) { // 세션에 저장되어있는 값을 DB와 비교하는 과정입니다.
        User.findById(id, function (err, user) {
            done(err, user.id); // 이때 req.user에 저장됩니다.
        })
    });

    // 회원가입
    passport.use('local-signup', new LocalStrategy({ // local-signup이라는 전략을짭니다.
        usernameField: 'user_id', // 필드를 정해주는 것 입니다.
        passwordField: 'password',
        passReqToCallback: true // request객체에 user의 데이터를 포함시킬지에 대한 여부를 결정
    }, function (req, user_id, password, done) {
        User.findOne({
            'user_id': user_id
        }, function (err, user) { // 넘겨받은 user_id를 통해 검색합니다.
            if (err) return done(null);
            // flash를 통해서 메세지를 넘겨줍니다.   
            if (user) return done(null, false, req.flash('signupMessage', '중복된 아이디입니다.'));

            //공백 및 특수문자 검사
            var special_pattern = /[`~!@#$%^&*|\\\'\";:\/?]/gi;
            var inspection_naming = req.body.name + user_id + password;
            if (special_pattern.test(inspection_naming) || inspection_naming.search(/\s/) != -1) return done(null, false, req.flash('signupMessage', '공백이 있거나 특수문자가 있습니다.'));
            //회원정보 db저장
            const newUser = new User();
            newUser.user_id = user_id;
            newUser.password = newUser.generateHash(password); // generateHash을 통해 비밀번호를 hash화 합니다.
            newUser.name = req.body.name;
            newUser.connect = false;
            newUser.save(function (err) {
                if (err) throw err;
                return done(null, newUser); // serializeUser에 값을 넘겨줍니다.
            });
        })
    }));

    // 로그인 
    passport.use('local-signin', new LocalStrategy({ // local-signin 라는 전략을짭니다.
        usernameField: 'user_id',
        passwordField: 'password',
        passReqToCallback: true // 인증을 수행하는 인증 함수로 HTTP request를 그대로  전달할지 여부를 결정한다
    }, function (req, user_id, password, done) {
        User.findOne({
            'user_id': user_id
        }, function (err, user) {
            if (err) return done(err);
            if (!user) return done(null, false, req.flash('signinMessage', '아이디가 존재하지 않습니다.'));
            if (user.connect == true) return done(null, false, req.flash('signinMessage', '현재 접속중입니다.'));
            // validPassword을 통해 비교를 해줍니다.    
            if (!user.validPassword(password)) return done(null, false, req.flash('signinMessage', '비밀번호가 틀렸어요'));
            
            return done(null, user);
            // 성공시 데이터를 넘겨줍니다.
        });
    }));
}
