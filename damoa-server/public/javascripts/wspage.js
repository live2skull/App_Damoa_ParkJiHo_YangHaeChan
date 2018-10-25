// 채팅 UI (메시지 화면 표시) 및 서버 통신 API 구성
(function () {
    
    // UI에 표시될 메세지의 class를 구성합니다.
    var Message;
    Message = function (arg) {
        this.text = arg.text, this.message_side = arg.message_side;
        this.realname = arg.realname;
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $message.find('.username').html(_this.realname);
                $('.messages').append($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };
    
    
    
    $(function () {
        var getMessageText, message_side, sendMessage;
        
        // 채팅창에 입력한 메시지를 가져옵니다.
        message_side = 'right';
        getMessageText = function () {
            var $message_input;
            $message_input = $('.message_input');
            return $message_input.val();
        };
        
        
        
        // 메세지를 UI에 표시하고, 서버로 전송합니다.
        sendMessage = function (text, side, realname) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
            
            message = new Message({
                text: text,
                message_side: side,
                realname: realname
            });
            message.draw();
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        };
        
        
        // 메세지 전송 버튼 클릭
        $('.send_message').click(function (e) {
            so.emit('message', {message: getMessageText()}) // 서버로 메시지 전송
            return sendMessage(getMessageText(), 'right', '나'); // UI에 메세지 표시
        });
        
        
        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                so.emit('message', {message: getMessageText()}) // 서버로 메세지 전송
                return sendMessage(getMessageText(), 'right', '나'); // UI에 메세지 표시
            }
        });
        
        // 최초 페이지를 열면 서버로부터 접속된 방의 
        // 이름을 가져와 화면에 표시하게 됩니다.
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
               var res = xhttp.responseText;
               console.log(res);
               
               if (res === 'error') {
                   alert("채팅방 접속에 문제가 발생했습니다.")
                   window.close();
               }
               else $('.title').html(res);
            }
        };
        
        xhttp.open("GET", "/rooms/current", true);
        xhttp.send();
        
        var so = io('/chats'); // socket.io websocket 인스턴스
        var myid = ""; // 본인 군번
        
        
        /*
        중요!!!
        서버에서 이전 채팅 기록을 가져올 경우.
        mysql -> node -> client (web/app) 인데, 이떄 utf8로 DB에 저장되어있다.
        
        utf8로 websocket을 이용해 전송하면 javascript에서 인식할 수 없으므로,
        서버쪽에서 unicode 인코딩 후 클라이언트에서 escape 해주어야 한다.
        */
        function us2str(u) {
            var r = /\\u([\d\w]{4})/gi;
            u = u.replace(r, function (match, grp) {
                    return String.fromCharCode(parseInt(grp, 16)); } );
            u = unescape(u);
            return u;
        }
        
        
        // 채팅서버 최초 접속 후 이전 채팅 기록들 (최대10개)를 수신받음.
        so.on('previous', function (data) {
            console.log(data);
            for (var i = data.length -1 ; i >= 0; i--) {
                var d = data[i];
                d.message = us2str(d.message);
                d.realname = us2str(d.realname);
                
                sendMessage(d.message, d.sn == myid ? 'right' : 'left',
                            d.sn == myid ? '나' : d.realname)
            }
        });
        
        
        // 채팅 중 상대방의 메세지를 받음.
        so.on('message', function(data){
              return sendMessage(data.message, 'left', data.realname);
              console.log(data)
        });
        
        
        // 채팅서버 최초 접속 후 본인의 군번을 수신받음.
        so.on('sn', function(data) {
            console.log(data.sn)
            myid = data.sn;
        })
        
        
        // 지도뷰 클릭 콜백
        $('#goMap').click(function() {
            window.location.replace('/public/locpage.html');
            // window.location.href = '/public/locpage.html';
        })
        
        
        
        // 서버에 위치 정보를 업데이트합니다.
        function updateMyPosition(location) {
            console.log('updateMyPosition', location);
            
            var data = {
                coord_x: location.coords.latitude,
                coord_y: location.coords.longitude
            };
            
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                   var res = JSON.parse(xhttp.responseText).result;
                   
                   if (!res) {
                       alert('위치 정보 업데이트 실패')
                       window.close();
                   }
                   
                   else {
                        console.log('geolocation update OK')      
                   }
                }
            };
            // 인증 - 쿠키
            xhttp.open("POST", "/users/update_geo");
            xhttp.setRequestHeader('Content-Type', 'application/json'); 
            xhttp.send(JSON.stringify(data));
        }

        
        
        // 5초마다 한번씩 실행
        function loopEvent() {
            navigator.geolocation.getCurrentPosition(function (location) {
                    updateMyPosition(location);
                },
                function (err) {
                    console.log(err);
                    alert("내 위치를 가져올 수 없습니다. 권한 설정을 확인해주세요.");
                }
            
            );
        }
        
       
        // 5초마다 한번씩 서버에 위치 정보를 업데이트해 줍니다.
        loopEvent()
        setInterval(loopEvent, 5000)
       
    });
}.call(this));