var userdb = require('../db/User');
const fs = require('fs');

module.exports = function (io) {
    //채팅시 출력 날짜
    var today = new Date().getHours() + " 시 " + new Date().getMinutes() + " 분 " + new Date().getSeconds() + " 초) ";
    //DB 채팅날짜 기록
    var chatday = new Date().getFullYear() + "" + (new Date().getMonth() + 1) + "" + new Date().getDate();
    //채팅기록 DB저장 경로
    var filepath = 'db/chatdata/' + chatday + '.txt';

    io.on('connection', function (socket) {
        var bodyname;

        socket.emit('connection', {
            type: 'deconnection'
        });

        socket.on('connection', function (data) {
            if (data.type == 'connection') {
                //해당일 채팅로그 불러오기
                fs.open(filepath, 'a+', function (err, fd) {
                    if (err) throw err;
                    fs.readFile(fd, 'utf8', function (err, data) {

                        var chatlog = data.toString().split("\n");

                        socket.emit('leadfile', chatlog);
                    });
                });

                userdb.update({
                    'name': data.name
                }, {
                    $set: {
                        'connect': true
                    }
                }, function (err) {
                    if (err) console.log(err);
                    io.emit('system', {
                        msg: '<br>' + data.name + '님께서 접속하셨습니다. \n'
                    });
                    bodyname = data.name;
                    console.log(bodyname + ' 님께서 접속하셨습니다. \n');
                    User_Search();
                });
            }
        });
        socket.on('disconnect', function (data) {
            userdb.update({
                'name': bodyname
            }, {
                $set: {
                    'connect': false
                }
            }, function (err) {
                if (err) console.log(err);
                console.log(bodyname, '님이 채팅방에서 나가셨습니다. ');
            });
            userdb.find({
                'connect': true
            }, function (err, result) {
                var peoples = new Array();
                for (i = 0; i < result.length; i++) {
                    peoples[i] = result[i].name;
                };
                io.emit('people', peoples);
            });
        });

        socket.on('send message', function (name, text) {

            var msg = today + " [" + name + '] 메세지 : ' + text;
            console.log(msg);

            //채팅로그 저장
            var chatdata = '\n' + msg;
            fs.appendFile(filepath, chatdata, function (err) {
                if (err) throw err;
            });
            io.emit('receive message', msg);
        });
    });

    //현재 접속중인 유저 조회 및 출력
    function User_Search() {
        userdb.find({
            'connect': true
        }, function (err, result) {
            var peoples = new Array();
            for (i = 0; i < result.length; i++) {
                peoples[i] = result[i].name;
            };
            io.emit('people', peoples);
        });
    };


};
