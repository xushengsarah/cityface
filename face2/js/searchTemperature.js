(function () {
    //向子页面传输网址
    var dynamicDataDynamic, // 温度检索数据  
        timeTogetherListDynamic, //时间聚合
        positionTogetherListDynamic, //地点聚合
        cardImgHoverTimer;

    // 纯动态页面 调用checkbox组件需要运行相关代码
    function checkboxFunc() {
        $('[data-role="checkbox"]').checkboxradio();
        $('[data-role="checkbox-button"]').checkboxradio({
            icon: false
        });
    }

    // 纯动态页面 初始化 页面图片列表 加载空页面
    function initPageDynamic() {
        var $searchInfo = $('#search-infoTemperature'),
            $sortByTimeWrapperTemperature = $('#sortByTimeWrapperTemperature'),
            $timeTogetherWrapperTemperature = $('#timeTogetherWrapperTemperature'),
            $positionTogetherWrapperTemperature = $('#positionTogetherWrapperTemperature');
        loadEmpty($searchInfo); // 动态检索 按相似度排序 加载空页面
        loadEmpty($sortByTimeWrapperTemperature); // 动态检索 按时间序 加载空页面
        loadEmpty($timeTogetherWrapperTemperature); // 动态检索 按时间聚合 加载空页面
        loadEmpty($positionTogetherWrapperTemperature); // 动态检索 按地点聚合 加载空页面
        $("#showListSearchTemperature").click();
    }

    /**
    * 获取侧边栏请求的参数
    * @param {String} typeSearch 判断是地图还是区域
    */
    function getSearchDataDynamic(typeSearch) {
        var selectImgSrc = '', // 当前被选中图片Base64
            selectImgId = '',
            $date = $('#searchMerge_Temperature'), // 日期选中节点
            // 判断是否有摄像机选中数据
            $cameraOrg = $('#sidebarOrgSelectTemperature'), // 分局选择框
            $cameraPolice = $('#sidebarPoliceSelectTemperature'), // 派出所选择框
            $cameraArea = $('#sidebarCameraSelectTemperature'), //摄像机多选框
            cameraType = '',
            mapArr = [], // 选择摄像头数据
            cameraValArr = [], // 选择机构数据
            // 判断当前时间段
            $dateInput = $date.find('.datepicker-input'),
            dateStartTime = $dateInput.eq(0).val(),
            dateEndTime = $dateInput.eq(1).val(),
            startTemperature = $("#startTemperature").val(),
            endTemperature = $("#endTemperature").val(),
            // 还未确定或者目前写死的数据
            // 静态写死数据
            accessplat = 'facePlatform',
            accessToken = 'string',
            // 动态写死数据
            page = 1, //当前页
            number = 40, //每一页个数
            // 镜头id 机构id V2.0版本 封装成字符串数组
            cameraValStringArr = [], // 新的机构id数组
            mapStringArr = []; // 新的镜头id数组
        // 机构 摄像头赋值
        if (typeSearch === 'map') { //地图选择
            var mapData = $('#saveNodeSearchTemperature').data('saveData');
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
                cameraType = $("#selMergeCameraIDTemperature").find("input[name='temperatureCameraType']:checked").val();
                if (policeDataObj && policeDataObj.length > 0) {
                    cameraValArr.push({
                        'videoGroup': policeDataObj
                    });
                } else {
                    cameraValArr.push({
                        'videoGroup': orgDataObj
                    });
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
                videoGroups: cameraValStringArr,
                videos: mapStringArr,
                type: cameraType,
                startTemperature,
                endTemperature,
                startTime: dateStartTime,
                endTime: dateEndTime,
                page: page,
                number: number
            }
        }
    }

    /**
    * 按温度排序检索 如果目标检索图片没有绑定id 需先绑定id
    * @param {Object} dynamicData 左侧动态检索条件
    */
    function peopleSnappingSearchTimeDynamic(dynamicData) {
        var $cardContent = $('#sortByTimeWrapperTemperature');
        if ($cardContent.length > 1) {
            $cardContent = $cardContent.eq(1);
        }
        searchTimeSortDataDynamic(dynamicData);
    }

    /**
    * 按相似度排序检索 如果目标检索图片没有绑定id 需先绑定id
    * @param {Object} dynamicData 左侧动态检索条件
    */
    function peopleSnappingSearchDynamic(dynamicData) {
        var $cardContent = $('#search-infoTemperature');
        if ($cardContent.length > 1) {
            $cardContent = $cardContent.eq(1);
        }

        searchSimilarSortDataDynamic(dynamicData);
    }

    /**
     * 动态抓拍库 相似度排序 请求数据和翻页 （其中包含 调用聚合数据方法）
     * @param {Object} dynamicData 左侧动态检索条件
     * @param {number} count 失效的次数
     */
    function searchSimilarSortDataDynamic(dynamicData, count) {
        var $cardContent = $('#search-infoTemperature'),
            port = 'v2/faceDt/peopleSearch',
            option = {
                startTime: dynamicData.startTime, // 开始时间
                endTime: dynamicData.endTime, // 结束时间
                cameraIds: dynamicData.videos, // 摄像头id
                orgIds: dynamicData.videoGroups, // 机构id
                endTemperature: dynamicData.endTemperature,
                startTemperature: dynamicData.startTemperature,
                type: dynamicData.type,
                searchType: '0',//后台不校验事件权限
                page: 1, // 当前页
                size: 40, // 每一页个数
                sort: 3 // 相似度降序排序
            },
            successFunc = function (data) {
                if (data.code === '200') {
                    var result = data.data,
                        allSelectedCardList = $('#courseAnalyseTemperature').data('trakData') && $('#courseAnalyseTemperature').data('trakData').length > 0 ? $('#courseAnalyseTemperature').data('trakData') : [];
                    sortListTemperature = result.list; // 相似度排序 返回的数据集
                    // 检索图片 返回值为空
                    if (sortListTemperature.length === 0 || +result.total === 0) {
                        hideLoading($cardContent);
                        loadEmpty($cardContent);
                        loadEmpty($("#timeTogetherWrapperTemperature"));
                        loadEmpty($("#positionTogetherWrapperTemperature"));
                        var targetOrigin = mapUrl + 'peopleCity.html',
                            data = {
                                type: "cluster",
                                mydata: []
                            },
                            iframe = document.getElementById('search_map_iframeTemperature');
                        iframe.contentWindow.postMessage(data, targetOrigin);
                        return;
                    }
                    // // 根据返回值 vertices 构造 人脸位置facePosition
                    // for (var i = 0; i < sortList.length; i++) {
                    //     sortList[i].facePosition = getFacePositionData(sortList[i]);
                    // }
                    $('#search-infoTemperature').find('.image-card-wrap').remove();
                    creatSnappingItemDynamic(sortListTemperature, result.total, $('#search-infoTemperature'), 'paginationScoreWrapTemperatureParent', 'paginationScoreWrapTemperature'); // 动态抓拍库生成节点
                    allSelectedCardList.forEach(function (item) {
                        sortListTemperature.forEach(function (v, n) {
                            if (v.picId === item.picId) {
                                $('#search-infoTemperature').find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                            }
                        })
                    });
                    // 全选按钮选中状态
                    judgeSelectePageAll($('#search-infoTemperature'));
                    //分页
                    var $pagination = $('#paginationScoreWrapTemperature');
                    if (+result.totalPage !== 0 && +result.totalPage !== 1) {
                        var eventCallBack = function (currPage, pageSize) {
                            pageLoad();

                            function pageLoad(rcount) {
                                var changePort = 'v2/faceDt/peopleSearch',
                                    changePote = {
                                        startTime: option.startTime, // 开始时间
                                        endTime: option.endTime, // 结束时间
                                        cameraIds: dynamicData.videos, // 摄像头id
                                        orgIds: dynamicData.videoGroups, // 机构id
                                        type: dynamicData.type,
                                        endTemperature: dynamicData.endTemperature,
                                        startTemperature: dynamicData.startTemperature,
                                        searchType: '0',//后台不校验事件权限
                                        page: currPage, // 当前页
                                        size: Number(pageSize), // 每一页个数
                                        sort: 3
                                    },
                                    successFn = function (data) {
                                        hideLoading($cardContent);
                                        if (data.code === '200') {
                                            hideLoading($cardContent);
                                            removeLoadEmpty($cardContent);
                                            sortListTemperature = data.data.list;
                                            // 根据返回值 vertices 构造 人脸位置facePosition
                                            // for (var i = 0; i < sortList.length; i++) {
                                            //     sortList[i].facePosition = getFacePositionData(sortList[i]);
                                            // }
                                            $('#search-infoTemperature').find('.image-card-wrap').remove();
                                            // 创建图片节点
                                            creatSnappingItemDynamic(sortListTemperature, result.total, $('#search-infoTemperature'), 'paginationScoreWrapTemperatureParent', 'paginationScoreWrapTemperature');
                                            // 初始化 所有被选中的图片
                                            var allSelectedCardList = $('#courseAnalyseTemperature').data('trakData') && $('#courseAnalyseTemperature').data('trakData').length > 0 ? $('#courseAnalyseTemperature').data('trakData') : []; // 被选中的图片列表
                                            allSelectedCardList.forEach(function (item) {
                                                sortListTemperature.forEach(function (v, n) {
                                                    if (v.picId === item.picId) {
                                                        $('#search-infoTemperature').find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                                    }
                                                })
                                            });
                                            var maskID = $('.image-card-list.no-bottom-border').children().not('.display-none').attr('id'); // 当前被选中的动态检索类型的容器
                                            $('.mask-container-fixed.' + maskID).remove(); // 删除大图
                                            judgeSelectePageAll($('#search-infoTemperature'));
                                            // 抓拍图节点数据添加
                                            addDataByDymPic('#search-infoTemperature', sortListTemperature);
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
                        $('#paginationScoreWrapTemperature').closest('.pagination-wrap').removeClass('display-none').find('.pagination-result-number').text(result.total);
                    } else {
                        $pagination.closest('.pagination-wrap').remove();
                    }
                    hideLoading($cardContent);
                    removeLoadEmpty($cardContent);
                    $('.card-content>.card-tip').removeClass('hide');
                    // 抓拍图节点数据添加
                    addDataByDymPic('#search-infoTemperature', sortListTemperature);
                } else {
                    hideLoading($cardContent);
                    loadEmpty($cardContent);

                    var targetOrigin = mapUrl + 'peopleCity.html',
                        data = {
                            type: "cluster",
                            mydata: []
                        },
                        iframe = document.getElementById('search_map_iframeTemperature');
                    iframe.contentWindow.postMessage(data, targetOrigin);
                    $('.card-content>.card-tip').addClass('hide');
                }
            };
        loadData(port, true, option, successFunc);
        showLoading($cardContent);
    }

    /**
    * 动态抓拍库 时间排序 请求数据和翻页
    * @param {Object} dynamicData 左侧动态检索条件
    * @param {number} count 失效次数
    */
    function searchTimeSortDataDynamic(dynamicData, count) {
        var $cardContent = $('#sortByTimeWrapperTemperature'),
            port = 'v2/faceDt/peopleSearch',
            option = {
                startTime: dynamicData.startTime, // 开始时间
                endTime: dynamicData.endTime, // 结束时间
                cameraIds: dynamicData.videos, // 摄像头id
                orgIds: dynamicData.videoGroups, // 机构id
                endTemperature: dynamicData.endTemperature,
                startTemperature: dynamicData.startTemperature,
                searchType: '0',//后台不校验事件权限
                type: dynamicData.type,
                page: 1, // 当前页
                size: 40, // 每一页个数
                sort: 4 // 时间降序排序
            },
            successFunc = function (data) {
                if (data.code === '200') {
                    var result = data.data;
                    $('#sortByTimeWrapperTemperature').find('.image-card-wrap').remove(); // 清空按时间检索图片容器中的所有图片
                    sortTimeListDynamic = result.list;
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
                        creatSnappingItemDynamic(sortTimeListDynamic, result.total, $('#sortByTimeWrapperTemperature'), 'paginationTimeWrapTemperatureParent', 'paginationTimeWrapTemperature', true);
                    } else {
                        creatSnappingItemDynamic(sortTimeListDynamic, result.total, $('#sortByTimeWrapperTemperature'), 'paginationTimeWrapTemperatureParent', 'paginationTimeWrapTemperature');
                    }
                    // 初始化 所有被选中的图片
                    var allSelectedCardList = $('#courseAnalyseTemperature').data('trakData') && $('#courseAnalyseTemperature').data('trakData').length > 0 ? $('#courseAnalyseTemperature').data('trakData') : [];
                    allSelectedCardList.forEach(function (item) {
                        sortTimeListDynamic.forEach(function (v, n) {
                            if (v.picId === item.picId) {
                                $('#sortByTimeWrapperTemperature').find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                            }
                        })
                    });
                    // 判断是否需要全选
                    judgeSelectePageAll($('#sortByTimeWrapperTemperature'));
                    //分页
                    var $paginationTime = $('#paginationTimeWrapTemperature');
                    if (result.totalPage !== '0' && result.totalPage !== '1') {
                        var eventCallBack = function (currPage, pageSize) {
                            pageLoad();

                            function pageLoad(rcount) {
                                var changePort = 'v2/faceDt/peopleSearch',
                                    changePote = {
                                        startTime: option.startTime, // 开始时间
                                        endTime: option.endTime, // 结束时间
                                        cameraIds: dynamicData.videos, // 摄像头id
                                        orgIds: dynamicData.videoGroups, // 机构id
                                        endTemperature: dynamicData.endTemperature,
                                        startTemperature: dynamicData.startTemperature,
                                        searchType: '0',//后台不校验事件权限
                                        type: dynamicData.type,
                                        page: currPage, // 当前页
                                        size: Number(pageSize), // 每一页个数
                                        sort: 4
                                    }
                                successFn = function (data) {
                                    hideLoading($cardContent);
                                    if (data.code === '200') {
                                        $('#sortByTimeWrapperTemperature').find('.image-card-wrap').remove(); // 清空按时间排序容器
                                        sortTimeListDynamic = data.data.list;
                                        // // 根据返回值 vertices 构造 人脸位置facePosition
                                        // for (var i = 0; i < sortTimeListDynamic.length; i++) {
                                        //     sortTimeListDynamic[i].facePosition = getFacePositionData(sortTimeListDynamic[i]);
                                        // }
                                        if (dynamicData.base64Img.length === 0) {
                                            creatSnappingItemDynamic(sortTimeListDynamic, data.data.total, $('#sortByTimeWrapperTemperature'), 'paginationTimeWrapTemperatureParent', 'paginationTimeWrapTemperature', true);
                                        } else {
                                            creatSnappingItemDynamic(sortTimeListDynamic, data.data.total, $('#sortByTimeWrapperTemperature'), 'paginationTimeWrapTemperatureParent', 'paginationTimeWrapTemperature');
                                        }
                                        var allSelectedCardList = $('#courseAnalyseTemperature').data('trakData') && $('#courseAnalyseTemperature').data('trakData').length > 0 ? $('#courseAnalyseTemperature').data('trakData') : [];
                                        allSelectedCardList.forEach(function (item) {
                                            sortTimeListDynamic.forEach(function (v, n) {
                                                if (v.picId === item.picId) {
                                                    $('#sortByTimeWrapperTemperature').find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                                }
                                            })
                                        });
                                        hideLoading($cardContent);
                                        removeLoadEmpty($cardContent);
                                        var maskID = $('.image-card-list.no-bottom-border').children().not('.display-none').attr('id'); // 当前被选中的动态检索类型的容器
                                        $('.mask-container-fixed.' + maskID).remove(); // 删除大图
                                        judgeSelectePageAll($('#sortByTimeWrapperTemperature'));
                                        // 添加节点数据
                                        addDataByDymPic('#sortByTimeWrapperTemperature', sortTimeListDynamic);
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
                        $('#paginationTimeWrapTemperature').closest('.pagination-wrap').removeClass('display-none').find('.pagination-result-number').text(result.total);
                    } else {
                        $paginationTime.closest('.pagination-wrap').remove();
                    }
                    hideLoading($cardContent);
                    removeLoadEmpty($cardContent);
                    // 添加节点数据
                    addDataByDymPic('#sortByTimeWrapperTemperature', sortTimeListDynamic);
                } else {
                    hideLoading($cardContent);
                    loadEmpty($cardContent);
                }
            };
        loadData(port, true, option, successFunc);
        showLoading($cardContent);
    }

    /** 聚合请求数据
    * @param {Object} dynamicData 左侧动态检索条件
    */
    function togetherSearchDynamic(dynamicData) {
        var _dynamicId = dynamicData.selectImgId,
            port = 'v2/faceDt/mergeSearch',
            option = {
                dynamicId: _dynamicId, // 图片
                threshold: '90', // 阈值
                startTime: dynamicData.startTime, // 开始时间
                endTime: dynamicData.endTime, // 结束时间
                cameraIds: dynamicData.videos, // 摄像头id
                orgIds: dynamicData.videoGroups, // 机构id
                type: dynamicData.type, //镜头类点
                page: dynamicData.page, // 当前页
                size: dynamicData.number, // 每一页个数
                randomNum: Math.random() //防止ajaxFilter加的一个随机数
            },
            $wrapT = $('#timeTogetherWrapperTemperature'), // 按时间聚合
            $wrapP = $('#positionTogetherWrapperTemperature'), // 按地点聚合
            timeAndPositionMergeSuccessFunc = function (data) {
                if (data.code === '200') {
                    hideLoading($wrapT);
                    hideLoading($wrapP);
                    // 按时间聚合
                    var resultT = data.timeGroup;
                    timeTogetherListDynamic = data.timeGroup;
                    var allSelectedCardList = $('#courseAnalyseTemperature').data('trakData') && $('#courseAnalyseTemperature').data('trakData').length > 0 ? $('#courseAnalyseTemperature').data('trakData') : [];
                    if (resultT.length === 0) {
                        loadEmpty($wrapT);
                    } else {
                        $('#timeTogetherWrapperTemperature').html('');
                        // 按时间聚合 生成页面
                        createTogetherListDynamic($wrapT, resultT, 1, dynamicData);
                        togetherShowMore();

                        if (timeTogetherListDynamic) {
                            timeTogetherListDynamic.forEach(function (el, index) {
                                allSelectedCardList.forEach(function (item) {
                                    el.list.forEach(function (v, n) {
                                        if (v.picId === item.picId) {
                                            $('#timeTogetherWrapperTemperature').find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                        }
                                    })
                                })
                            });
                        }
                        judgeSelectePageAll($('#timeTogetherWrapperTemperature'));
                        $('#timeTogetherWrapperTemperature').find('.image-card-list').each(function (index, el) {
                            judgeSelecteAll($(el));
                        });
                    }
                    // 抓拍图节点数据添加
                    addDataByDymPic('#timeTogetherWrapperTemperature', timeTogetherListDynamic, true);

                    // 按地点聚合
                    var resultP = data.orgGroup;
                    positionTogetherListDynamic = data.orgGroup;
                    if (resultP.length === 0) {
                        loadEmpty($wrapP);
                    } else {
                        var newdata = [];
                        $('#positionTogetherWrapperTemperature').html('');
                        // 按地点聚合 生成页面
                        createTogetherListDynamic($wrapP, resultP, 2, dynamicData);
                        togetherShowMore();

                        if (positionTogetherListDynamic) {
                            positionTogetherListDynamic.forEach(function (el, index) {
                                allSelectedCardList.forEach(function (item) {
                                    el.list.forEach(function (v, n) {
                                        if (v.picId === item.picId) {
                                            $('#positionTogetherWrapperTemperature').find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                        }
                                    })
                                })
                            });
                        }
                        judgeSelectePageAll($('#positionTogetherWrapperTemperature'));
                        $('#positionTogetherWrapperTemperature').find('.image-card-list').each(function (index, el) {
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
                            iframe = document.getElementById('search_map_iframeTemperature');
                        iframe.contentWindow.postMessage(data, targetOrigin);
                    }
                    // 抓拍图节点数据添加
                    addDataByDymPic('#positionTogetherWrapperTemperature', positionTogetherListDynamic, true);
                } else {
                    // 按时间聚合
                    hideLoading($wrapT);
                    loadEmpty($wrapT);
                    // 按地点聚合
                    hideLoading($wrapP);
                    loadEmpty($wrapP);
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
    */
    function createTogetherListDynamic(el, data, mType) {
        var html = '',
            max = 40,
            rowNum = 0,
            totalNum = 0;
        if ($("#showListSearchTemperature").hasClass("btn-primary")) {
            rowNum = 4;
        } else {
            rowNum = 8;
        }
        // 拼接复选框id
        if (mType === 1) {
            type = 'timeTogetherTemperature';
        }
        if (mType === 2) {
            type = 'positionTogetherTemperature';
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
            <ul class="pagination" id="${type}Pagination${i}"></ul>
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
                <ul class="image-card-list-wrap" id="${type}Img-${i}" >${imageCard}</ul>
                ${pagination}					
            </li>`;
        }
        // 按时间聚合 动态库总数赋值
        if (type === 'timeTogetherTemperature') {
            $('#timeTogetherTotalTemperature').text("(" + totalNum + ")");
        } else if (type === 'positionTogetherTemperature') { // 按地点聚合 动态库总数赋值
            $('#positionTogetherTotalTemperature').text("(" + totalNum + ")");
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
            if (type === 'timeTogetherTemperature') {
                obj.total = timeTogetherListDynamic[index].total;
                obj.totalPage = timeTogetherListDynamic[index].totalPage;
            } else if (type === 'positionTogetherTemperature') { // 按地点聚合 本组聚合的总数据 总页数
                obj.total = positionTogetherListDynamic[index].total;
                obj.totalPage = positionTogetherListDynamic[index].totalPage;
            }
            timeTogetherCardPageSearchDynamic(obj);
        });

        if ($("#showListSearchTemperature").hasClass("btn-primary")) {
            $("#showListSearchTemperature").click();
        } else {
            $("#showCardSearchTemperature").click();
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

        if ($("#showListSearchTemperature").hasClass("btn-primary")) {
            $("#showListSearchTemperature").click();
        } else {
            $("#showCardSearchTemperature").click();
        }
    }

    /**
    * 动态抓拍库生成节点 相似度排序 和 时间排序
    * @param {Array} list 抓拍库请求成功后返回数据 
    */
    function creatSnappingItemDynamic(list, total, $ele, paginationWrapId, paginationId) {
        // 判断是时间排序还是相似度排序
        if ($ele.attr('id') === 'search-infoTemperature') {
            $('#sortTotalTemperature').text("(" + total + ")");
        } else {
            $('#sortByTimeTotalTemperature').text("(" + total + ")");
        }
        for (var i = 0; i < list.length; i++) {
            var html = '',
                // position = '',
                // // facePosition虽不是返回值 已通过方法构造
                // position = JSON.stringify(list[i].facePosition),
                score = list[i].temperature ? Number(list[i].temperature).toFixed(2) : 0,
                danger = score >= 37.2 ? 'text-danger' : '';
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
                            <p class="image-card-message-position ${danger}">${score + '℃'}</p >
                            <p class="image-card-message-time">${list[i].timePeriods}</p>
                        </div >
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
                var paginationHtml = `<div class="pagination-wrap display-none" id = "${paginationWrapId}">
                                        <ul class="pagination" id="${paginationId}"></ul>
                                    </div>`
                $ele.append(paginationHtml);
            }
            $ele.find('.pagination-wrap').before(html);
        }
        if ($("#showListSearchTemperature").hasClass("btn-primary")) {
            $("#showListSearchTemperature").click();
        } else {
            $("#showCardSearchTemperature").click();
        }
    }

    /**
    * 时间 + 地点 聚合卡片超过两行后 获取分页信息
    * @param {Object} obj 时间 + 地点聚合类型 分页数据
    */
    function timeTogetherCardPageSearchDynamic(obj) {
        var id = obj.id, // 当前分组聚合的分页元素id
            pType = obj.mType, // 聚合类型 1.时间聚合 2.地点聚合
            $pagination = $(`#${id} `), // 当前分组聚合的分页元素 格式类似positionTogetherPagination1
            $cardList = $pagination.closest('.image-card-list'), // 当前分组聚合的元素 包含标题和分页元素
            $newElement = $cardList.find('.image-card-list-wrap'); // 聚合分组 当前组的图片容器 包含所有图片的容器
        var eventCallBack = function (currPage, pageSize) {
            var changePort = 'v2/faceDt/mergePageSearch',
                mergeId = $(`#${id} `).closest('.image-card-list').attr('mergeId'), // 每组聚合数据的聚合id
                dynamicId = '',
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
                        // 按时间聚合 初始化所有被选中的图片
                        if (pType === 1) {
                            timeTogetherListDynamic[index].list = newList;
                            // 初始化 所有被选中的图片
                            allSelectedCardList.forEach(function (item) {
                                timeTogetherListDynamic[index].list.forEach(function (v, n) {
                                    if (v.picId === item.picId) {
                                        $('#timeTogetherWrapperTemperature').find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                    }
                                })
                            });
                        } else if (pType === 2) { // 按地点聚合 初始化所有被选中的图片
                            positionTogetherListDynamic[index].list = newList;
                            // 初始化 所有被选中的图片
                            allSelectedCardList.forEach(function (item) {
                                positionTogetherListDynamic[index].list.forEach(function (v, n) {
                                    if (v.picId === item.picId) {
                                        $('#positionTogetherWrapperTemperature').find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                    }
                                })
                            });
                        }
                        // 按时间聚合 抓拍图节点数据添加
                        if (selectTypeDynamic === 3) {
                            // 中图
                            addDataByDymPic('#timeTogetherWrapperTemperature', timeTogetherListDynamic, true);
                            // 判断功能区的全选是否需要选中
                            judgeSelectePageAll($('#timeTogetherWrapperTemperature'));
                            // 聚合 每组标题的全选是否需要选中
                            $('#timeTogetherWrapperTemperature').find('.image-card-list').each(function (index, el) {
                                judgeSelecteAll($(el));
                            });
                        } else if (selectTypeDynamic === 4) {
                            // 中图
                            addDataByDymPic('#positionTogetherWrapperTemperature', positionTogetherListDynamic, true);
                            // 判断功能区的全选是否需要选中
                            judgeSelectePageAll($('#positionTogetherWrapperTemperature'));
                            // 聚合 每组标题的全选是否需要选中
                            $('#positionTogetherWrapperTemperature').find('.image-card-list').each(function (index, el) {
                                judgeSelecteAll($(el));
                            });
                        }
                        // 删除聚合大图
                        var maskID = $('.image-card-list.no-bottom-border').children().not('.display-none').attr('id');
                        if (maskID === 'timeTogetherWrapperTemperature' || maskID === 'positionTogetherWrapperTemperature') {
                            var $maskShowMore = $(`#${id} `).closest('.loadSpread'),
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
        //     $('#mergeTimeTemperature button').eq(0).addClass('btn-primary').siblings().removeClass("btn-primary");
        // } else if (_counts === 7) {
        //     // 七天 单选激活 
        //     $('#mergeTimeTemperature button').eq(1).addClass('btn-primary').siblings().removeClass("btn-primary");
        // } else if (_counts === 30) {
        //     // 半个月 单选激活 
        //     $('#mergeTimeTemperature button').eq(2).addClass('btn-primary').siblings().removeClass("btn-primary");
        // } else {

        // }
        // 所有单选不激活 
        $('#mergeTimeTemperature button').removeClass("btn-primary");
    }

    // 重置默认数据
    function resetSearchDataDynamic() {
        // 摄像机
        var $cameraOrg = $('#sidebarOrgSelectTemperature');
        if ($cameraOrg.length > 0) {
            var $cameraMenu = $cameraOrg.data('selectpicker').$menu,
                $cameraBtn = $cameraOrg.data('selectpicker').$button,
                $cameraMenuItem = $cameraMenu.find('.dropdown-menu').find('.dropdown-item');
            $cameraMenuItem.eq(0).click();
            $cameraBtn.blur();
        }
        // 日期
        var $time = $('#searchMerge_Temperature'),
            $timeBtn = $time.prev().find('.btn.btn-sm');
        if ($timeBtn.length > 0) {
            $timeBtn.eq(2).click();
        }

        //温度
        $("#startTemperature").val('37.2');
        $("#endTemperature").val('40.0');
    }

    // 抓拍库图片拖拽框选
    function dropSelectTemperature($dragContainer) {
        // 检索图片框选功能
        $dragContainer.on('mousedown', function (evt) {
            var $dropSelectHtml = $('<div class="drop-select-box hide"></div>'),
                $mapPanel = $('<div class="map-panel hide"></div>');
            // 找寻到当前权限下检索节点中添加选中框节点
            var $searchDom = $('#pageSidebarMenu').find('.aui-icon-library'); // 检索图标
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
                $imageWrap = $('#snappingWrapTemperature').find('.showBigImgDynamic').not('.display-none'); // 动态检索 此种检索类型的图片ul列表
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
    }

    // 动态库 点击展开大图
    $('#snappingWrapTemperature').on('click', '.showBigImgDynamic .image-card-img', function (e) {
        $('.layer .aui-icon-not-through').click();
        var $this = $(this), // 图片
            $showBigImgDom = $this.closest('.showBigImgDynamic'), // 当前检索类型的容器
            showBigImgId = $showBigImgDom.attr('id'), // 各检索类型容器id
            thisIndex = $this.closest('.image-card-wrap').index(), // 图片索引
            $targetImg = $('#current-page-temperature'); // 上传图片容器
        // 判断是否为聚合弹窗
        if (showBigImgId === 'timeTogetherWrapperTemperature' || showBigImgId === 'positionTogetherWrapperTemperature') {
            var $imgWrap = $showBigImgDom.find('.image-card-list-wrap'), // 所有分组的列表
                $showMore = $this.closest('.loadSpread'), // 当前分组的查看更多
                showMoreIndex = $showMore.index(), // 当前分组的索引
                $el = $imgWrap.eq(showMoreIndex), // 当前分组的图片列表
                eleId = $el.attr('id'); // 当前分组列表的元素id
            showBigImgId = eleId;
            createBigImgMask($el, eleId, thisIndex, $targetImg, e); // 聚合展开大图
        } else {
            createBigImgMask($showBigImgDom, showBigImgId, thisIndex, $targetImg, e); // 动态 非聚合 展开大图
        }
    });

    //纯动态检索日历
    $('#searchMerge_Temperature').find('.datepicker-input').off('blur').on('blur', function () {
        //开始时间
        var startTime = $('#searchMerge_Temperature').find('.datepicker-input').eq(0).val();
        // 结束时间
        var endTime = $('#searchMerge_Temperature').find('.datepicker-input').eq(1).val();

        var startDate = new Date(Date.parse(startTime.replace(/-/g, "/"))).getTime();
        var endDate = new Date(Date.parse(endTime.replace(/-/g, "/"))).getTime();
        // 开始时间与结束时间间隔天数
        //var _counts = (endTime.substring(0, 4) - startTime.substring(0, 4)) * 360 + (endTime.substring(5, 7) - startTime.substring(5, 7)) * 30 + (endTime.substring(8, 10) - startTime.substring(8, 10));
        var _counts = Math.abs(startDate - endDate) / (1000 * 60 * 60 * 24);
        changeActiveMergeDynamic(_counts);
    });

    // 纯动态页面 左侧 动态库 点击区域/地图中的区域按钮
    $("#searchSelectTemperature").on("click", function () {
        $("#selMergeCameraIDTemperature .searchArea").show();
        $("#selMergeCameraIDTemperature .searchMap").hide();
        $("#searchSelectTemperature").addClass("btn-primary");
        $("#searchMapTemperature").removeClass("btn-primary");
        if ($("#searchResultFlexTemperature").find("i").attr("class") === "aui-icon-drop-right") {
            $("#searchResultFlexTemperature").find("i").attr("class", "aui-icon-drop-left");
        }
        $('#snappingWrapTemperature').animate({
            "width": "98%"
        }, 200);
        $('#searchResultFlexTemperature').animate({
            "left": "98%"
        }, 200);
    });

    // 纯动态页面 左侧 动态库 点击区域/地图中的地图按钮
    $("#searchMapTemperature").on("click", function () {
        $("#selMergeCameraIDTemperature .searchArea").hide();
        $("#selMergeCameraIDTemperature .searchMap").show();
        $("#searchSelectTemperature").removeClass("btn-primary");
        $("#searchMapTemperature").addClass("btn-primary");
        if ($("#searchResultFlexTemperature").find("i").attr("class") === "aui-icon-drop-left") {
            $("#searchResultFlexTemperature").find("i").attr("class", "aui-icon-drop-right");
        }
        $('#snappingWrapTemperature').animate({
            "width": "0"
        }, 200);
        $('#searchResultFlexTemperature').animate({
            "left": "0"
        }, 200);
    });


    // 纯动态页面 点击搜索 加载右侧内容区域照片
    $('#dynamicsearchTemperature').click(function () {
        // 防止暴力点击 点击一次之后 2s后才能第二次点击
        $('#dynamicsearchTemperature').attr('disabled', 'disabled')
        setTimeout(function () {
            $('#dynamicsearchTemperature').removeAttr('disabled')
        }, 1000)

        // 如果检索结果内容区不显示 显示内容区域
        if ($('#current-page-temperature .result-wrap').width() === 0) { // 点击检索之后 默认展开 如果检索图片结果容器收缩
            if ($("#searchResultFlexTemperature").find("i").attr("class") === "aui-icon-drop-right") { // 如果展开控制框箭头向右
                $("#searchResultFlexTemperature").find("i").attr("class", "aui-icon-drop-left"); // 展开控制框箭头向左
            }

            // 检索结果内容区展开
            $('#snappingWrapTemperature').animate({
                "width": "98%"
            }, 200);
            // 展开收缩控制框右移
            $('#searchResultFlexTemperature').animate({
                "left": "98%"
            }, 200);
        }
        selectTypeDynamic = 2; // 按相似度检索
        sortListTemperature = [];
        sortTimeListDynamic = [];
        timeTogetherListDynamic = [];
        positionTogetherListDynamic = [];
        allSelectedCardList = [];
        var $maskDom = $('body').find('.mask-container-fixed').not('.modal-control'),
            typeSearch = $("#selMergeCameraIDTemperature .searchArea").css("display") === 'none' ? 'map' : 'area'; // 判断是地图还是区域
        dynamicDataDynamic = getSearchDataDynamic(typeSearch).dynamic;
        searchFlag = true;
        if ($maskDom.length > 0) {
            $maskDom.remove(); // 清除查看大图节点
        }
        $('#sortListTemperature').text('按温度排序').removeClass('active');
        $('#search-infoTemperature').removeClass('display-none').siblings('.wrap-empty-center').addClass('display-none');
        $('#sortByScoreTemperature').addClass('active').siblings('.dropdown-item').removeClass('active');
        $('#courseAnalyseTemperature').addClass('disabled').data({
            'trakData': []
        });
        $('#sortTotalTemperature').removeClass('hide').text('').siblings('.card-subtitle').addClass('hide').text('');
        $('#selectAllSnappingTemperature').find('.ui-checkboxradio-checked').removeClass('ui-checkboxradio-checked');

        // 清空检索结果
        $('#search-infoTemperature').empty();
        $('#sortByTimeWrapperTemperature').empty();
        $('#timeTogetherWrapperTemperature').empty();
        $('#positionTogetherWrapperTemperature').empty();
        peopleSnappingSearchDynamic(dynamicDataDynamic);
        selectTypeDynamic = 2;
        $('#sortListTemperature').text('按温度排序');
        $('#sortByScoreTemperature').addClass('active').removeClass('text-disabled').siblings().removeClass('active text-disabled');
        $('#search-infoTemperature').removeClass('display-none').siblings('.wrap-empty-center').addClass('display-none');
        $('#selectAllSnappingTemperature .ui-checkboxradio-label').removeClass('text-disabled');
        $('#aui-icon-importTemperature').removeClass('text-disabled');

        $('#sortByScoreTemperature').removeClass('text-disabled');
        $('#timeTogetherTemperature').removeClass('text-disabled');
        $('#placeTogetherTemperature').removeClass('text-disabled');
        $('#selectAllSnappingTemperature').children('label').removeClass('text-disabled');
        $('#aui-icon-importTemperature').removeClass('text-disabled');
    });

    // 重置
    $(document).on('click', '#resetBtnTemperature', function () {
        resetSearchDataDynamic();
    });

    // 纯动态页面 检索结果 展开收缩
    $("#searchResultFlexTemperature").on("click", function () {
        if ($(this).find("i").attr("class") === "aui-icon-drop-left") {
            $(this).find("i").attr("class", "aui-icon-drop-right");
            $('#snappingWrapTemperature').animate({
                "width": "0"
            }, 200);
            $('#searchResultFlexTemperature').animate({
                "left": "0"
            }, 200);
            var searchMapTemperatureIframe = document.getElementById('search_map_iframeTemperature');
            var targetOrigin = mapUrl + 'peopleCity.html';
            window.setTimeout(function () {
                searchMapTemperatureIframe.contentWindow.postMessage({
                    type: 'fullExtent'
                }, targetOrigin);
            }, 300)
        } else {
            $(this).find("i").attr("class", "aui-icon-drop-left");
            $('#snappingWrapTemperature').animate({
                "width": "98%"
            }, 200);
            $('#searchResultFlexTemperature').animate({
                "left": "98%"
            }, 200);
        }
    })

    // 时间控件构建 以及相关事件
    $('#mergeTimeTemperature').find('button').on('click', function () {
        var date = $(this).data().date;
        $(this).addClass('btn-primary').siblings().removeClass('btn-primary');
        initDatePicker1($('#searchMerge_Temperature'), -date, true);
    })

    // 纯动态页面 点击刷新按钮
    $('#refreshBtnTemperature').on('click', function () {
        $('#dynamicsearchTemperature').click();
    });

    // 按时间排序
    $(document).on('click', '#sortByTimeTemperature', function () {
        if ($('#sortByTimeWrapperTemperature').find('.image-card-wrap').length == 0) {
            if (dynamicDataDynamic) {
                peopleSnappingSearchTimeDynamic(dynamicDataDynamic); // 按时间排序
            }
        }

        $('#search-infoTemperature').addClass('display-none');
        $('#sortByTimeWrapperTemperature').removeClass('display-none');
        $('#timeTogetherWrapperTemperature').addClass('display-none');
        $('#positionTogetherWrapperTemperature').addClass('display-none');
        selectTypeDynamic = 1;
        //移除卡片选中转态
        $('#current-page-temperature .image-card-wrap.active').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        $('#selectAllSnappingTemperature').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        $('#paginationTimeWrapTemperature').removeClass('display-none');
        $('#paginationScoreWrapTemperature').addClass('display-none');
        var allSelectedCardList = $('#courseAnalyseTemperature').data('trakData') && $('#courseAnalyseTemperature').data('trakData').length > 0 ? $('#courseAnalyseTemperature').data('trakData') : [];
        allSelectedCardList.forEach(function (item) {
            sortTimeListDynamic.forEach(function (v, n) {
                if (v.picId === item.picId) {
                    $('#sortByTimeWrapperTemperature').find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                }
            })
        });
        judgeSelectePageAll($('#sortByTimeWrapperTemperature'));
        $(this).closest('.operate-item').siblings('.operate-item').find('.text-link').removeClass('active');
        $('#sortByTimeTotalTemperature').removeClass('hide');
        $('#sortTotalTemperature').addClass('hide');
        $('#timeTogetherTotalTemperature').addClass('hide');
        $('#positionTogetherTotalTemperature').addClass('hide');
    });

    // 按相似度排序
    $(document).on('click', '#sortByScoreTemperature', function () {
        $('#search-infoTemperature').removeClass('display-none');
        $('#sortByTimeWrapperTemperature').addClass('display-none');
        $('#timeTogetherWrapperTemperature').addClass('display-none');
        $('#positionTogetherWrapperTemperature').addClass('display-none');
        $(this).closest('.operate-item').siblings('.operate-item').find('.text-link').removeClass('active');
        selectTypeDynamic = 2;
        $('#current-page-temperature .image-card-wrap.active').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        $('#selectAllSnappingTemperature').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        $('#paginationTimeWrapTemperature').addClass('display-none');
        $('#paginationScoreWrapTemperature').removeClass('display-none');
        var allSelectedCardList = $('#courseAnalyseTemperature').data('trakData') && $('#courseAnalyseTemperature').data('trakData').length > 0 ? $('#courseAnalyseTemperature').data('trakData') : [];
        allSelectedCardList.forEach(function (item) {
            sortListTemperature.forEach(function (v, n) {
                if (v.picId === item.picId) {
                    $('#search-infoTemperature').find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                }
            })
        });
        judgeSelectePageAll($('#search-infoTemperature'));
        judgeSelecteAll($(this));
        $('#sortByTimeTotalTemperature').addClass('hide');
        $('#sortTotalTemperature').removeClass('hide');
        $('#timeTogetherTotalTemperature').addClass('hide');
        $('#positionTogetherTotalTemperature').addClass('hide');
    });

    // 按时间聚合
    $(document).on('click', '#timeTogetherTemperature', function () {
        if (!$(this).hasClass('text-disabled')) {
            $('#selectAllSnappingTemperature').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            $('#current-page-temperature .image-card-wrap.active').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            if ($('#timeTogetherWrapperTemperature').find('.image-card-list').length == 0) {
                if (dynamicDataDynamic) {
                    togetherSearchDynamic(dynamicDataDynamic); // 获取聚合数据 渲染聚合页面 时间聚合+地点聚合
                }
            } else {
                var allSelectedCardList = $('#courseAnalyseTemperature').data('trakData') && $('#courseAnalyseTemperature').data('trakData').length > 0 ? $('#courseAnalyseTemperature').data('trakData') : [];
                if (timeTogetherListDynamic) {
                    timeTogetherListDynamic.forEach(function (el, index) {
                        allSelectedCardList.forEach(function (item) {
                            el.list.forEach(function (v, n) {
                                if (v.picId === item.picId) {
                                    $('#timeTogetherWrapperTemperature').find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                }
                            })
                        })
                    });
                }
                judgeSelectePageAll($('#timeTogetherWrapperTemperature'));
                $('#timeTogetherWrapperTemperature').find('.image-card-list').each(function (index, el) {
                    judgeSelecteAll($(el));
                });
            }

            var $this = $(this),
                $operateItem = $this.closest('.operate-item').siblings('.operate-item');
            $('#search-infoTemperature').addClass('display-none');
            $('#sortByTimeWrapperTemperature').addClass('display-none');
            $('#timeTogetherWrapperTemperature').removeClass('display-none').show();
            $('#positionTogetherWrapperTemperature').addClass('display-none');
            $this.addClass('active');
            $this.siblings('.text-link').removeClass('active');
            $operateItem.find('.nav-link').removeClass('active');
            selectTypeDynamic = 3;
            $('#paginationTimeWrapTemperature').addClass('display-none');
            $('#paginationScoreWrapTemperature').addClass('display-none');
            pageMergeType = 1;
            $('#sortByTimeTotalTemperature').addClass('hide');
            $('#sortTotalTemperature').addClass('hide');
            $('#timeTogetherTotalTemperature').removeClass('hide');
            $('#positionTogetherTotalTemperature').addClass('hide');
        }
    });

    // 按地点聚合
    $(document).on('click', '#placeTogetherTemperature', function () {
        if (!$(this).hasClass('text-disabled')) {
            $('#selectAllSnappingTemperature').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            $('#current-page-temperature .image-card-wrap.active').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            if ($('#positionTogetherWrapperTemperature').find('.image-card-list').length == 0) {
                if (dynamicDataDynamic) {
                    togetherSearchDynamic(dynamicDataDynamic); // 获取聚合数据 渲染聚合页面 时间聚合+地点聚合
                }
            } else {
                var allSelectedCardList = $('#courseAnalyseTemperature').data('trakData') && $('#courseAnalyseTemperature').data('trakData').length > 0 ? $('#courseAnalyseTemperature').data('trakData') : [];
                if (positionTogetherListDynamic) {
                    positionTogetherListDynamic.forEach(function (el, index) {
                        allSelectedCardList.forEach(function (item) {
                            el.list.forEach(function (v, n) {
                                if (v.picId === item.picId) {
                                    $('#positionTogetherWrapperTemperature').find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                                }
                            })
                        })
                    });
                }
                judgeSelectePageAll($('#positionTogetherWrapperTemperature'));
                $('#positionTogetherWrapperTemperature').find('.image-card-list').each(function (index, el) {
                    judgeSelecteAll($(el));
                });
            }

            var $this = $(this),
                $operateItem = $this.closest('.operate-item').siblings('.operate-item');
            $('#search-infoTemperature').addClass('display-none');
            $('#timeTogetherWrapperTemperature').addClass('display-none');
            $('#sortByTimeWrapperTemperature').addClass('display-none');
            $('#positionTogetherWrapperTemperature').removeClass('display-none').show();
            $this.addClass('active');
            $this.siblings('.text-link').removeClass('active');
            $operateItem.find('.nav-link').removeClass('active');
            selectTypeDynamic = 4;
            $('#paginationTimeWrapTemperature').addClass('display-none');
            $('#paginationScoreWrapTemperature').addClass('display-none');
            pageMergeType = 2;
            $('#sortByTimeTotalTemperature').addClass('hide');
            $('#sortTotalTemperature').addClass('hide');
            $('#timeTogetherTotalTemperature').addClass('hide');
            $('#positionTogetherTotalTemperature').removeClass('hide');
        }
    });

    // 纯动态页面 点击轨迹分析按钮
    $('#courseAnalyseTemperature').on('click', function () {
        var data = $('#courseAnalyseTemperature').data('trakData');
        if (data.length === 0) {
            warningTip.say('请选择图片')
        } else {
            initTimeLine(data, $('#auiTimeLineTemperature'));
            $('#current-page-temperature').addClass('display-none');
            $('#currentPagePathTemperature').removeClass('display-none');
        }
    })

    // 动态检索 点击图片上的多选
    $("#current-page-temperature").on('click', '.image-card-list .image-card-box .image-checkbox-wrap', function (e) {
        e.stopPropagation;
        var $this = $(this).find('.ui-checkboxradio-label'), // 多选框
            index = $this.closest('.image-card-wrap').index(), // 当前图片索引
            allSelectedCardList = $('#courseAnalyseTemperature').data('trakData') && $('#courseAnalyseTemperature').data('trakData').length > 0 ? $('#courseAnalyseTemperature').data('trakData') : [];
        // 取消选中
        if ($this.hasClass('ui-checkboxradio-checked')) {
            // 聚合分组 去掉自身 + 标题中的全选
            $this.removeClass('ui-checkboxradio-checked').closest('.image-card-list').find('.image-card-list-title .ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            // 动态库 去掉功能区全选
            $('#selectAllSnappingTemperature').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
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
                    if (e.picId === sortListTemperature[index].picId) {
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
                judgeSelectePageAll($('#sortByTimeWrapperTemperature'));
            } else if (selectTypeDynamic === 2) { // 按相似度排序
                allSelectedCardList.push(sortListTemperature[index]);
                judgeSelectePageAll($('#search-infoTemperature'));
            } else if (selectTypeDynamic === 3) { // 按时间聚合
                var rowIndex = $this.closest('.image-card-list').index();
                allSelectedCardList.push(timeTogetherListDynamic[rowIndex].list[index]);
                judgeSelectePageAll($('#timeTogetherWrapperTemperature'));
                judgeSelecteAll($this.closest('.image-card-list'));
            } else if (selectTypeDynamic === 4) { // 按地点聚合
                var rowIndex = $this.closest('.image-card-list').index();
                allSelectedCardList.push(positionTogetherListDynamic[rowIndex].list[index]);
                judgeSelectePageAll($('#positionTogetherWrapperTemperature'));
                judgeSelecteAll($this.closest('.image-card-list'));
            }
        }
        // 所有选中数据 去重
        allSelectedCardList = unique(allSelectedCardList);
        // 轨迹分析按钮 是否可用
        if (allSelectedCardList.length > 0) {
            $('#courseAnalyseTemperature').removeClass('disabled');
        } else {
            $('#courseAnalyseTemperature').addClass('disabled');
        }
        // 将所有选中的图片数据 绑定在轨迹分析按钮上
        $('#courseAnalyseTemperature').data({
            'trakData': allSelectedCardList
        });
    });

    // 聚合 点击分组标题前的全选
    $('#current-page-temperature').on('click', '.image-card-list .image-card-list-title .image-checkbox-wrap', function (e) {
        e.stopPropagation;
        var $this = $(this).find('.ui-checkboxradio-label'), // 当前多选框
            allSelectedCardList = $('#courseAnalyseTemperature').data('trakData') && $('#courseAnalyseTemperature').data('trakData').length > 0 ? $('#courseAnalyseTemperature').data('trakData') : []; // 被选中的所有数据
        // 取消全选
        if ($this.hasClass('ui-checkboxradio-checked')) {
            $('#selectAllSnappingTemperature').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 去掉功能区全选
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
                judgeSelectePageAll($('#timeTogetherWrapperTemperature'));
            } else if (selectTypeDynamic === 4) { // 按地点聚合
                var rowIndex = $this.closest('.image-card-list').index();
                positionTogetherListDynamic[rowIndex].list.forEach(function (e) {
                    allSelectedCardList.push(e);
                });
                judgeSelectePageAll($('#positionTogetherWrapperTemperature'));
            }
            // 所有选中的数据去重
            allSelectedCardList = unique(allSelectedCardList);
        }
        // 轨迹分析按钮 是否可用
        if (allSelectedCardList.length > 0) {
            $('#courseAnalyseTemperature').removeClass('disabled');
        } else {
            $('#courseAnalyseTemperature').addClass('disabled');
        }
        $('#courseAnalyseTemperature').data({
            'trakData': allSelectedCardList
        });
    })

    // 动态库 功能区 点击全选
    $(document).on('click', '#selectAllSnappingTemperature', function () {
        var $this = $(this).find('.ui-checkboxradio-label'); // 当前点击的全选框
        allSelectedCardList = $('#courseAnalyseTemperature').data('trakData') && $('#courseAnalyseTemperature').data('trakData').length > 0 ? $('#courseAnalyseTemperature').data('trakData') : []; // 所有被选中的数据
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
                $('#sortByTimeWrapperTemperature').find('.image-card-wrap').addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 图片选中
                sortTimeListDynamic.map(function (e) {
                    allSelectedCardList.push(e);
                });
            } else if (selectTypeDynamic === 2) { // 按相似度排序
                $('#search-infoTemperature').find('.image-card-wrap').addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 图片选中
                sortListTemperature.map(function (e) {
                    allSelectedCardList.push(e);
                });
            } else if (selectTypeDynamic === 3) { // 按时间聚合
                $('#timeTogetherWrapperTemperature').find('.image-card-wrap').addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 图片选中
                $('#timeTogetherWrapperTemperature').find('.image-card-list-title .ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 聚合分组 标题显示全选
                timeTogetherListDynamic.map(function (e) {
                    e.list.map(function (item) {
                        allSelectedCardList.push(item);
                    });
                });
            } else if (selectTypeDynamic === 4) { // 按地点聚合 
                $('#positionTogetherWrapperTemperature').find('.image-card-wrap').addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 图片选中
                $('#positionTogetherWrapperTemperature').find('.image-card-list-title .ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 聚合分组 标题显示全选
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
                $('#sortByTimeWrapperTemperature').find('.image-card-wrap').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 图片去掉选中
                sortTimeListDynamic.map(function (e, n) {
                    allSelectedCardList.map(function (item, index) {
                        if (e.picId === item.picId) {
                            allSelectedCardList.splice(index, 1);
                        }
                    })
                });
            } else if (selectTypeDynamic === 2) { // 按相似度排序
                $('#search-infoTemperature').find('.image-card-wrap').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 图片去掉选中
                sortListTemperature.map(function (e, n) {
                    allSelectedCardList.map(function (item, index) {
                        if (e.picId === item.picId) {
                            allSelectedCardList.splice(index, 1);
                        }
                    })
                });
            } else if (selectTypeDynamic === 3) { // 按时间聚合
                $('#timeTogetherWrapperTemperature').find('.image-card-wrap').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 图片去掉选中
                $('#timeTogetherWrapperTemperature').find('.image-card-list-title .ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 聚合分组 标题去掉全选
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
                $('#positionTogetherWrapperTemperature').find('.image-card-wrap').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 图片去掉选中
                $('#positionTogetherWrapperTemperature').find('.image-card-list-title .ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 聚合分组 标题去掉全选
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
        console.log(allSelectedCardList);
        // 轨迹分析按钮 是否可用
        if (allSelectedCardList.length > 0) {
            $('#courseAnalyseTemperature').removeClass('disabled');
        } else {
            $('#courseAnalyseTemperature').addClass('disabled');
        }
        // 轨迹分析按钮 赋值
        $('#courseAnalyseTemperature').data({
            'trakData': allSelectedCardList
        });
    })

    // 纯动态页面 点击轨迹分析返回按钮
    $('#backToSearchTemperature').on("click", function () {
        $('#current-page-temperature').removeClass('display-none');
        $('#currentPagePathTemperature').addClass('display-none');
        if (selectTypeDynamic == 1) {
            judgeSelectePageAll($('#sortByTimeWrapperTemperature'));
        } else if (selectTypeDynamic == 2) {
            judgeSelectePageAll($('#search-infoTemperature'));
        } else if (selectTypeDynamic == 3) {
            judgeSelectePageAll($('#timeTogetherWrapperTemperature'));
            $('#timeTogetherWrapperTemperature').find('.image-card-list').each(function (index, el) {
                judgeSelecteAll($(el));
            });
        } else if (selectTypeDynamic == 4) {
            judgeSelectePageAll($('#positionTogetherWrapperTemperature'));
            $('#positionTogetherWrapperTemperature').find('.image-card-list').each(function (index, el) {
                judgeSelecteAll($(el));
            });
        }
    });

    // 纯动态页面 hover 显示中图
    $('#current-page-temperature').on('mouseover', '.wrap-empty-center .image-card-wrap', function () {
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
            $this.closest('.searchTemperatureOnly').append(html);
            var docH = document.documentElement.clientHeight,
                //$imgHover = $this.siblings('.card-img-hover'),
                $imgHover = $('.searchTemperatureOnly').find('.card-img-hover'),
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

    $('#current-page-temperature').on('mouseout', '.wrap-empty-center .image-card-wrap', function () {
        $(this).closest('.searchTemperatureOnly').find('.card-img-hover').remove();
        window.clearTimeout(cardImgHoverTimer);
        var highlightOption = {
            type: 'removeHighlightArea'
        };
        var searchMapTemperatureIframe = document.getElementById('search_map_iframeTemperature');
        var targetOrigin = mapUrl + 'peopleCity.html';
        searchMapTemperatureIframe.contentWindow.postMessage(highlightOption, targetOrigin);
    });

    //纯动态检索点击图文切换图表
    $("#snappingWrapTemperature").on("click", "#showCardSearchTemperature", function () { //小图
        if (!$("#timeTogetherWrapperTemperature").hasClass("display-none")) {
            for (var i = 0; i < $("#timeTogetherWrapperTemperature").find(".image-card-list").length; i++) {
                if ($("#timeTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-wrap.type-5").length > 8) {
                    if ($("#timeTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-list-title button").length == 0) {
                        $("#timeTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-list-title").append(`< button class="btn btn-link" type = "button" > ${$("#timeTogetherWrapperTemperature").find(".image-card-list").eq(i).hasClass("showMore") ? '查看更多' : '收起'}</button > `);
                    }
                } else {
                    if ($("#timeTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-list-title button").length > 0) {
                        $("#timeTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-list-title button").remove();
                    }
                }
            }
        }
        if (!$("#positionTogetherWrapperTemperature").hasClass("display-none")) {
            for (var i = 0; i < $("#positionTogetherWrapperTemperature").find(".image-card-list").length; i++) {
                if ($("#positionTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-wrap.type-5").length > 8) {
                    if ($("#positionTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-list-title button").length == 0) {
                        $("#positionTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-list-title").append(`< button class="btn btn-link" type = "button" > ${$("#positionTogetherWrapperTemperature").find(".image-card-list").eq(i).hasClass("showMore") ? '查看更多' : '收起'}</button > `);
                    }
                } else {
                    if ($("#positionTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-list-title button").length > 0) {
                        $("#positionTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-list-title button").remove();
                    }
                }
            }
        }
        togetherShowMore();
        $("#snappingWrapTemperature").find("li.image-card-wrap").css({
            width: 'calc(12.5% - .625rem)'
        });
        $("#snappingWrapTemperature").find("li.image-card-wrap>.image-card-box").css({
            width: '100%'
        });
        $("#snappingWrapTemperature").find("li.image-card-wrap>.image-card-message-box").css({
            width: 'auto'
        });
        $("#snappingWrapTemperature").find("li.image-card-wrap>.image-card-info").addClass("hide");
        $(this).addClass("btn-primary").siblings().removeClass("btn-primary");
    }).on("click", "#showListSearchTemperature", function () {
        if (!$("#timeTogetherWrapperTemperature").hasClass("display-none")) {
            for (var i = 0; i < $("#timeTogetherWrapperTemperature").find(".image-card-list").length; i++) {
                if ($("#timeTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-wrap.type-5").length > 4) {
                    if ($("#timeTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-list-title button").length == 0) {
                        $("#timeTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-list-title").append(`< button class="btn btn-link" type = "button" > ${$("#timeTogetherWrapperTemperature").find(".image-card-list").eq(i).hasClass("showMore") ? '查看更多' : '收起'}</button > `);
                    }
                } else {
                    if ($("#timeTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-list-title button").length > 0) {
                        $("#timeTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-list-title button").remove();
                    }
                }
            }
        }
        if (!$("#positionTogetherWrapperTemperature").hasClass("display-none")) {
            for (var i = 0; i < $("#positionTogetherWrapperTemperature").find(".image-card-list").length; i++) {
                if ($("#positionTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-wrap.type-5").length > 4) {
                    if ($("#positionTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-list-title button").length == 0) {
                        $("#positionTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-list-title").append(`< button class="btn btn-link" type = "button" > ${$("#positionTogetherWrapperTemperature").find(".image-card-list").eq(i).hasClass("showMore") ? '查看更多' : '收起'}</button > `);
                    }
                } else {
                    if ($("#positionTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-list-title button").length > 0) {
                        $("#positionTogetherWrapperTemperature").find(".image-card-list").eq(i).find(".image-card-list-title button").remove();
                    }
                }
            }
        }
        togetherShowMore();
        $("#snappingWrapTemperature").find("li.image-card-wrap").css({
            width: 'calc(25% - .625rem)'
        });
        $("#snappingWrapTemperature").find("li.image-card-wrap>.image-card-box").css({
            width: '35%'
        });
        $("#snappingWrapTemperature").find("li.image-card-wrap>.image-card-message-box").css({
            width: '34%'
        });
        $("#snappingWrapTemperature").find("li.image-card-wrap>.image-card-info").removeClass("hide");
        $(this).addClass("btn-primary").siblings().removeClass("btn-primary");
    });

    //检索地图初始化
    window.addEventListener("message", function (ev) {
        var mydata = ev.data;
        if (mydata == 'initMap' || mydata == 'initMap?' || mydata == 'initMap?44031' && $('#search_map_iframeTemperature').length > 0) {
            var searchMapTemperatureIframe = document.getElementById('search_map_iframeTemperature');
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
            var searchMapTemperatureData = {
                type: "cluster",
                mydata: []
            };
            window.setTimeout(function () {
                searchMapTemperatureIframe.contentWindow.postMessage(mapOperationData, targetOrigin);
                searchMapTemperatureIframe.contentWindow.postMessage(searchMapTemperatureData, targetOrigin);
                searchMapTemperatureIframe.contentWindow.postMessage({
                    type: 'fullExtent'
                }, targetOrigin);
            }, 2000);
        }
    });

    // 点击导出事件
    $("#aui-icon-importTemperature").on('click', function () {
        showLoading($("#aui-icon-importTemperature"))
        var allSelectedCardList = $('#courseAnalyseTemperature').data('trakData') && $('#courseAnalyseTemperature').data('trakData').length > 0 ? $('#courseAnalyseTemperature').data('trakData') : [],
            _datas = [],
            _data = {},
            port = 'v2/faceDt/exportImagesToCache';
        if (allSelectedCardList.length === 0) {
            hideLoading($("#aui-icon-importTemperature"))
            warningTip.say('请选择导出图片！');
            return false;
        }
        if (allSelectedCardList.length > 100) {
            hideLoading($("#aui-icon-importTemperature"))
            warningTip.say('不能超过100张！');
            return false;
        }
        //获取选择的图片
        allSelectedCardList.forEach(function (item) {
            _data = {
                picId: item.picId,
                smallPicUrl: item.smallPicUrl,
                name: item.cameraName,
                time: item.captureTime
            };
            _datas.push(_data);
        });
        var datas = {
            data: _datas
        };
        //第一步，先将图片信息传到后台
        successFunc = function (info) {
            if (info.code === '200') {
                //第二步，导出
                var token = $.cookie('xh_token');
                $("#exportIframeTemperature").attr("src", encodeURI(serviceUrl + "/v2/faceDt/exportImages?token=" + token + "&downId=" + info.downId));
            }
            hideLoading($("#aui-icon-importTemperature"))
        };
        loadData(port, true, datas, successFunc);
    });

    //区域切换类点
    $("#current-page-temperature").on("change", ".cameraTypeSearch input", function () {
        if ($("#sidebarPoliceSelectTemperature").val() && $("#selMergeCameraIDTemperature").attr("link") != '0') {
            loadSearchCameraInfo($("#sidebarCameraSelectTemperature"), $("#sidebarPoliceSelectTemperature").val());
        }
    });

    window.initDatePicker1($('#searchMerge_Temperature'), -30); // 初始化其他事件下的时间控件
    initDynamic($("#sidebarOrgSelectTemperature"), $("#sidebarPoliceSelectTemperature"), $("#sidebarCameraSelectTemperature")); // 左侧 分局和派出所的下拉选择 searchCommon中的方法
    initPageDynamic(); // 初始化图片容器
    loadMapCameraList(); // 地图选择摄像头事件 common中的方法
    dropSelectTemperature($("#current-page-temperature"));//区域拖拽
})();