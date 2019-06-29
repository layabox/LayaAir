//import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import glsl from 'rollup-plugin-glsl';
const path = require('path');
const fs = require('fs');
var matched = require('matched');
const production = !process.env.ROLLUP_WATCH;


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
            './laya/webgl/**/*.*'
        ],
        'out':'../../bin/laya.core.js'
    },
    'ani':{
        'input':[
            './laya/ani/**/*.*'
        ],
        'out':'../../bin/laya.ani.js'
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
              exporter = function exporter(path) {
                return `import ${JSON.stringify(path)};`;
              };
            }            
        }
      }  
      
      var exporter = function exporter(path) {
        return `export * from ${JSON.stringify(path)};`;
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
                        //console.log(paths);
                        fs.writeFileSync('d:/temp/pp.ts',paths.join('\n'));
                        return paths.map(exporter).join('\n');
                    });
                  }else{
                      //console.log('load ',id);
                  }
            }
        }
    );
}


export default [
    { //core
        input:packsDef.core.input,
        output: {
            file: packsDef.core.out,
            format: 'iife', // immediately-invoked function expression — suitable for <script> tags
            sourcemap: false,
            name:'Laya',
            //indent: false
        },
        plugins: [
            myMultiInput(),
            typescript({
                //abortOnError:false
                check: false
            }),
            glsl({
                include: /\.glsl$/,
                sourceMap: false
            }),        
        ]
    },
    {
        //ani
        input:packsDef.ani.input,
        output: {
            file: packsDef.ani.out,
            format: 'iife', // immediately-invoked function expression — suitable for <script> tags
            sourcemap: false,
            name:'Laya',
            extend:true,
            globals:{'Laya':'Laya'}
            //indent: false
        },
        external:['Laya'],
        plugins: [
            myMultiInput(),
            typescript({
                //abortOnError:false
                check: false
            }),
            glsl({
                include: /\.glsl$/,
                sourceMap: false
            }),        
        ]

    }

];