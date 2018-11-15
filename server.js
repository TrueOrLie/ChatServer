var express = require('express');
var app = express();
var path = require('path');
var router = require('./router/index.js');
var passport = require('passport');
var mongoose = require('mongoose');
var session = require('express-session');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var server = require('http').Server(app);
var listen = require('socket.io');
var io = listen(server);
require('./libs/socketConnection')(io);
require('./libs/passport')(passport);

//데이터 베이스 연결
mongoose.connect('mongodb://localhost:27017/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Conneted mongoDB');
});

//서버 응답확인 및 http 설정
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

// view 테이블 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,'public')));
// 세션 활성화
app.use(session({
  secret: '비밀코드',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

// passport 초기화 =
app.use(passport.initialize());
app.use(passport.session());

// router 분리
app.use('/', router);

//서버 포트 연결
server.listen(80, function () {
    console.log('server running port 80')
});
