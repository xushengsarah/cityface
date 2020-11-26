(function (window, $) {
    // 图片存储配置管理
    var _validateFlag = true, // 校验标志 默认校验通过
        modalType = '', // 弹框类型 新增/查看/编辑
        editId = '', // 编辑数据项的id
        deleteRowId = ''; // 删除单行的Id

    $("#urlTypeVal").selectmenu(); // 搜索 下拉框
    $("#config_urlType").selectmenu();

    // 下拉框 初始化
    function initSelected() {
        $("#config_isDefault").selectmenu();
        var port = 'v2/dic/dictionaryInfo',
            data = {
                'kind': 'PIC_URL_TYPE'
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    var urlType = data.data;
                    if (urlType) {
                        var _typeHtml1 = '',
                            _typeHtml2 = '';
                        _typeHtml1 += `<option value="">全部</option>`
                        for (var i = 0; i < urlType.length; i++) {
                            _typeHtml1 += `<option value=${urlType[i].id}>${urlType[i].name}</option>`
                            _typeHtml2 += `<option value=${urlType[i].id}>${urlType[i].name}</option>`
                        }
                        $("#urlTypeVal").empty().html(_typeHtml1);
                        $("#config_urlType").empty().html(_typeHtml2);
                        $("#urlTypeVal").selectmenu(); // 搜索 下拉框
                        $("#config_urlType").selectmenu();
                    }
                } else {
                    warning.say(data.msg);
                }
            };
        loadData(port, true, data, successFunc, '', 'GET');
    }
    initSelected();

    // 查询列表
    function initImageStorageList($table, $pagination, first, page, size) {
        var $tbody = $('#imageStorageTableList').find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v2/picStorage/configs',
            portData = {
                page: page ? page : '1',
                size: size ? size : '10',
                httpIp: $('#httpIpVal').val() ? $('#httpIpVal').val() : '',
                urlType: $('#urlTypeVal').val() ? $('#urlTypeVal').val() : ''
            },
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
                            if (result[i].urlType === 1) {
                                var urlTypeName = '融合人像图片';
                            } else if (result[i].urlType === 2) {
                                var urlTypeName = '融合人像特征';
                            } else {
                                var urlTypeName = '布控照片';
                            }
                            html += `<tr data-index="${i}" class="" keyid="${result[i].id}">
                                <td>${result[i].httpIp || '--'}</td>
                                <td>${result[i].isDefault || '--'}</td>
                                <td>${urlTypeName || '--'}</td>
                                <td>${result[i].mlbs || '--'}</td>
                                <td>${result[i].creator || '--'}</td>
                                <td>${result[i].createtime || '--'}</td>
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
                                initImageStorageList($table, '', false, currPage, pageSize)
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
                        $('.fixed-table-loading').hide();
                    }
                } else {
                    $tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, portData, successFunc);
    }
    initImageStorageList($('#imageStorageTableList'), $('#imageStorageTableListPagination'), true);

    // 搜索
    $('#searchBtn').on('click', function () {
        initImageStorageList($('#imageStorageTableList'), $('#imageStorageTableListPagination'), true);
    });

    // 点击添加
    $('#imgStorageAddBtn').on('click', function () {
        var $imageStorageModal = $('#imageStorageEditModal');
        $imageStorageModal.find('.no-input-warning').removeClass('no-input-warning')
        $imageStorageModal.find('.text-danger').addClass('hide');
        $imageStorageModal.find('.modal-title').text('图片存储配置添加');
        $imageStorageModal.find('.form-group-imgstorage-search').addClass('hide');
        $imageStorageModal.find('.modal-footer button').removeClass('hide');
        $imageStorageModal.modal('show');
        modalType = 'add';
        // 新增弹框 数据初始化
        clearForm();
        // 新增弹框 可点击
        removeDisabled();
    })

    // 列表 点击查看
    $('#imageStorageTableList').on('click', '.aui-icon-file', function () {
        var rowIndex = $(this).parent().parent().index(),
            rowData = $("#imageStorageTableList").data("result")[rowIndex],
            $imageStorageModal = $('#imageStorageEditModal');
        $imageStorageModal.find('.no-input-warning').removeClass('no-input-warning')
        $imageStorageModal.find('.text-danger').addClass('hide');
        $imageStorageModal.find('.modal-title').text('图片存储配置查看');
        $imageStorageModal.find('.form-group-imgstorage-search').removeClass('hide');
        $imageStorageModal.find('.modal-footer button').addClass('hide');
        $imageStorageModal.modal('show');
        modalType = 'search';
        // 查看弹框 数据初始化
        initForm(rowData);
        // 查看弹框 不可编辑
        searchDisabled();
    });

    // 列表 点击编辑
    $('#imageStorageTableList').on('click', 'td .aui-icon-edit', function () {
        var rowIndex = $(this).parent().parent().index(),
            rowData = $("#imageStorageTableList").data("result")[rowIndex],
            $imageStorageModal = $('#imageStorageEditModal');
        $imageStorageModal.find('.no-input-warning').removeClass('no-input-warning')
        $imageStorageModal.find('.text-danger').addClass('hide');
        $imageStorageModal.find('.modal-title').text('图片存储配置编辑');
        $imageStorageModal.find('.form-group-imgstorage-search').addClass('hide');
        $imageStorageModal.find('.modal-footer button').removeClass('hide');
        $imageStorageModal.modal('show');
        modalType = 'edit';
        editId = rowData.id;
        // 编辑弹框 数据初始化
        initForm(rowData);
        // 编辑弹框 可点击
        removeDisabled();
    });

    // 新增 数据初始化
    function clearForm() {
        $('#config_httpIp').val('');
        $('#config_httpPort').val('');
        $('#config_httpUrl').val('');
        $('#config_ftpIp').val('');
        $('#config_ftpPort').val('');
        $('#config_ftpUrl').val('');
        $('#config_ftpUser').val('');
        $('#config_ftpPasswd').val('');
        $('#config_mlbs').val('');
        $('#config_comments').val('');

        $('#config_isDefault').val('0');
        $("#config_isDefault").selectmenu('refresh');
        $('#config_urlType').val('1');
        $("#config_urlType").selectmenu('refresh');
    }

    // 查看/编辑 数据初始化
    function initForm(resultData) {
        $('#config_httpIp').val(resultData.httpIp);
        $('#config_httpPort').val(resultData.httpPort);
        $('#config_httpUrl').val(resultData.httpUrl);
        $('#config_ftpIp').val(resultData.ftpIp);
        $('#config_ftpPort').val(resultData.ftpPort);
        $('#config_ftpUrl').val(resultData.ftpUrl);
        $('#config_ftpUser').val(resultData.ftpUser);
        $('#config_ftpPasswd').val(resultData.ftpPasswd);
        $('#config_mlbs').val(resultData.mlbs);
        $('#config_comments').val(resultData.comments);

        $('#config_isDefault').val(resultData.isDefault);
        $("#config_isDefault").selectmenu('refresh');
        $('#config_urlType').val(resultData.urlType);
        $("#config_urlType").selectmenu('refresh');

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
        $('#config_httpIp').removeAttr('disabled');
        $('#config_httpPort').removeAttr('disabled');
        $('#config_httpUrl').removeAttr('disabled');
        $('#config_ftpIp').removeAttr('disabled');
        $('#config_ftpPort').removeAttr('disabled');
        $('#config_ftpUrl').removeAttr('disabled');
        $('#config_ftpUser').removeAttr('disabled');
        $('#config_ftpPasswd').removeAttr('disabled');
        $('#config_mlbs').removeAttr('disabled');
        $('#config_comments').removeAttr('disabled');

        $('#config_isDefault').removeAttr('disabled');
        $("#config_isDefault").selectmenu('refresh');
        $('#config_urlType').removeAttr('disabled');
        $("#config_urlType").selectmenu('refresh');
    }

    // 查看 不可编辑
    function searchDisabled() {
        $('#config_httpIp').attr('disabled', 'disabled');
        $('#config_httpPort').attr('disabled', 'disabled');
        $('#config_httpUrl').attr('disabled', 'disabled');
        $('#config_ftpIp').attr('disabled', 'disabled');
        $('#config_ftpPort').attr('disabled', 'disabled');
        $('#config_ftpUrl').attr('disabled', 'disabled');
        $('#config_ftpUser').attr('disabled', 'disabled');
        $('#config_ftpPasswd').attr('disabled', 'disabled');
        $('#config_mlbs').attr('disabled', 'disabled');
        $('#config_comments').attr('disabled', 'disabled');
        $('#creator').attr('disabled', 'disabled');
        $('#createtime').attr('disabled', 'disabled');
        $('#updator').attr('disabled', 'disabled');
        $('#updatetime').attr('disabled', 'disabled');

        $('#config_isDefault').attr('disabled', 'disabled');
        $("#config_isDefault").selectmenu('refresh');
        $('#config_urlType').attr('disabled', 'disabled');
        $("#config_urlType").selectmenu('refresh');
    }

    // 列表 点击删除
    $('#imageStorageTableList').on('click', '.aui-icon-delete-line', function () {
        // 获取删除行的id
        var rowIndex = $(this).parent().parent().index(),
            rowData = $("#imageStorageTableList").data("result")[rowIndex];
        deleteRowId = rowData.id;
        // 弹框
        $('#imageStorageDelModal').modal('show');
    });

    // 点击删除弹框 确认按钮
    $('#imageStorageDelModalSure').off('click').on('click', function () {
        var port1 = 'v2/picStorage/delConfigs',
            portData1 = {
                id: deleteRowId
            },
            portDataSuccessFunc = function (data) {
                if (data.code === '200') {
                    $('#imageStorageDelModal').modal('hide');
                    // 删除成功之后 刷新列表
                    initImageStorageList($('#imageStorageTableList'), $('#imageStorageTableListPagination'), true);
                    warningTip.say(data.message);
                }
            };
        loadData(port1, true, portData1, portDataSuccessFunc, undefined, 'DELETE');
    });

    // 添加/编辑 点击弹框确认按钮
    $('#imageStorageEditModalSure').off('click').on('click', function () {
        var httpIp = $('#config_httpIp').val(),
            httpPort = $('#config_httpPort').val(),
            httpUrl = $('#config_httpUrl').val(),
            ftpIp = $('#config_ftpIp').val(),
            ftpPort = $('#config_ftpPort').val(),
            ftpUrl = $('#config_ftpUrl').val(),
            ftpUser = $('#config_ftpUser').val(),
            ftpPasswd = $('#config_ftpPasswd').val(),
            mlbs = $('#config_mlbs').val(),
            comments = $('#config_comments').val(),
            isDefault = +$('#config_isDefault').val(),
            urlType = +$('#config_urlType').val(),
            portData = {
                httpIp: httpIp,
                httpPort: httpPort,
                httpUrl: httpUrl,
                ftpIp: ftpIp,
                ftpPort: ftpPort,
                ftpUrl: ftpUrl,
                ftpUser: ftpUser,
                ftpPasswd: ftpPasswd,
                mlbs: mlbs,
                comments: comments,
                isDefault: isDefault,
                urlType: urlType
            };
        // 新增或编辑
        if (modalType === 'add' || modalType === 'edit') {
            //校验 不输入直接确定
            Object.keys(portData).forEach(function (key) {
                if (key !== 'isDefault' && key !== 'urlType') {
                    if ($('#config_' + key).val().replace(/\s/g, '') === '') {
                        $('#config_' + key).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                    }
                }
            });
            _validateFlag = true
            $('#imageStorageEditModal').find('.text-danger').each(function (index, item) {
                // 如果有字段未通过验证
                if (!$(item).hasClass('hide')) {
                    _validateFlag = false
                }
            })
            var port = 'v2/picStorage/editConfigs',
                successFunc = function (data) {
                    if (data.code === '200') {
                        $('#imageStorageEditModal').modal('hide');
                        // 新增/编辑成功之后 刷新列表
                        initImageStorageList($('#imageStorageTableList'), $('#imageStorageTableListPagination'), true);
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
            $('#imageStorageEditModal').modal('hide');
        }
    })

    // 单个参数校验方法
    $('#imageStorageEditModal').find('[id^="config_"]').off('blur').on('blur', function () {
        $(this).removeClass('no-input-warning').closest('.control-form').find('.text-danger').addClass('hide');
        if ($(this).val().replace(/\s/g, '') === '' && $(this).attr('id') !== 'config_isDefault-button' && $(this).attr('id') !== 'config_urlType-button') {
            $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
        } else {
            if ($(this).attr('id') == 'config_httpIp') {
                var _reg = /^http:\/\/(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])$/;
                if (_reg.test($('#config_httpIp').val()) !== true) {
                    $('#config_httpIp').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            } else if ($(this).attr('id') == 'config_httpPort') {
                var _reg = /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
                if (_reg.test($('#config_httpPort').val()) !== true) {
                    $('#config_httpPort').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            } else if ($(this).attr('id') == 'config_ftpIp') {
                var _reg = /^ftp:\/\/(\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])$/;
                if (_reg.test($('#config_ftpIp').val()) !== true) {
                    $('#config_ftpIp').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            } else if ($(this).attr('id') == 'config_ftpPort') {
                var _reg = /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
                if (_reg.test($('#config_ftpPort').val()) !== true) {
                    $('#config_ftpPort').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            } else if ($(this).attr('id') == 'config_ftpPasswd') {
                if ($('#config_ftpPasswd').val().length > 32) {
                    $('#config_ftpPasswd').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            }
        }
    })

})(window, window.jQuery)