(function (window, $) {
    var facedbSData = [],
        labelsData = [], // 档案信息标签数据
        cacheArr = []; //静态缓存数组


    // 身份证号回车事件,去掉身份证提示
    $(document).on('keydown', '#idCardSearchS', function (e) {
        $(this).closest(".card-side-header-box").find(".idcard-alert").removeClass("show");
        // $(".idcard-alert").removeClass("show");
        $(this).closest(".search-box").find(".img-alert").removeClass("show");
        var code = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
        if (code == 13) {
            findIdcard(e);
        }
    })

    // 初始化图片
    function initImgS() {
        var img = $("#imgBase64").val(),
            idcard = $("#imgBase64").attr('idcard'),
            html = '';
        if ($("#imgBase64").data('base64')) {
            img = $("#imgBase64").data('base64');
        }
        if (!isEmpty(img)) {
            $("#imgBase64").removeData('base64');
            html = createAddImageItem(img);
            $("#searchImgS .add-image-icon").before(html);
            if ($("#imgBase64").data('searchImmedia')) {
                $("#imgBase64").removeData('searchImmedia')
                imgDom(img, $('#staticSearch'), $("#searchImgS"));
            } else {
                imgDom(img, $('#staticSearch'), $("#searchImgS"), true);
            }
            $("#imgBase64")[0].value = '';
            $('#searchImgS').removeClass('center');
            $('#searchImgS').find('.add-image-icon').removeClass('add-image-new');
            $('#searchImgS').find('.add-image-box-text').addClass('hide');
            loadEmpty($('#staticContentContainerS').find('.card-content'));
        } else {
            $('#searchImgS').addClass('center');
            loadEmpty($('#staticContentContainerS').find('.card-content'));
        }
        // 判断是否有身份证信息
        if (idcard) {
            $('#idCardSearchS').val(idcard);
            $("#imgBase64").removeAttr('idcard');
        }
        getSelectComments($("#commentSelectStatic"));
    }
    initImgS(); // 初始化左侧照片

    // 纯静态页面 图片上传
    $('#searchImgS').find('.uploadFile').on('change.staticface', function () {
        if ($("#staticSearch").hasClass("hide") && $("#staticSearch").attr("type") != '624') {
            this.value = '';
            $(this).attr("title", "");
            warningTip.say("该事件暂无检索权限，请切换事件或点击申请检索按钮发起检索申请");
            return;
        }

        if (this.value != '') {
            var _this = $(this),
                html = '',
                fileNameArr = this.value.split('\\'), // 文件名路径数组
                fileSize = this.files[0].size,
                fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
                fileNameTypeArr = fileName.split('.'),
                fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase(),
                typeArr = ['bmp', 'jpg', 'jpeg', 'png', 'dib', 'webp', 'svgz', 'gif', 'ico', 'svg', 'tif', 'xbm', 'jfif', 'pjpeg', 'pjp', 'tiff'];
            if (typeArr.indexOf(fileType) < 0) {
                this.value = '';
                warningTip.say('格式不正确,请上传图片格式');
                return;
            }
            if (fileSize > 10 * 1024 * 1024) {
                warningTip.say('上传文件过大,请上传不大于10M的文件');
                this.value = '';
                return;
            }
            var reader = new FileReader();
            reader.onload = function (e) {
                var addimg = reader.result;
                html = createAddImageItem(addimg);
                _this.closest('.add-image-icon').before(html);
                $('#searchImgS').prev().find('img').attr('src', addimg);
                var $imgItem = $('#searchImgS').find('.add-image-item');
                $('#searchImgS').find('.uploadFile')[0].value = '';
                if ($imgItem.length > 5) {
                    var clientH = $('#searchImgS')[0].clientHeight;
                    $('#searchImgS').removeClass('scroll');
                    $('#searchImgS').addClass('scroll');
                    $('#searchImgS').animate({
                        'scrollTop': clientH
                    }, 500);
                }
                imgDom(addimg, $('#staticSearch'), $("#searchImgS"), true); // 上传图片判断是否多张人脸
                $("#staticSearch").removeClass("hide");
                $("#staticApply").addClass("hide");
            };
            reader.readAsDataURL(this.files[0]);
            $('#searchImgS').removeClass('center');
            $('#searchImgS').find('.add-image-icon').removeClass('add-image-new');
            $('#searchImgS').find('.add-image-box-text').addClass('hide');
            $("#searchImgS .add-image-icon").siblings('.add-image-item').removeClass('active');
        }
    });

    //切换图片反显搜索条件
    function showSearchLimitStatic($data) {
        $("#ageStartS").val($data.agegroup.split("-")[0]);
        $("#ageEndS").val($data.agegroup.split("-")[1]);
        $("#sexS").find(`input[name=radio-sexS-1][value=${$data.sex}]`).next().click();
        //全部人脸库
        if (facedbSData.length == $data.libids.length) {
            $("#facedbS .facedb-box-title .ui-checkboxradio-label").addClass('ui-checkboxradio-checked');
        } else {
            $("#facedbS .facedb-box-title .ui-checkboxradio-label").removeClass('ui-checkboxradio-checked');
            let libOtherArr = facedbSData.filter(element => {
                return $data.libids.indexOf(element.libId) < 0;
            })
            libOtherArr.forEach(element => {
                $("#facedbSContent").find(`.ui-checkboxradio-label[value=${element.libId}]`).next().removeAttr('checked');
            });
        }
        $data.libids.forEach(element => {
            $("#facedbSContent").find(`.ui-checkboxradio-label[value=${element}]`).next().prop('checked', true);
        });

        //厂家
        let platformOtherArr = $('#algorithmContent').data("cjData").filter(element => {
            return $data.platformId.indexOf(element.platformId) < 0;
        })
        platformOtherArr.forEach(element => {
            $("#algorithmContent").find(`.ui-checkboxradio-label[cjid=${element.platformId}]`).next().removeAttr('checked');
        });
        $data.platformId.forEach(element => {
            $("#algorithmContent").find(`.ui-checkboxradio-label[cjid=${element}]`).next().prop('checked', true);
        });

        //结果数
        $("#topS").find(`input[name=top-2][value=${$data.limit}]`).next().click();
        checkboxFunc();
        radioFunc();
    };

    // 纯静态检索 左侧图片点击事件 左侧有多个图片时 切换图片选中状态
    $('#searchImgS').on('click', '.add-image-item', function () {
        $(this).addClass('active').siblings('.add-image-item').removeClass('active');
        var $addImgBox = $(this).find('.add-image-img');
        if (!$addImgBox.attr('picId') || $addImgBox.attr('picstatus') != '1') {
            getPicId($addImgBox.attr('src'), $(this).attr('value'), $('#searchImgS')); // 获取图片的唯一picId
        } else {
            //切换的图片是缓存图片的话显示缓存图片对应的div
            if ($addImgBox.attr("cache") != undefined) {
                $("#allCountS").html('(' + $("#staticContentContainerS").find(`#factoryAlg${$addImgBox.attr("cache")}`).attr("allCountS") + ')');
                $("#staticContentContainerS").find(`#factoryAlg${$addImgBox.attr("cache")}`).removeClass("hide").siblings().addClass("hide");
                showSearchLimitStatic($(this).find(".add-image-img").data());

                if (!$(`#factoryAlg${$addImgBox.attr("cache")}`).data('listData')) {
                    // 清空横向对比图片数据
                    $('#contrastImgBox img').attr('src', './assets/images/control/person.png');
                    $(`#factoryAlg${$addImgBox.attr("cache")}`).data('listData', '');
                    $('#contrastImgBox').data('listData', '');
                    $('#contrastBut').attr('disabled', 'disabled');
                    $('#staticContrastConfirmW').attr('disabled', 'disabled');
                    $('#staticOnetooneSearchW').attr('disabled', 'disabled');
                    $('#quicklyJSW').attr('disabled', 'disabled');
                } else {
                    $('#contrastImgBox img').attr('src', $(`#factoryAlg${$addImgBox.attr("cache")}`).data('listData').url);
                    $('#contrastBut').attr('disabled', false);
                    $('#staticContrastConfirmW').attr('disabled', false);
                    $('#staticOnetooneSearchW').attr('disabled', false);
                    $('#quicklyJSW').attr('disabled', false);
                    $('#contrastImgBox').data('listData', $(`#factoryAlg${$addImgBox.attr("cache")}`).data('listData'));
                }
            } else {
                getPowerUse('1', $("#commentSelectStatic").find(".selectpicker").val(), $addImgBox.attr('picId'));
            }
        }
        var src = $(this).find('img').attr('src');
        $('#searchImgS').prev().find('img').attr('src', src);
    })

    // 左侧图片删除事件
    $('#searchImgS').on('click', '.aui-icon-delete-line', function (e) {
        e.stopPropagation();
        $('#static-page').find(".card-img-hover").remove();
        var father = $(this).closest('.add-image-item'),
            flag = false;  //判断删除的图片是否是最后检索的图片，是就把最新的选中图片变成最后检索图片    
        //把对应的图片缓存删除
        cacheArr.forEach((val, index) => {
            if (father.find(".add-image-img").hasClass("cache" + val)) {
                cacheArr.splice(index, 1);
                $("#staticContentContainerS").find(`#factoryAlg${val}`).remove();
            }
        })
        if (father.find(".add-image-img").data("isAll") == '1') {
            flag = true;
        }
        father.remove();
        var $imgItem = $('#searchImgS').find('.add-image-item');
        if (!$('#searchImgS').find('.add-image-item.active').length) {
            $imgItem.eq(-1).addClass('active');
        }
        if ($imgItem.length < 6) {
            $('#searchImgS').removeClass('scroll');
        }
        if ($imgItem.length === 0) {
            $('#searchImgS').addClass('center');
            $('#searchImgS').find('.add-image-icon').addClass('add-image-new');
            $('#searchImgS').find('.add-image-box-text').removeClass('hide');
        }
        var $imgSrc = $('#searchImgS').find('.add-image-item.active');
        if ($imgSrc.length) {
            $('#searchImgS').prev().find('img').attr('src', $imgSrc.find('img').attr('src'));
        } else {
            $('#searchImgS').prev().find('img').attr('src', './assets/images/control/person.png');
        }
        // if (flag) {
        //     $('#searchImgS').find('.add-image-item.active .add-image-img').data("isAll", 1);
        // }
        $('#searchImgS').find('.add-image-item.active').click();
        if (!$("#staticContentContainerS").find(".card-content .factoryAlg").length) {
            // 清空横向对比图片数据
            $('#contrastImgBox img').attr('src', './assets/images/control/person.png');
            $('#contrastImgBox').data('listData', '');
            $('#contrastBut').attr('disabled', 'disabled');
            $('#staticContrastConfirmW').attr('disabled', 'disabled');
            $('#staticOnetooneSearchW').attr('disabled', 'disabled');
            $('#quicklyJSW').attr('disabled', 'disabled');

            $("#allCountS").html("");
            $("#staticContentContainerS").find(".card-bottom").addClass("hide");
            $("#staticContentContainerS").find(".card-content .flex-column-wrap.empty-wrap").removeClass("hide");
        }
        // 关闭截图弹框
        if ($("body").find('.mask-img-fixed').length > 0) {
            $('.mask-img-fixed').removeClass('show');
            $('.mask-img-fixed').addClass('hide');
        }
    })

    // 纯静态页面 加载算法厂家
    function loadStaticCjs() {
        // 左侧表单 加载算法厂家
        var port = 'v2/faceRecog/manufactors',
            successFunc = function (data) {
                hideLoading($('body'));
                if (data.code === '200') {
                    var cjs = data.data, // 算法厂家数据
                        cj_html = '';
                    // 循环拼接算法厂商节点，左侧多选按钮框
                    for (var i = 0; i < cjs.length; i++) {
                        cj_html += `<div class="aui-col-4">
							<label for="checkbox-alg-${i}"  cjid="${cjs[i].platformId}" cjname="${cjs[i].platformName}" class='ui-checkboxradio-tag'>${cjs[i].platformName}</label>
							<input type="checkbox" name="checkbox-alg-3" id="checkbox-alg-${i}" data-role="checkbox-button" checked/>
						</div>`;
                    }
                    // 插入节点，算法多选按钮数据
                    $('#algorithmContent').data("cjData", cjs);
                    $('#algorithmContent').append(cj_html);
                    checkboxFunc();
                } else {
                    warning.say(data.message);
                }
            };
        loadData(port, true, {}, successFunc, undefined, 'GET', sourceType == 'ga' ? serviceUrlOther : '');
    }
    loadStaticCjs(); // 纯静态页面 加载算法厂家

    //搜索
    $('#staticSearch').click(function () {
        if ($("#searchImgS").find(".add-image-item").length > 0 && $("#searchImgS").find(".add-image-item.active .add-image-img").attr("picStatus") == '0') {
            return;
        }
        // 防止暴力点击 点击一次之后 2s后才能第二次点击
        $('#staticSearch').attr('disabled', 'disabled');
        setTimeout(function () {
            $('#staticSearch').removeAttr('disabled')
        }, 1000)

        // 判断是否选择检索任务
        if (!$("#commentSelectStatic").closest('.form-group').hasClass('hide') && $("#commentSelectStatic").find(".selectpicker").val() == '' && $("#commentSelectStatic").attr("isverify") != 0) {
            $("#commentSelectStatic").next().removeClass("hide");
            return;
        } else {
            $("#commentSelectStatic").next().addClass("hide");
        }

        var currentStaticId = $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'); // 当前检索图片的staticId
        var currentStaticSrc = $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr('src'); // 当前检索图片的staticId
        $('#searchImgS').data('currentStaticId', currentStaticId);
        $('#searchImgS').data('currentStaticSrc', currentStaticSrc);
        // 清空横向对比图片数据
        $('#contrastImgBox img').attr('src', './assets/images/control/person.png');
        $('#contrastImgBox').data('listData', '');
        $('#contrastBut').attr('disabled', 'disabled');
        $('#staticContrastConfirmW').attr('disabled', 'disabled');
        $('#staticOnetooneSearchW').attr('disabled', 'disabled');
        $('#quicklyJSW').attr('disabled', 'disabled');

        $("#staticContentContainerS").find(".card-subtitle").text("（0）");
        // 去除显示区域大小
        var $cardContent = $('#staticContentContainerS').find('.card-content');
        // 调用公共获取侧边栏函数
        var staticData = getSearchStaticData().static;
        if ($cardContent.length > 0) {
            //$cardContent.removeAttr('style');
            $(window).off('resize.staticface');
        }

        if ($('#searchImgS').find('.add-image-item').length === 0) {
            warningTip.say('请选择检索照片！');
        } else {
            if ($("#searchImgS").find(".add-image-item.active .add-image-img").attr("picReason") != '1') { //判断是否是第一次请求
                // 给图片绑定静态id
                var picBase64 = staticData.base64;

                if (picBase64.indexOf("http") == 0) { //url
                    var picIdPortData = {
                        url: picBase64,
                        staticId: $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId')
                    };
                } else { //base64
                    var picIdPortData = {
                        base64: picBase64,
                        staticId: $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId')
                    };
                }

                var picIdPort = 'v2/faceRecog/uploadImage',
                    picIdSuccessFunc = function (data) {
                        if (data.code == '200') {
                            $("#searchImgS").find(".add-image-item.active .add-image-img").attr("picId", data.staticId);
                            $("#searchImgS").find(".add-image-item.active .add-image-img").attr("picReason", "1");
                            $("#searchImgS").find(".add-image-item.active .add-image-img").attr('picStatus', '1');

                            var searchPort = 'v3/myApplication/getIncidentInfo',
                                searchData = {
                                    "types": ['1'],
                                    "incidentId": $("#commentSelectStatic").find(".selectpicker").val(),
                                    "staticId": $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId')
                                },
                                searchSuccessFunc = function (data) {
                                    if (data.code === '200') {
                                        $("#staticSearch").attr("type", "");
                                        refreshContainerS(staticData, $('#staticContentContainerS'));
                                    } else if (data.code === '624') { //特殊人员
                                        $("#staticSearch").addClass("hide");
                                        $("#staticApply").removeClass("hide");
                                        //type为624代表是特殊人员上传图片等不影响
                                        $("#staticSearch").attr("type", "624");
                                        //warningTip.say('该人员为特殊人员，请申请特殊人员权限审批通过后，选择该事件方可检索');
                                        warningTip.say(data.message);
                                    } else if (data.code === '601') {
                                        $("#staticSearch").attr("type", "");
                                        warningTip.say("获取检索权限失败,请选择检索事件");
                                    } else {
                                        $("#staticSearch").attr("type", "");
                                        warningTip.say("获取检索权限失败,请稍后再试");
                                    }
                                }
                            loadData(searchPort, true, searchData, searchSuccessFunc);
                        } else {
                            warningTip.say(data.message);
                            $("#searchImgS").find(".add-image-item.active .add-image-img").attr('picStatus', '0');
                        }
                    };
                loadData(picIdPort, false, picIdPortData, picIdSuccessFunc);
            } else {
                // 默认请求加载右侧图片一次
                refreshContainerS(staticData, $('#staticContentContainerS'));
                // $("#static-page").removeClass("layout-open-bottom");
            }
        }
    });

    // // 点击下方详情关闭按钮操作
    // $('.card-side-close').on('click', function () {
    // 	$("#static-page").removeClass("layout-open-bottom");
    // 	$(this).removeClass('active');
    // });

    //检索条件详情展开swiper组件id事件绑定 比中按钮事件 手动点击比中之后，比中置灰
    $(document).on('click', '.sureSearch', function () {
        var $self = $(this);
        if (!$self.hasClass('alreadySureSearch')) {
            warningTip.say('目标比中已命中', 1)
            $self.addClass('alreadySureSearch')
            $self.attr('disabled', 'true');
        } else {
            $self.attr('disabled', 'true');
        }
    });

    //检索条件详情展开swiper组件id事件绑定
    $(document).on('click', '[id*="imgDetail-"] .repeatSearch', function () {
        var $targetImg = $(this).closest('.swiper-slide').find('.img').eq(1),
            $searchImg = $('#searchImgS');
        repeatSearch($searchImg, $targetImg);
    });

    // 详情
    $(document).on('click', '[id*="imgDetail-"] .quitControl', function () {
        var url = "./facePlatform/control-new.html?dynamic=" + Global.dynamic,
            controlData = $(this).closest('.swiper-slide').data('controlData');
        $('.control-new-popup').addClass('show').data('controlData', controlData);
        loadPage($('.control-new-popup'), url);
        $('.control-new-popup').removeClass('hide');
    });

    showLoading($('body')); // 显示加载进度

    // 初始化分析是否card-content下面是否有空数据节点
    var $staticFaceCard = $('#staticContentContainerS').find('.card-content'),
        staticFaceCardLen = $staticFaceCard.children().length;
    if (staticFaceCardLen === 1) {
        var $staticChild = $staticFaceCard.children();
        if ($staticChild.hasClass('flex-column-wrap empty-wrap')) {
            $(window).off('resize.staticface').on('resize.staticface', function () {
                var totalH = $('#staticContentContainerS').parent().outerHeight() - 60,
                    headH = $('#staticContentContainerS').find('.card-title-box').outerHeight(),
                    disH = totalH - headH;
                $staticFaceCard.outerHeight(disH);
            });
            window.setTimeout(function () {
                var totalH = $('#staticContentContainerS').parent().outerHeight() - 60,
                    headH = $('#staticContentContainerS').find('.card-title-box').outerHeight(),
                    disH = totalH - headH;
                $staticFaceCard.outerHeight(disH);
            }, 100)
        }
    }

    // 加载库列表
    function getManufactorStatic() {
        var port = 'v2/faceRecog/libs',
            successFunc = function (data) {
                hideLoading($('body'));
                if (data.code == '200') {
                    var dbs = data.data, // 人脸库数据
                        db_html = '';
                    facedbSData = dbs;
                    // 插入人脸库数据和节点
                    dbs.forEach(function (v, index) {
                        db_html += `<div class="aui-col-4">
							<label for="checkbox-facedbS-${index}" class="ui-checkboxradio-tag" value="${v.libId}" title="${v.libName}">${v.libName}</label>
    						<input type="checkbox" name="checkbox-facedbS" id="checkbox-facedbS-${index}" data-role="checkbox-button" checked>
						</div>`;
                    });

                    // 插入节点，人脸库数据
                    $('#facedbSContent').append(db_html);
                    checkboxFunc();
                    radioFunc();
                    // 数据绑定
                    $('#facedbSContent').find(".ui-checkboxradio-tag").each(function (index, el) {
                        $(el).data('listData', dbs[index]);
                    });

                    var selectData = [];
                    var libNameVal = [];
                    dbs.map(function (item) {
                        selectData.push(item);
                        libNameVal.push(item.libName);
                    });
                    $('#facedbS').data({
                        'selectData': selectData
                    });
                    $('#facedbS').val(libNameVal.join(',')).attr('title', libNameVal.join(','));
                } else {
                    warning.say(data.msg);
                }
            };
        loadData(port, true, {}, successFunc, undefined, 'GET', sourceType == 'ga' ? serviceUrlOther : '');
    };
    getManufactorStatic(); //人脸库选择

    // 库列表弹框列表点击功能
    $('#facedbSContent').off('click', '.ui-checkboxradio-tag').on('click', '.ui-checkboxradio-tag', function () {
        var rowData = $(this).data('listData'),
            selectedData = $('#facedbS').data('selectData') ? $('#facedbS').data('selectData') : [];
        if (!$(this).hasClass('ui-checkboxradio-checked')) {
            // $(this).next().prop('checked', true);
            selectedData.push(rowData);
            var libNameVal = [];
            selectedData.forEach(function (item) {
                var liNiName = item.libName;
                libNameVal.push(liNiName);
            })
            $('#facedbS').data({
                'selectData': selectedData
            });
            $('#facedbS').val(libNameVal.join(',')).attr('title', libNameVal.join(','));
        } else {
            // $(this).next().removeAttr('checked');
            selectedData.forEach(function (e, n) {
                if (e.libId == rowData.libId) {
                    selectedData.splice(n, 1);
                }
            });
            var libNameVal = [];
            selectedData.forEach(function (item) {
                var liNiName = item.libName;
                libNameVal.push(liNiName);
            })
            $('#facedbS').data({
                'selectData': selectedData
            });
            $('#facedbS').val(libNameVal.join(',')).attr('title', libNameVal.join(','));
        }
        // checkboxFunc();
        // radioFunc();
        if (selectedData.length == facedbSData.length) {
            $('#facedbS').find('.facedb-box-title .ui-checkboxradio-checkbox-label').addClass('ui-checkboxradio-checked');
        } else {
            $('#facedbS').find('.facedb-box-title .ui-checkboxradio-checkbox-label').removeClass('ui-checkboxradio-checked');
        }
    })

    // 库列表弹框全选功能
    $('#facedbS').find('.facedb-box-title').on('click', '.ui-checkboxradio-checkbox-label', function () {
        var $labelItem = $('#facedbSContent').find('.ui-checkboxradio-tag');
        if (!$(this).hasClass('ui-checkboxradio-checked')) {
            $(this).addClass('ui-checkboxradio-checked');
            for (var i = 0; i < $labelItem.length; i++) {
                $labelItem.eq(i).next().prop('checked', true);
            }
            var selectData = [];
            var libNameVal = [];
            facedbSData.map(function (item) {
                selectData.push(item);
                libNameVal.push(item.libName);
            });
            $('#facedbS').data({
                'selectData': selectData
            });
            $('#facedbS').val(libNameVal.join(',')).attr('title', libNameVal.join(','));
        } else {
            $(this).removeClass('ui-checkboxradio-checked');
            for (var i = 0; i < $labelItem.length; i++) {
                $labelItem.eq(i).next().removeAttr('checked');
            }
            $('#facedbS').data({
                'selectData': ''
            });
            $('#facedbS').val('').attr('title', '');
        }
        checkboxFunc();
        radioFunc();
    })

    /**
     * 获取侧边栏请求的静态参数
     * @param {String} typeSearch 判断是地图还是区域
     */
    function getSearchStaticData(typeSearch) {
        var $selectImg = $('#searchImgS').find('.add-image-item'), // 所有上传图片节点
            $selectImgActive = $selectImg.filter('.active'), // 当前被选中图片节点
            selectImgSrc = '', // 当前被选中图片Base64

            // 年龄
            $startAge = $('#ageStartS'),
            $endAge = $('#ageEndS'),
            age = '',

            // 性别
            $radio = $('#sexS').find('[for^="radio"]').filter('.ui-state-active'),
            sex = '',

            // 算法厂家
            $calc = $('#algorithmContent'),
            calcArr = [], // 厂家id数组
            calcPArr = [], // 厂家id和名字数组

            // 结果数
            $limit = $('#topS').find('[for^="radio"]').filter('.ui-state-active'),
            limit = '',

            // 还未确定或者目前写死的数据
            // 静态写死数据
            accessplat = 'facePlatform',
            accessToken = 'string';
        // 将当前被选中图片索引 绑定到上传图片框
        for (var i = 0; i < $selectImg.length; i++) {
            if ($selectImg[i].className.indexOf('active') > -1) {
                $('#searchImgS').data('searchImgIndex', i);
            }
        }
        // 当前被选中图片赋值
        if ($selectImgActive.length > 0) {
            selectImgSrc = $selectImgActive.find('.add-image-img').attr('src');
        }

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
        var $libids = $('#facedbS').data('selectData') ? $('#facedbS').data('selectData') : [],
            libids = [];
        if ($libids.length > 0) {
            $libids.forEach(function (item) {
                libids.push(item.libId);
            })
        }
        // 算法厂家
        if ($calc.length > 0) {
            var $calcLabel = $calc.find('label').filter('.ui-checkboxradio-checked');
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

        return {
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

    /** 
     * 纯静态检索 右侧内容请求
     * @param {Object} $data 左侧查询条件 静态查询条件
     * @param {Object} container 需要刷新的节点容器 静态库容器
     * @param {Boolean} isMerge 是否为动静结合页面
     */
    function refreshContainerS($data, container, isMerge) {
        var uploadImageVal = $data.base64, // 上传图片的src
            cjs = $data.platformId; // 已选算法厂家id
        showLoading(container.find('.card-content')); // 加载过度动画
        container.data('base64', uploadImageVal); // 把发起请求的图片src值 挂载到节点容器上
        // 如果没有上传图片 或者没有选择算法厂家 清除加载动画并加载空页面
        if ($('#searchImgS').find('.add-image-item').length === 0 || cjs.length === 0 || $data.libids.length === 0) {
            hideLoading(container.find('.card-content'));
            loadEmpty(container.find('.card-content'));
            warningTip.say('请选择人脸库或算法厂家！');
            return false;
        }

        //搜索图片的时候加入缓存
        if ($('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr("cache") == undefined) {
            //判断是否缓存是否超过10个，不超过10个依次存入,超过10个顶掉最前面的那个
            var item = '';
            if (cacheArr.length >= cacheSortArr.length) {
                item = cacheArr.shift();
                $("#staticContentContainerS").find(`#factoryAlg${item}`).remove();
                $('#searchImgS').find('.add-image-img.cache' + item).removeClass("cache" + item).removeAttr("cache");
            } else if (cacheArr.length == 0) {
                item = 0;
            } else {
                for (let i = 0; i < cacheSortArr.length; i++) {
                    if (cacheArr.indexOf(cacheSortArr[i]) < 0) {
                        item = cacheSortArr[i];
                        break;
                    }
                }
            }
            cacheArr.push(item);
            $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').addClass("cache" + item).attr("cache", item);
        } else {
            var item = $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr("cache");
            $("#staticContentContainerS").find(`#factoryAlg${item}`).remove();
        }
        $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').data($data);
        //最后一个检索结果的标志
        for (let i = 0; i < $('#searchImgS').find('.add-image-item').length; i++) {
            $('#searchImgS').find('.add-image-item').eq(i).find('.add-image-img').data({
                isAll: 0
            })
        }
        $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').data({
            isAll: 1
        })
        var _picId = $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId');
        var picStatus = $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr('picStatus');
        $('#searchImgS').data({
            staticId: _picId,
            src: uploadImageVal
        })
        if ($data.libids.length > 0) {
            if (_picId && picStatus !== '2') {
                refreshSearchStaticDataS($data, container, isMerge, _picId, item);
            } else {
                var imgValue = $('#searchImgS').find('.add-image-item').filter('.active').attr('value');
                if (uploadImageVal.indexOf("http") == 0) { //url
                    var picIdPortData = {
                        url: uploadImageVal,
                        staticId: $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'),
                        moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
                    };
                } else { //base64
                    var picIdPortData = {
                        base64: uploadImageVal,
                        staticId: $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'),
                        moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
                    };
                }
                var picIdPort = 'v2/faceRecog/uploadImage',
                    picIdSuccessFunc = function (data) {
                        if (data.code == '200') {
                            $('#searchImgS').find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                if ($(ele).attr('value') == imgValue) {
                                    // 给当前选中的图片绑定id
                                    $(ele).find('.add-image-img').attr('picId', data.staticId);
                                    $(ele).find('.add-image-img').attr('picStatus', '1');
                                }
                            })
                            refreshSearchStaticDataS($data, container, isMerge, data.staticId, item);
                        } else {
                            hideLoading(container.find('.card-content'));
                            warningTip.say(data.message);
                            $('#searchImgS').find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                if ($(ele).attr('value') == imgValue) {
                                    $(ele).find('.add-image-img').attr('picStatus', '0');
                                }
                            })
                        }
                    };
                loadData(picIdPort, false, picIdPortData, picIdSuccessFunc);
            }
        }
    }

    /**
     * 静态检索 给融合算法图片绑定数据
     * @param {Object} container 需要刷新的节点容器 静态库容器
     * @param {Array} ronghe 融合数组
     */
    function bindStaticRongheDataS(container, ronghe, item) {
        container.find(`#fuseAlg${item}`).find('.image-new-wrap').each(function (index, el) {
            $(this).data('listData', ronghe[index]);
        });
    }

    /** 静态检索 各种类型 右侧内容刷新
     * @param {Object} $data 左侧查询条件 静态查询条件
     * @param {Object} container 需要刷新的节点容器 静态库容器
     * @param {String} _picId 目标查询图片id
     * @param {number} item 与上传图片区域对应的缓存编号
     * @param {number} count 请求次数
     */
    function refreshSearchStaticDataS($data, container, isMerge, _picId, item, count) {
        var ageVal = $data.agegroup, // 年龄
            sexVal = $data.sex, // 性别
            faceVal = String($data.libids), //人脸库查询值
            countVal = $data.limit, // 结果数
            cjs = $data.platformId, // 已选算法厂家id数组			
            cjsSuccess = [], //把已选算法厂家进行深拷贝，每个厂家循环请求时如果有厂家异常把当前厂家从厂家id数组中删除，cjsSuccess的个数和返回的成功个数比对
            cjsObj = $data.platformObj, // 已选算法厂家id和name数组
            mergeNumArr = [], // 前端计算算法 把返回的数据存在数组中
            ronghe = [], // 融合算法 融合数组
            isRongheCompared = false, // 融合算法 是否已命中标志
            alreadyInRongheFlag = false, // 融合算法 是否已在融合数组中标志
            isLoad = false, //是否超时
            allCountS = 0; // 静态库 搜索总数

        hideLoading(container.find('.card-content')); // 数据加载成功取消loading加载动画

        // 当算法厂家数 > 0 先加载页面框架
        if (cjs.length > 0) {
            loadAlgFrame(cjs, container, item);
        }

        for (var i = 0; i < cjs.length; i++) {
            showLoading(container.find('#factoryAlg-' + item + "-" + cjs[i]));
        }

        // 清空之前的厂家数据加载状态 比中使用
        $('#algorithmContent').data("cjData" + item, '');

        // 根据选择厂家数循环请求数据 赋值节点数据
        for (var i = 0; i < cjs.length; i++) {
            (function (i) {
                var port1 = 'v2/faceRecog/face1VN';
                var data1 = {
                    staticId: _picId,
                    ageGroup: ageVal,
                    sex: sexVal,
                    libIds: faceVal,
                    platformId: cjs[i],
                    platformIds: cjs,
                    idcard: $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr('idcard'),
                    incidentId: $("#commentSelectStatic").hasClass("hide") ? '' : $("#commentSelectStatic").find(".selectpicker").val(),
                    top: countVal
                },
                    successFunc1 = function (data) {
                        hideLoading(container.find('#factoryAlg-' + item + "-" + cjs[i]));
                        $('#staticSearch').removeAttr('disabled'); //防止检索暴力点击
                        cjsSuccess.push(data);
                        if (cjsSuccess.length == 1 && !$("#commentSelectStatic").hasClass("hide") && $("#commentSelectStatic").find(".selectpicker").val() != "") {
                            getPowerUse(1, $("#commentSelectStatic").find(".selectpicker").val(), _picId);
                        }
                        if (cjsSuccess.length === cjs.length) {
                            isLoadAll = true;
                        } else {
                            isLoadAll = false;
                        }
                        if (data.code === '200') {
                            var result = data.data || false;
                            // 当只选一家厂家 不进行融合
                            if (cjs.length === 1) { // 纯静态 或动静结合检索
                                // 添加厂家ID，比中使用数据
                                result.forEach(function (el, index) {
                                    el.platformId = $data.platformObj[0].cjid;
                                    el.platformName = $data.platformObj[0].cjname;
                                })
                                if (result && result.length === 0) {
                                    hideLoading(container.find('.card-content'));
                                    loadEmpty(container.find('.card-content'));
                                } else {
                                    var _html = '';
                                    _html = createStaticImgItem(result, _html); // 构造当前厂家图片节点
                                    container.find("#factoryAlg" + item + " [cjid=" + cjs[i] + "] .control-total").text(result.length); // 当前算法厂家 加载搜索结果总数
                                    container.find("#factoryAlg-" + item + '-' + cjs[i]).find('.image-new-list').html(_html); // 加载厂家搜索的图片内容
                                    bindDataToImgItem(container, "#factoryAlg-" + item + '-' + cjs[i], result); // 将列表绑上数据
                                    allCountS += result.length; // 静态库 累加搜索结果数
                                }
                                var $fuseAlgResult = container.find(`#fuseAlg${item} .image-new-list`);
                                loadEmpty($fuseAlgResult, '暂无数据', '', true); // 厂家返回空数据 加载空页面
                            } else { // 当选择厂家数 >1
                                if (result && result.length > 0) { // 静态检索 有返回值
                                    var _html = '';
                                    _html = createStaticImgItem(result, _html); // 构造当前厂家图片节点
                                    container.find("#factoryAlg" + item + " [cjid=" + cjs[i] + "] .control-total").text(result.length); // 当前算法厂家 加载搜索结果总数
                                    container.find("#factoryAlg-" + item + '-' + cjs[i]).find('.image-new-list').html(_html); // 加载厂家搜索的图片内容
                                    bindDataToImgItem(container, "#factoryAlg-" + item + '-' + cjs[i], result); // 将列表绑上数据
                                    allCountS += result.length; // 静态库 累加搜索结果数
                                } else {
                                    var $factoryAlgResult = container.find("#factoryAlg-" + item + '-' + cjs[i]).find('.image-new-list');
                                    loadEmpty($factoryAlgResult, '暂无数据', '', true); // 厂家返回空数据 加载空页面
                                }

                                //为防止后台返回数据中有重复的picid的值，将result进行深拷贝然后去重
                                var resultOnly = JSON.parse(JSON.stringify(result));
                                for (var resulti = 0; resulti < resultOnly.length; resulti++) {
                                    for (var resulty = resulti + 1; resulty < resultOnly.length; resulty++) {
                                        if (resultOnly[resulti].picId == resultOnly[resulty].picId) {
                                            resultOnly.splice(resulty, 1);
                                        }
                                    }
                                }
                                // 融合算法开始 根据各厂家返回值 构造融合数据
                                mergeNumArr.push(result); // 各厂家全部返回值
                                // 获取所有命中多次的融合数组
                                for (var resultIndex = 0; resultIndex < resultOnly.length; resultIndex++) { // 循环当前厂家返回值
                                    //for(var resultIndex = 0; resultIndex < result.length; resultIndex++){  // 循环当前厂家返回值
                                    isRongheCompared = false; // 默认当前值没有命中
                                    alreadyInRongheFlag = false; // 默认当前值不在融合数组中
                                    resultOnly[resultIndex].CJCounts = 1; // 当前厂家返回数据 命中次数为1
                                    //result[resultIndex].CJCounts = 1;  // 当前厂家返回数据 命中次数为1
                                    cjsObj.forEach(function (val) { // 获取当前厂家名称
                                        if (val.cjid === cjs[i]) {
                                            resultOnly[resultIndex].platformName = val.cjname; // 给当前返回数据 赋值平台名称
                                            resultOnly[resultIndex].platformId = val.cjid;
                                            result[resultIndex].platformName = val.cjname; // 给原数据添加厂家name和id
                                            result[resultIndex].platformId = val.cjid;
                                        }
                                    });

                                    var rhObj1 = {};
                                    rhObj1.platformName = resultOnly[resultIndex].platformName; //赋值厂家名称
                                    rhObj1.platformId = resultOnly[resultIndex].platformId; //赋值厂家名称
                                    rhObj1.similarity = resultOnly[resultIndex].similarity; //赋值相似度 动静融合页面使用
                                    rhObj1.index = resultIndex + 1;
                                    resultOnly[resultIndex].rhInfo = [rhObj1];

                                    if (mergeNumArr.length > 1) { // 如果厂家数 > 1
                                        for (var beforeCjIndex = 0; beforeCjIndex < mergeNumArr.length - 1; beforeCjIndex++) { // 循环当前厂家之前的所有厂家
                                            for (var comparedIndex = 0; comparedIndex < mergeNumArr[beforeCjIndex].length; comparedIndex++) { // 被循环厂家中的值
                                                if (resultOnly[resultIndex].picId === mergeNumArr[beforeCjIndex][comparedIndex].picId) { // 如果命中 picId相同为同一个人
                                                    //if(result[resultIndex].picId === mergeNumArr[beforeCjIndex][comparedIndex].picId){ // 如果命中 picId相同为同一个人
                                                    isRongheCompared = true;
                                                    for (var rongheIndex = 0; rongheIndex < ronghe.length; rongheIndex++) { // 循环融合数组 判断数组中是否已存在比中值
                                                        if (resultOnly[resultIndex].picId === ronghe[rongheIndex].picId) {
                                                            //if(result[resultIndex].picId === ronghe[rongheIndex].picId){
                                                            alreadyInRongheFlag = true; // 融合数组中已存在比中值
                                                            break;
                                                        }
                                                    }
                                                }
                                                if (isRongheCompared) {
                                                    break;
                                                }
                                            }
                                            if (isRongheCompared) {
                                                break;
                                            }
                                        }
                                        // 融合数组赋值
                                        if (alreadyInRongheFlag) { // 如果融合数组中 已存在picId相同的图片
                                            ronghe[rongheIndex].CJCounts++;
                                            var rhObj = {};
                                            rhObj.platformName = resultOnly[resultIndex].platformName; //赋值厂家名称
                                            rhObj.platformId = resultOnly[resultIndex].platformId; //赋值厂家名称
                                            rhObj.similarity = resultOnly[resultIndex].similarity; //赋值相似度 动静融合页面使用
                                            rhObj.index = resultIndex + 1;
                                            ronghe[rongheIndex].rhInfo.push(rhObj); // 融合数据 命中的所有图片的信息
                                            ronghe[rongheIndex].rhInfo.sort(sortRongheCJ('platformId', cjs));
                                        } else {
                                            if (isRongheCompared) {
                                                ronghe.push(resultOnly[resultIndex]);
                                                //ronghe.push(result[resultIndex]);
                                                ronghe[ronghe.length - 1].CJCounts++;
                                                var rhObj = {};
                                                rhObj.platformName = mergeNumArr[beforeCjIndex][comparedIndex].platformName; //赋值厂家名称
                                                rhObj.platformId = mergeNumArr[beforeCjIndex][comparedIndex].platformId; //赋值厂家名称
                                                rhObj.similarity = mergeNumArr[beforeCjIndex][comparedIndex].similarity; //赋值相似度 动静融合页面使用
                                                rhObj.index = comparedIndex + 1;
                                                ronghe[ronghe.length - 1].rhInfo.push(rhObj); // 融合数据 命中的所有图片的信息
                                                ronghe[ronghe.length - 1].rhInfo.sort(sortRongheCJ('platformId', cjs));
                                            }
                                        }
                                        ronghe.sort(sortRonghe('CJCounts')); // 融合数组 按照命中家数 从大到小排序
                                    }
                                }
                                // 构造融合算法页面元素
                                var rh_html = '';
                                if (ronghe.length === 0) {
                                    rh_html = createEmptyImgItem(rh_html); // 融合数为0时 构造空融合算法
                                    container.find("#factoryAlg" + item + " .fuseAlgNum").text('0'); // 融合搜索结果数
                                    var $fuseAlgResult = container.find(`#fuseAlg${item} .image-new-list`);
                                    loadEmpty($fuseAlgResult, '暂无数据', '', true); // 厂家返回空数据 加载空页面
                                } else {
                                    rh_html = createStaticImgItem(ronghe, rh_html, true); // 融合数小于等于8时 构造融合算法图片
                                    container.find("#factoryAlg" + item + " .fuseAlgNum").text(ronghe.length); // 融合搜索结果数
                                    container.find(`#fuseAlg${item} .image-new-list`).html(rh_html); // 融合搜索的图片内容
                                    $('#fuseAlg' + item).data('listData', ronghe);
                                    bindDataToImgItem(container, `#fuseAlg${item} .image-new-list`, ronghe); // 将融合图片 绑上身份证数据 用以后面二次检索使用
                                    bindStaticRongheDataS(container, ronghe, item); // 融合结果数据挂载
                                }
                            }
                            container.find("#factoryAlg" + item).attr("allCountS", allCountS);
                            container.find('#allCountS').text("(" + allCountS + ")"); // 加载人脸库搜索总结果数

                            // 判断是否显示档案信息
                            if (cjsSuccess.length == cjs.length) { // 数据全部加载完成后
                                for (var k = 0; k < cjs.length; k++) {
                                    $("#factoryAlg-" + item + '-' + cjs[k]).find(".image-new-wrap").each((index, ele) => {
                                        var $this = $(ele),
                                            listData = $this.data('listData'),
                                            libNames = '';
                                        listData.libInfos.map(function (el, index) {
                                            if (index === 0) {
                                                libNames = el.libName;
                                            } else {
                                                libNames = libNames + ',' + el.libName;
                                            }
                                        });
                                        if (libNames.indexOf('涉港一人一档库') > -1) {
                                            var portBasics = 'v2/memberFiles/basics';
                                            var portDataBasics = {
                                                name: listData.name,
                                                idcard: listData.idcard,
                                                page: 1,
                                                size: 1,
                                                randomNub: Math.random() // 非后端需要数据，防止请求被终止
                                            },
                                                successFuncBasics = function (data) {
                                                    if (data.code === '200' && data.data.list.length > 0) {
                                                        var list = data.data.list,
                                                            rxId = list[0].rxId,
                                                            rxUrl = list[0].url;
                                                        $this.data({
                                                            rxId: rxId,
                                                            rxUrl: rxUrl
                                                        })
                                                        $this.find('.basicsBut').removeClass('hide');
                                                    }
                                                }
                                            loadData(portBasics, true, portDataBasics, successFuncBasics);
                                        }
                                    })
                                }
                                $(`#fuseAlg${item}`).find(".image-new-wrap").each(function (index, ele) {
                                    var $this = $(ele),
                                        listData = $this.data('listData'),
                                        libNames = '';
                                    listData.libInfos.map(function (el, index) {
                                        if (index === 0) {
                                            libNames = el.libName;
                                        } else {
                                            libNames = libNames + ',' + el.libName;
                                        }
                                    });
                                    if (libNames.indexOf('涉港一人一档库') > -1) {
                                        var portBasics = 'v2/memberFiles/basics';
                                        var portDataBasics = {
                                            name: listData.name,
                                            idcard: listData.idcard,
                                            page: 1,
                                            size: 1
                                        },
                                            successFuncBasics = function (data) {
                                                if (data.code === '200' && data.data.list.length > 0) {
                                                    var list = data.data.list,
                                                        rxId = list[0].rxId,
                                                        rxUrl = list[0].url;
                                                    $this.data({
                                                        rxId: rxId,
                                                        rxUrl: rxUrl
                                                    })
                                                    $this.find('.basicsBut').removeClass('hide');
                                                }
                                            }
                                        loadData(portBasics, false, portDataBasics, successFuncBasics);
                                    }
                                })
                            }

                            if (result.length === 0) { // 无返回结果比中返回-3
                                if ($('#algorithmContent').data("cjData" + item)) {
                                    var cjData = $('#algorithmContent').data("cjData" + item);
                                } else {
                                    var cjData = $('#algorithmContent').data("cjData");
                                }
                                cjData.forEach((val, index) => {
                                    if (val.platformId == cjs[i]) {
                                        val.dataState = 'nodata'; // 数据返回状态为nodata时 比中标注为-3
                                    }
                                });
                                // 有算法产家获取异常 赋新值 由于有缓存 不同照片存储区分开  比中使用
                                $('#algorithmContent').data("cjData" + item, cjData)
                            }
                        } else {
                            if (data.code === '616') {
                                isLoad = true;
                                var sxCount = count ? count : 1;
                                if (cjsSuccess.length === cjs.length && isLoad && sxCount < 4) {
                                    // 给图片绑定静态id
                                    var picBase64 = $('#searchImgS').data('src'),
                                        staticId = $('#searchImgS').data('staticId');
                                    if (picBase64.indexOf("http") == 0) { //url
                                        var picIdPortData = {
                                            url: picBase64,
                                            staticId: staticId,
                                            moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
                                        };
                                    } else { //base64
                                        var picIdPortData = {
                                            base64: picBase64,
                                            staticId: staticId,
                                            moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
                                        };
                                    }
                                    var picIdPort = 'v2/faceRecog/uploadImage',
                                        picIdSuccessFunc = function (data) {
                                            if (data.code == '200') {
                                                $('#searchImgS').find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                                    if ($(ele).find('.add-image-img').attr('picId') == staticId) {
                                                        // 给当前选中的图片绑定id
                                                        $(ele).find('.add-image-img').attr('picId', data.staticId);
                                                        $(ele).find('.add-image-img').attr('picStatus', '1');
                                                    }
                                                })
                                                $('#searchImgS').data('staticId', data.staticId);
                                                sxCount += sxCount;
                                                refreshSearchStaticDataS($data, container, isMerge, data.staticId, item, sxCount);
                                            } else {
                                                warningTip.say(data.message);
                                                $('#searchImgS').find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                                    if ($(ele).find('.add-image-img').attr('picId') == staticId) {
                                                        $(ele).find('.add-image-img').attr('picStatus', '0');
                                                    }
                                                })
                                            }
                                        };
                                    loadData(picIdPort, false, picIdPortData, picIdSuccessFunc);
                                }
                                if (sxCount > 3) {
                                    warningTip.say('图片已失效，请重新上传图片');
                                }
                            } else if (data.code === '500') {
                                loadEmpty(container.find('#factoryAlg-' + item + '-' + cjs[i] + ' .image-new-list'), '算法获取异常', "", true);
                                if ($('#algorithmContent').data("cjData" + item)) {
                                    var cjData = $('#algorithmContent').data("cjData" + item);
                                } else {
                                    var cjData = $('#algorithmContent').data("cjData");
                                }
                                cjData.forEach((val, index) => {
                                    if (val.platformId == cjs[i]) {
                                        val.dataState = 'error';
                                    }
                                });
                                // 有算法产家获取异常 赋新值 由于有缓存 不同照片存储区分开  比中使用
                                $('#algorithmContent').data("cjData" + item, cjData)
                            } else if (data.code === '613') {
                                loadEmpty(container.find('#factoryAlg-' + item + '-' + cjs[i] + ' .image-new-list'), '算法厂家升级中', "", true);
                                if ($('#algorithmContent').data("cjData" + item)) {
                                    var cjData = $('#algorithmContent').data("cjData" + item);
                                } else {
                                    var cjData = $('#algorithmContent').data("cjData");
                                }
                                cjData.forEach((val, index) => {
                                    if (val.platformId == cjs[i]) {
                                        val.dataState = '613';
                                    }
                                });
                                // 有算法产家获取异常 赋新值 由于有缓存 不同照片存储区分开  比中使用
                                $('#algorithmContent').data("cjData" + item, cjData)
                            } else {
                                loadEmpty(container.find('#factoryAlg-' + item + '-' + cjs[i] + ' .image-new-list'));
                                warningTip.say(data.message);
                            }
                        }
                    };
                loadData(port1, true, data1, successFunc1, '', 'POST', sourceType == 'ga' ? serviceUrlOther : '');
            })(i);
        }

        $("#staticContentContainerS").find(".card-bottom").removeClass("hide");
    }

    // 档案基本信息图标
    $('#staticContentContainerS').on('click', '.aui-icon-idcard2', function () {
        $('#basicsNewEditModal').modal('show');
        setTimeout(() => {
            $('#basicsNewEditModal .modal-body').scrollTop(0);
        }, 300);
        var $this = $(this);
        var rxId = $this.closest('.image-new-wrap').data('rxId'),
            rxUrl = $this.closest('.image-new-wrap').data('rxUrl');
        if (rxId && rxUrl) {
            showDetailInfoS(rxUrl, rxId);
        }
    })

    /**
     * 静态检索 加载框架
     * @param {Array} cjs 已选中的算法厂家id数组
     * @param {Object} container 需要刷新的节点容器 静态库容器
     * @param {number} item 缓存对应编号
     */
    function loadAlgFrame(cjs, container, item) {
        var html = '';
        html += `<div id="factoryAlg${item}" class="factoryAlg">
					<div class="card-approve-title">
						<ul class="nav nav-tabs pd0" role="tablist">`;
        for (var i = 0; i <= cjs.length; i++) {
            if (i == cjs.length) {
                html += `<li class="nav-item">
                            <a class="nav-link" data-toggle="tab" href="#fuseAlg${item}" role="tab" aria-controls="fuseAlg${item}" aria-selected="false">
                                融合<span class="control-total fuseAlgNum">0</span>
							</a>
						</li>`;
            } else {
                html += `<li class="nav-item">
                <a class="nav-link ${i == 0 ? 'active' : ''}" cjid="${cjs[i]}" data-toggle="tab" href="#factoryAlg-${item}-${cjs[i]}" role="tab" aria-controls="factoryAlg-${item}-${cjs[i]}" aria-selected="${i == 0 ? 'true' : 'false'}">
								${$("[cjid=" + cjs[i] + "]").attr('cjname')}
								<span class="control-total">0</span>
							</a>
						</li>`;
            }
        }
        html += `</ul>
			</div>
			<div class="tab-content">`;

        for (var i = 0; i <= cjs.length; i++) {
            if (i == cjs.length) {
                html += `<div class="tab-pane" id="fuseAlg${item}" role="tabpanel" aria-labelledby="fuseAlg${item}-tab">
							<ul class="image-new-list">
							</ul>
						</div>`;
            } else {
                html += `<div class="tab-pane ${i == 0 ? 'active' : ''}" id="factoryAlg-${item}-${cjs[i]}" role="tabpanel" aria-labelledby="factoryAlg-${item}-${cjs[i]}-tab">
							<ul class="image-new-list">
							</ul>
						</div>`;
            }
        }
        html += `</div></div>`;
        container.find('.card-content .fuseAlg' + item + '.flex-column-wrap').addClass("hide");
        container.find('.card-content').append(html);
        container.find('.card-content').find(`#factoryAlg${item}`).data({
            currentStaticId: $('#searchImgS').data('currentStaticId'),
            currentStaticSrc: $('#searchImgS').data('currentStaticSrc')
        }).siblings().addClass("hide");
        //别的图片缓存的div清除除了选中厂家的其他项
        for (let i = 0; i < $("#staticContentContainerS").find(".factoryAlg.hide").length; i++) {
            $("#staticContentContainerS").find(".factoryAlg.hide").eq(i).find(".tab-pane").not(".active").find(".image-new-list").empty();
        }
    }

    // // 融合跟厂家一起展示，无效果
    // // 鼠标进入融合算法照片的时候 各家算法身份证相同的照片激活active效果
    // $(document).on('mouseenter', '#staticContentContainerS .image-new-wrap', function () {
    // 	var listData = $(this).data('listData'),
    // 		$picId = listData.picId, // 图片id
    // 		$rhInfo = listData.rhInfo, // 所有命中的图片厂家和相似度数组
    // 		$otherList = $('#staticContentContainerS').find('#factoryAlg .image-new-list'), // 所有厂家图片列表
    // 		$otherWrap = $('#staticContentContainerS').find('#factoryAlg .image-new-wrap'); // 所有厂家的图片
    // 	$otherWrap.removeClass('selected');
    // 	if ($rhInfo) { // 如果有融合数据
    // 		$otherList.each(function (i, el) {
    // 			var html = `<span class="text-light checked-index">当前命中第`,
    // 				sameArr = [];

    // 			$(el).find('.image-new-wrap').each(function (i, el) { // 循环列表里面的照片
    // 				var $otherPicId = $(el).data("listData").picId;
    // 				if ($picId === $otherPicId) { // 图片与融合匹配
    // 					$(el).addClass("selected"); // picId相同添加选中
    // 				} else {
    // 					$(el).addClass("light"); // picId不同背景变白
    // 				}
    // 			})

    // 			if (sameArr.length > 0) { // 收缩的厂家 标题上显示命中第几个
    // 				sameArr.splice(sameArr.length - 1, 1, sameArr[sameArr.length - 1].split('、').join(""));
    // 				for (var i = 0; i < sameArr.length; i++) {
    // 					html += `${sameArr[i]}`;
    // 				}
    // 				html += `位</span>`;
    // 				$(el).closest('.image-new-list').siblings('.card-approve-title').find('.control-total').before(html);
    // 			}
    // 		})
    // 	}
    // }).on('mouseleave', '#staticContentContainerS .image-new-wrap', function () {
    // 	var listData = $(this).data('listData'),
    // 		$picId = listData.picId, // 图片id
    // 		$rhInfo = listData.rhInfo,
    // 		$otherPicId,
    // 		$otherWrap = $('#staticContentContainerS').find('#factoryAlg .image-new-wrap');
    // 	if ($rhInfo) { // 如果有融合数据
    // 		$otherWrap.each(function (i, el) { // 循环所有的厂家图片
    // 			$otherPicId = $(el).data("listData").picId;
    // 			if ($picId === $otherPicId) { // 如果命中
    // 				$(el).removeClass("selected"); // 去掉选中状态
    // 			} else {
    // 				$(el).removeClass("light"); // 去掉背景白色
    // 			}
    // 		})
    // 		$('#factoryAlg').find('.checked-index').remove();
    // 	}
    // })

    // 对比弹框双击 单击事件
    $('#staticContentContainerS').on('dblclick', '.image-new-wrap', function () {
        var $contrastModal = $('#staticContrastEditModal');
        var listData = $(this).data('listData');
        $('#staticContrastConfirm').data('listData', listData); //比中数据绑定
        $('#quicklyBKS').data('listData', listData); //快速布控数据绑定
        $('#quicklyJS').data('listData', listData); //快速检索数据绑定
        $('#quicklyJSW').data('listData', listData); //快速检索数据绑定
        $('#staticOnetooneSearch').data('listData', listData); //1比1数据绑定
        $('#staticContrastConfirm').data('$dom', $(this)); //比中节点绑定
        $('#staticOnetooneSearchW').data('listData', listData); //1比1数据绑定
        $contrastModal.modal('show');
        var imgSrc = $('#staticContentContainerS .factoryAlg').not(".hide").data('currentStaticSrc');

        var libNames = '';

        if ($(this).hasClass("1v1")) {
            $('#staticContrastConfirm').addClass("disabled").html("已比中");
        } else {
            $('#staticContrastConfirm').removeClass("disabled").html("比中");
        }

        listData.libInfos.map(function (el, index) {
            if (index === 0) {
                libNames = el.libName;
            } else {
                libNames = libNames + ',' + el.libName;
            }
        });

        var factoryVal = '';
        if (listData.rhInfo) {
            listData.rhInfo.map(function (el, index) {
                if (index === 0) {
                    factoryVal = el.index + '-' + el.platformName + ':' + el.similarity;
                } else {
                    factoryVal = factoryVal + ',' + el.index + '-' + el.platformName + ':' + el.similarity;
                }
            });
        } else {
            factoryVal = listData.platformName + ':' + listData.similarity;
        }

        var _html = `<div class="image-box-flex">
						<span class="image-tag hide">原图</span>
						<div class="img iviewer_cursor"></div>
					</div>
					<div class="image-box-flex">
						<span class="image-tag hide">人脸库</span>
						<div class="img iviewer_cursor"></div>
					</div>`

        $('#staticContrastEditModal .image-flex-list').empty().append(_html);

        $contrastModal.find('.image-box-flex .img').eq(0).iviewer({
            src: imgSrc
        });
        $contrastModal.find('.image-box-flex .img').eq(1).iviewer({
            src: listData.url
        });

        $contrastModal.find('.form-info .form-text').eq(0).html(listData.name);
        $contrastModal.find('.form-info .form-text').eq(1).html(listData.sex);
        $contrastModal.find('.form-info .form-text').eq(2).html(listData.age);
        $contrastModal.find('.form-info .form-text').eq(3).html(listData.idcard);
        $contrastModal.find('.form-info .form-text').eq(4).html(libNames);
        $contrastModal.find('.form-info .form-text').eq(5).html(factoryVal);

        $contrastModal.find('.form-info .form-text').eq(4).attr('title', libNames);
        $contrastModal.find('.form-info .form-text').eq(5).attr('title', factoryVal);

        var $imgBaseCS = $contrastModal.find('.imgBaseCS .image-card-list-wrap');
        loadEmpty($imgBaseCS, "暂无信息", true, true);
        showLoading($imgBaseCS);
        var port = 'v3/opPersonInfo/searchPersonInfo',
            portData = {
                libId: '0010',
                idcard: listData.idcard,
                page: 1,
                size: 30
            },
            successFunc = function (data) {
                hideLoading($imgBaseCS);
                if (data.code == '200' && data.data.list.length > 0) {
                    var list = data.data.list,
                        _html = '';
                    // 插入数据和节点
                    list.forEach(function (v, index) {
                        _html += `<li class="imgBase-card-wrap">
									<div class="image-card-box img-right-event" style="width: 100%;">
										<img class="image-card-img" src="${v.picUrl}">
									</div>
									<div class="imgBaseCS-new">
										<p class="imgBaseCS-new-text">${v.libName || '未知'}</p>
										<p class="imgBaseCS-new-text">${v.createtime || '未知'}</p>
									</div>
								</li>`;
                    });

                    // 插入节点，人脸库数据
                    $imgBaseCS.empty().append(_html);
                    // 数据绑定
                    $imgBaseCS.find(".imgBase-card-wrap").each(function (index, el) {
                        $(el).data('listData', list[index]);
                    });

                } else {
                    loadEmpty($imgBaseCS, "暂无信息", true, true);
                    warning.say(data.message);
                }
            };
        if (listData.idcard) {
            loadData(port, true, portData, successFunc);
        } else {
            hideLoading($imgBaseCS);
            loadEmpty($imgBaseCS, "无身份证信息！", true, true);
        }
    }).on('click', '.image-new-wrap', function () {
        $('#contrastBut').removeAttr('disabled');
        $('#staticContrastConfirmW').removeAttr('disabled', 'disabled');
        $('#staticOnetooneSearchW').removeAttr('disabled', 'disabled');
        $('#quicklyJSW').removeAttr('disabled', 'disabled');
        var listData = $(this).data('listData');
        $('#contrastImgBox img').attr('src', listData.url);
        $('#contrastImgBox').data('listData', listData);
        $('#staticContrastConfirmW').data('listData', listData);
        $('#staticOnetooneSearchW').data('listData', listData);
        $('#quicklyJSW').data('listData', listData);
        $(this).parents(".factoryAlg").data('listData', listData);
        $(this).addClass("image-new-wrap-active").siblings().removeClass("image-new-wrap-active");
        $(this).siblings().find(".btn").remove();
        if (!$(this).find(".btn").length) {
            let html = `<button type="button" class="btn btn-sm btn-primary">比中</button>`;
            $(this).append(html);
        }
    }).on('mouseover', '.image-new-wrap', function () {  //鼠标移入移出事件
        if (!$(this).find(".btn").length) {
            lethtml = '';
            if ($(this).hasClass("1v1")) {
                html = `<button type="button" class="btn btn-sm btn-primary disabled">已比中</button>`;
            } else {
                html = `<button type="button" class="btn btn-sm btn-primary">比中</button>`;
            }
            $(this).append(html);
        }
    }).on('mouseleave', '.image-new-wrap', function () {  //鼠标移入移出事件
        if (!$(this).hasClass("image-new-wrap-active")) {
            $(this).find(".btn").remove();
        }
    }).on('click', '.image-new-wrap .btn', function () {  //比对按钮点击事件
        if ($(this).hasClass("disabled")) {
            return;
        }
        var $this = $(this),
            currentStaticId = $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'),
            listData = $(this).parent().data('listData'),
            item = $('#searchImgS').find('.add-image-item.active').find('img').attr('cache'),
            cjData = $('#algorithmContent').data("cjData" + item) ? $('#algorithmContent').data("cjData" + item) : $('#algorithmContent').data("cjData"), // 各算法产家的数据状态
            data = [];
        cjData.map(cl => {
            var isExist = false
            var imgData = {};
            if (listData.rhInfo && listData.rhInfo.length > 0) {
                listData.rhInfo.map(el => {
                    if (cl.platformId == el.platformId) {
                        isExist = true
                        imgData.platformId = el.platformId;
                        imgData.similarity = el.similarity;
                        imgData.sequence = el.index;
                    }
                })
            }
            if (!isExist) {
                if (listData.platformId == cl.platformId) {
                    var picId = listData.picId;
                    var index = $('#factoryAlg-' + item + '-' + cl.platformId).find('[picId="' + picId + '"]').index();
                    imgData.platformId = listData.platformId;
                    imgData.similarity = listData.similarity;
                    imgData.sequence = index + 1;
                } else {
                    if (cl.dataState && cl.dataState == '613') {
                        imgData.platformId = cl.platformId;
                        imgData.similarity = '';
                        imgData.sequence = -1;
                    } else if (cl.dataState && cl.dataState == 'error') {
                        imgData.platformId = cl.platformId;
                        imgData.similarity = '';
                        imgData.sequence = -2;
                    } else if (cl.dataState && cl.dataState == 'nodata') {
                        imgData.platformId = cl.platformId;
                        imgData.similarity = '';
                        imgData.sequence = -3;
                    } else {
                        imgData.platformId = cl.platformId;
                        imgData.similarity = '';
                        imgData.sequence = 0;
                    }
                }
            }
            data.push(imgData);
        })
        var port = 'v2/faceRecog/comfirm',
            portData = {
                staticId: currentStaticId,
                idcard: listData.idcard,
                data: data
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    $this.parent().addClass("1v1");
                    $this.addClass("disabled").html("已比中");
                    warningTip.say('提交成功！');
                } else {
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, portData, successFunc, '', 'POST', sourceType == 'ga' ? serviceUrlOther : '');
    });

    // 比中确认事件
    $('#staticContrastConfirm,#staticContrastConfirmW').on('click', function () {
        if ($(this).hasClass("disabled")) {
            return;
        }
        var listData = $(this).data('listData'),
            $dom = $(this).data('$dom'),
            $this = $(this);
        var data = [];
        var item = $('#searchImgS').find('.add-image-item.active').find('img').attr('cache');
        var rongheData = $('#fuseAlg' + item).data('listData'); // 融合所有数据
        // cjData+item 数据存在说明有算法厂家获取数据异常 sequence赋值为-2
        var cjData = $('#algorithmContent').data("cjData" + item) ? $('#algorithmContent').data("cjData" + item) : $('#algorithmContent').data("cjData"); // 各算法产家的数据状态
        if (typeof (listData.rhInfo) == 'undefined' && rongheData) { //不是融合模块 查询对应的融合数据
            rongheData.map(el => {
                if (el.picId == listData.picId) {
                    listData.rhInfo = el.rhInfo
                }
            })
        }
        cjData.map(cl => {
            var isExist = false
            var imgData = {};
            if (listData.rhInfo && listData.rhInfo.length > 0) {
                listData.rhInfo.map(el => {
                    if (cl.platformId == el.platformId) {
                        isExist = true
                        imgData.platformId = el.platformId;
                        imgData.similarity = el.similarity;
                        imgData.sequence = el.index;
                    }
                })
            }
            if (!isExist) {
                if (listData.platformId == cl.platformId) {
                    var picId = listData.picId;
                    var index = $('#factoryAlg-' + item + '-' + cl.platformId).find('[picId="' + picId + '"]').index();
                    imgData.platformId = listData.platformId;
                    imgData.similarity = listData.similarity;
                    imgData.sequence = index + 1;
                } else {
                    if (cl.dataState && cl.dataState == '613') {
                        imgData.platformId = cl.platformId;
                        imgData.similarity = '';
                        imgData.sequence = -1;
                    } else if (cl.dataState && cl.dataState == 'error') {
                        imgData.platformId = cl.platformId;
                        imgData.similarity = '';
                        imgData.sequence = -2;
                    } else if (cl.dataState && cl.dataState == 'nodata') {
                        imgData.platformId = cl.platformId;
                        imgData.similarity = '';
                        imgData.sequence = -3;
                    } else {
                        imgData.platformId = cl.platformId;
                        imgData.similarity = '';
                        imgData.sequence = 0;
                    }
                }
            }
            data.push(imgData);
        })

        var currentStaticId = $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId');
        var port = 'v2/faceRecog/comfirm',
            portData = {
                staticId: currentStaticId,
                idcard: listData.idcard,
                data: data
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    $dom.addClass("1v1");
                    $dom.find(".btn").addClass("disabled").html("已比中");
                    $this.addClass("disabled").html("已比中");
                    warningTip.say('提交成功！');
                } else {
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, portData, successFunc, '', 'POST', sourceType == 'ga' ? serviceUrlOther : '');
    })

    // 快速布控
    $('#quicklyBKS').on('click', function () {
        $('#staticContrastEditModal').modal('hide');
        $('.modal-backdrop').remove(); // 清除遮罩
        var imgUrl = $(this).data('url');
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
            // 	"display-none")) {
            // 	$("#backToSearchControl").click();
            // }
            if ($("#backToControlOverview").length > 0 && !$("#controlDetailPage").hasClass(
                "display-none")) {
                $("#backToControlOverview").click();
            }
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
    })

    $('#quicklyJS,#quicklyJSW').on('click', function () {
        $('#staticContrastEditModal').modal('hide');
        $("#pageSidebarMenu").find(".aui-icon-carsearch2").parents(".sidebar-item").click();
        var $usearchImg = $('#usearchImg'),
            $mergeSearch = $("#mergeSearch"),
            imgUrl = $("#contrastImgBox").data("listData").url;
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
                    imgDom(imgUrl, $mergeSearch, $usearchImg);
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
                    imgDom(imgUrl, $mergeSearch, $usearchImg);
                }
            }, 100)
        }
    });

    //1比1比对
    $("#staticOnetooneSearch,#staticOnetooneSearchW").on("click", function () {
        var src1 = $('#staticContentContainerS .factoryAlg').not(".hide").data('currentStaticSrc'),
            src2 = $("#contrastImgBox").data('listData').url;

        commonOnetooneSearch(src1, src2);
    });

    // 对比弹框数据切换
    $('#staticContrastEditModal').on('click', '.imgBase-card-wrap', function () {
        var $contrastModal = $('#staticContrastEditModal');
        var listData = $(this).data('listData');
        $('#quicklyBKS').data('url', listData.picUrl); //快速布控数据绑定
        $(this).addClass('active').siblings().removeClass('active');

        var _html = `<span class="image-tag">人脸库</span>
						<div class="img iviewer_cursor"></div>`

        $('#staticContrastEditModal .image-flex-list .image-box-flex').eq(1).empty().append(_html);
        $contrastModal.find('.image-box-flex .img').eq(1).iviewer({
            src: listData.picUrl
        });
    })

    // 对比按钮事件
    $('#contrastBut').on('click', function () {
        var $contrastModal = $('#staticContrastEditModal');
        var listData = $('#contrastImgBox').data('listData');
        $contrastModal.modal('show');
        var imgSrc = $('#staticContentContainerS .factoryAlg').not(".hide").data('currentStaticSrc');

        var libNames = '';
        listData.libInfos.map(function (el, index) {
            if (index === 0) {
                libNames = el.libName;
            } else {
                libNames = libNames + ',' + el.libName;
            }
        });

        var factoryVal = '';
        if (listData.rhInfo) {
            listData.rhInfo.map(function (el, index) {
                if (index === 0) {
                    factoryVal = el.index + '-' + el.platformName + ':' + el.similarity;
                } else {
                    factoryVal = factoryVal + ',' + el.index + '-' + el.platformName + ':' + el.similarity;
                }
            });
        } else {
            factoryVal = listData.platformName + ':' + listData.similarity;
        }

        var _html = `<div class="image-box-flex">
						<span class="image-tag hide">原图</span>
						<div class="img iviewer_cursor"></div>
					</div>
					<div class="image-box-flex">
						<span class="image-tag hide">人脸库</span>
						<div class="img iviewer_cursor"></div>
					</div>`

        $('#staticContrastEditModal .image-flex-list').empty().append(_html);
        $contrastModal.find('.image-box-flex .img').eq(0).iviewer({
            src: imgSrc
        });
        $contrastModal.find('.image-box-flex .img').eq(1).iviewer({
            src: listData.url
        });

        $contrastModal.find('.primary').html(listData.similarity);

        $contrastModal.find('.form-info .form-text').eq(0).html(listData.name);
        $contrastModal.find('.form-info .form-text').eq(1).html(listData.sex);
        $contrastModal.find('.form-info .form-text').eq(2).html(listData.age);
        $contrastModal.find('.form-info .form-text').eq(3).html(listData.idcard);
        $contrastModal.find('.form-info .form-text').eq(4).html(libNames);
        $contrastModal.find('.form-info .form-text').eq(5).html(factoryVal);

        $contrastModal.find('.form-info .form-text').eq(4).attr('title', libNames);
        $contrastModal.find('.form-info .form-text').eq(5).attr('title', factoryVal);

        var $imgBaseCS = $contrastModal.find('.imgBaseCS .image-card-list-wrap');
        loadEmpty($imgBaseCS, "暂无信息", true, true);
        showLoading($imgBaseCS);
        var port = 'v3/opPersonInfo/searchPersonInfo',
            portData = {
                libId: '0010',
                idcard: listData.idcard,
                page: 1,
                size: 30
            },
            successFunc = function (data) {
                hideLoading($imgBaseCS);
                if (data.code == '200' && data.data.list.length > 0) {
                    var list = data.data.list,
                        _html = '';
                    // 插入数据和节点
                    list.forEach(function (v, index) {
                        _html += `<li class="imgBase-card-wrap">
									<div class="image-card-box img-right-event" style="width: 100%;">
										<img class="image-card-img" src="${v.picUrl}">
									</div>
									<div class="imgBaseCS-new">
										<p class="imgBaseCS-new-text">${v.libName || '未知'}</p>
										<p class="imgBaseCS-new-text">${v.createtime || '未知'}</p>
									</div>
								</li>`;
                    });

                    // 插入节点，人脸库数据
                    $imgBaseCS.empty().append(_html);
                    // 数据绑定
                    $imgBaseCS.find(".imgBase-card-wrap").each(function (index, el) {
                        $(el).data('listData', list[index]);
                    });

                } else {
                    loadEmpty($imgBaseCS, "暂无信息", true, true);
                    warning.say(data.message);
                }
            };
        if (listData.idcard) {
            loadData(port, true, portData, successFunc);
        } else {
            hideLoading($imgBaseCS);
            loadEmpty($imgBaseCS, "无身份证信息！", true, true);
        }
    })

    showMiddleImg($('#searchImgS'), $('#getStaticSearchBox'), '.add-image-item .add-image-img'); //hover 显示中图

    /**
     * 档案标签的下拉选择
     */
    function loadLabels() {
        showLoading($("#portraitTwo_labels").closest('.camera-drop-select'));
        var port = 'v2/memberFiles/memberLabels',
            data = {},
            successFunc = function (data) {
                hideLoading($("#portraitTwo_labels").closest('.camera-drop-select'));
                if (data.code == '200') {
                    var result = data.data;
                    labelsData = data.data;
                    //对数组进行排序没有父元素的在最上层
                    if (result && result.length) {
                        var itemHtml = '';
                        for (var i = 0; i < result.length; i++) {
                            itemHtml += `<option class="option-item" orgid="${result[i].labelId}" value="${result[i].labelId}">${result[i].labelName}</option>`;
                        }

                        $("#portraitTwo_labels").empty().append(itemHtml);
                        $("#portraitTwo_labels").selectpicker({
                            allowClear: false
                        });
                        $("#portraitTwo_labels").selectpicker('refresh');
                    } else {
                        $("#portraitTwo_labels").prop('disabled', true);
                        $("#portraitTwo_labels").val(null);
                        $("#portraitTwo_labels").selectpicker('refresh');
                    }
                }
            };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };
    loadLabels()

    /**详情信息展示
     * @param {*} $url 证件照地址
     * @param {*} $id 人员ID
     */
    function showDetailInfoS($url, $id) {
        var port = 'v2/memberFiles/memberDetails',
            portData = {
                "rxId": $id
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    var data = data.data;
                    if (data) {
                        $("#breakLowNewS").html("");
                        //人员信息
                        //证件照图片
                        $("#basicsUrlValS").attr("src", $url ? $url : './assets/images/control/person.png');
                        // 姓名
                        $('#detailNameValS').text(data.name ? data.name : '暂无');
                        // 英文名
                        $('#detailEngNameValS').text(data.engName ? data.engName : "暂无");
                        //通行证号码
                        $('#detailPassNoValS').text(data.passNo ? data.passNo : "暂无");
                        // 性别
                        $('#detailGenderValS').text(data.gender ? (data.gender == 1 ? "男" : "女") : "暂无");
                        // 电话号码
                        $('#detailTelNoValS').text(data.telNo ? data.telNo : "暂无");
                        // 身份证
                        $('#detailIdcardValS').text(data.idcard ? data.idcard : "暂无");
                        // 出生年月
                        $('#detailBirthdayValS').text(data.birthday ? data.birthday : "暂无");
                        // 户籍所在地
                        $('#detailRegaddressValS').text(data.regaddress ? data.regaddress : "暂无");
                        // 违法时间
                        $('#detailIllegallyTimeValS').text(data.illegallyTime ? data.illegallyTime : "暂无");
                        // 毕业院校
                        $('#detailSchoolValS').text(data.school ? data.school : "暂无");
                        // 是否抓获
                        if (data.arrested == 1) { //是
                            $('#detailIsArrestValS').text("是" + (data.abscondArea ? '(' + data.abscondArea + ')' : ''));
                        } else if (data.arrested == 2) { //否
                            $('#detailIsArrestValS').text("否");
                        } else { //潜逃
                            $('#detailIsArrestValS').text("潜逃" + (data.abscondArea ? '(' + data.abscondArea + ')' : ''));
                        }
                        // 上传人
                        $('#detailUserNameValS').text(data.source == '1' ? (data.userName ? data.userName : "暂无") : (data.realname ? data.realname : "暂无"));
                        // 上传机构
                        $('#detailOrgNameValS').text(data.source == '1' ? (data.orgName ? data.orgName : "暂无") : (data.deptname ? data.deptname : "暂无"));
                        // 上传时间
                        $('#detailCreateTimeValS').text(data.createTime ? data.createTime : "暂无");
                        //背景资料
                        $("#detailBackgroundInfoValS").text(data.backgroundInfo ? data.backgroundInfo : "暂无");
                        // 违法地点
                        $('#detailIllegallyAddValS').text(data.illegallyAdd ? data.illegallyAdd : "暂无");
                        //违法行为
                        $("#detailOnSiteDelictValS").text(data.onSiteDelict ? data.onSiteDelict : "暂无");
                        //涉嫌全国性罪名
                        $("#detailStateChargeValS").text(data.stateCharge ? data.stateCharge : "暂无");
                        //涉嫌香港罪名
                        $("#detailHhkChargeValS").text(data.hhkCharge ? data.hhkCharge : "暂无");
                        //说明
                        $("#detailCommentsValS").text(data.comments ? data.comments : "暂无");
                        // 标签
                        if (data.label) {
                            if (data.labels.length > 0) {
                                $('#detailTagValS').html("");
                                data.labels.forEach(item => {
                                    var htmlLabel = `<span class="detailLabelItem">${getLabelsTypeS(item)}</span>`;
                                    $('#detailTagValS').append(htmlLabel);
                                });
                            } else {
                                $('#detailTagValS').html("暂无");
                            }
                        } else {
                            $('#detailTagValS').html("暂无");
                        }

                        //出入境截图
                        if (data.exitEntryList.length > 0) {
                            $("#detailExitEntry").html(`<a class="photo-link" href="${data.exitEntryList[0].url}" target="_blank" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
                                                            <img src="${data.exitEntryList[0].url}" onerror="this.error=null;this.src='./assets/images/control/person.png'" alt="出入境截图">
                                                        </a>`);
                        } else {
                            $("#detailExitEntry").html("暂无");
                        }

                        //违法信息
                        data.list.forEach((element, index) => {
                            var htmlActCompareShotList = '',
                                htmlComparisonShotList = '',
                                htmlActScreenshotList = '',
                                htmlSourceVideoList = '',
                                htmlActMapList = '';
                            if (element.actCompareShotList.length > 0) { //现场比对照截图个数
                                element.actCompareShotList.forEach((item) => {
                                    htmlActCompareShotList += `<a class="photo-link" href="${item.url}" target="_blank" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
                                                                    <img src="${item.url}" onerror="this.error=null;this.src='./assets/images/control/person.png'" alt="现场比对照截图">
                                                                </a>`
                                });
                            } else {
                                htmlActCompareShotList = '暂无';
                            }

                            if (element.comparisonShotList.length > 0) { //对比照截图
                                element.comparisonShotList.forEach((item) => {
                                    htmlComparisonShotList += `<a class="photo-link" href="${item.url}" target="_blank" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
                                                                    <img src="${item.url}" onerror="this.error=null;this.src='./assets/images/control/person.png'" alt="现场比对照截图">
                                                                </a>`
                                });
                            } else {
                                htmlComparisonShotList = '暂无';
                            }

                            if (element.actScreenshotList.length > 0) { //现场照截图
                                element.actScreenshotList.forEach((item) => {
                                    htmlActScreenshotList += `<a class="photo-link" href="${item.url}" target="_blank" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
                                                                    <img src="${item.url}" onerror="this.error=null;this.src='./assets/images/control/person.png'" alt="现场比对照截图">
                                                                </a>`
                                });
                            } else {
                                htmlActScreenshotList = '暂无';
                            }

                            if (element.sourceVideoList.length > 0) { //相关视频
                                element.sourceVideoList.forEach((item) => {
                                    htmlSourceVideoList += `<span class="video-link" videoUrl="${item.url}" target="_blank" filename="${item.fileName}" zmurl="${item.zmUrl}">
                                                                <img src="./assets/images/icons/video.bmp" />
                                                            </span>`
                                });
                            } else {
                                htmlSourceVideoList = '暂无';
                            }

                            if (element.actMapList.length > 0) { //现场地图
                                element.actMapList.forEach((item) => {
                                    htmlActMapList += `<a class="photo-link" href="${item.url}" target="_blank" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
                                                            <img src="${item.url}" onerror="this.error=null;this.src='./assets/images/control/person.png'" alt="现场比对照截图">
                                                        </a>`
                                });
                            } else {
                                htmlActMapList = '暂无';
                            }

                            var html = `<div class="fh-section-item supplement-info">
                                            <div class="card-title-box">
                                                <i class="aui-icon-face card-title-icon"></i>
                                                <span class="card-title">违法信息${index + 1}</span>
                                                <div class="detailBtn ${data.source == 2 ? 'hide' : ''}">
                                                    <div class="btn-group btn-group-icon aui-ml-md" role="group" aria-label="Basic example">
                                                        <div class="hat-content clearfix">
                                                            <div class="float-left btn-gutter-sm">
                                                                <button type="button" class="btn btn-primary btn-sm editDetailCardTwo">编辑</button>
                                                                <button type="button" class="btn btn-primary btn-sm deleteDetailCardTwo">删除</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="hat-content clearfix">
                                                <div class="detailContent">
                                                    <div class="detail-form">
                                                        <div class="form-group">
                                                            <label class="aui-form-label">现场比对照截图:</label>
                                                            <div class="form-text" id="illegalBBPhoto_${index + 1}">
                                                                ${htmlActCompareShotList}
                                                            </div>
                                                        </div>
                                                        <div class="form-group">
                                                            <label class="aui-form-label">证件照截图:</label>
                                                            <div class="form-text" id="illegalZJPhoto_${index + 1}">
                                                                <a class="photo-link" target="_blank" href="${$url ? $url : './assets/images/control/person.png'}" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
                                                                    <img src="${$url ? $url : './assets/images/control/person.png'}" onerror="this.error=null;this.src='./assets/images/control/person.png'" alt="证件照截图">
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <div class="form-group">
                                                            <label class="aui-form-label">对比照截图:</label>
                                                            <div class="form-text" id="illegalDBPhoto_${index + 1}">
                                                                ${htmlComparisonShotList}
                                                            </div>
                                                        </div>
                                                        <div class="form-group">
                                                            <label class="aui-form-label">现场地图:</label>
                                                            <div class="form-text" id="illegalXCMap_${index + 1}">
                                                                ${htmlActMapList}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <div class="form-group">
                                                            <label class="aui-form-label">现场照截图:</label>
                                                            <div class="form-text" id="illegalXCPhoto_${index + 1}">
                                                                ${htmlActScreenshotList}
                                                            </div>
                                                        </div>
                                                        <div class="form-group">
                                                            <label class="aui-form-label">相关视频:</label>
                                                            <div class="form-text" id="illegalVideo_${index + 1}">
                                                                ${htmlSourceVideoList}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <div class="form-group">
                                                            <label class="aui-form-label">违法时间:</label>
                                                            <div class="form-text" id="illegalTime_${index + 1}">${element.illegallyTime ? element.illegallyTime : '暂无'}</div>
                                                        </div>
                                                        <div class="form-group">
                                                            <label class="aui-form-label">违法地点:</label>
                                                            <div class="form-text" id="illegalAdd_${index + 1}">${element.illegallyAdd ? element.illegallyAdd : '暂无'}</div>
                                                        </div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">关联事件:</label>
                                                        <div class="form-text" id="illegalEvent_${index + 1}">${element.eventName ? element.eventName : '暂无'}</div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">关联线索:</label>
                                                        <div class="form-text" id="illegalClue_${index + 1}">${element.clueName ? element.clueName : '暂无'}</div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">现场违法行为:</label>
                                                        <div class="form-text" id="illegalOnSiteDelict_${index + 1}">${element.onSiteDelict ? element.onSiteDelict : '暂无'}</div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">信息来源:</label>
                                                        <div class="form-text" id="illegalSourceInfo_${index + 1}">${element.sourceInfo ? element.sourceInfo : '暂无'}</div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">涉嫌全国性罪名:</label>
                                                        <div class="form-text" id="illegalStateCharge_${index + 1}">${element.stateCharge ? element.stateCharge : '暂无'}</div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">涉嫌香港罪名:</label>
                                                        <div class="form-text" id="illegalHhkCharge_${index + 1}">${element.hhkCharge ? element.hhkCharge : '暂无'}</div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">现场人物特征描述:</label>
                                                        <div class="form-text" id="illegalFeature_${index + 1}">${element.actDescription ? element.actDescription : '暂无'}</div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">比对人:</label>
                                                        <div class="form-text" id="illegalContract_${index + 1}">${element.comparisonor ? element.comparisonor : '暂无'}</div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">备注:</label>
                                                        <div class="form-text" id="illegalComments_${index + 1}">${element.comments ? element.comments : '暂无'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`;
                            $("#breakLowNewS").append(html);
                            $("#breakLowNewS").find(".fh-section-item.supplement-info").eq(index).data("allData", element);
                        });
                    } else {
                        warningTip.say('当前人员已经不存在');
                    }
                }
            };
        loadData(port, true, portData, successFunc, undefined, "GET");
    };

    /**详情标签获取
     * @param {*} type 标签id
     */
    function getLabelsTypeS(id) {
        labelsData.forEach(val => {
            if (val.labelId == id) {
                labelName = val.labelName;
            }
        });

        return labelName;
    };

    // 图片截屏
    $('#searchBigImgS').on('click', function (e) {
        if ($('#searchBigImgS').find('img').attr('src').indexOf('person.png') >= 0) {
            return;
        }

        var $targetImg = $('#searchImgS'),
            base64Img = $(this).find('img').attr('src');
        cutOutImage(base64Img, $targetImg);
    })

    // 静态检索条件设置按钮点击事件
    $('#staticConfig').on('click', function () {
        if ($('#staticConfigBox').hasClass('hide')) {
            $('#staticConfigBox').removeClass('hide');
        } else {
            $('#staticConfigBox').addClass('hide');
        }
    })

    $('#staticConfigBox').on('click', '.aui-icon-not-through', function () {
        $('#staticConfigBox').addClass('hide');
    })

    //切换厂家公用函数
    function tabCjCommon(idName, cjId, $data, count) {
        showLoading($(idName).parents(".factoryAlg"));
        var ageVal = $data.agegroup, // 年龄
            sexVal = $data.sex, // 性别
            faceVal = String($data.libids), //人脸库查询值
            countVal = $data.limit, // 结果数
            cjs = $data.platformId, // 已选算法厂家id数组			
            allCountS = 0; // 静态库 搜索总数

        var port1 = 'v2/faceRecog/face1VN',
            data1 = {
                staticId: $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr('picid'),
                ageGroup: ageVal,
                sex: sexVal,
                libIds: faceVal,
                platformId: cjId,
                platformIds: cjs,
                idcard: $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr('idcard'),
                incidentId: $("#commentSelectStatic").hasClass("hide") ? '' : $("#commentSelectStatic").find(".selectpicker").val(),
                top: countVal
            },
            successFunc1 = function (data) {
                hideLoading($(idName).parents(".factoryAlg"));
                if (data.code === '200') {
                    var result = data.data || false;
                    var _html = '';
                    _html = createStaticImgItem(result, _html); // 构造当前厂家图片节点
                    $('#staticContentContainerS').find(idName).siblings().find('.image-new-list').html('');
                    $('#staticContentContainerS').find(idName).find('.image-new-list').html(_html); // 加载厂家搜索的图片内容
                    bindDataToImgItem($('#staticContentContainerS'), idName, result); // 将列表绑上数据

                    $(idName).find(".image-new-wrap").each((index, ele) => {
                        var $this = $(ele),
                            listData = $this.data('listData'),
                            libNames = '';
                        listData.libInfos.map(function (el, index) {
                            if (index === 0) {
                                libNames = el.libName;
                            } else {
                                libNames = libNames + ',' + el.libName;
                            }
                        });
                        if (libNames.indexOf('涉港一人一档库') > -1) {
                            var portBasics = 'v2/memberFiles/basics';
                            var portDataBasics = {
                                name: listData.name,
                                idcard: listData.idcard,
                                page: 1,
                                size: 1,
                                randomNub: Math.random() // 非后端需要数据，防止请求被终止
                            },
                                successFuncBasics = function (data) {
                                    if (data.code === '200' && data.data.list.length > 0) {
                                        var list = data.data.list,
                                            rxId = list[0].rxId,
                                            rxUrl = list[0].url;
                                        $this.data({
                                            rxId: rxId,
                                            rxUrl: rxUrl
                                        })
                                        $this.find('.basicsBut').removeClass('hide');
                                    }
                                }
                            loadData(portBasics, true, portDataBasics, successFuncBasics);
                        }
                    })

                    $(`#fuseAlg${$('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').attr("cache")}`).find(".image-new-wrap").each(function (index, ele) {
                        var $this = $(ele),
                            listData = $this.data('listData'),
                            libNames = '';
                        listData.libInfos.map(function (el, index) {
                            if (index === 0) {
                                libNames = el.libName;
                            } else {
                                libNames = libNames + ',' + el.libName;
                            }
                        });
                        if (libNames.indexOf('涉港一人一档库') > -1) {
                            var portBasics = 'v2/memberFiles/basics';
                            var portDataBasics = {
                                name: listData.name,
                                idcard: listData.idcard,
                                page: 1,
                                size: 1
                            },
                                successFuncBasics = function (data) {
                                    if (data.code === '200' && data.data.list.length > 0) {
                                        var list = data.data.list,
                                            rxId = list[0].rxId,
                                            rxUrl = list[0].url;
                                        $this.data({
                                            rxId: rxId,
                                            rxUrl: rxUrl
                                        })
                                        $this.find('.basicsBut').removeClass('hide');
                                    }
                                }
                            loadData(portBasics, false, portDataBasics, successFuncBasics);
                        }
                    })

                    if (!result.length) { // 无返回结果比中返回-3
                        loadEmpty($('#staticContentContainerS').find(idName + ' .image-new-list'));
                        var item = $('#searchImgS').find('.add-image-item.active').find('img').attr('cache');
                        if ($('#algorithmContent').data("cjData" + item)) {
                            var cjData = $('#algorithmContent').data("cjData" + item);
                        } else {
                            var cjData = $('#algorithmContent').data("cjData");
                        }
                        cjData.forEach((val, index) => {
                            if (val.platformId == cjId) {
                                val.dataState = 'nodata'; // 数据返回状态为nodata时 比中标注为-3
                            }
                        });
                        // 有算法产家获取异常 赋新值 由于有缓存 不同照片存储区分开 比中使用
                        $('#algorithmContent').data("cjData" + item, cjData)
                    }
                } else {
                    if (data.code === '616') {
                        isLoad = true;
                        var sxCount = count ? count : 1;
                        if (sxCount < 4) {
                            // 给图片绑定静态id
                            var picBase64 = $('#searchImgS').data('src'),
                                staticId = $('#searchImgS').data('staticId');
                            if (picBase64.indexOf("http") == 0) { //url
                                var picIdPortData = {
                                    url: picBase64,
                                    staticId: staticId,
                                    moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
                                };
                            } else { //base64
                                var picIdPortData = {
                                    base64: picBase64,
                                    staticId: staticId,
                                    moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
                                };
                            }
                            var picIdPort = 'v2/faceRecog/uploadImage',
                                picIdSuccessFunc = function (data) {
                                    if (data.code == '200') {
                                        $('#searchImgS').find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                            if ($(ele).find('.add-image-img').attr('picId') == staticId) {
                                                // 给当前选中的图片绑定id
                                                $(ele).find('.add-image-img').attr('picId', data.staticId);
                                                $(ele).find('.add-image-img').attr('picStatus', '1');
                                            }
                                        })
                                        $('#searchImgS').data('staticId', data.staticId);
                                        sxCount += sxCount;
                                        tabCjCommon(idName, cjId, $data, sxCount);
                                    } else {
                                        warningTip.say(data.message);
                                        $('#searchImgS').find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                            if ($(ele).find('.add-image-img').attr('picId') == staticId) {
                                                $(ele).find('.add-image-img').attr('picStatus', '0');
                                            }
                                        })
                                    }
                                };
                            loadData(picIdPort, false, picIdPortData, picIdSuccessFunc);
                        }
                        if (sxCount > 3) {
                            warningTip.say('图片已失效，请重新上传图片');
                        }
                    } else if (data.code === '500') {
                        loadEmpty($('#staticContentContainerS').find(idName + ' .image-new-list'), '算法获取异常', "", true);
                        var item = $('#searchImgS').find('.add-image-item.active').find('img').attr('cache');
                        if ($('#algorithmContent').data("cjData" + item)) {
                            var cjData = $('#algorithmContent').data("cjData" + item);
                        } else {
                            var cjData = $('#algorithmContent').data("cjData");
                        }
                        cjData.forEach((val, index) => {
                            if (val.platformId == cjId) {
                                val.dataState = 'error';
                            }
                        });
                        // 有算法产家获取异常 赋新值 由于有缓存 不同照片存储区分开 比中使用
                        $('#algorithmContent').data("cjData" + item, cjData)
                    } else if (data.code === '613') {
                        loadEmpty($('#staticContentContainerS').find(idName + ' .image-new-list'), '算法厂家升级中', "", true);
                        var item = $('#searchImgS').find('.add-image-item.active').find('img').attr('cache');
                        if ($('#algorithmContent').data("cjData" + item)) {
                            var cjData = $('#algorithmContent').data("cjData" + item);
                        } else {
                            var cjData = $('#algorithmContent').data("cjData");
                        }
                        cjData.forEach((val, index) => {
                            if (val.platformId == cjId) {
                                val.dataState = '613';
                            }
                        });
                        // 有算法产家获取异常 赋新值 由于有缓存 不同照片存储区分开 比中使用
                        $('#algorithmContent').data("cjData" + item, cjData)
                    } else {
                        loadEmpty($('#staticContentContainerS').find(idName + ' .image-new-list'));
                        warningTip.say(data.message);
                    }
                }
            };
        loadData(port1, true, data1, successFunc1, '', 'POST', sourceType == 'ga' ? serviceUrlOther : '');
    }

    //切换厂家
    $("#staticContentContainerS").on("click", ".factoryAlg .nav-item .nav-link", function () {
        var idName = $(this).attr("href"),
            cjId = $(this).attr("cjid"),
            $data = $('#searchImgS').find('.add-image-item').filter('.active').find('.add-image-img').data();
        if ($data.isAll != 1) {
            if (!cjId) {
                // loadEmpty($('#staticContentContainerS').find(idName + ' .image-new-list'), '融合结果请重新检索查看');
                // return;
                var item = $('#searchImgS').find('.add-image-item.active').find('img').attr('cache');
                var rongheLength = $('#fuseAlg' + item).find('.image-new-wrap').length;
                if (!rongheLength) {
                    var ronghe = $('#fuseAlg' + item).data('listData');
                    var container = $('#staticContentContainerS');
                    var rh_html = '';
                    rh_html = createStaticImgItem(ronghe, rh_html, true); // 融合数小于等于8时 构造融合算法图片
                    container.find(`#fuseAlg${item} .image-new-list`).html(rh_html); // 融合搜索的图片内容
                    bindDataToImgItem(container, `#fuseAlg${item} .image-new-list`, ronghe); // 将融合图片 绑上身份证数据 用以后面二次检索使用
                    bindStaticRongheDataS(container, ronghe, item); // 融合结果数据挂载
                    $('#staticContentContainerS').find(idName).siblings().find('.image-new-list').html('');
                }
            } else {
                tabCjCommon(idName, cjId, $data);
            }
        } else {
            return
        }
    })
})(window, window.jQuery)