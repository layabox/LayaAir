
//引用插件模块
const gulp = require("gulp");
const rollup = require("rollup");
const typescript = require( 'rollup-plugin-typescript2');//typescript2 plugin
const glsl = require( 'rollup-plugin-glsl');
const matched = require('matched');
const path = require('path');
const fs = require('fs');

/**
 * 主要用来给laya库加上所有的Laya.xx=xx
 * 主要用在
 *  1. 分包的时候统计laya文件
 *  2. 打包的时候导出Laya
 * addLayaExpAt:string 打包的最后会替换这个字符串，加上Laya.xx=xx
 * layaPath:laya所在目录。这个目录下的是laya文件，可以用来收集laya文件或者判断需要导出的类
 * isLayaLib:boolean 当前打包是否是laya目录，是的话表示强制加 Laya.xx 不再判断目录
 * gatherExtFiles:string[] 收集用到的laya文件。这表示是分包模式
 * baseUrl:string   设置baseurl，只有分包模式用到
 */
function layaExpPlugin(options) {
    let dirname = __dirname;//process.cwd();
    let opt = options;
    let layaPath = null;
    let layafiles = null;
    let baseUrl = null;

    if (opt) {
        layafiles = opt.gatherExtFiles;
        if (layafiles && !(layafiles instanceof Array)) {
            throw 'gatherExtFiles should be an Array';
        }

        layaPath = options.layaPath;
        if (layaPath)
            layaPath = path.resolve(dirname, layaPath);
        baseUrl = opt.baseUrl;
        if (baseUrl) {
            baseUrl = path.resolve(dirname, baseUrl);
        }
    }

    function isLayaPath(id) {
        if (!layaPath)
            return false;
        let r = path.relative(layaPath, id);
        return !r.startsWith('..');
    }

    return ({
        load(id) { },
        resolveId(id, importer) {
            if (!importer)
                return;
            if (!layafiles)  // 不收集laya文件，表示是整体打包。不排除laya文件
                return;
            let importfile;
            if (id.startsWith('..') || id.startsWith('.'))
                importfile = path.join(path.dirname(importer), id);
            else if (baseUrl) {
                importfile = path.join(baseUrl, id);
            }
            if (isLayaPath(importfile)) {
                let tsfile = importfile;
                tsfile += '.ts';
                if (layafiles.indexOf(tsfile) < 0)
                    layafiles.push(tsfile);
                return 'Laya';
            } else {
            }
        },

        renderChunk(code, chunk, options) {
            let replacestr = opt.addLayaExpAt;
            let SourceMap = null;
            let _code = code;
            if (!replacestr)
                return { code: _code, map: SourceMap };

            let p = code.lastIndexOf(replacestr);
            if (p < 0)
                return { code: _code, map: SourceMap };

            let expstr = 'Laya=window.Laya;\n';
            let islayalib = opt.isLayaLib;
            for (let mod in chunk.modules) {
                if (!islayalib && !isLayaPath(mod))
                    continue;
                // 所有的laya模块都导出
                chunk.modules[mod].renderedExports.forEach(m => {
                    if (m === 'default') return;
                    if (m === 'Laya') return;
                    expstr += 'Laya.' + m + '=' + m + '\n';
                });
            }
            // 插入导出的模块
            let st = 'window.Laya=window.Laya||{};\n';
            _code = st+code.substr(0, p) + expstr + code.substr(p + replacestr.length);
            return { code: _code, map: SourceMap }
        }
    });
}

let layaFiles = [];
let layaexpreplace = '//__LAYARPLACEMENTHERE__//';

var curPackFiles = null;  //当前包的所有的文件
var mentry = 'multientry.ts';
function myMultiInput(options) {
    let packPath = options ? options.path : null;   // 除了制定输入以外，这个目录下的也可以认为是内部文件，可以引用
    if (packPath && !path.isAbsolute(packPath)) {
        packPath = path.join(__dirname, packPath);
    }

    function pathInPack(p) {
        if (!packPath)
            return true;    // 没有设置，则认为true，
        let r = path.relative(packPath, p);
        if (r.startsWith('..'))  //TODO 如果盘符都变了这样是不对的
            return false;
        return true;
    }

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
                // console.log('===', options.input)
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
                // console.log('import ', importfile);
                if (importfile.endsWith('.json')) {
                    console.log('import ', importfile);
                }
                if (curPackFiles.indexOf(importfile) < 0 && !pathInPack(importfile)) {
                    //其他包里的文件
                    // console.log('other pack:',id,'impo   rter=', importer);
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
                        return paths.map(exporter).join('\n');
                    });
                } else {
                    //console.log('load ',id);
                }
            }
        }
    );
}

const precompile = async function () {
    let bundleobj = {
        tsconfig: './tsconfig.json',
        check: false,//Set to false to avoid doing any diagnostic checks on the code
        tsconfigOverride:{
            compilerOptions:{removeComments: true}
        },
        include : "./**/*.ts"
    }
    
    await rollup.rollup({
        input: 'index.ts',
		treeshake: false, //建议忽略
        external: ['Laya'],
        plugins: [
            //myMultiInput(),
            layaExpPlugin({
                baseUrl: '../layaAir',
                layaPath: '../layaAir',      // 收集需要的laya文件
                gatherExtFiles: layaFiles,
                //addLayaExpAt:layaexpreplace,
            }),
            typescript(bundleobj),
            glsl({
                // By default, everything gets included
                include: /.*(.glsl|.vs|.fs)$/,
                sourceMap: false,
                compress: false
            }),
        ]
    }).then(bundle => {
        return bundle.write({
            file: '../../bin/rollUp/bundle.js',
            format: 'iife',
            name: 'Laya',
            extend: true,
            globals: { 'Laya': 'Laya' },
            sourcemap: false,
            banner: 'window.Laya=window.Laya||{};\n',
        });
    });
    
    let layaobj = {
        tsconfig: '../layaAir/tsconfig.json',
        check: false,
        tsconfigOverride:{compilerOptions:{removeComments: true}},
        include : /.*(.ts)$/
    }
    return rollup.rollup({
        input: layaFiles,
		treeshake: false, //建议忽略
        plugins: [
            myMultiInput({ path: '../layaAir' }),
            typescript(layaobj),
            glsl({
                include: /.*(.glsl|.vs|.fs)$/,
                sourceMap: false,
                compress: false
            }),
        ]
    }).then(bundle => {
        return bundle.write({
            file: '../../bin/rollUp/laya.js',
            format: 'iife',
            name: 'Laya',
            sourcemap: false,
            //banner: 'window.Laya=window.Laya||{};\n',
        });
    });
};

const changeLayaJS = function(cb) {
	// 发布时调用编译功能，判断是否点击了编译选项
	let layajsPath = path.join("../../", "bin/rollUp", "laya.js");
	let layajsCon = fs.readFileSync(layajsPath, "utf8");
	layajsCon = layajsCon.replace(/^var Laya = /mg, "");
	layajsCon = layajsCon.replace(/\({}\)\);\s*\n*$/mg, "(window.Laya = window.Laya || {}));");
    fs.writeFileSync(layajsPath, layajsCon, "utf8");
    cb();
};

exports.compile = gulp.series(precompile,changeLayaJS);