/**
 * 
 * design by zhouxuan
 * 2019/04/03
 */
;
(function (window, $) {
    var defaults = {
        deVal: 0, //传入值
        className: 'dataNums', //样式名称
        digit: '' //默认显示几位数字
    };

    function Widget(obj, options) {
        this.obj = obj;
        this.options = $.extend({}, defaults, options);
        this.init(obj, this.options);
    }
    $.extend(Widget.prototype, {
        init: function (obj, options) {
            var strHtml = '<ul class="' + options.className + ' inrow">';
            var valLen = options.digit || (options.deVal + '').length;
            if (obj.find('.' + options.className).length <= 0) {
                for (var i = valLen; i > 0; i--) {
                    if (i % 3 == 0 && i != valLen) {
                        strHtml += ['<li class="dataSplit">，</li>'].join('');
                    }
                    strHtml += [
                        '<li class="dataOne">',
                        '   <div class="dataBoc">',
                        '       <div class="tt" t="38"><span class="num0">0</span> <span class="num1">1</span> <span class="num2">2</span>',
                        '           <span class="num3">3</span> <span class="num4">4</span><span class="num5">5</span> <span class="num6">6</span>',
                        '           <span class="num7">7</span> <span class="num8">8</span> <span class="num9">9</span><span class="num0">0</span>',
                        '           <span class="num1">1</span> <span class="num2">2</span> <span class="num3">3</span> <span class="num4">4</span>',
                        '           <span class="num5">5</span> <span class="num6">6</span> <span class="num7">7</span> <span class="num8">8</span>',
                        '           <span class="num9">9</span>',
                        '       </div>',
                        '   </div>',
                        '</li>'
                    ].join('');
                }
                strHtml += '</ul>';
                obj.html(strHtml);
            }
            this.scrollNum(obj, options, true);
            $(window).on('resize', function () {
                this.resize();
            }.bind(this));
        },
        scrollNum: function (obj, options) {
            var number = options.deVal;
            var $num_item = $(obj).find('.' + options.className).find('.tt');
            var h = $(obj).find('.dataBoc')[0].getBoundingClientRect().height;

            if (options.time) {
                var time = options.time / 1000;
                $num_item.css('transition', 'all ' + time + 's ease-in-out');
            } else {
                $num_item.css('transition', 'all 2s ease-in-out');
            }

            var numberStr = number.toString();
            if (numberStr.length <= $num_item.length - 1) {
                var tempStr = '';
                for (var a = 0; a < $num_item.length - numberStr.length; a++) {
                    tempStr += '0';
                }
                numberStr = tempStr + numberStr;
            }

            var numberArr = numberStr.split('');
            $num_item.each(function (i, item) {
                var animateTime = i * 100;
                if (options.deleyTime !== undefined) {
                    animateTime = options.deleyTime;
                }
                // 判定是否有设置动画时间
                setTimeout(function () {
                    $num_item.eq(i).css('top', -parseInt(numberArr[i]) * h - h * 10 + 'px');
                }, animateTime);
            });
        },
        setNum: function (val, time, deleyTime) {
            this.options.deVal = val;
            var options = $.extend({}, this.options);
            options.deVal = val;
            options.time = time;
            options.deleyTime = deleyTime;
            this.scrollNum(this.obj, options);
        },
        resize: function () {
            this.obj.empty();
            this.init(this.obj, this.options);
        }
    })
    $.fn.rollNum = function (options) {
        var args = arguments;
        // 存储传进来的
        var _options = options;
        [].shift.apply(args);
        this.each(function () {
            var $this = $(this),
                thisData = $this.data('rollNum');
            if (typeof _options === 'string' && thisData) {
                if (thisData[_options] instanceof Function) {
                    thisData[_options].apply(thisData, args);
                } else {
                    thisData._options = options;
                }
            } else {
                var rollNumObj = new Widget($this, _options);
                $this.data('rollNum', rollNumObj);
            }
        });
    };
})(window, window.jQuery);