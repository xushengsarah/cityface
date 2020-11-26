(function (window, $) {
    var searchObjData = {
        type: 1, // 1-一人多证  2-一证多人
        name: '',
        idcard: '',
        libId: '',
        page: 1,
        size: 12,
    };

    function initVerifyConfig() {
        // 设置table的显示区域高度
        var searchHeight = $('#identityVerifyManage .manages-search-style').height();
        var viewHeight = $('#identityVerifyManage').height();
        $('#identityVerifyManage .manages-card-content').css('height', viewHeight - searchHeight - 20);
        $("#verifyStatus").selectpicker('refresh');
        getAllLibId($("#libIdVal"), 1);
        getIdentityVerify(searchObjData, true);
    }
    initVerifyConfig()

    /**
     * 获取库列表
     * @param {*} $container 下拉框容器
     * @param {*} num 页数
     * @param {*} name 搜索库名称
     * @param {*} search 是否是搜索回调
     */
    function getAllLibId($container, num, name, search, scroll) {
        var port = 'v3/lib/libRightsByLib',
            data = {
                libName: name ? name : '',
                page: num ? num : 1,
                size: 10
            };
        var successFunc = function (data) {
            if (data.code === '200') {
                var result = data.data.list,
                    scrollPage = num + 1;
                if (result) { // 存在返回值
                    if (name || scroll) {
                        var itemHtml = '';
                    } else {
                        var itemHtml = '<option class="option-item" libId=" " value=" ">全部</option>';
                    }

                    for (var i = 0; i < result.length; i++) {
                        itemHtml += `<option class="option-item" libId="${result[i].libId}" value="${result[i].libId}">${result[i].libName}</option>`;
                    }
                    if (!search) {
                        $container.append(itemHtml); // 元素赋值
                    } else {
                        $container.html(itemHtml); // 搜索清空后赋值
                    }
                    $container.prop('disabled', false); // 非不可选
                    $container.selectpicker('refresh');

                    // 滚动加载数据
                    $container.parent().find('div.inner').off("mousewheel").on('mousewheel', function () {
                        //tab内容列表滚动到底部进行下一分页的懒加载事件
                        var $this = $(this),
                            viewHeight = $this.height(), //视口可见高度
                            contentHeight = $this.find(".dropdown-menu.inner")[0].scrollHeight, //内容高度
                            scrollHeight = $this.scrollTop(), // 已经滚动了的高度
                            currentCardItemNum = $this.find("li").length,
                            totalLogLibNum = parseInt(data.data.total);
                        if (contentHeight - viewHeight - scrollHeight <= 0 && currentCardItemNum < totalLogLibNum) {
                            getAllLibId($container, scrollPage, name, '', true);
                        }
                    });

                    $container.parent().find(".bs-searchbox input").on("keyup", function () {
                        getAllLibId($container, 1, $.trim($container.parent().find(".bs-searchbox input").val()), true);
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
        loadData(port, true, data, successFunc);
    };
    /**
     * 一人多证请求数据
     * @param {object} objData 筛选条件的数据
     * @param {object} pageData 
     */
    function getIdentityVerify(objData, pageData) {
        var $allOneIdentity = $('#one-people-identity'), // 一人多证
            $allOnePeople = $('#one-identity-people'), // 一证多人
            $searchItem = '';
        if (objData.type === 1) { // 一人多证
            $searchItem = $allOneIdentity;
        } else if (objData.type === 2) { // 一证多人
            $searchItem = $allOnePeople;
        }
        showLoading($searchItem);
        var port = 'v3/identityVerify/getIdentityVerifyInfo',
            successFun = function (data) {
                hideLoading($searchItem);
                if (data.code === '200' && data.data.total > 0) {
                    var result = data.data,
                        total = result.total,
                        totalPage = result.totalPage,
                        list = result.list,
                        insertHtml = '';
                    for (var i = 0; i < list.length; i++) {
                        if (objData.type === 1 && total) { // 一人多证
                            insertHtml += `<li class="verify-item">
                                            <div class="verify-item-content">
                                                <div class="verify-info-item">
                                                    <img class="verify-item-img img-right-event" src="${list[i].picUrl || './assets/images/control/person.png'}">
                                                    <div class="verify-item-name">
                                                        <span>${list[i].name || '未知'}</span>
                                                    </div>
                                                    <div class="verify-item-new">
                                                        <span class="verify-item-text" title="${'身份证：' + (list[i].idcard || '未知')}">${'<span class="idcard">身份证：</span><span class="idcardInfo">' + (list[i].idcard || '未知')}</span></span>
                                                        <span class="verify-item-text" title="${'来源库：' + (list[i].libName || '未知')}">${'<span class="libName">来源库：</span><span class="libNameInfo">' + (list[i].libName || '未知')}</span></span>
                                                    </div>
                                                    <div class="verify-item-but hide">
                                                        <button type="button" class="btn btn-primary">正确</button>
                                                        <button type="button" class="btn">错误</button>
                                                        <i class="aui-icon-file hide"></i>
                                                    </div>
                                                </div>
                                                <div class="verify-item-percent">${list[i].similar}</div>
                                                <div class="verify-info-item">
                                                    <img class="verify-item-img img-right-event" src="${list[i].warnPicUrl || './assets/images/control/person.png'}">
                                                    <div class="verify-item-name">
                                                        <span>${list[i].warnName || '未知'}</span>
                                                    </div>
                                                    <div class="verify-item-new">
                                                        <span class="verify-item-text" title="${'身份证：' + (list[i].warnIdcard || '未知')}">${'<span class="idcard">身份证：</span><span class="idcardInfo">' + (list[i].warnIdcard || '未知')}</span></span>
                                                        <span class="verify-item-text" title="${'来源库：' + (list[i].warnLibName || '未知')}">${'<span class="libName">来源库：</span><span class="libNameInfo">' + (list[i].warnLibName || '未知')}</span></span>
                                                    </div>
                                                    <div class="verify-item-but hide">
                                                        <button type="button" class="btn btn-primary">正确</button>
                                                        <button type="button" class="btn">错误</button>
                                                        <i class="aui-icon-file hide"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>`;
                        } else if (objData.type === 2 && total) { // 一证多人
                            insertHtml += `<li class="verify-item">
                                            <div class="verify-item-content">
                                                <div class="verify-info-item">
                                                    <img class="verify-item-img img-right-event" src="${list[i].picUrl || './assets/images/control/person.png'}">
                                                    <div class="verify-item-new">
                                                        <span class="verify-item-text" title="${'来源库：' + (list[i].libName || '未知')}">${'来源库：' + (list[i].libName || '未知')}</span>
                                                    </div>
                                                </div>
                                                <div class="verify-item-percent">${list[i].similar}</div>
                                                <div class="verify-info-item">
                                                    <img class="verify-item-img img-right-event" src="${list[i].warnPicUrl || './assets/images/control/person.png'}">
                                                    <div class="verify-item-new">
                                                        <span class="verify-item-text" title="${'来源库：' + (list[i].warnLibName || '未知')}">${'来源库：' + (list[i].warnLibName || '未知')}</span>
                                                    </div>
                                                </div>
                                                <div class="verify-item-head">
                                                    <span class="verify-head-name">${list[i].name || '未知'}</span>
                                                    <span class="verify-head-new" title="${'身份证：' + (list[i].idcard || '未知')}">${'身份证：' + (list[i].idcard || '未知')}</span>
                                                </div>
                                                <div class="verify-item-operation">
                                                    <div class="verify-item-but hide">
                                                        <button type="button" class="btn btn-primary">正确</button>
                                                        <button type="button" class="btn">错误</button>
                                                        <span class="btn btn-link hide">正确</span>
                                                        <span class="btn btn-link hide">错误</span>
                                                        <i class="aui-icon-file hide"></i>
                                                    </div>
                                                    <div class="verify-item-but hide">
                                                        <button type="button" class="btn btn-primary">正确</button>
                                                        <button type="button" class="btn">错误</button>
                                                        <span class="btn btn-link hide">正确</span>
                                                        <span class="btn btn-link hide">错误</span>
                                                        <i class="aui-icon-file hide"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>`;
                        }
                    }
                    $searchItem.empty().append(insertHtml);
                    // 给节点添加数据
                    $searchItem.find('.warning-item').each(function (index, el) {
                        $(el).data('listData', list[index]);
                    });
                    // 判断进行分页
                    if (pageData) { // 分页初始化
                        $searchItem.siblings().remove();
                    }
                    if (totalPage > 1) {
                        var $pagerContainer = $('<div class="alarm-pager-container"></div>'),
                            pageSizeOpt = [{
                                value: 12,
                                text: '12/页',
                                selected: true
                            }, {
                                value: 24,
                                text: '24/页',
                            }];
                        if ($searchItem.siblings().length === 0) {
                            $searchItem.after($pagerContainer);
                            var eventCallBack = function (currPage, pageSize, container, selectPageSizeOpt) {
                                searchObjData.page = currPage;
                                searchObjData.number = pageSize;
                                getIdentityVerify(searchObjData);
                            }
                            setPageParams($pagerContainer, total, totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    }
                } else {
                    $searchItem.siblings().remove();
                    loadEmpty($searchItem, '暂无核验信息', '', true);
                }
            };
        loadData(port, true, objData, successFun);
    };

    //鼠标移入显示气泡
    function showBubble($this, result) {
        // 操作人信息
        var $menu = $([`<div class="mouseOverDetail mouseOverTop" style="width:16rem;">
                        <ul class="card-item-text">
                            <li class="form-group">
                                <label class="aui-form-label">操作人：</label>
                                <div class="form-text form-words text-overflow">张三</div>
                            </li>
                            <li class="form-group">
                                <label class="aui-form-label">身份证：</label>
                                <div class="form-text form-words text-overflow">454654768765865897</div>
                            </li>
                            <li class="form-group">
                                <label class="aui-form-label">操作时间：</label>
                                <div class="form-text form-words text-overflow">2020-01-19</div>
                            </li>
                        </ul>
                    </div>`].join(''));

        var menuLen = $('.mouseOverDetail').length;
        if (menuLen > 0) {
            $('.mouseOverDetail').off().remove();
        }
        $('body').append($menu);
        // var top = $this.offset().top + $this.outerHeight() + 10,
        //     left = $this.offset().left - $menu.outerWidth() / 2 - $this.outerWidth() / 2;
        var top = $this.offset().top - $menu.outerHeight() - 20,
            left = $this.offset().left - $menu.outerWidth() / 2 - $this.outerWidth() / 2;
        document.documentElement.style.setProperty(`--beforeLeftTop`, '1.5rem');
        $menu.css({
            top: top + $(document).scrollTop(),
            left: left + $this.width()
        });
    };

    // 类型切换
    $('#typeValTabs').find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var activeTab = $(e.target).text().trim();
        if (activeTab == '一人多证') {
            searchObjData.type = 1;
            getIdentityVerify(searchObjData, true);
        } else if (activeTab == '一证多人') {
            searchObjData.type = 2;
            getIdentityVerify(searchObjData, true);
        }
    })

    //搜索按钮点击事件
    $("#IVMSearchBut").on('click', function () {
        searchObjData.name = $("#nameVal").val();
        searchObjData.idcard = $("#idcardVal").val();
        searchObjData.libId = $("#libIdVal").val().trim();

        searchObjData.page = 1;
        searchObjData.size = 12;
        getIdentityVerify(searchObjData, true);
    })

    // 处理状态切换
    $(".state-btn-group").on("click", "button", function () {
        $(this).addClass("btn-primary").siblings().removeClass("btn-primary");
        if ($(this).html() == '全部') {

        } else if ($(this).html() == '未处理') {

        } else if ($(this).html() == '正确') {

        } else if ($(this).html() == '错误') {

        }
        getIdentityVerify(searchObjData, true);
    })

    $("#identityVerifyManage .tab-content").on('click', '.verify-item-but .btn', function () {
        var $this = $(this),
            typeId = $("#typeValTabs").find('.nav-link.active').closest('.nav-item').index() + 1;
        if (typeId == 1) {
            var imgType = $this.closest('.verify-info-item').index();
            var btnType = $this.index();
            var confirmData = {
                type: type,
                imgType: imgType,
                btnType: btnType
            };
            if (btnType == 0) {
                $("#IVMTipModal .modal-body").find('.text-center').text('判断该证件正确？');
            } else {
                $("#IVMTipModal .modal-body").find('.text-center').text('判断该证件错误？');
            }
            $("#IVMTipModal").modal('show');
        } else {
            var imgType = $this.closest('.verify-item-operation').index();
            var btnType = $this.index();
            var confirmData = {
                typeId: typeId,
                imgType: imgType,
                btnType: btnType
            };
            if (btnType == 0) {
                $("#IVMTipModal .modal-body").find('.text-center').text('判断该人员正确？');
            } else {
                $("#IVMTipModal .modal-body").find('.text-center').text('判断该人员错误？');
            }
            $("#IVMTipModal").data('confirmData', )
            $("#IVMTipModal").modal('show');
        }
    }).on('click', '.aui-icon-file', function () { // 操作详情展示
        if ($('body').find('.mouseOverDetail').length) {
            $('.mouseOverDetail').remove();
        } else {
            var $this = $(this),
                $targetRow = $this.closest('.librow'),
                targetData = '';
            // targetData = $targetRow.data().listData;
            showBubble($this, targetData);
            $this.off("mouseout").on("mouseout", function (event) { // 布控详情 单击事件入口
                event.stopPropagation();
                event.preventDefault();
                $('.mouseOverDetail').remove();
            });
        }
    })

    // 确认操作
    $("#IVMDeleOk").on('click', function () {
        $("#IVMTipModal").data();
    })

    //人证核验 图片hover 显示中图
    showMiddleImg($('#multi_all'), $('#identityVerifyManage'), '.verify-item-img', 'left');
})(window, window.jQuery);