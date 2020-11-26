(function (window, $) {
    var controlId = $('.AI-new-popup').data('controlId'); //AI告警判断是否是新建
    var controlIdResult;
    initAIAdd();
    //初始化
    function initAIAdd() {
        $('[data-role="radio"]').checkboxradio(); //单选框初始化
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });
        $('[data-role="checkbox"]').checkboxradio();
        // $('.popup-panel').removeClass('hide');

        showLoading($('.layout-type2.control-new-card .aui-card'));

        if (!controlId) { //新建
            createSlider(80);
            createLibList();
            createTypeLevel();
            window.initDatePicker1($('#AiAlarmAdd_time'), 3, false, true, false, {
                limitLength: 15,
                isNewControl: true,
                connection: true
            });
            // 新建布控 3天 标签单选激活 编辑时不一定需要激活
            $('#AItime-radio-button-5').attr('checked', true);
        } else {
            // 布控编辑部分赋值
            var controlIdPort = 'v2/historyTask/taskList',
                controlIdData = {
                    "id": controlId,
                    "viewTypes": 1,
                    "page": '1',
                    "size": '20',
                },
                controlIdPortSuccessFunc = function (data) {
                    var result = data.data.list[0];
                    if (data.code === '200') {
                        controlIdResult = {
                            name: result.name ? result.name : '',
                            ajbh: result.ajbh ? result.ajbh : '',
                            startTime: result.startTime ? result.startTime : '',
                            endTime: result.endTime ? result.endTime : '',
                            grade: result.grade ? result.grade : '',
                            threshold: result.threshold ? result.threshold : '',
                            reason: result.reason ? result.reason : '',
                            orgIds: result.orgList ? result.orgList : [],
                            viewIds: result.viewList ? result.viewList : [],
                            cameraIds: result.cameraList ? result.cameraList : [],
                            noticeUserList: result.noticeUserList ? result.noticeUserList : [],
                            libInfo: result.libInfo ? result.libInfo : {},
                            libTypes: result.libTypes ? result.libTypes : [],
                            noticeWays: result.noticeWays ? result.noticeWays : []
                        };
                        //告警名称
                        $('#AI_name').val(controlIdResult.name);
                        //告警案件编号
                        $('#AI_ajbh').val(controlIdResult.ajbh);
                        //类型,等级,告警推送类型
                        createTypeLevel();
                        //期限 
                        var dateDiff = new Date(controlIdResult.endTime) - new Date(controlIdResult.startTime);
                        var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000));
                        var $datepicker = $('#AiAlarmAdd_time');
                        var $checkboxradio = $datepicker.siblings('.v-middle.wid-55').find('.ui-checkboxradio-button');
                        if (dayDiff <= 3) {
                            $checkboxradio.eq(0).click();
                        } else if (dayDiff > 3 && dayDiff <= 7) {
                            $checkboxradio.eq(1).click();
                        } else if (dayDiff > 7 && dayDiff <= 15) {
                            $checkboxradio.eq(2).click();
                        }
                        // var datetimeStart = controlIdResult.startTime.substring(0, 19);
                        // var datetimeEnd = controlIdResult.endTime.substring(0, 19);
                        $datepicker.find('.datepicker-input').eq(0).val(datetimeStart);
                        $datepicker.find('.datepicker-input').eq(1).val(datetimeEnd);
                        // $datepicker.datepicker({
                        //     format: 'yyyy-mm-dd',
                        //     autoclose: true,
                        //     language: 'zh-CN',
                        //     onSelect: selectDateFunc
                        // }).on('changeDate', selectDateFunc);
                        // 如果时间间隔数不是3天 一周 半个月 时间标签都是未选中状态
                        // 开始时间与结束时间间隔天数
                        var _dayCounts = (datetimeEnd.substring(0, 4) - datetimeStart.substring(0, 4)) * 360 + (datetimeEnd.substring(5, 7) - datetimeStart.substring(5, 7)) * 30 + (datetimeEnd.substring(8, 10) - datetimeStart.substring(8, 10));
                        changeActive(_dayCounts);
                        //告警原因
                        $('#AI_reason').val(controlIdResult.reason);

                        //对比区域-列表 可见范围 给对比区域和可见范围赋值
                        var port = 'v2/org/getOrgInfos',
                            dataLoad = {
                                orgType: 1,
                                userType: 1,
                                returnType: 4
                            },
                            successFunc = function (data) {
                                if (data.code === '200') {
                                    var control_bodyList = data.data;
                                    $('#AI_orgIds').data({
                                        'cameraList': matchList(control_bodyList, controlIdResult.orgIds).newCameraList,
                                        'gidArr': matchList(control_bodyList, controlIdResult.orgIds).newGidArr
                                    }).val(matchList(control_bodyList, controlIdResult.orgIds).newNameArr.join(','));
                                }
                            };
                        loadData(port, true, dataLoad, successFunc, undefined, 'GET');

                        var port1 = 'v2/org/getOrgInfos',
                            dataLoad1 = {
                                orgType: 2,
                                userType: 2,
                                returnType: 4
                            },
                            successFunc1 = function (data) {
                                if (data.code === '200') {
                                    var control_bodyList = data.data;
                                    //可见范围
                                    $('#AI_viewIds').data({
                                        'cameraList': matchList(control_bodyList, controlIdResult.viewIds).newCameraList,
                                        'gidArr': matchList(control_bodyList, controlIdResult.viewIds).newGidArr
                                    }).val(matchList(control_bodyList, controlIdResult.viewIds).newNameArr.join(','));
                                }
                            };
                        loadData(port1, true, dataLoad1, successFunc1, undefined, 'GET');

                        //对比区域-地图 赋值
                        if (controlIdResult.orgIds.length === 0) {
                            var cameraNameList = [],
                                cameraIdList = [];
                            controlIdResult.cameraIds.forEach(function (item) {
                                cameraNameList.push(item.cameraName);
                                cameraIdList.push(item.cameraId);
                            });
                            $('#AI_cameraIds').data({
                                'otherCamraList': cameraIdList
                            }).val(cameraNameList.join(','));
                            $('#AIcameraRadioLable2').click();
                        }

                        //阈值
                        createSlider(controlIdResult.threshold);

                        //告警接收人
                        var userNameList = [],
                            userIdArr = [];
                        controlIdResult.noticeUserList.forEach(function (item) {
                            userNameList.push(item.userName);
                            userIdArr.push(item.userId);
                        });
                        $('#AI_noticeUsers').data({
                            'nameArr': userNameList,
                            'userIdArr': userIdArr,
                            'noticeUserList': userIdArr
                        }).val(userNameList.join(','));
                        //布控库列表
                        createLibList();
                    }
                };
            loadData(controlIdPort, true, controlIdData, controlIdPortSuccessFunc);
        }
    }

    // 时间切换事件
    $('[data-role="radio-button"]').on('click', function () {
        var $this = $(this),
            eventCls = $this.closest('.event'),
            date = $(this).val();
        window.initDatePicker1($('#AiAlarmAdd_time'), date, true, true, false, {
            limitLength: 15,
            isNewControl: true
        });
    });

    // 时间控件点击事件
    window.selectDateFunc = function () {
        //开始时间
        var startTime = $('#AiAlarmAdd_time').find('.datepicker-input').eq(0).val();
        // 结束时间
        var endTime = $('#AiAlarmAdd_time').find('.datepicker-input').eq(1).val();
        // 开始时间与结束时间间隔天数
        var _counts = (endTime.substring(0, 4) - startTime.substring(0, 4)) * 360 + (endTime.substring(5, 7) - startTime.substring(5, 7)) * 30 + (endTime.substring(8, 10) - startTime.substring(8, 10));
        changeActive(_counts);
    }
    $('#AiAlarmAdd_time').find('input').off('blur').on('blur', selectDateFunc);

    // 调用树组件，布控区域
    $('#AI_orgIds').orgTree({
        all: true, //人物组织都开启
        area: ['960px', '718px'], //弹窗框宽高
        search: true, //开启搜索
        cls: 'camera-list',
        ajaxFilter: 'AI_orgIds',
        node: 'AI_orgIds',
        newBk: true
    });

    // 调用树组件，布控区域，地图模式
    $('#AI_cameraIds').orgTree({
        all: true, //人物组织都开启
        area: ['1400px', '780px'], //弹窗框宽高
        search: false, //开启搜索
        cls: 'camera-list',
        ajaxFilter: false,
        node: 'AI_cameraIds',
        newBk: true,
        control_cameraMap: true
    });

    // 调用树组件，可见范围
    $('#AI_viewIds').orgTree({
        all: true, //人物组织都开启
        area: ['620px', '542px'], //弹窗框宽高
        search: true, //开启搜索
        newBk: true,
        noMap: true,
        ajaxFilter: true,
        node: 'AI_viewIds',
        contain: "1", // 树结构中是否包含警种
        viewType: true //可见范围都要加上这个属性，请求传参不同
    });

    // 调用树组件，告警接收人
    $('#AI_noticeUsers').orgTree({
        all: true, //人物组织都开启
        area: ['620px', '542px'], //弹窗框宽高
        search: true, //开启搜索
        newBk: true,
        noMap: true,
        noTree: true,
        node: 'AI_noticeOrgList'
    });

    // 告警接收人左侧列表参数
    var controlOpt = {
        page: '1',
        size: '15'
    }

    //告警接收人，点击事件
    $('#AI_noticeUsers').on('click', function () {
        // var orgids = $('#control_noticeOrgList').data('gidArr');
        $('.multiPickerDlg_right_no_result').html('<i></i>未选择人员');
        $('#memberSearchInput').attr('placeholder', '搜索人员');
        $('.type-change-left').text('人员列表');
        $('.multiPickerDlg_right_title>span').text('已选接收人');
        $('#partyTree').remove();
        $('.type-change-right').hide();
        $('.layui-layer-btn').attr('id', 'noticeUserList');
        // controlOpt.orgids = orgids;
        controlOpt.page = 1;
        var searchPage = 2;
        //告警接收人
        showLoading($('.layui-layer-content'));
        var receivePort = 'v2/user/getOrgUserInfos';
        var receiveSuccessFunc = function (data) {
            if (data.code === '200') {
                $('#saveNode').html('');
                var liList = '',
                    html = '';
                var list = data.data.list;
                if (list) {
                    //判断是否有选中值
                    var userSaveVal = $('#AI_noticeUsers').data('saveVal');
                    if (list.length > 0) {
                        for (var i = 0; i < list.length; i++) {
                            liList += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}"><span class="button chk" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`
                        };
                        html = `<div id="receiveResult" class="ww_searchResult">
                            <ul id="receive_member_list" class="ztree">${liList}</ul>
                        </div>`;
                    } else {
                        html = '<p class="search_member_none">当前所选分局暂无告警接收人</p>';
                        $('.multiPickerDlg_right_title').find('.js-remove-all').click();
                    }
                    $('.multiPickerDlg_search_wrapper').append(html);
                    if (userSaveVal && userSaveVal.length > 0) {
                        $('#receive_member_list').data({
                            'cameraList': userSaveVal
                        });
                        var liHtml = '';
                        userSaveVal.forEach(function (item) {
                            var liNiName = item.userName ? item.userName : item.userName;
                            var liLoginName = item.userId ? item.userId : item.userId;
                            liHtml += '<li title=' + item.title + ' data-name=' + liNiName + ' data-id=' + item.orgId + ' userId=' + liLoginName + ' class="ww_menuDialog_DualCols_colRight_cnt_item token-input-token js_list_item">' +
                                '<span class="ww_commonImg icon icon_folder_blue"></span>' +
                                '<span class="ww_treeMenu_item_text" title=' + item.title + '>' + liNiName + '</span>' +
                                '<a href="javascript:" class="ww_menuDialog_DualCols_colRight_cnt_item_delete"><span class="ww_commonImg ww_commonImg_DeleteItem js_delete"></span></a>' +
                                '</li>';
                            //左侧选中
                            $('#receive_member_list').find('li[userId="' + liLoginName + '"] .button').addClass('checkbox_true_full');
                        });
                        $('#js-camera-totle').text(userSaveVal.length);
                        $('.multiPickerDlg_right_no_result').hide();
                        $('#saveNode').html(liHtml);
                    } else {
                        $('#receive_member_list').data({
                            'cameraList': []
                        });
                    }
                    // 点击清空事件
                    $('.js-remove-all').on('click', function () {
                        $('#saveNode').html('');
                        $('#receive_member_list').data({
                            'cameraList': []
                        });
                        $('#js-camera-totle').text('0');
                        $('#receive_member_list li .button').removeClass('checkbox_true_full');
                        $('.multiPickerDlg_right_no_result').show();

                    });
                    //布控详情默认选中项
                    if (controlId && $('#AI_noticeUsers').data('userIdArr').length > 0) {
                        $('#AI_noticeUsers').data({
                            'noticeUserList': $('#AI_noticeUsers').data('userIdArr'),
                            'saveVal': controlIdResult.noticeUserList
                        });

                        function defaultSelected(list) {
                            var liHtml = '';
                            list.forEach(function (item) {
                                controlIdResult.noticeUserList.forEach(function (el, idx) {
                                    if (item.userId == el.userId) {
                                        $('#receive_member_list').find('li[userId="' + el.userId + '"] .button').addClass('checkbox_true_full');
                                        el.index = idx;
                                    }
                                });
                            });
                            controlIdResult.noticeUserList.forEach(function (el) {
                                liHtml += '<li title=' + el.userName + ' data-name=' + el.userName + ' userId=' + el.userId + ' class="ww_menuDialog_DualCols_colRight_cnt_item token-input-token js_list_item">' +
                                    '<span class="ww_commonImg icon icon_folder_blue"></span>' +
                                    '<span class="ww_treeMenu_item_text" title=' + el.userName + '>' + el.userName + '</span>' +
                                    '<a href="javascript:" class="ww_menuDialog_DualCols_colRight_cnt_item_delete"><span class="ww_commonImg ww_commonImg_DeleteItem js_delete"></span></a>' +
                                    '</li>';
                            });
                            $('#saveNode').html(liHtml);
                            $('.multiPickerDlg_right_no_result').hide();
                            $('#js-camera-totle').text(controlIdResult.noticeUserList.length);
                            $('#receive_member_list').data({
                                'cameraList': controlIdResult.noticeUserList
                            });
                        }
                        defaultSelected(list);
                    }
                    //右侧点击取消选中
                    $('#saveNode').on('click', 'li', function () {
                        var $this = $(this);
                        var userId = $this.attr('userId');
                        var saveVal = [];
                        $('#receive_member_list').data('cameraList').forEach(function (item) {
                            saveVal.push(item);
                        })
                        for (var i = 0; i < saveVal.length; i++) {
                            if (saveVal[i].userId == userId || saveVal[i].userId == userId) {
                                saveVal.splice(i, 1);
                                $('#receive_member_list').find('li[userId="' + userId + '"] .button').removeClass('checkbox_true_full');
                                $('#search_member_list').find('li[userId="' + userId + '"] .button').removeClass('checkbox_true_full');
                            };
                        };
                        $('#receive_member_list').data({
                            'cameraList': saveVal
                        });
                        $this.remove();
                        $('#js-camera-totle').text($('#saveNode>li').length);
                        if ($('#saveNode>li').length == 0) {
                            $('.multiPickerDlg_right_no_result').show();
                        }
                    });
                    //点击确定
                    $('#noticeUserList .layui-layer-btn0').on('click', function () {
                        var saveVal = $('#receive_member_list').data('cameraList') && $('#receive_member_list').data('cameraList').length > 0 ? $('#receive_member_list').data('cameraList') : [];
                        var noticeUserList = [];
                        var nameArr = [];
                        if (saveVal.length > 0) {
                            saveVal.forEach(function (item) {
                                var liLoginName = item.userId;
                                var liNiName = item.userName;
                                noticeUserList.push(liLoginName);
                                nameArr.push(liNiName);
                            })
                        }
                        if (controlId) {
                            $('#AI_noticeUsers').data({
                                'userIdArr': []
                            });
                        }
                        $('#AI_noticeUsers').data({
                            'noticeUserList': noticeUserList,
                            'saveVal': saveVal
                        });
                        $('#AI_noticeUsers').val(nameArr.join(',')).attr('title', nameArr.join(','));

                        if ($('#AI_noticeUsers').val() !== '' && $('#AI_noticeUsers').val() !== []) {
                            $('#AI_noticeUsers').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');
                        }
                        $('.layui-layer-btn1').click();
                    });
                    //左侧列表 点击事件
                    function memberListClick($this) {
                        $this.find('.button').toggleClass('checkbox_true_full');
                        $('.multiPickerDlg_right_no_result').hide();
                        var orgId = $this.attr('data-id');
                        var userName = $this.attr('data-name');
                        var title = $this.attr('title');
                        var userId = $this.attr('userId');
                        var index = $this.index();
                        var repInx; //获取重复数组的索引
                        var newSaveVal = [];
                        if ($('#receive_member_list').data('cameraList') && $('#receive_member_list').data('cameraList').length > 0) {
                            $('#receive_member_list').data('cameraList').forEach(function (item) {
                                newSaveVal.push(item);
                            });
                        }
                        if ($this.closest('#searchResult').length > 0) {
                            $('#receiveResult').find('li[userId="' + userId + '"]').find('.button').toggleClass('checkbox_true_full');
                        }
                        if (newSaveVal.length > 0) {
                            for (var i = 0; i < newSaveVal.length; i++) {
                                if (newSaveVal[i].userId == userId || newSaveVal[i].userId == userId) {
                                    repInx = i;
                                };
                            };
                        };
                        if (repInx) {
                            newSaveVal.splice(repInx, 1);
                        } else {
                            if (repInx == 0) {
                                newSaveVal.splice(repInx, 1);
                            } else {
                                newSaveVal.push({
                                    orgId: orgId,
                                    userName: userName,
                                    title: title,
                                    index: index,
                                    userId: userId
                                });
                            };
                        };
                        //排序
                        function sortSaveVal(data, prop) {
                            function compareSaveVal(obj1, obj2) {
                                var time1 = obj1[prop],
                                    time2 = obj2[prop];
                                if (time1 < time2) {
                                    return -1;
                                } else if (time1 > time2) {
                                    return 1;
                                } else {
                                    return 0;
                                }
                            }
                            return data.sort(compareSaveVal);
                        }
                        newSaveVal = sortSaveVal(newSaveVal, 'index');
                        $('#receive_member_list').data({
                            'cameraList': newSaveVal
                        });
                        var liHtml = '';
                        if (newSaveVal && newSaveVal.length > 0) {
                            newSaveVal.forEach(function (item) {
                                var liLoginName = item.userId;
                                var liNiName = item.userName;
                                liHtml += '<li title=' + item.title + ' data-name=' + liNiName + ' data-id=' + item.orgId + ' userId=' + liLoginName + ' class="ww_menuDialog_DualCols_colRight_cnt_item token-input-token js_list_item">' +
                                    '<span class="ww_commonImg icon icon_folder_blue"></span>' +
                                    '<span class="ww_treeMenu_item_text" title=' + item.title + '>' + liNiName + '</span>' +
                                    '<a href="javascript:" class="ww_menuDialog_DualCols_colRight_cnt_item_delete"><span class="ww_commonImg ww_commonImg_DeleteItem js_delete"></span></a>' +
                                    '</li>';
                            });
                            $('#saveNode').html(liHtml);
                            $('#js-camera-totle').text(newSaveVal.length);
                        } else {
                            $('#saveNode').empty();
                            $('#js-camera-totle').text('0');
                            $('.multiPickerDlg_right_no_result').show();
                        }
                    }
                    $('#receive_member_list').on('click', 'li', function () {
                        var $this = $(this);
                        memberListClick($this);
                    });
                    $('#search_member_list').on('click', 'li', function () {
                        var $this = $(this);
                        memberListClick($this);
                    });
                    searchSuccessFunc = function (data) {
                        if (data.code === '200') {
                            var list = data.data.list;
                            if (list.length > 0) {
                                var li = "";
                                for (var i = 0; i < list.length; i++) {
                                    var receiveList = $('#receive_member_list').data('cameraList'),
                                        active = '';
                                    if (receiveList && receiveList.length > 0) {
                                        receiveList.forEach(function (item) {
                                            if (item.userId == list[i].userId || item.userId == list[i].userId) {
                                                active = 'checkbox_true_full';
                                            }
                                        });
                                    }
                                    li += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}"><span class="button chk ${active}" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`;
                                };
                                $('.search_member_none').hide();
                                $('#search_member_list').addClass('ztree').html(li);
                            } else {
                                $('.search_member_none').show();
                            }
                            $('#searchResult').show();

                            // 滚动加载数据
                            $('#searchResult').on('mousewheel', function () {
                                //tab内容列表滚动到底部进行下一分页的懒加载事件
                                if ($('#memberSearchInput').val() == data.name) {
                                    var $this = $(this),
                                        $currentContainer = $('#search_member_list'),
                                        viewHeight = $this.height(), //视口可见高度
                                        contentHeight = $currentContainer[0].scrollHeight, //内容高度
                                        scrollHeight = $this.scrollTop(), // 已经滚动了的高度
                                        currentCardItemNum = $currentContainer.find("li").length,
                                        totalCardItemNUM = parseInt(data.data.total);
                                    if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM) {
                                        var successFn = function (data) {
                                            if (data.code === '200') {
                                                searchPage = (parseInt(searchPage) + 1).toString(10);
                                                var list = data.data.list;
                                                var li = "";
                                                for (var i = 0; i < list.length; i++) {
                                                    var receiveList = $('#receive_member_list').data('cameraList'),
                                                        active = '';
                                                    if (receiveList && receiveList.length > 0) {
                                                        receiveList.forEach(function (item) {
                                                            if (item.userId == list[i].userId || item.userId == list[i].userId) {
                                                                active = 'checkbox_true_full';
                                                            }
                                                        });
                                                    }
                                                    li += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk ${active}" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`;
                                                };
                                                $('#search_member_list').addClass('ztree').append(li);
                                            }
                                        }
                                        if (searchPage < (parseInt(data.data.totalPage) + 1)) {
                                            loadData(receivePort, true, {
                                                name: $('#memberSearchInput').val(),
                                                ajaxFilter: $('#memberSearchInput').val(),
                                                page: searchPage
                                            }, successFn);
                                        }
                                    }
                                }
                            });
                        }
                    }
                    $('#clearMemberSearchInput').on('click', function () {
                        $('#receiveResult').show();
                    })
                    //布控人员检索
                    $('#memberSearchInput').on('keydown', function (event) {
                        event.stopPropagation();
                    }).on('keyup', function (event) {
                        var value = $(this).val();
                        // if(value !== '' || null){
                        if (value !== '' && value !== null) {
                            $('#receiveResult').hide();
                            $('#searchResult').show();
                            searchPage = 2;
                            loadData(receivePort, true, {
                                name: value,
                                ajaxFilter: value
                            }, searchSuccessFunc);
                        } else {
                            $('#receiveResult').show();
                            $('#searchResult').hide();
                        }
                    });
                    // 滚动加载数据
                    $('#receiveResult').on('mousewheel', function () {
                        //tab内容列表滚动到底部进行下一分页的懒加载事件
                        var $this = $(this),
                            $currentContainer = $('#receive_member_list'),
                            viewHeight = $this.height(), //视口可见高度
                            contentHeight = $currentContainer[0].scrollHeight, //内容高度
                            scrollHeight = $this.scrollTop(), // 已经滚动了的高度
                            currentCardItemNum = $currentContainer.find("li").length,
                            totalCardItemNUM = parseInt(data.data.total);
                        if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM) {
                            controlOpt.page = (Number(controlOpt.page) + 1).toString(10);
                            var successFn = function (data) {
                                if (data.code === '200') {
                                    $('#loadLi').remove();
                                    var liList = '';
                                    var list = data.data.list;
                                    for (var i = 0; i < list.length; i++) {
                                        liList += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}"><span class="button chk" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`
                                    };
                                    $('#receive_member_list').append(liList);
                                    var userSaveVal = $('#AI_noticeUsers').data('saveVal');
                                    if ($('#receive_member_list').data('cameraList') && $('#receive_member_list').data('cameraList').length > 0) {
                                        userSaveVal.forEach(function (item) {
                                            //左侧选中
                                            $('#receive_member_list').find('li[userId="' + (item.userId ? item.userId : item.userId) + '"] .button').addClass('checkbox_true_full');
                                            item.index = $('li[userId="' + (item.userId ? item.userId : item.userId) + '"]').index();
                                        });
                                    }
                                }
                            }
                            loadData(receivePort, true, controlOpt, successFn);
                            if ($('#loadLi').length == 0) {
                                var loadLi = '<div id="loadLi" style="margin-top:15px"></div>';
                                $('#receive_member_list').after(loadLi);
                                showLoading($('#loadLi'));
                            }
                        }
                    });
                } else {
                    $('.multiPickerDlg_search_wrapper').append('<div class="search_member_none">未选择通知范围</div>');
                }
            }
            hideLoading($('.layui-layer-content'));
        };
        loadData(receivePort, true, controlOpt, receiveSuccessFunc);
    });

    //AI告警任务等级
    function createTypeLevel() {
        var infoPort = 'v2/dic/dictionaryInfo',
            infoData = {
                "kind": "TASK_GRADE"
            },
            infoPortSuccessFunc = function (data) {
                if (data.code === '200') {
                    var TASK_GRADE_Html = '';
                    data.data.forEach(function (item, index) {
                        var checked = '';
                        if (controlId && controlIdResult && item.id == controlIdResult.grade) {
                            checked = 'checked'
                        } else if (index == 0) {
                            checked = 'checked';
                        }
                        TASK_GRADE_Html += `<div class="aui-col-8 mt-sm">
                            <label for="radio-level-AI-${index}">${item.name}</label>
                            <input type="radio" name="radio-1-AI" id="radio-level-AI-${index}" value="${item.id}" data-role="radio"
                                ${checked}>
                        </div>`
                    });
                    $("#AI_grade").append(TASK_GRADE_Html);
                    radioFunc();
                }
            },
            infoData2 = {
                "kind": "ALARM_PUSH_TYPE"
            },
            infoPortSuccessFunc2 = function (data) {
                if (data.code === '200') {
                    var ALARM_PUSH_TYPE = '';
                    data.data.forEach(function (item, index) {
                        var checked = '';
                        if (controlId && controlIdResult) {
                            for (var i = 0; i < controlIdResult.noticeWays.length; i++) {
                                if (item.id == controlIdResult.noticeWays[i]) {
                                    checked = 'checked';
                                }
                            }
                        } else if (index == 0) {
                            checked = 'checked';
                        }
                        $("#AI_noticeWays").find('input').eq(0).removeAttr('checked');
                        ALARM_PUSH_TYPE += `<div class="aui-col-6" style="padding-top: 0.4rem">
                                            <label for="AIalarmPushCheckbox${index}" class="ui-checkboxradio-checkbox-label">${item.name}</label>
                                            <input type="checkbox" name="AIalarmPushCheckbox" id="AIalarmPushCheckbox${index}" value="${item.id}" data-role="checkbox" ${checked}>
                                        </div>`
                        // ALARM_PUSH_TYPE += `<option ${selected} value="${item.id}">${item.name}</option>`
                    })
                    $("#AI_noticeWays").append(ALARM_PUSH_TYPE);
                    $('[data-role="checkbox"]').checkboxradio();
                }
            };

        loadData(infoPort, true, infoData, infoPortSuccessFunc, '', 'GET');
        loadData(infoPort, false, infoData2, infoPortSuccessFunc2, '', 'GET');
        hideLoading($('.layout-type2.control-new-card .aui-card'));
    }

    //滑块， 阈值滑块 新建
    function createSlider(val) {
        var sliderValue = val;
        var slider2 = $("#AI_thresholdSlider").slider({
            orientation: "horizontal",
            range: "min",
            max: 100,
            min: 60,
            value: sliderValue,
            create: function (event, ui) {
                $("#AI_thresholdMin2").text(60);
                $("#AI_thresholdMax2").text(100);
            },
            slide: function (event, ui) {
                $("#AI_threshold").val(ui.value);
            }
        });
        $('#AI_threshold').val(sliderValue);
        $("#AI_threshold").on("change", function () {
            if (!(+$(this).val()) || ((+$(this).val()) <= 1)) {
                $(this).val('60');
            }
            slider2.slider("value", $(this).val());
        });
    }

    // 页面初始加载库类型
    function createLibList() {
        loadData('lib/getDynamicLib', true, {}, function (data) {
            if (data.code === '000') {
                var faceLibData = data.result, // 人脸库数据
                    faceLibSelect = '',
                    faceLibHtml = '';
                // 插入数据和节点
                faceLibData.forEach(v => {
                    faceLibHtml += `<option value="${v.libid}">${v.libname}</option>`;
                });
                if (controlId && controlIdResult.libInfo) {
                    faceLibSelect = controlIdResult.libInfo.libId;
                }
                $('#AI_libId').append(faceLibHtml);
                if (faceLibSelect) {
                    $('#AI_libId').selectpicker('val', faceLibSelect);
                    $('#AI_libId').selectpicker('render');
                    $('#AI_libId').selectpicker({
                        'noneSelectedText': '请选择比对库',
                        'val': faceLibSelect
                    });
                } else {
                    $('#AI_libId').selectpicker({
                        'noneSelectedText': '请选择比对库',
                        'val': faceLibSelect,
                    });
                }

                $('#selectpickerWrapAI').on('click', function () {
                    $(this).find('.dropdown-menu li').on('click', function () {
                        $(this).closest('.form-group').find('.text-danger.tip').addClass('hide');
                        $(this).closest('.form-group').find('.no-input-warning').removeClass('no-input-warning');
                        $('#addImgWarning').siblings('.text-danger.tip').addClass('hide');
                    })
                })
            }
        })
    }

    // 改变时间标签的激活状态
    function changeActive(_counts) {
        if (_counts === 3) {
            // 三天 单选激活 
            $('#AItime-label-three-days').addClass('ui-checkboxradio-checked ui-state-active');
            $('#AItime-label-oneweek-days').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#AItime-label-halfmonth-days').removeClass('ui-checkboxradio-checked ui-state-active');
        } else if (_counts === 7) {
            // 七天 单选激活 
            $('#AItime-label-three-days').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#AItime-label-oneweek-days').addClass('ui-checkboxradio-checked ui-state-active');
            $('#AItime-label-halfmonth-days').removeClass('ui-checkboxradio-checked ui-state-active');
        } else if (_counts === 15) {
            // 半个月 单选激活 
            $('#AItime-label-three-days').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#AItime-label-oneweek-days').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#AItime-label-halfmonth-days').addClass('ui-checkboxradio-checked ui-state-active');
        } else {
            // 所有单选不激活 
            $('#AItime-label-three-days').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#AItime-label-oneweek-days').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#AItime-label-halfmonth-days').removeClass('ui-checkboxradio-checked ui-state-active');
        }
    }

    /**
     * @param {array} list 节点挂载数据
     * @param {array} org  编辑详情机构id数组
     */
    function matchList(list, org) {
        var newObj = {};
        var newCameraList = [];
        var newNameArr = [];
        var newGidArr = [];
        if (list && list.length > 0) {
            list.forEach(function (item) {
                org.forEach(function (el) {
                    if (item.orgId == el.orgId) {
                        itemObj = {
                            id: item.orgId,
                            name: item.orgName,
                            scode: item.orgCode
                        };
                        newCameraList.push(itemObj);
                        newNameArr.push(item.orgName);
                        newGidArr.push(item.orgId);
                    }
                })
            });
        }
        newObj = {
            newCameraList: newCameraList,
            newNameArr: newNameArr,
            newGidArr: newGidArr
        }
        return newObj;
    }

    //比对库切换
    $('#AI_libId').on("change", function () {
        var infoPort = 'v2/historyTask/getLibTypes',
            infoData = {
                "libId": $(this).val()
            },
            infoPortSuccessFunc = function (data) {
                if (data.code === '200') {
                    $('#AI_libTypes').empty();
                    $(".typeShow").removeClass("hide");
                    var typeData = data.data,
                        typeSelect = [],
                        typeHtml = '';
                    // 插入人脸库数据和节点
                    typeData.forEach(v => {
                        typeHtml += `<option value="${v.id}">${v.name}</option>`;
                    });
                    if (controlId && controlIdResult.libTypes) {
                        controlIdResult.libTypes.forEach(function (val) {
                            typeSelect.push(val.id);
                        });
                    }
                    $('#AI_libTypes').append(typeHtml);
                    if (typeSelect.length > 0) {
                        $('#AI_libTypes').selectpicker('val', typeSelect);
                        $('#AI_libTypes').selectpicker('refresh');
                        $('#AI_libTypes').selectpicker({
                            'noneSelectedText': '请选择比对库',
                            'val': typeSelect
                        });
                    } else {
                        $('#AI_libTypes').selectpicker('refresh');
                    }
                }
            };
        loadData(infoPort, false, infoData, infoPortSuccessFunc, '', 'GET');
    });

    // 切换列表模式 地图模式
    $('#AIcameraRadioLable1').on('click', function () {
        $('#controlSearchMapAI').addClass('hide');
        $('#controlSearchListAI').removeClass('hide');
        $('#AI_orgIds').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');
    });

    $('#AIcameraRadioLable2').on('click', function () {
        $('#controlSearchListAI').addClass('hide');
        $('#controlSearchMapAI').removeClass('hide');
        $('#AI_cameraIds').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');
    });

    // 列表删除按钮事件
    $('#AI_orgIds').siblings().on('click', function () {
        $('#AI_orgIds').val('');
        var $data = $('#AI_orgIds').data('cameraList');
        if ($data) {
            $('#AI_orgIds').data({
                'cameraList': [],
                'gidArr': [],
                'otherCamraList': []
            })
        }
    });

    // 布控区域，地图删除按钮事件
    $('#AI_cameraIds').siblings().on('click', function () {
        $('#AI_cameraIds').val('');
        var $data = $('#AI_cameraIds').data('cameraList');
        if ($data) {
            $('#AI_cameraIds').data({
                'cameraList': [],
                'gidArr': [],
                'otherCamraList': []
            })
        }
    });

    // 可见范围，删除按钮事件
    $('#AI_viewIds').siblings().on('click', function () {
        $('#AI_viewIds').val('');
        var $data = $('#AI_viewIds').data('cameraList');
        if ($data) {
            $('#AI_viewIds').data({
                'cameraList': [],
                'gidArr': [],
                'otherCamraList': []
            })
        }
    });

    // 告警接收人，删除按钮事件
    $('#AI_noticeUsers').siblings().on('click', function () {
        $('#AI_noticeUsers').val('');
        var $data = $('#AI_noticeUsers').data('saveVal');
        if ($data) {
            $('#AI_noticeUsers').data({
                'saveVal': [],
                'noticeUserList': []
            })
        }
    });

    //布控原因输入事件
    $('#AI_reason').on('input propertychange', function () {
        if ($(this).val() !== '') {
            var currInpLength = $(this).val().length;
            if (currInpLength > 120) {
                var numText = $(this).val().substring(0, 120);
                $(this).val(numText);
                warningTip.say('字数超出限制，多出字符将被截断！');
                var nodeNumb = $(this).removeClass('no-input-warning').next();
                nodeNumb.find('span').text(0);
            } else {
                var nodeNumb = $(this).removeClass('no-input-warning').next();
                nodeNumb.removeClass('hide');
                nodeNumb.find('span').text(120 - currInpLength);
            }
            $(this).removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');
        }
    });

    //新建/编辑确定，点击事件
    $("#onNewBukongAI").click(function () {
        //任务名称
        var name = $('#AI_name').val();
        //案件编号
        var ajbh = $('#AI_ajbh').val();
        //任务等级
        var grade = $('#AI_grade').find('.ui-checkboxradio-checked').siblings('input').val();
        //阈值
        var threshold = Number($('#AI_threshold').val());
        //比对库
        var libId = $("#AI_libId").val();
        //比对库类型
        var libTypes = $("#AI_libTypes").val();
        //任务开始时间
        var startTime = $("#AiAlarmAdd_time").find('.datepicker-input').eq(0).val();
        //任务结束时间
        var endTime = $("#AiAlarmAdd_time").find('.datepicker-input').eq(1).val();
        //比对区域 机构
        if ($("#AIcameraRadioLable1").hasClass('ui-state-active')) {
            var orgIds = $('#AI_orgIds').data('gidArr');
            var cameraIds = [];
        } else {
            //比对区域 框选镜头
            var cameraIds = $('#AI_cameraIds').data('otherCamraList');
            if (cameraIds && cameraIds[0] && cameraIds[0].children) {
                cameraIds = []
            }
            var orgIds = []
        }
        //告警原因
        var reason = $('#AI_reason').val();
        //可见范围
        var viewIds = $('#AI_viewIds').data('gidArr');
        //告警接收人
        var noticeUsers = $('#AI_noticeUsers').data('noticeUserList');
        //通知方式
        var noticeWays = [];
        $('#AI_noticeWays').find('label').each(function (index, item) {
            if (item.className.indexOf('ui-checkboxradio-checked ui-state-active') > -1) {
                noticeWays.push(Number(item.nextElementSibling.value));
            }
        });
        var portData = {
            name: name ? name : '', //任务名
            ajbh: ajbh ? ajbh : '', //任务类型
            startTime: startTime ? startTime : '',
            endTime: endTime ? endTime : '',
            grade: grade ? grade : '', //任务等级
            threshold: threshold ? threshold : '', //阈值
            reason: reason ? reason : '',
            orgIds: orgIds ? orgIds : [], //比对机构 比对镜头列表 二选一
            cameraIds: cameraIds ? cameraIds : [], //比对机构 比对镜头列表 二选一
            libId: libId ? libId : [], //比对库ID
            libTypes: libTypes ? libTypes : [], //比对库类型 
            noticeWays: noticeWays ? noticeWays : '', //通知方式
            viewIds: viewIds ? viewIds : [], //可见域列表
            noticeUsers: noticeUsers ? noticeUsers : [], //通知人列表
        };
        if (controlId) {
            portData.id = controlId;
        }
        //校验
        var controlFlag = true;

        for (var item in portData) {
            if (portData[item] == '' && item != "id" && (item == 'threshold' || item == 'noticeWays' || item == "reason")) {
                $('#AI_' + item).addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').removeClass('hide');
                controlFlag = false;
            }
        }

        var portDataSuccessFunc = function (data) {
            hideLoading($('.layout-type2 .aui-card'));
            if (data.code === '200') {
                setTimeout(() => {
                    $('.AI-new-popup').addClass('hide').removeClass('show').removeData('controlData');
                    if (controlId) {
                        $('.AI-new-popup').data({
                            'controlId': ''
                        });
                        window.editSuccessAI(controlId);
                    } else {
                        var $barItem = $('#pageSidebarMenu .aui-icon-toolbox').closest('.sidebar-item'),
                            barIndex = $barItem.index(),
                            $saveItem = $('#content-box').children().eq(barIndex).find("#AI-alarm");
                        loadPage($saveItem, "./facePlatform/AI-alarm.html?dynamic=" + Global.dynamic);
                    }
                }, 200);
            } else {
                var tip = controlId ? '编辑失败,' + data.message : '新建失败,' + data.message;
                warningTip.say(tip);
            }
        }

        // 按人布控的图片需要保存起来 编辑的时候调用
        if (controlFlag) {
            showLoading($('.layout-type2 .aui-card'));
            loadData('v2/historyTask/editTask', true, portData, portDataSuccessFunc);
        }
    });

    //点击取消
    $('#cancelEditAI').click(function () {
        $('#backPrevPageAI').click();
        // window.localStorage.removeItem('controlId');
        $('.AI-new-popup').data({
            'controlId': ''
        });
    });

    //点击新建布控关闭图标
    $('#backPrevPageAI').click(function () {
        $('.AI-new-popup').data({
            'controlId': ''
        });
    });
})(window, window.jQuery);