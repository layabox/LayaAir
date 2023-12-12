
import { Resource } from "../../../resource/Resource";
import { ClassUtils } from "../../../utils/ClassUtils";
import { BPFactory } from "../BPFactory";
import { IBPParserAPI } from "./BPParserAPI";

export class BPImpl extends Resource{
    public readonly version:number;

    /** @private */
    public data:any;

    public api:IBPParserAPI;

    public state:-1|0|1 = 0;

    constructor(api:IBPParserAPI , data:any, version?:number){
        super();

        this.api = api;
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

        let result = this.api.parse(this.data,options,errors);
        return result;
    }

    public initClass(){
        let extendClass = this.data.extends;
        let runtime = ClassUtils.getClass(extendClass);
        if (!runtime) {
            this.state = -1;
            return ;
        }
        BPFactory.createClsNew(this.uuid,runtime,this.data)
    }
}