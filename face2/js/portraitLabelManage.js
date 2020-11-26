(function (window, $) {
    var settings = {
            controlFlag: true,
        },
        modalType = '', // 弹框类型 新增/查看/编辑
        configTableCounts = 0, //列表已选数量
        selectedListData = '', //删除操作需要的taskid
        labelSearchData = { //厂家和对接平台类型默认
            id: '',
            labelId: '',
            labelName: '',
            libId: '',
            libName: '',
            orgId: '',
            creator: '',
            startTime: '',
            endTime: '',
            page: 1,
            size: 10
        },
        parentId = '', // 父标签ID
        org_bodyList = ''; // 机构列表

    /**
     * 列表生成
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     * @param {*} param 过滤条件对象
     */
    function createLabelList($table, $pagination, first, page, number) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="6" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/libLabel/childLabels',
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

                            html += `<tr data-index="${i}" class="" taskid="${result[i].id}" labelId="${result[i].labelId}">
                                        <td class="bs-checkbox ">
                                            <div class="table-checkbox">
                                                <input data-index="0" name="btSelectItem" type="checkbox" value="0" class="table-checkbox-input table-checkbox-input-configDetail">
                                                <span class="table-checkbox-label"></span>
                                            </div>
                                        </td>
                                        <td>${result[i].labelName || '--'}</td>
                                        <td>${result[i].libName || '--'}</td>
                                        <td>${result[i].orgName || '--'}</td>
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
                                createLabelList($table, '', false, currPage, pageSize);
                                selectedListData = [];
                                configTableCounts = 0;
                                $("#configTableCounts").html(configTableCounts);
                                $("#configMultiDeleteBtn").addClass("disabled");
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
        loadData(port, true, labelSearchData, successFunc);
    }

    // 获取人像库下拉框数据
    function getAllLibs() {
        var portData = {
                type: 3,
            },
            successFunc = function (data) {
                if (data.code === '200') {
                    var faceLibData = data.data, // 人脸库数据
                        faceLibHtml = '';
                    // 插入人脸库数据和节点
                    faceLibData.forEach(v => {
                        faceLibHtml += `<option value="${v.libId}">${v.libName}</option>`;
                    });
                    $('#libId_val').append(faceLibHtml);

                    $('#libId_val').selectpicker({
                        'noneSelectedText': '请选择库',
                    });
                    $('#parentId_val').selectpicker({
                        'noneSelectedText': '请选择父标签'
                    });
                    $('#parentId_val').attr("disabled", "disabled");
                    $("#parentId_val").selectpicker('refresh');

                }
            };
        loadData('v3/lib/getAccesslibList', true, portData, successFunc, '', 'GET');
    }

    /**
     * 数据获取 布控类型初始化
     */
    function getParentLabel(libId) {
        var infoPort = 'v3/label/getLabelByLibId',
            infoData1 = {
                "libId": libId,
                randomNum: Math.random()
            },
            infoPortSuccessFunc1 = function (data) {
                if (data.code === '200') {
                    var RX_BKPLAT_Html = '';
                    data.data.forEach(function (item) {
                        var selected = '';
                        RX_BKPLAT_Html += `<option  value="${item.labelId}">${item.labelName}</option>`
                    })
                    $("#parentId_val").html(RX_BKPLAT_Html);
                    if (data.data.length > 0) {
                        $('#parentId_val').selectpicker({
                            'noneSelectedText': '请选择父标签',
                            'val': []
                        });
                        if (parentId) {
                            $('#parentId_val').selectpicker('val', parentId);
                        } else {
                            $('#parentId_val').selectpicker('val', '');
                        }
                        if (modalType == 2) {
                            $('#parentId_val').attr("disabled", "disabled");
                        } else {
                            $('#parentId_val').removeAttr("disabled");
                        }
                    } else {
                        $('#parentId_val').selectpicker({
                            'noneSelectedText': '当前库暂无标签'
                        });
                        $('#parentId_val').attr("disabled", "disabled");
                    }
                    $("#parentId_val").selectpicker('refresh');
                }
            };
        loadData(infoPort, true, infoData1, infoPortSuccessFunc1, '', 'GET');
    }

    $('#libId_val').on('change', function () {
        var libId = $(this).val();
        getParentLabel(libId);
    })

    // 编辑查看公用代码
    function commonConfigOpt(allData) {
        $('#ConfigModal').find('[id$=_val]').removeClass('no-input-warning').val('').closest('.control-form').find('.text-danger.tip').addClass('hide');
        // 子库（标签）id
        $('#labelId_val').val(allData.labelId);
        // 子库（标签）名
        $('#labelName_val').val(allData.labelName);
        // 父标签ID
        parentId = allData.parentId;
        // $("#parentId_val").val(allData.parentId);
        // 人像库id
        $('#libId_val').selectpicker('val', allData.libId);
        // 库所属机构
        // $("#orgId_val").selectpicker('val', allData.orgId);
        if (org_bodyList) {
            $('#orgId_val').removeAttr("disabled");
            $('#orgId_val').data({
                'cameraList': matchList(org_bodyList, allData.orgId).newCameraList,
                'gidArr': matchList(org_bodyList, allData.orgId).newGidArr
            }).val(matchList(org_bodyList, allData.orgId).newNameArr.join(','));
        } else {
            var port = 'v2/org/getOrgInfos',
                dataLoad = {
                    returnType: 4,
                    orgType: 1,
                    userType: 1,
                    randomNum: Math.random()
                }
            successFunc = function (data) {
                if (data.code === '200') {
                    org_bodyList = data.data;
                    $('#orgId_val').data({
                        'cameraList': matchList(org_bodyList, allData.orgId).newCameraList,
                        'gidArr': matchList(org_bodyList, allData.orgId).newGidArr
                    }).val(matchList(org_bodyList, allData.orgId).newNameArr.join(','));
                }
            };
            loadData(port, true, dataLoad, successFunc, '', 'GET');
        }
        // 备注/说明
        $('#comments_val').val(allData.comments);
        // 创建人
        $('#creator_val').val(allData.creator);
        // 创建时间
        $('#createtime_val').val(allData.createtime);
        // 更新人
        $('#updator_val').val(allData.updator);
        // 创建时间
        $('#udpatetime_val').val(allData.updatetime);
    };

    /**
     * 布控区域列表模式OR可见范围 初始化过程 的 数据转换功能
     * @param {array} list // 获取的机构列表数据
     * @param {array} orgId  // 布控详情数据中 已选机构id
     */
    function matchList(list, orgId) {
        var newObj = {};
        var newCameraList = [];
        var newNameArr = [];
        var newGidArr = [];
        if (list && list.length > 0) {
            list.forEach(function (item) {
                if (item.orgId == orgId) {
                    itemObj = {
                        id: item.orgId,
                        name: item.orgName,
                        scode: item.orgCode
                    };
                    newCameraList.push(itemObj);
                    newNameArr.push(item.orgName);
                    newGidArr.push(item.orgId);
                }

            });
        }
        newObj = {
            newCameraList: newCameraList,
            newNameArr: newNameArr,
            newGidArr: newGidArr
        }
        return newObj;
    }

    //初始化
    function initControlConfig() {
        // loadSearchOrgInfoPort();
        getAllLibs();
        createLabelList($('#tableListConfig'), $('#tableConfigListPagination'), true, 1, 10);
    };

    initControlConfig();

    // 所属机构 新建弹框 输入框点击事件 调用树组件 
    $('#orgId_val').orgTree({
        all: true, //人物组织都开启
        area: ['960px', '718px'], //弹窗框宽高
        search: true, //开启搜索
        cls: 'camera-list',
        ajaxFilter: 'orgId_val',
        node: 'orgId_val',
        selectOne: true, // 树结构选择框只能选择一个
        newBk: true
    });

    // 所属机构 搜索区域 输入框点击事件 调用树组件 
    $('#orgIdVal').orgTree({
        all: true, //人物组织都开启
        area: ['960px', '718px'], //弹窗框宽高
        search: true, //开启搜索
        cls: 'camera-list',
        ajaxFilter: 'orgIdVal',
        node: 'orgIdVal',
        selectOne: true, // 树结构选择框只能选择一个
        newBk: true
    });

    // 搜索按钮点击事件
    $("#searchConfigList").on("click", function () {
        labelSearchData.labelName = $("#labelNameVal").val();
        labelSearchData.orgId = $("#orgIdVal").data('gidArr')[0];
        labelSearchData.startTime = $("#startTime").val();
        labelSearchData.endTime = $("#endTime").val();

        createLabelList($('#tableListConfig'), $('#tableConfigListPagination'), true, 1, 10);
        selectedListData = [];
        configTableCounts = 0;
        $("#configTableCounts").html(configTableCounts);
        $("#configMultiDeleteBtn").addClass("disabled");
    });

    // 新建按钮点击事件
    $("#configAddBtn").on("click", function () {
        modalType = 1; // 弹框类型 新增/查看/编辑
        $("#ConfigModal").find('.modal-footer button').removeClass("hide");
        $(".viewConfigList").addClass("hide"); //更新人、更新时间隐藏
        $(".IDType").removeClass("hide");
        $("#configLabel").html("子库/标签新增");
        $('#ConfigModal').modal('show');
        $('#ConfigModal').attr('taskid', '');

        //初始化
        $('#ConfigModal').find('[id$=_val]').removeClass('no-input-warning').val('').removeAttr("disabled").closest('.control-form').find('.text-danger.tip').addClass('hide');

        $('#libId_val').selectpicker('enabled');
        $('#libId_val').selectpicker('refresh');

        $('#orgId_val').selectpicker('enabled');
        $('#orgId_val').selectpicker('refresh');

        $("#parentId_val").empty();
        $('#parentId_val').attr("disabled", "disabled");
        $('#parentId_val').selectpicker('refresh');
    });

    // 批量删除点击事件
    $("#configMultiDeleteBtn").on("click", function () {
        if ($(this).hasClass('disabled')) {
            return;
        }
        selectedListData = [];
        for (var i = 0; i < $("#tableListConfig").find("tbody .table-checkbox-input-configDetail").length; i++) {
            if ($("#tableListConfig").find("tbody .table-checkbox-input-configDetail").eq(i).is(":checked")) {
                selectedListData.push($("#tableListConfig").find("tbody .table-checkbox-input-configDetail").eq(i).parents('tr').attr("taskid"));
            }
        }
        $("#configTipLabel").html('是否批量删除?');
        $("#configTipModal").modal('show');
    });

    // 新建确认按钮点击事件
    $("#configModalSure").on('click', function () {
        $('#ConfigModal').find('[id$=_val]').removeClass('no-input-warning').removeAttr("disabled").closest('.control-form').find('.text-danger.tip').addClass('hide');
        settings.controlFlag = true;

        var id = $('#ConfigModal').attr('taskid');
        var labelId = $.trim($('#labelId_val').val()); // 子库（标签）id
        var labelName = $('#labelName_val').val(); // 子库（标签）名
        var libId = $.trim($('#libId_val').selectpicker('val')); // 人像库id
        var parentId = $('#parentId_val').val() ? $('#parentId_val').val() : ''; // 父标签ID
        var orgId = $("#orgId_val").data('gidArr')[0]; // 所属机构
        var comments = $('#comments_val').val(); // 备注/说明

        var portData = {
            id: id ? id : '',
            labelId: labelId ? labelId : '',
            labelName: labelName ? labelName : '',
            libId: libId ? libId : '',
            parentId: parentId ? parentId : '',
            orgId: orgId ? orgId : '',
            comments: comments ? comments : ''
        }

        //校验
        for (var item in portData) {
            if (portData[item] == '' && item != "id" && item != "parentId") {
                $('#' + item + '_val').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                settings.controlFlag = false;
            }
        }

        var portDataSuccessFunc = function (data) {
            if (data.code === '200') {
                $('#ConfigModal').modal('hide');
                createLabelList($('#tableListConfig'), $('#tableConfigListPagination'), true, 1, 10);
                selectedListData = [];
                configTableCounts = 0;
                $("#configTableCounts").html(configTableCounts);
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
            loadData('v3/libLabel/editChildLabels', true, portData, portDataSuccessFunc);
        }
    });

    // 表格查看按钮点击事件
    $('#tableListConfig').on('click', 'td .aui-icon-file', function () {
        modalType = 2; // 弹框类型 新增/查看/编辑
        $("#ConfigModal").find('.modal-footer button').addClass("hide");
        $(".viewConfigList").removeClass("hide");
        $(".IDType").removeClass("hide");
        $("#configLabel").html("子库/标签查看");
        $('#ConfigModal').modal('show');
        var allData = $(this).closest("tr").data("allData");
        commonConfigOpt(allData);

        $('.form-group').find("[id$=_val]").attr("disabled", "disabled");
        $("#libId_val").selectpicker('disabled');
        $('#libId_val').selectpicker('refresh');
        $('#orgId_val').selectpicker('disabled');
        $('#orgId_val').selectpicker('refresh');
    });

    // 表格编辑按钮点击事件
    $('#tableListConfig').on('click', 'td .aui-icon-edit', function () {
        modalType = 3; // 弹框类型 新增/查看/编辑
        $("#ConfigModal").find('.modal-footer button').removeClass("hide");
        $(".viewConfigList").addClass("hide");
        $(".IDType").addClass("hide");
        $("#configLabel").html("子库/标签编辑");
        $('#ConfigModal').modal('show');

        $('#ConfigModal').find('[id$=_val]').removeClass('no-input-warning').closest('.control-form').find('.text-danger.tip').addClass('hide');
        $('.form-group').find("[id$=_val]").removeAttr("disabled");
        $("#libId_val").selectpicker('enabled');
        $("#libId_val").selectpicker('refresh');
        $('#orgId_val').selectpicker('enabled');
        $('#orgId_val').selectpicker('refresh');

        var taskid = $(this).closest('tr').attr('taskid'),
            allData = $(this).closest("tr").data("allData");
        commonConfigOpt(allData);
        $('#ConfigModal').attr('taskid', taskid);
    });

    // 表格删除按钮点击事件
    $('#tableListConfig').on('click', 'td .aui-icon-delete-line', function () {
        $("#configTipLabel").html('是否删除?');
        $("#configTipModal").modal('show');
        selectedListData = [];
        selectedListData.push($(this).parents("tr").attr("taskid"));
    });

    // 删除确定按钮点击事件
    $("#configModaldelectSure").on("click", function () {
        var port = 'v3/libLabel/delChildLabels',
            portData = {
                "ids": selectedListData
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    $('#configTipModal').modal('hide');
                    createLabelList($('#tableListConfig'), $('#tableConfigListPagination'), true, 1, 10);
                    selectedListData = [];
                    configTableCounts = 0;
                    $("#configTableCounts").html(configTableCounts);
                    $("#configMultiDeleteBtn").addClass("disabled");
                }
            };
        loadData(port, true, portData, successFunc);
    });

    // 配置列表头部全选按钮点击事件
    $("#tableListConfig").on("click", '.table-checkbox-all', function () {
        if ($(this).is(":checked")) {
            for (var i = 0; i < $(this).parents("table").find("tbody .table-checkbox-input-configDetail").length; i++) {
                $(this).parents("table").find("tbody .table-checkbox-input-configDetail").eq(i).prop("checked", "checked");
            }
            configTableCounts = $(this).parents("table").find("tbody .table-checkbox-input-configDetail").length; //全选数量为全部
        } else {
            for (var i = 0; i < $(this).parents("table").find("tbody .table-checkbox-input-configDetail").length; i++) {
                $(this).parents("table").find("tbody .table-checkbox-input-configDetail").eq(i).removeAttr("checked");
            }
            configTableCounts = 0; //取消全选数量为0
        }
        $("#configTableCounts").html(configTableCounts);
        if (configTableCounts > 1) {
            $("#configMultiDeleteBtn").removeClass("disabled");
        } else {
            $("#configMultiDeleteBtn").addClass("disabled");
        }
    });

    // 配置列表tbody每一个单选框点击事件
    $("#tableListConfig").on("change", ".table-checkbox-input-configDetail", function () {
        if ($(this).is(":checked")) {
            configTableCounts++; //当前复选框被选中则加一
        } else {
            configTableCounts--; //当前复选框没被选中减一
        }
        $("#configTableCounts").html(configTableCounts);
        if (configTableCounts > 1) {
            $("#configMultiDeleteBtn").removeClass("disabled");
        } else {
            $("#configMultiDeleteBtn").addClass("disabled");
        }
        for (var i = 0; i < $(this).parents("table").find("tbody .table-checkbox-input-configDetail").length; i++) {
            if (!$(this).parents("table").find("tbody .table-checkbox-input-configDetail").eq(i).is(":checked")) {
                $(this).parents("table").find("thead .table-checkbox-all").removeAttr("checked");
                return;
            }
        }
        $(this).parents("table").find("thead .table-checkbox-all").prop("checked", "checked");
    });

    // 单个参数校验公共方法
    $('#ConfigModal').find('[id$="_val"]').off('blur').on('blur', function () {
        if ($(this).val().replace(/\s/g, '') === '' && $(this).attr('id') !== 'parentId_val') {
            $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
        } else {
            $(this).removeClass('no-input-warning').closest('.control-form').find('.text-danger.tip').addClass('hide');
        }
    })

})(window, window.jQuery);