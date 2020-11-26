window.Global = {
    dynamic: Math.random()
};
window.allMidPicList = [] // 所有获取的中图
var isLoadAll = false; //全局变量，融合算法中是否所有厂家请求都返回的标志，默认为false
var isClickOneToOne = false; //全局变量，是否点击了右键菜单横向比对
var socketAlarmStatus = true;//最新告警是否需要暂停刷新

// 调用checkbox组件需要运行相关代码
function checkboxFunc() {
    $('[data-role="checkbox"]').checkboxradio();
    $('[data-role="checkbox-button"]').checkboxradio({
        icon: false
    });
}

// 调用radio组件需要运行相关代码
function radioFunc() {
    $('[ data-role="radio"]').checkboxradio();
    $('[ data-role="radio-button"]').checkboxradio({
        icon: false
    });
}

// 登录
function login() {
    if ($('#policemenID').val().replace(/\s/g, '') == '') {
        warning.say('警号不能为空');
        return;
    }
    if ($('#user_password').val().replace(/\s/g, '') == '') {
        warning.say('密码不能为空');
        return;
    }
    var port = 'v2/home/login',
        post_url = serviceUrl + '/' + port,
        data = {
            userName: $('#policemenID').val(),
            password: $('#user_password').val()
        };
    $.ajax({
        url: post_url,
        type: 'POST',
        cache: false,
        timeout: 15000,
        async: true,
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        data: JSON.stringify(data),
        beforeSend: function (xmlHttp) {
            xmlHttp.setRequestHeader('If-Modified-Since', '0');
            xmlHttp.setRequestHeader('Cache-Control', 'no-cache');
        },
        success: function (result) {
            if (result.code === "200") {
                $.cookie('xh_token', result.token);
                location.href = 'index.html';
            } else {
                $(".loginFail").text(result.message);
                $(".loginFail").show();
                // warning.say(result.message);
            }
        },
        error: function () {
            $(".loginFail").text("数据请求失败，请稍后再试");
            $(".loginFail").show();
            // warning.say("数据请求失败，请稍后再试");
        }
    });
}

// 获取客户端登录token
function getClientInfo() {
    var url = location.href;
    // 获取token
    if (url.indexOf("token") > 0) {
        var token = url.split("?")[1];
        if (token.indexOf('&') > 0) {
            var end = token.indexOf('&');
        } else {
            var end = token.length;
        }
        token = token.substring(6, end);
        $.cookie('xh_token', token);
    }
    var token = $.cookie('xh_token');
    // 获取用户ID
    if ($.cookie('xh_token')) {
        let port = 'v2/user/getUserInfo',
            post_url = serviceUrl + '/' + port;
        $.ajax({
            url: post_url,
            type: 'GET',
            async: true,
            headers: {
                token: token
            },
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (resultData) {
                if (resultData.code === "200") {
                    //全局加水印
                    watermark({
                        watermark_txt: resultData.identification
                    });
                    window.onresize = function () {
                        $(".mask_div").remove();
                        watermark({
                            watermark_txt: resultData.identification
                        });
                    };
                    $.cookie('xh_userId', resultData.userId);
                }
            }
        });
    }
}

/** ajax请求
 * @param { String } port  接口的路径
 * @param { Boolean } isAsync  是否为异步请求
 * @param { String } data  发送到服务器的参数
 * @param { Function } successFunc  请求成功后的回调函数
 * @param { String } position  请求成功后的回调函数的参数
 * @param {string} type  请求方式，post为默认可以不用传值
 * @param {string} url  适配公安网如果不传url用全局的serviceurl传的话就用传过来的地址和端口
 */
loadData = function (port, isAsync, data, successFunc, position, type, url) {
    var type = type ? type : 'POST', //默认是post请求
        serviceUrl1 = url ? url : serviceUrl,
        post_url = serviceUrl1 + '/' + port,
        token = $.cookie('xh_token');
    if (isEmpty(data)) {
        data = {};
    }
    data.token = token;
    if (type === 'POST') {
        data = JSON.stringify(data);
    } else if (type === 'DELETE') { //'DELETE'拼接url
        post_url += '?';
        var dataArr = [];
        for (var key in data) {
            dataArr.push(key);
        }
        dataArr.forEach(function (value, index) {
            if (index === dataArr.length - 1) {
                post_url += value + '=' + data[value];
            } else {
                post_url += value + '=' + data[value] + '&';
            }
        });
    }

    $.ajax({
        url: post_url,
        type: type,
        timeout: 15000,
        async: isAsync,
        headers: {
            token: token,
            platAccount: "facePlatform"
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        data: data,
        success: function (data) {
            var code = data.code;
            if (code === '200') {
                if (position) {
                    successFunc(data, position);
                } else {
                    successFunc(data, this);
                }
            } else {
                if (code === '607') {
                    location.href = 'login.html';
                } else {
                    successFunc(data);
                }
            }
        },
        error: function () {
            console.log("系统异常");
            warningTip.say("请求超时，请稍后再试！");
            $('.loading-box').addClass('hide');
            clearTimeout(handler);
            var handler = setTimeout(function () {
                $('.loadEffect').hide();
                //$('.loading-box').hide();
            }, 0);
        },
        beforeSend: function (xmlHttp) {
            $('.loadEffect').show();
            xmlHttp.setRequestHeader('If-Modified-Since', '0');
            xmlHttp.setRequestHeader('Cache-Control', 'no-cache');
        },
        complete: function (XMLHttpRequest, status) {
            clearTimeout(handler);
            var handler = setTimeout(function () {
                $('.loadEffect').hide();
            }, 0);
        }
    });
};

// 页面加载 同步加载
loadPage = function (container, url) {
    $.ajax({
        type: "GET",
        url: url,
        async: false,
        cache: false,
        dataType: 'html',
        beforeSend: function (xmlHttp) {
            xmlHttp.setRequestHeader('If-Modified-Since', '0');
            xmlHttp.setRequestHeader('Cache-Control', 'no-cache');
        },
        success: function (data) {
            /*添加版本号*/
            if ($('body').hasClass('ie8')) {
                container.html(data);
            } else {
                var _wrap = $(data);
                container.html(_wrap.html());
            }
        }
    });
};

/**
 * loading页面加载动画
 * @param {object} dom 参数为jquery节点对象
 * @param {*} transparent 
 */
function showLoading(dom, transparent) {
    if (dom.find('.loading-box').length === 0) {
        var html = `
        <div class="loading-box${transparent ? ' transparent' : ''}">
            <div class="aui-spin aui-spin-spinning">
                <span class="aui-spin-icon aui-spin-icon-spin"></span>
            </div>
        </div>
        `;
        dom.addClass('loading-position');
        dom.append(html);
        if (transparent) {
            dom.find('.chart').addClass('hide');
        }
    }
}

/**
 * 隐藏loading页面加载动画
 * @param {object} dom 参数为jquery节点对象
 */
function hideLoading(dom) {
    dom.find(".loading-box").remove();
    dom.removeClass('loading-position');
}

//是否为空
function isEmpty(obj) {
    return obj == null || obj == '' || obj == undefined || obj == 'undefined' ? true : false;
}

/**
 * 清除空数据展示
 * @param {object} $dom 参数为jquery节点对象
 */
function removeEmpty($dom) {
    $dom.remove();
}

/**
 * 数据为空时 加载空页面
 * @param {object} $dom    空节点需要参入的目标节点容器 参数为jquery节点对象
 * @param {string} mainTitle   定制空节点需要的主标题提示信息
 * @param {string} subTitle   定制空节点需要的副标题提示信息
 * @param {boolean} noShowSubTitle  是否不展示副标题提示信息，默认或false为展示副标题，true不展示副标题
 * @param {boolean} noShowSubTitle  是否不展示空数据图片
 */
function loadEmpty($dom, mainTitle, subTitle, noShowSubTitle, noShowEmptyImg) {
    var html = `<div class="flex-column-wrap empty-wrap">
		            <div class="aui-card flex-container overflow-hidden">
		                <div class="flex-middle">
		                    ${noShowEmptyImg ? '' : '<img class="filter-img" src="./assets/images/common/no-data.png" alt="">'}
		                    <h4 class="text-lg text-bold">${mainTitle ? mainTitle : "暂无检索结果"}</h4>
		                    <p class="text-normal text-lighter aui-mt-xs ${noShowSubTitle ? 'display-none' : ''}">${subTitle ? subTitle : " "}</p>
		                </div>
		            </div>
		        </div>`;
    $dom.empty().append(html);
    // 分页隐藏
    var $page = $dom.find('.pagination-wrap');
    if ($page.length > 0) {
        $page.addClass('hide');
    }
}

/**
 * 清除上面空数据节点
 * @param {object} dom 参数为jquery节点对象
 */
function removeLoadEmpty(dom) {
    var $filterImg = dom.find('.filter-img'),
        src = $filterImg.attr('src');
    if ($filterImg.length > 0 && src.indexOf('no-data.png') > 0) {
        $filterImg.closest('.flex-column-wrap').remove();
    }
    // 分页显示
    var $page = dom.find('.pagination-wrap');
    if ($page.length > 0) {
        $page.removeClass('hide');
    }
}

/**
 * 设置分页数据 和 分页点击事件回调 的公共方法
 * @param { object } $container 分页组件的目标容器
 * @param { number } totalSize  分页的总数据条数
 * @param { number } totalPage  分页需要的总页数
 * @param { object } eventCallBack  所有会触发分页加载数据的回调事件
 * @param { boolean } isShowPageSizeOpt  是否显示设置分页每页展示的数据条数；false不能设置分页每页的数据
 * @param { object } pageSizeOpt  当isShowPageSizeOpt为true，设置分页每页可以展示数据的条数
 */
function setPageParams($container, totalSize, totalPage, eventCallBack, isShowPageSizeOpt, pageSizeOpt) {
    if (totalPage <= 1) {
        $container.empty();
    } else {
        $container.empty().whjPaging({
            totalSize: totalSize,
            totalPage: totalPage,
            isShowPageSizeOpt: isShowPageSizeOpt,
            pageSizeOpt: pageSizeOpt,
            isShowRefresh: false,
            confirm: "GO",
            totalPageText: '共{}页，',
            totalSizeText: "共{}条结果",
            isResetPage: false,
            callBack: function (currPage, pageSize, container, selectPageSizeOpt) {
                eventCallBack(currPage, pageSize, container, selectPageSizeOpt);
            }
        });
    }
}

// 警告信息提示框(客户端？)  后来使用的是warningTip
warning = function () {
    var fn = {},
        layer = $('<div class="layer tip" style="position: absolute;top: 0; left: 0; width: 100%; height: 100%; color: #fff; z-index: 2; text-align: center;">' + '<h3>提示</h3>' + '<p></p>' + '</div>');
    fn.say = function (tips) {
        clearTimeout(delay);
        var delay = setTimeout(function () {
            clearTimeout(handle);
            var handle = setTimeout(function () {
                layer.detach();
            }, 500);
        }, 500);
    };
    return fn;
}();

// 警告信息提示框
var warningTip = function () {
    var fn = {},
        layer = $([
            '<div class="layer tip status-item clearfix">',
            '    <div class="float-left">',
            '       <i class="aui-icon-information text-lg text-warning"></i>',
            '       <span class="status-text text-md"></span>',
            '   </div>',
            '   <div class="float-right">',
            '       <span class="text-mg">&nbsp;</span>',
            '       <i class="text-lg aui-icon-not-through"></i>',
            '   </div>',
            '</div>',
        ].join(''));
    fn.say = function (tips, type, close) {
        clearTimeout(delay);
        var delay = setTimeout(function () {
            if (type === 1) {
                layer.find('.text-warning').removeClass('text-warning').addClass('text-success')
                layer.find('.aui-icon-information').removeClass('aui-icon-information').addClass('aui-icon-success')
            } else {
                layer.find('.text-success').removeClass('text-success').addClass('text-warning')
                layer.find('.aui-icon-success').removeClass('aui-icon-success').addClass('aui-icon-information')
            }
            layer.detach().find('.status-text').text(tips);
            layer.appendTo($('body'));
            layer.find('.aui-icon-not-through').on('click', function () {
                clearTimeout(handle);
                layer.detach();
            });
            clearTimeout(handle);
            var handle = setTimeout(function () {
                !close && layer.detach();
            }, 3000);
        }, 500);
    };
    return fn;
}();

//下载公共方法 
function downLoadCommon(url, filename) {
    var port = 'v2/file/exportFileToCache',
        portData = {
            'url': url,
            'name': filename
        },
        successFunc = function (data) {
            if (data.code == '200') {
                var post_url = serviceUrl + '/v2/file/exportFile?downId=' + data.downId + '&token=' + $.cookie('xh_token');
                if ($("#IframeReportImg").length === 0) {
                    $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
                }
                $('#IframeReportImg').attr("src", post_url);
            } else {
                warningTip.say(data.message);
            }
        };
    loadData(port, true, portData, successFunc);
};

/**
 * 拼接左侧菜单导航栏页面
 * @param { Array } data  获取用户操作模块权限数组
 */
function createSidebar(data) {
    var html = `
        <div class="sidebar-inner" id="pageSidebarMenu">
            <ul class="sidebar-list">
                <li class="sidebar-item" id="${data[0].moduleCode}" mid="">
                    <a href="#" lc="${data[0].url}">
                        <i class="aui-icon-color-default ${data[0].icon}"></i>
                        <div class="sidebar-item-title">${data[0].moduleName}</div>
                    </a>
                </li>
    `;
    var bottomSidebar = 0;
    if (data.length > 1) {
        for (var i = 1; i < data.length; i++) {
            if (data[i].moduleCode === '2608') {
                bottomSidebar++;
                sidebarClass = 'sidebar-tool';
            } else if (data[i].moduleCode === '2607') {
                bottomSidebar++;
                sidebarClass = 'sidebar-tool';
            } else if (data[i].moduleCode === '2605') {
                bottomSidebar++;
                sidebarClass = 'sidebar-tool';
            } else if (data[i].moduleCode === '2609') {
                bottomSidebar++;
                sidebarClass = 'sidebar-tool';
            } else if (data[i].moduleCode === '2616') {
                bottomSidebar++;
                sidebarClass = 'sidebar-tool';
            } else if (data[i].moduleCode === '2618') {
                bottomSidebar++;
                sidebarClass = 'sidebar-tool';
            } else {
                sidebarClass = '';
            }

            if (data[i].moduleCode === '2608') {
                html += `<li class="sidebar-item ${sidebarClass == 'sidebar-tool' ? (sidebarClass + bottomSidebar) : sidebarClass}" id="${data[i].moduleCode}" mid="">
                    <a href="#" lc="${data[i].url}">
                        <i class="aui-icon-color-default ${data[i].icon}"></i>
                        <span class="redNum hide">10</span>
                        <div class="sidebar-item-title">${data[i].moduleName}</div>
                    </a>
                </li>`;
            } else {
                html += `<li class="sidebar-item ${sidebarClass == 'sidebar-tool' ? (sidebarClass + bottomSidebar) : sidebarClass}" id="${data[i].moduleCode}" mid="">
                    <a href="#" lc="${data[i].url}">
                        <i class="aui-icon-color-default ${data[i].icon}"></i>
                        <div class="sidebar-item-title">${data[i].moduleName}</div>
                    </a>
                </li>`;
            }
        }
    }
    html += `
            </ul>
        </div>
    `
    return html;
}

/**
 * 身份证查找公共方法
 * @param {object} event 事件
 * @param {string} libId 库id
 */
function findIdcard(event, libId) {
    var targetId = $(event.currentTarget).attr('id');
    var card = $(event.currentTarget).val();
    if (!targetId) {
        targetId = $(event.currentTarget).prev().attr('id');
        card = $(event.currentTarget).prev().val();
    }
    // var inputId = $(event.currentTarget).prev().attr('id'); // 输入框ID
    // if (targetId === 'idcardsearch' || targetId === 'idcardsearchindex') {
    //     var card = $(event.currentTarget).val();
    // } else {
    //     var card = $(event.currentTarget).prev().val();
    // }
    // var reg = /(^\d{15}$)|(^\d{17}(\d|X)$)/;
    if ($.trim(card)) {
        // if (reg.test(card) == false) {
        //     $('#content-box').children('.content-save-item').not('.hide').find(".idcard-alert").addClass("show").text('身份证号码有误');
        //     warningTip.say('输入身份证号码有误，请重新输入');
        //     return false;
        // }
        var port = 'v2/faceRecog/findImageByIdCard',
            data = {
                idcard: card,
                libIds: libId || ''
            },
            successFunc = function (data) {
                if (data.code === '200') {
                    $('#content-box').children('.content-save-item').not('.hide').find(".idcard-alert").removeClass("show");
                    // 判断是否为首页点击搜索身份证号
                    if ($('#usearchImg').length === 0 && targetId !== 'idcardsearchindex' && targetId !== 'peeridcardsearch' && targetId !== 'idCardSearchS' && targetId !== 'idcardsearchDynamic') {
                        $('#imgBase64')[0].value = '';
                        $('#imgBase64').val(data.base64);
                        $("#uindexImg img").attr({
                            'src': data.base64
                        });
                        $('#uindexsearch').click();
                    } else if (targetId === 'idcardsearchindex') {
                        var $imgBox = $('#uindexImg');
                        $imgBox.find('img').attr('src', data.base64);
                        $imgBox.find('.icon').removeClass('hide');
                        $imgBox.find('.user-img-wrap').addClass('up');
                        $('#imgBase64').data('base64', data.base64);
                        $("#uindexImg .text").hide();
                    } else if (targetId === 'peeridcardsearch') {
                        var html = createAddImageItem('data:image/png;base64,' + data.base64, data.staticId);
                        $('#peerAddSearchImg').find('.add-image-icon').before(html);
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
                        $('#peerAddSearchImg').removeClass('center');
                        $('#peerAddSearchImg').find('.add-image-icon').removeClass('add-image-new');
                        $('#peerAddSearchImg').find('.add-image-box-text').addClass('hide');
                        $("#peerAddSearchImg .add-image-icon").siblings('.add-image-item').removeClass('active').eq(-1).addClass('active');
                    } else if (targetId === 'idCardSearchS') {
                        var html = createAddImageItem('data:image/png;base64,' + data.base64, data.staticId, card);
                        $('#searchImgS').find('.add-image-icon').before(html);
                        $('#searchImgS').prev().find('img').attr('src', 'data:image/png;base64,' + data.base64);
                        $('#searchImgS').find('.uploadFile')[0].value = '';
                        var $imgItem = $('#searchImgS').find('.add-image-item');
                        if ($imgItem.length > 5) {
                            $('#searchImgS').removeClass('scroll');
                            var clientH = $('#searchImgS')[0].clientHeight;
                            $('#searchImgS').addClass('scroll');
                            $('#searchImgS').animate({
                                'scrollTop': clientH
                            }, 500);
                        }
                        $('#searchImgS').removeClass('center');
                        $('#searchImgS').find('.add-image-icon').removeClass('add-image-new');
                        $('#searchImgS').find('.add-image-box-text').addClass('hide');
                        $("#searchImgS .add-image-icon").siblings('.add-image-item').removeClass('active').eq(-1).addClass('active');
                    } else if (targetId === 'idcardsearchDynamic') {
                        //if ($("#current-page-dynamic").find(".idcardSelect .ui-checkboxradio-label").hasClass("ui-checkboxradio-checked")) {   //在逃库
                        if ($("#current-page-dynamic").find(".idcardSelect").val() == '22') {   //在逃库
                            var html = createAddImageItem('data:image/png;base64,' + data.base64, data.staticId, card, true);
                            $("#dynamicsearchDynamic").removeClass("hide");
                            $("#dynamicApply").addClass("hide");
                        } else {
                            var html = createAddImageItem('data:image/png;base64,' + data.base64, data.staticId, card);
                        }
                        var $imgItem = $('#usearchImgDynamic').find('.add-image-item');
                        $imgItem.filter(".active").removeClass("active");
                        $('#usearchImgDynamic').find('.add-image-icon').before(html);
                        $('#usearchImgDynamic').find('.uploadFile')[0].value = '';
                        if ($imgItem.length > 5) {
                            $('#usearchImgDynamic').removeClass('scroll');
                            var clientH = $('#usearchImgDynamic')[0].clientHeight;
                            $('#usearchImgDynamic').addClass('scroll');
                            $('#usearchImgDynamic').animate({
                                'scrollTop': clientH
                            }, 500);
                        }
                        imgDom(data.base64, $('#dynamicsearchDynamic'), $("#usearchImgDynamic"), true);
                        $('#usearchImgDynamic').removeClass('center');
                        $('#usearchImgDynamic').find('.add-image-icon').removeClass('add-image-new');
                        $('#usearchImgDynamic').find('.add-image-box-text').addClass('hide');
                        $("#usearchImgDynamic .add-image-icon").siblings('.add-image-item').removeClass('active').eq(-1).addClass('active');
                    } else {
                        //if ($("#current-page").find(".idcardSelect .ui-checkboxradio-label").hasClass("ui-checkboxradio-checked")) {   //在逃库
                        if ($("#current-page").find(".idcardSelect ").val() == '22') {   //在逃库
                            var html = createAddImageItem('data:image/png;base64,' + data.base64, data.staticId, card, true);
                            $("#mergeSearch").removeClass("hide");
                            $("#mergeApply").addClass("hide");
                            $("#headingTwo").find(".ui-checkboxradio-checkbox-label").addClass("ui-checkboxradio-checked").attr("authority", '1');
                        } else {
                            var html = createAddImageItem('data:image/png;base64,' + data.base64, data.staticId, card);
                        }
                        var $imgItem = $('#usearchImg').find('.add-image-item');
                        $imgItem.filter(".active").removeClass("active");
                        $('#usearchImg').find('.add-image-icon').before(html);
                        $('#usearchImg').find('.uploadFile')[0].value = '';
                        if ($imgItem.length > 5) {
                            $('#usearchImg').removeClass('scroll');
                            var clientH = $('#usearchImg')[0].clientHeight;
                            $('#usearchImg').addClass('scroll');
                            $('#usearchImg').animate({
                                'scrollTop': clientH
                            }, 500);
                        }
                        if ($('#dynamicsearch').length > 0) {
                            imgDom(data.base64, $('#dynamicsearch'), $("#usearchImg"), true);
                        } else {
                            imgDom(data.base64, $('#mergeSearch'), $("#usearchImg"), true);
                        }
                        $('#usearchImg').removeClass('center');
                        $('#usearchImg').find('.add-image-icon').removeClass('add-image-new');
                        $('#usearchImg').find('.add-image-box-text').addClass('hide');
                        $("#usearchImg .add-image-icon").siblings('.add-image-item').removeClass('active').eq(-1).addClass('active');
                    }
                } else {
                    warningTip.say(data.message);
                    $('#content-box').children('.content-save-item').not('.hide').find(".idcard-alert").addClass("show").text(data.message);
                }
            };
        loadData(port, true, data, successFunc, '', 'GET', sourceType == 'ga' ? serviceUrlOther : '');
    } else {
        warningTip.say('请输入身份证号码');
        $('#content-box').children('.content-save-item').not('.hide').find(".idcard-alert").addClass("show").text('请输入身份证号码');
    }
}

/************************* 日期组件公共函数 start *************************/
/**
 * 时间段组件的初始化
 * @param {object}   dom  		日历组件节点
 * @param {number}   date 		需要计算的时间节点,支持正负
 * @param {boolean}  destory 	是否需要重置当前日历组件
 * @param {boolean}  isRight 	日期选择组件图标绑定事件
 * @param {boolean}  isMonth 	是否需要计算整月
 * @param {boolean}  dateLimit  设置日历组件可选天数范围
 */
// 初始化日历组件时间
function initDatePicker(dom, date, destory, isRight, isMonth, dateLimit) {
    if (destory) {
        $(dom).datepicker('remove');
        $(dom).find('input').eq(0).val('');
        $(dom).find('input').eq(1).val('');
    }
    if (isMonth) {
        if (date <= 0 && date != '') {
            $(dom).find('input').eq(0).val(moment().format('YYYY-MM-DD'));
            $(dom).find('input').eq(1).val(moment().add(-date, 'months').format('YYYY-MM-DD'));
        } else if (date > 0 && date != '') {
            $(dom).find('input').eq(0).val(moment().add(date, 'months').format('YYYY-MM-DD'));
            $(dom).find('input').eq(1).val(moment().format('YYYY-MM-DD'));
        }
    } else {
        if (date <= 0 && date != '') {
            $(dom).find('input').eq(1).val(sureSelectTime(date).now);
            $(dom).find('input').eq(0).val(sureSelectTime(date).date);
        } else if (date > 0 && date != '') {
            $(dom).find('input').eq(0).val(sureSelectTime(date).now);
            $(dom).find('input').eq(1).val(sureSelectTime(date).date);
        }
    }
    if (dateLimit) {
        var startDate = date ? sureSelectTime(date).now : sureSelectTime(dateLimit.limitLength).now,
            endDate = date ? sureSelectTime(date).date : sureSelectTime(dateLimit.limitLength).date,
            limitStartDate = dateLimit.startDate ? dateLimit.startDate : sureSelectTime(dateLimit.limitLength).now,
            limitEndDate = dateLimit.endDate ? dateLimit.endDate : sureSelectTime(dateLimit.limitLength).date;
        if (dateLimit.startDate) {
            $(dom).find('input').eq(0).val(dateLimit.startDate);
        } else {
            $(dom).find('input').eq(0).val(startDate);
        }
        if (dom == '#postpone-datepicker') {
            $(dom).find('input').eq(0).val(limitEndDate);
        }
        $(dom).find('input').eq(1).val(endDate);
        // 布控模块 新建 点击时间组件 与组件之前的3天 一周 半个月 时间标签联动
        if (dateLimit.connection) {
            $(dom).datepicker({
                autoclose: true,
                todayHighlight: true,
                startDate: limitStartDate,
                endDate: limitEndDate,
                language: "zh-CN",
                format: 'yyyy-mm-dd',
                onSelect: window.selectDateFunc
            }).on('changeDate', window.selectDateFunc);
        } else {
            $(dom).datepicker({
                autoclose: true,
                todayHighlight: true,
                startDate: limitStartDate,
                endDate: limitEndDate,
                language: "zh-CN",
                format: 'yyyy-mm-dd'
            });
        }
        if (dateLimit.startDate) {
            $(dom).find('input').eq(0).val(dateLimit.startDate);
        } else {
            $(dom).find('input').eq(0).val(startDate);
        }
        if (dom == '#postpone-datepicker') {
            $(dom).find('input').eq(0).val(limitEndDate);
        }

    } else {
        $(dom).datepicker({
            autoclose: true,
            todayHighlight: true,
            language: "zh-CN",
            format: 'yyyy-mm-dd'
        });
        if (date <= 0 && date != '') {
            $(dom).find('input').eq(1).datepicker('setDates', sureSelectTime(date).now);
            $(dom).find('input').eq(0).datepicker('setDates', sureSelectTime(date).date);
        } else if (date > 0 && date != '') {
            $(dom).find('input').eq(0).datepicker('setDates', sureSelectTime(date).now);
            $(dom).find('input').eq(1).datepicker('setDates', sureSelectTime(date).date);
        }
    }
    // 日期选择组件图标绑定事件
    if (isRight) {
        $(dom).on('click', '.input-group-addon', function () {
            $(this).prev('.datepicker-input').focus();
        })
    } else {
        $(dom).on('click', '.input-group-addon', function () {
            $(this).siblings('.datepicker-input').eq(0).focus();
        })
    }
}

/**
 * 时间段组件的初始化
 * @param {object}   dom  		日历组件节点
 * @param {number}   date 		需要计算的时间节点,支持正负
 * @param {boolean}  destory 	是否需要重置当前日历组件
 * @param {boolean}  isRight 	日期选择组件图标绑定事件
 * @param {boolean}  isMonth 	是否需要计算整月
 * @param {boolean}  dateLimit  设置日历组件可选天数范围
 */
// 初始化日历组件时间
function initDatePicker1(dom, date, destory, isRight, isMonth, dateLimit) {
    if (destory) {
        $(dom).find('input').eq(0).val('');
        $(dom).find('input').eq(1).val('');
    }
    if (isMonth) {
        if (date <= 0 && date != '') {
            $(dom).find('input').eq(0).val(moment().format('YYYY-MM-DD'));
            $(dom).find('input').eq(1).val(moment().add(-date, 'months').format('YYYY-MM-DD'));
        } else if (date > 0 && date != '') {
            $(dom).find('input').eq(0).val(moment().add(date, 'months').format('YYYY-MM-DD'));
            $(dom).find('input').eq(1).val(moment().format('YYYY-MM-DD'));
        }
    } else {
        if (date <= 0 && date != '') {
            $(dom).find('input').eq(1).val(sureSelectTime(date).now);
            $(dom).find('input').eq(0).val(sureSelectTime(date).date);
        } else if (date > 0 && date != '') {
            $(dom).find('input').eq(0).val(sureSelectTime(date).now);
            $(dom).find('input').eq(1).val(sureSelectTime(date).date);
        }
    }
    if (dateLimit) {
        var startDate = date ? sureSelectTime(date).now : sureSelectTime(dateLimit.limitLength).now,
            endDate = date ? sureSelectTime(date).date : sureSelectTime(dateLimit.limitLength).date,
            limitStartDate = dateLimit.startDate ? dateLimit.startDate : sureSelectTime(dateLimit.limitLength).now,
            limitEndDate = dateLimit.endDate ? dateLimit.endDate : sureSelectTime(dateLimit.limitLength).date;
        if (dateLimit.startDate) {
            $(dom).find('input').eq(0).val(dateLimit.startDate);
        } else {
            $(dom).find('input').eq(0).val(startDate);
        }
        if (dom == '#postpone-datepicker') {
            $(dom).find('input').eq(0).val(limitEndDate);
        }
        $(dom).find('input').eq(1).val(endDate);
        // 布控模块 新建 点击时间组件 与组件之前的3天 一周 半个月 时间标签联动
        // if (dateLimit.connection) {
        //     $(dom).datepicker({
        //         autoclose: true,
        //         todayHighlight: true,
        //         startDate: limitStartDate,
        //         endDate: limitEndDate,
        //         language: "zh-CN",
        //         format: 'yyyy-mm-dd',
        //         onSelect: window.selectDateFunc
        //     }).on('changeDate', window.selectDateFunc);
        // } else {
        //     $(dom).datepicker({
        //         autoclose: true,
        //         todayHighlight: true,
        //         startDate: limitStartDate,
        //         endDate: limitEndDate,
        //         language: "zh-CN",
        //         format: 'yyyy-mm-dd'
        //     });
        // }
        if (dateLimit.startDate) {
            $(dom).find('input').eq(0).val(dateLimit.startDate);
        } else {
            $(dom).find('input').eq(0).val(startDate);
        }
        if (dom == '#postpone-datepicker') {
            $(dom).find('input').eq(0).val(limitEndDate);
        }
    }
    // 日期选择组件图标绑定事件
    if (isRight) {
        $(dom).on('click', '.input-group-addon', function () {
            $(this).prev('.datepicker-input').focus();
        })
    } else {
        $(dom).on('click', '.input-group-addon', function () {
            $(this).siblings('.datepicker-input').eq(0).focus();
        })
    }
}

/**
 * 根据选中时间计算时间段
 * @param {number} day	传入时间 
 * @param {number} isDay 是否需要时分秒
 */
function sureSelectTime(day, isDay) {
    // 格式化时间代码
    function doHandleMonth(month) {
        var m = month;
        if (month.toString().length === 1) {
            m = '0' + month;
        }
        return m;
    }

    var today = new window.Date();
    var hours = today.getHours();
    var minutes = today.getMinutes();
    var seconds = today.getSeconds();
    if (parseInt(hours) < 10) {
        hours = '0' + hours;
    }
    if (parseInt(minutes) < 10) {
        minutes = '0' + minutes;
    }
    if (parseInt(seconds) < 10) {
        seconds = '0' + seconds;
    }

    if (day == '') {
        var year = today.getFullYear();
        var month = today.getMonth();
        var date = today.getDate();
        month = doHandleMonth(month + 1);
        date = doHandleMonth(date);
        if (isDay) {
            return {
                date: '~',
                now: year + '-' + month + '-' + date + ' ',
            }
        } else {
            return {
                date: '~',
                now: year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds,
            }
        }
    } else {
        var formatDay = today.getTime() + 1000 * 60 * 60 * 24 * day;
        today.setTime(today.getTime());
        var year = today.getFullYear();
        var month = today.getMonth();
        var date = today.getDate();
        month = doHandleMonth(month + 1);
        date = doHandleMonth(date);
        today.setTime(formatDay);
        var tYear = today.getFullYear();
        var tMonth = today.getMonth();
        var tDate = today.getDate();
        tMonth = doHandleMonth(tMonth + 1);
        tDate = doHandleMonth(tDate);
        if (isDay) {
            return {
                date: tYear + '-' + tMonth + '-' + tDate + ' ',
                now: year + '-' + month + '-' + date + ' ',
            }
        } else {
            return {
                date: tYear + '-' + tMonth + '-' + tDate + ' ' + hours + ':' + minutes + ':' + seconds,
                now: year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds,
            }
        }
    }
}

/**
 * 日期转换
 * @param {number} day	传入时间 （毫秒）
 * @param {number} isDay 是否需要时分秒
 */
function changeFormat(day, isDay) {
    var date = new Date(parseInt(day));
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

    if (isDay) {
        return Y + M + D + ' ' + h + m + s;
    } else {
        return Y + M + D;
    }
}

/****************日期组件公共函数 end****************/
/*************************  检索模块 start  *************************/
/** 升序排序数据
 * @param {Array} data 需排序对象数组
 * @param {String} prop 对象属性条件
 */
function sortData(data, prop) {
    function compare(obj1, obj2) {
        var time1 = obj1[prop],
            time2 = obj2[prop];
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

/**
 * 数据去重
 * @param {*} array 需要去重的数组
 */
function unique(array) {
    var temp = [];
    var index = [];
    var l = array.length;
    for (var i = 0; i < l; i++) {
        for (var j = i + 1; j < l; j++) {
            if (array[i].picId === array[j].picId) {
                i++;
                j = i;
            }
        }
        temp.push(array[i]);
        index.push(i);
    }
    return temp;
}

// 按照厂商名字进行排序
function sortInfo(a, b) {
    var order = ['商汤', '依图', 'Face++', '优图', '云天'];
    return order.indexOf(a.platformName) - order.indexOf(b.platformName);
}

/**
 * 生成动态抓拍库左侧搜索图片节点
 * @param {String} src 上传图片路径
 * @param {String} staticId 图片id用于特殊人员
 * @param {String} idcard 图片身份证
 * @param {Boolean} flag  是否是在逃库
 */
function createAddImageItem(src, staticId, idcard, flag) {
    var html = `
        <div class="add-image-item active" value="${Math.random()}">
            <img class="add-image-img" src="${src}" alt="" title="双击可截图" ${staticId ? 'picid=' + staticId : ''} ${idcard ? 'idcard=' + idcard : ''} ${flag ? 'zt=1' : ''}>
            <i class="aui-icon-delete-line"></i>
        </div> 
        `;
    return html;
}

/** 
 * 获取图片id
 * @param {String} data 图片Base64值
 * @param {String} imgValue 当前图片的value值
 * @param {String} $usearchImg 不同页面 图片添加box
 */
window.getPicId = function (data, imgValue, $usearchImg) {
    if (data.indexOf("http") == 0) { //url
        var portData = {
            url: data,
            staticId: $usearchImg.find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'),
            moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
        };
    } else { //base64
        var portData = {
            base64: data,
            staticId: $usearchImg.find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'),
            moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
        };
    }

    var port = 'v2/faceRecog/uploadImage',
        successFunc = function (data) {
            if (data.code == '200') {
                $usearchImg.find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                    if ($(ele).attr('value') == imgValue) {
                        // 给当前选中的图片绑定id
                        $(ele).find('.add-image-img').attr('picId', data.staticId);
                        $(ele).find('.add-image-img').attr('picStatus', '1');

                        var type = '1',
                            commentId = '';
                        //动态页面
                        if ($usearchImg.attr("id") == 'usearchImgDynamic') {
                            type = '2';
                            commentId = $("#commentSelectDynamic").find(".selectpicker").val();
                        } else if ($usearchImg.attr("id") == 'searchImgS') {
                            type = '1';
                            commentId = $("#commentSelectStatic").find(".selectpicker").val();
                        } else {
                            type = '3';
                            commentId = $("#commentSelectMerge").find(".selectpicker").val();
                        }
                        getPowerUse(type, commentId, data.staticId);
                    }
                })
            } else {
                warningTip.say(data.message);
                $usearchImg.find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                    if ($(ele).attr('value') == imgValue) {
                        $(ele).find('.add-image-img').attr('picStatus', '0');
                    }
                })
            }
        };
    loadData(port, false, portData, successFunc);
}

/** 
 * 上传图片 判断是否为多张人脸照片 并将需要图片 插入上传图片框
 * @param {string} base64   图片的base64值
 * @param {object} $imgBox  搜索按钮
 * @param {object} $insertDom  上传图片节点
 * @param {Boolean} change 是否点击搜索
 * @param {Boolean} bigMask 是否动态检索弹窗大图检索调用的
 * @param {object} otherData 后台判断检索是否通报专用数据
 */
function imgDom(base64, $imgBox, $insertDom, change, bigMask, otherData = {}) {
    if (base64.indexOf("http") == 0) { //base64
        var data = {
            url: base64,
            moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
            searchIndex: JSON.stringify(otherData) != '{}' ? otherData.searchIndex : '',
            searchId: JSON.stringify(otherData) != '{}' ? otherData.searchId : ''
        };
    } else {
        var data = {
            base64: base64,
            moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
            searchIndex: JSON.stringify(otherData) != '{}' ? otherData.searchIndex : '',
            searchId: JSON.stringify(otherData) != '{}' ? otherData.searchId : ''
        };
    }
    var imgValue = $insertDom.find('.add-image-item').filter('.active').attr('value');
    showLoading($imgBox);
    if ($imgBox.attr("id") == "dynamicsearchDynamic") {  //纯动态
        $("#cjDynamicOne").addClass("text-disabled");
        $("#cjDynamicOne").prev().addClass("text-disabled");
        $("#cjDynamicTwo").addClass("text-disabled");
        $("#cjDynamicTwo").prev().addClass("text-disabled");
    } else if ($imgBox.attr("id") == "mergeSearch") {
        $("#cjMergeOne").addClass("text-disabled");
        $("#cjMergeOne").prev().addClass("text-disabled");
        $("#cjMergeTwo").addClass("text-disabled");
        $("#cjMergeTwo").prev().addClass("text-disabled");
    }
    (function (imgValue) {
        var port = 'v2/faceRecog/cutFaceId',
            successFunc = function (info) {
                hideLoading($imgBox);
                if (info.code === '200') {
                    var html = '';
                    if ($("#pageSidebarMenu").find(".aui-icon-monitor").parents(".sidebar-item").hasClass("active")) { //纯动态
                        var $myModal = $('#myModalDynamic');
                    } else if ($("#pageSidebarMenu").find(".aui-icon-left-personnal-retrieval").parents(".sidebar-item").hasClass("active")) {
                        var $myModal = $('#myModalStatic');
                    } else {
                        var $myModal = $('#myModal');
                    }
                    $myModal.find('.add-image-wrap').removeClass('hide');

                    if ($imgBox.attr("id") == "dynamicsearchDynamic") {  //纯动态
                        $("#cjDynamicOne").removeClass("text-disabled");
                        $("#cjDynamicOne").prev().removeClass("text-disabled");
                        $("#cjDynamicTwo").removeClass("text-disabled");
                        $("#cjDynamicTwo").prev().removeClass("text-disabled");
                    } else if ($imgBox.attr("id") == "mergeSearch") {
                        $("#cjMergeOne").removeClass("text-disabled");
                        $("#cjMergeOne").prev().removeClass("text-disabled");
                        $("#cjMergeTwo").removeClass("text-disabled");
                        $("#cjMergeTwo").prev().removeClass("text-disabled");
                    }

                    //hideLoading($('#content-box'));
                    if (info.data.length < 2) { // 上传图片为单张人脸
                        //getPicId($('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('src')); // 获取图片id
                        if (bigMask) {
                            var selectHtml = '';
                            selectHtml += [
                                '<div class="add-image-item active" value="' + Math.random() + '">',
                                '   <img class="add-image-img" title="双击可截图" src="' + (info.data.length == 1 ? ('data:image/png;base64,' + info.data[0].base64) : base64) + '" alt="" title="双击可截图" picId="' + (info.data.length == 1 ? info.data[0].staticId : info.staticId) + '">',
                                '   <i class="aui-icon-delete-line"></i>',
                                '</div>'
                            ].join('');
                            $insertDom.find('.add-image-item').removeClass('active')
                            $insertDom.find('.add-image-icon').before(selectHtml);
                        } else {
                            $insertDom.find('.add-image-item.active').removeClass('active');
                            $insertDom.find('.add-image-item').each(function (index, ele) {
                                if ($(ele).attr('value') == imgValue) {
                                    $(ele).find('.add-image-img').attr('picId', info.staticId);
                                    $(ele).addClass('active');
                                }
                            })
                            $insertDom.find('.add-image-item.active').attr("title", "双击可截图");
                            // $insertDom.find('.add-image-item').filter('.active').find('.add-image-img').attr('picId', info.staticId);
                        }
                        if (!change) {
                            $imgBox.click();
                        }
                        var searchAlarm = $('#imgBase64').data('searchAlarm');
                        if (searchAlarm) {
                            $('#imgBase64').removeData('searchAlarm');
                            $imgBox.click();
                        }
                        return;
                    }
                    var faceList = info.data;
                    faceList.forEach(v => {
                        html += [
                            '<div class="add-image-item active" value="' + Math.random() + '">',
                            '   <img class="add-image-img" title="双击可截图" src="data:image/png;base64,' + v.base64 + '" alt="" picId="' + v.staticId + '">',
                            '   <i class="aui-icon-delete-line"></i>',
                            '</div>'
                        ].join('');
                    });
                    $myModal.modal('show');
                    $myModal.find('.modal-face-num').text('(' + faceList.length + ')');
                    $myModal.find('.modal-face-img').attr({
                        'src': base64,
                        'picId': info.staticId
                    });
                    $myModal.find('.add-image-wrap').empty().append(html);
                    if (faceList.length > 24) {
                        $myModal.find('.add-image-wrap').addClass('scroll');
                    }
                    // 绑定选中事件
                    $myModal.find('.aui-icon-delete-line').on('click', function () {
                        var $item = $(this).closest('.add-image-item');
                        $item.remove();
                        var $imgItem = $myModal.find('.add-image-item');
                        $myModal.find('.modal-face-num').text('(' + $imgItem.length + ')');
                        if ($imgItem.length < 6) {
                            $myModal.find('.add-image-wrap').removeClass('scroll');
                        }
                        if ($imgItem.length === 0) {
                            $myModal.find('.add-image-wrap').addClass('hide');
                        }
                    });
                    // 绑定确定事件
                    $myModal.find('.btn-primary').off('click').on('click', function () {
                        var $selectDom = $myModal.find('.add-image-item'),
                            selectHtml = '';
                        $selectDom.each(function (index, element) {
                            var src = $(element).find('.add-image-img').attr('src');
                            selectHtml += [
                                '<div class="add-image-item active" value="' + Math.random() + '">',
                                '   <span class="image-tag-new">人脸小图</span><span class="image-card-mask"></span>',
                                '   <img class="add-image-img" src="' + src + '" alt="" title="双击可截图" picStatus="2" picId="' + $(element).find('.add-image-img').attr('picId') + '">',
                                '   <i class="aui-icon-delete-line"></i>',
                                '</div>'
                            ].join('');
                        });
                        if (!bigMask) {
                            $insertDom.find('.add-image-item').each(function (index, ele) { // 防止抠图接口响应慢时，赋值错误
                                if ($(ele).attr('value') == imgValue) {
                                    $(ele).find('.add-image-img').attr('picId', info.staticId);
                                }
                            })
                            // $insertDom.find('.add-image-item').filter('.active').find('.add-image-img').attr('picId', info.staticId);
                        }
                        $insertDom.find('.add-image-icon').before(selectHtml);
                        var $newDom = $insertDom.find('.add-image-item');
                        $insertDom.find('.add-image-item').removeClass('active').eq(-1).addClass('active');
                        if ($('#pageSidebarMenu').find('.aui-icon-left-personnal-retrieval').parents(".sidebar-item").hasClass("active")) {
                            var number = $selectDom.length;
                            var src = $selectDom.eq(number - 1).find('.add-image-img').attr('src');
                            $insertDom.parent().find('.add-search-image img').eq(0).attr('src', src);
                        }
                        // if ($insertDom.attr('id') === 'usearchImg') { // 上传图片为多张人脸 并且为检索 
                        //     //getPicId($('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('src')); // 给图片绑定id
                        //     $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId', info.staticId);
                        // }
                        if ($newDom.length > 6) {
                            $insertDom.removeClass('scroll');
                            var clientH = $insertDom[0].clientHeight;
                            $insertDom.addClass('scroll');
                            $insertDom.animate({
                                'scrollTop': clientH
                            }, 500);
                        }
                        //$(this).siblings().click(); // 关闭弹框
                        $myModal.modal("hide");
                    });

                    //绑定关闭弹窗事件
                    $myModal.find('.aui-icon-not-through').off('click').on('click', function () {
                        if (!bigMask) {
                            $insertDom.find('.add-image-item.active').remove();
                            $insertDom.find('.add-image-icon').prev().addClass('active');
                            if ($('#pageSidebarMenu').find('.aui-icon-left-personnal-retrieval').parents(".sidebar-item").hasClass("active")) {
                                if ($insertDom.find('.add-image-item').length > 0) {
                                    $insertDom.find('.add-image-icon').prev().click();
                                } else {
                                    $insertDom.prev().find('img').attr('src', './assets/images/control/person.png');
                                }
                            }
                        }
                        $myModal.modal("hide");
                    });

                    //绑定原图搜索事件
                    $myModal.find('.btn-default').off('click').on('click', function () {
                        if (bigMask) {
                            var selectHtml = '';
                            selectHtml += [
                                '<div class="add-image-item active" value="' + Math.random() + '">',
                                '   <img class="add-image-img" title="双击可截图" src="' + (info.data.length == 1 ? ('data:image/png;base64,' + info.data[0].base64) : base64) + '" alt="" picId="' + (info.data.length == 1 ? info.data[0].staticId : info.staticId) + '">',
                                '   <i class="aui-icon-delete-line"></i>',
                                '</div>'
                            ].join('');
                            $insertDom.find('.add-image-item').removeClass('active');
                            $insertDom.find('.add-image-icon').before(selectHtml);
                            $insertDom.find('.add-image-item').filter('.active').find('.add-image-img').attr('picId', info.staticId);
                            $imgBox.click();
                        } else {
                            $insertDom.find('.add-image-item.active').removeClass('active');
                            $insertDom.find('.add-image-item').each(function (index, ele) { // 防止抠图接口响应慢时，赋值错误
                                if ($(ele).attr('value') == imgValue) {
                                    $(ele).find('.add-image-img').attr('picId', info.staticId);
                                    $(ele).addClass('active');
                                }
                            });
                            // $insertDom.find('.add-image-item').filter('.active').find('.add-image-img').attr('picId', info.staticId);
                        }
                        $myModal.modal("hide");
                    });
                } else {
                    if (!change) {
                        $imgBox.click();
                    }
                    //$insertDom.find('.add-image-item').filter('.active').find('.add-image-img').attr('picId', '0');
                    //warningTip.say("上传图片失败");
                    hideLoading($('#content-box'));
                }
            };
        //判断是公安网改变地址
        loadData(port, true, data, successFunc, '', 'POST', sourceType == 'ga' ? serviceUrlOther : '');
    })(imgValue);
}

/**
 * 获取侧边栏请求的参数
 * @param {String} typeSearch 判断是地图还是区域
 */
function getSearchData(typeSearch) {
    var $selectImg = $('#usearchImg').find('.add-image-item'), // 所有上传图片节点
        $selectImgActive = $selectImg.filter('.active'), // 当前被选中图片节点
        idcard = $selectImgActive.find('.add-image-img').attr("idcard"),
        selectImgSrc = '', // 当前被选中图片Base64
        selectImgId = '',
        selectImgOptype = '', //动态检索事由和类型
        selectImgSearchComments = '',
        $date = $('#searchMerge_Time'), // 日期选中节点
        $slide = $('#sliderInput'), // 相似度选中节点
        // 判断是否有摄像机选中数据
        $cameraOrg = $('#sidebarOrgSelect'), // 分局选择框
        $cameraPolice = $('#sidebarPoliceSelect'), // 派出所选择框
        $cameraArea = $('#sidebarCameraSelect'), //摄像机多选框
        //镜头类点
        cameraType = '',
        mapArr = [], // 选择摄像头数据
        cameraValArr = [], // 选择机构数据
        // 判断当前时间段
        $dateInput = $date.find('.datepicker-input'),
        dateStartTime = $dateInput.eq(0).val(),
        dateEndTime = $dateInput.eq(1).val(),
        // 年龄
        $startAge = $('#ageStart'),
        $endAge = $('#ageEnd'),
        age = '',
        // 性别
        $radio = $('#sex').find('[for^="radio"]').filter('.ui-state-active'),
        sex = '',
        // 算法厂家
        $calc = $('#sf'),
        calcArr = [], // 厂家id数组
        calcPArr = [], // 厂家id和名字数组

        // 结果数
        $limit = $('#top').find('[for^="radio"]').filter('.ui-state-active'),
        limit = '',

        // 还未确定或者目前写死的数据
        // 静态写死数据
        accessplat = 'facePlatform',
        accessToken = 'string',
        // 动态写死数据
        page = 1, //当前页
        number = 40, //每一页个数
        nodeType = $("#dynamicTitleContainer").find("input[name='cjMergeType']:checked").val(),
        // 镜头id 机构id V2.0版本 封装成字符串数组
        cameraValStringArr = [], // 新的机构id数组
        mapStringArr = []; // 新的镜头id数组
    // 将当前被选中图片索引 绑定到上传图片框
    for (var i = 0; i < $selectImg.length; i++) {
        if ($selectImg[i].className.indexOf('active') > -1) {
            $('#usearchImg').data('searchImgIndex', i);
        }
    }
    // 当前被选中图片赋值
    if ($selectImgActive.length > 0) {
        selectImgSrc = $selectImgActive.find('.add-image-img').attr('src');
        selectImgId = $selectImgActive.find('.add-image-img').attr('picId');
        $('#usearchImg').data('maskImg', selectImgSrc);
        selectImgOptype = $selectImgActive.find('.add-image-img').data("opType");
        selectImgSearchComments = $selectImgActive.find('.add-image-img').data("searchComments");
    } else {
        $('#usearchImg').data('maskImg', '');
    }
    // 机构 摄像头赋值
    if (typeSearch === 'map') { //地图选择
        var mapData = $('#saveNodeSearch').data('saveData');
        if (mapData) {
            mapArr = mapData.map(function (val, index) {
                var list = val.listArr.guid;
                return {
                    'videoSerial': list
                };
            });
        }
    } else { //区域选择
        if ($cameraOrg.length > 0) {
            var orgDataObj = $cameraOrg.selectpicker('val'),
                policeDataObj = $cameraPolice.selectpicker('val'),
                areaDataObj = $cameraArea.selectpicker('val'),
                cameraType = $("#selMergeCameraID").find("input[name='mergeCameraType']:checked").val();
            if (policeDataObj && policeDataObj.length > 0) {
                cameraValArr.push({
                    'videoGroup': policeDataObj
                });
            } else {
                cameraValArr.push({
                    'videoGroup': orgDataObj
                })

                if (orgDataObj == '10' && cameraType == '2') { //深圳公安局时暂时一类点值为全部
                    cameraType = '';
                }
            }
            if (areaDataObj && areaDataObj.length > 0) {
                mapArr = areaDataObj.map(function (val, index) {
                    return {
                        'videoSerial': val
                    };
                });
            }
        }
    }
    // 阈值
    var slideVal = $slide.val();
    // 年龄
    if ($startAge.length > 0) {
        var startAge = $startAge.val(),
            endAge = $endAge.val();
        age = startAge + '-' + endAge;
        if (startAge === '' && endAge === '') {
            age = '';
        }
    }
    // 性别
    if ($radio.length > 0) {
        sex = $radio.prev().val();
    }

    // 判断选中人脸库数据
    var $libids = $('#facedb').data('selectData') ? $('#facedb').data('selectData') : [],
        libids = [];
    if ($libids.length > 0) {
        $libids.forEach(function (item) {
            libids.push(item.libId);
        })
    }

    // 算法厂家
    if ($calc.length > 0) {
        var $calcLabel = $calc.find('label').filter('.ui-state-active');
        $calcLabel.each(function (index, element) {
            var cjid = $(element).attr('cjid'), // 厂家id
                cjname = $(element).attr('cjname'), // 厂家name
                cjobj = {};
            cjobj.cjname = cjname;
            cjobj.cjid = cjid;
            calcArr.push(cjid);
            calcPArr.push(cjobj);
        });
    }

    // 结果数
    if ($limit.length > 0) {
        limit = $limit.prev().val();
    }

    // V2.0版本 新的机构id数组赋值
    if (cameraValArr && cameraValArr.length) {
        cameraValArr.forEach(function (val, index) {
            cameraValStringArr.push(val.videoGroup)
        })
    }

    // V2.0版本 新的镜头id数组赋值
    if (mapArr && mapArr.length) {
        mapArr.forEach(function (val, index) {
            mapStringArr.push(val.videoSerial)
        })
    }
    return {
        // 动态需要的数据
        dynamic: {
            base64Img: selectImgSrc,
            idcard: idcard,
            selectImgId: selectImgId,
            selectImgOpType: selectImgOptype,
            orgId: $cameraOrg.selectpicker('val'),
            policeDataOb: $cameraPolice.selectpicker('val'),
            areaDataObj: $cameraArea.selectpicker('val'),
            selectImgSearchComments: selectImgSearchComments,
            videoGroups: cameraValStringArr,
            type: cameraType,
            nodeType: nodeType,
            videos: mapStringArr,
            startTime: dateStartTime,
            endTime: dateEndTime,
            threshold: slideVal,
            page: page,
            number: number
        },
        // 静态需要的数据
        static: {
            base64: selectImgSrc,
            agegroup: age,
            sex: sex,
            libids: libids,
            platformId: calcArr,
            platformObj: calcPArr,
            platNum: calcArr.length,
            limit: limit,
            accessplat: accessplat,
            accessToken: accessToken
        }
    }
}

// 重置默认数据
function resetSearchData() {
    // 年龄
    var $ageStart = $('#ageStart'),
        $ageEnd = $('#ageEnd');
    if ($ageStart.length > 0) {
        $ageStart.val('20');
        $ageEnd.val('45');
    }
    // 性别
    var $radio = $('#radio-3');
    if ($radio.length > 0) {
        $radio.click();
    }
    // 人脸库
    var $facedb = $('#facedbSelect').find('.facedb-box-all .ui-checkboxradio-checkbox-label');
    if (!$facedb.hasClass('.ui-checkboxradio-checked')) {
        $facedb.click();
    }
    // 算法
    var $sf = $('#sf');
    if ($sf.length > 0) {
        var $sfInput = $sf.children('input');
        $sfInput.each(function () {
            var thisChecked = $(this).prop('checked');
            if (!thisChecked) {
                $(this).click();
            }
        });
    }

    // 结果数
    var $top = $('#top');
    if ($top.length > 0) {
        $('#radio-top-1').click();
    }
    // 摄像机
    var $cameraOrg = $('#sidebarOrgSelect');
    if ($cameraOrg.length > 0) {
        var $cameraMenu = $cameraOrg.data('selectpicker').$menu,
            $cameraBtn = $cameraOrg.data('selectpicker').$button,
            $cameraMenuItem = $cameraMenu.find('.dropdown-menu').find('.dropdown-item');
        $cameraMenuItem.eq(0).click();
        $cameraBtn.blur();
    }
    // 日期
    var $time = $('#searchMerge_Time'),
        $timeBtn = $time.prev().find('.btn.btn-sm');
    if ($timeBtn.length > 0) {
        $timeBtn.eq(2).click();
    }
    // 滑动块
    var $slider = $('#sliderInput');
    if ($slider.length > 0) {
        $slider.data('comp').slider("value", '90');
        $slider.val('90');
    }
    // 同行次数/时间间隔
    var $peerTime = $('#peerTime input');
    var $peerInterval = $('#peerInterval input');
    if ($peerTime.length > 0 || $peerInterval.length > 0) {
        $peerTime.val('');
        $peerInterval.val('');
    }
    // 同行摄像机
    var $cameraOrg = $('#PSidebarOrgSelect');
    if ($cameraOrg.length > 0) {
        var $cameraMenu = $cameraOrg.data('selectpicker').$menu,
            $cameraBtn = $cameraOrg.data('selectpicker').$button,
            $cameraMenuItem = $cameraMenu.find('.dropdown-menu').find('.dropdown-item');
        $cameraMenuItem.eq(0).click();
        $cameraBtn.blur();
    }
    // 同行日期
    var $time = $('#peerAnalysis_time'),
        $timeBtn = $time.prev().find('.btn.btn-sm');
    if ($timeBtn.length > 0) {
        $timeBtn.eq(0).click();
    }
    // 同行滑动块
    var $slider = $('#peersliderInput');
    if ($slider.length > 0) {
        $slider.data('comp').slider("value", '50');
        $slider.val('50');
    }
}

// 重置
$(document).on('click', '#resetBtn', function () {
    resetSearchData();
});

/*************************  静态检索 动静融合 start  *************************/
/**
 * 静态检索 构建图片节点
 * @param {Array} result 1:N接口返回的图片列表数据
 * @param {String} _html 空字符串 
 * @param {String} isFactory 是否显示厂家
 */
function createStaticImgItem(result, _html, isFactory) {
    for (var j = 0; j < result.length; j++) {
        var tagHtml = searchPeopleTypeLevel(result[j].userType); // 获取人员类型节点    1.在逃 2.重点人员 3.白名单
        var libNames = '';
        result[j].libInfos.map(function (el, index) {
            if (index === 0) {
                libNames = el.libName;
            } else {
                libNames = libNames + ',' + el.libName;
            }

            //新增疫区人像库，该人像库里的人要打标签（优先级最高）以后可能去掉
            if (el.libName == '疑似疫区人像库') {
                tagHtml = `<span class="image-tag rotate danger" data-cls="danger" data-name="疑似疫区">疑似疫区</span><span class="card-mask"></span>`
            }

        });
        var factoryVal = '';
        if (result[j].rhInfo) {
            result[j].rhInfo.map(function (el, index) {
                if (index === 0) {
                    factoryVal = el.index + '-' + el.platformName + ':' + el.similarity;
                } else {
                    factoryVal = factoryVal + ',' + el.index + '-' + el.platformName + ':' + el.similarity;
                }
            });
        }
        _html += `<li class="image-new-wrap" picId="${result[j].picId}">
                    <div class="image-card-box image-box-flex img-right-event">
                        ${tagHtml}
                        <img class="image-card-img" src="${result[j].url}" alt="">
                        <div class="image-card-outer">`;
        // 相似度大于90%的时候标注为红色 大于60%小于等于90%的时候标注为黄色 其他时候为白色
        if (isFactory) {
            _html += '<div class="image-card-inner blue">'
        } else if (result[j].similarity >= '90%') {
            _html += '<div class="image-card-inner danger">';
        } else if (result[j].similarity >= '60%' && result[j].similarity < '90%') {
            _html += '<div class="image-card-inner warning">';
        } else {
            _html += '<div class="image-card-inner white">'
        }
        _html += `<span class="image-card-number">${isFactory ? result[j].rhInfo.length : result[j].similarity}</span>
                </div>
                </div>
				</div>`;
        _html += `<div class="image-info-box">
				<div class="info-box">
					<ul class="form-info form-label-fixed form-label-short">
						<li class="form-group">
							<label class="aui-form-label">姓名：</label>
							<div class="form-text">${result[j].name}</div>
						</li>
						<li class="form-group">
							<label class="aui-form-label">性别：</label>
							<div class="form-text">${result[j].sex}</div>
						</li>
						<li class="form-group">
							<label class="aui-form-label">人像库：</label>
							<div class="form-text" title="${libNames}">${libNames}</div>
						</li>
						<li class="form-group">
							<label class="aui-form-label">身份证：</label>
							<div class="form-text" title="${result[j].idcard}">${result[j].idcard}</div>
						</li>
						<li class="form-group ${isFactory ? '' : 'hide'}">
							<label class="aui-form-label">厂家：</label>
							<div class="form-text" title="${factoryVal ? factoryVal : '---'}">${factoryVal ? factoryVal : '---'}</div>
						</li>
					</ul>
				</div>
            </div>`
        _html += `<div class="basicsBut hide">
                    <i class="icon aui-icon-idcard2"></i>
                </div>`;
        _html += `</li> `;
    }
    return _html;
}

/**
 * 融合数=0时 构造空融合算法元素
 * @param {String} rh_html 空字符串 
 */
function createEmptyImgItem(rh_html) {
    rh_html += `<li class="image-new-wrap">
						<div class="image-card-box image-box-flex">
							<img class="image-card-img" src="./assets/images/control/person.png">
							<div class="image-card-outer">
								<div class="image-card-inner gray">
									<span class="image-card-text">暂无命中结果</span>
								</div>
							</div>
						</div>
						<div class="image-info-box">
							<div class="info-box">
								<ul class="form-info form-label-fixed form-label-short">
									<li class="form-group">
										<label class="aui-form-label">姓名：</label>
										<div class="form-text">---</div>
									</li>
									<li class="form-group">
										<label class="aui-form-label">性别：</label>
										<div class="form-text" title="---">---</div>
									</li>
									<li class="form-group">
										<label class="aui-form-label">人像库：</label>
										<div class="form-text">---</div>
									</li>
									<li class="form-group">
										<label class="aui-form-label">身份证：</label>
										<div class="form-text">---</div>
									</li>
									<li class="form-group">
										<label class="aui-form-label">厂家：</label>
										<div class="form-text">---</div>
									</li>
								</ul>
							</div>
						</div>
					</li>
            `;
    return rh_html;
}

/**
 * 静态检索 给融合算法图片绑定数据
 * @param {Object} container 需要刷新的节点容器 静态库容器
 * @param {Array} ronghe 融合数组
 */
function bindStaticRongheData(container, ronghe, item) {
    container.find(`#fuseAlg${item}`).find('.image-new-wrap').each(function (index, el) {
        $(this).data('listData', ronghe[index]);
    });
}

/**
 * 卡片绑定数据
 * @param {Object} container  需要刷新的节点容器 静态库容器
 * @param {String} ulId  图片列表元素的属性id
 * @param {Array} result  接口获取的图片列表值
 */
function bindDataToImgItem(container, ulId, result) {
    container.find(ulId).find('.image-new-wrap').each(function (index, el) {
        $(el).data('listData', result[index]);
    });
}

/**
 * 静态检索 获取人员类型
 * @param {int} data   1.在逃 2.重点人员 3.白名单
 */
function searchPeopleTypeLevel(data) {
    var tagName = data,
        tagInfo;
    if (tagName === 1 || tagName === '1') {
        tagName = 'danger';
        tagInfo = '在逃人员';
    } else if (tagName === 2 || tagName === '2') {
        tagName = 'warning';
        tagInfo = '重点人员';
    } else if (tagName === 3 || tagName === '3') {
        tagName = 'white';
        tagInfo = '白名单';
    } else {
        tagName = 'hide';
    }
    return `
        <span class="image-tag rotate ${tagName}" data-cls="${tagName}" data-name="${tagInfo}">${tagInfo}</span>
        <span class="card-mask"></span>
    `
}

// 融合算法 融合数组按命中家数 从大到小排序
function sortRonghe(property) {
    return function (a, b) {
        var value1 = a[property],
            value2 = b[property];
        return -(value1 - value2);
    }
}

// 融合厂家算法
function sortRongheCJ(property, cjs) {
    return function (a, b) {
        return cjs.indexOf(a[property]) - cjs.indexOf(b[property]);
    }
}

// /**
//  * 静态检索 选择厂家为1 整页加载
//  * @param {Object} container 需要刷新的节点容器
//  * @param {Boolean} isMerge 是否为动静结合页面 true为动静结合页面
//  */
// function loadAllPage(container, isMerge) {
//     var html = '';
//     if (isMerge) {
//         html += `<div class="image-card-list-title text-lg">
//                     <span class="title-text">${$('[id^=sf] .ui-checkboxradio-checked').attr('cjname')}</span>
//                     <span class="text-theme text-bold title-text">（0）</span>
//                 </div>
//                 <ul class="image-card-list showMore merge list-type-3" id="onlyOneList">
//                     <li class="image-card-wrap image-card-wrap2 image-card-item">
//                         <div class="image-card-box image-box-flex">
//                             <img class="image-card-img" src="./assets/images/control/person.png">
//                         </div>
//                     </li>
//                 </ul>
//             `;
//     } else { // 厂家标题容器 图片列表容器 详情容器
//         html += `<div class="image-card-list-title text-lg">
//                     <span class="title-text">${$('[id^=sf] .ui-checkboxradio-checked').attr('cjname')}</span>
//                     <span class="text-theme text-bold title-text">（0）</span>
//                 </div>
//                 <ul class="image-card-list showMore static list-type-3" id="onlyOneList">
//                     <li class="image-card-wrap image-card-wrap2 image-card-item">
//                         <div class="image-card-box image-box-flex">
//                             <img class="image-card-img" src="./assets/images/control/person.png">
//                         </div>
//                     </li>
//                 </ul>
//                 <div class="swiper-container search-detail-box" id="onlyOneDetail">
//                     <div class="swiper-wrapper">
//                     </div>
//                     <i class="card-side-close aui-icon-not-through"></i>
//                     <div class="swiper-button-next btn-next">
//                         <i class="aui-icon aui-icon-drop-right"></i>
//                     </div>
//                     <div class="swiper-button-prev btn-prev">
//                         <i class="aui-icon aui-icon-drop-left"></i>
//                     </div>
//                 </div>
//             `;
//     }
//     container.find('.card-content').html(html);
// }

// /**
//  * 静态检索 选择厂家 =2 全部横铺 先加载节点框架
//  * @param {Array} cjs 已选中的算法厂家id数组
//  * @param {Object} container 需要刷新的节点容器 静态库容器
//  * @param {Boolean} isMerge 是否为动静结合页面
//  */
// function loadSpreadFrame(cjs, container, isMerge) {
//     var html = '';
//     // 判断是否是动静结合页面
//     if (isMerge) {
//         var companyTempHtml = "",
//             showMoreHtml = '';
//         html += `<div class="merge" id="firstShow">
//                     <div class="image-card-list-title" id="tit-0">
//                         <span class="title-text">融合算法</span>
//                         <span class="text-theme text-bold title-text">（0）</span>
//                     </div>
//                     <ul class="image-card-list list-type-3" id="img-0">
//                         <li class="image-card-wrap image-card-wrap2 image-card-item">
//                             <div class="image-card-box image-box-flex">
//                                 <img class="image-card-img" src="./assets/images/control/person.png">
//                                 <div class="image-card-outer">
//                                     <div class="image-card-inner gray">
//                                         <span class="image-card-text">暂无命中结果</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </li>
//                     </ul>
//                 </div>
//                 <ul class="aui-row aui-row-float merge" id="otherShow">`;
//         for (var i = 0; i < cjs.length; i++) {
//             // 厂家列表框架以及默认给张置灰照片
//             html += `<li class="aui-col-12 display-none">
//                         <div class="image-card-list-title" id="tit-${cjs[i]}" cjid="${cjs[i]}">
//                             <span class="title-text">${$("[cjid=" + cjs[i] + "]").attr('cjname')}</span>
//                             <span class="text-theme text-bold title-text">（0）</span>
//                             <button class="btn btn-link" type="button">查看更多</button>
//                         </div>
//                         <ul class="image-card-list list-type-4" id="img-${cjs[i]}">
//                             <li class="image-card-wrap image-card-wrap2 image-card-item">
//                                 <div class="image-card-box image-box-flex">
//                                     <img class="image-card-img" src="./assets/images/control/person.png">
//                                 </div>
//                             </li>
//                         </ul>
//                     </li>`;
//             // 更多厂商的的tag标签
//             companyTempHtml += `<li class="inline-block marker">
//                                     <i class="status-icon status-icon-warning"></i>
//                                     <span class="tag" cjid="${cjs[i]}">${$("[cjid=" + cjs[i] + "]").attr('cjname')}
//                                         <span class="title-number">(0)</span>
//                                     </span>
//                                 </li>`;
//         }
//         html += `</ul>`;
//         // 查看更多厂商的框架
//         showMoreHtml = `<div class="show-more-algorigtm-list" id="showMoreChangShang">
//                             <span class="text-bold text-md">更多算法</span>                            
//                             <ul class="inline-block aui-ml-xs text-bold">
//                                 ${companyTempHtml}
//                             </ul>
//                             <button type="button" class="btn btn-link">查看全部</button>
//                         </div>`;
//         html += showMoreHtml;
//     } else { // 融合算法 + 分别占一行的2家厂家 （标题容器 图片列表容器 详情容器）
//         html += `<div class="static" id="firstShow">
//                     <div class="image-card-list-title" id="tit-0">
//                         <span class="title-text">融合算法</span>
//                         <span class="text-theme text-bold title-text">（0）</span>
//                     </div>
//                     <ul class="image-card-list showMore list-type-3" id="img-0"> 
//                         <li class="image-card-wrap image-card-wrap2 image-card-item">
//                             <div class="image-card-box image-box-flex">
//                                 <img class="image-card-img" src="./assets/images/control/person.png">
//                                 <div class="image-card-outer">
//                                     <div class="image-card-inner gray">
//                                         <span class="image-card-text">暂无命中结果</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </li>
//                     </ul>
//                     <div class="swiper-container search-detail-box" id="imgDetail-0">
//                         <div class="swiper-wrapper">
//                         </div>
//                         <i class="card-side-close aui-icon-not-through"></i>
//                         <div class="swiper-button-next btn-next">
//                             <i class="aui-icon aui-icon-drop-right"></i>
//                         </div>
//                         <div class="swiper-button-prev btn-prev">
//                             <i class="aui-icon aui-icon-drop-left"></i>
//                         </div>
//                     </div>
//                 </div>
//                 <ul class="aui-row aui-row-float static cjCount" id="otherShow">`;
//         for (var i = 0; i < cjs.length; i++) {
//             html += `<li class="aui-col-24">
//                         <div class="image-card-list-title" id="tit-${cjs[i]}" cjid="${cjs[i]}">
//                             <span class="title-text">${$("[cjid=" + cjs[i] + "]").attr('cjname')}</span>
//                             <span class="text-theme text-bold title-text">（0）</span>
//                             <button class="btn btn-link" type="button">查看更多</button>
//                         </div>
//                         <ul class="image-card-list list-type-3" id="img-${cjs[i]}">
//                             <li class="image-card-wrap image-card-wrap2 image-card-item">
//                                 <div class="image-card-box image-box-flex">
//                                     <img class="image-card-img" src="./assets/images/control/person.png">
//                                 </div>
//                             </li>
//                         </ul>
//                         <div class="swiper-container search-detail-box" id="imgDetail-${cjs[i]}">
//                             <div class="swiper-wrapper">
//                             </div>
//                             <i class="card-side-close aui-icon-not-through"></i>
//                             <div class="swiper-button-next btn-next">
//                                 <i class="aui-icon aui-icon-drop-right"></i>
//                             </div>
//                             <div class="swiper-button-prev btn-prev">
//                                 <i class="aui-icon aui-icon-drop-left"></i>
//                             </div>
//                         </div>
//                     </li>`;
//         }
//         html += `</ul>`;
//     }
//     container.find('.card-content').html(html);
// }

// /**
//  * 静态检索 选择厂家 >2 先加载框架
//  * @param {Array} cjs 已选中的算法厂家id数组
//  * @param {Object} container 需要刷新的节点容器 静态库容器
//  * @param {Boolean} isMerge 是否为动静结合页面
//  */
// function loadFoldFrame(cjs, container, isMerge) {
//     var html = '';
//     if (isMerge) {
//         var companyTempHtml = "",
//             showMoreHtml = '';
//         html += `<div class="merge" id="firstShow">
//                     <div class="image-card-list-title" id="tit-0">
//                         <span class="title-text">融合算法</span>
//                         <span class="text-theme text-bold title-text">（0）</span>
//                     </div>
//                     <ul class="image-card-list showMore list-type-3" id="img-0"> 
//                         <li class="image-card-wrap image-card-wrap2 image-card-item">
//                             <div class="image-card-box image-box-flex">
//                                 <img class="image-card-img" src="./assets/images/control/person.png">
//                                 <div class="image-card-outer">
//                                     <div class="image-card-inner gray">
//                                         <span class="image-card-text">暂无命中结果</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </li>
//                     </ul>
//                 </div>
//                 <ul class="aui-row merge aui-row-float" id="otherShow">`;
//         for (var i = 0; i < cjs.length; i++) {
//             // 厂家列表框架以及默认给张置灰照片
//             html += `<li class="aui-col-12 display-none">
//                         <div class="image-card-list-title" id="tit-${cjs[i]}" cjid="${cjs[i]}">
//                             <span class="title-text">${$("[cjid=" + cjs[i] + "]").attr('cjname')}</span>
//                             <span class="text-theme text-bold title-text">（0）</span>
//                             <button class="btn btn-link" type="button">查看更多</button>
//                         </div>
//                         <ul class="image-card-list list-type-4" id="img-${cjs[i]}">
//                             <li class="image-card-wrap image-card-wrap2 image-card-item">
//                                 <div class="image-card-box image-box-flex">
//                                     <img class="image-card-img" src="./assets/images/control/person.png">
//                                 </div>
//                             </li>
//                         </ul>
//                     </li>`;
//             // 更多厂商的的tag标签
//             companyTempHtml += `<li class="inline-block marker">
//                                     <span class="tag" cjid="${cjs[i]}">${$("[cjid=" + cjs[i] + "]").attr('cjname')}
//                                         <span class="title-number">(0)</span>
//                                     </span>
//                                 </li>`;

//         }
//         html += `</ul>`;
//         // 查看更多厂商的框架
//         showMoreHtml = `<div class="show-more-algorigtm-list" id="showMoreChangShang">
//                             <span class="text-bold text-md">更多算法</span>                            
//                             <ul class="inline-block aui-ml-xs text-bold">
//                                 ${companyTempHtml}
//                             </ul>
//                             <button type="button" class="btn btn-link">查看全部</button>
//                         </div>`;
//         html += showMoreHtml;
//         container.find('.card-content').html(html);
//     } else { // 融合算法 + 2家占一行的厂家 （标题容器 图片列表容器 详情容器）
//         html += `<div class="static" id="firstShow">
//                     <div class="image-card-list-title" id="tit-0">
//                         <span class="title-text">融合算法</span>
//                         <span class="text-theme text-bold title-text">（0）</span>
//                     </div>
//                     <ul class="image-card-list showMore list-type-3" id="img-0"> 
//                         <li class="image-card-wrap image-card-wrap2 image-card-item">
//                             <div class="image-card-box image-box-flex">
//                                 <img class="image-card-img" src="./assets/images/control/person.png">
//                                 <div class="image-card-outer">
//                                     <div class="image-card-inner gray">
//                                         <span class="image-card-text">暂无命中结果</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </li>
//                     </ul>
//                     <div class="swiper-container search-detail-box" id="imgDetail-0">
//                         <div class="swiper-wrapper">
//                         </div>
//                         <i class="card-side-close aui-icon-not-through"></i>
//                         <div class="swiper-button-next btn-next">
//                             <i class="aui-icon aui-icon-drop-right"></i>
//                         </div>
//                         <div class="swiper-button-prev btn-prev">
//                             <i class="aui-icon aui-icon-drop-left"></i>
//                         </div>
//                     </div>
//                 </div>
//                 <ul class="aui-row aui-row-float static" id="otherShow">`;
//         for (var i = 0; i < cjs.length; i++) {
//             html += `<li class="aui-col-12">
//                         <div class="image-card-list-title" id="tit-${cjs[i]}" cjid="${cjs[i]}">
//                             <span class="title-text pointer">${$("[cjid=" + cjs[i] + "]").attr('cjname')}</span>
//                             <span class="text-theme text-bold title-text">（0）</span>
//                             <button class="btn btn-link" type="button">查看更多</button>
//                         </div>
//                         <ul class="image-card-list list-type-4" id="img-${cjs[i]}">
//                             <li class="image-card-wrap image-card-wrap2 image-card-item">
//                                 <div class="image-card-box image-box-flex">
//                                     <img class="image-card-img" src="./assets/images/control/person.png">
//                                 </div>
//                             </li>
//                         </ul>
//                         <div class="swiper-container search-detail-box" id="imgDetail-${cjs[i]}">
//                             <div class="swiper-wrapper">
//                             </div>
//                             <i class="card-side-close aui-icon-not-through"></i>
//                             <div class="swiper-button-next btn-next">
//                                 <i class="aui-icon aui-icon-drop-right"></i>
//                             </div>
//                             <div class="swiper-button-prev btn-prev">
//                                 <i class="aui-icon aui-icon-drop-left"></i>
//                             </div>
//                         </div>
//                     </li>`;
//         }
//         html += `</ul>`;
//         container.find('.card-content').html(html);
//     }
// }


// /**
//  * 纯静态 或动静结合检索 静态库 选择厂家 =1时 右侧内容刷新
//  * @param {Object} container 需要刷新的节点容器 静态库容器
//  * @param {Array} result 1:N接口返回的图片列表数据
//  * @param {Boolean} isMerge 是否为动静结合页面
//  */
// function refreshStaticCj1Container(container, result, isMerge) {
//     var html = '';
//     // 构造厂家搜索的图片内容 人员类型 相似度图片内容
//     for (var j = 0; j < result.length; j++) {
//         var tagHtml = searchPeopleTypeLevel(result[j].userType); // 获取人员类型节点    1.在逃 2.重点人员 3.白名单
//         html += `<li class="image-card-wrap image-card-wrap2 image-card-item">
//                 <div class="image-card-box image-box-flex img-right-event">
//                     ${tagHtml}
//                     <img class="image-card-img img" src="${result[j].url}" alt="">
//                         <div class="image-card-outer">`;
//         // 相似度大于90%的时候标注为红色 大于60%小于等于90%的时候标注为黄色 其他时候为白色
//         if (result[j].similarity >= '90%') {
//             html += '<div class="image-card-inner danger">';
//         } else if (result[j].similarity >= '60%' && result[j].similarity < '90%') {
//             html += '<div class="image-card-inner warning">';
//         } else {
//             html += '<div class="image-card-inner white">'
//         }
//         html += `<span class="image-card-number">${result[j].similarity}</span>
//                     </div>
//                 </div>
//             </div>`;
//         if (isMerge) {
//             html += `</li> `;
//         } else {
//             html += `<span class="icon-drop-up"><i class="aui-icon-drop-down"></i></span>
//             </li> `;
//         }
//     }
//     container.find("#onlyOneList").html(html); // 加载厂家搜索的图片内容
//     bindDataToImgItem(container, "#onlyOneList", result); // 将生成的图片 绑上身份证数据 用以后面二次检索使用
//     container.find('.image-card-list-title .text-theme.text-bold').text('（' + result.length + '）'); // 当前的唯一算法厂家 加载搜索结果总数
//     container.find('#allCount').text('（' + result.length + '）'); // 静态库 加载搜索结果总数
//     bindStaticPicData(container, result, '#onlyOneList'); // 列表图片节点 赋值
//     if (container.find('#onlyOneList').hasClass('static')) { // 如果厂家=1 纯静态页面
//         createStaticOneCjDetail(result); //  构建详情
//     }
// }

// /**
//  * 静态检索 给各厂家图片绑定数据
//  * @param {Object} container 需要刷新的节点容器 静态库容器
//  * @param {Array} result 1:N接口返回的图片列表数据
//  */
// function bindStaticPicData(container, result, listContainer) {
//     container.find(listContainer).find('.image-card-item').each(function (index, el) {
//         $(this).data({
//             'picId': result[index].picId,
//             'name': result[index].name,
//             'age': result[index].age,
//             'idcard': result[index].idcard,
//             'libInfo': result[index].libInfos,
//             'sex': result[index].sex,
//             'similarity': result[index].similarity,
//             'birthday': result[index].birthday
//         })
//     });
// }

// /**
//  * 厂家=1 纯静态页面 构建详情
//  * @param {Array} result 1:N接口返回的图片列表数据
//  */
// function createStaticOneCjDetail(result) {
//     // 先清空节点 再把拼接的节点插入
//     if ($('#onlyOneList').next()[0].id !== 'onlyOneDetail') { // 详情节点id
//         $('#onlyOneList').parent('.card-content').after($('#onlyOneList').find('#onlyOneDetail').hide());
//     }
//     // 实例化详情节点 详情滑动
//     portraitSlide('onlyOneDetail', 'onlyOneList', 8);
//     $('#onlyOneDetail .swiper-slide').each(function (index, el) {
//         $(el).data('controlData', result[index]); // 每一个滑块绑定图片数据
//         $(el).empty().html(createSwiperDetail(result[index])); // 生成滑块页面详情
//         $(el).find('.img').eq(1).data('idcard', result[index].idcard); // 详情中的对比图片绑定idcard
//     });
// }

// /**
//  * 厂家>=2 纯静态页面 各厂家构建详情
//  * @param {String} cjs 当前厂家id
//  * @param {Array} result 1:N接口返回的图片列表数据
//  */
// function createStaticMultiCjDetail(cjs, result) {
//     // 先清空详情节点 再把拼接的节点插入
//     if ($('#img-' + cjs).next()[0].id !== 'imgDetail-' + cjs) {
//         $('#img-' + cjs).parent('[class*=aui-col]').after($('#img-' + cjs).find('#imgDetail-' + cjs).hide());
//     }
//     // 实例化详情节点
//     portraitSlide('imgDetail-' + cjs, 'img-' + cjs, 8);
//     $('#imgDetail-' + cjs + ' .swiper-slide').each(function (index, el) {
//         $(el).data('controlData', result[index]);
//         $(el).empty().html(createSwiperDetail(result[index]));
//         $(el).find('.img').eq(1).data('idcard', result[index].idcard);
//     });
// }

// /**
//  * 厂家>=2 纯静态页面 融合算法构建详情
//  * @param {Array} ronghe 融合数组
//  */
// function createStaticRongheDetail(ronghe) {
//     // 先清空节点 再把拼接的节点插入
//     if ($('#img-0').next()[0].id !== 'imgDetail-0') {
//         $('#img-0').parent('[class*=aui-col]').after($('#img-0').find('#imgDetail-0').hide());
//     }
//     // 实例化详情节点
//     portraitSlide('imgDetail-0', 'img-0', 8);
//     $('#imgDetail-0' + ' .swiper-slide').each(function (index, el) {
//         $(el).data('controlData', ronghe[index]);
//         $(el).empty().html(createSwiperDetail(ronghe[index]));
//         $(el).find('.img').eq(1).data('idcard', ronghe[index].idcard);
//     });
// }


// /**
//  * 融合数小于等于8时 构造融合算法图片
//  * @param {Array} ronghe 融合算法数据
//  * @param {Boolean} isMerge 是否为动静结合页面 
//  * @param {String} rh_html 空字符串 
//  */
// function createOneRowRongheItem(ronghe, isMerge, rh_html) {
//     for (var j = 0; j < ronghe.length; j++) {
//         var tagHtml = searchPeopleTypeLevel(ronghe[j].userType);
//         rh_html += ` <li class="image-card-wrap image-card-wrap2 image-card-item">
//                         <div class="image-card-box image-box-flex img-right-event">
//                             ${tagHtml}
//                             <img class="image-card-img" src="${ronghe[j].url}" alt="">
//                             <div class="image-card-outer">
//                                 <div class="image-card-inner">
//                                     <span class="image-card-text">命中</span>
//                                     <span class="image-card-number">${ronghe[j].CJCounts}</span>
//                                     <span class="image-card-text">家</span>
//                                 </div>
//                             </div>
//                         </div>`;
//         if (isMerge) {
//             rh_html += `</li> `;
//         } else {
//             rh_html += `<span class="icon-drop-up"><i class="aui-icon-drop-down"></i></span>
//                     </li> `;
//         }
//     }
//     return rh_html;
// }

// /**
//  * 融合数大于8时 构造融合算法图片
//  * @param {Array} ronghe 融合算法数据
//  * @param {Boolean} isMerge 是否为动静结合页面 
//  * @param {Number} multiplying 融合算法行数
//  * @param {String} rh_html 空字符串 
//  */
// function createMultiRowRongheItem(ronghe, isMerge, multiplying, rh_html) {
//     for (var j = 0; j < multiplying * 8; j++) {
//         var tagHtml = searchPeopleTypeLevel(ronghe[j].userType);
//         rh_html += ` <li class="image-card-wrap image-card-wrap2 image-card-item">
//                         <div class="image-card-box image-box-flex img-right-event">
//                             ${tagHtml}
//                             <img class="image-card-img" src="${ronghe[j].url}" alt="">
//                             <div class="image-card-outer">
//                                 <div class="image-card-inner">
//                                     <span class="image-card-text">命中</span>
//                                     <span class="image-card-number">${ronghe[j].CJCounts}</span>
//                                     <span class="image-card-text">家</span>
//                                 </div>
//                             </div>
//                         </div>`;
//         if (isMerge) {
//             rh_html += `</li> `;
//         } else {
//             rh_html += `<span class="icon-drop-up"><i class="aui-icon-drop-down"></i></span>
//                     </li> `;
//         }
//     }
//     return rh_html;
// }

// // 静态检索 当算法厂家的图片数少于6张时,隐藏查看更多按钮
// function onDeleteMoreSearch() {
//     let _arr = [$('#img-5 li'), $('#img-3 li'), $('#img-6 li'), $('#img-4 li'), $('#img-8 li')]
//     for (let i = 0; i < _arr.length; i++) {
//         if (_arr[i].length <= 6) {
//             $('#tit-' + _arr[i].selector.substring(5, 6) + ' button').hide()
//         } else {
//             $('#tit-' + _arr[i].selector.substring(5, 6) + ' button').show()
//         }
//     }
// }

// /**
//  * 静态检索+动静页面检索 点击展开收缩查看更多 （1.纯静态检索 厂家数>2时 2.动静融合检索 厂家数>=2时）
//  * @param {Object} $dom 需要刷新的节点容器 静态库容器 $('#staticContentContainer')
//  */
// function changeShowMore($dom) {
//     $dom.find('.image-card-list-title').on('click', '.btn-link', function () {
//         var cardList = $(this).closest('.image-card-list-title').next('.image-card-list'), // 本厂家图片列表
//             siblingsList = cardList.closest('[class*=aui-col]').siblings('.aui-col-24'); // 当前展开状态的兄弟厂家
//         // 处理兄弟照片列表
//         if (siblingsList) {
//             var $nextSwiper = siblingsList.find('.image-card-list').find('.search-detail-box'); // 判断展开状态兄弟厂家是否打开详情
//             if ($nextSwiper.length > 0) {
//                 $nextSwiper.find('.card-side-close').click(); // 关闭图片详情弹框
//             }
//             siblingsList.removeClass('aui-col-24').addClass('aui-col-12'); // 展开状态兄弟厂家图片占半行
//             siblingsList.find('.image-card-list').removeClass('showMore list-type-3').addClass('list-type-4'); // 展开状态兄弟厂家图片收缩
//             siblingsList.find('.image-card-list-title .btn-link').text('查看更多'); // 展开状态兄弟厂家显示查看更多
//         }
//         // 处理自身照片列表
//         if (cardList.hasClass('showMore')) { // showMore类显示图片展开状态
//             var $nextSwiper = cardList.find('.search-detail-box'); // 判断本厂家节点是否打开详情
//             if ($nextSwiper.length > 0) {
//                 $nextSwiper.find('.card-side-close').click(); // 关闭图片详情弹框
//             }
//             $(this).text('查看更多'); // 本厂家图片列表显示查看更多
//             cardList.closest('.aui-col-24').removeClass('aui-col-24').addClass('aui-col-12'); // 本厂家图片占半行
//             cardList.removeClass('showMore list-type-3').addClass('list-type-4'); // 本厂家图片收缩
//         } else {
//             $(this).text('收起'); // 本厂家图片列表显示收起
//             cardList.closest('.aui-col-12').removeClass('aui-col-12').addClass('aui-col-24'); // 本厂家图片占一行
//             cardList.addClass('showMore list-type-3').removeClass('list-type-4'); // 本厂家图片展开
//         }
//         // 处理多个滑块之间的位置关系 用于后面键盘绑定事件
//         siblingsList.each(function (index, el) {
//             var listChildSwiper = $(el).children('.search-detail-box'),
//                 listFindSwiper = $(el).find('.search-detail-box');
//             if (listChildSwiper.length === 0 && listFindSwiper.length > 0) {
//                 listFindSwiper.hide();
//                 var swiperFather = listFindSwiper.parent();
//                 swiperFather.after(listFindSwiper);
//             }
//         });
//         // 去掉融合算法详情
//         if ($('#img-0').length > 0 && siblingsList.length === 0) { // 有融合算法列表 兄弟厂家有展开详情
//             var $imgChild = $('#img-0').children('.search-detail-box'), // 融合详情
//                 $imgNext = $('#img-0').next('.search-detail-box');
//             if ($imgChild.length > 0 && $imgNext.length === 0) { // 融合算法有展开详情
//                 $imgChild.hide();
//                 $('#img-0').after($imgChild);
//             }
//         }
//     })
// }

/*************************  纯静态检索方法 start  *************************/

// /** 纯静态检索 厂家=2 点击标题上的查看更多按钮
//  * @param {Object} container 需要刷新的节点容器 静态库容器$('#staticContentContainer')
//  */
// function onStaticCj2ShowMore(container) {
//     container.find('.image-card-list-title').on('click', '.btn-link', function () {
//         var cardList = $(this).closest('.image-card-list-title').next('.image-card-list'), // 本厂家图片列表
//             siblingsList = cardList.closest('[class*=aui-col]').siblings('.aui-col-24'); // 另一个厂家容器 兄弟厂家
//         // 处理兄弟照片列表
//         var $nextSwiper = siblingsList.find('.image-card-list').find('.search-detail-box'); // 判断展开状态兄弟厂家是否打开详情
//         if ($nextSwiper.length > 0) {
//             $nextSwiper.find('.card-side-close').click(); // 关闭图片详情弹框
//         }
//         siblingsList.find('.image-card-list').removeClass('showMore list-type-3').addClass('list-type-4'); // 兄弟照片列表收缩
//         siblingsList.find('.image-card-list-title .btn-link').text('查看更多'); // 兄弟照片显示查看更多
//         // 处理自身照片列表
//         if (cardList.hasClass('showMore')) { // 如果照片列表展开
//             var $nextSwiper = cardList.find('.search-detail-box'); // 判断本厂家节点是否打开详情
//             if ($nextSwiper.length > 0) {
//                 $nextSwiper.find('.card-side-close').click(); // 关闭图片详情弹框
//             }
//             $(this).text('查看更多'); // 本厂家图片列表显示查看更多
//             cardList.removeClass('showMore list-type-3').addClass('list-type-4'); // 本厂家图片收缩
//         } else { // 如果照片列表收起
//             $(this).text('收起'); // 本厂家图片列表显示收起
//             cardList.addClass('showMore list-type-3').removeClass('list-type-4'); // 本厂家图片展开
//         }
//     })
// }


// /**
//  * 纯静态检索 厂家>=2 点击图片
//  */
// function onClickStaticCjLarger2ImgItem(container) {
//     container.find('#otherShow').on('click', '.image-card-item', function () {
//         var cardList = $(this).closest('.image-card-list'), // 本厂家图片列表
//             siblingsList = cardList.closest('[class*=aui-col]').siblings('.aui-col-24'); // 展开状态的兄弟节点
//         if (container.find('#otherShow').hasClass('cjCount')) { // 选择厂商 =2时
//             // 处理兄弟照片列表
//             siblingsList.find('.image-card-list').removeClass('showMore'); // 兄弟节点图片收缩
//             siblingsList.find('.image-card-list-title .btn-link').text('查看更多'); // 兄弟节点显示查看更多
//             // 处理自身照片列表
//             if (!cardList.hasClass('showMore')) { // 如果照片列表处于收缩状态
//                 cardList.addClass('showMore'); // 本厂家图片展开
//                 cardList.siblings('.image-card-list-title').find('.btn-link').text('收起'); // 本厂家显示收起
//             }
//         } else { // 选择厂商大于2时
//             // 处理兄弟照片列表
//             if (siblingsList) {
//                 siblingsList.removeClass('aui-col-24').addClass('aui-col-12'); // 兄弟节点占半行
//                 siblingsList.find('.image-card-list').removeClass('showMore list-type-3').addClass('list-type-4'); // 兄弟节点收缩
//                 siblingsList.find('.image-card-list-title .btn-link').text('查看更多'); // 兄弟节点显示查看更多
//             }
//             // 处理自身照片列表
//             if (!cardList.hasClass('showMore')) { // 如果照片列表收缩
//                 cardList.siblings('.image-card-list-title').find('.btn-link').text('收起'); // 本厂家显示收起
//                 cardList.closest('.aui-col-12').removeClass('aui-col-12').addClass('aui-col-24'); // 本厂家占一行
//                 cardList.addClass('showMore list-type-3').removeClass('list-type-4'); // 本厂家展开
//             }
//         }
//         // 处理多个滑块之间的位置关系，用于后面键盘绑定事件
//         siblingsList.each(function (index, el) {
//             var listChildSwiper = $(el).children('.search-detail-box'),
//                 listFindSwiper = $(el).find('.search-detail-box');
//             if (listChildSwiper.length === 0 && listFindSwiper.length > 0) {
//                 listFindSwiper.hide();
//                 var swiperFather = listFindSwiper.parent();
//                 swiperFather.after(listFindSwiper);
//             }
//         });
//         // 去掉融合算法详情
//         if ($('#img-0').length > 0 && siblingsList.length === 0) {
//             var $imgChild = $('#img-0').children('.search-detail-box'),
//                 $imgNext = $('#img-0').next('.search-detail-box');
//             if ($imgChild.length > 0 && $imgNext.length === 0) {
//                 $imgChild.hide();
//                 $('#img-0').after($imgChild);
//             }
//         }
//     }).on('click', '.card-side-close', function () { // 点击详情关闭按钮
//         var cardList = $(this).closest('.image-card-list'),
//             siblingsList = cardList.closest('[class*=aui-col]').siblings('.aui-col-24');
//         if (!container.find('#otherShow').hasClass('cjCount')) { // 厂家数>2
//             // 处理兄弟照片列表
//             if (siblingsList) {
//                 siblingsList.removeClass('aui-col-24').addClass('aui-col-12');
//                 siblingsList.find('.image-card-list').removeClass('showMore list-type-3').addClass('list-type-4');
//                 siblingsList.find('.image-card-list-title .btn-link').text('查看更多');
//             }
//             // 处理自身照片列表
//             if (!cardList.hasClass('showMore')) { // 如果照片收缩
//                 cardList.siblings('.image-card-list-title').find('.btn-link').text('收起');
//                 cardList.closest('.aui-col-12').removeClass('aui-col-12').addClass('aui-col-24');
//                 cardList.addClass('showMore list-type-3').removeClass('list-type-4');
//             } else {
//                 // 将滑块信息重新放置到外面容器的后面
//                 var $cardSwiper = cardList.find('.search-detail-box');
//                 cardList.after($cardSwiper);
//                 if ($cardSwiper.data('comp')) {
//                     $cardSwiper.data('comp').destroy();
//                     $cardSwiper.removeData('comp');
//                 }
//             }
//         }
//     })
// }

// /** 
//  * 纯静态检索 人员信息详情 滑动组件
//  * @param {String} detailContainerID 详情容器的id
//  * @param {String} portraitListID 人像列表的id
//  * @param {int} perPortraitLength 人像长度
//  * @param {*} insertPosition // 详情插入的位置
//  */
// function portraitSlide(detailContainerID, portraitListID, perPortraitLength, insertPosition) {
//     var perPortraitLength = perPortraitLength, // 每行可显示详情个数 一般为8
//         initPerIndex, // 初始激活的行数
//         imageItem = $("#" + portraitListID).find(".image-card-item"), // 图片节点数组
//         tempHtml = '',
//         swiperID = "#" + detailContainerID, // 轮播详情ID
//         insertPosition = insertPosition, // 详情插入的位置
//         mySwiper = new Swiper(swiperID, swiperOpts), // 滑块组件
//         oldRowIndex = 0,
//         newRowIndex = 0;
//     for (var i = 0; i < imageItem.length; i++) { // 各图片滑块最外层
//         tempHtml += '<div class="swiper-slide" attr-index="index-' + parseInt(i + 1) + '">' + '</div>'
//     }
//     $(tempHtml).appendTo($("#" + detailContainerID + " .swiper-wrapper").empty()); // 在元素结尾 内部插入元素
//     if ($(swiperID).data('comp')) {
//         $(swiperID).data('comp').destroy();
//     }
//     // 滑块配置
//     var swiperOpts = {
//         nextButton: '.swiper-button-next',
//         prevButton: '.swiper-button-prev',
//         speed: 500,
//         simulateTouch: false,
//         onSlideChangeStart: function (swiper, index) {
//             imageItem.eq(swiper.activeIndex).addClass("active").siblings(".image-card-item").removeClass('active'); // 当前详情的对应图片加active状态
//             initPerIndex = Math.ceil((swiper.activeIndex + 1) / perPortraitLength); // 详情所属行数
//             oldRowIndex = newRowIndex; // 前一个的行数
//             newRowIndex = initPerIndex; // 当前行数
//             // 不是第一张和最后一张
//             if ((index !== 0) || (index !== imageItem - 1)) {
//                 $(swiperID).find('.btn-prev').removeClass('hide');
//                 $(swiperID).find('.btn-next').removeClass('hide');
//             }
//             // 第一张卡片
//             if (index === 0) {
//                 $(swiperID).find('.btn-prev').addClass('hide');
//             }
//             // 最后一张卡片
//             if (index === imageItem - 1) {
//                 $(swiperID).find('.btn-next').addClass('hide');
//             }
//             // 当前详情与上一个不在同一行
//             if (newRowIndex !== oldRowIndex) {
//                 $("#" + detailContainerID).slideUp(0);
//                 if (imageItem.length > perPortraitLength * initPerIndex) {
//                     imageItem.eq(perPortraitLength * initPerIndex).before($("#" + detailContainerID));
//                 } else {
//                     imageItem.eq(imageItem.length - 1).after($("#" + detailContainerID));
//                 }
//                 imageItem.eq(perPortraitLength * initPerIndex).before($("#" + detailContainerID));
//                 swiper.update(true);
//                 swiper.slideTo(swiper.activeIndex, 0, true);
//                 $("#" + detailContainerID).css({
//                     marginTop: "1.25rem"
//                 }).slideDown(300);
//             }
//             // 判定swiper可视范围
//             window.setTimeout(function () {
//                 var windowH = $(window).height(),
//                     swiperTop = $(swiperID)[0].getBoundingClientRect().top,
//                     swiperH = $(swiperID).outerHeight(),
//                     $scrollView = $('.swiper-scroll-view'),
//                     $navItem = $scrollView.closest('.content-save-item').not('.hide');
//                 $scrollView = $navItem.find('.swiper-scroll-view');
//                 var scrollViewTop = $scrollView.scrollTop();
//                 if (swiperTop + swiperH > windowH) {
//                     var disH = swiperTop + swiperH - windowH;
//                     $scrollView.animate({
//                         'scrollTop': disH + 30 + scrollViewTop
//                     }, 500);
//                 }
//             }, 500)
//         }
//     };
//     $(swiperID).data('comp', mySwiper);
//     // 给全局添加滑动块键盘事件
//     $('body').off('keyup.swiper.' + portraitListID).on('keyup.swiper.' + portraitListID, function (evt) {
//         var $swiperChild = $("#" + portraitListID).children('.search-detail-box');
//         if ($swiperChild.length > 0) {
//             var $swiperPrevBtn = $swiperChild.find('.btn-prev'),
//                 $swiperNextBtn = $swiperChild.find('.btn-next');
//             if (evt.keyCode === 37) { // 键盘左键
//                 $swiperPrevBtn.click();
//             }
//             if (evt.keyCode === 39) { // 键盘右键
//                 $swiperNextBtn.click();
//             }
//         }
//     });
//     $("#" + portraitListID).off('click').on('click', '.image-card-item', function () {
//         var $imageAfter = $(this).parent().children().eq(perPortraitLength * initPerIndex),
//             imageAfterCls = $imageAfter.attr('id'),
//             imageUlId = $(this).parent().attr('id'),
//             imageCls = $(this).parent().hasClass('list-type-4'),
//             time = 0;
//         !imageAfterCls ? time = 300 : time = 0;
//         imageCls ? time = 300 : time = 0;
//         if (imageUlId === 'cardInfoList') {
//             time = 0;
//         }
//         window.setTimeout(function () {
//             var _this = this,
//                 oldIndex = 0,
//                 newIndex = 0,
//                 oldIndex = newIndex;
//             $(this).parent().after($("#" + detailContainerID));
//             if ($(swiperID).data('comp')) {
//                 $(swiperID).data('comp').destroy();
//             }
//             swiperOpts.initialSlide = $(_this).index();
//             var mySwiper = new Swiper(swiperID, swiperOpts);
//             $(swiperID).data('comp', mySwiper);
//             // 判断在其中的字节
//             var selectIndex = $(_this).index();
//             if ((selectIndex !== 0) || (selectIndex !== imageItem - 1)) {
//                 $(swiperID).find('.btn-prev').removeClass('hide');
//                 $(swiperID).find('.btn-next').removeClass('hide');
//             }
//             // 第一张卡片
//             if (selectIndex === 0) {
//                 $(swiperID).find('.btn-prev').addClass('hide');
//             }
//             // 最后一张卡片
//             if (selectIndex === imageItem - 1) {
//                 $(swiperID).find('.btn-next').addClass('hide');
//             }
//             newIndex = parseInt($(_this).index() + 1);
//             oldRowIndex = newRowIndex;
//             newRowIndex = initPerIndex = Math.ceil(($(this).index() + 1) / perPortraitLength);
//             if (newIndex === oldIndex) return;
//             $('.image-card-list').not("#" + portraitListID).find('.image-card-item').removeClass('active');
//             $(".swiper-container").not(swiperID).css({
//                 marginTop: 0,
//                 height: 'auto'
//             }).slideUp(300);
//             if (insertPosition) {
//                 //有多组列表，设置插入容器
//                 if (parseInt($(_this).parents('.aui-col-12').attr("attr-col")) === 1) {
//                     $(_this).parents('.aui-col-12').next().after($("#" + detailContainerID));
//                 } else if (parseInt($(_this).parents('.aui-col-12').attr("attr-col")) === 2) {
//                     $(_this).parents('.aui-col-12').after($("#" + detailContainerID));
//                 }
//             } else {
//                 //只有一组列表 
//                 if (newRowIndex !== oldRowIndex) {
//                     $("#" + detailContainerID).slideUp(0);
//                 }
//                 if (imageItem.length > perPortraitLength * initPerIndex) {
//                     imageItem.eq(perPortraitLength * initPerIndex).before($("#" + detailContainerID));
//                 } else {
//                     imageItem.eq(imageItem.length - 1).after($("#" + detailContainerID));
//                 }
//             }
//             mySwiper.update(true);
//             mySwiper.slideTo($(_this).index(), 0, true);
//             // 判断是否已经在之前创建过一次，获取当前宽度
//             var swiperAttr = $(swiperID).find('.swiper-slide').eq(0).attr('style');
//             if (swiperAttr) {
//                 var swiperWidth = $(swiperID).find('.swiper-slide').eq(0).width(),
//                     $swiperWrapper = $(swiperID).find('.swiper-wrapper');
//                 $swiperWrapper.css({
//                     'transform': 'translate3d(' + (swiperWidth * $(_this).index()) + 'px, 0px, 0px)'
//                 });
//             }
//             $("#" + detailContainerID)
//                 .css({
//                     marginTop: "1.25rem"
//                 })
//                 .slideDown(300, function () {
//                     $("#" + detailContainerID).data('comp').update(true);
//                     $("#" + detailContainerID).data('comp').slideTo($(_this).index(), 0, true);
//                 });
//             $(this).addClass("active").siblings(".image-card-item").removeClass('active');
//             // 判定swiper可视范围
//             window.setTimeout(function () {
//                 var windowH = $(window).height(),
//                     swiperTop = $(swiperID)[0].getBoundingClientRect().top,
//                     swiperH = $(swiperID).outerHeight(),
//                     $scrollView = $('.swiper-scroll-view'),
//                     $navItem = $scrollView.closest('.content-save-item').not('.hide');
//                 $scrollView = $navItem.find('.swiper-scroll-view');
//                 var scrollViewTop = $scrollView.scrollTop();
//                 if (swiperTop + swiperH > windowH) {
//                     var disH = swiperTop + swiperH - windowH;
//                     $scrollView.animate({
//                         'scrollTop': disH + 30 + scrollViewTop
//                     }, 500);
//                 }
//             }, 500)
//         }.bind(this), time)
//     });
// }

// /**
//  * 纯静态检索 人员信息详情 滑动页面内容
//  * @param {Object} data 静态检索返回的图片详细数据 单个data值
//  */
// function createSwiperDetail(data) {
//     var html = '', // 整个详情节点字段
//         lib_html = '<ul class="libInfo-list">', // 所属库节点字段
//         $rhInfo = data.rhInfo, // 融合算法数据
//         $libInfo = data.libInfos, // 所属库数据
//         $similarity = data.similarity; // 相似度
//     html += `<div class="side-search-detail">
//                 <div class="side-bottom-left change-detail-box">
//                     <div class="image-flex-list clearfix">
//                         <div class="image-box-flex">
//                             <span class="image-tag">原图</span>
//                             <img class="img" src="${$('#staticContentContainer').data('base64')}" alt="">
//                         </div>
//                         <div class="image-box-flex">
//                             <span class="image-tag">人脸库</span>
//                             <img class="img" src="${data.url}" alt="">
//                         </div>
//                         <span class="image-flex-similarity">
//             `;
//     // 如果是融合算法，添加命中多少家标签
//     if ($rhInfo) {
//         html += `<span class="primary">命中${$rhInfo.length}家</span>`;
//     } else { // 否则添加相似度标签
//         html += `<span class="${$similarity >= '90%' ? 'danger' : $similarity >= '60%' && $similarity < '90%' ? 'warning' : 'white'}">${$similarity}</span>`;
//     }
//     html += `   </span>
//             </div>
//             <div class="message-icon-group icon-bg-white">
//                 <div class="btn-group-default">
//                     <button type="button" class="btn btn-sm sureSearch">比中</button>
//                     <button type="button" class="btn btn-sm repeatSearch">二次检索</button>
//                     <button type="button" class="btn btn-sm quitControl">快速布控</button>
//                 </div>
//             </div>
//         </div>
//         <div class="side-bottom-right">
//             <div class="aui-mb-sm">
//                 <span class="text-lg name text-bold">${data.name}</span>
//             `;
//     // 按照type类型进行排序
//     function sortType(a, b) {
//         var order = [1, 2, 0];
//         return order.indexOf(a.type) - order.indexOf(b.type);
//     }
//     $libInfo.sort(sortType);
//     // 申明两个布尔值，避免重复添加在逃人员和重点人员标签
//     var $type_1 = true,
//         $type_2 = true;
//     // 循环所属库数据，拼接所属库节点字段
//     $libInfo.forEach((item, index) => {
//         if (item.libType === '1' || item.libType === 1) {
//             lib_html += `<li class="libInfo-item danger">${item.libName}</li>`;
//             if ($type_1) {
//                 html += `<span class="tag tag-error aui-ml-xs">在逃人员</span>`;
//             }
//             $type_1 = false;
//         } else if (item.libType === '2' || item.libType === 2) {
//             lib_html += `<li class="libInfo-item warning">${item.libName}</li>`;
//             if ($type_2) {
//                 html += `<span class="tag tag-warning aui-ml-xs">重点人物</span>`;
//             }
//             $type_2 = false;
//         } else {
//             lib_html += `<li class="libInfo-item">${item.libName}</li>`;
//         }
//     })
//     lib_html += `</ul>`;
//     html += `</div>
//             <div class="form-info aui-row clearfix">
//                 <div class="aui-col-12">
//                     <div class="form-group aui-row">
//                         <label class="aui-form-label aui-col-8">
//                             <span>所属库：</span>
//                         </label>
//                         <div class="form-text aui-col-16 libInfo">${lib_html}</div>
//                     </div>
//                     <div class="form-group aui-row">
//                         <label class="aui-form-label aui-col-8">
//                             <span>性别：</span>
//                         </label>
//                         <div class="form-text aui-col-16 sex">${data.sex}</div>
//                     </div>
//                     <div class="form-group aui-row">
//                         <label class="aui-form-label aui-col-8">
//                             <span>年龄：</span>
//                         </label>
//                         <div class="form-text aui-col-16 age">${data.age}</div>
//                     </div>
//                     <div class="form-group aui-row">
//                         <label class="aui-form-label aui-col-8">
//                             <span>身份证：</span>
//                         </label>
//                         <div class="form-text aui-col-16 idcard">${data.idcard}</div>
//                     </div>
//                     <div class="form-group aui-row">
//                         <label class="aui-form-label aui-col-8">
//                             <span>出生日期：</span>
//                         </label>
//                         <div class="form-text aui-col-16 birthday">${data.birthday}</div>
//                     </div>
//                 </div>
//                 <div class="aui-col-12">
//                     <!--<div class="form-group aui-row">
//                         <label class="aui-form-label aui-col-8">
//                             <span>户籍所在地：</span>
//                         </label>
//                         <div class="form-text aui-col-16 census"></div>
//                     </div>
//                     <div class="form-group aui-row">
//                         <label class="aui-form-label aui-col-8">
//                             <span>当前居住地：</span>
//                         </label>
//                         <div class="form-text aui-col-16 city"></div>
//                     </div>-->
//     `;
//     // 如果是融合算法，有序添加各家算法相似度
//     if ($rhInfo) {
//         $rhInfo.sort(sortInfo);
//         $rhInfo.forEach((item, index) => {
//             html += `<div class="form-group aui-row">
//                         <label class="aui-form-label aui-col-8">
//                             <span>${item.platformName}：</span>
//                         </label>
//                         <div class="form-text aui-col-16" similarity>${item.similarity}</div>
//                     </div>`;
//         })
//     } else { // 否则添加单独厂商相似度
//         html += `<div class="form-group aui-row">
//                     <label class="aui-form-label aui-col-8">
//                         <span>相似度：</span>
//                     </label>
//                     <div class="form-text aui-col-16" similarity>${$similarity}</div>
//                 </div>`;
//     }
//     html += `</div>
//             </div>
//             </div>
//             </div>`;
//     return html;
// }
/*************************  纯静态检索方法 end  *************************/
/*************************  静态检索 动静融合 end  *************************/
/************************* 动态检索 动静融合 start *************************/
var sortList = [], // 按相似度排序
    sortTimeList = [], // 按时间排序
    timeTogetherList = [], // 聚合 按时间聚合 返回的timeGroup
    positionTogetherList = [], // 聚合 按地点聚合 返回的orgGroup
    pageMergeType = 1, // 结果集汇聚类型 1.时间 2.地点
    selectType = 2, // 1.按时间检索 2.按相似度检索 3.按时间聚合, 4.按地点聚合
    dynamicData = '', // 动态检索数据
    sendData = {
        src: $('.add-image-item.active').eq(0).find('.add-image-img').attr('src'), // 目标查询图片节点的base64
        mergeType: 1,
        page: 1,
        number: 32
    };

/**
 * 拿到检索权限
 * @param {string} type 检索类型
 * @param {string} id 事件id
 * @param {string} staticId 图片id
 */
function getPowerUse(type, id, staticId) {
    var loadType = [];
    if (type == 1) {
        loadType = ['1'];
    } else if (type == 2) {
        loadType = ['2'];
    } else {
        loadType = ['1', '2'];
    }
    var searchPort = 'v3/myApplication/getIncidentInfo',
        searchData = {
            "types": loadType,
            "incidentId": id,
            staticId
        },
        searchSuccessFunc = function (data) {
            if (data.code === '200') {
                var data = data.data;
                data.forEach((val) => {
                    var html = `<span class="limitTitle ${val.startUseDate ? '' : 'hide'}">可使用日期:</span>
                                <span class="${val.startUseDate ? '' : 'hide'}">${val.startUseDate}~${val.endUseDate}</span>
                                <span class="limitTitle ${val.startUseTime ? '' : 'hide'}">可使用时间段:</span>
                                <span class="${val.startUseTime ? '' : 'hide'}">${val.startUseTime}~${val.endUseTime}</span>
                                <span class="limitTitle ${val.limitCount ? '' : 'hide'}">使用总次数:</span>
                                <span class="${val.limitCount ? '' : 'hide'}">${val.useCount || 0}/${val.limitCount}</span>
                                <span class="limitTitle ${val.dayLimitCount ? '' : 'hide'}">今日使用情况:</span>
                                <span class="${val.dayLimitCount ? '' : 'hide'}">${val.dayUseCount || 0}/${val.dayLimitCount}</span>`;
                    if (val.type == '1') { //静态
                        if (type == 1) { //纯静态页面
                            if (val.authority) { //有权限
                                $("#staticSearchPower").html(html);
                                $("#staticSearch").removeClass("hide");
                                $("#staticApply").addClass("hide");
                            } else {
                                $("#staticSearchPower").html(html);
                                $("#staticSearch").addClass("hide");
                                $("#staticApply").removeClass("hide");
                            }

                            if ($("#commentSelectStatic").attr("isverify") == '0') {
                                $("#staticSearchPower").html("");
                            }
                            $("#staticSearch").attr("type", "");
                        } else if (type == 3) { //综合页面
                            if (val.authority) { //有权限
                                $("#staticMergeSearchPower").html(html);
                                $("#headingOne").find(".ui-checkboxradio-checkbox-label").addClass("ui-checkboxradio-checked").attr("authority", '1');
                            } else {
                                $("#staticMergeSearchPower").html(html);
                                $("#headingOne").find(".ui-checkboxradio-checkbox-label").removeClass("ui-checkboxradio-checked").attr("authority", '0');
                            }

                            if ($("#headingOne").find(".ui-checkboxradio-checkbox-label").attr("isverify") == '0') {
                                $("#headingOne").find(".ui-checkboxradio-checkbox-label").addClass("ui-checkboxradio-checked").attr("authority", '1');
                                $("#staticMergeSearchPower").html("");
                            }
                        }
                    } else if (val.type == '2') { //动态
                        if (type == 2) { //纯动态页面
                            $("#commentSelectDynamic").attr("authority", val.authority);
                            //if (val.authority) {
                            if (val.authority || $("#usearchImgDynamic").find(".add-image-item.active .add-image-img").attr("zt") == '1') { //有权限
                                $("#dynamicSearchPower").html(html);
                                $("#dynamicsearchDynamic").removeClass("hide");
                                $("#dynamicApply").addClass("hide");
                            } else {
                                $("#dynamicSearchPower").html(html);
                                $("#dynamicsearchDynamic").addClass("hide");
                                $("#dynamicApply").removeClass("hide");
                            }
                            $("#dynamicsearchDynamic").attr("type", "");
                        } else if (type == 3) { //综合页面
                            $("#commentSelectMerge").attr("authority", val.authority);
                            //if (val.authority) {
                            if (val.authority || $("#usearchImg").find(".add-image-item.active .add-image-img").attr("zt") == '1') { //有权限
                                $("#dynamicMergeSearchPower").html(html);
                                $("#headingTwo").find(".ui-checkboxradio-checkbox-label").addClass("ui-checkboxradio-checked").attr("authority", '1');
                            } else {
                                $("#dynamicMergeSearchPower").html(html);
                                $("#headingTwo").find(".ui-checkboxradio-checkbox-label").removeClass("ui-checkboxradio-checked").attr("authority", '0');
                            }
                            if ($("#commentSelectMerge").find(".selectpicker").val() == '') {
                                $("#dynamicMergeSearchPower").html("");
                            }
                        }
                    }
                })

                if (type == 3) {
                    if (!$("#headingOne").find(".ui-checkboxradio-checkbox-label").hasClass("ui-checkboxradio-checked") && !$("#headingTwo").find(".ui-checkboxradio-checkbox-label").hasClass("ui-checkboxradio-checked")) {
                        $("#mergeSearch").addClass("hide");
                        $("#resetBtn").addClass("hide");
                        $("#mergeApply").removeClass("hide");
                    } else {
                        $("#mergeSearch").removeClass("hide");
                        $("#resetBtn").removeClass("hide");
                        $("#mergeApply").addClass("hide");
                    }

                    $("#mergeSearch").attr("type", "");
                }
            } else {
                //特殊人员权限
                if (data.code === '624') {
                    if (type == 1) { //纯静态页面
                        $("#staticSearch").addClass("hide");
                        $("#staticApply").removeClass("hide");
                        //type为624代表是特殊人员上传图片等不影响
                        $("#staticSearch").attr("type", "624");
                    } else if (type == 3) { //综合页面
                        $("#mergeSearch").addClass("hide");
                        $("#resetBtn").addClass("hide");
                        $("#mergeApply").removeClass("hide");
                        //type为624代表是特殊人员上传图片等不影响
                        $("#mergeSearch").attr("type", "624");
                    } else {
                        $("#dynamicsearchDynamic").addClass("hide");
                        $("#dynamicApply").removeClass("hide");
                        //type为624代表是特殊人员上传图片等不影响
                        $("#dynamicsearchDynamic").attr("type", "624");
                    }
                    warningTip.say('该人员为敏感人员，请申请敏感人员查询权限审批通过后检索');
                } else {
                    if (type == 1) { //纯静态页面
                        $("#staticSearch").attr("type", "");
                    } else if (type == 3) { //综合页面
                        $("#mergeSearch").attr("type", "");
                    } else {
                        $("#dynamicsearchDynamic").attr("type", "");
                    }
                    warningTip.say("获取检索权限失败,请稍后再试");
                }
            }
        };
    loadData(searchPort, true, searchData, searchSuccessFunc);
};

/**获取任务名称
 * @param {object} $container 时间选择容器
 * @param {string} eventId 事件id(页面跳转时拿到之前的事件赋值)
 */
function getSelectComments($container, eventId) {
    showLoading($container);
    if ($container.attr("id") == 'commentSelectStatic') { //静态
        var commentsType = ['1'];
    } else if ($container.attr("id") == 'commentSelectDynamic') {
        var commentsType = ['2'];
    } else {
        var commentsType = ['1', '2'];
    }
    var port = 'v3/myApplication/getIncidentList',
        data = {
            'types': commentsType
        };
    var successFunc = function (data) {
        hideLoading($container);
        if (data.code === '200') {
            data.whiteList.forEach((val, index) => {
                if (val.type == '1') { //静态
                    if ($container.attr("id") == 'commentSelectStatic') { //静态页面
                        if (val.isWhite == '1') { //在白名单
                            $container.addClass("hide");
                            $container.parents(".aui-from-horizontal").addClass("hide");

                            $("#staticSearch").removeClass("hide");
                            $("#staticApply").addClass("hide");
                        } else {
                            if (val.isVerify == '0') { //静态是0时不需要校验事件
                                $("#commentSelectStatic").attr('isVerify', '0');
                            } else {
                                $("#commentSelectStatic").attr('isVerify', '1');
                            }
                            $container.removeClass("hide");
                            $container.parents(".aui-from-horizontal").removeClass("hide");
                        }
                    } else if ($container.attr("id") == 'commentSelectMerge') { //综合页面
                        if (val.isWhite == '1') { //在白名单
                            $("#headingOne").find(".ui-checkboxradio-checkbox-label").attr("isWhite", '1');
                            $("#headingOne").find(".ui-checkboxradio-checkbox-label").addClass("ui-checkboxradio-checked").attr("authority", '1');
                        } else {
                            if (val.isVerify == '0') { //静态是0时不需要校验事件
                                $("#headingOne").find(".ui-checkboxradio-checkbox-label").attr('isVerify', '0');
                                $("#headingOne").find(".ui-checkboxradio-checkbox-label").attr("isWhite", '0');
                                $("#headingOne").find(".ui-checkboxradio-checkbox-label").addClass("ui-checkboxradio-checked").attr("authority", '1');
                            } else {
                                $("#headingOne").find(".ui-checkboxradio-checkbox-label").attr('isVerify', '1');
                                $("#headingOne").find(".ui-checkboxradio-checkbox-label").attr("isWhite", '0');
                                $("#headingOne").find(".ui-checkboxradio-checkbox-label").removeClass("ui-checkboxradio-checked").attr("authority", '0');
                            }
                        }
                    }
                } else if (val.type == '2') {
                    if ($container.attr("id") == 'commentSelectDynamic') { //动态页面
                        if (val.isWhite == '1') { //在白名单
                            $container.addClass("hide");
                            $container.parents(".aui-from-horizontal").addClass("hide");

                            $("#dynamicsearchDynamic").removeClass("hide");
                            $("#dynamicApply").addClass("hide");
                        } else {
                            $container.removeClass("hide");
                            $container.parents(".aui-from-horizontal").removeClass("hide");
                        }
                    } else if ($container.attr("id") == 'commentSelectMerge') { //综合页面
                        if (val.isWhite == '1') { //在白名单
                            $("#headingTwo").find(".ui-checkboxradio-checkbox-label").attr("isWhite", '1');
                            $("#headingTwo").find(".ui-checkboxradio-checkbox-label").addClass("ui-checkboxradio-checked").attr("authority", '1');
                        } else {
                            $("#headingTwo").find(".ui-checkboxradio-checkbox-label").attr("isWhite", '0');
                            $("#headingTwo").find(".ui-checkboxradio-checkbox-label").removeClass("ui-checkboxradio-checked").attr("authority", '0');
                        }
                    }
                }
            });

            if ($container.attr("id") == 'commentSelectMerge') { //综合页面
                if ($("#headingOne").find(".ui-checkboxradio-checkbox-label").attr("isWhite") == '1' && $("#headingTwo").find(".ui-checkboxradio-checkbox-label").attr("isWhite") == '1') {
                    $container.addClass("hide");
                    $container.parent().addClass("hide");

                    $("#mergeSearch").removeClass("hide");
                    $("#resetBtn").removeClass("hide");
                    $("#mergeApply").addClass("hide");
                } else {
                    $container.removeClass("hide");
                    $container.parent().removeClass("hide");
                }
            }

            if (!$container.hasClass("hide")) { //如果选择事件是隐藏的就代表在白名单里
                var result = data.data,
                    arrayBox = {},
                    itemHtml = '';
                if (result && result.length) {
                    for (var i = 0; i < result.length; i++) {
                        itemHtml += `<option class="option-item" incidentId="${result[i].incidentId}" value="${result[i].incidentId}" ${i == 0 ? 'selected' : ''}>${result[i].incident}</option>`;
                    }
                }
                var html = `<select class="selectpicker" data-live-search="true" title="请选择事件">${itemHtml}</select>`;
                $container.empty().append(html); // 元素赋值
                if (result && result.length) { // 存在返回值
                    $container.find(".selectpicker").selectpicker({
                        allowClear: false,
                    });
                    // $container.find(".selectpicker").val(result[0].incidentId);
                    $container.find(".selectpicker").selectpicker('val', eventId ? eventId : '');
                    $container.find(".selectpicker").selectpicker('refresh');
                    if ($container.attr("id") == 'commentSelectStatic' && $container.find(".selectpicker").val()) { //静态
                        getPowerUse(1, $container.find(".selectpicker").val());
                    } else if ($container.attr("id") == 'commentSelectDynamic' && $container.find(".selectpicker").val()) {
                        getPowerUse(2, $container.find(".selectpicker").val());
                    } else if ($container.attr("id") == 'commentSelectMerge' && $container.find(".selectpicker").val()) {
                        getPowerUse(3, $container.find(".selectpicker").val());
                    }

                    $container.find(".selectpicker").on('changed.bs.select', function (e, clickedIndex, isSelected) {
                        if (isSelected) {
                            var $targetOptionItem = $container.find(".selectpicker .option-item").eq(clickedIndex - 1);
                            if ($container.attr("id") == 'commentSelectStatic') { //静态
                                getPowerUse(1, $targetOptionItem.attr('incidentId'), $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'));
                            } else if ($container.attr("id") == 'commentSelectDynamic') {
                                getPowerUse(2, $targetOptionItem.attr('incidentId'), $('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'));
                            } else {
                                getPowerUse(3, $targetOptionItem.attr('incidentId'), $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'));
                            }
                        }
                    });
                } else {
                    $container.attr("authority", "false");
                    $container.find(".selectpicker").prop('disabled', true);
                    $container.find(".selectpicker").val(null);
                    $container.find(".selectpicker").selectpicker('refresh');

                    if ($container.attr("id") == 'commentSelectStatic') { //静态
                        $("#staticSearchPower").html('');
                        if ($("#commentSelectStatic").attr('isVerify') == 0) {
                            $("#staticSearch").removeClass("hide");
                            $("#staticApply").addClass("hide");
                        } else {
                            $("#staticSearch").addClass("hide");
                            $("#staticApply").removeClass("hide");
                        }
                    } else if ($container.attr("id") == 'commentSelectDynamic') {
                        $("#dynamicSearchPower").html('');
                        $("#dynamicsearchDynamic").addClass("hide");
                        $("#dynamicApply").removeClass("hide");
                    } else {
                        //静态可以检索
                        if ($("#headingTwo").find(".ui-checkboxradio-checkbox-label").attr("isWhite") == '0') {
                            $("#dynamicMergeSearchPower").html('');
                            $("#headingTwo").find(".ui-checkboxradio-checkbox-label").removeClass("ui-checkboxradio-checked").attr("authority", '0');
                            $("#mergeSearch").addClass("hide");
                            $("#resetBtn").addClass("hide");
                            $("#mergeApply").removeClass("hide");
                        } else {
                            $("#mergeSearch").removeClass("hide");
                            $("#resetBtn").removeClass("hide");
                            $("#mergeApply").addClass("hide");
                        }

                        if ($("#headingOne").find(".ui-checkboxradio-checkbox-label").attr('isVerify') == '0' || $("#headingOne").find(".ui-checkboxradio-checkbox-label").attr("isWhite") == '1') {
                            $("#staticMergeSearchPower").html('');
                            $("#headingOne").find(".ui-checkboxradio-checkbox-label").addClass("ui-checkboxradio-checked").attr("authority", '1');
                            $("#mergeSearch").removeClass("hide");
                            $("#resetBtn").removeClass("hide");
                            $("#mergeApply").addClass("hide");
                        }
                    }
                }
            }
        } else {
            var html = `<select class="selectpicker" data-live-search="true" title="请选择事件"></select>`;
            $container.empty().append(html); // 元素赋值
            $container.find(".selectpicker").prop('disabled', true);
            $container.find(".selectpicker").val(null);
            $container.find(".selectpicker").selectpicker('refresh');

            if ($container.attr("id") == 'commentSelectStatic') { //静态
                $("#staticSearchPower").html('');
                $("#staticSearch").addClass("hide");
                $("#staticApply").removeClass("hide");
            } else if ($container.attr("id") == 'commentSelectDynamic') {
                $("#dynamicSearchPower").html('');
                $("#dynamicsearchDynamic").addClass("hide");
                $("#dynamicApply").removeClass("hide");
            } else {
                $("#staticMergeSearchPower").html('');
                $("#headingOne").find(".ui-checkboxradio-checkbox-label").removeClass("ui-checkboxradio-checked").attr("authority", '0');
                $("#dynamicMergeSearchPower").html('');
                $("#headingTwo").find(".ui-checkboxradio-checkbox-label").removeClass("ui-checkboxradio-checked").attr("authority", '0');
                $("#mergeSearch").addClass("hide");
                $("#resetBtn").addClass("hide");
                $("#mergeApply").removeClass("hide");
            }
        }
    };
    loadData(port, true, data, successFunc);
};

//获取布控权限
function getControlUsePower(id) {
    var port = 'v2/user/getUserOperateAuthorty',
        data = {
            moduleCode: id
        };
    var successFunc = function (data) {
        if (data.code === '200') {
            // if (data.authoritys.indexOf("3") > -1) { //布控
            //     $(".newBukongReal").removeClass("hide");
            // } else {
            //     $(".newBukongReal").addClass("hide");
            // }
            // if (data.authoritys.indexOf("4") > -1) { //订阅
            //     $("#subscribe-tree-list").attr("controlUse", "1");
            // } else {
            //     $("#subscribe-tree-list").attr("controlUse", "0");
            // }
            var flag = false;
            if (data.data.length > 0) {
                flag = data.data.some(item => item.operateName == '新增')
            }

            if (flag) {  //新增是否有权限
                $(".newBukongReal").removeClass("hide");
            } else {
                $(".newBukongReal").addClass("hide");
            }
        } else {
            warningTip.say(data.message);
        }
    };
    loadData(port, true, data, successFunc, undefined, 'GET');
};

//申请检索按钮点击事件
$("#content-box").on("click", ".searchApply", function () {
    var url = "./facePlatform/applyUsePower.html?dynamic=" + Global.dynamic;
    loadPage($('.applyUse-new-popup'), url);
    $('.applyUse-new-popup').removeClass('hide');
    $('.applyUse-new-popup').data("allData", '');
});

/**
 * 按相似度排序检索 如果目标检索图片没有绑定id 需先绑定id
 * @param {Object} dynamicData 左侧动态检索条件
 */
function peopleSnappingSearch(dynamicData, itemCache) {
    var $cardContent = $('#search-info' + itemCache);
    if ($cardContent.length > 1) {
        $cardContent = $cardContent.eq(1);
    }
    searchSimilarSortData(dynamicData, itemCache);
}

/**
 * 动态抓拍库 相似度排序 请求数据和翻页 （其中包含 调用聚合数据方法）
 * @param {Object} dynamicData 左侧动态检索条件
 * @param {number} count 失效的次数
 */
function searchSimilarSortData(dynamicData, itemCache, count) {
    var $cardContent = $('#search-info' + itemCache),
        port = 'v2/faceDt/peopleSearch',
        option = {
            dynamicId: dynamicData.selectImgId, // 图片
            threshold: dynamicData.threshold, // 阈值
            startTime: dynamicData.startTime, // 开始时间
            endTime: dynamicData.endTime, // 结束时间
            idcard: dynamicData.idcard,
            cameraIds: dynamicData.videos, // 摄像头id
            orgIds: dynamicData.videoGroups, // 机构id
            type: dynamicData.type,
            nodeType: dynamicData.nodeType,
            incidentId: $("#headingTwo").find(".ui-checkboxradio-checkbox-label").attr("isWhite") == '1' ? '' : $("#commentSelectMerge").find(".selectpicker").val(),
            page: 1, // 当前页
            size: 40, // 每一页个数
            sort: 1 // 相似度降序排序
        },
        successFunc = function (data) {
            if ($("#headingTwo").find(".ui-checkboxradio-checkbox-label").attr("isWhite") != '1') {
                getPowerUse(3, $("#commentSelectMerge").find(".selectpicker").val());
            }
            $('#mergeSearch').removeAttr('disabled'); //防止检索暴力点击
            if (data.code === '200') {
                var result = data.data,
                    allSelectedCardList = $("#image-merge-list-" + itemCache).data('trakData') && $("#image-merge-list-" + itemCache).data('trakData').length > 0 ? $("#image-merge-list-" + itemCache).data('trakData') : [];
                sortList = result.list; // 相似度排序 返回的数据集
                $("#image-merge-list-" + itemCache).data('sortListDynamic', sortList);
                // 检索图片 返回值为空
                if (sortList.length === 0 || +result.total === 0) {
                    hideLoading($cardContent);
                    loadEmpty($cardContent);
                    // loadEmpty($("#timeTogetherWrapper"));
                    // loadEmpty($("#positionTogetherWrapper"));
                    var targetOrigin = mapUrl + 'peopleCity.html',
                        data = {
                            type: "cluster",
                            mydata: []
                        },
                        iframe = document.getElementById('search_map_iframe');
                    iframe.contentWindow.postMessage(data, targetOrigin);
                    return;
                }
                // // 根据返回值 vertices 构造 人脸位置facePosition
                // for (var i = 0; i < sortList.length; i++) {
                //     sortList[i].facePosition = getFacePositionData(sortList[i]);
                // }
                $('#search-info' + itemCache).find('.image-card-wrap').remove();
                $('#search-info' + itemCache).attr("sortTotal", result.total);
                creatSnappingItem(sortList, result.total, itemCache, $('#search-info' + itemCache), 'paginationScoreWrap' + itemCache, 'pagination' + itemCache); // 动态抓拍库生成节点
                allSelectedCardList.forEach(function (item) {
                    sortList.forEach(function (v, n) {
                        if (v.picId === item.picId) {
                            $('#search-info' + itemCache).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                        }
                    })
                });
                // 全选按钮选中状态
                judgeSelectePageAll($('#search-info' + itemCache));
                //分页
                var $pagination = $('#pagination' + itemCache);
                if (+result.totalPage !== 0 && +result.totalPage !== 1) {
                    var eventCallBack = function (currPage, pageSize) {
                        pageLoad();

                        function pageLoad(rcount) {
                            var changePort = 'v2/faceDt/peopleSearch',
                                changePote = {
                                    //dynamicId: $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'), // 图片
                                    dynamicId: dynamicData.selectImgId, // 图片id
                                    threshold: option.threshold, // 阈值
                                    startTime: option.startTime, // 开始时间
                                    endTime: option.endTime, // 结束时间
                                    idcard: dynamicData.idcard,
                                    cameraIds: dynamicData.videos, // 摄像头id
                                    orgIds: dynamicData.videoGroups, // 机构id
                                    type: dynamicData.type,
                                    nodeType: dynamicData.nodeType,
                                    incidentId: $("#headingTwo").find(".ui-checkboxradio-checkbox-label").attr("isWhite") == '1' ? '' : $("#commentSelectMerge").find(".selectpicker").val(),
                                    page: currPage, // 当前页
                                    size: Number(pageSize), // 每一页个数
                                    sort: 1
                                },
                                successFn = function (data) {
                                    if (data.code === '200') {
                                        hideLoading($cardContent);
                                        removeLoadEmpty($cardContent);
                                        sortList = data.data.list;
                                        $("#image-merge-list-" + itemCache).data('sortListDynamic', sortList);
                                        // 根据返回值 vertices 构造 人脸位置facePosition
                                        // for (var i = 0; i < sortList.length; i++) {
                                        //     sortList[i].facePosition = getFacePositionData(sortList[i]);
                                        // }
                                        $('#search-info' + itemCache).find('.image-card-wrap').remove();
                                        $('#search-info' + itemCache).attr("sortTotal", data.data.total);
                                        // 创建图片节点
                                        creatSnappingItem(sortList, data.data.total, itemCache, $('#search-info' + itemCache), 'paginationScoreWrap' + itemCache, 'pagination' + itemCache);
                                        // 初始化 所有被选中的图片
                                        var allSelectedCardList = $("#image-merge-list-" + itemCache).data('trakData') && $("#image-merge-list-" + itemCache).data('trakData').length > 0 ? $("#image-merge-list-" + itemCache).data('trakData') : []; // 被选中的图片列表
                                        allSelectedCardList.forEach(function (item) {
                                            sortList.forEach(function (v, n) {
                                                if (v.picId === item.picId) {
                                                    $('#search-info' + itemCache).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                                }
                                            })
                                        });
                                        var maskID = $('.image-card-list.no-bottom-border').children().not('.display-none').attr('id'); // 当前被选中的动态检索类型的容器
                                        $('.mask-container-fixed.' + maskID).remove(); // 删除大图
                                        judgeSelectePageAll($('#search-info' + itemCache));
                                        // 抓拍图节点数据添加
                                        addDataByDymPic('#search-info' + itemCache, sortList);
                                    } else if (data.code === '616') {
                                        hideLoading($cardContent);
                                        var sxrCount = rcount ? rcount : 1;
                                        if (sxrCount < 4) {
                                            // 给图片绑定静态id
                                            var picBase64 = dynamicData.base64Img;
                                            if (picBase64.indexOf("http") == 0) { //url
                                                var picIdPortData = {
                                                    url: picBase64,
                                                    staticId: dynamicData.selectImgId,
                                                    moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                                                    opType: dynamicData.selectImgOpType,
                                                    searchComments: dynamicData.selectImgSearchComments
                                                };
                                            } else { //base64
                                                var picIdPortData = {
                                                    base64: picBase64,
                                                    staticId: dynamicData.selectImgId,
                                                    moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                                                    opType: dynamicData.selectImgOpType,
                                                    searchComments: dynamicData.selectImgSearchComments
                                                };
                                            }
                                            var picIdPort = 'v2/faceRecog/uploadImage',
                                                picIdSuccessFunc = function (data) {
                                                    if (data.code == '200') {
                                                        $("#usearchImg").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                                            if ($(ele).find(".add-image-img").attr('picId') == dynamicData.selectImgId) {
                                                                // 给当前选中的图片绑定id
                                                                $(ele).find('.add-image-img').attr('picId', data.staticId);
                                                                $(ele).find('.add-image-img').attr('picStatus', '1');
                                                            }
                                                        })
                                                        dynamicData.selectImgId = data.staticId;
                                                        // 重新请求 数据相似度排序
                                                        sxrCount += sxrCount;
                                                        pageLoad(sxrCount);
                                                    } else {
                                                        warningTip.say(data.message);
                                                        $("#usearchImg").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                                            if ($(ele).find(".add-image-img").attr('picId') == dynamicData.selectImgId) {
                                                                $(ele).find('.add-image-img').attr('picStatus', '0');
                                                            }
                                                        });
                                                    }
                                                };
                                            loadData(picIdPort, false, picIdPortData, picIdSuccessFunc);
                                        } else {
                                            warningTip.say("图片已失效，请重新上传图片");
                                        }
                                    }
                                };
                            showLoading($cardContent);
                            loadData(changePort, true, changePote, successFn);
                        }
                    };
                    var pageSizeOpt = [{
                        value: 40,
                        text: '40/页',
                        selected: true
                    }, {
                        value: 80,
                        text: '80/页',
                    }];
                    setPageParams($pagination, result.total, result.totalPage, eventCallBack, true, pageSizeOpt);
                    $('#pagination' + itemCache).closest('.pagination-wrap').removeClass('display-none').find('.pagination-result-number').text(result.total);
                } else {
                    $pagination.closest('.pagination-wrap').remove();
                }
                hideLoading($cardContent);
                removeLoadEmpty($cardContent);
                $('#collapseDynamic').find('.card-tip').removeClass('hide');
                // 抓拍图节点数据添加
                addDataByDymPic('#search-info' + itemCache, sortList);
            } else {
                hideLoading($cardContent);
                loadEmpty($cardContent);
                // 如果图片id失效  重新获取图片id 再次发起检索请求
                if (data.code === '616') {
                    var sxCount = count ? count : 1;
                    if (sxCount < 4) {
                        // 给图片绑定静态id
                        var picBase64 = dynamicData.base64Img;
                        if (picBase64.indexOf("http") == 0) { //url
                            var picIdPortData = {
                                url: picBase64,
                                staticId: dynamicData.selectImgId,
                                moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                                opType: dynamicData.selectImgOpType,
                                searchComments: dynamicData.selectImgSearchComments
                            };
                        } else { //base64
                            var picIdPortData = {
                                base64: picBase64,
                                staticId: dynamicData.selectImgId,
                                moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                                opType: dynamicData.selectImgOpType,
                                searchComments: dynamicData.selectImgSearchComments
                            };
                        }
                        var picIdPort = 'v2/faceRecog/uploadImage',
                            picIdSuccessFunc = function (data) {
                                if (data.code == '200') {
                                    $("#usearchImg").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                        if ($(ele).find(".add-image-img").attr('picId') == dynamicData.selectImgId) {
                                            // 给当前选中的图片绑定id
                                            $(ele).find('.add-image-img').attr('picId', data.staticId);
                                            $(ele).find('.add-image-img').attr('picStatus', '1');
                                        }
                                    })
                                    dynamicData.selectImgId = data.staticId;
                                    // 重新请求 数据相似度排序
                                    sxCount += sxCount;
                                    searchSimilarSortData(dynamicData, itemCache, sxCount);
                                } else {
                                    warningTip.say(data.message);
                                    $("#usearchImg").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                        if ($(ele).find(".add-image-img").attr('picId') == dynamicData.selectImgId) {
                                            $(ele).find('.add-image-img').attr('picStatus', '0');
                                        }
                                    });
                                }
                            };
                        loadData(picIdPort, false, picIdPortData, picIdSuccessFunc);
                    } else {
                        warningTip.say("图片已失效，请重新上传图片");
                    }
                } else {
                    warningTip.say(data.message);
                }

                var targetOrigin = mapUrl + 'peopleCity.html',
                    data = {
                        type: "cluster",
                        mydata: []
                    },
                    iframe = document.getElementById('search_map_iframe');
                iframe.contentWindow.postMessage(data, targetOrigin);
                $('#collapseDynamic').find('.card-tip').addClass('hide');
            }
        };
    if (!dynamicData.base64Img) {
        hideLoading($cardContent);
        loadEmpty($cardContent);
        return
    } else {
        $('.loading-box').removeClass('hide');
        showLoading($cardContent);
    }
    loadData(port, true, option, successFunc);
}

/**
 * 按时间排序检索 如果目标检索图片没有绑定id 需先绑定id
 * @param {Object} dynamicData 左侧动态检索条件
 */
function peopleSnappingSearchTime(dynamicData, itemCache) {
    var $cardContent = $('#sortByTimeWrapper' + itemCache);
    if ($cardContent.length > 1) {
        $cardContent = $cardContent.eq(1);
    }
    searchTimeSortData(dynamicData, itemCache);
}

/**
 * 动态抓拍库 时间排序 请求数据和翻页
 * @param {Object} dynamicData 左侧动态检索条件
 * @param {Object} itemCache 当前检索图片索引
 * @param {number} count 失效的次数
 */
function searchTimeSortData(dynamicData, itemCache, count) {
    var $cardContent = $('#sortByTimeWrapper' + itemCache),
        port = 'v2/faceDt/peopleSearch',
        option = {
            dynamicId: dynamicData.selectImgId, // 图片
            threshold: dynamicData.threshold, // 阈值
            startTime: dynamicData.startTime, // 开始时间
            endTime: dynamicData.endTime, // 结束时间
            idcard: dynamicData.idcard,
            cameraIds: dynamicData.videos, // 摄像头id
            orgIds: dynamicData.videoGroups, // 机构id
            type: dynamicData.type,
            nodeType: dynamicData.nodeType,
            incidentId: $("#headingTwo").find(".ui-checkboxradio-checkbox-label").attr("isWhite") == '1' ? '' : $("#commentSelectMerge").find(".selectpicker").val(),
            page: 1, // 当前页
            size: 40, // 每一页个数
            sort: 2 // 时间降序排序
        },
        successFunc = function (data) {
            if ($("#headingTwo").find(".ui-checkboxradio-checkbox-label").attr("isWhite") != '1') {
                getPowerUse(3, $("#commentSelectMerge").find(".selectpicker").val());
            }
            $('#mergeSearch').removeAttr('disabled'); //防止检索暴力点击
            if (data.code === '200') {
                var result = data.data;
                $('#sortByTimeWrapper' + itemCache).find('.image-card-wrap').remove(); // 清空按时间检索图片容器中的所有图片
                sortTimeList = result.list;
                $("#image-merge-list-" + itemCache).data("sortTimeListDynamic", sortTimeList);
                // 返回图片列表为空
                if (sortTimeList.length === 0 || result.total === '0') {
                    hideLoading($cardContent);
                    loadEmpty($cardContent);
                    return;
                }
                // // 根据返回值 vertices 构造 人脸位置facePosition
                // for (var i = 0; i < sortTimeList.length; i++) {
                //     sortTimeList[i].facePosition = getFacePositionData(sortTimeList[i]);
                // }
                // 动态抓拍库生成节点
                if (dynamicData.base64Img.length === 0) {
                    creatSnappingItem(sortTimeList, result.total, itemCache, $('#sortByTimeWrapper' + itemCache), 'paginationTimeWrap' + itemCache, 'paginationTime' + itemCache, true);
                } else {
                    creatSnappingItem(sortTimeList, result.total, itemCache, $('#sortByTimeWrapper' + itemCache), 'paginationTimeWrap' + itemCache, 'paginationTime' + itemCache);
                }
                $('#sortByTimeWrapper' + itemCache).attr("sortByTimeTotal", result.total);
                // 初始化 所有被选中的图片
                var allSelectedCardList = $("#image-merge-list-" + itemCache).data('trakData') && $("#image-merge-list-" + itemCache).data('trakData').length > 0 ? $("#image-merge-list-" + itemCache).data('trakData') : [];
                allSelectedCardList.forEach(function (item) {
                    sortTimeList.forEach(function (v, n) {
                        if (v.picId === item.picId) {
                            $('#sortByTimeWrapper' + itemCache).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                        }
                    })
                });
                // 判断是否需要全选
                judgeSelectePageAll($('#sortByTimeWrapper' + itemCache));
                //分页
                var $paginationTime = $('#paginationTime' + itemCache);
                if (result.totalPage !== '0' && result.totalPage !== '1') {
                    var eventCallBack = function (currPage, pageSize) {
                        pageLoad();

                        function pageLoad(rcount) {
                            var changePort = 'v2/faceDt/peopleSearch',
                                changePote = {
                                    dynamicId: dynamicData.selectImgId, // 图片
                                    threshold: option.threshold, // 阈值
                                    startTime: option.startTime, // 开始时间
                                    endTime: option.endTime, // 结束时间
                                    idcard: dynamicData.idcard,
                                    cameraIds: dynamicData.videos, // 摄像头id
                                    orgIds: dynamicData.videoGroups, // 机构id
                                    type: dynamicData.type,
                                    nodeType: dynamicData.nodeType,
                                    incidentId: $("#headingTwo").find(".ui-checkboxradio-checkbox-label").attr("isWhite") == '1' ? '' : $("#commentSelectMerge").find(".selectpicker").val(),
                                    page: currPage, // 当前页
                                    size: Number(pageSize), // 每一页个数
                                    sort: 2
                                }
                            successFn = function (data) {
                                hideLoading($cardContent);
                                if (data.code === '200') {
                                    $('#sortByTimeWrapper' + itemCache).find('.image-card-wrap').remove(); // 清空按时间排序容器
                                    sortTimeList = data.data.list;
                                    $("#image-merge-list-" + itemCache).data("sortTimeListDynamic", sortTimeList);
                                    // // 根据返回值 vertices 构造 人脸位置facePosition
                                    // for (var i = 0; i < sortTimeList.length; i++) {
                                    //     sortTimeList[i].facePosition = getFacePositionData(sortTimeList[i]);
                                    // }
                                    if (dynamicData.base64Img.length === 0) {
                                        creatSnappingItem(sortTimeList, data.data.total, itemCache, $('#sortByTimeWrapper' + itemCache), 'paginationTimeWrap' + itemCache, 'paginationTime' + itemCache, true);
                                    } else {
                                        creatSnappingItem(sortTimeList, data.data.total, itemCache, $('#sortByTimeWrapper' + itemCache), 'paginationTimeWrap' + itemCache, 'paginationTime' + itemCache);
                                    }
                                    $('#sortByTimeWrapper' + itemCache).attr("sortByTimeTotal", data.data.total);
                                    var allSelectedCardList = $("#image-merge-list-" + itemCache).data('trakData') && $("#image-merge-list-" + itemCache).data('trakData').length > 0 ? $("#image-merge-list-" + itemCache).data('trakData') : [];
                                    allSelectedCardList.forEach(function (item) {
                                        sortTimeList.forEach(function (v, n) {
                                            if (v.picId === item.picId) {
                                                $('#sortByTimeWrapper' + itemCache).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                            }
                                        })
                                    });
                                    hideLoading($cardContent);
                                    removeLoadEmpty($cardContent);
                                    var maskID = $('.image-card-list.no-bottom-border').children().not('.display-none').attr('id'); // 当前被选中的动态检索类型的容器
                                    $('.mask-container-fixed.' + maskID).remove(); // 删除大图
                                    judgeSelectePageAll($('#sortByTimeWrapper' + itemCache));
                                    // 添加节点数据
                                    addDataByDymPic('#sortByTimeWrapper' + itemCache, sortTimeList);
                                } else if (data.code === '616') {
                                    // 给图片绑定静态id
                                    var sxrCount = rcount ? rcount : 1;
                                    if (rcount < 4) {
                                        var picBase64 = dynamicData.base64Img;

                                        if (picBase64.indexOf("http") == 0) { //url
                                            var picIdPortData = {
                                                url: picBase64,
                                                staticId: dynamicData.selectImgId,
                                                moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                                                opType: dynamicData.selectImgOpType,
                                                searchComments: dynamicData.selectImgSearchComments
                                            };
                                        } else { //base64
                                            var picIdPortData = {
                                                base64: picBase64,
                                                staticId: dynamicData.selectImgId,
                                                moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                                                opType: dynamicData.selectImgOpType,
                                                searchComments: dynamicData.selectImgSearchComments
                                            };
                                        }
                                        var picIdPort = 'v2/faceRecog/uploadImage',
                                            picIdSuccessFunc = function (data) {
                                                if (data.code == '200') {
                                                    $("#usearchImg").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                                        if ($(ele).find(".add-image-img").attr('picId') == dynamicData.selectImgId) {
                                                            // 给当前选中的图片绑定id
                                                            $(ele).find('.add-image-img').attr('picId', data.staticId);
                                                            $(ele).find('.add-image-img').attr('picStatus', '1');
                                                        }
                                                    })
                                                    dynamicData.selectImgId = data.staticId;
                                                    // 重新请求 数据相似度排序
                                                    sxrCount += sxrCount;
                                                    pageLoad(sxrCount);
                                                } else {
                                                    warningTip.say(data.message);
                                                    $("#usearchImg").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                                        if ($(ele).find(".add-image-img").attr('picId') == dynamicData.selectImgId) {
                                                            $(ele).find('.add-image-img').attr('picStatus', '0');
                                                        }
                                                    });
                                                }
                                            };
                                        loadData(picIdPort, false, picIdPortData, picIdSuccessFunc);
                                    } else {
                                        warningTip.say("图片已失效，请重新上传图片");
                                    }
                                }
                            };
                            showLoading($cardContent);
                            loadData(changePort, true, changePote, successFn);
                        }
                    }
                    var pageSizeOpt = [{
                        value: 40,
                        text: '40/页',
                        selected: true
                    }, {
                        value: 80,
                        text: '80/页',
                    }];
                    setPageParams($paginationTime, result.total, result.totalPage, eventCallBack, true, pageSizeOpt);
                    $('#paginationTime' + itemCache).closest('.pagination-wrap').removeClass('display-none').find('.pagination-result-number').text(result.total);
                } else {
                    $paginationTime.closest('.pagination-wrap').remove();
                }
                hideLoading($cardContent);
                removeLoadEmpty($cardContent);
                // 添加节点数据
                addDataByDymPic('#sortByTimeWrapper' + itemCache, sortTimeList);
                $('#collapseDynamic').find('.card-tip').removeClass('hide');
            } else {
                hideLoading($cardContent);
                loadEmpty($cardContent);
                // 如果图片id失效  重新获取图片id 再次发起检索请求
                if (data.code === '616') {
                    // 给图片绑定静态id
                    var sxCount = count ? count : 1;
                    if (sxCount < 4) {
                        var picBase64 = dynamicData.base64Img;

                        if (picBase64.indexOf("http") == 0) { //url
                            var picIdPortData = {
                                url: picBase64,
                                staticId: dynamicData.selectImgId,
                                moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                                opType: dynamicData.selectImgOpType,
                                searchComments: dynamicData.selectImgSearchComments
                            };
                        } else { //base64
                            var picIdPortData = {
                                base64: picBase64,
                                staticId: dynamicData.selectImgId,
                                moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                                opType: dynamicData.selectImgOpType,
                                searchComments: dynamicData.selectImgSearchComments
                            };
                        }
                        var picIdPort = 'v2/faceRecog/uploadImage',
                            picIdSuccessFunc = function (data) {
                                if (data.code == '200') {
                                    $("#usearchImg").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                        if ($(ele).find(".add-image-img").attr('picId') == dynamicData.selectImgId) {
                                            // 给当前选中的图片绑定id
                                            $(ele).find('.add-image-img').attr('picId', data.staticId);
                                            $(ele).find('.add-image-img').attr('picStatus', '1');
                                        }
                                    })
                                    dynamicData.selectImgId = data.staticId;
                                    // 重新请求 数据相似度排序
                                    sxCount += sxCount;
                                    searchTimeSortData(dynamicData, itemCache, sxCount);
                                } else {
                                    warningTip.say(data.message);
                                    $("#usearchImg").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                        if ($(ele).find(".add-image-img").attr('picId') == dynamicData.selectImgId) {
                                            $(ele).find('.add-image-img').attr('picStatus', '0');
                                        }
                                    });
                                }
                            };
                        loadData(picIdPort, false, picIdPortData, picIdSuccessFunc);
                    } else {
                        warningTip.say("图片已失效，请重新上传图片");
                    }
                } else {
                    warningTip.say(data.message);
                }
                $('#collapseDynamic').find('.card-tip').addClass('hide');
            }
        };
    loadData(port, true, option, successFunc);
    if (!dynamicData.base64Img) {
        $('#selectAllSnapping .ui-checkboxradio-label').addClass('text-disabled');
    }
    showLoading($cardContent);
}

/**
 * 动态抓拍库生成节点 相似度排序 和 时间排序
 * @param {Array} list 抓拍库请求成功后返回数据 
 */
function creatSnappingItem(list, total, itemCache, $ele, paginationWrapId, paginationId, delLabel) {
    // 判断是时间排序还是相似度排序
    if ($ele.attr('id') === 'search-info' + itemCache) {
        $('#sortTotal').text("(" + total + ")");
    } else {
        $('#sortByTimeTotal').text("(" + total + ")");
    }
    for (var i = 0; i < list.length; i++) {
        var html = '',
            // position = '',
            // // facePosition虽不是返回值 已通过方法构造
            // position = JSON.stringify(list[i].facePosition),
            score = Number(list[i].similarity.split('%')[0]),
            danger = score >= 90 ? 'text-danger' : '';
        // var isDisplay = score === 0 ? 'hide' : '';
        var isDisplay = score < 0 ? 'hide' : '';
        html = `<li class="image-card-wrap type-5 onecj" cameraId="${list[i].cameraId}" px="${list[i].px}" py="${list[i].py}">
                        <div class="image-card-box img-right-event">
                            <div class="image-checkbox-wrap">
                                <label class="ui-checkboxradio-checkbox-label ui-checkboxradio-label ui-button ui-widget">
                                    <span class="ui-checkboxradio-icon  ui-icon ui-icon-background ui-icon-blank"></span>
                                </label>
                            </div>
                            <img class="image-card-img" guid="${list[i].picId}" src="${list[i].smallPicUrl}" position="position" alt="">
                        </div>
                        <div class="image-card-message-box">
                            <p class="image-card-message-position ${danger} ${isDisplay}">${list[i].similarity}</p>
                            <p class="image-card-message-time">${list[i].timePeriods}</p>
                        </div>
                        <div class="image-card-info hide">
                            <ul class="aui-mt-md">
                                <li class="border-bottom mask-info-top">
                                    <ul class="aui-row form-info form-label-fixed form-label-long aui-mt-xs">
                                        <li class="aui-col-24">
                                            <div class="form-group">    
                                                <label class="aui-form-label">机构：</label>
                                                <div class="form-text">${list[i].orgName ? list[i].orgName : '暂无'}</div>
                                            </div>
                                        </li>
                                        <li class="aui-col-24 hide">
                                            <div class="form-group">
                                                <label class="aui-form-label">编码：</label>
                                                <div class="form-text">${list[i].gbCode ? list[i].gbCode : '暂无'}</div>
                                            </div>
                                        </li>
                                        <li class="aui-col-24">
                                            <div class="form-group">
                                                <label class="aui-form-label">名称：</label>
                                                <div class="form-text" title="${list[i].cameraName ? list[i].cameraName : '暂无'}">${list[i].cameraName ? list[i].cameraName : '暂无'}</div>
                                            </div>
                                        </li>
                                        <li class="aui-col-24">
                                            <div class="form-group">
                                                <label class="aui-form-label">时间：</label>
                                                <div class="form-text">${list[i].captureTime ? list[i].captureTime : '暂无'}</div>
                                            </div>
                                        </li>
                                    </ul>    
                                </li>
                            </ul>
                        </div>
                    </li>`;
        if ($ele.find('.pagination-wrap').length == 0) {
            var paginationHtml = `<div class="pagination-wrap display-none" id="${paginationWrapId}">
                                    <ul class="pagination" id="${paginationId}"></ul>
                                </div>`
            $ele.append(paginationHtml);
        }
        $ele.find('.pagination-wrap').before(html);
        if (delLabel) {
            $ele.find('.pagination-wrap').prev().find('.image-card-inner').remove();
            $ele.find('.pagination-wrap').prev().find('.image-checkbox-wrap').remove();
            $ele.find('.image-card-message-box .image-card-message-position').remove();
        }
    }
    if ($("#showListSearch").hasClass("btn-primary")) {
        $("#showListSearch").click();
    } else {
        $("#showCardSearch").click();
    }
}

/** 聚合请求数据
 * @param {Object} dynamicData 左侧动态检索条件
 * @param {string} itemCache 检索图片序号
 * @param {number} typeCache 1是时间聚合2是地点聚合
 */
function togetherSearch(dynamicData, itemCache, typeCache) {
    var _dynamicId = dynamicData.selectImgId,
        port = 'v2/faceDt/mergeSearch',
        option = {
            dynamicId: _dynamicId, // 图片
            threshold: dynamicData.threshold, // 阈值
            startTime: dynamicData.startTime, // 开始时间
            endTime: dynamicData.endTime, // 结束时间
            idcard: dynamicData.idcard,
            cameraIds: dynamicData.videos, // 摄像头id
            orgIds: dynamicData.videoGroups, // 机构id
            type: dynamicData.type, //镜头类点
            nodeType: dynamicData.nodeType,
            incidentId: $("#headingTwo").find(".ui-checkboxradio-checkbox-label").attr("isWhite") == '1' ? '' : $("#commentSelectMerge").find(".selectpicker").val(),
            page: dynamicData.page, // 当前页
            size: dynamicData.number, // 每一页个数
            randomNum: Math.random() //防止ajaxFilter加的一个随机数
        },
        $wrapT = $('#timeTogetherWrapper' + itemCache), // 按时间聚合
        $wrapP = $('#positionTogetherWrapper' + itemCache), // 按地点聚合
        timeAndPositionMergeSuccessFunc = function (data) {
            if ($("#headingTwo").find(".ui-checkboxradio-checkbox-label").attr("isWhite") != '1') {
                getPowerUse(3, $("#commentSelectMerge").find(".selectpicker").val());
            }
            if (data.code === '200') {
                hideLoading($wrapT);
                hideLoading($wrapP);
                // 按时间聚合
                var resultT = data.timeGroup;
                timeTogetherList = data.timeGroup;
                $("#image-merge-list-" + itemCache).data('timeTogetherListDynamic', timeTogetherList);
                var allSelectedCardList = $("#image-merge-list-" + itemCache).data('trakData') && $("#image-merge-list-" + itemCache).data('trakData').length > 0 ? $("#image-merge-list-" + itemCache).data('trakData') : [];
                if (resultT.length === 0) {
                    loadEmpty($wrapT);
                } else {
                    $('#timeTogetherWrapper' + itemCache).html('');
                    // 按时间聚合 生成页面
                    createTogetherList($wrapT, resultT, 1, $('#timeTogetherWrapper' + itemCache), itemCache, dynamicData);
                    togetherShowMore();

                    timeTogetherList.forEach(function (el, index) {
                        allSelectedCardList.forEach(function (item) {
                            el.list.forEach(function (v, n) {
                                if (v.picId === item.picId) {
                                    $('#timeTogetherWrapper' + itemCache).find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                }
                            })
                        })
                    });
                    judgeSelectePageAll($('#timeTogetherWrapper' + itemCache));
                    $('#timeTogetherWrapper' + itemCache).find('.image-card-list').each(function (index, el) {
                        judgeSelecteAll($(el));
                    });
                }
                // 抓拍图节点数据添加
                addDataByDymPic('#timeTogetherWrapper' + itemCache, timeTogetherList, true);

                // 按地点聚合
                var resultP = data.orgGroup;
                positionTogetherList = data.orgGroup;
                $("#image-merge-list-" + itemCache).data('positionTogetherListDynamic', positionTogetherList);
                if (resultP.length === 0) {
                    loadEmpty($wrapP);
                } else {
                    var newdata = [];
                    $('#positionTogetherWrapper' + itemCache).html('');
                    // 按地点聚合 生成页面
                    createTogetherList($wrapP, resultP, 2, $('#positionTogetherWrapper' + itemCache), itemCache, dynamicData);
                    togetherShowMore();

                    positionTogetherList.forEach(function (el, index) {
                        allSelectedCardList.forEach(function (item) {
                            el.list.forEach(function (v, n) {
                                if (v.picId === item.picId) {
                                    $('#positionTogetherWrapper' + itemCache).find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                }
                            })
                        })
                    });
                    judgeSelectePageAll($('#positionTogetherWrapper' + itemCache));
                    $('#positionTogetherWrapper' + itemCache).find('.image-card-list').each(function (index, el) {
                        judgeSelecteAll($(el));
                    });

                    if (data.groupInfo.fjGroup && data.groupInfo.fjGroup.length > 0) {
                        data.groupInfo.fjGroup.forEach(function (item) {
                            newdata.push({
                                'count': item.count,
                                'DM': item.orgCode
                            })
                        });
                    }
                    if (data.groupInfo.pcsGroup && data.groupInfo.pcsGroup.length > 0) {
                        data.groupInfo.pcsGroup.forEach(function (item) {
                            newdata.push({
                                'count': item.count,
                                'DM': item.orgCode
                            })
                        });
                    }
                    var targetOrigin = mapUrl + 'peopleCity.html',
                        data = {
                            type: "cluster",
                            mydata: newdata
                        },
                        iframe = document.getElementById('search_map_iframe');
                    iframe.contentWindow.postMessage(data, targetOrigin);
                }
                // 抓拍图节点数据添加
                addDataByDymPic('#positionTogetherWrapper' + itemCache, positionTogetherList, true);
            } else {
                // 按时间聚合
                hideLoading($wrapT);
                loadEmpty($wrapT);
                // 按地点聚合
                hideLoading($wrapP);
                loadEmpty($wrapP);

                // 如果图片id失效  重新获取图片id 再次发起检索请求
                if (data.code === '616') {
                    // 给图片绑定静态id
                    var picBase64 = dynamicData.base64Img;
                    if (picBase64.indexOf("http") == 0) { //url
                        var picIdPortData = {
                            url: picBase64,
                            staticId: dynamicData.selectImgId,
                            moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                            opType: dynamicData.selectImgOpType,
                            searchComments: dynamicData.selectImgSearchComments
                        };
                    } else { //base64
                        var picIdPortData = {
                            base64: picBase64,
                            staticId: dynamicData.selectImgId,
                            moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                            opType: dynamicData.selectImgOpType,
                            searchComments: dynamicData.selectImgSearchComments
                        };
                    }

                    var picIdPort = 'v2/faceRecog/uploadImage',
                        picIdSuccessFunc = function (data) {
                            if (data.code == '200') {
                                dynamicData.selectImgId = data.staticId;
                                $("#usearchImg").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                    if ($(ele).find(".add-image-img").attr('picId') == dynamicData.selectImgId) {
                                        // 给当前选中的图片绑定id
                                        $(ele).find('.add-image-img').attr('picId', data.staticId);
                                        $(ele).find('.add-image-img').attr('picStatus', '1');
                                    }
                                })
                                // 重新请求 数据相似度排序
                                togetherSearch(dynamicData, itemCache, typeCache);
                            } else {
                                warningTip.say(data.message);
                                $("#usearchImg").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                    if ($(ele).find(".add-image-img").attr('picId') == dynamicData.selectImgId) {
                                        $(ele).find('.add-image-img').attr('picStatus', '0');
                                    }
                                });
                            }
                        };
                    loadData(picIdPort, false, picIdPortData, picIdSuccessFunc);
                }
            }
            if (!dynamicData.isAll) {
                $('#search-info' + itemCache).empty();
                $('#sortByTimeWrapper' + itemCache).empty();

                $("#image-merge-list-" + itemCache).removeData("sortListDynamic");
                $("#image-merge-list-" + itemCache).removeData("sortTimeListDynamic");
                if (typeCache == 1) {
                    $('#positionTogetherWrapper' + itemCache).empty();
                    $("#image-merge-list-" + itemCache).removeData("positionTogetherListDynamic");
                } else if (typeCache == 2) {
                    $('#timeTogetherWrapper' + itemCache).empty();
                    $("#image-merge-list-" + itemCache).removeData("timeTogetherListDynamic");
                }
            }
        };
    showLoading($wrapT); // 按时间聚合
    showLoading($wrapP); // 按地点聚合
    loadData(port, true, option, timeAndPositionMergeSuccessFunc);
}

/** 
 * 聚合内容生成节点 构造图片节点和翻页节点
 * @param {Object} el 聚合容器
 * @param {Array} data 聚合返回的数组
 * @param {Number} mType 聚合类型 1.时间聚合 2.地点聚合
 * @param {Object} $dom 聚合存放总数 $dom
 * @param {string} itemCache 缓存序号
 */
function createTogetherList(el, data, mType, $dom, itemCache) {
    var html = '',
        max = 32,
        rowNum = 0,
        totalNum = 0;
    if ($("#showListSearch").hasClass("btn-primary")) {
        rowNum = 4;
    } else {
        rowNum = 8;
    }
    // 拼接复选框id
    if (mType === 1) {
        type = 'timeTogether';
    }
    if (mType === 2) {
        type = 'positionTogether';
    }
    // 各组数据
    for (var i = 0; i < data.length; i++) {
        var imageCard = '',
            len = data[i].list.length, // 每组聚合的长度
            cardList = data[i].list; // 每组聚合的数据
        pagination = '';
        totalNum += data[i].total; // 每组聚合的总数
        if (data[i].total > max) {
            pagination = `<div class="pagination-wrap display-none ${type}">
                <ul class="pagination" id="${type}Pagination${i}-${itemCache}"></ul>
            </div>`;
        }
        // 每组数据 构建单独的每一个图片
        for (var j = 0; j < len; j++) {
            // var facePosition = getFacePositionData(cardList[j]),
            //     position = JSON.stringify(facePosition);
            var score = Number(cardList[j].similarity.split('%')[0]),
                danger = score >= 90 ? 'text-danger' : '',
                isDisplay = score === 0 ? 'hide' : '';
            imageCard += `<li class="image-card-wrap type-5" cameraid="${cardList[j].cameraId}" px="${cardList[j].px}" py="${cardList[j].py}">
                <div class="image-card-box img-right-event">
                    <div class="image-checkbox-wrap">
                        <label class="ui-checkboxradio-checkbox-label ui-checkboxradio-label ui-button ui-widget">
                            <span class="ui-checkboxradio-icon  ui-icon ui-icon-background ui-icon-blank"></span>
                        </label>
                    </div>
                    <img class="image-card-img" src="${cardList[j].smallPicUrl}" guid="${cardList[j].picId}" position="position" alt=""></img>

                </div>
                <div class="image-card-message-box">
                    <p class="image-card-message-position ${danger} ${isDisplay}" title="${cardList[j].cameraName}">${cardList[j].similarity}</p>
                    <p class="image-card-message-time" title="${cardList[j].timePeriods}">${cardList[j].timePeriods}</p>
                </div>
                <div class="image-card-info hide">
                    <ul class="aui-mt-md">
                        <li class="border-bottom mask-info-top">
                            <ul class="aui-row form-info form-label-fixed form-label-long aui-mt-xs">
                                <li class="aui-col-24">
                                    <div class="form-group">    
                                        <label class="aui-form-label">机构：</label>
                                        <div class="form-text">${cardList[j].orgName ? cardList[j].orgName : '暂无'}</div>
                                    </div>
                                </li>
                                <li class="aui-col-24 hide">
                                    <div class="form-group">
                                        <label class="aui-form-label">编码：</label>
                                        <div class="form-text" title="${cardList[j].gbCode ? cardList[j].gbCode : '暂无'}">${cardList[j].gbCode ? cardList[j].gbCode : '暂无'}</div>
                                    </div>
                                </li>
                                <li class="aui-col-24">
                                    <div class="form-group">
                                        <label class="aui-form-label">名称：</label>
                                        <div class="form-text">${cardList[j].cameraName ? cardList[j].cameraName : '暂无'}</div>
                                    </div>
                                </li>
                                <li class="aui-col-24">
                                    <div class="form-group">
                                        <label class="aui-form-label">时间：</label>
                                        <div class="form-text">${cardList[j].captureTime ? cardList[j].captureTime : '暂无'}</div>
                                    </div>
                                </li>
                            </ul>    
                        </li>
                    </ul>
                </div>
            </li> `;
        }
        // 查看更多
        var more = '<button class="btn btn-link" type="button">查看更多</button>',
            moreHtml = data[i].total > rowNum ? more : '';
        // 每组聚合数据 都有分页
        html += `<li class="image-card-list showMore loadSpread" guid="${data[i].mergeId}"  mergeId="${data[i].mergeId}">
                    <div class="image-card-list-title">
                        <div class="image-checkbox-wrap">
                            <label class="ui-checkboxradio-checkbox-label ui-checkboxradio-label ui-button ui-widget">
                                <span class="ui-checkboxradio-icon ui-icon ui-icon-background ui-icon-blank"></span>
                            </label>
                        </div>
						<span class="title-text">${data[i].title}</span>
						<span class="title-number">${data[i].total}</span>
						${moreHtml}
					</div>
                    <ul class="image-card-list-wrap" id="${type}Img-${i}-${itemCache}">${imageCard}</ul>
                    ${pagination}					
                </li>`;
    }
    // 按时间聚合 动态库总数赋值
    if (type === 'timeTogether') {
        $('#timeTogetherTotal').text("(" + totalNum + ")");
        $dom.attr("timeTogether", totalNum);
    } else if (type === 'positionTogether') { // 按地点聚合 动态库总数赋值
        $('#positionTogetherTotal').text("(" + totalNum + ")");
        $dom.attr("positionTogether", totalNum);
    }
    // 没有聚合数据 直接返回
    if (html.length === 0) {
        hideLoading($(el));
        loadEmpty($(el));
        return;
    }
    $(el).html(html); // 给聚合容器赋值
    // 根据不同的聚合类型 给每一组聚合数据分页
    $(`.pagination-wrap.${type}`).find('.pagination').each(function (index, ele) {
        var $ele = $(ele), // 当前分组聚合的翻页元素
            id = $ele.attr('id'), // 当前分组聚合的分页元素id
            index = $ele.closest('.image-card-list').index(), // 当前分组聚合的索引
            obj = {
                id: id,
                index: index,
                mType: mType
            };
        // 按时间聚合 本组聚合的总数据 总页数
        if (type === 'timeTogether') {
            obj.total = timeTogetherList[index].total;
            obj.totalPage = timeTogetherList[index].totalPage;
        } else if (type === 'positionTogether') { // 按地点聚合 本组聚合的总数据 总页数
            obj.total = positionTogetherList[index].total;
            obj.totalPage = positionTogetherList[index].totalPage;
        }
        timeTogetherCardPageSearch(obj, itemCache);
    });

    if ($("#showListSearch").hasClass("btn-primary")) {
        $("#showListSearch").click();
    } else {
        $("#showCardSearch").click();
    }
}

/**
 * 时间 + 地点 聚合卡片超过两行后 获取分页信息
 * @param {Object} obj 时间 + 地点聚合类型 分页数据
 * @param {string} itemCache 缓存序号
 */
function timeTogetherCardPageSearch(obj, itemCache) {
    var id = obj.id, // 当前分组聚合的分页元素id
        pType = obj.mType, // 聚合类型 1.时间聚合 2.地点聚合
        $pagination = $(`#${id}`), // 当前分组聚合的分页元素 格式类似positionTogetherPagination1
        $cardList = $pagination.closest('.image-card-list'), // 当前分组聚合的元素 包含标题和分页元素
        $newElement = $cardList.find('.image-card-list-wrap'); // 聚合分组 当前组的图片容器 包含所有图片的容器
    var eventCallBack = function (currPage, pageSize) {
        var changePort = 'v2/faceDt/mergePageSearch',
            mergeId = $(`#${id}`).closest('.image-card-list').attr('mergeId'), // 每组聚合数据的聚合id
            dynamicId = $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'),
            changePote = {
                dynamicId: dynamicId || '',
                mergeId: mergeId,
                page: currPage + '',
                size: pageSize + ''
            },
            successFn = function (pData) {
                if (pData.code === '200') {
                    hideLoading($newElement);
                    // // 返回值中不含facePosition 构造facePosition
                    // for (var i = 0; i < pData.data.length; i++) {
                    //     getFacePositionData(pData.data[i]);
                    // }
                    var index = $cardList.index(),
                        newList = pData.data;
                    // 去掉选中状态
                    $cardList.find('.image-card-wrap.active').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
                    // 构造分页图片元素
                    sortImgCardBox(newList, $newElement);
                    var allSelectedCardList = $("#image-merge-list-" + itemCache).data('trakData') && $("#image-merge-list-" + itemCache).data('trakData').length > 0 ? $("#image-merge-list-" + itemCache).data('trakData') : [];
                    // 按时间聚合 初始化所有被选中的图片
                    if (pType === 1) {
                        timeTogetherList[index].list = newList;
                        $("#image-merge-list-" + itemCache).data('timeTogetherList', timeTogetherList);
                        // 初始化 所有被选中的图片
                        allSelectedCardList.forEach(function (item) {
                            timeTogetherList[index].list.forEach(function (v, n) {
                                if (v.picId === item.picId) {
                                    $('#timeTogetherWrapper' + itemCache).find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                }
                            })
                        });
                    } else if (pType === 2) { // 按地点聚合 初始化所有被选中的图片
                        positionTogetherList[index].list = newList;
                        $("#image-merge-list-" + itemCache).data('positionTogetherList', positionTogetherList);
                        // 初始化 所有被选中的图片
                        allSelectedCardList.forEach(function (item) {
                            positionTogetherList[index].list.forEach(function (v, n) {
                                if (v.picId === item.picId) {
                                    $('#positionTogetherWrapper' + itemCache).find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                }
                            })
                        });
                    }
                    // 按时间聚合 抓拍图节点数据添加
                    if (selectType === 3) {
                        // 中图
                        addDataByDymPic('#timeTogetherWrapper' + itemCache, timeTogetherList, true);
                        // 判断功能区的全选是否需要选中
                        judgeSelectePageAll($('#timeTogetherWrapper' + itemCache));
                        // 聚合 每组标题的全选是否需要选中
                        $('#timeTogetherWrapper' + itemCache).find('.image-card-list').each(function (index, el) {
                            judgeSelecteAll($(el));
                        });
                    } else if (selectType === 4) {
                        // 中图
                        addDataByDymPic('#positionTogetherWrapper' + itemCache, positionTogetherList, true);
                        // 判断功能区的全选是否需要选中
                        judgeSelectePageAll($('#positionTogetherWrapper' + itemCache));
                        // 聚合 每组标题的全选是否需要选中
                        $('#positionTogetherWrapper' + itemCache).find('.image-card-list').each(function (index, el) {
                            judgeSelecteAll($(el));
                        });
                    }
                    // 删除聚合大图
                    var maskID = $('.image-card-list.no-bottom-border').children().not('.display-none').attr('id');
                    if (maskID === 'timeTogetherWrapper' + itemCache || maskID === 'positionTogetherWrapper' + itemCache) {
                        var $maskShowMore = $(`#${id}`).closest('.loadSpread'),
                            $maskImg = $maskShowMore.find('.image-card-list-wrap'),
                            maskImgId = $maskImg.attr('id');
                        maskID = maskImgId
                    }
                    $('.mask-container-fixed.' + maskID).remove();
                }
            };
        showLoading($newElement);
        loadData(changePort, true, changePote, successFn);
    };
    var pageSizeOpt = [{
        value: 40,
        text: '40/页',
        selected: true
    }, {
        value: 80,
        text: '80/页',
    }];
    setPageParams($pagination, obj.total, obj.totalPage, eventCallBack, true, pageSizeOpt);
}

/**
 * 动态库 聚合分页 页面内容刷新
 * @param {Array} data 聚合分组 当前组的分页数据
 * @param {*} $element 聚合分组 当前组的图片容器 包含所有图片的容器
 */
function sortImgCardBox(data, $element) {
    var imageCard = '';
    for (var i = 0; i < data.length; i++) {
        var position = JSON.stringify(data[i].facePosition),
            score = Number(data[i].similarity.split('%')[0]),
            danger = score >= 90 ? 'text-danger' : '';
        imageCard += `<li class="image-card-wrap type-5">
            <div class="image-card-box img-right-event">
                <div class="image-checkbox-wrap">
                    <label class="ui-checkboxradio-checkbox-label ui-checkboxradio-label ui-button ui-widget">
                        <span class="ui-checkboxradio-icon  ui-icon ui-icon-background ui-icon-blank"></span>
                    </label>
                </div>
                <img class="image-card-img" src="${data[i].smallPicUrl}" guid="${data[i].picId}" position=${position} alt=""></img>
            </div>
            <div class="image-card-message-box">
                <p class="image-card-message-position ${danger}" title="${data[i].cameraName}">${data[i].similarity}</p>
                <p class="image-card-message-time" title="${data[i].timePeriods}">${data[i].timePeriods}</p>
            </div>
            <div class="image-card-info hide">
                <ul class="aui-mt-md">
                    <li class="border-bottom mask-info-top">
                        <ul class="aui-row form-info form-label-fixed form-label-long aui-mt-xs">
                            <li class="aui-col-24">
                                <div class="form-group">    
                                    <label class="aui-form-label">机构：</label>
                                    <div class="form-text">${data[i].orgName ? data[i].orgName : '暂无'}</div>
                                </div>
                            </li>
                            <li class="aui-col-24 hide">
                                <div class="form-group">
                                    <label class="aui-form-label">编码：</label>
                                    <div class="form-text">${data[i].gbCode ? data[i].gbCode : '暂无'}</div>
                                </div>
                            </li>
                            <li class="aui-col-24">
                                <div class="form-group">
                                    <label class="aui-form-label">名称：</label>
                                    <div class="form-text" title="${data[i].cameraName ? data[i].cameraName : '暂无'}">${data[i].cameraName ? data[i].cameraName : '暂无'}</div>
                                </div>
                            </li>
                            <li class="aui-col-24">
                                <div class="form-group">
                                    <label class="aui-form-label">时间：</label>
                                    <div class="form-text">${data[i].captureTime ? data[i].captureTime : '暂无'}</div>
                                </div>
                            </li>
                        </ul>    
                    </li>
                </ul>
            </div>
        </li> `;
    }
    $element.find('.image-card-wrap').remove();
    $element.append(imageCard);

    if ($("#showListSearch").hasClass("btn-primary")) {
        $("#showListSearch").click();
    } else {
        $("#showCardSearch").click();
    }
}

// /** 暂时未发现此部分的作用，大图的人脸图已写独立方法
//  * 动态轨迹检索 根据返回值 vertices 构造 人脸位置facePosition
//  * @param {Object} data 每个图片的详细值
//  */
// function getFacePositionData(data) {
//     var startPosition = [],
//         endPosition = [],
//         widthLen = '',
//         heightLen = '',
//         facePosition = {};
//     if(data.vertices.length > 0){
//         if ((+data.vertices[0].x) > (+data.vertices[1].x)) {
//             startPosition = data.vertices[1];
//             endPosition = data.vertices[0];
//         } else {
//             startPosition = data.vertices[0];
//             endPosition = data.vertices[1];
//         }
//         widthLen = Math.abs((+data.vertices[0].x) - (+data.vertices[1].x));
//         heightLen = Math.abs((+data.vertices[0].y) - (+data.vertices[1].y));
//         facePosition = {
//             start: startPosition,
//             end: endPosition,
//             width: widthLen,
//             height: heightLen
//         }
//     }
//     return facePosition
// }

/**
 * 动态库图片绑定详细数据 构造所有获取中图的数组 用于添加中图
 * @param {Object} selector 各动态检索类型容器
 * @param {Array} list 图片列表数据
 * @param {Boolean} together 是否为聚合
 */
function addDataByDymPic(selector, list, together) {
    if (together) { // 如果为聚合
        $(selector).children('.image-card-list').each(function (index, element) { // 每一个分组
            $(element).find('.image-card-wrap').each(function (idx, el) { // 分组中的每一个图片
                var elData = $(el).data('listData'); // 图片绑定的动态检索详细数据
                if (!elData || (elData && !elData.base64Img)) { // 没有绑定中图
                    $(el).data('listData', list[index].list[idx]); // 给每一个图片绑定listData 动态搜索返回的图片具体值 用于获取大图
                    var isGetedMidPic = false; // 获取中图标志
                    // 循环所有获取的中图
                    if (allMidPicList && allMidPicList.length) {
                        $.each(allMidPicList, function (itemIndex, itemVal) {
                            if (itemVal.picId === list[index].list[idx].picId) {
                                isGetedMidPic = true
                            }
                        })
                    }
                    if (!isGetedMidPic) {
                        allMidPicList.push({
                            picId: list[index].list[idx].picId
                        }) // 数据不在获取的中图数组中 则加入
                    }
                }
            });
        });
    } else { // 如果为非聚合动态检索
        $(selector).find('.image-card-wrap').each(function (index, element) {
            $(element).data('listData', list[index]); // 图片绑定的动态检索详细数据 用于获取大图
            var isGetedMidPicFlag = false;
            if (allMidPicList && allMidPicList.length) {
                $.each(allMidPicList, function (itemIndex, itemVal) {
                    if (itemVal.picId === list[index].picId) {
                        isGetedMidPicFlag = true
                    }
                })
            }
            if (!isGetedMidPicFlag) {
                allMidPicList.push({
                    picId: list[index].picId
                }) // 数据不在获取的中图数组中 则加入
            }
        });
    }
}

/**
 * 动态检索 判断功能区的全选是否需要选中
 * @param {Object} $el 各动态检索类型容器
 */
function judgeSelectePageAll($el) {
    var cardLen = $el.find('.image-card-wrap').length, // 动态检索容器中 小图数量
        activeLen = $el.find('.image-card-wrap.active').length; // 动态检索容器中 小图被选中数量
    if ($("#pageSidebarMenu").find(".aui-icon-monitor").parents(".sidebar-item").hasClass("active")) {
        if (cardLen > 0 && cardLen === activeLen) {
            $('#selectAllSnappingDynamic').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
        } else {
            $('#selectAllSnappingDynamic').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        }
    } else if ($("#pageSidebarMenu").find(".aui-icon-library").parents(".sidebar-item").hasClass("active")) {
        if (cardLen > 0 && cardLen === activeLen) {
            $('#selectAllSnappingTemperature').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
        } else {
            $('#selectAllSnappingTemperature').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        }
    } else {
        if (cardLen > 0 && cardLen === activeLen) {
            $('#selectAllSnapping').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
        } else {
            $('#selectAllSnapping').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        }
    }
}

/**
 * 聚合 各分组标题 全选选中状态
 * @param {Object} $el 包含4中检索类型的 动态检索容器
 */
function judgeSelecteAll($el) {
    var cardLen = $el.find('.image-card-wrap').length, // 聚合分组 每组中小图数量
        activeLen = $el.find('.image-card-wrap.active').length; // 聚合分组 每组中小图被选中数量
    if (cardLen > 0 && cardLen === activeLen) {
        $el.find('.image-card-list-title .ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
    } else {
        $el.find('.image-card-list-title .ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
    }
}

// // 动静结合页面 静态库图片 详情展开事件响应
// $("#content-box").on("click", ".merge .image-card-item", function () {
//     // if (!isLoadAll) { //如果没有全部返回则点击无效
//     //     return;
//     // }
//     var $self = $(this),
//         rhInfo = $self.data("rhInfo"),
//         rh_html = '',
//         similarity = $self.data("similarity"),
//         sim_html = '',
//         simTag = '',
//         // 人员库类型模块
//         libInfo = $self.data('libInfo'),
//         lib_html = '<ul class="libInfo-list">';
//     if (!$self.data('idcard')) {
//         return;
//     }
//     // 按照type类型进行排序
//     function sortType(a, b) {
//         return a.type - b.type;
//     }
//     if (!$self.hasClass('alreadySureSearch')) {
//         $('#sureSearch').removeAttr('disabled');
//     } else {
//         $('#sureSearch').attr('disabled', 'true');
//     }
//     libInfo.sort(sortType);
//     libInfo.forEach((item, index) => {
//         if (item.libType === '1' || item.libType === 1 || item.libType === '2' || item.libType === 2) {
//             lib_html += `<li class="libInfo-item danger">${item.libName}</li>`;
//             // lib_html += `<li class="libInfo-item warning">${item.libName}</li>`;
//         } else {
//             lib_html += `<li class="libInfo-item">${item.libName}</li>`;
//         }
//     })
//     lib_html += `</ul>`;
//     var birthY = $self.data('idcard').substr(6, 4),
//         birthM = $self.data('idcard').substr(10, 2),
//         birthD = $self.data('idcard').substr(12, 2),
//         //birthday = birthY + '-' + birthM + '-' + birthD;
//         birthday = $self.data('birthday');
//     var tagCls = $self.find('.image-tag').data('cls'),
//         tagName = $self.find('.image-tag').data('name');
//     if ($("#bottom-sidebar").hasClass("side-bottom-cover")) {
//         $("#current-page").addClass("layout-open-bottom");
//     } else {
//         $("#current-page").addClass("layout-open-right");
//     }
//     $("#bottom-sidebar .card-side-close").off('click').on('click', function () {
//         $("#current-page").removeClass("layout-open-right");
//     });
//     if (tagCls !== 'hide') {
//         $('#bottom-sidebar').find('.tag.aui-ml-xs').removeClass()
//             .addClass('tag aui-ml-xs tag-' + tagCls).text(tagName);
//     } else {
//         $('#bottom-sidebar').find('.tag.aui-ml-xs').addClass('hide');
//     }
//     // 展开下侧详情
//     $self.closest(".aui-card").find(".image-card-wrap.active").removeClass('active');
//     $self.addClass('active');
//     // 详情赋值
//     $("#bottom-sidebar .image-flex-list img:eq(0)").attr("src", $('#staticContentContainer').data('base64'));
//     if ($("#usearchImg img").attr("idcard")) {
//         $("#bottom-sidebar .image-flex-list img:eq(0)").attr("idcard", $("#usearchImg img").attr("idcard"));
//     }
//     $("#bottom-sidebar .image-flex-list img:eq(1)").attr("src", $self.find("img").attr("src"))
//         .data('idcard', $self.find("img").closest('.image-card-wrap').data('idcard'));
//     $("#bottom-sidebar .aui-mb-sm .name").text($self.data("name"));
//     $("#bottom-sidebar .form-info .libInfo").html(lib_html);
//     $("#bottom-sidebar .form-info .sex").text($self.data("sex"));
//     $("#bottom-sidebar .form-info .age").text($self.data("age"));
//     $("#bottom-sidebar .form-info .idcard").text($self.data("idcard"));
//     $("#bottom-sidebar .form-info .birthday").text(birthday);
//     // 给侧边栏加上全局数据用于快速布控
//     $("#bottom-sidebar").data('controlData', {
//         name: $self.data("name"),
//         age: $self.data("age"),
//         idcard: $self.data("idcard"),
//         sex: $self.data("sex"),
//         picurl: $self.find("img").attr("src")
//     })
//     // 选择多家算法厂家时,插入对应算法厂家相似度节点
//     if (rhInfo) {
//         rhInfo.sort(sortInfo);
//         rhInfo.forEach((item, index) => {
//             rh_html += ` <div class="form-group aui-row">
//                                     <label class="aui-form-label aui-col-8">
//                                         <span>${item.platformName}：</span>
//                                     </label>
//                                     <div class="form-text aui-col-16" similarity>${item.similarity}</div>
//                                 </div>`;
//         })
//         // 动态添加算法厂商节点
//         $("#bottom-sidebar .form-info")
//             .find('.birthday')
//             .closest('.form-group')
//             .nextAll()
//             .remove();
//         $("#bottom-sidebar .form-info")
//             .find('.birthday')
//             .closest('.form-group')
//             .after(rh_html);
//         // 点击融合列表里面图片时,详情左侧图片添加tag标签
//         simTag += `<span class="primary">命中${$self.find('.image-card-number').text()}家</span>`;
//         $('#bottom-sidebar').find('.image-flex-similarity').html(simTag);
//     } else {
//         sim_html += ` <div class="form-group aui-row">
//                         <label class="aui-form-label aui-col-8">
//                             <span>相似度：</span>
//                         </label>
//                         <div class="form-text aui-col-16" similarity>${similarity}</div>
//                     </div>`;
//         // 动态添加算法厂商节点
//         $("#bottom-sidebar  .form-info")
//             .find('.birthday')
//             .closest('.form-group')
//             .nextAll()
//             .remove();
//         $("#bottom-sidebar .form-info")
//             .find('.birthday')
//             .closest('.form-group')
//             .after(sim_html);
//         // 点击厂家列表里面图片时,详情左侧图片添加tag标签
//         // 相似度大于90%的时候标注为红色,大于60%小于等于90%的时候标注为黄色,其他时候为白色
//         if (similarity >= '90%') {
//             simTag += `<span class="danger">${similarity}</span>`;
//         } else if (similarity >= '60%' && similarity < '90%') {
//             simTag += `<span class="warning">${similarity}</span>`;
//         } else {
//             simTag += `<span class="white">${similarity}</span>`;
//         }
//         $('#bottom-sidebar').find('.image-flex-similarity').html(simTag);
//     }
//     $('#sureSearch').off('click').on('click', function () {
//         if (!$self.hasClass('alreadySureSearch')) {
//             warningTip.say('目标比中已命中', 1)
//             $self.addClass('alreadySureSearch')
//             $('#sureSearch').attr('disabled', 'true');
//         } else {
//             $('#sureSearch').attr('disabled', 'true');
//         }
//     })
// });

//动态库图文模式点击展开大图
$('#content-box').on('click', '.showBigImg .image-card-info', function (e) {
    $(this).parent().find(".image-card-box .image-card-img").click();
});

// 动态聚合 点击查看更多
function togetherShowMore() {
    $('.image-card-list-title .btn').off('click').on('click', function () {
        var $this = $(this),
            $cardList = $this.closest('.image-card-list'),
            delayTime = $this.closest('.wrap-empty-center').length > 0 ? 50 : 500;
        if ($cardList.hasClass('showMore')) {
            $this.text('收起');
            $cardList.removeClass('showMore').siblings('.image-card-list').addClass('showMore').find('.image-card-list-title .btn').text('查看更多');
            $cardList.find('.pagination-wrap').removeClass('display-none');
            $cardList.siblings('.image-card-list').find('.pagination-wrap').addClass('display-none');
            window.setTimeout(function () {
                animateScroll($this);
            }, delayTime);
        } else {
            $this.text('查看更多');
            $cardList.addClass('showMore');
            $cardList.find('.pagination-wrap').addClass('display-none');
            window.setTimeout(function () {
                animateScroll($this);
            }, delayTime);
        }
    })
}

// 聚合点击滚动动画
function animateScroll($el) {
    var top = $el.closest('.image-card-list-title')[0].getBoundingClientRect().top,
        mainTop = $('.layout-type3 .flex-container')[0].getBoundingClientRect().top,
        mainScrollTop = $('#current-page #collapseDynamic').scrollTop();
    $('#current-page #collapseDynamic').animate({
        scrollTop: (top - mainTop + mainScrollTop)
    }, 500);
}

// 抓拍库图片拖拽框选
function dropSelect($dragContainer) {
    // 检索图片框选功能
    $dragContainer.on('mousedown', function (evt) {
        var $dropSelectHtml = $('<div class="drop-select-box hide"></div>'),
            $mapPanel = $('<div class="map-panel hide"></div>');
        // 找寻到当前权限下检索节点中添加选中框节点
        var $searchDom = $('#pageSidebarMenu').find('.aui-icon-carsearch2'); // 检索图标
        if ($searchDom.length === 0) { // 当前权限下是否存在检索节点
            return;
        }
        var searchIndex = $searchDom.closest('.sidebar-item').index(), // 检索模块 在菜单中的索引
            $target = $(evt.target),
            $contentItem = $('#content-box').find('.content-save-item'), // 所有模块内容区节点
            $saveItem = $contentItem.eq(searchIndex), // 检索模块内容区节点
            $selectLen = $saveItem.find('.drop-select-box'),
            $mapLen = $saveItem.find('.map-panel'), // 地图弹框 目前好像没啥用
            saveCls = $saveItem.hasClass('hide'), // 检索内容区是否隐藏
            $target = $(evt.target),
            $targetParent = $target.closest('.image-card-wrap'),
            $imageWrap = $('#collapseDynamic').find('.imageCacheDynamicList .image-card-list').not('.hide').find('.showBigImg').not('.display-none');
        //$imageWrap = $('.dynamicCardImg').find('.showBigImg').not('.display-none'); // 动态检索 此种检索类型的图片ul列表
        if ($selectLen.length === 0) {
            $saveItem.append($dropSelectHtml);
        } else {
            $dropSelectHtml = $selectLen;
        }
        if ($mapLen.length === 0) {
            $saveItem.find('.search-map-frame').append($mapPanel);
        } else {
            $mapPanel = $mapLen;
        }
        if (saveCls) { // 判定当前是否存在检索节点,并且当前选中的节点也是检索节点
            return;
        }
        if ($targetParent.length > 0) { // 当前选中项不应该是抓拍库图片节点
            return;
        }
        if ($imageWrap.find('.image-card-wrap').length === 0) {
            return;
        }
        if ($target.closest('.panel-heading').length > 0 ||
            $target.closest('.btn-link').length > 0 ||
            $target.closest('.pagination').length > 0 ||
            $target.closest('.result-wrap').length === 0) {
            return;
        }
        // 设置初始数据
        var posx = evt.pageX,
            posy = evt.pageY;
        $dropSelectHtml.css({
            'position': 'fixed',
            'background': 'rgba(59,158,243,0.4)',
            'border': '1px solid #3B9EF3',
            'opacity': 0.4,
            'top': posy,
            'left': posx,
            'width': 1,
            'height': 1,
            'z-index': 6
        });
        $mapPanel.css({
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'width': '100%',
            'height': '100%',
            'z-index': '10'
        });
        // 绑定全局移动事件
        $(document).on('mousemove.dropSelect', function (e) {
            e.stopPropagation();
            e.preventDefault();
            calcArea($imageWrap.find('.image-card-wrap'), true);

            var left = Math.min(e.pageX, posx),
                top = Math.min(e.pageY, posy),
                width = Math.abs(posx - e.pageX),
                height = Math.abs(posy - e.pageY);

            // // 进行拖拽宽度判断,大于某个值之后进行选中的节点去除选中效果
            // if (width > 5 && height > 5) {
            //     var $checkbox = $imageWrap.find('.image-card-wrap').find('.image-checkbox-wrap');
            //     $checkbox.each(function () {
            //         var thisCls = $(this).find('label').hasClass('ui-checkboxradio-checked');
            //         if (thisCls) {
            //             $(this).click();
            //         }
            //     });
            // }

            // 添加无边界样式
            $imageWrap.find('.image-card-wrap').addClass('border');
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
            calcArea($imageWrap.find('.image-card-wrap'));
            // 添加无边界样式
            $imageWrap.find('.image-card-wrap').removeClass('border');
            $imageWrap.find('.image-card-wrap').removeClass('selected');
            $dropSelectHtml.addClass('hide');
            $mapPanel.addClass('hide');
            $(document).off('mousemove.dropSelect mouseup.dropSelect');
        });
        // 统一计算函数
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
                        isNotCheck = true; // 如果有没有选中的选项框为true
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
                    if (isNotCheck) { // 如果有没有选择的选择框则选中
                        if (!checkCls) {
                            $checkLabel.click();
                        }
                    } else { // 都为已选择的，则取消选中
                        $checkLabel.click();
                    }
                }
            }
        }
    });
    // 检索卡片进行拖拽
    $('.dynamicCardImg').on('mousedown', '.image-card-wrap', function (evt) {
        var $this = $(this), // 被点击的图片容器
            firstTime = new Date().getTime(),
            thisData = $this.data('listData'),
            $thisParent = $this.closest('.content-save-item'),
            $cardCopy = $([
                '<div class="drop-card-copy hide">',
                '   <div class="image-card-box">',
                '       <img class="image-card-img" src="' + thisData.smallPicUrl + '" />',
                '       <div class="image-card-message-box">',
                '           <p class="image-card-message-position">' + thisData.similarity + '</p>',
                '           <p class="image-card-message-time">' + thisData.timePeriods + '</p>',
                '       </div>',
                '   </div>',
                '</div>'
            ].join('')),
            $searchImgPanel = $('<div class="drop-card-panel hide"><span>拖拽至此处进行检索</span></div>')
        $saveItem = $thisParent.find('.drop-card-copy'),
            $panel = $thisParent.find('.drop-card-panel'),
            thisInfo = $this.find('.image-card-box')[0].getBoundingClientRect(),
            posX = evt.pageX, posY = evt.pageY;
        if ($saveItem.length === 0) {
            $thisParent.append($cardCopy);
        } else {
            $cardCopy = $saveItem;
            $cardCopy.find('.image-card-img').attr('src', thisData.smallPicUrl);
            $cardCopy.find('.image-card-message-position').text(thisData.similarity);
            $cardCopy.find('.image-card-message-time').text(thisData.timePeriods);
        }
        if (thisData.similarity == '.00%') {
            $cardCopy.find('.image-card-message-box .image-card-message-position').hide();
        } else {
            $cardCopy.find('.image-card-message-box .image-card-message-position').show();
        }

        if ($panel.length === 0) {
            $thisParent.find('#usearchImg').append($searchImgPanel);
        } else {
            $searchImgPanel = $panel;
        }
        $cardCopy.css({
            top: thisInfo.top,
            left: thisInfo.left,
            width: thisInfo.width,
            height: thisInfo.height
        });
        // 绑定鼠标拖拽事件
        $(document).on('mousemove.cardDropWrap', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var lastTime = new Date().getTime();
            if (lastTime - firstTime < 200) {
                return;
            }
            $cardCopy.removeClass('hide');
            $searchImgPanel.removeClass('hide');
            var searchImgInfo = $thisParent.find('#usearchImg')[0].getBoundingClientRect(),
                searchImgX = searchImgInfo.left + searchImgInfo.width,
                searchImgY = searchImgInfo.top + searchImgInfo.height;
            // 判断是否拖入上传图片框中
            if (e.pageX < searchImgX && e.pageY < searchImgY &&
                e.pageX > searchImgInfo.left && e.pageY > searchImgInfo.top) {
                $thisParent.find('#usearchImg').addClass('no-border');
                $searchImgPanel.addClass('border');
            } else {
                $thisParent.find('#usearchImg').removeClass('no-border');
                $searchImgPanel.removeClass('border');
            }
            // 判定搜索框是否有滚动条
            var $addImage = $('#usearchImg').find('.add-image-item');
            if ($addImage.length >= 9) {
                var imgScrollTop = $('#usearchImg').scrollTop();
                $('#usearchImg').css({
                    'overflow': 'hidden'
                });
                $searchImgPanel.css({
                    top: imgScrollTop
                });
            }
            $cardCopy.css({
                top: e.pageY - (thisInfo.height / 2) - 2,
                left: e.pageX - (thisInfo.width / 2) - 2
            });
        });
        // 绑定鼠标松开事件
        $(document).on('mouseup.cardDropWrap', function (e) {
            e.stopPropagation();
            e.preventDefault();

            if ($searchImgPanel.hasClass('border')) {
                var insertImg = $cardCopy.find('.image-card-img').attr('src');
                if (thisData.base64Img) {
                    var html = createAddImageItem(thisData.base64Img);
                    $("#usearchImg").find('.add-image-item').removeClass('active');
                    $('#usearchImg').find('.add-image-icon').before(html);
                    $('#usearchImg').find('.uploadFile')[0].value = '';
                    var $imgItem = $('#usearchImg').find('.add-image-item');
                    if ($imgItem.length > 5) {
                        $('#usearchImg').removeClass('scroll');
                        var clientH = $('#usearchImg')[0].clientHeight;
                        $('#usearchImg').addClass('scroll');
                        $('#usearchImg').animate({
                            'scrollTop': clientH
                        }, 500);
                    }
                    if ($('#mergeSearch').length > 0) {
                        imgDom(thisData.base64Img, $('#mergeSearch'), $("#usearchImg"), false, false, thisData);
                    } else {
                        imgDom(thisData.base64Img, $('#dynamicsearch'), $("#usearchImg"), false, false, thisData);
                    }
                    $('#usearchImg').removeClass('center');
                    $('#usearchImg').find('.add-image-icon').removeClass('add-image-new');
                    $('#usearchImg').find('.add-image-box-text').addClass('hide');
                } else {
                    window.loadData('v2/faceDt/getImgByUrl', true, {
                        url: insertImg
                    }, function (data) {
                        var imgUrl = 'data:image/png;base64,' + data.base64;
                        var html = createAddImageItem(imgUrl);
                        $("#usearchImg").find('.add-image-item').removeClass('active');
                        $('#usearchImg').find('.add-image-icon').before(html);
                        $('#usearchImg').find('.uploadFile')[0].value = '';
                        var $imgItem = $('#usearchImg').find('.add-image-item');
                        if ($imgItem.length > 5) {
                            $('#usearchImg').removeClass('scroll');
                            var clientH = $('#usearchImg')[0].clientHeight;
                            $('#usearchImg').addClass('scroll');
                            $('#usearchImg').animate({
                                'scrollTop': clientH
                            }, 500);
                        }
                        if ($('#mergeSearch').length > 0) {
                            imgDom(imgUrl, $('#mergeSearch'), $("#usearchImg"), false, false, thisData);
                        } else {
                            imgDom(imgUrl, $('#dynamicsearch'), $("#usearchImg"), false, false, thisData);
                        }
                        $('#usearchImg').removeClass('center');
                        $('#usearchImg').find('.add-image-icon').removeClass('add-image-new');
                        $('#usearchImg').find('.add-image-box-text').addClass('hide');
                    });
                }
            }
            $cardCopy.addClass('hide');
            $searchImgPanel.addClass('hide');
            $('#usearchImg').removeAttr('style');
            $searchImgPanel.removeClass('border').removeAttr('style');
            $thisParent.find('#usearchImg').removeClass('no-border');
            $(document).off('mousemove.cardDropWrap mouseup.cardDropWrap')
        });
    });
}
/************************* 动态检索 动静融合 end *************************/
/************************* 二次检索 start *************************/
/**
 * 二次检索功能
 * @param {Object} $search 上传图片框$('#usearchImg')
 * @param {Object} $targetImg 目标检索图片元素 （动静结合页面时，是详情右边的图片节点）
 * @param {Boolean} only 是否为动静融合
 */
function repeatSearch($search, $targetImg, only) {
    var idcard = $targetImg.data('idcard');
    getImgBase64(idcard, $search, {
        sidebar: $('#bottom-sidebar'), // 动静结合页面时，是右侧详情容器
        search: $('#mergeSearch') // 搜索按钮
    }, only)
}

/**
 * 根据idcard获取图片的base64值 并将需要图片 插入上传图片框
 * @param {string} card        身份证号码字符串 
 * @param {object} dom         替换图片路径的节点
 * @param {object} isSearch    是否需要点击搜索
 * @param {Boolean} only 是否为动静融合
 */
function getImgBase64(card, $dom, isSearch, only) {
    var port = 'v2/faceRecog/findImageByIdCard',
        data = {
            idcard: card
        },
        successFunc = function (data) {
            var html = `
                <div class="add-image-item active" value="${Math.random()}">
                    <img class="add-image-img"  title="双击可截图" src="data:image/png;base64,${data.base64}" alt="">
                    <i class="aui-icon-delete-line"></i>
                </div> 
                `;
            $dom.find('.add-image-icon').before(html);
            $dom.find('.add-image-item').removeClass('active').eq(-1).addClass('active');
            var $imgItem = $dom.find('.add-image-item');
            if ($imgItem.length > 5) {
                $dom.removeClass('scroll');
                var clientH = $dom[0].clientHeight;
                $dom.addClass('scroll');
                $dom.animate({
                    'scrollTop': clientH
                }, 500);
            }
            if (isSearch) {
                isSearch.sidebar.find('.card-side-close').click();
                if (only) {
                    window.isOnlyFresh = true; // 为true时 不刷新静态库
                }
                isSearch.search.click(); // 点击检索
            }
        };
    loadData(port, true, data, successFunc, undefined, 'GET', sourceType == 'ga' ? serviceUrlOther : '');
}
/************************* 二次检索 end *************************/
/************************* 检索 其他模块 大图公共方法 start *************************/
/**
 * @param { Object } $container // jquery对象 触发弹窗节点容器 找寻相同触发节点数量 （动态检索：纯图片ul列表容器）
 * @param { String } cls        // 特定弹窗类名 区别不同查看大图弹窗 （动态检索：纯图片ul列表容器id）
 * @param { Number } index      // 触发查看大图弹窗节点的索引 （动态检索: 图片在ul中的索引）
 * @param { Object } $targetImg // jquery对象 检索页面下检索图片节点 （动态检索: 上传图片框节点）
 * @param { Object } event      // dom event 对象 （动态检索：图片点击事件对象）
 * @param { Object } fixData    // 修正数据 修正函数中一些强相关数据
 * @param { Object } maskType   //
 * @param { Object } isSuspect  // 是否疑似告警大图
 */
function createBigImgMask($container, cls, index, $targetImg, event, fixData, maskType, isSuspect) {
    var selectorStr = '.mask-container-fixed' + '.' + cls, // 构造大图类名
        $findMask = $('body').find(selectorStr), // 大图节点
        findMaskLen = $findMask.length; // 对应类型大图长度
    var $maskContainer = $([
        '<div class="mask-container-fixed hide ' + cls + '">',
        '   <div class="mask-dialog">',
        '   <div class="mask-content">',
        '   <i class="aui-icon-not-through bigimg"></i>',
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
    ].join('')); // 大图框架
    var maskSlider = [
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
        '   <img class="img" alt="" />',
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
        window.commonMaskRight(3).html(), //3为检索弹窗右侧信息
        '   </div>',
        '   </div>',
        '</div>'
    ].join('');
    if (!fixData) {
        var $cardImg = $container.find('.image-card-img'),
            $selectImg = $cardImg.eq(index),
            $selectImgWrap = $selectImg.closest('.image-card-wrap'),
            selectData = $selectImgWrap.data().listData,
            cameraId = $selectImgWrap.data().listData.cameraId, // 播放视频时使用(查看实时视频)
            longCameraId = $selectImgWrap.data().listData.longCameraId, // 播放视频时使用(查看前后秒数专用)
            cameraTime = $selectImgWrap.data().listData.captureTime, // 播放视频时使用
            selectBigPic = $selectImgWrap.data().listData.bigPicUrl, // 动态检索大图url 用于获取大图
            selectPosition = $selectImgWrap.data().listData.vertices,
            imgLen = $cardImg.length;
    } else {
        var $cardImg = fixData.cardImg.parent().children(),
            $selectImg = $cardImg.eq(index),
            cameraId = fixData.data.cameraId, // 播放视频时使用(查看实时视频)
            longCameraId = fixData.data.longCameraId, // 播放视频时使用(查看前后秒数专用)
            cameraTime = fixData.data.alarmTime,
            selectGuid = fixData.data.id,
            selectPosition = fixData.data.vertices,
            imgLen = fixData.len || $cardImg.length;
    }
    if (findMaskLen === 0) {
        // 添加空的滑动节点
        for (var i = 0; i < imgLen; i++) {
            $maskContainer.find('.mask-container .swiper-wrapper').append(maskSlider);
        }
        $('body').append($maskContainer);
        // 当点击布控模块-轨迹分析-告警列表 或者 告警模块-按对象布控-查看地图轨迹 最后一张大图不需要展示下一个按钮
        if ((maskType && maskType.controlAlarmLen && ((maskType.controlAlarmLen - 1) === index)) || (maskType && maskType.alarmObjectLen && ((maskType.alarmObjectLen - 1) === index))) {
            $('.swiper-button-next').addClass('hide');
        }
        var containerCls = '.mask-container-fixed.' + cls + ' .swiper-container',
            nextBtnCls = '.mask-container-fixed.' + cls + ' .swiper-button-next',
            prevBtnCls = '.mask-container-fixed.' + cls + ' .swiper-button-prev';
        var mySwiper = new Swiper(containerCls, {
            navigation: {
                nextEl: nextBtnCls,
                prevEl: prevBtnCls
            },
        });
        // 绑定键盘事件 左右切换 esc 模拟上一张下一张按钮点击事件
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
                        var $cropPanel = $('body').find(selectorStr).find('.mask-crop-panel').not('.hide'); // 判断大图上是否有遮罩层
                        if ($cropPanel.length === 0) { // 大图上没有遮罩层
                            $('body').find(selectorStr).find('.mask-container').prev().click(); // 关闭大图弹框
                        } else { // 大图上有遮罩层
                            var $cropPanelNext = $cropPanel.next(); // 大图上框出的人脸框
                            if ($cropPanelNext.hasClass('hide')) { // 大图上没有框出人脸
                                $cropPanel.closest('.swiper-slide').find('.mask-image-box').trigger('mousedown'); // 相当于点击大图的功能
                                $(document).trigger('mouseup');
                            } else { // 大图上框出人脸
                                $cropPanelNext.find('.aui-icon-not-through').click(); // 相当于点击框出的人脸关闭按钮
                            }
                        }
                    }
                }
            }
        });
        // 点击下一张 模拟动态库下一张图片点击事件
        $(nextBtnCls).on('click', function () {
            var $maskDomFix = $(this).closest('.mask-container-fixed'),
                maskIndex = $maskDomFix.data('index'), // 当前被点击图片的下标索引
                $cropPanel = $maskDomFix.find('.mask-crop-panel').not('.hide');
            if ($cropPanel.length > 0) { // 如果大图上存在遮罩层 点击无效
                return;
            }
            // 判断是否在最后一张图片
            if (maskIndex + 1 <= imgLen - 1) { // 不是最后一张大图
                $(this).removeClass('hide'); // 显示下一张按钮
                $(prevBtnCls).removeClass('hide'); // 显示上一张按钮
                mySwiper.slideTo(maskIndex + 1, 500, true); // 滑动到下一张 给切换绑定额外时间用于当切换按钮的时候请求大图数据
                if (maskType) {
                    $cardImg.eq(maskIndex + 1).find(".case-img-box").click();
                } else {
                    $cardImg.eq(maskIndex + 1).click(); // 点击动态检索中的下一张图片
                }
                // 布控告警弹窗处理
                if (cls === 'control-case-item') {
                    $cardImg.eq(maskIndex + 1).find('.case-img-box').click();
                }
            }
            // 当在最后一张图片的时候 下一张按钮添加隐藏属性
            if (maskIndex + 1 === imgLen - 1) {
                $(this).addClass('hide'); // 不显示下一张按钮
            }
            $findMask.find(".mask-image-box").removeClass("hide");
            $findMask.find(".mask-image-contrast").addClass("hide");
            $findMask.find(".changeImgSearch").html("横向比对");
            var sUrl = $findMask.find('.swiper-slide.swiper-slide-active').find(".image-flex-list.clearfix>.image-box-flex").eq(1).find(".img").data("sUrl");
            $findMask.find('.swiper-slide.swiper-slide-active').find(".image-flex-list.clearfix>.image-box-flex").eq(1).find(".img").attr("src", sUrl);
        });
        // 点击上一张 模拟动态库上一张图片点击事件
        $(prevBtnCls).on('click', function () {
            var $maskDomFix = $(this).closest('.mask-container-fixed'),
                maskIndex = $maskDomFix.data('index'),
                $cropPanel = $maskDomFix.find('.mask-crop-panel').not('.hide');
            if ($cropPanel.length > 0) { // 如果大图上存在遮罩层 点击无效
                return;
            }
            // 判断是否在第一张图片
            if (maskIndex - 1 >= 0) {
                $(this).removeClass('hide'); // 显示上一张按钮
                $(nextBtnCls).removeClass('hide'); // 显示下一张按钮
                mySwiper.slideTo(maskIndex - 1, 500, true); // 滑动到下一张 给切换绑定额外时间用于当切换按钮的时候请求大图数据
                if (maskType) {
                    $cardImg.eq(maskIndex - 1).find(".case-img-box").click();
                } else {
                    $cardImg.eq(maskIndex - 1).click(); // 点击动态检索中的上一张图片
                }
                // 布控告警弹窗处理
                if (cls === 'control-case-item') {
                    $cardImg.eq(maskIndex - 1).find('.case-img-box').click();
                }
            }
            // 当在第一张图片的时候 上一张按钮添加隐藏属性
            if (maskIndex - 1 === 0) {
                $(this).addClass('hide'); // 不显示上一张按钮
            }

            $findMask.find(".mask-image-box").removeClass("hide");
            $findMask.find(".mask-image-contrast").addClass("hide");
            $findMask.find(".changeImgSearch").html("横向比对");
            var sUrl = $findMask.find('.swiper-slide.swiper-slide-active').find(".image-flex-list.clearfix>.image-box-flex").eq(1).find(".img").data("sUrl");
            $findMask.find('.swiper-slide.swiper-slide-active').find(".image-flex-list.clearfix>.image-box-flex").eq(1).find(".img").attr("src", sUrl);
        });
        $maskContainer.data('comp', mySwiper);
    }
    $('body').find(selectorStr).find(".mask-image-box").on('contextmenu', rightMouse); // 去除右键事件
    $findMask = $('body').find(selectorStr); // 覆盖之前存储的节点数据 大图弹框节点
    var $selectSquareBox = $findMask.find('.swiper-slide').eq(index).find('.square-box'); // 红框框出的人脸节点
    if (!$selectSquareBox.hasClass('hide')) { // 如果红框框出的人脸不隐藏 默认红框框出的人脸隐藏
        $selectSquareBox.addClass('hide');
    }
    $findMask.data('index', index); // 给大图弹框index属性赋值
    // 点击截图按钮事件
    $findMask.find('.aui-icon-screen').off('click').on('click', function () {
        var $slidePanel = $findMask.find('.swiper-slide').eq(index).find('.mask-crop-panel'),
            $slideSelectBox = $findMask.find('.swiper-slide').eq(index).find('.square-box');
        $slidePanel.removeClass('hide'); // 大图显示遮罩层
        $slideSelectBox.addClass('hide'); // 去掉红框框选人脸
        var $maskClose = $findMask.find('.aui-icon-close'),
            $maskFooter = $findMask.find('.mask-icon-box'),
            $maskNext = $findMask.find('.swiper-button-next'),
            $maskPrev = $findMask.find('.swiper-button-prev'),
            $maskCamera = $findMask.find('.aui-icon-video3');
        $maskClose.addClass('hide');
        $maskFooter.addClass('hide'); // 隐藏播放视频 截图按钮
        $maskNext.addClass('hide'); // 隐藏下一张按钮
        $maskPrev.addClass('hide'); // 隐藏上一张按钮
        $maskCamera.addClass('hide'); // 隐藏播放视频按钮
    });
    // 点击播放按钮事件
    $findMask.find('.aui-icon-video3').off('click').on('click', function (evt) {
        evt.stopPropagation();
        $(this).toggleClass('active');
        var $list = $findMask.find('.swiper-slide-active .mask-camera-list');
        $list.children().removeClass('active').eq(0).addClass('active'); // 第一个选项增加激活状态
        $list.toggleClass('hide'); // 切换显示隐藏状态
    });
    // 点击播放列表中的具体几秒视频事件项
    $findMask.find('.mask-camera-item').off('click').on('click', function (evt) {
        evt.stopPropagation();
        $(this).addClass('active').siblings().removeClass('active');
        $findMask.find('.mask-camera-list').addClass('hide');
        var index = $(this).index();
        if (index === 0) {
            maskPlayVideo(longCameraId, seconds(cameraTime, -5), seconds(cameraTime, 5));
        } else if (index === 1) {
            maskPlayVideo(longCameraId, seconds(cameraTime, -10), seconds(cameraTime, 10));
        } else if (index === 2) {
            maskPlayVideo(longCameraId, seconds(cameraTime, -30), seconds(cameraTime, 30));
        } else if (index === 3) {
            maskPlayVideo(cameraId);
        }
    });
    // 全局点击隐藏列表
    $(document).off('click.mask.camera').on('click.mask.camera', function () {
        $('body').find('.mask-camera-list').addClass('hide');
        $('body').find('.mask-icon.aui-icon-video3').removeClass('active');
        $('body').find('.mask-camera-item').removeClass('active');
    });
    var nowSelectImg = $findMask.find('.swiper-slide').eq(index).find('.img').attr('src');
    var $maskFixedDom = $('.mask-container-fixed' + '.' + cls),
        thisLen = $container.children('li').length,
        maskSwiper;
    if (!nowSelectImg) { // 如果没有大图
        $findMask.find('.mask-loading-box').removeClass('hide'); // 加载请求动画
        showLoading($findMask.find('.mask-loading-box'));
        // 请求当前点击的图片的大图
        if (fixData) { // 如果不是动态检索
            loadData('v2/faceDt/getImgByUrl', true, {
                url: fixData.data.bigHttpUrl,
                moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
            }, function (data) {
                if (data.code === '200') {
                    var $maskSlide = $findMask.find('.swiper-slide').eq(index),
                        $cropImg = $maskSlide.find('.cropper-view-img'), // 大图中的截图层图片节点
                        $img = $maskSlide.find('.square-crop-box').next('.img'), // 大图图片节点
                        $maskSquareBox = $maskSlide.find('.square-box'), // 红框框出的人脸
                        $maskCropBox = $maskSlide.find('.square-crop-box'), // 大图上的鼠标截图
                        base64Img = 'data:image/png;base64,' + data.base64;
                    //selectPosition = data.vertices || [{ x: "0", y: "0" }, { x: "0", y: "0" }];  //人脸坐标
                    $cropImg.attr({
                        'src': base64Img
                    });
                    $img.attr({
                        'src': base64Img,
                        'width': data.width,
                        'height': data.height
                    });
                    // 对右侧详细信息图片进行修改
                    var $BigfaceSearchImg = $maskSlide.find('.mask-image-box .img'), // 大图图片
                        $similarity = $maskSlide.find('.image-flex-similarity').children(), // 相似度节点
                        $dropTime = $maskSlide.find('.mask-info-top').find('.form-group .form-text'), // 抓拍信息列表数据
                        wrapListData = fixData.data;
                    $maskSlide.data('listCard', wrapListData); // 滑块listCard属性赋值
                    if (fixData.html) {
                        var $insertHtml = fixData.html;
                        $maskSlide.children().find('.aui-col-6').remove(); // 去掉右侧详情
                        $maskSlide.children().append($insertHtml); // 右侧插入指定详情
                        var $showSearchImg = $maskSlide.find('.mask-info-box .control-imge-list').find('.image-box-flex').eq(0).children('.img'), // 检索图片
                            $faceSearchImg = $maskSlide.find('.mask-info-box .control-imge-list').find('.image-box-flex').eq(1).children('.img'), // 抓拍图片
                            $YSearchImg = $faceSearchImg.attr("src");
                        // 根据url获取base64
                        alarmSearchBtnChange($faceSearchImg.attr("src"), function (imageInfo) {
                            $faceSearchImg.attr('src', imageInfo); // 右侧详情 抓拍图片赋值 值为动态库中被点击的小图base64
                            $faceSearchImg.data('sUrl', imageInfo); // 右侧详情 抓拍图片赋值 值为动态库中被点击的小图base64
                            $faceSearchImg.data('bUrl', $BigfaceSearchImg.attr("src")); // 右侧详情 抓拍图片赋值 值为动态库中被点击的小图base64
                            $maskSlide.find(".changeImgSearch").removeClass("disabled");
                            $maskSlide.find(".onetooneSearch").removeClass("disabled");
                            if (isClickOneToOne) {
                                $maskSlide.find(".changeImgSearch").click();
                            }
                            isClickOneToOne = false;
                        });
                        $maskSlide.children().removeClass('hide'); // 显示滑块内容
                        //$maskSlide.find(".changeImgSearch").addClass("hide"); //目前只有动态检索有图片比对和查看大图切换功能，其他大图弹窗暂时隐藏
                        if (isClickOneToOne) {
                            $maskSlide.find(".mask-image-box").addClass("hide");
                            $maskSlide.find(".mask-image-contrast").removeClass("hide");
                        } else {
                            $maskSlide.find(".mask-image-box").removeClass("hide");
                            $maskSlide.find(".mask-image-contrast").addClass("hide");
                        }
                        // 给弹窗上面的按钮添加点击事件
                        var $slideCol6 = $maskSlide.children().find('.aui-col-6'),
                            $slideBtnChangeImg = $slideCol6.find('.changeImgSearch'),
                            $onetooneSearch = $slideCol6.find('.onetooneSearch'),
                            $slideBtnSure = $slideCol6.find('.btn-confirm'),
                            $slideBtnFalse = $slideCol6.find('.btn-false'),
                            $slideBtnSearch = $slideCol6.find('.btn-search'),
                            $slideBtnCheck = $slideCol6.find('.btn-check'),
                            $slideBtnRevoke = $slideCol6.find('.btn-revoke'),
                            $contentItem = $('#content-box').find('.content-save-item').not('.hide'),
                            $alarmStatusSureMask = $contentItem.find('#alarmOkModal'),
                            $alarmStatusErrorMask = $contentItem.find('#alarmErrorModal'),
                            $alarmStatusCheckMask = $contentItem.find('#alarmCheckModal'),
                            $alarmStatusRevokeMask = $contentItem.find('#alarmRevokeModal'),
                            $alarmStatusSureMaskOk = $alarmStatusSureMask.find('.btn-primary'),
                            $alarmStatusErrorMaskOk = $alarmStatusErrorMask.find('.btn-primary'),
                            $alarmStatusCheckMaskOk = $alarmStatusCheckMask.find('.btn-primary'),
                            $alarmStatusRevokeMaskOk = $alarmStatusRevokeMask.find('.btn-primary');
                        //弹窗查看大图和比对图片切换事件
                        $slideBtnChangeImg.off().on('click', function () {
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
                        $onetooneSearch.off().on('click', function () {
                            var src1 = $(this).parent().find(".image-flex-list.clearfix>.image-box-flex").eq(0).find(".img").attr("src"),
                                src2 = $(this).parent().find(".image-flex-list.clearfix>.image-box-flex").eq(1).find(".img").attr("src");
                            commonOnetooneSearch(src1, src2);
                        });
                        // 确认
                        $slideBtnSure.off('click').on('click', function () {
                            var thisCls = $(this).hasClass('disabled');
                            if (thisCls) {
                                return;
                            }
                            $alarmStatusSureMask.modal('show');
                            var $maskBackDrop = $($alarmStatusSureMask.data()['bs.modal']._backdrop);
                            $maskBackDrop.addClass('hide');
                        });
                        // 误报
                        $slideBtnFalse.off('click').on('click', function () {
                            var thisCls = $(this).hasClass('disabled');
                            if (thisCls) {
                                return;
                            }
                            $alarmStatusErrorMask.modal('show');
                            var $maskBackDrop = $($alarmStatusErrorMask.data()['bs.modal']._backdrop);
                            $maskBackDrop.addClass('hide');
                        });
                        // 在逃核验
                        $slideBtnCheck.off('click').on('click', function () {
                            var $tableDetailList = $('#alarmCheckModal').find('.detailContent .TableDetail1');
                            $tableDetailList.not('.img').html('--');
                            $tableDetailList.eq(1).find('img').attr('src', '');
                            $alarmStatusCheckMask.modal('show');
                            setTimeout(() => {
                                $alarmStatusCheckMask.find('.modal-body').scrollTop(0);
                                $alarmStatusCheckMask.find('.modal-body').css('overflow-y', 'hidden');
                            }, 200);
                            showLoading($('#alarmCheckModal').find('.alarmCheckContent'));
                            var port = 'v2/memberInfos/queryZtryList',
                                portData = {
                                    idcard: wrapListData.idcard,
                                    libId: wrapListData.libId,
                                    peopleId: wrapListData.peopleId,
                                    alarmId: wrapListData.alarmId,
                                    random: Math.random()
                                },
                                successFunc = function (data) {
                                    hideLoading($('#alarmCheckModal').find('.alarmCheckContent'));
                                    $alarmStatusCheckMask.find('.modal-body').css('overflow-y', 'auto');
                                    $('#alarmCheckTable tbody').empty();
                                    if (data.code == '200') {
                                        var result = data.data.list;
                                        if (result && result.length > 0) {
                                            for (var i = 0; i < result.length; i++) {
                                                var html = '';
                                                html += `<tr data-index="${i}" class="librow" taskId="${result[i].id}" libId="${result[i].libId}">
                                                        <td></td>
                                                        <td>${result[i].ztCode || '--'}</td>
                                                        <td>${result[i].ztryType || '--'}</td>
                                                        <td>${result[i].name || '--'}</td>
                                                        <td>${result[i].gender || '--'}</td>
                                                        <td>${result[i].hjdz || '--'}</td>
                                                        <td>${result[i].ajType || '--'}</td>
                                                        <td>${result[i].ladw || '--'}</td>
                                                        <td>${result[i].zhTime || '--'}</td>
                                                        <td>${result[i].zhdw || '--'}</td>
                                                        <td>${result[i].onlineTime || '--'}</td>
                                                        <td>${result[i].cxTime || '--'}</td>
                                                        <td>${result[i].zbdw || '--'}</td>
                                                    </tr>`
                                                $('#alarmCheckTable tbody').append(html);
                                                $('#alarmCheckTable tbody').find("tr").eq(i).data({
                                                    listData: result[i],
                                                    type: data.data.type
                                                });
                                            }
                                            $('#alarmCheckTable tbody').off('click').on('click', 'tr', function () {
                                                showLoading($('#alarmCheckModal').find('.alarmCheckContent'));
                                                var ztCode = $(this).data('listData').ztCode,
                                                    type = $(this).data('type');
                                                var port = 'v2/memberInfos/queryZtryDetailInfo',
                                                    portData = {
                                                        ztCode: ztCode,
                                                        type: type,
                                                        random: Math.random()
                                                    },
                                                    successFunc = function (data) {
                                                        hideLoading($('#alarmCheckModal').find('.alarmCheckContent'));
                                                        if (data.code == '200') {
                                                            var result = data.data;
                                                            $tableDetailList.eq(0).html(ztCode);
                                                            $tableDetailList.eq(1).find('img').attr('src', 'data:image/png;base64,' + result.base64);
                                                            $tableDetailList.eq(2).html(result.name);
                                                            $tableDetailList.eq(3).html('');
                                                            $tableDetailList.eq(4).html(result.gender);
                                                            $tableDetailList.eq(5).html(result.birthday);
                                                            $tableDetailList.eq(6).html(result.nation);
                                                            $tableDetailList.eq(7).html(result.height);
                                                            $tableDetailList.eq(8).html(result.card);
                                                            $tableDetailList.eq(9).html(result.otherCard);
                                                            $tableDetailList.eq(10).html(result.accent);
                                                            $tableDetailList.eq(11).html(result.job);
                                                            $tableDetailList.eq(12).html(result.tmtz);
                                                            $tableDetailList.eq(13).html(result.tbtz);
                                                            $tableDetailList.eq(14).html(result.jg);
                                                            $tableDetailList.eq(15).html(result.regaddress);
                                                            $tableDetailList.eq(16).html(result.curaddress);
                                                            $tableDetailList.eq(17).html(result.ajCode);
                                                            $tableDetailList.eq(18).html(result.ajType);
                                                            $tableDetailList.eq(19).html(result.ajInfo);
                                                            $tableDetailList.eq(20).html(result.registerOrg);
                                                            $tableDetailList.eq(21).html(result.regOrgDetail);
                                                            $tableDetailList.eq(22).html(result.registerTime);
                                                            $tableDetailList.eq(23).html(result.escapeTime);
                                                            $tableDetailList.eq(24).html(result.escapeDirection);
                                                            $tableDetailList.eq(25).html(result.ztType);
                                                            $tableDetailList.eq(26).html(result.comments);
                                                            $tableDetailList.eq(27).html(result.flws);
                                                            $tableDetailList.eq(28).html('');
                                                            $tableDetailList.eq(29).html('');
                                                            $tableDetailList.eq(30).html(result.tjl);
                                                            $tableDetailList.eq(31).html(result.tjlLevel);
                                                            $tableDetailList.eq(32).html(result.bonus);
                                                            $tableDetailList.eq(33).html(result.zbOrgType);
                                                            $tableDetailList.eq(34).html(result.zbOrg);
                                                            $tableDetailList.eq(35).html(result.zbPerson);
                                                            $tableDetailList.eq(36).html(result.phone);
                                                            $tableDetailList.eq(37).html(result.zbPersonTwo);
                                                            $tableDetailList.eq(38).html(result.phoneTwo);
                                                            $tableDetailList.eq(39).html(result.zbOrgPhone);
                                                            $tableDetailList.eq(40).html(result.onlineApprover);
                                                            $tableDetailList.eq(41).html(result.zhTime);
                                                            $tableDetailList.eq(42).html(result.zhType);
                                                            $tableDetailList.eq(43).html(result.zhArea);
                                                            $tableDetailList.eq(44).html(result.zhOrg);
                                                            $tableDetailList.eq(45).html(result.zwCode);
                                                            $tableDetailList.eq(46).html(result.dnaCode);
                                                            $tableDetailList.eq(47).html('');
                                                            $tableDetailList.eq(48).html(result.cxApplicant);
                                                            $tableDetailList.eq(49).html(result.cxApprover);
                                                            $tableDetailList.eq(50).html(result.rkTime);
                                                            $tableDetailList.eq(51).html(result.updateTime);
                                                            $tableDetailList.eq(52).html('');
                                                            $tableDetailList.eq(53).html(result.cxTime);
                                                            $tableDetailList.eq(54).html('');
                                                            $tableDetailList.eq(55).html('');
                                                            $tableDetailList.eq(56).html('');
                                                        } else {
                                                            $tableDetailList.not('.img').html('--');
                                                            $tableDetailList.eq(1).find('img').attr('src', '');
                                                            warningTip.say(data.message);
                                                        }
                                                    };
                                                loadData(port, true, portData, successFunc);
                                            })
                                            $('#alarmCheckTable tbody').find('tr').eq(0).click();
                                        } else {
                                            warningTip.say('暂无核验信息');
                                        }
                                        closeCreateBigImgMask();
                                    } else {
                                        warningTip.say(data.message);
                                    }
                                };
                            loadData(port, true, portData, successFunc);
                        });
                        // 撤销
                        $slideBtnRevoke.off('click').on('click', function () {
                            if (!$slideBtnRevoke.hasClass('disabled')) {
                                $alarmStatusRevokeMask.modal('show');
                            }
                        });
                        // 确认确定
                        $alarmStatusSureMaskOk.off('click').on('click', function () {
                            var $slideBtnSure = $findMask.find('.swiper-slide.swiper-slide-active').find('.btn-confirm');
                            //之前这里存在问题，布控的轨迹分析点击命中和误报是模拟id为alarmListContainer的列表的命中和误报，但是告警页面列表没有这两个按钮，所以要区分开来。
                            if (maskType) {
                                if (maskType.type == 'BKContorl') { //如果是告警轨迹分析点击命中时，发送请求并且刷新我的告警和全部告警
                                    $alarmStatusSureMask.modal('hide');
                                    maskChangeStatus(wrapListData.alarmId || wrapListData.taskIds[0], '1', $slideBtnSure);
                                } else {
                                    if (!$(this).hasClass('disabled')) {
                                        var index = $('.swiper-slide-active').index();
                                        $('.card-control-content .case-item').eq(index).find('.case-item-operate .btn-confirm').click();
                                    }
                                }
                            } else {
                                $alarmStatusSureMask.modal('hide');
                                maskChangeStatus(wrapListData.alarmId || wrapListData.taskIds[0], '1', $slideBtnSure);
                            }
                            if (fixData.closeBigImg) {
                                $findMask.find('.aui-icon-not-through').click();
                            }
                        });
                        // 误报确定
                        $alarmStatusErrorMaskOk.off('click').on('click', function () {
                            var $slideBtnFalse = $findMask.find('.swiper-slide.swiper-slide-active').find('.btn-false');
                            //告警轨迹分析点击误报同理
                            if (maskType) {
                                if (maskType.type == 'BKContorl') { //如果是告警轨迹分析点击误报时
                                    $alarmStatusErrorMask.modal('hide');
                                    maskChangeStatus(wrapListData.alarmId || wrapListData.taskIds[0], '2', $slideBtnFalse);
                                } else {
                                    if (!$(this).hasClass('disabled')) {
                                        var index = $('.swiper-slide-active').index();
                                        $('.card-control-content .case-item').eq(index).find('.case-item-operate .btn-false').click();
                                    }
                                }
                            } else {
                                $alarmStatusErrorMask.modal('hide');
                                maskChangeStatus(wrapListData.alarmId || wrapListData.taskIds[0], '2', $slideBtnFalse);
                            }
                            if (fixData.closeBigImg) {
                                $findMask.find('.aui-icon-not-through').click();
                            }
                        });
                        // $alarmStatusCheckMaskOk.off('click').on('click', function () {
                        //     var data = wrapListData;
                        // });
                        $alarmStatusRevokeMaskOk.off('click').on('click', function () {
                            var port = 'v3/distributeManager/undoPeople',
                                portData = {
                                    libId: wrapListData.libId,
                                    personList: [wrapListData.peopleId],
                                    comments: '',
                                    random: Math.random()
                                },
                                successFunc = function (data) {
                                    if (data.code == '200') {
                                        warningTip.say('撤销成功！！！');
                                        $slideBtnRevoke.html('已撤销');
                                        $slideBtnRevoke.attr('disabled', 'disabled');
                                        $alarmStatusRevokeMask.modal('hide');
                                        closeCreateBigImgMask();
                                    } else {
                                        warningTip.say(data.message);
                                    }
                                };
                            loadData(port, true, portData, successFunc);
                        });
                        // 发起检索
                        $slideBtnSearch.off('click').on('click', function () {
                            var $sideBar = $('#pageSidebarMenu').find('.aui-icon-carsearch2'),
                                $sideItem = $sideBar.closest('.sidebar-item'),
                                sideIndex = $sideItem.index(),
                                $contentItem = $('#content-box').find('.content-save-item').eq(sideIndex),
                                $contentUserImg = $contentItem.find('#usearchImg'),
                                url = $sideBar.parent("a").attr("lc") + "?dynamic=" + Global.dynamic,
                                searchImgUrl = $YSearchImg;
                            $findMask.find('.aui-icon-not-through').click();
                            //数据看板最新告警点进来的
                            if ($container.hasClass("databoardModal")) {
                                $('.layui-layer-setwin').children().eq(-1).click();
                            }
                            if ($contentUserImg.length === 0) {
                                alarmSearchBtnChange(searchImgUrl, function (imageInfo) {
                                    $('#imgBase64').data({
                                        'base64': imageInfo,
                                        'searchAlarm': true
                                    });
                                    $contentItem.empty();
                                    loadPage($contentItem, url);
                                    $sideItem.click();
                                });
                            } else {
                                var $addImg = $contentUserImg.find('.add-image-item');
                                if ($addImg.length === 0) {
                                    alarmSearchBtnChange(searchImgUrl, function (imageInfo) {
                                        $('#imgBase64').data({
                                            'base64': imageInfo,
                                            'searchAlarm': true
                                        });
                                        $contentItem.empty();
                                        loadPage($contentItem, url);
                                        $sideItem.click();
                                    });
                                } else {
                                    alarmSearchBtnChange(searchImgUrl, function (imageInfo) {
                                        addSearchImg(imageInfo);
                                        $sideItem.click();
                                    });
                                }
                            }
                        });
                        // 更改告警状态公共函数 关闭之后刷新告警列表
                        function maskChangeStatus(alarmId, status, $btn) {
                            var url = 'v2/bkAlarm/updateStatus';
                            if (isSuspect) {
                                var url = 'v2/thirdHospital/updateStatus';
                            }
                            window.loadData(url, true, {
                                alarmId: alarmId,
                                status: status
                            }, function (data) {
                                if (data.code === '200') {
                                    var $operate = $btn.closest('.case-item-operate'),
                                        $allBtn = $operate.children('.btn'),
                                        $alarmTab = $('#alarm-change-tab'),
                                        $activeLink = $alarmTab.find('.nav-link.active');
                                    if (status === '1') {
                                        $allBtn.eq(0).text("已命中").addClass("disabled").next().remove();
                                    }
                                    if (status === '2') {
                                        $allBtn.eq(0).text("已误报").addClass("disabled").next().remove();
                                    }
                                    $activeLink.parent().removeData('loading');
                                    if (!maskType) {
                                        closeCreateBigImgMask();
                                    } else if (maskType.type == 'BKContorl') { //告警轨迹分析
                                        if (status == '1') { //命中
                                            $('#my-alarm-tabs').data('alarmItemData')[$('.swiper-slide-active').index()].status = '1';
                                            $("#alarmList").find(".aui-timeline-wrap").eq($('.swiper-slide-active').index()).find(".alarm-content-right .warning-item-level").html("已命中").removeClass('grade1').addClass('grade2');
                                        } else { //误报
                                            $('#my-alarm-tabs').data('alarmItemData')[$('.swiper-slide-active').index()].status = '2';
                                            $("#alarmList").find(".aui-timeline-wrap").eq($('.swiper-slide-active').index()).find(".alarm-content-right .warning-item-level").html("已误报").removeClass('grade1').addClass('grade3');
                                        }
                                        closeCreateBigImgMask();
                                    }
                                } else {
                                    warningTip.say(data.message);
                                }
                            });
                        }
                    } else {
                        $showSearchImg.attr('src', wrapListData.url);
                        $showSearchImg.siblings('.image-tag').text('布控原图');
                        alarmSearchBtnChange(wrapListData.smallHttpUrl, function (imageInfo) {
                            $faceSearchImg.attr('src', imageInfo);
                        });
                        $similarity.text(wrapListData.threshold + '%');
                        $dropTime.eq(0).text(wrapListData.alarmTime ? wrapListData.alarmTime : '未知');
                        $dropTime.eq(1).text(wrapListData.cameraName ? wrapListData.cameraName : '未知');
                        $dropTime.eq(2).text(wrapListData.orgName ? wrapListData.orgName : '未知');
                        $dropTime.eq(3).text(wrapListData.gbCode ? wrapListData.gbCode : '未知');
                    }
                    // 设置图片选中框
                    var imgWidth = $img.attr('width'),
                        imgHeight = $img.attr('height'),
                        positionArr = wrapListData.vertices ? wrapListData.vertices.split('@') : '0,0@0,0',
                        positionStartX = parseFloat(positionArr[0].split(',')[0]),
                        positionStartY = parseFloat(positionArr[0].split(',')[1]),
                        positionEndX = parseFloat(positionArr[1].split(',')[0]),
                        positionEndY = parseFloat(positionArr[1].split(',')[1]);
                    var position = {
                        start: {
                            x: positionStartX,
                            y: positionStartY
                        },
                        width: positionEndX - positionStartX,
                        height: positionEndY - positionStartY
                    }
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
                    selectFace();
                    $(window).off('resize').on('resize', selectFace);
                    // 绑定函数
                    maskImgCrop({
                        maskSlide: $maskSlide,
                        findMask: $findMask,
                        targetImg: null
                    }, cls, base64Img, {
                        index: index,
                        imgLen: imgLen
                    }, wrapListData);
                    $findMask.find('.mask-loading-box').addClass('hide');
                    hideLoading($findMask.find('.mask-loading-box'));
                }
            });
        } else { // 如果为动态检索大图
            loadData('v2/faceDt/getImgByUrl', true, {
                url: selectBigPic,
                moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
            }, function (data, position) {
                if (data.code === '200') {
                    var $maskSlide = $findMask.find('.swiper-slide').eq(index),
                        $cropImg = $maskSlide.find('.cropper-view-img'), // 大图中的截图层图片节点
                        $img = $maskSlide.find('.square-crop-box').next('.img'), // 大图图片节点
                        $maskSquareBox = $maskSlide.find('.square-box'), // 红框框出的人脸
                        $maskCropBox = $maskSlide.find('.square-crop-box'), // 大图上的鼠标截图
                        bigImgUrl = 'data:image/png;base64,' + data.base64;
                    $cropImg.attr({ // 截图层大图赋值
                        'src': bigImgUrl
                    });
                    $img.attr({ // 大图赋值
                        'src': bigImgUrl,
                        'width': data.width,
                        'height': data.height
                    });
                    var searchImgIndex = $targetImg.data('searchImgIndex'); // 上传图片容器 当前被检索图片的索引
                    var $searchImg = $targetImg.find('.add-image-item').eq(searchImgIndex).find('.add-image-img'); // 被检索的图片节点
                    var $showSearchImg = $maskSlide.find('.mask-info-box .control-imge-list').find('.image-box-flex').eq(0).children('.img'), // 右侧详情 检索图片节点
                        $faceSearchImg = $maskSlide.find('.mask-info-box .control-imge-list').find('.image-box-flex').eq(1).children('.img'), // 右侧详情 抓拍图片节点
                        $similarity = $maskSlide.find('.image-flex-similarity').children(), // 右侧详情 相似度节点
                        $dropTime = $maskSlide.find('.mask-info-top').find('.form-group .form-text'), // 右侧详情 抓拍信息列表数据节点
                        $slideBtn = $maskSlide.find('.case-item-operate').children(), // 操作按钮节点数组
                        $selectImgWrap = $container.find('.image-card-wrap').eq(index), // 被点击的动态库图片项节点
                        wrapListData = $selectImgWrap.data('listData'),
                        searchImgSrc = $targetImg.data('maskImg'); // 被检索的图片base64
                    wrapListData.vertices = wrapListData.vertices || (data.vertices || [{ x: "0", y: "0" }, { x: "0", y: "0" }]);
                    var selectPosition = wrapListData.vertices;
                    // 如果没有选择检索图片 不显示大图右侧详情的相似度
                    if (!searchImgSrc) {
                        //$('.image-flex-list.control-imge-list .image-flex-similarity').addClass('hide');
                        $maskSlide.find('.image-flex-similarity').addClass('hide');
                    }
                    $showSearchImg.attr('src', searchImgSrc); // 右侧详情 检索图片赋值 值为上传图片框中被检索的图片base64
                    // 根据url获取base64
                    alarmSearchBtnChange(wrapListData.smallPicUrl, function (imageInfo) {
                        $faceSearchImg.attr('src', imageInfo); // 右侧详情 抓拍图片赋值 值为动态库中被点击的小图base64
                        $faceSearchImg.data('sUrl', imageInfo); // 右侧详情 抓拍图片赋值 值为动态库中被点击的小图base64
                        $faceSearchImg.data('bUrl', bigImgUrl); // 右侧详情 抓拍图片赋值 值为动态库中被点击的小图base64
                        $maskSlide.find(".changeImgSearch").removeClass("disabled");
                        $maskSlide.find(".onetooneSearch").removeClass("disabled");

                        if (isClickOneToOne) {
                            $maskSlide.find(".changeImgSearch").click();
                        }
                        isClickOneToOne = false;
                    });
                    $similarity.text(wrapListData.similarity); // 右侧详情 相似度节点赋值
                    $dropTime.eq(0).text(wrapListData.captureTime ? wrapListData.captureTime : '未知'); // 右侧详情 抓拍信息 抓拍时间节点赋值
                    $dropTime.eq(1).text(wrapListData.cameraName ? wrapListData.cameraName : '未知'); // 右侧详情 抓拍信息 抓拍镜头名称节点赋值
                    $dropTime.eq(2).text(wrapListData.orgName ? wrapListData.orgName : '未知'); // 右侧详情 抓拍信息 镜头所属机构节点赋值
                    $dropTime.eq(3).text(wrapListData.gbCode ? wrapListData.gbCode : '未知'); // 右侧详情 抓拍信息 镜头国标编码节点赋值
                    $maskSlide.children().removeClass('hide');
                    $maskSlide.find(".changeImgSearch").removeClass("hide").html("横向比对");
                    if (isClickOneToOne) {
                        $maskSlide.find(".mask-image-box").addClass("hide");
                        $maskSlide.find(".mask-image-contrast").removeClass("hide");
                    } else {
                        $maskSlide.find(".mask-image-box").removeClass("hide");
                        $maskSlide.find(".mask-image-contrast").addClass("hide");
                    }

                    //大图抠图厂家下拉框
                    getCj($maskSlide);

                    //不是从对象动态库或地图弹窗点击的大图弹窗
                    if ($targetImg.attr("id") != "searchPortraitThree" && $targetImg.attr("id") != "popup-body-face-cntList" && $targetImg.attr("id") != "current-page-temperature") {
                        //检索大图弹窗增加地图定位
                        $maskSlide.find(".mask-image-box .mask-icon-box").append(`<i class="mask-icon aui-icon-trajectory"><span class="mask-icon-hover-tip">地图定位</span><i class="aui-icon-drop-down"></i><i>`);
                    }

                    if ($targetImg.attr("id") == "current-page-temperature") {
                        $similarity.text(Number(wrapListData.temperature).toFixed(2) + '℃'); // 右侧详情 温度节点赋值
                        $maskSlide.find('.image-flex-similarity').removeClass('hide');
                    }
                    // 点击地图定位事件
                    $findMask.find('.aui-icon-trajectory').off('click').on('click', function (evt) {
                        evt.stopPropagation();
                        $findMask.find(".aui-icon-not-through").click();

                        var type = '3';
                        if ($("#pageSidebarMenu").find(".aui-icon-monitor").parents(".sidebar-item").hasClass("active")) { //纯动态页面
                            type = '2';
                        }
                        if (type == '2') { //纯动态页面
                            $("#searchResultFlexDynamic").click();
                            var iframe = document.getElementById('search_map_iframeDynamic');
                        } else if (type == '3') {
                            $("#searchResultFlex").click();
                            var iframe = document.getElementById('search_map_iframe');
                        }
                        var $this = $selectImgWrap;
                        var px = Number($this.attr("px")),
                            xMax = 115.07808642803226,
                            xMin = 113.32223456772093,
                            py = Number($this.attr("py")),
                            yMax = 113.32223456772093,
                            yMin = 22.190483583642468;
                        if (px > xMin && px < xMax && py > yMin && py < yMax) {
                            var targetOrigin = mapUrl + 'peopleCity.html',
                                locationData = {
                                    x: parseFloat($this.attr("px")),
                                    y: parseFloat($this.attr("py")),
                                    offsetValueOfX: 0.002
                                },
                                data = {
                                    type: "locationToOffset",
                                    mydata: locationData
                                };
                            window.setTimeout(function () {
                                iframe.contentWindow.postMessage(data, targetOrigin);
                            }, 700);
                        } else {
                            warningTip.say('所选图片坐标有误');
                        }
                    });

                    // 选中图片按钮 事件绑定
                    $slideBtn.eq(0).off('click').on('click', function () {
                        var $selectCheckBox = $selectImgWrap.find('.image-checkbox-wrap'), // 动态库被点击图片 选中框节点
                            $selectCheckBoxLabel = $selectCheckBox.children(),
                            disabeldCls = $(this).hasClass('disabled'); // 按钮可用状态
                        if (disabeldCls) { // 如果按钮不可用
                            return;
                        }
                        if (!$selectCheckBoxLabel.hasClass('ui-checkboxradio-checked')) { // 动态库被点击图片 没有被选中
                            $selectCheckBox.click();
                        }
                    });
                    // 发起检索按钮 事件绑定
                    $slideBtn.eq(1).off('click').on('click', function () {
                        var $this = $(this),
                            thisLoad = $this.children().length; // 按钮子元素节点
                        if (thisLoad > 0) { // 如果按钮没有子元素节点
                            return;
                        }
                        showLoading($this);
                        if ($targetImg.attr("id") == "searchPortraitThree" || $targetImg.attr("id") == "popup-body-face-cntList" || $targetImg.attr("id") == "current-page-temperature") {
                            var $sideBar = $('#pageSidebarMenu').find('.aui-icon-carsearch2'),
                                $sideItem = $sideBar.closest('.sidebar-item'),
                                sideIndex = $sideItem.index(),
                                $contentItem = $('#content-box').find('.content-save-item').eq(sideIndex),
                                $contentUserImg = $contentItem.find('#usearchImg'),
                                url = $sideBar.parent("a").attr("lc") + "?dynamic=" + Global.dynamic;

                            $findMask.find('.aui-icon-not-through').click();
                            if ($contentUserImg.length === 0) {
                                loadPage($contentItem, url);
                            }
                            if (!$("#snapMoreTypeModal").hasClass("hide")) {
                                $("#snapMoreTypeModal").find(".aui-icon-not-through").click();
                            }
                            $sideItem.click();
                        }
                        var $usearchImg = $("#usearchImg"),
                            $dynamicsearch = $('#mergeSearch');
                        if ($("#pageSidebarMenu").find(".aui-icon-monitor").parents(".sidebar-item").hasClass("active")) {
                            $usearchImg = $("#usearchImgDynamic");
                            $dynamicsearch = $('#dynamicsearchDynamic');
                        }

                        if ($(this).parents(".swiper-slide.swiper-slide-active").find('.add-image-wrap-faceModal .add-image-item.active').length > 0) {
                            hideLoading($this);
                            var $selectDom = $(this).parents(".swiper-slide.swiper-slide-active").find('.add-image-wrap-faceModal .add-image-item.active'),
                                selectHtml = '';
                            $selectDom.each(function (index, element) {
                                var src = $(element).find('.add-image-img').attr('src');
                                selectHtml += [
                                    '<div class="add-image-item active" value="' + Math.random() + '">',
                                    '   <span class="image-tag-new">人脸小图</span><span class="image-card-mask"></span>',
                                    '   <img class="add-image-img" src="' + src + '" alt=""  title="双击可截图" picStatus="2" picId="' + $(element).find('.add-image-img').attr('picId') + '">',
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
                            $usearchImg.find('.add-image-icon').removeClass('add-image-new');
                            $usearchImg.find('.add-image-box-text').addClass('hide');
                            $usearchImg.removeClass("center");

                            $maskFixedDom.find('.aui-icon-not-through').click(); // 关闭大图弹框
                            if ($(this).parents(".swiper-slide.swiper-slide-active").find('.add-image-wrap-faceModal .add-image-item.active').length == 1) {
                                $dynamicsearch.click();
                            }
                        } else {
                            window.loadData('v2/faceDt/getImgByUrl', true, { // 根据url获取base64
                                url: wrapListData.smallPicUrl
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
                                    $usearchImg.find('.add-image-icon').removeClass('add-image-new');
                                    $usearchImg.find('.add-image-box-text').addClass('hide');
                                    $usearchImg.removeClass("center");

                                    imgDom(imgUrl, $dynamicsearch, $usearchImg, false, false, wrapListData); // 扣人脸
                                    $maskFixedDom.find('.aui-icon-not-through').click(); // 关闭大图弹框
                                }
                            });
                        }
                    });
                    // 原图检索 事件绑定
                    $slideBtn.eq(2).off('click').on('click', function () {
                        var imgUrl = $(this).parents(".swiper-slide.swiper-slide-active").find(".mask-image-box .img").attr("src");
                        var $usearchImg = $("#usearchImg"),
                            $dynamicsearch = $("#mergeSearch");
                        if ($("#pageSidebarMenu").find(".aui-icon-monitor").parents(".sidebar-item").hasClass("active")) {
                            $usearchImg = $("#usearchImgDynamic");
                            $dynamicsearch = $("#dynamicsearchDynamic");
                        }
                        if ($usearchImg.find(".add-image-img").length == 0) {
                            $usearchImg.find('.add-image-icon').removeClass('add-image-new');
                            $usearchImg.find('.add-image-box-text').addClass('hide');
                            $usearchImg.removeClass("center");
                        }

                        imgDom(imgUrl, $dynamicsearch, $usearchImg, false, true, wrapListData); // 扣人脸
                        $maskFixedDom.find('.aui-icon-not-through').click(); // 关闭大图弹框
                        showLoading($('#content-box'));
                    });
                    // 大图抠图 事件绑定
                    $slideBtn.eq(3).off('click').on('click', function () {
                        var imgUrl = $(this).parents(".swiper-slide.swiper-slide-active").find(".mask-image-box .img").attr("src"),
                            $myModal = $(this).parents(".swiper-slide.swiper-slide-active"),
                            $myModalParents = $myModal.parents(".swiper-container.mask-container");
                        if (imgUrl.indexOf("http") == 0) { //base64
                            var data = {
                                url: imgUrl,
                                platformId: $maskSlide.find(".bigMaskSelect").val(),
                                moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                                searchIndex: wrapListData.searchIndex,
                                searchId: wrapListData.searchId
                            };
                        } else {
                            var data = {
                                base64: imgUrl,
                                platformId: $maskSlide.find(".bigMaskSelect").val(),
                                moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                                searchIndex: wrapListData.searchIndex,
                                searchId: wrapListData.searchId
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
                                        $myModal.find('.case-item-faceModal .ui-checkboxradio-checkbox-label').addClass("ui-checkboxradio-checked");
                                    }
                                    faceList.forEach(v => {
                                        html += [
                                            '<div class="add-image-item active"  value="' + Math.random() + '">',
                                            '   <img class="add-image-img" title="双击可截图" src="data:image/png;base64,' + v.base64 + '" alt="" picId="' + v.staticId + '">',
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

                                    $myModal.find('.case-item-faceModal .ui-checkboxradio-checkbox-label').off("click").on("click", function () {
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
                                    $myModal.find('.add-image-wrap-faceModal').empty().append('');
                                    $myModal.find('.modal-face-num').text('(0)');
                                }
                            };
                        //判断是公安网改变地址
                        loadData(port, true, data, successFunc, '', 'POST', sourceType == 'ga' ? serviceUrlOther : '');
                    });
                    // 设置图片选中框
                    var imgWidth = $img.attr('width'),
                        imgHeight = $img.attr('height');
                    $maskSquareBox.removeClass('hide');

                    // function selectFace() {
                    //     var imgWidthDom = parseInt(imgWidth),
                    //         imgHeightDom = parseInt(imgHeight),
                    //         boxWidth = $img[0].getBoundingClientRect().width,
                    //         boxHeight = $img[0].getBoundingClientRect().height,
                    //         percentW = boxWidth / imgWidthDom,
                    //         percentH = boxHeight / imgHeightDom;
                    //     var canvas1 = $maskSlide.find('.mask-canvas-bg')[0],
                    //         canvas3 = $maskSlide.find('.mask-canvas-img')[0];
                    //     canvas1.height = boxHeight;
                    //     canvas1.width = boxWidth;
                    //     canvas3.width = 100;
                    //     canvas3.height = 100;
                    //     // 设置截图区域图片大小
                    //     $maskCropBox.find('.cropper-view-img').width(boxWidth);
                    //     $maskCropBox.find('.cropper-view-img').height(boxHeight);
                    //     $maskSquareBox.css({
                    //         "top": position.start.y * percentH,
                    //         "left": position.start.x * percentW,
                    //         "width": position.width * percentW,
                    //         "height": position.height * percentH
                    //     });
                    //     $maskSquareBox.data({
                    //         "top": position.start.y * percentH,
                    //         "left": position.start.x * percentW,
                    //         "width": position.width * percentW,
                    //         "height": position.height * percentH
                    //     });
                    // }
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
                    }, cls, bigImgUrl, {
                        index: index,
                        imgLen: imgLen
                    }, wrapListData);
                    $findMask.find('.mask-loading-box').addClass('hide');
                    hideLoading($findMask.find('.mask-loading-box'));
                }
            });
        }
    } else {
        // 保证第二次打开去除选中人脸框显示出来
        if ($selectSquareBox.hasClass('hide')) {
            $selectSquareBox.removeClass('hide');
        }
    }
    //绑定弹窗后续关闭以及左右按钮事件绑定
    if ($maskFixedDom.hasClass('hide') && !event.isTrigger) {
        $maskFixedDom.removeClass('hide');
        window.setTimeout(function () {
            $maskFixedDom.addClass('show');
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
            $maskFixedDom.find('.swiper-button-prev').addClass('hide');
        }
        if (index === thisLen - 1) {
            $maskFixedDom.find('.swiper-button-next').addClass('hide');
        }
        maskSwiper = $maskFixedDom.data().comp;
        maskSwiper.update(true);
        maskSwiper.slideTo(index, 0, true);
    } else if ($maskFixedDom.hasClass('hide') && event.isTrigger) {
        $maskFixedDom.removeClass('hide');
        window.setTimeout(function () {
            $maskFixedDom.addClass('show');
        }, 50);
        // 判断打开的时候选中图片是否为选中状态给选中
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
            $maskFixedDom.find('.swiper-button-prev').addClass('hide');
        }
        if (index === thisLen - 1) {
            $maskFixedDom.find('.swiper-button-next').addClass('hide');
        }
        maskSwiper = $maskFixedDom.data().comp;
        maskSwiper.update(true);
        maskSwiper.slideTo(index, 0, true);
    }
    // 重新修正告警弹窗中按钮信息 大图按钮初始化
    if (nowSelectImg && fixData && fixData.html) {
        var dataStatus = fixData.data.status,
            $dataBtn = $findMask.find('.swiper-slide').eq(index).find('.case-item-operate').children().eq(0);
        if (dataStatus === '1' || dataStatus === '2') {
            $dataBtn.addClass('disabled');
        }
    }
    // 修正左右箭头是否需要显示  首页大图 去掉左右切换按钮 地图弹窗实时抓拍图和告警
    if (imgLen === 1 || cls === 'warning-list-alarm' || cls === 'manage-warning-list-alarm' || cls === 'popup-body-alarm-cntList') {
        $findMask.find('.swiper-button-next').addClass('hide');
        $findMask.find('.swiper-button-prev').addClass('hide');
    }
    //绑定弹窗关闭事件
    $maskFixedDom.find('.aui-icon-not-through.bigimg').on('click', function () {
        // 因为关系还有动画效果,需要加上延迟给添加效果
        $maskFixedDom.removeClass('show');
        window.setTimeout(function () {
            $maskFixedDom.remove();
            var $maskCropBox = $maskFixedDom.find('.square-crop-box'),
                $maskCropPanel = $maskFixedDom.find('.mask-crop-panel'),
                $maskBox = $maskFixedDom.find('.square-box');
            $maskCropBox.addClass('hide');
            $maskCropPanel.addClass('hide');
            $maskBox.removeClass('hide');
            $maskFixedDom.find('.swiper-button-next').removeClass('hide');
            $maskFixedDom.find('.swiper-button-prev').removeClass('hide');
            $maskFixedDom[0].removeEventListener('contextmenu', rightMouse);
            // 按对象排序 每次需重新加载大图 清空上一个对象的缓存
            if (cls === 'all-alarm-object') {
                $('.mask-container-fixed.all-alarm-object').remove();
            }
            if (cls === 'my-alarm-object') {
                $('.mask-container-fixed.my-alarm-object').remove();
            }
        }, 300);
        // 用户登录 首页告警 只显示未处理状态
        if (cls === 'warning-list-alarm') {
            window.userLoadAlarmData();
        }
        // 管理者登录 首页告警 只显示未处理状态
        if (cls === 'manage-warning-list-alarm') {
            window.managerLoadAlarmData();
        }

        //告警 -- 最新告警
        if (fixData && fixData.socketAlarmStatus) {
            let arrList = [];
            if (socketAlarmObj.orgId || socketAlarmObj.libId) {
                arrList = socketAlarmFilterList;
            } else {
                arrList = socketAlarmList;
            }

            socketAlarmStatus = true;
            fixData.cardImg.removeClass("isclick");
            if (arrList[0].alarmId != $("#sock-alarm-time").find(".warning-item").eq(0).data().listData.alarmId) {
                sockAlarmList(arrList);
            }
        }
    });

    //弹窗查看大图和比对图片切换事件
    $maskFixedDom.find('.changeImgSearch').off().on('click', function () {
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
    $maskFixedDom.find('.onetooneSearch').off().on('click', function () {
        var src1 = $(this).parent().find(".image-flex-list.clearfix>.image-box-flex").eq(0).find(".img").attr("src"),
            src2 = $(this).parent().find(".image-flex-list.clearfix>.image-box-flex").eq(1).find(".img").attr("src");
        commonOnetooneSearch(src1, src2);
    });
}

/**
 * 大图抠图选择厂家下拉框（动态大图专用）
 * @param { Object } $maskSlide // 当前大图弹窗展示的那一页
 */
function getCj($maskSlide) {
    var port = 'v2/faceRecog/manufactors',
        successFunc = function (data) {
            hideLoading($('body'));
            if (data.code === '200') {
                var cjs = data.data, // 算法数据
                    cj_html = '';

                cjs.forEach(function (item) {
                    cj_html += `<option class="option-item" value="${item.platformId}">${item.platformName}</option>`
                })

                $maskSlide.find(".bigMaskSelect").html(cj_html);
                if (cjs.length > 0) {
                    $maskSlide.find(".bigMaskSelect").val(5);
                    $maskSlide.find(".bigMaskSelect").selectmenu();
                } else {
                    $maskSlide.find(".bigMaskSelect").val(null);
                    $maskSlide.find(".bigMaskSelect").attr("disabled", "disabled");
                    $maskSlide.find(".bigMaskSelect").selectmenu();
                }
            } else {
                warning.say(data.message);
            }
        };
    loadData(port, true, {}, successFunc, undefined, 'GET', sourceType == 'ga' ? serviceUrlOther : '');
}

/**
 * 大图右侧页面
 * @param {*} param 
 * @param {*} alarmItemData 
 */
function commonMaskRight(param, alarmItemData) {
    switch (param) {
        case 1: //地图弹窗右侧
            var $html = $([
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
                '       </div>',
                '   </div>',
                '   </div>',
                '</div>'
            ].join(''));
            break;
        case 2: //告警布控弹窗右侧   
            var btnHtml = '';
            if (alarmItemData.status == '0') {
                btnHtml = `<div class="aui-mt-md case-item-operate">	
                    <button type="button" class="btn btn-primary btn-confirm">确认</button>
                    <button type="button" class="btn btn-false">误报</button>
                    <button type="button" class="btn btn-search">发起检索</button>
                </div>`
            } else if (alarmItemData.status == '1') {
                btnHtml = `<div class="aui-mt-md case-item-operate">	
                <button type="button" class="btn btn-primary btn-confirm disabled">已命中</button>
                <button type="button" class="btn btn-search">发起检索</button>
            </div>`
            } else if (alarmItemData.status == '2') {
                btnHtml = `<div class="aui-mt-md case-item-operate">	
                <button type="button" class="btn btn-primary btn-confirm disabled">已误报</button>
                <button type="button" class="btn btn-search">发起检索</button>
            </div>`
            }
            var $html = `<div class="aui-col-6">
                            <div class="control-info-box">
                                <div class="image-flex-list clearfix control-imge-list">
                                    <div class="image-box-flex">
                                        <span class="image-tag">布控原图</span>
                                        <img class="img" src="${alarmItemData.url}" alt="">
                                    </div>
                                    <div class="image-box-flex">
                                        <span class="image-tag">告警图片</span>
                                        <img class="img" src="${alarmItemData.smallHttpUrl}" alt="">
                                    </div>
                                    <span class="image-flex-similarity"><span class="primary">${alarmItemData.threshold ? alarmItemData.threshold + '%' : '0%'}</span></span>
                                </div>
                                <ul class="aui-mt-md">
                                    <li class="border-bottom control-info-top">
                                        <p class="text-md text-bold">镜头信息：</p>
                                        <ul class="aui-row form-info form-label-fixed form-label-long aui-mt-xs">
                                            <li class="aui-col-24">
                                                <div class="form-group">
                                                    <label class="aui-form-label">镜头所属机构：</label>
                                                    <div class="form-text">${alarmItemData.orgName ? alarmItemData.orgName : '未知'}</div>
                                                </div>
                                            </li>
                                            <li class="aui-col-24">
                                                <div class="form-group">
                                                    <label class="aui-form-label">镜头国标编码：</label>
                                                    <div class="form-text">${alarmItemData.gbCode ? alarmItemData.gbCode : '未知'}</div>
                                                </div>
                                            </li>
                                            <li class="aui-col-24">
                                                <div class="form-group">
                                                    <label class="aui-form-label">镜头名称：</label>
                                                    <div class="form-text">${alarmItemData.cameraName ? alarmItemData.cameraName : '未知'}</div>
                                                </div>
                                            </li>
                                            <li class="aui-col-24">
                                                <div class="form-group">
                                                    <label class="aui-form-label">抓拍时间：</label>
                                                    <div class="form-text">${alarmItemData.alarmTime ? alarmItemData.alarmTime : '未知'}</div>
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
                                                    <div class="form-text">${alarmItemData.name ? alarmItemData.name : '未知'}</div>
                                                </div>
                                            </li>
                                            <li class="aui-col-24">
                                                <div class="form-group">
                                                    <label class="aui-form-label">身份证号：</label>
                                                    <div class="form-text copySelect">${alarmItemData.idcard ? alarmItemData.idcard : '未知'}</div>
                                                </div>
                                            </li>
                                            <li class="aui-col-24">
                                                <div class="form-group">
                                                    <label class="aui-form-label">来源库：</label>
                                                    <div class="form-text">${alarmItemData.libName ? alarmItemData.libName : '未知'}</div>
                                                </div>
                                            </li>
                                            <li class="aui-col-24">
                                                <div class="form-group">
                                                    <label class="aui-form-label">布控事由：</label>
                                                    <div class="reason-box">${alarmItemData.reason ? alarmItemData.reason : '无'}</div>
                                                </div>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                                ${btnHtml}
                            </div>
                        </div>`;
            break;
        default:
            var $html = $(['<div class="aui-col-6">',
                '           <div class="mask-info-box">',
                '           <div class="image-flex-list clearfix control-imge-list">',
                '               <div class="image-box-flex">',
                '                   <span class="image-tag">检索图片</span>',
                '                   <img class="img" />',
                '               </div>',
                '               <div class="image-box-flex">',
                '                   <span class="image-tag">抓拍图片</span>',
                '                   <img class="img" />',
                '               </div>',
                '               <span class="image-flex-similarity"><span class="primary"></span></span>',
                '           </div>',
                '           <button type="button" class="btn btn-primary btn-confirm changeImgSearch disabled hide">横向比对</button>',
                '           <button type="button" class="btn btn-primary btn-confirm onetooneSearch disabled">1:1识别</button>',
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
                '               <button type="button" class="btn btn-primary btn-confirm hide">选中图片</button>',
                '               <button type="button" class="btn btn-primary btn-confirm">发起检索</button>',
                '               <button type="button" class="btn btn-primary btn-confirm hide">原图检索</button>',
                '               <button type="button" class="btn btn-primary btn-confirm">大图抠图</button>',
                '               <select name="type" class="bigMaskSelect">',
                '               </select> ',
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
                '               <div class="add-image-wrap-faceModal add-type-3">',
                '               </div>',
                '           </div>',
                '       </div>',
                '   </div>'
            ].join(""));
    }
    return $html;
}

// 右键点击大图 查看大图数据先行设置 通用右键函数模板
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
        '   <li class="mask-camera-item">大图另存</li>',
        '   <li class="mask-camera-item">地图定位</li>',
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
            $maskCrop = $activeSlide.find('.aui-icon-screen'),
            $maskLocate = $activeSlide.find('.aui-icon-trajectory');
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
        if (menuIndex === 5) {
            var imgUrl = $(".swiper-slide.swiper-slide-active").find(".mask-image-box .img").attr("src");
            if (imgUrl.indexOf("http") == 0) {
                var portData = {
                    'url': imgUrl
                };
            } else {
                var portData = {
                    'base64': imgUrl
                };
            }
            var port = 'v2/file/exportFileToCache',
                successFunc = function (data) {
                    if (data.code == '200') {
                        var post_url = serviceUrl + '/v2/file/exportFile?downId=' + data.downId + '&token=' + $.cookie('xh_token');
                        if ($("#IframeReportImg").length === 0) {
                            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
                        }
                        $('#IframeReportImg').attr("src", post_url);
                    } else {
                        warningTip.say(data.message);
                    }
                };
            loadData(port, true, portData, successFunc);
        }
        if (menuIndex === 6) {
            $maskLocate.click();
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

/**
 * 截图功能拆分
 * @param { Object } $domBox     // 弹窗节点、弹窗中滑块节点、检索页面图片节点集合
 * @param { String } cls         // 特定类名 区别不同弹窗
 * @param { String } dataImg     // 弹窗大图的base64
 * @param { Object } indexBox    // 当前节点索引、滑块节点长度集合
 */
function maskImgCrop($domBox, cls, dataImg, indexBox, wrapListData) {
    var $maskSlide = $domBox.maskSlide,
        $findMask = $domBox.findMask,
        $targetImg = $domBox.targetImg,
        index = indexBox.index,
        imgLen = indexBox.imgLen;
    // 截屏公共函数, 为了将png格式图片转化成base64格式(如果图片不是base64，需要画布2转换数据)
    function cropImg(canvas1, oMark, canvas3, src) {
        var cxt1 = canvas1.getContext('2d');
        var img = new Image();
        img.src = src;
        var srcX = $(oMark).position().left;
        var srcY = $(oMark).position().top;
        var sWidth = oMark.offsetWidth;
        var sHeight = oMark.offsetHeight;
        var canvas2 = document.createElement('canvas'); // 新建画布2
        var cxt2 = canvas2.getContext('2d'); // 画布2类型
        img.onload = function () {
            cxt1.drawImage(img, 0, 0, canvas1.width, canvas1.height); // 向画布1上绘制图像 原始大小图像画布
            var dataImg = cxt1.getImageData(srcX, srcY, sWidth, sHeight); // 复制画布框选区域 像素数据 即base64格式数据
            canvas2.width = sWidth;
            canvas2.height = sHeight;
            cxt2.putImageData(dataImg, 0, 0, 0, 0, canvas2.width, canvas2.height); // 把数据绘制到画布2上
            var img2 = canvas2.toDataURL('image/png');
            var cxt3 = canvas3.getContext('2d');
            var img3 = new Image();
            img3.src = img2;
            img3.onload = function () {
                cxt3.drawImage(img3, 0, 0, canvas3.width, canvas3.height); // 向画布3上绘制base64图像
            }
        }
    }
    // 绑定弹窗拖拽事件
    $maskSlide.find('.mask-image-box').on('mousedown', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var $this = $(this),
            baseWidth = $this.outerWidth(),
            baseHeight = $this.outerHeight(),
            $swiperBox = $this.closest('.swiper-slide'),
            swiperWidth = $this.outerWidth(),
            swiperHeight = $this.outerHeight(),
            offsetTop = $this.offset().top, // 弹框top
            offsetLeft = $this.offset().left, // 弹框left
            pageX = evt.pageX - offsetLeft, // 相对弹框的鼠标点击位置
            pageY = evt.pageY - offsetTop;
        // 如果图片有放大功能，图片大小超过弹框大小，改变截图范围为弹框大小
        if (baseWidth > swiperWidth) {
            baseWidth = swiperWidth;
            baseHeight = baseHeight;
        }
        var cropHide = $this.find('.square-crop-box').hasClass('hide'), // 截图盒子
            cropPanel = $this.find('.mask-crop-panel').hasClass('hide'); // 遮罩层
        if (!cropHide || cropPanel) {
            return;
        }
        // 设置截图框起始位置 以及最小值
        $this.find('.square-crop-box').css({
            top: pageY,
            left: pageX,
            width: 1,
            height: 1
        });
        $(document).on('mousemove.mask.' + cls, function (e) {
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
            // 设置画布3的大小
            $this.find('.mask-canvas-img')[0].width = width;
            $this.find('.mask-canvas-img')[0].height = height;
            $this.find('.square-crop-box .cropper-view-img').css({
                marginTop: -top,
                marginLeft: -left
            });
            $this.find('.mask-crop-panel').removeClass('hide');
        });
        $(document).on('mouseup.mask.' + cls, function (e) {
            e.stopPropagation();
            e.preventDefault();
            var width = $this.find('.square-crop-box').width(),
                height = $this.find('.square-crop-box').height(),
                top = $this.find('.square-crop-box').position().top,
                left = $this.find('.square-crop-box').position().left,
                limitWidth = $this.closest('.swiper-slide').outerWidth(),
                limitHeight = $this.closest('.swiper-slide').outerHeight();
            var $maskClose = $findMask.find('.aui-icon-close'),
                $maskFooter = $findMask.find('.mask-icon-box'),
                $maskNext = $findMask.find('.swiper-button-next'),
                $maskPrev = $findMask.find('.swiper-button-prev'),
                $maskCamera = $findMask.find('.aui-icon-video3');
            if (width < 5 || height < 5) { // 框选区域过小 不进行截图操作
                $this.find('.square-crop-box').addClass('hide');
                $this.find('.square-crop-tool').addClass('hide');
                $this.find('.mask-crop-panel').addClass('hide');
                $this.find('.square-box').removeClass('hide');
                $maskClose.removeClass('hide');
                $maskFooter.removeClass('hide');
                $maskNext.removeClass('hide');
                $maskPrev.removeClass('hide');
                $maskCamera.removeClass('hide');
                // 判定当前选择节点是否为极端值
                if (index === 0) {
                    $maskPrev.addClass('hide');
                }
                if (index === imgLen - 1) {
                    $maskNext.addClass('hide');
                }
            } else {
                // 隐藏其他额外节点
                $maskClose.addClass('hide');
                $maskFooter.addClass('hide');
                $maskNext.addClass('hide');
                $maskPrev.addClass('hide');
                $maskCamera.addClass('hide');
                // 刷新当前canvas位置
                var canvas1 = $this.find('.mask-canvas-bg')[0],
                    oMark = $this.find('.square-crop-box')[0],
                    canvas3 = $this.find('.mask-canvas-img')[0];
                cropImg(canvas1, oMark, canvas3, dataImg);
                $this.find('.square-crop-tool').removeClass('hide');
                // 确认截屏框删除按钮事件绑定
                $this.find('.square-crop-tool').children().eq(0).off('click').on('click', function () {
                    $this.find('.mask-crop-panel').addClass('hide');
                    $this.find('.square-box').removeClass('hide');
                    $this.find('.square-crop-box').addClass('hide');
                    $this.find('.square-crop-tool').addClass('hide');
                    $maskClose.removeClass('hide');
                    $maskFooter.removeClass('hide');
                    $maskNext.removeClass('hide');
                    $maskPrev.removeClass('hide');
                    $maskCamera.removeClass('hide');
                    // 判定当前选择节点是否为极端值
                    if (index === 0) {
                        $maskPrev.addClass('hide');
                    }
                    if (index === imgLen - 1) {
                        $maskNext.addClass('hide');
                    }
                });
                // 确认截屏框确认按钮事件绑定
                $this.find('.square-crop-tool').children().eq(1).off('click').on('click', function () {
                    //$targetImg.attr("id") === 'searchPortraitThree'  代表是从对象动态库进来的
                    if ($targetImg === null || $targetImg.attr("id") === 'searchPortraitThree' || $targetImg.attr("id") === 'popup-body-face-cntList' || $targetImg.attr("id") === 'current-page-temperature') {
                        $findMask.find('.aui-icon-not-through').click();
                        $('body').find('.modal-backdrop.show').addClass('hide');
                        $findMask[0].removeEventListener('contextmenu', rightMouse);
                        var $barItem = $('#pageSidebarMenu .aui-icon-carsearch2').closest('.sidebar-item'),
                            barIndex = $barItem.index(),
                            $saveItem = $('#content-box').children().eq(barIndex),
                            $userImg = $saveItem.find('#usearchImg'),
                            url = $('#pageSidebarMenu .aui-icon-carsearch2').parent("a").attr("lc") + "?dynamic=" + Global.dynamic;
                        var $usearchImg = $saveItem.find('#usearchImg');
                        if ($("#pageSidebarMenu").find(".aui-icon-monitor").parents(".sidebar-item").hasClass("active")) {
                            $usearchImg = $saveItem.find("#usearchImgDynamic");
                        }
                        $barItem.addClass('active').siblings().removeClass('active');
                        $saveItem.removeClass('hide').siblings().addClass('hide');
                        $('#content-box').removeClass('display-none');
                        $('#controlDetailPage').addClass('display-none');
                        if ($usearchImg.length === 0) {
                            $('#imgBase64').data({
                                'base64': canvas3.toDataURL('image/png'),
                                'searchAlarm': true
                            });
                            $saveItem.empty();
                            loadPage($saveItem, url);
                        } else {
                            var $addImg = $usearchImg.find('.add-image-item');
                            if ($addImg.length === 0) {
                                $('#imgBase64').data({
                                    'base64': canvas3.toDataURL('image/png'),
                                    'searchAlarm': true
                                });
                                $saveItem.empty();
                                $usearchImg.find(".add-image-icon").removeClass("add-image-new");
                                loadPage($saveItem, url);
                            } else {
                                addSearchImg(canvas3.toDataURL('image/png'));
                            }
                        }
                        // 自动搜索图片
                        window.setTimeout(function () {
                            $findMask.modal('hide');
                        }, 100)
                    } else {
                        if ($targetImg[0].id === 'peerAddSearchImg') {
                            var insertHtml = `
                            <div class="add-image-item">
                                <div class="image-checkbox-wrap">
                                    <label class="ui-checkboxradio-checkbox-label ui-checkboxradio-label ui-button ui-widget" style="margin: 0!important; left:0;">
                                        <span class="ui-checkboxradio-icon  ui-icon ui-icon-background ui-icon-blank"></span>
                                    </label>
                                </div>
                                <img class="add-image-img" src="${canvas3.toDataURL('image/png')}" alt="">
                                <i class="aui-icon-delete-line"></i>
                            </div> 
                            `;
                            $targetImg.find('.add-image-icon').before(insertHtml);
                            var $imgItem = $targetImg.find('.add-image-item');
                        } else {
                            var insertHtml = `
                            <div class="add-image-item active" value="${Math.random()}">
                                <img class="add-image-img" src="${canvas3.toDataURL('image/png')}" alt="">
                                <i class="aui-icon-delete-line"></i>
                            </div> 
                            `;
                            $targetImg.find('.add-image-icon').before(insertHtml);
                            var $imgItem = $targetImg.find('.add-image-item');
                            $imgItem.removeClass('active').eq(-1).addClass('active');
                            if ($imgItem.length > 0) {
                                $targetImg.removeClass('center');
                                $targetImg.find(".add-image-icon").removeClass('add-image-new');
                                $targetImg.find('.add-image-box-text').addClass('hide');
                            }
                        }
                        if ($imgItem.length > 5) {
                            $targetImg.removeClass('scroll');
                            var clientH = $targetImg[0].clientHeight;
                            $targetImg.addClass('scroll');
                            $targetImg.animate({
                                'scrollTop': clientH
                            }, 500);
                        }

                        if (!$('.layout-type3.search-path').hasClass('display-none')) {
                            $('.layout-type3.search-path').addClass('display-none').siblings('.layout-type3').removeClass('display-none');
                            $('#selectAllSnapping').find('.ui-checkboxradio-checked').removeClass('ui-checkboxradio-checked');
                        }
                        $maskClose.removeClass('hide');
                        $maskFooter.removeClass('hide');
                        $maskNext.removeClass('hide');
                        $maskPrev.removeClass('hide');
                        // 判定当前选择节点是否为极端值
                        if (index === 0) {
                            $maskPrev.addClass('hide');
                        }
                        if (index === imgLen - 1) {
                            $maskNext.addClass('hide');
                        }
                        $maskCamera.removeClass('hide');
                        $this.find('.square-box').removeClass('hide');
                        $maskClose.click();

                        // 大图抠图
                        if ($("#pageSidebarMenu").find(".aui-icon-left-personnal-retrieval").parents(".sidebar-item").hasClass("active")) {
                            imgDom(canvas3.toDataURL('image/png'), $('#staticSearch'), $("#searchImgS"));
                            // $('#staticSearch').click(); // 截图后自动检索
                        } else if ($("#pageSidebarMenu").find(".aui-icon-monitor").parents(".sidebar-item").hasClass("active")) {
                            imgDom(canvas3.toDataURL('image/png'), $('#dynamicsearchDynamic'), $("#usearchImgDynamic"), false, false, wrapListData);
                            // $('#dynamicsearchDynamic').click(); // 截图后自动检索
                        } else if ($("#pageSidebarMenu").find(".aui-icon-carsearch2").parents(".sidebar-item").hasClass("active")) {
                            imgDom(canvas3.toDataURL('image/png'), $('#mergeSearch'), $("#usearchImg"), false, false, wrapListData);
                            // $('#mergeSearch').click(); // 截图后自动检索
                        }
                        $findMask.find('.aui-icon-not-through').click();
                    }
                });
                // 给截屏区域添加移动拖拽事件
                $this.find('.cropper-view-box').off('mousedown').on('mousedown', function (event) {
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
                        cropImg(canvas1, oMark, canvas3, dataImg);
                        $(document).off('mousemove.cropper.view.box mouseup.cropper.view.box');
                    });
                });
                // 给截图框边框添加拖拽事件
                $this.find('.cropper-line').off('mousedown').on('mousedown', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    var thisCls = $(this).attr('class'),
                        $box = $(this).closest('.square-crop-box'),
                        $canvasImg = $(this).closest('.mask-image-box').find('.mask-canvas-img')[0], // 画布3
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
                            $canvasImg.width = width;
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

                            $canvasImg.height = height;
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
                            $canvasImg.width = width;
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
                            $canvasImg.height = height;
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
                        cropImg(canvas1, oMark, canvas3, dataImg);
                        $(document).off('mousemove.cropper.line mouseup.cropper.line');
                    });
                });
                // 给截图框边框四个角落拖拽事件
                $this.find('.cropper-point').off('mousedown').on('mousedown', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    var thisCls = $(this).attr('class'),
                        $box = $(this).closest('.square-crop-box'),
                        $canvasImg = $(this).closest('.mask-image-box').find('.mask-canvas-img')[0], // 画布3
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
                            $canvasImg.width = width;
                            $canvasImg.height = height;
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
                            $canvasImg.width = width;
                            $canvasImg.height = height;
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
                            $canvasImg.width = width;
                            $canvasImg.height = height;
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
                            $canvasImg.width = width;
                            $canvasImg.height = height;
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
                        cropImg(canvas1, oMark, canvas3, dataImg);
                        $(document).off('mousemove.cropper.point mouseup.cropper.point');
                    });
                });
                // 判定拖拽位置
                var $tool = $this.find('.square-crop-box').find('.square-crop-tool');
                if ((top + height > limitHeight - 50) && top > 50) {
                    $this.find('.square-crop-box').prepend($tool.addClass('change'));
                } else if (top + height < limitHeight - 50) {
                    $this.find('.square-crop-box').append($tool.removeClass('change'));
                } else if ((top + height > limitHeight - 50) && top < 50) {
                    $this.find('.square-crop-box').append($tool.addClass('change'));
                }
            }
            $(document).off('mousemove.mask.' + cls + ' mouseup.mask.' + cls);
        });
    });
}

/**
 * 视频播放功能
 * @param {*} d 
 */
function times(d) {
    if (d < 10) {
        return '0' + d;
    } else {
        return d;
    }
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
            // 调用客户端的方法进行跳转并播放
            callHostFunction.callReplayFunctionEx(id, start, end);
        } catch (e) {
            warningTip.say("请在客户端中进行播放！") && window.parent.p_alert("请在客户端中进行播放！");
        }
    }
    //播放功能 跳转到客户端的视频监控模块进行播放  id是镜头id
    function playrealtimeVideo(id) {
        try {
            // 调用客户端的方法进行跳转并播放
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

// 关闭大图弹框 点击确认误报之后 如果关闭告警大图 刷新告警列表
function closeCreateBigImgMask() {
    $('.mask-container-fixed.my-alarm-time .aui-icon-not-through').on('click', function () {
        getFilterData(getFilterTagData(), undefined, undefined, '2');
    })
    $('.mask-container-fixed.all-alarm-time .aui-icon-not-through').on('click', function () {
        getFilterData(getFilterTagData(), undefined, undefined, '2');
    })
    $('.mask-container-fixed.my-alarm-object .aui-icon-not-through').on('click', function () {
        getFilterData(getFilterTagData(), undefined, undefined, '1');
    })
    $('.mask-container-fixed.all-alarm-object .aui-icon-not-through').on('click', function () {
        getFilterData(getFilterTagData(), undefined, undefined, '1');
    })
    $('.mask-container-fixed.BKContorl .aui-icon-not-through').on('click', function () { //加一个告警大图弹窗点击命中和误报请求成功关闭弹窗时，刷新我的告警和全部告警列表
        getFilterData(getFilterTagData());
    })
    $('.mask-container-fixed.all-alarm-time-sort .aui-icon-not-through').on('click', function () {
        getFilterDataNew(getFilterTagDataNew(), undefined, undefined, '2');
    })
    $('.mask-container-fixed.all-alarm-object-sort .aui-icon-not-through').on('click', function () {
        getFilterDataNew(getFilterTagDataNew(), undefined, undefined, '1');
    })
    $('.mask-container-fixed.all-alarm-time-sus .aui-icon-not-through').on('click', function () {
        window.getAllAlarmInfoSus();
    })
}

/************************* 检索 其他模块 大图公共方法 end *************************/
/************************* 检索 其他模块 地图公共方法 start *************************/
/**
 * 轨迹分析 地图弹框
 * @param {Array} option 动态检索 所有被选中的数据
 * @param {Object} iframeId 地图框元素
 */
function createMapFn(option, iframeId) {
    var iframe = document.getElementById(iframeId);
    var newdata = newListFn(option);
    var targetOrigin = mapUrl + 'peopleCity.html',
        data = {
            type: "peopleTrak",
            dataType: iframeId,
            mydata: newdata
        };
    if (newdata.length >= 0) {
        iframe.contentWindow.postMessage(data, targetOrigin);
    } else {
        warningTip.say('所选图片坐标有误');
    }
}

/**
 * 轨迹 给地图传数据 按摄像机地点聚合
 * @param {Array} arr 动态检索 所有被选中的数据
 */
function newListFn(arr) {
    var newArr = [];
    arr.forEach(element => {
        var index = -1,
            flag = newArr.some((newAddress, j) => {
                if (newAddress.name && element.cameraName === newAddress.name) {
                    index = j;
                    return true;
                }
            }),
            // 地图交互数据 地图点击传回的数据和mapGuid的数据一样
            mapGuid = {
                imgData: element.picId || element.smallHttpUrl,
                position: element.facePosition || element.vertices,
                cameraTime: element.captureTime || element.alarmTime,
                cameraId: element.cameraId,
                longCameraId: element.longCameraId,
                cameraName: element.cameraName,
                gbCode: element.gbCode || element.gbcode,
                faceUrl: element.smallPicUrl || element.smallHttpUrl, // 小图url
                bigUrl: element.bigPicUrl || element.bigHttpUrl,
                score: element.similarity || element.threshold,
                temperature: element.temperature || '0℃',
                orgName: element.orgName,
                url: element.url,
                smallHttpUrl: element.smallPicUrl || element.smallHttpUrl, // 小图url
                status: element.status,
                libName: element.libName,
                idcard: element.idcard,
                name: element.name,
                comments: element.comments
            };
        if (!flag) {
            var px = Number(element.px),
                xMax = 115.07808642803226,
                xMin = 113.32223456772093,
                py = Number(element.py),
                yMax = 113.32223456772093,
                yMin = 22.190483583642468;
            if (px > xMin && px < xMax && py > yMin && py < yMax) {
                newArr.push({
                    x: element.px,
                    y: element.py,
                    name: element.cameraName,
                    content: [{
                        time: element.captureTime || element.alarmTime,
                        imgurl: element.smallPicUrl || element.smallHttpUrl,
                        imgGuid: mapGuid
                    }]
                })
            }
        } else {
            newArr[index].content.push({
                time: element.captureTime || element.alarmTime,
                imgurl: element.smallPicUrl || element.smallHttpUrl,
                imgGuid: mapGuid
            })
        }
    });
    newArr.forEach(function (item) {
        item.times = item.content.length;
    })
    return newArr;
}

// 向子页面传输网址 树文件中调用
function sendMapData(iframe) {
    cameraOnload();
}

function cameraOnload() {
    function send(arr) {
        var iframe = document.getElementById('map_iframe');
        var targetOrigin = mapUrl + 'peopleCity.html';
        var data = {
            type: "peopleTrak",
            mydata: arr
        };
        iframe.contentWindow.postMessage(data, targetOrigin);
    }
    //收缩
    $('.js-search_rlist').on('click', '.js-up_or_down', function () {
        var i = $(this).children('i');
        if (i.hasClass('lnr-chevron-down')) {
            i.removeClass('lnr-chevron-down').addClass('lnr-chevron-up');
            $(this).closest('p').siblings('.css-ku-search_list').slideUp(200);
        } else {
            i.removeClass('lnr-chevron-up').addClass('lnr-chevron-down');
            $(this).closest('p').siblings('.css-ku-search_list').slideDown(200);
        }
    });
    //展开和收缩地图
    $('.js-show-map').on('click', 'font', function () {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
        } else {
            $(this).addClass('active');
        }
    })
    $('.js-kuname_show').on('mouseover', 'li', function () {
        if ($(this).html().indexOf('div') == -1) {
            var html = `<div class="css-mc">
                <span class="css-add js-add" title="添加到轨迹"></span>
                <span class="css-big js-big" title="查看大图"></span>
                <span class="css-xq js-xq" title="二次检索"></span>
                <span class="css-dt js-dt" title="跳转到静态识别"></span>
            </div>`;
            $(this).append(html);
        }
    })
    $('.js-kuname_show').on('mouseleave', 'li', function () {
        $(this).find('div').remove();
    })
    $('.js-change-one').click(function () {
        var day = new Date();
        time2 = day.getFullYear() + '-' + times(day.getMonth() + 1) + '-' + times(day.getDate()) + ' ' + times(day.getHours()) + ':' + times(day.getMinutes()) + ':' + times(day.getSeconds());
        var days = Number($(this).attr('data-time'));
        day.setDate(day.getDate() - days);
        var d = new Date(day.toString()),
            time1 = d.getFullYear() + '-' + times(d.getMonth() + 1) + '-' + times(d.getDate()) + ' ' + times(d.getHours()) + ':' + times(d.getMinutes()) + ':' + times(d.getSeconds());
        $('#datetimeStart').val(time1);
        $('#datetimeEnd').val(time2);
        $(this).addClass('on').siblings('span').removeClass('on');
    })
    $('.js-change-one').eq(1).trigger('click');
    //左下边搜索
    $('.js-sure').click(function () {
        if ($('.js-show-morepic').find('.js-check-more:checked').length == 0) {
            warning.say('请选择上传图片');
            return;
        }
        if ($('#datetimeStart').val() == '' && $('#datetimeEnd').val() == '') {
            warning.say('时间填写不完整');
            return;
        }
        if ($('.js_show_party_selector').val() == '') {
            warning.say('请选择地区');
            return;
        }
        var img = $('.js-show-morepic').find('.js-check-more:checked').siblings('img').attr('src'),
            arr = $('.js_show_party_selector').attr('data-id').substring(0, $('.js_show_party_selector').attr('data-id').length - 1).split(','),
            videos = [],
            state = $('.js-change-cames').attr('data-state');
        if (state == 'list') {
            $('.js-changed-camera li').each(function () {
                videos.push($(this).data('gb_code'));
            })
        } else {
            $('.js-changed-cameramap li').each(function () {
                videos.push($(this).data('gb_code'));
            })
        }
        var data = {
            base64Img: img,
            threshold: $('.js-show_sz').text().replace('%', ''),
            startTime: $('#datetimeStart').val(),
            endTime: $('#datetimeEnd').val(),
            videoGroups: arr,
            videos: videos,
            page: 1,
            number: 20
        };
        leftsearch(data);
    })
    //摄像头机构树展开
    $('.js-allcam-list').on('click', '.js-zk-list', function () {
        var _this = $(this);
        if (_this.hasClass('glyphicon-triangle-right')) {
            _this.removeClass('glyphicon-triangle-right').addClass('glyphicon-triangle-bottom');
            _this.siblings('ul').slideDown(80);
        } else {
            _this.removeClass('glyphicon-triangle-bottom').addClass('glyphicon-triangle-right');
            _this.siblings('ul').slideUp(80);
        }
    })
    //选择摄像头
    $('.js-allcam-list').on('click', '.js-click-checked', function () {
        var _this = $(this),
            span = _this.closest('span').siblings('.css-icon-camera');
        if (_this.is(':checked')) {
            _this.closest('span').siblings('.css-icon-camera').addClass('on');
            if ($('.js-changed-camera').html().indexOf(_this.attr('data-gb_code')) > -1) {
                warning.say('已存在');
                return;
            }
            var html = `<li data-gb_code="${_this.attr('data-gb_code')}">
                    <span class="css-icon-camera"><font></font>${span.text()}</span>
                    <span class="css-remove js-remove">&times;</span>
                    </li>`;
            $('.js-changed-camera').append(html);
        } else {
            _this.closest('span').siblings('.css-icon-camera').removeClass('on');
            var id = _this.data('gb_code');
            $('.js-changed-camera li').each(function () {
                if ($(this).data('gb_code') == id) {
                    $(this).remove();
                }
            })
        }
        $('#js-camera-totle').text($('.js-changed-camera li').length);
    })
    //右边删除
    $('.js-changed-camera').on('click', '.js-remove', function () {
        var _this = $(this).closest('li'),
            id = _this.data('gb_code');
        $('.js-allcam-list input').each(function () {
            if ($(this).data('gb_code') == id) {
                $(this).prop('checked', false);
                $(this).closest('span').siblings('.css-icon-camera').removeClass('on');
                _this.remove();
            }
        });
        $('#js-camera-totle').text($('.js-changed-camera li').length);
    })
    $('.js-removemap-all').on('click', function () {
        $('.js-changed-cameramap').empty()
    })
    $('.js-changed-cameramap').on('click', '.js-remove', function () {
        var _this = $(this).closest('li');
        _this.remove();
        $('.js-cameramap-totle').text($('.js-changed-camera li').length);
    })
    //搜索摄像机
    $('.js-camera-search').on('click', function () {
        var val = $('.js-cameraname').val();
        if (val.replace(/\s/g, '') == '') {
            $('.js-search_camera').addClass('none').siblings().removeClass('none');
            return;
        }
        var port = 'faceDt/getCameraByParams',
            data = {
                cameraname: val
            },
            successFunc = function (data) {
                if (data.code == '000') {
                    var list = data.list,
                        html = '';
                    list.forEach(camera => {
                        html += `<li>
                        <span><input type="checkbox" class="js-click-checked" data-gb_code="${camera.gb_code}"></span>
                        <span class="css-icon-camera" title="${camera.cameraname}"><font></font>${camera.cameraname}</span>
                        </li>`;
                    });
                    $('.js-search_camera').empty().append(html);
                    $('.js-search_camera').removeClass('none').siblings().addClass('none');
                } else {
                    warning.say(data.msg);
                }
            };
        loadData(port, true, data, successFunc);
    })
    // 弹出摄像机窗口
    $('.js-change-cames').click(function () {
        $('#camera_list').modal('show');
    });
    // 确认选择摄像机
    $('.js-sure-camera').click(function () {
        $('.js-change-cames').val(`共选择${$('#js-camera-totle').text()}台摄像机`).attr('data-state', 'list');
        $('#camera_list').modal('hide');
    })
    $('.js-suremap-camera').click(function () {
        $('.js-change-cames').val(`共选择${$('.js-cameramap-totle').text()}台摄像机`).attr('data-state', 'map');
        $('#kx_camera_list').modal('hide');
    })
    $('.js-qh-list').on('click', function () {
        $('.layui-layer-dialog').show();
        $('.layui-layer-shade').show();
        $('#kx_camera_list').modal('hide');
        $('.js-changed-cameramap').empty();
        $('.js-change-cames').attr('data-state', 'list');
        $('.js-changed-camera').empty();
        $('.js-orgcam-list').find('.on').removeClass('on');
        $('.js-orgcam-list').find('.js-click-checked').prop('checked', false);
    });
    (function () {
        var arr1 = [],
            arr2 = [],
            html = '';
        $('.js-orgcam-list').on('click', '.css-icon-big', function () {
            var $this = $(this);
            cameraData($this);
        })
        $('.js-orgcam-list').on('click', '.css-icon-name', function () {
            var $this = $(this);
            cameraData($this);
        })
        $('.js-orgcam-list').on('click', '.css-icon-pcs', function () {
            var $this = $(this);
            cameraData($this);
        })
        // 右边清空
        $('.css-list-right').on('click', '.js-remove-all', function () {
            emptyCamera();
        })
        // 点击关闭已选镜头
        $('.js-changed-camera').on('click', '.aui-icon-not-through', function () {
            var $this = $(this),
                text = $this.siblings('.camera-item-text').text();
            // 清理数组arr1里面数据
            for (var i = 0; i < arr1.length; i++) {
                if (arr1[i] == text) {
                    arr1.splice(i, 1);
                }
            }
            // 清理数组arr2里面数据
            for (var i = 0; i < arr2.length; i++) {
                if (arr2[i] == text) {
                    arr2.splice(i, 1);
                }
            }
            createCamera();
        })
        // 拼接右侧已选镜头
        function createCamera() {
            for (var i = 0; i < arr2.length; i++) {
                html += `<li class="changed-camera-item">
                            <span class="camera-item-text">${arr2[i]}</span>
                            <i class="aui-icon-not-through"></i>
                        </li>`;
            }
            $('.js-changed-camera').html(html);
            html = '';
        }
        // 遍历数组arr1，把不相同数据放入数组arr2
        function cameraData(jq) {
            arr1.push(jq.text());
            for (var i = 0; i < arr1.length; i++) {
                if (arr2.indexOf(arr1[i]) < 0) {
                    arr2.push(arr1[i]);
                }
            }
            createCamera();
        }
        // 清空右侧已选镜头
        function emptyCamera() {
            arr1 = [];
            arr2 = [];
            createCamera();
        }
    })()
    //接收地图发来的镜头
    window.addEventListener('message', function (event) {
        if (event.data !== 'initMap' && event.data !== 'initMap?' && event.data !== 'initMap?44031' && !event.data.imgs && !event.data.info) {
            if (event.data[0].id && event.data[0].id == "map_iframe") {
                // 根据返回回来的镜头id请求回机构
                var $layer = event.currentTarget.$leftWrap.closest('.layui-layer-dialog'),
                    iframe = event.currentTarget.$leftWrap.find('#map_iframe')[0],
                    $node = $layer.data().node,
                    layerComp = $node.data().comp,
                    layerVal = layerComp._getSaveVal(),
                    list = event.data,
                    cameraIDArr = [];
                if (!(list instanceof Array)) {
                    return;
                }
                for (var i = 0; i < list.length; i++) {
                    cameraIDArr.push(list[i].guid);
                }
                $.unique(cameraIDArr);
                window.loadData('faceDt/getCameraOrg', true, {
                    cameraids: cameraIDArr
                }, function (data) {
                    if (data.code === '000') {
                        var listArr = data.list;
                        // 判定选中的镜头 是否已经在列表中存在
                        for (var i = 0; i < listArr.length; i++) {
                            var isSave = false;
                            for (var j = 0; j < layerVal.length; j++) {
                                if (layerVal[j].id === listArr[i].orgid) {
                                    isSave = true;
                                }
                                if (layerVal[j].children) {
                                    for (var k = 0; k < layerVal[j].children.length; k++) {
                                        if (layerVal[j].children[k].id === listArr[i].orgid) {
                                            isSave = true;
                                        }
                                        if (layerVal[j].children[k].children) {
                                            for (var n = 0; n < layerVal[j].children[k].children.length; n++) {
                                                if (layerVal[j].children[k].children[n].id === listArr[i].orgid) {
                                                    isSave = true;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            // 当镜头存在
                            if (isSave) { // 框选的镜头在列表中已存在
                                var handler = window.setTimeout(function () {
                                    $('.loadEffect').hide();
                                }, 0);
                                warningTip.say('已选择相关分局');
                                window.clearTimeout(handler);
                                deleteCameraSelect(iframe, [list[i].guid]); // 去除地图上的选中状态
                            } else {
                                if (layerVal.length > 0) {
                                    if (layerVal[0].id !== '10') {
                                        layerComp.renderNode(listArr[i], list[cameraIDArr.indexOf(listArr[i].id)], true);
                                        // 右边的叉叉
                                        layerComp.deleteNode(listArr[i], list[cameraIDArr.indexOf(listArr[i].id)], true);
                                    } else {
                                        warningTip.say('已选择相关分局');
                                        window.clearTimeout(handler);
                                        var handler = window.setTimeout(function () {
                                            $('.loadEffect').hide();
                                        }, 0);
                                        deleteCameraSelect(iframe, [list[i].guid]);
                                    }
                                } else {
                                    layerComp.renderNode(listArr[i], list[cameraIDArr.indexOf(listArr[i].id)], true);
                                    layerComp.deleteNode(listArr[i], list[cameraIDArr.indexOf(listArr[i].id)], true);
                                }
                            }
                        }
                    }
                });
            }
        }
    });
    //生成图片
    $(function () {
        $(".js-down-pic").click(function () {
            html2canvas($("#map_iframe")).then(function (canvas) {
                var imgUri = canvas.toDataURL("image/png"); // 获取生成的图片的url
                $('.js-download').attr('href', imgUri).trigger('click');
            });
        });
    });
}

// 地图删除摄像机选中效果 当选中的镜头删除时调用
function deleteCameraSelect(iframe, data) {
    var targetOrigin = mapUrl + 'peopleCity.html',
        dataVal = {
            type: "deleteCamera",
            mydata: data
        };
    iframe && iframe.contentWindow.postMessage(dataVal, targetOrigin);
}

// 地图删除所有摄像机选中效果 当选中的镜头删除时调用
function deleteAllCameraSelect(iframe) {
    var targetOrigin = mapUrl + 'peopleCity.html',
        dataVal = {
            type: "clearAll"
        };
    if (iframe) {
        iframe.contentWindow.postMessage(dataVal, targetOrigin);
    }
}

// 生成图片
$(function () {
    $(".js-down-pic").click(function () {
        html2canvas($("#map_iframe")).then(function (canvas) {
            var imgUri = canvas.toDataURL("image/png"); // 获取生成的图片的url
            $('.js-download').attr('href', imgUri).trigger('click');
        });
    });
});

// 检索 同行人 地图框选摄像头事件
function loadMapCameraList() {
    window.addEventListener("message", function (ev) { // 监听框选摄像头事件
        var mydata = ev.data; // 接收地图传回的数据
        console.log(mydata);
        if (mydata.indexOf('initMap') < 0 && !mydata.imgs && !mydata.info && !mydata.key) { // 不是初始化地图
            if (!(mydata instanceof Array)) { // 如果返回数据格式不对
                return;
            }
            var cameraIDArr = [], // 被框选的摄像头id数组
                // isIndex = $('#260299993').hasClass('active') || $('#260299992').hasClass('active'), // 如果是检索 框选镜头
                // isPeople = $('#2607').hasClass('active'); // 如果是同行人 框选镜头
                isIndex = mydata[0].id && mydata[0].id === "search_map_iframe", // 检索有两个地图，所以不能用上述方法，只有指定地图才能框选摄像头
                isIndexDynamic = mydata[0].id && mydata[0].id === "search_map_iframeDynamic", // 检索有两个地图，所以不能用上述方法，只有指定地图才能框选摄像头
                isIndexTemperature = mydata[0].id && mydata[0].id === "search_map_iframeTemperature", // 温度
                isPeople = mydata[0].id && mydata[0].id === "peer_map_iframe";
            if (mydata.length && (isIndex || isPeople || isIndexDynamic || isIndexTemperature)) { // 如果有返回值
                if (isIndex) {
                    var $cameraIDList = $('#saveNodeSearch');
                    $("#searchMap").click(); // 检索条件区域/地图 选择地图
                } else if (isIndexDynamic) {
                    var $cameraIDList = $('#saveNodeSearchDynamic');
                    var $imgCache = $('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img');
                    $("#searchMapDynamic").click(); // 检索条件区域/地图 选择地图
                } else if (isIndexTemperature) {
                    var $cameraIDList = $('#saveNodeSearchTemperature');
                    $("#searchMapTemperature").click(); // 检索条件区域/地图 选择地图
                } else {
                    var $cameraIDList = $('#peerNodeSearch');
                    $("#PSearchMap").click();
                }
                for (var i = 0; i < mydata.length; i++) {
                    cameraIDArr.push(mydata[i].guid); // 摄像头id数组赋值
                }
                $.unique(cameraIDArr);
                var saveData = $cameraIDList.data('saveData') ? $cameraIDList.data('saveData') : [];
                // 判断框选的镜头是否在列表中 如果在列表中 如果不在列表中
                for (var m = 0; m < cameraIDArr.length; m++) {
                    var isSave = false; // 镜头是否已在列表中
                    for (var n = 0; n < saveData.length; n++) {
                        if (cameraIDArr[m] === saveData[n].arr) {
                            isSave = true; // 框选镜头已经在选中列表中
                        }
                    }
                    if (isSave) { // 摄像头已存在列表中
                        var handler = window.setTimeout(function () {
                            $('.loadEffect').hide();
                        }, 0);
                        // warningTip.say('已选择部分相关镜头');
                        window.clearTimeout(handler);
                    } else {
                        renderNodePage(cameraIDArr[m], mydata[m], true, $cameraIDList, $imgCache);
                        deleteNodePage(cameraIDArr[m], true, $cameraIDList, $imgCache);
                    }
                }
            }
        } else if (mydata.indexOf('initMap') > -1) {
            var targetOrigin = mapUrl + 'peopleCity.html',
                iframeType = mydata.split("?")[1],
                mapOperationData = {
                    type: "controlVisible",
                    mydata: [{
                        name: 'zoom',
                        b: false
                    }, {
                        name: 'tools',
                        b: true
                    }, {
                        name: 'search',
                        b: true
                    }, {
                        name: 'fullExtent',
                        b: true
                    }]
                };
            window.setTimeout(function () {
                var searchMapDynamicIframe = document.getElementById(iframeType);
                searchMapDynamicIframe.contentWindow.postMessage(mapOperationData, targetOrigin);
            }, 1000);
        }

        if (mydata.key) {
            //detailContent是设备详情
            if (mydata.key != 'detailContent') {
                var cameraIDArr = [];
                for (var i = 0; i < mydata.data.length; i++) {
                    cameraIDArr.push(mydata.data[i].id); // 摄像头id数组赋值
                }
                showMapVideo(mydata.key, mydata.data, cameraIDArr);
            } else {
                showDeviceDetail(mydata.data.id);
            }
        }
    });

    function dataFormat(data) {
        var $data = JSON.stringify(data);
        return JSON.parse($data);
    };

    // 绑定删除按钮方法
    $("#selMergeCameraID").find('.js-remove-all').off('click').on('click', function () {
        var cameraIDArr = [];
        var saveData = $('#saveNodeSearch').data('saveData') ? $('#saveNodeSearch').data('saveData') : [];
        saveData.map(function (item, index) {
            cameraIDArr.push(item.arr);
        });
        var iframe = document.getElementById('search_map_iframe');
        deleteCameraSelect(iframe, cameraIDArr); // 删除地图上的已选中摄像头
        $('#saveNodeSearch').empty();
        $('#saveNodeSearch').data({
            'saveData': []
        });
        $('#selMergeCameraID .multiPickerDlg_no_result').show();
        // 设置选中数量
        var listItemLen = $('#saveNodeSearch').children().length;
        $("#selMergeCameraID").find('.js-camera-totle').text(listItemLen);
    });

    // 绑定删除按钮方法
    $("#selPeerCameraID").find('.js-remove-all').off('click').on('click', function () {
        var cameraIDArr = [];
        var saveData = $('#peerNodeSearch').data('saveData') ? $('#peerNodeSearch').data('saveData') : [];
        saveData.map(function (item, index) {
            cameraIDArr.push(item.arr);
        });
        var iframe = document.getElementById('peer_map_iframe');
        deleteCameraSelect(iframe, cameraIDArr); // 删除地图上的已选中摄像头
        $('#peerNodeSearch').empty();
        $('#peerNodeSearch').data({
            'saveData': []
        });
        $('#selPeerCameraID .multiPickerDlg_no_result').show();
        // 设置选中数量
        var listItemLen = $('#peerNodeSearch').children().length;
        $("#selPeerCameraID").find('.js-camera-totle').text(listItemLen);
    });

    // 绑定删除按钮方法
    $("#selMergeCameraIDDynamic").find('.js-remove-all').off('click').on('click', function () {
        var cameraIDArr = [];
        var saveData = $('#saveNodeSearchDynamic').data('saveData') ? $('#saveNodeSearchDynamic').data('saveData') : [];
        saveData.map(function (item, index) {
            cameraIDArr.push(item.arr);
        });
        var iframe = document.getElementById('search_map_iframeDynamic');
        deleteCameraSelect(iframe, cameraIDArr); // 删除地图上的已选中摄像头
        $('#saveNodeSearchDynamic').empty();
        $('#saveNodeSearchDynamic').data({
            'saveData': []
        });
        $('#selMergeCameraIDDynamic .multiPickerDlg_no_result').show();
        // 设置选中数量
        var listItemLen = $('#saveNodeSearchDynamic').children().length;
        $("#selMergeCameraIDDynamic").find('.js-camera-totle').text(listItemLen);
    });

    // 绑定删除按钮方法
    $("#selMergeCameraIDTemperature").find('.js-remove-all').off('click').on('click', function () {
        var cameraIDArr = [];
        var saveData = $('#saveNodeSearchTemperature').data('saveData') ? $('#saveNodeSearchTemperature').data('saveData') : [];
        saveData.map(function (item, index) {
            cameraIDArr.push(item.arr);
        });
        var iframe = document.getElementById('search_map_iframeTemperature');
        deleteCameraSelect(iframe, cameraIDArr); // 删除地图上的已选中摄像头
        $('#saveNodeSearchTemperature').empty();
        $('#saveNodeSearchTemperature').data({
            'saveData': []
        });
        $('#selMergeCameraIDTemperature .multiPickerDlg_no_result').show();
        // 设置选中数量
        var listItemLen = $('#saveNodeSearchTemperature').children().length;
        $("#selMergeCameraIDTemperature").find('.js-camera-totle').text(listItemLen);
    });
}

//添加摄像头列表
function renderNodePage(cameralId, mapCameralData, isMap, $cameraIDList, $imgCache) {
    var liHtml = '';
    if (isMap) {
        var pushId = cameralId,
            isPush = true;
        var saveData = $cameraIDList.data('saveData') ? $cameraIDList.data('saveData') : [];
        for (var i = 0; i < saveData.length; i++) {
            if (saveData[i].arr && pushId === saveData[i].arr) {
                isPush = false;
            }
        }
        if (isPush) {
            saveData.push({
                arr: cameralId,
                listArr: mapCameralData
            });
        }
        $cameraIDList.data({
            'saveData': saveData
        });
        if ($imgCache) {
            $imgCache.data({
                'saveData': saveData
            })
        }
        if (saveData.length > 0) {
            var saveValArr = [];
            for (var i = 0; i < saveData.length; i++) {
                saveValArr.push(saveData[i].arr.id);
            }
            if (saveValArr.indexOf(pushId) == -1) {
                liHtml = '<li title=' + mapCameralData.name + ' data-name=' + mapCameralData.name + ' data-id=' + cameralId + ' class="ww_menuDialog_DualCols_colRight_cnt_item token-input-token js_list_item">' +
                    '<span class="ww_commonImg icon icon_folder_blue"></span>' +
                    '<span class="ww_treeMenu_item_text" title=' + mapCameralData.name + '>' + mapCameralData.name + '</span>' +
                    '<a href="javascript:" class="ww_menuDialog_DualCols_colRight_cnt_item_delete"><span class="ww_commonImg ww_commonImg_DeleteItem js_delete"></span></a>' +
                    '</li>';
            }
        } else {
            liHtml = '<li title=' + mapCameralData.name + ' data-name=' + mapCameralData.name + ' data-id=' + cameralId + ' class="ww_menuDialog_DualCols_colRight_cnt_item token-input-token js_list_item">' +
                '<span class="ww_commonImg icon icon_folder_blue"></span>' +
                '<span class="ww_treeMenu_item_text" title=' + mapCameralData.name + '>' + mapCameralData.name + '</span>' +
                '<a href="javascript:" class="ww_menuDialog_DualCols_colRight_cnt_item_delete"><span class="ww_commonImg ww_commonImg_DeleteItem js_delete"></span></a>' +
                '</li>';
        }
        $cameraIDList.closest('.multiPickerSelect_cnt').find('.multiPickerDlg_no_result').hide();
        $cameraIDList.closest('.multiPickerSelect_cnt').find('.multiPickerDlg_right_no_result').hide();
        $cameraIDList.append(liHtml);
        // 设置文字信息
        var listItemLen = $cameraIDList.children().length;
        $cameraIDList.closest('.searchMap').find('.js-camera-totle').text(listItemLen);
    }
};

function deleteNodePage(cameralId, isMap, $imgCache) {
    if (isMap) {
        $("#saveNodeSearchDynamic").find('.js_list_item a').off('click').on('click', function () {
            // 清除节点
            $(this).parent().remove();
            var $cameraIDList = $('#saveNodeSearchDynamic');
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
            var index = $(this).parent().data().id;
            var saveData = $cameraIDList.data('saveData') ? $cameraIDList.data('saveData') : [];
            for (var i = 0; i < saveData.length; i++) {
                if (index === saveData[i].arr) {
                    saveData.splice(i, 1);
                }
            }
            $cameraIDList.data({
                'saveData': saveData
            });

            if ($imgCache) {
                $imgCache.data({
                    'saveData': saveData
                });
            }
            var iframe = document.getElementById('search_map_iframeDynamic');
            deleteCameraSelect(iframe, [index]); // 删除地图上的已选中摄像头
            // 设置文字信息
            var listItemLen = $cameraIDList.children().length;
            $cameraIDList.closest('.searchMap').find('.js-camera-totle').text(listItemLen);
        });
        $("#saveNodeSearchTemperature").find('.js_list_item a').off('click').on('click', function () {
            // 清除节点
            $(this).parent().remove();
            var $cameraIDList = $('#saveNodeSearchTemperature');
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
            var index = $(this).parent().data().id;
            var saveData = $cameraIDList.data('saveData') ? $cameraIDList.data('saveData') : [];
            for (var i = 0; i < saveData.length; i++) {
                if (index === saveData[i].arr) {
                    saveData.splice(i, 1);
                }
            }
            $cameraIDList.data({
                'saveData': saveData
            });

            var iframe = document.getElementById('search_map_iframeDynamic');
            deleteCameraSelect(iframe, [index]); // 删除地图上的已选中摄像头
            // 设置文字信息
            var listItemLen = $cameraIDList.children().length;
            $cameraIDList.closest('.searchMap').find('.js-camera-totle').text(listItemLen);
        });

        $("#saveNodeSearch").find('.js_list_item a').off('click').on('click', function () {
            // 清除节点
            $(this).parent().remove();
            var $cameraIDList = $('#saveNodeSearch');
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
            var index = $(this).parent().data().id;
            var saveData = $cameraIDList.data('saveData') ? $cameraIDList.data('saveData') : [];
            for (var i = 0; i < saveData.length; i++) {
                if (index === saveData[i].arr) {
                    saveData.splice(i, 1);
                }
            }
            $cameraIDList.data({
                'saveData': saveData
            });

            if ($imgCache) {
                $imgCache.data({
                    'saveData': saveData
                });
            }

            var iframe = document.getElementById('search_map_iframe');
            deleteCameraSelect(iframe, [index]); // 删除地图上的已选中摄像头
            // 设置文字信息
            var listItemLen = $cameraIDList.children().length;
            $cameraIDList.closest('.searchMap').find('.js-camera-totle').text(listItemLen);
        });

        $("#peerNodeSearch").find('.js_list_item a').off('click').on('click', function () {
            // 清除节点
            $(this).parent().remove();
            var $cameraIDList = $('#peerNodeSearch');
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
            var index = $(this).parent().data().id;
            var saveData = $cameraIDList.data('saveData') ? $cameraIDList.data('saveData') : [];
            for (var i = 0; i < saveData.length; i++) {
                if (index === saveData[i].arr) {
                    saveData.splice(i, 1);
                }
            }
            $cameraIDList.data({
                'saveData': saveData
            });

            var iframe = document.getElementById('peer_map_iframe');
            deleteCameraSelect(iframe, [index]); // 删除地图上的已选中摄像头
            // 设置文字信息
            var listItemLen = $cameraIDList.children().length;
            $cameraIDList.closest('.searchMap').find('.js-camera-totle').text(listItemLen);
        });
    }
};
/************************* 检索 其他模块 地图公共方法 end *************************/

/** 告警、布控轨迹分析 生成左侧列表
 * @param {*} $alarmList 告警详情列表容器
 * @param {*} data 告警详情总数据
 * @param {*} selectPageSizeOpt 一页显示个数
 * @param {*} isBottom 是否滚动到底部
 */
window.createAlarmList = function ($alarmList, data, selectPageSizeOpt, isBottom) {
    var pageNumber = $alarmList.data('pageNumber'),
        peopleImg = $alarmList.data('peopleImg'),
        start = (pageNumber - 1) * selectPageSizeOpt,
        end = start + selectPageSizeOpt,
        alarmPathList = data.slice(start, end),
        html = '',
        isAlarm = $alarmList.data('isAlarm');
    for (var i = 0; i < alarmPathList.length; i++) {
        var statusName = alarmPathList[i].status == '0' && '未处理' || alarmPathList[i].status == '1' && '已命中' || alarmPathList[i].status == '2' && '已误报' || '未处理';
        html += `
            <div class="aui-timeline-wrap clearfix">
                <div class="case-img-box float-left clearfix relative">
                    <img class="case-img float-left img-right-event" cameraId="${alarmPathList[i].cameraId}" gbCode="${alarmPathList[i].gbCode}" peopleId="${alarmPathList[i].peopleId}" src="${peopleImg || alarmPathList[i].url || './assets/images/control/person.png'}"
                        alt="">
                    <img class="case-img float-left img-right-event" cameraId="${alarmPathList[i].cameraId}" gbCode="${alarmPathList[i].gbCode}" alarmid="${alarmPathList[i].id}" src="${alarmPathList[i].smallHttpUrl || alarmPathList[i].faceUrl || './assets/images/control/person.png'}"
                        alt="">
                    <span class="case-num">${alarmPathList[i].threshold || '0'}%</span>
                </div>
                <div class="alarm-content-right float-left aui-ml-mmd">
                    <div class="alarm-group clearfix ${isAlarm ? '' : 'hide'}">
                        <div class="alarm-group-title text-md text-bold float-left">${alarmPathList[i].name || alarmPathList[i].reason || '未知'}</div>
                        <div class="float-right">
                            <span class="warning-item-level grade${alarmPathList[i].status ? Number(alarmPathList[i].status) + 1 : 1}">${statusName}</span>
                        </div>
                    </div>
                    <div class="alarm-group ${isAlarm ? '' : 'aui-mt-sm'}">
                        <span class="text-lighter text-xm" title="${alarmPathList[i].cameraName || '未知'}">${alarmPathList[i].cameraName || '未知'}</span>
                    </div>
                    <div class="alarm-group">
                        <span class="text-lighter text-xm">${alarmPathList[i].alarmTime || alarmPathList[i].captureTime || '未知'}</span>
                    </div>
                </div>
            </div>
        `;
    }
    if (!isBottom) {
        $alarmList.empty().append(html);
    } else {
        $alarmList.append(html);
    }
}

/**
 * 跳转到新建布控页面
 */
$("#content-box").on("click", "#newBukong", function () {
    var url = "./facePlatform/control-new.html?dynamic=" + Global.dynamic;
    // window.localStorage.setItem("prevPage", $(this).attr("prevPageName"));
    // window.localStorage.setItem("controlId", '');
    // loadPage($('#content-box'), url);
    $('.control-new-popup').data('controlType', 'create');
    loadPage($('.control-new-popup'), url);
    $('.control-new-popup').removeClass('hide');
});

/** 
 * AI告警新建按钮点击事件
 */
$("#content-box").on("click", "#newBukongAI", function () {
    var url = "./facePlatform/AI-alarm-add.html?dynamic=" + Global.dynamic;
    // window.localStorage.setItem("prevPage", $(this).attr("prevPageName"));
    // window.localStorage.setItem("controlId", '');
    // loadPage($('#content-box'), url);
    loadPage($('.AI-new-popup'), url);
    $('.AI-new-popup').removeClass('hide');
});

$(document).on("click", "#backPrevPage", function () {
    //新建布控时，点击返回回到进入的页面
    // var url = "./facePlatform/" + window.localStorage.getItem("prevPage") + ".html?dynamic=" + Global.dynamic;
    // loadPage($('#content-box'), url);
    $('.control-new-popup').addClass('hide').removeClass('show').removeData('controlData');
});

$(document).on("click", "#backPrevPageAI", function () {
    //新建布控时，点击返回回到进入的页面
    // var url = "./facePlatform/" + window.localStorage.getItem("prevPage") + ".html?dynamic=" + Global.dynamic;
    // loadPage($('#content-box'), url);
    $('.AI-new-popup').addClass('hide').removeClass('show').removeData('controlData');
});

$(document).on("click", "#backPrevPageOne", function () {
    // 1:1识别时，点击X到进入的页面
    $('.one-to-one-popup').addClass('hide').removeClass('show').removeData('onetooneData');
    $('.one-to-one-popup').empty();
});

//dropdown模拟下拉
$(document).on('click', '[data-role="dropdown-select"] .dropdown-item', function () {
    var $this = $(this),
        $dropTextDom = $this.closest('[data-role="dropdown-select"]').find('.dropdown-toggle'),
        dropText = $dropTextDom.attr('name'),
        index = $this.index();
    $this.addClass('active').siblings().removeClass('active');
    if (index != 0) {
        $dropTextDom.addClass('active');
        $dropTextDom.text($this.text());
    } else {
        $dropTextDom.removeClass('active');
        $dropTextDom.text(dropText);
    }
});

// 布控、告警筛选条件公共函数
function filterDrop($box, callBack, hasType) {
    var boxID = $box.attr('id'),
        boxIdStr = '#' + boxID,
        $timeTag,
        $saveItem = $box.closest('.content-save-item'),
        $time = $saveItem.find('#timeModal'),
        $filterBox = $box.find('.filter-box'),
        $filterTag = $box.find('.tag-list').eq(0),
        $filterOrg = $filterBox.find('.tag-list').eq(2),
        $filterTime = $filterBox.find('.tag-list').eq(3),
        $filterLib = $filterBox.find('.tag-list').eq(4),
        $filterDropBtn = $box.find('[data-role="expandFilter"]');
    if (boxID == "alarmOverviewFilterBox") { //告警界面
        var $timeInput = $time.find('#customPopup_time_alarm');
    } else if (boxID == "alarmOverviewNewFilterBox") {
        $time = $('#timeModalNew');
        var $timeInput = $time.find('#popup_time_alarm');
    } else {
        var $timeInput = $time.find('#customPopup_time');
    }
    // 发送请求获取所属机构
    window.loadData('v2/org/getOrgInfos', true, {
        orgType: 1,
        userType: 2,
        returnType: 3,
    }, function (data) {
        if (data.code === '200') {
            var orgHtmlArr = [];
            for (var i = 0; i < data.data.length; i++) {
                if (data.data[i].orgId !== '10') {
                    orgHtmlArr.push('<li class="tag" orgid="' + data.data[i].orgId + '">' + data.data[i].orgName + '</li>');
                }
            }
            $filterOrg.html(orgHtmlArr.join(''));
        }
    }, undefined, 'GET');

    // 发送请求获取人像库
    window.loadData('v3/lib/allLibs', true, {
        type: 2
    }, function (data) {
        if (data.code === '200') {
            var libHtmlArr = [];
            for (var i = 0; i < data.data.length; i++) {
                if (data.data[i].type == 2) {
                    libHtmlArr.push('<li class="tag" libid="' + data.data[i].libId + '">' + data.data[i].libName + '</li>');
                }
            }
            $filterLib.html(libHtmlArr.join(''));
        }
    }, undefined, 'GET');

    if (hasType) {
        // 发送请求获取所属机构
        var $filterType = $filterBox.find('.tag-list').eq(1);
        window.loadData('index/dictionaryInfo', true, {
            kind: 'RX_BKPLAT,TASK_GRADE'
        }, function (data) {
            if (data.code === '000') {
                var controlTaskType = data.result.RX_BKPLAT,
                    //  controlTaskGrade = data.result.TASK_GRADE,
                    typeHtmlArr = [];

                for (let i = 0; i < controlTaskType.length; i++) {
                    typeHtmlArr.push('<li class="tag" typeId="' + controlTaskType[i].id + '">' + controlTaskType[i].name + '</li>');
                }
                $filterType.html(typeHtmlArr.join(''));
            }
        });
    }

    // 初始化自定义时间控件
    setTimerPicker();
    var $timerPicker = $filterTime.find('.tag').eq(-1);
    $timerPicker.data('time', true);

    function setTimerPicker(destory) {
        if (destory) {
            window.initDatePicker1($timeInput, '', true);
        } else {
            window.initDatePicker1($timeInput, '', false);
        }
    }

    // 设置上面标签默认数据
    $filterTag.find('.tag').each(function (index, el) {
        var data = {},
            $parent = $(this).parent(),
            parentData = $parent.data('tagDataArr');
        if (index === 2) {
            data.type = 'org';
        } else {
            data.type = 'normal';
        }
        data.text = '全部';
        $(this).data('tagData', data);
        // 给容器设置总数据
        if (parentData) {
            parentData.push(data);
            $parent.data('tagDataArr', parentData);
        } else {
            $parent.data('tagDataArr', [data]);
        }
    });

    // 绑定自定义时间弹窗确定按钮事件
    $time.find('.btn-primary').on('click', function () {
        var startTime = $timeInput.find('.datepicker-input').eq(0).val(),
            endTime = $timeInput.find('.datepicker-input').eq(1).val(),
            startTimeLen = startTime.length,
            endTimeLen = endTime.length;
        if ($timeTag && startTimeLen > 0 && endTimeLen > 0) {
            $time.find('.text-danger').addClass('hide');
            $time.modal('hide');
            $timeTag.text(startTime + ' ~ ' + endTime);
            var $timeSelectContent = $timeTag.closest('.filter-item'),
                index = $timeSelectContent.index(),
                $timeSelect = $timeSelectContent.find('.tag').filter('.tag-prompt'),
                $label = $filterTag.find('.tag').eq(index),
                $labelText = $label.find('span').eq(1);
            $timeSelect.removeClass('tag-prompt');
            $timeTag.addClass('tag-prompt');
            $label.removeClass('hide');
            $labelText.text(startTime + ' ~ ' + endTime);
            $label.data('tagData', {
                type: 'normal',
                text: startTime + '~' + endTime,
                index: 3
            });
            // 回调函数调用
            if ($.isFunction(callBack)) {
                var dataArr = [];
                $filterTag.find('.tag').each(function (index, el) {
                    var thisData = $(this).data('tagData');
                    dataArr.push(thisData);
                });
                callBack(dataArr, index);
                $timeTag = undefined;
                $filterTag.data('tagDataArr', dataArr);
            }
        } else {
            // warningTip.say("请选择开始和结束时间");
            $timeInput.next().removeClass('hide');
            //$timeInput.find('.datepicker-input').eq(0).val("");
            //$timeInput.find('.datepicker-input').eq(1).val("");
        }
    });

    // 高级搜索
    function expandMore() {
        $box.find('.filter-item').each(function () {
            var _h = $(this).find('.tag-list').height();
            if (_h > 30) {
                $(this).find('.filter-content-inner').addClass('more');
            } else {
                $(this).find('.filter-content-inner').removeClass('more');
            }
        });
    }

    $(window).off('resize.filterDropMore.' + boxID).on('resize.filterDropMore' + boxID, expandMore);

    $(boxIdStr).on('click', '[data-role="expandMore"]', function () {
        var _this = $(this),
            _thisText = _this.find('.text');
        if (_thisText.text() === '更多') {
            _thisText.text('收起');
            _this.addClass('rotate');
            _this.parents('.filter-content-inner').addClass('expand-more');
        } else {
            _thisText.text('更多');
            _this.removeClass('rotate');
            _this.parents('.filter-content-inner').removeClass('expand-more');
        }
    }).off('click', '[data-role="expandFilter"]').on('click', '[data-role="expandFilter"]', function (e) {
        var _this = $(this);
        _thisText = $(this).find('span');
        _this.toggleClass('active');
        $filterBox.slideToggle();
        if (_thisText.text() === '显示筛选') {
            _thisText.text('收起筛选');
            expandMore();
        } else {
            _thisText.text('显示筛选');
        }
        e.stopPropagation();
    }).on('click', '.filter-box', function (e) {
        e.stopPropagation();
    })

    $(document).click(function (e) {
        var $target = $(e.target).closest('#timeModal');
        if ($target.length > 0) {
            return;
        }
        $filterBox.slideUp();
        $filterDropBtn.removeClass('active')
        $filterDropBtn.find('span').text('显示筛选');
    });

    // 搜索框旁边筛选标签删除按钮事件绑定
    $filterTag.find('.aui-icon-not-through').off('click').on('click', function (evt) {
        evt.stopPropagation();
        var $parent = $(this).parent(),
            parentIndex = $parent.index(),
            $filterItem = $filterBox.find('.filter-item').eq(parentIndex),
            $filterItemSelect = $filterItem.find('.tag').filter('.tag-prompt'),
            $filterItemAll = $filterItem.find('.tag').eq(0);
        $parent.addClass('hide');
        $filterItemAll.addClass('tag-prompt');
        //判定是否为自定义时间按钮
        // if (parentIndex === 3) {
        //     setTimerPicker(true);
        //     $filterItemSelect.text('自定义时间')
        // }
        if (($filterItemSelect.index() === 3 && $filterItem.find('.tag-list .tag').length === 4) || ($filterItemSelect.index() === 4 && $filterItem.find('.tag-list .tag').length === 5)) { //判断当前选择的那一个时间的index为3才显示自定义时间,告警是第三个布控是第四个
            setTimerPicker(true);
            $filterItemSelect.text('自定义时间');
        } else {
            $filterItemSelect.text($filterItemSelect.html());
        }

        $filterItemSelect.removeClass('tag-prompt');
        var data = {};
        if (parentIndex === 2) {
            data.type = 'org';
        } else {
            data.type = 'normal';
        }
        data.text = '全部';
        $parent.data('tagData', data);

        // 回调函数调用
        if ($.isFunction(callBack)) {
            var dataArr = [];
            $filterTag.find('.tag').each(function (index, el) {
                var thisData = $(this).data('tagData');
                dataArr.push(thisData);
            });
            callBack(dataArr, parentIndex);
            $filterTag.data('tagDataArr', dataArr);
        }
    });

    // 筛选框条件选中条件事件绑定
    $filterBox.off('click', '.tag').on('click', '.tag', function () {
        var $content = $(this).closest('.filter-content'),
            $item = $(this).closest('.filter-item'),
            thisIndex = $item.index(),
            thisCls = $(this).parent().hasClass('filter-content-label'),
            thisText = $(this).text(),
            $label = $filterTag.find('.tag').eq(thisIndex),
            $labelText = $label.find('span').eq(1),
            $contentTag = $content.find('.tag'),
            $contentTagSelect = $contentTag.filter('.tag-prompt');
        if ($(this).data('time')) {
            $time.modal('show');
            $time.find('.text-danger').addClass('hide');
            $timeTag = $(this);
        } else {
            if (thisCls) {
                $label.addClass('hide');
                var data = {};
                // 重新设置数据
                if (thisIndex === 2) {
                    data.type = 'org';
                } else {
                    data.type = 'normal';
                }
                data.text = '全部';
                $label.data('tagData', data);
            } else {
                $label.removeClass('hide');
                $labelText.text(thisText);
                var data = {};
                // 重新设置数据
                if (thisIndex === 1 && hasType) {
                    data.type = 'type';
                    data.text = $(this).attr('typeId');
                } else if (thisIndex === 2) {
                    data.type = 'org';
                    data.text = $(this).attr('orgid');
                } else if (thisIndex === 4) {
                    data.type = 'lib';
                    data.text = $(this).attr('libid');
                } else {
                    data.type = 'normal';
                    data.text = thisText;
                }
                data.index = $(this).index();
                $label.data('tagData', data);
            }
            $contentTagSelect.removeClass('tag-prompt');
            $(this).addClass('tag-prompt');
            // 回调函数调用
            if ($.isFunction(callBack)) {
                var dataArr = [];
                $filterTag.find('.tag').each(function (index, el) {
                    var thisData = $(this).data('tagData');
                    dataArr.push(thisData);
                });
                callBack(dataArr, thisIndex);
                $filterTag.data('tagDataArr', dataArr);
            }
        }
    });
}

// 布控
function commonMaskBigImg(param, alarmItemData) {
    switch (param) {
        case 0:
            var $html = ['<div class="mask-image-box">',
                '               <div class="mask-crop-panel hide"></div>',
                '                   <div class="square-crop-box hide">',
                '                       <span class="cropper-view-box"><img class="cropper-view-img" /></span>',
                '                       <span class="cropper-line line-e"></span>',
                '                       <span class="cropper-line line-n"></span>',
                '                       <span class="cropper-line line-w"></span>',
                '                       <span class="cropper-line line-s"></span>',
                '                       <span class="cropper-point point-e"></span>',
                '                       <span class="cropper-point point-n"></span>',
                '                       <span class="cropper-point point-w"></span>',
                '                       <span class="cropper-point point-s"></span>',
                '                       <span class="cropper-point point-ne"></span>',
                '                       <span class="cropper-point point-nw"></span>',
                '                       <span class="cropper-point point-sw"></span>',
                '                       <span class="cropper-point point-se"></span>',
                '                       <div class="square-crop-tool hide">',
                '                           <i class="aui-icon-not-through"></i>',
                '                           <i class="aui-icon-approval"></i>',
                '                       </div>',
                '                   </div>',
                '                   <img class="img" alt="" />',
                '                   <div class="mask-icon-box">',
                '                       <i class="mask-icon aui-icon-video3">',
                '                           <ul class="mask-camera-list hide">',
                '                               <li class="mask-camera-item">查看前后5s视频</li>',
                '                               <li class="mask-camera-item">查看前后10s视频</li>',
                '                               <li class="mask-camera-item">查看前后30s视频</li>',
                '                               <li class="mask-camera-item">查看实时视频</li>',
                '                           </ul>',
                '                           <span class="mask-icon-hover-tip">',
                '                               视频播放',
                '                           </span>',
                '                           <i class="aui-icon-drop-down"></i>',
                '                       </i>',
                '                       <i class="mask-icon aui-icon-screen">',
                '                           <span class="mask-icon-hover-tip">',
                '                               截图检索',
                '                           </span>',
                '                           <i class="aui-icon-drop-down"></i>',
                '                       </i>',
                '                   </div>',
                '                   <div class="square-box hide"></div>',
                '                       <div class="mask-header"></div>',
                '                       <canvas class="mask-canvas-bg hide"></canvas>',
                '                       <canvas class="mask-canvas-img hide"></canvas>',
                '                   </div>',
                '               </div>',
                '               </div>'
            ].join("");
            break;
        case 1:
            var $html = `<div class="aui-col-18">
            				<div class="control-image-box mask-image-box">
                                <div class="mask-crop-panel hide"></div>
                                <div class="square-crop-box hide">
                                    <span class="cropper-view-box"><img class="cropper-view-img" /></span>
                                    <span class="cropper-line line-e"></span>
                                    <span class="cropper-line line-n"></span>
                                    <span class="cropper-line line-w"></span>
                                    <span class="cropper-line line-s"></span>
                                    <span class="cropper-point point-e"></span>
                                    <span class="cropper-point point-n"></span>
                                    <span class="cropper-point point-w"></span>
                                    <span class="cropper-point point-s"></span>
                                    <span class="cropper-point point-ne"></span>
                                    <span class="cropper-point point-nw"></span>
                                    <span class="cropper-point point-sw"></span>
                                    <span class="cropper-point point-se"></span>
                                    <div class="square-crop-tool hide">
                                        <i class="aui-icon-not-through"></i>
                                        <i class="aui-icon-approval"></i>
                                    </div>
                                </div>
                                <img class="control-image" src="${alarmItemData.alarmItemData}" alt="">
                                <div class="control-icon-box mask-icon-box">
                                    <i class="control-icon aui-icon-video3">
                                        <ul class="mask-camera-list hide">
                                            <li class="mask-camera-item">查看前后5s视频</li>
                                            <li class="mask-camera-item">查看前后10s视频</li>
                                            <li class="mask-camera-item">查看前后30s视频</li>
                                            <li class="mask-camera-item">查看实时视频</li>
                                        </ul>
                                    </i>
                                    <i class="control-icon aui-icon-screen"></i>
                                </div>
                                <div class="square-box hide"></div>
                                <div class="mask-header"></div>
                                <canvas class="mask-canvas-bg hide"></canvas>
                                <canvas class="mask-canvas-img hide"></canvas>
                        </div>
                    </div>`;
            break;
    }
    return $html;
}

/**
 * 将数组转换成 文本字符串或者tag dom字符串，用于展示布控机构列表、库列表、人员列表等
 * @param {object} result 目标对象
 */
function setArrayToStringObject(result) {
    if (!result || result.length === 0) {
        result = [];
    }
    var orgListString = '',
        noticeUserListString = '',
        libListString = '',
        noticeOrgListString = '',
        imgListString = '',
        viewListString = '',
        viewUserListString = '';
    if (result.viewList && result.viewList.length) {
        for (var i = 0; i < result.viewList.length; i++) {
            viewListString += (result.viewList.length > 1 && i < result.viewList.length - 1) ?
                result.viewList[i].orgName ? result.viewList[i].orgName + ',' : '' :
                result.viewList[i].orgName ? result.viewList[i].orgName : '';
        }
    } else {
        viewListString = '暂无';
    }
    if (result.viewUserList && result.viewUserList.length) {
        for (var i = 0; i < result.viewUserList.length; i++) {
            viewUserListString += (result.viewUserList.length > 1 && i < result.viewUserList.length - 1) ?
                result.viewUserList[i].userName ? result.viewUserList[i].userName + ',' : '' :
                result.viewUserList[i].userName ? result.viewUserList[i].userName : '';
        }
    } else {
        viewUserListString = '暂无';
    }
    if (result.orgList && result.orgList.length) {
        for (var i = 0; i < result.orgList.length; i++) {
            orgListString += (result.orgList.length > 1 && i < result.orgList.length - 1) ?
                result.orgList[i].orgName ? result.orgList[i].orgName + ',' : '' :
                result.orgList[i].orgName ? result.orgList[i].orgName : '';
        }
    } else {
        orgListString = '暂无';
    }
    if (result.noticeUserList && result.noticeUserList.length) {
        for (var i = 0; i < result.noticeUserList.length; i++) {
            noticeUserListString += (result.noticeUserList.length > 1 && i < result.noticeUserList.length - 1) ?
                result.noticeUserList[i].userName ? result.noticeUserList[i].userName + ',' : '' :
                result.noticeUserList[i].userName ? result.noticeUserList[i].userName : '';
        }
    } else {
        noticeUserListString = '暂无';
    }
    if (result.libList && result.libList.length) {
        for (var i = 0; i < result.libList.length; i++) {
            libListString += (result.libList.length > 1 && i < result.libList.length - 1) ?
                result.libList[i].libName ? result.libList[i].libName + ',' : '' :
                result.libList[i].libName ? result.libList[i].libName : '';
        }
    } else {
        libListString = '暂无';
    }
    if (result.noticeOrgList && result.noticeOrgList.length) {
        for (var i = 0; i < result.noticeOrgList.length; i++) {
            noticeOrgListString += (result.noticeOrgList.length > 1 && i < result.noticeOrgList.length - 1) ?
                result.noticeOrgList[i].orgName ? result.noticeOrgList[i].orgName + ',' : '' :
                result.noticeOrgList[i].orgName ? result.noticeOrgList[i].orgName : '';
        }
    } else {
        noticeOrgListString = '暂无';
    }
    if (result.imgList && result.imgList.length) {
        for (var i = 0; i < result.imgList.length; i++) {
            imgListString = `
                <li class="add-image-item default">
                    <img class="add-image-img" alt="" src="${result.imgList[i].imageUrl ? result.imgList[i].imageUrl : './assets/images/control/person.png'}">
                </li>
            `;
        }
    } else {
        imgListString = '暂无';
    }
    return {
        orgString: orgListString,
        libString: libListString,
        userString: noticeUserListString,
        noticeOrgString: noticeOrgListString,
        imageString: imgListString,
        viewString: viewListString,
        viewUserString: viewUserListString
    }
}

/*限制非数字*/
$(document).on('input keypaste keyup', '.js-limit-d', function () {
    if (/[\D]/g.test(this.value)) {
        $(this).val(this.value.replace(/[\D]/g, ""));
    }
});

/*限制输入空格*/
$(document).on('input keypaste keyup', '.js-limit-space', function () {
    if (/[\s]/g.test(this.value)) {
        $(this).val(this.value.replace(/[\s]/g, ""));
    }
});

// 页面跳转
$('#sidebar-nav').on('click', '.js-Page_jump', function () {
    window.location.href = location.href.replace(/#[\s\S]+/, $(this).attr('href'));
    var container = $('#content-wrapper');
    loadPage(container);
});

/*获取url里面的   模块信息*/
function getMode() {
    if (location.href.indexOf('#') == -1) return;
    var hashValue = location.href.split("#"); //  hashValue[1] = mode/page.html?obj=123
    if (hashValue.length < 2 || hashValue[1].indexOf('/') < 0) {
        return 'WarnInform.html';
    }
    return hashValue[1];
}

/*获取url里面的   页面信息*/
function getPage() {
    var hashValue = location.href.split("#"); //  hashValue[1] = mode/page.html
    var hashArr = hashValue[1].split('/'); //   hashArr[0] = mode  hashArr[1]= page.html
    if (hashArr == '') {
        location.href = 'login.html';
    }
    var page = hashArr[1].replace(/(.+)\.html(.*)/g, '$1');
    return page;
}

//重置搜索条件
function reset() {
    $(".searchForm")[0].reset();
}

//毫秒数或标准时间转日期
function getChangeDate(time) {
    var dateTime = new Date(time),
        year = dateTime.getFullYear(),
        month = (dateTime.getMonth() + 1) < 10 ? ('0' + (dateTime.getMonth() + 1)) : (dateTime.getMonth() + 1),
        date = dateTime.getDate() < 10 ? ('0' + dateTime.getDate()) : dateTime.getDate(),
        hour = (dateTime.getHours() + 1) <= 10 ? ('0' + dateTime.getHours()) : dateTime.getHours(),
        minute = (dateTime.getMinutes() + 1) <= 10 ? ('0' + dateTime.getMinutes()) : dateTime.getMinutes(),
        second = (dateTime.getSeconds() + 1) <= 10 ? ('0' + dateTime.getSeconds()) : dateTime.getSeconds();
    var result = year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second;
    return result;
}

/**
 * 右键关联镜头公用方法
 * @param {string} type 哪种秒数
 * @param {string} pageType 在哪个页面（动态2或者综合3或者告警5）
 * @param {object} data 该镜头所有信息
 * @param {string} startTime 镜头关联时间开始时间  （自定义时间专用）
 * @param {string} endTime 镜头关联时间结束时间 （自定义时间专用）
 */
function linkCameraTime(type, pageType, data, startTime, endTime) {
    var time = data.captureTime || data.alarmTime, //镜头时间
        stationId = data.stationId, //镜头机构市局/分局
        policeId = data.policeId, //镜头机构派出所
        gbCode = data.cameraId, //镜头国标编码
        constcategoryId = data.constcategoryId, //镜头类点
        //gbCode = '44030461001320006064',
        data = new Date(time),
        bTime = data.getTime();
    if (type == '0' || type == '1') { //15s或30s，先转毫秒数
        var startTimeBefore = bTime - ((type == '0' ? 15 : 30) * 1000);
        var endTimeBefore = bTime + ((type == '0' ? 15 : 30) * 1000);
    } else if (type == '2' || type == '3') {
        var startTimeBefore = bTime - ((type == '2' ? 1 : 5) * 60 * 1000);
        var endTimeBefore = bTime + ((type == '2' ? 1 : 5) * 60 * 1000);
    } else {
        // var startTimeBefore = new Date(startTime).getTime();
        // var endTimeBefore = new Date(endTime).getTime();
        if (startTime == '') { //开始时间或结束时间为空，默认为抓拍时间
            var startTimeBefore = new Date(time).getTime();
            var endTimeBefore = bTime + (parseInt(endTime) * 60 * 1000);
        } else if (endTime == '') {
            var startTimeBefore = bTime - (parseInt(startTime) * 60 * 1000);
            var endTimeBefore = new Date(time).getTime();
        } else {
            var startTimeBefore = bTime - (parseInt(startTime) * 60 * 1000);
            var endTimeBefore = bTime + (parseInt(endTime) * 60 * 1000);
        }
    }

    var startTime = getChangeDate(startTimeBefore);
    var endTime = getChangeDate(endTimeBefore);
    if (pageType == '2') {
        var $timeStart = $("#timeStartDynamic"),
            $timeEnd = $("#timeEndDynamic"),
            $sidebarOrgSelect = $("#sidebarOrgSelectDynamic"),
            $sidebarPoliceSelect = $("#sidebarPoliceSelectDynamic"),
            $sidebarCameraSelect = $("#sidebarCameraSelectDynamic"),
            $searchMerge_Time = $('#searchMerge_TimeDynamic'),
            $usearchImg = $("#usearchImgDynamic"),
            $mergeSearch = $("#dynamicsearchDynamic"),
            $selMergeCameraID = $("#selMergeCameraIDDynamic");
    } else if (pageType == '3') {
        var $timeStart = $("#timeStart"),
            $timeEnd = $("#timeEnd"),
            $sidebarOrgSelect = $("#sidebarOrgSelect"),
            $sidebarPoliceSelect = $("#sidebarPoliceSelect"),
            $sidebarCameraSelect = $("#sidebarCameraSelect"),
            $searchMerge_Time = $('#searchMerge_Time'),
            $usearchImg = $("#usearchImg"),
            $mergeSearch = $("#mergeSearch"),
            $selMergeCameraID = $("#selMergeCameraID");
    } else {
        $("#pageSidebarMenu").find(".aui-icon-carsearch2").parents(".sidebar-item").click();
        var $timeStart = $("#timeStart"),
            $timeEnd = $("#timeEnd"),
            $sidebarOrgSelect = $("#sidebarOrgSelect"),
            $sidebarPoliceSelect = $("#sidebarPoliceSelect"),
            $sidebarCameraSelect = $("#sidebarCameraSelect"),
            $searchMerge_Time = $('#searchMerge_Time'),
            $usearchImg = $("#usearchImg"),
            $mergeSearch = $("#mergeSearch"),
            $selMergeCameraID = $("#selMergeCameraID");
    }

    $timeStart.val(startTime);
    $timeEnd.val(endTime);
    if (constcategoryId == '2') {
        $selMergeCameraID.attr("link", "0");
        $selMergeCameraID.find("input[type='radio']").eq(1).click();
        $selMergeCameraID.attr("link", "1");
    } else {
        $selMergeCameraID.attr("link", "0");
        $selMergeCameraID.find("input[type='radio']").eq(2).click();
        $selMergeCameraID.attr("link", "1");
    }
    setTimeout(() => {
        $sidebarOrgSelect.val(stationId); //赋值机构
        $sidebarOrgSelect.selectpicker('refresh');
    }, 500);
    loadSearchOrgInfo($sidebarPoliceSelect, stationId, false, policeId); //通过机构请求派出所
    loadSearchCameraInfo($sidebarCameraSelect, policeId, gbCode, true); //通过请求派出所
    $searchMerge_Time.find('.datepicker-input').eq(0).blur();
    $searchMerge_Time.find('.datepicker-input').eq(1).blur();
    $usearchImg.find(".add-image-item").removeClass("active");
};

//设备详情
function showDeviceDetail(cameraId) {
    var cameraPort = 'v2/org/getCameraDetailInfo',
        cameraData = {
            cameraId
        },
        cameraPortSuccessFunc = function (data) {
            if (data.code === '200') {
                var data = data.data,
                    $body = $("#cameraInfoMask").find(".modal-body .card-content"),
                    html = `<div class="aui-from-horizontal aui-row">
                                        <div class="aui-col-12">
                                            <div class="form-group">
                                                <label class="aui-form-label aui-col-6">镜头名称：</label>
                                                <div class="aui-form-label aui-col-18" title="${data.cameraName ? data.cameraName : '未知'}">${data.cameraName ? data.cameraName : '未知'}</div>
                                            </div>
                                        </div>
                                        <div class="aui-col-12">
                                            <div class="form-group">
                                                <label class="aui-form-label aui-col-6">经纬度：</label>
                                                <div class="aui-form-label aui-col-18" title="${(data.px ? data.px : '未知') + ',' + (data.py ? data.py : '未知')}">${(data.px ? data.px : '未知') + ',' + (data.py ? data.py : '未知')}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="aui-from-horizontal aui-row">
                                        <div class="aui-col-12">
                                            <div class="form-group">
                                                <label class="aui-form-label aui-col-6">镜头编码：</label>
                                                <div class="aui-form-label aui-col-18" title="${data.cameraCode ? data.cameraCode : '未知'}">${data.cameraCode ? data.cameraCode : '未知'}</div>
                                            </div>
                                        </div>
                                        <div class="aui-col-12">
                                            <div class="form-group">
                                                <label class="aui-form-label aui-col-6">安装位置：</label>
                                                <div class="aui-form-label aui-col-18" title="${data.cameraAddress ? data.cameraAddress : '未知'}">${data.cameraAddress ? data.cameraAddress : '未知'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="aui-from-horizontal aui-row">
                                        <div class="aui-col-12">
                                            <div class="form-group">
                                                <label class="aui-form-label aui-col-6">镜头IP：</label>
                                                <div class="aui-form-label aui-col-18" title="${data.cameraIp ? data.cameraIp : '未知'}">${data.cameraIp ? data.cameraIp : '未知'}</div>
                                            </div>
                                        </div>
                                        <div class="aui-col-12">
                                            <div class="form-group">
                                                <label class="aui-form-label aui-col-6">监控方位：</label>
                                                <div class="aui-form-label aui-col-18" title="${data.locationType ? data.locationType : '未知'}">${data.locationType ? data.locationType : '未知'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="aui-from-horizontal aui-row">
                                        <div class="aui-col-12">
                                            <div class="form-group">
                                                <label class="aui-form-label aui-col-6">镜头类型：</label>
                                                <div class="aui-form-label aui-col-18" title="${(data.cameraQualityDesc ? data.cameraQualityDesc : '未知') + '-' + (data.cameraTypeDesc ? data.cameraTypeDesc : '未知') + '-' + (data.devType ? data.devType : '未知')}">${(data.cameraQualityDesc ? data.cameraQualityDesc : '未知') + '-' + (data.cameraTypeDesc ? data.cameraTypeDesc : '未知') + '-' + (data.devType ? data.devType : '未知')}</div>
                                            </div>
                                        </div>
                                        <div class="aui-col-12">
                                            <div class="form-group">
                                                <label class="aui-form-label aui-col-6">建设类型：</label>
                                                <div class="aui-form-label aui-col-18" title="${data.constcategoryId ? data.constcategoryId : '未知'}">${data.constcategoryId ? data.constcategoryId : '未知'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="aui-from-horizontal aui-row">
                                        <div class="aui-col-12">
                                            <div class="form-group">
                                                <label class="aui-form-label aui-col-6">所属机构：</label>
                                                <div class="aui-form-label aui-col-18" title="${data.orgName ? data.orgName : '未知'}">${data.orgName ? data.orgName : '未知'}</div>
                                            </div>
                                        </div>
                                        <div class="aui-col-12">
                                            <div class="form-group">
                                                <label class="aui-form-label aui-col-6">建设信息：</label>
                                                <div class="aui-form-label aui-col-18" title="${data.useProjectDesc ? data.useProjectDesc : '未知'}">${data.useProjectDesc ? data.useProjectDesc : '未知'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="aui-from-horizontal aui-row">
                                        <div class="aui-col-12">
                                            <div class="form-group">
                                                <label class="aui-form-label aui-col-6">镜头ID：</label>
                                                <div class="aui-form-label aui-col-18" title="${data.cameraId ? data.cameraId : '未知'}">${data.cameraId ? data.cameraId : '未知'}</div>
                                            </div>
                                        </div>
                                        <div class="aui-col-12">
                                            <div class="form-group">
                                                <label class="aui-form-label aui-col-6">国标编码：</label>
                                                <div class="aui-form-label aui-col-18" title="${data.gbCode ? data.gbCode : '未知'}">${data.gbCode ? data.gbCode : '未知'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="aui-from-horizontal aui-row">
                                        <div class="aui-col-12">
                                            <div class="form-group">
                                                <label class="aui-form-label aui-col-6">镜头厂商：</label>
                                                <div class="aui-form-label aui-col-18" title="${data.manufacturerName ? data.manufacturerName : '未知'}">${data.manufacturerName ? data.manufacturerName : '未知'}</div>
                                            </div>
                                        </div>
                                        <div class="aui-col-12">
                                            <div class="form-group">
                                                <label class="aui-form-label aui-col-6">维护人：</label>
                                                <div class="aui-form-label aui-col-18" title="${data.maintPerson ? data.maintPerson : '未知'}">${data.maintPerson ? data.maintPerson : '未知'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="aui-from-horizontal aui-row">
                                        <div class="aui-col-24">
                                            <div class="form-group">
                                                <label class="aui-form-label aui-col-4">维护单位：</label>
                                                <div class="aui-form-label aui-col-20" title="${data.maintunit ? data.maintunit : '未知'}">${data.maintunit ? data.maintunit : '未知'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="aui-from-horizontal aui-row">
                                        <div class="aui-col-24">
                                            <div class="form-group">
                                                <label class="aui-form-label aui-col-4">镜头通道：</label>
                                                <div class="aui-form-label aui-col-20" title="${data.deviceChanId ? data.deviceChanId : '未知'}">${data.deviceChanId ? data.deviceChanId : '未知'}</div>
                                            </div>
                                        </div>
                                    </div>`;
                $body.html(html);
                $("#cameraInfoMask").modal("show");
            }
        };
    loadData(cameraPort, true, cameraData, cameraPortSuccessFunc, '', 'GET');
};

//全局小图右键事件
$(document).on("mousedown", ".img-right-event", function (e) {
    e.stopPropagation();
    e.preventDefault();
    $('#rightMouseImgMenu').off().remove();
    $('#rightMouseImgMenuchild').off().remove();
    var type = 0; //哪个页面
    if ($("#pageSidebarMenu").find(".sidebar-item.active .aui-icon-color-default").hasClass("aui-icon-monitor")) {
        type = 2; //纯动态
    } else if ($("#pageSidebarMenu").find(".sidebar-item.active .aui-icon-color-default").hasClass("aui-icon-carsearch2")) {
        type = 3; //动静结合
    } else if ($("#pageSidebarMenu").find(".sidebar-item.active .aui-icon-color-default").hasClass("aui-icon-left-personnal-retrieval")) {
        type = 1; //纯静态
    } else if ($("#pageSidebarMenu").find(".sidebar-item.active .aui-icon-color-default").hasClass("aui-icon-warning")) {
        type = 5; //告警
    } else if ($("#pageSidebarMenu").find(".sidebar-item.active .aui-icon-color-default").hasClass("aui-icon-monitor2")) {
        type = 4; //布控
    } else if ($("#pageSidebarMenu").find(".sidebar-item.active .aui-icon-color-default").hasClass("aui-icon-customers2")) { //我的
        type = 6;
    } else if ($("#pageSidebarMenu").find(".sidebar-item.active .aui-icon-color-default").hasClass("aui-icon-personnel")) { //对象
        type = 7;
    } else if ($("#pageSidebarMenu").find(".sidebar-item.active .aui-icon-color-default").hasClass("aui-icon-setting-2")) { //系统
        type = 8;
    } else if ($("#pageSidebarMenu").find(".sidebar-item.active .aui-icon-color-default").hasClass("aui-icon-library")) { //系统
        type = 9;
    }
    if (e.which == 3) {
        var that = $(this),
            imgUrl = that.find("img").attr('src') ? that.find("img").attr('src') : that.attr('src');
        var $menu = $([
            '<ul class="mask-camera-list" id="rightMouseImgMenu">',
            '   <li class="mask-camera-item" type="0"><i class="bui-icon-menucompare"></i>横向比对</li>',
            '   <li class="mask-camera-item" type="1"><i class="bui-icon-onetoone"></i>1：1识别</li>',
            '   <li class="mask-camera-item" type="2"><i class="bui-icon-quickattention"></i>快速布控</li>',
            '   <hr />',
            '   <li class="mask-camera-item" type="3"><i class="aui-icon-left-personnal-retrieval"></i>静态检索</li>',
            '   <li class="mask-camera-item" type="4"><i class="aui-icon-monitor"></i>动态检索</li>',
            '   <li class="mask-camera-item" type="5"><i class="aui-icon-carsearch2"></i>综合检索</li>',
            '   <li class="mask-camera-item hide" type="6"><i class="aui-icon-setting-2"></i>对象检索</li>',
            '   <li class="mask-camera-item" type="15"><i class="bui-icon-accesscontrol"></i>视频门禁</li>',
            '   <li class="mask-camera-item" type="7"><i class="bui-icon-encyclopedia"></i>百科检索</li>',
            '   <li class="mask-camera-item" type="8"><i class="bui-icon-menuconnect"></i>关联镜头<i class="aui-icon-drop-right"></i></li>',
            '   <li class="mask-camera-item" type="16"><i class="aui-icon-position"></i>镜头定位</li>',
            '   <li class="mask-camera-item" type="17"><i class="aui-icon-camera"></i>镜头信息</li>',
            '   <hr />',
            '   <li class="mask-camera-item" type="9"><i class="bui-icon-menusave"></i>图片另存</li>',
            '   <li class="mask-camera-item" type="10"><i class="bui-icon-addpicture"></i>加入相册</li>',
            '   <li class="mask-camera-item" type="11"><i class="bui-icon-pictureedit"></i>图片编辑</li>',
            '   <hr />',
            '   <li class="mask-camera-item" type="12"><i class="bui-icon-addencyclopedia"></i>加入百科</li>',
            '   <li class="mask-camera-item js-change-cames" type="13" id="sendJWY"><i class="bui-icon-sendjwy"></i>发送警务云</li>',
            '   <li class="mask-camera-item" type="14"><i class="aui-icon-setting-2"></i>同行人分析</li>',
            '</ul>',
        ].join(''));
        var menuLen = $('#rightMouseImgMenu').length;
        if (menuLen > 0) {
            $('#rightMouseImgMenu').off().remove();
        }
        $('body').append($menu);
        // 未开发模块置灰
        // $("#rightMouseImgMenu").find(".mask-camera-item").eq(2).addClass("disabled");
        $("#rightMouseImgMenu").find(".mask-camera-item").eq(7).addClass("disabled");
        $("#rightMouseImgMenu").find(".mask-camera-item").eq(8).addClass("disabled");
        $("#rightMouseImgMenu").find(".mask-camera-item").eq(14).addClass("disabled");
        $("#rightMouseImgMenu").find(".mask-camera-item").eq(15).addClass("disabled");
        $("#rightMouseImgMenu").find(".mask-camera-item").eq(17).addClass("disabled"); //同行人分析
        if (type == '1') { //静态页面可以点击对象检索
            $("#rightMouseImgMenu").find(".mask-camera-item").eq(6).removeClass("disabled");
        } else {
            $("#rightMouseImgMenu").find(".mask-camera-item").eq(6).addClass("disabled");
        }

        if (type == '2' || type == '3' || type == '5') { //关联镜头(动态、综合和告警)
            if (type == '2' || type == '3') {
                if (that.parent().data("listData") && that.parent().data("listData").gbCode) { //关联镜头
                    $("#rightMouseImgMenu").find(".mask-camera-item").eq(9).removeClass("disabled");
                } else {
                    $("#rightMouseImgMenu").find(".mask-camera-item").eq(9).addClass("disabled");
                }
            } else if (type == '5') {
                if (!$(that).parent().hasClass("image-box-flex")) {
                    if ((that.parents(".warning-item").data("listData") && that.parents(".warning-item").data("listData").gbCode && that.parents(".warning-item").data("listData").stationId && that.parents(".warning-item").data("listData").policeId) ||
                        (that.parents(".image-card-container.image-card-item").data("listData") && that.parents(".image-card-container.image-card-item").data("listData").gbCode && that.parents(".image-card-container.image-card-item").data("listData").stationId && that.parents(".image-card-container.image-card-item").data("listData").policeId) ||
                        (that.parents("#alarmList").data("listData") && that.parents("#alarmList").data("listData")[that.parents(".aui-timeline-wrap.clearfix").index()].gbCode && that.parents("#alarmList").data("listData")[that.parents(".aui-timeline-wrap.clearfix").index()].stationId && that.parents("#alarmList").data("listData")[that.parents(".aui-timeline-wrap.clearfix").index()].policeId)) {
                        $("#rightMouseImgMenu").find(".mask-camera-item").eq(9).removeClass("disabled");
                    } else {
                        $("#rightMouseImgMenu").find(".mask-camera-item").eq(9).addClass("disabled");
                    }
                } else {
                    $("#rightMouseImgMenu").find(".mask-camera-item").eq(9).addClass("disabled");
                }
            }
        } else {
            $("#rightMouseImgMenu").find(".mask-camera-item").eq(9).addClass("disabled");
        }

        if (type == '2' || type == '3') { //镜头定位
            if (that.parent().data("listData") && that.parent().data("listData").gbCode) { //轨迹分析暂时不用定位
                $("#rightMouseImgMenu").find(".mask-camera-item").eq(10).removeClass("disabled");
            } else {
                $("#rightMouseImgMenu").find(".mask-camera-item").eq(10).addClass("disabled");
            }
        } else {
            $("#rightMouseImgMenu").find(".mask-camera-item").eq(10).addClass("disabled");
        }

        if (type == '2' || type == '3' || type == '5') { //镜头信息
            if (type == '5') {
                $("#rightMouseImgMenu").find(".mask-camera-item").eq(11).removeClass("disabled");
                if ($(that).parent().hasClass("image-box-flex")) { //点击的是告警安对象排序的布控照片，没有镜头信息
                    $("#rightMouseImgMenu").find(".mask-camera-item").eq(11).addClass("disabled");
                }
            } else {
                if (that.parent().data("listData") && that.parent().data("listData").gbCode) {
                    $("#rightMouseImgMenu").find(".mask-camera-item").eq(11).removeClass("disabled");
                } else {
                    $("#rightMouseImgMenu").find(".mask-camera-item").eq(11).addClass("disabled");
                }
            }
        } else {
            $("#rightMouseImgMenu").find(".mask-camera-item").eq(11).addClass("disabled");
        }

        if ($(that).parent().hasClass('imgBase-card-wrap')) { // 如果为综合检索中人员信息图片 不可横向比对
            $("#rightMouseImgMenu").find(".mask-camera-item").eq(0).addClass("disabled");
        } else {
            $("#rightMouseImgMenu").find(".mask-camera-item").eq(0).removeClass("disabled");
        }

        if (type == '5') {
            if ($(that).parent().hasClass("image-box-flex")) { //点击的是告警安对象排序的布控照片，没有大图，横向比对禁止
                $("#rightMouseImgMenu").find(".mask-camera-item").eq(0).addClass("disabled");
            } else {
                $("#rightMouseImgMenu").find(".mask-camera-item").eq(0).removeClass("disabled");
            }
        }

        if (type == '6' || type == '7' || type == '8') { //我的和对象没有横向比对
            $("#rightMouseImgMenu").find(".mask-camera-item").eq(0).addClass("disabled");
            if (type == '7' && $(that).parents(".swiper-scroll-view").attr("id") == 'portraitContentThree') { //动态库的情况下
                //$("#rightMouseImgMenu").find(".mask-camera-item").eq(0).removeClass("disabled");
                $("#rightMouseImgMenu").find(".mask-camera-item").eq(9).removeClass("disabled");
                $("#rightMouseImgMenu").find(".mask-camera-item").eq(11).removeClass("disabled");
            }
        }

        if (type == '9') {
            $("#rightMouseImgMenu").find(".mask-camera-item").eq(0).addClass("disabled");
            if (that.parent().data("listData") && that.parent().data("listData").gbCode) { //关联镜头
                $("#rightMouseImgMenu").find(".mask-camera-item").eq(9).removeClass("disabled");
                $("#rightMouseImgMenu").find(".mask-camera-item").eq(10).removeClass("disabled");
                $("#rightMouseImgMenu").find(".mask-camera-item").eq(11).removeClass("disabled");
            } else {
                $("#rightMouseImgMenu").find(".mask-camera-item").eq(9).addClass("disabled");
                $("#rightMouseImgMenu").find(".mask-camera-item").eq(10).addClass("disabled");
                $("#rightMouseImgMenu").find(".mask-camera-item").eq(11).addClass("disabled");
            }
        }
        //地图框选显示抓拍图页面
        if (that.parents(".popup-body-face-cntList").attr("id") == 'popup-body-face-cntList' || that.parents(".popup-body-alarm-cntList").attr("id") == 'popup-body-alarm-cntList') {
            $("#rightMouseImgMenu").find(".mask-camera-item").eq(0).addClass("disabled");
            $("#rightMouseImgMenu").find(".mask-camera-item").eq(11).removeClass("disabled");
            $("#rightMouseImgMenu").find(".mask-camera-item").eq(9).removeClass("disabled");
            $("#rightMouseImgMenu").find(".mask-camera-item").eq(10).addClass("disabled");
        }

        // 给右键菜单添加绑定事件
        $menu.find('.mask-camera-item').off('click').on('click', function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            if ($(this).hasClass("disabled")) {
                return;
            }
            var menuIndex = $(this).attr("type");
            if (menuIndex == '0') { // 横向比对
                isClickOneToOne = true;
                if (type == 1) { // 静态检索
                    $(that).find(".image-card-img").dblclick();
                } else if (type == 2 || type == 3) { // 非静态检索
                    if (($("#current-page-dynamic").hasClass("display-none") && type == 2) || ($("#current-page").hasClass("display-none") && type == 3)) { //纯动态轨迹分析页面或者综合轨迹分析
                        $(that).click();
                    } else {
                        if ($(that).parent().hasClass('image-new-wrap')) {
                            $(that).find(".image-card-img").dblclick();
                        } else {
                            $(that).find(".image-card-img").click();
                        }
                    }
                } else if (type == 4) { //布控
                    $(that).parent().click();
                } else if (type == 5) { //告警
                    if ($(that).parent().hasClass("warning-item-img")) { //按时间排序
                        $(that).closest('li.warning-item').click();
                    } else if ($(that).parents(".image-card-container").hasClass("image-card-item")) { //按对象排序
                        $(that).closest('.image-card-container.image-card-item').click();
                    } else if ($(that).parents("div.clearfix").hasClass("aui-timeline-wrap")) {
                        $(that).closest('.aui-timeline-wrap.clearfix').click();
                    }
                }
            } else if (menuIndex == '1') { // 1：1识别
                var url = "./facePlatform/onetoone-new.html?dynamic=" + Global.dynamic;
                loadPage($('.one-to-one-popup'), url);
                $('.one-to-one-popup').removeClass('hide');
                $('.one-to-one-popup').find('#search-before1').addClass('none');
                $('.one-to-one-popup').find('#search-after1').removeClass('none');
                $('.one-to-one-popup').find('#search-after1 img').attr('src', imgUrl);
            } else if (menuIndex == '2') { // 快速布控
                if ($(that).parent().hasClass('imgBase-card-wrap') && type == '1') {   //静态人员信息要关闭弹窗
                    $('#staticContrastEditModal').modal('hide');
                } else if ($(that).parent().hasClass('imgBase-card-wrap') && type == '3') {
                    $("#contrastEditModal").modal('hide');
                }

                $('#contrastEditModal').modal('hide');
                //$('.modal-backdrop').remove(); // 清除遮罩
                var $sideBar = $('#pageSidebarMenu').find('.aui-icon-monitor2'),
                    $sideItem = $sideBar.closest('.sidebar-item'),
                    sideIndex = $sideItem.index(),
                    $contentItem = $('#content-box').find('.content-save-item').eq(sideIndex),
                    $contentUserImg = $contentItem.find('#newBukong'),
                    url = $sideBar.parent("a").attr("lc") + "?dynamic=" + Global.dynamic;

                if (!$sideBar.parents("li").hasClass("active")) {
                    $sideItem.click();
                    if ($("#newBukong").length == 0) {
                        loadPage($contentItem, url);
                    }
                } else {
                    // if ($("#backToSearchControl").length > 0 && !$("#currentPageControlPath").hasClass(
                    //         "display-none")) {
                    //     $("#backToSearchControl").click();
                    // }
                    if ($("#backToControlOverview").length > 0 && !$("#controlDetailPage").hasClass(
                        "display-none")) {
                        $("#backToControlOverview").click();
                    }
                }
                if (!$("#snapMoreTypeModal").hasClass("hide")) {
                    $("#snapMoreTypeModal").find(".aui-icon-not-through").click();
                }

                setTimeout(function () {
                    $("#newBukong").click();
                    $('#selectObject').removeClass('hide');
                    $('#selectControl').addClass('hide');

                    var html = `<div class="add-image-item">
							<img class="add-image-img" src="${imgUrl}" alt="">
							<i class="aui-icon-delete-line"></i>
						</div>`;
                    $('#control_imgList').find('.add-image-icon').before(html);

                    $('#control_imgList').removeClass('center');
                    $('#control_imgList').find('.add-image-icon').removeClass('add-image-new');
                    $('#control_imgList').find('.add-image-box-text').addClass('hide');
                    $("#control_imgList .add-image-icon").siblings('.add-image-item').removeClass('active');
                    $('#addImgWarning').addClass('hide');
                }, 100);
            } else if (menuIndex == '3') { // 静态检索
                if ($(that).parent().hasClass('imgBase-card-wrap') && type == '1') {   //静态人员信息要关闭弹窗
                    $('#staticContrastEditModal').modal('hide');
                } else if ($(that).parent().hasClass('imgBase-card-wrap') && type == '3') {
                    $("#contrastEditModal").modal('hide');
                }

                if (!$("#snapMoreTypeModal").hasClass("hide")) {
                    $("#snapMoreTypeModal").find(".aui-icon-not-through").click();
                }

                if (type == 1) { // 静态检索页面
                    window.loadData('v2/faceDt/getImgByUrl', true, { // 根据url获取base64
                        url: $(that).parent().find(".image-card-img").attr("src")
                    }, function (data) {
                        if (data.code === '200') {
                            var $searchImg = $('#searchImgS'),
                                $staticSearch = $('#staticSearch');
                            var imgUrl = 'data:image/png;base64,' + data.base64; // 获取动态库 被点击图片base64
                            var html = createAddImageItem(imgUrl); // 创建上传框发起检索图片html
                            if ($searchImg.find(".add-image-item").length > 0) {
                                $searchImg.find('.add-image-item').removeClass('active'); // 去掉之前检索图片的激活状态
                                $searchImg.find('.add-image-icon').before(html); // 新的检索图片插入上传图片框
                                $searchImg.find('.uploadFile')[0].value = '';
                                var $imgItem = $searchImg.find('.add-image-item'); // 所有上传图片的节点
                                if ($imgItem.length > 5) { // 上传图片大于5张 3行
                                    $searchImg.removeClass('scroll');
                                    var clientH = $searchImg[0].clientHeight;
                                    $searchImg.addClass('scroll');
                                    $searchImg.animate({ // 自动滚动到上传框底部
                                        'scrollTop': clientH
                                    }, 500);
                                }
                            } else {
                                $searchImg.find('.add-image-icon').before(html);
                                $searchImg.removeClass('center');
                                $searchImg.find('.add-image-icon').removeClass('add-image-new');
                                $searchImg.find('.add-image-box-text').addClass('hide');
                            }
                            imgDom(imgUrl, $staticSearch, $searchImg); // 扣人脸
                            $('#searchImgS').prev().find("img").attr("src", imgUrl); // 上侧大图赋值
                        }
                    });
                } else { // 非静态检索页面
                    window.loadData('v2/faceDt/getImgByUrl', true, { // 根据url获取base64
                        url: $(that).attr("src") ? $(that).attr("src") : $(that).find("img").attr("src")
                    }, function (data) {
                        if (data.code === '200') {
                            $("#pageSidebarMenu").find(".aui-icon-left-personnal-retrieval").parents(".sidebar-item").click();
                            var $searchImg = $('#searchImgS'),
                                $staticSearch = $('#staticSearch');
                            var imgUrl = 'data:image/png;base64,' + data.base64; // 获取动态库 被点击图片base64
                            if ($searchImg.find(".add-image-item").length > 0) {
                                var html = createAddImageItem(imgUrl);
                                $searchImg.find('.add-image-item').removeClass('active');
                                $searchImg.find('.add-image-icon').before(html);
                                $searchImg.find('.uploadFile')[0].value = '';
                                var $imgItem = $searchImg.find('.add-image-item');
                                if ($imgItem.length > 5) {
                                    $searchImg.removeClass('scroll');
                                    var clientH = $searchImg[0].clientHeight;
                                    $searchImg.addClass('scroll');
                                    $searchImg.animate({
                                        'scrollTop': clientH
                                    }, 500);
                                }
                                // 自动搜索图片
                                window.setTimeout(function () {
                                    if ($staticSearch.length > 0) {
                                        imgDom(imgUrl, $staticSearch, $searchImg);
                                    }
                                }, 100)
                            } else {
                                var html = createAddImageItem(imgUrl);
                                $searchImg.find('.add-image-icon').before(html);
                                $searchImg.removeClass('center');
                                $searchImg.find('.add-image-icon').removeClass('add-image-new');
                                $searchImg.find('.add-image-box-text').addClass('hide');
                                // 自动搜索图片
                                window.setTimeout(function () {
                                    if ($staticSearch.length > 0) {
                                        imgDom(imgUrl, $staticSearch, $searchImg);
                                    }
                                }, 100)
                            }
                            $('#searchImgS').prev().find("img").attr("src", imgUrl); // 上侧大图赋值
                        }
                    });
                }
            } else if (menuIndex == '4') { // 动态检索
                if ($(that).parent().hasClass('imgBase-card-wrap') && type == '1') {   //静态人员信息要关闭弹窗
                    $('#staticContrastEditModal').modal('hide');
                } else if ($(that).parent().hasClass('imgBase-card-wrap') && type == '3') {
                    $("#contrastEditModal").modal('hide');
                }
                if (!$("#snapMoreTypeModal").hasClass("hide")) {
                    $("#snapMoreTypeModal").find(".aui-icon-not-through").click();
                }

                if (type == 2) { // 动态检索页面
                    window.loadData('v2/faceDt/getImgByUrl', true, { // 根据url获取base64
                        url: $(that).parent().find(".image-card-img").attr("src")
                    }, function (data) {
                        if (data.code === '200') {
                            var $usearchImg = $("#usearchImgDynamic"),
                                $dynamicsearch = $('#dynamicsearchDynamic');
                            var imgUrl = 'data:image/png;base64,' + data.base64; // 获取动态库 被点击图片base64
                            var html = createAddImageItem(imgUrl); // 创建上传框发起检索图片html
                            var listData = $(that).hasClass("image-card-box") ? $(that).parents(".image-card-wrap").data("listData") : { searchId: $(that).attr("searchId"), searchIndex: $(that).attr("searchIndex") };
                            if ($usearchImg.find(".add-image-item").length > 0) {
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
                            } else {
                                $usearchImg.find('.add-image-icon').before(html);
                                $usearchImg.removeClass('center');
                                $usearchImg.find('.add-image-icon').removeClass('add-image-new');
                                $usearchImg.find('.add-image-box-text').addClass('hide');
                            }
                            imgDom(imgUrl, $dynamicsearch, $usearchImg, false, false, listData); // 扣人脸
                        }
                    });
                } else { // 非动态检索页面
                    var listData = type == 3 ? ($(that).hasClass("image-card-box") ? $(that).parent().data("listData") : { searchId: $(that).attr("searchId"), searchIndex: $(that).attr("searchIndex") }) : {};
                    $("#pageSidebarMenu").find(".aui-icon-monitor").parents(".sidebar-item").click();
                    var $usearchImg = $("#usearchImgDynamic"),
                        $dynamicsearch = $('#dynamicsearchDynamic');
                    if ($usearchImg.find(".add-image-item").length > 0) {
                        var html = createAddImageItem(imgUrl);
                        $usearchImg.find('.add-image-item').removeClass('active');
                        $usearchImg.find('.add-image-icon').before(html);
                        $usearchImg.find('.uploadFile')[0].value = '';
                        var $imgItem = $usearchImg.find('.add-image-item');
                        if ($imgItem.length > 5) {
                            $usearchImg.removeClass('scroll');
                            var clientH = $usearchImg[0].clientHeight;
                            $usearchImg.addClass('scroll');
                            $usearchImg.animate({
                                'scrollTop': clientH
                            }, 500);
                        }
                        // 自动搜索图片
                        window.setTimeout(function () {
                            if ($dynamicsearch.length > 0) {
                                if (JSON.stringify(listData) != '{}') {
                                    imgDom(imgUrl, $dynamicsearch, $usearchImg, false, false, listData);
                                } else {
                                    imgDom(imgUrl, $dynamicsearch, $usearchImg);
                                }
                            }
                        }, 100)
                    } else {
                        var html = createAddImageItem(imgUrl);
                        $usearchImg.find('.add-image-icon').before(html);
                        $usearchImg.removeClass('center');
                        $usearchImg.find('.add-image-icon').removeClass('add-image-new');
                        $usearchImg.find('.add-image-box-text').addClass('hide');
                        // 自动搜索图片
                        window.setTimeout(function () {
                            if ($dynamicsearch.length > 0) {
                                if (JSON.stringify(listData) != '{}') {
                                    imgDom(imgUrl, $dynamicsearch, $usearchImg, false, false, listData);
                                } else {
                                    imgDom(imgUrl, $dynamicsearch, $usearchImg);
                                }
                            }
                        }, 100)
                    }
                }
            } else if (menuIndex == '5') { // 综合检索
                if ($(that).parent().hasClass('imgBase-card-wrap') && type == '1') {   //静态人员信息要关闭弹窗
                    $('#staticContrastEditModal').modal('hide');
                } else if ($(that).parent().hasClass('imgBase-card-wrap') && type == '3') {
                    $("#contrastEditModal").modal('hide');
                }
                if (!$("#snapMoreTypeModal").hasClass("hide")) {
                    $("#snapMoreTypeModal").find(".aui-icon-not-through").click();
                }

                if (type == 3) { // 综合检索页面
                    window.loadData('v2/faceDt/getImgByUrl', true, { // 根据url获取base64
                        url: $(that).parent().find(".image-card-img").attr("src")
                    }, function (data) {
                        if (data.code === '200') {
                            var $usearchImg = $('#usearchImg'),
                                $mergeSearch = $("#mergeSearch");
                            var imgUrl = 'data:image/png;base64,' + data.base64; // 获取动态库 被点击图片base64
                            var html = createAddImageItem(imgUrl); // 创建上传框发起检索图片html
                            var listData = $(that).hasClass("image-card-box") ? $(that).parents(".image-card-wrap").data("listData") : { searchId: $(that).attr("searchId"), searchIndex: $(that).attr("searchIndex") };
                            if ($usearchImg.find(".add-image-item").length > 0) {
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
                            } else {
                                $usearchImg.find('.add-image-icon').before(html);
                                $usearchImg.removeClass('center');
                                $usearchImg.find('.add-image-icon').removeClass('add-image-new');
                                $usearchImg.find('.add-image-box-text').addClass('hide');
                            }
                            imgDom(imgUrl, $mergeSearch, $usearchImg, false, false, listData); // 扣人脸
                        }
                    });
                } else { // 非综合检索页面
                    var listData = type == 2 ? ($(that).hasClass("image-card-box") ? $(that).parent().data("listData") : { searchId: $(that).attr("searchId"), searchIndex: $(that).attr("searchIndex") }) : {};
                    $("#pageSidebarMenu").find(".aui-icon-carsearch2").parents(".sidebar-item").click();
                    var $usearchImg = $('#usearchImg'),
                        $mergeSearch = $("#mergeSearch");
                    if ($usearchImg.find(".add-image-item").length > 0) {
                        var html = createAddImageItem(imgUrl);
                        $usearchImg.find('.add-image-item').removeClass('active');
                        $usearchImg.find('.add-image-icon').before(html);
                        $usearchImg.find('.uploadFile')[0].value = '';
                        var $imgItem = $usearchImg.find('.add-image-item');
                        if ($imgItem.length > 5) {
                            $usearchImg.removeClass('scroll');
                            var clientH = $usearchImg[0].clientHeight;
                            $usearchImg.addClass('scroll');
                            $usearchImg.animate({
                                'scrollTop': clientH
                            }, 500);
                        }
                        // 自动搜索图片
                        window.setTimeout(function () {
                            if ($mergeSearch.length > 0) {
                                if (JSON.stringify(listData) != '{}') {
                                    imgDom(imgUrl, $mergeSearch, $usearchImg, false, false, listData);
                                } else {
                                    imgDom(imgUrl, $mergeSearch, $usearchImg);
                                }
                            }
                        }, 100)
                    } else {
                        var html = createAddImageItem(imgUrl);
                        $usearchImg.find('.add-image-icon').before(html);
                        $usearchImg.removeClass('center');
                        $usearchImg.find('.add-image-icon').removeClass('add-image-new');
                        $usearchImg.find('.add-image-box-text').addClass('hide');
                        // 自动搜索图片
                        window.setTimeout(function () {
                            if ($mergeSearch.length > 0) {
                                if (JSON.stringify(listData) != '{}') {
                                    imgDom(imgUrl, $mergeSearch, $usearchImg, false, false, listData);
                                } else {
                                    imgDom(imgUrl, $mergeSearch, $usearchImg);
                                }
                            }
                        }, 100)
                    }
                }
            } else if (menuIndex == '6') { // 对象检索
                var idCard = $(that).parent().find(".image-info-box .form-group").eq(3).find(".form-text").html();
                $("#pageSidebarMenu").find(".aui-icon-personnel").parents(".sidebar-item").click();
                $("#portraitCardPage").find("#personSearch").val(idCard);
                setTimeout(function () {
                    var ztree = $.fn.zTree.getZTreeObj("portrait-tree-list");
                    ztree.getNodes().forEach((val, index) => {
                        if (val.libId == '0010') {
                            $("#" + val.tId + "_a").click();
                        }
                    })
                }, 1000);
            } else if (menuIndex == '7') { // 百科检索
                console.log('待开发');
            } else if (menuIndex == '9') { // 保存图片
                if (imgUrl.indexOf("http") == 0) {
                    var portData = {
                        'url': imgUrl
                    };
                } else {
                    var portData = {
                        'base64': imgUrl
                    };
                }
                var port = 'v2/file/exportFileToCache',
                    successFunc = function (data) {
                        if (data.code == '200') {
                            var post_url = serviceUrl + '/v2/file/exportFile?downId=' + data.downId + '&token=' + $.cookie('xh_token');
                            if ($("#IframeReportImg").length === 0) {
                                $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
                            }
                            $('#IframeReportImg').attr("src", post_url);
                        } else {
                            warningTip.say(data.message);
                        }
                    };
                loadData(port, true, portData, successFunc);
            } else if (menuIndex == '10') { // 加入相册
                if (parseInt($(".temporaryShelfNum").html()) < temporaryMaxNum) {
                    for (let i = 0; i < $(".temporaryShelfContent ul").find(".image-card-img").length; i++) {
                        if ($(".temporaryShelfContent ul").find(".image-card-img").eq(i).attr('srcHttp') == imgUrl) {
                            warningTip.say('相册中已存在该人员！');
                            $('#rightMouseImgMenu').addClass('hide');
                            return;
                        }
                    }
                    window.loadData('v2/faceDt/getImgByUrl', true, {
                        url: imgUrl
                    }, function (data) {
                        if (data.code == '200') {
                            if (data.base64) {
                                var imgUrlBase64 = 'data:image/png;base64,' + data.base64;
                                var html = `<li class="image-card-wrap type-5 onecj">
                                                <div class="image-card-box">
                                                    <div class="image-checkbox-wrap">
                                                        <label class="ui-checkboxradio-checkbox-label ui-checkboxradio-label ui-button ui-widget">
                                                            <span class="ui-checkboxradio-icon  ui-icon ui-icon-background ui-icon-blank"></span>
                                                        </label>
                                                    </div>
                                                    <img class="image-card-img" src="${imgUrlBase64}" srcHttp="${imgUrl}" alt="">
                                                </div>
                                            </li>`;
                                $(".temporaryShelfContent ul").append(html);
                                var numPrev = parseInt($(".temporaryShelfNum").html());
                                numPrev++;
                                $(".temporaryShelfNum").html(numPrev);
                                $(".temporaryShelf .titlenameNum").html(numPrev);

                                $('#rightMouseImgMenu').addClass('hide');
                            } else {
                                warningTip.say('该图片已经失效！');
                            }
                        } else {
                            warningTip.say('暂存图片失败！');
                        }
                    });
                } else {
                    warningTip.say('相册中人员数已达最大限制！');
                    $('#rightMouseImgMenu').addClass('hide');
                }
            } else if (menuIndex == '11') { // 图片编辑
                console.log('待开发');
            } else if (menuIndex == '12') { // 加入百科
                console.log('待开发');
            } else if (menuIndex == '13') { // 发送警务云
                $("#rightMouseImgMenuTWY").click();

                $('.multiPickerDlg_right_no_result').html('<i></i>未选择人员');
                $('#memberSearchInput').attr('placeholder', '搜索人员');
                $('.type-change-left').text('人员列表');
                $('.multiPickerDlg_right_title>span').text('已选接收人');
                $('#partyTree').remove();
                $('.type-change-right').hide();
                $('.layui-layer-btn').attr('id', 'noticeUserList');
                showLoading($('.layui-layer-content'));
                // 告警接收人 左侧列表参数
                var controlOpt = {
                    page: '1',
                    size: '15'
                }
                controlOpt.page = '1';
                var searchPage = 2;
                // controlOpt.orgids = orgids;
                // 告警接收人
                var receivePort = 'v2/user/getOrgUserInfos';
                var receiveSuccessFunc = function (data) {
                    if (data.code === '200') {
                        $('#saveNode').html('');
                        var liList = '',
                            html = '';
                        var list = data.data.list;
                        if (list) {
                            //判断是否有选中值
                            var userSaveVal = [];
                            if (list.length > 0) {
                                for (var i = 0; i < list.length; i++) {
                                    liList += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`
                                };
                                html = `<div id="receiveResultView" class="ww_searchResult">
                                            <ul id="receive_member_list_view" class="ztree">${liList}</ul>
                                        </div>`;
                            } else {
                                html = '<p class="search_member_none">当前所选分局暂无告警接收人</p>';
                                $('.multiPickerDlg_right_title').find('.js-remove-all').click();
                            }
                            $('.multiPickerDlg_search_wrapper').append(html);
                            if (userSaveVal && userSaveVal.length > 0) {
                                $('#receive_member_list_view').data({
                                    'cameraList': userSaveVal
                                });
                                var liHtml = '';
                                userSaveVal.forEach(function (item) {
                                    var liNiName = item.userName ? item.userName : item.userName;
                                    var liLoginName = item.userId ? item.userId : item.userId;
                                    liHtml += '<li title=' + item.title + ' data-name=' + liNiName + ' data-id=' + item.orgId + ' userId=' + liLoginName + ' class="ww_menuDialog_DualCols_colRight_cnt_item token-input-token js_list_item">' +
                                        '<span class="ww_commonImg icon icon_folder_blue"></span>' +
                                        '<span class="ww_treeMenu_item_text" title=' + item.title + '>' + liNiName + '</span>' +
                                        '<a href="javascript:" class="ww_menuDialog_DualCols_colRight_cnt_item_delete"><span class="ww_commonImg ww_commonImg_DeleteItem js_delete"></span></a>' +
                                        '</li>';
                                    //左侧选中
                                    $('#receive_member_list_view').find('li[userId="' + liLoginName + '"] .button').addClass('checkbox_true_full');
                                });
                                $('#js-camera-totle').text(userSaveVal.length);
                                $('.multiPickerDlg_right_no_result').hide();
                                $('#saveNode').html(liHtml);
                            } else {
                                $('#receive_member_list_view').data({
                                    'cameraList': []
                                });
                            }
                            // 点击清空事件
                            $('.js-remove-all').off().on('click', function () {
                                $('#saveNode').html('');
                                $('#receive_member_list_view').data({
                                    'cameraList': []
                                });
                                $('#js-camera-totle').text('0');
                                $('#receive_member_list_view li .button').removeClass('checkbox_true_full');
                                $('#search_member_list li .button').removeClass('checkbox_true_full');
                                $('.multiPickerDlg_right_no_result').show();

                            });
                            // 右侧点击取消选中
                            $('#saveNode').on('click', 'li', function () {
                                var $this = $(this);
                                var userId = $this.attr('userId');
                                var saveVal = [];
                                $('#receive_member_list_view').data('cameraList').forEach(function (item) {
                                    saveVal.push(item);
                                })
                                for (var i = 0; i < saveVal.length; i++) {
                                    if (saveVal[i].userId == userId || saveVal[i].userId == userId) {
                                        saveVal.splice(i, 1);
                                        $('#receive_member_list_view').find('li[userId="' + userId + '"] .button').removeClass('checkbox_true_full');
                                        $('#search_member_list').find('li[userId="' + userId + '"] .button').removeClass('checkbox_true_full');
                                    };
                                };
                                $('#receive_member_list_view').data({
                                    'cameraList': saveVal
                                });
                                $this.remove();
                                $('#js-camera-totle').text($('#saveNode>li').length);
                                if ($('#saveNode>li').length == 0) {
                                    $('.multiPickerDlg_right_no_result').show();
                                }
                            });
                            // 点击确定
                            $('#noticeUserList .layui-layer-btn0').on('click', function () {
                                var saveVal = $('#receive_member_list_view').data('cameraList') && $('#receive_member_list_view').data('cameraList').length > 0 ? $('#receive_member_list_view').data('cameraList') : [];
                                var noticeUserList = [];
                                var nameArr = [];
                                if (saveVal.length > 0) {
                                    saveVal.forEach(function (item) {
                                        var liLoginName = item.userId;
                                        var liNiName = item.userName;
                                        noticeUserList.push(liLoginName);
                                        nameArr.push(liNiName);
                                    })
                                }

                                $('#rightMouseImgMenuTWY').data({
                                    'noticeUserList': noticeUserList,
                                    'saveVal': saveVal
                                });
                                var portSendJwy = 'v2/file/sendJwy',
                                    portDataSendJwy = {
                                        "image": imgUrl,
                                        "userList": noticeUserList
                                    },
                                    successFuncSendJwy = function (data) {
                                        if (data.code == '200') {
                                            $('.layui-layer-btn1').click();
                                            // 清空告警接受人信息
                                            $('#rightMouseImgMenuTWY').data({
                                                'saveVal': [],
                                                'noticeUserList': []
                                            });

                                            warningTip.say("发送警务云成功");
                                        } else {
                                            warningTip.say("发送警务云失败");
                                        }
                                    };
                                if (noticeUserList.length > 0) {
                                    loadData(portSendJwy, true, portDataSendJwy, successFuncSendJwy);
                                } else {
                                    warningTip.say("请选择接收人");
                                }
                            });
                            // 左侧列表 点击事件
                            function memberListClick($this) {
                                $this.find('.button').toggleClass('checkbox_true_full');
                                $('.multiPickerDlg_right_no_result').hide();
                                var orgId = $this.attr('data-id');
                                var userName = $this.attr('data-name');
                                var title = $this.attr('title');
                                var userId = $this.attr('userId');
                                var orgName = $this.attr('orgName');
                                var index = $this.index();
                                var repInx; //获取重复数组的索引
                                var newSaveVal = [];
                                if ($('#receive_member_list_view').data('cameraList') && $('#receive_member_list_view').data('cameraList').length > 0) {
                                    $('#receive_member_list_view').data('cameraList').forEach(function (item) {
                                        newSaveVal.push(item);
                                    });
                                }
                                if ($this.closest('#searchResult').length > 0) {
                                    $('#receiveResultView').find('li[userId="' + userId + '"]').find('.button').toggleClass('checkbox_true_full');
                                }
                                if (newSaveVal.length > 0) {
                                    for (var i = 0; i < newSaveVal.length; i++) {
                                        if (newSaveVal[i].userId == userId || newSaveVal[i].userId == userId) {
                                            repInx = i;
                                        };
                                    };
                                };
                                if (repInx) {
                                    newSaveVal.splice(repInx, 1);
                                } else {
                                    if (repInx == 0) {
                                        newSaveVal.splice(repInx, 1);
                                    } else {
                                        newSaveVal.push({
                                            orgId: orgId,
                                            userName: userName,
                                            title: title,
                                            index: index,
                                            userId: userId,
                                            orgName: orgName
                                        });
                                    };
                                };
                                //排序
                                function sortSaveVal(data, prop) {
                                    function compareSaveVal(obj1, obj2) {
                                        var time1 = obj1[prop],
                                            time2 = obj2[prop];
                                        if (time1 < time2) {
                                            return -1;
                                        } else if (time1 > time2) {
                                            return 1;
                                        } else {
                                            return 0;
                                        }
                                    }
                                    return data.sort(compareSaveVal);
                                }
                                newSaveVal = sortSaveVal(newSaveVal, 'index');
                                $('#receive_member_list_view').data({
                                    'cameraList': newSaveVal
                                });
                                var liHtml = '';
                                if (newSaveVal && newSaveVal.length > 0) {
                                    newSaveVal.forEach(function (item) {
                                        var liLoginName = item.userId;
                                        var liNiName = item.userName;
                                        liHtml += '<li title=' + item.title + ' data-name=' + liNiName + ' data-id=' + item.orgId + ' userId=' + liLoginName + ' class="ww_menuDialog_DualCols_colRight_cnt_item token-input-token js_list_item">' +
                                            '<span class="ww_commonImg icon icon_folder_blue"></span>' +
                                            '<span class="ww_treeMenu_item_text" title=' + item.title + '>' + liNiName + '</span>' +
                                            '<a href="javascript:" class="ww_menuDialog_DualCols_colRight_cnt_item_delete"><span class="ww_commonImg ww_commonImg_DeleteItem js_delete"></span></a>' +
                                            '</li>';
                                    });
                                    $('#saveNode').html(liHtml);
                                    $('#js-camera-totle').text(newSaveVal.length);
                                } else {
                                    $('#saveNode').empty();
                                    $('#js-camera-totle').text('0');
                                    $('.multiPickerDlg_right_no_result').show();
                                }
                            }
                            $('#receive_member_list_view').on('click', 'li', function () {
                                var $this = $(this);
                                memberListClick($this);
                            });
                            $('#search_member_list').on('click', 'li', function () {
                                var $this = $(this);
                                memberListClick($this);
                            });
                            searchSuccessFunc = function (data) {
                                if (data.code === '200') {
                                    var list = data.data.list;
                                    if (list.length > 0) {
                                        var li = "";
                                        for (var i = 0; i < list.length; i++) {
                                            var receiveList = $('#receive_member_list_view').data('cameraList'),
                                                active = '';
                                            if (receiveList && receiveList.length > 0) {
                                                receiveList.forEach(function (item) {
                                                    if (item.userId == list[i].userId || item.userId == list[i].userId) {
                                                        active = 'checkbox_true_full';
                                                    }
                                                });
                                            }
                                            li += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk ${active}" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`;
                                        };
                                        $('.search_member_none').hide();
                                        $('#search_member_list').show();
                                        $('#search_member_list').addClass('ztree').html(li);
                                    } else {
                                        $('.search_member_none').show();
                                        $('#search_member_list').hide();
                                    }
                                    //$('#searchResult').show();
                                    // 滚动加载数据
                                    $('#searchResult').on('mousewheel', function () {
                                        //tab内容列表滚动到底部进行下一分页的懒加载事件
                                        if ($('#memberSearchInput').val() == data.name) {
                                            var $this = $(this),
                                                $currentContainer = $('#search_member_list'),
                                                viewHeight = $this.height(), //视口可见高度
                                                contentHeight = $currentContainer[0].scrollHeight, //内容高度
                                                scrollHeight = $this.scrollTop(), // 已经滚动了的高度
                                                currentCardItemNum = $currentContainer.find("li").length,
                                                totalCardItemNUM = parseInt(data.data.total);
                                            if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM) {
                                                var successFn = function (data) {
                                                    if (data.code === '200') {
                                                        searchPage = (parseInt(searchPage) + 1).toString(10);
                                                        var list = data.data.list;
                                                        var li = "";
                                                        for (var i = 0; i < list.length; i++) {
                                                            var receiveList = $('#receive_member_list_view').data('cameraList'),
                                                                active = '';
                                                            if (receiveList && receiveList.length > 0) {
                                                                receiveList.forEach(function (item) {
                                                                    if (item.userId == list[i].userId || item.userId == list[i].userId) {
                                                                        active = 'checkbox_true_full';
                                                                    }
                                                                });
                                                            }
                                                            li += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk ${active}" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`;
                                                        };
                                                        $('#search_member_list').addClass('ztree').append(li);
                                                    }
                                                }
                                                if (searchPage < (parseInt(data.data.totalPage) + 1)) {
                                                    loadData(receivePort, true, {
                                                        name: $('#memberSearchInput').val(),
                                                        ajaxFilter: $('#memberSearchInput').val(),
                                                        page: searchPage
                                                    }, successFn);
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                            $('#clearMemberSearchInput').on('click', function () {
                                $('#receiveResultView').show();
                            })
                            //布控人员检索
                            $('#memberSearchInput').off().on('keydown', function (event) {
                                event.stopPropagation();
                            }).on('keyup', function (event) {
                                var value = $(this).val();
                                // if(value !== '' || null){
                                if (value !== '' && value !== null) {
                                    $('#receiveResultView').hide();
                                    $('#searchResult').show();
                                    searchPage = 2;
                                    loadData(receivePort, true, {
                                        name: value,
                                        ajaxFilter: value
                                    }, searchSuccessFunc);
                                } else {
                                    $('#receiveResultView').show();
                                    $('#searchResult').hide();
                                }
                            });
                            // 滚动加载数据
                            $('#receiveResultView').on('mousewheel', function () {
                                //tab内容列表滚动到底部进行下一分页的懒加载事件
                                var $this = $(this),
                                    $currentContainer = $('#receive_member_list_view'),
                                    viewHeight = $this.height(), //视口可见高度
                                    contentHeight = $currentContainer[0].scrollHeight, //内容高度
                                    scrollHeight = $this.scrollTop(), // 已经滚动了的高度
                                    currentCardItemNum = $currentContainer.find("li").length,
                                    totalCardItemNUM = parseInt(data.data.total);
                                if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM) {
                                    controlOpt.page = (Number(controlOpt.page) + 1).toString(10);
                                    var successFn = function (data) {
                                        if (data.code === '200') {
                                            $('#loadLi').remove();
                                            var liList = '';
                                            var list = data.data.list;
                                            for (var i = 0; i < list.length; i++) {
                                                liList += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`
                                            };
                                            $('#receive_member_list_view').append(liList);
                                            var userSaveVal = $('#control_viewUserList').data('saveVal');
                                            if ($('#receive_member_list_view').data('cameraList') && $('#receive_member_list_view').data('cameraList').length > 0 && userSaveVal) {
                                                userSaveVal.forEach(function (item) {
                                                    //左侧选中
                                                    $('#receive_member_list_view').find('li[userId="' + (item.userId ? item.userId : item.userId) + '"] .button').addClass('checkbox_true_full');
                                                    item.index = $('li[userId="' + (item.userId ? item.userId : item.userId) + '"]').index();
                                                });
                                            }
                                        }
                                    }
                                    loadData(receivePort, true, controlOpt, successFn);
                                    if ($('#loadLi').length == 0) {
                                        var loadLi = '<div id="loadLi" style="margin-top:15px"></div>';
                                        $('#receive_member_list_view').after(loadLi);
                                        showLoading($('#loadLi'));
                                    }
                                }
                            });
                        } else {
                            $('.multiPickerDlg_search_wrapper').append('<div class="search_member_none">未选择通知范围</div>');
                        }
                    }
                    hideLoading($('.layui-layer-content'));
                };
                loadData(receivePort, true, controlOpt, receiveSuccessFunc);
            } else if (menuIndex == '8') { // 关联镜头
                return;
            } else if (menuIndex == '16') { //镜头定位
                if (type == '2') { //纯动态页面
                    $("#searchResultFlexDynamic").click();
                    var iframe = document.getElementById('search_map_iframeDynamic');
                } else if (type == '3') {
                    $("#searchResultFlex").click();
                    var iframe = document.getElementById('search_map_iframe');
                } else if (type == '9') {
                    $("#searchResultFlexTemperature").click();
                    var iframe = document.getElementById('search_map_iframeTemperature');
                }
                var $this = that.parent();
                var px = Number($this.attr("px")),
                    xMax = 115.07808642803226,
                    xMin = 113.32223456772093,
                    py = Number($this.attr("py")),
                    yMax = 113.32223456772093,
                    yMin = 22.190483583642468;
                if (px > xMin && px < xMax && py > yMin && py < yMax) {
                    var targetOrigin = mapUrl + 'peopleCity.html',
                        locationData = {
                            x: parseFloat($this.attr("px")),
                            y: parseFloat($this.attr("py")),
                            offsetValueOfX: 0.002
                        },
                        data = {
                            type: "locationToOffset",
                            mydata: locationData
                        };
                    window.setTimeout(function () {
                        iframe.contentWindow.postMessage(data, targetOrigin);
                    }, 700);
                } else {
                    warningTip.say('所选图片坐标有误');
                }
            } else if (menuIndex == '17') { //镜头信息
                var cameraId = ''
                if (that.parents(".popup-body-face-cntList").attr("id") == 'popup-body-face-cntList' || that.parents(".popup-body-alarm-cntList").attr("id") == 'popup-body-alarm-cntList') {
                    cameraId = that.parents("li.warning-item").data("listData") ? that.parents("li.warning-item").data("listData").cameraId : that.parents("li.image-card-wrap").data("listData").cameraId;
                } else {
                    if (type == '2' || type == '3' || type == '7' || type == '9') {
                        if (that.attr("cameraid")) { //轨迹分析页面
                            cameraId = that.attr("cameraid");
                        } else {
                            cameraId = that.parents("li.image-card-wrap").attr("cameraid");
                        }
                    } else if (type == '5') { //告警页面
                        if (that.attr("cameraid")) { //轨迹分析页面
                            cameraId = that.attr("cameraid");
                        } else {
                            cameraId = that.parents("li.warning-item").data("listData") ? that.parents("li.warning-item").data("listData").cameraId : that.parents("li.image-card-item").data("listData").cameraId;
                        }
                    }
                }

                showDeviceDetail(cameraId);
            }

            $("#rightMouseImgMenu").addClass('hide');
        });

        var menuWidth = $('#rightMouseImgMenu').outerWidth(),
            menuHeight = $('#rightMouseImgMenu').outerHeight(),
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
                top: e.clientY - menuHeight + $(document).scrollTop()
            });
        } else {
            $menu.css({
                top: e.clientY + $(document).scrollTop()
            });
        }

        //关联镜头鼠标移入事件
        $menu.find('.mask-camera-item').off('mouseover').on('mouseover', function (e) {
            if ($(this).find(".aui-icon-drop-right").length > 0 && !$(this).hasClass("disabled")) {
                $(this).addClass("parentMenu");
                $thatParent = $(this);
                var pLeft = $(this).offset().left,
                    pTop = $(this).offset().top;
                var $menuChild = $([
                    '<ul class="mask-camera-list-child" id="rightMouseImgMenuchild">',
                    '   <li class="mask-camera-item-child" type="0">前后15秒</li>',
                    '   <li class="mask-camera-item-child" type="1">前后30秒</li>',
                    '   <li class="mask-camera-item-child" type="2">前后1分钟</li>',
                    '   <li class="mask-camera-item-child" type="3">前后5分钟</li>',
                    '   <li class="mask-camera-item-child" type="4">自定义时间</li>',
                    '</ul>',
                ].join(''));

                var menuLen = $('#rightMouseImgMenuchild').length;
                if (menuLen > 0) {
                    $('#rightMouseImgMenuchild').off().remove();
                }
                $('body').append($menuChild);

                var menuWidth = $('#rightMouseImgMenu').outerWidth(),
                    menuHeight = $('#rightMouseImgMenu').outerHeight(),
                    bodyWidth = $('body').outerWidth(),
                    bodyHeight = $('body').outerHeight();
                if (pLeft + menuWidth > bodyWidth - $("#rightMouseImgMenuchild").outerWidth()) {
                    $menuChild.css({
                        left: pLeft - menuWidth
                    });
                } else {
                    $menuChild.css({
                        left: pLeft + menuWidth - 1
                    });
                }
                if (pTop + menuHeight > bodyHeight - 20) {
                    $menuChild.css({
                        top: pTop
                    });
                } else {
                    $menuChild.css({
                        top: pTop
                    });
                }

                $menuChild.find('.mask-camera-item-child').off('mouseover').on('mouseover', function (e) {
                    $thatParent.addClass("parentMenu");
                });

                $menuChild.find('.mask-camera-item-child').off('click').on('click', function (evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    if ($(this).hasClass("disabled")) {
                        return;
                    }
                    var menuChildIndex = $(this).attr("type");

                    //地图框选显示抓拍图页面
                    if (that.parents(".popup-body-face-cntList").attr("id") == 'popup-body-face-cntList') {
                        var dataAll = that.parent().data("listData");
                    } else {
                        if (type == '2' || type == '3' || type == '7' || type == '9') { //综合或动态
                            var dataAll = that.parent().data("listData");
                        } else if (type == '5') {
                            var dataAll = that.parents(".warning-item").data("listData") || that.parents(".image-card-container.image-card-item").data("listData") || that.parents("#alarmList").data("listData")[that.parents(".aui-timeline-wrap.clearfix").index()];
                        }
                    }
                    if (menuChildIndex != 4) {
                        linkCameraTime(menuChildIndex, type, dataAll);
                    } else {
                        $("#timeLinkModal").data({
                            menuChildIndex,
                            type,
                            dataAll
                        });
                        $("#timeLinkModal").modal("show");
                        $("#timeLinkModalTime").html($("#timeLinkModal").data().dataAll.captureTime || $("#timeLinkModal").data().dataAll.alarmTime);
                        $("#timeLinkModalTime-prev").val("");
                        $("#timeLinkModalTime-after").val("");
                    }

                    $("#rightMouseImgMenu").addClass('hide');
                    $('#rightMouseImgMenuchild').addClass('hide');
                });

                // 给生成的菜单栏里面进行事件阻止
                $('#rightMouseImgMenuchild')[0].addEventListener('contextmenu', function (evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                });
            } else {
                $("#rightMouseImgMenu").find(".mask-camera-item").removeClass("parentMenu");
                $('#rightMouseImgMenuchild').off().remove();
            }
        });
        // 绑定全局点击右键菜单消失代码
        $(document).off('click.rightMouseImgMenu').on('click.rightMouseImgMenu', function () {
            $('#rightMouseImgMenu').addClass('hide');
            $('#rightMouseImgMenuchild').addClass('hide');
        });
        // 给生成的菜单栏里面进行事件阻止
        $('#rightMouseImgMenu')[0].addEventListener('contextmenu', function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
        });
    }
});

//关联时间弹窗点击确定按钮
$("#timeLinkModalSure").on("click", function () {
    if ($.trim($("#timeLinkModalTime-prev").val()) == '' && $.trim($("#timeLinkModalTime-after").val()) == '') {
        warningTip.say("请输入前后分钟数");
        return;
    }
    $("#timeLinkModal").modal("hide");
    linkCameraTime($("#timeLinkModal").data().menuChildIndex, $("#timeLinkModal").data().type, $("#timeLinkModal").data().dataAll, $("#timeLinkModalTime-prev").val(), $("#timeLinkModalTime-after").val());
});

//整个系统滚动事件,去掉加入暂存架节点
$(document).scroll(function () {
    $('#rightMouseImgMenu').off().remove();
});

$(".temporaryShelfIcon").on('mousedown', function (e) {
    e.stopPropagation();
    e.preventDefault();
    $(this).data('movePositionX', e.clientX);
    $(this).data('movePositionY', e.clientY);
    $(this).addClass("move");
    $(this).removeClass("noclick");

    //暂存架随鼠标移动
    $(document).on('mousemove.temporaryShelfIcon', function (e) {
        e.stopPropagation();
        e.preventDefault();
        if ($(".temporaryShelfIcon").hasClass("move")) {
            var posX = Math.abs(e.clientX - $(".temporaryShelfIcon").data("movePositionX"));
            var posY = Math.abs(e.clientY - $(".temporaryShelfIcon").data("movePositionY"));
            if (posX > 10 || posY > 10) {
                $(".temporaryShelfIcon").addClass("noclick");
                $(".temporaryShelfMove").removeClass("hide");

                var top = 0,
                    left = 0;
                if (e.clientY < $(".temporaryShelfIcon").height() / 2) {
                    top = 0;
                } else {
                    if (e.clientY > ($(document.body).height() - $(".temporaryShelfIcon").height())) {
                        top = $(document.body).height() - $(".temporaryShelfIcon").height();
                    } else {
                        top = e.clientY - $(".temporaryShelfIcon").height() / 2;
                    }
                }

                if (e.clientX < $(".temporaryShelfIcon").width() / 2) {
                    left = 0;
                } else {
                    if (e.clientX > ($(document.body).width() - $(".temporaryShelfIcon").width())) {
                        left = $(document.body).width() - $(".temporaryShelfIcon").width();
                    } else {
                        left = e.clientX - $(".temporaryShelfIcon").width() / 2;
                    }
                }

                $(".temporaryShelfIcon").css({
                    top: top + 'px',
                    left: left + 'px',
                });
            }
        }
    }).on('mouseup.temporaryShelfIcon', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $(".temporaryShelfIcon").removeClass("move");
        $(".temporaryShelfMove").addClass("hide");
        $(document).off('mousemove.temporaryShelfIcon mouseup.temporaryShelfIcon');
    });
});

$(document).on("click", function (e) {
    if (!$(".temporaryShelf").hasClass("hide")) {
        $(".temporaryShelf").addClass("hide");
        $(".temporaryShelfIcon").removeClass("hide");
        $(".temporaryShelfSelect").find(".table-checkbox-input").removeAttr("checked");
        for (var i = 0; i < $(".temporaryShelfContent").find(".image-card-list-wrap .ui-checkboxradio-checkbox-label").length; i++) {
            if ($(".temporaryShelfContent").find(".image-card-list-wrap .ui-checkboxradio-checkbox-label").eq(i).hasClass("ui-checkboxradio-checked")) {
                $(".temporaryShelfContent").find(".image-card-list-wrap .ui-checkboxradio-checkbox-label").eq(i).removeClass("ui-checkboxradio-checked");
            }
        }

        $("#temporarySearch").addClass("disabled");
        $("#temporaryBK").addClass("disabled");
        $("#temporaryOnetoone").addClass("disabled");
        $("#temporaryPeer").addClass("disabled");
    }
    var $target = $(e.target);
    // 原图截图弹框
    if ($target.closest('.mask-img-fixed').length == 0 && $target.closest('.add-search-image').length == 0) {
        if ($("body").find('.mask-img-fixed').length > 0) {
            $('.mask-img-fixed').removeClass('show');
            $('.mask-img-fixed').addClass('hide');
            $('.mask-img-fixed').remove();
        }
    }
    // 静态检索设置弹框
    if (!$(e.target).closest('#staticConfig,#staticConfigBox').length) {
        $('#staticConfigBox').addClass('hide');
    }
    if (!$(e.target).closest('#mergeConfig,#mergeConfigBox').length) {
        $('#mergeConfigBox').addClass('hide');
    }
    if (!$(e.target).closest('.operation').length) {
        $('#mouseOverConfirmBox').addClass('hide');
        $('#IDSearchDetailTable').find('.btn.show').removeClass('show').addClass('hide').prev().removeClass('hide');
    }
});

/**
 * 原图截图功能
 * @param {object} base64Img base64图片
 * @param {*} $targetImg 抠图后图片位置
 */
function cutOutImage(base64Img, $targetImg) {
    if ($('body').find('.mask-img-fixed').length == 0) {
        var $maskContainer = $([
            '<div class="mask-img-fixed hide bigImgScreenShot">',
            '   <div class="mask-dialog">',
            '   <div class="mask-content">',
            '   <i class="aui-icon-not-through bigimg"></i>',
            '   <div class="mask-container"></div>',
            '   </div>',
            '   </div>',
            '</div>'
        ].join('')); // 大图框架
        var maskSlider = [
            '<div class="swiper-slide">',
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
            '   <img id="showOriginImg" class="img" alt="" />',
            '   <canvas class="mask-canvas-bg hide"></canvas>',
            '   <canvas class="mask-canvas-img hide"></canvas>',
            '   </div>',
            '   <div class="mask-icon-box">',
            '       <i class="mask-icon aui-icon-screen">',
            '           <span class="mask-icon-hover-tip">',
            '               截图检索',
            '           </span>',
            '           <i class="aui-icon-drop-down"></i>',
            '       </i>',
            '   </div>',
            '</div>'
        ].join('');

        // 先行添加空节点
        $maskContainer.find('.mask-container').append(maskSlider);
        $('body').append($maskContainer);
    }
    var selectorStr = '.mask-img-fixed.bigImgScreenShot', // 构造大图类名
        $findMask = $('body').find(selectorStr); // 大图节点

    // 绑定截图按钮事件2
    $findMask.find('.aui-icon-screen').off('click').on('click', function () {
        var $slidePanel = $findMask.find('.swiper-slide').find('.mask-crop-panel');
        $slidePanel.removeClass('hide');
        var $maskClose = $findMask.find('.aui-icon-close'),
            $maskFooter = $findMask.find('.mask-icon-box');
        $maskClose.addClass('hide');
        $maskFooter.addClass('hide');
    });

    var $maskSlide = $findMask.find('.swiper-slide'),
        $cropImg = $maskSlide.find('.cropper-view-img'), // 大图中的截图层图片节点
        $img = $maskSlide.find('.square-crop-box').next('.img'), // 大图图片节点
        $maskCropBox = $maskSlide.find('.square-crop-box'), // 大图上的鼠标截图
        imgWidth, imgHeight;

    // 获取原始图片的宽高
    var img = new Image();
    img.src = base64Img;
    if (img.complete) {
        imgWidth = img.width;
        imgHeight = img.height;
    } else {
        img.onload = function () {
            imgWidth = img.width;
            imgHeight = img.height;
        }
    }

    // 设置最大宽高
    if (parseInt(imgWidth) > 1500 || parseInt(imgHeight) > 850) {
        var percentW = 1500 / imgWidth;
        var percentH = 850 / imgHeight;
        if (percentW < percentH) {
            imgWidth = imgWidth * percentW;
            imgHeight = imgHeight * percentW;
        } else {
            imgWidth = imgWidth * percentH;
            imgHeight = imgHeight * percentH;
        }
    }
    // 设置最低宽高
    if (parseInt(imgWidth) < 320 || parseInt(imgHeight) < 180) {
        var percentW = 320 / imgWidth;
        var percentH = 180 / imgHeight;
        if (percentW > percentH) {
            if (imgWidth * percentW > 1500 || imgHeight * percentW > 850) {
                imgWidth = imgWidth;
                imgHeight = imgHeight;
            } else {
                imgWidth = imgWidth * percentW;
                imgHeight = imgHeight * percentW;
            }
        } else {
            if (imgWidth * percentW > 1500 || imgHeight * percentW > 850) {
                imgWidth = imgWidth;
                imgHeight = imgHeight;
            } else {
                imgWidth = imgWidth * percentH;
                imgHeight = imgHeight * percentH;
            }
        }
    }

    $findMask.find('.mask-dialog').css({
        'width': imgWidth,
        'height': imgHeight
    });
    $findMask.find('.mask-container').css({
        'width': imgWidth,
        'height': imgHeight
    });
    $findMask.find('.showCutImg').css({
        'width': imgWidth,
        'height': imgHeight
    })

    function initImgSize(imgWidthNew, imgHeightNew) {
        $cropImg.attr({
            'src': '',
        });
        $cropImg.attr({
            'src': base64Img,
        });
        $img.attr({
            'src': '',
            'width': imgWidthNew,
            'height': imgHeightNew
        });
        $img.attr({
            'src': base64Img,
            'width': imgWidthNew,
            'height': imgHeightNew
        });

        var $maskFixedDom = $('.mask-img-fixed.bigImgScreenShot');
        $maskFixedDom.removeClass('hide');
        window.setTimeout(function () {
            $maskFixedDom.addClass('show');
        }, 50);

        function selectFace() {
            var canvas1 = $maskSlide.find('.mask-canvas-bg')[0],
                canvas3 = $maskSlide.find('.mask-canvas-img')[0];
            canvas1.width = imgWidthNew;
            canvas1.height = imgHeightNew;
            canvas3.width = 100;
            canvas3.height = 100;

            // 设置截图区域图片大小
            $maskCropBox.find('.cropper-view-img').attr({
                'width': imgWidthNew,
                'height': imgHeightNew
            });
        }
        selectFace();
        $(window).off('resize').on('resize', selectFace);
    }
    // 绑定函数
    maskImgCrop({
        maskSlide: $maskSlide,
        findMask: $findMask,
        targetImg: $targetImg
    }, 'bigImgScreenShot', base64Img, {
        index: 1,
        imgLen: 1
    });
    initImgSize(imgWidth, imgHeight);

    // 鼠标滚动放大缩小功能
    $findMask.find('#showOriginImg').off('mousewheel').on('mousewheel', function (event, detail) {
        event.stopPropagation();
        event.preventDefault();
        var originalEvent = event.originalEvent;
        var delta = originalEvent.wheelDelta ? originalEvent.wheelDelta / 120 : originalEvent.detail / 3;

        var imgWidth1 = imgWidth * (1 + delta / 20);
        var imgHeight1 = imgHeight * (1 + delta / 20);
        imgWidth = imgWidth1;
        imgHeight = imgHeight1;
        if (imgWidth < 6000 && imgWidth > 150) {
            initImgSize(imgWidth1, imgHeight1);
        }
    })

    // 大图的拖拽移动功能
    $findMask.find('#showOriginImg').off('mousedown').on('mousedown', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        // 获取到最初始的位置
        var $box = $(this).closest('.mask-image-box'),
            boxWidth = $box[0].getBoundingClientRect().width,
            boxHeight = $box[0].getBoundingClientRect().height,
            boxTop = $box.position().top,
            boxLeft = $box.position().left,
            $swiperBox = $(this).closest('.swiper-slide'),
            swiperWidth = $swiperBox[0].getBoundingClientRect().width,
            swiperHeight = $swiperBox[0].getBoundingClientRect().height,
            startX = event.pageX,
            startY = event.pageY;
        $(document).on('mousemove.img', function (cropperEvt) {
            cropperEvt.preventDefault();
            cropperEvt.stopPropagation();
            var disX = cropperEvt.pageX - startX,
                disY = cropperEvt.pageY - startY,
                top = boxTop + disY - (swiperHeight - boxHeight) / 2,
                left = boxLeft + disX - (swiperWidth - boxWidth) / 2;
            $box.css({
                top: top,
                left: left
            });
        });
        $(document).on('mouseup.img', function (cropperEvt) {
            cropperEvt.preventDefault();
            cropperEvt.stopPropagation();
            $(document).off('mousemove.img mouseup.img');
        });
    })

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
            $maskCropPanel = $findMask.find('.mask-crop-panel');
        $maskCropBox.addClass('hide'); //隐藏截图图层
        $maskCropPanel.addClass('hide'); //隐藏截图选择框
    });
}

// 地图视频关闭函数
function cancelCheckedCameras(string) {
    evt.data = {
        type: "cancelCheckedCameras",
        mydata: string
    }
    var iframe = document.getElementById('map_iframe_alarm');
    var newdata = newListFn(option);
    var targetOrigin = mapUrl + 'peopleCity.html',
        data = {
            type: "peopleTrak",
            dataType: iframeId,
            mydata: evt.data
        };
    if (evt.data.length >= 0) {
        iframe.contentWindow.postMessage(data, targetOrigin);
    } else {
        warningTip.say('所选图片坐标有误');
    }
}

function mapVideoList(cameralId, mapCameralData, $cameraIDList) {
    var pushId = cameralId,
        isPush = true;
    var saveData = $cameraIDList.data('saveData') ? $cameraIDList.data('saveData') : [];
    for (var i = 0; i < saveData.length; i++) {
        if (saveData[i].id && pushId === saveData[i].id) {
            isPush = false;
        }
    }
    if (isPush) {
        saveData.push(mapCameralData);
    }
    $cameraIDList.data({
        'saveData': saveData
    });
    if (saveData.length > 0) {
        liHtml = `<li title="${mapCameralData.name}" data-name="${mapCameralData.name}" cameraId=${mapCameralData.id}>
                    <i class="aui-icon-tree-camera"></i>
                    <span class="popup-body-camera-cnt-list" title="${mapCameralData.name}">${mapCameralData.name}</span>
                    <i class="aui-icon-not-through"></i>
                </li>`;
    }
    $cameraIDList.append(liHtml).find(".flex-column-wrap").remove();
    // 设置文字信息
    var listItemLen = $cameraIDList.children().length;
    $cameraIDList.closest('.popup-body-camera').find('#popup-body-camera-title-num').text(`(${listItemLen})`);
}
/**
 * 实时视频和抓拍图
 * @param {string} type 地图返回类型 0.实时监控1.实时监控和抓拍图2.录像回放3.历史抓拍图4.录像回放和抓拍图
 * @param {object} data 地图返回数据
 * @param {object} cameraIDArr 框选id数组
 */
function showMapVideo(type, data, cameraIDArr) {
    if ($(".map-new-popup").children().length == 0 || type != $('.map-new-popup').data("type")) {
        if ($("#map-video-warp").attr("sessionid")) {
            $("#mapVideoStop").click();
        }
        //如果之前的页面是实时视频和抓拍图切换页面的时候要清空定时器
        if ($("#map-video-warp").attr('realTimeHeart') == '1') {
            mapVideoFun();
        }
        if ($("#map-video-warp").data("requestStart")) {
            $("#map-video-warp").data("requestStart").abort();
        }
        var url = "./facePlatform/map-new.html?dynamic=" + Global.dynamic;
        $('.map-new-popup').removeClass('hide');
        $('.map-new-popup').data({
            type,
            mapId: data[0].rxModule
        });
        loadPage($('.map-new-popup'), url);
    }

    var saveData = $("#popup-body-camera-cntList").data('saveData') ? $("#popup-body-camera-cntList").data('saveData') : [];
    // 判断框选的镜头是否在列表中 如果在列表中 如果不在列表中
    for (var m = 0; m < cameraIDArr.length; m++) {
        var isSave = false; // 镜头是否已在列表中
        for (var n = 0; n < saveData.length; n++) {
            if (cameraIDArr[m] === saveData[n].id) {
                isSave = true; // 框选镜头已经在选中列表中
            }
        }
        if (!isSave) { // 摄像头已存在列表中
            mapVideoList(cameraIDArr[m], data[m], $("#popup-body-camera-cntList"));
        }
    }
    if (saveData.length == 0) {
        $("#popup-body-camera-cntList").find("li").eq(0).click();
    }
    // else {
    //     if (!data[0].rxModule) {
    //         $("#popup-body-camera-cntList").find("li").eq(-1).click();
    //         $("#popup-body-camera-cnt").scrollTop($("#popup-body-camera-cnt")[0].scrollHeight);
    //     }
    // }
}

//检索事由弹窗点击确认按钮事件
$("#dynamicModalSure").on("click", function () {
    var opType = $("#dynamicModalType").val(),
        searchComments = $.trim($("#dynamicModalReason").val());

    if (!searchComments) {
        warningTip.say("请输入检索事由");
        return;
    } else if (searchComments.length < 10) {
        warningTip.say("检索事由最少输入10个字");
        return;
    } else if (!opType) {
        warningTip.say("请选择业务类型");
        return;
    }

    if ($("#pageSidebarMenu").find(".aui-icon-monitor").parents(".sidebar-item").hasClass("active")) { //动态
        var $usearchImg = $("#usearchImgDynamic"), //图片容器
            $dynamicsearch = $('#dynamicsearchDynamic');
    } else { //综合
        var $usearchImg = $("#usearchImg"),
            $dynamicsearch = $('#mergeSearch');
    }
    var picId = $usearchImg.find(".add-image-item.active .add-image-img").attr("picId");
    if (picId) { //当前检索图片有picId的情况下
        var picIdBig = picId.substring(picId.lastIndexOf("_") + 1, picId.length);
        $usearchImg.find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
            if ($(ele).find(".add-image-img").attr('picId') && $(ele).find(".add-image-img").attr('picId').indexOf(picIdBig) >= 0) {
                $(ele).find(".add-image-img").data({
                    opType,
                    searchComments
                });
            }
        });
    } else { //没有picId不匹配直接给该检索图片赋值
        $usearchImg.find(".add-image-item.active .add-image-img").data({
            opType,
            searchComments
        });
    }
    $dynamicsearch.click();
    $("#dynamicSearchModal").modal("hide"); // 关闭弹窗
});

/**
 * hover显示中图
 * @param {*} $imgBox 图片容器
 * @param {*} $middleImgBox 中图外层容器
 * @param {*} imgClass 图片类
 * @param {*} type 显示在哪一边 left显示左边（默认右边）
 */
function showMiddleImg($imgBox, $middleImgBox, imgClass, type) {
    if ($middleImgBox.parents(".modal").length > 0) {
        $middleImgBox = $middleImgBox.parents(".modal");
    }
    $imgBox.on('mouseover', imgClass, function () {
        var $this = $(this),
            imgSrc = $this.attr('src'),
            top = $this.offset().top - 2,
            left = $this.offset().left + $this.outerWidth() + 4,
            html = `<div class="card-img-hover">
                       <img src="${imgSrc}" alt="">
                   </div>`;
        cardImgHoverTimer = window.setTimeout(function () {
            $middleImgBox.append(html);
            if (type == 'left') {
                left = $this.offset().left - $(".card-img-hover").outerWidth() - 4;
            }
            var docH = document.documentElement.clientHeight,
                $imgHover = $middleImgBox.find('.card-img-hover');
            var hoverImgH = $imgHover.outerHeight();
            if ($this.offset().top + hoverImgH > docH) {
                $imgHover.css({
                    top: $this.offset().top + $this.outerHeight() - hoverImgH,
                    left: left
                })
            } else {
                $imgHover.css({
                    top: top,
                    left: left
                })
            }
        }, 500);
    }).on('mouseout', imgClass, function () { // 图片区域 hover显示中图之后 鼠标离开图片
        $middleImgBox.find('.card-img-hover').remove();
        window.clearTimeout(cardImgHoverTimer);
    });
}

/**
 * 获取审批人
 * @param {*} $container 下拉框容器
 * @param {*} model 模块
 * @param {*} applicationType 申请类型(权限专用)
 * @param {*} value 是否指定赋值
 * @param {*} edit 是否可编辑（默认不可编辑）
 * @param {*} otherData 补充参数
 */
function getPersonList($container, model, applicationType, value, edit, otherData) {
    showLoading($container.parents(".control-form"));
    var port = 'v3/approveManager/approvers',
        data = {
            page: 1,
            size: 2000,
            model,
            applicationType
        };
    var successFunc = function (data) {
        hideLoading($container.parents(".control-form"));
        if (data.code === '200') {
            var result = data.data.list;
            if (result) { // 存在返回值
                var itemHtml = '';

                for (var i = 0; i < result.length; i++) {
                    itemHtml += `<option class="option-item" userId="${result[i].userId}" value="${result[i].userId}" ${result[i].userId == value ? 'selected' : ''}>${result[i].userName + '(' + result[i].userId + ')'}</option>`;
                }
                $container.html(itemHtml); // 元素赋值
                $container.selectpicker({
                    allowClear: false
                });
                if (value) { //有value证明是编辑或者查看
                    if (edit) {
                        $container.prop('disabled', false); // 可编辑
                    } else {
                        $container.parents(".control-form").find(".aui-icon-not-through").addClass("hide");
                        $container.prop('disabled', true); // 目前不可编辑之后可以编辑放开
                    }
                    $container.selectpicker('val', value);
                    $container.selectpicker('refresh');
                } else {
                    $container.parents(".control-form").find(".aui-icon-not-through").removeClass("hide");
                    $container.val(null);
                    $container.prop('disabled', false); // 非不可选
                    $container.selectpicker('refresh');
                }

                // 滚动加载数据
                // $container.parents(".control-form").off("mousewheel", ".dropdown.bootstrap-select div.inner").on('mousewheel', ".dropdown.bootstrap-select div.inner", function () {
                //     //tab内容列表滚动到底部进行下一分页的懒加载事件
                //     var $this = $(this),
                //         viewHeight = $this.height(), //视口可见高度
                //         contentHeight = $this.find(".dropdown-menu.inner")[0].scrollHeight, //内容高度
                //         scrollHeight = $this.scrollTop(), // 已经滚动了的高度
                //         currentCardItemNum = $this.find("li").length,
                //         totalLogLibNum = parseInt(data.data.total);
                //     if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalLogLibNum) {
                //         getPersonList($container, scrollPage, applicationType, name, false);
                //     }
                // });

                // $container.parent().find(".dropdown-menu input.form-control").on("keyup", function () {
                //     getPersonList($container, 1, applicationType, $.trim($container.parent().find(".dropdown-menu input.form-control").val()), true);
                // });

                $container.parents(".control-form").find(".aui-icon-not-through").on("click", function (e) {
                    e.stopPropagation();
                    $container.val(null);
                    $container.prop('disabled', false); // 非不可选
                    $container.selectpicker('refresh');
                    // if ($container.val()) {
                    //     getPersonList($container, 1, applicationType, '', true);
                    // }
                });
            } else {
                $container.prop('disabled', true);
                $container.val(null);
                $container.selectpicker('refresh');
            }
        } else {
            $container.prop('disabled', true);
            $container.val(null);
            $container.selectpicker('refresh');
        }
    };
    loadData(port, true, Object.assign(data, otherData), successFunc);
};

/**
 * 获取选人
 * @param {*} that 容器
 * @param {*} isMySelf 是否包括自己（默认包括为true是不包括）
 */
function selectPersonCommon(that, isMySelf, port) {
    var $inputBox = that;
    $('.multiPickerDlg_right_no_result').html('<i></i>未选择人员');
    $('#memberSearchInput').attr('placeholder', '搜索人员');
    $('.type-change-left').text('人员列表');
    $('.multiPickerDlg_right_title>span').text('已选协办人');
    $('#partyTree').remove();
    $('.type-change-right').hide();
    $('.layui-layer-btn').attr('id', 'noticeUserList');
    showLoading($('.layui-layer-content'));
    // 告警可见人 左侧列表参数
    var controlOpt = {
        isMySelf: isMySelf ? 2 : 1,
        page: '1',
        size: '15'
    }
    controlOpt.page = '1';
    var searchPage = 2;
    // controlOpt.orgids = orgids;
    // 告警可见人
    var receivePort = port ? port : 'v2/user/getOrgUserInfos';
    var receiveSuccessFunc = function (data) {
        hideLoading($('.layui-layer-content'));
        if (data.code === '200') {
            $('#saveNode').html('');
            var liList = '',
                html = '';
            var list = data.data.list;
            if (list) {
                //判断是否有选中值
                var userSaveVal = $inputBox.data('saveVal');
                if (list.length > 0) {
                    for (var i = 0; i < list.length; i++) {
                        liList += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`
                    };
                    html = `<div id="receiveResultView" class="ww_searchResult">
                            <ul id="receive_member_list_view" class="ztree">${liList}</ul>
                        </div>`;
                } else {
                    html = '<p class="search_member_none">当前所选分局暂无告警接收人</p>';
                    $('.multiPickerDlg_right_title').find('.js-remove-all').click();
                }
                $('.multiPickerDlg_search_wrapper').append(html);
                if (userSaveVal && userSaveVal.length > 0) {
                    $('#receive_member_list_view').data({
                        'cameraList': userSaveVal
                    });
                    var liHtml = '';
                    userSaveVal.forEach(function (item) {
                        var liNiName = item.userName ? item.userName : item.userName;
                        var liLoginName = item.userId ? item.userId : item.userId;
                        liHtml += '<li title=' + item.title + ' data-name=' + liNiName + ' data-id=' + item.orgId + ' userId=' + liLoginName + ' class="ww_menuDialog_DualCols_colRight_cnt_item token-input-token js_list_item">' +
                            '<span class="ww_commonImg icon icon_folder_blue"></span>' +
                            '<span class="ww_treeMenu_item_text" title=' + item.title + '>' + liNiName + '</span>' +
                            '<a href="javascript:" class="ww_menuDialog_DualCols_colRight_cnt_item_delete"><span class="ww_commonImg ww_commonImg_DeleteItem js_delete"></span></a>' +
                            '</li>';
                        //左侧选中
                        $('#receive_member_list_view').find('li[userId="' + liLoginName + '"] .button').addClass('checkbox_true_full');
                    });
                    $('#js-camera-totle').text(userSaveVal.length);
                    $('.multiPickerDlg_right_no_result').hide();
                    $('#saveNode').html(liHtml);
                } else {
                    $('#receive_member_list_view').data({
                        'cameraList': []
                    });
                }
                // 点击清空事件
                $('.js-remove-all').on('click', function () {
                    $('#saveNode').html('');
                    $('#receive_member_list_view').data({
                        'cameraList': []
                    });
                    $('#js-camera-totle').text('0');
                    $('#receive_member_list_view li .button').removeClass('checkbox_true_full');
                    $('.multiPickerDlg_right_no_result').show();

                });
                // 右侧点击取消选中
                $('#saveNode').on('click', 'li', function () {
                    var $this = $(this);
                    var userId = $this.attr('userId');
                    var saveVal = [];
                    $('#receive_member_list_view').data('cameraList').forEach(function (item) {
                        saveVal.push(item);
                    })
                    for (var i = 0; i < saveVal.length; i++) {
                        if (saveVal[i].userId == userId || saveVal[i].userId == userId) {
                            saveVal.splice(i, 1);
                            $('#receive_member_list_view').find('li[userId="' + userId + '"] .button').removeClass('checkbox_true_full');
                            $('#search_member_list').find('li[userId="' + userId + '"] .button').removeClass('checkbox_true_full');
                        };
                    };
                    $('#receive_member_list_view').data({
                        'cameraList': saveVal
                    });
                    $this.remove();
                    $('#js-camera-totle').text($('#saveNode>li').length);
                    if ($('#saveNode>li').length == 0) {
                        $('.multiPickerDlg_right_no_result').show();
                    }
                });
                // 点击确定
                $('#noticeUserList .layui-layer-btn0').on('click', function () {
                    var saveVal = $('#receive_member_list_view').data('cameraList') && $('#receive_member_list_view').data('cameraList').length > 0 ? $('#receive_member_list_view').data('cameraList') : [];
                    var noticeUserList = [];
                    var nameArr = [];
                    if (saveVal.length > 0) {
                        saveVal.forEach(function (item) {
                            var liLoginName = item.userId;
                            var liNiName = item.userName;
                            noticeUserList.push(liLoginName);
                            nameArr.push(liNiName);
                        })
                    }
                    $inputBox.data({
                        'noticeUserList': noticeUserList,
                        'saveVal': saveVal
                    });
                    $inputBox.val(nameArr.join(',')).attr('title', nameArr.join(','));

                    if ($inputBox.val() !== '' && $inputBox.val() !== []) {
                        $inputBox.removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');
                    }
                    $('.layui-layer-btn1').click();
                    // 清空告警接受人信息
                    $('#control_noticeUserList').data({
                        'saveVal': [],
                        'noticeUserList': []
                    }).val('');
                });
                // 左侧列表 点击事件
                function memberListClick($this) {
                    $this.find('.button').toggleClass('checkbox_true_full');
                    $('.multiPickerDlg_right_no_result').hide();
                    var orgId = $this.attr('data-id');
                    var userName = $this.attr('data-name');
                    var title = $this.attr('title');
                    var userId = $this.attr('userId');
                    var orgName = $this.attr('orgName');
                    var index = $this.index();
                    var repInx; //获取重复数组的索引
                    var newSaveVal = [];
                    if ($('#receive_member_list_view').data('cameraList') && $('#receive_member_list_view').data('cameraList').length > 0) {
                        $('#receive_member_list_view').data('cameraList').forEach(function (item) {
                            newSaveVal.push(item);
                        });
                    }
                    if ($this.closest('#searchResult').length > 0) {
                        $('#receiveResultView').find('li[userId="' + userId + '"]').find('.button').toggleClass('checkbox_true_full');
                    }
                    if (newSaveVal.length > 0) {
                        for (var i = 0; i < newSaveVal.length; i++) {
                            if (newSaveVal[i].userId == userId || newSaveVal[i].userId == userId) {
                                repInx = i;
                            };
                        };
                    };
                    if (repInx) {
                        newSaveVal.splice(repInx, 1);
                    } else {
                        if (repInx == 0) {
                            newSaveVal.splice(repInx, 1);
                        } else {
                            newSaveVal.push({
                                orgId: orgId,
                                userName: userName,
                                title: title,
                                index: index,
                                userId: userId,
                                orgName: orgName
                            });
                        };
                    };
                    //排序
                    function sortSaveVal(data, prop) {
                        function compareSaveVal(obj1, obj2) {
                            var time1 = obj1[prop],
                                time2 = obj2[prop];
                            if (time1 < time2) {
                                return -1;
                            } else if (time1 > time2) {
                                return 1;
                            } else {
                                return 0;
                            }
                        }
                        return data.sort(compareSaveVal);
                    }
                    newSaveVal = sortSaveVal(newSaveVal, 'index');
                    $('#receive_member_list_view').data({
                        'cameraList': newSaveVal
                    });
                    var liHtml = '';
                    if (newSaveVal && newSaveVal.length > 0) {
                        newSaveVal.forEach(function (item) {
                            var liLoginName = item.userId;
                            var liNiName = item.userName;
                            liHtml += '<li title=' + item.title + ' data-name=' + liNiName + ' data-id=' + item.orgId + ' userId=' + liLoginName + ' class="ww_menuDialog_DualCols_colRight_cnt_item token-input-token js_list_item">' +
                                '<span class="ww_commonImg icon icon_folder_blue"></span>' +
                                '<span class="ww_treeMenu_item_text" title=' + item.title + '>' + liNiName + '</span>' +
                                '<a href="javascript:" class="ww_menuDialog_DualCols_colRight_cnt_item_delete"><span class="ww_commonImg ww_commonImg_DeleteItem js_delete"></span></a>' +
                                '</li>';
                        });
                        $('#saveNode').html(liHtml);
                        $('#js-camera-totle').text(newSaveVal.length);
                    } else {
                        $('#saveNode').empty();
                        $('#js-camera-totle').text('0');
                        $('.multiPickerDlg_right_no_result').show();
                    }
                }
                $('#receive_member_list_view').on('click', 'li', function () {
                    var $this = $(this);
                    memberListClick($this);
                });
                $('#search_member_list').on('click', 'li', function () {
                    var $this = $(this);
                    memberListClick($this);
                });
                $('#clearMemberSearchInput').on('click', function () {
                    $('#receiveResultView').show();
                })
                searchSuccessFunc = function (data) {
                    if (data.code === '200') {
                        var list = data.data.list;
                        if (list.length > 0) {
                            var li = "";
                            for (var i = 0; i < list.length; i++) {
                                var receiveList = $('#receive_member_list_view').data('cameraList'),
                                    active = '';
                                if (receiveList && receiveList.length > 0) {
                                    receiveList.forEach(function (item) {
                                        if (item.userId == list[i].userId || item.userId == list[i].userId) {
                                            active = 'checkbox_true_full';
                                        }
                                    });
                                }
                                li += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk ${active}" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`;
                            };
                            $('.search_member_none').hide();
                            $('#search_member_list').show();
                            $('#search_member_list').addClass('ztree').html(li);
                        } else {
                            $('.search_member_none').show();
                            $('#search_member_list').hide();
                        }
                        //$('#searchResult').show();
                        // 滚动加载数据
                        $('#searchResult').on('mousewheel', function () {
                            //tab内容列表滚动到底部进行下一分页的懒加载事件
                            if ($('#memberSearchInput').val() == data.name) {
                                var $this = $(this),
                                    $currentContainer = $('#search_member_list'),
                                    viewHeight = $this.height(), //视口可见高度
                                    contentHeight = $currentContainer[0].scrollHeight, //内容高度
                                    scrollHeight = $this.scrollTop(), // 已经滚动了的高度
                                    currentCardItemNum = $currentContainer.find("li").length,
                                    totalCardItemNUM = parseInt(data.data.total);
                                if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM) {
                                    var successFn = function (data) {
                                        if (data.code === '200') {
                                            searchPage = (parseInt(searchPage) + 1).toString(10);
                                            var list = data.data.list;
                                            var li = "";
                                            for (var i = 0; i < list.length; i++) {
                                                var receiveList = $('#receive_member_list_view').data('cameraList'),
                                                    active = '';
                                                if (receiveList && receiveList.length > 0) {
                                                    receiveList.forEach(function (item) {
                                                        if (item.userId == list[i].userId || item.userId == list[i].userId) {
                                                            active = 'checkbox_true_full';
                                                        }
                                                    });
                                                }
                                                li += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk ${active}" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`;
                                            };
                                            $('#search_member_list').addClass('ztree').append(li);
                                        }
                                    }
                                    if (searchPage < (parseInt(data.data.totalPage) + 1)) {
                                        loadData(receivePort, true, {
                                            name: $('#memberSearchInput').val(),
                                            ajaxFilter: $('#memberSearchInput').val(),
                                            page: searchPage,
                                            isMySelf: isMySelf ? 2 : 1,
                                        }, successFn);
                                    }
                                }
                            }
                        });
                    }
                }
                //布控人员检索
                $('#memberSearchInput').off().on('keydown', function (event) {
                    event.stopPropagation();
                }).on('keyup', function (event) {
                    var value = $(this).val();
                    if (value !== '' && value !== null) {
                        $('#receiveResultView').hide();
                        $('#searchResult').show();
                        searchPage = 2;
                        loadData(receivePort, true, {
                            name: value,
                            ajaxFilter: value,
                            isMySelf: isMySelf ? 2 : 1
                        }, searchSuccessFunc);
                    } else {
                        $('#receiveResultView').show();
                        $('#searchResult').hide();
                    }
                });
                // 滚动加载数据
                $('#receiveResultView').on('mousewheel', function () {
                    //tab内容列表滚动到底部进行下一分页的懒加载事件
                    var $this = $(this),
                        $currentContainer = $('#receive_member_list_view'),
                        viewHeight = $this.height(), //视口可见高度
                        contentHeight = $currentContainer[0].scrollHeight, //内容高度
                        scrollHeight = $this.scrollTop(), // 已经滚动了的高度
                        currentCardItemNum = $currentContainer.find("li").length,
                        totalCardItemNUM = parseInt(data.data.total);
                    if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM) {
                        controlOpt.page = (Number(controlOpt.page) + 1).toString(10);
                        var successFn = function (data) {
                            if (data.code === '200') {
                                $('#loadLi').remove();
                                var liList = '';
                                var list = data.data.list;
                                for (var i = 0; i < list.length; i++) {
                                    liList += `<li data-id="${list[i].orgId}" data-name="${list[i].userName}" title="${list[i].userName}" userId="${list[i].userId}" orgName="${list[i].orgName}"><span class="button chk" treenode_check=""></span>${list[i].userName}(${list[i].orgName})</li>`
                                };
                                $('#receive_member_list_view').append(liList);
                                var userSaveVal = $inputBox.data('saveVal');
                                if ($('#receive_member_list_view').data('cameraList') && $('#receive_member_list_view').data('cameraList').length > 0 && userSaveVal) {
                                    userSaveVal.forEach(function (item) {
                                        //左侧选中
                                        $('#receive_member_list_view').find('li[userId="' + (item.userId ? item.userId : item.userId) + '"] .button').addClass('checkbox_true_full');
                                        item.index = $('li[userId="' + (item.userId ? item.userId : item.userId) + '"]').index();
                                    });
                                }
                            }
                        }
                        loadData(receivePort, true, controlOpt, successFn);
                        if ($('#loadLi').length == 0) {
                            var loadLi = '<div id="loadLi" style="margin-top:15px"></div>';
                            $('#receive_member_list_view').after(loadLi);
                            showLoading($('#loadLi'));
                        }
                    }
                });
            } else {
                $('.multiPickerDlg_search_wrapper').append('<div class="search_member_none">未选择通知范围</div>');
            }
        }
    };
    loadData(receivePort, true, controlOpt, receiveSuccessFunc);
}

//1:1比对公用方法
function commonOnetooneSearch(src1, src2) {
    var url = "./facePlatform/onetoone-new.html?dynamic=" + Global.dynamic;
    loadPage($('.one-to-one-popup'), url);
    $('.one-to-one-popup').removeClass('hide');
    $('.one-to-one-popup').find('#search-before2').addClass('none');
    $('.one-to-one-popup').find('#search-after2').removeClass('none');
    $('.one-to-one-popup').find('#search-after2 img').attr("src", src2);

    if (src1) {
        $('.one-to-one-popup').find('#search-after1 img').attr("src", src1);
        $('.one-to-one-popup').find('#search-before1').addClass('none');
        $('.one-to-one-popup').find('#search-after1').removeClass('none');
        $("#imgComparison").click();
    } else {
        $('.one-to-one-popup').find('#search-before1').removeClass('none');
        $('.one-to-one-popup').find('#search-after1').addClass('none');
    }
}

//函数防抖公共方法
function debounce(fn, wait) {
    let timer = null;
    return function () {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn.apply(this, arguments);
        }, wait);
    }
}

/**
 * 获取机构列表公用方法
 * @param {*} $container 下拉框容器
 * @param {*} orgId 机构id或政工机构id， 可根据本机构id获取机构信息; 若 userType = 1，若不传则默认分局机构id，若userType = 2， 不传则默认为市局机构id；
 * @param {*} orgType 机构类型； 1-纯分局（有人像抓拍机的机构）； 2-包含分局/警种（各业务单位）；3-纯辖区； 4-（有镜头的机构）
 * @param {*} userType 用户类型； 1-需要根据用户所属机构进行过滤（最多只到分局/警种层级）； 2-不需要根据用户所属机构进行过滤
 * @param {*} returnType 需要返回的数据类型；  1-只返回本机构节点信息；  2-只返回本机构下级节点信息； 3-返回本机构及下级节点信息。4-当orgId为市局节点时，返回市局、分局、派出所三级；5-只返回市局、分局层级，userType=1时，若用户为分局用户，只返回分局层级。 * 说明： 若需要根据用户所属机构过滤， 则不管查询的机构id为什么，均以用户所属机构为准
 * @param {*} treeType 1-机构 2-政工机构
 */
function commonOrgList($container, orgId, orgType, userType, returnType, treeType) {
    var port = 'v2/org/getOrgInfos',
        data = {
            orgId: orgId || '',
            orgType: orgType || 1,
            userType: userType || 2,
            returnType: returnType || 3,
            treeType: treeType || 1
        };
    var successFunc = function (data) {
        if (data.code === '200') {
            var result = data.data;
            // 对返回数组进行排序 市局排在最上层
            for (var i = 0; i < result.length; i++) {
                if (result[i].parentId === null) {
                    arrayBox = result[i];
                    result.splice(i, 1);
                    result.splice(0, 0, arrayBox);
                }
            }
            if (result) { // 存在返回值
                itemHtml = `<option class="option-item" orgid="${result[0].orgId}" value="${result[0].orgId}" selected>${result[0].orgName}</option>`;
                for (var i = 1; i < result.length; i++) {
                    itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                }
                $($container).html(itemHtml); // 元素赋值
                $($container).prop('disabled', false); // 非不可选
                $($container).selectpicker('refresh');
            } else {
                $($container).prop('disabled', true);
                $($container).val(null);
                $($container).selectpicker('refresh');
            }
        } else {
            $($container).prop('disabled', true);
            $($container).val(null);
            $($container).selectpicker('refresh');
        }
    };
    loadData(port, true, data, successFunc, undefined, 'GET');
}