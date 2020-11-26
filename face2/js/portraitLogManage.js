(function (window, $) {
    var myData = {};
    initLogManage();

    //初始化
    function initLogManage() {
        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });
        $('[data-role="checkbox"]').checkboxradio();

        $("#portrairLogType").selectmenu();
        $("#portrairLogOpType").selectmenu();
        $("#portrairLogPolice").prop('disabled', true);
        $("#portrairLogPolice").val(null);
        $("#portrairLogPolice").selectpicker('refresh');

        window.initDatePicker1($('#portrairLogTime'), -1); // 初始化其他事件下的时间控件
        getSearchLogSelect($("#portrairLogOrg")); //获取分局下拉框
        getPortrairLogLibList($("#portrairLogLibId"), 1);
        var startTime = $('#startTimePortrairLog').val(),
            endTime = $('#endTimePortrairLog').val()
        myData = {
            startTime,
            endTime
        };
        createLogTableList($("#portrairLogTableList"), $("#portrairLogTablePagination"), true, 1, 10, myData);
        // 设置table的显示区域高度
        var searchHeight = $('#portrairLogManage .manages-search-style').height();
        var viewHeight = $('#portrairLogManage').height();
        $('#portrairLogManage .manages-card-content').css('height', viewHeight - searchHeight - 50);
    };

    //获取分局
    function getSearchLogSelect($container, orgId, returnType, orgType) {
        showLoading($container.closest(".aui-col-18"));
        var port = 'v2/org/getOrgInfos',
            data = {
                orgId: orgId ? orgId : '',
                orgType: orgType ? orgType : 1,
                userType: 2,
                returnType: returnType ? returnType : 3
            };
        var successFunc = function (data) {
            hideLoading($container.closest(".aui-col-18"));
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
                    if ($container.attr('id') === 'portrairLogOrg') { // 分局下拉框
                        itemHtml = `<option class="option-item" orgid="${result[0].orgId}" value="${result[0].orgId}" parentid="" selected>${result[0].orgName}</option>`;
                        for (var i = 1; i < result.length; i++) {
                            itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                        }
                    } else { // 不是分局下拉框
                        itemHtml += `<option class="option-item" orgid="${result[0].orgId}" value="${result[0].orgId}" parentid="${result[0].parentId}" selected>${result[0].orgName}</option>`;
                        for (var i = 1; i < result.length; i++) {
                            itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                        }
                    }
                    $container.empty().append(itemHtml); // 元素赋值
                    if ($container.attr('id') === 'portrairLogOrg') { // 如果为分局下拉框
                        $container.selectpicker({
                            allowClear: false
                        });

                        $container.on('changed.bs.select', function (e, clickedIndex, isSelected) {
                            if (isSelected) {
                                var $targetOptionItem = $container.find(".option-item").eq(clickedIndex - 1);
                                if ($targetOptionItem.attr('parentid')) { // 如果不是市局
                                    //getSearchPolice($containerPolice, $targetOptionItem.attr('orgid'));
                                    getSearchSelect($("#portrairLogPolice"), $targetOptionItem.attr('orgid'), 2, 2); //获取分局下拉框
                                } else { // 如果选择市局
                                    $("#portrairLogPolice").prop('disabled', true).val(null); // 派出所下拉框不可用
                                    $("#portrairLogPolice").selectpicker('refresh');
                                }
                            }
                        });
                    } else { // 如果不是分局下拉框
                        $container.prop('disabled', false); // 非不可选
                        $container.selectpicker({
                            allowClear: true
                        });
                        $container.val(null);
                    }
                    $container.selectpicker('refresh');
                } else {
                    $container.prop('disabled', true);
                    $container.val(null);
                    $container.selectpicker('refresh');
                }
            } else {
                $container.prop('disabled', true);
                $container.val(null);
                $container.selectpicker('refresh');
            }
        };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };

    /**
     * 获取库列表
     * @param {*} $container 下拉框容器
     * @param {*} num 页数
     * @param {*} name 搜索库名称
     * @param {*} search 是否是搜索回调
     */
    function getPortrairLogLibList($container, num, name, search, scroll) {
        //showLoading($container.closest(".aui-col-18"));
        var port = 'v3/lib/libRightsByLib',
            data = {
                libName: name ? name : '',
                page: num ? num : 1,
                size: 10
            };
        var successFunc = function (data) {
            //hideLoading($container.closest(".aui-col-18"));
            if (data.code === '200') {
                var result = data.data.list,
                    scrollPage = num + 1;
                if (result) { // 存在返回值
                    if (name || scroll) {
                        var itemHtml = '';
                    } else {
                        var itemHtml = '<option class="option-item" libId=" " value=" ">全部</option>';
                    }

                    for (var i = 0; i < result.length; i++) {
                        itemHtml += `<option class="option-item" libId="${result[i].libId}" value="${result[i].libId}">${result[i].libName}</option>`;
                    }
                    if (!search) {
                        $container.append(itemHtml); // 元素赋值
                    } else {
                        $container.html(itemHtml); // 元素赋值
                    }
                    $container.prop('disabled', false); // 非不可选
                    $container.selectpicker('refresh');

                    // 滚动加载数据
                    $("#portrairLogLib").off("mousewheel", ".dropdown.bootstrap-select div.inner").on('mousewheel', ".dropdown.bootstrap-select div.inner", function () {
                        //tab内容列表滚动到底部进行下一分页的懒加载事件
                        var $this = $(this),
                            viewHeight = $this.height(), //视口可见高度
                            contentHeight = $this.find(".dropdown-menu.inner")[0].scrollHeight, //内容高度
                            scrollHeight = $this.scrollTop(), // 已经滚动了的高度
                            currentCardItemNum = $this.find("li").length,
                            totalLogLibNum = parseInt(data.data.total);
                        if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalLogLibNum) {
                            getPortrairLogLibList($container, scrollPage, name, '', true);
                        }
                    });

                    $container.parent().find(".dropdown-menu input.form-control").on("keyup", function () {
                        getPortrairLogLibList($container, 1, $.trim($container.parent().find(".dropdown-menu input.form-control").val()), true);
                    });
                } else {
                    $container.prop('disabled', true);
                    $container.val(null);
                    $container.selectpicker('refresh');
                }
            } else {
                $container.prop('disabled', true);
                $container.val(null);
                $container.selectpicker('refresh');
            }
        };
        loadData(port, true, data, successFunc);
    };

    /**
     * 列表生产
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     * @param {*} param 过滤条件对象
     */
    function createLogTableList($table, $pagination, first, page, number, param) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="13" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/searchLog/getPersonLibLog',
            portData = {
                page: page ? page : 1,
                size: number ? number : 10,
            },
            successFunc = function (data) {
                hideLoading($table);
                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });
                    if (result && result.length > 0) {
                        $tbody.empty();
                        var html = '';
                        for (var i = 0; i < result.length; i++) {
                            var opType = '',
                                serviceType = '';
                            switch (result[i].serviceType) {
                                case '1':
                                    serviceType = '布控';
                                    break;
                                case '2':
                                    serviceType = '撤控';
                                    break;
                                case '3':
                                    serviceType = '关注';
                                    break;
                                case '4':
                                    serviceType = '取消关注';
                                    break;
                                case '5':
                                    serviceType = '导入';
                                    break;
                                case '6':
                                    serviceType = '1：1检索';
                                    break;
                                case '7':
                                    serviceType = '1：N检索';
                                    break;
                                default:
                                    serviceType = '未知';
                            }
                            html += `<tr class="table-row" id="${result[i].id}">
                                        <td></td>
                                        <td><img class="table-img img-right-event" src="${result[i].picUrl ? result[i].picUrl : './assets/images/control/person.png'}" alt=""></td>
                                        <td>${result[i].name ? result[i].name : '未知'}</td>
                                        <td title="${result[i].idcard ? result[i].idcard : '未知'}">${result[i].idcard ? result[i].idcard : '未知'}</td>
                                        <td title="${result[i].libName ? result[i].libName : '未知'}">${result[i].libName ? result[i].libName : '未知'}</td>
                                        <td title="${result[i].labelName ? result[i].labelName : '未知'}">${result[i].labelName ? result[i].labelName : '未知'}</td>
                                        <td title="${result[i].userName ? (result[i].userName + '(' + result[i].orgName + ')') : '未知'}">${result[i].userName ? (result[i].userName + '(' + result[i].orgName + ')') : '未知'}</td>
                                        <td title="${result[i].userId || '未知'}">${result[i].userId || '未知'}</td>
                                        <td title="${result[i].opIp ? result[i].opIp : '未知'}">${result[i].opIp ? result[i].opIp : '未知'}</td>
                                        <td>${result[i].opType ? (result[i].opType == '1' ? '新增' : (result[i].opType == '2' ? '修改' : '删除')) : '未知'}</td>
                                        <td>${serviceType}</td>
                                        <td title="${result[i].opTime ? result[i].opTime : '未知'}">${result[i].opTime ? result[i].opTime : '未知'}</td>
                                        <td title="${result[i].platAccount ? result[i].platAccount : '未知'}">${result[i].platAccount ? result[i].platAccount : '未知'}</td>
                                    </tr> `;
                        }
                        // 先清空节点,再把拼接的节点插入
                        $table.find("tbody").empty().html(html);
                        $table.find("tbody .table-row").each(function (index, el) {
                            $(this).data('list', result[index]);
                        });

                        if (data.data.total > Number(portData.size) && first) {
                            var pageSizeOpt = [{
                                value: 10,
                                text: '10/页',
                                selected: true
                            }, {
                                value: 20,
                                text: '20/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                createLogTableList($table, $pagination, false, currPage, pageSize, param);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="13" class="text-center">No matching records found</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="13" class="text-center">No matching records found</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, $.extend(portData, param), successFunc);
    };

    //改变时间标签的激活状态
    function changeLogActiveSearch(_counts) {
        if (_counts === 1) {
            // 一天 单选激活 
            $('#portrairLog-daysOne').addClass('ui-checkboxradio-checked ui-state-active');
            $('#portrairLog-daysTwo').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#portrairLog-daysThree').removeClass('ui-checkboxradio-checked ui-state-active');
        } else if (_counts === 3) {
            // 三天 单选激活 
            $('#portrairLog-daysOne').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#portrairLog-daysTwo').addClass('ui-checkboxradio-checked ui-state-active');
            $('#portrairLog-daysThree').removeClass('ui-checkboxradio-checked ui-state-active');
        } else if (_counts === 7) {
            // 七天 单选激活 
            $('#portrairLog-daysOne').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#portrairLog-daysTwo').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#portrairLog-daysThree').addClass('ui-checkboxradio-checked ui-state-active');
        } else {
            // 所有单选不激活 
            $('#portrairLog-daysOne').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#portrairLog-daysTwo').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#portrairLog-daysThree').removeClass('ui-checkboxradio-checked ui-state-active');
        }
    }

    //时间控件点击事件
    window.selectDateLogFuncSearch = function () {
        // 开始时间1
        var startTime = $('#portrairLogTime').find('.datepicker-input').eq(0).val();
        // 结束时间
        var endTime = $('#portrairLogTime').find('.datepicker-input').eq(1).val();
        var startDate = new Date(Date.parse(startTime.replace(/-/g, "/"))).getTime();
        var endDate = new Date(Date.parse(endTime.replace(/-/g, "/"))).getTime();
        // 开始时间与结束时间间隔天数
        var _counts = Math.abs(startDate - endDate) / (1000 * 60 * 60 * 24);
        changeLogActiveSearch(_counts);
    }

    $('#portrairLogTime').find('.datepicker-input').off('blur').on('blur', selectDateLogFuncSearch);

    //时间切换事件
    $('#timeSearchLogItem [data-role="radio-button"]').on('click', function () {
        var date = $(this).val();
        $(this).prev().addClass('ui-checkboxradio-checked ui-state-active');
        initDatePicker1($('#portrairLogTime'), -date, true);
    });

    //搜索按钮点击事件
    $("#searchLogList").on("click", function () {
        var _validateFlag = true
        $('#portrairLogManage').find('.text-danger').each(function (index, item) {
            // 如果有字段未通过验证
            if (!$(item).hasClass('hide')) {
                _validateFlag = false
            }
        })

        if (_validateFlag) {
            var userId = $('#portrairLogName').val(),
                opIp = $('#portrairLogIP').val(),
                opType = $('#portrairLogType').val(),
                orgId = $("#portrairLogPolice").val() ? $("#portrairLogPolice").val() : $('#portrairLogOrg').val(),
                startTime = $('#startTimePortrairLog').val(),
                endTime = $('#endTimePortrairLog').val(),
                serviceType = $("#portrairLogOpType").val(),
                libId = $("#portrairLogLibId").val() == " " ? '' : $("#portrairLogLibId").val(),
                idcard = $("#portrairLogIdCard").val();
            myData = {
                userId,
                opIp,
                serviceType,
                orgId,
                startTime,
                endTime,
                opType,
                libId,
                idcard
            };
            createLogTableList($("#portrairLogTableList"), $("#portrairLogTablePagination"), true, '1', '10', myData);
        }
    });

    //重置按钮点击事件
    $("#revertLogList").on("click", function () {
        $("#portrairLogName").val("");
        $("#portrairLogIP").val("");
        $("#portrairLogLibId").val("");
        $("#portrairLogIdCard").val("")
        $("#portrairLogType").val("");
        $("#portrairLogType").selectmenu('refresh');
        $('#portrairLogOpType').val("");
        $("#portrairLogOpType").selectmenu('refresh');
        var $cameraOrg = $('#portrairLogOrg');
        if ($cameraOrg.length > 0) {
            var $cameraMenu = $cameraOrg.data('selectpicker').$menu,
                $cameraBtn = $cameraOrg.data('selectpicker').$button,
                $cameraMenuItem = $cameraMenu.find('.dropdown-menu').find('.dropdown-item');
            $cameraMenuItem.eq(0).click();
            $cameraBtn.blur();
        }
        $("#portrairLog-three").click();
    });

    //导出按钮点击事件
    $("#importLogList").on("click", function () {
        showLoading($('#importLogList'));
        var port = 'v3/searchLog/exportPersonLibLog',
            successFunc = function (data) {
                hideLoading($('#importLogList'));
                if (data.code == '200') {
                    var post_url = serviceUrl + '/v3/searchLog/exportPersonLibLogExcel?downId=' + data.downId + '&token=' + $.cookie('xh_token');
                    if ($("#IframeReportImg").length === 0) {
                        $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
                    }
                    $('#IframeReportImg').attr("src", post_url);
                } else {
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, myData, successFunc);
    });

    // 单个参数校验公共方法
    $('#portrairLogManage').find('#portrairLogIP').off('blur').on('blur', function () {
        if ($.trim($(this).val()) != '') {
            // 校验IP
            var _reg = /^(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;
            if (_reg.test($(this).val()) !== true) {
                $(this).addClass('no-input-warning').parent().find('.text-danger.tip').removeClass('hide');
            } else {
                $(this).removeClass('no-input-warning').parent().find('.text-danger.tip').addClass('hide');
            }
        } else {
            $(this).removeClass('no-input-warning').parent().find('.text-danger.tip').addClass('hide');
        }
    });

    showMiddleImg($('#portrairLogTableList'), $('#portrairLogManage'), '.table-img'); //hover 显示中图
})(window, window.jQuery);