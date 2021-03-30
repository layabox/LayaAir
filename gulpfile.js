const gulp = require('gulp');
const { exec } = require('child_process');
const path = require("path");
gulp.task('tsc', (cb) => {
    let args = ["-b","src/samples/tsconfig.json"];
    let cmddir = path.join(__dirname,"./node_modules/.bin/tsc");
    let cmd = `${cmddir} ${args[0]} ${args[1]}`
    exec(cmd,(err,stdout,stderr)=>{
        if(err){
            console.log(err,'\n',stdout,'\n',stderr);
        }
        cb();
    });
});

gulp.task('LayaAirShaderCopy', () => {
    return gulp.src([
        'src/**/*.vs',
        'src/**/*.fs',
        'src/**/*.glsl'], { base: "src" })
        .pipe(gulp.dest('bin/tsc'));
});

gulp.task('LayaAirBuild', gulp.series('tsc', 'LayaAirShaderCopy'));

//let path = require('path');
//const bundleLib = require('./src/buildtools/bundleLib');

// gulp.task('buildCore', async ()=>{
//     await bundleLib([
//         './src/layaAir/Config.ts',
//         './src/layaAir/laya/Const.ts',
//         './src/layaAir/ILaya.ts',
//         './src/layaAir/Laya.ts',
//         './src/layaAir/laya/components/**/*.*',
//         './src/layaAir/laya/display/**/*.*',
//         './src/layaAir/laya/events/**/*.*',
//         './src/layaAir/laya/filters/**/*.*', 
//         './src/layaAir/laya/layagl/**/*.*',
//         './src/layaAir/laya/maths/**/*.*',
//         './src/layaAir/laya/media/**/*.*',
//         './src/layaAir/laya/net/**/*.*',
//         './src/layaAir/laya/renders/**/*.*',
//         './src/layaAir/laya/resource/**/*.*',
//         './src/layaAir/laya/system/**/*.*',
//         './src/layaAir/laya/utils/**/*.*',
//         './src/layaAir/laya/webgl/**/*.*',
//         './src/layaAir/laya/effect/**/*.*'
//         ],
//         "./src/layaAir/tsconfig.json",
//         './build/js/libs/laya.core.js',
//         'window.Laya=window.Laya||{};',
//         'exports.static=_static;'
//         )
//     });

// gulp.task('buildUI',async ()=>{
//     await bundleLib([
//         './src/layaAir/laya/ui/**/*.*',
//         './src/layaAir/UIConfig.ts',
//         ],
//         "./src/layaAir/tsconfig.json",
//         './build/js/libs/laya.ui.js',
//         '',
//         ''
//     );    
// });
