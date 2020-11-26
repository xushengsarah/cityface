// 点击查看大图数据先行设置 通用右键函数模板
function rightMouse(e) {
    e.stopPropagation();
    e.preventDefault();
    var $menu = $([
        '<ul class="mask-camera-list" id="rightMouseMenu">',
        '   <li class="mask-camera-item">查看前后5s视频</li>',
        '   <li class="mask-camera-item">查看前后10s视频</li>',
        '   <li class="mask-camera-item">查看前后30s视频</li>',
        '   <li class="mask-camera-item">查看实时视频</li>',
        '   <li class="mask-camera-item">截图检索</li>',
        '</ul>',
    ].join('')),
        menuLen = $('#rightMouseMenu').length;
    if (menuLen > 0) {
        $('#rightMouseMenu').off().remove();
    }
    // 判断是否点开截屏功能
    var $bigPicMask = $('.mask-container-fixed').not('.hide'),
        $cropPanel = $bigPicMask.find('.mask-crop-panel').not('.hide');
    if ($cropPanel.length > 0) {
        $cropPanel.next().find('.aui-icon-not-through').click();
    }
    // 判断是否还在加载中
    var $loading = $bigPicMask.find('.loading-box');
    if ($loading.length > 0) {
        return;
    }
    // 给右键菜单添加绑定事件
    $menu.find('.mask-camera-item').off('click').on('click', function () {
        var menuIndex = $(this).index(),
            $activeSlide = $bigPicMask.find('.swiper-slide-active'),
            $maskList = $activeSlide.find('.mask-camera-list'),
            $maskCrop = $activeSlide.find('.aui-icon-screen');
        if (menuIndex === 0) {
            $maskList.children().eq(0).click();
        }
        if (menuIndex === 1) {
            $maskList.children().eq(1).click();
        }
        if (menuIndex === 2) {
            $maskList.children().eq(2).click();
        }
        if (menuIndex === 3) {
            $maskList.children().eq(3).click();
        }
        if (menuIndex === 4) {
            $maskCrop.click();
        }
    });
    $('body').append($menu);
    var menuWidth = $('#rightMouseMenu').outerWidth(),
        menuHeight = $('#rightMouseMenu').outerHeight(),
        bodyWidth = $('body').outerWidth(),
        bodyHeight = $('body').outerHeight();
    if (e.clientX + menuWidth > bodyWidth - 20) {
        $menu.css({
            left: e.clientX - menuWidth
        });
    } else {
        $menu.css({
            left: e.clientX
        });
    }
    if (e.clientY + menuHeight > bodyHeight - 20) {
        $menu.css({
            top: e.clientY - menuHeight
        });
    } else {
        $menu.css({
            top: e.clientY
        });
    }
    // 绑定全局点击右键菜单消失代码
    $(document).off('click.mask.rightMouseMenu').on('click.mask.rightMouseMenu', function () {
        $('#rightMouseMenu').addClass('hide');
    });
    // 给生成的菜单栏里面进行事件阻止
    $('#rightMouseMenu')[0].addEventListener('contextmenu', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
    });
}

function seconds(time1, time2) {
    var day = new Date(time1.toString());
    day.setSeconds(day.getSeconds() + time2);
    return day.getFullYear() + '-' + times(day.getMonth() + 1) + '-' + times(day.getDate()) + ' ' + times(day.getHours()) + ':' + times(day.getMinutes()) + ':' + times(day.getSeconds());
}

function maskPlayVideo(id, start, end) {
    //播放功能 跳转到客户端的视频监控模块进行播放  id是镜头id
    function playhistoryVideo(id, start, end) {
        try {
            //callSurveillanceFunction.execute(id);  //调用客户端的方法进行跳转并播放
            callHostFunction.callReplayFunctionEx(id, start, end);
        } catch (e) {
            warningTip.say("请在客户端中进行播放！") && window.parent.p_alert("请在客户端中进行播放！");
        }
    }
    //播放功能 跳转到客户端的视频监控模块进行播放  id是镜头id
    function playrealtimeVideo(id) {
        try {
            //callSurveillanceFunction.execute(id);  //调用客户端的方法进行跳转并播放
            callHostFunction.callSurveillanceFunction(id);
        } catch (e) {
            warningTip.say("请在客户端中进行播放！") && window.parent.p_alert("请在客户端中进行播放！");
        }
    }
    if (start !== undefined && end !== undefined) {
        playhistoryVideo(id, start, end);
    } else {
        playrealtimeVideo(id);
    }
}

/**大图弹窗关闭调用事件
 * @param { Object } $popups    // jquery对象 弹窗容器 找寻隐藏/清除等位置
 * @param { String } category   // 特定弹窗类型 区别不同弹窗右侧内容类型
 * @param { String } cls        // 特定弹窗类名 区别查看大图弹窗的位置
 */
function closeBigImgPopups($popups, category, cls) {

    //所有大图关闭按钮事件处理部分
    $popups.removeClass('show');
    // 因为关系还有动画效果,需要加上延迟给添加效果
    window.setTimeout(function () {
        $popups.addClass('hide');
    }, 300);
    var $maskCropBox = $popups.find('.square-crop-box'),
        $maskCropPanel = $popups.find('.mask-crop-panel'),
        $maskBox = $popups.find('.square-box');
    $maskCropBox.addClass('hide'); //隐藏截图图层
    $maskCropPanel.addClass('hide'); //隐藏截图选择框
    $maskBox.removeClass('hide'); //取消隐藏的人像框选
    $popups.find('.swiper-button-next').removeClass('hide');
    $popups.find('.swiper-button-prev').removeClass('hide');
    //移除contextmenu(鼠标右键点击)事件语句柄，即大图鼠标右键点击事件
    $popups[0].removeEventListener('contextmenu', rightMouse);
    //清除所有大图数据缓存
    $('#bigImgPopups>.mask-dialog').remove();
    //告警大图关闭后需要刷新数据
    if (category === 'alarmBigImgPopups') {
        getFilterData(getFilterTagData());
    }
    // 首页告警 只显示未确认状态
    if (cls === 'warning-list-alarm') {
        window.refreshUserLoadAlarmData();
    }
}


/**绑定大图弹窗左侧相关操作的初始化
 * @param { Object } $findMask    // jquery对象 弹窗容器 找寻隐藏/清除等位置
 * @param { String } index        // 特定弹窗类型 区别不同弹窗右侧内容类型
 * @param { String } cameraId     // 视频播放流信息
 * @param { String } cameraTime   // 视频播放时间
 * @param { String } selectorStr  // 大图最外层class，能定位到大图最外层div
 */
function initializeBigImgEven($findMask, index, cameraId, cameraTime, selectorStr, cls) {
    //--------------------大图部分的按钮以及鼠标事件初始化---begin------------------
    // 绑定截图按钮事件1
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

    // 绑定大图摄像机按钮打开时间列表事件2
    $findMask.find('.aui-icon-video3').off('click').on('click', function (evt) {
        evt.stopPropagation();
        $(this).toggleClass('active');
        var $list = $findMask.find('.swiper-slide-active .mask-camera-list');
        $list.children().removeClass('active').eq(0).addClass('active');
        $list.toggleClass('hide');
    });

    // 绑定大图摄像机时间列表的点击事件3
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

    // 添加大图部分的鼠标右键点击事件4
    $('body').find(selectorStr)[0].addEventListener('contextmenu', rightMouse);
    // 添加点击全局部分隐藏摄像机时间列表5
    $(document).off('click.mask.camera').on('click.mask.camera', function () {
        $('body').find('.mask-camera-list').addClass('hide');
        $('body').find('.mask-icon.aui-icon-video3').removeClass('active');
        $('body').find('.mask-camera-item').removeClass('active');
    });
    //--------------------大图部分的按钮以及鼠标事件初始化---end------------------

    //绑定弹窗关闭事件6
    $findMask.find('.aui-icon-not-through').on('click', function () {
        var category = 'alarmBigImgPopups';
        closeBigImgPopups($findMask, category, cls);
    });
}

/**
 * 大图弹框 点击下一个按钮
 * @param { Object } data    // 被点击元素绑定数据  告警大图（包含地图）传alarmListData 检索大图（包含地图）传imgGuidListData
 * @param { Array } idList    // 被点击元素唯一标志id数组  告警大图（包含地图）传alarmIdList 检索大图（包含地图）传imgGuidList
 */
function nextBtnClick() {
    $(nextBtnCls).on('click', function (data, idList) {
        var $cropPanel = $maskDomFix.find('.mask-crop-panel').not('.hide'),
            itemId = data.attr('id') || data.attr('imgGuid'), // 当前被点击元素的id
            itemIndex = 0, // 当前被点击元素在数组中的索引
            dataListLen = idList.length, // 当前被点击元素所在ul中li的个数（id数组的长度）
            _nextSwiperSlideDiv = createNewSwiperSlide(); // 创建下下块的滑块 createNewSwiperSlide的返回值应该是一个html字符串
        // 存在遮罩层时，不允许左右滑动
        if ($cropPanel.length > 0) {
            return;
        }
        for (var i = 0; i < dataListLen; i++) {
            if (itemId === idList[i]) {
                itemIndex = i;
            }
        }
        // 判断是否为最后一张图片
        if (itemIndex + 1 === dataListLen - 1) {
            $(this).addClass('hide'); // 隐藏向右滑动按钮
        } else { // 不是最后一张图片
            $(this).removeClass('hide');
            $(prevBtnCls).removeClass('hide'); // prevBtnCls为向左滑动按钮 选择器字符串
            mySwiper.slideTo(itemIndex + 1, 500, true); // 滑动到下一块 【mySwiper实例需提前定义】
            $maskContainer.find('.mask-container .swiper-wrapper').append(_nextSwiperSlideDiv); // 将下下块的滑块加入滑动容器中
            getCreateMaskSliderData(itemIndex + 2); // 获取下下块的滑块数据 【getCreateMaskSliderData（）获取新div的数据。获取的数据与显示的数据不一致，不能再用以前的click方法获取数据】
            $maskContainer.find('.mask-container .swiper-wrapper .swiper-slide')[0].remove(); // 将上一块滑块删除
        }
    });
}

/**
 * 大图弹框 点击上一个按钮
 * @param { Object } data    // 被点击元素绑定数据  告警大图（包含地图）传alarmListData 检索大图（包含地图）传imgGuidListData
 * @param { Array } idList    // 被点击元素唯一标志id数组  告警大图（包含地图）传alarmIdList 检索大图（包含地图）传imgGuidList
 */
function prevBtnClick() {
    $(prevBtnCls).on('click', function (data, idList) {
        var $cropPanel = $maskDomFix.find('.mask-crop-panel').not('.hide'),
            itemId = data.attr('id') || data.attr('imgGuid'), // 当前被点击元素的id
            itemIndex = 0, // 当前被点击元素在数组中的索引
            dataListLen = idList.length, // 当前被点击元素所在ul中li的个数（id数组的长度）
            _nextSwiperSlideDiv = createNewSwiperSlide(); // 创建下下块的滑块 createNewSwiperSlide的返回值应该是一个html字符串
        // 存在遮罩层时，不允许左右滑动
        if ($cropPanel.length > 0) {
            return;
        }
        for (var i = 0; i < dataListLen; i++) {
            if (itemId === idList[i]) {
                itemIndex = i;
            }
        }
        // 判断是否为第一张图片
        if (itemIndex - 1 === 0) {
            $(this).addClass('hide'); // 隐藏向左滑动按钮
        } else { // 不是第一张图片
            $(this).removeClass('hide');
            $(nextBtnCls).removeClass('hide'); // nextBtnCls为向右滑动按钮 选择器字符串
            mySwiper.slideTo(itemIndex - 1, 500, true); // 滑动到上一块 【mySwiper实例需提前定义】
            $maskContainer.find('.mask-container .swiper-wrapper').prepend(_nextSwiperSlideDiv); // 将上上块的滑块加入滑动容器中
            getCreateMaskSliderData(itemIndex - 2); // 获取上上块的滑块数据 【getCreateMaskSliderData（）获取新div的数据。获取的数据与显示的数据不一致，不能再用以前的click方法获取数据】
            $maskContainer.find('.mask-container .swiper-wrapper .swiper-slide')[3].remove(); // 将下一块滑块删除
        }
    });
}