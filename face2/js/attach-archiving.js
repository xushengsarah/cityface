(function (window, $) {
    var settings = {
        userId: '',
        creator: ''
    };

    // 初始化
    function initConfig() {
        $('[data-role="radio"]').checkboxradio();
        $('[data-role="radio-button"]').checkboxradio({
            icon: false
        });
        $('[data-role="checkbox"]').checkboxradio();

        createAttachArchivingList($('#attachArchivingTable'), $('#attachArchivingPagination'), true, 1, 13);
        // 设置table的显示区域高度
        var searchHeight = $('#attachArchiving .manages-search-style').outerHeight();
        var viewHeight = $('#attachArchiving').height();
        $('#attachArchiving .manages-card-content').css('max-height', viewHeight - searchHeight);
    };
    initConfig();

    /**
     * 配置列表生成
     * @param {*} $table 表格容器
     * @param {*} $pagination 表格分页容器
     * @param {*} first 是否初次加载
     * @param {*} page 当前页
     * @param {*} number 每页显示数据个数
     */
    function createAttachArchivingList($table, $pagination, first, page, number) {
        var $tbody = $table.find('tbody');
        if (first) {
            $tbody.html('<tr><td colspan="9" class="text-center">No matching records found</td></tr>');
            $pagination.html('');
        }
        showLoading($table);
        var port = 'v3/attachArchiving/getAttachArchiving',
            portData = {
                "userId": settings.userId || '',
                "creator": settings.creator || '',
                "page": page ? page : 1,
                "size": number ? number : 13,
            },
            successFunc = function (data) {
                hideLoading($table);
                if (data.code === '200') {
                    var result = data.data.list;
                    $table.data({
                        'result': result
                    });
                    if (result && result.length > 0) {
                        $tbody.empty();
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].url && result[i].url.indexOf('.pdf') > -1) {
                                var imgHtml = `<img class="table-img img-pdf" src="./assets/images/managers/ic_pdf.png" alt="" pdfUrl="${result[i].url}">`;
                            } else {
                                var imgHtml = `<img class="table-img" src="${result[i].url}" alt="">`;
                            }
                            var html = '';
                            html = `<tr data-index="${i}" class="detail-row">
                                        <td>${imgHtml}</td>
                                        <td title="${result[i].userName || '--'}">${result[i].userName || '--'}</td>
                                        <td title="${result[i].userId || '--'}">${result[i].userId || '--'}</td>
                                        <td title="${result[i].creator || '--'}">${result[i].creator || '--'}</td>
                                        <td title="${result[i].creatorName || '--'}">${result[i].creatorName || '--'}</td>
                                        <td title="${result[i].createTime || '--'}">${result[i].createTime || '--'}</td>
                                        <td title="${result[i].comments || '--'}">${result[i].comments || '--'}</td>
                                    </tr>`
                            $tbody.append(html);
                            $tbody.find("tr").eq(i).data({
                                'allData': result[i]
                            });
                        }

                        if (data.data.total > Number(portData.size) && first) {
                            var pageSizeOpt = [{
                                value: 13,
                                text: '13/页',
                                selected: true
                            }, {
                                value: 15,
                                text: '15/页',
                            }];
                            var eventCallBack = function (currPage, pageSize) {
                                createAttachArchivingList($table, $pagination, false, currPage, pageSize);
                            };
                            setPageParams($pagination, data.data.total, data.data.totalPage, eventCallBack, true, pageSizeOpt);
                        }
                    } else {
                        $tbody.html('<tr><td colspan="9" class="text-center">No matching records found</td></tr>');
                    }
                } else {
                    $tbody.html('<tr><td colspan="9" class="text-center">No matching records found</td></tr>');
                }
            };
        loadData(port, true, portData, successFunc);
    };

    // 搜索按钮点击事件
    $("#attachSearchBtn").on("click", function () {
        settings.userId = $.trim($("#attachUserId").val());
        settings.creator = $("#attachCreator").val();

        createAttachArchivingList($('#attachArchivingTable'), $('#attachArchivingPagination'), true, 1, 13);
    });

    //列表图片点击事件
    $("#attachArchivingTable").on("click", ".table-img", function () {
        if ($(this).hasClass("img-pdf")) {
            $("#attachArchivingImgModal").find(".modal-body").html(`<iframe class="map-iframe" width="100%" height="100%" style="height:40rem; width: 100%;"
            src="${$(this).attr("pdfUrl")}"></iframe>`);
        } else {
            $("#attachArchivingImgModal").find(".modal-body").html(`<img src="${$(this).attr("src")}" style="width:100%">`);
        }
        $("#attachArchivingImgModal").modal("show");
    });

    //新增材料信息
    $("#attachAddBtn").on("click", function () {
        $("#uploadResultArchiving").find(".aui-icon-not-through").click();
        $("#annex_result").find(".aui-icon-not-through").click();
        $("#attachArchivingRadio1").click();
        $("#attachArchivingAdd_reason").val("");
        $('#attachArchivingAdd_assistant').val('');
        $('#attachArchivingAdd_assistant').attr('title', '');
        $('#attachArchivingAdd_assistant').data({
            'saveVal': [],
            'noticeUserList': [],
            'userIdArr': []
        })
        $("#attachArchivingAddModal").modal("show");
    });

    //关联用户切换
    $('#attachArchivingRadio1').on('click', function () {
        $('#attachArchivingPeroson_annex').addClass('hide');
        $('#attachArchivingPeroson_chose').removeClass('hide');
        $('#attachArchivingPeroson_chose').parent().find('.text-danger.tip').addClass('hide');
    });

    // 关联用户切换
    $('#attachArchivingRadio2').on('click', function () {
        $('#attachArchivingPeroson_chose').addClass('hide');
        $('#attachArchivingPeroson_annex').removeClass('hide');
        $('#attachArchivingPeroson_chose').parent().find('.text-danger.tip').addClass('hide');
    });

    // Excel关联人上传附件
    $("#attachArchivingPeroson_annex").on('click', 'button', function () {
        $('#uploadAttachArchivingAddPerson').click();
    });

    // Excel 判断是否上传了文件,并且对上传的文件进行格式的验证
    $('#uploadAttachArchivingAddPerson').on('change', function () {
        var that = this,
            fileType = '',
            fileNameArr = that.value.split('\\'), // 文件名路径数组
            fileSize = that.files[0].size,
            fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
            fileNameTypeArr = fileName.split('.'),
            fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase(),
            typeArr = ['xls', 'xlsx'];

        $('#uploadWarningArchivingPerson').addClass('hide');
        if (typeArr.indexOf(fileType) < 0) {
            $('#attachArchivingPeroson_chose').parent().find('.text-danger.tip').removeClass('hide').text('上传文件格式不正确,请上传Excel文件');
            that.value = '';
            return;
        }

        // 判断文件大小是否超过100M 
        if (fileSize > 100 * 1024 * 1024) {
            $('#attachArchivingPeroson_chose').parent().find('.text-danger.tip').removeClass('hide').text('上传文件过大,请上传不大于100M的文件');
            that.value = '';
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            $('#annex_upload').addClass('hide');
            $('#annex_result').removeClass('hide');

            // 将文件名字写出
            $('#annex_result').find('.result-name').text(fileName);
        }
        reader.readAsDataURL(this.files[0]);
    });

    // Excel关联人点击文件旁 删除按钮事件
    $('#annex_result').find('i').on('click', function () {
        $('#annex_upload').removeClass('hide');
        $('#annex_result').addClass('hide');
        $('#uploadAttachArchivingAddPerson')[0].value = '';
    });

    //导入文档下载
    $("#mouldPersonDownload").on("click", function () {
        var post_url = encodeURI(serviceUrl + "/v3/attachArchiving/download?name=" + encodeURI(encodeURI(decodeURIComponent('导入模板', true))) + "&url=http://190.13.37.6:10085/production/lawFile/202004/08/2020040819246789.doc");
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    // 关联用户警号 输入框点击事件 调用树组件
    $('#attachArchivingAdd_assistant').orgTree({
        all: true, //人物组织都开启
        area: ['620px', '542px'], //弹窗框宽高
        search: true, // 搜索事件不在orgTree
        newBk: true,
        noMap: true,
        noTree: true,
        ajaxFilter: false,
        node: 'attachArchivingAdd_assistant'
    });

    // 关联用户警号 删除按钮事件
    $('#attachArchivingAdd_assistant').siblings().on('click', function () {
        if ($('#attachArchivingAdd_assistant').attr('disabled') == 'disabled') {
            return
        }
        $('#attachArchivingAdd_assistant').val('');
        $('#attachArchivingAdd_assistant').attr('title', '');
        $('#attachArchivingAdd_assistant').data({
            'saveVal': [],
            'noticeUserList': [],
            'userIdArr': []
        })
    });

    // 关联用户警号 点击事件
    $('#attachArchivingAdd_assistant').on('click', function () {
        selectPersonCommon($(this), false);
    })

    //专项工作说明文档下载
    $("#earmarkTipArchivingDownload").on("click", function () {
        var post_url = encodeURI(serviceUrl + "/v2/file/downloadByHttpUrl?name=" + encodeURI(encodeURI(decodeURIComponent('证明材料模板', true))) + "&url=http://190.13.37.6:10085/production/lawFile/202004/08/2020040819246789.doc");
        if ($("#IframeReportImg").length === 0) {
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
        }
        $('#IframeReportImg').attr("src", post_url);
    });

    //证明材料点击事件
    $('#uploadResultArchiving').on('click', 'a.docUrl, img.table-img', function () {
        if ($(this).text() !== '暂无') {
            var url = $(this).attr("url") ? $(this).attr("url") : $(this).attr("src");
            var post_url = serviceUrl + '/v2/file/downloadByHttpUrl?url=' + url;
            if ($("#IframeReportImg").length === 0) {
                $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" width="0" height="0" src=""></iframe>').appendTo("body");
            }
            $('#IframeReportImg').attr("src", post_url);
        }
    })

    // 证明材料上传附件
    $("#attachArchivingAdd_annex").on('click', 'button', function () {
        $('#uploadFileAttachArchivingAdd').click();
    });

    // 相关文书 点击文件旁 删除按钮事件
    $('#uploadResultArchiving').find('i').on('click', function () {
        $('#attachArchivingAdd_annex').removeClass('hide');
        $('#uploadResultArchiving').addClass('hide');
        $('#uploadResultArchiving').fadeOut(300);
        $('#uploadResultArchiving').data({
            docUrl: '',
            upload: false
        });
        $('#uploadFileAttachArchivingAdd')[0].value = '';
    });

    // 相关文书 判断是否上传了文件,并且对上传的文件进行格式的验证
    $('#uploadFileAttachArchivingAdd').on('change', function () {
        var that = this,
            fileType = '',
            fileNameArr = that.value.split('\\'), // 文件名路径数组
            fileSize = that.files[0].size,
            fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
            fileNameTypeArr = fileName.split('.'),
            fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase(),
            typeArr = ['bmp', 'jpg', 'jpeg', 'png', 'dib', 'webp', 'svgz', 'gif', 'ico', 'svg', 'tif', 'xbm', 'jfif', 'pjpeg', 'pjp', 'tiff', 'pdf'];

        $('#uploadWarningArchiving').addClass('hide');
        if (typeArr.indexOf(fileType) < 0) {
            $('#uploadWarningArchiving').closest('.control-form').find('.text-danger').addClass('hide');
            $('#uploadWarningArchiving').removeClass('hide').text('上传文件格式不正确,请上传图片或pdf文档');
            that.value = '';
            return;
        }

        // 判断文件大小是否超过100M 
        if (fileSize > 100 * 1024 * 1024) {
            $('#uploadWarningArchiving').closest('.control-form').find('.text-danger').addClass('hide');
            $('#uploadWarningArchiving').removeClass('hide').text('上传文件过大,请上传不大于100M的文件');
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
            uploadFormData.append('file', wordFile);
            xhr.send(uploadFormData);
            showLoading($('#attachArchivingAdd_annex'));
            xhr.onload = function (res) { // word，pdf文件
                var data = JSON.parse(res.currentTarget.response);
                hideLoading($('#attachArchivingAdd_annex'));
                if (data.code === '200') {
                    $('#uploadResultArchiving').data('upload', true);
                    url = data.url; // 上传的文件http路径
                    $('#uploadResultArchiving').data({
                        docUrl: url,
                        filename: data.fileName,
                    });

                    $('#attachArchivingAdd_annex').addClass('hide');
                    $('#uploadResultArchiving').removeClass('hide');

                    // 将文件名字写出
                    $('#uploadResultArchiving').fadeIn(300);
                    $('#uploadResultArchiving').find('.result-name').text(fileName);

                    //上传成功自动选中动态
                    // if (!$("#useCondition2").prev().hasClass("ui-checkboxradio-checked")) {
                    //     $("#useCondition2").prev().click();
                    // }
                } else {
                    $('#uploadResultArchiving').data('upload', false);
                    warningTip.say(data.message);
                }
            }
        }
        reader.readAsDataURL(this.files[0]);
    });

    //新增材料信息确认按钮点击事件
    $("#attachArchivingAddSure").on("click", function () {
        var comments = $.trim($("#attachArchivingAdd_reason").val()), //详情说明
            userListStr = $.trim($("#attachArchivingAdd_assistant").data("noticeUserList")), //关联用户
            userList = userListStr.split(","),
            url = $("#uploadResultArchiving").data("docUrl") ? $("#uploadResultArchiving").data("docUrl") : '',
            MultipartFile = new FormData($('#formAttachArchivingAddPerson')[0]).get('excelFile'),
            excelFile = MultipartFile.name,
            flag = true,
            dataApply = {
                comments,
                MultipartFile,
                userList,
                url
            };

        if (dataApply.url == '' && $("#attachArchivingRadio1").hasClass("ui-checkboxradio-checked")) {
            $("#attachArchivingPeroson_chose").closest(".form-group").find(".text-danger.tip").removeClass("hide").text("请选择关联用户");
            flag = false;
        }
        if (dataApply.excelFile == '' && $("#attachArchivingRadio2").hasClass("ui-checkboxradio-checked")) {
            $("#attachArchivingPeroson_chose").closest(".form-group").find(".text-danger.tip").removeClass("hide").text("请上传关联用户Excel");
            flag = false;
        }
        if (!dataApply.userList.length) {
            $("#attachArchivingAdd_assistant").closest(".form-group").find(".text-danger.tip").removeClass("hide");
            flag = false;
        }
        if (dataApply.comments == '') {
            $("#attachArchivingAdd_reason").closest(".form-group").find(".text-danger.tip").removeClass("hide");
            flag = false;
        }
        if (flag) {
            // if ($("#attachArchivingRadio1").hasClass("ui-checkboxradio-checked")) {
            //     var portUrl = 'v3/attachArchiving/addAttachArchiving';
            //     var getUrlSuccessFunc = function (data) {
            //         if (data.code === '200') {
            //             $("#attachArchivingAddModal").modal("hide");
            //             createAttachArchivingList($('#attachArchivingTable'), $('#attachArchivingPagination'), true, 1, 13);
            //             warningTip.say("新增证明材料成功", 1);
            //         } else {
            //             warningTip.say(data.message);
            //         }
            //     }
            //     loadData(portUrl, true, dataApply, getUrlSuccessFunc);
            // } else {
            // 进行文件的上传
            var formFileData = new FormData($('#uploadAttachArchivingAddPerson')[0]),
                uploadFormData = new FormData(),
                xhr = new XMLHttpRequest(),
                submitURL = '/v3/attachArchiving/addAttachArchiving',
                token = $.cookie('xh_token'),
                { comments, url, MultipartFile, userList } = dataApply;
            xhr.open('post', serviceUrl + submitURL);
            uploadFormData.append('token', token);
            uploadFormData.append('comments', comments);
            uploadFormData.append('url', url);
            if ($("#attachArchivingRadio1").hasClass("ui-checkboxradio-checked")) {
                uploadFormData.append('userList', userList);
            } else {
                uploadFormData.append('file', MultipartFile);
            }

            xhr.setRequestHeader('token', token);
            xhr.send(uploadFormData);

            xhr.onload = function (res) {
                var response = JSON.parse(res.currentTarget.response);
                if (response.code === '200') {
                    $("#attachArchivingAddModal").modal("hide");
                    createAttachArchivingList($('#attachArchivingTable'), $('#attachArchivingPagination'), true, 1, 13);
                    warningTip.say("新增证明材料成功", 1);
                } else {
                    warningTip.say(response.message);
                }
            }
            // }
        }
    });

    showMiddleImg($('#attachArchivingTable'), $('#attachArchiving'), '.table-img'); //hover 显示中图
})(window, window.jQuery)