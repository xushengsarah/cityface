(function (window, $) {
    var _myApplyData = { //检索
        applicationType: '', // 类型: 1-日常工作 2-警情 3-已立案 4-专项工作 5-特殊人员 6-协外
        keywords: '',
        startTime: '',
        endTime: '',
        autoStatus: '', // 任务状态：0-审批中；1-已通过；2-已驳回
        viewType: 1,
        page: '1',
        size: '12',
    };

    var _myCriticalData = { //紧急警务
        type: '', //申请类型2-警情 3-已立案 4-专项工作 7-其他
        autoStatus: '', // 任务状态：0-审批中；1-已通过；2-已驳回
        startTime: '',
        endTime: '',
        viewType: '1',
        page: '1',
        size: '12',
    };

    var _myBKData = { //布控
        taskId: '',
        runStatus: '', //布控任务状态
        type: '', //布控任务类型
        keywords: '',
        startTime: '',
        endTime: '',
        orgIds: [], //机构数组
        viewType: '1',
        autoStatus: '', // 任务状态：0-审批中；1-已通过；2-已驳回
        myApprove: 1, // 我的审批：1-我发起的2-待我审批3-我已审批
        page: '1',
        size: '12',
    };

    $('[data-role="radio"]').checkboxradio();
    $('[data-role="radio-button"]').checkboxradio({
        icon: false
    });
    $('[data-role="checkbox"]').checkboxradio();

    initApplyPage();
    //初始化
    function initApplyPage() {
        refreshApplyList($('#myApplySearch'), $('#myApplySearch').find('.myApprovePage'), 0, true);
        refreshCriticalList($('#myApplyCritical'), $('#myApplyCritical').find('.myApprovePage'), 0, true);
        refreshBKList($('#myApplyContorl'), $('#myApplyContorl').find('.myApprovePage'), 0, true);
        getMyApplyTypeId();
        // 我的审核更换过滤条件
        filterDrop($('#myApplyContainer'), function (data, index) {
            setSearchMoreApplyCondition(index, data[index].text); // 过滤条件参数赋值
            var $currentContainer = $('#myApplyContainer .tab-pane.active');
            $currentContainer.data('isRefreshData', true).siblings().data('isRefreshData', true);
            applyTabParams($currentContainer);
        }, false);
    }

    // 获取申请类型数据
    function getMyApplyTypeId() {
        var port = 'v2/dic/dictionaryInfo',
            data = {
                "kind": "CSRX_SEARCH_APPLICATION_SYSTEM_TYPE"
            };
        var successFunc = function (data) {
            if (data.code == '200') {
                if (data.code === '200' && data.data.length) {
                    var applicationTypeData = data.data;
                    var html = "";
                    for (var i = 0; i < applicationTypeData.length; i++) {
                        if (applicationTypeData[i].id != '7') {
                            html += `<li class="tag" value=${applicationTypeData[i].id}>${applicationTypeData[i].name}</li>`
                        }
                    }
                    $('#myApply').find('.filter-box .tag-list').eq(0).append(html);
                }
            } else {
                warningTip.say(data.message);
            }
        };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };

    /**
     * 管理者登陆 搜索布控更多过滤条件的选择，并将相应数据传递给后台需要的参数
     * @param {object} $itemDom  搜索过滤条件的目标节点
     * @param {number} index  搜索过滤条件类别的index；
     * 						  0 为布控类型过滤；1 为布控时间过滤； 2 为布控任务等级过滤; 3 为创建机构过滤；
     * 					      4 为布控区域过滤；5 为布控库过滤
     */
    function setSearchMoreApplyCondition(index, text) {
        switch (index) {
            case 0: //申请类型
                if ($("#myApplyTabHeader").find(".nav-link.active").parent().index() == 0) { //权限申请
                    switch (text) {
                        case "全部":
                            _myApplyData.applicationType = '';
                            break;
                        case "日常工作":
                            _myApplyData.applicationType = "1";
                            break;
                        case "警情":
                            _myApplyData.applicationType = "2";
                            break;
                        case "已立案":
                            _myApplyData.applicationType = "3";
                            break;
                        case "专项工作":
                            _myApplyData.applicationType = "4";
                            break;
                        case "敏感人员查询":
                            _myApplyData.applicationType = "5";
                            break;
                        case "协外":
                            _myApplyData.applicationType = "6";
                            break;
                    }
                } else {
                    switch (text) {
                        case "全部":
                            _myCriticalData.type = '';
                            break;
                        case "警情":
                            _myCriticalData.type = "2";
                            break;
                        case "已立案":
                            _myCriticalData.type = "3";
                            break;
                        case "专项工作":
                            _myCriticalData.type = "4";
                            break;
                        case "其他":
                            _myCriticalData.type = "8";
                            break;
                    }
                }
                break;
            case 1: //申请状态
                switch (text) {
                    case "全部":
                        _myApplyData.autoStatus = '';
                        _myBKData.autoStatus = '';
                        break;
                    case "审批中":
                        _myApplyData.autoStatus = '0'; //待开始
                        _myBKData.autoStatus = '0';
                        break;
                    case "已通过":
                        _myApplyData.autoStatus = '1'; //进行中
                        _myBKData.autoStatus = '1';
                        break;
                    case "已驳回":
                        _myApplyData.autoStatus = '2'; //已结束
                        _myBKData.autoStatus = '2';
                        break;
                }
                break;
            case 2: // 创建机构
                _myApplyData.orgIds = [];
                switch (text) {
                    case "全部":
                        _myApplyData.orgIds = [];
                        _myBKData.orgIds = [];
                        break;
                    default:
                        _myApplyData.orgIds.push(text);
                        _myBKData.orgIds.push(text);
                        break;
                }
                break;
            case 3: //布控时间
                switch (text) {
                    case "全部":
                        _myApplyData.startTime = "";
                        _myApplyData.endTime = "";
                        _myCriticalData.startTime = "";
                        _myCriticalData.endTime = "";
                        _myBKData.startTime = "";
                        _myBKData.endTime = "";
                        break;
                    case "近一天":
                        _myApplyData.startTime = sureSelectTime(-1).date;
                        _myApplyData.endTime = sureSelectTime(-1).now;
                        _myCriticalData.startTime = sureSelectTime(-1).date;
                        _myCriticalData.endTime = sureSelectTime(-1).now;
                        _myBKData.startTime = sureSelectTime(-1).date;
                        _myBKData.endTime = sureSelectTime(-1).now;
                        break;
                    case "近三天":
                        _myApplyData.startTime = sureSelectTime(-3).date;
                        _myApplyData.endTime = sureSelectTime(-3).now;
                        _myCriticalData.startTime = sureSelectTime(-3).date;
                        _myCriticalData.endTime = sureSelectTime(-3).now;
                        _myBKData.startTime = sureSelectTime(-3).date;
                        _myBKData.endTime = sureSelectTime(-3).now;
                        break;
                    case "近七天":
                        _myApplyData.startTime = sureSelectTime(-7).date;
                        _myApplyData.endTime = sureSelectTime(-7).now;
                        _myCriticalData.startTime = sureSelectTime(-7).date;
                        _myCriticalData.endTime = sureSelectTime(-7).now;
                        _myBKData.startTime = sureSelectTime(-7).date;
                        _myBKData.endTime = sureSelectTime(-7).now;
                        break;
                    case "近半个月":
                        _myApplyData.startTime = sureSelectTime(-15).date;
                        _myApplyData.endTime = sureSelectTime(-15).now;
                        _myCriticalData.startTime = sureSelectTime(-15).date;
                        _myCriticalData.endTime = sureSelectTime(-15).now;
                        _myBKData.startTime = sureSelectTime(-15).date;
                        _myBKData.endTime = sureSelectTime(-15).now;
                        break;
                    default:
                        var timeArrControl = text.split('~');
                        _myApplyData.startTime = timeArrControl[0];
                        _myApplyData.endTime = timeArrControl[1];
                        _myCriticalData.startTime = timeArrControl[0];
                        _myCriticalData.endTime = timeArrControl[1];
                        _myBKData.startTime = timeArrControl[0];
                        _myBKData.endTime = timeArrControl[1];
                }
                break;
        }
    }

    /** 
     * checkbox初始化
     * @param {Object} container 节点容器
     * @param {Boolean} flag 是否勾选
     */
    function checkboxInit($container, flag) {
        if (flag) { //选中
            !$container.prev().hasClass("ui-checkboxradio-checked") && $container.click();
        } else {
            $container.prev().hasClass("ui-checkboxradio-checked") && $container.click();
        }
    };

    /**
     * 管理者登陆 布控任务 全部任务和我的任务 tab切换事件
     */
    function applyTabParams($currentContainer) {
        if ($currentContainer.index() === 0) { // 检索
            // 如果过滤条件有变化，切换tab需要根据过滤条件重新请求数据； 其他时候切换tab只是显隐控制，不需要重新请求
            if ($currentContainer.data('isRefreshData')) {
                refreshApplyList($currentContainer, $currentContainer.find('.myApprovePage'), 0, true);
                $currentContainer.data('isRefreshData', false);
                $('#myApplyContainer .control-total').eq($currentContainer.index()).text('0');
            }
        } else if ($currentContainer.index() === 1) { //紧急
            if ($currentContainer.data('isRefreshData')) {
                refreshCriticalList($currentContainer, $currentContainer.find('.myApprovePage'), 0, true);
                $currentContainer.data('isRefreshData', false);
                $('#myApplyContainer .control-total').eq($currentContainer.index()).text('0');
            }
        } else if ($currentContainer.index() === 2) { // 布控
            if ($currentContainer.data('isRefreshData')) {
                refreshBKList($currentContainer, $currentContainer.find('.myApprovePage'), 0, true);
                $currentContainer.data('isRefreshData', false);
                $('#myApplyContainer .control-total').eq($currentContainer.index()).text('0');
            }
        }
    }

    /** 权限申请
     * @param {*} $table // table目标容器
     * @param {*} $pagination  // 分页目标容器
     * @param {*} pageIndex  // tab切换 0-我发起的页面 1-待我审批页面 2-我已审批页面
     */
    function refreshApplyList($table, $pagination, pageIndex, first) {
        showLoading($table);
        var $tbody = $table.find('.table-hover tbody');
        // 初始化
        if (first) {
            $pagination.html(''); // 清空分页
        }
        var port = 'v3/myApplication/getApplicationList',
            successFunc = function (data) {
                hideLoading($table);
                $tbody.empty();
                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });
                    $("#myApplyContainer .control-total").eq(0).text(data.data.total);
                    if (result && result.length > 0) {
                        var tableHtml = '';
                        for (var i = 0; i < result.length; i++) {
                            var xbUserNames = '';
                            if (result[i].xbUserList) {
                                var listLength = result[i].xbUserList.length;
                                result[i].xbUserList.forEach(function (ele, index) {
                                    if (index == listLength - 1) {
                                        xbUserNames += ele.userName;
                                    } else {
                                        xbUserNames += ele.userName + '，';
                                    }
                                })
                            } else {
                                xbUserNames = '--';
                            }

                            var staticYQ = false,
                                dynamicYQ = false;
                            //判断申请是否到期
                            if (result[i].applications) {
                                result[i].applications.forEach(val => {
                                    //静态是否延期
                                    var endUseDate = val.endUseDate + " " + "23:59:59";
                                    // if (val.type == '1' && new Date(endUseDate).getTime() >= new Date().getTime()) {
                                    //     staticYQ = true;
                                    // } else 
                                    if (val.type == '2' && new Date(endUseDate).getTime() >= new Date().getTime()) { //动态
                                        dynamicYQ = true;
                                    }
                                });
                            }
                            tableHtml += `<tr class="table-row" data-index="${i}" taskId="${result[i].incidentId}">
                                            <!--<td><a class="detail-icon" href="#"><i class="fa fa-plus"></i></a></td>-->
                                            <td></td>
                                            <td title="${result[i].labh || '--'}">${result[i].labh || '--'}</td>
                                            <td title="${result[i].incident || '--'}">${result[i].incident || '--'}</td>
                                            <td>${(result[i].userName || '未知') + (result[i].orgName ? ('(' + result[i].orgName + ')') : '')}</td>
                                            <td title="${result[i].userId || '--'}">${result[i].userId || '--'}</td>
                                            <td title="${xbUserNames}">${xbUserNames}</td>
                                            <td title="${result[i].createTime || '--'}">${result[i].createTime || '--'}</td>
                                            <td title="${result[i].comments || '暂无'}">${result[i].comments || '暂无'}</td>
                                            <td>
                                                ${result[i].autoStatus === '0' && `<div class="status-item text-prompt"><i class="status-icon status-icon-online"></i><span class="status-text">审批中</span></div>`
                                || result[i].autoStatus === '1' && `<div class="status-item text-active"><i class="status-icon status-icon-success"></i><span class="status-text">已通过</span></div>`
                                || result[i].autoStatus === '2' && `<div class="status-item text-danger"><i class="status-icon status-icon-error"></i><span class="status-text">已驳回</span></div>` || '--'}
                                            </td>
                                            <td class="operation">
                                                <span class="text-link text-delay ${dynamicYQ && $.cookie('xh_userId') == result[i].userId && result[i].autoStatus == '1' && !result[i].applications[0].parentId ? '' : 'hide'}" staticYQ=${staticYQ} dynamicYQ=${dynamicYQ} title="延期">延期</span>
                                                <span class="text-link text-add ${dynamicYQ && $.cookie('xh_userId') == result[i].userId && result[i].autoStatus == '1' && !result[i].applications[0].parentId ? '' : 'hide'}" title="增加协办人" staticYQ=${staticYQ} dynamicYQ=${dynamicYQ} title="增加协办人">增加协办人</span>
                                            </td>
                                        </tr>`
                        }
                        // 给列表新增行数据
                        $tbody.empty().html(tableHtml);
                        $tbody.find("tr").each(function (index, el) {
                            $(el).data('listData', result[index]);
                        });
                        if (data.data.total > Number(_myApplyData.size) && first) {
                            var pageSizeOpt = [{
                                value: 12,
                                text: '12/页',
                                selected: true
                            }, {
                                value: 15,
                                text: '15/页',
                            }, {
                                value: 20,
                                text: '20/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                _myApplyData.page = currPage;
                                _myApplyData.size = pageSize;
                                refreshApplyList($table, '', pageIndex, false)
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="10" class="text-center">没有匹配的记录</td></tr>');
                        $('.loading-box').hide();
                    }
                } else {
                    $("#myApplyContainer .control-total").eq(0).text(0);
                    $tbody.html('<tr><td colspan="10" class="text-center">没有匹配的记录</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, _myApplyData, successFunc);
    }

    /** 紧急警务申请
     * @param {*} $table // table目标容器
     * @param {*} $pagination  // 分页目标容器
     * @param {*} pageIndex  // tab切换 0-我发起的页面 1-待我审批页面 2-我已审批页面
     */
    function refreshCriticalList($table, $pagination, pageIndex, first) {
        showLoading($table);
        var $tbody = $table.find('.table-hover tbody');
        // 初始化
        if (first) {
            $pagination.html(''); // 清空分页
        }
        var port = 'v3/myApplication/getExigenceList',
            successFunc = function (data) {
                hideLoading($table);
                $tbody.empty();
                $("#myApplyContainer .control-total").eq(1).text(data.data.total);
                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });
                    if (result && result.length > 0) {
                        var tableHtml = '';
                        for (var i = 0; i < result.length; i++) {
                            var xbUserNames = '';
                            if (result[i].xbUserList && result[i].xbUserList.length > 0) {
                                var listLength = result[i].xbUserList.length;
                                result[i].xbUserList.forEach(function (ele, index) {
                                    if (index == listLength - 1) {
                                        xbUserNames += ele.userName;
                                    } else {
                                        xbUserNames += ele.userName + '，';
                                    }
                                })
                            } else {
                                xbUserNames = '--';
                            }

                            tableHtml += `<tr class="table-row" data-index="${i}" taskId="${result[i].incidentId}">
                                                <td></td>
                                                <td title="${result[i].labh || '--'}">${result[i].labh || '--'}</td>
                                                <td title="${result[i].incident || '--'}">${result[i].incident || '--'}</td>
                                                <td>${result[i].userName + '(' + result[i].orgName + ')' || '--'}</td>
                                                <td title="${result[i].userId || '--'}">${result[i].userId || '--'}</td>
                                                <td title="${xbUserNames}">${xbUserNames}</td>
                                                <td title="${result[i].createTime || '--'}">${result[i].createTime || '--'}</td>
                                                <td title="${result[i].comments || '暂无'}">${result[i].comments || '暂无'}</td>
                                                <td class="operation">
                                                    <span class="text-link ${result[i].status == '1' ? 'hide' : ''}" title="关联补办">关联补办</span>
                                                </td>
                                            </tr>`
                        }
                        // 给列表新增行数据
                        $tbody.empty().html(tableHtml);
                        $tbody.find("tr").each(function (index, el) {
                            $(el).data('listData', result[index]);
                        });
                        if (data.data.total > Number(_myCriticalData.size) && first) {
                            var pageSizeOpt = [{
                                value: 12,
                                text: '12/页',
                                selected: true
                            }, {
                                value: 15,
                                text: '15/页',
                            }, {
                                value: 20,
                                text: '20/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                _myCriticalData.page = currPage;
                                _myCriticalData.size = pageSize;
                                refreshCriticalList($table, '', pageIndex, false)
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="9" class="text-center">没有匹配的记录</td></tr>');
                        $('.loading-box').hide();
                    }
                } else {
                    $tbody.html('<tr><td colspan="9" class="text-center">没有匹配的记录</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, _myCriticalData, successFunc);
    }

    /**
     * 数据获取 紧急警务关联列表详情展示
     * @param {*} targetData 事件数据
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     */
    function MACreateCriticalList(targetData, $table, $pagination, firstPage, currPage, pageSize) {
        // 检索详情
        var $tbody = $table.find('tbody');
        if (firstPage) {
            $pagination.empty();
        }
        var port = 'v3/myApplication/getApplicationList',
            data = {
                applicationType: targetData.type,
                autoStatus: '1',
                linkType: '1',
                page: currPage,
                size: pageSize
            },
            successFunc = function (data) {
                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });

                    if (result && result.length > 0) {
                        var _searchHtml = '';
                        for (var i = 0; i < result.length; i++) {
                            var xbUserNames = '';
                            if (result[i].xbUserList) {
                                var listLength = result[i].xbUserList.length;
                                result[i].xbUserList.forEach(function (ele, index) {
                                    if (index == listLength - 1) {
                                        xbUserNames += ele.userName;
                                    } else {
                                        xbUserNames += ele.userName + '，';
                                    }
                                })
                            } else {
                                xbUserNames = '--';
                            }
                            _searchHtml += `<tr class="table-row">
                                            <td>
                                                <div class="table-checkbox">
                                                    <input data-index="0" name="btSelectItemLib" type="checkbox" value="0" class="table-checkbox-input table-checkbox-row-serviceFusion-lib">
                                                    <span class="table-checkbox-label"></span>
                                                </div>
                                            </td>
                                            <td title="${result[i].labh || '--'}">${result[i].labh || '--'}</td>
                                            <td title="${result[i].incident || '--'}">${result[i].incident || '--'}</td>
                                            <td title="${xbUserNames}">${xbUserNames}</td>
                                            <td title="${result[i].createTime || ''}">${result[i].createTime || ''}</td>
                                            <td title="${result[i].comments || ''}">${result[i].comments || ''}</td>
                                        </tr>`;
                        }
                        // 先清空节点,再把拼接的节点插入
                        $tbody.empty().html(_searchHtml);

                        $tbody.find("tr").each(function (index, el) {
                            $(el).data('listData', result[index]);
                        });
                        if (data.data.total > pageSize && firstPage) {
                            var pageSizeOpt = [{
                                value: 10,
                                text: '10/页',
                                selected: true
                            }, {
                                value: 15,
                                text: '15/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                $(".table-checkbox-all").removeAttr("checked");
                                MACreateCriticalList(targetData, $table, $pagination, false, currPage, pageSize);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="6" class="text-center">没有匹配的记录</td></tr>');
                        $('.loading-box').hide();
                    }
                } else {
                    $tbody.html('<tr><td colspan="6" class="text-center">没有匹配的记录</td></tr>');
                    $('.loading-box').hide();
                }
            }
        loadData(port, true, data, successFunc);
    }

    /** 布控申请
     * @param {*} $table // table目标容器
     * @param {*} $pagination  // 分页目标容器
     * @param {*} pageIndex  // tab切换 0-我发起的页面 1-待我审批页面 2-我已审批页面
     */
    function refreshBKList($table, $pagination, pageIndex, first) {
        showLoading($table);
        var $tbody = $table.find('.table-hover tbody');
        // 初始化
        if (first) {
            $pagination.html(''); // 清空分页
        }
        var port = 'v3/distributeManager/distributeTaskList',
            successFunc = function (data) {
                hideLoading($table);
                $tbody.empty();
                $("#myApplyContainer .control-total").eq(2).text(data.data.total);
                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });
                    if (result && result.length > 0) {
                        var tableHtml = '';
                        for (var i = 0; i < result.length; i++) {
                            tableHtml += `<tr class="table-row" data-index="${i}" taskId="${result[i].id}">
                                            <td></td>
                                            <td title="${result[i].name || '--'}">${result[i].name || '--'}</td>
                                            <td title="${result[i].creator + '(' + result[i].orgName + ')' || '--'}">${result[i].creator + '(' + result[i].orgName + ')' || '--'}</td>
                                            <td title="${result[i].creatorId || '--'}">${result[i].creatorId || '--'}</td>
                                            <td>${result[i].imgList && result[i].imgList.length > 0 ? '布控' + (result[i].imgList ? result[i].imgList.length : '0') + '个人' : '布控' + (result[i].libId ? '1' : '0') + '个库'}</td>
                                            <td title="${result[i].createTime || '--'}">${result[i].createTime || '--'}</td>
                                            <td>${result[i].autoStatus === '0' && `<div class="status-item text-prompt"><i class="status-icon status-icon-online"></i><span class="status-text">审批中</span></div>`
                                || result[i].autoStatus === '1' && `<div class="status-item text-active"><i class="status-icon status-icon-success"></i><span class="status-text">已通过</span></div>`
                                || result[i].autoStatus === '2' && `<div class="status-item text-danger"><i class="status-icon status-icon-error"></i><span class="status-text">已驳回</span></div>` || '--'}
                                            </td>
                                            <td>
                                                ${result[i].runStatus == '1' && `待运行` || result[i].runStatus == '2' && `运行中` || result[i].runStatus == '3' && `已结束` || '--'}
                                            </td>
                                            <td class="operation hide">
                                                <i class="icon aui-icon-edit aui-mr-sm ${pageIndex === 1 ? 'hide' : ''}" title="编辑"></i>
                                            </td>
                                        </tr>`
                        }
                        // 给列表新增行数据
                        $tbody.empty().html(tableHtml);
                        $tbody.find("tr").each(function (index, el) {
                            $(el).data('listData', result[index]);
                        });
                        if (data.data.total > Number(_myBKData.size) && first) {
                            var pageSizeOpt = [{
                                value: 12,
                                text: '12/页',
                                selected: true
                            }, {
                                value: 15,
                                text: '15/页',
                            }, {
                                value: 20,
                                text: '20/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                _myBKData.page = currPage;
                                _myBKData.size = pageSize;
                                refreshBKList($table, '', pageIndex, false)
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="8" class="text-center">没有匹配的记录</td></tr>');
                        $('.loading-box').hide();
                    }
                } else {
                    $tbody.html('<tr><td colspan="8" class="text-center">没有匹配的记录</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, _myBKData, successFunc);
    }

    /** 权限详情
     * @param {*} $table // table目标容器
     * @param {*} $pagination  // 分页目标容器
     * @param {*} myApproveType  // 行数据
     */
    function myApplyTempDetail($rowList, $container, targetData) {
        $rowList.closest("tbody").find('.detail-view').remove();
        $container.siblings().find(".fa-minus").removeClass("fa-minus").addClass("fa-plus");
        $rowList.find(".fa").toggleClass("fa-minus").toggleClass("fa-plus");
        var result = targetData;
        if (result) {
            var _html = '',
                htmlDeatil = '';

            result.forEach((val, index) => {
                var deatilType = '',
                    labh = '暂无';
                switch (val.type) {
                    case '1':
                        deatilType = '静态检索权限';
                        break;
                    case '2':
                        deatilType = '动态检索权限';
                        break;
                    case '3':
                        deatilType = '布控权限';
                        break;
                    case '4':
                        deatilType = '订阅权限';
                        break;
                };

                if (val.writUrl) {
                    if (val.writUrl.substr(val.writUrl.length - 3, val.writUrl.length).toLowerCase() == 'pdf') {
                        labh = `<a class="text-prompt docUrl" url="${val.writUrl}">立案文书.pdf</a>`;
                    } else {
                        labh = `<img class="table-img docUrl" src="${val.writUrl}" url="${val.writUrl}">`;
                    }
                }
                htmlDeatil += `<div class="aui-col-24 form-label-fixed">
                                        <ul class="form-info aui-row form-label-fixed mt-0">
                                            <li class="aui-col-4 form-item-box">
                                                <div class="form-group">
                                                    <label class="aui-form-label">${deatilType}</label>
                                                </div>
                                            </li>
                                            <li class="aui-col-5 form-item-box">
                                                <div class="form-group">
                                                    <label class="aui-form-label">可使用期限：</label>
                                                    <div class="form-text">${val.startUseDate ? (val.startUseDate + '~' + val.endUseDate) : '暂无'}</div>
                                                </div>
                                            </li>
                                            <li class="aui-col-5 form-item-box ${val.type == '1' || val.type == '2' ? '' : 'hide'}">
                                                <div class="form-group">
                                                    <label class="aui-form-label">可使用次数：</label>
                                                    <div class="form-text">${val.limitCount ? (val.useCount ? val.useCount : '0') + '/' + val.limitCount : '暂无'}</div>
                                                </div>
                                            </li>
                                            <li class="aui-col-5 form-item-box ${val.type == '2' ? '' : 'hide'}">
                                                <div class="form-group">
                                                    <label class="aui-form-label">立案文书：</label>
                                                    <div class="form-text">${labh}</div>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>`;
            })

            _html = `<tr class="detail-view">
                        <td colspan="7">
                            <div class="approveDetails">${htmlDeatil}</div>
                        </td>
                    </tr>`;
            if ($rowList.find(".fa").hasClass('fa-minus')) {
                $container.after(_html);
            }
        }
    }

    // 鼠标移入显示气泡
    function showBunnle($this, result) {
        var $menu = $([
            `<div class="mouseOverDetail mouseOverRight" style="width:15rem;">
                <div class="aui-timeline">
                </div>
            </div>`
        ].join(''));
        // 审批状态
        if (result && result.length > 0) {
            var appLength = result.length - 1; //taskApproveList 顺序是倒序
            result.forEach(function (item, index) {
                var $liHtml = $([`<div class="aui-timeline-item">
                                        <div class="aui-timeline-item-header clearfix">
                                            <div class="aui-timeline-item-dot"></div>
                                            <div class="aui-timeline-item-title">${result[index].status === 0 && `<span class="status-text text-prompt">进行中</span>`
                    || result[index].status === 1 && `<span class="status-text text-active">已通过</span>`
                    || result[index].status === 2 && `<span class="status-text text-danger">已驳回</span>` || '--'}
                                            </div>
                                        </div>
                                        <div class="aui-timeline-item-wrap">
                                            <div class="aui-timeline-item-content">
                                                <ul class="approverName-text">
                                                    <li><label class="aui-form-label">审批人：${result[index].approverName ? result[index].approverName : ''}</label></li>
                                                    <li><label class="aui-form-label ${result[index].approvalTime ? '' : 'hide'}">审批时间：${result[index].approvalTime}</label></li>
                                                    <li><label class="aui-form-label ${result[index].approvalReason ? '' : 'hide'}" style="word-break:break-all">${result[index].status === 1 && `审批意见`
                    || result[index].status === 2 && `驳回原因` || '--'}：${result[index].approvalReason}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>`].join(''));
                var nameLi = '';
                //$liHtml.find('.approverName-text').append(nameLi);
                $menu.find('.aui-timeline').append($liHtml);
            });
            // 去掉最下面的时间轴线
            $menu.children('.aui-timeline-item:last-child').find('.aui-timeline-item-wrap').remove();
        }
        var menuLen = $('.mouseOverDetail').length;
        if (menuLen > 0) {
            $('.mouseOverDetail').off().remove();
        }
        $('body').append($menu);
        // var top = $this.offset().top - $menu.outerHeight() - 20,
        //     left = $this.offset().left - $menu.outerWidth() / 2 - $this.outerWidth() / 2;
        var top = $this.offset().top - $menu.outerHeight() / 2 + 10,
            left = $this.offset().left - $menu.outerWidth() - $this.outerWidth() - 20;
        $menu.css({
            top: top + $(document).scrollTop(),
            left: left + $this.width()
        });
    };

    /**
     * 数据获取 申请详情展示
     * @param {*} rowData // 数据
     * @param {*} type  // 类型1是检索2是紧急
     */
    function MACreateApplyDetail(rowData, type) {
        if (rowData) {
            if (type == 1) {
                var port = 'v3/myApplication/getApplicationList',
                    data = { //检索
                        incidentId: rowData.incidentId,
                        viewType: 1,
                        page: '1',
                        size: '12',
                        random: Math.random()
                    }
            } else {
                var port = 'v3/myApplication/getExigenceList',
                    data = { //检索
                        incidentId: rowData.incidentId,
                        viewType: 1,
                        page: '1',
                        size: '12',
                        random: Math.random()
                    }
            }
            var successFunc = function (data) {
                if (data.code == '200') {
                    var targetData = data.data.list[0];
                    var url = "./facePlatform/incident-dialog.html";
                    $('.incident-new-popup').data({
                        incidentDetail: targetData,
                        showDynamicDetail: true,
                        myDetail: true
                    });
                    loadPage($('.incident-new-popup'), url);
                    $('.incident-new-popup').removeClass('hide');
                } else {
                    warningTip.say(data.msg);
                }
            };
            loadData(port, true, data, successFunc);
        } else {
            warningTip.say('暂无详情，请稍后再试');
        }
    };

    // 布控详情 相关文书点击事件
    $('#myApplyTabContent').on('click', '.approveDetails .docUrl', function () {
        if ($(this).text() !== '暂无') {
            var url = $(this).attr("url");
            var post_url = serviceUrl + '/v2/file/downloadByHttpUrl?url=' + url;
            if ($("#IframeReportImg").length === 0) {
                $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
            }
            $('#IframeReportImg').attr("src", post_url);
        }
    })

    //布控详情hover 显示中图
    showMiddleImg($('#myApplySearch-table'), $('#myApply'), '.table-img');

    /**
     * 数据获取 获取申请权限信息
     * @param {*} applicationType 申请类型
     * @param {*} timeS 静态开始
     * @param {*} timeD 动态开始
     * **/
    function getMyApplyOpt(applicationType, timeS, timeD) {
        //var port = 'v3/myApplication/applicationLimit',
        var port = 'v2/dic/getServerConfig',
            data = {
                //applicationType
                "key": "LIMIT_DURATION"
            };
        var successFunc = function (data) {
            if (data.code == '200') {
                //可使用天数
                //静态和动态日历选择时间初始化
                $("#myApplyOptModal_startTimeS").on("click", function () {
                    WdatePicker({
                        maxDate: '#F{$dp.$D(\'myApplyOptModal_endTimeS\')}',
                        minDate: '#F{$dp.$D(\'myApplyOptModal_endTimeS\',{d:-' + data.data + '})||\'' + timeS + '\'}',
                        dateFmt: 'yyyy-MM-dd',
                        autoPickDate: true
                    })
                });

                $("#myApplyOptModal_endTimeS").on("click", function () {
                    WdatePicker({
                        maxDate: '#F{$dp.$D(\'myApplyOptModal_startTimeS\',{d:' + data.data + '})}',
                        minDate: '#F{$dp.$D(\'myApplyOptModal_startTimeS\')||\'' + timeS + '\'}',
                        dateFmt: 'yyyy-MM-dd',
                        autoPickDate: true
                    })
                });

                $("#myApplyOptModal_startTimeD").on("click", function () {
                    WdatePicker({
                        maxDate: '#F{$dp.$D(\'myApplyOptModal_endTimeD\')}',
                        minDate: '#F{$dp.$D(\'myApplyOptModal_endTimeD\',{d:-' + data.data + '})||\'' + timeD + '\'}',
                        dateFmt: 'yyyy-MM-dd',
                        autoPickDate: true
                    })
                });

                $("#myApplyOptModal_endTimeD").on("click", function () {
                    WdatePicker({
                        maxDate: '#F{$dp.$D(\'myApplyOptModal_startTimeD\',{d:' + data.data + '})}',
                        minDate: '#F{$dp.$D(\'myApplyOptModal_startTimeD\')||\'' + timeD + '\'}',
                        dateFmt: 'yyyy-MM-dd',
                        autoPickDate: true
                    })
                });
            } else {
                warningTip.say(data.message);
            }
        };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };

    //检索申请事件
    $("#myApplySearch").on("click", ".detail-icon", function () {
        var $this = $(this),
            $targetRow = $this.closest('.table-row'),
            targetData = $targetRow.data().listData.applications;
        myApplyTempDetail($this, $targetRow, targetData);
    }).on("click", ".aui-icon-edit", function () {
        if ($(this).hasClass("disabled")) {
            return;
        }
        var url = "./facePlatform/applyUsePower.html?dynamic=" + Global.dynamic,
            $this = $(this),
            $targetRow = $this.closest('.table-row'),
            targetData = $targetRow.data().listData;
        $('.applyUse-new-popup').data("allData", targetData);
        loadPage($('.applyUse-new-popup'), url);
        $('.applyUse-new-popup').removeClass('hide');
    }).on("click", ".text-delay", function () { //延期按钮点击事件
        var $this = $(this),
            $targetRow = $this.closest('.table-row'),
            targetData = $targetRow.data().listData,
            approver = '',
            timeS = '',
            timeD = '';

        if (targetData.approveList.length > 1) {
            targetData.approveList.forEach(val => {
                if (val.approvalOrder == 1) {
                    approver = val.approver;
                }
            })
        } else if (targetData.approveList.length == 1) {
            approver = targetData.approveList[0].approver;
        }

        $("#myApplyOptModal .myApplyOptAssistant").addClass("hide");
        $("#myApplyOptModal").data({
            type: 1,
            allData: targetData
        });
        $("#myApplyOptModal").find(".text-danger").addClass("hide");
        $("#myApplyOptModal").find(".modal-title").html("延期");

        $("#myApplyOptModal .myApplyOptSTime").addClass("hide").find("input").val("");
        $("#myApplyOptModal .myApplyOptDTime").addClass("hide").find("input").val("");
        //获取申请权限信息
        targetData.applications && targetData.applications.forEach(val => {
            if (val.type == '1') { //静态
                timeS = changeFormat(new Date(val.endUseDate).getTime() + 1000 * 24 * 60 * 60, false);
                $("#myApplyOptModal .myApplyOptSTime").removeClass("hide").data("id", val.id);
            } else if (val.type == '2') { //动态
                timeD = changeFormat(new Date(val.endUseDate).getTime() + 1000 * 24 * 60 * 60, false);
                $("#myApplyOptModal .myApplyOptDTime").removeClass("hide").data("id", val.id);
            }
        });
        $("#myApplyOptModal").on('shown.bs.modal', function () {
            //获取审批人
            getPersonList($("#myApplyOptModal_approve"), 2, targetData.applicationType, approver, true);
            //获取限制日期
            getMyApplyOpt(targetData.applicationType, timeS, timeD);
        }).modal("show");
    }).on("click", ".text-add", function () { //增加协办人按钮点击事件
        var $this = $(this),
            $targetRow = $this.closest('.table-row'),
            targetData = $targetRow.data().listData,
            approver = '';

        if (targetData.approveList.length > 1) {
            targetData.approveList.forEach(val => {
                if (val.approvalOrder == 1) {
                    approver = val.approver;
                }
            })
        } else if (targetData.approveList.length == 1) {
            approver = targetData.approveList[0].approver;
        }
        $("#myApplyOptModal .myApplyOptAssistant").removeClass("hide");
        $("#myApplyOptModal .myApplyOptSTime").addClass("hide");
        $("#myApplyOptModal .myApplyOptDTime").addClass("hide");
        $("#myApplyOptModal").data({
            type: 2,
            allData: targetData
        });
        $("#myApplyOptModal").find(".text-danger").addClass("hide");
        $("#myApplyOptModal").find(".modal-title").html("增加协办人");
        $("#myApplyOptModal").on('shown.bs.modal', function () {
            //获取审批人
            getPersonList($("#myApplyOptModal_approve"), 2, targetData.applicationType, approver, true);
        }).modal("show");
        $('#myApplyOptModal_assistant').siblings().click();
    }).on("click", "tbody tr.table-row td:not(.operation)", function () {
        var $this = $(this),
            targetData = $this.closest('.table-row').data().listData;
        MACreateApplyDetail(targetData, 1);
    }).off('mouseover', ".status-item").on("mouseover", ".status-item", function (event) { //鼠标移入显示气泡事件
        event.stopPropagation();
        event.preventDefault();
        var $this = $(this),
            $targetRow = $this.closest('.table-row'),
            targetData = $targetRow.data().listData;
        $('.mouseOverDetail').remove();
        var getUrlSuccessFunc = function (data) {
            if (data.code === '200') {
                if (data.data) {
                    showBunnle($this, data.data.taskApproveList);
                }
            } else {
                warningTip.say(data.message);
            }
        }
        mouseOverApply = setTimeout(() => {
            loadData('v3/myApplication/getApproveDetail', true, {
                'id': targetData.incidentId,
                'userId': targetData.userId
            }, getUrlSuccessFunc);
        }, 500);
        $this.off("mouseout").on("mouseout", function (event) { // 布控详情 单击事件入口
            event.stopPropagation();
            event.preventDefault();
            $('.mouseOverDetail').remove();
            window.clearTimeout(mouseOverApply);
        });
    });

    //紧急申请事件
    $("#myApplyCritical").on("click", "tbody tr.table-row td:not(.operation)", function () {
        var $this = $(this),
            targetData = $this.closest('.table-row').data().listData;
        MACreateApplyDetail(targetData, 2);
    }).on("click", "td.operation", function () {
        var $this = $(this),
            targetData = $this.closest('.table-row').data().listData;
        MACreateCriticalList(targetData, $("#myApplyCriticalTable"), $("#myApplyCriticalTablePagination"), true, 1, 10);
        $("#myApplyCriticalModal").data("emergentIncidentId", targetData.incidentId);
        $("#myApplyCriticalModal").modal("show");
    });

    //紧急申请事件关联列表点击单选框
    $("#myApplyCriticalTable").on("click", "input[type='checkbox']", function () {
        var count = $(this).parents("tr").index();
        $("#myApplyCriticalTable").find("input[type='checkbox']").each((index, el) => {
            if (index != count) {
                $("#myApplyCriticalTable").find("input[type='checkbox']").eq(index).prop("checked", false);
            }
        })
    });

    //紧急申请事件关联列表点击确认
    $("#myApplyCriticalOK").on("click", function () {
        var incidentId = '',
            emergentIncidentId = $("#myApplyCriticalModal").data("emergentIncidentId");
        $("#myApplyCriticalTable").find("input[type='checkbox']").each((index, el) => {
            if ($("#myApplyCriticalTable").find("input[type='checkbox']").eq(index).is(":checked")) {
                incidentId = $("#myApplyCriticalTable").find("tbody tr").eq(index).data("listData").incidentId;
            }
        })

        if (!incidentId) {
            warningTip.say("请选择一个事件进行关联");
        } else {
            var port = 'v3/myApplication/bindingIncident',
                data = {
                    incidentId,
                    emergentIncidentId
                },
                successFunc = function (data) {
                    if (data.code == '200') {
                        warningTip.say('关联成功', 1);
                        $("#myApplyCriticalModal").modal("hide");
                        refreshCriticalList($('#myApplyCritical'), $('#myApplyCritical').find('.myApprovePage'), 0, true);
                    } else {
                        warningTip.say(data.message);
                    }
                };
            loadData(port, true, data, successFunc);
        }
    });

    //紧急申请关联弹窗确定事件
    //权限申请延期和协办人确认按钮点击事件
    $("#myApplyOptModalOK").on("click", function () {
        $("#myApplyOptModal").find(".text-danger").addClass("hide");

        var type = $("#myApplyOptModal").data("type"),
            allData = $("#myApplyOptModal").data("allData"),
            appliDelays = [],
            flag = true;
        // if (!$("#myApplyOptModal .myApplyOptSTime").hasClass("hide")) {
        //     var staticObj = {};
        //     staticObj.type = '1';
        //     staticObj.startDate = $("#myApplyOptModal_startTimeS").val();
        //     staticObj.endDate = $("#myApplyOptModal_endTimeS").val();
        //     staticObj.id = $("#myApplyOptModal .myApplyOptSTime").data("id");
        //     appliDelays.push(staticObj);
        // }
        var dynamicObj = {};
        if (!$("#myApplyOptModal .myApplyOptDTime").hasClass("hide")) {
            dynamicObj.type = '2';
            dynamicObj.startDate = $("#myApplyOptModal_startTimeD").val();
            dynamicObj.endDate = $("#myApplyOptModal_endTimeD").val();
            dynamicObj.id = $("#myApplyOptModal .myApplyOptDTime").data("id");
            appliDelays.push(dynamicObj);
        }
        //校验审批人
        if ($("#myApplyOptModal_approve").val() == '') {
            flag = false;
            $("#myApplyOptModal_approve").closest(".form-group").find(".text-danger").removeClass("hide");
        }

        if (type == 1) { //延期
            // if (allData.applicationType == '1') {  //只有静态权限
            //     if (!staticObj.startDate || !staticObj.endDate) {
            //         flag = false;
            //         $("#myApplyOptS_time").closest(".form-group").find(".text-danger").removeClass("hide");
            //     }
            // } else {  //动静态权限都可以
            //     if (!staticObj.startDate && !staticObj.endDate && !dynamicObj.startDate && !dynamicObj.endDate) {
            //         flag = false;
            //         $("#myApplyOptD_time").closest(".form-group").find(".text-danger.allLog").removeClass("hide");
            //     } else {
            //         if ((staticObj.startDate && !staticObj.endDate) || (!staticObj.startDate && staticObj.endDate)) {
            //             flag = false;
            //             $("#myApplyOptS_time").closest(".form-group").find(".text-danger").removeClass("hide");
            //         }

            //         if ((dynamicObj.startDate && !dynamicObj.endDate) || (!dynamicObj.startDate && dynamicObj.endDate)) {
            //             flag = false;
            //             $("#myApplyOptD_time").closest(".form-group").find(".text-danger.oneLog").removeClass("hide");
            //         }
            //     }
            // }

            if (!dynamicObj.startDate && !dynamicObj.endDate) {
                flag = false;
                $("#myApplyOptD_time").closest(".form-group").find(".text-danger.allLog").removeClass("hide");
            } else {
                if ((dynamicObj.startDate && !dynamicObj.endDate) || (!dynamicObj.startDate && dynamicObj.endDate)) {
                    flag = false;
                    $("#myApplyOptD_time").closest(".form-group").find(".text-danger.oneLog").removeClass("hide");
                }
            }

            if (flag) {
                var port = 'v3/myApplication/appliDelay',
                    data = {
                        incidentId: allData.incidentId,
                        approver: $("#myApplyOptModal_approve").val(),
                        appliDelays
                    },
                    successFunc = function (data) {
                        if (data.code == '200') {
                            warningTip.say('延期成功', 1);
                            $("#myApplyOptModal").modal("hide");
                            refreshApplyList($('#myApplySearch'), $('#myApplySearch').find('.myApprovePage'), 0, true);
                        } else {
                            warningTip.say(data.message);
                        }
                    };
                loadData(port, true, data, successFunc);
            }
        } else if (type == 2) { //增加协办人
            if (!$('#myApplyOptModal_assistant').data("noticeUserList").length) {
                flag = false;
                $("#myApplyOptModal_assistant").closest(".form-group").find(".text-danger.null").removeClass("hide");
            }

            $('#myApplyOptModal_assistant').data("noticeUserList").forEach(val => {
                allData.xbUserList.forEach(item => {
                    if (item.userId == val) {
                        flag = false;
                        $("#myApplyOptModal_assistant").closest(".form-group").find(".text-danger.error").removeClass("hide");
                    }
                })
            })

            if (flag) {
                var port = 'v3/myApplication/addXbUser',
                    data = {
                        incidentId: allData.incidentId,
                        approver: $("#myApplyOptModal_approve").val(),
                        xbUserIds: $('#myApplyOptModal_assistant').data("noticeUserList")
                    },
                    successFunc = function (data) {
                        if (data.code == '200') {
                            warningTip.say('增加协办人成功', 1);
                            $("#myApplyOptModal").modal("hide");
                            refreshApplyList($('#myApplySearch'), $('#myApplySearch').find('.myApprovePage'), 0, true);
                        } else {
                            warningTip.say(data.message);
                        }
                    };
                loadData(port, true, data, successFunc);
            }
        }
    });

    // 布控申请点击事件
    $("#myApplyContorl").on("click", "tbody tr.table-row", function () {
        // 表格编辑事件
        var $this = $(this),
            //$targetRow = $this.closest('.table-row'),
            targetData = $this.data().listData,
            url = "./facePlatform/control-new.html?dynamic=" + Global.dynamic;
        // window.localStorage.setItem("prevPage", $(this).attr("prevPageName"));
        $('.control-new-popup').data('controlId', targetData.id);
        $('.control-new-popup').data('controlType', 'edit');
        loadPage($('.control-new-popup'), url);
        $('.control-new-popup').removeClass('hide');
    }).on("mouseover", ".status-item", function (event) { //鼠标移入显示气泡事件
        event.stopPropagation();
        event.preventDefault();
        var $this = $(this),
            $targetRow = $this.closest('.table-row'),
            targetData = $targetRow.data().listData;
        showBunnle($this, targetData.taskApproveList);
        $this.off("mouseout").on("mouseout", function (event) { // 布控详情 单击事件入口
            event.stopPropagation();
            event.preventDefault();
            $('.mouseOverDetail').remove();
        });
    });

    //布控搜索任务点击事件
    $("#applySearchBox").on("click", ".aui-input-suffix", function () {
        //点击搜索按钮查询关键词
        _myBKData.keywords = $("#applyKeyWordInput").val();
        var $currentContainer = $('#myApplyContainer .tab-pane.active');
        refreshBKList($currentContainer, $currentContainer.find('.myApprovePage'), 0, true);
        $('#myApplyContainer .control-total').eq($currentContainer.index()).text('0');
    }).on("keydown", ".aui-input", function (e) {
        var code = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
        if (code == 13) {
            _myBKData.keywords = $("#applyKeyWordInput").val();
            var $currentContainer = $('#myApplyContainer .tab-pane.active');
            refreshBKList($currentContainer, $currentContainer.find('.myApprovePage'), 0, true);
            $('#myApplyContainer .control-total').eq($currentContainer.index()).text('0');
        }
    });

    // 根据tab切换查询不同状态的审批
    $("#myApplyTabHeader").on("click", ".nav-item", function () {
        var $this = $(this),
            pageIndex = $this.index(),
            $currentContainer = $("#myApplyTabContent .tab-pane").eq(pageIndex);
        $("#myApplyTabHeader .control-total").eq(pageIndex).text('0');
        if (pageIndex == 2) { //布控申请
            $("#newMyApply").addClass("hide"); //隐藏申请权限按钮
            $('#myApply').find('.filter-box .filter-item').eq(0).addClass('hide'); //隐藏检索类型
            $('#myApply').find('.filter-box .filter-item').eq(1).addClass('mt-0').removeClass("hide");
            $("#myApply .operate").find(".tag-list li.tag").eq(0).addClass("hide");

            if (!$("#myApply .filter-box").find('.filter-item').eq(1).find(".filter-content-label .tag").hasClass("tag-prompt")) { //不是全选
                $("#myApply .operate").find(".tag-list li.tag").eq(1).removeClass("hide");
            }
            //筛选条件隐藏检索类型
            refreshBKList($currentContainer, $currentContainer.find('.myApprovePage'), 0, true);
        } else if (pageIndex == 0) { //检索
            $("#newMyApply").removeClass("hide");
            $('#myApply').find('.filter-box .filter-item').eq(0).removeClass('hide'); //检索类型
            $('#myApply').find('.filter-box .filter-item').eq(1).removeClass('mt-0').removeClass("hide");

            $('#myApply').find('.filter-box .filter-item').eq(0).find(".tag-list li").removeClass("hide");

            for (let i of $('#myApply').find('.filter-box .filter-item').eq(0).find(".tag-list li")) {
                if ($(i).attr("value") == '7') {
                    var index = $(i).index();

                    $('#myApply').find('.filter-box .filter-item').eq(0).find(".tag-list li").eq(index).addClass("hide");
                }
            }

            if (!$("#myApply .filter-box").find('.filter-item').eq(1).find(".filter-content-label .tag").hasClass("tag-prompt")) { //不是全选审批状态
                $("#myApply .operate").find(".tag-list li.tag").eq(1).removeClass("hide");
            }

            $("#myApply .filter-box").find('.filter-item').eq(0).find(".filter-label.text-overflow").html("申请类型:");
            $("#myApply .operate").find(".tag-list li.tag").eq(0).find("span").eq(0).html("申请类型:");
            if (_myApplyData.applicationType) { //不是全选申请类型
                //console.log(_myApplyData.applicationType);
                var showtext = '',
                    indexTag = 0;
                switch (_myApplyData.applicationType) {
                    case '1':
                        showtext = '日常工作';
                        indexTag = 0;
                        break;
                    case '2':
                        showtext = '警情';
                        indexTag = 1;
                        break;
                    case '3':
                        showtext = '已立案';
                        indexTag = 2;
                        break;
                    case '4':
                        showtext = '专项工作';
                        indexTag = 3;
                        break;
                    case '5':
                        showtext = '敏感人员查询';
                        indexTag = 4;
                        break;
                    case '6':
                        showtext = '协外';
                        indexTag = 5;
                        break;
                }
                $("#myApply .operate").find(".tag-list li.tag").eq(0).find("span").eq(1).html(showtext);
                $("#myApply .operate").find(".tag-list li.tag").eq(0).removeClass("hide");

                $("#myApply .filter-box").find('.filter-item').eq(0).find(".filter-content-label .tag").removeClass("tag-prompt");
                $("#myApply .filter-box").find('.filter-item').eq(0).find(".tag-list li").eq(indexTag).addClass("tag-prompt").siblings().removeClass("tag-prompt");
            } else {
                $("#myApply .operate").find(".tag-list li.tag").eq(0).addClass("hide");
                $("#myApply .filter-box").find('.filter-item').eq(0).find(".filter-content-label .tag").addClass("tag-prompt");
                $("#myApply .filter-box").find('.filter-item').eq(0).find(".tag-list li").removeClass("tag-prompt");
            }
            //筛选条件显示检索类型
            refreshApplyList($currentContainer, $currentContainer.find('.myApprovePage'), 0, true);
        } else if (pageIndex == 1) { //紧急警务
            $("#newMyApply").removeClass("hide");
            $('#myApply').find('.filter-box .filter-item').eq(0).removeClass('hide'); //检索类型
            $('#myApply').find('.filter-box .filter-item').eq(1).addClass('hide');
            $("#myApply .operate").find(".tag-list li.tag").eq(1).addClass("hide");

            $("#myApply .filter-box").find('.filter-item').eq(0).find(".filter-label.text-overflow").html("紧急类型:");
            $("#myApply .operate").find(".tag-list li.tag").eq(0).find("span").eq(0).html("紧急类型:");

            var criticalArr = [2, 3, 4, 7];
            for (let i = 0; i < $('#myApply').find('.filter-box .filter-item').eq(0).find(".tag-list li").length; i++) {
                if (criticalArr.indexOf($('#myApply').find('.filter-box .filter-item').eq(0).find(".tag-list li").eq(i).attr("value")) > -1) {
                    $('#myApply').find('.filter-box .filter-item').eq(0).find(".tag-list li").eq(i).removeClass("hide");
                } else {
                    $('#myApply').find('.filter-box .filter-item').eq(0).find(".tag-list li").eq(i).addClass("hide");
                }
            }

            if (_myCriticalData.type) { //不是全选
                var showtext = '',
                    indexTag = 0;
                switch (_myCriticalData.type) {
                    case '2':
                        showtext = '警情';
                        indexTag = 1;
                        break;
                    case '3':
                        showtext = '已立案';
                        indexTag = 2;
                        break;
                    case '4':
                        showtext = '专项工作';
                        indexTag = 3;
                        break;
                    case '8':
                        showtext = '其他';
                        indexTag = 6;
                        break;
                }
                $("#myApply .operate").find(".tag-list li.tag").eq(0).find("span").eq(1).html(showtext);
                $("#myApply .operate").find(".tag-list li.tag").eq(0).removeClass("hide");

                $("#myApply .filter-box").find('.filter-item').eq(0).find(".filter-content-label .tag").removeClass("tag-prompt");
                $("#myApply .filter-box").find('.filter-item').eq(0).find(".tag-list li").eq(indexTag).addClass("tag-prompt").siblings().removeClass("tag-prompt");
            } else {
                $("#myApply .operate").find(".tag-list li.tag").eq(0).addClass("hide");
                $("#myApply .filter-box").find('.filter-item').eq(0).find(".filter-content-label .tag").addClass("tag-prompt");
                $("#myApply .filter-box").find('.filter-item').eq(0).find(".tag-list li").removeClass("tag-prompt");
            }

            //筛选条件显示紧急类型
            refreshCriticalList($currentContainer, $currentContainer.find('.myApprovePage'), 0, true);
        }
    });

    //点击申请检索权限按钮
    $("#newMyApply").on("click", function () {
        $("#askApplyModal").modal("show");
    });

    //补办手续流程
    $("#askApplyImg,#makeupApplyBtn").on("click", function () {
        $("#makeUpApplyModal").modal("show");
    });

    $("#makeUpApplyKnow").on("click", function () {
        $("#makeUpApplyModal").modal("hide");
    });

    //申请权限须知确定按钮点击事件
    $("#askApplyKnow").on("click", function () {
        $("#askApplyModal").modal("hide");
        var url = "./facePlatform/applyUsePower.html?dynamic=" + Global.dynamic;
        loadPage($('.applyUse-new-popup'), url);
        $('.applyUse-new-popup').removeClass('hide');
        $('.applyUse-new-popup').data("allData", '');
    });

    // 公开范围按人 输入框点击事件 调用树组件
    $('#myApplyOptModal_assistant').orgTree({
        all: true, //人物组织都开启
        area: ['620px', '542px'], //弹窗框宽高
        search: true, // 搜索事件不在orgTree
        newBk: true,
        noMap: true,
        noTree: true,
        ajaxFilter: false,
        node: 'myApplyOptModal_assistant'
    });

    // 公开范围按人 删除按钮事件
    $('#myApplyOptModal_assistant').siblings().on('click', function () {
        if ($('#myApplyOptModal_assistant').attr('disabled') == 'disabled') {
            return
        }
        $('#myApplyOptModal_assistant').val('');
        $('#myApplyOptModal_assistant').attr('title', '');
        $('#myApplyOptModal_assistant').data({
            'saveVal': [],
            'noticeUserList': [],
            'userIdArr': []
        })
    });

    // 公开范围按人 点击事件
    $('#myApplyOptModal_assistant').on('click', function () {
        selectPersonCommon($(this), true, 'v3/myApplication/csrxRoleUsers');
    })
})(window, window.jQuery);