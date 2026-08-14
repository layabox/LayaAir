import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ISubshaderData } from "../../RenderModuleData/Design/ISubShaderData";
import { IShaderPassData } from "../../RenderModuleData/Design/IShaderPassData";
import { LayaGL } from "../../../layagl/LayaGL";
import { LayaXCommandUniformMap } from "../RenderDevice/LayaXCommandUniformMap";
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
        this._ensureMaterialMap();
    }

    get enableInstance(): boolean {
        return false; // TODO: read from native
    }

    set enableInstance(value: boolean) {
        this._nativeObj.setEnableInstance(value);
    }

    setUniformMap(_uniformMap: Map<number, UniformProperty>): void {
        this._syncUniformProperties(_uniformMap);
        this._pendingUniformMap = _uniformMap;
        this._ensureMaterialMap();
    }

    private _pendingUniformMap: Map<number, UniformProperty> | null = null;
    private _uniformPropertyIds: Set<number> = new Set();

    private _syncUniformProperties(uniformMap: Map<number, UniformProperty>): void {
        uniformMap.forEach((value) => {
            if (this._uniformPropertyIds.has(value.id)) {
                return;
            }
            this._nativeObj.addUniformProperty(
                value.id,
                value.propertyName,
                value.uniformtype,
                value.arrayLength
            );
            this._uniformPropertyIds.add(value.id);
        });
    }

    /** Create global CommandUniformMap for material Set3 using SubShader's uniform properties */
    private _ensureMaterialMap(): void {
        if (!this._pendingUniformMap || !this._shaderName) return;
        let map = LayaGL.renderDeviceFactory.createGlobalUniformMap(this._shaderName) as LayaXCommandUniformMap;
        this._pendingUniformMap.forEach((value) => {
            if (map._idata.has(value.id)) {
                return;
            }
            if (value.arrayLength > 0) {
                map.addShaderUniformArray(value.id, value.propertyName, value.uniformtype, value.arrayLength);
            } else {
                map.addShaderUniform(value.id, value.propertyName, value.uniformtype);
            }
        });
        this._pendingUniformMap = null;
    }

    addShaderPass(pass: IShaderPassData): void {
        const layaxPass = pass as LayaXShaderPass;
        layaxPass.syncOwnerUniformMap();
        this._nativeObj.addShaderPass(layaxPass._nativeObj);
    }

    destroy(): void {
        this._nativeObj.destroy();
    }
}
