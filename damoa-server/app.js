var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');
var expressSession = require("express-session");

var app = express();
app.io = require('socket.io')(); // 채팅 기능 구현을 위한 socket.io 사용

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(cookieParser());

// express에 쿠키 이용한 세션 미들웨어 설정과 socket.io와의 세션 연동
let session = expressSession({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
})
app.io.use((socket, next) => {
  session(socket.request, socket.request.res, next);  
})
app.use(session)



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'bower_components')));


module.exports = app;

// 각 URL별로 라우터 설정
var usersRouter = require('./routes/users');
var roomsRouter = require('./routes/rooms.js');

app.use('/users', usersRouter);
app.use('/rooms', roomsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // console.log(err)

  if (err.status == 404) {
    res.status(404);
    console.log(err.message)
    res.send(err.status)
    // res.render('error')
  }
  else {
    res.status(200);
    console.log(err)
    res.send({result: false});
  }
});

// socket.io 채킹기능 핸들러 설정
let chatNamespace = app.io.of('/chats')
chatNamespace.on('connection', roomsRouter.roomsChatHandlerON);


