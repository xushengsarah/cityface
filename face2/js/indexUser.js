(function (window, $) {

    var controlAlarmTimer1 = null; //刷新定时器

    // /**
    //  * 使用者登陆 数据获取 最新布控统计信息 布控数量 告警数量（当前模块已隐藏，需要时请到index-user.html中去掉hide）
    //  */
    // function loadBukongData() {
    // 	var port = 'index/bkCount',
    // 		successFunc = function (data) {
    // 			if (data.code == '000') {
    // 				var bkFaceCount = data.bkAmount ? data.bkAmount : 0,
    // 					gjCount = data.alarmCount ? data.alarmCount : 0;
    // 				$("#bkFaceCount").text(bkFaceCount);
    // 				$("#gjCount").text(gjCount);
    // 			} else {
    // 				$("#bkFaceCount").text('0');
    // 				$("#gjCount").text('0');
    // 				warning.say(data.msg);
    // 			}
    // 		};
    // 	loadData(port, true, {}, successFunc);
    // };
    // loadBukongData();

	/**
	 * 使用者登陆 首页告警滚动效果
	 */
    function refreshHome() {
        // $('#warning-list').css('width', 5 * width + 'px');
        var width = $('#warning-list').parent().outerWidth();
        var warningLeg = $('#warning-list').children().length;
        var rollTimes = 0;
        if (warningLeg <= 4) {
            rollTimes = 1;
        } else if (warningLeg <= 8 && warningLeg > 4) {
            rollTimes = 2;
        } else if (warningLeg <= 12 && warningLeg > 8) {
            rollTimes = 3;
        } else if (warningLeg <= 16 && warningLeg > 12) {
            rollTimes = 4;
        } else if (warningLeg <= 20 && warningLeg > 16) {
            rollTimes = 5;
        } else {
            rollTimes = 0;
        }
        // 滚动效果补充数据
        var $addHtmlP = $('#warning-list');
        $addHtmlP.append($addHtmlP.find('.warning-item').eq(0).prop('outerHTML'));
        $addHtmlP.append($addHtmlP.find('.warning-item').eq(1).prop('outerHTML'));
        $addHtmlP.append($addHtmlP.find('.warning-item').eq(2).prop('outerHTML'));
        $addHtmlP.append($addHtmlP.find('.warning-item').eq(3).prop('outerHTML'));

        var num = rollTimes;
        if (rollTimes > 0) {
            var widthLen = 0;
            controlAlarmTimer1 = window.setInterval(function () {
                var $this = $('#warning-list');
                $this.animate({
                    marginLeft: -widthLen
                }, 1000, function () {
                    if (num > 0) {
                        num--;
                        widthLen += width;
                    } else {
                        widthLen = 0;
                        $this.css('marginLeft', 0)
                        num = rollTimes;
                    }
                })
                if (!$('#pageSidebarMenu .sidebar-item').eq(0).hasClass('active')) {
                    window.clearInterval(controlAlarmTimer1);
                    $('#warning-list').css('marginLeft', 0); // 滚动恢复初始位置
                }
            }, 3000);
        }
    }

	/**
	 * 使用者登陆 数据获取 最新告警信息
	 */
    window.userLoadAlarmData = function () {
        var data = new Date();
        var endData = data.pattern("yyyy-MM-dd hh:mm:ss");
        data.setDate(data.getDate() - 7); //获取7天前的日期
        var startData = data.pattern("yyyy-MM-dd hh:mm:ss");

        var port = 'v2/bkAlarm/alarmList',
            successFunc = function (data) {
                window.clearInterval(controlAlarmTimer1); // 停止滚动效果
                $('#warning-list').css('marginLeft', 0); // 滚动恢复初始位置
                if (data.code == '200') {
                    var result = data.data.list;
                    if (!result) {
                        loadEmpty($('#warning-list').closest('.warning-list-wrap'), '当前暂无布控告警信息', '', true, true);
                        return;
                    }
                    // // 限制告警信息为未处理
                    // for (var t = 0; t < result.length; t++) {
                    // 	if (result[t].status !== 0 && result[t].status !== '0') {
                    // 		result.splice(t, 1)
                    // 	}
                    // }
                    // // 限制告警信息为20条
                    // if (result.length > 20) {
                    // 	result.splice(20, result.length - 20)
                    // }
                    if (result.length > 0) {
                        var _html = '',
                            len = result.length > 20 ? 20 : result.length;
                        for (var i = 0; i < len; i++) {
                            var threshold = 0,
                                status = parseFloat(result[i].status),
                                statusStr, statusCls = '';
                            if (status === 0) {
                                statusStr = '未处理';
                                statusCls = ' grade1'
                            } else if (status === 1) {
                                statusStr = '已命中';
                                statusCls = ' grade2'
                            } else if (status === 2) {
                                statusStr = '已误报';
                                statusCls = ' grade3'
                            } else {
                                statusStr = '未知';
                                statusCls = ' grade1'
                            }
                            if (result[i].threshold) {
                                threshold = parseFloat(result[i].threshold);
                            }
                            _html += `
                                <li class="warning-item warning-item-user-home">
                                    <div class="warning-item-content">
                                        <div class="warning-item-img-box">
                                            <div class="warning-item-img">
                                                <img src="${result[i].url || './assets/images/control/person.png'}"/>
                                                <img src="${result[i].smallHttpUrl || './assets/images/control/person.png'}"/>
                                            </div>
                                            <span class="warning-item-percent grade1">${threshold}%</span>
                                        </div>
                                        <div class="warning-item-name">
                                            <span title="${result[i].comments || '未知'}">${result[i].comments || '未知'}</span>
                                            <span class="warning-item-level${statusCls}">${statusStr}</span>
                                        </div>
                                        <p class="warning-item-time">
										<i class="aui-icon-color-default aui-icon-tree-camera"></i>
                                            <span class="warning-item-text cameral-name-text" title="${result[i].cameraName || '未知'}">${result[i].cameraName || '未知'}</span>
                                        </p>
                                        <p class="warning-item-time">
                                            <i class="aui-icon-color-default aui-icon-history"></i>
                                            <span class="warning-item-text">${result[i].alarmTime || '未知'}</span>
                                        </p>
                                    </div>
                                </li>
							`;
                        }
                        $("#warning-list").empty().html(_html);
                        // 给节点上添加数据
                        $("#warning-list").find('.warning-item').each(function (index, el) {
                            $(el).data('listData', result[index]);
                        });
                        refreshHome();
                    } else {
                        loadEmpty($('#warning-list').closest('.warning-list-wrap'), '当前暂无布控告警信息', '', true, true);
                    }
                } else {
                    loadEmpty($('#warning-list').closest('.warning-list-wrap'), "当前暂无布控告警信息", "", true, true);
                }
            };
        loadData(port, true, {
            page: 1,
            size: 20,
            viewType: 4,
            showType: 2,
            status: 0,
            startTime: startData,
            endTime: endData
        }, successFunc);
    };
    window.userLoadAlarmData();

    // 绑定查看大图代码
    $('#warning-list').on('click', '.warning-item', function (evt) {
        window.clearInterval(controlAlarmTimer1); // 停止滚动效果
        var $alarm = $(this).parent(),
            alarmId = $alarm.attr('id') + '-alarm',
            index = $(this).index(),
            listData = $(this).data('listData');
        window.createBigImgMask($alarm, alarmId, index, $('#usearchImg'), evt, {
            cardImg: $(this),
            data: listData,
            html: $(changeAlarmMaskHtml(listData)),
            closeBigImg: true
        });
    });

    // 使用者登陆导航栏 首页图标 点击事件
    $('#pageSidebarMenu .aui-icon-home-2').closest('.sidebar-item').on('click', function () {
        window.userLoadAlarmData(); // 获取最新告警信息
    })

    // 使用者登陆 图片上传
    $('#uindexImg').find('.uploadFile').on('change.indexUser', function () {
        $(".img-alert").removeClass("show");
        var _this = $(this),
            fileNameArr = this.value.split('\\'), // 文件名路径数组
            fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
            fileNameTypeArr = fileName.split('.'),
            fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase(),
            typeArr = ['bmp', 'jpg', 'jpeg', 'png', 'dib', 'webp', 'svgz', 'gif', 'ico', 'svg', 'tif', 'xbm', 'jfif', 'pjpeg', 'pjp', 'tiff'];
        if (typeArr.indexOf(fileType) < 0) {
            warningTip.say('上传文件格式不正确,请上传图片格式');
            this.value = '';
            return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            var addimg = reader.result;
            var $imgBox = $('#uindexImg');
            $('#uindexImg .uploadFile')[0].value = '';
            $imgBox.find('img').attr('src', addimg);
            $imgBox.find('.icon').removeClass('hide');
            $imgBox.find('.user-img-wrap').addClass('up');
            $('#imgBase64').data('base64', addimg);
            $("#uindexImg .text").hide(); //使用者首页上传提示文本隐藏
            //$('#idcardsearchindex').val('');
            // $('#uindexsearch').click();
        };
        reader.readAsDataURL(this.files[0]);
    });

    // 使用者登陆 添加照片 点击事件
    $('#uindexImg').on('click', '.aui-icon-close', function () {
        $(this).addClass('hide').siblings('img').attr('src', './assets/images/user/add-user.png');
        $('#imgBase64').removeData('base64');
        $(this).closest('.user-img-wrap').removeClass('up').siblings('.text').show();
        // $('#idcardsearchindex').val('');
        $("#imgBase64")[0].value = '';
    });

    // 使用者登陆 搜索按钮 点击事件
    $('#uindexsearch').on('click', function (e) {
        var img = $("#uindexImg .user-img-wrap img").attr("src");
        var card = $("#idcardsearchindex").val();
        // 添加公共函数
        function addImgByIDCard(card) {
            var reg = /(^\d{15}$)|(^\d{17}(\d|X)$)/;
            if (reg.test(card)) {
                window.loadData('v2/faceRecog/findImageByIdCard', true, {
                    idcard: card
                }, function (data) {
                    if (data.code === '200') {
                        $('#imgBase64')[0].value = '';
                        $('#imgBase64').val('');
                        $('#imgBase64').data('base64', 'data:image/png;base64,' + data.base64);
                        $("#uindexImg .user-img-wrap img").attr("src", 'data:image/png;base64,' + data.base64);
                        var $imgBox = $('#uindexImg');
                        $imgBox.find('img').attr('src', 'data:image/png;base64,' + data.base64);
                        $imgBox.find('.icon').removeClass('hide');
                        $imgBox.find('.user-img-wrap').addClass('up');
                        $("#uindexImg .text").hide();
                    } else {
                        warningTip.say(data.message);
                    }
                    $("#idcardsearchindex").val(null);
                }, '', 'GET', sourceType == 'ga' ? serviceUrlOther : '');
            } else {
                $('#uindexImg').siblings('.idcard-alert').addClass('show');
                $("#idcardsearchindex").val(null);
            }
        }

        //重置
        if (img.indexOf('add-user.png') > 0) {
            img = '';
        }
        if (isEmpty(img)) {

            if (!isEmpty(card)) {
                addImgByIDCard(card);
                return false;
            } else {
                $('#uindexImg').siblings(".img-alert").addClass("show");
                $('#uindexImg').siblings('.idcard-alert').removeClass('show');
                return false;
            }

        }

        if (card.length === 0) {
            var $barItem = $('#pageSidebarMenu .aui-icon-carsearch2').closest('.sidebar-item'),
                barIndex = $barItem.index(),
                $saveItem = $('#content-box').children().eq(barIndex),
                $userImg = $saveItem.find('#usearchImg'),
                url = $('#pageSidebarMenu .aui-icon-carsearch2').parent("a").attr("lc") + "?dynamic=" + Global.dynamic;
            if ($userImg.length === 0) {
                $('#imgBase64').data('base64', img);
                $("#imgBase64").data('searchImmedia', true);
                $barItem.click();
            } else {
                var $addImg = $userImg.find('.add-image-item');
                if ($addImg.length === 0) {
                    $('#imgBase64').data('base64', img);
                    $("#imgBase64").data('searchImmedia', true);
                    $saveItem.empty();
                    loadPage($saveItem, url);
                    $barItem.click();
                } else {
                    addSearchImg(img);
                    $barItem.click();
                }
            }
        } else {
            addImgByIDCard(card);
        }
    });

    // 使用者登陆 身份证 输入触发事件
    $(document).on('keydown', '#idcardsearchindex', function (e) {
        var $saveItem = $('#idcardsearchindex').closest('.content-save-item');
        $saveItem.find(".idcard-alert").removeClass("show");
        $saveItem.find(".img-alert").removeClass("show");
        var code = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
        if (code == 13) {
            $('#uindexsearch').click();
        }
    })

    // 使用者登陆 点击关闭图标 身份证数据置空（当前模块已隐藏 需要时请到index-user.html中去掉hide）
    $('#home-icon-close').on('click', function () {
        $('#idcardsearchindex').val('')
    });

    // 使用者登陆 布控数量模块 点击事件（当前模块已隐藏）
    $('#bkNumber').on('click', function () {
        var $sideBar = $('#pageSidebarMenu').find('.aui-icon-monitor2'),
            $item = $sideBar.closest('.sidebar-item');
        $item.click();
    });

    // 使用者登陆 告警数量模块 点击事件（当前模块已隐藏）
    $('#gjNumber').on('click', function () {
        var $sideBar = $('#pageSidebarMenu').find('.aui-icon-warning'),
            $item = $sideBar.closest('.sidebar-item');
        $item.click();
    });

    // 使用者登陆 图片对比功能 （当前模块已隐藏 需要时请到index-user.html中去掉hide）
    $('#onecompare').on('click', function () {
        var container = $('#content-box');
        var url = "./facePlatform/onetoone.html?dynamic=" + Global.dynamic;
        loadPage(container, url);
    });
})(window, window.jQuery)