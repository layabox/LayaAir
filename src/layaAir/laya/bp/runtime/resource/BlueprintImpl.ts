
import { HierarchyLoader } from "../../../loaders/HierarchyLoader";
import { ILoadTask } from "../../../net/Loader";
import { URL } from "../../../net/URL";
import { IHierarchyParserAPI } from "../../../resource/PrefabImpl";
import { Resource } from "../../../resource/Resource";
import { ClassUtils } from "../../../utils/ClassUtils";
import { TBPEventProperty, TBPNode, TBPSaveData, TBPVarProperty } from "../../datas/types/BlueprintTypes";
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

    constructor(data: any, task: ILoadTask, version?: number) {
        super();

        this.data = data;
        this.version = version;
        this.uuid = task.uuid;
        this.url = task.url;
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
        let runtime = ClassUtils.getClass(extendClass);

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

        for (const key in map) {
            let item = map[key];
            arr.push.apply(arr, item.arr);
        }
        let dataMap: Record<string, TBPVarProperty | TBPEventProperty> = {}
        let varMap: Record<string, TBPVarProperty> = {};
        if (this.data.variable)
            this.data.variable.forEach((ele: any) => {
                dataMap[ele.id] = ele;
                varMap[ele.id] = ele;
            });
        if (this.data.events)
            this.data.events.forEach((ele: any) => {
                dataMap[ele.id] = ele;
            });

        let cls = BlueprintFactory.createClsNew(this.uuid, extendClass, runtime, {
            name: this.uuid,
            dataMap,
            arr
        }, this.data.functions, varMap);

        this._cls = cls;
        // }
        ClassUtils.regClass(this.uuid, this.cls);
    }

    protected _disposeResource(): void {
        super._disposeResource();
        delete ClassUtils._classMap[this.uuid];
    }
}