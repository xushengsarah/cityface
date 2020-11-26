var peerDataList = ''; //同行人分析搜索返回数据 时间排序
var peerDataList1 = ''; //同行人分析搜索返回数据 相似度排序
var peerSnappingTab = 2; //同行人分析排序标记 1：相似度排序 2：时间排序

/**
 * 生成左侧搜索图片节点
 * @param { String } src 上传图片路径
 */
function createAddImagesItem(src) {
	var html = `
			<div class="add-image-item">
				<div class="image-checkbox-wrap">
					<label class="ui-checkboxradio-checkbox-label ui-checkboxradio-label ui-button ui-widget" style="margin: 0!important; left:0;">
						<span class="ui-checkboxradio-icon  ui-icon ui-icon-background ui-icon-blank"></span>
					</label>
				</div>
				<img class="add-image-img" src="${src}" alt="">
				<i class="aui-icon-delete-line"></i>
			</div> 
			`;
	return html;
}

/**
 * 同行人分析轨迹gis地图加载
 * @param { String } option //传给地图的数据
 * @param { String } iframeId // 地图展示ID位置
 */
function lodeMapNew(option, iframeId) {
	var iframe = document.getElementById(iframeId);
	var targetOrigin = 'http://190.168.17.2:6081/peopleCity.html',
		data = {
			type: "peopleTrak",
			dataType: "peer_map_iframe",
			mydata: option
		};
	iframe.contentWindow.postMessage(data, targetOrigin);
}

/**
 * 全选按钮选中状态
 * @param { Object } $el // jquery对象 包含卡片的区域ID
 */
function peerSelectedPageAll($el) {
	var cardLen = $el.find('.peer-item').length,
		activeLen = $el.find('.peer-item.active').length;
	if (cardLen > 0 && cardLen == activeLen) {
		$('#peerAllSnapping').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
	} else {
		$('#peerAllSnapping').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
	}
}

/**
 * 生成同行人分析大图右侧列表
 * @param { Object } data // 分析结果内容区域卡片绑定数据
 */
function changePeerMaskHtml(data, type) {
	var timeLineHtml = '',
		totalHtml = '';
	if (type) {
		var data = {
			cameraName: data[0].dataInfo[0].capture1.cameraName,
			times: data[0].dataInfo.length,
			dates: data
		}
	}
	if (!type && peerSnappingTab === 1) {
		var result = [data];
	} else {
		var result = data.dates;
	}

	for (var i = 0; i < result.length; i++) {
		var cardListHtml = '';
		if (!type && peerSnappingTab === 1) {
			var dateTitle = '相似度排序';
		} else {
			var dateTitle = result[i].date;
		}
		var dataInfo = result[i].dataInfo;
		for (var j = 0; j < dataInfo.length; j++) {
			var time1 = dataInfo[j].capture1.captureTime.split(' ')[1],
				time2 = dataInfo[j].capture2.captureTime.split(' ')[1],
				score1 = Math.round(Number(dataInfo[j].capture1.similarity.split('%')[0])),
				score2 = Math.round(Number(dataInfo[j].capture2.similarity.split('%')[0]));
			cardListHtml += `<li class="peer-items">
				<div class="peer-item-content">
					<div class="peer-item-img-box">
						<div class="peer-item-img">
							<img src="${dataInfo[j].capture1.smallPicUrl}">
							<img src="${dataInfo[j].capture2.smallPicUrl}">
						</div>
						<div class="peer-item-percent">
							<span class="grade1">同行</span>
							<span class="grade2">${score1}%</span>
							<span class="grade3">${score2}%</span>
						</div>
					</div>
					<div class="peer-item-time">
						<span>${time1}</span>
						<span>${time2}</span>
					</div>
				</div>
			</li>`;
		}
		timeLineHtml += `<div class="aui-timeline-item">
			<div class="aui-timeline-item-header clearfix">
				<div class="aui-timeline-item-dot"></div>
				<div class="aui-timeline-item-title">${dateTitle}</div>
			</div>
			<div class="aui-timeline-item-wrap">
				<div class="alarm-info-box">
					<ul class="card-title-content warning-list peer-overview-time clearfix" id="all-peer-time${i}">
						${cardListHtml}
					</ul>
				</div>
			</div>
		</div>`;
	}
	// if (disabled) {
	//     $container.prop('disabled', true);
	// } else {
	//     $container.prop('disabled', false);
	// }
	// $container.empty().append(totalHtml);
	totalHtml = `<div class="aui-col-6">
		<div class="case-item-operate peerImgTitle">
			<span>${data.cameraName}</span>
			<span class="peer-total">&nbsp; 共${data.times}次</span>
		</div>
		<div class="mask-info-box" style="padding-top: 5rem;">
			<div style="overflow:auto; height:100%;">
				<div class="aui-timeline" id="peerListNews">
					${timeLineHtml}
				</div>
			</div>
		</div>
	</div>
	`;
	return totalHtml;
}

/**大图弹窗
 * @param { Object } $container // jquery对象 触发弹窗节点容器 找寻相同触发节点数量
 * @param { String } cls        // 特定弹窗类名 区别不同查看大图弹窗
 * @param { Number } index      // 触发查看大图弹窗节点的索引
 * @param { Object } $targetImg // jquery对象 检索页面下检索图片节点 
 * @param { Object } event      // dom event 对象
 * @param { Object } fixData    // 修正数据 修正函数中一些强相关数据
 * @param { Object } type       // 标记为地图传过来的数据

 */
function peerCreateBigImgMask($container, cls, index, $targetImg, event, fixData, type) {
	var selectorStr = '.mask-container-fixed' + '.' + cls,
		$findMask = $('body').find(selectorStr),
		findMaskLen = $findMask.length;

	var $maskContainer = $([
		'<div class="mask-container-fixed hide ' + cls + '">',
		'   <div class="mask-dialog">',
		'   <div class="mask-content">',
		'   <i class="aui-icon-not-through"></i>',
		'   <div class="swiper-container mask-container swiper-no-swiping">',
		'       <div class="swiper-wrapper">',
		'       </div>',
		'   <div class="swiper-button-next">',
		'       <i class="aui-icon aui-icon-drop-right"></i>',
		'   </div>',
		'   <div class="swiper-button-prev">',
		'       <i class="aui-icon aui-icon-drop-left"></i>',
		'   </div>',
		'   </div>',
		'   <div class="mask-loading-box"></div>',
		'   </div>',
		'   </div>',
		'</div>'
	].join(''));
	var maskSlider = [
		'<div class="swiper-slide">',
		'   <div class="aui-row hide">',
		'   <div class="aui-col-18">',
		'   <div class="mask-image-box">',
		'   <div class="mask-crop-panel hide"></div>',
		'   <div class="square-crop-box hide">',
		'       <span class="cropper-view-box"><img class="cropper-view-img"/></span>',
		'       <span class="cropper-line line-e"></span>',
		'       <span class="cropper-line line-n"></span>',
		'       <span class="cropper-line line-w"></span>',
		'       <span class="cropper-line line-s"></span>',
		'       <span class="cropper-point point-e"></span>',
		'       <span class="cropper-point point-n"></span>',
		'       <span class="cropper-point point-w"></span>',
		'       <span class="cropper-point point-s"></span>',
		'       <span class="cropper-point point-ne"></span>',
		'       <span class="cropper-point point-nw"></span>',
		'       <span class="cropper-point point-sw"></span>',
		'       <span class="cropper-point point-se"></span>',
		'       <div class="square-crop-tool hide">',
		'           <i class="aui-icon-not-through"></i>',
		'           <i class="aui-icon-approval"></i>',
		'       </div>',
		'   </div>',
		'   <img class="img" alt="" />',
		'	<div class="image-peer-list">',
		'		<ul class="image-card-list-wrap">',
		'			<li class="image-card-wrap type-peer">',
		'				<div class="image-card-box">',
		'					<img class="image-card-img" alt="">',
		'				</div>',
		'			</li>',
		'			<li class="image-card-wrap type-peer">',
		'				<div class="image-card-box">',
		'					<img class="image-card-img" alt="">',
		'				</div>',
		'			</li>',
		'		</ul>',
		'	</div>',
		'   <div class="mask-icon-box">',
		'       <i class="mask-icon aui-icon-video3">',
		'           <ul class="mask-camera-list hide">',
		'               <li class="mask-camera-item">查看前后5s视频</li>',
		'               <li class="mask-camera-item">查看前后10s视频</li>',
		'               <li class="mask-camera-item">查看前后30s视频</li>',
		'               <li class="mask-camera-item">查看实时视频</li>',
		'            </ul>',
		'           <span class="mask-icon-hover-tip">',
		'               视频播放',
		'           </span>',
		'           <i class="aui-icon-drop-down"></i>',
		'       </i>',
		'       <i class="mask-icon aui-icon-screen">',
		'           <span class="mask-icon-hover-tip">',
		'               截图检索',
		'           </span>',
		'           <i class="aui-icon-drop-down"></i>',
		'       </i>',
		'   </div>',
		'   <div class="square-box hide"></div>',
		'   <div class="mask-header"></div>',
		'   <canvas class="mask-canvas-bg hide"></canvas>',
		'   <canvas class="mask-canvas-img hide"></canvas>',
		'   </div>',
		'   </div>',
		'   <div class="aui-col-6">',
		window.commonMaskRight(3).html(), //3为检索弹窗右侧信息
		'   </div>',
		'   </div>',
		'</div>'
	].join('');
	if (!fixData.cardImg) {
		var $selectImg = false,
			cameraId = '',
			cameraTime = '',
			selectGuid = '',
			selectPosition = '',
			imgLen = 1;
	} else {
		var $cardImg = fixData.cardImg.parent().children(),
			$selectImg = $cardImg.eq(index),
			cameraId = '',
			cameraTime = '',
			selectGuid = '',
			selectPosition = '',
			imgLen = $cardImg.length;
	}

	//创建大图html界面，左右切换键的绑定，点击事件
	if (findMaskLen === 0) {
		// 先行添加空节点
		for (var i = 0; i < imgLen; i++) {
			$maskContainer.find('.mask-container .swiper-wrapper').append(maskSlider);
		}
		$('body').append($maskContainer);
		// // 当点击布控模块-轨迹分析-告警列表 或者 告警模块-按对象布控-查看地图轨迹 最后一张大图不需要展示下一个按钮
		// if ((maskType && maskType.controlAlarmLen && ((maskType.controlAlarmLen - 1) === index)) || (maskType && maskType.alarmObjectLen && ((maskType.alarmObjectLen - 1) === index))) {
		// 	$('.swiper-button-next').addClass('hide');
		// }
		var containerCls = '.mask-container-fixed.' + cls + ' .swiper-container',
			nextBtnCls = '.mask-container-fixed.' + cls + ' .swiper-button-next',
			prevBtnCls = '.mask-container-fixed.' + cls + ' .swiper-button-prev';
		var mySwiper = new Swiper(containerCls, {
			navigation: {
				nextEl: nextBtnCls,
				prevEl: prevBtnCls
			},
		});
		// 绑定键盘事件 左右切换 esc
		$('body').off('keyup.' + cls).on('keyup.' + cls, function (evt) {
			if (!(cls === 'warning-list-alarm' || cls === 'manage-warning-list-alarm')) {
				if (!$('body').find(selectorStr).hasClass('hide')) {
					if (evt.keyCode === 37) {
						$(prevBtnCls).click();
					}
					if (evt.keyCode === 39) {
						$(nextBtnCls).click();
					}
					if (evt.keyCode === 27) {
						var $cropPanel = $('body').find(selectorStr).find('.mask-crop-panel').not('.hide');
						// 判定是否有遮罩层
						if ($cropPanel.length === 0) {
							$('body').find(selectorStr).find('.mask-container').prev().click();
						} else {
							var $cropPanelNext = $cropPanel.next();
							// 判定是否有选中框
							if ($cropPanelNext.hasClass('hide')) {
								$cropPanel.closest('.swiper-slide').find('.mask-image-box').trigger('mousedown');
								$(document).trigger('mouseup');
							} else {
								$cropPanelNext.find('.aui-icon-not-through').click();
							}
						}
					}
				}
			}
		});
		// 给切换绑定额外时间用于当切换按钮的时候请求大图数据
		$(nextBtnCls).on('click', function () {
			var $maskDomFix = $(this).closest('.mask-container-fixed'),
				maskIndex = $maskDomFix.data('index'),
				$cropPanel = $maskDomFix.find('.mask-crop-panel').not('.hide');
			if ($cropPanel.length > 0) {
				return;
			}
			// 判断是否在最后一张图片
			if (maskIndex + 1 <= imgLen - 1) {
				$(this).removeClass('hide');
				$(prevBtnCls).removeClass('hide');
				mySwiper.slideTo(maskIndex + 1, 500, true);
				$cardImg.eq(maskIndex + 1).find(".peer-item-img-box").click();
			}
			// 当在最后一张图片的时候,给添加隐藏属性
			if (maskIndex + 1 === imgLen - 1) {
				$(this).addClass('hide');
			}
		});
		$(prevBtnCls).on('click', function () {
			var $maskDomFix = $(this).closest('.mask-container-fixed'),
				maskIndex = $maskDomFix.data('index'),
				$cropPanel = $maskDomFix.find('.mask-crop-panel').not('.hide');
			if ($cropPanel.length > 0) {
				return;
			}
			// 判断是否在第一张图片
			if (maskIndex - 1 >= 0) {
				$(this).removeClass('hide');
				$(nextBtnCls).removeClass('hide');
				mySwiper.slideTo(maskIndex - 1, 500, true);
				$cardImg.eq(maskIndex - 1).find(".peer-item-img-box").click();
			}
			// 当在第一张图片的时候,给添加隐藏属性
			if (maskIndex - 1 === 0) {
				$(this).addClass('hide');
			}
		});
		$maskContainer.data('comp', mySwiper);
	}
	//定位人脸的红框隐藏
	$findMask = $('body').find(selectorStr);
	var $selectSquareBox = $findMask.find('.swiper-slide').eq(index).find('.square-box');
	if (!$selectSquareBox.hasClass('hide')) {
		$selectSquareBox.addClass('hide');
	}
	$findMask.data('index', index); // 给外层添加index

	//大图的相关操作，视频播放/截图/关闭等
	// 添加大图部分的鼠标右键点击事件1
	$('body').find(selectorStr)[0].addEventListener('contextmenu', rightMouse);
	// 绑定截图按钮事件2
	$findMask.find('.aui-icon-screen').off('click').on('click', function () {
		var $slidePanel = $findMask.find('.swiper-slide').eq(index).find('.mask-crop-panel'),
			$slideSelectBox = $findMask.find('.swiper-slide').eq(index).find('.square-box');
		$slidePanel.removeClass('hide');
		$slideSelectBox.addClass('hide');
		var $maskClose = $findMask.find('.aui-icon-close'),
			$maskFooter = $findMask.find('.mask-icon-box'),
			$maskNext = $findMask.find('.swiper-button-next'),
			$maskPrev = $findMask.find('.swiper-button-prev'),
			$maskCamera = $findMask.find('.aui-icon-video3');
		$maskClose.addClass('hide');
		$maskFooter.addClass('hide');
		$maskNext.addClass('hide');
		$maskPrev.addClass('hide');
		$maskCamera.addClass('hide');
	});
	// 绑定大图摄像机按钮打开时间列表事件3
	$findMask.find('.aui-icon-video3').off('click').on('click', function (evt) {
		evt.stopPropagation();
		$(this).toggleClass('active');
		var $list = $findMask.find('.swiper-slide-active .mask-camera-list');
		$list.children().removeClass('active').eq(0).addClass('active');
		$list.toggleClass('hide');
	});
	// 绑定大图摄像机时间列表的点击事件4
	$findMask.find('.mask-camera-item').off('click').on('click', function (evt) {
		evt.stopPropagation();
		$(this).addClass('active').siblings().removeClass('active');
		$findMask.find('.mask-camera-list').addClass('hide');
		var index = $(this).index();
		if (index === 0) {
			maskPlayVideo(cameraId, seconds(cameraTime, -5), seconds(cameraTime, 5));
		} else if (index === 1) {
			maskPlayVideo(cameraId, seconds(cameraTime, -10), seconds(cameraTime, 10));
		} else if (index === 2) {
			maskPlayVideo(cameraId, seconds(cameraTime, -30), seconds(cameraTime, 30));
		} else if (index === 3) {
			maskPlayVideo(cameraId);
		}
	});
	// 添加点击全局部分隐藏摄像机时间列表5
	$(document).off('click.mask.camera').on('click.mask.camera', function () {
		$('body').find('.mask-camera-list').addClass('hide');
		$('body').find('.mask-icon.aui-icon-video3').removeClass('active');
		$('body').find('.mask-camera-item').removeClass('active');
	});

	var nowSelectImg = $findMask.find('.swiper-slide').eq(index).find('.img').attr('src');
	var $findMask = $('.mask-container-fixed' + '.' + cls),
		thisLen = $container.children('li').length,
		maskSwiper;

	// 如果没有大图
	if (!nowSelectImg) {
		//加载请求动画
		$findMask.find('.mask-loading-box').removeClass('hide');
		showLoading($findMask.find('.mask-loading-box'));
		// 请求当前点击的图片的大图
		if (fixData) {
			var $maskSlide = $findMask.find('.swiper-slide').eq(index),
				$cropImg = $maskSlide.find('.cropper-view-img'),
				$img = $maskSlide.find('.square-crop-box').next('.img'),
				$maskSquareBox = $maskSlide.find('.square-box'),
				$maskCropBox = $maskSlide.find('.square-crop-box'),
				base64Img = '';
			// 切换右侧详情
			if (fixData.html) {
				var $insertHtml = fixData.html;
				$maskSlide.children().find('.aui-col-6').remove();
				$maskSlide.children().append($insertHtml);
				$maskSlide.children().removeClass('hide');
				// 给右侧列表添加数据，以便切换图片使用
				if (type === 'map') {
					var totalData = fixData.data;
					for (var i = 0; i < totalData.length; i++) {
						for (var i = 0; i < totalData.length; i++) {
							$maskSlide.find('#all-peer-time' + i).find('.peer-items').each(function (index, el) {
								$(el).data('listData', totalData[i].dataInfo[index]);
							});
						}
					}
				} else {
					if (peerSnappingTab === 1) {
						var totalData = [fixData.data.dataInfo];
						for (var i = 0; i < totalData.length; i++) {
							$maskSlide.find('#all-peer-time' + i).find('.peer-items').each(function (index, el) {
								$(el).data('listData', totalData[i][index]);
							});
						}
					} else {
						var totalData = fixData.data.dates;
						for (var i = 0; i < totalData.length; i++) {
							$maskSlide.find('#all-peer-time' + i).find('.peer-items').each(function (index, el) {
								$(el).data('listData', totalData[i].dataInfo[index]);
							});
						}
					}
				}
				// 给弹窗上面的图框添加点击事件
				var $slideCol6 = $maskSlide.children().find('.aui-col-6'),
					$slideCol18 = $maskSlide.children().find('.aui-col-18'),
					$slideListItem = $slideCol6.find('.peer-items'),
					$slideImgItem = $slideCol18.find('.image-card-wrap');
				// 右侧选项框点击事件
				// 大图小图框点击事件
				$slideImgItem.off('click').on('click', function () {
					var imgData = $(this).data('imgData'),
						cameraId = imgData.cameraId,
						cameraTime = imgData.captureTime,
						selectUrl = imgData.bigPicUrl,
						selectPosition = imgData.vertices;
					$slideCol18.find('.image-card-list-wrap .active').removeClass('active');
					$(this).addClass('active');
					loadData('v2/faceDt/getImgByUrl', true, {
						url: selectUrl
					}, function (data) {
						if (data.code === '200') {
							base64Img = 'data:image/png;base64,' + data.base64;
							$cropImg.attr('src', '');
							$cropImg.attr('src', base64Img);
							$img.attr('src', '');
							$img.attr({
								'src': base64Img,
								'width': data.width,
								'height': data.height
							});
							// 设置图片选中框
							var imgWidth = $img.attr('width'),
								imgHeight = $img.attr('height');
							// position = JSON.parse(position);
							$maskSquareBox.removeClass('hide');

							function selectFace() {
								var imgWidthDom = parseInt(imgWidth),
									imgHeightDom = parseInt(imgHeight),
									boxWidth = $img[0].getBoundingClientRect().width,
									boxHeight = $img[0].getBoundingClientRect().height,
									percentW = boxWidth / imgWidthDom,
									percentH = boxHeight / imgHeightDom;
								var canvas1 = $maskSlide.find('.mask-canvas-bg')[0],
									canvas3 = $maskSlide.find('.mask-canvas-img')[0];
								canvas1.height = boxHeight;
								canvas1.width = boxWidth;
								canvas3.width = 100;
								canvas3.height = 100;
								// 设置截图区域图片大小
								$maskCropBox.find('.cropper-view-img').width(boxWidth);
								$maskCropBox.find('.cropper-view-img').height(boxHeight);
								$maskSquareBox.css({
									"top": selectPosition[0].y * percentH,
									"left": selectPosition[0].x * percentW,
									"width": (selectPosition[1].x - selectPosition[0].x) * percentW,
									"height": (selectPosition[1].y - selectPosition[0].y) * percentH
								});
								$maskSquareBox.data({
									"top": selectPosition[0].y * percentH,
									"left": selectPosition[0].x * percentW,
									"width": (selectPosition[1].x - selectPosition[0].x) * percentW,
									"height": (selectPosition[1].y - selectPosition[0].y) * percentH
								});
							}
							selectFace();
							$(window).off('resize').on('resize', selectFace);

							// 绑定函数，截图功能
							maskImgCrop({
								maskSlide: $maskSlide,
								findMask: $findMask,
								targetImg: $targetImg
							}, cls, base64Img, {
								index: index,
								imgLen: imgLen
							});
							//取消数据加载动画
							$findMask.find('.mask-loading-box').addClass('hide');
							hideLoading($findMask.find('.mask-loading-box'));
						}
					});
				});
				$slideListItem.off('click').on('click', function () {
					$slideCol6.find('#peerListNews .active').removeClass('active');
					$(this).addClass('active');
					var imgArrData = $(this).data('listData');
					$slideCol18.find('.image-card-img').eq(0).attr('src', imgArrData.capture1.smallPicUrl);
					$slideCol18.find('.image-card-img').eq(1).attr('src', imgArrData.capture2.smallPicUrl);
					$slideImgItem.eq(0).data('imgData', imgArrData.capture1);
					$slideImgItem.eq(1).data('imgData', imgArrData.capture2);

					$slideImgItem[0].click();
				});
				$slideListItem[0].click();
			}
		}
	} else {
		// 保证第二次打开去除选中人脸框显示出来
		if ($selectSquareBox.hasClass('hide')) {
			$selectSquareBox.removeClass('hide');
		}
	}

	// 绑定弹窗后续关闭以及左右按钮事件绑定
	if ($findMask.hasClass('hide') && !event) {
		$findMask.removeClass('hide');
		window.setTimeout(function () {
			$findMask.addClass('show');
		}, 50);
	} else {
		$findMask.removeClass('hide');
		window.setTimeout(function () {
			$findMask.addClass('show');
		}, 50);
		// 判断打开的时候 选中图片是否为选中状态给选中
		var $selectCheckWrap = $selectImg.prev(),
			$selectSlide = $findMask.find('.swiper-slide').eq(index),
			$selectSlideBtn = $selectSlide.find('.case-item-operate').children(),
			selectCheckCls = $selectCheckWrap.children().hasClass('ui-checkboxradio-checked');
		if (selectCheckCls) {
			$selectSlideBtn.eq(0).addClass('disabled');
		} else {
			$selectSlideBtn.eq(0).removeClass('disabled');
		}
		// 判断是否会第一张或者最后一张
		if (index === 0) {
			$findMask.find('.swiper-button-prev').addClass('hide');
		}
		if (index === thisLen - 1) {
			$findMask.find('.swiper-button-next').addClass('hide');
		}
		maskSwiper = $findMask.data().comp;
		maskSwiper.update(true);
		maskSwiper.slideTo(index, 0, true);
	}

	// 修正左右箭头是否需要显示  首页大图 去掉左右切换按钮
	if (imgLen === 1) {
		$findMask.find('.swiper-button-next').addClass('hide');
		$findMask.find('.swiper-button-prev').addClass('hide');
	}

	//绑定弹窗关闭事件6
	$findMask.find('.aui-icon-not-through').on('click', function () {
		// closeBigImgPopups($findMask, category, cls);
		//所有大图关闭按钮事件处理部分
		$findMask.removeClass('show');
		// 因为关系还有动画效果,需要加上延迟给添加效果
		window.setTimeout(function () {
			//清除所有大图数据缓存
			$findMask.remove();
		}, 300);
		var $maskCropBox = $findMask.find('.square-crop-box'),
			$maskCropPanel = $findMask.find('.mask-crop-panel'),
			$maskBox = $findMask.find('.square-box');
		$maskCropBox.addClass('hide'); //隐藏截图图层
		$maskCropPanel.addClass('hide'); //隐藏截图选择框
		$maskBox.removeClass('hide'); //取消隐藏的人像框选
		$findMask.find('.swiper-button-next').removeClass('hide');
		$findMask.find('.swiper-button-prev').removeClass('hide');
		//移除contextmenu(鼠标右键点击)事件语句柄，即大图鼠标右键点击事件
		$findMask[0].removeEventListener('contextmenu', rightMouse);
	});
}

/**获取图片的唯一ID
 * @param { String } data       // img的src属性
 * @param { Object } $container // jquery对象 图片位置ID
 */
function getImgId(data, $container) {
	var port = 'v2/faceRecog/uploadImage',
		portData = {
			base64: data
		},
		successFunc = function (data) {
			// 给当前选中的图片绑定id
			$container.attr('picId', data.staticId);
		};
	loadData(port, false, portData, successFunc);
}

/**同行人分析获取侧边栏请求的数据
 * @param { String } typeSearch // 区分区域选择射线机/地图选择摄像机
 */
function getPeerSearchData(typeSearch) {
	var $idCard = $('#peeridcardsearch'), // 身份证节点
		$selectImg = $('#peerAddSearchImg').find('.add-image-item.active'), // 选中图片节点
		$peerTime = $('#peerTime').find('input'), //同行次数
		$peerInterval = $('#peerInterval').find('input'), //时间间隔
		$cameraList = $('#cameraList'), // 选中摄像机节点
		$date = $('#peerAnalysis_time'), // 日期选中节点
		$slide = $('#peersliderInput'); // 相似度选中节点

	//次数，间隔，阈值赋值
	var selectTime = Number($peerTime[0].value),
		selectInterval = Number($peerInterval[0].value),
		slideVal = Number($slide.val());

	// 判断选中图片节点获取唯一ID
	var $selectImg1 = $selectImg.eq(0).find('.add-image-img'),
		$selectImg2 = $selectImg.eq(1).find('.add-image-img');
	if (!$selectImg1.attr('picId')) {
		getImgId($selectImg1.attr('src'), $selectImg1);
	}
	if (!$selectImg2.attr('picId')) {
		getImgId($selectImg2.attr('src'), $selectImg2);
	}
	var selectImgSrc1 = $selectImg1.attr('picId'),
		selectImgSrc2 = $selectImg2.attr('picId');

	// 判断是否有摄像机选中数据
	var $cameraOrg = $('#PSidebarOrgSelect'),
		$cameraPolice = $('#PSidebarPoliceSelect'),
		$cameraArea = $('#PSidebarCameraSelect');
	var cameraValArr = [],
		orgValArr = [];

	// 机构，摄像机数据赋值
	if (typeSearch == 'map') { //通过传入的参数进行判断是map则为地图选择
		var mapData = $('#peerNodeSearch').data('saveData');
		if (mapData) {
			cameraValArr = mapData.map(function (val, index) {
				var list = val.listArr.channo;
				return {
					'videoSerial': list
				};
			});
		}
	} else {
		if ($cameraOrg.length > 0) {
			var orgDataObj = $cameraOrg.selectpicker('getSelectedData', 'orgid'),
				policeDataObj = $cameraPolice.selectpicker('getSelectedData', 'orgid'),
				areaDataObj = $cameraArea.selectpicker('getSelectedData', 'gb_code');
			if (policeDataObj.text && policeDataObj.text.length > 0) {
				orgValArr.push(policeDataObj.data);
			} else {
				orgValArr.push(orgDataObj.data);
			}
			if (areaDataObj.text && areaDataObj.text.length > 0) {
				cameraValArr = areaDataObj.data.map(function (val, index) {
					return {
						'videoSerial': val
					};
				});
			}
		}
	}

	// 时间赋值
	var $dateInput = $date.find('.datepicker-input'),
		dateStartTime = $dateInput.eq(0).val(),
		dateEndTime = $dateInput.eq(1).val();
	return {
		img1: selectImgSrc1,
		img2: selectImgSrc2,
		times: selectTime,
		interval: selectInterval,
		threshold: slideVal,
		startTime: dateStartTime,
		endTime: dateEndTime,
		cameraIds: cameraValArr, //镜头
		orgIds: orgValArr, //机构
		videos: cameraValArr, //视频源-暂时保留
	}
}

/** 同行人分析抓拍库生成卡片
 * @param { Array } list              // 抓拍库请求成功后返回数据
 * @param { Object } $ele             // jquery对象 生产卡片插入区域
 * @param { string } paginationWrapId // 分页区域ID
 * @param { string } paginationId     // 分页插入区域ID
 */
function peerSnappingItem(list, $ele, paginationWrapId, paginationId, delLabel) {
	for (var i = 0; i < list.length; i++) {
		var html = '',
			score1 = Math.round(Number(list[i].similarity1.split('%')[0])),
			danger1 = score1 >= 90 ? 'text-danger' : '',
			score2 = Math.round(Number(list[i].similarity2.split('%')[0])),
			danger2 = score2 >= 90 ? 'text-danger' : '';
		html = `<li class="peer-item">
					<div class="peer-item-content">
						<div class="image-checkbox-wrap">
							<label class="ui-checkboxradio-checkbox-label ui-checkboxradio-label ui-button ui-widget" style="margin: 0!important">
								<span class="ui-checkboxradio-icon  ui-icon ui-icon-background ui-icon-blank"></span>
							</label>
						</div>
                        <div class="peer-item-img-box">
                            <div class="peer-item-img">
                                <img src="${list[i].smallPicUrl1}" position='${list[i].orgName}' alt="">
                                <img src="${list[i].smallPicUrl2}" position='${list[i].orgName}' alt="">
                            </div>
                            <div class="peer-item-percent">
                                <span class="grade1">同行</span>
                                <span class="grade2 ${danger1}">${score1}%</span>
                                <span class="grade3 ${danger2}">${score2}%</span>
                            </div>
                        </div>
                        <div class="peer-item-name">
                            <span>${list[i].cameraName}</span>
                            <span class="peer-item-level">共${list[i].times}次</span>
                        </div>
                    </div>
                </li>
            `;
		if ($ele.find('.pagination-wrap').length == 0) {
			var paginationHtml = `<div class="pagination-wrap display-none" id="${paginationWrapId}">
                                    <ul class="pagination" id="${paginationId}" style="width:100%"></ul>
                                </div>`
			$ele.append(paginationHtml);
		}
		$ele.find('.pagination-wrap').before(html);
		// if (delLabel) {
		// 	$ele.find('.pagination-wrap').prev().find('.image-card-inner').remove();
		// 	$ele.find('.pagination-wrap').prev().find('.image-checkbox-wrap').remove();
		// 	$ele.find('.image-card-message-box').remove();
		// }
	}
}

/** 同行人分析请求数据 按时间排序
 * @param { object } peerPostData  //请求参数数据
 */
function peerSnappingSearchTime(peerPostData) {
	var $cardContent = $('#peerTimeResult');
	loadEmpty($cardContent);
	if ($cardContent.length > 1) {
		$cardContent = $cardContent.eq(1);
	}
	var port = 'v2/faceDt/peerAnalysis';
	var option = {
		dynamicId1: peerPostData.img1, //图片1
		dynamicId2: peerPostData.img2, //图片2
		times: peerPostData.times, //次数
		interval: peerPostData.interval, //间隔
		threshold: peerPostData.threshold, //阈值
		startTime: peerPostData.startTime, //开始时间
		endTime: peerPostData.endTime, //结束时间
		cameraIds: peerPostData.cameraIds, //镜头分组id/机构id
		orgIds: peerPostData.orgIds,
		videos: peerPostData.videos, //视频源-暂时保留
		page: '1', //当前页
		size: '20', //每一页个数
		sort: 2 //时间排序
	};
	successFunc = function (data) {
		if (data.code == '200' && data.data.total && data.data.total !== '0' && data.data.total !== 0) {
			var result = data.data;
			peerDataList = result.data;
			if ($('#peerSearchResult .card-content>.card-tip').hasClass('hide')) {
				$('#peerSearchResult .card-content>.card-tip').removeClass('hide');
			}
			//清除缓存的li数据
			$('#peerTimeResult').find('.peer-item').remove();
			peerSnappingItem(result.data, $('#peerTimeResult'), 'peerPaginationWrap', 'peerPagination');
			// 给卡片添加数据，传给大图使用
			$('#peerTimeResult').find('.peer-item').each(function (index, el) {
				$(el).data('listData', result.data[index]);
			});
			//分页
			var $peerPagination = $('#peerPagination'); //分页区域
			if (result.page !== 0 && result.page !== 1) {
				var peerId = result.peerId;
				var eventCallBack = function (currPage, pageSize) {
					var changePort = 'v2/faceDt/peerAnalysis';
					var changePote = {
						peerId: peerId,
						dynamicId1: option.dynamicId1, //图片1
						dynamicId2: option.dynamicId2, //图片2
						times: option.times, //次数
						interval: option.interval, //间隔
						threshold: option.threshold, //阈值
						startTime: option.startTime, //开始时间
						endTime: option.endTime, //结束时间
						cameraIds: option.cameraIds, //镜头分组id/机构id
						orgIds: option.orgIds,
						videos: option.videos, //视频源-暂时保留
						page: currPage.toString(), //当前页
						size: pageSize.toString(), //每一页个数
						sort: 2 //时间排序
					};
					successFn = function (data) {
						if (data.code == '200') {
							$('#peerTimeResult').find('.peer-item').remove();
							result = data.data;
							peerSnappingItem(result.data, $('#peerTimeResult'), 'peerPaginationWrap', 'peerPagination');
							// 给卡片添加数据，传给大图使用
							$('#peerTimeResult').find('.peer-item').each(function (index, el) {
								$(el).data('listData', result.data[index]);
							});
							hideLoading($cardContent);
							removeLoadEmpty($cardContent);
						}
					};
					showLoading($cardContent);
					loadData(changePort, true, changePote, successFn);
				}
				var pageSizeOpt = [{
					value: 20,
					text: '20/页',
					selected: true
				}, {
					value: 30,
					text: '30/页',
				}, {
					value: 40,
					text: '40/页',
				}];
				setPageParams($peerPagination, result.total, result.page, eventCallBack, true, pageSizeOpt);
				// $.jqPaginator($peerPagination, paginationOption);
				// paginationFn($('#peerTimeWrap'), peerPostData);
				$('#peerPagination').closest('.pagination-wrap').removeClass('display-none').find('.pagination-result-number').text(result.total);
			} else {
				$peerPagination.closest('.pagination-wrap').remove();
			}
			hideLoading($cardContent);
			removeLoadEmpty($cardContent);
		} else {
			hideLoading($cardContent);
			loadEmpty($cardContent);
			// 拖拽提示信息
			if (!$('#peerSearchResult1 .card-content>.card-tip').hasClass('hide')) {
				$('#peerSearchResult1 .card-content>.card-tip').addClass('hide');
			}
			// 如果图片id失效  重新获取图片id 重新请求数据
			if (data.code === '624') {
				// 判断选中图片节点获取唯一ID
				var $selectImg = $('#peerAddSearchImg').find('.add-image-item.active'), // 选中图片节点
					$selectImg1 = $selectImg.eq(0).find('.add-image-img'),
					$selectImg2 = $selectImg.eq(1).find('.add-image-img');
				getImgId($selectImg1.attr('src'), $selectImg1);
				getImgId($selectImg2.attr('src'), $selectImg2);
				$('#peerSearch').click();
			}
		}
	};
	loadData(port, true, option, successFunc);
	showLoading($cardContent);
}

/** 同行人分析请求数据 按相似度排序
 * @param {object} peerPostData  //请求参数数据
 */
function peerSnappingSearchSimilar(peerPostData) {
	var $cardContent = $('#peerSimilarResult');
	loadEmpty($cardContent);
	if ($cardContent.length > 1) {
		$cardContent = $cardContent.eq(1);
	}
	var port = 'v2/faceDt/peerAnalysis';
	var option = {
		dynamicId1: peerPostData.img1, //图片1
		dynamicId2: peerPostData.img2, //图片2
		times: peerPostData.times, //次数
		interval: peerPostData.interval, //间隔
		threshold: peerPostData.threshold, //阈值
		startTime: peerPostData.startTime, //开始时间
		endTime: peerPostData.endTime, //结束时间
		cameraIds: peerPostData.cameraIds, //镜头分组id/机构id
		orgIds: peerPostData.orgIds,
		videos: peerPostData.videos, //视频源
		page: '1', //当前页
		size: '20', //每一页个数
		sort: 1
	}
	successFunc = function (data) {
		if (data.code == '200' && data.data.total && data.data.total !== '0' && data.data.total !== 0) {
			var result = data.data;
			peerDataList1 = result.data;
			if ($('#peerSearchResult .card-content>.card-tip').hasClass('hide')) {
				$('#peerSearchResult .card-content>.card-tip').removeClass('hide');
			}
			//清除缓存的li数据
			$('#peerSimilarResult').find('.peer-item').remove();
			peerSnappingItem(result.data, $('#peerSimilarResult'), 'peerPaginationWrap1', 'peerPagination1');
			// 给卡片添加数据，传给大图使用
			$('#peerSimilarResult').find('.peer-item').each(function (index, el) {
				$(el).data('listData', result.data[index]);
			});
			//分页
			var $peerPagination1 = $('#peerPagination1'); //分页区域
			if (result.page !== 0 && result.page !== 1) {
				var peerId = result.peerId;
				var eventCallBack = function (currPage, pageSize) {
					var changePort = 'v2/faceDt/peerAnalysis';
					var changePote = {
						peerId: peerId,
						dynamicId1: option.dynamicId1, //图片1
						dynamicId2: option.dynamicId2, //图片2
						times: option.times, //次数
						interval: option.interval, //间隔
						threshold: option.threshold, //阈值
						startTime: option.startTime, //开始时间
						endTime: option.endTime, //结束时间
						cameraIds: option.cameraIds, //镜头分组id/机构id
						orgIds: option.orgIds,
						videos: option.videos, //视频源-暂时保留
						page: currPage.toString(), //当前页
						size: pageSize.toString(), //每一页个数
						sort: 1 //时间排序
					};
					successFn = function (data) {
						if (data.code == '200') {
							$('#peerSimilarResult').find('.peer-item').remove();
							result = data.data;
							peerSnappingItem(result.data, $('#peerSimilarResult'), 'peerPaginationWrap1', 'peerPagination1');
							// 给卡片添加数据，传给大图使用
							$('#peerSimilarResult').find('.peer-item').each(function (index, el) {
								$(el).data('listData', result.data[index]);
							});
							hideLoading($cardContent);
							removeLoadEmpty($cardContent);
						}
					};
					showLoading($cardContent);
					loadData(changePort, true, changePote, successFn);
				}
				var pageSizeOpt = [{
					value: 20,
					text: '20/页',
					selected: true
				}, {
					value: 30,
					text: '30/页',
				}, {
					value: 40,
					text: '40/页',
				}];
				setPageParams($peerPagination1, result.total, result.page, eventCallBack, true, pageSizeOpt);
				// $.jqPaginator($peerPagination1, paginationOption);
				// paginationFn($('#peerTimeWrap'), peerPostData);
				$('#peerPagination1').closest('.pagination-wrap').removeClass('display-none').find('.pagination-result-number').text(result.total);
			} else {
				$peerPagination1.closest('.pagination-wrap').remove();
			}
			hideLoading($cardContent);
			removeLoadEmpty($cardContent);
		} else {
			hideLoading($cardContent);
			loadEmpty($cardContent);
			// 拖拽提示信息
			if (!$('#peerSearchResult1 .card-content>.card-tip').hasClass('hide')) {
				$('#peerSearchResult1 .card-content>.card-tip').addClass('hide');
			}
			// 如果图片id失效  重新获取图片id 重新请求数据
			if (data.code === '624') {
				// 判断选中图片节点获取唯一ID
				var $selectImg = $('#peerAddSearchImg').find('.add-image-item.active'), // 选中图片节点
					$selectImg1 = $selectImg.eq(0).find('.add-image-img'),
					$selectImg2 = $selectImg.eq(1).find('.add-image-img');
				getImgId($selectImg1.attr('src'), $selectImg1);
				getImgId($selectImg2.attr('src'), $selectImg2);
				$('#peerSearch').click();
			}
		}
	};
	loadData(port, true, option, successFunc);
	showLoading($cardContent);
}

// 加载空页面
function initPage() {
	var $searchInfo = $('#peerTimeResult');
	loadEmpty($searchInfo);
}

// 同行分析结果部分拖拽框选功能
function peerDropSelect() {
	// 检索图片框选功能
	$('#peerAnalysisPage').on('mousedown', function (evt) {
		var $dropSelectHtml = $('<div id="peerDropDown" class="drop-select-box hide"></div>'),
			$mapPanel = $('<div class="map-panel hide"></div>');
		// 找寻到当前权限下检索节点中添加选中框节点
		// var $searchDom = $('#pageSidebarMenu').find('.aui-icon-carsearch2');
		// if ($searchDom.length === 0) { // 当前权限下是否存在检索节点
		//     return;
		// }
		// var searchIndex = $searchDom.closest('.sidebar-item').index(),
		//     $target = $(evt.target),
		//     $contentItem = $('#content-box').find('.content-save-item'),
		//     $saveItem = $contentItem.eq(searchIndex),
		var $saveItem = $('#peerSearchResult');
		var $selectLen = $saveItem.find('.drop-select-box'),
			$mapLen = $('#peerMap').find('.map-panel'),
			saveCls = $saveItem.hasClass('hide'),
			$target = $(evt.target),
			$targetParent = $target.closest('.peer-item'),
			$imageWrap = $saveItem.find('.peer-overview-time').not('.display-none');
		if ($selectLen.length === 0) {
			$saveItem.append($dropSelectHtml);
		} else {
			$dropSelectHtml = $selectLen;
		}
		if ($mapLen.length === 0) {
			$('#peerMap').append($mapPanel);
		} else {
			$mapPanel = $mapLen;
		}
		if (saveCls) { // 判定当前是否存在检索节点,并且当前选中的节点也是检索节点
			return;
		}
		if ($targetParent.length > 0) { // 当前选中项不应该是抓拍库图片节点
			return;
		}
		if ($imageWrap.find('.peer-item').length === 0) {
			return;
		}
		if ($target.closest('.card-title-box').length > 0 ||
			$target.closest('.btn-link').length > 0 ||
			$target.closest('.pagination').length > 0 ||
			$target.closest('.result-map-frame').length === 0) {
			return;
		}
		// 设置初始数据
		var posx = evt.pageX,
			posy = evt.pageY;
		$dropSelectHtml.css({
			'position': 'fixed',
			'background': 'rgba(59,158,243,0.4)',
			'border': '1px solid #3B9EF3',
			opacity: 0.4,
			top: posy,
			left: posx,
			width: 1,
			height: 1,
			'z-index': 6
		});
		$mapPanel.css({
			'position': 'absolute',
			top: 0,
			left: 0,
			'width': '100%',
			'height': '100%',
			'z-index': '10'
		});
		// 绑定全局移动事件
		$(document).on('mousemove.dropSelect', function (e) {
			e.stopPropagation(); // 阻止冒泡，阻止父组件事件处理
			e.preventDefault(); // 阻止元素发生默认行为
			calcArea($imageWrap.find('.peer-item'), true);

			var left = Math.min(e.pageX, posx),
				top = Math.min(e.pageY, posy),
				width = Math.abs(posx - e.pageX),
				height = Math.abs(posy - e.pageY);

			// 进行拖拽宽度判断,大于某个值之后进行选中的节点去除选中效果--重新选择的时候原来的选中效果取消
			if (width > 5 && height > 5) {
				var $checkbox = $imageWrap.find('.peer-item').find('.image-checkbox-wrap');
				$checkbox.each(function () {
					var thisCls = $(this).find('label').hasClass('ui-checkboxradio-checked');
					if (thisCls) {
						$(this).click();
					}
				});
			}

			// 添加无边界样式
			$imageWrap.find('.peer-item').addClass('border');
			$dropSelectHtml.removeClass('hide');
			$mapPanel.removeClass('hide');
			$dropSelectHtml.css({
				left: left,
				top: top,
				width: width,
				height: height
			});
		});
		// 绑定全局鼠标恢复事件
		$(document).on('mouseup.dropSelect', function (e) {
			e.stopPropagation();
			e.preventDefault();
			calcArea($imageWrap.find('.peer-item'));
			// 添加无边界样式
			$imageWrap.find('.peer-item').removeClass('border');
			$imageWrap.find('.peer-item').removeClass('selected');
			$dropSelectHtml.addClass('hide');
			$mapPanel.addClass('hide');
			$(document).off('mousemove.dropSelect mouseup.dropSelect');
		});
		// 统一计算函数 判断卡片是否在拖拽框中 并触发卡片选中事件 或取消事件
		function calcArea($dom, move) {
			// 将当前卡片进行比对
			var $imageWrapChildren = $dom,
				checkImage = [],
				checkNotImage = [],
				isNotCheck,
				dropInfo = $dropSelectHtml[0].getBoundingClientRect(),
				dropXA = dropInfo.left,
				dropXB = dropInfo.left + dropInfo.width,
				dropYA = dropInfo.top,
				dropYB = dropInfo.top + dropInfo.height;
			$imageWrapChildren.each(function (index, el) {
				var posInfo = el.getBoundingClientRect(),
					posX, posY;
				elXa = posInfo.left,
					elXb = posInfo.left + posInfo.width,
					elYa = posInfo.top,
					elYb = posInfo.top + posInfo.height;
				// 判断横坐标
				if (dropXA < elXa && dropXB > elXb) {
					posX = true;
				} else if (dropXA < elXa && dropXB > elXa && dropXB < elXb) {
					var dis1 = dropXB - elXa,
						dis2 = (elXb - elXa) / 2;
					if (dis1 > dis2) {
						posX = true;
					}
				} else if (elXa < dropXA && dropXA < elXb && elXb < dropXB) {
					var dis1 = dropXA - elXa,
						dis2 = (elXb - elXa) / 2;
					if (dis1 < dis2) {
						posX = true;
					}
				}
				// 判断纵坐标
				if (dropYA < elYa && dropYB > elYb) {
					posY = true;
				} else if (dropYA < elYa && dropYB > elYa && dropYB < elYb) {
					var dis1 = dropYB - elYa,
						dis2 = (elYb - elYa) / 2;
					if (dis1 > dis2) {
						posY = true;
					}
				} else if (elYa < dropYA && dropYA < elYb && elYb < dropYB) {
					var dis1 = dropYA - elYa,
						dis2 = (elYb - elYa) / 2;
					if (dis1 < dis2) {
						posY = true;
					}
				}
				// 当横纵坐标都满足条件时添加到选中列表中
				if (posX && posY) {
					var $checkLabel = $(el).find('.image-checkbox-wrap label'),
						checkCls = $checkLabel.hasClass('ui-checkboxradio-checked');
					if (!checkCls) {
						isNotCheck = true;
					}
					$(el).data('check', checkCls);
					checkImage.push($(el));
				} else {
					checkNotImage.push($(el));
				}
			});
			// 判定是否添加样式或者添加选中效果
			if (move) {
				for (var i = 0; i < checkImage.length; i++) {
					checkImage[i].addClass('selected');
				}
				for (var j = 0; j < checkNotImage.length; j++) {
					checkNotImage[j].removeClass('selected');
				}
			} else {
				for (var i = 0; i < checkImage.length; i++) {
					var $checkLabel = checkImage[i].find('.image-checkbox-wrap label'),
						checkCls = checkImage[i].data('check');
					if (isNotCheck) {
						if (!checkCls) {
							$checkLabel.click();
						}
					} else {
						$checkLabel.click();
					}
				}
			}
		}
	});
}