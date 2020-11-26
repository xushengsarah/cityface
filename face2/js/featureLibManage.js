(function (window, $) {
    var settings = {
        configTableCounts: 0, //列表已选数量
        $deleteOpt: '', //列表删除操作需要的taskid
        $deleteOptType: '', //列表删除操作需要的type
        $deleteOptFactoryLibId: '', //列表删除操作需要的FactoryLibId
        $deleteOptPlatformId: '', //列表删除操作需要的PlatformId
        $factoryLibId: '',
        $objConfigList: { //厂家和对接平台类型默认
            'type': '1',
            'platType': ''
        },
        controlFlag: true,
        $platID: []
    };

    initControlConfig();

    //初始化
    function initControlConfig() {
        $("#cjType").selectmenu();
        $("#platType").selectmenu();
        $("#type_val").selectmenu();
        $("#platType_val").selectmenu();
        $("#platformIdVal").selectmenu();
        $("#platformId_val").selectmenu();
        $("#dockCodeVal").selectmenu();
        $("#dockCode_val").selectmenu();
        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });
        loadSearchPlatID();
        loadDockCodeID();
    };

    /**
     * 算法厂家ID的下拉选择
     */
    function loadSearchPlatID() {
        var port = 'v2/algoManufact/allManufactures',
            data = {
                type: 1
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    var result = data.data;
                    if (result && result.length) {
                        var itemHtml = '';
                        var itemHtmlID = `<option class="option-item" value="" selected>全部</option>`;
                        for (var i = 0; i < result.length; i++) {
                            itemHtml += `<option class="option-item" value="${result[i].platformId}">${result[i].platformName}</option>`;
                            itemHtmlID += `<option class="option-item" value="${result[i].platformId}">${result[i].platformName}</option>`;
                        }
                        settings.$platID = result;
                        $("#platformId_val").empty().append(itemHtml);
                        $("#platformId_val").selectmenu('refresh');
                        $("#platformIdVal").empty().append(itemHtmlID);
                        $("#platformIdVal").selectmenu('refresh');

                        createConfigList($('#tableListConfig'), $('#tableConfigListPagination'), true, 1, 10, settings.$objConfigList);
                    }
                }
            };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };

    /**
     * 对接平台唯一编码的下拉选择
     */
    function loadDockCodeID() {
        var port = 'v2/algoManufact/allManufactures',
            data = {
                type: 1
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    var result = data.data;
                    if (result && result.length) {
                        var itemHtml = '';
                        for (var i = 0; i < result.length; i++) {
                            if (!i) {
                                itemHtml += `<option class="option-item" value="${result[i].platformId}" selected>${result[i].platformName}</option>`;
                            } else {
                                itemHtml += `<option class="option-item" value="${result[i].platformId}">${result[i].platformName}</option>`;
                            }
                        }
                        $("#dockCode_val").empty().append(itemHtml);
                        $("#dockCode_val").selectpicker({
                            allowClear: false
                        });
                        $("#dockCode_val").selectpicker('refresh');

                        $("#dockCodeVal").empty().append(itemHtml);
                        $("#dockCodeVal").selectpicker({
                            allowClear: false
                        });
                        $("#dockCodeVal").selectpicker('refresh');
                    } else {
                        $("#dockCode_val").prop('disabled', true);
                        $("#dockCode_val").val(null);
                        $("#dockCode_val").selectpicker('refresh');

                        $("#dockCodeVal").prop('disabled', true);
                        $("#dockCodeVal").val(null);
                        $("#dockCodeVal").selectpicker('refresh');
                    }
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
    function createConfigList($table, $pagination, first, page, number, param) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="10" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v2/featureLib/libs',
            portData = {
                "page": page ? page : 1,
                "size": number ? number : 10,
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
                            html += `<tr data-index="${i}" class="" taskid="${result[i].id}" libId="${result[i].libId}" platformId="${result[i].platformId}">
									<!--<td class="bs-checkbox ">
										<div class="table-checkbox">
											<input data-index="0" name="btSelectItem" type="checkbox" value="0" class="table-checkbox-input table-checkbox-input-configDetail">
											<span class="table-checkbox-label"></span>
										</div>
                                    </td>-->
                                    <td>${result[i].libName || '--'}</td>
                                    <td>${result[i].libDesc || '--'}</td>`;
                            var errorID = true;
                            settings.$platID.forEach(element => {
                                if (element.platformId == result[i].platformId) {
                                    errorID = false;
                                    html += `<td>${element.platformName}</td>`;
                                }
                            });
                            if (errorID) {
                                html += `<td>--</td>`;
                            }
                            html += `<td>${result[i].platType == '1' ? '内部平台' : '外部平台' || '--'}</td>
                                    <td>${result[i].creator || '--'}</td>
                                    <td>${result[i].createtime || '--'}</td>
                                    <td>${result[i].updator || '--'}</td>
                                    <td>${result[i].udpatetime || '--'}</td>
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
                                //settings.$deleteOpt = [];
                                settings.configTableCounts = 0;
                                $("#configTableCounts").html(settings.configTableCounts);
                                $("#configMultiDeleteBtn").addClass("disabled");
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                        hideLoading($table);
                    } else {
                        $tbody.html('<tr><td colspan="10" class="text-center">No matching records found</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="10" class="text-center">No matching records found</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, $.extend(portData, param), successFunc);
    }

    // 编辑查看公用代码
    function commonConfigOpt(allData) {
        $('#featureLibModal').find('[id$=_val]').removeClass('no-input-warning').val('').closest('.control-form').find('.text-danger.tip').addClass('hide');

        // 库ID
        $('#libId_val').val(allData.libId);
        // 算法厂家ID
        $('#platformId_val').val(allData.platformId);
        $("#platformId_val").selectmenu('refresh');
        // 厂家配置类型
        $('#type_val').val(allData.type);
        $("#type_val").selectmenu('refresh');
        // 对接平台类型
        $('#platType_val').val(allData.platType);
        $("#platType_val").selectmenu('refresh');
        // 对接平台唯一编码
        $('#dockCode_val').val(allData.dockCode);
        $("#dockCode_val").selectmenu('refresh');
        // 库名称
        $('#libName_val').val(allData.libName);
        // 库描述
        $('#libDesc_val').val(allData.libDesc);
        // 备注/说明
        $('#comments_val').val(allData.comments);
        //创建人
        $('#creator_val').val(allData.creator);
        //创建时间
        $('#createtime_val').val(allData.createtime);
        //更新人
        $('#updator_val').val(allData.updator);
        //创建时间
        $('#udpatetime_val').val(allData.updatetime);
    };

    // 新建按钮点击事件
    $("#configAddBtn").on("click", function () {
        $("#featureLibModal").find(".modal-footer button").removeClass("hide");
        $("#featureLibModal").find(".viewConfigList").addClass("hide"); //更新人、更新时间隐藏
        $("#featureLibModal").find(".IDType").removeClass("hide"); //库id和厂家算法id
        // $("#featureLibModal").find(".s3t").removeClass("hide");
        $("#featureLibLabel").html("厂家特征库新增");
        $('#featureLibModal').modal('show');

        $('#featureLibModal').find('[id$=_val]').removeClass('no-input-warning').val('').removeAttr("disabled").closest('.control-form').find('.text-danger.tip').addClass('hide');

        $("#data_val").addClass("addList"); //新建
        $("#data_val").removeClass("editList");

        $("#platType_val").selectmenu('enable');
        $("#dockCode_val").selectmenu('enable');
        $("#platformId_val").selectmenu('enable');

        $("#type_val").val('1');
        $("#type_val").selectmenu('refresh');
        $("#platType_val").val('1');
        $("#platType_val").selectmenu('refresh');
        $("#platformId_val").val('6');
        $("#platformId_val").selectmenu('refresh');

        $('#featureLibModal').attr('taskid', '');
    });

    // 新建确认按钮点击事件
    $("#configModalSure").on('click', function () {
        $('#featureLibModal').find('[id$=_val]').removeClass('no-input-warning').closest('.control-form').find('.text-danger.tip').addClass('hide');
        settings.controlFlag = true;

        // 任务id
        var id = $('#featureLibModal').attr('taskid');
        // 库ID
        var libId = $.trim($('#libId_val').val());
        // 算法厂家ID
        var platformId = $.trim($('#platformId_val').val());
        // 厂家配置类型
        var type = $('#type_val').val();
        // 对接平台类型
        var platType = $('#platType_val').val();
        // 对接平台类型
        var dockCode = $('#dockCode_val').val();
        // 库名称
        var libName = $('#libName_val').val();
        //库描述
        var libDesc = $('#libDesc_val').val();
        // 备注/说明
        var comments = $('#comments_val').val();

        var portData = {
            id: id ? id : '',
            libId: libId ? libId : '',
            platformId: platformId ? platformId : '',
            type: type ? type : '',
            platType: platType ? platType : '',
            libName: libName ? libName : '',
            libDesc: libDesc ? libDesc : '',
            dockCode: dockCode ? dockCode : '',
            comments: comments ? comments : ''
        }

        if (id) {
            portData.factoryLibId = settings.$factoryLibId;
        }
        //校验
        for (var item in portData) {
            if (portData[item] == '' && item != "id") {
                switch (item) {
                    case 'libId':
                        $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').html('请输入库ID');
                        $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                        settings.controlFlag = false;
                        break;
                    case 'platformId':
                        $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').html('请输入算法厂家ID');
                        $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                        settings.controlFlag = false;
                        break;
                    default:
                        $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                        settings.controlFlag = false;
                }
            }
        }

        $('#featureLibModal').find('.text-danger').each(function (index, item) {
            // 如果有字段未通过验证
            if (!$(item).hasClass('hide')) {
                settings.controlFlag = false;
            }
        })

        var port = 'v2/featureLib/libs',
            portData1 = {
                "page": 1,
                "size": 10,
                "platformId": $("#platformId_val").val(),
                "libId": $("#libId_val").val(),
                "type": $("#type_val").val(),
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    if (data.data.list.length > 0) {
                        settings.controlFlag = false;
                        $("#libId_val").addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').html('库ID+算法厂家ID已存在');
                        $("#libId_val").addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                        $("#platformId_val").addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').html('库ID+算法厂家ID已存在');
                        $("#platformId_val").addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                    }
                } else {
                    warningTip.say(data.msg);
                }
            };
        loadData(port, true, portData1, successFunc);

        var port = 'v2/featureLib/libs',
            portData1 = {
                "page": 1,
                "size": 10,
                "dockCode": $("#dockCode_val").val(),
                "type": $("#type_val").val(),
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    if (data.data.list.length > 0) {
                        $("#dockCode_val").addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').html('对接平台唯一编码已存在');
                        $("#dockCode_val").addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                    }
                } else {
                    warningTip.say(data.msg);
                }
            };
        loadData(port, true, portData1, successFunc);

        var portDataSuccessFunc = function (data) {
            if (data.code === '200') {
                $('#featureLibModal').modal('hide');
                createConfigList($('#tableListConfig'), $('#tableConfigListPagination'), true, 1, 10, settings.$objConfigList);
                //settings.$deleteOpt = [];
                settings.configTableCounts = 0;
                $("#configTableCounts").html(settings.configTableCounts);
                $("#configMultiDeleteBtn").addClass("disabled");
                hideLoading($('#featureLibModal .modal-content'));
            } else {
                var tip = id ? '编辑失败,' + data.message : '新建失败,' + data.message;
                warningTip.say(tip);
                hideLoading($('#featureLibModal .modal-content'));
            }
        }

        if (settings.controlFlag) {
            settings.controlFlag = true;
            showLoading($('#featureLibModal .modal-content'));
            loadData('v2/featureLib/editLib', true, portData, portDataSuccessFunc);
        }
    });

    // 表格删除按钮点击事件
    $('#tableListConfig').on('click', 'td .aui-icon-delete-line', function () {
        $("#configTipLabel").html('是否删除?');
        $("#featureLibTipModal").modal('show');

        //settings.$deleteOpt = [];
        settings.$deleteOpt = $(this).parents("tr").attr("taskid");
        settings.$deleteOptType = $(this).closest("tr").data("allData").type;
        settings.$deleteOptFactoryLibId = $(this).closest("tr").data("allData").factoryLibId;
        settings.$deleteOptPlatformId = $(this).closest("tr").data("allData").platformId;
    });

    // 删除确定按钮点击事件
    $("#configModaldelectSure").on("click", function () {
        var port = 'v2/featureLib/delLib',
            portData = {
                "id": settings.$deleteOpt,
                "type": settings.$deleteOptType,
                "factoryLibId": settings.$deleteOptFactoryLibId,
                "platformId": settings.$deleteOptPlatformId
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    $('#featureLibTipModal').modal('hide');
                    createConfigList($('#tableListConfig'), $('#tableConfigListPagination'), true, 1, 10, settings.$objConfigList);
                    //settings.$deleteOpt = [];
                    settings.configTableCounts = 0;
                    $("#configTableCounts").html(settings.configTableCounts);
                    $("#configMultiDeleteBtn").addClass("disabled");
                }
            };
        loadData(port, true, portData, successFunc, undefined, 'DELETE');
    });

    // 表格编辑按钮点击事件
    $('#tableListConfig').on('click', 'td .aui-icon-edit', function () {
        $("#featureLibModal").find(".modal-footer button").removeClass("hide");
        $("#featureLibModal").find(".viewConfigList").addClass("hide");
        $("#featureLibModal").find(".IDType").addClass("hide");
        // $("#featureLibModal").find(".s3t").addClass("hide");
        $("#featureLibLabel").html("厂家特征库编辑");
        $('#featureLibModal').modal('show');

        var taskid = $(this).closest('tr').attr('taskid'),
            allData = $(this).closest("tr").data("allData");

        $('.form-group').find("[id$=_val]").removeAttr("disabled"); //可编辑
        $("#platType_val").selectmenu('enable');
        $("#dockCode_val").selectmenu('enable');
        $("#platformId_val").selectmenu('enable');

        $("#data_val").addClass("editList"); //编辑
        $("#data_val").removeClass("addList");

        commonConfigOpt(allData);
        settings.$factoryLibId = allData.factoryLibId;
        $('#featureLibModal').attr('taskid', taskid);
    });

    // 表格查看按钮点击事件
    $('#tableListConfig').on('click', 'td .aui-icon-file', function () {
        $("#featureLibModal").find(".modal-footer button").addClass("hide");
        $("#featureLibModal").find(".viewConfigList").removeClass("hide");
        $("#featureLibModal").find(".IDType").removeClass("hide");
        // $("#featureLibModal").find(".s3t").addClass("hide");
        $("#featureLibLabel").html("厂家特征库查看");
        $('#featureLibModal').modal('show');

        var allData = $(this).closest("tr").data("allData");
        commonConfigOpt(allData);

        $('.form-group').find("[id$=_val]").attr("disabled", "disabled");
        $("#platType_val").selectmenu('disable');
        $("#dockCode_val").selectmenu('disable');
        $("#platformId_val").selectmenu('disable');
    });

    // 搜索按钮点击事件
    $("#searchConfigList").on("click", function () {
        settings.$objConfigList.creator = $("#platform").val();
        settings.$objConfigList.type = $("#cjType").val();
        settings.$objConfigList.platType = $("#platType").val();
        settings.$objConfigList.platformId = $("#platformIdVal").val();
        settings.$objConfigList.dockCode = $("#dockCodeVal").val();

        createConfigList($('#tableListConfig'), $('#tableConfigListPagination'), true, 1, 10, settings.$objConfigList);
        //settings.$deleteOpt = [];
        settings.configTableCounts = 0;
        $("#configTableCounts").html(settings.configTableCounts);
        $("#configMultiDeleteBtn").addClass("disabled");
    });

    // 单个参数校验公共方法
    $('#featureLibModal').find('[id$="_val"]').off('blur').on('blur', function () {
        $(this).removeClass('no-input-warning').closest('.control-form').find('.text-danger.tip').addClass('hide');
        if ($(this).val().replace(/\s/g, '') === '') {
            $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
        } else {
            $(this).removeClass('no-input-warning').closest('.control-form').find('.text-danger.tip').addClass('hide');
            if ($(this).attr('id') == 'dockCode_val') {
                var port = 'v2/featureLib/libs',
                    portData1 = {
                        "page": 1,
                        "size": 10,
                        "dockCode": $("#dockCode_val").val(),
                        "type": $("#type_val").val(),
                    },
                    successFunc = function (data) {
                        if (data.code == '200') {
                            if (data.data.list.length > 0) {
                                $("#dockCode_val").addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').html('对接平台唯一编码已存在');
                                $("#dockCode_val").addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                            }
                        } else {
                            warningTip.say(data.msg);
                        }
                    };
                loadData(port, true, portData1, successFunc);
            }
        }

    })

})(window, window.jQuery);