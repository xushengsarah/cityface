(function (window, $) {
    // 定义区域地图全局变量来分辨是否在在派出所层面
    globalMapData = '', globalCodeData = '', globalOrgIdData = ''; // allNum市请求  allPCSNum公安局请求
    var globalTypeData = 'yldCount',
        globalColorData = 'blue',
        clickIntoMapData = false,
        controlTotal = '';

    initDashboardPage();

    function initDashboardPage() {
        loadUserInfoD();
        getApplicationEffectData(); //应用成效
        getUserInfoAccountData(); //用户情况
        getUserActiveAccountData(1); //用户活跃度
        getAlgorithmCompare1(1); // 厂家评比
        cameraPhotographData(1);//抓拍情况
        getTaskStatusData(2); //布控任务统计--任务状态
        //getEmphasisAlarmData(); //布控任务统计--告警状态
        getQueryLibCountsTrendData(1); // 静态人像趋势统计
        getSearchFaceCountsData2(1) // 动静检索次数
        getCameraSurveyData(4); // 其他统计指标初始化
        getTop5AlarmTask(); // 最新告警任务
        getResourceStateData() // 资源状况统计

        //初始化地图地址
        $("#dashboardMap").attr({
            value: mapUrl + 'peopleCityBlack.html?orgid=44032',
            src: mapUrl + 'peopleCityBlack.html?orgid=44032'
        })
    }

    //数据获取 获取登录用户信息
    function loadUserInfoD() {
        var port = 'v2/user/getUserInfo',
            successFunc = function (data) {
                if (data.code === '200') {
                    orgCodeArr = data.fullOrgCode.split('/');
                    orgIdArr = data.fullOrgId.split('/');
                    if (orgCodeArr.length == 2) { // 市级
                        globalMapData = 'allNum';
                        globalCodeData = orgCodeArr[1].slice(0, 4);
                        globalOrgIdData = orgIdArr[1].split('.')[0];
                    } else { // 公安局 派出所
                        globalMapData = 'allPCSNum';
                        globalCodeData = orgCodeArr[2].slice(0, 6);
                        globalOrgIdData = orgIdArr[2].split('.')[0];
                    }

                    loadOrgInfoD(); // 加载机构信息 机构id初始化为“ 10 ~ 深圳市公安局 ”
                }
            };
        loadData(port, true, null, successFunc, '', 'GET');
    }

    //管理者登陆 数据获取 获取机构信息
    function loadOrgInfoD() {
        var port = 'v2/org/getOrgInfos',
            data = {
                orgType: 1,
                userType: 2,
                returnType: 3
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    var result = data.data;
                    if (result) {
                        var isGlobalOrgId = false;
                        for (var i = 0; i < result.length; i++) {
                            // 判断是否含有此公安局
                            if (globalOrgIdData == result[i].orgId) {
                                isGlobalOrgId = true
                            }
                        }

                        // 用户是不是市级用户且机构不包含此数据
                        if (globalMapData !== 'allNum' && !isGlobalOrgId) {
                            globalMapData = 'allNum';
                            globalCodeData = '4403';
                        }

                        // 滚动数据初始化
                        refreshTopDataInfo();
                    }
                } else {
                    warning.say(data.msg);
                }
            };
        loadData(port, true, data, successFunc, undefined, 'GET');
    }

    /**
     * 公共函数 深拷贝函数
     * @param {Object} 拷贝对象
     */
    function deepCopy(obj) {
        var result = Array.isArray(obj) ? [] : {};
        if (obj && typeof obj === 'object') {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (obj[key] && typeof obj[key] === 'object') {
                        result[key] = deepCopy(obj[key]);
                    } else {
                        result[key] = obj[key];
                    }
                }
            }
        }
        return result;
    }

    /**
     * 登录数据转换 即今日登录数、当前用户数数据转换
     * @param {Number} 
     */
    function numberChange(number) {
        var numLen = number.length;
        if (numLen > 3) {
            number = number.substr(0, numLen - 3) + ',' + number.substr(numLen - 3);
        }
        return number;
    }

    /**
     * 获取周月年日期公用方法
     * @param {String} type 类型周1，月2，年3
     */
    function getDateDateDashboardCommon(type) {
        let nowDate = new Date(),  //当前日期
            oneDaySpace = 1000 * 60 * 60 * 24,  //时间间隔一天
            startData = nowDate.getTime() - oneDaySpace, //开始日期
            dataList = [],  //返回的数据数组
            dateList = [];  //返回的时间数组
        switch (type.toString()) {
            //周
            case '1':
                let weekNum = 7;
                for (let i = 0; i < weekNum; i++) {
                    dataList.push('0');
                    let dateArr = changeFormat(startData - oneDaySpace * i).split("-");
                    dateList.unshift(`${parseInt(dateArr[1])}.${parseInt(dateArr[2])}`);
                }
                break;
            //月
            case '2':
                let monthNum = 5,
                    monthSpace = 7;
                for (let i = 0; i < monthNum; i++) {
                    dataList.push('0');
                    let dateArr = changeFormat(startData - oneDaySpace * i * monthSpace).split("-");
                    dateList.unshift(`${parseInt(dateArr[1])}.${parseInt(dateArr[2])}`);
                }
                break;
            //年
            case '3':
                let yearNow = nowDate.getMonth();
                for (let i = 0; i < yearNow; i++) {
                    dataList.push('0');
                    dateList.push(`${i + 1}月`);
                }
                break;
        }
        return {
            date: dateList,
            data: dataList
        };
    };

    /**
     * 今日登录数、当前用户
     */
    window.loadData('index/getUserLoginCount', true, {}, function (data) {
        var $num = $('#boardMsgWrap').find('.number');
        if (data.code === '000') {
            $num.eq(0).text(numberChange(data.result.loginCount));
            $num.eq(1).text(numberChange(data.result.onlineUserCount));
        } else {
            $num.text(0);
        }
    });

    // 绑定头部返回按钮事件
    $('.header .header-back').on('click', function () {
        $('.layui-layer-setwin').children().eq(-1).click();
    });

    /*** 模块1 应用成效***/
    function getApplicationEffectData() {
        $("#applicationEffectTable").addClass("hide").siblings().removeClass("hide");
        window.loadData('v3/dataBoard/getApplicationEffect', true, {}, function (data) {
            if (data.code == '200') {
                if (data.data) {
                    $("#applicationEffectTable").removeClass("hide").siblings().addClass("hide");
                    var result = data.data,
                        html = `<tr>
                                <td>动态检索总数</td>
                                <td class="tableNum">${result.dynamicTotal || 0}</td>
                                <td>提供服务接口数</td>
                                <td class="tableNum">${result.thirdJoinUpTotal || 0}</td>
                            </tr>
                            <tr>
                                <td>日均动态检索次数</td>
                                <td class="tableNum">${result.dayDynamicTotal || 0}</td>
                                <td>支撑案件数</td>
                                <td class="tableNum">${result.supportCaseTotal || 0}</td>
                            </tr>
                            <tr>
                                <td>静态检索总数</td>
                                <td class="tableNum">${result.staticTotal || 0}</td>
                                <td>人像破案反馈案件数</td>
                                <td class="tableNum">${result.caseFeedbackTotal || 0}</td>
                            </tr>
                            <tr>
                                <td>日均静态检索次数</td>
                                <td class="tableNum">${result.dayStaticTotal || 0}</td>
                                <td>人像抓拍机总数</td>
                                <td class="tableNum">${result.faceCameraTotal || 0}</td>
                            </tr>
                            <tr>
                                <td>日均告警数</td>
                                <td class="tableNum">${result.dayAlarmTotal || 0}</td>
                            </tr>`;
                    $("#applicationEffectTable").html(html);
                } else {
                    $("#applicationEffectTable").addClass("hide").siblings().removeClass("hide");
                }
            } else {
                $("#applicationEffectTable").addClass("hide").siblings().removeClass("hide");
            }
        }, undefined, 'GET');
    }
    /*** 模块1 应用成效***/

    /*** 模块2 用户情况***/
    var userInfoOption = {
        title: {
            text: '深目开通城市人像权限情况',
            textStyle: {
                color: '#bac5cc',
                fontSize: 12
            },
            bottom: 'bottom',
            left: 'center'
        },
        tooltip: {
            position: ['50%', '50%'],
            trigger: 'item',
            formatter: function (params) {
                return params.data.name + ': ' + params.data.value
            }
        },
        legend: {
            textStyle: {
                color: '#bac5cc',
                fontSize: 10
            },
            itemWidth: 10,
            itemHeight: 10,
            left: 'left',
            data: []
        },
        color: ['#3795fe', '#01b9d3'],
        series: [{
            type: 'pie',
            radius: ['0', '40%'],
            center: ['50%', '50%'],
            data: [],
            markArea: {
                label: {
                    fontSize: 12
                }
            },
            label: {
                fontSize: 10,
                formatter: '{d}%\n{b}'
            },
            labelLine: {
                length: 5,
                length2: 5
            }
        }]
    }

    //获取账号情况数据
    function getUserInfoAccountData() {
        showLoading($('#getUserInfoChart1').parent());
        window.loadData('v3/dataBoard/getAccountInfo', true, {}, function (data) {
            hideLoading($('#getUserInfoChart1').parent());
            let option = deepCopy(userInfoOption),
                queryChart = echarts.init(document.getElementById('getUserInfoChart1'))
            if (data.code == '200' && data.data) {
                $("#getUserInfoChart1").removeClass("hide").siblings().addClass("hide");
                let result = data.data;
                option.legend.data = ['开通账号', '未开通账号'];
                option.series[0].data = [{
                    value: parseInt(result.powerAccountTotal || 0),
                    name: '开通账号'
                }, {
                    value: parseInt(result.accountTotal) - parseInt(result.powerAccountTotal),
                    name: '未开通账号'
                }];
                queryChart.setOption(option, true);

                $(window).off('resize.getUserInfoChart1').on('resize.getUserInfoChart1', function () {
                    queryChart.resize();
                });
            } else {
                $("#getUserInfoChart1").addClass("hide").siblings().removeClass("hide");
            }
        }, '', 'GET');
    }

    //获取用户活跃情况数据
    function getUserActiveAccountData(dateType) {
        showLoading($('#getUserInfoChart2').parent());
        window.loadData('v3/dataBoard/getActiveTotal', true, {
            dateType
        }, function (data) {
            hideLoading($('#getUserInfoChart2').parent());
            let option = deepCopy(userInfoOption),
                queryChart = echarts.init(document.getElementById('getUserInfoChart2'))
            if (data.code == '200' && data.data) {
                $("#getUserInfoChart2").removeClass("hide").siblings().addClass("hide");
                let result = data.data;
                option.title.text = '城市人像用户活跃情况';
                option.legend.data = ['活跃用户', '不活跃用户'];
                option.series[0].data = [{
                    value: parseInt(result.activeAccountTotal || 0),
                    name: '活跃用户'
                }, {
                    value: parseInt(result.powerAccountTotal) - parseInt(result.activeAccountTotal),
                    name: '不活跃用户'
                }];
                queryChart.setOption(option, true);

                $(window).off('resize.getUserInfoChart2').on('resize.getUserInfoChart2', function () {
                    queryChart.resize();
                });
            } else {
                $("#getUserInfoChart2").addClass("hide").siblings().removeClass("hide");
            }
        });
    }

    // 给节点中添加按钮的点击事件
    var $getUserInfoChart2BtnBox = $('#getUserInfoChart2').parents(".dot-card-body").find(".body-right-box"),
        $getUserInfoChart2Btn = $getUserInfoChart2BtnBox.find('.btn');
    $getUserInfoChart2Btn.on('click', function () {
        var $this = $(this),
            thisIndex = $this.index() + 1,
            thisCls = $this.hasClass('btn-primary');
        if (thisCls) {
            return;
        }
        $this.addClass('btn-primary').siblings().removeClass('btn-primary');
        getUserActiveAccountData(thisIndex);
    });
    /*** 模块2 用户情况***/

    /*** 模块3 静态人像算法评比***/
    //静态人像算法评比配置信息
    var cameraOption = {
        title: {
            text: '精准度排名',
            textStyle: {
                color: '#bac5cc',
                fontSize: 12
            },
            left: 'center'
        },
        grid: {
            top: '10%',
            bottom: '10%',
            left: '20%',
            right: '8%',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        xAxis: {
            show: true,                //是否显示x轴
            splitLine: {
                lineStyle: {
                    color: 'rgb(43, 49, 56)'
                }
            },
            axisLine: {
                show: true,
                textStyle: {
                    fontSize: 8
                },
            },
            axisLabel: {
                show: true,
                fontWeight: 'lighter',
                margin: 4,
                textStyle: {
                    color: '#bac5cc'
                }
            }
            //data: [0, 2, 4, 6, 8, 10]
        },
        yAxis: [{
            name: '厂家',
            nameLocation: 'start',
            type: 'category',
            inverse: true,               //让y轴数据逆向
            axisLabel: {
                show: true,
                margin: 4,
                textStyle: {
                    color: '#bac5cc',   //y轴字体颜色
                    fontSize: 10
                },
                // formatter: function (value, index) {
                //     return [
                //         '{lg|' + (index + 1) + '}' + '{title|' + value + '} '
                //     ].join('\n');
                // },
                //定义富文本标签
                rich: {
                    lg: {
                        fontWeight: 'bold',
                        fontSize: 12,       //字体默认12
                        color: '#08C',
                        padding: [0, 0, 0, 0]
                    },
                    title: {
                        color: '#7b8084',
                        fontWeight: 'lighter'
                    }
                }
            },
            splitLine: { show: false },   //横向的线
            axisTick: { show: false },    //y轴的端点
            axisLine: { show: false },    //y轴的线
            data: []
        }, {
            name: '排名',
            nameLocation: 'start',
            type: 'category',
            inverse: true,               //让y轴数据逆向
            axisLabel: {
                show: true,
                margin: 4,
                textStyle: {
                    color: '#bac5cc',   //y轴字体颜色
                    fontSize: 10
                },
                // formatter: function (value, index) {
                //     return [
                //         '{lg|' + (index + 1) + '}' + '{title|' + value + '} '
                //     ].join('\n');
                // },
                //定义富文本标签
                rich: {
                    lg: {
                        fontWeight: 'bold',
                        fontSize: 12,       //字体默认12
                        color: '#08C',
                        padding: [0, 0, 0, 0]
                    },
                    title: {
                        color: '#7b8084',
                        fontWeight: 'lighter'
                    }
                }
            },
            splitLine: { show: false },   //横向的线
            axisTick: { show: false },    //y轴的端点
            axisLine: { show: false },    //y轴的线
            data: []
        }],
        series: [{
            name: '数据内框',
            type: 'bar',
            itemStyle: {
                normal: {
                    color: '#3795fe',
                    // label: {
                    //     show: true,
                    //     position: 'right',
                    // }
                }
            },
            barWidth: 8,
            data: []
        }]
    };
    function getAlgorithmCompare1(dateType) {
        showLoading($('#algorithmCompare').parent(), true);
        window.loadData('v3/factoryCompare/getRanking', true, {
            dateType
        }, function (data) {
            hideLoading($('#algorithmCompare').parent(), true);
            let option = deepCopy(cameraOption),
                optionRank = deepCopy(cameraOption);
            if (data.code == '200' && data.data) {
                $('#algorithmCompare').find(".chart").eq(0).removeClass("hide").siblings().addClass("hide");
                $('#algorithmCompare').find(".chart").eq(1).removeClass("hide").siblings().addClass("hide");
                let result = data.data,
                    resultY = JSON.parse(JSON.stringify(result)),
                    optionTwoY = [],
                    optionSortY = [],
                    optionY = [],
                    optionRankX = [],
                    optionRankValue = [],
                    optionX = [],
                    resultList = [],
                    queryChartOne = echarts.init($('#algorithmCompare').find(".chart").eq(0)[0]),
                    queryChartTwo = echarts.init($('#algorithmCompare').find(".chart").eq(1)[0]);
                //排序1
                for (let i = 0; i < result.length; i++) {
                    optionX.push(parseFloat(result[i].aveScore));
                    optionTwoY.push(result[i].platformName);
                    optionSortY.push(i + 1);
                    // optionRankX.push(parseFloat(result[i].aveDuration / 1000));
                }
                resultY.sort((a, b) => {
                    return a.durationRanking - b.durationRanking;
                })
                for (let i = 0; i < resultY.length; i++) {
                    optionY.push(resultY[i].platformName);
                    optionRankX.push(parseFloat(resultY[i].aveDuration / 1000));
                }
                option.series[0].itemStyle.normal.color = '#3795fe';
                option.title.text = '精准度排名(分数)';
                option.tooltip.formatter = function (parmas) {
                    let html = '';
                    for (let i = 0; i < result.length; i++) {
                        if (parmas[0].name == result[i].platformName) {
                            html = `精准度排名:${result[i].platformName}<br>
                                    平均分:${result[i].aveScore}<br>
                                    `;
                            for (let j = 0; j < result[i].list.length; j++) {
                                html += `${result[i].list[j].topName}：${result[i].list[j].topNum}<br>`;
                            }
                            break;
                        }
                    }
                    return html;
                }
                option.xAxis.max = 10;
                option.yAxis[0].data = optionTwoY;
                option.yAxis[1].data = optionSortY;
                option.series[0].data = optionX;
                queryChartOne.setOption(option, true);

                // 排序2
                optionRank.series[0].itemStyle.normal.color = '#01b9d3';
                optionRank.title.text = '性能排名(响应时长/秒)';
                optionRank.tooltip.formatter = function (parmas) {
                    let html = '';
                    for (let i = 0; i < result.length; i++) {
                        if (parmas[0].name == result[i].platformName) {
                            html = `${result[i].platformName}<br>
                                    性能排名：${parseFloat(result[i].durationRanking)}<br>
                                    请求总次数：${parseFloat(result[i].reqCount) || 0}<br>
                                    平均响应时长：${parseFloat(result[i].aveDuration) / 1000 + 's'}<br>`;
                            break;
                        }
                    }
                    return html;
                }
                optionRank.xAxis.axisLabel.formatter = function (value, index) {
                    return value;
                }
                optionRank.yAxis[0].data = optionY;
                optionRank.yAxis[1].data = optionSortY;
                optionRank.series[0].data = optionRankX;
                queryChartTwo.setOption(optionRank, true);

                $(window).off('resize.algorithmCompare').on('resize.algorithmCompare', function () {
                    queryChartOne.resize();
                    queryChartTwo.resize();
                });
            } else {
                $('#algorithmCompare').find(".chart").eq(0).addClass("hide").siblings().removeClass("hide");
                $('#algorithmCompare').find(".chart").eq(1).addClass("hide").siblings().removeClass("hide");
            }
        });
    }

    // 给节点中添加按钮的点击事件
    var $algorithmCompare = $('#algorithmCompare').find(".body-right-box"),
        $algorithmCompareBtn = $algorithmCompare.find('.btn');
    $algorithmCompareBtn.on('click', function () {
        var $this = $(this),
            thisIndex = $this.index() + 1,
            thisCls = $this.hasClass('btn-primary');
        if (thisCls) {
            return;
        }
        $this.addClass('btn-primary').siblings().removeClass('btn-primary');
        getAlgorithmCompare1(thisIndex);
    });
    /*** 模块3 静态人像算法评比***/

    /***模块4 静态人像趋势统计***/
    //静态人像趋势图表初始化
    var queryLibCountsTrendOption = {
        grid: {
            top: '17%',
            bottom: 20,
            left: 55,
            right: 10
        },
        legend: {
            data: ['全量库', '唯一库'],
            left: 0,
            textStyle: {
                color: '#bac5cc'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line'
            }
        },
        xAxis: {
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            axisLabel: {
                interval: 0,
                textStyle: {
                    color: '#bac5cc',
                }
            },
            axisTick: {
                show: false
            },
            axisLine: {
                show: false,
                lineStyle: {
                    width: 2,
                    color: '#0a56ab',
                }
            },
            z: 10,
        },
        yAxis: {
            min: function (value) {
                return 0
            },
            axisLine: {
                show: false,
                color: 'red'
            },
            axisTick: {
                show: false,
                lineStyle: {
                    type: 'dashed'
                }
            },
            axisLabel: {
                textStyle: {
                    color: '#bac5cc',
                    fontSize: 10
                },
                formatter: function (value, index) {
                    if (value === 0) {
                        return value;
                    } else {
                        var formatterValueObj = dataUnitChange1(value, true, 1);
                        return formatterValueObj.value;
                    }
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgb(43, 49, 56)'
                }
            }
        },
        dataZoom: [{
            type: 'inside'
        }],
        series: [{
            name: '全量库',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            itemStyle: {
                normal: {
                    color: '#3795fe',
                    borderColor: '#3795fe',
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(55,149,254,0.3)'
                            }, {
                                offset: 1,
                                color: 'rgba(55,149,254,0.05)'
                            }]
                        ),
                    }
                }
            },
            lineStyle: {
                color: '#4B97ED',
            },
            data: ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
        }, {
            name: '唯一库',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            itemStyle: {
                normal: {
                    color: '#01b9d3',
                    borderColor: '#01b9d3',
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(1,185,211,0.5)'
                            }, {
                                offset: 1,
                                color: 'rgba(1,185,211,0)'
                            }]
                        )
                    }
                }
            },
            lineStyle: {
                color: '#01B9D3',
            },
            data: ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
        }]
    };

    // 静态人像趋势统计
    function getQueryLibCountsTrendData(type) {
        window.loadData('v3/dataBoard/staticLibStatistics', true, {
            type: type
        }, function (data) {
            if (data.code !== '200') {
                hideLoading($('#queryLibCountsTrend').parent());
                $('#queryLibCountsTrend').removeClass('hide');
                $('#queryLibCountsTrend').prev().removeClass('hide');
                $('#queryLibCountsTrend').next().addClass('hide');
                var queryLibCountsTrendChart = echarts.init(document.getElementById('queryLibCountsTrend'));
                var options = deepCopy(queryLibCountsTrendOption);
                options.xAxis.data = getDateDateDashboardCommon(type).date;
                options.series.forEach(item => {
                    item.data = getDateDateDashboardCommon(type).data;
                })
                queryLibCountsTrendChart.setOption(options, true);
            } else {
                hideLoading($('#queryLibCountsTrend').parent());
                if (data.code == '200') {
                    var result = data.data;
                    var qlStaticData = result.srcList;
                    var wyStaticData = result.uniqueList;

                    if (qlStaticData.length > 0 && wyStaticData.length > 0) {
                        $('#queryLibCountsTrend').removeClass('hide');
                        $('#queryLibCountsTrend').prev().removeClass('hide');
                        $('#queryLibCountsTrend').next().addClass('hide');
                        var queryLibCountsTrendChart = echarts.init(document.getElementById('queryLibCountsTrend'));
                        var options = deepCopy(queryLibCountsTrendOption),
                            optionsX = [],
                            ywOptionsY = [],
                            gzOptionsY = [];
                        for (var i = 0; i < qlStaticData.length; i++) {
                            gzOptionsY.push(parseFloat(qlStaticData[i].counts));
                        }
                        for (var i = 0; i < wyStaticData.length; i++) {
                            var dataArr = wyStaticData[i].statisticDay.split('-');
                            if (type === 1 || type === 2) {
                                optionsX.push(parseInt(dataArr[1]) + '.' + parseInt(dataArr[2]));
                            } else if (type === 3) {
                                optionsX.push(parseInt(dataArr[1]) + '月');
                            }
                            ywOptionsY.push(parseFloat(wyStaticData[i].counts));
                        }
                        options.xAxis.data = optionsX;
                        options.series[0].data = gzOptionsY;
                        options.series[1].data = ywOptionsY;
                        queryLibCountsTrendChart.setOption(options, true);
                        $(window).off('resize.queryLibCountsTrend').on('resize.queryLibCountsTrend', function () {
                            queryLibCountsTrendChart.resize();
                        });
                    } else {
                        $('#queryLibCountsTrend').addClass('hide');
                        $('#queryLibCountsTrend').siblings('.chart-select-btn').addClass('hide');
                        // 图标右上角日月年不消失
                        // $('#queryLibCountsTrend').siblings('.body-right-box').addClass('hide');
                        $('#queryLibCountsTrend').siblings('.chart-card-empty').removeClass('hide');
                    }
                } else {
                    $('#queryLibCountsTrend').addClass('hide');
                    $('#queryLibCountsTrend').siblings('.chart-select-btn').addClass('hide');
                    // 图标右上角日月年不消失
                    // $('#queryLibCountsTrend').siblings('.body-right-box').addClass('hide');
                    $('#queryLibCountsTrend').siblings('.chart-card-empty').removeClass('hide');
                }
            }
        });
    }

    // 给节点中添加按钮的点击事件
    var $queryLibCountsTrendChartBtnBox = $('#queryLibCountsTrend').prev(),
        $queryLibCountsTrendBtn = $queryLibCountsTrendChartBtnBox.find('.btn');
    $queryLibCountsTrendBtn.on('click', function () {
        var $this = $(this),
            thisIndex = $this.index() + 1,
            thisCls = $this.hasClass('btn-primary');
        if (thisCls) {
            return;
        }
        showLoading($('#queryLibCountsTrend').parent(), true);
        $this.addClass('btn-primary').siblings().removeClass('btn-primary');
        getQueryLibCountsTrendData(thisIndex);
    });
    /***模块4 静态人像趋势统计***/

    /***模块5 资源状况统计***/
    //资源状况统计
    function getResourceStateData(result = {}) {
        // 资源状况统计圆环
        var resourceStateData = [{
            value: 68
        }, {
            value: 32
        }];
        var resourceStateOption = {
            color: ['#2193fe', 'rgba(255,255,255,0.2)',],
            graphic: [{
                type: 'text',
                left: 'center',
                top: '41%',
                style: {
                    text: '68%',
                    textAlign: 'center',
                    fill: '#fff',
                    fontSize: 18
                }
            }],
            legend: {
                show: false
            },
            series: [{
                name: 'CPU使用率',
                type: 'pie',
                center: ['50%', '50%'],
                radius: ['60%', '75%'],
                hoverAnimation: false,
                avoidLabelOverlap: false,
                hoverOffset: 3,
                itemStyle: {
                    borderWidth: 2,
                    borderType: 'solid',
                    borderColor: '#15212d'
                },
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    },
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data: resourceStateData
            }]
        }
        window.loadData('v2/index/getResourceStatistics', true, {}, function (data) {
            var $chartBody = $('#resourceState'),
                $chartContent = $chartBody.find('.chart'),
                cpuRadioChart = echarts.init($chartContent.eq(0)[0]),
                memoryRadioChart = echarts.init($chartContent.eq(1)[0]),
                storageLoadChart = echarts.init($chartContent.eq(2)[0]),
                gpuRadioChart = echarts.init($chartContent.eq(3)[0]),
                options1 = deepCopy(resourceStateOption),
                options2 = deepCopy(resourceStateOption),
                options3 = deepCopy(resourceStateOption),
                options4 = deepCopy(resourceStateOption),
                optionsData1 = deepCopy(resourceStateData),
                optionsData2 = deepCopy(resourceStateData),
                optionsData3 = deepCopy(resourceStateData),
                optionsData4 = deepCopy(resourceStateData);
            if (data.code == '200') {
                // 假数据
                options1.graphic[0].style.text = data.data.cpuUsage + '%';
                options2.graphic[0].style.text = data.data.memUsage + '%';
                options3.graphic[0].style.text = data.data.storageUsage + '%';
                options4.graphic[0].style.text = data.data.gpuUsage + '%';
                optionsData1[0].value = parseInt(data.data.cpuUsage);
                optionsData1[1].value = 100 - parseInt(data.data.cpuUsage);
                optionsData2[0].value = parseInt(data.data.memUsage);
                optionsData2[1].value = 100 - parseInt(data.data.memUsage);
                optionsData3[0].value = parseInt(data.data.storageUsage);
                optionsData3[1].value = 100 - parseInt(data.data.storageUsage);
                optionsData4[0].value = parseInt(data.data.gpuUsage);
                optionsData4[1].value = 100 - parseInt(data.data.gpuUsage);

                options1.series[0].data = optionsData1;
                options2.series[0].data = optionsData2;
                options3.series[0].data = optionsData3;
                options4.series[0].data = optionsData4;

                cpuRadioChart.setOption(options1, true);
                memoryRadioChart.setOption(options2, true);
                storageLoadChart.setOption(options3, true);
                gpuRadioChart.setOption(options4, true);
                $(window).off('resize.resourceState').on('resize.resourceState', function () {
                    cpuRadioChart.resize();
                    memoryRadioChart.resize();
                    storageLoadChart.resize();
                    gpuRadioChart.resize();
                });
            } else {
            }
        }, undefined, 'GET');
    }
    /***模块5 资源状况统计***/

    /*** 模块6 最新告警任务***/
    //滚动计时器
    var listTopTimer = '';

    //获取最新告警数据
    function getTop5AlarmTask() {
        var data = new Date();
        var endData = data.pattern("yyyy-MM-dd hh:mm:ss");
        data.setDate(data.getDate() - 7); //获取7天前的日期
        var startData = data.pattern("yyyy-MM-dd hh:mm:ss");
        window.loadData('v2/bkAlarm/alarmList', true, {
            page: 1,
            size: 10,
            viewType: 1,
            showType: 2,
            status: 0,
            startTime: startData,
            endTime: endData
        }, function (data) {
            var $list = $('#top5AlarmTask'),
                $listItemName = $list.find('.task-list-item').find('.name'),
                $listTotal = $list.find('.task-list-item').find('.total');
            // 请求数据成功
            if (data.code == '200') {
                if (data.data.list && data.data.list.length > 0) {
                    $list.find('.task-list').removeClass('hide');
                    $list.find('.chart-card-empty').addClass('hide');
                    var result = [];
                    result = data.data.list;
                    var html = '';
                    for (var i = 0; i < result.length; i++) {
                        //databoardModal在大图弹窗有用到，检索跳转时用来关闭数据看板弹窗
                        html += `<li class="task-list-item"  cameraId="${result[i].cameraId}">
                                    <i class="aui-icon-color-default aui-icon-tree-camera"></i>
                                    <span class="databoardModal"><span class="name" title="${result[i].cameraName || '未知'}">${result[i].cameraName || '未知'}</span></span>
                                    <span class="total">${result[i].alarmTime}</span>
                                </li>`
                    }
                    $('#taskListTop').empty().html(html);

                    $("#taskListTop").find("li").each(function (index, el) {
                        $(el).data('listData', result[index]);
                        $(el).find(".name").data('listData', result[index]);
                    });
                } else {
                    $list.find('.task-list').addClass('hide');
                    $list.find('.chart-card-empty').removeClass('hide');
                }
            } else {
                $list.find('.task-list').addClass('hide');
                $list.find('.chart-card-empty').removeClass('hide');
            }
        });
    }

    //告警任务滚动事件
    $("#taskListTop").hover(function () {
        clearInterval(listTopTimer);
    }, function () {
        var $self = $(this);
        listTopTimer = setInterval(function () {
            var lineHeight = $self.find("li:first").height();
            $self.animate({
                "top": -lineHeight + "px"
            }, 600, function () {
                $self.css({
                    top: 0
                }).find("li:first").appendTo($self);
            })
        }, 2000);
    }).trigger("mouseleave");

    //最新告警点击更多跳转到告警页面
    $("#top5AlarmTask").on("click", ".dot-card-more", function () {
        $('.layui-layer-setwin').children().eq(-1).click();
        var $sideBar = $('#pageSidebarMenu').find('.aui-icon-warning'),
            $sideItem = $sideBar.closest('.sidebar-item');
        $sideItem.click();
    });

    //最新告警点击每一项大图弹窗
    $("#taskListTop").on("click", ".task-list-item .name", function (e) {
        var $this = $(this), // 图片
            $showBigImgDom = $this.parent(), // 当前检索类型的容器
            showBigImgId = $showBigImgDom.attr('id'), // 各检索类型容器id
            listData = $this.data().listData,
            thisIndex = $this.index(); // 索引
        window.createBigImgMask($showBigImgDom, showBigImgId, thisIndex, $('#usearchImg'), e, {
            cardImg: $(this),
            data: listData,
            html: $(changeAlarmMaskHtml(listData)),
            closeBigImg: true
        });
    });
    /***模块6 最新告警任务***/

    /***模块7 抓拍情况***/
    var cameraPhotographOption = {
        grid: {
            top: '17%',
            bottom: 20,
            left: 55,
            right: 10
        },
        legend: {
            data: ['抓拍数', '每路镜头抓拍', '贡献镜头数'],
            left: 0,
            itemWidth: 10,
            textStyle: {
                color: '#bac5cc',
                fontSize: 10
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line'
            }
        },
        xAxis: {
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            axisLabel: {
                interval: 0,
                textStyle: {
                    color: '#bac5cc'
                }
            },
            axisTick: {
                show: false
            },
            axisLine: {
                show: false,
                lineStyle: {
                    width: 2,
                    color: '#0a56ab',
                }
            },
            z: 10,
        },
        yAxis: {
            min: function (value) {
                return 0
            },
            axisLine: {
                show: false,
                color: 'red'
            },
            axisTick: {
                show: false,
                lineStyle: {
                    type: 'dashed'
                }
            },
            axisLabel: {
                textStyle: {
                    color: '#bac5cc',
                    fontSize: 10
                },
                formatter: function (value, index) {
                    if (value === 0) {
                        return value;
                    } else {
                        var formatterValueObj = dataUnitChange1(value, true, 1);
                        return formatterValueObj.value;
                    }
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgb(43, 49, 56)'
                }
            }
        },
        dataZoom: [{
            type: 'inside'
        }],
        series: [{
            name: '抓拍数',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            itemStyle: {
                normal: {
                    color: '#3795fe',
                    borderColor: '#3795fe',
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(55,149,254,0.3)'
                            }, {
                                offset: 1,
                                color: 'rgba(55,149,254,0.05)'
                            }]
                        ),
                    }
                }
            },
            lineStyle: {
                color: '#4B97ED',
            },
            data: ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
        }
        ]
    };

    //获取抓拍数据
    async function cameraPhotographData(type) {
        let result = await new Promise(function (resolve, reject) {
            window.loadData('v2/index/getCameraPhotograph', true, {
                type
            }, function (data) {
                var options = deepCopy(cameraPhotographOption),
                    getSearchFaceCountsChart = echarts.init(document.getElementById('queryLibCountsSwiper'));
                $('#queryLibCountsSwiper').removeClass('hide');
                if (data.code !== '200') { // 静态数据部分，接口可使用时可删除此判断
                    hideLoading($('#queryLibCountsSwiper').parent());
                    $('#queryLibCountsSwiper').removeClass('hide');
                    $('#queryLibCountsSwiper').siblings('.chart-select-btn').removeClass('hide');
                    $('#queryLibCountsSwiper').siblings('.body-right-box').removeClass('hide');
                    $('#queryLibCountsSwiper').siblings('.chart-card-empty').addClass('hide');
                    options.xAxis.data = getDateDateDashboardCommon(type).date;
                    options.series.forEach(item => {
                        item.data = getDateDateDashboardCommon(type).data;
                    })
                    getSearchFaceCountsChart.setOption(options, true);
                } else {
                    hideLoading($('#queryLibCountsSwiper').parent());
                    if (data.code === '200') {
                        var result = data.data,
                            faceTrendDateArr = result.faceTrendByDate,  //每日抓拍
                            faceTrendCameraArr = result.faceTrendByCamera, //每路镜头
                            faceTrendDevoteArr = result.photographCameraCounts,//贡献镜头
                            optionsX = [],
                            optionDate = [],
                            optionCamera = [],
                            optionDevote = [];
                        for (let i = 0; i < faceTrendDateArr.length; i++) {
                            let dynamicDateArr = faceTrendDateArr[i].statisticDay ? faceTrendDateArr[i].statisticDay.split("-") : [];
                            if (type == 1 || type == 2) {
                                optionsX.push(parseInt(dynamicDateArr[1]) + '.' + parseInt(dynamicDateArr[2]));
                            } else if (type == 3) {
                                optionsX.push(parseInt(dynamicDateArr[1]) + '月');
                            }
                            optionDate.push(faceTrendDateArr[i].counts >= 0 ? faceTrendDateArr[i].counts : 0);
                        }

                        // for (let i = 0; i < faceTrendCameraArr.length; i++) {
                        //     optionCamera.push(faceTrendCameraArr[i].counts >= 0 ? faceTrendCameraArr[i].counts : 0);
                        // }

                        // for (let i = 0; i < faceTrendDevoteArr.length; i++) {
                        //     optionDevote.push(faceTrendDevoteArr[i].counts >= 0 ? faceTrendDevoteArr[i].counts : 0);
                        // }

                        options.xAxis.data = optionsX;
                        options.tooltip.formatter = function (parmas) {
                            let html = '',
                                dateString = '';
                            for (let i = 0; i < faceTrendDateArr.length; i++) {
                                let dynamicDateArr = faceTrendDateArr[i].statisticDay ? faceTrendDateArr[i].statisticDay.split("-") : [];
                                if (type == 1 || type == 2) {
                                    dateString = parseInt(dynamicDateArr[1]) + '.' + parseInt(dynamicDateArr[2]);
                                } else if (type == 3) {
                                    dateString = parseInt(dynamicDateArr[1]) + '月';
                                }
                                if (parmas[0].name == dateString) {
                                    html = `${parmas[0].name}<br>
                                    抓拍数：${parseFloat(faceTrendDateArr[i].counts)}<br>
                                    每路镜头抓拍：${parseFloat(faceTrendCameraArr[i].counts)}<br>
                                    贡献镜头数：${parseFloat(faceTrendDevoteArr[i].counts)}<br>`;
                                    break;
                                }
                            }
                            return html;
                        }
                        options.series[0].data = optionDate;
                        // options.series[1].data = optionCamera;
                        // options.series[2].data = optionDevote;
                        getSearchFaceCountsChart.setOption(options, true);
                        $("#cameraPhotographDetail").data(result);

                        $(window).off('resize.queryLibCountsSwiper').on('resize.queryLibCountsSwiper', function () {
                            getSearchFaceCountsChart.resize();
                        });

                        resolve(result);
                    }
                    // else {
                    //     $('#queryLibCountsSwiper').addClass('hide');
                    //     $('#queryLibCountsSwiper').siblings('.chart-select-btn').addClass('hide');
                    //     $('#queryLibCountsSwiper').siblings('.chart-card-empty').removeClass('hide');
                    // }
                }
            }, undefined, 'GET');
        });
        return result;
    }

    //日期类型切换
    var $getCameraPhotographBtnBox = $('#queryLibCountsSwiper').siblings('.body-right-box'),
        $getCameraPhotographBtn = $getCameraPhotographBtnBox.find('.btn');
    $getCameraPhotographBtn.on('click', function () {
        var $this = $(this),
            timeModel,
            thisIndex = $this.index() + 1,
            thisCls = $this.hasClass('btn-primary');
        if (thisCls) {
            return;
        }
        if (thisIndex === 1) {
            timeModel = '1';
        } else if (thisIndex === 2) {
            timeModel = '2';
        } else if (thisIndex === 3) {
            timeModel = '3';
        }
        showLoading($('#queryLibCountsSwiper').parent(), true);
        $this.addClass('btn-primary').siblings().removeClass('btn-primary');
        //cameraPhotographData(timeModel);

        cameraPhotographData(timeModel).then(res => {
            //当前地图弹窗显示的是抓拍情况
            if (!$("#databoardModal").hasClass("out") && $("#databoardModal").find(".card-title-text").html().indexOf("抓拍情况") > -1) {
                $("#cameraPhotographDetail").click();
            }
        })
    });
    /***模块7 抓拍情况***/

    /***模块8 在线率排名***/
    //获取在线率排名数据
    function getCameraSurveyData(type) {
        hideLoading($('#onlineTable').parent());
        window.loadData('v2/index/getCameraStatisticsOnline', true, {
            type
        }, function (data) {
            if (data.code !== '200') { // 静态数据部分，接口可使用时可删除此判断
                $("#onlineTable").parent().find(".chart-card-empty").removeClass("hide").siblings().addClass("hide");
            } else {
                $("#onlineTable").parent().find(".chart-card-empty").addClass("hide").siblings().removeClass("hide");
                let result = data.data,
                    cameraOnLineRates = result.cameraOnLineRates,  //视频流
                    pictOnLineRates = result.pictOnLineRates,  //图片流
                    html = `<tr class="onlineTips">
                                <td></td>
                                <td></td>
                                <td><span class="cameraTips"></span><span class="cameraTipsText">视频流</span></td>
                                <td></td>
                                <td><span class="picTips"></span><span class="picTipsText">图片流</span></td>
                            </tr>`;
                for (let i = 0; i < cameraOnLineRates.length; i++) {
                    let sortText = '';
                    switch (i) {
                        case 0:
                            sortText = '前一';
                            break;
                        case 1:
                            sortText = '前二';
                            break;
                        case 2:
                            sortText = '后二';
                            break;
                        case 3:
                            sortText = '后一';
                            break;
                    }
                    html += `<tr>
                                <td>${sortText}</td>
                                <td>${cameraOnLineRates[i].orgName}</td>
                                <td class="textNum cameraRate">${cameraOnLineRates[i].onlineRate + '%'}</td>
                                <td>${pictOnLineRates[i].orgName}</td>
                                <td class="textNum pictRate">${pictOnLineRates[i].picStatusRate + '%'}</td>
                            </tr>`
                }
                $("#onlineTable").html(html);
                $("#onlineDetail").data(result);
            }
        }, undefined, 'GET');
    }

    //日期类型切换
    $("#onlineGroupBtn").on("click", ".btn", function () {
        var $this = $(this),
            timeModel,
            thisIndex = $this.index() + 1,
            thisCls = $this.hasClass('btn-primary');
        if (thisCls) {
            return;
        }
        if (thisIndex === 1) {
            timeModel = 4;
        } else if (thisIndex === 2) {
            timeModel = 1;
        } else if (thisIndex === 3) {
            timeModel = 2;
        }
        showLoading($('#onlineTable').parent(), true);
        $this.addClass('btn-primary').siblings().removeClass('btn-primary');
        getCameraSurveyData(timeModel);
    });
    /***模块8 在线率排名***/

    /***模块9 动静态检索次数和性能***/
    var mergeSearchCount = {
        grid: {
            top: '17%',
            bottom: 20,
            left: 55,
            right: 10
        },
        legend: {
            data: ['动态', '静态'],
            left: 0,
            textStyle: {
                color: '#bac5cc'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line'
            }
        },
        xAxis: {
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            axisLabel: {
                interval: 0,
                textStyle: {
                    color: '#bac5cc',
                }
            },
            axisTick: {
                show: false
            },
            axisLine: {
                show: false,
                lineStyle: {
                    width: 2,
                    color: '#0a56ab',
                }
            },
            z: 10,
        },
        yAxis: {
            min: function (value) {
                return value.min - 1
            },
            axisLine: {
                show: false,
                color: 'red'
            },
            axisTick: {
                show: false,
                lineStyle: {
                    type: 'dashed'
                }
            },
            axisLabel: {
                textStyle: {
                    color: '#bac5cc',
                    fontSize: 10
                },
                formatter: function (value, index) {
                    if (value === 0) {
                        return value;
                    } else {
                        var formatterValueObj = dataUnitChange1(value, true, 1);
                        return formatterValueObj.value;
                    }
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgb(43, 49, 56)'
                }
            }
        },
        dataZoom: [{
            type: 'inside'
        }],
        series: [{
            name: '动态',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            itemStyle: {
                normal: {
                    color: '#3795fe',
                    borderColor: '#3795fe',
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(55,149,254,0.3)'
                            }, {
                                offset: 1,
                                color: 'rgba(55,149,254,0.05)'
                            }]
                        ),
                    }
                }
            },
            lineStyle: {
                color: '#4B97ED',
            },
            data: ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
        }, {
            name: '静态',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            itemStyle: {
                normal: {
                    color: '#01b9d3',
                    borderColor: '#01b9d3',
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(1,185,211,0.5)'
                            }, {
                                offset: 1,
                                color: 'rgba(1,185,211,0)'
                            }]
                        )
                    }
                }
            },
            lineStyle: {
                color: '#01B9D3',
            },
            data: ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
        }]
    };

    //动静检索次数
    function getSearchFaceCountsData2(timeModel) {
        showLoading($('#getSearchFaceCounts2').parent());
        loadData('v2/index/getDynamicStaticRetrieves', true, {
            type: timeModel
        }, function (data) {
            var options = deepCopy(mergeSearchCount),
                getSearchFaceCountsChart = echarts.init(document.getElementById('getSearchFaceCounts2'));
            $('#getSearchFaceCounts2').removeClass('hide');
            if (data.code !== '200') { // 静态数据部分，接口可使用时可删除此判断
                hideLoading($('#getSearchFaceCounts2').parent());
                $('#getSearchFaceCounts2').removeClass('hide');
                $('#getSearchFaceCounts2').siblings('.chart-select-btn').removeClass('hide');
                $('#getSearchFaceCounts2').siblings('.body-right-box').removeClass('hide');
                $('#getSearchFaceCounts2').siblings('.chart-card-empty').addClass('hide');
                options.xAxis.data = getDateDateDashboardCommon(timeModel).date;
                options.series.forEach(item => {
                    item.data = getDateDateDashboardCommon(timeModel).data;
                })
                getSearchFaceCountsChart.setOption(options, true);
            } else {
                hideLoading($('#getSearchFaceCounts2').parent());
                if (data.code === '200') {
                    var result = data.data,
                        staticArr = result.staticList,
                        dynamicArr = result.dynamicList,
                        optionsX = [],
                        optionStatic = [],
                        optionDynamic = [];
                    for (let i = 0; i < dynamicArr.length; i++) {
                        let dynamicDateArr = dynamicArr[i].statisticDay ? dynamicArr[i].statisticDay.split("-") : [];
                        if (timeModel == 1 || timeModel == 2) {
                            optionsX.push(parseInt(dynamicDateArr[1]) + '.' + parseInt(dynamicDateArr[2]));
                        } else if (timeModel == 3) {
                            optionsX.push(parseInt(dynamicDateArr[1]) + '月');
                        }
                        optionDynamic.push(dynamicArr[i].counts);
                    }

                    for (let i = 0; i < staticArr.length; i++) {
                        optionStatic.push(staticArr[i].counts);
                    }

                    options.xAxis.data = optionsX;
                    options.tooltip.formatter = function (params) {
                        let result = '',
                            result1 = '';
                        params.forEach((item) => {
                            result += item.marker + "" + item.seriesName + ":" + item.value + "次" + "</br>";
                            result1 = item.name + "</br>" + result;
                        })
                        return result1;
                    }
                    options.series[0].data = optionDynamic;
                    options.series[1].data = optionStatic;
                    getSearchFaceCountsChart.setOption(options, true);

                    $(window).off('resize.getSearchFaceCounts2').on('resize.getSearchFaceCounts2', function () {
                        getSearchFaceCountsChart.resize();
                    });
                } else {
                    $('#getSearchFaceCounts2').addClass('hide');
                    $('#getSearchFaceCounts2').siblings('.chart-select-btn').addClass('hide');
                    $('#getSearchFaceCounts2').siblings('.chart-card-empty').removeClass('hide');
                }
            }
        }, '', 'GET');
    }

    //动静检索性能
    function getSearchFaceCountsData1(timeModel) {
        showLoading($('#getSearchFaceCounts3').parent());
        loadData('v2/index/getDynamicStaticNature', true, {
            type: timeModel
        }, function (data) {
            var options = deepCopy(mergeSearchCount),
                getSearchFaceCountsChart = echarts.init(document.getElementById('getSearchFaceCounts3'));
            $('#getSearchFaceCounts3').removeClass('hide');
            if (data.code !== '200') { // 静态数据部分，接口可使用时可删除此判断
                hideLoading($('#getSearchFaceCounts3').parent());
                $('#getSearchFaceCounts3').removeClass('hide');
                $('#getSearchFaceCounts3').siblings('.chart-select-btn').removeClass('hide');
                $('#getSearchFaceCounts3').siblings('.body-right-box').removeClass('hide');
                $('#getSearchFaceCounts3').siblings('.chart-card-empty').addClass('hide');
                options.xAxis.data = getDateDateDashboardCommon(timeModel).date;
                options.series.forEach(item => {
                    item.data = getDateDateDashboardCommon(timeModel).data;
                })
                getSearchFaceCountsChart.setOption(options, true);
            } else {
                hideLoading($('#getSearchFaceCounts3').parent());
                if (data.code === '200') {
                    var result = data.data,
                        staticArr = result.staticList,
                        dynamicArr = result.dynamicList,
                        optionsX = [],
                        optionStatic = [],
                        optionDynamic = [];
                    for (let i = 0; i < dynamicArr.length; i++) {
                        let dynamicDateArr = dynamicArr[i].statisticDay ? dynamicArr[i].statisticDay.split("-") : [];
                        if (timeModel == 1 || timeModel == 2) {
                            optionsX.push(parseInt(dynamicDateArr[1]) + '.' + parseInt(dynamicDateArr[2]));
                        } else if (timeModel == 3) {
                            optionsX.push(parseInt(dynamicDateArr[1]) + '月');
                        }
                        optionDynamic.push(dynamicArr[i].counts / 1000);
                    }

                    for (let i = 0; i < staticArr.length; i++) {
                        optionStatic.push(staticArr[i].counts / 1000);
                    }

                    options.xAxis.data = optionsX;
                    options.tooltip.formatter = function (params) {
                        let result = '',
                            result1 = '';
                        params.forEach((item) => {
                            result += item.marker + "" + item.seriesName + ":" + item.value + "s" + "</br>";
                            result1 = item.name + "</br>" + result;
                        })
                        return result1;
                    }
                    options.series[0].data = optionDynamic;
                    options.series[1].data = optionStatic;
                    getSearchFaceCountsChart.setOption(options, true);

                    $(window).off('resize.getSearchFaceCounts3').on('resize.getSearchFaceCounts3', function () {
                        getSearchFaceCountsChart.resize();
                    });
                } else {
                    $('#getSearchFaceCounts3').addClass('hide');
                    $('#getSearchFaceCounts3').siblings('.chart-select-btn').addClass('hide');
                    $('#getSearchFaceCounts3').siblings('.chart-card-empty').removeClass('hide');
                }
            }
        }, '', 'GET');
    }

    // 动静检索次数切换按钮添加点击事件
    $("#dynamicStaticTabOne").on("click", ".body-right-box .btn", function () {
        var $this = $(this),
            timeModel,
            thisIndex = $this.index() + 1,
            thisCls = $this.hasClass('btn-primary');
        if (thisCls) {
            return;
        }
        if (thisIndex === 1) {
            timeModel = '1';
        } else if (thisIndex === 2) {
            timeModel = '2';
        } else if (thisIndex === 3) {
            timeModel = '3';
        }
        $this.addClass('btn-primary').siblings().removeClass('btn-primary');
        getSearchFaceCountsData2(timeModel);
    });

    // 动静检索次数切换按钮添加点击事件
    $("#dynamicStaticTabTwo").on("click", ".body-right-box .btn", function () {
        var $this = $(this),
            timeModel,
            thisIndex = $this.index() + 1,
            thisCls = $this.hasClass('btn-primary');
        if (thisCls) {
            return;
        }
        if (thisIndex === 1) {
            timeModel = '1';
        } else if (thisIndex === 2) {
            timeModel = '2';
        } else if (thisIndex === 3) {
            timeModel = '3';
        }
        $this.addClass('btn-primary').siblings().removeClass('btn-primary');
        getSearchFaceCountsData1(timeModel);
    });

    //动静态检索次数和性能tab切换事件
    $("#dynamicStaticTab").on("click", ".btn", function () {
        $(this).addClass("btn-primary").siblings().removeClass("btn-primary");
        if ($(this).index() == 1) {
            $("#dynamicStaticTabTwo").removeClass("hide");
            $("#dynamicStaticTabOne").addClass("hide");
            if (!$("#getSearchFaceCounts3").children().length) {
                getSearchFaceCountsData1(1);
            } else {
                echarts.init(document.getElementById('getSearchFaceCounts3')).resize();
            }
        } else {
            $("#dynamicStaticTabOne").removeClass("hide");
            $("#dynamicStaticTabTwo").addClass("hide");
            echarts.init(document.getElementById('getSearchFaceCounts2')).resize();
        }
    });
    /***模块9 动静态检索次数和性能***/

    /***模块10 布控任务统计***/
    // 布控场景图表配置信息
    var taskStatusData = [{
        value: 20,
        name: '已布控人数'
    }, {
        value: 51,
        name: '剩余布控人数'
    }];

    var taskStatusOption = {
        color: ['#01b9d3', '#358eda', '#535e6a'],
        graphic: [{
            type: 'text',
            left: 'center',
            top: '34%',
            style: {
                text: '布控人数',
                textAlign: 'center',
                fill: '#fff',
                fontSize: 16
            }
        }],
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            icon: 'rect',
            bottom: 0,
            itemWidth: 12,
            itemHeight: 10,
            textStyle: {
                color: '#bac5cc'
            },
            formatter: function (name) {
                var target
                for (var i = 0, l = taskStatusData.length; i < l; i++) {
                    if (taskStatusData[i].name == name) {
                        target = taskStatusData[i].value;
                    }
                }
                return name + ' ' + target;
            }
        },
        series: [{
            name: '区域分布',
            type: 'pie',
            center: ['50%', '38%'],
            radius: ['48%', '60%'],
            avoidLabelOverlap: false,
            hoverOffset: 3,
            itemStyle: {
                borderWidth: 2,
                borderType: 'solid',
                borderColor: '#15212d'
            },
            label: {
                normal: {
                    show: false,
                    position: 'center'
                },
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data: taskStatusData
        }, {
            name: '区域分布',
            type: 'pie',
            hoverAnimation: false,
            legendHoverLink: false,
            center: ['50%', '38%'],
            radius: ['65%', '65%'],
            label: {
                normal: {
                    show: false
                },
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            tooltip: {
                show: false
            },
            itemStyle: {
                normal: {
                    borderWidth: 2,
                    borderColor: 'rgba(55,149,254,0.4)',
                }
            },
            data: taskStatusData
        }, {
            name: '区域分布',
            type: 'pie',
            hoverAnimation: false,
            legendHoverLink: false,
            center: ['50%', '38%'],
            radius: ['45%', '45%'],
            label: {
                normal: {
                    show: false
                },
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            tooltip: {
                show: false
            },
            itemStyle: {
                normal: {
                    borderWidth: 2,
                    borderColor: 'rgba(55,149,254,0.4)',
                }
            },
            data: taskStatusData
        }]
    };

    // 布控任务统计--告警状态
    var emphasisData = [{
        value: 0,
        name: '未处理'
    }, {
        value: 0,
        name: '已处理'
    }, {
        value: 0,
        name: '已误报'
    }];

    var emphasisOption = {
        color: ['#ff5558', '#febc42', '#3b9ef3'],
        graphic: [{
            type: 'text',
            left: '29%',
            top: '52%',
            style: {
                text: '布控人数',
                textAlign: 'center',
                fill: '#fff',
                fontSize: 14
            }
        }, {
            type: 'text',
            left: '29%',
            right: '50%',
            top: '40%',
            style: {
                text: '0',
                padding: '10',
                textAlign: 'center',
                fill: '#00dede',
                fontSize: 16,
                fontWeight: 'bolder'
            }
        }],
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            icon: 'rect',
            top: 'middle',
            left: '60%',
            orient: 'vertical',
            align: 'left',
            itemWidth: 12,
            itemHeight: 10,
            textStyle: {
                fontSize: 16,
                color: '#bac5cc'
            },
            formatter: function (name) {
                var target
                for (var i = 0, l = emphasisData.length; i < l; i++) {
                    if (emphasisData[i].name == name) {
                        target = emphasisData[i].value;
                    }
                }
                return name + ' ' + target;
            }
        },
        series: [{
            name: '告警等级',
            type: 'pie',
            center: ['35%', '50%'],
            radius: ['60%', '75%'],
            avoidLabelOverlap: false,
            hoverOffset: 3,
            itemStyle: {
                borderWidth: 2,
                borderType: 'solid',
                borderColor: '#15212d'
            },
            label: {
                normal: {
                    show: false,
                    position: 'center'
                },
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data: emphasisData
        }, {
            name: '告警等级',
            type: 'pie',
            hoverAnimation: false,
            legendHoverLink: false,
            center: ['35%', '50%'],
            radius: ['56%', '56%'],
            label: {
                normal: {
                    show: false
                },
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            tooltip: {
                show: false
            },
            itemStyle: {
                normal: {
                    borderWidth: 2,
                    borderColor: 'rgba(55,149,254,0.4)',
                }
            },
            data: emphasisData
        }, {
            name: '告警等级',
            type: 'pie',
            hoverAnimation: false,
            legendHoverLink: false,
            center: ['35%', '50%'],
            radius: ['80%', '80%'],
            label: {
                normal: {
                    show: false
                },
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            tooltip: {
                show: false
            },
            itemStyle: {
                normal: {
                    borderWidth: 2,
                    borderColor: 'rgba(55,149,254,0.4)',
                }
            },
            data: emphasisData
        }]
    };

    //布控任务统计--任务状态
    function getTaskStatusData(type) {
        window.loadData('v2/index/getPeoplesStatistic', true, {
            type
        }, function (data) {
            getEmphasisAlarmData(data.data ? data.data.runningCounts : 0, type);
        }, '', 'GET');
    }

    //布控任务统计--告警状态
    function getEmphasisAlarmData(runningCounts = 0, type) {
        window.loadData('v2/index/getAlarmStatusStatistic', true, {
            type
        }, function (data) {
            if (data.code == '200') {
                if (data.data) {
                    $('#emphasisAlarm').removeClass('hide');
                    $('#emphasisAlarm').next('.chart-card-empty').addClass('hide');
                    var options = deepCopy(emphasisOption),
                        optionsData = deepCopy(emphasisData);
                    options.graphic[1].style.text = runningCounts;
                    for (var i = 0; i < data.data.length; i++) {
                        optionsData[i].value = parseFloat(data.data[i].counts);
                        optionsData[i].name = data.data[i].status;
                    }
                    options.series[0].data = optionsData;
                    options.legend.formatter = function (name) {
                        var target = '';
                        for (var i = 0, l = optionsData.length; i < l; i++) {
                            if (optionsData[i].name == name) {
                                target = optionsData[i].value;
                                target = dataUnitChange1(target, true, 1).value;
                            }
                        }
                        return name + ' ' + target;
                    }
                    var emphasisAlarmChart = echarts.init(document.getElementById('emphasisAlarm'));
                    emphasisAlarmChart.setOption(options, true);
                    $(window).off('resize.emphasisAlarm').on('resize.emphasisAlarm', function () {
                        emphasisAlarmChart.resize();
                    });
                } else {
                    $('#emphasisAlarm').addClass('hide');
                    $('#emphasisAlarm').next('.chart-card-empty').removeClass('hide');
                }
            } else {
                $('#emphasisAlarm').addClass('hide');
                $('#emphasisAlarm').next('.chart-card-empty').removeClass('hide');
            }
        }, '', 'GET');
    }

    //日期类型切换
    $("#AlarmStatisticsGroupBtn").on("click", ".btn", function () {
        var $this = $(this),
            timeModel,
            thisIndex = $this.index() + 1,
            thisCls = $this.hasClass('btn-primary');
        if (thisCls) {
            return;
        }
        if (thisIndex === 1) {
            timeModel = 2;
        } else if (thisIndex === 2) {
            timeModel = 5;
        } else if (thisIndex === 3) {
            timeModel = 0;
        }
        $this.addClass('btn-primary').siblings().removeClass('btn-primary');
        getTaskStatusData(timeModel);

        //当前地图弹窗显示的是抓拍情况
        if (!$("#databoardModal").hasClass("out") && $("#databoardModal").find(".card-title-text").html().indexOf("布控告警详情") > -1) {
            $("#AlarmStatisticsDetail").click();
        }
    });
    /***模块10 布控任务统计***/

    /***详情弹窗---begin---**/
    $(".dot-card-content").on("click", ".titleBtn", function () {
        let objId = $(this).attr("id");
        switch (objId) {
            //应用成效
            case 'applicationEffectDetail':
                var option = {
                    grid: {
                        top: '17%',
                        bottom: 20,
                        left: 48,
                        right: 10
                    },
                    legend: {
                        icon: 'rect',
                        itemWidth: 12,
                        itemHeight: 12,
                        left: 0,
                        textStyle: {
                            color: '#bac5cc'
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'line'
                        }
                    },
                    xAxis: {
                        data: ['福田', '罗湖', '南山', '盐田', '宝安', '龙岗', '龙华', '大棚'],
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                color: '#bac5cc',
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        z: 10
                    },
                    yAxis: {
                        min: function (value) {
                            return value.min - 1
                        },
                        axisLine: {
                            show: false,
                        },
                        axisTick: {
                            show: false,
                            lineStyle: {
                                type: 'soild'
                            }
                        },
                        axisLabel: {
                            textStyle: {
                                color: '#bac5cc'
                            },
                            formatter: function (value, index) {
                                if (value === 0) {
                                    return value;
                                } else {
                                    var formatterValueObj = dataUnitChange1(value, true, 1);
                                    return formatterValueObj.value;
                                }
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: 'rgba(224,229,233,0.15)'
                            }
                        }
                    },
                    dataZoom: [{
                        type: 'inside'
                    }],
                    series: [{ // For shadow
                        type: 'pictorialBar',
                        symbolSize: [26, 10],
                        symbolOffset: [0, -5],
                        symbolPosition: 'end',
                        data: [0, 0, 0, 0, 0, 0, 0, 0],
                        itemStyle: {
                            normal: {
                                color: 'rgba(74,144,255,1)',
                                label: {
                                    show: true,
                                    position: 'top',
                                }
                            }
                        },
                        tooltip: {
                            show: false
                        },
                    }, {
                        type: 'bar',
                        name: '关注对象',
                        barWidth: 26,
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(
                                    0, 0, 0, 1, [{
                                        offset: 0,
                                        color: 'rgba(74,144,255,0.67)'
                                    }, {
                                        offset: 1,
                                        color: 'rgba(74,144,255,0.00)'
                                    }]
                                ),
                                borderWidth: 0,
                                borderColor: '#3795fe'
                            }
                        },
                        data: [140, 82, 45, 115, 140, 85, 45, 113]
                    }]
                };

                window.loadData('v3/dataBoard/getSearchStatistic', true, {
                    type: 3,
                    category: 1
                }, function (data) {
                    if (data.code == '200') {
                        $("#databoardModal").find(".card-title-text").text("应用成效详情");
                        $("#databoardModal").find(".popup-body").html(`<div id="echartModalOne" style="height:50%"></div><div id="echartModalTwo" style="height:50%"></div>`);
                        $('#databoardModal').removeClass('out').addClass('four');
                        $('body').addClass('modal-active');
                        var result = data.data,
                            optionsStatic = deepCopy(option),
                            optionsDynamic = deepCopy(option),
                            optionsX = [],
                            optionsStaticY = [],
                            optionsDynamicY = [],
                            getEchartModalOne = echarts.init(document.getElementById('echartModalOne')),
                            getEchartModalTwo = echarts.init(document.getElementById('echartModalTwo'));

                        for (var i = 0; i < result.length; i++) {
                            if (result[i] && result[i].orgName && result[i].orgId !== '10') {
                                optionsX.push(result[i].orgName);
                                optionsStaticY.push(parseFloat(result[i].staticTotal));
                                optionsDynamicY.push(parseFloat(result[i].dynamicTotal));
                            }
                        }

                        //动态
                        optionsDynamic.series[1].name = '动态检索总次数';
                        optionsDynamic.series[0].itemStyle.normal.color = 'rgba(9,209,175,1)';
                        optionsDynamic.series[1].itemStyle.normal.color = new echarts.graphic.LinearGradient(
                            0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(9,209,175,1)'
                            }, {
                                offset: 1,
                                color: 'rgba(35,146,253,1)'
                            }]
                        );
                        optionsDynamic.series[0].data = optionsDynamicY;
                        optionsDynamic.series[1].data = optionsDynamicY;
                        optionsDynamic.xAxis.data = optionsX;
                        getEchartModalOne.setOption(optionsDynamic, true);

                        //静态
                        optionsStatic.series[1].name = '静态检索总次数';
                        optionsStatic.series[0].itemStyle.normal.color = 'rgba(255,192,106,1)';
                        optionsStatic.series[1].itemStyle.normal.color = new echarts.graphic.LinearGradient(
                            0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(255,192,106,1)'
                            }, {
                                offset: 1,
                                color: 'rgba(0,222,222,1)'
                            }]
                        );
                        optionsStatic.series[0].data = optionsStaticY;
                        optionsStatic.series[1].data = optionsStaticY;
                        optionsStatic.xAxis.data = optionsX;
                        getEchartModalTwo.setOption(optionsStatic, true);
                    } else {
                        warningTip.say("暂无数据，请稍后再试");
                    }
                });
                break;
            //抓拍情况
            case 'cameraPhotographDetail':
                var option = {
                    grid: {
                        top: '17%',
                        bottom: 20,
                        left: 48,
                        right: 10
                    },
                    legend: {
                        icon: 'rect',
                        itemWidth: 12,
                        itemHeight: 12,
                        top: 20,
                        left: 0,
                        textStyle: {
                            color: '#bac5cc'
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'line'
                        }
                    },
                    xAxis: {
                        data: ['福田', '罗湖', '南山', '盐田', '宝安', '龙岗', '龙华', '大棚'],
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                color: '#bac5cc',
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        z: 10
                    },
                    yAxis: {
                        min: function (value) {
                            return value.min - 1
                        },
                        axisLine: {
                            show: false,
                        },
                        axisTick: {
                            show: false,
                            lineStyle: {
                                type: 'soild'
                            }
                        },
                        axisLabel: {
                            textStyle: {
                                color: '#bac5cc',
                                fontSize: '12px'
                            },
                            formatter: function (value, index) {
                                if (value === 0) {
                                    return value;
                                } else {
                                    var formatterValueObj = dataUnitChange1(value, true, 1);
                                    return formatterValueObj.value;
                                }
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: 'rgba(224,229,233,0.15)'
                            }
                        }
                    },
                    dataZoom: [{
                        type: 'inside'
                    }],
                    series: [{ // For shadow
                        type: 'pictorialBar',
                        symbolSize: [26, 10],
                        symbolOffset: [0, -5],
                        symbolPosition: 'end',
                        data: [0, 0, 0, 0, 0, 0, 0, 0],
                        itemStyle: {
                            normal: {
                                color: 'rgba(74,144,255,1)',
                                label: {
                                    show: true,
                                    position: 'top',
                                }
                            }
                        },
                        tooltip: {
                            show: false
                        },
                    }, {
                        type: 'bar',
                        name: '关注对象',
                        barWidth: 26,
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(
                                    0, 0, 0, 1, [{
                                        offset: 0,
                                        color: 'rgba(74,144,255,0.67)'
                                    }, {
                                        offset: 1,
                                        color: 'rgba(74,144,255,0.00)'
                                    }]
                                ),
                                borderWidth: 0,
                                borderColor: '#3795fe'
                            }
                        },
                        data: [140, 82, 45, 115, 140, 85, 45, 113]
                    }]
                },
                    result = $("#cameraPhotographDetail").data() ? $("#cameraPhotographDetail").data().cameraStatistics : [],
                    optionsDynamic = deepCopy(option),
                    optionsX = [],
                    optionsDynamicY = [];
                if (!result.length) {
                    warningTip.say("暂无数据，请稍后再试");
                } else {
                    $("#databoardModal").find(".card-title-text").text("抓拍情况详情");
                    $("#databoardModal").find(".popup-body").html(`<div id="echartModalOne" style="height:100%"></div>`);
                    $('#databoardModal').removeClass('out').addClass('four');
                    $('body').addClass('modal-active');
                    let getEchartModalOne = echarts.init(document.getElementById('echartModalOne')),
                        index = $("#queryLibCountsSwiper").parent().find(".btn-group-capsule .btn.btn-primary").index(),
                        indexTips = '';
                    switch (index) {
                        case 0:
                            indexTips = '近一周';
                            break;
                        case 1:
                            indexTips = '近一月';
                            break;
                        case 2:
                            indexTips = '近一年';
                            break;
                    }

                    for (var i = 0; i < result.length; i++) {
                        if (result[i] && result[i].orgName && result[i].orgId !== '10') {
                            optionsX.push(result[i].orgName);
                            optionsDynamicY.push(result[i].counts >= 0 ? parseFloat(result[i].counts) : 0);
                        }
                    }

                    optionsDynamic.series[1].name = indexTips + '抓拍总数';
                    optionsDynamic.series[0].itemStyle.normal.color = 'rgba(9,209,175,1)';
                    optionsDynamic.series[1].itemStyle.normal.color = new echarts.graphic.LinearGradient(
                        0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(9,209,175,1)'
                        }, {
                            offset: 1,
                            color: 'rgba(35,146,253,1)'
                        }]
                    );
                    optionsDynamic.series[0].data = optionsDynamicY;
                    optionsDynamic.series[1].data = optionsDynamicY;
                    optionsDynamic.xAxis.data = optionsX;
                    getEchartModalOne.setOption(optionsDynamic, true);
                }
                break;
            //布控告警
            case 'AlarmStatisticsDetail':
                var option = {
                    grid: {
                        top: '17%',
                        bottom: 20,
                        left: 48,
                        right: 10
                    },
                    legend: {
                        icon: 'rect',
                        itemWidth: 12,
                        itemHeight: 12,
                        left: 0,
                        textStyle: {
                            color: '#bac5cc'
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'line'
                        }
                    },
                    xAxis: {
                        data: ['福田', '罗湖', '南山', '盐田', '宝安', '龙岗', '龙华', '大棚'],
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                color: '#bac5cc',
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        z: 10
                    },
                    yAxis: {
                        min: function (value) {
                            return value.min - 1
                        },
                        axisLine: {
                            show: false,
                        },
                        axisTick: {
                            show: false,
                            lineStyle: {
                                type: 'soild'
                            }
                        },
                        axisLabel: {
                            textStyle: {
                                color: '#bac5cc'
                            },
                            formatter: function (value, index) {
                                if (value === 0) {
                                    return value;
                                } else {
                                    var formatterValueObj = dataUnitChange1(value, true, 1);
                                    return formatterValueObj.value;
                                }
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: 'rgba(224,229,233,0.15)'
                            }
                        }
                    },
                    dataZoom: [{
                        type: 'inside'
                    }],
                    series: [{ // For shadow
                        type: 'pictorialBar',
                        symbolSize: [26, 10],
                        symbolOffset: [0, -5],
                        symbolPosition: 'end',
                        data: [0, 0, 0, 0, 0, 0, 0, 0],
                        itemStyle: {
                            normal: {
                                color: 'rgba(74,144,255,1)',
                                label: {
                                    show: true,
                                    position: 'top',
                                }
                            }
                        },
                        tooltip: {
                            show: false
                        },
                    }, {
                        type: 'bar',
                        name: '关注对象',
                        barWidth: 26,
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(
                                    0, 0, 0, 1, [{
                                        offset: 0,
                                        color: 'rgba(74,144,255,0.67)'
                                    }, {
                                        offset: 1,
                                        color: 'rgba(74,144,255,0.00)'
                                    }]
                                ),
                                borderWidth: 0,
                                borderColor: '#3795fe'
                            }
                        },
                        data: [140, 82, 45, 115, 140, 85, 45, 113]
                    }]
                },
                    btnType = $("#AlarmStatisticsGroupBtn").find(".btn.btn-primary").attr("index");

                window.loadData('v2/index/getAlarmStatisticsBySort', true, {
                    type: btnType
                }, function (data) {
                    if (data.code === '200') {
                        $("#databoardModal").find(".card-title-text").text("布控告警详情");
                        $("#databoardModal").find(".popup-body").html(`<div id="echartModalOne" style="height:50%"></div><div id="echartModalTwo" style="height:50%"></div>`);
                        $('#databoardModal').removeClass('out').addClass('four');
                        $('body').addClass('modal-active');
                        var result = data.data,
                            optionsAll = deepCopy(option),
                            optionsToday = deepCopy(option),
                            optionsAllX = [],
                            optionsTodayX = [],
                            optionsAllY = [],
                            optionsTodayY = [],
                            allDataArr = result ? result.alarmStatisticsDetails : [],
                            todayDataArr = result ? result.alarmStatisticsTodayDetails : [],
                            getEchartModalOne = echarts.init(document.getElementById('echartModalOne')),
                            getEchartModalTwo = echarts.init(document.getElementById('echartModalTwo'));

                        for (var i = 0; i < allDataArr.length; i++) {
                            if (allDataArr[i] && allDataArr[i].orgName && allDataArr[i].orgId !== '10') {
                                optionsAllX.push(allDataArr[i].orgName);
                                optionsAllY.push(parseFloat(allDataArr[i].counts));
                            }
                        }

                        for (var i = 0; i < todayDataArr.length; i++) {
                            if (todayDataArr[i] && todayDataArr[i].orgName && todayDataArr[i].orgId !== '10') {
                                optionsTodayX.push(todayDataArr[i].orgName);
                                optionsTodayY.push(parseFloat(todayDataArr[i].totalToday));
                            }
                        }

                        //总次数
                        optionsAll.series[1].name = '告警总数';
                        optionsAll.series[0].itemStyle.normal.color = 'rgba(9,209,175,1)';
                        optionsAll.series[1].itemStyle.normal.color = new echarts.graphic.LinearGradient(
                            0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(9,209,175,1)'
                            }, {
                                offset: 1,
                                color: 'rgba(35,146,253,1)'
                            }]
                        );
                        optionsAll.series[0].data = optionsAllY;
                        optionsAll.series[1].data = optionsAllY;
                        optionsAll.xAxis.data = optionsAllX;
                        getEchartModalOne.setOption(optionsAll, true);

                        //静态
                        optionsToday.series[1].name = '当日告警总数';
                        optionsToday.series[0].itemStyle.normal.color = 'rgba(255,192,106,1)';
                        optionsToday.series[1].itemStyle.normal.color = new echarts.graphic.LinearGradient(
                            0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(255,192,106,1)'
                            }, {
                                offset: 1,
                                color: 'rgba(0,222,222,1)'
                            }]
                        );
                        optionsToday.series[0].data = optionsTodayY;
                        optionsToday.series[1].data = optionsTodayY;
                        optionsToday.xAxis.data = optionsTodayX;
                        getEchartModalTwo.setOption(optionsToday, true);
                    } else {
                        warningTip.say("暂无数据,请稍后再试");
                    }
                }, undefined, 'GET');
                break;
            //在线率
            case 'onlineDetail':
                var option = {
                    grid: {
                        top: '17%',
                        bottom: 20,
                        left: 48,
                        right: 10
                    },
                    legend: {
                        icon: 'rect',
                        itemWidth: 12,
                        itemHeight: 12,
                        left: 0,
                        textStyle: {
                            color: '#bac5cc'
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'line'
                        }
                    },
                    xAxis: {
                        data: ['福田', '罗湖', '南山', '盐田', '宝安', '龙岗', '龙华', '大棚'],
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                color: '#bac5cc',
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        z: 10
                    },
                    yAxis: {
                        min: function (value) {
                            return value.min - 1
                        },
                        axisLine: {
                            show: false,
                        },
                        axisTick: {
                            show: false,
                            lineStyle: {
                                type: 'soild'
                            }
                        },
                        axisLabel: {
                            textStyle: {
                                color: '#bac5cc'
                            },
                            formatter: function (value, index) {
                                if (value === 0) {
                                    return value;
                                } else {
                                    var formatterValueObj = dataUnitChange1(value, true, 1);
                                    return formatterValueObj.value;
                                }
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: 'rgba(224,229,233,0.15)'
                            }
                        }
                    },
                    dataZoom: [{
                        type: 'inside'
                    }],
                    series: [{ // For shadow
                        type: 'pictorialBar',
                        symbolSize: [26, 10],
                        symbolOffset: [0, -5],
                        symbolPosition: 'end',
                        data: [0, 0, 0, 0, 0, 0, 0, 0],
                        itemStyle: {
                            normal: {
                                color: 'rgba(74,144,255,1)',
                                label: {
                                    show: true,
                                    position: 'top',
                                    formatter: '{c}%'
                                }
                            }
                        },
                        tooltip: {
                            show: false
                        },
                    }, {
                        type: 'bar',
                        name: '关注对象',
                        barWidth: 26,
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(
                                    0, 0, 0, 1, [{
                                        offset: 0,
                                        color: 'rgba(74,144,255,0.67)'
                                    }, {
                                        offset: 1,
                                        color: 'rgba(74,144,255,0.00)'
                                    }]
                                ),
                                borderWidth: 0,
                                borderColor: '#3795fe'
                            }
                        },
                        data: [140, 82, 45, 115, 140, 85, 45, 113]
                    }]
                };

                var result = $("#onlineDetail").data(),
                    optionsCamera = deepCopy(option),
                    optionsPic = deepCopy(option),
                    optionsCameraX = [],
                    optionsPicX = [],
                    optionsCameraY = [],
                    optionsPicY = [],
                    cameraDataArr = Object.keys(result).length ? result.cameraOnLineRateDetails : [],
                    picDataArr = Object.keys(result).length ? result.pictOnLineRateDetails : [];
                if (!cameraDataArr.length && !picDataArr.length) {
                    warningTip.say("暂无数据请稍后再试");
                } else {
                    $("#databoardModal").find(".card-title-text").text("在线率排名详情");
                    $("#databoardModal").find(".popup-body").html(`<div id="echartModalOne" style="height:50%"></div><div id="echartModalTwo" style="height:50%"></div>`);
                    $('#databoardModal').removeClass('out').addClass('four');
                    $('body').addClass('modal-active');
                    var getEchartModalOne = echarts.init(document.getElementById('echartModalOne')),
                        getEchartModalTwo = echarts.init(document.getElementById('echartModalTwo'));
                    for (var i = 0; i < cameraDataArr.length; i++) {
                        if (cameraDataArr[i] && cameraDataArr[i].orgName && cameraDataArr[i].orgId !== '10') {
                            optionsCameraX.push(cameraDataArr[i].orgName);
                            optionsCameraY.push(parseFloat(cameraDataArr[i].onlineRate));
                        }
                    }

                    for (var i = 0; i < picDataArr.length; i++) {
                        if (picDataArr[i] && picDataArr[i].orgName && picDataArr[i].orgId !== '10') {
                            optionsPicX.push(picDataArr[i].orgName);
                            optionsPicY.push(parseFloat(picDataArr[i].picStatusRate));
                        }
                    }

                    //视频流
                    optionsCamera.series[1].name = '视频流在线率';
                    optionsCamera.series[0].itemStyle.normal.color = 'rgba(9,209,175,1)';
                    optionsCamera.series[1].itemStyle.normal.color = new echarts.graphic.LinearGradient(
                        0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(9,209,175,1)'
                        }, {
                            offset: 1,
                            color: 'rgba(35,146,253,1)'
                        }]
                    );
                    optionsCamera.tooltip.formatter = function (parmas) {
                        let html = '';
                        for (let i = 0; i < cameraDataArr.length; i++) {
                            if (parmas[0].name == cameraDataArr[i].orgName) {
                                html = `${cameraDataArr[i].orgName}<br>
                                        视频流在线率：${parseFloat(cameraDataArr[i].onlineRate) + '%'}<br>
                                        镜头总数：${parseFloat(cameraDataArr[i].counts) || 0}<br>
                                        视频流在线数：${parseFloat(cameraDataArr[i].onlineNum) || 0}<br>`;
                                break;
                            }
                        }
                        return html;
                    }
                    optionsCamera.series[0].data = optionsCameraY;
                    optionsCamera.series[1].data = optionsCameraY;
                    optionsCamera.xAxis.data = optionsCameraX;
                    getEchartModalOne.setOption(optionsCamera, true);

                    //图片流
                    optionsPic.series[1].name = '图片流在线率';
                    optionsPic.series[0].itemStyle.normal.color = 'rgba(255,192,106,1)';
                    optionsPic.series[1].itemStyle.normal.color = new echarts.graphic.LinearGradient(
                        0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(255,192,106,1)'
                        }, {
                            offset: 1,
                            color: 'rgba(0,222,222,1)'
                        }]
                    );
                    optionsPic.tooltip.formatter = function (parmas) {
                        let html = '';
                        for (let i = 0; i < picDataArr.length; i++) {
                            if (parmas[0].name == picDataArr[i].orgName) {
                                html = `${picDataArr[i].orgName}<br>
                                        图片流在线率：${parseFloat(picDataArr[i].picStatusRate) + '%'}<br>
                                        镜头总数：${parseFloat(picDataArr[i].counts) || 0}<br>
                                        图片流在线数：${parseFloat(picDataArr[i].picStatusNum) || 0}<br>`;
                                break;
                            }
                        }
                        return html;
                    }
                    optionsPic.series[0].data = optionsPicY;
                    optionsPic.series[1].data = optionsPicY;
                    optionsPic.xAxis.data = optionsPicX;
                    getEchartModalTwo.setOption(optionsPic, true);
                }
                break;
            //用户情况
            case 'userInfoDetail':
                $("#databoardModal").find(".card-title-text").text("用户情况详情");
                $("#databoardModal").find(".popup-body").html(`<div class="body-right-box">
                                                                    <div class="btn-group btn-group-capsule" role="group">
                                                                        <button type="button" class="btn btn-sm btn-primary">近一周</button>
                                                                        <button type="button" class="btn btn-sm">近一月</button>
                                                                        <button type="button" class="btn btn-sm">近三月</button>
                                                                    </div>
                                                                </div>
                                                                <div class="databoardModalTwo">
                                                                    <div id="echartModalOne" class="chart"></div>
                                                                    <div class="chart-card-empty hide">
                                                                        <img class="small" src="./assets/images/common/no-data.png" />
                                                                    </div>
                                                                </div>
                                                                <div class="databoardModalTwo">
                                                                    <div id="echartModalTwo" class="chart"></div>
                                                                    <div class="chart-card-empty hide">
                                                                        <img class="small" src="./assets/images/common/no-data.png" />
                                                                    </div>
                                                                </div>`);

                var option = {
                    grid: {
                        top: '17%',
                        bottom: 20,
                        left: 48,
                        right: 10
                    },
                    legend: {
                        icon: 'rect',
                        itemWidth: 12,
                        itemHeight: 12,
                        left: 0,
                        textStyle: {
                            color: '#bac5cc'
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'line'
                        }
                    },
                    xAxis: {
                        data: ['福田', '罗湖', '南山', '盐田', '宝安', '龙岗', '龙华', '大棚'],
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                color: '#bac5cc',
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        z: 10
                    },
                    yAxis: {
                        min: function (value) {
                            return value.min - 1
                        },
                        axisLine: {
                            show: false,
                        },
                        axisTick: {
                            show: false,
                            lineStyle: {
                                type: 'soild'
                            }
                        },
                        axisLabel: {
                            textStyle: {
                                color: '#bac5cc'
                            },
                            formatter: function (value, index) {
                                if (value === 0) {
                                    return value;
                                } else {
                                    var formatterValueObj = dataUnitChange1(value, true, 1);
                                    return formatterValueObj.value;
                                }
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: 'rgba(224,229,233,0.15)'
                            }
                        }
                    },
                    dataZoom: [{
                        type: 'inside'
                    }],
                    series: [{ // For shadow
                        type: 'pictorialBar',
                        symbolSize: [26, 10],
                        symbolOffset: [0, -5],
                        symbolPosition: 'end',
                        data: [0, 0, 0, 0, 0, 0, 0, 0],
                        itemStyle: {
                            normal: {
                                color: 'rgba(74,144,255,1)',
                                label: {
                                    show: true,
                                    position: 'top',
                                }
                            }
                        },
                        tooltip: {
                            show: false
                        },
                    }, {
                        type: 'bar',
                        name: '关注对象',
                        barWidth: 26,
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(
                                    0, 0, 0, 1, [{
                                        offset: 0,
                                        color: 'rgba(74,144,255,0.67)'
                                    }, {
                                        offset: 1,
                                        color: 'rgba(74,144,255,0.00)'
                                    }]
                                ),
                                borderWidth: 0,
                                borderColor: '#3795fe'
                            }
                        },
                        data: [140, 82, 45, 115, 140, 85, 45, 113]
                    }]
                };

                //活跃用户排行
                function actionStatisticsData(dateType) {
                    showLoading($('#echartModalTwo').parent());
                    $("#echartModalTwo").addClass("hide").siblings().removeClass("hide");
                    window.loadData('v3/dataBoard/getActiveStatistics', true, {
                        type: 3,
                        category: 1,
                        dateType
                    }, function (data) {
                        hideLoading($('#echartModalTwo').parent());
                        if (data.code === '200') {
                            $("#echartModalTwo").removeClass("hide").siblings().addClass("hide");
                            $('#databoardModal').removeClass('out').addClass('four');
                            $('body').addClass('modal-active');
                            var result = data.data,
                                options = deepCopy(option),
                                optionsX = [],
                                optionsY = [],
                                getEchartModal = echarts.init(document.getElementById('echartModalTwo'));

                            for (var i = 0; i < result.length; i++) {
                                if (result[i] && result[i].orgName && result[i].orgId !== '10') {
                                    optionsX.push(result[i].orgName);
                                    optionsY.push(parseFloat(result[i].activeAccountRate));
                                }
                            }

                            options.series[1].name = '活跃用户排行';
                            options.series[0].itemStyle.normal.color = 'rgba(255,192,106,1)';
                            options.series[1].itemStyle.normal.color = new echarts.graphic.LinearGradient(
                                0, 0, 0, 1, [{
                                    offset: 0,
                                    color: 'rgba(255,192,106,1)'
                                }, {
                                    offset: 1,
                                    color: 'rgba(0,222,222,1)'
                                }]
                            );
                            options.tooltip.formatter = function (parmas) {
                                let html = '';
                                for (let i = 0; i < result.length; i++) {
                                    if (parmas[0].name == result[i].orgName) {
                                        html = `${result[i].orgName}<br>
                                                活跃用户占比：${parseFloat(result[i].activeAccountRate) + '%'}<br>
                                                账号总数：${parseFloat(result[i].accountTotal) || 0}<br>
                                                活跃用户数：${parseFloat(result[i].activeAccountTotal) || 0}<br>`;
                                        break;
                                    }
                                }
                                return html;
                            }
                            options.series[0].data = optionsY;
                            options.series[1].data = optionsY;
                            options.xAxis.data = optionsX;
                            getEchartModal.setOption(options, true);
                        } else {
                            $("#echartModalTwo").addClass("hide").siblings().removeClass("hide");
                            warningTip.say("暂无数据，请稍后再试");
                        }
                    });
                }

                //用户登录情况
                function userLoginStatisticsData(dateType) {
                    showLoading($('#echartModalOne').parent());
                    $("#echartModalOne").addClass("hide").siblings().removeClass("hide");
                    window.loadData('v3/dataBoard/getUserLoginStatistics', true, {
                        type: 3,
                        category: 1,
                        dateType
                    }, function (data) {
                        hideLoading($('#echartModalOne').parent());
                        if (data.code === '200') {
                            $("#echartModalOne").removeClass("hide").siblings().addClass("hide");
                            $('#databoardModal').removeClass('out').addClass('four');
                            $('body').addClass('modal-active');
                            var result = data.data,
                                options = deepCopy(option),
                                optionsX = [],
                                optionsY = [],
                                getEchartModal = echarts.init(document.getElementById('echartModalOne'));

                            for (var i = 0; i < result.length; i++) {
                                if (result[i] && result[i].orgName && result[i].orgId !== '10') {
                                    optionsX.push(result[i].orgName);
                                    optionsY.push(parseFloat(result[i].loginTotal));
                                }
                            }

                            options.series[1].name = '用户登录次数';
                            options.series[0].itemStyle.normal.color = 'rgba(9,209,175,1)';
                            options.series[1].itemStyle.normal.color = new echarts.graphic.LinearGradient(
                                0, 0, 0, 1, [{
                                    offset: 0,
                                    color: 'rgba(9,209,175,1)'
                                }, {
                                    offset: 1,
                                    color: 'rgba(35,146,253,1)'
                                }]
                            );
                            options.series[0].data = optionsY;
                            options.series[1].data = optionsY;
                            options.xAxis.data = optionsX;
                            getEchartModal.setOption(options, true);
                        } else {
                            $("#echartModalOne").addClass("hide").siblings().removeClass("hide");
                            warningTip.say("暂无数据，请稍后再试");
                        }
                    });
                }

                actionStatisticsData(1);
                userLoginStatisticsData(1);

                $("#databoardModal").on("click", ".body-right-box .btn", function () {
                    var $this = $(this),
                        timeModel,
                        thisIndex = $this.index() + 1,
                        thisCls = $this.hasClass('btn-primary');
                    if (thisCls) {
                        return;
                    }
                    if (thisIndex === 1) {
                        timeModel = '1';
                    } else if (thisIndex === 2) {
                        timeModel = '2';
                    } else if (thisIndex === 3) {
                        timeModel = '3';
                    }
                    $this.addClass('btn-primary').siblings().removeClass('btn-primary');
                    actionStatisticsData(timeModel);
                    userLoginStatisticsData(timeModel);
                });
                break;
        }
    });
    /***详情弹窗---end---**/

    /**
     * 滚动效果 抓拍数 告警数 赋值
     */
    function refreshTopDataInfo() {
        if (globalMapData === 'allPCSNum') {
            if (alarmGAJData.length > 0) { // 告警数
                var isRefresh = true
                for (var i = 0; i < alarmGAJData.length; i++) {
                    if (alarmGAJData[i].orgCode == globalCodeData) {
                        isRefresh = false
                        refreshAlarmCountInfo(alarmGAJData[i].counts);
                        refreshAlarmTodayInfo(alarmGAJData[i].totalToday);
                    }
                }
                if (isRefresh) {
                    refreshAlarmCountInfo(0);
                    refreshAlarmTodayInfo(0);
                }
            }
            if (pictureGAJData.length > 0) { // 抓拍人像数
                var isRefresh = true
                for (var i = 0; i < pictureGAJData.length; i++) {
                    if (pictureGAJData[i].orgCode == globalCodeData) {
                        isRefresh = false
                        refreshSnapCountInfo(pictureGAJData[i].counts);
                        refreshSnapBoardTodayInfo(pictureGAJData[i].totalToday);
                    }
                }
                if (isRefresh) {
                    refreshSnapCountInfo(0);
                    refreshSnapBoardTodayInfo(0);
                }
            }
        } else {
            if (alarmSData.length > 0) { // 告警数
                refreshAlarmCountInfo(alarmSData[0].counts);
                refreshAlarmTodayInfo(alarmSData[0].totalToday);
            }
            if (pictureSData.length > 0) { // 抓拍人像数
                refreshSnapCountInfo(pictureSData[0].counts);
                refreshSnapBoardTodayInfo(pictureSData[0].totalToday);
            }
        }
    }

    /**
     * 地图部分 辖区选择进入
     *  @param { string } code // 根据orgid获取的code值
     */
    function setIntoAreaData(code) {
        var mapTimer = window.setInterval(function () {
            if (clickIntoMapData) {
                clickIntoMapData = false;
                window.clearInterval(mapTimer);
                window.setTimeout(function () {
                    var mapIframe = document.getElementById('dashboardMap'),
                        targetOrigin = mapUrl + 'peopleCityBlack.html?orgid=44032',
                        targetOpts = {
                            type: 'changeArea',
                            mydata: code
                        };
                    mapIframe.contentWindow.postMessage(targetOpts, targetOrigin);
                }, 300)
            }
        }, 30);
    }

    function setMapNumData(result, type, name, isToday) {
        var mapIframe = document.getElementById('dashboardMap'),
            targetOrigin = mapUrl + 'peopleCityBlack.html?orgid=44032';

        var data = [];
        if (result && result.length) {
            for (var i = 0; i < result.length; i++) {
                if (isToday) {
                    data.push({
                        DM: result[i].orgCode,
                        num: result[i].totalToday
                    });
                } else {
                    data.push({
                        DM: result[i].orgCode,
                        num: result[i].counts
                    });
                }
            }
        }
        var targetOpts = {
            type: type,
            FJDM: globalCodeData,
            mydata: {
                type: globalColorData,
                name: name,
                data: data
            }
        };
        window.setTimeout(function () {
            mapIframe.contentWindow.postMessage(targetOpts, targetOrigin);
            clickIntoMapData = true;
        }, 100);
    }

    //顶部和地图联动--抓拍总数
    $("#snapCountStatisBoard").on("click", ".snapCountStatisAll,.dashboard-roll-num", function () {
        $('#dataSwitchTabBut').find('.tab-item').eq(1).click();
        $("#snapCountStatisBoard").find(".snapCountStatisAll,.dashboard-roll-num").addClass("active");
        $("#snapCountStatisAlarm").find(".snapCountStatisAll,.dashboard-roll-num").removeClass("activeTwo");
        $("#snapCountStatisBoard").find(".snapCountStatisToday").removeClass("active");
        $("#snapCountStatisAlarm").find(".snapCountStatisToday").removeClass("activeTwo");
    }).on("click", ".snapCountStatisToday", function () {
        $(this).addClass("active");
        $("#snapCountStatisAlarm").find(".snapCountStatisToday").removeClass("activeTwo");
        $("#snapCountStatisBoard").find(".snapCountStatisAll,.dashboard-roll-num").removeClass("active");
        $("#snapCountStatisAlarm").find(".snapCountStatisAll,.dashboard-roll-num").removeClass("activeTwo");
        $('#dataSwitchTabBut').find('.tab-item').removeClass("active");

        globalColorData = 'green';
        globalTypeData = 'faceCameraCount';
        if (pictureGAJData.length > 0 || picturePCSData.length > 0) {
            if (globalMapData == 'allPCSNum') {
                var PCSData = [];
                for (var i = 0; i < picturePCSData.length; i++) {
                    if (picturePCSData[i].orgCode.indexOf(globalCodeData) >= 0) {
                        PCSData.push(picturePCSData[i]);
                    }
                }
                setMapNumData(PCSData, 'allPCSNum', '抓拍数', 'today');
            } else {
                setMapNumData(pictureGAJData, 'allNum', '抓拍数', 'today');
            }
        } else {
            var globalData = '';
            setMapNumData(globalData, 'allNum', 'today');
        }

    });

    //顶部和地图联动--告警总数
    $("#snapCountStatisAlarm").on("click", ".snapCountStatisAll,.dashboard-roll-num", function () {
        $('#dataSwitchTabBut').find('.tab-item').eq(2).click();
        $("#snapCountStatisBoard").find(".snapCountStatisAll,.dashboard-roll-num").removeClass("active");
        $("#snapCountStatisAlarm").find(".snapCountStatisAll,.dashboard-roll-num").addClass("activeTwo");
        $("#snapCountStatisBoard").find(".snapCountStatisToday").removeClass("active");
        $("#snapCountStatisAlarm").find(".snapCountStatisToday").removeClass("activeTwo");
    }).on("click", ".snapCountStatisToday", function () {
        $(this).addClass("activeTwo");
        $("#snapCountStatisBoard").find(".snapCountStatisToday").removeClass("active");
        $("#snapCountStatisBoard").find(".snapCountStatisAll,.dashboard-roll-num").removeClass("active");
        $("#snapCountStatisAlarm").find(".snapCountStatisAll,.dashboard-roll-num").removeClass("activeTwo");
        $('#dataSwitchTabBut').find('.tab-item').removeClass("active");

        globalColorData = 'yellow';
        globalTypeData = 'bkCameraCount';
        if (alarmGAJData.length > 0 || alarmPCSData.length > 0) {
            if (globalMapData === 'allPCSNum') {
                var PCSData = [];
                for (var i = 0; i < alarmPCSData.length; i++) {
                    if (alarmPCSData[i].orgCode.indexOf(globalCodeData) >= 0) {
                        PCSData.push(alarmPCSData[i]);
                    }
                }
                setMapNumData(PCSData, 'allPCSNum', '告警数', 'today');
            } else {
                setMapNumData(alarmGAJData, 'allNum', '告警数', 'today');
            }
        } else {
            var globalData = '';
            setMapNumData(globalData, 'allNum', 'today');
        }
    });

    // 地图按钮切换事件
    $('#dataSwitchTabBut').find('.tab-item').on('click', function () {
        var $this = $(this),
            thisIndex = $this.index();

        $("#snapCountStatisBoard").find(".snapCountStatisToday").removeClass("active");
        $("#snapCountStatisAlarm").find(".snapCountStatisToday").removeClass("activeTwo");

        $this.addClass('active').siblings('.tab-item').removeClass('active');
        if (thisIndex === 0) {
            $("#snapCountStatisBoard").find(".snapCountStatisAll,.dashboard-roll-num").removeClass("active");
            $("#snapCountStatisAlarm").find(".snapCountStatisAll,.dashboard-roll-num").removeClass("activeTwo");

            globalColorData = 'blue';
            globalTypeData = 'yldCount';
            if (cameraGAJData.length > 0 || cameraPCSData.length > 0) {
                if (globalMapData === 'allPCSNum') {
                    var PCSData = [];
                    for (var i = 0; i < cameraPCSData.length; i++) {
                        if (cameraPCSData[i].orgCode.indexOf(globalCodeData) >= 0) {
                            PCSData.push(cameraPCSData[i]);
                        }
                    }
                    setMapNumData(PCSData, 'allPCSNum', '抓拍机数');
                } else {
                    setMapNumData(cameraGAJData, 'allNum', '抓拍机数');
                }
            } else {
                var globalData = '';
                setMapNumData(globalData, 'allNum');
            }
        } else if (thisIndex === 1) {
            $("#snapCountStatisBoard").find(".snapCountStatisAll,.dashboard-roll-num").addClass("active");
            $("#snapCountStatisAlarm").find(".snapCountStatisAll,.dashboard-roll-num").removeClass("activeTwo");

            globalColorData = 'green';
            globalTypeData = 'faceCameraCount';
            if (pictureGAJData.length > 0 || picturePCSData.length > 0) {
                if (globalMapData == 'allPCSNum') {
                    var PCSData = [];
                    for (var i = 0; i < picturePCSData.length; i++) {
                        if (picturePCSData[i].orgCode.indexOf(globalCodeData) >= 0) {
                            PCSData.push(picturePCSData[i]);
                        }
                    }
                    setMapNumData(PCSData, 'allPCSNum', '抓拍数');
                } else {
                    setMapNumData(pictureGAJData, 'allNum', '抓拍数');
                }
            } else {
                var globalData = '';
                setMapNumData(globalData, 'allNum');
            }
        } else if (thisIndex === 2) {
            $("#snapCountStatisBoard").find(".snapCountStatisAll,.dashboard-roll-num").removeClass("active");
            $("#snapCountStatisAlarm").find(".snapCountStatisAll,.dashboard-roll-num").addClass("activeTwo");

            globalColorData = 'yellow';
            globalTypeData = 'bkCameraCount';
            if (alarmGAJData.length > 0 || alarmPCSData.length > 0) {
                if (globalMapData === 'allPCSNum') {
                    var PCSData = [];
                    for (var i = 0; i < alarmPCSData.length; i++) {
                        if (alarmPCSData[i].orgCode.indexOf(globalCodeData) >= 0) {
                            PCSData.push(alarmPCSData[i]);
                        }
                    }
                    setMapNumData(PCSData, 'allPCSNum', '告警数');
                } else {
                    setMapNumData(alarmGAJData, 'allNum', '告警数');
                }
            } else {
                var globalData = '';
                setMapNumData(globalData, 'allNum');
            }
        } else if (thisIndex === 3) {
            globalColorData = 'blue';
            globalTypeData = 'yldCount';
            console.log(historyAvePicGAJData, historyAvePicPCSData);
            if (historyAvePicGAJData.length > 0 || historyAvePicPCSData.length > 0) {
                if (globalMapData === 'allPCSNum') {
                    var PCSData = [];
                    for (var i = 0; i < historyAvePicPCSData.length; i++) {
                        if (historyAvePicPCSData[i].orgCode.indexOf(globalCodeData) >= 0) {
                            PCSData.push(historyAvePicPCSData[i]);
                        }
                    }
                    setMapNumData(PCSData, 'allPCSNum', '历史抓拍数');
                } else {
                    setMapNumData(historyAvePicGAJData, 'allNum', '历史抓拍数');
                }
            } else {
                var globalData = '';
                setMapNumData(globalData, 'allNum');
            }
        }
    });

    // 接受地图回传数据
    window.addEventListener('message', function (ev) {
        var data = ev.data,
            code = data.mydata,
            $dashboard = $('body').find('.data-dashboard');
        // 判断地图回传回来的数据是分局点击下钻
        if (data.type === 'PCSDM' && $dashboard.length > 0) {
            globalCodeData = code;
            globalMapData = 'allPCSNum';
            $('#dataSwitchTabBut').find('.active').click();
            setIntoAreaData(globalCodeData); // 定位地图区域
            refreshTopDataInfo();
        } else if (ev.data === 'FJDM') {
            globalCodeData = '4403';
            globalMapData = 'allNum';
            $('#dataSwitchTabBut').find('.active').click();
            setIntoAreaData(globalCodeData);  // 定位地图区域
            refreshTopDataInfo();
        } else if (data === 'initMap?44032' || data === 'initMap?44031') { // 判断是否为初始化地图
            // 初始化设置地图数据
            window.setTimeout(function () {
                if (globalMapData !== 'allNum') {
                    setIntoAreaData(globalCodeData); // 定位地图区域
                }
                $('.tab-item').eq(0).click();
            }, 1000)
        }
    });

    // 测试静态数据（暂无作用）
    var dataAxis = ['常驻', '在逃', '涉恐', '流动', '社保', '嫌疑人', '盗窃汽车', '特定人员', '省厅W2', '机场'];
    var data = [140, 82, 45, 115, 140, 85, 45, 113, 41, 115];


    //任务状态图表配置信息（暂无作用）
    var taskOption = {
        graphic: [{
            type: 'text',
            left: 'center',
            top: '44%',
            style: {
                text: '布控任务',
                textAlign: 'center',
                fill: '#fff',
                fontSize: 20
            }
        }],
        color: ['#2193fe', '#1ef1ff', '#6c7dff'],
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c}"
        },
        series: [{
            name: '任务状态',
            type: 'pie',
            center: ['50%', '50%'],
            radius: ['72%', '90%'],
            avoidLabelOverlap: false,
            hoverOffset: 3,
            itemStyle: {
                borderWidth: 2,
                borderType: 'solid',
                borderColor: '#15212d'
            },
            label: {
                normal: {
                    show: false,
                    position: 'center'
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data: [{
                value: 11,
                name: '紧急'
            }, {
                value: 10,
                name: '重要'
            }, {
                value: 11,
                name: '一般'
            }]
        }]
    };

    /**************************************人像统计和抓拍统计***************************************/
    var configData = {
        type: 1,
        orgId: '10',
        startTime: '',
        endTime: '',
    }
    //静态数据列表
    var configPortraitData = {
        type: 1, // 1-按日 2-按月
        libType: 1,
        libType: 1, //1 全量库 2：唯一库
        startTime: '',
        endTime: ''
    };

    /**
     * 获取库列表
     * @param {*} $modal 弹窗
     */
    function getAllOrgId($modal) {
        $container = $modal.find(".snapStatisticOrg .selectpicker");
        var port = 'v2/org/getOrgInfos',
            data = {
                orgType: 2,
                userType: 2,
                returnType: 3
            };
        var successFunc = function (data) {
            if (data.code === '200') {
                var result = data.data;
                // 对返回数组进行排序 市局排在最上层
                for (var i = 0; i < result.length; i++) {
                    if (result[i].parentId === null) {
                        arrayBox = result[i];
                        result.splice(i, 1);
                        result.splice(0, 0, arrayBox);
                    }
                }
                if (result) { // 存在返回值
                    itemHtml = `<option class="option-item" orgid="${result[0].orgId}" value="${result[0].orgId}" selected>${result[0].orgName}</option>`;
                    for (var i = 1; i < result.length; i++) {
                        itemHtml += `<option class="option-item" orgid="${result[i].orgId}" value="${result[i].orgId}" parentid="${result[i].parentId}">${result[i].orgName}</option>`;
                    }
                    $container.each((index, dom) => {
                        $(dom).html(itemHtml); // 元素赋值
                        $(dom).prop('disabled', false); // 非不可选
                        $(dom).selectpicker('refresh');
                    })
                    // $container.html(itemHtml); // 元素赋值

                    // $container.prop('disabled', false); // 非不可选
                    // $container.selectpicker('refresh');
                } else {
                    // $container.prop('disabled', true);
                    // $container.val(null);
                    // $container.selectpicker('refresh');
                    $container.each((dom) => {
                        $(dom).prop('disabled', true);
                        $(dom).val(null);
                        $(dom).selectpicker('refresh');
                    })
                }
            } else {
                $container.each((dom) => {
                    $(dom).prop('disabled', true);
                    $(dom).val(null);
                    $(dom).selectpicker('refresh');
                })
                // $container.prop('disabled', true);
                // $container.val(null);
                // $container.selectpicker('refresh');
            }
        };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };

    //静态和动态的title显示
    function parmasMatter(value, row, index) {
        var span = document.createElement('span');
        span.setAttribute('title', value);
        span.innerHTML = value;
        return span.outerHTML;
    }

    /**
     * 列表生成
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} data 过滤条件对象
     */
    function createSnapStatisticList($table, first, configData) {
        showLoading($('#snapStatisticModal .modal-body'));
        var $thead = $table.find('thead');
        var $tbody = $table.find('tbody');
        var port = 'v2/index/snapStatisticsReport',
            successFunc = function (data) {
                $thead.empty();
                $tbody.empty();
                hideLoading($('#snapStatisticModal .modal-body'));

                if (data.code === '200' && data.data && data.data.length > 0) {
                    $("#snapStatisticLoadEmpty").addClass("hide");
                    var result = data.data;
                    $table.data({
                        'result': result
                    });

                    var dataList = [];
                    for (key in result[0]) {
                        if (key != 'orgId' && key != 'orgName') {
                            dataList.push(key);
                        }
                    }
                    var totalWidth = $("#snapStatisticModal .search-tab-box").innerWidth()
                    var perWidth = 0
                    if ((dataList.length + 1) * 120 < totalWidth) {
                        perWidth = parseFloat(totalWidth / (dataList.length + 1))
                    }

                    // 添加表头
                    // var thHtml = `<th data-field="time0">
                    //                 <div class="th-inner">机构</div>
                    //             </th>`;
                    // dataList.sort((a, b) => a.localeCompare(b));
                    // for (var i = 0; i < dataList.length; i++) {
                    //     thHtml += `<th data-field="time${i + 1}">
                    //                     <div class="th-inner" title="${dataList[i]}">${dataList[i]}</div>
                    //                 </th>`
                    // }
                    // $thead.append(thHtml);

                    // // 添加列表
                    // for (var j = 0; j < result.length; j++) {
                    //     var tdHtml = `<tr data-index="${j}" class="detail-row">
                    //                 <td>${result[j].orgName}</td>`;
                    //     for (var k = 0; k < dataList.length; k++) {
                    //         var data = parseFloat(result[j][dataList[k]]).toLocaleString();
                    //         tdHtml += `<td title="${data}">${data}</td>`
                    //     }
                    //     tdHtml += `</tr>`;
                    //     $tbody.append(tdHtml); // 添加行
                    // }

                    var columnsArr = [{
                        field: 'field0',
                        title: "机构名称",
                        width: 200,
                        formatter: parmasMatter
                    }],
                        dataArr = [];

                    dataList.sort((a, b) => a.localeCompare(b));
                    for (var i = 0; i < dataList.length; i++) {
                        // thHtml += `<th data-field="time${i + 1}">
                        //                 <div class="th-inner" title="${dataList[i]}">${dataList[i]}</div>
                        //             </th>`
                        var columnsArrObj = {};
                        columnsArrObj.field = `field${i + 1}`;
                        columnsArrObj.title = `${dataList[i]}`;
                        columnsArrObj.width = 100;

                        // if (i == 0) {
                        //     columnsArrObj.formatter = function (value, row, index) {
                        //         return `<span class="option">${value}</span>`;
                        //     }
                        // }
                        columnsArr.push(columnsArrObj);
                    }

                    // 添加列表
                    for (var j = 0; j < result.length; j++) {
                        // var tdHtml = `<tr data-index="${j}" class="detail-row">
                        //             <td>${result[j].orgName}</td>`;
                        var dataArrObj = {};
                        dataArrObj.field0 = `${result[j].orgName}`;

                        for (var k = 0; k < dataList.length; k++) {
                            var data = parseFloat(result[j][dataList[k]]).toLocaleString();
                            dataArrObj[`field${k + 1}`] = `${data}`;
                        }
                        dataArr.push(dataArrObj);
                    }
                    //$("#snapStatisticTable").bootstrapTable("destroy");
                    var tableHeight = $("#snapStatisticModal .modal-body").height() - $("#snapStatisticModal .search-terms-box").height();
                    $("#snapStatisticTable").bootstrapTable("destroy").bootstrapTable({
                        height: tableHeight,
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: true,
                        fixedNumber: 1
                    });
                } else {
                    $("#snapStatisticLoadEmpty").removeClass("hide");
                    $("#snapStatisticTable").bootstrapTable("destroy");
                    if (data.code != '200') {
                        loadEmpty($("#snapStatisticLoadEmpty"), "暂无检索结果", data.message);
                    } else {
                        loadEmpty($("#snapStatisticLoadEmpty"), "暂无检索数据", "");
                    }
                    //warningTip.say(data.message);
                }
            };
        loadData(port, true, configData, successFunc);
    };

    /**
     * 列表生成 静态人像
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} data 过滤条件对象
     */
    function createSnapportraitList($table, first, configData) {
        showLoading($('#snapStatisticModal .modal-body'));
        var $thead = $table.find('thead');
        var $tbody = $table.find('tbody');
        var port = 'v2/index/libStatisticsReport',
            successFunc = function (data) {
                $thead.empty();
                $tbody.empty();
                hideLoading($('#snapStatisticModal .modal-body'));

                if (data.code === '200' && data.data && data.data.length > 0) {
                    $("#snapStatisticLoadEmpty").addClass("hide");
                    var result = data.data;
                    $table.data({
                        'result': result
                    });

                    var dataList = [];
                    for (key in result[0]) {
                        if (key != 'libId' && key != 'libName' && key != 'average') {
                            dataList.push(key);
                        }
                    }
                    var totalWidth = $("#snapStatisticModal .search-tab-box").innerWidth()
                    var perWidth = 0
                    if ((dataList.length + 1) * 120 < totalWidth) {
                        perWidth = parseFloat(totalWidth / (dataList.length + 1))
                    }

                    var columnsArr = [{
                        field: 'field0',
                        title: "库名称",
                        width: 150,
                        formatter: parmasMatter
                    }, {
                        field: 'field1',
                        title: `${configPortraitData.type == 1 ? '日均' : '月均'}`,
                        width: 80,
                        formatter: parmasMatter
                    }],
                        dataArr = [];

                    dataList.sort((a, b) => a.localeCompare(b));
                    for (var i = 0; i < dataList.length; i++) {
                        var columnsArrObj = {};
                        columnsArrObj.field = `field${i + 2}`;
                        columnsArrObj.title = `${dataList[i]}`;
                        columnsArrObj.width = 100;
                        columnsArrObj.formatter = parmasMatter;
                        columnsArr.push(columnsArrObj);
                    }

                    // 添加列表
                    for (var j = 0; j < result.length; j++) {
                        var dataArrObj = {};
                        dataArrObj.field0 = `${result[j].libName}`;
                        dataArrObj.field1 = `${result[j].average}`;

                        for (var k = 0; k < dataList.length; k++) {
                            var data = parseFloat(result[j][dataList[k]]).toLocaleString();
                            dataArrObj[`field${k + 2}`] = `${data}`;
                        }
                        dataArr.push(dataArrObj);
                    }

                    var tableHeight = $("#snapStatisticModal .modal-body").height() - $("#snapStatisticModal .search-terms-box").height();
                    $("#snapStatisticTable").bootstrapTable("destroy").bootstrapTable({
                        height: tableHeight,
                        columns: columnsArr,
                        data: dataArr,
                        search: false,
                        fixedColumns: true,
                        fixedNumber: 2
                    });
                } else {
                    $("#snapStatisticLoadEmpty").removeClass("hide");
                    $("#snapStatisticTable").bootstrapTable("destroy");
                    if (data.code != '200') {
                        loadEmpty($("#snapStatisticLoadEmpty"), "暂无检索结果", data.message);
                    } else {
                        loadEmpty($("#snapStatisticLoadEmpty"), "暂无检索数据", "");
                    }
                }
            };
        loadData(port, true, configData, successFunc);
    };

    $('#queryLibCountsSwiper').prev().find('.statistic').on('click', function () {
        $("#snapStatisticTable").bootstrapTable("destroy");
        $('#snapStatisticModal').removeClass("khModal").modal('show').data('type', 1).find(".modal-title").html("动态人像抓拍统计");
        getAllOrgId($("#snapStatisticModal"));

        $("#snapStatisticModal .snapStatisticOrg").removeClass("hide");
        $("#snapStatisticModal .snapStatisticLib").addClass("hide");
        $("#snapStatisticModal .snapDataType").removeClass("hide");
        $("#snapStatisticModal .snapRoleType").addClass("hide");
        $("#snapStatisticModal .otherData").removeClass("hide");
        $("#snapStatisticModal .khData").addClass("hide");
        $("#snapStatisticModal .ycData").addClass("hide");

        // 初始化数据
        configData = {
            type: 1,
            orgId: '10',
            startTime: '',
            endTime: '',
        }
        $("#snapStatisticModal .btn-group").find('.btn').eq(0).addClass('btn-primary').siblings().removeClass('btn-primary');
        $("#startTimeSnapStat").closest(".aui-col-18").removeClass('hide');
        $("#startTimeSnapStat1").closest(".aui-col-18").addClass('hide');

        configData.startTime = $.trim(sureSelectTime(-8, true).date);
        configData.endTime = $.trim(sureSelectTime(-1, true).date);
        $("#startTimeSnapStat").val(configData.startTime);
        $("#endTimeSnapStat").val(configData.endTime);
        $("#startTimeSnapStat1").val("");
        $("#endTimeSnapStat1").val("");
    })

    //静态人像库统计点击事件
    $('#queryLibCountsTrend').prev().find('.portrait').on('click', function () {
        $("#snapStatisticTable").bootstrapTable("destroy");
        $('#snapStatisticModal').removeClass("khModal").modal('show').data('type', 2).find(".modal-title").html("静态人像数据统计");
        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });

        $("#snapStatisticModal .snapStatisticOrg").addClass("hide");
        $("#snapStatisticModal .snapStatisticLib").removeClass("hide");
        $("#snapStatisticModal .snapDataType").removeClass("hide");
        $("#snapStatisticModal .snapRoleType").addClass("hide");
        $("#snapStatisticModal .otherData").removeClass("hide");
        $("#snapStatisticModal .khData").addClass("hide");
        $("#snapStatisticModal .ycData").addClass("hide");

        // 初始化数据
        configPortraitData = {
            type: 1,
            libType: 1,
            orgId: '10',
            startTime: '',
            endTime: '',
        }

        $("#snapStatisticModal .btn-group").find('.btn').eq(0).addClass('btn-primary').siblings().removeClass('btn-primary');
        $("#startTimeSnapStat").closest(".aui-col-18").removeClass('hide');
        $("#startTimeSnapStat1").closest(".aui-col-18").addClass('hide');
        configPortraitData.startTime = $.trim(sureSelectTime(-8, true).date);
        configPortraitData.endTime = $.trim(sureSelectTime(-1, true).date);
        $("#startTimeSnapStat").val(configPortraitData.startTime);
        $("#endTimeSnapStat").val(configPortraitData.endTime);
        $("#startTimeSnapStat1").val("");
        $("#endTimeSnapStat1").val("");
    })

    //静态人像人像库切换事件
    $("#snapStatisticModal").on("change", ".snapStatisticLib input[name=snapStatisticLib][type=radio]", () => {
        var val = $("#snapStatisticModal").find("input[name=snapStatisticLib]:checked").val();
        configPortraitData.libType = val;

        createSnapportraitList($('#snapStatisticTable'), true, configPortraitData);
    })

    //报表周报日报切换
    $("#snapStatisticModal").on("click", ".khData .ui-checkboxradio-button", function () {
        if ($(this).next().val() == 2) { //周报
            $("#snapStatisticModal .khDataWeek").removeClass("hide");
            $("#snapStatisticModal .khDataDay").addClass("hide");
        } else {
            $("#snapStatisticModal .khDataDay").removeClass("hide");
            $("#snapStatisticModal .khDataWeek").addClass("hide");
        }
    })

    $('#snapStatisticModal').on("shown.bs.modal", function () {
        if ($('#snapStatisticModal').data('type') == '2') {
            if (!$("#snapStatisticLibOne").prev().hasClass("ui-checkboxradio-checked")) {
                $("#snapStatisticLibOne").click();
            } else {
                createSnapportraitList($('#snapStatisticTable'), true, configPortraitData);
            }
        } else if ($('#snapStatisticModal').data('type') == '1') {
            // 打开弹框后获取数据 否则获取不到宽度
            createSnapStatisticList($('#snapStatisticTable'), true, configData);
        }
        // else if ($('#snapStatisticModal').data('type') == '3') {  //考核报表
        //     // 打开弹框后获取数据 否则获取不到宽度
        //     createSnapKHList($('#snapStatisticTable'), true, configKHData);
        // } else {  //异常报表
        //     createSnapYCList($('#snapStatisticTable'), true, configYCData);
        // }
    })

    $('#snapStatisticSearchBut').on('click', function () {
        if ($('#snapStatisticModal').data('type') == '2') { // 静态人像
            configPortraitData.orgId = $("#orgIdData").val();
            configPortraitData.type = $("#snapStatisticModal .btn-group").find('.btn-primary').index() + 1;
            if (configPortraitData.type == 1) {
                configPortraitData.startTime = $.trim($("#startTimeSnapStat").val());
                configPortraitData.endTime = $.trim($("#endTimeSnapStat").val());
            } else {
                configPortraitData.startTime = $.trim($("#startTimeSnapStat1").val());
                configPortraitData.endTime = $.trim($("#endTimeSnapStat1").val());
            }
            if (configPortraitData.startTime && configPortraitData.endTime) {
                createSnapportraitList($('#snapStatisticTable'), true, configPortraitData);
            } else {
                warningTip.say('请输入起止时间');
            }
        } else if ($('#snapStatisticModal').data('type') == '1') {
            configData.orgId = $("#orgIdData").val();
            configData.type = $("#snapStatisticModal .btn-group").find('.btn-primary').index() + 1;
            if (configData.type == 1) {
                configData.startTime = $.trim($("#startTimeSnapStat").val());
                configData.endTime = $.trim($("#endTimeSnapStat").val());
            } else {
                configData.startTime = $.trim($("#startTimeSnapStat1").val());
                configData.endTime = $.trim($("#endTimeSnapStat1").val());
            }
            if (configData.startTime && configData.endTime) {
                createSnapStatisticList($('#snapStatisticTable'), true, configData);
            } else {
                warningTip.say('请输入起止时间');
            }
        }
        // else if ($('#snapStatisticModal').data('type') == '3') { //考核列表
        //     configKHData.orgId = $("#orgIdData").val();
        //     configKHData.roleType = $(".snapRoleType").find("input[name='snapRoleRadio']:checked").val();
        //     if ($(".khDataDay").hasClass("hide")) { //周报
        //         configKHData.startTime = $.trim($("#khDataDaySnapStart").val());
        //         configKHData.endTime = $.trim($("#khDataDaySnapEnd").val());
        //     } else {
        //         configKHData.startTime = $.trim($("#khDataDaySnap").val());
        //         configKHData.endTime = $.trim($("#khDataDaySnap").val());
        //     }
        //     // if (configKHData.type == 1) {
        //     //     configKHData.startTime = $.trim($("#startTimeSnapStat").val());
        //     //     configKHData.endTime = $.trim($("#endTimeSnapStat").val());
        //     // } else {
        //     //     configKHData.startTime = $.trim($("#startTimeSnapStat1").val());
        //     //     configKHData.endTime = $.trim($("#endTimeSnapStat1").val());
        //     // }
        //     if (configKHData.startTime && configKHData.endTime) {
        //         createSnapKHList($('#snapStatisticTable'), true, configKHData);
        //     } else {
        //         warningTip.say('请输入起止时间');
        //     }
        // } else {  //异常列表
        //     configYCData.orgId = $("#orgIdData").val();
        //     configYCData.roleType = $(".snapRoleType").find("input[name='snapRoleRadio']:checked").val();

        //     configYCData.startTime = $.trim($("#startTimeSnapStatYC").val());
        //     configYCData.endTime = $.trim($("#endTimeSnapStatYC").val());

        //     // if (configYCData.startTime && configYCData.endTime) {
        //     if (configYCData.startTime) {
        //         createSnapYCList($('#snapStatisticTable'), true, configYCData);
        //     } else {
        //         warningTip.say('请输入起始时间');
        //     }
        // }
    })

    $("#snapStatisticModal .btn-group").find('.btn').on('click', function () {
        if ($('#snapStatisticModal').data('type') == '2') { // 静态人像
            $(this).addClass('btn-primary').siblings().removeClass('btn-primary');
            configPortraitData.type = $("#snapStatisticModal .btn-group").find('.btn-primary').index() + 1;
            if (configPortraitData.type == 1) {
                $("#startTimeSnapStat").closest(".aui-col-18").removeClass('hide');
                $("#startTimeSnapStat1").closest(".aui-col-18").addClass('hide');
            } else {
                $("#startTimeSnapStat").closest(".aui-col-18").addClass('hide');
                $("#startTimeSnapStat1").closest(".aui-col-18").removeClass('hide');
            }
        } else if ($('#snapStatisticModal').data('type') == '1') {
            $(this).addClass('btn-primary').siblings().removeClass('btn-primary');
            configData.type = $("#snapStatisticModal .btn-group").find('.btn-primary').index() + 1;
            if (configData.type == 1) {
                $("#startTimeSnapStat").closest(".aui-col-18").removeClass('hide');
                $("#startTimeSnapStat1").closest(".aui-col-18").addClass('hide');
            } else {
                $("#startTimeSnapStat").closest(".aui-col-18").addClass('hide');
                $("#startTimeSnapStat1").closest(".aui-col-18").removeClass('hide');
            }
        } else {
            // $(this).addClass('btn-primary').siblings().removeClass('btn-primary');
            // configKHData.type = $("#snapStatisticModal .btn-group").find('.btn-primary').index() + 1;
            // if (configKHData.type == 1) {
            //     $("#startTimeSnapStat").closest(".aui-col-18").removeClass('hide');
            //     $("#startTimeSnapStat1").closest(".aui-col-18").addClass('hide');
            // } else {
            //     $("#startTimeSnapStat").closest(".aui-col-18").addClass('hide');
            //     $("#startTimeSnapStat1").closest(".aui-col-18").removeClass('hide');
            // }
        }
    })

    //浮层弹窗关闭事件
    $("#closeDataboardModal").on("click", function () {
        $("#databoardModal").addClass('out');
        $('body').removeClass('modal-active');
    })
})(window, window.jQuery)