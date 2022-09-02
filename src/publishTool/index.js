"use strict";
var __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function(resolve) { resolve(value); }); }
    return new(P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }

        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }

        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const ts = require("typescript");
const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const child_process = require("child_process");
const emiter_1 = require("./emiter");
const { exit } = require("process");
class Main {
    constructor() {
        this.outfileAS = "./as/libs/src/";
        this.outfileTS = "./ts/ts/";
        this.outfileJS = "./js/ts/";
        /**加载与写入计数 */
        this.complete = 0;
        this.progress = 0;
        this.Testobj = 0;
        /** d.ts 主文件 */
        this.dtsObj = "";
        /** Laya头 */
        this.isTimeOut = false;
        /**入口 */
        this.start();
        // this.tstoas("laya\\renders\\RenderSprite.d.ts",null,"laya\\renders");
        // this.tstoas("laya\\ani\\bone\\spine\\SpineSkeletonRenderer.d.ts",null,"laya\\ani\\bone\\spine");
        // this.tstoas("laya\\d3\\core\\Transform3D.d.ts",null,"laya\\d3\\core\\");
        // this.tstoas("laya\\html\\dom\\HTMLElement.d.ts", null, "laya\\html\\dom");
        // this.tstoas("laya\\resource\\IDestroy.d.ts",null,"laya\\resource");
        // this.tstoas("laya\\gltf\\GLTFLoader.d.ts",null,"laya\\gltf");
        // this.tstoas("Laya.d.ts",null,"");
        // this.tstoas("laya\\d3\\component\\SingletonList.d.ts",null,"laya\\d3\\component");
    }
    get BaseURL() {
        return this._BaseURL || "../bin/layaAir/";
    }
    set BaseURL(value) {
        this._BaseURL = value;
    }
    start() {
        return __awaiter(this, void 0, void 0, function*() {
            let json = JSON.parse(fs.readFileSync("outConfig.json"));
            this.BaseURL = emiter_1.emiter.BaseURL = json.from;
            this.outfile = json.out;
            this.createAS = json.createAS;
            this.layajsURL = json.layajsURL;
            this.tsCongfig = json.tsConfig;
            this.filterArr = json.filter;
            emiter_1.emiter.jscObj = json.jscObj;
            if (!this.tsCongfig.length || (yield this.compile())) { //确认编译结果
                this.checkAllDir("");
            } else {
                console.log("compile fail!");
                exit(1); // 在publish.sh中检测编译成功与否
            }
        });
    }
    compile() {
        return new Promise(reslove => {
            let mark = 0;
            let _result = 0;
            let start = function(result) {
                mark--;
                _result += result;
                if (!mark) {
                    if (!_result) {
                        //进程全部执行完毕
                        console.log("compile success!");
                        reslove(true);
                    } else {
                        reslove(false);
                    }
                }
            };
            console.log("start compile!");
            //检测数组
            for (let i = 0; i < this.tsCongfig.length; i++) {
                mark++;
                let tsConfigUrl = this.tsCongfig[i];
                let cmd = ["-b", tsConfigUrl];
                let tscurl = path.join(this.BaseURL.split("bin")[0], "./node_modules/.bin/tsc.cmd");
                if (process.platform === 'darwin') {
                    // mac版本
                    tscurl = path.join(this.BaseURL.split("bin")[0], "./node_modules/.bin/tsc");
                }
                child_process.execFile(tscurl, cmd, (err, stdout, stderr) => {
                    if (err) {
                        console.log(err, '\n', stdout, '\n', stderr);
                    }
                    start(err);
                });
            }
        });
    }
    checkAllDir(url) {
            return __awaiter(this, void 0, void 0, function*() {
                let fileData = yield this.readDir(url);
                if (fileData) {
                    this.createAS && this.createDir(this.outfileAS + url);
                    yield this.ergodic(fileData, url);
                }
            });
        }
        /**
         * TS转AS
         * @param infile 文件路径
         * @param code 读取出来的文件
         * @param fileurl 文件夹名字
         */
    tstoas(infile, code, fileurl) {
            return __awaiter(this, void 0, void 0, function*() {
                if (!code) {
                    code = yield this.readFile(infile);
                }
                // code = code.replace(/\|\s*null/gm,"");    
                const sc = ts.createSourceFile(this.formatUrl(infile), code, ts.ScriptTarget.Latest, true);
                this.addName(sc); // 为了调试方便，给每个节点加上名字
                let em = new emiter_1.emiter();
                em.createCode(sc, code, fileurl);
                this.dtsObj += em.copyTSdata;
                if (!this._BaseURL) {
                    for (let index = 0; index < em.outputObj.length; index++) {
                        let element = em.outputObj[index];
                        console.log(element.asCode);
                    }
                    //测试 查看copyTsdata
                    console.log(em.copyTSdata);
                }
                return em;
            });
        }
        // var testArr = [];
        /**
         * 遍历文件夹
         * @param {*} files 列表
         * @param {*} url 该文件夹所在位置
         */
    ergodic(files, url) {
            return __awaiter(this, void 0, void 0, function*() {
                for (let i = 0; i < files.length; i++) {
                    let fileUrl = path.join(url, files[i]);
                    let isFile = yield this.checkIsFile(fileUrl);
                    if (isFile) {
                        // testArr.push(files[i]);
                        if (this.filterArr.indexOf(files[i]) == -1)
                            yield this.checkAllDir(fileUrl);
                    } else {
                        if (this.filterArr.indexOf(files[i]) == -1) {
                            if (fileUrl.indexOf(".d.ts") != -1) {
                                //读取文件
                                let tsdata = yield this.readFile(fileUrl);
                                // debugger
                                let em = yield this.tstoas(fileUrl, tsdata, url);
                                this.Testobj += em.outputObj.length;
                                //多份文件
                                for (let i = 0; i < em.outputObj.length; i++) {
                                    let asObj = em.outputObj[i];
                                    this.writeFile(this.outfileAS + asObj.url, asObj.asCode);
                                }
                                em.outputObj = null;
                            }
                        }
                    }
                }
            });
        }
        /**
         * 检测读写完成
         */
    checkComplete() {
            setTimeout(() => {
                // let keys = Object.keys(this.Testobj);
                if (!this.Testobj) {
                    console.log("TS to AS complete!!!", this.complete, this.progress);
                    let layaObj = "declare module Laya {\n" + emiter_1.emiter.dtsData + "\n}\n";
                    this.dtsObj += layaObj;
                    this.createDir(this.outfileJS);
                    this.createDir(this.outfileTS);
                    let jsout = path.join(this.outfile, this.outfileJS) + "LayaAir.d.ts";
                    let tsout = path.join(this.outfile, this.outfileTS) + "LayaAir.d.ts";
                    fs.writeFile(tsout, this.dtsObj, err => {
                        if (err) {
                            console.log("create ts d.ts fail");
                            exit(1);
                            return;
                        }
                        fs.writeFile(jsout, this.dtsObj, (err) => __awaiter(this, void 0, void 0, function*() {
                            if (err) {
                                console.log("create js d.ts fail");
                                exit(1);
                                return;
                            }
                            console.log("create d.ts success");
                            console.log("start copy layajs.exe");
                            yield gulp.src(this.layajsURL).pipe(gulp.dest(path.join(this.outfile, this.outfileAS, "../../")));
                            console.log("start copy jsc");
                            yield gulp.src("./jsc/**/*.*").pipe(gulp.dest(path.join(this.outfile, this.outfileAS)));
                            console.log("copy success!");
                        }));
                    });
                } else {
                    this.checkComplete();
                }
            }, 1000 * 5);
        }
        /**
         * 给节点加上名字，便于调试
         * @param node
         */
    addName(node) {
            node._kindname = ts.SyntaxKind[node.kind];
            ts.forEachChild(node, this.addName.bind(this));
        }
        /**
         * 读取文件夹
         **/
    readDir(fileUrl) {
            return new Promise(resolve => {
                fs.readdir(this.formatUrl(fileUrl), (err, files) => {
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
    createDir(filePath) {
            // filePath = filePath.replace(BaseURL,'');
            let url = path.resolve(this.outfile, filePath);
            if (!fs.existsSync(url)) {
                let topUrl = path.join(url, "../");
                // console.log("_没有这一级检测上一级",topUrl);
                this.createDir(topUrl); //创建上一级
                fs.mkdirSync(url);
            }
        }
        /**
         * 读取文件
         * @param {*} fileUrl 文件地址
         */
    readFile(fileUrl) {
            return new Promise(resolve => {
                fs.readFile(this.formatUrl(fileUrl), "utf8", (err, files) => {
                    if (err) {
                        console.error("readfile fail", fileUrl);
                        return resolve(0);
                    }
                    this.complete++;
                    // this.Testobj[this.outfileAS+fileUrl.replace(".d.ts","")] = "reading";
                    // console.log("readfile success",fileUrl);
                    resolve(files);
                });
            });
        }
        /**
         * 是否是文件夹
         */
    checkIsFile(url) {
            return new Promise(resolve => {
                fs.lstat(this.formatUrl(url), (err, stats) => {
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
    writeFile(url, data) {
            if (this.createAS && data != "") {
                let outUrl = this.outfile + url;
                // url.replace("(d.ts)","as");
                // outUrl 
                return new Promise(resolve => {
                    fs.writeFile(outUrl, data, err => {
                        if (err) {
                            console.log("write file fail", url, err);
                            exit(1);
                        }
                        this.progress++;
                        // delete this.Testobj[url.replace(".as","")]
                        this.Testobj--;
                        if (!this.isTimeOut) {
                            this.isTimeOut = true;
                            this.checkComplete();
                        }
                        resolve();
                    });
                });
            } else {
                this.progress++;
                this.Testobj--;
                // delete this.Testobj[url]
                if (!this.isTimeOut) {
                    this.isTimeOut = true;
                    this.checkComplete();
                }
            }
        }
        /**
         *  格式化url
         * */
    formatUrl(url) {
        if (url.indexOf(this.BaseURL) != -1)
            return url;
        return path.join(this.BaseURL, url);
    }
}
exports.Main = Main;
new Main();