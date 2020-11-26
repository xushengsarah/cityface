(function (window, $) {
    // 备注：数据采集配置管理，星火存储表值发生改变，待测试

    var settings = {
        $deleteOpt: '', //镜头列表操作需要的taskid
        $objConfigList: {},
        controlFlag: true
    };

    initControlConfig();

    // 初始化
    function initControlConfig() {
        $("#dataTypeSearch").selectmenu();
        $("#dbTypeSearch").selectmenu();
        $("#imgType_val").selectmenu({
            change: function (event, ui) {
                if (ui.item.value == '1') {
                    $(".aui-from-horizontal .s3t").removeClass("hide");
                } else {
                    $(".aui-from-horizontal .s3t").addClass("hide");
                }
            }
        });
        $("#dbType_val").selectmenu();
        $("#scheType_val").selectmenu();
        $("#xhTableName_val").selectmenu();
        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });

        createConfigList($('#tableListConfig'), $('#tableConfigListPagination'), true, 1, 10, settings.$objConfigList);
        // 设置table的显示区域高度
        var searchHeight = $('#configTable .manages-search-style').height();
        var viewHeight = $('#configTable').height();
        $('#configTable .manages-card-content').css('height', viewHeight - searchHeight - 50);
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
    function createConfigList($table, $pagination, first, page, number, param) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="9" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v2/dataAcquis/dbInfos',
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
									<td></td>
									<td>${result[i].sourceIp || '--'}</td>
									<td>${result[i].sourcePort || '--'}</td>
                                    <td>${result[i].userName || '--'}</td>
                                    <td>${result[i].password || '--'}</td>
                                    <td>${result[i].dataType == '1' ? '图片库' : '人员信息库' || '--'}</td>
                                    <td>${result[i].creator || '--'}</td>
									<td>${result[i].createtime || '--'}</td>
                                    <td>
                                        <i class="icon aui-icon-file aui-mr-sm" title="查看"></i>
                                        <i class="icon aui-icon-edit aui-mr-sm" title="编辑"></i>
                                        <i class="icon aui-icon-delete-line aui-mr-sm" title="删除"></i>
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
                        $tbody.html('<tr><td colspan="9" class="text-center">No matching records found</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="9" class="text-center">No matching records found</td></tr>');
                }
            };
        loadData(port, true, $.extend(portData, param), successFunc);
    }

    // 获取下拉框数据
    function getAllLibs() {
        var _port = 'v2/lib/allLibs',
            _portData = {},
            _successFunc = function (data) {
                if (data.code === '200' && data.data.length) {
                    var allLibs = data.data;
                    var html = '';
                    for (var i = 0; i < allLibs.length; i++) {
                        if (!i) {
                            html += `<option value=${allLibs[i].libId} checked>${allLibs[i].libName}</option>`
                        } else {
                            html += `<option value=${allLibs[i].libId}>${allLibs[i].libName}</option>`
                        }
                    }
                    $('#xhTableName_val').html(html)
                    $("#xhTableName_val").selectmenu('refresh');
                }
            };
        loadData(_port, true, _portData, _successFunc, undefined, 'GET');
    }
    getAllLibs();

    // 新增/编辑弹框 输入框/下拉框 可编辑
    function removeDisabled() {
        $('#ConfigTableModal').find('[id$=_val]').removeClass('no-input-warning').removeAttr("disabled").closest('.control-form').find('.text-danger.tip').addClass('hide');
        $('#ConfigTableModal').find('[id$=_val]').removeAttr('disabled');
        $('#ConfigTableModal').find("input[type=radio]").removeAttr("disabled");
        $('#imgType_val').selectmenu('enable');
        $('#dbType_val').selectmenu('enable');
        $('#scheType_val').selectmenu('enable');
        $('#xhTableName_val').selectmenu('enable');
    }

    // 新增/编辑弹框 输入框/下拉框 不可编辑
    function searchDisabled() {
        $('#ConfigTableModal').find("[id$=_val]").attr("disabled", "disabled");
        $('#ConfigTableModal').find("input[type=radio]").attr("disabled", "disabled");
        $('#imgType_val').selectmenu('disable');
        $('#dbType_val').selectmenu('disable');
        $('#scheType_val').selectmenu('disable');
        $('#xhTableName_val').selectmenu('disable');
    }

    // 编辑查看公用代码
    function commonConfigOpt(allData) {
        $('#ConfigTableModal').find('[id*=_val]').removeClass('no-input-warning').val('').closest('.control-form').find('.text-danger.tip').addClass('hide');
        // 采集源编码
        $('#sourceCode_val').val(allData.sourceCode);
        $('#sourceCode_val').attr("disabled", "disabled");
        // 表查询sql
        $('#querySql_val').val(allData.querySql);
        // 图片类型
        $('#imgType_val').val(allData.imgType);
        $("#imgType_val").selectmenu('refresh');
        if (allData.imgType == '1') {
            $(".aui-from-horizontal .s3t").removeClass("hide");
            // s3桶名称
            $('#bucketName_val').val(allData.bucketName);
            // 库源类型
            $('#bucketUrl_val').val(allData.bucketUrl);
        } else {
            $(".aui-from-horizontal .s3t").addClass("hide");
            // s3桶名称
            $('#bucketName_val').val('');
            // 库源类型
            $('#bucketUrl_val').val('');
        }
        // 星火存储表
        $('#xhTableName_val').val(allData.xhTableName);
        $("#dbType_val").selectmenu('refresh');
        // 库源类型
        $('#dbType_val').val(allData.dbType);
        $("#dbType_val").selectmenu('refresh');
        //同步标识字段类型
        $('#scheType_val').val(allData.scheType);
        $("#scheType_val").selectmenu('refresh');
        // 同步标识字段
        $('#scheColumn_val').val(allData.scheColumn);
        // 分页查询数
        $('#querySize_val').val(allData.querySize);
        // 数据源ip
        $('#sourceIp_val').val(allData.sourceIp);
        // 数据源端口
        $('#sourcePort_val').val(allData.sourcePort);
        // 数据源sid
        if (allData.sourceSid) {
            $('#ConfigTableModal').find('#source_val .ui-checkboxradio-label').eq(0).click();
            $("#sourceSid").removeClass("hide");
            $("#sourceClusterName").addClass("hide");
            $("#sourceSid_val").val(allData.sourceSid);
        } else {
            $('#ConfigTableModal').find('#source_val .ui-checkboxradio-label').eq(1).click();
            $("#sourceClusterName").removeClass("hide");
            $("#sourceSid").addClass("hide");
            $("#sourceClusterName_val").val(allData.sourceClusterName);
        }

        $('#sourceSid_val').val(allData.sourceSid);
        // 用户名
        $('#userName_val').val(allData.userName);
        // 密码
        $('#password_val').val(allData.password);
        // 数据类型
        if (allData.dataType == '1') { //图片库
            $('#ConfigTableModal').find('#dataType_val .ui-checkboxradio-label').eq(0).click();
        } else {
            $('#ConfigTableModal').find('#dataType_val .ui-checkboxradio-label').eq(1).click();
        }

        //采集源说明
        $('#sourceExplain_val').val(allData.sourceExplain);
        //说明
        $('#comments_val').val(allData.comments);
        //任务启动时间
        if (allData.timeStart) {
            $('#ConfigTableModal').find('#data_val .ui-checkboxradio-label').eq(0).click();
            $("#timeStart").removeClass("hide");
            $("#regularyStart").addClass("hide");
            $("#timeStart_val").val(allData.timeStart);
        } else {
            $('#ConfigTableModal').find('#data_val .ui-checkboxradio-label').eq(1).click();
            $("#timeStart").addClass("hide");
            $("#regularyStart").removeClass("hide");
            $("#regularyStart_val").val(allData.regularyStart);
        }
        //创建人
        $('#creator_val').val(allData.creator);
        //创建时间
        $('#createtime_val').val(allData.createtime);
        //更新人
        $('#updator_val').val(allData.updator);
        //更新时间
        $('#udpatetime_val').val(allData.updatetime);
    };

    // 新建按钮点击事件
    $("#configAddBtn").on("click", function () {
        $("#ConfigTableModal").find(".viewConfigList").addClass("hide");
        $("#ConfigTableModal").find('.modal-footer button').removeClass("hide");
        $("#configLabel").html("数据采集配置新增");
        $(".aui-from-horizontal .s3t").addClass("hide");
        $('#ConfigTableModal').modal('show');

        removeDisabled();
        $("#sourceCode_val").removeClass("noCode");

        $('#ConfigTableModal').find('[id$=_val]').val('');
        $("#imgType_val").val('2');
        $("#imgType_val").selectmenu('refresh');
        $("#dbType_val").val('1');
        $("#dbType_val").selectmenu('refresh');
        $("#scheType_val").val('1');
        $("#scheType_val").selectmenu('refresh');
        $("#xhTableName_val").val('4');
        $('#xhTableName_val').selectmenu('refresh')
        var dt = new Date();
        $("#timeStart_val").val(dt.pattern("hh:mm:ss"));
        $('#ConfigTableModal').find('#dataType_val .ui-checkboxradio-label').eq(0).click();
        $('#ConfigTableModal').find('#data_val .ui-checkboxradio-label').eq(0).click();
        $('#ConfigTableModal').find('#source_val .ui-checkboxradio-label').eq(0).click();
        $("#timeStart").removeClass("hide");
        $("#regularyStart").addClass("hide");
        $("#data_val").addClass("addList"); //新建
        $("#data_val").removeClass("editList");
        $('#sourceCode_val').removeAttr("disabled");
        $('#ConfigTableModal').attr('taskid', '');
    });

    // 新建确认按钮点击事件
    $("#configModalSure").on('click', function () {
        if ($("#sourceCode_val").hasClass("noCode")) {
            settings.controlFlag = false;
            return;
        }
        $('#ConfigTableModal').find('[id$=_val]').removeClass('no-input-warning').closest('.control-form').find('.text-danger.tip').addClass('hide');
        settings.controlFlag = true;
        var bucketName = '',
            bucketUrl = '';

        // 任务id
        var id = $('#ConfigTableModal').attr('taskid');
        // 采集源编码
        var sourceCode = $.trim($('#sourceCode_val').val());
        // 表查询sql
        var querySql = $('#querySql_val').val();
        // 图片类型
        var imgType = $('#imgType_val').val();
        if (imgType == '1') { //s3
            bucketName = $("#bucketName_val").val();
            bucketUrl = $("#bucketUrl_val").val();
        }
        // 星火存储表
        var xhTableName = $('#xhTableName_val').val();
        // 库源类型
        var dbType = $('#dbType_val').val();
        //同步标识字段类型
        var scheType = $('#scheType_val').val();
        // 同步标识字段
        var scheColumn = $('#scheColumn_val').val();
        // 分页查询数
        var querySize = $('#querySize_val').val();
        // 数据源ip
        var sourceIp = $('#sourceIp_val').val();
        // 数据源端口
        var sourcePort = $('#sourcePort_val').val();
        // 用户名
        var userName = $('#userName_val').val();
        // 密码
        var password = $('#password_val').val();
        // 数据类型
        var dataType = $('#dataType_val').find('.ui-checkboxradio-checked').siblings('input').val();
        //采集源说明
        var sourceExplain = $("#sourceExplain_val").val();
        //说明
        var comments = $("#comments_val").val();

        var portData = {
            id: id ? id : '',
            sourceCode: sourceCode ? sourceCode : '',
            querySql: querySql ? querySql : '',
            imgType: imgType ? imgType : '',
            bucketName: bucketName ? bucketName : '',
            bucketUrl: bucketUrl ? bucketUrl : '',
            xhTableName: xhTableName ? xhTableName : '',
            dbType: dbType ? dbType : '',
            scheType: scheType ? scheType : '',
            scheColumn: scheColumn ? scheColumn : '',
            querySize: querySize ? querySize : '',
            sourceIp: sourceIp ? sourceIp : '',
            sourcePort: sourcePort ? sourcePort : '',
            userName: userName ? userName : '',
            password: password ? password : '',
            dataType: dataType ? Number(dataType) : '',
            sourceExplain: sourceExplain ? sourceExplain : '',
            comments: comments ? comments : ''
        }
        //任务启动时间
        var dateType = $("#data_val").find('.ui-checkboxradio-checked').siblings('input').val();
        // 数据源sid
        var source = $("#source_val").find('.ui-checkboxradio-checked').siblings('input').val();

        if (dateType == '1') { //定点启动
            var timeStart = $("#timeStart_val").val();
            portData.timeStart = timeStart;
            portData.regularyStart = '';
        } else {
            var regularyStart = $("#regularyStart_val").val();
            portData.regularyStart = regularyStart;
            portData.timeStart = '';
        }

        if (source == '1') { //定点启动
            var sourceSid = $("#sourceSid_val").val();
            portData.sourceSid = sourceSid;
            portData.sourceClusterName = '';
        } else {
            var sourceClusterName = $("#sourceClusterName_val").val();
            portData.sourceClusterName = sourceClusterName;
            portData.sourceSid = '';
        }

        //校验
        for (var item in portData) {
            if (portData[item] == '' && item != "id") {
                switch (item) {
                    case 'regularyStart':
                        if (dateType == '2') {
                            $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                            settings.controlFlag = false;
                        }
                        break;
                    case 'timeStart':
                        if (dateType == '1') {
                            $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                            settings.controlFlag = false;
                        }
                        break;
                    case 'sourceSid':
                        if (source == '1') {
                            $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                            settings.controlFlag = false;
                        }
                        break;
                    case 'sourceClusterName':
                        if (source == '2') {
                            $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                            settings.controlFlag = false;
                        }
                        break;
                    case 'sourceCode':
                        $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').html('请输入采集源编码');
                        $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                        settings.controlFlag = false;
                        break;
                    case 'bucketName':
                    case 'bucketUrl':
                        if (imgType == '1') {
                            $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
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
                $('#ConfigTableModal').modal('hide');
                createConfigList($('#tableListConfig'), $('#tableConfigListPagination'), true, 1, 10, settings.$objConfigList);
                $("#configMultiDeleteBtn").addClass("disabled");
                hideLoading($('#ConfigTableModal .modal-content'));
            } else {
                var tip = id ? '编辑失败,' + data.message : '新建失败,' + data.message;
                warningTip.say(tip);
                hideLoading($('#ConfigTableModal .modal-content'));
            }
        }
        if (settings.controlFlag) {
            showLoading($('#ConfigTableModal .modal-content'));
            loadData('v2/dataAcquis/editDbInfos', true, portData, portDataSuccessFunc);
        }
    });

    // 表格删除按钮点击事件
    $('#tableListConfig').on('click', 'td .aui-icon-delete-line', function () {
        $("#configTipLabel").html('是否删除?');
        $("#configTipModal").modal('show');
        settings.$deleteOpt = $(this).parents("tr").attr("taskid");
    });

    // 删除确定按钮点击事件
    $("#configModaldelectSure").on("click", function () {
        var port = 'v2/dataAcquis/delDbInfos',
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

    // 表格编辑按钮点击事件
    $('#tableListConfig').on('click', 'td .aui-icon-edit', function () {
        $("#ConfigTableModal").find(".viewConfigList").addClass("hide");
        $("#ConfigTableModal").find('.modal-footer button').removeClass("hide");
        $("#configLabel").html("数据采集配置编辑");
        $('#ConfigTableModal').modal('show');
        var taskid = $(this).closest('tr').attr('taskid'),
            allData = $(this).closest("tr").data("allData");
        removeDisabled();
        $("#sourceCode_val").removeClass("noCode");
        $("#data_val").addClass("editList"); //编辑
        $("#data_val").removeClass("addList");
        commonConfigOpt(allData);
        $('#ConfigTableModal').attr('taskid', taskid);
    });

    // 表格查看按钮点击事件
    $('#tableListConfig').on('click', 'td .aui-icon-file', function () {
        $("#ConfigTableModal").find(".viewConfigList").removeClass("hide");
        $("#ConfigTableModal").find('.modal-footer button').addClass("hide");
        $("#configLabel").html("数据采集配置查看");
        $('#ConfigTableModal').modal('show');
        var allData = $(this).closest("tr").data("allData");
        removeDisabled();
        commonConfigOpt(allData);
        searchDisabled();
    });

    // 搜索按钮点击事件
    $("#searchConfigList").on("click", function () {
        settings.$objConfigList.creator = $("#platform").val();
        settings.$objConfigList.imgType = $("#dataTypeSearch").val();
        settings.$objConfigList.dbType = $("#dbTypeSearch").val();
        settings.$objConfigList.sourceCode = $("#sourceCodeSearch").val();
        settings.$objConfigList.sourceExplain = $("#sourceExplainSearch").val();
        settings.$objConfigList.startTime = $("#startTime").val();
        settings.$objConfigList.endTime = $("#endTime").val();

        createConfigList($('#tableListConfig'), $('#tableConfigListPagination'), true, 1, 10, settings.$objConfigList);
        $("#configMultiDeleteBtn").addClass("disabled");
    });

    // 采集源编码唯一性和不能为空校验
    $("#sourceCode_val").on("blur", function () {
        var sourceCode = $(this).val();
        var that = this;
        if (sourceCode == '') {
            $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').html('请输入采集源编码');
            $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
            settings.controlFlag = false;
        } else {
            var port = 'v2/dataAcquis/dbInfos',
                portData = {
                    "page": 1,
                    "size": 10,
                    "sourceCode": sourceCode
                },
                successFunc = function (data) {
                    if (data.code == '200') {
                        if (data.data.list.length > 0) {
                            $(that).addClass('no-input-warning').addClass('noCode').closest('.control-form').find('.text-danger.tip').html('采集源编码已存在');
                            $(that).addClass('no-input-warning').addClass('noCode').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                            settings.controlFlag = false;
                        } else {
                            $(that).removeClass('no-input-warning').removeClass('noCode').closest('.control-form').find('.text-danger.tip').addClass('hide');
                            settings.controlFlag = true;
                        }
                    } else {
                        warningTip.say(data.msg);
                    }
                };
            loadData(port, true, portData, successFunc);
        }
    });

    $('#data_val').find('[data-role="radio"]').on("change", function () {
        if ($(this).val() == '1') { //定点启动
            if ($(this).closest("#data_val").hasClass("addList")) {
                var dt = new Date();
                $("#timeStart_val").val(dt.pattern("hh:mm:ss"));
            }
            $("#timeStart").removeClass("hide");
            $("#regularyStart").addClass("hide");
        } else { //定时启动
            $("#regularyStart").removeClass("hide");
            $("#timeStart").addClass("hide");
        }
    });

    $('#source_val').find('[data-role="radio"]').on("change", function () {
        if ($(this).val() == '1') { //数据源sid
            $("#sourceSid").removeClass("hide");
            $("#sourceClusterName").addClass("hide");
        } else { //定时启动
            $("#sourceClusterName").removeClass("hide");
            $("#sourceSid").addClass("hide");
        }
    });

    // 单个参数校验公共方法
    $('#ConfigTableModal').find('[id$=_val]').off('blur').on('blur', function () {
        $(this).removeClass('no-input-warning').closest('.control-form').find('.text-danger').addClass('hide');
        if ($(this).val().replace(/\s/g, '') === '') {
            $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
        } else {
            if ($(this).attr('id') == 'password_val') {
                if ($(this).val().length > 32) {
                    $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            } else if ($(this).attr('id') === 'sourcePort_val') {
                var resultTop = parseInt($(this).val());
                // 端口校验 端口范围0-65535
                var _reg = /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
                if (_reg.test($(this).val()) !== true) {
                    $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            } else if ($(this).attr('id') === 'sourceIp_val') {
                // IP校验
                var _reg = /^(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;
                if (_reg.test($(this).val()) !== true) {
                    $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            }
        }
    })

})(window, window.jQuery);