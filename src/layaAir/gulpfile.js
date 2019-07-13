
const typescript =  require('rollup-plugin-typescript2');
const glsl = require('rollup-plugin-glsl');
const path = require('path');
const fs = require('fs');
var matched = require('matched');
const production = !process.env.ROLLUP_WATCH;
const gulp = require('gulp');
const rollup = require('rollup');

var packsDef={
    'core':{
        'input':[
            './Config.ts',
            './laya/Const.ts',
            './ILaya.ts',
            './Laya.ts',
            './laya/components/**/*.*',
            './laya/display/**/*.*',
            './laya/events/**/*.*',
            './laya/filters/**/*.*', 
            './laya/layagl/**/*.*',
            './laya/maths/**/*.*',
            './laya/media/**/*.*',
            './laya/net/**/*.*',
            './laya/renders/**/*.*',
            './laya/resource/**/*.*',
            './laya/system/**/*.*',
            './laya/utils/**/*.*',
            './laya/webgl/**/*.*',
            './laya/effect/**/*.*'
        ],
        'out':'../../build/js/libs/laya.core.js'
    },
    'd3':{
        'input':[
            './laya/d3/**/*.*',
            './Config3D.ts',
            './ILaya3D.ts',
            './Laya3D.ts'
        ],
        'out':'../../build/js/libs/laya.d3.js'
    },
    'device':{
        'input':[
            './laya/device/**/*.*'
        ],
        'out':'../../build/js/libs/laya.device.js'
    },
    'html':{
        'input':[
            './laya/html/**/*.*'
        ],
        'out':'../../build/js/libs/laya.html.js' 
    },
    'particle':{
        'input':[
            './laya/particle/**/*.*'
        ],
        'out':'../../build/js/libs/laya.particle.js'
    },

    'physics':{
        'input':[
            './laya/physics/**/*.*'
        ],
        'out':'../../build/js/libs/laya.physics.js' 
    },
    'ui':{
        'input':[
            './laya/ui/**/*.*'
        ],
        'out':'../../build/js/libs/laya.ui.js'
    },

    'ani':{
        'input':[
            './laya/ani/**/*.*'
        ],
        'out':'../../build/js/libs/laya.ani.js'
    },
    'wx':{
        'input':[
            '../plugins/wx/**/*.*'
        ],
        'out':'../../build/js/laya.wxmini.js'
    }

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


gulp.task('CopyJSLibsToJS', () => {
	return gulp.src([
		'./jsLibs/*.js'], )
		.pipe(gulp.dest('../../build/js/libs'));
});

gulp.task('CopyJSFileToTSCompatible', () => {
	return gulp.src([
		'../../build/js/libs/**/*.js'], )
		.pipe(gulp.dest('../../build/ts/libs'));
});


gulp.task('CopyJSFileToAS', () => {
	return gulp.src([
		'../../build/js/libs/**/*.js', '!./declare/*ts'], )
		.pipe(gulp.dest('../../build/as/jslibs'));
});

gulp.task('CopyTSFileToTS', () => {
	return gulp.src([
		'./*.ts',
        './**/*.ts', './**/*.js', '!gulpfile.js'], )
		.pipe(gulp.dest('../../build/ts_new/'));
});




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
                tsconfig:"tsconfig.json",
                check: false
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
                tsconfig:"tsconfig.json",
                check: false
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
                tsconfig:"tsconfig.json",
                check: false
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
                tsconfig:"tsconfig.json",
                check: false
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
                tsconfig:"tsconfig.json",
                check: false
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
                tsconfig:"tsconfig.json",
                check: false
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
                tsconfig:"tsconfig.json",
                check: false
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
                tsconfig:"tsconfig.json",
                check: false
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
                tsconfig:"tsconfig.json",
                check: false
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

  });

  gulp.task('build', gulp.series('buildJS','buildJS2','CopyJSLibsToJS','CopyTSFileToTS','CopyJSFileToAS', 'CopyJSFileToTSCompatible'));
