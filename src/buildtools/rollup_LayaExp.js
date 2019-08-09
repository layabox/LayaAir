
const path = require('path');

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

    return (
        {
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
                }
            },

            renderChunk(code, chunk, options) {
                let replacestr = opt.addLayaExpAt;
                if (!replacestr)
                    return code;

                let p = code.lastIndexOf(replacestr);
                if (p < 0)
                    return code;

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
                return st + code.substr(0, p) + expstr + code.substr(p + replacestr.length);
            }
        });
}

module.exports = layaExpPlugin;