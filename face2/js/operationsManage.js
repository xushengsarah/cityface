(function (window, $) {
    //运维统计数据
    var configYWData = {
        orgId: '10',
        cameraName: '',
        gbCode: '',
        onlineStatus: '',
        picStatus: '',
        startTime: '',
        endTime: '',
        hisPicStatus: '',
        page: 1,
        size: 10
    };

    init();

    //统计报表按钮点击事件
    function init() {
        getAllOrgId($("#operationsManage #operationsOrgId"));

        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });

        configYWData.startTime = $.trim(sureSelectTime(-1, true).date);
        configYWData.endTime = $.trim(sureSelectTime(-1, true).date);

        $("#snapPicOperationsStart").val($.trim(sureSelectTime(-8, true).date));
        $("#snapPicOperationsEnd").val($.trim(sureSelectTime(-1, true).date));

        let contentHeight = $("#operationsManage").height() - $("#operationsManage .manages-search-style").outerHeight() - 40 + 'px';
        $("#operationsManage .manages-card-content").height(contentHeight);
    }

    /**
     * 获取库列表
     * @param {*} $modal 弹窗
     */
    function getAllOrgId($modal) {
        $container = $modal;
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
                    var itemHtml = `<option class="option-item" orgid="${result[0].orgId}" value="${result[0].orgId}" selected>${result[0].orgName}</option>`;
                    for (var i = 1; i < result.length; i++) {
                        itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                    }
                    $container.html(itemHtml); // 元素赋值
                    $container.prop('disabled', false); // 非不可选
                    $container.selectpicker('refresh');

                    $('#operationsTableList').find('tbody').html('<tr><td colspan="7" class="text-center">没有匹配的记录</td></tr>');
                    configYWData.orgId = result[0].orgId;
                    createSnapYWList($('#operationsTableList'), $("#operationsTablePagination"), true, configYWData);
                    createSnapYWErrorList(configYWData);
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
    * 列表生成 运维统计列表
    * @param {*} $table 表格容器
    * @param {*} $pagination 表格分页容器
    * @param {*} first 是否初次加载
    */
    function createSnapYWList($table, $pagination, first, configData) {
        showLoading($('#operationsManage'));
        if (first) {
            $pagination.html('');
        }
        var $thead = $table.find('thead');
        var $tbody = $table.find('tbody');
        var port = 'v2/index/getCameraStatusStatistic',
            successFunc = function (data) {
                hideLoading($('#operationsManage'));
                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });
                    if (result && result.length > 0) {
                        var tableHtml = '';
                        for (var i = 0; i < result.length; i++) {
                            tableHtml += `<tr class="table-row" data-index="${i}" taskId="${result[i].incidentId}">
                                            <td title=${result[i].cameraName} cameraid="${result[i].cameraId}" class="text-link showCameraPage">${result[i].cameraName}</td>
                                            <td title="${result[i].gbCode || '未知'}">${result[i].gbCode || '未知'}</td>
                                            <td title="${result[i].orgName || '未知'}">${result[i].orgName || '未知'}</td>
                                            <td title="${result[i].videoStatus == 0 ? '是' : '否'}">${result[i].videoStatus == 0 ? '是' : '否'}</td>
                                            <td title="${result[i].picStatus == 0 ? '是' : '否'}">${result[i].picStatus == 0 ? '是' : '否'}</td>
                                            <td title="${result[i].total || 0}">${result[i].total || 0}</td>
                                            <td><button type="button" class="btn btn-link report">一键报障</button></td>
                                        </tr>`
                        }
                        // 给列表新增行数据
                        $tbody.empty().html(tableHtml);
                        $tbody.find("tr").each(function (index, el) {
                            $(el).data('listData', result[index]);
                        });
                        if (data.data.total > Number(configData.size) && first) {
                            var pageSizeOpt = [{
                                value: 12,
                                text: '12/页',
                                selected: true
                            }, {
                                value: 18,
                                text: '18/页',
                            }, {
                                value: 25,
                                text: '25/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                configData.page = currPage;
                                configData.size = pageSize;
                                createSnapYWList($table, '', false, configData);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="7" class="text-center">没有匹配的记录</td></tr>');
                        $('.loading-box').hide();
                    }
                } else {
                    $tbody.html('<tr><td colspan="7" class="text-center">没有匹配的记录</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, configData, successFunc);
    };

    /**
     * 运维统计异常数统计
     * @param {*} configData 参数
     */
    function createSnapYWErrorList(configData) {
        var port = 'v2/index/getCameraStreamStatistics',
            data = {
                orgId: configData.orgId
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    $("#opPicStatusErrNum").html(data.data.videoStatusErrNum || 0);
                    $("#opVideoStatusErrNum").html(data.data.picStatusErrNum || 0);
                } else {
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, configData, successFunc);
    };

    //运维 一键报障事件
    $("#operationsTableList").on('click', '.report', function () {
        warningTip.say('暂未开发');
    })

    //全局小图右键事件
    $("#operationsManage").on("mousedown", ".showCameraPage", function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#rightMouseCameraMenu').off().remove();
        if (e.which == 3) {
            var that = $(this),
                cameraName = that.text(),
                cameraId = that.attr("cameraId"),
                $menu = $([
                    '<ul class="mask-camera-list" id="rightMouseCameraMenu" style="z-index:19991018">',
                    '   <li class="mask-camera-item" type="0">实时监控和抓拍图</li>',
                    '   <li class="mask-camera-item" type="1">历史监控和抓拍图</li>',
                    '   <li class="mask-camera-item" type="2">历史抓拍图</li>',
                    '   <li class="mask-camera-item" type="3">一键报障</li>',
                    '</ul>',
                ].join('')),
                menuLen = $('#rightMouseCameraMenu').length;
            if (menuLen > 0) {
                $('#rightMouseCameraMenu').off().remove();
            }
            $('body').append($menu);

            // 给右键菜单添加绑定事件
            $menu.find('.mask-camera-item').off('click').on('click', function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                if ($(this).hasClass("disabled")) {
                    return;
                }
                var menuIndex = $(this).attr("type");
                if (menuIndex == '0') { // 实时监控和抓拍图
                    showMapVideo('playAndCatch', [{ id: cameraId, name: cameraName }], [cameraId]);
                } else if (menuIndex == '1') {  //历史监控和抓拍图
                    showMapVideo('videoReplayAndHisCatch', [{ id: cameraId, name: cameraName }], [cameraId]);
                } else if (menuIndex == '2') { // 历史抓拍图
                    showMapVideo('hisCatch', [{ id: cameraId, name: cameraName }], [cameraId]);
                } else if (menuIndex == '3') { // 一键报障
                    warningTip.say('暂未开发');
                }

                $("#rightMouseCameraMenu").addClass('hide');
            });

            var menuWidth = $('#rightMouseCameraMenu').outerWidth(),
                menuHeight = $('#rightMouseCameraMenu').outerHeight(),
                bodyWidth = $('body').outerWidth(),
                bodyHeight = $('body').outerHeight();
            if (e.clientX + menuWidth > bodyWidth - 20) {
                $menu.css({
                    left: e.clientX - menuWidth
                });
            } else {
                $menu.css({
                    left: e.clientX
                });
            }
            if (e.clientY + menuHeight > bodyHeight - 20) {
                $menu.css({
                    top: e.clientY - menuHeight + $(document).scrollTop()
                });
            } else {
                $menu.css({
                    top: e.clientY + $(document).scrollTop()
                });
            }
            // 绑定全局点击右键菜单消失代码
            $(document).off('click.showCameraPage').on('click.showCameraPage', function () {
                $('#rightMouseCameraMenu').addClass('hide');
            });
            // 给生成的菜单栏里面进行事件阻止
            $('#rightMouseCameraMenu')[0].addEventListener('contextmenu', function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
            });
        }
    });

    //搜索按钮点击事件运维
    $("#operationsSearch").on("click", function () {
        configYWData.orgId = $("#operationsOrgId").val();
        configYWData.cameraName = $.trim($("#operationsCameraName").val());
        configYWData.gbCode = $.trim($("#operationsGBCode").val());
        configYWData.onlineStatus = $("#operationsManage").find("input[name='snapCameraOperations']:checked").val();
        configYWData.startTime = $("#snapPicOperationsStart").val();
        configYWData.endTime = $("#snapPicOperationsEnd").val();
        configYWData.picStatus = $("#operationsManage").find("input[name='snapPicOperations']:checked").val();
        configYWData.hisPicStatus = $("#snapMoreTypeYW").find("input[name='snapOPHPicYW']:checked").val();
        configYWData.page = 1;
        configYWData.size = 10;
        if (configYWData.startTime && configYWData.endTime) {
            createSnapYWList($('#operationsTableList'), $("#operationsTablePagination"), true, configYWData);
        } else {
            warningTip.say('请输入起止时间');
        }
    });

    //导出按钮点击事件 运维
    $("#operationsUpload").on("click", function () {
        if (configYWData.startTime && configYWData.endTime) {
            var post_url = serviceUrl + '/v2/index/exportCameraStatusStatistics?startTime=' + configYWData.startTime + '&endTime=' + configYWData.endTime + '&orgId=' + configYWData.orgId + '&gbCode=' + configYWData.gbCode + '&onlineStatus=' + configYWData.onlineStatus + '&cameraName=' + configYWData.cameraName + '&picStatus=' + configYWData.picStatus + '&hisPicStatus=' + configYWData.hisPicStatus + '&token=' + $.cookie('xh_token');
            if ($("#IframeReportImg").length === 0) {
                $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
            }
            $('#IframeReportImg').attr("src", post_url);
        } else {
            warningTip.say('请输入起止时间');
        }
    });

    //重置按钮点击事件
    $("#operationsReset").on("click", function () {
        $("#operationsOrgId").val("10");
        $("#operationsOrgId").selectpicker('refresh');
        $("#operationsCameraName").val("");
        $("#operationsGBCode").val("");
        $("#cameraOperationsOne").click();
        $("#picOperationsOne").click();

        $("#snapPicOperationsStart").val($.trim(sureSelectTime(-8, true).date));
        $("#snapPicOperationsEnd").val($.trim(sureSelectTime(-1, true).date));
    });
})(window, window.jQuery)