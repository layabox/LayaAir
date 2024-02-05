import { BlueprintDataList } from "../datas/BlueprintDataInit";
import { extendsData } from "../datas/BlueprintExtends";
import { TBPDeclaration } from "../datas/types/BlueprintDeclaration";
import { BPType, TBPCNode, TBPNode } from "../datas/types/BlueprintTypes";
import { BlueprintFactory } from "../runtime/BlueprintFactory";
import { BlueprintImpl } from "../runtime/resource/BlueprintImpl";
import { BlueprintUtil } from "./BlueprintUtil";

export class BlueprintData {
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
    private static defEventOut = this.defFunOut;
    /**所有的数据 */
    allData: Record<string, TBPCNode> = {};
    /**自動生成的模板數據，這些數據不會在鼠標右鍵菜單中出現，也不會傳輸到ide層去 */
    autoCreateData: Record<string, TBPCNode> = {};
    private static readonly funlike = [BPType.Function, BPType.CustomFun, BPType.Pure];


    constructor() {
        let list = BlueprintDataList;
        for (let i = list.length - 1; i >= 0; i--) {
            let o = list[i];
            if (null == o.id) o.id = o.name;
            if (null == o.bpType) o.bpType = 'function';
            this.allData[o.id] = o;
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
                        input.unshift(BlueprintData.defTarget);
                    }
                    input.unshift(BlueprintData.defFunIn);
                } else {
                    input = [BlueprintData.defFunIn];
                    if (null == o.modifiers || !o.modifiers.isStatic) {
                        input.push(BlueprintData.defTarget);
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
                    output.unshift(BlueprintData.defFunOut);
                } else {
                    output = [BlueprintData.defFunOut];
                    o.output = output;
                }
            }
        }
        this.initData(extendsData);
    }
    getConstNode(node?: TBPNode) {
        if (null != node.dataId) {
            let id = node.cid + "_" + node.dataId;
            if (null != this.allData[id]) return this.allData[id];
            if (null != this.autoCreateData[id]) return this.autoCreateData[id];
            let cdata = this.allData[node.cid];
            let data: any = this.allData[node.dataId];
            if (null == data) {
                let obj = BlueprintImpl.loadedBPData.get(node.target);
                if (obj) {
                    data = obj.allData[node.dataId];
                }
            }
            if (data) {
                cdata = BlueprintUtil.clone(cdata);
                let arr = data.input;
                if (BPType.CustomFunReturn != cdata.type) {
                    if (arr) {
                        for (let i = 0, len = arr.length; i < len; i++) {
                            if (null == arr[i].name || "" == arr[i].name.trim()) continue;
                            if (BPType.Event == cdata.type || BPType.CustomFunStart == cdata.type) {
                                if (null == cdata.output) cdata.output = [];
                                cdata.output.push(arr[i]);
                            } else {
                                if (null == cdata.input) cdata.input = [];
                                cdata.input.push(arr[i]);
                            }
                        }
                    }
                }
                if (BPType.CustomFunStart != cdata.type && BPType.Event != cdata.type && 'event_call' != cdata.name) {
                    arr = data.output;
                    if (arr) {
                        for (let i = 0, len = arr.length; i < len; i++) {
                            if (null == arr[i].name || "" == arr[i].name.trim()) continue;
                            if (BPType.CustomFunReturn == cdata.type) {
                                if (null == cdata.input) cdata.input = [];
                                cdata.input.push(arr[i]);
                            } else {
                                if (null == cdata.output) cdata.output = [];
                                cdata.output.push(arr[i]);
                            }
                        }
                    }
                }
                this.autoCreateData[id] = cdata;
                return cdata;
            }
        } else {
            let ret = this.allData[node.cid];
            if (node.debugType) {
                ret = BlueprintUtil.clone(ret);
                ret.debugType = node.debugType;
            }
            return ret;
        }
        return null;
    }


    initData(data: Record<string, TBPDeclaration>) {
        for (let ext in data) {
            let cls = BlueprintUtil.getClass(ext);
            if (!cls) continue;
            let o = data[ext];
            if (o?.props) {
                o.props.forEach((po: any) => {
                    po.id = po.id || 'var_' + ext + "_" + po.name;
                    po.targetAliasName = po.targetAliasName || o.name;
                    po.target = po.target || ext;
                    po.bpType = 'prop';
                    po.const = true;
                    this.allData[po.id] = po;
                });
            }

            if (o?.construct) {
                let cdata: TBPCNode = {
                    menuPath: "CreateNew",
                    name: ext,
                    target: ext,
                    id: ext,
                    bpType: "construct",
                    type: BPType.NewTarget,
                    output: [{ name: "return", type: ext }]
                }

                this.allData[cdata.id] = cdata;

                if (o.construct.params) {
                    cdata.input = o.construct.params.map(param => ({ name: param.name, type: param.type }));
                }
            }
            if (o?.events) {
                o.events.forEach((eve: any) => {
                    eve.id = eve.id || 'event_' + ext + "_" + eve.name;
                    eve.bpType = 'event';
                    eve.input = eve.params;
                    eve.targetAliasName = o.name;
                    eve.target = ext;
                    eve.const = true;
                    this.allData[eve.id] = eve;
                })
            }

            if (o?.funcs) {
                o.funcs.forEach((fun: any) => {
                    if (fun.modifiers.isPublic || fun.modifiers.isProtected) {
                        let cdata: TBPCNode = BlueprintData.createCData(fun, ext, o.name);
                        let func = fun.modifiers.isStatic ? cls[fun.name] : cls.prototype[fun.name];
                        BlueprintFactory.regFunction(cdata.id, func, !fun.modifiers.isStatic, cls);

                        if (fun.params && fun.params.length > 0) {
                            if (BPType.Event == cdata.type) {
                                cdata.output.push(...fun.params);
                            } else {
                                cdata.input = [...fun.params];
                            }
                        }
                        BlueprintData.handleCDataTypes(cdata, fun, ext);
                        this.allData[cdata.id] = cdata;
                    }
                });
            }
        }
    }
    private static handleCDataTypes(cdata: TBPCNode, fun: any, ext: string) {
        if (this.funlike.includes(cdata.type)) {
            cdata.input = cdata.input || [];
            if (!fun.modifiers.isStatic) {
                cdata.input.unshift({ name: "target", type: ext });
            }
            if (cdata.type == BPType.Pure) {
                cdata.output.shift();
            } else {
                cdata.input.unshift(this.defFunIn);
            }

            if ('void' != fun.returnType) {
                if (fun.returnType instanceof Array) {
                    cdata.output.push(...fun.returnType);
                } else {
                    cdata.output.push({ name: "return", type: fun.returnType });
                }
            }
        }
    }
    private static createCData(fun: any, ext: string, name: string): TBPCNode {
        let cdata: TBPCNode = {
            bpType: "function",
            modifiers: fun.modifiers,
            target: ext,
            targetAliasName: name,
            name: fun.name,
            id: ext + "_" + fun.name,
            type: BPType.Function,
            output: [this.defEventOut]
        }
        cdata.menuPath = fun.menuPath;
        cdata.type = [BPType.Pure, BPType.Function, BPType.Event].includes(fun.type) ? fun.type : cdata.type;
        cdata.id = fun.customId ? ext + "_" + fun.customId : cdata.id;
        cdata.type = fun.customId ? BPType.CustomFun : cdata.type;
        cdata.customId = fun.customId || cdata.customId;
        cdata.typeParameters = fun.typeParameters || cdata.typeParameters;
        cdata.id = fun.modifiers.isStatic ? cdata.id + "_static" : cdata.id;
        cdata.aliasName = fun.modifiers.isStatic ? fun.name + " (Static)" : cdata.aliasName;

        return cdata;
    }

}