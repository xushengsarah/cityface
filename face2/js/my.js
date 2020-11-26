(function (window, $) {

    var $objApproveList = {}; //审批列表需要的参数

    var approveType = ''; // 审批类型: 1-检索申请 2-布控申请 3-订阅申请
    var _myControlData = {
        page: '1',
        size: '8',
        type: '', //布控任务类型
        keywords: '',
        grade: '', //布控任务等级（1紧急2重要3一般）
        startTime: "",
        endTime: "",
        runStatus: 2, //布控任务状态
        orgIds: [], //机构数组
        libIds: [], //布控库数组
        viewTypes: [2],
        taskId: ''
    };

    var searchApproveData = {
        applicationType: '', // 类型: 1-日常工作 2-警情 3-已立案 4-专项工作 5-特殊人员 6-协外
        startTime: '',
        endTime: '',
        userName: '',
        autoStatus: '', // 任务状态：1-待审批 2-已通过 3-已驳回
        viewType: 2, // 我的审批：1-我发起的2-待我审批3-我已审批
        page: '1',
        size: '12',
        random: Math.random()
    };

    var controlApproveData = {
        taskId: '',
        runStatus: '', //布控任务状态
        type: '', //布控任务类型
        keywords: '',
        startTime: '',
        endTime: '',
        orgIds: [], //机构数组
        viewType: '',
        autoStatus: '', // 任务状态：0-审批中；1-已通过；2-已驳回
        myApprove: 2, // 我的审批：1-我发起的2-待我审批3-我已审批
        page: '1',
        size: '12',
    };

    // function initPage() {
    //     // 默认加载我的布控模块
    //     // refreshControlList($('#myControlTabContent .tab-pane.active').find('.card-info-list2').eq(0), true);
    //     // _myControlData.viewTypes = [3];
    //     // refreshControlList($('#myControlTabContent .tab-pane.active').find('.card-info-list2').eq(1));
    // };
    // initPage();


    // 布控模块---begin---

    /**
     * 获取布控任务查询列表的信息 
     * @param {*} $container 加载容器
     * @param {*} loadEndCallback 回调函数
     */
    function loadControlSearchList($container, loadEndCallback) {
        // 加载过度动画
        showLoading($container);
        var port = 'v3/distributeManager/distributeTaskList',
            successFunc = function (data) {
                hideLoading($container);
                if (data.code == '200') {
                    var result = data.data.list;
                    $container.closest('.list-title-box').find('.list-title .tag').text(data.data.total);
                    // var tempStringObject = setArrayToStringObject(result);
                    // loadSuccessCallback && loadSuccessCallback(data.data.total, data.data.totalPage);
                    if (result && result.length > 0) {
                        var _html = '';
                        for (var i = 0; i < result.length; i++) {
                            var tempString = '';
                            if (result[i].runStatus === "1") {
                                tempString = `<span class="subtext text-prompt aui-col-8" title="待开始">待开始</span>`;
                            } else if (result[i].runStatus === '3') {
                                tempString = `<span class="subtext text-lighter aui-col-8" title="已结束">已结束</span>`;
                            } else if (result[i].runStatus === "2") {
                                tempString = `<span class="subtext text-active aui-col-8" title="剩余${result[i].surplusDay}天">剩余${result[i].surplusDay}天</span>`;
                            }
                            _html += `
                                <li class="card-info card-info2" taskId="${result[i].id}">
                                    <div class="card-image">
                                        <div class="img-red-circle hide"></div>
                                        <img class="w-100" src="./assets/images/control/bukong-${(result[i].type === 'ZDSJ' || result[i].type === 'XLBK' || result[i].type === 'YFAB') ? result[i].type : 'CGBK'}-2.png" alt="">
                                        ${_myControlData.runStatus === "0" || result[i].alarmCount === "0" ? '' : `<span class="alarm-num grade${(parseInt(result[i].grade) - 1)}">${result[i].alarmCount}</span>`}
                                    </div>
                                    <div class="info-box">
                                        <p class="card-info-title">
                                            <span class="info-title text-overflow">${result[i].name}</span>
                                            ${result[i].runStatus === "1" ? '' : `<span class="tag grade${result[i].grade}">${result[i].alarmCount ? result[i].alarmCount : 0}</span>`}
                                        </p>
                                        <ul class="form-info form-label-fixed form-label-short">
                                            <li class="form-group">
                                                <label class="aui-form-label">布控对象：</label>
                                                <div class="form-text">${result[i].libList && result[i].libList.length > 0 ? '共' + result[i].libList.length + '个库'
                                    : '共' + (result[i].imgList ? result[i].imgList.length : '0') + '个人'}</div>
                                            </li>
                                            <li class="form-group">
                                                <label class="aui-form-label">创建人：</label>
                                                <div class="form-text" title="${result[i].creator ? result[i].creator : '暂无' + (result[i].orgName ? '(' + result[i].orgName + ')' : '')}">
                                                    ${(result[i].creator ? result[i].creator : '暂无') + (result[i].orgName ? '(' + result[i].orgName + ')' : '')}</div>
                                            </li>
                                            <li class="form-group">
                                                <label class="aui-form-label">创建时间：</label>
                                                <div class="form-text task-card-creattime-overflow aui-row">
                                                    <span class="aui-col-16" title ="${result[i].createTime ? result[i].createTime.split(" ")[0] : '暂无'}">${result[i].createTime ? result[i].createTime.split(" ")[0] : '暂无'}</span>
                                                    ${tempString}
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                            `;
                        }
                        // 先清空容器内容,在把拼接的节点替换插入容器
                        $container.empty().html(_html);
                        $container.find('.card-item').each(function (index, el) {
                            $(this).data('list', result[index]);
                        });
                        $container.find('.card-info').each(function (index, item) {
                            var taskId = $(item).attr('taskid');
                            loadData('v2/bkAlarm/alarmCountByTaskId', true, {
                                taskId: taskId,
                                status: '0'
                            }, function (data) {
                                if (data.code === '200') {
                                    $(item).find('.card-info-title .tag').text(data.count || '0');
                                }
                            });
                        });

                        // 初始化任务列表，所有的页面红点清空
                        $('#myControlTabContent').find('.img-red-circle').addClass('hide')
                        $('#controlTabConten').find('.img-red-circle').addClass('hide')
                    } else {
                        loadEmpty($container, "暂无数据", "", true);
                    }
                } else {
                    loadEmpty($container, "", "系统异常，请重新修改过滤条件");
                }
            };
        loadData(port, true, _myControlData, successFunc);
    };

    /**
     * 刷新我的布控节点，嵌套分页组件联动
     */
    function refreshControlList($container, isMyCreate) {
        loadControlSearchList($container, function (totalsize, totalpage) {
            var $pageContainer = $container.next();
            var pageSizeOpt = [{
                value: 8,
                text: '8/页',
                selected: true
            },
            {
                value: 20,
                text: '20/页',
            }
            ];
            var eventCallBack = function (currPage, pageSize) {
                _myControlData.page = currPage;
                _myControlData.number = pageSize;
                if (isMyCreate) {
                    _myControlData.viewTypes = [2];
                } else {
                    _myControlData.viewTypes = [3];
                }
                loadControlSearchList($container);
            }
            setPageParams($pageContainer, totalsize, totalpage, eventCallBack, true, pageSizeOpt);
            $container.prev().find('.tag').text(totalsize);
            var $controlTotal = $("#myControlTabHeader .nav-link.active .control-total");
            $controlTotal.text(parseInt($controlTotal.text()) + totalsize);
        });
    }

    /**
     * 根据tab选项获取布控状态的执行状态
     * @param {*} tabIndex  tab的index序号
     */
    function setRunStatusLevel(tabIndex) {
        switch (tabIndex) {
            case 0:
                _myControlData.runStatus = "1"; //未执行
                break;
            case 1:
                _myControlData.runStatus = "2"; //进行中
                break;
            case 2:
                _myControlData.runStatus = "3"; //已完成
                break;
        }
    }

    // 根据tab切换查询不同状态的布控信息列表
    $("#myControlTabHeader").on("click", ".nav-item", function () {
        var $this = $(this),
            index = $this.index(),
            $currentContainer = $("#myControlTabContent .tab-pane").eq(index);
        setRunStatusLevel($this.index());

        _myControlData.number = '8';
        _myControlData.page = '1';
        _myControlData.viewTypes = [2];
        refreshControlList($currentContainer.find('.card-info-list2').eq(0), true);
        _myControlData.viewTypes = [3];
        refreshControlList($currentContainer.find('.card-info-list2').eq(1));

        $("#myControlTabHeader .control-total").eq(index).text('0');
    });

    // 点击我的布控 子项查看布控详情
    $('#myControlTabContent').on('click', '.card-info', function () {
        //点击 我的某个布控任务 并 进入相应的布控详情页面
        var $controlDetailPage = $('#controlDetailPage'),
            $controlOverviewPage = $('#content-box'),
            $controlDetailMenu = $('#pageSidebarMenu').find('#260399992').closest('.sidebar-item');
        $('#pageSidebarMenu').find('.sidebar-item .aui-icon-monitor2').closest('.sidebar-item').data({
            'my': true
        });
        if ($controlDetailMenu && $controlDetailMenu.length > 0) {
            $controlDetailPage = $("#content-box .content-save-item").eq($controlDetailMenu.index());
            $controlOverviewPage.data('taskId', $(this).attr('taskId'));
            $controlDetailPage.data('hasInitDetailPage', true);
            $controlDetailMenu.click();
        } else {
            $controlOverviewPage.addClass('display-none').data('taskId', $(this).attr('taskId'));
            $controlDetailPage.removeClass('display-none');
            if (!$controlDetailPage.data('hasInitDetailPage')) {
                var url = "./facePlatform/control-detail.html?dynamic=" + window.Global.dynamic;
                loadPage($controlDetailPage, url);
                $controlDetailPage.data('hasInitDetailPage', true);
            }
        }
        // 点击我的布控详情，去掉红点
        $(this).find('.img-red-circle').addClass('hide');
    });

    // 隐藏我的布控-----begin-----
    if ($("#myControlNav").attr('class').indexOf('hide') > 0) {
        $("#myControlContainer").addClass("hide");
        $("#myPortraitContainer").removeClass("display-none");
        loadMyPortraitContainer($('#myPortraitOperateList'));
    }
    // 隐藏我的布控-----end-----

    // 布控模块---end---



    /**
     * 加载我的模块 我的人员库
     * @param {*} $container 
     */
    function loadMyPortraitContainer($container) {
        // 加载过度动画
        showLoading($container);
        var port = 'mine/myPersonLib',
            successFunc = function (data) {
                // 关闭过度动画
                hideLoading($container);
                // 数据返回成功
                if (data.code == '000') {
                    var _result = data.result;
                    if (_result && _result.length > 0) {
                        // 加载我的人员库日志信息节点
                        createMyPortraitDom(_result, $container);
                    } else {
                        loadEmpty($container, '暂无数据', '近七天暂无操作记录');
                    }
                } else {
                    loadEmpty($container, '暂无数据', data.msg);
                }
            };
        loadData(port, true, null, successFunc);
    }

    /**
     * 加载我的信息
     */
    function loadMyInfo() {
        var port = 'mine/mineInfo',
            successFunc = function (data) {
                if (data.code === '000') {
                    $('#myUserName').text(data.result.userName);
                }
            };
        loadData(port, true, null, successFunc);
    }

    /**
     * 拼接我的人员库节点
     * @param {*} data 传入数据
     * @param {*} $container 插入节点
     */
    function createMyPortraitDom(data, $container) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            var $operlog = data[i].operlog;
            html += `
                <li class="aui-timeline-item">
                    <div class="aui-timeline-item-header clearfix">
                        <div class="aui-timeline-item-dot"></div>
                        <div class="aui-timeline-item-title">${data[i].opertime}</div>
                        <i class="aui-timeline-item-icon aui-icon-drop-down-2"></i>
                    </div>
                    <div class="aui-timeline-item-wrap o-hidden">
                        <ul class="news-list">`;
            for (var j = 0; j < $operlog.length; j++) {
                html += `
                    <li class="news-item">
                        <span class="text-prompt">${$operlog[j].createuser}</span>在
                `;
                // 根据操作编码进行判定用户行为日志
                switch ($operlog[j].opercode) {
                    case '115': // 新建(人员布控)
                        html += `
                            <span class="text-prompt">${$operlog[j].libname}</span>中新建人员
                            <span class="text-prompt">${$operlog[j].name || ''}</span>。
                        `;
                        break;
                    case '232': // 导入
                        html += `
                            <span class="text-prompt">${$operlog[j].libname}</span>中导入图片
                            <span class="text-prompt">${$operlog[j].total}</span> 张, 其中
                        `;
                        $operlog[j].succnum ? html += `成功导入<span class="text-success">${$operlog[j].succnum}</span> 张; ` : '';
                        $operlog[j].errornum ? html += `失败<span class="text-error">${$operlog[j].errornum}</span> 张; ` : '';
                        $operlog[j].mergenum ? html += `合并<span class="text-default">${$operlog[j].mergenum}</span> 张; ` : '';
                        $operlog[j].unsharpnum ? html += `不清晰<span class="text-default">${$operlog[j].unsharpnum}</span> 张。` : '';
                        break;
                    case '4': // 删除人员
                        html += `
                            <span class="text-prompt">${$operlog[j].libname}</span>中删除了
                            <span class="text-prompt">${$operlog[j].name}</span>。
                        `;
                        break;
                    case '233': // 新建库
                        html += `
                            <span class="text-prompt">${$operlog[j].modulename}</span>中新建了
                            <span class="text-prompt">${$operlog[j].libname}</span>。
                        `;
                        break;
                    case '234': // 删除库
                        html += `
                            <span class="text-prompt">${$operlog[j].modulename}</span>中删除了
                            <span class="text-prompt">${$operlog[j].libname}</span>。
                        `;
                        break;
                }
                html += `</li>`
            }
            html += `
                </ul>
                </div>
                </li>
            `;
        }
        $container.empty().html(html);
    }

    /**
     * 加载我的模块 我的历史
     * @param {*} $container 
     */
    function loadMyHistoryContainer($container) {
        // 加载过度动画
        if ($('#myHistoryList').children().length == 0) {
            loadEmpty($('#myHistoryList'));
        }
        showLoading($('#myHistoryList'));
        var port = 'mine/myHistory',
            option = {
                page: 1,
                number: 28
            },
            successFunc = function (data) {
                // 数据返回成功
                if (data.code == '000') {
                    var _result = data.result;
                    if (_result && _result.length > 0) {
                        // 加载我的人员库日志信息节点
                        createMyHistoryDom(_result, $container);
                        removeEmpty($('#myHistoryList').find('.flex-column-wrap.empty-wrap'));
                    } else {
                        loadEmpty($container, '暂无数据', '近七天暂无操作记录');
                    }
                } else {
                    loadEmpty($container, '暂无数据', data.msg);
                }
                // 关闭过度动画
                hideLoading($('#myHistoryList'));
            };
        loadData(port, true, option, successFunc);
    }

    /**
     * 拼接我的历史节点
     * @param {*} data 传入数据
     * @param {*} $container 插入节点
     */
    function createMyHistoryDom(data, $container) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            var $imgs = data[i].imgs;
            html += `
                <li class="aui-timeline-item">
                    <div class="aui-timeline-item-header clearfix">
                        <div class="aui-timeline-item-dot"></div>
                        <div class="aui-timeline-item-title">${data[i].opertime}</div>
                        <i class="aui-timeline-item-icon aui-icon-drop-down-2"></i>
                    </div>
                    <div class="aui-timeline-item-wrap o-hidden">
                        <ul class="timeline-image-list clearfix">`;
            for (var j = 0; j < $imgs.length; j++) {
                html += `
                    <li class="image-card-item">
                        <div class="image-card-wrap image-card-wrap2">
                            <div class="image-card-box image-box-flex img-right-event">
                                <img class="image-card-img img" src="${$imgs[j].url}"alt="">
                            </div>
                        </div>
                        <p class="image-card-text">${$imgs[j].time}</p>
                    </li>
                `;
            }
            if (data[i].total > 28) {
                html += `
                            </ul>
                            <div class="pagination-wrap text-normal" id="myHistoryPagination${i}"></div>
                        </div>
                    </li>
                `;
            } else {
                html += `
                            </ul>
                        </div>
                    </li>
                `;
            }
        }
        $container.empty().html(html);
        $container.find('.pagination-wrap').each(function (idx, item) {
            var pageSizeOpt = [{
                value: 28,
                text: '28/页',
                selected: true
            }, {
                value: 42,
                text: '42/页',
            }, {
                value: 56,
                text: '56/页',
            }];
            var eventCallBack = function (currPage, pageSize) {
                showLoading($container);
                var port = 'mine/myHistory',
                    option = {
                        page: currPage,
                        number: pageSize,
                        date: $pagination.closest('.aui-timeline-item').find('.aui-timeline-item-title').text(),
                    },
                    successFunc = function (data) {
                        // 关闭过度动画
                        hideLoading($container);
                        // 数据返回成功
                        if (data.code == '000') {
                            var _result = data.result[0].imgs;
                            var liHtml = '';
                            if (_result) {
                                // 加载我的人员库日志信息节点
                                for (var n = 0; n < _result.length; n++) {
                                    liHtml += `
                                        <li class="image-card-item">
                                            <div class="image-card-wrap image-card-wrap2">
                                                <div class="image-card-box image-box-flex img-right-event">
                                                    <img class="image-card-img img" src="${_result[n].url}"alt="">
                                                </div>
                                            </div>
                                            <p class="image-card-text">${_result[n].time}</p>
                                        </li>
                                    `;
                                }
                                $pagination.siblings('.timeline-image-list').html(liHtml);
                            }
                        }
                    };
                loadData(port, true, option, successFunc);
            };
            var $pagination = $(item);
            var index = $pagination.closest('.aui-timeline-item').index();
            setPageParams($pagination, data[index].total, data[index].totalPage, eventCallBack, true, pageSizeOpt);
        })
    }

    // 左侧菜单点击切换内容
    $('#mySidebarNavigation').on('click', '.subnav-item', function () {
        var $index = $(this).index(),
            $id = $(this).attr('id'),
            $_id = $('#mySidebarNavigation').find('.subnav-item.active').attr('id');
        // 如果点击的是当前列表，不执行任何操作
        // if ($id == $_id) {
        //     return;
        // }
        $(this).addClass('active').siblings('.subnav-item').removeClass('active');
        $('#myContentContainer .aui-card-item').addClass('display-none').eq($index).removeClass('display-none');
        switch ($id) {
            case 'myControlNav': // 我的布控
                // refreshControlPageList();
                refreshControlList($('#myControlTabContent .tab-pane.active').find('.card-info-list2').eq(0), true);
                _myControlData.viewTypes = [3];
                refreshControlList($('#myControlTabContent .tab-pane.active').find('.card-info-list2').eq(1));
                break;
            case 'myPortraitNav': // 我的人员库
                loadMyPortraitContainer($('#myPortraitOperateList'));
                break;
            case 'myHistoryNav': // 我的历史
                loadMyHistoryContainer($('#myHistoryList'));
                break;
            case 'myApproveNav': // 我的审批
                $("#pageSidebarMenu").find(".aui-icon-customers2").parent().find(".redNum").addClass("hide").html(0);
                $("#myApproveNav").find(".myApproveNum").addClass("hide").html(0);
                $("#myApproveContainer .btn-group").find('.btn-primary').click();
                getMyApplyTypeId()
                break;
            case 'myApplyNav': // 我的申请
                loadPage($('#myApplyContainer'), './facePlatform/myApply.html');
                $("#myApplyNav").find(".myApproveNum").addClass("hide").html(0);
                break;
        }
    })

    // 我的历史模块、我的人员库模块时间轴点击事件
    $('#myContentContainer').on('click', '.aui-timeline-toggle .aui-timeline-item-header', function () {
        $(this).parent().toggleClass('aui-timeline-item-hide');
        $(this).next().slideToggle();
    });


    // 我的审批---begin-----

    /**
     * 公共函数 深拷贝函数
     */
    function deepCopyMy(obj) {
        var result = Array.isArray(obj) ? [] : {};
        if (obj && typeof obj === 'object') {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (obj[key] && typeof obj[key] === 'object') {
                        result[key] = deepCopyMy(obj[key]);
                    } else {
                        result[key] = obj[key];
                    }
                }
            }
        }
        return result;
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
                        html += `<li class="tag" value=${applicationTypeData[i].id}>${applicationTypeData[i].name}</li>`
                    }
                    $('#myApproveContainer').find('.filter-box .tag-list').eq(1).html(html);
                }
            } else {
                warningTip.say(data.message);
            }
        };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };

    /** 权限审批
     * @param {*} $table // table目标容器
     * @param {*} $pagination  // 分页目标容器
     * @param {*} myApproveType  // tab切换 2-待我审批页面 3-我已审批页面
     */
    function refreshSearchApproveList($table, $pagination, myApproveType, first) {
        var $tbody = $table.find('tbody');
        // 初始化
        if (first) {
            $table.removeClass('hide');
            $pagination.removeClass('hide');
            $pagination.html(''); // 清空分页
        }
        showLoading($table);
        searchApproveData.viewType = myApproveType;

        var portData = deepCopyMy(searchApproveData);

        if (portData.viewType == 2) { //待审批没有任务状态
            portData.autoStatus = '';
        } else {
            portData.autoStatus = searchApproveData.autoStatus;
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
                    if (myApproveType == 2) {
                        $("#myApproveTabHeader .control-total").eq(0).text(data.data.total);
                    } else {
                        $("#myApproveTabHeader .control-total").eq(1).text(data.data.total);
                    }
                    if (result && result.length > 0) {
                        var tableHtml = '';
                        for (var i = 0; i < result.length; i++) {
                            tableHtml += `<tr class="table-row" data-index="${i}" taskId="${result[i].incidentId}">
                                            <td></td>
                                            <td title="${result[i].incident || '--'}">${result[i].incident || '--'}</td>
                                            <td title="${result[i].labh || '--'}">${result[i].labh || '--'}</td>
                                            <td title="${result[i].createTime || '--'}">${result[i].createTime || '--'}</td>
                                            <td title="${result[i].comments || '--'}">${result[i].comments || '--'}</td>
                                            <td title="${(result[i].userName || '未知') + (result[i].orgName ? ('(' + result[i].orgName + ')') : '')}">${(result[i].userName || '未知') + (result[i].orgName ? ('(' + result[i].orgName + ')') : '')}</td>
                                            <td title="${result[i].userId || '--'}">${result[i].userId || '--'}</td>
                                            <td>${result[i].autoStatus === '0' && `<div class="status-item text-prompt"><i class="status-icon status-icon-online"></i><span class="status-text">审批中</span></div>`
                                || result[i].autoStatus === '1' && `<div class="status-item text-active"><i class="status-icon status-icon-success"></i><span class="status-text">已通过</span></div>`
                                || result[i].autoStatus === '2' && `<div class="status-item text-danger"><i class="status-icon status-icon-error"></i><span class="status-text">已驳回</span></div>` || '--'}
                                            </td>
                                            <td class="operation">
                                                <span class="text-link text-detail" title="详情">详情</span>
                                                <span class="text-link text-agree ${myApproveType === 3 ? 'hide' : ''}" title="同意">同意</span>
                                                <span class="text-link text-reject ${myApproveType === 3 ? 'hide' : ''}" title="驳回">驳回</span>
                                                <!--<i class="icon aui-icon-file aui-mr-sm" title="查看详情"></i>
                                                <i class="icon aui-icon-approval aui-mr-sm  ${myApproveType === 3 ? 'hide' : ''}" title="同意"></i>
                                                <i class="icon aui-icon-not-through aui-mr-sm  ${myApproveType === 3 ? 'hide' : ''}" title="驳回"></i>-->
                                            </td>
                                        </tr>`
                        }
                        // 给列表新增行数据
                        $tbody.empty().html(tableHtml);
                        if (myApproveType === 3) {
                            //$table.find('.operation').remove();
                        }
                        $tbody.find("tr").each(function (index, el) {
                            $(el).data('listData', result[index]);
                        });
                        if (data.data.total > Number(searchApproveData.size) && first) {
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
                                searchApproveData.page = currPage;
                                searchApproveData.size = pageSize;
                                refreshSearchApproveList($table, '', myApproveType, false)
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
        loadData(port, true, portData, successFunc);
    }

    /** 布控审批
     * @param {*} $table // table目标容器
     * @param {*} $pagination  // 分页目标容器
     * @param {*} myApproveType  // tab切换 2-待我审批页面 3-我已审批页面
     */
    function refreshControlApproveList($table, $pagination, myApproveType, first) {
        // 初始化
        var $tbody = $table.find('tbody');
        if (first) {
            $table.removeClass('hide');
            $pagination.removeClass('hide');
            $pagination.html(''); // 清空分页
        }
        showLoading($table);
        controlApproveData.myApprove = myApproveType;

        var portData = deepCopyMy(controlApproveData);

        if (controlApproveData.myApprove == 2) { //待审批没有任务状态
            portData.autoStatus = '';
        } else {
            portData.autoStatus = controlApproveData.autoStatus;
        }
        var port = 'v3/distributeManager/distributeTaskList',
            successFunc = function (data) {
                hideLoading($table);
                $tbody.empty();
                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });
                    if (myApproveType == 2) {
                        $("#myApproveTabHeader .control-total").eq(0).text(data.data.total);
                    } else {
                        $("#myApproveTabHeader .control-total").eq(1).text(data.data.total);
                    }
                    if (result && result.length > 0) {
                        var tableHtml = '';
                        for (var i = 0; i < result.length; i++) {
                            tableHtml += `<tr class="table-row" data-index="${i}" taskId="${result[i].id}">
                                            <td><a class="detail-icon" href="#"> <i class="fa fa-plus"></i></a></td>
                                            <td title="${result[i].name || '--'}">${result[i].name || '--'}</td>
                                            <td title="${result[i].creator + '(' + result[i].orgName + ')' || '--'}">${result[i].creator + '(' + result[i].orgName + ')' || '--'}</td>
                                            <td title="${result[i].creatorId || '--'}">${result[i].creatorId || '--'}</td>
                                            <td>${result[i].imgList && result[i].imgList.length > 0 ? '布控' + (result[i].imgList ? result[i].imgList.length : '0') + '个人'
                                    : '布控' + (result[i].libId ? '1' : '0') + '个库'}</td>
                                            <td title="${result[i].createTime || '--'}">${result[i].createTime || '--'}</td>
                                            <td>${result[i].autoStatus === '0' && `<div class="status-item text-prompt"><i class="status-icon status-icon-online"></i><span class="status-text">审批中</span></div>`
                                || result[i].autoStatus === '1' && `<div class="status-item text-active"><i class="status-icon status-icon-success"></i><span class="status-text">已通过</span></div>`
                                || result[i].autoStatus === '2' && `<div class="status-item text-danger"><i class="status-icon status-icon-error"></i><span class="status-text">已驳回</span></div>` || '--'}
                                            </td>
                                            <td class="operation">
                                                <span class="text-link text-agree" title="同意">同意</span>
                                                <span class="text-link text-reject" title="驳回">驳回</span>
                                            </td>
                                        </tr>`
                        }
                        // 给列表新增行数据
                        $tbody.empty().html(tableHtml);
                        if (myApproveType === 3) {
                            $table.find('.operation').remove();
                        }
                        $tbody.find("tr").each(function (index, el) {
                            $(el).data('listData', result[index]);
                        });
                        if (data.data.total > Number(controlApproveData.size) && first) {
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
                                controlApproveData.page = currPage;
                                controlApproveData.size = pageSize;
                                refreshControlApproveList($table, '', myApproveType, false)
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
        loadData(port, true, portData, successFunc);
    }

    /** 权限审批详情
     * @param {*} $table // table目标容器
     * @param {*} $pagination  // 分页目标容器
     * @param {*} myApproveType  // 行数据
     */
    function refreshSearchTempDetail($rowList, $container, targetData) {
        $rowList.closest("tbody").find('.detail-view').remove();
        $container.siblings().find(".fa-minus").removeClass("fa-minus").addClass("fa-plus");
        $rowList.find(".fa").toggleClass("fa-minus").toggleClass("fa-plus");
        var tableId = $container.closest('.tab-pane').attr('id');
        var result = targetData.applications;
        if (result) {
            var _html = '',
                htmlDetail = '';
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
                htmlDetail += `<div class="aui-col-24 form-label-fixed">
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
                        <td colspan="8">
                            <div class="approveDetails">${htmlDetail}</div>
                        </td>
                    </tr>`;
            if ($rowList.find(".fa").hasClass('fa-minus')) {
                $container.after(_html);
            }
            if (tableId == 'myApproveEnd') {
                $('#' + tableId).find('[colspan="8"]').attr('colspan', '8');
            }
        }
    }

    /** 布控审批详情
     * @param {*} $rowList // table目标容器
     * @param {*} $container  // 分页目标容器
     * @param {*} targetData  // 行数据
     */
    function refreshControlTempDetail($rowList, $container, targetData) {
        $rowList.closest("tbody").find('.detail-view').remove();
        $container.siblings().find(".fa-minus").removeClass("fa-minus").addClass("fa-plus");
        $rowList.find(".fa").toggleClass("fa-minus").toggleClass("fa-plus");
        var tableId = $container.closest('.tab-pane').attr('id');
        var result = targetData;
        if (result) {
            var _html = '',
                tempStringObject = {},
                controlGrade = ["紧急", "重要", "一般"];
            tempStringObject = setArrayToStringObject(result);

            _html = `<tr class="detail-view">
                        <td colspan="8">
                            <div class="approveDetails">
                                <div class="aui-col-24 form-label-fixed approveDetailsContent">
                                    <ul class="form-info aui-row form-label-fixed mt-0">
										<li class="aui-col-7 form-item-box">
											<div class="form-group">
												<label class="aui-form-label">创建人：</label>
												<div class="form-text" title="${result.creator ? result.creator : '暂无'} ${result.orgName ? '(' + result.orgName + ')' : ''}">
													${result.creator ? result.creator : '暂无'} ${result.orgName ? '(' + result.orgName + ')' : ''}</div>
											</div>
										</li>
										<li class="aui-col-10 form-item-box">
											<div class="form-group">
												<label class="aui-form-label">布控期限：</label>
												<div class="form-text">${(result.startTime ? result.startTime : '暂无') + " 至 " + (result.endTime ? result.endTime : '暂无')}</div>
											</div>
										</li>
										<li class="aui-col-7 form-item-box">
											<div class="form-group">
												<label class="aui-form-label">创建时间：</label>
												<div class="form-text">${result.createTime ? result.createTime : '暂无'}</div>
											</div>
										</li>
										<li class="aui-col-7 form-item-box">
											<div class="form-group">
												<label class="aui-form-label">库标签：</label>
												<div class="form-text" title="${result.libName ? result.libName : '暂无'}${result.labelName ? ('-' + result.labelName) : ''}">${result.libName ? result.libName : '暂无'}${result.labelName ? ('-' + result.labelName) : ''}</div>
											</div>
										</li>
										<li class="aui-col-10 form-item-box">
											<div class="form-group">
												<label class="aui-form-label">布控原因：</label>
												<div class="form-text" title="${result.reason.replace(/</g, '&lt;').replace(/>/g, '&gt;') ? result.reason.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '暂无'}">${result.reason.replace(/</g, '&lt;').replace(/>/g, '&gt;') ? result.reason.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '暂无'}</div>
											</div>
										</li>
										<li class="aui-col-7 form-item-box">
											<div class="form-group">
												<label class="aui-form-label">阈值：</label>
												<div class="form-text">${result.threshold ? result.threshold : '0' + '%'}</div>
											</div>
										</li>
										<li class="aui-col-7 form-item-box">
											<div class="form-group">
												<label class="aui-form-label">警情编号：</label>
												<div class="form-text">${result.jqbh ? result.jqbh.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '暂无'}</div>
											</div>
										</li>
										<li class="aui-col-10 form-item-box">
											<div class="form-group">
												<label class="aui-form-label">公开范围：</label>
												<div class="form-text" title="${tempStringObject.viewString !== '暂无' ? tempStringObject.viewString : tempStringObject.viewUserString}">${tempStringObject.viewString !== '暂无' ? tempStringObject.viewString : tempStringObject.viewUserString}</div>
											</div>
										</li>
										<li class="aui-col-7 form-item-box">
											<div class="form-group">
												<label class="aui-form-label">相关文书：</label>
												<div class="form-text">
													<a class="text-prompt docUrl" url="${result.docUrl ? result.docUrl : ''}">${result.docUrl ? '文书下载' : '暂无'}</a>
												</div>
											</div>
                                        </li>
                                        <li class="aui-col-9 form-item-box ${tempStringObject.libString && tempStringObject.libString !== '暂无' ? '' : 'display-none'}">
                                            <div class="form-group">
                                                <label class="aui-form-label">布控对象：</label>
                                                <div class="form-text" title="${tempStringObject.libString}">${tempStringObject.libString}</div>
                                            </div>
                                        </li>
                                        <li class="aui-col-9 form-item-box ${result.imgList && result.imgList.length > 0 ? '' : 'display-none'}">
                                            <div class="form-group">
                                                <label class="aui-form-label">布控对象:</label>
                                                <div class="form-text">
                                                    <ul class="add-image-wrap add-type-3 face-card usearchImgBk">
                                                    </ul>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </td>
                    </tr>`;
            if ($rowList.find(".fa").hasClass('fa-minus')) {
                $container.after(_html);
            }
            if (tableId == 'myApproveEnd') {
                $('#' + tableId).find('[colspan="8"]').attr('colspan', '8');
            }
            // // 审批状态
            // if (result.taskApproveList && result.taskApproveList.length > 0) {
            //     var $timeline = $container.next().find('.approveDetailsState .aui-timeline'),
            //         appLength = result.taskApproveList.length - 1; //taskApproveList 顺序是倒序
            //     result.taskApproveList.forEach(function (item, index) {
            //         var $liHtml = $([`<div class="aui-timeline-item">
            //                         <div class="aui-timeline-item-header clearfix">
            //                             <div class="aui-timeline-item-dot"></div>
            //                             <div class="aui-timeline-item-title">${result.taskApproveList[0].status === 0 && `<span class="status-text text-prompt">进行中</span>`
            //             || result.taskApproveList[0].status === 1 && `<span class="status-text text-active">已通过</span>`
            //             || result.taskApproveList[0].status === 2 && `<span class="status-text text-danger">已驳回</span>` || '--'}</div>
            //                             <div class="aui-timeline-item-name">
            //                                 <ul class="approverName-text"></ul>
            //                                 <div class="item-time">${result.taskApproveList[0].approvalTime ? ('审批时间：' + result.taskApproveList[0].approvalTime) : ''}</div>
            //                                 <div class="item-reason">${result.taskApproveList[0].approvalReason ? ('驳回原因：' + result.taskApproveList[0].approvalReason) : ''}</div>
            //                             </div>
            //                         </div>
            //                         <div class="aui-timeline-item-wrap">
            //                         </div>
            //                     </div>`].join(''));
            //         var nameLi = '';
            //         result.taskApproveList[0].approverName.split(',').forEach(function (el) {
            //             nameLi += `<li><label class="aui-form-label">审批人：${el}</label></li>`;
            //         })
            //         $liHtml.find('.approverName-text').append(nameLi);
            //         $timeline.append($liHtml);
            //     });
            //     // 去掉最下面的时间轴线
            //     $timeline.children('.aui-timeline-item:last-child').find('.aui-timeline-item-wrap').remove();
            // }

            //布控人图片
            if (result.imgList && result.imgList.length > 0) {
                result.imgList.forEach(function (item, index) {
                    var option = {
                        'peopleId': item.peopleId,
                        'libId': item.libId,
                        // 'ajaxFilter': 'getPeopleInfo' + index,
                    };
                    loadData('v2/memberInfos/getPeopleInfo', true, option, function (data) {
                        if (data.code === '200') {
                            var result = data.data;
                            var liHtml = `<li class="add-image-item">
                                    <img class="add-image-img table-img" alt="" src="${result.imageUrl ? result.imageUrl : './assets/images/control/person.png'}">
                                </li>`;
                            $container.next().find('.usearchImgBk').append(liHtml);
                            $container.next().find('.usearchImgBk').find('.add-image-item.default').addClass('hide');
                        }
                    })
                });
            }
        }
    }

    //鼠标移入显示气泡
    function showBubble($this, result) {
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

    //布控详情 相关文书点击事件
    $('#myApproveTabContent').on('click', '.approveDetails .docUrl', function () {
        if ($(this).text() !== '暂无') {
            var url = $(this).attr("url");
            var post_url = serviceUrl + '/v2/file/downloadByHttpUrl?url=' + url;
            if ($("#IframeReportImg").length === 0) {
                $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
            }
            $('#IframeReportImg').attr("src", post_url);
        }
    })

    // 根据tab切换查询不同类型审批
    $("#myApproveContainer .btn-group").on("click", ".btn", function () {
        var $this = $(this),
            typeIndex = $this.index();
        approveType = typeIndex + 1;
        $("#myApproveContainer .btn.btn-primary").removeClass("btn-primary");
        $this.addClass("btn-primary");
        $('#myApproveRun').find('[id^="myApprove"]').addClass('hide');
        $('#myApproveEnd').find('[id^="myApprove"]').addClass('hide');

        if (approveType == 1) { //权限申请
            $('#myApproveContainer .filter-box').find('.filter-item').eq(1).removeClass('hide');
            $('#myApproveContainer .filter-box').find('.filter-item').eq(1).addClass('mt-0');
            //权限申请没有机构选择
            $('#myApproveContainer .filter-box').find('.filter-item').eq(2).addClass('hide');
            $('#myApproveContainer .filter-box').find('.filter-item').eq(2).removeClass('mt-0');

            if (!$("#myApproveContainer .filter-box").find('.filter-item').eq(1).find(".filter-content-label .tag").hasClass("tag-prompt")) { //不是全选
                $("#myApproveContainer .operate").find(".tag-list li.tag").eq(1).removeClass("hide");
            }

            if (!$("#myApproveContainer .filter-box").find('.filter-item').eq(2).find(".filter-content-label .tag").hasClass("tag-prompt")) { //不是全选
                $("#myApproveContainer .operate").find(".tag-list li.tag").eq(2).addClass("hide");
            }

            searchApproveData.page = '1';
            refreshSearchApproveList($('#myApproveRunTable_0'), $('#myApproveRunPage_0'), 2, true); // 待审批
            refreshSearchApproveList($('#myApproveEndTable_0'), $('#myApproveEndPage_0'), 3, true); // 已审批
        } else if (approveType == 2) { //布控
            $('#myApproveContainer .filter-box').find('.filter-item').eq(1).addClass('hide');
            $('#myApproveContainer .filter-box').find('.filter-item').eq(1).removeClass('mt-0');
            //权限申请没有机构选择
            $('#myApproveContainer .filter-box').find('.filter-item').eq(2).removeClass('hide');
            $('#myApproveContainer .filter-box').find('.filter-item').eq(2).addClass('mt-0');

            if (!$("#myApproveContainer .filter-box").find('.filter-item').eq(1).find(".filter-content-label .tag").hasClass("tag-prompt")) { //不是全选
                $("#myApproveContainer .operate").find(".tag-list li.tag").eq(1).addClass("hide");
            }

            if (!$("#myApproveContainer .filter-box").find('.filter-item').eq(2).find(".filter-content-label .tag").hasClass("tag-prompt")) { //不是全选
                $("#myApproveContainer .operate").find(".tag-list li.tag").eq(2).removeClass("hide");
            }

            controlApproveData.page = '1';
            refreshControlApproveList($('#myApproveRunTable_1'), $('#myApproveRunPage_1'), 2, true); // 待审批
            refreshControlApproveList($('#myApproveEndTable_1'), $('#myApproveEndPage_1'), 3, true); // 已审批
        }
    });

    // 切换不同审批状态
    $("#myApproveTabHeader").on("click", ".nav-item", function () {
        $('#myApproveRun').find('[id^="myApprove"]').addClass('hide');
        $('#myApproveEnd').find('[id^="myApprove"]').addClass('hide');
        var approveType = $("#myApproveContainer .btn.btn-primary").index();
        if (approveType == 0) {
            if ($(this).index() == 0) {
                refreshSearchApproveList($('#myApproveRunTable_0'), $('#myApproveRunPage_0'), 2, true); // 待审批
            } else { // 我已审批
                refreshSearchApproveList($('#myApproveEndTable_0'), $('#myApproveEndPage_0'), 3, true); // 已审批
            }
        } else {
            if ($(this).index() == 0) {
                refreshControlApproveList($('#myApproveRunTable_1'), $('#myApproveRunPage_1'), 2, true); // 待审批
            } else { // 我已审批
                refreshControlApproveList($('#myApproveEndTable_1'), $('#myApproveEndPage_1'), 3, true); // 已审批
            }
        }
    });

    // 权限/布控审批 详情事件
    $("#myApproveTabContent").on("click", ".detail-icon", function () { // 表格列表点击收缩按钮展开详情内容
        var $this = $(this),
            $targetRow = $this.closest('.table-row'),
            targetData = $targetRow.data().listData,
            approveType = $("#myApproveContainer .btn-group").find('.btn-primary').index() + 1;
        if (approveType == 1) {
            refreshSearchTempDetail($this, $targetRow, targetData);
        } else if (approveType == 2) {
            refreshControlTempDetail($this, $targetRow, targetData);
        }
    }).on("click", ".text-agree", function () { // 表格同意事件
        var $this = $(this),
            $targetRow = $this.closest('.table-row'),
            targetData = $targetRow.data().listData;
        if (targetData.id) {
            var targetId = targetData.id,
                serviceData = {
                    taskId: targetId,
                    model: 1
                };
        } else {
            var targetId = targetData.incidentId,
                serviceData = {
                    taskId: targetId,
                    model: 2,
                    applicationType: targetData.applicationType //权限要加申请类型
                };
        }

        var port = 'v3/approveManager/needNextApprove',
            successFunc = function (data) {
                if (data.code === '200') {
                    //有二级审批要获取二级审批人列表
                    if (data.needNextApprove) {
                        $("#approveTipModal .reasonApprove").removeClass("hide");
                        getPersonList($("#approvalReason_approve"), serviceData.model, serviceData.applicationType ? serviceData.applicationType : '', null, false, { secondApprover: 1 });
                    } else { //没有二级审批
                        $("#approveTipModal .reasonApprove").addClass("hide");
                    }
                    $('#approveTipModal').data({
                        'taskId': targetId,
                        'isPassApprove': 'Y'
                    });
                    $('#approveTipModal').find('.modal-title').text('确认同意');
                    $('#approveTipModal').find('.modal-body .reasonVal .aui-form-label').removeClass('hide').text('审批意见：').removeClass("aui-form-require");
                    $('#approveTipModal').find('.modal-body .reasonVal textarea').attr("placeholder", "请输入审批意见");
                    $('#approveTipModal').find('.modal-body .form-group .text-danger.tip').addClass("hide");
                    $("#approvalReason_val").val("");
                    $('#approveTipModal').modal('show');
                } else {
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, serviceData, successFunc);
    }).on("click", ".text-reject", function () { // 表格驳回
        var $this = $(this),
            $targetRow = $this.closest('.table-row'),
            targetData = $targetRow.data().listData;
        if (targetData.id) {
            var targetId = targetData.id;
        } else {
            var targetId = targetData.incidentId;
        }
        $('#approveTipModal').data({
            'taskId': targetId,
            'isPassApprove': 'N'
        });
        $('#approveTipModal').find('.modal-title').text('确认驳回');
        $('#approveTipModal').find('.modal-body .reasonVal .aui-form-label').removeClass('hide').text('驳回原因：').addClass("aui-form-require");
        $('#approveTipModal').find('.modal-body .reasonVal textarea').attr("placeholder", "请输入驳回原因");
        $("#approveTipModal .reasonApprove").addClass("hide");
        $('#approveTipModal').find('.modal-body .form-group .text-danger.tip').addClass("hide");
        // $('#approveTipModal').find('.modal-body .form-group').removeClass('hide');
        // $('#approveTipModal').find('.modal-body .text-lg').addClass('hide');
        $("#approvalReason_val").val("");
        $('#approveTipModal').modal('show');
    }).on("click", ".text-detail,.applyuse tbody .table-row td:not('.operation')", function () { // 查看详情
        var $this = $(this),
            $targetRow = $this.closest('.table-row'),
            targetData = $targetRow.data().listData,
            url = "./facePlatform/incident-dialog.html";
        $('.incident-new-popup').data({
            incidentDetail: targetData,
            showDynamicDetail: true
        });
        loadPage($('.incident-new-popup'), url);
        $('.incident-new-popup').removeClass('hide');
    });

    // 检索申请鼠标移入事件
    $("#myApproveRunTable_0, #myApproveEndTable_0").on("mouseover", ".status-item", function (event) { //鼠标移入显示审批详情气泡事件
        event.stopPropagation();
        event.preventDefault();
        var $this = $(this),
            $targetRow = $this.closest('.table-row'),
            targetData = $targetRow.data('listData');
        $('.mouseOverDetail').remove();
        var getUrlSuccessFunc = function (data) {
            if (data.code === '200') {
                if (data.data) {
                    showBubble($this, data.data.taskApproveList);
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

    // 布控申请鼠标移入事件
    $("#myApproveRunTable_1, #myApproveEndTable_1").on("mouseover", ".status-item", function (event) { //鼠标移入审批详情显示气泡事件
        event.stopPropagation();
        event.preventDefault();
        var $this = $(this),
            $targetRow = $this.closest('.table-row'),
            targetData = $targetRow.data().listData;
        showBubble($this, targetData.taskApproveList);
        $this.off("mouseout").on("mouseout", function (event) { // 布控详情 单击事件入口
            event.stopPropagation();
            event.preventDefault();
            $('.mouseOverDetail').remove();
        });
    })

    showMiddleImg($('#myApproveTabContent'), $('#myApproveTabContent'), '.table-img'); //hover 显示中图

    // 权限/布控审批 确定事件
    $('#approveDeleOk').on("click", function () {
        var taskId = $('#approveTipModal').data('taskId'),
            isPassApprove = $('#approveTipModal').data('isPassApprove'),
            approvalReason = $.trim($('#approvalReason_val').val()),
            approveType = $("#myApproveContainer .btn-group").find('.btn-primary').index() + 1;
        if (approveType == 1) {
            var model = 2;
        } else if (approveType == 2) {
            var model = 1;
        }
        var serverFlag = true;
        if (isPassApprove == 'N' && approvalReason == '') {
            $('#approveTipModal').find('.text-danger').removeClass('hide');
            serverFlag = false;
        } else if (isPassApprove == 'N' && approvalReason.length < 10) {
            warningTip.say("最少输入10个字");
            serverFlag = false;
        } else if (isPassApprove == 'Y' && !$("#approveTipModal .reasonApprove").hasClass("hide") && !$("#approvalReason_approve").val()) {
            $('#approvalReason_approve').closest('.form-group').find('.text-danger.tip').removeClass('hide');
            serverFlag = false;
        } else {
            $('#approveTipModal').find('.text-danger').addClass('hide');
        }

        if (serverFlag) {
            var port = 'v3/approveManager/approveTask',
                serviceData = {
                    taskId: taskId,
                    model: model,
                    isPassApprove: isPassApprove,
                    approvalReason: approvalReason,
                    nextApprover: $("#approveTipModal .reasonApprove").hasClass("hide") ? '' : $("#approvalReason_approve").val()
                },
                successFunc = function (data) {
                    if (data.code === '200') {
                        warningTip.say('成功');
                        $('#approveTipModal').modal('hide');
                    } else {
                        warningTip.say(data.message);
                    }
                    if (approveType == 1) {
                        refreshSearchApproveList($('#myApproveRunTable_0'), $('#myApproveRunPage_0'), 2, true); // 待审批
                        refreshSearchApproveList($('#myApproveEndTable_0'), $('#myApproveEndPage_0'), 3, true); // 已审批
                    } else if (approveType == 2) {
                        refreshControlApproveList($('#myApproveRunTable_1'), $('#myApproveRunPage_1'), 2, true); // 待审批
                        refreshControlApproveList($('#myApproveEndTable_1'), $('#myApproveEndPage_1'), 3, true); // 已审批
                    }
                };
            loadData(port, true, serviceData, successFunc);

        }
    })

    /**
     * 管理者登陆 搜索布控更多过滤条件的选择，并将相应数据传递给后台需要的参数
     * @param {object} $itemDom  搜索过滤条件的目标节点
     * @param {number} index  搜索过滤条件类别的index；
     * 						  0 为布控类型过滤；1 为布控时间过滤； 2 为布控任务等级过滤; 3 为创建机构过滤；
     * 					      4 为布控区域过滤；5 为布控库过滤
     */
    function setSearchMoreCondition(index, text) {
        switch (index) {
            case 0: //布控任务状态，暂缺后台接口
                switch (text) {
                    case "全部":
                        controlApproveData.autoStatus = '';
                        searchApproveData.autoStatus = '';
                        break;
                    case "审批中":
                        controlApproveData.autoStatus = '0'; //待开始
                        searchApproveData.autoStatus = '0';
                        break;
                    case "已通过":
                        controlApproveData.autoStatus = '1'; //进行中
                        searchApproveData.autoStatus = '1';
                        break;
                    case "已驳回":
                        controlApproveData.autoStatus = '2'; //已结束
                        searchApproveData.autoStatus = '2';
                        break;
                }
                break;
            case 1: //布控类型，暂缺后台接口
                switch (text) {
                    case "全部":
                        searchApproveData.applicationType = '';
                        break;
                    case "日常工作":
                        searchApproveData.applicationType = "1";
                        break;
                    case "警情":
                        searchApproveData.applicationType = "2";
                        break;
                    case "已立案":
                        searchApproveData.applicationType = "3";
                        break;
                    case "专项工作":
                        searchApproveData.applicationType = "4";
                        break;
                    case "敏感人员查询":
                        searchApproveData.applicationType = "5";
                        break;
                    case "协外":
                        searchApproveData.applicationType = "6";
                        break;
                }
                break;
            case 2: // 创建机构
                controlApproveData.orgIds = [];
                switch (text) {
                    case "全部":
                        controlApproveData.orgIds = [];
                        break;
                    default:
                        controlApproveData.orgIds.push(text);
                        break;
                }
                break;
            case 3: //布控时间
                switch (text) {
                    case "全部":
                        controlApproveData.startTime = "";
                        controlApproveData.endTime = "";
                        searchApproveData.startTime = "";
                        searchApproveData.endTime = "";
                        break;
                    case "近一天":
                        controlApproveData.startTime = sureSelectTime(-1).date;
                        controlApproveData.endTime = sureSelectTime(-1).now;
                        searchApproveData.startTime = sureSelectTime(-1).date;
                        searchApproveData.endTime = sureSelectTime(-1).now;
                        break;
                    case "近三天":
                        controlApproveData.startTime = sureSelectTime(-3).date;
                        controlApproveData.endTime = sureSelectTime(-3).now;
                        searchApproveData.startTime = sureSelectTime(-3).date;
                        searchApproveData.endTime = sureSelectTime(-3).now;
                        break;
                    case "近七天":
                        controlApproveData.startTime = sureSelectTime(-7).date;
                        controlApproveData.endTime = sureSelectTime(-7).now;
                        searchApproveData.startTime = sureSelectTime(-7).date;
                        searchApproveData.endTime = sureSelectTime(-7).now;
                        break;
                    case "近半个月":
                        controlApproveData.startTime = sureSelectTime(-15).date;
                        controlApproveData.endTime = sureSelectTime(-15).now;
                        searchApproveData.startTime = sureSelectTime(-15).date;
                        searchApproveData.endTime = sureSelectTime(-15).now;
                        break;
                    default:
                        var timeArrControl = text.split('~');
                        controlApproveData.startTime = timeArrControl[0];
                        controlApproveData.endTime = timeArrControl[1];
                        searchApproveData.startTime = timeArrControl[0];
                        searchApproveData.endTime = timeArrControl[1];
                }
                break;
        }
    }

    // 根据布控关键词来查询我的审核列表 搜索按钮点击事件 键盘回车事件
    $("#approveSearchBox").on("click", ".aui-input-suffix", function () {
        //点击搜索按钮查询关键词
        controlApproveData.keywords = $("#approveKeyWordInput").val();
        searchApproveData.userName = $("#approveKeyWordInput").val();
        // var $currentContainer = $('#myApproveTabContent .card-info-list.active');
        // $currentContainer.data('isRefreshData', true).siblings().data('isRefreshData', true);
        // approveTabParams($currentContainer);
        $("#myApproveContainer .btn-group").find('.btn-primary').click();
    }).on("keydown", ".aui-input", function (e) {
        //按键盘回车事件开始搜索
        var code = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
        if (code == 13) {
            controlApproveData.keywords = $("#approveKeyWordInput").val();
            searchApproveData.userName = $("#approveKeyWordInput").val();
            // var $currentContainer = $('#myApproveTabContent .card-info-list.active');
            // $currentContainer.data('isRefreshData', true).siblings().data('isRefreshData', true);
            // approveTabParams($currentContainer);
            $("#myApproveContainer .btn-group").find('.btn-primary').click();
        }
    });

    //初始化
    function initApprovePage() {
        loadMyInfo();

        //获取我的申请个数
        if (!$("#pageSidebarMenu").find(".aui-icon-customers2").parent().find(".redNum").hasClass("hide")) {
            $("#myApproveNav").find(".myApproveNum").removeClass("hide");
            $("#myApproveNav").find(".myApproveNum").html($("#pageSidebarMenu").find(".aui-icon-customers2").parent().find(".redNum").html());
        } else {
            $("#myApproveNav").find(".myApproveNum").addClass("hide");
        }
        $("#myApplyNav").find(".myApproveNum").addClass("hide");
        //获取我的紧急勤务是否有没补办的事件
        getCriticalListNum();
        // 我的审核更换过滤条件
        filterDrop($('#myApproveContainer'), function (data, index) {
            setSearchMoreCondition(index, data[index].text); // 过滤条件参数赋值
            // var $currentContainer = $('#myApproveContainer .tab-pane.active');
            // $currentContainer.data('isRefreshData', true).siblings().data('isRefreshData', true);
            // approveTabParams($currentContainer); // 我发起的 待我审批 我已审批 tab切换事件
            $("#myApproveContainer .btn-group").find('.btn-primary').click();
        }, false);
    }
    initApprovePage();

    //获取我的紧急勤务是否有没补办的事件
    function getCriticalListNum() {
        var port = 'v3/myApplication/getExigenceList',
            successFunc = function (data) {
                if (data.code === '200') {
                    var result = data.data.list;
                    if (result && result.length > 0) {
                        $("#myApplyNav").find(".myApproveNum").removeClass("hide").html(data.data.total);
                    }
                }
            };
        loadData(port, true, {
            viewType: '1',
            page: '1',
            size: '12',
            status: 0
        }, successFunc);
    }
    // 我的审批---end-----
})(window, window.jQuery)