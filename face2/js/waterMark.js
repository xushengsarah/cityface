function watermark(settings) {
    //Ĭ������
    var defaultSettings = {
        watermark_txt: "text",
        watermark_x: $(".sidebar-box").width(),//ˮӡ��ʼλ��x������
        watermark_y: 0,//ˮӡ��ʼλ��Y������
        watermark_rows: 0,//ˮӡ����
        watermark_cols: 0,//ˮӡ����
        watermark_x_space: 75,//ˮӡx����
        watermark_y_space: 75,//ˮӡy����
        watermark_color: '#aaa',//ˮӡ������ɫ
        watermark_alpha: 0.3,//ˮӡ͸����
        watermark_fontsize: '15px',//ˮӡ�����С
        watermark_font: '΢���ź�',//ˮӡ����
        watermark_width: 100,//ˮӡ���
        watermark_height: 20,//ˮӡ����
        watermark_angle: 15//ˮӡ��б����
    };
    //�����������滻Ĭ��ֵ����������jquery.extend
    if (arguments.length === 1 && typeof arguments[0] === "object") {
        var src = arguments[0] || {};
        for (key in src) {
            if (src[key] && defaultSettings[key] && src[key] === defaultSettings[key])
                continue;
            else if (src[key])
                defaultSettings[key] = src[key];
        }
    }

    var oTemp = document.createDocumentFragment();

    //��ȡҳ�������
    var page_width = Math.max(document.body.scrollWidth, document.body.clientWidth);
    var cutWidth = page_width * 0.0150;
    var page_width = page_width - cutWidth;
    //debugger;
    //��ȡҳ�����߶�
    var page_height = Math.max(document.body.scrollHeight, document.body.clientHeight);
    // var page_height = document.body.scrollHeight+document.body.scrollTop;
    //�����ˮӡ��������Ϊ0����ˮӡ�������ù��󣬳���ҳ������ȣ������¼���ˮӡ������ˮӡx����
    if (defaultSettings.watermark_cols == 0 || (parseInt(defaultSettings.watermark_x + defaultSettings.watermark_width * defaultSettings.watermark_cols + defaultSettings.watermark_x_space * (defaultSettings.watermark_cols - 1)) > page_width)) {
        defaultSettings.watermark_cols = parseInt((page_width - defaultSettings.watermark_x + defaultSettings.watermark_x_space) / (defaultSettings.watermark_width + defaultSettings.watermark_x_space));
        defaultSettings.watermark_x_space = parseInt((page_width - defaultSettings.watermark_x - defaultSettings.watermark_width * defaultSettings.watermark_cols) / (defaultSettings.watermark_cols - 1));
    }
    //�����ˮӡ��������Ϊ0����ˮӡ�������ù��󣬳���ҳ����󳤶ȣ������¼���ˮӡ������ˮӡy����
    if (defaultSettings.watermark_rows == 0 || (parseInt(defaultSettings.watermark_y + defaultSettings.watermark_height * defaultSettings.watermark_rows + defaultSettings.watermark_y_space * (defaultSettings.watermark_rows - 1)) > page_height)) {
        defaultSettings.watermark_rows = parseInt((defaultSettings.watermark_y_space + page_height - defaultSettings.watermark_y) / (defaultSettings.watermark_height + defaultSettings.watermark_y_space));
        defaultSettings.watermark_y_space = parseInt(((page_height - defaultSettings.watermark_y) - defaultSettings.watermark_height * defaultSettings.watermark_rows) / (defaultSettings.watermark_rows - 1));
    }
    var x;
    var y;
    for (var i = 0; i < defaultSettings.watermark_rows; i++) {
        y = defaultSettings.watermark_y + (defaultSettings.watermark_y_space + defaultSettings.watermark_height) * i;
        for (var j = 0; j < defaultSettings.watermark_cols; j++) {
            x = defaultSettings.watermark_x + (defaultSettings.watermark_width + defaultSettings.watermark_x_space) * j;

            var mask_div = document.createElement('div');
            mask_div.id = 'mask_div' + i + j;
            mask_div.className = 'mask_div';
            mask_div.appendChild(document.createTextNode(defaultSettings.watermark_txt));
            //����ˮӡdiv��б��ʾ
            mask_div.style.webkitTransform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
            mask_div.style.MozTransform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
            mask_div.style.msTransform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
            mask_div.style.OTransform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
            mask_div.style.transform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
            mask_div.style.visibility = "";
            mask_div.style.position = "absolute";
            mask_div.style.left = x + 'px';
            mask_div.style.top = y + 'px';
            mask_div.style.overflow = "hidden";
            mask_div.style.zIndex = "99999";
            mask_div.style.overflow = "hidden";
            mask_div.style.pointerEvents = 'none';//pointer-events:none  ��ˮӡ���ڵ�ҳ��ĵ���¼�
            //mask_div.style.border="solid #eee 1px";
            mask_div.style.opacity = defaultSettings.watermark_alpha;
            mask_div.style.fontSize = defaultSettings.watermark_fontsize;
            mask_div.style.fontFamily = defaultSettings.watermark_font;
            mask_div.style.color = defaultSettings.watermark_color;
            mask_div.style.textAlign = "center";
            mask_div.style.width = defaultSettings.watermark_width + 'px';
            mask_div.style.height = defaultSettings.watermark_height + 'px';
            mask_div.style.display = "block";
            oTemp.appendChild(mask_div);
        };
    };
    document.body.appendChild(oTemp);
}