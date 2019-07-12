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
const emiter_1 = require("./emiter");
var BaseURL;
// var BaseURL = emiter_1.emiter.BaseURL= "./bin/layaAir/";
var outfile;
var outfileAS = "./as/libs/src/";
var outfileTS = "./ts/ts/";
var outfileJS = "./js/ts/";
var createAS;
/**加载与写入计数 */
var complete = 0;
var progress = 0;
var Testobj = {};
/** d.ts 主文件 */
var dtsObj = "";
/** Laya头 */
var isTimeOut = false;
start();
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        let json = JSON.parse(fs.readFileSync("outConfig.json"));
        BaseURL = emiter_1.emiter.BaseURL = json.from;
        outfile = json.out;
        createAS = json.createAS;
        checkAllDir("");
    });
}
// checkAllDir("./bin/layaAir/");
// tstoas("laya\\ui\\Widget.d.ts", null, "laya\\ui");
// tstoas("laya\\d3\\physics\\PhysicsUpdateList.d.ts",null,"laya\\d3\\physics");
// tstoas("laya\\d3\\component\\SingletonList.d.ts",null,"laya\\d3\\component");
function checkAllDir(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let fileData = yield readDir(url);
        if (fileData) {
            createAS && createDir(outfileAS + url);
            ergodic(fileData, url);
        }
        else
            console.log("readdir fail", url);
    });
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
        //测试
        // fs.writeFile("tst.as",asCode,err=>{
        //     if(err)console.log("writeFail");
        //     console.log("writeSuccess");
        // });
        // console.log(asCode);
        //测试 查看copyTsdata
        // console.log(em.copyTSdata);
        // debugger
        return asCode;
    });
}
/**
 * 读取文件夹
 *  */
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
                checkAllDir(fileUrl);
            }
            else {
                if (fileUrl.indexOf(".d.ts") != -1) {
                    //读取文件
                    let tsdata = yield readFile(fileUrl);
                    // debugger
                    let asdata = yield tstoas(fileUrl, tsdata, url);
                    //写一份extend
                    // if(url != ""){
                    //     layaObj += "\n\tclass " + files[i].replace(".d.ts","") + " extends " + fileUrl.replace(new RegExp("\\\\","g"),".").replace(".d.ts","") + " {}\n";
                    // }
                    //写入文件
                    yield writeFile(outfileAS + fileUrl, asdata);
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
            // if (!fs.existsSync(out))
            //     fs.mkdirSync(out);
            let jsout = path.join(outfile, outfileJS) + "LayaAir.d.ts";
            let tsout = path.join(outfile, outfileTS) + "LayaAir.d.ts";
            fs.writeFile(tsout, dtsObj, err => {
                if (err)
                    console.log("create ts d.ts fail");
                fs.writeFile(jsout, dtsObj, err => {
                    if (err)
                        console.log("create js d.ts fail");
                    console.log("create d.ts success");
                });
            });
        }
        else {
            checkComplete();
        }
    }, 1000);
}
/**
 *  格式化url
 * */
function formatUrl(url) {
    if (url.indexOf(BaseURL) != -1)
        return url;
    return path.join(BaseURL, url);
}
