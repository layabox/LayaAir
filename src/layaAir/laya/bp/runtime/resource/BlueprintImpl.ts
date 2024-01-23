
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
import { BlueprintFactory } from "../BlueprintFactory";

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
        if (this.data.lhData) {
            let api: IHierarchyParserAPI;
            let lhData = this.data.lhData;
            api = HierarchyLoader.v3;
            this.data.lhData._$type = this.uuid;

            result = api.parse(lhData, options, errors);
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
            extends: [this.data.extends]
        }

        for (const key in map) {
            let item = map[key];
            arr.push.apply(arr, item.arr);
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
                    modifiers: {
                        isPublic: true
                    }
                }

                if (ele.const) {
                    decProp.modifiers.isPublic = false;
                    decProp.modifiers.isPrivate = true;
                }
                decProps.push(decProp);
            });
        }

        if (this.data.events)
            this.data.events.forEach((ele: any) => {
                dataMap[ele.id] = ele;
            });

        if (this.data.functions) {
            let funcs = dec.funcs;
            this.data.functions.forEach((ele) => {
                //@ts-ignore
                dataMap[ele.id] = ele;

                let func: TBPDeclarationFunction = {
                    name: ele.name,
                    type: "function",
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
                            type: input.type
                        }
                        params.push(param);
                    }
                }

                //@ts-ignore
                let outputs = ele.output;
                if (outputs) {
                    let returnType:any[] = [];
                    for (let j = 0, len = outputs.length; j < len; j++) {
                        let output = outputs[j];
                        returnType.push({name:output.name,type:output.type});
                    }
                    func.returnType = returnType;
                }

                funcs.push(func);
            })
        }

        let cls = BlueprintFactory.createClsNew(this.uuid, extendClass, runtime, {
            id: 0,
            name: this.uuid,
            dataMap,
            arr
        }, this.data.functions, varMap);

        this._cls = cls;
        this.dec = dec;

        if (this.cls.prototype instanceof Component) {
            dec.type = "Component";
        }
        // }
        ClassUtils.regClass(this.uuid, this.cls);
        ClassUtils.regClass(this.typeName, Object);

        BlueprintUtil.addCustomData(this.uuid, dec);
    }

    protected _disposeResource(): void {
        super._disposeResource();
        delete ClassUtils._classMap[this.uuid];
        delete ClassUtils._classMap[this.typeName];
    }
}