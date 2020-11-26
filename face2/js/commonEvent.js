/**
 * Created by hWX336970 on 2016/11/29.
 */
(function ($) {
    var
        ANIMATION_END = 'animationend webkitAnimationEnd msAnimationEnd MozAnimationEnd',
        TRANSITION_END = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MozTransitionEnd',
        isLtIE10 = !!window.ActiveXObject && document.documentMode < 10 ? true : false,
        isLtIE9 = !!window.ActiveXObject && document.documentMode < 9 ? true : false;

    jQuery.easing.easeOutSine || jQuery.extend(jQuery.easing, {
        easeOutSine: function (x, t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        }
    });

    //global helper
    window.helper = {
        //load加载页面,IE8下不支持html4以外标签，h5标签可以通过引入html5shiv.js解决
        loadIncludePages: function () {
            $('[include]').each(function () {
                var
                    $tag = $(this),
                    replace = $tag.attr('replace') != 'false';

                if ($tag.children().length) return;

                $tag.load($tag.attr('include'), function () {
                    var $ele = $tag.trigger('loaded').children(),
                        selectIndex = $tag.attr('select');

                    if (replace) {
                        $ele.unwrap();

                        if ($tag.attr("id")) {
                            $ele.first().attr("id", $tag.attr("id"));
                        }
                        $ele.each(function () {
                            if (!$(this).is("script")) {
                                $(this).addClass($tag.attr('class'));
                            }
                        });
                    }
                    // helper.initRippleTip();
                });
            });
            return helper;
        },
        init: function () {
            helper
                .loadIncludePages()

            return helper;
        },
    };

    helper.init();

    //event
    $(document)
        //switch
        .on('click', '[data-role="switch"]', function () {
            var $this = $(this);
            if (!$this.hasClass('disabled')) {
                if ($this.hasClass('on')) {
                    $this.removeClass('on');
                    $this.find('.switch-text-on').hide();
                    $this.find('.switch-text-off').show();
                } else {
                    $this.addClass('on');
                    $this.find('.switch-text-on').show();
                    $this.find('.switch-text-off').hide();
                }
            }
        })
        //关闭详情
        .on('click', '.card-side-close', function () {
            $(this).parents('.swiper-container').animate({
                marginTop: "0"
            }, 0).hide();
            $('.image-card-item').removeClass('active');
        })

        //身份证号回车事件,去掉身份证提示
        .on('keydown', '#idcardsearch', function (e) {
            $(".idcard-alert").removeClass("show");
            $(".img-alert").removeClass("show");
            var code = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
            if (code == 13) {
                //findIdcard(e, $("#current-page").find(".idcardSelect .ui-checkboxradio-label").hasClass("ui-checkboxradio-checked") ? "22" : "");
                findIdcard(e, $("#current-page").find(".idcardSelect").val());
            }
        })

        //身份证号码icon点击事件
        .on('click', '#idcardsearchIconMerge', function (e) {
            //findIdcard(e, $("#current-page").find(".idcardSelect").val());
            var e = jQuery.Event("keydown");
            e.keyCode = 13;
            e.which = 40;
            $("#idcardsearch").trigger(e);
        })

        //年龄时间段选择的起始时间校验
        .on('blur', '#ageStart', function (e) {
            var startAge = parseInt($(this).val()),
                endAge = parseInt($('#ageEnd').val()); // ageReg = /^(?:0|[1-9][0-9][0-9]?|150)$/;
            if (startAge <= 0) {
                $(this).val(0);
            } else if (startAge >= 150) {
                $(this).val(150);
            }

            if (startAge >= endAge) {
                $(this).val(endAge);
            }

            var reg = /^\d+$/;
            if ($("#ageStart").val()) {
                if (!reg.test($("#ageStart").val())) {
                    $(this).val(0);
                }
            }
        }).on('blur', '#ageEnd', function (e) {
            var startAge = parseInt($('#ageStart').val()),
                endAge = parseInt($(this).val());
            console.log(startAge + " - " + endAge);
            if (endAge <= 0) {
                $(this).val(0);
            } else if (endAge >= 150) {
                $(this).val(150);
            }

            if (startAge >= endAge) {
                $(this).val(startAge);
            }

            var reg = /^\d+$/;
            if ($("#ageEnd").val()) {
                if (!reg.test($("#ageEnd").val())) {
                    $(this).val(150);
                }
            }
        });

    // 公共在检索页面添加图片函数
    window.addSearchImg = function (imgUrl, isTemporary) {
        if ($('#pageSidebarMenu').find('.aui-icon-monitor').parents(".sidebar-item").hasClass("active")) {
            var html = createAddImageItem(imgUrl),
                $searchIcon = $('#pageSidebarMenu').find('.aui-icon-monitor'),
                $item = $searchIcon.closest('.sidebar-item'),
                itemIndex = $item.index(),
                $saveItem = $('#content-box').find('.content-save-item').eq(itemIndex),
                $userchImg = $saveItem.find('#usearchImgDynamic'),
                $dynamicsearch = $('#dynamicsearchDynamic');
        } else {
            var html = createAddImageItem(imgUrl),
                $searchIcon = $('#pageSidebarMenu').find('.aui-icon-carsearch2'),
                $item = $searchIcon.closest('.sidebar-item'),
                itemIndex = $item.index(),
                $saveItem = $('#content-box').find('.content-save-item').eq(itemIndex),
                $userchImg = $saveItem.find('#usearchImg'),
                $dynamicsearch = $('#mergeSearch');
        }
        $userchImg.find('.add-image-item').removeClass('active');
        $userchImg.find('.add-image-icon').before(html);
        $userchImg.find('.uploadFile')[0].value = '';
        var $imgItem = $userchImg.find('.add-image-item');
        if ($imgItem.length > 5) {
            $userchImg.removeClass('scroll');
            var clientH = $userchImg[0].clientHeight;
            $userchImg.addClass('scroll');
            $userchImg.animate({
                'scrollTop': clientH
            }, 500);
        }
        if (!isTemporary) {
            // 自动搜索图片
            window.setTimeout(function () {
                // if ($('#mergeSearch').length > 0) {
                //     imgDom(imgUrl, $('#mergeSearch'), $("#usearchImg"));
                // } else {
                imgDom(imgUrl, $dynamicsearch, $userchImg);
                //}
            }, 100)
        }
    }

    // 公共发起小图检索图base64图片代码
    window.alarmSearchBtnChange = function (url, callback) {
        window.loadData('v2/faceDt/getImgByUrl', true, {
            url: url
        }, function (data) {
            if (data.code === '200') {
                if ($.isFunction(callback)) {
                    var imageDataBase = 'data:image/png;base64,' + data.base64;
                    callback(imageDataBase);
                }
            } else {
                warningTip.say(data.message);
            }
        });
    }

    // 生成告警额外html节点数据
    window.changeAlarmMaskHtml = function (data, isSuspect) {
        var btnHtml = '';
        btnHtml += `<div class="aui-mt-md case-item-operate">`;
        if (data.status == '0') {
            btnHtml += `<button type="button" class="btn btn-primary btn-confirm">确认</button>
                <button type="button" class="btn btn-false">误报</button>`;
        } else if (data.status == '1') {
            btnHtml += `<button type="button" class="btn btn-primary btn-confirm disabled">已命中</button>`;
        } else if (data.status == '2') {
            btnHtml += `<button type="button" class="btn btn-primary btn-confirm disabled">已误报</button>`;
        }
        if (data.libId == '19') {
            btnHtml += `<button type="button" class="btn btn-primary btn-check hide">在逃核验</button>`
            if (data.dataStatus == '2') {
                btnHtml += `<button type="button" class="btn btn-revoke disabled">已撤销</button></div>`;
            } else {
                btnHtml += `<button type="button" class="btn btn-revoke">撤销</button></div>`;
            }
        } else if (data.libId == '4') {
            btnHtml += `<button type="button" class="btn btn-primary btn-check hide">在逃核验</button>
            </div>`;
        } else {
            btnHtml += `</div>`;
        }
        var html = `
        <div class="aui-col-6">
            <div class="mask-info-box">
                <div class="image-flex-list clearfix control-imge-list">
                    <span class="image-tag1 warning rotate ${data.dataStatus == '2' ? '' : 'hide'}">疑似撤逃</span>
                    <div class="image-box-flex">
                        <span class="image-tag">布控原图</span>
                        <img class="img" src="${data.url}" alt="">
                    </div>
                    <div class="image-box-flex">
                        <span class="image-tag">告警图片</span>
                        <img class="img" src="${data.smallHttpUrl ? data.smallHttpUrl : data.smallImgUrl}" alt="">
                    </div>
                    <span class="image-flex-similarity"><span class="primary">${data.threshold ? data.threshold + '%' : '0%'}</span></span>
                </div>
                <button type="button" class="btn btn-primary changeImgSearch">横向比对</button>
                <button type="button" class="btn btn-primary onetooneSearch">1:1比对</button>
                <button type="button" class="btn btn-search aui-mt-sm">发起检索</button>
                <ul class="aui-mt-md">
                    <li class="border-bottom mask-info-top ${isSuspect ? 'hide' : ''}">
                        <p class="text-md text-bold">镜头信息：</p>
                        <ul class="aui-row form-info form-label-fixed form-label-long aui-mt-xs">
                            <li class="aui-col-24">
                                <div class="form-group">
                                    <label class="aui-form-label">镜头所属机构：</label>
                                    <div class="form-text">${data.orgName ? data.orgName : '未知'}</div>
                                </div>
                            </li>
                            <li class="aui-col-24">
                                <div class="form-group">
                                    <label class="aui-form-label">镜头国标编码：</label>
                                    <div class="form-text">${data.gbCode ? data.gbCode : '未知'}</div>
                                </div>
                            </li>
                            <li class="aui-col-24">
                                <div class="form-group">
                                    <label class="aui-form-label">镜头名称：</label>
                                    <div class="form-text">${data.cameraName ? data.cameraName : '未知'}</div>
                                </div>
                            </li>
                            <li class="aui-col-24">
                                <div class="form-group">
                                    <label class="aui-form-label">抓拍时间：</label>
                                    <div class="form-text">${data.alarmTime ? data.alarmTime : '未知'}</div>
                                </div>
                            </li>
                        </ul>    
                    </li>
                    <li>
                        <p class="text-md text-bold">人员信息：</p>
                        <ul class="aui-row form-info form-label-fixed form-label-long aui-mt-xs">
                            <li class="aui-col-24">
                                <div class="form-group">
                                    <label class="aui-form-label">姓名：</label>
                                    <div class="form-text">${data.name ? data.name : '未知'}</div>
                                </div>
                            </li>
                            <li class="aui-col-24">
                                <div class="form-group">
                                    <label class="aui-form-label">身份证号：</label>
                                    <div class="form-text copySelect" peopleId="${data.peopleId ? data.peopleId : '--'}">${data.idcard ? data.idcard : '未知'}</div>
                                </div>
                            </li>
                            <li class="aui-col-24">
                                <div class="form-group">
                                    <label class="aui-form-label">来源库：</label>
                                    <div class="form-text" libId="${data.libId ? data.libId : '--'}">${data.libName ? (data.cilNames ? (data.libName + '—' + data.cilNames) : data.libName) : '未知'}</div>
                                </div>
                            </li>
                            <li class="aui-col-24 ${isSuspect ? 'hide' : ''}">
                                <div class="form-group">
                                    <label class="aui-form-label">布控事由：</label>
                                    <div class="reason-box">${data.comments ? data.comments : '无'}</div>
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>
                ${btnHtml}
            </div>
        </div>
        `;
        return html;
    }

    // 新手指引公共方法
    window.systemGuide = function (type) {
        // 根据不同类型加载不同的新手指引
        var $guideMask = type === 1 ? $('#system-guide-index') : $('#system-guide-search'),
            $saveCon = $guideMask.find('.system-guide-box'),
            $tip = $guideMask.find('.sidebar-tip-box'),
            $border = $guideMask.find('.system-guide-border');
        // 进行后台查询是否需要新手指引
        window.loadData('home/getGuide', true, {}, function (data) {
            if (data.code === '000') {
                // 判定需要新手指引
                var resultIndexGuide = parseFloat(data.result.indexGuide),
                    resultSearchGuide = parseFloat(data.result.searchGuide);
                if (type === 1) {
                    if (resultIndexGuide === 0) {
                        return;
                    }
                    var $initDom = $('#pageSidebarMenu').parent(),
                        $copyDom = $initDom.clone(),
                        windowH = $(window).height(),
                        itemH = $initDom.find('.sidebar-item').outerHeight(),
                        itemLastPos = $initDom.find('.sidebar-item').eq(-1)[0].getBoundingClientRect(),
                        pos = $initDom.find('.sidebar-list')[0].getBoundingClientRect(),
                        textArr = [
                            '您可以点击导航名称进行功能模块的快速切换',
                            '您可以在这里查看管理与自己相关的任务等信息'
                        ],
                        leadTextArr = ['导航使用', '我的模板'],
                        posArrObj = [{
                            top: pos.top,
                            left: pos.left,
                            width: pos.width,
                            height: windowH - pos.top - itemH
                        }, {
                            top: itemLastPos.top,
                            left: itemLastPos.left,
                            width: itemLastPos.width,
                            height: itemH
                        }],
                        copyArrObj = [{
                            'height': windowH,
                            'margin-top': -posArrObj[0].top,
                            'margin-left': -posArrObj[0].left
                        }, {
                            'height': windowH,
                            'margin-top': -posArrObj[1].top,
                            'margin-left': -posArrObj[1].left
                        }];
                    $guideMask.removeClass('hide');
                    var $windowCon = $guideMask.find('.window-cont'),
                        windowConPosTop = $windowCon.position().top,
                        windowConH = $windowCon.outerHeight(),
                        tipPos = [{
                            top: (posArrObj[0].height - posArrObj[0].top) / 2,
                            left: posArrObj[0].width + 20
                        }, {
                            left: posArrObj[0].width + 20,
                            bottom: 20
                        }],
                        tipArrowPos = [{
                            top: windowConPosTop
                        }, {
                            top: windowConPosTop + windowConH
                        }];
                    guideMaskEvent($guideMask, posArrObj, tipPos, tipArrowPos, textArr, leadTextArr, type);
                } else {
                    if (resultSearchGuide === 0) {
                        return;
                    }
                    var $initDom = $('<div class="system-guide-con"></div>');
                    $initDom.append($('#pageSidebarMenu').parent().clone());
                    $initDom.append($('#content-box').children().eq(1).clone());
                    var $saveItem = $('#content-box').children().eq(1),
                        $copyDom = $initDom.clone(),
                        saveItemSidePos = $saveItem.find('#sidebarAccordion')[0].getBoundingClientRect(),
                        staticSearchPox = $saveItem.find('#staticContentContainer')[0].getBoundingClientRect(),
                        mapPos = $saveItem.find('#search_map_iframe').parent()[0].getBoundingClientRect();
                    textArr = [
                        '您可以在此区域上传需要检索的图片,或输入身份证号',
                        '您可以在此区域设置静态库和动态库的检索条件',
                        '您可以在此区域查看静态库多家算法厂商的比对结果,确认身份信息',
                        '您可以在此区域查看动态库的检索结果,进行轨迹分析',
                        '您可以通过此区域查看每个区域检索图片的数量'
                    ],
                        leadTextArr = ['图片上传区域', '条件输入区域', '静态库结果区域', '动态库结果区域', '地图区域'],
                        posArrObj = [{
                            top: 0,
                            left: saveItemSidePos.left + 6,
                            width: saveItemSidePos.width - 12,
                            height: saveItemSidePos.top,
                        }, {
                            top: saveItemSidePos.top,
                            left: saveItemSidePos.left + 6,
                            width: saveItemSidePos.width - 12,
                            height: saveItemSidePos.height,
                        }, {
                            top: staticSearchPox.top,
                            left: staticSearchPox.left,
                            width: staticSearchPox.width,
                            height: staticSearchPox.height,
                        }, {
                            top: staticSearchPox.height,
                            left: staticSearchPox.left,
                            width: staticSearchPox.width,
                            height: $(window).height() - staticSearchPox.height,
                        }, {
                            top: mapPos.top,
                            left: mapPos.left,
                            width: mapPos.width,
                            height: mapPos.height,
                        }],
                        copyArrObj = [{
                            'width': $(window).width(),
                            'height': $(window).height(),
                            'margin-top': -posArrObj[0].top,
                            'margin-left': -posArrObj[0].left
                        }, {
                            'width': $(window).width(),
                            'height': $(window).height(),
                            'margin-top': -posArrObj[1].top,
                            'margin-left': -posArrObj[1].left
                        }, {
                            'width': $(window).width(),
                            'height': $(window).height(),
                            'margin-top': -posArrObj[2].top,
                            'margin-left': -posArrObj[2].left
                        }, {
                            'width': $(window).width(),
                            'height': $(window).height(),
                            'margin-top': -posArrObj[3].top,
                            'margin-left': -posArrObj[3].left
                        }, {
                            'width': $(window).width(),
                            'height': $(window).height(),
                            'margin-top': -posArrObj[4].top,
                            'margin-left': -posArrObj[4].left
                        }];
                    $guideMask.removeClass('hide');
                    var $windowCon = $guideMask.find('.window-cont'),
                        $windowConW = $guideMask.find('.wind-item')[0].getBoundingClientRect().width,
                        $windowConH = $guideMask.find('.wind-item')[0].getBoundingClientRect().height,
                        windowConPosTop = $windowCon.position().top,
                        windowConH = $windowCon.outerHeight(),
                        tipPos = [{
                            top: (posArrObj[0].height + posArrObj[0].top) / 2,
                            left: posArrObj[0].left + posArrObj[0].width + 20
                        }, {
                            top: (posArrObj[1].height + posArrObj[1].top) / 2,
                            left: posArrObj[1].left + posArrObj[1].width + 20
                        }, {
                            top: posArrObj[2].height + 20,
                            left: (posArrObj[2].left + posArrObj[2].width) / 2
                        }, {
                            bottom: posArrObj[3].height + 20,
                            left: (posArrObj[3].left + posArrObj[3].width) / 2
                        }, {
                            top: (posArrObj[4].height + posArrObj[4].top) / 2,
                            right: posArrObj[4].width + 20
                        }],
                        tipArrowPos = [{
                            top: windowConPosTop
                        }, {
                            top: windowConPosTop + (windowConH / 2)
                        }, {
                            top: -4,
                            left: $windowConW / 2 - 2,
                            'margin-left': 0,
                        }, {
                            'margin-left': 0,
                            'margin-bottom': 0,
                            bottom: -4,
                            left: $windowConW / 2 - 2,
                        }, {
                            top: windowConPosTop + (windowConH / 2),
                            'margin-left': 0,
                            left: $windowConW - 5
                        }];
                    guideMaskEvent($guideMask, posArrObj, tipPos, tipArrowPos, textArr, leadTextArr, type);
                }

                function guideMaskEvent($guideMask, posArrObj, tipPos, tipArrowPos, textArr, leadTextArr, type) {
                    var $tipBox = $guideMask.find('.wind-item'),
                        $btnClose = $tipBox.find('.close-btn'),
                        $tipArrow = $tipBox.find('.item-icon-drop-down'),
                        $text = $tipBox.find('.iot-black'),
                        $leadText = $tipBox.find('.item-title'),
                        $dot = $tipBox.find('.dot-icon'),
                        $btnOk = $tipBox.find('.min');

                    $copyDom.css(copyArrObj[0]);
                    $saveCon.append($copyDom);
                    $tip.css(posArrObj[0]);
                    $border.removeClass('hide').css(posArrObj[0]);
                    $tipBox.css(tipPos[0]);
                    $tipArrow.css(tipArrowPos[0]);
                    $text.text(textArr[0]);
                    $leadText.text(leadTextArr[0]);

                    // 关闭按钮事件绑定
                    $btnClose.off('click').on('click', function () {
                        $dot.eq(0).click();
                        $guideMask.addClass('hide');
                        $saveCon.empty();
                        if (type === 1) {
                            var guideObj = {
                                indexGuide: '0'
                            }
                        } else {
                            var guideObj = {
                                searchGuide: '0'
                            }
                        }
                        // 调用后台借口修正新手指引状态
                        window.loadData('home/updateGuide', true, guideObj, function (data) { });
                    });
                    // 弹窗原点事件绑定
                    $dot.off('click').on('click', function () {
                        var $this = $(this),
                            thisIndex = $this.index(),
                            thisLen = $this.parent().children().length,
                            thisCls = $this.hasClass('active');
                        // 判定是否为选中状态
                        if (thisCls) {
                            return;
                        }
                        // 判定是否为最后一个原点
                        if (thisIndex === thisLen - 1) {
                            $btnOk.addClass('over').text('立即体验');
                        } else {
                            $btnOk.removeClass('over').text('下一条');
                        }
                        $text.text(textArr[thisIndex]);
                        $leadText.text(leadTextArr[thisIndex]);
                        $copyDom.removeAttr('style').css(copyArrObj[thisIndex]);
                        $tip.removeAttr('style').css(posArrObj[thisIndex]);
                        $border.removeAttr('style').css(posArrObj[thisIndex]);
                        $tipBox.removeAttr('style').css(tipPos[thisIndex]);
                        $tipArrow.removeAttr('style').css(tipArrowPos[thisIndex]);
                        $this.addClass('active').siblings().removeClass('active');
                    });
                    // 弹窗按钮事件绑定
                    $btnOk.off('click').on('click', function () {
                        var $this = $(this),
                            $dotActive = $tipBox.find('.dot-icon.active'),
                            thisCls = $this.hasClass('over');
                        if (thisCls) {
                            $btnClose.click();
                        } else {
                            $dotActive.next().click();
                        }
                    });
                }
            }
        });
    }

})(jQuery);