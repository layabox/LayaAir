import fs from "fs";
import path from "path";
import { rimrafSync } from "rimraf";
import typedoc, { OptionDefaults } from "typedoc";

const outDir = "./build/apidoc";
const htmlOutDir = path.join(outDir, "classes");
const docDir = "./build/api-temp";
const ourTags = ["@en", "@zh", "@perfTag"];

/*** map */
const types = {
    "topLevel": ["Core", "TopLevel"],
    "ani": ["2D", "Animation"],
    "components": ["Core", "Component"],
    "d3_animation": ["3D", "Animation"],
    "d3_component": ["3D", "Component"],
    "d3_core": ["3D", "Core"],
    "d3_depthmap": ["3D", "DepthMap"],
    "d3_graphics": ["3D", "RenderGraphics"],
    "d3_loaders": ["3D", "Loaders"],
    "d3_math": ["3D", "Math"],
    "d3_physics": ["3D", "BulletPhysics"],
    "d3_renderobjs": ["3D", "RenderObjs"],
    "d3_resource": ["3D", "Resource"],
    "d3_shader": ["3D", "Shader"],
    "d3_shadowmap": ["3D", "ShadowMap"],
    "d3_text": ["3D", "RenderGraphics"],
    "d3_utils": ["3D", "Utils"],
    "d3_webxr": ["3D", "WebXR"],
    "device": ["Core", "device"],
    "display": ["Core", "display"],
    "effect": ["Core", "Effect"],
    "events": ["Core", "Event"],
    "filters": ["2D", "Filter"],
    "gltf": ["3D", "GLTF"],
    "html": ["2D", "HTMLText"],
    "layagl": ["Core", "LayaGL"],
    "loaders": ["Core", "Loaders"],
    "map": ["2D", "TiledMap"],
    "maths": ["2D", "Math"],
    "media": ["Core", "Media"],
    "net": ["Core", "Net"],
    "particle": ["2D", "Particle"],
    "physics": ["2D", "Physics"],
    "renderengine": ["Exclude", ""],
    "renders": ["Core", "Renders"],
    "resource": ["Core", "Resource"],
    "spine": ["2D", "Spine"],
    "system": ["Core", "System"],
    "ui": ["2D", "UI"],
    "utils": ["Core", "Utils"],
    "webgl": ["Exclude", ""],
    "const": ["Core", "Const"],
}

main();

async function main() {
    rimrafSync(docDir);
    rimrafSync(outDir);

    fs.mkdirSync(outDir);
    fs.mkdirSync(htmlOutDir);

    const app = await typedoc.Application.bootstrapWithPlugins({
        excludePrivate: true,
        excludeProtected: true,
        hideGenerator: true,
        theme: "default",
        exclude: "node",
        entryPointStrategy: "Expand",
        blockTags: [...OptionDefaults.blockTags, ...ourTags],
        entryPoints: ["./src/layaAir/"], // 入口文件或目录
        tsconfig: "./src/layaAir/tsconfig.json",
    });

    const project = await app.convert();
    await app.generateDocs(project, docDir);

    //解析enums
    let dir = path.join(docDir, "enums");
    let dirs = loaddir(dir);
    copyHtml(dirs, dir, "enums.");

    dir = path.join(docDir, "interfaces");
    dirs = loaddir(dir);
    copyHtml(dirs, dir, "interfaces.");

    dir = path.join(docDir, "classes");
    dirs = loaddir(dir);
    copyHtml(dirs, dir, "");

    createJS();

    rimrafSync(docDir);
}

function loaddir(dir) {
    // console.log(dir)
    let stat;
    try {
        stat = fs.statSync(dir)
    } catch (err) { }
    if (!stat || !stat.isDirectory()) {
        return null
    }
    try {
        let fils = fs.readdirSync(dir);;
        return fils;
    } catch (err) {
        return null;
    }
}

async function copyHtml(dirs, lasturl, nameHead) {
    // console.log(dirs);
    if (dirs) {
        // if (dirs.indexOf("tsconfig.json")==-1) {
        for (let index = 0; index < dirs.length; index++) {
            let url = dirs[index]
            let from = path.join(lasturl, url);
            let urlArr = url.split("_");
            urlArr[urlArr.length - 2] = urlArr[urlArr.length - 1].split(".")[1];
            let newUrl = nameHead + (urlArr.join("_"));
            let to = path.join(htmlOutDir, newUrl);
            let fileStr = fs.readFileSync(from, "utf8");
            fileStr = fileStr.replace(new RegExp(`${url}`, "g"), newUrl);
            try {
                fs.writeFileSync(to, fileStr, "utf8");
            } catch (err) {
                console.log(err);
            }
        }
    }
}

const getFullType = function (name) {
    if (types[name]) {
        return types[name]
    } else {
        return ["", ""]
    }
}

function getFirstToUp(name) {
    return name.slice(0, 1).toUpperCase() + name.slice(1)
}
var tmpObj = {};
//
var startStr = "<title>";
var endStr = " | layaair</title>";

function createJS() {
    let dirs = loaddir(htmlOutDir);
    let url, urlArr, file, className;
    for (let i = 0; i < dirs.length; i++) {
        url = dirs[i];
        urlArr = url.split("_");
        file = fs.readFileSync(path.join(htmlOutDir, url), "utf8");
        className = file.substring(file.indexOf(startStr) + 7, file.indexOf(endStr));
        // console.log(className);
        let startIndex = 0;
        let pkg = "";
        let typeName = "";
        let fulltype;
        if (urlArr[1] != "laya" || urlArr.length <= 3) {
            startIndex = 1
            fulltype = getFullType("topLevel");
            typeName = fulltype[0];
            pkg = fulltype[1];
        } else {
            if (urlArr.indexOf("enums.") !== -1) {
                if (urlArr.indexOf("d3") == -1) {
                    startIndex = 1;
                    fulltype = getFullType(urlArr[2]);
                } else {
                    startIndex = 1;
                    fulltype = getFullType("d3_" + urlArr[3]);
                }
                typeName = fulltype[0];
                pkg = "Enums";
            } else if (urlArr.indexOf("interfaces.") !== -1) {
                if (urlArr.indexOf("d3") == -1) {
                    startIndex = 1;
                    fulltype = getFullType(urlArr[2]);
                } else {
                    startIndex = 1;
                    fulltype = getFullType("d3_" + urlArr[3]);
                }
                typeName = fulltype[0];
                pkg = "Interfaces";
            } else {
                if (urlArr.indexOf("d3") == -1) {
                    startIndex = 1;
                    fulltype = getFullType(urlArr[2]);
                } else {
                    startIndex = 1;
                    fulltype = getFullType("d3_" + urlArr[3]);
                }
                typeName = fulltype[0];
                pkg = fulltype[1];
            }
        }

        if (typeName == "Exclude") {
            console.log("暂不输出：", url);
        } else if (pkg != "" && typeName != "") {
            let fullName = "";
            for (let j = startIndex; j < urlArr.length - 2; j++) {
                fullName += urlArr[j] + ".";
            }
            fullName += className;
            if (!tmpObj[typeName]) {
                tmpObj[typeName] = {};
            }
            if (!tmpObj[typeName][pkg]) {
                tmpObj[typeName][pkg] = [];
            }
            tmpObj[typeName][pkg].push(fullName);
        } else {
            console.log("未知包体：", url);
        }
    }
    let topstr = `
     var categories = ${JSON.stringify(Object.keys(tmpObj))};
     var classList = ${JSON.stringify(tmpObj)};
     var excludeClassList = {};
     excludeClassList["Core"] = [];
    `;
    let topObj = {};
    topObj.categories = Object.keys(tmpObj);
    topObj.classList = tmpObj;
    fs.writeFileSync(path.join(outDir, "config.json"), JSON.stringify(topObj), "utf8");
}