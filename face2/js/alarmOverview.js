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
    window.initDatePicker1($("#analysis_time_alarm_start"), -8, true, true, false);
    window.initDatePicker1($("#analysis_time_alarm_end"), -1, true, true, false);
    $("#endTimeAlarmAnalysis").val($("#startTimeAlarmAnalysisTwo").val());

    /**
     * 抓取筛选条件数据
     * @param {object} data 筛选条件的数据
     * @param {object} pageData 分頁的相關數據
     * @param {object} searchData 搜索的相关数据
     */
    window.getFilterData = function (data, pageData, searchData, typeAlarm) {
        var $tab = $('#alarm-change-tab'),
            $activeLink = $tab.find('.nav-link').filter('.active'), //判断选中的是哪个
            $activeItem = $activeLink.parent(),
            activeItemLoading = $activeItem.data('loading'),
            type = $activeItem.index() + 1,
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
                    if (!$("#alarm-change-tab").find(".nav-item").eq(2).find(".nav-link").hasClass("show")) {
                        obj.startTimeBefore = '';
                        obj.endTimeBefore = '';
                        if (index === 3) { //自定义时间分割字符串
                            var timeArr = data[i].text.split('~');
                            obj.startTime = timeArr[0];
                            obj.endTime = timeArr[1];
                        } else if (index === 0) {
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
                        }
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
            }
        }
        obj.viewType = (type === 1 ? 1 : (type == 2 ? 4 : 1));
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
            if (pageData.showType == '1') {  //按人员
                var newObj = deepCopy(objPerson); //深拷贝
                newObj.page = pageData.page;
                newObj.size = pageData.number;
                newObj.showType = pageData.showType;
                newObj.viewType = pageData.mySelf;
            } else if (pageData.showType == '2') {  //按时间聚合
                var newObj = deepCopy(objTime); //深拷贝
                newObj.page = pageData.page;
                newObj.size = pageData.number;
                newObj.showType = pageData.showType;
                newObj.viewType = pageData.mySelf;
                newObj.startTime = pageData.startTime;
                newObj.endTime = pageData.endTime;
            } else if (pageData.showType == '3') {  //按告警分析聚合
                var newObj = deepCopy(objAnalysis); //深拷贝
                newObj.page = pageData.page;
                newObj.size = pageData.number;
                newObj.showType = pageData.showType;
                newObj.viewType = pageData.mySelf;
            }
            getAllAlarmInfo(newObj);
        } else {
            objTime.page = 1;
            objTime.size = 18;
            objTime.showType = 2;
            objPerson.page = 1;
            objPerson.size = 6;
            objPerson.showType = 1;
            objAnalysis.page = 1;
            objAnalysis.size = 6;
            objAnalysis.showType = 3;
            // 判定输入框中是否有检索条件
            // if (inputText.length > 0) {
            //     if (reg.test(inputText)) {
            //         objTime.idcard = inputText;
            //         objPerson.idcard = inputText;
            //     } else {
            //         objTime.name = inputText;
            //         objPerson.name = inputText;
            //     }
            // }
            // 输入框事件触发条件
            // if (searchData) {
            //     if (reg.test(searchData)) {
            //         objTime.idcard = searchData;
            //         objPerson.idcard = searchData;
            //     } else {
            //         objTime.name = searchData;
            //         objPerson.name = searchData;
            //     }
            // }
            if (typeAlarm == '2') {
                getAllAlarmInfo(objTime, true);
                //getSliderData(new Date(objTime.startTime), new Date(objTime.endTime));
                $("#startTimeSlider").val(objTime.startTime);
                $("#endTimeSlider").val(objTime.endTime);
                $("#timeSlider").data({
                    startTime: Date.parse(objTime.startTime),
                    endTime: Date.parse(objTime.endTime)
                });
                initSlider(new Date(objTime.startTime), new Date(objTime.endTime));
            } else if (typeAlarm == '1') {
                getAllAlarmInfo(objPerson, true);
            } else {  //告警分析
                getAllAlarmInfo(objAnalysis, true);
            }
        }
    }

    // 获取筛选选择数据
    window.getFilterTagData = function () {
        var $tag = $('#alarmOverviewFilterBox').find('.tag-list').eq(0);
        var dataArr = $tag.data('tagDataArr');
        var deepArr = deepCopy(dataArr);
        if (dataArr[3].text == '全部') {
            deepArr[3].text = '近十天';
            deepArr[3].index = 0;
        }
        return deepArr;
    };

    /**
     * 通过筛选的数据渲染我的和全部告警列表
     * @param {object} obj 筛选条件的数据
     * @param {object} delPage 
     */
    window.getAllAlarmInfo = function (obj, delPage) {
        // 根据传进来数据进行修正查询条件对象
        // 插入容器节点
        var $allAlarmByTime = $('#all-alarm-time'), //全部按时间查询
            $myAlarmByTime = $('#my-alarm-time'), //我的按时间查询
            $allAlarmByObject = $('#all-alarm-object'), //全部按不空对象查询
            $myAlarmByObject = $('#my-alarm-object'), //我的按布控对象查询
            $alarmAnalysis = $('#alarm-analysis-object'), //告警分析查询
            searchArr = [];
        if (obj.viewType === 1 && obj.showType === 2) {
            // 全部告警--按时间排序
            searchArr.push($allAlarmByTime);
        } else if (obj.viewType === 1 && obj.showType === 1) {
            // 全部告警--按人员聚合
            searchArr.push($allAlarmByObject);
        } else if (obj.viewType === 4 && obj.showType === 2) {
            // 我的告警--按时间排序
            searchArr.push($myAlarmByTime);
        } else if (obj.viewType === 4 && obj.showType === 1) {
            // 我的告警--按人员聚合
            searchArr.push($myAlarmByObject);
        } else if (obj.viewType === 1 && obj.showType === 3) {
            // 告警分析--按人员聚合
            searchArr.push($alarmAnalysis);
        }
        searchEmptyData(searchArr, true, false);
        window.loadData('v2/bkAlarm/alarmList', true, obj, function (data) { //全部、我的告警列表获取
            if (data.code === '200') {
                var result = data.data,
                    total = result.total,
                    totalPage = result.totalPage,
                    list = result.list,
                    insertHtml = '';
                alarmImportTotal = total; // 导出需要判断的数据
                searchArr[0].empty();
                if (total === 0) {
                    searchEmptyData(searchArr, false, true); //没有数据清空整个页面
                } else {
                    searchEmptyData(searchArr, false, false);
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
                            insertHtml += `<li class="${list[i].libId == '22'?'warning-item warning-tip':'warning-item'}">
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
                        searchArr[0].empty().append(insertHtml); //渲染按时间列表
                        // 给节点添加数据
                        searchArr[0].find('.warning-item').each(function (index, el) {
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
                                value: 36,
                                text: '36/页',
                            }];
                        if (delPage) {
                            searchArr[0].siblings().remove();
                        }
                        if (searchArr[0].siblings().length === 0) {
                            searchArr[0].after($pagerContainer);
                            setPagerComponent($pagerContainer, total, totalPage, true, pageSizeOpt, function (currPage, pageSize) { //下一页
                                $('#alarm-change-tab').find('.nav-item').removeData('loading');
                                var filterData = getFilterTagData();
                                $("#timeSlider").data({
                                    startTime: Date.parse(obj.startTime),
                                    endTime: Date.parse(obj.endTime)
                                });
                                getFilterData(filterData, {
                                    page: currPage,
                                    number: pageSize,
                                    mySelf: obj.viewType,
                                    showType: obj.showType,
                                    startTime: obj.startTime,
                                    endTime: obj.endTime
                                });
                            });
                        }
                        //} else {
                        //searchArr[0].siblings('.alarm-pager-container').remove();
                        //}
                    } else { //按布控对象排序
                        list.forEach((element, index) => {
                            if (element.idcard == '442000196805096611') {
                                list.splice(index, 1);
                            }
                        });
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
                                                '       <span class="image-info-all text-prompt' + (alarmLen > 12 ? '' : ' hide') + '">查看全部</span>',
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
                                                '   <div class="image-card-swiper' + (alarmLen > 12 ? ' hidden' : '') + '">',
                                                '       <div class="swiper-box">',
                                                '           <div class="swiper-container-alarm default">',
                                                '               <ul class="image-card-list list-type-6 clearfix">',
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
                                            var $pagerContainerNew = $('<div class="alarm-pager-container" id="' + searchArr[0].attr("id") + 'newPage' + i + '"></div>'), //每一个列表的分页设置一个不同的id区分
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
                                                                $(`#${searchArr[0].attr("id")}newPage${i}`).parent().find(".image-card-list").append($newPageList);
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
                                        searchArr[0].append($inserOuterHtml);
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
                                        if (searchArr[0].siblings().length === 0) {
                                            searchArr[0].after($pagerContainer);
                                            setPagerComponent($pagerContainer, total, totalPage, true, pageSizeOpt, function (currPage, pageSize) {
                                                searchArr[0].empty(); //每次翻页都清除上一页的数据
                                                $('#alarm-change-tab').find('.nav-item').removeData('loading');
                                                $inserOuterHtml.data('listDataNew', dataNew.data.list);
                                                $inserOuterHtml.data('listData', list[i]);
                                                var filterData = getFilterTagData();
                                                getFilterData(filterData, {
                                                    page: currPage,
                                                    number: pageSize,
                                                    mySelf: obj.viewType,
                                                    showType: obj.showType
                                                });
                                            });
                                        }
                                        //} else {
                                        //searchArr[0].siblings('.alarm-pager-container').remove();
                                        //}
                                    }
                                });
                            })(i, obj.peopleId);
                        }
                        obj.peopleId = '';
                    }
                }
            } else {
                searchEmptyData(searchArr, false, true);
            }
        });
    };

    // 数据单位转换
    function dataUnitChange(data, add, fixed) {
        var value = parseFloat(data),
            change = false,
            changeText;
        if (value >= 10000 && value < 10000000) {
            value = Number(value / 10000).toFixed(fixed);
            change = true;
            changeText = '万';
        } else if (value >= 10000000 && value < 100000000) {
            value = Number(value / 10000000).toFixed(fixed);
            change = true;
            changeText = '千万';
        } else if (value >= 100000000) {
            value = Number(value / 100000000).toFixed(fixed);
            change = true;
            changeText = '亿';
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
    function searchEmptyData(arr, loading, empty) {
        if (loading && !empty) {
            for (var i = 0; i < arr.length; i++) {
                showLoading(arr[i]);
            }
        } else if (!loading && empty) {
            for (var i = 0; i < arr.length; i++) {
                // 隐藏加载动画
                hideLoading(arr[i]);
                // 添加空数据节点
                loadEmpty(arr[i], '暂无告警信息', '', true);
                // 清除分页组件
                arr[i].siblings('.alarm-pager-container').remove();
            }
        } else {
            for (var i = 0; i < arr.length; i++) {
                hideLoading(arr[i]);
            }
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
    function setPagerComponent($container, total, totalPage, isShowDrop, pageSizeOpt, callBack) {
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

    // 绑定全部告警和我的告警tab页签绑定事件
    $('#alarm-change-tab').find('.nav-item').off('click.alarm').on('click.alarm', function () {
        $that = $(this);
        window.setTimeout(function () {
            if ($that.find(".show").html() == '我的告警') {
                $("#sliderShow").removeClass("hide");
                if ($("#sliderShow").attr("show") == '1') {  //展开状态
                    $("#sliderContent").removeClass("hide");
                    $("#alarmOverviewFilterBox").css("height", "90%");
                } else {
                    $("#sliderContent").addClass("hide");
                    $("#alarmOverviewFilterBox").css("height", "96%");
                }

                $("#my-alarm-object").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                $("#my-alarm-object").parent().addClass("hide").siblings().removeClass("hide");
                $("#my-alarm-tabs").find('.nav-item').eq(0).find(".nav-link").addClass("active").addClass("show");
                $("#my-alarm-tabs").find('.nav-item').eq(1).find(".nav-link").removeClass("active").removeClass("show");
                $("#alarmOverviewFilterBox .filter-box").find(".filter-item").eq(3).removeClass("hide");
                if (!$("#alarmOverviewFilterBox .filter-box").find(".filter-item").eq(3).find(".filter-content-label .tag").hasClass("tag-prompt")) {
                    $("#alarmOverviewFilterBox .card-operate-box").find(".tag-list.clearfix .tag").eq(3).removeClass("hide");
                }
                getFilterData(getFilterTagData(), undefined, undefined, '2');
            } else if ($that.find(".show").html() == '全部告警') {
                $("#sliderShow").removeClass("hide");
                if ($("#sliderShow").attr("show") == '1') {  //展开状态
                    $("#sliderContent").removeClass("hide");
                    $("#alarmOverviewFilterBox").css("height", "90%");
                } else {
                    $("#sliderContent").addClass("hide");
                    $("#alarmOverviewFilterBox").css("height", "96%");
                }

                $("#all-alarm-object").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                $("#all-alarm-object").parent().addClass("hide").siblings().removeClass("hide");
                $("#all-alarm-tabs").find('.nav-item').eq(0).find(".nav-link").addClass("active").addClass("show");
                $("#all-alarm-tabs").find('.nav-item').eq(1).find(".nav-link").removeClass("active").removeClass("show");
                $("#alarmOverviewFilterBox .filter-box").find(".filter-item").eq(3).removeClass("hide");
                if (!$("#alarmOverviewFilterBox .filter-box").find(".filter-item").eq(3).find(".filter-content-label .tag").hasClass("tag-prompt")) {
                    $("#alarmOverviewFilterBox .card-operate-box").find(".tag-list.clearfix .tag").eq(3).removeClass("hide");
                }
                getFilterData(getFilterTagData(), undefined, undefined, '2');
            } else {
                $("#sliderShow").addClass("hide");
                $("#sliderContent").addClass("hide");
                $("#alarmOverviewFilterBox").css("height", "100%");

                //默认时间段：结束时间当前日期前一天，开始时间当前时间前一天的前7天
                $("#alarmOverviewFilterBox .filter-box").find(".filter-item").eq(3).addClass("hide");
                $("#alarmOverviewFilterBox .card-operate-box").find(".tag-list.clearfix .tag").eq(3).addClass("hide");
                if ($("#startTimeAlarmAnalysis").val() != "" && $("#endTimeAlarmAnalysis").val() != "" && $("#startTimeAlarmAnalysisTwo").val() != "" && $("#endTimeAlarmAnalysisTwo").val() != "") {
                    let timeOne = new Date($("#endTimeAlarmAnalysis").val()).getTime();
                    let timeTwo = new Date($("#startTimeAlarmAnalysisTwo").val()).getTime();
                    if (timeOne > timeTwo) {
                        window.initDatePicker1($("#analysis_time_alarm_start"), -8, true, true, false);
                        window.initDatePicker1($("#analysis_time_alarm_end"), -1, true, true, false);
                        $("#endTimeAlarmAnalysis").val($("#startTimeAlarmAnalysisTwo").val());
                    }
                } else {
                    window.initDatePicker1($("#analysis_time_alarm_start"), -8, true, true, false);
                    window.initDatePicker1($("#analysis_time_alarm_end"), -1, true, true, false);
                    $("#endTimeAlarmAnalysis").val($("#startTimeAlarmAnalysisTwo").val());
                }
                dataAll.startTime = $("#startTimeAlarmAnalysisTwo").val();
                dataAll.endTime = $("#endTimeAlarmAnalysisTwo").val();
                dataAll.startTimeBefore = $("#startTimeAlarmAnalysis").val();
                dataAll.endTimeBefore = $("#endTimeAlarmAnalysis").val();
                $("#alarm-analysis-object").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterData(getFilterTagData(), undefined, undefined, '3');
            }
        }, 100);
    });

    // 进行系统账号权限判定,业务使用者默认打开我的告警,其余权限账号默认打开全部告警页签
    var $sideMenu = $('#pageSidebarMenu').find('.aui-icon-home-2'),
        sideMenuUrl = $sideMenu.parent().attr('lc'),
        $alarmLink = $('#alarm-change-tab').find('.nav-link'),
        $alarmItem = $('#alarm-change-tab').find('.nav-item');
    if (sideMenuUrl.indexOf('index-user.html') !== -1) {
        $alarmItem.eq(1).data('loading', true);
        $alarmLink.eq(1).click();
    } else {
        $alarmItem.eq(0).data('loading', true);
        $alarmLink.eq(0).click();
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
            if (Math.floor(ms / 1000 / 60 / 60) < initStep) {  //按小时
                dataTimeSpace = 1000 * 60;  //按秒
            } else {
                dataTimeSpace = 1000 * 60 * 60;
            }
        } else {  //按天
            dataTimeSpace = 1000 * 60 * 60 * 24;
        }
        var step = (end - start) / dataTimeSpace / initStep;

        var dateList = [],
            stampList = [];
        for (var i = space; i >= 0; i--) {
            dateList.unshift(timestampToTime(dateTime).date);
            stampList.unshift(timestampToTime(dateTime).stamp);
            dateTime = dateTime - dataTimeSpace * step;
        }

        return { dateList, stampList };
    };

    //公共时间格式获取方法
    function timestampToTime(timestamp) {
        var date = new Date(parseInt(timestamp));//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        return { 'date': Y + M + D + ' ' + h + m + s, 'stamp': Date.parse(date) };
    };

    //初始化时间轴
    function initSlider(startDate, endDate) {
        var stampList = getSliderData(new Date(startDate), new Date(endDate)).stampList,
            dateList = getSliderData(new Date(startDate), new Date(endDate)).dateList,
            step = 5;
        if (stampList[stampList.length - 1] != stampList[0]) {
            //隐藏时初始化会有问题，要在显示时初始化
            if (!$("#sliderContent").hasClass("hide")) {
                $("#timeSlider").html(`<input id="Slider1" type="slider" name="area" value="${$("#timeSlider").data("startTime") + ';' + $("#timeSlider").data("endTime")}" />`);
                if (stampList[stampList.length - 1] - stampList[0] > 4) {  //前后两个时间段差距在5秒内
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
                        return timestampToTime(value).date;
                    },
                    onstatechange: function (value) {
                        //console.log(value);
                    },
                    callback: function (value) {
                        objTime.startTime = timestampToTime(value.split(";")[0]).date;
                        objTime.endTime = timestampToTime(value.split(";")[1]).date;
                        objTime.page = '1';
                        objTime.size = '18';
                        objTime.showType = 2;
                        objTime.viewType = $("#alarm-change-tab").find('.nav-link').filter('.active').parent().index() == 0 ? 1 : 4;
                        $("#timeSlider").data({
                            startTime: value.split(";")[0],
                            endTime: value.split(";")[1]
                        });
                        getAllAlarmInfo(objTime, true);
                    }
                })
            }
        } else {
            loadEmpty($("#timeSlider"), '暂无可用时间轴，请选择不同的时间段生成时间轴', '', true);
            //$("#timeSlider").html(`请选择不同的时间段生成时间轴`);
        }
    }

    function changeSlider() {
        var startTime = $("#startTimeSlider").val(),
            endTime = $("#endTimeSlider").val();
        if (startTime && endTime) {
            var $tag = $('#alarmOverviewFilterBox').find('.tag-list').eq(0),
                dataArr = $tag.data('tagDataArr');
            dataArr[3].text = startTime + '~' + endTime;
            dataArr[3].index = 3;

            $("#alarmOverviewFilterBox").find(".filter-box li.filter-item").eq(3).find(".filter-content-label .tag").removeClass("tag-prompt");
            $("#alarmOverviewFilterBox").find(".filter-box li.filter-item").eq(3).find(".filter-content-inner .tag").eq(3).addClass("tag-prompt").html(`${startTime} ~ ${endTime}`).siblings().removeClass("tag-prompt");
            $("#alarmOverviewFilterBox").find(".operate .tag-list .tag").eq(3).removeClass("hide").find(".alarmTimeTop").html(`${startTime} ~ ${endTime}`);

            $("#timeModal").find("#startTimeAlarm").val(startTime);
            $("#timeModal").find("#endTimeAlarm").val(endTime);

            $("#timeModal").data('tagData', {
                type: 'normal',
                text: startTime + '~' + endTime,
                index: 3
            });

            //initSlider(startTime, endTime);
            getFilterData(dataArr, undefined, undefined, '2');
        }
    };

    $("#startTimeSlider").on("click", function () {
        WdatePicker({
            maxDate: '#F{$dp.$D(\'endTimeSlider\') || \'%y-%M-%d\'}',
            minDate: '#F{$dp.$D(\'endTimeSlider\',{d:-30})}',
            dateFmt: 'yyyy-MM-dd HH:mm:ss',
            autoPickDate: true,
            onpicked: changeSlider
        })
    });

    $("#endTimeSlider").on("click", function () {
        WdatePicker({
            minDate: '#F{$dp.$D(\'startTimeSlider\')}',
            maxDate: '#F{\'%y-%M-%d\'||$dp.$D(\'startTimeSlider\',{d:30})}',
            dateFmt: 'yyyy-MM-dd HH:mm:ss',
            autoPickDate: true,
            onpicked: changeSlider
        })
    });

    //时间轴控制收缩按钮点击事件
    $("#sliderShow").on("click", function () {
        if ($("#sliderContent").hasClass("hide")) {
            $('#sliderShow').attr("show", "1").find('i').css({
                transform: 'rotate(0)'
            });
            $("#sliderContent").removeClass("hide");
            $("#alarmOverviewFilterBox").css('height', '90%');

            initSlider($("#startTimeSlider").val(), $("#endTimeSlider").val());
        } else {
            $('#sliderShow').attr("show", "0").find('i').css({
                transform: 'rotate(-180deg)'
            });
            $("#sliderContent").addClass("hide");
            $("#alarmOverviewFilterBox").css('height', '96%');
        }
    });

    /****************************************************时间轴结束****************************************************/

    // 点击查看轨迹分析页面
    $('#alarmOverviewContent').on('click', '.image-info-title .image-info-search', function () {
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
        $('#alartmListTotal').text('告警总数（' + dataNew.length + '）');
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
        $('#currentAlarmPath').removeClass('hide');
        $('#alarmOverviewPage').addClass('hide');
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
        setTimeout(() => {
            window.createBigImgMask($targetParent, 'BKContorl', targetIndex, $('#usearchImg'), evt, {
                cardImg: $targetAlarmRow,
                data: alarmItemData,
                html: $(changeAlarmMaskHtml(alarmItemData))
            }, {
                type: 'BKContorl',
                alarmObjectLen: $('#my-alarm-tabs').data('alarmItemData').length
            });
        }, 100);
    })

    //返回按钮点击事件
    $('#backToAlarmOverview').on('click', function () {
        $('#currentAlarmPath').addClass('hide');
        $('#alarmOverviewPage').removeClass('hide');
    });

    // 隐藏下拉选项框中告警等级一栏
    window.filterDrop($('#alarmOverviewFilterBox'), function (data, index) {
        var deepArr = deepCopy(data);
        if (data[3].text == '全部') {
            deepArr[3].text = '近十天';
            deepArr[3].index = 0;
        }
        var $item = $('#alarm-change-tab').find('.nav-item');
        $item.removeData('loading');
        if ($item.find(".show").html() == '我的告警') {
            if ($("#my-alarm-tabs").find('.nav-item').eq(0).find(".nav-link").hasClass("active")) {
                $("#my-alarm-time").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterData(deepArr, undefined, undefined, '2');
            } else {
                $("#my-alarm-object").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterData(deepArr, undefined, undefined, '1');
            }
        } else if ($item.find(".show").html() == '全部告警') {
            if ($("#all-alarm-tabs").find('.nav-item').eq(0).find(".nav-link").hasClass("active")) {
                $("#all-alarm-time").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterData(deepArr, undefined, undefined, '2');
            } else {
                $("#all-alarm-object").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterData(deepArr, undefined, undefined, '1');
            }
        } else {
            $("#alarm-analysis-object").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
            getFilterData(deepArr, undefined, undefined, '3');
        }
        //getFilterData(data);
    });

    // 全部告警之间不同排序切换
    $('#all-alarm-tabs, #my-alarm-tabs').find('.nav-item').off('click').on('click', function () {
        var $panel = $(this).closest('.tab-pane'),
            $box = $panel.find('.alarm-info-box'),
            $nav = $(this).closest('.nav-tabs'),
            navId = $nav.attr('id'),
            index = $(this).index();
        $box.eq(index).removeClass('hide').siblings('.alarm-info-box').addClass('hide');

        if ($(this).parent().attr("id") == 'my-alarm-tabs') { //我的告警
            if ($(this).find(".nav-link").html() == '按布控对象排序') {
                $("#sliderContent").addClass("hide");
                $("#sliderShow").addClass("hide");
                $("#alarmOverviewFilterBox").css("height", "100%");

                $("#my-alarm-time").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterData(getFilterTagData(), undefined, undefined, '1');
            } else {
                $("#sliderShow").removeClass("hide");
                if ($("#sliderShow").attr("show") == '1') {  //展开状态
                    $("#sliderContent").removeClass("hide");
                    $("#alarmOverviewFilterBox").css("height", "90%");
                } else {
                    $("#sliderContent").addClass("hide");
                    $("#alarmOverviewFilterBox").css("height", "96%");
                }

                $("#my-alarm-object").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterData(getFilterTagData(), undefined, undefined, '2');
            }
        } else {
            if ($(this).find(".nav-link").html() == '按布控对象排序') {
                $("#sliderContent").addClass("hide");
                $("#sliderShow").addClass("hide");
                $("#alarmOverviewFilterBox").css("height", "100%");

                $("#all-alarm-time").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterData(getFilterTagData(), undefined, undefined, '1');
            } else {
                $("#sliderShow").removeClass("hide");
                if ($("#sliderShow").attr("show") == '1') {  //展开状态
                    $("#sliderContent").removeClass("hide");
                    $("#alarmOverviewFilterBox").css("height", "90%");
                } else {
                    $("#sliderContent").addClass("hide");
                    $("#alarmOverviewFilterBox").css("height", "96%");
                }

                $("#all-alarm-object").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterData(getFilterTagData(), undefined, undefined, '2');
            }
        }
    });

    // 绑定查看更多代码
    $(document).on('click', '#alarmOverviewContent .image-info-all', function () {
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
            $(this).text('查看更多');
        }
    });

    // 按时间排序卡片查看大图点击事件
    $('#alarmOverviewContent').on('click', '.warning-item', function (evt) {
        var $alarm = $(this).parent(),
            alarmId = $alarm.attr('id'),
            index = $(this).index(),
            listData = $(this).data('listData');
        setTimeout(() => {
            window.createBigImgMask($alarm, alarmId, index, $('#usearchImg'), evt, {
                cardImg: $(this),
                data: listData,
                html: $(changeAlarmMaskHtml(listData))
                //html:$(window.commonMaskRight(2,listData))   //2位为告警弹窗右侧信息，第二个参数为data
            });
        }, 100);
    });

    // 按布控对象卡片查看大图点击事件
    $('#alarmOverviewContent').on('click', '.swiper-box .image-card-container', function (evt) {
        // var $alarm = $(this).closest('.card-list2'),
        // alarmId = $alarm.attr('id'),
        var $alarm = $(this).closest('.image-card-list'),
            alarmId = $(this).closest('.card-list2').attr('id'),
            index = $(this).index(),
            listData = $(this).data('listData');
        setTimeout(() => {
            window.createBigImgMask($alarm, alarmId, index, $('#usearchImg'), evt, {
                cardImg: $(this),
                data: listData,
                html: $(changeAlarmMaskHtml(listData))
            });
        }, 100);
    });

    // 输入框数据检索功能
    $('#alarm-overview-search').on('keyup', function (evt) {
        if (evt.keyCode === 13) {
            var searchText = $('#alarm-overview-search').val(),
                $item = $('#alarm-change-tab').find('.nav-item');
            $item.removeData('loading');
            dataAll.name = searchText;
            if ($item.find(".show").html() == '我的告警') {
                if ($("#my-alarm-tabs").find('.nav-item').eq(0).find(".nav-link").hasClass("active")) {
                    $("#my-alarm-time").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                    getFilterData(getFilterTagData(), null, searchText, '2');
                } else {
                    $("#my-alarm-object").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                    getFilterData(getFilterTagData(), null, searchText, '1');
                }
            } else if ($item.find(".show").html() == '全部告警') {
                if ($("#all-alarm-tabs").find('.nav-item').eq(0).find(".nav-link").hasClass("active")) {
                    $("#all-alarm-time").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                    getFilterData(getFilterTagData(), null, searchText, '2');
                } else {
                    $("#all-alarm-object").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                    getFilterData(getFilterTagData(), null, searchText, '1');
                }
            } else {
                $("#alarm-analysis-object").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterData(getFilterTagData(), null, searchText, '3');
            }
        }
    });

    $('#alarm-overview-search').siblings('.aui-input-suffix').on('click', function () {
        var searchText = $('#alarm-overview-search').val(),
            $item = $('#alarm-change-tab').find('.nav-item');
        $item.removeData('loading');
        dataAll.name = searchText;
        if ($item.find(".show").html() == '我的告警') {
            if ($("#my-alarm-tabs").find('.nav-item').eq(0).find(".nav-link").hasClass("active")) {
                $("#my-alarm-time").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterData(getFilterTagData(), null, searchText, '2');
            } else {
                $("#my-alarm-object").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterData(getFilterTagData(), null, searchText, '1');
            }
        } else if ($item.find(".show").html() == '全部告警') {
            if ($("#all-alarm-tabs").find('.nav-item').eq(0).find(".nav-link").hasClass("active")) {
                $("#all-alarm-time").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterData(getFilterTagData(), null, searchText, '2');
            } else {
                $("#all-alarm-object").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterData(getFilterTagData(), null, searchText, '1');
            }
        } else {
            $("#alarm-analysis-object").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
            getFilterData(getFilterTagData(), null, searchText, '3');
        }
    });

    //告警状态外部按钮点击事件
    $(".alarmSearchOpt").on("click", "button", function () {
        $(this).addClass("btn-primary").siblings().removeClass("btn-primary");
        var $filterBox = $("#alarmOverviewFilterBox").find(".filter-box").find('.filter-item').eq(1);
        if ($(this).html() == '全部') {
            $filterBox.find(".filter-content-label .tag").click();
        } else if ($(this).html() == '未处理') {
            $filterBox.find(".filter-content-inner .tag").eq(0).click();
        } else if ($(this).html() == '正确') {
            $filterBox.find(".filter-content-inner .tag").eq(1).click();
        } else if ($(this).html() == '错误') {
            $filterBox.find(".filter-content-inner .tag").eq(2).click();
        }
        $("#alarmOverviewFilterBox .operate").find(".tag-list .tag").eq(1).addClass("hide");
    });

    //告警内容 导出 点击事件
    $("#alarmImport").on('click', function () {
        showLoading($('#alarmImport'));
        if ($("#alarm-change-tab").find(".nav-item").eq(0).find(".nav-link").hasClass("show")) {  //全部告警
            if ($("#all-alarm-tabs").find('.nav-item').eq(0).find(".nav-link").hasClass("active")) {
                var portData = objTime,
                    numb = 3000;
            } else if ($("#all-alarm-tabs").find('.nav-item').eq(1).find(".nav-link").hasClass("active")) {
                var portData = objPerson,
                    numb = 5000;
            }
        } else if ($("#alarm-change-tab").find(".nav-item").eq(1).find(".nav-link").hasClass("show")) { //我的告警
            if ($("#my-alarm-tabs").find('.nav-item').eq(0).find(".nav-link").hasClass("active")) {
                var portData = objTime,
                    numb = 3000;
            } else if ($("#my-alarm-tabs").find('.nav-item').eq(1).find(".nav-link").hasClass("active")) {
                var portData = objPerson,
                    numb = 5000;
            }
        } else if ($("#alarm-change-tab").find(".nav-item").eq(2).find(".nav-link").hasClass("show")) {  //告警分析
            var portData = objAnalysis,
                numb = 5000;
        }

        // else if ($("#all-alarm-tabs").find('.nav-item').eq(2).find(".nav-link").hasClass("active")) {
        //     var portData = objAnalysis,
        //         numb = 5000;
        // }
        portData.number = alarmImportTotal;
        portData.peopleId = '';

        if (parseInt(alarmImportTotal) == 0) {
            hideLoading($("#alarmImport"))
            warningTip.say('无告警！');
            return false;
        }
        if (parseInt(alarmImportTotal) > numb) {
            hideLoading($("#alarmImport"))
            warningTip.say('告警不能超过' + numb + '，请筛选后使用！');
            return false;
        }

        var port = 'v2/bkAlarm/exportAlarmInfoToCache',
            successFunc = function (data) {
                hideLoading($('#alarmImport'));
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

    //告警统计查看更多点击事件
    $(".alarmLableShow").on("click", ".btn", function () {
        if ($(this).html() == '查看更多') {
            $(this).html("收起");
            $(".alarmLableShow").find(".alarmLableShowDetail").removeClass("showMoreLables");
        } else {
            $(this).html("查看更多");
            $(".alarmLableShow").find(".alarmLableShowDetail").addClass("showMoreLables");
        }
    });

    //告警分析搜索按钮点击事件
    $("#searchAlarmAnalysis").on("click", function () {
        if ($("#startTimeAlarmAnalysis").val() != "" && $("#endTimeAlarmAnalysis").val() != "" && $("#startTimeAlarmAnalysisTwo").val() != "" && $("#endTimeAlarmAnalysisTwo").val() != "") {
            let timeOne = new Date($("#endTimeAlarmAnalysis").val()).getTime();
            let timeTwo = new Date($("#startTimeAlarmAnalysisTwo").val()).getTime();
            if (timeOne > timeTwo) {
                warningTip.say("比对开始时间段不能大于结束时间段");
            } else {
                dataAll.startTime = $("#startTimeAlarmAnalysisTwo").val();
                dataAll.endTime = $("#endTimeAlarmAnalysisTwo").val();
                dataAll.startTimeBefore = $("#startTimeAlarmAnalysis").val();
                dataAll.endTimeBefore = $("#endTimeAlarmAnalysis").val();
                $("#alarm-analysis-object").siblings().remove(); //每次搜索数据都把之前的滚动条删掉
                getFilterData(getFilterTagData(), undefined, undefined, '3');
            }
        } else {
            warningTip.say("请选择比对时间");
        }
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

    /*******************以下是图表部分内容，目前已经隐藏  ********************/
    //圆环图
    var circleData = [{
        value: 0,
        name: '未处理'
    }, {
        value: 0,
        name: '已命中'
    }, {
        value: 0,
        name: '已误报'
    }]
    var circleChartOption = {
        graphic: [{
            type: 'text',
            left: 'center',
            top: '44%',
            style: {
                text: '告警状态',
                textAlign: 'center',
                fill: '#fff',
                fontSize: 20
            }
        }],
        color: ['#ff5558', '#f2a20c', '#3b9ef3'],
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c}"
        },
        series: [{
            name: '告警等级',
            type: 'pie',
            center: ['50%', '50%'],
            radius: ['62%', '80%'],
            avoidLabelOverlap: false,
            hoverOffset: 3,
            itemStyle: {
                borderWidth: 2,
                borderType: 'solid',
                borderColor: '#15212d'
            },
            label: {
                normal: {
                    show: false,
                    position: 'center'
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data: circleData
        }]
    };

    //折线图
    var lineChartOption = {
        color: ['#3b9ef3'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line'
            },
        },
        grid: {
            left: '0',
            right: '0',
            bottom: '0',
            containLabel: true
        },
        xAxis: [{
            axisTick: false,
            axisLine: {
                show: true,
                lineStyle: {
                    width: 1,
                    color: '#999',
                }
            },
            axisLabel: {
                textStyle: {
                    color: '#999'
                }
            },
            type: 'category',
            data: ['罗湖', '福田', '龙岗', '龙华', '盐田', '公交', '南山', '大鹏', '刑侦', '反恐', '交警']
        },],
        yAxis: [{
            axisTick: {
                show: false,
                lineStyle: {
                    type: 'dashed'
                }
            },
            axisLine: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#999'
                },
                formatter: function (value) {
                    if (value >= 10000 && value < 10000000) {
                        value = value / 10000 + '万';
                    } else if (value >= 10000000) {
                        value = value / 10000000 + '千万';
                    }
                    return value;
                }
            },
            splitLine: {
                lineStyle: {
                    type: 'dash',
                    color: '#999'
                }
            },
            type: 'value'
        }],
        dataZoom: [{
            type: 'inside',
            zoomOnMouseWheel: false,
            moveOnMouseMove: false,
            moveOnMouseWheel: false
        }],
        series: [{
            name: '布控任务总数',
            type: 'bar',
            barWidth: 25,
            stack: 'static',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            itemStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(
                        0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(58,157,242,.9)'
                        },
                        {
                            offset: 1,
                            color: 'rgba(58,157,242,.1)'
                        },
                    ]
                    ),
                    borderColor: '#399bef',
                    borderWidth: 2,
                }
            }
        }]
    }

    /**
     * 告警总数、今日告警数、未处理告警数
     */
    // window.loadData('bkAlarm/alarmStatistics', true, {
    //     ajaxFilter: 'alarm'
    // }, function (data) {
    //     var $ul = $('#alarm-counts'),
    //         $number = $ul.find('.number');
    //     if (data.code === '000') {
    //         var result = data.result;
    //         // 告警总数
    //         if (result.total) {
    //             var valueObj = dataUnitChange(result.total, true, 2)
    //             $number.eq(0).text(valueObj.value);
    //         } else {
    //             $number.eq(0).text(0);
    //         }
    //         // 今日告警数
    //         if (result.dayTotal) {
    //             var valueObj = dataUnitChange(result.dayTotal, true, 2)
    //             $number.eq(1).text(valueObj.value);
    //         } else {
    //             $number.eq(1).text(0);
    //         }
    //         // 本月告警数
    //         if (result.monthTotal) {
    //             var valueObj = dataUnitChange(result.monthTotal, true, 2)
    //             $number.eq(2).text(valueObj.value);
    //         } else {
    //             $number.eq(2).text(0);
    //         }
    //     } else {
    //         $number.text(0)
    //     }
    // });

    // /**
    //  * 告警等级圆环图
    //  */
    // window.loadData('bkAlarm/alarmStatistics', true, {
    //     ajaxFilter: 'circle'
    // }, function (data) {
    //     var $chartDom = $('#alarmCountsCircleChart'),
    //         $chartLegendNum = $chartDom.siblings('.chart-legend').find('.legend-num'),
    //         chartInit = echarts.init($chartDom[0]),
    //         chartOpts = deepCopy(circleChartOption),
    //         chartData = deepCopy(circleData);
    //     if (data.code === '000') {
    //         chartData[0].value = parseFloat(data.result.waiterTotal);
    //         chartData[1].value = parseFloat(data.result.confirmTotal);
    //         chartData[2].value = parseFloat(data.result.errorTotal);
    //         $chartLegendNum.eq(0).text(data.result.waiterTotal);
    //         $chartLegendNum.eq(1).text(data.result.confirmTotal);
    //         $chartLegendNum.eq(2).text(data.result.errorTotal);
    //         chartOpts.series[0].data = chartData;
    //         chartInit.setOption(chartOpts, true);
    //         $(window).off('resize.alarmCountsCircleChart').on('resize.alarmCountsCircleChart', function () {
    //             chartInit.resize();
    //         });
    //     } else {
    //         for (var i = 0; i < chartData.length; i++) {
    //             chartData[i].value = 0;
    //         }
    //         chartOpts.series[0].data = chartData;
    //         chartInit.setOption(chartOpts, true);
    //         $(window).off('resize.alarmCountsCircleChart').on('resize.alarmCountsCircleChart', function () {
    //             chartInit.resize();
    //         });
    //         $chartLegendNum.text(0);
    //     }
    // });

    // /**
    //  * 告警时段统计折线图
    //  */
    // window.loadData('bkAlarm/alarmStatistics', true, {
    //     ajaxFilter: 'line'
    // }, function (data) {
    //     var $chartDom = $('#alarmStatisticsLineChart'),
    //         // $empty = $chartDom.siblings('.chart-card-empty'),
    //         chartInit = echarts.init($chartDom[0]),
    //         chartOpts = deepCopy(lineChartOption);
    //     if (data.code === '000' && (data.result.orgNames != null || data.result.monthTotals != null)) {
    //         // if (data.result.orgNames.length === 0 || data.result.monthTotals.length === 0) {
    //         //     $chartDom.addClass('hide');
    //         //     $empty.removeClass('hide');
    //         // } else {
    //         //     $chartDom.removeClass('hide');
    //         //     $empty.addClass('hide');
    //         // }
    //         chartOpts.xAxis[0].data = data.result.orgNames.slice(0, 5);
    //         chartOpts.series[0].data = data.result.monthTotals.slice(0, 5);
    //         chartOpts.yAxis[0].max = 10000;
    //         chartOpts.series[0].name = '告警统计';
    //         chartInit.setOption(chartOpts, true);
    //         $(window).off('resize.alarmStatisticsLineChart').on('resize.alarmStatisticsLineChart', function () {
    //             chartInit.resize();
    //         });
    //     } else {
    //         // $chartDom.addClass('hide');
    //         // $empty.removeClass('hide');
    //         chartOpts.yAxis[0].max = 10000;
    //         chartOpts.series[0].name = '告警统计';
    //         chartInit.setOption(chartOpts, true);
    //     }
    // });
})(window, window.jQuery)