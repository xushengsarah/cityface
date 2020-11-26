/**
 * 初始化 搜索 左侧 分局/派出所/摄像头
 * @param {Object} $orgSelect 分局节点元素
 * @param {Object} $policeSelect 派出所节点元素
 * @param {Object} $cameraSelect 摄像机节点元素
 */
function initDynamic($orgSelect, $policeSelect, $cameraSelect) {
    loadSearchOrgInfo($orgSelect);
    $policeSelect.selectpicker({
        allowClear: true
    });
    $cameraSelect.selectpicker({
        allowClear: true
    });
}

/**
 * 动静结合页面 左侧 分局和派出所 的下拉选择
 * @param {object} $container  select目标容器 分局节点
 * @param {string} orgId    机构id
 * @param {boolean} disabled  slect是否可用
 * @param {string} linkData  关联镜头可用赋值关镜头的机构和镜头
 */
function loadSearchOrgInfo($container, orgId, disabled, linkData) {
    showLoading($container.closest('.camera-drop-select'));
    var port = 'v2/org/getOrgInfos',
        data = {
            orgId: orgId ? orgId : '',
            orgType: 1,
            userType: 2,
            returnType: 3
        };
    if ($container.attr('id') === 'sidebarPoliceSelect' || $container.attr('id') === 'sidebarPoliceSelectDynamic' || $container.attr('id') === 'PSidebarPoliceSelect') {
        data.returnType = 2;
    }
    var successFunc = function (data) {
        hideLoading($container.closest('.camera-drop-select'));
        if (data.code === '200') {
            var result = data.data,
                arrayBox = {};
            // 对返回数组进行排序 市局排在最上层
            for (var i = 0; i < result.length; i++) {
                if (result[i].parentId === null) {
                    arrayBox = result[i];
                    result.splice(i, 1);
                    result.splice(0, 0, arrayBox);
                }
            }
            if (result && result.length) { // 存在返回值
                var itemHtml = '';
                if ($container.attr('id') === 'sidebarOrgSelect') { // 分局下拉框
                    itemHtml = `<option class="option-item" orgid="${result[0].orgId}" value="${result[0].orgId}" parentid="" selected>${result[0].orgName}</option>`;
                    for (var i = 1; i < result.length; i++) {
                        itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                    }
                } else if ($container.attr('id') === 'sidebarOrgSelectDynamic') { // 分局下拉框
                    itemHtml = `<option class="option-item" orgid="${result[0].orgId}" value="${result[0].orgId}" parentid="" selected>${result[0].orgName}</option>`;
                    for (var i = 1; i < result.length; i++) {
                        itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                    }
                } else if ($container.attr('id') === 'sidebarOrgSelectTemperature') {  //温度
                    itemHtml = `<option class="option-item" orgid="${result[0].orgId}" value="${result[0].orgId}" parentid="" selected>${result[0].orgName}</option>`;
                    for (var i = 1; i < result.length; i++) {
                        itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                    }
                } else if ($container.attr('id') === 'PSidebarOrgSelect') { // 同行人
                    itemHtml = `<option class="option-item" orgid="${result[0].orgId}" value="${result[0].orgId}" parentid="" selected>${result[0].orgName}</option>`;
                    for (var i = 1; i < result.length; i++) {
                        itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].sparent}">${result[i].orgName}</option>`;
                    }
                } else { // 不是分局下拉框
                    itemHtml += `<option class="option-item" orgid="${result[0].orgId}" value="${result[0].orgId}" parentid="${result[0].parentId}" selected>${result[0].orgName}</option>`;
                    for (var i = 1; i < result.length; i++) {
                        itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                    }
                }
                if (disabled) {
                    $container.prop('disabled', true); // 不可选
                } else {
                    $container.prop('disabled', false); // 非不可选
                }
                $container.empty().append(itemHtml); // 元素赋值
                if ($container.attr('id') === 'sidebarOrgSelect') { // 如果为分局下拉框
                    $container.selectpicker({
                        allowClear: false
                    });
                } else if ($container.attr('id') === 'sidebarOrgSelectDynamic' || $container.attr('id') === 'sidebarOrgSelectTemperature') {
                    $container.selectpicker({
                        allowClear: false
                    });
                } else if ($container.attr('id') === 'PSidebarOrgSelect') {
                    $container.selectpicker({
                        allowClear: false
                    });
                } else { // 如果不是分局下拉框
                    $container.selectpicker({
                        allowClear: true,
                        clearCallback: function ($ele) {
                            if ($ele.val() === '') {
                                $("#sidebarCameraSelect").prop('disabled', true).val(null); // 摄像机下拉框不可选
                                $("#sidebarCameraSelect").selectpicker('refresh');
                            }
                        }
                    });
                    $container.val(null);
                }
                clickToSelectOrg($container); // 分局下拉框 选中事件
                $container.selectpicker('refresh');
                if (linkData) { //关联镜头传的参数
                    $container.val(linkData);
                    $container.selectpicker('refresh');
                }

                if ($container.attr('id') === 'sidebarOrgSelectTemperature') {  //温度页面默认搜索
                    $("#dynamicsearchTemperature").click();
                }
            } else {
                $container.prop('disabled', true);
                $container.val(null);
                $container.selectpicker('refresh');
            }
        } else {

        }
    };
    loadData(port, true, data, successFunc, undefined, 'GET');
};

/**
 * 分局下拉框 选中事件
 * @param {object} $container select目标容器 
 */
function clickToSelectOrg($container) {
    $container.on('changed.bs.select', function (e, clickedIndex, isSelected) {
        if (isSelected) {
            var $targetOptionItem = $container.find(".option-item").eq(clickedIndex - 1);
            if (event.currentTarget.id === 'sidebarOrgSelect') { // 如果为分局下拉框
                if ($targetOptionItem.attr('parentid')) { // 如果不是市局
                    loadSearchOrgInfo($("#sidebarPoliceSelect"), $targetOptionItem.attr('orgid'));
                } else { // 如果选择市局
                    $("#sidebarPoliceSelect").prop('disabled', true).val(null); // 派出所下拉框不可用
                    $("#sidebarPoliceSelect").selectpicker('refresh');
                }
                $("#sidebarCameraSelect").prop('disabled', true).val(null); // 摄像机下拉框不可用
                $("#sidebarCameraSelect").selectpicker('refresh');
            } else if (event.currentTarget.id === 'sidebarOrgSelectDynamic') {
                if ($targetOptionItem.attr('parentid')) { // 如果不是市局
                    loadSearchOrgInfo($("#sidebarPoliceSelectDynamic"), $targetOptionItem.attr('orgid'));
                } else { // 如果选择市局
                    $("#sidebarPoliceSelectDynamic").prop('disabled', true).val(null); // 派出所下拉框不可用
                    $("#sidebarPoliceSelectDynamic").selectpicker('refresh');
                }
                $("#sidebarCameraSelectDynamic").prop('disabled', true).val(null); // 摄像机下拉框不可用
                $("#sidebarCameraSelectDynamic").selectpicker('refresh');
            } else if (event.currentTarget.id === 'sidebarOrgSelectTemperature') {
                if ($targetOptionItem.attr('parentid')) { // 如果不是市局
                    loadSearchOrgInfo($("#sidebarPoliceSelectTemperature"), $targetOptionItem.attr('orgid'));
                } else { // 如果选择市局
                    $("#sidebarPoliceSelectTemperature").prop('disabled', true).val(null); // 派出所下拉框不可用
                    $("#sidebarPoliceSelectTemperature").selectpicker('refresh');
                }
                $("#sidebarCameraSelectTemperature").prop('disabled', true).val(null); // 摄像机下拉框不可用
                $("#sidebarCameraSelectTemperature").selectpicker('refresh');
            } else if (event.currentTarget.id === 'PSidebarOrgSelect') {
                if ($targetOptionItem.attr('parentid')) {
                    loadSearchOrgInfo($("#PSidebarPoliceSelect"), $targetOptionItem.attr('orgid'));
                } else {
                    $("#PSidebarPoliceSelect").prop('disabled', true).val(null);
                    $("#PSidebarPoliceSelect").selectpicker('refresh');
                }
                $("#PSidebarCameraSelect").prop('disabled', true).val(null);
                $("#PSidebarCameraSelect").selectpicker('refresh');
            } else if (e.currentTarget.id === 'sidebarPoliceSelect') { // 如果为派出所下拉框
                loadSearchCameraInfo($("#sidebarCameraSelect"), $targetOptionItem.attr('orgid'));
            } else if (e.currentTarget.id === 'sidebarPoliceSelectDynamic') { // 如果为派出所下拉框
                loadSearchCameraInfo($("#sidebarCameraSelectDynamic"), $targetOptionItem.attr('orgid'));
            } else if (e.currentTarget.id === 'sidebarPoliceSelectTemperature') { // 如果为派出所下拉框
                loadSearchCameraInfo($("#sidebarCameraSelectTemperature"), $targetOptionItem.attr('orgid'));
            } else if (e.currentTarget.id === 'PSidebarPoliceSelect') {
                loadSearchCameraInfo($("#PSidebarCameraSelect"), $targetOptionItem.attr('orgid'));
            }
        }
    });
}

/**
 * 动静结合页面 左侧 摄像机 的下拉选择
 * @param {object} $container  select目标容器 摄像机节点
 * @param {string} orgId    机构id 所属分局id
 * @param {string} linkData    关联镜头赋值数据
 * @param {boolean} isSearch   是否自动检索
 */
function loadSearchCameraInfo($container, orgId, linkData, isSearch) {
    showLoading($container.closest('.camera-drop-select'));
    var isTemperature = '1';
    if ($("#pageSidebarMenu").find(".aui-icon-monitor").parents(".sidebar-item").hasClass("active")) {  // 纯动态页面
        var type = $("input[name='dynamicCameraType']:checked").val();
    } else if ($("#pageSidebarMenu").find(".aui-icon-carsearch2").parents(".sidebar-item").hasClass("active")) { // 综合检索界面
        var type = $("input[name='mergeCameraType']:checked").val();
    } else if ($("#pageSidebarMenu").find(".aui-icon-library").parents(".sidebar-item").hasClass("active")) {  //温度页面
        var type = $("input[name='temperatureCameraType']:checked").val();
        isTemperature = '2';
    } else {
        var type = $("input[name='peerCameraType']:checked").val();
    }
    type = type == '2' ? '' : type // 一类点有异常，如果为一类点改为全部，后续删除
    var port = 'v2/org/getOrgCameraInfos',
        data = {
            orgId: orgId ? orgId : '',
            type: type ? type : '',
            devType: isTemperature,
            page: '1',
            size: '1000'
        },
        successFunc = function (data) {
            hideLoading($container.closest('.camera-drop-select'));
            if (data.code === '200') {
                var result = data.data.list;
                if (result && result.length) { // 存在返回摄像机
                    var itemHtml = '';
                    for (let i = 0; i < result.length; i++) {
                        itemHtml += `<option class="option-item" cameraid="${result[i].cameraId}" cameracode="${result[i].cameracode}" gb_code="${result[i].gbCode}" value="${result[i].cameraId}">${result[i].cameraName}</option>`;
                    }
                    $container.empty().append(itemHtml); // 摄像机节点赋值
                    $container.selectpicker({
                        allowClear: true
                    });
                    $container.prop('disabled', false); // 摄像机下拉框可用
                    $container.val(null);
                    $container.selectpicker('refresh');

                    if (linkData) {
                        $container.val(linkData);
                        $container.selectpicker('refresh');
                    }

                    if (isSearch) {
                        if ($container.attr("id") == 'sidebarCameraSelectDynamic') {
                            var $mergeSearch = $("#dynamicsearchDynamic");
                        } else if ($container.attr("id") == 'sidebarCameraSelectTemperature') {
                            var $mergeSearch = $("#dynamicsearchTemperature");
                        } else {
                            var $mergeSearch = $("#mergeSearch");
                        }
                        setTimeout(() => {
                            $mergeSearch.click();
                        }, 1000);
                    }
                } else {
                    $container.prop('disabled', true); // 摄像机下拉框不可用
                    $container.val(null);
                    $container.selectpicker('refresh');
                }
            }
        };
    loadData(port, true, data, successFunc, undefined, 'GET');
};
/**
 * 改变时间标签的激活状态
 */
function changeActiveMerge(_counts) {
    // if (_counts === 3) {
    //     // 三天 单选激活 
    //     $('#mergeTime button').eq(0).addClass('btn-primary').siblings().removeClass("btn-primary");
    // } else if (_counts === 7) {
    //     // 七天 单选激活 
    //     $('#mergeTime button').eq(1).addClass('btn-primary').siblings().removeClass("btn-primary");
    // } else if (_counts === 30) {
    //     // 半个月 单选激活 
    //     $('#mergeTime button').eq(2).addClass('btn-primary').siblings().removeClass("btn-primary");
    // } else {

    // }
    // 所有单选不激活 
    $('#mergeTime button').removeClass("btn-primary");
}

$('#searchMerge_Time').find('.datepicker-input').off('blur').on('blur', function () {
    //开始时间
    var startTime = $('#searchMerge_Time').find('.datepicker-input').eq(0).val();
    // 结束时间
    var endTime = $('#searchMerge_Time').find('.datepicker-input').eq(1).val();

    var startDate = new Date(Date.parse(startTime.replace(/-/g, "/"))).getTime();
    var endDate = new Date(Date.parse(endTime.replace(/-/g, "/"))).getTime();
    // 开始时间与结束时间间隔天数
    //var _counts = (endTime.substring(0, 4) - startTime.substring(0, 4)) * 360 + (endTime.substring(5, 7) - startTime.substring(5, 7)) * 30 + (endTime.substring(8, 10) - startTime.substring(8, 10));
    var _counts = Math.abs(startDate - endDate) / (1000 * 60 * 60 * 24);
    changeActiveMerge(_counts);
});

/**
 * 每次搜索实时获取时间
 * @param {object} $dom 目标容器 
 * @param {string} type 类型
 */
function searchRealTime($dom, type) {
    let dataSpace = -30;
    switch (type) {
        case '0':
            dataSpace = -3;
            break;
        case '1':
            dataSpace = -7;
            break;
        case '2':
            dataSpace = -30;
            break;
    }
    window.initDatePicker1($dom, dataSpace); // 初始化 时间控件
}