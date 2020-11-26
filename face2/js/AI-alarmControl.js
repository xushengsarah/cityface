(function (window, $) {
	//检索条件
	var controlSearchDataAI = {
			page: '1',
			size: '20',
			viewTypes: ['1'],
			runStatus: '2', //任务状态
			grade: '', //任务等级（1紧急2重要3一般）
			orgIds: [], //创建任务所属机构数组
			libId: '', //比对库id
			startTime: '', //任务开始时间
			endTime: '', //任务结束时间
			keywords: '',
			id: ''
		},
		// 告警请求参数
		controlAlarmDataAI = {
			taskId: '',
			startTime: '',
			endTime: '',
			status: '0',
			page: 1,
			size: 10
		},
		targetControlTaskId = '',
		$alarmTargetDom = null,
		userLoginName = '', // 用户名字
		isAlreadyConcerned = false; // 控制显示关注还是取消关注

	loadUserInfo();
	initControlSearch();

	/**
	 * 获取登录人的信息
	 */
	function loadUserInfo() {
		var port = 'v2/user/getUserInfo',
			successFunc = function (data) {
				if (data.code === '200') {
					userLoginName = data.userName;
				}
			};
		loadData(port, true, null, successFunc, undefined, 'GET');
	};

	/**
	 * 根据默认初始值查询布控信息列表；默认数据展示信息
	 */
	function initControlSearch() {
		loadDictionaryInfo($("#controlGradeConditionAI .text-content"));
		loadOrgInfo($("#createOrgConditionAI .text-content"));
		loadControlLib($("#controlLibConditionAI .text-content"));
		loadControlSearchListAI($("#controlTabContentAI .tab-container"));
		$('#controlTabContentAI .tab-container').data('curPage', 1);
		window.initDatePicker1($('#customAiAlarm_time'), '', false);
		window.initDatePicker1($('#filterAiAlarm_time'), '', false);
		window.initDatePicker1($('#restartAiAlarm_time'), '', false, true, false, {
			limitLength: 15
		});
	};

	/**
	 * 根据数据字典类型查找后台的 任务等级
	 * @param {object} $typeDom  类型的dom容器
	 * @param {object} $gradeDom  任务等级的dom容器
	 */
	function loadDictionaryInfo($gradeDom) {
		var port = 'v2/dic/dictionaryInfo',
			data = {
				kind: 'TASK_GRADE'
			},
			successFunc = function (data) {
				if (data.code == '200') {
					var controlTaskGrade = data.data;
					if ($gradeDom && controlTaskGrade) {
						var _gradeHtml = '';
						for (var j = 0; j < controlTaskGrade.length; j++) {
							_gradeHtml += `<span class="text text-btn" gradeId="${controlTaskGrade[j].id}">${controlTaskGrade[j].name}</span>`
						}
						$gradeDom.html(_gradeHtml);
					}
				} else {
					warning.say(data.message);
				}
			};
		loadData(port, true, data, successFunc, undefined, 'GET');
	};

	/**
	 * 加载创建任务所属机构
	 * @param {*} $container 目标容器
	 */
	function loadOrgInfo($container) {
		var port = 'v2/org/getOrgInfos',
			data = {
				orgType: '1',
				userType: '2',
				returnType: '3'
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
					warning.say(data.message);
				}
			};
		loadData(port, true, data, successFunc, undefined, 'GET');
	};

	/**
	 * 布控详情，过滤条件：布控库，加载布控库的库列表
	 * @param {*} $container 目标容器
	 */
	function loadControlLib($container) {
		var port = 'lib/getDynamicLib',
			data = {},
			successFunc = function (data) {
				if (data.code == '000') {
					var result = data.result;
					if (result) {
						var _itemHtml = '';
						for (var i = 0; i < result.length; i++) {
							_itemHtml += `<span class="text text-btn" libId="${result[i].libid}">${result[i].libname}</span>`
						}
						$container.html(_itemHtml);
					}
				} else {
					warning.say(data.msg);
				}
			};
		loadData(port, true, data, successFunc);
	};

	/**
	 *  获取布控任务查询列表的信息 ,生成左侧内容节点
	 * @param {*} $container
	 * @param {*}  isScrollBottom  左侧边栏是否滚动到底部
	 * @param {*}  page  左侧边栏滚动到底部对应的分页数据
	 */
	function loadControlSearchListAI($container, isScrollBottom, page) {
		var port = 'v2/historyTask/taskList',
			successFunc = function (data) {
				if (!isScrollBottom) {
					hideLoading($('#AI-alarmPage .side-left'));
				} else {
					$("#bottomLoadingBoxAI").addClass("display-none");
				}
				if (data.code == '200') {
					var result = data.data.list,
						currentPage = parseInt(controlSearchDataAI.page),
						tempStringObject = setArrayToStringObject(result);
					if (result.length > 0 && currentPage <= data.data.totalPage) {
						var _html = '';
						for (var i = 0; i < result.length; i++) {
							var tempString = '';
							if (result[i].runStatus === "1") {
								tempString = `<span class="card-extra text-prompt aui-col-8" title="待运行">待运行</span>`;
							} else if (result[i].runStatus === '3') {
								tempString = `<span class="card-extra card-extra-gray text-lighter aui-col-8" title="暂停">暂停</span>`;
							} else if (result[i].runStatus === "2") {
								tempString = `<span class="card-extra text-active aui-col-8" title="剩余${result[i].restTime}天">剩余${result[i].restTime}天</span>`;
							} else if (result[i].runStatus === "4") {
								tempString = `<span class="card-extra card-extra-gray text-lighter aui-col-8" title="已结束">已结束</span>`;
							}
							// <div class="tag">${result[i].typeName ? result[i].typeName : '常规布控'}</div>
							_html += `
							<li class="clearfix card-item ${i === 0 && !isScrollBottom ? 'active' : ''}" taskId="${result[i].id}">
								<!--<div class="card-item-img float-left h-100">
									<div class="img-red-circle hide"></div>
									<img class="w-100" src="./assets/images/control/bukong-
									${(result[i].type === 'ZDSJ' || result[i].type === 'XLBK' || result[i].type === 'YFAB') ? result[i].type : 'CGBK'}
									-2.png" alt="">									
								</div>-->
								<ul class="card-item-text float-left">
									<li class="card-info-title">
										<span class="card-title text-overflow">${result[i].name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
										<!--${result[i].runStatus === "1" ? '' : `<span class="tag grade${result[i].grade}">${result[i].alarmCount && result[i].alarmCount !== '0' ? '共' + result[i].alarmCount : 0}</span>`}-->
									</li>
									<!--<li class="form-group">
										<label class="aui-form-label">布控对象：</label>
										<div class="form-text form-words">${result[i].libList && result[i].libList.length > 0 ? '共' + result[i].libList.length + '个库'
									: '共' + (result[i].imgList ? result[i].imgList.length : '0') + '个人'}</div>
									</li>-->
									<li class="form-group">
										<label class="aui-form-label">创建人：</label>
										<div class="form-text form-words text-overflow" title="${result[i].creator ? result[i].creator : '暂无' + (result[i].orgName ? '(' + result[i].orgName + ')' : '')}">
										${(result[i].creator ? result[i].creator : '暂无') + (result[i].orgName ? '(' + result[i].orgName + ')' : '')}</div>
									</li>
									<li class="form-group">
										<label class="aui-form-label">任务期限：</label>
										<div class="form-text form-words task-card-creattime-overflow aui-row">
											<span class="aui-col-16" title="${result[i].startTime ? (result[i].startTime.split(" ")[0] + " 至 " + result[i].endTime.split(" ")[0]) : '暂无'}">${result[i].startTime ? (result[i].startTime.split(" ")[0] + " 至 " + result[i].endTime.split(" ")[0]) : '暂无'}</span>
											${tempString}
										</div>
									</li>
								</ul>
							</li>
						`;
						}

						if (isScrollBottom) {
							$container.append(_html);
							$container.data('curPage', page);
							controlSearchDataAI.page = page;
						} else {
							$container.html(_html);
							targetControlTaskId = result[0].id;
							loadControlTaskDetail($('#controlItemDetailContainerAI'), targetControlTaskId);
							if (controlSearchDataAI.runStatus !== "1") { //待运行状态下 不会有告警信息
								refreshAlarmPageList($("#alarmListContainerAI"), $("#alarmListPageAI"), true);
							} else {
								loadEmpty($("#alarmListContainerAI"), "当前暂无告警信息", "", true);
								$("#alarmListPageAI").empty();
								$("#allAlarmCountAI").text('0');
							}
							$("#controlTabContentAI").scrollTop(0);
						}

						$("#controlContentContainerAI").removeClass('display-none');
						$("#controlEmptyContainerAI").addClass('display-none');

						$('#controlListTotalAI').text(data.data.total);
						// 初始化任务列表，所有的页面红点清空
						$('#myControlTabContent').find('.img-red-circle').addClass('hide')
						$('#controlTabConten').find('.img-red-circle').addClass('hide')
					} else {
						if (isScrollBottom) {
							return;
						} else {
							loadEmpty($container, "", "检索数据为空,请重新修改检索条件");
							$("#controlContentContainerAI").addClass('display-none');
							$("#controlEmptyContainerAI").removeClass('display-none');
							loadEmpty($("#controlEmptyContainerAI"), "", "检索数据为空,请重新修改检索条件");
							$('#controlListTotalAI').text('0');
						}
					}
				} else {
					loadEmpty($container, "", "系统异常，请重新修改过滤条件");
					$('#controlListTotalAI').text('0');
				}
			};

		if (page) {
			controlSearchDataAI.page = page;
		}
		loadData(port, true, controlSearchDataAI, successFunc);
	};

	/**
	 * 根据任务id，查询布控任务详情
	 * @param {string} taskid 布控任务id
	 * @param {*} $container 
	 */
	function loadControlTaskDetail($container, taskid) {
		isAlreadyConcerned = false; //是否在通知人列表
		showLoading($container);
		var port = 'v2/historyTask/taskList',
			data = {
				id: taskid,
				page: 1,
				size: 10
			},
			successFunc = function (data) {
				hideLoading($container);
				if (data.code == '200') {
					var result = data.data.list[0],
						controlGrade = ["紧急", "重要", "一般"];
					if (result) {
						if (result.noticeUserList) {
							for (var t = 0; t < result.noticeUserList.length; t++) {
								if (userLoginName === result.noticeUserList[t].userId) {
									isAlreadyConcerned = true;
								}
							}
						}
						$container.attr("taskId", result.id);
						var _html = '',
							tempStringObject = {};

						tempStringObject = setArrayToStringObject(result);
						var text = '';
						if (result.runStatus === '3' || result.runStatus === '4') {
							text = '重启';
						}
						_html = `<div class="card-content-info border-0">
								<div class="card-item-title">
									<span class="card-title">${result.name.replace(/</g, '&lt;').replace(/>/g, '&gt;') ? result.name.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '暂无'}</span>
									<span class="float-right ${result.enableEdit === '0' ? 'display-none' : ''}">
										<span class="text-link aui-mr-sm ${(result.runStatus === '3' || result.runStatus === '4' || result.runStatus === '2') ? 'display-none' : ''}" id="controlItemEditBtnAI" prevPageName="control">
											<i class="icon aui-icon-edit"></i>
											<span class="text text-white">编辑</span>
										</span>
										<span class="text-link aui-mr-sm ${(result.runStatus === '3' || result.runStatus === '4' || result.runStatus === '1') ? 'display-none' : ''}" id="controlItemEndBtnAI" data-toggle="modal" data-target="#controlItemEndModalAI">
											<i class="icon aui-icon-forbidden"></i>
											<span class="text text-white">暂停</span>
										</span>
										<span class="text-link aui-mr-sm ${(result.runStatus === '3' || result.runStatus === '4') ? 'display-none' : ''}" id="controlItemDelBtnAI" data-toggle="modal" data-target="#controlItemDelModalAI">
											<i class="icon aui-icon-delete-line"></i>
											<span class="text text-white">删除</span>
										</span>
										<span class="text-link ${(result.runStatus === '1' || result.runStatus === '2') ? 'display-none' : ''}" id="controlPostponeAI" data-toggle="modal" data-target="#controlPostponeModalAI">
											<i class="icon aui-icon-history2"></i>
											<span class="text text-white">${text}</span>
										</span>
									</span>
									<span class="float-right ${(result.runStatus === '3' || result.runStatus === '4') ? 'display-none' : ''}">
										<span class="text-link aui-mr-sm  ${result.enableEdit === '0' ? '' : 'concern-right'}" id="controlItemConcernBtnAI">
											<i class="icon aui-icon-collection ${isAlreadyConcerned ? 'blue-color' : 'orange-color'}"></i>
											<span class="text text-white">${isAlreadyConcerned ? '取消关注' : '关注'}</span>
										</span>
									</span>
								</div>

								<ul class="form-info aui-row form-label-fixed mt-0">
									<li class="aui-col-7 form-item-box">
										<div class="form-group">
											<label class="aui-form-label">创建人：</label>
											<div class="form-text" title="${result.creator ? result.creator : '暂无'} ${result.orgName ? '(' + result.orgName + ')' : ''}">
												${result.creator ? result.creator : '暂无'} ${result.orgName ? '(' + result.orgName + ')' : ''}</div>
										</div>
									</li>
									<li class="aui-col-9 form-item-box">
										<div class="form-group">
											<label class="aui-form-label">任务期限：</label>
											<div class="form-text">${(result.startTime ? result.startTime : '暂无') + " 至 " + (result.endTime ? result.endTime : '暂无')}</div>
										</div>
									</li>
									<li class="aui-col-8 form-item-box">
										<div class="form-group">
											<label class="aui-form-label">事由/原因：</label>
											<div class="form-text">${result.reason.replace(/</g, '&lt;').replace(/>/g, '&gt;') ? result.reason.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '暂无'}</div>
										</div>
									</li>
									<li class="aui-col-7 form-item-box">
										<div class="form-group">
											<label class="aui-form-label">创建时间：</label>
											<div class="form-text">${result.createTime ? result.createTime : '暂无'}</div>
										</div>
									</li>
									<li class="aui-col-9 form-item-box">
										<div class="form-group">
											<label class="aui-form-label">比对区域：</label>
											<div class="form-text" title="${tempStringObject.orgString}">${tempStringObject.orgString}</div>
										</div>
									</li>
									<li class="aui-col-8 form-item-box">
										<div class="form-group">
											<label class="aui-form-label">告警接收人：</label>
											<div class="form-text" title="${tempStringObject.userString}">${tempStringObject.userString}</div>
										</div>
									</li>
									<li class="aui-col-7 form-item-box">
										<div class="form-group">
											<label class="aui-form-label">任务等级：</label>
											<div class="status-item form-text">
												<i class="status-icon status-icon-grade${(parseInt(result.grade) - 1)}"></i>
												<span class="text-grade${(parseInt(result.grade) - 1)}">${result.grade ? controlGrade[parseInt(result.grade) - 1] : controlGrade[2]}</span>
											</div>
										</div>
									</li>
									<li class="aui-col-7 form-item-box">
										<div class="form-group">
											<label class="aui-form-label">阈值：</label>
											<div class="form-text">${result.threshold ? result.threshold : '0' + '%'}</div>
										</div>
									</li>
								</ul>
							</div>`;
						$container.html(_html);
						$container.data({
							'result': result
						});
					} else {
						loadEmpty($container, "暂无布控详情", "", true);
					}
				} else {
					loadEmpty($container, "", "系统异常");
				}
			};
		loadData(port, true, data, successFunc);
	};

	/**
	 * 刷新告警和告警分页的数据
	 * @param {*} $alarmContainer 
	 * @param {*} $pageContainer 
	 */
	function refreshAlarmPageList($alarmContainer, $pageContainer, isRefreshControlTask) {
		$('#courseAnalyseControlAI').data('trakData', []);
		$("#mapIframeContainerAI").data('locationData', []);
		$("#checkAllPerPageAI").removeClass("ui-checkboxradio-checked");
		loadControlAlarmListAI($alarmContainer, targetControlTaskId, isRefreshControlTask, function (totalsize, totalpage) {
			setPageParams($pageContainer, totalsize, totalpage, function (currPage, pageSize) {
				controlAlarmDataAI.page = currPage;
				loadControlAlarmListAI($alarmContainer, targetControlTaskId, isRefreshControlTask);
			}, false);
		});
	};

	/**
	 * 根据布控任务id，查询告警信息
	 * @param {*} $container 
	 */
	function loadControlAlarmListAI($container, taskId, isRefreshControlTask, loadSuccessCallback) {
		showLoading($container);
		var port = 'v2/historyTask/alarmList',
			successFunc = function (data) {
				if (data.code == '200') {
					var result = data.data.list;
					loadSuccessCallback && loadSuccessCallback(data.data.total, data.data.totalPage);
					loadSuccessCallback && $("#allAlarmCountAI").text(data.data.total);
					// 左侧的任务列表 对应的告警总数需改变
					$('#controlTabContentAI .tab-container').find('.card-item').each(function (warningItemIndex, item) {
						if (taskId === $(item).attr('taskid')) {
							$(item).find('.card-item-text .card-info-title .grade1').text(data.data.total)
						}
					});
					hideLoading($container);
					$('#pathLoadingAI').addClass('hide');
					if (result && result.length > 0) {
						var _html = `<ul class="card-control-content">`,
							alarmClusterData = [];
						if (data.data.total > 0) {
							//获取地图需要的各地区告警统计数
							window.loadData('/v2/historyTask/getMapCount', true, {
								id: taskId,
								// number: data.data.total,
								// status: controlAlarmDataAI.status,
								// startTime: controlAlarmDataAI.startTime,
								// endTime: controlAlarmDataAI.endTime
							}, function (data, obj) {
								if (data.code == '200') {
									//分局统计
									for (let i = 0; i < data.data.stations.length; i++) {
										alarmClusterData.push({
											DM: data.data.stations[i].orgCode,
											count: data.data.stations[i].count
										});
									}

									//派出所统计
									for (let i = 0; i < data.data.polices.length; i++) {
										alarmClusterData.push({
											DM: data.data.polices[i].orgCode,
											count: data.data.polices[i].count
										});
									}

									$container.data("clusterData", alarmClusterData);
									loadAlarmMap(true, alarmClusterData);
								}
							});
						}

						for (let i = 0; i < result.length; i++) {
							var alarmStatusString = '',
								checkData = checkIsInTrakData(result[i].id);
							if (result[i].status === '0') { //未处理
								alarmStatusString = `
									<button type="button" class="btn btn-primary btn-confirm">确认</button>
									<button type="button" class="btn btn-false">误报</button>
								`;
							} else if (result[i].status === '1') { //已命中
								alarmStatusString = `
									<button type="button" class="btn btn-primary btn-confirm disabled">已命中</button>
								`;
							} else if (result[i].status === '2') { //已误报
								alarmStatusString = `
									<button type="button" class="btn btn-false disabled">已误报</button>
								`;
							}
							_html += `
							<li class="case-item clearfix" alarmId="${result[i].id}">
								<div class="checkbox-box float-left">
									<fieldset>
										<label class="ui-checkboxradio-checkbox-label ui-checkboxradio-label ui-button ui-widget ${checkData && checkData.isChecked ? 'ui-checkboxradio-checked' : ''}">
											<span class="ui-checkboxradio-icon ui-icon ui-icon-background ui-icon-blank"></span>
										</label>
									</fieldset>
								</div>
								<div class="case-img-box float-left clearfix relative">
									<img class="case-img float-left "
										src="${result[i].url ? result[i].url : './assets/images/control/person.png'}" alt="">
									<img class="case-img float-left" alarmId="${result[i].id}"
										src="${result[i].smallHttpUrl ? result[i].smallHttpUrl : './assets/images/control/person.png'}" alt="">
									<span class="case-num">${result[i].similarity ? result[i].similarity + '%' : '0%'}</span>
								</div>
								<div class="case-item-operate-box form-label-fixed" px="${result[i].px}" py="${result[i].py}">
									<div class="form-group case-item-source">
										<label class="aui-form-label">告警来源：</label>
										<div class="form-text">${result[i].cameraName}</div>
									</div>
									<div class="form-group">
										<label class="aui-form-label">抓拍时间：</label>
										<div class="form-text">${result[i].captureTime}</div>
									</div>
									<div class="case-item-operate">
										${ alarmStatusString}
									</div>
								</div>
							</li>
							`;
						}

						$container.html(_html + '</ul>');
						$container.find(".case-item").each(function (index) {
							$(this).data('alarmItemData', result[index]);
						});
						if ($container.find('.case-item .ui-checkboxradio-checked').length === $container.find('.case-item').length) {
							$("#checkAllPerPageAI").addClass("ui-checkboxradio-checked");
						} else {
							$("#checkAllPerPageAI").removeClass("ui-checkboxradio-checked");
						}

						$("#alarmOuterContainerAI").removeClass("display-none");
						$("#alarmEmptyContainerAI").addClass("display-none");
					} else {
						var alarmClusterData = [{
							DM: null,
							count: 0
						}];
						loadAlarmMap(true, alarmClusterData);
						$("#alarmOuterContainerAI").removeClass("display-none");
						$("#alarmEmptyContainerAI").addClass("display-none");

						if (isRefreshControlTask) {
							loadEmpty($container, "当前暂无告警信息", "", true);
						} else {
							loadEmpty($container, "当前暂无告警信息", "", true);
						}
					}
				} else {
					if (isRefreshControlTask) {
						loadEmpty($container, "当前暂无告警信息", "");
					} else {
						loadEmpty($container, "当前暂无告警信息", "");
					}
				}
			};
		controlAlarmDataAI.taskId = taskId;
		if (loadSuccessCallback) {
			controlAlarmDataAI.page = '1';
		}
		loadData(port, true, controlAlarmDataAI, successFunc);
	};

	/**
	 * 加载告警需要的地图
	 */
	function loadAlarmMap(iscluster, clusterData, locationData) {
		var iframe = document.getElementById('map_iframe_alarmAI');
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
		if (mapData) {
			iframe.contentWindow.postMessage(mapData, targetOrigin);
			iframe.contentWindow.postMessage(mapOperationData, targetOrigin);
		}
		// var iframePath = document.getElementById('control_iframe_pathAI');
		// iframe.contentWindow.postMessage({type: "fullExtent"}, targetOrigin);
	};

	/**
	 * 根据镜头id判断所选人员是否已在轨迹分析列表中，返回相应的存在状态和所在数组的index序号
	 * @param {string} alarmId 
	 */
	function checkIsInTrakData(alarmId) {
		var trakData = $('#courseAnalyseControlAI').data().trakData;
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
	};

	/**
	 * 编辑事件入口
	 */
	$("#controlItemDetailContainerAI").on("click", "#controlItemEditBtnAI", function () {
		var url = "./facePlatform/AI-alarm-add.html?dynamic=" + Global.dynamic;
		$('.AI-new-popup').data('controlId', $("#controlItemDetailContainerAI").attr("taskId"));
		loadPage($('.AI-new-popup'), url);
		$('.AI-new-popup').removeClass('hide');
	});

	// AI告警 编辑成功
	window.editSuccessAI = function (taskId) {
		resetSearchConditions();
		$('.AI-new-popup').data('controlId', '');
		controlSearchDataAI.id = taskId;
		loadControlSearchListAI($("#controlTabContentAI .tab-container"));
		var $barItem = $('#pageSidebarMenu .aui-icon-toolbox').closest('.sidebar-item'),
			barIndex = $barItem.index(),
			$saveItem = $('#content-box').children().eq(barIndex).find("#AI-alarm");
		loadPage($saveItem, "./facePlatform/AI-alarm.html?dynamic=" + Global.dynamic);
	};

	/**
	 * 根据布控任务id 停止布控任务
	 * @param {*} taskIds 待停止布控任务ID的数组
	 */
	function loadStopControlTask(taskIds) {
		var port = 'v2/historyTask/stopTask',
			data = {
				id: taskIds
			},
			successFunc = function (data) {
				if (data.code == '200') {
					controlSearchDataAI.page = '1';
					$('#controlTabContentAI .tab-container').data('curPage', 1);
					// $('#pageSidebarMenu').find('.sidebar-item .aui-icon-monitor2').closest('.sidebar-item').data({
					// 	'my': true
					// });
					loadControlSearchListAI($("#controlTabContentAI .tab-container"));
				} else {
					warning.say(data.message);
				}
			};
		loadData(port, true, data, successFunc);
	};

	/**
	 * 根据布控任务id 删除布控任务
	 * @param {*} taskIds 待停止布控任务ID的数组
	 */
	function loadDelControlTask(taskIds) {
		var port = 'v2/historyTask/delTask',
			data = {
				id: taskIds
			},
			successFunc = function (data) {
				if (data.code == '200') {
					controlSearchDataAI.page = '1';
					$('#controlTabContentAI .tab-container').data('curPage', 1);
					// $('#pageSidebarMenu').find('.sidebar-item .aui-icon-monitor2').closest('.sidebar-item').data({
					// 	'my': true
					// });
					warningTip.say('删除成功');
					loadControlSearchListAI($("#controlTabContentAI .tab-container"));
				} else {
					warning.say(data.message);
				}
			};
		loadData(port, true, data, successFunc, undefined, 'DELETE');
	};

	/**
	 * 重置过滤条件的状态和检索数据参数
	 */
	function resetSearchConditions() {
		var $searchConditionDoms = $('#searchMoreConditionsAI .text-content');
		$searchConditionDoms.each(function (index, el) {
			$(this).find('.text-link').removeClass('text-link');
			$(this).prev().addClass('text-link'); //是否选中 全部 过滤条件这个选项
		});
		controlSearchDataAI = {
			page: '1',
			size: '20',
			viewTypes: '1',
			runStatus: '2', //任务状态
			grade: '', //任务等级（1紧急2重要3一般）
			orgIds: [], //创建任务所属机构数组
			libId: '', //比对库id
			startTime: '', //任务开始时间
			endTime: '', //任务结束时间
			keywords: '',
			id: ''
		};
		// 告警请求参数
		controlAlarmDataAI = {
			taskId: '',
			startTime: '',
			endTime: '',
			status: '0',
			size: 10
		};
		targetControlTaskId = '';
		$alarmTargetDom = null;
	}

	/**
	 * 终止事件入口
	 */
	$("#controlItemEndModalAI").on("click", ".btn-primary", function () {
		loadStopControlTask($("#controlItemDetailContainerAI").attr("taskId"));
		$($("#controlItemEndModalAI").data()['bs.modal']._backdrop).remove();
		$("#controlItemEndModalAI").modal('hide');
		var $barItem = $('#pageSidebarMenu .aui-icon-monitor2').closest('.sidebar-item'),
			barIndex = $barItem.index(),
			$saveItem = $('#content-box').children().eq(barIndex).find("#AI-alarm");
		$barItem.addClass('active').siblings().removeClass('active');
		$saveItem.removeClass('hide').siblings().addClass('hide');
		loadPage($saveItem, "./facePlatform/AI-alarm.html?dynamic=" + Global.dynamic);
	});

	/**
	 * 删除事件入口
	 */
	$("#controlItemDelModalAI").on("click", ".btn-primary", function () {
		loadDelControlTask($("#controlItemDetailContainerAI").attr("taskId"));
		$($("#controlItemDelModalAI").data()['bs.modal']._backdrop).remove();
		$("#controlItemDelModalAI").modal('hide');
		var $barItem = $('#pageSidebarMenu .aui-icon-monitor2').closest('.sidebar-item'),
			barIndex = $barItem.index(),
			$saveItem = $('#content-box').children().eq(barIndex).find("#AI-alarm");
		$barItem.addClass('active').siblings().removeClass('active');
		$saveItem.removeClass('hide').siblings().addClass('hide');
		loadPage($saveItem, "./facePlatform/AI-alarm.html?dynamic=" + Global.dynamic);
	});

	//重启确定按钮点击事件
	$('#controlPostponeModalAI').on('click', '.modal-footer .btn-primary', function () {
		var taskId = $('#controlTabContentAI').find('.card-item.active').attr('taskid'),
			startTime = $('#restartAiAlarm_time').find('.datepicker-input').eq(0).val(),
			endTime = $('#restartAiAlarm_time').find('.datepicker-input').eq(1).val();
		showLoading($('#controlPostponeModalAI .modal-content'));
		var portData = {
			id: taskId,
			endTime: endTime,
			startTime: startTime
		};
		var portDataSuccessFunc = function (data) {
			if (data.code === '200') {
				$($('#controlPostponeModalAI').data()['bs.modal']._backdrop).remove();
				$('#controlPostponeModalAI').find('.aui-icon-not-through').click();
				$('#controlTabContentAI').find('.card-item.active').click();

				var $barItem = $('#pageSidebarMenu .aui-icon-monitor2').closest('.sidebar-item'),
					barIndex = $barItem.index(),
					$saveItem = $('#content-box').children().eq(barIndex).find("#AI-alarm");
				// controlSearchDataAI.page = '1';
				// $('#controlTabContentAI .tab-container').data('curPage', 1);
				//resetSearchConditions();
				//controlSearchDataAI.id = taskId;
				warningTip.say('重启成功');
				loadControlSearchListAI($("#controlTabContentAI .tab-container"));
				loadPage($saveItem, "./facePlatform/AI-alarm.html?dynamic=" + Global.dynamic);
			} else {
				warningTip.say('重启失败');
			}
			hideLoading($('#controlPostponeModalAI .modal-content'));
		}
		loadData('v2/historyTask/restartTask', true, portData, portDataSuccessFunc);
	});

	/**
	 * 关注点击事件
	 */
	$("#controlItemDetailContainerAI").on("click", "#controlItemConcernBtnAI", function () {
		//taskId = $('#controlTabContentAI').find('.card-item.active').attr('taskid'),
		var taskId = $("#controlItemDetailContainerAI").attr("taskId"),
			type = $('#controlItemConcernBtnAI').find('span').text() == '关注' ? 1 : 2, //关注或者取消关注
			portData = {
				id: taskId,
				type: type, // 关注
			},
			cancelConcernSuccessFunc = function (data) {
				if (data.code === '200') {
					loadControlTaskDetail($('#controlItemDetailContainerAI'), taskId);
					if (type == 1) {
						$('#controlItemConcernBtnAI').find('span').text('取消关注');
						$('#controlItemConcernBtnAI').find('i').css('color', '#3b9ef3'); // 蓝色
					} else {
						$('#controlItemConcernBtnAI').find('span').text('关注');
						$('#controlItemConcernBtnAI').find('i').css('color', '#f2a20c'); // 蓝色
					}
				}
			};
		loadData('v2/historyTask/cancelTask', true, portData, cancelConcernSuccessFunc);
	});

	/**
	 * 根据布控关键词来查询布控信息列表
	 */
	$("#controlSearchBoxAI").on("click", "#startSearchControlAI", function () {
		//点击搜索按钮查询关键词
		controlSearchDataAI.page = "1";
		controlSearchDataAI.id = "";
		$('#controlTabContentAI .tab-container').data('curPage', 1);
		controlSearchDataAI.keywords = $("#controlKeyWordInputAI").val();
		loadControlSearchListAI($("#controlTabContentAI .tab-container"));
	}).on("keydown", "#controlKeyWordInputAI", function (e) {
		//按键盘回车事件开始搜索
		var code = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
		if (code == 13) {
			controlSearchDataAI.page = "1";
			controlSearchDataAI.id = "";
			$('#controlTabContentAI .tab-container').data('curPage', 1);
			controlSearchDataAI.keywords = $("#controlKeyWordInputAI").val();
			loadControlSearchListAI($("#controlTabContentAI .tab-container"));
		}
	});

	/**
	 * 布控检索条件是否显示更多/收起
	 */
	function hasShowMore() {
		var $contents = $('#searchMoreConditionsAI .search-more-inner .text-content');
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

	$('#searchMoreFilterAI').click(function (e) {
		e.stopPropagation();
		$(this).toggleClass('active');
		$('#searchMoreConditionsAI').toggle();
		hasShowMore();
	});

	/**
	 * 搜索布控更多过滤条件的选择，并将相应数据传递给后台需要的参数
	 * @param {object} $itemDom  搜索过滤条件的目标节点
	 * @param {number} index  搜索过滤条件类别的index；
	 * 						  0 为布控类型过滤；1 为布控时间过滤； 2 为布控任务等级过滤; 3 为创建机构过滤；
	 * 					      4 为布控区域过滤；5 为布控库过滤
	 */
	function setSearchMoreCondition($itemDom, index) {
		switch (index) {
			case 0: //任务状态，暂缺后台接口
				switch ($itemDom.text()) {
					case "全部":
						controlSearchDataAI.runStatus = "";
						break;
					case "待开始":
						controlSearchDataAI.runStatus = "1"; //待运行
						break;
					case "进行中":
						controlSearchDataAI.runStatus = "2"; //进行中
						break;
					case "暂停":
						controlSearchDataAI.runStatus = "3"; //暂停
						break;
					default:
						controlSearchDataAI.runStatus = "4"; //已结束运行
				}
				break;
			case 1: //时间
				switch ($itemDom.text()) {
					case "全部":
						controlSearchDataAI.startTime = "";
						controlSearchDataAI.endTime = "";
						break;
					case "近一周":
						controlSearchDataAI.startTime = sureSelectTime(-7).date;
						controlSearchDataAI.endTime = sureSelectTime(-7).now;
						break;
					case "近一个月":
						controlSearchDataAI.startTime = sureSelectTime(-30).date;
						controlSearchDataAI.endTime = sureSelectTime(-30).now;
						break;
					case "近三个月":
						controlSearchDataAI.startTime = sureSelectTime(-30 * 3).date;
						controlSearchDataAI.endTime = sureSelectTime(-30 * 3).now;
						break;
					case "近一年":
						controlSearchDataAI.startTime = sureSelectTime(-365).date;
						controlSearchDataAI.endTime = sureSelectTime(-365).now;
						break;
				}
				break;
			case 2: // 任务等级
				switch ($itemDom.text()) {
					case "全部":
						controlSearchDataAI.grade = "";
						break;
					default:
						controlSearchDataAI.grade = $itemDom.attr("gradeId");
						break;
				}
				break;
			case 3: // 创建机构
				controlSearchDataAI.orgIds = [];
				switch ($itemDom.text()) {
					case "全部":
						controlSearchDataAI.orgIds = [];
						break;
					default:
						controlSearchDataAI.orgIds.push($itemDom.attr("orgId"));
						break;
				}
				break;
			case 4: //比对库
				controlSearchDataAI.libId = '';
				switch ($itemDom.text()) {
					case "全部":
						controlSearchDataAI.libId = '';
						break;
					default:
						controlSearchDataAI.libId = $itemDom.attr("libId");
						break;
				}
				break;
		}
	};

	/**
	 * 根据选择更多筛选条件来查询布控信息列表
	 */
	$("#searchMoreConditionsAI").on("click", ".text-item .text-btn", function () {
		controlSearchDataAI.page = "1";
		controlSearchDataAI.id = "";
		$('#controlTabContentAI .tab-container').data('curPage', 1);
		var $currentItem = $(this).closest(".text-item");
		$currentItem.find(".text-btn.text-link").removeClass("text-link");
		if ($(this).attr('id') == 'showTimeModalAI') {
			$("#filterTimeModalAI").modal('show');
			if ($(this).text() === '自定义时间') {
				$('#filterAiAlarm_time').find('.datepicker-input').val('');
			}
		} else {
			$(this).addClass("text-link");
			setSearchMoreCondition($(this), $currentItem.index());
			loadControlSearchListAI($("#controlTabContentAI .tab-container"));

			if ($currentItem.attr('id') === 'controlTimeConditionAI') {
				$('#showTimeModalAI').text("自定义时间");
				$currentItem.find('.text-link.right').hide();
			}
		}
	});

	/**
	 * 自定义时间过滤弹窗确认事件
	 */
	$("#filterTimeModalAI").on("click", "#timeModalSureAI", function () {
		var $dateInput = $('#filterAiAlarm_time').find('.datepicker-input');
		controlSearchDataAI.createTime = $dateInput.eq(0).val();
		controlSearchDataAI.endCreateTime = $dateInput.eq(1).val();
		if ($dateInput.eq(0).val() && $dateInput.eq(1).val()) {
			$('#controlTimeConditionAI').find('.text-content .text-btn').last().addClass('text-link').text($dateInput.eq(0).val() + ' ~ ' + $dateInput.eq(1).val());
			controlSearchDataAI.page = "1";
			controlSearchDataAI.id = "";
			$('#controlTabContentAI .tab-container').data('curPage', 1);
			loadControlSearchListAI($("#controlTabContentAI .tab-container"));
			var $timeConditionContainer = $("#controlTimeConditionAI").find('.text-content');
			if ($timeConditionContainer.height() > 30) {
				$timeConditionContainer.removeClass('text-content-more').next().show().find(".text").text('收起').next().addClass('rotate-180');
			}
		} else {
			$('#controlTimeConditionAI').find('.text-btn').eq(0).addClass('text-link');
		}
	});

	/**
	 * tab内容区的列表子项相关的事件处理。
	 */
	$("#controlTabContentAI").on("click", ".card-item", function () {
		//根据tab内容区的布控列表子项，更新右侧内容区的布控详情和告警信息。
		var $this = $(this);
		$("#controlTabContentAI .card-item.active").removeClass("active");
		$this.find('.alarm-num').addClass('hide');
		$this.addClass("active");
		targetControlTaskId = $this.attr("taskId");
		loadControlTaskDetail($('#controlItemDetailContainerAI'), targetControlTaskId);
		if (controlSearchDataAI.runStatus !== "1") { //待运行状态下 不会有告警信息
			refreshAlarmPageList($("#alarmListContainerAI"), $("#alarmListPageAI"), true);
		} else {
			loadEmpty($("#alarmListContainerAI"), "当前暂无告警信息", "", true);
			$("#alarmListPageAI").empty();
			$("#allAlarmCountAI").text('0');
		}
		// 点击任务列表详情，去掉红点
		$(this).find('.img-red-circle').addClass('hide')
	}).on('mousewheel', function () {
		//tab内容列表滚动到底部进行下一分页的懒加载事件
		var $this = $(this),
			$currentContainer = $this.find(".tab-container"),
			curPage = $currentContainer.data('curPage') === undefined ? 1 : $currentContainer.data('curPage'),
			viewHeight = $this.height(), //视口可见高度
			contentHeight = $currentContainer[0].scrollHeight, //内容高度
			scrollHeight = $this.scrollTop(), // 已经滚动了的高度
			currentPage = parseInt(controlSearchDataAI.page),
			currentCardItemNum = $currentContainer.find(".card-item").length,
			totalCardItemNUM = parseInt($('#controlListTotalAI').text());
		if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM && currentPage === curPage) {
			loadControlSearchListAI($currentContainer, true, currentPage + 1);
		}
	});

	/**
	 * 搜索告警更多过滤条件的选择，并将相应数据传递给后台需要的参数
	 * @param {object} $itemDom  搜索告警过滤条件的目标节点
	 * @param {string} targetTitle  搜索过滤条件类别的targetTitle；'alarmDate'为告警时间过滤； 'alarmStatus'为告警状态过滤
	 */
	function setAlarmMoreCondition($itemDom, targetTitle) {
		switch (targetTitle) {
			case 'alarmDate': //布控时间
				switch ($itemDom.text()) {
					case "不限":
						controlAlarmDataAI.startTime = "";
						controlAlarmDataAI.endTime = "";
						break;
					case "近1天":
						controlAlarmDataAI.startTime = sureSelectTime(-1).date;
						controlAlarmDataAI.endTime = sureSelectTime(-1).now;
						break;
					case "近7天":
						controlAlarmDataAI.startTime = sureSelectTime(-7).date;
						controlAlarmDataAI.endTime = sureSelectTime(-7).now;
						break;
					case "近30天":
						controlAlarmDataAI.startTime = sureSelectTime(-30).date;
						controlAlarmDataAI.endTime = sureSelectTime(-30).now;
						break;
					case "自定义时间":
						break;
				}
				break;
			case 'alarmStatus': //布控类型，暂缺后台接口
				switch ($itemDom.text()) {
					case "全部状态":
						controlAlarmDataAI.status = "";
						break;
					case "未处理":
						controlAlarmDataAI.status = "0";
						break;
					case "已命中":
						controlAlarmDataAI.status = "1";
						break;
					case "已误报":
						controlAlarmDataAI.status = "2";
						break;
				}
				break;
		}
	}

	/**
	 * 切换告警过滤条件下拉列表，更新告警过滤条件
	 */
	$("#controlContentContainerAI").on("click", ".dropdown-item", function () {
		var $this = $(this),
			$selectMenuContainer = $this.closest('.dropdown-menu');
		if ($selectMenuContainer.attr('aria-labelledby') === 'alarmFilterDateAI') {
			if ($this.text() !== '自定义时间') {
				setAlarmMoreCondition($this, 'alarmDate');
				refreshAlarmPageList($("#alarmListContainerAI"), $("#alarmListPageAI"));
			} else {
				$("#customDateModalAI").modal('show');
				$("#customDateModalAI").find('.text-danger').addClass('hide');
			}
		} else if ($selectMenuContainer.attr('aria-labelledby') === 'alarmFilterStatusAI') {
			if ($selectMenuContainer.find('.active').text() === "全部状态") {
				$selectMenuContainer.closest('#alarmFilterStatusAI').removeClass('active')
			}
			setAlarmMoreCondition($this, 'alarmStatus');
			refreshAlarmPageList($("#alarmListContainerAI"), $("#alarmListPageAI"));
		}
	});

	//告警过滤条件的自定义时间弹窗
	$("#customDateModalAI").on("click", ".btn-primary", function () {
		var $dateInput = $("#customDateModalAI .datepicker-input"),
			dateStartTime = $dateInput.eq(0).val(),
			dateEndTime = $dateInput.eq(1).val();
		controlAlarmDataAI.startTime = $dateInput.eq(0).val();
		controlAlarmDataAI.endTime = $dateInput.eq(1).val();
		if (dateStartTime && dateEndTime) {
			$("#customDateModalAI").find('.text-danger').addClass('hide');
			refreshAlarmPageList($("#alarmListContainerAI"), $("#alarmListPageAI"));
			$('#alarmFilterDateAI').text(dateStartTime + "~" + dateEndTime);
			$("#customDateModalAI").modal('hide');
		} else {
			$("#customDateModalAI").find('.text-danger').removeClass('hide');
			$dateInput.eq(0).val("");
			$dateInput.eq(1).val("");
		}
	});

	/**
	 * 告警每页的全选功能
	 */
	$("#checkAllPerPageAI").on("click", function () {
		var $targetAlarmRows = $("#alarmListContainerAI .case-item"),
			$this = $(this),
			trakDatas = $("#courseAnalyseControlAI").data().trakData && $("#courseAnalyseControlAI").data().trakData.length ?
			$("#courseAnalyseControlAI").data().trakData : [],
			allAlarmItemData = []; // 轨迹分析中的告警列表数据，用于展示大图弹框;
		$this.toggleClass("ui-checkboxradio-checked");
		if ($this.hasClass('ui-checkboxradio-checked')) {
			$targetAlarmRows.each(function (index) {
				var alarmItemData = $(this).data('alarmItemData');
				if (!$(this).find(".ui-checkboxradio-checkbox-label").hasClass('ui-checkboxradio-checked')) {
					trakDatas.push({
						alarmId: alarmItemData.id,
						cameraId: alarmItemData.cameraId,
						cameraName: alarmItemData.cameraName,
						captureTime: alarmItemData.captureTime,
						facePosition: alarmItemData.vertices,
						gbCode: alarmItemData.gbCode,
						imgGuid: alarmItemData.smallHttpUrl,
						faceUrl: alarmItemData.smallHttpUrl,
						bigHttpUrl: alarmItemData.bigHttpUrl,
						px: alarmItemData.px,
						py: alarmItemData.py,
						url: alarmItemData.url,
						orgName: alarmItemData.orgName,
						threshold: alarmItemData.similarity,
						smallHttpUrl: alarmItemData.smallHttpUrl,
					});
					$(this).find(".ui-checkboxradio-checkbox-label").addClass("ui-checkboxradio-checked");
				}
			});
		} else {
			$targetAlarmRows.each(function (index) {
				var checkData = checkIsInTrakData($(this).attr("alarmId"));
				if (checkData.isChecked) {
					trakDatas.splice(checkData.currentIndex, 1);
					$(this).find(".ui-checkboxradio-checkbox-label").removeClass("ui-checkboxradio-checked");
					$("#checkAllPerPageAI").removeClass("ui-checkboxradio-checked");
				}
			})
		}
		$('#courseAnalyseControlAI').data('trakData', trakDatas);
		if (trakDatas.length) {
			$("#courseAnalyseControlAI").removeClass("text-disabled");
		} else {
			$("#courseAnalyseControlAI").addClass("text-disabled");
		}
		for (var t = 0; t < trakDatas.length; t++) {
			$('#alarmListContainerAI .card-control-content').find('.case-item').each(function (index, alarmItem) {
				if (trakDatas[t].alarmId === $(alarmItem).attr('alarmid')) {
					allAlarmItemData.push($(alarmItem).data('alarmItemData'))
				}
			})
		}
		$('#courseAnalyseControlAI').data('alarmItemData', allAlarmItemData);
	});

	/**
	 * 通知后台 告警任务的状态发生了改变，可能是确认告警或者驳回告警
	 * @param {*} alarmId 告警id
	 * @param {*} status 告警状态
	 */
	function loadUpdateAlarmStatus(alarmId, status) {
		var port = 'v2/historyTask/updateStatus',
			data = {
				id: alarmId,
				status: status
			},
			successFunc = function (data) {
				if (data.code == '200') {
					var $data = $('#alarmListContainerAI').data().currentBtnData;
					// 如果点击的是确认
					if ($data.alarmType == 'ok') {
						$('#alarmListContainerAI').find('.case-item').each(function (index, el) {
							if ($(el).attr('alarmid') == $data.alarmid) {
								var initData = $(el).data('alarmItemData');
								initData.status = status;
								$(el).find('.case-item-operate .btn-primary').text("已命中").addClass("disabled").next().remove();
								$('.mask-container-fixed.aaa').find('.swiper-slide-active .btn-confirm').text("已命中").addClass("disabled").siblings('.btn-false').remove();
							}
						})
					} else if ($data.alarmType == 'wrong') { // 如果点击的是误报
						$('#alarmListContainerAI').find('.case-item').each(function (index, el) {
							if ($(el).attr('alarmid') == $data.alarmid) {
								var initData = $(el).data('alarmItemData');
								initData.status = status;
								$(el).find('.case-item-operate .btn-false').text("已误报").addClass("disabled").prev().remove();;
								$('.mask-container-fixed.aaa').find('.swiper-slide-active .btn-false').text("已误报").addClass("disabled").siblings('.btn-confirm').remove();
							}
						})
					}
				} else {
					warning.say(data.message);
				}
			};
		loadData(port, true, data, successFunc);
	}

	/**
	 * 布控告警子项信息上各种点击事件的处理
	 */
	$("#alarmListContainerAI").on("click", ".btn-confirm:not(.disabled), .btn-false:not(.disabled)", function (e) {
		e.stopPropagation();
		//布控告警的确认和误报按钮事件
		var _alarmId = $(this).closest('.case-item').attr('alarmid'),
			$alarmTargetDom = $(this),
			$contentItem = $('#content-box').find('.content-save-item').not('.hide'),
			$alarmStatusSureMask = $contentItem.find('#alarmOkModal'),
			$alarmStatusErrorMask = $contentItem.find('#alarmErrorModal'),
			$alarmStatusSureMaskOk = $alarmStatusSureMask.find('.btn-primary'),
			$alarmStatusErrorMaskOk = $alarmStatusErrorMask.find('.btn-primary');
		if ($alarmTargetDom.hasClass('btn-confirm')) {
			$alarmStatusSureMask.modal('show');
			if ($('.modal-control').hasClass('show')) {
				var $maskBackDrop = $($alarmStatusSureMask.data()['bs.modal']._backdrop);
				$maskBackDrop.addClass('hide');
			}
			$('#alarmListContainerAI').data('currentBtnData', {
				alarmid: _alarmId,
				alarmType: 'ok'
			});
		} else {
			$alarmStatusErrorMask.modal('show');
			if ($('.modal-control').hasClass('show')) {
				var $maskBackDrop = $($alarmStatusErrorMask.data()['bs.modal']._backdrop);
				$maskBackDrop.addClass('hide');
			}
			$('#alarmListContainerAI').data('currentBtnData', {
				alarmid: _alarmId,
				alarmType: 'wrong'
			});
		}
		if ($alarmTargetDom.html() === '确认' && $alarmStatusSureMask.hasClass("show")) {
			$alarmStatusSureMask.modal('hide');
			loadUpdateAlarmStatus(_alarmId, '1');
		} else if ($alarmTargetDom.html() === '确认' && !$alarmStatusSureMask.hasClass("show")) {
			$alarmStatusSureMaskOk.off('click').on('click', function () {
				$alarmStatusSureMask.modal('hide');
				loadUpdateAlarmStatus(_alarmId, '1');
			});
		}
		if ($alarmTargetDom.html() === '误报' && $alarmStatusErrorMask.hasClass("show")) {
			$alarmStatusErrorMask.modal('hide');
			loadUpdateAlarmStatus(_alarmId, '2');
		} else if ($alarmTargetDom.html() === '误报' && !$alarmStatusErrorMask.hasClass("show")) {
			$alarmStatusErrorMaskOk.off('click').on('click', function () {
				$alarmStatusErrorMask.modal('hide');
				loadUpdateAlarmStatus(_alarmId, '2');
			});
		}

	}).on("click", ".ui-checkboxradio-checkbox-label", function () {
		//布控告警子项前面的多选功能，为路径分析提供数据
		var $this = $(this),
			$targetAlarmRow = $this.closest(".case-item"),
			alarmItemData = $targetAlarmRow.data('alarmItemData'),
			allAlarmItemData = []; // 轨迹分析中的告警列表数据，用于展示大图弹框
		trakDatas = $("#courseAnalyseControlAI").data().trakData && $("#courseAnalyseControlAI").data().trakData.length ?
			$("#courseAnalyseControlAI").data().trakData : [];
		$this.toggleClass("ui-checkboxradio-checked");
		if ($this.hasClass("ui-checkboxradio-checked")) {
			trakDatas.push({
				alarmId: alarmItemData.id,
				cameraId: alarmItemData.cameraId,
				cameraName: alarmItemData.cameraName,
				captureTime: alarmItemData.captureTime,
				facePosition: alarmItemData.vertices,
				gbCode: alarmItemData.gbCode,
				imgGuid: alarmItemData.smallHttpUrl,
				faceUrl: alarmItemData.smallHttpUrl,
				bigHttpUrl: alarmItemData.bigHttpUrl,
				px: alarmItemData.px,
				py: alarmItemData.py,
				url: alarmItemData.url,
				orgName: alarmItemData.orgName,
				threshold: alarmItemData.similarity,
				smallHttpUrl: alarmItemData.smallHttpUrl,
			});
			if ($("#alarmListContainerAI .case-item .ui-checkboxradio-checked").length === $("#alarmListContainerAI .case-item").length) {
				$("#checkAllPerPageAI").addClass("ui-checkboxradio-checked");
			}
		} else {
			var checkData = checkIsInTrakData($targetAlarmRow.attr("alarmId"));
			if (checkData.isChecked) {
				trakDatas.splice(checkData.currentIndex, 1);
				$("#checkAllPerPageAI").removeClass("ui-checkboxradio-checked");
			}
		}
		$('#courseAnalyseControlAI').data('trakData', trakDatas);
		if (trakDatas.length) {
			$("#courseAnalyseControlAI").removeClass("text-disabled");
		} else {
			$("#courseAnalyseControlAI").addClass("text-disabled");
		}
		for (var t = 0; t < trakDatas.length; t++) {
			$('#alarmListContainerAI .card-control-content').find('.case-item').each(function (index, alarmItem) {
				if (trakDatas[t].alarmId === $(alarmItem).attr('alarmid')) {
					allAlarmItemData.push($(alarmItem).data('alarmItemData'))
				}
			})
		}
		$('#courseAnalyseControlAI').data('alarmItemData', allAlarmItemData);
	}).on("click", ".case-item-operate-box", function () {
		//点击布控告警右侧的文本区域，调取摄像头在地图上的定位信息
		var $this = $(this),
			locationData = $("#mapIframeContainerAI").data('locationData') ?
			$("#mapIframeContainerAI").data('locationData') : [];
		$this.closest('.case-item').addClass('active').siblings().removeClass('active');
		if (locationData && locationData.length) {
			if (locationData[0].x === parseFloat($this.attr("px")) && locationData[0].y === parseFloat($this.attr("py"))) {
				//如果该摄像头定位已存在，不用再请求地图
				return;
			}
		}
		var px = Number($this.attr("px")),
			xMax = 115.07808642803226,
			xMin = 113.32223456772093,
			py = Number($this.attr("py")),
			yMax = 113.32223456772093,
			yMin = 22.190483583642468;
		if (px > xMin && px < xMax && py > yMin && py < yMax) {
			locationData = [{
				x: parseFloat($this.attr("px")),
				y: parseFloat($this.attr("py"))
			}];
			$("#mapIframeContainerAI").data('locationData', locationData);
			loadAlarmMap(false, [], locationData);
		} else {
			warningTip.say('所选图片坐标有误');
		}
	}).on("click", ".case-img-box", function (evt) {
		//点击告警的图片弹出告警相关的大图
		var $this = $(this),
			$targetAlarmRow = $this.closest(".case-item"),
			$targetParent = $targetAlarmRow.parent(),
			targetIndex = $targetAlarmRow.index();
		window.createBigImgMask($targetParent, 'aaa', targetIndex, $('#usearchImg'), evt, {
			cardImg: $targetAlarmRow,
			data: $targetAlarmRow.data('alarmItemData'),
			html: $(changeAlarmMaskHtml($targetAlarmRow.data('alarmItemData')))
		}, {
			type: 'contorl',
			dom: $alarmTargetDom
		});
	});

	/**
	 * 确认布控告警信息的 弹框 事件
	 */
	$("#alarmOkModal").on("click", ".btn-primary", function () {
		$("#alarmOkModal").modal('hide');
		loadUpdateAlarmStatus($alarmTargetDom.closest('.case-item').attr('alarmid'), '1');
	});

	/**
	 * 误报布控告警信息的 弹框 事件
	 */
	$("#alarmErrorModal").on("click", ".btn-primary", function () {
		$("#alarmErrorModal").modal('hide');
		loadUpdateAlarmStatus($alarmTargetDom.closest('.case-item').attr('alarmid'), '2');
	});

	/**
	 * 轨迹分析按钮点击
	 */
	$('#courseAnalyseControlAI').on('click', function () {
		var data = $('#courseAnalyseControlAI').data('trakData'); // 传给地图产生大图的数据
		var alarmListData = $('#courseAnalyseControlAI').data('alarmItemData'); // 传给告警列表产生大图的数据
		if ($('#pathLoadingAI').length > 0 && !$('#pathLoadingAI').hasClass('hide')) {
			return;
		}
		if (data.length == 0 || $('#courseAnalyse').hasClass('text-disabled')) {
			warningTip.say('请选择图片')
		} else {
			// initTimeLine(data, $('#auiTimeLineControlAI'));
			var $alarmList = $('#auiTimeLineControlAI'),
				$contentBox = $alarmList.closest(".card-side-content-box");
			$alarmList.data({
				'pageNumber': 1,
				'total': data.length ? data.length : 0,
			});
			// window.createAlarmList($alarmList, data, 9);
			window.createAlarmListAI($alarmList, alarmListData, 9);
			$('#AI-alarmPage').addClass('display-none');
			$('#currentPageControlPathAI').removeClass('display-none');
			createMapFn(data, 'control_iframe_pathAI');
			$contentBox.scrollTop(0);
			$contentBox.on('mousewheel', function () {
				var $this = $(this),
					curPage = $alarmList.data('pageNumber') === undefined ? 1 : $alarmList.data('pageNumber'),
					viewHeight = $this.height(), //视口可见高度
					contentHeight = $alarmList[0].scrollHeight, //内容高度
					scrollHeight = $this.scrollTop(), // 已经滚动了的高度
					currentCardItemNum = $alarmList.find(".aui-timeline-wrap").length,
					totalCardItemNUM = $alarmList.data('total');

				if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM) {
					$alarmList.data({
						'pageNumber': curPage + 1,
					});
					// window.createAlarmList($alarmList, data, 9, true);
					window.createAlarmListAI($alarmList, alarmListData, 9, true);
				}
			});
		}
	});

	/** 告警、布控轨迹分析 生成左侧列表
	 * @param {*} $alarmList 告警详情列表容器
	 * @param {*} data 告警详情总数据
	 * @param {*} selectPageSizeOpt 一页显示个数
	 * @param {*} isBottom 是否滚动到底部
	 */
	window.createAlarmListAI = function ($alarmList, data, selectPageSizeOpt, isBottom) {
		var pageNumber = $alarmList.data('pageNumber'),
			peopleImg = $alarmList.data('peopleImg'),
			start = (pageNumber - 1) * selectPageSizeOpt,
			end = start + selectPageSizeOpt,
			alarmPathList = data.slice(start, end),
			html = '',
			isAlarm = $alarmList.data('isAlarm');
		for (var i = 0; i < alarmPathList.length; i++) {
			var statusName = alarmPathList[i].status == '0' && '未处理' || alarmPathList[i].status == '1' && '已命中' || alarmPathList[i].status == '2' && '已误报' || '未处理';
			html += `
				<div class="aui-timeline-wrap clearfix">
					<div class="case-img-box float-left clearfix relative">
						<img class="case-img float-left" peopleId="${alarmPathList[i].peopleId}" src="${peopleImg || alarmPathList[i].url || './assets/images/control/person.png'}"
							alt="">
						<img class="case-img float-left" alarmid="${alarmPathList[i].id}" src="${alarmPathList[i].smallHttpUrl || alarmPathList[i].faceUrl || './assets/images/control/person.png'}"
							alt="">
						<span class="case-num">${alarmPathList[i].similarity || '0'}%</span>
					</div>
					<div class="alarm-content-right float-left aui-ml-mmd">
						<div class="alarm-group clearfix ${isAlarm ? '' : 'hide'}">
							<div class="alarm-group-title text-md text-bold float-left">${alarmPathList[i].name || alarmPathList[i].reason || '未知'}</div>
							<div class="float-right">
								<span class="warning-item-level grade${alarmPathList[i].status ? Number(alarmPathList[i].status) + 1 : 1}">${statusName}</span>
							</div>
						</div>
						<div class="alarm-group ${isAlarm ? '' : 'aui-mt-sm'}">
							<span class="text-lighter text-xm" title="${alarmPathList[i].cameraName || '未知'}">${alarmPathList[i].cameraName || '未知'}</span>
						</div>
						<div class="alarm-group">
							<span class="text-lighter text-xm">${alarmPathList[i].alarmTime || alarmPathList[i].captureTime || '未知'}</span>
						</div>
					</div>
				</div>
			`;
		}
		if (!isBottom) {
			$alarmList.empty().append(html);
		} else {
			$alarmList.append(html);
		}
	}

	$('#backToSearchControlAI').on("click", function () {
		if ($('#auiTimeLineControlAI .aui-timeline-box.active').length > 0) {
			$('#auiTimeLineControlAI .aui-timeline-box.active').removeClass('active');
			var data = $('#courseAnalyseControlAI').data('trakData');
			createMapFn(data, 'control_iframe_pathAI');
		} else {
			$('#AI-alarmPage').removeClass('display-none');
			$('#currentPageControlPathAI').addClass('display-none');
		}
	});

	// 布控 告警轨迹分析 告警列表查看大图
	$('#auiTimeLineControlAI').on('click', '.aui-timeline-wrap', function (evt) {
		var $this = $(this),
			// $targetAlarmRow = $this.closest(".case-item"),
			$targetAlarmRow = $this,
			$targetParent = $targetAlarmRow.parent(),
			targetIndex = $targetAlarmRow.index(),
			alarmItemData = $('#courseAnalyseControlAI').data('alarmItemData')[targetIndex];
		window.createBigImgMask($targetParent, 'aaa', targetIndex, $('#usearchImg'), evt, {
			cardImg: $targetAlarmRow,
			data: alarmItemData,
			html: $(changeAlarmMaskHtml(alarmItemData))
		}, {
			type: 'contorl',
			dom: $alarmTargetDom,
			controlAlarmLen: $('#courseAnalyseControlAI').data('alarmItemData').length
		});
	})

	window.addEventListener("message", function (ev) {
		var mydata = ev.data;
		if (mydata !== 'initMap' && mydata !== 'initMap?' && mydata !== 'initMap?44031' && $('#alarmListContainerAI').length > 0) {
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
		} else if (mydata === 'initMap?') { // 判断是否为初始化地图
			window.setTimeout(function () {
				$('#pathLoadingAI').addClass('hide');
				var alarmClusterData = $('#alarmListContainerAI').data("clusterData");
				loadAlarmMap(true, alarmClusterData);
			}, 1000);
		}
	});
})(window, window.jQuery)