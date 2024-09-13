import { MDManager } from "./MDManager";
import { Main } from "./Main";
import { EmptyDataUtils } from "./tools/EmptyDataUtils";
import { MoveUtils } from "./tools/MoveUtils";
const fs = require("fs");
const path = require("path");
const { argv, argv0 } = require("process");

var cfgUrl = path.join(argv[1], "../../config.json")
let cfg = JSON.parse(fs.readFileSync(cfgUrl, "utf-8"));
var { dtsPath, outDir, mdPath, emptyDataDir, deleteDir } = cfg;

if(!outDir){
    console.error("outDir is null");
    process.exit(1); // 停止执行
}

if(!dtsPath){
    console.error("dtsPath is null");
    process.exit(1); // 停止执行
}

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}


console.log("start");
if (mdPath) {
    console.log("reload md start");
    MDManager.instance.addByPath(mdPath);
    console.log("reload md end");
}

if (emptyDataDir) {
    if (!fs.existsSync(emptyDataDir)) {
        fs.mkdirSync(emptyDataDir, { recursive: true });
    }
    
    console.log("write empty data start");
    EmptyDataUtils.writeEmptyData(emptyDataDir);
    console.log("write empty data end");
}


/* console.log("rm outDir start");
var i = 0;
fs.rm(outDir, { recursive: true, force: true }, (err) => {
    if (err) {
        console.error('Error deleting directory:', err);
    } else {
        console.log("rm outDir end");
        i++;
        _next();
    }
});

console.log("rm emptyDataDir start");
fs.rm(emptyDataDir, { recursive: true, force: true }, (err) => {
    if (err) {
        console.error('Error deleting directory:', err);
    } else {
        console.log("rm emptyDataDir end");
        i++;
        _next();
    }
}); */

function _next() {
    // if (i < 2) return;
    console.log("canver start");
    var main = new Main();
    main.initByPath(dtsPath);
    main.canverByPath(dtsPath, outDir, emptyDataDir);
    console.log("canver end");

    if(deleteDir){
        MoveUtils.instance.check(outDir, deleteDir);
    }
}
_next();