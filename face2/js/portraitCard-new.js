(function (window, $) {
    $(function () {
        var controlEnableEdit = '1';
        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });
        $('[data-role="checkbox"]').checkboxradio();

        // 生成灰色遮罩层初始化
        // $('.popup-panel').removeClass('hide');

        /**
         * 阈值滑块初始化 设置最低值为60
         */
        function createSlider() {
            var sliderValue = controlIdResult && controlIdResult.threshold !== '' ? controlIdResult.threshold : 90;
            var slider2 = $("#sliderPortraitCard2").slider({
                orientation: "horizontal",
                range: "min",
                max: 99,
                min: 90,
                value: sliderValue,
                create: function (event, ui) {
                    $("#sliderMinPortraitCard2").text(90);
                    $("#sliderMaxPortraitCard2").text(99);
                },
                slide: function (event, ui) {
                    $("#sliderInputPortraitCard2").val(ui.value);
                }
            });
            $('#sliderInputPortraitCard2').val(sliderValue);
            //新建布控 阈值滑块 输入事件
            $("#sliderInputPortraitCard2").on("change", function () {
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
                $('#card-time-label-three-days').addClass('ui-checkboxradio-checked ui-state-active');
                $('#card-time-label-oneweek-days').removeClass('ui-checkboxradio-checked ui-state-active');
                $('#card-time-label-halfmonth-days').removeClass('ui-checkboxradio-checked ui-state-active');
            } else if (_counts === 7) {
                // 七天 单选激活 
                $('#card-time-label-three-days').removeClass('ui-checkboxradio-checked ui-state-active');
                $('#card-time-label-oneweek-days').addClass('ui-checkboxradio-checked ui-state-active');
                $('#card-time-label-halfmonth-days').removeClass('ui-checkboxradio-checked ui-state-active');
            } else if (_counts === 15) {
                // 半个月 单选激活 
                $('#card-time-label-three-days').removeClass('ui-checkboxradio-checked ui-state-active');
                $('#card-time-label-oneweek-days').removeClass('ui-checkboxradio-checked ui-state-active');
                $('#card-time-label-halfmonth-days').addClass('ui-checkboxradio-checked ui-state-active');
            } else {
                // 所有单选不激活 
                $('#card-time-label-three-days').removeClass('ui-checkboxradio-checked ui-state-active');
                $('#card-time-label-oneweek-days').removeClass('ui-checkboxradio-checked ui-state-active');
                $('#card-time-label-halfmonth-days').removeClass('ui-checkboxradio-checked ui-state-active');
            }
        }

        /**
         * 布控期限 时间控件点击事件
         */
        window.selectDateFunc = function () {
            //开始时间
            var startTime = $('#controlCard_Time').find('.datepicker-input').eq(0).val();
            // 结束时间
            var endTime = $('#controlCard_Time').find('.datepicker-input').eq(1).val();
            var startDate = new Date(Date.parse(startTime.replace(/-/g, "/"))).getTime();
            var endDate = new Date(Date.parse(endTime.replace(/-/g, "/"))).getTime();
            // 开始时间与结束时间间隔天数
            //var _counts = (endTime.substring(0, 4) - startTime.substring(0, 4)) * 360 + (endTime.substring(5, 7) - startTime.substring(5, 7)) * 30 + (endTime.substring(8, 10) - startTime.substring(8, 10));
            var _counts = Math.abs(startDate - endDate) / (1000 * 60 * 60 * 24);
            changeActive(_counts);
        }
        $('#controlCard_Time').find('.datepicker-input').off('blur').on('blur', selectDateFunc);

        // 新建布控 布控详情编辑 初始化
        var controlId = $('.portraitCard-new-popup').data('controlId'); // 布控编辑详情任务ID
        var controlIdResult; //布控编辑详情数据
        if (controlId) {
            // 布控详情编辑
            var controlIdPort = 'v2/distributeManager/distributeTaskList',
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
                            enableEdit: result.enableEdit ? result.enableEdit : []
                        };
                        controlEnableEdit = result.enableEdit; // 布控是否允许编辑
                        //布控名称
                        $('#controlCard_name').val(controlIdResult.name);
                        //布控类型,等级,告警推送类型
                        //createTypeLevel(result.libId);
                        //布控期限 
                        var dateDiff = new Date(controlIdResult.endTime) - new Date(controlIdResult.startTime);
                        var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000));
                        var $datepicker = $('#controlCard_Time');
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
                        var _dayCounts = (datetimeEnd.substring(0, 4) - datetimeStart.substring(0, 4)) * 360 + (datetimeEnd.substring(5, 7) - datetimeStart.substring(5, 7)) * 30 + (datetimeEnd.substring(8, 10) - datetimeStart.substring(8, 10));
                        changeActive(_dayCounts);
                        // 按人布控 对象信息
                        if (controlIdResult.imgList.length > 0 && controlIdResult.libId.length == 0) {
                            $('#selectObject').removeClass('hide');
                            $('#selectControl').addClass('hide');
                        }
                        //布控原因
                        $('#controlCard_reason').val(controlIdResult.reason);


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
                                $('#controlCard_viewList').data({
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
                            $('#controlCard_viewUserList').data({
                                'nameArr': viewUserNameList,
                                'userIdArr': viewUserIdList,
                                'noticeUserList': viewUserIdList
                            }).val(viewUserNameList.join(','));

                            // $('#viewcameraRadioLableCrad2').click(); // 新建编辑不可编辑时，点击事件会受到影响，用以下方法
                            $('#contorlViewCardList').addClass('hide');
                            $('#contorlViewCardPerson').removeClass('hide');
                            $('#controlCard_viewUserList').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');

                            $("#viewcameraRadioLableCrad2").addClass("ui-checkboxradio-checked");
                            $("#viewcameraRadioLableCrad1").removeClass("ui-checkboxradio-checked");
                        } else {
                            $('#controlCard_viewUserList').data({
                                'nameArr': [],
                                'userIdArr': [],
                                'noticeUserList': [],
                                'saveVal': []
                            });
                        }

                        //阈值
                        createSlider();

                        //布控人像列表
                        if (controlIdResult.imgList.length > 0) {
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
                                        var result = data.data;
                                        var imgHtml = `<div class="add-image-item">
                                        <img class="add-image-img" alt="" src="${result.imageUrl ? result.imageUrl : './assets/images/control/person.png'}">
                                        <i class="aui-icon-delete-line"></i>
                                    </div>`;
                                        $('#control_imgList').find('.add-image-icon').before(imgHtml);
                                        $('#control_imgList').find('.add-image-icon').prev().data({
                                            peopleId: {
                                                'guid': item.peopleId,
                                                'libId': item.libId
                                            }
                                        });
                                    }
                                })
                            });
                            $('#control_imgList').removeClass('center');
                            $('#control_imgList').find('.add-image-icon').removeClass('add-image-new');
                            $('#control_imgList').find('.add-image-box-text').addClass('hide');
                        }
                        // 判断布控编辑是否可编辑
                        if (controlEnableEdit == '0') {
                            // 不编辑
                            $('#portraitCardNewPage').find('.popup-title .card-title').text('查看布控');

                            $('#portraitCardNewPage').find('[id^="control_"]').attr('disabled', 'disabled');
                            $('#portraitCardNewPage').find('input[type=checkbox]').attr('disabled', 'disabled');
                            $('#portraitCardNewPage').find('input[type=radio]').attr('disabled', 'disabled');
                            $('#onNewBukongPortrait').addClass('disabled');
                            $('#startTime').attr('disabled', 'disabled');
                            $('#endTime').attr('disabled', 'disabled');
                            $('#control_imgList').find('input').attr('disabled', 'disabled');
                        } else if (controlEnableEdit == '2') {
                            // 部分可编辑
                            $('#portraitCardNewPage').find('.popup-title .card-title').text('编辑布控');

                            $('#portraitCardNewPage').find('[id^="control_libId"]').attr('disabled', 'disabled');
                            $('#control_IDSearch').attr('disabled', 'disabled');
                            $('#control_imgList').find('input').attr('disabled', 'disabled');
                        } else {
                            // 可编辑
                            $('#portraitCardNewPage').find('.popup-title .card-title').text('编辑布控');

                            $('#portraitCardNewPage').find('[id^="control_"]').removeAttr("disabled");
                            $('#portraitCardNewPage').find('input[type=checkbox]').removeAttr("disabled");
                            $('#portraitCardNewPage').find('input[type=radio]').removeAttr("disabled");
                            $('#onNewBukongPortrait').removeClass("disabled");
                            $('#startTime').removeClass("disabled");
                            $('#endTime').removeClass("disabled");
                            $('#control_imgList').find('input').removeAttr("disabled");
                            radioFunc();
                        }
                    }
                };
            loadData(controlIdPort, true, controlIdData, controlIdPortSuccessFunc);
        } else {
            // 新建布控
            createSlider();
            window.initDatePicker1($('#controlCard_Time'), 3, false, true, false, {
                limitLength: 15,
                isNewControl: true,
                connection: true
            });
            // 新建布控 3天 标签单选激活 编辑时不一定需要激活
            $('#card-time-radio-button-5').attr('checked', true);
            //对象信息赋值
            $("#controlCard_info").val($('.portraitCard-new-popup').data("infoName"));
        }

        // 任务名称 输入事件
        $('#controlCard_name').on('input propertychange', function () {
            if ($(this).val() !== '') {
                $(this).removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');
            }
        });

        // 对象信息 输入事件
        $('#controlCard_info').on('input propertychange', function () {
            if ($(this).val() !== '') {
                $(this).removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');
            }
        });

        // 布控期限 时间切换事件
        $('.portraitCard-new-popup [data-role="radio-button"]').on('click', function () {
            var $this = $(this),
                eventCls = $this.closest('.event'),
                date = $(this).val();
            $(this).prev().addClass('ui-checkboxradio-checked ui-state-active');
            window.initDatePicker1($('#controlCard_Time'), date, true, true, false, {
                limitLength: 15,
                isNewControl: true
            });
        });

        // 布控区域 切换可见区域按机构 单选框点击事件
        $('#viewcameraRadioLableCrad1').on('click', function () {
            if (controlEnableEdit === '0') {
                return;
            }
            $('#contorlViewCardPerson').addClass('hide');
            $('#contorlViewCardList').removeClass('hide');
            $('#controlCard_viewList').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');

            $("#viewcameraRadioLableCrad1").addClass("ui-checkboxradio-checked");
            $("#viewcameraRadioLableCrad2").removeClass("ui-checkboxradio-checked");
        });

        // 布控区域 切换可见区域按人 单选框点击事件
        $('#viewcameraRadioLableCrad2').on('click', function () {
            if (controlEnableEdit === '0') {
                return;
            }
            $('#contorlViewCardList').addClass('hide');
            $('#contorlViewCardPerson').removeClass('hide');
            $('#controlCard_viewUserList').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');

            $("#viewcameraRadioLableCrad2").addClass("ui-checkboxradio-checked");
            $("#viewcameraRadioLableCrad1").removeClass("ui-checkboxradio-checked");
        });

        // 可见机构 输入框点击事件 调用树组件
        $('#controlCard_viewList').orgTree({
            all: true, //人物组织都开启
            area: ['620px', '542px'], //弹窗框宽高
            search: true, //开启搜索
            newBk: true, //确认按钮事件
            noMap: true,
            ajaxFilter: true,
            node: 'controlCard_viewList',
            contain: "1", // 树结构中是否包含警种
            viewType: true //公开范围都要加上这个属性，请求参数不同
        });

        // 可见机构 删除按钮事件
        $('#controlCard_viewList').siblings().on('click', function () {
            $('#controlCard_viewList').val('');
            $('#controlCard_viewList').attr('title', '');
            $('#controlCard_viewList').data({
                'cameraList': [],
                'gidArr': [],
                'otherCamraList': []
            })
        });

        // 公开范围按人 输入框点击事件 调用树组件
        $('#controlCard_viewUserList').orgTree({
            all: true, //人物组织都开启
            area: ['620px', '542px'], //弹窗框宽高
            search: true, // 搜索事件不在orgTree
            newBk: true,
            noMap: true,
            noTree: true,
            ajaxFilter: false,
            node: 'controlCard_viewUserList'
        });

        // 公开范围按人 删除按钮事件
        $('#controlCard_viewUserList').siblings().on('click', function () {
            $('#controlCard_viewUserList').val('');
            $('#controlCard_viewUserList').attr('title', '');
            $('#controlCard_viewUserList').data({
                'saveVal': [],
                'noticeUserList': [],
                'userIdArr': []
            })
        });

        // 公开范围按人 点击事件
        $('#controlCard_viewUserList').on('click', function () {
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
                        var userSaveVal = $('#controlCard_viewUserList').data('saveVal');
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
                        if (controlId && $('#controlCard_viewUserList').data('userIdArr').length > 0) {
                            $('#controlCard_viewUserList').data({
                                'noticeUserList': $('#controlCard_viewUserList').data('userIdArr'),
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
                                $('#controlCard_viewUserList').data({
                                    'userIdArr': []
                                });
                            }
                            $('#controlCard_viewUserList').data({
                                'noticeUserList': noticeUserList,
                                'saveVal': saveVal
                            });
                            $('#controlCard_viewUserList').val(nameArr.join(',')).attr('title', nameArr.join(','));

                            if ($('#controlCard_viewUserList').val() !== '' && $('#controlCard_viewUserList').val() !== []) {
                                $('#controlCard_viewUserList').removeClass('no-input-warning').closest('.form-group').find('.text-danger.tip').addClass('hide');
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
                                        var userSaveVal = $('#controlCard_viewUserList').data('saveVal');
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

        // 布控原因 输入事件 限制长度
        $('#controlCard_reason').on('input propertychange', function () {
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
        $("#onNewBukongPortrait").click(function () {
            if ($(this).hasClass('disabled')) {
                return;
            }
            // 取消校验样式
            $('.portrait-new-card').find('.no-input-warning').removeClass('no-input-warning');
            $('.portrait-new-card').find('.text-danger.tip').addClass('hide');
            // 任务名称
            var name = $.trim($('#controlCard_name').val());
            // 开始时间
            var startTime = $('#controlCard_Time').find('.datepicker-input').eq(0).val();
            // 结束时间
            var endTime = $('#controlCard_Time').find('.datepicker-input').eq(1).val();

            //阈值
            var threshold = Number($('#sliderInputPortraitCard2').val());
            if (threshold < 60 || threshold > 100) {
                warningTip.say('阈值为60-99之间的整数');
            }
            //布控原因
            var reason = $.trim($('#controlCard_reason').val());

            //公开范围
            if ($("#viewcameraRadioLableCrad1").hasClass('ui-checkboxradio-checked')) {
                var viewList = $('#controlCard_viewList').data('gidArr');
                var viewUserList = [];
            } else {
                var viewList = [];
                var viewUserList = $('#controlCard_viewUserList').data('noticeUserList');
            }
            var portData = {
                libId: $('.portraitCard-new-popup').data("libId") ? $('.portraitCard-new-popup').data("libId") : '',
                name: name ? name : '', //任务名
                threshold: threshold ? threshold : '', //阈值
                startTime: startTime ? startTime : '',
                endTime: endTime ? endTime : '',
                viewList: viewList ? viewList : [], // 公开范围 按机构
                viewUserList: viewUserList ? viewUserList : [], //公开范围 按人
                reason: reason ? reason : '',
            };
            //校验
            var controlFlag = true;
            Object.keys(portData).forEach(function (key) {
                if ((key == 'name' || key == 'threshold' || key == 'reason') && (portData[key] == '' || portData[key] == [])) {
                    if (key == 'startTime' || key == 'endTime') {
                        $('#controlCard_Time').addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').text("请选择开始和结束时间").removeClass('hide');
                    } else {
                        $('#controlCard_' + key).addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').removeClass('hide');
                    }
                    controlFlag = false;
                }
                if (key == 'viewList' || key == 'viewUserList') {
                    if (portData.viewList.length == 0 && portData.viewUserList.length == 0) {
                        $('#controlCard_' + key).addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').text("请选择公开范围").removeClass('hide');
                        controlFlag = false;
                    }
                }
                if (key == 'startTime' || key == 'endTime') {
                    if (portData['startTime'] == portData['endTime']) {
                        $('#controlCard_Time').addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').text("开始时间和结束时间不能相等").removeClass('hide');
                        controlFlag = false;
                    }
                    var nowDate = new Date(Date.parse(sureSelectTime().now.replace(/-/g, "/"))).getTime();
                    var endDate = new Date(Date.parse(endTime.replace(/-/g, "/"))).getTime();
                    if (endDate < nowDate) {
                        $('#controlCard_Time').addClass('no-input-warning').closest('.form-group').find('.text-danger.tip').text("结束时间不能小于当前时间").removeClass('hide');
                        controlFlag = false;
                    }
                }
            });

            // 按人布控的图片需要保存起来 编辑的时候调用
            if (controlFlag) {
                var portDataSuccessFunc = function (data) {
                    if (data.code === '200') {
                        setTimeout(() => {
                            $('.portraitCard-new-popup').addClass('hide').removeClass('show').removeData('controlData');
                            if (controlId) {
                                window.editSuccess(controlId);
                            } else {
                                var $barItem = $('#pageSidebarMenu .aui-icon-personnel').closest('.sidebar-item'),
                                    barIndex = $barItem.index(),
                                    $saveItem = $('#content-box').children().eq(barIndex),
                                    url = $('#pageSidebarMenu .aui-icon-personnel').parent("a").attr("lc") + "?dynamic=" + Global.dynamic;
                                $barItem.addClass('active').siblings().removeClass('active');
                                $saveItem.removeClass('hide').siblings().addClass('hide');
                                loadPage($saveItem, url);
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
                loadData('v3/distributeManager/editDistributeTask', true, portData, portDataSuccessFunc);
                showLoading($('.layout-type2 .aui-card'));
            }
        });

        // 新建/编辑布控 关闭图标点击事件
        $('#portraitCardBackPrevPage').click(function () {
            $('.portraitCard-new-popup').data({
                'controlId': ''
            });
        });

        // 新建/编辑布控 取消按钮点击事件
        $('#cancelEditPortrait').click(function () {
            $('#portraitCardBackPrevPage').click();
            $('.portraitCard-new-popup').data({
                'controlId': ''
            });
        });

        $(document).on("click", "#portraitCardBackPrevPage", function () {
            //新建布控时，点击返回回到进入的页面
            $('.portraitCard-new-popup').addClass('hide').removeClass('show').removeData('controlData');
        });
    })
})(window, window.jQuery)