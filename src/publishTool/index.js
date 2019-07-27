"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const child_process = require("child_process");
const emiter_1 = require("./emiter");
// var BaseURL = emiter_1.emiter.BaseURL ="./bin/layaAir/";
var BaseURL;
/***导出相关 */
var outfile;
var outfileAS = "./as/libs/src/";
var outfileTS = "./ts/ts/";
var outfileJS = "./js/ts/";
var createAS;
//***LayajS exe 所在文件夹 */
var layajsURL;
/**加载与写入计数 */
var complete = 0;
var progress = 0;
var Testobj = {};
/** d.ts 主文件 */
var dtsObj = "";
/** Laya头 */
var isTimeOut = false;
/**执行的目录tsConfig */
var tsCongfig;
/**过滤文件夹名数组 */
var filterArr;
start();
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        let json = JSON.parse(fs.readFileSync("outConfig.json"));
        BaseURL = emiter_1.emiter.BaseURL = json.from;
        outfile = json.out;
        createAS = json.createAS;
        layajsURL = json.layajsURL;
        tsCongfig = json.tsConfig;
        filterArr = json.filter;
        emiter_1.emiter.jscObj = json.jscObj;
        if (!tsCongfig.length || (yield compile())) { //确认编译结果
            checkAllDir("");
        }
    });
}
function compile() {
    return new Promise(reslove => {
        let mark = 0;
        let _result = 0;
        let start = function (result) {
            mark--;
            _result += result;
            if (!mark) {
                if (!_result) {
                    //进程全部执行完毕
                    console.log("compile success!");
                    reslove(true);
                }
                else {
                    reslove(false);
                }
            }
        };
        console.log("start compile!");
        //检测数组
        for (let i = 0; i < tsCongfig.length; i++) {
            mark++;
            let tsConfigUrl = tsCongfig[i];
            let tscLayaAir = child_process.exec("tsc -b " + tsConfigUrl);
            //等待完成
            tscLayaAir.on("exit", (err) => {
                if (err)
                    console.log("tsc fail ", tsConfigUrl);
                start(err);
            });
        }
    });
}
// checkAllDir("./bin/layaAir/");
// tstoas("laya\\utils\\GraphicAnimation.d.ts",null,"laya\\utils");
// tstoas("laya\\d3\\physics\\PhysicsCollider.d.ts",null,"laya\\d3\\physics");
// tstoas("laya\\d3\\physics\\CharacterController.d.ts", null, "laya\\d3\\physics");
// tstoas("laya\\d3\\physics\\PhysicsUpdateList.d.ts",null,"laya\\d3\\physics");
// tstoas("laya\\d3\\component\\SingletonList.d.ts",null,"laya\\d3\\component");
function checkAllDir(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let fileData = yield readDir(url);
        if (fileData) {
            createAS && createDir(outfileAS + url);
            yield ergodic(fileData, url);
        }
        else
            console.log("readdir fail", url);
    });
}
// var testArr = [];
/**
 * 遍历文件夹
 * @param {*} files 列表
 * @param {*} url 该文件夹所在位置
 */
function ergodic(files, url) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < files.length; i++) {
            let fileUrl = path.join(url, files[i]);
            let isFile = yield checkIsFile(fileUrl);
            if (isFile) {
                // testArr.push(files[i]);
                if (filterArr.indexOf(files[i]) == -1)
                    yield checkAllDir(fileUrl);
            }
            else {
                if (filterArr.indexOf(files[i]) == -1) {
                    if (fileUrl.indexOf(".d.ts") != -1) {
                        // testArr.push(files[i]);
                        //读取文件
                        let tsdata = yield readFile(fileUrl);
                        // debugger
                        let asdata = yield tstoas(fileUrl, tsdata, url);
                        //写入文件
                        writeFile(outfileAS + fileUrl, asdata);
                    }
                }
            }
        }
    });
}
/**
 * 检测读写完成
 */
function checkComplete() {
    setTimeout(() => {
        let keys = Object.keys(Testobj);
        if (!keys.length) {
            console.log("TS to AS complete!!!", complete, progress);
            let layaObj = "declare module Laya {\n" + emiter_1.emiter.dtsData + "\n}\n";
            dtsObj += layaObj;
            createDir(outfileJS);
            createDir(outfileTS);
            let jsout = path.join(outfile, outfileJS) + "LayaAir.d.ts";
            let tsout = path.join(outfile, outfileTS) + "LayaAir.d.ts";
            fs.writeFile(tsout, dtsObj, err => {
                if (err) {
                    console.log("create ts d.ts fail");
                    return;
                }
                fs.writeFile(jsout, dtsObj, (err) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        console.log("create js d.ts fail");
                        return;
                    }
                    console.log("create d.ts success");
                    console.log("start copy layajs.exe");
                    yield gulp.src(layajsURL).pipe(gulp.dest(path.join(outfile, outfileAS, "../../")));
                    console.log("start copy jsc");
                    yield gulp.src("./jsc/**/*.*").pipe(gulp.dest(path.join(outfile, outfileAS)));
                    console.log("copy success!");
                    // fs.writeFile("tst.txt",JSON.stringify(testArr),err=>{
                    //     console.log("end");
                    // });
                }));
            });
        }
        else {
            checkComplete();
        }
    }, 5000);
}
/**
 * 给节点加上名字，便于调试
 * @param node
 */
function addName(node) {
    node._kindname = ts.SyntaxKind[node.kind];
    ts.forEachChild(node, addName);
}
/**
 * TS转AS
 * @param infile 文件路径
 * @param code 读取出来的文件
 * @param fileurl 文件夹名字
 */
function tstoas(infile, code, fileurl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!code) {
            code = yield readFile(infile);
        }
        const sc = ts.createSourceFile(formatUrl(infile), code, ts.ScriptTarget.Latest, true);
        addName(sc); // 为了调试方便，给每个节点加上名字
        let em = new emiter_1.emiter();
        let asCode = em.createCode(sc, code, fileurl);
        dtsObj += em.copyTSdata;
        // console.log(asCode);
        //测试 查看copyTsdata
        // console.log(em.copyTSdata);
        return asCode;
    });
}
/**
 * 读取文件夹
 **/
function readDir(fileUrl) {
    return new Promise(resolve => {
        fs.readdir(formatUrl(fileUrl), (err, files) => {
            if (err) {
                console.error("readDir fial", fileUrl);
                return resolve(0);
            }
            // console.log("readDir success",fileUrl);
            resolve(files);
        });
    });
}
/**
 * 创建文件夹
 * @param filePath
 */
function createDir(filePath) {
    // filePath = filePath.replace(BaseURL,'');
    let url = path.resolve(outfile, filePath);
    if (!fs.existsSync(url)) {
        let topUrl = path.join(url, "../");
        // console.log("_没有这一级检测上一级",topUrl);
        createDir(topUrl); //创建上一级
        fs.mkdirSync(url);
    }
}
/**
 * 读取文件
 * @param {*} fileUrl 文件地址
 */
function readFile(fileUrl) {
    return new Promise(resolve => {
        fs.readFile(formatUrl(fileUrl), "utf8", (err, files) => {
            if (err) {
                console.error("readfile fial", fileUrl);
                return resolve(0);
            }
            complete++;
            Testobj[outfileAS + fileUrl] = "reading";
            // console.log("readfile success",fileUrl);
            resolve(files);
        });
    });
}
/**
 * 是否是文件夹
 */
function checkIsFile(url) {
    return new Promise(resolve => {
        fs.lstat(formatUrl(url), (err, stats) => {
            if (err) {
                // console.log("lstatfail",url);
                return resolve(false);
            }
            resolve(stats.isDirectory());
        });
    });
}
/**
 * 写入文件
 * @param url 地址
 * @param data 数据
 */
function writeFile(url, data) {
    if (createAS && data != "") {
        let outUrl = url.replace(new RegExp("(d.ts)", "g"), "as");
        outUrl = outfile + outUrl;
        return new Promise(resolve => {
            fs.writeFile(outUrl, data, err => {
                if (err) {
                    console.log("write file fail", url, err);
                }
                progress++;
                delete Testobj[url];
                if (!isTimeOut) {
                    isTimeOut = true;
                    checkComplete();
                }
                resolve();
            });
        });
    }
    else {
        progress++;
        delete Testobj[url];
        if (!isTimeOut) {
            isTimeOut = true;
            checkComplete();
        }
    }
}
/**
 *  格式化url
 * */
function formatUrl(url) {
    if (url.indexOf(BaseURL) != -1)
        return url;
    return path.join(BaseURL, url);
}
