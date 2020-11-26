;
(function (window, $) {
    var settings = {
        $deleteOpt: '', //镜头列表操作需要的taskid
        $objConfigList: {},
        controlFlag: true
    };

    // 初始化
    function initCleaningConfig() {
        $("#factoryIdVal").selectmenu();
        getAllLibId($("#libIdVal"), 1);
        getAllFactoryId();
        createCleaningLogList($('#cleaningLogTable'), $('#cleaningLogPagination'), true, 1, 13, settings.$objConfigList);
        // 设置table的显示区域高度
        var searchHeight = $('#featureExtractLog .manages-search-style').height();
        var viewHeight = $('#featureExtractLog').height();
        $('#featureExtractLog .manages-card-content').css('height', viewHeight - searchHeight - 50);
    };
    initCleaningConfig();

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
     * 配置列表生成
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     * @param {*} param 过滤条件对象
     */
    function createCleaningLogList($table, $pagination, first, page, number, param) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="10" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/cleanLog/logs',
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
                            html = `<tr data-index="${i}" class="detail-row" taskId="${result[i].id}" sourceCode="${result[i].sourceCode}">
                                        <td></td>
                                        <td title="${result[i].libName || '--'}">${result[i].libName || '--'}</td>
                                        <td>${result[i].minLibId || '--'}</td>
                                        <td>${result[i].maxLibId || '--'}</td>
                                        <td>${result[i].minLibAllId || '--'}</td>
                                        <td>${result[i].maxLibAllId || '--'}</td>
                                        <td>${result[i].tooks || '--'}</td>
                                        <td>${result[i].opTime || '--'}</td>
                                        <td>${result[i].stopTime || '--'}</td>
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
                                createCleaningLogList($table, '', false, currPage, pageSize, param);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="10" class="text-center">No matching records found</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="10" class="text-center">No matching records found</td></tr>');
                }
            };
        loadData(port, true, $.extend(portData, param), successFunc);
    };


    /**
     * 采集成功详情列表
     * @param {*} data 目标数据
     * @param {*} $container 目标容器 
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     */
    function createCleaningDetailList(searchData, $table, $pagination, first, page, number) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="9" class="text-center">没有匹配的记录</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/cleanLog/detailLogs',
            portData = {
                cleanId: searchData.id,
                libId: searchData.libId,
                page: page ? page : 1,
                size: number ? number : 10,
                random: Math.random()
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
                        var _html = '';
                        var cardType = '身份证';
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].idType) {
                                switch (result[i].idType) {
                                    case '1':
                                        cardType == '身份证';
                                        break;
                                    case '2':
                                        cardType == '护照';
                                        break;
                                    case '3':
                                        cardType == '港澳通行证';
                                        break;
                                    case '4':
                                        cardType == '回乡证';
                                        break;
                                    case '5':
                                        cardType == '台胞证';
                                        break;
                                    case '6':
                                        cardType == '居住证';
                                        break;
                                    case '7':
                                        cardType == '社保';
                                        break;
                                    case '8':
                                        cardType == '台湾通行证';
                                        break;
                                }
                            }
                            _html += `<tr class="table-row" taskId="${result[i].id}">
                                        <td></td>
                                        <td><img class="table-img img-right-event" src="${result[i].picUrl ? result[i].picUrl : './assets/images/control/person.png'}" alt=""></td>
                                        <td title="${result[i].name || '--'}">${result[i].name || '--'}</td>
                                        <td>${result[i].idcard || '--'}</td>
                                        <td>${result[i].gender == 1 && '男' || result[i].gender == 2 && '女' || '--'}</td>
                                        <td>${cardType}</td>
                                        <td>${result[i].sources || '--'}</td>
                                        <td>${result[i].isClean == 1 && '是' || result[i].isClean == 2 && '否' || '--'}</td>
                                        <td>${result[i].comments || '--'}</td>
                                    </tr>`;
                        }
                        // 先清空节点,再把拼接的节点插入
                        $tbody.empty().html(_html);
                        $tbody.find('.table-row').each(function (index, el) {
                            $(this).data('list', result[index]);
                        });
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
                                createCleaningDetailList(searchData, $table, '', false, currPage, pageSize);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="9" class="text-center">没有匹配的记录</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="9" class="text-center">没有匹配的记录</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, portData, successFunc);
    }

    // 搜索按钮点击事件
    $("#cleaningSearchBut").on("click", function () {
        settings.$objConfigList.libId = $.trim($("#libIdVal").val());
        settings.$objConfigList.factoryId = $("#factoryIdVal").val();
        settings.$objConfigList.startTime = $("#startTime").val();
        settings.$objConfigList.endTime = $("#endTime").val();

        createCleaningLogList($('#cleaningLogTable'), $('#cleaningLogPagination'), true, 1, 13, settings.$objConfigList);
    });

    $("#cleaningLogTable").on("click", ".detail-row", function () {
        var listData = $(this).data('allData');
        $("#cleaningDetailModal").modal('show');
        $("#cleaningDetailModal").data('listData', listData);
        createCleaningDetailList(listData, $('#cleaningDetailTable'), $('#cleaningDetailPagination'), true, 1, 10);
    })

    showMiddleImg($('#cleaningDetailTable'), $('#cleaningDetailModal'), '.table-img'); //hover 显示中图
})(window, window.jQuery)