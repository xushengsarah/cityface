(function (window, $) {
    var settings = {
        creator: '',
        startDate: '',
        endDate: '',
        status: 0
    };

    // 初始化
    function initConfig() {
        createAttachArchivingList($('#notificationTable'), $('#notificationPagination'), true, 1, 13);
        // 设置table的显示区域高度
        var searchHeight = $('#notification .manages-search-style').outerHeight();
        var viewHeight = $('#notification').height();
        $('#notification .manages-card-content').css('max-height', viewHeight - searchHeight);

        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });
    };
    initConfig();

    /**
     * 配置列表生成
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     */
    function createAttachArchivingList($table, $pagination, first, page, number) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v2/index/notice/list',
            portData = {
                "creator": settings.creator,
                "startDate": settings.startDate,
                "endDate": settings.endDate,
                "status": settings.status,
                "page": page ? page : 1,
                "size": number ? number : 13,
            },
            successFunc = function (data) {
                hideLoading($table);
                if (data.code == '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });
                    if (result && result.length > 0) {
                        $tbody.empty();
                        for (var i = 0; i < result.length; i++) {
                            var html = '';
                            html = `<tr data-index="${i}" class="detail-row" id=${result[i].id}>
                                        <!--<td title="${result[i].userId || '--'}">${result[i].userId || '--'}</td>-->
                                        <td title="${result[i].creator || '--'}">${result[i].creator || '--'}</td>
                                        <td title="${result[i].title || '--'}">${result[i].title || '--'}</td>
                                        <td title="${result[i].context || '--'}">${result[i].context || '--'}</td>
                                        <td title="${result[i].createTime || '--'}">${result[i].createTime || '--'}</td>
                                        <td title="${result[i].startTime || '--'}">${result[i].startTime || '--'}</td>
                                        <td title="${result[i].endTime || '--'}">${result[i].endTime || '--'}</td>
                                        <td title="${result[i].status == '1' ? '生效' : '失效'}">${result[i].status == '1' ? '生效' : '失效'}</td>
                                        <td><i class="icon aui-icon-edit aui-mr-sm" title="编辑"></i></td>
                                    </tr>`
                            $tbody.append(html);
                            $tbody.find("tr").eq(i).data({
                                'allData': result[i]
                            });
                        }

                        if (data.data.total > Number(portData.size) && first) {
                            var pageSizeOpt = [{
                                value: 13,
                                text: '13/页',
                                selected: true
                            }, {
                                value: 15,
                                text: '15/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                createAttachArchivingList($table, $pagination, false, currPage, pageSize);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
                }
            };
        loadData(port, true, portData, successFunc);
    };

    /**
     * 公共时间格式获取方法(时间戳)
     * @param {number} date 时间戳
     */
    function timeToDate(date) {
        var date = new Date(date);
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        return Y + M + D + ' ' + h + m + s;
    };

    // 搜索按钮点击事件
    $("#notificationSearchBtn").on("click", function () {
        settings.creator = $.trim($("#notificationUserId").val());
        settings.status = $("#notification").find("input[name='notificationShow']:checked").val();
        settings.startDate = $("#notificationStartTime").val();
        settings.endDate = $("#notificationEndTime").val();

        createAttachArchivingList($('#notificationTable'), $('#notificationPagination'), true, 1, 13);
    });

    //新增材料信息
    $("#notificationAddBtn").on("click", function () {
        var port = 'v2/index/notice/ntime',
            successFunc = function (data) {
                var startDate = new Date(data.data).getTime(),
                    endDate = new Date(data.data).getTime() + 24 * 3600 * 1000;
                $('#notificationModalStartTime').val(timeToDate(startDate));
                $('#notificationModalEndTime').val(timeToDate(endDate));
            };
        loadData(port, true, {}, successFunc, undefined, 'GET');
        $("#notificationAddModal").data("id", "");
        $("#notificationAddModal").find(".text-danger.tip").addClass("hide");
        $("#notification_title").val("");
        $('#attachArchivingAdd_reason').val("");
        var startDate = new Date($.ajax({ async: false }).getResponseHeader("Date")).getTime(),
            endDate = new Date($.ajax({ async: false }).getResponseHeader("Date")).getTime() + 24 * 3600 * 1000;
        $('#notificationModalStartTime').val(timeToDate(startDate));
        $('#notificationModalEndTime').val(timeToDate(endDate));
        $("#notificationModalShowOne").click();
        $("#notificationAddModal").modal("show");
    });

    //编辑按钮点击事件
    $("#notificationTable").on("click", ".aui-icon-edit", function () {
        var data = $(this).parents("tr").data("allData");
        $("#notification_title").val(data.title || '');
        $('#attachArchivingAdd_reason').val(data.context || '');
        $('#notificationModalStartTime').val(data.startTime || '');
        $('#notificationModalEndTime').val(data.endTime || '');
        if (data.enabled == 1) {
            $("#notificationModalShowOne").click();
        } else {
            $("#notificationModalShowTwo").click();
        }
        $("#notificationAddModal").data("id", data.id);

        $("#notificationAddModal").modal("show");
    });

    //取消按钮点击事件
    $("#notificationAddCanel").on("click", function () {
        $("#notificationAddModal").modal("hide");
    });

    //新增材料信息确认按钮点击事件
    $("#notificationAddSure").on("click", function () {
        var id = $("#notificationAddModal").data("id") || "",
            title = $.trim($("#notification_title").val()), //公告标题
            context = $.trim($("#attachArchivingAdd_reason").val()), //公告内容
            startTime = $.trim($("#notificationModalStartTime").val()), //公告开始时间
            endTime = $.trim($("#notificationModalEndTime").val()), //公告结束时间
            enabled = $("#notificationAddModal").find("input[name='notificationModalShow']:checked").val(),
            flag = true,
            dataApply = {
                id,
                title,
                context,
                startTime,
                endTime,
                enabled
            };

        if (dataApply.title == '') {
            $("#notification_title").closest(".form-group").find(".text-danger.tip").removeClass("hide");
            flag = false;
        }
        if (!dataApply.context) {
            $("#attachArchivingAdd_reason").closest(".form-group").find(".text-danger.tip").removeClass("hide");
            flag = false;
        }
        if (dataApply.startTime == '' || dataApply.endTime == '') {
            $("#notificationModalTime").closest(".form-group").find(".text-danger.tip").removeClass("hide");
            flag = false;
        }

        if (flag) {
            if (dataApply.id) {
                var portUrl = 'v2/index/notice/update';
                var getUrlSuccessFunc = function (data) {
                    if (data.code == '200') {
                        $("#notificationAddModal").modal("hide");
                        createAttachArchivingList($('#notificationTable'), $('#notificationPagination'), true, 1, 13);
                        warningTip.say("修改公告成功", 1);
                    } else {
                        warningTip.say(data.message);
                    }
                }
                loadData(portUrl, true, dataApply, getUrlSuccessFunc);
            } else {
                var portUrl = 'v2/index/notice/add';
                var getUrlSuccessFunc = function (data) {
                    if (data.code == '200') {
                        $("#notificationAddModal").modal("hide");
                        createAttachArchivingList($('#notificationTable'), $('#notificationPagination'), true, 1, 13);
                        warningTip.say("新增公告成功", 1);
                    } else {
                        warningTip.say(data.message);
                    }
                }
                loadData(portUrl, true, dataApply, getUrlSuccessFunc);
            }
        }
    });
})(window, window.jQuery)