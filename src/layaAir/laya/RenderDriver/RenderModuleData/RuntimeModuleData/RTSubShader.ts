import { ISubshaderData } from "../Design/ISubShaderData";
import { RTShaderPass } from "./RTShaderPass";

export class RTSubShader implements ISubshaderData {

    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchRTSubShader();
    }
    get enableInstance() {
        return this._nativeObj.enableInstance;
    }
    set enableInstance(value: boolean) {
        this._nativeObj.enableInstance = value;
    }
    destroy(): void {
        this._nativeObj.destroy();
    }
    addShaderPass(pass: RTShaderPass): void {
        this._nativeObj.addShaderPass(pass._nativeObj);
    }
}

