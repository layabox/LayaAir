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
        this.initConstNode(ext);
        if (null == node) {
            return this._constExtNode[ext];
        }
        //TODO 以后会有对version的判断逻辑
        return this.getConstNodeByID(ext, node.cid);
    }
    static getConstNodeByID(ext: string, cid: string, ver?: number) {
        return this._constExtNode[ext][cid];
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
            let o = extendsData[ext];
            if (o) {
                this._constExtNode[ext] = { ...this._constNode };
                let obj = this._constExtNode[ext];
                if (null == this.extendsNode[ext]) {
                    this.extendsNode[ext] = [];
                }
                for (let k2 in o) {
                    let id = k2;
                    let cdata: TBPCNode = {
                        name: k2,
                        id: id,
                        type: BPType.Event,
                        output: [
                            BPUtil.defEventOut,
                        ]
                    };
                    this.extendsNode[ext].push(cdata);
                    obj[cdata.id] = cdata;
                }
            }
        }
    }

}