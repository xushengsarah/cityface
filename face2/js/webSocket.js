// 实时推送信息
var cameraSData = [], // 市抓拍机数据
    cameraGAJData = [], // 公安局抓拍机数据
    cameraPCSData = [], // 派出所抓拍机数据
    pictureSData = [], // 市抓拍人像数据
    pictureGAJData = [], // 公安局抓拍人像数据
    picturePCSData = [], // 派出所抓拍人像数据
    historyAvePicSData = [], // 市历史平均抓拍人像数据
    historyAvePicGAJData = [], // 公安局历史平均抓拍人像数据
    historyAvePicPCSData = [], // 派出所历史平均抓拍人像数据
    alarmSData = [], // 市告警数据
    alarmGAJData = [], // 公安局告警数据
    alarmPCSData = [], // 派出所告警数据
    socketAlarmList = [],  //最新告警数组
    socketAlarmFilterList = [], // 最新告警过滤数组
    socketAlarmIsClick = true,
    socketAlarmObj = {
        orgId: '',
        libId: ''
    };  //最新告警过滤

// var alarmNumberData = '', // 数据看板实时告警总数
//     pictureNumberData = ''; // 数据看板实时抓拍总数

/**
 * 管理者登陆 地图左侧的数据单位转换
 * @param { $container } $container // 目标容器
 * @param { string } data // 传入数据
 */
function dataUnitChangeOld($container, data) {
    if (data && typeof (data) == 'number') {
        var value = parseFloat(data),
            changeText;
        if (value >= 10000 && value < 10000000) {
            value = Number(value / 10000).toFixed(2);
            changeText = '万';
        } else if (value >= 10000000 && value < 100000000) {
            value = Number(value / 10000000).toFixed(2);
            changeText = '千万';
        } else if (value >= 100000000) {
            value = Number(value / 100000000).toFixed(2);
            changeText = '亿';
        }
    } else {
        var value = 0;
    }

    $container.text(value);
    if (changeText) {
        $container.next().removeClass('hide').text(changeText);
    } else {
        $container.next().addClass('hide');
    }
}

function dataUnitChange($container, data) {
    if (data && typeof (data) == 'number') {
        var value = parseFloat(data).toLocaleString();
    } else {
        var value = 0;
    }
    $container.text(value);
}

function dataSplitShow($num, valLen, number, $today, today) {
    if ($num.find('.dataNums').length == 0) {
        var strHtml = '<ul class="dataNums inrow">';
        for (var i = valLen; i > 0; i--) {
            if (i % 3 == 0 && i != valLen) {
                strHtml += ['<li class="dataSplit">，</li>'].join('');
            }
            strHtml += [
                '<li class="dataOne">',
                '   <div class="dataBoc">',
                '       <div class="tt" t="38"><span class="num0">0</span> <span class="num1">1</span> <span class="num2">2</span></div>',
                '   </div>',
                '</li>'
            ].join('');
        }
        strHtml += '</ul>';
        $num.html(strHtml);
    }
    var numberStr = number.toString();
    if (numberStr.length <= valLen - 1) {
        var tempStr = '';
        for (var a = 0; a < valLen - numberStr.length; a++) {
            tempStr += '0';
        }
        numberStr = tempStr + numberStr;
    }
    var numberArr = numberStr.split('');
    for (var i = 0; i < valLen; i++) {
        $num.find('.num1').eq(i).text(numberArr[i]);
    }

    var $num_item = $num.find('.dataNums').find('.tt');
    var rollHeight = $num.find('.dataBoc')[0].getBoundingClientRect().height;
    var time = 1;

    $num_item.css('transition', 'all 1s ease-in-out');
    $num_item.each(function (i, item) {
        // 判定是否有设置动画时间
        var a = $(item).find('span').eq(0).text();
        if ($(item).find('span').eq(0).text() !== $(item).find('span').eq(1).text()) {
            setTimeout(function () {
                $num_item.eq(i).css('top', -rollHeight + 'px');
            }, 100);
        }
    });
    setTimeout(() => {
        $num_item.css('transition', '');
        for (var i = 0; i < valLen; i++) {
            $num.find('.num0').eq(i).text(numberArr[i]);
        }
        if ($today) {
            $today.text(today);
        }
        setTimeout(() => {
            $num_item.each(function (i, item) {
                //恢复初始位置
                $num_item.eq(i).css('top', '0');
            });
        }, 0);
    }, 1000);
}

/**
 * 管理者登陆 历史抓拍总数
 */
function refreshSnapTotalInfo(result) {
    $rollNum = $('#facePictureTotal').find('.dashboard-roll-num').eq(0);
    if (result) {
        var num = result;
    } else {
        var num = 0;
    }
    var valLen = 12;
    dataSplitShow($rollNum, valLen, num);
}
/**
 * 管理者登陆 今日抓拍总数
 */
function refreshSnapTodayInfo(result) {
    $rollNum = $('#facePictureTotal').find('.dashboard-roll-num').eq(1);
    if (result) {
        var num = result;
    } else {
        var num = 0;
    }
    var valLen = 9;
    dataSplitShow($rollNum, valLen, num);
}

/** 数据看板 数据单位转换
 * @param { string } data     // 数据
 * @param { boolean } add     // 是否添加单位
 * @param { string } fixed    // 小数四舍五入，小数位数
 */
function dataUnitChange1(data, add, fixed) {
    var value = parseFloat(data),
        change = false,
        changeText;
    if ((value >= 1000 && value < 10000) || (value <= -1000 && value > -10000)) {
        value = String(Number(value / 1000)).indexOf(".") > -1 ? Number(value / 1000).toFixed(fixed) : Number(value / 1000).toFixed(0);
        change = true;
        changeText = '千';
    } else if ((value >= 10000 && value < 10000000) || (value <= -10000 && value > -10000000)) {
        value = String(Number(value / 10000)).indexOf(".") > -1 ? Number(value / 10000).toFixed(fixed) : Number(value / 10000).toFixed(0);
        change = true;
        changeText = '万';
    } else if ((value >= 10000000 && value < 100000000) || (value <= -10000000 && value > -100000000)) {
        value = String(Number(value / 10000000)).indexOf(".") > -1 ? Number(value / 10000000).toFixed(fixed) : Number(value / 10000000).toFixed(0);
        change = true;
        changeText = '千万';
    } else if (value >= 100000000 || value <= -100000000) {
        value = String(Number(value / 100000000)).indexOf(".") > -1 ? Number(value / 100000000).toFixed(fixed) : Number(value / 100000000).toFixed(0);
        change = true;
        changeText = '亿';
    } else if ((value > 0 && value < 1) || (value > -1 && value < 0)) {
        value = Number(value).toFixed(fixed);
        change = true;
    }

    if (add && changeText) {
        value += changeText;
    }
    return {
        value: value,
        change: change,
        changeText: changeText
    };
}

/**
 * 管理者登陆 首页加载抓拍人脸数
 */
function getFacePictureData() {
    window.loadData('v2/index/getPicStatistics', true, '', function (data) {
        if (data.code === '200') {
            var result = data.data;
            if (result && result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    var orgCode = result[i].orgCode;
                    if (orgCode.length > 6) {
                        picturePCSData.push(result[i]);
                    } else if (orgCode.length == 6) {
                        pictureGAJData.push(result[i]);
                    } else if (orgCode.length === 4) {
                        pictureSData.push(result[i]);
                        // dataUnitChange($("#facePictureCount .number"), parseInt(pictureSData[0].counts));
                    }
                }
                //console.log(picturePCSData, pictureGAJData, pictureSData);
                // if (pictureGAJData.length === 1) {
                //     refreshSnapTotalInfo(pictureGAJData[0].counts);
                //     refreshSnapTodayInfo(pictureGAJData[0].totalToday);
                //     // dataUnitChange($("#facePictureCount .number"), parseInt(pictureGAJData[0].counts));
                // }

                // 用户是不是市级用户 重新赋值
                if (globalMap !== 'allNum') {
                    if (globalCode.length > 6) {
                        picturePCSData.map(item => {
                            if (item.orgCode == globalCode) {
                                refreshSnapTotalInfo(item.counts);
                                refreshSnapTodayInfo(item.totalToday);
                            }
                        });
                    } else if (globalCode.length == 6) {
                        pictureGAJData.map(item => {
                            if (item.orgCode == globalCode) {
                                refreshSnapTotalInfo(item.counts);
                                refreshSnapTodayInfo(item.totalToday);
                            }
                        });
                    }
                } else { // 市级用户
                    refreshSnapTotalInfo(pictureSData[0].counts);
                    refreshSnapTodayInfo(pictureSData[0].totalToday);
                }
            }
        }
    }, '', 'GET');
}

/**
 * 管理者登陆 首页加载告警数
 */
function getAlarmCountData() {
    window.loadData('v2/index/getAlarmStatistics', true, '', function (data) {
        if (data.code === '200') {
            var result = data.data;
            if (result && result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    var orgCode = result[i].orgCode;
                    if (orgCode.length > 6) {
                        alarmPCSData.push(result[i]);
                    } else if (orgCode.length == 6) {
                        alarmGAJData.push(result[i]);
                    } else if (orgCode.length === 4) {
                        alarmSData.push(result[i]);
                    }
                }
                // if (alarmGAJData.length === 1) {
                //     dataUnitChange($("#alarmCount .number"), parseInt(alarmGAJData[0].counts));
                //     dataUnitChange($("#todayAlarmCount .number"), parseInt(alarmGAJData[0].totalToday));
                // }

                // 用户是不是市级用户 重新赋值
                if (globalMap !== 'allNum') {
                    if (globalCode.length > 6) {
                        alarmPCSData.map(item => {
                            if (item.orgCode == globalCode) {
                                dataUnitChange($("#alarmCount .number"), parseInt(item.counts));
                                dataUnitChange($("#todayAlarmCount .number"), parseInt(item.totalToday));
                            }
                        });
                    } else if (globalCode.length == 6) {
                        alarmGAJData.map(item => {
                            if (item.orgCode == globalCode) {
                                dataUnitChange($("#alarmCount .number"), parseInt(item.counts));
                                dataUnitChange($("#todayAlarmCount .number"), parseInt(item.totalToday));
                            }
                        });
                    }
                } else {
                    dataUnitChange($("#alarmCount .number"), parseInt(alarmSData[0].counts));
                    dataUnitChange($("#todayAlarmCount .number"), parseInt(alarmSData[0].totalToday));
                }
            }
        }
    }, '', 'GET');
}

/**
 * 管理者登陆 首页加载抓拍机数
 */
async function getFaceCameraData() {
    let res = await new Promise(function (resolve, reject) {
        window.loadData('v2/index/getCameraStatistics', true, { random: Math.random() }, function (data) {
            if (data.code === '200') {
                var result = data.data;
                if (result && result.length > 0) {
                    for (var i = 0; i < result.length; i++) {
                        var orgCode = result[i].orgCode;
                        if (orgCode.length > 6) {
                            cameraPCSData.push(result[i]);
                        } else if (orgCode.length == 6) {
                            cameraGAJData.push(result[i]);
                        } else if (orgCode.length === 4) {
                            cameraSData.push(result[i]);
                        }
                    }
                    // if (cameraGAJData.length === 1) {
                    //     dataUnitChange($("#faceCameraCount .snap").eq(0), parseInt(cameraGAJData[0].counts)); // 抓拍人脸数总数
                    //     if (cameraGAJData[0].taskNum) {
                    //         var remainTaskNum = parseInt(cameraGAJData[0].counts) - parseInt(cameraGAJData[0].taskNum);
                    //         if (remainTaskNum > 0) {
                    //             $("#faceCameraCount .snap").eq(1).removeClass('warming');
                    //         } else {
                    //             $("#faceCameraCount .snap").eq(1).addClass('warming');
                    //         }
                    //         remainTaskNum = -remainTaskNum;
                    //         dataUnitChange($("#faceCameraCount .snap").eq(1), remainTaskNum);
                    //     }
                    // }

                    // 用户是不是市级用户 重新赋值
                    if (globalMap !== 'allNum') {
                        if (globalCode.length > 6) {
                            cameraPCSData.map(item => {
                                if (item.orgCode == globalCode) {
                                    dataUnitChange($("#faceCameraCount .snap").eq(0), parseInt(item.counts)); // 抓拍人脸数总数
                                    dataUnitChange($("#faceCameraCountTwo .snap").eq(1), parseInt(item.counts)); // 镜头总数
                                    dataUnitChange($("#faceCameraCountTwo .snap").eq(0), parseInt(item.onlineNum)); // 镜头在线数
                                    $("#faceCameraPer .number").text((item.onlineRate || 0) + '%');  //视频流在线率
                                    $("#facePhotoPer .number").text((item.picStatusRate || 0) + '%');  //图片流在线率
                                    if (item.taskNum) {
                                        var remainTaskNum = parseInt(item.counts) - parseInt(item.taskNum);
                                        if (remainTaskNum >= 0) {
                                            $("#faceCameraCount .snap").eq(1).removeClass('warming');
                                            $("#faceCameraCount .title").html('接入抓拍机数/超额数');
                                        } else {
                                            $("#faceCameraCount .snap").eq(1).addClass('warming');
                                            $("#faceCameraCount .title").html('接入抓拍机数/欠账数');
                                        }
                                        //remainTaskNum = -remainTaskNum;
                                        dataUnitChange($("#faceCameraCount .snap").eq(1), Math.abs(remainTaskNum));
                                    }
                                }
                            });
                        } else if (globalCode.length == 6) {
                            cameraGAJData.map(item => {
                                if (item.orgCode == globalCode) {
                                    dataUnitChange($("#faceCameraCount .snap").eq(0), parseInt(item.counts)); // 抓拍人脸数总数
                                    dataUnitChange($("#faceCameraCountTwo .snap").eq(1), parseInt(item.counts)); // 镜头总数
                                    dataUnitChange($("#faceCameraCountTwo .snap").eq(0), parseInt(item.onlineNum)); // 镜头在线数
                                    $("#faceCameraPer .number").text((item.onlineRate || 0) + '%');  //视频流在线率
                                    $("#facePhotoPer .number").text((item.picStatusRate || 0) + '%');  //图片流在线率
                                    if (item.taskNum) {
                                        var remainTaskNum = parseInt(item.counts) - parseInt(item.taskNum);
                                        if (remainTaskNum >= 0) {
                                            $("#faceCameraCount .snap").eq(1).removeClass('warming');
                                            $("#faceCameraCount .title").html('接入抓拍机数/超额数');
                                        } else {
                                            $("#faceCameraCount .snap").eq(1).addClass('warming');
                                            $("#faceCameraCount .title").html('接入抓拍机数/欠账数');
                                        }
                                        //remainTaskNum = -remainTaskNum;
                                        dataUnitChange($("#faceCameraCount .snap").eq(1), Math.abs(remainTaskNum));
                                    }
                                }
                            });
                        }
                    } else {
                        dataUnitChange($("#faceCameraCount .snap").eq(0), parseInt(cameraSData[0].counts)); // 抓拍人脸数总数
                        dataUnitChange($("#faceCameraCountTwo .snap").eq(1), parseInt(cameraSData[0].counts)); // 镜头总数
                        dataUnitChange($("#faceCameraCountTwo .snap").eq(0), parseInt(cameraSData[0].onlineNum)); // 镜头在线数
                        $("#faceCameraPer .number").text((cameraSData[0].onlineRate || 0) + '%');  //视频流在线率
                        $("#facePhotoPer .number").text((cameraSData[0].picStatusRate || 0) + '%');  //图片流在线率
                        if (cameraSData[0].taskNum) {
                            var remainTaskNum = parseInt(cameraSData[0].counts) - parseInt(cameraSData[0].taskNum);
                            if (remainTaskNum >= 0) {
                                //remainTaskNum = 0;
                                $("#faceCameraCount .snap").eq(1).removeClass('warming');
                                $("#faceCameraCount .title").html('接入抓拍机数/超额数');
                            } else {
                                $("#faceCameraCount .snap").eq(1).addClass('warming');
                                $("#faceCameraCount .title").html('接入抓拍机数/欠账数');
                            }
                            //remainTaskNum = -remainTaskNum;
                            dataUnitChange($("#faceCameraCount .snap").eq(1), Math.abs(remainTaskNum));
                        }
                    }
                }
                resolve(result);
            }
        }, '', 'GET')
    })
    return res;
}

/**
 * 数据看板 抓拍总数
 */
function refreshSnapCountInfo(result) {
    $rollNum = $('#detectInfo .first').find('.dashboard-roll-num');
    // if (window.databoardTimer) {
    //     clearInterval(window.databoardTimer);
    // }
    if (result) {
        var num = result;
    } else {
        var num = 0;
    }
    // $rollNum.rollNum({
    //     deVal: num,
    //     digit: 12
    // });
    var valLen = 12;
    dataSplitShow($rollNum, valLen, num);
    // window.databoardTimer = window.setInterval(function () {
    //     // var random = Math.floor(Math.random() * 256);
    //     // num += random;
    //     $rollNum.eq(0).rollNum('setNum', num, 800, 0);
    // }, 1000);
}

/**
 * 数据看板 历史平均抓拍
 */
function getHistoryAvePictureData() {
    window.loadData('v2/index/getAvgCameraPhotograph', true, '', function (data) {
        if (data.code === '200') {
            var result = data.data;
            if (result && result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    var orgCode = result[i].orgCode;
                    if (orgCode.length > 6) {
                        historyAvePicPCSData.push(result[i]);
                    } else if (orgCode.length == 6) {
                        historyAvePicGAJData.push(result[i]);
                    } else if (orgCode.length === 4) {
                        historyAvePicSData.push(result[i]);
                        // dataUnitChange($("#facePictureCount .number"), parseInt(pictureSData[0].counts));
                    }
                }
            }
        }
    }, '', 'GET');
}

/**
 * 数据看板 告警总数
 */
function refreshAlarmCountInfo(result, today) {
    $rollNum = $('#detectInfo .last').find('.dashboard-roll-num');
    // if (window.databoardTimer) {
    //     clearInterval(window.databoardTimer);
    // }
    if (result) {
        var num = result;
    } else {
        var num = 0;
    }
    // $rollNum.rollNum({
    //     deVal: num,
    //     digit: 9
    // });
    var valLen = 9;
    dataSplitShow($rollNum, valLen, num, $('#snapCountAlarmChange'), today);
    // window.databoardTimer = window.setInterval(function () {
    //     // var random = Math.floor(Math.random() * 300);
    //     // num += random;
    //     $rollNum.eq(1).rollNum('setNum', num, 800, 0);
    // }, 1000);
}

/**
 * 数据看板 今日抓拍总数
 */
function refreshSnapBoardTodayInfo(result) {
    $rollNum = $('#snapCountStatisChange');
    // if (window.databoardTimer) {
    //     clearInterval(window.databoardTimer);
    // }
    if (result) {
        var num = result;
    } else {
        var num = 0;
    }
    // $rollNum.rollNum({
    //     deVal: num,
    //     digit: 12
    // });
    var valLen = 12;
    $rollNum.text(result);
    //dataSplitShow($rollNum, valLen, num);
    // window.databoardTimer = window.setInterval(function () {
    //     // var random = Math.floor(Math.random() * 256);
    //     // num += random;
    //     $rollNum.eq(0).rollNum('setNum', num, 800, 0);
    // }, 1000);
}

/**
 * 数据看板 告警总数
 */
function refreshAlarmTodayInfo(result) {
    $rollNum = $('#snapCountAlarmChange');
    // if (window.databoardTimer) {
    //     clearInterval(window.databoardTimer);
    // }
    if (result) {
        var num = result;
    } else {
        var num = 0;
    }
    // $rollNum.rollNum({
    //     deVal: num,
    //     digit: 9
    // });
    var valLen = 9;
    $rollNum.text(result);

    //dataSplitShow($rollNum, valLen, num);
    // window.databoardTimer = window.setInterval(function () {
    //     // var random = Math.floor(Math.random() * 300);
    //     // num += random;
    //     $rollNum.eq(1).rollNum('setNum', num, 800, 0);
    // }, 1000);
}

//最新告警列表
function sockAlarmList(socketAlarmList) {
    (function (socketAlarmList) {
        //setTimeout(() => {
        socketAlarmIsClick = false;

        let insertHtml = '';
        for (var i = 0; i < socketAlarmList.length; i++) {
            var threshold = 0,
                status = parseFloat(socketAlarmList[i].status),
                statusStr, statusCls = '';
            if (status === 0) {
                statusStr = '未处理';
                statusCls = ' grade1'
            } else if (status === 1) {
                statusStr = '已命中';
                statusCls = ' grade2'
            } else if (status === 2) {
                statusStr = '已误报';
                statusCls = ' grade3'
            } else {
                statusStr = '未知';
                statusCls = ' grade1'
            }
            if (socketAlarmList[i].threshold) {
                threshold = parseFloat(socketAlarmList[i].threshold);
            }
            insertHtml += `<li class="warning-item">
                                            <div class="warning-item-content">
                                                <span class="image-tag1 warning rotate ${socketAlarmList[i].dataStatus == '2' ? '' : 'hide'}">疑似撤逃</span>
                                                <div class="warning-item-img-box">
                                                    <div class="warning-item-img">
                                                        <img class="img-right-event" src="${socketAlarmList[i].url || './assets/images/control/person.png'}"/>
                                                        <img class="img-right-event" src="${socketAlarmList[i].smallHttpUrl || './assets/images/control/person.png'}"/>
                                                    </div>
                                                    <span class="warning-item-percent grade1">${threshold}%</span>
                                                </div>
                                                <div class="warning-item-name">
                                                    <span title="${socketAlarmList[i].libName ? (socketAlarmList[i].cilNames ? (socketAlarmList[i].libName + '—' + socketAlarmList[i].cilNames) : socketAlarmList[i].libName) : '未知'}">${socketAlarmList[i].libName ? (socketAlarmList[i].cilNames ? (socketAlarmList[i].libName + '—' + socketAlarmList[i].cilNames) : socketAlarmList[i].libName) : '未知'}</span>
                                                    <span class="warning-item-level${statusCls}">${statusStr}</span>
                                                </div>
                                                <p class="warning-item-time">
                                                <i class="aui-icon-color-default aui-icon-tree-camera"></i>
                                                    <span class="warning-item-text cameral-name-text" title="${socketAlarmList[i].cameraName || '未知'}">${socketAlarmList[i].cameraName || '未知'}</span>
                                                </p>
                                                <p class="warning-item-time">
                                                    <i class="aui-icon-color-default aui-icon-history"></i>
                                                    <span class="warning-item-text">${socketAlarmList[i].timeDesc || '未知'}</span>
                                                </p>
                                            </div>
                                        </li>`;
        }
        $("#sock-alarm-time").empty().append(insertHtml); //渲染按时间列表
        // 给节点添加数据
        $("#sock-alarm-time").find('.warning-item').each(function (index, el) {
            $(el).data('listData', socketAlarmList[index]);
        });

        socketAlarmIsClick = true;
        // }, 500)
    })(socketAlarmList);
}

function setAlarmWebSocket() {
    if ('WebSocket' in window) {
        var token = $.cookie('xh_token');
        var ws = new WebSocket(wobsocketUrl + '?token=' + token);
        ws.onopen = function () {
            console.log('Info: WebSocket connection opened.');
            // 给弹窗绑定事件
            var $popClose = $('#time-alarm-pop').find('.aui-icon-not-through'),
                $popWarning = $('#time-alarm-pop').find('.warning-content-img');
            $popClose.off('click').on('click', function () {
                $('#time-alarm-pop').addClass('hide');
                popAlarmTime = true;
                window.setTimeout(function () {
                    popAlarmTime = false;
                }, 800);
            });
            // 点击弹框出现大图
            $popWarning.off('click').on('click', function (evt) {
                $('#time-alarm-pop').addClass('hide');
                var $delBigMask = $('body').find('.mask-container-fixed.time-alarm-pop');
                if ($delBigMask.length > 0) {
                    $delBigMask.remove();
                }
                // 判定是否在关闭动画中
                if (popAlarmTime) {
                    return;
                }
                var $alarm = $(this).closest('#time-alarm-pop'),
                    alarmId = $alarm.attr('id'),
                    index = $(this).index(),
                    listData = $alarm.data('listData');
                setTimeout(() => {
                    window.createBigImgMask($alarm, alarmId, 0, $('#usearchImg'), evt, {
                        cardImg: $(this),
                        data: listData,
                        len: 1,
                        html: $(window.changeAlarmMaskHtml(listData))
                    });
                }, 200);
            });
        }
        ws.onmessage = function (evt) {
            console.log('Info: WebSocket connection message.');
            var result = JSON.parse(evt.data);
            var $dashboard = $('body').find('.data-dashboard'); // 判断是否数据看板页面
            var $indexPage = $('#pageSidebarMenu .aui-icon-home-2').closest('.sidebar-item'); // 判断是否首页
            //console.log(result);
            if (result.type === 'alarmInfo') { // 告警推送弹框信息
                var result = result.data;
                console.log(result);
                //最新告警数组
                socketAlarmList.unshift(result);
                socketAlarmList.splice(18, socketAlarmList.length);

                if (socketAlarmStatus) {
                    //过滤数组
                    if (socketAlarmObj.orgId || socketAlarmObj.libId) {
                        if (socketAlarmFilterList.length) {
                            if ((result.orgId == socketAlarmObj.orgId) && (result.orgId == socketAlarmObj.libId)) {
                                socketAlarmFilterList.unshift(result);
                            }
                        } else {
                            socketAlarmFilterList = socketAlarmList.filter(item => {
                                return (item.orgId == socketAlarmObj.orgId) && (item.libId == socketAlarmObj.libId)
                            })
                        }
                        sockAlarmList(socketAlarmFilterList);
                    } else {
                        sockAlarmList(socketAlarmList);
                    }
                }

                //实时视频与抓拍图下面子节点存在推送的id等于当前选中的镜头id
                if ($(".map-new-popup").children().length > 0 && ($('.map-new-popup').data("type") == 'playAndCatch') && (result.cameraId == $("#popup-body-camera-cntList").find("li.active").attr('cameraid'))) {
                    if ($("#popup-body-alarm-cntList").find("li.warning-item").length == 0) {
                        $("#popup-body-alarm-cntList").html('');
                    }
                    var htmlMapVideo = $([`<li class="warning-item">
                                            <div class="warning-item-content">
                                                <span class="image-tag1 warning rotate hide">疑似撤逃</span>
                                                <div class="warning-item-img-box">
                                                    <div class="warning-item-img">
                                                        <img class="img-right-event" src="${result.url || './assets/images/control/person.png'}">
                                                        <img class="img-right-event" src="${result.facehttpurl || './assets/images/control/person.png'}">
                                                    </div>
                                                    <span class="warning-item-percent grade1">${result.threshold || 0.00}</span>
                                                </div>
                                                <div class="warning-item-name">
                                                    <span title=${result.libName || '未知'}>${result.libName || '未知'}</span>
                                                </div>
                                                <div class="warning-item-info">
                                                    <span class="warning-item-infoName">${result.name || '未知'}</span>
                                                    <span class="warning-item-infoIdcard" title=${result.idcard || '未知'}>${result.idcard || '未知'}</span>
                                                </div>
                                                <p class="warning-item-time">
                                                    <span class="warning-item-text">${result.alarmTime || '未知'}</span>
                                                </p>
                                            </div>
                                        </li>`].join(''));
                    $("#popup-body-alarm-cntList").prepend(htmlMapVideo);
                    htmlMapVideo.data('listData', result);
                }

                // 声音提示
                $("#warningTone").empty();
                $("#warningTone").html(
                    '<audio autoplay="autoplay"><source src="vido/8858.mp3" type="audio/mpeg"/><source src="vido/4082.wav" type="audio/wav"/></audio>'
                );
                var $pop = $('#time-alarm-pop'),
                    $guideIndex = $('#system-guide-index'),
                    $guideSearch = $('#system-guide-search'),
                    $sideBar = $('#pageSidebarMenu .aui-icon-home-2').closest('.sidebar-item'),
                    $popReason = $pop.find('.warning-content-title').children(),
                    $initImg = $pop.find('.img-left-tag').next(),
                    $alarmImg = $pop.find('.img-right-tag').next(),
                    $similarity = $pop.find('.image-similarity').children(),
                    $camera = $pop.find('.camera-text-detail').children(),
                    $time = $pop.find('.time-text-detail').children(),
                    popCls = $pop.hasClass('hide');
                // 给数据看板添加数据
                var numberText = parseFloat($('#alarmCount').find('.number').text());
                $('#alarmCount').find('.number').text(numberText + 1);
                var $dashboard = $('body').find('.data-dashboard');
                if ($dashboard.length > 0) {
                    function createTopFiveHtml(result) {
                        // var html = `<li class="task-list-item"  cameraId="${result.cameraId}">
                        //                 <i class="aui-icon-color-default aui-icon-tree-camera"></i>
                        //                 <span class="databoardModal"><span class="name" title="${result.cameraName || '未知'}">${result.cameraName || '未知'}</span></span>
                        //                 <span class="total">${result.alarmTime}</span>
                        //             </li>`
                        var html = $([
                            `<li class="task-list-item"  cameraId="${result.cameraId}">` +
                            `<i class="aui-icon-color-default aui-icon-tree-camera"></i>` +
                            `<span class="databoardModal"><span class="name" title="${result.cameraName || '未知'}">${result.cameraName || '未知'}</span></span>` +
                            `<span class="total">${result.alarmTime}</span>` +
                            `</li>`
                        ].join(''));
                        return html;
                    }
                    var $info = $dashboard.find('#detectInfo').find('.number'),
                        infoData = $info.eq(1).data('rollNum'),
                        $topFive = $dashboard.find('#taskListTop');
                    if (infoData) {
                        $info.eq(1).rollNum('setNum', (numberText + 1), 800, 0);
                        animateTopFive(result);
                    }

                    function animateTopFive(result) {
                        var $item = createTopFiveHtml(result),
                            liWidth = $topFive.find('.task-list-item').outerHeight();
                        $($item).data('listData', result);
                        $($item).find(".name").data('listData', result);
                        $topFive.prepend($item);
                        // $topFive.find('task-list-item').eq(0).data({
                        //     'listData': result
                        // });
                        // $topFive.find('task-list-item').eq(0).find(".name").data({
                        //     'listData': result
                        // });
                        $topFive.css('top', -liWidth);
                        $topFive.css('position', 'absolute');
                        $topFive.animate({
                            'top': 0,
                        }, 500, function () {
                            popAlarmTime = false;
                            $topFive.find('.task-list-item:last').remove();
                            var topFive = $topFive.data('result') ? $topFive.data('result') : '';
                            if (topFive) {
                                popAlarmTime = true;
                                alarmAnimation(topFive);
                                $topFive.data({
                                    result: ''
                                });
                            }
                        });
                    }
                    animateTopFive(result);
                }
                // 判定是否在首页
                if ($sideBar.hasClass('active')) {
                    // 首页告警消息推送
                    if ($guideIndex.hasClass('hide')) {
                        //动画进行中
                        if ($('#warning-list').length > 0) {
                            var $warningList = $('#warning-list');
                        } else {
                            var $warningList = $('#manage-warning-list');
                        }
                        if ($warningList.find('.warning-item').length == 0) {
                            var _html = createAlarmItem(result);
                            $warningList.empty().html(_html);
                        } else {
                            if (popAlarmTime) {
                                $warningList.data({
                                    result: result
                                });
                            } else {
                                var alarmAnimation = function (result) {
                                    var $item = createAlarmItem(result),
                                        liWidth = $warningList.parent().outerWidth();

                                    if ($('#warning-list').length > 0) {
                                        var marginNum = parseInt($warningList.css('margin-left'));
                                        var rollPositionIndex = -parseInt($warningList.css('margin-left')) / liWidth;
                                        if (rollPositionIndex == 0) {
                                            $warningList.find('.warning-item').eq(3).after($item);
                                            $warningList.find('.warning-item').eq(4).data({
                                                'listData': result
                                            });
                                            $warningList.find('.warning-item').eq(20).remove();
                                        } else if (rollPositionIndex <= 1 && rollPositionIndex > 0) {
                                            $warningList.find('.warning-item').eq(7).after($item);
                                            $warningList.find('.warning-item').eq(8).data({
                                                'listData': result
                                            });
                                            $warningList.find('.warning-item').eq(20).remove();
                                        } else if (rollPositionIndex <= 2 && rollPositionIndex > 1) {
                                            $warningList.find('.warning-item').eq(11).after($item);
                                            $warningList.find('.warning-item').eq(12).data({
                                                'listData': result
                                            });
                                            $warningList.find('.warning-item').eq(20).remove();
                                        } else if (rollPositionIndex <= 3 && rollPositionIndex > 2) {
                                            $warningList.find('.warning-item').eq(15).after($item);
                                            $warningList.find('.warning-item').eq(16).data({
                                                'listData': result
                                            });
                                            $warningList.find('.warning-item').eq(20).remove();
                                        } else {
                                            // 位置位于最后组时，替换第一条数据
                                            // $warningList.find('.warning-item:first').remove();
                                            // $warningList.prepend($item);
                                            $warningList.find('.warning-item:first').replaceWith($item);
                                            $warningList.find('.warning-item').eq(0).data({
                                                'listData': result
                                            });
                                            // 滚动效果最后的缓存数据替换
                                            // $warningList.find('.warning-item').eq(-4).remove();
                                            // $warningList.find('.warning-item').eq(-4).after($item);
                                            $warningList.find('.warning-item').eq(-4).replaceWith($item);
                                        }
                                    } else {
                                        var marginNum = parseInt($warningList.css('margin-left'));
                                        var rollPositionIndex = -parseInt($warningList.css('margin-left')) / liWidth;
                                        if (rollPositionIndex == 0) {
                                            $warningList.find('.warning-item').eq(4).after($item);
                                            $warningList.find('.warning-item').eq(5).data({
                                                'listData': result
                                            });
                                            $warningList.find('.warning-item').eq(20).remove();
                                        } else if (rollPositionIndex <= 1 && rollPositionIndex > 0) {
                                            $warningList.find('.warning-item').eq(9).after($item);
                                            $warningList.find('.warning-item').eq(10).data({
                                                'listData': result
                                            });
                                            $warningList.find('.warning-item').eq(20).remove();
                                        } else if (rollPositionIndex <= 2 && rollPositionIndex > 1) {
                                            $warningList.find('.warning-item').eq(14).after($item);
                                            $warningList.find('.warning-item').eq(15).data({
                                                'listData': result
                                            });
                                            $warningList.find('.warning-item').eq(20).remove();
                                        } else {
                                            // 位置位于最后组时，替换第一条数据
                                            $warningList.find('.warning-item:first').replaceWith($item);
                                            $warningList.find('.warning-item').eq(0).data({
                                                'listData': result
                                            });
                                            // 滚动效果最后的缓存数据替换
                                            $warningList.find('.warning-item').eq(-5).replaceWith($item);
                                        }
                                        // 原顺序插入代码
                                        // $warningList.prepend($item);
                                        // $warningList.find('.warning-item').eq(0).data({
                                        //     'listData': result
                                        // });
                                        // // $warningList.css('margin-left', 0);
                                        // $warningList.find('.warning-item:last').remove();
                                    }
                                    popAlarmTime = false;
                                    var warningList = $warningList.data('result') ? $warningList.data('result') : '';
                                    if (warningList) {
                                        popAlarmTime = true;
                                        alarmAnimation(warningList);
                                        $warningList.data({
                                            result: ''
                                        });
                                    }
                                    // $warningList.css('margin-left', 0);
                                    // $warningList.css('left', -liWidth);
                                    // $warningList.animate({
                                    //     'left': 0,
                                    // }, 500, function () {
                                    //     popAlarmTime = false;
                                    //     $warningList.find('.warning-item:last').remove();
                                    //     var warningList = $warningList.data('result') ? $warningList.data('result') : '';
                                    //     if (warningList) {
                                    //         popAlarmTime = true;
                                    //         alarmAnimation(warningList);
                                    //         $warningList.data({
                                    //             result: ''
                                    //         });
                                    //     }
                                    // });
                                }
                                alarmAnimation(result);
                            }
                        }
                    }
                    return;
                }
                // 判定是否在关闭动画中
                if (popAlarmTime) {
                    return;
                }
                // 判定是否显示状态
                if (popCls) {
                    $('#time-alarm-pop').removeClass('hide');
                    popAlarmTime = true;
                    window.setTimeout(function () {
                        popAlarmTime = false;
                    }, 800);
                }
                var guideSearchSign = true;
                if ($guideSearch.attr('id') === 'system-guide-search' && !$guideSearch.hasClass('hide')) {
                    guideSearchSign = false;
                }
                if (guideSearchSign) {
                    $pop.data('listData', result);
                    $popReason.text(result.comments || '未知');
                    $initImg.attr('src', result.url || './assets/images/control/person.png');
                    $alarmImg.attr('src', result.facehttpurl || './assets/images/control/person.png');
                    $similarity.text((result.threshold || 0) + '%');
                    $camera.text(result.cameraName || '未知').attr('title', result.cameraName);
                    $time.text(result.alarmTime || '未知');
                    // 红点点代码区域，产生任务红点
                    let taskIds = result.taskIds;
                    let taskIdsLen = taskIds.length;
                    // 测试数据
                    // console.log('result:' , result)
                    // console.log('taskIds:', taskIds)
                    for (let i = 0; i < taskIdsLen; i++) {
                        $('[taskid = ' + '"' + taskIds[i] + '"' + ']').find('.img-red-circle').removeClass('hide');
                    }
                }
            } else if (result.type === 'snapCountStatis') { // 抓拍人脸数
                var myDate = new Date().getSeconds();
                console.log(result.data.total + '/' + myDate);
                if ($indexPage.hasClass('active')) {
                    var stations = result.data.stations;
                    var polices = result.data.polices;
                    if (stations && stations.length > 0) {
                        for (var i = 0; i < stations.length; i++) {
                            if (stations[i].orgCode.length == 6) {
                                pictureGAJData.forEach(function (item, index) {
                                    if (item.orgCode == stations[i].orgCode) {
                                        item.counts = stations[i].counts;
                                        item.totalToday = stations[i].totalToday;
                                    }
                                })
                            }
                        }
                    }
                    if (polices && polices.length > 0) {
                        for (var i = 0; i < polices.length; i++) {
                            if (polices[i].orgCode.length > 6) {
                                picturePCSData.forEach(function (item, index) {
                                    if (item.orgCode == polices[i].orgCode) {
                                        item.counts = polices[i].counts;
                                        item.totalToday = polices[i].totalToday;
                                    }
                                })
                            }
                        }
                    }
                    pictureSData[0].counts = result.data.total;
                    pictureSData[0].totalToday = result.data.totalToday;

                    if (globalMap == 'allPCSNum') {
                        pictureGAJData.forEach(function (item, index) {
                            if (item.orgCode == globalCode) {
                                refreshSnapTotalInfo(item.counts);
                                refreshSnapTodayInfo(item.totalToday);
                                setTimeout(() => {
                                    // 重新加载首页地图抓拍人脸数
                                    if ($("#facePictureTotal .head-list").eq(0).hasClass('active')) {
                                        $("#facePictureTotal .head-list").eq(0).click();
                                    } else if ($("#facePictureTotal .head-list").eq(1).hasClass('active')) {
                                        $("#facePictureTotal .head-list").eq(1).click();
                                    }
                                }, 500);
                            }
                        })
                    } else {
                        refreshSnapTotalInfo(result.data.total);
                        refreshSnapTodayInfo(result.data.totalToday);
                        setTimeout(() => {
                            // 重新加载首页地图抓拍人脸数
                            if ($("#facePictureTotal .head-list").eq(0).hasClass('active')) {
                                $("#facePictureTotal .head-list").eq(0).click();
                            } else if ($("#facePictureTotal .head-list").eq(1).hasClass('active')) {
                                $("#facePictureTotal .head-list").eq(1).click();
                            }
                        }, 500);
                    }
                }
                // 数据看板实时数据
                if ($dashboard.length > 0) {
                    var pictureNumberData = result.data.total,
                        pictureNumberDataToday = result.data.totalToday;
                    //$("#snapCountStatisChange").html(`+${parseInt(result.data.total) - parseInt($("#snapCountStatisChange").parents(".kpi-data").find(".dashboard-roll-num").text())}`);
                    if (globalMapData == 'allPCSNum') {
                        pictureGAJData.forEach(function (item, index) {
                            if (item.orgCode == globalCodeData) {
                                refreshSnapCountInfo(item.counts);
                                refreshSnapBoardTodayInfo(item.totalToday);
                                setTimeout(() => {
                                    var activeTabId = $('.databoard').find('.tab-item.active').index();
                                    if (activeTabId === 1) {
                                        $('.tab-item').eq(1).click();
                                    }
                                }, 500);
                            }
                        })
                    } else {
                        refreshSnapCountInfo(pictureNumberData);
                        refreshSnapBoardTodayInfo(pictureNumberDataToday);
                        setTimeout(() => {
                            var activeTabId = $('.databoard').find('.tab-item.active').index();
                            if (activeTabId === 1) {
                                $('.tab-item').eq(1).click();
                            }
                        }, 500);
                    }
                }
            } else if (result.type === 'alarmCountStatis') { // 告警总数
                //console.log(result);
                if ($indexPage.hasClass('active')) {
                    var stations = result.data.stations;
                    var polices = result.data.polices;
                    if (stations && stations.length > 0) {
                        for (var i = 0; i < stations.length; i++) {
                            if (stations[i].orgCode.length == 6) {
                                alarmGAJData.forEach(function (item, index) {
                                    if (item.orgCode == stations[i].orgCode) {
                                        item.counts = stations[i].counts;
                                    }
                                })
                            }
                        }
                    }
                    if (polices && polices.length > 0) {
                        for (var i = 0; i < polices.length; i++) {
                            if (polices[i].orgCode.length > 6) {
                                alarmPCSData.forEach(function (item, index) {
                                    if (item.orgCode == polices[i].orgCode) {
                                        item.counts = polices[i].counts;
                                    }
                                })
                            }
                        }
                    }
                    if (globalMap == 'allPCSNum') {
                        alarmGAJData.forEach(function (item, index) {
                            if (item.orgCode == globalCode) {
                                dataUnitChange($("#alarmCount .number"), parseInt(item.counts));
                                dataUnitChange($("#todayAlarmCount .number"), parseInt(item.totalToday));
                                // 重新加载首页地图告警数
                                var $activeItem = $(".kpi-list").find('li').filter('.active'),
                                    activeItemID = $activeItem.attr('id');
                                if (activeItemID == "alarmCount") {
                                    $('#' + activeItemID).click();
                                }
                            }
                        })
                    } else {
                        dataUnitChange($("#alarmCount .number"), parseInt(result.data.total));
                        dataUnitChange($("#todayAlarmCount .number"), parseInt(result.data.totalToday));
                        // 重新加载首页地图告警数
                        var $activeItem = $(".kpi-list").find('li').filter('.active'),
                            activeItemID = $activeItem.attr('id');
                        if (activeItemID == "alarmCount") {
                            $('#' + activeItemID).click();
                        }
                    }
                }
                alarmSData[0].counts = result.data.total;
                alarmSData[0].totalToday = result.data.totalToday;

                // 数据看板实时数据
                if ($dashboard.length > 0) {
                    var alarmNumberData = result.data.total,
                        alarmNumberDataToday = result.data.totalToday;
                    if (globalMapData == 'allPCSNum') {
                        alarmGAJData.forEach(function (item, index) {
                            if (item.orgCode == globalCodeData) {
                                refreshAlarmCountInfo(item.counts, item.totalToday);
                                //refreshAlarmTodayInfo(item.totalToday);
                                setTimeout(() => {
                                    var activeTabId = $('.databoard').find('.tab-item.active').index();
                                    if (activeTabId === 2) {
                                        $('.tab-item').eq(2).click();
                                    }
                                }, 500);
                            }
                        })
                    } else {
                        refreshAlarmCountInfo(alarmNumberData, alarmNumberDataToday);
                        //refreshAlarmTodayInfo(alarmNumberDataToday);
                        setTimeout(() => {
                            var activeTabId = $('.databoard').find('.tab-item.active').index();
                            if (activeTabId === 2) {
                                $('.tab-item').eq(2).click();
                            }
                        }, 500);
                    }
                }
            } else if (result.type === 'resource') { // 数据看板资源统计
                if ($dashboard.length > 0) {
                    var resourceResult = {
                        cpuRatio: result.data.cpuRatio,
                        memoryRatio: result.data.memoryRatio,
                        storageLoad: result.data.storageRatio,
                        gpuRatio: ''
                    }
                    window.getResourceStateData(resourceResult);
                }
            } else if (result.type === 'approveCount') {
                if ($("#pageSidebarMenu").length > 0) { //目录已经存在
                    if ($("#pageSidebarMenu").find(".aui-icon-customers2").parent().find(".redNum").removeClass("hide").html() != '99+') {
                        var count = parseInt($("#pageSidebarMenu").find(".aui-icon-customers2").parent().find(".redNum").removeClass("hide").html());
                        count++;
                        $("#pageSidebarMenu").find(".aui-icon-customers2").parent().find(".redNum").removeClass("hide").html(count < 100 ? count : '99+');

                        if ($("#myApproveNav").length > 0) { //我的申请页面已经存在
                            $("#myApproveNav").find(".myApproveNum").removeClass("hide").html(count < 100 ? count : '99+');
                        }
                    } else {
                        $("#pageSidebarMenu").find(".aui-icon-customers2").parent().find(".redNum").removeClass("hide").html('99+');

                        if ($("#myApproveNav").length > 0) { //我的申请页面已经存在
                            $("#myApproveNav").find(".myApproveNum").removeClass("hide").html('99+');
                        }
                    }
                }
            } else if (result.type === 'snapImg') { //实时视频抓拍图
                var snapImgData = result.data;
                snapImgData.bigPicUrl = snapImgData.imageUrl;
                snapImgData.longCameraId = snapImgData.cameraId;
                snapImgData.smallPicUrl = snapImgData.thumImageUrl;
                //实时视频与抓拍图下面子节点存在
                if ($(".map-new-popup").children().length > 0 && $('.map-new-popup').data("type") == 'playAndCatch') {
                    if ($("#popup-body-face-cntList").find("li.image-card-wrap").length == 16) {
                        $("#popup-body-face-cntList").find("li.image-card-wrap").eq(15).remove();
                    }
                    if ($("#popup-body-face-cntList").find("li.image-card-wrap").length == 0) {
                        $("#popup-body-face-cntList").html('');
                    }
                    var html = $([`<li class="image-card-wrap type-5 onecj" cameraId="${snapImgData.cameraId}">
                                    <div class="image-card-box img-right-event">
                                        <img class="image-card-img" src="${snapImgData.thumImageUrl}" position="position" alt="">
                                    </div>
                                    <div class="image-card-message-box">
                                        <p class="image-card-message-time">${snapImgData.captureTime || '未知'}</p>
                                    </div>
                                </li>`].join(''));
                    $("#popup-body-face-cntList").prepend(html);
                    html.data('listData', snapImgData);
                }
            } else if (result.type === 'notice') {  //通知推送
                var noticeData = [result.data];
                if ($(".feedback-allTips").hasClass("hide")) {
                    getSystemTips(noticeData);
                } else {
                    var html = '';
                    for (let i = 0; i < noticeData.length; i++) {
                        html += `<div class="tipsItem">
                                            <h2>${noticeData[i].title}</h2>
                                            <div class="tipsContent">${noticeData[i].context}</div>
                                        </div>`;
                    }
                    $(".feedback-allTips").find(".feedback-allTips-itemContent").prepend(html);

                    let top = $('.feedback-container').find('.feedback-item').eq(4).offset().top - $(".feedback-allTips").height() / 2,
                        left = $('.feedback-container').find('.feedback-item').eq(4).offset().left - $(".feedback-allTips").width() - 20;
                    $(".feedback-allTips").css({
                        top,
                        left
                    });
                }
            }
        }
        ws.onclose = function (event) {
            console.log('Info: WebSocket connection close.');
        };
    }
}