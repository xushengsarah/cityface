var mapVideoFun = (function (window, $) {
    var settings = {
        type: $(".map-new-popup").data("type"),
        mapId: $(".map-new-popup").data("mapId"),
        faceData: {  //抓拍图参数
            page: '1'
        },
        heartbeat: '',  //心跳请求定时器
        mapVideo: '',  //播放器实例
        currentTime: 0, //播放了多久的视频
        flag60: true,  //播放60秒预请求下一个视频
        stopVideo: false,
        dropProgress: false,  //是否拖动进度条标志
        realTimeHeart: '', //实时视频抓拍图和告警心跳
        hls: '', //hls实例等到结束播放时要销毁
        requestStart: '',  //把视频的开始请求放到一个变量里，因为这个请求返回很慢，如果操作频繁会导致关闭之后还执行回调
        nextTime: 1000 * 60 * 60
    };
    initMapVideo();
    //初始化
    function initMapVideo() {
        $("#mapVideoEndTime").val(timeVideoToTime(new Date().getTime()).date);
        $("#mapVideoStartTime").val(timeVideoToTime(new Date().getTime() - (parseInt(mapVideoHistoryMaxTime) * 60 * 60 * 1000)).date);
        settings.faceData.startTime = $("#mapVideoStartTime").val();
        settings.faceData.endTime = $("#mapVideoEndTime").val();
        var type = $(".map-new-popup").data("type");
        switch (type) {
            //实时监控只有镜头列表和播放器（不可选择时间）
            case 'playVideos':
                $(".map-video .card-title").html("实时监控");
                $(".map-video").css("width", "50%");
                $(".map-video .popup-body-video").addClass("aui-col-18").removeClass("aui-col-12");
                $(".map-video .popup-body-alarm").addClass("hide");
                $(".map-video .popup-body-face").addClass("hide");
                break;
            //实时监控和抓拍图
            case 'playAndCatch':
                $(".map-video .card-title").html("实时监控和抓拍图");
                loadEmpty($("#popup-body-face-cntList"), '暂无抓拍图', '');
                loadEmpty($("#popup-body-alarm-cntList"), '暂无告警', '');
                break;
            //录像回放（可以选择时间）
            case 'replayVideo':
                $(".map-video .card-title").html("录像回放");
                $(".map-video .popup-body-alarm").addClass("hide");
                $(".map-video .popup-body-face").addClass("hide");
                $(".map-video").css("width", "50%");
                $(".map-video .popup-body-video").addClass("aui-col-18").removeClass("aui-col-12");
                $(".map-video .popup-body-camera-time").removeClass("hide").css({
                    height: '25%'
                });
                $(".map-video .popup-body-camera-cnt").css({
                    height: 'calc(75% - 2.5rem)'
                });
                break;
            //历史抓拍图
            case 'hisCatch':
                $(".map-video .card-title").html("历史抓拍图");
                $(".map-video .popup-body-alarm").addClass("hide");
                $(".map-video .popup-body-video").addClass("hide");
                $(".map-video .popup-body-face").removeClass('aui-col-24').addClass('aui-col-18');
                $(".map-video .popup-body-camera-time").removeClass("hide").css({
                    height: '15%'
                });
                $(".map-video .popup-body-camera-cnt").css({
                    height: 'calc(85% - 3rem)'
                });
                $(".popup-body-face-cntList").css({
                    maxHeight: '36rem'
                });
                $(".map-video .popup-body-camera").css("height", "40rem");
                $(".map-video .popup-body-face").css("height", "40rem");
                break;
            //录像回放和抓拍图
            case 'videoReplayAndHisCatch':
                $(".map-video .card-title").html("录像回放和抓拍图");
                $(".map-video").css("width", "50%");
                $(".map-video .popup-body-video").addClass("aui-col-18").removeClass("aui-col-12");
                $(".map-video .popup-body-alarm").addClass("hide");
                $(".map-video .popup-body-camera-time").removeClass("hide").css({
                    height: '25%'
                });
                $(".map-video .popup-body-camera-cnt").css({
                    height: 'calc(75% - 2.5rem)'
                });
                $(".popup-body-face-cntList").css({
                    maxHeight: '20rem'
                });
                $(".map-video .popup-body-camera").css("height", "25rem");
                $(".map-video .popup-body-face").css("height", "23rem");
                break;
        }
    }

    //获取抓拍图
    function getMapVideoFace(first) {
        var $cardContent = $('.popup-body-face'),
            port = 'v2/faceDt/peopleSearch',
            option = {
                threshold: '90', // 阈值
                startTime: settings.faceData.startTime, // 开始时间
                endTime: settings.faceData.endTime, // 结束时间
                cameraIds: [settings.faceData.cameraId], // 摄像头id
                searchType: '0',
                sort: 2,
                page: settings.faceData.page ? settings.faceData.page : '1', // 当前页
                size: settings.faceData.size
            },
            successFunc = function (data) {
                hideLoading($cardContent);
                if (data.code === '200') {
                    var result = data.data,
                        list = result.list,
                        html = '';
                    if (list.length > 0) {
                        for (var i = 0; i < list.length; i++) {
                            html += `<li class="image-card-wrap type-5 onecj" cameraId="${list[i].cameraId}">
                                            <div class="image-card-box img-right-event">
                                                <img class="image-card-img" guid="${list[i].picId}" src="${list[i].smallPicUrl}" position="position" alt="">
                                            </div>
                                            <div class="image-card-message-box">
                                                <p class="image-card-message-time">${list[i].captureTime}</p>
                                            </div>
                                        </li>`;
                        }
                        $("#popup-body-face-cntList").html(html);

                        $("#popup-body-face-cntList").find("li").each(function (index, el) {
                            $(el).data('listData', list[index]);
                        });

                        if ($("#popup-body-face-cntList").parent().find('.pagination-wrap').length == 0) {
                            var paginationHtml = `<div class="pagination-wrap">
                                                        <ul class="pagination" id=popup-body-face-pagination></ul>
                                                    </div>`
                            $("#popup-body-face-cntList").parent().append(paginationHtml);
                        }
                        //分页
                        var $paginationTime = $('#popup-body-face-pagination');
                        if (result.totalPage == '0' || result.totalPage == '1') {
                            $paginationTime.closest('.pagination-wrap').remove();
                        }
                        if (first && result.total > Number(settings.faceData.size)) {
                            var eventCallBack = function (currPage, pageSize) {
                                settings.faceData.page = currPage;
                                settings.faceData.size = pageSize;
                                getMapVideoFace();
                            }
                            if (settings.faceData.size == '16') {
                                var pageSizeOpt = [{
                                    value: 16,
                                    text: '16/页'
                                }, {
                                    value: 32,
                                    text: '32/页',
                                }];
                            } else {
                                var pageSizeOpt = [{
                                    value: 32,
                                    text: '32/页'
                                }, {
                                    value: 64,
                                    text: '64/页',
                                }];
                            }
                            setPageParams($paginationTime, result.total, result.totalPage, eventCallBack, true, pageSizeOpt);
                            $('#popup-body-face-cntList').closest('.pagination-wrap').removeClass('display-none').find('.pagination-result-number').text(result.total);
                        }
                    } else {
                        $("#popup-body-face-cntList").parent().find('.pagination-wrap').remove();
                        loadEmpty($("#popup-body-face-cntList"), '暂无抓拍图', '');
                    }
                } else {
                    $("#popup-body-face-cntList").parent().find('.pagination-wrap').remove();
                    loadEmpty($("#popup-body-face-cntList"), '暂无抓拍图', data.message);
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, option, successFunc);
        showLoading($cardContent);
    };

    //镜头列表删除按钮点击事件
    $("#popup-body-camera-cntList").on('click', ".aui-icon-not-through", function (e) {
        e.preventDefault();
        e.stopPropagation();
        // 清除节点
        $(this).parent().remove();
        if ($(this).parent().hasClass("active")) {
            $("#popup-body-camera-cntList").find("li").eq(0).click();
        }
        var $cameraIDList = $('#popup-body-camera-cntList');
        // 判定当前是否最后一个数据给与空数据显示
        var listItemLen = $cameraIDList.children().length;
        if (listItemLen > 0) {
            $cameraIDList.closest('.multiPickerSelect_cnt').find('.multiPickerDlg_no_result').hide();
            $cameraIDList.closest('.multiPickerSelect_cnt').find('.multiPickerDlg_right_no_result').hide();
        } else {
            $cameraIDList.closest('.multiPickerSelect_cnt').find('.multiPickerDlg_no_result').show();
            $cameraIDList.closest('.multiPickerSelect_cnt').find('.multiPickerDlg_right_no_result').show();
        };
        // 删除容器中绑定数据的对应数据
        var index = $(this).parent().attr("cameraid");
        var saveData = $cameraIDList.data('saveData') ? $cameraIDList.data('saveData') : [];
        for (var i = 0; i < saveData.length; i++) {
            if (index === saveData[i].id) {
                saveData.splice(i, 1);
            }
        }
        $cameraIDList.data({
            'saveData': saveData
        });
        var iframe = document.getElementById(settings.mapId);
        deleteCameraSelect(iframe, [index]); // 删除地图上的已选中摄像头
        // 设置文字信息
        var listItemLen = $cameraIDList.children().length;
        $cameraIDList.closest('.popup-body-camera').find('#popup-body-camera-title-num').text(`(${listItemLen})`);
        if (listItemLen == 0) {
            loadEmpty($("#popup-body-camera-cntList"), '请框选镜头', '');
        }
    });

    //镜头列表点击事件
    $("#popup-body-camera-cntList").on('click', "li", function () {
        $(this).addClass("active").siblings().removeClass("active");
        //如果有视频播放每点击一个列表都执行当前播放的关闭事件
        switch (settings.type) {
            //实时监控只有镜头列表和播放器（不可选择时间）
            case 'playVideos':
                if ($("#map-video-warp").attr("sessionid")) {
                    $("#mapVideoStop").click();
                }
                $("#map-video-warp").attr("sessionid", "");
                $("#mapVideoPlay").addClass("hide");
                $("#mapVideoPause").addClass("hide");
                $("#map-video-progress").addClass("hide");
                $("#map-video-timer").addClass("hide");
                settings.faceData.cameraId = $(this).attr('cameraId');
                getMapVideoPlay(true);
                break;
            //实时监控和抓拍图实时监控和抓拍图
            case 'playAndCatch':
                if ($("#map-video-warp").attr("sessionid")) {
                    $("#mapVideoStop").click();
                }
                //实时视频和抓拍图要清空定时器
                if ($("#map-video-warp").attr('realTimeHeart') == '1') {
                    getMapVideoPushHeartEnd();
                }
                $("#map-video-progress").addClass("hide");
                $("#map-video-timer").addClass("hide");
                $("#mapVideoPlay").addClass("hide");
                $("#mapVideoPause").addClass("hide");
                settings.faceData.cameraId = $(this).attr('cameraId');
                getMapVideoPlay(true);
                //告警和抓拍图推送
                getMapVideoPush();
                break;
            //录像回放（可以选择时间）
            case 'replayVideo':
                //当前有视频在播放先调用停止播放接口
                if ($("#map-video-warp").attr("sessionid")) {
                    $("#mapVideoStop").click();
                }
                //置空id
                $("#map-video-warp").attr("sessionid", "");

                var startTime = timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8).videoTime,
                    endTime = timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8 + settings.nextTime).videoTime;
                if ((new Date(settings.faceData.endTime).getTime() - new Date(settings.faceData.startTime).getTime()) < settings.nextTime) {
                    //不到两个小时存放实际结束时间
                    $("#map-video-warp").data({
                        startTime: timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8).date,
                        endTime: timeVideoToTime(new Date(settings.faceData.endTime).getTime() - 1000 * 60 * 60 * 8).date
                    });
                } else {
                    $("#map-video-warp").data({
                        startTime: timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8).date,
                        endTime: timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8 + settings.nextTime).date
                    });
                }
                settings.faceData.cameraId = $(this).attr('cameraId');
                //清空已播放的时间
                settings.currentTime = 0;
                getMapVideoPlay(true, '1', startTime, endTime);
                break;
            //历史抓拍图
            case 'hisCatch':
                settings.faceData.page = '1';
                settings.faceData.size = '32';
                settings.faceData.cameraId = $(this).attr('cameraId');
                getMapVideoFace(true);
                break;
            //录像回放和抓拍图
            case 'videoReplayAndHisCatch':
                if ($("#map-video-warp").attr("sessionid")) {
                    $("#mapVideoStop").click();
                }
                $("#map-video-warp").attr("sessionid", "");
                settings.faceData.page = '1';
                settings.faceData.size = '16';
                settings.faceData.cameraId = $(this).attr('cameraId');
                var startTime = timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8).videoTime,
                    endTime = timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8 + settings.nextTime).videoTime;
                if ((new Date(settings.faceData.endTime).getTime() - new Date(settings.faceData.startTime).getTime()) < settings.nextTime) {
                    //不到两个小时存放实际结束时间
                    $("#map-video-warp").data({
                        startTime: timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8).date,
                        endTime: timeVideoToTime(new Date(settings.faceData.endTime).getTime() - 1000 * 60 * 60 * 8).date
                    });
                } else {
                    $("#map-video-warp").data({
                        startTime: timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8).date,
                        endTime: timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8 + settings.nextTime).date
                    });
                }
                //清空已播放的时间
                settings.currentTime = 0;
                getMapVideoFace(true);
                getMapVideoPlay(true, '1', startTime, endTime);
                break;
        }
    });

    //搜索按钮点击事件
    $("#popup-body-camera-time-search").on("click", function () {
        //抓拍图
        if (settings.type == 'hisCatch') {
            settings.faceData.page = '1';
            settings.faceData.size = '32';
            settings.faceData.startTime = $("#mapVideoStartTime").val();
            settings.faceData.endTime = $("#mapVideoEndTime").val();
            getMapVideoFace(true);
        } else if (settings.type == 'videoReplayAndHisCatch') {
            //搜索时间间隔大于10秒小于定义的小时
            if (!$("#popup-body-camera-time-search").hasClass("disabled")
                && ((new Date($("#mapVideoEndTime").val()).getTime() - new Date($("#mapVideoStartTime").val()).getTime()) > 10000)
                && ((new Date($("#mapVideoEndTime").val()).getTime() - new Date($("#mapVideoStartTime").val()).getTime()) <= (parseInt(mapVideoHistoryMaxTime) * 60 * 60 * 1000))) {
                if ($("#map-video-warp").attr("sessionid")) {
                    $("#mapVideoStop").click();
                }
                $("#map-video-warp").attr("sessionid", "");

                settings.faceData.startTime = $("#mapVideoStartTime").val();
                settings.faceData.endTime = $("#mapVideoEndTime").val();
                //录像回放和抓拍图
                settings.faceData.page = '1';
                settings.faceData.size = '16';
                getMapVideoFace(true);
                //清空已播放的时间
                settings.currentTime = 0;

                var startTime = timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8).videoTime,
                    endTime = timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8 + settings.nextTime).videoTime;
                if ((new Date(settings.faceData.endTime).getTime() - new Date(settings.faceData.startTime).getTime()) < settings.nextTime) {
                    //不到两个小时存放实际结束时间
                    $("#map-video-warp").data({
                        startTime: timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8).date,
                        endTime: timeVideoToTime(new Date(settings.faceData.endTime).getTime() - 1000 * 60 * 60 * 8).date
                    });
                } else {
                    $("#map-video-warp").data({
                        startTime: timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8).date,
                        endTime: timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8 + settings.nextTime).date
                    });
                }
                getMapVideoPlay(true, '1', startTime, endTime);
            } else {
                warningTip.say(`时间间隔要大于10秒,小于${mapVideoHistoryMaxTime}小时`);
            }
        } else if (settings.type == 'replayVideo') { //录像回放
            //搜索时间间隔大于10秒小于定义的小时
            if (!$("#popup-body-camera-time-search").hasClass("disabled")
                && ((new Date($("#mapVideoEndTime").val()).getTime() - new Date($("#mapVideoStartTime").val()).getTime()) > 10000)
                && ((new Date($("#mapVideoEndTime").val()).getTime() - new Date($("#mapVideoStartTime").val()).getTime()) < (parseInt(mapVideoHistoryMaxTime) * 60 * 60 * 1000))) {
                if ($("#map-video-warp").attr("sessionid")) {
                    $("#mapVideoStop").click();
                }
                $("#map-video-warp").attr("sessionid", "");

                settings.faceData.startTime = $("#mapVideoStartTime").val();
                settings.faceData.endTime = $("#mapVideoEndTime").val();
                //清空已播放的时间
                settings.currentTime = 0;

                var startTime = timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8).videoTime,
                    endTime = timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8 + settings.nextTime).videoTime;
                if ((new Date(settings.faceData.endTime).getTime() - new Date(settings.faceData.startTime).getTime()) < settings.nextTime) {
                    //不到两个小时存放实际结束时间
                    $("#map-video-warp").data({
                        startTime: timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8).date,
                        endTime: timeVideoToTime(new Date(settings.faceData.endTime).getTime() - 1000 * 60 * 60 * 8).date
                    });
                } else {
                    $("#map-video-warp").data({
                        startTime: timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8).date,
                        endTime: timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8 + settings.nextTime).date
                    });
                }
                getMapVideoPlay(true, '1', startTime, endTime);
            } else {
                warningTip.say(`时间间隔要大于10秒,小于${mapVideoHistoryMaxTime}小时`);
            }
        }
    });

    // 抓拍图点击展开大图
    $('#mapVideoPage').on('click', '.popup-body-face-cntList .image-card-box', function (e) {
        var $this = $(this), // 图片
            $showBigImgDom = $this.closest('.popup-body-face-cntList'), // 当前检索类型的容器
            showBigImgId = $showBigImgDom.attr('id'), // 各检索类型容器id
            thisIndex = $this.closest('.image-card-wrap').index(); // 图片索引
        if (settings.type != 'playAndCatch') {
            //$('#popup-body-face-cntList')随便给的一个容器
            createBigImgMask($showBigImgDom, showBigImgId, thisIndex, $('#popup-body-face-cntList'), e);
        } else {
            //实时抓拍图弹窗
            createBigImgMask($showBigImgDom, showBigImgId, thisIndex, $('#popup-body-face-cntList'), e);
        }
    });

    // 告警查看大图点击事件
    $('#mapVideoPage').on('click', '#popup-body-alarm-cntList .warning-item', function (evt) {
        var $alarm = $(this).parent(),
            alarmId = $alarm.attr('id'),
            index = $(this).index(),
            listData = $(this).data('listData');
        listData.bigHttpUrl = listData.imagehttpurl;
        listData.smallHttpUrl = listData.facehttpurl;
        window.createBigImgMask($alarm, alarmId, index, $('#usearchImg'), evt, {
            cardImg: $(this),
            data: listData,
            html: $(changeAlarmMaskHtml(listData))
            //html:$(window.commonMaskRight(2,listData))   //2位为告警弹窗右侧信息，第二个参数为data
        });
    });
    /************************************************自定义播放器开始*********************************************/
    // 全屏                     
    function requestFullscreen(ele) {
        // 全屏兼容代码
        if (ele.requestFullscreen) {
            ele.requestFullscreen();
        } else if (ele.webkitRequestFullscreen) {
            ele.webkitRequestFullscreen();
        } else if (ele.mozRequestFullScreen) {
            ele.mozRequestFullScreen();
        } else if (ele.msRequestFullscreen) {
            ele.msRequestFullscreen();
        }
    }

    /**
     * 公共时间格式获取方法(毫秒数)
     * @param {number} timestamp 毫秒数
     */
    function timeVideoToTime(timestamp) {
        var date = new Date(parseInt(timestamp));//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

        var YV = date.getFullYear();
        var MV = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
        var DV = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var hv = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
        var mv = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
        var sv = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        return { 'date': Y + M + D + ' ' + h + m + s, 'stamp': Date.parse(date), 'videoTime': YV + MV + DV + hv + mv + sv };
    };

    /**
     * 时间格式化(历史视频播放时长和总时长)
     * @param {number} seconds 分钟数 
     */
    function timer(seconds) {
        var hours = Math.floor(seconds / 3600) < 10 ? ('0' + Math.floor(seconds / 3600)) : Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds - hours * 3600) / 60) < 10 ? ('0' + Math.floor((seconds - hours * 3600) / 60)) : Math.floor((seconds - hours * 3600) / 60);
        var seconds = Math.floor(seconds - hours * 3600 - minutes * 60) < 10 ? ('0' + Math.floor(seconds - hours * 3600 - minutes * 60)) : Math.floor(seconds - hours * 3600 - minutes * 60);
        if (hours != '00') {
            return hours + ':' + minutes + ':' + seconds
        } else {
            return minutes + ':' + seconds
        }
    }

    /**
     * 开始视频请求
     * @param {boolean} first 是否重置播放器
     * @param {string} type 类型type=1是历史
     * @param {string} startTime 历史需要开始时间
     * @param {string} endTime 历史需要结束时间
     * @param {number} count 请求失败计时
     */
    function getMapVideoPlay(first, type, startTime, endTime, count) {
        //只有第一次加载时要转圈
        if (first) {
            showLoading($("#map-video-warp"));
            //不可点击搜索按钮和列表事件无效等到当前视频返回后在放开
            $("#popup-body-camera-time-search").addClass("disabled");
            showLoading($(".popup-body-camera"));
        }
        settings.requestStart = $.ajax({
            url: 'http://190.15.117.242:8016/h5Stream/xhwebvideo.xhrtmp',
            type: 'GET',
            timeout: 30000,
            async: true,
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            data: {
                cmd: 'start',
                platform: 'pc',
                cameraid: settings.faceData.cameraId,
                type: type == '1' ? 'playback' : 'realplay',
                userid: $.cookie('xh_userId'),
                starttime: startTime,
                endtime: endTime,
                random: Math.random()
            },
            success: function (data) {
                $("#map-video-warp").data("requestStart", '');
                hideLoading($("#map-video-warp"));
                hideLoading($(".popup-body-camera"));
                $("#popup-body-camera-time-search").removeClass("disabled");
                if (data.result == '0') {
                    if ($(".map-new-popup").children().length != 0) {
                        $("#mapVideoControls").removeClass("hide");
                        $("#mapVideoEnd").addClass("hide");
                        settings.flag60 = true;
                        settings.stopVideo = true;

                        if (first) {
                            // var html = `<video id="mapVideo" class="video-js popup-body-video-play" controls preload="auto">
                            //             <source src=${data.flvUrl} type="application/x-mpegURL">
                            //             <p class="vjs-no-js"> To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>
                            //         </video>`
                            var html = `<video id="mapVideo" class="video-js popup-body-video-play" controls preload="auto">
                                        <source src=${data.flvUrl} type="video/x-flv">                
                                        <p class="vjs-no-js"> To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>
                                        </video>`
                            $("#map-video-warp").find(".video").html(html);
                            //把sessionid存起来用于区分
                            $("#map-video-warp").attr("sessionid", data.sessionid);
                            //videojs.options.flash.swf = "./video-js.swf";
                            settings.mapVideo = videojs('mapVideo', {
                                techOrder: ["html5", "flvjs"],
                                flvjs: {
                                    mediaDataSource: {
                                        isLive: true,
                                        cors: true,
                                        withCredentials: false
                                    }
                                },
                                autoplay: true
                            }, function onPlayerReady() {
                                settings.mapVideo.on("play", function () {
                                    if (type == '1') {
                                        $("#mapVideoPause").removeClass("hide");
                                        $("#mapVideoPlay").addClass("hide");
                                    }
                                });
                                settings.mapVideo.on("pause", function () {
                                    if (type == '1') {
                                        $("#mapVideoPlay").removeClass("hide");
                                        $("#mapVideoPause").addClass("hide");
                                    }
                                });
                                settings.mapVideo.on("timeupdate", function () {
                                    if (type == '1') {
                                        //拖动进度条的时候不变
                                        if (!settings.dropProgress) {
                                            var currentTime = settings.currentTime + settings.mapVideo.currentTime();
                                            var duration = (new Date(settings.faceData.endTime).getTime() - new Date(settings.faceData.startTime).getTime()) / 1000;
                                            var percent = currentTime / duration * 100;
                                            $("#mapVideoCurrentTime").html(timer(currentTime));
                                            $("#mapVideoDuration").html(timer(duration));
                                            document.getElementById("mapVideoTimrBar").style.width = percent + "%";
                                            $("#timeBarCircle").css({
                                                left: percent + '%'
                                            })
                                        }

                                        //时间间隔小于2分钟时到了那个时间点关闭播放
                                        if (new Date(settings.faceData.endTime).getTime() - 1000 * 60 * 60 * 8 == new Date($("#map-video-warp").data("endTime")).getTime() && settings.stopVideo) {
                                            if (((new Date($("#map-video-warp").data("endTime")).getTime() - new Date($("#map-video-warp").data("startTime")).getTime()) / 1000) <= Math.floor(settings.mapVideo.currentTime())) {
                                                settings.stopVideo = false;
                                                $("#mapVideoStop").click();
                                            }
                                        } else {
                                            //视频播放到一分钟的时候请求下一个
                                            // if (Math.floor(settings.mapVideo.currentTime()) == 60*60 && settings.flag60) {
                                            //     settings.flag60 = false;
                                            //     if (new Date(settings.faceData.endTime).getTime() - 1000 * 60 * 60 * 8 > new Date($("#map-video-warp").data("endTime")).getTime()) {
                                            //         //下一个视频的开始时间就是上一段的结束时间
                                            //         var startTime = timeVideoToTime(new Date($("#map-video-warp").data("endTime")).getTime()).videoTime;
                                            //         var endTime = timeVideoToTime(new Date($("#map-video-warp").data("endTime")).getTime() + settings.nextTime).videoTime;
                                            //         //console.log(123);
                                            //         //请求下一段历史视频
                                            //         getMapVideoPlay(false, '1', startTime, endTime, 0);
                                            //     }
                                            // }
                                        }
                                    }
                                });
                                settings.mapVideo.on("ended", function () {
                                    if (type == '1') {
                                        //最后一个视频播放完毕
                                        if ((new Date(settings.faceData.endTime).getTime() - 1000 * 60 * 60 * 8) == new Date($("#map-video-warp").data("endTime")).getTime()) {
                                            $("#mapVideoStop").click();
                                        } else {
                                            //如果输入框的结束时间和发送的时间对比小于2分钟，不用存起来否则以2分钟为准,，每次切换的视频的时候都把当前视频开始和结束时间存起来
                                            if (new Date(settings.faceData.endTime).getTime() - 1000 * 60 * 60 * 8 - new Date($("#map-video-warp").data("endTime")).getTime() > settings.nextTime) {
                                                //将发送的开始和结束时间存起来
                                                $("#map-video-warp").data({
                                                    startTime: timeVideoToTime(new Date($("#map-video-warp").data("endTime")).getTime()).date,
                                                    endTime: timeVideoToTime(new Date($("#map-video-warp").data("endTime")).getTime() + settings.nextTime).date
                                                })
                                            } else {
                                                //结束时间就是输入框的结束时间
                                                $("#map-video-warp").data({
                                                    startTime: timeVideoToTime(new Date($("#map-video-warp").data("endTime")).getTime()).date,
                                                    endTime: timeVideoToTime(new Date(settings.faceData.endTime).getTime() - 1000 * 60 * 60 * 8).date
                                                })
                                            }
                                            //切换下一个视频
                                            settings.currentTime = settings.currentTime + settings.mapVideo.currentTime();
                                            settings.mapVideo.src([{ type: "video/x-flv", src: $("#map-video-warp").data("nexturl") }]);
                                            settings.mapVideo.play();
                                            clearInterval(settings['history_' + $("#map-video-warp").attr("sessionid")]);
                                            delete settings['history_' + $("#map-video-warp").attr("sessionid")];
                                            $("#map-video-warp").attr("sessionid", $("#map-video-warp").data("nextsession"));
                                            // if (Hls.isSupported()) {
                                            //     
                                            //     settings.hls = new Hls();
                                            //     settings.hls.loadSource($("#map-video-warp").data("nexturl"));
                                            //     settings.hls.attachMedia(video);
                                            //     settings.hls.on(Hls.Events.MANIFEST_PARSED, function () {
                                            //         settings.mapVideo.play();
                                            //     })
                                            // }
                                        }
                                    }
                                });
                            })
                            // if (Hls.isSupported()) {
                            //     var video = document.getElementById("mapVideo");
                            //     settings.hls = new Hls();
                            //     settings.hls.loadSource(data.hlsUrl);
                            //     settings.hls.attachMedia(video);
                            //     settings.hls.on(Hls.Events.MANIFEST_PARSED, function () {
                            //         settings.mapVideo.play();
                            //     })
                            // }
                        } else {
                            $("#map-video-warp").data({
                                "nexturl": data.flvUrl,
                                "nextsession": data.sessionid
                            });
                        }

                        //历史视频的时候
                        if (type == '1') {
                            //执行历史心跳请求以‘history’加sessionid为key存在全局变量
                            settings['history_' + data.sessionid] = setInterval(() => {
                                heartbeat(data.sessionid, type);
                            }, 5000);
                        } else {
                            //用于实时视频（实时视频逻辑比较简单5秒请求一次）
                            clearInterval(settings.heartbeat);
                            settings.heartbeat = setInterval(() => {
                                heartbeat(data.sessionid);
                            }, 5000);
                        }
                    }
                } else if (data.result == '10003') {
                    //请求返回失败会在执行3次，如果都失败则退出执行
                    var counterror = count ? count : 1;
                    if (counterror > 3) {
                        $("#map-video-warp").attr("sessionid", "");
                        $("#mapVideoControls").addClass("hide");
                        $("#mapVideoEnd").removeClass("hide");
                        warningTip.say('播放失败，请稍后再试');
                    } else {
                        counterror += counterror;
                        getMapVideoPlay(first, type, startTime, endTime, counterror);
                    }
                } else {
                    var counterror = count ? count : 1;
                    if (counterror > 3) {
                        $("#map-video-warp").attr("sessionid", "");
                        $("#mapVideoControls").addClass("hide");
                        $("#mapVideoEnd").removeClass("hide");
                        warningTip.say(data.describe);
                    } else {
                        counterror += counterror;
                        getMapVideoPlay(first, type, startTime, endTime, counterror);
                    }
                }
            },
            error: function () {
                $("#map-video-warp").data("requestStart", '');
                $("#popup-body-camera-time-search").removeClass("disabled");
                hideLoading($("#map-video-warp"));
                hideLoading($(".popup-body-camera"));
                $("#map-video-warp").attr("sessionid", "");
                warningTip.say('视频未加载');
                // var counterror = count ? count : 1;
                // if (counterror > 3) {
                //     $("#map-video-warp").attr("sessionid", "");
                //     warningTip.say('播放异常，请稍后再试');
                // } else {
                //     counterror += counterror;
                //     getMapVideoPlay(first, type, startTime, endTime, counterror);
                // }
            }
        });

        $("#map-video-warp").data("requestStart", settings.requestStart);
    }

    //视频停止播放
    function stopMapVideoPlay(progress) {
        if (!$("#map-video-warp").attr("sessionid")) {
            return;
        }
        settings.mapVideo.dispose();
        //settings.hls.destroy();
        var option = {
            cmd: 'stop',
            sessionid: $("#map-video-warp").attr("sessionid")
        }
        if (settings.type == 'hisCatch' || settings.type == 'videoReplayAndHisCatch') {
            option.type = 'playback';
        }
        $.ajax({
            url: 'http://190.15.117.242:8016/h5Stream/xhwebvideo.xhrtmp',
            type: 'GET',
            timeout: 30000,
            async: true,
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            data: option,
            success: function (data) {
                if (data.result == '0') {
                    //清掉所有定时器
                    clearInterval(settings.heartbeat);
                    for (var key in settings) {
                        if (key.indexOf("history_") > -1) {
                            clearInterval(settings[key]);
                            delete settings[key];
                        }
                    }
                    $("#map-video-warp").attr("sessionid", "");
                    $("#map-video-warp").data({
                        "nexturl": '',
                        "nextsession": ''
                    })
                    if (!progress) {
                        $("#mapVideoControls").addClass("hide");
                        $("#mapVideoEnd").removeClass("hide");
                        //清空已播放的时间(不是拖拽的情况)
                        settings.currentTime = 0;
                    }
                } else {
                    warningTip.say(data.describe);
                }
            }
        });
    }

    //循环请求心跳请求（5秒）type为1是历史视频
    function heartbeat(sessionid, type) {
        var option = {
            cmd: 'heartbeat',
            sessionid: sessionid
        }
        if (type == '1') {
            option.type = 'playback';
        }
        $.ajax({
            url: 'http://190.15.117.242:8016/h5Stream/xhwebvideo.xhrtmp',
            type: 'GET',
            timeout: 30000,
            async: true,
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            data: option,
            success: function (data) {
                if (data.result != '0') {
                    warningTip.say(data.describe);
                    $("#mapVideoStop").click();
                }
            }
        });
    }

    //点击停止按钮事件
    $("#mapVideoStop").on("click", function () {
        stopMapVideoPlay();
    });

    //播放点击事件
    $("#mapVideoPlay").on("click", function () {
        $("#mapVideoPause").removeClass("hide");
        $(this).addClass("hide");
        settings.mapVideo.play();
    });

    //暂停点击事件(历史专用)
    $("#mapVideoPause").on("click", function () {
        $("#mapVideoPlay").removeClass("hide");
        $(this).addClass("hide");
        settings.mapVideo.pause();
    });

    //进度条拖拽
    $("#timeBarCircle").on('mousedown', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).data('movePositionX', e.clientX);
        $(this).data('movePositionY', e.clientY);
        settings.dropProgress = false;
        $(document).on('mousemove.timeBarCircle', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var posX = Math.abs(e.clientX - $("#timeBarCircle").data("movePositionX"));
            if (posX > 10) {
                settings.dropProgress = true;
                var percent = 100 * (e.pageX - document.getElementById("map-video-progress").getBoundingClientRect().left) / document.getElementById("map-video-progress").offsetWidth;
                if (percent > 100) {
                    percent = 100;
                }
                if (percent < 0) {
                    percent = 0;
                }
                $("#timeBarCircle").css({
                    left: `${percent}%`
                });
                document.getElementById("mapVideoTimrBar").style.width = percent + "%";
                var duration = (new Date(settings.faceData.endTime).getTime() - new Date(settings.faceData.startTime).getTime()) / 1000;
                settings.currentTime = duration * percent / 100;

                $("#mapVideoCurrentTime").html(timer(settings.currentTime));
            }
        }).on('mouseup.timeBarCircle', function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (settings.dropProgress) {
                settings.dropProgress = false;
                stopMapVideoPlay(true);
                //重新开始两分钟请求一段视频
                var startTime = timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8 + settings.currentTime * 1000).videoTime,
                    endTime = timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8 + settings.nextTime + settings.currentTime * 1000).videoTime;
                //如果输入框的结束时间和发送的时间对比小于2分钟，不用存起来否则以2分钟为准,，每次切换的视频的时候都把当前视频开始和结束时间存起来
                if (new Date(settings.faceData.endTime).getTime() - 1000 * 60 * 60 * 8 - (new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8 + settings.currentTime * 1000) > settings.nextTime) {
                    //将发送的开始和结束时间存起来
                    $("#map-video-warp").data({
                        startTime: timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8 + settings.currentTime * 1000).date,
                        endTime: timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8 + settings.currentTime * 1000 + settings.nextTime).date
                    })
                } else {
                    //结束时间就是输入框的结束时间
                    $("#map-video-warp").data({
                        startTime: timeVideoToTime(new Date(settings.faceData.startTime).getTime() - 1000 * 60 * 60 * 8 + settings.currentTime * 1000).date,
                        endTime: timeVideoToTime(new Date(settings.faceData.endTime).getTime() - 1000 * 60 * 60 * 8).date
                    })
                }
                getMapVideoPlay(true, '1', startTime, endTime);
            }
            $(document).off('mousemove.timeBarCircle mouseup.timeBarCircle');
        });
    });

    //全屏点击事件
    $("#mapVideoScreen").on("click", function () {
        requestFullscreen(document.getElementById("mapVideo"));
    });

    //实时视频的告警和抓拍图推送
    function getMapVideoPush() {
        loadEmpty($("#popup-body-face-cntList"), '暂无抓拍图', '');
        var port = 'v2/index/subscribeCameraSnapImg',
            option = {
                cameraId: settings.faceData.cameraId
            },
            successFunc = function (data) {
                if (data.code === '200') {
                    $("#map-video-warp").attr('realTimeHeart', '1');
                    //调用心跳接口
                    settings.realTimeHeart = setInterval(() => {
                        getMapVideoPushHeart();
                    }, 30000);
                } else {
                    loadEmpty($("#popup-body-face-cntList"), data.message, '');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, option, successFunc, undefined, 'GET');
    }

    //实时视频的告警和抓拍图心跳
    function getMapVideoPushHeart() {
        var port = 'v2/index/keepHeartbeat',
            option = {},
            successFunc = function (data) {
                if (data.code === '200') {
                    //调用心跳接口
                } else {
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, option, successFunc, undefined, 'GET');
    };

    function stopMapPush() {
        var port = 'v2/index/unSubscribeCamera',
            option = {
                cameraIds: [settings.faceData.cameraId]
            },
            successFunc = function (data) {
            };
        loadData(port, true, option, successFunc);
    }

    //结束实时视频的告警和抓拍图心跳
    var getMapVideoPushHeartEnd = function () {
        $("#map-video-warp").attr('realTimeHeart', '0');
        clearInterval(settings.realTimeHeart);
        if (settings.type == 'playVideos' || settings.type == 'playAndCatch') {
            stopMapPush();
        }
    }
    /************************************自定义播放器结束*******************************************/

    $("#closeMapVideoPage").on("click", function () {
        if ($("#map-video-warp").attr("sessionid")) {
            $("#mapVideoStop").click();
        }
        if ($("#map-video-warp").data("requestStart")) {
            $("#map-video-warp").data("requestStart").abort();
        }
        //实时视频和抓拍图要清空定时器
        if ($("#map-video-warp").attr('realTimeHeart') == '1') {
            getMapVideoPushHeartEnd();
        }
        $('.map-new-popup').html('');
        $('.map-new-popup').addClass('hide');
        deleteAllCameraSelect(document.getElementById(settings.mapId));
        $('.map-new-popup').data({
            type: '',
            mapId: ''
        });
    });

    //视频弹窗拖拽事件
    $("#mapVideoMove").on('mousedown', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).data('movePositionX', e.clientX);
        $(this).data('movePositionY', e.clientY);
        $(this).addClass("move");
        $(this).removeClass("noclick");

        //随鼠标移动
        $(document).on('mousemove.mapVideoMove', function (e) {
            e.stopPropagation();
            e.preventDefault();
            if ($(".mapVideoMove").hasClass("move")) {
                var posX = Math.abs(e.clientX - $(".mapVideoMove").data("movePositionX"));
                var posY = Math.abs(e.clientY - $(".mapVideoMove").data("movePositionY"));
                if (posX > 20 || posY > 20) {
                    $(".mapVideoMove").addClass("noclick");
                    $(".temporaryShelfMove").removeClass("hide");

                    var top = e.clientY - $("#mapVideoMove").height() / 2,
                        left = e.clientX - $("#mapVideoPage").width() / 2;

                    $("#mapVideoPage").css({
                        top: top < 0 ? 0 : (top > ($(document.body).height() - $("#mapVideoPage").height()) ? ($(document.body).height() - $("#mapVideoPage").height()) : top) + 'px',
                        left: left < 0 ? 0 : (left > ($(document.body).width() - $("#mapVideoPage").width()) ? ($(document.body).width() - $("#mapVideoPage").width()) : left) + 'px',
                    });
                }
            }
        }).on('mouseup.mapVideoMove', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(".mapVideoMove").removeClass("move");
            $(".temporaryShelfMove").addClass("hide");
            $(document).off('mousemove.mapVideoMove mouseup.mapVideoMove');
        });
    });

    //隐藏和显示弹窗
    $("#hideMapViewPage").on("click", function () {
        if ($(this).hasClass("aui-icon-minus")) {  //隐藏
            $(this).addClass("aui-icon-focus").removeClass("aui-icon-minus").attr("title", "展开");

            $("#mapVideoPage").data({
                bigTop: $("#mapVideoPage").offset().top,
                bigLeft: $("#mapVideoPage").offset().left
            });
            $("#mapVideoPage .popup-body").addClass("hide");
            $("#mapVideoPage").css({
                width: '20%'
            });

            $("#mapVideoPage").css({
                top: $("#mapVideoPage").data("smallTop") != undefined ? $("#mapVideoPage").data("smallTop") : $(document.body).height() - $("#mapVideoPage").height(),
                left: $("#mapVideoPage").data("smallLeft") != undefined ? $("#mapVideoPage").data("smallLeft") : $(document.body).width() - $("#mapVideoPage").width()
            });
        } else {
            $(this).removeClass("aui-icon-focus").addClass("aui-icon-minus").attr("title", "隐藏");

            $("#mapVideoPage").data({
                smallTop: $("#mapVideoPage").offset().top,
                smallLeft: $("#mapVideoPage").offset().left
            });

            $("#mapVideoPage .popup-body").removeClass("hide");

            $("#mapVideoPage").css({
                width: '60%',
                top: $("#mapVideoPage").data("bigTop"),
                left: $("#mapVideoPage").data("bigLeft")
            });
        }
    });

    //使用闭包让commonjs可以调用getMapVideoPushHeartEnd关闭定时器
    return getMapVideoPushHeartEnd;
})(window, window.jQuery);