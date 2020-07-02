
const typescript = require('rollup-plugin-typescript2');
const glsl = require('rollup-plugin-glsl');
const path = require('path');
const fs = require('fs');
var matched = require('matched');
const production = !process.env.ROLLUP_WATCH;
const gulp = require('gulp');
const rollup = require('rollup');
//处理文件流使用的插件
var through = require('through2');
//合并文件
var concat = require('gulp-concat'),pump = require('pump');
const uglify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');


//编译新的库文件只需要在packsDef中配置一下新的库就可以了
var packsDef = [
    {
        'libName': "core",
        'input': [
            './layaAir/Config.ts',
            './layaAir/laya/Const.ts',
            './layaAir/ILaya.ts',
            './layaAir/Laya.ts',
            './layaAir/laya/components/**/*.*',
            './layaAir/laya/display/**/*.*',
            './layaAir/laya/events/**/*.*',
            './layaAir/laya/filters/**/*.*',
            './layaAir/laya/layagl/**/*.*',
            './layaAir/laya/maths/**/*.*',
            './layaAir/laya/media/**/*.*',
            './layaAir/laya/net/**/*.*',
            './layaAir/laya/renders/**/*.*',
            './layaAir/laya/resource/**/*.*',
            './layaAir/laya/system/**/*.*',
            './layaAir/laya/utils/**/*.*',
            './layaAir/laya/webgl/**/*.*',
            './layaAir/laya/effect/**/*.*'
        ],
        'out': '../build/js/libs/laya.core.js'
    },
    {
        'libName': "d3",
        'input': [
            './layaAir/laya/d3/animation/**/*.*',
            './layaAir/laya/d3/component/**/*.*',
            './layaAir/laya/d3/core/**/*.*',
            './layaAir/laya/d3/graphics/**/*.*',
            './layaAir/laya/d3/loaders/**/*.*',
            './layaAir/laya/d3/math/**/*.*',
            './layaAir/laya/d3/physics/**/*.*',
            './layaAir/laya/d3/shader/**/*.*',
            './layaAir/laya/d3/shadowMap/**/*.*',
            './layaAir/laya/d3/text/**/*.*',
            './layaAir/laya/d3/utils/**/*.*',
            './layaAir/laya/d3/CastShadowList.ts',
            './layaAir/laya/d3/Input3D.ts',
            './layaAir/laya/d3/MouseTouch.ts',
            './layaAir/laya/d3/Touch.ts',
            './layaAir/laya/d3/resource/**/*.*',
            './layaAir/Config3D.ts',
            './layaAir/ILaya3D.ts',
            './layaAir/Laya3D.ts'
        ],
        'out': '../build/js/libs/laya.d3.js'
    },
    {
        'libName': "cannonPhysics",
        'input': [
            './layaAir/laya/d3/physicsCannon/**/*.*',
        ],
        'out': '../build/js/libs/laya.cannonPhysics.js'
    },

    {
        'libName': 'device',
        'input': [
            './layaAir/laya/device/**/*.*'
        ],
        'out': '../build/js/libs/laya.device.js'
    },
    {
        'libName': 'tiledmap',
        'input': [
            './layaAir/laya/map/**/*.*'
        ],
        'out': '../build/js/libs/laya.tiledmap.js'
    },
    {
        'libName': 'html',
        'input': [
            './layaAir/laya/html/**/*.*'
        ],
        'out': '../build/js/libs/laya.html.js'
    },
    {
        'libName': 'particle',
        'input': [
            './layaAir/laya/particle/**/*.*'
        ],
        'out': '../build/js/libs/laya.particle.js'
    },

    {
        'libName': 'physics',
        'input': [
            './layaAir/laya/physics/**/*.*'
        ],
        'out': '../build/js/libs/laya.physics.js'
    },
    {
        'libName': 'ui',
        'input': [
            './layaAir/laya/ui/**/*.*',
            './layaAir/UIConfig.ts',
        ],
        'out': '../build/js/libs/laya.ui.js'
    },
    {
        'libName': 'ani',
        'input': [
            './layaAir/laya/ani/**/*.*'
        ],
        'out': '../build/js/libs/laya.ani.js'
    },//debugtool
    {
        'libName': 'debugtool',
        'input': [
            './extensions/debug/**/*.*'
        ],
        'out': '../build/js/libs/laya.debugtool.js'
    }
];

var curPackFiles = null;  //当前包的所有的文件
var mentry = 'multientry:entry-point';
function myMultiInput() {
    var include = [];
    var exclude = [];
    function configure(config) {
        if (typeof config === 'string') {
            include = [config];
        } else if (Array.isArray(config)) {
            include = config;
        } else {
            include = config.include || [];
            exclude = config.exclude || [];

            if (config.exports === false) {
                exporter = function exporter(p) {
                    if (p.substr(p.length - 3) == '.ts') {
                        p = p.substr(0, p.length - 3);
                    }
                    return `import ${JSON.stringify(p)};`;
                };
            }
        }
    }

    var exporter = function exporter(p) {
        if (p.substr(p.length - 3) == '.ts') {
            p = p.substr(0, p.length - 3);
        }
        return `export * from ${JSON.stringify(p)};`;
    };

    return (
        {
            options(options) {
                console.log('===', options.input)
                configure(options.input);
                options.input = mentry;
            },

            resolveId(id, importer) {//entry是个特殊字符串，rollup并不识别，所以假装这里解析一下
                if (id === mentry) {
                    return mentry;
                }
                if (mentry == importer)
                    return;
                var importfile = path.join(path.dirname(importer), id);
                var ext = path.extname(importfile);
                if (ext != '.ts' && ext != '.glsl' && ext != '.vs' && ext != '.ps' && ext != '.fs') {
                    importfile += '.ts';
                }
                //console.log('import ', importfile);
                if (curPackFiles.indexOf(importfile) < 0) {
                    //其他包里的文件
                    // console.log('other pack:',id,'importer=', importer);
                    return 'Laya';
                }
            },
            load(id) {
                if (id === mentry) {
                    if (!include.length) {
                        return Promise.resolve('');
                    }

                    var patterns = include.concat(exclude.map(function (pattern) {
                        return '!' + pattern;
                    }));
                    return matched.promise(patterns, { realpath: true }).then(function (paths) {
                        curPackFiles = paths;   // 记录一下所有的文件
                        paths.sort();
                        return paths.map(exporter).join('\n');
                    });
                } else {
                    //console.log('load ',id);
                }
            }
        }
    );
}

//修改引擎库
gulp.task('ModifierJs', () => {
    for (let i = 0; i < packsDef.length; ++i) {
        if (i !== packsDef.length - 1) {
            gulp.src([packsDef[i].out])
                .pipe(through.obj(function (file, encode, cb) {
                    var srcContents = file.contents.toString();
                    var destContents = srcContents.replace(/var Laya /, "window.Laya");
                    destContents = destContents.replace(/\(this.Laya = this.Laya \|\| {}, Laya\)\);/, "(window.Laya = window.Laya || {}, Laya));");
                    // 再次转为Buffer对象，并赋值给文件内容
                    file.contents = Buffer.from(destContents);
                    // 以下是例行公事
                    this.push(file)
                    cb()
                }))
                .pipe(gulp.dest('../build/js/libs/'));
        }else{
            return gulp.src([packsDef[i].out])
            .pipe(through.obj(function (file, encode, cb) {
                var srcContents = file.contents.toString();
                var destContents = srcContents.replace(/var Laya /, "window.Laya");
                destContents = destContents.replace(/\(this.Laya = this.Laya \|\| {}, Laya\)\);/, "(window.Laya = window.Laya || {}, Laya));");
                // 再次转为Buffer对象，并赋值给文件内容
                file.contents = Buffer.from(destContents);
                // 以下是例行公事
                this.push(file)
                cb()
            }))
            .pipe(gulp.dest('../build/js/libs/'));
        }
    }
});

//合并physics 和 box2d
gulp.task('ConcatBox2dPhysics', function (cb) {
    pump([
        gulp.src([
            './layaAir/jsLibs/box2d.js',
            '../build/js/libs/laya.physics.js']),
        concat('laya.physics.js'),//合并后的文件名
        gulp.dest('../build/js/libs/'),
    ], cb);
});

//拷贝引擎的第三方js库
gulp.task('CopyJSLibsToJS', () => {
    return gulp.src([
        './layaAir/jsLibs/laya.physics3D.wasm.wasm','./layaAir/jsLibs/*.js', '!./layaAir/jsLibs/box2d.js', '!./layaAir/jsLibs/laya.physics.js'])
        .pipe(gulp.dest('../build/js/libs'));
});

//拷贝js库至ts库
gulp.task('CopyJSFileToTSCompatible', () => {
    return gulp.src([
        './layaAir/jsLibs/laya.physics3D.wasm.wasm','../build/js/libs/**/*.js'])
        .pipe(gulp.dest('../build/ts/libs'));
});

//拷贝js库至as库
gulp.task('CopyJSFileToAS', () => {
    return gulp.src([
        './layaAir/jsLibs/laya.physics3D.wasm.wasm','../build/js/libs/**/*.js', '!../build/js/declare/*ts'])
        .pipe(gulp.dest('../build/as/jslibs'));
});

//拷贝引擎ts源码至ts库
gulp.task('CopyTSFileToTS', () => {
    return gulp.src([
        './layaAir/**/*.*', '!./layaAir/jsLibs/**/*.*', '!./layaAir/gulpfile.js', '!./layaAir/tsconfig.json'])
        .pipe(gulp.dest('../build/ts_new/libs'));
});

//拷贝第三方库至ts库(未来在数组中补充需要的其他第三方库)
gulp.task('CopyTSJSLibsFileToTS', () => {
    return gulp.src([
        './layaAir/jsLibs/**/*.*','../build/js/libs/laya.cannonPhysics.js'])
        .pipe(gulp.dest('../build/ts_new/jslibs'));
});


gulp.task('CopyDTS', (cb) => {
    gulp.src(['../tslibs/ts/*.*','./layaAir/glsl.d.ts'])
        .pipe(gulp.dest('../build/js/ts'))
        .pipe(gulp.dest('../build/ts/ts'))

    gulp.src(['../tslibs/nts/*.*'])
        .pipe(gulp.dest('../build/ts_new/libs'))
    setTimeout(cb, 1000);
});


//在这个任务中由于机器的配置可能会出现堆栈溢出的情况，解决方案一可以将其中的某些库移送至buildJS2编译，若buildJS2也堆栈溢出，则可以再新建一个任务buildJS3
gulp.task('buildJS', async function () {
    for (let i = 0; i < packsDef.length; ++i) {
        const subTask = await rollup.rollup({
            input: packsDef[i].input,
            output: {
                extend: true,
                globals: { 'Laya': 'Laya' }
            },
            external: ['Laya'],
            plugins: [
                myMultiInput(),
                typescript({
                    tsconfig: "./layaAir/tsconfig.json",
                    check: false,
                    tsconfigOverride: { compilerOptions: { removeComments: true } }
                }),
                glsl({
                    include: /.*(.glsl|.vs|.fs)$/,
                    sourceMap: false,
                    compress: false
                }),
            ]
        });

        if (packsDef[i].libName == "core") {
            await subTask.write({
                file: packsDef[i].out,
                format: 'iife',
                outro: 'exports.static=_static;',  //由于static是关键字，无法通过ts编译。AS需要这个函数，临时强插
                name: 'Laya',
                sourcemap: false
            });
        }
        else {
            await subTask.write({
                file: packsDef[i].out,
                format: 'iife',
                name: 'Laya',
                sourcemap: false,
                extend: true,
                globals: { 'Laya': 'Laya' }
            });

        }
    }
});

// 压缩
// 下面两个方法，最好能合并
gulp.task("compressJs", function () {
    gulp.src("../build/as/jslibs/laya.physics3D.js")
        .pipe(rename({extname: ".min.js"}))
        .pipe(gulp.dest("../build/as/jslibs/min"))
        .pipe(gulp.dest("../build/js/libs/min"))
        .pipe(gulp.dest("../build/ts/libs/min"));

    gulp.src("../build/as/jslibs/laya.physics3D.wasm.wasm")
        .pipe(gulp.dest("../build/as/jslibs/min"))
        .pipe(gulp.dest("../build/js/libs/min"))
        .pipe(gulp.dest("../build/ts/libs/min"));

    return gulp.src(["../build/as/jslibs/*.js", "!../build/as/jslibs/{laya.physics3D.js}"])
        .pipe(uglify({
            mangle: {
                keep_fnames: true
            }
        }))
        .on('error', function (err) {
            console.warn(err.toString());
        })
        .pipe(rename({extname: ".min.js"}))
        .pipe(gulp.dest("../build/as/jslibs/min"))
        .pipe(gulp.dest("../build/js/libs/min"))
        .pipe(gulp.dest("../build/ts/libs/min"));
});

gulp.task("compresstsnewJs", function () {
    gulp.src("../build/ts_new/jslibs/{laya.physics3D.js,box2d.js}")
        .pipe(rename({extname: ".min.js"}))
        .pipe(gulp.dest("../build/ts_new/jslibs/min"));

    gulp.src("../build/ts_new/jslibs/laya.physics3D.wasm.wasm")
        .pipe(gulp.dest("../build/ts_new/jslibs/min"));

    return gulp.src(["../build/ts_new/jslibs/*.js", "!../build/ts_new/jslibs/{laya.physics3D.js,box2d.js}"])
        .pipe(uglify({
            mangle: {
                keep_fnames: true
            }
        }))
        .on('error', function (err) {
            console.warn(err.toString());
        })
        .pipe(rename({extname: ".min.js"}))
        .pipe(gulp.dest("../build/ts_new/jslibs/min"));
});

gulp.task('build', gulp.series('buildJS', 'ModifierJs', 'ConcatBox2dPhysics', 'CopyJSLibsToJS', 'CopyTSFileToTS', 'CopyJSFileToAS', 'CopyTSJSLibsFileToTS', 'CopyJSFileToTSCompatible', 'CopyDTS', 'compressJs', 'compresstsnewJs'));
