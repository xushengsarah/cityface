;
(function (window, $) {
    var settings = {
        $deleteOpt: '', //镜头列表操作需要的taskid
        $objConfigList: {},
        controlFlag: true
    };

    // 初始化
    function initControlConfig() {
        $("#factoryIdVal").selectmenu();
        getAllLibId($("#libIdVal"), 1);
        getAllFactoryId();
        createFExtractLogList($('#FExtractLogTable'), $('#FExtractLogPagination'), true, 1, 13, settings.$objConfigList);
        // 设置table的显示区域高度
        var searchHeight = $('#featureExtractLog .manages-search-style').height();
        var viewHeight = $('#featureExtractLog').height();
        $('#featureExtractLog .manages-card-content').css('height', viewHeight - searchHeight - 50);
    };
    initControlConfig();

    /**
     * 获取库列表
     * @param {*} $container 下拉框容器
     * @param {*} num 页数
     * @param {*} name 搜索库名称
     * @param {*} search 是否是搜索回调
     */
    function getAllLibId($container, num, name, search, scroll) {
        var port = 'v3/lib/libRightsByLib',
            data = {
                libName: name ? name : '',
                page: num ? num : 1,
                size: 10
            };
        var successFunc = function (data) {
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
                    $container.parent().find('div.inner').off("mousewheel").on('mousewheel', function () {
                        //tab内容列表滚动到底部进行下一分页的懒加载事件
                        var $this = $(this),
                            viewHeight = $this.height(), //视口可见高度
                            contentHeight = $this.find(".dropdown-menu.inner")[0].scrollHeight, //内容高度
                            scrollHeight = $this.scrollTop(), // 已经滚动了的高度
                            currentCardItemNum = $this.find("li").length,
                            totalLogLibNum = parseInt(data.data.total);
                        if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalLogLibNum) {
                            getAllLibId($container, scrollPage, name, '', true);
                        }
                    });

                    $container.parent().find(".bs-searchbox input").on("keyup", function () {
                        getAllLibId($container, 1, $.trim($container.parent().find(".bs-searchbox input").val()), true);
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

    // 获取算法厂家数据
    function getAllFactoryId() {
        var port = 'v2/faceRecog/manufactors',
            successFunc = function (data) {
                if (data.code === '200') {
                    if (data.code === '200' && data.data.length) {
                        var allLibId = data.data;
                        var html = '<option selected value="">全部</option>';
                        for (var i = 0; i < allLibId.length; i++) {
                            html += `<option value=${allLibId[i].platformId}>${allLibId[i].platformName}</option>`
                        }
                        $('#factoryIdVal').append(html);
                        $("#factoryIdVal").selectmenu('refresh');
                    }
                } else {
                    warning.say(data.message);
                }
            };
        loadData(port, true, {}, successFunc, undefined, 'GET', sourceType == 'ga' ? serviceUrlOther : '');
    };


    /**
     * 特征采集列表
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     * @param {*} param 过滤条件对象
     */
    function createFExtractLogList($table, $pagination, first, page, number, param) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="12" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/modelLog/logs',
            portData = {
                "page": page ? page : 1,
                "size": number ? number : 13,
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
                        for (var i = 0; i < result.length; i++) {
                            var html = '';
                            html = `<tr data-index="${i}" class="" taskid="${result[i].id}" sourceCode="${result[i].sourceCode}">
                                        <td></td>
                                        <td title="${result[i].libName || '--'}">${result[i].libName || '--'}</td>
                                        <td>${result[i].version || '--'}</td>
                                        <td>${result[i].factoryName || '--'}</td>
                                        <td>${result[i].minNum}</td>
                                        <td>${result[i].maxNum}</td>
                                        <td>${result[i].modelNum || '--'}</td>
                                        <td>${result[i].successNum || '--'}</td>
                                        <td class="${(!result[i].failNum || result[i].failNum == 0) ? '' : 'fail-item'}">${result[i].failNum || '--'}</td>
                                        <td>${result[i].minTime || '--'}</td>
                                        <td>${result[i].maxTime || '--'}</td>
                                        <td>${result[i].updateTime || '--'}</td>
                                    </tr>`
                            $tbody.append(html);
                            $tbody.find("tr").eq(i).data({
                                'allData': result[i]
                            });
                        }

                        if (data.data.total > Number(portData.size) && first) {
                            var pageSizeOpt = [{
                                value: 13,
                                text: '13/页',
                                selected: true
                            }, {
                                value: 15,
                                text: '15/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                $(".table-checkbox-all").removeAttr("checked");
                                createFExtractLogList($table, '', false, currPage, pageSize, param);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="12" class="text-center">No matching records found</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="12" class="text-center">No matching records found</td></tr>');
                }
            };
        loadData(port, true, $.extend(portData, param), successFunc);
    };

    /**
     * 采集失败详情列表
     * @param {*} searchData 过滤条件对象
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     */
    function createFailFExtractList(searchData, $table, $pagination, first, page, number) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="11" class="text-center">没有匹配的记录</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/modelLog/failLogs',
            portData = {
                modelId: searchData.id,
                libId: searchData.libId,
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
                        for (var i = 0; i < result.length; i++) {
                            var html = '';
                            html += `<tr data-index="${i}" taskId="${result[i].id}">
                                    <td></td>
                                    <td title="${result[i].libName || '--'}">${result[i].libName || '--'}</td>
                                    <td>${result[i].failCode || '--'}</td>
                                    <td title="${result[i].failReason || '--'}">${result[i].failReason || '--'}</td>
                                    <td>${result[i].tryNum}</td>
                                    <td>${result[i].failType == 1 && '入库失败' || result[i].failType == 2 && 'ftp上传失败' || '--'}</td>
                                    <td title="${result[i].modelTime || '--'}">${result[i].modelTime || '--'}</td>
                                    <td title="${result[i].updatetime || '--'}">${result[i].updatetime || '--'}</td>
                                    <td title="${result[i].name || '--'}">${result[i].name || '--'}</td>
                                    <td title="${result[i].idcard || '--'}">${result[i].idcard || '--'}</td>
                                    <td><img class="table-img img-right-event" src="${result[i].picUrl ? result[i].picUrl : './assets/images/control/person.png'}" alt=""></td>
                               </tr>`
                            $tbody.append(html);
                            $tbody.find("tr").eq(i).data({
                                'allData': result[i]
                            });
                        }

                        if (data.data.total > Number(portData.size) && first) {
                            var pageSizeOpt = [{
                                value: 10,
                                text: '10/页',
                                selected: true
                            }, {
                                value: 15,
                                text: '15/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                $(".table-checkbox-all").removeAttr("checked");
                                createFailFExtractList(searchData, $table, '', false, currPage, pageSize);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="11" class="text-center">没有匹配的记录</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="11" class="text-center">没有匹配的记录</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, portData, successFunc);
    }


    // 搜索按钮点击事件
    $("#FExtractSearchBut").on("click", function () {
        settings.$objConfigList.libId = $.trim($("#libIdVal").val());
        settings.$objConfigList.factoryId = $("#factoryIdVal").val();
        settings.$objConfigList.startTime = $("#startTime").val();
        settings.$objConfigList.endTime = $("#endTime").val();

        createFExtractLogList($('#FExtractLogTable'), $('#FExtractLogPagination'), true, 1, 13, settings.$objConfigList);
    });

    $("#FExtractLogTable").on("click", ".fail-item", function () {
        var listData = $(this).closest("tr").data('allData');
        $("#failFExtractDetailModal").modal('show');
        $("#failFExtractDetailModal").data('listData', listData);
        createFailFExtractList(listData, $('#failFExtractDetailTable'), $('#failFExtractDetailPagination'), true, 1, 10)
    })

    showMiddleImg($('#failFExtractDetailTable'), $('#failFExtractDetailModal'), '.table-img'); //hover 显示中图

})(window, window.jQuery)