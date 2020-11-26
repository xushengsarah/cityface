(function (window, $) {
    var fileName = '';  //批量比对文件名
    // AI 工具卡片点击事件
    $('#toolCardList').on('click', '.tool-card', function () {
        var lc = $(this).attr('lc');
        if (!lc) {
            return;
        } else {
            var $toolPage = $('#' + lc);
            var url = "./facePlatform/" + lc + ".html?dynamic=" + window.Global.dynamic;
            if ((lc === 'peerAnalysis' && $('#peerAnalysis')[0].childElementCount != 0) || (lc === 'batch-comparison' && $('#batch-comparison')[0].childElementCount != 0) || (lc === 'cross-comparison' && $('#cross-comparison')[0].childElementCount != 0)) {
                $('#contentPageTool').addClass('hide');
                $toolPage.removeClass('hide');
                $toolPage.addClass('act');
                $('#toolPage').removeClass('hide');
            } else {
                $('#contentPageTool').addClass('hide');
                $toolPage.removeClass('hide');
                $toolPage.addClass('act');
                $('#toolPage').removeClass('hide');
                loadPage($toolPage, url);
            }
        }
    });
    $('#toolPage').on('click', '.tool-back', function () {
        var $liNumClass = $('#toolPage').find('.toolPage-save-item.act');
        $liNumClass.removeClass('act').addClass('hide');
        $('#contentPageTool').removeClass('hide');
        $('#toolPage').addClass('hide');
    });
})(window, window.jQuery);