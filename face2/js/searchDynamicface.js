//向子页面传输网址
var $iframe = document.getElementById('map_iframe'),
    dynamicDataDynamic, // 动态检索数据  
    timeTogetherListDynamic, //时间聚合
    positionTogetherListDynamic, //地点聚合
    cardImgHoverTimer,
    selectTypeDynamic,
    cacheArr = [], //动态缓存数组
    itemCache = '';  //当前缓存的图片序号
// 纯动态页面 左侧图片 初始化图片
function initImgDynamic(inseartImg) {
    var img = $("#imgBase64").val(),
        camera = $("#imgBase64").data('carema'),
        html = '';
    if ($("#imgBase64").data('base64')) {
        img = $("#imgBase64").data('base64');
    }
    if (inseartImg) {
        img = inseartImg;
    }
    if (!isEmpty(img)) {
        $("#imgBase64").removeData('base64');
        html = createAddImageItem(img);
        $("#usearchImgDynamic").find('.add-image-item').removeClass('active');
        $("#usearchImgDynamic .add-image-icon").before(html);
        if ($("#imgBase64").data('searchImmedia')) {
            $("#imgBase64").removeData('searchImmedia')
            imgDom(img, $('#dynamicsearchDynamic'), $("#usearchImgDynamic"));
        } else {
            imgDom(img, $('#dynamicsearchDynamic'), $("#usearchImgDynamic"), true);
        }
        $("#imgBase64")[0].value = '';
        $('#usearchImgDynamic').removeClass('center');
        $('#usearchImgDynamic').find('.add-image-icon').removeClass('add-image-new');
        $('#usearchImgDynamic').find('.add-image-box-text').addClass('hide');
    } else {
        $('#usearchImgDynamic').addClass('center');
    }
    showLoading($('#cameraList').parent());
    // 判断是否有摄像机数据
    if (camera) {
        hideLoading($('#cameraList').parent());
        $('#cameraList').val('已选' + camera + '台摄像机');
    }
    // 绑定摄像机删除按钮事件
    $('#cameraList').siblings().on('click', function () {
        $('#cameraList').val('');
        var $data = $('#cameraList').data('cameraList');
        if ($data) {
            $('#cameraList').data({
                'cameraList': []
            })
        }
    });
    getSelectComments($("#commentSelectDynamic"));
}

// 纯动态页面 调用checkbox组件需要运行相关代码
function checkboxFunc() {
    $('[data-role="checkbox"]').checkboxradio();
    $('[data-role="checkbox-button"]').checkboxradio({
        icon: false
    });
}

// 纯动态页面 初始化 页面图片列表 加载空页面
function initPageDynamic() {
    // var $searchInfo = $('#search-infoDynamic'),
    //     $sortByTimeWrapperDynamic = $('#sortByTimeWrapperDynamic'),
    //     $timeTogetherWrapperDynamic = $('#timeTogetherWrapperDynamic'),
    //     $positionTogetherWrapperDynamic = $('#positionTogetherWrapperDynamic');
    // loadEmpty($searchInfo); // 动态检索 按相似度排序 加载空页面
    // loadEmpty($sortByTimeWrapperDynamic); // 动态检索 按时间序 加载空页面
    // loadEmpty($timeTogetherWrapperDynamic); // 动态检索 按时间聚合 加载空页面
    // loadEmpty($positionTogetherWrapperDynamic); // 动态检索 按地点聚合 加载空页面
    var $imageCacheDynamicList = $('#imageCacheDynamicList');
    loadEmpty($imageCacheDynamicList); // 动态检索 按地点聚合 加载空页面
    $("#showListSearchDynamic").click();
    $("#getSearchBox").find(".idcardSelect").selectmenu();
}

/**
 * 获取侧边栏请求的参数
 * @param {String} typeSearch 判断是地图还是区域
 */
function getSearchDataDynamic(typeSearch) {
    var $selectImg = $('#usearchImgDynamic').find('.add-image-item'), // 所有上传图片节点
        $selectImgActive = $selectImg.filter('.active'), // 当前被选中图片节点
        idcard = $selectImgActive.find('.add-image-img').attr("idcard"),
        selectImgSrc = '', // 当前被选中图片Base64
        selectImgId = '',
        selectImgOptype = '', //动态检索事由和类型
        selectImgSearchComments = '',
        $date = $('#searchMerge_TimeDynamic'), // 日期选中节点
        $slide = $('#sliderInputDynamic'), // 相似度选中节点
        // 判断是否有摄像机选中数据
        $cameraOrg = $('#sidebarOrgSelectDynamic'), // 分局选择框
        $cameraPolice = $('#sidebarPoliceSelectDynamic'), // 派出所选择框
        $cameraArea = $('#sidebarCameraSelectDynamic'), //摄像机多选框
        cameraType = '',
        mapArr = [], // 选择摄像头数据
        cameraValArr = [], // 选择机构数据
        // 判断当前时间段
        $dateInput = $date.find('.datepicker-input'),
        dateStartTime = $dateInput.eq(0).val(),
        dateEndTime = $dateInput.eq(1).val(),

        // 还未确定或者目前写死的数据
        // 静态写死数据
        accessplat = 'facePlatform',
        accessToken = 'string',
        // 动态写死数据
        page = 1, //当前页
        number = 40, //每一页个数
        nodeType = $("#snappingWrap").find("input[name='cjDynamicType']:checked").val(),
        // 镜头id 机构id V2.0版本 封装成字符串数组
        cameraValStringArr = [], // 新的机构id数组
        mapStringArr = []; // 新的镜头id数组
    // 将当前被选中图片索引 绑定到上传图片框
    for (var i = 0; i < $selectImg.length; i++) {
        if ($selectImg[i].className.indexOf('active') > -1) {
            $('#usearchImgDynamic').data('searchImgIndex', i);
        }
    }
    // 当前被选中图片赋值
    if ($selectImgActive.length > 0) {
        selectImgSrc = $selectImgActive.find('.add-image-img').attr('src');
        selectImgId = $selectImgActive.find('.add-image-img').attr('picId');
        $('#usearchImgDynamic').data("maskImg", selectImgSrc);
        selectImgOptype = $selectImgActive.find('.add-image-img').data("opType");
        selectImgSearchComments = $selectImgActive.find('.add-image-img').data("searchComments");
    } else {
        $('#usearchImgDynamic').data("maskImg", '');
    }
    // 机构 摄像头赋值
    if (typeSearch === 'map') { //地图选择
        var mapData = $('#saveNodeSearchDynamic').data('saveData');
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
                areaDataObj = $cameraArea.selectpicker('val');
            cameraType = $("#selMergeCameraIDDynamic").find("input[name='dynamicCameraType']:checked").val();
            if (policeDataObj && policeDataObj.length > 0) {
                cameraValArr.push({
                    'videoGroup': policeDataObj
                });
            } else {
                cameraValArr.push({
                    'videoGroup': orgDataObj
                });

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
            selectImgId: selectImgId,
            idcard: idcard,
            selectImgOpType: selectImgOptype,
            selectImgSearchComments: selectImgSearchComments,
            orgId: $cameraOrg.selectpicker('val'),
            policeDataOb: $cameraPolice.selectpicker('val'),
            areaDataObj: $cameraArea.selectpicker('val'),
            nodeType,
            videoGroups: cameraValStringArr,
            videos: mapStringArr,
            type: cameraType,
            startTime: dateStartTime,
            endTime: dateEndTime,
            threshold: slideVal,
            page: page,
            number: number
        }
    }
}

/**
 * 按时间排序检索 如果目标检索图片没有绑定id 需先绑定id
 * @param {Object} dynamicData 左侧动态检索条件
 */
function peopleSnappingSearchTimeDynamic(dynamicData, itemCache) {
    var $cardContent = $('#sortByTimeWrapperDynamic' + itemCache);
    if ($cardContent.length > 1) {
        $cardContent = $cardContent.eq(1);
    }
    searchTimeSortDataDynamic(dynamicData, itemCache);
}

/**
 * 按相似度排序检索 如果目标检索图片没有绑定id 需先绑定id
 * @param {Object} dynamicData 左侧动态检索条件
 */
function peopleSnappingSearchDynamic(dynamicData, itemCache) {
    var $cardContent = $('#search-infoDynamic' + itemCache);
    if ($cardContent.length > 1) {
        $cardContent = $cardContent.eq(1);
    }
    searchSimilarSortDataDynamic(dynamicData, itemCache);
}

/**
 * 动态抓拍库 时间排序 请求数据和翻页
 * @param {Object} dynamicData 左侧动态检索条件
 * @param {Object} itemCache 当前检索图片索引
 * @param {number} count 失效次数
 */
function searchTimeSortDataDynamic(dynamicData, itemCache, count) {
    var $cardContent = $('#sortByTimeWrapperDynamic' + itemCache),
        port = 'v2/faceDt/peopleSearch',
        option = {
            dynamicId: dynamicData.selectImgId, // 图片
            threshold: dynamicData.threshold, // 阈值
            startTime: dynamicData.startTime, // 开始时间
            endTime: dynamicData.endTime, // 结束时间
            cameraIds: dynamicData.videos, // 摄像头id
            orgIds: dynamicData.videoGroups, // 机构id
            idcard: dynamicData.idcard,
            type: dynamicData.type,
            nodeType: dynamicData.nodeType,
            incidentId: $("#commentSelectDynamic").hasClass("hide") ? '' : $("#commentSelectDynamic").find(".selectpicker").val(),
            page: 1, // 当前页
            size: 40, // 每一页个数
            sort: 2 // 时间降序排序
        },
        successFunc = function (data) {
            hideLoading($("#snappingWrap"));
            if (!$("#commentSelectDynamic").hasClass("hide")) {
                getPowerUse(2, $("#commentSelectDynamic").find(".selectpicker").val());
            }

            if (data.code === '200') {
                var result = data.data;
                $('#sortByTimeWrapperDynamic' + itemCache).find('.image-card-wrap').remove(); // 清空按时间检索图片容器中的所有图片
                sortTimeListDynamic = result.list;
                $("#image-dynamic-list-" + itemCache).data("sortTimeListDynamic", sortTimeListDynamic);
                // 返回图片列表为空
                if (sortTimeListDynamic.length === 0 || result.total === '0') {
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
                    creatSnappingItemDynamic(sortTimeListDynamic, result.total, $('#sortByTimeWrapperDynamic' + itemCache), 'paginationTimeWrapDynamicParent' + itemCache, 'paginationTimeWrapDynamic' + itemCache, true);
                } else {
                    creatSnappingItemDynamic(sortTimeListDynamic, result.total, $('#sortByTimeWrapperDynamic' + itemCache), 'paginationTimeWrapDynamicParent' + itemCache, 'paginationTimeWrapDynamic' + itemCache);
                }
                $('#sortByTimeWrapperDynamic' + itemCache).attr("sortByTimeTotal", result.total);
                // 初始化 所有被选中的图片
                var allSelectedCardList = $("#image-dynamic-list-" + itemCache).data('trakData') && $("#image-dynamic-list-" + itemCache).data('trakData').length > 0 ? $("#image-dynamic-list-" + itemCache).data('trakData') : [];
                allSelectedCardList.forEach(function (item) {
                    sortTimeListDynamic.forEach(function (v, n) {
                        if (v.picId === item.picId) {
                            $('#sortByTimeWrapperDynamic' + itemCache).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                        }
                    })
                });
                // 判断是否需要全选
                judgeSelectePageAll($('#sortByTimeWrapperDynamic' + itemCache));
                //分页
                var $paginationTime = $('#paginationTimeWrapDynamic' + itemCache);
                if (result.totalPage !== '0' && result.totalPage !== '1') {
                    var eventCallBack = function (currPage, pageSize) {
                        pageLoad();

                        function pageLoad(rcount) {
                            var changePort = 'v2/faceDt/peopleSearch',
                                changePote = {
                                    //dynamicId: $('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'), // 图片
                                    dynamicId: dynamicData.selectImgId, // 图片
                                    threshold: option.threshold, // 阈值
                                    startTime: option.startTime, // 开始时间
                                    endTime: option.endTime, // 结束时间
                                    cameraIds: dynamicData.videos, // 摄像头id
                                    idcard: dynamicData.idcard,
                                    orgIds: dynamicData.videoGroups, // 机构id
                                    type: dynamicData.type,
                                    nodeType: dynamicData.nodeType,
                                    incidentId: $("#commentSelectDynamic").hasClass("hide") ? '' : $("#commentSelectDynamic").find(".selectpicker").val(),
                                    page: currPage, // 当前页
                                    size: Number(pageSize), // 每一页个数
                                    sort: 2
                                }
                            successFn = function (data) {
                                hideLoading($cardContent);
                                if (data.code === '200') {
                                    $('#sortByTimeWrapperDynamic' + itemCache).find('.image-card-wrap').remove(); // 清空按时间排序容器
                                    sortTimeListDynamic = data.data.list;
                                    $("#image-dynamic-list-" + itemCache).data("sortTimeListDynamic", sortTimeListDynamic);
                                    // // 根据返回值 vertices 构造 人脸位置facePosition
                                    // for (var i = 0; i < sortTimeListDynamic.length; i++) {
                                    //     sortTimeListDynamic[i].facePosition = getFacePositionData(sortTimeListDynamic[i]);
                                    // }
                                    if (dynamicData.base64Img.length === 0) {
                                        creatSnappingItemDynamic(sortTimeListDynamic, data.data.total, $('#sortByTimeWrapperDynamic' + itemCache), 'paginationTimeWrapDynamicParent' + itemCache, 'paginationTimeWrapDynamic' + itemCache, true);
                                    } else {
                                        creatSnappingItemDynamic(sortTimeListDynamic, data.data.total, $('#sortByTimeWrapperDynamic' + itemCache), 'paginationTimeWrapDynamicParent' + itemCache, 'paginationTimeWrapDynamic' + itemCache);
                                    }
                                    $('#sortByTimeWrapperDynamic' + itemCache).attr("sortByTimeTotal", data.data.total);
                                    var allSelectedCardList = $("#image-dynamic-list-" + itemCache).data('trakData') && $("#image-dynamic-list-" + itemCache).data('trakData').length > 0 ? $("#image-dynamic-list-" + itemCache).data('trakData') : [];
                                    allSelectedCardList.forEach(function (item) {
                                        sortTimeListDynamic.forEach(function (v, n) {
                                            if (v.picId === item.picId) {
                                                $('#sortByTimeWrapperDynamic' + itemCache).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                            }
                                        })
                                    });
                                    hideLoading($cardContent);
                                    removeLoadEmpty($cardContent);
                                    var maskID = $('.image-card-list.no-bottom-border').children().not('.display-none').attr('id'); // 当前被选中的动态检索类型的容器
                                    $('.mask-container-fixed.' + maskID).remove(); // 删除大图
                                    judgeSelectePageAll($('#sortByTimeWrapperDynamic' + itemCache));
                                    // 添加节点数据
                                    addDataByDymPic('#sortByTimeWrapperDynamic' + itemCache, sortTimeListDynamic);
                                } else if (data.code === '616') {
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
                                                    $("#usearchImgDynamic").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
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
                                                    $("#usearchImgDynamic").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                                        if ($(ele).find(".add-image-img").attr('picId') == dynamicData.selectImgId) {
                                                            // 给当前选中的图片绑定id
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
                    $('#paginationTimeWrapDynamic' + itemCache).closest('.pagination-wrap').removeClass('display-none').find('.pagination-result-number').text(result.total);
                } else {
                    $paginationTime.closest('.pagination-wrap').remove();
                }
                hideLoading($cardContent);
                removeLoadEmpty($cardContent);
                // 添加节点数据
                addDataByDymPic('#sortByTimeWrapperDynamic' + itemCache, sortTimeListDynamic);
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
                                    dynamicData.selectImgId = data.staticId;
                                    $("#usearchImgDynamic").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                        if ($(ele).find(".add-image-img").attr('picId') == dynamicData.selectImgId) {
                                            // 给当前选中的图片绑定id
                                            $(ele).find('.add-image-img').attr('picId', data.staticId);
                                            $(ele).find('.add-image-img').attr('picStatus', '1');
                                        }
                                    })
                                    sxCount += sxCount;
                                    // 重新请求 数据相似度排序
                                    searchTimeSortDataDynamic(dynamicData, itemCache, sxCount)
                                } else {
                                    warningTip.say(data.message);
                                    $("#usearchImgDynamic").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
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
            }
        };
    loadData(port, true, option, successFunc);
    if (!dynamicData.base64Img) {
        $('#selectAllSnappingDynamic .ui-checkboxradio-label').addClass('text-disabled');
    }
    showLoading($("#snappingWrap"));
}

/** 聚合请求数据
 * @param {Object} dynamicData 左侧动态检索条件
 * @param {string} itemCache 检索图片序号
 * @param {number} typeCache 1是时间聚合2是地点聚合
 */
function togetherSearchDynamic(dynamicData, itemCache, typeCache) {
    var _dynamicId = dynamicData.selectImgId,
        port = 'v2/faceDt/mergeSearch',
        option = {
            dynamicId: _dynamicId, // 图片
            threshold: dynamicData.threshold, // 阈值
            startTime: dynamicData.startTime, // 开始时间
            endTime: dynamicData.endTime, // 结束时间
            cameraIds: dynamicData.videos, // 摄像头id
            orgIds: dynamicData.videoGroups, // 机构id
            idcard: dynamicData.idcard,
            type: dynamicData.type, //镜头类点
            nodeType: dynamicData.nodeType,
            incidentId: $("#commentSelectDynamic").hasClass("hide") ? '' : $("#commentSelectDynamic").find(".selectpicker").val(),
            page: dynamicData.page, // 当前页
            size: dynamicData.number, // 每一页个数
            randomNum: Math.random() //防止ajaxFilter加的一个随机数
        },
        $wrapT = $('#timeTogetherWrapperDynamic' + itemCache), // 按时间聚合
        $wrapP = $('#positionTogetherWrapperDynamic' + itemCache), // 按地点聚合
        timeAndPositionMergeSuccessFunc = function (data) {
            hideLoading($("#snappingWrap")); // 按时间聚合
            if (!$("#commentSelectDynamic").hasClass("hide")) {
                getPowerUse(2, $("#commentSelectDynamic").find(".selectpicker").val());
            }

            if (data.code === '200') {
                hideLoading($wrapT);
                hideLoading($wrapP);
                // 按时间聚合
                var resultT = data.timeGroup;
                timeTogetherListDynamic = data.timeGroup;
                $("#image-dynamic-list-" + itemCache).data('timeTogetherListDynamic', timeTogetherListDynamic);
                var allSelectedCardList = $("#image-dynamic-list-" + itemCache).data('trakData') && $("#image-dynamic-list-" + itemCache).data('trakData').length > 0 ? $("#image-dynamic-list-" + itemCache).data('trakData') : [];
                if (resultT.length === 0) {
                    loadEmpty($wrapT);
                } else {
                    $('#timeTogetherWrapperDynamic' + itemCache).html('');
                    // 按时间聚合 生成页面
                    createTogetherListDynamic($wrapT, resultT, 1, $('#timeTogetherWrapperDynamic' + itemCache), dynamicData);
                    togetherShowMore();

                    if (timeTogetherListDynamic) {
                        timeTogetherListDynamic.forEach(function (el, index) {
                            allSelectedCardList.forEach(function (item) {
                                el.list.forEach(function (v, n) {
                                    if (v.picId === item.picId) {
                                        $('#timeTogetherWrapperDynamic' + itemCache).find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                    }
                                })
                            })
                        });
                    }
                    judgeSelectePageAll($('#timeTogetherWrapperDynamic' + itemCache));
                    $('#timeTogetherWrapperDynamic' + itemCache).find('.image-card-list').each(function (index, el) {
                        judgeSelecteAll($(el));
                    });
                }
                // 抓拍图节点数据添加
                addDataByDymPic('#timeTogetherWrapperDynamic' + itemCache, timeTogetherListDynamic, true);

                // 按地点聚合
                var resultP = data.orgGroup;
                positionTogetherListDynamic = data.orgGroup;
                $("#image-dynamic-list-" + itemCache).data('positionTogetherListDynamic', positionTogetherListDynamic);
                if (resultP.length === 0) {
                    loadEmpty($wrapP);
                } else {
                    var newdata = [];
                    $('#positionTogetherWrapperDynamic' + itemCache).html('');
                    // 按地点聚合 生成页面
                    createTogetherListDynamic($wrapP, resultP, 2, $('#positionTogetherWrapperDynamic' + itemCache), dynamicData);
                    togetherShowMore();

                    if (positionTogetherListDynamic) {
                        positionTogetherListDynamic.forEach(function (el, index) {
                            allSelectedCardList.forEach(function (item) {
                                el.list.forEach(function (v, n) {
                                    if (v.picId === item.picId) {
                                        $('#positionTogetherWrapperDynamic' + itemCache).find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                    }
                                })
                            })
                        });
                    }
                    judgeSelectePageAll($('#positionTogetherWrapperDynamic' + itemCache));
                    $('#positionTogetherWrapperDynamic' + itemCache).find('.image-card-list').each(function (index, el) {
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
                        iframe = document.getElementById('search_map_iframeDynamic');
                    iframe.contentWindow.postMessage(data, targetOrigin);
                }
                // 抓拍图节点数据添加
                addDataByDymPic('#positionTogetherWrapperDynamic' + itemCache, positionTogetherListDynamic, true);
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
                    console.log(dynamicData);
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
                                $("#usearchImgDynamic").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                    if ($(ele).find(".add-image-img").attr('picId') == dynamicData.selectImgId) {
                                        // 给当前选中的图片绑定id
                                        $(ele).find('.add-image-img').attr('picId', data.staticId);
                                        $(ele).find('.add-image-img').attr('picStatus', '1');
                                    }
                                })
                                // 重新请求 数据相似度排序
                                togetherSearchDynamic(dynamicData, itemCache, typeCache);
                            } else {
                                warningTip.say(data.message);
                                $("#usearchImgDynamic").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
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
                $('#search-infoDynamic' + itemCache).empty();
                $('#sortByTimeWrapperDynamic' + itemCache).empty();

                $("#image-dynamic-list-" + itemCache).removeData("sortListDynamic");
                $("#image-dynamic-list-" + itemCache).removeData("sortTimeListDynamic");
                if (typeCache == 1) {
                    $('#positionTogetherWrapperDynamic' + itemCache).empty();
                    $("#image-dynamic-list-" + itemCache).removeData("positionTogetherListDynamic");
                } else if (typeCache == 2) {
                    $('#timeTogetherWrapperDynamic' + itemCache).empty();
                    $("#image-dynamic-list-" + itemCache).removeData("timeTogetherListDynamic");
                }
            }
        };
    showLoading($("#snappingWrap")); // 按时间聚合
    // showLoading($wrapT); // 按时间聚合
    // showLoading($wrapP); // 按地点聚合
    loadData(port, true, option, timeAndPositionMergeSuccessFunc);
}

/** 
 * 聚合内容生成节点 构造图片节点和翻页节点
 * @param {Object} el 聚合容器
 * @param {Array} data 聚合返回的数组
 * @param {Number} mType 聚合类型 1.时间聚合 2.地点聚合
 * @param {Object} $dom 聚合存放总数 $dom
 */
function createTogetherListDynamic(el, data, mType, $dom) {
    var html = '',
        max = 40,
        rowNum = 0,
        totalNum = 0;
    if ($("#showListSearchDynamic").hasClass("btn-primary")) {
        rowNum = 4;
    } else {
        rowNum = 8;
    }
    // 拼接复选框id
    if (mType === 1) {
        type = 'timeTogetherDynamic';
    }
    if (mType === 2) {
        type = 'positionTogetherDynamic';
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
    if (type === 'timeTogetherDynamic') {
        $('#timeTogetherTotalDynamic').text("(" + totalNum + ")");
        $dom.attr("timeTogether", totalNum);
    } else if (type === 'positionTogetherDynamic') { // 按地点聚合 动态库总数赋值
        $('#positionTogetherTotalDynamic').text("(" + totalNum + ")");
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
        if (type === 'timeTogetherDynamic') {
            obj.total = timeTogetherListDynamic[index].total;
            obj.totalPage = timeTogetherListDynamic[index].totalPage;
        } else if (type === 'positionTogetherDynamic') { // 按地点聚合 本组聚合的总数据 总页数
            obj.total = positionTogetherListDynamic[index].total;
            obj.totalPage = positionTogetherListDynamic[index].totalPage;
        }
        timeTogetherCardPageSearchDynamic(obj);
    });

    if ($("#showListSearchDynamic").hasClass("btn-primary")) {
        $("#showListSearchDynamic").click();
    } else {
        $("#showCardSearchDynamic").click();
    }
}

/**
 * 动态库 聚合分页 页面内容刷新
 * @param {Array} data 聚合分组 当前组的分页数据
 * @param {*} $element 聚合分组 当前组的图片容器 包含所有图片的容器
 */
function sortImgCardBoxDynamic(data, $element) {
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

    if ($("#showListSearchDynamic").hasClass("btn-primary")) {
        $("#showListSearchDynamic").click();
    } else {
        $("#showCardSearchDynamic").click();
    }
}

/**
 * 动态抓拍库 相似度排序 请求数据和翻页 （其中包含 调用聚合数据方法）
 * @param {Object} dynamicData 左侧动态检索条件
 * @param {number} count 失效的次数
 */
function searchSimilarSortDataDynamic(dynamicData, itemCache, count) {
    var $cardContent = $('#search-infoDynamic' + itemCache),
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
            incidentId: $("#commentSelectDynamic").hasClass("hide") ? '' : $("#commentSelectDynamic").find(".selectpicker").val(),
            page: 1, // 当前页
            size: 40, // 每一页个数
            sort: 1 // 相似度降序排序
        },
        successFunc = function (data) {
            hideLoading($("#snappingWrap"));
            if (!$("#commentSelectDynamic").hasClass("hide")) {
                getPowerUse(2, $("#commentSelectDynamic").find(".selectpicker").val());
            }
            if (data.code === '200') {
                var result = data.data,
                    allSelectedCardList = $("#image-dynamic-list-" + itemCache).data('trakData') && $("#image-dynamic-list-" + itemCache).data('trakData').length > 0 ? $("#image-dynamic-list-" + itemCache).data('trakData') : [];
                sortListDynamic = result.list; // 相似度排序 返回的数据集
                $("#image-dynamic-list-" + itemCache).data('sortListDynamic', sortListDynamic);
                // 检索图片 返回值为空
                if (sortListDynamic.length === 0 || +result.total === 0) {
                    hideLoading($cardContent);
                    loadEmpty($cardContent);
                    // loadEmpty($("#timeTogetherWrapperDynamic"));
                    // loadEmpty($("#positionTogetherWrapperDynamic"));
                    var targetOrigin = mapUrl + 'peopleCity.html',
                        data = {
                            type: "cluster",
                            mydata: []
                        },
                        iframe = document.getElementById('search_map_iframeDynamic');
                    iframe.contentWindow.postMessage(data, targetOrigin);
                    return;
                }
                // // 根据返回值 vertices 构造 人脸位置facePosition
                // for (var i = 0; i < sortList.length; i++) {
                //     sortList[i].facePosition = getFacePositionData(sortList[i]);
                // }
                $('#search-infoDynamic' + itemCache).find('.image-card-wrap').remove();
                $('#search-infoDynamic' + itemCache).attr("sortTotal", result.total);
                creatSnappingItemDynamic(sortListDynamic, result.total, $('#search-infoDynamic' + itemCache), 'paginationScoreWrapDynamicParent' + itemCache, 'paginationScoreWrapDynamic' + itemCache); // 动态抓拍库生成节点

                allSelectedCardList.forEach(function (item) {
                    sortListDynamic.forEach(function (v, n) {
                        if (v.picId === item.picId) {
                            $('#search-infoDynamic' + itemCache).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                        }
                    })
                });
                // 全选按钮选中状态
                judgeSelectePageAll($('#search-infoDynamic' + itemCache));
                //分页
                var $pagination = $('#paginationScoreWrapDynamic' + itemCache);
                if (+result.totalPage !== 0 && +result.totalPage !== 1) {
                    var eventCallBack = function (currPage, pageSize) {
                        pageLoad();
                        function pageLoad(rcount) {
                            var changePort = 'v2/faceDt/peopleSearch',
                                changePote = {
                                    //dynamicId: $('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'), // 图片
                                    dynamicId: dynamicData.selectImgId,
                                    threshold: option.threshold, // 阈值
                                    startTime: option.startTime, // 开始时间
                                    endTime: option.endTime, // 结束时间
                                    idcard: dynamicData.idcard,
                                    cameraIds: dynamicData.videos, // 摄像头id
                                    orgIds: dynamicData.videoGroups, // 机构id
                                    type: dynamicData.type,
                                    nodeType: dynamicData.nodeType,
                                    incidentId: $("#commentSelectDynamic").hasClass("hide") ? '' : $("#commentSelectDynamic").find(".selectpicker").val(),
                                    page: currPage, // 当前页
                                    size: Number(pageSize), // 每一页个数
                                    sort: 1
                                },
                                successFn = function (data) {
                                    hideLoading($cardContent);
                                    if (data.code === '200') {
                                        hideLoading($cardContent);
                                        removeLoadEmpty($cardContent);
                                        sortListDynamic = data.data.list;
                                        $("#image-dynamic-list-" + itemCache).data('sortListDynamic', sortListDynamic);
                                        // 根据返回值 vertices 构造 人脸位置facePosition
                                        // for (var i = 0; i < sortList.length; i++) {
                                        //     sortList[i].facePosition = getFacePositionData(sortList[i]);
                                        // }
                                        $('#search-infoDynamic' + itemCache).find('.image-card-wrap').remove();
                                        $('#search-infoDynamic' + itemCache).attr("sortTotal", data.data.total);
                                        // 创建图片节点
                                        creatSnappingItemDynamic(sortListDynamic, data.data.total, $('#search-infoDynamic' + itemCache), 'paginationScoreWrapDynamicParent' + itemCache, 'paginationScoreWrapDynamic' + itemCache);
                                        // 初始化 所有被选中的图片
                                        var allSelectedCardList = $("#image-dynamic-list-" + itemCache).data('trakData') && $("#image-dynamic-list-" + itemCache).data('trakData').length > 0 ? $("#image-dynamic-list-" + itemCache).data('trakData') : []; // 被选中的图片列表
                                        allSelectedCardList.forEach(function (item) {
                                            sortListDynamic.forEach(function (v, n) {
                                                if (v.picId === item.picId) {
                                                    $('#search-infoDynamic' + itemCache).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                                }
                                            })
                                        });
                                        var maskID = $('.image-card-list.no-bottom-border').children().not('.display-none').attr('id'); // 当前被选中的动态检索类型的容器
                                        $('.mask-container-fixed.' + maskID).remove(); // 删除大图
                                        judgeSelectePageAll($('#search-infoDynamic' + itemCache));
                                        // 抓拍图节点数据添加
                                        addDataByDymPic('#search-infoDynamic' + itemCache, sortListDynamic);
                                    } else if (data.code === '616') {
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
                                                        dynamicData.selectImgId = data.staticId;
                                                        $("#usearchImgDynamic").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                                            if ($(ele).find(".add-image-img").attr('picId') == dynamicData.selectImgId) {
                                                                // 给当前选中的图片绑定id
                                                                $(ele).find('.add-image-img').attr('picId', data.staticId);
                                                                $(ele).find('.add-image-img').attr('picStatus', '1');
                                                            }
                                                        })
                                                        // 重新请求 数据相似度排序
                                                        sxrCount += sxrCount;
                                                        pageLoad(sxrCount);
                                                    } else {
                                                        warningTip.say(data.message);
                                                        $("#usearchImgDynamic").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
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
                    $('#paginationScoreWrapDynamic' + itemCache).closest('.pagination-wrap').removeClass('display-none').find('.pagination-result-number').text(result.total);
                } else {
                    $pagination.closest('.pagination-wrap').remove();
                }
                hideLoading($cardContent);
                removeLoadEmpty($cardContent);
                $('.card-content>.card-tip').removeClass('hide');
                // 抓拍图节点数据添加
                addDataByDymPic('#search-infoDynamic' + itemCache, sortListDynamic);
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
                                    $("#usearchImgDynamic").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                        if ($(ele).find(".add-image-img").attr('picId') == dynamicData.selectImgId) {
                                            // 给当前选中的图片绑定id
                                            $(ele).find('.add-image-img').attr('picId', data.staticId);
                                            $(ele).find('.add-image-img').attr('picStatus', '1');
                                        }
                                    })
                                    dynamicData.selectImgId = data.staticId;
                                    // 重新请求 数据相似度排序
                                    sxCount += sxCount;
                                    searchSimilarSortDataDynamic(dynamicData, itemCache, sxCount);
                                } else {
                                    warningTip.say(data.message);
                                    $("#usearchImgDynamic").find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
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
                    iframe = document.getElementById('search_map_iframeDynamic');
                iframe.contentWindow.postMessage(data, targetOrigin);
                $('.card-content>.card-tip').addClass('hide');
            }
        };
    if (!dynamicData.base64Img) {
        hideLoading($("#snappingWrap"));
        loadEmpty($cardContent);
        return
    } else {
        $('.loading-box').removeClass('hide');
        showLoading($("#snappingWrap"));
    }
    loadData(port, true, option, successFunc);
}

/**
 * 动态抓拍库生成节点 相似度排序 和 时间排序
 * @param {Array} list 抓拍库请求成功后返回数据 
 */
function creatSnappingItemDynamic(list, total, $ele, paginationWrapId, paginationId, delLabel) {
    // 判断是时间排序还是相似度排序
    if ($ele.attr('id') === 'search-infoDynamic' + itemCache) {
        $('#sortTotalDynamic').text("(" + total + ")");
    } else {
        $('#sortByTimeTotalDynamic').text("(" + total + ")");
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
    if ($("#showListSearchDynamic").hasClass("btn-primary")) {
        $("#showListSearchDynamic").click();
    } else {
        $("#showCardSearchDynamic").click();
    }
}

/**
 * 时间 + 地点 聚合卡片超过两行后 获取分页信息
 * @param {Object} obj 时间 + 地点聚合类型 分页数据
 */
function timeTogetherCardPageSearchDynamic(obj) {
    var id = obj.id, // 当前分组聚合的分页元素id
        pType = obj.mType, // 聚合类型 1.时间聚合 2.地点聚合
        $pagination = $(`#${id}`), // 当前分组聚合的分页元素 格式类似positionTogetherPagination1
        $cardList = $pagination.closest('.image-card-list'), // 当前分组聚合的元素 包含标题和分页元素
        $newElement = $cardList.find('.image-card-list-wrap'); // 聚合分组 当前组的图片容器 包含所有图片的容器
    var eventCallBack = function (currPage, pageSize) {
        var changePort = 'v2/faceDt/mergePageSearch',
            mergeId = $(`#${id}`).closest('.image-card-list').attr('mergeId'), // 每组聚合数据的聚合id
            dynamicId = $('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'),
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
                    sortImgCardBoxDynamic(newList, $newElement);
                    var allSelectedCardList = $("#image-dynamic-list-" + itemCache).data('trakData') && $("#image-dynamic-list-" + itemCache).data('trakData').length > 0 ? $("#image-dynamic-list-" + itemCache).data('trakData') : [];
                    // 按时间聚合 初始化所有被选中的图片
                    if (pType === 1) {
                        timeTogetherListDynamic[index].list = newList;
                        $("#image-dynamic-list-" + itemCache).data('timeTogetherListDynamic', timeTogetherListDynamic);
                        // 初始化 所有被选中的图片
                        allSelectedCardList.forEach(function (item) {
                            timeTogetherListDynamic[index].list.forEach(function (v, n) {
                                if (v.picId === item.picId) {
                                    $('#timeTogetherWrapperDynamic' + itemCache).find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                }
                            })
                        });
                    } else if (pType === 2) { // 按地点聚合 初始化所有被选中的图片
                        positionTogetherListDynamic[index].list = newList;
                        $("#image-dynamic-list-" + itemCache).data('positionTogetherListDynamic', positionTogetherListDynamic);
                        // 初始化 所有被选中的图片
                        allSelectedCardList.forEach(function (item) {
                            positionTogetherListDynamic[index].list.forEach(function (v, n) {
                                if (v.picId === item.picId) {
                                    $('#positionTogetherWrapperDynamic' + itemCache).find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                }
                            })
                        });
                    }
                    // 按时间聚合 抓拍图节点数据添加
                    if (selectTypeDynamic === 3) {
                        // 中图
                        addDataByDymPic('#timeTogetherWrapperDynamic' + itemCache, timeTogetherListDynamic, true);
                        // 判断功能区的全选是否需要选中
                        judgeSelectePageAll($('#timeTogetherWrapperDynamic' + itemCache));
                        // 聚合 每组标题的全选是否需要选中
                        $('#timeTogetherWrapperDynamic' + itemCache).find('.image-card-list').each(function (index, el) {
                            judgeSelecteAll($(el));
                        });
                    } else if (selectTypeDynamic === 4) {
                        // 中图
                        addDataByDymPic('#positionTogetherWrapperDynamic' + itemCache, positionTogetherListDynamic, true);
                        // 判断功能区的全选是否需要选中
                        judgeSelectePageAll($('#positionTogetherWrapperDynamic' + itemCache));
                        // 聚合 每组标题的全选是否需要选中
                        $('#positionTogetherWrapperDynamic' + itemCache).find('.image-card-list').each(function (index, el) {
                            judgeSelecteAll($(el));
                        });
                    }
                    // 删除聚合大图
                    var maskID = $('.image-card-list.no-bottom-border').children().not('.display-none').attr('id');
                    if (maskID === 'timeTogetherWrapperDynamic' + itemCache || maskID === 'positionTogetherWrapperDynamic' + itemCache) {
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
 * 改变时间标签的激活状态
 */
function changeActiveMergeDynamic(_counts) {
    // if (_counts === 3) {
    //     // 三天 单选激活 
    //     $('#mergeTimeDynamic button').eq(0).addClass('btn-primary').siblings().removeClass("btn-primary");
    // } else if (_counts === 7) {
    //     // 七天 单选激活 
    //     $('#mergeTimeDynamic button').eq(1).addClass('btn-primary').siblings().removeClass("btn-primary");
    // } else if (_counts === 30) {
    //     // 半个月 单选激活 
    //     $('#mergeTimeDynamic button').eq(2).addClass('btn-primary').siblings().removeClass("btn-primary");
    // } else {

    // }
    // 所有单选不激活 
    $('#mergeTimeDynamic button').removeClass("btn-primary");
}

// 重置默认数据
function resetSearchDataDynamic() {
    // 摄像机
    var $cameraOrg = $('#sidebarOrgSelectDynamic');
    if ($cameraOrg.length > 0) {
        var $cameraMenu = $cameraOrg.data('selectpicker').$menu,
            $cameraBtn = $cameraOrg.data('selectpicker').$button,
            $cameraMenuItem = $cameraMenu.find('.dropdown-menu').find('.dropdown-item');
        $cameraMenuItem.eq(0).click();
        $cameraBtn.blur();
    }
    // 日期
    var $time = $('#searchMerge_TimeDynamic'),
        $timeBtn = $time.prev().find('.btn.btn-sm');
    if ($timeBtn.length > 0) {
        $timeBtn.eq(2).click();
    }
    // 滑动块
    var $slider = $('#sliderInputDynamic');
    if ($slider.length > 0) {
        $slider.data('comp').slider("value", '90');
        $slider.val('90');
    }
}

// 抓拍库图片拖拽框选
function dropSelectDynamic($dragContainer) {
    // 检索图片框选功能
    $dragContainer.on('mousedown', function (evt) {
        var $dropSelectHtml = $('<div class="drop-select-box hide"></div>'),
            $mapPanel = $('<div class="map-panel hide"></div>');
        // 找寻到当前权限下检索节点中添加选中框节点
        var $searchDom = $('#pageSidebarMenu').find('.aui-icon-monitor'); // 检索图标
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
            $imageWrap = $('.dynamicCardImgDynamic').find('.imageCacheDynamicList .image-card-list').not('.hide').find('.showBigImgDynamic').not('.display-none');
        //$imageWrap = $('.dynamicCardImgDynamic').find('.showBigImgDynamic').not('.display-none'); // 动态检索 此种检索类型的图片ul列表
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
        if ($target.closest('.card-title-box').length > 0 ||
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
    $('.dynamicCardImgDynamic').on('mousedown', '.image-card-wrap', function (evt) {
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
            $searchImgPanel = $('<div class="drop-card-panel hide"><span>拖拽至此处进行检索</span></div>'),
            $saveItem = $thisParent.find('.drop-card-copy'),
            $panel = $thisParent.find('.drop-card-panel'),
            thisInfo = $this.find('.image-card-box')[0].getBoundingClientRect(),
            posX = evt.pageX,
            posY = evt.pageY;
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
            $thisParent.find('#usearchImgDynamic').append($searchImgPanel);
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
            var searchImgInfo = $thisParent.find('#usearchImgDynamic')[0].getBoundingClientRect(),
                searchImgX = searchImgInfo.left + searchImgInfo.width,
                searchImgY = searchImgInfo.top + searchImgInfo.height;
            // 判断是否拖入上传图片框中
            if (e.pageX < searchImgX && e.pageY < searchImgY &&
                e.pageX > searchImgInfo.left && e.pageY > searchImgInfo.top) {
                $thisParent.find('#usearchImgDynamic').addClass('no-border');
                $searchImgPanel.addClass('border');
            } else {
                $thisParent.find('#usearchImgDynamic').removeClass('no-border');
                $searchImgPanel.removeClass('border');
            }
            // 判定搜索框是否有滚动条
            var $addImage = $('#usearchImgDynamic').find('.add-image-item');
            if ($addImage.length >= 9) {
                var imgScrollTop = $('#usearchImgDynamic').scrollTop();
                $('#usearchImgDynamic').css({
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
                    $("#usearchImgDynamic").find('.add-image-item').removeClass('active');
                    $('#usearchImgDynamic').find('.add-image-icon').before(html);
                    $('#usearchImgDynamic').find('.uploadFile')[0].value = '';
                    var $imgItem = $('#usearchImgDynamic').find('.add-image-item');
                    if ($imgItem.length > 5) {
                        $('#usearchImgDynamic').removeClass('scroll');
                        var clientH = $('#usearchImgDynamic')[0].clientHeight;
                        $('#usearchImgDynamic').addClass('scroll');
                        $('#usearchImgDynamic').animate({
                            'scrollTop': clientH
                        }, 500);
                    }
                    imgDom(thisData.base64Img, $('#dynamicsearchDynamic'), $("#usearchImgDynamic"), false, false, thisData);
                    $('#usearchImgDynamic').removeClass('center');
                    $('#usearchImgDynamic').find('.add-image-icon').removeClass('add-image-new');
                    $('#usearchImgDynamic').find('.add-image-box-text').addClass('hide');
                } else {
                    window.loadData('v2/faceDt/getImgByUrl', true, {
                        url: insertImg
                    }, function (data) {
                        var imgUrl = 'data:image/png;base64,' + data.base64;
                        var html = createAddImageItem(imgUrl);
                        $("#usearchImgDynamic").find('.add-image-item').removeClass('active');
                        $('#usearchImgDynamic').find('.add-image-icon').before(html);
                        $('#usearchImgDynamic').find('.uploadFile')[0].value = '';
                        var $imgItem = $('#usearchImgDynamic').find('.add-image-item');
                        if ($imgItem.length > 5) {
                            $('#usearchImgDynamic').removeClass('scroll');
                            var clientH = $('#usearchImgDynamic')[0].clientHeight;
                            $('#usearchImgDynamic').addClass('scroll');
                            $('#usearchImgDynamic').animate({
                                'scrollTop': clientH
                            }, 500);
                        }
                        imgDom(imgUrl, $('#dynamicsearchDynamic'), $("#usearchImgDynamic"), false, false, thisData);
                        $('#usearchImgDynamic').removeClass('center');
                        $('#usearchImgDynamic').find('.add-image-icon').removeClass('add-image-new');
                        $('#usearchImgDynamic').find('.add-image-box-text').addClass('hide');
                    });
                }
            }
            $cardCopy.addClass('hide');
            $searchImgPanel.addClass('hide');
            $('#usearchImgDynamic').removeAttr('style');
            $searchImgPanel.removeClass('border').removeAttr('style');
            $thisParent.find('#usearchImgDynamic').removeClass('no-border');
            $(document).off('mousemove.cardDropWrap mouseup.cardDropWrap')
        });
    });
}

//动态缓存图片条件切换
function showSearchLimitDynamic(data) {
    $("#timeStartDynamic").val(data.startTime);
    $("#timeEndDynamic").val(data.endTime);

    $('#searchMerge_TimeDynamic').find('.datepicker-input').eq(0).blur();
    $('#searchMerge_TimeDynamic').find('.datepicker-input').eq(1).blur();

    $("#sliderInputDynamic").val(data.threshold);
    $("#slider").slider("value", data.threshold);

    $("#snappingWrap").find(`input[name='cjDynamicType'][value=${data.nodeType}]`).prev().click().attr("isclick", "0");
    $("#snappingWrap").find(`input[name='cjDynamicType'][value=${data.nodeType}]`).prev().removeAttr("isclick");

    if (data.nodeType == 1) {  //市局总中心
        $("#timeTogetherDynamic").removeClass('text-disabled');
        $("#timeTogetherDynamic").prev().removeClass('text-disabled');
        $("#placeTogetherDynamic").removeClass('text-disabled');
        $("#placeTogetherDynamic").prev().removeClass('text-disabled');
    } else {   //龙岗分中心
        $("#timeTogetherDynamic").addClass('text-disabled');
        $("#timeTogetherDynamic").prev().addClass('text-disabled');
        $("#placeTogetherDynamic").addClass('text-disabled');
        $("#placeTogetherDynamic").prev().addClass('text-disabled');
    }

    //区域选择  
    if (data.videoGroups.length > 0) {
        $("#selMergeCameraIDDynamic .searchArea").show();
        $("#selMergeCameraIDDynamic .searchMap").hide();
        $("#searchSelectDynamic").addClass("btn-primary");
        $("#searchMapDynamic").removeClass("btn-primary");
        $("#sidebarOrgSelectDynamic").prop('disabled', false); // 非不可选
        $("#sidebarOrgSelectDynamic").val(data.orgId);
        $("#sidebarOrgSelectDynamic").selectpicker("refresh");

        $("#sidebarPoliceSelectDynamic").prop('disabled', "disabled"); // 非不可选
        $("#sidebarPoliceSelectDynamic").val("");
        $("#sidebarPoliceSelectDynamic").selectpicker("refresh");

        $("#sidebarCameraSelectDynamic").prop('disabled', "disabled"); // 非不可选
        $("#sidebarCameraSelectDynamic").val("");
        $("#sidebarCameraSelectDynamic").selectpicker("refresh");

        //类点
        if (data.type == "") {
            //$(`input[name='dynamicCameraType']`).eq(0).click();
            $(`input[name='dynamicCameraType']`).eq(1).click();
        } else {
            $(`input[name='dynamicCameraType'][value=${data.type}]`).click();
        }

        if (data.orgId != '10') {
            $("#sidebarPoliceSelectDynamic").prop('disabled', false); // 非不可选
            loadSearchOrgInfo($("#sidebarPoliceSelectDynamic"), data.orgId, false, data.policeDataOb); //通过机构请求派出所
        } else {
            $("#sidebarPoliceSelectDynamic").prop('disabled', "disabled"); // 非不可选
        }

        if (data.policeDataOb.length > 0) {
            $("#sidebarCameraSelectDynamic").prop('disabled', false); // 非不可选
            loadSearchCameraInfo($("#sidebarCameraSelectDynamic"), data.policeDataOb, data.areaDataObj); //通过请求派出所
        } else {
            $("#sidebarCameraSelectDynamic").prop('disabled', "disabled"); // 非不可选
        }
    } else { //地图选择
        $("#selMergeCameraIDDynamic .searchArea").hide();
        $("#selMergeCameraIDDynamic .searchMap").show();
        $("#searchSelectDynamic").removeClass("btn-primary");
        $("#searchMapDynamic").addClass("btn-primary");
        $("#selMergeCameraIDDynamic").find(".js-remove-all").click();
        let mapDataArr = data.saveData;
        mapDataArr.forEach(item => {
            renderNodePage(item.arr, item.listArr, true, $('#saveNodeSearchDynamic'));
        })
    }
};

//动态厂家选择
$("#cjDynamicOne,#cjDynamicTwo").on("click", function () {
    if ($(this).prev().attr("isclick")) {
        return;
    }
    if ($(this).attr("id") == "cjDynamicTwo") {
        selectTypeDynamic = 2;
    }
    $("#dynamicsearchDynamic").click();
});

// 纯动态页面 点击上传图片
$('#usearchImgDynamic').find('.uploadFile').on('change.dynamicface', function () {
    if ($("#dynamicsearchDynamic").hasClass("hide") && $("#dynamicsearchDynamic").attr("type") != '624') {
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

        // 判断文件大小是否超过10M 
        if (fileSize > 10 * 1024 * 1024) {
            warningTip.say('上传文件过大,请上传不大于10M的文件');
            this.value = '';
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            var addimg = reader.result,
                $imgItem = $('#usearchImgDynamic').find('.add-image-item');
            html = createAddImageItem(addimg);
            _this.closest('.add-image-icon').before(html);
            $('#usearchImgDynamic').find('.uploadFile')[0].value = '';
            if ($imgItem.length > 5) {
                var clientH = $('#usearchImgDynamic')[0].clientHeight;
                $('#usearchImgDynamic').removeClass('scroll');
                $('#usearchImgDynamic').addClass('scroll');
                $('#usearchImgDynamic').animate({
                    'scrollTop': clientH
                }, 500);
            }
            imgDom(addimg, $('#dynamicsearchDynamic'), $("#usearchImgDynamic"), true);
            $("#dynamicsearchDynamic").removeClass("hide");
            $("#dynamicApply").addClass("hide");
        };
        reader.readAsDataURL(this.files[0]);
        $('#usearchImgDynamic').removeClass('center');
        $('#usearchImgDynamic').find('.add-image-icon').removeClass('add-image-new');
        $('#usearchImgDynamic').find('.add-image-box-text').addClass('hide');
        $("#usearchImgDynamic .add-image-icon").siblings('.add-image-item').removeClass('active');
    }
});

// 纯动态页面 点击左侧图片 切换图片选中状态
$('#usearchImgDynamic').on('click', '.add-image-item', function () {
    $(this).addClass('active').siblings('.add-image-item').removeClass('active');
    var $addImgBox = $(this).find('.add-image-img');
    if (!$addImgBox.attr('picId') || $addImgBox.attr('picstatus') != '1') {
        getPicId($addImgBox.attr('src'), $(this).attr('value'), $('#usearchImgDynamic')); // 获取图片的唯一picId
    } else {
        if ($addImgBox.attr("cache") != undefined) {
            //$("#allCountS").html('(' + $("#staticContentContainerS").find(`#factoryAlg${$addImgBox.attr("cache")}`).attr("allCountS") + ')');
            itemCache = $addImgBox.attr("cache");
            $("#imageCacheDynamicList").find(`#image-dynamic-list-${$addImgBox.attr("cache")}`).removeClass("hide").siblings().addClass("hide");
            $('#usearchImgDynamic').data("maskImg", $addImgBox.attr("src"));
            showSearchLimitDynamic($addImgBox.data());
            sortListDynamic = $("#image-dynamic-list-" + itemCache).data("sortListDynamic") && $("#image-dynamic-list-" + itemCache).data("sortListDynamic").length > 0 ? $("#image-dynamic-list-" + itemCache).data("sortListDynamic") : [];
            sortTimeListDynamic = $("#image-dynamic-list-" + itemCache).data("sortTimeListDynamic") && $("#image-dynamic-list-" + itemCache).data("sortTimeListDynamic").length > 0 ? $("#image-dynamic-list-" + itemCache).data("sortTimeListDynamic") : [];
            timeTogetherListDynamic = $("#image-dynamic-list-" + itemCache).data('timeTogetherListDynamic') && $("#image-dynamic-list-" + itemCache).data('timeTogetherListDynamic').length > 0 ? $("#image-dynamic-list-" + itemCache).data('timeTogetherListDynamic') : [];
            positionTogetherListDynamic = $("#image-dynamic-list-" + itemCache).data('positionTogetherListDynamic') && $("#image-dynamic-list-" + itemCache).data('positionTogetherListDynamic').length > 0 ? $("#image-dynamic-list-" + itemCache).data('positionTogetherListDynamic') : [];
            $("#courseAnalyseDynamic").addClass("disabled");
            if ($("#image-dynamic-list-" + itemCache).data('trakData') && $("#image-dynamic-list-" + itemCache).data('trakData').length > 0) {
                $("#courseAnalyseDynamic").removeClass("disabled");
            }

            //显示总数
            $('#sortTotalDynamic').html($("#search-infoDynamic" + itemCache).attr("sortTotal") ? `(${$("#search-infoDynamic" + itemCache).attr("sortTotal")})` : '');
            $('#sortByTimeTotalDynamic').html($("#sortByTimeWrapperDynamic" + itemCache).attr("sortbytimetotal") ? `(${$("#sortByTimeWrapperDynamic" + itemCache).attr("sortbytimetotal")})` : '');
            $('#timeTogetherTotalDynamic').html($("#timeTogetherWrapperDynamic" + itemCache).attr("timetogether") ? `(${$("#timeTogetherWrapperDynamic" + itemCache).attr("timetogether")})` : '');
            $('#positionTogetherTotalDynamic').html($("#positionTogetherWrapperDynamic" + itemCache).attr("positiontogether") ? `(${$("#positionTogetherWrapperDynamic" + itemCache).attr("positiontogether")})` : '');

            //console.log(sortListDynamic, sortTimeListDynamic, $("#image-dynamic-list-" + itemCache).data("sortTimeListDynamic"));
            //排序方式
            if ($("#imageCacheDynamicList").find(`#image-dynamic-list-${$addImgBox.attr("cache")}`).attr("sort") == 1) {  //相识度
                $("#sortByScoreDynamic").click();
            } else if ($("#imageCacheDynamicList").find(`#image-dynamic-list-${$addImgBox.attr("cache")}`).attr("sort") == 2) {  //时间排序
                $("#sortByTimeDynamic").click();
            } else if ($("#imageCacheDynamicList").find(`#image-dynamic-list-${$addImgBox.attr("cache")}`).attr("sort") == 3) {  //时间聚合
                $("#timeTogetherDynamic").click();
            } else if ($("#imageCacheDynamicList").find(`#image-dynamic-list-${$addImgBox.attr("cache")}`).attr("sort") == 4) {  //地点聚合
                $("#placeTogetherDynamic").click();
            }
        }
        getPowerUse('2', $("#commentSelectDynamic").find(".selectpicker").val(), $addImgBox.attr('picId'));
    }
}).on('dblclick', '.add-image-item', function (e) {
    var $targetImg = $('#usearchImgDynamic'),
        base64Img = $(this).find('img').attr('src');
    cutOutImage(base64Img, $targetImg);
})

// 纯动态页面 删除左侧图片
$('#usearchImgDynamic').on('click', '.aui-icon-delete-line', function (e) {
    e.stopPropagation();
    var father = $(this).closest('.add-image-item');
    var index = father.find(".add-image-img").attr("cache"),
        flag = false;  //判断删除的图片是否是最后检索的图片，是就把最新的选中图片变成最后检索图片
    $("#image-dynamic-list-" + index).remove();
    $('#current-page-dynamic').find(".card-img-hover").remove();
    if (father.find(".add-image-img").data("isAll") == '1') {
        flag = true;
    }
    father.remove();
    var $imgItem = $('#usearchImgDynamic').find('.add-image-item');
    if (!$('#usearchImgDynamic').find('.add-image-item.active').length) {
        $imgItem.eq(-1).addClass('active');
    }

    if ($imgItem.length < 6) {
        $('#usearchImgDynamic').removeClass('scroll'); // 是否需要滚动
    }
    if ($imgItem.length === 0) {
        $('#usearchImgDynamic').addClass('center');
        $('#usearchImgDynamic').find('.add-image-icon').addClass('add-image-new');
        $('#usearchImgDynamic').find('.add-image-box-text').removeClass('hide');
    }
    if (flag) {
        $('#usearchImgDynamic').find('.add-image-item.active .add-image-img').data("isAll", 1);
    }

    if (!$("#imageCacheDynamicList").find(".image-card-list.no-bottom-border").length) {
        $("#snappingWrap").find("#imageCacheDynamicList .flex-column-wrap.empty-wrap").removeClass("hide");
        $("#sortTotalDynamic").html("");
        $("#sortByTimeTotalDynamic").html("");
        $("#timeTogetherTotalDynamic").html("");
        $("#positionTogetherTotalDynamic").html("");
        allSelectedCardList = [];
        sortListDynamic = [];
        sortTimeListDynamic = [];
        timeTogetherListDynamic = [];
        positionTogetherListDynamic = [];
        $('#selectAllSnappingDynamic').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        $("#courseAnalyseDynamic").addClass("disabled");
    }
    $('#usearchImgDynamic').find('.add-image-item.active').click();
})

//身份证输入框回车事件
$("#current-page-dynamic").on('keydown', '#idcardsearchDynamic', function (e) {
    var code = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
    if (code == 13) {
        //findIdcard(e, $("#current-page-dynamic").find(".idcardSelect .ui-checkboxradio-label").hasClass("ui-checkboxradio-checked") ? "22" : "");
        findIdcard(e, $("#current-page-dynamic").find(".idcardSelect").val());
    }
})

//身份证输入框搜索点击事件
$("#current-page-dynamic").on("click", "#idcardsearchIconDynamic", function (e) {
    var e = jQuery.Event("keydown");
    e.keyCode = 13;
    e.which = 40;
    $("#idcardsearchDynamic").trigger(e);
})

// 动态库 点击展开大图
$('#current-page-dynamic').on('click', '.showBigImgDynamic .image-card-img', function (e) {
    $('.layer .aui-icon-not-through').click();
    var $this = $(this), // 图片
        $showBigImgDom = $this.closest('.showBigImgDynamic'), // 当前检索类型的容器
        showBigImgId = $showBigImgDom.attr('id'), // 各检索类型容器id
        thisIndex = $this.closest('.image-card-wrap').index(), // 图片索引
        $targetImg = $('#usearchImgDynamic'); // 上传图片容器
    // 判断是否为聚合弹窗
    if (showBigImgId === 'timeTogetherWrapperDynamic' + itemCache || showBigImgId === 'positionTogetherWrapperDynamic' + itemCache) {
        var $imgWrap = $showBigImgDom.find('.image-card-list-wrap'), // 所有分组的列表
            $showMore = $this.closest('.loadSpread'), // 当前分组的查看更多
            showMoreIndex = $showMore.index(), // 当前分组的索引
            $el = $imgWrap.eq(showMoreIndex), // 当前分组的图片列表
            eleId = $el.attr('id'); // 当前分组列表的元素id
        showBigImgId = eleId;
        setTimeout(() => {
            createBigImgMask($el, eleId, thisIndex, $targetImg, e); // 聚合展开大图
        }, 300);
    } else {
        setTimeout(() => {
            createBigImgMask($showBigImgDom, showBigImgId, thisIndex, $targetImg, e); // 动态 非聚合 展开大图
        }, 300);
    }
});

//纯动态检索日历
$('#searchMerge_TimeDynamic').find('.datepicker-input').off('blur').on('blur', function () {
    //开始时间
    var startTime = $('#searchMerge_TimeDynamic').find('.datepicker-input').eq(0).val();
    // 结束时间
    var endTime = $('#searchMerge_TimeDynamic').find('.datepicker-input').eq(1).val();

    var startDate = new Date(Date.parse(startTime.replace(/-/g, "/"))).getTime();
    var endDate = new Date(Date.parse(endTime.replace(/-/g, "/"))).getTime();
    // 开始时间与结束时间间隔天数
    //var _counts = (endTime.substring(0, 4) - startTime.substring(0, 4)) * 360 + (endTime.substring(5, 7) - startTime.substring(5, 7)) * 30 + (endTime.substring(8, 10) - startTime.substring(8, 10));
    var _counts = Math.abs(startDate - endDate) / (1000 * 60 * 60 * 24);
    changeActiveMergeDynamic(_counts);
});

// 纯动态页面 左侧 动态库 点击区域/地图中的区域按钮
$("#searchSelectDynamic").on("click", function () {
    $("#selMergeCameraIDDynamic .searchArea").show();
    $("#selMergeCameraIDDynamic .searchMap").hide();
    $("#searchSelectDynamic").addClass("btn-primary");
    $("#searchMapDynamic").removeClass("btn-primary");
    if ($("#searchResultFlexDynamic").find("i").attr("class") === "aui-icon-drop-right") {
        $("#searchResultFlexDynamic").find("i").attr("class", "aui-icon-drop-left");
    }
    $('#snappingWrap').animate({
        "width": "98%"
    }, 200);
    $('#searchResultFlexDynamic').animate({
        "left": "98%"
    }, 200);
});

// 纯动态页面 左侧 动态库 点击区域/地图中的地图按钮
$("#searchMapDynamic").on("click", function () {
    $("#selMergeCameraIDDynamic .searchArea").hide();
    $("#selMergeCameraIDDynamic .searchMap").show();
    $("#searchSelectDynamic").removeClass("btn-primary");
    $("#searchMapDynamic").addClass("btn-primary");
    if ($("#searchResultFlexDynamic").find("i").attr("class") === "aui-icon-drop-left") {
        $("#searchResultFlexDynamic").find("i").attr("class", "aui-icon-drop-right");
    }
    $('#snappingWrap').animate({
        "width": "0"
    }, 200);
    $('#searchResultFlexDynamic').animate({
        "left": "0"
    }, 200);
});

//每次搜索都记录上一次的排序类型
function saveSortTypeDynamic() {
    //搜索图片的时候加入缓存
    if ($('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').attr("cache") == undefined) {
        //判断是否缓存是否超过，不超过依次存入,超过顶掉最前面的那个
        if (cacheArr.length >= cacheSortArr.length) {
            itemCache = cacheArr.shift();
            $("#imageCacheDynamicList").find(`#image-dynamic-list-${itemCache}`).remove();
            $('#usearchImgDynamic').find('.add-image-img.cache' + itemCache).removeClass("cache" + itemCache).removeAttr("cache");
        } else if (cacheArr.length == 0) {
            itemCache = 0;
        } else {
            for (let i = 0; i < cacheSortArr.length; i++) {
                if (cacheArr.indexOf(cacheSortArr[i]) < 0) {
                    itemCache = cacheSortArr[i];
                    break;
                }
            }
        }
        cacheArr.push(itemCache);
        $('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').addClass("cache" + itemCache).attr("cache", itemCache);
    } else {
        itemCache = $('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').attr("cache");
        $("#imageCacheDynamicList").find(`#image-dynamic-list-${itemCache}`).remove();
    }
    var html = `<div class="image-card-list no-bottom-border" id="image-dynamic-list-${itemCache}">
                    <ul class="image-card-list-wrap showBigImgDynamic wrap-empty-center cacheItem" id="search-infoDynamic${itemCache}"></ul>
                    <ul class="image-card-list-wrap display-none showBigImgDynamic wrap-empty-center cacheItem" id="sortByTimeWrapperDynamic${itemCache}"></ul>
                    <div class="display-none showBigImgDynamic wrap-empty-center cacheItem" id="timeTogetherWrapperDynamic${itemCache}"></div>
                    <div class="display-none showBigImgDynamic wrap-empty-center cacheItem" id="positionTogetherWrapperDynamic${itemCache}"></div>
                </div>`;
    $("#imageCacheDynamicList").append(html);
    $("#imageCacheDynamicList").find(`#image-dynamic-list-${itemCache}`).siblings().addClass("hide");
    $("#imageCacheDynamicList").find('#image-dynamic-list').remove();  //如果有无图检索清空
    $('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').data(dynamicDataDynamic);
    for (let i = 0; i < $("#imageCacheDynamicList").find(".image-card-list.no-bottom-border").length; i++) {
        let cacheIndex = $("#imageCacheDynamicList").find(".image-card-list.no-bottom-border").eq(i).attr("sort");
        if (cacheIndex == 1) { //相似度
            $("#imageCacheDynamicList").find(".image-card-list.no-bottom-border").eq(i).removeData("sortTimeListDynamic");
            $("#imageCacheDynamicList").find(".image-card-list.no-bottom-border").eq(i).removeData("timeTogetherListDynamic");
            $("#imageCacheDynamicList").find(".image-card-list.no-bottom-border").eq(i).removeData("positionTogetherListDynamic");
        } else if (cacheIndex == 2) {   //时间
            $("#imageCacheDynamicList").find(".image-card-list.no-bottom-border").eq(i).removeData("sortListDynamic");
            $("#imageCacheDynamicList").find(".image-card-list.no-bottom-border").eq(i).removeData("timeTogetherListDynamic");
            $("#imageCacheDynamicList").find(".image-card-list.no-bottom-border").eq(i).removeData("positionTogetherListDynamic");
        } else if (cacheIndex == 3) { //时间聚合
            $("#imageCacheDynamicList").find(".image-card-list.no-bottom-border").eq(i).removeData("sortListDynamic");
            $("#imageCacheDynamicList").find(".image-card-list.no-bottom-border").eq(i).removeData("sortTimeListDynamic");
            $("#imageCacheDynamicList").find(".image-card-list.no-bottom-border").eq(i).removeData("positionTogetherListDynamic");
        } else if (cacheIndex == 4) { //地点聚合
            $("#imageCacheDynamicList").find(".image-card-list.no-bottom-border").eq(i).removeData("sortListDynamic");
            $("#imageCacheDynamicList").find(".image-card-list.no-bottom-border").eq(i).removeData("sortTimeListDynamic");
            $("#imageCacheDynamicList").find(".image-card-list.no-bottom-border").eq(i).removeData("timeTogetherListDynamic");
        }

        $("#imageCacheDynamicList").find(".image-card-list.no-bottom-border").eq(i).find(".cacheItem").each((index, item) => {
            if (index != parseInt(cacheIndex) - 1) {
                $(item).empty();
            }
        })
    }
    //最后一个检索结果的标志
    for (let i = 0; i < $('#usearchImgDynamic').find('.add-image-item').length; i++) {
        $('#usearchImgDynamic').find('.add-image-item').eq(i).find('.add-image-img').data({
            isAll: 0
        })
    }
    $('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').data({
        isAll: 1
    })

    if (selectTypeDynamic == 2) { //按相似度
        $("#sortByScoreDynamic").click();
    } else if (selectTypeDynamic == 1) { //按时间
        $('#sortByTimeDynamic').click();
    } else if (selectTypeDynamic == 3) { //按时间聚合
        $("#timeTogetherDynamic").click();
    } else if (selectTypeDynamic == 4) { //按地点聚合
        $("#placeTogetherDynamic").click();
    }
    $('#aui-icon-importDynamic').removeClass('text-disabled');
}

// 纯动态页面 点击搜索 加载右侧内容区域照片
$('#dynamicsearchDynamic').click(function () {
    if ($("#usearchImgDynamic").find(".add-image-item").length > 0 && $("#usearchImgDynamic").find(".add-image-item.active .add-image-img").attr("picStatus") == '0') {
        return;
    }
    // 防止暴力点击 点击一次之后 2s后才能第二次点击
    $('#dynamicsearchDynamic').attr('disabled', 'disabled')
    setTimeout(function () {
        $('#dynamicsearchDynamic').removeAttr('disabled')
    }, 1000)

    // 判断是否选择检索任务
    if (!$("#commentSelectDynamic").closest('.form-group').hasClass('hide') && $("#commentSelectDynamic").find(".selectpicker").val() == '') {
        if ($("#usearchImgDynamic").find(".add-image-item.active .add-image-img").attr("zt") == "1") {
            $("#commentSelectDynamic").next().addClass("hide");
        } else {
            $("#commentSelectDynamic").next().removeClass("hide");
            return;
        }
    } else {
        $("#commentSelectDynamic").next().addClass("hide");
    }
    // if ($("#usearchImgDynamic").find(".add-image-item.active").length > 0 && !$("#usearchImgDynamic").find(".add-image-item.active .add-image-img").data("searchComments")) {  //有图检索且该检索图片没有检索事由的情况下
    //     $('#dynamicModalType').val(null);
    //     $("#dynamicModalType").selectpicker('refresh');
    //     $("#dynamicModalReason").val("");
    //     $("#dynamicSearchModal").modal("show");

    //     return;
    // }
    // 如果检索结果内容区不显示 显示内容区域
    if ($('#current-page-dynamic .result-wrap').width() === 0) { // 点击检索之后 默认展开 如果检索图片结果容器收缩
        if ($("#searchResultFlexDynamic").find("i").attr("class") === "aui-icon-drop-right") { // 如果展开控制框箭头向右
            $("#searchResultFlexDynamic").find("i").attr("class", "aui-icon-drop-left"); // 展开控制框箭头向左
        }

        // 检索结果内容区展开
        $('#snappingWrap').animate({
            "width": "98%"
        }, 200);
        // 展开收缩控制框右移
        $('#searchResultFlexDynamic').animate({
            "left": "98%"
        }, 200);
    }

    for (let i in $("#mergeTimeDynamic").find(".btn")) {
        if ($("#mergeTimeDynamic").find(".btn").eq(i).hasClass("btn-primary")) {
            searchRealTime($("#searchMerge_TimeDynamic"), i);
        }
    }
    selectTypeDynamic = selectTypeDynamic ? selectTypeDynamic : 2; // 按相似度检索
    sortListDynamic = [];
    sortTimeListDynamic = [];
    timeTogetherListDynamic = [];
    positionTogetherListDynamic = [];
    allSelectedCardList = [];
    var $maskDom = $('body').find('.mask-container-fixed').not('.modal-control'),
        typeSearch = $("#selMergeCameraIDDynamic .searchArea").css("display") === 'none' ? 'map' : 'area'; // 判断是地图还是区域
    dynamicDataDynamic = getSearchDataDynamic(typeSearch).dynamic;
    searchFlag = true;
    if ($maskDom.length > 0) {
        $maskDom.remove(); // 清除查看大图节点
    }
    $('#sortListDynamic').text('按相似度排序').removeClass('active');
    //$('#search-infoDynamic' + itemCache).removeClass('display-none').siblings('.wrap-empty-center').addClass('display-none');
    $('#sortByScoreDynamic').addClass('active').siblings('.dropdown-item').removeClass('active');
    $('#courseAnalyseDynamic').addClass('disabled').data({
        'trakData': []
    });
    $('#sortTotalDynamic').removeClass('hide').text('').siblings('.card-subtitle').addClass('hide').text('');
    $('#selectAllSnappingDynamic').find('.ui-checkboxradio-checked').removeClass('ui-checkboxradio-checked');

    // 清空检索结果
    // $('#search-infoDynamic' + itemCache).empty();
    // $('#sortByTimeWrapperDynamic' + itemCache).empty();
    // $('#timeTogetherWrapperDynamic' + itemCache).empty();
    // $('#positionTogetherWrapperDynamic' + itemCache).empty();
    if (dynamicDataDynamic.base64Img) {
        if ($("#usearchImgDynamic").find(".add-image-item.active .add-image-img").attr("picReason") != '1') { //判断是否是第一次请求
            // 给图片绑定静态id
            var picBase64 = dynamicDataDynamic.base64Img;

            if (picBase64.indexOf("http") == 0) { //url
                var picIdPortData = {
                    url: picBase64,
                    staticId: dynamicDataDynamic.selectImgId,
                    moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                    opType: $("#usearchImgDynamic").find(".add-image-item.active .add-image-img").data("opType"),
                    searchComments: $("#usearchImgDynamic").find(".add-image-item.active .add-image-img").data("searchComments")
                };
            } else { //base64
                var picIdPortData = {
                    base64: picBase64,
                    staticId: dynamicDataDynamic.selectImgId,
                    moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                    opType: $("#usearchImgDynamic").find(".add-image-item.active .add-image-img").data("opType"),
                    searchComments: $("#usearchImgDynamic").find(".add-image-item.active .add-image-img").data("searchComments")
                };
            }

            var picIdPort = 'v2/faceRecog/uploadImage',
                picIdSuccessFunc = function (data) {
                    if (data.code == '200') {
                        dynamicDataDynamic.selectImgId = data.staticId;
                        $("#usearchImgDynamic").find(".add-image-item.active .add-image-img").attr("picId", data.staticId);
                        $("#usearchImgDynamic").find(".add-image-item.active .add-image-img").attr('picStatus', '1'); //图片类型1.成功2.小图抠图
                        $("#usearchImgDynamic").find(".add-image-item.active .add-image-img").attr("picReason", "1");
                        var searchPort = 'v3/myApplication/getIncidentInfo',
                            searchData = {
                                "types": ['2'],
                                "incidentId": $("#commentSelectDynamic").find(".selectpicker").val(),
                                "staticId": $('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId')
                            },
                            searchSuccessFunc = function (data) {
                                if (data.code === '200') {
                                    $("#dynamicsearchDynamic").attr("type", "");
                                    // 重新请求 数据相似度排序
                                    //searchTimeSortDataDynamic(dynamicData)
                                    saveSortTypeDynamic();
                                } else if (data.code === '624') { //特殊人员
                                    $("#dynamicsearchDynamic").addClass("hide");
                                    $("#dynamicApply").removeClass("hide");
                                    //type为624代表是特殊人员上传图片等不影响
                                    $("#dynamicsearchDynamic").attr("type", "624");
                                    warningTip.say('该人员为敏感人员，请申请敏感人员查询权限审批通过后检索');
                                } else {
                                    $("#dynamicsearchDynamic").attr("type", "");
                                    warningTip.say("获取检索权限失败,请稍后再试");
                                }
                            }
                        loadData(searchPort, true, searchData, searchSuccessFunc);
                    } else {
                        warningTip.say(data.message);
                        $("#usearchImgDynamic").find(".add-image-item.active .add-image-img").attr("picStatus", '0');
                    }
                };
            loadData(picIdPort, false, picIdPortData, picIdSuccessFunc);
        } else {
            saveSortTypeDynamic();
        }
    } else {
        itemCache = '';
        selectTypeDynamic = 1;
        var html = `<div class="image-card-list no-bottom-border" id="image-dynamic-list">
                        <ul class="image-card-list-wrap display-none showBigImgDynamic wrap-empty-center cacheItem" id="sortByTimeWrapperDynamic"></ul>
                    </div>`;
        $("#imageCacheDynamicList").find("#image-dynamic-list").remove();
        $("#imageCacheDynamicList").append(html);
        $("#imageCacheDynamicList").find("#image-dynamic-list").siblings().addClass("hide");
        //peopleSnappingSearchTimeDynamic(dynamicDataDynamic);
        $('#sortByTimeDynamic').click();
        $('#sortListDynamic').text('按时间排序');
        $('#sortByTimeDynamic').addClass('active').siblings().removeClass('active').addClass('text-disabled');
        $('#sortByTimeDynamic').prev().removeClass('text-disabled');
        $('#sortByTimeWrapperDynamic' + itemCache).removeClass('display-none').siblings('.wrap-empty-center').addClass('display-none');
        $('#aui-icon-importDynamic').addClass('text-disabled');
    }
    // 无检索图片条件状况下
    if (dynamicDataDynamic.base64Img === '') {
        $('#sortByScoreDynamic').addClass('text-disabled');
        $('#timeTogetherDynamic').addClass('text-disabled');
        $('#placeTogetherDynamic').addClass('text-disabled');
        $('#selectAllSnappingDynamic').children('label').addClass('text-disabled');
        $('#aui-icon-importDynamic').addClass('text-disabled');
    } else {
        $('#sortByScoreDynamic').removeClass('text-disabled').siblings().removeClass('text-disabled');
        $('#selectAllSnappingDynamic').children('label').removeClass('text-disabled');

        if (dynamicDataDynamic.nodeType == '2') {
            $("#timeTogetherDynamic").addClass('text-disabled');
            $("#timeTogetherDynamic").prev().addClass('text-disabled');
            $("#placeTogetherDynamic").addClass('text-disabled');
            $("#placeTogetherDynamic").prev().addClass('text-disabled');
        } else {
            $("#timeTogetherDynamic").removeClass('text-disabled');
            $("#timeTogetherDynamic").prev().removeClass('text-disabled');
            $("#placeTogetherDynamic").removeClass('text-disabled');
            $("#placeTogetherDynamic").prev().removeClass('text-disabled');
        }
    }
});

// 重置
$(document).on('click', '#resetBtnDynamic', function () {
    resetSearchDataDynamic();
});

// 纯动态页面 检索结果 展开收缩
$("#searchResultFlexDynamic").on("click", function () {
    if ($(this).find("i").attr("class") === "aui-icon-drop-left") {
        $(this).find("i").attr("class", "aui-icon-drop-right");
        $('#snappingWrap').animate({
            "width": "0"
        }, 200);
        $('#searchResultFlexDynamic').animate({
            "left": "0"
        }, 200);
        var searchMapDynamicIframe = document.getElementById('search_map_iframeDynamic');
        var targetOrigin = mapUrl + 'peopleCity.html';
        window.setTimeout(function () {
            searchMapDynamicIframe.contentWindow.postMessage({
                type: 'fullExtent'
            }, targetOrigin);
        }, 300)
    } else {
        $(this).find("i").attr("class", "aui-icon-drop-left");
        $('#snappingWrap').animate({
            "width": "98%"
        }, 200);
        $('#searchResultFlexDynamic').animate({
            "left": "98%"
        }, 200);
    }
})

// 时间控件构建 以及相关事件
$('#mergeTimeDynamic').find('button').on('click', function () {
    var date = $(this).data().date;
    $(this).addClass('btn-primary').siblings().removeClass('btn-primary');
    initDatePicker1($('#searchMerge_TimeDynamic'), -date, true);
})

// 纯动态页面 点击刷新按钮
$('#refreshBtnDynamic').on('click', function () {
    $('#dynamicsearchDynamic').click();
});

// 按时间排序
$(document).on('click', '#sortByTimeDynamic', function () {
    selectTypeDynamic = 1;
    if (!$('#usearchImgDynamic').find('.add-image-item.active').length && !$('#usearchImgDynamic').find('.add-image-item.active .add-image-img').attr("cache")) {
        peopleSnappingSearchTimeDynamic(dynamicDataDynamic, ''); // 按时间排序
    } else {
        $("#imageCacheDynamicList").find(`#image-dynamic-list-${itemCache}`).attr("sort", 2);
        let dynamicData = $('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').data();
        //if ($('#sortByTimeWrapperDynamic' + itemCache).find('.image-card-wrap').length == 0) {
        if (!$("#image-dynamic-list-" + itemCache).data("sortTimeListDynamic")) {
            if (dynamicData) {
                peopleSnappingSearchTimeDynamic(dynamicData, itemCache); // 按时间排序
            } else if (itemCache == '') {
                peopleSnappingSearchTimeDynamic(dynamicDataDynamic, itemCache); // 按时间排序
            }
        }

        $('#search-infoDynamic' + itemCache).addClass('display-none');
        $('#sortByTimeWrapperDynamic' + itemCache).removeClass('display-none');
        $('#timeTogetherWrapperDynamic' + itemCache).addClass('display-none');
        $('#positionTogetherWrapperDynamic' + itemCache).addClass('display-none');
        //移除卡片选中转态
        $('#current-page-dynamic .image-card-wrap.active').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        $('#selectAllSnappingDynamic').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        $('#paginationTimeWrapDynamic' + itemCache).removeClass('display-none');
        $('#paginationScoreWrapDynamic' + itemCache).addClass('display-none');
        var allSelectedCardList = $("#image-dynamic-list-" + itemCache).data('trakData') && $("#image-dynamic-list-" + itemCache).data('trakData').length > 0 ? $("#image-dynamic-list-" + itemCache).data('trakData') : [];
        allSelectedCardList.forEach(function (item) {
            sortTimeListDynamic.forEach(function (v, n) {
                if (v.picId === item.picId) {
                    $('#sortByTimeWrapperDynamic' + itemCache).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                }
            })
        });
        judgeSelectePageAll($('#sortByTimeWrapperDynamic' + itemCache));
        $(this).closest('.operate-item').siblings('.operate-item').find('.text-link').removeClass('active');
        $('#sortByTimeTotalDynamic').removeClass('hide');
        $('#sortTotalDynamic').addClass('hide');
        $('#timeTogetherTotalDynamic').addClass('hide');
        $('#positionTogetherTotalDynamic').addClass('hide');

        //当前是缓存图片清除掉别的排序结果
        if (dynamicData && !dynamicData.isAll) {
            $('#search-infoDynamic' + itemCache).empty();
            $('#timeTogetherWrapperDynamic' + itemCache).empty();
            $('#positionTogetherWrapperDynamic' + itemCache).empty();

            $("#image-dynamic-list-" + itemCache).removeData("sortListDynamic");
            $("#image-dynamic-list-" + itemCache).removeData("timeTogetherListDynamic");
            $("#image-dynamic-list-" + itemCache).removeData("positionTogetherListDynamic");
        }
    }
});

// 按相似度排序
$(document).on('click', '#sortByScoreDynamic', function () {
    selectTypeDynamic = 2;
    if (!$('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').attr("cache")) {
        $("#dynamicsearchDynamic").click();
    } else {
        //记录要缓存哪种排序
        $("#imageCacheDynamicList").find(`#image-dynamic-list-${itemCache}`).attr("sort", 1);
        let dynamicData = $('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').data();
        //if ($('#imageCacheDynamicList').find(`#search-infoDynamic${itemCache} .image-card-wrap`).length == 0) {
        if (!$("#image-dynamic-list-" + itemCache).data('sortListDynamic')) {
            if (dynamicData) {
                peopleSnappingSearchDynamic(dynamicData, itemCache); // 按时间排序
            }
        }

        $('#search-infoDynamic' + itemCache).removeClass('display-none');
        $('#sortByTimeWrapperDynamic' + itemCache).addClass('display-none');
        $('#timeTogetherWrapperDynamic' + itemCache).addClass('display-none');
        $('#positionTogetherWrapperDynamic' + itemCache).addClass('display-none');
        $(this).closest('.operate-item').siblings('.operate-item').find('.text-link').removeClass('active');
        $('#current-page-dynamic .image-card-wrap.active').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        $('#selectAllSnappingDynamic').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        $('#paginationTimeWrapDynamic' + itemCache).addClass('display-none');
        $('#paginationScoreWrapDynamic' + itemCache).removeClass('display-none');
        var allSelectedCardList = $("#image-dynamic-list-" + itemCache).data('trakData') && $("#image-dynamic-list-" + itemCache).data('trakData').length > 0 ? $("#image-dynamic-list-" + itemCache).data('trakData') : [];
        allSelectedCardList.forEach(function (item) {
            sortListDynamic.forEach(function (v, n) {
                if (v.picId === item.picId) {
                    $('#search-infoDynamic' + itemCache).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                }
            })
        });
        judgeSelectePageAll($('#search-infoDynamic' + itemCache));
        judgeSelecteAll($(this));
        $('#sortByTimeTotalDynamic').addClass('hide');
        $('#sortTotalDynamic').removeClass('hide');
        $('#timeTogetherTotalDynamic').addClass('hide');
        $('#positionTogetherTotalDynamic').addClass('hide');

        //当前是缓存图片清除掉别的排序结果
        if (!dynamicData.isAll) {
            $('#sortByTimeWrapperDynamic' + itemCache).empty();
            $('#timeTogetherWrapperDynamic' + itemCache).empty();
            $('#positionTogetherWrapperDynamic' + itemCache).empty();

            $("#image-dynamic-list-" + itemCache).removeData("sortTimeListDynamic");
            $("#image-dynamic-list-" + itemCache).removeData("timeTogetherListDynamic");
            $("#image-dynamic-list-" + itemCache).removeData("positionTogetherListDynamic");
        }
    }
});

// 按时间聚合
$(document).on('click', '#timeTogetherDynamic', function () {
    selectTypeDynamic = 3;
    if (!$('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').attr("cache")) {
        $("#dynamicsearchDynamic").click();
    } else {
        $("#imageCacheDynamicList").find(`#image-dynamic-list-${itemCache}`).attr("sort", 3);
        let dynamicData = $('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').data();
        if (!$(this).hasClass('text-disabled')) {
            $('#selectAllSnappingDynamic').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            $('#current-page-dynamic .image-card-wrap.active').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            //if ($('#timeTogetherWrapperDynamic' + itemCache).find('.image-card-list').length == 0) {
            if (!$("#image-dynamic-list-" + itemCache).data('timeTogetherListDynamic')) {
                if (dynamicData) {
                    togetherSearchDynamic(dynamicData, itemCache, 1); // 获取聚合数据 渲染聚合页面 时间聚合+地点聚合
                }
            } else {
                var allSelectedCardList = $("#image-dynamic-list-" + itemCache).data('trakData') && $("#image-dynamic-list-" + itemCache).data('trakData').length > 0 ? $("#image-dynamic-list-" + itemCache).data('trakData') : [];
                if (timeTogetherListDynamic) {
                    timeTogetherListDynamic.forEach(function (el, index) {
                        allSelectedCardList.forEach(function (item) {
                            el.list.forEach(function (v, n) {
                                if (v.picId === item.picId) {
                                    $('#timeTogetherWrapperDynamic' + itemCache).find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                }
                            })
                        })
                    });
                }
                judgeSelectePageAll($('#timeTogetherWrapperDynamic' + itemCache));
                $('#timeTogetherWrapperDynamic' + itemCache).find('.image-card-list').each(function (index, el) {
                    judgeSelecteAll($(el));
                });
            }

            var $this = $(this),
                $operateItem = $this.closest('.operate-item').siblings('.operate-item');
            $('#search-infoDynamic' + itemCache).addClass('display-none');
            $('#sortByTimeWrapperDynamic' + itemCache).addClass('display-none');
            $('#timeTogetherWrapperDynamic' + itemCache).removeClass('display-none').show();
            $('#positionTogetherWrapperDynamic' + itemCache).addClass('display-none');
            $this.addClass('active');
            $this.siblings('.text-link').removeClass('active');
            $operateItem.find('.nav-link').removeClass('active');
            $('#paginationTimeWrapDynamic' + itemCache).addClass('display-none');
            $('#paginationScoreWrapDynamic' + itemCache).addClass('display-none');
            pageMergeType = 1;
            $('#sortByTimeTotalDynamic').addClass('hide');
            $('#sortTotalDynamic').addClass('hide');
            $('#timeTogetherTotalDynamic').removeClass('hide');
            $('#positionTogetherTotalDynamic').addClass('hide');
        }
    }
});

// 按地点聚合
$(document).on('click', '#placeTogetherDynamic', function () {
    selectTypeDynamic = 4;
    if (!$('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').attr("cache")) {
        $("#dynamicsearchDynamic").click();
    } else {
        $("#imageCacheDynamicList").find(`#image-dynamic-list-${itemCache}`).attr("sort", 4);
        let dynamicData = $('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').data();
        if (!$(this).hasClass('text-disabled')) {
            $('#selectAllSnappingDynamic').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            $('#current-page-dynamic .image-card-wrap.active').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            //if ($('#positionTogetherWrapperDynamic' + itemCache).find('.image-card-list').length == 0) {
            if (!$("#image-dynamic-list-" + itemCache).data('positionTogetherListDynamic')) {
                if (dynamicData) {
                    togetherSearchDynamic(dynamicData, itemCache, 2); // 获取聚合数据 渲染聚合页面 时间聚合+地点聚合
                }
            } else {
                var allSelectedCardList = $("#image-dynamic-list-" + itemCache).data('trakData') && $("#image-dynamic-list-" + itemCache).data('trakData').length > 0 ? $("#image-dynamic-list-" + itemCache).data('trakData') : [];
                if (positionTogetherListDynamic) {
                    positionTogetherListDynamic.forEach(function (el, index) {
                        allSelectedCardList.forEach(function (item) {
                            el.list.forEach(function (v, n) {
                                if (v.picId === item.picId) {
                                    $('#positionTogetherWrapperDynamic' + itemCache).find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                }
                            })
                        })
                    });
                }
                judgeSelectePageAll($('#positionTogetherWrapperDynamic' + itemCache));
                $('#positionTogetherWrapperDynamic' + itemCache).find('.image-card-list').each(function (index, el) {
                    judgeSelecteAll($(el));
                });
            }

            var $this = $(this),
                $operateItem = $this.closest('.operate-item').siblings('.operate-item');
            $('#search-infoDynamic' + itemCache).addClass('display-none');
            $('#timeTogetherWrapperDynamic' + itemCache).addClass('display-none');
            $('#sortByTimeWrapperDynamic' + itemCache).addClass('display-none');
            $('#positionTogetherWrapperDynamic' + itemCache).removeClass('display-none').show();
            $this.addClass('active');
            $this.siblings('.text-link').removeClass('active');
            $operateItem.find('.nav-link').removeClass('active');
            $('#paginationTimeWrapDynamic').addClass('display-none');
            $('#paginationScoreWrapDynamic').addClass('display-none');
            pageMergeType = 2;
            $('#sortByTimeTotalDynamic').addClass('hide');
            $('#sortTotalDynamic').addClass('hide');
            $('#timeTogetherTotalDynamic').addClass('hide');
            $('#positionTogetherTotalDynamic').removeClass('hide');
        }
    }
});

// 纯动态页面 点击轨迹分析按钮
$('#courseAnalyseDynamic').on('click', function () {
    var data = $("#image-dynamic-list-" + itemCache).data('trakData');
    if (!dynamicDataDynamic.base64Img || $('#courseAnalyseDynamic').hasClass('disabled')) {
        return;
    }
    if (data.length === 0) {
        warningTip.say('请选择图片')
    } else {
        initTimeLine(data, $('#auiTimeLineDynamic'));
        $('#current-page-dynamic').addClass('display-none');
        $('#currentPagePathDynamic').removeClass('display-none');
    }
})

// 动态检索 点击图片上的多选
$("#current-page-dynamic").on('click', '.image-card-list .image-card-box .image-checkbox-wrap', function (e) {
    e.stopPropagation;
    var $this = $(this).find('.ui-checkboxradio-label'), // 多选框
        index = $this.closest('.image-card-wrap').index(), // 当前图片索引
        allSelectedCardList = $("#image-dynamic-list-" + itemCache).data('trakData') && $("#image-dynamic-list-" + itemCache).data('trakData').length > 0 ? $("#image-dynamic-list-" + itemCache).data('trakData') : [];
    // 取消选中
    if ($this.hasClass('ui-checkboxradio-checked')) {
        // 聚合分组 去掉自身 + 标题中的全选
        $this.removeClass('ui-checkboxradio-checked').closest('.image-card-list').find('.image-card-list-title .ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        // 动态库 去掉功能区全选
        $('#selectAllSnappingDynamic').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        // 本身去掉选中状态
        $this.closest('.image-card-wrap').removeClass('active');
        // 在所有选中图片中 去掉此图片
        if (selectTypeDynamic === 1) { // 按时间排序
            allSelectedCardList.map(function (e, n) {
                if (e.picId === sortTimeListDynamic[index].picId) {
                    allSelectedCardList.splice(n, 1);
                }
            })
        } else if (selectTypeDynamic === 2) { // 按相似度排序
            allSelectedCardList.map(function (e, n) {
                if (e.picId === sortListDynamic[index].picId) {
                    allSelectedCardList.splice(n, 1);
                }
            })
        } else if (selectTypeDynamic === 3) { // 按时间聚合
            var rowIndex = $this.closest('.image-card-list').index(); // 时间聚合 分组的索引
            allSelectedCardList.map(function (e, n) {
                if (e.picId === timeTogetherListDynamic[rowIndex].list[index].picId) {
                    allSelectedCardList.splice(n, 1);
                }
            })
        } else if (selectTypeDynamic == 4) { // 按地点聚合
            var rowIndex = $this.closest('.image-card-list').index(); // 地点聚合 分组的索引
            allSelectedCardList.map(function (e, n) {
                if (e.picId === positionTogetherListDynamic[rowIndex].list[index].picId) {
                    allSelectedCardList.splice(n, 1);
                }
            })
        }
    } else { // 选中
        $this.addClass('ui-checkboxradio-checked').closest('.image-card-wrap').addClass('active'); // 多选框选中状态
        // 全选数据赋值 判断功能区是否需全选 判断聚合分组标题是否需全选
        if (selectTypeDynamic === 1) { // 按时间排序
            allSelectedCardList.push(sortTimeListDynamic[index]);
            judgeSelectePageAll($('#sortByTimeWrapperDynamic' + itemCache));
        } else if (selectTypeDynamic === 2) { // 按相似度排序
            allSelectedCardList.push(sortListDynamic[index]);
            judgeSelectePageAll($('#search-infoDynamic' + itemCache));
        } else if (selectTypeDynamic === 3) { // 按时间聚合
            var rowIndex = $this.closest('.image-card-list').index();
            allSelectedCardList.push(timeTogetherListDynamic[rowIndex].list[index]);
            judgeSelectePageAll($('#timeTogetherWrapperDynamic' + itemCache));
            judgeSelecteAll($this.closest('.image-card-list'));
        } else if (selectTypeDynamic === 4) { // 按地点聚合
            var rowIndex = $this.closest('.image-card-list').index();
            allSelectedCardList.push(positionTogetherListDynamic[rowIndex].list[index]);
            judgeSelectePageAll($('#positionTogetherWrapperDynamic' + itemCache));
            judgeSelecteAll($this.closest('.image-card-list'));
        }
    }
    // 所有选中数据 去重
    allSelectedCardList = unique(allSelectedCardList);
    // 轨迹分析按钮 是否可用
    if (allSelectedCardList.length > 0) {
        $('#courseAnalyseDynamic').removeClass('disabled');
    } else {
        $('#courseAnalyseDynamic').addClass('disabled');
    }
    // 将所有选中的图片数据 绑定在轨迹分析按钮上
    $("#image-dynamic-list-" + itemCache).data({
        'trakData': allSelectedCardList
    });
});

// 聚合 点击分组标题前的全选
$('#current-page-dynamic').on('click', '.image-card-list .image-card-list-title .image-checkbox-wrap', function (e) {
    e.stopPropagation;
    var $this = $(this).find('.ui-checkboxradio-label'), // 当前多选框
        allSelectedCardList = $("#image-dynamic-list-" + itemCache).data('trakData') && $("#image-dynamic-list-" + itemCache).data('trakData').length > 0 ? $("#image-dynamic-list-" + itemCache).data('trakData') : []; // 被选中的所有数据
    // 取消全选
    if ($this.hasClass('ui-checkboxradio-checked')) {
        $('#selectAllSnappingDynamic').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 去掉功能区全选
        // 去掉分组下 所有图片激活状态和选中状态
        $this.removeClass('ui-checkboxradio-checked').closest('.image-card-list').find('.image-card-wrap').each(function (n, e) {
            var $e = $(e);
            if ($e.hasClass('active')) {
                $e.removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            }
        });
        // 全选数据中 去掉点击的数据
        if (selectTypeDynamic === 3) { // 按时间聚合
            var rowIndex = $this.closest('.image-card-list').index();
            timeTogetherListDynamic[rowIndex].list.forEach(function (e) {
                allSelectedCardList.forEach(function (item, idx) {
                    if (e.picId === item.picId) {
                        allSelectedCardList.splice(idx, 1);
                    }
                })
            });
        } else if (selectTypeDynamic === 4) { // 按地点聚合
            var rowIndex = $this.closest('.image-card-list').index();
            positionTogetherListDynamic[rowIndex].list.forEach(function (e) {
                allSelectedCardList.forEach(function (item, idx) {
                    if (e.picId === item.picId) {
                        allSelectedCardList.splice(idx, 1);
                    }
                })
            });
        }
    } else { // 全选
        // 聚合 此分组下的图片增加选中状态
        $this.addClass('ui-checkboxradio-checked').closest('.image-card-list').find('.image-card-wrap').each(function (n, e) {
            var $e = $(e);
            if (!$e.hasClass('active')) {
                $e.addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
            }
        })
        // 给全部选中的数据增加值 判断功能区是否需要全选
        if (selectTypeDynamic === 3) { // 按时间聚合
            var rowIndex = $this.closest('.image-card-list').index();
            timeTogetherListDynamic[rowIndex].list.forEach(function (e) {
                allSelectedCardList.push(e);
            });
            judgeSelectePageAll($('#timeTogetherWrapperDynamic' + itemCache));
        } else if (selectTypeDynamic === 4) { // 按地点聚合
            var rowIndex = $this.closest('.image-card-list').index();
            positionTogetherListDynamic[rowIndex].list.forEach(function (e) {
                allSelectedCardList.push(e);
            });
            judgeSelectePageAll($('#positionTogetherWrapperDynamic' + itemCache));
        }
        // 所有选中的数据去重
        allSelectedCardList = unique(allSelectedCardList);
    }
    // 轨迹分析按钮 是否可用
    if (allSelectedCardList.length > 0) {
        $('#courseAnalyseDynamic').removeClass('disabled');
    } else {
        $('#courseAnalyseDynamic').addClass('disabled');
    }
    $("#image-dynamic-list-" + itemCache).data({
        'trakData': allSelectedCardList
    });
})

// 动态库 功能区 点击全选
$(document).on('click', '#selectAllSnappingDynamic', function () {
    var $this = $(this).find('.ui-checkboxradio-label'); // 当前点击的全选框
    allSelectedCardList = $("#image-dynamic-list-" + itemCache).data('trakData') && $("#image-dynamic-list-" + itemCache).data('trakData').length > 0 ? $("#image-dynamic-list-" + itemCache).data('trakData') : []; // 所有被选中的数据
    // if (!dynamicDataDynamic.base64Img) { // 没有上传图片 此时仍然可以点击全选
    //     return;
    // }
    if ($(this).find(".ui-checkboxradio-checkbox-label").hasClass("text-disabled")) {
        return;
    }
    // 全选
    if (!$this.hasClass('ui-checkboxradio-checked')) {
        $this.addClass('ui-checkboxradio-checked'); // 增加全选状态
        // 给全部被选中的数据赋值
        if (selectTypeDynamic === 1) { // 按时间排序
            $('#sortByTimeWrapperDynamic' + itemCache).find('.image-card-wrap').addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 图片选中
            sortTimeListDynamic.map(function (e) {
                allSelectedCardList.push(e);
            });
        } else if (selectTypeDynamic === 2) { // 按相似度排序
            $('#search-infoDynamic' + itemCache).find('.image-card-wrap').addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 图片选中
            sortListDynamic.map(function (e) {
                allSelectedCardList.push(e);
            });
        } else if (selectTypeDynamic === 3) { // 按时间聚合
            $('#timeTogetherWrapperDynamic' + itemCache).find('.image-card-wrap').addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 图片选中
            $('#timeTogetherWrapperDynamic' + itemCache).find('.image-card-list-title .ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 聚合分组 标题显示全选
            timeTogetherListDynamic.map(function (e) {
                e.list.map(function (item) {
                    allSelectedCardList.push(item);
                });
            });
        } else if (selectTypeDynamic === 4) { // 按地点聚合 
            $('#positionTogetherWrapperDynamic' + itemCache).find('.image-card-wrap').addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 图片选中
            $('#positionTogetherWrapperDynamic' + itemCache).find('.image-card-list-title .ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 聚合分组 标题显示全选
            positionTogetherListDynamic.map(function (e) {
                e.list.map(function (item) {
                    allSelectedCardList.push(item);
                });
            });
        }
        allSelectedCardList = unique(allSelectedCardList); // 全部被选中的数据去重
    } else { // 取消全选
        $this.removeClass('ui-checkboxradio-checked'); // 功能区 取消全选
        // 去掉图片选中 去掉聚合标题全选 所有被选中的数据赋值
        if (selectTypeDynamic === 1) { // 按时间排序
            $('#sortByTimeWrapperDynamic' + itemCache).find('.image-card-wrap').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 图片去掉选中
            sortTimeListDynamic.map(function (e, n) {
                allSelectedCardList.map(function (item, index) {
                    if (e.picId === item.picId) {
                        allSelectedCardList.splice(index, 1);
                    }
                })
            });
        } else if (selectTypeDynamic === 2) { // 按相似度排序
            $('#search-infoDynamic' + itemCache).find('.image-card-wrap').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 图片去掉选中
            sortListDynamic.map(function (e, n) {
                allSelectedCardList.map(function (item, index) {
                    if (e.picId === item.picId) {
                        allSelectedCardList.splice(index, 1);
                    }
                })
            });
        } else if (selectTypeDynamic === 3) { // 按时间聚合
            $('#timeTogetherWrapperDynamic' + itemCache).find('.image-card-wrap').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 图片去掉选中
            $('#timeTogetherWrapperDynamic' + itemCache).find('.image-card-list-title .ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 聚合分组 标题去掉全选
            timeTogetherListDynamic.map(function (e, n) {
                e.list.map(function (v, idx) {
                    allSelectedCardList.map(function (item, index) {
                        if (v.picId === item.picId) {
                            allSelectedCardList.splice(index, 1);
                        }
                    })
                })
            });
        } else if (selectTypeDynamic === 4) { // 按地点聚合
            $('#positionTogetherWrapperDynamic' + itemCache).find('.image-card-wrap').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 图片去掉选中
            $('#positionTogetherWrapperDynamic' + itemCache).find('.image-card-list-title .ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 聚合分组 标题去掉全选
            positionTogetherListDynamic.map(function (e, n) {
                e.list.map(function (v, idx) {
                    allSelectedCardList.map(function (item, index) {
                        if (v.picId === item.picId) {
                            allSelectedCardList.splice(index, 1);
                        }
                    })
                })
            });
        }
    }
    // 轨迹分析按钮 是否可用
    if (allSelectedCardList.length > 0) {
        $('#courseAnalyseDynamic').removeClass('disabled');
    } else {
        $('#courseAnalyseDynamic').addClass('disabled');
    }
    // 轨迹分析按钮 赋值
    $("#image-dynamic-list-" + itemCache).data({
        'trakData': allSelectedCardList
    });
})

// 动态库 点击在逃人员
// $(document).on('click', '#idcardSelectDynamic', function () {
//     var $this = $(this).find('.ui-checkboxradio-label'); // 当前点击的全选框
//     // 选中
//     if (!$this.hasClass('ui-checkboxradio-checked')) {
//         $this.addClass('ui-checkboxradio-checked'); // 增加全选状态
//     } else { // 取消全选
//         $this.removeClass('ui-checkboxradio-checked'); // 功能区 取消全选
//     }
// })

// 纯动态页面 点击轨迹分析返回按钮
$('#backToSearchDynamic').on("click", function () {
    $('#current-page-dynamic').removeClass('display-none');
    $('#currentPagePathDynamic').addClass('display-none');
    if (selectTypeDynamic == 1) {
        judgeSelectePageAll($('#sortByTimeWrapperDynamic' + itemCache));
    } else if (selectTypeDynamic == 2) {
        judgeSelectePageAll($('#search-infoDynamic' + itemCache));
    } else if (selectTypeDynamic == 3) {
        judgeSelectePageAll($('#timeTogetherWrapperDynamic' + itemCache));
        $('#timeTogetherWrapperDynamic' + itemCache).find('.image-card-list').each(function (index, el) {
            judgeSelecteAll($(el));
        });
    } else if (selectTypeDynamic == 4) {
        judgeSelectePageAll($('#positionTogetherWrapperDynamic' + itemCache));
        $('#positionTogetherWrapperDynamic' + itemCache).find('.image-card-list').each(function (index, el) {
            judgeSelecteAll($(el));
        });
    }
});

// 纯动态页面 hover 显示中图
$('#current-page-dynamic').on('mouseover', '.wrap-empty-center .image-card-wrap', function () {
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
        $this.closest('.searchDynamicOnly').append(html);
        var docH = document.documentElement.clientHeight,
            //$imgHover = $this.siblings('.card-img-hover'),
            $imgHover = $('.searchDynamicOnly').find('.card-img-hover'),
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

        // // 鼠标经过在地图上显示坐标
        // var orgCode = '';
        // if (selectTypeDynamic === 1) { // 按时间检索
        //     orgCode = sortTimeListDynamic[$this.index()].orgCode;
        // } else if (selectTypeDynamic === 2) { // 按相似度检索
        //     orgCode = sortListDynamic[$this.index()].orgCode;
        // } else if (selectTypeDynamic === 3) { // 按时间聚合
        //     orgCode = timeTogetherListDynamic[$this.closest('.image-card-list').index()].list[$this.index()].orgCode;
        // } else if (selectTypeDynamic === 4) { // 按地点聚合
        //     orgCode = positionTogetherListDynamic[$this.closest('.image-card-list').index()].list[$this.index()].orgCode;
        // }
        // if (orgCode && orgCode.split('000000')[1] == '') {
        //     orgCode = orgCode.split('000000')[0];
        // } else {
        //     orgCode = orgCode.split('0000')[0];
        // }
        // if (!orgCode) {
        //     return;
        // }
        // var highlightOption = {
        //     type: 'highlightArea',
        //     mydata: {
        //         data: orgCode
        //     }
        // };
        // var searchMapDynamicIframe = document.getElementById('search_map_iframeDynamic');
        // var targetOrigin = 'http://190.168.17.2:6082/peopleCity.html';
        // searchMapDynamicIframe.contentWindow.postMessage(highlightOption, targetOrigin);
    }, 500);
});

$('#current-page-dynamic').on('mouseout', '.wrap-empty-center .image-card-wrap', function () {
    $(this).closest('.searchDynamicOnly').find('.card-img-hover').remove();
    window.clearTimeout(cardImgHoverTimer);
    var highlightOption = {
        type: 'removeHighlightArea'
    };
    var searchMapDynamicIframe = document.getElementById('search_map_iframeDynamic');
    var targetOrigin = mapUrl + 'peopleCity.html';
    searchMapDynamicIframe.contentWindow.postMessage(highlightOption, targetOrigin);
});

// 纯动态页面 上传图片区域 hover显示中图
$('#current-page-dynamic').on('mouseover', '#usearchImgDynamic .add-image-item', function () {
    var $this = $(this),
        imgSrc = $this.find('.add-image-img').attr('src'),
        top = $this.offset().top - 2,
        left = $this.offset().left + $this.outerWidth() + 4,
        html = `<div class="card-img-hover">
                    <img src="${imgSrc}" alt="">
                </div>`;
    cardImgHoverTimer = window.setTimeout(function () {
        $this.closest('#getSearchBox').append(html);
        var docH = document.documentElement.clientHeight,
            //$imgHover = $this.siblings('.card-img-hover'),
            $imgHover = $('#getSearchBox').find('.card-img-hover'),
            hoverImgH = $imgHover.outerHeight();
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

// 纯动态页面 上传图片区域 hover显示中图之后 鼠标离开图片
$('#current-page-dynamic').on('mouseout', '#usearchImgDynamic .add-image-item', function () {
    $(this).closest('#getSearchBox').find('.card-img-hover').remove();
    window.clearTimeout(cardImgHoverTimer);
});

//纯动态检索点击图文切换图表
$("#snappingWrap").on("click", "#showCardSearchDynamic", function () { //小图
    if (!$("#timeTogetherWrapperDynamic" + itemCache).hasClass("display-none")) {
        for (var i = 0; i < $("#timeTogetherWrapperDynamic" + itemCache).find(".image-card-list").length; i++) {
            if ($("#timeTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-wrap.type-5").length > 8) {
                if ($("#timeTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").length == 0) {
                    $("#timeTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title").append(`< button class= "btn btn-link" type = "button" > ${$("#timeTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).hasClass("showMore") ? '查看更多' : '收起'}</button > `);
                }
            } else {
                if ($("#timeTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").length > 0) {
                    $("#timeTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").remove();
                }
            }
        }
    }
    if (!$("#positionTogetherWrapperDynamic" + itemCache).hasClass("display-none")) {
        for (var i = 0; i < $("#positionTogetherWrapperDynamic" + itemCache).find(".image-card-list").length; i++) {
            if ($("#positionTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-wrap.type-5").length > 8) {
                if ($("#positionTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").length == 0) {
                    $("#positionTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title").append(`< button class= "btn btn-link" type = "button" > ${$("#positionTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).hasClass("showMore") ? '查看更多' : '收起'}</button > `);
                }
            } else {
                if ($("#positionTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").length > 0) {
                    $("#positionTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").remove();
                }
            }
        }
    }
    togetherShowMore();
    $("#snappingWrap").find("li.image-card-wrap").css({
        width: 'calc(12.5% - .625rem)'
    });
    $("#snappingWrap").find("li.image-card-wrap>.image-card-box").css({
        width: '100%'
    });
    $("#snappingWrap").find("li.image-card-wrap>.image-card-message-box").css({
        width: 'auto'
    });
    $("#snappingWrap").find("li.image-card-wrap>.image-card-info").addClass("hide");
    $(this).addClass("btn-primary").siblings().removeClass("btn-primary");
}).on("click", "#showListSearchDynamic", function () {
    if (!$("#timeTogetherWrapperDynamic" + itemCache).hasClass("display-none")) {
        for (var i = 0; i < $("#timeTogetherWrapperDynamic" + itemCache).find(".image-card-list").length; i++) {
            if ($("#timeTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-wrap.type-5").length > 4) {
                if ($("#timeTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").length == 0) {
                    $("#timeTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title").append(`< button class= "btn btn-link" type = "button" > ${$("#timeTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).hasClass("showMore") ? '查看更多' : '收起'}</button > `);
                }
            } else {
                if ($("#timeTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").length > 0) {
                    $("#timeTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").remove();
                }
            }
        }
    }
    if (!$("#positionTogetherWrapperDynamic" + itemCache).hasClass("display-none")) {
        for (var i = 0; i < $("#positionTogetherWrapperDynamic" + itemCache).find(".image-card-list").length; i++) {
            if ($("#positionTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-wrap.type-5").length > 4) {
                if ($("#positionTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").length == 0) {
                    $("#positionTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title").append(`< button class= "btn btn-link" type = "button" > ${$("#positionTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).hasClass("showMore") ? '查看更多' : '收起'}</button > `);
                }
            } else {
                if ($("#positionTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").length > 0) {
                    $("#positionTogetherWrapperDynamic" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").remove();
                }
            }
        }
    }
    togetherShowMore();
    $("#snappingWrap").find("li.image-card-wrap").css({
        width: 'calc(25% - .625rem)'
    });
    $("#snappingWrap").find("li.image-card-wrap>.image-card-box").css({
        width: '35%'
    });
    $("#snappingWrap").find("li.image-card-wrap>.image-card-message-box").css({
        width: '34%'
    });
    $("#snappingWrap").find("li.image-card-wrap>.image-card-info").removeClass("hide");
    $(this).addClass("btn-primary").siblings().removeClass("btn-primary");
});

//检索地图初始化
window.addEventListener("message", function (ev) {
    var mydata = ev.data;
    if ((mydata == 'initMap' || mydata == 'initMap?' || mydata == 'initMap?44031') && $('#search_map_iframeDynamic').length > 0) {
        var searchMapDynamicIframe = document.getElementById('search_map_iframeDynamic');
        var targetOrigin = mapUrl + 'peopleCity.html';
        var mapOperationData = {
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
        var searchMapDynamicData = {
            type: "cluster",
            mydata: []
        };
        window.setTimeout(function () {
            searchMapDynamicIframe.contentWindow.postMessage(mapOperationData, targetOrigin);
            searchMapDynamicIframe.contentWindow.postMessage(searchMapDynamicData, targetOrigin);
            searchMapDynamicIframe.contentWindow.postMessage({
                type: 'fullExtent'
            }, targetOrigin);
        }, 2000);
    }
});

// 点击导出事件
$("#aui-icon-importDynamic").on('click', function () {
    showLoading($("#aui-icon-importDynamic"))
    var allSelectedCardList = $("#image-dynamic-list-" + itemCache).data('trakData') && $("#image-dynamic-list-" + itemCache).data('trakData').length > 0 ? $("#image-dynamic-list-" + itemCache).data('trakData') : [],
        _datas = [],
        _data = {},
        port = 'v2/faceDt/exportImagesToCache';
    if (allSelectedCardList.length === 0) {
        hideLoading($("#aui-icon-importDynamic"))
        warningTip.say('请选择导出图片！');
        return false;
    }
    if (allSelectedCardList.length > 100) {
        hideLoading($("#aui-icon-importDynamic"))
        warningTip.say('不能超过100张！');
        return false;
    }
    //获取选择的图片
    allSelectedCardList.forEach(function (item) {
        let indexof = item.smallPicUrl.indexOf("fileid="),
            indexStr = item.smallPicUrl.substr(indexof, item.smallPicUrl.length - 1),
            fileid = indexStr.split("=")[1];
        _data = {
            picId: item.picId,
            smallPicUrl: item.smallPicUrl,
            //name: item.cameraName,
            name: fileid,
            time: item.captureTime
        };
        _datas.push(_data);
    });
    var datas = {
        dynamicId: $('#usearchImgDynamic').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'),
        data: _datas
    };
    //第一步，先将图片信息传到后台
    successFunc = function (info) {
        if (info.code === '200') {
            //第二步，导出
            var token = $.cookie('xh_token');
            $("#exportIframeDynamic").attr("src", encodeURI(serviceUrl + "/v2/faceDt/exportImages?token=" + token + "&downId=" + info.downId));
        }
        hideLoading($("#aui-icon-importDynamic"))
    };
    loadData(port, true, datas, successFunc);
});

//区域切换类点
$("#current-page-dynamic").on("change", ".cameraTypeSearch input", function () {
    if ($("#sidebarPoliceSelectDynamic").val() && $("#selMergeCameraIDDynamic").attr("link") != '0') {
        loadSearchCameraInfo($("#sidebarCameraSelectDynamic"), $("#sidebarPoliceSelectDynamic").val());
    }
});

window.initDatePicker1($('#searchMerge_TimeDynamic'), -30); // 初始化其他事件下的时间控件
initDynamic($("#sidebarOrgSelectDynamic"), $("#sidebarPoliceSelectDynamic"), $("#sidebarCameraSelectDynamic")); // 左侧 分局和派出所的下拉选择 searchCommon中的方法
initPageDynamic(); // 初始化图片容器
dropSelectDynamic($('#current-page-dynamic')); // 图片拖拽框选



/**************** 更新V2.0版本 以下代码感觉没啥用 *********/
// 点击 地区/摄像机删除按钮 清空数据
$('.form-group .aui-input-affix-wrapper .aui-input-suffix').on('click', function (e) {
    e.stopPropagation();
    var $this = $(this);
    $this.siblings('input').val('');
})

$('#idcardsearchDynamic').hover(function () {
    $(this).closest('.search-wrap').addClass('focuse');
}, function () {
    $(this).closest('.search-wrap').removeClass('focuse');
})

loadMapCameraList(); // 地图选择摄像头事件 common中的方法