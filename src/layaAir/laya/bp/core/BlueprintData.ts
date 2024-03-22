import { BlueprintDataList } from "../datas/BlueprintDataInit";
import { extendsData } from "../datas/BlueprintExtends";
import { TBPDeclaration, TBPDeclarationFunction } from "../datas/types/BlueprintDeclaration";
import { BPConstNode, BPType, TBPCNode, TBPNode } from "../datas/types/BlueprintTypes";
import { BlueprintFactory } from "../runtime/BlueprintFactory";
import { BlueprintUtil } from "./BlueprintUtil";

export class BlueprintData {
    static allDataMap: Map<string, Record<string, any>> = new Map();
    private static defFunOut = {
        name: "then",
        type: "exec",
    };
    private static defFunIn = {
        name: "execute",
        type: "exec",
        id: -1
    };
    private static defTarget = {
        name: "target",
        type: "any",
        id: -2
    }
    private static defEventOut = this.defFunOut;
    /**所有的数据 */
    //allData: Record<string, TBPCNode> = {};
    constData: Record<string, BPConstNode> = {};


    /**自動生成的模板數據，這些數據不會在鼠標右鍵菜單中出現，也不會傳輸到ide層去 */
    autoCreateData: Record<string, TBPCNode> = {};
    private static readonly funlike = [BPType.Function, BPType.CustomFun, BPType.Pure];


    constructor() {
        let list = BlueprintDataList;
        if (null == this.constData['system']) this.constData['system'] = { data: {} };
        for (let i = list.length - 1; i >= 0; i--) {
            let o = list[i];
            if (null == o.id) o.id = o.name;
            if (null == o.bpType) o.bpType = 'function';
            this.constData['system'].data[o.id] = o;
            if (null == o.target) o.target = 'system';
            let input = o.input;
            if (input) {
                for (let i = input.length - 1; i >= 0; i--) {
                    let o = input[i];
                    if (null == o.name) {
                        o.name = String.fromCharCode(97 + i);
                    } else if ('execute' == o.name && 'exec' == o.type && null == o.id) {
                        o.id = -1;
                    } else if ('target' == o.name && null == o.id) {
                        o.id = -2;
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
    getConstDataById(target: string, dataId: string): any {
        let targetData = this.constData[target];
        if (targetData) {
            return targetData.data[dataId];
        } else if (BlueprintUtil.customModify) {
            BlueprintUtil.initConstNode();
            return this.getConstDataById(target, dataId);
        }
        // if (targetData) {
        //     if (targetData.events && targetData.events[dataId]) {
        //         return targetData.events[dataId];
        //     }
        //     if (targetData.props && targetData.props[dataId]) {
        //         return targetData.props[dataId];
        //     }
        //     if (targetData.funs && targetData.funs[dataId]) {
        //         return targetData.funs[dataId];
        //     }
        //     if (null != targetData.parent) {
        //         return this.getConstDataById(targetData.parent, dataId);
        //     }
        // }
        return null;
    }
    private _getConstData(cid: string, target?: string): any {

        if (null == cid) return null;
        if (null == target) target = 'system';
        let targetData = this.constData[target];
        if (targetData) {
            let ret = targetData.data[cid];
            if (null == ret && 'system' != target) {
                return this._getConstData(cid);
            }
            return ret;
        } else if ('system' != target) {
            return this._getConstData(cid);
        }
        return null;



        // if (null == target) target = 'system';
        // let targetData = this.constData[target];
        // if (targetData) {
        //     return targetData.data[cid];

        // } else if ('system' != target) {
        //     return this._getConstData(cid);
        // }
        // return null;
    }

    getConstNode(node?: TBPNode) {
        if (null != node.dataId) {
            let id = node.cid + "_" + node.dataId + "_" + node.target;
            if (null != this.autoCreateData[id]) return this.autoCreateData[id];
            let cdata = this._getConstData(node.cid, node.target);
            if ("static_get" == node.cid || "static_set" == node.cid || 'get' == node.cid || 'set' == node.cid || 'tmp_get' == node.cid || 'tmp_set' == node.cid) return cdata;

            let data: any = null;
            if (null == data) {
                let obj = BlueprintData.allDataMap.get(node.target);
                if (obj) {
                    data = obj[node.dataId];
                }
            }

            if (null == data) {
                data = this._getConstData(node.dataId, node.target);
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
                                //cdata.output.push(arr[i]);
                                this._checkAndPush(cdata.output, arr[i]);
                            } else {
                                if (null == cdata.input) cdata.input = [];
                                //cdata.input.push(arr[i]);
                                this._checkAndPush(cdata.input, arr[i]);
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
                                this._checkAndPush(cdata.input, arr[i]);
                            } else {
                                if (null == cdata.output) cdata.output = [];
                                this._checkAndPush(cdata.output, arr[i]);
                                //cdata.output.push(arr[i]);
                            }
                        }
                    }
                }
                this.autoCreateData[id] = cdata;
                return cdata;
            }
        } else {
            return this._getConstData(node.cid, node.target);
        }
        return null;
    }

    private _checkAndPush(arr: any[], obj: any) {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i].name == obj.name) return;
        }
        arr.push(obj);
    }

    private _createExtData(data: Record<string, TBPDeclaration>, ext: string, cls: any, exts?: string[]) {
        let co = this.constData[ext];
        if (null != co) return co;
        let o = data[ext];
        if (null == o) {
            if (null == exts || 0 == exts.length) {
                this.constData[ext] = { data: {} };
            } else {
                let retExts = exts.slice();
                let ret = this._createExtData(data, exts.shift(), cls, exts);
                co = { data: Object.create(ret.data) };
                co.extends = retExts;

                this.constData[ext] = co;
            }
            return this.constData[ext];
        }

        if (null == exts && null != o.extends) {
            exts = o.extends.slice();
        }

        //let exts = o.extends;
        if (exts && 0 < exts.length) {
            let ret = this._createExtData(data, exts.shift(), cls, exts);
            co = { data: Object.create(ret.data) };
            //co = Object.create();
            co.extends = o.extends;
            this._createConstData(o, co, ext, cls);
        } else {
            co = { data: {} };
            this._createConstData(o, co, ext, cls);
        }
        if (o.name != ext) co.caption = o.name;
        if (null != o.caption) co.caption = o.caption;
        this.constData[ext] = co;
        return co;
    }
    private _createConstData(o: TBPDeclaration, cdata: BPConstNode, ext: string, cls: any) {
        if (o?.props) {
            o.props.forEach((po: any) => {
                po.id = "var_" + po.name;
                if (null != po.customId) {
                    po.id = po.customId;
                } else if (po.modifiers && po.modifiers.isStatic) {
                    po.id += "_static";
                }
                po.const = true;
                po.target = ext;
                po.bpType = 'prop';
                cdata.data[po.id] = po;
            });
        }
        if (o?.construct) {
            let po: TBPCNode = {
                name: ext,
                target: ext,
                menuPath: "createNew",
                id: "construct_" + ext,
                bpType: "construct",
                type: BPType.NewTarget,
                output: [{ name: "return", type: ext }]
            }

            cdata.data[po.id] = po;
            if (o.construct.params) {
                po.input = o.construct.params.map(param => ({ name: param.name, type: param.type }));
            }
            for (let k in o.construct) {
                if ('params' != k && null == (po as any)[k]) {
                    (po as any)[k] = (o.construct as any)[k];
                }
            }
        }
        if (o?.events) {
            o.events.forEach((eve: any) => {
                if (null == eve.id) {
                    eve.id = "event_" + eve.name;
                }
                if (null != eve.customId) {
                    eve.id = eve.customId;
                }
                eve.bpType = 'event';
                eve.target = ext;
                if (null == eve.input && null != eve.params) {
                    eve.input = eve.params;
                }
                cdata.data[eve.id] = eve;
            })
        }
        if (o?.funcs) {
            o.funcs.forEach((fun: TBPDeclarationFunction) => {
                if (fun.modifiers.isPublic || fun.modifiers.isProtected) {
                    let po = BlueprintData.createCData(fun);
                    po.target = ext;

                    let func = fun.modifiers.isStatic ? cls[fun.name] : cls.prototype[fun.name];
                    BlueprintFactory.regFunction(po.id, func, !fun.modifiers.isStatic, cls, po.target);

                    if (fun.params && fun.params.length > 0) {
                        if (BPType.Event == po.type) {
                            po.output.push(...fun.params);
                        } else {
                            po.input = [...fun.params];
                        }
                    }
                    BlueprintData.handleCDataTypes(po, fun, ext);
                    for (let k in fun) {
                        if (null == (po as any)[k]) {
                            (po as any)[k] = (fun as any)[k];
                        }
                    }

                    cdata.data[po.id] = po;
                }
            });
        }
    }


    initData(data: Record<string, TBPDeclaration>) {
        for (let ext in data) {
            delete this.constData[ext];
        }
        for (let ext in data) {
            let cls = BlueprintUtil.getClass(ext);
            if (!cls) continue;
            this._createExtData(data, ext, cls);
        }
    }
    private static handleCDataTypes(cdata: TBPCNode, fun: any, ext: string) {
        if (this.funlike.includes(cdata.type)) {
            cdata.input = cdata.input || [];
            if (!fun.modifiers.isStatic) {
                cdata.input.unshift({ name: "target", type: ext, id: -2 });
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
    private static createCData(fun: any): TBPCNode {
        let cdata: TBPCNode = {
            bpType: "function",
            modifiers: fun.modifiers,
            name: fun.name,
            id: "fun_" + fun.name,
            type: BPType.Function,
            output: [this.defEventOut]
        }
        if (null != fun.customId) {
            cdata.id = fun.customId;
        } else {
            cdata.id = fun.modifiers.isStatic ? cdata.id + "_static" : cdata.id;
        }
        cdata.menuPath = fun.menuPath;
        cdata.type = [BPType.Pure, BPType.Function, BPType.Event].includes(fun.type) ? fun.type : cdata.type;
        cdata.type = fun.customId ? BPType.CustomFun : cdata.type;
        cdata.customId = fun.customId || cdata.customId;
        cdata.typeParameters = fun.typeParameters || cdata.typeParameters;
        return cdata;
    }

}