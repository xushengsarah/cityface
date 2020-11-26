(function (window, $) {
    var settings = {
        $objConfigList: { //厂家和对接平台类型默认
        },
        isSubmitLib: true,
        isSubmitLabel: true,
        orgLength: 0 //除根节点外的机构数量
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
    function createLibTableList($table, $pagination, first, page, number, param) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="9" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/portraitLib/libs',
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
                            // if (result[i].viewList) {
                            //     result[i].viewList.forEach((element, index) => {
                            //         if (index != result[i].viewList.length - 1) {
                            //             orgListHtml += element.orgName + ',';
                            //         } else {
                            //             orgListHtml += element.orgName;
                            //         }
                            //     });
                            // } else {
                            //     orgListHtml = '--';
                            // }
                            html += `<tr data-index="${i}" class="librow" taskId="${result[i].id}" libId="${result[i].libId}">
                                        <td> <a class="detail-icon" href="#"> <i class="fa fa-plus"></i> </a> </td>
                                        <td title="${result[i].libName || '--'}">${result[i].libName || '--'}</td>
                                        <td>${result[i].libId || '--'}</td>
                                        <td>${result[i].libDesc || '--'}</td>
                                        <td title="${result[i].creatorName ? (result[i].creatorName + '('+ result[i].orgName +')') : '--'}">${result[i].creatorName ? (result[i].creatorName + '('+ result[i].orgName +')') : '--'}</td>
                                        <td>${result[i].creator || '--'}</td>
                                        <td>${result[i].createtime || '--'}</td>
                                        <td title="${result[i].comments || '--'}">${result[i].comments || '--'}</td>
                                        <td class="operation">
                                            <i class="icon aui-icon-add aui-mr-sm" title="新增"></i>
                                            <i class="icon aui-icon-file aui-mr-sm" title="查看"></i>
                                            <i class="icon aui-icon-edit aui-mr-sm" title="编辑"></i>
                                            <i class="icon aui-icon-delete-line" title="删除"></i>
                                            <!--<i class="text-light aui-icon-video2 aui-mr-sm"></i>-->
                                        </td>
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
                        $tbody.html('<tr><td colspan="9" class="text-center">No matching records found</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="9" class="text-center">No matching records found</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, $.extend(portData, param), successFunc);
    }

    function createLabelLibList(rowListBut, $container, libId) {
        $container.closest("tbody").find('.detail-view').remove();
        $container.siblings().find(".fa-minus").removeClass("fa-minus").addClass("fa-plus");
        if (rowListBut) {
            $container.find(".fa").toggleClass("fa-minus").toggleClass("fa-plus");
        }
        var libId = libId;

        var port = 'v3/libLabel/childLabels',
            portData = {
                libId: libId,
                page: '1',
                size: '12',
            },
            successFunc = function (data) {
                hideLoading($container);
                if (data.code == '200') {
                    var result = data.data.list;
                    var _html = '';
                    _html = `<tr class="detail-view">
                                <td colspan="9">
                                    <div class="portraitLabelDetails">
                                        <table id="portraitLabelTable" data-toggle="table">
                                            <colgroup>
                                                <col width="3%">
                                                <col width="12%">
                                                <col width="6%">
                                                <col width="13%">
                                                <col width="13%">
                                                <col width="13%">
                                                <col width="13%">
                                                <col width="14%">
                                                <col width="12%" class="operation">
                                            </colgroup>
                                            <tbody>`
                    if (result.length > 0) {
                        for (var i = 0; i < result.length; i++) {
                            _html += `<tr data-index="${i}" class="labelrow" taskId="${result[i].id}" labelId="${result[i].labelId}">
                                    <td></td>
                                    <td title="${result[i].labelName || '--'}">${result[i].labelName || '--'}</td>
                                    <td>${result[i].labelId || '--'}</td>
                                    <td>--</td>
                                    <td title="${result[i].creatorName ? (result[i].creatorName + '('+ result[i].orgName +')') : '--'}">${result[i].creatorName ? (result[i].creatorName + '('+ result[i].orgName +')') : '--'}</td>
                                    <td>${result[i].creator || '--'}</td>
                                    <td>${result[i].createtime || '--'}</td>
                                    <td title="${result[i].comments || '--'}">${result[i].comments || '--'}</td>
                                    <td>
                                        <i class="icon aui-icon-file aui-mr-sm" title="查看"></i>
                                        <i class="icon aui-icon-edit aui-mr-sm" title="编辑"></i>
                                        <i class="icon aui-icon-delete-line" title="删除"></i>
                                        <!--<i class="text-light aui-icon-video2 aui-mr-sm"></i>-->
                                    </td>
                                </tr>`
                        }
                    } else {
                        _html += `<tr>暂无子标签数据</tr>`;
                    }
                    _html += `</tbody></table></div></td></tr>`;
                    $container.after(_html);

                    $('#portraitLibTable').find("#portraitLabelTable tr").each(function (index, el) {
                        $(el).data({
                            'listData': result[index]
                        });
                    })
                }
            }
        if ($container.find(".fa").hasClass('fa-minus')) {
            showLoading($container);
            loadData(port, true, portData, successFunc);
        }
    };

    /**
     * 编辑查看公用代码
     * @param {*} listData 列数据
     */
    function libConfigOpt(listData) {
        $('#portraitLibModal').find('[id$=_val]').removeClass('no-input-warning').val('').closest('.aui-col-18').find('.text-danger').addClass('hide');

        // 库编码
        $('#libId_val').val(listData.libId);
        // 库名称
        $('#libName_val').val(listData.libName);
        $('#libName_val').attr('title', listData.libName);
        // 库描述
        $('#libDesc_val').val(listData.libDesc);
        // 库类型
        if (listData.type == '1') {
            $('#portraitLibModal').find('#type_val .ui-checkboxradio-label').eq(0).click();
        } else {
            $('#portraitLibModal').find('#type_val .ui-checkboxradio-label').eq(1).click();
        }
        // 允许布控类型
        $('#isDistAll_val').val(listData.isDistAll);
        $('#isDistAll_val').selectmenu('refresh');
        // 更新人
        $('#updator_val').val(listData.updator);
        // 创建时间
        $('#udpatetime_val').val(listData.updatetime);
        // 备注/说明
        $('#comments_val').val(listData.comments);
    };

    // 编辑查看公用代码
    function labelConfigOpt(listData) {
        $('#ConfigModal').find('[id$=_value]').removeClass('no-input-warning').val('').closest('.aui-col-18').find('.text-danger').addClass('hide');

        // 人像库id
        $('#libName_value').val(listData.libName);
        $('#libName_value').attr('title', listData.libName);
        // 子库（标签）id
        $('#labelId_value').val(listData.labelId);
        // 子库（标签）名
        $('#labelName_value').val(listData.labelName);
        $('#labelName_value').attr('title', listData.labelName);
        // 备注/说明
        $('#comments_value').val(listData.comments);
        // 更新人
        $('#updator_value').val(listData.updator);
        // 创建时间
        $('#udpatetime_value').val(listData.updatetime);
    };

    //初始化
    function initControlConfig() {
        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });
        $('#isDistAll_val').selectmenu();
        settings.$objConfigList.type = 1;
        createLibTableList($('#portraitLibTable'), $('#portraitLibPagination'), true, 1, 12, settings.$objConfigList);
    };

    initControlConfig();

    // 子标签详情点击事件
    $("#portraitLibTable").on("click", ".detail-icon", function () {
        // 表格列表点击详情按钮展开详情内容
        var $this = $(this),
            $targetRow = $this.closest('tr'),
            targetData = $targetRow.data('listData');

        createLabelLibList($this, $targetRow, targetData.libId);
    })

    $("#typeValBut").on("click", ".nav-link", function () {
        settings.$objConfigList.type = $(this).closest('.nav-item').index() + 1;
        createLibTableList($('#portraitLibTable'), $('#portraitLibPagination'), true, 1, 12, settings.$objConfigList);
    })

    // 搜索按钮点击事件
    $("#searchPLMBut").on("click", function () {
        settings.$objConfigList.libName = $("#libNameVal").val();
        settings.$objConfigList.startTime = $("#startTimePLM").val();
        settings.$objConfigList.endTime = $("#endTimePLM").val();

        createLibTableList($('#portraitLibTable'), $('#portraitLibPagination'), true, 1, 12, settings.$objConfigList);
    });

    // 库 新建按钮点击事件
    $("#configAddBtn").on("click", function () {
        settings.isSubmitLib = true;
        //初始化
        $('#portraitLibModal').find('[id$=_val]').removeClass('no-input-warning').val('').removeAttr("disabled").closest('.aui-col-18').find('.text-danger').addClass('hide');
        $('#portraitLibModal').find("input[type=radio]").removeAttr("disabled"); // 单选框可编辑
        $('#isDistAll_val').val('1');
        $('#isDistAll_val').selectmenu('refresh');

        $(".viewConfigList").addClass("hide"); //更新人、更新时间隐藏
        $(".IDType").removeClass("hide"); //库id和库类型

        $("#portraitLibModal").find('.modal-footer button').removeClass("hide"); // 按钮放开
        $("#portraitLibHead").html("人像库配置新增");
        $('#portraitLibModal').modal('show');
        $('#portraitLibModal').attr('taskId', '');

        // $('#type_val').find("input[type=radio]").removeAttr("disabled");
        if ($('#typeValBut').find('.nav-link').eq(0).hasClass('active')) {
            $('#type_val').find('.ui-checkboxradio-label').eq(0).click(); // 单选框恢复默认;
        } else {
            $('#type_val').find('.ui-checkboxradio-label').eq(1).click(); // 单选框恢复默认;
        }
        // $('#type_val').find("input[type=radio]").attr("disabled", "disabled");

        showLoading($('#libId_val').closest('.aui-col-18'));
        var port = 'v3/portraitLib/maxLibId',
            successFunc = function (data) {
                hideLoading($('#libId_val').closest('.aui-col-18'));
                if (data.code === '200') {
                    $('#libId_val').val(data.libId);
                }
            }
        loadData(port, true, {}, successFunc, '', 'GET');
    });

    $('#type_val').on('click', '.ui-checkboxradio-label', function () {
        if ($(this).closest('.aui-col-12').find('input').attr('disabled')) {
            return;
        }
        if ($(this).closest('.aui-col-12').find('input').val() == '1') {
            $('#portraitLibModal').find('.isDistAll').addClass('hide');
        } else {
            $('#portraitLibModal').find('.isDistAll').removeClass('hide');
        }
    })

    // 库 新建确认按钮点击事件
    $("#portraitLibSure").on('click', function () {
        // 任务id
        var id = $('#portraitLibModal').attr('taskId');
        // 库编码
        var libId = $.trim($('#libId_val').val());
        // 库描述
        var libName = $('#libName_val').val();
        // 库类型
        var type = $('#type_val').find('.ui-checkboxradio-checked').siblings('input').val();
        // 允许布控类型
        if (type == '1') {
            var isDistAll = '';
        } else {
            var isDistAll = $('#isDistAll_val').val();
        }
        // 备注/说明
        var comments = $('#comments_val').val();

        var portData = {
            id: id ? id : '',
            libId: libId ? libId : '',
            libName: libName ? libName : '',
            type: type ? type : '',
            isDistAll: isDistAll ? isDistAll : '',
            comments: comments ? comments : ''
        }

        // 校验
        for (var item in portData) {
            if (portData[item] == '' && item !== "id" && item !== "comments" && item !== 'isDistAll') {
                $('#' + item + '_val').addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip').removeClass('hide');
                settings.isSubmitLib = false;
            }
        }

        if ($('#portraitLibModal').find('[id$=_val]').hasClass('no-input-warning')) {
            settings.isSubmitLib = false;
        }

        var portDataSuccessFunc = function (data) {
            if (data.code === '200') {
                $('#portraitLibModal').modal('hide');
                createLibTableList($('#portraitLibTable'), $('#portraitLibPagination'), true, 1, 12, settings.$objConfigList);
                hideLoading($('#portraitLibModal .modal-content'));
            } else {
                var tip = id ? '编辑失败,' + data.message : '新建失败,' + data.message;
                warningTip.say(tip);
                hideLoading($('#portraitLibModal .modal-content'));
            }
        }
        if (settings.isSubmitLib) {
            showLoading($('#portraitLibModal .modal-content'));
            loadData('v3/portraitLib/editLibs', true, portData, portDataSuccessFunc);
        }
    });

    // 标签 新建确认按钮点击事件
    $("#portraitLabelSure").on('click', function () {
        // 任务id
        var id = $('#portraitLabelModal').data('taskId');
        // 人像库id
        var libId = $('#portraitLabelModal').data('libId');
        // 行index
        var index = $('#portraitLabelModal').data('index');
        // 子库（标签）id
        var labelId = $.trim($('#labelId_value').val());
        // 子库（标签）名
        var labelName = $('#labelName_value').val();
        // 备注/说明
        var comments = $('#comments_value').val();

        var portData = {
            id: id ? id : '',
            labelId: labelId ? labelId : '',
            labelName: labelName ? labelName : '',
            libId: libId ? libId : '',
            comments: comments ? comments : ''
        }

        // 校验
        for (var item in portData) {
            if (portData[item] == '' && item != "id" && item != "comments") {
                $('#' + item + '_value').addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip').removeClass('hide');
                settings.isSubmitLabel = false;
            }
        }

        if ($('#portraitLabelModal').find('[id$=_value]').hasClass('no-input-warning')) {
            settings.isSubmitLabel = false;
        }

        var portDataSuccessFunc = function (data) {
            if (data.code === '200') {
                $('#portraitLabelModal').modal('hide');
                createLabelLibList('', $('#portraitLibTable').find('.librow').eq(index), libId);
                hideLoading($('#portraitLabelModal .modal-content'));
            } else {
                var tip = id ? '编辑失败,' + data.message : '新建失败,' + data.message;
                warningTip.say(tip);
                hideLoading($('#portraitLabelModal .modal-content'));
            }
        }
        if (settings.isSubmitLabel) {
            showLoading($('#portraitLabelModal .modal-content'));
            loadData('v3/libLabel/editChildLabels', true, portData, portDataSuccessFunc);
        }
    });

    // 库 表格新增按钮点击事件
    $('#portraitLibTable').on('click', '.librow .aui-icon-add', function () {
        settings.isSubmitLabel = true;
        var listData = $(this).closest("tr").data("listData");
        $("#portraitLabelModal").find('.modal-footer button').removeClass("hide");
        $('#portraitLabelModal').find(".viewConfigList").addClass("hide"); //更新人、更新时间隐藏
        $("#portraitLabelHead").html("子库/标签新增");
        $('#portraitLabelModal').modal('show');
        var index = $(this).closest("tr").index();
        $('#portraitLabelModal').data({
            taskId: '',
            libId: listData.libId,
            index: index
        });

        //初始化
        $('#portraitLabelModal').find('[id$=_value]').removeClass('no-input-warning').val('').removeAttr("disabled").closest('.aui-col-18').find('.text-danger').addClass('hide');
        $('#libName_value').val(listData.libName);
        $('#libName_value').attr('disabled', 'disabled');
        $('#isDistAll_val').selectmenu('enable');

        showLoading($('#labelId_value').closest('.aui-col-18'));
        var port = 'v3/libLabel/maxChildLabelId',
            successFunc = function (data) {
                hideLoading($('#labelId_value').closest('.aui-col-18'));
                if (data.code === '200') {
                    $('#labelId_value').val(data.labelId);
                }
            }
        loadData(port, true, {
            libId: listData.libId
        }, successFunc, '', 'GET');
    });

    // 库 表格查看按钮点击事件
    $('#portraitLibTable').on('click', '.librow .aui-icon-file', function () {
        var listData = $(this).closest("tr").data("listData");
        $("#portraitLibModal .viewConfigList").removeClass("hide");

        $('#portraitLibModal .form-group').find("[id$=_val]").attr("disabled", "disabled");
        $('#portraitLibModal .form-group').find("input[type=radio]").removeAttr("disabled");
        $('#isDistAll_val').selectmenu('disable');

        libConfigOpt(listData);
        $('#portraitLibModal .form-group').find("input[type=radio]").attr("disabled", "disabled");

        $("#portraitLibModal").find('.modal-footer button').addClass("hide");
        $("#portraitLibHead").html("人像库配置查看");
        $('#portraitLibModal').modal('show');
    });

    // 库 表格编辑按钮点击事件
    $('#portraitLibTable').on('click', '.librow .aui-icon-edit', function () {
        $('#portraitLibModal').find('[id$=_val]').removeClass('no-input-warning').closest('.aui-col-18').find('.text-danger').addClass('hide');
        settings.isSubmitLib = true;
        var taskId = $(this).closest('tr').attr('taskId'),
            listData = $(this).closest("tr").data("listData");
        $("#portraitLibModal .viewConfigList").addClass("hide");

        $('#portraitLibModal .form-group').find("[id$=_val]").removeAttr("disabled");
        $('#portraitLibModal .form-group').find("input[type=radio]").removeAttr("disabled");
        $('#isDistAll_val').selectmenu('enable');
        libConfigOpt(listData);
        $('#type_val').find("input[type=radio]").attr("disabled", "disabled");
        $('#libId_val').attr("disabled", "disabled");

        $("#portraitLibModal").find('.modal-footer button').removeClass("hide");
        $("#portraitLibHead").html("人像库配置编辑");
        $('#portraitLibModal').modal('show');
        $('#portraitLibModal').attr('taskId', taskId);
    });

    // 标签 表格查看按钮点击事件
    $('#portraitLibTable').on('click', '#portraitLabelTable td .aui-icon-file', function () {
        $("#portraitLabelModal").find('.modal-footer button').addClass("hide");
        $("#portraitLabelModal").find('.viewConfigList').removeClass("hide");
        $("#portraitLabelModal").find('.IDType').removeClass("hide");
        $("#portraitLabelHead").html("子库/标签查看");
        $('#portraitLabelModal').modal('show');

        var listData = $(this).closest("tr").data("listData");
        labelConfigOpt(listData);

        $('#portraitLabelModal').find('[id$=_value]').removeClass('no-input-warning').closest('.aui-col-18').find('.text-danger').addClass('hide');
        $('#portraitLabelModal').find("[id$=_value]").attr("disabled", "disabled");
    });

    // 标签 表格编辑按钮点击事件
    $('#portraitLibTable').on('click', '#portraitLabelTable td .aui-icon-edit', function () {
        settings.isSubmitLabel = true;
        $("#portraitLabelModal").find('.modal-footer button').removeClass("hide");
        $("#portraitLabelModal").find(".viewConfigList").addClass("hide");
        $("#portraitLabelModal").find(".IDType").addClass("hide");
        $("#portraitLabelHead").html("子库/标签编辑");
        $('#portraitLabelModal').modal('show');

        $('#portraitLabelModal').find('[id$=_value]').removeClass('no-input-warning').closest('.aui-col-18').find('.text-danger').addClass('hide');
        $('#portraitLabelModal').find("[id$=_value]").removeAttr("disabled");
        $('#libName_value').attr('disabled', 'disabled');
        $('#labelId_value').attr('disabled', 'disabled');

        var listData = $(this).closest("tr").data("listData"),
            index = $(this).closest("tr").index();
        labelConfigOpt(listData);
        $('#portraitLabelModal').data({
            taskId: listData.id,
            libId: listData.libId,
            index: index
        });
    });

    // 库 表格删除按钮点击事件
    $('#portraitLibTable').on('click', '.librow .aui-icon-delete-line', function () {
        $("#configTipLabel").html('是否删除?');
        $("#configTipModal").modal('show');
        var listData = $(this).closest("tr").data("listData");
        $("#configTipModal").data({
            type: 'lib',
            libId: listData.libId
        });
    });

    // 标签 表格删除按钮点击事件
    $('#portraitLibTable').on('click', '#portraitLabelTable td .aui-icon-delete-line', function () {
        $("#configTipLabel").html('是否删除?');
        $("#configTipModal").modal('show');
        var listData = $(this).closest("tr").data("listData");
        var index = $('#portraitLibTable').find('.detail-view').prev().index();
        $("#configTipModal").data({
            type: 'label',
            taskId: listData.id,
            libId: listData.libId,
            labelId: listData.labelId,
            index: index
        });
    });

    // 库 删除确定按钮点击事件
    $("#configTipDeletedSure").on("click", function () {
        var type = $("#configTipModal").data('type');
        var libId = $("#configTipModal").data('libId');
        if (type == 'lib') { // 库删除
            var port = 'v3/portraitLib/delLibs',
                portData = {
                    libId: libId
                },
                successFunc = function (data) {
                    if (data.code == '200') {
                        $('#configTipModal').modal('hide');
                        createLibTableList($('#portraitLibTable'), $('#portraitLibPagination'), true, 1, 12, settings.$objConfigList);
                    } else {
                        warningTip.say(data.message);
                    }
                };
            loadData(port, true, portData, successFunc, undefined, 'DELETE');
        } else { // 标签删除
            var index = $("#configTipModal").data('index');
            var taskId = $("#configTipModal").data('taskId');
            var labelId = $("#configTipModal").data('labelId');
            var port = 'v3/libLabel/delChildLabels',
                portData = {
                    ids: [taskId],
                    libId: libId,
                    labelId: labelId
                },
                successFunc = function (data) {
                    if (data.code == '200') {
                        $('#configTipModal').modal('hide');
                        createLabelLibList('', $('#portraitLibTable').find('.librow').eq(index), libId);
                    } else {
                        warningTip.say(data.message);
                    }
                };
            loadData(port, true, portData, successFunc);
        }
    });

    // 单个参数校验公共方法
    $('#portraitLibModal').find('[id$="_val"]').off('blur').on('blur', function () {
        $(this).removeClass('no-input-warning').closest('.aui-col-18').find('.text-danger').addClass('hide');
        if ($(this).val().replace(/\s/g, '') === '' && $(this).attr('id') !== 'type_val' && $(this).attr('id') !== 'comments_val') {
            $(this).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip').removeClass('hide');
        } else {
            if ($(this).attr('id') == 'libId_val') {
                var libId = $.trim($(this).val());
                var that = this;
                if (libId != '') {
                    if (libId.substr(0, 1) == '0') {
                        $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').html('首位不为0');
                        $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').removeClass('hide');
                        settings.isSubmitLabel = false;
                        return;
                    }
                    if (100 <= parseInt(libId) && parseInt(libId) <= 1000) {
                        var port = 'v3/portraitLib/checkLibId',
                            portData = {
                                libId: libId
                            },
                            successFunc = function (data) {
                                if (data.code == '200') {
                                    $(that).removeClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').addClass('hide');
                                    settings.isSubmitLib = true;
                                } else {
                                    $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').html('库编码已存在');
                                    $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').removeClass('hide');
                                    settings.isSubmitLib = false;
                                }
                            };
                        loadData(port, true, portData, successFunc, '', 'GET');
                    } else {
                        $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').html('库编码的范围在100到1000');
                        $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').removeClass('hide');
                        settings.isSubmitLib = false;
                    }
                }
            } else if ($(this).attr('id') == 'libName_val') {
                var libName = $.trim($(this).val());
                var that = this;
                if (libName != '' && !$('#portraitLibHead').text().indexOf('编辑')) {
                    var port = 'v3/portraitLib/libs',
                        portData = {
                            libName: libName,
                            page: 1,
                            size: 30
                        },
                        successFunc = function (data) {
                            var result = data.data.list;
                            if (data.code == '200' && result) {
                                if (result.length == 0) {
                                    $(that).removeClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').addClass('hide');
                                    settings.isSubmitLib = true;
                                } else {
                                    for (var i = 0; i < result.length; i++) {
                                        if (result[i].libName == libName) {
                                            $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').html('库名称已存在');
                                            $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').removeClass('hide');
                                            settings.isSubmitLib = false;
                                        }
                                    }
                                }
                            } else {
                                $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').html('校验失败请稍后再试');
                                $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').removeClass('hide');
                                settings.isSubmitLib = false;
                            }
                        };
                    loadData(port, true, portData, successFunc);
                }
            }
        }
    })

    // 单个参数校验公共方法
    $('#portraitLabelModal').find('[id$="_value"]').off('blur').on('blur', function () {
        $(this).removeClass('no-input-warning').closest('.aui-col-18').find('.text-danger').addClass('hide');
        if ($(this).val().replace(/\s/g, '') === '' && $(this).attr('id') !== 'comments_value') {
            $(this).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip').removeClass('hide');
        } else {
            var libId = $('#portraitLabelModal').data('libId');
            if ($(this).attr('id') == 'labelId_value') {
                var labelId = $.trim($(this).val());
                var that = this;
                if (labelId != '') {
                    if (labelId.substr(0, 1) == '0') {
                        $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').html('首位不为0');
                        $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').removeClass('hide');
                        settings.isSubmitLabel = false;
                        return;
                    }
                    if (1 <= parseInt(labelId) && parseInt(labelId) <= 1000) {
                        var port = 'v3/libLabel/childLabels',
                            portData = {
                                libId: libId,
                                labelId: labelId,
                                page: 1,
                                size: 10
                            },
                            successFunc = function (data) {
                                if (data.code == '200' && data.data.total == '0') {
                                    $(that).removeClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').addClass('hide');
                                    settings.isSubmitLabel = true;
                                } else {
                                    $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').html('标签编码已存在');
                                    $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').removeClass('hide');
                                    settings.isSubmitLabel = false;
                                }
                            };
                        loadData(port, true, portData, successFunc);
                    } else {
                        $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').html('标签编码的范围在1到1000');
                        $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').removeClass('hide');
                        settings.isSubmitLabel = false;
                    }
                }
            } else if ($(this).attr('id') == 'labelName_value') {
                var labelName = $.trim($(this).val());
                var that = this;
                if (labelName != '' && !$('#portraitLabelHead').text().indexOf('编辑')) {
                    var port = 'v3/libLabel/childLabels',
                        portData = {
                            libId: libId,
                            labelName: labelName,
                            page: 1,
                            size: 30
                        },
                        successFunc = function (data) {
                            var result = data.data.list;
                            if (data.code == '200' && result) {
                                if (result.length == 0) {
                                    $(that).removeClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').addClass('hide');
                                    settings.isSubmitLib = true;
                                } else {
                                    for (var i = 0; i < result.length; i++) {
                                        if (result[i].labelName == labelName) {
                                            $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').html('标签名称已存在');
                                            $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').removeClass('hide');
                                            settings.isSubmitLib = false;
                                        }
                                    }
                                }
                            } else {
                                $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').html('校验失败请稍后再试');
                                $(that).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').removeClass('hide');
                                settings.isSubmitLabel = false;
                            }
                        };
                    loadData(port, true, portData, successFunc);
                }
            }
        }
    })

})(window, window.jQuery);