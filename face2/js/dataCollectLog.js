;
(function (window, $) {
    var settings = {
        $deleteOpt: '', //镜头列表操作需要的taskid
        $objConfigList: {},
        controlFlag: true
    };

    // 初始化
    function initControlConfig() {
        getAllLibId(true);
        $("#libIdVal").selectmenu();
        $("#opTypeVal").selectmenu();
        $("#opStatusVal").selectmenu();
        createCollectLogList($('#collectLogTable'), $('#collectLogPagination'), true, 1, 12, settings.$objConfigList);
        // 设置table的显示区域高度
        var searchHeight = $('#dataCollectLog .manages-search-style').height();
        var viewHeight = $('#dataCollectLog').height();
        $('#dataCollectLog .manages-card-content').css('height', viewHeight - searchHeight - 50);
    };
    initControlConfig();

    // 获取下拉框数据
    function getAllLibId(first, currPage, pageSize) {
        var _port = 'v3/collectLog/collectLibs',
            _portData = {
                page: currPage ? currPage : 1,
                size: pageSize ? pageSize : 20
            },
            _successFunc = function (data) {
                if (data.code === '200' && data.data.list.length) {
                    var allLibId = data.data.list;
                    if (first) {
                        var html = '<option selected value="">全部</option>';
                    } else {
                        var html = '';
                    }
                    for (var i = 0; i < allLibId.length; i++) {
                        html += `<option value=${allLibId[i].libId}>${allLibId[i].libName}</option>`
                    }
                    $('#libIdVal').append(html);
                    $("#libIdVal").selectmenu('refresh');

                    $("#libIdVal-menu .ui-menu-item").off('mousewheel').on('mousewheel', function () {
                        // 下拉菜单滚动加载数据
                        var $this = $(this),
                            itemNum = $("#libIdVal-menu").find('.ui-menu-item').length,
                            curPage = parseInt(itemNum / 20),
                            viewHeight = $this.parent().height(), //视口可见高度
                            contentHeight = $this.height() * itemNum, //内容高度
                            scrollHeight = $this.parent().scrollTop(), // 已经滚动了的高度
                            totalCardItemNUM = data.data.total;
                        if (contentHeight - viewHeight - scrollHeight <= 0 && (itemNum - 1) < totalCardItemNUM) {
                            getAllLibId(curPage + 1);
                        }
                    });
                }
            };
        loadData(_port, true, _portData, _successFunc);
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
    function createCollectLogList($table, $pagination, first, page, number, param) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="13" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/collectLog/logs',
            portData = {
                "page": page ? page : 1,
                "size": number ? number : 12,
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
									<td>${result[i].opType == 1 && '新增' || result[i].opType == 1 && '修改' || result[i].opType == 1 && '删除' || '--'}</td>
									<td>${result[i].picTotal || '--'}</td>
                                    <td class="${result[i].picSuccess == 0 ? '' : 'success-item'}">${result[i].picSuccess}</td>
                                    <td class="${result[i].picFail == 0 ? '' : 'fail-item'}">${result[i].picFail}</td>
                                    <td>${result[i].tooks || '--'}</td>
									<td>${result[i].opStatus == 1 && '成功' || result[i].opStatus == 2 && '部分成功' || result[i].opStatus == 3 && '失败' || '--'}</td>
									<td>${result[i].increValue || '--'}</td>
									<td>${result[i].updateTime || '--'}</td>
                                    <td>${result[i].exeDate || '--'}</td>
                                    <td>${result[i].opTime || '--'}</td>
                                    <td>${result[i].stopTime || '--'}</td>
								</tr>`
                            $tbody.append(html);
                            $tbody.find("tr").eq(i).data({
                                'allData': result[i]
                            });
                        }

                        if (data.data.total > Number(portData.size) && first) {
                            var pageSizeOpt = [{
                                value: 12,
                                text: '12/页',
                                selected: true
                            }, {
                                value: 15,
                                text: '15/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                $(".table-checkbox-all").removeAttr("checked");
                                createCollectLogList($table, '', false, currPage, pageSize, param);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="13" class="text-center">No matching records found</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="13" class="text-center">No matching records found</td></tr>');
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
    function createSuccessCollectList(searchData, $table, $pagination, first, page, number) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="11" class="text-center">没有匹配的记录</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/opPersonInfo/searchPersonInfo',
            portData = {
                logId: searchData.id,
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
                        for (var i = 0; i < result.length; i++) {
                            var picStatus = '未布控', //默认未布控
                                tagType = 'grade2'; //是否显示单选框
                            if (result[i].rowstate == '-1') { //已删除
                                picStatus = '已删除';
                                tagType = 'grade4';
                            } else {
                                if (result[i].picStatus == '0') { //未布控
                                    picStatus = '未布控';
                                    tagType = 'grade2';
                                } else if (result[i].picStatus == '1') { //布控中
                                    picStatus = '布控中';
                                    tagType = 'grade1';
                                } else if (result[i].picStatus == '2') { //已撤控
                                    picStatus = '已撤控';
                                    tagType = 'grade3';
                                }
                            }

                            var cardType = '身份证';
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
                            _html += `<tr class="table-row" personId="${result[i].id}">
                                            <td></td>
                                            <td><img class="table-img img-right-event" src="${result[i].picUrl ? result[i].picUrl : './assets/images/control/person.png'}" alt=""></td>
                                            <td title="${result[i].name || '--'}">${result[i].name || '--'}</td>
                                            <td>${result[i].gender || '--'}</td>
                                            <td>${cardType}</td>
                                            <td class="pre20" title="${result[i].idcard || '--'}">${result[i].idcard || '--'}</td>
                                            <td>${result[i].nation || '--'}</td>
                                            <td title="${result[i].regaddress || '--'}">${result[i].regaddress || '--'}</td>
                                            <td>
                                                <span class="tag aui-ml-xs ${tagType}">${picStatus}</span>
                                            </td>
                                            <td>${result[i].updatetime || '--'}</td>
                                            <td>${result[i].sources || '--'}</td>
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
                                value: 20,
                                text: '20/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                $(".table-checkbox-all").removeAttr("checked");
                                createSuccessCollectList(searchData, $table, '', false, currPage, pageSize);
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

    /**
     * 采集失败详情列表
     * @param {*} searchData 过滤条件对象
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     */
    function createFailCollectList(searchData, $table, $pagination, first, page, number) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="8" class="text-center">没有匹配的记录</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/collectLog/failLogs',
            portData = {
                logId: searchData.id,
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
                                   <td title="${result[i].keyValue || '--'}">${result[i].keyValue || '--'}</td>
                                   <td>${result[i].increValue || '--'}</td>
                                   <td>${result[i].opType == 1 && '新增' || result[i].opType == 1 && '修改' || result[i].opType == 1 && '删除' || '--'}</td>
                                   <td>${result[i].collectTime || '--'}</td>
                                   <td>${result[i].errInfo || '--'}</td>
                                    <td>${result[i].updateTime || '--'}</td>
                                    
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
                                value: 20,
                                text: '20/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                $(".table-checkbox-all").removeAttr("checked");
                                createFailCollectList(searchData, $table, '', false, currPage, pageSize);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="8" class="text-center">没有匹配的记录</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="8" class="text-center">没有匹配的记录</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, portData, successFunc);
    }

    // 搜索按钮点击事件
    $("#collectSearchBut").on("click", function () {
        settings.$objConfigList.libId = $("#libIdVal").val();
        settings.$objConfigList.opType = $("#opTypeVal").val();
        settings.$objConfigList.opStatus = $("#opStatusVal").val();
        settings.$objConfigList.startTime = $("#startTime").val();
        settings.$objConfigList.endTime = $("#endTime").val();

        createCollectLogList($('#collectLogTable'), $('#collectLogPagination'), true, 1, 12, settings.$objConfigList);
    });

    $("#collectLogTable").on("click", ".success-item", function () {
        var listData = $(this).closest("tr").data('allData');
        $("#successCollectDetailModal").modal('show');
        $("#successCollectDetailModal").data('listData', listData);
        createSuccessCollectList(listData, $('#successCollectDetailTable'), $('#successCollectDetailPagination'), true, 1, 10);
    })

    $("#collectLogTable").on("click", ".fail-item", function () {
        var listData = $(this).closest("tr").data('allData');
        $("#failCollectDetailModal").modal('show');
        $("#failCollectDetailModal").data('listData', listData);
        createFailCollectList(listData, $('#failCollectDetailTable'), $('#failCollectDetailPagination'), true, 1, 10)
    })

    showMiddleImg($('#successCollectDetailTable'), $('#successCollectDetailModal'), '.table-img'); //hover 显示中图

})(window, window.jQuery)