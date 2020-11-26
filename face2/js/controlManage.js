(function (window, $) {
    //检索条件
    var controlPortData = {
        taskId: '',
        runStatus: '', //布控任务状态
        type: '', //布控任务类型
        keywords: '',
        createUser: '',
        createTime: '',
        endCreateTime: '',
        orgIds: [], //机构数组
        viewType: '',
        autoStatus: '', // 任务状态：0-审批中；1-已通过；2-已驳回
        myApprove: '', // 我的审批：1-我发起的2-待我审批3-我已审批
        page: '1',
        size: '20',
    },
        noticeWaysData = ''; // 通知方式类型

    /**
     * 配置列表生成
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     * @param {*} param 过滤条件对象
     */
    function createControlTableList($table, $pagination, first, page, number) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="12" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        controlPortData.page = page ? page : 1;
        controlPortData.size = number ? number : 13;
        var port = 'v3/distributeManager/distributeTaskList',
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
                            var orgListHtml = '';

                            html += `<tr data-index="${i}" class="librow" taskId="${result[i].id}" libId="${result[i].libId}">
                                        <td></td>
                                        <td title="${result[i].name.replace(/</g, '&lt;').replace(/>/g, '&gt;') || '--'}">${result[i].name.replace(/</g, '&lt;').replace(/>/g, '&gt;') || '--'}</td>
                                        <td title="${result[i].libName ? result[i].libName : '--'}${result[i].labelName ? ('-' + result[i].labelName) : ''}">${result[i].libName ? result[i].libName : '--'}${result[i].labelName ? ('-' + result[i].labelName) : ''}</td>
                                        <td title="${result[i].creator + '(' + result[i].orgName + ')' || '--'}">${result[i].creator + '(' + result[i].orgName + ')' || '--'}</td>
                                        <td title="${result[i].creatorId || '--'}">${result[i].creatorId || '--'}</td>
                                        <td title="${result[i].createTime || '--'}">${result[i].createTime || '--'}</td>
                                        <td title="${result[i].startTime ? (result[i].startTime + " 至 " + result[i].endTime) : '--'}">${result[i].startTime ? (result[i].startTime + " 至 " + result[i].endTime) : '--'}</td>
                                        <td title="${result[i].threshold || '--'}">${result[i].threshold || '--'}</td>
                                        <td>
                                            ${result[i].autoStatus === '0' && `<div class="status-item text-prompt"><i class="status-icon status-icon-online"></i><span class="status-text">审批中</span></div>`
                                || result[i].autoStatus === '1' && `<div class="status-item text-active"><i class="status-icon status-icon-success"></i><span class="status-text">已通过</span></div>`
                                || result[i].autoStatus === '2' && `<div class="status-item text-danger"><i class="status-icon status-icon-error"></i><span class="status-text">已驳回</span></div>` || '--'}
                                        </td>
                                        <td title="${result[i].checkList ? result[i].checkList[0].userName : (result[i].taskApproveList ? result[i].taskApproveList[0].approverName : '--')}">${result[i].checkList ? result[i].checkList[0].userName : (result[i].taskApproveList ? result[i].taskApproveList[0].approverName : '--')}</td>
                                        <td title="${result[i].checkList ? result[i].checkList[0].userId : (result[i].taskApproveList ? result[i].taskApproveList[0].approver : '--')}">${result[i].checkList ? result[i].checkList[0].userId : (result[i].taskApproveList ? result[i].taskApproveList[0].approver : '--')}</td>
                                        <td title="${result[i].runStatus == '1' && `待运行` || result[i].runStatus == '2' && `运行中` || result[i].runStatus == '3' && `已结束` || '--'}">
                                            ${result[i].runStatus == '1' && `待运行` || result[i].runStatus == '2' && `运行中` || result[i].runStatus == '3' && `已结束` || '--'}
                                        </td>
                                    </tr>`
                            $tbody.append(html);
                            $tbody.find("tr").eq(i).data({
                                'listData': result[i]
                            });
                        }

                        if (data.data.total > Number(controlPortData.size) && first) {
                            var pageSizeOpt = [{
                                value: 13,
                                text: '13/页',
                                selected: true
                            }, {
                                value: 18,
                                text: '18/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                $(".table-checkbox-all").removeAttr("checked");
                                createControlTableList($table, '', false, currPage, pageSize);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="12" class="text-center">No matching records found</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="12" class="text-center">No matching records found</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, controlPortData, successFunc);
    }


    /**
     * 数据获取 根据布控任务id 获取布控任务详情 详情弹窗赋值
     * @param {*} $container // 目标容器
     * @param {string} taskId  // 布控任务id
     * @param {string} isEdit  // 布控任务是否可操作 true 不可编辑
     */
    function createControlDetail($targetRow, $container, targetData, isEdit) {
        if (targetData) {
            var result = targetData;
            $container.attr("taskId", result.id);
            var _html = '',
                tempStringObject = {};
            tempStringObject = setArrayToStringObject(result);
            _html = `<div class="card-content-info border-0">
                        <div class="card-item-title">
                        <span class="card-title" title="${result.name.replace(/</g, '&lt;').replace(/>/g, '&gt;') ? result.name.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '暂无'}">${result.name.replace(/</g, '&lt;').replace(/>/g, '&gt;') ? result.name.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '暂无'}</span>
                        </div>
                        <ul class="form-info aui-row form-label-fixed mt-0">
                            <li class="aui-col-7 form-item-box">
                                <div class="form-group">
                                    <label class="aui-form-label">创建人：</label>
                                    <div class="form-text" title="${result.creator ? result.creator : '暂无'} ${result.orgName ? '(' + result.orgName + ')' : ''}">
                                        ${result.creator ? result.creator : '暂无'} ${result.orgName ? '(' + result.orgName + ')' : ''}</div>
                                </div>
                            </li>
                            <li class="aui-col-10 form-item-box">
                                <div class="form-group">
                                    <label class="aui-form-label">布控期限：</label>
                                    <div class="form-text">${(result.startTime ? result.startTime : '暂无') + " 至 " + (result.endTime ? result.endTime : '暂无')}</div>
                                </div>
                            </li>
                            <li class="aui-col-7 form-item-box">
                                <div class="form-group">
                                    <label class="aui-form-label">创建时间：</label>
                                    <div class="form-text">${result.createTime ? result.createTime : '暂无'}</div>
                                </div>
                            </li>
                            <li class="aui-col-7 form-item-box">
                                <div class="form-group">
                                    <label class="aui-form-label">库标签：</label>
                                    <div class="form-text" title="${result.libName ? result.libName : '暂无'}${result.labelName ? ('-' + result.labelName) : ''}">${result.libName ? result.libName : '暂无'}${result.labelName ? ('-' + result.labelName) : ''}</div>
                                </div>
                            </li>
                            <li class="aui-col-10 form-item-box">
                                <div class="form-group">
                                    <label class="aui-form-label">布控原因：</label>
                                    <div class="form-text" title="${result.reason.replace(/</g, '&lt;').replace(/>/g, '&gt;') ? result.reason.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '暂无'}">${result.reason.replace(/</g, '&lt;').replace(/>/g, '&gt;') ? result.reason.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '暂无'}</div>
                                </div>
                            </li>
                            <li class="aui-col-7 form-item-box">
                                <div class="form-group">
                                    <label class="aui-form-label">阈值：</label>
                                    <div class="form-text">${result.threshold ? result.threshold : '0' + '%'}</div>
                                </div>
                            </li>
                            <li class="aui-col-7 form-item-box">
                                <div class="form-group">
                                    <label class="aui-form-label">警情编号：</label>
                                    <div class="form-text">${result.jqbh ? result.jqbh.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '暂无'}</div>
                                </div>
                            </li>
                            <li class="aui-col-10 form-item-box">
                                <div class="form-group">
                                    <label class="aui-form-label">公开范围：</label>
                                    <div class="form-text" title="${tempStringObject.viewString !== '暂无' ? tempStringObject.viewString : tempStringObject.viewUserString}">${tempStringObject.viewString !== '暂无' ? tempStringObject.viewString : tempStringObject.viewUserString}</div>
                                </div>
                            </li>
                            <li class="aui-col-7 form-item-box">
                                <div class="form-group">
                                    <label class="aui-form-label">相关文书：</label>
                                    <div class="form-text">
                                        <a class="text-prompt" style="cursor: pointer;" url="${result.docUrl ? result.docUrl : ''}">${result.docUrl ? '文书下载' : '暂无'}</a>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>`;
            $container.html(_html);
            // 弹框布控对象模块
            $('#controlDetailManage .container-img').find('.text-theme').html(result.libName + (result.labelName ? ('-' + result.labelName) : ''));
            if (result.imgList && result.imgList.length > 0) {
                $('#imgDetailContent .add-image-wrap').empty();
                result.imgList.forEach(function (item, index) {
                    var i = index;
                    var option = {
                        'peopleId': item.peopleId,
                        'libId': item.libId,
                    };
                    loadData('v3/memberInfos/getPeopleInfo', true, option, function (data) {
                        if (data.code === '200') {
                            var resultInfo = data.data;
                            var liHtml = `<li class="add-image-item" peopleId="${item.peopleId}">
                                            <div class="image-checkbox-wrap ${(resultInfo.picStatus == '2' || result.runStatus == 3 || isEdit) ? 'hide' : ''}">
                                                <label class="ui-checkboxradio-checkbox-label ui-checkboxradio-label ui-button ui-widget" style="margin: 0!important; left:0;">
                                                    <span class="ui-checkboxradio-icon  ui-icon ui-icon-background ui-icon-blank"></span>
                                                </label>
                                            </div>
                                            <span class="image-tag danger rotate ${resultInfo.picStatus == '2' ? '' : 'hide'}">已撤控</span>
                                            <img class="add-image-img" alt="" src="${resultInfo.imageUrl ? resultInfo.imageUrl : './assets/images/control/person.png'}">
                                        </li>`;
                            $('#imgDetailContent .add-image-wrap').append(liHtml);
                            $('#imgDetailContent .add-image-wrap').find('.add-image-item.default').addClass('hide');
                        }
                    })
                });
            } else { // 弹框布控库赋值
                getControlManageLibImg($('#imgDetailContent .add-image-wrap'), result, true); // 获取布控图片
            }
        } else {
            $container.empty();
            $('#imgDetailContent').empty();
            warningTip.say('暂无详情，请稍后再试');
        }
    };

    /**
     * 数据获取 获取布控库照片
     * @param {*}  $container  // 目标容器
     * @param {*}  controlData  // 目标容器
     * @param {*}  isFirstPage  // 是否翻页
     * @param {*}  isScrollBottom  // 是否滚动到底部
     * @param {*}  page   // 左侧边栏滚动到底部对应的分页数据
     */
    function getControlManageLibImg($container, controlData, isFirstPage, isScrollBottom, page) {
        showLoading($('#imgDetailContent'));
        // 布控库照片获取
        var port = 'v3/opPersonInfo/searchPersonInfo',
            portData = {
                page: page ? page : '1', // 当前页数
                size: '20', // 每一页个数
                libId: controlData.libId,
                labelId: controlData.labelId ? controlData.labelId : '',
                picStatus: '1',
                random: Math.random()
            },
            successFunc = function (data) {
                hideLoading($('#imgDetailContent'));
                var resultNumb = data.data.total;
                if (data.code == '200') {
                    if (isFirstPage) {
                        $container.empty();
                        $container.scrollTop(0);
                        $('#controlDetailManage .container-img').find('.text-theme').append('(共' + resultNumb + '人)');
                    }
                    var result = data.data.list;
                    var liHtml = '';
                    for (var i = 0; i < result.length; i++) {
                        liHtml += `<li class="add-image-item">
                                        <span class="image-tag danger rotate ${result[i].picStatus == '2' ? '' : 'hide'}">已撤控</span>
                                        <img class="add-image-img" alt="" src="${result[i].picUrl ? result[i].picUrl : './assets/images/control/person.png'}">
                                    </li>`;
                    }
                    if (isScrollBottom) {
                        $container.append(liHtml);
                        $container.data('curPage', page);
                    } else {
                        $container.html(liHtml);
                    }

                    $container.off('mousewheel').on('mousewheel', function () {
                        //tab内容列表滚动到底部进行下一分页的懒加载事件
                        var $this = $(this),
                            $currentContainer = $this,
                            curPage = $currentContainer.data('curPage') === undefined ? 1 : parseInt($currentContainer.data('curPage')),
                            viewHeight = $this.parent().height(), //视口可见高度
                            contentHeight = $currentContainer[0].scrollHeight, //内容高度
                            scrollHeight = $this.parent().scrollTop(), // 已经滚动了的高度
                            currentCardItemNum = $currentContainer.find("li").length,
                            totalCardItemNUM = parseInt(resultNumb);
                        if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM) {
                            getControlManageLibImg($currentContainer, controlData, false, true, curPage + 1);
                        }
                    });
                } else {
                    warningTip.say(data.message);
                    $container.html(`<div class="card-title-box text-center">暂无布控库人员信息</div>`);
                }
            };
        loadData(port, true, portData, successFunc);
    }

    /**
     * 订阅列表生成
     * @param {*} searchData 过滤条件对象
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     */
    function createSubscribeTable(searchData, $table, $pagination, first, page, number) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="7" class="text-center">没有匹配的记录</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v2/subscribe/subPersonList',
            portData = {
                taskId: searchData.id,
                nickname: searchData.nickname,
                page: page ? page : 1,
                size: number ? number : 5,
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
                            var orgListName = '';
                            if (result[i].orgList) {
                                result[i].orgList.forEach((element, index) => {
                                    if (index != result[i].orgList.length - 1) {
                                        orgListName += element.orgName + ',';
                                    } else {
                                        orgListName += element.orgName;
                                    }
                                });
                            } else if (result[i].cameraList) {
                                result[i].cameraList.forEach((element, index) => {
                                    if (index != result[i].cameraList.length - 1) {
                                        orgListName += element.cameraName + ',';
                                    } else {
                                        orgListName += element.cameraName;
                                    }
                                });
                            } else {
                                orgListName = '--';
                            }
                            if (result[i].noticeWay) {
                                var noticeWaysName = '',
                                    noticeWayList = result[i].noticeWay.split(',');
                                for (var j = 0; j < noticeWayList.length; j++) {
                                    noticeWaysData.map(function (el, index) {
                                        if (el.id == noticeWayList[j]) {
                                            if (j == noticeWayList.length - 1) {
                                                noticeWaysName += el.name;
                                            } else {
                                                noticeWaysName += el.name + ',';
                                            }
                                        }
                                    })
                                }
                            } else {
                                noticeWaysName = '--';
                            }

                            html += `<tr data-index="${i}" taskId="${result[i].id}">
                                        <td></td>
                                        <td title="${result[i].nickname ? result[i].nickname + '(' + result[i].userOrgName + ')' : '--'}">${result[i].nickname ? result[i].nickname + '(' + result[i].userOrgName + ')' : '--'}</td>
                                        <td>${result[i].userId || '--'}</td>
                                        <td>${result[i].subTime || '--'}</td>
                                        <td title="${orgListName || '--'}">${orgListName || '--'}</td>
                                        <td>${result[i].threshold || '--'}</td>
                                        <td>${noticeWaysName || '--'}</td>
                                    </tr>`
                            $tbody.append(html);
                            $tbody.find("tr").eq(i).data({
                                'allData': result[i]
                            });
                        }

                        if (data.data.total > Number(portData.size) && first) {
                            var pageSizeOpt = [{
                                value: 5,
                                text: '5/页',
                                selected: true
                            }, {
                                value: 10,
                                text: '10/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                $(".table-checkbox-all").removeAttr("checked");
                                createSubscribeTable(searchData, $table, '', false, currPage, pageSize);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="7" class="text-center">没有匹配的记录</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="7" class="text-center">没有匹配的记录</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, portData, successFunc);
    }

    /**
     * 通知方式类型初始化
     */
    function subscribeTypeLevel() {
        var infoPort = 'v2/dic/dictionaryInfo',
            infoData = {
                "kind": "ALARM_PUSH_TYPE"
            },
            infoPortSuccessFunc = function (data) {
                if (data.code === '200') {
                    noticeWaysData = data.data;
                }
            };
        loadData(infoPort, false, infoData, infoPortSuccessFunc, '', 'GET');
    }

    //初始化
    function initControlConfig() {
        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });
        subscribeTypeLevel();
        createControlTableList($('#AllControlTable'), $('#AllControlPagination'), true);
    };

    //鼠标移入显示气泡
    function showBubble($this, result) {
        var $menu = $([
            `<div class="mouseOverDetail mouseOverTop" style="width:15rem;">
                <div class="aui-timeline">
                </div>
            </div>`
        ].join(''));
        // 审批状态
        if (result && result.length > 0) {
            var appLength = result.length - 1; //taskApproveList 顺序是倒序
            result.forEach(function (item, index) {
                var $liHtml = $([`<div class="aui-timeline-item">
                                    <div class="aui-timeline-item-header clearfix">
                                        <div class="aui-timeline-item-dot"></div>
                                        <div class="aui-timeline-item-title">${result[index].status === 0 && `<span class="status-text text-prompt">进行中</span>`
                    || result[index].status === 1 && `<span class="status-text text-active">已通过</span>`
                    || result[index].status === 2 && `<span class="status-text text-danger">已驳回</span>` || '--'}
                                        </div>
                                    </div>
                                    <div class="aui-timeline-item-wrap">
                                        <div class="aui-timeline-item-content">
                                            <ul class="approverName-text">
                                                <li><label class="aui-form-label">审批人：${result[index].approverName ? result[index].approverName : ''}</label></li>
                                                <li><label class="aui-form-label ${result[index].approvalTime ? '' : 'hide'}">审批时间：${result[index].approvalTime}</label></li>
                                                <li><label class="aui-form-label ${result[index].approvalReason ? '' : 'hide'}" style="word-break:break-all">${result[index].status === 1 && `审批意见`
                    || result[index].status === 2 && `驳回原因` || '--'}：${result[index].approvalReason}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>`].join(''));
                var nameLi = '';
                //$liHtml.find('.approverName-text').append(nameLi);
                $menu.find('.aui-timeline').append($liHtml);
            });
            // 去掉最下面的时间轴线
            $menu.children('.aui-timeline-item:last-child').find('.aui-timeline-item-wrap').remove();
        }
        var menuLen = $('.mouseOverDetail').length;
        if (menuLen > 0) {
            $('.mouseOverDetail').off().remove();
        }
        $('body').append($menu);
        var top = $this.offset().top - $menu.outerHeight() - 20,
            left = $this.offset().left - $menu.outerWidth() / 2 - $this.outerWidth() / 2;
        $menu.css({
            top: top + $(document).scrollTop(),
            left: left + $this.width()
        });
    };


    initControlConfig();

    // 订阅详情 输入框数据检索功能
    $('#subscribeDetailManage').on('keyup', '#subscribeDetailMS', function (evt) {
        if (evt.keyCode === 13) {
            var nickname = $('#subscribeDetailMS').val(),
                targetData = $('#controlManageDetailModal').data('listData'),
                subscribeData = {
                    id: targetData.id,
                    nickname: nickname
                };
            createSubscribeTable(subscribeData, $('#subscribeDetailMT'), $('#subscribeDetailMTPagination'), true);
        }
    }).on('click', '.aui-input-suffix', function () {
        var nickname = $('#subscribeDetailMS').val(),
            targetData = $('#controlManageDetailModal').data('listData'),
            subscribeData = {
                id: targetData.id,
                nickname: nickname
            };
        createSubscribeTable(subscribeData, $('#subscribeDetailMT'), $('#subscribeDetailMTPagination'), true);
    });

    // 搜索按钮点击事件
    $("#searchControlListBut").on("click", function () {
        controlPortData.keywords = $("#keywordsVal").val();
        controlPortData.createUser = $("#userIdCM").val();
        controlPortData.createTime = $("#startTimeCM").val();
        controlPortData.endCreateTime = $("#endTimeCM").val();
        controlPortData.runStatus = $("#controlManage").find("input[name='taskStatusManage']:checked").val();

        createControlTableList($('#AllControlTable'), $('#AllControlPagination'), true);
    });

    // 布控详情 布控对象小图 hover 显示中图
    $('#controlManageDetailModal').on('mouseover', '.add-image-img', function () {
        var $this = $(this),
            thisData = $this.data('listData'),
            imgSrc = $this.attr('src'),
            top = $this.offset().top - 2,
            left = $this.offset().left + $this.outerWidth() + 4,
            html = `<div class="card-img-hover card-img-hover-control-detail">
                        <img src="${imgSrc}" alt="">
                    </div>`;
        controlImgHoverTimer = window.setTimeout(function () {
            $this.closest('#controlManageDetailModal').append(html);
            var docH = document.documentElement.clientHeight,
                $imgHover = $this.closest('#controlManageDetailModal').find('.card-img-hover'),
                hoverImgH = $imgHover.outerHeight();
            if ($this.offset().top + hoverImgH > docH) {
                $imgHover.css({
                    top: $this.offset().top + $this.outerHeight() - hoverImgH,
                    left: left
                })
            } else {
                $imgHover.css({
                    top: top,
                    left: left
                })
            }
        }, 100);
    }).on('mouseout', '.add-image-img', function () { // 图片区域 hover显示中图之后 鼠标离开图片
        $(this).closest('#controlManageDetailModal').find('.card-img-hover').remove();
        window.clearTimeout(controlImgHoverTimer);
    });

    // 布控详情 相关文书点击事件
    $('#controlDetailContent').on('click', '.form-group .text-prompt', function () {
        if ($(this).text() !== '暂无') {
            var url = $(this).attr("url");
            var post_url = serviceUrl + '/v2/file/downloadByHttpUrl?url=' + url;
            if ($("#IframeReportImg").length === 0) {
                $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
            }
            $('#IframeReportImg').attr("src", post_url);
        }
    })

    // 详情点击事件
    $("#AllControlTable").on("click", ".librow", function () {
        // 表格列表点击详情按钮展开详情内容
        var $targetRow = $(this),
            targetData = $targetRow.data('listData'),
            subscribeData = {
                id: targetData.id,
                nickname: ''
            };
        $('#controlDetailMHeader').find('.nav-link').eq(0).click();
        $('#subscribeDetailMS').val('');
        createControlDetail($targetRow, $('#controlDetailContent'), targetData, false); // 布控详情
        createSubscribeTable(subscribeData, $('#subscribeDetailMT'), $('#subscribeDetailMTPagination'), true); // 订阅详情
        $('#controlManageDetailModal').modal('show');
        $('#controlManageDetailModal').data('listData', targetData);
    }).on("mouseover", ".status-item", function (event) { //鼠标移入显示气泡事件
        event.stopPropagation();
        event.preventDefault();
        var $this = $(this),
            $targetRow = $this.closest('.librow'),
            targetData = $targetRow.data().listData;
        showBubble($this, targetData.taskApproveList);
        $this.off("mouseout").on("mouseout", function (event) { // 布控详情 单击事件入口
            event.stopPropagation();
            event.preventDefault();
            $('.mouseOverDetail').remove();
        });
    });

})(window, window.jQuery);