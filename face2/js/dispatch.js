(function (window, $) {
	var $objCameraList = {}, //镜头列表需要的参数
		$objTaskMainList = {}, //任务列表需要的参数
		$taskDeatil = {}, //任务详情列表需要的参数   
		$cameraDetail = {}, //镜头详情列表需要的参数
		$cameraOpt = [], //镜头列表操作需要的taskid
		$refreshTask = true, //任务刷新是否请求;
		$refreshCamera = true; //镜头刷新是否请求

	initControlDispatch();
	//初始化
	function initControlDispatch() {
		var dt = new Date();
		var dth = new Date();
		$("#timeStart").val(dt.pattern("yyyy-MM-dd hh:mm:ss"));
		$("#timeEndHistory").val(dth.pattern("yyyy-MM-dd hh:mm:ss"));
		dt.setDate(dt.getDate() + 3); //获取31天前的日期
		dth.setDate(dth.getDate() - 3); //获取31天前的日期
		$("#timeEnd").val(dt.pattern("yyyy-MM-dd hh:mm:ss"));
		$("#timeStartHistory").val(dth.pattern("yyyy-MM-dd hh:mm:ss"));

		getStatus($("#cameraStatus"), 'mainList'); //详情状态
		//调度镜头更换过滤条件
		filterDrop($('#dispatchInfoContent'), function (data, index) {
			for (var i = 0; i < data.length; i++) {
				if (data[i].text !== '全部') {
					var index = data[i].index,
						indexStr = data[i].index.toString(),
						text = data[i].text;
					if (i === 0) {
						$("#statusCode").data('statusList').forEach(function (val) {
							if (val.name === data[i].text) {
								$objCameraList.taskStatus = val.id;
							}
						});
					} else if (i === 1) {
						$objCameraList.streamType = text == '实时' ? 0 : 1;
					} else if (i === 2) {
						$objCameraList.orgId = text;
					} else if (i === 3) {
						if (index === 3) {
							if (text.indexOf('~') > 0) {
								var timeArr = text.split('~');
								$objCameraList.startTime = timeArr[0];
								$objCameraList.endTime = timeArr[1];
							} else {
								var timeObj = window.sureSelectTime(-15);
								$objCameraList.startTime = timeObj.date;
								$objCameraList.endTime = timeObj.now;
							}
						} else if (index === 0) {
							var timeObj = window.sureSelectTime(-1);
							$objCameraList.startTime = timeObj.date;
							$objCameraList.endTime = timeObj.now;
						} else if (index === 1) {
							var timeObj = window.sureSelectTime(-3);
							$objCameraList.startTime = timeObj.date;
							$objCameraList.endTime = timeObj.now;
						} else if (index === 2) {
							var timeObj = window.sureSelectTime(-7);
							$objCameraList.startTime = timeObj.date;
							$objCameraList.endTime = timeObj.now;
						}
					}
				} else {
					if (i === 0) {
						delete $objCameraList.taskStatus;
					} else if (i === 1) {
						delete $objCameraList.streamType;
					} else if (i === 2) {
						delete $objCameraList.orgId;
					} else if (i === 3) {
						delete $objCameraList.startTime;
						delete $objCameraList.endTime;
					}
				}
			}
			//加这个判断是因为刷新时候筛选也要恢复初始化，做了筛选的关闭按钮点击事件，每一个筛选关闭都会触发filterDrop方法，如果不加判断就会触发多个createCameraList方法，发送多次请求
			//每次刷新都把这个变量变为false这样就不会触发这个方法，每次都在最后把变量变为true以免影响以后的操作
			if ($refreshCamera) {
				createCameraList($('#dispatchTableOne'), $('#dispatchTabletPagination'), true, 1, 10, $objCameraList); //镜头
			}
			$refreshCamera = true;
		}, false, false);
		// //调度任务更换过滤条件
		filterDrop($('#dispatchInfoContent2'), function (data, index) {
			// setSearchMoreCondition(index, data[index].text);
			for (var i = 0; i < data.length; i++) {
				if (data[i].text !== '全部') {
					var index = data[i].index
					indexStr = data[i].index.toString(),
						text = data[i].text;
					if (i === 0) {
						$objTaskMainList.streamType = text == '实时' ? 0 : 1;
					} else if (i === 1) {
						if (index === 3) {
							if (text.indexOf('~') > 0) {
								var timeArr = text.split('~');
								$objTaskMainList.createStartTime = timeArr[0];
								$objTaskMainList.createEndTime = timeArr[1];
							} else {
								var timeObj = window.sureSelectTime(-15);
								$objTaskMainList.createStartTime = timeObj.date;
								$objTaskMainList.createEndTime = timeObj.now;
							}
						} else if (index === 0) {
							var timeObj = window.sureSelectTime(-1);
							$objTaskMainList.createStartTime = timeObj.date;
							$objTaskMainList.createEndTime = timeObj.now;
						} else if (index === 1) {
							var timeObj = window.sureSelectTime(-3);
							$objTaskMainList.createStartTime = timeObj.date;
							$objTaskMainList.createEndTime = timeObj.now;
						} else if (index === 2) {
							var timeObj = window.sureSelectTime(-7);
							$objTaskMainList.createStartTime = timeObj.date;
							$objTaskMainList.createEndTime = timeObj.now;
						}
					} else if (i === 3) {
						if (index === 3) {
							if (data[i].otherIndex) {
								var timeArr = text.split('~');
								$objTaskMainList.startTime = timeArr[0];
								$objTaskMainList.endTime = timeArr[1];
							} else {
								var timeObj = window.sureSelectTime(-15);
								$objTaskMainList.startTime = timeObj.date;
								$objTaskMainList.endTime = timeObj.now;
							}
						} else if (index === 0) {
							var timeObj = window.sureSelectTime(-1);
							$objTaskMainList.startTime = timeObj.date;
							$objTaskMainList.endTime = timeObj.now;
						} else if (index === 1) {
							var timeObj = window.sureSelectTime(-3);
							$objTaskMainList.startTime = timeObj.date;
							$objTaskMainList.endTime = timeObj.now;
						} else if (index === 2) {
							var timeObj = window.sureSelectTime(-7);
							$objTaskMainList.startTime = timeObj.date;
							$objTaskMainList.endTime = timeObj.now;
						}
					}
				} else { //为全部时候删掉对象
					if (i === 0) {
						delete $objTaskMainList.streamType;
					} else if (i === 1) {
						delete $objTaskMainList.createStartTime;
						delete $objTaskMainList.createEndTime;
					} else if (i === 3) {
						delete $objTaskMainList.startTime;
						delete $objTaskMainList.endTime;
					}
				}
			}
			if ($refreshTask) {
				createTaskList($('#tableTaskList'), $('#tableTaskListPagination'), true, 1, 10, $objTaskMainList);
			}
			$refreshTask = true;
		}, false, false);
	}

	// 调度js
	$("#dispatchDetailFilter").selectmenu();
	$("#btn-grounap").selectmenu();
	$("#btn-grounp-two").selectmenu();
	$(".btn-group").on("mouseover", "#btn-grounap-button", function () { //鼠标移入下拉框触发事件
		if ($(this).attr("aria-expanded") == 'false') {
			$(this).attr("aria-expanded", 'true');
			$(this).click();
		}

	});

	$(".btn-group").on("mouseover", "#btn-grounp-two-button", function () { //鼠标移入下拉框触发事件任务
		if ($(this).attr("aria-expanded") == 'false') {
			$(this).attr("aria-expanded", 'true');
			$(this).click();
		}
	});

	$(".optCamera").on("click", function () { //点击下拉框每一项触发事件
		$cameraOpt = [];
		if ($(this).find("span").html() == '停止') {
			for (var i = 0; i < $("#dispatchTableOne tbody").find("input:checkbox").length; i++) {
				if ($("#dispatchTableOne tbody").find("input:checkbox").eq(i).is(":checked")) {
					if ($("#dispatchTableOne tbody").find("input:checkbox").eq(i).attr("streamType") == '0' && $("#dispatchTableOne tbody").find("input:checkbox").eq(i).attr("status") == '1') { //视频类型是实况分析中
						$cameraOpt.push($("#dispatchTableOne tbody").find("input:checkbox").eq(i).parents("tr").attr("taskid")); //每一行的数据id	
					} else {
						$('#dispatchTipModal').modal('show');
						$('#dispatchTipLabel').text('请选择实况分析中数据')
						return;
					}
				}
			}
			if ($cameraOpt.length) { //判断是否有选择的列
				$('#dispatchTipModal').modal('show');
				$('#dispatchTipLabel').text('是否终止镜头调度任务？')
			} else {
				$('#dispatchTipModal').modal('show');
				$('#dispatchTipLabel').text('请选择一条实况分析中数据')
			}
		} else {
			for (var i = 0; i < $("#dispatchTableOne tbody").find("input:checkbox").length; i++) {
				if ($("#dispatchTableOne tbody").find("input:checkbox").eq(i).is(":checked")) {
					if ($("#dispatchTableOne tbody").find("input:checkbox").eq(i).attr("streamType") == '0' && $("#dispatchTableOne tbody").find("input:checkbox").eq(i).attr("status") == '-2') { //视频类型是实况已停止
						$cameraOpt.push($("#dispatchTableOne tbody").find("input:checkbox").eq(i).parents("tr").attr("taskid")); //每一行的数据id	
					} else {
						$('#dispatchTipModal').modal('show');
						$('#dispatchTipLabel').text('请选择实况已停止数据')
						return;
					}
				}
			}
			if ($cameraOpt.length) { //判断是否有选择的列
				$('#dispatchTipModal').modal('show');
				$('#dispatchTipLabel').text('是否重启镜头调度任务？')
			} else {
				$('#dispatchTipModal').modal('show');
				$('#dispatchTipLabel').text('请选择一条实况已停止数据')
			}
		}
	});

	//新建实时历史单选框选中事件
	$("#dispatch_streamType input[type=radio]").on("change", function () {
		if ($(this).val() == '0') { //实时
			$(".nowTime").removeClass("hide");
			$(".historyTime").addClass("hide");
		} else {
			$(".nowTime").addClass("hide");
			$(".historyTime").removeClass("hide");
		}
	});

	// 新建调度按钮点击事件
	$('#dispatchPage').on('click', '.dispatchCreateBtn', function () {
		$('#dispatchModal').find('[id*=dispatch_]:not(#dispatch_orgList)').removeClass('no-input-warning').val('').closest('.form-group').find('.text-danger.tip').addClass('hide');
		$('#dispatch_streamType').find('.ui-checkboxradio-label').eq(0).click();
		$('.nowTime [data-role="radio-button"]').eq(0).click();
		$('.historyTime [data-role="radio-button"]').eq(0).click();

		var dt = new Date();
		var dth = new Date();
		$("#timeStart").val(dt.pattern("yyyy-MM-dd hh:mm:ss"));
		$("#timeEndHistory").val(dth.pattern("yyyy-MM-dd hh:mm:ss"));
		dt.setDate(dt.getDate() + 3); //获取31天前的日期
		dth.setDate(dth.getDate() - 3); //获取31天前的日期
		$("#timeEnd").val(dt.pattern("yyyy-MM-dd hh:mm:ss"));
		$("#timeStartHistory").val(dth.pattern("yyyy-MM-dd hh:mm:ss"));

		$('#dispatchModal').modal('show');
		$('#dispatchModal').removeAttr('taskid');
		$('#dispatchLabel').text('新建');
		$('#dispatchModal').find('.aui-from-horizontal').eq(1).removeClass('hide');
	});

	//刷新调度任务按钮点击事件
	$('#taskMainListRefresh').on("click", function () {
		$(".table-checkbox-all-taskDetail").removeAttr("checked");
		$("#dispatchKeyWordInput2").val('');
		for (var i = 0; i < $("#dispatchInfoContent2").find(".aui-icon-not-through").length; i++) {
			if (!$("#dispatchInfoContent2").find(".aui-icon-not-through").eq(i).parent().hasClass('hide')) {
				$refreshTask = false;
				$("#dispatchInfoContent2").find(".aui-icon-not-through").eq(i).click();
			}
		}
		$objTaskMainList = {};
		createTaskList($('#tableTaskList'), $('#tableTaskListPagination'), true, 1, 10, $objTaskMainList);
	});

	//刷新调度镜头按钮点击事件
	$("#cameraMainListRefresh").on("click", function () {
		$(".table-checkbox-all-cameraDetail").removeAttr("checked");
		$("#dispatchKeyWordInput").val('');
		for (var i = 0; i < $("#dispatchInfoContent").find(".aui-icon-not-through").length; i++) {
			if (!$("#dispatchInfoContent").find(".aui-icon-not-through").eq(i).parent().hasClass('hide')) {
				$refreshCamera = false;
				$("#dispatchInfoContent").find(".aui-icon-not-through").eq(i).click();
			}
		}
		$objCameraList = {};
		createCameraList($('#dispatchTableOne'), $('#dispatchTabletPagination'), true, 1, 10, $objCameraList);
	});

	// 新建弹框点击确定按钮
	$('#dispatchModalSure').on('click', function () {
		// 任务id
		var id = $('#dispatchModal').attr('taskid');
		// 任务名称
		var name = $('#dispatch_name').val();
		// 选择镜头
		var orgList = $('#dispatch_orgList').data('gidArr');
		var cameraList = [];
		var mapList = $('#dispatch_orgList').data('mapList');
		if (mapList && mapList.length > 0) {
			mapList.forEach(function (item) {
				cameraList.push(item.arr.id);
			});
		}
		// 视频类型
		var streamType = $('#dispatch_streamType').find('.ui-checkboxradio-checked').siblings('input').val();

		if (streamType == '0') { //实时
			//开始时间
			var startTime = $('#timeStartNow').val();
			// 结束时间
			var endTime = $('#timeEndNow').val();
		} else {
			//开始时间
			var startTime = $('#timeStartHistory').val();
			// 结束时间
			var endTime = $('#timeEndHistory').val();
		}

		// 申请原因
		var reason = $('#dispatch_reason').val();
		var portData = {
			id: id ? id : '',
			name: name ? name : '',
			startTime: startTime ? startTime : '',
			endTime: endTime ? endTime : '',
			orgList: orgList ? orgList : [],
			cameraList: cameraList ? cameraList : [],
			streamType: streamType ? Number(streamType) : '',
			reason: reason ? reason : '',
		}
		//校验
		var controlFlag = true;
		var checkArr = ['name', 'orgList', 'cameraList', 'reason', 'startTime', 'endTime'];
		checkArr.forEach(function (key) {
			if (key == 'orgList' || key == 'cameraList') {
				if (portData['orgList'] == [] && portData['cameraList'] == []) {
					controlFlag = false;
					$('#dispatch_orgList').addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').removeClass('hide');
				}
			} else if (key == 'startTime' || key == 'endTime') {
				if (portData['startTime'] == '' || portData['endTime'] == '') {
					controlFlag = false;
					if (portData['streamType'] == '0') {
						$('#dispatch_cameraTime').addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').removeClass('hide');
					} else if (portData['streamType'] == '1') {
						$('#dispatch_histroyTime').addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').removeClass('hide');
					}
				}
			} else if (portData[key] == '' || portData[key] == []) {
				$('#dispatch_' + key).addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').removeClass('hide');
				controlFlag = false;
			}
		});
		var portDataSuccessFunc = function (data) {
			if (data.code === '000') {
				$('#dispatchModal').modal('hide');
				createTaskList($('#tableTaskList'), $('#tableTaskListPagination'), true, 1, 10, $objTaskMainList);
				createCameraList($('#dispatchTableOne'), $('#dispatchTabletPagination'), true, 1, 10, $objCameraList); //镜头
				hideLoading($('#dispatchModal .modal-content'));
			} else {
				var tip = id ? '编辑失败' : '新建失败';
				warningTip.say(tip);
				hideLoading($('#dispatchModal .modal-content'));
			}
		}
		if (controlFlag) {
			showLoading($('#dispatchModal .modal-content'));
			loadData('/analysis/addOrEditAnalysisTask', true, portData, portDataSuccessFunc);
		}
	});

	// 编辑弹框点击确定按钮
	$('#dispatchModalSureEdit').on('click', function () {
		// 任务id
		var id = $('#dispatchModalEdit').attr('taskid');
		// 任务名称
		var name = $('#dispatch_name_edit').val();
		// 选择镜头
		var orgList = $('#dispatch_orgList_edit').data('gidArr');
		var cameraList = [];
		var mapList = $('#dispatch_orgList_edit').data('mapList');
		if (mapList && mapList.length > 0) {
			mapList.forEach(function (item) {
				cameraList.push(item.arr.id);
			});
		}
		// 视频类型
		//var streamType = $('#dispatch_streamType').find('.ui-checkboxradio-checked').siblings('input').val();
		//开始时间
		//var startTime = $('#timeStart').val(); 
		// 结束时间
		//var endTime = $('#timeEnd').val();
		// 申请原因
		var reason = $('#dispatch_reason_edit').val();
		var portData = {
			id: id ? id : '',
			name: name ? name : '',
			//startTime: startTime ? startTime : '',
			//endTime: endTime ? endTime : '',
			orgList: orgList ? orgList : [],
			cameraList: cameraList ? cameraList : [],
			//streamType: streamType ? Number(streamType) : '',
			reason: reason ? reason : '',
		}
		//校验
		var controlFlag = true;
		var checkArr = ['name', 'orgList', 'cameraList', 'reason'];
		checkArr.forEach(function (key) {
			if (key == 'orgList' || key == 'cameraList') {
				if (portData['orgList'] == [] && portData['cameraList'] == []) {
					controlFlag = false;
					$('#dispatch_orgList_edit').addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').removeClass('hide');
				}
			} else if (portData[key] == '' || portData[key] == []) {
				$('#dispatch_' + key + '_edit').addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').removeClass('hide');
				controlFlag = false;
			}
		});
		var portDataSuccessFunc = function (data) {
			if (data.code === '000') {
				$('#dispatchModalEdit').modal('hide');
				createTaskList($('#tableTaskList'), $('#tableTaskListPagination'), true, 1, 10, $objTaskMainList);
				createCameraList($('#dispatchTableOne'), $('#dispatchTabletPagination'), true, 1, 10, $objCameraList); //镜头
				hideLoading($('#dispatchModal .modal-content'));
			} else {
				var tip = id ? '编辑失败' : '新建失败';
				warningTip.say(tip);
				hideLoading($('#dispatchModalEdit .modal-content'));
			}
		}
		if (controlFlag) {
			showLoading($('#dispatchModalEdit .modal-content'));
			loadData('/analysis/addOrEditAnalysisTask', true, portData, portDataSuccessFunc);
		}
	});

	//镜头列表操作
	$("#dispatchModalOptSure").on("click", function () {
		var portData = {
			"taskIds": $cameraOpt
		},
			successFunc = function (data) {
				if (data.code === '000') {
					createCameraList($('#dispatchTableOne'), $('#dispatchTabletPagination'), true, 1, 10, $objCameraList); //镜头
				} else {
					hideLoading($("#dispatchTableOne"));
				}
			};
		if ($("#dispatchTipLabel").html() == '是否终止镜头调度任务？') { //终止
			var port = '/analysis/stopAnalysisTask';
			loadData(port, true, portData, successFunc);
		} else if ($("#dispatchTipLabel").html() == '是否重启镜头调度任务？') { //重启
			var port = '/analysis/restartAnalysisTask';
			loadData(port, true, portData, successFunc);
		} //else{
		// 	var port = '/analysis/restartAnalysisTask';  //删除
		// }
	});

	$('#dispatchPage').on('click', 'td .aui-icon-deactivation', function () {
		$('#dispatchTipModal').modal('show');
		$('#dispatchTipLabel').text('是否终止镜头调度任务？');
		$cameraOpt = [];
		$cameraOpt.push($(this).parents("tr").attr("taskid"));
	});

	$('#dispatchPage').on('click', 'td .aui-icon-video2', function () {
		$('#dispatchTipModal').modal('show');
		$('#dispatchTipLabel').text('是否重启镜头调度任务？');
		$cameraOpt = [];
		$cameraOpt.push($(this).parents("tr").attr("taskid"));
	});

	$('#dispatchPage').on('click', 'td .aui-icon-delete-line', function () {
		$('#dispatchTipModal').modal('show');
		$('#dispatchTipLabel').text('是否删除镜头调度任务？');
		$cameraOpt = [];
		$cameraOpt.push($(this).parents("tr").attr("taskid"));
	});

	// 表格编辑按钮点击事件
	$('#dispatchPage').on('click', 'td .aui-icon-edit', function () {
		var taskid = $(this).closest('tr').attr('taskid'),
			$dispatchModal = $('#dispatchModalEdit');

		var port = '/analysis/getAnalysisMainTaskDetail',
			portData = {
				"taskId": taskid ? taskid : ''
			},
			successFunc = function (data) {
				if (data.code === '000') {
					$dispatchModal.find('[id*=dispatch_]:not(#dispatch_orgList_edit)').removeClass('no-input-warning').val('').closest('.form-group').find('.text-danger.tip').addClass('hide');
					$dispatchModal.modal('show');
					$dispatchModal.attr('taskid', taskid);

					$('#dispatch_name_edit').val(data.result.name);
					$('#dispatch_reason_edit').val(data.result.reason);

					var orgNameArr = data.result.orgList.map(function (val, idenx) {
						return val.orgName;
					});
					var gidArr = data.result.orgList.map(function (val, idenx) {
						return val.orgid;
					});

					var cameraListEdit = data.result.orgList.map(function (val, idenx) {
						var obj = {};
						obj.id = val.orgid;
						obj.name = val.orgName
						return obj;
					});
					var mapListEdit = data.result.cameraList.map(function (val, idenx) {
						var obj = {};
						obj.arr = {
							id: val.cameraid
						};
						obj.listArr = {
							name: val.cameraName
						}
						return obj;
					});

					$('#dispatch_orgList_edit').data({
						'cameraList': cameraListEdit,
						'mapList': mapListEdit
					});

					var mapSelectStr = '';
					if (mapListEdit.length > 0) {
						for (var i = 0; i < mapListEdit.length; i++) {
							var mapListData = mapListEdit[i].listArr;
							// 判断列表模式下是否有选中值
							if (i === 0 && orgNameArr.length > 0) {
								mapSelectStr += ',';
							}
							// 地图模式下除去最后一个都要加上逗号
							if (i !== mapListEdit.length - 1) {
								mapSelectStr += mapListData.name + ',';
							} else {
								mapSelectStr += mapListData.name;
							}
						}
					}

					$('#dispatch_orgList_edit').val(orgNameArr.join(',') + mapSelectStr).data({
						'nameArr': orgNameArr,
						'gidArr': gidArr
					}).attr('title', orgNameArr.join(',') + mapSelectStr);
				}
			};
		loadData(port, true, portData, successFunc);
	});

	$('#dispatch_orgList').orgTree({
		all: true, //人物组织都开启
		area: ['960px', '718px'], //弹窗框宽高
		search: true, //开启搜索
		cls: 'camera-list',
		ajaxFilter: 'dispatch_orgList',
		node: 'dispatch_orgList',
		newBk: true,
	});

	$('#dispatch_orgList_edit').orgTree({
		all: true, //人物组织都开启
		area: ['960px', '718px'], //弹窗框宽高
		search: true, //开启搜索
		cls: 'camera-list',
		ajaxFilter: 'dispatch_orgList_edit',
		node: 'dispatch_orgList_edit',
		newBk: true,
	});

	// 布控区域，删除按钮事件
	$('#dispatch_orgList').siblings().on('click', function () {
		$('#dispatch_orgList').val('');
		var $data = $('#dispatch_orgList').data('cameraList');
		if ($data) {
			$('#dispatch_orgList').data({
				'cameraList': [],
				'gidArr': []
			})
		}
	});

	$('[data-role="radio"]').checkboxradio();
	$('[data-role="radio-button"]').checkboxradio({
		icon: false
	});

	$('#dispatchPage').on('click', '.dispatch .btn', function () {
		var $this = $(this);
		if ($this.siblings('.btn').length > 0) {
			$this.addClass('active').siblings().removeClass('active');
		}
		if ($this.index() == 0) {
			//$('#dispatchContent').removeClass('hide');
			$('#dispatchInfoContent').removeClass('hide');
			//$('#dispatchContent2').addClass('hide');
			$('#dispatchInfoContent2').addClass('hide');
		} else {
			//$('#dispatchContent').addClass('hide');
			$('#dispatchInfoContent').addClass('hide');
			//$('#dispatchContent2').removeClass('hide');
			$('#dispatchInfoContent2').removeClass('hide');
			if (!$('#dispatchBar2').hasClass('init')) {
				//createBarChart($('#dispatchBar2'));
			}
			$('#dispatchBar2').addClass('init');
		}
	});

	//镜头详情
	$('#dispatchPage').on('click', '.dispatch-tab-detail', function () {
		$('#dispatchPage').addClass('hide');
		$('#dispatchDetailPage').removeClass('hide');
		var $cameraId = $(this).data("cameraid");
		$cameraDetail.taskStatus = '';
		$cameraDetail.cameraid = $cameraId;
		creatCameraDetailList($("#dispatchTableCamera"), $("#dispatchTabletPaginationCamera"), true, 1, 6, $cameraDetail); //详情列表
		getStatus($("#stateListCamera"), 'CameraDetail', $(this)); //详情状态
	});

	//任务详情
	$('#dispatchPage').on('click', '.dispatch-tab-detail-task', function () {
		$('#dispatchPage').addClass('hide');
		$('#dispatchDetailPageTask').removeClass('hide');
		var $taskId = $(this).data("id");
		$taskDeatil.mainTaskId = $taskId;
		$taskDeatil.taskStatus = '';
		creatTaskDetailList($("#dispatchTableOneTask"), $("#dispatchTabletPaginationTask"), true, 1, 6, $taskDeatil); //详情列表
		getStatus($("#stateListTask"), 'taskDetail', $(this)); //详情状态
	});

	$('#backToDispatchPage').on('click', function () {
		$('#dispatchPage').removeClass('hide');
		$('#dispatchDetailPage').addClass('hide');
	});

	$("#backToDispatchPageTask").on("click", function () {
		$('#dispatchPage').removeClass('hide');
		$('#dispatchDetailPageTask').addClass('hide');
		$("#checkBoxTaskDetail").removeAttr("checked"); //列表的全选按钮去掉选中
	});

	//任务镜头详情状态icon点击
	$("#showBoxTask,#showBoxCamera").on("click", function (e) {
		$(".stateListTask").show();
		e.stopPropagation();
	});

	$(document).click(function () {
		$(".stateListTask").hide();
	});

	$(".stateListTask").on("click", function (e) {
		e.stopPropagation();
	});

	/**
	 * 调度任务模式列表生成
	 * @param {*} $table 表格容器
	 * @param {*} $pagination 表格分页容器
	 * @param {*} first 是否初次加载
	 * @param {*} page 当前页
	 * @param {*} number 每页显示数据个数
	 * @param {*} param 过滤条件对象
	 */
	function createTaskList($table, $pagination, first, page, number, param) {
		var $tbody = $table.find('tbody');
		if (first) {
			$tbody.html('<tr><td colspan="7" class="text-center">No matching records found</td></tr>');
			$pagination.html('');
		}
		showLoading($table);
		var port = '/analysis/getAnalysisMainTaskList',
			portData = {
				"page": page ? page : 1,
				"number": number ? number : 10,
				"param": param ? param : {},
			},
			successFunc = function (data) {
				hideLoading($table);
				if (data.code === '000') {
					var result = data.result.list;
					$table.data({
						'result': result
					});
					if (result && result.length > 0) {
						$tbody.empty();
						for (var i = 0; i < result.length; i++) {
							var html = '';
							html = `<tr data-index="${i}" class="" taskid="${result[i].id}">
									<!--<td class="bs-checkbox ">
										<div class="table-checkbox">
											<input data-index="0" name="btSelectItem" type="checkbox" value="0" class="table-checkbox-input table-checkbox-input-taskDetail">
											<span class="table-checkbox-label"></span>
										</div>
									</td>-->
									<td>
										<p class="text-bold text-link dispatch-tab-detail-task" data-id="${result[i].id}">${result[i].name || '--'}</p>
									</td>
									<td>${result[i].createBy || '--'}</td>
									<td>${result[i].createTime || '--'}</td>
									<td>${result[i].streamType == 0 && '实况' || result[i].streamType == 1 && '历史' || '--'}</td>
									<td>${result[i].startTime || '--'}</td>
									<td>${result[i].endTime || '--'}</td>
									<!--<td>
										<div class="status-item">
											<i class="status-icon status-icon-online"></i>
											<span class="status-text text-prompt">进行中</span>
										</div>
									</td> -->
									<td>
										<i class="icon aui-icon-edit aui-mr-sm"></i>
										<!--<i class="icon aui-icon-deactivation aui-mr-sm"></i>
										<i class="text-light aui-icon-video2 aui-mr-sm"></i>
										<i class="text-light aui-icon-delete-line"></i>-->
									</td>
								</tr>`
							$tbody.append(html);
							$tbody.find("tr").eq(i).data({
								'allData': result[i]
							});
						}

						if (data.result.total > Number(portData.number) && first) {
							var pageSizeOpt = [{
								value: 10,
								text: '10/页',
								selected: true
							}, {
								value: 15,
								text: '15/页',
							}];
							var eventCallBack = function (currPage, pageSize) {
								$(".table-checkbox-all-taskDetail").removeAttr("checked");
								createTaskList($table, '', false, currPage, pageSize, $objTaskMainList);
							};
							setPageParams($pagination, data.result.total, data.result.totalPage, eventCallBack, true, pageSizeOpt);
						}
					} else {
						$tbody.html('<tr><td colspan="7" class="text-center">No matching records found</td></tr>');
					}
				} else {
					$tbody.html('<tr><td colspan="7" class="text-center">No matching records found</td></tr>');
				}
			};
		loadData(port, true, portData, successFunc);
	}
	createTaskList($('#tableTaskList'), $('#tableTaskListPagination'), true);

	/**
	 * 调度镜头模式列表生成
	 * @param {*} $table 表格容器
	 * @param {*} $pagination 表格分页容器
	 * @param {*} first 是否初次加载
	 * @param {*} page 当前页
	 * @param {*} number 每页显示数据个数
	 * @param {*} param 过滤条件对象
	 */
	function createCameraList($table, $pagination, first, page, number, param) {
		var $tbody = $table.find('tbody');
		if (first) {
			$tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
			$pagination.html('');
		}
		showLoading($table);
		var port = '/analysis/getAnalysisTaskList',
			portData = {
				"page": page ? page : 1,
				"number": number ? number : 10,
				"param": param ? param : {},
			},
			successFunc = function (data) {
				hideLoading($table);
				if (data.code === '000') {
					var result = data.result.list;
					$table.data({
						'result': result
					});
					if (result && result.length > 0) {
						$tbody.empty();
						for (var i = 0; i < result.length; i++) {
							var html = '';

							html += `<tr data-index="${i}" class="" taskid="${result[i].taskId}">
						<td class="bs-checkbox ">
							<div class="table-checkbox">
								<input data-index="0" name="btSelectItem" type="checkbox" value="0" streamType="${result[i].streamType}" status="${result[i].taskStatus}" class="table-checkbox-input table-checkbox-input-cameraDetail">
								<span class="table-checkbox-label"></span>
							</div>
						</td>
						<td><p class="text-bold text-link dispatch-tab-detail" title=${result[i].cameraname || '--'} data-cameraId=${result[i].cameraid}>${result[i].cameraname || '--'}</p><p class="text-lighter">ID:${result[i].gbCode}</p></td>
						<td>${result[i].orgname || '--'}</td>
						<td>${result[i].streamType == 0 && '实况' || result[i].streamType == 1 && '历史' || '--'}</td>
						<td>${result[i].startTime || '--'}</td>
						<td>${result[i].endTime || '--'}</td>`;

							$("#statusCode").data('statusList').forEach(function (val) {
								switch (val.id) {
									case '-2':
										var iconStatus = 'status-icon-grade1';
										if (result[i].streamType == 0) {
											var optIcon = `<i class="text-light aui-icon-video2 aui-mr-sm"></i>`;
										} else {
											var optIcon = ``;
										}
										break;
									case '-1':
										var iconStatus = 'status-icon-grade0';
										var optIcon = ``;
										break;
									case '6':
										var iconStatus = 'status-icon-warning';
										var optIcon = ``;
										break;
									case '1':
										var iconStatus = 'status-icon-online';
										if (result[i].streamType == 0) {
											var optIcon = `<i class="icon aui-icon-deactivation aui-mr-sm"></i>`;
										} else {
											var optIcon = ``;
										}
										break;
									case '2':
										var iconStatus = 'status-icon-success';
										var optIcon = ``;
										break;
									default:
										var iconStatus = 'status-icon-grade2';
										var optIcon = ``;
								}
								if (val.id == result[i].taskStatus) {
									html += `<td>
											<div class="status-item">
												<i class="status-icon ${iconStatus}"></i>
												<span class="status-text">${val.name}</span>
											</div>
										</td>
										<td>
											<!--<i class="text-light aui-icon-delete-line"></i>-->
											${optIcon}
										</td>`
								}
							});

							html += `</tr>`
							$tbody.append(html);
							$tbody.find("tr").eq(i).data({
								'allData': result[i]
							});
						}
						if (data.result.total > Number(portData.number) && first) {
							var pageSizeOpt = [{
								value: 10,
								text: '10/页',
								selected: true
							}, {
								value: 15,
								text: '15/页',
							}];
							var eventCallBack = function (currPage, pageSize) {
								$(".table-checkbox-all-cameraDetail").removeAttr("checked");
								createCameraList($table, '', false, currPage, pageSize, $objCameraList);
							};
							setPageParams($pagination, data.result.total, data.result.totalPage, eventCallBack, true, pageSizeOpt);
						}
					} else {
						$tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
					}
				} else {
					$tbody.html('<tr><td colspan="8" class="text-center">No matching records found</td></tr>');
				}
			};
		loadData(port, true, portData, successFunc);
	}

	//调度任务模式详情列表生成
	function creatTaskDetailList($table, $pagination, first, page, number, param) {
		var $tbody = $table.find('tbody');
		if (first) {
			$tbody.html('<tr><td colspan="2" class="text-center">No matching records found</td></tr>');
			$pagination.html('');
		}
		showLoading($table);
		var port = '/analysis/getAnalysisCameraList',
			portData = {
				"page": page ? page : 1,
				"number": number ? number : 6,
				"param": param ? param : {},
			},
			successFunc = function (data) {
				hideLoading($table);
				if (data.code === '000') {
					var result = data.result.list;
					$("#logNumTask").html(data.result.total);
					$table.data({
						'result': result
					});
					if (result && result.length > 0) {

						var html = '';
						for (var i = 0; i < result.length; i++) {
							html += `<tr data-index="${i}" class="" taskid="${result[i].id}">
									<!--<td class="bs-checkbox ">
										<div class="table-checkbox">
											<input data-index="0" name="tableTaskDetail" type="checkbox" value="${result[i].id}" class="table-checkbox-input table-checkbox-input-taskDetail">
											<span class="table-checkbox-label"></span>
										</div>
									</td>-->
									<td>
										<p class="text-bold dispatch-tab-detail-task">${result[i].cameraName || '--'}</p>
									</td>
									<td>${result[i].gbCode || '--'}</td>
									<!--<td>${result[i].taskStatus || '--'}</td>-->
								</tr>`
						}

						$tbody.html(html);
						if (data.result.total > Number(portData.number) && first) {
							var pageSizeOpt = [{
								value: 4,
								text: '6/页',
								selected: true
							}, {
								value: 12,
								text: '12/页',
							}, {
								value: 18,
								text: '18/页',
							}];
							var eventCallBack = function (currPage, pageSize) {
								$("#checkBoxTaskDetail").removeAttr("checked"); //列表的全选按钮去掉选中
								creatTaskDetailList($table, '', false, currPage, pageSize, $taskDeatil);
							};
							setPageParams($pagination, data.result.total, data.result.totalPage, eventCallBack, true, pageSizeOpt);
						}
					} else {
						$tbody.html('<tr><td colspan="2" class="text-center">No matching records found</td></tr>');
					}
				} else {
					$tbody.html('<tr><td colspan="2" class="text-center">No matching records found</td></tr>');
				}
			};
		loadData(port, true, portData, successFunc);
	};

	//镜头模式详情列表
	function creatCameraDetailList($table, $pagination, first, page, number, param) {
		var $tbody = $table.find('tbody');
		if (first) {
			$tbody.html('<tr><td colspan="3" class="text-center">No matching records found</td></tr>');
			$pagination.html('');
		}
		showLoading($table);
		var port = '/analysis/getAnalysisTaskDetail',
			portData = {
				"page": page ? page : 1,
				"number": number ? number : 6,
				'param': param ? param : {}
			},
			successFunc = function (data) {
				hideLoading($table);
				if (data.code === '000') {
					var result = data.result.list;
					$("#logNumCamera").html(data.result.total);
					$table.data({
						'result': result
					});
					if (result && result.length > 0) {
						var html = '';
						for (var i = 0; i < result.length; i++) {
							html += `<tr data-index="${i}" class="" taskid="${result[i].id}">
									<!--<td class="bs-checkbox ">
										<div class="table-checkbox">
											<input data-index="0" name="tableTaskDetail" type="checkbox" value="${result[i].id}" class="table-checkbox-input table-checkbox-input-cameraDetail">
											<span class="table-checkbox-label"></span>
										</div>
									</td>-->
									<td>
										<p class="text-bold">${result[i].startTime || '--'}</p>
									</td>
									<td>${result[i].endTime || '--'}</td>`;

							$("#statusCode").data('statusList').forEach(function (val) {
								switch (val.id) {
									case '-2':
										var iconStatus = 'status-icon-grade1';
										//var optIcon = '<i class="text-light aui-icon-video2 aui-mr-sm"></i>';
										break;
									case '-1':
										var iconStatus = 'status-icon-grade0';
										//var optIcon = '';
										break;
									case '6':
										var iconStatus = 'status-icon-warning';
										//var optIcon = '';
										break;
									case '1':
										var iconStatus = 'status-icon-online';
										//var optIcon = '<i class="icon aui-icon-deactivation aui-mr-sm"></i>';
										break;
									case '2':
										var iconStatus = 'status-icon-success';
										//var optIcon = '';
										break;
									default:
										var iconStatus = 'status-icon-grade2';
									//var optIcon = '';
								}
								if (val.id == result[i].taskStatus) {
									html += `<td>
														<div class="status-item">
															<i class="status-icon ${iconStatus}"></i>
															<span class="status-text">${val.name}</span>
														</div>
													</td>`
								}
							});
							html += `</tr>`
						}

						$tbody.html(html);
						if (data.result.total > Number(portData.number) && first) {
							var pageSizeOpt = [{
								value: 6,
								text: '6/页',
								selected: true
							}, {
								value: 12,
								text: '12/页',
							}, {
								value: 18,
								text: '18/页',
							}];
							var eventCallBack = function (currPage, pageSize) {
								$("#checkBoxCameraDetail").removeAttr("checked"); //列表的全选按钮去掉选中
								creatTaskDetailList($table, '', false, currPage, pageSize, $cameraDetail);
							};
							setPageParams($pagination, data.result.total, data.result.totalPage, eventCallBack, true, pageSizeOpt);
						}
					} else {
						$tbody.html('<tr><td colspan="3" class="text-center">No matching records found</td></tr>');
					}
				} else {
					$tbody.html('<tr><td colspan="3" class="text-center">No matching records found</td></tr>');
				}
			};
		loadData(port, true, portData, successFunc);
	};

	// window.initDatePicker($('#dispatchDatepicker'), 3, false, true, false, {limitLength: 15,isNewControl: true});

	// 时间切换事件
	$('.nowTime [data-role="radio-button"]').on('click', function () {
		var $this = $(this),
			eventCls = $this.closest('.event'),
			date = $(this).val();
		var dt = new Date();
		$("#timeStart").val(dt.pattern("yyyy-MM-dd hh:mm:ss"));
		dt.setDate(dt.getDate() + parseInt(date));
		$("#timeEnd").val(dt.pattern("yyyy-MM-dd hh:mm:ss"));
	});

	// 时间切换事件
	$('.historyTime [data-role="radio-button"]').on('click', function () {
		var $this = $(this),
			eventCls = $this.closest('.event'),
			date = $(this).val();
		var dt = new Date();
		$("#timeEndHistory").val(dt.pattern("yyyy-MM-dd hh:mm:ss"));
		dt.setDate(dt.getDate() - parseInt(date));
		$("#timeStartHistory").val(dt.pattern("yyyy-MM-dd hh:mm:ss"));
	});

	//调度查询状态接口
	function getStatus($container, type, that) {
		var port = 'index/dictionaryInfo',
			portData = {
				"kind": 'ANALYSIS_TASK_STATUS'
			},
			successFunc = function (data) {
				if (data.code === '000') {
					var result = data.result.ANALYSIS_TASK_STATUS;
					$("#statusCode").data('statusList', result);
					var html = '';
					if (type != 'mainList') {
						html = `<div class="table-checkbox detailBox">
								<input data-index="0" name="btSelectItemTask" type="radio" value="" class="table-checkbox-input" id="${$container.attr('id')}stateGo" checked>
								<span class="table-checkbox-label"></span>
								<span for="stateGo">全部</span>
							</div>`;
						for (var i = 0; i < result.length; i++) {
							html += `<div class="table-checkbox detailBox">
									<input data-index="0" name="btSelectItemTask" type="radio" value="${result[i].id}" class="table-checkbox-input" id="${$container.attr('id')}stateGo${i}">
									<span class="table-checkbox-label"></span>
									<span for="stateGo${i}">${result[i].name}</span>
								</div>`;
						}
					} else {
						var typeHtmlArr = [];
						for (let i = 0; i < result.length; i++) {
							typeHtmlArr.push('<li class="tag" typeId="' + result[i].id + '">' + result[i].name + '</li>');
						}
						html = typeHtmlArr.join('');
					}

					$container.empty().append(html);
					$container.data({
						"status": result
					});
					if (that) {
						getTaskDetailInfo(that.parents("tr").data("allData"), type); //详情顶部信息
					} else {
						createCameraList($('#dispatchTableOne'), $('#dispatchTabletPagination'), true, 1, 10, $objCameraList); //镜头
					}
				}
			};
		loadData(port, true, portData, successFunc);
	}

	//调度详情顶部信息 第一个参数为传入的数据，第二个为页面类型
	function getTaskDetailInfo(data, type) {
		if (type === 'taskDetail') {
			$("#creatNameTask").html(data.name);
			$("#creatByTask").html(data.createBy);
			$("#creatTimeTask").html(data.createTime);
			$("#creatStartTask").html(data.startTime);
			$("#creatReasonTask").html(data.reason);
			$status = $("#stateListTask").data("status");
			$status.forEach(function (val, index) {
				if (val.id == data.streamType) {
					$("#creatStatusTask").html(val.name);
				}
			});
		} else {
			$("#nameCamera").html(data.cameraname);
			$("#unitCamera").html(data.orgname);
			$("#codeCamera").html(data.gbCode);
			$("#timeCamera").html((data.startTime ? data.startTime : '---') + (data.endTime ? '至' + data.endTime : ''));
		}
	}
	/*
		调度镜头列表
	*/
	$('#dispatchKeyWordInput').siblings('.aui-input-suffix').on('click', function () {
		var searchText = $('#dispatchKeyWordInput').val();
		$objCameraList.fuzzy = searchText;
		createCameraList($('#dispatchTableOne'), $('#dispatchTabletPagination'), true, 1, 10, $objCameraList);
	});

	// 输入框数据检索功能
	$('#dispatchKeyWordInput').on('keyup', function (evt) {
		if (evt.keyCode === 13) {
			var searchText = $('#dispatchKeyWordInput').val();
			$objCameraList.fuzzy = searchText;
			createCameraList($('#dispatchTableOne'), $('#dispatchTabletPagination'), true, 1, 10, $objCameraList);
		}
	});

	/*
		调度任务列表
	*/
	// 输入框数据检索功能
	$('#dispatchKeyWordInput2').on('keyup', function (evt) {
		if (evt.keyCode === 13) {
			var searchText = $('#dispatchKeyWordInput2').val();
			$objTaskMainList.fuzzy = searchText;
			createTaskList($('#tableTaskList'), $('#tableTaskListPagination'), true, 1, 10, $objTaskMainList);
		}
	});
	$('#dispatchKeyWordInput2').siblings('.aui-input-suffix').on('click', function () {
		var searchText = $('#dispatchKeyWordInput2').val();
		$objTaskMainList.fuzzy = searchText;
		createTaskList($('#tableTaskList'), $('#tableTaskListPagination'), true, 1, 10, $objTaskMainList);
	});

	//获取筛选数据调度
	function getDispatchData($dom) {
		for (var dispatchSelect = 0; dispatchSelect < $dom.find(".tag-list .tag-prompt").length; dispatchSelect++) {
			$dom.find(".tag-list .tag-prompt").eq(dispatchSelect).html();
		}
	}

	//获取筛选选择数据
	function getTabFilterData($dom) {
		var $tag = $dom.find('.card-operate-box .tag-list').eq(0),
			dataArr = $tag.data('tagDataArr');
		return dataArr;
	}

	//调度任务详情状态单选切换事件
	$("#stateListTask").on("change", "input:radio[name='btSelectItemTask']:checked", function () {
		$taskDeatil.taskStatus = $("input:radio[name='btSelectItemTask']:checked").val();
		creatTaskDetailList($("#dispatchTableOneTask"), $("#dispatchTabletPaginationTask"), true, 1, 6, $taskDeatil); //详情列表
	});

	//调度镜头详情状态单选切换事件
	$("#stateListCamera").on("change", "input:radio[name='btSelectItemTask']:checked", function () {
		$cameraDetail.taskStatus = $("input:radio[name='btSelectItemTask']:checked").val();
		creatCameraDetailList($("#dispatchTableCamera"), $("#dispatchTabletPaginationCamera"), true, 1, 6, $cameraDetail); //详情列表
	});

	//调度任务详情刷新按钮点击事件
	$("#taskRresh").on("click", function () {
		$taskDeatil.taskStatus = '';
		$("#stateListTask").find("input:radio[name='btSelectItemTask']").eq(0).prop("checked", "checked");
		$("#checkBoxTaskDetail").removeAttr("checked"); //列表的全选按钮去掉选中
		creatTaskDetailList($("#dispatchTableOneTask"), $("#dispatchTabletPaginationTask"), true, 1, 6, $taskDeatil); //详情列表
	});

	//调度镜头详情刷新按钮点击事件
	$("#cameraRefresh").on("click", function () {
		$cameraDetail.taskStatus = '';
		$("#stateListCamera").find("input:radio[name='btSelectItemTask']").eq(0).prop("checked", "checked");
		$("#checkBoxCameraDetail").removeAttr("checked"); //列表的全选按钮去掉选中
		creatCameraDetailList($("#dispatchTableCamera"), $("#dispatchTabletPaginationCamera"), true, 1, 6, $cameraDetail); //详情列表
	});

	//列表头部全选按钮点击事件任务
	$(".table-checkbox-all-taskDetail").on("click", function () {
		if ($(this).is(":checked")) {
			for (var i = 0; i < $(this).parents("table").find("tbody .table-checkbox-input-taskDetail").length; i++) {
				$(this).parents("table").find("tbody .table-checkbox-input-taskDetail").eq(i).prop("checked", "checked");
			}
		} else {
			for (var i = 0; i < $(this).parents("table").find("tbody .table-checkbox-input-taskDetail").length; i++) {
				$(this).parents("table").find("tbody .table-checkbox-input-taskDetail").eq(i).removeAttr("checked");
			}
		}
	});

	//列表头部全选按钮点击事件镜头
	$(".table-checkbox-all-cameraDetail").on("click", function () {
		if ($(this).is(":checked")) {
			for (var i = 0; i < $(this).parents("table").find("tbody .table-checkbox-input-cameraDetail").length; i++) {
				$(this).parents("table").find("tbody .table-checkbox-input-cameraDetail").eq(i).prop("checked", "checked");
			}
		} else {
			for (var i = 0; i < $(this).parents("table").find("tbody .table-checkbox-input-cameraDetail").length; i++) {
				$(this).parents("table").find("tbody .table-checkbox-input-cameraDetail").eq(i).removeAttr("checked");
			}
		}
	});

	//调度镜头详情列表tbody每一个单选框点击事件
	$(document).on("change", ".table-checkbox-input-cameraDetail", function () {
		for (var i = 0; i < $(this).parents("table").find("tbody .table-checkbox-input-cameraDetail").length; i++) {
			if (!$(this).parents("table").find("tbody .table-checkbox-input-cameraDetail").eq(i).is(":checked")) {
				$(this).parents("table").find("thead .table-checkbox-all-cameraDetail").removeAttr("checked");
				return;
			}
		}
		$(this).parents("table").find("thead .table-checkbox-all-cameraDetail").prop("checked", "checked");
	});

	//调度任务详情列表tbody每一个单选框点击事件
	$(document).on("change", ".table-checkbox-input-taskDetail", function () {
		for (var i = 0; i < $(this).parents("table").find("tbody .table-checkbox-input-taskDetail").length; i++) {
			if (!$(this).parents("table").find("tbody .table-checkbox-input-taskDetail").eq(i).is(":checked")) {
				$(this).parents("table").find("thead .table-checkbox-all-taskDetail").removeAttr("checked");
				return;
			}
		}
		$(this).parents("table").find("thead .table-checkbox-all-taskDetail").prop("checked", "checked");
	});

	//调度地图初始化
	window.addEventListener("message", function (ev) {
		var mydata = ev.data;
		if (mydata == 'initMap' || mydata == 'initMap?' || mydata == 'initMap?44031' && $('#map_iframe').length > 0) {
			var searchMapIframe = document.getElementById('map_iframe');
			var targetOrigin = 'http://190.112.1.208:8082';
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
			var searchMapData = {
				type: "cluster",
				mydata: []
			};
			window.setTimeout(function () {
				searchMapIframe.contentWindow.postMessage(mapOperationData, targetOrigin);
				searchMapIframe.contentWindow.postMessage(searchMapData, targetOrigin);
				searchMapIframe.contentWindow.postMessage({
					type: 'fullExtent'
				}, targetOrigin);
			}, 1000);
		}
	});

	// 单个参数校验
	$('#dispatchModal').find('[id^="dispatch_"]').off('blur').on('blur', function () {
		if ($(this).val().replace(/\s/g, '') === '') {
			$(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
		} else {
			$(this).removeClass('no-input-warning').closest('.control-form').find('.text-danger.tip').addClass('hide');
		}
	})

	// 单个参数校验
	$('#dispatchModalEdit').find('[id^="dispatch_"]').off('blur').on('blur', function () {
		if ($(this).val().replace(/\s/g, '') === '') {
			$(this).addClass('no-input-warning').closest('.control-form').find('.text-danger.tip').removeClass('hide');
		} else {
			$(this).removeClass('no-input-warning').closest('.control-form').find('.text-danger.tip').addClass('hide');
		}
	})

})(window, window.jQuery);