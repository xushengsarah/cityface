
(function (window, $) {
    $("#userFilesSearch").on("click",function(){
        var $filesDetailPage = $('#filesDetailPage'),
        $filesIndexPage = $('#content-box');

        $filesDetailPage.removeClass('display-none');
        $filesIndexPage.addClass('display-none');

        if (!$filesDetailPage.data('hasInitDetailPage')) {
            var url = "./facePlatform/files-detail.html?dynamic=" + window.Global.dynamic;
            loadPage($filesDetailPage, url);
            $filesDetailPage.data('hasInitDetailPage', true);
        }
    });
})(window, window.jQuery)