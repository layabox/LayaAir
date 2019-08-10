//引用插件模块
let path = require('path');
const gulp = require('gulp');
const bundleLib = require('./src/buildtools/bundleLib');

// 在 shell 中执行一个命令
var exec = require('child_process').exec;
gulp.task('tsc', () => {
    // return exec(path.join(__dirname,'node_modules/.bin/tsc.cmd -b src/samples/tsconfig.json'), function() {
    // });
    return exec("tsc -b src/samples/tsconfig.json", function () {
    });
});

gulp.task('CopyNoneTSFile', ()=>{
    return gulp.src([
        'src/**/*.vs',
        'src/**/*.fs',
        'src/**/*.glsl'], { base: "src" })
        .pipe(gulp.dest('bin/tsc'));
});


gulp.task('buildCore', async ()=>{
    await bundleLib([
        './src/layaAir/Config.ts',
        './src/layaAir/laya/Const.ts',
        './src/layaAir/ILaya.ts',
        './src/layaAir/Laya.ts',
        './src/layaAir/laya/components/**/*.*',
        './src/layaAir/laya/display/**/*.*',
        './src/layaAir/laya/events/**/*.*',
        './src/layaAir/laya/filters/**/*.*', 
        './src/layaAir/laya/layagl/**/*.*',
        './src/layaAir/laya/maths/**/*.*',
        './src/layaAir/laya/media/**/*.*',
        './src/layaAir/laya/net/**/*.*',
        './src/layaAir/laya/renders/**/*.*',
        './src/layaAir/laya/resource/**/*.*',
        './src/layaAir/laya/system/**/*.*',
        './src/layaAir/laya/utils/**/*.*',
        './src/layaAir/laya/webgl/**/*.*',
        './src/layaAir/laya/effect/**/*.*'
        ],
        "./src/layaAir/tsconfig.json",
        './build/js/libs/laya.core.js',
        'window.Laya=window.Laya||{};',
        'exports.static=_static;'
        )
    });

gulp.task('buildUI',async ()=>{
    await bundleLib([
        './src/layaAir/laya/ui/**/*.*',
        './src/layaAir/UIConfig.ts',
        ],
        "./src/layaAir/tsconfig.json",
        './build/js/libs/laya.ui.js',
        '',
        ''
    );    
});

//gulp.task('BuildLayaAir', gulp.series('tsc', 'CopyNoneTSFile'));
