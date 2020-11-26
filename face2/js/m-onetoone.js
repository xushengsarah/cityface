(function (window, $) {

    // 第一张图片生成base64
    window.onetoone_loadImage = function (img) {
        var reads = new FileReader();
        var fileNameArr = img.value.split('\\'), // 文件名路径数组
            fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
            fileNameTypeArr = fileName.split('.'),
            fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase(),
            fileSize = img.files[0].size,
            typeArr = ['bmp', 'jpg', 'jpeg', 'png', 'dib', 'webp', 'svgz', 'gif', 'ico', 'svg', 'tif', 'xbm', 'jfif', 'pjpeg', 'pjp', 'tiff'];
        if (typeArr.indexOf(fileType) < 0) {
            img.value = '';
            warningTip.say('格式不正确,请上传图片格式');
            return;
        }

        // 判断文件大小是否超过10M
        if (fileSize > 10 * 1024 * 1024) {
            warningTip.say('上传文件过大,请上传不大于10M的文件的文件');
            img.value = '';
            return;
        }
        f = document.getElementById('pic').files[0];
        reads.readAsDataURL(f);
        reads.onload = function (e) {
            document.getElementById('show').src = this.result;
            document.getElementById('search-before1').classList.add("none");
            document.getElementById('search-after1').classList.remove("none");
        };
    }

    // 第二张图片生成base64
    window.onetoone_loadImage2 = function (img) {
        var reads = new FileReader();
        var fileNameArr = img.value.split('\\'), // 文件名路径数组
            fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
            fileNameTypeArr = fileName.split('.'),
            fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase(),
            fileSize = img.files[0].size,
            typeArr = ['bmp', 'jpg', 'jpeg', 'png', 'dib', 'webp', 'svgz', 'gif', 'ico', 'svg', 'tif', 'xbm', 'jfif', 'pjpeg', 'pjp', 'tiff'];
        if (typeArr.indexOf(fileType) < 0) {
            img.value = '';
            warningTip.say('格式不正确,请上传图片格式');
            return;
        }

        // 判断文件大小是否超过10M
        if (fileSize > 10 * 1024 * 1024) {
            warningTip.say('上传文件过大,请上传不大于10M的文件');
            img.value = '';
            return;
        }
        f = document.getElementById('pic2').files[0];
        reads.readAsDataURL(f);
        reads.onload = function (e) {
            document.getElementById('show2').src = this.result;
            document.getElementById('search-before2').classList.add("none");
            document.getElementById('search-after2').classList.remove("none");
        };
    }

    // 对比按钮绑定事件
    //var isSure = true;
    // $('#imgComparison').on('click', function () {
    //     if ($('#search-before1').hasClass('none') && $('#search-before2').hasClass('none')) {
    //         // if (!isSure) {
    //         //     return;
    //         // }
    //         //isSure = false;
    //         // 添加加载动画
    //         window.showLoading($('.search-one-contrast'));
    //         $('.search-one-box').find('.aui-icon-close').addClass('hide');

    //         // 请求后台数据
    //         var sourceImg = $('#search-after1').find('#show').attr('src'),
    //             comparImg = $('#search-after2').find('#show2').attr('src'),
    //             // source = sourceImg.indexOf('data:image'),
    //             // compare = comparImg.indexOf('data:image'),
    //             $searchNum = $('.search-num'),
    //             $num = $searchNum.find('.num'),
    //             $text = $searchNum.find('.text-xm');
    //         //if (source !== -1 && compare !== -1) {
    //         window.loadData('v2/faceRecog/face1V1', true, {
    //             picture1: sourceImg,
    //             picture2: comparImg,
    //         }, function (data) {
    //             hideLoading($('.search-one-contrast'));
    //             $('.search-one-box').find('.aui-icon-close').removeClass('hide');
    //             //isSure = true;
    //             if (data.code === '200') {
    //                 $searchNum.addClass('search-active');
    //                 // 根据相似度排序
    //                 var result = [];
    //                 var infos = data.data;
    //                 for (var i = 0; i < infos.length; i++) {
    //                     if (infos[i].similarity.length === 1) {
    //                         result.push(infos[i]);
    //                     } else {
    //                         infos[i].similarity = infos[i].similarity.substr(0, infos[i].similarity.length - 1);
    //                         result.unshift(infos[i]);
    //                     }
    //                 }
    //                 result = sortData(result, 'similarity');
    //                 /**
    //                  * @param {Array} data 需排序对象数组
    //                  * @param {String} prop 对象属性条件
    //                  */
    //                 function sortData(data, prop) {
    //                     function compare(obj1, obj2) {
    //                         var time1 = obj1[prop] != '无' ? parseFloat(obj1[prop]) : 0,
    //                             time2 = obj2[prop] != '无' ? parseFloat(obj2[prop]) : 0;
    //                         if (time1 > time2) {
    //                             return -1;
    //                         } else if (time1 < time2) {
    //                             return 1;
    //                         } else {
    //                             return 0;
    //                         }
    //                     }
    //                     return data.sort(compare);
    //                 }
    //                 // 中心红色高亮区域文本
    //                 $num.text(result[0].similarity.split('%')[0]);
    //                 $text.text(result[0].platformName);

    //                 var html = '<ul class="company-box clearfix aui-row">';
    //                 for (var i = 1; i < result.length; i++) {
    //                     html += [
    //                         '<li class="aui-col-12">',
    //                         '   <span class="name">' + result[i].platformName + ':</span>',
    //                         '   <span class="num">' + result[i].similarity + '</span>',
    //                         '</li>'
    //                     ].join('');
    //                 }
    //                 html += '</ul>';
    //                 if ($searchNum.next('.company-box').length > 0) {
    //                     $searchNum.next('.company-box').remove();
    //                 }
    //                 $searchNum.after(html);
    //             } else if (data.code === '601') {
    //                 warningTip.say(data.message + ',请上传小于500KB的图片');
    //             } else {
    //                 warningTip.say(data.message);
    //             }
    //         }, '', 'POST', sourceType == 'ga' ? serviceUrlOther : '');
    //         //}
    //     } else {
    //         warningTip.say('请输入两张对比图片');
    //     }
    // });
    $('#imgComparison').on('click', debounce(function () {
        if ($('#search-before1').hasClass('none') && $('#search-before2').hasClass('none')) {
            // 添加加载动画
            window.showLoading($('.search-one-contrast'));
            $('.search-one-box').find('.aui-icon-close').addClass('hide');

            // 请求后台数据
            var sourceImg = $('#search-after1').find('#show').attr('src'),
                comparImg = $('#search-after2').find('#show2').attr('src'),
                // source = sourceImg.indexOf('data:image'),
                // compare = comparImg.indexOf('data:image'),
                $searchNum = $('.search-num'),
                $num = $searchNum.find('.num'),
                $text = $searchNum.find('.text-xm');
            //if (source !== -1 && compare !== -1) {
            window.loadData('v2/faceRecog/face1V1', true, {
                picture1: sourceImg,
                picture2: comparImg,
            }, function (data) {
                hideLoading($('.search-one-contrast'));
                $('.search-one-box').find('.aui-icon-close').removeClass('hide');
                if (data.code === '200') {
                    $searchNum.addClass('search-active');
                    // 根据相似度排序
                    var result = [];
                    var infos = data.data;
                    for (var i = 0; i < infos.length; i++) {
                        if (infos[i].similarity.length === 1) {
                            result.push(infos[i]);
                        } else {
                            infos[i].similarity = infos[i].similarity.substr(0, infos[i].similarity.length - 1);
                            result.unshift(infos[i]);
                        }
                    }
                    result = sortData(result, 'similarity');
                    /**
                     * @param {Array} data 需排序对象数组
                     * @param {String} prop 对象属性条件
                     */
                    function sortData(data, prop) {
                        function compare(obj1, obj2) {
                            var time1 = obj1[prop] != '无' ? parseFloat(obj1[prop]) : 0,
                                time2 = obj2[prop] != '无' ? parseFloat(obj2[prop]) : 0;
                            if (time1 > time2) {
                                return -1;
                            } else if (time1 < time2) {
                                return 1;
                            } else {
                                return 0;
                            }
                        }
                        return data.sort(compare);
                    }
                    // 中心红色高亮区域文本
                    $num.text(result[0].similarity.split('%')[0]);
                    $text.text(result[0].platformName);

                    var html = '<ul class="company-box clearfix aui-row">';
                    for (var i = 1; i < result.length; i++) {
                        html += [
                            '<li class="aui-col-12">',
                            '   <span class="name">' + result[i].platformName + ':</span>',
                            '   <span class="num">' + result[i].similarity + '</span>',
                            '</li>'
                        ].join('');
                    }
                    html += '</ul>';
                    if ($searchNum.next('.company-box').length > 0) {
                        $searchNum.next('.company-box').remove();
                    }
                    $searchNum.after(html);
                } else if (data.code === '601') {
                    warningTip.say(data.message + ',请上传小于500KB的图片');
                } else {
                    warningTip.say(data.message);
                }
            }, '', 'POST', sourceType == 'ga' ? serviceUrlOther : '');
            //}
        } else {
            warningTip.say('请输入两张对比图片');
        }
    }, 500));

    // 身份证号码查询个人图片
    $('.idcard-search-box .search-icon').on('click', function () {
        var $this = $(this),
            $input = $this.siblings(),
            $searchBox = $this.closest('.search-one-box'),
            $searchBoxBefore = $searchBox.find('.search-before'),
            $searchBoxAfter = $searchBox.find('.search-after');

        var card = $input.val();
        var reg = /(^\d{15}$)|(^\d{17}(\d|X)$)/;

        if (reg.test(card) === false) {
            $(this).closest('.idcard').find('.text-danger.tip').removeClass('hide');
            // warning.say('身份证号码有误');
            window.clearTimeout(handler);
            var handler = window.setTimeout(function () {
                $('.loadEffect').hide();
            }, 0);
            return false;
        }

        // 根据身份证号码请求图片
        window.loadData('v2/faceRecog/findImageByIdCard', true, {
            idcard: card
        }, function (data) {
            if (data.code === '200') {
                $searchBoxBefore.addClass('none');
                $searchBoxAfter.removeClass('none').find('img').attr({
                    'src': 'data:image/png;base64,' + data.base64
                });
            } else if (data.code === '105') {
                warning.say(data.message);
                window.clearTimeout(handler);
                var handler = window.setTimeout(function () {
                    $('.loadEffect').hide();
                }, 0);
            } else {
                warningTip.say(data.message);
            }
        }, '', 'GET', sourceType == 'ga' ? serviceUrlOther : '');

    });

    // 身份证号码校验
    $('.idcard-search-box').on('keyup', '.aui-input', function () {
        $(this).closest('.idcard').find('.text-danger.tip').addClass('hide');
    });

    // 身份证查询输入框键盘事件
    $('.idcard-search-box .aui-input').on('keydown', function (evt) {
        if (evt.keyCode === 13) {
            $(this).blur();
            $(this).siblings().click();
        }
    });

    // 警告信息提示框
    var warning = function () {
        var fn = {},
            layer = $('<div class="layer tip">' + '<h3>提示</h3>' + '<p></p>' + '</div>');
        fn.say = function (tips) {
            clearTimeout(delay);
            var delay = setTimeout(function () {
                layer.detach().find('p').text(tips).parent().appendTo($('body'));
                clearTimeout(handle);
                var handle = setTimeout(function () {
                    layer.detach();
                }, 1000);
            }, 500);
        };
        return fn;
    }();


    // 图片关闭按钮点击功能
    $('.aui-icon-close').on('click', function () {
        var $this = $(this),
            $after = $this.parents('.search-after'),
            $before = $after.siblings('.search-before'),
            $input = $before.find('.idcard-search-box .aui-input'),
            $pic = $before.find('.pic');
        $after.addClass('none');
        $before.removeClass('none');
        $input.val('');
        $pic[0].value = '';
        var $searchOneContrast = $('#searchOneContrast');
        $searchOneContrast.find('.search-num').removeClass('search-active');
        $searchOneContrast.find('.search-num .text-xm').text('相似度');
        $searchOneContrast.find('.num-0 .num').text('0');
        $searchOneContrast.find('.company-box').remove();
    })

    // 点击回退功能
    $('.icon-back').on('click', function () {
        var container = $('#content-box');
        var url = "./facePlatform/index-user.html?dynamic=" + window.Global.dynamic;
        window.loadPage(container, url);
    });

})(window, window.jQuery)