
import { LayaEnv } from "../../../../LayaEnv";
import { HierarchyLoader } from "../../../loaders/HierarchyLoader";
import { HierarchyParser } from "../../../loaders/HierarchyParser";
import { IHierarchyParserAPI } from "../../../resource/PrefabImpl";
import { Resource } from "../../../resource/Resource";
import { ClassUtils } from "../../../utils/ClassUtils";
import { TBPNode, TBPVarProperty } from "../../datas/types/BlueprintTypes";
import { BlueprintFactory } from "../BlueprintFactory";

export class BlueprintImpl extends Resource{
    public readonly version:number;

    /** @private */
    public data:any;

    public state:-1|0|1 = 0;

    constructor( data:any, version?:number){
        super();

        this.data = data;
        this.version = version
    }

    _setCreateURL(url: string, uuid?: string): void {
        super._setCreateURL(url,uuid);
        //todo
    }

    create(options?: Record<string, any>, errors?: any[]){
        if (!this.state) {
            this.initClass();
        }

        if (this.state == -1) {
            console.error("JSON Extends is undefined!");
            return null;
        }

        let result;
        if (this.data.lhData) {
            let api:IHierarchyParserAPI;
            let lhData = this.data.lhData;
            if (lhData._$ver != null)
                api = HierarchyParser;

            result = api.parse(lhData , options, errors); 
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

    public initClass(){
        let extendClass = this.data.extends;
        let runtime = ClassUtils.getClass(extendClass);
        if (!runtime) {
            this.state = -1;
            return ;
        }

        if (!LayaEnv.isPlaying) {
            ClassUtils.regClass(this.uuid , runtime);
        }else{
            BlueprintFactory.__init__();
            let map = this.data.blueprintArr;
            let arr:TBPNode[] = [];
    
            for (const key in map) {
               let item = map[key];
               arr.push.apply(arr,item.arr);
            }
            let varMap:Record<string,TBPVarProperty> = {}
            this.data.variable.forEach((ele:any) => {
                varMap[ele.name] = ele;
            });
            
            let cls = BlueprintFactory.createClsNew(this.uuid,runtime,{
                name:"",
                varMap,
                arr
            });
            this.data.lhData._$type = this.uuid;
            ClassUtils.regClass(this.uuid,cls);
        }

    }

    protected _disposeResource(): void {
        super._disposeResource();
        delete ClassUtils._classMap[this.uuid];
    }
}