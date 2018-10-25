var express = require('express');
var router = express.Router();
let models = require('../models/index.js');
var unicodeToJsEscape = require('unicode-escape');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
let Q = require('q');


/*
최초 서버 시작 시 데이터베이스에 등록되어 있는 부대 정보를 가져와 캐싱해둔다.
이는 애플리케이션에서 채팅방에 접속할때 해당 부대 정보가 계속 필요하게 되므로,
불필요한 데이터베이스 쿼리로 인한 성능 저하를 방지한다.
 
부대 채팅방 고유코드에서 접미사(endfix)가
_arr이면 부대로 복귀하는 방,
_dep이면 부대에서 출발하는 방으로 나누어 구현하였다.
*/
let rooms = [];
models.Unit.findAll({order: [
        ['name', 'ASC'] // 오름차순
    ]}).then(
    (units) => { rooms = units; }
)


/*
등록되어 있는 전체 부대 채팅방을 반환한다.
*/
router.get('/', function(req, res, next) {
   res.json(rooms);
});



/*
등록되어 있는 부대 채팅방을 검색한다.
검색은 부대 통상명칭과 등록된 대략적인 부대주소(예: 강원도 화천, 서울특별시 용산)에서 일치하는 
데이터를 찾아 반환한다.
*/
router.post('/search', function(req, res, next) {
  models.Unit.findAll({
    where: {
        [Op.or] : [ {name: { like: '%' + req.body.keyword + '%'}}, {address: { like: '%' + req.body.keyword + '%'}} ]
    },
    limit: 20,
    order: [['name', 'ASC']]
  }).then(
    (units) => { res.json(units) },
    (err) => { next(err); }
  )
});



/*
접속할 부대의 채팅방 고유번호를 세션에 설정한다.
이렇게 함으로써 애플리케이션에서 채팅방 웹 브라우저를 세션을 전달하여 실행하였을때
웹소켓으로 요청을 받은 서버는 세션에 설정된 채팅방으로 클라이언트를 연결한다.
성공하면 result: true를 반환한다.
*/
router.post('/join', function(req, res, next) {
    if (!req.session.sn) res.json({result: false}); // 로그인되어 있지 않음.
    else {
        req.session.room_id = req.body.room_id;
        
        let _p = Q.resolve(0);
        _p.then(() => { // 해당하는 유저를 찾아서
            return models.User.find({where: { sn: req.session.sn } })
        }).then((user) => { // 데이터베이스도 업데이트 해 줍니다.
            if (!user) res.json({result: false})
            else {
                res.json({result: true})
                return user.update({room_id : req.body.room_id})     
            }
        }).catch((err) => { next(err); })
    }
});



/*
클라이언트가 현재 접속중인 방 이름을 반환한다.
실패할 경우, return: false를 반환한다.
*/
router.get('/current', function(req, res, next) {
    if (!req.session.sn) res.send("error");
    else if (req.session.room_id === undefined) res.send("error")
    else {
        for (let i = 0; i < rooms.length; i++) {
           let room = rooms[i];
           let _id = req.session.room_id;
           _id = _id.replace('_arr', '');
           _id = _id.replace('_dep', '');
           
           if (room.room_id === _id) {
               
               // 부대 채팅방 고유코드에서 접미사(endfix)가
               // _arr이면 부대로 복귀하는 방,
               // _dep이면 부대에서 출발하는 방으로 나누어 구현하였다.
               res.send((req.session.room_id.indexOf('_arr') != -1) ? '(도착) ' + room.name : '(출발) ' + room.name);
               return;
           }
        }
        res.json({result: false})
    }
});




/*
서버의 웹소켓을 이용한 socket.io모듈이 클라이언트로부터
웹소켓 연결을 받아 요청을 처리하는 핸들러 구현
*/
router.roomsChatHandlerON = (socket) => {
  
    console.log("ws: user connected")
    let sn = socket.request.session.sn;
    let room_id = socket.request.session.room_id;

    // 로그인 및 채팅방 설정 여부 확인
    console.log(sn + ' ' + room_id)
    if (sn === undefined)  { // 로그인이 되어있지 않음.
        socket.disconnect();   
    }
    else if (room_id === undefined) { // 접근 방이 설정되어 있지 않음.
        console.log("방을 생성하지 않았습니다.");
        socket.disconnect();
    }
    else { // 접속 시작.
        console.log("ws: join at " + room_id);
        socket.join(room_id); // 해당 방으로 접속.
        socket.emit('sn', {sn: sn}); // 현재 사용자 정보 (군번) 클라이언트에게 알려줌
        
        // 이전에 채팅한 기록 불러와서 전송
        let _previous = []; 
        models.Chat.findAll({where: { room_id: room_id }, limit: 10, order: [['id', 'DESC']]
        }).then( // 이전 채팅 데이터를 순서대로 10개 불러옴
            (chats) => {
                chats.reduce((prev, curr) => {
                    return prev.then(
                    () => { return models.User.find({ where: { sn: curr.sn } })})
                    .then(
                    (user) => {
                        // DB에 utf-8로 저장되있는 한글 데이터 -> unicode escape 처리
                        // javascript (webclient) 에서 utf8처리 오류: 웹소켓 연결 끊어짐.
                        let ms = {
                            sn: user.sn, 
                            realname: unicodeToJsEscape(user.realname),
                            message: unicodeToJsEscape(curr.message)
                        }
                        _previous.push(ms);
                    })
                }, Q.resolve(0))
                
                
                .then(
                    () => { 
                        // 최초 접속 시 이전 채팅 데이터를 뿌려준다.
                        socket.emit('previous', _previous)
                        console.log("send privious message ok!")
                    }
                )
                .catch(
                    (err) => { throw new Error("send previous messages error")}
                )
            }
        )
    }
    
    
    /*
    클라이언트로부터 채팅 메세지를 받음
    1. 해당 메세지를 데이터베이스에 저장
    2. 같은 채팅방에 접속한 다른 클라이언트에게 전송
    */
    socket.on('message', function(data) {
        let room_id = socket.request.session.room_id;
        let sn = socket.request.session.sn;
        let realname = socket.request.session.realname;
        
        // 채팅 로그 저장 
        models.Chat.create({
            sn: sn, 
            message: data.message,
            room_id: room_id
        }).then((chat) => {console.log('chat saved.') + chat.message})
        
        // 보낸이를 제외한 나머지 전부에게 메세지 전송
        socket.broadcast.to(room_id).emit('message', {
            sn: sn,
            realname: realname,
            message: data.message
        });
    })
    
    
    /*
    클라이언트로부터의 연결이 해제됨
    - 세션이 접속할 방만 지웁니다. DB안의 저장용 데이터는 건드리지 않습니다.
    */
    socket.on('disconnect', function(){ 
        socket.request.session.room_id = undefined;
    });
    
};


module.exports = router;
