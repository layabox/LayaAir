import { ShaderDefine } from "../Design/ShaderDefine";

export class RTShaderDefine extends ShaderDefine {
    //_nativeObj: any;
    constructor(index: number, value: number) {
        super(index, value);
        //this._nativeObj = new (window as any).conchRTShaderDefine(index, value);
    }
}