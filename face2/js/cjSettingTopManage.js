(function (window, $) {
    // 厂家配置管理
    var _validateFlag = true, // 校验标志 默认校验通过
        modalType = '', // 弹框类型 新增/查看/编辑
        editId = '', // 编辑数据项的id
        deleteRowId = '', // 删除单行的Id
        allLibs = [], // 新增、编辑弹框 库列表数组赋值
        _typeVal = 1; // 1:融合人像账号配置,2:城市人像账号配置

    // 单选初始化
    $('[data-role="radio"]').checkboxradio();
    $('[data-role="radio-button"]').checkboxradio({
        icon: false
    });

    // 下拉框 初始化
    function initSelected() {
        $("#typeVal").selectmenu();
        $("#platformIdVal").selectmenu();
        $("#platformId_val").selectmenu();
        $("#status_val").selectmenu();
    }
    initSelected();

    // 获取下拉框数据
    function getAllManufactures() {
        var _port = 'v2/algoManufact/allManufactures',
            _portData = {
                type: _typeVal
            },
            _successFunc = function (data) {
                if (data.code === '200' && data.data.length) {
                    var list = data.data;
                    var html = '',
                        html1 = '<option value="" checked>全部</option>';
                    for (var i = 0; i < list.length; i++) {
                        if (!i) {
                            html += `<option value=${list[i].platformId} checked>${list[i].platformName}</option>`
                        } else {
                            html += `<option value=${list[i].platformId}>${list[i].platformName}</option>`
                        }
                        html1 += `<option value=${list[i].platformId}>${list[i].platformName}</option>`
                    }
                    $('#platformIdVal').html(html1)
                    $("#platformIdVal").selectmenu('refresh');
                    $('#platformId_val').html(html)
                    $("#platformId_val").selectmenu('refresh');
                }
            };
        loadData(_port, true, _portData, _successFunc, undefined, 'GET');
    }
    getAllManufactures();

    // 获取下拉框数据
    function getAllLibs() {
        var _port = 'v2/lib/allLibs',
            _portData = {},
            _successFunc = function (data) {
                if (data.code === '200' && data.data.length) {
                    var result = data.data;
                    $container = $('#libIds_val');
                    if (result && result.length) { // 存在返回摄像机
                        var itemHtml = '';
                        for (let i = 0; i < result.length; i++) {
                            itemHtml += `<option value=${result[i].libId}>${result[i].libName}</option>`;
                        }
                        $container.empty().append(itemHtml);
                        $container.selectpicker({
                            allowClear: true
                        });
                        // $container.prop('disabled', false);
                        $container.val(null);
                        $container.selectpicker('refresh');
                    } else {
                        // $container.prop('disabled', true);
                        $container.selectpicker();
                        $container.val(null);
                        $container.selectpicker('refresh');
                    }
                }
            };
        loadData(_port, true, _portData, _successFunc, undefined, 'GET');
    }
    getAllLibs();

    // 查询列表
    function initcjSettingTopList($table, $pagination, first, page, size) {
        var $tbody = $('#cjSettingTopTableList').find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v2/manufactOutside/manufactures',
            portData = {
                type: _typeVal,
                page: page ? page : '1',
                size: size ? size : '10',
                platformId: $('#platformIdVal').val() ? $('#platformIdVal').val() : '',
                dockCode: $('#dockCodeVal').val() ? $('#dockCodeVal').val() : '',
                dockDesc: $('#dockDescVal').val() ? $('#dockDescVal').val() : '',
                userName: $('#userNameVal').val() ? $('#userNameVal').val() : ''
            };
        successFunc = function (data) {
            hideLoading($table);
            if (data.code === '200') {
                var result = data.data.list;
                $table.data({
                    'result': result
                });
                if (result && result.length > 0) {
                    var html = '';
                    for (var i = 0; i < result.length; i++) {
                        html += `<tr data-index="${i}" class="" keyid="${result[i].id}">
                        <td>${result[i].platformId || '--'}</td>
                        <td>${result[i].dockCode || '--'}</td>
                        <td>${result[i].dockDesc || '--'}</td>
                        <td>${result[i].userName || '--'}</td>
                        <td title=${result[i].password || '--'}>${result[i].password || '--'}</td>
                        <td>${result[i].serviceIp || '--'}</td>
                        <td>${result[i].servicePort || '--'}</td>
                        <td>
                            <i class="icon aui-icon-file aui-mr-sm" title="查看"></i>
                            <i class="icon aui-icon-edit aui-mr-sm" title="编辑"></i>
                            <i class="icon aui-icon-delete-line aui-mr-sm" title="删除"></i>
                        </td>
                    </tr>`
                    }
                    // 给列表添加行数据
                    $tbody.html(html);
                    if (data.data.total > Number(portData.size) && first) {
                        var pageSizeOpt = [{
                            value: 10,
                            text: '10/页',
                            selected: true
                        }, {
                            value: 15,
                            text: '15/页',
                        }, {
                            value: 20,
                            text: '20/页',
                        }];
                        var eventCallBack = function (currPage, pageSize) {
                            initcjSettingTopList($table, '', false, currPage, pageSize)
                        };
                        setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                    }
                } else {
                    $tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
                }
            } else {
                $tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
                warningTip.say(data.message);
            }
        };
        loadData(port, true, portData, successFunc);
    }
    initcjSettingTopList($('#cjSettingTopTableList'), $('#cjSettingTopTableListPagination'), true);

    // 新增 数据初始化
    function clearForm() {
        $('#userName_val').val('');
        $('#password_val').val('');
        $('#serviceIp_val').val('');
        $('#servicePort_val').val('');
        $('#dockCode_val').val('');
        $('#dockDesc_val').val('');
        $('#minScore_val').val('');
        $('#orgId_val').val('');
        $('#comments_val').val('');

        $('#status_val').val('1');
        $("#status_val").selectmenu('refresh');
        $('#platformId_val').val('6');
        $("#platformId_val").selectmenu('refresh');
        // 多选下拉框 初始化
        $("#libIds_val").selectpicker('val', '');
    }

    // 查看/编辑 数据初始化
    function initForm(resultData) {
        $('#userName_val').val(resultData.userName);
        $('#password_val').val(resultData.password);
        $('#serviceIp_val').val(resultData.serviceIp);
        $('#servicePort_val').val(resultData.servicePort);
        $('#dockCode_val').val(resultData.dockCode);
        $('#dockDesc_val').val(resultData.dockDesc);
        $('#minScore_val').val(resultData.minScore);

        var port = 'v2/org/getOrgInfos',
            dataLoad1 = {
                returnType: 4,
                orgType: 2,
                userType: 2
            },
            successFunc = function (data) {
                if (data.code === '200') {
                    var control_bodyList = data.data;
                    //可见范围
                    $('#orgId_val').data({
                        'cameraList': matchList(control_bodyList, [{
                            'orgId': resultData.orgId
                        }]).newCameraList,
                        'gidArr': matchList(control_bodyList, [{
                            'orgId': resultData.orgId
                        }]).newGidArr
                    }).val(matchList(control_bodyList, [{
                        'orgId': resultData.orgId
                    }]).newNameArr.join(','));
                }
            };
        loadData(port, true, dataLoad1, successFunc, '', 'GET');

        $('#comments_val').val(resultData.comments);

        $('#status_val').val(resultData.status);
        $("#status_val").selectmenu('refresh');
        $('#platformId_val').val(resultData.platformId);
        $("#platformId_val").selectmenu('refresh');

        // 多选下拉框 赋值
        var libIds_val = [];
        if (resultData && resultData.libList && resultData.libList.length > 0) {
            resultData.libList.forEach(function (item) {
                libIds_val.push(item.libId);
            })
        }
        $("#libIds_val").selectpicker("val", libIds_val);
        $("#libIds_val").selectpicker('refresh');

        // 只有查看才初始化的字段
        if (modalType === 'search') {
            $('#platformName').val(resultData.platformName);
            $('#orgName').val(resultData.orgName);
            $('#creator').val(resultData.creator);
            $('#createtime').val(resultData.createtime);
            $('#updator').val(resultData.updator);
            $('#updatetime').val(resultData.updatetime);
        }
    }

    /**
     * 布控区域列表模式OR可见范围 初始化过程 的 数据转换功能
     * @param {array} list // 获取的机构列表数据
     * @param {array} org  // 布控详情数据中 已选机构id数组
     */
    function matchList(list, org) {
        var newObj = {};
        var newCameraList = [];
        var newNameArr = [];
        var newGidArr = [];
        if (list && list.length > 0) {
            list.forEach(function (item) {
                org.forEach(function (el) {
                    if (item.orgId == el.orgId) {
                        itemObj = {
                            id: item.orgId,
                            name: item.orgName,
                            scode: item.orgCode
                        };
                        newCameraList.push(itemObj);
                        newNameArr.push(item.orgName);
                        newGidArr.push(item.orgId);
                    }
                })
            });
        }
        newObj = {
            newCameraList: newCameraList,
            newNameArr: newNameArr,
            newGidArr: newGidArr
        }
        return newObj;
    }

    // 新增/编辑 可编辑
    function removeDisabled() {
        $('#userName_val').removeAttr('disabled');
        $('#password_val').removeAttr('disabled');
        $('#serviceIp_val').removeAttr('disabled');
        $('#servicePort_val').removeAttr('disabled');
        $('#dockCode_val').removeAttr('disabled');
        // 编辑时 对接平台唯一编码不允许修改
        if (modalType === 'edit') {
            $('#dockCode_val').attr('disabled', 'disabled');
        }
        $('#dockDesc_val').removeAttr('disabled');
        $('#minScore_val').removeAttr('disabled');
        $('#orgId_val').removeAttr('disabled');
        $('#comments_val').removeAttr('disabled');

        $('#status_val').removeAttr('disabled');
        $("#status_val").selectmenu('refresh');
        $('#platformId_val').removeAttr('disabled');
        $("#platformId_val").selectmenu('refresh');

        $('#libIds_val').selectpicker('enabled');
        $('#libIds_val').selectpicker('refresh');
    }

    // 查看 不可编辑
    function searchDisabled() {
        $('#userName_val').attr('disabled', 'disabled');
        $('#password_val').attr('disabled', 'disabled');
        $('#serviceIp_val').attr('disabled', 'disabled');
        $('#servicePort_val').attr('disabled', 'disabled');
        $('#dockCode_val').attr('disabled', 'disabled');
        $('#dockDesc_val').attr('disabled', 'disabled');
        $('#minScore_val').attr('disabled', 'disabled');
        $('#orgId_val').attr('disabled', 'disabled');
        $('#comments_val').attr('disabled', 'disabled');

        $('#status_val').attr('disabled', 'disabled');
        $("#status_val").selectmenu('refresh');
        $('#platformId_val').attr('disabled', 'disabled');
        $("#platformId_val").selectmenu('refresh');

        $('#libIds_val').selectpicker('disabled');
        $('#libIds_val').selectpicker('refresh');

        // 以下是只有查询弹框才有的内容
        $('#platformName').attr('disabled', 'disabled');
        $('#orgName').attr('disabled', 'disabled');
        $('#creator').attr('disabled', 'disabled');
        $('#createtime').attr('disabled', 'disabled');
        $('#updator').attr('disabled', 'disabled');
        $('#updatetime').attr('disabled', 'disabled');
    }

    // 搜索
    $('#searchBtn').on('click', function () {
        if ($('#typeVal').val() == 1) {
            _typeVal = 1;
        } else {
            _typeVal = 2;
        }
        initcjSettingTopList($('#cjSettingTopTableList'), $('#cjSettingTopTableListPagination'), true);
    });

    // 点击添加
    $('#cjTopAddBtn').on('click', function () {
        var $cjSettingTopModal = $('#cjSettingTopEditModal');

        $cjSettingTopModal.find('.text-danger').addClass('hide');
        $cjSettingTopModal.find('.no-input-warning').removeClass('no-input-warning');
        $cjSettingTopModal.find('.modal-title').text('厂家配置(上层)添加');
        $cjSettingTopModal.find('.form-group-cj-top-search').addClass('hide');
        $cjSettingTopModal.find('.modal-footer button').removeClass('hide');
        $cjSettingTopModal.modal('show');
        modalType = 'add';
        // 新增弹框 数据初始化
        clearForm();
        // 新增弹框 可点击
        removeDisabled();
    })

    // 列表 点击查看
    $('#cjSettingTopTableList').on('click', '.aui-icon-file', function () {
        var rowIndex = $(this).parent().parent().index(),
            rowData = $("#cjSettingTopTableList").data("result")[rowIndex],
            $cjSettingTopModal = $('#cjSettingTopEditModal');

        $cjSettingTopModal.find('.text-danger').addClass('hide');
        $cjSettingTopModal.find('.no-input-warning').removeClass('no-input-warning');
        $cjSettingTopModal.find('.modal-title').text('厂家配置（上层）查看');
        $cjSettingTopModal.find('.form-group-cj-top-search').removeClass('hide');
        $cjSettingTopModal.find('.modal-footer button').addClass('hide');
        $cjSettingTopModal.modal('show');
        modalType = 'search';
        // 查看弹框 数据初始化
        initForm(rowData);
        // 查看弹框 不可编辑
        searchDisabled();
    });

    // 列表 点击编辑
    $('#cjSettingTopTableList').on('click', 'td .aui-icon-edit', function () {
        var rowIndex = $(this).parent().parent().index(),
            rowData = $("#cjSettingTopTableList").data("result")[rowIndex],
            $cjSettingTopModal = $('#cjSettingTopEditModal');

        $cjSettingTopModal.find('.text-danger').addClass('hide');
        $cjSettingTopModal.find('.no-input-warning').removeClass('no-input-warning');
        $cjSettingTopModal.find('.modal-title').text('厂家配置（上层）编辑');
        $cjSettingTopModal.find('.form-group-cj-top-search').addClass('hide');
        $cjSettingTopModal.find('.modal-footer button').removeClass('hide');
        $cjSettingTopModal.modal('show');
        modalType = 'edit';
        editId = rowData.id;
        // 编辑弹框 数据初始化
        initForm(rowData);
        // 编辑弹框 可点击
        removeDisabled();
    });

    // 列表 点击删除
    $('#cjSettingTopTableList').on('click', '.aui-icon-delete-line', function () {
        // 获取删除行的id
        var rowIndex = $(this).parent().parent().index(),
            rowData = $("#cjSettingTopTableList").data("result")[rowIndex];
        deleteRowId = rowData.id;
        // 弹框
        $('#cjSettingTopModal').modal('show');
    });

    // 点击删除弹框 确认按钮
    $('#cjSettingTopModalSure').off('click').on('click', function () {
        var port1 = 'v2/manufactOutside/delManufactures',
            portData1 = {
                type: _typeVal,
                id: deleteRowId
            },
            portDataSuccessFunc = function (data) {
                if (data.code === '200') {
                    $('#cjSettingTopModal').modal('hide');
                    // 删除成功之后 刷新列表
                    initcjSettingTopList($('#cjSettingTopTableList'), $('#cjSettingTopTableListPagination'), true);
                    warningTip.say(data.message);
                }
            };
        loadData(port1, true, portData1, portDataSuccessFunc, undefined, 'DELETE');
    });

    // 添加/编辑 点击弹框确认按钮
    $('#cjSettingTopEditModalSure').off('click').on('click', function () {
        if ($('#orgId_val').val()) {
            var orgIdVal = $('#orgId_val').data('cameraList')[0].id;
        } else {
            var orgIdVal = '';
        }
        var userName = $('#userName_val').val(),
            password = $('#password_val').val(),
            serviceIp = $('#serviceIp_val').val(),
            servicePort = $('#servicePort_val').val(),
            dockCode = $('#dockCode_val').val(),
            dockDesc = $('#dockDesc_val').val(),
            minScore = $('#minScore_val').val(),
            platformId = $('#platformId_val').val(),
            orgId = orgIdVal,
            comments = $('#comments_val').val(),
            status = +$('#status_val').val(),
            libIds = $('#libIds_val').val();
        var portData = {
            type: _typeVal,
            userName: userName,
            password: password,
            serviceIp: serviceIp,
            servicePort: servicePort,
            dockCode: dockCode,
            dockDesc: dockDesc,
            minScore: minScore,
            platformId: platformId,
            orgId: orgId,
            comments: comments,
            status: status,
            libIds: libIds
        };
        // 新增或编辑
        if (modalType === 'add' || modalType === 'edit') {
            // 校验 不输入直接确定
            Object.keys(portData).forEach(function (key) {
                // 用户名 不能为空
                if (key !== 'type' && key !== 'status' && key !== 'libIds') {
                    if ($('#' + key + '_val').val().replace(/\s/g, '') === '') {
                        $('#' + key + '_val').removeClass('no-input-warning').closest('.control-form').find('.text-danger').addClass('hide');
                        $('#' + key + '_val').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                    }
                }
            });

            _validateFlag = true
            $('#cjSettingTopEditModal').find('.text-danger').each(function (index, item) {
                // 如果有字段未通过验证
                if (!$(item).hasClass('hide')) {
                    _validateFlag = false
                }
            })

            var port = 'v2/manufactOutside/editManufactures',
                successFunc = function (data) {
                    if (data.code === '200') {
                        $('#cjSettingTopEditModal').modal('hide');
                        // 新增/编辑成功之后 刷新列表
                        initcjSettingTopList($('#cjSettingTopTableList'), $('#cjSettingTopTableListPagination'), true);
                        warningTip.say(data.message);
                    }
                };
            if (modalType === 'add') {
                if (_validateFlag) {
                    loadData(port, true, portData, successFunc);
                }
            }
            if (modalType === 'edit') {
                if (_validateFlag && editId) {
                    portData.id = editId;
                    loadData(port, true, portData, successFunc);
                }
            }
        }
        // 查看
        if (modalType === 'search') {
            // 关闭弹框
            $('#cjSettingTopEditModal').modal('hide');
        }
    })

    // 机构名称 输入框点击事件 调用树组件
    $('#orgId_val').orgTree({
        all: true, //人物组织都开启
        area: ['620px', '542px'], //弹窗框宽高
        search: true, //开启搜索
        newBk: true,
        noMap: true,
        ajaxFilter: true,
        node: 'orgId_val',
        selectOne: true, // 树结构选择框只能选择一个
        contain: "1", // 树结构中是否包含警种
        viewType: true // 可见范围都要加上这个属性，请求参数不同
    });

    // 单个参数校验方法
    $('#cjSettingTopEditModal').find('[id$="_val"]').off('blur').on('blur', function () {
        $(this).removeClass('no-input-warning').closest('.control-form').find('.text-danger').addClass('hide');
        if ($(this).val().replace(/\s/g, '') === '') {
            $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
        } else {
            if ($(this).attr('id') == 'dockCode_val') {
                // 校验 对接平台唯一编码 失去焦点事件 不能为空 或者是否已存在
                var _port = 'v2/manufactOutside/manufactures',
                    _portData = {
                        type: 1,
                        page: '1',
                        size: '10',
                        dockCode: $(this).val()
                    },
                    _successFunc = function (data) {
                        if (data.code === '200' && data.data.list.length) {
                            $('#dockCode_val').siblings('.text-danger.tip1').removeClass('hide');
                        }
                    };
                loadData(_port, true, _portData, _successFunc);
            } else if ($(this).attr('id') == 'passWord_val') {
                if ($(this).val().length > 32) {
                    $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            } else if ($(this).attr('id') == 'serviceIp_val') {
                // 校验IP 厂家服务地址IP
                var _reg = /^(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;
                if (_reg.test($(this).val()) !== true) {
                    $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            } else if ($(this).attr('id') == 'servicePort_val') {
                // 校验端口 厂家服务端口 端口范围0-65535
                var _reg = /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
                if (_reg.test($(this).val()) !== true) {
                    $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            } else if ($(this).attr('id') == 'minScore_val') {
                // 校验 特征同步最低分 失去焦点事件 不能为空
                var _reg = /^[0-9]$|^[1-9][0-9]$|^100$/;
                if (_reg.test($(this).val()) !== true) {
                    $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            }
        }
    })

})(window, window.jQuery)