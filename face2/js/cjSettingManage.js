(function (window, $) {
    // 厂家配置管理
    var _validateFlag = true, // 校验标志 默认校验通过
        selectedCounts = 0, // 被选中的列表条数
        modalType = '', // 弹框类型 新增/查看/编辑
        editId = '', // 编辑数据项的id
        deleteRowId = ''; // 删除单行的Id

    // 单选初始化
    $('[data-role="radio"]').checkboxradio();
    $('[data-role="radio-button"]').checkboxradio({
        icon: false
    });

    // 下拉框 初始化
    function initSelected() {
        $("#config_isView").selectmenu();
        $("#config_isUpgrade").selectmenu();
        $("#config_isOut").selectmenu();
        $("#config_is1v1").selectmenu();
        $("#config_isToFactor").selectmenu();
        $("#config_isNeedSave").selectmenu();
        $("#config_isScoreFactor").selectmenu();
        $("#config_platType").selectmenu();
    }
    initSelected();

    // 查询列表
    function initcjSettingList($table, $pagination, first, page, size) {
        var $tbody = $('#cjSettingTableList').find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v2/algoManufact/manufactures',
            portData = {
                type: 1,
                page: page ? page : '1',
                size: size ? size : '10',
                platformName: $('#platformName').val() ? $('#platformName').val() : '',
                platformId: $('#platformID').val() ? $('#platformID').val() : ''
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
                        <td>${result[i].platformName || '--'}</td>
                        <td>${result[i].platformId || '--'}</td>
                        <td>${result[i].userName || '--'}</td>
                        <td title=${result[i].passWord || '--'}>${result[i].passWord || '--'}</td>
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
                            initcjSettingList($table, '', false, currPage, pageSize)
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
    initcjSettingList($('#cjSettingTableList'), $('#cjSettingTableListPagination'), true);

    // 新增 数据初始化
    function clearForm() {
        $('#config_platformName').val('');
        $('#config_platformId').val('');
        $('#config_serviceIp').val('');
        $('#config_servicePort').val('');
        $('#config_userName').val('');
        $('#config_passWord').val('');
        $('#config_storageUrl').val('');
        $('#config_sequences').val('');
        $('#config_comments').val('');
        $('#config_isView').val('0');
        $("#config_isView").selectmenu('refresh');
        $('#config_isUpgrade').val('0');
        $("#config_isUpgrade").selectmenu('refresh');
        $('#config_isOut').val('0');
        $("#config_isOut").selectmenu('refresh');
        $('#config_is1v1').val('0');
        $("#config_is1v1").selectmenu('refresh');
        $('#config_isToFactor').val('0');
        $("#config_isToFactor").selectmenu('refresh');
        $('#config_isNeedSave').val('0');
        $("#config_isNeedSave").selectmenu('refresh');
        $('#config_isScoreFactor').val('0');
        $("#config_isScoreFactor").selectmenu('refresh');
        $('#config_platType').val('0');
        $("#config_platType").selectmenu('refresh');
    }

    // 查看/编辑 数据初始化
    function initForm(resultData) {
        $('#config_platformName').val(resultData.platformName);
        $('#config_platformId').val(resultData.platformId);
        $('#config_isView').val(resultData.isView);
        $("#config_isView").selectmenu('refresh');
        $('#config_isUpgrade').val(resultData.isUpgrade);
        $("#config_isUpgrade").selectmenu('refresh');
        $('#config_isOut').val(resultData.isOut);
        $("#config_isOut").selectmenu('refresh');
        $('#config_is1v1').val(resultData.is1v1);
        $("#config_is1v1").selectmenu('refresh');
        $('#config_serviceIp').val(resultData.serviceIp);
        $('#config_servicePort').val(resultData.servicePort);
        $('#config_userName').val(resultData.userName);
        $('#config_passWord').val(resultData.passWord);
        $('#config_isToFactor').val(resultData.isToFactor);
        $("#config_isToFactor").selectmenu('refresh');
        $('#config_isNeedSave').val(resultData.isNeedSave);
        $("#config_isNeedSave").selectmenu('refresh');
        $('#config_storageUrl').val(resultData.storageUrl);
        $('#config_isScoreFactor').val(resultData.isScoreFactor);
        $("#config_isScoreFactor").selectmenu('refresh');
        $('#config_platType').val(resultData.platType);
        $("#config_platType").selectmenu('refresh');
        $('#config_comments').val(resultData.comments);
        // 只有编辑才初始化的字段
        if (modalType === 'edit') {
            $('#config_sequences').val(resultData.sequences);
        }
        // 只有查看才初始化的字段
        if (modalType === 'search') {
            $('#creator').val(resultData.creator);
            $('#createtime').val(resultData.createtime);
            $('#updator').val(resultData.updator);
            $('#updatetime').val(resultData.updatetime);
        }
    }

    // 新增/编辑 可编辑
    function removeDisabled() {
        $('#config_platformName').removeAttr('disabled');
        $('#config_platformId').removeAttr('disabled');
        // 编辑时 厂家id不允许修改
        if (modalType === 'edit') {
            $('#config_platformId').attr('disabled', 'disabled');
        }
        $('#config_isView').removeAttr('disabled');
        $("#config_isView").selectmenu('refresh');
        $('#config_isUpgrade').removeAttr('disabled');
        $("#config_isUpgrade").selectmenu('refresh');
        $('#config_isOut').removeAttr('disabled');
        $("#config_isOut").selectmenu('refresh');
        $('#config_is1v1').removeAttr('disabled');
        $("#config_is1v1").selectmenu('refresh');
        $('#config_serviceIp').removeAttr('disabled');
        $('#config_servicePort').removeAttr('disabled');
        $('#config_userName').removeAttr('disabled');
        $('#config_passWord').removeAttr('disabled');
        $('#config_isToFactor').removeAttr('disabled');
        $("#config_isToFactor").selectmenu('refresh');
        $('#config_isNeedSave').removeAttr('disabled');
        $("#config_isNeedSave").selectmenu('refresh');
        $('#config_storageUrl').removeAttr('disabled');
        $('#config_sequences').removeAttr('disabled');
        $('#config_isScoreFactor').removeAttr('disabled');
        $("#config_isScoreFactor").selectmenu('refresh');
        $('#config_platType').removeAttr('disabled');
        $("#config_platType").selectmenu('refresh');
        $('#config_comments').removeAttr('disabled');
    }

    // 查看 不可编辑
    function searchDisabled() {
        $('#config_platformName').attr('disabled', 'disabled');
        $('#config_platformId').attr('disabled', 'disabled');
        $('#config_isView').attr('disabled', 'disabled');
        $("#config_isView").selectmenu('refresh');
        $('#config_isUpgrade').attr('disabled', 'disabled');
        $("#config_isUpgrade").selectmenu('refresh');
        $('#config_isOut').attr('disabled', 'disabled');
        $("#config_isOut").selectmenu('refresh');
        $('#config_is1v1').attr('disabled', 'disabled');
        $("#config_is1v1").selectmenu('refresh');
        $('#config_serviceIp').attr('disabled', 'disabled');
        $('#config_servicePort').attr('disabled', 'disabled');
        $('#config_userName').attr('disabled', 'disabled');
        $('#config_passWord').attr('disabled', 'disabled');
        $('#config_isToFactor').attr('disabled', 'disabled');
        $("#config_isToFactor").selectmenu('refresh');
        $('#config_isNeedSave').attr('disabled', 'disabled');
        $("#config_isNeedSave").selectmenu('refresh');
        $('#config_storageUrl').attr('disabled', 'disabled');
        $('#config_isScoreFactor').attr('disabled', 'disabled');
        $("#config_isScoreFactor").selectmenu('refresh');
        $('#config_platType').attr('disabled', 'disabled');
        $("#config_platType").selectmenu('refresh');
        $('#creator').attr('disabled', 'disabled');
        $('#createtime').attr('disabled', 'disabled');
        $('#updator').attr('disabled', 'disabled');
        $('#updatetime').attr('disabled', 'disabled');
        $('#config_comments').attr('disabled', 'disabled');
    }

    // 搜索
    $('#searchList').on('click', function () {
        initcjSettingList($('#cjSettingTableList'), $('#cjSettingTableListPagination'), true);
    });

    // 点击添加
    $('#cjAddBtn').on('click', function () {
        var $cjSettingModal = $('#cjSettingEditModal');

        $cjSettingModal.find('.no-input-warning').removeClass('no-input-warning')
        $cjSettingModal.find('.text-danger').addClass('hide');
        $cjSettingModal.find('.modal-title').text('厂家配置添加');
        $cjSettingModal.find('.form-group-cj-search').addClass('hide');
        $cjSettingModal.find('.form-group-cj-add').removeClass('hide');
        $cjSettingModal.find('.modal-footer button').removeClass('hide');
        $cjSettingModal.modal('show');
        modalType = 'add';
        // 新增弹框 数据初始化
        clearForm();
        // 新增弹框 可点击
        removeDisabled();
    })

    // 列表 点击查看
    $('#cjSettingTableList').on('click', '.aui-icon-file', function () {
        var rowIndex = $(this).parent().parent().index(),
            rowData = $("#cjSettingTableList").data("result")[rowIndex],
            $cjSettingModal = $('#cjSettingEditModal');

        $cjSettingModal.find('.no-input-warning').removeClass('no-input-warning')
        $cjSettingModal.find('.text-danger').addClass('hide');
        $cjSettingModal.find('.modal-title').text('厂家配置查看');
        $cjSettingModal.find('.form-group-cj-search').removeClass('hide');
        $cjSettingModal.find('.form-group-cj-add').addClass('hide');
        $cjSettingModal.find('.modal-footer button').addClass('hide');
        $cjSettingModal.modal('show');
        modalType = 'search';
        // 查看弹框 数据初始化
        initForm(rowData);
        // 查看弹框 不可编辑
        searchDisabled();
    });

    // 列表 点击编辑
    $('#cjSettingTableList').on('click', 'td .aui-icon-edit', function () {
        var rowIndex = $(this).parent().parent().index(),
            rowData = $("#cjSettingTableList").data("result")[rowIndex],
            $cjSettingModal = $('#cjSettingEditModal');

        $cjSettingModal.find('.no-input-warning').removeClass('no-input-warning')
        $cjSettingModal.find('.text-danger').addClass('hide');
        $cjSettingModal.find('.modal-title').text('厂家配置编辑');
        $cjSettingModal.find('.form-group-cj-search').addClass('hide');
        $cjSettingModal.find('.form-group-cj-add').removeClass('hide');
        $cjSettingModal.find('.modal-footer button').removeClass('hide');
        $cjSettingModal.modal('show');
        modalType = 'edit';
        editId = rowData.id;
        // 编辑弹框 数据初始化
        initForm(rowData);
        // 编辑弹框 可点击
        removeDisabled();
    });


    // 列表 点击删除
    $('#cjSettingTableList').on('click', '.aui-icon-delete-line', function () {
        // 获取删除行的id
        var rowIndex = $(this).parent().parent().index(),
            rowData = $("#cjSettingTableList").data("result")[rowIndex];
        deleteRowId = rowData.id;
        // 弹框
        $('#cjSettingTipModal').modal('show');
    });

    // 点击删除弹框 确认按钮
    $('#cjSettingTipModalSure').off('click').on('click', function () {
        var port1 = 'v2/algoManufact/delManufactures',
            portData1 = {
                type: 1,
                id: deleteRowId
            },
            portDataSuccessFunc = function (data) {
                if (data.code === '200') {
                    $('#cjSettingTipModal').modal('hide');
                    // 删除成功之后 刷新列表
                    initcjSettingList($('#cjSettingTableList'), $('#cjSettingTableListPagination'), true);
                    warningTip.say(data.message);
                }
            };
        loadData(port1, true, portData1, portDataSuccessFunc, undefined, 'DELETE');
    });

    // 新增/编辑 是否需要保存特征字段 与 特征存储目录字段 之间的联动关系
    $('#config_isNeedSave').selectmenu({
        change: function (event, ui) {
            if (+ui.item.value === 1) {
                // 是否需要保存特征为1 增加为必填
                $('#cjSettingEditModal').find('.feature-path').addClass('aui-form-require');
            } else {
                $('#cjSettingEditModal').find('.feature-path').removeClass('aui-form-require');
            }
        }
    })

    // 添加/编辑 点击弹框确认按钮
    $('#cjSettingEditModalSure').off('click').on('click', function () {
        var platformName = $('#config_platformName').val(),
            platformId = $('#config_platformId').val(),
            isView = +$('#config_isView').val(),
            isUpgrade = +$('#config_isUpgrade').val(),
            isOut = +$('#config_isOut').val(),
            is1v1 = +$('#config_is1v1').val(),
            serviceIp = $('#config_serviceIp').val(),
            servicePort = $('#config_servicePort').val(),
            userName = $('#config_userName').val(),
            passWord = $('#config_passWord').val(),
            isToFactor = +$('#config_isToFactor').val(),
            isNeedSave = +$('#config_isNeedSave').val(),
            storageUrl = $('#config_storageUrl').val(),
            sequences = +$('#config_sequences').val(),
            isScoreFactor = +$('#config_isScoreFactor').val(),
            platType = +$('#config_platType').val(),
            comments = $('#config_comments').val(),
            portData = {
                type: 1,
                platformName: platformName,
                platformId: platformId,
                isView: isView,
                isUpgrade: isUpgrade,
                isOut: isOut,
                is1v1: is1v1,
                serviceIp: serviceIp,
                servicePort: servicePort,
                userName: userName,
                passWord: passWord,
                isToFactor: isToFactor,
                isNeedSave: isNeedSave,
                storageUrl: storageUrl,
                sequences: sequences,
                isScoreFactor: isScoreFactor,
                platType: platType,
                comments: comments
            };
        // 新增或编辑
        if (modalType === 'add' || modalType === 'edit') {
            //校验 不输入直接确定
            Object.keys(portData).forEach(function (key) {
                if (key !== 'type' && key !== 'isView' && key !== 'isUpgrade' && key !== 'isOut' && key !== 'is1v1' && key !== 'isToFactor' && key !== 'isNeedSave' && key !== 'isScoreFactor' && key !== 'platType') {
                    if ($('#config_' + key).val().replace(/\s/g, '') === '') {
                        $('#config_' + key).removeClass('no-input-warning').closest('.control-form').find('.text-danger').addClass('hide');
                        $('#config_' + key).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                    }
                }
            });
            _validateFlag = true
            $('#cjSettingEditModal').find('.text-danger').each(function (index, item) {
                // 如果有字段未通过验证
                if (!$(item).hasClass('hide')) {
                    _validateFlag = false
                }
            })
            var port = 'v2/algoManufact/editManufactures',
                successFunc = function (data) {
                    if (data.code === '200') {
                        $('#cjSettingEditModal').modal('hide');
                        // 新增/编辑成功之后 刷新列表
                        initcjSettingList($('#cjSettingTableList'), $('#cjSettingTableListPagination'), true);
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
            $('#cjSettingEditModal').modal('hide');
        }
    })

    // 单个参数校验方法
    $('#cjSettingEditModal').find('[id^="config_"]').off('blur').on('blur', function () {
        $(this).removeClass('no-input-warning').closest('.control-form').find('.text-danger').addClass('hide');
        if ($(this).val().replace(/\s/g, '') === '' && $(this).attr('id') !== 'config_isView-button' && $(this).attr('id') !== 'config_isUpgrade-button' && $(this).attr('id') !== 'config_isOut-button' && $(this).attr('id') !== 'config_is1v1-button' && $(this).attr('id') !== 'config_isToFactor-button' && $(this).attr('id') !== 'config_isNeedSave-button' && $(this).attr('id') !== 'config_isScoreFactor-button' && $(this).attr('id') !== 'config_platType-button') {
            $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
        } else {
            if ($(this).attr('id') == 'config_platformId') { // 算法厂家ID 失去焦点事件 不能为空 或者是否已存在
                var _port = 'v2/algoManufact/manufactures',
                    _portData = {
                        type: 1,
                        page: '1',
                        size: '10',
                        platformId: $('#config_platformId').val()
                    },
                    _successFunc = function (data) {
                        if (data.code === '200' && data.data.list.length) {
                            $('#config_platformId').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                        }
                    };
                loadData(_port, true, _portData, _successFunc);
            } else if ($(this).attr('id') == 'config_passWord') {
                if ($(this).val().length > 32) {
                    $('#config_passWord').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            } else if ($(this).attr('id') == 'config_serviceIp') {
                // 算法厂家ID 失去焦点事件 不能为空 或者是否已存在
                var _reg = /^(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;
                if (_reg.test($('#config_serviceIp').val()) !== true) {
                    $('#config_serviceIp').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            } else if ($(this).attr('id') == 'config_servicePort') {
                // 校验 厂家服务端口 失去焦点事件 校验如果不为空 必须是合法的端口 端口范围0-65535
                var _reg = /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
                if (_reg.test($('#config_servicePort').val()) !== true) {
                    $('#config_servicePort').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            } else if ($(this).attr('id') == 'config_sequences') {
                // 校验 厂家服务端口 失去焦点事件 校验如果不为空 必须是合法的端口 端口范围0-65535
                var _reg = /^([1-9]\d{0,4})$|^0$/;
                if (_reg.test($('#config_sequences').val()) !== true) {
                    $('#config_sequences').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            }
        }
    })

})(window, window.jQuery)