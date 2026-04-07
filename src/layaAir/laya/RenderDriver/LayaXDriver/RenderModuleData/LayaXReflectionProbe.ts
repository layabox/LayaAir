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
 * LayaX ReflectionProbe bridge.
 *
 * Wraps reflection probe data for the Rust rendering pipeline via
 * `conchLayaXReflectionProbe`.
 */
export class LayaXReflectionProbe implements IReflectionProbeData {

    private static _idCounter: number = 0;

    /** @internal */
    _id: number = ++LayaXReflectionProbe._idCounter;

    /** @internal */
    _nativeObj: any;

    private _updateMaskFlag: number = -1;

    public get boxProjection(): boolean { return this._nativeObj._boxProjection; }
    public set boxProjection(value: boolean) {
        if (this._nativeObj._boxProjection === value) return;
        this._nativeObj._boxProjection = value;
        LayaXReflectionProbe._dirtySet.add(this);
    }

    private _bound: Bounds;
    public get bound(): Bounds { return this._bound; }
    public set bound(value: Bounds) {
        this._bound = value;
        // TODO(Q13): Confirm Bounds._imp._nativeObj path for LayaX Bounds wrapper
        this._nativeObj.setBounds(value ? (value._imp as any)._nativeObj : null);
    }

    public get ambientMode(): AmbientMode { return this._nativeObj._ambientMode; }
    public set ambientMode(value: AmbientMode) {
        if (this._nativeObj._ambientMode === value) return;
        this._nativeObj._ambientMode = value;
        LayaXReflectionProbe._dirtySet.add(this);
    }

    public get ambientIntensity(): number { return this._nativeObj._ambientIntensity; }
    public set ambientIntensity(value: number) {
        if (this._nativeObj._ambientIntensity === value) return;
        this._nativeObj._ambientIntensity = value;
        LayaXReflectionProbe._dirtySet.add(this);
    }

    public get reflectionIntensity(): number { return this._nativeObj._reflectionIntensity; }
    public set reflectionIntensity(value: number) {
        if (this._nativeObj._reflectionIntensity === value) return;
        this._nativeObj._reflectionIntensity = value;
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

    public get updateMark(): number { return this._nativeObj._updateMark; }
    public set updateMark(value: number) {
        if (this._nativeObj._updateMark === value) return;
        this._nativeObj._updateMark = value;
        LayaXReflectionProbe._dirtySet.add(this);
    }

    public get iblTexRGBD(): boolean { return this._nativeObj._iblTexRGBD; }
    public set iblTexRGBD(value: boolean) {
        if (this._nativeObj._iblTexRGBD === value) return;
        this._nativeObj._iblTexRGBD = value;
        LayaXReflectionProbe._dirtySet.add(this);
    }

    private _shaderData: ShaderData;
    public get shaderData(): ShaderData { return this._shaderData; }
    public set shaderData(value: ShaderData) {
        this._shaderData = value;
        this._nativeObj.shaderData = value ? (this._shaderData as any)._nativeObj : null;
    }

    private _probePosition: Vector3 = new Vector3();
    setProbePosition(value: Vector3): void {
        if (value) {
            value.cloneTo(this._probePosition);
            this._nativeObj.setProbePosition(value);
            LayaXReflectionProbe._dirtySet.add(this);
        }
    }

    private _ambientColor: Color = new Color();
    setAmbientColor(value: Color): void {
        if (value) {
            value.cloneTo(this._ambientColor);
            this._nativeObj.setAmbientColor(value);
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
        this.shaderData = LayaGL.renderDeviceFactory.createShaderData();
    }

    destroy(): void {
        LayaXReflectionProbe._dirtySet.delete(this);
        this._nativeObj.destroy();
        this.shaderData.destroy();
        this.shaderData = null;
    }
}
