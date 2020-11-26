(function (window, $) {
	var controlSearchData = {
		page: '1',
		size: '16', // 隐藏布控概览后 原数据由12改为16 放开隐藏后改回
		type: '', // 布控任务类型
		keywords: '',
		grade: '', // 布控任务等级（1紧急2重要3一般）
		startTime: "",
		endTime: "",
		runStatus: '', // 布控任务状态
		viewType: 1,
		orgIds: []
	};

	/**
	 * 布控概览 获取布控概览页面顶部的新增任务数统计数据，和 各单位布控任务的统计数据（html已隐藏）
	 */
	function loadControlStatis() {
		var port = 'distributeManager/taskStatis',
			successFunc = function (data) {
				if (data.code == '000') {
					createCircleChart($('#controlOverviewCircle'), data.result); //环状图
					var totalCount = data.result.allCount ? data.result.allCount : '0',
						totalPercent = data.result.allCompare ? data.result.allCompare : '0',
						addTotalCount = data.result.addCount ? data.result.addCount : '0',
						addTotalPercent = data.result.monthCompare ? data.result.monthCompare : '0',
						barChartData = {};
					$('#controlOverviewTotal .number').text(totalCount);
					$('#controlOverviewTotal .number-sub .text-prompt').text(totalPercent);
					$('#controlOverviewAdd .number').text(addTotalCount);
					$('#controlOverviewAdd .number-sub .text-prompt').text(addTotalPercent);
					$('#controlOverviewTotal .aui-icon-arrow').removeClass('hide');
					$('#controlOverviewAdd .aui-icon-arrow').removeClass('hide');
					if (totalPercent == '--' || Number(totalPercent.split('%')[0]) == 0) {
						$('#controlOverviewTotal .aui-icon-arrow').addClass('hide');
					} else if (totalPercent !== '--' && totalPercent.indexOf('-') == 0) {
						$('#controlOverviewTotal .number-sub').addClass('down');
					}
					if (addTotalPercent == '--' || Number(addTotalPercent.split('%')[0]) == 0) {
						$('#controlOverviewAdd .aui-icon-arrow').addClass('hide');
					} else if (addTotalPercent !== '--' && addTotalPercent.indexOf('-') == 0) {
						$('#controlOverviewAdd .number-sub').addClass('down');
					}
					if (data.result.orgNames) {
						barChartData = {
							xData: data.result.orgNames,
							legendData: ['布控任务总数', '今日新增任务数'],
							yData1: data.result.orgTotals,
							yData2: data.result.addTotals
						}
						createBarChart($('#controlOverviewBar'), barChartData); //柱状图
					} else {
						//临时的，有了后台数据后需要删除
						createBarChart($('#controlOverviewBar')); //柱状图
					}
				} else {
					warning.say(data.msg);
				}
			};
		loadData(port, true, [], successFunc);
	};

	/**
	 * 布控概览 获取布控任务总数和环比百分比 统计数据（html已隐藏）
	 */
	function loadControlTotal() {
		var port = 'index/amountCount',
			data = {},
			successFunc = function (data) {
				if (data.code == '000') {
					var totalCount = data.result.taskInfo.count ? data.result.taskInfo.count : '0',
						totalPercent = data.result.taskInfo.percent ? data.result.taskInfo.percent : '0';
					$('#controlOverviewTotal .number').text(totalCount);
					$('#controlOverviewTotal .number-sub .text-prompt').text(totalPercent);
				} else {
					warning.say(data.msg);
				}
			};
		loadData(port, true, data, successFunc);
	}

	/**
	 * 布控概览 创建圆环图（html已隐藏）
	 * @param {object} $container  包含定制的图例和圆环图的父级目标容器
	 * @param {object} data  圆环图需要的数据，定制的图例数据会相应刷新
	 * @param {Array} color 每根圆环对应的颜色
	 */
	function createCircleChart($container, data, color) {
		//圆环图
		var circleData = [{
			value: Number(data.waitCount),
			name: '待开始'
		}, {
			value: Number(data.runCount),
			name: '进行中'
		}, {
			value: Number(data.endCount),
			name: '已结束'
		}];
		$('#controlOverviewCircle').find('.chart-legend .legend-item').eq(0).find('.legend-num').text(data.waitCount);
		$('#controlOverviewCircle').find('.chart-legend .legend-item').eq(1).find('.legend-num').text(data.runCount);
		$('#controlOverviewCircle').find('.chart-legend .legend-item').eq(2).find('.legend-num').text(data.endCount);
		if (data && data.length > 0) {
			var $legendDoms = $container.find('.chart-legend .legend-item');
			circleData = [];
			for (let i = 0; i < data.length; i++) {
				circleData.push({
					value: data[i].count,
					name: data[i].name
				});
				$legendDoms.eq(i).find('.legend-name').text(data[i].name);
				$legendDoms.eq(i).find('.legend-num').text(data[i].count);
			}
		}

		var circleChartOption = {
			graphic: [{

				type: 'text',
				left: 'center',
				top: '44%',
				style: {
					text: '布控状态',
					textAlign: 'center',
					fill: '#fff',
					fontSize: 20
				}
			}],
			color: color ? color : ['#f2a20c', '#3b9ef3', 'rgba(255,255,255,.3)'],
			tooltip: {
				trigger: 'item',
				formatter: "{a} <br/>{b}: {c}"
			},
			series: [{
				name: '布控状态',
				type: 'pie',
				center: ['50%', '50%'],
				radius: ['62%', '80%'],
				avoidLabelOverlap: false,
				// roseType: 'radius',
				hoverOffset: 3,
				itemStyle: {
					borderWidth: 2,
					borderType: 'solid',
					borderColor: '#15212d'
				},
				label: {
					normal: {
						show: false,
						position: 'center'
					}
				},
				labelLine: {
					normal: {
						show: false
					}
				},
				data: circleData
			}]
		};

		var circleChart = echarts.init($container.find('.circle-chart')[0]);
		circleChart.setOption(circleChartOption);

		$(window).resize(function () {
			circleChart.resize();
		});
	}

	/**
	 * 布控概览 创建2条数据的堆叠柱状图（html已隐藏）
	 * @param {object} $container  目标容器
	 * @param {object} data  柱状图需要的数据，包括 图例、x轴数据、y轴对应的数据等
	 * @param {Array} color 每根柱子对应的颜色
	 */
	function createBarChart($container, data, color) {
		var barChartOption = {
			color: color ? color : ['#3b9ef3', '#01b9d1'],
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'line'
				},
			},
			legend: {
				data: data ? data.legendData : ['布控任务总数', '今日新增任务数'],
				right: 0,
				itemWidth: 14,
				itemHeight: 14,
				textStyle: {
					color: '#999'
				}
			},
			grid: {
				left: '0',
				right: '0',
				bottom: '0',
				containLabel: true
			},
			xAxis: [{
				axisTick: false,
				axisLine: {
					show: true,
					lineStyle: {
						width: 1,
						color: '#999',
					}
				},
				axisLabel: {
					textStyle: {
						color: '#999'
					}
				},
				type: 'category',
				data: data ? data.xData : ['罗湖', '福田', '龙岗', '龙华', '盐田', '公交', '南山', '大鹏', '刑侦', '反恐', '交警']
			},],
			yAxis: [{
				axisTick: {
					show: false,
					lineStyle: {
						type: 'dashed'
					}
				},
				axisLine: {
					show: false
				},
				axisLabel: {
					textStyle: {
						color: '#999'
					},
					formatter: function (value) {
						if (value >= 10000 && value < 10000000) {
							value = value / 10000 + '万';
						} else if (value >= 10000000) {
							value = value / 10000000 + '千万';
						}
						return value;
					}
				},
				splitLine: {
					lineStyle: {
						type: 'dash',
						color: '#999'
					}
				},
				max: 10000,
				type: 'value'
			}],
			dataZoom: [{
				type: 'inside',
				zoomOnMouseWheel: false,
				moveOnMouseMove: false,
				moveOnMouseWheel: false
			}],
			series: [{
				name: '布控任务总数',
				type: 'bar',
				barWidth: 25,
				stack: 'static',
				data: data ? data.yData1 : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				itemStyle: {
					normal: {
						color: new echarts.graphic.LinearGradient(
							0, 0, 0, 1, [{
								offset: 0,
								color: 'rgba(58,157,242,.9)'
							},
							{
								offset: 1,
								color: 'rgba(58,157,242,.1)'
							},
							]
						),
						borderColor: '#399bef',
						borderWidth: 2,
					}
				}
			},
			{
				name: '今日新增任务数',
				type: 'bar',
				barWidth: 25,
				stack: 'static',
				data: data ? data.yData2 : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				itemStyle: {
					normal: {
						color: new echarts.graphic.LinearGradient(
							0, 0, 0, 1, [{
								offset: 0,
								color: 'rgba(1,184,208,.9)'
							},
							{
								offset: 1,
								color: 'rgba(1,184,208,.1)'
							},
							]
						),
						borderColor: '#01b7d0',
						borderWidth: 2,
					},
				},

			}
			]
		}

		var barChart;
		window.setTimeout(function () {
			barChart = echarts.init($container[0]);
			barChart.setOption(barChartOption);
		}, 0);

		$(window).resize(function () {
			barChart.resize();
		});
	}

	/**
	 * 管理者登陆 获取布控任务数据 完成卡片加载
	 * @param {object}  $container 目标容器
	 * @param {function} loadSuccessCallback  首次加载完成的回调，用于首次创建分页组件
	 */
	function loadControlList($container, loadSuccessCallback) {
		showLoading($container);
		var port = 'v2/distributeManager/distributeTaskList',
			successFunc = function (data) {
				hideLoading($container);
				if (data.code == '200') {
					var result = data.data.list,
						tempStringObject = setArrayToStringObject(result);
					loadSuccessCallback && loadSuccessCallback(data.data.total, data.data.totalPage);
					if (result && result.length > 0) {
						var _html = '';
						for (var i = 0; i < result.length; i++) {
							var tempString = '';

							if (result[i].runStatus === 1) {
								tempString = `<span class="subtext text-prompt aui-col-8" title="待开始">待开始</span>`;
							} else if (result[i].runStatus === 3) {
								tempString = `<span class="subtext text-lighter aui-col-8" title="已结束">已结束</span>`;
							} else if (result[i].runStatus === 2) {
								tempString = `<span class="subtext text-active aui-col-8" title="剩余${result[i].surplusDay}天">剩余${result[i].surplusDay}天</span>`;
							}

							_html += `
							<li class="card-info card-info2" taskId="${result[i].id}">
								<div class="card-image">
									<div class="img-red-circle hide"></div>
									<img class="w-100" src="./assets/images/control/bukong-
									${(result[i].type === 'ZDSJ' || result[i].type === 'XLBK' || result[i].type === 'YFAB') ? result[i].type : 'CGBK'}
									-2.png" alt="">
								</div>
								<div class="info-box">
									<p class="card-info-title">
										<span class="info-title text-overflow">${result[i].name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
										${result[i].runStatus === 1 ? '' : `<span class="tag grade${result[i].grade}">${result[i].alarmCount ? result[i].alarmCount : 0}</span>`}
									</p>
									<ul class="form-info form-label-fixed form-label-short">
										<li class="form-group">
											<label class="aui-form-label">布控对象：</label>
											<div class="form-text">${result[i].libList && result[i].libList.length > 0 ? '共' + result[i].libList.length + '个库'
									: '共' + (result[i].imgList ? result[i].imgList.length : '0') + '个人'}</div>
										</li>
										<li class="form-group">
											<label class="aui-form-label">创建人：</label>
											<div class="form-text" title="${result[i].creator ? result[i].creator : '暂无' + (result[i].orgName ? '(' + result[i].orgName + ')' : '')}">
												${(result[i].creator ? result[i].creator : '暂无') + (result[i].orgName ? '(' + result[i].orgName + ')' : '')}</div>
										</li>
										<li class="form-group">
											<label class="aui-form-label">创建时间：</label>
											<div class="form-text task-card-creattime-overflow aui-row">
												<span class="aui-col-16" title = "${result[i].startTime ? result[i].startTime : '暂无'}">${result[i].startTime ? result[i].startTime : '暂无'}</span>
												${tempString}
											</div>
										</li>
									</ul>
								</div>
							</li>
							`;
						}
						$container.html(_html);
						$container.find('.card-info2').each(function (index, item) {
							var taskId = $(item).attr('taskid');
							// loadData('bkAlarm/alarmListByTaskId', true, {taskId: taskId, status: '0'}, function(data){
							// 	if(data.code === '000'){
							// 		$(item).find('.card-info-title .tag').text(data.result.total || '0');
							// 	}
							// });
							loadData('v2/bkAlarm/alarmCountByTaskId', true, {
								taskId: taskId,
								status: '0'
							}, function (data) {
								if (data.code === '200') {
									$(item).find('.card-info-title .tag').text(data.count || '0');
								}
							});
						});
						// 初始化任务列表，所有的页面红点清空
						$('#myControlTabContent').find('.img-red-circle').addClass('hide')
						$('#controlTabConten').find('.img-red-circle').addClass('hide')
					} else {
						loadEmpty($container, "暂无布控任务", "检索数据为空,请重新修改检索条件", true);
					}
				} else {
					loadEmpty($container, "", "系统异常，请重新修改过滤条件");
				}
			};
		loadData(port, true, controlSearchData, successFunc);
	}

	/**
	 * 管理者登陆 刷新布控任务数据
	 * @param {object}  $container   目标容器
	 * @param {object}  $pageContainer  分页容器
	 * @param {boolean} isnoPage 不需要分页组件
	 */
	function refreshControlList($container, $pageContainer, isShowMore, pageSizeOpt) {
		if (!pageSizeOpt) {
			pageSizeOpt = [{
				value: 16,
				text: '16/页', //隐藏布控概览后 原数据由12改为16 放开隐藏后改回
				selected: true
			}, {
				value: 20,
				text: '20/页',
			}];
		}
		// 获取布控任务数据
		loadControlList($container, function (totalsize, totalpage) {
			// 分页设置
			setPageParams($pageContainer, totalsize, totalpage, function (currPage, pageSize) {
				controlSearchData.page = currPage;
				controlSearchData.size = pageSize;
				if ($pageContainer.attr('id') === 'controlMyCreatePage') {
					controlSearchData.viewType = 2;
				} else if ($pageContainer.attr('id') === 'controlNotifyMePage') {
					controlSearchData.viewType = 3;
				}
				loadControlList($container); // 获取布控任务数据
			}, true, pageSizeOpt);

			var $parentContainer = $container.closest('.list-title-box');
			if (isShowMore) {
				if (totalsize > 8) {
					$parentContainer.addClass('showmore-height').find('.text-link').text('查看更多').addClass('show');
				} else {
					$parentContainer.removeClass('showmore-height').find('.text-link').removeClass('show');
				}
				$parentContainer.find('.tag').text(totalsize);
				var $controlTotal = $('#controlOverviewTabHeader .control-total').eq(1);
				$controlTotal.text(parseInt($controlTotal.text()) + totalsize);
			} else {
				$('#controlOverviewTabHeader .control-total').eq(0).text(totalsize);
			}
		});
	}

	/**
	 * 管理者登陆 搜索布控更多过滤条件的选择，并将相应数据传递给后台需要的参数
	 * @param {object} $itemDom  搜索过滤条件的目标节点
	 * @param {number} index  搜索过滤条件类别的index；
	 * 						  0 为布控类型过滤；1 为布控时间过滤； 2 为布控任务等级过滤; 3 为创建机构过滤；
	 * 					      4 为布控区域过滤；5 为布控库过滤
	 */
	function setSearchMoreCondition(index, text) {
		switch (index) {
			case 0: //布控任务状态，暂缺后台接口
				switch (text) {
					case "全部":
						controlSearchData.runStatus = '';
						break;
					case "待开始":
						controlSearchData.runStatus = 1; //待开始
						break;
					case "进行中":
						controlSearchData.runStatus = 2; //进行中
						break;
					case "已结束":
						controlSearchData.runStatus = 3; //已结束
						break;
				}
				break;
			case 1: //布控类型，暂缺后台接口
				switch (text) {
					case "全部":
						controlSearchData.type = "";
						break;
					default:
						controlSearchData.type = text;
						break;
				}
				break;
			case 2: // 创建机构
				controlSearchData.orgIds = [];
				switch (text) {
					case "全部":
						controlSearchData.orgIds = [];
						break;
					default:
						controlSearchData.orgIds.push(text);
						break;
				}
				break;
			case 3: //布控时间
				switch (text) {
					case "全部":
						controlSearchData.startTime = "";
						controlSearchData.endTime = "";
						break;
					case "近一天":
						controlSearchData.startTime = sureSelectTime(-1).date;
						controlSearchData.endTime = sureSelectTime(-1).now;
						break;
					case "近三天":
						controlSearchData.startTime = sureSelectTime(-3).date;
						controlSearchData.endTime = sureSelectTime(-3).now;
						break;
					case "近七天":
						controlSearchData.startTime = sureSelectTime(-7).date;
						controlSearchData.endTime = sureSelectTime(-7).now;
						break;
					case "近半个月":
						controlSearchData.startTime = sureSelectTime(-15).date;
						controlSearchData.endTime = sureSelectTime(-15).now;
						break;
					default:
						var timeArrControl = text.split('~');
						controlSearchData.startTime = timeArrControl[0];
						controlSearchData.endTime = timeArrControl[1];
				}
				break;
		}
	}

	/**
	 * 管理者登陆 布控任务 全部任务和我的任务 tab切换事件
	 */
	function resetTabParams($currentContainer) {
		if ($currentContainer.index() === 0) { // 全部任务
			//如果过滤条件有变化，切换tab需要根据过滤条件重新请求数据； 其他时候切换tab只是显隐控制，不需要重新请求
			if ($currentContainer.data('isRefreshData')) {
				controlSearchData.viewType = 1;
				controlSearchData.size = '16'; // 隐藏布控概览后 原数据由12改为16 放开隐藏后改回
				controlSearchData.page = '1';
				refreshControlList($currentContainer.find('.card-info-list'), $("#controlAllPage"));
				$currentContainer.data('isRefreshData', false);
				$('#controlOverviewTabHeader .control-total').eq($currentContainer.index()).text('0');
			}
		} else { // 我的任务
			//首次加载或过滤条件有变化，切换tab需要根据过滤条件重新请求数据； 其他时候切换tab只是显隐控制，不需要重新请求
			if ($currentContainer.data('isRefreshData')) {
				var pageSizeOpt = [{
					value: 16,
					text: '16/页', // 隐藏布控概览后 原数据由12改为16 放开隐藏后改回
					selected: true
				}, {
					value: 20,
					text: '20/页'
				}];
				controlSearchData.viewType = 2;
				controlSearchData.size = '16'; // 隐藏布控概览后 原数据由12改为16 放开隐藏后改回
				controlSearchData.page = '1';
				refreshControlList($currentContainer.find('.card-info-list').eq(0), $("#controlMyCreatePage"), true, pageSizeOpt);

				controlSearchData.viewType = 3;
				refreshControlList($currentContainer.find('.card-info-list').eq(1), $("#controlNotifyMePage"), true, pageSizeOpt);
				$currentContainer.data('isRefreshData', false);
				$('#controlOverviewTabHeader .control-total').eq($currentContainer.index()).text('0');
			}
		}
	}

	/**
	 * 管理者登陆 初始化 布控页面
	 */
	function initControlOverview() {
		loadControlStatis(); // 统计数据（html已隐藏）
		loadControlTotal(); // 布控任务总数和环比百分比（html已隐藏）
		refreshControlList($('#controlOverviewTabContent .tab-pane.active .card-info-list'), $("#controlAllPage"));
		$('#controlOverviewTabContent .tab-pane.active').next().data('isRefreshData', true);
		// 布控，告警公共筛选条件调用 位于common.js 即显示筛选下拉按钮
		filterDrop($('#controlOverviewPage'), function (data, index) {
			setSearchMoreCondition(index, data[index].text); // 过滤条件参数赋值
			var $currentContainer = $('#controlOverviewTabContent .tab-pane.active');
			$currentContainer.data('isRefreshData', true).siblings().data('isRefreshData', true);
			resetTabParams($currentContainer); // 全部任务和我的任务 tab切换事件
		}, true);
	}
	initControlOverview();

	// 管理者登陆 布控任务 任务列表相关的事件响应
	$('#controlOverviewTabContent').on('click', '.card-info', function () {
		//点击 某个布控任务 并 进入相应的布控详情页面
		var $controlDetailPage = $('#controlDetailPage'),
			$controlOverviewPage = $('#content-box');
		$controlDetailPage.removeClass('display-none');
		$controlOverviewPage.addClass('display-none').data('taskId', $(this).attr('taskId')); //绑定ID 到布控详情页面获取
		if (!$controlDetailPage.data('hasInitDetailPage')) {
			var url = "./facePlatform/control-detail.html?dynamic=" + window.Global.dynamic;
			loadPage($controlDetailPage, url);
			$controlDetailPage.data('hasInitDetailPage', true);
		}
	}).on('click', '.text-link', function () {
		// 监听 我的任务中的 查看更多按钮事件
		var $currentContainer = $(this).closest('.list-title-box'),
			$currentMore = $(this),
			$siblingContainer = $currentContainer.siblings('.list-title-box'),
			$siblingMore = $siblingContainer.find('.text-link'),
			targetTop = $currentContainer.offset().top - 15;
		if ($currentContainer.hasClass('showmore-height') && $currentMore.hasClass('show')) {
			$(this).text('收起');
			$currentContainer.removeClass('showmore-height');
			//将滚动条滚动到 当前目标节点的顶部
			$('html').animate({
				scrollTop: targetTop
			}, 500);
		} else {
			$(this).text('查看更多');
			$currentContainer.addClass('showmore-height');
		}
		if (!$siblingContainer.hasClass('showmore-height') && $siblingMore.hasClass('show')) {
			$siblingMore.text('查看更多');
			$siblingContainer.addClass('showmore-height');
		}
	});;

	// 管理者登陆 布控任务 全部任务和我的任务 判断
	$('#controlOverviewTabHeader').on('click', '.nav-item', function () {
		var $currentContainer = $("#controlOverviewTabContent .tab-pane").eq($(this).index());
		resetTabParams($currentContainer); // 全部任务和我的任务 tab切换事件
	});

	// 管理者登陆 根据布控关键词来查询布控信息列表 搜索按钮点击事件 键盘回车事件
	$("#controlOverviewSearchBox").on("click", ".aui-input-suffix", function () {
		//点击搜索按钮查询关键词
		controlSearchData.keywords = $("#controlOverviewKeyWordInput").val();
		var $currentContainer = $('#controlOverviewTabContent .tab-pane.active');
		$currentContainer.data('isRefreshData', true).siblings().data('isRefreshData', true);
		resetTabParams($currentContainer); // 全部任务和我的任务 tab切换事件
	}).on("keydown", ".aui-input", function (e) {
		//按键盘回车事件开始搜索
		var code = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
		if (code == 13) {
			controlSearchData.keywords = $("#controlOverviewKeyWordInput").val();
			var $currentContainer = $('#controlOverviewTabContent .tab-pane.active');
			$currentContainer.data('isRefreshData', true).siblings().data('isRefreshData', true);
			resetTabParams($currentContainer); // 全部任务和我的任务 tab切换事件
		}
	});

})(window, window.jQuery)