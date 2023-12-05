
import { Resource } from "../../../resource/Resource";
import { IBPParserAPI } from "./BPParserAPI";

export class BPImpl extends Resource{
    public readonly version:number;

    /** @private */
    public data:any;

    public api:IBPParserAPI;

    constructor(api:IBPParserAPI , data:any , version?:number){
        super();

        this.api = api;
        this.data = data;
        this.version = version
    }

    create(options?: Record<string, any>, errors?: any[]){
        let result = this.api.parse(this.data,options,errors);
        return result;
    }

}