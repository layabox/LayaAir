import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ISubshaderData } from "../../RenderModuleData/Design/ISubShaderData";
import { IShaderPassData } from "../../RenderModuleData/Design/IShaderPassData";
import { LayaXShaderPass } from "./LayaXShaderPass";

/**
 * LayaX SubShader — Rust-backed SubShader container.
 *
 * SubShaderHandle doubles as shader_template_id for the variant cache key.
 * Holds passes, uniform properties, and instance flag.
 */
export class LayaXSubShader implements ISubshaderData {
    _nativeObj: any;
    private _shaderName: string = "";

    constructor() {
        this._nativeObj = new (window as any).conchLayaXSubShader();
        this._nativeObj.create();
    }

    get shaderName(): string {
        return this._shaderName;
    }

    set shaderName(value: string) {
        this._shaderName = value;
        this._nativeObj.setName(value);
    }

    get enableInstance(): boolean {
        return false; // TODO: read from native
    }

    set enableInstance(value: boolean) {
        this._nativeObj.setEnableInstance(value);
    }

    setUniformMap(_uniformMap: Map<number, UniformProperty>): void {
        _uniformMap.forEach((value, key) => {
            this._nativeObj.addUniformProperty(
                value.id,
                value.propertyName,
                value.uniformtype,
                value.arrayLength
            );
        });
    }

    addShaderPass(pass: IShaderPassData): void {
        const layaxPass = pass as LayaXShaderPass;
        this._nativeObj.addShaderPass(layaxPass._nativeObj);
    }

    /** Get the native handle (SubShaderHandle, also serves as shader_template_id) */
    get handle(): number {
        return this._nativeObj.handle;
    }

    destroy(): void {
        this._nativeObj.destroy();
    }
}
