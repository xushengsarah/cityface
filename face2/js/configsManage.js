(function (window, $) {
    var serviceData = {
            id: '', // 唯一id
            orgId: '',
            orgName: '', // 用户名
            creator: '', // 创建人
            startTime: '',
            endTime: '',
            page: '1',
            size: '10',
        },
        modalType = ''; // 弹框类型 新增/查看/编辑

    // 单选初始化
    $('[data-role="radio"]').checkboxradio();
    $('[data-role="radio-button"]').checkboxradio({
        icon: false
    });

    //后台返回的数据进行转换
    function toChangeData(data) {
        var parentArr = data.filter(value => {
            return value.parentId == null;
        });

        var childrenArr = data.filter(value => {
            return value.parentId != null;
        });

        function toChange(parentArr, childrenArr) {
            parentArr.forEach((parent) => {
                childrenArr.forEach((child) => {
                    if (child.parentId == parent.orgId) {
                        toChange([child], childrenArr);
                        if (parent.children) {
                            parent.children.push(child);
                        } else {
                            parent.children = [child];
                        }
                    }
                });
            });
        }
        toChange(parentArr, childrenArr);
        return parentArr;
    }

    // 提交数据初始化
    function initConfigsData() {
        serviceData = {
            id: '', // 唯一id
            orgId: '',
            orgName: '', // 用户名
            creator: '', // 创建人
            startTime: '',
            endTime: '',
            page: '1',
            size: '10',
        };
    }

    /** 布控库配置
     * @param {*} $table // table目标容器
     * @param {*} $pagination  // 分页目标容器
     */
    function initConfigsManage($table, $pagination, first) {
        showLoading($table);
        var $tbody = $table.find('tbody'),
            $headItem = $table.find("thead .table-checkbox-all-configs");
        // 初始化
        $headItem.removeAttr("checked"); // 取消全选状态
        if (first) {
            $tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
            $pagination.html(''); // 清空分页
        }
        var port = 'v2/libs/configs',
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
                                <td>${result[i].orgName || '--'}</td>
                                <td>${result[i].maxLibs || '--'}</td>
                                <td>${result[i].maxCounts || '--'}</td>
                                <td>${result[i].allCounts || '--'}</td>
                                <td>${result[i].createtime || '--'}</td>
                                <td>${result[i].udpatetime || '--'}</td>
                                <td>
                                    <i class="icon aui-icon-file aui-mr-sm" title="查看"></i>
                                    <i class="icon aui-icon-edit aui-mr-sm" title="编辑"></i>
                                    <i class="icon aui-icon-delete-line aui-mr-sm" title="删除"></i>
                                </td>
                            </tr>`
                        }
                        // 给列表添加行数据
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
                                initConfigsManage($table, '', false)
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
        loadData(port, true, serviceData, successFunc);
    }
    initConfigsManage($('#configsContentTable'), $('#configsContentTablePagination'), true);

    // 新增弹框 输入框/下拉框 数据初始化
    function clearForm() {
        // 去掉输入框效果，以及提示信息
        var $serviceShareModal = $('#configsEditModal');
        $serviceShareModal.find('.text-danger').addClass('hide');
        $serviceShareModal.find('input').removeClass('no-input-warning');
        $serviceShareModal.find('textarea').removeClass('no-input-warning');
        $serviceShareModal.find('select').removeClass('no-input-warning');
        // 输入框 数据初始化
        $serviceShareModal.find('input').val('');
        $serviceShareModal.find('textarea').val('');
        $serviceShareModal.find('select').val('');
        // 多选下拉框 数据初始化
        // $("#config_orgName").selectpicker('val', '');
    }

    // 新增/编辑弹框 输入框/下拉框 可编辑
    function removeDisabled() {
        $('#configsEditModal').find('.aui-form-label').addClass('aui-form-require');
        $('#configsEditModal').find('input').removeAttr('disabled');
        $('#configsEditModal').find('textarea').removeAttr('disabled');

        $('#orgNameVal').selectpicker('enabled');
        $('#orgNameVal').selectpicker('refresh');
    }

    // 新增/编辑弹框 输入框/下拉框 不可编辑
    function searchDisabled() {
        $('#configsEditModal').find('.aui-form-label').removeClass('aui-form-require');
        $('#configsEditModal').find('input').attr('disabled', 'disabled');
        $('#configsEditModal').find('textarea').attr('disabled', 'disabled');

        $('#orgNameVal').selectpicker('disabled');
        $('#orgNameVal').selectpicker('refresh');
    }

    /**
     * 查看or编辑赋值
     * @param {string} rowData  // 列表 行数据
     */
    function serviceInitForm(rowData) {
        // 多选下拉框 赋值
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
                    $('#config_orgName').data({
                        'cameraList': matchList(control_bodyList, [{
                            'orgId': rowData.orgId
                        }]).newCameraList,
                        'gidArr': matchList(control_bodyList, [{
                            'orgId': rowData.orgId
                        }]).newGidArr
                    }).val(matchList(control_bodyList, [{
                        'orgId': rowData.orgId
                    }]).newNameArr.join(','));
                }
            };
        loadData(port, true, dataLoad1, successFunc, '', 'GET');
        // 单选框赋值
        //布控区域-地图 赋值
        if (rowData.maxCounts <= 0) {
            $('#configsRadioLable2').click();
        }
        // 输入框赋值
        $('#config_maxLibs').val(rowData.maxLibs);
        $('#config_maxCounts').val(rowData.maxCounts);
        $('#config_allCounts').val(rowData.allCounts);
        $('#creator').val(rowData.creator);
        $('#createtime').val(rowData.createtime);
        $('#updator').val(rowData.updator);
        $('#udpatetime').val(rowData.udpatetime);
        $('#config_comments').val(rowData.comments);
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

    // 机构名称 输入框点击事件 调用树组件
    $('#config_orgName').orgTree({
        all: true, //人物组织都开启
        area: ['620px', '542px'], //弹窗框宽高
        search: true, //开启搜索
        newBk: true,
        noMap: true,
        ajaxFilter: true,
        node: 'config_orgName',
        selectOne: true, // 树结构选择框只能选择一个
        contain: "1", // 树结构中是否包含警种
        viewType: true //可见范围都要加上这个属性，请求参数不同
    });

    // 机构名称 输入框点击事件 调用树组件
    $('#configsOrgName').orgTree({
        all: true, //人物组织都开启
        area: ['620px', '542px'], //弹窗框宽高
        search: true, //开启搜索
        newBk: true,
        noMap: true,
        ajaxFilter: true,
        node: 'configsOrgName',
        selectOne: true, // 树结构选择框只能选择一个
        contain: "1", // 树结构中是否包含警种
        viewType: true // 可见范围都要加上这个属性，请求参数不同
    });

    // 搜索按钮 点击事件
    $('#configsSearchBut').on('click', function () {
        if ($('#configsOrgName').val()) {
            serviceData.orgName = $('#configsOrgName').data('cameraList')[0].id ? $('#configsOrgName').data('cameraList')[0].id : '';
        } else {
            serviceData.orgName = '';
        }
        serviceData.startTime = $('#startTime').val() ? $('#startTime').val() : '';
        serviceData.endTime = $('#startTime').val() ? $('#startTime').val() : '';
        initConfigsManage($('#configsContentTable'), $('#configsContentTablePagination'), true);
    })

    // 添加按钮 点击生成弹框事件
    $('#configsAddBtn').on('click', function () {
        var $serviceShareModal = $('#configsEditModal');
        $serviceShareModal.find('.modal-title').text('布控库配置');
        $serviceShareModal.find('.form-group-configs-search').addClass('hide');
        $serviceShareModal.find('.modal-footer button').removeClass('hide');
        $serviceShareModal.modal('show');
        modalType = 'add';
        // 添加弹框 数据初始化
        clearForm();
        // 添加弹框 可点击
        removeDisabled();
    });

    // 列表 查看点击事件
    $('#configsContentTable').on('click', 'td .aui-icon-file', function () {
        var rowData = $(this).closest("tr").data("listData");
        var $serviceShareModal = $('#configsEditModal');
        $serviceShareModal.find('.modal-title').text('布控库配置');
        $serviceShareModal.find('.form-group-configs-search').removeClass('hide');
        $serviceShareModal.find('.modal-footer button').addClass('hide');
        $serviceShareModal.modal('show');
        modalType = 'search';
        // 添加弹框 数据初始化
        clearForm();
        // 查看弹框 数据初始化
        serviceInitForm(rowData);
        // 查看弹框 不可编辑
        searchDisabled();
    });

    // 列表 编辑点击事件
    $('#configsContentTable').on('click', 'td .aui-icon-edit', function () {
        var rowData = $(this).closest("tr").data("listData");
        $('#configsEditModal').attr('taskid', rowData.id);
        var $serviceShareModal = $('#configsEditModal');
        $serviceShareModal.find('.modal-title').text('布控库配置');
        $serviceShareModal.find('.form-group-configs-search').addClass('hide');
        $serviceShareModal.find('.modal-footer button').removeClass('hide');
        $serviceShareModal.modal('show');
        modalType = 'edit';
        // 添加弹框 数据初始化
        clearForm();
        // 添加弹框 可点击
        removeDisabled();
        // 查看弹框 数据初始化
        serviceInitForm(rowData);
    });

    // 列表 删除按钮点击事件
    $('#configsContentTable').on('click', 'td .aui-icon-delete-line', function () {
        $('#configsTipModal').modal('show');
        var rowData = $(this).closest("tr").data("listData");
        $('#configsTipModal').data('selectData', rowData.id);
    });

    // 删除弹框 确定按钮点击事件
    $('#configsDeleOk').on('click', function () {
        var rowData = $('#configsTipModal').data('selectData');
        var port = 'v2/libs/delConfigs',
            serviceData = {
                id: rowData
            },
            successFunc = function (data) {
                if (data.code === '200') {
                    warningTip.say('删除成功');
                } else {
                    warningTip.say(data.message);
                }
                initConfigsData();
                initConfigsManage($('#configsContentTable'), $('#configsContentTablePagination'), true);
            };
        loadData(port, true, serviceData, successFunc, undefined, 'DELETE');
    })

    // 新建or编辑 确认按钮点击事件
    $('#configsOkBut').on('click', function () {
        // 取消之前的校验样式
        $('#configsEditModal').find('.no-input-warning').removeClass('no-input-warning');
        $('#configsEditModal').find('.text-danger.tip').addClass('hide');
        // 赋值
        if (modalType = 'add') {
            var id = "";
        } else {
            var id = $('#configsEditModal').attr('taskid') ? $('#configsEditModal').attr('taskid') : '';
        }
        if ($('#config_orgName').val()) {
            var orgId = $('#config_orgName').data('cameraList')[0].id;
            var orgName = $('#config_orgName').data('cameraList')[0].name;
        } else {
            var orgId = '';
            var orgName = '';
        }
        var maxLibs = $('#config_maxLibs').val();
        var maxCounts = $('#config_maxCounts').val();
        var allCounts = $('#config_allCounts').val();
        if (maxCounts === 0) {
            warningTip.say('单库数量不为0,或输入总数');
            return;
        } else if (maxCounts > 0 && $("#configsRadioLable1").hasClass("ui-checkboxradio-checked")) {
            allCounts = '';
        } else {
            maxCounts = '';
        }
        var comments = $('#config_comments').val();

        var serviceAddData = {
            id: id, // 唯一id
            orgId: orgId,
            maxLibs: parseInt(maxLibs), // 拥有访问模块权限数组
            maxCounts: parseInt(maxCounts),
            allCounts: parseInt(allCounts),
            comments: comments // 说明
        };
        // 校验
        var serverFlag = true;
        Object.keys(serviceAddData).forEach(function (key) {
            if (key == 'maxLibs' || key === 'maxCounts' || key === 'allCounts') {
                if (isNaN(serviceAddData[key])) {
                    $('#config_' + key).addClass('no-input-warning').closest('.aui-col-12').find('.text-danger').removeClass('hide');
                    serverFlag = false;
                }
            } else if (key === 'orgId' && serviceAddData[key] === '') {
                $('#config_orgName').addClass('no-input-warning').closest('.aui-col-12').find('.text-danger').removeClass('hide');
                serverFlag = false;
            } else {
                if (serviceAddData[key] === '') {
                    $('#config_' + key).addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').removeClass('hide');
                    serverFlag = false;
                }
            }
        });
        if (serverFlag) {
            var port = 'v2/libs/editConfigs';
            var portDataSuccessFunc = function (data) {
                if (data.code === '200') {
                    var $serviceShareModal = $('#configsEditModal');
                    $serviceShareModal.modal('hide');
                    initConfigsData();
                    initConfigsManage($('#configsContentTable'), $('#configsContentTablePagination'), true);
                    hideLoading($('#configsEditModal .modal-content'));
                    warningTip.say('创建成功');
                } else if (data.code === "623") {
                    hideLoading($('#configsEditModal .modal-content'));
                    warningTip.say(data.message);
                } else {
                    hideLoading($('#configsEditModal .modal-content'));
                    warningTip.say('创建失败');
                }
            };
            loadData(port, true, serviceAddData, portDataSuccessFunc);
            showLoading($('#configsEditModal .modal-content'));
        }
    })

    // 添加进度选择类型
    $('#configsRadio').find('[type="radio"]').on("change", function () {
        if ($(this).attr('id') == 'configsRadio1') {
            $("#config_allCounts").closest('.aui-col-12').addClass("hide");
            $("#config_maxCounts").closest('.aui-col-12').removeClass("hide");
        } else {
            $("#config_maxCounts").closest('.aui-col-12').addClass("hide");
            $("#config_allCounts").closest('.aui-col-12').removeClass("hide");
        }
    });

    // 单个参数校验方法
    $('#configsEditModal').find('[id^="config_"]').off('blur').on('blur', function () {
        $(this).removeClass('no-input-warning').closest('.control-form').find('.text-danger').addClass('hide');
        if ($(this).val().replace(/\s/g, '') === '') {
            $(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
        } else {
            if ($(this).attr('id') == 'config_maxLibs') {
                if ($(this).val().length > 3) {
                    this.addClass('no-input-warning').closest('.control-form').find('.text-danger.tip1').removeClass('hide');
                }
            }
        }
    })

})(window, window.jQuery)