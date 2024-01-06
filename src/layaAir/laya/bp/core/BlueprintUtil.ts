import { Browser } from "../../utils/Browser";
import { ClassUtils } from "../../utils/ClassUtils";
import { BlueprintDataList } from "../datas/BlueprintDataInit";
import { customData, extendsData } from "../datas/BlueprintExtends";
import { TBPDeclaration } from "../datas/types/BlueprintDeclaration";
import { BPType, TBPCNode, TBPNode, TBPSaveData, TBPStageData, TBPVarProperty } from "../datas/types/BlueprintTypes";
import { BlueprintFactory } from "../runtime/BlueprintFactory";
export class BlueprintUtil {
    private static _constNode: Record<string, TBPCNode>;
    private static _constExtNode: Record<string, Record<string, TBPCNode>> = {};
    private static _allConstNode: Record<string, TBPCNode> = {};
    static extendsNode: Record<string, TBPCNode[]> = {};
    static constVars: Record<string, TBPVarProperty[]> = {};
    static constAllVars: Record<string, TBPVarProperty> = {};

    private static defFunOut = {
        name: "then",
        type: "exec",
    };
    private static defFunIn = {
        name: "execute",
        type: "exec",
    };
    private static defTarget = {
        name: "target",
        type: "any",
    }
    private static defEventOut = BlueprintUtil.defFunOut;

    static getDefaultConstNode() {
        return this._constNode;
    }
    static getConstExtNode() {
        return this._constExtNode;
    }
    static getAllConstNode() {
        return this._allConstNode;
    }
    static getDataByID(id: string, data: TBPStageData) {
        let ret = data.dataMap[id];
        if (null == ret) {
            ret = this.constAllVars[id];
        }
        return ret;
    }
    static clone<T>(obj: T): T {
        if (null == obj) return obj;
        return JSON.parse(JSON.stringify(obj));
    }
    static getConstNode(ext: string, node?: TBPNode, stageData?: TBPStageData) {
        this.initConstNode();
        if (null == node) {
            let ret = this._constExtNode[ext];
            if (null == ret) {
                return this._constNode;
            }
        }
        if (null != node.dataId) {
            let ret = this._allConstNode[node.dataId];
            if (null == ret) {
                ret = this._allConstNode[node.cid];
                if (stageData) {
                    let data: any = this.getDataByID(node.dataId, stageData);
                    if (data && data.input && 0 < data.input.length && (BPType.Event == ret.type || 'event_call' == ret.name)) {
                        ret = this.clone(ret);
                        if (BPType.Event == ret.type) {
                            let arr = data.input;
                            for (let i = 0, len = arr.length; i < len; i++) {
                                if (null == arr[i].name || "" == arr[i].name.trim()) continue;
                                ret.output.push(
                                    arr[i]
                                );
                            }
                        } else {
                            let arr = data.input;
                            for (let i = 0, len = arr.length; i < len; i++) {
                                if (null == arr[i].name || "" == arr[i].name.trim()) continue;
                                ret.input.push(
                                    arr[i]
                                );
                            }
                        }
                        this._allConstNode[node.dataId] = ret;
                    }

                }
            }
            return ret;
        } else {
            return this._allConstNode[node.cid];
        }


        //TODO 以后会有对version的判断逻辑
        //return this._allConstNode[node.cid];
        //return this.getConstNodeByID(ext, node.cid);
    }

    static getDeclaration(name:string):TBPDeclaration{
        return extendsData[name] ? extendsData[name] : customData[name];
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
    static initConstNode() {
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
                        if (null == o.modifiers || !o.modifiers.isStatic) {
                            input.unshift(BlueprintUtil.defTarget);
                        }
                        input.unshift(BlueprintUtil.defFunIn);
                    } else {
                        input = [BlueprintUtil.defFunIn];
                        if (null == o.modifiers || !o.modifiers.isStatic) {
                            input.push(BlueprintUtil.defTarget);
                        }
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
                        output.unshift(BlueprintUtil.defFunOut);
                    } else {
                        output = [BlueprintUtil.defFunOut];
                        o.output = output;
                    }
                }
            }
            this._allConstNode = { ...this._constNode };
            this.initExtendsNode();
        }
    }

    static getVariable(data: TBPSaveData) {
        let arr = [...data.variable];
        let carr = BlueprintUtil.constVars[data.extends];
        if (null != carr) {
            arr.push(...carr);
        }
        return arr;
    }

    private static initExtendsNode() {
        for (let ext in extendsData) {
            let cls = ClassUtils.getClass(ext) || Browser.window.Laya[ext];

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
                    if (po.modifiers.isStatic) continue;

                    if (null == this.constVars[ext]) {
                        this.constVars[ext] = [];
                    }
                    let anyObj = po as any;
                    if (null == anyObj.id) {
                        anyObj.id = 'var_' + ext + "_" + anyObj.name;
                    }
                    anyObj.const = true;
                    this.constVars[ext].push(anyObj);
                    this.constAllVars[anyObj.id] = anyObj;
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
                    if (fun.modifiers.isPublic || fun.modifiers.isProtected) {
                        let cdata: TBPCNode = {
                            menuPath: ext,
                            target: ext,
                            name: fun.name,
                            id: ext + "_" + fun.name,
                            type: BPType.Function,
                            output: [
                                BlueprintUtil.defEventOut,
                            ]
                        }
                        if (fun.modifiers.isStatic) {
                            cdata.id += "_static";
                            cdata.aliasName = fun.name + " (Static)";
                        }
                        if (BPType.Event == fun.type) {
                            cdata.type = BPType.Event;
                        }
                        let funName = fun.name;
                        let func = fun.modifiers.isStatic ? cls[funName] : cls.prototype[funName];
                        if (!func) {
                            //debugger
                        }
                        BlueprintFactory.regFunction(cdata.id, func, !fun.modifiers.isStatic);

                        if (0 == fun.name.indexOf("on") && 'on' != fun.name) {
                            //TODO 暂时以on开头的都是Event
                            cdata.type = BPType.Event;
                        }

                        let params = fun.params;
                        if (params && 0 < params.length) {
                            if (BPType.Event == cdata.type) {
                                cdata.output.push(...params);
                            } else {
                                cdata.input = [...params];
                            }
                        }

                        if (cdata.type == BPType.Function) {
                            if (null == cdata.input) cdata.input = [];
                            if (!fun.modifiers.isStatic) {
                                cdata.input.unshift({
                                    name: "target",
                                    type: ext,
                                });
                            }
                            cdata.input.unshift(BlueprintUtil.defFunIn);
                            if ('void' != fun.returnType) {
                                cdata.output.push({
                                    name: "return",
                                    type: fun.returnType,
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
}