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
var outfile = "../../build/as/declare/";
//输出的JS TS目录，相对as文件夹
var outfileTS = "../../ts_compatible/declare/";
var outfileJS = "../../js/declare/";
/**加载与写入计数 */
var complete = 0;
var progress = 0;
var Testobj = {};
/** d.ts 主文件 */
var dtsObj = "";
/** Laya头 */
var isTimeOut = false;
checkAllDir("../../bin/tsc/layaAir/");
function checkAllDir(url) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!BaseURL) {
            // outfile = path.join(url, "../as/");
            BaseURL = emiter_1.emiter.BaseURL = url;
            url = "";
        }
        let fileData = yield readDir(url);
        if (fileData) {
            createDir(url);
            ergodic(fileData, url);
        }
        else
            console.log("readdir fail", url);
    });
}
exports.default = checkAllDir;
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

var a = 0;
/**
 * 创建文件夹
 * @param filePath
 */
function createDir(filePath) {
    // filePath = filePath.replace(BaseURL,'');
    let url = path.resolve(outfile, filePath);
    if (!fs.existsSync(url)){
        let topUrl = path.join(url,"../");
        // console.log("_没有这一级检测上一级",topUrl);
        createDir(topUrl);//创建上一级
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
            Testobj[fileUrl] = "state";
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
                    yield writeFile(fileUrl, asdata);
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
            console.log("文件转换完成!!!", complete, progress);
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
                    console.log("生成d.ts失败");
                fs.writeFile(jsout, dtsObj, err => {
                    if (err)
                        console.log("生成d.ts失败");
                    console.log("生成d.ts成功");
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
