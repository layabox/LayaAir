import { UniformBufferParamsType, UnifromBufferData } from "./UniformBufferData";
export class SubUniformBufferData extends UnifromBufferData{
    
    /**@internal */
    _offset:number;

    /**@interanl */
    _isInPool:boolean = false;

    /**@interanl */
    _needUpdate:boolean = false;

    /**@internal */
    _realByte = 0;
    /**
     * create UniformBufferData Instance
     * @param uniformParamsStat Params describe
     */
    constructor(uniformParamsStat: Map<number, UniformBufferParamsType>,bufferOffset:number) {
        super(uniformParamsStat);
        this._offset = bufferOffset;
        this._realByte = this._bytelength;
        this._bytelength =Math.ceil(this._bytelength/256)*256;
    }


}


