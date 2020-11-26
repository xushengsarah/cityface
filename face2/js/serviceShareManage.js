(function (window, $) {
    var _serviceType = 1, // 1:融合人像账号配置,2:城市人像账号配置
        _moduleCode = 34, // 1:融合人像账号配置 拥有访问模块权限 34,2:城市人像账号配置 拥有访问模块权限 26
        _validateFlag = true, // 校验标志 默认校验通过
        _selectedFusionCounts = 0, // 被选中的镜头数量
        modalType = '', // 弹框类型 新增/查看/编辑
        serviceFusionData = [], // 返回数据
        selectedFusionData = []; // 多选id数据

    function initPage() {
        // 单选初始化
        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });
        $("#serviceType").selectmenu();
        // 初始化 and 获取'库id数组'字段 下拉框数据
        searchLibIdListVal();
        // 初始化 and 获取'拥有访问模块权限数组'字段 下拉框数据
        searchModuleCodeList();
        // 初始化 and 获取'授权算法厂家'字段 下拉框数据
        searchPlatformIdList();
        // 数据加载
        initServiceFusionImg($('#serviceFusionImgTable'), $('#serviceFusionImgTablePagination'), true);
    }
    initPage();

    // 查看编辑弹框 库id数组 下拉框数据
    function searchLibIdListVal() {
        var port = 'v2/lib/allLibs',
            portData = {},
            portDataSuccessFunc = function (data) {
                if (data.code === '200') {
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
        loadData(port, true, portData, portDataSuccessFunc, '', 'GET');
    }
    // 查看编辑弹框 拥有访问模块权限数组 下拉框数据
    function searchModuleCodeList() {
        var port = 'v2/service/modelInfos',
            portData = {
                'moduleCode': _moduleCode
            },
            portDataSuccessFunc = function (data) {
                if (data.code === '200') {
                    var result = data.data;
                    $container = $('#moduleCodes_val');
                    if (result && result.length) { // 存在返回摄像机
                        var itemHtml = '';
                        for (let i = 0; i < result.length; i++) {
                            itemHtml += `<option value=${result[i].moduleCode}>${result[i].moduleName}</option>`;
                        };
                        $container.empty().append(itemHtml);
                        $container.selectpicker({
                            allowClear: true
                        });
                        // $container.prop('disabled', false);
                        $container.val(null);
                        $container.selectpicker('refresh');
                    } else {
                        // $container.prop('disabled', true); // 摄像机下拉框不可用
                        $container.selectpicker();
                        $container.val(null);
                        $container.selectpicker('refresh');
                    }
                }
            };
        loadData(port, true, portData, portDataSuccessFunc, '', 'GET');
    }
    // 查看编辑弹框 授权算法厂家 下拉框数据
    function searchPlatformIdList() {
        var port = 'v2/algoManufact/allManufactures',
            portData = {
                type: 1
            },
            portDataSuccessFunc = function (data) {
                if (data.code === '200') {
                    var result = data.data;
                    $container = $('#platformIds_val');
                    if (result && result.length) { // 存在返回摄像机
                        var itemHtml = '';
                        for (let i = 0; i < result.length; i++) {
                            itemHtml += `<option value=${result[i].platformId}>${result[i].platformName}</option>`;
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
        loadData(port, true, portData, portDataSuccessFunc, '', 'GET');
    }

    /** 账号配置
     * @param {*} $table // table目标容器
     * @param {*} $pagination  // 分页目标容器
     */
    function initServiceFusionImg($table, $pagination, first) {
        showLoading($table);
        var $tbody = $table.find('tbody'),
            $headItem = $table.find("thead .table-checkbox-all-serviceFusion");
        // 初始化
        _selectedFusionCounts = 0; // 已选项数据置为0
        $('#serviceFusionImg .checked-counts').html(_selectedFusionCounts);
        $headItem.removeAttr("checked"); // 取消全选状态
        selectedFusionData = []; // 批量删除数据清除
        $('#serviceShareTipModal').data('selectData', selectedFusionData);
        $('#deleteBtnFusion').addClass('disabled');
        if (first) {
            $tbody.html('<tr><td colspan="7" class="text-center">No matching records found</td></tr>');
            $pagination.html(''); // 清空分页
        }
        var port = 'v2/service/accounts',
            serviceData = {
                type: _serviceType,
                id: '', // 唯一id
                userName: $('#userNameVal').val() ? $('#userNameVal').val() : '', // 用户名
                userDesc: $('#userDescVal').val() ? $('#userDescVal').val() : '', // 用户描述
                comments: '', //说明
                creator: '', // 创建人
                startTime: $('#startTime1').val() ? $('#startTime1').val() : '',
                endTime: $('#endTime1').val() ? $('#endTime1').val() : '',
                page: '1',
                size: '10',
            },
            successFunc = function (data) {
                hideLoading($table);
                $tbody.empty();
                if (data.code === '200') {
                    var result = data.data.list;
                    serviceFusionData = result;
                    $table.data({
                        'result': result
                    });
                    if (result && result.length > 0) {
                        var html = '';
                        for (var i = 0; i < result.length; i++) {
                            html += `<tr data-index="${i}" class="" keyid="${result[i].id}">
                                <td class="bs-checkbox ">
                                    <div class="table-checkbox">
                                        <input data-index="0" name="btSelectItem" type="checkbox" value="0" class="table-checkbox-input table-checkbox-row-serviceFusion">
                                        <span class="table-checkbox-label"></span>
                                    </div>
                                </td>
                                <td>${result[i].userName || '--'}</td>
                                <td>${result[i].password || '--'}</td>
                                <td>${result[i].limitCount || '--'}</td>
                                <td>${result[i].visitCount || '--'}</td>
                                <td>
                                ${result[i].status === 1 && `<div class="status-item"><i class="status-icon status-icon-success"></i><span class="status-text">允许</span></div>`
                                || result[i].status === 2 && `<div class="status-item"><i class="status-icon status-icon-warning"></i><span class="status-text">禁止</span></div>`
                                || '--'}
                                </td>
                                <td>${result[i].createtime || '--'}</td>
                                <td>${result[i].udpatetime || '--'}</td>
                                <td>
                                    <i class="icon aui-icon-file aui-mr-sm" title="查看"></i>
                                    <i class="icon aui-icon-edit aui-mr-sm" title="编辑"></i>
                                    <i class="icon aui-icon-delete-line aui-mr-sm" title="删除"></i>
                                </td>
                            </tr>`
                        }
                        // 给列表新增行数据
                        $tbody.html(html);
                        $tbody.find("tr").each(function (index, el) {
                            $(el).data('listData', result[index]);
                        });
                        if (data.data.total > Number(serviceData.size) && first) {
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
                                serviceData.page = currPage;
                                serviceData.size = pageSize;
                                initServiceFusionImg($table, '', false)
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        if (result.length === 0) {
                            $tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
                            $('.fixed-table-loading').hide();
                        }
                    }
                } else {
                    $tbody.html('<tr><td colspan="6" class="text-center">No matching records found</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, serviceData, successFunc);
    }

    // 新增弹框 输入框/下拉框 数据初始化
    function clearForm() {
        // 去掉输入框效果，以及提示信息
        var $serviceShareModal = $('#serviceShareEditModal');
        $serviceShareModal.find('.text-danger').addClass('hide');
        $serviceShareModal.find('.no-input-warning').removeClass('no-input-warning');
        // 输入框 初始化
        $serviceShareModal.find('[id$="_val"]').val('');
        // 单选下拉框 初始化
        $("#status_val").selectmenu(); //样式初始化
        $("#status_val").val(null); //内容初始化
        $("#status_val").selectmenu('refresh'); //内容更新
        $("#needPassword_val").selectmenu();
        $("#needPassword_val").val(null);
        $("#needPassword_val").selectmenu('refresh');
        $("#needRight_val").selectmenu();
        $("#needRight_val").val(null);
        $("#needRight_val").selectmenu('refresh');
        $("#netType_val").selectmenu();
        $("#netType_val").val(null);
        $("#netType_val").selectmenu('refresh');
        // 多选下拉框 初始化
        $("#libIds_val").selectpicker('val', '');
        $("#moduleCodes_val").selectpicker('val', '');
        $("#platformIds_val").selectpicker('val', '');
    }

    // 新增/编辑弹框 输入框/下拉框 可编辑
    function removeDisabled() {
        $('#serviceShareEditModal').find('[id$="_val"]').removeAttr('disabled');
        $("#status_val").selectmenu('enable');
        $("#needPassword_val").selectmenu('enable');
        $("#needRight_val").selectmenu('enable');
        $("#netType_val").selectmenu('enable');
        $('#libIds_val').selectpicker('enabled');
        $('#libIds_val').selectpicker('refresh');
        $('#moduleCodes_val').selectpicker('enable');
        $('#moduleCodes_val').selectpicker('refresh');
        $('#platformIds_val').selectpicker('enable');
        $('#platformIds_val').selectpicker('refresh');
    }

    // 新增/编辑弹框 输入框/下拉框 不可编辑
    function searchDisabled() {
        $('#serviceShareEditModal').find('[id$="_val"]').attr('disabled', 'disabled');
        $("#status_val").selectmenu('disable');
        $("#needPassword_val").selectmenu('disable');
        $("#needRight_val").selectmenu('disable');
        $("#netType_val").selectmenu('disable');
        $('#libIds_val').selectpicker('disabled');
        $('#libIds_val').selectpicker('refresh');
        $('#moduleCodes_val').selectpicker('disabled');
        $('#moduleCodes_val').selectpicker('refresh');
        $('#platformIds_val').selectpicker('disabled');
        $('#platformIds_val').selectpicker('refresh');
    }

    /**
     * 查看or编辑赋值
     * @param {string} rowData  // 列表 行数据
     */
    function serviceInitForm(rowData) {
        $('#userName_val').val(rowData.userName);
        $('#userDesc_val').val(rowData.userDesc);
        $('#password_val').val(rowData.password);
        $('#limitCount_val').val(rowData.limitCount);
        $('#resultTop_val').val(rowData.resultTop);
        if (rowData.limitIpList) {
            var limitIpsVal = '';
            for (var i = 0; i < rowData.limitIpList.length; i++) {
                if (i == rowData.limitIpList.length - 1) {
                    limitIpsVal += rowData.limitIpList[i];
                } else {
                    limitIpsVal += rowData.limitIpList[i] + ',';
                }
            }
            $('#limitIps_val').val(limitIpsVal);
        } else {
            $('#limitIps_val').val(rowData.limitIps);
        }
        $('#minScore_val').val(rowData.minScore);
        $('#creator_val').val(rowData.creator);
        $('#createtime_val').val(rowData.createtime);
        $('#updator_val').val(rowData.updator);
        $('#udpatetime_val').val(rowData.udpatetime);
        $('#comments_val').val(rowData.comments);
        // 单选下拉框 赋值
        $('#status_val').val(rowData.status);
        $("#status_val").selectmenu('refresh');
        $('#needPassword_val').val(rowData.needPassword);
        $("#needPassword_val").selectmenu('refresh');
        $('#needRight_val').val(rowData.needRight);
        $("#needRight_val").selectmenu('refresh');
        $('#netType_val').val(rowData.netType);
        $("#netType_val").selectmenu('refresh');

        // 多选下拉框 赋值
        var libIdsVal = [];
        if (rowData && rowData.libList && rowData.libList.length > 0) {
            rowData.libList.forEach(function (item) {
                libIdsVal.push(item.libId);
            })
        }
        $("#libIds_val").selectpicker("val", libIdsVal);
        $("#libIds_val").selectpicker('refresh');
        var moduleCodesVal = [];
        if (rowData && rowData.moduleList && rowData.moduleList.length > 0) {
            rowData.moduleList.forEach(function (item) {
                moduleCodesVal.push(item.moduleCode);
            })
        }
        $("#moduleCodes_val").selectpicker("val", moduleCodesVal);
        $("#moduleCodes_val").selectpicker('refresh');
        var platformIdsVal = [];
        if (rowData && rowData.platformList && rowData.platformList.length > 0) {
            rowData.platformList.forEach(function (item) {
                platformIdsVal.push(item.platformId);
            })
        }
        $("#platformIds_val").selectpicker("val", platformIdsVal);
        $('#platformIds_val').selectpicker('refresh');
    }

    // 搜索按钮 点击事件
    $('#searchButFusion').on('click', function () {
        if ($('#serviceType').val() == 1) {
            _serviceType = 1;
            _moduleCode = 34;
        } else {
            _serviceType = 2;
            _moduleCode = 26;
        }
        searchModuleCodeList(); // 查看编辑弹框 拥有访问模块权限数组 下拉框数据 重新加载
        initServiceFusionImg($('#serviceFusionImgTable'), $('#serviceFusionImgTablePagination'), true);
    })

    // 新增按钮 点击生成弹框事件
    $('#addBtnFusion').on('click', function () {
        var $serviceShareModal = $('#serviceShareEditModal');
        $serviceShareModal.find('.modal-title').text('服务账号配置新增');
        $serviceShareModal.find('.form-group-service-search').addClass('hide');
        $serviceShareModal.find('.modal-footer button').removeClass('hide');
        $serviceShareModal.modal('show');
        modalType = 'add';
        // 新增弹框 数据初始化
        clearForm();
        // 新增弹框 可点击
        removeDisabled();
    });

    // 批量删除按钮 点击事件
    $('#deleteBtnFusion').on('click', function () {
        if (!$('#deleteBtnFusion').hasClass('disabled')) {
            $('#serviceShareTipModal').modal('show');
        }
    });

    // 列表 查看点击事件
    $('#serviceFusionImgTable').on('click', 'td .aui-icon-file', function () {
        var rowData = $(this).closest("tr").data("listData");
        var $serviceShareModal = $('#serviceShareEditModal');
        $serviceShareModal.find('.modal-title').text('服务账号配置查看');
        $serviceShareModal.find('.form-group-service-search').removeClass('hide');
        $serviceShareModal.find('.form-group-service-add').addClass('hide');
        $serviceShareModal.find('.modal-footer button').addClass('hide');
        $serviceShareModal.modal('show');
        modalType = 'search';
        // 新增弹框 数据初始化
        clearForm();
        // 查看弹框 数据初始化
        serviceInitForm(rowData);
        // 查看弹框 不可编辑
        searchDisabled();
    });

    // 列表 编辑点击事件
    $('#serviceFusionImgTable').on('click', 'td .aui-icon-edit', function () {
        var rowData = $(this).closest("tr").data("listData");
        $('#serviceShareEditModal').attr('taskid', rowData.id);
        var $serviceShareModal = $('#serviceShareEditModal');
        $serviceShareModal.find('.modal-title').text('服务账号配置编辑');
        $serviceShareModal.find('.form-group-service-search').addClass('hide');
        $serviceShareModal.find('.form-group-service-add').removeClass('hide');
        $serviceShareModal.find('.modal-footer button').removeClass('hide');
        $serviceShareModal.modal('show');
        modalType = 'edit';
        // 新增弹框 可点击
        removeDisabled();
        // 新增弹框 数据初始化
        clearForm();
        // 查看弹框 数据初始化
        serviceInitForm(rowData);
    });

    // 列表 删除点击事件
    $('#serviceFusionImgTable').on('click', 'td .aui-icon-delete-line', function () {
        $('#serviceShareTipModal').find('text-lg').html('是否删除?');
        $('#serviceShareTipModal').modal('show');
        var rowData = $(this).closest("tr").data("listData");
        $('#serviceShareTipModal').data('selectData', [rowData.id]);
    });

    // 行删除/批量删除 弹框确定按钮点击事件
    $('#serviceShareDeleOk').on('click', function () {
        var rowData = $('#serviceShareTipModal').data('selectData');
        var port = 'v2/service/delAccounts',
            serviceData = {
                type: _serviceType,
                ids: rowData
            },
            successFunc = function (data) {
                if (data.code === '200') {
                    warningTip.say('删除成功');
                } else {
                    warningTip.say(data.message);
                }
                initServiceFusionImg($('#serviceFusionImgTable'), $('#serviceFusionImgTablePagination'), true);
            };
        loadData(port, true, serviceData, successFunc);
    })

    // 列表全选按钮 点击事件
    $("#serviceFusionImgTable").on("click", ".table-checkbox-all-serviceFusion", function () {
        var $checkboxs = $(this).parents("table").find("tbody .table-checkbox-row-serviceFusion");
        if ($(this).is(":checked")) {
            for (var i = 0; i < $checkboxs.length; i++) {
                $checkboxs.eq(i).prop("checked", "checked");
            }
            _selectedFusionCounts = $checkboxs.length;
            selectedFusionData = [];
            serviceFusionData.map(function (e) {
                selectedFusionData.push(e.id);
            });
        } else {
            for (var i = 0; i < $checkboxs.length; i++) {
                $checkboxs.eq(i).removeAttr("checked");
            }
            _selectedFusionCounts = 0;
            selectedFusionData = [];
        }
        // 绑定选中项
        $('#serviceFusionImg .checked-counts').html(_selectedFusionCounts);
        // 判断批量删除是否可用
        if (selectedFusionData.length > 0) {
            $('#deleteBtnFusion').removeClass('disabled');
        } else {
            $('#deleteBtnFusion').addClass('disabled');
        }
        // 删除弹框绑定批量删除数据
        $('#serviceShareTipModal').data('selectData', selectedFusionData);
    });

    // 多选框点击事件
    $('#serviceFusionImgTable').on('click', '.table-checkbox-row-serviceFusion', function () {
        var $this = $(this);
        var rowData = $this.closest("tr").data("listData");
        if (!$(this).is(":checked")) { //取消选中
            //删除数据
            selectedFusionData.map(function (e, n) {
                if (e == rowData.id) {
                    selectedFusionData.splice(n, 1);
                }
            })
            $('#serviceFusionImg .checked-counts').html(--_selectedFusionCounts);
        } else { //选中
            // $this.prop("checked", "checked");
            selectedFusionData.push(rowData.id);
            $('#serviceFusionImg .checked-counts').html(++_selectedFusionCounts);
        }
        // 判断全选框是否选中
        var cardLen = selectedFusionData.length,
            activeLen = $('#serviceFusionImg').find('.table-checkbox-row-serviceFusion').length;
        if (cardLen > 0 && cardLen == activeLen) {
            $('#serviceFusionImg').find('.table-checkbox-all-serviceFusion').prop("checked", "checked");
        } else {
            $('#serviceFusionImg').find('.table-checkbox-all-serviceFusion').removeAttr("checked");
        }
        // 判断批量删除是否可用
        if (selectedFusionData.length > 0) {
            $('#deleteBtnFusion').removeClass('disabled');
        } else {
            $('#deleteBtnFusion').addClass('disabled');
        }
        // 绑定批量删除数据
        $('#serviceShareTipModal').data('selectData', selectedFusionData);
    });

    // 新建or编辑 确认按钮点击事件
    $('#serviceShareOkBut').on('click', function () {
        // 取消之前的校验样式
        $('#serviceShareEditModal').find('.no-input-warning').removeClass('no-input-warning');
        $('#serviceShareEditModal').find('.text-danger').addClass('hide');
        // 赋值
        var id = '';
        if (modalType == 'add') {
            id = '';
        } else {
            id = $('#serviceShareEditModal').attr('taskid') ? $('#serviceShareEditModal').attr('taskid') : '';
        }
        var userName = $('#userName_val').val();
        var userDesc = $('#userDesc_val').val();
        var password = $('#password_val').val();
        var limitCount = $('#limitCount_val').val();
        if (limitCount) {
            limitCount = parseInt(limitCount);
        } else {
            limitCount = '';
        }
        var libIds = [];
        var resultTop = $('#resultTop_val').val();
        if (resultTop) {
            resultTop = parseInt(resultTop);
        } else {
            resultTop = '';
        }
        if (resultTop > 50 || resultTop < 0) {
            resultTop = '';
        }
        var limitIps = $('#limitIps_val').val();
        var moduleCodes = [];
        var status = parseInt($('#status_val').val());
        var minScore = $('#minScore_val').val();
        var needPassword = parseInt($('#needPassword_val').val());
        var needRight = parseInt($('#needRight_val').val());
        var platformIds = [];
        var netType = parseInt($('#netType_val').val());
        var comments = $('#comments_val').val();
        // 多选赋值
        if ($('#limitIps_val').val() !== '') {
            var limitIps = $('#limitIps_val').val().split(',');
        }
        var libIdsObj = $('#libIds_val').selectpicker('getSelectedData', 'value');
        if (libIdsObj.data && libIdsObj.data.length > 0) {
            libIds = libIdsObj.data.map(function (val, index) {
                return val;
            });
        }
        var moduleCodesObj = $('#moduleCodes_val').selectpicker('getSelectedData', 'value');
        if (moduleCodesObj.data && moduleCodesObj.data.length > 0) {
            moduleCodes = moduleCodesObj.data.map(function (val, index) {
                return val;
            });
        }
        var platformIdsObj = $('#platformIds_val').selectpicker('getSelectedData', 'value');
        if (platformIdsObj.data && platformIdsObj.data.length > 0) {
            platformIds = platformIdsObj.data.map(function (val, index) {
                return val;
            });
        }
        var serviceAddData = {
            type: _serviceType,
            id: id, // 唯一id
            userName: userName, // 用户名
            password: password,
            userDesc: userDesc, // 用户描述
            limitCount: limitCount, // 限制访问ip数组
            libIds: libIds,
            resultTop: resultTop,
            limitIps: limitIps,
            moduleCodes: moduleCodes, // 拥有访问模块权限数组
            status: status,
            minScore: minScore, // 特征同步图片质量最低分设置
            needPassword: needPassword, // 是否需要密码
            needRight: needRight, // 是否需要权限校验
            platformIds: platformIds, // 授权算法厂家数组
            netType: netType, // 帐号网络类型
            comments: comments // 说明
        };

        //校验
        var serverFlag = true;
        Object.keys(serviceAddData).forEach(function (key) {
            if (key !== 'type' && key !== 'id' && (serviceAddData[key] === '' || serviceAddData[key].length == 0)) {
                $('#' + key + '_val').addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
                serverFlag = false;
            }
        });
        if (serverFlag) {
            var port = 'v2/service/editAccounts';
            var portDataSuccessFunc = function (data) {
                if (data.code === '200') {
                    var $serviceShareModal = $('#serviceShareEditModal');
                    $serviceShareModal.modal('hide');
                    initServiceFusionImg($('#serviceFusionImgTable'), $('#serviceFusionImgTablePagination'), true);
                    hideLoading($('#serviceShareEditModal .modal-content'));
                    warningTip.say('创建成功');
                } else if (data.code === "623") {
                    hideLoading($('#serviceShareEditModal .modal-content'));
                    warningTip.say(data.message);
                } else {
                    hideLoading($('#serviceShareEditModal .modal-content'));
                    warningTip.say('创建失败');
                }
            };
            loadData(port, true, serviceAddData, portDataSuccessFunc);
            showLoading($('#serviceShareEditModal .modal-content'));
        }
    })

    // 单个参数校验公共方法
    $('#serviceShareEditModal').find('[id$="_val"]').off('blur').on('blur', function () {
        $(this).removeClass('no-input-warning').closest('.control-form').find('.text-danger').addClass('hide'); // 取消校验样式
        if ($(this).val().replace(/\s/g, '') === '') {
            $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
        } else {
            if ($(this).attr('id') == 'password_val') {
                if ($(this).val().length > 32) {
                    $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            } else if ($(this).attr('id') == 'resultTop_val') {
                var resultTop = parseInt($(this).val());
                if (resultTop > 50 || resultTop < 0) {
                    $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            } else if ($(this).attr('id') == 'limitIps_val') {
                // var _reg = /^((\d{1,2}|\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|\d\d|2[0-4]\d|25[0-5])\,)*$/;
                var _reg = /^[0-9.,]+$/;
                if (_reg.test($('#limitIps_val').val()) !== true) {
                    $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            }
        }
    })

})(window, window.jQuery)