(function() {
    var domain = '';
    var scriptPara = $('script').last()[0].src,
        regecp_para = /=(.*)[&]*/i;
    var SELECTOR_CODE_BOX = '.section-content',
        SELECTOR_CODE = 'pre',
        SELECTOR_CODE_BTN_TOGGLE = '.code .btn-code-toggle';
    var theme = (scriptPara.match(regecp_para) && scriptPara.match(regecp_para)[0].replace('=', '')) || 'monokai-sublime';
    var DEPENDS_LIBS = [domain + 'base-helper/highlight/styles/monokai-sublime.css', domain + "base-helper/base-helper.css", domain + "base-helper/sidebar/jumpto.css", domain + 'base-helper/highlight/highlight.pack.js', domain + "base-helper/sidebar/jquery.jumpto.js"];
    var template_code = ['<div class="code">',
        '						<button class="btn-code btn-code-toggle"> ▼ code</button>',
        '						<pre><code class="html">${code}</code></pre>',
        '				  </div>',
    ].join('');
    //file include
    $.extend({
        includePath: '',
        include: function(file) {
            var files = typeof file == "string" ? [file] : file;
            for (var i = 0; i < files.length; i++) {
                var name = files[i].replace(/^\s|\s$/g, ""),
                    att = name.split('.'),
                    ext = att[att.length - 1].toLowerCase(),
                    isCSS = ext == "css",
                    tag = isCSS ? "link" : "script",
                    attr = isCSS ? " type='text/css' rel='stylesheet' " : " type='text/javascript' ",
                    link = (isCSS ? "href" : "src") + "='" + $.includePath + name + "'";
                !$(tag + "[" + link + "]").length && $("head").prepend("<" + tag + attr + link + "></" + tag + ">");
            }
        }
    });
    var textArea = $('<textarea></textarea>');
    var encodeHtml = function(s) {
        return (typeof s != "string") ? s :
            s.replace(/"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g,
                function($0) {
                    var c = $0.charCodeAt(0),
                        r = ["&#"];
                    c = (c == 0x20) ? 0xA0 : c;
                    r.push(c);
                    r.push(";");
                    return r.join("");
                });
    };
    $.include(DEPENDS_LIBS);

    //append code
    $(SELECTOR_CODE_BOX).each(function() {
        var $this = $(this),
            codesCopy = $this.find(SELECTOR_CODE).length > 0 ? $this.find(SELECTOR_CODE).clone() : '';
        $this.find(SELECTOR_CODE).remove();
        $this.append(template_code.replace(/\$\{code\}/g, $this.html()));
        $this.find('.code').append(codesCopy).find(SELECTOR_CODE).hide();
    });
    //html code transfer
    $('code').each(function(i, block) {
        var $this = $(this);
        $this.is('[class="html"]') && $this.html(encodeHtml($this.html()));
        $('<a class="btn-code btn-copy">Copy  ' + ($this.attr('class') || '') + '</a>').appendTo($this);
    });
    textArea.appendTo('body').css({
        height: 0,
        width: 0,
        opacity: 0,
        postion: 'absolute'
    });
    window.onload = function() {
        hljs.initHighlightingOnLoad();
        $("body").jumpto({
            firstLevel: ".section-title",
            secondLevel: false,
            innerWrapper: ".section",
            offset: 400,
            animate: 800,
            navContainer: false,
            anchorTopPadding: 20,
            showTitle: "组件列表",
            closeButton: true
        });
    };
    var toggleCodeAll = "close";
    //code toggle
    $(document).on('click.helper', SELECTOR_CODE_BTN_TOGGLE, function() {
            var self = this;
            $(this).closest(SELECTOR_CODE_BOX).find(SELECTOR_CODE).toggle(300, function() {
                $(self).text() === '▲ code' ? $(self).text('▼ code') : $(self).text('▲ code');
            });
        })
        .on('click.helper', 'pre .btn-copy', function() {
            var $this = $(this);
            textArea.val($this.next('code').text()).select();
            var oldText = $this.text();
            // 执行浏览器复制命令
            document.execCommand("Copy") && $this.text('Copyed!').addClass('shadow-scale').one('webkitAnimationEnd AnimationEnd', function() {
                $this.removeClass('shadow-scale').text(oldText);
            });
        })
        .on('click.helper', '.jumpto-title', function() {
            toggleCodeAll === 'close' ? ($(SELECTOR_CODE_BOX).find(SELECTOR_CODE).slideDown(), toggleCodeAll = 'open', $(SELECTOR_CODE_BOX).find('.btn-code-toggle').text('▲ code')) :
                ($(SELECTOR_CODE_BOX).find(SELECTOR_CODE).slideUp().show(), toggleCodeAll = "close", $(SELECTOR_CODE_BOX).find('.btn-code-toggle').text('▼ code'));
        });
})();