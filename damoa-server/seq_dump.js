const model = require('../models/index.js');
const crypto = require('crypto');
const Q = require('q');


// 테스트 계정
let _users = [
    { 'sn' : '18-123456',
      'realname' : '양해찬',
      'password_hash': crypto.createHash('sha512').update('1234').digest('hex'),
      'phone': '010-1111-2222'
    },
    { 'sn' : '17-123456',
      'realname' : '박지호',
      'password_hash': crypto.createHash('sha512').update('1234').digest('hex'),
      'phone': '010-5555-6666'
    }
  ]

// 테스트 부대
let _units = [
  {
    'name': '국방부' ,
    'address': '서울특별시 용산',
    'mark_url': 'https://damoa.live2skull.net/public/images/bdmark/mnd.png',
    'room_id' : 'mnd'
  },
  {
    'name': '국군지휘통신사령부 본부' ,
    'address': '경기도 과천',
    'mark_url': 'https://damoa.live2skull.net/public/images/bdmark/kdfc.png',
    'room_id' : 'kdfc'
  },
  {
    'name': '제15보병사단 정보통신대대' ,
    'address': '강원도 화천',
    'mark_url': 'https://damoa.live2skull.net/public/images/bdmark/15sa.png',
    'room_id' : '15sa_it'
  },
  {
    'name': '제15보병사단 본부근무대' ,
    'address': '강원도 화천',
    'mark_url': 'https://damoa.live2skull.net/public/images/bdmark/15sa.png',
    'room_id' : '15sa_hq'
  },
  {
    'name': '제15보병사단 신병교육대' ,
    'address': '강원도 화천',
    'mark_url': 'https://damoa.live2skull.net/public/images/bdmark/15sa.png',
    'room_id' : '15sa_training'
  }
]


describe('Test suit', function () {
  this.timeout(5000);

  before('call: before test', function () {
   

  });
  
  beforeEach('call: beforeEach', function() {
    
  });

  after('call: after test', function () {

  });


  it('should be ok', function (done) {
    
      let _p = Q.resolve(0);
      
      _p.then(
        () => {
          return model.sequelize.sync({force: true}); 
      })
      .then(
        () => {
          return model.User.bulkCreate(_users);
      })
      .then(
        () => {
          return model.Unit.bulkCreate(_units);
      })
      .then(
        () => {
          done();
      })
  });
  
});