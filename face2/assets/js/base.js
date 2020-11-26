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
    (function ($, window) {
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

    })(jQuery, window);
    $(function () {
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
                $(this).parents('.swiper-container').css({
                    marginTop: 0
                }).slideUp(300);
                $('.image-card-item').removeClass('active');
            })
            //身份证号回车事件,去掉身份证提示
            .on('keydown', '#idcardsearch', function (e) {
                $(".idcard-alert").removeClass("show");
                $(".img-alert").removeClass("show");
                var code = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
                if (code == 13) {
                    findIdcard();
                }
            })
    });
})(jQuery);


// 圆环图搜索

function canvasPercent(circular, percent, index, obj) {
    var canvas = circular;
    var canvas2;
    if (typeof window.G_vmlCanvasManager != "undefined") {
        canvas = window.G_vmlCanvasManager.initElement(canvas);
        canvas2 = window.G_vmlCanvasManager.initElement(canvas.nextSibling);
        var ctx = canvas.getContext('2d');
        var ctx2 = canvas2.getContext('2d');
    } else {
        var ctx2 = canvas.nextElementSibling.getContext('2d');
        var ctx = canvas.getContext('2d');
    }
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.arc(100, 100, 95, -Math.PI * 0.5, Math.PI * 1.5, true);
    ctx.lineWidth = 10.0;
    ctx.strokeStyle = "#fff";
    ctx.stroke();

    function circularPercent(circular, percent) {
        if (circular !== null) {
            circular.setAttribute("percent", percent);
            percent = percent > 100 ? 100 : percent;
            ctx2.globalCompositeOperation = "destination-atop";
            ctx2.save();
            ctx2.beginPath();
            ctx2.arc(100, 100, 95, -Math.PI * 0.5, Math.PI * (percent / 100 * 2 - 0.5), false);
            ctx2.lineWidth = 10.0;
            ctx2.strokeStyle = "#18bfcc";
            ctx2.stroke();
            ctx2.restore();
            percent = 0;
        }
    }

    function setcircular(percent) {
        if (circular !== null) {
            t = setInterval(function () {
                if (index > percent - 1) {
                    clearInterval(t);
                } else {
                    index++;
                    circularPercent(circular, index);
                    circular.setAttribute("percent", index);
                    obj.text(index)
                }
            }, 20);
        }
    }
    setcircular(percent);
    circularPercent(circular, percent)
};

function countUp(elem, endVal, startVal, duration, decimal) {
    var startTime = 0;
    var dec = Math.pow(10, decimal);
    var progress, value;

    function startCount(timestamp) {
        if (!startTime) startTime = timestamp;
        progress = timestamp - startTime;
        value = startVal + (endVal - startVal) * (progress / duration);
        value = (value > endVal) ? endVal : value;
        value = Math.floor(value * dec) / dec;
        elem.innerHTML = value.toFixed(decimal);
        progress < duration && requestAnimationFrame(startCount)
    }
    requestAnimationFrame(startCount)
}

var tag = true;

function headerMenu(event) {
    event.stopPropagation();
    if (tag) {
        $(".header-dropmenu-frame").addClass("show");
        $(".omIndex").addClass("ml-24");
        tag = false;
    } else {
        $(".header-dropmenu-frame").removeClass("show");
        $(".omIndex").removeClass("ml-24");
        tag = true;
    }
}

//搜索详情展开
function portraitSlide(detailContainerID, portraitListID, perPortraitLength, insertPosition) {
    //每行显示人像卡片个数
    var perPortraitLength = perPortraitLength;
    //初始激活的行数
    var initPerIndex;
    var imageItem = $("#" + portraitListID).find(".image-card-item");
    var tempHtml = '';
    for (var i = 0; i < imageItem.length; i++) {
        tempHtml += '<div class="swiper-slide" attr-index="index-' + parseInt(i + 1) + '">' + '</div>'
    }
    $(tempHtml).appendTo($("#" + detailContainerID + " .swiper-wrapper"));
    // 轮播ID
    var swiperID = "#" + detailContainerID;
    //详情插入的位置
    var insertPosition = insertPosition;

    var mySwiper = new Swiper(swiperID, {
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        speed: 500,
        simulateTouch: false,
        onSlideChangeStart: function (swiper) {
            imageItem.eq(swiper.activeIndex).addClass("active").siblings(".image-card-item").removeClass('active');
            initPerIndex = Math.ceil((swiper.activeIndex + 1) / perPortraitLength);
            oldRowIndex = newRowIndex;
            newRowIndex = initPerIndex
            if (newRowIndex !== oldRowIndex) {
                $("#" + detailContainerID).slideUp(0);
                if (imageItem.length > perPortraitLength * initPerIndex) {
                    imageItem.eq(perPortraitLength * initPerIndex).before($("#" + detailContainerID));
                } else {
                    imageItem.eq(imageItem.length - 1).after($("#" + detailContainerID));
                }
                imageItem.eq(perPortraitLength * initPerIndex).before($("#" + detailContainerID));
                $("#" + detailContainerID).css({
                    marginTop: "1.25rem"
                }).slideDown(300);
            }
        }
    });
    var oldRowIndex = 0,
        newRowIndex = 0;
    imageItem.each(function (index) {
        $(this).on('click', function () {
            var _this = this,
                oldIndex = 0,
                newIndex = 0,
                oldIndex = newIndex;
            newIndex = parseInt($(_this).index() + 1);
            oldRowIndex = newRowIndex;
            newRowIndex = initPerIndex = Math.ceil(($(this).index() + 1) / perPortraitLength);
            if (newIndex === oldIndex) return;
            $('.image-card-list').not("#" + portraitListID).find('.image-card-item').removeClass('active');
            $(".swiper-container").not(swiperID).css({
                marginTop: 0,
                height: 'auto'
            }).slideUp(300);
            if (insertPosition) {
                //有多组列表，设置插入容器
                if (parseInt($(_this).parents('.aui-col-12').attr("attr-col")) === 1) {
                    $(_this).parents('.aui-col-12').next().after($("#" + detailContainerID));
                } else if (parseInt($(_this).parents('.aui-col-12').attr("attr-col")) === 2) {
                    $(_this).parents('.aui-col-12').after($("#" + detailContainerID));
                }
            } else {
                //只有一组列表
                if (newRowIndex !== oldRowIndex) {
                    $("#" + detailContainerID).slideUp(0);
                    if (imageItem.length > perPortraitLength * initPerIndex) {
                        imageItem.eq(perPortraitLength * initPerIndex).before($("#" + detailContainerID));
                    } else {
                        imageItem.eq(imageItem.length - 1).after($("#" + detailContainerID));
                    }
                    imageItem.eq(perPortraitLength * initPerIndex).before($("#" + detailContainerID));
                }
            }
            $("#" + detailContainerID)
                .css({
                    marginTop: "1.25rem"
                })
                .slideDown(300, function () {
                    mySwiper.slideTo($(_this).index(), 200, false);
                });
            $(this).addClass("active").siblings(".image-card-item").removeClass('active');

        })
    })
}