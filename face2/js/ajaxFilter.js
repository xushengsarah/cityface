(function ($) {
    var pendingRequests = {};
    $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        var key = generatePendingRequestKey(options),
            ajaxFilter;
        if (options.data && options.type == 'POST') {
            var ajaxFilter = JSON.parse(options.data).ajaxFilter;
        }
        if (ajaxFilter) {
            key = key + ajaxFilter;
        }

        if (!pendingRequests[key]) {
            pendingRequests[key] = jqXHR;
        } else {
            if (key.indexOf("v2/faceDt/peopleSearch") > -1 || key.indexOf("v2/faceRecog/face1VN") > -1 || key.indexOf("v2/bkAlarm/alarmsByPersonId") > -1 || key.indexOf("v3/distributeManager/distributeTaskList") > -1) {
                pendingRequests[key] = null;
                return;
            }
            jqXHR.abort();
        }

        var complete = options.complete;
        options.complete = function (jqXHR, textStatus) {
            pendingRequests[key] = null;
            if ($.isFunction(complete)) {
                complete.apply(this, arguments);
            }
        }
    });

    function generatePendingRequestKey(opts) {
        var url = opts.url,
            type = opts.type,
            data = opts.data,
            str = url + type;
        if (data) {
            str += data;
        }
        return str;
    }

})(window.jQuery);