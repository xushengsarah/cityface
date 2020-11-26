var configs = [
    require('./gulp.config.js')
];
var
    gulp = require('gulp'),
    //plugins
    sass = require('gulp-sass'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    notify = require('gulp-notify'),
    spriter = require('gulp-css-spriter'),
    spritesmith = require('gulp.spritesmith'),
    clean = require('gulp-clean'),
    sassdoc = require('sassdoc');

//考虑多个项目同时监听
configs.forEach(function(config, i) {
    var
        prefixerVersion = config.prefixerVersion,
        PATH = config.path;

    var cleans = configs.map(function(val, index) {
        return `clean${index}`;
    });

    if (i === configs.length - 1) {
        gulp.task('default', cleans, function() {
            for (let j = 0; j < configs.length; j++)
                gulp.start(`watch${j}`);
        });
    }


    // gulp.task(`sprite${i}`, function() {
    //     // return config.spriteSmithConfig.forEach((v, subi) => {
    //     //   var spriteData = gulp.src(PATH.sprite.src[subi]).pipe(spritesmith(v));
    //     //   //if (subi === config.spriteSmithConfig.length)
    //     //
    //     //   return spriteData.pipe(gulp.dest(PATH.sprite.dest));
    //     // });

    //     var spriteData = gulp.src(PATH.sprite.src[0]).pipe(spritesmith(config.spriteSmithConfig[0]));

    //     return spriteData.pipe(gulp.dest(PATH.sprite.dest));
    // });

    gulp.task(`sassBase${i}`, function() {
        //scss base
        return gulp.src(PATH.sass_base.src)
            .pipe(sourcemaps.init({ debug: true }))
            .pipe(sass({
                outputStyle: 'expanded'
            }).on('error', sass.logError)) //nested, expanded, compact, compressed

        .pipe(autoprefixer({
                browsers: prefixerVersion,
                cascade: true, //是否美化属性值 默认：true
                remove: false //是否去掉不必要的前缀 默认：true
            }))
            //.pipe(rename('base.css'))
            .pipe(gulp.dest(PATH.sass_base.dest))

        .pipe(minifycss())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(sourcemaps.write('.'))

        .pipe(gulp.dest(PATH.sass_base.dest))
            .pipe(notify({
                message: 'base css task ok'
            }));
    });

    gulp.task(`clean${i}`, function() {
        return gulp.src(PATH.clean).pipe(clean());
    });

    gulp.task(`watch${i}`, [`sassBase${i}`], function() {
        var sassBaseWatcher = gulp.watch(PATH.sass_base.src.concat(PATH.sass_watching), [`sassBase${i}`]);
        // var spriteWatcher = gulp.watch(PATH.sprite.src, [`sassBase${i}`]);
    });

    gulp.task(`build${i === 0 ? '' : i + 1}`, [`clean${i}`, `sassBase${i}`], function() {
        return gulp.src(PATH.build.src, { base: '.' })
            .pipe(gulp.dest(PATH.build.dest));
    });

});