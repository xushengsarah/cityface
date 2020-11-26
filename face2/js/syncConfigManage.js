(function (window, $) {
    var settings = {
        $deleteOpt: '', //列表删除操作需要的taskid
        $objConfigList: {},
        controlFlag: true
    };

    initControlConfig();

    //初始化
    function initControlConfig() {
        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });
        createConfigList($('#tableListConfig'), $('#tableConfigListPagination'), true, 1, 10, settings.$objConfigList);
    };

    /**
     * 列表生成
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     * @param {*} param 过滤条件对象
     */
    function createConfigList($table, $pagination, first, page, number, param) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="7" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v2/progress/configs',
            portData = {
                "page": page ? page : 1,
                "size": number ? number : 10,
                //"param": param ? param : {},
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
                            html = `<tr data-index="${i}" class="" taskid="${result[i].id}" sourceCode="${result[i].sourceCode}">
									<!--<td class="bs-checkbox ">
										<div class="table-checkbox">
											<input data-index="0" name="btSelectItem" type="checkbox" value="0" class="table-checkbox-input table-checkbox-input-configDetail">
											<span class="table-checkbox-label"></span>
										</div>
									</td>-->
									<td>${result[i].id || '--'}</td>
									<td>${result[i].srcTable || '--'}</td>
									<td>${result[i].rowCount || '--'}</td>
                                    <td>${result[i].syncColumn || '--'}</td>
									<td>${result[i].creator || '--'}</td>
									<td>${result[i].createtime || '--'}</td>
                                    <td>${result[i].comments || '--'}</td>
                                    <td>
                                        <i class="icon aui-icon-file aui-mr-sm" title="查看"></i>
                                        <i class="icon aui-icon-edit aui-mr-sm" title="编辑"></i>
                                        <i class="icon aui-icon-delete-line" title="删除"></i>
										<!--<i class="text-light aui-icon-video2 aui-mr-sm"></i>-->
									</td>
								</tr>`
                            $tbody.append(html);
                            $tbody.find("tr").eq(i).data({
                                'allData': result[i]
                            });
                        }

                        if (data.data.total > Number(portData.size) && first) {
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
                                createConfigList($table, '', false, currPage, pageSize, param);
                                $("#configMultiDeleteBtn").addClass("disabled");
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

    // 编辑查看公用代码
    function commonConfigOpt(allData) {
        $('#ConfigModal').find('[id*=config]').removeClass('no-input-warning').val('').closest('.control-form').find('.text-danger.tip').addClass('hide');
        //源码
        $("#id_val").val(allData.id);
        //源码
        $("#srcTable_val").val(allData.srcTable);
        //同步字段
        $("#syncColumn_val").val(allData.syncColumn);
        // 条数
        $('#rowCount_val').val(allData.rowCount);
        // 备注
        $('#comments_val').val(allData.comments);
        // 进度
        if (allData.minNum) { //数值
            $('#ConfigModal').find('#progress_val .ui-checkboxradio-label').eq(0).click();
            $("#num").removeClass("hide");
            $("#time").addClass("hide");
            $("#char").addClass("hide");
            $("#minNum_val").val(allData.minNum);
            $("#maxNum_val").val(allData.maxNum);
        } else if (allData.minTime) { //时间
            $('#ConfigModal').find('#progress_val .ui-checkboxradio-label').eq(1).click();
            $("#num").addClass("hide");
            $("#time").removeClass("hide");
            $("#char").addClass("hide");
            $("#minTime_val").val(allData.minTime);
            $("#maxTime_val").val(allData.maxTime);
        } else {
            $('#ConfigModal').find('#progress_val .ui-checkboxradio-label').eq(2).click();
            $("#num").addClass("hide");
            $("#time").addClass("hide");
            $("#char").removeClass("hide");
            $("#minChar_val").val(allData.minChar);
            $("#maxChar_val").val(allData.maxChar);
        }
    };

    // 搜索按钮点击事件
    $("#searchConfigList").on("click", function () {
        settings.$objConfigList.id = $("#idVal").val();
        settings.$objConfigList.srcTable = $("#srcTableVal").val();
        settings.$objConfigList.creator = $("#creatorVal").val();
        settings.$objConfigList.comments = $("#commentsVal").val();
        settings.$objConfigList.startTime = $("#startTime").val();
        settings.$objConfigList.endTime = $("#endTime").val();
        createConfigList($('#tableListConfig'), $('#tableConfigListPagination'), true, 1, 10, settings.$objConfigList);
        $("#configMultiDeleteBtn").addClass("disabled");
    });

    // 新建按钮点击事件
    $("#configAddBtn").on("click", function () {
        $('#ConfigModal').find('[id$=_val]').removeClass('no-input-warning').val('').removeAttr("disabled");
        $('#ConfigModal').find('.text-danger.tip').addClass('hide');
        $('#ConfigModal').find('.viewConfigList').addClass("hide");
        //初始化
        $('.form-group').find("[id$=_val]").removeAttr("disabled");
        $('.form-group').find("input[type=radio]").removeAttr("disabled");
        $('#ConfigModal').find('#progress_val .ui-checkboxradio-label').eq(0).click();
        $("#num").removeClass("hide");
        $("#time").addClass("hide");
        $("#char").addClass("hide");
        $("#ConfigModal").find('.modal-footer button').removeClass("hide");
        // $("#data_val").addClass("addList"); //新建
        // $("#data_val").removeClass("editList");
        $("#configLabel").html("同步进度配置新增");
        $('#ConfigModal').attr('taskid', '');
        $('#ConfigModal').modal('show');
    });

    // 新建确认按钮点击事件
    $("#configModalSure").on('click', function () {
        $('#ConfigModal').find('[id*=config]').removeClass('no-input-warning').closest('.control-form').find('.text-danger.tip').addClass('hide');
        settings.controlFlag = true;
        var bucketName = '',
            bucketUrl = '';

        // 任务id
        var id = $('#ConfigModal').attr('taskid');
        // 源表
        var srcTable = $.trim($('#srcTable_val').val());
        // 同步字段
        var syncColumn = $('#syncColumn_val').val();
        // 条数
        var rowCount = $('#rowCount_val').val();
        // 说明
        var comments = $('#comments_val').val();

        var portData = {
            id: id ? id : '',
            srcTable: srcTable ? srcTable : '',
            syncColumn: syncColumn ? syncColumn : '',
            rowCount: rowCount ? rowCount : '',
            comments: comments ? comments : ''
        }
        //任务启动时间
        var progressType = $("#progress_val").find('.ui-checkboxradio-checked').siblings('input').val();

        if (progressType == '1') { //数值
            var minNum = $("#minNum_val").val();
            var maxNum = $("#maxNum_val").val();
            portData.minNum = minNum;
            portData.maxNum = maxNum;
            portData.minTime = '';
            portData.maxTime = '';
            portData.minChar = '';
            portData.maxChar = '';
        } else if (progressType == '2') { //时间
            var minTime = $("#minTime_val").val();
            var maxTime = $("#maxTime_val").val();
            portData.minNum = '';
            portData.maxNum = '';
            portData.minTime = minTime;
            portData.maxTime = maxTime;
            portData.minChar = '';
            portData.maxChar = '';
        } else {
            var minChar = $("#minChar_val").val();
            var maxChar = $("#maxChar_val").val();
            portData.minNum = '';
            portData.maxNum = '';
            portData.minTime = '';
            portData.maxTime = '';
            portData.minChar = minChar;
            portData.maxChar = maxChar;
        }

        //校验
        for (var item in portData) {
            if (portData[item] == '' && item != "id") {
                switch (item) {
                    case 'minNum':
                    case 'maxNum':
                        if (progressType == '1') {
                            $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('#num .text-danger.tip').removeClass('hide');
                            settings.controlFlag = false;
                        }
                        break;
                    case 'minTime':
                    case 'maxTime':
                        if (progressType == '2') {
                            $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('#time .text-danger.tip').removeClass('hide');
                            settings.controlFlag = false;
                        }
                        break;
                    case 'minChar':
                    case 'maxChar':
                        if (progressType == '3') {
                            $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('#char .text-danger.tip').removeClass('hide');
                            settings.controlFlag = false;
                        }
                        break;
                    default:
                        $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                        settings.controlFlag = false;
                }
            }
        }

        var portDataSuccessFunc = function (data) {
            if (data.code === '200') {
                $('#ConfigModal').modal('hide');
                createConfigList($('#tableListConfig'), $('#tableConfigListPagination'), true, 1, 10, settings.$objConfigList);
                $("#configMultiDeleteBtn").addClass("disabled");
                hideLoading($('#ConfigModal .modal-content'));
            } else {
                var tip = id ? '编辑失败,' + data.message : '新建失败,' + data.message;
                warningTip.say(tip);
                hideLoading($('#ConfigModal .modal-content'));
            }
        }
        if (settings.controlFlag) {
            showLoading($('#ConfigModal .modal-content'));
            loadData('v2/progress/editConfigs', true, portData, portDataSuccessFunc);
        }
    });

    // 表格查看按钮点击事件
    $('#tableListConfig').on('click', 'td .aui-icon-file', function () {
        $('#ConfigModal').find('[id$=_val]').removeClass('no-input-warning').removeAttr("disabled");
        $('#ConfigModal').find('.text-danger.tip').addClass('hide');
        $('#ConfigModal').find('.viewConfigList').removeClass("hide");
        $('.form-group').find("[id$=_val]").removeAttr("disabled");
        $('.form-group').find("input[type=radio]").removeAttr("disabled");
        // 数据初始化
        var allData = $(this).closest("tr").data("allData");
        commonConfigOpt(allData);
        $('#creator_val').val(allData.creator); // 创建人
        $('#createtime_val').val(allData.createtime); // 创建时间
        $('#updator_val').val(allData.updator); // 更新人
        $('#udpatetime_val').val(allData.updatetime); // 更新时间
        $('.form-group').find("[id$=_val]").attr("disabled", "disabled");
        $('.form-group').find("input[type=radio]").attr("disabled", "disabled");
        $("#ConfigModal").find('.modal-footer button').addClass("hide");
        $("#configLabel").html("同步进度配置查看");
        $('#ConfigModal').modal('show');
    });

    // 表格编辑按钮点击事件
    $('#tableListConfig').on('click', 'td .aui-icon-edit', function () {
        $('#ConfigModal').find('[id$=_val]').removeClass('no-input-warning').val('').removeAttr("disabled").closest('.control-form');
        $('#ConfigModal').find('.text-danger.tip').addClass('hide');
        $('#ConfigModal').find('.viewConfigList').addClass("hide");
        $('.form-group').find("[id$=_val]").removeAttr("disabled");
        $('.form-group').find("input[type=radio]").removeAttr("disabled");
        // $("#data_val").addClass("editList"); //编辑
        // $("#data_val").removeClass("addList");
        var taskid = $(this).closest('tr').attr('taskid'),
            allData = $(this).closest("tr").data("allData");
        commonConfigOpt(allData);
        $("#ConfigModal").find('.modal-footer button').removeClass("hide");
        $("#configLabel").html("同步进度配置编辑");
        $('#ConfigModal').attr('taskid', taskid);
        $('#ConfigModal').modal('show');
    });

    // 表格删除按钮点击事件
    $('#tableListConfig').on('click', 'td .aui-icon-delete-line', function () {
        $("#configTipLabel").html('是否删除?');
        $("#configTipModal").modal('show');
        settings.$deleteOpt = $(this).parents("tr").attr("taskid");
    });

    // 删除确定按钮点击事件
    $("#configModaldelectSure").on("click", function () {
        var port = 'v2/progress/delConfigs',
            portData = {
                "id": settings.$deleteOpt
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    $('#configTipModal').modal('hide');
                    createConfigList($('#tableListConfig'), $('#tableConfigListPagination'), true, 1, 10, settings.$objConfigList);
                    $("#configMultiDeleteBtn").addClass("disabled");
                }
            };
        loadData(port, true, portData, successFunc, undefined, 'DELETE');
    });

    // 添加进度选择类型
    $('#progress_val').find('[data-role="radio"]').on("change", function () {
        if ($(this).val() == '1') { //数值
            $("#num").removeClass("hide");
            $("#time").addClass("hide");
            $("#char").addClass("hide");
        } else if ($(this).val() == '2') { //时间
            // if ($(this).closest("#data_val").hasClass("addList")) {
            //     var dt = new Date();
            //     $("#minTime_val").val(dt.pattern("yyyy-MM-dd HH:mm:ss"));
            //     $("#maxTime_val").val(dt.pattern("yyyy-MM-dd HH:mm:ss"));
            // }
            $("#num").addClass("hide");
            $("#time").removeClass("hide");
            $("#char").addClass("hide");
        } else {
            $("#num").addClass("hide");
            $("#time").addClass("hide");
            $("#char").removeClass("hide");
        }
    });

    // 单个参数校验公共方法
    $('#ConfigModal').find('[id$="_val"]').off('blur').on('blur', function () {
        $(this).removeClass('no-input-warning').parent().find('.text-danger').addClass('hide');
        if ($(this).val().replace(/\s/g, '') === '') {
            $(this).addClass('no-input-warning').parent().find('.text-danger.tip').removeClass('hide');
        } else {
            // if ($(this).attr('id') == 'resultTopVal') {
            //     var resultTop = parseInt($(this).val());
            //     if (resultTop > 50 || resultTop < 0) {
            //         $(this).addClass('no-input-warning').parent().find('.text-danger.tip').removeClass('hide');
            //     }
            // }
        }
    })

})(window, window.jQuery);