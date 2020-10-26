const fs = require("fs");
const path = require('path');
const starturl = "./doc/";
const gulp = require("gulp");
const outDir = "./out";
const del = require("del");
const htmlout = path.join(outDir,"classes")
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

async function checkdir(dirs,lasturl){
    // console.log(dirs);
    if (dirs) {
        // if (dirs.indexOf("tsconfig.json")==-1) {
        for (let index = 0; index < dirs.length; index++) {
            let url = dirs[index]
            let from = path.join(lasturl,url);
            let urlArr = url.split("_");
            urlArr[urlArr.length - 2] = urlArr[urlArr.length -1 ].split(".")[1];
            url = urlArr.join("_")
            let to = path.join(htmlout,"enums." + url);
            try{
                fs.copyFileSync(from,to);
            }catch(err){
                console.log(err);
            }
        }
    }
}
const copyClass = ()=>{
    return gulp.src( path.join(starturl,"classes") +"/**/*.*").pipe(gulp.dest(htmlout));
}

function getFirstToUp(name){
    return name.slice(0, 1).toUpperCase() + name.slice(1)
}
var tmpObj = {};
tmpObj["TopLevel"] = [];
tmpObj["Enum"] = [];
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
        if (urlArr[1] != "laya" || urlArr.length <=3) {
            tmpObj["TopLevel"].push(className);
        }else{
            let startIndex = 0;
            let package = "";
            if (urlArr.indexOf("enums.") !== -1) {
                startIndex = 1
                package = "Enum";
            }
            else if (urlArr.indexOf("d3") == -1) {
                startIndex = 1;
                package = getFirstToUp(urlArr[2]);
            }else{
                startIndex = 1;
                package = "d3_" + getFirstToUp(urlArr[3]);
            }
            if (type[package]) {
                package = type[package];
                let fullName = "";
                for (let j = startIndex; j < urlArr.length - 2 ; j++) {
                    fullName += urlArr[j] + ".";
                }
                fullName += className;
                if (!tmpObj[package]) {
                    tmpObj[package] = [];
                }
                tmpObj[package].push(fullName);
            }else{
                console.log("未知包体：",package);
            }
            
        }
    }
    let topstr = `
     var categories = ${JSON.stringify(Object.keys(tmpObj))};
     var classList = ${JSON.stringify(tmpObj)};
     var excludeClassList = {};
     excludeClassList["Core"] = [];
    `;
    let jsFile = fs.readFileSync("source.js","utf8");
    jsFile = topstr + jsFile;
    fs.writeFileSync(path.join(outDir,"script.js"),jsFile,"utf8");
}
var type = {
    "TopLevel":"TopLevel",
    "Enum":"Enum",
    "Ani":"Animation",
    "Components":"Core",
    "Ui":"UI",
    "d3_Animation":"3D",
    "d3_Castshadowlist":"3D",
    "d3_Component":"3D",
    "d3_Core":"3D",
    "d3_Graphics":"3D",
    "d3_Input3d":"3D",
    "d3_Math":"Math",
    "d3_Physicscannon":"Physics3D",
    "d3_Physics":"Physics3D",
    "d3_Resource":"3D",
    "d3_Shader":"3D",
    "d3_Shadowmap":"3D",
    "d3_Text":"3D",
    "d3_Touch":"3D",
    "d3_Utils":"3D",
    "Device":"输入设备",
    "Map":"TiledMap",
    "Maths":"Math",
    "Physics":"Physics2D",
    "Display":"Core",
    "Effect":"Core",
    "Events":"Core",
    "Filters":"Filter",
    "Html":"HTMLText",
    "Layagl":"Core",
    "Media":"Core",
    "Net":"Core",
    "Particle":"Particle",
    "Renders":"Core",
    "Resource":"Core",
    "Utils":"Core",
    "Webgl":"Core",
    "Const":"Core",
    "System":"System"
}
const copyEnumAndJS =  async (cb)=>{
    //解析enums
    let lasturl = path.join(starturl,"enums");
    let dirs = loaddir(lasturl);
    checkdir(dirs,lasturl);
    createJS();
    cb();
}

function delDir(){
    return new Promise(r=>{
        del(outDir,{force:true}).then(paths=>{
            r();
        }).catch(err=>{
            console.log(err);
            r();
        })
    })
}

const delAndCreate = async (cb)=>{
    try{
        await delDir();
        fs.mkdirSync(outDir);
    }catch(err){
        console.log(err)
    }
    cb();
}

exports.buildAPI = gulp.series(delAndCreate,copyClass,copyEnumAndJS);
