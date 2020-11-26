// 构造轨迹分析数据
function newDataFn(arr) {
    var newArr = [];
    arr.forEach(element => {
        var index = -1;
        var flag = newArr.some((newAddress, j) => {
            if (newAddress.day && element.captureTime.substring(0, 10) == newAddress.day) {
                index = j;
                return true;
            }
        })
        var imgGuid = { // 名字不能更改 时间轴与地图共用大图方法 地图与其他模块共用
            imgData: element.picId,
            position: element.vertices,
            cameraId: element.cameraId,
            longCameraId: element.longCameraId,
            cameraTime: element.captureTime,
            cameraName: element.cameraName,
            gbCode: element.gbCode,
            faceUrl: element.smallPicUrl,
            bigUrl: element.bigPicUrl,
            score: element.similarity,
            temperature: element.temperature,
            orgName: element.orgName,
            url: element.smallPicUrl,
            searchId: element.searchId,
            searchIndex: element.searchIndex
        };
        if (!flag) { // 当天聚合的元素 不存在数组中
            newArr.push({
                day: element.captureTime.substring(0, 10),
                list: [{
                    imgUrl: element.smallPicUrl,
                    time: element.captureTime.substring(11, 19),
                    imgGuid: imgGuid,
                    bigUrl: element.bigPicUrl,
                }]
            })
        } else { // 当天聚合的元素 已存在数组中
            newArr[index].list.push({
                imgUrl: element.smallPicUrl,
                time: element.captureTime.substring(11, 19),
                imgGuid: imgGuid,
                bigUrl: element.bigPicUrl
            })
        }
    });
    return newArr;
}

/**
 * 构造轨迹分析时间轴 图片节点
 * @param {Object} newdata 
 */
function createTimeLineImgItem(newdata) {
    var html = '';
    for (var i = 0; i < newdata.length; i++) {
        var imagBox = '';
        html += `
        <div class="aui-timeline-wrap">
            <div class="aui-timeline-item-header clearfix">
                <div class="aui-timeline-item-dot" style="margin-top: 6px;"></div>
                    <div class="image-checkbox-wrap" style="float:left; margin-left:0.5rem;">
                        <label class="ui-checkboxradio-checkbox-label ui-checkboxradio-label ui-button ui-widget ui-checkboxradio-checked" style="margin: 0!important">
                            <span class="ui-checkboxradio-icon ui-icon ui-icon-background ui-icon-blank"></span>
                        </label>
                    </div>
                    <div class="aui-timeline-item-title" style="margin-top: 4px;">${newdata[i].day} <span class="aui-timeline-number">(${newdata[i].list.length})</span></div>
                </div>
                <div class="aui-timeline-item-wrap ">
                    <div class="aui-timeline-box o-hidden active">
            `;
        for (var j = 0; j < newdata[i].list.length; j++) {
            imagBox += `
                <div class="image-box img-right-event" imgGuid="${newdata[i].list[j].imgGuid.imgData}" cameraId="${newdata[i].list[j].imgGuid.cameraId}" searchId="${newdata[i].list[j].imgGuid.searchId}" searchIndex="${newdata[i].list[j].imgGuid.searchIndex}">
                    <img src="${newdata[i].list[j].imgUrl}" alt="" class="path-img"></img>
                    <div class="img-info">
                        ${newdata[i].list[j].time}
                    </div>
                    <i class="aui-path-delect"></i>
                    <div class="border-box"></div>
                </div>
            `;
        }
        html += `${imagBox}
                    </div>
                </div>
            </div>
        </div>
        `
    }
    return html;
}

// 时间轴图片hover事件
function AnalyseTimeLineImgHover($timeLine) {
    $timeLine.find('.image-box').hover(function () {
        $(this).addClass('select');
    }, function () {
        $(this).removeClass('select');
    });
}

// 构造大图弹框数据
function newMaskData(data, index) {
    var imgs = [],
        newData = {};
    newData.selectIndex = index;
    data.list.forEach(function (item) {
        imgs.push(item.imgGuid)
    })
    newData.imgs = imgs;
    return newData;
}

/**
 * 检索时间线生成 轨迹生成 点击事件 (纯动态)
 * @param {Array} allSelectedCardList 勾选的数据
 * @param {Object} $timeLine 时间轴容器 包括所有标题和图片
 */
function initTimeLine(allSelectedCardList, $timeLine) {
    sortData(allSelectedCardList, 'captureTime'); // 按抓拍时间由近及远排序
    var newdata = newDataFn(allSelectedCardList); // 按天聚合 构造轨迹分析数据
    html = createTimeLineImgItem(newdata); // 构造图片节点
    $timeLine.html(html); // 给时间轴添加图片节点
    var timeLineSelectedData = allSelectedCardList.concat(); // 默认全选 被选中的值为allSelectedCardList
    if ($timeLine.attr("id") == 'auiTimeLineDynamic') { //纯动态页面
        var $coursePageSelectAll = $('#coursePageSelectAllDynamic'),
            mapPath = 'map_iframe_pathDynamic',
            $courseAnalyse = $('#courseAnalyseDynamic');
    } else if ($timeLine.attr("id") == 'auiTimeLineTemperature') {
        var $coursePageSelectAll = $('#coursePageSelectAllTemperature'),
            mapPath = 'map_iframe_pathTemperature',
            $courseAnalyse = $('#courseAnalyseTemperature');
    } else { //动静态结合页面
        var $coursePageSelectAll = $('#coursePageSelectAll'),
            mapPath = 'map_iframe_path',
            $courseAnalyse = $('#courseAnalyse');
    }
    $coursePageSelectAll.find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 全选选择框 默认选中
    createMapFn(allSelectedCardList, mapPath); // 轨迹数据全选
    $timeLine.data({ // 给时间轴绑定数据
        'timeLineData': newdata
    })
    AnalyseTimeLineImgHover($timeLine); // 时间轴图片hover事件

    // 添加选中数据并生成地图
    function timelineRowFn(index) {
        var newList = newDataFn(allSelectedCardList); // 按天聚合 构造轨迹分析数据
        // 全选框状态改变
        var allCheckboxLength = $timeLine.find('.image-checkbox-wrap .ui-checkboxradio-checked').length;
        if (allCheckboxLength == newList.length) {
            $coursePageSelectAll.find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
        }
        // 选中数据改变
        if (newList[index].list) { // 按天聚合 某一天的数据
            newList[index].list.forEach(function (item) {
                allSelectedCardList.forEach(function (el) {
                    if (item.imgGuid.imgData === el.picId) {
                        var putSign = true;
                        for (var i = 0; i < timeLineSelectedData.length; i++) {
                            if (timeLineSelectedData[i] && timeLineSelectedData[i].picId == item.imgGuid.imgData) {
                                putSign = false;
                            }
                        }
                        if (putSign) {
                            timeLineSelectedData.push(el) // 添加allSelectedCardList中数据是为了不改变格式
                        }
                    }
                })

            });
            var id = $timeLine.closest('.layout-type3.search-result').find('.flex-container iframe').attr('id'); // 地图框节点id属性map_iframe_path
            createMapFn(timeLineSelectedData, id); // 轨迹分析 地图弹框
        }
    }

    // 删除选中数据并生成地图
    function timelineRowFnDele(index) {
        var newList = newDataFn(allSelectedCardList); // 按天聚合 构造轨迹分析数据
        // 全选框状态改变
        var allCheckboxLength = $timeLine.find('.image-checkbox-wrap .ui-checkboxradio-checked').length;
        if (allCheckboxLength < newList.length) {
            $coursePageSelectAll.find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        }
        // 选中数据改变
        if (newList[index].list) { // 按天聚合 某一天的数据
            newList[index].list.forEach(function (item) {
                timeLineSelectedData.forEach(function (ele, index) {
                    if (ele && ele.picId == item.imgGuid.imgData) {
                        timeLineSelectedData.splice(index, 1); // 当前聚合中 删除在timeLineSelectedData中的数据
                    }

                })
            });
            var id = $timeLine.closest('.layout-type3.search-result').find('.flex-container iframe').attr('id'); // 地图框节点id属性map_iframe_path
            createMapFn(timeLineSelectedData, id); // 轨迹分析 地图弹框
        }
    }

    $coursePageSelectAll.off().on('click', function () {
        var $this = $(this).find('.ui-checkboxradio-label'); // 当前点击的全选框
        if (!$this.hasClass('ui-checkboxradio-checked')) {
            $this.addClass('ui-checkboxradio-checked'); // 增加全选状态
            $timeLine.find('.aui-timeline-wrap label').addClass('ui-checkboxradio-checked');
            $timeLine.find('.aui-timeline-wrap .aui-timeline-box').addClass('active');
            timeLineSelectedData = allSelectedCardList.concat();
            createMapFn(timeLineSelectedData, mapPath); // 轨迹数据全选
        } else { // 取消全选
            $this.removeClass('ui-checkboxradio-checked'); // 功能区 取消全选
            $timeLine.find('.aui-timeline-wrap label').removeClass('ui-checkboxradio-checked');
            $timeLine.find('.aui-timeline-wrap .aui-timeline-box').removeClass('active');
            timeLineSelectedData = [];
            createMapFn(timeLineSelectedData, mapPath); // 轨迹数据全选
        }
    })

    // 时间轴点击事件 点击标题全选
    $timeLine.off('click', '.aui-timeline-item-header').on('click', '.aui-timeline-item-header', function () {
        var $this = $(this), // 标题全选
            $timeLabel = $this.find('.image-checkbox-wrap label'), // 当前标题选项框容器
            $timeWrap = $this.closest('.aui-timeline-wrap'), // 按当前标题聚合的图片容器 包含标题
            index = $timeWrap.index(); // 当前标题聚合的容器索引
        if (!$timeLabel.hasClass('ui-checkboxradio-checked')) {
            $timeLabel.addClass('ui-checkboxradio-checked');
            $timeWrap.find('.aui-timeline-box').addClass('active');
            timelineRowFn(index); // 构造选中数据并生成地图
        } else {
            $timeLabel.removeClass('ui-checkboxradio-checked'); // 去掉全选
            $timeWrap.find('.aui-timeline-box').removeClass('active'); // 去掉选中样式
            timelineRowFnDele(index); // 构造选中数据并生成地图
        }
    })

    // 时间轴点击事件 点击轨迹小图 生成轨迹大图弹框
    $timeLine.off('click', '.image-box').on('click', '.image-box', function () {
        var rowIndex = $(this).closest('.aui-timeline-wrap').index(), // 当前聚合索引
            thisIndex = $(this).index() + 1; // 当前图片索引+1
        timeLineData = $timeLine.data('timeLineData'); // 初始化时间轴时 构造的轨迹分析数据
        var newData = newMaskData(timeLineData[rowIndex], thisIndex); // 构造轨迹大图数据
        if ($timeLine.attr("id") == 'auiTimeLineDynamic') {
            if ($(this).closest('#auiTimeLineDynamic').length > 0) {
                newData.type = 'search'; // 检索模块
            }
        } else if ($timeLine.attr("id") == 'auiTimeLineTemperature') {
            if ($(this).closest('#auiTimeLineTemperature').length > 0) {
                newData.type = 'search'; // 检索模块
            }
        } else {
            if ($(this).closest('#auiTimeLine').length > 0) {
                newData.type = 'search'; // 检索模块
            }
        }
        createImgMask(newData);
    });

    // 点击轨迹分析 时间轴图片 删除按钮
    $timeLine.off('click', '.image-box .aui-path-delect').on('click', '.image-box .aui-path-delect', function (evt) {
        evt.stopPropagation();
        var $this = $(this),
            $imgBox = $this.closest('.image-box'),
            $timeWrap = $this.closest('.aui-timeline-wrap'),
            index = $imgBox.index(),
            rowIndex = $timeWrap.index(),
            timeLineData = $timeLine.data('timeLineData');
        if ($timeLine.attr('id') == 'auiTimeLine' || $timeLine.attr('id') == 'auiTimeLineDynamic' || $timeLine.attr('id') == 'auiTimeLineTemperature') {
            var deleData = timeLineData[rowIndex].list[index].imgGuid.imgData;
            // 删除原始数据
            allSelectedCardList.map(function (e, n) {
                if (e.picId == deleData) {
                    allSelectedCardList.splice(n, 1); // 选中图片数据删除
                    if ($timeLine.attr("id") == 'auiTimeLineDynamic') { //纯动态页面
                        $('#current-page-dynamic .image-card-img[guid="' + e.picId + '"]').each(function () {
                            $(this).closest('.image-card-wrap').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
                        })
                    } else if ($timeLine.attr("id") == 'auiTimeLineTemperature') {
                        $('#current-page-temperature .image-card-img[guid="' + e.picId + '"]').each(function () {
                            $(this).closest('.image-card-wrap').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
                        })
                    } else { //动静态结合页面
                        $('#current-page .image-card-img[guid="' + e.picId + '"]').each(function () {
                            $(this).closest('.image-card-wrap').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
                        })
                    }
                }
            });
            // 删除选中数据
            timeLineSelectedData.forEach(function (ele, index) {
                if (ele.picId == deleData) {
                    timeLineSelectedData.splice(index, 1); // 当前聚合中 删除在timeLineSelectedData中的数据
                }
            })
        }
        var id = $timeLine.closest('.layout-type3.search-result').find('.flex-container iframe').attr('id');
        if ($('.aui-timeline-box.active').length == 0) {
            createMapFn([], id);
        } else {
            // var idx = $timeWrap.index();
            // timelineRowFn(idx);
            createMapFn(timeLineSelectedData, id);
        }
        if (allSelectedCardList.length == 0) {
            $courseAnalyse.addClass('disabled');
            $('#courseAnalyseControl').addClass('disabled');
            var iframe = document.getElementById(id);
            var targetOrigin = 'http://190.168.17.2:6081/peopleCity.html',
                data = {
                    type: "peopleTrak",
                    mydata: [],
                };
            iframe.contentWindow.postMessage(data, targetOrigin);
        }
        $imgBox.remove();
        var length = $timeWrap.find('.image-box').length;
        $timeWrap.find('.aui-timeline-number').text('(' + length + ')');
        if ($timeWrap.find('.image-box').length == 0) {
            $timeWrap.remove();
        }
        var newdata = newDataFn(allSelectedCardList);
        $timeLine.data({
            'timeLineData': newdata
        });
    });
}

//生成大图弹框
function createImgMask(mapImgData) {
    if (!mapImgData.imgs) {
        return;
    }
    var $maskContainer = $([
        '<div class="mask-container-fixed mapMask" id="mapMask">',
        '   <div class="mask-dialog">',
        '   <div class="mask-content">',
        '   <i class="aui-icon-not-through"></i>',
        '   <div class="swiper-container mask-container swiper-no-swiping">',
        '       <div class="swiper-wrapper">',
        '       </div>',
        '   	<div class="swiper-button-next">',
        '       	<i class="aui-icon aui-icon-drop-right"></i>',
        '   	</div>',
        '   	<div class="swiper-button-prev">',
        '       	<i class="aui-icon aui-icon-drop-left"></i>',
        '   	</div>',
        '   </div>',
        '   <div class="mask-loading-box"></div>',
        '   </div>',
        '   </div>',
        '</div>'
    ].join(''));
    for (var i = 0; i < mapImgData.imgs.length; i++) {
        if (mapImgData.type == 'search') {
            var $maskSlider = $([
                '<div class="swiper-slide">',
                '   <div class="aui-row hide">',
                '   <div class="aui-col-18">',
                '   <div class="mask-image-box">',
                '   <div class="mask-crop-panel hide"></div>',
                '   <div class="square-crop-box hide">',
                '       <span class="cropper-view-box"><img class="cropper-view-img" /></span>',
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
                '   <img class="img" src="" alt="" />',
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
                '   <div class="mask-image-contrast hide"></div>',
                '   </div>',
                '   <div class="aui-col-6">',
                '       <div class="mask-info-box">',
                '           <div class="image-flex-list clearfix control-imge-list">',
                '               <div class="image-box-flex">',
                '                   <span class="image-tag">检索图片</span>',
                '                   <img class="img" src="./assets/images/control/person.png" />',
                '               </div>',
                '               <div class="image-box-flex">',
                '                   <span class="image-tag">抓拍图片</span>',
                '                   <img class="img" src="./assets/images/control/person.png" />',
                '               </div>',
                '               <span class="image-flex-similarity"><span class="primary"></span></span>',
                '           </div>',
                '           <button type="button" class="btn btn-primary btn-confirm changeImgSearch">横向比对</button>',
                '           <button type="button" class="btn btn-primary btn-confirm onetooneSearch">1:1比对</button>',
                '           <ul class="aui-mt-md">',
                '               <li class="mask-info-top">',
                '                   <p class="text-md text-bold">抓拍信息：</p>',
                '                   <ul class="aui-row form-info form-label-fixed form-label-long aui-mt-xs">',
                '                       <li class="aui-col-24">',
                '                           <div class="form-group">',
                '                               <label class="aui-form-label">抓拍时间：</label>',
                '                               <div class="form-text"></div>',
                '                           </div>',
                '                       </li>',
                '                       <li class="aui-col-24">',
                '                           <div class="form-group">',
                '                               <label class="aui-form-label">抓拍镜头名称：</label>',
                '                               <div class="form-text"></div>',
                '                           </div>',
                '                       </li>',
                '                       <li class="aui-col-24">',
                '                           <div class="form-group">',
                '                               <label class="aui-form-label">镜头所属机构：</label>',
                '                               <div class="form-text"></div>',
                '                           </div>',
                '                       </li>',
                '                       <li class="aui-col-24">',
                '                           <div class="form-group">',
                '                               <label class="aui-form-label">镜头国标编码：</label>',
                '                               <div class="form-text"></div>',
                '                           </div>',
                '                       </li>',
                '                   </ul>',
                '               </li>',
                '           </ul>',
                '           <div class="aui-mt-md case-item-operate">',
                '               <button type="button" class="btn btn-primary btn-confirm hide disabled">选中图片</button>',
                '               <button type="button" class="btn btn-primary btn-confirm">发起检索</button>',
                '               <button type="button" class="btn btn-primary btn-confirm hide">大图检索</button>',
                '               <button type="button" class="btn btn-primary btn-confirm">大图抠图</button>',
                '           </div>',
                '           <div class="case-item-faceModal hide">',
                '               <p class="modal-face-info">识别出的人脸',
                '                   <span class="modal-face-num"></span>',
                '               </p>',
                '               <div class="faceModalSelectAll hide">',
                '                   <label class="ui-checkboxradio-checkbox-label ui-checkboxradio-label ui-button ui-widget ui-checkboxradio-checked">',
                '                       <span class="ui-checkboxradio-icon  ui-icon ui-icon-background ui-icon-blank"></span>',
                '                       <span>全选</span>',
                '                   </label>',
                '               </div>',
                '               <div class="add-image-wrap-faceModal add-type-3 clearfix">',
                '               </div>',
                '           </div>',
                '       </div>',
                '   </div>',
                '   </div>',
                '</div>'
            ].join(''));
        } else {
            var btnHtml = '';
            if (mapImgData.imgs[i].status == '0') {
                btnHtml = `<div class="aui-mt-md case-item-operate">	
                                <button type="button" class="btn btn-primary btn-confirm">确认</button>
                                <button type="button" class="btn btn-false">误报</button>
                                <button type="button" class="btn btn-search">发起检索</button>
                            </div>`
            } else if (mapImgData.imgs[i].status == '1') {
                btnHtml = `<div class="aui-mt-md case-item-operate">	
                                <button type="button" class="btn btn-primary btn-confirm disabled">已命中</button>
                                <button type="button" class="btn btn-search">发起检索</button>
                            </div>`
            } else if (mapImgData.imgs[i].status == '2') {
                btnHtml = `<div class="aui-mt-md case-item-operate">	
                                <button type="button" class="btn btn-primary btn-confirm disabled">已误报</button>
                                <button type="button" class="btn btn-search">发起检索</button>
                            </div>`
            }
            var $maskSlider = $([
                '<div class="swiper-slide">',
                '   <div class="aui-row hide">',
                '   <div class="aui-col-18">',
                '   <div class="mask-image-box">',
                '   <div class="mask-crop-panel hide"></div>',
                '   <div class="square-crop-box hide">',
                '       <span class="cropper-view-box"><img class="cropper-view-img" /></span>',
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
                '   <img class="img" src="" alt="" />',
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
                '   <div class="mask-image-contrast hide"></div>',
                '   </div>',
                '   <div class="aui-col-6">',
                '       <div class="mask-info-box">',
                '           <div class="image-flex-list clearfix control-imge-list">',
                '               <div class="image-box-flex">',
                '                   <span class="image-tag">布控原图</span>',
                '                   <img class="img" src="./assets/images/control/person.png" />',
                '               </div>',
                '               <div class="image-box-flex">',
                '                   <span class="image-tag">抓拍图片</span>',
                '                   <img class="img" src="./assets/images/control/person.png" />',
                '               </div>',
                '               <span class="image-flex-similarity"><span class="primary"></span></span>',
                '           </div>',
                '           <button type="button" class="btn btn-primary btn-confirm changeImgSearch">横向比对</button>',
                '           <button type="button" class="btn btn-primary btn-confirm onetooneSearch">1:1比对</button>',
                '           <ul class="aui-mt-md">',
                '               <li class="mask-info-top">',
                '                   <p class="text-md text-bold">抓拍信息：</p>',
                '                   <ul class="aui-row form-info form-label-fixed form-label-long aui-mt-xs">',
                '                       <li class="aui-col-24">',
                '                           <div class="form-group">',
                '                               <label class="aui-form-label">抓拍时间：</label>',
                '                               <div class="form-text"></div>',
                '                           </div>',
                '                       </li>',
                '                       <li class="aui-col-24">',
                '                           <div class="form-group">',
                '                               <label class="aui-form-label">抓拍镜头名称：</label>',
                '                               <div class="form-text"></div>',
                '                           </div>',
                '                       </li>',
                '                       <li class="aui-col-24">',
                '                           <div class="form-group">',
                '                               <label class="aui-form-label">镜头所属机构：</label>',
                '                               <div class="form-text"></div>',
                '                           </div>',
                '                       </li>',
                '                       <li class="aui-col-24">',
                '                           <div class="form-group">',
                '                               <label class="aui-form-label">镜头国标编码：</label>',
                '                               <div class="form-text"></div>',
                '                           </div>',
                '                       </li>',
                '                   </ul>',
                '               </li>',
                '               <li class="mask-info-bottom">',
                '                   <p class="text-md text-bold">人员信息：</p>',
                '                   <ul class="aui-row form-info form-label-fixed form-label-long aui-mt-xs">',
                '                       <li class="aui-col-24">',
                '                           <div class="form-group">',
                '                               <label class="aui-form-label">姓名：</label>',
                '                               <div class="form-text"></div>',
                '                           </div>',
                '                       </li>',
                '                       <li class="aui-col-24">',
                '                           <div class="form-group">',
                '                               <label class="aui-form-label">身份证号：</label>',
                '                               <div class="form-text copySelect"></div>',
                '                           </div>',
                '                       </li>',
                '                       <li class="aui-col-24">',
                '                           <div class="form-group">',
                '                               <label class="aui-form-label">来源库：</label>',
                '                               <div class="form-text"></div>',
                '                           </div>',
                '                       </li>',
                '                       <li class="aui-col-24">',
                '                           <div class="form-group">',
                '                               <label class="aui-form-label">布控事由：</label>',
                '                               <div class="reason-box"></div>',
                '                           </div>',
                '                       </li>',
                '                   </ul>',
                '               </li>',
                '           </ul>',
                '       </div>',
                '   </div>',
                '   </div>',
                '</div>'
            ].join(''));
        }

        $maskSlider.data('cardData', mapImgData.imgs[i]);
        $maskContainer.find('.mask-container .swiper-wrapper').append($maskSlider);
    }
    $('#mapMask').remove();
    $('body').append($maskContainer);
    window.setTimeout(function () {
        $('#mapMask').addClass('show');
    }, 50);
    if ($('#pageSidebarMenu').find('.aui-icon-monitor').parents(".sidebar-item").hasClass("active")) {
        $('#map_iframe_pathDynamic').blur();
    } else if ($('#pageSidebarMenu').find('.aui-icon-library').parents(".sidebar-item").hasClass("active")) {
        $('#map_iframe_pathTemperature').blur();
    } else {
        $('#map_iframe_path').blur();
    }

    var targetIndex = mapImgData.selectIndex - 1,
        containerCls = '#mapMask .swiper-container',
        nextBtnCls = '#mapMask .swiper-button-next',
        prevBtnCls = '#mapMask .swiper-button-prev';
    var mySwiper = new Swiper(containerCls, {
        initialSlide: targetIndex,
        navigation: {
            nextEl: nextBtnCls,
            prevEl: prevBtnCls
        },
    });
    if (targetIndex == 0) {
        $('#mapMask .swiper-button-prev').addClass('hide');
    } else if (mySwiper.slides && targetIndex == (mySwiper.slides.length - 1)) {
        $('#mapMask .swiper-button-next').addClass('hide');
    }
    if (mySwiper.slides && mySwiper.slides.length == 1) {
        $('#mapMask .swiper-button-prev').addClass('hide');
        $('#mapMask .swiper-button-next').addClass('hide');
    }

    function selectFace($img, $maskCropBox, $maskSquareBox, index, imgWidth, imgHeight, position) {
        var imgWidthDom = parseInt(imgWidth),
            imgHeightDom = parseInt(imgHeight),
            boxWidth = parseInt($img.width() ? $img.width() : 0),
            boxHeight = parseInt($img.height() ? $img.height() : 0),
            percentW = boxWidth / imgWidthDom,
            percentH = boxHeight / imgHeightDom;

        var canvas1 = $('#mapMask').find('.swiper-slide').eq(index).find('.mask-canvas-bg')[0],
            canvas3 = $('#mapMask').find('.swiper-slide').eq(index).find('.mask-canvas-img')[0];
        canvas1.height = boxHeight;
        canvas1.width = boxWidth;
        canvas3.width = 100;
        canvas3.height = 100;


        var positionArr = position,
            positionStartX = positionArr[0].x,
            positionStartY = positionArr[0].y,
            positionEndX = positionArr[1].x,
            positionEndY = positionArr[1].y;
        var position = {
            start: {
                x: positionStartX,
                y: positionStartY
            },
            width: positionEndX - positionStartX,
            height: positionEndY - positionStartY
        }

        // 设置截图区域图片大小
        $maskCropBox.find('.cropper-view-img').width(boxWidth);
        $maskCropBox.find('.cropper-view-img').height(boxHeight);
        $maskSquareBox.css({
            "top": position.start.y * percentH,
            "left": position.start.x * percentW,
            "width": position.width * percentW,
            "height": position.height * percentH
        });
        $maskSquareBox.data({
            "top": position.start.y * percentH,
            "left": position.start.x * percentW,
            "width": position.width * percentW,
            "height": position.height * percentH
        });
    }
    // 判断是否检索轨迹大图
    if (mapImgData.type == "search") {
        mapImgData.imgs.forEach(function (item, index) {
            //var item = mapImgData.imgs[mapImgData.selectIndex-1],
            //index = mapImgData.selectIndex-1;
            showLoading($("#mapMask .swiper-slide").eq(index));
            window.loadData('v2/faceDt/getImgByUrl', true, {
                url: item.bigUrl,
                moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
            }, function (data, position) {
                if (data.code === '200') {
                    // 设置图片选中框
                    var $appendSlide = $("#mapMask .swiper-container").find('.swiper-slide').eq(index),
                        $img = $appendSlide.find('.square-crop-box').next('.img'),
                        $maskSquareBox = $appendSlide.find('.square-box'),
                        $maskCropBox = $appendSlide.find('.square-crop-box');
                    $maskSquareBox.removeClass('hide');
                    //position = item.position;
                    position = item.position ? item.position : (data.vertices || [{ x: "0", y: "0" }, { x: "0", y: "0" }]);
                    console.log(item.position, data.vertices, position);
                    $img.attr('src', 'data:image/png;base64,' + data.base64);
                    // 设置弹窗数据
                    var $slideMaskInfo = $appendSlide.find('.mask-info-box'),
                        $slideMaskInfoImg1 = $slideMaskInfo.find('.control-imge-list').find('.image-box-flex').eq(0),
                        $slideMaskInfoImg2 = $slideMaskInfo.find('.control-imge-list').find('.image-box-flex').eq(1),
                        $similarity = $slideMaskInfo.find('.control-imge-list').find('.image-flex-similarity'),
                        $ulInfo = $slideMaskInfo.find('.mask-info-top ul .form-text'),
                        searchImg = $('#usearchImg').data('maskImg'),
                        slideData = $appendSlide.data('cardData');
                    if ($('#pageSidebarMenu .aui-icon-monitor').parents(".sidebar-item").hasClass("active")) {
                        searchImg = $('#usearchImgDynamic').data('maskImg');
                    } else if ($('#pageSidebarMenu .aui-icon-library').parents(".sidebar-item").hasClass("active")) {
                        searchImg = '';
                    }
                    $slideMaskInfoImg1.find('.img').attr('src', searchImg);
                    //$slideMaskInfoImg2.find('.img').attr('src', slideData.faceUrl); // newDataFn方法构造的轨迹数据
                    $similarity.children('.primary').text(slideData.score);
                    if ($("#pageSidebarMenu").find(".aui-icon-library").parents(".sidebar-item").hasClass("active")) {
                        $similarity.children('.primary').text(Number(slideData.temperature).toFixed(2) + '℃');
                    }
                    if (isClickOneToOne) {
                        $appendSlide.find(".mask-image-box").addClass("hide");
                        $appendSlide.find(".mask-image-contrast").removeClass("hide");
                    } else {
                        $appendSlide.find(".mask-image-box").removeClass("hide");
                        $appendSlide.find(".mask-image-contrast").addClass("hide");
                    }
                    // 根据url获取base64
                    alarmSearchBtnChange(slideData.faceUrl, function (imageInfo) {
                        $slideMaskInfoImg2.find('.img').attr('src', imageInfo); // 右侧详情 抓拍图片赋值 值为动态库中被点击的小图base64
                        $slideMaskInfoImg2.find('.img').data('sUrl', imageInfo); // 右侧详情 抓拍图片赋值 值为动态库中被点击的小图base64
                        $slideMaskInfoImg2.find('.img').data('bUrl', $img.attr("src")); // 右侧详情 抓拍图片赋值 值为动态库中被点击的小图base64
                        $slideMaskInfo.find(".changeImgSearch").removeClass("disabled");
                        if (isClickOneToOne) {
                            $slideMaskInfo.find(".changeImgSearch").click();
                        }
                        //isClickOneToOne = false;
                    });
                    $ulInfo.eq(0).text(slideData.cameraTime);
                    $ulInfo.eq(1).text(slideData.cameraName);
                    $ulInfo.eq(2).text(slideData.orgName);
                    $ulInfo.eq(3).text(slideData.gbCode);
                    $appendSlide.find('.aui-row').removeClass('hide');
                    selectFace($img, $maskCropBox, $maskSquareBox, index, data.width, data.height, position);
                    $(window).off('resize').on('resize', selectFace);
                    $('.cropper-view-img').eq(index).attr('src', 'data:image/png;base64,' + data.base64);
                    $appendSlide.data({
                        cameraId: item.cameraId,
                        longCameraId: item.longCameraId,
                        cameraTime: item.cameraTime,
                        imgUrl: 'data:image/png;base64,' + data.base64
                    })
                    hideLoading($("#mapMask .swiper-slide").eq(index));

                    // 发起检索按钮 事件绑定
                    $slideMaskInfo.find(".case-item-operate button").eq(1).off('click').on('click', function () {
                        var $this = $(this),
                            thisLoad = $this.children().length; // 按钮子元素节点
                        if (thisLoad > 0) { // 如果按钮没有子元素节点
                            return;
                        }
                        showLoading($this);

                        if ($("#pageSidebarMenu").find(".aui-icon-library").parents(".sidebar-item").hasClass("active")) {
                            var $sideBar = $('#pageSidebarMenu').find('.aui-icon-carsearch2'),
                                $sideItem = $sideBar.closest('.sidebar-item'),
                                sideIndex = $sideItem.index(),
                                $contentItem = $('#content-box').find('.content-save-item').eq(sideIndex),
                                $contentUserImg = $contentItem.find('#usearchImg'),
                                url = $sideBar.parent("a").attr("lc") + "?dynamic=" + Global.dynamic;

                            $appendSlide.find('.aui-icon-not-through').click(); // 关闭大图弹框
                            if ($contentUserImg.length === 0) {
                                loadPage($contentItem, url);
                            }
                            $sideItem.click();
                        }

                        var $usearchImg = $("#usearchImg"),
                            $dynamicsearch = $('#mergeSearch'),
                            $backToSearch = $("#backToSearch");
                        if ($("#pageSidebarMenu").find(".aui-icon-monitor").parents(".sidebar-item").hasClass("active")) {
                            $usearchImg = $("#usearchImgDynamic");
                            $dynamicsearch = $('#dynamicsearchDynamic');
                            $backToSearch = $("#backToSearchDynamic");
                        }

                        if ($(this).parents(".swiper-slide.swiper-slide-active").find('.add-image-wrap-faceModal .add-image-item.active').length > 0) {
                            hideLoading($this);
                            var $selectDom = $(this).parents(".swiper-slide.swiper-slide-active").find('.add-image-wrap-faceModal .add-image-item.active'),
                                selectHtml = '';
                            $selectDom.each(function (index, element) {
                                var src = $(element).find('.add-image-img').attr('src');
                                selectHtml += [
                                    '<div class="add-image-item active">',
                                    '   <span class="image-tag-new">人脸小图</span><span class="image-card-mask"></span>',
                                    '   <img class="add-image-img" src="' + src + '" alt="" picStatus="2" picId="' + $(element).find('.add-image-img').attr('picId') + '">',
                                    '   <i class="aui-icon-delete-line"></i>',
                                    '</div>'
                                ].join('');
                            });
                            $usearchImg.find('.add-image-icon').before(selectHtml);
                            var $newDom = $usearchImg.find('.add-image-item');
                            $usearchImg.find('.add-image-item').removeClass('active').eq(-1).addClass('active');
                            if ($newDom.length > 6) {
                                $usearchImg.removeClass('scroll');
                                var clientH = $usearchImg[0].clientHeight;
                                $usearchImg.addClass('scroll');
                                $usearchImg.animate({
                                    'scrollTop': clientH
                                }, 500);
                            }
                            $appendSlide.find('.aui-icon-not-through').click(); // 关闭大图弹框
                            $backToSearch.click();
                            if ($(this).parents(".swiper-slide.swiper-slide-active").find('.add-image-wrap-faceModal .add-image-item.active').length == 1) {
                                $dynamicsearch.click();
                            }
                        } else {
                            window.loadData('v2/faceDt/getImgByUrl', true, { // 根据url获取base64
                                url: slideData.faceUrl
                            }, function (data) {
                                if (data.code === '200') {
                                    hideLoading($this);
                                    var imgUrl = 'data:image/png;base64,' + data.base64; // 获取动态库 被点击图片base64
                                    var html = createAddImageItem(imgUrl); // 创建上传框发起检索图片html
                                    $usearchImg.find('.add-image-item').removeClass('active'); // 去掉之前检索图片的激活状态
                                    $usearchImg.find('.add-image-icon').before(html); // 新的检索图片插入上传图片框
                                    $usearchImg.find('.uploadFile')[0].value = '';
                                    var $imgItem = $usearchImg.find('.add-image-item'); // 所有上传图片的节点
                                    if ($imgItem.length > 5) { // 上传图片大于5张 3行
                                        $usearchImg.removeClass('scroll');
                                        var clientH = $usearchImg[0].clientHeight;
                                        $usearchImg.addClass('scroll');
                                        $usearchImg.animate({ // 自动滚动到上传框底部
                                            'scrollTop': clientH
                                        }, 500);
                                    }
                                    // if ($('#mergeSearch').length > 0) {
                                    //     imgDom(imgUrl, $('#mergeSearch'), $usearchImg); // 扣人脸
                                    // } else {
                                    imgDom(imgUrl, $dynamicsearch, $usearchImg, false, false, item); // 扣人脸
                                    //}
                                    $appendSlide.find('.aui-icon-not-through').click(); // 关闭大图弹框
                                    $backToSearch.click();
                                    if ($imgItem.length == 1) {
                                        $usearchImg.find('.add-image-icon').removeClass('add-image-new');
                                        $usearchImg.find('.add-image-box-text').addClass('hide');
                                        $usearchImg.removeClass("center");
                                    }
                                }
                            });
                        }
                    });
                    //原图检索 事件绑定
                    $slideMaskInfo.find(".case-item-operate button").eq(2).off('click').on('click', function () {
                        var imgUrl = $(this).parents(".swiper-slide.swiper-slide-active").find(".mask-image-box .img").attr("src");
                        var $usearchImg = $("#usearchImg"),
                            $dynamicsearch = $("#mergeSearch"),
                            $backToSearch = $("#backToSearch");
                        if ($("#pageSidebarMenu").find(".aui-icon-monitor").parents(".sidebar-item").hasClass("active")) {
                            $usearchImg = $("#usearchImgDynamic");
                            $dynamicsearch = $("#dynamicsearchDynamic");
                            $backToSearch = $("#backToSearchDynamic");
                        }
                        if ($usearchImg.find(".add-image-img").length == 0) {
                            $usearchImg.find('.add-image-icon').removeClass('add-image-new');
                            $usearchImg.find('.add-image-box-text').addClass('hide');
                            $usearchImg.removeClass("center");
                        }
                        // if ($('#mergeSearch').length > 0) {
                        //     imgDom(imgUrl, $('#mergeSearch'), $("#usearchImg"), false, true); // 扣人脸
                        // } else {
                        imgDom(imgUrl, $dynamicsearch, $usearchImg, false, true, item); // 扣人脸
                        //}
                        $appendSlide.find('.aui-icon-not-through').click(); // 关闭大图弹框
                        $backToSearch.click();
                        showLoading($('#content-box'));
                    });
                    //大图抠图 事件绑定
                    $slideMaskInfo.find(".case-item-operate button").eq(3).off('click').on('click', function () {
                        var imgUrl = $(this).parents(".swiper-slide.swiper-slide-active").find(".mask-image-box .img").attr("src"),
                            $myModal = $(this).parents(".swiper-slide.swiper-slide-active"),
                            $myModalParents = $myModal.parents(".swiper-container.mask-container");
                        if (imgUrl.indexOf("http") == 0) { //base64
                            var data = {
                                url: imgUrl,
                                moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                                searchIndex: item.searchIndex,
                                searchId: item.searchId
                            };
                        } else {
                            var data = {
                                base64: imgUrl,
                                moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                                searchIndex: item.searchIndex,
                                searchId: item.searchId
                            };
                        }
                        showLoading($myModalParents);
                        var port = 'v2/faceRecog/cutFaceId',
                            successFunc = function (info) {
                                hideLoading($myModalParents);
                                if (info.code === '200') {
                                    var html = '';
                                    var faceList = info.data;
                                    $myModal.find('.case-item-faceModal').removeClass("hide");
                                    $myModal.find('.modal-face-num').text('(' + faceList.length + ')');
                                    if (faceList.length > 0) {
                                        $myModal.find(".faceModalSelectAll").removeClass("hide");
                                    }
                                    faceList.forEach(v => {
                                        html += [
                                            '<div class="add-image-item active">',
                                            '   <img class="add-image-img" src="data:image/png;base64,' + v.base64 + '" alt="" picId="' + v.staticId + '">',
                                            '   <i class="aui-icon-delete-line"></i>',
                                            '</div>'
                                        ].join('');
                                    });
                                    $myModal.find('.add-image-wrap-faceModal').empty().append(html);

                                    if (faceList.length > 8) {
                                        $myModal.find('.add-image-wrap-faceModal').css('overflow-y', 'auto');
                                    }

                                    $myModal.find('.add-image-wrap-faceModal .add-image-item').on("click", function () {
                                        if ($(this).hasClass("active")) {
                                            $(this).removeClass("active");
                                        } else {
                                            $(this).addClass("active");
                                        }
                                        for (let i = 0; i < $(this).parent().find(".add-image-item").length; i++) {
                                            if (!$(this).parent().find(".add-image-item").eq(i).hasClass("active")) {
                                                $myModal.find('.case-item-faceModal .ui-checkboxradio-checkbox-label').removeClass("ui-checkboxradio-checked");
                                                return;
                                            }
                                        }

                                        $myModal.find('.case-item-faceModal .ui-checkboxradio-checkbox-label').addClass("ui-checkboxradio-checked");
                                    });

                                    $myModal.find('.add-image-wrap-faceModal .aui-icon-delete-line').on("click", function () {
                                        var $item = $(this).closest('.add-image-item');
                                        $item.remove();
                                        var $imgItem = $myModal.find('.add-image-item');
                                        $myModal.find('.modal-face-num').text('(' + $imgItem.length + ')');
                                        if ($imgItem.length < 9) {
                                            $myModal.find('.add-image-wrap-faceModal').css('overflow-y', 'hidden');
                                        }

                                        if ($imgItem.length == 0) {
                                            $myModal.find(".faceModalSelectAll").addClass("hide");
                                        }
                                    });

                                    $myModal.find('.case-item-faceModal .ui-checkboxradio-checkbox-label').on("click", function () {
                                        if ($(this).hasClass("ui-checkboxradio-checked")) {
                                            $(this).removeClass("ui-checkboxradio-checked");
                                            $(this).parents(".case-item-faceModal").find(".add-image-item").removeClass("active");
                                        } else {
                                            $(this).addClass("ui-checkboxradio-checked");
                                            $(this).parents(".case-item-faceModal").find(".add-image-item").addClass("active");
                                        }
                                    });
                                } else {
                                    warningTip.say("请求超时，请稍后再试");
                                }
                            };
                        loadData(port, true, data, successFunc, '', 'POST', sourceType == 'ga' ? serviceUrlOther : '');
                    });
                }
            })
        });
    } else {
        mapImgData.imgs.forEach(function (item, index) {
            showLoading($("#mapMask .swiper-slide").eq(index));
            window.loadData('v2/faceDt/getImgByUrl', true, {
                url: item.bigUrl,
                moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
            }, function (data, position) {
                if (data.code === '200') {
                    // 设置图片选中框
                    var $appendSlide = $("#mapMask .swiper-container").find('.swiper-slide').eq(index),
                        $img = $appendSlide.find('.square-crop-box').next('.img'),
                        $viewImg = $appendSlide.find('.cropper-view-img'),
                        $maskSquareBox = $appendSlide.find('.square-box'),
                        $maskCropBox = $appendSlide.find('.square-crop-box');
                    $maskSquareBox.removeClass('hide');
                    position = item.position;
                    //position = data.vertices || [{ x: "0", y: "0" }, { x: "0", y: "0" }];
                    $img.attr('src', 'data:image/png;base64,' + data.base64);
                    $viewImg.attr('src', 'data:image/png;base64,' + data.base64);
                    // 设置弹窗数据
                    var $slideMaskInfo = $appendSlide.find('.mask-info-box'),
                        $slideMaskInfoImg1 = $slideMaskInfo.find('.control-imge-list').find('.image-box-flex').eq(0),
                        $slideMaskInfoImg2 = $slideMaskInfo.find('.control-imge-list').find('.image-box-flex').eq(1),
                        $similarity = $slideMaskInfo.find('.control-imge-list').find('.image-flex-similarity'),
                        $ulInfo = $slideMaskInfo.find('.mask-info-top ul .form-text'),
                        $ulInfoBottom = $slideMaskInfo.find('.mask-info-bottom ul .form-text'),
                        $ulInfoBottom4 = $slideMaskInfo.find('.mask-info-bottom ul .reason-box'),
                        searchImg = item.url,
                        slideData = $appendSlide.data('cardData');
                    $slideMaskInfoImg1.find('.img').attr('src', searchImg);
                    var infoImg2 = slideData.faceUrl ? slideData.faceUrl : '';
                    $slideMaskInfoImg2.find('.img').attr('src', infoImg2);
                    var slideDataScore = slideData.score ? parseFloat(slideData.score) + '%' : '';
                    $similarity.children('.primary').text(slideDataScore);
                    // 根据url获取base64
                    alarmSearchBtnChange(slideData.faceUrl, function (imageInfo) {
                        $slideMaskInfoImg2.find('.img').attr('src', imageInfo); // 右侧详情 抓拍图片赋值 值为动态库中被点击的小图base64
                        $slideMaskInfoImg2.find('.img').data('sUrl', imageInfo); // 右侧详情 抓拍图片赋值 值为动态库中被点击的小图base64
                        $slideMaskInfoImg2.find('.img').data('bUrl', $img.attr("src")); // 右侧详情 抓拍图片赋值 值为动态库中被点击的小图base64
                        $slideMaskInfo.find(".changeImgSearch").removeClass("disabled");
                        if (isClickOneToOne) {
                            $slideMaskInfo.find(".changeImgSearch").click();
                        }

                    });
                    $ulInfo.eq(0).text(slideData.cameraTime ? slideData.cameraTime : '未知');
                    $ulInfo.eq(1).text(slideData.cameraName ? slideData.cameraName : '未知');
                    $ulInfo.eq(2).text(slideData.orgName ? slideData.orgName : '未知');
                    $ulInfo.eq(3).text(slideData.gbCode ? slideData.gbCode : '未知');
                    $ulInfoBottom.eq(0).text(slideData.name ? slideData.name : '未知');
                    $ulInfoBottom.eq(1).text(slideData.idcard ? slideData.idcard : '未知');
                    $ulInfoBottom.eq(2).text(slideData.libName ? slideData.libName : '未知');
                    $ulInfoBottom4.text(slideData.comments ? slideData.comments : '未知');
                    $appendSlide.find('.aui-row').removeClass('hide');
                    selectFace($img, $maskCropBox, $maskSquareBox, index, data.width, data.height, position);
                    $(window).off('resize').on('resize', selectFace);
                    $('.cropper-view-img').eq(index).attr('src', 'data:image/png;base64,' + data.base64);
                    // $appendSlide.append($selectHtml);
                    $appendSlide.data({
                        cameraId: item.cameraId,
                        cameraTime: item.cameraTime,
                        longCameraId: item.longCameraId,
                        imgUrl: 'data:image/png;base64,' + data.base64
                    });
                    hideLoading($("#mapMask .swiper-slide").eq(index));
                }
            })
        });
    }

    var $targetImgLine = $("#auiTimeLine");
    if ($("#pageSidebarMenu").find(".aui-icon-monitor").parents(".sidebar-item").hasClass("active")) {
        $targetImgLine = $("#auiTimeLineDynamic");
    }
    // 绑定键盘事件
    $('body').off('keyup.mapMask').on('keyup.mapMask', function (evt) {
        if ($('body').find('#mapMask').css('display') !== 'none') {
            if (evt.keyCode === 37) {
                $('#mapMask .swiper-button-prev').click();
            }
            if (evt.keyCode === 39) {
                $('#mapMask .swiper-button-next').click();
            }
            if (evt.keyCode === 27) {
                var $cropPanel = $('#mapMask').find('.mask-crop-panel').not('.hide');
                if ($cropPanel.length === 0) {
                    $('#mapMask').find('.aui-icon-not-through').click();
                } else {
                    // 判定是否有选中框,或者有遮罩层
                    var $cropPanelNext = $cropPanel.next();
                    if ($cropPanelNext.hasClass('hide')) {
                        $cropPanel.closest('.swiper-slide').trigger('mousedown');
                        $(document).trigger('mouseup');
                    } else {
                        $cropPanelNext.find('.aui-icon-not-through').click();
                    }
                }
            }
        }
    });
    // 下一个按钮事件绑定
    $('#mapMask .swiper-button-next').on('click', function () {
        var swiperIndex = mySwiper.activeIndex,
            slideLen = mySwiper.slides.length - 1;
        if ((swiperIndex + 1) <= slideLen) {
            mySwiper.slideTo((swiperIndex + 1), 300, false);
        }
        if ((swiperIndex + 1) == slideLen) {
            $('#mapMask .swiper-button-next').addClass('hide');
        }
        $('#mapMask .swiper-button-prev').removeClass('hide');
        $("#mapMask").find(".mask-image-box").removeClass("hide");
        $("#mapMask").find(".mask-image-contrast").addClass("hide");
        $("#mapMask").find(".changeImgSearch").html("横向比对");
        var sUrl = $("#mapMask").find('.swiper-slide.swiper-slide-active').find(".image-flex-list.clearfix>.image-box-flex").eq(1).find(".img").data("sUrl");
        $("#mapMask").find('.swiper-slide.swiper-slide-active').find(".image-flex-list.clearfix>.image-box-flex").eq(1).find(".img").attr("src", sUrl);

        // $('body').find($('#mapMask .swiper-slide-active .mask-image-box'))[0].removeEventListener('contextmenu', rightMouse);
        // $('body').find($('#mapMask .swiper-slide-active .mask-image-box'))[0].addEventListener('contextmenu', rightMouse);
    });
    // 上一个按钮事件绑定
    $('#mapMask .swiper-button-prev').on('click', function () {
        var swiperIndex = mySwiper.activeIndex;
        if (swiperIndex - 1 >= 0) {
            mySwiper.slideTo((swiperIndex - 1), 300, false);
        }
        if ((swiperIndex - 1) == 0) {
            $('#mapMask .swiper-button-prev').addClass('hide');
        }
        $('#mapMask .swiper-button-next').removeClass('hide');
        $("#mapMask").find(".mask-image-box").removeClass("hide");
        $("#mapMask").find(".mask-image-contrast").addClass("hide");
        $("#mapMask").find(".changeImgSearch").html("横向比对");
        var sUrl = $("#mapMask").find('.swiper-slide.swiper-slide-active').find(".image-flex-list.clearfix>.image-box-flex").eq(1).find(".img").data("sUrl");
        $("#mapMask").find('.swiper-slide.swiper-slide-active').find(".image-flex-list.clearfix>.image-box-flex").eq(1).find(".img").attr("src", sUrl);

        // $('body').find($('#mapMask .swiper-slide-active .mask-image-box'))[0].removeEventListener('contextmenu', rightMouse);
        // $('body').find($('#mapMask .swiper-slide-active .mask-image-box'))[0].addEventListener('contextmenu', rightMouse);
    });

    // 添加大图部分的鼠标右键点击事件4
    //$('body').find($('#mapMask .swiper-slide-active .mask-image-box'))[0].addEventListener('contextmenu', rightMouse);
    $('body').find($('#mapMask'))[0].addEventListener('contextmenu', rightMouse);
    //时间
    function times(d) {
        if (d < 10) {
            return '0' + d;
        } else {
            return d;
        }
    }
    //播放功能 跳转到客户端的视频监控模块进行播放  id是镜头id
    function playhistoryVideo(id, start, end) {
        try {
            callHostFunction.callReplayFunctionEx(id, start, end); //调用客户端的方法进行跳转并播放
        } catch (e) {
            warningTip.say("请在客户端中进行播放！") && window.parent.p_alert("请在客户端中进行播放！");
        }
    }
    //播放功能 跳转到客户端的视频监控模块进行播放  id是镜头id
    function playrealtimeVideo(id) {
        try {
            callHostFunction.callSurveillanceFunction(id); //调用客户端的方法进行跳转并播放
        } catch (e) {
            warningTip.say("请在客户端中进行播放！") && window.parent.p_alert("请在客户端中进行播放！");
        }
    }

    function seconds(time1, time2) {
        var day = new Date(time1.toString());
        day.setSeconds(day.getSeconds() + time2);
        return day.getFullYear() + '-' + times(day.getMonth() + 1) + '-' + times(day.getDate()) + ' ' + times(day.getHours()) + ':' + times(day.getMinutes()) + ':' + times(day.getSeconds());
    }

    // 绑定截图按钮事件1
    $('#mapMask').find('.aui-icon-screen').off('click').on('click', function () {
        var $maskSlider = $('#mapMask').find('.swiper-slide-active');
        var $slidePanel = $maskSlider.find('.mask-crop-panel'),
            $slideSelectBox = $maskSlider.find('.square-box');
        $slidePanel.removeClass('hide');
        $slideSelectBox.addClass('hide');
        var $maskClose = $('#mapMask').find('.aui-icon-close'),
            $maskFooter = $('#mapMask').find('.mask-icon-box'),
            $maskNext = $('#mapMask').find('.swiper-button-next'),
            $maskPrev = $('#mapMask').find('.swiper-button-prev'),
            $maskCamera = $('#mapMask').find('.aui-icon-video3');
        $maskClose.addClass('hide');
        $maskFooter.addClass('hide');
        $maskNext.addClass('hide');
        $maskPrev.addClass('hide');
        $maskCamera.addClass('hide');
    });
    // 绑定大图摄像机按钮点击事件,打开时间列表事件2
    $('#mapMask').find('.aui-icon-video3').off('click').on('click', function (evt) {
        evt.stopPropagation();
        var $list = $('#mapMask').find('.swiper-slide-active .mask-camera-list');
        $(this).toggleClass('active');
        $list.children().removeClass('active').eq(0).addClass('active');
        $list.toggleClass('hide');
    });
    // 绑定大图摄像机时间列表的点击事件3
    $('#mapMask').find('.mask-camera-item').off('click').on('click', function (evt) {
        evt.stopPropagation();
        var $maskSlider = $('#mapMask').find('.swiper-slide.swiper-slide-active');
        var cameraId = $maskSlider.data('cameraId'),
            longCameraId = $maskSlider.data('longCameraId'),
            cameraTime = $maskSlider.data('cameraTime');
        $(this).addClass('active').siblings().removeClass('active');
        $maskSlider.find('.mask-camera-list').addClass('hide');
        var index = $(this).index();
        if (index === 0) {
            playhistoryVideo(longCameraId, seconds(cameraTime, -5), seconds(cameraTime, 5));
        } else if (index === 1) {
            playhistoryVideo(longCameraId, seconds(cameraTime, -10), seconds(cameraTime, 10));
        } else if (index === 2) {
            playhistoryVideo(longCameraId, seconds(cameraTime, -30), seconds(cameraTime, 30));
        } else if (index === 3) {
            playrealtimeVideo(cameraId);
        }
    });
    // 添加点击全局部分隐藏摄像机时间列表5
    $(document).off('click.mask.camera').on('click.mask.camera', function () {
        $('body').find('.mask-camera-list').addClass('hide');
        $('body').find('.mask-icon.aui-icon-video3').removeClass('active');
        $('body').find('.mask-camera-item').removeClass('active');
    });
    //绑定弹窗关闭事件6
    $('#mapMask').find('.aui-icon-not-through').on('click', function () {
        $('#mapMask').removeClass('show');
        window.setTimeout(function () {
            $('#mapMask').addClass('hide');
            $('#mapMask').remove();
        }, 300);
        isClickOneToOne = false;
    });

    // 截屏公共函数,为了将png格式图片转化成base64格式
    function cropImg(canvas1, oMark, canvas3, src) {
        var cxt1 = canvas1.getContext('2d');
        var img = new Image();
        img.src = src;
        var srcX = $(oMark).position().left;
        var srcY = $(oMark).position().top;
        var sWidth = oMark.offsetWidth;
        var sHeight = oMark.offsetHeight;
        var canvas2 = document.createElement('canvas');
        var cxt2 = canvas2.getContext('2d');

        img.onload = function () {
            cxt1.drawImage(img, 0, 0, canvas1.width, canvas1.height);
            var dataImg = cxt1.getImageData(srcX, srcY, sWidth, sHeight);
            canvas2.width = sWidth;
            canvas2.height = sHeight;
            cxt2.putImageData(dataImg, 0, 0, 0, 0, canvas2.width, canvas2.height);
            var img2 = canvas2.toDataURL('image/png');
            var cxt3 = canvas3.getContext('2d');
            var img3 = new Image();
            img3.src = img2;
            img3.onload = function () {
                cxt3.drawImage(img3, 0, 0, canvas3.width, canvas3.height);
            }
        }
    }
    // 绑定弹窗拖拽事件
    $('.mask-container').find('.mask-image-box').on('mousedown', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var $this = $('#mapMask').find('.swiper-slide-active').find('.mask-image-box'),
            baseWidth = $this.outerWidth(),
            baseHeight = $this.outerHeight(),
            offsetTop = $this.offset().top,
            offsetLeft = $this.offset().left,
            pageX = evt.pageX - offsetLeft,
            pageY = evt.pageY - offsetTop;
        var cropHide = $this.find('.square-crop-box').hasClass('hide'),
            cropPanel = $this.find('.mask-crop-panel').hasClass('hide');
        if (!cropHide || cropPanel) {
            return;
        }
        $this.find('.square-crop-box').css({
            top: pageY,
            left: pageX,
            width: 1,
            height: 1
        });
        $(document).on('mousemove.mask.', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $this.find('.square-crop-box').removeClass('hide');
            $this.find('.square-box').addClass('hide');
            var disX = e.pageX - evt.pageX,
                disY = e.pageY - evt.pageY,
                width, height, top, left;
            // 进行拖拽数据的判断
            if (disX > 0) {
                width = disX;
                left = pageX;
                if (width + left > baseWidth - 2) {
                    var val = baseWidth - left - 2;
                    width = val;
                }
            } else {
                width = -disX;
                left = pageX + disX;
                if (left < 2) {
                    left = 2;
                    width = pageX - 2;
                }
            }
            if (disY > 0) {
                height = disY;
                top = pageY;
                if (height + top > baseHeight - 2) {
                    var val = baseHeight - top - 2;
                    height = val;
                }
            } else {
                height = -disY;
                top = pageY + disY;
                if (top < 2) {
                    top = 2;
                    height = pageY - 2;
                }
            }
            $this.find('.square-crop-box').css({
                width: width,
                height: height,
                top: top,
                left: left
            });
            $this.find('.square-crop-box .cropper-view-img').css({
                marginTop: -top,
                marginLeft: -left
            });
            $this.find('.mask-crop-panel').removeClass('hide');
        });
        $(document).on('mouseup.mask.', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var $maskSlider = $('#mapMask').find('.swiper-slide-active');
            var width = $maskSlider.find('.square-crop-box').width(),
                height = $maskSlider.find('.square-crop-box').height();
            var $maskClose = $maskSlider.find('.aui-icon-close'),
                $maskFooter = $maskSlider.find('.mask-icon-box'),
                $maskNext = $maskSlider.find('.swiper-button-next'),
                $maskPrev = $maskSlider.find('.swiper-button-prev'),
                $maskCamera = $maskSlider.find('.aui-icon-video3'),
                top = $maskSlider.find('.square-crop-box').position().top,
                limitWidth = $maskSlider.outerWidth(),
                limitHeight = $maskSlider.outerHeight();
            if (width < 5 || height < 5) {
                $maskSlider.find('.square-crop-box').addClass('hide');
                $maskSlider.find('.square-crop-tool').addClass('hide');
                $maskSlider.find('.mask-crop-panel').addClass('hide');
                $maskSlider.find('.square-box').removeClass('hide');
                $maskClose.removeClass('hide');
                $maskFooter.removeClass('hide');
                $maskNext.removeClass('hide');
                $maskPrev.removeClass('hide');
                $maskCamera.removeClass('hide');
            } else {
                // 隐藏其他额外节点
                $maskClose.addClass('hide');
                $maskFooter.addClass('hide');
                $maskNext.addClass('hide');
                $maskPrev.addClass('hide');
                $maskCamera.addClass('hide');
                $maskSlider.find('.square-crop-tool').removeClass('hide');
                // 刷新当前canvas位置
                var canvas1 = $maskSlider.find('.mask-canvas-bg')[0],
                    oMark = $maskSlider.find('.square-crop-box')[0],
                    canvas3 = $maskSlider.find('.mask-canvas-img')[0],
                    imgUrl = $maskSlider.data('imgUrl');
                cropImg(canvas1, oMark, canvas3, imgUrl);
                // 确认截屏框删除按钮事件绑定
                $maskSlider.find('.square-crop-tool').children().eq(0).off('click').on('click', function () {
                    $('#mapMask').find('.mask-crop-panel').addClass('hide');
                    $('#mapMask').find('.square-box').removeClass('hide');
                    $('#mapMask').find('.square-crop-box').addClass('hide');
                    $('#mapMask').find('.square-crop-tool').addClass('hide');
                    $('#mapMask').find('.aui-icon-close').removeClass('hide');
                    $('#mapMask').find('.mask-icon-box').removeClass('hide');
                    $('#mapMask').find('.swiper-button-next').removeClass('hide');
                    $('#mapMask').find('.swiper-button-prev').removeClass('hide');
                    $('#mapMask').find('.aui-icon-video3').removeClass('hide');
                    var index = $('#mapMask').find('.swiper-slide-active').index(),
                        length = $('#mapMask').find('.swiper-slide').length;
                    if (index == (length - 1) && length > 1) {
                        $('#mapMask').find('.swiper-button-next').addClass('hide');
                    } else if (index == 0 && length > 1) {
                        $('#mapMask').find('.swiper-button-prev').addClass('hide');
                    } else if (length == 1) {
                        $('#mapMask').find('.swiper-button-next').addClass('hide');
                        $('#mapMask').find('.swiper-button-prev').addClass('hide');
                    }
                });
                // 确认截屏框确认按钮事件绑定
                $maskSlider.find('.square-crop-tool').children().eq(1).off('click').on('click', function () {
                    var canvas3 = $maskSlider.find('.mask-canvas-img')[0];
                    $('#mapMask').remove();
                    if ($('#pageSidebarMenu .aui-icon-monitor').parents(".sidebar-item").hasClass("active")) {
                        var $barItem = $('#pageSidebarMenu .aui-icon-monitor').closest('.sidebar-item'),
                            barIndex = $barItem.index(),
                            $saveItem = $('#content-box').children().eq(barIndex),
                            $userImg = $saveItem.find('#usearchImgDynamic'),
                            url = $('#pageSidebarMenu .aui-icon-monitor').parent("a").attr("lc") + "?dynamic=" + Global.dynamic;
                    } else {
                        var $barItem = $('#pageSidebarMenu .aui-icon-carsearch2').closest('.sidebar-item'),
                            barIndex = $barItem.index(),
                            $saveItem = $('#content-box').children().eq(barIndex),
                            $userImg = $saveItem.find('#usearchImg'),
                            url = $('#pageSidebarMenu .aui-icon-carsearch2').parent("a").attr("lc") + "?dynamic=" + Global.dynamic;
                    }
                    $barItem.addClass('active').siblings().removeClass('active');
                    $saveItem.removeClass('hide').siblings().addClass('hide');
                    $('#content-box').removeClass('display-none');
                    $('#controlDetailPage').addClass('display-none');
                    $('#backToSearch').click();
                    if ($userImg.length === 0) {
                        $("#imgBase64").data('base64', canvas3.toDataURL('image/png'));
                        $saveItem.empty();
                        loadPage($saveItem, url);
                    } else {
                        var $addImg = $userImg.find('.add-image-item');
                        if ($addImg.length === 0) {
                            $("#imgBase64").data('base64', canvas3.toDataURL('image/png'));
                            $saveItem.empty();
                            $userImg.find(".add-image-icon").removeClass("add-image-new");
                            loadPage($saveItem, url);
                        } else {
                            addSearchImg(canvas3.toDataURL('image/png'));
                        }
                    }
                });
                // 给截屏区域添加移动拖拽事件
                $maskSlider.find('.cropper-view-box').off('mousedown').on('mousedown', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    // 获取到最初始的位置
                    var $box = $(this).closest('.square-crop-box'),
                        $mask = $(this).closest('.mask-image-box'),
                        $tool = $box.find('.square-crop-tool'),
                        baseWidth = $mask[0].getBoundingClientRect().width,
                        baseHeight = $mask[0].getBoundingClientRect().height,
                        $view = $(this).children(),
                        boxTop = $box.position().top,
                        boxLeft = $box.position().left,
                        boxWidth = $box[0].getBoundingClientRect().width,
                        boxHeight = $box[0].getBoundingClientRect().height,
                        startX = event.pageX,
                        startY = event.pageY;
                    $(document).on('mousemove.cropper.view.box', function (cropperEvt) {
                        cropperEvt.preventDefault();
                        cropperEvt.stopPropagation();
                        var disX = cropperEvt.pageX - startX,
                            disY = cropperEvt.pageY - startY,
                            top = boxTop + disY,
                            left = boxLeft + disX;
                        // 限定当前拖拽范围
                        if (top < 2) {
                            top = 2;
                        }
                        if (left < 2) {
                            left = 2;
                        }
                        if (boxWidth + left > baseWidth - 2) {
                            left = baseWidth - boxWidth - 2;
                        }
                        if (boxHeight + top > baseHeight - 2) {
                            top = baseHeight - boxHeight - 2;
                        }
                        $box.css({
                            top: top,
                            left: left
                        });
                        $view.css({
                            'margin-top': -top,
                            'margin-left': -left
                        });
                        // 判定操作栏位置
                        if ((top + boxHeight > baseHeight - 50) && top > 50) {
                            $box.prepend($tool.addClass('change'));
                        } else if (top + boxHeight < baseHeight - 50) {
                            $box.append($tool.removeClass('change'));
                        } else if ((top + boxHeight > baseHeight - 50) && top < 50) {
                            $box.append($tool.addClass('change'));
                        }
                    });
                    $(document).on('mouseup.cropper.view.box', function (cropperEvt) {
                        cropperEvt.preventDefault();
                        cropperEvt.stopPropagation();
                        // 更新canvas位置
                        cropImg(canvas1, oMark, canvas3, imgUrl);
                        $(document).off('mousemove.cropper.view.box mouseup.cropper.view.box');
                    });
                });
                // 给截图框边框添加拖拽事件
                $maskSlider.find('.cropper-line').off('mousedown').on('mousedown', function (event) {
                    event.preventDefault();
                    event.stopPropagation();

                    var thisCls = $(this).attr('class'),
                        $box = $(this).closest('.square-crop-box'),
                        $mask = $(this).closest('.mask-image-box'),
                        $tool = $box.find('.square-crop-tool'),
                        baseWidth = $mask[0].getBoundingClientRect().width,
                        baseHeight = $mask[0].getBoundingClientRect().height,
                        $view = $box.find('.cropper-view-img'),
                        boxTop = $box.position().top,
                        boxLeft = $box.position().left,
                        boxWidth = $box[0].getBoundingClientRect().width,
                        boxHeight = $box[0].getBoundingClientRect().height,
                        startX = event.pageX,
                        startY = event.pageY;
                    $(document).on('mousemove.cropper.line', function (cropper) {
                        cropper.preventDefault();
                        cropper.stopPropagation();
                        var disX = cropper.pageX - startX,
                            disY = cropper.pageY - startY,
                            top = boxTop + disY,
                            left = boxLeft + disX,
                            width = boxWidth + disX,
                            height = boxHeight + disY;
                        // 右边界
                        if (thisCls.indexOf('-e') !== -1) {
                            left = boxLeft;
                            if (boxLeft + width > baseWidth - 2) {
                                width = baseWidth - boxLeft - 2;
                            }
                            if (width < 0) {
                                var val = 0;
                                left = boxLeft + width;
                                if (left < 2) {
                                    left = 2;
                                    val = 2 - boxLeft;
                                    width = -val
                                } else {
                                    width = -width;
                                }
                            }
                            $box.css({
                                width: width,
                                left: left
                            });
                            $view.css({
                                'margin-left': -left
                            });
                        }
                        // 上边界
                        if (thisCls.indexOf('-n') !== -1) {
                            height = boxHeight - disY;
                            if (top < 2) {
                                top = 2;
                                height = boxHeight + boxTop - 2;
                            }
                            if (height < 0) {
                                height = -height;
                                top = boxTop + boxHeight;
                                if (top + height > baseHeight) {
                                    height = baseHeight - top - 2;
                                }
                            }
                            $box.css({
                                height: height,
                                top: top
                            });
                            $view.css({
                                'margin-top': -top
                            });
                        }
                        // 左边界
                        if (thisCls.indexOf('-w') !== -1) {
                            width = boxWidth - disX;
                            if (left < 2) {
                                left = 2;
                                width = boxWidth + boxLeft - 2;
                            }
                            if (width < 0) {
                                width = -width;
                                left = boxLeft + boxWidth;
                                if (left + width > baseWidth) {
                                    width = baseWidth - left - 2;
                                }
                            }
                            $box.css({
                                width: width,
                                left: left
                            });
                            $view.css({
                                'margin-left': -left
                            });
                        }
                        // 下边界
                        if (thisCls.indexOf('-s') !== -1) {
                            top = boxTop;
                            if (boxTop + height > baseHeight - 2) {
                                height = baseHeight - boxTop - 2;
                            }
                            if (height < 0) {
                                var val = 0;
                                top = boxTop + height;
                                if (top < 2) {
                                    top = 2;
                                    val = 2 - boxTop;
                                    height = -val
                                } else {
                                    height = -height;
                                }
                            }
                            $box.css({
                                height: height,
                                top: top
                            });
                            $view.css({
                                'margin-top': -top
                            });
                        }
                        // 判定操作栏位置
                        if ((top + height > baseHeight - 50) && top > 50) {
                            $box.prepend($tool.addClass('change'));
                        } else if (top + height < baseHeight - 50) {
                            $box.append($tool.removeClass('change'));
                        } else if ((top + height > baseHeight - 50) && top < 50) {
                            $box.append($tool.addClass('change'));
                        }
                    });
                    $(document).on('mouseup.cropper.line', function (cropper) {
                        cropper.preventDefault();
                        cropper.stopPropagation();
                        // 更新canvas位置
                        cropImg(canvas1, oMark, canvas3, imgUrl);
                        $(document).off('mousemove.cropper.line mouseup.cropper.line');
                    });
                });
                // 给截图框边框四个角落拖拽事件
                $maskSlider.find('.cropper-point').off('mousedown').on('mousedown', function (event) {
                    event.preventDefault();
                    event.stopPropagation();

                    var thisCls = $(this).attr('class'),
                        $box = $(this).closest('.square-crop-box'),
                        $mask = $(this).closest('.mask-image-box'),
                        $tool = $box.find('.square-crop-tool'),
                        baseWidth = $mask[0].getBoundingClientRect().width,
                        baseHeight = $mask[0].getBoundingClientRect().height,
                        $view = $box.find('.cropper-view-img'),
                        boxTop = $box.position().top,
                        boxLeft = $box.position().left,
                        boxWidth = $box[0].getBoundingClientRect().width,
                        boxHeight = $box[0].getBoundingClientRect().height,
                        startX = event.pageX,
                        startY = event.pageY;
                    $(document).on('mousemove.cropper.point', function (point) {
                        point.preventDefault();
                        point.stopPropagation();
                        var disX = point.pageX - startX,
                            disY = point.pageY - startY,
                            top = boxTop + disY,
                            left = boxLeft + disX,
                            width = boxWidth + disX,
                            height = boxHeight + disY;
                        // 右上角
                        if (thisCls.indexOf('-ne') !== -1) {
                            height = boxHeight - disY;
                            left = boxLeft;
                            if (top < 2) {
                                top = 2;
                                height = boxHeight + boxTop - 2;
                            }
                            if (height < 0) {
                                top = boxTop + boxHeight;
                                height = -height;
                                if (top + height > baseHeight - 2) {
                                    height = baseHeight - 2 - top;
                                }
                            }
                            if (left + width > baseWidth - 2) {
                                width = baseWidth - 2 - left;
                            }
                            if (width < 0) {
                                left = boxLeft + width;
                                width = -width;
                                if (left < 2) {
                                    left = 2;
                                    width = boxLeft - 2;
                                }
                            }
                            $box.css({
                                width: width,
                                left: left,
                                top: top,
                                height: height
                            });
                            $view.css({
                                'margin-left': -left,
                                'margin-top': -top
                            });
                        }
                        // 左上角
                        if (thisCls.indexOf('-nw') !== -1) {
                            height = boxHeight - disY;
                            width = boxWidth - disX;
                            if (top < 2) {
                                top = 2;
                                height = boxTop + boxHeight - 2;
                            }
                            if (left < 2) {
                                left = 2;
                                width = boxLeft + boxWidth - 2;
                            }
                            if (height < 0) {
                                height = -height;
                                top = boxTop + boxHeight;
                                if (height > baseHeight - boxTop - boxHeight - 2) {
                                    height = baseHeight - boxTop - boxHeight - 2
                                }
                            }
                            if (width < 0) {
                                width = -width;
                                left = boxLeft + boxWidth;
                                if (width > baseWidth - boxLeft - boxWidth - 2) {
                                    width = baseWidth - boxLeft - boxWidth - 2
                                }
                            }
                            $box.css({
                                width: width,
                                left: left,
                                top: top,
                                height: height
                            });
                            $view.css({
                                'margin-left': -left,
                                'margin-top': -top
                            });
                        }
                        // 左下角
                        if (thisCls.indexOf('-sw') !== -1) {
                            width = boxWidth - disX;
                            top = boxTop;
                            if (left < 2) {
                                left = 2;
                                width = boxWidth + boxLeft - 2;
                            }
                            if (width < 0) {
                                left = boxLeft + boxWidth;
                                width = -width;
                                if (left + width > baseWidth - 2) {
                                    width = baseWidth - 2 - left;
                                }
                            }
                            if (top + height > baseHeight - 2) {
                                height = baseHeight - 2 - top;
                            }
                            if (height < 0) {
                                top = boxTop + height;
                                height = -height;
                                if (top < 2) {
                                    top = 2;
                                    height = boxTop - 2;
                                }
                            }
                            $box.css({
                                width: width,
                                left: left,
                                top: top,
                                height: height
                            });
                            $view.css({
                                'margin-left': -left,
                                'margin-top': -top
                            });
                        }
                        // 右下角
                        if (thisCls.indexOf('-se') !== -1) {
                            top = boxTop;
                            left = boxLeft;
                            if (height + top > baseHeight - 2) {
                                height = baseHeight - 2 - top;
                            }
                            if (left + width > baseWidth - 2) {
                                width = baseWidth - 2 - left;
                            }
                            if (height < 0) {
                                height = -height;
                                top = boxTop - height;
                                if (top < 2) {
                                    top = 2;
                                    height = boxTop - 2;
                                }
                            }
                            if (width < 0) {
                                width = -width;
                                left = boxLeft - width;
                                if (left < 2) {
                                    left = 2;
                                    width = boxLeft - 2;
                                }
                            }
                            $box.css({
                                width: width,
                                left: left,
                                top: top,
                                height: height
                            });
                            $view.css({
                                'margin-left': -left,
                                'margin-top': -top
                            });
                        }
                        // 判定操作栏位置
                        if ((top + height > baseHeight - 50) && top > 50) {
                            $box.prepend($tool.addClass('change'));
                        } else if (top + height < baseHeight - 50) {
                            $box.append($tool.removeClass('change'));
                        } else if ((top + height > baseHeight - 50) && top < 50) {
                            $box.append($tool.addClass('change'));
                        }
                    });
                    $(document).on('mouseup.cropper.point', function (point) {
                        point.preventDefault();
                        point.stopPropagation();
                        // 更新canvas位置
                        cropImg(canvas1, oMark, canvas3, imgUrl);
                        $(document).off('mousemove.cropper.point mouseup.cropper.point');
                    });
                });
                // 判定拖拽位置
                var $tool = $maskSlider.find('.square-crop-box').find('.square-crop-tool');
                if ((top + height > limitHeight - 50) && top > 50) {
                    $maskSlider.find('.square-crop-box').prepend($tool.addClass('change'));
                } else if (top + height < limitHeight - 50) {
                    $maskSlider.find('.square-crop-box').append($tool.removeClass('change'));
                } else if ((top + height > limitHeight - 50) && top < 50) {
                    $maskSlider.find('.square-crop-box').append($tool.addClass('change'));
                }
            }
            $(document).off('mousemove.mask. mouseup.mask');
        })
    });
    $('#mapMask').find('.swiper-slide-active').find('.mask-loading-box').addClass('hide');
    hideLoading($('#mapMask').find('.swiper-slide-active').find('.mask-loading-box'));

    //弹窗查看大图和比对图片切换事件
    $("#mapMask").find('.changeImgSearch').off().on('click', function () {
        var bUrl = $(this).parent().find(".image-flex-list.clearfix>.image-box-flex").eq(1).find(".img").data("bUrl");
        var sUrl = $(this).parent().find(".image-flex-list.clearfix>.image-box-flex").eq(1).find(".img").data("sUrl");
        if (!$(this).hasClass("disabled")) {
            if ($(this).html() == '横向比对') {
                $(this).html("查看大图");
                var html = `<div class="image-box-flex">                   
                                <span class="image-tag">检索图片</span>
                                <div class="iviewer_cursor image1"></div>                            
                            </div>
                            <div class="image-box-flex">                   
                                <span class="image-tag">抓拍图片</span>  
                                <div class="iviewer_cursor image2"></div>                               
                            </div>`;
                $(this).parents(".swiper-slide.swiper-slide-active").find(".mask-image-contrast").html(html);
                $(this).parents(".swiper-slide.swiper-slide-active").find(".mask-image-box").addClass("hide");
                $(this).parents(".swiper-slide.swiper-slide-active").find(".mask-image-contrast").removeClass("hide");

                var src1 = $(this).parent().find(".image-flex-list.clearfix>.image-box-flex").eq(0).find(".img").attr("src"),
                    src2 = $(this).parent().find(".image-flex-list.clearfix>.image-box-flex").eq(1).find(".img").attr("src");
                $(".iviewer_cursor.image1").iviewer({
                    src: src1
                });
                $(".iviewer_cursor.image2").iviewer({
                    src: src2
                });

                $(this).parent().find(".image-flex-list.clearfix.control-imge-list>.image-box-flex").eq(1).find("img").attr('src', bUrl);
            } else {
                $(this).html("横向比对");
                $(this).parents(".swiper-slide.swiper-slide-active").find(".mask-image-box").removeClass("hide");
                $(this).parents(".swiper-slide.swiper-slide-active").find(".mask-image-contrast").addClass("hide");

                $(this).parent().find(".image-flex-list.clearfix.control-imge-list>.image-box-flex").eq(1).find("img").attr('src', sUrl);
            }
        }
    });

    //1:1比对
    $("#mapMask").find('.onetooneSearch').off().on('click', function () {
        var src1 = $(this).parent().find(".image-flex-list.clearfix>.image-box-flex").eq(0).find(".img").attr("src"),
            src2 = $(this).parent().find(".image-flex-list.clearfix>.image-box-flex").eq(1).find(".img").attr("src");

        commonOnetooneSearch(src1, src2);
    });
}

// 监听地图传来的数据
window.addEventListener("message", function (ev) {
    var mydata = ev.data,
        $sideBar = $('#pageSidebarMenu').find('.aui-icon-carsearch2'),
        $item = $sideBar.closest('.sidebar-item');
    var isSearchMap = false,
        map_iframe = 'map_iframe_pathDynamic';
    if ($('#pageSidebarMenu').find('.aui-icon-carsearch2').parents(".sidebar-item").hasClass("active")) {
        isSearchMap = true,
            map_iframe = 'map_iframe_path';
    } else if ($('#pageSidebarMenu').find('.aui-icon-monitor').parents(".sidebar-item").hasClass("active")) {
        isSearchMap = true,
            map_iframe = 'map_iframe_pathDynamic';
    } else if ($('#pageSidebarMenu').find('.aui-icon-library').parents(".sidebar-item").hasClass("active")) {
        isSearchMap = true,
            map_iframe = 'map_iframe_pathTemperature';
    }
    if (mydata !== 'initMap' && mydata !== 'initMap?' && mydata !== 'initMap?44031' && $('.image-card-img').length > 0 && $('#saveNode').length == 0 && isSearchMap) {
        if (mydata.imgs && mydata.imgs.length > 0) {
            mydata.type = 'search';
            createImgMask(mydata);
        }
        // mydata.type = 'search';
        // if (mydata.state == null || (mydata.imgs && mydata.imgs.length == 1)) {
        //     createImgMask(mydata);
        //     if (mydata.imgs.length > 1) {
        //         mydata.imgs.forEach(function (item) {
        //             $('#auiTimeLine').find('.image-box[imgguid = "' + item.imgData + '"]').addClass('select');
        //         });
        //     }
        // } else if (mydata.state == 1) {
        //     mydata.imgs.forEach(function (item) {
        //         $('#auiTimeLine').find('.image-box[imgguid = "' + item.imgData + '"]').addClass('select');
        //     });
        // } else if (mydata.state == 0) {
        //     mydata.imgs.forEach(function (item) {
        //         $('#auiTimeLine').find('.image-box[imgguid = "' + item.imgData + '"]').removeClass('select');
        //     });
        // }
    }
    var searchMapIframe = document.getElementById(map_iframe);
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
});