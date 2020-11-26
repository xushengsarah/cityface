(function () {
    var createLibList = {};
    var createLibTwoList = {};
    var createLibThreeList = {};  //失效账号
    init();
    function init() {
        $("#searchUsageTwoType").selectmenu({
            search: true
        });
        $("#searchUsageOnePolice").prop('disabled', true);
        $("#searchUsageOnePolice").val(null);
        $("#searchUsageOnePolice").selectpicker('refresh');

        $("#searchUsageTwoPolice").prop('disabled', true);
        $("#searchUsageTwoPolice").val(null);
        $("#searchUsageTwoPolice").selectpicker('refresh');

        var oneHeight = document.body.clientHeight - document.getElementById("searchPowerUsageTab").offsetHeight - document.getElementById("searchPowerUsageTabOne").offsetHeight;
        $(".searchPowerUsageOne .manages-card-content").css("height", oneHeight + 'px');

        getUsageType();
        getSearchSelect($("#searchUsageOneOrg"), 'searchUsageOneOrg', 'searchUsageOnePolice');
        getSearchSelect($("#searchUsageTwoOrg"), 'searchUsageTwoOrg', 'searchUsageTwoPolice');
        createLibTableList($('#searchUsageTableOne'), $('#searchUsageTableOnePagination'), true, 1, 12, createLibList);
    };

    // 获取申请类型数据
    function getUsageType() {
        var port = 'v2/dic/dictionaryInfo',
            data = {
                "kind": "RX_REWARD_TYPE"
            };
        var successFunc = function (data) {
            if (data.code == '200') {
                var applicationTypeData = data.data;
                var html = '<option selected value="">全部</option>';
                for (var i = 0; i < applicationTypeData.length; i++) {
                    html += `<option value = ${applicationTypeData[i].id}> ${applicationTypeData[i].name}</option>`
                }
                $('#searchUsageTwoType').append(html);
                $("#searchUsageTwoType").selectmenu('refresh');
            } else {
                warningTip.say(data.message);
            }
        };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };


    //获取分局
    function getSearchSelect($container, containerId, childId, orgId, returnType, orgType) {
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
                    if ($container.attr('id') === containerId) { // 分局下拉框
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
                    if ($container.attr('id') === containerId) { // 如果为分局下拉框
                        $container.selectpicker({
                            allowClear: false
                        });

                        $container.on('changed.bs.select', function (e, clickedIndex, isSelected) {
                            if (isSelected) {
                                var $targetOptionItem = $container.find(".option-item").eq(clickedIndex - 1);
                                if ($targetOptionItem.attr('parentid')) { // 如果不是市局
                                    //getSearchPolice($containerPolice, $targetOptionItem.attr('orgid'));
                                    getSearchSelect($("#" + childId), containerId, childId, $targetOptionItem.attr('orgid'), 2, 2); //获取分局下拉框
                                } else { // 如果选择市局
                                    $("#" + childId).prop('disabled', true).val(null); // 派出所下拉框不可用
                                    $("#" + childId).selectpicker('refresh');
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
     * 总览列表
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     * @param {*} param 其他数据
     */
    function createLibTableList($table, $pagination, first, page, number, param) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="7" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/useDetail/getUserTotalList',
            portData = {
                page: page ? page : 1,
                size: number ? number : 12,
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
                        for (var i = 0; i < result.length; i++) {
                            var html = '';
                            var orgListHtml = '';
                            html += `<tr data-index="${i}" class="librow" taskId="${result[i].id}">
                                        <td>${(page - 1) * number + i + 1}</td>
                                        <td title="${result[i].userName || '--'}">${result[i].userName || '--'}</td>
                                        <td title="${result[i].userId || '--'}">${result[i].userId || '--'}</td>
                                        <td title="${result[i].orgName || '--'}">${result[i].orgName || '--'}</td>
                                        <td class="row-link hasTotalLink">${result[i].hasTotal}</td>
                                        <td class="row-link userTotal">${result[i].userTotal}</td>
                                        <td>${parseInt(result[i].hasTotal) - parseInt(result[i].userTotal)}</td>
                                    </tr>`
                            $tbody.append(html);
                            $tbody.find("tr").eq(i).data({
                                'listData': result[i]
                            });
                        }

                        if (data.data.total > Number(portData.size) && first) {
                            var pageSizeOpt = [{
                                value: 12,
                                text: '12/页',
                                selected: true
                            }, {
                                value: 18,
                                text: '18/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                $(".table-checkbox-all").removeAttr("checked");
                                createLibTableList($table, '', false, currPage, pageSize, param);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="7" class="text-center">No matching records found</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="7" class="text-center">No matching records found</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, $.extend(portData, param), successFunc);
    }

    /**
     * 明细列表
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     */
    function createLibTableTwoList($table, $pagination, first, page, number, param) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="9" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/useDetail/getUserDetailList',
            portData = {
                page: page ? page : 1,
                size: number ? number : 12,
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
                        for (var i = 0; i < result.length; i++) {
                            var html = '';
                            var orgListHtml = '';
                            html += `<tr data-index="${i}" class="librow" taskId="${result[i].id}">
                                        <td>${(page - 1) * number + i + 1}</td>
                                        <td title="${result[i].userName || '--'}">${result[i].userName || '--'}</td>
                                        <td title="${result[i].userId || '--'}">${result[i].userId || '--'}</td>
                                        <td title="${result[i].orgName || '--'}">${result[i].orgName || '--'}</td>
                                        <td title="${result[i].rewardCount || 0}">${result[i].rewardCount || 0}</td>
                                        <td title="${result[i].rewardTypeName || '--'}">${result[i].rewardTypeName || '--'}</td>
                                        <td title="${result[i].rewardDesc || '--'}">${result[i].rewardDesc || '--'}</td>
                                        <td title="${result[i].updator || '--'}">${result[i].updator || '--'}</td>
                                        <td title="${result[i].updateTime || '--'}">${result[i].updateTime || '--'}</td>
                                    </tr>`
                            $tbody.append(html);
                            $tbody.find("tr").eq(i).data({
                                'listData': result[i]
                            });
                        }

                        if (data.data.total > Number(portData.size) && first) {
                            var pageSizeOpt = [{
                                value: 12,
                                text: '12/页',
                                selected: true
                            }, {
                                value: 18,
                                text: '18/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                $(".table-checkbox-all").removeAttr("checked");
                                createLibTableTwoList($table, '', false, currPage, pageSize, param);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="9" class="text-center">No matching records found</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="9" class="text-center">No matching records found</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, $.extend(portData, param), successFunc);
    }

    /**
     * 失效账号列表
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     */
    function createLibTableThreeList($table, $pagination, first, page, number, param) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="6" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/useDetail/queryDisabledAccountInfo',
            portData = {
                page: page ? page : 1,
                size: number ? number : 12,
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
                        for (var i = 0; i < result.length; i++) {
                            var html = '';
                            var orgListHtml = '';
                            html += `<tr data-index="${i}" class="librow" taskId="${result[i].id}">
                                        <td>${(page - 1) * number + i + 1}</td>
                                        <td title="${result[i].userName || '--'}">${result[i].userName || '--'}</td>
                                        <td title="${result[i].userId || '--'}">${result[i].userId || '--'}</td>
                                        <td title="${result[i].orgName || '--'}">${result[i].orgName || '--'}</td>
                                        <td title="${result[i].operateTime || '--'}">${result[i].operateTime || '--'}</td>
                                        <td class="opt text-link">启用</td>
                                    </tr>`
                            $tbody.append(html);
                            $tbody.find("tr").eq(i).data({
                                'listData': result[i]
                            });
                        }

                        if (data.data.total > Number(portData.size) && first) {
                            var pageSizeOpt = [{
                                value: 12,
                                text: '12/页',
                                selected: true
                            }, {
                                value: 18,
                                text: '18/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                createLibTableThreeList($table, '', false, currPage, pageSize, param);
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
        loadData(port, true, $.extend(portData, param), successFunc);
    }

    //搜索按钮点击事件
    $("#searchUsageOneBtn").on("click", function () {
        createLibList.userId = $("#searchUsageOneId").val();
        createLibList.userName = $("#searchUsageOneName").val();
        createLibList.orgId = $("#searchUsageOnePolice").val() ? $("#searchUsageOnePolice").val() : $('#searchUsageOneOrg').val();
        createLibTableList($('#searchUsageTableOne'), $('#searchUsageTableOnePagination'), true, 1, 12, createLibList);
    });

    $("#searchUsageTwoBtn").on("click", function () {
        createLibTwoList.userId = $("#searchUsageTwoId").val();
        createLibTwoList.userName = $("#searchUsageTwoName").val();
        createLibTwoList.orgId = $("#searchUsageTwoPolice").val() ? $("#searchUsageTwoPolice").val() : $('#searchUsageTwoOrg').val();
        createLibTwoList.updator = $("#searchUsageTwoOptName").val();
        createLibTwoList.startTime = $("#startTime").val();
        createLibTwoList.endTime = $("#endTime").val();
        createLibTwoList.rewardType = $("#searchUsageTwoType").val();
        createLibTableTwoList($('#searchUsageTableTwo'), $('#searchUsageTableTwoPagination'), true, 1, 12, createLibTwoList);
    });

    //失效账号搜索按钮点击事件
    $("#searchUsageThreeBtn").on("click", function () {
        createLibThreeList.userId = $("#searchUsageThreeId").val();
        createLibThreeList.userName = $("#searchUsageThreeName").val();
        createLibTableThreeList($('#searchUsageTableThree'), $('#searchUsageTableThreePagination'), true, 1, 12, createLibThreeList);
    });

    //总览点击可使用次数跳转到奖励详情
    $("#searchUsageTableOne").on("click", ".row-link.hasTotalLink", function () {
        var data = $(this).parent().data("listData");

        // $(".searchPowerUsageOne").addClass("hide");
        // $(".searchPowerUsageTwo").removeClass("hide");
        // $("#typeValBut").find(".nav-link").eq(0).removeClass("active");
        // $("#typeValBut").find(".nav-link").eq(1).addClass("active");
        // $("#searchUsageTwoBtn").click();
        // var twoHeight = document.body.clientHeight - document.getElementById("searchPowerUsageTab").offsetHeight - document.getElementById("searchPowerUsageTabTwo").offsetHeight;
        // $(".searchPowerUsageTwo .manages-card-content").css("height", twoHeight + 'px');
        $("#powerUsageCountOneModal").modal("show");
        createLibTwoList.userId = data.userId;
        createLibTableTwoList($('#powerUsageCountOneTable'), $('#powerUsageCountOnePagination'), true, 1, 12, createLibTwoList);
    }).on("click", ".row-link.userTotal", function () {
        $("#powerUsageCountTwoModal").modal("show");
        var data = $(this).parent().data("listData"),
            $dom = $("#powerUsageCountTwoModal").find(".modal-body"),
            url = "./facePlatform/searchManage.html?dynamic=" + Global.dynamic;

        for (var target of $("#sys-manage-tree-list").find("li")) {
            if ($(target).attr("modulecode") == '260918') {
                $(target).attr("link", 1);
            }
        }

        loadPage($dom, url);
        $("#searchManageName").val(data.userName);
        $("#searchManageList").click();
    });

    $("#powerUsageCountTwoModal").on("click", "#powerUsageCountTwoClose", function () {
        $("#powerUsageCountTwoModal").find(".modal-body").html("");
        $("#powerUsageCountTwoModal").modal("hide");
    });

    //列表1重置按钮点击事件
    $("#searchUsageOneReset").on("click", function () {
        $("#searchUsageOneId").val("");
        $("#searchUsageOneOrg").val("10");
        $("#searchUsageOneOrg").selectpicker('refresh');

        $("#searchUsageOnePolice").prop('disabled', true);
        $("#searchUsageOnePolice").val(null);
        $("#searchUsageOnePolice").selectpicker('refresh');

        $("#searchUsageOneName").val("");
    });

    //列表2重置按钮点击事件
    $("#searchUsageTwoReset").on("click", function () {
        $("#searchUsageTwoId").val("");
        $("#searchUsageTwoOrg").val("10");
        $("#searchUsageTwoOrg").selectpicker('refresh');

        $("#searchUsageTwoPolice").prop('disabled', true);
        $("#searchUsageTwoPolice").val(null);
        $("#searchUsageTwoPolice").selectpicker('refresh');

        $("#searchUsageTwoName").val("");
        $("#searchUsageTwoOptName").val("");
        $("#searchPowerUsage #startTime").val("");
        $("#searchPowerUsage #endTime").val("");
        $("#searchUsageTwoType").val("");
    });

    //切换
    $("#typeValBut").on("click", ".nav-item", function () {
        if ($(this).index() == 0) {
            $(".searchPowerUsageTwo").addClass("hide");
            $(".searchPowerUsageOne").removeClass("hide");
            $(".searchPowerUsageThree").removeClass("hide");
            createLibTableList($('#searchUsageTableOne'), $('#searchUsageTableOnePagination'), true, 1, 12, createLibList);
            var oneHeight = document.body.clientHeight - document.getElementById("searchPowerUsageTab").offsetHeight - document.getElementById("searchPowerUsageTabOne").offsetHeight;
            $(".searchPowerUsageOne .manages-card-content").css("height", oneHeight + 'px');
        } else if ($(this).index() == 1) {
            $(".searchPowerUsageOne").addClass("hide");
            $(".searchPowerUsageTwo").removeClass("hide");
            $(".searchPowerUsageThree").addClass("hide");
            createLibTableTwoList($('#searchUsageTableTwo'), $('#searchUsageTableTwoPagination'), true, 1, 12, createLibTwoList);
            var twoHeight = document.body.clientHeight - document.getElementById("searchPowerUsageTab").offsetHeight - document.getElementById("searchPowerUsageTabTwo").offsetHeight;
            $(".searchPowerUsageTwo .manages-card-content").css("height", twoHeight + 'px');
        } else {
            $(".searchPowerUsageOne").addClass("hide");
            $(".searchPowerUsageTwo").addClass("hide");
            $(".searchPowerUsageThree").removeClass("hide");
            createLibTableThreeList($('#searchUsageTableThree'), $('#searchUsageTableThreePagination'), true, 1, 12, createLibThreeList);
            var twoHeight = document.body.clientHeight - document.getElementById("searchPowerUsageTab").offsetHeight - document.getElementById("searchPowerUsageTabThree").offsetHeight;
            $(".searchPowerUsageThree .manages-card-content").css("height", twoHeight + 'px');
        }
    });

    // 公开范围按人 输入框点击事件 调用树组件
    $('#powerUsageAddUser').orgTree({
        all: true, //人物组织都开启
        area: ['620px', '542px'], //弹窗框宽高
        search: true, // 搜索事件不在orgTree
        newBk: true,
        noMap: true,
        noTree: true,
        ajaxFilter: false,
        node: 'powerUsageAddUser'
    });

    // 公开范围按人 删除按钮事件
    $('#powerUsageAddUser').siblings().on('click', function () {
        if ($('#powerUsageAddUser').attr('disabled') == 'disabled') {
            return
        }
        $('#powerUsageAddUser').val('');
        $('#powerUsageAddUser').attr('title', '');
        $('#powerUsageAddUser').data({
            'saveVal': [],
            'noticeUserList': [],
            'userIdArr': []
        })
    });

    // 公开范围按人 点击事件
    $('#powerUsageAddUser').on('click', function () {
        selectPersonCommon($(this));
    })

    //临时奖励按钮点击事件
    $("#searchUsageTwoAdd").on("click", function () {
        $("#powerUsageAdd").find(".text-danger.tip").addClass("hide");
        $('#powerUsageAddUser').val('');
        $('#powerUsageAddUser').attr('title', '');
        $('#powerUsageAddUser').data({
            'saveVal': [],
            'noticeUserList': [],
            'userIdArr': []
        })
        $("#powerUsageAddCount").val("");
        $("#powerUsageAddReason").val("");
        $("#powerUsageAdd").modal("show");
    });

    //临时奖励弹窗确认按钮点击事件
    $("#powerUsageAddOK").on("click", function () {
        $("#powerUsageAdd").find(".text-danger.tip").addClass("hide");

        var rewardCount = parseInt($("#powerUsageAddCount").val()),
            rewardDesc = $("#powerUsageAddReason").val(),
            userList = $("#powerUsageAddUser").data("noticeUserList"),
            data = {
                rewardCount,
                rewardDesc,
                userList,
                rewardType: 6
            },
            flag = true;
        if (!data.rewardCount) {
            $("#powerUsageAddCount").closest(".form-group").find(".text-danger.tip").removeClass("hide");
            flag = false;
        }

        if (!data.rewardDesc) {
            $("#powerUsageAddReason").closest(".form-group").find(".text-danger.tip").removeClass("hide");
            flag = false;
        }

        if (data.userList.length == 0) {
            $("#powerUsageAddUser").closest(".form-group").find(".text-danger.tip").removeClass("hide");
            flag = false;
        }

        if (flag) {
            var port = 'v3/useDetail/addUserDetailInfo',
                successFunc = function (data) {
                    if (data.code == '200') {
                        $("#powerUsageAdd").modal("hide");
                        warningTip.say('成功', 1);
                        createLibTableTwoList($('#searchUsageTableTwo'), $('#searchUsageTableTwoPagination'), true, 1, 12, createLibTwoList);
                    } else {
                        warningTip.say(data.message);
                        $("#powerUsageAdd").modal("hide");
                    }
                };
            loadData(port, true, data, successFunc);
        }
    });

    //账号失效启用点击事件
    $("#searchUsageTableThree").on("click", ".text-link.opt", function () {
        let userId = $(this).parents("tr").data("listData").userId;
        $("#enabledAccountTipModal").modal("show").data("userId", userId);
    })

    //账号失效启用确认
    $("#enabledAccountTipSure").on("click", function () {
        var port = 'v3/useDetail/enabledAccountInfo',
            portData = {
                userId: $("#enabledAccountTipModal").data("userId")
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    warningTip.say("成功", 1);
                    createLibTableThreeList($('#searchUsageTableThree'), $('#searchUsageTableThreePagination'), true, 1, 12, createLibThreeList);
                } else {
                    warningTip.say(data.message);
                }
            }
        loadData(port, true, portData, successFunc, undefined, 'GET');
    })
})();