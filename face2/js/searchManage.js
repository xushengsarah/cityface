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

        $("#searchManageType").selectmenu();
        $("#searchManageRoleType").selectmenu();
        $("#searchManagePolice").prop('disabled', true);
        $("#searchManagePolice").val(null);
        $("#searchManagePolice").selectpicker('refresh');

        window.initDatePicker1($('#searchManageTime'), -1); // 初始化其他事件下的时间控件
        getOpType();
        getSearchSelect($("#searchManageOrg")); //获取分局下拉框
        var startTime = $('#startTimeSearchManage').val(),
            endTime = $('#endTimeSearchManage').val();
        portData = {
            startTime,
            endTime,
            searchType: $('#searchManageType').val()
        };

        //用户使用权限跳转进来
        for (var target of $("#sys-manage-tree-list").find("li")) {
            if ($(target).attr("modulecode") == '260918') {
                if (!$(target).attr("link")) {
                    createLibTableList($("#searchManageTableList"), $("#searchManageTablePagination"), true, 1, 10, portData);
                } else {
                    $(target).removeAttr("link");
                }
            }
        }
        // 设置table的显示区域高度
        var searchHeight = $('#searchManage .manages-search-style').height();
        var viewHeight = $('#searchManage').height();
        $('#searchManage .manages-card-content').css('height', viewHeight - searchHeight - 50);
    };

    //获取业务类型
    function getOpType() {
        var infoPort = 'v2/dic/dictionaryInfo',
            infoData1 = {
                "kind": "RX_YW_TYPE"
            },
            infoPortSuccessFunc1 = function (data) {
                if (data.code === '200') {
                    var RX_ID_TYPE = `<option class="option-item" value="" selected>全部</option>`;
                    data.data.forEach(function (item) {
                        RX_ID_TYPE += `<option class="option-item" value="${item.id}">${item.name}</option>`
                    })
                    $("#searchManageOpType").html(RX_ID_TYPE);
                    if (data.data.length > 0) {
                        $("#searchManageOpType").val("");
                        $("#searchManageOpType").selectmenu();
                    } else {
                        $('#searchManageOpType').val(null);
                        $('#searchManageOpType').attr("disabled", "disabled");
                        $("#searchManageOpType").selectmenu();
                    }
                } else {
                    $('#searchManageOpType').val(null);
                    $('#searchManageOpType').attr("disabled", "disabled");
                    $("#searchManageOpType").selectmenu();
                }
            };
        loadData(infoPort, true, infoData1, infoPortSuccessFunc1, '', 'GET');
    };

    //获取分局
    function getSearchSelect($container, orgId, returnType, orgType) {
        showLoading($container.closest(".aui-col-18"));
        var port = 'v2/org/getOrgInfos',
            data = {
                orgId: orgId ? orgId : '',
                orgType: orgType ? orgType : 2,
                userType: 2,
                returnType: returnType ? returnType : 3
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
                    if ($container.attr('id') === 'searchManageOrg') { // 分局下拉框
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

                    if ($container.attr('id') === 'searchManageOrg') { // 如果为分局下拉框
                        $container.selectpicker({
                            allowClear: false
                        });

                        $container.on('changed.bs.select', function (e, clickedIndex, isSelected) {
                            if (isSelected) {
                                var $targetOptionItem = $container.find(".option-item").eq(clickedIndex - 1);
                                if ($targetOptionItem.attr('parentid')) { // 如果不是市局
                                    //getSearchPolice($containerPolice, $targetOptionItem.attr('orgid'));
                                    getSearchSelectPolice($("#searchManagePolice"), $targetOptionItem.attr('orgid')); //获取分局下拉框
                                } else { // 如果选择市局
                                    $("#searchManagePolice").prop('disabled', true).val(null); // 派出所下拉框不可用
                                    $("#searchManagePolice").selectpicker('refresh');
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

                    if ($("#searchManage").parents("#snapKHItemModal").length != 0 || $("#searchManage").parents("#useManageKHItemModal").length != 0) { //数据看板考核列表跳转进来
                        var dataModal = $("#searchManage").parents("#snapKHItemModal").length != 0 ? $("#searchManage").parents("#snapKHItemModal").data() : $("#searchManage").parents("#useManageKHItemModal").data();
                        if (dataModal.orgId && $container.attr('id') === 'searchManageOrg') { //分局下拉框赋值
                            $container.val(dataModal.orgId);
                            $container.selectpicker('refresh');
                            if (dataModal.orgId != '10') {
                                //getSearchSelect($("#searchManagePolice"), dataModal.orgId, 2, 2); //获取分局下拉框
                                getSearchSelectPolice($("#searchManagePolice"), dataModal.orgId);
                            } else {
                                $("#searchManageList").click();
                            }
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

    //获取派出所
    function getSearchSelectPolice($container, orgId) {
        showLoading($container.closest(".aui-col-18"));
        var port = 'v2/org/getChildApaasOrgInfo',
            data = {
                orgId: orgId ? orgId : ''
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
                    itemHtml += `<option class="option-item" orgid="${result[0].apaasOrgId}" value="${result[0].apaasOrgId}" parentid="${result[0].parentId}" selected>${result[0].orgName}</option>`;
                    for (var i = 1; i < result.length; i++) {
                        itemHtml += `<option class="option-item" orgid="${result[i].apaasOrgId}" value="${result[i].apaasOrgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                    }
                    $container.empty().append(itemHtml); // 元素赋值
                    $container.prop('disabled', false); // 非不可选
                    $container.selectpicker({
                        allowClear: true
                    });
                    $container.val(null);
                    $container.selectpicker('refresh');

                    if ($("#searchManage").parents("#snapKHItemModal").length != 0 || $("#searchManage").parents("#useManageKHItemModal").length != 0) { //数据看板考核列表跳转进来
                        var dataModal = $("#searchManage").parents("#snapKHItemModal").length != 0 ? $("#searchManage").parents("#snapKHItemModal").data() : $("#searchManage").parents("#useManageKHItemModal").data();
                        $container.prop('disabled', false);
                        $container.val(dataModal.apaasOrgId);
                        $container.selectpicker('refresh');

                        $("#searchManageList").click();
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

    //检索类型改变
    $("#searchManageType").on("selectmenuchange", function (e, ui) {
        if (ui.item.value == '118005001' || ui.item.value == '118005002') {
            $("#searchManage .searchManageRoleType").addClass("hide");
        } else {
            $("#searchManage .searchManageRoleType").removeClass("hide");
        }
    });

    /**
     * 列表生产
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
            $tbody.html('<tr><td colspan="10" class="text-center">没有匹配的记录</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/searchLog/getSearchLog',
            portData = {
                page: page ? page : 1,
                size: number ? number : 10,
            },
            successFunc = function (data) {
                hideLoading($table);
                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });
                    if (result && result.length > 0) {
                        $tbody.empty();
                        var html = '';
                        for (var i = 0; i < result.length; i++) {
                            html += `<tr class="table-row" id="${result[i].id}">
                                        <td></td>
                                        <td>${(page - 1) * number + i + 1}</td>
                                        <td><img class="table-img img-right-event" src="${result[i].picFaceUrl ? result[i].picFaceUrl : './assets/images/control/person.png'}" alt=""></td>
                                        <td>${result[i].picSourceUrl ? '<img class="table-img img-right-event" src="' + result[i].picSourceUrl + '" alt="">' : '暂无'}</td>
                                        <td incidentId="${result[i].incidentId ? result[i].incidentId : ''}">
                                            <span class="${result[i].incident ? 'row-link' : ''}" title="${result[i].incident ? result[i].incident : '未知'}">
                                                ${result[i].incident ? result[i].incident : '未知'}
                                            </span>
                                        </td>
                                        <td title="${result[i].userName ? result[i].userName + '(' + result[i].orgName + ')' : '未知'}">${result[i].userName ? result[i].userName + '(' + result[i].orgName + ')' : '未知'}</td>
                                        <td title="${result[i].userId ? result[i].userId : '未知'}">${result[i].userId ? result[i].userId : '未知'}</td>
                                        <td title="${result[i].ip ? result[i].ip : '未知'}">${result[i].ip ? result[i].ip : '未知'}</td>
                                        <td title="${result[i].searchType ? result[i].searchType : '未知'}">${result[i].searchType ? result[i].searchType : '未知'}</td>
                                        <td title="${result[i].updateTime ? result[i].opTime : '未知'}">${result[i].opTime ? result[i].opTime : '未知'}</td>
                                        <td title="${result[i].ajbh ? result[i].ajbh : '未知'}">${result[i].ajbh ? result[i].ajbh : '未知'}</td>
                                    </tr>`;
                        }
                        // 先清空节点,再把拼接的节点插入
                        $table.find("tbody").empty().html(html);
                        $table.find("tbody .table-row").each(function (index, el) {
                            $(this).data('list', result[index]);
                        });

                        if (data.data.total > Number(portData.size) && first) {
                            var pageSizeOpt = [{
                                value: 10,
                                text: '10/页',
                                selected: true
                            }, {
                                value: 20,
                                text: '20/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                createLibTableList($table, $pagination, false, currPage, pageSize, param);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="10" class="text-center">没有匹配的记录</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="10" class="text-center">没有匹配的记录</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, $.extend(portData, param), successFunc);
    };

    //改变时间标签的激活状态
    function changeActiveSearch(_counts) {
        if (_counts === 1) {
            // 一天 单选激活 
            $('#searchManage-daysOne').addClass('ui-checkboxradio-checked ui-state-active');
            $('#searchManage-daysTwo').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#searchManage-daysThree').removeClass('ui-checkboxradio-checked ui-state-active');
        } else if (_counts === 3) {
            // 三天 单选激活 
            $('#searchManage-daysOne').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#searchManage-daysTwo').addClass('ui-checkboxradio-checked ui-state-active');
            $('#searchManage-daysThree').removeClass('ui-checkboxradio-checked ui-state-active');
        } else if (_counts === 7) {
            // 七天 单选激活 
            $('#searchManage-daysOne').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#searchManage-daysTwo').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#searchManage-daysThree').addClass('ui-checkboxradio-checked ui-state-active');
        } else {
            // 所有单选不激活 
            $('#searchManage-daysOne').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#searchManage-daysTwo').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#searchManage-daysThree').removeClass('ui-checkboxradio-checked ui-state-active');
        }
    }

    //时间控件点击事件
    window.selectDateFuncSearch = function () {
        // 开始时间
        var startTime = $('#searchManageTime').find('.datepicker-input').eq(0).val();
        // 结束时间
        var endTime = $('#searchManageTime').find('.datepicker-input').eq(1).val();
        var startDate = new Date(Date.parse(startTime.replace(/-/g, "/"))).getTime();
        var endDate = new Date(Date.parse(endTime.replace(/-/g, "/"))).getTime();
        // 开始时间与结束时间间隔天数
        var _counts = Math.abs(startDate - endDate) / (1000 * 60 * 60 * 24);
        changeActiveSearch(_counts);
    }

    // 检索日志列表 hover 显示中图
    showMiddleImg($('#searchManageTableList'), $("#powerUsageCountTwoModal").length > 0 ? $("#powerUsageCountTwoModal") : $('#searchManage'), '.table-img');

    $('#searchManageTableList').on('click', '.row-link', function () {
        var incidentId = $(this).closest('td').attr('incidentId');
        if (incidentId.indexOf("JJQW") > -1) {
            var port = 'v3/myApplication/getExigenceList',
                _myApplyData = { //检索
                    incidentId: incidentId,
                    viewType: '2',
                    page: '1',
                    size: '10'
                };
        } else {
            var port = 'v3/myApplication/getApplicationList',
                _myApplyData = { //检索
                    incidentId: incidentId,
                    autoStatus: '', // 任务状态：0-审批中；1-已通过；2-已驳回
                    page: '1',
                    size: '10',
                    viewType: '4'
                };
        }

        var successFunc = function (data) {
            if (data.code === '200') {
                var result = data.data.list,
                    url = "./facePlatform/incident-dialog.html",
                    targetData = result[0];
                $('.incident-new-popup').data({
                    incidentDetail: targetData,
                    showDynamicDetail: false
                });
                loadPage($('.incident-new-popup'), url);
                $('.incident-new-popup').removeClass('hide');
            } else {
                warningTip.say(data.message);
            }
        };
        loadData(port, true, _myApplyData, successFunc);
    });

    $('#searchManageTime').find('.datepicker-input').off('blur').on('blur', selectDateFuncSearch);

    //时间切换事件
    $('#timeSearchItem [data-role="radio-button"]').on('click', function () {
        var date = $(this).val();
        $(this).prev().addClass('ui-checkboxradio-checked ui-state-active');
        initDatePicker1($('#searchManageTime'), -date, true);
    });

    //搜索按钮点击事件
    $("#searchManageList").on("click", function () {
        var _validateFlag = true
        $('#searchManage').find('.text-danger').each(function (index, item) {
            // 如果有字段未通过验证
            if (!$(item).hasClass('hide')) {
                _validateFlag = false
            }
        })

        if (_validateFlag) {
            var incident = $('#searchManageTask').val(),
                userId = $('#searchManageName').val(),
                ip = $('#searchManageIP').val(),
                searchType = $('#searchManageType').val(),
                orgId = $('#searchManageOrg').val() || '',
                apaasOrgId = $("#searchManagePolice").val() || '',
                startTime = $('#startTimeSearchManage').val(),
                endTime = $('#endTimeSearchManage').val(),
                opType = $("#searchManageOpType").val(),
                ajbh = $("#searchManageNumber").val(),
                roleType = $("#searchManage .searchManageRoleType").hasClass("hide") ? '' : $("#searchManageRoleType").val();
            portData = {
                incident,
                userId,
                ip,
                searchType,
                orgId,
                apaasOrgId,
                startTime,
                endTime,
                opType,
                ajbh,
                roleType
            };

            if ($("#searchManage").parents("#snapKHItemModal").length != 0 || $("#searchManage").parents("#useManageKHItemModal").length != 0) { //数据看板考核列表或使用管理跳转进来
                var dataModal = $("#searchManage").parents("#snapKHItemModal").length != 0 ? $("#searchManage").parents("#snapKHItemModal").data() : $("#searchManage").parents("#useManageKHItemModal").data();
                portData.apaasOrgId = dataModal.apaasOrgId;
            }
            createLibTableList($("#searchManageTableList"), $("#searchManageTablePagination"), true, '1', '10', portData);
        }
    });

    //重置按钮点击事件
    $("#revertManageList").on("click", function () {
        $("#searchManageTask").val("");
        $("#searchManageName").val("");
        $("#searchManageIP").val("");
        $("#searchManageType").val("118002001");
        $("#searchManageType").selectmenu('refresh');
        $('#searchManageOpType').val("");
        $("#searchManageNumber").val("");
        $("#searchManageOpType").selectmenu('refresh');
        var $cameraOrg = $('#searchManageOrg');
        if ($cameraOrg.length > 0) {
            var $cameraMenu = $cameraOrg.data('selectpicker').$menu,
                $cameraBtn = $cameraOrg.data('selectpicker').$button,
                $cameraMenuItem = $cameraMenu.find('.dropdown-menu').find('.dropdown-item');
            $cameraMenuItem.eq(0).click();
            $cameraBtn.blur();
        }
        $("#searchManage-three").click();
    });

    //导出按钮点击事件
    $("#importManageList").on("click", function () {
        showLoading($('#importManageList'));
        var port = 'v3/searchLog/exportSearchLog',
            successFunc = function (data) {
                hideLoading($('#importManageList'));
                if (data.code == '200') {
                    var post_url = serviceUrl + '/v3/searchLog/exportSearchLogExcel?downId=' + data.downId + '&token=' + $.cookie('xh_token');
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

    // 单个参数校验公共方法
    $('#searchManage').find('#searchManageIP').off('blur').on('blur', function () {
        if ($.trim($(this).val()) != '') {
            // 校验IP
            var _reg = /^(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;
            if (_reg.test($(this).val()) !== true) {
                $(this).addClass('no-input-warning').parent().find('.text-danger.tip').removeClass('hide');
            } else {
                $(this).removeClass('no-input-warning').parent().find('.text-danger.tip').addClass('hide');
            }
        } else {
            $(this).removeClass('no-input-warning').parent().find('.text-danger.tip').addClass('hide');
        }
    });

    $("#searchPermissionApplyDetailModal").on("click", ".aui-icon-not-through", function () {
        $("#searchPermissionApplyDetailModal").modal("hide");
    });
})(window, window.jQuery);