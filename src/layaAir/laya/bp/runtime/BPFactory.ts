//import { BPBaseTest } from "../../build/BPBaseTest";
import { BPType, TBPCNode, TBPNode, TBPVarProperty } from "../datas/types/BlueprintTypes";

import { TBPNodeData, TBPNodeDef } from "../core/type/TBluePrint";

import { BPExcuteNode } from "./action/BPExcuteNode";
import { BPRuntime } from "./BPRuntime";
import { BPStaticFun } from "./BPStaticFun";
import { IRunAble } from "./interface/IRunAble";
import { BPComplexNode } from "./node/BPComplexNode";
import { BPEventNode } from "./node/BPEventNode";
import { BPFunNode } from "./node/BPFunNode";
import { BPGetVarNode } from "./node/BPGetVarNode";
import { BPRuntimeBaseNode } from "./node/BPRuntimeBaseNode";
import { BPSequenceNode } from "./node/BPSequenceNode";
import { BPSetVarNode } from "./node/BPSetVarNode";
import { BPUtil } from "../core/BPUtil";

export class BPFactory {
    private static _funMap: Map<string, [Function,boolean]>;

    private static _instance: BPFactory;

    private static _isInited: boolean;

    //新格式
    private static _bpNewMap: Map<BPType, new () => BPRuntimeBaseNode>;
    static bpNewMap: Map<string, TBPCNode> = new Map();


    /**
     * 根据节点类型创建相应的对象
     * @param type 
     * @param cls 
     */
    static regBPClassNew(type: BPType, cls: new () => BPRuntimeBaseNode) {
        this._bpNewMap.set(type, cls);
    }

    static regFunction(fname: string, fun: Function,isMember:boolean=false) {
        this._funMap.set(fname, [fun,isMember]);
    }

    static getFunction(fname: string) {
        return this._funMap.get(fname);
    }

    static __init__() {
        if (!this._isInited) {
            this._funMap = new Map();
            this._isInited = true;

            this._bpNewMap = new Map();
            this.regBPClassNew(BPType.Event, BPEventNode);
            this.regBPClassNew(BPType.Pure, BPRuntimeBaseNode);
            this.regBPClassNew(BPType.Operator, BPRuntimeBaseNode);
            this.regBPClassNew(BPType.Function, BPFunNode);
            this.regBPClassNew(BPType.GetValue, BPGetVarNode);
            this.regBPClassNew(BPType.SetValue, BPSetVarNode);
            this.regBPClassNew(BPType.Branch, BPComplexNode);
            this.regBPClassNew(BPType.Sequnece, BPSequenceNode);

            this.regFunction("printString", BPStaticFun.print);
            this.regFunction("branch", BPStaticFun.branch);

            this.regFunction("add",BPStaticFun.add);
            this.regFunction("waitTime",BPStaticFun.waitTime);
            this.regFunction("get",BPStaticFun.getVariable);

            this.regFunction("set",BPStaticFun.setVariable);

            //this.regFunction("test",BPBaseTest.prototype.test,true);

            // definejson.forEach(def => {
            //     this.bPMap.set(def.id, def);
            // });
        }
    }


    static createClsNew<T>(name: string, cls: T, bpjson: TBPNode[],varMap:Record<string, TBPVarProperty>): T {
        function classFactory(className: string, SuperClass: any) {
            return {
                [className]: class extends SuperClass {
                    bp: BPRuntime;

                    context: IRunAble;
                    constructor(...args: any) {
                        super(...args);
                        //Object.assign(this, properties);
                        this.context = new BPExcuteNode(this);
                        let varMap=this.bp.varMap;
                        if(varMap){
                            for(let str in varMap){
                                this.context.setVar(str,varMap[str].value);
                                //a[str]
                            }
                        }
                        //this.context = new BPExcuteDebuggerNode(this);
                    }

                    onAwake() {
                        this.bp.run(this.context, "onAwake", null);
                    }
                }
            }[className];
        }

        let newClass = classFactory(name, cls);
        let bp = newClass.prototype.bp = new BPRuntime();
        // debugger;
        let c=function(node:TBPNode):TBPCNode{
            return BPUtil.getConstNode("Node",node) as TBPCNode;
        }
        bp.parseNew(bpjson,c,varMap);
        Object.defineProperty(newClass, 'name', { value: name });
        return newClass as unknown as T;
    }


    static get instance(): BPFactory {
        if (!this._instance) {
            this._instance = new BPFactory();
        }
        return this._instance;
    }

    createNew(config: TBPCNode) {
        let cls = BPFactory._bpNewMap.get(config.type);
        let result = new cls();
        result.parseNew(config);
        return result;
    }
}