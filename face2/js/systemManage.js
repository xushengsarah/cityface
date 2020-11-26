(function (window, $) {
    $('[data-role="radio"]').checkboxradio();
    $('[data-role="radio-button"]').checkboxradio({
        icon: false
    });

    // 系统管理 二级菜单 树结构
    function loadzTreeData($container) {
        var port = 'v2/user/getUserModuleAuthorty',
            _data = {
                moduleCode: $('#content-box').data().modulecode
            },
            successFunc = function (data) {
                // 结束loading加载动画
                hideLoading($container);
                if (data.code === '200') {
                    loadzTree(data.data);
                    loadPage($('#sysManageContentPage'), data.data[0].url);
                }
            };
        loadData(port, true, _data, successFunc, undefined, 'GET');
    }

    function loadzTree(data) {
        var setting = {
            view: {
                selectedMulti: false,
                addDiyDom: function (treeId, treeNode) {
                    $('#' + treeNode.tId).attr("moduleCode", treeNode.modulecode);
                }
            },
            callback: {
                onClick: function (event, treeId, treeNode) {
                    loadPage($('#sysManageContentPage'), treeNode.moduleurl);
                    // 二级菜单 选中样式调整
                    var aObj = $('#' + treeNode.tId); // 选中的人员库li节点
                    aObj.addClass('active').siblings().removeClass('active'); // 自身添加active, 兄弟节点移除active
                }
            }
        },
            zTreeNodes = []; // zTree 的节点数据集合
        // 循环人员库数据
        for (var i = 0; i < data.length; i++) {
            var zTreeObj = {};
            // 树组件一级菜单名称
            zTreeObj.name = data[i].moduleName;
            zTreeObj.modulecode = data[i].moduleCode;
            zTreeObj.moduleurl = data[i].url;
            // 默认展开第一个菜单
            if (i == 0) {
                zTreeObj.open = true;
            }
            zTreeNodes.push(zTreeObj);
        }
        // 初始化zTree树组件
        $(document).ready(function () {
            $.fn.zTree.init($('#sys-manage-tree-list'), setting, zTreeNodes);
            var treeObj = $.fn.zTree.getZTreeObj("sys-manage-tree-list");
            var nodes = treeObj.getNodes();
            treeObj.selectNode(nodes[0]); //系统管理树状结构默认第一个选中
            $('#sys-manage-tree-list').find('li').first().addClass('active'); // 系统管理树状结构默认第一个选中的样式
        })
    }
    loadzTreeData($("#sysManageContentPage"));
})(window, window.jQuery)