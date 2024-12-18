import fs from "fs";
import path from "path";
import { glob } from "glob";
import { rollup } from "rollup";
import glsl from "rollup-plugin-glsl";
import typescript2 from 'rollup-plugin-typescript2';
import { onRollupWarn } from "./utils.mjs";

const samplesBathURL = './src/samples';
let baseurl = process.cwd();
let layaFiles = [
    path.join(baseurl, "./src/", "layaAir", "Laya.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "net", "HttpRequest.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "resource", "Resource.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "resource", "Texture.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "media", "SoundChannel.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "events", "EventDispatcher.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "utils", "Browser.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "display", "Input.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "net", "Loader.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "net", "LocalStorage.ts"),
    path.join(baseurl, "./src/", "layaAir", "Config.ts"),
];
let layaexpreplace = '//__LAYARPLACEMENTHERE__//';

var mentry = 'multientry.ts';

main();

async function main() {
    let bundleobj = {
        tsconfig: samplesBathURL + '/tsconfig.json',
        check: false, //Set to false to avoid doing any diagnostic checks on the code
        tsconfigOverride: {
            compilerOptions: {
                removeComments: true
            }
        },
        include: samplesBathURL + "/**/*.ts"
    };

    let bundle = await rollup({
        input: samplesBathURL + '/index.ts',
        treeshake: false, //建议忽略
        onwarn: onRollupWarn(true),
        external: ['Laya'],
        plugins: [
            //mySamplesMultiInput(),
            layaExpPlugin({
                baseUrl: './src/layaAir',
                layaPath: './src/layaAir', // 收集需要的laya文件
                gatherExtFiles: layaFiles,
                //addLayaExpAt:layaexpreplace,
            }),
            typescript2(bundleobj),
            glsl({
                include: /.*(.glsl|.vs|.fs)$/,
                sourceMap: true,
                compress: false
            }),
        ]
    });
    await bundle.write({
        file: './bin/rollUp/bundle.js',
        format: 'iife',
        name: 'Laya',
        extend: true,
        globals: {
            'Laya': 'Laya'
        },
        sourcemap: true,
        banner: 'window.Laya=window.Laya||{};\n',
    });

    console.time("compile laya");
    let layaobj = {
        tsconfig: './src/layaAir/tsconfig.json',
        check: false,
        tsconfigOverride: {
            compilerOptions: {
                removeComments: true
            }
        },
        include: /.*(.ts)$/
    };

    bundle = await rollup({
        input: layaFiles,
        onwarn: onRollupWarn(true),
        treeshake: false, //建议忽略
        plugins: [
            mySamplesMultiInput({
                path: './src/layaAir'
            }),
            typescript2(layaobj),
            glsl({
                include: /.*(.glsl|.vs|.fs)$/,
                sourceMap: true,
                compress: false
            }),
        ]
    });
    await bundle.write({
        file: './bin/rollUp/laya.js',
        format: 'iife',
        name: 'Laya',
        sourcemap: true,
        //banner: 'window.Laya=window.Laya||{};\n',
    });
    console.timeEnd("compile laya");

    // 发布时调用编译功能，判断是否点击了编译选项
    let layajsPath = path.join("./", "bin/rollUp", "laya.js");
    let layajsCon = fs.readFileSync(layajsPath, "utf8");
    layajsCon = layajsCon.replace(/^var Laya = /mg, "");
    layajsCon = layajsCon.replace(/\({}\);\s*\n*$/mg, "(window.Laya = window.Laya || {});");
    fs.writeFileSync(layajsPath, layajsCon, "utf8");
}

function mySamplesMultiInput(options) {
    let packPath = options ? options.path : null; // 除了制定输入以外，这个目录下的也可以认为是内部文件，可以引用
    if (packPath && !path.isAbsolute(packPath)) {
        packPath = path.join(process.cwd(), packPath);
    }

    function pathInPack(p) {
        if (!packPath)
            return true; // 没有设置，则认为true，
        let r = path.relative(packPath, p);
        if (r.startsWith('..')) //TODO 如果盘符都变了这样是不对的
            return false;
        return true;
    }

    var curPackFiles = null; //当前包的所有的文件

    var exporter = function (p) {
        if (p.substr(p.length - 3) == '.ts') {
            p = p.substr(0, p.length - 3);
        }
        return `export * from ${JSON.stringify(p)};`;
    };
    return ({
        options(options) {
            curPackFiles = options.input;
            options.input = mentry;
        },

        resolveId(id, importer) { //entry是个特殊字符串，rollup并不识别，所以假装这里解析一下
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
                return curPackFiles.map(exporter).join('\n');
            } else {
                // console.log('load ',id);
            }
        }
    });
}

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
    let dirname = process.cwd();
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
            if (!layafiles) // 不收集laya文件，表示是整体打包。不排除laya文件
                return;
            if (id.endsWith("tslib"))
                console.log(id, importer);
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
            } else { }
        },

        renderChunk(code, chunk, options) {
            let replacestr = opt.addLayaExpAt;
            let SourceMap = null;
            let _code = code;
            if (!replacestr)
                return {
                    code: _code,
                    map: SourceMap
                };

            let p = code.lastIndexOf(replacestr);
            if (p < 0)
                return {
                    code: _code,
                    map: SourceMap
                };

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
            _code = st + code.substr(0, p) + expstr + code.substr(p + replacestr.length);
            // console.log(_code);
            return {
                code: _code,
                map: SourceMap
            }
        }
    });
}