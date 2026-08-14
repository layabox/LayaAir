import { ReflectionProbe } from "../../../d3/component/Volume/reflectionProbe/ReflectionProbe";
import { Sprite3DRenderDeclaration } from "../../../d3/core/render/Sprite3DRenderDeclaration";
import { AmbientMode } from "../../../d3/core/scene/AmbientMode";
import { Bounds } from "../../../d3/math/Bounds";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { IReflectionProbeData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";

/**
 * TS-owned per-probe buffer layout. Contract shared with C++ `LayaXReflectionProbe_JS`
 * (and future Rust direct-read) — changing it requires updating both sides.
 */
const enum RPSlot {
    BoxProjection = 0,       // i32 (0/1)
    AmbientMode = 1,         // u32
    AmbientIntensity = 2,    // f32
    ReflectionIntensity = 3, // f32
    UpdateMark = 4,          // u32
    IblTexRGBD = 5,          // i32 (0/1)
    ProbePosX = 6,           // f32 xyz
    AmbientColorR = 9,       // f32 rgba
    Count = 13,
}

/**
 * LayaX ReflectionProbe bridge.
 *
 * Numeric probe properties live in a TS-owned ArrayBuffer that C++ holds (and Rust will
 * read directly once a probe system lands) — no per-property FFI. Object refs (bounds /
 * textures / ambientSH) still go through native setters. Today `applyRenderData()` pushes
 * everything into the ShaderData; the buffer is the forward path for native consumption.
 */
export class LayaXReflectionProbe implements IReflectionProbeData {

    private static _idCounter: number = 0;

    /** @internal */
    _id: number = ++LayaXReflectionProbe._idCounter;

    /** @internal */
    _nativeObj: any;

    private _updateMaskFlag: number = -1;

    // TS owns this buffer; C++ caches its pointer via bindBuffer. Held as an instance
    // field so it stays alive (GC) for the probe's lifetime.
    private _buf: ArrayBuffer;
    private _f32: Float32Array;
    private _i32: Int32Array;
    private _u32: Uint32Array;

    public get boxProjection(): boolean { return this._i32[RPSlot.BoxProjection] !== 0; }
    public set boxProjection(value: boolean) {
        const v = value ? 1 : 0;
        if (this._i32[RPSlot.BoxProjection] === v) return;
        this._i32[RPSlot.BoxProjection] = v;
        LayaXReflectionProbe._dirtySet.add(this);
    }

    private _bound: Bounds;
    public get bound(): Bounds { return this._bound; }
    public set bound(value: Bounds) {
        this._bound = value;
        // TODO(Q13): Confirm Bounds._imp._nativeObj path for LayaX Bounds wrapper
        this._nativeObj.setBounds(value ? (value._imp as any)._nativeObj : null);
    }

    public get ambientMode(): AmbientMode { return this._u32[RPSlot.AmbientMode]; }
    public set ambientMode(value: AmbientMode) {
        if (this._u32[RPSlot.AmbientMode] === value) return;
        this._u32[RPSlot.AmbientMode] = value;
        LayaXReflectionProbe._dirtySet.add(this);
    }

    public get ambientIntensity(): number { return this._f32[RPSlot.AmbientIntensity]; }
    public set ambientIntensity(value: number) {
        if (this._f32[RPSlot.AmbientIntensity] === value) return;
        this._f32[RPSlot.AmbientIntensity] = value;
        LayaXReflectionProbe._dirtySet.add(this);
    }

    public get reflectionIntensity(): number { return this._f32[RPSlot.ReflectionIntensity]; }
    public set reflectionIntensity(value: number) {
        if (this._f32[RPSlot.ReflectionIntensity] === value) return;
        this._f32[RPSlot.ReflectionIntensity] = value;
        LayaXReflectionProbe._dirtySet.add(this);
    }

    private _reflectionTexture: InternalTexture;
    public get reflectionTexture(): InternalTexture { return this._reflectionTexture; }
    public set reflectionTexture(value: InternalTexture) {
        if (this._reflectionTexture === value) return;
        this._reflectionTexture = value;
        this._nativeObj.setReflectionTexture(value ? (value as any)._nativeObj : null);
        LayaXReflectionProbe._dirtySet.add(this);
    }

    private _iblTex: InternalTexture;
    public get iblTex(): InternalTexture { return this._iblTex; }
    public set iblTex(value: InternalTexture) {
        if (this._iblTex === value) return;
        this._iblTex = value;
        this._nativeObj.setIblTex(value ? (value as any)._nativeObj : null);
        LayaXReflectionProbe._dirtySet.add(this);
    }

    /** @internal 全局脏集合：updateMark 变化时自动收集 */
    static _dirtySet: Set<LayaXReflectionProbe> = new Set();

    public get updateMark(): number { return this._u32[RPSlot.UpdateMark]; }
    public set updateMark(value: number) {
        if (this._u32[RPSlot.UpdateMark] === value) return;
        this._u32[RPSlot.UpdateMark] = value;
        LayaXReflectionProbe._dirtySet.add(this);
    }

    public get iblTexRGBD(): boolean { return this._i32[RPSlot.IblTexRGBD] !== 0; }
    public set iblTexRGBD(value: boolean) {
        const v = value ? 1 : 0;
        if (this._i32[RPSlot.IblTexRGBD] === v) return;
        this._i32[RPSlot.IblTexRGBD] = v;
        LayaXReflectionProbe._dirtySet.add(this);
    }

    private _shaderData: ShaderData;
    public get shaderData(): ShaderData { return this._shaderData; }
    public set shaderData(value: ShaderData) {
        // shaderData is consumed via the TS field below (applyRenderData); native holds no copy.
        this._shaderData = value;
    }

    private _probePosition: Vector3 = new Vector3();
    setProbePosition(value: Vector3): void {
        if (value) {
            value.cloneTo(this._probePosition);
            this._f32[RPSlot.ProbePosX] = value.x;
            this._f32[RPSlot.ProbePosX + 1] = value.y;
            this._f32[RPSlot.ProbePosX + 2] = value.z;
            LayaXReflectionProbe._dirtySet.add(this);
        }
    }

    private _ambientColor: Color = new Color();
    setAmbientColor(value: Color): void {
        if (value) {
            value.cloneTo(this._ambientColor);
            this._f32[RPSlot.AmbientColorR] = value.r;
            this._f32[RPSlot.AmbientColorR + 1] = value.g;
            this._f32[RPSlot.AmbientColorR + 2] = value.b;
            this._f32[RPSlot.AmbientColorR + 3] = value.a;
            LayaXReflectionProbe._dirtySet.add(this);
        }
    }

    /** @internal */
    private _ambientSH: Float32Array;
    setAmbientSH(value: Float32Array): void {
        this._ambientSH = value;
        this._nativeObj.setAmbientSH(value);
        LayaXReflectionProbe._dirtySet.add(this);
    }

    needUpdate(): boolean {
        return this.updateMark != this._updateMaskFlag;
    }

    applyRenderData(): void {
        this._updateMaskFlag = this.updateMark;

        let data = this._shaderData;
        // boxProjection
        if (!this.boxProjection) {
            data.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION);
        } else {
            data.addDefine(Sprite3DRenderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION);
            data.setVector3(ReflectionProbe.REFLECTIONCUBE_PROBEPOSITION, this._probePosition);
            data.setVector3(ReflectionProbe.REFLECTIONCUBE_PROBEBOXMAX, this._bound.getMax());
            data.setVector3(ReflectionProbe.REFLECTIONCUBE_PROBEBOXMIN, this._bound.getMin());
        }

        if (this.ambientMode == AmbientMode.SolidColor) {
            data.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_LEGACYIBL);
            data.removeDefine(ReflectionProbe.SHADERDEFINE_GI_IBL);
            data.setColor(ReflectionProbe.AMBIENTCOLOR, this._ambientColor);
        } else if (this._iblTex && this._ambientSH) {
            data.addDefine(ReflectionProbe.SHADERDEFINE_GI_IBL);
            data.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_LEGACYIBL);
            if (this._iblTex) {
                data._setInternalTexture(ReflectionProbe.IBLTEX, (this._iblTex as any)._nativeObj);
                data.setNumber(ReflectionProbe.IBLROUGHNESSLEVEL, this._iblTex.maxMipmapLevel);
            }
            this.iblTexRGBD ? data.addDefine(Sprite3DRenderDeclaration.SHADERDEFINE_IBL_RGBD) : data.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_IBL_RGBD);
            this._ambientSH && data.setBuffer(ReflectionProbe.AMBIENTSH, this._ambientSH);
        } else {
            data.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_LEGACYIBL);
            data.removeDefine(ReflectionProbe.SHADERDEFINE_GI_IBL);
        }
        data.setNumber(ReflectionProbe.AMBIENTINTENSITY, this.ambientIntensity);
        data.setNumber(ReflectionProbe.REFLECTIONINTENSITY, this.reflectionIntensity);
    }

    constructor() {
        this._nativeObj = new (window as any).conchLayaXReflectionProbe();
        this._buf = new ArrayBuffer(RPSlot.Count * 4);
        this._f32 = new Float32Array(this._buf);
        this._i32 = new Int32Array(this._buf);
        this._u32 = new Uint32Array(this._buf);
        // Seed C++ defaults (_ambientIntensity / _reflectionIntensity = 1).
        this._f32[RPSlot.AmbientIntensity] = 1.0;
        this._f32[RPSlot.ReflectionIntensity] = 1.0;
        this._nativeObj.bindBuffer(this._buf);
        this.shaderData = LayaGL.renderDeviceFactory.createShaderData();
    }

    destroy(): void {
        LayaXReflectionProbe._dirtySet.delete(this);
        this._nativeObj.destroy();
        this.shaderData.destroy();
        this.shaderData = null;
    }
}
