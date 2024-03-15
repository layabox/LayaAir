//import { BPBaseTest } from "../../build/BPBaseTest";
import { BPType, TBPCNode, TBPNode, TBPStageData, TBPVarProperty } from "../datas/types/BlueprintTypes";
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
import { IBluePrintSubclass } from "../core/interface/IBluePrintSubclass";
import { BlueprintCustomFunNode } from "./node/BlueprintCustomFunNode";
import { BlueprintCustomFunStart } from "./node/BlueprintCustomFunStart";
import { BlueprintCustomFunReturn, BlueprintCustomFunReturnContext } from "./node/BlueprintCustomFunReturn";
import { BluePrintAsNode } from "./node/BlueprintAsNode";
import { BluePrintBlockNode } from "./node/BlueprintBlockNode";
import { BPMathLib } from "../export/BPMathLib";
import { BlueprintGetTempVarNode } from "./node/BlueprintGetTempVarNode";
import { BlueprintSetTempVarNode } from "./node/BlueprintSetTempVarNode";
import { BPArray } from "../export/BPArray";

export class BlueprintFactory {
    public static readonly bpSymbol: unique symbol = Symbol("bpruntime");
    public static readonly contextSymbol: unique symbol = Symbol("context");
    private static _funMap: Map<string, [Function, boolean]>;

    private static _instance: BlueprintFactory;

    private static _isInited: boolean;

    //新格式
    private static _bpMap: Map<BPType, new () => BlueprintRuntimeBaseNode>;
    //上下文
    private static _bpContextMap: Map<BPType, new () => RuntimeNodeData>;
    static bpNewMap: Map<string, TBPCNode> = new Map();

    static BPExcuteCls: any;
    static BPRuntimeCls: any;

    /**
     * 根据节点类型创建相应的对象
     * @param type 
     * @param cls 
     */
    static regBPClass(type: BPType, cls: new () => BlueprintRuntimeBaseNode) {
        this._bpMap.set(type, cls);
    }

    static regFunction(fname: string, fun: Function, isMember: boolean = false, cls: any = null, target: string = "system") {
        if (isMember == false && cls && fun) {
            fun = fun.bind(cls);
        }
        this._funMap.set(fname + "_" + target, [fun, isMember]);
    }

    static getFunction(fname: string, target: string) {
        return this._funMap.get(fname + "_" + target);
    }

    static regBPContextData(type: BPType, cls: new () => RuntimeNodeData) {
        this._bpContextMap.set(type, cls);
    }

    static getBPContextData(type: BPType): new () => RuntimeNodeData {
        return this._bpContextMap.get(type) || RuntimeNodeData;
    }

    static __init__() {
        BPMathLib;
        BPArray;
        if (!this._isInited) {

            this.BPRuntimeCls = BlueprintRuntime;
            this.BPExcuteCls = BlueprintExcuteNode;

            this._funMap = new Map();
            this._isInited = true;

            this._bpMap = new Map();
            this._bpContextMap = new Map();
            this.regBPClass(BPType.Event, BlueprintEventNode);
            this.regBPClass(BPType.Pure, BlueprintRuntimeBaseNode);
            this.regBPClass(BPType.Operator, BlueprintRuntimeBaseNode);
            this.regBPClass(BPType.Function, BlueprintFunNode);
            this.regBPClass(BPType.GetValue, BlueprintGetVarNode);
            this.regBPClass(BPType.SetValue, BlueprintSetVarNode);

            this.regBPClass(BPType.GetTmpValue, BlueprintGetTempVarNode);
            this.regBPClass(BPType.SetTmpValue, BlueprintSetTempVarNode);

            this.regBPClass(BPType.Branch, BlueprintComplexNode);
            this.regBPClass(BPType.Sequence, BlueprintSequenceNode);
            this.regBPClass(BPType.NewTarget, BlueprintNewTargetNode);
            this.regBPClass(BPType.CustomFun, BlueprintCustomFunNode);
            this.regBPClass(BPType.CustomFunStart, BlueprintCustomFunStart);
            this.regBPClass(BPType.CustomFunReturn, BlueprintCustomFunReturn);
            this.regBPClass(BPType.Block, BluePrintBlockNode);
            this.regBPClass(BPType.Assertion, BluePrintAsNode);

            this.regBPContextData(BPType.CustomFunReturn, BlueprintCustomFunReturnContext);


            //this.regFunction("equal", BlueprintStaticFun.equal);
            //this.regFunction("printString", BlueprintStaticFun.print);
            this.regFunction("branch", BlueprintStaticFun.branch);
            this.regFunction("forEach", BlueprintStaticFun.forEach);
            this.regFunction("forEachWithBreak", BlueprintStaticFun.forEachWithBreak);
            this.regFunction("forLoop", BlueprintStaticFun.forLoop);
            this.regFunction("forLoopWithBreak", BlueprintStaticFun.forLoopWithBreak);
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


            //  this.regFunction("add", BlueprintStaticFun.add);
            //  this.regFunction("waitTime", BlueprintStaticFun.waitTime);
            this.regFunction("get", BlueprintStaticFun.getVariable);
            this.regFunction("static_get", BlueprintStaticFun.getVariable);
            this.regFunction("get_self", BlueprintStaticFun.getSelf);
            this.regFunction("set", BlueprintStaticFun.setVariable);
            this.regFunction("tmp_get", BlueprintStaticFun.getTempVar);
            this.regFunction("tmp_set", BlueprintStaticFun.setTempVar);
            this.regFunction("static_set", BlueprintStaticFun.setVariable);
            this.regFunction("expression", BlueprintStaticFun.expression);
            this.regFunction("instanceof", BlueprintStaticFun.typeInstanceof);

            //this.regFunction("test",BPBaseTest.prototype.test,true);

            // definejson.forEach(def => {
            //     this.bPMap.set(def.id, def);
            // });
        }
    }


    static createClsNew<T>(name: string, isPlaying: boolean, cls: T, data: TBPStageData, funs: TBPStageData[], varMap: Record<string, TBPVarProperty>): T {
        function classFactory(className: string, SuperClass: any) {
            return {
                [className]: class extends SuperClass implements IBluePrintSubclass {
                    static [BlueprintFactory.contextSymbol]: IRunAble;

                    __eventList__: string[];
                    [BlueprintFactory.bpSymbol]: BlueprintRuntime;
                    [BlueprintFactory.contextSymbol]: IRunAble;
                    constructor(...args: any) {
                        super(...args);
                        //Object.assign(this, properties);
                        this[BlueprintFactory.contextSymbol] = new BlueprintFactory.BPExcuteCls(this);
                        let varMap = this[BlueprintFactory.bpSymbol].varMap;
                        if (varMap) {
                            for (let str in varMap) {
                                this[BlueprintFactory.contextSymbol].initVar(varMap[str].name, varMap[str].value);
                                //a[str]
                            }
                        }
                        this._bp_init_();
                        //this.context = new BPExcuteDebuggerNode(this);
                    }

                    _bp_init_() {
                        let autoRegs = this[BlueprintFactory.bpSymbol].mainBlock.autoAnonymousfuns;
                        if (autoRegs) {
                            autoRegs.forEach(value => {
                                let _this = this;
                                this.on(value.eventName, this, function () {
                                    _this[BlueprintFactory.bpSymbol].run(_this[BlueprintFactory.contextSymbol], value, Array.from(arguments), null);
                                })
                            })
                        }
                    }

                    get _bp_contextData() {
                        let out: any = {};
                        let bp = this[BlueprintFactory.bpSymbol];
                        for (const key in bp.varMap) {
                            let prop = bp.varMap[key];
                            out[prop.name] = this[BlueprintFactory.contextSymbol].getVar(prop.name);
                        }
                        return out
                    }

                    set _bp_contextData(value: any) {
                        if (!value)
                            return
                        for (const key in value) {
                            this[BlueprintFactory.contextSymbol].setVar(key, value[key]);
                        }
                    }

                    // onAwake() {
                    //     this.bp.run(this.context, "onAwake", null);
                    // }
                }
            }[className];
        }

        let newClass = classFactory(name, cls);
        newClass[BlueprintFactory.contextSymbol] = new BlueprintFactory.BPExcuteCls(newClass);
        BlueprintUtil.regClass(name, newClass);
        let bp:BlueprintRuntime = newClass.prototype[BlueprintFactory.bpSymbol] = new BlueprintFactory.BPRuntimeCls();
        bp.dataMap = data.dataMap;
        // debugger;
        let c = function (node: TBPNode): TBPCNode {
            return BlueprintUtil.getConstNode(node) as TBPCNode;
        }
        bp.varMap = varMap;
        if (isPlaying) {
            bp.parse(data, c, varMap, newClass);
            funs.forEach(fun => {
                bp.parseFunction(fun, c);
            })
        }
        this.initClassHook(name, newClass);
        Object.defineProperty(newClass, 'name', { value: name });

        return newClass as unknown as T;
    }

    //给编辑时的钩子
    static initClassHook(parent: string, cls: Function) {

    }


    static get instance(): BlueprintFactory {
        if (!this._instance) {
            this._instance = new BlueprintFactory();
        }
        return this._instance;
    }

    createNew(config: TBPCNode, item: TBPNode) {
        let cls = BlueprintFactory._bpMap.get(config.type) || BlueprintRuntimeBaseNode;
        let result = new cls();
        result.nid = item.id;
        if (item.autoReg) {
            (result as BlueprintEventNode).autoReg = item.autoReg;
        }
        result.parse(config);
        return result;
    }
}