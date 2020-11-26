(function (window, $) {
    let myDetail = false;
    initDialog();
    function initDialog() {
        let incidentDetail = $(".incident-new-popup").data().incidentDetail;
        myDetail = $(".incident-new-popup").data().myDetail;
        if (incidentDetail) {
            showIncidentDetail(incidentDetail);
        }
    }

    /**
     * 渲染事件详情列表
     * @param {Object} incidentDetail // 事件详情
     */
    function showIncidentDetail(incidentDetail) {
        $("#IDApplyDetailShow").find(".applyChose").addClass("hide");
        // 协办人
        if (incidentDetail.xbUserList) {
            var xbUserNames = "";
            var listLength = incidentDetail.xbUserList.length;
            incidentDetail.xbUserList.forEach(function (ele, index) {
                if (index == listLength - 1) {
                    xbUserNames += ele.userName;
                } else {
                    xbUserNames += ele.userName + '，';
                }
            })
        }
        var imgHtml = "";
        var otherFile = "",
            proveArr = [];
        // 使用人警察证
        if (incidentDetail.attachments) {
            incidentDetail.attachments.forEach(function (item, index) {
                if (item.type == '1') {
                    imgHtml += `<img class="table-img img-right-event" src="${item.attachmentUrl ? item.attachmentUrl : './assets/images/control/person.png'}">`;
                } else if (item.type == '3') {
                    otherFile += `<img class="table-img img-right-event" src="${item.attachmentUrl ? item.attachmentUrl : './assets/images/control/person.png'}">`;
                } else if (item.type == '2') {
                    proveArr.push(item);
                }
            });
        }
        // 文书
        if (incidentDetail.writUrl || proveArr.length > 0) {
            var writUrl = '';
            if (incidentDetail.writUrl) {
                if (incidentDetail.writUrl.toLowerCase().indexOf('.pdf') > -1) {
                    //var writUrl = `<span class="result-name text-prompt"></span>`;
                    writUrl = `<a class="docUrl" url="${incidentDetail.writUrl}"><img class="table-img img-right-event" src="./assets/images/managers/ic_pdf.png" alt=""></a>`;
                } else {
                    writUrl = `<img class="table-img img-right-event" src="${incidentDetail.writUrl}" alt="">`;
                }
            }

            proveArr.forEach(item => {
                if (item.attachmentUrl.toLowerCase().indexOf('.pdf') > -1) {
                    writUrl += `<a class="docUrl" url="${item.attachmentUrl}"><img class="table-img img-right-event" src="./assets/images/managers/ic_pdf.png" alt=""></a>`;
                } else {
                    writUrl += `<img class="table-img img-right-event" src="${item.attachmentUrl}" alt="">`;
                }
            })
        } else {
            var writUrl = '--';
        }

        var applyDetail1 = "",
            applyDetail2 = "";
        // 申请时间和次数
        if (incidentDetail.applicationType != '7' && incidentDetail.applications.length > 0) {
            incidentDetail.applications.forEach(function (el) {
                if (el.type == 1) {
                    applyDetail1 = el;
                } else if (el.type == 2) {
                    applyDetail2 = el;
                }
            })
        }

        // 申请详情
        var _applyHtml = `<li class="aui-col-24 form-item-box aui-no-padding">
                                <div class="aui-from-horizontal">
                                    <div class="form-group aui-col-12">
                                        <label class="aui-form-label">申请人:</label>
                                        <div class="form-text" title="${(incidentDetail.userName || '--') + '(' + (incidentDetail.orgName || '--') + '，' + (incidentDetail.userId || '--') + ')'}">
                                        ${(incidentDetail.userName || '--') + '(' + (incidentDetail.orgName || '--') + '，' + (incidentDetail.userId || '--') + ')'}</div>
                                    </div>
                                    <div class="form-group aui-col-12">
                                        <label class="aui-form-label">申请时间:</label>
                                        <div class="form-text">${incidentDetail.createTime || '--'}</div>
                                    </div>
                                </div>
                                <div class="aui-from-horizontal">
                                    <div class="form-group aui-col-12 applyChose applyWorkType applylabh hide">
                                        <label class="aui-form-label">立案编号:</label>
                                        <div class="form-text">${incidentDetail.labh || '--'}</div>
                                    </div>
                                    <div class="form-group aui-col-12 applyFile">
                                        <label class="aui-form-label">证明材料:</label>
                                        <div class="form-text hover-pointer">${writUrl}</div>
                                    </div>
                                </div>
                                <div class="aui-from-horizontal">
                                    <div class="form-group aui-col-12 applyInfo">
                                        <label class="aui-form-label">任务名称:</label>
                                        <div class="form-text" title="${incidentDetail.incident || '--'}">${incidentDetail.incident || '--'}</div>
                                    </div>
                                    <div class="form-group aui-col-12 applyInfo">
                                        <label class="aui-form-label">任务详情:</label>
                                        <div class="reason-box">${incidentDetail.comments || '--'}</div>
                                    </div>
                                </div>
                                <div class="form-group aui-col-12 applyCritical hide">
                                    <label class="aui-form-label">紧急类型:</label>
                                    <div class="form-text">${incidentDetail.applicationLevel == '2' ? '<span class="status-text text-danger">紧急</span>' : '<span class="status-text text-prompt">一般</span>'}</div>
                                </div>
                                <div class="form-group aui-col-12 applyApprover hide">
                                    <label class="aui-form-label">审批人:</label>
                                    <div class="form-text">${incidentDetail.approverName || '--'}</div>
                                </div>
                                <div class="aui-from-horizontal">
                                    <div class="form-group aui-col-12 applyOtherFile">
                                        <label class="aui-form-label">附件:</label>
                                        <div class="reason-box">${otherFile || '--'}</div>
                                    </div>
                                    <div class="form-group aui-col-12 applyOtherFileComment">
                                        <label class="aui-form-label">附件说明:</label>
                                        <div class="reason-box">${incidentDetail.attachmentsDesc || '--'}</div>
                                    </div>
                                </div>
                                <div class="form-group aui-col-12 applyChose applyWorkType hide">
                                    <label class="aui-form-label">工作内容:</label>
                                    <div class="form-text">${incidentDetail.applicationRcgzType == 1 && "走失老人" || incidentDetail.applicationRcgzType == 2 && "走失儿童" || incidentDetail.applicationRcgzType == 3 && "特殊人群" || incidentDetail.applicationRcgzType == 4 && "在逃人员" || incidentDetail.applicationRcgzType == 99 && "其它"}</div>
                                </div>
                                <div class="form-group aui-col-12 applyChose applyIdCard hide">
                                    <label class="aui-form-label">待查人身份:</label>
                                    <div class="form-text">${(incidentDetail.searchedIdcard + incidentDetail.searchedName) || '--'}</div>
                                </div>
                                <div class="form-group aui-col-12 applyChose applyPhoto hide">
                                    <label class="aui-form-label">待查人照片:</label>
                                    <div class="form-text"><img class="table-img img-right-event" src="${incidentDetail.searchedUrl ? incidentDetail.searchedUrl : './assets/images/control/person.png'}" alt=""></div>
                                </div>
                                <div class="form-group aui-col-12 applyChose applyOtherPlaces hide">
                                    <label class="aui-form-label" title="使用人警察证:">使用人警察证:</label>
                                    <div class="form-text">
                                        <div class="image-group">${imgHtml || '--'}</div>
                                    </div>
                                </div>
                                <div class="form-group aui-col-12 applyChose applyzbdw hide">
                                    <label class="aui-form-label" title="主办单位">主办单位:</label>
                                    <div class="form-text">
                                        <div class="image-group">${incidentDetail.zbdwName || '--'}</div>
                                    </div>
                                </div>
                                <!--<div class="form-group aui-col-12">
                                    <label class="aui-form-label">协办人:</label>
                                    <div class="form-text" title="${xbUserNames || '--'}">${xbUserNames || '--'}</div>
                                </div>-->
                            </li>
                            <li class="aui-col-24 form-item-box aui-no-padding">
                                <!--<div class="form-group aui-col-12">
                                    <label class="aui-form-label">静态可用日期:</label>
                                    <div class="form-text">${applyDetail1.startUseDate + '~' + applyDetail1.endUseDate}</div>
                                </div>-->
                                <!--<div class="form-group aui-col-12">
                                    <label class="aui-form-label">静态可用次数:</label>
                                    <div class="form-text">${applyDetail1.limitCount}</div>
                                </div>-->
                                <div class="form-group aui-col-12 dynamic dynamicOne">
                                    <label class="aui-form-label">可用日期:</label>
                                    <div class="form-text">${(applyDetail2.startUseDate || '--') + '~' + (applyDetail2.endUseDate || '--')}</div>
                                </div>
                                <div class="form-group aui-col-12 dynamic dynamicTwo">
                                    <label class="aui-form-label">动态可用次数:</label>
                                    <div class="form-text">${applyDetail2.limitCount || '--'}</div>
                                </div>
                            </li>`;

        $("#IDApplyDetailShow").find(".form-info").html(_applyHtml);
        $("#incidentDialogFileDeatilItem").addClass("hide");

        switch (incidentDetail.applicationType) {
            case 1:
                //日常工作（只允许静态）
                $("#IDApplyDetailShow").find(".card-title").text("日常工作");
                $("#incidentDialog .dynamic").addClass("hide");
                break;
            case 2:
                //警情（显示工作内容）
                $("#IDApplyDetailShow").find(".card-title").text("警情");
                $("#incidentDialog .applyWorkType").removeClass("hide");
                $("#incidentDialog .applyInfo").removeClass("hide");
                $("#incidentDialog .applylabh").find(".aui-form-label").html("警情编号");
                $("#incidentDialogFileDeatilItem").removeClass("hide");
                IDCreatePerFileDetailList($("#incidentDialogFileDeatilTable"), $("#incidentDialogFileDeatilPagination"), incidentDetail.applicationImgs, true, 1, 5);
                break;
            case 3:
            case 10:
                if (incidentDetail.applicationType == '3') {
                    //已立案(显示立案编号)
                    $("#IDApplyDetailShow").find(".card-title").text("已立案");
                    $("#incidentDialog .applylabh").find(".aui-form-label").html("立案编号:");
                    $("#incidentDialog .applyFile").find(".aui-form-label").html("立案文书:");
                } else {
                    $("#IDApplyDetailShow").find(".card-title").text("在逃人员");
                    $("#incidentDialog .applylabh").find(".aui-form-label").html("在逃编号:");
                    $("#incidentDialog .applyFile").find(".aui-form-label").html("案件文书:");
                }

                $("#incidentDialog .applylabh").removeClass("hide");
                $("#incidentDialog .applyInfo").removeClass("hide");
                $("#incidentDialogFileDeatilItem").removeClass("hide");
                IDCreatePerFileDetailList($("#incidentDialogFileDeatilTable"), $("#incidentDialogFileDeatilPagination"), incidentDetail.applicationImgs, true, 1, 5);
                break;
            case 4:
                //专项工作(显示案件编号)
                $("#IDApplyDetailShow").find(".card-title").text("专项工作");
                $("#incidentDialog .applylabh").removeClass("hide");
                $("#incidentDialog .applyInfo").removeClass("hide");
                $("#incidentDialog .applyzbdw").removeClass("hide");
                $("#incidentDialog .applylabh").find(".aui-form-label").html("案件编号:");
                $("#incidentDialog .applyOtherFile").addClass("hide");
                $("#incidentDialog .applyOtherFileComment").addClass("hide");
                break;
            case 5:
                //特殊人员(显示待查人身份和待查人照片)
                $("#IDApplyDetailShow").find(".card-title").text("敏感人员查询");
                $("#incidentDialog .applyPhoto").removeClass("hide");
                $("#incidentDialog .applyIdCard").removeClass("hide");
                $("#incidentDialog .applyOtherFile").addClass("hide");
                $("#incidentDialog .applyOtherFileComment").addClass("hide");
                break;
            case 6:
                //协外（显示使用人警察证）
                $("#IDApplyDetailShow").find(".card-title").text("协外");
                $("#incidentDialog .applyOtherPlaces").removeClass("hide");
                break;
            case 7:
                //紧急
                $("#IDApplyDetailShow").find(".card-title").text("紧急");
                $("#incidentDialog .applyCritical").removeClass("hide").find(".form-text").html(incidentDetail.typeName || '--');
                //$("#incidentDialog .dynamic").addClass("hide");
                $("#incidentDialog .static").addClass("hide");
                $("#incidentDialog .dynamicOne").removeClass("hide").find(".form-text").html(`${(incidentDetail.startUseDate || '--') + '~' + (incidentDetail.endUseDate || '--')}`);
                $("#incidentDialog .applyOtherFile").addClass("hide");
                $("#incidentDialog .applyOtherFileComment").addClass("hide");
                $("#incidentDialog .applyApprover").removeClass("hide");

                if (incidentDetail.type == '3') {
                    $("#IDApplyDetailShow").find(".card-title").text("已立案");
                    $("#incidentDialog .applylabh").removeClass("hide");
                    $("#incidentDialog .applylabh").find(".aui-form-label").html("立案编号:");
                    $("#incidentDialog .applyFile").find(".aui-form-label").html("立案文书:");
                } else if (incidentDetail.type == '2') {
                    $("#IDApplyDetailShow").find(".card-title").text("警情");
                    $("#incidentDialog .applylabh").removeClass("hide").find(".aui-form-label").html("警情编号:");
                } else if (incidentDetail.type == '4') {
                    $("#IDApplyDetailShow").find(".card-title").text("专项工作");
                    $("#incidentDialog .applylabh").addClass("hide");
                }
        }

        if (incidentDetail.applicationType != '7') {
            $("#IDApproveDetailShow").removeClass("hide");
            $("#IDApplyDetailShow").addClass("aui-col-16");

            var _approveHtml = '';
            incidentDetail.approveList && incidentDetail.approveList.forEach((item, index) => {
                // 审核详情
                _approveHtml += `<ul class="form-info form-label-fixed mt-0 ${incidentDetail.approveList.length == 1 || index == (incidentDetail.approveList.length - 1) ? '' : 'fixedTwo'}">
                                    <li class="aui-col-24 form-item-box">
                                        <div class="form-group">
                                            <label class="aui-form-label">审批状态:</label>
                                            <div class="form-text">${item.status === 0 && '<span class="status-text text-prompt">进行中</span>'
                    || item.status === 1 && '<span class="status-text text-active">已通过</span>'
                    || item.status === 2 && '<span class="status-text text-danger">已驳回</div>'}
                                        </div>
                                    </li>
                                    <li class="aui-col-24 form-item-box">
                                        <div class="form-group">
                                            <label class="aui-form-label">审批人:</label>
                                            <div class="form-text">${item.approverName ? item.approverName + '(' + item.orgName + ')' : '--'}</div>
                                        </div>
                                    </li>
                                    <li class="aui-col-24 form-item-box">
                                        <div class="form-group">
                                            <label class="aui-form-label">审批时间:</label>
                                            <div class="form-text">${item.approvalTime || '--'}</div>
                                        </div>
                                    </li>
                                    <li class="aui-col-24 form-item-box">
                                        <div class="form-group">
                                            <label class="aui-form-label">审批意见:</label>
                                            <div class="reason-box">${item.approvalReason || '--'}</div>
                                        </div>
                                    </li>
                                </ul>`;
            });
            $("#IDApproveDetailShow").find(".detailInfoShow").html(_approveHtml);
        } else {
            $("#IDApproveDetailShow").addClass("hide");
            $("#IDApplyDetailShow").removeClass("aui-col-16");
        }

        IDCreateSearchDetailList($("#IDSearchDetailTable"), $("#IDSearchDetailPagination"), incidentDetail, true, 1, 5);
    }

    /**
     * 附件列表展示
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     */
    function IDCreatePerFileDetailList($table, $pagination, targetData, firstPage, currPage, pageSize) {
        // 检索详情
        var $tbody = $table.find('tbody');

        if (firstPage) {
            $pagination.html(''); // 清空分页
        }

        if (targetData && targetData.length > 0) {
            var totalData = targetData.length,
                totalPage = parseInt(totalData / pageSize) + 1;
            if (currPage == totalPage) {
                var currPageSize = totalData % (pageSize);
            } else {
                var currPageSize = pageSize
            }

            var _searchHtml = '';

            for (var i = pageSize * (currPage - 1); i < pageSize * (currPage - 1) + currPageSize; i++) {
                _searchHtml += `<tr class="table-row">
                                    <td></td>
                                    <td><img src="${targetData[i].url || '--'}" onerror="this.error=null;this.src='./assets/images/control/person.png'" style="width:50px;"></td>
                                    <td>${targetData[i].name || '--'}</td>
                                    <td>${targetData[i].idcard || '--'}</td>
                                </tr>`;
            }

            // 先清空节点,再把拼接的节点插入
            $tbody.empty().html(_searchHtml);

            $tbody.find("tr").each(function (index, el) {
                $(el).data('listData', targetData[(currPage - 1) * pageSize + index]);
            });

            if (totalData > pageSize && firstPage) {
                var pageSizeOpt = [{
                    value: 5,
                    text: '5/页',
                    selected: true
                }, {
                    value: 10,
                    text: '10/页',
                }];
                var eventCallBack = function (currPage, pageSize) {
                    IDCreatePerFileDetailList($table, $pagination, targetData, false, currPage, pageSize);
                };
                setPageParams($pagination, totalData, totalPage, eventCallBack, true, pageSizeOpt);
            }
        } else {
            $tbody.html('<tr><td colspan="4" class="text-center">没有匹配的记录</td></tr>');
            $pagination.html(''); // 清空分页
        }
    }

    /**
     * 数据获取 检索详情展示
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     * @param {*} assistData 申请人和协办人数据
     */
    function IDCreateSearchDetailList($table, $pagination, targetData, firstPage, currPage, pageSize, assistData) {
        // 检索详情
        var $tbody = $table.find('tbody');
        if (firstPage) {
            $pagination.empty();
            var assistData = [];
            assistData = assistData.concat(targetData, targetData.xbUserList); // 申请人和协办人数据
        }
        if (assistData && assistData.length > 0) {
            var totalData = assistData.length,
                totalPage = parseInt(totalData / pageSize) + 1;
            if (currPage == totalPage) {
                var currPageSize = totalData % (pageSize);
            } else {
                var currPageSize = pageSize
            }

            var _searchHtml = '';

            for (var i = pageSize * (currPage - 1); i < pageSize * (currPage - 1) + currPageSize; i++) {
                if (targetData.applicationType == '7') {
                    let opt = myDetail ? `<td class="operation container">${assistData[i].userId == targetData.userId ? '--' : assistData[i].rowstate == 1 ?
                        `<button type="button" class="btn btn-sm btn-default stop">中止权限</button>` : '<span class="">已中止</span><button type="button" class="btn btn-sm btn-primary hide restore">恢复权限</button>'}</td>` : `<td>${assistData[i].userId == targetData.userId ? '--' : assistData[i].rowstate == 1 ? '可检索' : '已中止'}</td>`;
                    _searchHtml += `<tr class="table-row">
                                            <td></td>
                                            <td>${(assistData[i].userName || '--') + '(' + (assistData[i].orgName || '--') + ')'}</td>
                                            <td>${assistData[i].userId || '--'}</td>
                                            <td>${assistData[i].userId == targetData.userId ? '申请人' : '协办人'}</td>
                                            ${opt}
                                        </tr>`;
                } else {
                    if (assistData[i] && assistData[i].applications) {
                        var applyAssistDetail1 = "",
                            applyAssistDetail2 = "";
                        assistData[i].applications.forEach(function (el) {
                            if (el.type == 1) {
                                applyAssistDetail1 = el;
                            } else if (el.type == 2) {
                                applyAssistDetail2 = el;
                            }
                        })
                        let opt = myDetail ? `<td class="operation container">${assistData[i].userId == targetData.userId || assistData[0].applications[0].parentId ? '--' : assistData[i].rowstate == 1 ?
                            `<button type="button" class="btn btn-sm btn-default stop">中止权限</button>` : '<span class="">已中止</span><button type="button" class="btn btn-sm btn-primary hide restore">恢复权限</button>'}</td>` : `<td class="operation">${assistData[i].userId == targetData.userId ? '--' : assistData[i].rowstate == 1 ? '可检索' : '已中止'}</td>`;
                        _searchHtml += `<tr class="table-row">
                                        <td></td>
                                        <td>${(assistData[i].userName || '--') + '(' + (assistData[i].orgName || '--') + ')'}</td>
                                        <td>${assistData[i].userId || '--'}</td>
                                        <!--<td>${(applyAssistDetail1.dayUseCount || 0) + '/' + (applyAssistDetail1.dayLimitCount || 0)}</td>
                                        <td class="dynamic">${(applyAssistDetail2.dayUseCount || 0) + '/' + (applyAssistDetail2.dayLimitCount || 0)}</td>-->
                                        <td class="${applyAssistDetail2.totalSearchCount > 0 ? 'dynamic text-link' : 'dynamic'}" incidentId=${targetData.incidentId}>${applyAssistDetail2.totalSearchCount || 0}</td>
                                        <td>${assistData[i].userId == targetData.userId ? '申请人' : '协办人'}</td>
                                        ${opt}
                                    </tr>`;
                    }
                }
            }

            // 先清空节点,再把拼接的节点插入
            $tbody.empty().html(_searchHtml);

            $tbody.find("tr").each(function (index, el) {
                $(el).data({
                    listData: assistData[index],
                    incidentId: targetData.incidentId
                });
            });
            if (targetData.applicationType == 1) {
                $table.find(".static").removeClass("hide");
                $table.find(".dynamic").addClass('hide');
            } else if (targetData.applicationType == 7) {
                $table.find(".static").addClass("hide");
                $table.find(".dynamic").addClass("hide");
            } else {
                $table.find(".static").removeClass("hide");
                $table.find(".dynamic").removeClass('hide');
            }

            if (totalData > pageSize && firstPage) {
                var pageSizeOpt = [{
                    value: 5,
                    text: '5/页',
                    selected: true
                }, {
                    value: 10,
                    text: '10/页',
                }];
                var eventCallBack = function (currPage, pageSize) {
                    $(".table-checkbox-all").removeAttr("checked");
                    IDCreateSearchDetailList($table, $pagination, targetData, false, currPage, pageSize, assistData);
                };
                setPageParams($pagination, totalData, totalPage, eventCallBack, true, pageSizeOpt);
            }
        }
    }

    //动态检索次数详情列表
    function dynamicDetailList($table, $pagination, first, page, size, param) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="7" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/errReport/querySearchDetail',
            portData = {
                incidentId: param.incidentId,
                userId: param.userId,
                page: page ? page : 1,
                size: size ? size : 10,
            },
            successFunc = function (data) {
                hideLoading($table);
                $tbody.empty();
                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });
                    if (result && result.length > 0) {
                        $tbody.empty();
                        var html = '';
                        for (var i = 0; i < result.length; i++) {
                            html += `<tr class="table-row">
                                        <td>${(page - 1) * size + i + 1}</td>
                                        <td><img class="table-img img-right-event" src="${result[i].picUrl ? result[i].picUrl : './assets/images/control/person.png'}" alt=""></td>
                                        <td title="${result[i].incidentName || '未知'}">${result[i].incidentName || '未知'}</td>
                                        <td title="${result[i].orgName || '未知'}">${result[i].orgName || '未知'}</td>
                                        <td title="${result[i].userName || '未知'}">${result[i].userName || '未知'}</td>
                                        <td title="${result[i].userId || '未知'}">${result[i].userId || '未知'}</td>
                                        <td title="${result[i].opTime || '未知'}">${result[i].opTime || '未知'}</td>
                                    </tr>`;
                        }
                        // 先清空节点,再把拼接的节点插入
                        $table.find("tbody").empty().html(html);
                        $table.find("tbody .table-row").each(function (index, el) {
                            $(this).data('list', result[index]);
                        });

                        if (data.data.total > Number(portData.size) && first) {
                            var pageSizeOpt = [{
                                value: 10,
                                text: '10/页',
                                selected: true
                            }, {
                                value: 20,
                                text: '20/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                dynamicDetailList($table, $pagination, false, currPage, pageSize, param);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="7" class="text-center">没有匹配的记录</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="7" class="text-center">没有匹配的记录</td></tr>');
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, portData, successFunc);
    }

    // 权限详情 hover 显示中图
    showMiddleImg($('#IDApplyDetailShow'), $('#incidentDialog'), '.table-img');

    //动态检索详情hover 显示中图
    showMiddleImg($('#incidentDynamicTable'), $('#incidentDynamicDialog'), '.table-img');

    $('#IDSearchDetailTable').on('click', '.operation button', function () {
        var listData = $(this).closest('tr').data('listData'),
            incidentId = $(this).closest('tr').data('incidentId'),
            index = $(this).closest('tr').index(),
            $this = $(this);
        if ($this.text() == "中止权限") {
            var $menu = $([`<div id="mouseOverConfirmBox" class="mouseOverConfirmBox">
                            <h3>确定中止该协办人的检索权限？</h3>
                            <button type="button" class="btn btn-sm btn-primary">确定</button>
                            <button type="button" class="btn btn-sm m-0">取消</button>
                        </div>`].join(''));
            $menu.data({
                rowstate: -1,
                listData,
                incidentId,
                index
            });
        } else {
            $this.addClass("show");
            var $menu = $([`<div id="mouseOverConfirmBox" class="mouseOverConfirmBox">
                            <h3>确定恢复该协办人的检索权限？</h3>
                            <button type="button" class="btn btn-sm btn-primary">确定</button>
                            <button type="button" class="btn btn-sm m-0">取消</button>
                        </div>`].join(''));
            $menu.data({
                rowstate: 1,
                listData,
                incidentId,
                index
            });
        }
        var menuLen = $('#mouseOverConfirmBox').length;
        if (menuLen > 0) {
            $('#mouseOverConfirmBox').off().remove();
        }
        $('body').append($menu);
        var top = $this.offset().top - $menu.outerHeight() - 15;
        var left = $this.offset().left - $menu.outerWidth() / 2 + $this.outerWidth() / 2;
        $menu.css({
            top: top,
            left: left
        });
    }).on('mouseover', '.operation span', function (event) {
        event.stopPropagation();
        event.preventDefault();
        $("#IDSearchDetailTable").find(".restore").addClass("hide").siblings().removeClass('hide');
        var $this = $(this);
        var text = $this.text();
        if (text == '已中止') {
            $this.addClass("hide").siblings().removeClass('hide');
        }
    }).on("mouseout", '.operation button', function (event) { // 布控详情 鼠标移出
        event.stopPropagation();
        event.preventDefault();
        if (!$(this).hasClass('show') && $(this).text() == "恢复权限") {
            $(this).addClass("hide").siblings().removeClass('hide');
        }
    });

    $("body").on('click', '#mouseOverConfirmBox button', function () {
        if ($(this).text() == "确定") {
            var listData = $('#mouseOverConfirmBox').data('listData'),
                incidentId = $('#mouseOverConfirmBox').data('incidentId'),
                index = $('#mouseOverConfirmBox').data('index'),
                rowstate = $('#mouseOverConfirmBox').data('rowstate');
            console.log(incidentId);
            var port = 'v3/myApplication/operateXbUser',
                data = {
                    incidentId: incidentId,
                    userIds: [listData.userId],
                    rowstate: rowstate
                };
            var successFunc = function (data) {
                if (data.code == '200') {
                    warningTip.say("成功");
                    if (rowstate == -1) {  //终止
                        $("#IDSearchDetailTable").find(".operation").eq(index).html(`<span class="">已中止</span><button type="button" class="btn btn-sm btn-primary hide restore">恢复权限</button>`);
                    } else {
                        $("#IDSearchDetailTable").find(".operation").eq(index).html(`<button type="button" class="btn btn-sm btn-default stop">中止权限</button>`);
                    }
                } else {
                    warningTip.say(data.message);
                }
            };
            loadData(port, true, data, successFunc);
        } else {
            $("#mouseOverConfirmBox").addClass('hide');
            $('#IDSearchDetailTable').find('.btn.show').removeClass('show').addClass('hide').prev().removeClass('hide');
        }
    });

    // 权限详情 文书下载 相关文书点击事件
    $('#IDApplyDetailShow').on('click', 'a.docUrl, img.table-img', function () {
        if ($(this).text() !== '暂无') {
            var url = $(this).attr("url") ? $(this).attr("url") : $(this).attr("src");
            var post_url = serviceUrl + '/v2/file/downloadByHttpUrl?url=' + url;
            if ($("#IframeReportImg").length === 0) {
                $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
            }
            $('#IframeReportImg').attr("src", post_url);
        }
    })

    //动态检索次数点击查看详情事件
    $("#IDSearchDetailTable").on("click", ".dynamic.text-link", function () {
        let data = {
            incidentId: $(this).attr("incidentId"),
            userId: $(this).parents("tr").data("listData").userId
        };
        $("#incidentDynamicDialog").modal("show");
        dynamicDetailList($("#incidentDynamicTable"), $("#incidentDynamicPagination"), true, 1, 10, data);
    })

    //关闭弹窗
    $(document).on("click", "#incidentDialogClose", function () {
        $(".incident-new-popup").addClass("hide");
        $(".incident-new-popup").removeData(["incidentDetail", "showDynamicDetail"]);
    })
})(window, window.jQuery);