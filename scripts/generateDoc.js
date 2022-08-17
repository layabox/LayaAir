#!/usr/bin/env node
// var td = require('./dist/lib/cli.js');
// new td.CliApplication();
const typedoc = require("typedoc");
const app = new typedoc.CliApplication();
app.bootstrap({
    mode: "modules",
    target: "ES6",
    out:"doc",
    module: "CommonJS",
    experimentalDecorators: true,
    excludePrivate:true,
    excludeProtected:true,
    hideGenerator:true,
    theme:"default",
    ignoreCompilerErrors:true,
    stripInternal:true,
    exclude:"node",
    tsconfig:"../layaAir/tsconfig.json",
    includes:"../layaAir"
});

/* 待整理
### 需要环境：

**Typedoc@0.19.2**

**TypeScript@4.0.3**



### 发布步骤

1. 双击run.bat等待完成
2. 拷贝 `out/classes` 文件夹覆盖 `API-git\Chinese\laya\${版本号}\classes` 
3. 拷贝`out/config.json` 文件至 `API-git\Chinese\version` 文件夹下，并修改文件名未 `${版本号}.json`。
4. 在 `API-git\Chinese\script\script.js`的 `versionList` 数组中增加对应版本名称。


const fs = require("fs");
const path = require('path');
const starturl = "./doc/";
const gulp = require("gulp");
const outDir = "./out";
const htmlout = path.join(outDir,"classes");
/*** map */
var type = {
    "topLevel":["Core","TopLevel"],
    "ani":["2D","Animation"],
    "components":["Core","Component"],
    "ui":["2D","UI"],
    "d3_animation":["3D","Animation"],
    "d3_castshadowlist":["3D","Shadow"],
    "d3_component":["3D","Component"],
    "d3_core":["3D","Core"],
    "d3_graphics":["3D","RenderGraphics"],
    "d3_input3d":["3D","Input3D"],
    "d3_math":["3D","Math"],
    "d3_physicscannon":["3D","CannonPhysics"],
    "d3_physics":["3D","BulletPhysics"],
    "d3_resource":["3D","Resource"],
    "d3_shader":["3D","Shader"],
    "d3_shadowmap":["Exclude",""],
    "d3_depthmap":["Exclude",""],
    "gltf":["3D","GLTF"],
    "d3_text":["3D","RenderGraphics"],
    "d3_touch":["3D","Input3D"],
    "d3_utils":["3D","Utils"],
    "device":["Core","device"],
    "map":["2D","TiledMap"],
    "maths":["2D","Math"],
    "physics":["2D","Physics"],
    "display":["Core","display"],
    "effect":["Exclude",""],
    "events":["Core","Event"],
    "filters":["2D","Filter"],
    "html":["2D","HTMLText"],
    "layagl":["Core","LayaGL"],
    "media":["Core","Media"],
    "net":["Core","Net"],
    "particle":["2D","Particle"],
    "renders":["Core","Renders"],
    "resource":["Core","Resource"],
    "utils":["Core","Utils"],
    "webgl":["Exclude",""],
    "const":["Core","Const"],
    "system":["Core","System"]
}


function loaddir(dir){
    // console.log(dir)
    let stat;
    try{
        stat = fs.statSync(dir)
    }catch(err){}
    if(!stat||!stat.isDirectory()){
        return null
    }
    try{
        let fils = fs.readdirSync(dir);;
        return fils;
    }catch(err){
        return null;
    }
}

async function copyHtml(dirs,lasturl,nameHead){
    // console.log(dirs);
    if (dirs) {
        // if (dirs.indexOf("tsconfig.json")==-1) {
        for (let index = 0; index < dirs.length; index++) {
            let url = dirs[index]
            let from = path.join(lasturl,url);
            let urlArr = url.split("_");
            urlArr[urlArr.length - 2] = urlArr[urlArr.length -1 ].split(".")[1];
            let  newUrl = nameHead + (urlArr.join("_"));
            let to = path.join(htmlout, newUrl);
            let fileStr = fs.readFileSync(from,"utf8");
            fileStr = fileStr.replace(new RegExp(`${url}`,"g"),newUrl);
            try{
                fs.writeFileSync(to,fileStr,"utf8");
            }catch(err){
                console.log(err);
            }
        }
    }
}
const copyClass = ()=>{
    return gulp.src( path.join(starturl,"classes") +"/**/*.*").pipe(gulp.dest(htmlout));
}

const getFullType = function(name) {
    if (type[name]) {
        return type[name]
    }else{
        return ["",""]
    }
}

function getFirstToUp(name){
    return name.slice(0, 1).toUpperCase() + name.slice(1)
}
var tmpObj = {};
//
var startStr = "<title>";
var endStr = " | ts</title>";
function createJS(){
    let dirs = loaddir(htmlout);
    let url,urlArr,file,className; 
    for (let i = 0; i < dirs.length; i++) {
        url = dirs[i];
        urlArr = url.split("_");
        file = fs.readFileSync(path.join(htmlout,url),"utf8");
        className = file.substring(file.indexOf(startStr)+7,file.indexOf(endStr));
        // console.log(className);
        let startIndex = 0;
        let package = "";
        let typeName = "";
        let fulltype;
        if (urlArr[1] != "laya" || urlArr.length <=3) {
            startIndex = 1
            fulltype = getFullType("topLevel");
            typeName = fulltype[0];
            package = fulltype[1];
        }else{
            if (urlArr.indexOf("enums.") !== -1) {
                if (urlArr.indexOf("d3") == -1) {
                    startIndex = 1;
                    fulltype = getFullType(urlArr[2]);
                }else{
                    startIndex = 1;
                    fulltype = getFullType("d3_" + urlArr[3]);
                }
                typeName = fulltype[0];
                package = "Enums";
            }else if(urlArr.indexOf("interfaces.") !== -1){
                if (urlArr.indexOf("d3") == -1) {
                    startIndex = 1;
                    fulltype = getFullType(urlArr[2]);
                }else{
                    startIndex = 1;
                    fulltype = getFullType("d3_" + urlArr[3]);
                }
                typeName = fulltype[0];
                package = "Interfaces";
            }
            else{
                if (urlArr.indexOf("d3") == -1) {
                    startIndex = 1;
                    fulltype = getFullType(urlArr[2]);
                }else{
                    startIndex = 1;
                    fulltype = getFullType("d3_" + urlArr[3]);
                }
                typeName = fulltype[0];
                package = fulltype[1];
            }
        }

        if (typeName == "Exclude") {

        }else if (package != "" && typeName != "") {
            let fullName = "";
            for (let j = startIndex; j < urlArr.length - 2 ; j++) {
                fullName += urlArr[j] + ".";
            }
            fullName += className;
            if (!tmpObj[typeName]) {
                tmpObj[typeName] = {};
            }
            if (!tmpObj[typeName][package]) {
                tmpObj[typeName][package] = [];
            }
            tmpObj[typeName][package].push(fullName);
        }else{
            console.log("未知包体：",url);
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
    fs.writeFileSync(path.join(outDir,"config.json"),JSON.stringify(topObj),"utf8");
}

const copyEnumAndJS =  async (cb)=>{
    //解析enums
    let lasturl = path.join(starturl,"enums");
    let dirs = loaddir(lasturl);
    copyHtml(dirs,lasturl,"enums.");

    lasturl = path.join(starturl,"interfaces");
    dirs = loaddir(lasturl);
    copyHtml(dirs,lasturl,"interfaces.");

    lasturl = path.join(starturl,"classes");
    dirs = loaddir(lasturl);
    copyHtml(dirs,lasturl,"");

    createJS();
    cb();
}

const createDir = async (cb)=>{
    try{
        fs.mkdirSync(outDir);
        fs.mkdirSync(path.join(outDir,"classes"));
    }catch(err){
        console.log(err)
    }
    cb();
}

exports.buildAPI = gulp.series(createDir,copyEnumAndJS);

*/