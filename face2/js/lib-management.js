(function (window, $) {
    var _selectedFusionCountsLib = 0,
        selectedFusionDataLib = [], //批量删除数据
        selectedFusionDataLibThree = [], //按角色批量删除数据
        serviceDataInit = { //按人列表数据
            page: '1',
            size: '10',
            objType: '2',
            objName: ''
        },
        serviceDataInitTwo = { //按库列表数据
            page: '1',
            size: '10',
            libName: ''
        },
        serviceDataInitThree = { //按角色列表数据
            page: '1',
            size: '10',
            objName: '',
            objType: '3'
        },
        LibModalTwoPagination = {
            page: '1',
            size: '10'
        };

    function initPage() {
        // 单选初始化
        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });
        // 数据加载
        initServiceFusionImgLib($('#serviceFusionImgTableLib'), $('#serviceFusionImgTablePaginationLib'), true);
        initServiceFusionImgLibTwo($('#serviceFusionImgTableLibTwo'), $('#serviceFusionImgTablePaginationLibTwo'), true);
        initServiceFusionImgLibThree($('#serviceFusionImgTableLibThree'), $('#serviceFusionImgTablePaginationLibThree'), true);
        getPersonLib();
        getRoleLib();
    }
    initPage();

    //人员库获取
    function getPersonLib() {
        var port = 'v3/lib/allLibs',
            serviceData = {},
            successFunc = function (data) {
                if (data.code === '200') {
                    var result = data.data;
                    if (result.length > 0) {
                        $('#serviceShareEditModalLib').data('libList', result);
                        $("#serviceShareEditModalLibTwo").data('libList', result);
                    } else {
                        warningTip.say(data.message);
                    }
                };
            };
        loadData(port, true, serviceData, successFunc, undefined, 'GET');
    };

    //角色获取
    function getRoleLib() {
        var port = 'v3/lib/roleLibConfig',
            serviceData = {
                page: 1,
                size: 200
            },
            successFunc = function (data) {
                if (data.code === '200') {
                    var result = data.data.list;
                    if (result.length > 0) {
                        var itemHtml = ``;
                        for (var i = 0; i < result.length; i++) {
                            itemHtml += `<option class="option-item" value="${result[i].roleId}">${result[i].roleDesc}</option>`;
                        }
                        $("#libRoleChose").empty().append(itemHtml); // 元素赋值
                        $("#libRoleChose").prop('disabled', false);
                        $("#libRoleChose").selectpicker('refresh');
                    } else {
                        $("#libRoleChose").prop('disabled', false);
                        $("#libRoleChose").val("");
                        $("#libRoleChose").selectpicker('refresh');
                    }
                } else {
                    $("#libRoleChose").prop('disabled', false);
                    $("#libRoleChose").val("");
                    $("#libRoleChose").selectpicker('refresh');
                };
            };
        loadData(port, true, serviceData, successFunc, undefined);
    }

    //导出
    function importLoad(data, type) {
        showLoading($('#importLib'));
        var port = 'v3/lib/exportLibRightsToCache',
            successFunc = function (data) {
                hideLoading($('#importLib'));
                if (data.code == '200') {
                    var post_url = serviceUrl + '/v3/lib/exportLibRightsExcel?downId=' + data.downId + '&type=' + type + '&token=' + $.cookie('xh_token');
                    if ($("#IframeReportImg").length === 0) {
                        $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
                    }
                    $('#IframeReportImg').attr("src", post_url);
                } else {
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, data, successFunc);
    };

    //按人和按角色的新增弹窗公用
    function commonLibAddModel() {
        var libListArr = $('#serviceShareEditModalLib').data('libList'),
            type = $("#serviceShareEditModalLib").data("type");
        if (libListArr.length > 0) {
            var html = '';
            for (var i = 0; i < libListArr.length; i++) {
                html += `<tr data-index="${i}" class="" keyid="${libListArr[i].libId}">
                            <td title="${libListArr[i].libName || '--'}">${libListArr[i].libName || '--'}</td>
                            <td>
                                <div class="table-checkbox">
                                    <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList">
                                    <span class="table-checkbox-label"></span>
                                </div>
                            </td>
                            <td>
                                <div class="table-checkbox">
                                    <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList">
                                    <span class="table-checkbox-label"></span>
                                </div>
                            </td>
                            <td>
                                <div class="table-checkbox">
                                    <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList">
                                    <span class="table-checkbox-label"></span>
                                </div>
                            </td>
                            <td>
                                <div class="table-checkbox ${libListArr[i].type != 2 ? 'disabled' : ''}">
                                    <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList" ${libListArr[i].type != 2 ? 'disabled' : ''}>
                                    <span class="table-checkbox-label"></span>
                                </div>
                            </td>
                            <td>
                                <a class='operate-row operate-row-search'>全选</a>
                            </td>
                        </tr>`
            }
            // 给列表新增行数据
            $("#LibModal").find('tbody').html(html);
        }
        $("#LibModal thead").find(".libModalCheck").removeAttr("checked");
        if (type == 1) {
            $("#serviceShareEditModalLib").find(".addPerson").removeClass("hide");
            $("#serviceShareEditModalLib").find(".addRole").addClass("hide");
            $('#libUserChose').data({
                'noticeUserList': [],
                'saveVal': [],
                "editId": ''
            });
            $('#libUserChose').val("").attr('title', "");
            $("#libNameChose").val("");
            $("#libUserChose").removeClass("disabled");
        } else {
            $("#serviceShareEditModalLib").find(".addRole").removeClass("hide");
            $("#serviceShareEditModalLib").find(".addPerson").addClass("hide");
            //getRoleLib();
            $("#libRoleChose").prop('disabled', false);
            $("#libRoleChose").val("");
            $("#libRoleChose").selectpicker('refresh');
        }

        $("#LibModal").find("thead input").removeAttr("disabled");

        var $serviceShareModal = $('#serviceShareEditModalLib');
        $serviceShareModal.find('.modal-title').text('新增');
        $serviceShareModal.find(".modal-footer").removeClass("hide");
        $serviceShareModal.data("id", '');
        $serviceShareModal.modal('show');
    }

    //按人和按角色的新增弹窗确认按钮点击事件公用
    function commonLibAddBtn() {
        var libs = [],
            type = $("#serviceShareEditModalLib").data("type");
        for (let i = 0; i < $("#LibModal").find("tbody tr").length; i++) {
            let checkedIsEdit = $("#LibModal").find("tbody tr").eq(i).find("input").eq(1).is(":checked");
            let checkedIsSee = $("#LibModal").find("tbody tr").eq(i).find("input").eq(0).is(":checked");
            let checkedIsBk = $("#LibModal").find("tbody tr").eq(i).find("input").eq(3).is(":checked");
            let checkedIs1vn = $("#LibModal").find("tbody tr").eq(i).find("input").eq(2).is(":checked");
            if (checkedIsEdit || checkedIsSee || checkedIsBk || checkedIs1vn) {  //4种状态有任意一个被选中都传给后台，否则不传
                let libsItem = {};
                libsItem.id = $('#serviceShareEditModalLib').data("id");
                libsItem.libId = $("#LibModal").find("tbody tr").eq(i).attr("keyid");
                libsItem.isEdit = checkedIsEdit ? 1 : 0;
                libsItem.isSee = checkedIsSee ? 1 : 0;
                libsItem.isBk = checkedIsBk ? 1 : 0;
                libsItem.is1vn = checkedIs1vn ? 1 : 0;
                libs.push(libsItem);
            }
        }

        //新增
        if ($('#serviceShareEditModalLib').find(".modal-title").html() == '新增') {
            var port = 'v3/lib/addLibRights',
                objIds = type == 1 ? $('#libUserChose').data("noticeUserList") : $("#libRoleChose").val(),
                serviceAddData = {
                    objIds: objIds ? objIds : [],
                    objType: type == 1 ? '2' : '3',
                    libs: libs
                };
        } else {  //编辑
            var port = 'v3/lib/editLibRightsByPerson',
                objIds = type == 1 ? $('#libUserChose').data("editId") : $("#libRoleChose").val()[0],
                serviceAddData = {
                    objId: objIds ? objIds : '',
                    objType: type == 1 ? '2' : '3',
                    libs: libs
                };
        }

        if (objIds && objIds.length > 0) {
            if (serviceAddData.libs.length == 0) {
                warningTip.say("请选择库权限");
            } else {
                var portDataSuccessFunc = function (data) {
                    if (data.code === '200') {
                        $('#serviceShareEditModalLib').modal("hide");
                        if (type == 1) {
                            initServiceFusionImgLib($('#serviceFusionImgTableLib'), $('#serviceFusionImgTablePaginationLib'), true);
                        } else {
                            initServiceFusionImgLibThree($('#serviceFusionImgTableLibThree'), $('#serviceFusionImgTablePaginationLibThree'), true);
                        }
                    } else {
                        warningTip.say(data.message);
                    }
                };
                loadData(port, true, serviceAddData, portDataSuccessFunc);
            }
        } else {
            type == 1 ? warningTip.say("请选择用户！") : warningTip.say("请选择角色！");
        }
    }

    /** 按人按角色列表全选按钮点击事件
     * @param {*} $this //当前点击列
     * @param {*} $table  // 当前列表
     * @param {*} $deleteBtn  // 删除按钮
     * @param {*} selectData  // 删除数据
     */
    function commonLibTableAllChose($this, $table, $deleteBtn, selectData) {
        var $checkboxs = $this.parents("table").find("tbody .table-checkbox-row-serviceFusion-lib");
        if ($this.is(":checked")) {
            for (var i = 0; i < $checkboxs.length; i++) {
                $checkboxs.eq(i).prop("checked", "checked");
            }
            selectData = [];
            $table.data().result.map(function (e) {
                selectData.push(e.objId);
            });
        } else {
            for (var i = 0; i < $checkboxs.length; i++) {
                $checkboxs.eq(i).removeAttr("checked");
            }
            selectData = [];
        }
        // 判断批量删除是否可用
        if (selectData.length > 0) {
            $deleteBtn.removeClass('disabled');
        } else {
            $deleteBtn.addClass('disabled');
        }
        // 删除弹框绑定批量删除数据
        $('#serviceShareTipModalLib').data('selectData', selectData);
    };

    /** 按人按角色列表多选框点击事件
     * @param {*} $this //当前点击列
     * @param {*} $table  // 当前列表
     * @param {*} $deleteBtn  // 删除按钮
     * @param {*} selectData  // 删除数据
     */
    function commonLibTableInputChose($this, $table, $deleteBtn, selectData) {
        var rowData = $this.closest("tr").data("listData");
        if (!$this.is(":checked")) { //取消选中
            //删除数据
            selectData.map(function (e, n) {
                if (e == rowData.objId) {
                    selectData.splice(n, 1);
                }
            })
        } else { //选中
            // $this.prop("checked", "checked");
            selectData.push(rowData.objId);
        }
        // 判断全选框是否选中
        var cardLen = selectData.length,
            activeLen = $table.find('.table-checkbox-row-serviceFusion-lib').length;
        if (cardLen > 0 && cardLen == activeLen) {
            $table.find('.table-checkbox-all-serviceFusion-lib').prop("checked", "checked");
        } else {
            $table.find('.table-checkbox-all-serviceFusion-lib').removeAttr("checked");
        }
        // 判断批量删除是否可用
        if (selectData.length > 0) {
            $deleteBtn.removeClass('disabled');
        } else {
            $deleteBtn.addClass('disabled');
        }
        // 绑定批量删除数据
        $('#serviceShareTipModalLib').data('selectData', selectData);
    };

    /** 按人按角色列表查看按钮点击事件
     * @param {*} $this //当前点击列
     */
    function commonLibTableView($this) {
        var rowData = $this.closest("tr").data("listData"),
            $serviceShareModal = $('#serviceShareEditModalLib'),
            type = $serviceShareModal.data('type');
        if (type == 1) {
            $("#serviceShareEditModalLib").find(".addPerson").removeClass("hide");
            $("#serviceShareEditModalLib").find(".addRole").addClass("hide");
            $("#libUserChose").val(rowData.objName).attr("title", rowData.objName);
            $("#libUserChose").addClass("disabled");
            $("#libNameChose").val("");
        } else {
            $("#serviceShareEditModalLib").find(".addPerson").addClass("hide");
            $("#serviceShareEditModalLib").find(".addRole").removeClass("hide");
            $("#libRoleChose").prop('disabled', true);
            $("#libRoleChose").val(rowData.objId);
            $("#libRoleChose").selectpicker('refresh');
        }
        $("#LibModal thead").find(".libModalCheck").removeAttr("checked");

        var port = 'v3/lib/libRightsDetailsByPerson',
            serviceAddData = {
                objId: rowData.objId,
                objType: type == 1 ? '2' : '3',
                page: 1,
                size: 200
            };
        var portDataSuccessFunc = function (data) {
            if (data.code === '200') {
                $serviceShareModal.find('.modal-title').text('查看');
                $serviceShareModal.find(".modal-footer").addClass("hide");
                $serviceShareModal.modal('show');
                var html = '',
                    result = data.data.list;
                for (var i = 0; i < result.length; i++) {
                    if (result[i].isSee && result[i].isEdit && result[i].is1vn && (result[i].type == 2 ? result[i].isBk : !result[i].isBk)) {
                        var htmlOpt = '取消全选';
                    } else {
                        var htmlOpt = '全选';
                    }
                    html += `<tr data-index="${i}" class="" keyid="${result[i].libId}">
                                <td>${result[i].libName || '--'}</td>
                                <td>
                                    <div class="table-checkbox">
                                        <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList" ${result[i].isSee ? 'checked' : ''} disabled>
                                        <span class="table-checkbox-label"></span>
                                    </div>
                                </td>
                                <td>
                                    <div class="table-checkbox">
                                        <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList" ${result[i].isEdit ? 'checked' : ''} disabled>
                                        <span class="table-checkbox-label"></span>
                                    </div>
                                </td>
                                <td>
                                    <div class="table-checkbox">
                                        <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList" ${result[i].is1vn ? 'checked' : ''} disabled>
                                        <span class="table-checkbox-label"></span>
                                    </div>
                                </td>
                                <td>
                                    <div class="table-checkbox ${result[i].type != 2 ? 'disabled' : ''}">
                                        <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList ${result[i].type != 2 ? 'disabled' : ''}" ${result[i].isBk ? 'checked' : ''}  disabled>
                                        <span class="table-checkbox-label"></span>
                                    </div>
                                </td>
                                <td>
                                    <a class='operate-row operate-row-search disabled' style="color:#7b8084">${htmlOpt}</a>
                                </td>
                            </tr>`
                }
                // 给列表新增行数据
                $("#LibModal").find('tbody').html(html);
                for (let j = 0; j < $("#LibModal").find('thead input').length; j++) {
                    let index = $("#LibModal").find('thead input').eq(j).parents("th").index();
                    $("#LibModal").find('thead input').eq(j).prop("checked", "checked");
                    for (let k = 0; k < $("#LibModal").find('tbody tr').length; k++) {
                        if (!$("#LibModal").find("tbody tr").not(".hide").eq(k).find("td").eq(index).find("input").hasClass("disabled") && !$("#LibModal").find('tbody tr').eq(k).find("td").eq(index).find("input").is(":checked")) {
                            $("#LibModal").find('thead input').eq(j).removeAttr("checked");
                            break;
                        }
                    }
                }
            }
        };
        $("#LibModal").find("thead input").attr("disabled", "disabled");
        loadData(port, true, serviceAddData, portDataSuccessFunc);
    };

    /** 按人按角色列表 编辑点击事件
     * @param {*} $this //当前点击列
     */
    function commonLibTableEdit($this) {
        var rowData = $this.closest("tr").data("listData"),
            $serviceShareModal = $('#serviceShareEditModalLib'),
            type = $serviceShareModal.data('type');
        $serviceShareModal.data("id", rowData.id);
        $serviceShareModal.find('.modal-title').text('编辑');
        if (type == 1) {
            $("#serviceShareEditModalLib").find(".addPerson").removeClass("hide");
            $("#serviceShareEditModalLib").find(".addRole").addClass("hide");

            $("#libUserChose").val(rowData.objName).attr("title", rowData.objName).data("editId", rowData.objId);
            $("#libUserChose").addClass("disabled");
            $("#libNameChose").val("");
        } else {
            $("#serviceShareEditModalLib").find(".addPerson").addClass("hide");
            $("#serviceShareEditModalLib").find(".addRole").removeClass("hide");

            $("#libRoleChose").prop('disabled', true);
            $("#libRoleChose").val(rowData.objId);
            $("#libRoleChose").selectpicker('refresh');
        }
        $("#LibModal").find("thead input").removeAttr("disabled");
        $("#LibModal thead").find(".libModalCheck").removeAttr("checked");

        var port = 'v3/lib/libRightsDetailsByPerson',
            serviceAddData = {
                objId: rowData.objId,
                objType: type == 1 ? '2' : '3',
                page: 1,
                size: 200
            };
        var portDataSuccessFunc = function (data) {
            if (data.code === '200') {
                $serviceShareModal.find(".modal-footer").removeClass("hide");
                $serviceShareModal.modal('show');
                var html = '',
                    result = data.data.list;
                for (var i = 0; i < result.length; i++) {
                    if (result[i].isSee && result[i].isEdit && result[i].is1vn && (result[i].type == 2 ? result[i].isBk : !result[i].isBk)) {
                        var htmlOpt = '取消全选';
                    } else {
                        var htmlOpt = '全选';
                    }
                    html += `<tr data-index="${i}" class="" keyid="${result[i].libId}">
                                <td>${result[i].libName || '--'}</td>
                                <td>
                                    <div class="table-checkbox">
                                        <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList" ${result[i].isSee ? 'checked' : ''}>
                                        <span class="table-checkbox-label"></span>
                                    </div>
                                </td>
                                <td>
                                    <div class="table-checkbox">
                                        <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList" ${result[i].isEdit ? 'checked' : ''}>
                                        <span class="table-checkbox-label"></span>
                                    </div>
                                </td>
                                <td>
                                    <div class="table-checkbox">
                                        <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList" ${result[i].is1vn ? 'checked' : ''}>
                                        <span class="table-checkbox-label"></span>
                                    </div>
                                </td>
                                <td>
                                    <div class="table-checkbox ${result[i].type != 2 ? 'disabled' : ''}">
                                        <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList" ${result[i].isBk ? 'checked' : ''} ${result[i].type != 2 ? 'disabled' : ''}>
                                        <span class="table-checkbox-label"></span>
                                    </div>
                                </td>
                                <td>
                                    <a class='operate-row operate-row-search'>${htmlOpt}</a>
                                </td>
                            </tr>`
                }
                // 给列表新增行数据
                $("#LibModal").find('tbody').html(html);
                for (let j = 0; j < $("#LibModal").find('thead input').length; j++) {
                    let index = $("#LibModal").find('thead input').eq(j).parents("th").index();
                    $("#LibModal").find('thead input').eq(j).prop("checked", "checked");
                    for (let k = 0; k < $("#LibModal").find('tbody tr').length; k++) {
                        if (!$("#LibModal").find("tbody tr").not(".hide").eq(k).find("td").eq(index).find("input").attr("disabled") && !$("#LibModal").find('tbody tr').eq(k).find("td").eq(index).find("input").not(":disabled").is(":checked")) {
                            $("#LibModal").find('thead input').eq(j).removeAttr("checked");
                            break;
                        }
                    }
                }
            }
        };
        loadData(port, true, serviceAddData, portDataSuccessFunc);
    };

    // 新建or编辑 确认按钮点击事件
    $('#serviceShareOkButLib').on('click', function () {
        commonLibAddBtn();
    });

    //新增弹窗搜索按钮点击事件(按人和按角色)
    $("#libNameSearchManage").on("click", function () {
        var inputValue = $.trim($("#libNameChose").val()),
            inputValue = inputValue.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"),
            matcher = new RegExp(inputValue, "i"),
            libArr = [];
        $("#LibModal").find("tbody tr").removeClass("hide");

        for (let i = 0; i < $("#LibModal").find("tbody tr").length; i++) {
            let libObj = {};
            libObj.name = $("#LibModal").find("tbody tr").eq(i).find("td").eq(0).html();
            libObj.index = i;
            libArr.push(libObj);
        }

        var filterTxt = $.grep(libArr, function (val, index) {
            return !matcher.test(val.name);
        });

        filterTxt.forEach(item => {
            $("#LibModal").find("tbody tr").eq(item.index).addClass("hide");
        });

        for (let j = 1; j < $("#LibModal").find("thead th").length - 1; j++) {
            // $("#LibModal").find("thead th").eq(j).find("input").prop("checked", "checked");
            // for (let i = 0; i < $("#LibModal").find("tbody tr").not(".hide").length; i++) {
            //     if (!$("#LibModal").find("tbody tr").not(".hide").eq(i).find("td").eq(j).find("input").not(":disabled").is(":checked")) {
            //         $("#LibModal").find("thead th").eq(j).find("input").removeAttr("checked");
            //     }
            // }
            //let num = 0;
            $("#LibModal").find("thead th").eq(j).find("input").prop("checked", "checked");
            let num = 0;
            for (let i = 0; i < $("#LibModal").find("tbody tr").not(".hide").length; i++) {
                if ($("#serviceShareEditModalLib").find(".modal-title").html() != "查看") {  //新增或者编辑
                    if (!$("#LibModal").find("tbody tr").not(".hide").eq(i).find("td").eq(j).find("input").attr("disabled") && !$("#LibModal").find("tbody tr").not(".hide").eq(i).find("td").eq(j).find("input").not(":disabled").is(":checked")) {
                        $("#LibModal").find("thead th").eq(j).find("input").removeAttr("checked");
                        //break;
                    }
                    if ($("#LibModal").find("tbody tr").not(".hide").eq(i).find("td").eq(j).find("input").attr("disabled")) {  //不可点击的有几个
                        num++;
                    }
                    if (num == $("#LibModal").find("tbody tr").not(".hide").length) {
                        $("#LibModal").find("thead th").eq(j).find("input").removeAttr("checked");
                    }
                } else {//查找里面
                    if (!$("#LibModal").find("tbody tr").not(".hide").eq(i).find("td").eq(j).find("input").hasClass("disabled") && !$("#LibModal").find("tbody tr").not(".hide").eq(i).find("td").eq(j).find("input").not(".disabled").is(":checked")) {
                        $("#LibModal").find("thead th").eq(j).find("input").removeAttr("checked");
                        //break;
                    }
                    if ($("#LibModal").find("tbody tr").not(".hide").eq(i).find("td").eq(j).find("input").hasClass("disabled")) {  //不可点击的有几个
                        num++;
                    }
                    if (num == $("#LibModal").find("tbody tr").not(".hide").length) {
                        $("#LibModal").find("thead th").eq(j).find("input").removeAttr("checked");
                    }
                }
            }
        }
    });

    //新增弹窗库搜索输入框回车事件(按人和按角色)
    $("#libNameChose").on('keydown', function (e) {
        var code = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
        if (code == 13) {
            $("#libNameSearchManage").click();
        }
    });

    //新增编辑弹窗人员库列表每列选择（按人和按角色）
    $("#LibModal").on("click", ".LibModalList", function () {
        var index = $(this).parents("td").index();
        $("#LibModal").find("thead th").eq(index).find("input").prop("checked", "checked");
        $(this).parents("tr").find("td").eq(-1).find(".operate-row-search").html("取消全选");

        for (var i = 0; i < $("#LibModal").find("tbody tr").not(".hide").length; i++) {
            if (!$("#LibModal").find("tbody tr").not(".hide").eq(i).find("td").eq(index).find("input").attr("disabled") && !$("#LibModal").find("tbody tr").not(".hide").eq(i).find("td").eq(index).find("input").not(":disabled").is(":checked")) {
                $("#LibModal").find("thead th").eq(index).find("input").removeAttr("checked");
            }
        }

        for (var j = 0; j < $(this).parents("tr").find("input").not(":disabled").length; j++) {
            if (!$(this).parents("tr").find("input").not(":disabled").eq(j).is(":checked")) {
                $(this).parents("tr").find("td").eq(-1).find(".operate-row-search").html("全选");
                return;
            }
        }
    });

    //新增编辑弹窗人员库列表每列全选选择（按人和按角色）
    $("#LibModal").on("click", ".operate-row-search", function () {
        if ($(this).hasClass("disabled")) {
            return;
        }
        if ($(this).html() == '全选') {
            for (let i = 0; i < $(this).parents("tr").find("input").not(":disabled").length; i++) {
                if (!$(this).parents("tr").find("input").not(":disabled").eq(i).is(":checked")) {
                    $(this).parents("tr").find("input").not(":disabled").eq(i).prop("checked", "checked");
                    let index = $(this).parents("tr").find("input").not(":disabled").eq(i).parents("td").index();
                    $("#LibModal").find("thead th").eq(index).find("input").prop("checked", "checked");
                    for (let j = 0; j < $("#LibModal").find("tbody tr").not(".hide").length; j++) {
                        if (!$("#LibModal").find("tbody tr").not(".hide").eq(j).find("td").eq(index).find("input").attr("disabled") && !$("#LibModal").find("tbody tr").not(".hide").eq(j).find("td").eq(index).find("input").not(":disabled").is(":checked")) {
                            $("#LibModal").find("thead th").eq(index).find("input").removeAttr("checked");
                        }
                    }
                }
            }
            $(this).html("取消全选");
        } else {
            for (let i = 0; i < $(this).parents("tr").find("input").not(":disabled").length; i++) {
                if ($(this).parents("tr").find("input").not(":disabled").eq(i).is(":checked")) {
                    $(this).parents("tr").find("input").not(":disabled").eq(i).removeAttr("checked");
                    let index = $(this).parents("tr").find("input").not(":disabled").eq(i).parents("td").index();
                    $("#LibModal").find("thead th").eq(index).find("input").removeAttr("checked");
                }
            }
            $(this).parents("tr").find("input").removeAttr("checked");
            $(this).html("全选");
        }
    });

    //新增编辑弹窗人员库列表thead全选选择（按人和按角色）
    $("#LibModal").on("click", ".libModalCheck", function () {
        var index = $(this).parents("th").index();
        for (var i = 0; i < $("#LibModal").find("tbody tr").length; i++) {
            if (!$("#LibModal").find("tbody tr").eq(i).hasClass("hide")) {
                if ($(this).is(":checked")) {
                    $("#LibModal").find("tbody tr").eq(i).find("td").eq(index).find("input").not(":disabled").prop("checked", "checked");
                } else {
                    $("#LibModal").find("tbody tr").eq(i).find("td").eq(index).find("input").not(":disabled").removeAttr("checked");
                }
                $("#LibModal").find("tbody tr").eq(i).find("td").eq(-1).find(".operate-row-search").html("取消全选");
                for (let j = 0; j < $("#LibModal").find("tbody tr").eq(i).find("input").not(":disabled").length; j++) {
                    if (!$("#LibModal").find("tbody tr").eq(i).find("input").not(":disabled").eq(j).is(":checked")) {
                        $("#LibModal").find("tbody tr").eq(i).find("td").eq(-1).find(".operate-row-search").html("全选");
                    }
                }
            }
        }
    });

    // 行删除/批量删除 弹框确定按钮点击事件(按人按角色)
    $('#serviceShareDeleOkLib').on('click', function () {
        var rowData = $('#serviceShareTipModalLib').data('selectData'),
            type = $('#serviceShareTipModalLib').data('type');
        var port = 'v3/lib/delLibRights',
            serviceData = {
                objIds: rowData,
                objType: type == 1 ? '2' : '3'
            },
            successFunc = function (data) {
                if (data.code === '200') {
                    warningTip.say('删除成功');
                } else {
                    warningTip.say(data.message);
                }
                if (type == 1) {
                    initServiceFusionImgLib($('#serviceFusionImgTableLib'), $('#serviceFusionImgTablePaginationLib'), true);
                } else {
                    initServiceFusionImgLibThree($('#serviceFusionImgTableLibThree'), $('#serviceFusionImgTablePaginationLibThree'), true);
                }
            };
        loadData(port, true, serviceData, successFunc);
    });

    //各项切换
    $("#typeValBut").on("click", ".nav-item", function () {
        if ($(this).index() == 0) {
            $(".libmanagementTwo").addClass("hide");
            $(".libmanagementone").removeClass("hide");
            $(".libmanagementThree").addClass("hide");
            $(".libmanagementFour").addClass("hide");
        } else if ($(this).index() == 1) {
            $(".libmanagementone").addClass("hide");
            $(".libmanagementTwo").removeClass("hide");
            $(".libmanagementThree").addClass("hide");
            $(".libmanagementFour").addClass("hide");
        } else if ($(this).index() == 2) {
            $(".libmanagementone").addClass("hide");
            $(".libmanagementTwo").addClass("hide");
            $(".libmanagementThree").removeClass("hide");
            $(".libmanagementFour").addClass("hide");
        }
    });
    /***************************************************************按人******************************************************************************** */
    /** 权限列表
     * @param {*} $table // table目标容器
     * @param {*} $pagination  // 分页目标容器
     */
    function initServiceFusionImgLib($table, $pagination, first) {
        showLoading($table);
        var $tbody = $table.find('tbody'),
            $headItem = $table.find("thead .table-checkbox-all-serviceFusion");
        // 初始化
        _selectedFusionCountsLib = 0; // 已选项数据置为0
        $('#libManagement .checked-counts').html(_selectedFusionCountsLib);
        $headItem.removeAttr("checked"); // 取消全选状态
        selectedFusionDataLib = []; // 批量删除数据清除
        $('#serviceShareTipModalLib').data('selectData', selectedFusionDataLib);
        $('#deleteBtnFusionLib').addClass('disabled');
        $("#serviceFusionImgTableLib").find(".table-checkbox-all-serviceFusion-lib").removeAttr("checked");
        if (first) {
            $tbody.html('<tr><td colspan="6" class="text-center">No matching records found</td></tr>');
            $pagination.html(''); // 清空分页
            serviceDataInit.page = 1;
            serviceDataInit.size = 10;
        }
        var port = 'v3/lib/libRightsByPerson',
            successFunc = function (data) {
                hideLoading($table);
                $tbody.empty();
                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });
                    $table.data({
                        'total': data.data.total
                    });
                    if (result && result.length > 0) {
                        var html = '';
                        for (var i = 0; i < result.length; i++) {
                            html += `<tr data-index="${i}" class="" keyid="${result[i].objId}">
                                <td class="bs-checkbox ">
                                    <div class="table-checkbox">
                                        <input data-index="0" name="btSelectItemLib" type="checkbox" value="0" class="table-checkbox-input table-checkbox-row-serviceFusion-lib">
                                        <span class="table-checkbox-label"></span>
                                    </div>
                                </td>
                                <td>${result[i].objName || '--'}</td>
                                <td>${result[i].objId || '--'}</td>
                                <td>${result[i].orgName || '--'}</td>
                                <td>${result[i].updatetime || '--'}</td>
                                <td>
                                    <i class="icon aui-icon-file aui-mr-sm" title="查看"></i>
                                    <i class="icon aui-icon-edit aui-mr-sm" title="编辑"></i>
                                    <i class="icon aui-icon-delete-line aui-mr-sm" title="删除"></i>
                                    <i class="icon aui-icon-import aui-mr-sm" title="导出"></i>
                                </td>
                            </tr>`
                        }
                        // 给列表新增行数据
                        $tbody.html(html);
                        $tbody.find("tr").each(function (index, el) {
                            $(el).data('listData', result[index]);
                        });
                        if (data.data.total > Number(serviceDataInit.size) && first) {
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
                                serviceDataInit.page = currPage;
                                serviceDataInit.size = pageSize;
                                initServiceFusionImgLib($table, '', false);
                                $("#serviceFusionImgTableLib").find(".table-checkbox-all-serviceFusion-lib").removeAttr("checked");
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        if (result.length === 0) {
                            $tbody.html('<tr><td colspan="6" class="text-center">No matching records found</td></tr>');
                            $('.fixed-table-loading').hide();
                        }
                    }
                } else {
                    $tbody.html('<tr><td colspan="6" class="text-center">No matching records found</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, serviceDataInit, successFunc);
    }

    // 用户选择调用
    $('#libUserChose').orgTree({
        all: true, //人物组织都开启
        area: ['620px', '542px'], //弹窗框宽高
        search: true, // 搜索事件不在orgTree
        newBk: true,
        noMap: true,
        noTree: true,
        ajaxFilter: false,
        node: 'libUserChose'
    });

    // 人员选择
    $('#libUserChose').on('click', function () {
        if ($(this).hasClass("disabled")) {
            return;
        }
        $('.multiPickerDlg_right_no_result').html('<i></i>未选择人员');
        $('#memberSearchInput').attr('placeholder', '搜索人员');
        $('.type-change-left').text('人员列表');
        $('.multiPickerDlg_right_title>span').text('已选接收人');
        $('#partyTree').remove();
        $('.type-change-right').hide();
        $('.layui-layer-btn').attr('id', 'noticeUserList');
        showLoading($('.layui-layer-content'));
        // 告警接收人 左侧列表参数
        var controlOpt = {
            page: '1',
            size: '15'
        }
        controlOpt.page = '1';
        var searchPage = 2;
        // controlOpt.orgids = orgids;
        // 告警接收人
        var receivePort = 'v2/user/getOrgUserInfos';
        var receiveSuccessFunc = function (data) {
            if (data.code === '200') {
                $('#saveNode').html('');
                var liList = '',
                    html = '';
                var list = data.data.list;
                if (list) {
                    //判断是否有选中值
                    var userSaveVal = $('#libUserChose').data('saveVal');
                    if (list.length > 0) {
                        for (var i = 0; i < list.length; i++) {
                            liList += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`
                        };
                        html = `<div id="receiveResultView" class="ww_searchResult">
                            <ul id="receive_member_list_view" class="ztree">${liList}</ul>
                        </div>`;
                    } else {
                        html = '<p class="search_member_none">当前所选分局暂无告警接收人</p>';
                        $('.multiPickerDlg_right_title').find('.js-remove-all').click();
                    }
                    $('.multiPickerDlg_search_wrapper').append(html);
                    if (userSaveVal && userSaveVal.length > 0) {
                        $('#receive_member_list_view').data({
                            'cameraList': userSaveVal
                        });
                        var liHtml = '';
                        userSaveVal.forEach(function (item) {
                            var liNiName = item.userName ? item.userName : item.userName;
                            var liLoginName = item.userId ? item.userId : item.userId;
                            liHtml += '<li title=' + item.title + ' data-name=' + liNiName + ' data-id=' + item.orgId + ' userId=' + liLoginName + ' class="ww_menuDialog_DualCols_colRight_cnt_item token-input-token js_list_item">' +
                                '<span class="ww_commonImg icon icon_folder_blue"></span>' +
                                '<span class="ww_treeMenu_item_text" title=' + item.title + '>' + liNiName + '</span>' +
                                '<a href="javascript:" class="ww_menuDialog_DualCols_colRight_cnt_item_delete"><span class="ww_commonImg ww_commonImg_DeleteItem js_delete"></span></a>' +
                                '</li>';
                            //左侧选中
                            $('#receive_member_list_view').find('li[userId="' + liLoginName + '"] .button').addClass('checkbox_true_full');
                        });
                        $('#js-camera-totle').text(userSaveVal.length);
                        $('.multiPickerDlg_right_no_result').hide();
                        $('#saveNode').html(liHtml);
                    } else {
                        $('#receive_member_list_view').data({
                            'cameraList': []
                        });
                    }
                    // 点击清空事件
                    $('.js-remove-all').off('click').on('click', function () {
                        $('#saveNode').html('');
                        $('#receive_member_list_view').data({
                            'cameraList': []
                        });
                        $('#js-camera-totle').text('0');
                        $('#receive_member_list_view li .button').removeClass('checkbox_true_full');
                        $('#search_member_list li .button').removeClass('checkbox_true_full');
                        $('.multiPickerDlg_right_no_result').show();

                    });
                    // 右侧点击取消选中
                    $('#saveNode').on('click', 'li', function () {
                        var $this = $(this);
                        var userId = $this.attr('userId');
                        var saveVal = [];
                        $('#receive_member_list_view').data('cameraList').forEach(function (item) {
                            saveVal.push(item);
                        })
                        for (var i = 0; i < saveVal.length; i++) {
                            if (saveVal[i].userId == userId || saveVal[i].userId == userId) {
                                saveVal.splice(i, 1);
                                $('#receive_member_list_view').find('li[userId="' + userId + '"] .button').removeClass('checkbox_true_full');
                                $('#search_member_list').find('li[userId="' + userId + '"] .button').removeClass('checkbox_true_full');
                            };
                        };
                        $('#receive_member_list_view').data({
                            'cameraList': saveVal
                        });
                        $this.remove();
                        $('#js-camera-totle').text($('#saveNode>li').length);
                        if ($('#saveNode>li').length == 0) {
                            $('.multiPickerDlg_right_no_result').show();
                        }
                    });
                    // 点击确定
                    $('#noticeUserList .layui-layer-btn0').on('click', function () {
                        var saveVal = $('#receive_member_list_view').data('cameraList') && $('#receive_member_list_view').data('cameraList').length > 0 ? $('#receive_member_list_view').data('cameraList') : [];
                        var noticeUserList = [];
                        var nameArr = [];
                        if (saveVal.length > 0) {
                            saveVal.forEach(function (item) {
                                var liLoginName = item.userId;
                                var liNiName = item.userName;
                                noticeUserList.push(liLoginName);
                                nameArr.push(liNiName);
                            })
                        }
                        $('#libUserChose').data({
                            'noticeUserList': noticeUserList,
                            'saveVal': saveVal
                        });
                        $('#libUserChose').val(nameArr.join(',')).attr('title', nameArr.join(','));

                        if ($('#libUserChose').val() !== '' && $('#libUserChose').val() !== []) {
                            $('#libUserChose').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');
                        }
                        $('.layui-layer-btn1').click();
                        // 清空告警接受人信息
                        $('#control_noticeUserList').data({
                            'saveVal': [],
                            'noticeUserList': []
                        }).val('');
                    });
                    // 左侧列表 点击事件
                    function memberListClick($this) {
                        $this.find('.button').toggleClass('checkbox_true_full');
                        $('.multiPickerDlg_right_no_result').hide();
                        var orgId = $this.attr('data-id');
                        var userName = $this.attr('data-name');
                        var title = $this.attr('title');
                        var userId = $this.attr('userId');
                        var orgName = $this.attr('orgName');
                        var index = $this.index();
                        var repInx; //获取重复数组的索引
                        var newSaveVal = [];
                        if ($('#receive_member_list_view').data('cameraList') && $('#receive_member_list_view').data('cameraList').length > 0) {
                            $('#receive_member_list_view').data('cameraList').forEach(function (item) {
                                newSaveVal.push(item);
                            });
                        }
                        if ($this.closest('#searchResult').length > 0) {
                            $('#receiveResultView').find('li[userId="' + userId + '"]').find('.button').toggleClass('checkbox_true_full');
                        }
                        if (newSaveVal.length > 0) {
                            for (var i = 0; i < newSaveVal.length; i++) {
                                if (newSaveVal[i].userId == userId || newSaveVal[i].userId == userId) {
                                    repInx = i;
                                };
                            };
                        };
                        if (repInx) {
                            newSaveVal.splice(repInx, 1);
                        } else {
                            if (repInx == 0) {
                                newSaveVal.splice(repInx, 1);
                            } else {
                                newSaveVal.push({
                                    orgId: orgId,
                                    userName: userName,
                                    title: title,
                                    index: index,
                                    userId: userId,
                                    orgName: orgName
                                });
                            };
                        };
                        //排序
                        function sortSaveVal(data, prop) {
                            function compareSaveVal(obj1, obj2) {
                                var time1 = obj1[prop],
                                    time2 = obj2[prop];
                                if (time1 < time2) {
                                    return -1;
                                } else if (time1 > time2) {
                                    return 1;
                                } else {
                                    return 0;
                                }
                            }
                            return data.sort(compareSaveVal);
                        }
                        newSaveVal = sortSaveVal(newSaveVal, 'index');
                        $('#receive_member_list_view').data({
                            'cameraList': newSaveVal
                        });
                        var liHtml = '';
                        if (newSaveVal && newSaveVal.length > 0) {
                            newSaveVal.forEach(function (item) {
                                var liLoginName = item.userId;
                                var liNiName = item.userName;
                                liHtml += '<li title=' + item.title + ' data-name=' + liNiName + ' data-id=' + item.orgId + ' userId=' + liLoginName + ' class="ww_menuDialog_DualCols_colRight_cnt_item token-input-token js_list_item">' +
                                    '<span class="ww_commonImg icon icon_folder_blue"></span>' +
                                    '<span class="ww_treeMenu_item_text" title=' + item.title + '>' + liNiName + '</span>' +
                                    '<a href="javascript:" class="ww_menuDialog_DualCols_colRight_cnt_item_delete"><span class="ww_commonImg ww_commonImg_DeleteItem js_delete"></span></a>' +
                                    '</li>';
                            });
                            $('#saveNode').html(liHtml);
                            $('#js-camera-totle').text(newSaveVal.length);
                        } else {
                            $('#saveNode').empty();
                            $('#js-camera-totle').text('0');
                            $('.multiPickerDlg_right_no_result').show();
                        }
                    }
                    $('#receive_member_list_view').on('click', 'li', function () {
                        var $this = $(this);
                        memberListClick($this);
                    });
                    $('#search_member_list').on('click', 'li', function () {
                        var $this = $(this);
                        memberListClick($this);
                    });
                    searchSuccessFunc = function (data) {
                        if (data.code === '200') {
                            var list = data.data.list;
                            if (list.length > 0) {
                                var li = "";
                                for (var i = 0; i < list.length; i++) {
                                    var receiveList = $('#receive_member_list_view').data('cameraList'),
                                        active = '';
                                    if (receiveList && receiveList.length > 0) {
                                        receiveList.forEach(function (item) {
                                            if (item.userId == list[i].userId || item.userId == list[i].userId) {
                                                active = 'checkbox_true_full';
                                            }
                                        });
                                    }
                                    li += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk ${active}" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`;
                                };
                                $('.search_member_none').hide();
                                $('#search_member_list').show();
                                $('#search_member_list').addClass('ztree').html(li);
                            } else {
                                $('.search_member_none').show();
                                $('#search_member_list').hide();
                            }
                            //$('#searchResult').show();
                            // 滚动加载数据
                            $('#searchResult').on('mousewheel', function () {
                                //tab内容列表滚动到底部进行下一分页的懒加载事件
                                if ($('#memberSearchInput').val() == data.name) {
                                    var $this = $(this),
                                        $currentContainer = $('#search_member_list'),
                                        viewHeight = $this.height(), //视口可见高度
                                        contentHeight = $currentContainer[0].scrollHeight, //内容高度
                                        scrollHeight = $this.scrollTop(), // 已经滚动了的高度
                                        currentCardItemNum = $currentContainer.find("li").length,
                                        totalCardItemNUM = parseInt(data.data.total);
                                    if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM) {
                                        var successFn = function (data) {
                                            if (data.code === '200') {
                                                searchPage = (parseInt(searchPage) + 1).toString(10);
                                                var list = data.data.list;
                                                var li = "";
                                                for (var i = 0; i < list.length; i++) {
                                                    var receiveList = $('#receive_member_list_view').data('cameraList'),
                                                        active = '';
                                                    if (receiveList && receiveList.length > 0) {
                                                        receiveList.forEach(function (item) {
                                                            if (item.userId == list[i].userId || item.userId == list[i].userId) {
                                                                active = 'checkbox_true_full';
                                                            }
                                                        });
                                                    }
                                                    li += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk ${active}" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`;
                                                };
                                                $('#search_member_list').addClass('ztree').append(li);
                                            }
                                        }
                                        if (searchPage < (parseInt(data.data.totalPage) + 1)) {
                                            loadData(receivePort, true, {
                                                name: $('#memberSearchInput').val(),
                                                ajaxFilter: $('#memberSearchInput').val(),
                                                page: searchPage
                                            }, successFn);
                                        }
                                    }
                                }
                            });
                        }
                    }
                    $('#clearMemberSearchInput').on('click', function () {
                        $('#receiveResultView').show();
                    })
                    //布控人员检索
                    $('#memberSearchInput').off().on('keydown', function (event) {
                        event.stopPropagation();
                    }).on('keyup', function (event) {
                        var value = $(this).val();
                        // if(value !== '' || null){
                        if (value !== '' && value !== null) {
                            $('#receiveResultView').hide();
                            $('#searchResult').show();
                            searchPage = 2;
                            loadData(receivePort, true, {
                                name: value,
                                ajaxFilter: value
                            }, searchSuccessFunc);
                        } else {
                            $('#receiveResultView').show();
                            $('#searchResult').hide();
                        }
                    });
                    // 滚动加载数据
                    $('#receiveResultView').on('mousewheel', function () {
                        //tab内容列表滚动到底部进行下一分页的懒加载事件
                        var $this = $(this),
                            $currentContainer = $('#receive_member_list_view'),
                            viewHeight = $this.height(), //视口可见高度
                            contentHeight = $currentContainer[0].scrollHeight, //内容高度
                            scrollHeight = $this.scrollTop(), // 已经滚动了的高度
                            currentCardItemNum = $currentContainer.find("li").length,
                            totalCardItemNUM = parseInt(data.data.total);
                        if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM) {
                            controlOpt.page = (Number(controlOpt.page) + 1).toString(10);
                            var successFn = function (data) {
                                if (data.code === '200') {
                                    $('#loadLi').remove();
                                    var liList = '';
                                    var list = data.data.list;
                                    for (var i = 0; i < list.length; i++) {
                                        liList += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`
                                    };
                                    $('#receive_member_list_view').append(liList);
                                    var userSaveVal = $('#libUserChose').data('saveVal');
                                    if ($('#receive_member_list_view').data('cameraList') && $('#receive_member_list_view').data('cameraList').length > 0 && userSaveVal) {
                                        userSaveVal.forEach(function (item) {
                                            //左侧选中
                                            $('#receive_member_list_view').find('li[userId="' + (item.userId ? item.userId : item.userId) + '"] .button').addClass('checkbox_true_full');
                                            item.index = $('li[userId="' + (item.userId ? item.userId : item.userId) + '"]').index();
                                        });
                                    }
                                }
                            }
                            loadData(receivePort, true, controlOpt, successFn);
                            if ($('#loadLi').length == 0) {
                                var loadLi = '<div id="loadLi" style="margin-top:15px"></div>';
                                $('#receive_member_list_view').after(loadLi);
                                showLoading($('#loadLi'));
                            }
                        }
                    });
                } else {
                    $('.multiPickerDlg_search_wrapper').append('<div class="search_member_none">未选择通知范围</div>');
                }
            }
            hideLoading($('.layui-layer-content'));
        };
        loadData(receivePort, true, controlOpt, receiveSuccessFunc);
    });

    // 按人新增按钮 点击生成弹框事件
    $('#addBtnFusionLib').on('click', function () {
        $("#serviceShareEditModalLib").data("type", 1);
        commonLibAddModel();
    });

    // 按人搜索按钮 点击事件
    $('#searchButFusionLib').on('click', function () {
        serviceDataInit.objName = $("#userNameLib").val();
        serviceDataInit.objId = $("#userIdLib").val();
        serviceDataInit.objType = '2';
        initServiceFusionImgLib($('#serviceFusionImgTableLib'), $('#serviceFusionImgTablePaginationLib'), true);
    })

    //按人导出按钮点击事件
    $("#importLib").on('click', function () {
        var portData = {
            'objId': serviceDataInit.objId,
            'objName': serviceDataInit.objName,
            'size': $('#serviceFusionImgTableLib').data("total") ? $('#serviceFusionImgTableLib').data("total") : null,
            'page': '1',
            'type': '1',
            'objType': '2'
        }
        importLoad(portData, '1');
    });

    // 按人批量删除按钮 点击事件
    $('#deleteBtnFusionLib').on('click', function () {
        if (!$('#deleteBtnFusionLib').hasClass('disabled')) {
            $('#serviceShareTipModalLib').data("type", 1);
            $('#serviceShareTipModalLib').modal('show');
        }
    });

    // 按人列表全选按钮 点击事件
    $("#serviceFusionImgTableLib").on("click", ".table-checkbox-all-serviceFusion-lib", function () {
        commonLibTableAllChose($(this), $("#serviceFusionImgTableLib"), $('#deleteBtnFusionLib'), selectedFusionDataLib);
    }).on('click', '.table-checkbox-row-serviceFusion-lib', function () {// 按人多选框点击事件
        commonLibTableInputChose($(this), $("#serviceFusionImgTableLib"), $('#deleteBtnFusionLib'), selectedFusionDataLib);
    }).on('click', 'td .aui-icon-file', function () {  // 按人列表 查看点击事件
        $('#serviceShareEditModalLib').data('type', 1);
        commonLibTableView($(this));
    }).on('click', 'td .aui-icon-edit', function () {  // 按人列表 编辑点击事件
        $('#serviceShareEditModalLib').data('type', 1);
        commonLibTableEdit($(this));
    }).on('click', 'td .aui-icon-delete-line', function () {   // 按人列表 删除点击事件
        $('#serviceShareTipModalLib').find('.text-lg').html('是否删除?');
        $('#serviceShareTipModalLib').modal('show');
        var rowData = $(this).closest("tr").data("listData");
        $('#serviceShareTipModalLib').data('type', 1);
        $('#serviceShareTipModalLib').data('selectData', [rowData.objId]);
    }).on('click', 'td .aui-icon-import', function () {     // 按人列表 导出点击事件
        var portData = {
            'objId': $(this).parents("tr").attr("keyId"),
            'objName': $(this).parents("tr").data("listData").objName,
            'type': '2',
            'objType': '2'
        }
        importLoad(portData, '2');
    });
    /***************************************************************按库******************************************************************************** */
    /** 权限列表2
     * @param {*} $table // table目标容器
     * @param {*} $pagination  // 分页目标容器
     */
    function initServiceFusionImgLibTwo($table, $pagination, first) {
        showLoading($table);
        var $tbody = $table.find('tbody');
        // 初始化
        if (first) {
            $tbody.html('<tr><td colspan="5" class="text-center">No matching records found</td></tr>');
            $pagination.html(''); // 清空分页
            serviceDataInitTwo.page = 1;
            serviceDataInitTwo.size = 10;
        }
        var port = 'v3/lib/libRightsByLib',
            successFunc = function (data) {
                hideLoading($table);
                $tbody.empty();
                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });
                    if (result && result.length > 0) {
                        var html = '';
                        for (var i = 0; i < result.length; i++) {
                            html += `<tr data-index="${i}" class="" keyid="${result[i].libId}">
                                        <td></td>
                                        <td>${result[i].libName || '--'}</td>
                                        <td>${result[i].libId || '--'}</td>
                                        <td>${result[i].updatetime || '--'}</td>
                                        <td>
                                            <i class="icon aui-icon-file aui-mr-sm" title="查看"></i>
                                            <i class="icon aui-icon-edit aui-mr-sm" title="编辑"></i>
                                            <i class="icon aui-icon-import aui-mr-sm" title="导出"></i>
                                        </td>
                                    </tr>`
                        }
                        // 给列表新增行数据
                        $tbody.html(html);
                        $tbody.find("tr").each(function (index, el) {
                            $(el).data('listData', result[index]);
                        });
                        if (data.data.total > Number(serviceDataInitTwo.size) && first) {
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
                                serviceDataInitTwo.page = currPage;
                                serviceDataInitTwo.size = pageSize;
                                initServiceFusionImgLibTwo($table, '', false);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        if (result.length === 0) {
                            $tbody.html('<tr><td colspan="5" class="text-center">No matching records found</td></tr>');
                            $('.fixed-table-loading').hide();
                        }
                    }
                } else {
                    $tbody.html('<tr><td colspan="5" class="text-center">No matching records found</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, serviceDataInitTwo, successFunc);
    };

    /** 按库列表查看
     * @param {*} $LibModalTwo // table目标容器
     * @param {*} $LibModalTwoPagination  // 分页目标容器
     * @param {*} first  // 是否第一个加载
     * @param {*} libId  // 当前列的库id
     * @param {*} page  // 页数
     * @param {*} size  // 每页条数
     */
    function getTableLibTwoModal($LibModalTwo, $LibModalTwoPagination, first, libId, page, size) {
        var port = 'v3/lib/libRightsDetailsByLib',
            serviceAddData = {
                libId: libId,
                page: page ? page : '1',
                size: size ? size : '10'
            };
        var portDataSuccessFunc = function (data) {
            if (data.code === '200') {
                $('#serviceShareEditModalLibTwo').find('.modal-title').text('查看');
                $('#serviceShareEditModalLibTwo').find(".modal-footer").addClass("hide");
                $('#serviceShareEditModalLibTwo').modal('show');
                var $tbody = $LibModalTwo.find("tbody");
                if (first) {
                    $tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
                    $LibModalTwoPagination.html(''); // 清空分页
                }

                var html = '',
                    result = data.data.list;
                for (var i = 0; i < result.length; i++) {
                    if (result[i].isSee && result[i].isEdit && result[i].is1vn && (result[i].type == 2 ? result[i].isBk : !result[i].isBk)) {
                        var htmlOpt = '取消全选';
                    } else {
                        var htmlOpt = '全选';
                    }
                    html += `<tr data-index="${i}" class="" keyid="${result[i].objId}">
                                    <td>${result[i].objType == '2' ? '按人' : '按角色'}</td>
                                    <td title="${result[i].objName || '--'}">${result[i].objName || '--'}</td>
                                    <td title="${result[i].orgName || '--'}">${result[i].orgName || '--'}</td>
                                    <td>
                                        <div class="table-checkbox">
                                            <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList" ${result[i].isSee ? 'checked' : ''} disabled>
                                            <span class="table-checkbox-label"></span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="table-checkbox">
                                            <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList" ${result[i].isEdit ? 'checked' : ''} disabled>
                                            <span class="table-checkbox-label"></span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="table-checkbox">
                                            <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList" ${result[i].is1vn ? 'checked' : ''} disabled>
                                            <span class="table-checkbox-label"></span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="table-checkbox ${result[i].type != '2' ? 'disabled' : ''}">
                                            <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList" ${result[i].isBk ? 'checked' : ''} disabled>
                                            <span class="table-checkbox-label"></span>
                                        </div>
                                    </td>
                                    <td>
                                        <a class='operate-row operate-row-search disabled' style="color:#7b8084">${htmlOpt}</a>
                                    </td>
                                </tr>`
                }
                // 给列表新增行数据
                $LibModalTwo.find('tbody').html(html);
                if (data.data.total > Number(serviceAddData.size) && first) {
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
                        getTableLibTwoModal($LibModalTwo, $LibModalTwoPagination, false, libId, currPage, pageSize);
                    };
                    setPageParams($LibModalTwoPagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                }

                for (let j = 0; j < $("#LibModalTwo").find('thead input').length; j++) {
                    let index = $("#LibModalTwo").find('thead input').eq(j).parents("th").index();
                    $("#LibModalTwo").find('thead input').eq(j).prop("checked", "checked");
                    for (let k = 0; k < $("#LibModalTwo").find('tbody tr').length; k++) {
                        if (!$("#LibModalTwo").find('tbody tr').eq(k).find("td").eq(index).find("input").is(":checked")) {
                            $("#LibModalTwo").find('thead input').eq(j).removeAttr("checked");
                            break;
                        }
                    }
                }
            }
        };

        loadData(port, true, serviceAddData, portDataSuccessFunc);
    };

    /** 按库列表编辑
     * @param {*} $LibModalTwo // table目标容器
     * @param {*} $LibModalTwoPagination  // 分页目标容器
     * @param {*} first  // 是否第一个加载
     * @param {*} libId  // 当前列的库id
     * @param {*} page  // 页数
     * @param {*} size  // 每页条数
     */
    function getTableLibTwoModalEdit($LibModalTwo, $LibModalTwoPagination, first, libId, page, size) {
        var port = 'v3/lib/libRightsDetailsByLib',
            serviceAddData = {
                libId: libId,
                page: page ? page : '1',
                size: size ? size : '10'
            };
        var portDataSuccessFunc = function (data) {
            if (data.code === '200') {
                $('#serviceShareEditModalLibTwo').find(".modal-footer").removeClass("hide");
                $('#serviceShareEditModalLibTwo').modal('show');
                var $tbody = $LibModalTwo.find("tbody");
                if (first) {
                    $tbody.html('<tr><td colspan="7" class="text-center">No matching records found</td></tr>');
                    $LibModalTwoPagination.html(''); // 清空分页
                }

                var html = '',
                    result = data.data.list;
                for (var i = 0; i < result.length; i++) {
                    if (result[i].isSee && result[i].isEdit && result[i].is1vn && (result[i].type == 2 ? result[i].isBk : !result[i].isBk)) {
                        var htmlOpt = '取消全选';
                    } else {
                        var htmlOpt = '全选';
                    }
                    html += `<tr data-index="${i}" class="" keyid="${result[i].objId}" id="${result[i].id}">
                                    <td>${result[i].objType == '2' ? '按人' : '按角色'}</td>
                                    <td title="${result[i].objName || '--'}">${result[i].objName || '--'}</td>
                                    <td title="${result[i].orgName || '--'}">${result[i].orgName || '--'}</td>
                                    <td>
                                        <div class="table-checkbox">
                                            <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList" ${result[i].isSee ? 'checked' : ''}>
                                            <span class="table-checkbox-label"></span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="table-checkbox">
                                            <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList" ${result[i].isEdit ? 'checked' : ''}>
                                            <span class="table-checkbox-label"></span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="table-checkbox">
                                            <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList" ${result[i].is1vn ? 'checked' : ''}>
                                            <span class="table-checkbox-label"></span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="table-checkbox ${result[i].type != '2' ? 'disabled' : ''}">
                                            <input data-index="0" type="checkbox" value="0" class="table-checkbox-input LibModalList" ${result[i].isBk ? 'checked' : ''} ${result[i].type != '2' ? 'disabled' : ''}>
                                            <span class="table-checkbox-label"></span>
                                        </div>
                                    </td>
                                    <td>
                                        <a class='operate-row operate-row-search'>${htmlOpt}</a>
                                    </td>
                                </tr>`
                }
                // 给列表新增行数据
                $LibModalTwo.find('tbody').html(html);
                $('#serviceShareEditModalLibTwo').data("id", result[0].id);
                if (data.data.total > Number(serviceAddData.size) && first) {
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
                        getTableLibTwoModalEdit($LibModalTwo, $LibModalTwoPagination, false, libId, currPage, pageSize);
                    };
                    setPageParams($LibModalTwoPagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                }

                if (result[0].type != '2') {
                    $("#LibModalTwo").find("thead th").eq(5).find("input").attr("disabled", "disabeld");
                }
                for (let j = 0; j < $("#LibModalTwo").find('thead input').length; j++) {
                    let index = $("#LibModalTwo").find('thead input').eq(j).parents("th").index();
                    $("#LibModalTwo").find('thead input').eq(j).prop("checked", "checked");
                    for (let k = 0; k < $("#LibModalTwo").find('tbody tr').length; k++) {
                        if (!$("#LibModalTwo").find('tbody tr').eq(k).find("td").eq(index).find("input").is(":checked")) {
                            $("#LibModalTwo").find('thead input').eq(j).removeAttr("checked");
                            break;
                        }
                    }
                }
            }
        };

        loadData(port, true, serviceAddData, portDataSuccessFunc);
    };

    // 按库列表 查看点击事件
    $('#serviceFusionImgTableLibTwo').on('click', 'td .aui-icon-file', function () {
        var rowData = $(this).closest("tr").data("listData");
        $("#libUserChoseTwo").val(rowData.libName).attr("title", rowData.libName);
        $('#serviceShareEditModalLibTwo').find('.modal-title').html('查看');
        $("#LibModalTwo").find("thead input").attr("disabled", "disabled");
        getTableLibTwoModal($("#LibModalTwo"), $("#LibModalTwoPagination"), true, rowData.libId);
    }).on('click', 'td .aui-icon-edit', function () {// 按库列表 编辑点击事件
        var rowData = $(this).closest("tr").data("listData");
        var $serviceShareModal = $('#serviceShareEditModalLibTwo');
        $serviceShareModal.data("libId", rowData.libId);
        $serviceShareModal.find('.modal-title').html('编辑');
        $("#libUserChoseTwo").val(rowData.libName).attr("title", rowData.libName);
        $("#libUserChoseTwo").addClass("disabled");
        $("#LibModalTwo").find("thead input").removeAttr("disabled");
        $("#LibModalTwo thead").find(".libModalCheck").removeAttr("checked");

        getTableLibTwoModalEdit($("#LibModalTwo"), $("#LibModalTwoPagination"), true, rowData.libId);
    }).on('click', 'td .aui-icon-import', function () { // 按库列表 导出点击事件
        var portData = {
            'libId': $(this).parents("tr").attr("keyId"),
            'type': '3'
        }
        importLoad(portData, '3');
    });

    //人员库列表每列选择
    $("#LibModalTwo").on("click", ".LibModalList", function () {
        var index = $(this).parents("td").index();
        $("#LibModalTwo").find("thead th").eq(index).find("input").prop("checked", "checked");
        $(this).parents("tr").find("td").eq(-1).find(".operate-row-search").html("取消全选");

        for (var i = 0; i < $("#LibModalTwo").find("tbody tr").length; i++) {
            if (!$("#LibModalTwo").find("tbody tr").eq(i).find("td").eq(index).find("input").attr("disabled") && !$("#LibModalTwo").find("tbody tr").eq(i).find("td").eq(index).find("input").not(":disabled").is(":checked")) {
                $("#LibModalTwo").find("thead th").eq(index).find("input").removeAttr("checked");
            }
        }

        for (var j = 0; j < $(this).parents("tr").find("input").not(":disabled").length; j++) {
            if (!$(this).parents("tr").find("input").not(":disabled").eq(j).is(":checked")) {
                $(this).parents("tr").find("td").eq(-1).find(".operate-row-search").html("全选");
                return;
            }
        }
    }).on("click", ".operate-row-search", function () {//人员库列表每列全选选择按库
        if ($(this).hasClass("disabled")) {
            return;
        }
        if ($(this).html() == '全选') {
            for (let i = 0; i < $(this).parents("tr").find("input").not(":disabled").length; i++) {
                if (!$(this).parents("tr").find("input").not(":disabled").eq(i).is(":checked")) {
                    $(this).parents("tr").find("input").not(":disabled").eq(i).prop("checked", "checked");
                    let index = $(this).parents("tr").find("input").not(":disabled").eq(i).parents("td").index();
                    $("#LibModalTwo").find("thead th").eq(index).find("input").prop("checked", "checked");
                    for (let j = 0; j < $("#LibModalTwo").find("tbody tr").length; j++) {
                        if (!$("#LibModalTwo").find("tbody tr").eq(j).find("td").eq(index).find("input").attr("disabled") && !$("#LibModalTwo").find("tbody tr").eq(j).find("td").eq(index).find("input").not(":disabled").is(":checked")) {
                            $("#LibModalTwo").find("thead th").eq(index).find("input").removeAttr("checked");
                        }
                    }
                }
            }
            $(this).html("取消全选");
        } else {
            for (let i = 0; i < $(this).parents("tr").find("input").not(":disabled").length; i++) {
                if ($(this).parents("tr").find("input").not(":disabled").eq(i).is(":checked")) {
                    $(this).parents("tr").find("input").not(":disabled").eq(i).removeAttr("checked");
                    let index = $(this).parents("tr").find("input").not(":disabled").eq(i).parents("td").index();
                    $("#LibModalTwo").find("thead th").eq(index).find("input").removeAttr("checked");
                }
            }
            $(this).parents("tr").find("input").removeAttr("checked");
            $(this).html("全选");
        }
    }).on("click", ".libModalCheck", function () {//人员库列表thead全选选择
        var index = $(this).parents("th").index();
        for (var i = 0; i < $("#LibModalTwo").find("tbody tr").length; i++) {
            if ($(this).is(":checked")) {
                $("#LibModalTwo").find("tbody tr").eq(i).find("td").eq(index).find("input").prop("checked", "checked");
            } else {
                $("#LibModalTwo").find("tbody tr").eq(i).find("td").eq(index).find("input").removeAttr("checked");
            }
            $("#LibModalTwo").find("tbody tr").eq(i).find("td").eq(-1).find(".operate-row-search").html("取消全选");
            for (let j = 0; j < $("#LibModalTwo").find("tbody tr").eq(i).find("input").not(":disabled").length; j++) {
                if (!$("#LibModalTwo").find("tbody tr").eq(i).find("input").not(":disabled").eq(j).is(":checked")) {
                    $("#LibModalTwo").find("tbody tr").eq(i).find("td").eq(-1).find(".operate-row-search").html("全选");
                }
            }
        }
    });

    // 编辑按库 确认按钮点击事件
    $('#serviceShareOkButLibTwo').on('click', function () {
        var libId = $('#serviceShareEditModalLibTwo').data("libId"),
            objs = [];
        for (let i = 0; i < $("#LibModalTwo").find("tbody tr").length; i++) {
            let libsItem = {};
            libsItem.id = $("#LibModalTwo").find("tbody tr").eq(i).attr("id");
            libsItem.objId = $("#LibModalTwo").find("tbody tr").eq(i).attr("keyid");
            libsItem.isEdit = $("#LibModalTwo").find("tbody tr").eq(i).find("input").eq(1).is(":checked") ? 1 : 0;
            libsItem.isSee = $("#LibModalTwo").find("tbody tr").eq(i).find("input").eq(0).is(":checked") ? 1 : 0;
            libsItem.isBk = $("#LibModalTwo").find("tbody tr").eq(i).find("input").eq(3).is(":checked") ? 1 : 0;
            libsItem.is1vn = $("#LibModalTwo").find("tbody tr").eq(i).find("input").eq(2).is(":checked") ? 1 : 0;
            objs.push(libsItem);
        }
        let serviceAddData = {
            objs,
            libId
        };

        var port = 'v3/lib/editLibRightsByLib';
        var portDataSuccessFunc = function (data) {
            if (data.code === '200') {
                $('#serviceShareEditModalLibTwo').modal("hide");
                initServiceFusionImgLibTwo($('#serviceFusionImgTableLibTwo'), $('#serviceFusionImgTablePaginationLibTwo'), true);
            } else {
                warningTip.say(data.message);
            }
        };
        loadData(port, true, serviceAddData, portDataSuccessFunc);
    });

    // 搜索按钮 点击事件
    $('#searchButFusionLibTwo').on('click', function () {
        serviceDataInitTwo.libName = $("#libManageName").val();
        serviceDataInitTwo.libId = $("#libManageId").val();
        initServiceFusionImgLibTwo($('#serviceFusionImgTableLibTwo'), $('#serviceFusionImgTablePaginationLibTwo'), true);
    })
    /***************************************************************按角色******************************************************************************** */
    /** 按角色列表
     * @param {*} $table // table目标容器
     * @param {*} $pagination  // 分页目标容器
     */
    function initServiceFusionImgLibThree($table, $pagination, first) {
        showLoading($table);
        var $tbody = $table.find('tbody'),
            $headItem = $table.find("thead .table-checkbox-all-serviceFusion");

        $headItem.removeAttr("checked"); // 取消全选状态
        selectedFusionDataLibThree = []; // 批量删除数据清除
        $('#serviceShareTipModalLib').data('selectData', selectedFusionDataLibThree);
        $('#deleteBtnFusionLibThree').addClass('disabled');
        $("#serviceFusionImgTableLibThree").find(".table-checkbox-all-serviceFusion-lib").removeAttr("checked");
        if (first) {
            $tbody.html('<tr><td colspan="5" class="text-center">No matching records found</td></tr>');
            $pagination.html(''); // 清空分页
            serviceDataInitThree.page = 1;
            serviceDataInitThree.size = 10;
        }

        var port = 'v3/lib/libRightsByPerson',
            successFunc = function (data) {
                hideLoading($table);
                $tbody.empty();
                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });
                    $table.data({
                        'total': data.data.total
                    });
                    if (result && result.length > 0) {
                        var html = '';
                        for (var i = 0; i < result.length; i++) {
                            html += `<tr data-index="${i}" class="" keyid="${result[i].objId}">
                                        <td class="bs-checkbox ">
                                            <div class="table-checkbox">
                                                <input data-index="0" name="btSelectItemLib" type="checkbox" value="0" class="table-checkbox-input table-checkbox-row-serviceFusion-lib">
                                                <span class="table-checkbox-label"></span>
                                            </div>
                                        </td>
                                        <td>${result[i].objName || '--'}</td>
                                        <td>${result[i].objId || '--'}</td>
                                        <td>${result[i].updatetime || '--'}</td>
                                        <td>
                                            <i class="icon aui-icon-file aui-mr-sm" title="查看"></i>
                                            <i class="icon aui-icon-edit aui-mr-sm" title="编辑"></i>
                                            <i class="icon aui-icon-delete-line aui-mr-sm" title="删除"></i>
                                            <i class="icon aui-icon-import aui-mr-sm" title="导出"></i>
                                        </td>
                                    </tr>`
                        }
                        // 给列表新增行数据
                        $tbody.html(html);
                        $tbody.find("tr").each(function (index, el) {
                            $(el).data('listData', result[index]);
                        });
                        if (data.data.total > Number(serviceDataInitThree.size) && first) {
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
                                serviceDataInitThree.page = currPage;
                                serviceDataInitThree.size = pageSize;
                                initServiceFusionImgLibThree($table, '', false);
                                $("#serviceFusionImgTableLibThree").find(".table-checkbox-all-serviceFusion-lib").removeAttr("checked");
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        if (result.length === 0) {
                            $tbody.html('<tr><td colspan="5" class="text-center">No matching records found</td></tr>');
                            $('.fixed-table-loading').hide();
                        }
                    }
                } else {
                    $tbody.html('<tr><td colspan="5" class="text-center">No matching records found</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, serviceDataInitThree, successFunc);
    };

    //按角色列表新增按钮点击事件
    $("#addBtnFusionLibThree").on("click", function () {
        $("#serviceShareEditModalLib").data("type", 2);
        commonLibAddModel();
    });

    // 按角色搜索按钮点击事件
    $('#searchButFusionLibThree').on('click', function () {
        serviceDataInitThree.objName = $("#roleOneName").val();
        serviceDataInitThree.objType = '3';
        initServiceFusionImgLibThree($('#serviceFusionImgTableLibThree'), $('#serviceFusionImgTablePaginationLibThree'), true);
    });

    //按角色导出按钮点击事件
    $("#importLibThree").on('click', function () {
        var portData = {
            'objId': serviceDataInitThree.objId,
            'objName': serviceDataInitThree.objName,
            'size': $('#serviceFusionImgTableLibThree').data("total") ? $('#serviceFusionImgTableLibThree').data("total") : null,
            'page': '1',
            'type': '4',
            'objType': '3'
        }
        importLoad(portData, '4');
    });

    // 按角色批量删除按钮 点击事件
    $('#deleteBtnFusionLibThree').on('click', function () {
        if (!$('#deleteBtnFusionLibThree').hasClass('disabled')) {
            $('#serviceShareTipModalLib').data("type", 2);
            $('#serviceShareTipModalLib').modal('show');
        }
    });

    // 按角色列表全选按钮 点击事件
    $("#serviceFusionImgTableLibThree").on("click", ".table-checkbox-all-serviceFusion-lib", function () {
        commonLibTableAllChose($(this), $("#serviceFusionImgTableLibThree"), $('#deleteBtnFusionLibThree'), selectedFusionDataLibThree);
    }).on('click', '.table-checkbox-row-serviceFusion-lib', function () {// 按角色多选框点击事件
        commonLibTableInputChose($(this), $("#serviceFusionImgTableLibThree"), $('#deleteBtnFusionLibThree'), selectedFusionDataLibThree);
    }).on('click', 'td .aui-icon-file', function () {  // 按角色列表 查看点击事件
        $('#serviceShareEditModalLib').data('type', 2);
        commonLibTableView($(this));
    }).on('click', 'td .aui-icon-edit', function () {  // 按角色列表 编辑点击事件
        $('#serviceShareEditModalLib').data('type', 2);
        commonLibTableEdit($(this));
    }).on('click', 'td .aui-icon-delete-line', function () {   // 按角色列表 删除点击事件
        $('#serviceShareTipModalLib').find('.text-lg').html('是否删除?');
        $('#serviceShareTipModalLib').modal('show');
        var rowData = $(this).closest("tr").data("listData");
        $('#serviceShareTipModalLib').data('type', 2);
        $('#serviceShareTipModalLib').data('selectData', [rowData.objId]);
    }).on('click', 'td .aui-icon-import', function () {     // 按角色列表 导出点击事件
        var portData = {
            'objId': $(this).parents("tr").attr("keyId"),
            'objName': $(this).parents("tr").data("listData").objName,
            'type': '5',
            'objType': '3'
        }
        importLoad(portData, '5');
    });
})(window, window.jQuery)