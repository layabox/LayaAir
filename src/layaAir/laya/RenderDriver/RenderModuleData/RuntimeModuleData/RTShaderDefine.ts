import { ShaderDefine } from "../Design/ShaderDefine";

export class RTShaderDefine extends ShaderDefine {
    _nativeobj: any;
    constructor(index: number, value: number) {
        super(index, value);
        this._nativeobj = new (window as any).conchShaderDefine(index, value);
    }
}