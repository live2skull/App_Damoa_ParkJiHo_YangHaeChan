var express = require('express');
var router = express.Router();
let Q = require('q');
let moment = require('moment');
let models = require('../models/index.js');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/*
사용자가 현재 로그인되어있는지 체크한다.
로그인 되어 있는경우: result: true 반환
로그인 되지 않은경우: return: false 반환
*/
router.post('/check', function (req, res, next) {
    res.json({'result' : req.session.sn === undefined? false: true})
})



/*
사용자의 로그인을 해제한다. (세션 삭제)
*/
router.post('/logout', function (req, res, next) {
    req.session = null;
    res.json({'result' : true})
});




/*
사용자의 위치 정보를 업데이트한다.
방 정보는 join시에 넣어주므로 여기서 처리하지 않는다.
*/
router.post('/update_geo', function(req, res, next) {
    if (!req.session.sn) res.json({result: false}); // 로그인되어 있지 않음.
    else {
        let _p = Q.resolve(0);
        _p.then(() => {
            return models.User.find({where: { sn : req.session.sn } });
            
        }).then((user) => {
            if (!user) res.json({result: false});
            else {
                return user.update({
                    coord_x: req.body.coord_x,
                    coord_y: req.body.coord_y
                })
            }
            
        }).then(() => {
            res.json({result: true})  
        }).catch((err) => { next(err); }).done();
    
    }
})



/*
타 사용자들 중 같은 방에 위치한 사용자의 정보를 표시한다.
표시할 사용자들의 정보는 다음과 같다.
1. 같은 방에 접속된 사용자 (쿠키세션을 공유할 수 없으므로)
2. 현재 좌표 값을 가지고 있는 사용자
3. 업데이트 된 지 2분이 지나지 않는 사용자 (* 우선확인)
*/
router.post('/retrive_geo', function (req, res, next) {
   if (!req.session.sn) res.json({result: false}); // 로그인되어 있지 않음.
   else if (!req.session.room_id) res.json({result: false}); // 로그인되어 있지 않음.
   else {
       let sn = req.session.sn;
       let room_id = req.session.room_id;
       
       models.User.findAll({
           where: {
              // 1. room_id same as user!
              room_id : room_id,
              // 2. updated_at
              updated_at: { [Op.gte]: moment().subtract(120, 'second').toDate() }, // UTC?
              sn: { [Op.not]: sn }
           }
       }).then(
           // 바로 출력 or updatedAt 변경 후 출력합니다. (화면에 바로 표시 -> 양식 변경)
           (users) => {
               for (var i = 0; i < users.length; i++) {
                   var user = users[i];
                   user.dataValues.updated_at = moment(user.dataValues.updated_at)
                                                .format("HH시 mm분 기준")
               }
               res.json({result: true, users: users});
           }
       ).catch((err) => { next(err); }).done();
   }
    
});




/*
회원가입 요청을 처리한다.
군번이 중복되거나 가입에 실패하면 result: false를,
회원가입이 성공적으로 이루어지면 result: true를 반환한다.
*/
router.post('/join', function (req, res, next) {
   req.body.password_hash = req.body.password; // 클라이언트에서 sha512 해시된 값을 받는다.
   delete req.body.password; // 'password' 필드는 존재하지 않으므로 삭제. (password_hash) 이용.
   
   models.User.create(req.body).then(
        (user) => {
            if (!user) res.json({result: false})
            else {
                req.session.sn = user.sn;
                req.session.realname = user.realname;
                req.session.phone = user.phone;
                res.json(user)
            }
        },
        (err) => {
            next(err);
        }
    )
});




/*
로그인 요청을 처리한다.
사용자 정보가 일치하면 세션을 설정하고 result: true를,
그렇지 않으면 result: false를 반환한다.
*/
router.post('/login', function (req, res, next) {
   
   models.User.find({where: {
       'sn': req.body.sn,
       'password_hash': req.body.password_hash = req.body.password
   }}).then(
        (user) => {
            // 인증 기능 구현 필요
            if (!user) res.json({result: false})
            else {
                delete user.dataValues.password_hash
                req.session.sn = user.sn;
                req.session.realname = user.realname;
                req.session.phone = user.phone;
                res.json(user)
            }
        },
        (err) => {
            next(err);
        }
    )
    
});


module.exports = router;
