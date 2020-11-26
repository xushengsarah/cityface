(function (window, $) {
    //检索条件
    var _myApplyData = { //检索
        applicationType: '', // 类型: 1-日常工作 2-警情 3-已立案 4-专项工作 5-特殊人员 6-协外
        userName: '',
        xbUserName: '',
        autoStatus: '', // 任务状态：0-审批中；1-已通过；2-已驳回
        viewType: '4',
        startTime: '',
        endTime: '',
        labh: '',
        page: '1',
        size: '12',
    };

    //紧急警务条件
    var _myCriticalData = {
        type: '', // 类型: 2-警情 3-已立案 4-专项工作 7-其他
        approver: '',
        xbUserName: '',
        viewType: '2',
        startTime: '',
        endTime: '',
        labh: '',
        page: '1',
        size: '12',
    };

    //获取分局
    function getSearchSelect($container, orgId, returnType, orgType) {
        showLoading($container.closest(".aui-col-18"));
        var port = 'v2/org/getOrgInfos',
            data = {
                orgId: orgId ? orgId : '',
                orgType: orgType ? orgType : 1,
                userType: 2,
                returnType: returnType ? returnType : 3,
                random: Math.random()
            };
        var successFunc = function (data) {
            hideLoading($container.closest(".aui-col-18"));
            if (data.code === '200') {
                var result = data.data,
                    arrayBox = {};
                // 对返回数组进行排序 市局排在最上层
                for (var i = 0; i < result.length; i++) {
                    if (result[i].parentId === null) {
                        arrayBox = result[i];
                        result.splice(i, 1);
                        result.splice(0, 0, arrayBox);
                    }
                }
                if (result && result.length) { // 存在返回值
                    var itemHtml = '';
                    if ($container.attr('id') === 'permissionApplyOrg') { // 分局下拉框
                        itemHtml = `<option class="option-item" orgid="${result[0].orgId}" value="${result[0].orgId}" parentid="" selected>${result[0].orgName}</option>`;
                        for (var i = 1; i < result.length; i++) {
                            itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                        }
                    } else if ($container.attr('id') === 'permissionApplyOrgTwo') {
                        itemHtml = `<option class="option-item" orgid="${result[0].orgId}" value="${result[0].orgId}" parentid="" selected>${result[0].orgName}</option>`;
                        for (var i = 1; i < result.length; i++) {
                            itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                        }
                    } else { // 不是分局下拉框
                        itemHtml += `<option class="option-item" orgid="${result[0].orgId}" value="${result[0].orgId}" parentid="${result[0].parentId}" selected>${result[0].orgName}</option>`;
                        for (var i = 1; i < result.length; i++) {
                            itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                        }
                    }
                    $container.empty().append(itemHtml); // 元素赋值

                    if ($container.attr('id') === 'permissionApplyOrg') { // 如果为分局下拉框
                        $container.selectpicker({
                            allowClear: false
                        });

                        $container.on('changed.bs.select', function (e, clickedIndex, isSelected) {
                            if (isSelected) {
                                var $targetOptionItem = $container.find(".option-item").eq(clickedIndex - 1);
                                if ($targetOptionItem.attr('parentid')) { // 如果不是市局
                                    //getSearchPolice($containerPolice, $targetOptionItem.attr('orgid'));
                                    getSearchSelect($("#permissionApplyPolice"), $targetOptionItem.attr('orgid'), 2, 2); //获取分局下拉框
                                } else { // 如果选择市局
                                    $("#permissionApplyPolice").prop('disabled', true).val(null); // 派出所下拉框不可用
                                    $("#permissionApplyPolice").selectpicker('refresh');
                                }
                            }
                        });
                    } else if ($container.attr('id') === 'permissionApplyOrgTwo') { // 如果为分局下拉框
                        $container.selectpicker({
                            allowClear: false
                        });

                        $container.on('changed.bs.select', function (e, clickedIndex, isSelected) {
                            if (isSelected) {
                                var $targetOptionItem = $container.find(".option-item").eq(clickedIndex - 1);
                                if ($targetOptionItem.attr('parentid')) { // 如果不是市局
                                    //getSearchPolice($containerPolice, $targetOptionItem.attr('orgid'));
                                    getSearchSelect($("#permissionApplyPoliceTwo"), $targetOptionItem.attr('orgid'), 2, 2); //获取分局下拉框
                                } else { // 如果选择市局
                                    $("#permissionApplyPoliceTwo").prop('disabled', true).val(null); // 派出所下拉框不可用
                                    $("#permissionApplyPoliceTwo").selectpicker('refresh');
                                }
                            }
                        });
                    } else { // 如果不是分局下拉框
                        $container.prop('disabled', false); // 非不可选
                        $container.selectpicker({
                            allowClear: true
                        });
                        $container.val(null);
                    }
                    $container.selectpicker('refresh');

                    if ($("#permissionApplyManage").parents("#snapKHItemModal").length != 0 || $("#permissionApplyManage").parents("#useManageKHItemModal").length != 0) { //数据看板考核列表跳转进来
                        var dataModal = $("#permissionApplyManage").parents("#snapKHItemModal").length != 0 ? $("#permissionApplyManage").parents("#snapKHItemModal").data() : $("#permissionApplyManage").parents("#useManageKHItemModal").data();
                        if (dataModal.orgId && $container.attr('id') === 'permissionApplyOrg') { //分局下拉框赋值
                            $container.val(dataModal.orgId);
                            $container.selectpicker('refresh');
                            if (dataModal.orgId != '10') {
                                getSearchSelect($("#permissionApplyPolice"), dataModal.orgId, 2, 2); //获取分局下拉框
                            } else {
                                $("#searchPAMListBut").click();
                            }
                        } else if ($container.attr('id') === 'permissionApplyPolice') { //派出所赋值
                            $container.prop('disabled', false);
                            $container.val(dataModal.policeId);
                            $container.selectpicker('refresh');

                            $("#searchPAMListBut").click();
                        } else if (dataModal.orgId && $container.attr('id') === 'permissionApplyOrgTwo') { //分局下拉框赋值
                            $container.val(dataModal.orgId);
                            $container.selectpicker('refresh');
                            if (dataModal.orgId != '10') {
                                getSearchSelect($("#permissionApplyPoliceTwo"), dataModal.orgId, 2, 2); //获取分局下拉框
                            } else {
                                $("#searchPAMListButTwo").click();
                            }
                        } else if ($container.attr('id') === 'permissionApplyPoliceTwo') { //派出所赋值
                            $container.prop('disabled', false);
                            $container.val(dataModal.policeId);
                            $container.selectpicker('refresh');

                            $("#searchPAMListButTwo").click();
                        }
                    }
                } else {
                    $container.prop('disabled', true);
                    $container.val(null);
                    $container.selectpicker('refresh');
                }
            } else {
                $container.prop('disabled', true);
                $container.val(null);
                $container.selectpicker('refresh');
            }
        };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };

    /**
     * 配置列表生成
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     * @param {*} param 过滤条件对象
     */
    function createControlTableList($table, $pagination, first) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="9" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/myApplication/getApplicationList',
            successFunc = function (data) {
                hideLoading($table);
                $tbody.empty();
                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });
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
                            tableHtml += `<tr class="table-row" data-index="${i}" taskId="${result[i].incidentId}">
                                            <!--<td><a class="detail-icon" href="#"><i class="fa fa-plus"></i></a></td>-->
                                            <td></td>
                                            <td>${(_myApplyData.page - 1) * _myApplyData.size + i + 1}</td>
                                            <td title="${result[i].labh || '--'}">${result[i].labh || '--'}</td>
                                            <td title="${result[i].incident || '--'}">${result[i].incident || '--'}</td>
                                            <td title="${(result[i].userName || '--') + (result[i].orgName ? '(' + result[i].orgName + ')' : '')}">${(result[i].userName || '--') + (result[i].orgName ? '(' + result[i].orgName + ')' : '')}</td>
                                            <td title="${result[i].userId || '--'}">${result[i].userId || '--'}</td>
                                            <td title="${xbUserNames}">${xbUserNames}</td>
                                            <td title="${result[i].createTime || '--'}">${result[i].createTime || '--'}</td>
                                            <td title="${result[i].comments || '暂无'}">${result[i].comments || '暂无'}</td>
                                            <td>
                                                ${result[i].autoStatus === '0' && `<div class="status-item text-prompt"><i class="status-icon status-icon-online"></i><span class="status-text">审批中</span></div>`
                                || result[i].autoStatus === '1' && `<div class="status-item text-active"><i class="status-icon status-icon-success"></i><span class="status-text">已通过</span></div>`
                                || result[i].autoStatus === '2' && `<div class="status-item text-danger"><i class="status-icon status-icon-error"></i><span class="status-text">已驳回</span></div>` || '--'}
                                            </td>
                                            <td class="operation hide">
                                                <i class="icon aui-icon-file aui-mr-sm" title="查看"></i>
                                            </td>
                                        </tr> `
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
                                value: 18,
                                text: '18/页',
                            }, {
                                value: 25,
                                text: '25/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                _myApplyData.page = currPage;
                                _myApplyData.size = pageSize;
                                createControlTableList($table, '', false,)
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="9" class="text-center">没有匹配的记录</td></tr>');
                        $('.loading-box').hide();
                    }
                } else {
                    $("#myApplyContainer .control-total").eq(0).text(0);
                    $tbody.html('<tr><td colspan="9" class="text-center">没有匹配的记录</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, _myApplyData, successFunc);
    }

    /**
     * 配置列表生成紧急警务
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     * @param {*} param 过滤条件对象
     */
    function createCriticalTableList($table, $pagination, first) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="9" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/myApplication/getExigenceList',
            successFunc = function (data) {
                hideLoading($table);
                $tbody.empty();
                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });
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
                            tableHtml += `<tr class="table-row" data-index="${i}" taskId="${result[i].incidentId}">
                                            <td></td>
                                            <td>${(_myCriticalData.page - 1) * _myCriticalData.size + i + 1}</td>
                                            <td title="${result[i].labh || '--'}">${result[i].labh || '--'}</td>
                                            <td title="${result[i].incident || '--'}">${result[i].incident || '--'}</td>
                                            <td title="${(result[i].userName || '--') + (result[i].orgName ? '(' + result[i].orgName + ')' : '')}">${(result[i].userName || '--') + (result[i].orgName ? '(' + result[i].orgName + ')' : '')}</td>
                                            <td title="${result[i].userId || '--'}">${result[i].userId || '--'}</td>
                                            <td title="${xbUserNames}">${xbUserNames}</td>
                                            <td title="${result[i].createTime || '--'}">${result[i].createTime || '--'}</td>
                                            <td>${result[i].status == '0' && '未补办' || result[i].status == '1' && '已补办' || result[i].status == '2' && '超时补办' || '--'}</td>
                                            <td title="${result[i].comments || '暂无'}">${result[i].comments || '暂无'}</td>
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
                                value: 18,
                                text: '18/页',
                            }, {
                                value: 25,
                                text: '25/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                _myCriticalData.page = currPage;
                                _myCriticalData.size = pageSize;
                                createCriticalTableList($table, '', false,)
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="9" class="text-center">没有匹配的记录</td></tr>');
                        $('.loading-box').hide();
                    }
                } else {
                    //$("#myApplyContainer .control-total").eq(0).text(0);
                    $tbody.html('<tr><td colspan="9" class="text-center">没有匹配的记录</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, _myCriticalData, successFunc);
    }

    //鼠标移入显示气泡
    function showBubbleFun($this, result) {
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

    // 获取申请类型数据
    function getApplyTypeId() {
        var port = 'v2/dic/dictionaryInfo',
            data = {
                "kind": "CSRX_SEARCH_APPLICATION_SYSTEM_TYPE"
            };
        var successFunc = function (data) {
            if (data.code == '200') {
                var applicationTypeData = data.data;
                var html = '<option selected value="">全部</option>';
                for (var i = 0; i < applicationTypeData.length; i++) {
                    if (applicationTypeData[i].id != '7') {
                        html += `<option value = ${applicationTypeData[i].id}> ${applicationTypeData[i].name}</option>`
                    }
                }
                $('#applicationTypeVal').append(html);
                $("#applicationTypeVal").selectmenu('refresh');

                if ($("#permissionApplyManage").parents("#snapKHItemModal").length != 0 || $("#permissionApplyManage").parents("#useManageKHItemModal").length != 0) { //数据看板考核列表跳转进来
                    var dataModal = $("#permissionApplyManage").parents("#snapKHItemModal").length != 0 ? $("#permissionApplyManage").parents("#snapKHItemModal").data() : $("#permissionApplyManage").parents("#useManageKHItemModal").data();
                    if (dataModal.type != '7') {
                        $('#applicationTypeVal').val(dataModal.type);
                        $("#applicationTypeVal").selectmenu('refresh');
                    }
                }
                getSearchSelect($("#permissionApplyOrg")); //获取分局下拉框
                getSearchSelect($("#permissionApplyOrgTwo")); //获取分局下拉框
            } else {
                warningTip.say(data.message);
            }
        };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };


    //初始化
    function initControlConfig() {
        $("#applicationTypeVal").selectmenu();
        $("#permissionTypeVal").selectmenu();
        $("#approveStatus").selectmenu();
        $("#applicationTypeValTwo").selectmenu();
        $("#permissionApplyRoleType").selectmenu();
        $("#permissionApplyRoleTypeTwo").selectmenu();
        $('[data-role="radio"]').checkboxradio();
        $("#applicationTypeLinkTwo").selectmenu();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });
        getApplyTypeId();
        $("#permissionApplyPolice").prop('disabled', true);
        $("#permissionApplyPolice").val(null);
        $("#permissionApplyPolice").selectpicker('refresh');

        $("#permissionApplyPoliceTwo").prop('disabled', true);
        $("#permissionApplyPoliceTwo").val(null);
        $("#permissionApplyPoliceTwo").selectpicker('refresh');

        if ($("#permissionApplyManage").parents("#snapKHItemModal").length != 0 || $("#permissionApplyManage").parents("#useManageKHItemModal").length != 0) { //数据看板考核列表跳转进来
            var dataModal = $("#permissionApplyManage").parents("#snapKHItemModal").length != 0 ? $("#permissionApplyManage").parents("#snapKHItemModal").data() : $("#permissionApplyManage").parents("#useManageKHItemModal").data();
            if (dataModal.type == '7') {
                $(".permissionApplyOne").addClass("hide");
                $(".permissionApplyTwo").removeClass("hide");
                $("#typeValBut").find(".nav-item").eq(0).find(".nav-link").removeClass("show active");
                $("#typeValBut").find(".nav-item").eq(1).find(".nav-link").addClass("show active");
                if ($("#permissionApplyManage").parents("#snapKHItemModal").length != 0) {
                    var twoHeight = $("#permissionApplyManage").parents("#snapKHItemModal").find(".modal-body").height() - document.getElementById("permissionApplyTab").offsetHeight - document.getElementById("permissionApplyTwoTab").offsetHeight;
                } else {
                    var twoHeight = $("#permissionApplyManage").parents("#useManageKHItemModal").find(".modal-body").height() - document.getElementById("permissionApplyTab").offsetHeight - document.getElementById("permissionApplyTwoTab").offsetHeight;
                }
                $(".permissionApplyTwo .manages-card-content").css("height", twoHeight + 'px');
            } else {
                if ($("#permissionApplyManage").parents("#snapKHItemModal").length != 0) {
                    var oneHeight = $("#permissionApplyManage").parents("#snapKHItemModal").find(".modal-body").height() - document.getElementById("permissionApplyTab").offsetHeight - document.getElementById("permissionApplyOneTab").offsetHeight;
                    $(".permissionApplyOne .manages-card-content").css("height", oneHeight + 'px');
                } else {
                    var oneHeight = $("#permissionApplyManage").parents("#useManageKHItemModal").find(".modal-body").height() - document.getElementById("permissionApplyTab").offsetHeight - document.getElementById("permissionApplyOneTab").offsetHeight;
                    $(".permissionApplyOne .manages-card-content").css("height", oneHeight + 'px');
                }
            }
        } else {
            var oneHeight = document.body.clientHeight - document.getElementById("permissionApplyTab").offsetHeight - document.getElementById("permissionApplyOneTab").offsetHeight;
            $(".permissionApplyOne .manages-card-content").css("height", oneHeight + 'px');

            createControlTableList($('#AllPermApplyTable'), $('#AllPermApplyPagination'), true);
            createCriticalTableList($('#AllPermApplyTableTwo'), $('#AllPermApplyPaginationTwo'), true);
        }
        // 设置table的显示区域高度
        // var searchHeight = $('#permissionApplyManage .manages-search-style').height();
        // var viewHeight = $('#permissionApplyManage').height();
        // $('#permissionApplyManage .manages-card-content').css('height', viewHeight - searchHeight - 50);
    };

    initControlConfig();

    //各项切换
    $("#typeValBut").on("click", ".nav-item", function () {
        if ($(this).index() == 0) {
            $(".permissionApplyTwo").addClass("hide");
            $(".permissionApplyOne").removeClass("hide");

            if ($("#permissionApplyManage").parents("#snapKHItemModal").length != 0 || $("#permissionApplyManage").parents("#useManageKHItemModal").length != 0) { //数据看板考核列表跳转进来
                if ($("#permissionApplyManage").parents("#snapKHItemModal").length != 0) {
                    var oneHeight = $("#permissionApplyManage").parents("#snapKHItemModal").find(".modal-body").height() - document.getElementById("permissionApplyTab").offsetHeight - document.getElementById("permissionApplyOneTab").offsetHeight;
                } else {
                    var oneHeight = $("#permissionApplyManage").parents("#useManageKHItemModal").find(".modal-body").height() - document.getElementById("permissionApplyTab").offsetHeight - document.getElementById("permissionApplyOneTab").offsetHeight;
                }

                $(".permissionApplyOne .manages-card-content").css("height", oneHeight + 'px');
            } else {
                var oneHeight = document.body.clientHeight - document.getElementById("permissionApplyTab").offsetHeight - document.getElementById("permissionApplyOneTab").offsetHeight;
                $(".permissionApplyOne .manages-card-content").css("height", oneHeight + 'px');
            }
        } else if ($(this).index() == 1) {
            $(".permissionApplyOne").addClass("hide");
            $(".permissionApplyTwo").removeClass("hide");

            if ($("#permissionApplyManage").parents("#snapKHItemModal").length != 0 || $("#permissionApplyManage").parents("#useManageKHItemModal").length != 0) { //数据看板考核列表跳转进来
                if ($("#permissionApplyManage").parents("#snapKHItemModal").length != 0) {
                    var twoHeight = $("#permissionApplyManage").parents("#snapKHItemModal").find(".modal-body").height() - document.getElementById("permissionApplyTab").offsetHeight - document.getElementById("permissionApplyTwoTab").offsetHeight;
                } else {
                    var twoHeight = $("#permissionApplyManage").parents("#useManageKHItemModal").find(".modal-body").height() - document.getElementById("permissionApplyTab").offsetHeight - document.getElementById("permissionApplyTwoTab").offsetHeight;
                }

                $(".permissionApplyTwo .manages-card-content").css("height", twoHeight + 'px');
            } else {
                var twoHeight = document.body.clientHeight - document.getElementById("permissionApplyTab").offsetHeight - document.getElementById("permissionApplyTwoTab").offsetHeight;
                $(".permissionApplyTwo .manages-card-content").css("height", twoHeight + 'px');
            }
        }
    });

    //检索申请事件
    $("#AllPermApplyTable").on("click", "tbody tr.table-row", function () {
        var $this = $(this),
            url = "./facePlatform/incident-dialog.html",
            targetData = $this.data().listData;
        $('.incident-new-popup').data({
            incidentDetail: targetData,
            showDynamicDetail: false
        });
        loadPage($('.incident-new-popup'), url);
        $('.incident-new-popup').removeClass('hide');
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
                    showBubbleFun($this, data.data.taskApproveList);
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

    //紧急警务行点击事件
    $("#AllPermApplyTableTwo").on("click", "tbody tr.table-row", function () {
        var $this = $(this),
            url = "./facePlatform/incident-dialog.html",
            targetData = $this.data().listData;
        $('.incident-new-popup').data({
            incidentDetail: targetData,
            showDynamicDetail: false
        });
        loadPage($('.incident-new-popup'), url);
        $('.incident-new-popup').removeClass('hide');
    })

    // 搜索按钮点击事件
    $("#searchPAMListBut").on("click", function () {
        _myApplyData.incident = $("#incidentVal").val();
        _myApplyData.policeNum = $("#userNameVal").val();
        _myApplyData.xbUserName = $("#xbUserNameVal").val();
        _myApplyData.applicationType = $("#applicationTypeVal").val();
        _myApplyData.startTime = $("#startTimePAM").val();
        _myApplyData.endTime = $("#endTimePAM").val();
        _myApplyData.autoStatus = $("#approveStatus").val();
        _myApplyData.applicationLevel = $("#permissionTypeVal").val();
        _myApplyData.orgId = $("#permissionApplyPolice").val() ? $("#permissionApplyPolice").val() : $("#permissionApplyOrg").val();
        _myApplyData.roleType = $("#permissionApplyRoleType").val();
        _myApplyData.viewType = $("#permissionApplyRoleType").val() ? '5' : '4';
        _myApplyData.labh = $("#permissionApplyAj").val();
        _myApplyData.page = '1';
        _myApplyData.size = '12';
        if ($("#permissionApplyManage").parents("#snapKHItemModal").length != 0 || $("#permissionApplyManage").parents("#useManageKHItemModal").length != 0) { //数据看板考核列表跳转进来
            var dataModal = $("#permissionApplyManage").parents("#snapKHItemModal").length != 0 ? $("#permissionApplyManage").parents("#snapKHItemModal").data() : $("#permissionApplyManage").parents("#useManageKHItemModal").data();
            _myApplyData.apaasOrgId = dataModal.apaasOrgId;
        }
        createControlTableList($('#AllPermApplyTable'), $('#AllPermApplyPagination'), true);
    });

    // 紧急警务搜索按钮点击事件
    $("#searchPAMListButTwo").on("click", function () {
        _myCriticalData.incident = $("#incidentValTwo").val();
        _myCriticalData.creator = $("#approverValTwo").val();
        _myCriticalData.xbUserName = $("#xbUserNameValTwo").val();
        _myCriticalData.type = $("#applicationTypeValTwo").val();
        _myCriticalData.startTime = $("#startTimePAMTwo").val();
        _myCriticalData.endTime = $("#endTimePAMTwo").val();
        _myCriticalData.status = $("#applicationTypeLinkTwo").val();
        _myCriticalData.orgId = $("#permissionApplyPoliceTwo").val() ? $("#permissionApplyPoliceTwo").val() : $("#permissionApplyOrgTwo").val();
        _myCriticalData.roleType = $("#permissionApplyRoleTypeTwo").val();
        _myCriticalData.viewType = $("#permissionApplyRoleTypeTwo").val() ? '5' : '2';
        _myCriticalData.labh = $("#permissionApplyAjTwo").val();
        _myCriticalData.page = '1';
        _myCriticalData.size = '12';

        if ($("#permissionApplyManage").parents("#snapKHItemModal").length != 0 || $("#permissionApplyManage").parents("#useManageKHItemModal").length != 0) { //数据看板考核列表跳转进来
            var dataModal = $("#permissionApplyManage").parents("#snapKHItemModal").length != 0 ? $("#permissionApplyManage").parents("#snapKHItemModal").data() : $("#permissionApplyManage").parents("#useManageKHItemModal").data();
            _myCriticalData.apaasOrgId = dataModal.apaasOrgId;
        }
        createCriticalTableList($('#AllPermApplyTableTwo'), $('#AllPermApplyPaginationTwo'), true);
    });

    //权限申请导出点击事件
    $("#searchPAMListUpload").on("click", function () {
        var uploadData = {
            incident: _myApplyData.incident,
            policeNum: _myApplyData.policeNum,
            xbUserName: _myApplyData.xbUserName,
            applicationType: _myApplyData.applicationType,
            startTime: _myApplyData.startTime,
            endTime: _myApplyData.endTime,
            autoStatus: _myApplyData.autoStatus,
            applicationLevel: _myApplyData.applicationLevel,
            orgId: _myApplyData.orgId,
            roleType: _myApplyData.roleType,
            viewType: _myApplyData.viewType,
            labh: _myApplyData.labh,
            functionName: '权限申请',
            token: $.cookie('xh_token')
        };
        if ($("#permissionApplyManage").parents("#snapKHItemModal").length != 0 || $("#permissionApplyManage").parents("#useManageKHItemModal").length != 0) { //数据看板考核列表跳转进来
            switch (uploadData.applicationType) {
                case '2':
                    uploadData.functionName = '警情申请'
                    break;
                case '3':
                    uploadData.functionName = '已立案申请'
                    break;
                case '4':
                    uploadData.functionName = '专项工作申请'
                    break;
                case '6':
                    uploadData.functionName = '协办申请'
                    break;

            }
        }
        var post_url = encodeURI(serviceUrl + '/v3/myApplication/exportApplicationList?param=' + JSON.stringify(uploadData));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    })

    //紧急警务导出点击事件
    $("#searchPAMListUploadTwo").on("click", function () {
        var uploadData = {
            incident: _myCriticalData.incident,
            creator: _myCriticalData.creator,
            xbUserName: _myCriticalData.xbUserName,
            type: _myCriticalData.type,
            startTime: _myCriticalData.startTime,
            endTime: _myCriticalData.endTime,
            status: _myCriticalData.status,
            orgId: _myCriticalData.orgId,
            roleType: _myCriticalData.roleType,
            viewType: _myCriticalData.viewType,
            labh: _myCriticalData.labh,
            functionName: '紧急警务申请',
            token: $.cookie('xh_token')
        };
        var post_url = encodeURI(serviceUrl + '/v3/myApplication/exportExigenceList?param=' + JSON.stringify(uploadData));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    })

    //权限详情弹窗关闭事件
    $('#permissionApplyDetailModal').on("click", ".aui-icon-not-through", function () {
        $('#permissionApplyDetailModal').modal("hide");
    });

})(window, window.jQuery);