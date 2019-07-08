//import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import glsl from 'rollup-plugin-glsl';
import cleanup from 'rollup-plugin-cleanup'
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
        'out':'../../build/js/laya.core.js'
    },
    'd3':{
        'input':[
            './laya/d3/**/*.*',
            './Config3D.ts',
            './ILaya3D.ts',
            './Laya3D.ts'
        ],
        'out':'../../build/js/laya.d3.js'
    },
    'device':{
        'input':[
            './laya/device/**/*.*'
        ],
        'out':'../../build/js/laya.device.js'
    },
    'html':{
        'input':[
            './laya/html/**/*.*'
        ],
        'out':'../../build/js/laya.html.js' 
    },
    'particle':{
        'input':[
            './laya/particle/**/*.*'
        ],
        'out':'../../build/js/laya.particle.js'
    },

    'physics':{
        'input':[
            './laya/physics/**/*.*'
        ],
        'out':'../../build/js/laya.physics.js' 
    },
    'ui':{
        'input':[
            './laya/ui/**/*.*'
        ],
        'out':'../../build/js/laya.ui.js'
    },

    'ani':{
        'input':[
            './laya/ani/**/*.*'
        ],
        'out':'../../build/js/laya.ani.js'
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
            cleanup({
                comments:'none'
            })         // cleanup here    
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
            cleanup({
                comments:'none'
            })         // cleanup here         
        ]

    },
    { //d3
        input:packsDef.d3.input,
        output: {
            file: packsDef.d3.out,
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
                include: /.*(.glsl|.vs|.fs)$/,
                sourceMap: false
            }),    
            cleanup({
                comments:'ts',
                include:'../publishTool/bin/laya.d3.js',
                extensions:['js', 'jsx', 'tag']
            })         // cleanup here        
        ]
    },
    {
        //device
        input:packsDef.device.input,
        output: {
            file: packsDef.device.out,
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

    },
    {
        //html
        input:packsDef.html.input,
        output: {
            file: packsDef.html.out,
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

    },
    {
        //particle
        input:packsDef.particle.input,
        output: {
            file: packsDef.particle.out,
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

    },
    {
        //physics
        input:packsDef.physics.input,
        output: {
            file: packsDef.physics.out,
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

    },
    {
        //ui
        input:packsDef.ui.input,
        output: {
            file: packsDef.ui.out,
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