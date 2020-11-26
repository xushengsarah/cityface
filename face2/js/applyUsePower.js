(function (window, $) {
    var allData = '';
    //获取申请类型
    getApplyType();

    //初始化
    function initApplyPage() {
        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });
        $('[data-role="checkbox"]').checkboxradio();
        allData = $('.applyUse-new-popup').data("allData");
        var type = $('.applyUse-new-popup').data("type");
        //获取数据是新建还是编辑
        if (allData) { //编辑
            $("#applyPeople").closest('.aui-col-12').removeClass('hide');
            $("#applyPeople").text(allData.userName + "(" + allData.orgName + ")");
            $("#staticUsedTimes").removeClass('hide');
            $("#dynamicUsedTimes").removeClass('hide');
            if (allData.applications.length > 0) {
                var usedTimesText1 = "",
                    usedTimesText2 = "";
                allData.applications.forEach(function (el) {
                    if (el.type == 1) {
                        usedTimesText1 = '已使用次数：' + el.useCount;
                    } else if (el.type == 2) {
                        usedTimesText2 = '已使用次数：' + el.useCount;
                    }
                })
            }
            $("#staticUsedTimes").text(usedTimesText1);
            $("#dynamicUsedTimes").text(usedTimesText2);
            $("#applyTypeBtn").find(".btn[typeId=" + allData.applicationType + "]").click();
            $("#applyTypeBtn").find(".btn").addClass("noclick");
            //获取申请类型
            $("#applyMyPower_event").val(allData.incident); //任务名称
            $("#applyMyPower_reason").val(allData.comments); //任务详情
            $("#applyMyPower_dynamicNumber").val(allData.labh); //案件编号
            $('#applyMyPower_dynamicAnnex').addClass('hide'); //上传文书
            $('#uploadResultApply').removeClass('hide');
            $('#uploadResultApply').fadeIn(300);
            $('#uploadResultApply').data({
                docUrl: allData.writUrl,
                upload: true
            });
            if (allData.writUrl && allData.writUrl.indexOf('.pdf') > -1) {
                $('#uploadResultApply').find('.result-name').html(`<a class="docUrl" url="${allData.writUrl}">立案文书.pdf</a>`);
            } else {
                $('#uploadResultApply').find('.result-name').html(`<img class="table-img img-right-event" src="${allData.writUrl}" alt="">`);
            }
            if ($('.applyUse-new-popup').data("from")) { //我的审批页面点击的时候不用请求审批人接口
                $("#applyMyPower_approveValue").removeClass("hide");
                $("#applyMyPower_approveValue").val(allData.approverName + '(' + allData.approver + ')');
                $("#applyMyPower_approve").parents(".control-form").find(".aui-icon-not-through").addClass("hide");
                $("#applyMyPower_approve").addClass("hide");
            } else {
                if (allData.approver) {
                    getPersonList($("#applyMyPower_approve"), 2, '1', allData.approver);
                } else {
                    $("#applyMyPower_approve").parents(".control-form").find(".aui-icon-not-through").addClass("hide");
                    $("#applyMyPower_approve").val(null);
                    $("#applyMyPower_approve").prop('disabled', 'disabled'); // 目前不可编辑之后可以编辑放开
                    $("#applyMyPower_approve").selectpicker('refresh');
                }
            }
            if (allData.xbUserList && allData.xbUserList.length > 0) {
                var viewUserNameList = [],
                    viewUserIdList = [];
                allData.xbUserList.forEach(function (item) {
                    viewUserNameList.push(item.userName);
                    viewUserIdList.push(item.userId);
                });
                $('#applyMyPower_assistant').data({
                    'nameArr': viewUserNameList,
                    'userIdArr': viewUserIdList,
                    'noticeUserList': viewUserIdList
                }).val(viewUserNameList.join(','));
            }

            switch (allData.applicationType) {
                case 2:
                    //日常工作（显示工作内容）
                    $("#applyTypeRadio").find("input[value=" + allData.applicationRcgzType + "]").prev().click();
                    break;
                case 3:
                case 4:
                    //已立案(显示立案编号)
                    $("#applyMyPower_dynamicNumber").val(allData.labh);
                    $("#applyUsePowerPage .applyName").removeClass("hide");
                    $("#applyUsePowerPage .applyComment").removeClass("hide");
                    break;
                case 5:
                    //特殊人员(显示待查人身份和待查人照片)
                    $("#applyMyPower_idCard").val(allData.searchedIdcard);
                    $("#applyMyPower_name").val(allData.searchedName);
                    $("#specialPhoto").find(".aui-icon-add").addClass("hide");
                    $("#specialPhoto").find("form[name='fileinfo']").addClass("hide");
                    $("#specialPhoto").find(".pic-add-img").removeClass("hide").attr("src", allData.searchedUrl);

                    $("#applyUsePowerPage .applyPhoto").removeClass("hide");
                    $("#applyUsePowerPage .applyIdCard").removeClass("hide");
                    break;
                case 6:
                    allData.attachments.forEach(function (item, index) {
                        var imgHtml = `<div class="add-image-item">
                                                    <img class="add-image-img" alt="" src="${item ? item : './assets/images/control/person.png'}">
                                                    <i class="aui-icon-delete-line ${type == 'view' ? 'hide' : ''}"></i>
                                                </div>`;
                        $('#applyMyPower_warrantCard').find('.add-image-icon').before(imgHtml);
                    });
                    $('#applyMyPower_warrantCard').removeClass('center');
                    $('#applyMyPower_warrantCard').find('.add-image-icon').removeClass('add-image-new');
                    $('#applyMyPower_warrantCard').find('.add-image-box-text').addClass('hide');
                    break;
            }

            allData.applications.forEach((val, index) => {
                switch (val.type) {
                    case '1':
                        if (val.startUseDate) { //期限
                            $("#applyStaticStart").val(val.startUseDate);
                            $("#applyStaticEnd").val(val.endUseDate);
                        }

                        if (val.limitCount) { //次数
                            $("#applyMyPower_staticCount").val(val.limitCount);
                        }
                        break;
                    case '2':
                        if (val.startUseDate) { //期限
                            $("#dynamicUseCondition1").click();
                            $("#applyDynamicStart").val(val.startUseDate);
                            $("#applyDynamicEnd").val(val.endUseDate);
                        }

                        if (val.limitCount) { //次数
                            $("#dynamicUseCondition2").click();
                            $("#applyMyPower_dynamicCount").val(val.limitCount);
                        }
                        break;
                }
            });

            if (type == 'view') {
                $("#applyUsePowerPage").find("input").attr("disabled", "disabled");
                $("#applyUsePowerPage").find("input.datepicker-input").parent().addClass("disabled");
                $("#applyUsePowerPage").find("textarea").attr("disabled", "disabled");
                $("#uploadResultApply").find(".aui-icon-not-through").addClass("hide");
                //警察证上传
                $('#applyMyPower_warrantCard').find('.add-image-icon').addClass("hide");
                $("#applyUsePowerPage").find(".popup-footer").addClass("hide");
            }
        } else {
            $("#applyPeople").closest('.aui-col-12').addClass('hide');
            $("#usedTimes").closest('.aui-col-12').addClass('hide');
            //getPowerApply('1');
            //getPersonList($("#applyMyPower_approve"), 2, '1');
            getOrg($("#applyMyPower_zbdw"));
        }
    };

    //获取申请权限信息
    function getPowerApply(applicationType) {
        //var port = 'v3/myApplication/applicationLimit',
        if (applicationType == '4') {  //专项工作key值不同
            var key = "LIMIT_DURATION_ZA";
        } else {
            var key = "LIMIT_DURATION";
        }
        var port = 'v2/dic/getServerConfig',
            data = {
                key
            };
        var successFunc = function (data) {
            if (data.code == '200') {
                //是否有权限
                // if (data.authority) {
                //     $("#applyUsePowerPage").find(".popup-footer").removeClass("hide");
                // } else {
                //     $("#applyUsePowerPage").find(".popup-footer").addClass("hide");
                // }
                $("#applyMyPower_dynamicDate").html(`<input id="applyDynamicStart" class="aui-input input-text datepicker-input radius Wdate" type="text" />
                                                        <span class="input-group-addon">~</span>
                                                        <input id="applyDynamicEnd" class="aui-input input-text datepicker-input radius Wdate" type="text" />
                                                        <span class="input-group-addon">
                                                            <i class="datepicker-icon aui-icon-calendar"></i>
                                                        </span>`);

                //可使用次数
                $("#applyMyPower_dynamicCount").attr("limitCount", data.data).attr("placeholder", "请输入可使用次数，1-" + data.data).val(data.data);
                $("#applyMyPower_staticCount").attr("limitCount", data.data).attr("placeholder", "请输入可使用次数，1-" + data.data).val(data.data);

                //可使用天数
                //静态和动态日历选择时间初始化
                $("#applyStaticStart").off("click").on("click", function () {
                    WdatePicker({
                        maxDate: '#F{$dp.$D(\'applyStaticEnd\')}',
                        minDate: '#F{$dp.$D(\'applyStaticEnd\',{d:-' + data.data + '})||\'%y-%M-%d\'}',
                        dateFmt: 'yyyy-MM-dd',
                        autoPickDate: true
                    })
                });

                $("#applyStaticEnd").off("click").on("click", function () {
                    WdatePicker({
                        maxDate: '#F{$dp.$D(\'applyStaticStart\',{d:' + data.data + '})}',
                        minDate: '#F{$dp.$D(\'applyStaticStart\')}',
                        dateFmt: 'yyyy-MM-dd',
                        autoPickDate: true
                    })
                });

                $("#applyDynamicStart").on("click", function () {
                    WdatePicker({
                        maxDate: '#F{$dp.$D(\'applyDynamicEnd\')}',
                        minDate: '#F{\'%y-%M-%d\'}',
                        dateFmt: 'yyyy-MM-dd',
                        autoPickDate: true
                    })
                });

                $("#applyDynamicEnd").off("click").on("click", function () {
                    WdatePicker({
                        maxDate: '#F{$dp.$D(\'applyDynamicStart\',{d:' + data.data + '})}',
                        minDate: '#F{$dp.$D(\'applyDynamicStart\')}',
                        dateFmt: 'yyyy-MM-dd',
                        autoPickDate: true
                    })
                });

                $('#applyMyPower_staticDate').find('input').eq(0).val(sureSelectTime(1, true).now).attr("initTime", sureSelectTime(1, true).now);
                $('#applyMyPower_staticDate').find('input').eq(1).val(sureSelectTime(1, true).date).attr("initTime", sureSelectTime(1, true).date);

                $('#applyMyPower_dynamicDate').find('input').eq(0).val(sureSelectTime(1, true).now).attr("initTime", sureSelectTime(1, true).now);
                $('#applyMyPower_dynamicDate').find('input').eq(1).val(sureSelectTime(1, true).date).attr("initTime", sureSelectTime(1, true).data);
            } else {
                warningTip.say(data.message);
            }
        };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };

    //获取申请类型
    function getApplyType(type) {
        var port = 'v2/dic/dictionaryInfo',
            data = {
                "kind": "CSRX_SEARCH_APPLICATION_TYPE"
            };
        var successFunc = function (data) {
            if (data.code == '200') {
                var list = data.data,
                    html = '';
                // html += `<button type="button" class="btn btn-sm btn-primary" typeId=9>案件及警情</button>`;
                var port1 = 'v2/user/getUserOperateAuthorty',
                    data1 = {
                        moduleCode: '2608'
                    };
                var successFunc1 = function (data) {
                    if (data.code === '200') {
                        let flag = false;
                        data.data.forEach(element => {
                            if (element.operateCode == '927') {
                                flag = true;
                            }
                        })
                        if (!flag) {
                            list = list.filter(item => {
                                return item.id != 5;
                            })
                        }
                        for (var i = 0; i < list.length; i++) {
                            html += `<button type="button" class="btn btn-sm ${type ? (type == list[i].id ? 'btn-primary' : '') : (i == 0 ? 'btn-primary' : '')}" typeId=${list[i].id} title=${list[i].id == '1' ? '此类型只可申请静态权限' : ''}>${list[i].name}</button>`;
                            //html += `<button type="button" class="btn btn-sm" typeId=${list[i].id} title=${list[i].id == '1' ? '此类型只可申请静态权限' : ''}>${list[i].name}</button>`;
                        }
                        $("#applyTypeBtn").html(html);
                        if (list[0].id == '1') {
                            $("#applyUsePowerPage").find(".dynamic").addClass("hide");
                        }
                        //获取工作类型
                        getApplyWorkType();
                        $("#applyTypeBtn").find(".btn.btn-primary").click();
                    } else {
                        warningTip.say(data.message);
                    }
                };
                loadData(port1, true, data1, successFunc1, undefined, 'GET');
            } else {
                warningTip.say(data.message);
            }
        };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };

    //获取工作类型
    function getApplyWorkType() {
        var port = 'v2/dic/dictionaryInfo',
            data = {
                "kind": "CSRX_SEARCH_APPLICATION_RCGZ_TYPE"
            };
        var successFunc = function (data) {
            if (data.code == '200') {
                var list = data.data,
                    html = '';
                for (var i = 0; i < list.length; i++) {
                    html += `<label for="applyTypeRadio${i}">${list[i].name}</label>
                            <input type="radio" name="applyTypeRadio" id="applyTypeRadio${i}" value="${list[i].id}" typeId="${list[i].id}" data-role="radio" ${i == 0 ? 'checked' : ''}>`;
                }
                $("#applyTypeRadio").html(html);
                $('[data-role="radio"]').checkboxradio();
                initApplyPage();
            } else {
                warningTip.say(data.message);
            }
        };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };

    //切换申请类型重置数据
    function resetApplyData() {
        //工作类型
        $("#applyTypeRadio").find("input[name=applyTypeRadio]").eq(0).click();
        //立案编号
        $("#applyMyPower_dynamicNumber").val("");
        //任务名称
        $("#applyMyPower_event").val("");
        //任务详情
        $("#applyMyPower_reason").val("");
        //证明材料
        if (!$("#uploadResultApply").hasClass("hide")) {
            $('#uploadResultApply').find('i').click();
        }
        //紧急程度
        //$("#criticalTypeOne").prev().click();

        //特殊人员身份证和姓名
        $("#specialPhoto").find(".aui-icon-delete-line").click();

        //警察证
        $('#applyMyPower_warrantCard').find(".add-image-item").remove();
        $('#applyMyPower_warrantCard').addClass('center');
        $('#applyMyPower_warrantCard').find('.add-image-icon').addClass('add-image-new');
        $('#applyMyPower_warrantCard').find('.add-image-box-text').removeClass('hide');

        //检索人身份证
        $("#applyMyPower_idcards").val("");
        //附件
        $('#applyMyPower_otherFile').find(".add-image-item").remove();
        $('#applyMyPower_otherFile').addClass('center');
        $('#applyMyPower_otherFile').find('.add-image-icon').addClass('add-image-new');
        $('#applyMyPower_otherFile').find('.add-image-box-text').removeClass('hide');

        //附件说明
        $("#applyMyPower_OtherFileComment").val("");

        //协办人
        $('#applyMyPower_assistant').val('');
        $('#applyMyPower_assistant').attr('title', '');
        $('#applyMyPower_assistant').data({
            'saveVal': [],
            'noticeUserList': [],
            'userIdArr': []
        })
    };

    /**
     * 确认校验
     * @param {*} type 静态1动态2
     * @param {*} obj 数据
     */
    function checkFlag(type, obj, controlFlag) {
        var controlFlag = controlFlag,
            $containerData = type == '1' ? $("#applyMyPower_staticDate") : $("#applyMyPower_dynamicDate"),
            $containerLimit = type == '1' ? $("#applyMyPower_staticCount") : $("#applyMyPower_dynamicCount");
        if ((obj.startUseDate == '' && obj.endUseDate) || (obj.startUseDate && obj.endUseDate == '')) { //选中的是日期，判断两个时间
            $containerData.closest(".form-group").find("p.text-danger-one").removeClass("hide");
            $containerData.eq(0).closest(".form-group").find("p.text-danger-all").addClass("hide");
            controlFlag = false;
        }

        // if (obj.limitCount && (obj.limitCount > parseInt($containerLimit.attr("limitCount")) || obj.limitCount < 1)) {
        //     $containerLimit.closest(".form-group").find("p.text-danger").removeClass("hide").html(`次数范围在1-${$containerLimit.attr("limitCount")}`);
        //     controlFlag = false;
        // }

        return controlFlag;
    }

    /**************************************************获取主办单位 start********************************************************/
    function getOrg($container) {
        showLoading($container.closest(".aui-col-18"));
        var port = 'v2/org/getOrgInfos',
            data = {
                orgId: '',
                orgType: 2,
                userType: 2,
                returnType: 3
            };
        var successFunc = function (data) {
            hideLoading($container.closest(".aui-col-18"));
            if (data.code === '200') {
                var result = data.data,
                    arrayBox = {};
                // 对返回数组进行排序 市局排在最上层
                for (var i = 0; i < result.length; i++) {
                    if (result[i].parentId === null) {
                        arrayBox = result[i];
                        result.splice(i, 1);
                        result.splice(0, 0, arrayBox);
                    }
                }
                if (result && result.length) { // 存在返回值
                    var itemHtml = '';
                    itemHtml = `<option class="option-item" orgcode="${result[0].orgCode}" orgid="${result[0].orgId}" value="${result[0].orgId}" parentid="" selected>${result[0].orgName}</option>`;
                    for (var i = 1; i < result.length; i++) {
                        itemHtml += `<option class="option-item" orgcode="${result[0].orgCode}" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                    }
                    $container.empty().append(itemHtml); // 元素赋值
                    $container.selectpicker({
                        allowClear: false
                    });
                    $container.selectpicker('refresh');

                    $container.on('changed.bs.select', function (e, clickedIndex, isSelected) {
                        if (isSelected) {
                            var $targetOptionItem = $container.find(".option-item").eq(clickedIndex - 1);
                            $container.attr("orgcode", $targetOptionItem.attr('orgcode'));
                        }
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
        loadData(port, true, data, successFunc, undefined, 'GET');
    }
    /**************************************************获取主办单位 end********************************************************/
    /**************************************************特殊人员 start********************************************************/
    //特殊人员身份证失去焦点事件
    $("#applyMyPower_idCard").on("blur", function () {
        if ($.trim($(this).val()) != "") {
            var port = 'v2/faceRecog/specialPersonInfo',
                data = {
                    "idcard": $(this).val()
                };
            var successFunc = function (data) {
                if (data.code == '200') {
                    $("#applyMyPower_name").val(data.data.name);
                    $("#specialPhoto").find(".aui-icon-add").addClass("hide");
                    $("#specialPhoto").find(".aui-icon-delete-line").removeClass("hide");
                    $("#specialPhoto").find("form[name='fileinfo']").addClass("hide");
                    $("#specialPhoto").find(".pic-add-img").removeClass("hide").attr("src", data.data.url);
                } else {
                    $("#specialPhoto").find(".aui-icon-delete-line").click();
                    warningTip.say(data.message);
                }
            };
            loadData(port, true, data, successFunc);
        } else {
            $("#specialPhoto").find(".aui-icon-delete-line").click();
        }
    });

    //特殊人员上传图片
    $('#specialPhoto .uploadFile').on('change', function () {
        if (this.value != '') {
            var _this = $(this);
            var reader = new FileReader();
            var html = '',
                fileNameArr = this.value.split('\\'), // 文件名路径数组
                fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
                fileNameTypeArr = fileName.split('.'),
                fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase(),
                typeArr = ['bmp', 'jpg', 'jpeg', 'png', 'dib', 'webp', 'svgz', 'gif', 'ico', 'svg', 'tif', 'xbm', 'jfif', 'pjpeg', 'pjp', 'tiff'];
            if (typeArr.indexOf(fileType) < 0) {
                this.value = '';
                warningTip.say('格式不正确,请上传图片格式');
                return;
            }
            //获取图片大小
            var size = this.files[0].size / 1024;
            if (size < (1024 * 10)) {
                reader.onload = function (e) {
                    showLoading($("#specialPhoto"));
                    var addimg = reader.result;
                    var port = 'v2/faceRecog/specialPersonInfo',
                        data = {
                            "base64": addimg
                        };
                    var successFunc = function (data) {
                        hideLoading($("#specialPhoto"));
                        if (data.code == '200') {
                            $("#applyMyPower_name").val(data.data.name);
                            $("#applyMyPower_idCard").val(data.data.idcard).attr("disabled", "disabled");
                            $("#specialPhoto").find(".aui-icon-add").addClass("hide");
                            $("#specialPhoto").find(".aui-icon-delete-line").removeClass("hide");
                            $("#specialPhoto").find("form[name='fileinfo']").addClass("hide");
                            $("#specialPhoto").find(".pic-add-img").removeClass("hide").attr("src", data.data.url);
                        } else {
                            $("#specialPhoto").find(".uploadFile").val('');
                            warningTip.say(data.message);
                        }
                    };
                    loadData(port, true, data, successFunc);
                }
                reader.readAsDataURL(this.files[0]);
            } else {
                warningTip.say("图片不能大于10M");
            };
        }
    });

    //图片删除按钮点击事件(基本信息新增弹窗出入境)
    $("#specialPhoto").on("click", ".aui-icon-delete-line", function (e) {
        e.stopPropagation();
        e.preventDefault();
        var that = this;
        $("#applyMyPower_name").val("");
        $("#applyMyPower_idCard").val("").attr("disabled", false);
        $(that).parent().find(".uploadFile").val('');
        $(that).parent().find(".pic-add-img").attr('src', '');
        $(that).parent().find(".aui-icon-add").removeClass("hide");
        $(that).parent().find("form[name='fileinfo']").removeClass("hide");
        $(that).addClass("hide");
    });
    /**************************************************特殊人员 end********************************************************/
    /**************************************************警察证 start********************************************************/
    // 警察证点击添加 上传图片事件
    $('#applyMyPower_warrantCard .uploadFile').on('change', function () {
        if (this.value != '') {
            var _this = $(this);
            var reader = new FileReader();
            var html = '',
                fileNameArr = this.value.split('\\'), // 文件名路径数组
                fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
                fileNameTypeArr = fileName.split('.'),
                fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase(),
                typeArr = ['bmp', 'jpg', 'jpeg', 'png', 'dib', 'webp', 'svgz', 'gif', 'ico', 'svg', 'tif', 'xbm', 'jfif', 'pjpeg', 'pjp', 'tiff'];
            if (typeArr.indexOf(fileType) < 0) {
                this.value = '';
                warningTip.say('格式不正确,请上传图片格式');
                return;
            }
            //获取图片大小
            var size = this.files[0].size / 1024;
            if (size < (1024 * 10)) {
                var formFileData = new FormData($(_this).parent()[0]),
                    uploadFormData = new FormData(),
                    xhr = new XMLHttpRequest(),
                    token = $.cookie('xh_token'),
                    wordFile = formFileData.get('wordFile');

                reader.onload = function (e) {
                    var addimg = reader.result;

                    xhr.open('post', serviceUrl + '/v2/memberInfos/upload');
                    xhr.setRequestHeader("token", token);
                    uploadFormData.append('file', wordFile);
                    uploadFormData.append('type', '1');
                    xhr.send(uploadFormData);
                    showLoading($('#applyMyPower_warrantCard'));
                    xhr.onload = function (res) { // word，pdf文件
                        var data = JSON.parse(res.currentTarget.response);
                        hideLoading($('#applyMyPower_warrantCard'));
                        if (data.code === '200') {
                            html = `<div class="add-image-item">
                                        <img class="add-image-img" src="${addimg}" alt="" portUrl=${data.url}>
                                        <i class="aui-icon-delete-line"></i>
                                    </div>`;
                            _this.closest('.add-image-icon').before(html);
                            var $imgItem = $('#applyMyPower_warrantCard').find('.add-image-item');
                            if ($imgItem.length == 5) {
                                $('#applyMyPower_warrantCard .add-image-icon').addClass('hide');
                            }
                            $('#applyMyPower_warrantCard').find('.uploadFile')[0].value = '';

                            $('#applyMyPower_warrantCard').removeClass('center');
                            $('#applyMyPower_warrantCard').find('.add-image-icon').removeClass('add-image-new');
                            $('#applyMyPower_warrantCard').find('.add-image-box-text').addClass('hide');
                            $("#applyMyPower_warrantCard .add-image-icon").siblings('.add-image-item').removeClass('active');
                            $('#addImgWarningApplyMyPower').addClass('hide');
                        } else {
                            warningTip.say(data.message);
                        }
                    }
                    var addimg = reader.result;
                };
                reader.readAsDataURL(this.files[0]);
            } else {
                $('#addImgWarningApplyMyPower').removeClass('hide');
            }
            $('#addImgWarningApplyMyPower').siblings('.text-danger.tip').addClass('hide');
        }
    });

    // 警察证已经上传的图片 删除事件
    $('#applyMyPower_warrantCard').on('click', '.aui-icon-delete-line', function (e) {
        e.stopPropagation();
        var father = $(this).closest('.add-image-item');
        father.remove();
        var $imgItem = $('#applyMyPower_warrantCard').find('.add-image-item');
        if ($imgItem.length < 5) {
            $('#applyMyPower_warrantCard .add-image-icon').removeClass('hide');
        }
        if ($imgItem.length === 0) {
            $('#applyMyPower_warrantCard').addClass('center');
            $('#applyMyPower_warrantCard').find('.add-image-icon').addClass('add-image-new');
            $('#applyMyPower_warrantCard').find('.add-image-box-text').removeClass('hide');
        }
        $('#addImgWarningApplyMyPower').addClass('hide');
    });

    // 警察证上传图片hover 显示中图
    showMiddleImg($('#applyMyPower_warrantCard'), $('#applyUsePowerPage'), '.add-image-item .add-image-img');
    /**************************************************警察证 end**********************************************************/

    /***********************************************相关文书 start************************************************/
    //相关文书点击事件
    $('#uploadResultApply').on('click', 'a.docUrl, img.table-img', function () {
        if ($(this).text() !== '暂无') {
            var url = $(this).attr("url") ? $(this).attr("url") : $(this).attr("src");
            var post_url = serviceUrl + '/v2/file/downloadByHttpUrl?url=' + url;
            if ($("#IframeReportImg").length === 0) {
                $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
            }
            $('#IframeReportImg').attr("src", post_url);
        }
    })

    // 相关文书 上传附件
    $("#applyMyPower_dynamicAnnex").on('click', 'button', function () {
        $('#uploadFileApplyPower').click();
    });

    // 相关文书 点击文件旁 删除按钮事件
    $('#uploadResultApply').find('i').on('click', function () {
        $('#applyMyPower_dynamicAnnex').removeClass('hide');
        $('#uploadResultApply').addClass('hide');
        $('#uploadResultApply').fadeOut(300);
        $('#uploadResultApply').data({
            docUrl: '',
            upload: false
        });
        $('#uploadFileApplyPower')[0].value = '';

        //上传取消自动判断是否选中动态
        // if ($("#useCondition2").prev().hasClass("ui-checkboxradio-checked") && !$("#applyDynamicStart").val() && !$("#applyDynamicEnd").val() && !$("#applyMyPower_dynamicCount").val()) {
        //     $("#useCondition2").prev().click();
        // }
    });

    // 相关文书 判断是否上传了文件,并且对上传的文件进行格式的验证
    $('#uploadFileApplyPower').on('change', function () {
        var that = this,
            fileType = '',
            fileNameArr = that.value.split('\\'), // 文件名路径数组
            fileSize = that.files[0].size,
            fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
            fileNameTypeArr = fileName.split('.'),
            fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase(),
            typeArr = ['bmp', 'jpg', 'jpeg', 'png', 'dib', 'webp', 'svgz', 'gif', 'ico', 'svg', 'tif', 'xbm', 'jfif', 'pjpeg', 'pjp', 'tiff', 'pdf'];

        $('#uploadWarningApply').addClass('hide');
        if (typeArr.indexOf(fileType) < 0) {
            $('#uploadWarningApply').closest('.control-form').find('.text-danger').addClass('hide');
            $('#uploadWarningApply').removeClass('hide').text('上传文件格式不正确,请上传图片或pdf文档');
            that.value = '';
            return;
        }

        // 判断文件大小是否超过100M 
        if (fileSize > 100 * 1024 * 1024) {
            $('#uploadWarningApply').closest('.control-form').find('.text-danger').addClass('hide');
            $('#uploadWarningApply').removeClass('hide').text('上传文件过大,请上传不大于100M的文件');
            that.value = '';
            return;
        }

        var formFileData = new FormData($(that).parent()[0]),
            uploadFormData = new FormData(),
            xhr = new XMLHttpRequest(),
            token = $.cookie('xh_token'),
            wordFile = formFileData.get('wordFile');

        var reader = new FileReader();
        reader.onload = function (e) {
            xhr.open('post', serviceUrl + '/v2/memberInfos/upload');
            xhr.setRequestHeader("token", token);
            uploadFormData.append('type', '4');
            uploadFormData.append('isGa', '1');
            uploadFormData.append('file', wordFile);
            xhr.send(uploadFormData);
            showLoading($('#applyMyPower_dynamicAnnex'));
            xhr.onload = function (res) { // word，pdf文件
                var data = JSON.parse(res.currentTarget.response);
                hideLoading($('#applyMyPower_dynamicAnnex'));
                if (data.code === '200') {
                    $('#uploadResultApply').data('upload', true);
                    url = data.url; // 上传的文件http路径
                    $('#uploadResultApply').data({
                        docUrl: url,
                        filename: data.fileName,
                    });

                    $('#applyMyPower_dynamicAnnex').addClass('hide');
                    $('#uploadResultApply').removeClass('hide');

                    // 将文件名字写出
                    $('#uploadResultApply').fadeIn(300);
                    $('#uploadResultApply').find('.result-name').text(fileName);

                    //上传成功自动选中动态
                    // if (!$("#useCondition2").prev().hasClass("ui-checkboxradio-checked")) {
                    //     $("#useCondition2").prev().click();
                    // }
                } else {
                    $('#uploadResultApply').data('upload', false);
                    warningTip.say(data.message);
                }
            }
        }
        reader.readAsDataURL(this.files[0]);
    });

    // 相关文书 证明材料 hover显示中图
    showMiddleImg($('#uploadResultApply'), $('#applyUsePowerPage'), '.table-img');

    /***********************************************相关文书 end************************************************/

    /***********************************************附件上传 start************************************************/
    // 附件点击添加 上传图片事件
    $('#applyMyPower_otherFile .uploadFile').on('change', function () {
        if (this.value != '') {
            var _this = $(this);
            var reader = new FileReader();
            var html = '',
                fileNameArr = this.value.split('\\'), // 文件名路径数组
                fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
                fileNameTypeArr = fileName.split('.'),
                fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase(),
                typeArr = ['bmp', 'jpg', 'jpeg', 'png', 'dib', 'webp', 'svgz', 'gif', 'ico', 'svg', 'tif', 'xbm', 'jfif', 'pjpeg', 'pjp', 'tiff'];
            if (typeArr.indexOf(fileType) < 0) {
                this.value = '';
                warningTip.say('格式不正确,请上传图片格式');
                return;
            }
            //获取图片大小
            var size = this.files[0].size / 1024;
            if (size < 1024) {
                var formFileData = new FormData($(_this).parent()[0]),
                    uploadFormData = new FormData(),
                    xhr = new XMLHttpRequest(),
                    token = $.cookie('xh_token'),
                    wordFile = formFileData.get('wordFile');

                reader.onload = function (e) {
                    var addimg = reader.result;

                    xhr.open('post', serviceUrl + '/v2/memberInfos/upload');
                    xhr.setRequestHeader("token", token);
                    uploadFormData.append('file', wordFile);
                    uploadFormData.append('type', '1');
                    xhr.send(uploadFormData);
                    showLoading($('#applyMyPower_otherFile'));
                    xhr.onload = function (res) { // word，pdf文件
                        var data = JSON.parse(res.currentTarget.response);
                        hideLoading($('#applyMyPower_otherFile'));
                        if (data.code === '200') {
                            html = `<div class="add-image-item">
                                        <img class="add-image-img" src="${addimg}" alt="" portUrl=${data.url}>
                                        <i class="aui-icon-delete-line"></i>
                                    </div>`;
                            _this.closest('.add-image-icon').before(html);
                            var $imgItem = $('#applyMyPower_otherFile').find('.add-image-item');
                            if ($imgItem.length == 30) {
                                $('#applyMyPower_otherFile .add-image-icon').addClass('hide');
                            }
                            $('#applyMyPower_otherFile').find('.uploadFile')[0].value = '';

                            $('#applyMyPower_otherFile').removeClass('center');
                            $('#applyMyPower_otherFile').find('.add-image-icon').removeClass('add-image-new');
                            $('#applyMyPower_otherFile').find('.add-image-box-text').addClass('hide');
                            $("#applyMyPower_otherFile .add-image-icon").siblings('.add-image-item').removeClass('active');
                            $('#addImgWarningApplyOtherFile').addClass('hide');
                        } else {
                            warningTip.say(data.message);
                        }
                    }
                    var addimg = reader.result;
                };
                reader.readAsDataURL(this.files[0]);
            } else {
                $('#addImgWarningApplyOtherFile').removeClass('hide');
            }
        }
    });

    // 警察证已经上传的图片 删除事件
    $('#applyMyPower_otherFile').on('click', '.aui-icon-delete-line', function (e) {
        e.stopPropagation();
        var father = $(this).closest('.add-image-item');
        father.remove();
        var $imgItem = $('#applyMyPower_otherFile').find('.add-image-item');
        if ($imgItem.length < 30) {
            $('#applyMyPower_otherFile .add-image-icon').removeClass('hide');
        }
        if ($imgItem.length === 0) {
            $('#applyMyPower_otherFile').addClass('center');
            $('#applyMyPower_otherFile').find('.add-image-icon').addClass('add-image-new');
            $('#applyMyPower_otherFile').find('.add-image-box-text').removeClass('hide');

            $("#applyMyPower_OtherFileComment").closest(".form-group").find("p.text-danger").addClass("hide");
        }
        $('#addImgWarningApplyOtherFile').addClass('hide');
    });

    // 警察证上传图片hover 显示中图
    showMiddleImg($('#applyMyPower_otherFile'), $('#applyUsePowerPage'), '.add-image-item .add-image-img');
    /***********************************************附件上传 end************************************************/

    //案件编号失去焦点事件
    $("#applyMyPower_dynamicNumber").on("blur", function () {
        var typeId = $("#applyTypeBtn").find(".btn.btn-primary").attr("typeId");
        if (typeId == '9') {
            typeId = $("#commonTypeSelect input[name=commonType]:checked").val();
        }
        if (typeId == '10') {
            return;
        }

        if ($.trim($(this).val()) != '') {
            if (typeId == '2' || typeId == '3' || typeId == '7') {
                var data = {
                    labh: $.trim($(this).val()),
                    applicationType: typeId == '7' ? $("#criticalTypeSelect input[name=criticalTypeSelect]:checked").val() : typeId
                },
                    getUrlSuccessFunc = function (data) {
                        if (data.code === '200') {
                            if (data.data) {
                                $("#applyUsePowerPage .applyName").removeClass("hide");
                                $("#applyUsePowerPage .applyComment").removeClass("hide");
                                if (typeId == '7') {
                                    $('#applyMyPower_event').attr("disabled", false).val(data.data.ajmc);
                                    $('#applyMyPower_reason').attr("disabled", false).val(data.data.zyaq);
                                } else {
                                    $('#applyMyPower_event').attr("disabled", "disabled").val(data.data.ajmc);
                                    $('#applyMyPower_reason').attr("disabled", "disabled").val(data.data.zyaq);
                                }
                                $('#applyMyPower_dynamicNumber').closest('.form-group').find('.text-danger.tip').addClass('hide');
                                $('#applyMyPower_event').closest('.form-group').find('.text-danger.tip').addClass('hide');
                                $('#applyMyPower_reason').closest('.form-group').find('.text-danger.tip').addClass('hide');
                            } else {
                                $('#applyMyPower_event').val('');
                                $('#applyMyPower_reason').val('');
                                $('#applyMyPower_dynamicNumber').closest('.form-group').find('.text-danger.tip').removeClass('hide').html('编号不正确');
                            }
                        } else {
                            $('#applyMyPower_event').val('');
                            $('#applyMyPower_reason').val('');
                            $('#applyMyPower_dynamicNumber').closest('.form-group').find('.text-danger.tip').removeClass('hide').html('立案编号获取事件信息失败，请重试');
                        }
                    }
                loadData('v3/myApplication/getCaseInfo', true, data, getUrlSuccessFunc);
            } else {
                var data = {
                    'code': $.trim($(this).val())
                },
                    getUrlSuccessFunc = function (data) {
                        if (data.code === '200') {
                            if (data.data) {
                                $("#applyUsePowerPage .applyName").removeClass("hide");
                                $("#applyUsePowerPage .applyComment").removeClass("hide");
                                $('#applyMyPower_event').attr("disabled", "disabled").val(data.data.eventName);
                                $('#applyMyPower_reason').attr("disabled", "disabled").val(data.data.comments);
                                $('#applyMyPower_event').closest('.form-group').find('.text-danger.tip').addClass('hide');
                                $('#applyMyPower_reason').closest('.form-group').find('.text-danger.tip').addClass('hide');
                                $('#applyMyPower_dynamicNumber').closest('.form-group').find('.text-danger.tip').addClass('hide');
                            } else {
                                $('#applyMyPower_event').val('');
                                $('#applyMyPower_reason').val('');
                                $('#applyMyPower_dynamicNumber').closest('.form-group').find('.text-danger.tip').removeClass('hide').html('编号不正确');
                            }
                        } else {
                            $('#applyMyPower_event').val('');
                            $('#applyMyPower_reason').val('');
                            $('#applyMyPower_dynamicNumber').closest('.form-group').find('.text-danger.tip').removeClass('hide').html('立案编号获取事件信息失败，请重试');
                        }
                    }
                loadData('v3/myApplication/getVirtualCaseInfo', true, data, getUrlSuccessFunc);
            }
        } else {
            // $("#applyUsePowerPage .applyName").addClass("hide");
            // $("#applyUsePowerPage .applyComment").addClass("hide");
            if (typeId != '7') {
                $('#applyMyPower_event').val('');
                $('#applyMyPower_reason').val('');
                $('#applyMyPower_dynamicNumber').closest('.form-group').find('.text-danger.tip').removeClass('hide').html('编号不能为空');
            } else {
                $('#applyMyPower_dynamicNumber').closest('.form-group').find('.text-danger.tip').addClass("hide");
            }
        }
    });

    //申请类型按钮切换事件
    $("#applyTypeBtn").on("click", ".btn", function () {
        if ($(this).hasClass("noclick")) {
            return;
        }
        var id = $(this).attr("typeId");
        $(this).addClass("btn-primary").siblings().removeClass("btn-primary");
        $(this).parents(".aui-col-24").siblings(".applyChose").addClass("hide");
        $("#applyUsePowerPage .applyFile").find(".aui-form-label.aui-form-require").html("证明材料");
        $("#applyUsePowerPage .applyName").removeClass("hide");
        $("#applyUsePowerPage .applyComment").removeClass("hide");
        //$("#applyUsePowerPage .static").removeClass("hide");
        $("#applyUsePowerPage .dynamic").removeClass("hide");
        $("#applyUsePowerPage .applyOtherFile").removeClass("hide");
        $("#applyUsePowerPage .applyOtherFileComment").removeClass("hide");
        $("#applyUsePowerPage .applyFile").removeClass("hide");

        $('#applyMyPower_event').attr("disabled", false);
        $('#applyMyPower_reason').attr("disabled", false);

        //每次切换获取申请人
        if (!allData) {
            $("#applyMyPower_approveDiv").find("#applyMyPower_approve,.dropdown").remove();
            $("#applyMyPower_approveDiv").prepend(`<select class="selectpicker" id="applyMyPower_approve" data-live-search="true" title="请选择审批人"></select>`);
            getPersonList($("#applyMyPower_approve"), 2, id);
            //每次切换获取权限和时间次数等
            getPowerApply(id);
        }
        //每次切换重置数据
        resetApplyData();

        $("#applyTypeBtn").find(".criticalTip").remove();
        $("#applyUsePowerPage").find("p.text-danger").not(".other").addClass("hide");
        $("#applyUsePowerPage .applyUseTypeTip").addClass("hide");
        $("#applyUsePowerPage .zbdw").addClass("hide");
        $("#applyUsePowerPage .commonType").addClass("hide");
        //$("#applyUsePowerPage .criticalType").removeClass("hide");
        $("#applyUsePowerPage .assistantType").removeClass("aui-col-24").addClass("aui-col-12");
        //document.querySelectorAll(".assistantTypeForm")[0].style.setProperty("width", "calc(100% - 6rem)", "important");

        switch (id) {
            case '1':
                //日常巡逻（只允许静态）
                $("#applyTypeBtn").next().html('');
                $("#applyUsePowerPage .dynamic").addClass("hide");
                $("#applyUsePowerPage .applyName").find(".aui-form-label").addClass('aui-form-require');
                break;
            case '2':
                //日常工作（显示工作内容）
                $("#applyTypeBtn").next().html('');
                $("#applyUsePowerPage .applyWorkType").removeClass("hide");
                $("#applyUsePowerPage .applyName").addClass("hide");
                $("#applyUsePowerPage .applyComment").addClass("hide");
                $("#applyUsePowerPage .applylabh").find(".aui-form-label").addClass("aui-form-require").html("警情编号");
                $("#applyMyPower_dynamicNumber").attr("placeholder", "请输入警情编号");
                $("#applyUsePowerPage .applySearchIdCard").removeClass("hide");
                $("#applyUsePowerPage .earmarkTip").html(`上传的材料不得包含涉密字眼`);
                //$("#applyUsePowerPage .applyName").find(".aui-form-label").removeClass('aui-form-require');
                break;
            case '3':
                //已立案(显示立案编号)
                $("#applyTypeBtn").next().html('');
                $("#applyUsePowerPage .applylabh").removeClass("hide");
                $("#applyUsePowerPage .applyName").addClass("hide");
                $("#applyUsePowerPage .applyName").find(".aui-form-label").addClass('aui-form-require');
                $("#applyUsePowerPage .applyComment").addClass("hide");
                $("#applyUsePowerPage .applylabh").find(".aui-form-label").addClass("aui-form-require").html("立案编号");
                $("#applyMyPower_dynamicNumber").attr("placeholder", "请输入立案编号");
                $("#applyUsePowerPage .applyFile").find(".aui-form-label.aui-form-require").html("立案文书");
                $("#applyUsePowerPage .applySearchIdCard").removeClass("hide");
                $("#applyUsePowerPage .earmarkTip").html(`上传的材料不得包含涉密字眼`);
                break;
            case '4':
                //专项工作(显示专案编号)
                $("#applyTypeBtn").next().html('经市局领导批准的专项工作、维稳工作、涉密案件、情报立线等特殊警务工作的申请模板');
                //$(".applylabh").removeClass("hide");
                // $(".applyName").addClass("hide");
                // $(".applyName").find(".aui-form-label").addClass('aui-form-require');
                // $(".applyComment").addClass("hide");
                //$(".applylabh").find(".aui-form-label").html("专案编号");
                //$("#applyUsePowerPage .zbdw").addClass("aui-col-24").removeClass("aui-col-12");
                //document.querySelectorAll(".abdwForm")[0].style.setProperty("width", "calc(50% - 6rem)", "important");
                $("#applyMyPower_dynamicNumber").attr("placeholder", "请输入专案编号，若无专案编号请联系管理员");
                //显示主办单位
                $("#applyUsePowerPage .zbdw").removeClass("hide");
                //上传附件和附件说明隐藏
                $("#applyUsePowerPage .applyOtherFile").addClass("hide");
                $("#applyUsePowerPage .applyOtherFileComment").addClass("hide");
                $("#applyUsePowerPage .earmarkTip").html(`上传的材料不得包含涉密字眼，此处上传市局领导审批的文件，如确实无相关文件的涉密案事件要有相关任务的
                <span id="earmarkTipDownload" style="font-weight:bold;cursor:pointer;text-decoration-line:underline;">说明材料</span>`);
                break;
            case '5':
                //特殊人员(显示待查人身份和待查人照片)
                $("#applyTypeBtn").next().html('查询敏感人员的使用的申请模板');
                $("#applyUsePowerPage .applyPhoto").removeClass("hide");
                $("#applyUsePowerPage .applyIdCard").removeClass("hide");
                //$("#applyUsePowerPage .criticalType").addClass("hide");
                $("#applyUsePowerPage .assistantType").addClass("aui-col-24").removeClass("aui-col-12");
                document.querySelectorAll(".assistantTypeForm")[0].style.setProperty("width", "calc(50% - 6rem)", "important");
                $("#applyUsePowerPage .applyName").find(".aui-form-label").addClass('aui-form-require');

                //上传附件和附件说明隐藏
                $("#applyUsePowerPage .applyOtherFile").addClass("hide");
                $("#applyUsePowerPage .applyOtherFileComment").addClass("hide");
                $("#applyUsePowerPage .earmarkTip").html(`上传的材料不得包含涉密字眼`);
                break;
            case '6':
                //外地人员使用（显示使用人警察证）
                $("#applyTypeBtn").next().html('协助外地公安开展警务工作的申请模板');
                $("#applyUsePowerPage .applyOtherPlaces").removeClass("hide");
                $("#applyUsePowerPage .applyName").find(".aui-form-label").addClass('aui-form-require');
                $("#applyUsePowerPage .earmarkTip").html(`此处上传立案文书或报警回执，上传的材料不得包含涉密类字眼`);
                break;
            case '7':
                //紧急
                $("#applyTypeBtn").next().html('涉及突发八类暴力案件、涉恐维稳事件、领导交办等紧急情况，填表后可直接使用，并需在2日内补办完相关审批手续');
                $("#criticalTypeSelectOne").click();
                $("#applyUsePowerPage .applylabh").removeClass("hide");
                $("#applyUsePowerPage .criticalTypeSelect").removeClass("hide");
                //$("#applyUsePowerPage .criticalType").addClass("hide");
                $("#applyUsePowerPage .dynamic").addClass("hide");
                //$("#applyUsePowerPage .static").addClass("hide");
                $("#applyUsePowerPage .applyOtherFile").addClass("hide");
                $("#applyUsePowerPage .applyOtherFileComment").addClass("hide");
                $("#applyUsePowerPage .applyFile").addClass("hide");
                $("#applyUsePowerPage .applylabh").find(".aui-form-label").html("警情编号").removeClass("aui-form-require");
                $("#applyMyPower_dynamicNumber").attr("placeholder", "请输入警情编号");

                // $(this).after(`<span class="criticalTip">紧急警务填完申请表后可直接使用， 并需在2日内补办完相关审批手续</span>`);
                break;
            case '9':
                //警情已立案
                $("#applyTypeBtn").next().html('针对2019年深警平台上线之前的警情、案件申请使用模块，其他警情、案件请到深警平台办理案件、已分流警情警种文书处发起申请');
                $("#commonTypeOne").click();
                $("#applyUsePowerPage .commonType").removeClass("hide");
                $("#applyUsePowerPage .applyWorkType").removeClass("hide");
                $("#applyUsePowerPage .applyName").addClass("hide");
                $("#applyUsePowerPage .applyComment").addClass("hide");
                $("#applyUsePowerPage .applylabh").find(".aui-form-label").addClass("aui-form-require").html("警情编号");
                $("#applyMyPower_dynamicNumber").attr("placeholder", "请输入警情编号");
                $("#applyUsePowerPage .applySearchIdCard").removeClass("hide");
                $("#applyUsePowerPage .earmarkTip").html(`上传的材料不得包含涉密字眼`);
                break;
        }
    });

    //警情已立案下面类型的改变
    $("#commonTypeSelect").on("change", "input[name=commonType]", () => {
        //$("#applyUsePowerPage").find("p.text-danger").not(".other").not(".repeat").not(".labh").addClass("hide");
        $("#applyUsePowerPage").find("p.text-danger").not(".other").addClass("hide");
        var value = $("#commonTypeSelect input[name=commonType]:checked").val();
        switch (value) {
            case '2':
                //日常工作（显示工作内容）
                $("#applyMyPower_dynamicNumber").val("");
                $("#applyUsePowerPage .applyWorkType").removeClass("hide");
                $("#applyUsePowerPage .applyName").addClass("hide");
                $("#applyUsePowerPage .applyComment").addClass("hide");
                $("#applyUsePowerPage .applylabh").find(".aui-form-label").addClass("aui-form-require").html("警情编号");
                $("#applyUsePowerPage .applySearchIdCard").find(".aui-form-label").html("被检索人身份证");
                $("#applyUsePowerPage .applyOtherFile").find(".aui-form-label").html("被检索人图片");
                $("#applyMyPower_dynamicNumber").attr("placeholder", "请输入警情编号");
                $("#applyUsePowerPage .applySearchIdCard").removeClass("hide");
                //$("#applyUsePowerPage .applyName").find(".aui-form-label").removeClass('aui-form-require');
                break;
            case '3':
                //已立案(显示立案编号)
                $("#applyMyPower_dynamicNumber").val("");
                $("#applyUsePowerPage .applyWorkType").addClass("hide");
                $("#applyUsePowerPage .applylabh").removeClass("hide");
                $("#applyUsePowerPage .applyName").addClass("hide");
                $("#applyUsePowerPage .applyName").find(".aui-form-label").addClass('aui-form-require');
                $("#applyUsePowerPage .applyComment").addClass("hide");
                $("#applyUsePowerPage .applylabh").find(".aui-form-label").addClass("aui-form-require").html("立案编号");
                $("#applyMyPower_dynamicNumber").attr("placeholder", "请输入立案编号");
                $("#applyUsePowerPage .applySearchIdCard").find(".aui-form-label").html("被检索人身份证");
                $("#applyUsePowerPage .applyOtherFile").find(".aui-form-label").html("被检索人图片");
                $("#applyUsePowerPage .applyFile").find(".aui-form-label.aui-form-require").html("立案文书");
                $("#applyUsePowerPage .applySearchIdCard").removeClass("hide");
                break;
            case '10':
                //在逃人员(显示在逃编号)
                $("#applyMyPower_dynamicNumber").val("");
                $('#applyMyPower_event').attr("disabled", false).val("");
                $('#applyMyPower_reason').attr("disabled", false).val("");
                $("#applyUsePowerPage .applyWorkType").addClass("hide");
                $("#applyUsePowerPage .applylabh").removeClass("hide");
                $("#applyUsePowerPage .applyName").removeClass("hide");
                $("#applyUsePowerPage .applyName").find(".aui-form-label").addClass('aui-form-require');
                $("#applyUsePowerPage .applyComment").removeClass("hide");
                $("#applyUsePowerPage .applylabh").find(".aui-form-label").addClass("aui-form-require").html("在逃编号");
                $("#applyMyPower_dynamicNumber").attr("placeholder", "请输入在逃编号");
                $("#applyUsePowerPage .applySearchIdCard").find(".aui-form-label").html("在逃人身份证");
                $("#applyUsePowerPage .applyOtherFile").find(".aui-form-label").html("在逃人图片");
                $("#applyUsePowerPage .applyFile").find(".aui-form-label.aui-form-require").html("案件文书");
                $("#applyUsePowerPage .applySearchIdCard").removeClass("hide");
                break;
        }
    });

    //紧急类型下面类型的改变
    $("#criticalTypeSelect").on("change", "input[name=criticalTypeSelect]", () => {
        var value = $("#criticalTypeSelect input[name=criticalTypeSelect]:checked").val();
        $('#applyMyPower_dynamicNumber').closest('.form-group').find('.text-danger.tip').addClass("hide");
        switch (value) {
            //警情
            case '2':
                $("#applyUsePowerPage .applylabh").removeClass("hide");
                $("#applyUsePowerPage .applylabh").find(".aui-form-label").html("警情编号");
                $("#applyMyPower_dynamicNumber").val("");
                $("#applyMyPower_dynamicNumber").attr("placeholder", "请输入警情编号");
                $('#applyMyPower_event').val("");
                $('#applyMyPower_reason').val("");
                $("#applyUsePowerPage .applyFile").find(".aui-form-label.aui-form-require").html("证明材料");
                break;
            //已立案
            case '3':
                $("#applyUsePowerPage .applylabh").removeClass("hide");
                $("#applyUsePowerPage .applylabh").find(".aui-form-label").html("立案编号");
                $("#applyMyPower_dynamicNumber").val("");
                $("#applyMyPower_dynamicNumber").attr("placeholder", "请输入立案编号");
                $('#applyMyPower_event').val("");
                $('#applyMyPower_reason').val("");
                $("#applyUsePowerPage .applyFile").find(".aui-form-label.aui-form-require").html("立案文书");
                break;
            case '4':
            case '8':
                $("#applyUsePowerPage .applylabh").addClass("hide");
                $("#applyUsePowerPage .applyFile").find(".aui-form-label.aui-form-require").html("证明材料");
                break;
        }
    });

    //可使用次数值改变事件
    $(".applyMyPowerCount").on("blur", function () {
        $(this).parent().find('.tip1').addClass('hide');
        var id = $("#applyTypeBtn").find(".btn.btn-primary").attr("typeId");
        if ($(this).val() != '' && id !== '4') {
            if ($(this).val() < 1) {
                $(this).val(1);
            } else if ($(this).val() > 100) {
                $(this).val(100);
                $(this).parent().find('.tip1').removeClass('hide').text('最大申请数：100');
            }
        } else if (id == '4') {
            if ($(this).val() < 1) {
                $(this).val(1);
            } else if ($(this).val() > 10000) {
                $(this).val(10000);
                $(this).parent().find('.tip1').removeClass('hide').text('最大申请数：10000');
            }
        }
    });

    //确认按钮点击事件
    $("#applySure").on("click", function () {
        $("#applyUsePowerPage").find("p.text-danger").not(".other").not(".repeat").not(".labh").addClass("hide");
        $(".applyUseTypeTip").addClass("hide");
        var comments = $.trim($("#applyMyPower_reason").val()), //任务详情
            incident = $.trim($("#applyMyPower_event").val()), //任务名称
            approver = $("#applyMyPower_approve").val(), //审批人
            applicationType = $("#applyTypeBtn").find(".btn.btn-primary").attr("typeId"), //申请类型
            writUrl = $("#uploadResultApply").data("docUrl") ? $("#uploadResultApply").data("docUrl") : '',
            applications = [], //申请内容
            xbUserIds = $('#applyMyPower_assistant').data('noticeUserList'),
            //applicationLevel = $("#applyUsePowerPage .criticalTypeRadio").find("input[name='criticalType']:checked").val(),  //紧急类型
            attachments = [], //附件数组(包括协办人警察证)
            applicationImgs = []; //检索人数组

        //警情已立案
        if (applicationType == '9') {
            applicationType = $("#commonTypeSelect input[name=commonType]:checked").val();
        }
        var dataApply = {
            applicationType,
            comments,
            incident,
            approver,
            writUrl,
            applications,
            xbUserIds,
            //applicationLevel,
            attachments,
            applicationImgs
        };

        var applicationsObjStatic = {}, //静态数据
            applicationsObjDynamic = {}, //动态数据
            controlFlag = true;
        //校验任务名称
        if (!dataApply.incident && dataApply.applicationType != 2) { //任务名称
            $('#applyMyPower_event').closest('.form-group').find('.text-danger.tip').addClass("hide");
            $('#applyMyPower_event').closest('.form-group').find('.text-danger.tip').not(".repeat").removeClass('hide');
            controlFlag = false;
        } else if (!$('#applyMyPower_event').closest('.form-group').find('.text-danger.tip.repeat').hasClass('hide')) { //名字重复
            controlFlag = false;
        }

        //检验任务详情
        if (!dataApply.comments) { //任务详情
            $('#applyMyPower_reason').closest('.form-group').find('.text-danger.tip').removeClass('hide');
            controlFlag = false;
        }

        //检验审批人
        if (!dataApply.approver) { //审批人
            $('#applyMyPower_approve').closest('.form-group').find('.text-danger.tip').removeClass('hide');
            controlFlag = false;
        }

        //检验证明材料
        if (!dataApply.writUrl && dataApply.applicationType != 7) {
            $("#applyMyPower_dynamicAnnex").closest('.control-form').find('.text-danger').addClass('hide');
            $("#applyMyPower_dynamicAnnex").closest(".form-group").find("p.text-danger").removeClass("hide").html(`请上传${$("#applyMyPower_dynamicAnnex").closest(".form-group").find(".control-label").html()}`);
            controlFlag = false;
        }

        switch (dataApply.applicationType) {
            //日常巡逻
            case '1':
                // applicationsObjStatic.startUseDate = $("#applyStaticStart").val();
                // applicationsObjStatic.endUseDate = $("#applyStaticEnd").val();
                //applicationsObjStatic.limitCount = $("#applyMyPower_staticCount").val() ? parseInt($("#applyMyPower_staticCount").val()) : '';
                // if (!applicationsObjStatic.startUseDate && !applicationsObjStatic.endUseDate) {
                //     $("#applyMyPower_staticDate").closest(".form-group").find("p.text-danger-one").addClass("hide");
                //     $("#applyMyPower_staticDate").closest(".form-group").find("p.text-danger-all").removeClass("hide");
                //     controlFlag = false;
                // } else {
                //     controlFlag = checkFlag('1', applicationsObjStatic, controlFlag);
                // }
                break;
            //日常工作
            case '2':
                //工作内容
                dataApply.labh = $("#applyMyPower_dynamicNumber").val();
                dataApply.applicationRcgzType = $("#applyTypeRadio").find("label.ui-checkboxradio-checked").next().val();
                // applicationsObjStatic.startUseDate = $("#applyStaticStart").val();
                // applicationsObjStatic.endUseDate = $("#applyStaticEnd").val();
                //applicationsObjStatic.limitCount = $("#applyMyPower_staticCount").val() ? parseInt($("#applyMyPower_staticCount").val()) : '';

                applicationsObjStatic.startUseDate = $("#applyDynamicStart").val();
                applicationsObjStatic.endUseDate = $("#applyDynamicEnd").val();

                applicationsObjDynamic.startUseDate = $("#applyDynamicStart").val();
                applicationsObjDynamic.endUseDate = $("#applyDynamicEnd").val();
                //applicationsObjDynamic.limitCount = $("#applyMyPower_dynamicCount").val() ? parseInt($("#applyMyPower_dynamicCount").val()) : '';

                //立案编号
                if (!$('#applyMyPower_dynamicNumber').closest('.form-group').find('.text-danger.tip').hasClass('hide')) {
                    controlFlag = false;
                }

                if (!dataApply.labh) {
                    $('#applyMyPower_dynamicNumber').closest('.form-group').find('.text-danger.tip').removeClass('hide').html('编号不能为空');
                    controlFlag = false;
                }

                //静态动态必须选一个填写
                //if (!applicationsObjStatic.startUseDate && !applicationsObjStatic.endUseDate && !applicationsObjDynamic.startUseDate && !applicationsObjDynamic.endUseDate) {
                if (!applicationsObjDynamic.startUseDate && !applicationsObjDynamic.endUseDate) {
                    $(".applyUseTypeTip").removeClass("hide");
                    controlFlag = false;
                } else {
                    //controlFlag = checkFlag('1', applicationsObjStatic, controlFlag);
                    controlFlag = checkFlag('2', applicationsObjDynamic, controlFlag);
                }

                $('#applyMyPower_otherFile').find('.add-image-img').each(function (index) {
                    var otherFileObj = {};
                    otherFileObj.url = $(this).attr('porturl');
                    dataApply.applicationImgs.push(otherFileObj);
                });

                //检索人身份证
                if ($.trim($("#applyMyPower_idcards").val())) {
                    var searchIdCardArr = $("#applyMyPower_idcards").val().split(/[,，]/);
                    searchIdCardArr.forEach((val) => {
                        var idCardObj = {};
                        idCardObj.idcard = val;

                        dataApply.applicationImgs.push(idCardObj);
                    })
                }

                if (dataApply.applicationImgs.length > 30) {
                    controlFlag = false;
                    $("#applyMyPower_otherFile").closest(".form-group").find('.text-danger.more').removeClass('hide').html('被检索人图片和身份证总共不能超过30张');
                } else if (dataApply.applicationImgs.length == 0) {
                    controlFlag = false;
                    $("#applyMyPower_otherFile").closest(".form-group").find('.text-danger.more').removeClass('hide').html('被检索人身份证或图片至少上传一个');
                }
                break;
            //已立案
            case '3':
            case '10':
                //立案编号
                dataApply.labh = $("#applyMyPower_dynamicNumber").val();
                // applicationsObjStatic.startUseDate = $("#applyStaticStart").val();
                // applicationsObjStatic.endUseDate = $("#applyStaticEnd").val();
                //applicationsObjStatic.limitCount = $("#applyMyPower_staticCount").val() ? parseInt($("#applyMyPower_staticCount").val()) : '';

                applicationsObjStatic.startUseDate = $("#applyDynamicStart").val();
                applicationsObjStatic.endUseDate = $("#applyDynamicEnd").val();

                applicationsObjDynamic.startUseDate = $("#applyDynamicStart").val();
                applicationsObjDynamic.endUseDate = $("#applyDynamicEnd").val();
                //applicationsObjDynamic.limitCount = $("#applyMyPower_dynamicCount").val() ? parseInt($("#applyMyPower_dynamicCount").val()) : '';

                //立案编号
                if (!$('#applyMyPower_dynamicNumber').closest('.form-group').find('.text-danger.tip').hasClass('hide')) {
                    controlFlag = false;
                }

                if (!dataApply.labh) {
                    $('#applyMyPower_dynamicNumber').closest('.form-group').find('.text-danger.tip').removeClass('hide').html('编号不能为空');
                    controlFlag = false;
                }

                //静态动态必须选一个填写
                //if (!applicationsObjStatic.startUseDate && !applicationsObjStatic.endUseDate && !applicationsObjDynamic.startUseDate && !applicationsObjDynamic.endUseDate) {
                if (!applicationsObjDynamic.startUseDate && !applicationsObjDynamic.endUseDate) {
                    $(".applyUseTypeTip").removeClass("hide");
                    controlFlag = false;
                } else {
                    //controlFlag = checkFlag('1', applicationsObjStatic, controlFlag);
                    controlFlag = checkFlag('2', applicationsObjDynamic, controlFlag);
                }

                $('#applyMyPower_otherFile').find('.add-image-img').each(function (index) {
                    var otherFileObj = {};
                    otherFileObj.url = $(this).attr('porturl');
                    dataApply.applicationImgs.push(otherFileObj);
                });

                //检索人身份证
                if ($.trim($("#applyMyPower_idcards").val())) {
                    var searchIdCardArr = $("#applyMyPower_idcards").val().split(/[,，]/);
                    searchIdCardArr.forEach((val) => {
                        var idCardObj = {};
                        idCardObj.idcard = val;

                        dataApply.applicationImgs.push(idCardObj);
                    })
                }

                if (dataApply.applicationImgs.length > 30) {
                    controlFlag = false;
                    $("#applyMyPower_otherFile").closest(".form-group").find('.text-danger.more').removeClass('hide').html(`${dataApply.applicationType == 3 ? '被检索人图片和身份证总共不能超过30张' : '在逃人图片和身份证总共不能超过30张'}`);
                } else if (dataApply.applicationImgs.length == 0) {
                    controlFlag = false;
                    $("#applyMyPower_otherFile").closest(".form-group").find('.text-danger.more').removeClass('hide').html(`${dataApply.applicationType == 3 ? '被检索人身份证或图片至少上传一个' : '在逃人身份证或图片至少上传一个'}`);
                }
                break;
            //专项工作
            case '4':
                dataApply.zbdw = $("#applyMyPower_zbdw").val();
                // applicationsObjStatic.startUseDate = $("#applyStaticStart").val();
                // applicationsObjStatic.endUseDate = $("#applyStaticEnd").val();
                //applicationsObjStatic.limitCount = $("#applyMyPower_staticCount").val() ? parseInt($("#applyMyPower_staticCount").val()) : '';

                applicationsObjStatic.startUseDate = $("#applyDynamicStart").val();
                applicationsObjStatic.endUseDate = $("#applyDynamicEnd").val();

                applicationsObjDynamic.startUseDate = $("#applyDynamicStart").val();
                applicationsObjDynamic.endUseDate = $("#applyDynamicEnd").val();
                //applicationsObjDynamic.limitCount = $("#applyMyPower_dynamicCount").val() ? parseInt($("#applyMyPower_dynamicCount").val()) : '';

                //静态动态必须选一个填写
                //if (!applicationsObjStatic.startUseDate && !applicationsObjStatic.endUseDate && !applicationsObjDynamic.startUseDate && !applicationsObjDynamic.endUseDate) {
                if (!applicationsObjDynamic.startUseDate && !applicationsObjDynamic.endUseDate) {
                    $(".applyUseTypeTip").removeClass("hide");
                    controlFlag = false;
                } else {
                    //controlFlag = checkFlag('1', applicationsObjStatic, controlFlag);
                    controlFlag = checkFlag('2', applicationsObjDynamic, controlFlag);
                }

                //校验主办单位
                if (!dataApply.zbdw) {
                    controlFlag = false;
                    $("#applyMyPower_zbdw").closest(".form-group").find(".text-danger.tip").removeClass("hide");
                }
                break;
            case '5':
                dataApply.searchedIdcard = $("#applyMyPower_idCard").val();
                dataApply.searchedName = $("#applyMyPower_name").val();
                var urlArr = $("#specialPhoto").find(".pic-add-img").attr("src").split("//"),
                    portUrl = urlArr[1] ? urlArr[1].substring(urlArr[1].indexOf("/") + 1) : '';
                dataApply.searchedUrl = portUrl;

                // applicationsObjStatic.startUseDate = $("#applyStaticStart").val();
                // applicationsObjStatic.endUseDate = $("#applyStaticEnd").val();
                //applicationsObjStatic.limitCount = $("#applyMyPower_staticCount").val() ? parseInt($("#applyMyPower_staticCount").val()) : '';

                applicationsObjStatic.startUseDate = $("#applyDynamicStart").val();
                applicationsObjStatic.endUseDate = $("#applyDynamicEnd").val();

                applicationsObjDynamic.startUseDate = $("#applyDynamicStart").val();
                applicationsObjDynamic.endUseDate = $("#applyDynamicEnd").val();
                //applicationsObjDynamic.limitCount = $("#applyMyPower_dynamicCount").val() ? parseInt($("#applyMyPower_dynamicCount").val()) : '';

                //特殊人员
                if (!dataApply.searchedIdcard || !dataApply.searchedUrl) {
                    $('#applyMyPower_idCard').closest('.form-group').find('.text-danger.tip').removeClass('hide');
                    controlFlag = false;
                }

                //静态动态必须选一个填写
                // if (!applicationsObjStatic.startUseDate && !applicationsObjStatic.endUseDate && !applicationsObjDynamic.startUseDate && !applicationsObjDynamic.endUseDate) {
                if (!applicationsObjDynamic.startUseDate && !applicationsObjDynamic.endUseDate) {
                    $(".applyUseTypeTip").removeClass("hide");
                    controlFlag = false;
                } else {
                    //controlFlag = checkFlag('1', applicationsObjStatic, controlFlag);
                    controlFlag = checkFlag('2', applicationsObjDynamic, controlFlag);
                }
                //特殊人员没有紧急类型
                //delete applicationsObjStatic.criticalType;
                break;
            //外地人使用
            case '6':
                //使用人警察证
                // 本地添加图片
                $('#applyMyPower_warrantCard').find('.add-image-img').each(function (index) {
                    var attachmentsObj = {};
                    attachmentsObj.attachmentUrl = $(this).attr('porturl');
                    attachmentsObj.type = '1';
                    dataApply.attachments.push(attachmentsObj);
                });

                // applicationsObjStatic.startUseDate = $("#applyStaticStart").val();
                // applicationsObjStatic.endUseDate = $("#applyStaticEnd").val();
                //applicationsObjStatic.limitCount = $("#applyMyPower_staticCount").val() ? parseInt($("#applyMyPower_staticCount").val()) : '';

                applicationsObjStatic.startUseDate = $("#applyDynamicStart").val();
                applicationsObjStatic.endUseDate = $("#applyDynamicEnd").val();

                applicationsObjDynamic.startUseDate = $("#applyDynamicStart").val();
                applicationsObjDynamic.endUseDate = $("#applyDynamicEnd").val();
                //applicationsObjDynamic.limitCount = $("#applyMyPower_dynamicCount").val() ? parseInt($("#applyMyPower_dynamicCount").val()) : '';

                //警察证照片
                if (dataApply.attachments.length < 2) {
                    $('#applyMyPower_warrantCard').closest('.form-group').find('.text-danger.tip').removeClass('hide');
                    controlFlag = false;
                }

                //静态动态必须选一个填写
                //if (!applicationsObjStatic.startUseDate && !applicationsObjStatic.endUseDate && !applicationsObjDynamic.startUseDate && !applicationsObjDynamic.endUseDate) {
                if (!applicationsObjDynamic.startUseDate && !applicationsObjDynamic.endUseDate) {
                    $(".applyUseTypeTip").removeClass("hide");
                    controlFlag = false;
                } else {
                    //controlFlag = checkFlag('1', applicationsObjStatic, controlFlag);
                    controlFlag = checkFlag('2', applicationsObjDynamic, controlFlag);
                }

                //附件和说明
                $('#applyMyPower_otherFile').find('.add-image-img').each(function (index) {
                    var otherFileObj = {};
                    otherFileObj.attachmentUrl = $(this).attr('porturl');
                    otherFileObj.type = '3';
                    dataApply.attachments.push(otherFileObj);
                });

                dataApply.attachmentsDesc = $.trim($("#applyMyPower_OtherFileComment").val());
                //校验附件说明（上传附件要写附件说明）
                if (dataApply.attachments.length > 0 && dataApply.attachmentsDesc == '') {
                    controlFlag = false;
                    $("#applyMyPower_OtherFileComment").closest(".form-group").find("p.text-danger").removeClass("hide");
                }
                break;
            //紧急
            case '7':
                //编号
                dataApply.labh = $("#applyUsePowerPage .applylabh").hasClass("hide") ? '' : $("#applyMyPower_dynamicNumber").val();
                dataApply.type = $("#criticalTypeSelect input[name=criticalTypeSelect]:checked").val();
                var criticalFileObj = {};
                criticalFileObj.attachmentUrl = dataApply.writUrl;
                criticalFileObj.type = '2';
                dataApply.attachments.push(criticalFileObj);
                break;
        }

        if (JSON.stringify(applicationsObjStatic) != "{}" && (applicationsObjStatic.startUseDate != '' || applicationsObjStatic.endUseDate != '')) {
            applicationsObjStatic.type = '1';
            dataApply.applications.push(applicationsObjStatic);
        }

        if (JSON.stringify(applicationsObjDynamic) != "{}" && (applicationsObjDynamic.startUseDate != '' || applicationsObjDynamic.endUseDate != '')) {
            applicationsObjDynamic.type = '2';
            dataApply.applications.push(applicationsObjDynamic);
        }

        if (controlFlag) {
            var portUrl = 'v3/myApplication/application';
            if (dataApply.applicationType == '7') {
                portUrl = 'v3/myApplication/applicationExigence';
            }

            var getUrlSuccessFunc = function (data) {
                if (data.code === '200') {
                    $(".applyUse-new-popup").addClass("hide");
                    $('.applyUse-new-popup').data("allData", "");
                    if ($("#pageSidebarMenu").find(".aui-icon-customers2").closest("li").hasClass("active")) { //在我的申请里面新建要刷新列表
                        loadPage($("#myApplyContainer"), './facePlatform/myApply.html');
                    }
                    warningTip.say("申请权限成功", 1);
                } else {
                    warningTip.say(data.message);
                }
            }
            loadData(portUrl, true, dataApply, getUrlSuccessFunc);
        }
    });

    //取消以及关闭按钮点击事件
    $("#applyCanel,#closeApplyPage").on("click", function () {
        $(".applyUse-new-popup").addClass("hide");
        $('.applyUse-new-popup').data("allData", "");
        $('.applyUse-new-popup').data("type", "");
        $('.applyUse-new-popup').data("from", "");
    });

    // 公开范围按人 输入框点击事件 调用树组件
    $('#applyMyPower_assistant').orgTree({
        all: true, //人物组织都开启
        area: ['620px', '542px'], //弹窗框宽高
        search: true, // 搜索事件不在orgTree
        newBk: true,
        noMap: true,
        noTree: true,
        ajaxFilter: false,
        node: 'applyMyPower_assistant'
    });

    // 公开范围按人 删除按钮事件
    $('#applyMyPower_assistant').siblings().on('click', function () {
        if ($('#applyMyPower_assistant').attr('disabled') == 'disabled') {
            return
        }
        $('#applyMyPower_assistant').val('');
        $('#applyMyPower_assistant').attr('title', '');
        $('#applyMyPower_assistant').data({
            'saveVal': [],
            'noticeUserList': [],
            'userIdArr': []
        })
    });

    // 公开范围按人 点击事件
    $('#applyMyPower_assistant').on('click', function () {
        var $inputBox = $(this);
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
            isMySelf: 2,
            page: '1',
            size: '15'
        }
        controlOpt.page = '1';
        var searchPage = 2;
        // controlOpt.orgids = orgids;
        // 告警可见人
        var receivePort = 'v3/myApplication/csrxRoleUsers';
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
                        if (allData.xbUserIds) {
                            $inputBox.data({
                                'userIdArr': []
                            });
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
                                                isMySelf: 2,
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
                                isMySelf: 2
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
    })

    //专项工作说明文档下载
    $("#applyUsePowerPage").on("click", "#earmarkTipDownload", function () {
        var post_url = encodeURI(serviceUrl + "/v2/file/downloadByHttpUrl?name=" + encodeURI(encodeURI(decodeURIComponent('证明材料模板', true))) + "&url=http://190.13.37.6:10085/production/lawFile/202004/08/2020040819246789.doc");
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });
})(window, window.jQuery);