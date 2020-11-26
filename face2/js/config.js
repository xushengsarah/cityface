var serviceUrl = 'http://190.13.37.2:8077/facePlatform'; //后台服务地址
var wobsocketUrl = 'ws://190.13.37.2:8077/facePlatform/websocket'; //后台websocket服务地址
var serviceUrlOther = 'http://68.62.1.3:11010/faceService';  //公安网专用（静态抠图,1比1,1比n等接口专用） 
var mapUrl = 'http://190.168.17.2:6082/';  //地图地址
var sourceType = 0;// 判断是哪个网   ga--公安网

var queryLocation = window.location.search.substring(1),
    varsLocation = queryLocation.split('&');
varsLocation.forEach(element => {
    if (element.split('=')[0] == 'sourceForm' && element.split('=')[1] == 'ga') {  //公安网
        sourceType = 'ga';
    }

    if (element.split('=')[0] == 'url') {  //公安网
        serviceUrl = 'http://' + element.split('=')[1] + '/facePlatform';
        wobsocketUrl = 'ws://' + element.split('=')[1] + '/facePlatform/websocket'; //后台websocket服务地址 
    }

    if (element.split('=')[0] == 'mapAddr') {  //公安网
        mapUrl = 'http://' + element.split('=')[1] + '/';
    }
})

//var serviceUrl = 'http://190.15.240.80:8080/facePlatform'; //后台服务地址
//后台服务地址 190.15.116.189:8056（系统管理地址 登录账号：wuyao2）
//后台websocket服务地址 190.15.116.189:8056（系统管理地址 登录账号：wuyao2）

//后台服务地址 190.13.37.2:8077（布控bug调试地址 登录账号：wuyao）
//后台websocket服务地址 190.15.116.189:8077（布控bug调试地址 登录账号：wuyao）

//后台服务地址 190.15.240.13:8056  190.15.116.189:8056（浩南哥ip地址）

//后台服务地址 190.15.240.152:8080  （胡军ip地址）

//后台服务地址 190.15.240.47:8081   190.15.116.189:8060 （婷玮ip地址）

//后台服务地址 190.15.240.9:8080 （坚哥ip地址）

//后台服务地址 190.15.240.11:8080 （吴瑶哥ip地址）

var temporaryMaxNum = 20; //暂存架人数最大限制
var mapVideoHistoryMaxTime = 1; //历史视频最大时间范围限制小时为单位
var cacheSortArr = [0, 1, 2, 3, 4];  //静态和动态缓存对应数组，0-9是缓存序号，数组大小是缓存图片的数量