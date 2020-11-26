(function (window, $) {
    var bayonetActive = '', // 当前被激活的卡口id
        selectedCameralCounts = 0, // 被选中的镜头数量
        deleteFlag = '', // 设置删除标志 区分卡口删除和镜头删除（批量）
        allDeleteCameralId = [], // 批量删除的镜头id数组
        allDeleteCameralChannel = [], // 批量删除的镜头channel数组
        _scrollPage = 2, // 第一次滚动加载 第二页
        searchCameraltVal = {}, // 搜索镜头列表的数据
        totalBayonet = 0, // 卡口的总数
        totalPageBayonet = 0, // 卡口的总页数
        _isQuickAdd = false; // 单行删除标志

    $('[data-role="radio"]').checkboxradio();
    $('[data-role="radio-button"]').checkboxradio({
        icon: false
    });

    // 卡口管理 新建卡口/快速新建 树结构
    $(document).ready(function () {
        $('#addBayonetBtn').orgTree({
            all: true, // 人物组织都开启
            area: ['960px', '718px'], // 弹窗框宽高
            search: true, // 开启搜索
            cls: 'camera-list',
            newBayonet: true,
            noMap: true,
            ajaxFilter: 'bayonet_orgList',
            node: 'bayonet_orgList',
            contain: "1" // 树结构中包含警种
        });
        $('#addBayonetBtnQuick').orgTree({
            all: true, // 人物组织都开启
            area: ['960px', '718px'], // 弹窗框宽高
            search: true, // 开启搜索
            cls: 'camera-list',
            newBayonet: true,
            newBayonetQuick: true,
            noMap: true,
            ajaxFilter: 'bayonet_orgList',
            node: 'bayonet_orgList',
            contain: "1" // 树结构中包含警种
        });
    })

    // 初始化table 卡口列表
    window.initBayonetList = function (page, number, param) {
        var port = 'bayonetManage/getBayonetList',
            portData = {
                "page": page ? page : 1,
                "number": number ? number : 30,
                "param": param ? param : {},
                "groupname": $('#bayonet_name').val() ? $('#bayonet_name').val() : ''
            };
        successFunc = function (data) {
            if (data.code === '000') {
                var result = data.result.list;
                totalBayonet = data.result.total;
                totalPageBayonet = data.result.totalPage;
                _scrollPage = 2;
                if (!result || result.length === 0) {
                    loadEmpty($('#bayonetList'), '当前暂无卡口信息', '', true, false);
                    bayonetActive = '';
                    initTableList($('#tableBayonetList'), $('#tableBayonetListPagination'), true);
                    return;
                }
                if (result && result.length > 0) {
                    var $html = '';
                    for (var i = 0; i < result.length; i++) {
                        $html += `
                                <li class="bayonet-card-item" bayonetid=${result[i].id} bayonetGroupid=${result[i].groupid}>
                                    <div>
                                        <label class="ui-checkboxradio-checkbox-label ui-checkboxradio-label ui-button ui-widget ui-left-checkbox">
                                            <span class="ui-checkboxradio-icon  ui-icon ui-icon-background ui-icon-blank"></span>
                                        </label>
                                        <div class="bayonet-name" title="${result[i].groupname || '--'}">${result[i].groupname || '--'}</div>
                                    </div>
                                    <div class="bayonet-card-item-descript">
                                        <span class="create-people">创建人：${result[i].createuser || '--'}</span>
                                        <span class="create-time">创建时间：${result[i].createtime || '--'}</span>
                                    </div>
                                </li>
                                `
                    }
                    if ($('#bayonetList').find('.flex-column-wrap').length) {
                        removeEmpty($('#bayonetList').find('.flex-column-wrap'));
                    }
                    $leftList = `<ul class="bayonet-card-list"></ul>`
                    $('#bayonetManage').find('.bayonet-left-list').empty().append($leftList)
                    $('#bayonetManage').find('.bayonet-left-list ul').empty().html($html);
                    bayonetActive = result[0].id; // 激活第一个卡口
                    $('#bayonetManage').find('.bayonet-left-list .bayonet-card-item').eq(0).addClass('active');
                    initTableList($('#tableBayonetList'), $('#tableBayonetListPagination'), true);
                }
            }
        };
        loadData(port, true, portData, successFunc);
    }
    initBayonetList();

    // 初始化table 镜头列表
    window.initTableList = function ($table, $pagination, first, page, number, param) {
        var $tbody = $table.find('tbody'),
            headItem = $('#tableBayonetList').find("thead .table-checkbox-all-bayonet");
        selectedCameralCounts = 0; // 已选项数据置为0
        createCameralCounts();
        headItem.removeAttr("checked"); // 删除全选状态
        if (first) {
            $tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'bayonetManage/getBayonetDetail',
            portData = {
                'page': page ? page : 1,
                'number': number ? number : 10,
                'param': param ? param : {},
                'bayonetid': bayonetActive,
                'cameraname': searchCameraltVal.cameralNameVal ? searchCameraltVal.cameralNameVal : '',
                'gbcode': searchCameraltVal.cameralGbcodeVal ? searchCameraltVal.cameralGbcodeVal : '',
            },
            successFunc = function (data) {
                hideLoading($table);
                if (data.code === '000') {
                    var result = data.result.list;
                    var $bayonetItem = $("#bayonetList").find(".bayonet-card-item.active");
                    $table.data({
                        'result': result
                    });
                    if (result && result.length > 0) {
                        var html = '';
                        for (var i = 0; i < result.length; i++) {
                            html += `<tr data-index="${i}" class="" keyid="${result[i].id}">
                                <td class="bs-checkbox ">
                                    <div class="table-checkbox">
                                        <input data-index="0" name="btSelectItem" type="checkbox" value="0" class="table-checkbox-input table-checkbox-row-bayonet">
                                        <span class="table-checkbox-label"></span>
                                    </div>
                                </td>
                                <td>${result[i].gbcode || '--'}</td>
                                <td>${result[i].cameraname || '--'}</td>
                                <td>${result[i].cameraname || '--'}</td>
                                <td>
                                    <a class='delete-row'>删除</a>
                                </td>
                            </tr>`
                        }
                        // 给列表添加行数据
                        $tbody.html(html);
                        if (data.result.total > Number(portData.number) && first) {
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
                                initTableList($table, '', false, currPage, pageSize)
                            };
                            setPageParams($pagination, data.result.total, data.result.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                        // 镜头数大于0时 无法快速新增
                        $bayonetItem.attr('quickadd', 'false');
                    } else {
                        $tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
                        $('.fixed-table-loading').hide();
                        // 镜头数小于1时 可以快速新增
                        $bayonetItem.attr('quickadd', 'true');
                        var $bayonetItem = $('#bayonetList ul').find('.ui-checkboxradio-checked').parent().parent();
                        // 如果是单行删除 删除之后没有镜头 选中的卡口需要判断是否可快速添加
                        if (_isQuickAdd) {
                            if ($bayonetItem.length === 1 && $bayonetItem.attr('bayonetid') === bayonetActive) {
                                $('#addBayonetBtnQuick').removeClass('disabled');
                            }
                        }
                        _isQuickAdd = false;
                    }
                } else {
                    $tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, portData, successFunc);
    }

    // 卡口管理 搜索
    $('#bayonetSearch').on("click", function () {
        initBayonetList();
    });

    // 镜头管理 搜索
    $('#bayonetCameralSearch').on("click", function () {
        var cameralNameVal = $('#cameral_name').val(),
            cameralGbcodeVal = $('#cameral_gbcode').val();
        searchCameraltVal = {
            cameralNameVal: cameralNameVal,
            cameralGbcodeVal: cameralGbcodeVal,
        };
        // initBayonetList();
        initTableList($('#tableBayonetList'), $('#tableBayonetListPagination'), true);
    });

    // 镜头列表头部 全选按钮点击事件
    $(".table-checkbox-all-bayonet").on("click", function () {
        var rowItem = $(this).parents("table").find("tbody .table-checkbox-row-bayonet");
        if ($(this).is(":checked")) {
            for (var i = 0; i < rowItem.length; i++) {
                rowItem.eq(i).prop("checked", "checked");
            }
            selectedCameralCounts = rowItem.length;
            createCameralCounts();
        } else {
            for (var i = 0; i < rowItem.length; i++) {
                rowItem.eq(i).removeAttr("checked");
            }
            selectedCameralCounts = 0;
            createCameralCounts();
        }
    });

    // 镜头列表数据 每一行选框点击事件
    $(document).on("change", ".table-checkbox-row-bayonet", function () {
        var rowItem = $(this).parents("table").find("tbody .table-checkbox-row-bayonet"),
            headItem = $(this).parents("table").find("thead .table-checkbox-all-bayonet");
        if ($(this).is(":checked")) {
            selectedCameralCounts++;
        } else {
            selectedCameralCounts--;
        }
        createCameralCounts();
        for (var i = 0; i < rowItem.length; i++) {
            if (!rowItem.eq(i).is(":checked")) {
                headItem.removeAttr("checked");
                return;
            }
        }
        headItem.prop("checked", "checked");
    });

    // 设置镜头已选项数据 提示语
    function createCameralCounts() {
        $('#bayonetManage #bayonetCameraCounts').text(selectedCameralCounts);
        // 镜头列表 批量删除是否可用
        if (selectedCameralCounts > 0) {
            $('#bayonetCameralMultiDelete').removeClass('disabled');
        } else {
            $('#bayonetCameralMultiDelete').addClass('disabled');
        }
    }

    // 卡口管理 卡片点击事件+选中卡口 或者生成右边对应的镜头列表
    $("#bayonetList").on("click", ".bayonet-card-item", function (e) {
        var $this = $(this);
        // 点击多选框
        if ($(e.target).hasClass('ui-checkboxradio-icon')) {
            var _this = $(e.target).parent();
            if (_this.hasClass('ui-checkboxradio-checked')) {
                _this.removeClass('ui-checkboxradio-checked')
            } else {
                _this.addClass('ui-checkboxradio-checked');
            }
            // 只有选中1个卡口 才能快速添加
            var _selectedBayonetData = getSelectedBayonet(),
                _selectedBayonetId = _selectedBayonetData._selectBayonetId;
            if (_selectedBayonetId.length === 1) {
                var _itemArr = $("#bayonetList").find('.bayonet-card-item'),
                    _itemQuickAdd = '';
                _itemArr.each(function (index, value) {
                    if ($(this).attr('bayonetid') === _selectedBayonetId[0]) {
                        _itemQuickAdd = $(this).attr('quickadd');
                    }
                })
                // 如果此卡口已经查找过镜头列表 并且镜头为0
                if (_itemQuickAdd === 'true') {
                    $('#addBayonetBtnQuick').removeClass('disabled');
                } else {
                    // 如果此卡口已经查找过镜头列表 并且镜头大于0
                    if (_itemQuickAdd === 'false') {
                        $('#addBayonetBtnQuick').addClass('disabled');
                    } else {
                        // 如果没有查找过镜头列表 需先查找镜头
                        getcheckedCamerasCount(_selectedBayonetId);
                    }
                }
            } else {
                $('#addBayonetBtnQuick').addClass('disabled');
            }
            // 只有选中1个卡口以上 才能批量删除
            if (_selectedBayonetData._selectBayonetId.length > 0) {
                $('#deleteBayonetBtn').removeClass('disabled');
            } else {
                $('#deleteBayonetBtn').addClass('disabled');
            }
        } else {
            $("#bayonetList .bayonet-card-item.active").removeClass("active");
            $this.addClass("active");
            bayonetActive = $this.attr("bayonetid");
            // 刷新右侧镜头列表
            initTableList($('#tableBayonetList'), $('#tableBayonetListPagination'), true);
        }
    })

    // 卡口列表 选中多选框时 查找卡口对应的镜头数 用于控制快速增加状态
    function getcheckedCamerasCount(bayonetid) {
        var port = 'bayonetManage/getBayonetDetail',
            portData = {
                'page': 1,
                'number': 10,
                'bayonetid': bayonetid[0],
                'cameraname': '',
                'gbcode': '',
            },
            successFunc = function (data) {
                if (data.code === '000') {
                    var result = data.result.list,
                        $bayonetItem = $('#bayonetList ul').find('.ui-checkboxradio-checked').parent().parent();
                    if (result && result.length === 0) {
                        // 镜头数小于1时 可以快速新增
                        $bayonetItem.attr('quickadd', 'true');
                        $('#addBayonetBtnQuick').removeClass('disabled');
                        return;
                    }
                    if (result && result.length > 0) {
                        // 镜头数大于0时 无法快速新增
                        $bayonetItem.attr('quickadd', 'false');
                        $('#addBayonetBtnQuick').addClass('disabled');
                        return;
                    }
                }
            };
        loadData(port, true, portData, successFunc);
    }

    // 卡口列表 滚动到底部 继续加载更多卡口数据
    $("#bayonetList").on('mousewheel', function () {
        var $this = $(this),
            $currentContainer = $this.find(".bayonet-card-list"),
            viewHeight = $this.height(), //视口可见高度
            contentHeight = $currentContainer[0].scrollHeight, //内容高度
            scrollHeight = $this.scrollTop(), // 已经滚动了的高度
            currentCardItemNum = $currentContainer.find(".bayonet-card-item").length,
            totalCardItemNUM = totalBayonet;
        if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM && _scrollPage < totalPageBayonet) {
            scrollBayonetList();
        }
    });

    // 卡口列表 滚动到底部 向后台请求数据
    function scrollBayonetList() {
        var port = 'bayonetManage/getBayonetList',
            portData = {
                "page": _scrollPage,
                "number": 30,
                "groupname": $('#bayonet_name').val() ? $('#bayonet_name').val() : ''
            };
        successFunc = function (data) {
            if (data.code === '000') {
                var result = data.result.list;
                totalBayonet = data.result.total;
                totalPageBayonet = data.result.totalPage;
                _scrollPage++;
                if (result && result.length > 0) {
                    var $html = '';
                    for (var i = 0; i < result.length; i++) {
                        $html += `<li class="bayonet-card-item" bayonetid=${result[i].id} bayonetGroupid=${result[i].groupid}>
                            <div>
                                <label class="ui-checkboxradio-checkbox-label ui-checkboxradio-label ui-button ui-widget ui-left-checkbox">
                                    <span class="ui-checkboxradio-icon  ui-icon ui-icon-background ui-icon-blank"></span>
                                </label>
                                <div class="bayonet-name" title="${result[i].groupname || '--'}">${result[i].groupname || '--'}</div>
                            </div>
                            <div class="bayonet-card-item-descript">
                                <span class="create-people">创建人：${result[i].createuser || '--'}</span>
                                <span class="create-time">创建时间：${result[i].createtime || '--'}</span>
                            </div>
                        </li>`
                    }
                    $('#bayonetManage').find('.bayonet-left-list ul').html($html);
                }
            }
        };
        loadData(port, true, portData, successFunc);
    }

    // 卡口数据 批量删除 点击生成弹框
    $('#deleteBayonetBtn').on('click', function () {
        if (!$(this).hasClass('disabled')) {
            $('#dispatchTipModal').modal('show');
            deleteFlag = 'bayonetDelete';
        }
    });

    // 镜头列表 批量删除 点击生成弹框
    $('#bayonetCameralMultiDelete').on('click', function () {
        $('#dispatchTipModal').modal('show');
        deleteFlag = 'bayonetCameralDelete';
    });

    // 卡口管理+镜头列表 批量删除 弹框确定按钮
    $('#dispatchModalSure').on('click', function () {
        // 卡口批量删除弹框
        if (deleteFlag === 'bayonetDelete') {
            var _selectedData = getSelectedBayonet();
            var port = 'bayonetManage/delBayonet',
                portData = {
                    ids: _selectedData._selectBayonetId ? _selectedData._selectBayonetId : [],
                    groupids: _selectedData._selectBayonetGroupId ? _selectedData._selectBayonetGroupId : [],
                },
                portDataSuccessFunc = function (data) {
                    if (data.code === '000') {
                        warningTip.say('删除成功');
                        // 删除成功之后 需要刷新 卡口管理列表 + 镜头管理列表
                        initBayonetList();
                        $('#addBayonetBtnQuick').addClass('disabled');
                    } else {
                        warningTip.say(data.msg);
                    }
                };
            loadData(port, true, portData, portDataSuccessFunc);
        }
        // 镜头批量删除弹框
        if (deleteFlag === 'bayonetCameralDelete') {
            var groupid = $("#bayonetList .bayonet-card-item.active").attr("bayonetgroupid"),
                cameralListItem = $("#tableBayonetList").find("tbody .table-checkbox-row-bayonet"),
                cameralListData = $("#tableBayonetList").data("result");
            for (var i = 0; i < cameralListItem.length; i++) {
                if ($(cameralListItem[i]).is(":checked")) {
                    for (var j = 0; j < cameralListData.length; j++) {
                        if ($(cameralListItem[i]).closest('tr').attr('keyid') === cameralListData[j].id) {
                            allDeleteCameralId.push(cameralListData[j].id);
                            allDeleteCameralChannel.push(cameralListData[j].channel)
                        }
                    }
                }
            }
            var port1 = 'bayonetManage/delBayonetCamera',
                portData1 = {
                    ids: allDeleteCameralId ? allDeleteCameralId : [],
                    channels: allDeleteCameralChannel ? allDeleteCameralChannel : [],
                    groupid: groupid ? groupid : '',
                },
                portDataSuccessFunc = function (data) {
                    if (data.code === '000') {
                        warningTip.say('删除成功');
                        // 删除成功之后 需要刷新 镜头管理列表
                        initTableList($('#tableBayonetList'), $('#tableBayonetListPagination'), true);
                        allDeleteCameralId = [];
                        allDeleteCameralChannel = [];
                    }
                };
            loadData(port1, true, portData1, portDataSuccessFunc);
        }
    });

    // 获取卡口中被选中的数据 用于卡口批量删除参数
    function getSelectedBayonet() {
        var _selectedArr = $('#bayonetList ul').find('.ui-checkboxradio-checked').parent().parent(),
            _selectBayonetId = [],
            _selectBayonetGroupId = [],
            _selectBayonetData = {};
        _selectedArr.each(function (index, value) {
            _selectBayonetId.push($(this).attr('bayonetid'));
            _selectBayonetGroupId.push($(this).attr('bayonetgroupid'));
        })
        _selectBayonetData = {
            _selectBayonetId: _selectBayonetId,
            _selectBayonetGroupId: _selectBayonetGroupId
        }
        return _selectBayonetData
    }

    // 镜头列表 单条删除
    $('#tableBayonetList').on('click', '.delete-row', function () {
        var rowIndex = $(this).parent().parent().index(),
            rowData = $("#tableBayonetList").data("result")[rowIndex],
            _ids = [],
            _channels = [];
        _ids.push(rowData.id);
        _channels.push(rowData.channel);
        var groupid = $("#bayonetList .bayonet-card-item.active").attr("bayonetgroupid"),
            port1 = 'bayonetManage/delBayonetCamera',
            portData1 = {
                ids: _ids ? _ids : [],
                channels: _channels ? _channels : [],
                groupid: groupid ? groupid : '',
            },
            portDataSuccessFunc = function (data) {
                if (data.code === '000') {
                    warningTip.say('删除成功');
                    _isQuickAdd = true;
                    // 删除成功之后 需要刷新 镜头管理列表
                    initTableList($('#tableBayonetList'), $('#tableBayonetListPagination'), true);
                }
            };
        loadData(port1, true, portData1, portDataSuccessFunc);
    });

})(window, window.jQuery)