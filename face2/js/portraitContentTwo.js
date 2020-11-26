(function (window, $) {
    // 默认数据
    var settings = {
        deleteBaseInfoId: '', //基本信息id
        containerDataTwo: {  //基本信息
            'libId': '108',
            'page': '1',
            'size': '15'
        },
        containerDataSearchTwo: {  //档案详情
            'page': '1',
            'size': '15'
        },
        detailRxId: '',  //详情人员id
        detailType: '1',  //判断是基本信息进入的详情弹窗还是详情搜索  1.基本信息   2.详情搜索
        zjUrl: '',   //证件照地址
        eventId: '',
        labelsData: []
    };

    initControlConfig();

    // 初始化
    function initControlConfig() {
        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });
        $('#portraitTwo_gender').find('.ui-checkboxradio-label').eq(0).click();
        refreshAlarmPageListTwo();
        loadSearchOrgInfoPort();
        loadLabels();
    };
    /**
     * 分局的下拉选择
     */
    function loadSearchOrgInfoPort() {
        showLoading($("#platform_uploadOrgId").closest('.camera-drop-select'));
        showLoading($("#platformSearch_uploadOrgId").closest('.camera-drop-select'));
        var port = 'v2/org/getOrgInfos',
            data = {
                orgType: 1,
                userType: 2,
                returnType: 3
            },
            successFunc = function (data) {
                hideLoading($("#platform_uploadOrgId").closest('.camera-drop-select'));
                hideLoading($("#platformSearch_uploadOrgId").closest('.camera-drop-select'));
                if (data.code == '200') {
                    var result = data.data;
                    //对数组进行排序没有父元素的在最上层
                    if (result && result.length) {
                        var itemHtml = '';
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].parentId) {
                                itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                            } else {
                                itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}">${result[i].orgName}</option>`;
                            }
                        }

                        $("#platform_uploadOrgId").empty().append(itemHtml);
                        $("#platformSearch_uploadOrgId").empty().append(itemHtml);

                        $("#platform_uploadOrgId").selectpicker({
                            allowClear: false
                        });
                        $("#platformSearch_uploadOrgId").selectpicker({
                            allowClear: false
                        });

                        $("#platform_uploadOrgId").selectpicker('refresh');
                        $("#platformSearch_uploadOrgId").selectpicker('refresh');
                    } else {
                        $("#platform_uploadOrgId").prop('disabled', true);
                        $("#platform_uploadOrgId").val(null);
                        $("#platform_uploadOrgId").selectpicker('refresh');
                        $("#platformSearch_uploadOrgId").prop('disabled', true);
                        $("#platformSearch_uploadOrgId").val(null);
                        $("#platformSearch_uploadOrgId").selectpicker('refresh');
                    }
                }
            };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };

    /**
     * 标签的下拉选择
     */
    function loadLabels() {
        showLoading($("#portraitTwo_labels").closest('.camera-drop-select'));
        var port = 'v2/memberFiles/memberLabels',
            data = {},
            successFunc = function (data) {
                hideLoading($("#portraitTwo_labels").closest('.camera-drop-select'));
                if (data.code == '200') {
                    var result = data.data;
                    settings.labelsData = data.data;
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

    /**
	 * 刷新右侧内容和右侧内容分页的数据
	 */
    function refreshAlarmPageListTwo() {
        loadRightContainerTwo(settings.containerDataTwo, function (totalSize, totalPage) {
            setPageParams($('#portraitPaginationTwo'), totalSize, totalPage, function (currPage, pageSize) {
                settings.containerDataTwo.page = currPage;
                settings.containerDataTwo.size = pageSize;
                loadRightContainerTwo(settings.containerDataTwo);
            }, true, [{
                value: 12,
                text: '12/页'
            }, {
                value: 15,
                text: '15/页',
                selected: true
            }, {
                value: 30,
                text: '30/页'
            }, {
                value: 45,
                text: '45/页'
            }]);
        });
    };

    /** 右侧内容区域刷新方法
     * 
     * @param {*} containerDataTwo   //数据
     * @param {*} loadEndCallback   //翻页回调
     */
    function loadRightContainerTwo(containerDataTwo, loadEndCallback) {
        showLoading($("#portraitResultContainerTwo").closest('.layout-type3'));
        var port = 'v2/memberFiles/basics',
            successFunc = function (data) {
                hideLoading($("#portraitResultContainerTwo").closest('.layout-type3'));
                var _data = data.data;
                if (data.code == '200') {
                    var _list = _data.list;
                    $('#portraitContainerTwo').find('.card-title-box .title-count').text('0');
                    if (_list && _list.length > 0) {
                        $("#portraitResultContainerTwo").show();
                        $('#portraitEmptyContainerTwo').hide();
                        // 调用人员信息卡片节点拼接方法
                        createCardDomTwo(_list, $('#cardInfoListTwo'));
                        createListDomTwo(_list, $('#portraitTableListTwo tbody'));
                        // 修改右侧头部共多少条数据文本
                        $('#portraitContainerTwo').find('.card-title-box .title-count').text(_data.total);

                    } else {
                        $("#portraitResultContainerTwo").hide();
                        $('#portraitEmptyContainerTwo').show();
                        loadEmpty($('#portraitEmptyContainerTwo'), "暂无人员信息", "当前库暂无人员数据");
                    }
                    loadEndCallback && loadEndCallback(_data.total, _data.totalPage);
                } else {
                    $("#portraitResultContainerTwo").hide();
                    $('#portraitEmptyContainerTwo').show()
                    loadEmpty($('#portraitEmptyContainerTwo'), "", "系统异常，请重新修改过滤条件");
                    loadEndCallback && loadEndCallback(0, 0);
                }
            };
        loadData(port, true, containerDataTwo, successFunc);
    };

    /** 人员信息卡片节点拼接
     * 
     * @param {*} data 传入的数据
     * @param {*} container 插入节点
     */
    function createCardDomTwo(data, container) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += `
                <li class="image-info image-card-item" personId="${data[i].rxId}" detailUrl="${data[i].url}" otherId="${data[i].id}">
                    <div class="image-box">
                        <div class="image-box-flex">
                            <div class="image-checkbox-wrap ${data[i].source == 1 ? '' : 'hide'}">
                                <label class="ui-checkboxradio-checkbox-label ui-checkboxradio-label ui-button ui-widget">
                                    <span class="ui-checkboxradio-icon  ui-icon ui-icon-background ui-icon-blank"></span>
                                </label>
                            </div>
                            <img class="img img-right-event" src="${data[i].url ? data[i].url : './assets/images/control/person.png'}"></img>
                        </div>
                    </div>
                    <div class="info-box">
                        <div class="form-info">
                            <div class="form-group aui-row">
                                <label class="aui-form-label aui-col-8">姓名：</label>
                                <div class="form-text aui-col-16">
                                    <span>${data[i].name ? data[i].name : '暂无'}</span>
                                </div>
                            </div>
                            <div class="form-group aui-row">
                                <label class="aui-form-label aui-col-8">性别：</label>
                                <div class="form-text aui-col-16">${data[i].gender == '1' ? '男' : data[i].gender == '2' ? '女' : '未知'}</div>
                            </div>
                            <div class="form-group aui-row">
                                <label class="aui-form-label aui-col-8">生日：</label>
                                <div class="form-text aui-col-16">${data[i].birthday ? data[i].birthday : '暂无'}</div>
                            </div>
                            <div class="form-group aui-row">
                                <label class="aui-form-label aui-col-8">身份证号：</label>
                                <div class="form-text aui-col-16">${data[i].idcard ? data[i].idcard : '暂无'}</div>
                            </div>
                        </div>
                    </div>
                </li>
                `;
        }
        // 先清空节点,再把拼接的节点插入
        container.empty().html(html);
        container.find('.image-card-item').each(function (index, el) {
            $(this).data('list', data[index]);
        });
    };

    /**
     * 人员信息列表节点拼接
     * @param {*} data 目标数据
     * @param {*} $container 目标容器
     */
    function createListDomTwo(data, $container) {
        var _html = '';
        for (var i = 0; i < data.length; i++) {
            _html += `
                <tr class="table-row" personId="${data[i].rxId}" detailUrl="${data[i].url}" otherId="${data[i].id}">
                    <td class="bs-checkbox ">
                        <div class="table-checkbox ${data[i].source == 1 ? '' : 'hide'}">
                            <input data-index="0" name="btSelectItem" type="checkbox" value="0" class="table-checkbox-input table-checkbox-input-configDetail">
                            <span class="table-checkbox-label"></span>
                        </div>
                    </td>
                    <td><img class="table-img" src="${data[i].url ? data[i].url : './assets/images/control/person.png'}" alt=""></td>
                    <td class="text-link list-detail">${data[i].name ? data[i].name : '暂无'}</td>
                    <td>${data[i].idcard ? data[i].idcard : '暂无'}</td>
                    <td>${data[i].gender == '1' ? '男' : data[i].gender == '2' ? '女' : '未知'}</td>
                    <td>${data[i].birthday ? data[i].birthday : '暂无'}</td>
                    <!--<td>
                        <span class="tag ${data[i].userType == '1' ? ' tag-error ' : data[i].userType == '2' ? ' tag-warning ' : data[i].userType == '1' ? ' tag-white ' : ' display-none '}">
                            ${data[i].userType == '1' ? '在逃' : data[i].userType == '2' ? '重点人员' : data[i].userType == '1' ? '白名单' : ''}
                        </span>
                    </td>-->
                </tr>
            `;
        }
        // 先清空节点,再把拼接的节点插入
        $container.empty().html(_html);
        $container.find('.table-row').each(function (index, el) {
            $(this).data('list', data[index]);
        });
    };

    /**身份证姓名查询
     * 
     * @param {*} $dom 身份证姓名验证节点
     */
    function idcardNameSearchTwo($dom) {
        var searchVal = $dom.val();
        //var regIdCard = /(^\d{15}$)|(^\d{17}(\d|X)$)/; // 身份证校验
        var regName = /^[\u4e00-\u9fa5\uf900-\ufa2d·s]{1,20}$/; // 名字校验

        if (regIdCard.test(searchVal)) { // 身份证校验通过
            $dom.removeClass('error').closest('.aui-input-affix-wrapper').siblings('.text-error').addClass('display-none');
            settings.containerDataTwo.idcard = searchVal;
            $('#portraitContainerTwo').data('idcard', searchVal);
            refreshAlarmPageListTwo();

        } else if (regName.test(searchVal)) { // 姓名校验通过
            $dom.removeClass('error').closest('.aui-input-affix-wrapper').siblings('.text-error').addClass('display-none');
            settings.containerDataTwo.name = searchVal;
            $('#portraitContainerTwo').data('name', searchVal);
            refreshAlarmPageListTwo();
        } else if (searchVal == '') { // 数据清空时
            settings.containerDataTwo.idcard = searchVal;
            settings.containerDataTwo.name = searchVal;
            $('#portraitContainerTwo').data('idcard', searchVal);
            $('#portraitContainerTwo').data('name', searchVal);
            refreshAlarmPageListTwo();
        } else {
            $dom.addClass('error').closest('.aui-input-affix-wrapper').siblings('.text-error').removeClass('display-none');
        }
    };

    //获取人员id用于编辑删除
    function getRxId() {
        var RxId = '';
        var otherId = '';
        if ($("#showListTwo").hasClass("btn-primary")) {  //列表模式
            for (var i = 0; i < $("#portraitTableListTwo").find("tbody .table-checkbox-input-configDetail").length; i++) {
                if ($("#portraitTableListTwo").find("tbody .table-checkbox-input-configDetail").eq(i).is(":checked")) {
                    RxId = $("#portraitTableListTwo").find("tbody .table-checkbox-input-configDetail").eq(i).parents(".table-row").attr("personid");
                    otherId = $("#portraitTableListTwo").find("tbody .table-checkbox-input-configDetail").eq(i).parents(".table-row").attr("otherId");
                }
            }
        } else {   //图片模式
            for (var i = 0; i < $("#cardInfoListTwo").find(".image-info.image-card-item").length; i++) {
                if ($("#cardInfoListTwo").find(".image-info.image-card-item").eq(i).find(".ui-checkboxradio-checkbox-label").hasClass("ui-checkboxradio-checked")) {
                    RxId = $("#cardInfoListTwo").find(".image-info.image-card-item").eq(i).attr("personid");
                    otherId = $("#cardInfoListTwo").find(".image-info.image-card-item").eq(i).attr("otherId");
                }
            }
        }
        return {
            RxId: RxId,
            otherId: otherId
        };
    };

    /**详情标签获取
     * @param {*} type 标签id
     */
    function getLabelsType(id) {
        var labelName = '';
        settings.labelsData.forEach(val => {
            if (val.labelId == id) {
                labelName = val.labelName;
            }
        });

        return labelName;
    };

    /**详情信息展示
     * @param {*} $url 证件照地址
     * @param {*} $id 人员ID
     */
    function showDetailInfo($url, $id) {
        var port = 'v2/memberFiles/memberDetails',
            portData = {
                "rxId": $id
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    hideLoading($("#portraitDetailSearchTwo"));
                    var data = data.data;
                    if (data) {
                        $("#portraitContainerTwo").addClass("hide");
                        $("#portraitDetailSearchTwo").removeClass("hide");
                        if (data.source == 2 || $("#twoCRDBut").find(".btn").length == 0) {
                            $("#createDetailCardTwo").addClass("hide");
                        } else {
                            $("#createDetailCardTwo").removeClass("hide");
                        }
                        $("#illegalInfo").html("");
                        //人员信息
                        //证件照图片
                        $("#detailUrl").attr("src", $url ? $url : './assets/images/control/person.png');
                        // 姓名
                        $('#detailName').text(data.name ? data.name : '暂无');
                        // 英文名
                        $('#detailEngName').text(data.engName ? data.engName : "暂无");
                        //通行证号码
                        $('#detailPassNo').text(data.passNo ? data.passNo : "暂无");
                        // 性别
                        $('#detailGender').text(data.gender ? (data.gender == 1 ? "男" : "女") : "暂无");
                        // 电话号码
                        $('#detailTelNo').text(data.telNo ? data.telNo : "暂无");
                        // 身份证
                        $('#detailIdcard').text(data.idcard ? data.idcard : "暂无");
                        // 出生年月
                        $('#detailBirthday').text(data.birthday ? data.birthday : "暂无");
                        // 户籍所在地
                        $('#detailRegaddress').text(data.regaddress ? data.regaddress : "暂无");
                        // 违法时间
                        $('#detailIllegallyTime').text(data.illegallyTime ? data.illegallyTime : "暂无");
                        // 毕业院校
                        $('#detailSchool').text(data.school ? data.school : "暂无");
                        // 是否抓获
                        if (data.arrested == 1) {  //是
                            $('#detailIsArrest').text("是" + (data.abscondArea ? '(' + data.abscondArea + ')' : ''));
                        } else if (data.arrested == 2) {  //否
                            $('#detailIsArrest').text("否");
                        } else {  //潜逃
                            $('#detailIsArrest').text("潜逃" + (data.abscondArea ? '(' + data.abscondArea + ')' : ''));
                        }
                        // 上传人
                        $('#detailUserName').text(data.source == '1' ? (data.userName ? data.userName : "暂无") : (data.realname ? data.realname : "暂无"));
                        // 上传机构
                        $('#detailOrgName').text(data.source == '1' ? (data.orgName ? data.orgName : "暂无") : (data.deptname ? data.deptname : "暂无"));
                        // 上传时间
                        $('#detailCreateTime').text(data.createTime ? data.createTime : "暂无");
                        //背景资料
                        $("#detailBackgroundInfo").text(data.backgroundInfo ? data.backgroundInfo : "暂无");
                        // 违法地点
                        $('#detailIllegallyAdd').text(data.illegallyAdd ? data.illegallyAdd : "暂无");
                        //违法行为
                        $("#detailOnSiteDelict").text(data.onSiteDelict ? data.onSiteDelict : "暂无");
                        //涉嫌全国性罪名
                        $("#detailStateCharge").text(data.stateCharge ? data.stateCharge : "暂无");
                        //涉嫌香港罪名
                        $("#detailHhkCharge").text(data.hhkCharge ? data.hhkCharge : "暂无");
                        //说明
                        $("#detailComments").text(data.comments ? data.comments : "暂无");
                        // 标签
                        if (data.label) {
                            if (data.labels.length > 0) {
                                $('#detailTag').html("");
                                data.labels.forEach(item => {
                                    if (getLabelsType(item) != '') {
                                        var htmlLabel = `<span class="detailLabelItem">${getLabelsType(item)}</span>`;
                                        $('#detailTag').append(htmlLabel);
                                    }
                                });

                                if ($('#detailTag').find(".detailLabelItem").length == 0) {
                                    $('#detailTag').html("暂无");
                                }
                            } else {
                                $('#detailTag').html("暂无");
                            }
                        } else {
                            $('#detailTag').html("暂无");
                        }

                        //出入境截图
                        if (data.exitEntryList.length > 0) {
                            $("#detailExitEntry").html(`<a class="photo-link" href="${data.exitEntryList[0].url}" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
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
                            if (element.actCompareShotList.length > 0) {  //现场比对照截图个数
                                element.actCompareShotList.forEach((item) => {
                                    htmlActCompareShotList += `<a class="photo-link" href="${item.url}" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
                                                                    <img src="${item.url}" onerror="this.error=null;this.src='./assets/images/control/person.png'" alt="现场比对照截图">
                                                                </a>`
                                });
                            } else {
                                htmlActCompareShotList = '暂无';
                            }

                            if (element.comparisonShotList.length > 0) {  //对比照截图
                                element.comparisonShotList.forEach((item) => {
                                    htmlComparisonShotList += `<a class="photo-link" href="${item.url}" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
                                                                    <img src="${item.url}" onerror="this.error=null;this.src='./assets/images/control/person.png'" alt="现场比对照截图">
                                                                </a>`
                                });
                            } else {
                                htmlComparisonShotList = '暂无';
                            }

                            if (element.actScreenshotList.length > 0) {  //现场照截图
                                element.actScreenshotList.forEach((item) => {
                                    htmlActScreenshotList += `<a class="photo-link" href="${item.url}" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
                                                                    <img src="${item.url}" onerror="this.error=null;this.src='./assets/images/control/person.png'" alt="现场比对照截图">
                                                                </a>`
                                });
                            } else {
                                htmlActScreenshotList = '暂无';
                            }

                            if (element.sourceVideoList.length > 0) {  //相关视频
                                element.sourceVideoList.forEach((item) => {
                                    htmlSourceVideoList += `<span class="video-link" videoUrl="${item.url}" filename="${item.fileName}" zmurl="${item.zmUrl}">
                                                                <img src="./assets/images/icons/video.bmp" />
                                                            </span>`
                                });
                            } else {
                                htmlSourceVideoList = '暂无';
                            }

                            if (element.actMapList.length > 0) {  //现场地图
                                element.actMapList.forEach((item) => {
                                    htmlActMapList += `<a class="photo-link" href="${item.url}" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
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
                                                <div class="detailBtn ${(data.source == 2 || $('#twoCRDBut').find('.btn').length == 0) ? 'hide' : ''}">
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
                                                                <a class="photo-link" href="${$url ? $url : './assets/images/control/person.png'}" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
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
                            $("#illegalInfo").append(html);
                            $("#illegalInfo").find(".fh-section-item.supplement-info").eq(index).data("allData", element);
                        });
                    } else {
                        warningTip.say('当前人员已经不存在');
                    }
                }
            };
        loadData(port, true, portData, successFunc, undefined, "GET");
    };

    //详情上传添加html代码
    function addDetailTypeHtml(addDetailTypeNum, type) {
        var addDetailLength = $("#addDetailInfoType").find(".modalInfo.portraitContentModalInfo").length;
        var html = `<div class="modalInfo portraitContentModalInfo" typeTag=${addDetailTypeNum + 1}>
                        <div class="card-title-box">
                            <i class="aui-icon-face card-title-icon"></i>
                            <span class="card-title">违法信息${addDetailTypeNum + 1}</span>
                            <button type="button" class="btn btn-primary btn-sm addInfoType ${type == 1 ? '' : 'hide'}">${(addDetailLength + 1) == 1 ? '添加' : '删除'}</button>
                        </div>
                        <div class="aui-from-horizontal aui-ml-md aui-mt-sm">
                            <div class="form-group aui-row">
                                <div class="aui-col-12">
                                    <label class="aui-form-label aui-col-6 control-label">关联事件：</label>
                                    <div class="aui-col-18">
                                        <input id="configLoad_eventName_${addDetailTypeNum + 1}" type="text" class="aui-input" placeholder="请输入关联事件">
                                    </div>
                                </div>
                                <div class="aui-col-12">
                                    <label class="aui-form-label aui-col-6 control-label">关联线索：</label>
                                    <div class="aui-col-18">
                                        <input id="configLoad_clueName_${addDetailTypeNum + 1}" type="text" class="aui-input" placeholder="请输入关联线索">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group aui-row">
                                <div class="aui-col-12">
                                    <label class="aui-form-label aui-col-6 control-label">违法时间：</label>
                                    <div class="aui-col-18">
                                        <div class="input-daterange datepicker-box aui-input wid-100 v-middle float-right" style="font-size:0.75rem;">
                                            <input id="configLoad_illegallyTime_${addDetailTypeNum + 1}" class="input-text datepicker-input radius Wdate" style="width: 100%;text-align: left;"
                                                type="text" onFocus="WdatePicker({dateFmt:'yyyy-MM-dd',autoPickDate:true})" placeholder="请选择违法时间"
                                            />
                                            <span class="input-group-addon">
                                                <i class="datepicker-icon aui-icon-calendar"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="aui-col-12">
                                    <label class="aui-form-label aui-col-6 control-label">违法地点：</label>
                                    <div class="aui-col-18">
                                        <input id="configLoad_illegallyAdd_${addDetailTypeNum + 1}" type="text" class="aui-input" placeholder="请输入违法地点">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group aui-row">
                                <div class="aui-col-12">
                                    <label class="aui-form-label aui-col-6 control-label">违法行为：</label>
                                    <div class="aui-col-18">
                                        <textarea id="configLoad_onSiteDelict_${addDetailTypeNum + 1}" placeholder="请输入违法行为" cols="30" rows="10" class="aui-textarea"></textarea>
                                    </div>
                                </div>
                                <div class="aui-col-12">
                                    <label class="aui-form-label aui-col-6 control-label">来源信息：</label>
                                    <div class="aui-col-18">
                                        <textarea id="configLoad_sourceInfo_${addDetailTypeNum + 1}" placeholder="请输入来源信息" cols="30" rows="10" class="aui-textarea"></textarea>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group aui-row">
                                <div class="aui-col-12">
                                    <label class="aui-form-label aui-col-6 control-label">涉嫌全国性罪名：</label>
                                    <div class="aui-col-18">
                                        <textarea name="" id="configLoad_stateCharge_${addDetailTypeNum + 1}" placeholder="请输入涉嫌全国性罪名" cols="30" rows="10" class="aui-textarea"></textarea>
                                    </div>
                                </div>
                                <div class="aui-col-12">
                                    <label class="aui-form-label aui-col-6 control-label">涉嫌香港罪名：</label>
                                    <div class="aui-col-18">
                                        <textarea name="" id="configLoad_hhkCharge_${addDetailTypeNum + 1}" placeholder="请输入涉嫌香港罪名" cols="30" rows="10" class="aui-textarea"></textarea>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group aui-row">
                                <div class="aui-col-12">
                                    <label class="aui-form-label aui-col-6 control-label">现场人物特征描述：</label>
                                    <div class="aui-col-18">
                                        <textarea name="" id="configLoad_actDescription_${addDetailTypeNum + 1}" placeholder="请输入现场人物特征描述" cols="30" rows="10" class="aui-textarea"></textarea>
                                    </div>
                                </div>
                                <div class="aui-col-12">
                                    <label class="aui-form-label aui-col-6 control-label">备注/说明：</label>
                                    <div class="aui-col-18">
                                        <textarea name="" id="configLoad_comments_${addDetailTypeNum + 1}" placeholder="请输入备注/说明" cols="30" rows="10" class="aui-textarea"></textarea>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group aui-row">
                                <div class="aui-col-12">
                                    <label class="aui-form-label aui-col-6 control-label">现场比对照截图：</label>
                                    <div class="aui-col-18 pic-add-box">
                                        <div id="addUploadXCBDImg_${addDetailTypeNum + 1}" class="addUploadXCBDImg addUploadImgOnePic">
                                            <div class="upload pic-add">
                                                <i class="aui-icon-add"></i>
                                                <form method="POST" name="fileinfo" enctype="multipart/form-data">
                                                    <input class="uploadFile" type="file" name="onePicImg" />
                                                </form>
                                                <img class="pic-add-img hide" src="" alt="">
                                                <i class="aui-icon-delete-line hide"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="aui-col-12">
                                    <label class="aui-form-label aui-col-6 control-label">对比照截图：</label>
                                    <div class="aui-col-18">
                                        <div id="addUploadBDImg_${addDetailTypeNum + 1}" class="addUploadBDImg addUploadImgOnePic">
                                            <div class="upload pic-add">
                                                <i class="aui-icon-add"></i>
                                                <form method="POST" name="fileinfo" enctype="multipart/form-data">
                                                    <input class="uploadFile" type="file" name="onePicImg">
                                                </form>
                                                <img class="pic-add-img hide" src="" alt="">
                                                <i class="aui-icon-delete-line hide"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group aui-row">
                                <div class="aui-col-12">
                                    <label class="aui-form-label aui-col-6 control-label">现场照截图(可多张)：</label>
                                    <div class="aui-col-18 pic-add-box">
                                        <div id="addUploadXCImg_${addDetailTypeNum + 1}" class="addUploadXCImg addMoreType">
                                            <div class="upload pic-add">
                                                <i class="aui-icon-add"></i>
                                                <form method="POST" name="fileinfo" enctype="multipart/form-data">
                                                    <input class="uploadFile" type="file" name="morePicImg">
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="aui-col-12">
                                    <label class="aui-form-label aui-col-6 control-label">现场地图：</label>
                                    <div class="aui-col-18">
                                        <div id="addUploadMap_${addDetailTypeNum + 1}" class="addUploadMap addUploadImgOnePic">
                                            <div class="upload pic-add">
                                                <i class="aui-icon-add"></i>
                                                <form method="POST" name="fileinfo" enctype="multipart/form-data">
                                                    <input class="uploadFile" type="file" name="onePicImg">
                                                </form>
                                                <img class="pic-add-img hide" src="" alt="">
                                                <i class="aui-icon-delete-line hide"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group aui-row">
                                <div class="aui-col-12">
                                    <label class="aui-form-label aui-col-6 control-label">比对人：</label>
                                    <div class="aui-col-18">
                                        <input id="configLoad_comparisonor_${addDetailTypeNum + 1}" type="text" class="aui-input" placeholder="录入格式：XX分局：某某某">
                                    </div>
                                </div>
                                <!--<div class="aui-col-12">
                                    <label class="aui-form-label aui-col-6 control-label">相关视频(可多个)：</label>
                                    <div class="aui-col-18">
                                        <div id="addUploadVideo_${addDetailTypeNum + 1}" class="addUploadVideo addMoreType">
                                            <div class="upload pic-add">
                                                <i class="aui-icon-add"></i>
                                                <form method="POST" name="fileinfo" enctype="multipart/form-data">
                                                    <input class="uploadFile" type="file" name="moreVideo">
                                                </form>
                                                <img class="pic-add-img hide" src="" alt="">
                                            </div>
                                        </div>
                                    </div>
                                </div>-->
                            </div>
                        </div>
                    </div>`;

        return html;
    };

    //图片展示和列表展示切换
    $('#portraitContainerTwo').on('click', '#showCardTwo', function () {
        $("#portraitTableListTwo").find(".table-checkbox-input-configDetail").removeAttr("checked");
        // 点击列表展示按钮
        $(this).addClass('btn-primary');
        $('#showListTwo').removeClass('btn-primary');

        $('#cardInfoListTwo').removeClass('display-none');
        $('#listContainerWrapTwo').addClass('display-none');
    }).on('click', '#showListTwo', function () {
        $("#portraitResultContainerTwo").find(".image-info.image-card-item .ui-checkboxradio-checkbox-label").removeClass("ui-checkboxradio-checked");
        // 点击表格展示按钮
        $(this).addClass('btn-primary');
        $('#showCardTwo').removeClass('btn-primary');

        $('#listContainerWrapTwo').removeClass('display-none');
        $('#cardInfoListTwo').addClass('display-none');
    }).on('click', '#createCardTwo', function () {
        // 点击新建按钮切换内容
        var $this = $(this);
        $('#createContainerTwo').find('[id*=portraitTwo_]').removeClass('no-input-warning').val('').closest('.form-group').find('.text-danger').addClass('hide');
        $("#noImgWarning").addClass("hide");
        $("#createContainerTwo .card-title").html("新建人员信息");
        $('#createContainerTwo').removeClass('display-none');
        $('#createContainerTwo').attr('rxId', '');
        $('#createContainerTwo').attr('otherId', '');

        $('#addUploadImgTwo').find('.uploadFile').attr('title', '');
        $('#addUploadImgTwo').find('.uploadFile').val('').removeClass("hide");
        $('#addUploadImgTwo').find('.pic-add-img').attr('src', '').addClass('hide').siblings('.aui-icon-add').removeClass('hide');
        $('#addUploadImgThree').find('.uploadFile').val('');
        $('#addUploadImgThree').find('.pic-add-img').attr({
            src: '',
            picurl: '',
            filename: '',
            id: ''
        }).addClass('hide').siblings('.aui-icon-add').removeClass('hide');
        $('#addUploadImgThree').find('.uploadFile').attr('title', '');
        $('#addUploadImgThree').find('.aui-icon-delete-line').addClass('hide');
        $("#addUploadImgTwo .uploadFile").removeAttr("disabled");
        $("#portraitTwo_labels").val("");
        $("#portraitTwo_labels").selectpicker('refresh');

        $('#portraitTwo_gender').find('.ui-checkboxradio-label').eq(0).click();
    }).on('click', '#editCardTwo', function () {
        if (getRxId().RxId && getRxId().otherId) {
            $("#addUploadImgTwo .uploadFile").attr("disabled", "disabled");
            // 点击编辑按钮切换内容
            $('#createContainerTwo').find('[id*=portraitTwo_]').removeClass('no-input-warning').val('').closest('.form-group').find('.text-danger').addClass('hide');
            $("#noImgWarning").addClass("hide");
            $('#addUploadImgTwo').find('.uploadFile').val('');
            $('#addUploadImgTwo').find('.pic-add-img').attr('src', '').addClass('hide').siblings('.aui-icon-add').removeClass('hide');

            $('#portraitTwo_gender').find('.ui-checkboxradio-label').eq(0).click();

            var port = 'v2/memberFiles/memberDetails',
                portData = {
                    "rxId": getRxId().RxId,
                    "id": getRxId().otherId
                },
                successFunc = function (data) {
                    if (data.code == '200') {
                        var data = data.data;
                        if (data) {
                            // 人员id
                            $('#createContainerTwo').attr('rxId', getRxId().RxId);
                            $('#createContainerTwo').attr('otherId', getRxId().otherId);

                            if ($("#cardInfoListTwo").hasClass("display-none")) {
                                for (var i = 0; i < $("#portraitTableListTwo").find("tbody .table-checkbox-input-configDetail").length; i++) {
                                    if ($("#portraitTableListTwo").find("tbody .table-checkbox-input-configDetail").eq(i).is(":checked")) {
                                        var url = $("#portraitTableListTwo").find("tbody .table-checkbox-input-configDetail").eq(i).parents("tr").find(".table-img").attr("src");
                                    }
                                }
                            } else {
                                for (var i = 0; i < $("#cardInfoListTwo").find(".image-info.image-card-item").length; i++) {
                                    if ($("#cardInfoListTwo").find(".image-info.image-card-item").eq(i).find(".ui-checkboxradio-checkbox-label").hasClass("ui-checkboxradio-checked")) {
                                        var url = $("#cardInfoListTwo").find(".image-info.image-card-item").eq(i).find("img").attr("src");
                                    }
                                }
                            }

                            // 人员图片 
                            $('#addUploadImgTwo .uploadFile').addClass("hide");
                            $('#addUploadImgTwo .aui-icon-add').addClass('hide').siblings('.pic-add-img').removeClass('hide').attr('src', url);
                            // 姓名
                            $('#portraitTwo_name').val(data.name);
                            // 性别
                            if (data.gender == 1) {
                                $('#portraitTwo_gender').find('.ui-checkboxradio-label').eq(0).click();
                            } else {
                                $('#portraitTwo_gender').find('.ui-checkboxradio-label').eq(1).click();
                            }
                            // 出生年月
                            $('#portraitTwo_birthday').val(data.birthday);
                            //通行证号码
                            $('#portraitTwo_passNo').val(data.passNo);
                            // 违法地点
                            $('#portraitTwo_illegallyAdd').val(data.illegallyAdd);
                            // 英文名
                            $('#portraitTwo_engName').val(data.engName);
                            // 身份证
                            $('#portraitTwo_idcard').val(data.idcard);
                            // 户籍所在地
                            $('#portraitTwo_regaddress').val(data.regaddress);
                            // 电话号码
                            $('#portraitTwo_telNo').val(data.telNo);
                            // 违法时间
                            $('#portraitTwo_illegallyTime').val(data.illegallyTime);
                            //背景资料
                            $("#portraitTwo_backgroundInfo").val(data.backgroundInfo);
                            //违法行为
                            $("#portraitTwo_onSiteDelict").val(data.onSiteDelict);
                            //涉嫌全国性罪名
                            $("#portraitTwo_stateCharge").val(data.stateCharge);
                            //涉嫌香港罪名
                            $("#portraitTwo_hhkCharge").val(data.hhkCharge);
                            //说明
                            $("#portraitTwo_comments").val(data.comments);
                            //毕业院校
                            $("#portraitTwo_school").val(data.school);
                            //标签
                            $("#portraitTwo_labels").val(data.labels);
                            $("#portraitTwo_labels").selectpicker('refresh');
                            //组织信息
                            $("#portraitTwo_organization").val(data.organization);
                            // 是否抓获
                            if (data.arrested == 1) { //是
                                $('#portraitTwo_arrested').find('.ui-checkboxradio-label').eq(0).click();
                                $("#portraitTwo_abscondArea").val(data.abscondArea).removeClass("hide");
                            } else if (data.arrested == 3) { //潜逃
                                $('#portraitTwo_arrested').find('.ui-checkboxradio-label').eq(2).click();
                                $("#portraitTwo_abscondArea").val(data.abscondArea).removeClass("hide");
                            } else {
                                $('#portraitTwo_arrested').find('.ui-checkboxradio-label').eq(1).click();
                                $("#portraitTwo_abscondArea").val(data.abscondArea).addClass("hide");
                            }
                            if (data.exitEntryList.length > 0) {
                                $("#addUploadImgThree").find(".pic-add-img").removeClass("hide").attr({
                                    src: data.exitEntryList[0].url,
                                    picurl: data.exitEntryList[0].url,
                                    filename: data.exitEntryList[0].fileName,
                                    id: data.exitEntryList[0].id
                                });
                                $('#addUploadImgThree').find('.uploadFile').val("").attr('title', '');
                                $("#addUploadImgThree").find(".aui-icon-delete-line").removeClass("hide");
                                $("#addUploadImgThree").find(".aui-icon-add").addClass("hide");
                            } else {
                                $("#addUploadImgThree").find(".pic-add-img").addClass("hide").attr({
                                    src: '',
                                    picurl: '',
                                    filename: '',
                                    id: ''
                                });
                                $('#addUploadImgThree').find('.uploadFile').val("").attr('title', '');
                                $("#addUploadImgThree").find(".aui-icon-delete-line").addClass("hide");
                                $("#addUploadImgThree").find(".aui-icon-add").removeClass("hide");
                            }

                            $("#createContainerTwo .card-title").html("编辑人员信息");
                            $('#createContainerTwo').removeClass('display-none');
                        }
                    }
                };
            loadData(port, true, portData, successFunc, undefined, "GET");
        } else {
            warningTip.say("请选择人员");
        }
    });

    // 是否抓获类型
    $('#createContainerTwo').on("change", "[data-role='radio']", function () {
        if ($(this).val() == '1') { //是
            $("#portraitTwo_abscondArea").removeClass("hide");
        } else if ($(this).val() == '2') { //否
            $("#portraitTwo_abscondArea").addClass("hide");
        } else {
            $("#portraitTwo_abscondArea").removeClass("hide");
        }
    });

    // 新建人员信息上传图片事件
    $('#addUploadImgTwo').on('change', '.uploadFile', function () {
        var _this = $(this);
        var reader = new FileReader();
        //获取图片大小
        var size = this.files[0].size / (1024 * 1024);
        if (size < 2) {
            reader.onload = function (e) {
                var addimg = reader.result;
                $('#addUploadImgTwo .aui-icon-add').addClass('hide').siblings('.pic-add-img').removeClass('hide').attr('src', addimg);
                $('#addUploadImgTwo').siblings('.text-danger').addClass('hide');
            };
            reader.readAsDataURL(this.files[0]);
        } else {
            $('#addImgWarningTwo').removeClass('hide');
        }
    });

    //出入境信息上传图片事件
    $('#addUploadImgThree').on('change', '.uploadFile', function () {
        var that = this,
            fileType = '',
            fileNameArr = this.value.split('\\'), // 文件名路径数组
            fileSize = this.files[0].size,
            fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
            fileNameTypeArr = fileName.split('.');
        fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase(),
            typeArr = ['bmp', 'jpg', 'jpeg', 'png', 'dib', 'webp', 'svgz', 'gif', 'ico', 'svg', 'tif', 'xbm', 'jfif', 'pjpeg', 'pjp', 'tiff'];
        if (typeArr.indexOf(fileType) < 0) {
            this.value = '';
            warningTip.say('格式不正确,请上传图片格式');
            return;
        }

        // 判断文件大小是否超过10M 
        if (fileSize > 10 * 1024 * 1024) {
            warningTip.say('上传文件过大,请上传不大于10M的文件');
            this.value = '';
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            var addimg = reader.result;

            var formFileData = new FormData($(that).parent()[0]),
                uploadFormData = new FormData(),
                xhr = new XMLHttpRequest(),
                token = $.cookie('xh_token'),
                file = formFileData.get('onePicImg');
            xhr.open('post', serviceUrl + '/v2/memberInfos/upload');
            xhr.setRequestHeader("token", token);
            uploadFormData.append('type', '1');
            uploadFormData.append('file', file);
            xhr.send(uploadFormData);
            showLoading($(that).parents(".pic-add"));
            xhr.onload = function (res) {  //视频
                var data = JSON.parse(res.currentTarget.response);
                hideLoading($(that).parents(".pic-add"));
                if (data.code === '200') {
                    var url = data.url;
                    $(that).parents(".pic-add").find(".pic-add-img").removeClass("hide").attr({
                        src: addimg,
                        picurl: url,
                        filename: data.fileName,
                        id: ''
                    });
                    $(that).parents(".pic-add").find(".aui-icon-delete-line").removeClass("hide");
                    $(that).parents(".pic-add").find(".aui-icon-add").addClass("hide");
                } else {
                    warningTip.say(data.message);
                }
            }
        };

        reader.readAsDataURL(this.files[0]);
    });

    //新建关闭点击事件
    $("#cancelSaveCloseTwo,#cancelTwo").on("click", function () {
        $('#createContainerTwo').addClass('display-none');
    });

    //新建/编辑确认按钮点击事件
    $("#addPersonSaveTwo").on("click", function () {
        var controlFlag = true;
        // 人员id
        var rxId = $('#createContainerTwo').attr('rxId');
        var id = $('#createContainerTwo').attr('otherId');
        // 人员图片 
        var rxImg = $('#addUploadImgTwo').find('.pic-add-img').attr('src');
        var rxImgType = '1';  //默认是base64
        if (rxImg.indexOf('data:image/') > -1) {
            var base64 = rxImg;
            rxImgType = '1';
        } else {
            var url = rxImg;
            rxImgType = '2';
        }
        // 所属库id
        var libId = '108';
        // 姓名
        var name = $('#portraitTwo_name').val();
        // 性别
        var gender = $('#portraitTwo_gender').find('.ui-checkboxradio-checked').siblings('input').val();
        // 出生年月
        var birthday = $('#portraitTwo_birthday').val();
        //通行证号码
        var passNo = $('#portraitTwo_passNo').val();
        // 违法地点
        var illegallyAdd = $('#portraitTwo_illegallyAdd').val();
        // 英文名
        var engName = $('#portraitTwo_engName').val();
        // 身份证
        var idcard = $('#portraitTwo_idcard').val();
        // 户籍所在地
        var regaddress = $('#portraitTwo_regaddress').val();
        // 电话号码
        var telNo = $('#portraitTwo_telNo').val();
        // 违法时间
        var illegallyTime = $('#portraitTwo_illegallyTime').val();
        //背景资料
        var backgroundInfo = $("#portraitTwo_backgroundInfo").val();
        //违法行为
        var onSiteDelict = $("#portraitTwo_onSiteDelict").val();
        //涉嫌全国性罪名
        var stateCharge = $("#portraitTwo_stateCharge").val();
        //涉嫌香港罪名
        var hhkCharge = $("#portraitTwo_hhkCharge").val();
        //说明
        var comments = $("#portraitTwo_comments").val();
        //是否抓获
        var arrested = $("#portraitTwo_arrested").find('.ui-checkboxradio-checked').siblings('input').val();
        //地区
        var abscondArea = $("#portraitTwo_abscondArea").val();
        //出入境截图
        var crurl = $('#addUploadImgThree').find('.pic-add-img').attr('picurl');
        var crfilename = $('#addUploadImgThree').find('.pic-add-img').attr('filename');
        if (crurl && crfilename) {
            var exitEntryList = [{
                url: crurl,
                fileName: crfilename,
                id: $('#addUploadImgThree').find('.pic-add-img').attr('id') ? $('#addUploadImgThree').find('.pic-add-img').attr('id') : ''
            }]
        } else {
            var exitEntryList = [];
        }
        var labels = $("#portraitTwo_labels").val();
        var school = $("#portraitTwo_school").val();
        var organization = $("#portraitTwo_organization").val();

        var portData = {
            rxId: rxId ? rxId : '',
            id: id ? id : '',
            base64: base64 ? base64 : '',
            url: url ? url : '',
            libId: libId ? libId : '108',
            name: name ? name : '',
            gender: gender ? gender : '',
            birthday: birthday ? birthday : '',
            passNo: passNo ? passNo : '',
            illegallyAdd: illegallyAdd ? illegallyAdd : '',
            engName: engName ? engName : '',
            idcard: idcard ? idcard : '',
            regaddress: regaddress ? regaddress : '',
            telNo: telNo ? telNo : '',
            illegallyTime: illegallyTime ? illegallyTime : '',
            backgroundInfo: backgroundInfo ? backgroundInfo : '',
            onSiteDelict: onSiteDelict ? onSiteDelict : '',
            stateCharge: stateCharge ? stateCharge : '',
            hhkCharge: hhkCharge ? hhkCharge : '',
            comments: comments ? comments : '',
            exitEntryList: exitEntryList,
            labels: labels ? labels : [],
            school: school ? school : '',
            organization: organization ? organization : '',
            arrested: arrested ? arrested : '',
            abscondArea: abscondArea ? abscondArea : ''

        }

        if ($('#portraitTwo_idcard').hasClass("no-input-warning")) {
            controlFlag = false;
        }

        if ((portData['base64'] == '' && rxImgType == '1') || (portData['url'] == '' && rxImgType == '2')) {
            $("#addUploadImgTwo").closest('.form-group').find('#noImgWarning').removeClass('hide');
            controlFlag = false;
        }

        var portDataSuccessFunc = function (data) {
            if (data.code === '200') {
                $('#createContainerTwo').modal('hide');
                $('#createContainerTwo').addClass('display-none');
                settings.containerDataTwo.page = '1';
                settings.containerDataTwo.size = '15';

                loadRightContainerTwo(settings.containerDataTwo, function (totalSize, totalPage) {
                    setPageParams($('#portraitPaginationTwo'), totalSize, totalPage, function (currPage, pageSize) {
                        settings.containerDataTwo.page = currPage;
                        settings.containerDataTwo.size = pageSize;
                        loadRightContainerTwo(settings.containerDataTwo);
                    }, true, [{
                        value: 12,
                        text: '12/页'
                    }, {
                        value: 15,
                        text: '15/页',
                        selected: true
                    }, {
                        value: 30,
                        text: '30/页'
                    }, {
                        value: 45,
                        text: '45/页'
                    }]);
                });
                hideLoading($('#createContainerTwo .modal-content'));
            } else {
                var tip = rxId ? '编辑失败,' + data.message : '新建失败,' + data.message;
                warningTip.say(tip);
                hideLoading($('#createContainerTwo .modal-content'));
            }
        }
        if (controlFlag) {
            showLoading($('#createContainerTwo .modal-content'));
            loadData('v2/memberFiles/editMembers', true, portData, portDataSuccessFunc);
        }
    });

    //身份证号码失去焦点事件
    $("#portraitTwo_idcard").on("blur", function () {
        var reg = /^[0-9a-zA-Z()]+$/;
        if ($(this).val() != '') {
            if (!reg.test($(this).val())) {
                $(this).addClass('no-input-warning').closest('.form-group').find('.text-danger.regTest.tip').removeClass('hide');
            } else {
                $(this).removeClass('no-input-warning').closest('.form-group').find('.text-danger.regTest.tip').addClass('hide');
            }
        } else {
            $(this).removeClass('no-input-warning').closest('.form-group').find('.text-danger.regTest.tip').addClass('hide');
        }
    });

    //高级搜索
    $('#advancedSearchTwo').on('click', '#searchFilter', function () {
        $(this).toggleClass('active');
        $("#searchFilterShow").slideToggle();
    });

    //高级搜索按钮点击事件
    $("#searchConfigList").on("click", function () {
        //姓名
        settings.containerDataTwo.name = $("#platform_name").val();
        //身份证
        settings.containerDataTwo.idcard = $("#platform_idcard").val();
        //户籍所在地
        settings.containerDataTwo.regaddress = $("#platform_regaddress").val();
        //生日开始
        settings.containerDataTwo.birthdayStart = $("#platform_birthdayStart").val();
        //生日结束
        settings.containerDataTwo.birthdayEnd = $("#platform_birthdayEnd").val();
        //通行证号
        settings.containerDataTwo.passNo = $("#platform_passNo").val();
        //违法地点
        settings.containerDataTwo.illegallyAdd = $("#platform_illegallyAdd").val();
        //违法行为
        settings.containerDataTwo.onSiteDelict = $("#platform_onSiteDelict").val();
        //违法时间开始
        settings.containerDataTwo.illegallyTimeStart = $("#platform_illegallyTimeStart").val();
        //违法时间结束
        settings.containerDataTwo.illegallyTimeEnd = $("#platform_illegallyTimeEnd").val();
        //背景资料
        settings.containerDataTwo.backgroundInfo = $("#platform_backgroundInfo").val();
        //全国性罪名
        settings.containerDataTwo.stateCharge = $("#platform_stateCharge").val();
        //香港罪名
        settings.containerDataTwo.hhkCharge = $("#platform_hhkCharge").val();
        //上传时间开始
        settings.containerDataTwo.startTime = $("#platform_startTime").val();
        //上传时间结束
        settings.containerDataTwo.endTime = $("#platform_endTime").val();
        //上传机构
        settings.containerDataTwo.uploadOrgId = $("#platform_uploadOrgId").selectpicker('val');
        //上传人
        settings.containerDataTwo.uploader = $("#platform_uploader").val();
        //备注/说明
        settings.containerDataTwo.comments = $("#platform_comments").val();
        settings.containerDataTwo.page = '1';
        settings.containerDataTwo.size = '15';
        refreshAlarmPageListTwo();
    });

    //置空按钮点击事件
    $("#searchConfFresh").on("click", function () {
        //姓名
        $("#platform_name").val("");
        //身份证
        $("#platform_idcard").val("");
        //户籍所在地
        $("#platform_regaddress").val("");
        //生日开始
        $("#platform_birthdayStart").val("");
        //生日结束
        $("#platform_birthdayEnd").val("");
        //通行证号
        $("#platform_passNo").val("");
        //违法地点
        $("#platform_illegallyAdd").val("");
        //违法行为
        $("#platform_onSiteDelict").val("");
        //违法时间开始
        $("#platform_illegallyTimeStart").val("");
        //违法时间结束
        $("#platform_illegallyTimeEnd").val("");
        //背景资料
        $("#platform_backgroundInfo").val("");
        //全国性罪名
        $("#platform_stateCharge").val("");
        //香港罪名
        $("#platform_hhkCharge").val("");
        //上传时间开始
        $("#platform_startTime").val("");
        //上传时间结束
        $("#platform_endTime").val("");
        //上传机构
        $("#platform_uploadOrgId").selectpicker('val', "10");
        //上传人
        $("#platform_uploader").val("");
        //备注/说明
        $("#platform_comments").val("");
    });

    //图片单选
    $("#portraitResultContainerTwo").on('click', '.image-card-item .ui-checkboxradio-checkbox-label', function () {
        if ($(this).hasClass('ui-checkboxradio-checked')) {
            $(this).removeClass('ui-checkboxradio-checked');
        } else {
            $(this).addClass('ui-checkboxradio-checked');
        }
        $(this).parents(".image-info.image-card-item").siblings().find(".ui-checkboxradio-checkbox-label").removeClass('ui-checkboxradio-checked');
    });

    //列表单选
    $("#portraitTableListTwo").on("change", ".table-checkbox-input-configDetail", function () {
        $(this).parents(".table-row").siblings().find(".table-checkbox-input-configDetail").removeAttr("checked");
    });

    //删除按钮点击事件
    $("#twoCRDBut").on("click", "#deleteCardTwo", function () {
        var deleteId = getRxId().RxId;

        if (!deleteId) {
            warningTip.say("请选择人员");
        } else {
            settings.deleteBaseInfoId = deleteId;
            $("#ModalDeleteTwo").modal("show");
        }
    });

    //删除确认按钮点击事件
    $("#ModalDeleteTwoSure").on("click", function () {
        var port = 'v2/memberFiles/delMembers',
            portData = {
                "rxId": settings.deleteBaseInfoId
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    $('#ModalDeleteTwo').modal('hide');
                    settings.containerDataTwo.page = '1';
                    settings.containerDataTwo.size = '15';
                    loadRightContainerTwo(settings.containerDataTwo, function (totalSize, totalPage) {
                        setPageParams($('#portraitPaginationTwo'), totalSize, totalPage, function (currPage, pageSize) {
                            settings.containerDataTwo.page = currPage;
                            settings.containerDataTwo.size = pageSize;
                            loadRightContainerTwo(settings.containerDataTwo);
                        }, true, [{
                            value: 12,
                            text: '12/页'
                        }, {
                            value: 15,
                            text: '15/页',
                            selected: true
                        }, {
                            value: 30,
                            text: '30/页'
                        }, {
                            value: 45,
                            text: '45/页'
                        }]);
                    });
                    settings.deleteBaseInfoId = '';
                }
            };
        loadData(port, true, portData, successFunc, undefined, "DELETE");
    });

    $("#portraitResultContainerTwo").on("click", "#cardInfoListTwo .ui-checkboxradio-checkbox-label", function (e) {
        e.stopPropagation();
        e.preventDefault();
    });

    //图片列表点击进入详情
    $("#portraitResultContainerTwo").on("click", "#cardInfoListTwo .image-card-item", function () {
        settings.detailRxId = $(this).attr("personid");
        settings.zjUrl = $(this).attr("detailUrl");
        settings.detailType = '1';
        showLoading($("#portraitDetailSearchTwo"));
        showDetailInfo($(this).attr("detailUrl"), settings.detailRxId);
    }).on("click", "#listContainerWrapTwo .text-link.list-detail", function () {
        settings.detailRxId = $(this).parents("tr").attr("personid");
        settings.zjUrl = $(this).parents("tr").attr("detailUrl");
        settings.detailType = '1';
        showLoading($("#portraitDetailSearchTwo"));
        showDetailInfo($(this).parents("tr").attr("detailUrl"), settings.detailRxId);
    });

    //视频查看
    $("#illegalInfo").on("click", ".video-link", function () {
        $("#videoShowMask").removeClass("display-none");
        $("#videoPlayContent").html(`<video id="DetailVideoPlay" controls style="height:98%;object-fit:fill;" filename="${$(this).attr("filename")}" url="${$(this).attr("videoUrl")}" zmurl="${$(this).attr("zmurl")}">
                                        <source src="${$(this).attr("videoUrl")}" type="video/mp4" />
                                        <source src="${$(this).attr("videoUrl")}" type="video/ogg" />
                                        <source src="${$(this).attr("videoUrl")}" type="video/webm" />
                                    </video>`);
        document.getElementById("DetailVideoPlay").play();  //播放
        //document.getElementById("DetailVideoPlay").currentTime = 0;  //从开始播放
    });

    //视频播放弹窗关闭事件
    $("#videoShowMask").on("click", ".aui-icon-not-through", function () {
        $("#videoShowMask").addClass("display-none");
    });

    //视频下载源码下载
    $("#uploadVideo").on("click", function () {
        downLoadCommon($(this).parents("#videoShowMask").find("#DetailVideoPlay").attr("url"), $(this).parents("#videoShowMask").find("#DetailVideoPlay").attr("filename"));
    });

    //视频下载转码下载
    $("#uploadZMVideo").on("click", function () {
        if ($(this).parents("#videoShowMask").find("#DetailVideoPlay").attr("zmurl")) {
            downLoadCommon($(this).parents("#videoShowMask").find("#DetailVideoPlay").attr("zmurl"), $(this).parents("#videoShowMask").find("#DetailVideoPlay").attr("filename"));
        } else {
            warningTip.say("转码视频路径为空");
        }
    });

    /*****************新增/编辑违法信息详情************/
    //上传按钮点击事件
    $("#createDetailCardTwo").on("click", function () {
        $("#portraitContainerTwo").addClass("hide");
        $("#portraitDetailSearchTwo").addClass("hide");
        $("#importLibraryDetail").removeClass("hide");
        $("#importLibraryDetail").find(".back-content .portrait-name").html("新增违法信息");
        $("#addDetailInfoType").html("");
        settings.eventId = '';
        $("#addDetailInfoType").append(addDetailTypeHtml($("#illegalInfo").find(".fh-section-item.supplement-info").length, 1));
    });

    //新增添加按钮点击事件
    $("#addDetailInfoType").on("click", ".addInfoType", function () {
        var num = parseInt($("#addDetailInfoType").find(".portraitContentModalInfo").eq($("#addDetailInfoType").find(".portraitContentModalInfo").length - 1).attr("typeTag"));
        if ($(this).html() == '添加') {
            $("#addDetailInfoType").append(addDetailTypeHtml(num, 1));
        } else {
            $("#addDetailInfoType").find(".portraitContentModalInfo").eq($("#addDetailInfoType").find(".portraitContentModalInfo").length - 1).remove();
        }
    });

    //详情删除确定按钮点击事件
    $("#ModalDeleteTwoSureVideo").on("click", function () {
    });

    //现场比对照截图、对比照截图以及现场地图上传事件
    $("#addDetailInfoType").on("change", ".addUploadImgOnePic .uploadFile", function () {
        var that = this,
            fileType = '',
            fileNameArr = this.value.split('\\'), // 文件名路径数组
            fileSize = this.files[0].size,
            fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
            fileNameTypeArr = fileName.split('.');
        fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase(),
            typeArr = ['bmp', 'jpg', 'jpeg', 'png', 'dib', 'webp', 'svgz', 'gif', 'ico', 'svg', 'tif', 'xbm', 'jfif', 'pjpeg', 'pjp', 'tiff'];
        if (typeArr.indexOf(fileType) < 0) {
            this.value = '';
            warningTip.say('格式不正确,请上传图片格式');
            return;
        }

        // 判断文件大小是否超过10M 
        if (fileSize > 10 * 1024 * 1024) {
            warningTip.say('上传文件过大,请上传不大于10M的文件');
            this.value = '';
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            var addimg = reader.result;

            var formFileData = new FormData($(that).parent()[0]),
                uploadFormData = new FormData(),
                xhr = new XMLHttpRequest(),
                token = $.cookie('xh_token'),
                file = formFileData.get('onePicImg');
            xhr.open('post', serviceUrl + '/v2/memberInfos/upload');
            xhr.setRequestHeader("token", token);
            uploadFormData.append('type', '1');
            uploadFormData.append('file', file);
            xhr.send(uploadFormData);
            showLoading($(that).parents(".pic-add"));
            xhr.onload = function (res) {  //视频
                var data = JSON.parse(res.currentTarget.response);
                hideLoading($(that).parents(".pic-add"));
                if (data.code === '200') {
                    url = data.url;
                    $(that).parents(".pic-add").find(".pic-add-img").removeClass("hide").attr({
                        src: addimg,
                        picurl: url,
                        filename: data.fileName,
                        id: ''
                    });
                    $(that).parents(".pic-add").find(".aui-icon-delete-line").removeClass("hide");
                    $(that).parents(".pic-add").find(".aui-icon-add").addClass("hide");
                } else {
                    warningTip.say(data.message);
                }
            }
        };

        reader.readAsDataURL(this.files[0]);
    });

    //现场照截图上传事件
    $("#addDetailInfoType").on("change", ".addUploadXCImg .uploadFile", function () {
        var that = this,
            fileType = '',
            fileNameArr = this.value.split('\\'), // 文件名路径数组
            fileSize = this.files[0].size,
            fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
            fileNameTypeArr = fileName.split('.');
        fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase(),
            typeArr = ['bmp', 'jpg', 'jpeg', 'png', 'dib', 'webp', 'svgz', 'gif', 'ico', 'svg', 'tif', 'xbm', 'jfif', 'pjpeg', 'pjp', 'tiff'];
        if (typeArr.indexOf(fileType) < 0) {
            this.value = '';
            warningTip.say('格式不正确,请上传图片格式');
            return;
        }

        // 判断文件大小是否超过10M 
        if (fileSize > 10 * 1024 * 1024) {
            warningTip.say('上传文件过大,请上传不大于10M的文件');
            this.value = '';
            return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            var addimg = reader.result;
            var formFileData = new FormData($(that).parent()[0]),
                uploadFormData = new FormData(),
                xhr = new XMLHttpRequest(),
                token = $.cookie('xh_token'),
                file = formFileData.get('morePicImg');
            xhr.open('post', serviceUrl + '/v2/memberInfos/upload');
            xhr.setRequestHeader("token", token);
            uploadFormData.append('type', '1');
            uploadFormData.append('file', file);
            xhr.send(uploadFormData);
            showLoading($(that).parents(".pic-add"));
            xhr.onload = function (res) {  //视频
                var data = JSON.parse(res.currentTarget.response);
                hideLoading($(that).parents(".pic-add"));
                if (data.code === '200') {
                    url = data.url;
                    var html = `<div class="add-image-item">
                                    <img src="${addimg}" class="add-image-img" title="${fileName}" picurl="${url}" filename="${data.fileName}" id=""/>
                                    <i class="aui-icon-delete-line"></i>
                                </div>`;
                    $(that).parents(".pic-add").before(html);
                    $(that).val("");
                } else {
                    warningTip.say(data.message);
                }
            }
        };

        reader.readAsDataURL(this.files[0]);
    });

    //相关视频上传事件
    $("#addDetailInfoType").on("change", ".addUploadVideo .uploadFile", function () {
        var that = this,
            fileType = '',
            fileNameArr = this.value.split('\\'), // 文件名路径数组
            fileSize = this.files[0].size,
            fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
            fileNameTypeArr = fileName.split('.');
        fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase(),
            typeArr = ['mp4', 'mov', 'rmvb', 'rm', 'flv', '3gp', 'wmv', 'mpeg', 'mkv', 'vob'];
        if (typeArr.indexOf(fileType) < 0) {
            this.value = '';
            warningTip.say('格式不正确,请上传视频格式');
            return;
        }

        // 判断文件大小是否超过200M 
        if (fileSize > 200 * 1024 * 1024) {
            warningTip.say('上传文件过大,请上传不大于200M的文件');
            this.value = '';
            return;
        }

        var formFileData = new FormData($(that).parent()[0]),
            uploadFormData = new FormData(),
            xhr = new XMLHttpRequest(),
            token = $.cookie('xh_token'),
            file = formFileData.get('moreVideo');
        xhr.open('post', serviceUrl + '/v2/memberInfos/upload');
        xhr.setRequestHeader("token", token);
        uploadFormData.append('type', '2');
        uploadFormData.append('file', file);
        xhr.send(uploadFormData);
        xhr.onload = function (res) {  //视频
            var data = JSON.parse(res.currentTarget.response);
            if (data.code === '200') {
                url = data.url;
                console.log(url);
                var html = `<div class="add-image-item">
                                <img src="./assets/images/icons/video.bmp" class="add-image-img" title="${fileName}" picurl="${url}" filename="${data.fileName}"/>
                                <i class="aui-icon-delete-line"></i>
                            </div>`;
                $(that).parents(".pic-add").before(html);
                $(that).val("");
            } else {
                warningTip.say(data.message);
            }
        }
    });

    //图片删除按钮点击事件(基本信息新增弹窗出入境)
    $("#addUploadImgThree").on("click", ".aui-icon-delete-line", function (e) {
        e.stopPropagation();
        e.preventDefault();
        var that = this;
        if ($(this).parent().find(".pic-add-img").attr("id")) {
            $(that).parent().find(".uploadFile").val('');
            $(that).parent().find(".pic-add-img").attr({
                src: '',
                picurl: '',
                filename: '',
                id: ''
            }).addClass("hide");
            $(that).parent().find(".aui-icon-add").removeClass("hide");
            $(that).addClass("hide");
        }
    });

    //图片删除按钮点击事件(现场比对照截图、对比照截图以及现场地图)
    $("#addDetailInfoType").on("click", ".addUploadImgOnePic .aui-icon-delete-line", function (e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).parent().find(".uploadFile").val('');
        $(this).parent().find(".pic-add-img").attr({
            src: '',
            picurl: '',
            filename: '',
            id: ''
        }).addClass("hide");
        $(this).parent().find(".aui-icon-add").removeClass("hide");
        $(this).addClass("hide");
    });

    //图片删除按钮点击事件(现场照截图)
    $("#addDetailInfoType").on("click", ".addMoreType .aui-icon-delete-line", function (e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).parent().remove();
    });

    //新增违法时间按钮点击事件
    $("#saveDetailEvent").on("click", function () {
        var list = [];
        var rxId = settings.detailRxId,
            id = settings.eventId;
        var startNum = parseInt($("#addDetailInfoType").find(".modalInfo.portraitContentModalInfo").eq(0).attr("typetag"));
        for (var i = startNum; i < ($(".portraitContentModalInfo").length + startNum); i++) {
            // 关联事件
            var eventName = $("#configLoad_eventName_" + i).val();
            // 关联线索
            var clueName = $("#configLoad_clueName_" + i).val();
            // 违法时间
            var illegallyTime = $("#configLoad_illegallyTime_" + i).val();
            // 违法地点
            var illegallyAdd = $('#configLoad_illegallyAdd_' + i).val();
            // 违法行为
            var onSiteDelict = $('#configLoad_onSiteDelict_' + i).val();
            // 来源信息
            var sourceInfo = $('#configLoad_sourceInfo_' + i).val();
            //涉嫌全国性罪名
            var stateCharge = $('#configLoad_stateCharge_' + i).val();
            // 涉嫌香港性罪名
            var hhkCharge = $('#configLoad_hhkCharge_' + i).val();
            // 现场人物特征描述
            var actDescription = $('#configLoad_actDescription_' + i).val();
            // 备注说明
            var comments = $('#configLoad_comments_' + i).val();
            //比对人
            var comparisonor = $('#configLoad_comparisonor_' + i).val();
            //现场比对照截图
            var actCompareShotListPicurl = $("#addUploadXCBDImg_" + i).find(".pic-add-img").attr('picurl');
            var actCompareShotListFilename = $("#addUploadXCBDImg_" + i).find(".pic-add-img").attr('filename');
            if (actCompareShotListPicurl && actCompareShotListFilename) {
                var actCompareShotList = [{
                    url: actCompareShotListPicurl,
                    fileName: actCompareShotListFilename,
                    id: $("#addUploadXCBDImg_" + i).find(".pic-add-img").attr('id') ? $("#addUploadXCBDImg_" + i).find(".pic-add-img").attr('id') : ''
                }]
            } else {
                var actCompareShotList = [];
            }

            //比对照截图
            var comparisonShotListPicurl = $("#addUploadBDImg_" + i).find(".pic-add-img").attr('picurl');
            var comparisonShotListFilename = $("#addUploadBDImg_" + i).find(".pic-add-img").attr('filename');
            if (comparisonShotListPicurl && comparisonShotListFilename) {
                var comparisonShotList = [{
                    url: comparisonShotListPicurl,
                    fileName: comparisonShotListFilename,
                    id: $("#addUploadBDImg_" + i).find(".pic-add-img").attr('id') ? $("#addUploadBDImg_" + i).find(".pic-add-img").attr('id') : ''
                }]
            } else {
                var comparisonShotList = [];
            }

            //比对照截图
            var comparisonShotListPicurl = $("#addUploadBDImg_" + i).find(".pic-add-img").attr('picurl');
            var comparisonShotListFilename = $("#addUploadBDImg_" + i).find(".pic-add-img").attr('filename');
            if (comparisonShotListPicurl && comparisonShotListFilename) {
                var comparisonShotList = [{
                    url: comparisonShotListPicurl,
                    fileName: comparisonShotListFilename,
                    id: $("#addUploadBDImg_" + i).find(".pic-add-img").attr('id') ? $("#addUploadBDImg_" + i).find(".pic-add-img").attr('id') : ''
                }]
            } else {
                var comparisonShotList = [];
            }

            //现场地图截图
            var actMapListPicurl = $("#addUploadMap_" + i).find(".pic-add-img").attr('picurl');
            var actMapListFilename = $("#addUploadMap_" + i).find(".pic-add-img").attr('filename');
            if (actMapListPicurl && actMapListFilename) {
                var actMapList = [{
                    url: actMapListPicurl,
                    fileName: actMapListFilename,
                    id: $("#addUploadMap_" + i).find(".pic-add-img").attr('id') ? $("#addUploadMap_" + i).find(".pic-add-img").attr('id') : ''
                }]
            } else {
                var actMapList = [];
            }

            var actScreenshotList = [];
            //现场照截图
            if ($("#addUploadXCImg_" + i).find(".add-image-item").length > 0) {
                for (var j = 0; j < $("#addUploadXCImg_" + i).find(".add-image-item").length; j++) {
                    var actScreenshotListPicurl = $("#addUploadXCImg_" + i).find(".add-image-item").eq(j).find(".add-image-img").attr("picurl");
                    var actScreenshotListFilename = $("#addUploadXCImg_" + i).find(".add-image-item").eq(j).find(".add-image-img").attr("filename");

                    var actScreenshotListObj = {
                        url: actScreenshotListPicurl,
                        fileName: actScreenshotListFilename,
                        id: $("#addUploadXCImg_" + i).find(".add-image-item").eq(j).find(".add-image-img").attr('id') ? $("#addUploadXCImg_" + i).find(".add-image-item").eq(j).find(".add-image-img").attr('id') : ''
                    };
                    actScreenshotList.push(actScreenshotListObj);
                }
            }

            var portData = {
                rxId: rxId ? rxId : '',
                id: id ? id : '',
                eventName: eventName ? eventName : '',
                clueName: clueName ? clueName : '',
                illegallyTime: illegallyTime ? illegallyTime : '',
                illegallyAdd: illegallyAdd ? illegallyAdd : '',
                onSiteDelict: onSiteDelict ? onSiteDelict : '',
                sourceInfo: sourceInfo ? sourceInfo : '',
                stateCharge: stateCharge ? stateCharge : '',
                hhkCharge: hhkCharge ? hhkCharge : '',
                actDescription: actDescription ? actDescription : '',
                comments: comments ? comments : '',
                comparisonor: comparisonor ? comparisonor : '',
                actCompareShotList: actCompareShotList ? actCompareShotList : [],
                comparisonShotList: comparisonShotList ? comparisonShotList : [],
                actMapList: actMapList ? actMapList : [],
                actScreenshotList: actScreenshotList ? actScreenshotList : []
            }
            list.push(portData);
        }
        var portDataList = {
            list: list
        };
        var portDataSuccessFunc = function (data) {
            if (data.code === '200') {
                $("#portraitContainerTwo").addClass("hide");
                $("#portraitDetailSearchTwo").removeClass("hide");
                $("#importLibraryDetail").addClass("hide");
                showDetailInfo(settings.zjUrl, settings.detailRxId);
            } else {
                var tip = rxId ? '编辑失败,' + data.message : '新建失败,' + data.message;
                warningTip.say(tip);
                hideLoading($('#createContainerTwo .modal-content'));
            }
        }
        loadData('v2/memberFiles/editMemberEvent', true, portDataList, portDataSuccessFunc);
    });

    //编辑违法事件按钮点击事件
    $("#illegalInfo").on("click", ".editDetailCardTwo", function () {
        var data = $(this).parents(".fh-section-item.supplement-info").data("allData");
        var num = $(this).parents(".fh-section-item.supplement-info").index();
        settings.eventId = data.id;
        $("#portraitContainerTwo").addClass("hide");
        $("#portraitDetailSearchTwo").addClass("hide");
        $("#importLibraryDetail").removeClass("hide");
        $("#importLibraryDetail").find(".back-content .portrait-name").html("编辑违法信息");
        $("#addDetailInfoType").html("");
        $("#addDetailInfoType").append(addDetailTypeHtml(num, 2));
        $("#configLoad_eventName_" + (num + 1)).val(data.eventName);
        $("#configLoad_clueName_" + (num + 1)).val(data.clueName);
        $("#configLoad_illegallyTime_" + (num + 1)).val(data.illegallyTime);
        $("#configLoad_illegallyAdd_" + (num + 1)).val(data.illegallyAdd);
        $("#configLoad_onSiteDelict_" + (num + 1)).val(data.onSiteDelict);
        $("#configLoad_sourceInfo_" + (num + 1)).val(data.sourceInfo);
        $("#configLoad_stateCharge_" + (num + 1)).val(data.stateCharge);
        $("#configLoad_hhkCharge_" + (num + 1)).val(data.hhkCharge);
        $("#configLoad_actDescription_" + (num + 1)).val(data.actDescription);
        $("#configLoad_comments_" + (num + 1)).val(data.comments);
        $("#configLoad_comparisonor_" + (num + 1)).val(data.comparisonor);

        if (data.actCompareShotList.length > 0) {
            $("#addUploadXCBDImg_" + (num + 1)).find(".pic-add-img").removeClass("hide").attr({
                src: data.actCompareShotList[0].url,
                picurl: data.actCompareShotList[0].url,
                filename: data.actCompareShotList[0].fileName,
                id: data.actCompareShotList[0].id
            });
            $("#addUploadXCBDImg_" + (num + 1)).find('.uploadFile').val("").attr('title', '');
            $("#addUploadXCBDImg_" + (num + 1)).find(".aui-icon-delete-line").removeClass("hide");
            $("#addUploadXCBDImg_" + (num + 1)).find(".aui-icon-add").addClass("hide");
        } else {
            $("#addUploadXCBDImg_" + (num + 1)).find(".pic-add-img").addClass("hide").attr({
                src: '',
                picurl: '',
                filename: '',
                id: ''
            });
            $("#addUploadXCBDImg_" + (num + 1)).find('.uploadFile').val("").attr('title', '');
            $("#addUploadXCBDImg_" + (num + 1)).find(".aui-icon-delete-line").addClass("hide");
            $("#addUploadXCBDImg_" + (num + 1)).find(".aui-icon-add").removeClass("hide");
        }

        if (data.comparisonShotList.length > 0) {
            $("#addUploadBDImg_" + (num + 1)).find(".pic-add-img").removeClass("hide").attr({
                src: data.comparisonShotList[0].url,
                picurl: data.comparisonShotList[0].url,
                filename: data.comparisonShotList[0].fileName,
                id: data.comparisonShotList[0].id
            });
            $("#addUploadBDImg_" + (num + 1)).find('.uploadFile').val("").attr('title', '');
            $("#addUploadBDImg_" + (num + 1)).find(".aui-icon-delete-line").removeClass("hide");
            $("#addUploadBDImg_" + (num + 1)).find(".aui-icon-add").addClass("hide");
        } else {
            $("#addUploadBDImg_" + (num + 1)).find(".pic-add-img").addClass("hide").attr({
                src: '',
                picurl: '',
                filename: '',
                id: ''
            });
            $("#addUploadBDImg_" + (num + 1)).find('.uploadFile').val("").attr('title', '');
            $("#addUploadBDImg_" + (num + 1)).find(".aui-icon-delete-line").addClass("hide");
            $("#addUploadBDImg_" + (num + 1)).find(".aui-icon-add").removeClass("hide");
        }

        if (data.actMapList.length > 0) {
            $("#addUploadMap_" + (num + 1)).find(".pic-add-img").removeClass("hide").attr({
                src: data.actMapList[0].url,
                picurl: data.actMapList[0].url,
                filename: data.actMapList[0].fileName,
                id: data.actMapList[0].id
            });
            $("#addUploadMap_" + (num + 1)).find('.uploadFile').val("").attr('title', '');
            $("#addUploadMap_" + (num + 1)).find(".aui-icon-delete-line").removeClass("hide");
            $("#addUploadMap_" + (num + 1)).find(".aui-icon-add").addClass("hide");
        } else {
            $("#addUploadMap_" + (num + 1)).find(".pic-add-img").addClass("hide").attr({
                src: '',
                picurl: '',
                filename: '',
                id: ''
            });
            $("#addUploadMap_" + (num + 1)).find('.uploadFile').val("").attr('title', '');
            $("#addUploadMap_" + (num + 1)).find(".aui-icon-delete-line").addClass("hide");
            $("#addUploadMap_" + (num + 1)).find(".aui-icon-add").removeClass("hide");
        }

        if (data.actScreenshotList.length > 0) {
            data.actScreenshotList.forEach((val, index) => {
                var html = `<div class="add-image-item">
                                <img src="${val.url}" class="add-image-img" picurl="${val.url}" filename="${val.fileName}" id="${val.id}"/>
                                <i class="aui-icon-delete-line"></i>
                            </div>`;
                $("#addUploadXCImg_" + (num + 1)).find(".pic-add").before(html);
            });
        }
    });

    //删除违法事件按钮点击事件
    $("#illegalInfo").on("click", ".deleteDetailCardTwo", function () {
        $("#ModalDeleteTwoVideo").modal("show");
        settings.eventId = $(this).parents(".fh-section-item.supplement-info").data("allData").id;
    });

    //删除违法事件确认按钮点击事件
    $("#ModalDeleteTwoSureVideo").on("click", function () {
        $("#ModalDeleteTwoVideo").modal("hide");
        var port = 'v2/memberFiles/delMembersEvent',
            portData = {
                "id": settings.eventId
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    $('#ModalDeleteTwoVideo').modal('hide');
                    showLoading($("#portraitDetailSearchTwo"));
                    showDetailInfo(settings.zjUrl, settings.detailRxId);
                    settings.eventId = '';
                } else {
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, portData, successFunc, undefined, "DELETE");
    });

    //上传页面返回按钮点击事件
    $("#backToDetailPage").on("click", function () {
        $("#portraitContainerTwo").addClass("hide");
        $("#portraitDetailSearchTwo").removeClass("hide");
        $("#importLibraryDetail").addClass("hide");
    });

    //详情返回按钮点击事件
    $("#backToContainerPage").on("click", function () {
        $("#portraitContainerTwo").removeClass("hide");
        $("#portraitDetailSearchTwo").addClass("hide");
    });
})(window, window.jQuery);