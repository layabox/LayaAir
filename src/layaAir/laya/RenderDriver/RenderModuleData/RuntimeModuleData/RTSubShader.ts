import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ISubshaderData } from "../Design/ISubShaderData";
import { RTShaderPass } from "./RTShaderPass";

export class RTSubShader implements ISubshaderData {

    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchRTSubShader();
    }

    setUniformMap(_uniformMap: Map<number, UniformProperty>): void {
        _uniformMap.forEach((value, key) => {
            this._nativeObj.addUnifromProperty(value.id, value.propertyName, value.uniformtype, value.arrayLength);
        });
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

