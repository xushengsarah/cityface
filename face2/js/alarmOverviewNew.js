(function (window, $) {
    var objTime = {},
        objPerson = {},
        objAnalysis = {},
        alarmImportTotal = '',
        dataAll = {}

    $('[data-role="radio"]').checkboxradio();
    $('[data-role="radio-button"]').checkboxradio({
        icon: false
    });
    var taskId = $('#controlPeopleImgList').find('.card-title-num-but').data('taskId');
    window.setTimeout(function () {
        if (taskId) {
            getFilterDataNew(getFilterTagDataNew(), undefined, undefined, '2');
        }
    }, 100);

    /**
     * 抓取筛选条件数据
     * @param {object} data 筛选条件的数据
     * @param {object} pageData 分頁的相關數據
     * @param {object} searchData 搜索的相关数据
     */
    window.getFilterDataNew = function (data, pageData, searchData, typeAlarm) {
        var $tab = $('#all-alarm-title'),
            activeItemLoading = $tab.data('loading'),
            type = 1,
            obj = {};
        for (var i = 0; i < data.length; i++) {
            if (data[i].text !== '全部') { //不是全选的话
                var index = data[i].index,
                    indexStr = data[i].index.toString(),
                    text = data[i].text;
                if (i === 0) {
                    obj.type = indexStr;
                } else if (i === 1) { // 1状态
                    obj.status = index;
                } else if (i === 2) { // 2机构
                    obj.orgId = text;
                } else if (i === 3) { // 3时间
                    obj.startTimeBefore = '';
                    obj.endTimeBefore = '';
                    obj.startTime = '';
                    obj.endTime = '';
                    if (index === 0) {
                        var timeObj = window.sureSelectTime(-10);
                        obj.startTime = timeObj.date;
                        obj.endTime = timeObj.now;
                    } else if (index === 1) {
                        var timeObj = window.sureSelectTime(-20);
                        obj.startTime = timeObj.date;
                        obj.endTime = timeObj.now;
                    } else if (index === 2) {
                        var timeObj = window.sureSelectTime(-30);
                        obj.startTime = timeObj.date;
                        obj.endTime = timeObj.now;
                    } else if (index === 3) { //自定义时间分割字符串
                        var timeArr = data[i].text.split('~');
                        obj.startTime = timeArr[0];
                        obj.endTime = timeArr[1];
                    }
                } else if (i === 4) { // 4人像库
                    obj.libId = text;
                } else if (i === 5) { // 5人员状态
                    if (index === 0) { //自定义时间分割字符串
                        obj.dataStatus = '1';
                        // obj.libId = '4';
                    } else if (index === 1) {
                        obj.dataStatus = '2';
                        // obj.libId = '4';
                    }
                }
            } else {
                if (i === 3) { // 3时间
                    obj.startTime = '';
                    obj.endTime = '';
                    var timeObj = window.sureSelectTime(-365);
                    obj.startTime = timeObj.date;
                    obj.endTime = timeObj.now;
                }
            }
        }
        obj.viewType = 1;
        objTime = deepCopy(obj);
        objPerson = deepCopy(obj);
        objAnalysis = deepCopy(obj);
        var reg = /^[a-zA-Z(_)]*\d+[a-zA-Z0-9(_)]+$/;
        if (reg.test(dataAll.name ? dataAll.name.replace(/[,]/g, "") : dataAll.name)) {
            objTime.idcard = dataAll.name;
            objPerson.idcard = dataAll.name;
            objAnalysis.idcard = dataAll.name;
        } else {
            objTime.name = dataAll.name;
            objPerson.name = dataAll.name;
            objAnalysis.name = dataAll.name;
        }
        objAnalysis.startTimeBefore = dataAll.startTimeBefore;
        objAnalysis.startTime = dataAll.startTime;
        objAnalysis.endTimeBefore = dataAll.endTimeBefore;
        objAnalysis.endTime = dataAll.endTime;
        // 设置分页数据
        if (pageData) {
            // 判定当前标签的排序判定
            if (pageData.showType == '1') { //按人员
                var newObj = deepCopy(objPerson); //深拷贝
                newObj.page = pageData.page;
                newObj.size = pageData.number;
                newObj.taskId = pageData.taskId;
                newObj.showType = pageData.showType;
                newObj.viewType = pageData.viewType;
            } else if (pageData.showType == '2') { //按时间聚合
                var newObj = deepCopy(objTime); //深拷贝
                newObj.page = pageData.page;
                newObj.size = pageData.number;
                newObj.taskId = pageData.taskId;
                newObj.showType = pageData.showType;
                newObj.viewType = pageData.viewType;
                newObj.startTime = pageData.startTime;
                newObj.endTime = pageData.endTime;
            }
            getAllAlarmInfoNew(newObj);
        } else {
            objTime.page = 1;
            objTime.size = 15;
            objTime.showType = 2;
            objTime.taskId = taskId;
            objTime.viewType = 1;
            objPerson.page = 1;
            objPerson.size = 6;
            objPerson.showType = 1;
            objPerson.taskId = taskId;
            objPerson.viewType = 1;
            if (typeAlarm == '2') {
                getAllAlarmInfoNew(objTime, true);
                $("#startTimeSliderNew").val(objTime.startTime);
                $("#endTimeSliderNew").val(objTime.endTime);
                $("#timeSliderNew").data({
                    startTime: Date.parse(objTime.startTime),
                    endTime: Date.parse(objTime.endTime)
                });
                initSliderNew(new Date(objTime.startTime), new Date(objTime.endTime));
            } else if (typeAlarm == '1') {
                getAllAlarmInfoNew(objPerson, true);
            }
        }

    }

    // 获取筛选选择数据
    window.getFilterTagDataNew = function () {
        var $tag = $('#alarmOverviewNewFilterBox').find('.tag-list').eq(0);
        var dataArr = $tag.data('tagDataArr');
        var deepArr = deepCopy(dataArr);
        return deepArr;
    };

    /**
     * 通过筛选的数据渲染我的和全部告警列表
     * @param {object} obj 筛选条件的数据
     * @param {object} delPage 
     */
    window.getAllAlarmInfoNew = function (obj, delPage) {
        // 根据传进来数据进行修正查询条件对象
        // 插入容器节点
        var $allAlarmByTime = $('#all-alarm-time-sort'), //全部按时间查询
            $allAlarmByObject = $('#all-alarm-object-sort'), //全部按不空对象查询
            searchArr = '';
        if (obj.viewType === 1 && obj.showType === 2) {
            // 全部告警--按时间排序
            searchArr = $allAlarmByTime;
        } else if (obj.viewType === 1 && obj.showType === 1) {
            // 全部告警--按人员聚合
            searchArr = $allAlarmByObject;
        }
        searchEmptyDataNew(searchArr, true, false);
        window.loadData('v2/bkAlarm/alarmList', true, obj, function (data) { //全部、我的告警列表获取
            if (data.code === '200') {
                var result = data.data,
                    total = result.total,
                    totalPage = result.totalPage,
                    list = result.list,
                    insertHtml = '';
                alarmImportTotal = total; // 导出需要判断的数据
                searchArr.empty();
                if (total === 0) {
                    searchEmptyDataNew(searchArr, false, true); //没有数据清空整个页面
                } else {
                    searchEmptyDataNew(searchArr, false, false);
                    if (obj.showType === 2) { //按时间排序
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
                                                        <img class="img-right-event" src="${list[i].smallHttpUrl || './assets/images/control/person.png'}"/>
                                                    </div>
                                                    <span class="warning-item-percent grade1">${threshold}%</span>
                                                </div>
                                                <div class="warning-item-name">
                                                    <span title="${list[i].libName ? (list[i].cilNames ? (list[i].libName + '—' + list[i].cilNames) : list[i].libName) : '未知'}">${list[i].libName ? (list[i].cilNames ? (list[i].libName + '—' + list[i].cilNames) : list[i].libName) : '未知'}</span>
                                                    <span class="warning-item-level${statusCls}">${statusStr}</span>
                                                </div>
                                                <p class="warning-item-time">
                                                <i class="aui-icon-color-default aui-icon-tree-camera"></i>
                                                    <span class="warning-item-text cameral-name-text" title="${list[i].cameraName || '未知'}">${list[i].cameraName || '未知'}</span>
                                                </p>
                                                <p class="warning-item-time">
                                                    <i class="aui-icon-color-default aui-icon-history"></i>
                                                    <span class="warning-item-text">${list[i].timeDesc || '未知'}</span>
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
                                value: 15,
                                text: '15/页',
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
                            setPagerComponentNew($pagerContainer, total, totalPage, true, pageSizeOpt, function (currPage, pageSize) { //下一页
                                $('#all-alarm-title').removeData('loading');
                                var filterData = getFilterTagDataNew();
                                $("#timeSliderNew").data({
                                    startTime: Date.parse(obj.startTime),
                                    endTime: Date.parse(obj.endTime)
                                });
                                getFilterDataNew(filterData, {
                                    taskId: obj.taskId,
                                    page: currPage,
                                    number: pageSize,
                                    viewType: obj.viewType,
                                    showType: obj.showType,
                                    startTime: obj.startTime,
                                    endTime: obj.endTime
                                });
                            });
                        }
                    } else { //按布控对象排序
                        for (var i = 0; i < list.length; i++) { //循环返回的每一个对象     
                            obj.peopleId = list[i].peopleId; //拿到当前对象的peopleId，设置分页数据
                            obj.size = '24';
                            obj.page = '1';
                            (function (i, id) { //通过一个立即执行函数把按对象排序每一个列表的personid和接口返回的i保存起来
                                window.loadData('v2/bkAlarm/alarmsByPersonId', true, obj, function (dataNew) { //查询每一个对象的布控列表
                                    if (dataNew.data.list.length > 0) {
                                        var alarm = dataNew.data.list,
                                            alarmLen = alarm.length,
                                            sureLen = dataNew.data.total,
                                            alarmTotalPage = 0,
                                            $inserOuterHtml;
                                        // 公共生成模板函数，生成对象列表模板
                                        function setAlarmHtml(data, alarm, sureLen, alarmLen, i) {
                                            var $inserOuterHtml = $([
                                                '<li class="card-item2 clearfix">',
                                                '   <div class="image-info-title">',
                                                '       <span class="image-info-name">' + (data.libName ? (data.cilNames ? (data.libName + '—' + data.cilNames) : data.libName) : '未知') + '</span>',
                                                '       <p class="image-info-alarm text-lighter">共告警<span class="num text-prompt">' + sureLen + '</span>次</p>',
                                                '       <span class="image-info-search text-prompt">查看地图轨迹</span>',
                                                '       <span class="image-info-all text-prompt' + (alarmLen > 8 ? '' : ' hide') + '">查看全部</span>',
                                                '   </div>',
                                                '   <div class="image-info5">',
                                                '       <div class="image-box">',
                                                '           <div class="image-box-flex">',
                                                '               <img class="img img-right-event" src="' + (data.url || './assets/images/control/person.png') + '" />',
                                                '           </div>',
                                                '           <div class="form-group"><label class="aui-form-label">姓名:</label><div class="form-text form-words">' + (data.name || '未知') + '</div></div>',
                                                '           <div class="form-group"><label class="aui-form-label">身份证:</label><div class="form-text form-words">' + (data.idcard || '未知') + '</div></div>',
                                                '       </div>',
                                                '   </div>',
                                                '   <div class="image-card-swiper' + (alarmLen > 8 ? ' hidden' : '') + '">',
                                                '       <div class="swiper-box">',
                                                '           <div class="swiper-container-alarm default">',
                                                '               <ul class="image-card-list list-type-6 new clearfix">',
                                                '               </ul>',
                                                '           </div>',
                                                '       </div>',
                                                '   </div>',
                                                '</li>'
                                            ].join(''));
                                            for (var j = 0; j < alarmLen; j++) { //循环alarmsByPerson接口，渲染右侧对象列表
                                                var threshold = 0;
                                                if (alarm[j].threshold) {
                                                    threshold = parseFloat(alarm[j].threshold);
                                                }
                                                var $insertInnerHtml = $([
                                                    '<li class="image-card-container image-card-item">',
                                                    '   <div class="image-card-wrap image-card-wrap2">',
                                                    '       <div class="image-card-box image-box-flex img-right-event">',
                                                    '           <span class="image-tag1 warning rotate' + (alarm[j].dataStatus == '2' ? '' : ' hide') + '">疑似撤逃</span>',
                                                    '           <img class="image-card-img img" src="' + (alarm[j].smallHttpUrl || './assets/images/control/person.png') + '" alt="">',
                                                    '           <div class="image-card-outer">',
                                                    '               <div class="image-card-inner deepgray">',
                                                    '                   <span class="image-card-number' + (threshold > 90 ? ' text-error' : '') + '">' + threshold + '%</span>',
                                                    '                   <span class="image-card-text">' + (alarm[j].timeDesc || '未知') + '</span>',
                                                    '               </div>',
                                                    '           </div>',
                                                    '       </div>',
                                                    '   </div>',
                                                    '   <p class="image-card-title" title="' + (alarm[j].cameraName || '未知') + '">' + (alarm[j].cameraName || '未知') + '</p>',
                                                    '</li>',
                                                ].join(''));
                                                alarm[j].url = data.url;
                                                alarm[j].comments = data.comments;
                                                $insertInnerHtml.data('listData', alarm[j]);
                                                $inserOuterHtml.find('.image-card-list').append($insertInnerHtml);
                                            }
                                            //对象列表分页
                                            var $pagerContainerNew = $('<div class="alarm-pager-container" id="' + searchArr.attr("id") + 'newPage' + i + '"></div>'), //每一个列表的分页设置一个不同的id区分
                                                pageSizeOpt = [{
                                                    value: 24,
                                                    text: '24/页',
                                                    selected: true
                                                }, {
                                                    value: 48,
                                                    text: '48/页',
                                                }];
                                            if ($inserOuterHtml.find('.image-card-list').siblings().length === 0) {
                                                $inserOuterHtml.find('.image-card-list').after($pagerContainerNew); //把分页加到列表后面

                                                var eventCallBack = function (currPage, pageSize) { //按布控对象排序分页点击每一页回调
                                                    var changePort = 'v2/bkAlarm/alarmsByPersonId'; //接口地址
                                                    obj.page = currPage; //页数
                                                    obj.size = pageSize; //每一页的size
                                                    obj.peopleId = id; //每一个列表的id
                                                    successFn = function (pData) {
                                                        if (pData.code == '200') {
                                                            $inserOuterHtml.find('.image-card-list').empty(); //每一次请求成功都清除上一页数据
                                                            $inserOuterHtml.data('listDataNew', pData.data.list);
                                                            $inserOuterHtml.data('listData', list[i]);
                                                            for (var page = 0; page < pData.data.list.length; page++) {
                                                                var $newPageList = $([
                                                                    '<li class="image-card-container image-card-item">',
                                                                    '   <div class="image-card-wrap image-card-wrap2">',
                                                                    '       <div class="image-card-box image-box-flex img-right-event">',
                                                                    '           <img class="image-card-img img" src="' + (pData.data.list[page].smallHttpUrl || './assets/images/control/person.png') + '" alt="">',
                                                                    '           <div class="image-card-outer">',
                                                                    '               <div class="image-card-inner deepgray">',
                                                                    '                   <span class="image-card-number' + (parseFloat(pData.data.list[page].threshold) > 90 ? ' text-error' : '') + '">' + parseFloat(pData.data.list[page].threshold) + '%</span>',
                                                                    '                   <span class="image-card-text">' + (pData.data.list[page].timeDesc || 'δ֪') + '</span>',
                                                                    '               </div>',
                                                                    '           </div>',
                                                                    '       </div>',
                                                                    '   </div>',
                                                                    '   <p class="image-card-title" title="' + (pData.data.list[page].cameraName || 'δ֪') + '">' + (pData.data.list[page].cameraName || 'δ֪') + '</p>',
                                                                    '</li>',
                                                                ].join(''));
                                                                $newPageList.data('listData', pData.data.list[page]);
                                                                $(`#${searchArr.attr("id")}newPage${i}`).parent().find(".image-card-list").append($newPageList);
                                                            }
                                                        }
                                                    };

                                                    loadData(changePort, true, obj, successFn);
                                                };
                                                setPageParams($pagerContainerNew, dataNew.data.total, dataNew.data.totalPage, eventCallBack, true, pageSizeOpt);
                                            }
                                            return $inserOuterHtml;
                                        }
                                        $inserOuterHtml = setAlarmHtml(list[i], alarm, sureLen, alarmLen, i);
                                        //除了第一个清除之外
                                        // 将数据添加到节点上
                                        $inserOuterHtml.data('listDataNew', dataNew.data.list);
                                        $inserOuterHtml.data('listData', list[i]);
                                        searchArr.append($inserOuterHtml);
                                        // 判断进行分页，按对象排序
                                        //if (totalPage > 1) {
                                        var $pagerContainer = $('<div class="alarm-pager-container"></div>'),
                                            pageSizeOpt = [{
                                                value: 6,
                                                text: '6/页',
                                                selected: true
                                            }, {
                                                value: 10,
                                                text: '10/页',
                                            }];
                                        if (searchArr.siblings().length === 0) {
                                            searchArr.after($pagerContainer);
                                            setPagerComponentNew($pagerContainer, total, totalPage, true, pageSizeOpt, function (currPage, pageSize) {
                                                searchArr.empty(); //每次翻页都清除上一页的数据
                                                $('#all-alarm-title').removeData('loading');
                                                $inserOuterHtml.data('listDataNew', dataNew.data.list);
                                                $inserOuterHtml.data('listData', list[i]);
                                                var filterData = getFilterTagDataNew();
                                                getFilterDataNew(filterData, {
                                                    page: currPage,
                                                    number: pageSize,
                                                    taskId: obj.taskId,
                                                    viewType: obj.viewType,
                                                    showType: obj.showType
                                                });
                                            });
                                        }
                                    }
                                });
                            })(i, obj.peopleId);
                        }
                        obj.peopleId = '';
                    }
                }
            } else {
                searchEmptyDataNew(searchArr, false, true);
            }
        });
    };

    // 公共函数深拷贝函数
    function deepCopy(obj) {
        var result = Array.isArray(obj) ? [] : {};
        if (obj && typeof obj === 'object') {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (obj[key] && typeof obj[key] === 'object') {
                        result[key] = deepCopy(obj[key]);
                    } else {
                        result[key] = obj[key];
                    }
                }
            }
        }
        return result;
    }

    /**
     * 空数据函数
     * @param {object} arr 我的全部告警数据用来控制显示隐藏
     * @param {object} loading 是否加载动画
     * @param {object} empty 是否清空
     */
    function searchEmptyDataNew(arr, loading, empty) {
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
    function setPagerComponentNew($container, total, totalPage, isShowDrop, pageSizeOpt, callBack) {
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
    function getSliderData(start, end) {
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
            dateList.unshift(timestampToTimeNew(dateTime).date);
            stampList.unshift(timestampToTimeNew(dateTime).stamp);
            dateTime = dateTime - dataTimeSpace * step;
        }

        return {
            dateList,
            stampList
        };
    };

    //公共时间格式获取方法
    function timestampToTimeNew(timestamp) {
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
    function initSliderNew(startDate, endDate) {
        var stampList = getSliderData(new Date(startDate), new Date(endDate)).stampList,
            dateList = getSliderData(new Date(startDate), new Date(endDate)).dateList,
            step = 5;
        if (stampList[stampList.length - 1] != stampList[0]) {
            //隐藏时初始化会有问题，要在显示时初始化
            if (!$("#sliderContentNew").hasClass("hide")) {
                $("#timeSliderNew").html(`<input id="Slider1" type="slider" name="area" value="${$("#timeSliderNew").data("startTime") + ';' + $("#timeSliderNew").data("endTime")}" />`);
                if (stampList[stampList.length - 1] - stampList[0] > 4) { //前后两个时间段差距在5秒内
                    step = 5;
                } else {
                    step = 1;
                    dateList = [dateList[0], dateList[dateList.length - 1]];
                }
                $("#Slider1").timeSlider({
                    from: stampList[0],
                    to: stampList[stampList.length - 1],
                    step: step,
                    dimension: '',
                    range: true,
                    scale: dateList,
                    limits: false,
                    skin: 'plastic',
                    calculate: function (value) {
                        return timestampToTimeNew(value).date;
                    },
                    onstatechange: function (value) {
                        //console.log(value);
                    },
                    callback: function (value) {
                        objTime.startTime = timestampToTimeNew(value.split(";")[0]).date;
                        objTime.endTime = timestampToTimeNew(value.split(";")[1]).date;
                        objTime.page = '1';
                        objTime.size = '18';
                        objTime.showType = 2;
                        objTime.viewType = 1;
                        $("#timeSliderNew").data({
                            startTime: value.split(";")[0],
                            endTime: value.split(";")[1]
                        });
                        getAllAlarmInfoNew(objTime, true);
                    }
                })
            }
        } else {
            loadEmpty($("#timeSliderNew"), '暂无可用时间轴，请选择不同的时间段生成时间轴', '', true);
            //$("#timeSliderNew").html(`请选择不同的时间段生成时间轴`);
        }
    }

    function changeSliderNew() {
        var startTime = $("#startTimeSliderNew").val(),
            endTime = $("#endTimeSliderNew").val();
        if (startTime && endTime) {
            var $tag = $('#alarmOverviewNewFilterBox').find('.tag-list').eq(0),
                dataArr = $tag.data('tagDataArr');
            dataArr[3].text = startTime + '~' + endTime;
            dataArr[3].index = 3;

            $("#alarmOverviewNewFilterBox").find(".filter-box li.filter-item").eq(3).find(".filter-content-label .tag").removeClass("tag-prompt");
            $("#alarmOverviewNewFilterBox").find(".filter-box li.filter-item").eq(3).find(".filter-content-inner .tag").eq(3).addClass("tag-prompt").html(`${startTime} ~ ${endTime}`).siblings().removeClass("tag-prompt");
            $("#alarmOverviewNewFilterBox").find(".operate .tag-list .tag").eq(3).removeClass("hide").find(".alarmTimeTop").html(`${startTime} ~ ${endTime}`);

            $("#timeModalNew").find("#startTimeAlarm").val(startTime);
            $("#timeModalNew").find("#endTimeAlarm").val(endTime);

            $("#timeModalNew").data('tagData', {
                type: 'normal',
                text: startTime + '~' + endTime,
                index: 3
            });

            getFilterDataNew(dataArr, undefined, undefined, '2');
        }
    };

    $("#startTimeSliderNew").on("click", function () {
        WdatePicker({
            maxDate: '#F{$dp.$D(\'endTimeSliderNew\') || \'%y-%M-%d\'}',
            minDate: '#F{$dp.$D(\'endTimeSliderNew\',{d:-30})}',
            dateFmt: 'yyyy-MM-dd HH:mm:ss',
            autoPickDate: true,
            onpicked: changeSliderNew
        })
    });

    $("#endTimeSliderNew").on("click", function () {
        WdatePicker({
            minDate: '#F{$dp.$D(\'startTimeSliderNew\')}',
            maxDate: '#F{\'%y-%M-%d\'||$dp.$D(\'startTimeSliderNew\',{d:30})}',
            dateFmt: 'yyyy-MM-dd HH:mm:ss',
            autoPickDate: true,
            onpicked: changeSliderNew
        })
    });

    //时间轴控制收缩按钮点击事件
    $("#sliderShowNew").on("click", function () {
        if ($("#sliderContentNew").hasClass("hide")) {
            $('#sliderShowNew').attr("show", "1").find('i').css({
                transform: 'rotate(0)'
            });
            $("#sliderContentNew").removeClass("hide");
            $("#alarmOverviewNewPage").closest('.popup-body').css('padding-bottom', '4rem');

            initSliderNew($("#startTimeSliderNew").val(), $("#endTimeSliderNew").val());
        } else {
            $('#sliderShowNew').attr("show", "0").find('i').css({
                transform: 'rotate(-180deg)'
            });
            $("#sliderContentNew").addClass("hide");
            $("#alarmOverviewNewPage").closest('.popup-body').css('padding-bottom', '0');
        }
    });

    /****************************************************时间轴结束****************************************************/

    // 点击查看轨迹分析页面
    $('#alarmOverviewNewContent').on('click', '.image-info-title .image-info-search', function () {
        var data = $(this).closest('.card-item2').data('listData'),
            dataNew = $(this).closest('.card-item2').data('listDataNew'),
            $alarmList = $('#alarmList'),
            $contentBox = $alarmList.closest(".card-side-content-box");
        $('#my-alarm-tabs').data('alarmItemData', dataNew);
        $(this).data('alarmItemData', dataNew);
        $alarmList.data({
            'pageNumber': 1,
            'peopleImg': data.url,
            'total': dataNew.length ? dataNew.length : 0,
            'listData': dataNew
        });
        $alarmList.data({
            'isAlarm': true
        });
        window.createAlarmList($alarmList, dataNew, 24);
        $contentBox.scrollTop(0);
        createMapFn(dataNew, 'alarm_overview_path');
        $('#alarmListTotalNew').text('告警总数（' + dataNew.length + '）');
        $contentBox.on('mousewheel', function () {
            var $this = $(this),
                curPage = $alarmList.data('pageNumber') === undefined ? 1 : $alarmList.data('pageNumber'),
                viewHeight = $this.height(), //视口可见高度
                contentHeight = $alarmList[0].scrollHeight, //内容高度
                scrollHeight = $this.scrollTop(), // 已经滚动了的高度
                currentCardItemNum = $alarmList.find(".aui-timeline-wrap").length,
                totalCardItemNUM = $alarmList.data('total');

            if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM) {
                $alarmList.data({
                    'pageNumber': curPage + 1,
                });
                window.createAlarmList($alarmList, dataNew, 9, true);
            }
        });
        $('#currentAlarmPathNew').removeClass('hide');
        $('#alarmOverviewNewPage').addClass('hide');
    });

    // 告警轨迹分析 告警列表查看大图
    $('.card-side-content-box #alarmList').on('click', '.aui-timeline-wrap', function (evt) {
        var $this = $(this),
            // $targetAlarmRow = $this.closest(".case-item"),
            $targetAlarmRow = $this,
            $targetParent = $targetAlarmRow.parent(),
            targetIndex = $targetAlarmRow.index(),
            alarmItemData = $('#my-alarm-tabs').data('alarmItemData')[targetIndex];
        //BKContorl这个大图弹窗是告警轨迹分析的，type也更改为何布控不一样的，加以区分
        window.createBigImgMask($targetParent, 'BKContorl', targetIndex, $('#usearchImg'), evt, {
            cardImg: $targetAlarmRow,
            data: alarmItemData,
            html: $(changeAlarmMaskHtml(alarmItemData))
        }, {
            type: 'BKContorl',
            alarmObjectLen: $('#my-alarm-tabs').data('alarmItemData').length
        });
    })

    //返回按钮点击事件
    $('#backToAlarmOverviewNew').on('click', function () {
        $('#currentAlarmPathNew').addClass('hide');
        $('#alarmOverviewNewPage').removeClass('hide');
    });

    // 隐藏下拉选项框中告警等级一栏
    window.filterDrop($('#alarmOverviewNewFilterBox'), function (data, index) {
        var deepArr = deepCopy(data);
        if ($("#all-alarm-cards").find('.nav-item').eq(0).find(".nav-link").hasClass("active")) {
            $("#all-alarm-time-sort").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
            getFilterDataNew(deepArr, undefined, undefined, '2');
        } else {
            $("#all-alarm-object-sort").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
            getFilterDataNew(deepArr, undefined, undefined, '1');
        }
    });

    // 全部告警之间不同排序切换
    $('#all-alarm-cards').find('.nav-item').off('click').on('click', function () {
        var $panel = $('#alarmOverviewNewContent'),
            $box = $panel.find('.alarm-info-box'),
            index = $(this).index();
        $box.eq(index).removeClass('hide').siblings('.alarm-info-box').addClass('hide');

        if ($(this).find(".nav-link").html() == '按布控对象排序') {
            $("#sliderContentNew").addClass("hide");
            $("#sliderShowNew").addClass("hide");
            $("#alarmOverviewNewPage").closest('.popup-body').css("padding-bottom", "0");

            $("#all-alarm-time-sort").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
            getFilterDataNew(getFilterTagDataNew(), undefined, undefined, '1');
        } else {
            $("#sliderShowNew").removeClass("hide");
            if ($("#sliderShowNew").attr("show") == '1') { //展开状态
                $("#sliderContentNew").removeClass("hide");
                $("#alarmOverviewNewPage").closest('.popup-body').css("padding-bottom", "4rem");
            } else {
                $("#sliderContentNew").addClass("hide");
                $("#alarmOverviewNewPage").closest('.popup-body').css("padding-bottom", "0");
            }

            $("#all-alarm-object-sort").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
            getFilterDataNew(getFilterTagDataNew(), undefined, undefined, '2');
        }

    });

    // 绑定查看更多代码
    $(document).on('click', '#alarmOverviewNewContent .image-info-all', function () {
        var $title = $(this).closest('.image-info-title'),
            $swiper = $title.siblings('.image-card-swiper'),
            swiperCls = $swiper.hasClass('hidden'),
            targetTop = $(this).offset().top - 15;
        if (swiperCls) {
            $swiper.removeClass('hidden');
            $(this).text('收起');
            $('html').animate({
                scrollTop: targetTop
            }, 500);
        } else {
            $swiper.addClass('hidden');
            $(this).text('查看全部');
        }
    });

    // 按时间排序卡片查看大图点击事件
    $('#alarmOverviewNewContent').on('click', '.warning-item', function (evt) {
        var $alarm = $(this).parent(),
            alarmId = $alarm.attr('id'),
            index = $(this).index(),
            listData = $(this).data('listData');
        window.createBigImgMask($alarm, alarmId, index, $('#usearchImg'), evt, {
            cardImg: $(this),
            data: listData,
            html: $(changeAlarmMaskHtml(listData))
            //html:$(window.commonMaskRight(2,listData))   //2位为告警弹窗右侧信息，第二个参数为data
        });
    });

    // 按布控对象卡片查看大图点击事件
    $('#alarmOverviewNewContent').on('click', '.swiper-box .image-card-container', function (evt) {
        var $alarm = $(this).closest('.image-card-list'),
            alarmId = $(this).closest('.card-list2').attr('id'),
            index = $(this).index(),
            listData = $(this).data('listData');
        window.createBigImgMask($alarm, alarmId, index, $('#usearchImg'), evt, {
            cardImg: $(this),
            data: listData,
            html: $(changeAlarmMaskHtml(listData))
        });
    });

    // 输入框数据检索功能
    $('#alarm-overview-new-search').on('keyup', function (evt) {
        if (evt.keyCode === 13) {
            var searchText = $('#alarm-overview-new-search').val(),
                $item = $('#all-alarm-title');
            $item.removeData('loading');
            dataAll.name = searchText;

            if ($("#all-alarm-cards").find('.nav-item').eq(0).find(".nav-link").hasClass("active")) {
                $("#all-alarm-time-sort").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterDataNew(getFilterTagDataNew(), null, searchText, '2');
            } else {
                $("#all-alarm-object-sort").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterDataNew(getFilterTagDataNew(), null, searchText, '1');
            }
        }

    }).siblings('.aui-input-suffix').on('click', function () {
        var searchText = $('#alarm-overview-new-search').val(),
            $item = $('#all-alarm-title');
        $item.removeData('loading');
        dataAll.name = searchText;

        if ($("#all-alarm-cards").find('.nav-item').eq(0).find(".nav-link").hasClass("active")) {
            $("#all-alarm-time-sort").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
            getFilterDataNew(getFilterTagDataNew(), null, searchText, '2');
        } else {
            $("#all-alarm-object-sort").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
            getFilterDataNew(getFilterTagDataNew(), null, searchText, '1');
        }

    });

    //告警状态外部按钮点击事件
    $(".alarmSearchOpt-new").on("click", "button", function () {
        $(this).addClass("btn-primary").siblings().removeClass("btn-primary");
        var $filterBox = $("#alarmOverviewNewFilterBox").find(".filter-box").find('.filter-item').eq(1);
        if ($(this).html() == '全部') {
            $filterBox.find(".filter-content-label .tag").click();
        } else if ($(this).html() == '未处理') {
            $filterBox.find(".filter-content-inner .tag").eq(0).click();
        } else if ($(this).html() == '正确') {
            $filterBox.find(".filter-content-inner .tag").eq(1).click();
        } else if ($(this).html() == '错误') {
            $filterBox.find(".filter-content-inner .tag").eq(2).click();
        }
        $("#alarmOverviewNewFilterBox .operate").find(".tag-list .tag").eq(1).addClass("hide");
    });

    //告警内容 导出 点击事件
    $("#alarmImportNew").on('click', function () {
        showLoading($('#alarmImportNew'));

        if ($("#all-alarm-cards").find('.nav-item').eq(0).find(".nav-link").hasClass("active")) {
            var portData = objTime,
                numb = 3000;
        } else if ($("#all-alarm-cards").find('.nav-item').eq(1).find(".nav-link").hasClass("active")) {
            var portData = objPerson,
                numb = 5000;
        }

        portData.number = alarmImportTotal;
        portData.peopleId = '';

        if (parseInt(alarmImportTotal) == 0) {
            hideLoading($("#alarmImportNew"))
            warningTip.say('无告警！');
            return false;
        }
        if (parseInt(alarmImportTotal) > numb) {
            hideLoading($("#alarmImportNew"))
            warningTip.say('告警不能超过' + numb + '，请筛选后使用！');
            return false;
        }

        var port = 'v2/bkAlarm/exportAlarmInfoToCache',
            successFunc = function (data) {
                hideLoading($('#alarmImportNew'));
                if (data.code == '200') {
                    if (portData.showType == 2) {
                        var post_url = serviceUrl + '/v2/bkAlarm/exportAlarmInfoExcel?downId=' + data.downId + '&token=' + $.cookie('xh_token');
                    } else if (portData.showType == 1) {
                        var post_url = serviceUrl + '/v2/bkAlarm/exportAlarmPerExcel?downId=' + data.downId + '&token=' + $.cookie('xh_token');
                    } else if (portData.showType == 3) {
                        var post_url = serviceUrl + '/v2/bkAlarm/exportAlarmPerExcel?downId=' + data.downId + '&token=' + $.cookie('xh_token');
                    }
                    if ($("#IframeReportImg").length === 0) {
                        $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
                    }
                    $('#IframeReportImg').attr("src", post_url);
                } else {
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, portData, successFunc);
    });

    window.addEventListener("message", function (ev) {
        var mydata = ev.data,
            $sideBar = $('#pageSidebarMenu').find('.aui-icon-warning'),
            $item = $sideBar.closest('.sidebar-item');
        if (mydata !== 'initMap' && mydata !== 'initMap?' && mydata !== 'initMap?44031' && $('.image-card-img').length > 0 && $item.hasClass('active')) {
            if (mydata.state == null || mydata.imgs.length == 1) {
                createImgMask(mydata);
            }
        }
    });

    // 关闭全部告警弹框
    $(document).on("click", "#alarmOverviewNewClose", function () {
        $('.all-alarm-popup').addClass('hide').removeClass('show');
        $('.all-alarm-popup').empty();
    });

})(window, window.jQuery)