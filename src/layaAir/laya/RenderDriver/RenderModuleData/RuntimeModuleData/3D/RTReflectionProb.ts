import { AmbientMode } from "../../../../d3/core/scene/AmbientMode";
import { Bounds } from "../../../../d3/math/Bounds";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Color } from "../../../../maths/Color";
import { Vector3 } from "../../../../maths/Vector3";
import { InternalTexture } from "../../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { IReflectionProbeData } from "../../Design/3D/I3DRenderModuleData";
import { NativeMemory } from "../NativeMemory";

/** @internal conchRTReflectionProb 共享块槽位（与 C++ RTReflectionProb::Props 一致）。 */
const enum RTReflectionProbSlot {
    boxProjection = 0,
    ambientMode = 1,
    ambientIntensity = 2,
    reflectionIntensity = 3,
    updateMark = 4,
    iblTexRGBD = 5,
    probePositionX = 6,
    probePositionY = 7,
    probePositionZ = 8,
    ambientColorR = 9,
    ambientColorG = 10,
    ambientColorB = 11,
    ambientColorA = 12,
    Count = 13,
}

export class RTReflectionProb implements IReflectionProbeData {
    private static _idCounter: number = 0;

    /** @internal */
    _id: number = ++RTReflectionProb._idCounter;

    public get boxProjection(): boolean {
        return this._i32[RTReflectionProbSlot.boxProjection] !== 0;
    }
    public set boxProjection(value: boolean) {
        this._i32[RTReflectionProbSlot.boxProjection] = value ? 1 : 0;
    }
    private _bound: Bounds;
    public get bound(): Bounds {
        return this._bound;
    }
    public set bound(value: Bounds) {
        this._bound = value;
        this._nativeObj.setBounds(value._imp._nativeObj);
    }
    public get ambientMode(): AmbientMode {
        return this._i32[RTReflectionProbSlot.ambientMode];
    }
    public set ambientMode(value: AmbientMode) {
        this._i32[RTReflectionProbSlot.ambientMode] = value;
    }
    public get ambientIntensity(): number {
        return this._f32[RTReflectionProbSlot.ambientIntensity];
    }
    public set ambientIntensity(value: number) {
        this._f32[RTReflectionProbSlot.ambientIntensity] = value;
    }
    public get reflectionIntensity(): number {
        return this._f32[RTReflectionProbSlot.reflectionIntensity];
    }
    public set reflectionIntensity(value: number) {
        this._f32[RTReflectionProbSlot.reflectionIntensity] = value;
    }
    private _reflectionTexture: InternalTexture;
    public get reflectionTexture(): InternalTexture {
        return this._reflectionTexture;
    }
    public set reflectionTexture(value: InternalTexture) {
        this._reflectionTexture = value;
        if (!value) {
            this._nativeObj.setReflectionTexture(null);
            return;
        }
        this._nativeObj.setReflectionTexture((value as any)._nativeObj);
    }
    private _iblTex: InternalTexture;
    public get iblTex(): InternalTexture {
        return this._iblTex;
    }
    public set iblTex(value: InternalTexture) {
        this._iblTex = value;
        if (!value) {
            this._nativeObj.setIblTex(null);
            return;
        }
        this._nativeObj.setIblTex((value as any)._nativeObj);
    }
    public get updateMark(): number {
        return this._u32[RTReflectionProbSlot.updateMark];
    }
    public set updateMark(value: number) {
        this._u32[RTReflectionProbSlot.updateMark] = value;
    }
    public get iblTexRGBD(): boolean {
        return this._i32[RTReflectionProbSlot.iblTexRGBD] !== 0;
    }
    public set iblTexRGBD(value: boolean) {
        this._i32[RTReflectionProbSlot.iblTexRGBD] = value ? 1 : 0;
    }
    setProbePosition(value: Vector3): void {
        if (!value) return;
        this._f32[RTReflectionProbSlot.probePositionX] = value.x;
        this._f32[RTReflectionProbSlot.probePositionY] = value.y;
        this._f32[RTReflectionProbSlot.probePositionZ] = value.z;
    }
    setAmbientColor(value: Color): void {
        if (!value) return;
        this._f32[RTReflectionProbSlot.ambientColorR] = value.r;
        this._f32[RTReflectionProbSlot.ambientColorG] = value.g;
        this._f32[RTReflectionProbSlot.ambientColorB] = value.b;
        this._f32[RTReflectionProbSlot.ambientColorA] = value.a;
    }
    /**@internal */
    private _ambientSH: Float32Array;
    setAmbientSH(value: Float32Array): void {
        this._ambientSH = value;
        this._nativeObj.setAmbientSH(value);
    }

    _nativeObj: any;
    private _mem: NativeMemory;
    private _f32: Float32Array;
    private _i32: Int32Array;
    private _u32: Uint32Array;

    constructor() {
        this._nativeObj = new (window as any).conchRTReflectionProb();
        this._mem = new NativeMemory(RTReflectionProbSlot.Count * 4, false);
        this._f32 = this._mem.float32Array;
        this._i32 = this._mem.int32Array;
        this._u32 = this._mem.Uint32Array;
        this._nativeObj.bindPropertyBuffer(this._mem._buffer);
        this.shaderData = LayaGL.renderDeviceFactory.createShaderData();
    }

    private _shaderData: ShaderData;

    public get shaderData(): ShaderData {
        return this._shaderData;
    }

    public set shaderData(value: ShaderData) {
        this._shaderData = value;
        this._nativeObj.setShaderData(value ? (this._shaderData as any)._nativeObj : null);
    }

    destroy(): void {
        this._nativeObj.destroy()
        this.shaderData.destroy();
        this.shaderData = null;
    }

}