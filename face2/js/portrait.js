(function (window, $) {
    // 默认数据
    var containerData = {
        "labelId": "", //标签
        "type": '', //1-业务对象 2-关注对象 4-布控对象
        "size": '16',
        'page': '1',
    };

    // 布控详情表格当前页
    var bkDetailData = {
        peopleId: '',
        page: '1',
        number: '5'
    };

    //动态库数据
    var dataThree = {
        page: 1,
        size: 40
    };
    // 进入模块时，先获取用户操作按钮权限
    initUserOperateBtn();
    initPortraitTree($('body'));

    // 初始化其他事件下的时间控件
    initDatePicker1($('#timeModalDatepicker'), -30, false, true);

    //判断字符串多少个字符
    function getStringLength(str) {
        let len = 0;
        for (let i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
                len += 2;
            } else {
                len++;
            }
        }
        return len;
    };

    /* 人员库机构树 start */
    /**
     * 初始化请求人员库机构树
     */
    function initPortraitTree($container) {
        // 开始加载loading动画
        showLoading($container);
        var opt = opt ? opt : {};
        // 加载人员库列表
        var port = 'v3/objectMenu/getTagMenu',
            _data = {
                moduleCode: $('#content-box').data().modulecode
            },
            successFunc = function (data) {
                // 结束loading加载动画
                hideLoading($container);
                if (data.code == '200') {
                    var result = data.data;
                    if (result) {
                        $("#portraitContentOne").addClass("hide");
                        $('#portraitEmptyContainerAll').removeClass("hide");
                        loadEmpty($('#portraitEmptyContainerAll'), '请选择库或机构');

                        // 加载静态库列表
                        var portStatic = 'v3/objectMenu/getLibMenu',
                            successFuncStatic = function (data) {
                                if (data.code == '200') {
                                    var staticData = data.data;
                                    result.map((val, index) => {
                                        if (val.moduleCode == '2605009') {
                                            val.children = staticData;
                                        }
                                    });
                                    // 调用加载树组件方法
                                    loadzTree(result);
                                } else {
                                    warningTip.say(data.message);
                                }
                            };
                        loadData(portStatic, true, {}, successFuncStatic);
                    } else {
                        $("#portraitContentOne").addClass("hide");
                        $('#portraitEmptyContainerAll').removeClass("hide");
                        loadEmpty($('#portraitEmptyContainerAll'), '暂无人员库', '数据为空');
                    }
                } else {
                    $("#portraitContentOne").addClass("hide");
                    $('#portraitEmptyContainerAll').removeClass("hide");
                    loadEmpty($('#portraitEmptyContainerAll'), '暂无人员库', '数据为空，系统异常');
                    loadEmpty($('.card-side-content-box'), '暂无人员库', '系统异常');
                }
            };
        loadData(port, true, _data, successFunc);
    }

    function getStaticTree(parentData) {
        // 加载静态库列表
        var port = 'v3/objectMenu/getLibMenu',
            _data = {},
            successFunc = function (data) {
                if (data.code == '200') {
                    var result = data.data;
                    return result;
                } else {
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, _data, successFunc);
    };

    /**人员库数机构加载
     * 
     * @param {*} data 传入的数据
     */
    function loadzTree(data) {
        var setting = {
            view: {
                selectedMulti: false,
                addDiyDom: function (treeId, treeNode) {
                    //树列表的icon和布控状态展示
                    if (treeNode.level == 0) {
                        $("#" + treeNode.tId + "_a").addClass("treeLevelTitle");
                    } else {
                        $('#' + treeNode.tId).attr("libId", treeNode.libId);
                        // $("#" + treeNode.tId).find(".node_name").parent().attr("title", treeNode.name + "(" + treeNode.num + ")");
                        $("#" + treeNode.tId).find(".node_name").parent().attr("nodeName", treeNode.name);
                        if (treeNode.libId) {
                            $("#" + treeNode.tId).find(".node_name").parent().append(`<span class="portrait-tree-num">(${treeNode.num})</span>`);
                        }
                        if (treeNode.level == 2) {
                            $("#" + treeNode.tId).find(".node_name").before(`${treeNode.sort ? treeNode.sort + '.' : ''}`);
                        }
                        if (!treeNode.children) {
                            $("#" + treeNode.tId).find(".node_name").parent().attr("title", treeNode.name + "(" + treeNode.num + ")");
                        } else {
                            $("#" + treeNode.tId).find(".node_name").parent().attr("title", treeNode.name);
                        }
                        // if (treeNode.type) {
                        //     if (treeNode.type == '1') {  //未布控
                        //         $("#" + treeNode.tId).find(".node_name").parent().append(`<span class="portrait-tree-type" title="未布控" isBk=${treeNode.isBk == "1" ? true : false} isDistAll=${treeNode.isDistAll == "1" ? true : false}><i class="aui-icon-police-badge portrait-tree-type1"></i></span>`);
                        //     } else if (treeNode.type == '2') {  //部分布控
                        //         $("#" + treeNode.tId).find(".node_name").parent().append(`<span class="portrait-tree-type" title="部分布控" isBk=${treeNode.isBk == "1" ? true : false} isDistAll=${treeNode.isDistAll == "1" ? true : false}><i class="aui-icon-police-badge portrait-tree-type2"></i></span>`);
                        //     } else if (treeNode.type == '3') {  //全库布控
                        //         $("#" + treeNode.tId).find(".node_name").parent().append(`<span class="portrait-tree-type" title="全库布控" isBk=${treeNode.isBk == "1" ? true : false} isDistAll=${treeNode.isDistAll == "1" ? true : false}><i class="aui-icon-police-badge portrait-tree-type3"></i></span>`);
                        //     }
                        // }

                        var pObj = $('#' + treeNode.tId);
                        //pObj.addClass("lastNodes");
                        pObj.off('click').on('click', function (e) {
                            var $target = $(e.target);
                            if ($target.hasClass('switch')) {
                                return;
                            }
                            if (!e.isTrigger) {
                                e.stopPropagation();
                                var aObj = $('#' + treeNode.tId + '_span');
                                aObj.click();
                            }
                        });
                    }
                }
            },
            callback: {
                onClick: function (event, treeId, treeNode) {
                    // 树点击事件
                    event.stopPropagation();
                    event.preventDefault();
                    var aObj = $('#' + treeNode.tId); // 选中的人员库li节点
                    if (treeNode.level != 0) {
                        if ((treeNode.moduleCode == '260500801' && !treeNode.isClick) || (treeNode.moduleCode == '260500802' && !treeNode.isClick) || (treeNode.parentCode == '2605009' && !treeNode.libId)) {
                            return;
                        }
                        $(event.currentTarget).find('.active').removeClass('active'); // 其他菜单移除active
                        aObj.addClass('active').siblings().removeClass('active'); // 自身添加active, 兄弟节点移除active
                    } else {
                        return;
                    }

                    if (treeNode.parentCode == '2605010') { //动态库
                        window.initDatePicker1($('#portraitThreeTime'), -30); // 初始化 时间控件
                        dataThree.startTime = $("#startTimePortrait").val();
                        dataThree.endTime = $("#endTimePortrait").val();
                        dataThree.orgId = treeNode.orgId;
                        dataThree.page = 1;
                        dataThree.size = 40;
                        getPortraitThree(true);
                    } else if (treeNode.parentCode == '2605011') { //布控库
                        getPortrait(2, treeNode);
                    } else if (treeNode.parentCode == '2605009') {
                        getPortrait(1, treeNode);
                    }
                },
                onDblClick: function (event, treeId, treeNode) {
                    event.stopPropagation();
                    event.preventDefault();
                },
                onExpand: function (event, treeId, treeNode) {
                    event.stopPropagation();
                    event.preventDefault();
                    //动态库
                    if (treeNode.moduleCode == '2605010') {
                        $("#" + treeNode.tId).addClass("orgTree");
                        var port = 'v3/objectMenu/getDynamicLibOrgInfo',
                            data = {
                                orgType: 3,
                                userType: 2,
                                returnType: 4
                            },
                            successFunc = function (data) {
                                if (data.code === '200' && data.data) {
                                    var result = portraitChangeData(data.data, treeNode.moduleCode); //后台返回的数据转换
                                    containerData.ztreeObj.addNodes(treeNode, result);
                                    if (!$("#portraitEmptyContainerAll").hasClass("hide")) {
                                        $("#" + treeNode.children[0].tId + "_a").click();
                                    }
                                } else {
                                    warningTip.say(data.message);
                                }
                            };
                        if (treeNode.children.length == 0) {
                            loadData(port, true, data, successFunc);
                        }
                    } else if (treeNode.moduleCode == '2605011') { //布控库
                        $("#" + treeNode.tId).addClass("bkTree");
                        var port = 'v3/objectMenu/getBkLibInfo',
                            successFunc = function (data) {
                                if (data.code === '200' && data.data) {
                                    var result = data.data;
                                    result.map((val) => {
                                        val.name = val.libName;
                                        val.num = val.total;
                                        val.parentCode = treeNode.moduleCode;
                                        val.parentType = '4';
                                    });
                                    containerData.ztreeObj.addNodes(treeNode, result);
                                } else {
                                    warningTip.say(data.message);
                                }
                            };
                        if (treeNode.children.length == 0) {
                            loadData(port, true, {}, successFunc);
                        }
                    } else if (treeNode.moduleCode == '2605009') { //静态库
                        $("#" + treeNode.tId).addClass("staticTree");
                    }
                },
            }
        },
            zTreeNodes = [], // zTree 的节点数据集合
            flag = false; //默认展开第一个有子节点的节点
        // 循环人员库数据
        for (var i = 0; i < data.length; i++) {
            var zTreeObj = {};

            //是否是父节点
            zTreeObj.isParent = true;
            // 树组件一级菜单名称
            zTreeObj.name = data[i].moduleName;
            zTreeObj.moduleCode = data[i].moduleCode;

            if (!flag) {
                if (i == 0) { //第一个节点
                    if (zTreeObj.moduleCode == '2605008') { //是不是静态库
                        if (data[i].children && data[i].children.length > 0) { //静态库下有没有子节点
                            zTreeObj.open = true;
                            flag = true;
                        } else { //静态库下没有子节点
                            flag = false;
                        }
                    } else { //不是静态库
                        zTreeObj.expand = true;
                        flag = true;
                    }
                } else {
                    zTreeObj.expand = true;
                    flag = true;
                }
            }

            if (data[i].children) {
                zTreeObj.children = createLibDom(data[i].children, data[i].moduleCode, data[i], true, '', 1);
            }
            zTreeNodes.push(zTreeObj);
            // 循环人员库单组类型列表(静态库)
            function createLibDom(list, moduleCode, data, isParent, parentLib, treeType) {
                var childNodes = [];
                for (var j = 0; j < list.length; j++) {
                    var childObj = {};
                    // 人员库属性赋值
                    childObj.sort = j + 1;
                    childObj.isParent = isParent;
                    childObj.isClick = list[j].isClick;
                    childObj.libId = list[j].libId;
                    childObj.name = list[j].libName ? list[j].libName : '';
                    childObj.num = list[j].total ? list[j].total : 0;
                    childObj.parentCode = moduleCode;
                    childObj.parentType = '1';
                    childObj.treeType = treeType;
                    //静态全量下面的节点有权限
                    if (list[j].children && list[j].children.length > 0) {
                        childObj.children = createLibDom(list[j].children, moduleCode, list[j], true, list[j].libId, ++treeType);
                    } else {
                        childObj.parentLib = parentLib;
                        childObj.isParent = false;
                        childObj.isEdit = list[j].isEdit;
                        childObj.type = list[j].type;
                        childObj.isBk = list[j].isBk;
                        // if (parentLib == '0010') {
                        //     childObj.isEdit = list[j].isEdit;
                        //     childObj.type = list[j].type;
                        //     childObj.isBk = list[j].isBk;
                        //     childObj.parentType = '1';
                        // } else {
                        //     childObj.parentType = '2';
                        // }
                    }
                    childNodes.push(childObj);
                }

                return childNodes;
            }
        }
        // 初始化zTree树组件
        $(document).ready(function () {
            $.fn.zTree.init($('#portrait-tree-list'), setting, zTreeNodes);
            containerData.ztreeObj = $.fn.zTree.getZTreeObj("portrait-tree-list");
            containerData.ztreeObj.getNodes().forEach((val, index) => {
                if (val.expand) {
                    $("#" + val.tId).find("#" + val.tId + "_switch").click();
                    //静态库要特殊判断
                    if (val.moduleCode == '2605009') {
                        let node = getClickNode(val),
                            parentNode = node.getPath();
                        for (let i = 0; i < parentNode.length; i++) {
                            containerData.ztreeObj.expandNode(parentNode[i], true, false, true);
                        }
                        $("#" + node.tId + "_a").click();
                    } else {
                        if (val.children.length > 0) {
                            $("#" + val.children[0].tId + "_a").click();
                        }
                    }
                }
            });
        })
    }

    function getClickNode(node) {
        if (node.libId) {
            return node;
        } else {
            for (var i = 0; i < node.children.length; i++) {
                return getClickNode(node.children[i]);
            }
        }
    };

    //后台返回的数据进行转换
    function portraitChangeData(data, code) {
        var newArr = [];
        for (var i = 0; i < data.length; i++) {
            var flag = false;
            for (var j = 0; j < data.length; j++) {
                data[j].name = data[j].orgName;
                data[j].parentCode = code;
                data[j].parentType = '3';
                if (data[j].total && data[j].total >= 10000) {
                    data[j].num = Number(parseInt(data[j].total) / 10000).toFixed(2) + '万';
                } else if (data[j].total && data[j].total < 10000) {
                    data[j].num = parseInt(data[j].total);
                } else {
                    data[j].num = 0;
                }
                if (data[i].parentId && data[i].parentId == data[j].orgId) {
                    flag = true;
                    if (data[j].children) {
                        data[j].isParent = true;
                        data[j].children.push(data[i]);
                    } else {
                        data[j].children = [data[i]];
                    }
                    break;
                }
            }
            if (!flag) {
                newArr.push(data[i]);
            }
        }
        return newArr;
    };

    /* 人员库机构树 end */

    /* 右侧内容区域 start */
    //右侧静态库和布控库内容
    function getPortrait(type, treeNode) {
        var aObj = $('#' + treeNode.tId); // 选中的人员库li节点
        var pObj = $('#' + treeNode.parentTId);
        $('#portraitContainer').find('.portrait-name').text(treeNode.name);

        //下方人员信息隐藏
        $("#cardDetail").addClass("hide");
        //撤控按钮取消选中
        $("#portraitCancel").removeClass("btn-primary");
        $("#portraitCancelCheckAll").removeAttr("checked"); //布控库全选按钮取消全选
        $("#AlarmOptPortrait").find(".btn").eq(0).addClass("btn-primary").siblings().removeClass("btn-primary");
        //标签恢复初始
        $(".portraitLableTotal").addClass("active");
        $(".portraitLableShowDetail").find(".portraitLableShowItem").removeClass("active");
        //默认回到列表模式
        $("#showCard").click();
        //标签置空
        containerData.libId = treeNode.libId;
        containerData.picStatus = ''; //布控状态
        containerData.rowstate = ''; //布控状态
        //containerData.name = '';
        //containerData.idcard = '';

        containerData.page = '1';
        containerData.size = '16';
        containerData.labelId = '';
        containerData.type = treeNode.parentType;
        containerData.isEdit = treeNode.isEdit; //是否可编辑
        containerData.isBk = treeNode.isBk; //是否可布控
        containerData.status = treeNode.type ? treeNode.type : '';

        if ($("#personSearch").val() == '') {
            containerData.idcard = '';
            containerData.name = '';
        }
        if (treeNode.libId === '108') { //涉港一人一档是单独的页面
            $("#portraitContentTwo").removeClass("hide");
            $("#portraitContentOne").addClass("hide");
            $("#portraitContentThree").addClass("hide");
            $("#portraitEmptyContainerAll").addClass("hide");
            loadPage($('#portraitContentTwo'), 'facePlatform/portraitContentTwo.html');
            if (treeNode.isEdit == '1') { //当前登录人可编辑
                $('#twoCRDBut').append(`<button type="button" class="btn btn-primary btn-sm" id="createCardTwo">新建</button>`);
                $('#twoCRDBut').append('<button type="button" class="btn btn-sm" id="editCardTwo">编辑</button>');
                $('#twoCRDBut').append(`<button type="button" class="btn btn-sm" id="deleteCardTwo">删除</button>`);
            }
            return;
        } else {
            $("#portraitContentTwo").addClass("hide");
            $("#portraitContentOne").removeClass("hide");
            $("#portraitContentThree").addClass("hide");
            $("#portraitEmptyContainerAll").addClass("hide");
        }
        //新建和导入按钮还有布控状态筛选隐藏
        if (type == '1') { //静态库
            //$("#AlarmOptPortrait").removeClass("hide"); //布控状态按钮
            $("#portraitCancel").addClass("hide"); //撤控
            $("#portraitCancelCheck").addClass("hide"); //撤控全选
            if (treeNode.isEdit == '1') { //当前登录人可编辑
                $('#createCard').removeClass('display-none'); //新建
                $('#importLibraryBtn').removeClass('display-none'); //导入
            } else {
                $('#createCard').addClass('display-none'); //新建
                $('#importLibraryBtn').addClass('display-none'); //导入
            }
            //静态全量才能请求标签
            if (treeNode.parentType == '2' || treeNode.libId == '001') {
                $("#portraitContentOne").find(".portraitContentLabel").addClass("hide");
            } else {
                if (treeNode.libId == '0010') {
                    $("#AlarmOptPortrait").addClass("hide");
                    $("#portraitContentOne").find(".portraitContentLabel").addClass("hide");
                } else {
                    if (treeNode.type == '1') {
                        $("#AlarmOptPortrait").addClass("hide");
                    } else {
                        $("#AlarmOptPortrait").removeClass("hide");
                    }
                    //获取库标签
                    getLibData();
                }
            }
        } else {
            $('#createCard').addClass('display-none');
            $('#importLibraryBtn').addClass('display-none');
            $("#AlarmOptPortrait").addClass("hide");
            $("#portraitCancel").addClass("hide");
            $("#portraitCancelCheck").addClass("hide");
            if (treeNode.parentType == '4') { //布控库有撤控按钮 
                if (treeNode.isBk == '1') { //可撤控
                    $("#portraitCancel").removeClass("hide");
                    $("#portraitCancelCheck").removeClass("hide");
                } else {
                    $("#portraitCancel").addClass("hide");
                    $("#portraitCancelCheck").addClass("hide");
                }
            }
            //获取库标签
            getLibData();
        }

        // 调用刷新右侧人员库信息详情方法
        refreshAlarmPageList();
    };

    /**
     * 刷新右侧内容和右侧内容分页的数据
     */
    function refreshAlarmPageList() {
        loadRightContainer(containerData, $('#portraitResultContainer'), function (totalSize, totalPage) {
            setPageParams($('#portraitPagination'), totalSize, totalPage, function (currPage, pageSize) {
                $("#portraitCancelCheckAll").removeAttr("checked"); //布控库全选按钮取消全选
                $("#portraitCancel").removeClass("btn-primary");
                containerData.page = currPage;
                containerData.size = pageSize;
                loadRightContainer(containerData, $('#portraitResultContainer'));
            }, true, [{
                value: 16,
                text: '16/页',
                selected: true
            }, {
                value: 32,
                text: '32/页'
            }, {
                value: 48,
                text: '48/页'
            }]);
        });
    }

    /** 右侧内容区域刷新方法
     * 
     * @param {*} opts 
     * @param {*} $container 
     * @param {*} loadEndCallback 
     */
    function loadRightContainer(opts, $container, loadEndCallback) {
        showLoading($container.closest('.layout-type3'));
        var port = 'v3/opPersonInfo/searchPersonInfo',
            _data = {
                page: opts.page ? opts.page : '1', // 当前页数
                size: opts.size ? opts.size : '16', // 每一页个数
                libId: opts.libId,
                labelId: opts.labelId ? opts.labelId : '',
                type: opts.type ? opts.type : '',
                idcard: opts.idcard ? opts.idcard : '', // 身份证号
                name: opts.name ? opts.name : '', // 姓名
                picStatus: opts.picStatus ? opts.picStatus : '', //布控状态
                rowstate: opts.rowstate ? opts.rowstate : '' //布控状态删除
            },
            successFunc = function (data) {
                hideLoading($container.closest('.layout-type3'))
                var _data = data.data;
                if (data.code == '200') {
                    var _list = _data.list;
                    if (_list && _list.length > 0) {
                        // 移除空数据节点
                        $container.removeClass("hide");
                        $container.show();
                        $('#portraitEmptyContainer').addClass("hide");
                        // 调用人员信息卡片节点拼接方法
                        createCardDom(_list, $('#cardInfoList'));
                        createListDom(_list, $('#portraitTableList tbody'));
                    } else {
                        $("#cardDetail").addClass("hide");
                        $container.addClass("hide");
                        $('#portraitEmptyContainer').removeClass("hide");
                        loadEmpty($('#portraitEmptyContainer'), "暂无人员信息", "当前暂无人员信息");
                    }
                    loadEndCallback && loadEndCallback(_data.total, _data.totalPage);
                    let infoHeight = $(window).height() - $("#portraitContainer .card-title-box").height() - document.getElementById("portraitResultContainer").offsetHeight - $("#portraitPagination").height() - $("#cardDetail").find(".panel-heading").height() - 20;
                    $("#cardDetail .search-detail-box-item").css({
                        height: infoHeight + "px",
                        overflow: "hidden"
                    });
                } else {
                    $("#cardDetail").addClass("hide");
                    $container.hide();
                    $('#portraitEmptyContainer').removeClass("hide")
                    loadEmpty($('#portraitEmptyContainer'), "", "系统异常，请重新修改过滤条件");
                    loadEndCallback && loadEndCallback(0, 0);
                }
            };

        loadData(port, true, _data, successFunc);
    }

    /** 
     * 人员信息卡片节点拼接
     * @param {*} data 传入的数据
     * @param {*} container 插入节点
     */
    function createCardDom(data, container) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            var picStatus = '未布控', //默认未布控
                tagType = 'grade2',
                tagCheck = ''; //是否显示单选框
            if ($("#AlarmOptPortrait").hasClass("hide")) {
                var tagType = 'hide'; //是否显示标签
                var tagCheck = '';
                if ($("#portraitCancel").hasClass("hide")) { //是否有撤控按钮,有就是在布控对象
                    var tagCheck = 'hide';
                    if (data[i].rowstate == "-1") { //业务对象里面状态是已删除要显示
                        picStatus = '已删除';
                        tagType = 'grade4';
                    }
                }
            } else { //在关注对象
                var tagCheck = 'hide';
                if (data[i].rowstate == '-1') { //已删除
                    picStatus = '已删除';
                    tagType = 'grade4';
                } else {
                    if (data[i].picStatus == '0') { //未布控
                        picStatus = '未布控';
                        tagType = 'grade2';
                    } else if (data[i].picStatus == '1') { //布控中
                        picStatus = '布控中';
                        tagType = 'grade1';
                    } else if (data[i].picStatus == '2') { //已撤控
                        picStatus = '已撤控';
                        tagType = 'grade3';
                    }
                }
            }
            var cardType = '身份证';
            switch (data[i].idType) {
                case '1':
                    cardType == '身份证';
                    break;
                case '2':
                    cardType == '护照';
                    break;
                case '3':
                    cardType == '港澳通行证';
                    break;
                case '4':
                    cardType == '回乡证';
                    break;
                case '5':
                    cardType == '台胞证';
                    break;
                case '6':
                    cardType == '居住证';
                    break;
                case '7':
                    cardType == '社保';
                    break;
                case '8':
                    cardType == '台湾通行证';
                    break;
            }
            html += `<li class="image-info image-card-item" personId="${data[i].id}" libId="${data[i].libId}">
                        <div class="image-box">
                            <div class="image-box-flex">
                                <div class="image-checkbox-wrap ${tagCheck}">
                                    <label class="ui-checkboxradio-checkbox-label ui-checkboxradio-label ui-button ui-widget">
                                        <span class="ui-checkboxradio-icon  ui-icon ui-icon-background ui-icon-blank"></span>
                                    </label>
                                </div>
                                <img class="img img-right-event" src="${data[i].picUrl ? data[i].picUrl : './assets/images/control/person.png'}" onerror="this.error=null;this.src='./assets/images/control/person.png'"></img>
                            </div>
                        </div>
                        <div class="info-box">
                            <div class="form-info">
                                <div class="form-group aui-row">
                                    <label class="aui-form-label aui-col-8">姓名：</label>
                                    <div class="form-text aui-col-16">
                                        <span class="form-text-name" title="${data[i].name ? data[i].name : '暂无'}">${data[i].name ? data[i].name : '暂无'}</span>
                                        <span class="tag ${tagType}">${picStatus}</span>
                                    </div>
                                </div>
                                <div class="form-group aui-row">
                                    <label class="aui-form-label aui-col-8">性别：</label>
                                    <div class="form-text aui-col-16">${data[i].gender ? data[i].gender : '未知'}</div>
                                </div>
                                <div class="form-group aui-row">
                                    <label class="aui-form-label aui-col-8">国籍：</label>
                                    <div class="form-text aui-col-16">${data[i].nation ? data[i].nation : '未知'}</div>
                                </div>
                                <div class="form-group aui-row">
                                    <label class="aui-form-label aui-col-8" title="${cardType}">${cardType}：</label>
                                    <div class="form-text aui-col-16" title="${data[i].idcard ? data[i].idcard : '未知'}">${data[i].idcard ? data[i].idcard : '未知'}</div>
                                </div>
                            </div>
                        </div>
                    </li>`;
        }
        // 先清空节点,再把拼接的节点插入
        if ($('#cardInfoList').next()[0].id !== 'cardDetail') {
            container.parent('#portraitResultContainer').after(container.find('#cardDetail').hide());
        }
        container.empty().html(html);
        container.find('.image-card-item').each(function (index, el) {
            $(this).data('list', data[index]);
        });
        container.find(".image-card-item").eq(0).click();
        container.find(".image-card-item").eq(0).addClass("active");
        //默认选中第一个
        if ($("#showList").hasClass("btn-primary")) {
            $("#cardDetail").addClass("hide");
        }
        // 实例化详情节点  目前不要
        //portraitSlide('cardDetail', 'cardInfoList', 4);
        // $('#cardDetail .swiper-slide').each(function (index, el) {
        //     $(el).empty().html(createCardDetail(data[index]));
        // });
    }

    //点击获取人员所有图片
    function getPersonAllPhoto($imgBaseCS, listData, page) {
        showLoading($imgBaseCS);
        var port = 'v3/opPersonInfo/searchPersonInfo',
            portData = {
                libId: '0010',
                idcard: listData.idcard,
                page: page || 1,
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
                    					<img class="image-card-img" guid="${v.id}" src="${v.picUrl}" onerror="this.error=null;this.src='./assets/images/control/person.png'">
                    				</div>
                    				<div class="imgBaseCS-new">
                    					<p class="imgBaseCS-new-text">${v.libName || '未知'}</p>
                    					<p class="imgBaseCS-new-text">${v.createtime || '未知'}</p>
                    				</div>
                    			</li>`;
                    });

                    // 插入节点，人脸库数据
                    if (page == 1) {
                        $imgBaseCS.empty().append(_html);
                    } else {
                        $imgBaseCS.append(_html);
                    }
                    $imgBaseCS.data("result", data.data);
                    // 数据绑定
                    // $imgBaseCS.find(".imgBase-card-wrap").each(function (index, el) {
                    //     $(el).data('listData', list[index]);
                    // });

                } else {
                    loadEmpty($imgBaseCS, "暂无其他库图片");
                    //warningTip.say(data.message);
                }
            };
        if (listData.idcard) {
            hideLoading($imgBaseCS);
            loadData(port, true, portData, successFunc);
        } else {
            hideLoading($imgBaseCS);
            loadEmpty($imgBaseCS, "无身份证信息！");
        }
    }

    /**
     * 人员信息列表节点拼接
     * @param {*} data 传入的数据
     * @param {*} isList 传入isList时为浅色皮肤
     */
    function createCardDetail(data, isList) {
        var html = '',
            $operateCodes = $('body').data('operateCodes'),
            portraitTreeId = $("#portrait-tree-list").find("li.active").attr("id"),
            isdistall = $("#" + portraitTreeId + "_a").find(".portrait-tree-type").attr("isdistall"), //是否是整库布控
            BKtype = $("#" + portraitTreeId + "_a").find(".portrait-tree-type").attr("title"); //布控状态

        var cardType = '身份证';
        switch (data.idType) {
            case '1':
                cardType == '身份证';
                break;
            case '2':
                cardType == '护照';
                break;
            case '3':
                cardType == '港澳通行证';
                break;
            case '4':
                cardType == '回乡证';
                break;
            case '5':
                cardType == '台胞证';
                break;
            case '6':
                cardType == '居住证';
                break;
            case '7':
                cardType == '社保';
                break;
            case '8':
                cardType == '台湾通行证';
                break;
        }

        html += `<div class="side-search-detail" personId="${data.id}" libId="${data.libId}" labelId=${data.labelIds}>
                    <div class="side-bottom-left short">
                        <div class="image-card-wrap noborer">
                            <div class="image-box-flex">
                                <img class="img img-right-event" guid="${data.id}" src="${data.picUrl ? data.picUrl : './assets/images/control/person.png'}" onerror="this.error=null;this.src='./assets/images/control/person.png'" alt="">
                            </div>
                        </div>
                    </div>
                    <div class="side-bottom-center">
                        <div class="aui-mb-sm">
                            <span class="text-lg">${data.name ? data.name : '暂无'}</span>`;
        // 在逃和关注对象 添加tag标签 
        // 有布控次数、告警次数才显示，没有则不显示
        if (data.userType == '1') {
            html += `<span class="tag tag-error aui-ml-xs">在逃</span>`;
            html += `<span class="tag tag-error hasborder cursor-pointer target-bkmodal" data-toggle="modal" data-target="#bkModal">布控次数${data.bkCount}</span>`;
            html += `<span class="tag tag-error hasborder cursor-pointer target-alarmmodal" data-toggle="modal" data-target="#alarmModal">告警次数${data.alarmCount}</span>`;
        } else if (data.userType == '2') {
            html += `<span class="tag tag-warning aui-ml-xs">重点人员</span>`;
            html += `<span class="tag tag-warning hasborder cursor-pointer target-bkmodal" data-toggle="modal" data-target="#bkModal">布控次数${data.bkCount}</span>`;
            html += `<span class="tag tag-warning hasborder cursor-pointer target-alarmmodal" data-toggle="modal" data-target="#alarmModal">告警次数${data.alarmCount}</span>`;
        }
        if (!$("#AlarmOptPortrait").hasClass("hide")) { //在关注对象
            if (data.rowstate == '-1') { //已删除状态
                html += `<span class="tag grade4 aui-ml-xs">已删除</span>`;
                if (containerData.isEdit == '1') {
                    html += `<div class="float-right btn-gutter-sm">
                            <button type="button" class="btn btn-sm" id="portraitOptHF">恢复</button>
                        </div>`;
                }
            } else {
                if (data.picStatus == '1') {
                    html += `<span class="tag grade1 aui-ml-xs">布控中</span>`;
                    if (containerData.isBk == '1') {
                        var bkhtml = `<div class="float-right btn-gutter-sm">
                                            <button type="button" class="btn btn-sm" id="portraitOptCK">撤控</button>
                                        </div>`;
                    } else {
                        var bkhtml = '';
                    }
                } else if (data.picStatus == '2') {
                    html += `<span class="tag grade3 aui-ml-xs">已撤控</span>`;
                    if (containerData.isBk == '1') {
                        if (isdistall == "true" && BKtype == "未布控") {
                            var bkhtml = '';
                        } else {
                            var bkhtml = '<button type="button" class="btn btn-sm" id="portraitOptBK">布控</button>';
                        }
                    } else {
                        var bkhtml = '';
                    }
                } else { //未布控默认
                    html += `<span class="tag grade2 aui-ml-xs">未布控</span>`;

                    if (containerData.isBk == '1') {
                        if (isdistall == "true" && BKtype == "未布控") {
                            var bkhtml = '';
                        } else {
                            var bkhtml = '<button type="button" class="btn btn-sm" id="portraitOptBK">布控</button>';
                        }
                    } else {
                        var bkhtml = '';
                    }
                }

                if (containerData.isEdit == '1') {
                    var bjhtml = `<button type="button" class="btn btn-sm" id="portraitOptSC">删除</button>
                                <button type="button" class="btn btn-sm" id="portraitOptBJ">编辑</button>`;
                } else {
                    var bjhtml = '';
                }

                html += `<div class="float-right btn-gutter-sm">
                            ${bkhtml}
                            ${bjhtml}
                        </div>`;
            }
        } else {
            if (containerData.type != '0' && containerData.isEdit == '1') {
                if (data.rowstate == '-1') { //已删除状态
                    html += `<span class="tag grade4 aui-ml-xs">已删除</span>`;
                    html += `<div class="float-right btn-gutter-sm">
                                <button type="button" class="btn btn-sm" id="portraitOptHF">恢复</button>
                            </div>`;
                } else {
                    html += `<div class="float-right btn-gutter-sm">
                                <button type="button" class="btn btn-sm" id="portraitOptSC">删除</button>
                                <button type="button" class="btn btn-sm" id="portraitOptBJ">编辑</button>
                            </div>`;
                }
            }
        }

        html += `</div>`;

        if ($operateCodes && $operateCodes.length > 0) {
            $operateCodes.forEach(function (val, index) {
                switch (val.operateCode) {
                    case '4': // 删除人员详情
                        val.hasRights == '1' ?
                            html += `<div class="search-detail-operate portrait-info-delete">
                                        <span class="text-link hide">
                                            <i class="icon aui-icon-delete-line"></i>
                                            <span class="text portrait-delete">删除</span>
                                        </span>
                                    </div>` : '';
                        break;
                }
            })
        }

        html += `<div class="form-info aui-row clearfix">
                        <div class="aui-col-12">
                            <div class="form-group aui-row">
                                <label class="aui-form-label aui-col-8">
                                    <span>性别：</span>
                                </label>
                                <div class="form-text aui-col-16">${data.gender ? data.gender : '未知'}</div>
                            </div>
                        </div>
                        <div class="aui-col-12">
                            <div class="form-group aui-row">
                                <label class="aui-form-label aui-col-8">
                                    <span>证件类型：</span>
                                </label>
                                <div class="form-text aui-col-16">${cardType}</div>
                            </div>
                        </div>
                        <div class="aui-col-12">
                            <div class="form-group aui-row picsources">
                                <label class="aui-form-label aui-col-8">
                                    <span>来源：</span>
                                </label>
                                <div class="form-text aui-col-16">
                                    <!--<div class="type-onlyRead">-->
                                        ${data.sourceName ? data.sourceName : '暂无'}
                                        <!--</div>-->
                                    <div class="type-edit">
                                        <select multiple="multiple" style="width:100%"></select>
                                    </div>
                                </div>
                            </div>
                        </div>                        
                        <div class="aui-col-12">
                            <div class="form-group aui-row">
                                <label class="aui-form-label aui-col-8">
                                    <span>年龄：</span>
                                </label>
                                <div class="form-text aui-col-16">${data.age ? data.age : '未知'}</div>
                            </div>
                        </div>
                        <div class="aui-col-12">
                            <div class="form-group aui-row">
                                <label class="aui-form-label aui-col-8">
                                    <span>证件号码：</span>
                                </label>
                                <div class="form-text aui-col-16" title="${data.idcard ? data.idcard : '未知'}">${data.idcard ? data.idcard : '未知'}</div>
                            </div>
                        </div>
                        <div class="aui-col-12">
                            <div class="form-group aui-row">
                                <label class="aui-form-label aui-col-8">
                                    <span>同步时间：</span>
                                </label>
                                <div class="form-text aui-col-16">${data.createtime ? data.createtime : '未知'}</div>
                            </div>
                        </div>
                        <div class="aui-col-12">
                            <div class="form-group aui-row">
                                <label class="aui-form-label aui-col-8">
                                    <span>国籍：</span>
                                </label>
                                <div class="form-text aui-col-16" title="${data.nation ? data.nation : '未知'}">${data.nation ? data.nation : '未知'}</div>
                            </div>
                        </div>
                        <div class="aui-col-12">
                            <div class="form-group aui-row">
                                <label class="aui-form-label aui-col-8">
                                    <span>户籍所在地：</span>
                                </label>
                                <div class="form-text aui-col-16" title="${data.regaddress ? data.regaddress : '未知'}">${data.regaddress ? data.regaddress : '未知'}</div>
                            </div>
                        </div>
                        <div class="aui-col-12">
                            <div class="form-group aui-row curaddress">
                                <label class="aui-form-label aui-col-8">
                                    <span>当前居住地：</span>
                                </label>
                                <div class="form-text aui-col-16" title="${data.curaddress ? data.curaddress : '未知'}">
                                    <!--<div class="type-onlyRead" title="${data.curaddress ? data.curaddress : '未知'}">-->
                                        ${data.curaddress ? data.curaddress : '未知'}
                                    <!--</div>-->
                                    <input class="aui-input ${!isList ? 'deep' : ''} aui-input-sm type-edit" type="text" placeholder="请输入当前居住地">
                                </div>
                            </div>
                        </div>
                        <div class="aui-col-12">
                            <div class="form-group aui-row">
                                <label class="aui-form-label aui-col-8">
                                    <span>出生日期：</span>
                                </label>
                                <div class="form-text aui-col-16">${data.birthday ? data.birthday : '未知'}</div>
                            </div>
                        </div>
                        <div class="aui-col-12">
                            <div class="form-group aui-row">
                                <label class="aui-form-label aui-col-8">
                                    <span>采集时间：</span>
                                </label>
                                <div class="form-text aui-col-16" title="${data.picDate ? data.picDate : '未知'}">${data.picDate ? data.picDate : '未知'}</div>
                            </div>
                        </div>
                        <div class="aui-col-12">
                            <div class="form-group aui-row">
                                <label class="aui-form-label aui-col-8">
                                    <span>质量分：</span>
                                </label>
                                <div class="form-text aui-col-16" title="${data.picQuality ? data.picQuality : '未知'}">${data.picQuality ? data.picQuality : '未知'}</div>
                            </div>
                        </div>
                        <div class="aui-col-24">
                            <div class="form-group aui-row reason">
                                <label class="aui-form-label aui-col-4">
                                    <span>说明：</span>
                                </label>
                                <div class="form-text aui-col-20">
                                    <div class="type-onlyRead portraitComments">${data.comments ? data.comments : '暂无'}</div>
                                    <textarea class="type-edit aui-textarea ${!isList ? 'deep' : ''}" placeholder="请填写事由"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="imgBaseCS side-bottom-right">
                    <ul class="personAllImg"></ul>
                </div>
            </div>`;

        return html;
    }

    /**
     * 人员信息列表节点拼接
     * @param {*} data 目标数据
     * @param {*} $container 目标容器
     */
    function createListDom(data, $container) {
        var _html = '';
        for (var i = 0; i < data.length; i++) {
            var picStatus = '未布控', //默认未布控
                tagType = 'grade2',
                tagCheck = ''; //是否显示单选框
            if ($("#AlarmOptPortrait").hasClass("hide")) {
                var tagType = 'hide'; //是否显示标签
                var tagCheck = '';
                if ($("#portraitCancel").hasClass("hide")) { //是否有撤控按钮
                    var tagCheck = 'hide';
                    if (data[i].rowstate == "-1") { //业务对象里面状态是已删除要显示
                        picStatus = '已删除';
                        tagType = 'grade4';
                    }
                }
            } else {
                var tagCheck = 'hide';
                if (data[i].rowstate == '-1') { //已删除
                    picStatus = '已删除';
                    tagType = 'grade4';
                } else {
                    if (data[i].picStatus == '0') { //未布控
                        picStatus = '未布控';
                        tagType = 'grade2';
                    } else if (data[i].picStatus == '1') { //布控中
                        picStatus = '布控中';
                        tagType = 'grade1';
                    } else if (data[i].picStatus == '2') { //已撤控
                        picStatus = '已撤控';
                        tagType = 'grade3';
                    }
                }
            }

            var cardType = '身份证';
            switch (data[i].idType) {
                case '1':
                    cardType == '身份证';
                    break;
                case '2':
                    cardType == '护照';
                    break;
                case '3':
                    cardType == '港澳通行证';
                    break;
                case '4':
                    cardType == '回乡证';
                    break;
                case '5':
                    cardType == '台胞证';
                    break;
                case '6':
                    cardType == '居住证';
                    break;
                case '7':
                    cardType == '社保';
                    break;
                case '8':
                    cardType == '台湾通行证';
                    break;
            }
            _html += `
            <tr class="table-row" personId="${data[i].id}">
                <td class="pre5">
                    <div class="table-checkbox ${tagCheck}">
                        <input data-index="0" name="btSelectItem" type="checkbox" value="0" class="table-checkbox-input table-checkbox-input-configDetail">
                        <span class="table-checkbox-label"></span>
                    </div>
                    <a class="detail-icon" href="#"><i class="fa fa-plus"></i></a> 
                </td>
                <td class="pre5"><img class="table-img img-right-event" src="${data[i].picUrl ? data[i].picUrl : './assets/images/control/person.png'} onerror="this.error=null;this.src='./assets/images/control/person.png'"" alt=""></td>
                <td title="${data[i].name ? data[i].name : '未知'}">${data[i].name ? data[i].name : '未知'}</td>
                <td>${cardType}</td>
                <td class="pre20" title="${data[i].idcard ? data[i].idcard : '未知'}">${data[i].idcard ? data[i].idcard : '未知'}</td>
                <td>${data[i].gender ? data[i].gender : '未知'}</td>
                <td>${data[i].nation ? data[i].nation : '未知'}</td>
                <td title="${data[i].regaddress ? data[i].regaddress : '未知'}">${data[i].regaddress ? data[i].regaddress : '未知'}</td>
                <td>
                    <span class="tag ${data[i].userType == '1' ? ' tag-error ' : data[i].userType == '2' ? ' tag-warning ' : data[i].userType == '1' ? ' tag-white ' : ' display-none '}">
                    ${data[i].userType == '1' ? '在逃' : data[i].userType == '2' ? '重点人员' : data[i].userType == '1' ? '白名单' : ''}</span>
                    <span class="tag aui-ml-xs ${tagType}">${picStatus}</span>
                </td>
            </tr>
            `;
        }
        // 先清空节点,再把拼接的节点插入
        $container.empty().html(_html);
        $container.find('.table-row').each(function (index, el) {
            $(this).data('list', data[index]);
        });
    }

    /**
     * 加载布控详情
     * @param {*} data 
     * @param {*} $container 
     * @param {*} loadEndCallback 
     */
    function loadBKDetailDom(data, $container, loadEndCallback) {
        showLoading($container);
        var port = 'bkAlarm/getTaskByPeopleId',
            _data = {
                peopleId: data.peopleId ? data.peopleId : '', // 被布控人员id
                page: data.page ? data.page : '1', // 当前页数
                number: data.number ? data.number : '5', // 每一页个数
            },
            successFunc = function (data) {
                hideLoading($container);
                if (data.code == '000') {
                    var result = data.result,
                        _list = result.list;

                    if (loadEndCallback) {
                        loadEndCallback(result.total, result.totalPage);
                    }
                    if (_list && _list.length) {
                        var _html = '';
                        for (var i = 0; i < _list.length; i++) {
                            var tempStringObject = setArrayToStringObject(_list[i]);
                            _html += `
                                <tr class="">
                                    <td></td>
                                    <td>${_list[i].name}</td>
                                    <td>${_list[i].startTime}</td>
                                    <td>${tempStringObject.libString}</td>
                                    <td>${_list[i].createUser}</td>
                                </tr>
                            `;
                        }
                        $container.empty().html(_html);
                    }
                } else {
                    loadEmpty($container, data.msg, '');
                }
            }

        loadData(port, true, _data, successFunc);
    }

    //加载库标签
    function getLibData() {
        var port = 'v3/lib/getLibChildLabels',
            _data = {
                "libId": containerData.libId, // 被布控人员id
                "type": containerData.type
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    var html = '',
                        labelTotal = 0, //标签总数
                        tId = $("#portrait-tree-list").find("li.active").attr("id");
                    if (!containerData.labelId) {
                        $(".portraitLableTotal").addClass("active");
                    }
                    if (data.data.length > 1) {
                        $(".portraitContentLabel").removeClass("hide");
                        data.data.forEach((val, index) => {
                            if (val.labelId) {
                                html += `<div class="portraitLableShowItem ${val.labelId == containerData.labelId ? 'active' : ''}" labelId="${val.labelId}">
                                        <p class="portraitLableTotalTitle" title="${val.labelName}">${val.labelName}</p>
                                        <p class="portraitLableTotalNum">${val.num ? val.num : 0}</p>
                                    </div>`;
                            } else {
                                labelTotal = val.num;
                            }
                            //labelTotal += parseInt(val.num ? val.num : 0);
                        });
                        $(".portraitContentLabel").find(".portraitLableShowDetail").html(html);
                        $("#portraitLableTotalNum").html(labelTotal);
                        $("#" + tId + "_a").find(".portrait-tree-num").html('(' + labelTotal + ')');
                        $("#" + tId + "_a").attr("title", $("#" + tId + "_a").attr("nodename") + '(' + labelTotal + ')');
                        if (data.data.length > 9) {
                            $("#showMorePortraitLabels").removeClass("hide");
                        } else {
                            $("#showMorePortraitLabels").addClass("hide");
                        }
                    } else {
                        $(".portraitContentLabel").addClass("hide");
                        if (data.data.length == 1 && !data.data[0].labelId) { //拿到全部的num
                            $("#" + tId + "_a").find(".portrait-tree-num").html('(' + data.data[0].num + ')');
                            $("#" + tId + "_a").attr("title", $("#" + tId + "_a").attr("nodename") + '(' + data.data[0].num + ')');
                        }
                    }
                } else {
                    $(".portraitContentLabel").addClass("hide");
                    warningTip.say("获取当前库标签失败，请稍后再试！");
                }
            }

        loadData(port, true, _data, successFunc);
    };

    /**
     * 刷新右侧内容和右侧内容分页的数据
     */
    function refreshBKPageList() {
        loadBKDetailDom(bkDetailData, $('#bkTable tbody'), function (totalSize, totalPage) {
            setPageParams($('#bkListPage'), totalSize, totalPage, function (currPage, pageSize) {
                bkDetailData.page = currPage;
                loadBKDetailDom(bkDetailData, $('#bkTable tbody'));
            }, false);
        });
    }

    /**
     * 人员详情编辑保存
     * @param {*} opts 
     */
    function personEditSave(data) {
        var port = 'memberInfos/editPersonInfo',
            _data = data,
            successFunc = function (data) {
                if (data.code == '000') {
                    initPortraitTree($('body'));
                } else {
                    loadEmpty($('#portraitContainer'), '人员详情编辑保存失败', data.msg);
                }
            };

        loadData(port, true, _data, successFunc);
    };

    // 滚动加载数据
    $('#cardDetail').on('mousewheel', ".side-bottom-right", function () {
        //tab内容列表滚动到底部进行下一分页的懒加载事件
        var $this = $(this),
            $currentContainer = $('#cardDetail').find(".side-bottom-right .personAllImg"),
            viewHeight = $this.height(), //视口可见高度
            contentHeight = $currentContainer[0].scrollHeight, //内容高度
            scrollHeight = $this.scrollTop(), // 已经滚动了的高度
            currentCardItemNum = $currentContainer.find("li").length,
            totalCardItemNUM = $currentContainer.data().result ? $currentContainer.data().result.total : 0,
            page = $currentContainer.data().result ? $currentContainer.data().result.page : 0;
        if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalCardItemNUM) {
            getPersonAllPhoto($("#cardDetail").find(".side-bottom-right .personAllImg"), $("#portraitResultContainer").find(".image-card-item.active").data("list"), page + 1);
        }
    });

    // 布控次数详情点击事件
    $(document).on('click', '#cardInfoList .target-bkmodal', function () {
        var picsources = $('#portraitContainer').data('picsources');
        if (picsources == '1000') {
            bkDetailData.peopleId = $('#cardInfoList').find('.image-card-item.active').data().list.id;
        } else {
            bkDetailData.peopleId = $('#cardInfoList').find('.image-card-item.active').data().list.idcard;
        }
        refreshBKPageList()
    }).on('click', '#listContainerWrap .target-bkmodal', function () {
        var picsources = $('#portraitContainer').data('picsources');
        if (picsources == '1000') {
            bkDetailData.peopleId = $('#listContainerWrap').find('.fa-minus').closest('.table-row').data().list.id;
        } else {
            bkDetailData.peopleId = $('#listContainerWrap').find('.fa-minus').closest('.table-row').data().list.idcard;
        }
        refreshBKPageList()
    });

    //库标签每一项点击事件
    $(".portraitContentLabel").on("click", ".portraitLableTotal,.portraitLableShowItem", function () {
        if ($(this).parent().hasClass("portraitLableShowDetail")) {
            $(this).addClass("active").siblings().removeClass("active");
            $(".portraitLableTotal").removeClass("active");
        } else {
            $(this).addClass("active");
            $(".portraitLableShowDetail").find(".portraitLableShowItem").removeClass("active");
        }
        $("#portraitCancelCheckAll").removeAttr("checked");
        $("#portraitCancel").removeClass("btn-primary");
        containerData.labelId = $(this).attr("labelId") ? $(this).attr("labelId") : '';
        containerData.page = '1';
        containerData.size = '16';
        refreshAlarmPageList();
    });

    //关注对象布控状态筛选
    $("#AlarmOptPortrait").on("click", ".btn", function () {
        $(this).addClass("btn-primary").siblings().removeClass("btn-primary");
        var picStatus = '';
        switch ($(this).html()) {
            case "布控中":
                picStatus = '1';
                containerData.picStatus = picStatus;
                containerData.rowstate = '';
                break;
            case "未布控":
                picStatus = '0';
                containerData.picStatus = picStatus;
                containerData.rowstate = '';
                break;
            case "已删除":
                picStatus = '-1';
                containerData.picStatus = '';
                containerData.rowstate = picStatus;
                break;
            case "已撤控":
                picStatus = '2';
                containerData.picStatus = picStatus;
                containerData.rowstate = '';
                break;
            default:
                containerData.picStatus = '';
                containerData.rowstate = '';
        }

        containerData.page = '1';
        containerData.size = '16';
        refreshAlarmPageList();
    });

    //人像库标签查看全部按钮点击事件
    $("#portraitContentOne").on("click", ".portraitContentLabel .toggleTip", function () {
        if ($(this).html() == '查看更多') {
            $(".portraitContentLabel .portraitLableShowDetail").removeClass("showMoreLables");
            $(this).html("收起");
        } else {
            $(".portraitContentLabel .portraitLableShowDetail").addClass("showMoreLables");
            $(this).html("查看更多");
        }
    });

    //右侧列表全选按钮点击事件
    $("#portraitCancelCheckAll").on("click", function (e) {
        if (!$("#portraitResultContainer").hasClass("hide")) {
            if ($(this).is(":checked")) {
                for (var i = 0; i < $("#cardInfoList").find(".image-card-item .ui-checkboxradio-checkbox-label").length; i++) {
                    $("#cardInfoList").find(".image-card-item .ui-checkboxradio-checkbox-label").eq(i).addClass("ui-checkboxradio-checked"); //列表模式
                    $("#portraitTableList").find(".table-checkbox-input").eq(i).prop("checked", "checked");
                }
                $("#portraitCancel").addClass("btn-primary");
            } else {
                for (var i = 0; i < $("#cardInfoList").find(".image-card-item .ui-checkboxradio-checkbox-label").length; i++) {
                    $("#cardInfoList").find(".image-card-item .ui-checkboxradio-checkbox-label").eq(i).removeClass("ui-checkboxradio-checked");
                    $("#portraitTableList").find(".table-checkbox-input").eq(i).removeAttr("checked");
                }
                $("#portraitCancel").removeClass("btn-primary");
            }
        } else {
            $("#portraitCancel").removeClass("btn-primary");
        }
    });

    //右侧列表单个按钮点击事件--列表模式
    $("#cardInfoList").on("click", ".ui-checkboxradio-checkbox-label", function (e) {
        e.stopPropagation;
        if ($(this).hasClass("ui-checkboxradio-checked")) {
            $(this).removeClass("ui-checkboxradio-checked");
            $("#portraitTableList").find(".table-checkbox-input").eq($(this).parents(".image-card-item").index()).removeAttr("checked");
        } else {
            $(this).addClass("ui-checkboxradio-checked");
            $("#portraitTableList").find(".table-checkbox-input").eq($(this).parents(".image-card-item").index()).prop("checked", "checked");
        }
        if ($("#cardInfoList").find(".image-card-item .ui-checkboxradio-checkbox-label.ui-checkboxradio-checked").length > 0) {
            $("#portraitCancel").addClass("btn-primary");
        } else {
            $("#portraitCancel").removeClass("btn-primary");
        }

        for (var i = 0; i < $("#cardInfoList").find(".image-card-item .ui-checkboxradio-checkbox-label").length; i++) {
            if (!$("#cardInfoList").find(".image-card-item .ui-checkboxradio-checkbox-label").eq(i).hasClass("ui-checkboxradio-checked")) {
                $("#portraitCancelCheckAll").removeAttr("checked");
                return;
            }
        }
        $("#portraitCancelCheckAll").prop("checked", "checked");
    });

    //右侧列表单个按钮点击事件--表格模式
    $("#portraitTableList").on("click", ".table-checkbox-input", function (e) {
        e.stopPropagation;
        if ($(this).is(":checked")) {
            $("#cardInfoList").find(".image-card-item").eq($(this).parents("tr").index()).find(".ui-checkboxradio-checkbox-label").addClass("ui-checkboxradio-checked");
        } else {
            $("#cardInfoList").find(".image-card-item").eq($(this).parents("tr").index()).find(".ui-checkboxradio-checkbox-label").removeClass("ui-checkboxradio-checked");
        }

        if ($("#cardInfoList").find(".image-card-item .ui-checkboxradio-checkbox-label.ui-checkboxradio-checked").length > 0) {
            $("#portraitCancel").addClass("btn-primary");
        } else {
            $("#portraitCancel").removeClass("btn-primary");
        }

        for (var i = 0; i < $("#cardInfoList").find(".image-card-item .ui-checkboxradio-checkbox-label").length; i++) {
            if (!$("#cardInfoList").find(".image-card-item .ui-checkboxradio-checkbox-label").eq(i).hasClass("ui-checkboxradio-checked")) {
                $("#portraitCancelCheckAll").removeAttr("checked");
                return;
            }
        }
        $("#portraitCancelCheckAll").prop("checked", "checked");
    });

    //列表每一项内容点击详情事件加载
    $("#portraitResultContainer").on('click', '.image-card-item', debounce(function () {
        $("#cardDetail").removeClass("hide");
        $("#cardDetail").find(".search-detail-box-item").empty().html(createCardDetail($(this).data("list")));
        getPersonAllPhoto($("#cardDetail").find(".side-bottom-right .personAllImg"), $(this).data("list"));
        $(this).addClass("active").siblings().removeClass("active");
    }, 200)).on("click", "#portraitTableList .detail-icon", function () {
        //表格列表点击详情按钮展开详情内容
        var $this = $(this),
            $targetRow = $this.closest('.table-row'),
            targetData = $targetRow.data().list,
            tempDetailHtml = '<tr class="detail-view"><td colspan="9"><div class="search-detail-box search-detail-table light">';
        $('#portraitTableList .detail-view').remove();
        $targetRow.siblings().find(".fa-minus").removeClass("fa-minus").addClass("fa-plus");
        $this.find(".fa").toggleClass("fa-minus").toggleClass("fa-plus");
        if ($this.find(".fa").hasClass('fa-minus')) {
            tempDetailHtml += createCardDetail(targetData, true) + '</div></td></tr>';
            $targetRow.after(tempDetailHtml);
        }
        //var $container = $targetRow.next().find("")
        getPersonAllPhoto($targetRow.next().find(".side-bottom-right .personAllImg"), targetData);
    }).on("dblclick", '.image-card-item', function () {
        let data = $(this).data("list");
        $("#portraitCardModal").data({
            imgSrc: data.picUrl,
            guid: data.id
        })
        $("#portraitCardModal").modal("show");
    });

    //人员信息图片点击查看大图
    $("#cardDetail,#listContainerWrap").on("click", ".side-bottom-right .imgBase-card-wrap", function () {
        let imgSrc = $(this).find(".image-card-img").attr("src"),
            guid = $(this).find(".image-card-img").attr("guid");
        $("#portraitCardModal").data({
            imgSrc,
            guid
        })
        $("#portraitCardModal").modal("show");
    });

    //人员信息图片点击查看大图
    $("#cardDetail,#listContainerWrap").on("click", ".side-bottom-left .img", function () {
        let imgSrc = $(this).attr("src"),
            guid = $(this).attr("guid");
        $("#portraitCardModal").data({
            imgSrc,
            guid
        })
        $("#portraitCardModal").modal("show");
    });

    $('#portraitCardModal').on("shown.bs.modal", function () {
        let imgSrc = $(this).data("imgSrc"),
            guid = $(this).data("guid");
        $("#portraitCardModal").find(".modal-body").html(`<div class="iviewer_cursor"></div>`);
        $("#portraitCardModal").find(".iviewer_cursor").iviewer({
            src: imgSrc
        });

        var port = 'v2/regData/uniqueInFactoryLibInfo',
            data = {
                guid
            };
        var successFunc = function (data) {
            if (data.code === '200') {
                let res = data.data,
                    html = '';
                for (let i = 0; i < res.length; i++) {
                    html += `<span style="margin-right:15px">${res[i].platform}：${res[i].msg}；</span>`;
                }
                $('#portraitCardModal').find(".modal-info").html(`${html}`);
            } else {
                warningTip.say(data.message);
            }
        };
        loadData(port, true, data, successFunc);
    });

    $('#portraitCardModal').on("hide.bs.modal", function () {
        $("#portraitCardModal").find(".modal-body").html("");
    });

    // 人员信息详情点击编辑按钮事件
    $('#portraitResultContainer').on('click', '.portrait-info-edit', function () {
        $(this).hide().siblings('.portrait-info-save').show();
        $(this).closest('.side-bottom-right').find('.type-onlyRead').hide();
        $(this).closest('.side-bottom-right').find('.type-edit').show();
    }).on('click', '.portrait-info-save', function () {
        $(this).hide().siblings('.portrait-info-edit').show();
        $(this).closest('.side-bottom-right').find('.type-edit').hide();
        $(this).closest('.side-bottom-right').find('.type-onlyRead').show();

        var cardInfo = $('#cardInfoList'),
            listWrap = $('#listContainerWrap'),
            editData = {};

        if (cardInfo.hasClass('display-none')) { // 列表模式下
            var listData = listWrap.find('.table-row.open').data().list;
            var _picsources = listWrap.find('.select2-hidden-accessible').val().join(',');
            var _curaddress = listWrap.find('.curaddress .aui-input').val();
            var _reason = listWrap.find('.reason .aui-textarea').val();
            var _business = '';

            editData.libId = containerData.picsources;
            editData.idcard = listData.idcard;
            editData.id = listData.id;
            editData.guid = '';

            // 必须有至少一项修改才发起请求
            if (_picsources != containerData.picsources || _curaddress != '' || _reason != '') {
                if (_picsources != containerData.picsources) { // 来源库
                    editData.picsources = _picsources;
                }
                if (_curaddress != '') { // 当前居住地
                    editData.curaddress = _curaddress;
                }
                if (_reason != '') { // 事由
                    editData.reason = _reason;
                }
            }

        } else if (listWrap.hasClass('display-none')) { // 卡片模式下
            var cardData = cardInfo.find('.image-card-item.active').data().list;
            var _picsources = cardInfo.find('.select2-hidden-accessible').val().join(',');
            var _curaddress = cardInfo.find('.curaddress .aui-input').val();
            var _reason = cardInfo.find('.reason .aui-textarea').val();
            var _business = '';

            editData.libId = containerData.picsources;
            editData.idcard = cardData.idcard;
            editData.id = cardData.id;
            editData.guid = '';

            // 必须有至少一项修改才发起请求
            if (_picsources != containerData.picsources || _curaddress != '' || _reason != '') {
                if (_picsources != containerData.picsources) { // 来源库
                    editData.picsources = _picsources;
                }
                if (_curaddress != '') { // 当前居住地
                    editData.curaddress = _curaddress;
                }
                if (_reason != '') { // 事由
                    editData.reason = _reason;
                }
            }
        }

        personEditSave(editData);
    }).on("click", ".portrait-info-delete", function () {
        //删除人员按钮的事件入口
        $("#deletePersonModal").modal("show");
    });

    //人员信息点击表格和列表切换以及新建人员按钮点击事件
    $('#portraitContainer').on('click', '#showCard', function () {
        // 点击列表展示按钮
        $(this).addClass('btn-primary');
        $('#showList').removeClass('btn-primary');
        $('#cardInfoList').removeClass('display-none');
        $('#listContainerWrap').addClass('display-none');
        $('#portraitPagination').removeClass("paginationTable");

        if ($("#portraitEmptyContainer").hasClass("hide")) {
            $("#cardDetail").removeClass("hide");
        }

        let infoHeight = $(window).height() - $("#portraitContainer .card-title-box").height() - document.getElementById("portraitResultContainer").offsetHeight - $("#portraitPagination").height() - $("#cardDetail").find(".panel-heading").height() - 20;
        $("#cardDetail .search-detail-box-item").css({
            height: infoHeight + "px",
            overflow: "hidden"
        });
    }).on('click', '#showList', function () {
        // 点击表格展示按钮
        $(this).addClass('btn-primary');
        $('#showCard').removeClass('btn-primary');

        $('#listContainerWrap').removeClass('display-none');
        $('#portraitPagination').addClass("paginationTable");
        $('#cardInfoList').addClass('display-none');
        $("#cardDetail").addClass("hide");
    }).on('click', '#createCard', function () {
        // 点击新建按钮切换内容
        var $this = $(this);
        $('#createContainer').find('.text-danger').addClass('hide');
        var portraitTreeId = $("#portrait-tree-list").find("li.active").attr("id");
        $("#creatPortrait_libName").val($("#" + portraitTreeId + "_a").attr("nodeName"));
        getCardType();
        getPortraitLabel();
        $("#createContainer").attr("type", "add");
        $("#createContainer").find(".modal-title").html("新建人员");

        $('.no-input-warning').removeClass('no-input-warning');
        $('#addUploadImg').find('.uploadFile').val('').removeClass("hide");
        $('#addUploadImg').find('.pic-add-img').attr('src', '').addClass('hide').siblings('.aui-icon-add').removeClass('hide');
        $("#creatPortrait_name").val("").removeAttr("disabled"); //姓名置空
        $("#sexGroup").find(".ui-checkboxradio-label").eq(0).click(); //性别默认选中第一个
        $("#creatPortrait_nation").val(""); //国籍置空
        $("#creatPortrait_idcard").val("").removeAttr("disabled"); //身份证置空
        //户籍所在地置空
        $("#creatPortrait_regaddress").val("");
        //当前居住地置空
        $("#creatPortrait_curaddress").val("");
        $("#createContainer").find(".labelType").removeClass("hide");
    });

    //撤控原因输入事件
    $('#portraitCard_stop').on('input propertychange', function () {
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
            $(this).removeClass('no-input-warning').closest('.form-group').find(
                '.text-danger.tip').addClass('hide');
        } else {
            var nodeNumb = $(this).removeClass('no-input-warning').next();
            nodeNumb.find('span').text(120);
        }
    });

    //批量撤控按钮点击事件
    $("#portraitCancel").on("click", function () {
        if (!$(this).hasClass("btn-primary")) {
            warningTip.say("请选择撤控人");
            return;
        }
        $("#portraitCard_stop").val("");
        $("#portraitCardEndModal").data("type", "2"); //整库撤控和按人撤控区分1.整库2.批量按人3.单个按人
        $("#portraitCard_stop").parent().find(".text-danger.tip").addClass("hide");
        $("#portraitCard_stop").parent().find(".wordNum.warning-item-text").addClass("hide");
        $("#portraitCardEndModal").modal("show");
    });

    //单个人员撤控按钮点击事件
    $("#cardDetail,#listContainerWrap").on("click", "#portraitOptCK", function () {
        $("#portraitCard_stop").val("");
        $("#portraitCardEndModal").data("type", "3"); //整库撤控和按人撤控区分1.整库2.批量按人3.单个按人
        $("#portraitCard_stop").parent().find(".text-danger.tip").addClass("hide");
        $("#portraitCard_stop").parent().find(".wordNum.warning-item-text").addClass("hide");
        $("#portraitCardEndModal").modal("show");
    });

    //撤控确认按钮点击事件
    $("#portraitCardEndModal").on("click", ".btn-primary", function () {
        if ($("#portraitCardEndModal").data("type") == '2') { //批量按人
            var personId = [];
            if ($("#showCard").hasClass("btn-primary")) {
                for (let i = 0; i < $("#cardInfoList").find(".image-card-item").length; i++) {
                    if ($("#cardInfoList").find(".image-card-item").eq(i).find(".ui-checkboxradio-checkbox-label").hasClass("ui-checkboxradio-checked")) {
                        personId.push($("#cardInfoList").find(".image-card-item").eq(i).attr("personId"));
                    }
                }

            } else {
                for (let i = 0; i < $("#portraitTableList").find("tbody tr").length; i++) {
                    if ($("#portraitTableList").find("tbody tr").eq(i).find("td").eq(0).find("input").is(":checked")) {
                        personId.push($("#portraitTableList").find("tbody tr").eq(i).attr("personId"));
                    }
                }
            }

            if ($.trim($("#portraitCard_stop").val()).length > 0) {
                var port = 'v3/distributeManager/undoPeople',
                    _data = {
                        taskId: "",
                        libId: containerData.libId,
                        personList: personId,
                        comments: $("#portraitCard_stop").val()
                    },
                    successFunc = function (data) {
                        if (data.code == '200') {
                            containerData.page = '1';
                            containerData.size = '16';
                            refreshAlarmPageList();
                            getLibData();
                            $("#portraitCardEndModal").modal("hide");
                        } else {
                            warningTip.say(data.message);
                        }
                    };
                loadData(port, true, _data, successFunc);
            } else {
                $("#portraitCard_stop").parent().find(".text-danger.tip").removeClass("hide");
            }
        } else if ($("#portraitCardEndModal").data("type") == '3') { //单个按人
            if ($("#showCard").hasClass("btn-primary")) { //列表模式
                var personId = [$("#cardDetail").find(".side-search-detail").attr("personId")];
                var libId = $("#cardDetail").find(".side-search-detail").attr("libId");
            } else if ($("#showList").hasClass("btn-primary")) {
                var personId = [$("#portraitTableList").find(".side-search-detail").attr("personId")];
                var libId = $("#portraitTableList").find(".side-search-detail").attr("libId");
            }

            if ($.trim($("#portraitCard_stop").val()).length > 0) {
                var port = 'v3/distributeManager/undoPeople',
                    _data = {
                        taskId: "",
                        libId: containerData.libId,
                        personList: personId,
                        comments: $("#portraitCard_stop").val()
                    },
                    successFunc = function (data) {
                        if (data.code == '200') {
                            containerData.page = '1';
                            containerData.size = '16';
                            refreshAlarmPageList();
                            $("#portraitCardEndModal").modal("hide");
                        } else {
                            warningTip.say(data.message);
                        }
                    };
                loadData(port, true, _data, successFunc);
            } else {
                $("#portraitCard_stop").parent().find(".text-danger.tip").removeClass("hide");
            }
        } else if ($("#portraitCardEndModal").data("type") == '1') { //按库
            if ($.trim($("#portraitCard_stop").val()).length > 0) {
                var port = 'v3/distributeManager/undoLib',
                    _data = {
                        libId: $("#portraitCardEndModal").data("libId"),
                        comments: $("#portraitCard_stop").val()
                    },
                    successFunc = function (data) {
                        if (data.code == '200') {
                            $("#portraitCardEndModal").modal("hide");

                            var $barItem = $('#pageSidebarMenu .aui-icon-personnel').closest('.sidebar-item'),
                                barIndex = $barItem.index(),
                                $saveItem = $('#content-box').children().eq(barIndex),
                                url = $('#pageSidebarMenu .aui-icon-personnel').parent("a").attr("lc") + "?dynamic=" + Global.dynamic;
                            $barItem.addClass('active').siblings().removeClass('active');
                            $saveItem.removeClass('hide').siblings().addClass('hide');
                            loadPage($saveItem, url);
                        } else {
                            warningTip.say(data.message);
                        }
                    };
                loadData(port, true, _data, successFunc);
            } else {
                $("#portraitCard_stop").parent().find(".text-danger.tip").removeClass("hide");
            }
        }
    });

    //列表详情点击布控事件
    $("#cardDetail,#listContainerWrap").on("click", "#portraitOptBK", function () {
        var personId = $(this).parents(".side-search-detail").attr("personId"),
            libId = $(this).parents(".side-search-detail").attr("libId"),
            labelId = $(this).parents(".side-search-detail").attr("labelId");
        if (containerData.status == '3') { //整库布控
            $("#BKPersonModal").data({
                libId,
                personId
            });
            $("#BKPersonModal").modal("show");
        } else { //部分或者未布控要新建布控任务
            var url = "./facePlatform/control-new.html?dynamic=" + Global.dynamic,
                picUrl = $(this).parents("#cardDetail").find(".side-bottom-left img").attr("src");
            if ($("#showList").hasClass("btn-primary")) {
                var picUrl = $(this).parents(".detail-view").find(".side-bottom-left img").attr("src");
            }
            loadPage($('.control-new-popup'), url);
            $('.control-new-popup').removeClass('hide');

            $('#selectObject').removeClass('hide');
            $('#selectControl').addClass('hide');
            var html = `<div class="add-image-item">
                            <img class="add-image-img" src="${picUrl}" alt="">
                            <i class="aui-icon-delete-line"></i>
                        </div>`;
            $('#control_imgList').find('.add-image-icon').before(html);
            $('#control_imgList').data({
                "picForm": "portraitCard", //来自人员库
                "portraitLibId": libId, //库标签和id
                "portraitLabelId": labelId //库标签和id
            });
            $('#control_imgList').find(".add-image-item").eq(0).data("peopleId", personId);
            $('#control_imgList').removeClass('center');
            $('#control_imgList').find('.add-image-icon').removeClass('add-image-new');
            $('#control_imgList').find('.add-image-box-text').addClass('hide');
            $("#control_imgList .add-image-icon").siblings('.add-image-item').removeClass('active');
            $('#addImgWarning').addClass('hide');
        }
    });

    //整库布控单个人员布控确认事件
    $("#BKPersonModal").on("click", ".btn-primary", function () {
        var port = 'v3/opPersonInfo/executeControlByPerson',
            _data = {
                libId: $("#BKPersonModal").data("libId"),
                personList: [$("#BKPersonModal").data("personId")]
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    containerData.page = '1';
                    containerData.size = '16';
                    refreshAlarmPageList();
                    $("#BKPersonModal").modal("hide");
                } else {
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, _data, successFunc);
    });

    //恢复按钮点击事件
    $("#cardDetail,#listContainerWrap").on("click", "#portraitOptHF", function () {
        $("#recoverPersonModal").modal("show");
    });

    //恢复确认按钮点击事件
    $("#recoverPersonModal").on("click", ".btn-primary", function () {
        if ($("#showCard").hasClass("btn-primary")) { //列表模式
            var personId = $("#cardDetail").find(".side-search-detail").attr("personId");
            var libId = $("#cardDetail").find(".side-search-detail").attr("libId");
        } else if ($("#showList").hasClass("btn-primary")) {
            var personId = $("#portraitTableList").find(".side-search-detail").attr("personId");
            var libId = $("#portraitTableList").find(".side-search-detail").attr("libId");
        }
        var port = 'v3/opPersonInfo/editPersonInfo',
            _data = {
                libId: libId,
                id: personId,
                rowstate: 1
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    containerData.page = '1';
                    containerData.size = '16';
                    refreshAlarmPageList();
                    $("#recoverPersonModal").modal("hide");
                } else {
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, _data, successFunc);
    });

    $("#cardDetail,#listContainerWrap").on("click", "#portraitOptBJ", function () {
        var data = $("#portraitResultContainer").find('.image-card-item.active').data("list");
        getCardType();
        $("#createContainer").attr("type", "edit");
        $("#createContainer").find(".modal-title").html("编辑人员");

        $('#createContainer').find('.text-danger').addClass('hide');
        $('.no-input-warning').removeClass('no-input-warning');
        //图片
        $("#addUploadImg").find(".aui-icon-add").addClass("hide");
        $("#addUploadImg").find(".uploadFile").addClass("hide");
        $("#addUploadImg").find(".pic-add-img").removeClass("hide").attr("src", data.picUrl);
        //姓名
        $("#creatPortrait_name").val(data.name).attr("disabled", "disabled");
        //性别
        if (data.gender == '男') {
            $("#sexGroup").find(".ui-checkboxradio-label").eq(0).click();
        } else if (data.gender == '女') {
            $("#sexGroup").find(".ui-checkboxradio-label").eq(1).click();
        } else {
            $("#sexGroup").find(".ui-checkboxradio-label").eq(2).click();
        }
        //国籍
        $("#creatPortrait_nation").val(data.nation ? data.nation : '未知');
        //证件类型
        $("#creatPortrait_cardType").val(data.idType);
        $("#creatPortrait_cardType").selectpicker("refresh");
        //证件号码
        $("#creatPortrait_idcard").val(data.idcard).attr("disabled", "disabled");
        //户籍所在地
        $("#creatPortrait_regaddress").val(data.regaddress);
        //当前居住地
        $("#creatPortrait_curaddress").val(data.curaddress);
        $("#createContainer").find(".labelType").addClass("hide");
        $("#createContainer").modal("show");
    });
    //编辑按钮点击事件

    /* 右侧内容区域 end */

    /* 查询 start */
    /**
     * 身份证姓名查询
     * @param {*} $dom 身份证姓名验证节点
     */
    function idcardNameSearch($dom) {
        var searchVal = $.trim($dom.val());
        //var regIdCard = /(^\d{15}$)|(^\d{17}(\d|X)$)/; // 身份证校验
        //var regName = /^[\u4e00-\u9fa5\uf900-\ufa2d·s]{1,20}$/; // 名字校验

        var regIdCard = /^[a-zA-Z(_)]*\d+[a-zA-Z0-9(_)]+$/;
        if (regIdCard.test(searchVal)) { // 身份证校验通过
            $dom.removeClass('error').closest('.aui-input-affix-wrapper').siblings('.text-error').addClass('display-none');
            containerData.idcard = searchVal;
            containerData.name = '';
            containerData.page = '1';
            containerData.size = '16';
            $('#portraitContainer').data('idcard', searchVal);
            refreshAlarmPageList();

        } else if (searchVal == '') { // 数据清空时
            containerData.idcard = searchVal;
            containerData.name = searchVal;
            containerData.page = '1';
            containerData.size = '16';
            $('#portraitContainer').data('idcard', searchVal);
            refreshAlarmPageList();
        } else {
            $dom.removeClass('error').closest('.aui-input-affix-wrapper').siblings('.text-error').addClass('display-none');
            containerData.idcard = '';
            containerData.name = searchVal;
            containerData.page = '1';
            containerData.size = '16';
            $('#portraitContainer').data('name', searchVal);
            refreshAlarmPageList();
            //$dom.addClass('error').closest('.aui-input-affix-wrapper').siblings('.text-error').removeClass('display-none');
        }

        //else if (regName.test(searchVal)) { // 姓名校验通过
        // $dom.removeClass('error').closest('.aui-input-affix-wrapper').siblings('.text-error').addClass('display-none');
        // containerData.name = searchVal;
        // containerData.page = '1';
        // containerData.size = '16';
        // $('#portraitContainer').data('name', searchVal);
        // refreshAlarmPageList();
        //} 
    };

    //姓名或身份证输入框查询按钮点击事件
    $('#personSearchIcon').on('click', function () {
        idcardNameSearch($('#personSearch'));
    });

    // 身份证姓名查询回车事件
    $('#personSearch').on('keydown', function (e) {
        $('#personSearch').closest('.float-right').find('.text-error').addClass('display-none');
        var code = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
        if (code == 13) {
            idcardNameSearch($('#personSearch'));
        }
    });
    /* 查询 end */

    /* 新建人员对象 start */
    //当前库标签获取
    function getPortraitLabel() {
        var infoPort = 'v3/lib/getLibChildLabels',
            infoData1 = {
                "libId": containerData.libId,
                "type": containerData.type
            },
            infoPortSuccessFunc1 = function (data) {
                if (data.code === '200') {
                    var RX_BKPLAT_Html = '';
                    data.data.forEach(function (item) {
                        RX_BKPLAT_Html += `<option value="${item.labelId}">${item.labelName}</option>`
                    })
                    $("#creatPortrait_labelId").html(RX_BKPLAT_Html);
                    if (data.data.length > 0) {
                        $('#creatPortrait_labelId').selectpicker({
                            'noneSelectedText': '请选择标签',
                            'val': []
                        });
                        $('#creatPortrait_labelId').removeAttr("disabled");
                    } else {
                        $('#creatPortrait_labelId').selectpicker({
                            'noneSelectedText': '当前库暂无标签'
                        });
                        $('#creatPortrait_labelId').attr("disabled", "disabled");
                    }
                    $("#creatPortrait_labelId").selectpicker('refresh');
                } else {
                    $('#creatPortrait_labelId').selectpicker({
                        'noneSelectedText': '当前库暂无标签'
                    });
                    $('#creatPortrait_labelId').attr("disabled", "disabled");

                    $("#creatPortrait_labelId").selectpicker('refresh');
                }
                $('#createContainer').modal("show");
            };
        loadData(infoPort, true, infoData1, infoPortSuccessFunc1);
    }

    //获取证件类型
    function getCardType() {
        var infoPort = 'v2/dic/dictionaryInfo',
            infoData1 = {
                "kind": "RX_ID_TYPE"
            },
            infoPortSuccessFunc1 = function (data) {
                if (data.code === '200') {
                    var RX_ID_TYPE = '';
                    data.data.forEach(function (item) {
                        RX_ID_TYPE += `<option value="${item.id}">${item.name}</option>`
                    })
                    $("#creatPortrait_cardType").html(RX_ID_TYPE);
                    if (data.data.length > 0) {
                        $('#creatPortrait_cardType').selectpicker({
                            'noneSelectedText': '请选择类型',
                            'val': []
                        });
                        $('#creatPortrait_cardType').removeAttr("disabled");
                    } else {
                        $('#creatPortrait_cardType').selectpicker({
                            'noneSelectedText': '当前暂无类型'
                        });
                        $('#creatPortrait_cardType').attr("disabled", "disabled");
                    }
                    $("#creatPortrait_cardType").selectpicker('refresh');
                } else {
                    $('#creatPortrait_cardType').selectpicker({
                        'noneSelectedText': '当前暂无类型'
                    });
                    $('#creatPortrait_cardType').attr("disabled", "disabled");
                    $("#creatPortrait_cardType").selectpicker('refresh');
                }
                //getPortraitLabel();
            };
        loadData(infoPort, true, infoData1, infoPortSuccessFunc1, '', 'GET');
    }

    // 新建人员信息上传图片事件
    $('#addUploadImg').on('change', '.uploadFile', function () {
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

            // 判断文件大小是否超过10M 
            if (fileSize > 10 * 1024 * 1024) {
                warningTip.say('上传文件过大,请上传不大于10M的文件');
                this.value = '';
                return;
            }

            var reader = new FileReader();
            reader.onload = function (e) {
                var addimg = reader.result;
                $('#addUploadImg .aui-icon-add').addClass('hide').siblings('.pic-add-img').removeClass('hide').attr('src', addimg);
                $('#addUploadImg').siblings('.text-danger').addClass('hide');
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // 新建人员界面点击保存按钮事件
    $('#addPersonSave').on('click', function () {
        var name = $.trim($('#creatPortrait_name').val()); //姓名
        if ($('#addUploadImg').find('.pic-add-img').attr('src').indexOf("http:") == 0) {
            var url = $('#addUploadImg').find('.pic-add-img').attr('src');
        } else {
            var base64 = $('#addUploadImg').find('.pic-add-img').attr('src');
        }
        var gender = $("#sexGroup").find(".ui-checkboxradio-checked").attr("type"); //性别
        var nation = $.trim($('#creatPortrait_nation').val()); //国籍
        var idcard = $.trim($('#creatPortrait_idcard').val()); //身份证
        var idType = $('#creatPortrait_cardType').val(); //证件类型
        var libId = containerData.libId;
        var labelId = $('#creatPortrait_labelId').val(); //标签
        var regaddress = $('#creatPortrait_regaddress').val(); //户籍所在地
        var curaddress = $('#creatPortrait_curaddress').val(); //当前居住地

        var flag = true;
        if (!name) {
            $('#creatPortrait_name').addClass('no-input-warning').siblings('.text-danger').removeClass('hide');
            $('#creatPortrait_name').addClass('no-input-warning').siblings('.text-danger.moreLength').addClass('hide');
            flag = false;
        }
        if (getStringLength(name) > 32) {
            $('#creatPortrait_name').addClass('no-input-warning').siblings('.text-danger').addClass('hide');
            $('#creatPortrait_name').addClass('no-input-warning').siblings('.text-danger.moreLength').removeClass('hide');
            flag = false;
        }
        if (!base64 && !url) {
            $('#addUploadImg').siblings('.text-danger').removeClass('hide');
            flag = false;
        }
        if (!idcard) {
            $('#creatPortrait_idcard').addClass('no-input-warning').parent().siblings(".text-danger.tip").removeClass('hide');
            flag = false;
        }
        if (!nation) {
            $('#creatPortrait_nation').addClass('no-input-warning').siblings('.text-danger.tip').removeClass('hide');
            flag = false;
        }

        if ($("#createContainer").attr("type") == 'edit') { //编辑
            var addOnePicInfo = {
                id: $("#cardDetail").find(".side-search-detail").attr("personid"),
                libId,
                labelId: labelId ? labelId : '',
                nation: nation ? nation : '',
                gender: gender ? gender : '',
                idType: idType ? idType : '',
                regaddress: regaddress ? regaddress : '',
                curaddress: curaddress ? curaddress : ''
            }

            if (flag) {
                // 发起新建人员信息请求
                var port = 'v3/opPersonInfo/editPersonInfo',
                    successFunc = function (data) {
                        if (data.code === '200') {
                            containerData.page = '1';
                            containerData.size = '16';
                            // containerData.picStatus = '';  //布控状态初始化
                            // containerData.rowstate = '';
                            // containerData.name = '';
                            // containerData.idcard = '';
                            // $("#AllalarmOptPortrait").addClass("btn-primary").siblings().removeClass("btn-primary");
                            // $("#personSearch").val("");
                            refreshAlarmPageList();
                            getLibData();
                            $("#createContainer").modal("hide");
                        } else {
                            warningTip.say(data.message);
                        }
                    };

                loadData(port, true, addOnePicInfo, successFunc);
            }
        } else {
            var addOnePicInfo = {
                libId,
                labelId: labelId ? labelId : '',
                personList: [{
                    base64: base64 ? base64 : '',
                    url: url ? url : '',
                    name: name ? name : '',
                    idcard: idcard ? idcard : '',
                    nation: nation ? nation : '',
                    gender: gender ? gender : '',
                    idType: idType ? idType : '',
                    regaddress: regaddress ? regaddress : '',
                    curaddress: curaddress ? curaddress : ''
                }]
            }

            if (flag) {
                // 发起新建人员信息请求
                var port = 'v3/opPersonInfo/addPersonInfo',
                    successFunc = function (data) {
                        if (data.code === '200') {
                            containerData.page = '1';
                            containerData.size = '16';
                            // containerData.picStatus = '';  //布控状态初始化
                            // containerData.rowstate = '';
                            // containerData.name = '';
                            // containerData.idcard = '';
                            // $("#AllalarmOptPortrait").addClass("btn-primary").siblings().removeClass("btn-primary");
                            // $("#personSearch").val("");
                            refreshAlarmPageList();
                            getLibData();
                            $("#createContainer").modal("hide");
                        } else {
                            warningTip.say(data.message);
                        }
                    };

                loadData(port, true, addOnePicInfo, successFunc);
            }
        }
    });
    /* 新建人员对象 end */

    /* 删除人员对象 start */
    //列表详情点击删除事件
    $("#cardDetail,#listContainerWrap").on("click", "#portraitOptSC", function () {
        $("#deletePersonModal").modal("show");
    });

    /**
     * 删除人员异常的弹窗处理接口
     */
    $("#deletePersonModal").on("click", ".btn-primary", function () {
        if ($("#showCard").hasClass("btn-primary")) { //列表模式
            var personId = [$("#cardDetail").find(".side-search-detail").attr("personId")];
            var libId = $("#cardDetail").find(".side-search-detail").attr("libId");
        } else if ($("#showList").hasClass("btn-primary")) {
            var personId = [$("#portraitTableList").find(".side-search-detail").attr("personId")];
            var libId = $("#portraitTableList").find(".side-search-detail").attr("libId");
        }
        var port = 'v3/opPersonInfo/delPersonInfo',
            _data = {
                libId: libId,
                personList: personId
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    containerData.page = '1';
                    containerData.size = '16';
                    refreshAlarmPageList();
                    $("#deletePersonModal").modal("hide");
                } else {
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, _data, successFunc);
    });
    /* 删除人员对象 end */

    /* 导入人员start */
    // 点击上传按钮触发input上传弹窗
    // 监听人员库关闭之后事件,需要清除之前的默认选择的数据
    //当前库标签获取
    function getPortraitLabelUpload() {
        var infoPort = 'v3/lib/getLibChildLabels',
            infoData1 = {
                "libId": containerData.libId,
                "type": containerData.type
            },
            infoPortSuccessFunc1 = function (data) {
                if (data.code === '200') {
                    var RX_BKPLAT_Html = '';
                    data.data.forEach(function (item) {
                        RX_BKPLAT_Html += `<option value="${item.labelId}">${item.labelName}</option>`
                    })
                    $("#uploadPortrait_labelId").html(RX_BKPLAT_Html);
                    if (data.data.length > 0) {
                        $('#uploadPortrait_labelId').selectpicker({
                            'noneSelectedText': '请选择标签',
                            'val': []
                        });
                        $('#uploadPortrait_labelId').removeAttr("disabled");
                    } else {
                        $('#uploadPortrait_labelId').selectpicker({
                            'noneSelectedText': '当前库暂无标签'
                        });
                        $('#uploadPortrait_labelId').attr("disabled", "disabled");
                    }
                    $("#uploadPortrait_labelId").selectpicker('refresh');
                } else {
                    $('#uploadPortrait_labelId').selectpicker({
                        'noneSelectedText': '当前库暂无标签'
                    });
                    $('#uploadPortrait_labelId').attr("disabled", "disabled");

                    $("#uploadPortrait_labelId").selectpicker('refresh');
                }
                $("#importLibrary").modal("show");
            };
        loadData(infoPort, true, infoData1, infoPortSuccessFunc1);
    }

    //导入按钮点击事件
    $("#importLibraryBtn").on("click", function () {
        var portraitTreeId = $("#portrait-tree-list").find("li.active").attr("id");
        $("#uploadPortrait_libName").val($("#" + portraitTreeId + "_a").attr("nodeName"));
        getPortraitLabelUpload();
    });

    $('#importLibrary').on('hide.bs.modal', function () {
        $('#importLibrary').data('upload', false);
        $("#uploadeRadio").find(".ui-checkboxradio-label").eq(0).click();
        $('#uploadResult').fadeOut(300);
        $('#uploadResultThree').fadeOut(300);
        $('#uploadWarning').addClass('hide');
        $('#uploadFileZip')[0].value = '';
        $('#uploadFileZipThree')[0].value = '';
    });

    // 判断是否上传了文件,并且对上传的文件进行格式的验证 zip或excel
    $('#uploadFileZip').on('change', function () {
        var fileType = '',
            fileNameArr = this.value.split('\\'), // 文件名路径数组
            fileSize = this.files[0].size,
            fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
            fileNameTypeArr = fileName.split('.'),
            fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase();
        if ($('#uploadeRadio').find('.ui-checkboxradio-checked').siblings('input').val() == 4) { //excel格式
            if (fileType !== 'xls' && fileType !== 'xlsx') {
                $('#uploadWarning').removeClass('hide').text('上传文件格式不正确,只能上传xls或xlsx格式');
                this.value = '';
                $('#uploadResult').fadeOut(300);
                return;
            }
        } else {
            if (fileType !== 'zip') {
                $('#uploadWarning').removeClass('hide').text('上传文件格式不正确,只能上传zip格式');
                this.value = '';
                $('#uploadResult').fadeOut(300);
                return;
            }
        }

        // 判断文件大小是否超过100M 
        if (fileSize > 100 * 1024 * 1024) {
            $('#uploadWarning').removeClass('hide').text('上传文件过大,请上传不大于100M的文件');
            this.value = '';
            return;
        }

        // 将文件名字写出
        $('#uploadResult').fadeIn(300);
        $('#uploadResult').find('.result-name').text(fileName);
    });

    // 判断是否上传了文件,并且对上传的文件进行格式的验证 excel
    $('#uploadFileZipThree').on('change', function () {
        var fileType = '',
            fileNameArr = this.value.split('\\'), // 文件名路径数组
            fileSize = this.files[0].size,
            fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
            fileNameTypeArr = fileName.split('.'),
            fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase();
        if (fileType !== 'xls' && fileType !== 'xlsx') {
            $('#uploadWarning').removeClass('hide').text('上传文件格式不正确,只能上传xls或xlsx格式');
            this.value = '';
            $('#uploadResultThree').fadeOut(300);
            return;
        }

        // 判断文件大小是否超过100M 
        if (fileSize > 100 * 1024 * 1024) {
            $('#uploadWarning').removeClass('hide').text('上传文件过大,请上传不大于100M的文件');
            this.value = '';
            $('#uploadResultThree').fadeOut(300);
            return;
        }

        // 将文件名字写出
        $('#uploadResultThree').fadeIn(300);
        $('#uploadResultThree').find('.result-name').text(fileName);
        //$('#uploadResultInfo').find('.result-name').text(fileName);
        //$('#importLibrary').data('upload', true);
    });

    $('#uploadFileBtn').on('click', function () {
        $('#uploadFileZip').click();
        $('#uploadWarning').addClass('hide');
    });

    // $('#uploadFileBtnTwo').on('click', function () {
    //     $('#uploadFileZipTwo').click();
    //     $('#uploadWarning').addClass('hide');
    // });

    $('#uploadFileBtnThree').on('click', function () {
        $('#uploadFileZipThree').click();
        $('#uploadWarning').addClass('hide');
    });

    // 点击旁边文件删除按钮事件绑定
    $('#uploadResult').find('i').on('click', function () {
        $('#uploadResult').fadeOut(300);
        $('#importLibrary').data('upload', false);
        $('#uploadFileZip')[0].value = '';
    });

    // 点击旁边文件删除按钮事件绑定
    // $('#uploadResultTwo').find('i').on('click', function () {
    //     $('#uploadResultTwo').fadeOut(300);
    //     $('#importLibrary').data('upload', false);
    //     $('#uploadFileZipTwo')[0].value = '';
    // });

    // 点击旁边文件删除按钮事件绑定
    $('#uploadResultThree').find('i').on('click', function () {
        $('#uploadResultThree').fadeOut(300);
        $('#importLibrary').data('upload', false);
        $('#uploadFileZipThree')[0].value = '';
    });

    //导入取消事件
    $('#cancelUpload').click(function () {
        $('#uploadWarning').addClass('hide');
    });

    //导入框选项改变事件
    $('#uploadeRadio').on('change', function () {
        $('#uploadWarning').addClass('hide');
        if ($('#uploadeRadio').find('.ui-checkboxradio-checked').siblings('input').val() == 5) { //zip和excel
            $("#exportUploadImg").addClass("exportUploadImgTwo"); //添加class更改布局
            $("#exportUploadImg .uploadTwo").removeClass("hide"); //两个上传都显示
            $("#exportUploadImg .uploadOne").removeClass("hide");

            if ($('#uploadFileZip').val() != '') { //zip内容不为空
                $('#uploadResult').fadeIn(300); //显示zip结果
                var fileType = '',
                    fileNameArr = $('#uploadFileZip').val().split('\\'), // 文件名路径数组
                    fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
                    fileNameTypeArr = fileName.split('.'),
                    fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase();

                if (fileType !== 'zip') { //如果格式不是zip,提示格式失败
                    $('#uploadWarning').removeClass('hide').text('上传文件格式不正确,只能上传zip格式');
                    $('#importLibrary').data('upload', false);
                    return;
                } else {
                    $('#uploadWarning').addClass('hide');
                }
            }
            if ($('#uploadFileZipThree').val() != '') { //excel格式上传
                $('#uploadResultThree').fadeIn(300);
                var fileTypeThree = '',
                    fileNameArrThree = $('#uploadFileZipThree').val().split('\\'), // 文件名路径数组
                    fileNameThree = fileNameArrThree[fileNameArrThree.length - 1], // 获取文件名字
                    fileNameTypeArrThree = fileNameThree.split('.'),
                    fileTypeThree = fileNameTypeArrThree[fileNameTypeArrThree.length - 1].toLowerCase();

                if (fileTypeThree !== 'xls' && fileTypeThree !== 'xlsx') {
                    $('#uploadWarning').removeClass('hide').text('上传文件格式不正确,只能上传xls或xlsx格式');
                    return;
                } else {
                    $('#uploadWarning').addClass('hide');
                }
            }
        } else if ($('#uploadeRadio').find('.ui-checkboxradio-checked').siblings('input').val() == 4) { //excel格式
            $("#exportUploadImg").removeClass("exportUploadImgTwo"); //去掉两列格式class
            $("#exportUploadImg .uploadTwo").removeClass("hide");
            $("#exportUploadImg .uploadOne").addClass("hide");
            $("#uploadResult").fadeOut(300); //显示excel结果，隐藏zip结果

            if ($('#uploadFileZipThree').val() != '') { //如果excel结果为空
                $('#uploadResultThree').fadeIn(300);

                var fileType = '',
                    fileNameArr = $('#uploadFileZipThree').val().split('\\'), // 文件名路径数组
                    fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
                    fileNameTypeArr = fileName.split('.'),
                    fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase();

                if (fileType !== 'xls' && fileType !== 'xlsx') {
                    $('#uploadWarning').removeClass('hide').text('上传文件格式不正确,只能上传xls或xlsx格式');
                    return;
                } else {
                    $('#uploadWarning').addClass('hide');
                }
                $('#importLibrary').data('upload', true);
            }
        } else {
            $("#exportUploadImg").removeClass("exportUploadImgTwo"); //去掉两列格式class
            $("#exportUploadImg .uploadTwo").addClass("hide");
            $("#exportUploadImg .uploadOne").removeClass("hide");

            $("#uploadResultThree").fadeOut(300);

            if ($('#uploadFileZip').val() != '') {
                $('#uploadResult').fadeIn(300);

                var fileType = '',
                    fileNameArr = $('#uploadFileZip').val().split('\\'), // 文件名路径数组
                    fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
                    fileNameTypeArr = fileName.split('.'),
                    fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase();
                if (fileType !== 'zip') {
                    $('#uploadWarning').removeClass('hide').text('上传文件格式不正确,只能上传zip格式');
                    $('#importLibrary').data('upload', false);
                    return;
                } else {
                    $('#uploadWarning').addClass('hide');
                }
                $('#importLibrary').data('upload', true);
            }
        }
    });

    // 绑定导入弹窗提交按钮
    $('#uploadSubmit').on('click', function () {
        if (!$("#uploadWarning").hasClass("hide")) {
            return;
        } else {
            if ($('#uploadeRadio').find('.ui-checkboxradio-checked').siblings('input').val() == 5) { //zip和excel
                if ($("#uploadFileZip").val() == "" || $("#uploadFileZipThree").val() == "") {
                    warningTip.say("请上传zip和excel文件");
                    return;
                }
            } else if ($('#uploadeRadio').find('.ui-checkboxradio-checked').siblings('input').val() == 4) { //excel
                if ($("#uploadFileZipThree").val() == "") {
                    warningTip.say("请上传excel文件");
                    return;
                }
            } else { //zip
                if ($("#uploadFileZip").val() == "") {
                    warningTip.say("请上传zip文件");
                    return;
                }
            }
        }
        if ($('#uploadeRadio').find('.ui-checkboxradio-checked').siblings('input').val() == 5) {
            // 进行文件的上传
            var formFileData = new FormData($('#formFile')[0]),
                uploadFormData = new FormData(),
                xhr = new XMLHttpRequest(),
                libId = containerData.libId,
                labelId = $("#uploadPortrait_labelId").val() ? $("#uploadPortrait_labelId").val() : '',
                token = $.cookie('xh_token'),
                zipFile = formFileData.get('zipFile'),
                excelFile = formFileData.get('excelFile'),
                submitURL = '/v3/opPersonInfo/uploadPicsFile',
                type = $('#uploadeRadio').find('.ui-checkboxradio-checked').siblings('input').val();
            xhr.open('post', serviceUrl + submitURL);
            uploadFormData.append('token', token);
            uploadFormData.append('libId', libId);
            uploadFormData.append('labelId', labelId);
            uploadFormData.append('type', type);
            uploadFormData.append('excelFile', excelFile);
            uploadFormData.append('zipFile', zipFile);
            xhr.setRequestHeader('token', token);
            xhr.send(uploadFormData);
        } else {
            // 进行文件的上传
            var formFileData = new FormData($('#formFile')[0]),
                uploadFormData = new FormData(),
                xhr = new XMLHttpRequest(),
                libId = containerData.libId,
                labelId = $("#uploadPortrait_labelId").val() ? $("#uploadPortrait_labelId").val() : '',
                token = $.cookie('xh_token'),
                zipFile = formFileData.get('zipFile'),
                excelFile = formFileData.get('excelFile'),
                submitURL = '/v3/opPersonInfo/uploadPicsFile',
                type = $('#uploadeRadio').find('.ui-checkboxradio-checked').siblings('input').val();
            xhr.open('post', serviceUrl + submitURL);
            uploadFormData.append('token', token);
            uploadFormData.append('libId', libId);
            uploadFormData.append('labelId', labelId);
            uploadFormData.append('type', type);
            if ($('#uploadeRadio').find('.ui-checkboxradio-checked').siblings('input').val() == 4) {
                uploadFormData.append('excelFile', excelFile);
            } else {
                uploadFormData.append('zipFile', zipFile);
            }

            xhr.setRequestHeader('token', token);
            xhr.send(uploadFormData);
        }

        xhr.onload = function (res) {
            var response = JSON.parse(res.currentTarget.response);
            if (response.code === '200') {
                $('#uploadFileZip')[0].value = '';
                $('#uploadFileZipThree')[0].value = '';
                $('#importLibrary').modal("hide");
                $('#importLibraryInfo').modal('show');

                //$('#uploadResultInfo').find('.aui-spin').removeClass('hide');
                $('#uploadResultInfo').find('.aui-icon-approval').addClass('hide');
                $('#uploadResultInfo').find('.aui-icon-warning').addClass('hide');
                //$('#uploadResultInfo').find('.aui-row').addClass('hide');
                $('#importLibraryInfo').find('.aui-row .num').text('0');
                $('#uploadResultInfo').find('.aui-spin').removeClass('hide');
                var resultTimer = window.setInterval(function () {
                    window.loadData('/v2/memberInfos/getUploadResult', true, {
                        guid: response.guid
                    }, function (data) {
                        if (data.code == '200') {
                            var data = data.data;
                            if (data.sucNum === data.picNum) {
                                $('#uploadResultInfo').find('.aui-icon-approval').removeClass('hide');
                            } else {
                                $('#uploadResultInfo').find('.aui-icon-warning').removeClass('hide');
                            }
                            var $row = $('#importLibraryInfo').find('.aui-row').children(),
                                keyNum = 0;

                            $row.eq(0).find('.num').text(data.picNum); //上传文件总数
                            $row.eq(1).find('.num').text(data.mergeNum); //合并总数
                            $row.eq(2).find('.num').text(data.sucNum); //上传成功数量
                            $row.eq(3).find('.num').text(data.errorNum); //上传未知异常数量
                            $row.eq(4).find('.num').text(data.formatNum); //图片格式异常数量
                            $row.eq(5).find('.num').text(data.sizeNum); //图片大于5M数量
                            $row.eq(6).find('.num').text(data.nameNum); //命名不规则总数
                            $row.eq(7).find('.num').text(data.idcardNum); //身份证异常数量
                            //$('#importLibraryInfo').find('.aui-row').removeClass('hide');

                            if (data.finish) {
                                $('#uploadResultInfo').find('.aui-spin').addClass('hide');
                                window.clearInterval(resultTimer);
                            }
                        }
                    });
                }, 2000)

                var stopResultTimer = window.setInterval(function () {
                    window.clearInterval(resultTimer);
                    window.clearInterval(stopResultTimer);
                    $('#uploadResultInfo').find('.aui-spin').addClass('hide');
                }, 60000);
                // $("#importLibraryInfo").on("click", ".modal-footer button", function () {
                //     window.clearInterval(resultTimer);
                // });

                $('#importLibraryInfo').on('hide.bs.modal', function () {
                    window.clearInterval(resultTimer);
                    containerData.page = '1';
                    containerData.size = '16';
                    refreshAlarmPageList();
                    getLibData();
                });
            } else {
                warningTip.say(response.message);
            }
        }
    });
    /* 导入人员end */

    //树节点关注对象和布控对象右键事件
    $("#portrait-tree-list").on("mousedown", "li", function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#rightMousePortraitTree').off().remove();
        if (e.which == 3) {
            var that = $(this),
                libId = $(this).attr("libId");
            $("#portrait-tree-list").find("li").removeClass("rightMenu");
            if (that.find(".portrait-tree-type").length == 0 || that.find(".portrait-tree-type").attr("isBk") == 'false' || that.find(".portrait-tree-type").attr("isDistAll") == 'false') {
                return;
            }
            if (that.find(".portrait-tree-type").attr("title") == '未布控' && that.find(".portrait-tree-type").attr("isDistAll") == 'true') {
                var $menu = $([
                    '<ul class="mask-camera-list" id="rightMousePortraitTree">',
                    '   <li class="mask-camera-item" type="0">整库布控</li>',
                    '</ul>',
                ].join(''));
            } else if (that.find(".portrait-tree-type").attr("title") == '全库布控' && that.find(".portrait-tree-type").attr("isDistAll") == 'true') {
                var $menu = $([
                    '<ul class="mask-camera-list" id="rightMousePortraitTree">',
                    '   <li class="mask-camera-item" type="1">整库撤控</li>',
                    '</ul>',
                ].join(''));
            }
            var menuLen = $('#rightMousePortraitTree').length;
            if (menuLen > 0) {
                $('#rightMousePortraitTree').off().remove();
            }
            $('body').append($menu);

            if (!$menu) {
                return;
            }
            that.addClass("rightMenu");
            // 给右键菜单添加绑定事件
            $menu.find('.mask-camera-item').off('click').on('click', function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                if ($(this).hasClass("disabled")) {
                    return;
                }
                $("#rightMousePortraitTree").addClass('hide');
                var menuIndex = $(this).attr("type");
                if (menuIndex == '0') { // 整库布控
                    var choseId = that.attr("id");
                    $('.portraitCard-new-popup').data("infoName", $("#" + choseId + "_a").attr("nodeName"));
                    $('.portraitCard-new-popup').data("libId", libId);
                    var url = "./facePlatform/portraitCard-new.html?dynamic=" + Global.dynamic;
                    loadPage($('.portraitCard-new-popup'), url);
                    $('.portraitCard-new-popup').removeClass('hide');
                } else if (menuIndex == '1') { // 整库撤控
                    $("#portraitCard_stop").val("");
                    $("#portraitCard_stop").parent().find(".wordNum.warning-item-text").addClass("hide");
                    $("#portraitCard_stop").parent().find(".text-danger.tip").addClass("hide");
                    $("#portraitCardEndModal").data("type", "1"); //整库撤控和按人撤控区分1.整库2.按人
                    $("#portraitCardEndModal").data("libId", libId); //整库撤控和按人撤控区分1.整库2.按人
                    $("#portraitCardEndModal").modal("show");
                }
            });
            var menuWidth = $('#rightMousePortraitTree').outerWidth(),
                menuHeight = $('#rightMousePortraitTree').outerHeight(),
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
            // 绑定全局点击右键菜单消失代码
            $(document).off('click.rightMousePortraitTree').on('click.rightMousePortraitTree', function () {
                $('#rightMousePortraitTree').addClass('hide');
                that.removeClass("rightMenu");
            });
            // 给生成的菜单栏里面进行事件阻止
            $('#rightMousePortraitTree')[0].addEventListener('contextmenu', function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
            });
        }
    });


    /*******************************动态库内容*****************************/
    //获取抓拍列表
    function getPortraitThree(first) {
        $("#portraitContentOne").addClass("hide");
        $("#portraitContentTwo").addClass("hide");
        $("#portraitContentThree").removeClass("hide");
        $("#portraitEmptyContainerAll").addClass("hide");
        showLoading($("#portraitContentThree").find("ul.image-card-list-wrap"));
        var port = 'v2/faceDt/peopleSearch',
            data = {
                startTime: dataThree.startTime,
                endTime: dataThree.endTime,
                orgIds: [dataThree.orgId],
                threshold: "90",
                page: dataThree.page ? dataThree.page : 1,
                size: dataThree.size ? dataThree.size : 40,
                searchType: '0',
                sort: 2
            },
            successFunc = function (data) {
                hideLoading($("#portraitContentThree").find("ul.image-card-list-wrap"));
                if (data.code === '200') {
                    $("#portraitContentThreeImg").removeClass("hide");
                    $("#portraitEmptyContainerThree").addClass("hide");

                    var result = data.data,
                        list = result.list,
                        html = '';
                    if (list.length == 0) {
                        $("#portraitContentThree").addClass("hide");
                        $("#portraitEmptyContainerAll").removeClass("hide");

                        loadEmpty($('#portraitEmptyContainerAll'), '暂无数据', '');
                        return;
                    } else {
                        $("#portraitContentThree").removeClass("hide");
                        $("#portraitEmptyContainerAll").addClass("hide");
                    }
                    for (var i = 0; i < list.length; i++) {
                        var score = Number(list[i].similarity.split('%')[0]),
                            isDisplay = score < 0 ? 'hide' : '';
                        html += `<li class="image-card-wrap type-5 onecj" cameraId="${list[i].cameraId}" px="${list[i].px}" py="${list[i].py}">
                                                        <div class="image-card-box img-right-event" style="width: 35%;">
                                                            <img class="image-card-img" guid="${list[i].picId}" src="${list[i].smallPicUrl}" position="position" alt="">
                                                        </div>
                                                        <div class="image-card-message-box" style="width: 34%;">
                                                            <p class="image-card-message-position ${isDisplay}"></p>
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
                    }
                    if ($("#portraitContentThree").find('.pagination-wrap').length == 0) {
                        var paginationHtml = `<div class="pagination-wrap">
                                                                <ul class="pagination" id=portraitThreePagination></ul>
                                                            </div>`
                        $("#portraitContentThree").append(paginationHtml);
                    }
                    //$("#portraitContentThree").find('.image-card-list-wrap').data("listData", list);
                    $("#portraitContentThree").find('.image-card-list-wrap').html(html);
                    $("#portraitContentThree").find('.image-card-wrap').each(function (index, element) {
                        $(element).data('listData', list[index]); // 图片绑定的动态检索详细数据 用于获取大图
                    });

                    if ($("#showListportraitThree").hasClass("btn-primary")) {
                        $("#showListportraitThree").click();
                    } else {
                        $("#showCardportraitThree").click();
                    }

                    //分页
                    var $paginationTime = $('#portraitThreePagination');
                    if (result.totalPage == '0' || result.totalPage == '1') {
                        $paginationTime.closest('.pagination-wrap').remove();
                    }
                    if (first && result.total > Number(dataThree.size)) {
                        var eventCallBack = function (currPage, pageSize) {
                            dataThree.page = currPage;
                            dataThree.size = pageSize;
                            getPortraitThree();
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
                        $('#portraitContentThree').closest('.pagination-wrap').removeClass('display-none').find('.pagination-result-number').text(result.total);
                    }
                } else {
                    $("#portraitContentThreeImg").addClass("hide");
                    $("#portraitEmptyContainerThree").removeClass("hide");

                    loadEmpty($('#portraitEmptyContainerThree'), '暂无动态库数据', ' ');
                }
            };
        loadData(port, true, data, successFunc);
    };

    $("#searchPortraitThree").on("click", function () {
        dataThree.startTime = $("#startTimePortrait").val();
        dataThree.endTime = $("#endTimePortrait").val();
        dataThree.page = 1;
        dataThree.size = 40;
        getPortraitThree(true);
    });

    // 动态点击展开大图
    $('#portraitContentThree').on('click', '.image-card-list-wrap .image-card-box', function (e) {
        var $this = $(this), // 图片
            $showBigImgDom = $this.closest('.image-card-list-wrap'), // 当前检索类型的容器
            showBigImgId = $showBigImgDom.attr('id'), // 各检索类型容器id
            thisIndex = $this.closest('.image-card-wrap').index(); // 图片索引
        //$("#searchPortraitThree")随便给的一个容器
        createBigImgMask($showBigImgDom, showBigImgId, thisIndex, $("#searchPortraitThree"), e); // 动态 非聚合 展开大图
    });

    // 动态库 hover 显示中图
    $('#portraitContentThree').on('mouseover', '.image-card-list-wrap .image-card-wrap', function () {
        var $this = $(this),
            thisCls = $this.hasClass('disabled'),
            thisData = $this.data('listData'),
            imgSrc = $this.find('.image-card-img').attr('src'),
            top = $this.offset().top - 2,
            html = `<div class="card-img-hover">
                        <img src="${imgSrc}" alt="">
                    </div>`;
        if (thisData.base64Img) {
            html = `<div class="card-img-hover">
                        <img src="${thisData.base64Img}" alt="">
                    </div>`;
        }
        // 判定当前节点是否有禁用样式
        if (thisCls) {
            return;
        }
        cardImgHoverTimer = window.setTimeout(function () {
            $this.closest('#portraitContentThree').append(html);
            var docH = document.documentElement.clientHeight,
                //$imgHover = $this.siblings('.card-img-hover'),
                $imgHover = $('#portraitContentThree').find('.card-img-hover'),
                hoverImgH = $imgHover.outerHeight(),
                left = $this.offset().left - $(".card-img-hover").outerWidth() - 4;
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
    });

    $('#portraitContentThree').on('mouseout', '.image-card-list-wrap .image-card-wrap', function () {
        $(this).closest('#portraitContentThree').find('.card-img-hover').remove();
        window.clearTimeout(cardImgHoverTimer);
    });

    //动态库图文切换图表
    $("#portraitContentThree").on("click", "#showCardportraitThree", function () { //小图
        $("#portraitContentThree").find("li.image-card-wrap").css({
            width: 'calc(12.5% - .625rem)'
        });
        $("#portraitContentThree").find("li.image-card-wrap>.image-card-box").css({
            width: '100%'
        });
        $("#portraitContentThree").find("li.image-card-wrap>.image-card-message-box").css({
            width: 'auto'
        });
        $("#portraitContentThree").find("li.image-card-wrap>.image-card-info").addClass("hide");
        $(this).addClass("btn-primary").siblings().removeClass("btn-primary");
    }).on("click", "#showListportraitThree", function () {
        $("#portraitContentThree").find("li.image-card-wrap").css({
            width: 'calc(25% - .625rem)'
        });
        $("#portraitContentThree").find("li.image-card-wrap>.image-card-box").css({
            width: '35%'
        });
        $("#portraitContentThree").find("li.image-card-wrap>.image-card-message-box").css({
            width: '34%'
        });
        $("#portraitContentThree").find("li.image-card-wrap>.image-card-info").removeClass("hide");
        $(this).addClass("btn-primary").siblings().removeClass("btn-primary");
    });

    // 获取用户操作按钮权限新建人员  导入  编辑  删除  新建库 删除库
    function initUserOperateBtn() {
        var port = 'v2/user/getUserOperateAuthorty',
            data = {
                moduleCode: $('#content-box').data().modulecode
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    var operateCodes = data.data;
                    // 如果用户拥有按钮操作权限，给body挂上属性
                    if (operateCodes && operateCodes.length > 0) {
                        // 循环操作按钮权限,显示隐藏操作按钮
                        operateCodes.forEach(function (val, index) {
                            switch (val.operateCode) {
                                case '115': // 新建人员
                                    $('#createImportBut').append(`<button type="button" class="btn btn-primary btn-sm" id="createCard">新建</button>`);
                                    break;

                                case '232': // 导入
                                    $('#createImportBut').append('<button type="button" class="btn btn-sm" id="importLibraryBtn" data-toggle="modal" data-target="#importLibrary">导入</button>');
                                    break;
                            }
                        })
                        $('body').data('operateCodes', operateCodes);
                    }
                } else {
                    loadEmpty($('.flex-container'), '用户操作按钮权限申请异常', '系统异常');
                }
            };
        loadData(port, true, data, successFunc, '', 'GET');
    }
    //搜索详情展开  目前不要
    // function portraitSlide(detailContainerID, portraitListID, perPortraitLength, insertPosition) {
    //     //每行显示人像卡片个数
    //     var perPortraitLength = perPortraitLength;
    //     //初始激活的行数
    //     var initPerIndex;
    //     var imageItem = $("#" + portraitListID).find(".image-card-item");
    //     var tempHtml = '';
    //     for (var i = 0; i < imageItem.length; i++) {
    //         tempHtml += '<div class="swiper-slide" attr-index="index-' + parseInt(i + 1) + '">' + '</div>'
    //     }
    //     //$(tempHtml).appendTo($("#" + detailContainerID + " .swiper-wrapper"));
    //     $("#" + detailContainerID + " .swiper-wrapper").html(tempHtml);
    //     // 轮播ID
    //     var swiperID = "#" + detailContainerID;
    //     //详情插入的位置
    //     var insertPosition = insertPosition;
    //     var mySwiper = new Swiper(swiperID, {
    //         nextButton: '.swiper-button-next',
    //         prevButton: '.swiper-button-prev',
    //         speed: 500,
    //         simulateTouch: false,
    //         observer: true,
    //         observeParents: false,
    //         onSlideChangeStart: function (swiper) {
    //             imageItem.eq(swiper.activeIndex).addClass("active").siblings(".image-card-item").removeClass('active');
    //             initPerIndex = Math.ceil((swiper.activeIndex + 1) / perPortraitLength);
    //             oldRowIndex = newRowIndex;
    //             newRowIndex = initPerIndex
    //             if (newRowIndex !== oldRowIndex) {
    //                 $("#" + detailContainerID).slideUp(0);
    //                 if (imageItem.length > perPortraitLength * initPerIndex) {
    //                     imageItem.eq(perPortraitLength * initPerIndex).before($("#" + detailContainerID));
    //                 } else {
    //                     imageItem.eq(imageItem.length - 1).after($("#" + detailContainerID));
    //                 }
    //                 imageItem.eq(perPortraitLength * initPerIndex).before($("#" + detailContainerID));
    //                 $("#" + detailContainerID).css({ marginTop: "1.25rem" }).slideDown(300);
    //             }
    //         }
    //     });
    //     var oldRowIndex = 0,
    //         newRowIndex = 0;
    //     imageItem.each(function (index) {
    //         $(this).on('click', function () {
    //             var _this = this,
    //                 oldIndex = 0,
    //                 newIndex = 0,
    //                 oldIndex = newIndex;
    //             newIndex = parseInt($(_this).index() + 1);
    //             oldRowIndex = newRowIndex;
    //             newRowIndex = initPerIndex = Math.ceil(($(this).index() + 1) / perPortraitLength);
    //             if (newIndex === oldIndex) return;
    //             $('.image-card-list').not("#" + portraitListID).find('.image-card-item').removeClass('active');
    //             $(".swiper-container").not(swiperID).css({ marginTop: 0, height: 'auto' }).slideUp(300);
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
    //                     if (imageItem.length > perPortraitLength * initPerIndex) {
    //                         imageItem.eq(perPortraitLength * initPerIndex).before($("#" + detailContainerID));
    //                     } else {
    //                         imageItem.eq(imageItem.length - 1).after($("#" + detailContainerID));
    //                     }
    //                     imageItem.eq(perPortraitLength * initPerIndex).before($("#" + detailContainerID));
    //                 }
    //             }
    //             $("#" + detailContainerID)
    //                 .css({ marginTop: "1.25rem" })
    //                 .slideDown(300, function () {
    //                     mySwiper.slideTo($(_this).index(), 200, false);
    //                 });
    //             $(this).addClass("active").siblings(".image-card-item").removeClass('active');

    //         })
    //     })
    // }

    /**
     * 切换过滤条件下拉列表，更新人员库数据
     */
    // $(document).on("click", ".dropdown-item", function () {
    //     var $this = $(this),
    //         $selectMenuContainer = $this.closest('.dropdown-menu');
    //     if ($selectMenuContainer.attr('aria-labelledby') === 'ageSearch') { // 年龄过滤
    //         if ($this.text() !== '自定义年龄') {
    //             containerData.ages = $(this).attr('value') !== '不限年龄' ? $(this).attr('value') : '';
    //             $('#portraitContainer').data('ages', $(this).attr('value'));
    //             refreshAlarmPageList();
    //         } else {
    //             $("#ageModal").modal('show');
    //         }
    //     } else if ($selectMenuContainer.attr('aria-labelledby') === 'sexSearch') { // 性别过滤
    //         var sex = $(this).attr('value') !== '不限' ? $(this).attr('value') : '';
    //         containerData.sex = sex;
    //         $('#portraitContainer').data('sex', sex);

    //         refreshAlarmPageList();
    //     } else if ($selectMenuContainer.attr('aria-labelledby') === 'timeSearch') { // 采集时间过滤
    //         var date = $(this).attr('data-date') ? $(this).attr('data-date') : '';
    //         if ($this.attr('data-date')) {
    //             containerData.createtime_start = $this.attr('data-date') !== '不限时间' ? $('#timeModalDatepicker').find('.datepicker-input').eq(0).val() : '';
    //             containerData.createtime_end = $this.attr('data-date') !== '不限时间' ? $('#timeModalDatepicker').find('.datepicker-input').eq(1).val() : '';
    //             $('#portraitContainer').data('createtime_start', containerData.createtime_start);
    //             $('#portraitContainer').data('createtime_end', containerData.createtime_end);
    //             initDatePicker1($('#timeModalDatepicker'), date, true, true);
    //             refreshAlarmPageList();
    //         } else {
    //             initDatePicker1($('#timeModalDatepicker'), '-30', true, true);
    //             $("#timeModal").modal('show');
    //         }
    //     }
    // });

    /**
     * 年龄过滤自定义弹窗确认事件
     */
    // $("#ageModal").on("click", "#ageModalSure", function () {
    //     var $startAge = $('#ageStart'),
    //         $endAge = $('#ageEnd'),
    //         ages = '';
    //     if ($startAge.length > 0) {
    //         var startAge = $startAge.val(),
    //             endAge = $endAge.val();
    //         ages = startAge + '-' + endAge;
    //         if (startAge === '' && endAge === '') {
    //             ages = '';
    //         }
    //     }
    //     containerData.ages = ages;
    //     $('#portraitContainer').data('ages', ages);
    //     refreshAlarmPageList();

    //     $("#ageSearch").text(ages);
    //     $("#ageModal").modal('hide');
    //     $('#ageStart').val('');
    //     $('#ageEnd').val('');
    // });

    /**
     * 采集时间过滤自定义弹窗确认事件
     */
    // $("#timeModal").on("click", "#timeModalSure", function () {
    //     containerData.createtime_start = $('#timeModalDatepicker').find('.datepicker-input').eq(0).val();
    //     containerData.createtime_end = $('#timeModalDatepicker').find('.datepicker-input').eq(1).val();
    //     $('#portraitContainer').data('createtime_start', $('#timeModalDatepicker').find('.datepicker-input').eq(0).val());
    //     $('#portraitContainer').data('createtime_end', $('#timeModalDatepicker').find('.datepicker-input').eq(1).val());

    //     refreshAlarmPageList();

    //     $("#timeSearch").text($('#timeModalDatepicker').find('.datepicker-input').eq(0).val() + '~' + $('#timeModalDatepicker').find('.datepicker-input').eq(1).val());
    //     $("#timeModal").modal('hide');
    // });

    /**搜索结果树加载
     * 
     * @param {*} data 传入的数据
     */
    // function loadSearchTree(data) {
    //     var zSetting = {
    //         view: {
    //             selectedMulti: false,
    //             addDiyDom: function (treeId, treeNode) {
    //                 //树列表的icon和布控状态展示
    //                 if (treeNode.level == 0 && treeNode.children) {
    //                     $("#" + treeNode.tId + "_a").addClass("treeLevelTitle");
    //                 } else {
    //                     $('#' + treeNode.tId).attr("libId", treeNode.libId);
    //                     $("#" + treeNode.tId).find(".node_name").parent().append(`<span class="portrait-tree-num">(${treeNode.num})</span>`);
    //                     if (treeNode.type) {
    //                         if (treeNode.type == '1') {  //布控中
    //                             $("#" + treeNode.tId).find(".node_name").parent().append(`<span class="portrait-tree-type" title="未布控" isBk=${treeNode.isBk == "1" ? true : false} isDistAll=${treeNode.isDistAll == "1" ? true : false}><i class="aui-icon-police-badge portrait-tree-type1"></i></span>`);
    //                         } else if (treeNode.type == '2') {  //部分布控
    //                             $("#" + treeNode.tId).find(".node_name").parent().append(`<span class="portrait-tree-type" title="部分布控" isBk=${treeNode.isBk == "1" ? true : false} isDistAll=${treeNode.isDistAll == "1" ? true : false}><i class="aui-icon-police-badge portrait-tree-type2"></i></span>`);
    //                         } else {  //全库布控
    //                             $("#" + treeNode.tId).find(".node_name").parent().append(`<span class="portrait-tree-type" title="全库布控" isBk=${treeNode.isBk == "1" ? true : false} isDistAll=${treeNode.isDistAll == "1" ? true : false}><i class="aui-icon-police-badge portrait-tree-type3"></i></span>`);
    //                         }
    //                     }
    //                 }

    //                 var aObj = $('#' + treeNode.tId + '_a');
    //                 if ($('#diyBtn_' + treeNode.id).length > 0) return;
    //                 var pObj = $('#' + treeNode.tId);
    //                 pObj.off('click').on('click', function (e) {
    //                     var $parent = $(this).parent()[0].id;
    //                     if (!e.isTrigger && $parent !== treeId) {
    //                         e.stopPropagation();
    //                         aObj.click();
    //                     }
    //                     if (!e.isTrigger && $parent === treeId) {
    //                         $(this).children('span').click();
    //                     }
    //                 })
    //             }
    //         },
    //         callback: {
    //             onClick: function (event, treeId, treeNode) {
    //                 // 树点击事件
    //                 event.stopPropagation();
    //                 event.preventDefault();
    //                 if (!treeNode.children) {
    //                     //判断当前节点有没有libId
    //                     if (!treeNode.libId) {
    //                         $("#portraitContainer").css("display", "none");
    //                         $('#portraitEmptyContainerAll').show();
    //                         loadEmpty($('#portraitEmptyContainerAll'), '暂无人员信息', '数据为空，请选择其他人员库');
    //                         return;
    //                     } else {
    //                         $("#portraitContainer").css("display", "block");
    //                         $('#portraitEmptyContainerAll').hide();
    //                     }
    //                     containerData.libId = treeNode.libId;
    //                     //新建和导入按钮还有布控状态筛选隐藏
    //                     if (treeNode.parentType == '1' || treeNode.parentType == '2') {
    //                         $("#AlarmOptPortrait").addClass("hide");  //布控状态按钮
    //                         $("#portraitCancel").addClass("hide");  //撤控
    //                         $("#portraitCancelCheck").addClass("hide");  //撤控全选

    //                         if (treeNode.isEdit == '1') {  //当前登录人可编辑
    //                             $('#createCard').removeClass('display-none');  //新建
    //                             $('#importLibraryBtn').removeClass('display-none');  //导入
    //                         } else {
    //                             $('#createCard').addClass('display-none');  //新建
    //                             $('#importLibraryBtn').addClass('display-none');  //导入
    //                         }
    //                         if (treeNode.parentType == '2') {
    //                             $("#AlarmOptPortrait").removeClass("hide");
    //                         }
    //                     } else {
    //                         $('#createCard').addClass('display-none');
    //                         $('#importLibraryBtn').addClass('display-none');
    //                         $("#AlarmOptPortrait").addClass("hide");
    //                         $("#portraitCancel").addClass("hide");
    //                         $("#portraitCancelCheck").addClass("hide");
    //                         if (treeNode.parentType == '4') {  //布控库有撤控按钮 
    //                             if (treeNode.isBk == '1') {  //可撤控
    //                                 $("#portraitCancel").removeClass("hide");
    //                                 $("#portraitCancelCheck").removeClass("hide");
    //                             } else {
    //                                 $("#portraitCancel").addClass("hide");
    //                                 $("#portraitCancelCheck").addClass("hide");
    //                             }
    //                         }
    //                     }
    //                     var aObj = $('#' + treeNode.tId); // 选中的人员库li节点
    //                     var pObj = $('#' + treeNode.parentTId);
    //                     $('#portraitContainer').find('.portrait-name').text(treeNode.name);
    //                     // treeNode.level == '1' ==> 表示点击的为二级菜单
    //                     // treeNode.children ==>  存在children表示为有子菜单的一级菜单
    //                     if (treeNode.level == '1') {
    //                         aObj.addClass('active').siblings().removeClass('active'); // 自身添加active, 兄弟节点移除active
    //                         aObj.closest(pObj).siblings().find('.level1').removeClass('active'); // 其他子类菜单移除active
    //                         aObj.closest(pObj).siblings('.level0').removeClass('active'); // 其他一级菜单移除active
    //                     } else if (treeNode.level == '0' && treeNode.children) { // 点击的是有子菜单的一级菜单的话，就不发起请求
    //                         return;
    //                     } else if (treeNode.level == '0' && !treeNode.children) { // 点击的是红名单或者全部
    //                         aObj.addClass('active').siblings().removeClass('active'); // 自身添加active, 兄弟节点移除active
    //                         aObj.siblings('.level0').find('.level1').removeClass('active'); // 兄弟节点下的其他子类菜单移除active
    //                     }

    //                     //下方人员信息隐藏
    //                     $("#cardDetail").addClass("hide");
    //                     $("#portraitCancelCheckAll").removeAttr("checked");  //布控库全选按钮取消全选
    //                     $("#AlarmOptPortrait").find(".btn").eq(0).addClass("btn-primary").siblings().removeClass("btn-primary");
    //                     //标签恢复初始
    //                     $(".portraitLableTotal").addClass("active");
    //                     $(".portraitLableShowDetail").find(".portraitLableShowItem").removeClass("active");
    //                     //身份证号码和姓名搜索初始化
    //                     $("#personSearch").val("");
    //                     //默认回到列表模式
    //                     $("#showCard").click();
    //                     //标签置空
    //                     containerData.picStatus = '';  //布控状态
    //                     containerData.name = '';
    //                     containerData.idcard = '';
    //                     containerData.page = '1';
    //                     containerData.size = '16';
    //                     containerData.labelId = '';
    //                     containerData.type = treeNode.parentType;
    //                     containerData.isEdit = treeNode.isEdit;  //是否可编辑
    //                     containerData.isBk = treeNode.isBk;  //是否可布控
    //                     containerData.status = treeNode.type ? treeNode.type : '';

    //                     if (treeNode.libId === '108') {   //涉港一人一档是单独的页面
    //                         $("#portraitContentOne").addClass("hide");
    //                         $("#portraitContentTwo").removeClass("hide");
    //                         loadPage($('#portraitContentTwo'), 'facePlatform/portraitContentTwo.html');
    //                         // 操作按钮权限获取
    //                         var port = 'v2/user/getUserOperateAuthorty',
    //                             data = {
    //                                 moduleCode: treeNode.moduleCode
    //                             },
    //                             successFunc = function (data) {
    //                                 if (data.code == '200') {
    //                                     var operateCodes = data.data;
    //                                     // 如果用户拥有按钮操作权限，给body挂上属性
    //                                     if (operateCodes && operateCodes.length > 0) {
    //                                         // 循环操作按钮权限,显示隐藏操作按钮
    //                                         operateCodes.forEach(function (val, index) {
    //                                             switch (val.operateCode) {
    //                                                 case '115': // 新建
    //                                                     $('#twoCRDBut').append(`<button type="button" class="btn btn-primary btn-sm" id="createCardTwo">新建</button>`);
    //                                                     break;

    //                                                 case '54': // 编辑
    //                                                     $('#twoCRDBut').append('<button type="button" class="btn btn-sm" id="editCardTwo">编辑</button>');
    //                                                     break;

    //                                                 case '4': // 删除
    //                                                     $('#twoCRDBut').append(`<button type="button" class="btn btn-sm" id="deleteCardTwo">删除</button>`);
    //                                                     break;
    //                                             }
    //                                         })
    //                                     }
    //                                 }
    //                             };
    //                         loadData(port, true, data, successFunc, '', 'GET');
    //                         return;
    //                     } else {
    //                         $("#portraitContentTwo").addClass("hide");
    //                         $("#portraitContentOne").removeClass("hide");
    //                     }
    //                     // 调用刷新右侧人员库信息详情方法
    //                     refreshAlarmPageList();
    //                     //获取库标签
    //                     getLibData();
    //                 }
    //             }
    //         }
    //     },
    //         zTreeNodes = [{
    //             name: '搜索结果',
    //             open: true,
    //             children: []
    //         }];

    //     for (var i = 0; i < data.length; i++) {
    //         var childObj = {};
    //         // 人员库属性赋值
    //         childObj.name = data[i].libName ? data[i].libName : '';
    //         childObj.moduleCode = data[i].moduleCode ? data[i].moduleCode : '';
    //         childObj.type = data[i].status;
    //         childObj.isBk = data[i].isBk;  //每个库类型
    //         childObj.isEdit = data[i].isEdit;  //是否可编辑
    //         childObj.num = data[i].num ? data[i].num : '0';
    //         childObj.libId = data[i].libId ? data[i].libId : '';

    //         zTreeNodes[0].children.push(childObj);
    //     }

    //     // 初始化zTree树组件
    //     $(document).ready(function () {
    //         $.fn.zTree.init($('#search-result-list'), zSetting, zTreeNodes);
    //     })
    // }
})(window, window.jQuery)