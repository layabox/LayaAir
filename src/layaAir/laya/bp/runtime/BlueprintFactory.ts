//import { BPBaseTest } from "../../build/BPBaseTest";
import { BPType, TBPCNode, TBPNode, TBPStageData, TBPVarProperty } from "../datas/types/BlueprintTypes";

import { TBPNodeData, TBPNodeDef } from "../core/type/TBluePrint";

import { BlueprintExcuteNode } from "./action/BlueprintExcuteNode";
import { BlueprintRuntime } from "./BlueprintRuntime";
import { BlueprintStaticFun } from "./BlueprintStaticFun";
import { IRunAble } from "./interface/IRunAble";
import { BlueprintComplexNode } from "./node/BlueprintComplexNode";
import { BlueprintEventNode } from "./node/BlueprintEventNode";
import { BlueprintFunNode } from "./node/BlueprintFunNode";
import { BlueprintGetVarNode } from "./node/BlueprintGetVarNode";
import { BlueprintRuntimeBaseNode } from "./node/BlueprintRuntimeBaseNode";
import { BlueprintSequenceNode } from "./node/BlueprintSequenceNode";
import { BlueprintSetVarNode } from "./node/BlueprintSetVarNode";
import { BlueprintUtil } from "../core/BlueprintUtil";
import { BlueprintNewTargetNode } from "./node/BlueprintNewTargetNode";
import { RuntimeNodeData } from "./action/RuntimeNodeData";
import { LayaEnv } from "../../../LayaEnv";
import { IBluePrintSubclass } from "../core/interface/IBluePrintSubclass";
import { BlueprintCustomFunNode } from "./node/BlueprintCustomFunNode";
import { BlueprintCustomFunStart } from "./node/BlueprintCustomFunStart";
import { BlueprintCustomFunReturn } from "./node/BlueprintCustomFunReturn";

export class BlueprintFactory {
    private static _funMap: Map<string, [Function, boolean]>;

    private static _instance: BlueprintFactory;

    private static _isInited: boolean;

    //新格式
    private static _bpNewMap: Map<BPType, new () => BlueprintRuntimeBaseNode>;
    static bpNewMap: Map<string, TBPCNode> = new Map();


    /**
     * 根据节点类型创建相应的对象
     * @param type 
     * @param cls 
     */
    static regBPClassNew(type: BPType, cls: new () => BlueprintRuntimeBaseNode) {
        this._bpNewMap.set(type, cls);
    }

    static regFunction(fname: string, fun: Function, isMember: boolean = false) {
        this._funMap.set(fname, [fun, isMember]);
    }

    static getFunction(fname: string) {
        return this._funMap.get(fname);
    }

    static __init__() {
        if (!this._isInited) {
            this._funMap = new Map();
            this._isInited = true;

            this._bpNewMap = new Map();
            this.regBPClassNew(BPType.Event, BlueprintEventNode);
            this.regBPClassNew(BPType.Pure, BlueprintRuntimeBaseNode);
            this.regBPClassNew(BPType.Operator, BlueprintRuntimeBaseNode);
            this.regBPClassNew(BPType.Function, BlueprintFunNode);
            this.regBPClassNew(BPType.GetValue, BlueprintGetVarNode);
            this.regBPClassNew(BPType.SetValue, BlueprintSetVarNode);
            this.regBPClassNew(BPType.Branch, BlueprintComplexNode);
            this.regBPClassNew(BPType.Sequence, BlueprintSequenceNode);
            this.regBPClassNew(BPType.NewTarget, BlueprintNewTargetNode);
            this.regBPClassNew(BPType.CustomFun, BlueprintCustomFunNode);
            this.regBPClassNew(BPType.CustomFunStart, BlueprintCustomFunStart);
            this.regBPClassNew(BPType.CustomFunReturn, BlueprintCustomFunReturn);


            this.regFunction("printString", BlueprintStaticFun.print);
            this.regFunction("branch", BlueprintStaticFun.branch);
            this.regFunction("event_on", function (eventName: string, cb: Function) {
                //@ts-ignore
                this.on(eventName, this, cb);

            }, true);

            this.regFunction("event_call", function (eventName: string, ...args: any[]) {
                //@ts-ignore
                this.event(eventName, args);

            }, true);
            this.regFunction("event_off", function (eventName: string, cb: Function) {
                //@ts-ignore
                this.off(eventName, this, cb);

            }, true);
            this.regFunction("event_offAll", function (eventName: string, cb: Function) {
                //@ts-ignore
                this.offAll(eventName);

            }, true);


            this.regFunction("add", BlueprintStaticFun.add);
            this.regFunction("waitTime", BlueprintStaticFun.waitTime);
            this.regFunction("get", BlueprintStaticFun.getVariable);

            this.regFunction("set", BlueprintStaticFun.setVariable);

            //this.regFunction("test",BPBaseTest.prototype.test,true);

            // definejson.forEach(def => {
            //     this.bPMap.set(def.id, def);
            // });
        }
    }


    static createClsNew<T>(name: string, parentName: string, cls: T, data: TBPStageData, funs: TBPStageData[], varMap: Record<string, TBPVarProperty>): T {
        let bpjson: TBPNode[] = data.arr;


        function classFactory(className: string, SuperClass: any) {
            return {
                [className]: class extends SuperClass implements IBluePrintSubclass {
                    bp: BlueprintRuntime;

                    __eventList__: string[];

                    context: IRunAble;
                    constructor(...args: any) {
                        super(...args);
                        //Object.assign(this, properties);
                        this.context = new BlueprintExcuteNode(this);
                        let varMap = this.bp.varMap;
                        if (varMap) {
                            for (let str in varMap) {
                                this.context.setVar(varMap[str].name, varMap[str].value);
                                //a[str]
                            }
                        }
                        this._bp_init_();
                        //this.context = new BPExcuteDebuggerNode(this);
                    }

                    _bp_init_() {
                        if (this.__eventList__) {
                            this.__eventList__.forEach(value => {
                                let _this = this;
                                this.on(value, this, function () {
                                    _this.bp.run(_this.context, value, Array.from(arguments));
                                })
                            })
                        }
                    }

                    get _bp_contextData(){
                        let out:any = {}
                        for (const key in this.bp.varMap) {
                            let prop = this.bp.varMap[key];
                            out[prop.name] = this.context.getVar(prop.name);
                        }
                        return out
                    }

                    set _bp_contextData(value:any){
                        if (!value)
                            return
                        for (const key in value) {
                            this.context.setVar(key,value[key]);
                        }
                    }

                    // onAwake() {
                    //     this.bp.run(this.context, "onAwake", null);
                    // }
                }
            }[className];
        }

        let newClass = classFactory(name, cls);
        let bp = newClass.prototype.bp = new BlueprintRuntime();
        bp.dataMap = data.dataMap;
        // debugger;
        let c = function (node: TBPNode): TBPCNode {
            return BlueprintUtil.getConstNode("Node", node, data) as TBPCNode;
        }
        bp.parse(bpjson, c, varMap);
        funs.forEach(fun => {
            bp.parseFunction(fun.id, fun.arr, c);
        })
        this.initEventFunc(parentName, newClass);
        this.initClassHook(parentName, newClass);
        Object.defineProperty(newClass, 'name', { value: name });

        return newClass as unknown as T;
    }

    static initEventFunc(parent: string, cls: Function) { // todo
        if (!LayaEnv.isPlaying) {
            return
        }
        let dec = BlueprintUtil.getDeclaration(parent);
        if (dec && dec.funcs) {
            for (let i = 0, len = dec.funcs.length; i < len; i++) {
                let func = dec.funcs[i];
                if (func.type == "event") {
                    let eventList = cls.prototype.__eventList__;
                    if (!eventList) {
                        eventList = cls.prototype.__eventList__ = [];
                    }

                    let funcName = func.name;
                    let originFunc: Function = cls.prototype[funcName];
                    eventList.push(funcName);
                    cls.prototype[funcName] = function (...args:any[]) {
                        originFunc && originFunc.call(this, args);
                        this.bp.run(this.context, funcName, args);
                    }
                }
            }
        }
    }

    //给编辑时的钩子
    static initClassHook(parent: string, cls: Function){
        
    }


    static get instance(): BlueprintFactory {
        if (!this._instance) {
            this._instance = new BlueprintFactory();
        }
        return this._instance;
    }

    createNew(config: TBPCNode, id: number) {
        let cls = BlueprintFactory._bpNewMap.get(config.type);
        let result = new cls();
        result.nid = id;
        result.parse(config);
        return result;
    }
}