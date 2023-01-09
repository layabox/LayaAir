const path = require('path');
const fs = require('fs');
const rimrafSync = require('rimraf').sync;
const matched = require('matched');
const ts = require('typescript');
const gulp = require('gulp');
const gulpts = require('gulp-typescript');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');
const inject = require('gulp-inject-string');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('rollup');
const glsl = require('rollup-plugin-glsl');
const rollupSourcemaps = require('rollup-plugin-sourcemaps');
const Stream = require('stream');
const merge = require('merge2');

const tscOutPath = "./bin/tsc/";
const sourcemap = true;

//编译新的库文件只需要在packsDef中配置一下新的库就可以了
const packsDef = [
    {
        'libName': "core",
        'input': [
            './layaAir/Decorators.ts',
            './layaAir/Config.ts',
            './layaAir/laya/Const.ts',
            './layaAir/laya/ModuleDef.ts',
            './layaAir/ILaya.ts',
            './layaAir/Laya.ts',
            './layaAir/LayaEnv.ts',
            './layaAir/laya/components/**/*.*',
            './layaAir/laya/display/**/*.*',
            './layaAir/laya/effect/**/*.*',
            './layaAir/laya/events/**/*.*',
            './layaAir/laya/filters/**/*.*',
            './layaAir/laya/layagl/**/*.*',
            './layaAir/laya/loaders/**/*.*',
            './layaAir/laya/maths/**/*.*',
            './layaAir/laya/media/**/*.*',
            './layaAir/laya/net/**/*.*',
            './layaAir/laya/RenderEngine/**/*.*',
            './layaAir/laya/renders/**/*.*',
            './layaAir/laya/resource/**/*.*',
            './layaAir/laya/system/**/*.*',
            './layaAir/laya/utils/**/*.*',
            './layaAir/laya/webgl/**/*.*',
            './layaAir/Config3D.ts',


        ],
    },
    {
        'libName': "d3",
        'input': [
            './layaAir/laya/d3/animation/**/*.*',
            './layaAir/laya/d3/component/**/*.*',
            './layaAir/laya/d3/core/**/*.*',
            './layaAir/laya/d3/depthMap/*.*',
            './layaAir/laya/d3/graphics/**/*.*',
            './layaAir/laya/d3/loaders/**/*.*',
            './layaAir/laya/d3/math/**/*.*',
            './layaAir/laya/d3/resource/**/*.*',
            './layaAir/laya/d3/shader/**/*.*',
            './layaAir/laya/d3/shadowMap/**/*.*',
            './layaAir/laya/d3/text/**/*.*',
            './layaAir/laya/d3/utils/**/*.*',
            './layaAir/laya/d3/WebXR/**/*.*',
            './layaAir/laya/d3/Input3D.ts',
            './layaAir/laya/d3/MouseTouch.ts',
            './layaAir/laya/d3/Touch.ts',
            './layaAir/laya/d3/Physics3D.ts',
            './layaAir/laya/d3/ModuleDef.ts',
            './layaAir/laya/d3/RenderObjs/**/*.*',
            './layaAir/ILaya3D.ts',
            './layaAir/Laya3D.ts',
            './layaAir/laya/d3/physics/**/*.*',
        ],
    },
    {
        'libName': "gltf",
        'input': [
            './layaAir/laya/gltf/**/*.*',
        ],
    },
    // {
    //     'libName': "bullet",
    //     'input': [
    //         './layaAir/laya/d3/physics/**/*.*',
    //     ],
    // },
    {
        'libName': 'device',
        'input': [
            './layaAir/laya/device/**/*.*'
        ],
    },
    {
        'libName': 'tiledmap',
        'input': [
            './layaAir/laya/map/**/*.*'
        ],
    },
    {
        'libName': 'html',
        'input': [
            './layaAir/laya/html/**/*.*'
        ],
    },
    {
        'libName': 'particle',
        'input': [
            './layaAir/laya/particle/**/*.*'
        ],
    },

    {
        'libName': 'physics',
        'input': [
            './layaAir/laya/physics/**/*.*'
        ],
    },
    {
        'libName': 'ui',
        'input': [
            './layaAir/laya/ui/**/*.*',
            './layaAir/UIConfig.ts',
        ],
    },
    {
        'libName': 'spine',
        'input': [
            './layaAir/laya/spine/**/*.*'
        ],
    },
    {
        'libName': 'ani',
        'input': [
            './layaAir/laya/ani/**/*.*'
        ],
    },
    {
        'libName': 'debugtool',
        'input': [
            './extensions/debug/**/*.*'
        ],
    },
    {
        "libName": 'performancetool',
        'input': [
            './extensions/performanceTool/**/*.*'
        ],
    }
];

/*
    并非所有循环引用都会引起加载问题，如果两个模块只是使用对方的类型声明，没有使用继承/构造行为，是允许的。
    这里忽略这类情况。
*/
const ignoreCirclarDependencyWarnings = true;

const onwarn = warning => {
    let msg = warning.message;
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
        if (ignoreCirclarDependencyWarnings)
            return;

        let arr = msg.split("->");
        arr = arr.map(e => {
            e = e.trim();
            return path.basename(e, path.extname(e));
        });
        msg = arr.join(" -> ");
        msg = "(C_D) " + msg;
    }

    console.warn(msg);
}

gulp.task('compileLayaAir', () => {
    rimrafSync(tscOutPath + 'layaAir');

    const proj = gulpts.createProject("./src/layaAir/tsconfig.json", {
        removeComments: true,
    });

    return merge(
        proj.src()
            .pipe(sourcemaps.init())
            .pipe(proj())
            .pipe(sourcemaps.write('.', { sourceRoot: './', includeContent: false }))
            .pipe(gulp.dest(tscOutPath + 'layaAir')),

        gulp.src([
            './src/layaAir/**/*.vs',
            './src/layaAir/**/*.fs',
            './src/layaAir/**/*.glsl',
            './src/layaAir/**/*.wgsl'], { base: "src" })
            .pipe(gulp.dest(tscOutPath))
    );
});

gulp.task('compileExtension', () => {
    rimrafSync(tscOutPath + 'extensions');
    const proj = gulpts.createProject("./src/extensions/tsconfig.json", {
        removeComments: true
    });
    return proj.src().pipe(proj()).pipe(gulp.dest(tscOutPath + 'extensions'));
});

gulp.task('compile', gulp.series('compileLayaAir', 'compileExtension'));

gulp.task("buildJs", async () => {
    rimrafSync("./build/libs");

    const rootPath = process.cwd();
    const outPath = path.join(rootPath, tscOutPath);
    const mentry = '[entry]';

    function myMultiInput(pkgDef, files, fileSet) {
        return {
            resolveId(id, importer) {
                if (id === mentry)
                    return mentry;

                if (importer == null)
                    return;

                var ext = path.extname(id);
                if (ext == ".js" || ext == "") {
                    var importfile = path.join(importer === mentry ? rootPath : path.dirname(importer), id);
                    if (ext == "")
                        importfile += ".js";

                    if (!fileSet.has(importfile)) {
                        if (pkgDef.libName == "core")
                            console.warn(`external: ${path.relative(outPath, importer)} ==> ${path.relative(outPath, importfile)}`);
                        return { id: 'Laya', external: true };
                    }
                }
            },

            load(id) {
                if (id === mentry)
                    return files.map(ele => `export * from ${JSON.stringify(tscOutPath + ele)};`).join('\n');
            }
        };
    }

    async function getFiles(input) {
        var include = [];
        var exclude = [];

        if (typeof input === 'string') {
            include = [input];
        } else if (Array.isArray(input)) {
            include = input;
        } else {
            include = input.include || [];
            exclude = input.exclude || [];
        }

        var patterns = include.concat(exclude.map(function (pattern) {
            return '!' + pattern;
        }));

        return matched.promise(patterns, { cwd: path.join(process.cwd(), "./src"), realpath: false });
    }

    for (let i = 0; i < packsDef.length; ++i) {
        let files = await getFiles(packsDef[i].input);

        files = files.filter(ele => ele.endsWith(".ts")).map(ele => ele = ele.substring(0, ele.length - 3) + ".js");
        let fileSet = new Set(files.map(ele => path.normalize(outPath + ele)));

        let config = {
            input: mentry,
            output: {
                extend: true,
                globals: { 'Laya': 'Laya' }
            },
            external: ['Laya'],
            onwarn: onwarn,
            plugins: [
                myMultiInput(packsDef[i], files, fileSet),
                rollupSourcemaps(),
                glsl({
                    include: /.*(.glsl|.vs|.fs)$/,
                    sourceMap: sourcemap,
                    compress: false
                })
            ],
        };

        let outputOption = {
            file: path.join("./build/libs", "laya." + packsDef[i].libName + ".js"),
            format: 'iife',
            esModule: false,
            name: 'Laya',
            globals: { 'Laya': 'Laya' },
            sourcemap: sourcemap
        };
        if (packsDef[i].libName != "core")
            outputOption.extend = true;

        const bundle = await rollup.rollup(config);
        await bundle.write(outputOption);
    }

    return merge(
        packsDef.map(pack => {
            return gulp.src(path.join("./build/libs", "laya." + pack.libName + ".js"))
                .pipe(inject.replace(/var Laya = \(function \(exports\)/, "window.Laya = (function (exports)"))
                .pipe(inject.replace(/\(this.Laya = this.Laya \|\| {}, Laya\)/, "(window.Laya = window.Laya || {}, Laya)"))
                .pipe(gulp.dest(process.platform == 'darwin' ? './build/libs' : '.')); //在win下dest竟然突然变成src的相对目录
        }),
    );
});

//拷贝引擎的第三方js库
gulp.task("copyJsLibs", async () => {
    return gulp.src([
        './src/layaAir/jsLibs/laya.physics3D.wasm.wasm', './src/layaAir/jsLibs/*.js',
        '!./src/layaAir/jsLibs/{box2d.js,cannon.js}'])
        .pipe(gulp.dest('./build/libs'));
});

//合并physics 和 box2d
gulp.task('concatBox2dPhysics', () => {
    return gulp.src([
        './src/layaAir/jsLibs/box2d.js',
        './build/libs/laya.physics.js'])
        .pipe(concat('laya.physics.js'))
        .pipe(gulp.dest('./build/libs/'));
});

gulp.task("compressJs", () => {
    // 修改laya.physics3D.wasm-wx.js 里的路径
    function changeWxWasmPath() {
        var stream = new Stream.Transform({ objectMode: true });
        stream._transform = function (originalFile, unused, callback) {
            let fPath = originalFile.path;
            if (fPath.indexOf('laya.physics3D.wasm-wx.js') >= 0 || fPath.indexOf('laya.physics3D.wasm.js') >= 0) {
                var stringData = String(originalFile.contents);
                stringData = stringData.replace('libs/laya.physics3D.wasm.wasm', 'libs/min/laya.physics3D.wasm.wasm');
                var file = originalFile.clone({ contents: false });
                var finalBinaryData = Buffer.from(stringData);
                file.contents = finalBinaryData;
                callback(null, file);
            }
            else {
                callback(null, originalFile);
            }
        };
        return stream;
    }

    return merge(
        gulp.src("./build/libs/laya.physics3D.js")
            .pipe(rename({ extname: ".min.js" }))
            .pipe(gulp.dest("./build/libs/min")),

        gulp.src("./build/libs/laya.physics3D.wasm.wasm")
            .pipe(gulp.dest("./build/libs/min")),

        gulp.src(["./build/libs/*.js", "!./build/libs/{laya.physics3D.js}"])
            .pipe(uglify({
                mangle: {
                    keep_fnames: true
                }
            }))
            .on('error', function (err) {
                console.warn(err.toString());
            })
            .pipe(changeWxWasmPath())
            .pipe(rename({ extname: ".min.js" }))
            .pipe(gulp.dest("./build/libs/min"))
    );
});

gulp.task('genDts', () => {
    rimrafSync("./build/temp");
    rimrafSync("./build/types");

    async function genDts() {
        const dtsContents = [];
        const dtsContentsTop = [];
        const SyntaxKind = ts.SyntaxKind;

        function processTree(sourceFile, rootNode, replacer) {
            let code = '';
            let cursorPosition = rootNode.pos;

            function skip(node) {
                cursorPosition = node.end;
            }

            function readThrough(node) {
                code += sourceFile.text.slice(cursorPosition, node.pos);
                cursorPosition = node.pos;
            }

            function visit(node) {
                readThrough(node);

                const replacement = replacer(node);

                if (replacement != null) {
                    code += replacement;
                    skip(node);
                }
                else {
                    ts.forEachChild(node, visit);
                }
            }

            visit(rootNode);
            code += sourceFile.text.slice(cursorPosition, rootNode.end);

            return code;
        }

        let files = await matched.promise("./build/temp/**/*.d.ts", { realpath: true, nosort: false });
        for (let file of files) {
            let inNamespace = !file.endsWith("Laya.d.ts") && !file.endsWith("Laya3D.d.ts");
            let code = fs.readFileSync(file, "utf-8");
            let declarationFile = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);

            function visitNode(node) {
                if (node.kind == SyntaxKind.ImportDeclaration || node.kind == SyntaxKind.ImportEqualsDeclaration) { //删除所有import语句
                    return '';
                }
                else if (node.kind == SyntaxKind.ExportDeclaration) { //something like "export xx;"
                    return '';
                }
                else if (node.kind == SyntaxKind.ExportKeyword) { //删除所有export语句
                    let code = declarationFile.text.slice(node.pos, node.end);
                    return code.substring(0, code.length - 6);
                }
                else if (node.kind == SyntaxKind.DeclareKeyword && inNamespace) { //删除declare
                    return '';
                }
                else if (node.kind == SyntaxKind.TypeReference) {
                    let code = declarationFile.text.slice(node.pos, node.end);
                    code = code.substring(1);
                    if (!inNamespace && code.indexOf(".") == -1 && !code.startsWith("Promise"))
                        return " Laya." + code;
                    else if (code.startsWith("glTF."))
                        return " " + code.substring(5);
                }
                //console.log(node.kind, node.parent?.kind, node.text);
            }

            const content = processTree(declarationFile, declarationFile, visitNode).trimEnd();
            if (content.length == 0)
                continue;

            if (inNamespace) {
                let lines = content.split("\n");
                dtsContents.push(lines.map(l => "    " + l).join("\n"));
            }
            else
                dtsContentsTop.push(content);
        }

        //pretty print
        let code = dtsContentsTop.join("\n\n") +
            "\n\ndeclare module Laya {\n\n" +
            dtsContents.join("\n\n") +
            "\n\n}";

        let declarationFile = ts.createSourceFile("./build/types/LayaAir.d.ts", code, ts.ScriptTarget.Latest, true);
        code = ts.createPrinter().printFile(declarationFile);

        fs.writeFileSync("./build/types/LayaAir.d.ts", code);

        rimrafSync("./build/temp");
    }

    const proj = gulpts.createProject("./src/layaAir/tsconfig.json", {
        declaration: true,
        removeComments: false,
    });

    return merge(
        proj.src().pipe(proj()).dts.pipe(gulp.dest("./build/temp")).on("end", genDts),

        gulp.src(['./src/layaAir/tslibs/*.*']).pipe(gulp.dest('./build/types')),
    );
});

gulp.task('build',
    gulp.series('compile', 'buildJs', 'copyJsLibs',
        'concatBox2dPhysics',
        'genDts'));

gulp.task('buildAndCompress', gulp.series(gulp.series('build', 'compressJs')));
