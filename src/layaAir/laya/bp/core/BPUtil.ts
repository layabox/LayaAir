import { Browser } from "../../utils/Browser";
import { ClassUtils } from "../../utils/ClassUtils";
import { BlueprintDataList } from "../datas/BlueprintDataInit";
import { extendsData } from "../datas/BlueprintExtends";
import { BPType, TBPCNode, TBPNode, TBPSaveData, TBPVarProperty } from "../datas/types/BlueprintTypes";
import { BPFactory } from "../runtime/BPFactory";
export class BPUtil {
    private static _constNode: Record<string, TBPCNode>;
    private static _constExtNode: Record<string, Record<string, TBPCNode>> = {};
    private static _allConstNode: Record<string, TBPCNode> = {};
    static extendsNode: Record<string, TBPCNode[]> = {};
    static constVars: Record<string, TBPVarProperty[]> = {};

    private static defFunOut = {
        name: "then",
        type: "exec",
    };
    private static defFunIn = {
        name: "execute",
        type: "exec",
    };
    private static defEventOut = BPUtil.defFunOut;

    static getDefaultConstNode() {
        return this._constNode;
    }
    static getConstExtNode() {
        return this._constExtNode;
    }
    static getAllConstNode() {
        return this._allConstNode;
    }

    static getConstNode(ext: string, node?: TBPNode) {
        BPUtil.initConstNode(ext);
        if (null == node) {
            let ret = this._constExtNode[ext];
            if (null == ret) {
                return this._constNode;
            }
        }
        //TODO 以后会有对version的判断逻辑
        return this._allConstNode[node.cid];
        //return this.getConstNodeByID(ext, node.cid);
    }
    static isEmptyObj(o: any) {
        for (let k in o) {
            return false;
        }
        return true;
    }
    static getDist(x1: number, y1: number, x2: number, y2: number) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        var dist = Math.sqrt(dx * dx + dy * dy);
        return dist;
    }


    static getConstNodeByID(ext: string, cid: string, ver?: number) {
        let cnode = this._constExtNode[ext];
        if (null == cnode) {
            cnode = this._constNode;
        }
        let ret = cnode[cid];
        if (null == ret) {
            ret = this._constNode[cid];
        }
        return ret;
    }
    static clone<T>(obj: T): T {
        if (null == obj) return obj;
        return JSON.parse(JSON.stringify(obj));
    }
    static initConstNode(ext: string) {
        if (null == this._constNode) {
            this._constNode = {};

            let list = BlueprintDataList;
            for (let i = list.length - 1; i >= 0; i--) {
                let o = list[i];
                if (null == o.id) o.id = o.name;
                this._constNode[o.id] = o;

                let input = o.input;
                if (input) {
                    for (let i = input.length - 1; i >= 0; i--) {
                        let o = input[i];
                        if (null == o.name) {
                            o.name = String.fromCharCode(97 + i);
                        }
                    }
                }


                if (BPType.Function == o.type) {
                    if (input) {
                        input.unshift(BPUtil.defFunIn);
                    } else {
                        input = [BPUtil.defFunIn];
                        o.input = input;
                    }
                }

                let output = o.output;
                if (output) {
                    for (let i = output.length - 1; i >= 0; i--) {
                        let o = output[i];
                        if (null == o.name) {
                            if (0 == i) {
                                o.name = 'return';
                            } else {
                                throw "output插槽必须要有name！";
                            }
                        }
                    }
                }

                if (BPType.Function == o.type) {
                    if (output) {
                        output.unshift(BPUtil.defFunOut);
                    } else {
                        output = [BPUtil.defFunOut];
                        o.output = output;
                    }
                }
            }
            this._allConstNode = { ...this._constNode };
        }
        if (null == this._constExtNode[ext]) {
            this.getExtendsNode(ext);
            // this._constExtNode[ext] = { ...this._constNode };
            // let obj = this._constExtNode[ext];
            // for (let i = arr.length - 1; i >= 0; i--) {
            //     obj[arr[i].id] = arr[i];
            // }
        }
    }

    static getVariable(data: TBPSaveData) {
        let arr = [...data.variable];
        let carr = BPUtil.constVars[data.extends];
        if (null != carr) {
            arr.push(...carr);
        }
        return arr;
    }

    private static getExtendsNode(str: string) {
        if (null == this._constExtNode[str]) {
            for (let ext in extendsData) {
                let cls =  ClassUtils.getClass(ext) || Browser.window.Laya[ext];

                if (!cls) {
                    continue;
                }
                this.extendsNode[ext] = [];
                this._constExtNode[ext] = {};
                let o = extendsData[ext];

                if (o && o.props) {
                    let arr = o.props;
                    for (let i = arr.length - 1; i >= 0; i--) {
                        let po = arr[i];
                        if (po.isStatic) continue;
                        if (null == this.constVars[ext]) {
                            this.constVars[ext] = [];
                        }
                        let anyObj = po as any;
                        anyObj.const = true;
                        this.constVars[ext].push(anyObj);
                    }
                }
                if (o && o.construct) {
                    let cdata: TBPCNode = {
                        menuPath: "CreateNew",
                        name: ext,
                        target: ext,
                        id: ext,
                        type: BPType.NewTarget,
                        output: [
                            {
                                name: "return",
                                type: ext,
                            }
                        ]
                    }
                    let params = o.construct.params;
                    if (params) {
                        cdata.input = []
                        for (let i = 0, len = params.length; i < len; i++) {
                            cdata.input.push(
                                {
                                    name: params[i].name,
                                    type: params[i].type,
                                }
                            );
                        }
                    }

                    this.extendsNode[ext].push(cdata);
                    this._constExtNode[ext][cdata.id] = cdata;
                    this._allConstNode[cdata.id] = cdata;
                }

                if (o && o.funcs) {
                    let funcs = o.funcs;
                    for (let i = funcs.length - 1; i >= 0; i--) {
                        let fun = funcs[i];
                        if (fun.isPublic || fun.isProtected) {
                            let cdata: TBPCNode = {
                                menuPath: ext,
                                target: ext,
                                name: fun.name,
                                id: ext + "_" + fun.name,
                                type: BPType.Function,
                                output: [
                                    BPUtil.defEventOut,
                                ]
                            }
                            if (fun.isStatic) {
                                cdata.id += "_static";
                                cdata.aliasName = fun.name + " (Static)";
                            }
                            let funName = fun.name;
                            let func = fun.isStatic ? cls[funName] : cls.prototype[funName];
                            if (!func) {
                                //debugger
                            }
                            BPFactory.regFunction(cdata.id, func, !fun.isStatic);

                            if (0 == fun.name.indexOf("on") && 'on' != fun.name) {
                                //TODO 暂时以on开头的都是Event
                                cdata.type = BPType.Event;
                            }

                            let params = fun.params;
                            if (params && 0 < params.length) {
                                cdata.input = [...params];
                            }

                            if (cdata.type == BPType.Function) {
                                if (null == cdata.input) cdata.input = [];
                                if (!fun.isStatic) {
                                    cdata.input.unshift({
                                        name: "target",
                                        type: ext,
                                    });
                                }
                                cdata.input.unshift(BPUtil.defFunIn);
                                if ('void' != fun.return) {
                                    cdata.output.push({
                                        name: "return",
                                        type: fun.return,
                                    });
                                }
                            }
                            this.extendsNode[ext].push(cdata);

                            if (null != this._constExtNode[ext][cdata.id]) {
                                let index = 1;
                                let newID = cdata.id + "(" + index + ")";
                                while (true) {
                                    if (null == this._constExtNode[ext][newID]) break;
                                    index += 1;
                                    newID = cdata.id + "(" + index + ")";
                                }
                                cdata.id = newID;
                                let aliasName = cdata.name;
                                if (null != cdata.aliasName) {
                                    aliasName = cdata.aliasName;
                                }
                                cdata.aliasName = aliasName + " " + index;
                            }
                            this._constExtNode[ext][cdata.id] = cdata;
                        }
                    }
                } else {
                    console.warn("没有找到继承:", ext);
                }

                this._allConstNode = { ...this._allConstNode, ...this._constExtNode[ext] };
            }
        }
        //return this.extendsNode[ret];
    }
}