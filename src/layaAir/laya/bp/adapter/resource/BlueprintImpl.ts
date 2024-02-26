
import { Component } from "../../../components/Component";
import { HierarchyLoader } from "../../../loaders/HierarchyLoader";
import { ILoadTask } from "../../../net/Loader";
import { URL } from "../../../net/URL";
import { IHierarchyParserAPI } from "../../../resource/PrefabImpl";
import { Resource } from "../../../resource/Resource";
import { ClassUtils } from "../../../utils/ClassUtils";
import { BlueprintUtil } from "../../core/BlueprintUtil";
import { TBPDeclaration, TBPDeclarationFunction, TBPDeclarationParam, TBPDeclarationProp } from "../../datas/types/BlueprintDeclaration";
import { TBPEventProperty, TBPNode, TBPSaveData, TBPStageData, TBPVarProperty } from "../../datas/types/BlueprintTypes";
import { BlueprintFactory } from "../../runtime/BlueprintFactory";
import { BlueprintData } from "../../core/BlueprintData";
import { LayaEnv } from "../../../../LayaEnv";

export class BlueprintImpl extends Resource {

    public readonly version: number;

    /** @private */
    public data: TBPSaveData;

    public state: -1 | 0 | 1 = 0;
    /** */
    private _cls: Function;
    public get cls(): Function {
        return this._cls;
    }

    public typeName: string;

    public dec: TBPDeclaration;

    constructor(data: any, task: ILoadTask, version?: number) {
        super();

        this.data = data;
        this.version = version;
        this.uuid = task.uuid;
        this.url = task.url;
        this.typeName = this.uuid + "_propType";
        this.name = URL.getFileName(task.url);
        this.initClass();
    }

    create(options?: Record<string, any>, errors?: any[]) {
        if (this.state == -1) {
            console.error("JSON Extends is undefined!");
            return null;
        }

        let result;
        let source = this.data.source;
        if (source) {
            let api: IHierarchyParserAPI;
            api = HierarchyLoader.v3;
            source._$type = this.uuid;

            result = api.parse(source, options, errors);
            if (Array.isArray(result)) {
                if (result.length == 1) {
                    result[0].url = this.url;
                }
                result = result[0];
            }
            else {
                result.url = this.url;
            }
        }

        return result;
    }
    constData: Record<string, any> = {};
    allData: Record<string, any>;

    // getConstNodeById(cid: string, dataId: string) {
    //     let id = cid + "_" + dataId;
    //     if (null != this._constData[id]) return this._constData[id];

    //     let cdata = BlueprintUtil.clone(BlueprintUtil._constNode[cid]);
    //     let data = this._allData[dataId];
    //     let setData = this._constData;

    //     if (null == data) {
    //         setData = BlueprintUtil.constAllVars;
    //         data = BlueprintUtil.constAllVars[dataId];
    //     }

    //     let arr = data.input;
    //     if (BPType.CustomFunReturn != cdata.type) {
    //         if (arr) {
    //             for (let i = 0, len = arr.length; i < len; i++) {
    //                 if (null == arr[i].name || "" == arr[i].name.trim()) continue;
    //                 if (BPType.Event == cdata.type || BPType.CustomFunStart == cdata.type) {
    //                     if (null == cdata.output) cdata.output = [];
    //                     cdata.output.push(arr[i]);
    //                 } else {
    //                     if (null == cdata.input) cdata.input = [];
    //                     cdata.input.push(arr[i]);
    //                 }
    //             }
    //         }
    //     }
    //     if (BPType.CustomFunStart != cdata.type && BPType.Event != cdata.type && 'event_call' != cdata.name) {
    //         arr = data.output;
    //         if (arr) {
    //             for (let i = 0, len = arr.length; i < len; i++) {
    //                 if (null == arr[i].name || "" == arr[i].name.trim()) continue;
    //                 if (BPType.CustomFunReturn == cdata.type) {
    //                     if (null == cdata.input) cdata.input = [];
    //                     cdata.input.push(arr[i]);
    //                 } else {
    //                     if (null == cdata.output) cdata.output = [];
    //                     cdata.output.push(arr[i]);
    //                 }
    //             }
    //         }
    //     }


    //     setData[id] = cdata;
    //     return cdata;
    // }
    private _initTarget(arr: TBPNode[]) {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (null != arr[i].dataId && null == arr[i].target) {
                arr[i].target = this.uuid;
            }
        }
    }

    public initClass() {
        let extendClass = this.data.extends;
        let runtime = BlueprintUtil.getClass(extendClass);

        if (!runtime) {
            this.state = -1;
            return;
        }

        // if (!LayaEnv.isPlaying && this.data.lhData) {
        //     this._cls = runtime;
        // } else {
        //     BlueprintFactory.__init__();
        let map = this.data.blueprintArr;
        let arr: TBPNode[] = [];

        // TBPDeclaration
        let dec: TBPDeclaration = {
            type: "Node",
            name: this.name,
            props: [],
            funcs: [],
            events: [],
            extends: [this.data.extends],
        }

        for (const key in map) {
            let item = map[key];
            arr.push.apply(arr, item.arr);
            this._initTarget(item.arr);
        }

        let dataMap: Record<string, TBPVarProperty | TBPEventProperty> = {}
        let varMap: Record<string, TBPVarProperty> = {};

        if (this.data.variable) {
            let decProps = dec.props;
            this.data.variable.forEach((ele) => {
                dataMap[ele.id] = ele;
                varMap[ele.id] = ele;
                let decProp: TBPDeclarationProp = {
                    name: ele.name,
                    type: ele.type as string,
                    customId: ele.id,
                    modifiers: {
                        isPublic: true
                    },
                    value: ele.value,
                }

                // if (ele.const) {
                //     decProp.modifiers.isPublic = false;
                //     decProp.modifiers.isPrivate = true;
                // }
                decProps.push(decProp);
            });
        }

        if (this.data.events)
            this.data.events.forEach((ele: any) => {
                dataMap[ele.id] = ele;
                dec.events.push(ele);
            });

        if (this.data.functions) {
            let funcs = dec.funcs;
            let decProps = dec.props;
            this.data.functions.forEach((ele) => {
                //@ts-ignore
                dataMap[ele.id] = ele;

                if (ele.variable) {
                    ele.variable.forEach((ele) => {
                        dataMap[ele.id] = ele;
                        //varMap[ele.id] = ele;

                        // let decProp: TBPDeclarationProp = {
                        //     name: ele.name,
                        //     type: ele.type as string,
                        //     modifiers: {
                        //         isPublic: true
                        //     }
                        // }

                        // if (ele.const) {
                        //     decProp.modifiers.isPublic = false;
                        //     decProp.modifiers.isPrivate = true;
                        // }
                        //decProps.push(decProp);
                    });
                }

                this._initTarget(ele.arr);

                let func: TBPDeclarationFunction = {
                    name: ele.name,
                    type: "function",
                    customId: ele.id,
                    params: [

                    ],
                    modifiers: {
                        isPublic: true
                    },
                    returnType: "void"
                }

                //@ts-ignore
                let inputs = ele.input;
                if (inputs) {
                    let params = func.params;
                    for (let j = 0, len = inputs.length; j < len; j++) {
                        let input = inputs[j];
                        let param: TBPDeclarationParam = {
                            name: input.name,
                            type: input.type,
                            id: input.id,
                        }
                        params.push(param);
                    }
                }

                //@ts-ignore
                let outputs = ele.output;
                if (outputs) {
                    let returnType: any[] = [];
                    for (let j = 0, len = outputs.length; j < len; j++) {
                        let output = outputs[j];
                        returnType.push({ name: output.name, type: output.type, id: output.id });
                    }
                    func.returnType = returnType;
                }

                funcs.push(func);
            })
        }

        if (runtime.prototype instanceof Component) {
            dec.type = "Component";
        }
        this.dec = dec;
        BlueprintUtil.addCustomData(this.uuid, dec);

        this.allData = dataMap;
        BlueprintData.allDataMap.set(this.uuid, dataMap);
        let cls = BlueprintFactory.createClsNew(this.uuid, LayaEnv.isPlaying, runtime, {
            id: 0,
            name: this.uuid,
            dataMap,
            arr
        }, this.data.functions, varMap);

        this._cls = cls;

        // }
        ClassUtils.regClass(this.typeName, Object);

    }

    get obsolute(): boolean {
        return false;
    }

    set obsolute(value: boolean) {
        // this._obsolute = value;
    }

    protected _disposeResource(): void {
        super._disposeResource();
        delete ClassUtils._classMap[this.uuid];
        delete ClassUtils._classMap[this.typeName];
    }
}