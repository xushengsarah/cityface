(function (window, $) {

	$('[ data-role="radio"]').checkboxradio();
	$('[ data-role="radio-button"]').checkboxradio({
		icon: false
	});

	// 身份证号回车事件,去掉身份证提示
	$(document).on('keydown', '#peeridcardsearch', function (e) {
		$(this).closest(".card-side-header-box").find(".idcard-alert").removeClass("show");
		// $(".idcard-alert").removeClass("show");
		$(this).closest(".search-box").find(".img-alert").removeClass("show");
		var code = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
		if (code == 13) {
			findIdcard(e);
		}
	})

	// 左侧图片删除事件
	$('#peerAddSearchImg').on('click', '.aui-icon-delete-line', function (e) {
		e.stopPropagation();
		var father = $(this).closest('.add-image-item');
		father.remove();
		var $imgItem = $('#peerAddSearchImg').find('.add-image-item');
		// $imgItem.eq(-1).addClass('active');
		if ($imgItem.length < 6) {
			$('#peerAddSearchImg').removeClass('scroll');
		}
		if ($imgItem.length === 0) {
			$('#peerAddSearchImg').addClass('center');
			$('#peerAddSearchImg').find('.add-image-icon').addClass('add-image-new');
			$('#peerAddSearchImg').find('.add-image-box-text').removeClass('hide');
		}
		var $imgNub = $imgItem.length;
		if ($imgNub < 2) {
			$('#peerAddSearchImg').find('.add-image-icon').removeClass('hide');
		}
	})

	// 左侧图片选中事件
	$('#peerAddSearchImg').on('click', '.image-checkbox-wrap', function (e) {
		var $this = $(this).find('.ui-checkboxradio-label');
		if ($this.hasClass('ui-checkboxradio-checked')) {
			//取消选中
			$this.removeClass('ui-checkboxradio-checked').closest('.add-image-item').removeClass('active').find('.image-card-list-title .ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
		} else {
			//选中
			$this.addClass('ui-checkboxradio-checked').closest('.add-image-item').addClass('active');
		}
	})

	// 图片上传
	$('#peerAddSearchImg').find('.uploadFile').on('change.searchMerge', function () {
		var _this = $(this);
		var reader = new FileReader();
		var fileNameArr = this.value.split('\\'), // 文件名路径数组
			fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
			fileNameTypeArr = fileName.split('.'),
			fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase(),
			typeArr = ['bmp', 'jpg', 'jpeg', 'png', 'dib', 'webp', 'svgz', 'gif', 'ico', 'svg', 'tif', 'xbm', 'jfif', 'pjpeg', 'pjp', 'tiff'];
		if (typeArr.indexOf(fileType) < 0) {
			this.value = '';
			warningTip.say('格式不正确,请上传图片格式');
			return;
		}
		reader.onload = function (e) {
			var addimg = reader.result;
			html = createAddImagesItem(addimg);
			_this.closest('.add-image-icon').before(html);
			$('#peerAddSearchImg').find('.uploadFile')[0].value = '';
			var $imgItem = $('#peerAddSearchImg').find('.add-image-item');
			if ($imgItem.length > 5) {
				$('#peerAddSearchImg').removeClass('scroll');
				var clientH = $('#peerAddSearchImg')[0].clientHeight;
				$('#peerAddSearchImg').addClass('scroll');
				$('#peerAddSearchImg').animate({
					'scrollTop': clientH
				}, 500);
			}
			// imgDom(addimg, $('#peerSearch'), $("#peerAddSearchImg"), true);
			$('#peerAddSearchImg').find('.ui-checkboxradio-label').last().click();
			if ($('#peerAddSearchImg').find('.ui-checkboxradio-checked').length > 2) {
				$('#peerAddSearchImg').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked').closest('.add-image-item').removeClass('active');
				$('#peerAddSearchImg').find('.ui-checkboxradio-label').eq(-1).click();
				$('#peerAddSearchImg').find('.ui-checkboxradio-label').eq(-2).click();
			}
		};
		reader.readAsDataURL(this.files[0]);
		$('#peerAddSearchImg').removeClass('center');
		$('#peerAddSearchImg').find('.add-image-icon').removeClass('add-image-new');
		$('#peerAddSearchImg').find('.add-image-box-text').addClass('hide');
		// $("#peerAddSearchImg .add-image-icon").siblings('.add-image-item').removeClass('active');
	});

	// 时间控件构建的点击事件
	$('#peerSelectTime .btn-group.btn-group-capsule').find('button').on('click', function () {
		var date = $(this).data().date;
		window.initDatePicker1($('#peerAnalysis_time'), -date, true);
		$(this).addClass('btn-primary').siblings().removeClass('btn-primary');
	});

	// 地图选择摄像机 地图按钮点击事件
	$('#PSearchMap').on("click", function () {
		$("#selPeerCameraID .searchArea").hide();
		$("#selPeerCameraID .searchMap").show();
		$("#PSearchSelect").removeClass("btn-primary");
		$("#PSearchMap").addClass("btn-primary");
		$('#peerMap').removeClass('hide');
		$('#peerSearchResult').addClass('hide');
	});

	// 区域选择摄像机 区域按钮点击事件
	$("#PSearchSelect").on("click", function () {
		$("#selPeerCameraID .searchArea").show();
		$("#selPeerCameraID .searchMap").hide();
		$("#PSearchSelect").addClass("btn-primary");
		$("#PSearchMap").removeClass("btn-primary");
	});

	// 区域切换类点
	$("#peerAnalysisPage").on("change", ".cameraTypeSearch input", function () {
		if ($("#PSidebarPoliceSelect").val()) {
			loadSearchCameraInfo($("#PSidebarCameraSelect"), $("#PSidebarPoliceSelect").val());
		}
	});

	// 加载同行分析结果 搜索点击事件
	$('#peerSearch').on('click', function () {
		// 防止暴力点击 点击一次之后 2s后才能第二次点击
		$('#peerSearch').attr('disabled', 'disabled')
		setTimeout(function () {
			$('#peerSearch').removeAttr('disabled')
		}, 1000)
		//初始化以及左侧数据限定---begin---
		$('#peerTimeResult').html('');
		$('#pathAnalyse').data({
			'trackDataTime': '',
			'trackDataSimilar': ''
		});
		if (!$('#pathAnalyse').hasClass('text-disabled')) {
			$('#pathAnalyse').addClass('text-disabled');
		}
		//判断图片个数
		var $selectImg = $('#peerAddSearchImg').find('.add-image-item.active');
		if ($selectImg.length !== 2) {
			warningTip.say('请选择两张图片！');
			return false;
		}
		if ($('#peerTime input').val().replace(/\s/g, '') == '') {
			warningTip.say('同行次数不能为空');
			return;
		} else if ($('#peerTime input').val() === '0') {
			warningTip.say('同行次数不能为0');
			return;
		}
		if ($('#peerInterval input').val().replace(/\s/g, '') == '') {
			warningTip.say('同行时间间隔不能为空');
			return;
		}
		//搜索结果先显示列表，地图切换
		$('#peerSearchResult').removeClass('hide');
		$('#peerMap').addClass('hide');
		//初始化以及左侧数据限定---end---

		// 同行人分析获取提交数据函数
		var typeSearch = $("#selPeerCameraID .searchArea").css("display") === 'none' ? 'map' : 'area'; //判断是地图还是区域
		var peerRequestData = getPeerSearchData(typeSearch);

		// 清除查看大图节点
		var $maskDom = $('body').find('.mask-container-fixed').not('.modal-control');
		if ($maskDom.length > 0) {
			$maskDom.remove();
		}
		peerSnappingSearchTime(peerRequestData);
		peerSnappingSearchSimilar(peerRequestData);
	});

	// 地图切换到同行分析结果列表展示状态 点击事件
	$('#peerListAnalysis').on('click', function () {
		var listAnalyseClass = $('#peerSearchResult');
		if (listAnalyseClass.hasClass('hide') === true) {
			$('#peerSearchResult').removeClass('hide');
			$('#peerMap').addClass('hide');
		}
	})

	// 同行分析结果列表展示状态切换到地图 点击事件
	// $('#peerMapAnalysis').on('click', function () {
	// 	var mapAnalyseClass = $('#peerMap');
	// 	if (mapAnalyseClass.hasClass('hide') === true) {
	// 		$('#peerSearchResult').addClass('hide');
	// 		$('#peerMap').removeClass('hide');
	// 	}
	// })

	// 同行分析结果导航栏 相似度排序下拉菜单 点击事件
	$('#peerSortBySimilar').on('click', '', function () {
		peerSnappingTab = 1;
		var $cardContent = $('#peerSimilarResult');
		if ($cardContent.hasClass('hide')) {
			$cardContent.removeClass('hide');
			$('#peerTimeResult').addClass('hide');
		} else {
			return;
		}
		var selectedTime = $('#pathAnalyse').data('trackDataSimilar');
		if (selectedTime.length > 0) {
			$('#pathAnalyse').removeClass('text-disabled');
		} else {
			$('#pathAnalyse').addClass('text-disabled');
		}
		peerSelectedPageAll($cardContent);
	})

	// 同行分析结果导航栏 按时间排序下拉菜单 点击事件
	$('#peerSortByTime').on('click', '', function () {
		peerSnappingTab = 2;
		var $cardContent = $('#peerTimeResult');
		if ($cardContent.hasClass('hide')) {
			$cardContent.removeClass('hide');
			$('#peerSimilarResult').addClass('hide');
		} else {
			return;
		}
		var selectedTime = $('#pathAnalyse').data('trackDataTime');
		if (selectedTime.length > 0) {
			$('#pathAnalyse').removeClass('text-disabled');
		} else {
			$('#pathAnalyse').addClass('text-disabled');
		}
		peerSelectedPageAll($cardContent);
	})

	//  同行分析结果导航栏 全选点击事件
	$('#peerAllSnapping').on('click', function () {
		var typeSearch = $("#selPeerCameraID .PSearchArea").css("display") === 'none' ? 'map' : 'area';
		var peerRequestData = getPeerSearchData(typeSearch);
		if (!peerRequestData.img1 && !peerRequestData.img2) {
			return;
		}
		var $this = $(this).find('.ui-checkboxradio-label');
		var selectedTime = [],
			selectedSimilar = [];
		//全选
		var peerResultId = $('#peerSearchResult .peer-overview-time').not('.hide').attr('id')
		if (peerResultId === 'peerSimilarResult') {
			var $peerResult = $('#peerSimilarResult');
			peerData = peerDataList1;
			if (!$this.hasClass('ui-checkboxradio-checked')) {
				$this.addClass('ui-checkboxradio-checked');
				$peerResult.find('.peer-item').addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
				peerData.map(function (e) {
					selectedSimilar.push(e);
				});
			} else { //取消全选
				$this.removeClass('ui-checkboxradio-checked');
				$peerResult.find('.peer-item').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
				selectedSimilar = [];
			}
			// peerSelectedCardList = peerUnique(peerSelectedCardList);
			if (selectedSimilar.length > 0) {
				$('#pathAnalyse').removeClass('text-disabled');
			} else {
				$('#pathAnalyse').addClass('text-disabled');
			}
		} else {
			var $peerResult = $('#peerTimeResult');
			peerData = peerDataList;
			if (!$this.hasClass('ui-checkboxradio-checked')) {
				$this.addClass('ui-checkboxradio-checked');
				$peerResult.find('.peer-item').addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
				peerData.map(function (e) {
					selectedTime.push(e);
				});
			} else { //取消全选
				$this.removeClass('ui-checkboxradio-checked');
				$peerResult.find('.peer-item').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
				selectedTime = [];
			}
			// peerSelectedCardList = peerUnique(peerSelectedCardList);
			if (selectedTime.length > 0) {
				$('#pathAnalyse').removeClass('text-disabled');
			} else {
				$('#pathAnalyse').addClass('text-disabled');
			}
		}
		$('#pathAnalyse').data({
			'trackDataTime': selectedTime,
			'trackDataSimilar': selectedSimilar
		});
	})

	// 同行分析结果导航栏 刷新按钮点击事件
	$('#peerRefreshBtn').on('click', function () {
		$('#peerSearch').click();
	});

	// 同行分析结果导航栏 轨迹分析按钮点击事件
	$('#pathAnalyse').on('click', function () {
		var typeSearch = $("#selPeerCameraID .PSearchArea").css("display") === 'none' ? 'map' : 'area';
		var peerRequestData = getPeerSearchData(typeSearch);
		var listAnalyseClass = $('#peerMap');
		if (!peerRequestData.img1 && !peerRequestData.img2) {
			return;
		}
		var peerResultId = $('#peerSearchResult .peer-overview-time').not('.hide').attr('id')
		if (peerResultId === 'peerSimilarResult') {
			var data = $('#pathAnalyse').data('trackDataSimilar');
		} else {
			var data = $('#pathAnalyse').data('trackDataTime');
		}
		if (data === undefined) {
			warningTip.say('请选择同行数据');
		} else {
			if (data.length === 0) {
				warningTip.say('请选择同行数据');
			} else {
				if (listAnalyseClass.hasClass('hide') === true) {
					$('#peerMap').removeClass('hide');
					$('#peerSearchResult').addClass('hide');
				}
				lodeMapNew(data, 'peer_map_iframe');
			}
		}
	})

	// 同行分析结果 卡片多选框点击事件
	$('#peerSearchResult').on('click', '.peer-item .image-checkbox-wrap', function () {
		var $this = $(this).find('.ui-checkboxradio-label');
		var index = $this.closest('.peer-item').index();
		var selectedTime = $('#pathAnalyse').data('trackDataTime') && $('#pathAnalyse').data('trackDataTime').length > 0 ? $('#pathAnalyse').data('trackDataTime') : [];
		var selectedSimilar = $('#pathAnalyse').data('trackDataSimilar') && $('#pathAnalyse').data('trackDataSimilar').length > 0 ? $('#pathAnalyse').data('trackDataSimilar') : [];
		var peerResultId = $('#peerSearchResult .peer-overview-time').not('.hide').attr('id')
		if (peerResultId === 'peerSimilarResult') {
			if ($this.hasClass('ui-checkboxradio-checked')) {
				//取消选中
				$this.removeClass('ui-checkboxradio-checked').closest('.peer-item').find('.image-card-list-title .ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
				$('#peerAllSnapping').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
				$this.closest('.peer-item').removeClass('active');
				//删除数据
				selectedSimilar.map(function (e, n) {
					if (e.cameraId == peerDataList1[index].cameraId) {
						selectedSimilar.splice(n, 1);
					}
				})
			} else { //选中
				$this.addClass('ui-checkboxradio-checked').closest('.peer-item').addClass('active');
				selectedSimilar.push(peerDataList1[index]);
				peerSelectedPageAll($('#peerSimilarResult'));
			}
			if (selectedSimilar.length > 0) {
				$('#pathAnalyse').removeClass('text-disabled');
			} else {
				$('#pathAnalyse').addClass('text-disabled');
			}
		} else {
			if ($this.hasClass('ui-checkboxradio-checked')) {
				//取消选中
				$this.removeClass('ui-checkboxradio-checked').closest('.peer-item').find('.image-card-list-title .ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
				$('#peerAllSnapping').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
				$this.closest('.peer-item').removeClass('active');
				//删除数据
				selectedTime.map(function (e, n) {
					if (e.cameraId == peerDataList[index].cameraId) {
						selectedTime.splice(n, 1);
					}
				})
			} else { //选中
				$this.addClass('ui-checkboxradio-checked').closest('.peer-item').addClass('active');
				selectedTime.push(peerDataList[index]);
				peerSelectedPageAll($('#peerTimeResult'));
			}
			if (selectedTime.length > 0) {
				$('#pathAnalyse').removeClass('text-disabled');
			} else {
				$('#pathAnalyse').addClass('text-disabled');
			}
		}
		$('#pathAnalyse').data({
			'trackDataTime': selectedTime,
			'trackDataSimilar': selectedSimilar
		});
	});

	// 同行分析结果 点击卡片 展开大图事件
	$('#content-box').on('click', '.peer-item .peer-item-img-box', function (evt) {
		var $alarm = $(this).closest('.peer-overview-time'),
			alarmId = $alarm.attr('id'),
			index = $(this).closest('.peer-item').index(),
			listData = $(this).closest('.peer-item').data('listData');
		window.peerCreateBigImgMask($alarm, alarmId, index, $('#peerAddSearchImg'), evt, {
			cardImg: $(this).closest('.peer-item'),
			data: listData,
			html: $(changePeerMaskHtml(listData))
			//html:$(window.commonMaskRight(2,listData))   //2位为告警弹窗右侧信息，第二个参数为data
		});
	});

	// 加载空页面
	initPage();

	// 初始化同行分析结果部分拖拽框选功能
	peerDropSelect();

	// 初始化左侧机构选项
	initDynamic($("#PSidebarOrgSelect"), $("#PSidebarPoliceSelect"), $("#PSidebarCameraSelect"));

	// 初始化地图选择摄像头事件
	loadMapCameraList();

	// 初始化时间控件
	window.initDatePicker1($('#peerAnalysis_time'), -3);

	// 同行人地图初始化/选择摄像机/监听地图传来的数据
	window.addEventListener("message", function (ev) {
		var mydata = ev.data;
		if (mydata == 'initMap' || mydata == 'initMap?' || mydata == 'initMap?44031' && $('#peer_map_iframe').length > 0) {
			var searchMapIframe = document.getElementById('peer_map_iframe');
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
			}, 2000);
		} else {
			if (mydata.date) {
				var $alarm = $('#peerTimeResult'),
					alarmId = 'peerTimeResult',
					index = 0,
					listData = [mydata];
				window.peerCreateBigImgMask($alarm, alarmId, index, $('#peerAddSearchImg'), false, {
					cardImg: false,
					data: listData,
					html: $(changePeerMaskHtml(listData, 'map'))
				}, 'map');
			} else {
				return;
			}
		}
	});

})(window, window.jQuery)