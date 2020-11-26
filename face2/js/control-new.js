(function (window, $) {
    $(function () {
        // var controlEnableEdit = '1';
        var faceLibData = []; // 库标签数据
        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });
        $('[data-role="checkbox"]').checkboxradio();

        // 生成灰色遮罩层初始化
        // $('.popup-panel').removeClass('hide');

        // 加载动画初始化
        //showLoading($('.layout-type2.control-new-card .aui-card'));

        /**
         * 阈值滑块初始化 设置最低值为60
         */
        function createSlider() {
            var sliderValue = controlIdResult && controlIdResult.threshold !== '' ? controlIdResult.threshold : 90;
            var slider2 = $("#slider2").slider({
                orientation: "horizontal",
                range: "min",
                max: 99,
                min: 90,
                value: sliderValue,
                create: function (event, ui) {
                    $("#sliderMin2").text(90);
                    $("#sliderMax2").text(99);
                },
                slide: function (event, ui) {
                    $("#sliderInput2").val(ui.value);
                }
            });
            $('#sliderInput2').val(sliderValue);
            //新建布控 阈值滑块 输入事件
            $("#sliderInput2").on("change", function () {
                if (!(+$(this).val()) || ((+$(this).val()) <= 1)) {
                    $(this).val('90');
                }
                if (parseInt($(this).val()) > 99 || parseInt($(this).val()) < 90) {
                    $(this).val('90');
                }

                var reg = /^\d+$/;
                if ($(this).val()) {
                    if (!reg.test($(this).val())) {
                        $(this).val('90');
                    }
                }
                slider2.slider("value", $(this).val());
            });
        }

        /**
         * 数据获取 库列表初始化
         */
        function createLibList() {
            var portData = {
                type: 3,
            },
                successFunc = function (data) {
                    if (data.code === '200') {
                        faceLibData = data.data; // 人脸库数据
                        var faceLibSelect = [],
                            faceLibHtml = '';
                        // 插入人脸库数据和节点
                        faceLibData.forEach(v => {
                            faceLibHtml += `<option value="${v.libId}" type="1">${v.libName}</option>`;
                            if (controlId && controlIdResult.libId && controlIdResult.libId.length > 0) {
                                if (controlIdResult.libId == v.libId) {
                                    faceLibSelect.push(v.libId);
                                }
                            }
                        });
                        $('#control_libId').append(faceLibHtml);
                        if (faceLibSelect.length > 0) {
                            $('#control_libId').selectpicker('val', faceLibSelect);
                            $('#control_libId').selectpicker('render');
                            if ($('.control-new-popup').data('controlType') == 'edit') {
                                $('#control_libId').attr("disabled", "disabled");
                                $('#control_libId').selectpicker('refresh');
                            } else {
                                $('#control_libId').removeAttr("disabled");
                                $('#control_libId').selectpicker('refresh');
                            }
                        } else {
                            $('#control_libId').selectpicker({
                                'noneSelectedText': '请选择库',
                                'val': faceLibSelect,
                            });
                            $('#control_labelId').selectpicker({
                                'noneSelectedText': '请选择标签'
                            });
                            $('#control_labelId').attr("disabled", "disabled");
                            $("#control_labelId").selectpicker('refresh');
                        }

                        if ($("#control_imgList").data("picForm") == 'portraitCard') { //该新建来自人员库，库标签赋值且不可点击
                            $('#control_libId').selectpicker('val', $("#control_imgList").data("portraitLibId"));
                            $('#control_libId').attr("disabled", "disabled");
                        }

                        $('#control_libId').selectpicker('refresh');
                    }
                    //hideLoading($('.layout-type2.control-new-card .aui-card'));
                };
            loadData('v3/lib/getAccesslibList', true, portData, successFunc, '', 'GET');
        };

        $('#control_libId').off('change').on('change', function () {
            var libIdVal = $(this).selectpicker('val'),
                libIdType = ""; // 库可布控类别：1.一级标签布控 2.二级标签布控 3.临时布控
            faceLibData.forEach(function (el, i) {
                if (el.libId == libIdVal) {
                    libIdType = el.type;
                }
            })
            if (libIdType === "3") {
                $('#selectObject').removeClass('hide');
            } else if (libIdType === "2") {
                $('#selectObject').addClass('hide');
            } else if (libIdType === "1") {
                $('#selectObject').addClass('hide');
                libIdVal = "";
            }
            createTypeLevel(libIdVal); // 二级布控有标签
        })

        /**
         * 数据获取 标签类型初始化
         */
        function createTypeLevel(libId) {
            var infoPort = 'v3/label/getLabelByLibId',
                infoData1 = {
                    "libId": libId
                },
                infoPortSuccessFunc1 = function (data) {
                    if (data.code === '200') {
                        var RX_BKPLAT_Html = "",
                            selectedLabelId = '';
                        if (data.data.length > 0) {
                            data.data.forEach(function (item) {
                                var selected = '';
                                if (controlId && controlIdResult && item.labelId == controlIdResult.labelId) {
                                    selectedLabelId = item.labelId;
                                }
                                RX_BKPLAT_Html += `<option value="${item.labelId}">${item.labelName}</option>`
                            })
                            $("#control_labelId").html(RX_BKPLAT_Html);
                            $('#control_labelId').selectpicker({
                                'noneSelectedText': '请选择标签',
                                'val': selectedLabelId
                            });
                            $('#control_labelId').selectpicker('render');
                            if ($('.control-new-popup').data('controlType') == 'edit') {
                                $('#control_labelId').attr("disabled", "disabled");
                            } else {
                                $('#control_labelId').removeAttr("disabled");
                            }
                        } else {
                            $("#control_labelId").html(RX_BKPLAT_Html);
                            $('#control_labelId').selectpicker({
                                'noneSelectedText': '当前库暂无标签'
                            });
                            $('#control_labelId').attr("disabled", "disabled");
                        }

                        if ($("#control_imgList").data("picForm") == 'portraitCard') { //该新建来自人员库，库标签赋值且不可点击
                            $('#control_labelId').selectpicker('val', $("#control_imgList").data("portraitLabelId"));
                            $('#control_labelId').attr("disabled", "disabled");
                        }

                        $("#control_labelId").selectpicker('refresh');
                    }
                };
            if (libId) {
                loadData(infoPort, true, infoData1, infoPortSuccessFunc1, '', 'GET');
            } else {
                $("#control_labelId").html('');
                $('#control_labelId').selectpicker({
                    'noneSelectedText': '当前库暂无标签'
                });
                $('#control_labelId').attr("disabled", "disabled");
                $('#control_labelId').selectpicker('refresh');
            }
        }

        /**
         * 数据获取 按人布控检索图片初始化
         */
        function controlFindIdcard() {
            var card = $("#control_IDSearch").val();
            var reg = /(^\d{15}$)|(^\d{17}(\d|X)$)/;
            if (reg.test(card) == false) {
                warningTip.say('输入身份证号码有误，请重新输入');
                return false;
            } else {
                $('#selectObject').find('.text-danger.mg-top-xs').addClass('hide');
            }
            var $imgItem = $('#control_imgList').find('.add-image-item');
            var port = 'v2/faceRecog/findImageByIdCard',
                data = {
                    idcard: card
                },
                successFunc = function (data) {
                    if (data.code == '200') {
                        var html = `
                        <div class="add-image-item">
                            <img class="add-image-img" src="data:image/png;base64,${data.base64}" alt="">
                            <i class="aui-icon-delete-line"></i>
                        </div> 
                        `;
                        $('#control_imgList').find('.add-image-icon').before(html);
                        if ($imgItem.length == 7) {
                            $('#control_imgList .add-image-icon').addClass('hide');
                        }
                        $('#control_imgList').removeClass('center');
                        $('#control_imgList').find('.add-image-icon').removeClass('add-image-new');
                        $('#control_imgList').find('.add-image-box-text').addClass('hide');
                        $("#control_imgList .add-image-icon").siblings('.add-image-item').removeClass('active');
                        $('#addImgWarning').addClass('hide');

                    } else {
                        warningTip.say(data.message);
                        $(".idcard-alert").addClass("show").text(data.message);
                    }
                };
            if ($imgItem.length < 8) {
                loadData(port, true, data, successFunc, '', 'GET', sourceType == 'ga' ? serviceUrlOther : '');
            } else {
                warningTip.say('布控人数最大为8人！');
            }
        }

        /**
         * 布控区域列表模式OR公开范围 初始化过程 的 数据转换功能
         * @param {array} list // 获取的机构列表数据
         * @param {array} org  // 布控详情数据中 已选机构id数组
         */
        function matchList(list, org) {
            var newObj = {};
            var newCameraList = [];
            var newNameArr = [];
            var newGidArr = [];
            if (list && list.length > 0) {
                list.forEach(function (item) {
                    org.forEach(function (el) {
                        if (item.orgId == el.orgId) {
                            itemObj = {
                                id: item.orgId,
                                name: item.orgName,
                                scode: item.orgCode
                            };
                            newCameraList.push(itemObj);
                            newNameArr.push(item.orgName);
                            newGidArr.push(item.orgId);
                        }
                    })
                });
            }
            newObj = {
                newCameraList: newCameraList,
                newNameArr: newNameArr,
                newGidArr: newGidArr
            }
            return newObj;
        }

        /**
         * 布控期限 改变时间标签的激活状态
         */
        function changeActive(_counts) {
            if (_counts === 3) {
                // 三天 单选激活 
                $('#time-label-three-days').addClass('ui-checkboxradio-checked ui-state-active');
                $('#time-label-oneweek-days').removeClass('ui-checkboxradio-checked ui-state-active');
                $('#time-label-halfmonth-days').removeClass('ui-checkboxradio-checked ui-state-active');
            } else if (_counts === 7) {
                // 七天 单选激活 
                $('#time-label-three-days').removeClass('ui-checkboxradio-checked ui-state-active');
                $('#time-label-oneweek-days').addClass('ui-checkboxradio-checked ui-state-active');
                $('#time-label-halfmonth-days').removeClass('ui-checkboxradio-checked ui-state-active');
            } else if (_counts === 15) {
                // 半个月 单选激活 
                $('#time-label-three-days').removeClass('ui-checkboxradio-checked ui-state-active');
                $('#time-label-oneweek-days').removeClass('ui-checkboxradio-checked ui-state-active');
                $('#time-label-halfmonth-days').addClass('ui-checkboxradio-checked ui-state-active');
            } else {
                // 所有单选不激活 
                $('#time-label-three-days').removeClass('ui-checkboxradio-checked ui-state-active');
                $('#time-label-oneweek-days').removeClass('ui-checkboxradio-checked ui-state-active');
                $('#time-label-halfmonth-days').removeClass('ui-checkboxradio-checked ui-state-active');
            }
        }

        /**
         * 布控期限 时间控件点击事件
         */
        window.selectDateFunc = function () {
            //开始时间
            var startTime = $('#controlNew_Time').find('.datepicker-input').eq(0).val();
            // 结束时间
            var endTime = $('#controlNew_Time').find('.datepicker-input').eq(1).val();
            var startDate = new Date(Date.parse(startTime.replace(/-/g, "/"))).getTime();
            var endDate = new Date(Date.parse(endTime.replace(/-/g, "/"))).getTime();
            // 开始时间与结束时间间隔天数
            //var _counts = (endTime.substring(0, 4) - startTime.substring(0, 4)) * 360 + (endTime.substring(5, 7) - startTime.substring(5, 7)) * 30 + (endTime.substring(8, 10) - startTime.substring(8, 10));
            var _counts = Math.abs(startDate - endDate) / (1000 * 60 * 60 * 24);
            changeActive(_counts);
        }
        $('#controlNew_Time').find('.datepicker-input').off('blur').on('blur', selectDateFunc);

        // 新建布控 布控详情编辑 初始化
        var controlId = $('.control-new-popup').data('controlId'); // 布控编辑详情任务ID
        var controlType = $('.control-new-popup').data('controlType'); // 布控编辑详情任务ID
        var controlIdResult; //布控编辑详情数据
        if (controlId) {
            // 布控详情编辑
            var controlIdPort = 'v3/distributeManager/distributeTaskList',
                controlIdData = {
                    "taskId": controlId,
                    "viewType": 1,
                    "page": '1',
                    "size": '20',
                },
                controlIdPortSuccessFunc = function (data) {
                    var result = data.data.list[0];
                    if (data.code === '200') {
                        controlIdResult = {
                            name: result.name ? result.name : '',
                            type: result.type ? result.type : '',
                            startTime: result.startTime ? result.startTime : '',
                            endTime: result.endTime ? result.endTime : '',
                            threshold: result.threshold ? result.threshold : '',
                            reason: result.reason ? result.reason : (result.remark ? result.remark : ''),
                            noticeOrgList: result.noticeOrgList ? result.noticeOrgList : [],
                            libId: result.libId ? result.libId : [],
                            imgList: result.imgList ? result.imgList : [],
                            labelId: result.labelId ? result.labelId : '',
                            viewList: result.viewList ? result.viewList : [],
                            jqbh: result.jqbh ? result.jqbh : '',
                            viewUserList: result.viewUserList ? result.viewUserList : [],
                            enableEdit: result.enableEdit ? result.enableEdit : [],
                            docUrl: result.docUrl ? result.docUrl : '',
                            approver: result.taskApproveList ? result.taskApproveList : [],
                            checkList: result.checkList ? result.checkList : []
                        };
                        // controlEnableEdit = result.enableEdit; // 布控是否允许编辑

                        //布控名称
                        $('#control_name').val(controlIdResult.name);
                        //警情编号
                        $('#control_jqbh').val(controlIdResult.jqbh);

                        var approverIdList = '',
                            approverNameList = '';
                        if (controlIdResult.approver.length > 0) {
                            controlIdResult.approver.forEach((val) => {
                                approverIdList += val.approver;
                                approverNameList += val.approverName;
                            });

                            getPersonList($("#control_approver"), 1, '', approverIdList);
                        } else if (controlIdResult.approver.length > 0) {
                            controlIdResult.checkList.forEach((val => {
                                approverIdList += val.approver;
                                approverNameList += val.approverName;
                            }))
                            $("#control_approver1").parent().removeClass("hide");
                            $("#control_approver1").parent().prev().addClass("hide");
                            $("#control_approver1").val(approverNameList).attr("id", approverIdList);
                        } else {
                            $("#control_approver").parents(".control-form").find(".aui-icon-not-through").addClass("hide");
                            $("#control_approver").prop('disabled', true);
                            $("#control_approver").val(null);
                            $("#control_approver").selectpicker('refresh');
                        }

                        //布控期限 
                        var dateDiff = new Date(controlIdResult.endTime) - new Date(controlIdResult.startTime);
                        var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000));
                        var $datepicker = $('#controlNew_Time');
                        var $checkboxradio = $datepicker.siblings('.v-middle.wid-55').find('.ui-checkboxradio-button');
                        if (dayDiff <= 3) {
                            $checkboxradio.eq(0).click();
                        } else if (dayDiff > 3 && dayDiff <= 7) {
                            $checkboxradio.eq(1).click();
                        } else if (dayDiff > 7 && dayDiff <= 15) {
                            $checkboxradio.eq(2).click();
                        }
                        // var datetimeStart = controlIdResult.startTime.substring(0, 19);
                        // var datetimeEnd = controlIdResult.endTime.substring(0, 19);
                        var datetimeStart = controlIdResult.startTime;
                        var datetimeEnd = controlIdResult.endTime;
                        $datepicker.find('input').eq(0).val(datetimeStart);
                        $datepicker.find('input').eq(1).val(datetimeEnd);
                        // 如果时间间隔数不是3天 一周 半个月 时间标签都是未选中状态
                        // 开始时间与结束时间间隔天数
                        // var _dayCounts = (datetimeEnd.substring(0, 4) - datetimeStart.substring(0, 4)) * 360 + (datetimeEnd.substring(5, 7) - datetimeStart.substring(5, 7)) * 30 + (datetimeEnd.substring(8, 10) - datetimeStart.substring(8, 10));
                        changeActive(false); // 时间标签全部未选中，赋值后的时间不是按钮点击后的时间
                        // 按人布控 对象信息
                        if (controlIdResult.imgList.length > 0 && controlIdResult.libId.length == 0) {
                            $('#selectObject').removeClass('hide');
                            $('#selectControl').addClass('hide');
                        }
                        //布控原因
                        $('#control_reason').val(controlIdResult.reason);


                        // 公开范围，按机构
                        var port1 = 'v2/org/getOrgInfos',
                            dataLoad1 = {
                                returnType: 4,
                                orgType: 2,
                                userType: 2
                            }
                        successFunc1 = function (data) {
                            if (data.code === '200') {
                                var control_bodyList = data.data;
                                $('#control_viewList').data({
                                    'cameraList': matchList(control_bodyList, controlIdResult.viewList).newCameraList,
                                    'gidArr': matchList(control_bodyList, controlIdResult.viewList).newGidArr
                                }).val(matchList(control_bodyList, controlIdResult.viewList).newNameArr.join(','));
                            }
                        };
                        loadData(port1, true, dataLoad1, successFunc1, '', 'GET');

                        // 公开范围，按人
                        if (controlIdResult.viewList.length === 0) {
                            var viewUserNameList = [],
                                viewUserIdList = [];
                            controlIdResult.viewUserList.forEach(function (item) {
                                viewUserNameList.push(item.userName);
                                viewUserIdList.push(item.userId);
                            });
                            $('#control_viewUserList').data({
                                'nameArr': viewUserNameList,
                                'userIdArr': viewUserIdList,
                                'noticeUserList': viewUserIdList
                            }).val(viewUserNameList.join(','));

                            // $('#viewcameraRadioLable2').click(); // 新建编辑不可编辑时，点击事件会受到影响，用以下方法
                            $('#contorlViewList').addClass('hide');
                            $('#contorlViewPerson').removeClass('hide');
                            $('#control_viewUserList').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');

                            $("#viewcameraRadioLable2").addClass("ui-checkboxradio-checked");
                            $("#viewcameraRadioLable1").removeClass("ui-checkboxradio-checked");
                        } else {
                            $('#control_viewUserList').data({
                                'nameArr': [],
                                'userIdArr': [],
                                'noticeUserList': [],
                                'saveVal': []
                            });
                        }

                        //阈值
                        createSlider();

                        //布控人像列表
                        if (controlIdResult.imgList.length > 0) { // 按人布控
                            $('#selectObject').removeClass('hide');
                            $('#controlNewPage').data('controlType', 'people');
                            createLibList(); //布控库列表

                            controlIdResult.imgList.forEach(function (item, index) {
                                if (index == 7) {
                                    $('#control_imgList .add-image-icon').addClass('hide');
                                }
                                var option = {
                                    'libId': item.libId,
                                    'peopleId': item.peopleId,
                                };
                                loadData('v3/memberInfos/getPeopleInfo', true, option, function (data) {
                                    if (data.code === '200') {
                                        if (controlType == 'edit') {
                                            var isShow = true;
                                        }
                                        var result = data.data;
                                        var imgHtml = `<div class="add-image-item">
                                                        <img class="add-image-img" alt="" src="${result.imageUrl ? result.imageUrl : './assets/images/control/person.png'}">
                                                        <i class="aui-icon-delete-line ${isShow ? 'hide' : ''}"></i>
                                                    </div>`;
                                        $('#control_imgList').find('.add-image-icon').before(imgHtml);
                                        if ($('#controlNewPage').find('.card-title').text() == '新建布控') {
                                            $('#control_imgList').find('.add-image-icon').prev().data({
                                                peopleData: {
                                                    'peopleId': item.peopleId,
                                                    'libId': item.libId,
                                                    'state': 'new'
                                                }
                                            });
                                        } else {
                                            $('#control_imgList').find('.add-image-icon').prev().data({
                                                peopleData: {
                                                    'peopleId': item.peopleId,
                                                    'libId': item.libId,
                                                    'state': 'edit'
                                                }
                                            });
                                        }
                                    }
                                })
                            });
                            $('#control_imgList').removeClass('center');
                            $('#control_imgList').find('.add-image-icon').removeClass('add-image-new');
                            $('#control_imgList').find('.add-image-box-text').addClass('hide');
                        } else { // 按库布控
                            $('#selectObject').addClass('hide');
                            $('#controlNewPage').data('controlType', 'lib');
                            // 库赋值
                            var faceLibHtml = `<option value="${result.libId ? result.libId : ''}">${result.libName ? result.libName : ''}</option>`;
                            $('#control_libId').append(faceLibHtml);
                            $('#control_libId').selectpicker('val', result.libId);
                            $('#control_libId').attr("disabled", "disabled");
                            $('#control_libId').selectpicker('refresh');
                            // 标签赋值
                            if (result.labelId) {
                                var labelHtml = `<option value="${result.labelId ? result.labelId : ''}">${result.labelName ? result.labelName : ''}</option>`
                                $("#control_labelId").html(labelHtml);
                                $('#control_labelId').attr("disabled", "disabled");
                            } else {
                                $('#control_labelId').selectpicker({
                                    'noneSelectedText': '暂无标签'
                                });
                                $('#control_labelId').attr("disabled", "disabled");
                                $("#control_labelId").selectpicker('refresh');
                            }
                            //hideLoading($('.layout-type2.control-new-card .aui-card'));
                        }

                        //文书
                        if (controlIdResult.docUrl) {
                            $("#uploadSelectControl").addClass("hide");
                            $("#uploadResultControl").removeClass("hide");
                            $("#uploadResultControl").find(".result-name").html(`<a class="text-prompt" style="cursor: pointer;" url="${controlIdResult.docUrl}">文书下载</a>`);
                        }

                        if (controlType == 'edit') {
                            // 部分可编辑
                            $('#controlNewPage').find('.popup-title .card-title').text('编辑布控');
                            $('#control_name').attr('disabled', 'disabled');
                            $('#control_IDSearch').attr('disabled', 'disabled');
                            $('#control_imgList').find('input').attr('disabled', 'disabled');
                            $('#control_jqbh').attr('disabled', 'disabled');
                            $('#control_reason').attr('disabled', 'disabled');
                            $('#uploadSelectControl').find('.btn').attr('disabled', 'disabled');
                            $("#uploadResultControl").find(".aui-icon-not-through").addClass("hide");

                            $('#uploadResultControl').data({
                                upload: true,
                                docUrl: controlIdResult.docUrl
                            });

                        } else {
                            // 可编辑
                            // $('#controlNewPage').find('.popup-title .card-title').text('编辑布控');
                            $('#controlNewPage').find('[id^="control_"]').removeAttr("disabled");
                            $('#controlNewPage').find('input[type=checkbox]').removeAttr("disabled");
                            $('#controlNewPage').find('input[type=radio]').removeAttr("disabled");
                            $('#onNewBukong').removeClass("disabled");
                            $('#startTime').removeClass("disabled");
                            $('#endTime').removeClass("disabled");
                            $('#control_imgList').find('input').removeAttr("disabled");
                            radioFunc();
                        }
                    } else {
                        warningTip.say(data.message);
                    }
                };
            loadData(controlIdPort, true, controlIdData, controlIdPortSuccessFunc);
        } else {
            // 新建布控
            createSlider();
            createLibList();
            //获取审批人
            getPersonList($("#control_approver"), 1, '');
            window.initDatePicker1($('#controlNew_Time'), 3, false, true, false, {
                limitLength: 15,
                isNewControl: true,
                connection: true
            });
            // 新建布控 3天 标签单选激活 编辑时不一定需要激活
            $('#time-radio-button-5').attr('checked', true);
        }

        // tab切换（上下两部分同时切换）----暂未发现此模块功能属于那个部分,功能目前没有作用---
        $(".event-important").on("click", function () {
            $('.tab-content').children(".event").addClass("show").siblings().removeClass('show');
        })

        // 新建布控 布控基本信息和告警接收信息 点击事件 ----暂未发现此模块功能属于那个部分,功能目前没有作用---
        $(".security").on("click", function () {
            $('.tab-content').children(".security").addClass("show").siblings().removeClass('show');
        })

        // 点击出现地图 ----暂未发现此模块功能属于那个部分,功能目前没有作用--- 
        $('.btn-map').parent().on('click', function () {
            $('#kx_camera_list').modal('show');
        });

        // 布控名称 输入事件
        $('#control_name').on('input propertychange', function () {
            if ($(this).val() !== '') {
                $(this).removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');
            }
        });

        // 布控期限 时间切换事件
        $('.control-new-popup [data-role="radio-button"]').on('click', function () {
            var $this = $(this),
                eventCls = $this.closest('.event'),
                date = $(this).val();
            $(this).prev().addClass('ui-checkboxradio-checked ui-state-active');
            window.initDatePicker1($('#controlNew_Time'), date, true, true, false, {
                limitLength: 15,
                isNewControl: true
            });
        });

        // 按人布控 点击添加 上传图片事件
        $('.uploadFile.control-new').on('change.control.new', function () {
            // if (controlEnableEdit === '0' || controlEnableEdit === '2') {
            //     return;
            // }
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
                        var addimg = reader.result;
                        html = `
                            <div class="add-image-item">
                                <img class="add-image-img" src="${addimg}" alt="">
                                <i class="aui-icon-delete-line"></i>
                            </div> 
                            `;
                        _this.closest('.add-image-icon').before(html);
                        var $imgItem = $('#control_imgList').find('.add-image-item');
                        if ($imgItem.length == 8) {
                            $('#control_imgList .add-image-icon').addClass('hide');
                        }
                        $('#control_imgList').find('.uploadFile')[0].value = '';
                    };
                    reader.readAsDataURL(this.files[0]);
                    $('#control_imgList').removeClass('center');
                    $('#control_imgList').find('.add-image-icon').removeClass('add-image-new');
                    $('#control_imgList').find('.add-image-box-text').addClass('hide');
                    $("#control_imgList .add-image-icon").siblings('.add-image-item').removeClass('active');
                    $('#addImgWarning').addClass('hide');
                } else {
                    $('#addImgWarning').removeClass('hide');
                }
                $('#addImgWarning').siblings('.text-danger.tip').addClass('hide');
            }
            // if(_this.closest('.form-group').find('.aui-form-require').length > 0 && $('#control_libId').closest('.form-group').find('.aui-form-require').length > 0){
            //     $('#control_libId').closest('.form-group').find('.aui-form-require').removeClass('aui-form-require');
            // }
        });

        // 按人布控 已经上传的图片 删除事件
        $('#control_imgList').on('click', '.aui-icon-delete-line', function (e) {
            e.stopPropagation();
            var father = $(this).closest('.add-image-item');
            father.remove();
            var $imgItem = $('#control_imgList').find('.add-image-item');
            if ($imgItem.length < 8) {
                $('#control_imgList .add-image-icon').removeClass('hide');
            }
            if ($imgItem.length === 0) {
                $('#control_imgList').addClass('center');
                $('#control_imgList').find('.add-image-icon').addClass('add-image-new');
                $('#control_imgList').find('.add-image-box-text').removeClass('hide');
                // if($('#selectpickerWrap .filter-option-inner-inner').text() == '请选择库'){
                //     $('#selectpickerWrap').siblings('.aui-form-label').addClass('aui-form-require');
                // }
            }
            $('#addImgWarning').addClass('hide');
        });

        // 按人布控 对象信息 输入框点击事件
        $("#control_IDSearch").on('keydown', function (e) {
            var code = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
            if (code == 13) {
                controlFindIdcard();
            }
        });

        // 按人布控 对象信息 搜索按钮点击事件
        $("#selectObject").on('click', '.aui-input-suffix', function () {
            controlFindIdcard();
        });

        // 布控区域 切换可见区域按机构 单选框点击事件
        $('#viewcameraRadioLable1').on('click', function () {
            // if (controlEnableEdit === '0') {
            //     return;
            // }
            $('#contorlViewPerson').addClass('hide');
            $('#contorlViewList').removeClass('hide');
            $('#control_viewList').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');

            $("#viewcameraRadioLable1").addClass("ui-checkboxradio-checked");
            $("#viewcameraRadioLable2").removeClass("ui-checkboxradio-checked");
        });

        // 布控区域 切换可见区域按人 单选框点击事件
        $('#viewcameraRadioLable2').on('click', function () {
            // if (controlEnableEdit === '0') {
            //     return;
            // }
            $('#contorlViewList').addClass('hide');
            $('#contorlViewPerson').removeClass('hide');
            $('#control_viewUserList').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');

            $("#viewcameraRadioLable2").addClass("ui-checkboxradio-checked");
            $("#viewcameraRadioLable1").removeClass("ui-checkboxradio-checked");
        });

        // 可见机构 输入框点击事件 调用树组件
        $('#control_viewList').orgTree({
            all: true, //人物组织都开启
            area: ['620px', '542px'], //弹窗框宽高
            search: true, //开启搜索
            newBk: true, //确认按钮事件
            noMap: true,
            ajaxFilter: true,
            node: 'control_viewList',
            contain: "1", // 树结构中是否包含警种
            viewType: true //公开范围都要加上这个属性，请求参数不同
        });

        // 可见机构 删除按钮事件
        $('#control_viewList').siblings().on('click', function () {
            $('#control_viewList').val('');
            $('#control_viewList').attr('title', '');
            $('#control_viewList').data({
                'cameraList': [],
                'gidArr': [],
                'otherCamraList': []
            })
        });

        // 公开范围按人 输入框点击事件 调用树组件
        $('#control_viewUserList').orgTree({
            all: true, //人物组织都开启
            area: ['620px', '542px'], //弹窗框宽高
            search: true, // 搜索事件不在orgTree
            newBk: true,
            noMap: true,
            noTree: true,
            ajaxFilter: false,
            node: 'control_viewUserList'
        });

        // 公开范围按人 删除按钮事件
        $('#control_viewUserList').siblings().on('click', function () {
            $('#control_viewUserList').val('');
            $('#control_viewUserList').attr('title', '');
            $('#control_viewUserList').data({
                'saveVal': [],
                'noticeUserList': [],
                'userIdArr': []
            })
        });

        // 公开范围按人 点击事件
        $('#control_viewUserList').on('click', function () {
            $('.multiPickerDlg_right_no_result').html('<i></i>未选择人员');
            $('#memberSearchInput').attr('placeholder', '搜索人员');
            $('.type-change-left').text('人员列表');
            $('.multiPickerDlg_right_title>span').text('已选可见人');
            $('#partyTree').remove();
            $('.type-change-right').hide();
            $('.layui-layer-btn').attr('id', 'noticeUserList');
            showLoading($('.layui-layer-content'));
            // 告警可见人 左侧列表参数
            var controlOpt = {
                page: '1',
                size: '15'
            }
            controlOpt.page = '1';
            var searchPage = 2;
            // controlOpt.orgids = orgids;
            // 告警可见人
            var receivePort = 'v2/user/getOrgUserInfos';
            var receiveSuccessFunc = function (data) {
                if (data.code === '200') {
                    $('#saveNode').html('');
                    var liList = '',
                        html = '';
                    var list = data.data.list;
                    if (list) {
                        //判断是否有选中值
                        var userSaveVal = $('#control_viewUserList').data('saveVal');
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
                        // 布控详情默认选中项
                        if (controlId && $('#control_viewUserList').data('userIdArr').length > 0) {
                            $('#control_viewUserList').data({
                                'noticeUserList': $('#control_viewUserList').data('userIdArr'),
                                'saveVal': controlIdResult.viewUserList
                            });

                            function defaultSelected(list) {
                                var liHtml = '';
                                list.forEach(function (item) {
                                    controlIdResult.viewUserList.forEach(function (el, idx) {
                                        if (item.userId == el.userId) {
                                            $('#receive_member_list_view').find('li[userId="' + el.userId + '"] .button').addClass('checkbox_true_full');
                                            el.index = idx;
                                        }
                                    });
                                });
                                controlIdResult.viewUserList.forEach(function (el) {
                                    liHtml += '<li title=' + el.userName + ' data-name=' + el.userName + ' userId=' + el.userId + ' class="ww_menuDialog_DualCols_colRight_cnt_item token-input-token js_list_item">' +
                                        '<span class="ww_commonImg icon icon_folder_blue"></span>' +
                                        '<span class="ww_treeMenu_item_text" title=' + el.userName + '>' + el.userName + '</span>' +
                                        '<a href="javascript:" class="ww_menuDialog_DualCols_colRight_cnt_item_delete"><span class="ww_commonImg ww_commonImg_DeleteItem js_delete"></span></a>' +
                                        '</li>';
                                });
                                $('#saveNode').html(liHtml);
                                $('.multiPickerDlg_right_no_result').hide();
                                $('#js-camera-totle').text(controlIdResult.viewUserList.length);
                                $('#receive_member_list_view').data({
                                    'cameraList': controlIdResult.viewUserList
                                });
                            }
                            defaultSelected(list);
                        }
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
                            if (controlId) {
                                $('#control_viewUserList').data({
                                    'userIdArr': []
                                });
                            }
                            $('#control_viewUserList').data({
                                'noticeUserList': noticeUserList,
                                'saveVal': saveVal
                            });
                            $('#control_viewUserList').val(nameArr.join(',')).attr('title', nameArr.join(','));

                            if ($('#control_viewUserList').val() !== '' && $('#control_viewUserList').val() !== []) {
                                $('#control_viewUserList').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');
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
        })

        // 相关文书 上传附件
        $("#uploadSelectControl").on('click', 'button', function () {
            $('#uploadFileControl').click();
        })

        // 相关文书 点击文件旁 删除按钮事件
        $('#uploadResultControl').find('i').on('click', function () {
            $('#uploadSelectControl').removeClass('hide');
            $('#uploadResultControl').addClass('hide');
            $('#uploadResultControl').fadeOut(300);
            $('#uploadResultControl').data('upload', false);
            $('#uploadFileControl')[0].value = '';
        });

        // 相关文书 判断是否上传了文件,并且对上传的文件进行格式的验证
        $('#uploadFileControl').on('change', function () {
            var that = this,
                fileType = '',
                fileNameArr = that.value.split('\\'), // 文件名路径数组
                fileSize = that.files[0].size,
                fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
                fileNameTypeArr = fileName.split('.');
            fileType = fileNameTypeArr[fileNameTypeArr.length - 1];

            $('#uploadWarningControl').addClass('hide');
            if (fileType !== 'doc' && fileType !== 'DOC' && fileType !== 'docx' && fileType !== 'DOCX' && fileType !== 'pdf' && fileType !== 'PDF') {
                $('#uploadWarningControl').removeClass('hide').text('上传文件格式不正确,请上传word和pdf文档');
                // warningTip.say("上传文件格式不正确,请上传word和pdf文档");
                that.value = '';
                return;
            }

            // 判断文件大小是否超过100M 
            if (fileSize > 100 * 1024 * 1024) {
                // warningTip.say("上传文件过大,请上传不大于100M的文件");
                $('#uploadWarningControl').removeClass('hide').text('上传文件过大,请上传不大于100M的文件');
                that.value = '';
                return;
            }

            $('#uploadSelectControl').addClass('hide');
            $('#uploadResultControl').removeClass('hide');

            // 将文件名字写出
            $('#uploadResultControl').fadeIn(300);
            $('#uploadResultControl').find('.result-name').text(fileName);
            // $('#uploadResultControl').data('submitURL', '/memberInfos/addPicInfoByExcel');

            var formFileData = new FormData($(that).parent()[0]),
                uploadFormData = new FormData(),
                xhr = new XMLHttpRequest(),
                token = $.cookie('xh_token'),
                wordFile = formFileData.get('wordFile');

            var reader = new FileReader();
            reader.onload = function (e) {
                xhr.open('post', serviceUrl + '/v2/memberInfos/upload');
                xhr.setRequestHeader("token", token);
                uploadFormData.append('type', '3');
                uploadFormData.append('file', wordFile);
                xhr.send(uploadFormData);
                showLoading($('#uploadSelectControl'));
                xhr.onload = function (res) { // word，pdf文件
                    var data = JSON.parse(res.currentTarget.response);
                    hideLoading($('#uploadSelectControl'));
                    if (data.code === '200') {
                        $('#uploadResultControl').data('upload', true);
                        url = data.url; // 上传的文件http路径
                        $('#uploadResultControl').data({
                            docUrl: url,
                            filename: data.fileName,
                        });
                    } else {
                        warningTip.say(data.message);
                    }
                }
            }
            reader.readAsDataURL(this.files[0]);
        });

        // 布控原因 输入事件 限制长度
        $('#control_reason').on('input propertychange', function () {
            if ($(this).val() !== '') {
                var currInpLength = $(this).val().length;
                if (currInpLength > 120) {
                    var numText = $(this).val().substring(0, 120);
                    $(this).val(numText);
                    warningTip.say('字数超出限制，多出字符将被截断！');
                    var nodeNumb = $(this).removeClass('no-input-warning').next();
                    nodeNumb.find('span').text(0);
                } else {
                    var nodeNumb = $(this).removeClass('no-input-warning').next();
                    nodeNumb.removeClass('hide');
                    nodeNumb.find('span').text(120 - currInpLength);
                }
                $(this).removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');
            }
        });

        // 新建/编辑布控 确定按钮点击事件
        $("#onNewBukong").click(function () {
            if ($(this).hasClass('disabled')) {
                return;
            }
            // 取消校验样式
            $('.control-new-card').find('.no-input-warning').removeClass('no-input-warning');
            $('.control-new-card').find('.text-danger.tip').addClass('hide');
            // 布控编辑详情任务ID
            if ($('.control-new-popup').data('controlType') == 'edit') {
                var taskId = $('.control-new-popup').data('controlId');
            } else {
                var taskId = '';
            }
            // 布控名称
            var name = $.trim($('#control_name').val());
            // 开始时间
            var startTime = $('#controlNew_Time').find('.datepicker-input').eq(0).val();
            // 结束时间
            var endTime = $('#controlNew_Time').find('.datepicker-input').eq(1).val();

            //阈值
            var threshold = Number($('#sliderInput2').val());
            if (threshold < 60 || threshold > 100) {
                warningTip.say('阈值为60-99之间的整数');
            }
            //布控原因
            var reason = $.trim($('#control_reason').val());

            //公开范围
            if ($("#viewcameraRadioLable1").hasClass('ui-checkboxradio-checked')) {
                var viewList = $('#control_viewList').data('gidArr');
                var viewUserList = [];
            } else {
                var viewList = [];
                var viewUserList = $('#control_viewUserList').data('noticeUserList');
            }

            //布控库列表
            var libId = $('#control_libId').val(),
                libIdType = ""; // 库可布控类别：1.一级标签布控 2.二级标签布控 3.临时布控
            faceLibData.forEach(function (el, i) {
                if (el.libId == libId) {
                    libIdType = el.type;
                }
            })

            //标签
            var labelId = $('#control_labelId').selectpicker('val');
            // $('#control_labelId').find('option').each(function (index, item) {
            //     if (item.innerText == $('#control_labelId-button .ui-selectmenu-text').text()) {
            //         labelId = item.value;
            //     }
            // });

            //布控人像列表
            var urlList = []; // 本地添加图片
            var peopleIds = []; // 重新布控图片
            var peopleIdList = []; // 编辑布控图片
            $('#control_imgList').find('.add-image-img').each(function (index) {
                var peopleData = $(this).closest('.add-image-item').data('peopleData');
                if (peopleData && peopleData.state == 'new') {
                    peopleIds.push(peopleData.peopleId);
                } else if (peopleData && peopleData.state == 'edit') {
                    peopleIdList.push(peopleData);
                } else { // 本地添加
                    urlList.push({
                        base64: $(this).attr('src'),
                        idcard: ''
                    });
                }
            });

            // 警情编号
            var jqbh = $.trim($('#control_jqbh').val());

            // 上传附件
            var upload = $('#uploadResultControl').data('upload');
            if (upload) {
                // 进行上传的文件http路径
                var docUrl = $('#uploadResultControl').data('docUrl');
            }

            //审批人
            var approver = $("#control_approver").parent().hasClass("hide") ? $("#control_approver").attr("id") : $("#control_approver").val();

            var portData = {
                taskId: taskId ? taskId : '',
                name: name ? name : '', //任务名
                libId: libId ? libId : [], //布控列表 布控人列表 二选一
                labelId: labelId ? labelId : '', //标签
                threshold: threshold ? threshold : '', //阈值
                startTime: startTime ? startTime : '',
                endTime: endTime ? endTime : '',
                imgList: urlList ? urlList : [], //布控人列表 布控列表 二选一
                viewList: viewList ? viewList : [], // 公开范围 按机构
                viewUserList: viewUserList ? viewUserList : [], //公开范围 按人
                jqbh: jqbh ? jqbh : '',
                docUrl: docUrl ? docUrl : '',
                reason: reason ? reason : '',
                source: 1,
                approver: approver ? approver : ''
            };
            // if (controlId) {
            //     portData.taskId = controlId;
            // }
            // 校验
            var controlFlag = true;
            Object.keys(portData).forEach(function (key) {
                if ((key == 'name' || key == 'libId' || key == 'threshold' || key == 'reason' || key == "approver") && (portData[key] == '' || portData[key] == [])) {
                    if (key == 'startTime' || key == 'endTime') {
                        $('#controlNew_Time').addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').text("请选择开始和结束时间").removeClass('hide');
                    } else {
                        if (key == "approver") {
                            $('#control_' + key).closest('.form-group').find('.text-danger.tip').removeClass('hide');
                        } else {
                            $('#control_' + key).addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').removeClass('hide');
                        }
                    }
                    controlFlag = false;
                }

                if (key == 'imgList' && libIdType == "3" && $('#controlNewPage').data('controlType') !== 'lib') {
                    if (urlList == '' && peopleIdList.length == 0 && peopleIds.length == 0) {
                        $('#control_' + key).addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').removeClass('hide');
                        controlFlag = false;
                    }
                }
                if (key == 'labelId' && libIdType == "2" && (portData[key] == '' || portData[key] == [])) {
                    if ($('#controlNewPage').data('controlType') == 'lib') { // 库布控 没有标签的时候不校验标签
                        if (!$("#control_labelId").parent().hasClass("disabled")) {
                            $('#control_labelId').addClass('no-input-warning').closest('.aui-col-11').find('.text-danger.tip').removeClass('hide');
                            controlFlag = false;
                        }
                    } else { // 人员布控 库标签必填
                        $('#control_' + key).addClass('no-input-warning').closest('.aui-col-11').find('.text-danger.tip').removeClass('hide');
                        controlFlag = false;
                    }
                }
                if (key == 'viewList' || key == 'viewUserList') {
                    if (portData.viewList.length == 0 && portData.viewUserList.length == 0) {
                        $('#control_' + key).addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').text("请选择公开范围").removeClass('hide');
                        controlFlag = false;
                    }
                    // else if (portData.viewList.length == 0 && portData.viewUserList.length < 3) {
                    //     $('#control_' + key).addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').text("可见人不能少于3位").removeClass('hide');
                    //     controlFlag = false;
                    // }
                }
                if (key == 'startTime' || key == 'endTime') {
                    if (portData['startTime'] == portData['endTime']) {
                        $('#controlNew_Time').addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').text("开始时间和结束时间不能相等").removeClass('hide');
                        controlFlag = false;
                    }
                    var nowDate = new Date(Date.parse(sureSelectTime().now.replace(/-/g, "/"))).getTime();
                    var endDate = new Date(Date.parse(endTime.replace(/-/g, "/"))).getTime();
                    if (endDate < nowDate) {
                        $('#controlNew_Time').addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').text("结束时间不能小于当前时间").removeClass('hide');
                        controlFlag = false;
                    }
                }
            });

            var portDataSuccessFunc = function (data) {
                if (data.code === '200') {
                    setTimeout(() => {
                        $('.control-new-popup').addClass('hide').removeClass('show').removeData('controlData');
                        if ($("#control_imgList").data("picForm") == 'portraitCard') { //从人员库新建的任务点击确认新建后不用刷新或跳转到布控页面
                            var liId = $("#portrait-tree-list").find("li.active").attr("id"); //模拟人员库树列表当前选中节点点击事件刷新列表
                            $("#" + liId + "_a").click();
                            return;
                        }

                        if ($('#pageSidebarMenu .aui-icon-customers2').parents("li.sidebar-item").hasClass("active")) { //从我的申请编辑任务点击确认新建后不用刷新或跳转到布控页面
                            $('.control-new-popup').data('controlId', ''); // 布控编辑详情任务ID
                            $('.control-new-popup').data('controlType', ''); // 布控编辑详情任务ID
                            $("#myApply").find("#myApplyTabHeader .nav-item").eq(1).click();
                            return;
                        }
                        if (controlId) {
                            window.editSuccess(controlId);
                        } else {
                            var $barItem = $('#pageSidebarMenu .aui-icon-monitor2').closest('.sidebar-item'),
                                barIndex = $barItem.index(),
                                $saveItem = $('#content-box').children().eq(barIndex),
                                url = $('#pageSidebarMenu .aui-icon-monitor2').parent("a").attr("lc") + "?dynamic=" + Global.dynamic;
                            $barItem.addClass('active').siblings().removeClass('active');
                            $saveItem.removeClass('hide').siblings().addClass('hide');
                            loadPage($saveItem, url);
                            $("#current-page-control #map_iframe_alarm").attr('src', mapUrl + 'peopleCity.html?rxModule=map_iframe_alarm');
                        }
                    }, 200);
                } else if (data.code === "623") {
                    hideLoading($('.layout-type2 .aui-card'));
                    warningTip.say(data.message);
                } else {
                    hideLoading($('.layout-type2 .aui-card'));
                    warningTip.say('创建失败');
                }
            }

            // 按人布控的图片需要保存起来 编辑的时候调用
            // controlFlag = false;
            if (controlFlag) {
                if (urlList.length > 0 || peopleIds.length > 0) {
                    var getUrlSuccessFunc = function (data) {
                        hideLoading($('.layout-type2 .aui-card'));
                        if (data.code === '200') {
                            portData.imgList = data.data;
                            if (peopleIdList.length > 0) {
                                if ($("#control_imgList").data("picForm") == 'portraitCard') { //从人员库新建的
                                    peopleIdList.map(function (item) {
                                        var itemObj = {};
                                        itemObj.libId = $("#control_imgList").data("portraitLibId");
                                        itemObj.peopleId = item;
                                        portData.imgList.push(itemObj);
                                    });
                                } else {
                                    peopleIdList.map(function (item) {
                                        portData.imgList.push(item);
                                    });
                                }
                            }
                            loadData('v3/distributeManager/editDistributeTask', true, portData, portDataSuccessFunc);
                            showLoading($('.layout-type2 .aui-card'));
                        } else {
                            warningTip.say(data.message);
                        }
                    }
                    loadData('v3/memberInfos/addPicsInfos', true, {
                        libId: portData.libId,
                        labelId: portData.labelId,
                        personList: urlList,
                        personIds: peopleIds,
                        reason: portData.reason
                    }, getUrlSuccessFunc);
                    showLoading($('.layout-type2 .aui-card'));
                } else if (urlList.length == 0 && peopleIdList.length > 0) {
                    if ($("#control_imgList").data("picForm") == 'portraitCard') { //从人员库新建的
                        peopleIdList.map(function (item) {
                            var itemObj = {};
                            itemObj.libId = $("#control_imgList").data("portraitLibId");
                            itemObj.peopleId = item;
                            portData.imgList.push(itemObj);
                        });
                    } else {
                        peopleIdList.map(function (item) {
                            portData.imgList.push(item);
                        });
                    }
                    loadData('v3/distributeManager/editDistributeTask', true, portData, portDataSuccessFunc);
                } else {
                    loadData('v3/distributeManager/editDistributeTask', true, portData, portDataSuccessFunc);
                    showLoading($('.layout-type2 .aui-card'));
                }
            }
        });

        // 新建/编辑布控 关闭图标点击事件
        $('#backPrevPage').click(function () {
            $('.control-new-popup').data({
                'controlId': ''
            });
        });

        // 新建/编辑布控 取消按钮点击事件
        $('#cancelEdit').click(function () {
            $('#backPrevPage').click();
            $('.control-new-popup').data({
                'controlId': ''
            });
        });

        // 布控详情 相关文书点击事件
        $('#controlNewPage').on('click', '#uploadResultControl a.text-prompt', function () {
            var url = $(this).attr("url");
            if (url) {
                var post_url = serviceUrl + '/v2/file/downloadByHttpUrl?url=' + url;
                if ($("#IframeReportImg").length === 0) {
                    $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
                }
                $('#IframeReportImg').attr("src", post_url);
            }
        })
    })
})(window, window.jQuery)