
/*

필요한 기능 (API만 사용)
#1. 현재 자기위치 표시
#2. 사용자 위치 표시
#3. 마우스를 올리면 (또는 터치하면 - 사용자 정보 표시)
*/

var MARKER_ME = 'https://damoa.live2skull.net/public/images/my.png'
var MARKER_SR = 'https://damoa.live2skull.net/public/images/marker.png'


$( document ).ready(function() {
    
    container = document.getElementById('map');
    map = null;
    myMarker = null;
    
    
    
    // 현재 위치 좌표를 이용해서 다음 지도를 그립니다.
    function initDaumMap(location) {
        console.log('initDaumMap', location);
    
        var options = { //지도를 생성할 때 필요한 기본 옵션
        	center: new daum.maps.LatLng(
        	    location.coords.latitude, location.coords.longitude
    	    ),
        	level: 3 //지도의 레벨(확대, 축소 정도)
        };
        map = new daum.maps.Map(container, options); //지도 생성 및 객체 리턴
        
        var imageSrc = MARKER_ME
        imageSize = new daum.maps.Size(30, 30), // 마커이미지의 크기입니다
        imageOption = {offset: new daum.maps.Point(20, 0)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
        var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize, imageOption)
        
        
        myMarker = new daum.maps.Marker({image: markerImage});
    }
    
    
    
    
    // 서버로 내 좌표값을 업데이트합니다. 
    function updateMyPosition(location) {
        console.log('updateMyPosition', location);
        
        // payloads (send my location)
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
        // xhttp.open("POST", "/users/update_geo", true);
        xhttp.open("POST", "/users/update_geo");
        xhttp.setRequestHeader('Content-Type', 'application/json'); 
        xhttp.send(JSON.stringify(data));
    }



    // 서버에서 주변 전우들의 좌표값을 가져옵니다.
    function retriveSurroundPosition() {
        console.log('retriveSurroundPosition');
    
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
               var res = JSON.parse(xhttp.responseText);
               
               if (!res.result) {
                   alert('위치 정보 업데이트 실패')
                   window.close();
               }
               
               else {
                    console.log('surroundPosition update OK');
                    console.log(res.users);
                    markSurroundPosition(res.users);
               }
            }
        };
        // xhttp.open("POST", "/users/update_geo", true);
        xhttp.open("POST", "/users/retrive_geo");
        xhttp.setRequestHeader('Content-Type', 'application/json'); 
        xhttp.send();
    }
    
    
    
    
    // 마커에 유저 정보를 표시합니다. 
    function markerSetWindowEvent(marker, user, setEvent) {
        console.log('markerSetWindowEvent', marker, user);
        
        function buildMarkOverlayContent(user) {
            function _ct(s) { return '<a style="display: block">' + s + '</a>'; }
            function _bct(s) { return '<a style="display: block; font-weight:900 !import; color:#77b09d">' + s + '</a>'; }
            
            var c = '<div style="padding:5px;">';
            c += _bct(user.realname);  // need to unicode escape?
            c += _ct(user.phone); 
            c += _ct(user.updated_at); 
            c += '</div>'
            return c;
        }

        marker.iwc = buildMarkOverlayContent(user);        
        marker.ifw = new daum.maps.InfoWindow({
            content : marker.iwc,
            removable : true
        });

        if (setEvent) {
            // 마커에 마우스오버 이벤트를 등록합니다
            daum.maps.event.addListener(marker, 'mouseover', function() {
                marker.ifw.open(map, marker);
            });
            
            daum.maps.event.addListener(marker, 'click', function() {
                marker.ifw.open(map, marker);
            });
            
            // 마커에 마우스아웃 이벤트를 등록합니다
            daum.maps.event.addListener(marker, 'mouseout', function() {
                // 마커에 마우스아웃 이벤트가 발생하면 인포윈도우를 제거합니다
                marker.ifw.close();
            });
        }
    }
    
    
    
    // 내 좌표를 마커에 찍습니다.
    function markMyPosition(location) {
        console.log('markMyPosition', location);
        
        // 마커가 표시될 위치입니다 
        var markerPosition  = new daum.maps.LatLng(
            location.coords.latitude, location.coords.longitude
        ); 
        
        myMarker.setPosition(markerPosition);
        myMarker.setMap(map);
        
        var user = {
            realname: '양해찬',
            phone: '010-3173-9630'
        };
        
        markerSetWindowEvent(myMarker, user);
        
    }
    
    
    
    // 주변 전우 좌표를 마커에 찍습니다.
    function markSurroundPosition(users) {
        console.log('markSurroundPosition', users.length)
        
        var imageSrc = MARKER_SR;
        imageSize = new daum.maps.Size(40, 40),
        imageOption = {offset: new daum.maps.Point(20, 0)};
        var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize, imageOption)
        
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            
            console.log(user)
            var marker = new daum.maps.Marker({image: markerImage});
            // 마커가 표시될 위치입니다.
            var markerPosition  = new daum.maps.LatLng(
                user.coord_x, user.coord_y
            ); 
            
            marker.setPosition(markerPosition);
            marker.setMap(map);
            markerSetWindowEvent(marker, user, true);
        }   
    }
    
    
    
    // 채팅방으로 이동하기
    $('#goMap').click(function () {
        // history.back();
        window.location.replace('/public/wspage.html');
    })
    
    
    function updateEvent() {
        location.reload();
    }

    
    // 지도 초기화 및 본인 좌표 업데이트, 인접 전우들 위치 가져오기.    
    console.log( "userloc view with daumAPI: init OK." );
    navigator.geolocation.getCurrentPosition(function (location) {
            initDaumMap(location);
            markMyPosition(location);
            updateMyPosition(location);
            retriveSurroundPosition();
        },
        function (err) {
            console.log(err);
            alert("내 위치를 가져올 수 없습니다. 권한 설정을 확인해주세요.");
        }
    
    );


});