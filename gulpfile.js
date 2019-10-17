const gulp = require('./node_modules/gulp');
const { fork } = require('child_process');

gulp.task('tsc', (cb) => {
    let cmd = ["-b","src/samples/tsconfig.json"];
    let process = fork("./node_modules/typescript/lib/tsc.js",cmd,{
        silent:true
    });

    process.stdout.on('data', (data) => {
        console.log(`${data}`);
    });
      
    process.stderr.on('data', (data) => {
        console.log(`stderr: \n${data}`);
    });
    
    process.on('close', (code) => {
        console.log(`tsc complie exit：${code}`);
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

//gulp.task('LayaAirBuild', gulp.series('tsc', 'CopyShaderFile'));

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
