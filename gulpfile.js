const path = require('path');
const fs = require('fs');
const rimrafSync = require('rimraf').sync;
const matched = require('matched');
const ts = require('typescript');
const gulp = require('gulp');
const gulpts = require('gulp-typescript');
const concat = require('gulp-concat');
const inject = require('gulp-inject-string');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('rollup');
const glsl = require('rollup-plugin-glsl');
const rollupSourcemaps = require('rollup-plugin-sourcemaps');
const merge = require('merge2');

const tscOutPath = "./bin/tsc/";
const sourcemap = true;

//引用插件模块
const typescript = require('rollup-plugin-typescript2'); //typescript2 plugin
const samplesBathURL = './src/samples';

//编译新的库文件只需要在packsDef中配置一下新的库就可以了
const packsDef = [{
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

            // './layaAir/laya/RenderEngine/**/*.*',
            './layaAir/laya/RenderEngine/RenderEngine/NativeGLEngine/**/*.*',
            './layaAir/laya/RenderEngine/RenderEngine/WebGLEngine/**/*.*',
            // './layaAir/laya/RenderEngine/RenderEngine/WebGPUEngine/**/*.*',
            './layaAir/laya/RenderEngine/RenderEnum/**/*.*',
            './layaAir/laya/RenderEngine/RenderInterface/**/*.*',
            './layaAir/laya/RenderEngine/RenderShader/**/*.*',
            './layaAir/laya/RenderEngine/*.*',

            './layaAir/laya/renders/**/*.*',
            './layaAir/laya/resource/**/*.*',
            './layaAir/laya/system/**/*.*',
            './layaAir/laya/utils/**/*.*',
            './layaAir/laya/html/**/*.*',
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
            './layaAir/laya/d3/ModuleDef.ts',
            //'./layaAir/laya/d3/RenderObjs/**/*.*',
            './layaAir/laya/d3/RenderObjs/NativeOBJ/*.*',
            './layaAir/laya/d3/RenderObjs/RenderObj/*.*',
            './layaAir/laya/d3/RenderObjs/IRenderEngine3DOBJFactory.ts',
            './layaAir/laya/d3/RenderObjs/Laya3DRender.ts',
            './layaAir/laya/d3/ModuleDef.ts',
            './layaAir/ILaya3D.ts',
            './layaAir/Laya3D.ts',
            // interface and enum
            './layaAir/laya/Physics3D/interface/**/*.*',
            './layaAir/laya/Physics3D/physicsEnum/**/*.*',
            './layaAir/laya/d3/physics/HitResult.ts',
            './layaAir/laya/d3/physics/PhysicsSettings.ts',
            './layaAir/laya/d3/physics/Collision.ts',
            './layaAir/laya/d3/physics/ContactPoint.ts',
        ],
    },
    {
        'libName': "physics3D",
        'input': [
            './layaAir/laya/d3/physics/constraints/**/*.*',
            './layaAir/laya/d3/physics/shape/**/*.*',
            './layaAir/laya/d3/physics/ModuleDef.ts',
            './layaAir/laya/d3/physics/CharacterController.ts',
            './layaAir/laya/d3/physics/Constraint3D.ts',
            './layaAir/laya/d3/physics/PhysicsCollider.ts',
            './layaAir/laya/d3/physics/PhysicsColliderComponent.ts',
            './layaAir/laya/d3/physics/PhysicsUpdateList.ts',
            './layaAir/laya/d3/physics/RaycastVehicle.ts',
            './layaAir/laya/d3/physics/RaycastWheel.ts',
            './layaAir/laya/d3/physics/Rigidbody3D.ts',
        ],
    },
    {
        'libName': "gltf",
        'input': [
            './layaAir/laya/gltf/**/*.*',
        ],
    },
    {
        'libName': "bullet",
        'input': [
            // use this compile order to solve C_D problem
            './layaAir/laya/Physics3D/Bullet/btPhysicsCreateUtil.ts',
            './layaAir/laya/Physics3D/Bullet/Collider/**/*.*',
            './layaAir/laya/Physics3D/Bullet/Shape/**/*.*',
            './layaAir/laya/Physics3D/Bullet/Joint/**/*.*',
            './layaAir/laya/Physics3D/Bullet/btInteractive.ts',
            './layaAir/laya/Physics3D/Bullet/CollisionTool.ts',
            './layaAir/laya/Physics3D/Bullet/btPhysicsManager.ts',
            './layaAir/laya/Physics3D/Bullet/**/*.*',
        ],
    },
    {
        'libName': "physX",
        'input': [
            './layaAir/laya/Physics3D/PhysX/pxPhysicsCreateUtil.ts',
            './layaAir/laya/Physics3D/PhysX/Collider/**/*.*',
            './layaAir/laya/Physics3D/PhysX/Shape/**/*.*',
            './layaAir/laya/Physics3D/PhysX/Joint/**/*.*',
            './layaAir/laya/Physics3D/PhysX/pxPhysicsManager.ts',
            './layaAir/laya/Physics3D/PhysX/pxPhysicsMaterial.ts',
            './layaAir/laya/Physics3D/PhysX/**/*.*',
        ],
    },
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
        'libName': 'physics2D',
        'input': [
            './layaAir/laya/physics/Collider2D/*.*',
            './layaAir/laya/physics/joint/*.*',
            './layaAir/laya/physics/IPhysiscs2DFactory.ts',
            './layaAir/laya/physics/ModuleDef.ts',
            './layaAir/laya/physics/Physics2D.ts',
            './layaAir/laya/physics/Physics2DOption.ts',
            './layaAir/laya/physics/RigidBody.ts',
            './layaAir/laya/physics/RigidBody2DInfo.ts',
            './layaAir/laya/physics/Physics2DDebugDraw.ts',
        ],
    },

    {
        'libName': 'box2D',
        'input': [
            './layaAir/laya/physics/factory/physics2DwasmFactory.ts',
        ],
    },
    {
        'libName': 'box2D.wasm',
        'input': [
            './layaAir/laya/physics/factory/physics2DwasmFactory.ts',
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
        console.warn(msg);
    } else
        console.warn(warning);
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
        .pipe(sourcemaps.write('.', {
            sourceRoot: './',
            includeContent: false
        }))
        .pipe(gulp.dest(tscOutPath + 'layaAir')),

        gulp.src([
            './src/layaAir/**/*.vs',
            './src/layaAir/**/*.fs',
            './src/layaAir/**/*.glsl',
            './src/layaAir/**/*.wgsl'
        ], {
            base: "src"
        })
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
                        return {
                            id: 'Laya',
                            external: true
                        };
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

        return matched.promise(patterns, {
            cwd: path.join(process.cwd(), "./src"),
            realpath: false
        });
    }

    for (let i = 0; i < packsDef.length; ++i) {
        let files = await getFiles(packsDef[i].input);

        files = files.filter(ele => ele.endsWith(".ts")).map(ele => ele = ele.substring(0, ele.length - 3) + ".js");
        let fileSet = new Set(files.map(ele => path.normalize(outPath + ele)));

        let config = {
            input: mentry,
            output: {
                extend: true,
                globals: {
                    'Laya': 'Laya'
                }
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
            globals: {
                'Laya': 'Laya'
            },
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
                .pipe(inject.replace(/var Laya = \(function \(exports.*\)/, "window.Laya = (function (exports)"))
                .pipe(inject.replace(/}\)\({}, Laya\);/, "})({});"))
                .pipe(inject.replace(/Laya\$1\./g, "exports."))
                .pipe(inject.replace(/\(this.Laya = this.Laya \|\| {}, Laya\)/, "(window.Laya = window.Laya || {}, Laya)"))
                .pipe(gulp.dest(process.platform == 'win32' ? '.' : './build/libs')); //在win下dest竟然突然变成src的相对目录
        }),
    );
});

//拷贝引擎的第三方js库
gulp.task("copyJsLibs", async () => {
    return gulp.src([
            './src/layaAir/jsLibs/bullet.wasm',
            './src/layaAir/jsLibs/*.js',
            './src/layaAir/jsLibs/physx.release.wasm',
            './src/layaAir/jsLibs/laya.Box2D.wasm.wasm',
            '!./src/layaAir/jsLibs/{laya.Box2D.js,cannon.js,bullet.js,physx.release.js,laya.Box2D.wasm.js,bullet.wasm.js,physx.wasm.js,physx.release.js.mem}'
        ])
        .pipe(gulp.dest('./build/libs'));
});

//合并physics2D 和 box2d
gulp.task('buildBox2dPhysics', () => {
    return gulp.src([
            './build/libs/laya.box2D.js',
            './src/layaAir/jsLibs/laya.Box2D.js',
        ]).pipe(concat('laya.box2D.js'))
        .pipe(gulp.dest('./build/libs/'));
});

gulp.task('buildBox2dWasmPhysics', () => {
    return gulp.src([
            './build/libs/laya.box2D.wasm.js',
            './src/layaAir/jsLibs/laya.Box2D.wasm.js',
        ]).pipe(concat('laya.box2D.wasm.js'))
        .pipe(gulp.dest('./build/libs/'));
});


//合并bullet物理引擎库 和 编译出来的physics.bullet.js
gulp.task('buildBulletPhysics', () => {
    return gulp.src([
            './build/libs/laya.bullet.js',
            './src/layaAir/jsLibs/bullet.js',
        ]).pipe(concat('laya.bullet.js'))
        .pipe(gulp.dest('./build/libs/'));
});

//合并bullet的wasm物理库 和 编译出来的physics.bullet.js
gulp.task('buildBulletWASMPhysics', () => {
    return gulp.src([
            './build/libs/laya.bullet.js',
            './src/layaAir/jsLibs/bullet.wasm.js',
        ]).pipe(concat('laya.bullet.wasm.js'))
        .pipe(gulp.dest('./build/libs/'));
});

//合并physX的wasm物理引擎库 和 编译出来的physics.physX.js
gulp.task('buildPhysXWASMPhysics', () => {
    return gulp.src([
            './build/libs/laya.physX.js',
            './src/layaAir/jsLibs/physx.wasm.js',
        ])
        .pipe(concat('laya.physX.wasm.js'))
        .pipe(gulp.dest('./build/libs/'));
});

//合并physX物理引擎库 和 编译出来的physics.physX.js
gulp.task('buildPhysXPhysics', () => {
    return gulp.src([
            './build/libs/laya.physX.js',
            './src/layaAir/jsLibs/physx.release.js',
        ])
        .pipe(concat('laya.physX.js'))
        .pipe(gulp.dest('./build/libs/'));
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
                } else {
                    ts.forEachChild(node, visit);
                }
            }

            visit(rootNode);
            code += sourceFile.text.slice(cursorPosition, rootNode.end);

            return code;
        }

        let files = await matched.promise("./build/temp/**/*.d.ts", {
            realpath: true,
            nosort: false
        });
        for (let file of files) {
            let inNamespace = !file.endsWith("Laya.d.ts") && !file.endsWith("Laya3D.d.ts");
            let code = fs.readFileSync(file, "utf-8");
            let declarationFile = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);

            function visitNode(node) {
                if (node.kind == SyntaxKind.ImportDeclaration || node.kind == SyntaxKind.ImportEqualsDeclaration) { //删除所有import语句
                    return '';
                } else if (node.kind == SyntaxKind.ExportDeclaration) { //something like "export xx;"
                    return '';
                } else if (node.kind == SyntaxKind.ExportKeyword) { //删除所有export语句
                    let code = declarationFile.text.slice(node.pos, node.end);
                    return code.substring(0, code.length - 6);
                } else if ((node.kind == SyntaxKind.DeclareKeyword || node.kind == SyntaxKind.ModuleDeclaration) && inNamespace) { //删除declare
                    return '';
                } else if (node.kind == SyntaxKind.TypeReference) {
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
            } else
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
    gulp.series(
        'compile',
        'buildJs',
        'copyJsLibs',
        'buildBox2dPhysics',
        'buildBox2dWasmPhysics',
        'buildBulletWASMPhysics',
        'buildBulletPhysics',
        'buildPhysXWASMPhysics',
        'buildPhysXPhysics',
        'genDts',
    ));



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
    let dirname = __dirname; //process.cwd();
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
        load(id) {},
        resolveId(id, importer) {
            if (!importer)
                return;
            if (!layafiles) // 不收集laya文件，表示是整体打包。不排除laya文件
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
            } else {}
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

let baseurl = __dirname;
let layaFiles = [
    path.join(baseurl, "./src/", "layaAir", "Laya.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "net", "HttpRequest.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "resource", "Resource.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "resource", "Texture.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "media", "SoundChannel.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "events", "EventDispatcher.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "utils", "Browser.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "utils", "RunDriver.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "display", "Input.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "net", "Loader.ts"),
    path.join(baseurl, "./src/", "layaAir", "laya", "net", "LocalStorage.ts"),
    path.join(baseurl, "./src/", "layaAir", "Config.ts"),
];
let layaexpreplace = '//__LAYARPLACEMENTHERE__//';

var curPackFiles = null; //当前包的所有的文件
var mentry = 'multientry.ts';

function mySamplesMultiInput(options) {
    let packPath = options ? options.path : null; // 除了制定输入以外，这个目录下的也可以认为是内部文件，可以引用
    if (packPath && !path.isAbsolute(packPath)) {
        packPath = path.join(__dirname, packPath);
    }

    function pathInPack(p) {
        if (!packPath)
            return true; // 没有设置，则认为true，
        let r = path.relative(packPath, p);
        if (r.startsWith('..')) //TODO 如果盘符都变了这样是不对的
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
    return ({
        options(options) {
            configure(options.input);
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
                if (!include.length) {
                    return Promise.resolve('');
                }

                var patterns = include.concat(exclude.map(function (pattern) {
                    return '!' + pattern;
                }));
                return matched.promise(patterns, {
                    realpath: true
                }).then(function (paths) {
                    curPackFiles = paths; // 记录一下所有的文件
                    return paths.map(exporter).join('\n');
                });
            } else {
                // console.log('load ',id);
            }
        }
    });
}

gulp.task('compileSamples', async (cb) => {
    let bundleobj = {
        tsconfig: samplesBathURL + '/tsconfig.json',
        check: false, //Set to false to avoid doing any diagnostic checks on the code
        tsconfigOverride: {
            compilerOptions: {
                removeComments: true
            }
        },
        include: samplesBathURL + "/**/*.ts"
    }

    await rollup.rollup({
        input: samplesBathURL + '/index.ts',
        treeshake: false, //建议忽略
        onwarn: (waring, warn) => {
            if (ignoreCirclarDependencyWarnings) {
                return
            } else {
                console.log("warnning Circular dependency:");
                console.log(waring);
            }
        },
        external: ['Laya'],
        plugins: [
            //mySamplesMultiInput(),
            layaExpPlugin({
                baseUrl: './src/layaAir',
                layaPath: './src/layaAir', // 收集需要的laya文件
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
        console.log("write bundle!")
        return bundle.write({
            file: './bin/rollUp/bundle.js',
            format: 'iife',
            name: 'Laya',
            extend: true,
            globals: {
                'Laya': 'Laya'
            },
            sourcemap: false,
            banner: 'window.Laya=window.Laya||{};\n',
        });
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
    }

    await rollup.rollup({
        input: layaFiles,
        onwarn: (waring, warn) => {
            if (ignoreCirclarDependencyWarnings) {
                return
            } else {
                console.log("warnning Circular dependency:");
                console.log(waring);
            }
        },
        treeshake: false, //建议忽略
        plugins: [
            mySamplesMultiInput({
                path: './src/layaAir'
            }),
            typescript(layaobj),
            glsl({
                include: /.*(.glsl|.vs|.fs)$/,
                sourceMap: false,
                compress: false
            }),
        ]
    }).then(bundle => {
        console.log("write laya");
        return bundle.write({
            file: './bin/rollUp/laya.js',
            format: 'iife',
            name: 'Laya',
            sourcemap: false,
            //banner: 'window.Laya=window.Laya||{};\n',
        });
    }).catch(err => {
        console.log(err);
    });

    console.timeEnd("compile laya");
    cb();
});

gulp.task('changeLayaJS', (cb) => {
    // 发布时调用编译功能，判断是否点击了编译选项
    let layajsPath = path.join("./", "bin/rollUp", "laya.js");
    let layajsCon = fs.readFileSync(layajsPath, "utf8");
    layajsCon = layajsCon.replace(/^var Laya = /mg, "");
    layajsCon = layajsCon.replace(/\({}\);\s*\n*$/mg, "(window.Laya = window.Laya || {});");
    fs.writeFileSync(layajsPath, layajsCon, "utf8");
    cb();
});

gulp.task('buildSamples',
    gulp.series(
        'compileSamples',
        'changeLayaJS',
    ));