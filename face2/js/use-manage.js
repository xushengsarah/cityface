(function (window, $) {
    //考核报表数据
    var configKHData = {
        roleType: 1,
        orgId: '10',
        startTime: '',
        endTime: '',
    }

    //异常报表数据
    var configYCData = {
        roleType: 1,
        orgId: '10',
        startTime: '',
        endTime: ''
    }

    init();

    //统计报表按钮点击事件
    function init() {
        getAllOrgId($("#useManage"));

        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });

        // 初始化数据
        configKHData = {
            roleType: 1,
            orgId: '10',
            startTime: '',
            endTime: '',
        }

        configKHData.startTime = $.trim(sureSelectTime(-1, true).date);
        configKHData.endTime = $.trim(sureSelectTime(-1, true).date);

        $("#useManageOneDateSnap").val(configKHData.endTime);
        $("#useManageOneDateStart").val($.trim(sureSelectTime(-8, true).date));
        $("#useManageOneDateEnd").val($.trim(sureSelectTime(-1, true).date));
    }

    //考核显示
    function parmasKHMatter(value, row, index) {
        return value;
    }

    //静态和动态的title显示
    function parmasMatter(value, row, index) {
        var span = document.createElement('span');
        span.setAttribute('title', value);
        span.innerHTML = value;
        return span.outerHTML;
    }

    //考核转换
    function commonGetKHName(key) {
        let keyName = '';
        switch (key) {
            case 'accountNum':
                keyName = '账号总数';
                break;
            case 'loginPersonNum':
                keyName = '登录总人数';
                break;
            case 'notUseAccountNum':
                keyName = '未使用人数';
                break;
            case 'loginAllNum':
                keyName = '登录总次数';
                break;
            case 'staticNum':
                keyName = '静态人像比对次数';
                break;
            case 'dynamicNum':
                keyName = '动态人像比对次数';
                break;
            case 'applyAllNum':
                keyName = '权限申请总次数';
                break;
            case 'applyLaNum':
                keyName = '立案申请（次）';
                break;
            case 'applyJqNum':
                keyName = '警情申请（次）';
                break;
            case 'applyZaNum':
                keyName = '专项工作申请（次）';
                break;
            case 'applyXbNum':
                keyName = '协办申请（次）';
                break;
            case 'applyEmergentNum':
                keyName = '紧急警务申请（次）';
                break;
            case 'applySolvecaseNum':
                keyName = '权限申请破案数';
                break;
            case 'caseUploadNum':
                keyName = '案件上传数';
                break;
            case 'feedbackNum':
                keyName = '成果反馈数';
                break;
            case 'date':
                keyName = '日期';
                break;
        }

        return keyName;
    }

    //异常转换
    function commonGetYCName(key) {
        let keyName = '';
        switch (key) {
            case 'untimelyMakeUp':
                keyName = '未补办手续数';
                break;
            case 'overdueUnused':
                keyName = '超时未使用数';
                break;
            case 'abnormalLogin':
                keyName = '异常登录数';
                break;
            case 'abnormalLoginChecked':
                keyName = '账号审核通过数';
                break;
            case 'abnormalUsed':
                keyName = '异常使用数';
                break;
            case 'abnormalUsedChecked':
                keyName = '异常使用账号（审核通过数）';
                break;
            case 'abnormalCase':
                keyName = '案件查询异常数';
                break;
            case 'abnormalCaseChecked':
                keyName = '案件查询异常（审核通过数）';
                break;
            case 'repeatCase':
                keyName = '重复申请数';
                break;
            case 'repeatCaseChecked':
                keyName = '案件重复申请异常（审核通过数）';
                break;
            case 'idcardWarnCase':
                keyName = '身份证撞线预警数';
                break;
            case 'idcardWarnCaseChecked':
                keyName = '撞线预警案件数（身份证审核通过数）';
                break;
            case 'imgWarnCase':
                keyName = '撞线预警案件数（照片）';
                break;
            case 'imgWarnCaseChecked':
                keyName = '撞线预警案件数（照片审核通过数）';
                break;
            case 'queryInconsistent':
                keyName = '查询对象与申请不符预警数';
                break;
            case 'queryInconsistentChecked':
                keyName = '查询对象与申请不符预警数（审核通过数）';
                break;
            case 'useCountIsZero':
                keyName = '使用次数为0';
                break;
        }

        return keyName;
    }

    /**
     * 获取库列表
     * @param {*} $modal 弹窗
     */
    function getAllOrgId($modal) {
        $("#useManageTwoEmpty").removeClass("hide");
        $('#useManageOneTable').bootstrapTable("destroy");
        loadEmpty($("#useManageTwoEmpty"), "暂无检索数据", "");

        $container = $modal.find(".snapStatisticOrg .selectpicker");
        var port = 'v2/org/getOrgInfos',
            data = {
                orgType: 2,
                userType: 1,
                returnType: 3
            };
        var successFunc = function (data) {
            if (data.code === '200') {
                var result = data.data;
                // 对返回数组进行排序 市局排在最上层
                for (var i = 0; i < result.length; i++) {
                    if (result[i].parentId === null) {
                        arrayBox = result[i];
                        result.splice(i, 1);
                        result.splice(0, 0, arrayBox);
                    }
                }
                if (result) { // 存在返回值
                    itemHtml = `<option class="option-item" orgid="${result[0].orgId}" value="${result[0].orgId}" selected>${result[0].orgName}</option>`;
                    for (var i = 1; i < result.length; i++) {
                        itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                    }
                    $container.each((index, dom) => {
                        $(dom).html(itemHtml); // 元素赋值
                        $(dom).prop('disabled', false); // 非不可选
                        $(dom).selectpicker('refresh');
                    })
                    $("#useManageTwoEmpty").addClass("hide");
                    configKHData.orgId = result[0].orgId;
                    configYCData.orgId = result[0].orgId;
                    createSnapKHList($('#useManageOneTable'), true, configKHData);
                } else {
                    $container.each((dom) => {
                        $(dom).prop('disabled', true);
                        $(dom).val(null);
                        $(dom).selectpicker('refresh');
                    })
                }
            } else {
                $container.each((dom) => {
                    $(dom).prop('disabled', true);
                    $(dom).val(null);
                    $(dom).selectpicker('refresh');
                })
            }
        };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };

    /**
     * 列表生成 考核列表
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} data 过滤条件对象
     */
    function createSnapKHList($table, first, configData) {
        showLoading($('#useManage .useManageOne .manages-card-content'));
        var $thead = $table.find('thead');
        var $tbody = $table.find('tbody');
        var port = 'v3/report/reportStatistic',
            successFunc = function (data) {
                $thead.empty();
                $tbody.empty();
                hideLoading($('#useManage .useManageOne .manages-card-content'));

                if (data.code === '200' && data.data && data.data.length > 0) {
                    $("#useManageOneEmpty").addClass("hide");
                    var result = data.data;
                    $table.data({
                        'result': result
                    });

                    var dataList = ['accountNum', 'loginPersonNum', 'notUseAccountNum', 'loginAllNum', 'staticNum', 'dynamicNum', 'applyAllNum', 'applyLaNum', 'applyXbNum', 'applyJqNum', 'applyZaNum', 'applyEmergentNum', 'applySolvecaseNum', 'caseUploadNum', 'feedbackNum'];
                    var dataListWidth = [100, 100, 100, 100, 130, 130, 150, 150, 150, 150, 150, 150, 130, 100, 100];
                    var columnsArr = [
                        {
                            field: 'field1',
                            title: "机构名称",
                            width: 150,
                            formatter: parmasMatter
                        }
                    ],
                        dataArr = [];

                    //dataList.sort((a, b) => a.localeCompare(b));
                    for (var i = 0; i < dataList.length; i++) {
                        var columnsArrObj = {};
                        columnsArrObj.field = `field${i + 2}`;

                        var keyName = '';

                        commonGetKHName(dataList[i]);

                        columnsArrObj.title = `<span title="${commonGetKHName(dataList[i])}">${commonGetKHName(dataList[i])}</span>`;
                        columnsArrObj.width = dataListWidth[i];
                        columnsArrObj.formatter = parmasKHMatter;
                        columnsArr.push(columnsArrObj);
                    }

                    // 添加列表
                    for (var j = 0; j < result.length; j++) {
                        var dataArrObj = {};
                        dataArrObj.field0 = `<a class="detail-icon khDataList" href="#" orgId="${result[j].orgId}"><i class="fa fa-plus"></i></a>`;
                        dataArrObj.field1 = `${result[j].orgName}`;

                        for (var k = 0; k < dataList.length; k++) {
                            var data = parseFloat(result[j][dataList[k]] || 0).toLocaleString();
                            //class顺序不要更改，后续有判断 ‘text-link ${dataList[k]}’
                            dataArrObj[`field${k + 2}`] = `<span class="${data == '0' ? '' : 'text-link'} ${dataList[k]}" title="${data}">${data}</span>`;
                        }
                        dataArr.push(dataArrObj);
                    }
                    var modalTableHeight = $("#useManage").height() - $("#useManage #useManageTabOne").outerHeight() - $("#useManageTab").outerHeight() - 50;
                    $table.bootstrapTable("destroy").bootstrapTable({
                        height: modalTableHeight,
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: true,
                        detailView: false,
                        fixedNumber: 1
                    });
                    $table.find("tbody tr").each((index, $dom) => {
                        $($dom).data("listData", result[index]);
                    })
                    $("#useManageOneTable").data("listData", result);
                } else {
                    $("#useManageOneEmpty").removeClass("hide");
                    $table.bootstrapTable("destroy");
                    if (data.code != '200') {
                        loadEmpty($("#useManageOneEmpty"), "暂无检索结果", data.message);
                    } else {
                        loadEmpty($("#useManageOneEmpty"), "暂无检索数据", "");
                    }
                }
            };
        loadData(port, true, configData, successFunc);
    };

    /**
     * 列表生成 异常列表
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} data 过滤条件对象
     */
    function createSnapYCList($table, first, configData) {
        showLoading($('#useManage .useManageTwo .manages-card-content'));
        var $thead = $table.find('thead');
        var $tbody = $table.find('tbody');
        var port = 'v3/errReport/errReportStatistic',
            successFunc = function (data) {
                $thead.empty();
                $tbody.empty();
                hideLoading($('#useManage .useManageTwo .manages-card-content'));

                if (data.code === '200' && data.data && data.data.length > 0) {
                    $("#useManageTwoEmpty").addClass("hide");
                    var result = data.data;
                    $table.data({
                        'result': result
                    });

                    var dataList = ['untimelyMakeUp', 'abnormalLogin', 'abnormalCase', 'repeatCase', 'queryInconsistent', 'idcardWarnCase', 'useCountIsZero'];
                    var columnsArr = [
                        {
                            field: 'field1',
                            title: "机构名称",
                            width: 150,
                            formatter: parmasMatter
                        }
                    ],
                        dataArr = [];

                    for (var i = 0; i < dataList.length; i++) {
                        var columnsArrObj = {};
                        columnsArrObj.field = `field${i + 2}`;

                        var keyName = '';

                        commonGetYCName(dataList[i]);

                        columnsArrObj.title = `<span title="${commonGetYCName(dataList[i])}">${commonGetYCName(dataList[i])}</span>`;
                        columnsArrObj.width = 120;
                        columnsArrObj.formatter = parmasKHMatter;
                        columnsArr.push(columnsArrObj);
                    }

                    // 添加列表
                    for (var j = 0; j < result.length; j++) {
                        var dataArrObj = {};
                        dataArrObj.field1 = `${result[j].orgName}`;

                        for (var k = 0; k < dataList.length; k++) {
                            var data = parseFloat(result[j][dataList[k]] || 0).toLocaleString();
                            //class顺序不要更改，后续有判断 ‘text-link ${dataList[k]}’
                            dataArrObj[`field${k + 2}`] = `<span class="${data == '0' ? '' : 'text-link'} ${dataList[k]}" title="${data || 0}">${data || 0}</span>`;
                        }
                        dataArr.push(dataArrObj);
                    }
                    var modalTableHeight = $("#useManage").height() - $("#useManage #useManageTabTwo").outerHeight() - $("#useManageTab").outerHeight() - 50;
                    $table.bootstrapTable("destroy").bootstrapTable({
                        height: modalTableHeight,
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: true,
                        detailView: false,
                        fixedNumber: 1
                    });

                    $table.find("tbody tr").each((index, $dom) => {
                        $($dom).data("listData", result[index]);
                    })
                    $("#useManageTwoTable").data("listData", result);
                } else {
                    $("#useManageTwoEmpty").removeClass("hide");
                    $table.bootstrapTable("destroy");
                    if (data.code != '200') {
                        loadEmpty($("#useManageTwoEmpty"), "暂无检索结果", data.message);
                    } else {
                        loadEmpty($("#useManageTwoEmpty"), "暂无检索数据", "");
                    }
                    //warningTip.say(data.message);
                }
            };
        loadData(port, true, configData, successFunc);
    };

    /**
     * 列表生成 考核列表弹窗其他列点击生成表格
     * @param {*} type 类型
     * @param {*} obj 需要的数据
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否是第一次加载
     * @param {*} page 页数
     * @param {*} size 条数
     */
    function getDashBoardOtherModalTable(type, obj, $table, $pagination, first, page, size) {
        showLoading($table);
        switch (type) {
            //账号总数
            case 'accountNum':
                if (first) {
                    $("#useManage").find(".modal-body").prepend(`<button type="button" id="accountNumUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>`);
                }
                $("#useManage").find("#accountNumUpload").data("data", obj);
                var port = 'v3/report/getAccountDetail',
                    portData = {
                        startTime: configKHData.startTime,
                        endTime: configKHData.endTime,
                        orgId: obj.orgId,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configKHData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "登录用户姓名"
                        }, {
                            field: 'field2',
                            title: "用户账号"
                        }, {
                            field: 'field3',
                            title: "用户所属机构名称"
                        }, {
                            field: 'field4',
                            title: "用户权限类型"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArrObj['field4'] = `<span title="${result[j].userType || '--'}">${result[j].userType || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 4
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 4
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'loginPersonNum':
                if (first) {
                    $("#useManage").find(".modal-body").prepend(`<button type="button" id="loginPersonNumUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>`);
                }
                $("#useManage").find("#loginPersonNumUpload").data("data", obj);
                var port = 'v3/report/getLoginPersonDetail',
                    portData = {
                        startTime: configKHData.startTime,
                        endTime: configKHData.endTime,
                        orgId: obj.orgId,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configKHData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "登录用户姓名"
                        }, {
                            field: 'field2',
                            title: "用户账号"
                        }, {
                            field: 'field3',
                            title: "用户所属机构名称"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 4
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 4
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'loginAllNum':
                if (first) {
                    $("#useManage").find(".modal-body").prepend(`<button type="button" id="loginAllNumUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>`);
                }
                $("#useManage").find("#loginAllNumUpload").data("data", obj);
                var port = 'v3/report/getLoginCountDetail',
                    portData = {
                        startTime: configKHData.startTime,
                        endTime: configKHData.endTime,
                        orgId: obj.orgId,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configKHData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "登录用户姓名"
                        }, {
                            field: 'field2',
                            title: "用户账号"
                        }, {
                            field: 'field3',
                            title: "用户所属机构名称"
                        }, {
                            field: 'field4',
                            title: "登录时间"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArrObj['field4'] = `<span title="${result[j].operateTime || '--'}">${result[j].operateTime || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 5
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 5
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'overdueUnused':
                if (first) {
                    $("#useManageKHItemModal").find(".modal-body").prepend(`<button type="button" id="overdueUnusedUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>`);
                }
                $("#useManageKHItemModal").find("#overdueUnusedUpload").data("data", obj);
                var port = 'v3/errReport/getNotLoginUserDetail',
                    portData = {
                        startTime: configYCData.startTime,
                        endTime: configYCData.endTime,
                        orgId: obj.orgId,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configYCData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "登录用户姓名"
                        }, {
                            field: 'field2',
                            title: "用户账号"
                        }, {
                            field: 'field3',
                            title: "手机号码"
                        }, {
                            field: 'field4',
                            title: "用户所属机构名称"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].telephone || '--'}">${result[j].telephone || '--'}</span>`;
                                    dataArrObj['field4'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 5
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 5
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'abnormalLogin': // 异常登录
                var port = 'v3/errReport/getErrLoginDetail',
                    portData = {
                        startTime: configYCData.startTime,
                        endTime: configYCData.endTime,
                        orgId: obj.orgId,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configYCData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "登录用户姓名",
                            width: 100
                        }, {
                            field: 'field2',
                            title: "用户账号",
                            width: 150
                        }, {
                            field: 'field3',
                            title: "用户所属机构名称",
                            width: 200
                        }, {
                            field: 'field4',
                            title: "ip地址"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArrObj['field4'] = `<span title="${result[j].ips || '--'}">${result[j].ips || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 5
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 5
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'repeatCase':
                var port = 'v3/errReport/getCaseRepeatDetail',
                    portData = {
                        startTime: configYCData.startTime,
                        endTime: configYCData.endTime,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configYCData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "案件编号"
                        }, {
                            field: 'field2',
                            title: "事件名称"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].ajbh || '--'}">${result[j].ajbh || '--'}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].incident || '--'}">${result[j].incident || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    rowStyle: function (row, index) {
                                        return {
                                            css: {
                                                "cursor": "pointer"
                                            },
                                            classes: 'my-class'
                                        }
                                    },
                                    onClickRow: function (row, $el) {
                                        var html = `<table id="dashBoardOtherModalChildTable" class="table-hover"></table>
                                                    <div class="fixed-table-pagination bayonetCameralPagination" id="dashBoardOtherModalTableChildPagination"></div>`
                                        $("#useManageKHItemChildModal").find(".modal-body").html(html);
                                        var num = $el.find("td").eq(1).text(),
                                            $table = $("#useManageKHItemChildModal").find("#dashBoardOtherModalChildTable"),
                                            $pagination = $("#useManageKHItemChildModal").find("#dashBoardOtherModalTableChildPagination");
                                        $("#useManageKHItemChildModal").modal("show").find(".modal-title").html("重复申请数详情");
                                        getRepeatCaseDetail(obj, true, 1, 10);
                                        function getRepeatCaseDetail(obj, first, page, size) {
                                            showLoading($table);

                                            var port = 'v3/myApplication/getApplicationList',
                                                portData = {
                                                    labh: num,
                                                    viewType: 6,
                                                    startTime: configYCData.startTime,
                                                    endTime: configYCData.endTime,
                                                    apaasOrgId: obj.apaasOrgId,
                                                    roleType: configYCData.roleType,
                                                    page,
                                                    size
                                                },
                                                successFunc = function (data) {
                                                    hideLoading($table);

                                                    var columnsArr = [{
                                                        field: 'field0',
                                                        title: "序号",
                                                        width: 100
                                                    }, {
                                                        field: 'field1',
                                                        title: "申请人"
                                                    }, {
                                                        field: 'field2',
                                                        title: "用户警号"
                                                    }, {
                                                        field: 'field3',
                                                        title: "机构名称"
                                                    }, {
                                                        field: 'field4',
                                                        title: "事件名称"
                                                    }, {
                                                        field: 'field5',
                                                        title: "创建时间"
                                                    }],
                                                        dataArr = [];

                                                    if (data.code === '200') {
                                                        var result = data.data.list,
                                                            imgList = data.data.urls;
                                                        $table.data({
                                                            'result': result
                                                        });

                                                        if (result && result.length > 0) {
                                                            // 添加列表
                                                            for (var j = 0; j < result.length; j++) {
                                                                var dataArrObj = {};
                                                                dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                                                dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                                                dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                                                dataArrObj['field3'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                                                dataArrObj['field4'] = `<span title="${result[j].incident || '--'}">${result[j].incident || '--'}</span>`;
                                                                dataArrObj['field5'] = `<span title="${result[j].createTime || '--'}">${result[j].createTime || '--'}</span>`;
                                                                dataArr.push(dataArrObj);
                                                            }
                                                            $table.bootstrapTable("destroy").bootstrapTable({
                                                                columns: columnsArr,
                                                                data: dataArr,
                                                                search: false,
                                                                fixedColumns: false,
                                                                detailView: false
                                                            });

                                                            if (data.data.total > Number(size) && first) {
                                                                var pageSizeOpt = [{
                                                                    value: 10,
                                                                    text: '10/页'
                                                                }, {
                                                                    value: 20,
                                                                    text: '20/页',
                                                                }];
                                                                var eventCallBack = function (currPage, pageSize) {
                                                                    getRepeatCaseDetail(obj, false, currPage, pageSize);
                                                                };
                                                                setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                                            }
                                                        } else {
                                                            //dataArr['field0'] = `没有匹配的记录`;
                                                            $table.bootstrapTable("destroy").bootstrapTable({
                                                                columns: columnsArr,
                                                                data: dataArr,
                                                                search: false,
                                                                fixedColumns: false,
                                                                detailView: false,
                                                                mergeCells: {
                                                                    index: 0,
                                                                    field: 'field0',
                                                                    colspan: 5
                                                                },
                                                                formatNoMatches: function () {
                                                                    return '没有匹配的记录';
                                                                },
                                                            });
                                                        }
                                                    } else {
                                                        //dataArr['field0'] = `没有匹配的记录`;
                                                        $table.bootstrapTable("destroy").bootstrapTable({
                                                            columns: columnsArr,
                                                            data: dataArr,
                                                            search: false,
                                                            fixedColumns: false,
                                                            detailView: false,
                                                            mergeCells: {
                                                                index: 0,
                                                                field: 'field0',
                                                                colspan: 5
                                                            },
                                                            formatNoMatches: function () {
                                                                return '没有匹配的记录';
                                                            },
                                                        });
                                                    }
                                                }
                                            loadData(port, true, portData, successFunc);
                                        }
                                    }
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 5
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 5
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'abnormalCase':
                var port = 'v3/errReport/getCaseQueryDetail',
                    portData = {
                        startTime: configYCData.startTime,
                        endTime: configYCData.endTime,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configYCData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "申请人"
                        }, {
                            field: 'field2',
                            title: "用户警号"
                        }, {
                            field: 'field3',
                            title: "机构名称"
                        }, {
                            field: 'field4',
                            title: "事件名称"
                        }, {
                            field: 'field5',
                            title: "创建时间"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArrObj['field4'] = `<span title="${result[j].incident || '--'}">${result[j].incident || '--'}</span>`;
                                    dataArrObj['field5'] = `<span title="${result[j].createTime || '--'}">${result[j].createTime || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 5
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 5
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'untimelyMakeUp':
                $("#useManageKHItemModal").find(".modal-body #untimelyMakeUpUpload").remove();
                $("#useManageKHItemModal").find(".modal-body").prepend(`<button type="button" id="untimelyMakeUpUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>`);
                $("#useManageKHItemModal").find("#untimelyMakeUpUpload").data("data", obj);
                var port = 'v3/myApplication/getExigenceList',
                    portData = {
                        viewType: 7,
                        startTime: configYCData.startTime,
                        endTime: configYCData.endTime,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configYCData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 60
                        }, {
                            field: 'field5',
                            title: "单位名称"
                        }, {
                            field: 'field1',
                            title: "申请人",
                            width: 80
                        }, {
                            field: 'field2',
                            title: "用户警号",
                            width: 80
                        }, {
                            field: 'field4',
                            title: "案件名称"
                        }, {
                            field: 'field9',
                            title: "创建时间"
                        }, {
                            field: 'field6',
                            title: "检索使用次数",
                            width: 120
                        }, {
                            field: 'field3',
                            title: "手机号码"
                        }, {
                            field: 'field7',
                            title: "是否已补办",
                            width: 100
                        }, {
                            field: 'field8',
                            title: "补办时间"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field5'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field4'] = `<span title="${result[j].incident || '--'}">${result[j].incident || '--'}</span>`;
                                    dataArrObj['field9'] = `<span title="${result[j].createTime || '--'}">${result[j].createTime || '--'}</span>`;
                                    dataArrObj['field6'] = `<span title="${result[j].searchCount || '0'}">${result[j].searchCount || '0'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].telephone || '--'}">${result[j].telephone || '--'}</span>`;
                                    dataArrObj['field7'] = `<span>${result[j].status == '0' && '未补办' || result[j].status == '1' && '已补办' || result[j].status == '2' && '超时补办' || '--'}</span>`;
                                    dataArrObj['field8'] = `<span title="${result[j].updateTime || '--'}">${result[j].updateTime || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 5
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 5
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'queryInconsistent':
                let htmlQueryInconsistent = `<button type="button" id="queryInconsistentUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>`;
                $("#useManageKHItemModal").find(".modal-body #queryInconsistentUpload").remove();
                $("#useManageKHItemModal").find(".modal-body").prepend(htmlQueryInconsistent);
                $("#useManageKHItemModal").find("#queryInconsistentUpload").data({
                    obj
                });
                var port = 'v3/errReport/getErrSearchIncident',
                    portData = {
                        startTime: configYCData.startTime,
                        endTime: configYCData.endTime,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configYCData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "用户名称"
                        }, {
                            field: 'field2',
                            title: "用户账号",
                        }, {
                            field: 'field3',
                            title: "电话号码"
                        }, {
                            field: 'field4',
                            title: "机构名称"
                        }, {
                            field: 'field5',
                            title: "事件名称",
                        }, {
                            field: 'field6',
                            title: "案件编号",
                        }, {
                            field: 'field7',
                            title: "检索人员",
                        }, {
                            field: 'field8',
                            title: "申请检索图片数",
                        }, {
                            field: 'field9',
                            title: "占比",
                        }, {
                            field: 'field10',
                            title: "不符记录排序",
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].telephone || '--'}">${result[j].telephone || '--'}</span>`;
                                    dataArrObj['field4'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArrObj['field5'] = `<span title="${result[j].incident || '--'}">${result[j].incident || '--'}</span>`;
                                    dataArrObj['field6'] = `<span title="${result[j].ajbh || '--'}">${result[j].ajbh || '--'}</span>`;
                                    dataArrObj['field7'] = `<span title="${result[j].personTotal || '0'}">${result[j].personTotal || '0'}</span>`;
                                    dataArrObj['field8'] = `<span title="${result[j].applicationTotal || '0'}">${result[j].applicationTotal || '0'}</span>`;
                                    dataArrObj['field9'] = `<span title="${result[j].rate || '0'}">${result[j].rate || '0'}</span>`;
                                    dataArrObj['field10'] = `<span title="${result[j].sequence || '0'}">${result[j].sequence || '0'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    rowStyle: function (row, index) {
                                        return {
                                            css: {
                                                "cursor": "pointer"
                                            },
                                            classes: 'my-class'
                                        }
                                    },
                                    onClickRow: function (row, $el) {
                                        var html = `<div class="table-img-part">
                                                    <p class="table-list-title dashBoardOtherModalChildTip hide" style="font-weight:bold">申请原图</p>
                                                    <div class="table-list-content dashBoardOtherModalChildImg"></div>
                                                </div>
                                                <div class="table-list-part">
                                                    <table id="dashBoardOtherModalChildTable" class="table-hover queryInconsistentTable"></table>
                                                    <div class="fixed-table-pagination bayonetCameralPagination" id="dashBoardOtherModalTableChildPagination"></div>
                                                </div>`
                                        $("#useManageKHItemChildModal").find(".modal-body").html(html);
                                        var num = $el.data("listData").ajbh,
                                            userId = $el.data("listData").userId,
                                            $table = $("#useManageKHItemChildModal").find("#dashBoardOtherModalChildTable"),
                                            $imgTips = $("#useManageKHItemChildModal").find(".dashBoardOtherModalChildTip"),
                                            $imgList = $("#useManageKHItemChildModal").find(".dashBoardOtherModalChildImg"),
                                            $pagination = $("#useManageKHItemChildModal").find("#dashBoardOtherModalTableChildPagination");
                                        $("#useManageKHItemChildModal").modal("show").find(".modal-title").html("查询对象与申请不符预警数详情");
                                        getQueryInconsistentDetail(obj, true, 1, 10);
                                        // hover 显示中图
                                        showMiddleImg($('#dashBoardOtherModalChildTable'), $("#useManageKHItemChildModal"), '.table-img');
                                        showMiddleImg($("#useManageKHItemChildModal").find(".dashBoardOtherModalChildImg"), $("#useManageKHItemChildModal"), '.table-m-img');
                                        function getQueryInconsistentDetail(obj, first, page, size) {
                                            showLoading($table);

                                            var port = 'v3/errReport/getErrSearchDetail',
                                                portData = {
                                                    startTime: configYCData.startTime,
                                                    endTime: configYCData.endTime,
                                                    apaasOrgId: obj.apaasOrgId,
                                                    roleType: configYCData.roleType,
                                                    ajbh: num,
                                                    userId,
                                                    page,
                                                    size
                                                },
                                                successFunc = function (data) {
                                                    hideLoading($table);

                                                    var columnsArr = [
                                                        // {
                                                        //     field: 'field0',
                                                        //     title: "",
                                                        //     width: 50
                                                        // },
                                                        {
                                                            field: 'field1',
                                                            title: "序号",
                                                            width: 100
                                                        }, {
                                                            field: 'field2',
                                                            title: "图片",
                                                            width: 100
                                                        }, {
                                                            field: 'field3',
                                                            title: "检索人",
                                                        }, {
                                                            field: 'field4',
                                                            title: "用户警号"
                                                        }, {
                                                            field: 'field5',
                                                            title: "机构名称"
                                                        }, {
                                                            field: 'field6',
                                                            title: "事件名称"
                                                        }, {
                                                            field: 'field7',
                                                            title: "操作时间"
                                                        }],
                                                        dataArr = [];

                                                    if (data.code === '200') {
                                                        var result = data.data.list,
                                                            imgList = data.data.urls;
                                                        $table.data({
                                                            'result': result
                                                        });

                                                        if (imgList && imgList.length > 0 && first) {
                                                            $imgTips.removeClass("hide");
                                                            imgList.forEach(item => {
                                                                $imgList.append(`<div class="table-img-box">
                                                                    <img class="table-m-img img-right-event" src="${item}" onerror="this.error=null;this.src='./assets/images/control/person.png'"/>
                                                                </div>`);
                                                            })
                                                        }

                                                        if (result && result.length > 0) {
                                                            // 添加列表
                                                            for (var j = 0; j < result.length; j++) {
                                                                var dataArrObj = {};
                                                                dataArrObj['field1'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                                                dataArrObj['field2'] = `<div style="position:relative;width: 2.375rem;height: 2.375rem;"><img class="table-img img-right-event" src="${result[j].warnPicUrl} onerror="this.error=null;this.src='./assets/images/control/person.png'""><span style="background: #ff5558;border-radius: 1.5rem;padding: 0 0.25rem;height:1rem;line-height:1rem;color: #fff;font-size: .75rem;position:absolute;right: 0;transform: translate(50%,-50%);">${result[j].personTotal || 0}</span></div>`
                                                                dataArrObj['field3'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                                                dataArrObj['field4'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                                                dataArrObj['field5'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                                                dataArrObj['field6'] = `<span title="${result[j].incident || '--'}">${result[j].incident || '--'}</span>`;
                                                                dataArrObj['field7'] = `<span title="${result[j].opTime || '--'}">${result[j].opTime || '--'}</span>`;
                                                                dataArr.push(dataArrObj);
                                                            }
                                                            $table.bootstrapTable("destroy").bootstrapTable({
                                                                columns: columnsArr,
                                                                data: dataArr,
                                                                search: false,
                                                                fixedColumns: false,
                                                                detailView: true,
                                                                detailFormatter: function (index, row) {
                                                                    $("#useManageKHItemChildModal").find(".queryInconsistentTable .detail-view").remove();
                                                                    var samePersonId = '';
                                                                    if ($table.find("tbody tr").eq(index).data("listData")) {
                                                                        samePersonId = $table.find("tbody tr").eq(index).data("listData").samePersonId;
                                                                    }
                                                                    var html = `<tr class="detail-view">
                                                                                    <td colspan="7">
                                                                                        <table id="queryInconsistentDetailTable" class="table-hover" data-toggle="table">
                                                                                            <tbody>
                                                                                            </tbody>
                                                                                        </table>
                                                                                        <div class="fixed-table-pagination bayonetCameralPagination" id="queryInconsistentDetailTablePagination"></div>
                                                                                    </td>
                                                                                </tr>`;
                                                                    $("#useManageKHItemChildModal").find(".queryInconsistentTable tbody tr").eq(index).after(html);
                                                                    $("#useManageKHItemChildModal").find(".queryInconsistentTable tbody tr").eq(index).siblings().find(".fa").removeClass("fa-minus").addClass("fa-plus");
                                                                    getQueryInconsistentDetailTable(true, 1, 10);
                                                                    function getQueryInconsistentDetailTable(first, page, size) {
                                                                        var num = $table.find("tbody tr").eq(index).data("listData").ajbh,
                                                                            userId = $table.find("tbody tr").eq(index).data("listData").userId;
                                                                        showLoading($("#useManageKHItemChildModal").find(".queryInconsistentTable .detail-view"));
                                                                        var port = 'v3/errReport/getErrSearchPerson',
                                                                            portData = {
                                                                                startTime: configYCData.startTime,
                                                                                endTime: configYCData.endTime,
                                                                                samePersonId,
                                                                                ajbh: num,
                                                                                userId,
                                                                                page,
                                                                                size
                                                                            },
                                                                            successFunc = function (data) {
                                                                                hideLoading($("#useManageKHItemChildModal").find(".queryInconsistentTable .detail-view"));

                                                                                if (data.code === '200' && data.data && data.data.list.length) {
                                                                                    $("#snapStatisticLoadEmpty").addClass("hide");

                                                                                    var result = data.data.list,
                                                                                        tableHtml = '';

                                                                                    // 添加列表
                                                                                    for (var j = 0; j < result.length; j++) {
                                                                                        tableHtml += `<tr class="table-row" data-index="${j}">
                                                                                                            <td>${(page - 1) * size + j + 1}</td>
                                                                                                            <td><img class="table-img img-right-event" src="${result[j].warnPicUrl}" onerror="this.error=null;this.src='./assets/images/control/person.png'"></td>
                                                                                                            <td title="${result[j].userName || '--'}">${result[j].userName || '--'}</td>
                                                                                                            <td title="${result[j].userId || '--'}">${result[j].userId || '--'}</td>
                                                                                                            <td title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</td>
                                                                                                            <td title="${result[j].incident || '--'}">${result[j].incident || '--'}</td>
                                                                                                            <td title="${result[j].opTime || '--'}">${result[j].opTime || '--'}</td>
                                                                                                        </tr>`;
                                                                                    }
                                                                                    $("#useManageKHItemChildModal").find("#queryInconsistentDetailTable tbody").empty().html(tableHtml);

                                                                                    if (data.data.total > Number(size) && first) {
                                                                                        var pageSizeOpt = [{
                                                                                            value: 10,
                                                                                            text: '10/页'
                                                                                        }, {
                                                                                            value: 20,
                                                                                            text: '20/页',
                                                                                        }];
                                                                                        var eventCallBack = function (currPage, pageSize) {
                                                                                            getQueryInconsistentDetailTable(false, currPage, pageSize);
                                                                                        };
                                                                                        setPageParams($("#useManageKHItemChildModal").find("#queryInconsistentDetailTablePagination"), data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                                                                    }
                                                                                    // hover 显示中图
                                                                                    showMiddleImg($('#dashBoardOtherModalTable'), $('#useManageKHItemModal'), '.table-img');
                                                                                } else {
                                                                                    $("#useManageKHItemChildModal").find("#queryInconsistentDetailTable tbody").empty().html(`<div style="text-align:center">暂无数据</div>`);
                                                                                }
                                                                            };
                                                                        loadData(port, true, portData, successFunc);
                                                                    }
                                                                }
                                                            });

                                                            $table.find("tbody tr").each((index, $dom) => {
                                                                $($dom).data("listData", result[index]);
                                                            })

                                                            if (data.data.total > Number(size) && first) {
                                                                var pageSizeOpt = [{
                                                                    value: 10,
                                                                    text: '10/页'
                                                                }, {
                                                                    value: 20,
                                                                    text: '20/页',
                                                                }];
                                                                var eventCallBack = function (currPage, pageSize) {
                                                                    getQueryInconsistentDetail(obj, false, currPage, pageSize);
                                                                };
                                                                setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                                            }
                                                        } else {
                                                            //dataArr['field0'] = `没有匹配的记录`;
                                                            $table.bootstrapTable("destroy").bootstrapTable({
                                                                columns: columnsArr,
                                                                data: dataArr,
                                                                search: false,
                                                                fixedColumns: false,
                                                                detailView: false,
                                                                mergeCells: {
                                                                    index: 0,
                                                                    field: 'field0',
                                                                    colspan: 5
                                                                },
                                                                formatNoMatches: function () {
                                                                    return '没有匹配的记录';
                                                                },
                                                            });
                                                        }
                                                    } else {
                                                        //dataArr['field0'] = `没有匹配的记录`;
                                                        $table.bootstrapTable("destroy").bootstrapTable({
                                                            columns: columnsArr,
                                                            data: dataArr,
                                                            search: false,
                                                            fixedColumns: false,
                                                            detailView: false,
                                                            mergeCells: {
                                                                index: 0,
                                                                field: 'field0',
                                                                colspan: 5
                                                            },
                                                            formatNoMatches: function () {
                                                                return '没有匹配的记录';
                                                            },
                                                        });
                                                    }
                                                }
                                            loadData(port, true, portData, successFunc);
                                        }
                                    }
                                });

                                $table.find("tbody tr").each((index, $dom) => {
                                    $($dom).data("listData", result[index]);
                                })

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                                // hover 显示中图
                                showMiddleImg($('#dashBoardOtherModalTable'), $('#useManageKHItemModal'), '.table-img');
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 5
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 5
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'useCountIsZero':  //使用次数为0账号
                let htmlUseCountIsZero = `<div class="aui-from-horizontal aui-row" id="useCountIsZeroForm">
                                            <div class="aui-col-6">
                                                <div class="form-group">
                                                    <label class="aui-form-label aui-col-8">机构名称：</label>
                                                    <div class="aui-col-16">
                                                        <select class="selectpicker" id="orgIdUseCountIsZero" data-live-search="true"></select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="aui-col-6">
                                                <div class="form-group">
                                                    <label class="aui-form-label aui-col-8">用户名称：</label>
                                                    <div class="aui-col-16">
                                                        <input id="userNameUseCountIsZero" type="text" class="aui-input" placeholder="请输入用户名称">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="aui-col-6">
                                                <div class="form-group">
                                                    <label class="aui-form-label aui-col-8">用户账号：</label>
                                                    <div class="aui-col-16">
                                                        <input id="userIdUseCountIsZero" type="text" class="aui-input" placeholder="请输入用户账号">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="aui-col-6">
                                                <button type="button" id="useCountIsZeroSearch" class="btn btn-primary" style="margin-bottom:0.5rem;">搜索</button>
                                                <button type="button" id="useCountIsZeroUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>
                                            </div>
                                        </div>`
                $("#useManageKHItemModal").find(".modal-body #useCountIsZeroForm").remove();
                $("#useManageKHItemModal").find(".modal-body").prepend(htmlUseCountIsZero);
                $("#useManageKHItemModal").find("#useCountIsZeroUpload").data({
                    obj,
                    orgId: obj.apaasOrgId
                });
                commonOrgList($("#useManageKHItemModal").find("#orgIdUseCountIsZero"), obj.apaasOrgId, 2, 2, 3, 2);
                getQueryUseIsZeroCount(type, obj, $table, $pagination, first, page, size);
                break;
            case 'notUseAccountNum':
                if (first) {
                    $("#useManageKHItemModal").find(".modal-body").prepend(`<button type="button" id="notUseAccountNumUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>`);
                }
                $("#useManageKHItemModal").find("#notUseAccountNumUpload").data("data", obj);
                var port = 'v3/report/getNotLoginPersonDetail',
                    portData = {
                        startTime: configKHData.startTime,
                        endTime: configKHData.endTime,
                        orgId: obj.orgId,
                        apaasOrgId: obj.apaasOrgId,
                        roleType: configKHData.roleType,
                        page,
                        size
                    },
                    successFunc = function (data) {
                        hideLoading($table);

                        var columnsArr = [{
                            field: 'field0',
                            title: "序号",
                            width: 100
                        }, {
                            field: 'field1',
                            title: "登录用户姓名"
                        }, {
                            field: 'field2',
                            title: "用户账号"
                        }, {
                            field: 'field3',
                            title: "手机号码"
                        }, {
                            field: 'field4',
                            title: "用户所属机构名称"
                        }],
                            dataArr = [];

                        if (data.code === '200') {
                            var result = data.data.list;
                            $table.data({
                                'result': result
                            });

                            if (result && result.length > 0) {
                                // 添加列表
                                for (var j = 0; j < result.length; j++) {
                                    var dataArrObj = {};
                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                    dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                    dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                    dataArrObj['field3'] = `<span title="${result[j].telephone || '--'}">${result[j].telephone || '--'}</span>`;
                                    dataArrObj['field4'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                    dataArr.push(dataArrObj);
                                }
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false
                                });

                                if (data.data.total > Number(size) && first) {
                                    var pageSizeOpt = [{
                                        value: 10,
                                        text: '10/页'
                                    }, {
                                        value: 20,
                                        text: '20/页',
                                    }];
                                    var eventCallBack = function (currPage, pageSize) {
                                        getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                                    };
                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 5
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        } else {
                            //dataArr['field0'] = `没有匹配的记录`;
                            $table.bootstrapTable("destroy").bootstrapTable({
                                columns: columnsArr,
                                data: dataArr,
                                search: false,
                                fixedColumns: false,
                                detailView: false,
                                mergeCells: {
                                    index: 0,
                                    field: 'field0',
                                    colspan: 5
                                },
                                formatNoMatches: function () {
                                    return '没有匹配的记录';
                                },
                            });
                        }
                    }
                loadData(port, true, portData, successFunc);
                break;
            case 'idcardWarnCase':  //身份证撞线预警
                let html = `<form class="aui-from-horizontal aui-row">
                                <div class="aui-col-10">
                                    <div class="form-group">
                                        <label class="aui-form-label aui-col-6">身份证号码：</label>
                                        <div class="aui-col-18">
                                            <input id="idcardWarnCaseIdcard" type="text" class="aui-input" placeholder="请输入身份证号码">
                                        </div>
                                    </div>
                                </div>
                                <div class="aui-col-10">
                                    <button type="button" id="idcardWarnCaseSearch" class="btn btn-primary" style="margin-bottom:0.5rem;">搜索</button>
                                    <button type="button" id="idcardWarnCaseUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>
                                </div>
                            </form>`
                $("#useManageKHItemModal").find(".modal-body .aui-from-horizontal").remove();
                $("#useManageKHItemModal").find(".modal-body").prepend(html);
                let idCard = '';
                $("#useManageKHItemModal").find("#idcardWarnCaseUpload").data({
                    obj,
                    idCard
                });
                getIdcardWarnList($table, $pagination, idCard, true, 1, 10);
                $("#useManageKHItemModal").on("click", "#idcardWarnCaseSearch", function () {
                    idCard = $("#idcardWarnCaseIdcard").val();
                    $("#useManageKHItemModal").find("#idcardWarnCaseUpload").data().idCard = idCard;
                    getIdcardWarnList($("#useManageKHItemModal").find("#dashBoardOtherModalTable"), $("#useManageKHItemModal").find("#dashBoardOtherModalTablePagination"), idCard, true, 1, 10);
                })

                function getIdcardWarnList($table, $pagination, idCard, first, page, size) {
                    showLoading($table);
                    if (first) {
                        $pagination.html('');
                    }

                    var port = 'v3/errReport/queryIdcardRepeatCount',
                        portData = {
                            startTime: configYCData.startTime,
                            endTime: configYCData.endTime,
                            orgId: obj.apaasOrgId,
                            idCard,
                            page,
                            size
                        },
                        successFunc = function (data) {
                            hideLoading($table);

                            var columnsArr = [{
                                field: 'field0',
                                title: "序号",
                                width: 60
                            }, {
                                field: 'field1',
                                title: '身份证'
                            }, {
                                field: 'field2',
                                title: '数量'
                            }],
                                dataArr = [];

                            if (data.code === '200') {
                                var result = data.data.list;
                                $table.data({
                                    'result': result
                                });

                                if (result && result.length > 0) {
                                    // 添加列表
                                    for (var j = 0; j < result.length; j++) {
                                        var dataArrObj = {};
                                        dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                        dataArrObj['field1'] = `<span title="${result[j].idCard || '--'}">${result[j].idCard || '--'}</span>`;
                                        dataArrObj['field2'] = `<span title="${result[j].repeatCount || '--'}">${result[j].repeatCount || '--'}</span>`;
                                        dataArr.push(dataArrObj);
                                    }
                                    $table.bootstrapTable("destroy").bootstrapTable({
                                        columns: columnsArr,
                                        data: dataArr,
                                        search: false,
                                        fixedColumns: false,
                                        detailView: false,
                                        onClickRow: function (row, $el) {
                                            var html = `<div>
                                                            <table id="idcardWarnModalChildTable" class="table-hover"></table>
                                                            <div class="fixed-table-pagination bayonetCameralPagination" id="idcardWarnModalChildTablePagination"></div>
                                                        </div>`
                                            $("#useManageKHItemChildModal").find(".modal-body").html(html);
                                            var idCard = $el.data("listData").idCard,
                                                $table = $("#useManageKHItemChildModal").find("#idcardWarnModalChildTable"),
                                                $pagination = $("#useManageKHItemChildModal").find("#idcardWarnModalChildTablePagination");
                                            $("#useManageKHItemChildModal").modal("show").find(".modal-title").html("身份证撞线预警明细");
                                            getIdcardWarnChildDetail(obj, true, 1, 10);
                                            function getIdcardWarnChildDetail(obj, first, page, size) {
                                                showLoading($table);

                                                var port = 'v3/errReport/queryIdcardRepeats',
                                                    portData = {
                                                        startTime: configYCData.startTime,
                                                        endTime: configYCData.endTime,
                                                        orgId: obj.apaasOrgId,
                                                        idCard,
                                                        page,
                                                        size
                                                    },
                                                    successFunc = function (data) {
                                                        hideLoading($table);

                                                        var columnsArr = [{
                                                            field: 'field0',
                                                            title: "序号",
                                                            width: 60
                                                        }, {
                                                            field: 'field1',
                                                            title: "身份证"
                                                        }, {
                                                            field: 'field2',
                                                            title: "案件名称"
                                                        }, {
                                                            field: 'field3',
                                                            title: "单位名称"
                                                        }, {
                                                            field: 'field4',
                                                            title: "检索人",
                                                            width: 80
                                                        }, {
                                                            field: 'field5',
                                                            title: "检索人警号",
                                                            width: 80
                                                        }, {
                                                            field: 'field6',
                                                            title: "检索时间"
                                                        }],
                                                            dataArr = [];

                                                        if (data.code === '200') {
                                                            var result = data.data.list;
                                                            $table.data({
                                                                'result': result
                                                            });

                                                            if (result && result.length > 0) {
                                                                // 添加列表
                                                                for (var j = 0; j < result.length; j++) {
                                                                    var dataArrObj = {};
                                                                    dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                                                    dataArrObj['field1'] = `<span title="${result[j].idCard || '--'}">${result[j].idCard || '--'}</span>`;
                                                                    dataArrObj['field2'] = `<span class="text-link incidentShow" title="${result[j].incidentName || '--'}" incidentId="${result[j].incidentid}">${result[j].incidentName || '--'}</span>`;
                                                                    dataArrObj['field3'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                                                    dataArrObj['field4'] = `<span title="${result[j].nickname || '--'}">${result[j].nickname || '--'}</span>`;
                                                                    dataArrObj['field5'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                                                    dataArrObj['field6'] = `<span title="${result[j].opTime || '0'}">${result[j].opTime || '0'}</span>`;
                                                                    dataArr.push(dataArrObj);
                                                                }
                                                                $table.bootstrapTable("destroy").bootstrapTable({
                                                                    columns: columnsArr,
                                                                    data: dataArr,
                                                                    search: false,
                                                                    fixedColumns: false,
                                                                    detailView: false
                                                                });

                                                                $table.find("tbody tr").each((index, $dom) => {
                                                                    $($dom).data("listData", result[index]);
                                                                })

                                                                if (data.data.total > Number(size) && first) {
                                                                    var pageSizeOpt = [{
                                                                        value: 10,
                                                                        text: '10/页'
                                                                    }, {
                                                                        value: 20,
                                                                        text: '20/页',
                                                                    }];
                                                                    var eventCallBack = function (currPage, pageSize) {
                                                                        getIdcardWarnChildDetail(obj, false, currPage, pageSize);
                                                                    };
                                                                    setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                                                }
                                                            } else {
                                                                //dataArr['field0'] = `没有匹配的记录`;
                                                                $table.bootstrapTable("destroy").bootstrapTable({
                                                                    columns: columnsArr,
                                                                    data: dataArr,
                                                                    search: false,
                                                                    fixedColumns: false,
                                                                    detailView: false,
                                                                    mergeCells: {
                                                                        index: 0,
                                                                        field: 'field0',
                                                                        colspan: 5
                                                                    },
                                                                    formatNoMatches: function () {
                                                                        return '没有匹配的记录';
                                                                    },
                                                                });
                                                            }
                                                        } else {
                                                            //dataArr['field0'] = `没有匹配的记录`;
                                                            $table.bootstrapTable("destroy").bootstrapTable({
                                                                columns: columnsArr,
                                                                data: dataArr,
                                                                search: false,
                                                                fixedColumns: false,
                                                                detailView: false,
                                                                mergeCells: {
                                                                    index: 0,
                                                                    field: 'field0',
                                                                    colspan: 5
                                                                },
                                                                formatNoMatches: function () {
                                                                    return '没有匹配的记录';
                                                                },
                                                            });
                                                        }
                                                    }
                                                loadData(port, true, portData, successFunc);
                                            }
                                        }
                                    });

                                    $table.find("tbody tr").each((index, $dom) => {
                                        $($dom).data("listData", result[index]);
                                    })

                                    if (data.data.total > Number(size) && first) {
                                        var pageSizeOpt = [{
                                            value: 10,
                                            text: '10/页'
                                        }, {
                                            value: 20,
                                            text: '20/页',
                                        }];
                                        var eventCallBack = function (currPage, pageSize) {
                                            getIdcardWarnList($table, $pagination, idCard, false, currPage, pageSize);
                                        };
                                        setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                    }
                                } else {
                                    //dataArr['field0'] = `没有匹配的记录`;
                                    $table.bootstrapTable("destroy").bootstrapTable({
                                        columns: columnsArr,
                                        data: dataArr,
                                        search: false,
                                        fixedColumns: false,
                                        detailView: false,
                                        mergeCells: {
                                            index: 0,
                                            field: 'field0',
                                            colspan: 3
                                        },
                                        formatNoMatches: function () {
                                            return '没有匹配的记录';
                                        },
                                    });
                                }
                            } else {
                                //dataArr['field0'] = `没有匹配的记录`;
                                $table.bootstrapTable("destroy").bootstrapTable({
                                    columns: columnsArr,
                                    data: dataArr,
                                    search: false,
                                    fixedColumns: false,
                                    detailView: false,
                                    mergeCells: {
                                        index: 0,
                                        field: 'field0',
                                        colspan: 3
                                    },
                                    formatNoMatches: function () {
                                        return '没有匹配的记录';
                                    },
                                });
                            }
                        }
                    loadData(port, true, portData, successFunc);
                }
                break;
        }
    }

    //使用次数为0一级列表获取
    function getQueryUseIsZeroCount(type, obj, $table, $pagination, first, page, size) {
        var port = 'v3/errReport/queryUseIsZeroCount',
            portData = {
                startTime: configYCData.startTime,
                endTime: configYCData.endTime,
                orgId: $("#useManageKHItemModal").find("#useCountIsZeroUpload").data("orgId"),
                userName: $("#useManageKHItemModal").find("#userNameUseCountIsZero").val() || '',
                userId: $("#useManageKHItemModal").find("#userIdUseCountIsZero").val() || '',
                page,
                size
            },
            successFunc = function (data) {
                hideLoading($table);

                var columnsArr = [{
                    field: 'field0',
                    title: "序号",
                    width: 60
                }, {
                    field: 'field1',
                    title: "用户名称"
                }, {
                    field: 'field2',
                    title: "用户账号"
                }, {
                    field: 'field3',
                    title: "机构名称"
                }, {
                    field: 'field4',
                    title: "已使用次数"
                }],
                    dataArr = [];

                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });

                    if (result && result.length > 0) {
                        // 添加列表
                        for (var j = 0; j < result.length; j++) {
                            var dataArrObj = {};
                            dataArrObj['field0'] = `<span>${(page - 1) * size + j + 1}</span>`;
                            dataArrObj['field1'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                            dataArrObj['field2'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                            dataArrObj['field3'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                            dataArrObj['field4'] = `<span title="${result[j].useCount || '--'}">${result[j].useCount || '--'}</span>`;
                            dataArr.push(dataArrObj);
                        }
                        $table.bootstrapTable("destroy").bootstrapTable({
                            columns: columnsArr,
                            data: dataArr,
                            search: false,
                            fixedColumns: false,
                            detailView: false,
                            rowStyle: function (row, index) {
                                return {
                                    css: {
                                        "cursor": "pointer"
                                    },
                                    classes: 'my-class'
                                }
                            },
                            onClickRow: function (row, $el) {
                                var html = `<button type="button" id="useCountIsZeroDetailUpload" class="btn" style="margin-bottom:0.5rem;">导出</button>
                                                    <table id="dashBoardOtherModalChildTable" class="table-hover"></table>
                                                    <div class="fixed-table-pagination bayonetCameralPagination" id="dashBoardOtherModalTableChildPagination"></div>`
                                $("#useManageKHItemChildModal").find(".modal-body").html(html);
                                $("#useManageKHItemChildModal").find("#useCountIsZeroDetailUpload").data({
                                    listData: $el.data("listData"),
                                    obj
                                });
                                var num = $el.data("listData").useCount,
                                    userId = $el.data("listData").userId,
                                    $table = $("#useManageKHItemChildModal").find("#dashBoardOtherModalChildTable"),
                                    $pagination = $("#useManageKHItemChildModal").find("#dashBoardOtherModalTableChildPagination");
                                $("#useManageKHItemChildModal").modal("show").find(".modal-title").html("使用次数为0账号检索明细");
                                getQueryInconsistentDetail(obj, true, 1, 10);
                                function getQueryInconsistentDetail(obj, first, page, size) {
                                    showLoading($table);

                                    var port = 'v3/errReport/queryUseIsZeroCountDetail',
                                        portData = {
                                            startTime: configYCData.startTime,
                                            endTime: configYCData.endTime,
                                            orgId: obj.apaasOrgId,
                                            rowNum: num,
                                            userId,
                                            page,
                                            size
                                        },
                                        successFunc = function (data) {
                                            hideLoading($table);

                                            var columnsArr = [
                                                {
                                                    field: 'field1',
                                                    title: "序号",
                                                    width: 70
                                                }, {
                                                    field: 'field2',
                                                    title: "图片",
                                                }, {
                                                    field: 'field3',
                                                    title: "检索人",
                                                }, {
                                                    field: 'field4',
                                                    title: "检索账号"
                                                }, {
                                                    field: 'field5',
                                                    title: "机构名称"
                                                }, {
                                                    field: 'field6',
                                                    title: "事件名称"
                                                }, {
                                                    field: 'field7',
                                                    title: "操作时间"
                                                }],
                                                dataArr = [];

                                            if (data.code === '200') {
                                                var result = data.data.list;
                                                $table.data({
                                                    'result': result
                                                });

                                                if (result && result.length > 0) {
                                                    // 添加列表
                                                    for (var j = 0; j < result.length; j++) {
                                                        var dataArrObj = {};
                                                        dataArrObj['field1'] = `<span>${(page - 1) * size + j + 1}</span>`;
                                                        dataArrObj['field2'] = `<div style="position:relative;width: 2.375rem;height: 2.375rem;"><img class="table-img" src="${result[j].picUrl ? result[j].picUrl : './assets/images/control/person.png'}" onerror="this.error=null;this.src='./assets/images/control/person.png'"></div>`;
                                                        dataArrObj['field3'] = `<span title="${result[j].userName || '--'}">${result[j].userName || '--'}</span>`;
                                                        dataArrObj['field4'] = `<span title="${result[j].userId || '--'}">${result[j].userId || '--'}</span>`;
                                                        dataArrObj['field5'] = `<span title="${result[j].orgName || '--'}">${result[j].orgName || '--'}</span>`;
                                                        dataArrObj['field6'] = `<span title="${result[j].incidentName || '--'}">${result[j].incidentName || '--'}</span>`;
                                                        dataArrObj['field7'] = `<span title="${result[j].opTime || '--'}">${result[j].opTime || '--'}</span>`;
                                                        dataArr.push(dataArrObj);
                                                    }
                                                    $table.bootstrapTable("destroy").bootstrapTable({
                                                        columns: columnsArr,
                                                        data: dataArr,
                                                        search: false,
                                                        fixedColumns: false,
                                                        detailView: false
                                                    });

                                                    $table.find("tbody tr").each((index, $dom) => {
                                                        $($dom).data("listData", result[index]);
                                                    })

                                                    if (data.data.total > Number(size) && first) {
                                                        var pageSizeOpt = [{
                                                            value: 10,
                                                            text: '10/页'
                                                        }, {
                                                            value: 20,
                                                            text: '20/页',
                                                        }];
                                                        var eventCallBack = function (currPage, pageSize) {
                                                            getQueryInconsistentDetail(obj, false, currPage, pageSize);
                                                        };
                                                        setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                                                    }

                                                    // hover 显示中图
                                                    showMiddleImg($('#dashBoardOtherModalChildTable'), $("#useManageKHItemChildModal"), '.table-img');
                                                } else {
                                                    //dataArr['field0'] = `没有匹配的记录`;
                                                    $table.bootstrapTable("destroy").bootstrapTable({
                                                        columns: columnsArr,
                                                        data: dataArr,
                                                        search: false,
                                                        fixedColumns: false,
                                                        detailView: false,
                                                        mergeCells: {
                                                            index: 0,
                                                            field: 'field0',
                                                            colspan: 5
                                                        },
                                                        formatNoMatches: function () {
                                                            return '没有匹配的记录';
                                                        },
                                                    });
                                                }
                                            } else {
                                                //dataArr['field0'] = `没有匹配的记录`;
                                                $table.bootstrapTable("destroy").bootstrapTable({
                                                    columns: columnsArr,
                                                    data: dataArr,
                                                    search: false,
                                                    fixedColumns: false,
                                                    detailView: false,
                                                    mergeCells: {
                                                        index: 0,
                                                        field: 'field0',
                                                        colspan: 5
                                                    },
                                                    formatNoMatches: function () {
                                                        return '没有匹配的记录';
                                                    },
                                                });
                                            }
                                        }
                                    loadData(port, true, portData, successFunc);
                                }
                            }
                        });

                        $table.find("tbody tr").each((index, $dom) => {
                            $($dom).data("listData", result[index]);
                        })

                        if (data.data.total > Number(size) && first) {
                            var pageSizeOpt = [{
                                value: 10,
                                text: '10/页'
                            }, {
                                value: 20,
                                text: '20/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                getDashBoardOtherModalTable(type, obj, $table, $pagination, false, currPage, pageSize);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                        // hover 显示中图
                        showMiddleImg($('#dashBoardOtherModalTable'), $('#useManageKHItemModal'), '.table-img');
                    } else {
                        //dataArr['field0'] = `没有匹配的记录`;
                        $table.bootstrapTable("destroy").bootstrapTable({
                            columns: columnsArr,
                            data: dataArr,
                            search: false,
                            fixedColumns: false,
                            detailView: false,
                            mergeCells: {
                                index: 0,
                                field: 'field0',
                                colspan: 10
                            },
                            formatNoMatches: function () {
                                return '没有匹配的记录';
                            },
                        });
                    }
                } else {
                    //dataArr['field0'] = `没有匹配的记录`;
                    $table.bootstrapTable("destroy").bootstrapTable({
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: false,
                        detailView: false,
                        mergeCells: {
                            index: 0,
                            field: 'field0',
                            colspan: 10
                        },
                        formatNoMatches: function () {
                            return '没有匹配的记录';
                        },
                    });
                }
            }
        loadData(port, true, portData, successFunc);
    }

    //使用次数为0搜索事件
    $("#useManageKHItemModal").on("click", "#useCountIsZeroSearch", function () {
        $("#useManageKHItemModal").find("#useCountIsZeroUpload").data({
            userName: $("#useManageKHItemModal").find("#userNameUseCountIsZero").val() || '',
            userId: $("#useManageKHItemModal").find("#userIdUseCountIsZero").val() || '',
            orgId: $("#useManageKHItemModal").find("#orgIdUseCountIsZero").val()
        })
        getQueryUseIsZeroCount('useCountIsZero', $("#useManageKHItemModal").find("#useCountIsZeroUpload").data("obj"), $("#useManageKHItemModal").find("#dashBoardOtherModalTable"), $("#useManageKHItemModal").find("#dashBoardOtherModalTablePagination"), true, 1, 10);
    })

    //使用次数不为0导出点击事件
    $("#useManageKHItemModal").on("click", "#useCountIsZeroUpload", function () {
        var orgId = $(this).data("orgId"),
            userName = $(this).data("userName") || '',
            userId = $(this).data("userId") || '';
        var post_url = encodeURI(serviceUrl + '/v3/errReport/exportUseIsZeroCount?startTime=' + configYCData.startTime + '&endTime=' + configYCData.endTime + '&orgId=' + orgId + '&roleType=' + configYCData.roleType + '&userId=' + userId + '&userName=' + userName + '&token=' + $.cookie('xh_token'));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //使用次数不为0详情导出点击事件
    $("#useManageKHItemChildModal").on("click", "#useCountIsZeroDetailUpload", function () {
        var listData = $(this).data("listData"),
            objData = $(this).data("obj");
        var post_url = encodeURI(serviceUrl + '/v3/errReport/exportUseIsZeroCountDetail?startTime=' + configYCData.startTime + '&endTime=' + configYCData.endTime + '&orgId=' + objData.apaasOrgId + '&rowNum=' + listData.useCount + '&userId=' + listData.userId + '&token=' + $.cookie('xh_token'));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });


    //考核列表静态人像比对次数和动态人像比对次数列点击展示
    $("#useManage").on("click", ".staticNum,.dynamicNum", function () {
        if ($(this).html() == '0') {
            return;
        }
        $("#useManageKHItemModal").modal("show").find(".modal-title").html(commonGetKHName($(this).attr("class").split(" ")[1]));
        var data = $(this).parents("tr").data("listData"),
            $dom = $("#useManageKHItemModal").find(".modal-body"),
            url = "./facePlatform/searchManage.html?dynamic=" + Global.dynamic,
            orgId = '',
            policeId = '',
            apaasOrgId = data.apaasOrgId;

        for (var target of $("#sys-manage-tree-list").find("li")) {
            if ($(target).attr("modulecode") == '260918') {
                $(target).attr("link", 1);
            }
        }

        if (configKHData.orgId != '10') {
            orgId = $(this).parents("tbody").find("tr").eq(0).data("listData").orgId;
            policeId = data.orgId;
        } else {
            orgId = data.orgId;
        }
        $("#useManageKHItemModal").data({
            orgId,
            policeId,
            apaasOrgId
        });
        loadPage($dom, url);
        $dom.css('padding', '0');
        $("#searchManageType").val($(this).hasClass("staticNum") ? '118002001' : '118002002');
        $("#searchManageType").selectmenu('refresh');

        $("#searchManageRoleType").val(configKHData.roleType);
        $("#searchManageRoleType").selectmenu('refresh');

        $("#startTimeSearchManage").val(`${configKHData.startTime} 00:00:00`);
        $("#endTimeSearchManage").val(`${configKHData.endTime} 23:59:59`);
        $("#startTimeSearchManage").blur();
        $("#endTimeSearchManage").blur();

    });

    //考核列表权限申请列点击展示
    $("#useManage").on("click", ".applyAllNum,.applyLaNum,.applyJqNum,.applyZaNum,.applyEmergentNum,.applyXbNum", function () {
        if ($(this).html() == '0') {
            return;
        }
        $("#useManageKHItemModal").modal("show").find(".modal-title").html(commonGetKHName($(this).attr("class").split(" ")[1]));
        var data = $(this).parents("tr").data("listData"),
            $dom = $("#useManageKHItemModal").find(".modal-body"),
            url = "./facePlatform/permission-apply-manage.html?dynamic=" + Global.dynamic,
            orgId = '',
            policeId = '',
            apaasOrgId = data.apaasOrgId,
            type = ''; //type 1是除了紧急警务其他的类型   7是紧急警务

        if (configKHData.orgId != '10') {
            orgId = $(this).parents("tbody").find("tr").eq(0).data("listData").orgId;
            policeId = data.orgId;
        } else {
            orgId = data.orgId;
        }

        if ($(this).hasClass("applyLaNum")) {
            type = '3';
        } else if ($(this).hasClass("applyXbNum")) {
            type = '6';
        } else if ($(this).hasClass("applyJqNum")) {
            type = '2';
        } else if ($(this).hasClass("applyZaNum")) {
            type = '4';
        } else if ($(this).hasClass("applyEmergentNum")) {
            type = '7';
        }

        $("#useManageKHItemModal").data({
            orgId,
            policeId,
            type,
            apaasOrgId
        });

        loadPage($dom, url);
        $dom.css('padding', '0');

        $("#startTimePAMTwo").val(`${configKHData.startTime} 00:00:00`);
        $("#endTimePAMTwo").val(`${configKHData.endTime} 23:59:59`);
        $("#startTimePAM").val(`${configKHData.startTime} 00:00:00`);
        $("#endTimePAM").val(`${configKHData.endTime} 23:59:59`);

        $("#permissionApplyRoleType").val(configKHData.roleType);
        $("#permissionApplyRoleType").selectmenu('refresh');
        $("#permissionApplyRoleTypeTwo").val(configKHData.roleType);
        $("#permissionApplyRoleTypeTwo").selectmenu('refresh');
    });

    //考核列表登录列点击展示
    $("#useManage").on("click", ".accountNum,.loginPersonNum,.loginAllNum,.notUseAccountNum", function () {
        if ($(this).html() == '0') {
            return;
        }
        $("#useManageKHItemModal").modal("show").find(".modal-title").html(commonGetKHName($(this).attr("class").split(" ")[1]));
        var data = $(this).parents("tr").data("listData"),
            $dom = $("#useManageKHItemModal").find(".modal-body");

        var html = `<table id="dashBoardOtherModalTable" class="table-hover"></table>
                    <div class="fixed-table-pagination bayonetCameralPagination" id="dashBoardOtherModalTablePagination"></div>`
        $dom.append(html);
        $dom.css('padding', '1.25rem 1.5rem');
        getDashBoardOtherModalTable($(this).attr("class").split(" ")[1], data, $("#useManageKHItemModal").find("#dashBoardOtherModalTable"), $("#useManageKHItemModal").find("#dashBoardOtherModalTablePagination"), true, 1, 10);
    });

    //未补办手续数、异常列表超时、异常登录数、案件查询异常数、重复申请数、查询对象与申请不符预警数 点击展示
    $("#useManage").on("click", ".untimelyMakeUp,.overdueUnused,.abnormalLogin,.abnormalCase,.repeatCase,.queryInconsistent,.useCountIsZero,.idcardWarnCase", function () {
        if ($(this).html() == '0') {
            return;
        }
        $("#useManageKHItemModal").modal("show").find(".modal-title").html(commonGetYCName($(this).attr("class").split(" ")[1]));
        var data = $(this).parents("tr").data("listData"),
            $dom = $("#useManageKHItemModal").find(".modal-body");

        var html = `<table id="dashBoardOtherModalTable" class="table-hover"></table>
                    <div class="fixed-table-pagination bayonetCameralPagination" id="dashBoardOtherModalTablePagination"></div>`
        $dom.append(html);
        $dom.css('padding', '1.25rem 1.5rem');
        getDashBoardOtherModalTable($(this).attr("class").split(" ")[1], data, $("#useManageKHItemModal").find("#dashBoardOtherModalTable"), $("#useManageKHItemModal").find("#dashBoardOtherModalTablePagination"), true, 1, 10);
    });

    //身份证撞线事件详情点击事件
    $("#useManage").on("click", ".incidentShow", function () {
        var targetData = $(this).parents("tr").data("listData"),
            url = "./facePlatform/incident-dialog.html";
        if (targetData.incidentInfo) {
            $('.incident-new-popup').data({
                incidentDetail: targetData.incidentInfo,
                showDynamicDetail: true
            });
            loadPage($('.incident-new-popup'), url);
            $('.incident-new-popup').removeClass('hide');
        } else {
            warningTip.say("暂无详情数据");
        }
    })

    //超时未使用导出点击事件
    $("#useManage").on("click", "#overdueUnusedUpload", function () {
        var data = $(this).data("data") || {};
        var post_url = encodeURI(serviceUrl + '/v3/errReport/exportNotLoginUserDetail?startTime=' + configYCData.startTime + '&endTime=' + configYCData.endTime + '&orgId=' + configKHData.orgId + '&roleType=' + configYCData.roleType + '&apaasOrgId=' + data.apaasOrgId + '&token=' + $.cookie('xh_token'));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //未使用人数导出点击事件
    $("#useManage").on("click", "#notUseAccountNumUpload", function () {
        var data = $(this).data("data") || {};
        var post_url = encodeURI(serviceUrl + '/v3/report/exportNotLoginPersonDetail?startTime=' + configKHData.startTime + '&endTime=' + configKHData.endTime + '&roleType=' + configKHData.roleType + '&apaasOrgId=' + data.apaasOrgId + '&token=' + $.cookie('xh_token'));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //未补办手续导出点击事件
    $("#useManage").on("click", "#untimelyMakeUpUpload", function () {
        var data = $(this).data("data") || {};
        var post_url = encodeURI(serviceUrl + '/v3/errReport/exportUntimelyMakeUpDetail?startTime=' + configYCData.startTime + '&endTime=' + configYCData.endTime + '&orgId=' + configKHData.orgId + '&roleType=' + configYCData.roleType + '&apaasOrgId=' + data.apaasOrgId + '&token=' + $.cookie('xh_token'));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //账号总数导出事件
    $("#useManage").on("click", "#accountNumUpload", function () {
        var objData = $(this).data("data"),
            uploadData = {
                startTime: configKHData.startTime,
                endTime: configKHData.endTime,
                roleType: configKHData.roleType,
                apaasOrgId: objData.apaasOrgId,
                token: $.cookie('xh_token')
            };
        var post_url = encodeURI(serviceUrl + '/v3/report/exportAccountDetail?param=' + JSON.stringify(uploadData));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //登录总人数导出事件
    $("#useManage").on("click", "#loginPersonNumUpload", function () {
        var objData = $(this).data("data"),
            uploadData = {
                startTime: configKHData.startTime,
                endTime: configKHData.endTime,
                roleType: configKHData.roleType,
                apaasOrgId: objData.apaasOrgId,
                token: $.cookie('xh_token')
            };
        var post_url = encodeURI(serviceUrl + '/v3/report/exportLoginPersonDetail?param=' + JSON.stringify(uploadData));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //登录总次数导出事件
    $("#useManage").on("click", "#loginAllNumUpload", function () {
        var objData = $(this).data("data"),
            uploadData = {
                startTime: configKHData.startTime,
                endTime: configKHData.endTime,
                roleType: configKHData.roleType,
                apaasOrgId: objData.apaasOrgId,
                token: $.cookie('xh_token')
            };
        var post_url = encodeURI(serviceUrl + '/v3/report/exportLoginCountDetail?param=' + JSON.stringify(uploadData));
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //考核列表弹窗关闭按钮点击事件
    $("#useManageKHItemModal").on("click", "#useManageItemClose", function () {
        $("#useManageKHItemModal").find(".modal-body").html("");
        $("#useManageKHItemModal").modal("hide");
    });

    //统计报表周报日报切换
    $("#useManageTabOne").on("click", ".khData .ui-checkboxradio-button", function () {
        if ($(this).next().val() == 2) { //周报
            $(this).parents(".khData").find(".khDataWeek").removeClass("hide");
            $(this).parents(".khData").find(".khDataDay").addClass("hide");
        } else {
            $(this).parents(".khData").find(".khDataWeek").addClass("hide");
            $(this).parents(".khData").find(".khDataDay").removeClass("hide");
        }
    })

    $("#useManageNav").on("click", ".nav-link", function () {
        //resizeTableHeight($(this).parent().index());
        if ($(this).parent().index() == 0) {
            $("#useManage .useManageOne").removeClass("hide");
            $("#useManage .useManageTwo").addClass("hide");
        } else if ($(this).parent().index() == 1) {
            $("#useManage .useManageOne").addClass("hide");
            $("#useManage .useManageTwo").removeClass("hide");

            if (!$('#useManageTwoTable').children().length) {
                let nowDate = new Date(),
                    nowDay = nowDate.getDate(),
                    maxDateStr = `${nowDay > 25 ? "\'%y-%M\'" : "\'%y-#{%M-1}\'"}`,
                    year = nowDate.getFullYear(),
                    month = nowDay > 25 ? (nowDate.getMonth() + 2) : (nowDate.getMonth() + 1);
                $("#useManageTwoDate").html(`<input id="useManageTwoDateStart" 
                                                    class="input-text datepicker-input radius Wdate" 
                                                    type="text"/>
                                                <span class="input-group-addon">~</span>
                                                <input id="useManageTwoDateEnd" 
                                                        class="input-text datepicker-input radius Wdate" 
                                                        type="text"/>
                                                <span class="input-group-addon">
                                                    <i class="datepicker-icon aui-icon-calendar"></i>
                                                </span>`);

                //选择时间初始化
                $("#useManageTwoDateStart").off("click").on("click", function () {
                    WdatePicker({
                        maxDate: '#F{$dp.$D(\'useManageTwoDateEnd\')}',
                        dateFmt: 'yyyy-MM',
                        autoPickDate: true,
                    })
                });

                $("#useManageTwoDateEnd").off("click").on("click", function () {
                    WdatePicker({
                        maxDate: `#F{${maxDateStr}}`,
                        minDate: '#F{$dp.$D(\'useManageTwoDateStart\')}',
                        dateFmt: 'yyyy-MM',
                        autoPickDate: true
                    })
                });

                configYCData.startTime = year + '-' + ((month - 1) < 10 ? '0' + (month - 1) : (month - 1));
                configYCData.endTime = year + '-' + ((month - 1) < 10 ? '0' + (month - 1) : (month - 1));

                $("#useManageTwoDateStart").val(configYCData.startTime);
                $("#useManageTwoDateEnd").val(configYCData.endTime);

                createSnapYCList($('#useManageTwoTable'), true, configYCData);
            }
        }
    })

    //搜索按钮点击事件 考核
    $("#useManageOneSearch").on("click", function () {
        configKHData.orgId = $("#orgIdKH").val();
        configKHData.roleType = $("#useManageTabOne .snapRoleType").find("input[name='snapRoleRadioKH']:checked").val();
        if ($("#useManageTabOne .khDataDay").hasClass("hide")) { //周报
            configKHData.startTime = $.trim($("#useManageOneDateStart").val());
            configKHData.endTime = $.trim($("#useManageOneDateEnd").val());
        } else {
            configKHData.startTime = $.trim($("#useManageOneDateSnap").val());
            configKHData.endTime = $.trim($("#useManageOneDateSnap").val());
        }
        if (configKHData.startTime && configKHData.endTime) {
            createSnapKHList($('#useManageOneTable'), true, configKHData);
        } else {
            warningTip.say('请输入起止时间');
        }
    });

    //导出按钮点击事件 考核
    $("#useManageOneImport").on("click", function () {
        if (configKHData.startTime && configKHData.endTime) {
            var post_url = serviceUrl + '/v3/report/exportDayStatistic?startTime=' + configKHData.startTime + '&endTime=' + configKHData.endTime + '&orgId=' + configKHData.orgId + '&roleType=' + configKHData.roleType + '&token=' + $.cookie('xh_token');
            if ($("#IframeReportImg").length === 0) {
                $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
            }
            $('#IframeReportImg').attr("src", post_url);
        } else {
            warningTip.say('请输入起止时间');
        }
    });

    //搜索按钮点击事件 异常
    $("#useManageTwoSearch").on("click", function () {
        configYCData.orgId = $("#orgIdYC").val();
        configYCData.roleType = $("#useManageTabTwo .snapRoleType").find("input[name='snapRoleRadioYC']:checked").val();

        configYCData.startTime = $.trim($("#useManageTwoDateStart").val());
        configYCData.endTime = $.trim($("#useManageTwoDateEnd").val());

        // if (configYCData.startTime && configYCData.endTime) {
        if (configYCData.startTime) {
            createSnapYCList($('#useManageTwoTable'), true, configYCData);
        } else {
            warningTip.say('请输入起始时间');
        }
    });

    //导出按钮点击事件 异常
    $("#useManageTwoImport").on("click", function () {
        if (configYCData.startTime && configYCData.endTime) {
            var post_url = serviceUrl + '/v3/errReport/exportErrReportStatistic?startTime=' + configYCData.startTime + '&endTime=' + configYCData.endTime + '&orgId=' + configYCData.orgId + '&roleType=' + configYCData.roleType + '&token=' + $.cookie('xh_token');
            if ($("#IframeReportImg").length === 0) {
                $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
            }
            $('#IframeReportImg').attr("src", post_url);
        } else {
            warningTip.say('请输入起止时间');
        }
    });

    function resizeTableHeight(index) {
        if (index == 0) {
            var modalTableHeight = $("#useManage").height() - $("#useManage #useManageTabOne").outerHeight() - $("#useManageTab").outerHeight() - 80;
            $("#useManageOneTable").bootstrapTable("refreshOptions", {
                height: modalTableHeight
            }).bootstrapTable("refresh");
            if ($("#useManageOneTable").data("listData")) {
                $("#useManageOneTable").find("tbody tr").each((index, $dom) => {
                    $($dom).data("listData", $("#useManageOneTable").data("listData")[index]);
                })
            }
        } else if (index == 1) {
            var modalTableHeight = $("#useManage").height() - $("#useManage #useManageTabTwo").outerHeight() - $("#useManageTab").outerHeight() - 80;
            $("#useManageTwoTable").bootstrapTable("refreshOptions", {
                height: modalTableHeight
            }).bootstrapTable("refresh");
            if ($("#useManageTwoTable").data("listData")) {
                $("#useManageTwoTable").find("tbody tr").each((index, $dom) => {
                    $($dom).data("listData", $("#useManageTwoTable").data("listData")[index]);
                })
            }
        }
    };

    $(window).resize(function () {
        var index = 0;
        if ($("#useManageTab").find(".nav-link").eq(0).hasClass("active")) {
            index = 0;
        } else if ($("#useManageTab").find(".nav-link").eq(1).hasClass("active")) {
            index = 1;
        }
        resizeTableHeight(index);
    })

})(window, window.jQuery)