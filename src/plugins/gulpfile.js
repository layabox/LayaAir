
const typescript =  require('rollup-plugin-typescript2');
const glsl = require('rollup-plugin-glsl');
const path = require('path');
const fs = require('fs');
var matched = require('matched');
const production = !process.env.ROLLUP_WATCH;
const gulp = require('gulp');
const rollup = require('rollup');

var packsDef={
    'wx':{
        'input':[
            './wx/**/*.*'
        ],
        'out':'../../build/js/laya.wxmini.js'
    }
    
    // 'particle':{
    //     'input':[
    //         './laya/particle/**/*.*'
    //     ],
    //     'out':'../../build/js/laya.particle.js'
    // }

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
		'./jsLibs/*.js'])
		.pipe(gulp.dest('../../build/js'));
});

gulp.task('CopyJSFileToTSCompatible', () => {
	return gulp.src([
		'../../build/js/**/*.js'])
		.pipe(gulp.dest('../../build/ts_compatible'));
});


gulp.task('CopyJSFileToAS', () => {
	return gulp.src([
		'../../build/js/**/*.js', '!./declare/*ts'])
		.pipe(gulp.dest('../../build/as'));
});

gulp.task('CopyTSFileToTS', () => {
	return gulp.src([
		'./*.ts',
        './**/*.ts', './**/*.js', '!gulpfile.js'])
		.pipe(gulp.dest('../../build/ts/'));
});




gulp.task('buildJS', async function () {
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
      sourcemap: false
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
                sourceMap: false
            })   
        ]
    });
  
    await physics.write({
      file: packsDef.physics.out,
      format: 'iife',
      name: 'Laya',
      sourcemap: false
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
                sourceMap: false
            })  
        ]
    });
  
    await ui.write({
      file: packsDef.ui.out,
      format: 'iife',
      name: 'Laya',
      sourcemap: false
    });

  });

  gulp.task('build', gulp.series('buildJS'));
