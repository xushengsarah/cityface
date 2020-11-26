module.exports = {
    //自动前缀兼容浏览器版本列表
    prefixerVersion: ["Android 4.0", "iOS 9.0", "Chrome > 26", "ff > 20", "ie >= 8"],

    //精灵图路径配置
    // spriteSmithConfig: [{
    //     imgName: '../images/icon.png',
    //     cssName: 'icon.css',
    //     padding: 2
    // }],
    sassdocConfig: {
        dest: 'doc/sassdoc',
        groups: {
            undefined: "默认",
            colors: "颜色",
            utils: "Base",
            ucd: "SmartUe",
            charts: "图表",
            widgets: "组件"
        },
        package: {
            title: "云服务 scss文档",
            homepage: "../../index.html"
        }
    },
    //构建路径配置
    path: {
        // sprite: {
        //     src: ['assets/images/icons/*.png'],
        //     dest: 'assets/css/'
        // },

        sass_base: {
            src: ['scss/vendor-reset.scss', 'scss/pages.scss', 'scss/star-fire.scss'],
            dest: 'assets/css'
        },

        sass_watching: ['scss/*.scss', 'scss/*/*.scss', 'scss/*/*/*.scss'],

        clean: ['dist', 'js/ucd.min.js'],

        build: {
            src: [
                '*.html',
                '*/*', '*/*/*', '*/*/*', '*/*/*/*', '*/*/*/*/*', '*/*/*/*/*/*',
                '!sass/*', '!sass/*/*', '!sass/*/*/*', '!sass/*/*/*/*', '!sass/*/*/*/*/*',
                '!node_modules/*', '!node_modules/*/*', '!node_modules/*/*/*', '!node_modules/*/*/*/*', '!node_modules/*/*/*/*/*',
                '!js/ucd', '!js/ucd/*',
                '!resources/default/images/icon', '!resources/default/images/icon/*',
                '!resources/default/css/icon.css'
            ],
            dest: 'dist'
        }
    }
};