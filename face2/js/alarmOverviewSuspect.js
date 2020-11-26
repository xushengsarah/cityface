(function (window, $) {
    var objTime = {
        status: '',
        name: '', // 姓名
        idcard: '', // 身份证号
        compareManufactureId: '', // 算法厂家
        startTime: '',
        endTime: '',
        page: 1,
        size: 18,
    };

    $('[data-role="radio"]').checkboxradio();
    $('[data-role="radio-button"]').checkboxradio({
        icon: false
    });

    /**
     * 通过筛选的数据渲染我的和全部告警列表
     * @param {object} obj 筛选条件的数据
     * @param {object} delPage 
     */
    window.getAllAlarmInfoSus = function(obj, delPage) {
        // 根据传进来数据进行修正查询条件对象
        var searchArr = $('#all-alarm-time-sus');
        searchEmptyDataSus(searchArr, true, false);
        if (!obj) { 
            obj = objTime;
        }
        window.loadData('v2/thirdHospital/alarmList', true, obj, function (data) {
            if (data.code === '200') {
                var result = data.data,
                    total = result.total,
                    totalPage = result.totalPage,
                    list = result.list,
                    insertHtml = '';
                alarmImportTotal = total; // 导出需要判断的数据
                searchArr.empty();
                if (total === 0) {
                    searchEmptyDataSus(searchArr, false, true); //没有数据清空整个页面
                } else {
                    searchEmptyDataSus(searchArr, false, false);
                    for (var i = 0; i < list.length; i++) {
                        var threshold = 0,
                            status = parseFloat(list[i].status),
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
                        if (list[i].threshold) {
                            threshold = parseFloat(list[i].threshold);
                        }
                        insertHtml += `<li class="warning-item">
                                        <div class="warning-item-content">
                                            <span class="image-tag1 warning rotate ${list[i].dataStatus == '2' ? '' : 'hide'}">疑似撤逃</span>
                                            <div class="warning-item-img-box">
                                                <div class="warning-item-img">
                                                    <img class="img-right-event" src="${list[i].url || './assets/images/control/person.png'}"/>
                                                    <img class="img-right-event" src="${list[i].smallImgUrl || './assets/images/control/person.png'}"/>
                                                </div>
                                                <span class="warning-item-percent grade1">${threshold}%</span>
                                            </div>
                                            <div class="warning-item-name">
                                                <span title="${list[i].name || '未知'}">姓名：${list[i].name || '未知'}</span>
                                                <span class="warning-item-level${statusCls}">${statusStr}</span>
                                            </div>
                                            <p class="warning-item-time">
                                                <span class="warning-item-text cameral-name-text" title="${list[i].idcard || '未知'}">身份证：${list[i].idcard || '未知'}</span>
                                            </p>
                                            <p class="warning-item-time">
                                                <i class="aui-icon-color-default aui-icon-history"></i>
                                                <span class="warning-item-text">${list[i].alarmTime || '未知'}</span>
                                            </p>
                                        </div>
                                    </li>`;
                    }
                    searchArr.empty().append(insertHtml); //渲染按时间列表
                    // 给节点添加数据
                    searchArr.find('.warning-item').each(function (index, el) {
                        $(el).data('listData', list[index]);
                    });
                    // 判断进行分页
                    //if (totalPage > 1) {
                    var $pagerContainer = $('<div class="alarm-pager-container"></div>'),
                        pageSizeOpt = [{
                            value: 18,
                            text: '18/页',
                            selected: true
                        }, {
                            value: 30,
                            text: '30/页',
                        }];
                    if (delPage) {
                        searchArr.siblings().remove();
                    }
                    if (searchArr.siblings().length === 0) {
                        searchArr.after($pagerContainer);
                        setPagerComponentSus($pagerContainer, total, totalPage, true, pageSizeOpt, function (currPage, pageSize) { //下一页
                            $('#all-alarm-title-sus').removeData('loading');
                            $("#timeSliderSus").data({
                                startTime: Date.parse(obj.startTime),
                                endTime: Date.parse(obj.endTime)
                            });
                            objTime.page = currPage;
                            objTime.size = pageSize;
                            objTime.startTime = obj.startTime;
                            objTime.endTime = obj.endTime
                            getAllAlarmInfoSus(objTime, false);
                        });
                    }
                }
            } else {
                searchEmptyDataSus(searchArr, false, true);
            }
        });
    };

    /**
     * 空数据函数
     * @param {object} arr 我的全部告警数据用来控制显示隐藏
     * @param {object} loading 是否加载动画
     * @param {object} empty 是否清空
     */
    function searchEmptyDataSus(arr, loading, empty) {
        if (loading && !empty) {
            showLoading(arr);
        } else if (!loading && empty) {
            // 隐藏加载动画
            hideLoading(arr);
            // 添加空数据节点
            loadEmpty(arr, '暂无告警信息', '', true);
            // 清除分页组件
            arr.siblings('.alarm-pager-container').remove();
        } else {
            hideLoading(arr);
        }
    }

    /**
     * 设置分页函数
     * @param {object} $container 节点容器
     * @param {string} total 总条数
     * @param {string} totalPage 总页数
     * @param {string} isShowDrop  是否显示设置分页每页展示的数据条数；false不能设置分页每页的数据
     * @param {object} pageSizeOpt  当isShowPageSizeOpt为true，设置分页每页可以展示数据的条数
     * @param {object} callBack  所有会触发分页加载数据的回调事件
     */
    function setPagerComponentSus($container, total, totalPage, isShowDrop, pageSizeOpt, callBack) {
        setPageParams($container, total, totalPage, function (currPage, pageSize, container, selectPageSizeOpt) {
            if ($.isFunction(callBack)) {
                callBack(currPage, pageSize, container, selectPageSizeOpt);
                // 只要分页就清除弹窗信息
                var containerId = $container.siblings().attr('id'),
                    $mask = $('.mask-container-fixed.' + containerId);
                $mask.remove();
            }
        }, isShowDrop, pageSizeOpt);
    }


    /****************************************************时间轴开始****************************************************/
    //计算slider需要的labels和value
    function getSliderDataSus(start, end) {
        var ms = end.getTime() - start.getTime(),
            dataTimeSpace = '',
            initStep = 5,
            space = (end / 1000 - start / 1000) < initStep && (end / 1000 - start / 1000) > 0 ? (end / 1000 - start / 1000) : initStep,
            dateTime = end.getTime();
        if (Math.floor(ms / 1000 / 60 / 60 / 24) < initStep) {
            if (Math.floor(ms / 1000 / 60 / 60) < initStep) { //按小时
                dataTimeSpace = 1000 * 60; //按秒
            } else {
                dataTimeSpace = 1000 * 60 * 60;
            }
        } else { //按天
            dataTimeSpace = 1000 * 60 * 60 * 24;
        }
        var step = (end - start) / dataTimeSpace / initStep;

        var dateList = [],
            stampList = [];
        for (var i = space; i >= 0; i--) {
            dateList.unshift(timestampToTimeSus(dateTime).date);
            stampList.unshift(timestampToTimeSus(dateTime).stamp);
            dateTime = dateTime - dataTimeSpace * step;
        }
        return {
            dateList,
            stampList
        };
    };

    //公共时间格式获取方法
    function timestampToTimeSus(timestamp) {
        var date = new Date(parseInt(timestamp)); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        return {
            'date': Y + M + D + ' ' + h + m + s,
            'stamp': Date.parse(date)
        };
    };

    //初始化时间轴
    function initSliderSus(startDate, endDate) {
        var stampList = getSliderDataSus(new Date(startDate), new Date(endDate)).stampList,
            dateList = getSliderDataSus(new Date(startDate), new Date(endDate)).dateList,
            step = 5;
        if (stampList[stampList.length - 1] != stampList[0]) {
            //隐藏时初始化会有问题，要在显示时初始化
            if (!$("#sliderContentSus").hasClass("hide")) {
                $("#timeSliderSus").html(`<input id="Slider2" type="slider" name="area" value="${$("#timeSliderSus").data("startTime") + ';' + $("#timeSliderSus").data("endTime")}" />`);
                if (stampList[stampList.length - 1] - stampList[0] > 4) { //前后两个时间段差距在5秒内
                    step = 5;
                } else {
                    step = 1;
                    dateList = [dateList[0], dateList[dateList.length - 1]];
                }
                $("#Slider2").timeSlider({
                    from: stampList[0],
                    to: stampList[stampList.length - 1],
                    step: step,
                    dimension: '',
                    range: true,
                    scale: dateList,
                    limits: false,
                    skin: 'plastic',
                    calculate: function (value) {
                        return timestampToTimeSus(value).date;
                    },
                    onstatechange: function (value) {
                        //console.log(value);
                    },
                    callback: function (value) {
                        objTime.startTime = timestampToTimeSus(value.split(";")[0]).date;
                        objTime.endTime = timestampToTimeSus(value.split(";")[1]).date;
                        objTime.page = '1';
                        objTime.size = '18';
                        
                        $("#startTimeSliderSus").val(objTime.startTime);
                        $("#endTimeSliderSus").val(objTime.endTime);
                        $("#timeSliderSus").data({
                            startTime: value.split(";")[0],
                            endTime: value.split(";")[1]
                        });
                        getAllAlarmInfoSus(objTime, true);
                    }
                })
            }
        } else {
            loadEmpty($("#timeSliderSus"), '暂无可用时间轴，请选择不同的时间段生成时间轴', '', true);
            //$("#timeSliderSus").html(`请选择不同的时间段生成时间轴`);
        }
    }

    function changeSliderSus() {
        var startTime = $("#startTimeSliderSus").val(),
            endTime = $("#endTimeSliderSus").val();
        if (startTime && endTime) {
            objTime.startTime = startTime;
            objTime.endTime = endTime;
            initSliderSus(new Date(objTime.startTime), new Date(objTime.endTime));
            getAllAlarmInfoSus(objTime, true);
        }
    };

    $("#startTimeSliderSus").on("click", function () {
        WdatePicker({
            maxDate: '#F{$dp.$D(\'endTimeSliderSus\') || \'%y-%M-%d\'}',
            minDate: '#F{$dp.$D(\'endTimeSliderSus\',{d:-30})}',
            dateFmt: 'yyyy-MM-dd HH:mm:ss',
            autoPickDate: true,
            onpicked: changeSliderSus
        })
    });

    $("#endTimeSliderSus").on("click", function () {
        WdatePicker({
            minDate: '#F{$dp.$D(\'startTimeSliderSus\')}',
            maxDate: '#F{\'%y-%M-%d\'||$dp.$D(\'startTimeSliderSus\',{d:30})}',
            dateFmt: 'yyyy-MM-dd HH:mm:ss',
            autoPickDate: true,
            onpicked: changeSliderSus
        })
    });

    //时间轴控制收缩按钮点击事件
    $("#sliderShowSuspect").on("click", function () {
        if ($("#sliderContentSus").hasClass("hide")) {
            $('#sliderShowSuspect').attr("show", "1").find('i').css({
                transform: 'rotate(0)'
            });
            $("#sliderContentSus").removeClass("hide");
            $("#alarmOverviewSuspectBox").css('height', '90%');

            initSliderSus($("#startTimeSliderSus").val(), $("#endTimeSliderSus").val());
        } else {
            $('#sliderShowSuspect').attr("show", "0").find('i').css({
                transform: 'rotate(-180deg)'
            });
            $("#sliderContentSus").addClass("hide");
            $("#alarmOverviewSuspectBox").css('height', '100%');
        }
    });

    /****************************************************时间轴结束****************************************************/

    // 按时间排序卡片查看大图点击事件
    $('#sliderShowSuspectContent').on('click', '.warning-item', function (evt) {
        var $alarm = $(this).parent(),
            alarmId = $alarm.attr('id'),
            index = $(this).index(),
            listData = $(this).data('listData');
        window.createBigImgMask($alarm, alarmId, index, $('#usearchImg'), evt, {
            cardImg: $(this),
            data: listData,
            html: $(changeAlarmMaskHtml(listData, true))
            //html:$(window.commonMaskRight(2,listData))   //2位为告警弹窗右侧信息，第二个参数为data
        }, '', true);
    });

    // 输入框数据检索功能
    $('#alarm-overview-sus-search').on('keyup', function (evt) {
        if (evt.keyCode === 13) {
            var searchText = $('#alarm-overview-sus-search').val(),
                $item = $('#all-alarm-title-sus');
            $item.removeData('loading');
            objTime.name = searchText;
            $("#all-alarm-time-sus").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
            getAllAlarmInfoSus(objTime, true);
        }
    }).siblings('.aui-input-suffix').on('click', function () {
        var searchText = $('#alarm-overview-sus-search').val(),
            $item = $('#all-alarm-title-sus');
        $item.removeData('loading');
        objTime.name = searchText;
        $("#all-alarm-time-sus").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
        getAllAlarmInfoSus(objTime, true);
    });

    //告警状态外部按钮点击事件
    $("#sliderShowSuspectContent .clearfix").on("click", "button", function () {
        $(this).addClass("btn-primary").siblings().removeClass("btn-primary");
        if ($(this).html() == '全部') {
            objTime.status = '';
        } else if ($(this).html() == '未处理') {
            objTime.status = 0;
        } else if ($(this).html() == '正确') {
            objTime.status = 1;
        } else if ($(this).html() == '误报') {
            objTime.status = 2;
        }
        getAllAlarmInfoSus(objTime, true);
    });

    function init() {
        var timeObj = window.sureSelectTime(-365);
        objTime.startTime = timeObj.date;
        objTime.endTime = timeObj.now;
        $("#startTimeSliderSus").val(objTime.startTime);
        $("#endTimeSliderSus").val(objTime.endTime);
        $("#timeSliderSus").data({
            startTime: Date.parse(objTime.startTime),
            endTime: Date.parse(objTime.endTime)
        });
        setTimeout(() => {
            initSliderSus(new Date(objTime.startTime), new Date(objTime.endTime));
        }, 500);
        getAllAlarmInfoSus(objTime, true);
    }
    init();

})(window, window.jQuery)