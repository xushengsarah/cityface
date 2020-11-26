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
        $("#isView").selectmenu();
        $("#isUpgrade").selectmenu();
        $("#isOut").selectmenu();
        $("#is1v1").selectmenu();
        $("#isToFactor").selectmenu();
        $("#isNeedSave").selectmenu();
        $("#isScoreFactor").selectmenu();
        $("#platType").selectmenu();
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

    // 搜索
    $('#searchList').on('click', function () {
        initcjSettingList($('#cjSettingTableList'), $('#cjSettingTableListPagination'), true);
    });

    // 点击添加
    $('#cjAddBtn').on('click', function () {
        var $cjSettingModal = $('#cjSettingEditModal');

        $cjSettingModal.find('.text-danger').addClass('hide');
        $cjSettingModal.find('.modal-title').text('厂家配置添加');
        $cjSettingModal.find('.form-group-cj-search').addClass('hide');
        $cjSettingModal.find('.form-group-cj-add').removeClass('hide');
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

        $cjSettingModal.find('.text-danger').addClass('hide');
        $cjSettingModal.find('.modal-title').text('厂家配置查看');
        $cjSettingModal.find('.form-group-cj-search').removeClass('hide');
        $cjSettingModal.find('.form-group-cj-add').addClass('hide');
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

        $cjSettingModal.find('.text-danger').addClass('hide');
        $cjSettingModal.find('.modal-title').text('厂家配置编辑');
        $cjSettingModal.find('.form-group-cj-search').addClass('hide');
        $cjSettingModal.find('.form-group-cj-add').removeClass('hide');
        $cjSettingModal.modal('show');
        modalType = 'edit';
        editId = rowData.id;
        // 编辑弹框 数据初始化
        initForm(rowData);
        // 编辑弹框 可点击
        removeDisabled();
    });

    // 新增 数据初始化
    function clearForm() {
        $('#platformNameVal').val('');
        $('#platformIdVal').val('');
        $('#isView').val('0');
        $("#isView").selectmenu('refresh');
        $('#isUpgrade').val('0');
        $("#isUpgrade").selectmenu('refresh');
        $('#isOut').val('0');
        $("#isOut").selectmenu('refresh');
        $('#is1v1').val('0');
        $("#is1v1").selectmenu('refresh');
        $('#platformIPVal').val('');
        $('#platformPortVal').val('');
        $('#usernameVal').val('');
        $('#passwordVal').val('');
        $('#isToFactor').val('0');
        $("#isToFactor").selectmenu('refresh');
        $('#isNeedSave').val('0');
        $("#isNeedSave").selectmenu('refresh');
        $('#storageUrlVal').val('');
        $('#sequencesVal').val('');
        $('#isScoreFactor').val('0');
        $("#isScoreFactor").selectmenu('refresh');
        $('#platType').val('0');
        $("#platType").selectmenu('refresh');
        $('#commentsVal').val('');
    }

    // 查看/编辑 数据初始化
    function initForm(resultData) {
        $('#platformNameVal').val(resultData.platformName);
        $('#platformIdVal').val(resultData.platformId);
        $('#isView').val(resultData.isView);
        $("#isView").selectmenu('refresh');
        $('#isUpgrade').val(resultData.isUpgrade);
        $("#isUpgrade").selectmenu('refresh');
        $('#isOut').val(resultData.isOut);
        $("#isOut").selectmenu('refresh');
        $('#is1v1').val(resultData.is1v1);
        $("#is1v1").selectmenu('refresh');
        $('#platformIPVal').val(resultData.serviceIp);
        $('#platformPortVal').val(resultData.servicePort);
        $('#usernameVal').val(resultData.userName);
        $('#passwordVal').val(resultData.passWord);
        $('#isToFactor').val(resultData.isToFactor);
        $("#isToFactor").selectmenu('refresh');
        $('#isNeedSave').val(resultData.isNeedSave);
        $("#isNeedSave").selectmenu('refresh');
        $('#storageUrlVal').val(resultData.storageUrl);
        $('#isScoreFactor').val(resultData.isScoreFactor);
        $("#isScoreFactor").selectmenu('refresh');
        $('#platType').val(resultData.platType);
        $("#platType").selectmenu('refresh');
        $('#commentsVal').val(resultData.comments);
        // 只有编辑才初始化的字段
        if (modalType === 'edit') {
            $('#sequencesVal').val(resultData.sequences);
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
        $('#platformNameVal').removeAttr('disabled');
        $('#platformIdVal').removeAttr('disabled');
        // 编辑时 厂家id不允许修改
        if (modalType === 'edit') {
            $('#platformIdVal').attr('disabled', 'disabled');
        }
        $('#isView').removeAttr('disabled');
        $("#isView").selectmenu('refresh');
        $('#isUpgrade').removeAttr('disabled');
        $("#isUpgrade").selectmenu('refresh');
        $('#isOut').removeAttr('disabled');
        $("#isOut").selectmenu('refresh');
        $('#is1v1').removeAttr('disabled');
        $("#is1v1").selectmenu('refresh');
        $('#platformIPVal').removeAttr('disabled');
        $('#platformPortVal').removeAttr('disabled');
        $('#usernameVal').removeAttr('disabled');
        $('#passwordVal').removeAttr('disabled');
        $('#isToFactor').removeAttr('disabled');
        $("#isToFactor").selectmenu('refresh');
        $('#isNeedSave').removeAttr('disabled');
        $("#isNeedSave").selectmenu('refresh');
        $('#storageUrlVal').removeAttr('disabled');
        $('#sequencesVal').removeAttr('disabled');
        $('#isScoreFactor').removeAttr('disabled');
        $("#isScoreFactor").selectmenu('refresh');
        $('#platType').removeAttr('disabled');
        $("#platType").selectmenu('refresh');
        $('#commentsVal').removeAttr('disabled');
    }

    // 查看 不可编辑
    function searchDisabled() {
        $('#platformNameVal').attr('disabled', 'disabled');
        $('#platformIdVal').attr('disabled', 'disabled');
        $('#isView').attr('disabled', 'disabled');
        $("#isView").selectmenu('refresh');
        $('#isUpgrade').attr('disabled', 'disabled');
        $("#isUpgrade").selectmenu('refresh');
        $('#isOut').attr('disabled', 'disabled');
        $("#isOut").selectmenu('refresh');
        $('#is1v1').attr('disabled', 'disabled');
        $("#is1v1").selectmenu('refresh');
        $('#platformIPVal').attr('disabled', 'disabled');
        $('#platformPortVal').attr('disabled', 'disabled');
        $('#usernameVal').attr('disabled', 'disabled');
        $('#passwordVal').attr('disabled', 'disabled');
        $('#isToFactor').attr('disabled', 'disabled');
        $("#isToFactor").selectmenu('refresh');
        $('#isNeedSave').attr('disabled', 'disabled');
        $("#isNeedSave").selectmenu('refresh');
        $('#storageUrlVal').attr('disabled', 'disabled');
        $('#isScoreFactor').attr('disabled', 'disabled');
        $("#isScoreFactor").selectmenu('refresh');
        $('#platType').attr('disabled', 'disabled');
        $("#platType").selectmenu('refresh');
        $('#creator').attr('disabled', 'disabled');
        $('#createtime').attr('disabled', 'disabled');
        $('#updator').attr('disabled', 'disabled');
        $('#updatetime').attr('disabled', 'disabled');
        $('#commentsVal').attr('disabled', 'disabled');
    }

    // 列表 点击删除
    $('#cjSettingTableList').on('click', '.aui-icon-delete-line', function () {
        // 获取删除行的id
        var rowIndex = $(this).parent().parent().index(),
            rowData = $("#cjSettingTableList").data("result")[rowIndex];
        deleteRowId = rowData.id;
        // 弹框
        $('#cjSettingModal').modal('show');
    });

    // 点击删除弹框 确认按钮
    $('#cjSettingModalSure').off('click').on('click', function () {
        var port1 = 'v2/algoManufact/delManufactures',
            portData1 = {
                type: 1,
                id: deleteRowId
            },
            portDataSuccessFunc = function (data) {
                if (data.code === '200') {
                    $('#cjSettingModal').modal('hide');
                    // 删除成功之后 刷新列表
                    initcjSettingList($('#cjSettingTableList'), $('#cjSettingTableListPagination'), true);
                    warningTip.say(data.message);
                }
            };
        loadData(port1, true, portData1, portDataSuccessFunc, undefined, 'DELETE');
    });

    // 新增/编辑 是否需要保存特征字段 与 特征存储目录字段 之间的联动关系
    $('#isNeedSave').selectmenu({
        change: function (event, ui) {
            if (+ui.item.value === 1) {
                // 是否需要保存特征为1 增加为必填
                $('#cjSettingEditModal').find('.feature-path').addClass('aui-form-require');
            } else {
                $('#cjSettingEditModal').find('.feature-path').removeClass('aui-form-require');
            }
        }
    })

    // 校验 算法厂家名称 失去焦点事件 不能为空
    $('#platformNameVal').off('blur').on('blur', function () {
        $('#platformNameVal').siblings('.text-danger.tip').addClass('hide');
        if ($('#platformNameVal').val().replace(/\s/g, '') === '') {
            $('#platformNameVal').siblings('.text-danger.tip').removeClass('hide');
        }
    })

    // 校验 算法厂家ID 失去焦点事件 不能为空 或者是否已存在
    $('#platformIdVal').off('blur').on('blur', function () {
        $('#platformIdVal').siblings('.text-danger').addClass('hide');
        if ($('#platformIdVal').val().replace(/\s/g, '') === '') {
            $('#platformIdVal').siblings('.text-danger.tip').removeClass('hide');
        } else {
            var _port = 'v2/algoManufact/manufactures',
                _portData = {
                    type: 1,
                    page: '1',
                    size: '10',
                    platformId: $('#platformIdVal').val()
                },
                _successFunc = function (data) {
                    if (data.code === '200' && data.data.list.length) {
                        $('#platformIdVal').siblings('.text-danger.tip1').removeClass('hide');
                    }
                };
            loadData(_port, true, _portData, _successFunc);
        }
    })

    // 校验 用户名 失去焦点事件 不能为空
    $('#usernameVal').off('blur').on('blur', function () {
        $('#usernameVal').siblings('.text-danger.tip').addClass('hide');
        if ($('#usernameVal').val().replace(/\s/g, '') === '') {
            $('#usernameVal').siblings('.text-danger.tip').removeClass('hide');
        }
    })

    // 校验 密码 失去焦点事件 不能为空
    $('#passwordVal').off('blur').on('blur', function () {
        $('#passwordVal').siblings('.text-danger').addClass('hide');
        if ($('#passwordVal').val().replace(/\s/g, '') === '') {
            $('#passwordVal').siblings('.text-danger.tip').removeClass('hide');
        } else {
            if ($('#passwordVal').val().length > 32) {
                $('#passwordVal').siblings('.text-danger.tip1').removeClass('hide');
            }
        }
    })

    // 校验 特征存储目录 失去焦点事件 如果是否需要保存特征为1 不能为空
    $('#storageUrlVal').off('blur').on('blur', function () {
        $('#storageUrlVal').siblings('.text-danger.tip').addClass('hide');
        if ($('#storageUrlVal').val().replace(/\s/g, '') === '' && $('#isNeedSave').val() === '1') {
            $('#storageUrlVal').siblings('.text-danger.tip').removeClass('hide');
        }
    })

    // 校验 厂家服务IP 失去焦点事件 校验如果不为空 必须是合法的IP
    $('#platformIPVal').off('blur').on('blur', function () {
        $('#platformIPVal').siblings('.text-danger').addClass('hide');
        if ($('#platformIPVal').val().replace(/\s/g, '') !== '') {
            var _reg = /^(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;
            if (_reg.test($('#platformIPVal').val()) !== true) {
                $('#platformIPVal').siblings('.text-danger.tip').removeClass('hide');
            }
        } else {
            $('#platformIPVal').siblings('.text-danger.tip1').removeClass('hide');
        }
    })

    // 校验 厂家服务端口 失去焦点事件 校验如果不为空 必须是合法的端口 端口范围0-65535
    $('#platformPortVal').off('blur').on('blur', function () {
        $('#platformPortVal').siblings('.text-danger').addClass('hide');
        if ($('#platformPortVal').val().replace(/\s/g, '') !== '') {
            var _reg = /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
            if (_reg.test($('#platformPortVal').val()) !== true) {
                $('#platformPortVal').siblings('.text-danger.tip').removeClass('hide');
            }
        } else {
            $('#platformPortVal').siblings('.text-danger.tip1').removeClass('hide');
        }
    })

    // 校验 说明 失去焦点事件 不能为空
    $('#commentsVal').off('blur').on('blur', function () {
        $('#commentsVal').siblings('.text-danger.tip').addClass('hide');
        if ($('#commentsVal').val().replace(/\s/g, '') === '') {
            $('#commentsVal').siblings('.text-danger.tip').removeClass('hide');
        }
    })

    // 校验 排序序列 失去焦点事件 校验如果不为空 必须是首位非0的，1到5位数字
    $('#sequencesVal').off('blur').on('blur', function () {
        $('#sequencesVal').siblings('.text-danger').addClass('hide');
        if ($('#sequencesVal').val().replace(/\s/g, '') !== '') {
            var _reg = /^([1-9]\d{0,4})$|^0$/;
            if (_reg.test($('#sequencesVal').val()) !== true) {
                $('#sequencesVal').siblings('.text-danger.tip').removeClass('hide');
            }
        } else {
            $('#sequencesVal').siblings('.text-danger.tip1').removeClass('hide');
        }
    })

    // 添加/编辑 点击弹框确认按钮
    $('#cjSettingEditModalSure').off('click').on('click', function () {
        var platformName = $('#platformNameVal').val(),
            platformId = $('#platformIdVal').val(),
            isView = +$('#isView').val(),
            isUpgrade = +$('#isUpgrade').val(),
            isOut = +$('#isOut').val(),
            is1v1 = +$('#is1v1').val(),
            serviceIp = $('#platformIPVal').val(),
            servicePort = $('#platformPortVal').val(),
            userName = $('#usernameVal').val(),
            passWord = $('#passwordVal').val(),
            isToFactor = +$('#isToFactor').val(),
            isNeedSave = +$('#isNeedSave').val(),
            storageUrl = $('#storageUrlVal').val(),
            sequences = +$('#sequencesVal').val(),
            isScoreFactor = +$('#isScoreFactor').val(),
            platType = +$('#platType').val(),
            comments = $('#commentsVal').val(),
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
                // 校验算法厂家名称 不能为空
                if (key === 'platformName') {
                    if ($('#platformNameVal').val().replace(/\s/g, '') === '') {
                        $('#platformNameVal').siblings('.text-danger.tip').removeClass('hide');
                    }
                }
                // 校验算法厂家ID 不能为空
                if (key === 'platformId') {
                    if ($('#platformIdVal').val().replace(/\s/g, '') === '') {
                        $('#platformIdVal').siblings('.text-danger').addClass('hide');
                        $('#platformIdVal').siblings('.text-danger.tip').removeClass('hide');
                    }
                }
                // 用户名 不能为空
                if (key === 'userName') {
                    if ($('#usernameVal').val().replace(/\s/g, '') === '') {
                        $('#usernameVal').siblings('.text-danger.tip').removeClass('hide');
                    }
                }
                // 密码 不能为空
                if (key === 'passWord') {
                    if ($('#passwordVal').val().replace(/\s/g, '') === '') {
                        $('#passwordVal').siblings('.text-danger.tip').removeClass('hide');
                    }
                }
                // 厂家服务IP 不能为空
                if (key === 'serviceIp') {
                    if ($('#platformIPVal').val().replace(/\s/g, '') === '') {
                        $('#platformIPVal').siblings('.text-danger').addClass('hide');
                        $('#platformIPVal').siblings('.text-danger.tip1').removeClass('hide');
                    }
                }
                // 厂家服务端口 不能为空
                if (key === 'servicePort') {
                    if ($('#platformPortVal').val().replace(/\s/g, '') === '') {
                        $('#platformPortVal').siblings('.text-danger').addClass('hide');
                        $('#platformPortVal').siblings('.text-danger.tip1').removeClass('hide');
                    }
                }
                // 说明 不能为空
                if (key === 'comments') {
                    if ($('#commentsVal').val().replace(/\s/g, '') === '') {
                        $('#commentsVal').siblings('.text-danger.tip').removeClass('hide');
                    }
                }
                // 排序序列 不能为空
                if (key === 'sequences') {
                    if ($('#sequencesVal').val().replace(/\s/g, '') === '') {
                        $('#sequencesVal').siblings('.text-danger').addClass('hide');
                        $('#sequencesVal').siblings('.text-danger.tip1').removeClass('hide');
                    }
                }
                _validateFlag = true
                $('#cjSettingEditModal').find('.text-danger').each(function (index, item) {
                    // 如果有字段未通过验证
                    if (!$(item).hasClass('hide')) {
                        _validateFlag = false
                    }
                })
            });

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

    // 设置列表已选中条数 V2.0版本 已不用列表多选
    // function createCheckedCounts() {
    //     $('#cjSettingPage #listCheckedCounts').text(selectedCounts);
    //     // 批量删除是否可用
    //     if (selectedCounts > 0) {
    //         $('#cjMultiDeleteBtn').removeClass('disabled');
    //     } else {
    //         $('#cjMultiDeleteBtn').addClass('disabled');
    //     }
    // }

    // 列表头部 全选按钮点击事件 V2.0版本 已不用列表多选
    // $(".table-checkbox-all-cj").on("click",function(){
    //     var rowItem = $(this).parents("table").find("tbody .table-checkbox-row-cj");
    //     if($(this).is(":checked")){
    //         for(var i=0;i<rowItem.length;i++){
    //             rowItem.eq(i).prop("checked","checked");
    //         }
    //         selectedCounts = rowItem.length;
    //         createCheckedCounts();
    //     }else{
    //         for(var i=0;i<rowItem.length;i++){
    //             rowItem.eq(i).removeAttr("checked");
    //         }
    //         selectedCounts = 0;
    //         createCheckedCounts();
    //     }
    // });

    // 列表数据 每一行选框点击事件 V2.0版本 已不用列表多选
    // $(document).on("change",".table-checkbox-row-cj",function(){
    //     var rowItem = $(this).parents("table").find("tbody .table-checkbox-row-cj"),
    //         headItem = $(this).parents("table").find("thead .table-checkbox-all-cj");
    //     if ($(this).is(":checked")) {
    //         selectedCounts++;
    //     } else {
    //         selectedCounts--;
    //     }
    //     createCheckedCounts();
    //     for(var i=0;i<rowItem.length;i++){
    //         if(!rowItem.eq(i).is(":checked")){
    //             headItem.removeAttr("checked");
    //             return;
    //         }
    //     }
    //     headItem.prop("checked","checked");
    // });


    // 列表 批量删除 点击生成弹框 V2.0版本 已不用批量删除
    // $('#cjMultiDeleteBtn').on('click', function(e){
    //     if (!$(this).hasClass('disabled')) {
    //         $('#cjSettingModal').modal('show');
    //         deleteType = 'multiDelete';
    //     }
    // });

})(window, window.jQuery)