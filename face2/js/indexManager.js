(function (window, $) {
    globalMap = '', globalCode = '', globalOrgId = ''; // allNum市请求  allPCSNum公安局请求 globalOrgId只用于下拉框赋值

    var currentOrgId = '10'; // 当前机构id
    var orgInfoArray = []; // 机构信息暂存数组
    var controlTimer = null; // 布控任务实时刷新定时器
    var controlAlarmTimer = null; // 布控任务实时刷新定时器
    var controlMaxNum = 4; // 布控任务最多显示的条数
    var loopStartIndex = 4; // 布控任务循环刷新的起始index
    var controlAlarmTimerM = null; //刷新告警定时器
    //var clickIntoMap = false;
    var averageAlarmSData = [],
        averageAlarmGAJData = [],
        averageAlarmPCSData = [],
        averageSnapshotSData = [],
        averageSnapshotGAJData = [],
        averageSnapshotPCSData = [],
        controlPeopleData = '',
        remainControlData = '',
        todayControlData = '',
        todayRevokeControlData = '';

    /**
     * 首页初始化
     */
    function initMindex() {
        loadUserInfo(); // 获取登录用户信息

        $("#errorType_val").selectmenu();
        $('[data-toggle="tooltip"]').tooltip();
        $('#databash').find('.databoard-loading-box').removeClass('hide'); // 数据看板按钮的加载动画，首页地图加载完毕后取消

        //初始化地图地址
        $("#map_iframe_index").attr({
            value: mapUrl + 'peopleCityBlack.html?orgid=44031&rxModule=map_iframe_index',
            src: mapUrl + 'peopleCityBlack.html?orgid=44031&rxModule=map_iframe_index'
        })
    }
    initMindex();

    /**
     * 数据获取 获取登录用户信息
     */
    function loadUserInfo() {
        var port = 'v2/user/getUserInfo',
            successFunc = function (data) {
                if (data.code === '200') {
                    orgCodeArr = data.fullOrgCode.split('/');
                    orgIdArr = data.fullOrgId.split('/');
                    if (orgCodeArr.length == 2) { // 市级
                        globalMap = 'allNum';
                        globalCode = orgCodeArr[1].slice(0, 4);
                        globalOrgId = orgIdArr[1].split('.')[0];
                    } else { // 公安局 派出所
                        globalMap = 'allPCSNum';
                        globalCode = orgCodeArr[2].slice(0, 6);
                        globalOrgId = orgIdArr[2].split('.')[0];
                    }
                    loadOrgInfo($("#orgSelectMenu")); // 左上侧下拉框数据获取 加载机构信息 机构id初始化为“ 10 ~ 深圳市公安局 ”
                }
            };
        loadData(port, true, null, successFunc, '', 'GET');
    }

    /**
     * 管理者登陆 数据获取 获取机构信息
     * @param { $container } $container // 目标容器
     */
    function loadOrgInfo($container) {
        var port = 'v2/org/getOrgInfos',
            data = {
                orgType: 1,
                userType: 2,
                returnType: 3
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    var result = data.data;
                    if (result) {
                        var itemHtml = ``,
                            isGlobalOrgId = false;
                        $("#orgSelectParent").attr("orgid", result[0].orgId);
                        for (var i = 0; i < result.length; i++) {
                            itemHtml += `<option value="${result[i].orgId}" orgid="${result[i].orgId}" >${result[i].orgName}</option>`;
                            orgInfoArray.push({
                                orgId: result[i].orgId,
                                orgCode: result[i].orgCode
                            });
                            // 判断是否含有此公安局
                            if (globalOrgId == result[i].orgId) {
                                isGlobalOrgId = true
                            }
                        }
                        $container.html(itemHtml).selectmenu();

                        // 用户是不是市级用户且不存在该机构
                        if (globalMap !== 'allNum' && !isGlobalOrgId) {
                            globalMap = 'allNum';
                            globalCode = '4403';
                            globalOrgId = '10';
                        }
                        $('#orgSelectMenu').val(globalOrgId);
                        $('#orgSelectMenu').selectmenu('refresh');

                        getFacePictureData(); // 获取抓拍人脸数
                        getAlarmCountData(); // 获取告警数
                        getFaceCameraData(); // 获取抓拍机数
                        getHistoryAvePictureData();//历史平均抓拍数
                        getAverageStatusData(); // 获取平均每日抓拍人脸数 平均每日告警数
                        getControlStatusData(); // 获取布控数据 已布控 剩余布控


                    }
                } else {
                    warning.say(data.msg);
                }
            };
        loadData(port, true, data, successFunc, undefined, 'GET');
    }


    /**
     * 管理者登陆 根据获取到的重大事件、场景安保、常规布控、巡逻布控信息数据生成页面内容（功能已隐藏）
     * @param {string} result 机构id
     */
    function createControlDom(result) {
        if (result && result.length > controlMaxNum) {
            var tempLength = result.length - loopStartIndex,
                _html = '';
            tempLength = tempLength > controlMaxNum ? controlMaxNum : tempLength;
            console.log('---- 首页布控任务刷新： ' + loopStartIndex);
            for (let i = loopStartIndex; i < (loopStartIndex + tempLength); i++) {
                _html += `
                <li class="control-item">
                    <div class="control-item-content">
                        <div class="control-item-detail">
                            <div class="control-item-img">
                                <img src="./assets/images/control/bukong-${(result[i].type === 'ZDSJ' || result[i].type === 'XLBK' || result[i].type === 'YFAB') ? result[i].type : 'CGBK'}-2.png" alt="">
                            </div>
                            <div class="control-item-info">
                                <span class="control-item-name">${result[i].typeName}</span>
                                <p class="control-item-text">
                                    <span class="taskNum">${result[i].taskCount}</span>个布控任务数量</p>
                                <p class="control-item-text">
                                    <span class="alarmNum">${result[i].alarmCount}</span>条告警数量</p>
                            </div>
                        </div>
                        <p class="control-item-tips">
                            <span class="text-bold">最新告警:</span>
                            <span class="control-item-tips-wrap">
                                <span class="control-item-tips-text" title="${result[i].newAlarm[0]}">${result[i].newAlarm[0]}</span>
                                <span class="control-item-tips-text" title="${result[i].newAlarm[1]}">${result[i].newAlarm[1]}</span>
                                <span class="control-item-tips-text" title="${result[i].newAlarm[2]}">${result[i].newAlarm[2]}</span>
                            </span>
                        </p>
                    </div>
                </li>
                `
            }
            if (loopStartIndex) {
                var startIndex = result.length - loopStartIndex - tempLength;
                loopStartIndex = controlMaxNum - tempLength;

                for (let i = startIndex; i < startIndex + loopStartIndex; i++) {
                    _html += `
                    <li class="control-item">
                        <div class="control-item-content">
                            <div class="control-item-detail">
                                <div class="control-item-img">
                                    <img src="./assets/images/control/bukong-${(result[i].type === 'ZDSJ' || result[i].type === 'XLBK' || result[i].type === 'YFAB') ? result[i].type : 'CGBK'}-2.png" alt="">
                                </div>
                                <div class="control-item-info">
                                    <span class="control-item-name">${result[i].typeName}</span>
                                    <p class="control-item-text">
                                        <span class="taskNum">${result[i].taskCount}</span>个布控任务数量</p>
                                    <p class="control-item-text">
                                        <span class="alarmNum">${result[i].alarmCount}</span>条告警数量</p>
                                </div>
                            </div>
                            <p class="control-item-tips">
                                <span class="text-bold">最新告警:</span>
                                <span class="control-item-tips-wrap">
                                    <span class="control-item-tips-text" title="${result[i].newAlarm[0]}">${result[i].newAlarm[0]}</span>
                                    <span class="control-item-tips-text" title="${result[i].newAlarm[1]}">${result[i].newAlarm[1]}</span>
                                    <span class="control-item-tips-text" title="${result[i].newAlarm[2]}">${result[i].newAlarm[2]}</span>
                                </span>
                            </p>
                        </div>
                    </li>
                    `
                }
            } else {
                loopStartIndex = controlMaxNum;
            }
        } else {
            var _html = '';
            for (var i = 0; i < controlMaxNum; i++) {
                _html += `
                <li class="control-item">
                    <div class="control-item-content">
                        <div class="control-item-detail">
                            <div class="control-item-img">
                                <img src="./assets/images/control/bukong-${(result[i].type === 'ZDSJ' || result[i].type === 'XLBK' || result[i].type === 'YFAB') ? result[i].type : 'CGBK'}-2.png" alt="">
                            </div>
                            <div class="control-item-info">
                                <span class="control-item-name">${result[i].typeName}</span>
                                <p class="control-item-text">
                                    <span class="taskNum">${result[i].taskCount}</span>个布控任务数量</p>
                                <p class="control-item-text">
                                    <span class="alarmNum">${result[i].alarmCount}</span>条告警数量</p>
                            </div>
                        </div>
                        <p class="control-item-tips">
                            <span class="text-bold">最新告警:</span>
                            <span class="control-item-tips-wrap">
                                <span class="control-item-tips-text" title="${result[i].newAlarm[0]}">${result[i].newAlarm[0]}</span>
                                <span class="control-item-tips-text" title="${result[i].newAlarm[1]}">${result[i].newAlarm[1]}</span>
                                <span class="control-item-tips-text" title="${result[i].newAlarm[2]}">${result[i].newAlarm[2]}</span>
                            </span>
                        </p>
                    </div>
                </li>
                `
            }
        }
        $('#bukongPlatInfo').data({
            'result': result
        });
        $('#bukongPlatInfo').removeClass("control-list-animate");
        window.setTimeout(function () {
            $('#bukongPlatInfo').html(_html).addClass("control-list-animate");
        }, 500);
    }

    /**
     * 管理者登陆 首页告警滚动效果
     */
    function refreshHomeM() {
        // $('#manage-warning-list').css('width', 4 * width + 'px');
        var width = $('#manage-warning-list').parent().outerWidth();
        var manageWLN = $('#manage-warning-list').children().length;
        var rollTimes = 0;
        if (manageWLN <= 5) {
            rollTimes = 1;
        } else if (manageWLN <= 10 && manageWLN > 5) {
            rollTimes = 2;
        } else if (manageWLN <= 15 && manageWLN > 10) {
            rollTimes = 3;
        } else if (manageWLN <= 20 && manageWLN > 16) {
            rollTimes = 4;
        } else {
            rollTimes = 0;
        };
        var $addHtmlP = $('#manage-warning-list');
        $addHtmlP.append($addHtmlP.find('.warning-item').eq(0).prop('outerHTML'));
        $addHtmlP.append($addHtmlP.find('.warning-item').eq(1).prop('outerHTML'));
        $addHtmlP.append($addHtmlP.find('.warning-item').eq(2).prop('outerHTML'));
        $addHtmlP.append($addHtmlP.find('.warning-item').eq(3).prop('outerHTML'));
        $addHtmlP.append($addHtmlP.find('.warning-item').eq(4).prop('outerHTML'));
        var num = rollTimes;
        if (rollTimes > 0) {
            var widthLen = 0;
            controlAlarmTimerM = window.setInterval(function () {
                var $this = $('#manage-warning-list');
                $this.animate({
                    marginLeft: -widthLen
                }, 1000, function () {
                    if (num > 0) {
                        num--;
                        widthLen += width;
                    } else {
                        widthLen = 0;
                        $this.css('marginLeft', 0);
                        num = rollTimes;
                    }
                })
                if (!$('#pageSidebarMenu .sidebar-item').eq(0).hasClass('active')) {
                    window.clearInterval(controlAlarmTimerM);
                    $('#manage-warning-list').css('marginLeft', 0); // 滚动恢复初始位置
                }
            }, 3000);
        }
    }

    /**
     * 管理者登陆 获取最新告警信息
     */
    window.managerLoadAlarmData = function () {
        var data = new Date();
        var endData = data.pattern("yyyy-MM-dd hh:mm:ss");
        data.setDate(data.getDate() - 7); //获取7天前的日期
        var startData = data.pattern("yyyy-MM-dd hh:mm:ss");
        var port = 'v2/bkAlarm/alarmList',
            successFunc = function (data) {
                if (data.code == '200') {
                    window.clearInterval(controlAlarmTimerM); // 停止滚动效果
                    $('#manage-warning-list').css('marginLeft', 0); // 滚动恢复初始位置
                    var result = data.data.list;
                    if (!result) {
                        loadEmpty($('#manage-warning-list').closest('.warning-list-wrap'), '当前暂无布控告警信息', '', true, true);
                        return;
                    }
                    if (result.length > 0) {
                        var _html = '',
                            len = result.length > 20 ? 20 : result.length;
                        for (var i = 0; i < len; i++) {
                            var threshold = 0,
                                status = parseFloat(result[i].status),
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
                            if (result[i].threshold) {
                                threshold = parseFloat(result[i].threshold);
                            }
                            _html += `
                                <li class="warning-item warning-item-user-home">
                                    <div class="warning-item-content">
                                        <div class="warning-item-img-box">
                                            <div class="warning-item-img">
                                                <img src="${result[i].url || './assets/images/control/person.png'}"/>
                                                <img src="${result[i].smallHttpUrl || './assets/images/control/person.png'}"/>
                                            </div>
                                            <span class="warning-item-percent grade1">${threshold}%</span>
                                        </div>
                                        <div class="warning-item-name">
                                            <span title="${result[i].comments || '未知'}">${result[i].comments || '未知'}</span>
                                            <span class="warning-item-level${statusCls}">${statusStr}</span>
                                        </div>
                                        <p class="warning-item-time">
										<i class="aui-icon-color-default aui-icon-tree-camera"></i>
                                            <span class="warning-item-text cameral-name-text" title="${result[i].cameraName || '未知'}">${result[i].cameraName || '未知'}</span>
                                        </p>
                                        <p class="warning-item-time">
                                            <i class="aui-icon-color-default aui-icon-history"></i>
                                            <span class="warning-item-text">${result[i].alarmTime || '未知'}</span>
                                        </p>
                                    </div>
                                </li>
                            `;
                        }
                        $("#manage-warning-list").empty().html(_html);
                        // 给节点上添加数据
                        $("#manage-warning-list").find('.warning-item').each(function (index, el) {
                            $(el).data('listData', result[index]);
                        });
                        refreshHomeM();
                    } else {
                        loadEmpty($('#manage-warning-list').closest('.warning-list-wrap'), '当前暂无布控告警信息', '', true, true);
                    }
                } else {
                    loadEmpty($('#manage-warning-list').closest('.warning-list-wrap'), "当前暂无布控告警信息", "", true, true);
                }
            };
        loadData(port, true, {
            page: 1,
            size: 20,
            viewType: 4,
            showType: 2,
            status: 0,
            startTime: startData,
            endTime: endData
        }, successFunc);
    };
    // window.managerLoadAlarmData(); // 获取最新告警信息

    // 绑定查看大图代码
    $('#manage-warning-list').on('click', '.warning-item', function (evt) {
        window.clearInterval(controlAlarmTimerM); // 停止滚动效果
        var $alarm = $(this).parent(),
            alarmId = $alarm.attr('id') + '-alarm',
            index = $(this).index(),
            listData = $(this).data('listData');
        window.createBigImgMask($alarm, alarmId, index, $('#usearchImg'), evt, {
            cardImg: $(this),
            data: listData,
            html: $(changeAlarmMaskHtml(listData)),
            closeBigImg: true
        });
    });



    /**
     * 管理者登陆 左侧赋值 平均每日抓拍人脸数 平均每日告警数
     */
    function getAverageStatusData() {
        dataUnitChange($("#tabContentContainer .kpi-list-item").eq(2).find('.number'), 0);
        dataUnitChange($("#tabContentContainer .kpi-list-item").eq(3).find('.number'), 0);
        dataUnitChange($("#tabContentContainer .kpi-list-item").eq(4).find('.number'), 0);
        if (averageAlarmGAJData.length !== 0 || averageSnapshotGAJData.length !== 0) {
            if (globalMap == 'allNum') {
                dataUnitChange($("#tabContentContainer .kpi-list-item").eq(2).find('.number'), parseInt(averageSnapshotSData[0].counts));
                dataUnitChange($("#tabContentContainer .kpi-list-item").eq(4).find('.number'), parseInt(averageAlarmSData[0].counts));
                dataUnitChange($("#tabContentContainer .kpi-list-item").eq(3).find('.number'), parseInt(averageSnapshotSData[0].counts / averageSnapshotSData[0].cameraNum));
            } else {
                if (averageSnapshotGAJData.length > 0) {
                    for (var i = 0; i < averageSnapshotGAJData.length; i++) {
                        if (averageSnapshotGAJData[i].orgCode == globalCode) {
                            dataUnitChange($("#tabContentContainer .kpi-list-item").eq(2).find('.number'), parseInt(averageSnapshotGAJData[i].counts));
                            dataUnitChange($("#tabContentContainer .kpi-list-item").eq(3).find('.number'), parseInt(averageSnapshotGAJData[i].counts / averageSnapshotGAJData[i].cameraNum));
                        }
                    }
                }
                if (averageAlarmGAJData.length > 0) {
                    for (var i = 0; i < averageAlarmGAJData.length; i++) {
                        if (averageAlarmGAJData[i].orgCode == globalCode) {
                            dataUnitChange($("#tabContentContainer .kpi-list-item").eq(4).find('.number'), parseInt(averageAlarmGAJData[i].counts));
                        }
                    }
                }
            }
        } else {
            window.loadData('v2/index/getAverageStatistic', true, '', function (data) {
                if (data.code === '200') {
                    getFaceCameraData().then((res) => {
                        var result = data.data;
                        if (result && result.averageSnapList.length > 0) {
                            averageSnapshot = result.averageSnapList;
                            for (var i = 0; i < averageSnapshot.length; i++) {
                                var orgCode = averageSnapshot[i].orgCode;
                                res.forEach(element => {
                                    if (element.orgCode == orgCode) {
                                        averageSnapshot[i].cameraNum = element.counts;
                                    }
                                });
                                if (orgCode.length > 6) {
                                    averageSnapshotPCSData.push(averageSnapshot[i]);
                                } else if (orgCode.length == 6) {
                                    averageSnapshotGAJData.push(averageSnapshot[i]);
                                } else if (orgCode.length === 4) {
                                    averageSnapshotSData.push(averageSnapshot[i]);
                                }
                            }
                            // if (alarmGAJData.length === 1) {
                            //     dataUnitChange($("#tabContentContainer .kpi-list-item").eq(2).find('.number'), parseInt(averageSnapshotGAJData[0].counts));
                            // }

                            // 用户是不是市级用户 重新赋值
                            if (globalMap !== 'allNum') {
                                if (globalCode.length > 6) {
                                    averageSnapshotPCSData.map(item => {
                                        if (item.orgCode == globalCode) {
                                            dataUnitChange($("#tabContentContainer .kpi-list-item").eq(2).find('.number'), parseInt(item.counts));
                                            dataUnitChange($("#tabContentContainer .kpi-list-item").eq(3).find('.number'), parseInt(item.counts / item.cameraNum));
                                        }
                                    });
                                } else if (globalCode.length == 6) {
                                    averageSnapshotGAJData.map(item => {
                                        if (item.orgCode == globalCode) {
                                            dataUnitChange($("#tabContentContainer .kpi-list-item").eq(2).find('.number'), parseInt(item.counts));
                                            dataUnitChange($("#tabContentContainer .kpi-list-item").eq(3).find('.number'), parseInt(item.counts / item.cameraNum));
                                        }
                                    });
                                }
                            } else {
                                dataUnitChange($("#tabContentContainer .kpi-list-item").eq(2).find('.number'), parseInt(averageSnapshotSData[0].counts));
                                dataUnitChange($("#tabContentContainer .kpi-list-item").eq(3).find('.number'), parseInt(averageSnapshotSData[0].counts / averageSnapshotSData[0].cameraNum));
                            }
                        }

                        if (result && result.averageAlarmList.length > 0) {
                            averageSnapshot = result.averageAlarmList;
                            for (var i = 0; i < averageSnapshot.length; i++) {
                                var orgCode = averageSnapshot[i].orgCode;
                                if (orgCode.length > 6) {
                                    averageAlarmPCSData.push(averageSnapshot[i]);
                                } else if (orgCode.length == 6) {
                                    averageAlarmGAJData.push(averageSnapshot[i]);
                                } else if (orgCode.length === 4) {
                                    averageAlarmSData.push(averageSnapshot[i]);
                                }
                            }
                            // if (alarmGAJData.length === 1) {
                            //     dataUnitChange($("#tabContentContainer .kpi-list-item").eq(3).find('.number'), parseInt(averageAlarmGAJData[0].counts));
                            // }


                            // 用户是不是市级用户 重新赋值
                            if (globalMap !== 'allNum') {
                                if (globalCode.length > 6) {
                                    averageAlarmPCSData.map(item => {
                                        if (item.orgCode == globalCode) {
                                            dataUnitChange($("#tabContentContainer .kpi-list-item").eq(4).find('.number'), parseInt(item.counts));
                                        }
                                    });
                                } else if (globalCode.length == 6) {
                                    averageAlarmGAJData.map(item => {
                                        if (item.orgCode == globalCode) {
                                            dataUnitChange($("#tabContentContainer .kpi-list-item").eq(4).find('.number'), parseInt(item.counts));
                                        }
                                    });
                                }
                            } else {
                                dataUnitChange($("#tabContentContainer .kpi-list-item").eq(4).find('.number'), parseInt(averageAlarmSData[0].counts));
                            }
                        }
                    })
                }
            }, '', 'GET');
        }
    }

    /** 
     * 管理者登陆 左侧赋值 布控任务数据统计
     */
    function getControlStatusData() {
        dataUnitChange($("#tabContentContainer .kpi-list-item").eq(5).find('.number'), 0);
        //dataUnitChange($("#tabContentContainer .kpi-list-item").eq(6).find('.number'), 0);
        if (globalMap == 'allNum') {
            if (controlPeopleData !== '' || remainControlData !== '') {
                dataUnitChange($("#tabContentContainer .kpi-list-item").eq(5).find('.number'), controlPeopleData);
                //dataUnitChange($("#tabContentContainer .kpi-list-item").eq(6).find('.number'), remainControlData);
            } else {
                window.loadData('v2/index/getPeoplesStatistic', true, {}, function (data) {
                    if (data.code === '200') {
                        if (data.data && data.data.runningCounts) {
                            controlPeopleData = data.data.runningCounts;
                            dataUnitChange($("#tabContentContainer .kpi-list-item").eq(5).find('.number'), controlPeopleData);
                        } else {
                            controlPeopleData = 0;
                        }
                        if (data.data && data.data.remainingCounts) {
                            remainControlData = data.data.remainingCounts;
                            //dataUnitChange($("#tabContentContainer .kpi-list-item").eq(6).find('.number'), remainControlData);
                        } else {
                            remainControlData = 0;
                        }
                    }
                }, '', 'GET');
            }
        } else {
            $("#tabContentContainer .kpi-list-item").eq(5).find('.number').text('0');
            //$("#tabContentContainer .kpi-list-item").eq(6).find('.number').text('0');
        }
    }

    /**
     * 管理者登陆 左侧赋值 告警总数 今日告警总数 抓拍机数 历史抓拍人像数 今日抓拍人像数
     */
    function refreshLeftDataInfo() {
        $('#faceCameraCount').find('.snap').text('0'); // 抓拍人像清零
        $('#faceCameraCountTwo').find('.snap').text('0'); // 镜头数清零
        $('#faceCameraPer').find('.number').text('0%'); // 视频率清零
        $('#facePhotoPer').find('.number').text('0%'); // 图片率清零
        $('#alarmCount').find('.number').text('0'); // 告警总数清零
        $('#todayAlarmCount').find('.number').text('0'); // 今日告警总数清零
        if (globalMap === 'allPCSNum') {
            if (cameraGAJData.length > 0) {
                for (var i = 0; i < cameraGAJData.length; i++) {
                    if (cameraGAJData[i].orgCode == globalCode) {
                        dataUnitChange($("#faceCameraCount .snap").eq(0), parseInt(cameraGAJData[i].counts));
                        dataUnitChange($("#faceCameraCountTwo .snap").eq(1), parseInt(cameraGAJData[i].counts));
                        dataUnitChange($("#faceCameraCountTwo .snap").eq(0), parseInt(cameraGAJData[i].onlineNum));
                        $("#faceCameraPer .number").text((cameraGAJData[i].onlineRate || 0) + '%');
                        $("#facePhotoPer .number").text((cameraGAJData[i].picStatusRate || 0) + '%');
                        var remainTaskNum = parseInt(cameraGAJData[i].counts) - parseInt(cameraGAJData[i].taskNum);
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
            }
            if (alarmGAJData.length > 0) {
                for (var i = 0; i < alarmGAJData.length; i++) {
                    if (alarmGAJData[i].orgCode == globalCode) {
                        dataUnitChange($("#alarmCount .number"), parseInt(alarmGAJData[i].counts));
                        dataUnitChange($("#todayAlarmCount .number"), parseInt(alarmGAJData[i].totalToday));
                    }
                }
            }
            if (pictureGAJData.length > 0) {
                var isRefreshPictureData = true
                for (var i = 0; i < pictureGAJData.length; i++) {
                    if (pictureGAJData[i].orgCode == globalCode) {
                        isRefreshPictureData = false
                        refreshSnapTotalInfo(pictureGAJData[i].counts);
                        refreshSnapTodayInfo(pictureGAJData[i].totalToday);
                    }
                }
                if (isRefreshPictureData) {
                    refreshSnapTotalInfo(0); // 历史抓拍人像滚动清零
                    refreshSnapTodayInfo(0); // 今日抓拍人像滚动清零
                }
            }
        } else {
            if (cameraSData.length > 0) {
                dataUnitChange($("#faceCameraCount .snap").eq(0), parseInt(cameraSData[0].counts));
                dataUnitChange($("#faceCameraCountTwo .snap").eq(1), parseInt(cameraSData[0].counts));
                dataUnitChange($("#faceCameraCountTwo .snap").eq(0), parseInt(cameraSData[0].onlineNum));
                $("#faceCameraPer .number").text((cameraSData[0].onlineRate || 0) + '%');
                $("#facePhotoPer .number").text((cameraSData[0].picStatusRate || 0) + '%');
                var remainTaskNum = parseInt(cameraSData[0].counts) - parseInt(cameraSData[0].taskNum);
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
            if (alarmSData.length > 0) {
                dataUnitChange($("#alarmCount .number"), parseInt(alarmSData[0].counts));
                dataUnitChange($("#todayAlarmCount .number"), parseInt(alarmSData[0].totalToday));
            }
            if (pictureSData.length > 0) {
                refreshSnapTotalInfo(pictureSData[0].counts);
                refreshSnapTodayInfo(pictureSData[0].totalToday);
            }
        }
    }

    /**
     * 管理者登陆 地图部分 辖区选择进入
     *  @param { string } code // 根据orgid获取的code值
     */
    function setIntoArea(code) {
        window.setTimeout(function () {
            var mapIframe = document.getElementById('map_iframe_index'),
                targetOrigin = mapUrl + 'peopleCity.html?orgid=44031',
                targetOpts = {
                    type: 'changeArea',
                    mydata: code
                };
            mapIframe.contentWindow.postMessage(targetOpts, targetOrigin);
        }, 300)
    }

    /**
     * 管理者登陆 地图部分 左侧下拉框设置区域
     */
    function getCodeOrgId(orgId) {
        window.loadData('index/getCodeAndOrgid', true, {
            orgid: orgId
        }, function (data) {
            if (data.code === '000') {
                var result = data.result,
                    code = result.code;
                // 重新设置左侧数据
                if (result.orgid == '10') {
                    globalCode = '';
                    globalMap = 'allNum';
                } else {
                    globalCode = code;
                    globalMap = 'allPCSNum';
                }
                setIntoArea(code); // 定位地图区域
                refreshLeftDataInfo(); // 刷新 告警总数 今日告警总数 抓拍机数 历史抓拍人像数 今日抓拍人像数
                getAverageStatusData(); // 刷新 平均告警&&平均抓拍
                getControlStatusData(); // 刷新 布控数据

                // 重新设置地图数据
                var $activeItem = $("#tabContentContainer .kpi-list").find('li').filter('.active');
                if ($activeItem.length > 0) {
                    // activeItemID = $activeItem.attr('id');
                    // $('#' + activeItemID).click(); // 左侧选中数据 
                    $($activeItem).click();
                } else if ($("#facePictureTotal .head-list").eq(0).hasClass('active')) {
                    $("#facePictureTotal .head-list").eq(0).click(); // 历史抓拍人脸数
                } else if ($("#facePictureTotal .head-list").eq(1).hasClass('active')) {
                    $("#facePictureTotal .head-list").eq(1).click(); // 今日抓拍人脸数
                }
            }
        });
    }

    /**
     * 管理者登陆 地图部分 地图数据传输
     */
    function setMapNum(result, type, name, dataType, isSnapshot) {
        var mapIframe = document.getElementById('map_iframe_index'),
            targetOrigin = mapUrl + 'peopleCity.html?orgid=44031';
        var data = [];
        if (result && result.length) {
            for (var i = 0; i < result.length; i++) {
                if (isSnapshot) {
                    data.push({
                        DM: result[i].orgCode,
                        num: result[i].counts,
                        num1: result[i].counts - result[i].taskNum,
                    });
                } else {
                    if (dataType == 'today') {
                        data.push({
                            DM: result[i].orgCode,
                            num: result[i].totalToday
                        });
                    } else if (dataType == 'cameraPer') {
                        data.push({
                            DM: result[i].orgCode,
                            num: result[i].onlineRate ? result[i].onlineRate + '%' : '0%'
                        });
                    } else if (dataType == 'photoPer') {
                        data.push({
                            DM: result[i].orgCode,
                            num: result[i].picStatusRate ? result[i].picStatusRate + '%' : '0%'
                        });
                    } else if (dataType == 'allCamera') {
                        data.push({
                            DM: result[i].orgCode,
                            num: result[i].onlineNum,
                            num1: result[i].counts,
                        });
                    } else if (dataType == 'averageCamera') {
                        data.push({
                            DM: result[i].orgCode,
                            num: parseInt(result[i].counts / result[i].cameraNum) || 0
                        });
                    } else {
                        data.push({
                            DM: result[i].orgCode,
                            num: result[i].counts
                        });
                    }
                }
            }
        }
        var targetOpts = {
            type: type,
            FJDM: globalCode,
            mydata: {
                type: 'blue',
                name: name,
                data: data
            }
        };
        // console.log(targetOpts);
        window.setTimeout(function () {
            mapIframe.contentWindow.postMessage(targetOpts, targetOrigin);
            //clickIntoMap = true;
        }, 100);
    }

    // 管理者登陆 地图左侧统计数据 点击子项 刷新地图上的统计数据
    $("#tabContentContainer .kpi-list").find("li").click(function (e) {
        e.stopPropagation();
        $(this).addClass('active').siblings('.active').removeClass('active');
        $(this).parent('.kpi-list').siblings('.kpi-list').find('li').addClass('active').siblings('.active').removeClass('active');
        $("#facePictureTotal .head-list").removeClass('active');
        var id = $(this)[0].id;
        var index = $(this).index();

        if (id === 'faceCameraCount') { // 抓拍机数
            if (cameraGAJData.length > 0 || cameraPCSData.length > 0) {
                if (globalMap == 'allPCSNum') {
                    var PCSData = [];
                    for (var i = 0; i < cameraPCSData.length; i++) {
                        if (cameraPCSData[i].orgCode.indexOf(globalCode) >= 0) {
                            PCSData.push(cameraPCSData[i]);
                        }
                    }
                    setMapNum(PCSData, 'allPCSNum', '抓拍机数');
                } else {
                    setMapNum(cameraGAJData, 'allNum', '抓拍机数', '', 'snapshotData');
                }
            } else {
                var globalData = '';
                setMapNum(globalData, 'allNum', '抓拍机数');
            }
        } else if (id === "faceCameraCountTwo") {
            if (cameraGAJData.length > 0 || cameraPCSData.length > 0) {
                if (globalMap == 'allPCSNum') {
                    var PCSData = [];
                    for (var i = 0; i < cameraPCSData.length; i++) {
                        if (cameraPCSData[i].orgCode.indexOf(globalCode) >= 0) {
                            PCSData.push(cameraPCSData[i]);
                        }
                    }
                    setMapNum(PCSData, 'allPCSNum', '镜头总数');
                } else {
                    setMapNum(cameraGAJData, 'allNum', '镜头在线数/镜头总数', 'allCamera');
                }
            } else {
                var globalData = '';
                setMapNum(globalData, 'allNum', '镜头总数');
            }
        } else if (id === 'faceCameraPer') {
            if (cameraGAJData.length > 0) {
                if (globalMap == 'allPCSNum') {
                    var PCSData = [];
                    for (var i = 0; i < cameraPCSData.length; i++) {
                        if (cameraPCSData[i].orgCode.indexOf(globalCode) >= 0) {
                            PCSData.push(cameraPCSData[i]);
                        }
                    }
                    setMapNum(PCSData, 'allPCSNum', '视频流在线率', 'cameraPer');
                } else {
                    setMapNum(cameraGAJData, 'allNum', '视频流在线率', 'cameraPer');
                }
            } else {
                var globalData = '';
                setMapNum(globalData, 'allNum');
            }
        } else if (id === 'facePhotoPer') {
            if (cameraGAJData.length > 0) {
                if (globalMap == 'allPCSNum') {
                    var PCSData = [];
                    for (var i = 0; i < cameraPCSData.length; i++) {
                        if (cameraPCSData[i].orgCode.indexOf(globalCode) >= 0) {
                            PCSData.push(cameraPCSData[i]);
                        }
                    }
                    setMapNum(PCSData, 'allPCSNum', '图片流在线率', 'photoPer');
                } else {
                    setMapNum(cameraGAJData, 'allNum', '图片流在线率', 'photoPer');
                }
            } else {
                var globalData = '';
                setMapNum(globalData, 'allNum');
            }
        } else if (index === 0 || index === 1) { // 告警总数
            if (alarmGAJData.length > 0 || alarmPCSData.length > 0) {
                if (globalMap == 'allPCSNum') {
                    var PCSData = [];
                    for (var i = 0; i < alarmPCSData.length; i++) {
                        if (alarmPCSData[i].orgCode.indexOf(globalCode) >= 0) {
                            PCSData.push(alarmPCSData[i]);
                        }
                    }
                    if (id == 'todayAlarmCount') {
                        setMapNum(PCSData, 'allPCSNum', '今日告警数', 'today');
                    } else {
                        setMapNum(PCSData, 'allPCSNum', '告警总数');
                    }
                } else {
                    if (id == 'todayAlarmCount') {
                        setMapNum(alarmGAJData, 'allNum', '今日告警数', 'today');
                    } else {
                        setMapNum(alarmGAJData, 'allNum', '告警总数');
                    }
                }
            } else {
                var globalData = '';
                setMapNum(globalData, 'allNum');
            }
        } else if (index === 2) { // 平均每日抓拍人脸数
            if (averageSnapshotGAJData.length > 0 || averageSnapshotPCSData.length > 0) {
                if (globalMap == 'allPCSNum') {
                    var PCSData = [];
                    for (var i = 0; i < averageSnapshotPCSData.length; i++) {
                        if (averageSnapshotPCSData[i].orgCode.indexOf(globalCode) >= 0) {
                            PCSData.push(averageSnapshotPCSData[i]);
                        }
                    }
                    setMapNum(PCSData, 'allPCSNum', '平均每日抓拍人脸数');
                } else {
                    setMapNum(averageSnapshotGAJData, 'allNum', '平均每日抓拍人脸数');
                }
            } else {
                var globalData = '';
                setMapNum(globalData, 'allNum', '平均每日抓拍人脸数');
            }
        } else if (index === 4) { // 平均每日告警
            if (averageAlarmGAJData.length > 0 || averageAlarmPCSData.length > 0) {
                if (globalMap == 'allPCSNum') {
                    var PCSData = [];
                    for (var i = 0; i < averageAlarmPCSData.length; i++) {
                        if (averageAlarmPCSData[i].orgCode.indexOf(globalCode) >= 0) {
                            PCSData.push(averageAlarmPCSData[i]);
                        }
                    }
                    setMapNum(PCSData, 'allPCSNum', '平均每日告警');
                } else {
                    setMapNum(averageAlarmGAJData, 'allNum', '平均每日告警');
                }
            } else {
                var globalData = '';
                setMapNum(globalData, 'allNum', '平均每日告警');
            }
        } else if (index === 3) { //平均每路镜头每日抓拍数 
            if (averageSnapshotGAJData.length > 0 || averageSnapshotPCSData.length > 0) {
                if (globalMap == 'allPCSNum') {
                    var PCSData = [];
                    for (var i = 0; i < averageSnapshotPCSData.length; i++) {
                        if (averageSnapshotPCSData[i].orgCode.indexOf(globalCode) >= 0) {
                            PCSData.push(averageSnapshotPCSData[i]);
                        }
                    }
                    setMapNum(PCSData, 'allPCSNum', '平均每路镜头每日抓拍数', 'averageCamera');
                } else {
                    setMapNum(averageSnapshotGAJData, 'allNum', '平均每路镜头每日抓拍数', 'averageCamera');
                }
            } else {
                var globalData = '';
                setMapNum(globalData, 'allNum', '平均每日抓拍人脸数', 'averageCamera');
            }
        } else {
            if (globalMap == 'allPCSNum') {
                var PCSData = '';
                setMapNum(PCSData, 'allPCSNum');
            } else {
                var globalData = '';
                setMapNum(globalData, 'allNum');
            }
        }
    });

    // 管理者登陆 点抓拍机数 刷新地图上的统计数据
    $("#facePictureTotal .head-list").click(function () {
        $(this).addClass('active').siblings('.active').removeClass('active');
        $('#tabContentContainer .kpi-list').find('li').removeClass('active');
        if ($(this).hasClass('kpi-data1')) {
            var snapshotStyle = 'old';
        } else {
            var snapshotStyle = 'today';
        }

        if (pictureGAJData.length > 0 || picturePCSData.length > 0) {
            if (globalMap == 'allPCSNum') {
                var PCSData = [];
                for (var i = 0; i < picturePCSData.length; i++) {
                    if (picturePCSData[i].orgCode.indexOf(globalCode) >= 0) {
                        PCSData.push(picturePCSData[i]);
                    }
                }
                if (snapshotStyle == 'today') {
                    setMapNum(PCSData, 'allPCSNum', '今日抓拍人脸数', snapshotStyle);
                } else {
                    setMapNum(PCSData, 'allPCSNum', '历史抓拍人脸数');
                }
            } else {
                if (snapshotStyle == 'today') {
                    setMapNum(pictureGAJData, 'allNum', '今日抓拍人脸数', snapshotStyle);
                } else {
                    setMapNum(pictureGAJData, 'allNum', '历史抓拍人脸数');
                }
            }
        } else {
            var globalData = '';
            setMapNum(globalData, 'allNum');
        }
    });

    // 管理者登陆 切换机构下拉列表 设置选中机构的id 以供后面获取（逻辑问题有待修改，地图与下拉未绑定）
    $(document).on("click", "#orgSelectMenu-menu .ui-menu-item", function () {
        var $this = $(this),
            $selectMenuContainer = $this.closest('.ui-menu'),
            containerIndex = $selectMenuContainer.data('selectIndex');
        $selectMenuContainer.data('selectIndex', $this.index());
        // 应当判断当前点击是否会重复点击
        if (containerIndex !== $this.index() || containerIndex === 0) {
            currentOrgId = orgInfoArray[$this.index()].orgId;
            $("#orgSelectParent").attr("orgid", currentOrgId);
            if (currentOrgId === '10') {
                globalMap = 'allNum';
            } else {
                globalMap = 'allPCSNum';
            }
            getCodeOrgId(currentOrgId); // 地图定位 globalCode获取
        }
    });

    // 管理者登陆 接受地图回传数据（逻辑问题有待修改，地图与下拉未绑定）
    window.addEventListener('message', function (ev) {
        var data = ev.data,
            code = data.mydata,
            $dashboard = $('body').find('.data-dashboard');
        if (data.type === 'PCSDM' && $dashboard.length === 0) { // 判断地图回传回来的数据是分局点击下
            globalCode = code;
            globalMap = 'allPCSNum';
            // 下拉框赋值 data.scroll == "yes"为了区分进入区级是滚动还是点击
            window.loadData('index/getCodeAndOrgid', true, {
                code: globalCode
            }, function (data) {
                if (data.code === '000') {
                    globalOrgId = data.result.orgid;
                    $('#orgSelectMenu').val(globalOrgId);
                    $('#orgSelectMenu').selectmenu('refresh');
                    // 重新设置地图数据
                    var $select = $('#orgSelectMenu').find('[orgid="' + globalOrgId + '"]'),
                        selectIndex = $select.index();
                    var $clickWrap = $('#orgSelectMenu-menu').find('.ui-menu-item'),
                        $clickNode = $clickWrap.eq(selectIndex);
                    $clickNode.trigger('click');
                }
            });
        } else if (ev.data === 'FJDM') { // 判断地图回传回来的数据是市级
            globalCode = '4403';
            globalMap = 'allNum';
            globalOrgId = '10';
            $('#orgSelectMenu').val(globalOrgId); // 下拉框赋值
            $('#orgSelectMenu').selectmenu('refresh');
            var $clickWrap = $('#orgSelectMenu-menu').find('.ui-menu-item'),
                $clickNode = $clickWrap.eq(0);
            $clickNode.click();
        } else if (data === 'initMap?44031') { // 判断是否为初始化地图
            // 初始化地图 区级登陆跳转到区的数据
            window.setTimeout(function () {
                // 用户是不是市级用户 重新定位
                if (globalMap !== 'allNum') {
                    setIntoArea(globalCode); // 定位地图区域
                }
                $('#tabContentContainer .kpi-list').find('.active').click(); // 初始化地图数据
                $('#databash').find('.databoard-loading-box').addClass('hide'); // 数据看板加载效果取消
            }, 1000)
        } else if (data.key) {
            //detailContent是设备详情
            if (data.key != 'detailContent') {
                var cameraIDArr = [];
                for (var i = 0; i < data.data.length; i++) {
                    cameraIDArr.push(data.data[i].id); // 摄像头id数组赋值
                }
                showMapVideo(data.key, data.data, cameraIDArr);
            } else {
                showDeviceDetail(data.data.id);
            }
        }
    });

    // 管理者登陆 数据看板 按钮点击事件
    $('#databash').on('click', function () {
        var url = "./facePlatform/data-dashboard.html?dynamic=" + Global.dynamic,
            thisCls = $(this).find('.databoard-loading-box').hasClass('hide');
        // 判定首页地图是否加载完毕
        if (!thisCls) {
            return;
        }
        layer.open({
            type: 1,
            title: '数据看板',
            maxmin: true,
            area: ['100%', '100%'],
            zIndex: 1030,
            success: function ($layerContainer, index) {
                $layerContainer.addClass('data-dashboard');
                $layerContainer.find('.layui-layer-title').addClass('hide');
                loadPage($layerContainer.find('.layui-layer-content'), url);
                var $minBtn = $layerContainer.find('.layui-layer-min'),
                    $max = $minBtn.next(),
                    $close = $max.next();
                $minBtn.removeClass().addClass('aui-icon-color-default aui-icon-minus hide');
                $max.removeClass().addClass('aui-icon-color-default aui-icon-fullScreen hide');
                $close.removeClass().addClass('aui-icon-color-default aui-icon-not-through');
                // 最小化按钮点击事件绑定
                $minBtn.on('click', function () {
                    layer.min(index);
                    $layerContainer.find('.layui-layer-title').removeClass('hide');
                    $layerContainer.prev().addClass('hide');
                    $minBtn.parent().addClass('min');
                });
                // 关闭按钮点击事件绑定
                $close.on('click', function () {
                    layer.close(index);
                });
                // 最大化按钮事件绑定
                $max.on('click', function () {
                    layer.full(index);
                    $layerContainer.find('.layui-layer-title').addClass('hide');
                });
            }
        });
    });

    // 管理者登陆 导航栏 首页图标 点击事件
    $('#pageSidebarMenu .aui-icon-home-2').closest('.sidebar-item').on('click', function () {
        window.managerLoadAlarmData(); // 获取最新告警信息
    })

    //统计列表开始
    //考核报表数据
    var configKHData = {
        roleType: 1,
        orgId: '10',
        startTime: '',
        endTime: '',
    }

    //异常报表数据
    var configYCData = {
        roleType: 1,
        orgId: '10',
        startTime: '',
        endTime: ''
    }

    //布控告警报表数据
    var configGJData = {
        orgId: '10',
        startTime: '',
        endTime: ''
    }

    //厂家报表数据
    var configCJData = {
        startTime: '',
        endTime: ''
    }

    //运维统计数据
    var configYWData = {
        orgId: '10',
        cameraName: '',
        gbCode: '',
        onlineStatus: '',
        picStatus: '',
        captureNum: '',
        startTime: '',
        endTime: '',
        page: 1,
        size: 10
    };

    var configRXData = {
        starttime: '',
        endtime: '',
    };

    //考核显示
    function parmasKHMatter(value, row, index) {
        return value;
    }

    //静态和动态的title显示
    function parmasMatter(value, row, index) {
        var span = document.createElement('span');
        span.setAttribute('title', value);
        span.innerHTML = value;
        return span.outerHTML;
    }

    //考核转换
    function commonGetKHName(key) {
        let keyName = '';
        switch (key) {
            case 'accountNum':
                keyName = '账号总数';
                break;
            case 'loginPersonNum':
                keyName = '登录总人数';
                break;
            case 'notUseAccountNum':
                keyName = '未使用人数';
                break;
            case 'loginAllNum':
                keyName = '登录总次数';
                break;
            case 'staticNum':
                keyName = '静态人像比对次数';
                break;
            case 'dynamicNum':
                keyName = '动态人像比对次数';
                break;
            case 'applyAllNum':
                keyName = '权限申请总次数';
                break;
            case 'applyLaNum':
                keyName = '立案申请（次）';
                break;
            case 'applyJqNum':
                keyName = '警情申请（次）';
                break;
            case 'applyZaNum':
                keyName = '专项工作申请（次）';
                break;
            case 'applyXbNum':
                keyName = '协办申请（次）';
                break;
            case 'applyEmergentNum':
                keyName = '紧急警务申请（次）';
                break;
            case 'applySolvecaseNum':
                keyName = '权限申请破案数';
                break;
            case 'caseUploadNum':
                keyName = '案件上传数';
                break;
            case 'feedbackNum':
                keyName = '成果反馈数';
                break;
            case 'date':
                keyName = '日期';
                break;
        }

        return keyName;
    }

    //异常转换
    function commonGetYCName(key) {
        let keyName = '';
        switch (key) {
            case 'untimelyMakeUp':
                keyName = '未补办手续数';
                break;
            case 'overdueUnused':
                keyName = '超时未使用数';
                break;
            case 'abnormalLogin':
                keyName = '异常登录数';
                break;
            case 'abnormalLoginChecked':
                keyName = '账号审核通过数';
                break;
            case 'abnormalUsed':
                keyName = '异常使用数';
                break;
            case 'abnormalUsedChecked':
                keyName = '异常使用账号（审核通过数）';
                break;
            case 'abnormalCase':
                keyName = '案件查询异常数';
                break;
            case 'abnormalCaseChecked':
                keyName = '案件查询异常（审核通过数）';
                break;
            case 'repeatCase':
                keyName = '重复申请数';
                break;
            case 'repeatCaseChecked':
                keyName = '案件重复申请异常（审核通过数）';
                break;
            case 'idcardWarnCase':
                keyName = '身份证撞线预警数';
                break;
            case 'idcardWarnCaseChecked':
                keyName = '撞线预警案件数（身份证审核通过数）';
                break;
            case 'imgWarnCase':
                keyName = '撞线预警案件数（照片）';
                break;
            case 'imgWarnCaseChecked':
                keyName = '撞线预警案件数（照片审核通过数）';
                break;
            case 'queryInconsistent':
                keyName = '查询对象与申请不符预警数';
                break;
            case 'queryInconsistentChecked':
                keyName = '查询对象与申请不符预警数（审核通过数）';
                break;
            case 'useCountIsZero':
                keyName = '使用次数为0';
                break;
        }

        return keyName;
    }

    //布控告警转换
    function commonGetGJName(key) {
        let keyName = '';
        switch (key) {
            case 'taskCount':
                keyName = '任务数';
                break;
            case 'alarmCount':
                keyName = '告警数';
                break;
            case 'bkPersonCount':
                keyName = '布控人数';
                break;
            case 'repealPersonCount':
                keyName = '撤控人数';
                break;
            case 'validBkPerson':
                keyName = '有效布控人数';
                break;
        }

        return keyName;
    }

    /**
     * 获取库列表
     * @param {*} $modal 弹窗
     */
    function getAllOrgId($modal) {
        $container = $modal.find(".snapStatisticOrg.more").find(".selectpicker");
        var port = 'v2/org/getOrgInfos',
            data = {
                orgType: 2,
                userType: 2,
                returnType: 3
            };
        var successFunc = function (data) {
            if (data.code === '200') {
                var result = data.data;
                // 对返回数组进行排序 市局排在最上层
                for (var i = 0; i < result.length; i++) {
                    if (result[i].parentId === null) {
                        arrayBox = result[i];
                        result.splice(i, 1);
                        result.splice(0, 0, arrayBox);
                    }
                }
                if (result) { // 存在返回值
                    itemHtml = `<option class="option-item" orgid="${result[0].orgId}" value="${result[0].orgId}" selected>${result[0].orgName}</option>`;
                    for (var i = 1; i < result.length; i++) {
                        itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                    }
                    $container.each((index, dom) => {
                        $(dom).html(itemHtml); // 元素赋值
                        $(dom).prop('disabled', false); // 非不可选
                        $(dom).selectpicker('refresh');
                    })
                } else {
                    // $container.prop('disabled', true);
                    // $container.val(null);
                    // $container.selectpicker('refresh');
                    $container.each((dom) => {
                        $(dom).prop('disabled', true);
                        $(dom).val(null);
                        $(dom).selectpicker('refresh');
                    })
                }
            } else {
                $container.each((dom) => {
                    $(dom).prop('disabled', true);
                    $(dom).val(null);
                    $(dom).selectpicker('refresh');
                })
                // $container.prop('disabled', true);
                // $container.val(null);
                // $container.selectpicker('refresh');
            }
        };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };

    /**
    * 获取库列表
    * @param { $container } $container // 目标容器
    */
    function getAllOrgIdOpe($container, orgId, orgType, treeType) {
        var port = 'v2/org/getOrgInfos',
            data = {
                orgId: orgId ? orgId : '',
                orgType: orgType ? orgType : 1,
                userType: 2,
                returnType: 3,
                treeType: treeType ? treeType : 1
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    var result = data.data;
                    if ($container.attr("id") == 'orgIdDataYW') {
                        $container.closest('aui-col-16').find('button').empty()
                    }
                    if (!orgType || orgType == 1) {
                        // 对返回数组进行排序 市局排在最上层
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].parentId === null) {
                                arrayBox = result[i];
                                result.splice(i, 1);
                                result.splice(0, 0, arrayBox);
                            }
                        }
                    }
                    if (result) {
                        var itemHtml = `<option class="option-item" orgid="${result[0].orgId}" value="${result[0].orgId}" selected>${result[0].orgName}</option>`;
                        for (var i = 1; i < result.length; i++) {
                            itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                        }
                        $container.html(itemHtml);
                        $container.selectpicker('refresh');
                    }
                } else {
                    warning.say(data.msg);
                }
            };
        loadData(port, true, data, successFunc, undefined, 'GET');
    }

    /**
     * 列表生成 考核列表
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} data 过滤条件对象
     */
    function createSnapKHList($table, first, configData) {
        showLoading($('#snapMoreTypeModal #snapMoreTypeKH'));
        var $thead = $table.find('thead');
        var $tbody = $table.find('tbody');
        var port = 'v3/report/reportStatistic',
            successFunc = function (data) {
                $thead.empty();
                $tbody.empty();
                hideLoading($('#snapMoreTypeModal #snapMoreTypeKH'));
                //考核列表已经加载切换tab不必重复加载
                $("#snapMoreTypeModal").data({
                    KH: true
                })

                if (data.code === '200' && data.data && data.data.length > 0) {
                    $("#snapStatisticLoadKHEmpty").addClass("hide");
                    var result = data.data;
                    $table.data({
                        'result': result
                    });

                    var dataList = ['accountNum', 'loginPersonNum', 'notUseAccountNum', 'loginAllNum', 'staticNum', 'dynamicNum', 'applyAllNum', 'applyLaNum', 'applyXbNum', 'applyJqNum', 'applyZaNum', 'applyEmergentNum', 'applySolvecaseNum', 'caseUploadNum', 'feedbackNum'];
                    var dataListWidth = [100, 100, 100, 100, 130, 130, 150, 150, 150, 150, 150, 150, 130, 100, 100];
                    // for (key in result[0]) {
                    //     if (key != 'orgId' && key != 'orgName') {
                    //         dataList.push(key);
                    //     }
                    // }
                    // var totalWidth = $("#snapStatisticModal .search-tab-box").innerWidth()
                    // var perWidth = 0
                    // if ((dataList.length + 1) * 120 < totalWidth) {
                    //     perWidth = parseFloat(totalWidth / (dataList.length + 1))
                    // }

                    var columnsArr = [
                        // {
                        //     field: 'field0',
                        //     title: "",
                        //     width: 50
                        // },
                        {
                            field: 'field1',
                            title: "机构名称",
                            width: 150,
                            formatter: parmasMatter
                        }
                    ],
                        dataArr = [];

                    //dataList.sort((a, b) => a.localeCompare(b));
                    for (var i = 0; i < dataList.length; i++) {
                        var columnsArrObj = {};
                        columnsArrObj.field = `field${i + 2}`;

                        var keyName = '';

                        commonGetKHName(dataList[i]);

                        columnsArrObj.title = `<span title="${commonGetKHName(dataList[i])}">${commonGetKHName(dataList[i])}</span>`;
                        columnsArrObj.width = dataListWidth[i];
                        columnsArrObj.formatter = parmasKHMatter;
                        columnsArr.push(columnsArrObj);
                    }

                    // 添加列表
                    for (var j = 0; j < result.length; j++) {
                        var dataArrObj = {};
                        dataArrObj.field0 = `<a class="detail-icon khDataList" href="#" orgId="${result[j].orgId}"><i class="fa fa-plus"></i></a>`;
                        dataArrObj.field1 = `${result[j].orgName}`;

                        for (var k = 0; k < dataList.length; k++) {
                            var data = parseFloat(result[j][dataList[k]] || 0).toLocaleString();
                            //class顺序不要更改，后续有判断 ‘text-link ${dataList[k]}’
                            if (dataList[k] == "caseUploadNum" || dataList[k] == "feedbackNum") {
                                dataArrObj[`field${k + 2}`] = `<span class="${dataList[k]}" title="${data}">${data}</span>`;
                            } else {
                                dataArrObj[`field${k + 2}`] = `<span class="${data == '0' ? '' : 'text-link'} ${dataList[k]}" title="${data}">${data}</span>`;
                            }
                        }
                        dataArr.push(dataArrObj);
                    }
                    var modalTableHeight = $("#snapMoreTypeModal .popup-body").height() - $("#snapMoreTypeKH .search-terms-box").height();
                    $table.bootstrapTable("destroy").bootstrapTable({
                        height: modalTableHeight,
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: true,
                        detailView: false,
                        fixedNumber: 1
                    });
                    $table.find("tbody tr").each((index, $dom) => {
                        $($dom).data("listData", result[index]);
                    })
                    $("#snapMoreTypeKH").data("listData", result);
                } else {
                    $("#snapStatisticLoadKHEmpty").removeClass("hide");
                    $table.bootstrapTable("destroy");
                    if (data.code != '200') {
                        loadEmpty($("#snapStatisticLoadKHEmpty"), "暂无检索结果", data.message);
                    } else {
                        loadEmpty($("#snapStatisticLoadKHEmpty"), "暂无检索数据", "");
                    }
                    //warningTip.say(data.message);
                }
            };
        loadData(port, true, configData, successFunc);
    };

    /**
     * 列表生成 异常列表
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} data 过滤条件对象
     */
    function createSnapYCList($table, first, configData) {
        showLoading($('#snapMoreTypeModal #snapMoreTypeYC'));
        var $thead = $table.find('thead');
        var $tbody = $table.find('tbody');
        var port = 'v3/errReport/errReportStatistic',
            successFunc = function (data) {
                $thead.empty();
                $tbody.empty();
                hideLoading($('#snapMoreTypeModal #snapMoreTypeYC'));
                //异常列表已经加载切换tab不必重复加载
                $("#snapMoreTypeModal").data({
                    YC: true
                })

                if (data.code === '200' && data.data && data.data.length > 0) {
                    $("#snapStatisticLoadYCEmpty").addClass("hide");
                    var result = data.data;
                    $table.data({
                        'result': result
                    });

                    var dataList = ['untimelyMakeUp', 'abnormalLogin', 'abnormalCase', 'repeatCase', 'queryInconsistent', 'idcardWarnCase', 'useCountIsZero'];
                    // var totalWidth = $("#snapMoreTypeModal .search-tab-box").innerWidth()
                    // var perWidth = 0
                    // if ((dataList.length + 1) * 120 < totalWidth) {
                    //     perWidth = parseFloat(totalWidth / (dataList.length + 1))
                    // }

                    var columnsArr = [
                        {
                            field: 'field1',
                            title: "机构名称",
                            width: 150,
                            formatter: parmasMatter
                        }
                    ],
                        dataArr = [];

                    for (var i = 0; i < dataList.length; i++) {
                        var columnsArrObj = {};
                        columnsArrObj.field = `field${i + 2}`;

                        var keyName = '';

                        commonGetYCName(dataList[i]);

                        columnsArrObj.title = `<span title="${commonGetYCName(dataList[i])}">${commonGetYCName(dataList[i])}</span>`;
                        columnsArrObj.width = 120;
                        columnsArrObj.formatter = parmasKHMatter;
                        columnsArr.push(columnsArrObj);
                    }

                    // 添加列表
                    for (var j = 0; j < result.length; j++) {
                        var dataArrObj = {};
                        dataArrObj.field1 = `${result[j].orgName}`;

                        for (var k = 0; k < dataList.length; k++) {
                            var data = parseFloat(result[j][dataList[k]] || 0).toLocaleString();
                            //class顺序不要更改，后续有判断 ‘text-link ${dataList[k]}’
                            dataArrObj[`field${k + 2}`] = `<span class="${data == '0' ? '' : 'text-link'} ${dataList[k]}" title="${data || 0}">${data || 0}</span>`;
                        }
                        dataArr.push(dataArrObj);
                    }
                    var modalTableHeight = $("#snapMoreTypeModal .popup-body").height() - $("#snapMoreTypeYC .search-terms-box").height();
                    $table.bootstrapTable("destroy").bootstrapTable({
                        height: modalTableHeight,
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: true,
                        detailView: false,
                        fixedNumber: 1
                    });

                    $table.find("tbody tr").each((index, $dom) => {
                        $($dom).data("listData", result[index]);
                    })
                    $("#snapMoreTypeYC").data("listData", result);
                } else {
                    $("#snapStatisticLoadYCEmpty").removeClass("hide");
                    $table.bootstrapTable("destroy");
                    if (data.code != '200') {
                        loadEmpty($("#snapStatisticLoadYCEmpty"), "暂无检索结果", data.message);
                    } else {
                        loadEmpty($("#snapStatisticLoadYCEmpty"), "暂无检索数据", "");
                    }
                    //warningTip.say(data.message);
                }
            };
        loadData(port, true, configData, successFunc);
    };

    /**
     * 列表生成 布控告警列表
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} data 过滤条件对象
     */
    function createSnapGJList($table, first, configData) {
        showLoading($('#snapMoreTypeModal #snapMoreTypeGJ'));
        var $thead = $table.find('thead');
        var $tbody = $table.find('tbody');
        var port = 'v3/report/getTaskAlarmStatistic',
            successFunc = function (data) {
                $thead.empty();
                $tbody.empty();
                hideLoading($('#snapMoreTypeModal #snapMoreTypeGJ'));

                //异常列表已经加载切换tab不必重复加载
                $("#snapMoreTypeModal").data({
                    GJ: true
                })

                if (data.code === '200' && data.data && data.data.length > 0) {
                    $("#snapStatisticLoadGJEmpty").addClass("hide");
                    var result = data.data;
                    $table.data({
                        'result': result
                    });

                    var dataList = ['taskCount', 'alarmCount', 'bkPersonCount', 'repealPersonCount', 'validBkPerson'];

                    var columnsArr = [
                        {
                            field: 'field1',
                            title: "机构名称",
                            width: 150,
                            formatter: parmasMatter
                        }
                    ],
                        dataArr = [];

                    for (var i = 0; i < dataList.length; i++) {
                        var columnsArrObj = {};
                        columnsArrObj.field = `field${i + 2}`;

                        var keyName = '';

                        commonGetGJName(dataList[i]);

                        columnsArrObj.title = `<span title="${commonGetGJName(dataList[i])}">${commonGetGJName(dataList[i])}</span>`;
                        columnsArrObj.width = 120;
                        columnsArrObj.formatter = parmasKHMatter;
                        columnsArr.push(columnsArrObj);
                    }

                    // 添加列表
                    for (var j = 0; j < result.length; j++) {
                        var dataArrObj = {};
                        dataArrObj.field1 = `${result[j].orgName}`;

                        for (var k = 0; k < dataList.length; k++) {
                            var data = parseFloat(result[j][dataList[k]] || 0).toLocaleString();
                            //class顺序不要更改，后续有判断 ‘text-link ${dataList[k]}’
                            dataArrObj[`field${k + 2}`] = `<span class="${dataList[k]}" title="${data || 0}">${data || 0}</span>`;
                        }
                        dataArr.push(dataArrObj);
                    }
                    var modalTableHeight = $("#snapMoreTypeModal .popup-body").height() - $("#snapMoreTypeGJ .search-terms-box").height();
                    $table.bootstrapTable("destroy").bootstrapTable({
                        height: modalTableHeight,
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: true,
                        detailView: false,
                        fixedNumber: 1
                    });

                    $table.find("tbody tr").each((index, $dom) => {
                        $($dom).data("listData", result[index]);
                    })
                    $("#snapMoreTypeGJ").data("listData", result);
                } else {
                    $("#snapStatisticLoadGJEmpty").removeClass("hide");
                    $table.bootstrapTable("destroy");
                    if (data.code != '200') {
                        loadEmpty($("#snapStatisticLoadGJEmpty"), "暂无检索结果", data.message);
                    } else {
                        loadEmpty($("#snapStatisticLoadGJEmpty"), "暂无检索数据", "");
                    }
                    //warningTip.say(data.message);
                }
            };
        loadData(port, true, configData, successFunc);
    };

    /**
     * 列表生成 厂家列表1
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     */
    function createSnapCJList($table, first, configData) {
        showLoading($('#snapMoreTypeModal #snapMoreTypeCJ'));
        var $thead = $table.find('thead');
        var $tbody = $table.find('tbody');
        var port = 'v3/factoryCompare/getRanking',
            successFunc = function (data) {
                //异常列表已经加载切换tab不必重复加载
                $("#snapMoreTypeModal").data({
                    CJ: true
                })
                hideLoading($('#snapMoreTypeModal #snapMoreTypeCJ'));

                var columnsArr = [{
                    field: 'field1',
                    title: "<span title='厂家'>厂家</span>",
                    width: 100
                }, {
                    field: 'field2',
                    title: "<span title='请求总次数'>请求总次数</span>",
                    width: 100
                }, {
                    field: 'field3',
                    title: "<span title='响应总时长(ms)'>响应总时长(ms)</span>",
                    width: 100
                }, {
                    field: 'field4',
                    title: "<span title='平均每次响应时长(ms)'>平均每次响应时长(ms)</span>",
                    width: 100
                }, {
                    field: 'field5',
                    title: "<span title='性能排名'>性能排名</span>",
                    width: 100
                }
                    //     , {
                    //     field: 'field6',
                    //     title: "<span title='分数'>分数</span>",
                    //     width: 100
                    // }, {
                    //     field: 'field7',
                    //     title: "<span title='平均分数'>平均分数</span>",
                    //     width: 100
                    // }, {
                    //     field: 'field8',
                    //     title: "<span title='请求确认总次数'>请求确认总次数</span>",
                    //     width: 100
                    //     },
                ],
                    dataArr = [];

                if (data.code === '200') {
                    var result = data.data;
                    $table.data({
                        'result': result
                    });

                    $("#snapStatisticTableCJTwo").data({
                        'result': result
                    });

                    if (result && result.length > 0) {
                        // for (var i = 0; i < result[0].list.length; i++) {
                        //     var columnsArrObj = {};
                        //     columnsArrObj.field = `field${9 + i}`;
                        //     columnsArrObj.title = `<span title="${result[0].list[i].topName}">${result[0].list[i].topName}</span>`;
                        //     columnsArrObj.width = 100;
                        //     columnsArr.push(columnsArrObj);
                        // }


                        // 添加列表
                        for (var j = 0; j < result.length; j++) {
                            var dataArrObj = {};
                            dataArrObj['field1'] = `<span title="${result[j].platformName || 0}">${result[j].platformName || 0}</span>`;
                            dataArrObj['field2'] = `<span title="${result[j].reqCount || 0}">${result[j].reqCount || 0}</span>`;
                            dataArrObj['field3'] = `<span title="${result[j].duration || 0}">${result[j].duration || 0}</span>`;
                            dataArrObj['field4'] = `<span title="${result[j].aveDuration || 0}">${result[j].aveDuration || 0}</span>`;
                            dataArrObj['field5'] = `<span title="${result[j].durationRanking || 0}">${result[j].durationRanking || 0}</span>`;
                            // dataArrObj['field6'] = `<span title="${result[j].score || 0}">${result[j].score || 0}</span>`;
                            // dataArrObj['field7'] = `<span title="${result[j].aveScore || 0}">${result[j].aveScore || 0}</span>`;
                            // dataArrObj['field8'] = `<span title="${result[j].compareCount || 0}">${result[j].compareCount || 0}</span>`;
                            // for (var n = 0; n < result[j].list.length; n++) {
                            //     dataArrObj['field' + (9 + n)] = `<span title="${result[j].list[n].topNum}">${result[j].list[n].topNum}</span>`;
                            // }
                            dataArr.push(dataArrObj);
                        }
                        createSnapCJListTwo($("#snapStatisticTableCJTwo"), result);
                        $table.bootstrapTable("destroy").bootstrapTable({
                            columns: columnsArr,
                            data: dataArr,
                            search: false,
                            fixedColumns: true,
                            detailView: false,
                            fixedNumber: 1
                        });
                    } else {
                        $table.bootstrapTable("destroy").bootstrapTable({
                            columns: columnsArr,
                            data: dataArr,
                            search: false,
                            fixedColumns: false,
                            detailView: false,
                            mergeCells: {
                                index: 0,
                                field: 'field1',
                                colspan: 5
                            },
                            formatNoMatches: function () {
                                return '没有匹配的记录';
                            },
                        });
                        $("#snapStatisticTableCJTwo").bootstrapTable("destroy").bootstrapTable({
                            columns: columnsArr,
                            data: dataArr,
                            search: false,
                            fixedColumns: false,
                            detailView: false,
                            mergeCells: {
                                index: 0,
                                field: 'field1',
                                colspan: 3
                            },
                            formatNoMatches: function () {
                                return '没有匹配的记录';
                            },
                        });
                    }
                } else {
                    //dataArr['field0'] = `没有匹配的记录`;
                    $table.bootstrapTable("destroy").bootstrapTable({
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: false,
                        detailView: false,
                        mergeCells: {
                            index: 0,
                            field: 'field1',
                            colspan: 5
                        },
                        formatNoMatches: function () {
                            return '没有匹配的记录';
                        },
                    });
                    $("#snapStatisticTableCJTwo").bootstrapTable("destroy").bootstrapTable({
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: false,
                        detailView: false,
                        mergeCells: {
                            index: 0,
                            field: 'field1',
                            colspan: 3
                        },
                        formatNoMatches: function () {
                            return '没有匹配的记录';
                        },
                    });
                }
            };
        loadData(port, true, configData, successFunc);
    };

    /**
     * 列表生成 厂家列表1
     * @param {*} $table 表格容器
     * @param {*} result 数据
     */
    function createSnapCJListTwo($table, result) {
        var columnsArr = [
            {
                field: 'field1',
                title: "<span title='厂家'>厂家</span>",
                width: 100
            },
            {
                field: 'field2',
                title: "<span title='分数'>分数</span>",
                width: 100
            }, {
                field: 'field3',
                title: "<span title='平均分数'>平均分数</span>",
                width: 100
            }, {
                field: 'field4',
                title: "<span title='请求确认总次数'>请求确认总次数</span>",
                width: 150
            }],
            dataArr = [];

        for (var i = 0; i < result[0].list.length; i++) {
            var columnsArrObj = {};
            columnsArrObj.field = `field${5 + i}`;
            columnsArrObj.title = `<span title="${result[0].list[i].topName}">${result[0].list[i].topName}</span>`;
            columnsArrObj.width = 100;
            columnsArr.push(columnsArrObj);
        }

        // 添加列表
        for (var j = 0; j < result.length; j++) {
            var dataArrObj = {};
            dataArrObj['field1'] = `<span title="${result[j].platformName || 0}">${result[j].platformName || 0}</span>`;
            dataArrObj['field2'] = `<span title="${result[j].score || 0}">${result[j].score || 0}</span>`;
            dataArrObj['field3'] = `<span title="${result[j].aveScore || 0}">${result[j].aveScore || 0}</span>`;
            dataArrObj['field4'] = `<span title="${result[j].compareCount || 0}">${result[j].compareCount || 0}</span>`;

            for (var n = 0; n < result[j].list.length; n++) {
                dataArrObj['field' + (5 + n)] = `<span title="${result[j].list[n].topNum}">${result[j].list[n].topNum}</span>`;
            }
            dataArr.push(dataArrObj);
        }
        $table.bootstrapTable("destroy").bootstrapTable({
            columns: columnsArr,
            data: dataArr,
            search: false,
            fixedColumns: true,
            detailView: false,
            fixedNumber: 1
        });

    };

    /**
     * 列表生成 运维统计列表
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     */
    function createSnapYWList($table, $pagination, first, configData) {
        showLoading($('#snapMoreTypeModal #snapMoreTypeYW'));
        if (first) {
            $pagination.html('');
        }
        var $thead = $table.find('thead');
        var $tbody = $table.find('tbody');
        var port = 'v2/index/getCameraStatusStatistic',
            successFunc = function (data) {
                //异常列表已经加载切换tab不必重复加载
                $("#snapMoreTypeModal").data({
                    YW: true
                })
                hideLoading($('#snapMoreTypeModal #snapMoreTypeYW'));

                var columnsArr = [{
                    field: 'field0',
                    title: "镜头名称",
                    width: 200
                }, {
                    field: 'field1',
                    title: "国标编码",
                    width: 200
                }, {
                    field: 'field2',
                    title: "机构名",
                    width: 200
                }, {
                    field: 'field4',
                    title: "<span title='视频流是否正常'>视频流是否正常</span>"
                }, {
                    field: 'field5',
                    title: "<span title='图片流是否正常'>图片流是否正常</span>"
                }, {
                    field: 'field6',
                    title: "<span title='历史抓拍总数'>历史抓拍总数</span>"
                }, {
                    field: 'field3',
                    title: '操作'
                }],
                    dataArr = [];

                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });

                    if (result && result.length > 0) {
                        // 添加列表
                        for (var j = 0; j < result.length; j++) {
                            var dataArrObj = {};
                            dataArrObj['field0'] = `<span title="${result[j].cameraName || '未知'}" cameraid="${result[j].cameraId}" class="text-link showCameraPage">${result[j].cameraName || 0}</span>`;
                            dataArrObj['field1'] = `<span title="${result[j].gbCode || '未知'}">${result[j].gbCode || 0}</span>`;
                            dataArrObj['field2'] = `<span title="${result[j].orgName || '未知'}">${result[j].orgName || 0}</span>`;
                            // dataArrObj['field3'] = `<span title="${result[j].onlineStatus == 0 ? '在线' : '不在线'}">${result[j].onlineStatus == 0 ? '在线' : '不在线'}</span>`;
                            dataArrObj['field4'] = `<span title="${parseInt(result[j].videoStatus) == 0 ? '是' : '否'}">${parseInt(result[j].videoStatus) == 0 ? '是' : '否'}</span>`;
                            dataArrObj['field5'] = `<span title="${parseInt(result[j].picStatus) == 0 ? '是' : '否'}">${parseInt(result[j].picStatus) == 0 ? '是' : '否'}</span>`;
                            dataArrObj['field6'] = `<span title="${result[j].total || 0}">${result[j].total || 0}</span>`;
                            dataArrObj['field3'] = `<button type="button" class="btn btn-link report">一键报障</button>`;

                            dataArr.push(dataArrObj);
                        }
                        var height = $("#snapMoreTypeModal .popup-body").height() - $("#snapMoreTypeYW").find(".search-terms-box").height() - 80;
                        $table.bootstrapTable("destroy").bootstrapTable({
                            height: height,
                            columns: columnsArr,
                            data: dataArr,
                            search: false,
                            fixedColumns: false,
                            detailView: false
                        });

                        $table.find("tbody tr").each((index, $dom) => {
                            $($dom).data("listData", result[index]);
                        })
                        $("#snapMoreTypeYW").data("listData", result);

                        if (data.data.total > Number(configYWData.size) && first) {
                            var pageSizeOpt = [{
                                value: 10,
                                text: '10/页'
                            }, {
                                value: 20,
                                text: '20/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                configYWData.page = currPage;
                                configYWData.size = pageSize;
                                createSnapYWList($table, $pagination, false, configYWData);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $table.bootstrapTable("destroy").bootstrapTable({
                            columns: columnsArr,
                            data: dataArr,
                            search: false,
                            fixedColumns: false,
                            detailView: false,
                            mergeCells: {
                                index: 0,
                                field: 'field0',
                                colspan: 7
                            },
                            formatNoMatches: function () {
                                return '没有匹配的记录';
                            },
                        });
                    }
                } else {
                    //dataArr['field0'] = `没有匹配的记录`;
                    $table.bootstrapTable("destroy").bootstrapTable({
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: false,
                        detailView: false,
                        mergeCells: {
                            index: 0,
                            field: 'field0',
                            colspan: 7
                        },
                        formatNoMatches: function () {
                            return '没有匹配的记录';
                        },
                    });
                }
            };
        loadData(port, true, configData, successFunc);
    };

    /**
     * 运维统计异常数统计
     * @param {*} configData 参数
     */
    function createSnapYWErrorList(configData) {
        var port = 'v2/index/getCameraStreamStatistics',
            data = {
                orgId: configData.orgId
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    $("#YWPicStatusErrNum").html(data.data.videoStatusErrNum || 0);
                    $("#YWVideoStatusErrNum").html(data.data.picStatusErrNum || 0);
                } else {
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, configData, successFunc);
    };

    /**
     * 列表生成 动静态统计列表
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     */
    function createSnapDJList($table, $tableTwo, configData) {
        showLoading($('#snapMoreTypeModal #snapMoreTypeDJ'));
        var port = 'v3/myApplication/getTopUsedInfo',
            successFunc = function (data) {
                //异常列表已经加载切换tab不必重复加载
                $("#snapMoreTypeModal").data({
                    DJ: true
                })
                hideLoading($('#snapMoreTypeModal #snapMoreTypeDJ'));

                var columnsArr = [{
                    field: 'field0',
                    title: "序号",
                    width: 70
                }, {
                    field: 'field1',
                    title: "用户姓名",
                    width: 200
                }, {
                    field: 'field2',
                    title: "用户警号",
                    width: 200
                }, {
                    field: 'field3',
                    title: "所属机构"
                }, {
                    field: 'field4',
                    title: "使用次数"
                }, {
                    field: 'field5',
                    title: "检索类型",
                    width: 200
                }],
                    dataArr = [],
                    dataArrTwo = [];

                if (data.code == '200') {
                    var resultStatic = [],
                        resultDynamic = [],
                        result = [];
                    if (data.data) {
                        resultStatic = data.data.staticUseInfo ? data.data.staticUseInfo.list : [];
                        resultDynamic = data.data.dynamicUseInfo ? data.data.dynamicUseInfo.list : [];
                        resultStatic.forEach(item => {
                            item.type = 1;
                        })
                        resultDynamic.forEach(item => {
                            item.type = 2;
                        })
                    }
                    result = [...resultDynamic, ...resultStatic];
                    // $table.data({
                    //     'result': result
                    // });

                    if (result && result.length > 0) {
                        // 添加列表
                        // for (var j = 0; j < result.length; j++) {
                        //     var dataArrObj = {};
                        //     dataArrObj['field0'] = `<span title="${result[j].sequeue}">${result[j].sequeue}</span>`;
                        //     dataArrObj['field1'] = `<span title="${result[j].nickName || '--'}">${result[j].nickName || '--'}</span>`;
                        //     dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                        //     dataArrObj['field3'] = `<span title="${result[j].name || '--'}">${result[j].name || '--'}</span>`;
                        //     dataArrObj['field4'] = `<span title="${result[j].useCount || 0}">${result[j].useCount || 0}</span>`;
                        //     dataArrObj['field5'] = `<span title="${result[j].type == 1 ? '静态检索' : '动态检索'}">${result[j].type == 1 ? '静态检索' : '动态检索'}</span>`;
                        //     dataArr.push(dataArrObj);
                        // }
                        for (let j = 0; j < resultStatic.length; j++) {
                            let dataArrObj = {};
                            dataArrObj['field0'] = `<span title="${resultStatic[j].sequeue}">${resultStatic[j].sequeue}</span>`;
                            dataArrObj['field1'] = `<span title="${resultStatic[j].nickName || '--'}">${resultStatic[j].nickName || '--'}</span>`;
                            dataArrObj['field2'] = `<span title="${resultStatic[j].userId || '--'}">${resultStatic[j].userId || '--'}</span>`;
                            dataArrObj['field3'] = `<span title="${resultStatic[j].name || '--'}">${resultStatic[j].name || '--'}</span>`;
                            dataArrObj['field4'] = `<span title="${resultStatic[j].useCount || 0}">${resultStatic[j].useCount || 0}</span>`;
                            dataArrObj['field5'] = `<span title="${resultStatic[j].type == 1 ? '静态检索' : '动态检索'}">${resultStatic[j].type == 1 ? '静态检索' : '动态检索'}</span>`;
                            dataArr.push(dataArrObj);
                        }

                        for (let j = 0; j < resultDynamic.length; j++) {
                            let dataArrObj = {};
                            dataArrObj['field0'] = `<span title="${resultDynamic[j].sequeue}">${resultDynamic[j].sequeue}</span>`;
                            dataArrObj['field1'] = `<span title="${resultDynamic[j].nickName || '--'}">${resultDynamic[j].nickName || '--'}</span>`;
                            dataArrObj['field2'] = `<span title="${resultDynamic[j].userId || '--'}">${resultDynamic[j].userId || '--'}</span>`;
                            dataArrObj['field3'] = `<span title="${resultDynamic[j].name || '--'}">${resultDynamic[j].name || '--'}</span>`;
                            dataArrObj['field4'] = `<span title="${resultDynamic[j].useCount || 0}">${resultDynamic[j].useCount || 0}</span>`;
                            dataArrObj['field5'] = `<span title="${resultDynamic[j].type == 1 ? '静态检索' : '动态检索'}">${resultDynamic[j].type == 1 ? '静态检索' : '动态检索'}</span>`;
                            dataArrTwo.push(dataArrObj);
                        }

                        //var height = $("#snapMoreTypeModal .popup-body").height() - $("#snapMoreTypeDJ").find(".search-terms-box").height();
                        $table.bootstrapTable("destroy").bootstrapTable({
                            //height: height,
                            columns: columnsArr,
                            data: dataArr,
                            search: false,
                            fixedColumns: false,
                            detailView: false
                        });

                        $tableTwo.bootstrapTable("destroy").bootstrapTable({
                            //height: height,
                            columns: columnsArr,
                            data: dataArrTwo,
                            search: false,
                            fixedColumns: false,
                            detailView: false
                        });

                        $table.find("tbody tr").each((index, $dom) => {
                            $($dom).data("listData", result[index]);
                        })

                        $tableTwo.find("tbody tr").each((index, $dom) => {
                            $($dom).data("listData", result[index]);
                        })

                        $("#snapMoreTypeDJ").data("listData", result);
                    } else {
                        $table.bootstrapTable("destroy").bootstrapTable({
                            columns: columnsArr,
                            data: dataArr,
                            search: false,
                            fixedColumns: false,
                            detailView: false,
                            mergeCells: {
                                index: 0,
                                field: 'field0',
                                colspan: 5
                            },
                            formatNoMatches: function () {
                                return '没有匹配的记录';
                            },
                        });

                        $tableTwo.bootstrapTable("destroy").bootstrapTable({
                            columns: columnsArr,
                            data: dataArr,
                            search: false,
                            fixedColumns: false,
                            detailView: false,
                            mergeCells: {
                                index: 0,
                                field: 'field0',
                                colspan: 5
                            },
                            formatNoMatches: function () {
                                return '没有匹配的记录';
                            },
                        });
                    }
                } else {
                    //dataArr['field0'] = `没有匹配的记录`;
                    $table.bootstrapTable("destroy").bootstrapTable({
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: false,
                        detailView: false,
                        mergeCells: {
                            index: 0,
                            field: 'field0',
                            colspan: 5
                        },
                        formatNoMatches: function () {
                            return '没有匹配的记录';
                        },
                    });

                    $tableTwo.bootstrapTable("destroy").bootstrapTable({
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: false,
                        detailView: false,
                        mergeCells: {
                            index: 0,
                            field: 'field0',
                            colspan: 5
                        },
                        formatNoMatches: function () {
                            return '没有匹配的记录';
                        },
                    });
                }
            };
        loadData(port, true, configData, successFunc);
    };

    /**
     * 列表生成 人脸列表
     * @param {*} $table 表格容器
     * @param {*} configData 过滤条件对象
     */
    function createSnapRLList($table, thisIndex) {
        showLoading($('#snapMoreTypeModal #snapMoreTypeRL'));
        var port = 'v3/myApplication/getPlatFaceUseStatistic',
            data = {
                type: thisIndex
            },
            successFunc = function (data) {
                hideLoading($('#snapMoreTypeModal #snapMoreTypeRL'));

                //异常列表已经加载切换tab不必重复加载
                $("#snapMoreTypeModal").data({
                    RL: true
                })

                if (data.code === '200' && data.data && data.data.length > 0) {
                    $("#snapStatisticLoadRLEmpty").addClass("hide");
                    var result = data.data;
                    $table.data({
                        'result': result
                    });

                    var columnsArr = [
                        {
                            field: 'field1',
                            title: "日期",
                            width: 150
                        }
                    ],
                        dataArr = [],
                        dataTitleArr = [];

                    for (let j = 0; j < result[0].platFaceUseInfos.length; j++) {
                        dataTitleArr.push(result[0].platFaceUseInfos[j].platName);
                        var columnsArrObj = {};
                        columnsArrObj.field = `field${j + 2}`;
                        columnsArrObj.title = `<span title="${result[0].platFaceUseInfos[j].platName}">${result[0].platFaceUseInfos[j].platName}</span>`;
                        columnsArrObj.width = 120;
                        columnsArr.push(columnsArrObj);
                    }

                    // 添加列表
                    for (let j = 0; j < result.length; j++) {
                        var dataArrObj = {};
                        dataArrObj.field1 = `${result[j].statisticDay}`;
                        for (var k = 0; k < result[j].platFaceUseInfos.length; k++) {
                            for (let i = 0; i < dataTitleArr.length; i++) {
                                if (dataTitleArr[i] == result[j].platFaceUseInfos[k].platName) {
                                    var data = parseFloat(result[j].platFaceUseInfos[k].counts || 0).toLocaleString();
                                    dataArrObj[`field${i + 2}`] = `<span class="${result[j].platFaceUseInfos[k].platCode}" title="${data || 0}">${data || 0}</span>`;
                                }
                            }
                        }
                        dataArr.push(dataArrObj);
                    }
                    var modalTableHeight = $("#snapMoreTypeModal .popup-body").height() - $("#snapMoreTypeRL .search-terms-box").height();
                    $table.bootstrapTable("destroy").bootstrapTable({
                        height: modalTableHeight,
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: true,
                        detailView: false,
                        fixedNumber: 1
                    });

                    $table.find("tbody tr").each((index, $dom) => {
                        $($dom).data("listData", result[index]);
                    })
                    $("#snapMoreTypeRL").data("listData", result);
                } else {
                    $("#snapStatisticLoadRLEmpty").removeClass("hide");
                    $("#snapTableRL").addClass("hide");
                    $("#snapChartRL").addClass("hide");
                    loadEmpty($("#snapStatisticLoadRLEmpty"), "暂无检索结果", data.message);
                }
            };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };

    // 列表生成 人脸列表
    function createSnapRLChart(thisIndex) {
        showLoading($('#snapMoreTypeRL').find(".search-tab-box"));
        var port = 'v3/myApplication/getPlatFaceUseStatistic',
            data = {
                type: thisIndex
            },
            successFunc = function (data) {
                hideLoading($('#snapMoreTypeRL').find(".search-tab-box"));
                if (data.code === '200' && data.data && data.data.length > 0) {
                    let optionRate = {
                        grid: {
                            top: '10%',
                            right: '1%',
                            left: '2.5%',
                            bottom: '10%'
                        },
                        legend: {
                            data: [],
                            right: '0%',
                            itemWidth: 20,
                            itemHeight: 12,
                        },
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow',
                            }
                        },
                        xAxis: {
                            data: [],
                            //坐标轴
                            axisLine: {
                                lineStyle: {
                                    color: '#566381'
                                }
                            }
                        },
                        yAxis: {
                            //坐标轴
                            axisLine: {
                                show: false
                            },
                            //分格线
                            splitLine: {
                                lineStyle: {
                                    color: '#566381'
                                }
                            },
                            axisLabel: {
                                textStyle: {
                                    fontSize: 10
                                },
                                formatter: function (value, index) {
                                    if (value === 0) {
                                        return value;
                                    } else {
                                        var formatterValueObj = dataUnitChange1(value, true, 1);
                                        return formatterValueObj.value;
                                    }
                                }
                            }
                        },
                        series: []
                    },
                        result = data.data,
                        dataX = [],
                        dataSeries = [],
                        dataLegend = [];
                    //$("#getUserInfoChartRL").html("");
                    for (let i = 0; i < result[0].platFaceUseInfos.length; i++) {
                        dataLegend.push(result[0].platFaceUseInfos[i].platName);
                        dataSeries.push({
                            name: result[0].platFaceUseInfos[i].platName,
                            type: 'bar',
                            barGap: '50%',
                            itemStyle: {
                                normal: {
                                    color: result[0].platFaceUseInfos[i].color // 0% 处的颜色
                                }
                            },
                            data: []
                        });
                    }
                    for (let i = 0; i < result.length; i++) {
                        dataX.push(result[i].statisticDay);
                        for (let j = 0; j < result[i].platFaceUseInfos.length; j++) {
                            for (let k = 0; k < dataSeries.length; k++) {
                                if (result[i].platFaceUseInfos[j].platName == dataSeries[k].name) {
                                    dataSeries[k].data.push(result[i].platFaceUseInfos[j].counts);
                                }
                            }
                        }
                    }
                    optionRate.legend.data = dataLegend;
                    optionRate.xAxis.data = dataX;
                    optionRate.series = dataSeries;
                    let myChart = echarts.init(document.getElementById("getUserInfoChartRL"));
                    // // 使用刚指定的配置项和数据显示图表。
                    myChart.setOption(optionRate, true);

                    $(window).off('resize.getUserInfoChartRL').on('resize.getUserInfoChartRL', function () {
                        myChart.resize();
                    });
                } else {
                    $("#snapStatisticLoadRLEmpty").removeClass("hide");
                    $("#snapTableRL").addClass("hide");
                    $("#snapChartRL").addClass("hide");
                    loadEmpty($("#snapStatisticLoadRLEmpty"), "暂无检索结果", data.message);
                }
            };
        loadData(port, true, data, successFunc, undefined, 'GET');
    }

    //列表生成 人像列表
    function createSnapRXList($table, configData) {
        showLoading($('#snapMoreTypeRX').find(".search-tab-box"));
        var port = 'v2/regData/findUniqueLibCount',
            successFunc = function (data) {
                //异常列表已经加载切换tab不必重复加载
                $("#snapMoreTypeModal").data({
                    RX: true
                })
                hideLoading($('#snapMoreTypeRX').find(".search-tab-box"));
                var columnsArr = [{
                    field: 'field0',
                    title: "库名称",
                    width: 100
                }, {
                    field: 'field1',
                    title: "数量",
                    width: 100
                }, {
                    field: 'field2',
                    title: "库名称",
                    width: 100
                }, {
                    field: 'field3',
                    title: "数量",
                    width: 100
                }, {
                    field: 'field4',
                    title: "库名称",
                    width: 100
                }, {
                    field: 'field5',
                    title: "数量",
                    width: 100
                }],
                    result = data.data,
                    dataArr = [];
                if (data.code === '200' && data.data && data.data.length > 0) {
                    for (let i = 0; i < result.length / 3; i++) {
                        let dataArrObj = {};
                        for (let j = 0; j < 3; j++) {
                            if (result[i * 3 + j] != undefined) {
                                let index = 2 * (j % 3);
                                dataArrObj['field' + index] = `<span title="${result[i * 3 + j].libName}">${result[i * 3 + j].libName}</span>`;
                                dataArrObj['field' + (index + 1)] = `<span title="${result[i * 3 + j].totalCount}">${result[i * 3 + j].totalCount}</span>`;
                            }
                        }
                        dataArr.push(dataArrObj);
                    }
                    $table.bootstrapTable("destroy").bootstrapTable({
                        //height: height,
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: false,
                        detailView: false
                    });

                } else {
                    $table.bootstrapTable("destroy").bootstrapTable({
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: false,
                        detailView: false,
                        mergeCells: {
                            index: 0,
                            field: 'field0',
                            colspan: 6
                        },
                        formatNoMatches: function () {
                            return '没有匹配的记录';
                        },
                    });
                }
            };
        loadData(port, true, configData, successFunc);
    }

    //列表生成 人像列表二
    function createSnapRXListTwo($table) {
        showLoading($('#snapMoreTypeRX').find(".search-tab-box"));
        var port = 'v2/regData/findUniqueModelInfo',
            successFunc = function (data) {
                //异常列表已经加载切换tab不必重复加载
                // $("#snapMoreTypeModal").data({
                //     RX: true
                // })
                hideLoading($('#snapMoreTypeRX').find(".search-tab-box"));
                var columnsArr = [],
                    result = data.data,
                    dataArr = [],
                    libTabArr = [],
                    libNameArr = [],
                    dataArrObj = {};
                if (data.code === '200' && data.data && data.data.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        let libObj = {
                            field: 'field' + i,
                            title: result[i].platform,
                            width: 100,
                            colspan: 2,
                            rowspan: 1,
                            align: 'center'
                        }, tabObjSuccess = {
                            field: 'fields' + i,
                            title: '成功',
                            align: 'center'
                        }, tabObjFail = {
                            field: 'fieldf' + i,
                            title: '失败',
                            align: 'center'
                        };

                        dataArrObj['fields' + i] = `<span title="${result[i].size}">${result[i].size}</span>`;
                        dataArrObj['fieldf' + i] = `<span title="${result[i].failCount}">${result[i].failCount}</span>`;

                        libTabArr.push(tabObjSuccess);
                        libTabArr.push(tabObjFail);
                        libNameArr.push(libObj);
                    }
                    dataArr.push(dataArrObj);
                    columnsArr.push(libNameArr);
                    columnsArr.push(libTabArr);
                    $table.bootstrapTable("destroy").bootstrapTable({
                        //height: height,
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: false,
                        detailView: false
                    });

                } else {
                    $table.bootstrapTable("destroy").bootstrapTable({
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: false,
                        detailView: false,
                        mergeCells: {
                            index: 0,
                            field: 'field0',
                            colspan: 6
                        },
                        formatNoMatches: function () {
                            return '没有匹配的记录';
                        },
                    });
                }
            };
        loadData(port, true, {}, successFunc);
    }

    // 给节点中添加按钮的点击事件
    $("#rlBtnGrounp").on('click', ".btn", function () {
        var $this = $(this),
            thisIndex = $this.index() + 1,
            thisCls = $this.hasClass('btn-primary');
        if (thisCls) {
            return;
        }
        $this.addClass('btn-primary').siblings().removeClass('btn-primary');
        if ($("#rlTabChange").find(".btn.btn-primary").index() == 0) {
            createSnapRLList($('#snapStatisticTableRL'), thisIndex);
        } else {
            createSnapRLChart(thisIndex);
        }
    });

    $("#rlTabChange").on('click', ".btn", function () {
        var $this = $(this),
            thisIndex = $this.index() + 1,
            dataType = $("#rlBtnGrounp").find(".btn.btn-primary").index() + 1,
            thisCls = $this.hasClass('btn-primary');
        if (thisCls) {
            return;
        }
        $this.addClass('btn-primary').siblings().removeClass('btn-primary');
        $("#snapStatisticLoadRLEmpty").addClass("hide");
        if (thisIndex == 2) {
            $("#snapTableRL").addClass("hide");
            $("#snapChartRL").removeClass("hide");
            createSnapRLChart(dataType);
        } else {
            $("#snapTableRL").removeClass("hide");
            $("#snapChartRL").addClass("hide");
            createSnapRLList($('#snapStatisticTableRL'), dataType);
        }
    });

    /**
     * 列表生成 考核列表弹窗其他列点击生成表格
     * @param {*} type 类型
     * @param {*} obj 需要的数据
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否是第一次加载
     * @param {*} page 页数
     * @param {*} size 条数
     */
    function getDashBoardOtherModalTable(type, obj, $table, $pagination, first, page, size) {
        showLoading($table);
        switch (type) {
            //账号总数
            case 'accountNum':
                if (first) {
                    $("#snapKHItemModal").find(".modal-body").prepend(`<button type="button" id="accountNumUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>`);
                }
                $("#snapKHItemModal").find("#accountNumUpload").data("data", obj);
                var port = 'v3/report/getAccountDetail',
                    portData = {
                        startTime: configKHData.startTime,
                        endTime: configKHData.endTime,
                        orgId: obj.orgId,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configKHData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "登录用户姓名"
                        }, {
                            field: 'field2',
                            title: "用户账号"
                        }, {
                            field: 'field3',
                            title: "用户所属机构名称"
                        }, {
                            field: 'field4',
                            title: "用户权限类型"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArrObj['field4'] = `<span title="${result[j].userType || '--'}">${result[j].userType || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 4
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 4
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'loginPersonNum':
                if (first) {
                    $("#snapKHItemModal").find(".modal-body").prepend(`<button type="button" id="loginPersonNumUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>`);
                }
                $("#snapKHItemModal").find("#loginPersonNumUpload").data("data", obj);
                var port = 'v3/report/getLoginPersonDetail',
                    portData = {
                        startTime: configKHData.startTime,
                        endTime: configKHData.endTime,
                        orgId: obj.orgId,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configKHData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "登录用户姓名"
                        }, {
                            field: 'field2',
                            title: "用户账号"
                        }, {
                            field: 'field3',
                            title: "用户所属机构名称"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 4
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 4
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'loginAllNum':
                if (first) {
                    $("#snapKHItemModal").find(".modal-body").prepend(`<button type="button" id="loginAllNumUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>`);
                }
                $("#snapKHItemModal").find("#loginAllNumUpload").data("data", obj);
                var port = 'v3/report/getLoginCountDetail',
                    portData = {
                        startTime: configKHData.startTime,
                        endTime: configKHData.endTime,
                        orgId: obj.orgId,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configKHData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "登录用户姓名"
                        }, {
                            field: 'field2',
                            title: "用户账号"
                        }, {
                            field: 'field3',
                            title: "用户所属机构名称"
                        }, {
                            field: 'field4',
                            title: "登录时间"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArrObj['field4'] = `<span title="${result[j].operateTime || '--'}">${result[j].operateTime || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 5
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 5
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'overdueUnused':
                if (first) {
                    $("#snapKHItemModal").find(".modal-body").prepend(`<button type="button" id="overdueUnusedUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>`);
                }
                $("#snapKHItemModal").find("#overdueUnusedUpload").data("data", obj);
                var port = 'v3/errReport/getNotLoginUserDetail',
                    portData = {
                        startTime: configYCData.startTime,
                        endTime: configYCData.endTime,
                        orgId: obj.orgId,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configYCData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "登录用户姓名"
                        }, {
                            field: 'field2',
                            title: "用户账号"
                        }, {
                            field: 'field3',
                            title: "手机号码"
                        }, {
                            field: 'field4',
                            title: "用户所属机构名称"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].telephone || '--'}">${result[j].telephone || '--'}</span>`;
                                    dataArrObj['field4'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 5
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 5
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'abnormalLogin': // 异常登录
                var port = 'v3/errReport/getErrLoginDetail',
                    portData = {
                        startTime: configYCData.startTime,
                        endTime: configYCData.endTime,
                        orgId: obj.orgId,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configYCData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "登录用户姓名",
                            width: 100
                        }, {
                            field: 'field2',
                            title: "用户账号",
                            width: 150
                        }, {
                            field: 'field3',
                            title: "用户所属机构名称",
                            width: 200
                        }, {
                            field: 'field4',
                            title: "ip地址"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArrObj['field4'] = `<span title="${result[j].ips || '--'}">${result[j].ips || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 5
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 5
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'repeatCase':
                var port = 'v3/errReport/getCaseRepeatDetail',
                    portData = {
                        startTime: configYCData.startTime,
                        endTime: configYCData.endTime,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configYCData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "案件编号"
                        }, {
                            field: 'field2',
                            title: "事件名称"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].ajbh || '--'}">${result[j].ajbh || '--'}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].incident || '--'}">${result[j].incident || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    rowStyle: function (row, index) {
                                        return {
                                            css: {
                                                "cursor": "pointer"
                                            },
                                            classes: 'my-class'
                                        }
                                    },
                                    onClickRow: function (row, $el) {
                                        var html = `<table id="dashBoardOtherModalChildTable" class="table-hover"></table>
                                                    <div class="fixed-table-pagination bayonetCameralPagination" id="dashBoardOtherModalTableChildPagination"></div>`
                                        $("#snapKHItemChildModal").find(".modal-body").html(html);
                                        var num = $el.find("td").eq(1).text(),
                                            $table = $("#snapKHItemChildModal").find("#dashBoardOtherModalChildTable"),
                                            $pagination = $("#snapKHItemChildModal").find("#dashBoardOtherModalTableChildPagination");

                                        $("#snapKHItemChildModal").modal("show").find(".modal-title").html("重复申请数详情");
                                        getRepeatCaseDetail(obj, true, 1, 10);
                                        function getRepeatCaseDetail(obj, first, page, size) {
                                            showLoading($table);

                                            var port = 'v3/myApplication/getApplicationList',
                                                portData = {
                                                    labh: num,
                                                    viewType: 6,
                                                    startTime: configYCData.startTime,
                                                    endTime: configYCData.endTime,
                                                    apaasOrgId: obj.apaasOrgId,
                                                    roleType: configYCData.roleType,
                                                    page,
                                                    size
                                                },
                                                successFunc = function (data) {
                                                    hideLoading($table);

                                                    var columnsArr = [{
                                                        field: 'field0',
                                                        title: "序号",
                                                        width: 100
                                                    }, {
                                                        field: 'field1',
                                                        title: "申请人"
                                                    }, {
                                                        field: 'field2',
                                                        title: "用户警号"
                                                    }, {
                                                        field: 'field3',
                                                        title: "机构名称"
                                                    }, {
                                                        field: 'field4',
                                                        title: "事件名称"
                                                    }, {
                                                        field: 'field5',
                                                        title: "创建时间"
                                                    }],
                                                        dataArr = [];

                                                    if (data.code === '200') {
                                                        var result = data.data.list;
                                                        $table.data({
                                                            'result': result
                                                        });

                                                        if (result && result.length > 0) {
                                                            // 添加列表
                                                            for (var j = 0; j < result.length; j++) {
                                                                var dataArrObj = {};
                                                                dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                                                dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                                                dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                                                dataArrObj['field3'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                                                dataArrObj['field4'] = `<span title="${result[j].incident || '--'}">${result[j].incident || '--'}</span>`;
                                                                dataArrObj['field5'] = `<span title="${result[j].createTime || '--'}">${result[j].createTime || '--'}</span>`;
                                                                dataArr.push(dataArrObj);
                                                            }
                                                            $table.bootstrapTable("destroy").bootstrapTable({
                                                                columns: columnsArr,
                                                                data: dataArr,
                                                                search: false,
                                                                fixedColumns: false,
                                                                detailView: false
                                                            });

                                                            if (data.data.total > Number(size) && first) {
                                                                var pageSizeOpt = [{
                                                                    value: 10,
                                                                    text: '10/页'
                                                                }, {
                                                                    value: 20,
                                                                    text: '20/页',
                                                                }];
                                                                var eventCallBack = function (currPage, pageSize) {
                                                                    getRepeatCaseDetail(obj, false, currPage, pageSize);
                                                                };
                                                                setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                                            }
                                                        } else {
                                                            //dataArr['field0'] = `没有匹配的记录`;
                                                            $table.bootstrapTable("destroy").bootstrapTable({
                                                                columns: columnsArr,
                                                                data: dataArr,
                                                                search: false,
                                                                fixedColumns: false,
                                                                detailView: false,
                                                                mergeCells: {
                                                                    index: 0,
                                                                    field: 'field0',
                                                                    colspan: 5
                                                                },
                                                                formatNoMatches: function () {
                                                                    return '没有匹配的记录';
                                                                },
                                                            });
                                                        }
                                                    } else {
                                                        //dataArr['field0'] = `没有匹配的记录`;
                                                        $table.bootstrapTable("destroy").bootstrapTable({
                                                            columns: columnsArr,
                                                            data: dataArr,
                                                            search: false,
                                                            fixedColumns: false,
                                                            detailView: false,
                                                            mergeCells: {
                                                                index: 0,
                                                                field: 'field0',
                                                                colspan: 5
                                                            },
                                                            formatNoMatches: function () {
                                                                return '没有匹配的记录';
                                                            },
                                                        });
                                                    }
                                                }
                                            loadData(port, true, portData, successFunc);
                                        }
                                    }
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 5
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 5
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'abnormalCase':
                var port = 'v3/errReport/getCaseQueryDetail',
                    portData = {
                        startTime: configYCData.startTime,
                        endTime: configYCData.endTime,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configYCData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "申请人"
                        }, {
                            field: 'field2',
                            title: "用户警号"
                        }, {
                            field: 'field3',
                            title: "机构名称"
                        }, {
                            field: 'field4',
                            title: "事件名称"
                        }, {
                            field: 'field5',
                            title: "创建时间"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArrObj['field4'] = `<span title="${result[j].incident || '--'}">${result[j].incident || '--'}</span>`;
                                    dataArrObj['field5'] = `<span title="${result[j].createTime || '--'}">${result[j].createTime || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 5
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 5
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'untimelyMakeUp':
                $("#snapKHItemModal").find(".modal-body #untimelyMakeUpUpload").remove();
                $("#snapKHItemModal").find(".modal-body").prepend(`<button type="button" id="untimelyMakeUpUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>`);
                $("#snapKHItemModal").find("#untimelyMakeUpUpload").data("data", obj);
                var port = 'v3/myApplication/getExigenceList',
                    portData = {
                        viewType: 7,
                        startTime: configYCData.startTime,
                        endTime: configYCData.endTime,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configYCData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 60
                        }, {
                            field: 'field5',
                            title: "单位名称"
                        }, {
                            field: 'field1',
                            title: "申请人",
                            width: 80
                        }, {
                            field: 'field2',
                            title: "用户警号",
                            width: 80
                        }, {
                            field: 'field4',
                            title: "案件名称"
                        }, {
                            field: 'field9',
                            title: "创建时间"
                        }, {
                            field: 'field6',
                            title: "检索使用次数",
                            width: 120
                        }, {
                            field: 'field3',
                            title: "手机号码"
                        }, {
                            field: 'field7',
                            title: "是否已补办",
                            width: 100
                        }, {
                            field: 'field8',
                            title: "补办时间"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field5'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field4'] = `<span title="${result[j].incident || '--'}">${result[j].incident || '--'}</span>`;
                                    dataArrObj['field9'] = `<span title="${result[j].createTime || '--'}">${result[j].createTime || '--'}</span>`;
                                    dataArrObj['field6'] = `<span title="${result[j].searchCount || '0'}">${result[j].searchCount || '0'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].telephone || '--'}">${result[j].telephone || '--'}</span>`;
                                    dataArrObj['field7'] = `<span>${result[j].status == '0' && '未补办' || result[j].status == '1' && '已补办' || result[j].status == '2' && '超时补办' || '--'}</span>`;
                                    dataArrObj['field8'] = `<span title="${result[j].updateTime || '--'}">${result[j].updateTime || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 5
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 5
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'queryInconsistent':
                let htmlQueryInconsistent = `<button type="button" id="queryInconsistentUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>`;
                $("#snapKHItemModal").find(".modal-body #queryInconsistentUpload").remove();
                $("#snapKHItemModal").find(".modal-body").prepend(htmlQueryInconsistent);
                $("#snapKHItemModal").find("#queryInconsistentUpload").data({
                    obj
                });

                var port = 'v3/errReport/getErrSearchIncident',
                    portData = {
                        startTime: configYCData.startTime,
                        endTime: configYCData.endTime,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configYCData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 60
                        }, {
                            field: 'field1',
                            title: "用户名称",
                            width: 80
                        }, {
                            field: 'field2',
                            title: "用户账号",
                            width: 80
                        }, {
                            field: 'field3',
                            title: "电话号码"
                        }, {
                            field: 'field4',
                            title: "机构名称"
                        }, {
                            field: 'field5',
                            title: "事件名称",
                        }, {
                            field: 'field6',
                            title: "案件编号",
                        }, {
                            field: 'field7',
                            title: "检索人员",
                        }, {
                            field: 'field8',
                            title: "申请检索图片数",
                        }, {
                            field: 'field9',
                            title: "占比",
                        }, {
                            field: 'field10',
                            title: "不符记录排序",
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].telephone || '--'}">${result[j].telephone || '--'}</span>`;
                                    dataArrObj['field4'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArrObj['field5'] = `<span title="${result[j].incident || '--'}">${result[j].incident || '--'}</span>`;
                                    dataArrObj['field6'] = `<span title="${result[j].ajbh || '--'}">${result[j].ajbh || '--'}</span>`;
                                    dataArrObj['field7'] = `<span title="${result[j].personTotal || '0'}">${result[j].personTotal || '0'}</span>`;
                                    dataArrObj['field8'] = `<span title="${result[j].applicationTotal || '0'}">${result[j].applicationTotal || '0'}</span>`;
                                    dataArrObj['field9'] = `<span title="${result[j].rate || '0'}">${result[j].rate || '0'}</span>`;
                                    dataArrObj['field10'] = `<span title="${result[j].sequence || '0'}">${result[j].sequence || '0'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    rowStyle: function (row, index) {
                                        return {
                                            css: {
                                                "cursor": "pointer"
                                            },
                                            classes: 'my-class'
                                        }
                                    },
                                    onClickRow: function (row, $el) {

                                        var html = `<div class="table-img-part">
                                                        <p class="table-list-title dashBoardOtherModalChildTip hide" style="font-weight:bold">申请原图</p>
                                                        <div class="table-list-content dashBoardOtherModalChildImg" id="dashBoardOtherModalChildImg"></div>
                                                    </div>
                                                    <div class="table-list-part">
                                                        <table id="dashBoardOtherModalChildTable" class="table-hover queryInconsistentTable"></table>
                                                        <div class="fixed-table-pagination bayonetCameralPagination" id="dashBoardOtherModalTableChildPagination"></div>
                                                    </div>`
                                        $("#snapKHItemChildModal").find(".modal-body").html(html);
                                        var num = $el.data("listData").ajbh,
                                            userId = $el.data("listData").userId,
                                            $table = $("#snapKHItemChildModal").find("#dashBoardOtherModalChildTable"),
                                            $imgTips = $("#snapKHItemChildModal").find(".dashBoardOtherModalChildTip"),
                                            $imgList = $("#snapKHItemChildModal").find(".dashBoardOtherModalChildImg"),
                                            $pagination = $("#snapKHItemChildModal").find("#dashBoardOtherModalTableChildPagination");
                                        $("#snapKHItemChildModal").modal("show").find(".modal-title").html("查询对象与申请不符预警数详情");
                                        getQueryInconsistentDetail(obj, true, 1, 10);
                                        // hover 显示中图
                                        showMiddleImg($('#dashBoardOtherModalChildTable'), $("#snapKHItemChildModal"), '.table-img');
                                        showMiddleImg($("#dashBoardOtherModalChildImg"), $("#snapKHItemChildModal"), '.table-m-img');
                                        function getQueryInconsistentDetail(obj, first, page, size) {
                                            showLoading($table);

                                            var port = 'v3/errReport/getErrSearchDetail',
                                                portData = {
                                                    startTime: configYCData.startTime,
                                                    endTime: configYCData.endTime,
                                                    apaasOrgId: obj.apaasOrgId,
                                                    roleType: configYCData.roleType,
                                                    ajbh: num,
                                                    userId,
                                                    page,
                                                    size
                                                },
                                                successFunc = function (data) {
                                                    hideLoading($table);

                                                    var columnsArr = [
                                                        // {
                                                        //     field: 'field0',
                                                        //     title: "",
                                                        //     width: 50
                                                        // },
                                                        {
                                                            field: 'field1',
                                                            title: "序号",
                                                            width: 70
                                                        }, {
                                                            field: 'field2',
                                                            title: "图片",
                                                            width: 100
                                                        }, {
                                                            field: 'field3',
                                                            title: "检索人",
                                                        }, {
                                                            field: 'field4',
                                                            title: "用户警号"
                                                        }, {
                                                            field: 'field5',
                                                            title: "机构名称"
                                                        }, {
                                                            field: 'field6',
                                                            title: "事件名称"
                                                        }, {
                                                            field: 'field7',
                                                            title: "操作时间"
                                                        }],
                                                        dataArr = [];

                                                    if (data.code === '200') {
                                                        var result = data.data.list,
                                                            imgList = data.data.urls;
                                                        $table.data({
                                                            'result': result
                                                        });

                                                        if (imgList && imgList.length > 0 && first) {
                                                            $imgTips.removeClass("hide");
                                                            imgList.forEach(item => {
                                                                $imgList.append(`<div class="table-img-box">
                                                                    <img class="table-m-img img-right-event" src="${item}" onerror="this.error=null;this.src='./assets/images/control/person.png'"/>
                                                                </div>`);
                                                            })
                                                        }

                                                        if (result && result.length > 0) {
                                                            // 添加列表
                                                            for (var j = 0; j < result.length; j++) {
                                                                var dataArrObj = {};
                                                                dataArrObj['field1'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                                                dataArrObj['field2'] = `<div style="position:relative;width: 2.375rem;height: 2.375rem;"><img class="table-img" src="${result[j].warnPicUrl ? result[j].warnPicUrl : './assets/images/control/person.png'}" onerror="this.error=null;this.src='./assets/images/control/person.png'"><span style="background: #ff5558;border-radius: 1.5rem;padding: 0 0.25rem;height:1rem;line-height:1rem;color: #fff;font-size: .75rem;position:absolute;right: 0;transform: translate(50%,-50%);">${result[j].personTotal || 0}</span></div>`;
                                                                dataArrObj['field3'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                                                dataArrObj['field4'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                                                dataArrObj['field5'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                                                dataArrObj['field6'] = `<span title="${result[j].incident || '--'}">${result[j].incident || '--'}</span>`;
                                                                dataArrObj['field7'] = `<span title="${result[j].opTime || '--'}">${result[j].opTime || '--'}</span>`;
                                                                dataArr.push(dataArrObj);
                                                            }
                                                            $table.bootstrapTable("destroy").bootstrapTable({
                                                                columns: columnsArr,
                                                                data: dataArr,
                                                                search: false,
                                                                fixedColumns: false,
                                                                detailView: true,
                                                                detailFormatter: function (index, row) {
                                                                    $("#snapKHItemChildModal").find(".queryInconsistentTable .detail-view").remove();
                                                                    var samePersonId = '';
                                                                    if ($table.find("tbody tr").eq(index).data("listData")) {
                                                                        samePersonId = $table.find("tbody tr").eq(index).data("listData").samePersonId;
                                                                    }
                                                                    var html = `<tr class="detail-view">
                                                                                    <td colspan="7">
                                                                                        <table id="queryInconsistentDetailTable" class="table-hover" data-toggle="table">
                                                                                            <tbody>
                                                                                            </tbody>
                                                                                        </table>
                                                                                        <div class="fixed-table-pagination bayonetCameralPagination" id="queryInconsistentDetailTablePagination"></div>
                                                                                    </td>
                                                                                </tr>`;
                                                                    $("#snapKHItemChildModal").find(".queryInconsistentTable tbody tr").eq(index).after(html);
                                                                    $("#snapKHItemChildModal").find(".queryInconsistentTable tbody tr").eq(index).siblings().find(".fa").removeClass("fa-minus").addClass("fa-plus");
                                                                    getQueryInconsistentDetailTable(true, 1, 10);
                                                                    function getQueryInconsistentDetailTable(first, page, size) {
                                                                        var num = $table.find("tbody tr").eq(index).data("listData").ajbh,
                                                                            userId = $table.find("tbody tr").eq(index).data("listData").userId;
                                                                        showLoading($("#snapKHItemChildModal").find(".queryInconsistentTable .detail-view"));
                                                                        var port = 'v3/errReport/getErrSearchPerson',
                                                                            portData = {
                                                                                startTime: configYCData.startTime,
                                                                                endTime: configYCData.endTime,
                                                                                samePersonId,
                                                                                ajbh: num,
                                                                                userId,
                                                                                page,
                                                                                size
                                                                            },
                                                                            successFunc = function (data) {
                                                                                hideLoading($("#snapKHItemChildModal").find(".queryInconsistentTable .detail-view"));

                                                                                if (data.code === '200' && data.data && data.data.list.length) {
                                                                                    $("#snapStatisticLoadEmpty").addClass("hide");

                                                                                    var result = data.data.list,
                                                                                        tableHtml = '';

                                                                                    // 添加列表
                                                                                    for (var j = 0; j < result.length; j++) {
                                                                                        tableHtml += `<tr class="table-row" data-index="${j}">
                                                                                                            <td>${(page - 1) * size + j + 1}</td>
                                                                                                            <td><img class="table-img" src="${result[j].warnPicUrl ? result[j].warnPicUrl : './assets/images/control/person.png'}" onerror="this.error=null;this.src='./assets/images/control/person.png'"></td>
                                                                                                            <td title="${result[j].userName || '--'}">${result[j].userName || '--'}</td>
                                                                                                            <td title="${result[j].userId || '--'}">${result[j].userId || '--'}</td>
                                                                                                            <td title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</td>
                                                                                                            <td title="${result[j].incident || '--'}">${result[j].incident || '--'}</td>
                                                                                                            <td title="${result[j].opTime || '--'}">${result[j].opTime || '--'}</td>
                                                                                                        </tr>`;
                                                                                    }
                                                                                    $("#snapKHItemChildModal").find("#queryInconsistentDetailTable tbody").empty().html(tableHtml);

                                                                                    if (data.data.total > Number(size) && first) {
                                                                                        var pageSizeOpt = [{
                                                                                            value: 10,
                                                                                            text: '10/页'
                                                                                        }, {
                                                                                            value: 20,
                                                                                            text: '20/页',
                                                                                        }];
                                                                                        var eventCallBack = function (currPage, pageSize) {
                                                                                            getQueryInconsistentDetailTable(false, currPage, pageSize);
                                                                                        };
                                                                                        setPageParams($("#snapKHItemChildModal").find("#queryInconsistentDetailTablePagination"), data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                                                                    }
                                                                                    // hover 显示中图
                                                                                    showMiddleImg($('#dashBoardOtherModalTable'), $('#snapKHItemModal'), '.table-img');
                                                                                } else {
                                                                                    $("#snapKHItemChildModal").find("#queryInconsistentDetailTable tbody").empty().html(`<div style="text-align:center">暂无数据</div>`);
                                                                                }
                                                                            };
                                                                        loadData(port, true, portData, successFunc);
                                                                    }
                                                                }
                                                            });

                                                            $table.find("tbody tr").each((index, $dom) => {
                                                                $($dom).data("listData", result[index]);
                                                            })

                                                            if (data.data.total > Number(size) && first) {
                                                                var pageSizeOpt = [{
                                                                    value: 10,
                                                                    text: '10/页'
                                                                }, {
                                                                    value: 20,
                                                                    text: '20/页',
                                                                }];
                                                                var eventCallBack = function (currPage, pageSize) {
                                                                    getQueryInconsistentDetail(obj, false, currPage, pageSize);
                                                                };
                                                                setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                                            }
                                                        } else {
                                                            //dataArr['field0'] = `没有匹配的记录`;
                                                            $table.bootstrapTable("destroy").bootstrapTable({
                                                                columns: columnsArr,
                                                                data: dataArr,
                                                                search: false,
                                                                fixedColumns: false,
                                                                detailView: false,
                                                                mergeCells: {
                                                                    index: 0,
                                                                    field: 'field0',
                                                                    colspan: 5
                                                                },
                                                                formatNoMatches: function () {
                                                                    return '没有匹配的记录';
                                                                },
                                                            });
                                                        }
                                                    } else {
                                                        //dataArr['field0'] = `没有匹配的记录`;
                                                        $table.bootstrapTable("destroy").bootstrapTable({
                                                            columns: columnsArr,
                                                            data: dataArr,
                                                            search: false,
                                                            fixedColumns: false,
                                                            detailView: false,
                                                            mergeCells: {
                                                                index: 0,
                                                                field: 'field0',
                                                                colspan: 5
                                                            },
                                                            formatNoMatches: function () {
                                                                return '没有匹配的记录';
                                                            },
                                                        });
                                                    }
                                                }
                                            loadData(port, true, portData, successFunc);
                                        }
                                    }
                                });

                                $table.find("tbody tr").each((index, $dom) => {
                                    $($dom).data("listData", result[index]);
                                })

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                                // hover 显示中图
                                showMiddleImg($('#dashBoardOtherModalTable'), $('#snapKHItemModal'), '.table-img');
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 10
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 10
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'idcardWarnCase':  //身份证撞线预警
                let html = `<form class="aui-from-horizontal aui-row">
                                <div class="aui-col-10">
                                    <div class="form-group">
                                        <label class="aui-form-label aui-col-6">身份证号码：</label>
                                        <div class="aui-col-18">
                                            <input id="idcardWarnCaseIdcard" type="text" class="aui-input" placeholder="请输入身份证号码">
                                        </div>
                                    </div>
                                </div>
                                <div class="aui-col-10">
                                    <button type="button" id="idcardWarnCaseSearch" class="btn btn-primary" style="margin-bottom:0.5rem;">搜索</button>
                                    <button type="button" id="idcardWarnCaseUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>
                                </div>
                            </form>`
                $("#snapKHItemModal").find(".modal-body .aui-from-horizontal").remove();
                $("#snapKHItemModal").find(".modal-body").prepend(html);
                let idCard = '';
                $("#snapKHItemModal").find("#idcardWarnCaseUpload").data({
                    obj,
                    idCard
                });
                getIdcardWarnList($table, $pagination, idCard, true, 1, 10);
                $("#snapKHItemModal").on("click", "#idcardWarnCaseSearch", function () {
                    idCard = $("#idcardWarnCaseIdcard").val();
                    $("#snapKHItemModal").find("#idcardWarnCaseUpload").data().idCard = idCard;
                    getIdcardWarnList($("#snapKHItemModal").find("#dashBoardOtherModalTable"), $("#snapKHItemModal").find("#dashBoardOtherModalTablePagination"), idCard, true, 1, 10);
                })

                function getIdcardWarnList($table, $pagination, idCard, first, page, size) {
                    showLoading($table);
                    if (first) {
                        $pagination.html('');
                    }

                    var port = 'v3/errReport/queryIdcardRepeatCount',
                        portData = {
                            startTime: configYCData.startTime,
                            endTime: configYCData.endTime,
                            orgId: obj.apaasOrgId,
                            idCard,
                            page,
                            size
                        },
                        successFunc = function (data) {
                            hideLoading($table);

                            var columnsArr = [{
                                field: 'field0',
                                title: "序号",
                                width: 60
                            }, {
                                field: 'field1',
                                title: '身份证'
                            }, {
                                field: 'field2',
                                title: '数量'
                            }],
                                dataArr = [];

                            if (data.code === '200') {
                                var result = data.data.list;
                                $table.data({
                                    'result': result
                                });

                                if (result && result.length > 0) {
                                    // 添加列表
                                    for (var j = 0; j < result.length; j++) {
                                        var dataArrObj = {};
                                        dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                        dataArrObj['field1'] = `<span title="${result[j].idCard || '--'}">${result[j].idCard || '--'}</span>`;
                                        dataArrObj['field2'] = `<span title="${result[j].repeatCount || '--'}">${result[j].repeatCount || '--'}</span>`;
                                        dataArr.push(dataArrObj);
                                    }
                                    $table.bootstrapTable("destroy").bootstrapTable({
                                        columns: columnsArr,
                                        data: dataArr,
                                        search: false,
                                        fixedColumns: false,
                                        detailView: false,
                                        rowStyle: function (row, index) {
                                            return {
                                                css: {
                                                    "cursor": "pointer"
                                                },
                                                classes: 'my-class'
                                            }
                                        },
                                        onClickRow: function (row, $el) {
                                            var html = `<div>
                                                            <table id="idcardWarnModalChildTable" class="table-hover"></table>
                                                            <div class="fixed-table-pagination bayonetCameralPagination" id="idcardWarnModalChildTablePagination"></div>
                                                        </div>`
                                            $("#snapKHItemChildModal").find(".modal-body").html(html);
                                            var idCard = $el.data("listData").idCard,
                                                $table = $("#snapKHItemChildModal").find("#idcardWarnModalChildTable"),
                                                $pagination = $("#snapKHItemChildModal").find("#idcardWarnModalChildTablePagination");
                                            $("#snapKHItemChildModal").modal("show").find(".modal-title").html("身份证撞线预警明细");
                                            getIdcardWarnChildDetail(obj, true, 1, 10);
                                            function getIdcardWarnChildDetail(obj, first, page, size) {
                                                showLoading($table);

                                                var port = 'v3/errReport/queryIdcardRepeats',
                                                    portData = {
                                                        startTime: configYCData.startTime,
                                                        endTime: configYCData.endTime,
                                                        orgId: obj.apaasOrgId,
                                                        idCard,
                                                        page,
                                                        size
                                                    },
                                                    successFunc = function (data) {
                                                        hideLoading($table);

                                                        var columnsArr = [{
                                                            field: 'field0',
                                                            title: "序号",
                                                            width: 60
                                                        }, {
                                                            field: 'field1',
                                                            title: "身份证"
                                                        }, {
                                                            field: 'field2',
                                                            title: "姓名"
                                                        }, {
                                                            field: 'field3',
                                                            title: "案件名称"
                                                        }, {
                                                            field: 'field4',
                                                            title: "单位名称"
                                                        }, {
                                                            field: 'field5',
                                                            title: "检索人",
                                                            width: 80
                                                        }, {
                                                            field: 'field6',
                                                            title: "检索人警号",
                                                            width: 80
                                                        }, {
                                                            field: 'field7',
                                                            title: "检索时间"
                                                        }],
                                                            dataArr = [];

                                                        if (data.code === '200') {
                                                            var result = data.data.list;
                                                            $table.data({
                                                                'result': result
                                                            });

                                                            if (result && result.length > 0) {
                                                                // 添加列表
                                                                for (var j = 0; j < result.length; j++) {
                                                                    var dataArrObj = {};
                                                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                                                    dataArrObj['field1'] = `<span title="${result[j].idCard || '--'}">${result[j].idCard || '--'}</span>`;
                                                                    dataArrObj['field2'] = `<span title="${result[j].name || '--'}">${result[j].name || '--'}</span>`;
                                                                    dataArrObj['field3'] = `<span class="text-link incidentShow" title="${result[j].incidentName || '--'}">${result[j].incidentName || '--'}</span>`;
                                                                    dataArrObj['field4'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                                                    dataArrObj['field5'] = `<span title="${result[j].nickname || '--'}">${result[j].nickname || '--'}</span>`;
                                                                    dataArrObj['field6'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                                                    dataArrObj['field7'] = `<span title="${result[j].opTime || '0'}">${result[j].opTime || '0'}</span>`;
                                                                    dataArr.push(dataArrObj);
                                                                }
                                                                $table.bootstrapTable("destroy").bootstrapTable({
                                                                    columns: columnsArr,
                                                                    data: dataArr,
                                                                    search: false,
                                                                    fixedColumns: false,
                                                                    detailView: false
                                                                });

                                                                $table.find("tbody tr").each((index, $dom) => {
                                                                    $($dom).data("listData", result[index]);
                                                                })

                                                                if (data.data.total > Number(size) && first) {
                                                                    var pageSizeOpt = [{
                                                                        value: 10,
                                                                        text: '10/页'
                                                                    }, {
                                                                        value: 20,
                                                                        text: '20/页',
                                                                    }];
                                                                    var eventCallBack = function (currPage, pageSize) {
                                                                        getIdcardWarnChildDetail(obj, false, currPage, pageSize);
                                                                    };
                                                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                                                }
                                                            } else {
                                                                //dataArr['field0'] = `没有匹配的记录`;
                                                                $table.bootstrapTable("destroy").bootstrapTable({
                                                                    columns: columnsArr,
                                                                    data: dataArr,
                                                                    search: false,
                                                                    fixedColumns: false,
                                                                    detailView: false,
                                                                    mergeCells: {
                                                                        index: 0,
                                                                        field: 'field0',
                                                                        colspan: 5
                                                                    },
                                                                    formatNoMatches: function () {
                                                                        return '没有匹配的记录';
                                                                    },
                                                                });
                                                            }
                                                        } else {
                                                            //dataArr['field0'] = `没有匹配的记录`;
                                                            $table.bootstrapTable("destroy").bootstrapTable({
                                                                columns: columnsArr,
                                                                data: dataArr,
                                                                search: false,
                                                                fixedColumns: false,
                                                                detailView: false,
                                                                mergeCells: {
                                                                    index: 0,
                                                                    field: 'field0',
                                                                    colspan: 5
                                                                },
                                                                formatNoMatches: function () {
                                                                    return '没有匹配的记录';
                                                                },
                                                            });
                                                        }
                                                    }
                                                loadData(port, true, portData, successFunc);
                                            }
                                        }
                                    });

                                    $table.find("tbody tr").each((index, $dom) => {
                                        $($dom).data("listData", result[index]);
                                    })

                                    if (data.data.total > Number(size) && first) {
                                        var pageSizeOpt = [{
                                            value: 10,
                                            text: '10/页'
                                        }, {
                                            value: 20,
                                            text: '20/页',
                                        }];
                                        var eventCallBack = function (currPage, pageSize) {
                                            getIdcardWarnList($table, $pagination, idCard, false, currPage, pageSize);
                                        };
                                        setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                    }
                                } else {
                                    //dataArr['field0'] = `没有匹配的记录`;
                                    $table.bootstrapTable("destroy").bootstrapTable({
                                        columns: columnsArr,
                                        data: dataArr,
                                        search: false,
                                        fixedColumns: false,
                                        detailView: false,
                                        mergeCells: {
                                            index: 0,
                                            field: 'field0',
                                            colspan: 3
                                        },
                                        formatNoMatches: function () {
                                            return '没有匹配的记录';
                                        },
                                    });
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 3
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        }
                    loadData(port, true, portData, successFunc);
                }
                break;
            case 'useCountIsZero':  //使用次数为0账号
                let htmlUseCountIsZero = `<div class="aui-from-horizontal aui-row" id="useCountIsZeroForm">
                                            <div class="aui-col-6">
                                                <div class="form-group">
                                                    <label class="aui-form-label aui-col-8">机构名称：</label>
                                                    <div class="aui-col-16">
                                                        <select class="selectpicker" id="orgIdUseCountIsZero" data-live-search="true"></select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="aui-col-6">
                                                <div class="form-group">
                                                    <label class="aui-form-label aui-col-8">用户名称：</label>
                                                    <div class="aui-col-16">
                                                        <input id="userNameUseCountIsZero" type="text" class="aui-input" placeholder="请输入用户名称">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="aui-col-6">
                                                <div class="form-group">
                                                    <label class="aui-form-label aui-col-8">用户账号：</label>
                                                    <div class="aui-col-16">
                                                        <input id="userIdUseCountIsZero" type="text" class="aui-input" placeholder="请输入用户账号">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="aui-col-6">
                                                <button type="button" id="useCountIsZeroSearch" class="btn btn-primary" style="margin-bottom:0.5rem;">搜索</button>
                                                <button type="button" id="useCountIsZeroUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>
                                            </div>
                                        </div>`
                $("#snapKHItemModal").find(".modal-body #useCountIsZeroForm").remove();
                $("#snapKHItemModal").find(".modal-body").prepend(htmlUseCountIsZero);
                $("#snapKHItemModal").find("#useCountIsZeroUpload").data({
                    obj,
                    orgId: obj.apaasOrgId
                });
                getAllOrgIdOpe($("#snapKHItemModal").find("#orgIdUseCountIsZero"), obj.apaasOrgId, 2, 2);
                getQueryUseIsZeroCount(type, obj, $table, $pagination, first, page, size);
                break;
            case 'notUseAccountNum':  //未使用人数
                if (first) {
                    $("#snapKHItemModal").find(".modal-body").prepend(`<button type="button" id="notUseAccountNumUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>`);
                }
                $("#snapKHItemModal").find("#notUseAccountNumUpload").data("data", obj);
                var port = 'v3/report/getNotLoginPersonDetail',
                    portData = {
                        startTime: configKHData.startTime,
                        endTime: configKHData.endTime,
                        orgId: obj.orgId,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configKHData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "登录用户姓名"
                        }, {
                            field: 'field2',
                            title: "用户账号"
                        }, {
                            field: 'field3',
                            title: "手机号码"
                        }, {
                            field: 'field4',
                            title: "用户所属机构名称"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].telephone || '--'}">${result[j].telephone || '--'}</span>`;
                                    dataArrObj['field4'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 5
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 5
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
        }
    }

    //使用次数为0一级列表获取
    function getQueryUseIsZeroCount(type, obj, $table, $pagination, first, page, size) {
        var port = 'v3/errReport/queryUseIsZeroCount',
            portData = {
                startTime: configYCData.startTime,
                endTime: configYCData.endTime,
                orgId: $("#snapKHItemModal").find("#useCountIsZeroUpload").data("orgId"),
                userName: $("#snapKHItemModal").find("#userNameUseCountIsZero").val() || '',
                userId: $("#snapKHItemModal").find("#userIdUseCountIsZero").val() || '',
                page,
                size
            },
            successFunc = function (data) {
                hideLoading($table);

                var columnsArr = [{
                    field: 'field0',
                    title: "序号",
                    width: 60
                }, {
                    field: 'field1',
                    title: "用户名称",
                }, {
                    field: 'field2',
                    title: "用户账号",
                }, {
                    field: 'field3',
                    title: "机构名称"
                }, {
                    field: 'field4',
                    title: "已使用次数"
                }],
                    dataArr = [];

                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });

                    if (result && result.length > 0) {
                        // 添加列表
                        for (var j = 0; j < result.length; j++) {
                            var dataArrObj = {};
                            dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                            dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                            dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                            dataArrObj['field3'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                            dataArrObj['field4'] = `<span title="${result[j].useCount || '--'}">${result[j].useCount || '--'}</span>`;
                            dataArr.push(dataArrObj);
                        }
                        $table.bootstrapTable("destroy").bootstrapTable({
                            columns: columnsArr,
                            data: dataArr,
                            search: false,
                            fixedColumns: false,
                            detailView: false,
                            rowStyle: function (row, index) {
                                return {
                                    css: {
                                        "cursor": "pointer"
                                    },
                                    classes: 'my-class'
                                }
                            },
                            onClickRow: function (row, $el) {
                                var html = `<button type="button" id="useCountIsZeroDetailUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>
                                                    <table id="dashBoardOtherModalChildTable" class="table-hover"></table>
                                                    <div class="fixed-table-pagination bayonetCameralPagination" id="dashBoardOtherModalTableChildPagination"></div>`
                                $("#snapKHItemChildModal").find(".modal-body").html(html);
                                $("#snapKHItemChildModal").find("#useCountIsZeroDetailUpload").data({
                                    listData: $el.data("listData"),
                                    obj
                                });
                                var num = $el.data("listData").useCount,
                                    userId = $el.data("listData").userId,
                                    $table = $("#snapKHItemChildModal").find("#dashBoardOtherModalChildTable"),
                                    $pagination = $("#snapKHItemChildModal").find("#dashBoardOtherModalTableChildPagination");
                                $("#snapKHItemChildModal").modal("show").find(".modal-title").html("使用次数为0账号检索明细");
                                getQueryInconsistentDetail(obj, true, 1, 10);
                                function getQueryInconsistentDetail(obj, first, page, size) {
                                    showLoading($table);

                                    var port = 'v3/errReport/queryUseIsZeroCountDetail',
                                        portData = {
                                            startTime: configYCData.startTime,
                                            endTime: configYCData.endTime,
                                            orgId: obj.apaasOrgId,
                                            rowNum: num,
                                            userId,
                                            page,
                                            size
                                        },
                                        successFunc = function (data) {
                                            hideLoading($table);

                                            var columnsArr = [
                                                {
                                                    field: 'field1',
                                                    title: "序号",
                                                    width: 70
                                                }, {
                                                    field: 'field2',
                                                    title: "图片",
                                                }, {
                                                    field: 'field3',
                                                    title: "检索人",
                                                }, {
                                                    field: 'field4',
                                                    title: "检索账号"
                                                }, {
                                                    field: 'field5',
                                                    title: "机构名称"
                                                }, {
                                                    field: 'field6',
                                                    title: "事件名称"
                                                }, {
                                                    field: 'field7',
                                                    title: "操作时间"
                                                }],
                                                dataArr = [];

                                            if (data.code === '200') {
                                                var result = data.data.list;
                                                $table.data({
                                                    'result': result
                                                });

                                                if (result && result.length > 0) {
                                                    // 添加列表
                                                    for (var j = 0; j < result.length; j++) {
                                                        var dataArrObj = {};
                                                        dataArrObj['field1'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                                        dataArrObj['field2'] = `<div style="position:relative;width: 2.375rem;height: 2.375rem;"><img class="table-img" src="${result[j].picUrl ? result[j].picUrl : './assets/images/control/person.png'}" onerror="this.error=null;this.src='./assets/images/control/person.png'"></div>`;
                                                        dataArrObj['field3'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                                        dataArrObj['field4'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                                        dataArrObj['field5'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                                        dataArrObj['field6'] = `<span title="${result[j].incidentName || '--'}">${result[j].incidentName || '--'}</span>`;
                                                        dataArrObj['field7'] = `<span title="${result[j].opTime || '--'}">${result[j].opTime || '--'}</span>`;
                                                        dataArr.push(dataArrObj);
                                                    }
                                                    $table.bootstrapTable("destroy").bootstrapTable({
                                                        columns: columnsArr,
                                                        data: dataArr,
                                                        search: false,
                                                        fixedColumns: false,
                                                        detailView: false
                                                    });

                                                    $table.find("tbody tr").each((index, $dom) => {
                                                        $($dom).data("listData", result[index]);
                                                    })

                                                    if (data.data.total > Number(size) && first) {
                                                        var pageSizeOpt = [{
                                                            value: 10,
                                                            text: '10/页'
                                                        }, {
                                                            value: 20,
                                                            text: '20/页',
                                                        }];
                                                        var eventCallBack = function (currPage, pageSize) {
                                                            getQueryInconsistentDetail(obj, false, currPage, pageSize);
                                                        };
                                                        setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                                    }

                                                    // hover 显示中图
                                                    showMiddleImg($('#dashBoardOtherModalChildTable'), $("#snapKHItemChildModal"), '.table-img');
                                                } else {
                                                    //dataArr['field0'] = `没有匹配的记录`;
                                                    $table.bootstrapTable("destroy").bootstrapTable({
                                                        columns: columnsArr,
                                                        data: dataArr,
                                                        search: false,
                                                        fixedColumns: false,
                                                        detailView: false,
                                                        mergeCells: {
                                                            index: 0,
                                                            field: 'field0',
                                                            colspan: 5
                                                        },
                                                        formatNoMatches: function () {
                                                            return '没有匹配的记录';
                                                        },
                                                    });
                                                }
                                            } else {
                                                //dataArr['field0'] = `没有匹配的记录`;
                                                $table.bootstrapTable("destroy").bootstrapTable({
                                                    columns: columnsArr,
                                                    data: dataArr,
                                                    search: false,
                                                    fixedColumns: false,
                                                    detailView: false,
                                                    mergeCells: {
                                                        index: 0,
                                                        field: 'field0',
                                                        colspan: 5
                                                    },
                                                    formatNoMatches: function () {
                                                        return '没有匹配的记录';
                                                    },
                                                });
                                            }
                                        }
                                    loadData(port, true, portData, successFunc);
                                }
                            }
                        });

                        $table.find("tbody tr").each((index, $dom) => {
                            $($dom).data("listData", result[index]);
                        })

                        if (data.data.total > Number(size) && first) {
                            var pageSizeOpt = [{
                                value: 10,
                                text: '10/页'
                            }, {
                                value: 20,
                                text: '20/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                        // hover 显示中图
                        showMiddleImg($('#dashBoardOtherModalTable'), $('#snapKHItemModal'), '.table-img');
                    } else {
                        //dataArr['field0'] = `没有匹配的记录`;
                        $table.bootstrapTable("destroy").bootstrapTable({
                            columns: columnsArr,
                            data: dataArr,
                            search: false,
                            fixedColumns: false,
                            detailView: false,
                            mergeCells: {
                                index: 0,
                                field: 'field0',
                                colspan: 10
                            },
                            formatNoMatches: function () {
                                return '没有匹配的记录';
                            },
                        });
                    }
                } else {
                    //dataArr['field0'] = `没有匹配的记录`;
                    $table.bootstrapTable("destroy").bootstrapTable({
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: false,
                        detailView: false,
                        mergeCells: {
                            index: 0,
                            field: 'field0',
                            colspan: 10
                        },
                        formatNoMatches: function () {
                            return '没有匹配的记录';
                        },
                    });
                }
            }
        loadData(port, true, portData, successFunc);
    }

    //使用次数为0搜索事件
    $("#snapKHItemModal").on("click", "#useCountIsZeroSearch", function () {
        $("#snapKHItemModal").find("#useCountIsZeroUpload").data({
            userName: $("#snapKHItemModal").find("#userNameUseCountIsZero").val() || '',
            userId: $("#snapKHItemModal").find("#userIdUseCountIsZero").val() || '',
            orgId: $("#snapKHItemModal").find("#orgIdUseCountIsZero").val()
        })
        getQueryUseIsZeroCount('useCountIsZero', $("#snapKHItemModal").find("#useCountIsZeroUpload").data("obj"), $("#snapKHItemModal").find("#dashBoardOtherModalTable"), $("#snapKHItemModal").find("#dashBoardOtherModalTablePagination"), true, 1, 10);
    })

    //全局小图右键事件
    $(document).on("mousedown", ".showCameraPage", function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#rightMouseCameraMenu').off().remove();
        if (e.which == 3) {
            var that = $(this),
                cameraName = that.text(),
                cameraId = that.attr("cameraId"),
                $menu = $([
                    '<ul class="mask-camera-list" id="rightMouseCameraMenu" style="z-index:19991018">',
                    '   <li class="mask-camera-item" type="0">实时监控和抓拍图</li>',
                    '   <li class="mask-camera-item" type="1">历史监控和抓拍图</li>',
                    '   <li class="mask-camera-item" type="2">历史抓拍图</li>',
                    '   <li class="mask-camera-item" type="3">一键报障</li>',
                    '</ul>',
                ].join('')),
                menuLen = $('#rightMouseCameraMenu').length;
            if (menuLen > 0) {
                $('#rightMouseCameraMenu').off().remove();
            }
            $('body').append($menu);

            // 给右键菜单添加绑定事件
            $menu.find('.mask-camera-item').off('click').on('click', function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                if ($(this).hasClass("disabled")) {
                    return;
                }
                var menuIndex = $(this).attr("type");
                if (menuIndex == '0') { // 实时监控和抓拍图
                    showMapVideo('playAndCatch', [{ id: cameraId, name: cameraName }], [cameraId]);
                } else if (menuIndex == '1') {  //历史监控和抓拍图
                    showMapVideo('videoReplayAndHisCatch', [{ id: cameraId, name: cameraName }], [cameraId]);
                } else if (menuIndex == '2') { // 历史抓拍图
                    showMapVideo('hisCatch', [{ id: cameraId, name: cameraName }], [cameraId]);
                } else if (menuIndex == '3') { // 一键报障
                    warningTip.say('暂未开发');
                }

                $("#rightMouseCameraMenu").addClass('hide');
            });

            var menuWidth = $('#rightMouseCameraMenu').outerWidth(),
                menuHeight = $('#rightMouseCameraMenu').outerHeight(),
                bodyWidth = $('body').outerWidth(),
                bodyHeight = $('body').outerHeight();
            if (e.clientX + menuWidth > bodyWidth - 20) {
                $menu.css({
                    left: e.clientX - menuWidth
                });
            } else {
                $menu.css({
                    left: e.clientX
                });
            }
            if (e.clientY + menuHeight > bodyHeight - 20) {
                $menu.css({
                    top: e.clientY - menuHeight + $(document).scrollTop()
                });
            } else {
                $menu.css({
                    top: e.clientY + $(document).scrollTop()
                });
            }
            // 绑定全局点击右键菜单消失代码
            $(document).off('click.showCameraPage').on('click.showCameraPage', function () {
                $('#rightMouseCameraMenu').addClass('hide');
            });
            // 给生成的菜单栏里面进行事件阻止
            $('#rightMouseCameraMenu')[0].addEventListener('contextmenu', function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
            });
        }
    });

    //考核列展开事件
    $("#snapStatisticModal").on("click", ".detail-icon.khDataList i", function () {
        $("#snapStatisticModal").find(".dataDeatil").remove();
        if ($(this).parent().hasClass("rotate")) {
            $(this).parent().removeClass("rotate");
        } else {
            $(this).parents("tr").siblings().find("a").removeClass("rotate");
            $(this).parent().addClass("rotate");
            let index = $(this).parents("tr").index(),
                orgId = $(this).parent().attr("orgId"),
                $table = $("#snapStatisticTable");
            configKHData.orgId = orgId;
            showLoading($('#snapStatisticModal .modal-body'));
            var $thead = $table.find('thead');
            var $tbody = $table.find('tbody');
            var port = 'v3/report/reportStatisticDetail',
                successFunc = function (data) {
                    hideLoading($('#snapStatisticModal .modal-body'));

                    if (data.code === '200' && data.data && data.data.length > 0) {
                        $("#snapStatisticLoadEmpty").addClass("hide");
                        var result = data.data;
                        $table.data({
                            'result': result
                        });

                        var dataList = [];
                        for (key in result[0]) {
                            if (key != 'orgId' && key != 'orgName') {
                                dataList.push(key);
                            }
                        }

                        var html = '',
                            htmlcolumns = '';
                        // 添加列表
                        for (var j = 0; j < result.length; j++) {
                            html += `<tr class="dataDeatil">
                                        <td></td>
                                        <td>${result[j].orgName}</td>`;
                            htmlcolumns += `<tr class="dataDeatil">
                                                <td style="width:50px"></td>
                                                <td style="width:100px">${result[j].orgName}</td>
                                            </tr>`;
                            for (var k = 0; k < dataList.length; k++) {
                                var data = parseFloat(result[j][dataList[k]]).toLocaleString();
                                html += `<td>${data}</td>`;
                            }
                            html += `</tr>`;
                        }
                        $("#snapStatisticModal").find(".fixed-table-body-columns tbody tr").eq(index).after(htmlcolumns);
                        $("#snapStatisticTable").find("tbody tr").eq(index).after(html);
                    } else {
                        $("#snapStatisticLoadEmpty").removeClass("hide");
                        warningTip.say(data.message);
                    }
                };
            loadData(port, true, configKHData, successFunc);
        }
    });

    //考核列表静态人像比对次数和动态人像比对次数列点击展示
    $("#snapMoreTypeModal").on("click", ".staticNum,.dynamicNum", function () {
        if ($(this).html() == '0') {
            return;
        }
        $("#snapKHItemModal").modal("show").find(".modal-title").html(commonGetKHName($(this).attr("class").split(" ")[1]));
        $("#sysManageContentPage").html("");
        var data = $(this).parents("tr").data("listData"),
            $dom = $("#snapKHItemModal").find(".modal-body"),
            url = "./facePlatform/searchManage.html?dynamic=" + Global.dynamic,
            orgId = '',
            policeId = '',
            apaasOrgId = data.apaasOrgId;

        for (var target of $("#sys-manage-tree-list").find("li")) {
            if ($(target).attr("modulecode") == '260918') {
                $(target).attr("link", 1);
            }
        }

        if (configKHData.orgId != '10') {
            orgId = $(this).parents("tbody").find("tr").eq(0).data("listData").orgId;
            policeId = data.orgId;
        } else {
            orgId = data.orgId;
        }
        $("#snapKHItemModal").data({
            orgId,
            policeId,
            apaasOrgId
        });
        loadPage($dom, url);
        $dom.css('padding', '0');
        $("#searchManageType").val($(this).hasClass("staticNum") ? '118002001' : '118002002');
        $("#searchManageType").selectmenu('refresh');

        $("#searchManageRoleType").val(configKHData.roleType);
        $("#searchManageRoleType").selectmenu('refresh');

        $("#startTimeSearchManage").val(`${configKHData.startTime} 00:00:00`);
        $("#endTimeSearchManage").val(`${configKHData.endTime} 23:59:59`);
        $("#startTimeSearchManage").blur();
        $("#endTimeSearchManage").blur();

    });

    //考核列表权限申请列点击展示
    $("#snapMoreTypeModal").on("click", ".applyAllNum,.applyLaNum,.applyJqNum,.applyZaNum,.applyEmergentNum,.applyXbNum", function () {
        if ($(this).html() == '0') {
            return;
        }
        $("#snapKHItemModal").modal("show").find(".modal-title").html(commonGetKHName($(this).attr("class").split(" ")[1]));
        $("#sysManageContentPage").html("");
        var data = $(this).parents("tr").data("listData"),
            $dom = $("#snapKHItemModal").find(".modal-body"),
            url = "./facePlatform/permission-apply-manage.html?dynamic=" + Global.dynamic,
            orgId = '',
            policeId = '',
            apaasOrgId = data.apaasOrgId,
            type = ''; //type 1是除了紧急警务其他的类型   7是紧急警务

        if (configKHData.orgId != '10') {
            orgId = $(this).parents("tbody").find("tr").eq(0).data("listData").orgId;
            policeId = data.orgId;
        } else {
            orgId = data.orgId;
        }

        if ($(this).hasClass("applyLaNum")) {
            type = '3';
        } else if ($(this).hasClass("applyXbNum")) {
            type = '6';
        } else if ($(this).hasClass("applyJqNum")) {
            type = '2';
        } else if ($(this).hasClass("applyZaNum")) {
            type = '4';
        } else if ($(this).hasClass("applyEmergentNum")) {
            type = '7';
        }

        $("#snapKHItemModal").data({
            orgId,
            policeId,
            type,
            apaasOrgId
        });

        loadPage($dom, url);
        $dom.css('padding', '0');

        $("#startTimePAMTwo").val(`${configKHData.startTime} 00:00:00`);
        $("#endTimePAMTwo").val(`${configKHData.endTime} 23:59:59`);
        $("#startTimePAM").val(`${configKHData.startTime} 00:00:00`);
        $("#endTimePAM").val(`${configKHData.endTime} 23:59:59`);

        $("#permissionApplyRoleType").val(configKHData.roleType);
        $("#permissionApplyRoleType").selectmenu('refresh');
        $("#permissionApplyRoleTypeTwo").val(configKHData.roleType);
        $("#permissionApplyRoleTypeTwo").selectmenu('refresh');
    });

    //考核列表登录列点击展示
    $("#snapMoreTypeModal").on("click", ".accountNum,.loginPersonNum,.loginAllNum,.notUseAccountNum", function () {
        if ($(this).html() == '0') {
            return;
        }
        $("#snapKHItemModal").modal("show").find(".modal-title").html(commonGetKHName($(this).attr("class").split(" ")[1]));
        var data = $(this).parents("tr").data("listData"),
            $dom = $("#snapKHItemModal").find(".modal-body");

        var html = `<table id="dashBoardOtherModalTable" class="table-hover"></table>
                    <div class="fixed-table-pagination bayonetCameralPagination" id="dashBoardOtherModalTablePagination"></div>`
        $dom.append(html);
        $dom.css('padding', '0.5rem 1.5rem');
        getDashBoardOtherModalTable($(this).attr("class").split(" ")[1], data, $("#snapKHItemModal").find("#dashBoardOtherModalTable"), $("#snapKHItemModal").find("#dashBoardOtherModalTablePagination"), true, 1, 10);
    });

    //未补办手续数、异常列表超时、异常登录数、案件查询异常数、重复申请数、查询对象与申请不符预警数 点击展示
    $("#snapMoreTypeModal").on("click", ".untimelyMakeUp,.overdueUnused,.abnormalLogin,.abnormalCase,.repeatCase,.queryInconsistent,.idcardWarnCase,.useCountIsZero", function () {
        if ($(this).html() == '0') {
            return;
        }
        $("#snapKHItemModal").modal("show").find(".modal-title").html(commonGetYCName($(this).attr("class").split(" ")[1]));
        var data = $(this).parents("tr").data("listData"),
            $dom = $("#snapKHItemModal").find(".modal-body");

        var html = `<table id="dashBoardOtherModalTable" class="table-hover"></table>
                    <div class="fixed-table-pagination bayonetCameralPagination" id="dashBoardOtherModalTablePagination"></div>`
        $dom.append(html);
        $dom.css('padding', '0.5rem 1.5rem');
        getDashBoardOtherModalTable($(this).attr("class").split(" ")[1], data, $("#snapKHItemModal").find("#dashBoardOtherModalTable"), $("#snapKHItemModal").find("#dashBoardOtherModalTablePagination"), true, 1, 10);
    });

    //身份证撞线事件详情点击事件
    $("#snapKHItemChildModal").on("click", ".incidentShow", function () {
        var targetData = $(this).parents("tr").data("listData"),
            url = "./facePlatform/incident-dialog.html";
        if (targetData.incidentInfo) {
            $('.incident-new-popup').data({
                incidentDetail: targetData.incidentInfo,
                showDynamicDetail: true
            });
            loadPage($('.incident-new-popup'), url);
            $('.incident-new-popup').removeClass('hide');
        } else {
            warningTip.say("暂无详情数据");
        }
    })

    //超时未使用导出点击事件
    $("#snapKHItemModal").on("click", "#overdueUnusedUpload", function () {
        var data = $(this).data("data") || {};
        var post_url = encodeURI(serviceUrl + '/v3/errReport/exportNotLoginUserDetail?startTime=' + configYCData.startTime + '&endTime=' + configYCData.endTime + '&orgId=' + configKHData.orgId + '&roleType=' + configYCData.roleType + '&apaasOrgId=' + data.apaasOrgId + '&token=' + $.cookie('xh_token'));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //未使用人数
    $("#snapKHItemModal").on("click", "#notUseAccountNumUpload", function () {
        var data = $(this).data("data") || {};
        var post_url = encodeURI(serviceUrl + '/v3/report/exportNotLoginPersonDetail?startTime=' + configKHData.startTime + '&endTime=' + configKHData.endTime + '&roleType=' + configKHData.roleType + '&apaasOrgId=' + data.apaasOrgId + '&token=' + $.cookie('xh_token'));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //未补办手续导出点击事件
    $("#snapKHItemModal").on("click", "#untimelyMakeUpUpload", function () {
        var data = $(this).data("data") || {};
        var post_url = encodeURI(serviceUrl + '/v3/errReport/exportUntimelyMakeUpDetail?startTime=' + configYCData.startTime + '&endTime=' + configYCData.endTime + '&orgId=' + configKHData.orgId + '&roleType=' + configYCData.roleType + '&apaasOrgId=' + data.apaasOrgId + '&token=' + $.cookie('xh_token'));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //未补办手续导出点击事件
    $("#snapKHItemModal").on("click", "#untimelyMakeUpUpload", function () {
        var data = $(this).data("data") || {};
        var post_url = encodeURI(serviceUrl + '/v3/errReport/exportUntimelyMakeUpDetail?startTime=' + configYCData.startTime + '&endTime=' + configYCData.endTime + '&orgId=' + configKHData.orgId + '&roleType=' + configYCData.roleType + '&apaasOrgId=' + data.apaasOrgId + '&token=' + $.cookie('xh_token'));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //人脸导出点击事件
    $("#snapMoreTypeModal").on("click", "#snapStatisticImportRL", function () {
        var data = $(this).data("data") || {};
        var post_url = encodeURI(serviceUrl + '/v3/myApplication/exportPlatFaceUseStatistic?type=' + ($("#rlBtnGrounp").find(".btn.btn-primary").index() + 1) + '&token=' + $.cookie('xh_token'));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //身份证撞线导出点击事件
    $("#snapKHItemModal").on("click", "#idcardWarnCaseUpload", function () {
        var idCard = $(this).data("idCard") || '',
            data = $(this).data("obj");
        var post_url = encodeURI(serviceUrl + '/v3/errReport/exportIdcardRepeatDetail?startTime=' + configYCData.startTime + '&endTime=' + configYCData.endTime + '&orgId=' + data.apaasOrgId + '&idCard=' + idCard + '&token=' + $.cookie('xh_token'));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //身份证撞线导出点击事件
    $("#snapKHItemModal").on("click", "#queryInconsistentUpload", function () {
        var data = $(this).data("obj");
        var post_url = encodeURI(serviceUrl + '/v3/errReport/exportErrSearchSecond?startTime=' + configYCData.startTime + '&endTime=' + configYCData.endTime + '&apaasOrgId=' + data.apaasOrgId + '&roleType=' + configYCData.roleType + '&token=' + $.cookie('xh_token'));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //使用次数不为0导出点击事件
    $("#snapKHItemModal").on("click", "#useCountIsZeroUpload", function () {
        var orgId = $(this).data("orgId"),
            userName = $(this).data("userName") || '',
            userId = $(this).data("userId") || '';
        var post_url = encodeURI(serviceUrl + '/v3/errReport/exportUseIsZeroCount?startTime=' + configYCData.startTime + '&endTime=' + configYCData.endTime + '&orgId=' + orgId + '&roleType=' + configYCData.roleType + '&userId=' + userId + '&userName=' + userName + '&token=' + $.cookie('xh_token'));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //使用次数不为0详情导出点击事件
    $("#snapKHItemChildModal").on("click", "#useCountIsZeroDetailUpload", function () {
        var listData = $(this).data("listData"),
            objData = $(this).data("obj");
        var post_url = encodeURI(serviceUrl + '/v3/errReport/exportUseIsZeroCountDetail?startTime=' + configYCData.startTime + '&endTime=' + configYCData.endTime + '&orgId=' + objData.apaasOrgId + '&rowNum=' + listData.useCount + '&userId=' + listData.userId + '&token=' + $.cookie('xh_token'));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //账号总数导出事件
    $("#snapKHItemModal").on("click", "#accountNumUpload", function () {
        var objData = $(this).data("data"),
            uploadData = {
                startTime: configKHData.startTime,
                endTime: configKHData.endTime,
                roleType: configKHData.roleType,
                apaasOrgId: objData.apaasOrgId,
                token: $.cookie('xh_token')
            };
        var post_url = encodeURI(serviceUrl + '/v3/report/exportAccountDetail?param=' + JSON.stringify(uploadData));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //登录总人数导出事件
    $("#snapKHItemModal").on("click", "#loginPersonNumUpload", function () {
        var objData = $(this).data("data"),
            uploadData = {
                startTime: configKHData.startTime,
                endTime: configKHData.endTime,
                roleType: configKHData.roleType,
                apaasOrgId: objData.apaasOrgId,
                token: $.cookie('xh_token')
            };
        var post_url = encodeURI(serviceUrl + '/v3/report/exportLoginPersonDetail?param=' + JSON.stringify(uploadData));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //登录总次数导出事件
    $("#snapKHItemModal").on("click", "#loginAllNumUpload", function () {
        var objData = $(this).data("data"),
            uploadData = {
                startTime: configKHData.startTime,
                endTime: configKHData.endTime,
                roleType: configKHData.roleType,
                apaasOrgId: objData.apaasOrgId,
                token: $.cookie('xh_token')
            };
        var post_url = encodeURI(serviceUrl + '/v3/report/exportLoginCountDetail?param=' + JSON.stringify(uploadData));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //考核列表弹窗关闭按钮点击事件
    $("#snapKHItemModal").on("click", "#powerUsageCountTwoClose", function () {
        $("#snapKHItemModal").find(".modal-body").html("");
        $("#snapKHItemModal").modal("hide");
    });

    //统计报表周报日报切换
    $("#snapMoreTypeModal").on("click", ".khData .ui-checkboxradio-button", function () {
        if ($(this).next().val() == 2) { //周报
            $(this).parents(".khData").find(".khDataWeek").removeClass("hide");
            $(this).parents(".khData").find(".khDataDay").addClass("hide");
        } else {
            $(this).parents(".khData").find(".khDataWeek").addClass("hide");
            $(this).parents(".khData").find(".khDataDay").removeClass("hide");
        }
    })

    //统计报表按钮点击事件
    $("#allListBtn").on("click", function () {
        $("#snapMoreTypeModal").removeClass("hide");
        $("#snapStatisticTableKH").bootstrapTable("destroy");
        $("#snapStatisticTableYC").bootstrapTable("destroy");
        $("#snapStatisticTableGJ").bootstrapTable("destroy");
        $("#snapStatisticTableCJ").bootstrapTable("destroy");
        $("#snapStatisticTableCJTwo").bootstrapTable("destroy");
        $("#snapStatisticTableDJ").bootstrapTable("destroy");
        getAllOrgId($("#snapMoreTypeModal"));
        getAllOrgIdOpe($("#orgIdDataYW"));

        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });

        $("#YWCameraName").val("");
        $("#YWGBCode").val("");
        $("#khDataMoreOne").click();
        $("#cjDataMoreOne").click();
        $("#snapRoleTypeKHOne").click();
        $("#snapRoleTypeYCOne").click();
        $("#snapCameraYWOne").click();
        $("#snapPicYWOne").click();
        $("#snapHPicYWOne").click();

        $("#rlBtnGrounp").find(".btn").eq(0).click();
        $("#rlTabChange").find(".btn").eq(0).click();

        let nowDate = new Date(),
            nowDay = nowDate.getDate(),
            maxDateStr = `${nowDay > 25 ? "\'%y-%M\'" : "\'%y-#{%M-1}\'"}`;
        $("#timeSnapMoreStatYC").html(`<input id="startTimeSnapMoreStatYC" 
                                            class="input-text datepicker-input radius Wdate" 
                                            type="text"/>
                                        <span class="input-group-addon">~</span>
                                        <input id="endTimeSnapMoreStatYC" 
                                                class="input-text datepicker-input radius Wdate" 
                                                type="text"/>
                                        <span class="input-group-addon">
                                            <i class="datepicker-icon aui-icon-calendar"></i>
                                        </span>`);

        //选择时间初始化
        $("#startTimeSnapMoreStatYC").off("click").on("click", function () {
            WdatePicker({
                maxDate: '#F{$dp.$D(\'endTimeSnapMoreStatYC\')}',
                dateFmt: 'yyyy-MM',
                autoPickDate: true,
            })
        });

        $("#endTimeSnapMoreStatYC").off("click").on("click", function () {
            WdatePicker({
                maxDate: `#F{${maxDateStr}}`,
                minDate: '#F{$dp.$D(\'startTimeSnapMoreStatYC\')}',
                dateFmt: 'yyyy-MM',
                autoPickDate: true
            })
        });

        $("#snapMoreTypeModalTab").find(".nav-link").eq(0).click();
    });

    //统计报表弹窗关闭事件
    $("#snapMoreTypeModalClose").on("click", function () {
        $("#snapMoreTypeModal").addClass("hide");
        $("#snapMoreTypeModal").data({
            KH: false,
            YC: false,
            GJ: false,
            CJ: false,
            YW: false,
            DJ: false,
            RL: false,
            RX: false
        });
    });

    $("#snapMoreTypeModalTab").on("click", ".nav-link", function () {
        $("#snapMoreTypeModal").find(".tab-pane").eq($(this).parent().index()).addClass("active").siblings().removeClass("active");
        resizeTableHeight($(this).parent().index());
        if ($(this).parent().index() == 2 && !$("#snapMoreTypeModal").data("KH")) {
            // 初始化数据
            configKHData = {
                roleType: 1,
                orgId: '10',
                startTime: '',
                endTime: '',
            }

            configKHData.startTime = $.trim(sureSelectTime(-1, true).date);
            configKHData.endTime = $.trim(sureSelectTime(-1, true).date);

            $("#khDataDayMoreSnap").val(configKHData.endTime);
            $("#khDataDaySnapMoreStart").val($.trim(sureSelectTime(-8, true).date));
            $("#khDataDaySnapMoreEnd").val($.trim(sureSelectTime(-1, true).date));

            createSnapKHList($('#snapStatisticTableKH'), true, configKHData);
        } else if ($(this).parent().index() == 0 && !$("#snapMoreTypeModal").data("YC")) {
            // 初始化数据
            configYCData = {
                roleType: 1,
                orgId: '10',
                startTime: '',
                endTime: '',
            }

            var nowDate = new Date(),
                year = nowDate.getFullYear(),
                date = nowDate.getDate(),
                month = date > 25 ? (nowDate.getMonth() + 2) : (nowDate.getMonth() + 1);

            configYCData.startTime = year + '-' + ((month - 1) < 10 ? '0' + (month - 1) : (month - 1));
            configYCData.endTime = year + '-' + ((month - 1) < 10 ? '0' + (month - 1) : (month - 1));

            $("#startTimeSnapMoreStatYC").val(configYCData.startTime);
            $("#endTimeSnapMoreStatYC").val(configYCData.endTime);
            //$("#endTimeSnapMoreStatYC").val('');

            createSnapYCList($('#snapStatisticTableYC'), true, configYCData);
        } else if ($(this).parent().index() == 4 && !$("#snapMoreTypeModal").data("GJ")) {
            // 初始化数据
            configGJData = {
                orgId: '10',
                startTime: '',
                endTime: '',
            }
            configGJData.startTime = $.trim(sureSelectTime(-8, true).date);
            configGJData.endTime = $.trim(sureSelectTime(-1, true).date);

            $("#startTimeSnapStatGJ").val(configGJData.startTime);
            $("#endTimeSnapStatGJ").val(configGJData.endTime);

            createSnapGJList($('#snapStatisticTableGJ'), true, configGJData);
        } else if ($(this).parent().index() == 3 && !$("#snapMoreTypeModal").data("CJ")) {
            // 初始化数据
            configCJData = {
                startTime: '',
                endTime: '',
            }

            configCJData.startTime = $.trim(sureSelectTime(-1, true).date);
            configCJData.endTime = $.trim(sureSelectTime(-1, true).date);

            $("#cjDataDayMoreSnap").val(configCJData.endTime);
            $("#cjDataDaySnapMoreStart").val($.trim(sureSelectTime(-8, true).date));
            $("#cjDataDaySnapMoreEnd").val($.trim(sureSelectTime(-1, true).date));

            createSnapCJList($('#snapStatisticTableCJ'), true, configCJData);
            //createSnapCJListTwo($('#snapStatisticTableCJTwo'), true, configCJData);
        } else if ($(this).parent().index() == 1 && !$("#snapMoreTypeModal").data("YW")) {
            // 初始化数据
            configYWData = {
                orgId: '10',
                cameraName: '',
                gbCode: '',
                onlineStatus: '',
                picStatus: '',
                startTime: '',
                endTime: '',
                hisPicStatus: '',
                page: 1,
                size: 10
            }

            configYWData.startTime = $.trim(sureSelectTime(-8, true).date);
            configYWData.endTime = $.trim(sureSelectTime(-1, true).date);

            $("#startTimeSnapStatYW").val($.trim(sureSelectTime(-8, true).date));
            $("#endTimeSnapStatYW").val($.trim(sureSelectTime(-1, true).date));

            createSnapYWList($('#snapStatisticTableYW'), $("#SnapPaginationYW"), true, configYWData);
            createSnapYWErrorList(configYWData);
        } else if ($(this).parent().index() == 5 && !$("#snapMoreTypeModal").data("DJ")) {
            // 初始化数据
            configDJData = {
                startTime: '',
                endTime: '',
                orgId: '10',
                page: 1,
                size: 10,
                rownum: 10
            }

            configDJData.startTime = $.trim(sureSelectTime(-31, true).date);
            configDJData.endTime = $.trim(sureSelectTime(-1, true).date);

            $("#startTimeSnapStatDJ").val($.trim(sureSelectTime(-31, true).date));
            $("#endTimeSnapStatDJ").val($.trim(sureSelectTime(-1, true).date));

            createSnapDJList($('#snapStatisticTableDJ'), $('#snapStatisticTableDJTwo'), configDJData);
        } else if ($(this).parent().index() == 6 && !$("#snapMoreTypeModal").data("RL")) {
            createSnapRLList($('#snapStatisticTableRL'), 1);
        } else if ($(this).parent().index() == 7 && !$("#snapMoreTypeModal").data("RX")) {
            // 初始化数据
            configRXData = {
                starttime: '',
                endtime: ''
            }

            configRXData.starttime = $.trim(sureSelectTime(-7, true).date);
            configRXData.endtime = $.trim(sureSelectTime(-1, true).date);

            $("#startTimeSnapStatRX").val($.trim(sureSelectTime(-7, true).date));
            $("#endTimeSnapStatRX").val($.trim(sureSelectTime(-1, true).date));

            createSnapRXList($('#snapStatisticTableRX'), configRXData);
            createSnapRXListTwo($('#snapStatisticTableTwoRX'));
        }
    })

    //搜索按钮点击事件 考核
    $("#snapStatisticSearchKH").on("click", function () {
        configKHData.orgId = $("#orgIdDataKH").val();
        configKHData.roleType = $("#snapMoreTypeKH .snapRoleType").find("input[name='snapRoleRadio']:checked").val();
        if ($("#snapMoreTypeKH .khDataDay").hasClass("hide")) { //周报
            configKHData.startTime = $.trim($("#khDataDaySnapMoreStart").val());
            configKHData.endTime = $.trim($("#khDataDaySnapMoreEnd").val());
        } else {
            configKHData.startTime = $.trim($("#khDataDayMoreSnap").val());
            configKHData.endTime = $.trim($("#khDataDayMoreSnap").val());
        }
        if (configKHData.startTime && configKHData.endTime) {
            createSnapKHList($('#snapStatisticTableKH'), true, configKHData);
        } else {
            warningTip.say('请输入起止时间');
        }
    });

    //导出按钮点击事件 考核
    $("#snapStatisticImportKH").on("click", function () {
        if (configKHData.startTime && configKHData.endTime) {
            var post_url = serviceUrl + '/v3/report/exportDayStatistic?startTime=' + configKHData.startTime + '&endTime=' + configKHData.endTime + '&orgId=' + configKHData.orgId + '&roleType=' + configKHData.roleType + '&token=' + $.cookie('xh_token');
            if ($("#IframeReportImg").length === 0) {
                $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
            }
            $('#IframeReportImg').attr("src", post_url);
        } else {
            warningTip.say('请输入起止时间');
        }
    });

    //搜索按钮点击事件 异常
    $("#snapStatisticSearchYC").on("click", function () {
        configYCData.orgId = $("#orgIdDataYC").val();
        configYCData.roleType = $("#snapMoreTypeYC .snapRoleType").find("input[name='snapRoleRadio']:checked").val();

        configYCData.startTime = $.trim($("#startTimeSnapMoreStatYC").val());
        configYCData.endTime = $.trim($("#endTimeSnapMoreStatYC").val());

        // if (configYCData.startTime && configYCData.endTime) {
        if (configYCData.startTime) {
            createSnapYCList($('#snapStatisticTableYC'), true, configYCData);
        } else {
            warningTip.say('请输入起始时间');
        }
    });

    //导出按钮点击事件 异常
    $("#snapStatisticImportYC").on("click", function () {
        if (configYCData.startTime && configYCData.endTime) {
            var post_url = serviceUrl + '/v3/errReport/exportErrReportStatistic?startTime=' + configYCData.startTime + '&endTime=' + configYCData.endTime + '&orgId=' + configYCData.orgId + '&roleType=' + configYCData.roleType + '&token=' + $.cookie('xh_token');
            if ($("#IframeReportImg").length === 0) {
                $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
            }
            $('#IframeReportImg').attr("src", post_url);
        } else {
            warningTip.say('请输入起止时间');
        }
    });

    //搜索按钮点击事件 告警
    $("#snapStatisticSearchGJ").on("click", function () {
        configGJData.orgId = $("#orgIdDataGJ").val();

        configGJData.startTime = $.trim($("#startTimeSnapStatGJ").val());
        configGJData.endTime = $.trim($("#endTimeSnapStatGJ").val());

        if (configGJData.startTime) {
            createSnapGJList($('#snapStatisticTableGJ'), true, configGJData);
        } else {
            warningTip.say('请输入起始时间');
        }
    });

    //导出按钮点击事件 告警
    $("#snapStatisticImportGJ").on("click", function () {
        if (configGJData.startTime && configGJData.endTime) {
            var post_url = serviceUrl + '/v3/report/exportTaskAlarmStatistic?startTime=' + configGJData.startTime + '&endTime=' + configGJData.endTime + '&orgId=' + configGJData.orgId + '&token=' + $.cookie('xh_token');
            if ($("#IframeReportImg").length === 0) {
                $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
            }
            $('#IframeReportImg').attr("src", post_url);
        } else {
            warningTip.say('请输入起止时间');
        }
    });

    //搜索按钮点击事件 厂家
    $("#snapStatisticSearchCJ").on("click", function () {
        if ($("#snapMoreTypeCJ .khDataDay").hasClass("hide")) { //周报
            configCJData.startTime = $.trim($("#cjDataDaySnapMoreStart").val());
            configCJData.endTime = $.trim($("#cjDataDaySnapMoreEnd").val());
        } else {
            configCJData.startTime = $.trim($("#cjDataDayMoreSnap").val());
            configCJData.endTime = $.trim($("#cjDataDayMoreSnap").val());
        }
        if (configCJData.startTime && configCJData.endTime) {
            createSnapCJList($('#snapStatisticTableCJ'), true, configCJData);
            //createSnapCJListTwo($('#snapStatisticTableCJTwo'), true, configCJData);
        } else {
            warningTip.say('请输入起止时间');
        }
    });

    //搜索按钮点击事件 运维
    $("#snapStatisticSearchYW").on("click", function () {
        configYWData.orgId = $("#orgIdDataYW").val();
        configYWData.cameraName = $.trim($("#YWCameraName").val());
        configYWData.gbCode = $.trim($("#YWGBCode").val());
        configYWData.onlineStatus = $("#snapMoreTypeYW").find("input[name='snapCameraYW']:checked").val();
        configYWData.startTime = $("#startTimeSnapStatYW").val();
        configYWData.endTime = $("#endTimeSnapStatYW").val();
        configYWData.picStatus = $("#snapMoreTypeYW").find("input[name='snapPicYW']:checked").val();
        configYWData.hisPicStatus = $("#snapMoreTypeYW").find("input[name='snapHPicYW']:checked").val();
        // configYWData.captureNum = $("#snapMoreTypeYW").find("input[name='snapIsPhotoYW']:checked").val();
        configYWData.page = 1;
        configYWData.size = 10;
        if (configYWData.startTime && configYWData.endTime) {
            createSnapYWList($('#snapStatisticTableYW'), $("#SnapPaginationYW"), true, configYWData);
            createSnapYWErrorList(configYWData);
        } else {
            warningTip.say('请输入起止时间');
        }
    });

    //导出按钮点击事件 运维
    $("#snapStatisticUploadYW").on("click", function () {
        if (configYWData.startTime && configYWData.endTime) {
            var post_url = serviceUrl + '/v2/index/exportCameraStatusStatistics?startTime=' + configYWData.startTime + '&endTime=' + configYWData.endTime + '&orgId=' + configYWData.orgId + '&gbCode=' + configYWData.gbCode + '&onlineStatus=' + configYWData.onlineStatus + '&cameraName=' + configYWData.cameraName + '&picStatus=' + configYWData.picStatus + '&hisPicStatus=' + configYWData.hisPicStatus + '&token=' + $.cookie('xh_token');
            if ($("#IframeReportImg").length === 0) {
                $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
            }
            $('#IframeReportImg').attr("src", post_url);
        } else {
            warningTip.say('请输入起止时间');
        }
    });

    //运维 一键报障事件
    $("#snapStatisticTableYW").on('click', '.report', function () {
        warningTip.say('暂未开发');
    })

    //重置按钮点击事件
    $("#snapStatisticResetYW").on("click", function () {
        $("#orgIdDataYW").val("10");
        $("#orgIdDataYW").selectpicker('refresh');
        $("#YWCameraName").val("");
        $("#YWGBCode").val("");
        $("#snapCameraYWOne").click();

        $("#startTimeSnapStatYW").val($.trim(sureSelectTime(-8, true).date));
        $("#endTimeSnapStatYW").val($.trim(sureSelectTime(-1, true).date));
    });

    //导出按钮点击事件 动静态
    $("#snapStatisticImportDJ").on("click", function () {
        if (configDJData.startTime && configDJData.endTime) {
            var post_url = serviceUrl + '/v3/myApplication/exportTopUsedInfo?startTime=' + configDJData.startTime + '&endTime=' + configDJData.endTime + '&orgId=' + configDJData.orgId + '&rownum=10&page=1&size=10&token=' + $.cookie('xh_token');
            if ($("#IframeReportImg").length === 0) {
                $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
            }
            $('#IframeReportImg').attr("src", post_url);
        } else {
            warningTip.say('请输入起止时间');
        }
    });

    //搜索按钮点击事件 动静态
    $("#snapStatisticSearchDJ").on("click", function () {
        configDJData.startTime = $("#startTimeSnapStatDJ").val();
        configDJData.endTime = $("#endTimeSnapStatDJ").val();
        configDJData.orgId = $("#orgIdDataDJ").val();
        configDJData.page = 1;
        configDJData.size = 10;
        if (configDJData.startTime && configDJData.endTime) {
            createSnapDJList($('#snapStatisticTableDJ'), configDJData);
        } else {
            warningTip.say('请输入起止时间');
        }
    });

    //搜索按钮点击事件 人像库
    $("#snapStatisticSearchRX").on("click", function () {
        configRXData.starttime = $("#startTimeSnapStatRX").val();
        configRXData.endtime = $("#endTimeSnapStatRX").val();
        if (configRXData.starttime && configRXData.endtime) {
            createSnapRXList($('#snapStatisticTableRX'), configRXData);
        } else {
            warningTip.say('请输入起止时间');
        }
    });


    function resizeTableHeight(index) {
        if (index == 1) {
            var modalTableHeight = $("#snapMoreTypeModal .popup-body").height() - $("#snapMoreTypeYW .search-terms-box").height() - 80;
            $("#snapStatisticTableYW").bootstrapTable("refreshOptions", {
                height: modalTableHeight
            }).bootstrapTable("refresh");
            if ($("#snapMoreTypeYW").data("listData")) {
                $("#snapStatisticTableYW").find("tbody tr").each((index, $dom) => {
                    $($dom).data("listData", $("#snapMoreTypeYW").data("listData")[index]);
                })
            }
        } else if (index == 2) {
            var modalTableHeight = $("#snapMoreTypeModal .popup-body").height() - $("#snapMoreTypeKH .search-terms-box").height();
            $("#snapStatisticTableKH").bootstrapTable("refreshOptions", {
                height: modalTableHeight
            }).bootstrapTable("refresh");
            if ($("#snapMoreTypeKH").data("listData")) {
                $("#snapStatisticTableKH").find("tbody tr").each((index, $dom) => {
                    $($dom).data("listData", $("#snapMoreTypeKH").data("listData")[index]);
                })
            }
        } else if (index == 0) {
            var modalTableHeight = $("#snapMoreTypeModal .popup-body").height() - $("#snapMoreTypeYC .search-terms-box").height();
            $("#snapStatisticTableYC").bootstrapTable("refreshOptions", {
                height: modalTableHeight
            }).bootstrapTable("refresh");
            if ($("#snapMoreTypeYC").data("listData")) {
                $("#snapStatisticTableYC").find("tbody tr").each((index, $dom) => {
                    $($dom).data("listData", $("#snapMoreTypeYC").data("listData")[index]);
                })
            }
        } else if (index == 4) {
            var modalTableHeight = $("#snapMoreTypeModal .popup-body").height() - $("#snapMoreTypeGJ .search-terms-box").height();
            $("#snapStatisticTableGJ").bootstrapTable("refreshOptions", {
                height: modalTableHeight
            }).bootstrapTable("refresh");
            if ($("#snapMoreTypeGJ").data("listData")) {
                $("#snapStatisticTableGJ").find("tbody tr").each((index, $dom) => {
                    $($dom).data("listData", $("#snapMoreTypeGJ").data("listData")[index]);
                })
            }
        } else if (index == 3) {
            $("#snapStatisticTableCJ").bootstrapTable("resetView");
            $("#snapStatisticTableCJTwo").bootstrapTable("resetView");
        }
    };

    $(window).resize(function () {
        var index = $("#snapMoreTypeModalTab").find(".nav-link.active").parent().index();
        resizeTableHeight(index);
    })

    // // 管理者登陆 最新告警滚动动画
    // function alarmNewAnimate() {
    //     $('.control-item-tips-wrap').each(function () {
    //         var $this = $(this);
    //         var height = $this.find('.control-item-tips-text').outerHeight() + 4;
    //         $this.animate({
    //             marginTop: -height
    //         }, 500, function () {
    //             $this.append($this.find('.control-item-tips-text').eq(0));
    //             $this.css({
    //                 marginTop: 0
    //             })
    //         })
    //     });
    //     if (!$('#pageSidebarMenu .sidebar-item').eq(0).hasClass('active')) {
    //         window.clearInterval(controlAlarmTimer);
    //     }
    // }

    // // 点击概况重启刷新定时器
    // $('#pageSidebarMenu .sidebar-item').eq(0).on('click', function () {
    //     window.clearInterval(controlTimer);
    //     window.clearInterval(controlAlarmTimer);
    //     controlTimer = window.setInterval(function () {
    //         if (!$('#pageSidebarMenu .sidebar-item').eq(0).hasClass('active')) {
    //             window.clearInterval(controlTimer);
    //         }
    //     }, 6000);
    //     controlAlarmTimer = window.setInterval(function () {
    //         alarmNewAnimate();
    //     }, 2000);
    // })
})(window, window.jQuery)