const path = require('path');
const matched = require('matched');

var curPackFiles = null;  //当前包的所有的文件
var mentry = 'multientry:entry-point';
function multiInput(options) {
    let packPath = options ? options.path : null;   // 除了制定输入以外，这个目录下的也可以认为是内部文件，可以引用
    if (packPath) {
        packPath = path.join(__dirname, packPath);
    }

    function pathInPack(p) {
        if (!packPath)
            return false;    // 没有设置，则认为false，
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
                //console.log('id=',id);
                // 不在本包所在目录，并且不在指定的目录中
                if (curPackFiles.indexOf(importfile) < 0 && !pathInPack(importfile)) {
                    //其他包里的文件
                     //console.log('other pack:',id,'impo   rter=', importer);
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
                        //console.log(curPackFiles);
                        return paths.map(exporter).join('\n');
                    });
                } else {
                    //console.log('load ',id);
                }
            }
        }
    );
}

module.exports = multiInput;