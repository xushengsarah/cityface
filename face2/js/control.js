(function (window, $) {
    //检索条件
    var controlSearchData = {
        taskId: '',
        runStatus: 4, //布控任务状态
        type: '', //布控任务类型
        keywords: '',
        startTime: '',
        endTime: '',
        orgIds: [], //机构数组
        viewType: 1,
        autoStatus: '', // 任务状态：0-审批中；1-已通过；2-已驳回
        myApprove: '', // 我的审批：1-我发起的2-待我审批3-我已审批
        page: '1',
        size: '20',
    },
        // 告警请求参数
        controlAlarmData = {
            taskId: '',
            page: '1',
            size: '20',
            startTime: '',
            endTime: '',
            viewType: 1,
            showType: 1,
            status: 0,
            random: Math.random()
        },
        targetControlTaskId = '',
        targetControlImgList = '',
        $alarmTargetDom = null,
        userLoginName = '', // 用户名字
        control_bodyList = '', // 订阅区域列表模式 获取数据
        noticeWaysData = '';
    var timeControlItemClick, //防止双击触发单击事件
        timeTreeItemClick, //防止双击触发单击事件右侧树
        controlImgHoverTimer; // 鼠标经过延时
    var rightHandTag = false;
    var mouseOverTaskId = '';
    var firstAskModel = false;

    $('[data-role="radio"]').checkboxradio();
    $('[data-role="radio-button"]').checkboxradio({
        icon: false
    });

    var subscribePortData = {
        id: '',
        name: '',
        runStatus: 2,
        subStatus: '',
        startTime: '',
        endTime: '',
        libId: ''
    };

    /**
     * 根据默认初始值查询布控信息列表；默认数据展示信息
     */
    function initControlSearch() {
        var index = $('#pageSidebarMenu').find('.aui-icon-monitor2').closest('.sidebar-item').index();
        if ($('#controlDetailPage').data('hasInitDetailPage') ||
            $("#content-box .content-save-item").eq(index).data('hasInitDetailPage')) {
            resetSearchConditions(); // 重置获取数据的过滤条件
        }
        controlSearchData.taskId = $('#content-box').data('taskId'); // 管理者登陆 获取绑定的任务ID
        // loadDictionaryInfo($("#controlTypeCondition .text-content"), $("#controlGradeCondition .text-content")); // 加载布控任务类型和布控任务等级
        loadOrgInfo($("#createOrgCondition .text-content")); // 加载布控机构列表
        loadSubscribeLib($("#subscribeLibCondition .text-content")); // 加载人像库列表

        loadControlSearchList($("#controlTabContent .tab-container")); // 加载左侧我的布控列表

        $('#controlTabContent .tab-container').data('curPage', 1); // 绑定页码

        window.initDatePicker1($('#peopleAlarm_Time'), -15, false, true, false, false); // 初始化日历组件 设置默认时间
        // window.initDatePicker1($('#customControl_time'), '', false); // 时间弹窗 初始化日历组件
        window.initDatePicker1($('#filterControl_time'), '', false); // 时间弹窗 初始化日历组件

        subscribeSlider(90, false); // 订阅阈值初始化
        subscribeTypeLevel(); // 订阅通知方式初始化
        // 左侧机构树加载
        initControlTree($('#subscribeTabContent'), subscribePortData);
        getControlUsePower($('#pageSidebarMenu').find('.aui-icon-monitor2').closest('.sidebar-item').attr("id"));

        if (!firstAskModel) {
            //默认第一次进入弹窗
            $("#alarmAskModal").modal("show");
            firstAskModel = true;
        }
    };
    initControlSearch(); //页面初始化

    /**
     * 数据获取 获取登录人的信息
     */
    function loadUserInfo() {
        var port = 'v2/user/getUserInfo',
            successFunc = function (data) {
                if (data.code === '200') {
                    userLoginName = data.userId;
                }
            };
        loadData(port, true, null, successFunc, '', 'GET');
    }
    loadUserInfo();

    /**
     * 数据获取 获取布控任务查询列表的信息 生成左侧内容节点
     * @param {*}  $container  // 目标容器
     * @param {*}  isScrollBottom  // 左侧边栏是否滚动到底部
     * @param {*}  page   // 左侧边栏滚动到底部对应的分页数据
     */
    function loadControlSearchList($container, isScrollBottom, page) {
        if (!isScrollBottom) {
            showLoading($('#current-page-control .side-left'));
        } else {
            $container.next().removeClass("display-none");
        }
        var port = 'v3/distributeManager/distributeTaskList',
            successFunc = function (data) {
                if (!isScrollBottom) {
                    hideLoading($('#current-page-control .side-left'));
                } else {
                    $container.next().addClass("display-none");
                }
                if (data.code == '200') {
                    var result = data.data.list,
                        currentPage = parseInt(controlSearchData.page);
                    if (result && result.length > 0 && currentPage <= data.data.totalPage) {
                        var _html = '';
                        for (var i = 0; i < result.length; i++) {
                            var tempString = '';
                            if (result[i].runStatus === 1) {
                                tempString = `<span class="card-extra text-prompt aui-col-8" title="待开始">待开始</span>`;
                            } else if (result[i].runStatus === 3) {
                                tempString = `<span class="card-extra card-extra-gray text-lighter aui-col-8" title="已结束">已结束</span>`;
                            } else if (result[i].runStatus === 2) {
                                tempString = `<span class="card-extra text-active aui-col-8" title="剩余${result[i].surplusDay}天">剩余${result[i].surplusDay}天</span>`;
                            }
                            _html += `<li class="clearfix card-item ${i === 0 && !isScrollBottom ? 'active' : ''}" taskId="${result[i].id}">
								<div class="card-item-img float-left h-100">
									<div class="img-red-circle hide"></div>
									<img class="w-100" src="./assets/images/control/bukong-
									${(result[i].type === 'ZDSJ' || result[i].type === 'XLBK' || result[i].type === 'YFAB') ? result[i].type : 'CGBK'}
									-2.png" alt="">
									<span class="alarmNum w-100 aui-mt-sm text-prompt">${result[i].alarmCount && result[i].alarmCount !== '0' ? '共' + result[i].alarmCount : 0}</span>								
								</div>
								<ul class="card-item-text float-left">
									<li class="card-info-title">
										<span class="card-title text-overflow">${result[i].name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
										<div class="card-tag ${(result[i].autoStatus == '0' || result[i].autoStatus == '1' || result[i].autoStatus == '2') ? '' : 'hide'}">
											<span class="tag grade${result[i].autoStatus == '0' && '2' || result[i].autoStatus == '1' && '3' || result[i].autoStatus == '2' && '1'}">${result[i].autoStatus == '0' && '待审批' || result[i].autoStatus == '1' && '已审批' || result[i].autoStatus == '2' && '已驳回'}</span>
										</div>
									</li>
									<li class="form-group">
										<label class="aui-form-label">布控对象：</label>
										<div class="form-text form-words">${result[i].imgList && result[i].imgList.length > 0 ? '共' + (result[i].imgList ? result[i].imgList.length : '0') + '个人'
                                    : '共' + (result[i].libId ? '1' : '0') + '个库'}</div>
									</li>
									<li class="form-group">
										<label class="aui-form-label">创建人：</label>
										<div class="form-text form-words text-overflow" title="${result[i].creator ? result[i].creator : '暂无' + (result[i].orgName ? '(' + result[i].orgName + ')' : '')}">
										${(result[i].creator ? result[i].creator : '暂无') + (result[i].orgName ? '(' + result[i].orgName + ')' : '')}</div>
									</li>
									<li class="form-group">
										<label class="aui-form-label">布控期限：</label>
										<div class="form-text form-words task-card-creattime-overflow aui-row">
											<span class="aui-col-16" title="${result[i].startTime ? (result[i].startTime.split(" ")[0] + " 至 " + result[i].endTime.split(" ")[0]) : '暂无'}">${result[i].startTime ? (result[i].startTime.split(" ")[0] + " 至 " + result[i].endTime.split(" ")[0]) : '暂无'}</span>
											${tempString}
										</div>
									</li>
								</ul>
							</li>`;
                        }
                        var resultTotal = $container.data("allData") === undefined ? [] : $container.data("allData");
                        $container.data("allData", [...resultTotal, ...result]);

                        if (isScrollBottom) {
                            $container.append(_html);
                            $container.data('curPage', page);
                            controlSearchData.page = page;
                            $container.find('.card-item').each(function (index, el) {
                                $(el).data({
                                    'listData': $container.data("allData")[index]
                                });
                            });
                        } else {
                            $container.html(_html);
                            // 左侧列表数据绑定
                            $container.find('.card-item').each(function (index, el) {
                                $(el).data({
                                    'listData': result[index]
                                });
                            });

                            targetControlTaskId = result[0].id; // 当前任务ID
                            if (controlSearchData.runStatus !== 1) { //待运行状态下 不会有告警信息
                                targetControlImgList = result[0].imgList;
                                loadControlAlarmList($('#controlPeopleImgList .showBigImg'), targetControlTaskId, targetControlImgList);
                            } else {
                                $('#controlPeopleImgList .showBigImg').empty();
                                loadEmpty($('#controlPeopleImgList .showBigImg'), "当前暂无告警信息", "", true);
                                $("#alarmCountNum").text('0');
                            }
                            $("#controlTabContent").scrollTop(0);
                        }
                        // 获取布控列表的告警总数 第一个布控任务不查询 告警列表会回传总数
                        $container.find('.card-item').each(function (index, item) {
                            var taskId = $(item).attr('taskid');
                            loadData('v2/bkAlarm/alarmCountByTaskId', true, {
                                taskId: taskId,
                                status: '',
                                randomNum: Math.random()
                            }, function (data) {
                                if (data.code === '200') {
                                    if (data.count > 10000) {
                                        var num = Math.round(data.count / 1000) / 10 + '万';
                                        $(item).find('.card-item-img .alarmNum').text(num);
                                    } else {
                                        $(item).find('.card-item-img .alarmNum').text(data.count || '0');
                                    }
                                }
                            });
                        });
                        $("#controlContentContainer").removeClass('display-none');

                        $('#myControlHeader').find('.control-total').text(data.data.total);
                        // 初始化任务列表，所有的页面红点清空
                        $('#controlTabContent').find('.img-red-circle').addClass('hide');
                    } else {
                        if (isScrollBottom) {
                            return;
                        } else {
                            loadEmpty($container, "无布控数据", " ");
                            $("#controlContentContainer").addClass('display-none');
                            $('#myControlHeader').find('.control-total').text('0');
                        }
                    }
                } else {
                    loadEmpty($container, "无布控数据", "系统异常");
                    $('#myControlHeader').find('.control-total').text('0');
                }
            };

        if (page) {
            controlSearchData.page = page;
        }
        loadData(port, true, controlSearchData, successFunc);
    };

    /**
     * 数据获取 根据布控任务id 获取布控任务详情 详情弹窗赋值
     * @param {*} $container // 目标容器
     * @param {string} taskId  // 布控任务id
     * @param {string} isEdit  // 布控任务是否可操作 true 不可编辑
     */
    function loadControlTaskDetail($container, taskId, isEdit) {
        showLoading($('#controlItemDetailModal').find('.modal-body'));
        var port = 'v3/distributeManager/distributeTaskList',
            data = {
                taskId: taskId,
                viewType: 5,
                page: '1',
                size: '10'
            },
            successFunc = function (data) {
                hideLoading($('#controlItemDetailModal').find('.modal-body'));
                if (data.code == '200') {
                    if (data.data.list && data.data.list.length > 0) {
                        var result = data.data.list[0];
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
                        $container.data({
                            'result': result
                        });
                        // 布控对象模块
                        $('#controlDetail .container-img').find('.text-theme').html(result.libName + (result.labelName ? ('-' + result.labelName) : ''));
                        if (result.autoStatus == '0' || result.autoStatus == '2') { // 进行中任务才能指定订阅
                            $('#designateSubscribe').addClass('disabled');
                        } else {
                            $('#designateSubscribe').removeClass('disabled');
                        }
                        if (result.imgList && result.imgList.length > 0) { // 临时布控照片
                            $('#controlImgBk .add-image-wrap').empty();
                            if (result.runStatus === 2 || result.runStatus === 1) { // 进行中 待运行
                                $('#revocationAllControl').removeClass('hide');
                                $('#newSetControl').addClass('hide');
                                $('#designateSubscribe').removeClass('hide');
                                $("#removeControl").removeClass("disabled").data("result", result);
                            } else {
                                $('#revocationAllControl').addClass('hide');
                                $('#newSetControl').removeClass('hide');
                                $('#designateSubscribe').addClass('hide');
                                $("#removeControl").addClass("disabled");
                            }
                            $('#revocationLibControl').addClass('hide');
                            $('#revocationControl').removeClass('hide');
                            $('#revocationControl').addClass('disabled');
                            result.imgList.forEach(function (item, index) {
                                var i = index;
                                var option = {
                                    'peopleId': item.peopleId,
                                    'libId': item.libId,
                                    // 'ajaxFilter': 'getPeopleInfo' + index,
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
                                        $('#controlImgBk .add-image-wrap').append(liHtml);
                                        $('#controlImgBk .add-image-wrap').find('.add-image-item.default').addClass('hide');
                                        if ($("#controlImgBk .add-image-wrap").find(".add-image-item").length == result.imgList.length) {
                                            if ($("#controlImgBk .add-image-wrap").find(".image-tag").not(".hide").length == result.imgList.length) { //图片全部都是已撤控，就把已撤控和撤控按钮禁止
                                                $("#revocationAllControl").addClass("disabled");
                                                $("#revocationControl").addClass("disabled");
                                            }
                                        }
                                    }
                                })
                            });
                        } else { // 库布控照片
                            // 操作按钮初始化
                            if (result.runStatus === 2 || result.runStatus === 1) { // 进行中 待运行
                                $('#newSetControl').addClass('hide');
                                $('#designateSubscribe').removeClass('hide');
                                $('#revocationLibControl').removeClass('hide');
                                $("#removeControl").removeClass("disabled").data("result", result);
                            } else {
                                $('#newSetControl').removeClass('hide');
                                $('#designateSubscribe').addClass('hide');
                                $('#revocationLibControl').addClass('hide');
                                $("#removeControl").addClass("disabled");
                            }
                            $('#revocationAllControl').addClass('hide');
                            $('#revocationControl').addClass('hide');
                            getControlLibImg($('#controlImgBk .add-image-wrap'), result, true);
                        }
                    } else {
                        $container.empty();
                        $('#controlImgBk .add-image-wrap').empty();
                        warningTip.say('暂无详情，请稍后再试');
                    }
                } else {
                    $container.empty();
                    $('#controlImgBk .add-image-wrap').empty();
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, data, successFunc);
    };

    /**
     * 数据获取 获取布控库照片
     * @param {*}  $container  // 目标容器
     * @param {*}  controlData  // 目标容器
     * @param {*}  isFirstPage  // 是否滚动到底部
     * @param {*}  isScrollBottom  // 是否滚动到底部
     * @param {*}  page   // 左侧边栏滚动到底部对应的分页数据
     */
    function getControlLibImg($container, controlData, isFirstPage, isScrollBottom, page) {
        showLoading($('#controlImgBk'));
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
                hideLoading($('#controlImgBk'));
                var resultNumb = data.data.total;
                if (data.code == '200') {
                    if (isFirstPage) {
                        $container.empty();
                        $container.scrollTop(0);
                        $('#controlDetail .container-img').find('.text-theme').append('(共' + resultNumb + '人)');
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
                            getControlLibImg($currentContainer, controlData, false, true, curPage + 1);
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
    function createSubscribeList(searchData, $table, $pagination, first, page, number) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="7" class="text-center">没有匹配的记录</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v2/subscribe/subPersonList',
            portData = {
                taskId: searchData.taskId,
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
                                createSubscribeList(searchData, $table, '', false, currPage, pageSize);
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
     * 数据获取 根据布控人或库 获取告警人列表信息
     * @param {*} $container  // 目标容器
     * @param {string} taskId  // 布控任务id
     * @param {*} imgList // 按人布控人员列表
     * @param {*} loadSuccessCallback  //为true是滚动中
     * @param {*} currentPage  //滚动时的page
     */
    function loadControlAlarmList($container, taskId, imgList, loadSuccessCallback, currentPage) {
        if (!loadSuccessCallback) {
            $("#controlPeopleImgList .showBigImg").html("");
            createMapFn([], 'map_iframe_alarm');
        }
        var startTime = $('#peopleAlarmStartTime').val();
        var endTime = $('#peopleAlarmEndTime').val();
        $container.empty();
        // if (imgList) { // 按人布控展示形式
        // if (!loadSuccessCallback) {
        // 	$("#alarmCountNum").text(imgList.length);
        // }
        // if (imgList && imgList.length > 0) {
        // 	imgList.forEach(function (item, index) {
        // 		var option = {
        // 			'libId': item.libId,
        // 			'peopleId': item.peopleId
        // 		},
        // 			successFunc = function (data) {
        // 				hideLoading($container);
        // 				if (data.code == '200') {
        // 					var result = data.data;
        // 					var $imgHtml = $([`<li class="imgBase-card-wrap" peopleId="${item.peopleId}">
        // 									<div class="image-card-box img-right-event" style="width: 100%;">
        // 										<span class="image-tag danger">0</span>
        // 										<span class="image-card-mask"></span>
        // 										<img class="image-card-img" src="${result ? (result.imageUrl ? result.imageUrl : './assets/images/control/person.png') : './assets/images/control/person.png'}">
        // 									</div>
        // 								</li>`].join(''));
        // 					// 获取该人员的告警信息
        // 					var portData = {
        // 						peopleId: item.peopleId,
        // 						viewType: 1,
        // 						endTime: endTime,
        // 						startTime: startTime,
        // 						page: "1",
        // 						size: "60",
        // 					};
        // 					(function ($imgHtml) {
        // 						window.loadData('v2/bkAlarm/alarmsByPersonId', true, portData, function (data) { //查询每一个对象的布控列表
        // 							if (data.code == '200') {
        // 								var peopleAlarmList = data.data.list;
        // 								$imgHtml.data('listData', peopleAlarmList); // 告警详情
        // 								$imgHtml.find('.image-tag').html(data.data.total); // 告警个数
        // 								$container.append($imgHtml);
        // 							} else {
        // 								warningTip.say(data.message);
        // 							}
        // 						});
        // 					})($imgHtml);
        // 				} else {
        // 					warningTip.say(data.message);
        // 				}
        // 			};
        // 		loadData('v3/memberInfos/getPeopleInfo', true, option, successFunc)
        // 	});
        // } else {
        // 	hideLoading($container);
        // 	loadEmpty($container, false, "请选择布控人员", false);
        // }
        // } else { // 按库布控展示形式
        showLoading($("#controlPeopleImgList"));
        var port = 'v2/bkAlarm/alarmList',
            successFunc = function (data) {
                hideLoading($("#controlPeopleImgList"));
                $container.empty();
                if (data.code == '200') {
                    var result = data.data.list;
                    var randomData = Math.random();
                    $container.attr("value", randomData);
                    var $staticBox = $('#controlPeopleImgList');
                    if (result && result.length > 0) {
                        $('#mapIframeContainer').css({
                            height: 'calc(100% - 8rem)'
                        })
                        $staticBox.css({
                            height: '8rem',
                        });
                        $('#alarmPeopleFlex').css({
                            top: '8rem'
                        }).find('i').css({
                            transform: 'rotate(-180deg)'
                        });
                    } else {
                        $('#mapIframeContainer').css({
                            height: '100%'
                        })
                        $staticBox.css({
                            height: '0',
                        });
                        $('#alarmPeopleFlex').css({
                            top: '0'
                        }).find('i').css({
                            transform: 'rotate(0)'
                        });
                    }

                    $('#pathLoading').addClass('hide');
                    if (result && result.length > 0) {
                        $('#controlPeopleImgList').find('.card-title-num-but').data('taskId', taskId);
                        $('#controlPeopleImgList').find('.card-title-num-but button').removeAttr('disabled');
                        if (result.length < 20) {
                            $('#alarmCountNum').text('top' + result.length);
                        } else {
                            $('#alarmCountNum').text('top20');
                        }
                        var _html = '';
                        for (let i = 0; i < result.length; i++) {
                            var alarmStatusString = '';
                            _html = $([`<li class="imgBase-card-wrap" alarmId="${result[i].peopleId}">
												<div class="image-card-box img-right-event" style="width: 100%;">
													<span class="image-tag danger">0</span>
													<img class="image-card-img" src="${result[i].url ? result[i].url : './assets/images/control/person.png'}">
												</div>
											</li>`].join(''));
                            // 获取该人员的告警信息
                            var portData = {
                                taskId: taskId,
                                peopleId: result[i].peopleId,
                                viewType: 1,
                                endTime: endTime,
                                startTime: startTime,
                                page: "1",
                                size: "100",
                            };
                            (function (_html, randomData) {
                                window.loadData('v2/bkAlarm/alarmsByPersonId', true, portData, function (data) { //查询每一个对象的布控列表
                                    if (data.code == '200') {
                                        hideLoading($("#controlPeopleImgList"));
                                        _html.find(".image-tag").html(data.data.total);
                                        _html.data('listData', data.data.list);
                                        if ($container.attr("value") == randomData) {
                                            $container.append(_html);
                                        }
                                    } else {
                                        warningTip.say(data.message);
                                    }
                                });
                            })(_html, randomData);
                        }
                        $container.data('listPage', data.data.totalPage); //保存总页数在左侧人员列表滚动时判断
                        //<img class="case-img float-left img-right-event" peopleId="${result[i].peopleId}" src="${result[i].url ? result[i].url : './assets/images/control/person.png'}" alt="">
                        //$container.find('.image-tag').html(result[i].total); // 告警个数

                        $("#alarmOuterContainer").removeClass("display-none");
                    } else {
                        $('#controlPeopleImgList').find('.card-title-num-but').data('taskId', '');
                        $('#controlPeopleImgList').find('.card-title-num-but button').attr('disabled', 'disabled');
                        $('#alarmCountNum').text('0');
                        hideLoading($("#controlPeopleImgList"));
                        $("#alarmOuterContainer").removeClass("display-none");
                        $container.html(`<div class="card-title-box text-center">暂无布控人员告警信息</div>`);
                    }
                } else {
                    hideLoading($("#controlPeopleImgList"));
                    warningTip.say(data.message);
                    $container.html(`<div class="card-title-box text-center">暂无布控人员告警信息</div>`);
                }
            };
        controlAlarmData.taskId = taskId;
        controlAlarmData.viewType = 1;
        if (loadSuccessCallback) { //代表是滚动中
            controlAlarmData.page = currentPage;
        } else {
            controlAlarmData.page = 1;
            controlAlarmData.startTime = startTime;
            controlAlarmData.endTime = endTime;
        }
        loadData(port, true, controlAlarmData, successFunc);
        // }
    };

    /**
     * 数据获取 布控任务筛选 加载布控机构的列表
     * @param {*} $container // 目标容器
     */
    function loadOrgInfo($container) {
        var port = 'v2/org/getOrgInfos',
            data = {
                orgType: 1,
                userType: 2,
                returnType: 3,
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    var result = data.data;
                    if (result) {
                        var _itemHtml = '';
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].orgId !== '10') {
                                _itemHtml += `<span class="text text-btn" orgId="${result[i].orgId}">${result[i].orgName}</span>`
                            }
                        }
                        $container.html(_itemHtml);
                    }
                } else {
                    warning.say(data.msg);
                }
            };
        loadData(port, true, data, successFunc, '', 'GET');
    }

    /**
     * 数据获取 布控任务筛选 加载布控库的库列表
     * @param {*} $container // 目标容器
     */
    function loadSubscribeLib($container) {
        var port = 'v3/lib/allLibs',
            data = {
                type: 2
            },
            successFunc = function (data) {
                if (data.code === '200') {
                    var result = data.data;
                    if (result) {
                        var _itemHtml = '';
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].type == 2) {
                                _itemHtml += `<span class="text text-btn" libId="${result[i].libId}">${result[i].libName}</span>`
                            }
                        }
                        $("#subscribeLibCondition .text-content").html(_itemHtml);
                        $("#controlLibCondition .text-content").html(_itemHtml);
                    }
                } else {
                    warning.say(data.msg);
                }
            };
        loadData(port, true, data, successFunc, undefined, 'GET');
    }

    /**
     * 布控任务筛选 搜索布控更多过滤条件的选择，并将相应数据传递给后台需要的参数
     * @param {object} $itemDom  搜索过滤条件的目标节点
     * @param {number} index  搜索过滤条件类别的index；
     * 						  0 为布控类型过滤；1 为布控时间过滤； 2 为布控任务等级过滤; 3 为创建机构过滤；
     * 					      4 为布控区域过滤；5 为布控库过滤
     */
    function setSearchMoreCondition($itemDom, index) {
        switch (index) {
            case 0: // 布控任务状态，暂缺后台接口
                switch ($itemDom.text()) {
                    case "全部":
                        controlSearchData.autoStatus = null;
                        break;
                    case "审批中":
                        controlSearchData.autoStatus = 0; //待运行
                        break;
                    case "已通过":
                        controlSearchData.autoStatus = 1; //进行中
                        break;
                    case "已驳回":
                        controlSearchData.autoStatus = 2; //已结束运行
                        break;
                }
                break;
            case 1: // 布控任务状态
                switch ($itemDom.text()) {
                    case "全部":
                        controlSearchData.runStatus = null;
                        break;
                    case "待开始":
                        controlSearchData.runStatus = 1; //待运行
                        break;
                    case "进行中":
                        controlSearchData.runStatus = 2; //进行中
                        break;
                    case "已结束":
                        controlSearchData.runStatus = 3; //已结束运行
                        break;
                }
                break;
            case 2: // 布控时间
                switch ($itemDom.text()) {
                    case "全部":
                        controlSearchData.startTime = "";
                        controlSearchData.endTime = "";
                        break;
                    case "近一周":
                        controlSearchData.startTime = sureSelectTime(-7).date;
                        controlSearchData.endTime = sureSelectTime(-7).now;
                        break;
                    case "近一个月":
                        controlSearchData.startTime = sureSelectTime(-30).date;
                        controlSearchData.endTime = sureSelectTime(-30).now;
                        break;
                    case "近三个月":
                        controlSearchData.startTime = sureSelectTime(-30 * 3).date;
                        controlSearchData.endTime = sureSelectTime(-30 * 3).now;
                        break;
                    case "近一年":
                        controlSearchData.startTime = sureSelectTime(-365).date;
                        controlSearchData.endTime = sureSelectTime(-365).now;
                        break;
                }
                break;
            case 3: // 创建机构
                controlSearchData.orgIds = [];
                switch ($itemDom.text()) {
                    case "全部":
                        controlSearchData.orgIds = [];
                        break;
                    default:
                        controlSearchData.orgIds.push($itemDom.attr("orgId"));
                        break;
                }
                break;
            case 4: // 布控库
                controlSearchData.libIds = [];
                switch ($itemDom.text()) {
                    case "全部":
                        controlSearchData.libIds = [];
                        break;
                    default:
                        controlSearchData.libIds.push($itemDom.attr("libId"));
                        break;
                }
                break;
            case 12: // 布控类型，暂缺后台接口
                switch ($itemDom.text()) {
                    case "全部":
                        controlSearchData.type = "";
                        break;
                    default:
                        controlSearchData.type = $itemDom.attr("typeId");
                        break;
                }
                break;
            case 13: // 布控任务等级
                switch ($itemDom.text()) {
                    case "全部":
                        controlSearchData.grade = "";
                        break;
                    default:
                        controlSearchData.grade = $itemDom.attr("gradeId");
                        break;
                }
                break;
        }
    }

    /**
     * 布控任务筛选 搜索布控更多过滤条件的选择，并将相应数据传递给后台需要的参数
     * @param {object} $itemDom  搜索过滤条件的目标节点
     * @param {number} index  搜索过滤条件类别的index；
     * 						  0 为布控类型过滤；1 为布控时间过滤； 2 为布控任务等级过滤; 3 为创建机构过滤；
     * 					      4 为布控区域过滤；5 为布控库过滤
     */
    function setSubscribeMoreCondition($itemDom, index) {
        switch (index) {
            case 0: // 布控任务状态，暂缺后台接口
                switch ($itemDom.text()) {
                    case "全部":
                        subscribePortData.runStatus = null;
                        break;
                    case "待开始":
                        subscribePortData.runStatus = 1; //待运行
                        break;
                    case "进行中":
                        subscribePortData.runStatus = 2; //进行中
                        break;
                    case "已结束":
                        subscribePortData.runStatus = 3; //已结束运行
                        break;
                }
                break;
            case 1: // 布控类型，暂缺后台接口
                switch ($itemDom.text()) {
                    case "全部":
                        subscribePortData.subStatus = "";
                        break;
                    case "已订阅":
                        subscribePortData.subStatus = 1;
                        break;
                    case "未订阅":
                        subscribePortData.subStatus = 2;
                        break;
                }
                break;
            case 2: // 布控时间
                switch ($itemDom.text()) {
                    case "全部":
                        subscribePortData.startTime = "";
                        subscribePortData.endTime = "";
                        break;
                    case "近一周":
                        subscribePortData.startTime = sureSelectTime(-7).date;
                        subscribePortData.endTime = sureSelectTime(-7).now;
                        break;
                    case "近一个月":
                        subscribePortData.startTime = sureSelectTime(-30).date;
                        subscribePortData.endTime = sureSelectTime(-30).now;
                        break;
                    case "近三个月":
                        subscribePortData.startTime = sureSelectTime(-30 * 3).date;
                        subscribePortData.endTime = sureSelectTime(-30 * 3).now;
                        break;
                    case "近一年":
                        subscribePortData.startTime = sureSelectTime(-365).date;
                        subscribePortData.endTime = sureSelectTime(-365).now;
                        break;
                }
                break;
            case 3: // 人像库
                switch ($itemDom.text()) {
                    case "全部":
                        subscribePortData.libId = "";
                        break;
                    default:
                        subscribePortData.libId = $itemDom.attr("libId");
                        break;
                }
                break;
        }
    }

    // //布控任务列表(左侧列表) 列表项相关的事件处理
    // $("#controlPeopleImgList").on('mousewheel', function () {
    // 	//tab内容列表滚动到底部进行下一分页的懒加载事件
    // 	var $this = $(this),
    // 		$currentContainer = $("#controlPeopleImgList"),
    // 		viewHeight = $this.height(), //视口可见高度
    // 		contentHeight = $currentContainer[0].scrollHeight, //内容高度
    // 		scrollHeight = $this.scrollTop(), // 已经滚动了的高度
    // 		currentPage = parseInt(controlAlarmData.page),
    // 		currentCardItemNum = $currentContainer.find(".imgBase-card-wrap").length,
    // 		totalCardItemNUM = parseInt($('#alarmCountNum').text()),
    // 		// targetControlTaskId = $("#controlTabContent .tab-pane.active").find(".clearfix.card-item.active").attr("taskId"),
    // 		// targetControlImgList = $("#controlTabContent .tab-pane.active").find(".clearfix.card-item.active").data("listData").imgList,
    // 		//布控左侧人员列表总分页数
    // 		listPage = $('#controlPeopleImgList .showBigImg').data("listPage") ? parseInt($('#controlPeopleImgList .showBigImg').data("listPage")) : 1;
    // 	if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM && listPage > controlAlarmData.page) {
    // 		loadControlAlarmList($('#controlPeopleImgList .showBigImg'), targetControlTaskId, targetControlImgList, true, currentPage + 1);
    // 	}
    // });

    /**
     * 加载告警需要的地图
     */
    function loadAlarmMap(iscluster, clusterData, locationData) {
        var iframe = document.getElementById('map_iframe_alarm');
        var targetOrigin = 'http://190.168.17.2:6081/peopleCity.html',
            mapData = {},
            mapOperationData = {};
        if (iscluster && clusterData && clusterData.length) {
            mapData = {
                type: "cluster",
                mydata: clusterData
            }
        } else if (locationData && locationData.length) {
            mapData = {
                type: "locationTo",
                mydata: locationData
            }
        }
        mapOperationData = {
            type: "controlVisible",
            mydata: [{
                name: 'zoom',
                b: false
            }, {
                name: 'tools',
                b: false
            }, {
                name: 'search',
                b: false
            }, {
                name: 'fullExtent',
                b: false
            }]
        }
        if (mapData && iframe) {
            iframe.contentWindow.postMessage(mapData, targetOrigin);
            iframe.contentWindow.postMessage(mapOperationData, targetOrigin);
        }
    }

    /**
     * 跳转到布控详情页面 重置过滤条件的状态和检索数据参数
     */
    function resetSearchConditions() {
        var $searchConditionDoms = $('#searchMoreConditions .text-content');
        $searchConditionDoms.each(function (index, el) {
            $(this).find('.text-link').removeClass('text-link');
            $(this).prev().removeClass('text-link'); //是否选中 全部 过滤条件这个选项
        });
        var $subscribeConditionDoms = $('#subscribeMoreConditions .text-content');
        $subscribeConditionDoms.each(function (index, el) {
            if (index == 0) {
                $(this).find('.text-link').removeClass('text-link');
                $(this).find('.text').eq(1).addClass('text-link');
                $(this).prev().removeClass('text-link'); //是否选中 全部 过滤条件这个选项
            } else {
                $(this).find('.text-link').removeClass('text-link');
                $(this).prev().addClass('text-link'); //是否选中 全部 过滤条件这个选项
            }
        });
        controlSearchData = {
            taskId: '',
            runStatus: 4, //布控任务状态
            type: '', //布控任务类型
            keywords: '',
            startTime: '',
            endTime: '',
            orgIds: [], //机构数组
            viewType: 1,
            autoStatus: '', // 任务状态：0-审批中；1-已通过；2-已驳回
            myApprove: '', // 我的审批：1-我发起的2-待我审批3-我已审批
            page: '1',
            size: '20',
        };
        // 告警请求参数
        controlAlarmData = {
            taskId: '',
            page: '1',
            size: '20',
            startTime: '',
            endTime: '',
            viewType: 1,
            showType: 1,
            status: 0
        };
        subscribePortData = {
            id: '',
            name: '',
            runStatus: 2,
            subStatus: '',
            startTime: '',
            endTime: '',
            libId: ''
        };
        targetControlTaskId = '';
        $alarmTargetDom = null;
        $("#controlKeyWordInput").val("");
        $("#searchSubscribeInput").val("");
    }

    /**
     * 订阅弹框 阈值滑块初始化 设置最低值为90
     */
    function subscribeSlider(threshold, isSlider) {
        // var sliderValue = controlIdResult && controlIdResult.threshold !== '' ? controlIdResult.threshold : 90;
        if (threshold) {
            var sliderValue = threshold;
        } else {
            var sliderValue = 90;
        }
        var slider3 = $("#slider3").slider({
            orientation: "horizontal",
            range: "min",
            max: 99,
            min: 90,
            value: sliderValue,
            disabled: isSlider,
            create: function (event, ui) {
                $("#sliderMin3").text(90);
                $("#sliderMax3").text(99);
            },
            slide: function (event, ui) {
                $("#control_slider").val(ui.value);
            }
        });
        $('#control_slider').val(sliderValue);
        $("#control_slider").data('comp', slider3);
        //新建布控 阈值滑块 输入事件
        $("#control_slider").on("change", function () {
            if (!(+$(this).val()) || ((+$(this).val()) <= 1)) {
                $(this).val('90');
            }
            if (parseInt($(this).val()) > 99 || parseInt($(this).val()) < 90) {
                $(this).val('90');
            }

            var reg = /^\d+$/;
            if ($(this).val()) {
                if (!reg.test($(this).val())) {
                    $(this).val('90');
                }
            }
            slider3.slider("value", $(this).val());
        });
    }

    // 重置默认数据
    function resetSearchDataControl(threshold) {
        $('#subscribeItemModal').find('.text-danger').addClass('hide');
        $('#subscribeItemModal').find('[id^="control_"]').removeAttr('disabled', 'disabled');
        $('#control_noticeWays').find("input[type=checkbox]").removeAttr("disabled", "disabled");
        $('#cameraRadioLabel1').closest('.form-group').find("input[type=radio]").removeAttr("disabled", "disabled");
        // 滑动块
        if (threshold) {
            subscribeSlider(threshold, false);
        } else {
            subscribeSlider(90, false);
        }
        //默认选中区域
        $("#cameraRadioLabel1").click();
        //区域机构清空
        $('#control_orgList').data({
            'cameraList': "",
            'gidArr': "",
            'otherCamraList': ""
        }).val("").attr("title", "");
        // $('#control_orgList').data({
        // 	'cameraList': [{
        // 		id: '10',
        // 		name: '深圳市公安局',
        // 		scode: "440300000000"
        // 	}],
        // 	'gidArr': ['10'],
        // 	'otherCamraList': []
        // }).val("深圳市公安局").attr("title", "深圳市公安局");

        //区域镜头清空
        $('#control_cameraList').data({
            'mapList': []
        }).val("").attr("title", "");

        for (var i = 0; i < $("#control_noticeWays").find("input").length; i++) {
            if ($("#control_noticeWays").find(".ui-checkboxradio-checkbox-label").eq(i).hasClass("ui-checkboxradio-checked")) {
                $("#control_noticeWays").find("input").eq(i).click();
            }
        }

        // 清空之前的选中值
        $('#control_userList').data({
            'saveVal': [],
            'userList': []
        }).val('');
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
                noticeWaysData = data.data;
                if (data.code === '200') {
                    var ALARM_PUSH_TYPE = '';
                    data.data.forEach(function (item, index) {
                        var checked = '';
                        ALARM_PUSH_TYPE += `<div class="aui-col-12" style="padding-top: 0.4rem; padding-left: 0;">
                                                <label for="alarmPushCheckbox${index}" class="ui-checkboxradio-checkbox-label">${item.name}</label>
                                                <input type="checkbox" name="alarmPushCheckbox" id="alarmPushCheckbox${index}" value="${item.id}" data-role="checkbox">
                                            </div>`
                    })
                    $("#control_noticeWays").empty().append(ALARM_PUSH_TYPE);
                    $('[data-role="checkbox"]').checkboxradio();
                    $("#control_noticeWays label").off('click').on('click', function () {
                        $(this).closest('.aui-col-18').find('.text-danger').addClass('hide');
                    })

                }
            };
        loadData(infoPort, false, infoData, infoPortSuccessFunc, '', 'GET');
    }

    /**
     * 布控区域列表模式OR公开范围 初始化过程 的 数据转换功能
     * @param {array} list // 获取的机构列表数据
     * @param {array} org  // 布控详情数据中 已选机构id数组
     */
    function matchList(list, org) {
        var newObj = {};
        var newCameraList = [];
        var newNameArr = [];
        var newGidArr = [];
        if (list && list.length > 0) {
            list.forEach(function (item) {
                org.forEach(function (el) {
                    if (item.orgId == el.orgId) {
                        itemObj = {
                            id: item.orgId,
                            name: item.orgName,
                            scode: item.orgCode
                        };
                        newCameraList.push(itemObj);
                        newNameArr.push(item.orgName);
                        newGidArr.push(item.orgId);
                    }
                })
            });
        }
        newObj = {
            newCameraList: newCameraList,
            newNameArr: newNameArr,
            newGidArr: newGidArr
        }
        return newObj;
    }

    // 导航栏 点击布控模块 生成右侧详细信息
    $('#pageSidebarMenu').find('.sidebar-item .aui-icon-monitor2').closest('.sidebar-item').on('click', function () {
        var $this = $(this);
        if ($this.data('my')) {
            $this.data({
                'my': ''
            });
        } else {
            var $contentBox = $('#current-page-control').closest('.content-box');
            if (!$contentBox.hasClass('hide') || !$contentBox.hasClass('display-none')) {
                controlSearchData = {
                    taskId: '',
                    runStatus: 2, //布控任务状态
                    type: '', //布控任务类型
                    keywords: '',
                    startTime: '',
                    endTime: '',
                    orgIds: [], //机构数组
                    viewType: 1,
                    autoStatus: '', // 任务状态：0-审批中；1-已通过；2-已驳回
                    myApprove: '', // 我的审批：1-我发起的2-待我审批3-我已审批
                    page: '1',
                    size: '20',
                };
                // 告警请求参数
                controlAlarmData = {
                    taskId: '',
                    page: '1',
                    size: '20',
                    startTime: '',
                    endTime: '',
                    viewType: 1,
                    showType: 1,
                    status: 0
                };
                // 订阅树请求参数
                subscribePortData = {
                    id: '',
                    name: '',
                    runStatus: 2,
                    subStatus: '',
                    startTime: '',
                    endTime: '',
                    libId: ''
                };
                $('#searchMoreConditions').find('.text-btn.text-link').removeClass('text-link');
                $('#searchMoreConditions').find('li>span.text.text-btn').addClass('text-link');
                $('#searchMoreConditions').find('li>span.text.text-btn').eq(1).removeClass('text-link');
                $('#searchMoreConditions').find('li').eq(1).children(".text-content").find("span").eq(1).addClass('text-link');
                $("#controlKeyWordInput").val("");
                controlSearchData.taskId = $('#content-box').data('taskId');

                loadControlSearchList($("#controlTabContent .tab-container")); // 加载左侧我的布控列表

                var $subscribeConditionDoms = $('#subscribeMoreConditions .text-content');
                $subscribeConditionDoms.each(function (index, el) {
                    if (index == 0) {
                        $(this).find('.text-link').removeClass('text-link');
                        $(this).find('.text').eq(1).addClass('text-link');
                        $(this).prev().removeClass('text-link'); //是否选中 全部 过滤条件这个选项
                    } else {
                        $(this).find('.text-link').removeClass('text-link');
                        $(this).prev().addClass('text-link'); //是否选中 全部 过滤条件这个选项
                    }
                });
                $("#searchSubscribeInput").val("");
                initControlTree($('#subscribeTabContent'), subscribePortData); // 加载右侧我的订阅树列表
            }
        }
    });

    // 告警收缩
    $('#alarmPeopleFlex').on('click', function () {
        var $staticBox = $('#controlPeopleImgList');
        var aa = $staticBox.css('height');
        if ($staticBox.css('height') == '0px') {
            $('#mapIframeContainer').css({
                height: 'calc(100% - 8rem)'
            })
            $staticBox.css({
                height: '8rem',
            });
            $(this).css({
                top: '8rem'
            }).find('i').css({
                transform: 'rotate(-180deg)'
            });
        } else {
            $staticBox.css({
                height: '0',
            });
            $(this).css({
                top: '0'
            }).find('i').css({
                transform: 'rotate(0)'
            });
            $('#mapIframeContainer').css({
                height: '100%'
            })
        }
    })

    // 全部告警
    $('#controlPeopleImgList').on('click', '.card-title-num-but', function () {
        var url = "./facePlatform/alarm-overview-new.html?dynamic=" + Global.dynamic;
        loadPage($('.all-alarm-popup'), url);
        $('.all-alarm-popup').removeClass('hide');
    })

    // 布控任务列表(左侧列表) 列表项相关的事件处理
    $("#controlTabContent").on("click", ".card-item", function (e) {
        clearTimeout(timeControlItemClick);
        timeControlItemClick = setTimeout(() => {
            //根据tab内容区的布控列表子项，更新右侧内容区的布控详情和告警信息。
            var $this = $(this);
            $("#controlTabContent .card-item.active").removeClass("active");
            $this.find('.alarm-num').addClass('hide');
            $this.addClass("active");

            targetControlTaskId = $this.attr("taskId"); // 当前任务ID
            if (controlSearchData.runStatus !== 1) { //待运行状态下 不会有告警信息
                // 加载告警列表
                targetControlImgList = $this.data("listData").imgList;
                loadControlAlarmList($('#controlPeopleImgList .showBigImg'), targetControlTaskId, targetControlImgList);
            } else {
                $('#controlPeopleImgList .showBigImg').empty();
                loadEmpty($('#controlPeopleImgList .showBigImg'), "当前暂无告警信息", "", true);
                $("#alarmCountNum").text('0');
            }
            // 点击任务列表详情，去掉红点
            $(this).find('.img-red-circle').addClass('hide');
        }, 200)
    }).on('mousewheel', function () {
        //tab内容列表滚动到底部进行下一分页的懒加载事件
        var $this = $(this),
            $currentContainer = $this.find(".tab-container"),
            curPage = $currentContainer.data('curPage') === undefined ? 1 : parseInt($currentContainer.data('curPage')),
            viewHeight = $this.parent().height(), //视口可见高度
            contentHeight = $currentContainer[0].scrollHeight, //内容高度
            scrollHeight = $this.parent().scrollTop(), // 已经滚动了的高度
            currentPage = parseInt(controlSearchData.page),
            currentCardItemNum = $currentContainer.find(".card-item").length,
            totalCardItemNUM = parseInt($('#myControlHeader').find('.control-total').eq(0).text());
        if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM && currentPage === curPage) {
            loadControlSearchList($currentContainer, true, currentPage + 1);
        }
    });

    // 布控任务列表(左侧列表) 根据布控关键词来查询布控信息列表
    $("#controlSearchBox").on("click", "#startSearchControl", function () {
        //点击搜索按钮查询关键词
        controlSearchData.page = "1";
        $('#controlTabContent .tab-container').data('curPage', 1);
        controlSearchData.taskId = "";
        controlSearchData.keywords = $("#controlKeyWordInput").val();
        loadControlSearchList($("#controlTabContent .tab-container"));
    }).on("keydown", "#controlKeyWordInput", function (e) {
        //按键盘回车事件开始搜索
        var code = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
        if (code == 13) {
            controlSearchData.page = "1";
            $('#controlTabContent .tab-container').data('curPage', 1);
            controlSearchData.taskId = "";
            controlSearchData.keywords = $("#controlKeyWordInput").val();
            loadControlSearchList($("#controlTabContent .tab-container"));
        }
    });

    /**
     * 布控任务列表(左侧列表) 布控检索条件是否显示更多/收起
     */
    function hasShowMore($contents) {
        for (var i = 0; i < $contents.length; i++) {
            var $currentDom = $contents.eq(i);
            if ($currentDom.height() <= 30 && !$currentDom.hasClass('text-content-more')) {
                $currentDom.next('.text-link.right').hide();
            } else {
                $currentDom.next('.text-link.right').show();

                var $textBtns = $currentDom.find('.text-btn'),
                    parentWid = $currentDom.width(),
                    childrenWid = 0;

                for (var j = 0; j < $textBtns.length; j++) {
                    if (j <= $currentDom.find('.text-btn.text-link').index()) {
                        childrenWid += $textBtns.eq(j).outerWidth(true);
                    }
                }
                if (parentWid > childrenWid) {
                    $currentDom.addClass('text-content-more').next().find(".text").text('更多').next().removeClass('rotate-180');
                } else {
                    $currentDom.removeClass('text-content-more').next().find(".text").text('收起').next().addClass('rotate-180');
                }
            }
        }
    }

    // 布控任务列表(左侧列表) 列表项数据筛选按钮点击事件
    $('#searchMoreFilter').click(function (e) {
        e.stopPropagation();
        $(this).toggleClass('active');
        $('#searchMoreConditions').toggle();
        var $contents = $('#searchMoreConditions .search-more-inner .text-content');
        hasShowMore($contents);
    });

    // 布控人员列表(右侧列表) 列表项数据筛选按钮点击事件
    $('#subscribeMoreFilter').click(function (e) {
        e.stopPropagation();
        $(this).toggleClass('active');
        $('#subscribeMoreConditions').toggle();
        var $contents = $('#subscribeMoreConditions .search-more-inner .text-content');
        hasShowMore($contents);
    });

    // 布控任务列表(左侧列表) 根据筛选条件来查询布控信息 筛选条件按钮点击事件
    $("#searchMoreConditions").on("click", ".text-item .text-btn", function () {
        controlSearchData.page = "1";
        $('#controlTabContent .tab-container').data('curPage', 1);
        controlSearchData.taskId = "";
        var $currentItem = $(this).closest(".text-item");
        $currentItem.find(".text-btn.text-link").removeClass("text-link");
        if ($(this).attr('id') == 'showTimeModal') {
            $("#filterTimeModal").modal('show');
            if ($(this).text() === '自定义时间') {
                $('#filterControl_time').find('.datepicker-input').val('');
            }
        } else {
            $(this).addClass("text-link");
            setSearchMoreCondition($(this), $currentItem.index());
            loadControlSearchList($("#controlTabContent .tab-container"));
            if ($currentItem.attr('id') === 'controlTimeCondition') {
                $('#showTimeModal').text("自定义时间");
                $currentItem.find('.text-link.right').hide();
            }
        }
    });

    // 布控任务列表(右侧列表) 根据筛选条件来查询布控信息 筛选条件按钮点击事件
    $("#subscribeMoreConditions").on("click", ".text-item .text-btn", function () {
        subscribePortData.id = "";
        subscribePortData.name = "";
        var $currentItem = $(this).closest(".text-item");
        $currentItem.find(".text-btn.text-link").removeClass("text-link");
        if ($(this).attr('id') == 'showSubscribeTimeModal') {
            $("#subscribeFilterModal").modal('show');
            if ($(this).text() === '自定义时间') {
                $('#filterSubscribe_time').find('.datepicker-input').val('');
            }
        } else {
            $(this).addClass("text-link");
            setSubscribeMoreCondition($(this), $currentItem.index());
            initControlTree($('#subscribeTabContent'), subscribePortData);
            if ($currentItem.attr('id') === 'subscribeTimeCondition') {
                $('#showSubscribeTimeModal').text("自定义时间");
                $currentItem.find('.text-link.right').hide();
            }
        }
    });

    // 布控任务列表(左侧列表) 根据筛选条件来查询布控信息 自定义时间过滤弹窗确认事件
    $("#filterTimeModal").on("click", "#timeModalSure", function () {
        var $dateInput = $('#filterControl_time').find('.datepicker-input');
        controlSearchData.startTime = $dateInput.eq(0).val();
        controlSearchData.endTime = $dateInput.eq(1).val();
        if ($dateInput.eq(0).val() && $dateInput.eq(1).val()) {
            $('#controlTimeCondition').find('.text-content .text-btn').last().addClass('text-link').text($dateInput.eq(0).val() + ' ~ ' + $dateInput.eq(1).val());
            controlSearchData.page = "1";
            $('#controlTabContent .tab-container').data('curPage', 1);
            controlSearchData.taskId = "";
            loadControlSearchList($("#controlTabContent .tab-container"));
            var $timeConditionContainer = $("#controlTimeCondition").find('.text-content');
            if ($timeConditionContainer.height() > 30) {
                $timeConditionContainer.removeClass('text-content-more').next().show().find(".text").text('收起').next().addClass('rotate-180');
            }
            $("#filterTimeModal").modal('hide');
        } else {
            $('#controlTimeCondition').find('.text-btn').eq(0).addClass('text-link');
            warningTip.say("请输入开始和结束时间");
        }
    });

    // 布控任务列表(右侧列表) 根据筛选条件来查询布控信息 自定义时间过滤弹窗确认事件
    $("#subscribeFilterModal").on("click", ".btn-primary", function () {
        var $dateInput = $('#filterSubscribe_time').find('.datepicker-input');
        subscribePortData.startTime = $dateInput.eq(0).val();
        subscribePortData.endTime = $dateInput.eq(1).val();
        if ($dateInput.eq(0).val() && $dateInput.eq(1).val()) {
            $('#subscribeTimeCondition').find('.text-content .text-btn').last().addClass('text-link').text($dateInput.eq(0).val() + ' ~ ' + $dateInput.eq(1).val());
            subscribePortData.id = "";
            subscribePortData.name = "";
            initControlTree($('#subscribeTabContent'), subscribePortData);
            var $timeConditionContainer = $("#subscribeTimeCondition").find('.text-content');
            if ($timeConditionContainer.height() > 30) {
                $timeConditionContainer.removeClass('text-content-more').next().show().find(".text").text('收起').next().addClass('rotate-180');
            }
            $("#subscribeFilterModal").modal('hide');
        } else {
            $('#subscribeTimeCondition').find('.text-btn').eq(0).addClass('text-link');
            warningTip.say("请输入开始和结束时间");
        }
    });

    /*****布控详情事件---begin---- ****/

    // 布控详情 双击事件入口
    $("#controlTabContent").on("dblclick", ".card-item", function () {
        clearTimeout(timeControlItemClick);
        var _html = `<button id="revocationAllControl" type="button" class="btn btn-primary">全部撤控</button>
					<button id="revocationLibControl" type="button" class="btn btn-primary hide">整库撤控</button>
                    <button id="revocationControl" type="button" class="btn btn-primary disabled">撤控</button>
                    <button id="removeControl" type="button" class="btn btn-primary">终止</button>
					<button id="editControl" type="button" class="btn btn-primary">编辑</button>
					<button id="newSetControl" type="button" class="btn btn-primary">重新布控</button>
					<button id="designateSubscribe" type="button" class="btn btn-primary">指定订阅</button>`;
        $('#controlItemDetailModal').find('.container-img .card-operate-box').empty().append(_html);

        $("#controlItemDetailModal").modal('show');
        var listData = $(this).data('listData');
        $("#controlItemDetailModal").data('listData', listData); // 绑定当前布控任务数据
        $("#revocationAllControl").removeClass("disabled");
        loadControlTaskDetail($('#controlItemDetailContainer'), listData.id); // 详情
        $('#controlViewHeader').find('.nav-link').eq(0).click();
        $('#controlViewHeader').find('.nav-link').eq(1).removeClass('hide');
        var searchData = {
            taskId: listData.id
        }
        createSubscribeList(searchData, $('#subscribeDetailTable'), $('#subscribeDetailTablePagination'), true);
    }).on("click", ".card-item .card-title", function (e) { // 布控详情 单击事件入口
        e.stopPropagation();
        var _html = `<button id="revocationAllControl" type="button" class="btn btn-primary">全部撤控</button>
					<button id="revocationLibControl" type="button" class="btn btn-primary hide">整库撤控</button>
					<button id="revocationControl" type="button" class="btn btn-primary disabled">撤控</button>
					<button id="editControl" type="button" class="btn btn-primary">编辑</button>
					<button id="newSetControl" type="button" class="btn btn-primary">重新布控</button>
					<button id="designateSubscribe" type="button" class="btn btn-primary">指定订阅</button>`;
        $('#controlItemDetailModal').find('.container-img .card-operate-box').empty().append(_html);

        $("#controlItemDetailModal").modal('show');
        var listData = $(this).closest('.card-item').data('listData');
        $("#controlItemDetailModal").data('listData', listData); // 绑定当前布控任务数据
        $("#revocationAllControl").removeClass("disabled");
        loadControlTaskDetail($('#controlItemDetailContainer'), listData.id); // 详情
        $('#controlViewHeader').find('.nav-link').eq(0).click();
        $('#controlViewHeader').find('.nav-link').eq(1).removeClass('hide');
        var searchData = {
            taskId: listData.id
        }
        createSubscribeList(searchData, $('#subscribeDetailTable'), $('#subscribeDetailTablePagination'), true);
    }).on("mouseover", ".card-item", function (event) { // 布控详情 鼠标移入
        event.stopPropagation();
        event.preventDefault();
        var $this = $(this);
        var taskId = $this.attr('taskid');
        if (taskId == mouseOverTaskId) {
            return
        } else {
            mouseOverTaskId = taskId;
            $('#mouseOverControlDetail').remove();
            mouseOverControlBox1 = setTimeout(() => {
                var result = $this.data("listData"),
                    tempStringObject = setArrayToStringObject(result);
                var $menu = $([
                    `<div id="mouseOverControlDetail" class="mouseOverLeft">
						<ul class="card-item-text float-left">
							<li class="form-group">
								<label class="aui-form-label">创建人：</label>
								<div class="form-text form-words text-overflow">${result.creator ? result.creator : '暂无'} ${result.orgName ? '(' + result.orgName + ')' : ''}</div>
							</li>
							<li class="form-group">
								<label class="aui-form-label">创建时间：</label>
								<div class="form-text form-words text-overflow">${result.createTime ? result.createTime : '暂无'}</div>
							</li>
							<li class="form-group">
								<label class="aui-form-label">库标签：</label>
								<div class="form-text form-words text-overflow">${result.libName ? result.libName : '暂无'}${result.labelName ? ('-' + result.labelName) : ''}</div>
							</li>
							<li class="form-group">
								<label class="aui-form-label">阈值：</label>
								<div class="form-text form-words text-overflow">${result.threshold ? result.threshold : '0' + '%'}</div>
							</li>
							<li class="form-group">
								<label class="aui-form-label">公开范围：</label>
								<div class="form-text form-words text-overflow">${tempStringObject.viewString !== '暂无' ? tempStringObject.viewString : tempStringObject.viewUserString}</div>
							</li>
							<li class="form-group">
								<label class="aui-form-label">警情编号：</label>
								<div class="form-text form-words text-overflow">${result.jqbh ? result.jqbh.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '暂无'}</div>
							</li>
							<li class="form-group ${result.imgList && result.imgList.length > 0 ? 'display-none' : ''}">
								<label class="aui-form-label">布控对象：</label>
								<div class="form-text form-words text-overflow">${result.libName ? result.libName : '暂无'}${result.labelName ? ('-' + result.labelName) : ''}</div>
							</li>
							<li class="form-group imgList ${result.imgList && result.imgList.length > 0 ? '' : 'display-none'}">
								<label class="aui-form-label">布控对象:</label>
								<div class="form-text form-words text-overflow">
									<ul class="add-image-wrap add-type-3 usearchImgBk">
									</ul>
								</div>
							</li>
						</ul>
					</div>`
                ].join(''));
                var menuLen = $('#mouseOverControlDetail').length;
                if (menuLen > 0) {
                    $('#mouseOverControlDetail').off().remove();
                }
                var top = $this.offset().top;
                $('#current-page-control').find(".controlContent.layout-type3").append($menu);
                if (top + $("#mouseOverControlDetail").outerHeight() / 2 + 30 < document.body.clientHeight) {
                    $menu.css({
                        top: top - 30 + $(document).scrollTop() - $("#current-page-control").find(".controlTitle").outerHeight()
                    });
                    document.documentElement.style.setProperty(`--beforeLeftTop`, '4.5rem');
                } else {
                    $menu.css({
                        top: document.body.clientHeight - $("#mouseOverControlDetail").outerHeight() - $("#current-page-control").find(".controlTitle").outerHeight()
                    });
                    document.documentElement.style.setProperty(`--beforeLeftTop`, (top - $menu.offset().top - 10) + 'px');
                }

                // 布控人图片
                if (result.imgList && result.imgList.length > 0) {
                    result.imgList.forEach(function (item, index) {
                        var option = {
                            'peopleId': item.peopleId,
                            'libId': item.libId,
                        };
                        loadData('v2/memberInfos/getPeopleInfo', true, option, function (data) {
                            if (data.code === '200') {
                                var result = data.data;
                                var liHtml = `<li class="add-image-item">
									<img class="add-image-img" alt="" src="${result.imageUrl ? result.imageUrl : './assets/images/control/person.png'}">
								</li>`;
                                $('#mouseOverControlDetail').find('.usearchImgBk').append(liHtml);
                                $('#mouseOverControlDetail').find('.usearchImgBk').find('.add-image-item.default').addClass('hide');
                            }
                        })
                    });
                }
            }, 1000);
            $this.off("mouseout").on("mouseout", function (event) { // 布控详情 鼠标移出
                event.stopPropagation();
                event.preventDefault();
                mouseOverTaskId = '';
                $('#mouseOverControlDetail').remove();
                window.clearTimeout(mouseOverControlBox1);
            });
        }
    })

    // 布控详情 布控对象小图 hover 显示大图
    $('#controlItemDetailModal').on('mouseover', '#controlImgBk .add-image-img', function () {
        var $this = $(this),
            thisData = $this.data('listData'),
            imgSrc = $this.attr('src'),
            top = $this.offset().top - 2,
            left = $this.offset().left + $this.outerWidth() + 4,
            html = `<div class="card-img-hover card-img-hover-control-detail">
				<img src="${imgSrc}" alt="">
			</div>`;
        controlImgHoverTimer = window.setTimeout(function () {
            $this.closest('#controlItemDetailModal').append(html);
            var docH = document.documentElement.clientHeight,
                $imgHover = $this.closest('#controlItemDetailModal').find('.card-img-hover'),
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
        }, 0);
    });

    // 布控详情 布控对象小图 移开hover 隐藏大图
    $('#controlItemDetailModal').on('mouseout', '#controlImgBk .add-image-img', function () {
        $(this).closest('#controlItemDetailModal').find('.card-img-hover').remove();
        window.clearTimeout(controlImgHoverTimer);
    });

    // 布控详情 撤控弹框 确定按钮点击事件
    $("#controlItemEndModal").on("click", ".btn-primary", function () {
        var controlEndVal = $("#controlItemEndModal").find('textarea').val();
        if (controlEndVal) {
            var listData = $("#controlItemDetailModal").data('listData'),
                type = $("#controlItemEndModal").data('type'),
                taskId = listData.id,
                libId = listData.libId,
                labelId = listData.labelId,
                personList = $("#controlItemEndModal").data('personList');
            if (type == 'person') {
                var port = 'v3/distributeManager/undoPeople',
                    data = {
                        taskId: taskId,
                        libId: libId,
                        personList: personList,
                        stopReason: controlEndVal,
                    };
            } else {
                var port = 'v3/distributeManager/undoLib',
                    data = {
                        libId: libId,
                        labelId: labelId,
                        comments: controlEndVal,
                    };
            }
            var successFunc = function (data) {
                if (data.code == '200') {
                    controlSearchData.page = '1';
                    $('#controlTabContent .tab-container').data('curPage', 1);
                    controlSearchData.taskId = '';
                    loadControlSearchList($("#controlTabContent .tab-container"));
                    $("#controlItemEndModal").modal('hide');
                    $("#controlItemEndModal").find('textarea').val('');
                } else {
                    warningTip.say(data.message);
                }
            };
            loadData(port, true, data, successFunc);
        } else {
            $("#controlItemEndModal").find(".text-danger").removeClass('hide');
        }
    });

    // 详情弹框 全部撤控 点击事件
    $("#controlItemDetailModal").on('click', '#revocationAllControl', function () {
        if ($(this).hasClass("disabled")) {
            return;
        }
        var personList = [];
        $('#controlImgBk').find('.add-image-item').each(function (index, el) {
            if ($(el).find('.ui-checkboxradio-checkbox-label')) {
                var personId = $(el).attr('peopleid');
                personList.push(personId);
            }
        });

        $("#controlItemDetailModal").modal('hide');
        $("#controlItemEndModal").modal('show');
        $("#controlItemEndModal").find(".text-danger").addClass('hide');
        $("#controlItemEndModal").data('type', 'person');
        $("#controlItemEndModal").data('personList', personList);
        $("#controlItemEndModal").find('.modal-title').text('全部撤控');
        $("#control_stop").parent().find(".wordNum.warning-item-text").addClass("hide");
    })

    // 详情弹框 整库撤控 点击事件
    $("#controlItemDetailModal").on('click', '#revocationLibControl', function () {
        $("#controlItemEndModal").data('type', 'lib');
        $("#controlItemDetailModal").modal('hide');
        $("#controlItemEndModal").modal('show');
        $("#controlItemEndModal").find(".text-danger").addClass('hide');
        $("#controlItemEndModal").find('.modal-title').text('整库撤控');
        $("#control_stop").parent().find(".wordNum.warning-item-text").addClass("hide");
    })

    // 详情弹框 撤控 点击事件
    $("#controlItemDetailModal").on('click', '#revocationControl', function () {
        if ($(this).hasClass("disabled")) {
            return;
        }
        var personList = [];
        $('#controlImgBk').find('.add-image-item').each(function (index, el) {
            if ($(el).find('.ui-checkboxradio-checkbox-label').hasClass('ui-checkboxradio-checked')) {
                var personId = $(el).attr('peopleid');
                personList.push(personId);
            }
        });

        $("#controlItemDetailModal").modal('hide');
        $("#controlItemEndModal").modal('show');
        $("#controlItemEndModal").find(".text-danger").addClass('hide');
        $("#controlItemEndModal").data('personList', personList);
        $("#controlItemEndModal").find('.modal-title').text('撤控');
        $("#control_stop").parent().find(".wordNum.warning-item-text").addClass("hide");
    })

    // 详情弹框 删除 点击事件
    $("#controlItemDetailModal").on('click', '#removeControl', function () {
        if ($(this).hasClass("disabled")) {
            return;
        }
        $("#controlItemDetailModal").modal('hide');
        $("#cancelSubscribeItemModal").find(".modal-title").html("终止布控任务");
        $("#cancelSubscribeItemModal").find(".modal-content-title").html("是否终止布控任务？");
        $("#cancelSubscribeItemModal").attr("type", "1");
        $("#cancelSubscribeItemModal").modal('show');
    })

    // 详情弹框 编辑布控 点击事件
    $("#controlItemDetailModal").on('click', "#editControl", function () {
        $("#controlItemDetailModal").modal('hide');
        var url = "./facePlatform/control-new.html?dynamic=" + Global.dynamic;
        var taskId = $("#controlItemDetailModal").data('listData').id;
        $('.control-new-popup').data('controlId', taskId);
        $('.control-new-popup').data('controlType', 'edit');
        loadPage($('.control-new-popup'), url);
        $('.control-new-popup').removeClass('hide');
    })

    // 详情弹框 重新布控 点击事件
    $("#controlItemDetailModal").on('click', "#newSetControl", function () {
        $("#controlItemDetailModal").modal('hide');
        var url = "./facePlatform/control-new.html?dynamic=" + Global.dynamic;
        var taskId = $("#controlItemDetailModal").data('listData').id;
        $('.control-new-popup').data('controlId', taskId);
        $('.control-new-popup').data('controlType', 'create');
        loadPage($('.control-new-popup'), url);
        $('.control-new-popup').removeClass('hide');
    })

    // 详情弹框 指定订阅 点击事件
    $("#controlItemDetailModal").on('click', "#designateSubscribe", function () {
        if ($(this).hasClass("disabled")) {
            return;
        }
        $("#controlItemDetailModal").modal('hide');
        $("#subscribeItemModal").modal('show');
        $("#subscribeItemModal").find('.modal-title').text('指定订阅');
        $('#control_userList').closest('.aui-col-24').removeClass('hide');
        var listData = $("#controlItemDetailModal").data('listData');
        $("#subscribeItemModal").data({
            taskId: listData.id,
            threshold: listData.threshold
        });
        resetSearchDataControl(listData.threshold); // 重置默认数据
        $('#subscribeItemModal').find('[id^=control_]').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');
    })

    // 关闭和取消，清空中止原因
    $("#controlItemEndModal").on("hidden.bs.modal", function () {
        $("#controlItemEndModal").find('textarea').val('');
    })

    // 布控详情 延期/重启事件入口 设置布控期限弹框 弹框 确定按钮点击事件
    $('#newSetControlModal').on('click', '.modal-footer .btn-primary', function () {
        var controlType = '';
        if ($("#controlPostpone span").html() === '延期') {
            controlType = 2;
        } else {
            controlType = 1;
        }
        var taskId = $('#controlTabContent').find('.card-item.active').attr('taskid'),
            endTime = '';
        if (!$('#postpone-datepicker').hasClass('hide')) {
            endTime = $('#postpone-datepicker').find('.datepicker-input').val();
        } else if (!$('#restartControl_time').hasClass('hide')) {
            startTime = $('#restartControl_time').find('.datepicker-input').eq(0).val();
            endTime = $('#restartControl_time').find('.datepicker-input').eq(1).val();
        }
        showLoading($('#newSetControlModal .modal-content'));
        var portData = {
            taskId: taskId,
            endTime: endTime,
            type: controlType,
            // isdelay: '1',
        };
        var portDataSuccessFunc = function (data) {
            if (data.code === '200') {
                $($('#newSetControlModal').data()['bs.modal']._backdrop).remove();
                $('#newSetControlModal').find('.aui-icon-not-through').click();
                $('#controlTabContent').find('.card-item.active').click();
                var $barItem = $('#pageSidebarMenu .aui-icon-monitor2').closest('.sidebar-item'),
                    barIndex = $barItem.index(),
                    $saveItem = $('#content-box').children().eq(barIndex),
                    url = $('#pageSidebarMenu .aui-icon-monitor2').parent("a").attr("lc") + "?dynamic=" + Global.dynamic;
                controlSearchData.page = '1';
                $('#controlTabContent .tab-container').data('curPage', 1);
                resetSearchConditions();
                controlSearchData.taskId = taskId;
                loadControlSearchList($("#controlTabContent .tab-container"));
                $barItem.addClass('active').siblings().removeClass('active');
                $saveItem.removeClass('hide').siblings().addClass('hide');
                loadPage($saveItem, url);
            } else {
                warningTip.say('布控期限更改失败');
            }
            hideLoading($('#newSetControlModal .modal-content'));
        }
        loadData('v2/distributeManager/restartDistributeTask', true, portData, portDataSuccessFunc);
    });

    // 布控详情 布控告警过滤条件 自定义时间弹窗 确定按钮点击事件
    $("#peopleAlarmTimeOk").on("click", function () {
        var $dateInput = $("#peopleAlarm_Time .datepicker-input"),
            dateStartTime = $dateInput.eq(0).val(),
            dateEndTime = $dateInput.eq(1).val();
        controlAlarmData.startTime = $dateInput.eq(0).val();
        controlAlarmData.endTime = $dateInput.eq(1).val();
        if (dateStartTime && dateEndTime) {
            $("#peopleAlarm_Time").next().addClass('hide');
            loadControlAlarmList($('#controlPeopleImgList .showBigImg'), targetControlTaskId, targetControlImgList);
        } else {
            $("#peopleAlarm_Time").next().removeClass('hide');
            //$dateInput.eq(0).val("");
            //$dateInput.eq(1).val("");
        }
    });

    // 布控详情 布控告警过滤条件 自定义时间弹窗 确定按钮点击事件
    $("#peopleAlarmTimeReset").on("click", function () {
        $("#control-halfmonth-days").click();
        window.initDatePicker1($('#peopleAlarm_Time'), -15, false, true, false, false); // 初始化日历组件 设置默认时间
    });

    // 布控详情中布控对象点击事件
    $('#controlImgBk').on('click', '.ui-checkboxradio-checkbox-label', function () {
        $this = $(this);
        if (!$(this).hasClass('ui-checkboxradio-checked')) {
            $(this).addClass('ui-checkboxradio-checked');
        } else {
            $(this).removeClass('ui-checkboxradio-checked');
        }
        var selectImg = $('#controlImgBk').find('.ui-checkboxradio-checked');
        if (selectImg.length > 0) {
            $('#revocationControl').removeClass('disabled');
            // $('#newSetControl').removeClass('disabled');
        } else {
            $('#revocationControl').addClass('disabled');
            // $('#newSetControl').addClass('disabled');
        }
    })

    // 布控详情 相关文书点击事件
    $('#controlItemDetailContainer').on('click', '.form-group .text-prompt', function () {
        if ($(this).text() !== '暂无') {
            var url = $(this).attr("url");
            var post_url = serviceUrl + '/v2/file/downloadByHttpUrl?url=' + url;
            if ($("#IframeReportImg").length === 0) {
                $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
            }
            $('#IframeReportImg').attr("src", post_url);
        }
    })

    // 订阅详情 输入框数据检索功能
    $('#subscribeDetailSearch').on('keyup', function (evt) {
        if (evt.keyCode === 13) {
            var nickname = $('#subscribeDetailSearch').val(),
                taskId = $('#controlItemDetailModal').data('listData').id;
            var searchData = {
                taskId: taskId,
                nickname: nickname
            }
            createSubscribeList(searchData, $('#subscribeDetailTable'), $('#subscribeDetailTablePagination'), true);
        }
    }).siblings('.aui-input-suffix').on('click', function () {
        var nickname = $('#subscribeDetailSearch').val(),
            taskId = $('#controlItemDetailModal').data('listData').id;
        var searchData = {
            taskId: taskId,
            nickname: nickname
        }
        createSubscribeList(searchData, $('#subscribeDetailTable'), $('#subscribeDetailTablePagination'), true);
    });

    /*******布控详情事件---end----*******/


    /*******告警信息轨迹分析---begin----*******/

    /**
     * 根据镜头ID 判断所选人员是否已在轨迹分析列表中 返回相应的存在状态和所在数组的index序号
     * @param {string} alarmId 
     */
    function checkIsInTrakData(alarmId) {
        var trakData = $('#courseAnalyseControl').data().trakData;
        if (trakData && trakData.length) {
            for (var i = 0; i < trakData.length; i++) {
                if (trakData[i].alarmId === alarmId) {
                    return {
                        isChecked: true,
                        currentIndex: i
                    };
                }
            }
        }
    }

    // 右侧布控人员点击事件 轨迹分析
    $('#controlPeopleImgList .alarmPeopleImgNew').on('click', '.imgBase-card-wrap', function () {
        var alarmData = $(this).data('listData');
        var trakDatas = [];
        alarmData.map(function (el, index) {
            trakDatas.push({
                alarmId: el.alarmId,
                cameraId: el.cameraId,
                cameraName: el.cameraName,
                captureTime: el.alarmTime,
                facePosition: el.vertices,
                gbCode: el.gbCode,
                imgGuid: el.smallHttpUrl,
                faceUrl: el.smallHttpUrl,
                bigHttpUrl: el.bigHttpUrl,
                px: el.px,
                py: el.py,
                url: el.url,
                orgName: el.orgName,
                threshold: el.threshold,
                smallHttpUrl: el.smallHttpUrl,
                status: el.status,
                libName: el.libName,
                idcard: el.idcard,
                name: el.name,
                comments: el.comments
            });
        });

        var data = trakDatas; // 传给地图产生大图的数据

        if (data.length == 0) {
            warningTip.say('无告警数据');
        } else {
            createMapFn(data, 'map_iframe_alarm');
        }
    });

    // 布控任务 告警信息轨迹分析 监听地图返回数据
    window.addEventListener("message", function (ev) {
        var mydata = ev.data;
        if (mydata !== 'initMap' && mydata !== 'initMap?' && mydata !== 'initMap?44031') {
            if (mydata.state == null || (mydata.imgs && mydata.imgs.length == 1)) {
                createImgMask(mydata);
                if (mydata.imgs && mydata.imgs.length > 1) {
                    mydata.imgs.forEach(function (item) {
                        $('#auiTimeLine').find('.image-box[imgguid = "' + item.imgData + '"]').addClass('select');
                    });
                }
            } else if (mydata.state == 1) {
                mydata.imgs.forEach(function (item) {
                    $('#auiTimeLine').find('.image-box[imgguid = "' + item.imgData + '"]').addClass('select');
                });
            } else if (mydata.state == 0) {
                mydata.imgs.forEach(function (item) {
                    $('#auiTimeLine').find('.image-box[imgguid = "' + item.imgData + '"]').removeClass('select');
                });
            }

            if (mydata.key) {
                //detailContent是设备详情
                if (mydata.key != 'detailContent') {
                    var cameraIDArr = [];
                    for (var i = 0; i < mydata.data.length; i++) {
                        cameraIDArr.push(mydata.data[i].id); // 摄像头id数组赋值
                    }
                    showMapVideo(mydata.key, mydata.data, cameraIDArr);
                } else {
                    showDeviceDetail(mydata.data.id);
                }
            }
        } else { // 判断是否为初始化地图
            window.setTimeout(function () {
                $('#pathLoading').addClass('hide');
                var alarmClusterData = $('#alarmListContainer').data("clusterData");
                loadAlarmMap(true, alarmClusterData);
            }, 1000);

            var searchMapIframe = document.getElementById('map_iframe');
            var targetOrigin = 'http://190.168.17.2:6081/peopleCity.html';
            var mapOperationData = {
                type: "controlVisible",
                mydata: [{
                    name: 'zoom',
                    b: false
                }, {
                    name: 'tools',
                    b: false
                }, {
                    name: 'search',
                    b: true
                }, {
                    name: 'fullExtent',
                    b: true
                }]
            };
            window.setTimeout(function () {
                if (searchMapIframe) {
                    searchMapIframe.contentWindow.postMessage(mapOperationData, targetOrigin);
                }
            }, 2000);
        }
    });

    /*******告警信息轨迹分析---end----*******/


    // 管理者登陆 点击布控概览页面或者我的布控页面 的某个布控任务 并进入相应的布控详情页面
    $('#content-box').on('click', '#controlOverviewTabContent .card-info, #controlTabContent .card-info', function () {
        var index = $('#pageSidebarMenu').find('.aui-icon-monitor2').closest('.sidebar-item').index();
        if ($('#controlDetailPage').data('hasInitDetailPage') || $("#content-box .content-save-item").eq(index).data('hasInitDetailPage')) {
            resetSearchConditions();
            controlSearchData.taskId = $('#content-box').data('taskId');
            loadControlSearchList($("#controlTabContent .tab-container"));
        }
        // 点击任务列表详情，去掉红点
        $(this).find('.img-red-circle').addClass('hide')
    });

    // 布控 编辑成功
    window.editSuccess = function (taskId) {
        resetSearchConditions();
        $('.control-new-popup').data('controlId', '');
        controlSearchData.taskId = taskId;
        loadControlSearchList($("#controlTabContent .tab-container"));
        var $barItem = $('#pageSidebarMenu .aui-icon-monitor2').closest('.sidebar-item'),
            barIndex = $barItem.index(),
            $saveItem = $('#content-box').children().eq(barIndex),
            url = $('#pageSidebarMenu .aui-icon-monitor2').parent("a").attr("lc") + "?dynamic=" + Global.dynamic;
        $barItem.addClass('active').siblings().removeClass('active');
        $saveItem.removeClass('hide').siblings().addClass('hide');
        loadPage($saveItem, url);
        $("#current-page-control #map_iframe_alarm").attr('src', mapUrl + 'peopleCity.html?rxModule=map_iframe_alarm');
    }

    // 收缩右侧布控列表
    $('#subscribeBoxFlex').on('click', function () {
        // 隐藏右侧告警列表的筛选框
        if ($('#subscribeMoreConditions').css('display') !== 'none') {
            $(this).toggleClass('active');
            $('#subscribeMoreConditions').toggle();
        }
        // 隐藏鼠标悬浮任务详情
        $('#current-page-control').find('#mouseOverControlDetail').remove();

        if ($(this).find("i").attr("class") === "aui-icon-drop-right") {
            $(this).find("i").attr("class", "aui-icon-drop-left");
            $('#current-page-control .control-right-box').animate({
                "width": "0"
            }, 'fast', '', function () {
                $('#current-page-control .control-right-box').addClass("hide");
            });
        } else {
            $('#current-page-control .control-right-box').removeClass("hide");
            $(this).find("i").attr("class", "aui-icon-drop-right");
            $('#current-page-control .control-right-box').animate({
                "width": "20rem"
            }, 'fast');
        }
    })

    // 收缩左侧布控列表
    $('#controlBoxFlex').on('click', function () {
        // 隐藏左侧告警列表的筛选框
        if ($('#searchMoreConditions').css('display') !== 'none') {
            $(this).toggleClass('active');
            $('#searchMoreConditions').toggle();
        }
        // 隐藏鼠标悬浮任务详情
        $('#current-page-control').find('#mouseOverControlDetail').remove();

        if ($(this).find("i").attr("class") === "aui-icon-drop-left") {
            $(this).find("i").attr("class", "aui-icon-drop-right");
            $('#current-page-control .control-left-box').animate({
                "width": "0"
            }, 'fast', '', function () {
                $('#current-page-control .control-left-box').addClass("hide");
            });
            $('#current-page-control .control-wrap-flex').animate({
                "left": "0"
            }, 'fast');

        } else {
            $('#current-page-control .control-left-box').removeClass("hide");
            $(this).find("i").attr("class", "aui-icon-drop-left");
            $('#current-page-control .control-left-box').animate({
                "width": "25rem"
            }, 'fast');
            $('#current-page-control .control-wrap-flex').animate({
                "left": "25rem"
            }, 'fast');
        }
    })

    // 布控期限 时间切换事件
    $('#subscribeMoreConditions [data-role="radio-button"]').on('click', function () {
        var $this = $(this),
            eventCls = $this.closest('.event'),
            date = $(this).val();
        $(this).prev().addClass('ui-checkboxradio-checked ui-state-active');
        window.initDatePicker1($('#peopleAlarm_Time'), -date, true, true, false, false);
    });

    /**
     * 布控期限 改变时间标签的激活状态
     */
    function controlChangeActive(_counts) {
        if (_counts === 3) {
            // 三天 单选激活 
            $('#time-label-three-days').addClass('ui-checkboxradio-checked ui-state-active');
            $('#time-label-oneweek-days').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#time-label-halfmonth-days').removeClass('ui-checkboxradio-checked ui-state-active');
        } else if (_counts === 7) {
            // 七天 单选激活 
            $('#time-label-three-days').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#time-label-oneweek-days').addClass('ui-checkboxradio-checked ui-state-active');
            $('#time-label-halfmonth-days').removeClass('ui-checkboxradio-checked ui-state-active');
        } else if (_counts === 15) {
            // 半个月 单选激活 
            $('#time-label-three-days').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#time-label-oneweek-days').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#time-label-halfmonth-days').addClass('ui-checkboxradio-checked ui-state-active');
        } else {
            // 所有单选不激活 
            $('#time-label-three-days').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#time-label-oneweek-days').removeClass('ui-checkboxradio-checked ui-state-active');
            $('#time-label-halfmonth-days').removeClass('ui-checkboxradio-checked ui-state-active');
        }
    }

    /**
     * 布控期限 时间控件点击事件
     */
    window.selectDateFunc = function () {
        //开始时间
        var startTime = $('#peopleAlarm_Time').find('.datepicker-input').eq(0).val();
        // 结束时间
        var endTime = $('#peopleAlarm_Time').find('.datepicker-input').eq(1).val();
        var startDate = new Date(Date.parse(startTime.replace(/-/g, "/"))).getTime();
        var endDate = new Date(Date.parse(endTime.replace(/-/g, "/"))).getTime();
        // 开始时间与结束时间间隔天数
        //var _counts = (endTime.substring(0, 4) - startTime.substring(0, 4)) * 360 + (endTime.substring(5, 7) - startTime.substring(5, 7)) * 30 + (endTime.substring(8, 10) - startTime.substring(8, 10));
        var _counts = Math.abs(startDate - endDate) / (1000 * 60 * 60 * 24);
        controlChangeActive(_counts);
    }
    $('#peopleAlarm_Time').find('.datepicker-input').off('blur').on('blur', selectDateFunc);

    /**
     * 初始化请求人员库机构树
     */
    function initControlTree($container, portData) {
        // 开始加载loading动画
        showLoading($container);
        // 加载人员库列表
        var port = 'v3/distributeManager/subscribeList',
            successFunc = function (data) {
                // 结束loading加载动画
                hideLoading($container);
                if (data.code == '200') {
                    $('#subscribe-tree-list').empty();
                    var result = data.data;
                    if (result && result.length > 0) {
                        // 调用加载树组件方法
                        loadControlZTree(result);
                    } else {
                        loadEmpty($('#subscribe-tree-list'), '暂无布控任务', ' ');
                    }
                } else {
                    loadEmpty($('#subscribe-tree-list'), '暂无布控任务', '系统异常');
                }
            };
        loadData(port, true, portData, successFunc);
    }

    /**
     * 右侧机构树加载
     * @param {*} data 传入的数据
     */
    function loadControlZTree(data) {
        var setting = {
            data: {
                simpleData: {
                    enable: true,
                    idKey: 'id',
                    pldKey: 'pId',
                    rootPId: 0
                }
            },
            view: {
                selectedMulti: false,
                showIcon: true,
                addDiyDom: function (treeId, treeNode) { // 自定义控件部分
                    if (treeNode.nodeType !== 1) {
                        $('#' + treeNode.tId + '_a').attr("orgId", treeNode.nodeType);
                        $("#" + treeNode.tId + '_a').find(".node_name").parent().append(`<span class="subscribe-tree-num">[已订${treeNode.subNumber}/共${treeNode.totalNumber}]</span>`);
                        $("#" + treeNode.tId + '_ico').append(`<i class="aui-icon-home-2"></i>`);
                    } else {
                        $("#" + treeNode.tId + '_a').find(".node_name").parent().append(`<span class="subscribe-tree-num">${treeNode.personNum ? ('(' + treeNode.personNum + '人)') : ''}</span>`);
                    }
                    var name1 = $("#" + treeNode.tId + '_a').find('.node_name').html(),
                        name2 = $("#" + treeNode.tId + '_a').find('.subscribe-tree-num').html();
                    $("#" + treeNode.tId + '_a').attr('title', name1 + name2)
                    if (treeNode.id && treeNode.nodeType == 1) {
                        if (treeNode.subStatus == 1) {
                            $("#" + treeNode.tId + '_switch').empty().append(`<i class="aui-icon-success success"></i>`);
                        } else if (treeNode.subStatus == 2) {
                            $("#" + treeNode.tId + '_switch').empty().append(`<i class="aui-icon-success"></i>`);
                        }
                        $("#" + treeNode.tId + "_span").attr('taskId', treeNode.id);
                    }
                }
            },
            callback: {
                onClick: function (event, treeId, treeNode) {
                    // 树点击事件
                    event.stopPropagation();
                    event.preventDefault();
                    clearTimeout(timeTreeItemClick);
                    timeTreeItemClick = setTimeout(() => {
                        if (treeNode.id && treeNode.nodeType == 1) {
                            var aObj = $('#' + treeNode.tId); // 选中的人员库li节点
                            $('#portraitContainer').find('.subscribe-name').text(treeNode.name);
                            // treeNode.level == '1' ==> 表示点击的为二级菜单
                            // if (treeNode.level == '1' || treeNode.level == '2' || treeNode.level == '3') {
                            $(event.currentTarget).find('.active').removeClass('active'); // 其他菜单移除active
                            aObj.addClass('active').siblings().removeClass('active'); // 自身添加active, 兄弟节点移除active
                            // }
                            targetControlTaskId = treeNode.id; // 当前任务ID
                            // 根据taskId，更新告警信息
                            loadControlAlarmList($('#controlPeopleImgList .showBigImg'), targetControlTaskId);
                        }
                    }, 200);
                },
                onDblClick: function (event, treeId, treeNode) {
                    clearTimeout(timeTreeItemClick);
                    if (treeNode.nodeType && treeNode.nodeType == 1) {
                        taskId = treeNode.id;
                        $("#controlItemDetailModal").modal('show');
                        var listData = $(this).data('listData');
                        $("#controlItemDetailModal").data('listData', listData); // 绑定当前布控任务数据
                        $('#controlItemDetailModal').find('.container-img .card-operate-box').empty(); // 清空详情按钮
                        // 订阅列表隐藏
                        $('#controlViewHeader').find('.nav-link').eq(0).click();
                        $('#controlViewHeader').find('.nav-link').eq(1).addClass('hide');
                        $('#subscribeItemDetailContainer').find('tbody').empty(); // 清空table数据
                        loadControlTaskDetail($('#controlItemDetailContainer'), taskId, true); // 详情
                    }
                },
                onRightClick: function (event, treeId, treeNode) {
                    $('#rightMouseSubscribeTree').off().remove();
                    if (treeNode.nodeType && treeNode.nodeType == 1) {
                        taskId = treeNode.id;
                        if (treeNode.subStatus == 1 && treeNode.runStatus !== 3) {
                            var $menu = $([
                                '<ul class="mask-camera-list" id="rightMouseSubscribeTree">',
                                '   <li class="mask-camera-item" type="1">取消订阅</li>',
                                '   <li class="mask-camera-item" type="2">编辑订阅</li>',
                                '   <li class="mask-camera-item" type="3">查看订阅详情</li>',
                                '   <li class="mask-camera-item" type="4">查看布控详情</li>',
                                '</ul>',
                            ].join(''));
                        } else if (treeNode.subStatus == 2 && treeNode.runStatus !== 3) {
                            var $menu = $([
                                '<ul class="mask-camera-list" id="rightMouseSubscribeTree">',
                                '   <li class="mask-camera-item" type="0">订阅布控任务</li>',
                                '   <li class="mask-camera-item" type="4">查看布控详情</li>',
                                '</ul>',
                            ].join(''));
                        } else if (treeNode.runStatus == 3) {
                            if (treeNode.subStatus == 1) {
                                var $menu = $([
                                    '<ul class="mask-camera-list" id="rightMouseSubscribeTree">',
                                    '   <li class="mask-camera-item" type="3">查看订阅详情</li>',
                                    '   <li class="mask-camera-item" type="4">查看布控详情</li>',
                                    '</ul>',
                                ].join(''));
                            } else if (treeNode.subStatus == 2) {
                                var $menu = $([
                                    '<ul class="mask-camera-list" id="rightMouseSubscribeTree">',
                                    '   <li class="mask-camera-item" type="4">查看布控详情</li>',
                                    '</ul>',
                                ].join(''));
                            }
                        }
                    } else {
                        return;
                    }
                    var menuLen = $('#rightMouseSubscribeTree').length;
                    if (menuLen > 0) {
                        $('#rightMouseSubscribeTree').off().remove();
                    }
                    $('body').append($menu);

                    // if ($("#subscribe-tree-list").attr("controlUse") != '1') {
                    // 	$menu.find(".mask-camera-item[type='0']").addClass("hide");
                    // }

                    // 给右键菜单添加绑定事件
                    $menu.find('.mask-camera-item').off('click').on('click', function (evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        if ($(this).hasClass("disabled")) {
                            return;
                        }
                        $("#rightMouseSubscribeTree").addClass('hide');
                        var menuIndex = $(this).attr("type");
                        if (menuIndex == '0') { // 订阅
                            $("#subscribeItemModal").modal('show');
                            $("#subscribeItemModal").find('.modal-title').text('订阅布控');
                            $("#subscribeItemModal").find('.modal-footer').removeClass('hide');
                            $('#control_userList').closest('.aui-col-24').addClass('hide'); // 指定订阅用到
                            $("#subscribeItemModal").data({
                                taskId: taskId,
                                threshold: treeNode.threshold
                            });
                            resetSearchDataControl(treeNode.threshold); // 重置默认数据
                            $('#subscribeItemModal').find('[id^=control_]').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');
                        } else if (menuIndex == '1') { // 取消订阅
                            $("#cancelSubscribeItemModal").find(".modal-title").html("取消订阅布控任务");
                            $("#cancelSubscribeItemModal").find(".modal-content-title").html("是否取消已订阅的布控任务？");
                            $("#cancelSubscribeItemModal").attr("type", "0");
                            $("#cancelSubscribeItemModal").modal('show');
                            $("#subscribeTabContent").data('taskId', taskId);
                        } else if (menuIndex == '2') { // 编辑订阅
                            $("#subscribeItemModal").modal('show');
                            $("#subscribeItemModal").find('.modal-title').text('编辑订阅');
                            $("#subscribeItemModal").find('.modal-footer').removeClass('hide');
                            $('#control_userList').closest('.aui-col-24').addClass('hide'); // 指定订阅用到
                            $("#subscribeItemModal").data({
                                taskId: taskId,
                                threshold: treeNode.threshold
                            });
                            resetSearchDataControl(treeNode.threshold); // 重置默认数据
                            $('#subscribeItemModal').find('[id^=control_]').removeClass('no-input-warning').closest('.form-group').find('.text-danger').addClass('hide');
                            subscribeConfigOpt(taskId, false);
                        } else if (menuIndex == '3') { // 查看订阅
                            $("#subscribeItemModal").modal('show');
                            $("#subscribeItemModal").find('.modal-title').text('查看订阅');
                            $("#subscribeItemModal").find('.modal-footer').addClass('hide');
                            $('#control_userList').closest('.aui-col-24').addClass('hide'); // 指定订阅用到
                            $("#subscribeItemModal").data('taskId', taskId);
                            resetSearchDataControl(); // 重置默认数据
                            $('#subscribeItemModal').find('[id^=control_]').removeClass('no-input-warning').closest('.form-group').find('.text-danger').addClass('hide');
                            subscribeConfigOpt(taskId, true);
                        } else if (menuIndex == '4') { // 查看详情
                            taskId = treeNode.id;
                            $("#controlItemDetailModal").modal('show');
                            var listData = $(this).data('listData');
                            $("#controlItemDetailModal").data('listData', listData); // 绑定当前布控任务数据
                            $('#controlItemDetailModal').find('.container-img .card-operate-box').empty(); // 清空详情按钮
                            // 订阅列表隐藏
                            $('#controlViewHeader').find('.nav-link').eq(0).click();
                            $('#controlViewHeader').find('.nav-link').eq(1).addClass('hide');
                            $('#subscribeItemDetailContainer').find('tbody').empty(); // 清空table数据
                            if (treeNode.subStatus == 1) {
                                loadControlTaskDetail($('#controlItemDetailContainer'), taskId, true); // 详情
                            } else {
                                loadControlTaskDetail($('#controlItemDetailContainer'), taskId, true); // 详情
                            }
                        }
                    });

                    var menuWidth = $('#rightMouseSubscribeTree').outerWidth(),
                        menuHeight = $('#rightMouseSubscribeTree').outerHeight(),
                        bodyWidth = $('body').outerWidth(),
                        bodyHeight = $('body').outerHeight();
                    if (event.clientX + menuWidth > bodyWidth - 20) {
                        $menu.css({
                            left: event.clientX - menuWidth
                        });
                    } else {
                        $menu.css({
                            left: event.clientX
                        });
                    }
                    if (event.clientY + menuHeight > bodyHeight - 20) {
                        $menu.css({
                            top: event.clientY - menuHeight + $(document).scrollTop()
                        });
                    } else {
                        $menu.css({
                            top: event.clientY + $(document).scrollTop()
                        });
                    }
                    // 绑定全局点击右键菜单消失代码
                    $(document).off('click.rightMouseSubscribeTree').on('click.rightMouseSubscribeTree', function () {
                        $('#rightMouseSubscribeTree').addClass('hide');
                    });
                    // 给生成的菜单栏里面进行事件阻止
                    $('#rightMouseSubscribeTree')[0].addEventListener('contextmenu', function (evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                    });
                },
                onExpand: function (event, treeId, treeNode) {
                    // treeNode.children ==>  存在children表示为有子菜单的级菜单
                    if (treeNode.children && treeNode.children.length > 0) {
                        var _treeObj = $.fn.zTree.getZTreeObj('subscribe-tree-list');
                        if (treeNode.isParent) {
                            _treeObj.reAsyncChildNodes(treeNode, 'refresh'); // 强行异步，否则数据会重复
                        }
                        return;
                    } else {
                        var port = 'v3/distributeManager/subscribeList',
                            _nodeSuccessFunc = function (data) {
                                if (data.code == '200') {
                                    var result = data.data;
                                    for (var i = 0; i < result.length; i++) {
                                        if (result[i].nodeType == 1) {
                                            result[i].isParent = false;
                                        } else {
                                            result[i].isParent = true;
                                        }
                                    }
                                    var _treeObj = $.fn.zTree.getZTreeObj('subscribe-tree-list');
                                    _treeObj.addNodes(treeNode, result);
                                } else {
                                    loadEmpty($('.control-right-box .card-side-content-box'), '暂无人员库', '系统异常');
                                }
                            };
                        if (treeNode.nodeType == 0) {
                            subscribePortData.id = treeNode.id;
                            loadData(port, true, subscribePortData, _nodeSuccessFunc);
                        }
                    }
                },
            }
        };
        var zTreeNodes = []; // zTree 的节点数据集合

        // 循环人员库数据
        for (var i = 0; i < data.length; i++) {
            if (!data[i].pId) {
                data[i].pId = 0;
            }
            if (data[i].nodeType == 1) {
                data[i].isParent = false;
            } else {
                data[i].isParent = true;
                if (data[i].id == '10') {
                    data[i].open = true;
                }
            }
        }
        zTreeNodes = data;
        // 初始化zTree树组件
        $(document).ready(function () {
            $.fn.zTree.init($('#subscribe-tree-list'), setting, zTreeNodes);
        })
    }

    $('#subscribe-tree-list').on("mouseover", ".node_name", function (event) { // 布控详情 单击事件入口
        event.stopPropagation();
        event.preventDefault();
        var $this = $(this);
        var taskId = $this.attr('taskid');
        if (taskId) {
            if (taskId == mouseOverTaskId) {
                return
            } else {
                mouseOverTaskId = taskId;
                $('#mouseOverControlDetail').remove();
                mouseOverControlBox2 = setTimeout(() => {
                    var port = 'v3/distributeManager/distributeTaskList',
                        data = {
                            taskId: taskId,
                            viewType: 5,
                            page: '1',
                            size: '10'
                        },
                        successFunc = function (data) {
                            hideLoading($('#controlItemDetailModal').find('.modal-body'));
                            if (data.code == '200' && data.data.list && data.data.list.length > 0) {
                                var result = data.data.list[0];

                                var tempStringObject = setArrayToStringObject(result);
                                var $menu = $([
                                    `<div id="mouseOverControlDetail" class="mouseOverRight">
										<ul class="card-item-text float-left">
											<li class="form-group">
												<label class="aui-form-label">创建人：</label>
												<div class="form-text form-words text-overflow">${result.creator ? result.creator : '暂无'} ${result.orgName ? '(' + result.orgName + ')' : ''}</div>
											</li>
											<li class="form-group">
												<label class="aui-form-label">创建时间：</label>
												<div class="form-text form-words text-overflow">${result.createTime ? result.createTime : '暂无'}</div>
											</li>
											<li class="form-group">
												<label class="aui-form-label">库标签：</label>
												<div class="form-text form-words text-overflow">${result.libName ? result.libName : '暂无'}${result.labelName ? ('-' + result.labelName) : ''}</div>
											</li>
											<li class="form-group">
												<label class="aui-form-label">阈值：</label>
												<div class="form-text form-words text-overflow">${result.threshold ? result.threshold : '0' + '%'}</div>
											</li>
											<li class="form-group">
												<label class="aui-form-label">公开范围：</label>
												<div class="form-text form-words text-overflow">${tempStringObject.viewString !== '暂无' ? tempStringObject.viewString : tempStringObject.viewUserString}</div>
											</li>
											<li class="form-group">
												<label class="aui-form-label">警情编号：</label>
												<div class="form-text form-words text-overflow">${result.jqbh ? result.jqbh.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '暂无'}</div>
											</li>
											<li class="form-group ${result.imgList && result.imgList.length > 0 ? 'display-none' : ''}">
												<label class="aui-form-label">布控对象：</label>
												<div class="form-text form-words text-overflow">${result.libName ? result.libName : '暂无'}${result.labelName ? ('-' + result.labelName) : ''}</div>
											</li>
											<li class="form-group imgList ${result.imgList && result.imgList.length > 0 ? '' : 'display-none'}">
												<label class="aui-form-label">布控对象:</label>
												<div class="form-text form-words text-overflow">
													<ul class="add-image-wrap add-type-3 usearchImgBk">
													</ul>
												</div>
											</li>
										</ul>
									</div>`
                                ].join(''));
                                var menuLen = $('#mouseOverControlDetail').length;
                                if (menuLen > 0) {
                                    $('#mouseOverControlDetail').off().remove();
                                }
                                $('#current-page-control').find(".controlContent.layout-type3").append($menu);
                                var top = $this.offset().top;
                                if (top + $("#mouseOverControlDetail").outerHeight() / 2 < document.body.clientHeight) {
                                    $menu.css({
                                        top: top - 85 + $(document).scrollTop() - $("#current-page-control").find(".controlTitle").outerHeight()
                                    });
                                    document.documentElement.style.setProperty(`--beforeTop`, '4.5rem');
                                } else {
                                    $menu.css({
                                        top: document.body.clientHeight - $("#mouseOverControlDetail").outerHeight() - $("#current-page-control").find(".controlTitle").outerHeight()
                                    });
                                    document.documentElement.style.setProperty(`--beforeTop`, (top - $menu.offset().top - 10) + 'px');
                                }

                                // 布控人图片
                                if (result.imgList && result.imgList.length > 0) {
                                    result.imgList.forEach(function (item, index) {
                                        var option = {
                                            'peopleId': item.peopleId,
                                            'libId': item.libId,
                                        };
                                        loadData('v2/memberInfos/getPeopleInfo', true, option, function (data) {
                                            if (data.code === '200') {
                                                var result = data.data;
                                                var liHtml = `<li class="add-image-item">
														<img class="add-image-img" alt="" src="${result.imageUrl ? result.imageUrl : './assets/images/control/person.png'}">
													</li>`;
                                                $('#mouseOverControlDetail').find('.usearchImgBk').append(liHtml);
                                                $('#mouseOverControlDetail').find('.usearchImgBk').find('.add-image-item.default').addClass('hide');
                                            }
                                        })
                                    });
                                }
                            }
                        };
                    loadData(port, true, data, successFunc);
                }, 1000);
                $this.off("mouseout").on("mouseout", function (event) { // 布控详情 单击事件入口
                    event.stopPropagation();
                    event.preventDefault();
                    mouseOverTaskId = '';
                    $('#mouseOverControlDetail').remove();
                    window.clearTimeout(mouseOverControlBox2);
                });
            }
        }
    })

    // 布控任务列表(左侧列表) 根据布控关键词来查询布控信息列表
    $("#subscribeSearchBox").on("click", "#searchSubscribeBut", function () {
        //点击搜索按钮查询关键词
        subscribePortData.id = "";
        subscribePortData.name = $("#searchSubscribeInput").val();
        initControlTree($('#subscribeTabContent'), subscribePortData);
    }).on("keydown", "#searchSubscribeInput", function (e) {
        //按键盘回车事件开始搜索
        var code = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
        if (code == 13) {
            subscribePortData.id = "";
            subscribePortData.name = $("#searchSubscribeInput").val();
            initControlTree($('#subscribeTabContent'), subscribePortData);
        }
    });


    /** 订阅相关事件--begin-- **/
    function subscribeConfigOpt(taskId, isEdit) {
        var port = 'v2/subscribe/subDetail',
            portData = {
                taskId: taskId,
                randomNum: Math.random()
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    var subscribeResult = data.data;
                    // 阈值
                    subscribeSlider(subscribeResult.threshold, isEdit);

                    if (subscribeResult.cameraList && subscribeResult.cameraList.length !== 0) {
                        // 布控区域-地图 赋值
                        var cameraNameList = [],
                            cameraIdList = [],
                            maplistArr = [];
                        subscribeResult.cameraList.forEach(function (item) {
                            cameraNameList.push(item.cameraName);
                            cameraIdList.push(item.cameraId);
                            var maplistObj = {};
                            maplistObj.arr = {
                                id: item.cameraId
                            };
                            maplistObj.listArr = {
                                name: item.cameraName,
                                guid: item.cameraId
                            };
                            maplistArr.push(maplistObj);
                        });
                        $('#control_cameraList').data({
                            'otherCamraList': cameraIdList,
                            'mapList': maplistArr
                        }).val(cameraNameList.join(',')).attr("title", cameraNameList.join(','));
                        // $('#cameraRadioLabel2').click();
                        $('#controlSearchList').addClass('hide');
                        $('#controlSearchMap').removeClass('hide');
                        $('#control_cameraList').removeClass('no-input-warning').closest('.form-group').find('.text-danger').addClass('hide');
                        $("#cameraRadioLabel2").addClass("ui-checkboxradio-checked");
                        $("#cameraRadioLabel1").removeClass("ui-checkboxradio-checked");
                    } else {
                        // 布控区域-列表 公开范围 给布控区域和公开范围赋值
                        if (control_bodyList) {
                            $('#control_orgList').data({
                                'cameraList': matchList(control_bodyList, subscribeResult.orgList).newCameraList,
                                'gidArr': matchList(control_bodyList, subscribeResult.orgList).newGidArr
                            }).val(matchList(control_bodyList, subscribeResult.orgList).newNameArr.join(','));
                        } else {
                            var port = 'v2/org/getOrgInfos',
                                dataLoad = {
                                    returnType: 4,
                                    orgType: 1,
                                    userType: 1
                                }
                            successFunc = function (data) {
                                if (data.code === '200') {
                                    control_bodyList = data.data;
                                    $('#control_orgList').data({
                                        'cameraList': matchList(control_bodyList, subscribeResult.orgList).newCameraList,
                                        'gidArr': matchList(control_bodyList, subscribeResult.orgList).newGidArr
                                    }).val(matchList(control_bodyList, subscribeResult.orgList).newNameArr.join(','));
                                }
                            };
                            loadData(port, true, dataLoad, successFunc, '', 'GET');
                        }
                    }

                    // 通知方式
                    if (subscribeResult.noticeWay) {
                        var noticeWays = subscribeResult.noticeWay.split(',');
                        for (var i = 0; i < noticeWays.length; i++) {
                            $("#control_noticeWays").find('input').each(function (index, el) {
                                if ($(el).val() == noticeWays[i]) {
                                    $("#control_noticeWays").find('input').eq(index).click();
                                }
                            })
                        }
                    }

                    if (isEdit) {
                        // 不可编辑
                        $('#subscribeItemModal').find('[id^="control_"]').attr('disabled', 'disabled');
                        $('#control_noticeWays').find("input[type=checkbox]").attr("disabled", "disabled");
                        $('#cameraRadioLabel1').closest('.form-group').find("input[type=radio]").attr("disabled", "disabled");
                    }
                }
            }
        loadData(port, true, portData, successFunc);
    }

    // 布控区域 切换列表模式 单选框点击事件
    $('#cameraRadioLabel1').on('click', function () {
        if ($(this).next().attr('disabled')) {
            return;
        }
        $('#controlSearchMap').addClass('hide');
        $('#controlSearchList').removeClass('hide');
        $('#control_orgList').removeClass('no-input-warning').closest('.form-group').find('.text-danger').addClass('hide');

        $("#cameraRadioLabel1").addClass("ui-checkboxradio-checked");
        $("#cameraRadioLabel2").removeClass("ui-checkboxradio-checked");
    });

    // 布控区域 切换地图模式 单选框点击事件
    $('#cameraRadioLabel2').on('click', function () {
        if ($(this).next().attr('disabled')) {
            return;
        }
        $('#controlSearchList').addClass('hide');
        $('#controlSearchMap').removeClass('hide');
        $('#control_cameraList').removeClass('no-input-warning').closest('.form-group').find('.text-danger').addClass('hide');

        $("#cameraRadioLabel2").addClass("ui-checkboxradio-checked");
        $("#cameraRadioLabel1").removeClass("ui-checkboxradio-checked");
    });

    // 布控区域 列表模式 输入框点击事件 调用树组件 
    $('#control_orgList').orgTree({
        all: true, //人物组织都开启
        area: ['960px', '718px'], //弹窗框宽高
        search: true, //开启搜索
        cls: 'camera-list',
        ajaxFilter: 'control_orgList',
        node: 'control_orgList',
        newBk: true
    });

    // 布控区域 地图模式 输入框点击事件 调用树组件
    $('#control_cameraList').orgTree({
        all: true, //人物组织都开启
        area: ['1400px', '780px'], //弹窗框宽高
        search: false, //开启搜索
        cls: 'camera-list',
        ajaxFilter: false,
        node: 'control_cameraList',
        newBk: true,
        control_cameraList: true
    });

    // 布控区域 列表模式 删除按钮事件
    $('#control_orgList').siblings().on('click', function () {
        $('#control_orgList').val('');
        $('#control_orgList').attr('title', '');
        var $data = $('#control_orgList').data('cameraList');
        if ($data) {
            $('#control_orgList').data({
                'cameraList': [],
                'gidArr': [],
                'otherCamraList': []
            })
        }
    });

    // 布控区域 地图模式 删除按钮事件
    $('#control_cameraList').siblings().on('click', function () {
        $('#control_cameraList').val('');
        $('#control_cameraList').attr('title', '');
        var $data = $('#control_cameraList').data('otherCamraList');
        if ($data) {
            $('#control_cameraList').data({
                'cameraList': [],
                'gidArr': [],
                'otherCamraList': [],
                'mapList': []
            })
        }
    });

    // 告警接收人 输入框点击事件 调用树组件
    $('#control_userList').orgTree({
        all: true, //人物组织都开启
        area: ['620px', '542px'], //弹窗框宽高
        search: true, // 搜索事件不在orgTree
        newBk: true,
        noMap: true,
        noTree: true,
        ajaxFilter: false,
        node: 'control_userList'
    });

    // 告警接收人 删除按钮事件
    $('#control_userList').siblings().on('click', function () {
        $('#control_userList').val('');
        $('#control_userList').attr('title', '');
        $('#control_userList').data({
            'saveVal': [],
            'userList': [],
            'userIdArr': []
        })
    });

    // 告警接收人 点击事件
    $('#control_userList').on('click', function () {
        // var orgids = $('#control_userList').data('gidArr');
        $('.multiPickerDlg_right_no_result').html('<i></i>未选择人员');
        $('#memberSearchInput').attr('placeholder', '搜索人员');
        $('.type-change-left').text('人员列表');
        $('.multiPickerDlg_right_title>span').text('已选接收人');
        $('#partyTree').remove();
        $('.type-change-right').hide();
        $('.layui-layer-btn').attr('id', 'userList');

        var viewUserList = [];
        // 告警接收人 左侧列表参数
        var controlOptVal = {
            page: '1',
            size: '15'
        };
        var searchPage = 2;
        // 告警接收人
        showLoading($('.layui-layer-content'));
        var receivePort = 'v2/user/getOrgUserInfos';
        var receiveSuccessFunc = function (data) {
            if (data.code === '200') {
                var list = data.data.list,
                    total = data.data.total;
                $('#memberSearchInput').removeAttr('disabled');
                onloadNoticeUserList(list, total);
            }
            hideLoading($('.layui-layer-content'));
        };
        loadData(receivePort, true, controlOptVal, receiveSuccessFunc);


        function onloadNoticeUserList(list, total) {
            $('#saveNode').html('');
            var liList = '',
                html = '';
            if (list) {
                // 判断是否有选中值
                var userSaveVal = $('#control_userList').data('saveVal');
                if (list.length > 0) {
                    for (var i = 0; i < list.length; i++) {
                        liList += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`
                    };
                    html = `<div id="receiveResult" class="ww_searchResult">
					<ul id="receive_member_list" class="ztree">${liList}</ul>
				</div>`;
                } else {
                    html = '<p class="search_member_none">当前未选可见范围</p>';
                    $('.multiPickerDlg_right_title').find('.js-remove-all').click();
                }
                $('.multiPickerDlg_search_wrapper').append(html);
                if (userSaveVal && userSaveVal.length > 0) {
                    $('#receive_member_list').data({
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
                        $('#receive_member_list').find('li[userId="' + liLoginName + '"] .button').addClass('checkbox_true_full');
                    });
                    $('#js-camera-totle').text(userSaveVal.length);
                    $('.multiPickerDlg_right_no_result').hide();
                    $('#saveNode').html(liHtml);
                } else {
                    $('#receive_member_list').data({
                        'cameraList': []
                    });
                }

                // 点击清空事件
                $('.js-remove-all').off('click').on('click', function () {
                    $('#saveNode').html('');
                    $('#receive_member_list').data({
                        'cameraList': []
                    });
                    $('#js-camera-totle').text('0');
                    $('#receive_member_list li .button').removeClass('checkbox_true_full');
                    $('.multiPickerDlg_right_no_result').show();
                });

                // // 布控详情默认选中项
                // if (controlId && $('#control_userList').data('userList').length > 0) {
                // 	$('#control_userList').data({
                // 		'userList': $('#control_userList').data('userList'),
                // 		'saveVal': controlIdResult.userList
                // 	});

                // 	function defaultSelected(list) {
                // 		var liHtml = '';
                // 		list.forEach(function (item) {
                // 			controlIdResult.userList.forEach(function (el, idx) {
                // 				if (item.userId == el.userId) {
                // 					$('#receive_member_list').find('li[userId="' + el.userId + '"] .button').addClass('checkbox_true_full');
                // 					el.index = idx;
                // 				}
                // 			});
                // 		});
                // 		controlIdResult.userList.forEach(function (el) {
                // 			liHtml += '<li title=' + el.userName + ' data-name=' + el.userName + ' userId=' + el.userId + ' class="ww_menuDialog_DualCols_colRight_cnt_item token-input-token js_list_item">' +
                // 				'<span class="ww_commonImg icon icon_folder_blue"></span>' +
                // 				'<span class="ww_treeMenu_item_text" title=' + el.userName + '>' + el.userName + '</span>' +
                // 				'<a href="javascript:" class="ww_menuDialog_DualCols_colRight_cnt_item_delete"><span class="ww_commonImg ww_commonImg_DeleteItem js_delete"></span></a>' +
                // 				'</li>';
                // 		});
                // 		$('#saveNode').html(liHtml);
                // 		$('.multiPickerDlg_right_no_result').hide();
                // 		$('#js-camera-totle').text(controlIdResult.userList.length);
                // 		$('#receive_member_list').data({
                // 			'cameraList': controlIdResult.userList
                // 		});
                // 	}
                // 	defaultSelected(list);
                // }

                // 右侧点击取消选中
                $('#saveNode').off('click', 'li').on('click', 'li', function () {
                    var $this = $(this);
                    var userId = $this.attr('userId');
                    var saveVal = [];
                    $('#receive_member_list').data('cameraList').forEach(function (item) {
                        saveVal.push(item);
                    })
                    for (var i = 0; i < saveVal.length; i++) {
                        if (saveVal[i].userId == userId || saveVal[i].userId == userId) {
                            saveVal.splice(i, 1);
                            $('#receive_member_list').find('li[userId="' + userId + '"] .button').removeClass('checkbox_true_full');
                            $('#search_member_list').find('li[userId="' + userId + '"] .button').removeClass('checkbox_true_full');
                        };
                    };
                    $('#receive_member_list').data({
                        'cameraList': saveVal
                    });
                    $this.remove();
                    $('#js-camera-totle').text($('#saveNode>li').length);
                    if ($('#saveNode>li').length == 0) {
                        $('.multiPickerDlg_right_no_result').show();
                    }
                });
                // 点击确定
                $('#userList .layui-layer-btn0').on('click', function () {
                    var saveVal = $('#receive_member_list').data('cameraList') && $('#receive_member_list').data('cameraList').length > 0 ? $('#receive_member_list').data('cameraList') : [];
                    var userList = [];
                    var nameArr = [];
                    if (saveVal.length > 0) {
                        saveVal.forEach(function (item) {
                            var liLoginName = item.userId;
                            var liNiName = item.userName;
                            userList.push(liLoginName);
                            nameArr.push(liNiName);
                        })
                    }
                    // if (controlId) {
                    // 	$('#control_userList').data({
                    // 		'userIdArr': []
                    // 	});
                    // }
                    $('#control_userList').data({
                        'userList': userList,
                        'saveVal': saveVal
                    });
                    $('#control_userList').val(nameArr.join(',')).attr('title', nameArr.join(','));

                    if ($('#control_userList').val() !== '' && $('#control_userList').val() !== []) {
                        $('#control_userList').removeClass('no-input-warning').closest('.form-group').find('.text-danger').addClass('hide');
                    }
                    $('.layui-layer-btn1').click();
                });
                // 左侧列表 点击事件
                function memberListClick($this) {
                    $this.find('.button').toggleClass('checkbox_true_full');
                    $('.multiPickerDlg_right_no_result').hide();
                    var orgId = $this.attr('data-id');
                    var userName = $this.attr('data-name');
                    var title = $this.attr('title');
                    var userId = $this.attr('userId');
                    var index = $this.index();
                    var repInx; //获取重复数组的索引
                    var newSaveVal = [];
                    if ($('#receive_member_list').data('cameraList') && $('#receive_member_list').data('cameraList').length > 0) {
                        $('#receive_member_list').data('cameraList').forEach(function (item) {
                            newSaveVal.push(item);
                        });
                    }
                    if ($this.closest('#searchResult').length > 0) {
                        $('#receiveResult').find('li[userId="' + userId + '"]').find('.button').toggleClass('checkbox_true_full');
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
                                userId: userId
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
                    $('#receive_member_list').data({
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
                $('#receive_member_list').off('click', 'li').on('click', 'li', function () {
                    var $this = $(this);
                    memberListClick($this);
                });
                $('#search_member_list').off('click', 'li').on('click', 'li', function () {
                    var $this = $(this);
                    memberListClick($this);
                });
                searchSuccessFunc = function (data) {
                    if (data.code === '200') {
                        var list = data.data.list;
                        if (list.length > 0) {
                            var li = "";
                            for (var i = 0; i < list.length; i++) {
                                var receiveList = $('#receive_member_list').data('cameraList'),
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
                            $("#search_member_list").show();
                            $('#search_member_list').addClass('ztree').html(li);
                        } else {
                            $('.search_member_none').show();
                            $("#search_member_list").hide();
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
                                                var receiveList = $('#receive_member_list').data('cameraList'),
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
                $('#clearMemberSearchInput').off('click', 'li').on('click', function () {
                    $('#receiveResult').show();
                })
                //布控人员检索
                $('#memberSearchInput').off('keydown').on('keydown', function (event) {
                    event.stopPropagation();
                }).on('keyup', function (event) {
                    var value = $(this).val();
                    // 如果可见范围为按人，receivePort不存在，不需要进行搜索
                    if (receivePort && value !== '' && value !== null) {
                        $('#receiveResult').hide();
                        $('#searchResult').show();
                        searchPage = 2;
                        loadData(receivePort, true, {
                            name: value
                        }, searchSuccessFunc);
                    } else {
                        $('#receiveResult').show();
                        $('#searchResult').hide();
                    }
                });
                // 滚动加载数据
                $('#receiveResult').off('mousewheel').on('mousewheel', function () {
                    //tab内容列表滚动到底部进行下一分页的懒加载事件
                    var $this = $(this),
                        $currentContainer = $('#receive_member_list'),
                        viewHeight = $this.height(), //视口可见高度
                        contentHeight = $currentContainer[0].scrollHeight, //内容高度
                        scrollHeight = $this.scrollTop(), // 已经滚动了的高度
                        currentCardItemNum = $currentContainer.find("li").length,
                        totalCardItemNUM = parseInt(total);
                    // 如果可见范围为按人，receivePort不存在，不需要进行数据加载
                    if (receivePort && (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM)) {
                        controlOptVal.page = (Number(controlOptVal.page) + 1).toString(10);
                        var successFn = function (data) {
                            if (data.code === '200') {
                                $('#loadLi').remove();
                                var liList = '';
                                var list = data.data.list;
                                for (var i = 0; i < list.length; i++) {
                                    liList += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`
                                };
                                $('#receive_member_list').append(liList);
                                var userSaveVal = $('#control_userList').data('saveVal');
                                if ($('#receive_member_list').data('cameraList') && $('#receive_member_list').data('cameraList').length > 0 && userSaveVal) {
                                    userSaveVal.forEach(function (item) {
                                        //左侧选中
                                        $('#receive_member_list').find('li[userId="' + (item.userId ? item.userId : item.userId) + '"] .button').addClass('checkbox_true_full');
                                        item.index = $('li[userId="' + (item.userId ? item.userId : item.userId) + '"]').index();
                                    });
                                }
                            }
                        }
                        loadData(receivePort, true, controlOptVal, successFn);
                        if ($('#loadLi').length == 0) {
                            var loadLi = '<div id="loadLi" style="margin-top:15px"></div>';
                            $('#receive_member_list').after(loadLi);
                            showLoading($('#loadLi'));
                        }
                    }
                });
            } else {
                $('.multiPickerDlg_search_wrapper').append('<div class="search_member_none">当前未选可见范围</div>');
            }
        }
    })

    // 左侧 编辑订阅/订阅布控/指定订阅弹框 确定按钮点击事件
    $("#subscribeItemModal").on("click", ".btn-primary", function () {
        $('#subscribeItemModal').find('[id^="control_"]').removeClass('no-input-warning').closest('.aui-col-18').find('.text-danger').addClass('hide');
        var taskId = $("#subscribeItemModal").data('taskId');

        //阈值
        var threshold = Number($('#control_slider').val());
        var thresholdMin = $("#subscribeItemModal").data('threshold') ? $("#subscribeItemModal").data('threshold') : 0;
        if (threshold < thresholdMin) {
            warningTip.say('订阅阈值不能小于布控任务阈值' + thresholdMin);
            subscribeSlider(thresholdMin);
            return;
        }

        //布控区域 机构
        if ($("#cameraRadioLabel1").hasClass('ui-checkboxradio-checked')) {
            var orgList = $('#control_orgList').data('gidArr') ? $('#control_orgList').data('gidArr') : [];
            var cameraList = [];
        } else {
            //布控区域 框选镜头
            var cameraList = $('#control_cameraList').data('otherCamraList') ? $('#control_cameraList').data('otherCamraList') : [];
            var orgList = []
        }
        //是否推送警务云
        var noticeWays = [];
        $('#control_noticeWays').find('label').each(function (index, item) {
            if (item.className.indexOf('ui-checkboxradio-checked ui-state-active') > -1) {
                noticeWays.push(Number(item.nextElementSibling.value));
            }
        });

        //告警接收人
        var userList = $('#control_userList').data('userList') ? $('#control_userList').data('userList') : '';

        var portData = {
            taskId: taskId,
            threshold: threshold,
            noticeWays: noticeWays,
            orgList: orgList,
            cameraList: cameraList,
            userList: userList
        };

        //校验
        var controlFlag = true;
        Object.keys(portData).forEach(function (key) {
            if ((key == 'taskId' || key == 'threshold') && (portData[key] == '' || portData[key] == [])) {
                $('#control_' + key).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip').removeClass('hide');
                controlFlag = false;
            }
            if (key == 'orgList' || key == 'cameraList') {
                if ((portData.orgList && portData.orgList.length == 0) && (portData.cameraList && portData.cameraList.length == 0)) {
                    $('#control_' + key).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip').removeClass('hide');
                    controlFlag = false;
                }
            }
            if (key == 'userList' && $("#subscribeItemModal").find('.modal-title').text() == '指定订阅') {
                if (portData[key] == '' || portData[key] == []) {
                    $('#control_' + key).addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip').removeClass('hide');
                    controlFlag = false;
                }
            }
        });

        var cancelConcernSuccessFunc = function (data) {
            hideLoading($("#subscribeItemModal"));
            $("#subscribeItemModal").modal('hide');
            if (data.code === '200') {
                var text = $("#subscribeItemModal").find('.modal-title').text() + '成功！！！';
                warningTip.say(text);
                subscribePortData.id = "";
                initControlTree($('#subscribeTabContent'), subscribePortData);
            } else {
                warningTip.say(data.message);
            }
        };

        if (controlFlag) {
            if (portData.userList.length > 0) {
                var port = 'v2/subscribe/subPersonList',
                    portDataPeople = {
                        taskId: taskId,
                        page: 1,
                        size: 10
                    },
                    successFunc = function (data) {
                        if (data.code === '200') {
                            var result = data.data.list;
                            var nicknameList = '';
                            result.map(function (el, index) {
                                portData.userList.map(function (ele, n) {
                                    if (el.userId == ele) {
                                        controlFlag = false;
                                        nicknameList += el.nickname + '，';
                                    }
                                })
                            })
                            if (controlFlag) {
                                showLoading($("#subscribeItemModal"));
                                loadData('v2/subscribe/taskAlarm', true, portData, cancelConcernSuccessFunc);
                            } else {
                                $('#control_userList').addClass('no-input-warning').closest('.aui-col-18').find('.text-danger.tip1').removeClass('hide').html(nicknameList + '已订阅该任务，不可再次指定');
                            }
                        } else {
                            warningTip.say(data.message);
                        }
                    };
                loadData(port, true, portDataPeople, successFunc);
            } else {
                showLoading($("#subscribeItemModal"));
                loadData('v2/subscribe/taskAlarm', true, portData, cancelConcernSuccessFunc);
            }
        }

    });

    // 左侧 取消订阅弹框 确定按钮点击事件
    $("#cancelSubscribeItemModal").on("click", ".btn-primary", function () {
        if ($("#cancelSubscribeItemModal").attr("type") == '0') {  //撤控
            showLoading($("#cancelSubscribeItemModal"));
            var taskId = $('#subscribeTabContent').data('taskId'); // 先获取数据载关闭弹框
            var port = 'v2/subscribe/taskAlarm_del',
                portData = {
                    taskId: taskId
                },
                cancelConcernSuccessFunc = function (data) {
                    $("#cancelSubscribeItemModal").modal('hide'); // 关闭弹框
                    hideLoading($("#cancelSubscribeItemModal"));
                    if (data.code === '200') {
                        warningTip.say('取消订阅成功！！！');
                        subscribePortData.id = "";
                        initControlTree($('#subscribeTabContent'), subscribePortData);
                    } else {
                        warningTip.say(data.message);
                    }
                };
            loadData(port, true, portData, cancelConcernSuccessFunc, '', 'DELETE');
        } else {
            var taskId = $('#removeControl').data('result').id; // 先获取数据载关闭弹框
            var port = 'v2/distributeManager/stopDistributeTask',
                portData = {
                    taskId: taskId,
                    stopReason: '删除'
                },
                cancelConcernSuccessFunc = function (data) {
                    $("#cancelSubscribeItemModal").modal('hide'); // 关闭弹框
                    if (data.code === '200') {
                        warningTip.say('删除布控成功！！！');
                        controlSearchData.page = '1';
                        controlSearchData.taskId = '';
                        loadControlSearchList($("#controlTabContent .tab-container"));
                    } else {
                        warningTip.say(data.message);
                    }
                };
            loadData(port, true, portData, cancelConcernSuccessFunc);
        }
    });
    /** 订阅弹框事件--end-- **/

    //导入文档下载
    $("#controlAskDoc").on("click", function () {
        var post_url = encodeURI(serviceUrl + "/v2/file/downloadByHttpUrl?name=" + encodeURI(encodeURI(decodeURIComponent('布控操作流程介绍', true))) + "&url=http://190.13.37.6:10085/production/lawFile/202004/08/2020111019246789.doc");
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    $("#alarmAskKnow").on("click", function () {
        $("#alarmAskModal").modal("hide");
    })

})(window, window.jQuery)