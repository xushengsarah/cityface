(function (window, $) {
    var portData = {};
    initManage();

    //初始化
    function initManage() {
        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });
        $('[data-role="checkbox"]').checkboxradio();
        window.initDatePicker1($('#searchManageTime'), -30); // 初始化其他事件下的时间控件
        var createStartTime = $('#startTimeSpecialCase').val(),
            createEndTime = $('#endTimeSpecialCase').val();
        portData = {
            createStartTime,
            createEndTime
        };
        createLibTableList($("#specialCaseTableList"), $("#specialCaseTablePagination"), true, 1, 13, portData);
        // 设置table的显示区域高度
        var searchHeight = $('#specialCaseManage .manages-search-style').height();
        var viewHeight = $('#specialCaseManage').height();
        $('#specialCaseManage .manages-card-content').css('height', viewHeight - searchHeight - 50);
    };

    // 重置默认数据
    function resetSearchData() {
        $("#specialCaseModal").find("p.text-danger").addClass("hide");
        $("#specialCaseModal").find("[id*=specialCaseAdd_]").attr("disabled", false).removeClass("disabled");
        $("#specialCaseModal").find("[id*=specialCase_]").attr("disabled", false);
        $("#specialCaseLevelRadio").find("input").attr("disabled", false);
        $("#specialCaseView").find("input").attr("disabled", false);

        $('#specialCaseAdd_code').val("");
        $('#specialCaseAdd_eventName').val("");
        $('#specialCaseAdd_comments').val("");
        $("#specialCaseAdd_startTime").val(sureSelectTime(365, true).now);
        $("#specialCaseAdd_endTime").val(sureSelectTime(365, true).date);
        $("#specialCaseLevelLabel3").click();
        //默认选中区域
        $("#specialCaseViewLabel").click();
        //区域机构清空
        $('#specialCase_viewList').data({
            'cameraList': "",
            'gidArr': "",
            'otherCamraList': ""
        }).val("").attr("title", "");
        // $('#control_orgList').data({
        // 	'cameraList': [{
        // 		id: '10',
        // 		name: '深圳市公安局',
        // 		scode: "440300000000"
        // 	}],
        // 	'gidArr': ['10'],
        // 	'otherCamraList': []
        // }).val("深圳市公安局").attr("title", "深圳市公安局");

        //区域镜头清空
        $('#specialCase_viewUserList').data({
            'mapList': []
        }).val("").attr("title", "");
    }

    /**
     * 列表
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     * @param {*} param 过滤条件对象
     */
    function createLibTableList($table, $pagination, first, page, number, param) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="6" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        portData.page = page ? page : 1;
        portData.size = number ? number : 13;
        var port = 'v3/event/getEventInfoList',
            successFunc = function (data) {
                hideLoading($table);
                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });
                    if (result && result.length > 0) {
                        $tbody.empty();
                        for (var i = 0; i < result.length; i++) {
                            var html = '';
                            var orgListHtml = '';

                            html += `<tr data-index="${i}" class="librow" taskId="${result[i].id}">
                                        <td title="${result[i].code}">${result[i].code}</td>
                                        <td title="${result[i].eventName || '--'}">${result[i].eventName || '--'}</td>
                                        <td title="${result[i].comments || '--'}">${result[i].comments || '--'}</td>
                                        <td title="${result[i].startTime ? (result[i].startTime + " 至 " + result[i].endTime) : '--'}">${result[i].startTime ? (result[i].startTime + " 至 " + result[i].endTime) : '--'}</td>
                                        <td title="${result[i].creator + '(' + result[i].orgName + ')' || '--'}">${result[i].creator + '(' + result[i].orgName + ')' || '--'}</td>
                                        <td title="${result[i].createTime || '--'}">${result[i].createTime || '--'}</td>
                                    </tr>`
                            $tbody.append(html);
                            $tbody.find("tr").eq(i).data({
                                'listData': result[i]
                            });
                        }

                        if (data.data.total > Number(portData.size) && first) {
                            var pageSizeOpt = [{
                                value: 13,
                                text: '13/页',
                                selected: true
                            }, {
                                value: 26,
                                text: '26/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                createLibTableList($table, '', false, currPage, pageSize);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="6" class="text-center">No matching records found</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="6" class="text-center">No matching records found</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, portData, successFunc);
    };

    // 可见机构 输入框点击事件 调用树组件
    $('#specialCase_viewList').orgTree({
        all: true, //人物组织都开启
        area: ['620px', '542px'], //弹窗框宽高
        search: true, //开启搜索
        newBk: true, //确认按钮事件
        noMap: true,
        ajaxFilter: true,
        node: 'specialCase_viewList',
        contain: "1", // 树结构中是否包含警种
        viewType: true //公开范围都要加上这个属性，请求参数不同
    });

    // 可见机构 删除按钮事件
    $('#specialCase_viewList').siblings().on('click', function () {
        if ($('#specialCase_viewList').attr("disabled") == "disabled") {
            return;
        }
        $('#specialCase_viewList').val('');
        $('#specialCase_viewList').attr('title', '');
        $('#specialCase_viewList').data({
            'cameraList': [],
            'gidArr': [],
            'otherCamraList': []
        })
    });

    // 公开范围按人 输入框点击事件 调用树组件
    $('#specialCase_viewUserList').orgTree({
        all: true, //人物组织都开启
        area: ['620px', '542px'], //弹窗框宽高
        search: true, // 搜索事件不在orgTree
        newBk: true,
        noMap: true,
        noTree: true,
        ajaxFilter: false,
        node: 'specialCase_viewUserList'
    });

    // 公开范围按人 删除按钮事件
    $('#specialCase_viewUserList').siblings().on('click', function () {
        if ($('#specialCase_viewUserList').attr("disabled") == "disabled") {
            return;
        }
        $('#specialCase_viewUserList').val('');
        $('#specialCase_viewUserList').attr('title', '');
        $('#specialCase_viewUserList').data({
            'saveVal': [],
            'noticeUserList': [],
            'userIdArr': []
        })
    });

    // 公开范围按人 点击事件
    $('#specialCase_viewUserList').on('click', function () {
        $('.multiPickerDlg_right_no_result').html('<i></i>未选择人员');
        $('#memberSearchInput').attr('placeholder', '搜索人员');
        $('.type-change-left').text('人员列表');
        $('.multiPickerDlg_right_title>span').text('已选可见人');
        $('#partyTree').remove();
        $('.type-change-right').hide();
        $('.layui-layer-btn').attr('id', 'noticeUserList');
        showLoading($('.layui-layer-content'));
        // 告警可见人 左侧列表参数
        var controlOpt = {
            page: '1',
            size: '15'
        }
        controlOpt.page = '1';
        var searchPage = 2;
        // controlOpt.orgids = orgids;
        // 告警可见人
        var receivePort = 'v2/user/getOrgUserInfos';
        var receiveSuccessFunc = function (data) {
            if (data.code === '200') {
                $('#saveNode').html('');
                var liList = '',
                    html = '';
                var list = data.data.list;
                if (list) {
                    //判断是否有选中值
                    var userSaveVal = $('#specialCase_viewUserList').data('saveVal');
                    if (list.length > 0) {
                        for (var i = 0; i < list.length; i++) {
                            liList += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`
                        };
                        html = `<div id="receiveResultView" class="ww_searchResult">
                            <ul id="receive_member_list_view" class="ztree">${liList}</ul>
                        </div>`;
                    } else {
                        html = '<p class="search_member_none">当前所选分局暂无告警接收人</p>';
                        $('.multiPickerDlg_right_title').find('.js-remove-all').click();
                    }
                    $('.multiPickerDlg_search_wrapper').append(html);
                    if (userSaveVal && userSaveVal.length > 0) {
                        $('#receive_member_list_view').data({
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
                            $('#receive_member_list_view').find('li[userId="' + liLoginName + '"] .button').addClass('checkbox_true_full');
                        });
                        $('#js-camera-totle').text(userSaveVal.length);
                        $('.multiPickerDlg_right_no_result').hide();
                        $('#saveNode').html(liHtml);
                    } else {
                        $('#receive_member_list_view').data({
                            'cameraList': []
                        });
                    }
                    // 点击清空事件
                    $('.js-remove-all').on('click', function () {
                        $('#saveNode').html('');
                        $('#receive_member_list_view').data({
                            'cameraList': []
                        });
                        $('#js-camera-totle').text('0');
                        $('#receive_member_list_view li .button').removeClass('checkbox_true_full');
                        $('.multiPickerDlg_right_no_result').show();

                    });
                    // 布控详情默认选中项
                    // if (controlId && $('#specialCase_viewUserList').data('userIdArr').length > 0) {
                    //     $('#specialCase_viewUserList').data({
                    //         'noticeUserList': $('#specialCase_viewUserList').data('userIdArr'),
                    //         'saveVal': controlIdResult.viewUserList
                    //     });

                    //     function defaultSelected(list) {
                    //         var liHtml = '';
                    //         list.forEach(function (item) {
                    //             controlIdResult.viewUserList.forEach(function (el, idx) {
                    //                 if (item.userId == el.userId) {
                    //                     $('#receive_member_list_view').find('li[userId="' + el.userId + '"] .button').addClass('checkbox_true_full');
                    //                     el.index = idx;
                    //                 }
                    //             });
                    //         });
                    //         controlIdResult.viewUserList.forEach(function (el) {
                    //             liHtml += '<li title=' + el.userName + ' data-name=' + el.userName + ' userId=' + el.userId + ' class="ww_menuDialog_DualCols_colRight_cnt_item token-input-token js_list_item">' +
                    //                 '<span class="ww_commonImg icon icon_folder_blue"></span>' +
                    //                 '<span class="ww_treeMenu_item_text" title=' + el.userName + '>' + el.userName + '</span>' +
                    //                 '<a href="javascript:" class="ww_menuDialog_DualCols_colRight_cnt_item_delete"><span class="ww_commonImg ww_commonImg_DeleteItem js_delete"></span></a>' +
                    //                 '</li>';
                    //         });
                    //         $('#saveNode').html(liHtml);
                    //         $('.multiPickerDlg_right_no_result').hide();
                    //         $('#js-camera-totle').text(controlIdResult.viewUserList.length);
                    //         $('#receive_member_list_view').data({
                    //             'cameraList': controlIdResult.viewUserList
                    //         });
                    //     }
                    //     defaultSelected(list);
                    // }
                    // 右侧点击取消选中
                    $('#saveNode').on('click', 'li', function () {
                        var $this = $(this);
                        var userId = $this.attr('userId');
                        var saveVal = [];
                        $('#receive_member_list_view').data('cameraList').forEach(function (item) {
                            saveVal.push(item);
                        })
                        for (var i = 0; i < saveVal.length; i++) {
                            if (saveVal[i].userId == userId || saveVal[i].userId == userId) {
                                saveVal.splice(i, 1);
                                $('#receive_member_list_view').find('li[userId="' + userId + '"] .button').removeClass('checkbox_true_full');
                                $('#search_member_list').find('li[userId="' + userId + '"] .button').removeClass('checkbox_true_full');
                            };
                        };
                        $('#receive_member_list_view').data({
                            'cameraList': saveVal
                        });
                        $this.remove();
                        $('#js-camera-totle').text($('#saveNode>li').length);
                        if ($('#saveNode>li').length == 0) {
                            $('.multiPickerDlg_right_no_result').show();
                        }
                    });
                    // 点击确定
                    $('#noticeUserList .layui-layer-btn0').on('click', function () {
                        var saveVal = $('#receive_member_list_view').data('cameraList') && $('#receive_member_list_view').data('cameraList').length > 0 ? $('#receive_member_list_view').data('cameraList') : [];
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
                        // if (controlId) {
                        //     $('#specialCase_viewUserList').data({
                        //         'userIdArr': []
                        //     });
                        // }
                        $('#specialCase_viewUserList').data({
                            'noticeUserList': noticeUserList,
                            'saveVal': saveVal
                        });
                        $('#specialCase_viewUserList').val(nameArr.join(',')).attr('title', nameArr.join(','));

                        if ($('#specialCase_viewUserList').val() !== '' && $('#specialCase_viewUserList').val() !== []) {
                            $('#specialCase_viewUserList').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');
                        }
                        $('.layui-layer-btn1').click();
                        // 清空告警接受人信息
                        $('#control_noticeUserList').data({
                            'saveVal': [],
                            'noticeUserList': []
                        }).val('');
                    });
                    // 左侧列表 点击事件
                    function memberListClick($this) {
                        $this.find('.button').toggleClass('checkbox_true_full');
                        $('.multiPickerDlg_right_no_result').hide();
                        var orgId = $this.attr('data-id');
                        var userName = $this.attr('data-name');
                        var title = $this.attr('title');
                        var userId = $this.attr('userId');
                        var orgName = $this.attr('orgName');
                        var index = $this.index();
                        var repInx; //获取重复数组的索引
                        var newSaveVal = [];
                        if ($('#receive_member_list_view').data('cameraList') && $('#receive_member_list_view').data('cameraList').length > 0) {
                            $('#receive_member_list_view').data('cameraList').forEach(function (item) {
                                newSaveVal.push(item);
                            });
                        }
                        if ($this.closest('#searchResult').length > 0) {
                            $('#receiveResultView').find('li[userId="' + userId + '"]').find('.button').toggleClass('checkbox_true_full');
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
                                    userId: userId,
                                    orgName: orgName
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
                        $('#receive_member_list_view').data({
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
                    $('#receive_member_list_view').on('click', 'li', function () {
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
                                    var receiveList = $('#receive_member_list_view').data('cameraList'),
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
                                $('.search_member_none').hide();
                                $('#search_member_list').show();
                                $('#search_member_list').addClass('ztree').html(li);
                            } else {
                                $('.search_member_none').show();
                                $('#search_member_list').hide();
                            }
                            //$('#searchResult').show();
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
                                                    var receiveList = $('#receive_member_list_view').data('cameraList'),
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
                        $('#receiveResultView').show();
                    })
                    //布控人员检索
                    $('#memberSearchInput').off().on('keydown', function (event) {
                        event.stopPropagation();
                    }).on('keyup', function (event) {
                        var value = $(this).val();
                        // if(value !== '' || null){
                        if (value !== '' && value !== null) {
                            $('#receiveResultView').hide();
                            $('#searchResult').show();
                            searchPage = 2;
                            loadData(receivePort, true, {
                                name: value,
                                ajaxFilter: value
                            }, searchSuccessFunc);
                        } else {
                            $('#receiveResultView').show();
                            $('#searchResult').hide();
                        }
                    });
                    // 滚动加载数据
                    $('#receiveResultView').on('mousewheel', function () {
                        //tab内容列表滚动到底部进行下一分页的懒加载事件
                        var $this = $(this),
                            $currentContainer = $('#receive_member_list_view'),
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
                                        liList += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`
                                    };
                                    $('#receive_member_list_view').append(liList);
                                    var userSaveVal = $('#specialCase_viewUserList').data('saveVal');
                                    if ($('#receive_member_list_view').data('cameraList') && $('#receive_member_list_view').data('cameraList').length > 0 && userSaveVal) {
                                        userSaveVal.forEach(function (item) {
                                            //左侧选中
                                            $('#receive_member_list_view').find('li[userId="' + (item.userId ? item.userId : item.userId) + '"] .button').addClass('checkbox_true_full');
                                            item.index = $('li[userId="' + (item.userId ? item.userId : item.userId) + '"]').index();
                                        });
                                    }
                                }
                            }
                            loadData(receivePort, true, controlOpt, successFn);
                            if ($('#loadLi').length == 0) {
                                var loadLi = '<div id="loadLi" style="margin-top:15px"></div>';
                                $('#receive_member_list_view').after(loadLi);
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
    })

    //切换可见区域按机构 单选框点击事件
    $('#specialCaseViewLabel').on('click', function () {
        if ($(this).next().attr("disabled") == 'disabled') {
            return;
        }
        $('#specialCaseViewPerson').addClass('hide');
        $('#specialCaseViewList').removeClass('hide');
        $('#specialCase_viewList').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');

        $("#specialCaseView1").addClass("ui-checkboxradio-checked");
        $("#specialCaseView2").removeClass("ui-checkboxradio-checked");
    });

    //切换可见区域按人 单选框点击事件
    $('#specialCaseViewLabe2').on('click', function () {
        if ($(this).next().attr("disabled") == 'disabled') {
            return;
        }
        $('#specialCaseViewList').addClass('hide');
        $('#specialCaseViewPerson').removeClass('hide');
        $('#specialCase_viewUserList').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');

        $("#specialCaseView2").addClass("ui-checkboxradio-checked");
        $("#specialCaseView1").removeClass("ui-checkboxradio-checked");
    });

    //点击每一列弹出详情
    $('#specialCaseTableList').on('click', '.librow', function () {
        var result = $(this).data("listData");
        $("#specialCaseAdd_code").val(result.code);
        $("#specialCaseAdd_eventName").val(result.eventName);
        $("#specialCaseAdd_comments").val(result.comments);
        $("#specialCaseAdd_startTime").val(result.startTime);
        $("#specialCaseAdd_endTime").val(result.endTime);
        $(`#specialCaseLevelLabel${result.secrecyType}`).click();

        if (result.viewList && result.viewList.length > 0) {  //按机构
            $("#specialCaseViewLabel").click();
            var gidArr = result.viewList.map(val => val.orgId),
                gidName = result.viewList.map(val => val.orgName);
            $('#specialCase_viewList').data({
                'cameraList': result.viewList,
                'gidArr': gidArr
            }).val(gidName.join(','));
        } else if (result.viewUserList && result.viewUserList.length > 0) {  //按人
            $("#specialCaseViewLabe2").click();
            var viewUserName = result.viewUserList.map(val => val.userName),
                viewUserId = result.viewUserList.map(val => val.userId);

            $('#specialCase_viewUserList').data({
                'nameArr': viewUserName,
                'userIdArr': viewUserId,
                'noticeUserList': viewUserId
            }).val(viewUserName.join(','));
        }

        $("#specialCaseModal").find("[id*=specialCaseAdd_]").attr("disabled", "disabled").addClass("disabled");
        $("#specialCaseModal").find("[id*=specialCase_]").attr("disabled", "disabled");
        $("#specialCaseLevelRadio").find("input").attr("disabled", "disabled");
        $("#specialCaseView").find("input").attr("disabled", "disabled");
        $("#specialCaseModal").find("p.text-danger").addClass("hide");
        $("#specialCaseModal").find(".modal-footer").addClass("hide");
        $("#specialCaseModal").find(".modal-title").html('查看专项工作');
        $("#specialCaseModal").modal("show");
    });

    //新增专项工作点击事件
    $("#addSpecialCase").on("click", function () {
        resetSearchData();
        $("#specialCaseModal").find(".modal-title").html('新增专项工作');
        $("#specialCaseModal").find(".modal-footer").removeClass("hide");
        $("#specialCaseModal").modal("show");
    });

    //专项工作编号失去焦点事件
    $("#specialCaseAdd_code").on("blur", function () {
        var reg = /^[A-Z][0-9A-Z]{8,15}$/,
            value = $(this).val();

        if ($.trim(value)) {
            if (!reg.test(value)) {
                $(this).closest(".form-group").find(".text-danger.tip").removeClass("hide").html("格式不正确，大写字母和数字组成，首位需为大写字母且8-15位");
            } else {
                var port = { code: value },
                    getUrlSuccessFunc = function (data) {
                        if (data.code === '200') {
                            if (data.isUnique == '1') {  // 唯一
                                $("#specialCaseAdd_code").closest(".form-group").find(".text-danger.tip").addClass("hide");
                            } else {
                                $("#specialCaseAdd_code").closest(".form-group").find(".text-danger.tip").removeClass("hide").html("专项工作编号已存在，请重新输入");
                            }
                        } else {
                            warningTip.say(data.message);
                        }
                    }
                loadData('v3/event/judgeCode', true, port, getUrlSuccessFunc);
            }
        } else {
            $(this).closest(".form-group").find(".text-danger.tip").removeClass("hide").html("请输入专项工作编号");
        }
    });

    //搜索按钮点击事件
    $("#searchSpecialCase").on("click", function () {
        portData.code = $("#specialCaseNumber").val();
        portData.eventName = $("#specialCaseName").val();
        portData.createStartTime = $("#startTimeSpecialCase").val();
        portData.createEndTime = $("#endTimeSpecialCase").val();
        createLibTableList($("#specialCaseTableList"), $("#specialCaseTablePagination"), true, 1, 13, portData);
    });

    //新增专项工作确认按钮点击事件
    $("#specialCaseModal").on("click", ".btn-primary", function () {
        $("#specialCaseModal").find("p.text-danger").not(".error").addClass("hide");
        var flag = true,
            code = $.trim($("#specialCaseAdd_code").val()),
            eventName = $.trim($("#specialCaseAdd_eventName").val()),
            comments = $.trim($("#specialCaseAdd_comments").val()),
            startTime = $("#specialCaseAdd_startTime").val(),
            endTime = $("#specialCaseAdd_endTime").val(),
            secrecyType = $("#specialCaseLevelRadio").find("label.ui-checkboxradio-checked").next().val(),
            viewList = $("#specialCase_viewList").data('gidArr') ? $("#specialCase_viewList").data('gidArr') : [],
            viewUserList = $("#specialCase_viewUserList").data('noticeUserList') ? $("#specialCase_viewUserList").data('noticeUserList') : [];

        if ($("#specialCaseViewLabel").hasClass('ui-checkboxradio-checked')) {
            viewUserList = [];
        } else {
            viewList = [];
        }

        var data = {
            code,
            eventName,
            comments,
            startTime,
            endTime,
            secrecyType,
            viewList,
            viewUserList
        }
        for (var key in data) {
            if ((key == 'code' || key == 'eventName' || key == 'comments' || key == 'startTime' || key == 'endTime') && data[key] == '') {
                flag = false;
                if (key == 'number') {
                    $("#specialCaseAdd_" + key).closest(".form-group").find(".text-danger.tip").removeClass("hide").html('请输入专项工作编号');
                } else {
                    $("#specialCaseAdd_" + key).closest(".form-group").find(".text-danger.tip").removeClass("hide");
                }
            }

            if (key == 'viewList' || key == 'viewUserList') {
                if (data.viewList.length == 0 && data.viewUserList.length == 0) {
                    $('#specialCase_' + key).closest('.form-group').find('.text-danger.tip').text("请选择公开范围").removeClass('hide');
                    flag = false;
                }
            }
        }
        if (!$("#specialCaseAdd_code").closest(".form-group").find(".text-danger.error").hasClass("hide")) {
            flag = false;
        }

        if (flag) {
            var getUrlSuccessFunc = function (data) {
                if (data.code === '200') {
                    $("#specialCaseModal").modal("hide");
                    createLibTableList($("#specialCaseTableList"), $("#specialCaseTablePagination"), true, 1, 13, portData);
                    warningTip.say("新增专项工作成功", 1);
                } else {
                    warningTip.say(data.message);
                }
            }
            loadData('v3/event/addEventInfo', true, data, getUrlSuccessFunc);
        }
    })
})(window, window.jQuery);