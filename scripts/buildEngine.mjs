import fs from "fs";
import path from "path";
import { glob } from "glob";
import ts from "typescript";
import { rimrafSync } from "rimraf";
import { Project } from "ts-morph";
import { rollup } from "rollup";
import rollupSourcemaps from "rollup-plugin-sourcemaps";
import glsl from "rollup-plugin-glsl";
import { shellExec, onRollupWarn } from "./utils.mjs";
import { allBundles } from "./config.mjs";

const tscOutPath = "./bin/tsc/";
const buildOutPath = "./build/libs/";

const ignoreCircularDependencyWarnings = process.argv.indexOf("-cd") == -1;

buildBundles().then(buildDeclarations);

async function buildBundles() {
    console.log("compiling...");
    console.time("completed");

    rimrafSync(tscOutPath + 'layaAir');
    rimrafSync(tscOutPath + 'extensions');

    const proj = new Project({
        compilerOptions: { removeComments: true, outDir: tscOutPath + 'layaAir' },
        tsConfigFilePath: "./src/layaAir/tsconfig.json"
    });

    await proj.emit();

    shellExec("npx", ["copyfiles", "-u", "1", "./src/**/*.{glsl,vs,fs,wgsl}", "./bin/tsc/"]);

    console.timeEnd("completed");

    console.log("building bundles...");
    console.time("completed");

    rimrafSync(buildOutPath);

    const rootPath = process.cwd();
    const outPath = path.join(rootPath, tscOutPath);
    const mentry = 'entry-';

    function myMultiInput(libName, files, fileSet) {
        return {
            resolveId(id, importer) {
                if (id.startsWith(mentry))
                    return id;

                if (importer == null)
                    return;

                var ext = path.extname(id);
                if (ext == ".js" || ext == "") {
                    var importfile = path.join(importer.startsWith(mentry) ? rootPath : path.dirname(importer), id);
                    if (ext == "")
                        importfile += ".js";

                    if (!fileSet.has(importfile)) {
                        if (libName == "core")
                            console.warn(`external: ${path.relative(outPath, importer)} ==> ${path.relative(outPath, importfile)}`);
                        return {
                            id: 'Laya',
                            external: true
                        };
                    }
                }
            },

            load(id) {
                if (id.startsWith(mentry))
                    return files.map(ele => `export * from ${JSON.stringify(tscOutPath + ele)};`).join('\n');
            }
        };
    }

    for (let bundleDef of allBundles) {
        let files = await glob(bundleDef.input.map(e => "./layaAir/" + e), { cwd: path.join(process.cwd(), "./src"), realpath: false });
        files.sort();
        files = files.filter(ele => ele.endsWith(".ts"))
            .map(ele => ele = ele.substring(0, ele.length - 3) + ".js");
        let fileSet = new Set(files.map(ele => path.normalize(outPath + ele)));

        let config = {
            input: mentry + bundleDef.name,
            output: {
                extend: true,
                globals: {
                    'Laya': 'Laya'
                }
            },
            external: ['Laya'],
            onwarn: onRollupWarn(ignoreCircularDependencyWarnings),
            plugins: [
                myMultiInput(bundleDef.name, files, fileSet),
                rollupSourcemaps(),
                glsl({
                    include: /.*(.glsl|.vs|.fs)$/,
                    sourceMap: true,
                    compress: false
                })
            ],
        };

        let outFile = path.join(buildOutPath, "laya." + bundleDef.name + ".js");
        let outputOption = {
            file: outFile,
            format: 'iife',
            esModule: false,
            name: 'Laya',
            globals: {
                'Laya': 'Laya'
            },
            sourcemap: true
        };
        if (bundleDef.name != "core")
            outputOption.extend = true;

        console.log("created " + bundleDef.name);
        const bundle = await rollup(config);
        await bundle.write(outputOption);

        let content = await fs.promises.readFile(outFile, "utf-8");
        content = content.replace(/var Laya = \(function \(exports.*\)/, "window.Laya = (function (exports)");
        content = content.replace(/}\)\({}, Laya\);/, "})({});");
        content = content.replace(/Laya\$1\./g, "exports.");
        content = content.replace(/\(this.Laya = this.Laya \|\| {}, Laya\)/, "(window.Laya = window.Laya || {}, Laya)");
        await fs.promises.writeFile(outFile, content);

        if (bundleDef.copy)
            shellExec("npx", ["copyfiles", "-f", ...bundleDef.copy.map(e => "./src/layaAir/" + e), buildOutPath]);
        if (bundleDef.output) {
            let source = Buffer.from(content + "\n", "utf-8");
            for (let k in bundleDef.output) {
                let result = source;
                for (let file of bundleDef.output[k]) {
                    let buf = await fs.promises.readFile("./src/layaAir/" + file);
                    result = Buffer.concat([result, buf]);
                }
                await fs.promises.writeFile(path.join(buildOutPath, k), result);
            }
        }
    }

    console.timeEnd("completed");
}

async function buildDeclarations() {
    console.log("building declarations...");
    console.time("completed");

    rimrafSync("./build/types");
    fs.mkdirSync("./build/types", { recursive: true });

    const proj = new Project({
        compilerOptions: { removeComments: false, declaration: true },
        tsConfigFilePath: "./src/layaAir/tsconfig.json",
    });
    let emitResult = proj.emitToMemory({ emitOnlyDtsFiles: true });

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

    let files = emitResult.getFiles();
    files.sort((a, b) => a.filePath.localeCompare(b.filePath));
    for (let file of files) {
        let inNamespace = !file.filePath.endsWith("Laya.d.ts") && !file.filePath.endsWith("Laya3D.d.ts");
        let code = file.text;
        let declarationFile = ts.createSourceFile(file.filePath, code, ts.ScriptTarget.Latest, true);

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
        "\n\ndeclare namespace Laya {\n\n" +
        dtsContents.join("\n\n") +
        "\n\n}";

    let declarationFile = ts.createSourceFile("./build/types/LayaAir.d.ts", code, ts.ScriptTarget.Latest, true);
    code = ts.createPrinter().printFile(declarationFile);

    fs.writeFileSync("./build/types/LayaAir.d.ts", code);

    shellExec("npx", ["copyfiles", '-f', './src/layaAir/tslibs/*.*', './build/types']);

    console.timeEnd("completed");
}