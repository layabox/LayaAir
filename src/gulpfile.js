
const typescript =  require('rollup-plugin-typescript2');
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
var concat = require('gulp-concat'),
    pump   = require('pump');

var packsDef={
    'core':{
        'input':[
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
        'out':'../build/js/libs/laya.core.js'
    },
    'd3':{
        'input':[
            './layaAir/laya/d3/**/*.*',
            './layaAir/Config3D.ts',
            './layaAir/ILaya3D.ts',
            './layaAir/Laya3D.ts'
        ],
        'out':'../build/js/libs/laya.d3.js'
    },
    'device':{
        'input':[
            './layaAir/laya/device/**/*.*'
        ],
        'out':'../build/js/libs/laya.device.js'
    },
    'tiledmap':{
        'input':[
            './layaAir/laya/map/**/*.*'
        ],
        'out':'../build/js/libs/laya.tiledmap.js'
    },
    'html':{
        'input':[
            './layaAir/laya/html/**/*.*'
        ],
        'out':'../build/js/libs/laya.html.js' 
    },
    'particle':{
        'input':[
            './layaAir/laya/particle/**/*.*'
        ],
        'out':'../build/js/libs/laya.particle.js'
    },

    'physics':{
        'input':[
            './layaAir/laya/physics/**/*.*'
        ],
        'out':'../build/js/libs/laya.physics.js' 
    },
    'ui':{
        'input':[
            './layaAir/laya/ui/**/*.*',
            './layaAir/UIConfig.ts',
        ],
        'out':'../build/js/libs/laya.ui.js'
    },

    'ani':{
        'input':[
            './layaAir/laya/ani/**/*.*'
        ],
        'out':'../build/js/libs/laya.ani.js'
    },
    //weixin
    'wx':{
        'input':[
            './platform/wx/**/*.*'
        ],
        'out':'../build/js/libs/laya.wxmini.js'
    },
    //baidu
    'bd':{
        'input':[
            './platform/bd/**/*.*'
        ],
        'out':'../build/js/libs/laya.bdmini.js'
    },
    //xiaomi
    'mi':{
        'input':[
            './platform/mi/**/*.*'
        ],
        'out':'../build/js/libs/laya.xmmini.js'
    },
    //oppo
    'qg':{
        'input':[
            './platform/qg/**/*.*'
        ],
        'out':'../build/js/libs/laya.quickgamemini.js'
    },
    //vivo
    'vv':{
        'input':[
            './platform/vv/**/*.*'
        ],
        'out':'../build/js/libs/laya.vvmini.js'
    },


};

var curPackFiles=null;  //当前包的所有的文件
var mentry = 'multientry:entry-point';
function myMultiInput(){
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
                if(p.substr(p.length-3)=='.ts'){
                    p=p.substr(0,p.length-3);
                }
                return `import ${JSON.stringify(p)};`;
              };
            }            
        }
      }  
      
      var exporter = function exporter(p) {
        if(p.substr(p.length-3)=='.ts'){
            p=p.substr(0,p.length-3);
        }
        return `export * from ${JSON.stringify(p)};`;
      };
          
    return(
        {
            options(options){
                console.log('===', options.input)
                configure(options.input);
                options.input = mentry;
            },
            
            resolveId(id, importer) {//entry是个特殊字符串，rollup并不识别，所以假装这里解析一下
                if (id === mentry) {
                  return mentry;
                }
                if(mentry==importer)
                    return;
                var importfile= path.join(path.dirname(importer),id);
                var ext = path.extname(importfile);
                if(ext!='.ts' && ext!='.glsl' && ext!='.vs' && ext!='.ps' &&ext!='.fs'){
                    importfile+='.ts';
                }
                console.log('import ', importfile);
                if( curPackFiles.indexOf(importfile)<0){
                    //其他包里的文件
                    console.log('other pack:',id,'importer=', importer);
                    return 'Laya';
                }
              },            
            load(id){
                if (id === mentry) {
                    if (!include.length) {
                      return Promise.resolve('');
                    }
            
                    var patterns = include.concat(exclude.map(function (pattern) {
                      return '!' + pattern;
                    }));
                    return matched.promise(patterns, {realpath: true}).then(function (paths) {
                        curPackFiles = paths;   // 记录一下所有的文件
                        return paths.map(exporter).join('\n');
                    });
                  }else{
                      //console.log('load ',id);
                  }
            }
        }
    );
}

//修改引擎库和第三方适配库
gulp.task('ModifierJs', () => {
    //core
    gulp.src([
        '../build/js/libs/laya.core.js'], )
        .pipe(through.obj(function (file, encode, cb) {
            var srcContents = file.contents.toString();
            var destContents = srcContents.replace(/var Laya /, "window.Laya");
            // 再次转为Buffer对象，并赋值给文件内容
            file.contents = new Buffer(destContents)
            // 以下是例行公事
            this.push(file)
        cb()
    }))
    .pipe(gulp.dest('../build/js/libs/'));
    //d3
    gulp.src([
        '../build/js/libs/laya.d3.js'], )
        .pipe(through.obj(function (file, encode, cb) {
            var srcContents = file.contents.toString();
            var destContents = srcContents.replace(/this.Laya = this.Laya /, "window.Laya = window.Laya");
            // 再次转为Buffer对象，并赋值给文件内容
            file.contents = new Buffer(destContents)
            // 以下是例行公事
            this.push(file)
        cb()
    }))
    .pipe(gulp.dest('../build/js/libs/'));

    //device
    gulp.src([
        '../build/js/libs/laya.device.js'], )
        .pipe(through.obj(function (file, encode, cb) {
            var srcContents = file.contents.toString();
            var destContents = srcContents.replace(/this.Laya = this.Laya /, "window.Laya = window.Laya");
            // 再次转为Buffer对象，并赋值给文件内容
            file.contents = new Buffer(destContents)
            // 以下是例行公事
            this.push(file)
        cb()
    }))
    .pipe(gulp.dest('../build/js/libs/'));

    //tiledmap
    gulp.src([
        '../build/js/libs/laya.tiledmap.js'], )
        .pipe(through.obj(function (file, encode, cb) {
            var srcContents = file.contents.toString();
            var destContents = srcContents.replace(/this.Laya = this.Laya /, "window.Laya = window.Laya");
            // 再次转为Buffer对象，并赋值给文件内容
            file.contents = new Buffer(destContents)
            // 以下是例行公事
            this.push(file)
        cb()
    }))
    .pipe(gulp.dest('../build/js/libs/'));

    //html
    gulp.src([
        '../build/js/libs/laya.html.js'], )
        .pipe(through.obj(function (file, encode, cb) {
            var srcContents = file.contents.toString();
            var destContents = srcContents.replace(/this.Laya = this.Laya /, "window.Laya = window.Laya");
            // 再次转为Buffer对象，并赋值给文件内容
            file.contents = new Buffer(destContents)
            // 以下是例行公事
            this.push(file)
        cb()
    }))
    .pipe(gulp.dest('../build/js/libs/'));

    //particle
    gulp.src([
        '../build/js/libs/laya.particle.js'], )
        .pipe(through.obj(function (file, encode, cb) {
            var srcContents = file.contents.toString();
            var destContents = srcContents.replace(/this.Laya = this.Laya /, "window.Laya = window.Laya");
            // 再次转为Buffer对象，并赋值给文件内容
            file.contents = new Buffer(destContents)
            // 以下是例行公事
            this.push(file)
        cb()
    }))
    .pipe(gulp.dest('../build/js/libs/'));

    //physics
    gulp.src([
        '../build/js/libs/laya.physics.js'], )
        .pipe(through.obj(function (file, encode, cb) {
            var srcContents = file.contents.toString();
            var destContents = srcContents.replace(/this.Laya = this.Laya /, "window.Laya = window.Laya");
            // 再次转为Buffer对象，并赋值给文件内容
            file.contents = new Buffer(destContents)
            // 以下是例行公事
            this.push(file)
        cb()
    }))
    .pipe(gulp.dest('../build/js/libs/'));

    //ui
    gulp.src([
        '../build/js/libs/laya.ui.js'], )
        .pipe(through.obj(function (file, encode, cb) {
            var srcContents = file.contents.toString();
            var destContents = srcContents.replace(/this.Laya = this.Laya /, "window.Laya = window.Laya");
            // 再次转为Buffer对象，并赋值给文件内容
            file.contents = new Buffer(destContents)
            // 以下是例行公事
            this.push(file)
        cb()
    }))
    .pipe(gulp.dest('../build/js/libs/'));

    //ani
    gulp.src([
        '../build/js/libs/laya.ani.js'], )
        .pipe(through.obj(function (file, encode, cb) {
            var srcContents = file.contents.toString();
            var destContents = srcContents.replace(/this.Laya = this.Laya /, "window.Laya = window.Laya");
            // 再次转为Buffer对象，并赋值给文件内容
            file.contents = new Buffer(destContents)
            // 以下是例行公事
            this.push(file)
        cb()
    }))
    .pipe(gulp.dest('../build/js/libs/'));

    gulp.src([
        '../build/js/libs/laya.wxmini.js'], )
        .pipe(through.obj(function (file, encode, cb) {
            var srcContents = file.contents.toString();
            var tempContents = srcContents.replace(/\(/, "window.wxMiniGame = ");
            var destContents = tempContents.replace(/\(this.Laya = this.Laya \|\| {}, Laya\)\);/, " ");
            // 再次转为Buffer对象，并赋值给文件内容
            file.contents = new Buffer(destContents)
            // 以下是例行公事
            this.push(file)
        cb()
    }))
    .pipe(gulp.dest('../build/js/libs/'));

        gulp.src([
            '../build/js/libs/laya.bdmini.js'], )
            .pipe(through.obj(function (file, encode, cb) {
                var srcContents = file.contents.toString();
                var tempContents = srcContents.replace(/\(/, "window.bdMiniGame = ");
                var destContents = tempContents.replace(/\(this.Laya = this.Laya \|\| {}, Laya\)\);/, " ");
                // 再次转为Buffer对象，并赋值给文件内容
                file.contents = new Buffer(destContents)
                // 以下是例行公事
                this.push(file)
            cb()
        }))
        .pipe(gulp.dest('../build/js/libs/'));

        gulp.src([
            '../build/js/libs/laya.xmmini.js'], )
            .pipe(through.obj(function (file, encode, cb) {
                var srcContents = file.contents.toString();
                var tempContents = srcContents.replace(/\(/, "window.miMiniGame = ");
                var destContents = tempContents.replace(/\(this.Laya = this.Laya \|\| {}, Laya\)\);/, " ");
                // 再次转为Buffer对象，并赋值给文件内容
                file.contents = new Buffer(destContents)
                // 以下是例行公事
                this.push(file)
            cb()
        }))
        .pipe(gulp.dest('../build/js/libs/'));

        gulp.src([
            '../build/js/libs/laya.quickgamemini.js'], )
            .pipe(through.obj(function (file, encode, cb) {
                var srcContents = file.contents.toString();
                var tempContents = srcContents.replace(/\(/, "window.qgMiniGame = ");
                var destContents = tempContents.replace(/\(this.Laya = this.Laya \|\| {}, Laya\)\);/, " ");
                // 再次转为Buffer对象，并赋值给文件内容
                file.contents = new Buffer(destContents)
                // 以下是例行公事
                this.push(file)
            cb()
        }))
        .pipe(gulp.dest('../build/js/libs/'));

        return gulp.src([
            '../build/js/libs/laya.vvmini.js'], )
            .pipe(through.obj(function (file, encode, cb) {
                var srcContents = file.contents.toString();
                var tempContents = srcContents.replace(/\(/, "window.vvMiniGame = ");
                var destContents = tempContents.replace(/\(this.Laya = this.Laya \|\| {}, Laya\)\);/, " ");
                // 再次转为Buffer对象，并赋值给文件内容
                file.contents = new Buffer(destContents)
                // 以下是例行公事
                this.push(file)
                cb()
            }))
            .pipe(gulp.dest('../build/js/libs/'));
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
		'./layaAir/jsLibs/*.js', '!./layaAir/jsLibs/box2d.js', '!./layaAir/jsLibs/laya.physics.js'], )
		.pipe(gulp.dest('../build/js/libs'));
});

//拷贝js库至ts库
gulp.task('CopyJSFileToTSCompatible', () => {
	return gulp.src([
		'../build/js/libs/**/*.js'], )
		.pipe(gulp.dest('../build/ts/libs'));
});

//拷贝js库至as库
gulp.task('CopyJSFileToAS', () => {
	return gulp.src([
		'../build/js/libs/**/*.js', '!../build/js/declare/*ts'], )
		.pipe(gulp.dest('../build/as/jslibs'));
});

//拷贝引擎ts源码至ts库
gulp.task('CopyTSFileToTS', () => {
    // gulp.src([
    //     './extensions/device/**/*.*'], )
    //     .pipe(gulp.dest('../build/ts_new/libs/laya/device'));
    // gulp.src([
    //     './extensions/map/**/*.*'], )
    //     .pipe(gulp.dest('../build/ts_new/libs/laya/map'));
	return gulp.src([
        './layaAir/**/*.*', '!./layaAir/jsLibs/**/*.*', '!./layaAir/gulpfile.js', '!./layaAir/tsconfig.json'], )
		.pipe(gulp.dest('../build/ts_new/libs'));
});

//拷贝第三方库至ts库(未来在数组中补充需要的其他第三方库)
gulp.task('CopyTSJSLibsFileToTS', () => {
	return gulp.src([
        './layaAir/jsLibs/**/*.*', 
        '../build/js/libs/laya.wxmini.js',
        '../build/js/libs/laya.bdmini.js',
        '../build/js/libs/laya.xmmini.js',
        '../build/js/libs/laya.quickgamemini.js',
        '../build/js/libs/laya.vvmini.js'], )
		.pipe(gulp.dest('../build/ts_new/jslibs'));
});

gulp.task('CopyDTS', () => {
	return gulp.src([
        '../tslibs/*.*'], )
		.pipe(gulp.dest('../build/js/ts'))
		.pipe(gulp.dest('../build/ts/ts'))
		.pipe(gulp.dest('../build/ts_new/libs'))
});



//在这个任务中由于机器的配置可能会出现堆栈溢出的情况，解决方案一可以将其中的某些库移送至buildJS2编译，若buildJS2也堆栈溢出，则可以再新建一个任务buildJS3
gulp.task('buildJS', async function () {

    const ani = await rollup.rollup({
        input:packsDef.ani.input,
        output: {
            extend:true,
            globals:{'Laya':'Laya'}
        },
        external:['Laya'],
        plugins: [
            myMultiInput(),
            typescript({
                tsconfig:"./layaAir/tsconfig.json",
                check: false,
                tsconfigOverride:{compilerOptions:{removeComments: true}}
            }),
            glsl({
                include: /\.glsl$/,
                sourceMap: false,
                compress:false
            }),   
        ]
    });
  
    await ani.write({
      file: packsDef.ani.out,
      format: 'iife',
      name: 'Laya',
      sourcemap: false,
      extend:true,
      globals:{'Laya':'Laya'}
    });


    const core = await rollup.rollup({
        input:packsDef.core.input,
        plugins: [
            myMultiInput(),
            typescript({
                tsconfig:"./layaAir/tsconfig.json",
                check: false,
                tsconfigOverride:{compilerOptions:{removeComments: true}}
            }),
            glsl({
                include: /\.glsl$/,
                sourceMap: false,
                compress:false
            }),   
        ]
    });
  
    await core.write({
      file: packsDef.core.out,
      format: 'iife',
      name: 'Laya',
      sourcemap: false
    });

    const d3 = await rollup.rollup({
        input:packsDef.d3.input,
        output: {
            extend:true,
            globals:{'Laya':'Laya'}
        },
        external:['Laya'],
        plugins: [
            myMultiInput(),
            typescript({
                tsconfig:"./layaAir/tsconfig.json",
                check: false,
                tsconfigOverride:{compilerOptions:{removeComments: true}}
            }),
            glsl({
                include: /.*(.glsl|.vs|.fs)$/,
                sourceMap: false,
                compress:false
            }),   
        ]
    });
  
    await d3.write({
      file: packsDef.d3.out,
      format: 'iife',
      name: 'Laya',
      sourcemap: false,
      extend:true,
      globals:{'Laya':'Laya'}
    });

    const device = await rollup.rollup({
        input:packsDef.device.input,
        output: {
            extend:true,
            globals:{'Laya':'Laya'}
        },
        external:['Laya'],
        plugins: [
            myMultiInput(),
            typescript({
                tsconfig:"./layaAir/tsconfig.json",
                check: false,
                tsconfigOverride:{compilerOptions:{removeComments: true}}
            }),
            glsl({
                include: /\.glsl$/,
                sourceMap: false,
                compress:false
            }),   
        ]
    });
  
    await device.write({
      file: packsDef.device.out,
      format: 'iife',
      name: 'Laya',
      sourcemap: false,
      extend:true,
      globals:{'Laya':'Laya'}
    });

    const html = await rollup.rollup({
        input:packsDef.html.input,
        output: {
            file: packsDef.html.out,
            format: 'iife',
            name: 'Laya',
            sourcemap: false,
            extend:true,
            globals:{'Laya':'Laya'}
        },
        external:['Laya'],
        plugins: [
            myMultiInput(),
            typescript({
                tsconfig:"./layaAir/tsconfig.json",
                check: false,
                tsconfigOverride:{compilerOptions:{removeComments: true}}
            }),
            glsl({
                include: /\.glsl$/,
                sourceMap: false,
                compress:false
            }),   
        ]
    });
  
    await html.write({
      file: packsDef.html.out,
      format: 'iife',
      name: 'Laya',
      sourcemap: false,
      extend:true,
      globals:{'Laya':'Laya'}
    });

    const particle = await rollup.rollup({
        input:packsDef.particle.input,
        output: {
            extend:true,
            globals:{'Laya':'Laya'}
        },
        external:['Laya'],
        plugins: [
            myMultiInput(),
            typescript({
                tsconfig:"./layaAir/tsconfig.json",
                check: false,
                tsconfigOverride:{compilerOptions:{removeComments: true}}
            }),
            glsl({
                include: /\.glsl$/,
                sourceMap: false,
                compress:false
            }),   
        ]
    });
  
    await particle.write({
      file: packsDef.particle.out,
      format: 'iife',
      name: 'Laya',
      sourcemap: false,
      extend:true,
      globals:{'Laya':'Laya'}
    });

  });

  gulp.task('buildJS2', async function () {
    const physics = await rollup.rollup({
        input:packsDef.physics.input,
        output: {
            extend:true,
            globals:{'Laya':'Laya'}
        },
        external:['Laya'],
        plugins: [
            myMultiInput(),
            typescript({
                tsconfig:"./layaAir/tsconfig.json",
                check: false,
                tsconfigOverride:{compilerOptions:{removeComments: true}}
            }),
            glsl({
                include: /\.glsl$/,
                sourceMap: false,
                compress:false
            }),   
        ]
    });
  
    await physics.write({
      file: packsDef.physics.out,
      format: 'iife',
      name: 'Laya',
      sourcemap: false,
      extend:true,
      globals:{'Laya':'Laya'}
    });

    const ui = await rollup.rollup({
        input:packsDef.ui.input,
        output: {
            extend:true,
            globals:{'Laya':'Laya'}
        },
        external:['Laya'],
        plugins: [
            myMultiInput(),
            typescript({
                tsconfig:"./layaAir/tsconfig.json",
                check: false,
                tsconfigOverride:{compilerOptions:{removeComments: true}}
            }),
            glsl({
                include: /\.glsl$/,
                sourceMap: false,
                compress:false
            }),   
        ]
    });
  
    await ui.write({
      file: packsDef.ui.out,
      format: 'iife',
      name: 'Laya',
      sourcemap: false,
      extend:true,
      globals:{'Laya':'Laya'}
    });

    const tiledmap = await rollup.rollup({
        input:packsDef.tiledmap.input,
        output: {
            extend:true,
            globals:{'Laya':'Laya'}
        },
        external:['Laya'],
        plugins: [
            myMultiInput(),
            typescript({
                tsconfig:"./layaAir/tsconfig.json",
                check: false,
                tsconfigOverride:{compilerOptions:{removeComments: true}}
            }),
            glsl({
                include: /\.glsl$/,
                sourceMap: false,
                compress:false
            }),   
        ]
    });
  
    await tiledmap.write({
      file: packsDef.tiledmap.out,
      format: 'iife',
      name: 'Laya',
      sourcemap: false,
      extend:true,
      globals:{'Laya':'Laya'}
    });
  });

  //构建平台适配库
  gulp.task('buildJSPlatform', async function () {
    const wx = await rollup.rollup({
        input:packsDef.wx.input,
        output: {
            extend:true,
            globals:{'Laya':'Laya'}
        },
        external:['Laya'],
        plugins: [
            myMultiInput(),
            typescript({
                tsconfig:"./layaAir/tsconfig.json",
                check: false,
                tsconfigOverride:{compilerOptions:{removeComments: true}}
            }),
            glsl({
                include: /.*(.glsl|.vs|.fs)$/,
                sourceMap: false
            })   
        ]
    });

    await wx.write({
        file: packsDef.wx.out,
        format: 'iife',
        name: 'Laya',
        sourcemap: false,
        extend:true,
        globals:{'Laya':'Laya'}
    });


    const bd = await rollup.rollup({
        input:packsDef.bd.input,
        output: {
            extend:true,
            globals:{'Laya':'Laya'}
        },
        external:['Laya'],
        plugins: [
            myMultiInput(),
            typescript({
                tsconfig:"./layaAir/tsconfig.json",
                check: false,
                tsconfigOverride:{compilerOptions:{removeComments: true}}
            }),
            glsl({
                include: /.*(.glsl|.vs|.fs)$/,
                sourceMap: false
            })   
        ]
    });

    await bd.write({
        file: packsDef.bd.out,
        format: 'iife',
        name: 'Laya',
        sourcemap: false,
        extend:true,
        globals:{'Laya':'Laya'}
      });

    const mi = await rollup.rollup({
        input:packsDef.mi.input,
        output: {
            extend:true,
            globals:{'Laya':'Laya'}
        },
        external:['Laya'],
        plugins: [
            myMultiInput(),
            typescript({
                tsconfig:"./layaAir/tsconfig.json",
                check: false,
                tsconfigOverride:{compilerOptions:{removeComments: true}}
            }),
            glsl({
                include: /.*(.glsl|.vs|.fs)$/,
                sourceMap: false
            })   
        ]
    });

    await mi.write({
        file: packsDef.mi.out,
        format: 'iife',
        name: 'Laya',
        sourcemap: false,
        extend:true,
        globals:{'Laya':'Laya'}
    });

    const qg = await rollup.rollup({
        input:packsDef.qg.input,
        output: {
            extend:true,
            globals:{'Laya':'Laya'}
        },
        external:['Laya'],
        plugins: [
            myMultiInput(),
            typescript({
                tsconfig:"./layaAir/tsconfig.json",
                check: false,
                tsconfigOverride:{compilerOptions:{removeComments: true}}
            }),
            glsl({
                include: /.*(.glsl|.vs|.fs)$/,
                sourceMap: false
            })   
        ]
    });

    await qg.write({
        file: packsDef.qg.out,
        format: 'iife',
        name: 'Laya',
        sourcemap: false,
        extend:true,
        globals:{'Laya':'Laya'}
    });

    const vv = await rollup.rollup({
        input:packsDef.vv.input,
        output: {
            extend:true,
            globals:{'Laya':'Laya'}
        },
        external:['Laya'],
        plugins: [
            myMultiInput(),
            typescript({
                tsconfig:"./layaAir/tsconfig.json",
                check: false,
                tsconfigOverride:{compilerOptions:{removeComments: true}}
            }),
            glsl({
                include: /.*(.glsl|.vs|.fs)$/,
                sourceMap: false
            })   
        ]
    });

    await vv.write({
        file: packsDef.vv.out,
        format: 'iife',
        name: 'Laya',
        sourcemap: false,
        extend:true,
        globals:{'Laya':'Laya'}
    });
  });

  gulp.task('build', gulp.series('buildJS','buildJS2','buildJSPlatform','ModifierJs', 'ConcatBox2dPhysics', 'CopyJSLibsToJS','CopyTSFileToTS','CopyJSFileToAS','CopyTSJSLibsFileToTS', 'CopyJSFileToTSCompatible','CopyDTS'));
