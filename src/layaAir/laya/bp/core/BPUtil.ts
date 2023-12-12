import { BlueprintDataList } from "../datas/BlueprintDataInit";
import { extendsData } from "../datas/BlueprintExtends";
import { BPType, TBPCNode, TBPNode } from "../datas/types/BlueprintTypes";
export class BPUtil {
    private static _constNode: Record<string, TBPCNode>;
    private static _constExtNode: Record<string, Record<string, TBPCNode>> = {};
    static extendsNode: Record<string, TBPCNode[]> = {};

    private static defFunOut = {
        name: "then",
        type: "exec",
    };
    private static defFunIn = {
        name: "execute",
        type: "exec",
    };
    private static defEventOut = BPUtil.defFunOut;



    static getConstNode(ext: string, node?: TBPNode) {
        BPUtil.initConstNode(ext);
        if (null == node) {
            return this._constExtNode[ext];
        }
        //TODO 以后会有对version的判断逻辑
        return this.getConstNodeByID(ext, node.cid);
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
        return this._constExtNode[ext][cid];
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
        }
        if (null == this._constExtNode[ext]) {
            let arr = this.getExtendsNode(ext);
            this._constExtNode[ext] = { ...this._constNode };
            let obj = this._constExtNode[ext];
            for (let i = arr.length - 1; i >= 0; i--) {
                obj[arr[i].id] = arr[i];
            }
        }
    }
    private static getExtendsNode(ext: string) {
        if (null == this.extendsNode[ext]) {
            this.extendsNode[ext] = [];
            let o = extendsData[ext];
            if (o && o.funcs) {
                let funcs = o.funcs;
                for (let i = funcs.length - 1; i >= 0; i--) {
                    let fun = funcs[i];
                    if (fun.isPublic || fun.isProtected) {
                        let cdata: TBPCNode = {
                            name: fun.name,
                            id: fun.name,
                            type: BPType.Function,
                            output: [
                                BPUtil.defEventOut,
                            ]
                        }

                        if (0 == fun.name.indexOf("on") && 'on' != fun.name) {
                            //TODO 暂时以on开头的都是Event
                            cdata.type = BPType.Event;
                        }

                        let params = fun.params;
                        if (params && 0 < params.length) {
                            cdata.input = [...params];
                        }
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
                        this.extendsNode[ext].push(cdata);
                    }
                }
            } else {
                console.warn("没有找到继承:", ext);
            }
        }
        return this.extendsNode[ext];
    }
}