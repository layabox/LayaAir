import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { RTSubShader } from "../../RenderModuleData/RuntimeModuleData/RTSubShader";
import { LayaXShaderData, IRenderStateListener } from "../RenderDevice/LayaXShaderData";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";

/**
 * render state 在 TS 侧按 Web `uploadRenderStateBlendDepth` 的 statefirst + fallback
 * 语义计算出来，分别 register 到 native；由 C++ 根据 renderStateIsBySprite 选 handle
 * 绑定到 element。value2D sd 对应 sprite 路径，material / primitive sd 对应 material
 * 路径（primitive 子类在 _pickMaterialSD 里提供兜底）。
 */
export class LayaXRenderElement2D implements IRenderElement2D, IRenderStateListener {

    _nativeObj: any;

    protected init(): void {
        this._nativeObj = new (window as any).conchLayaXRenderElement2D();
    }

    constructor() {
        this.init();
    }

    /** @internal 由 shaderData listener / subShader / sd setter 统一触发。 */
    _onRenderStateChanged(): void {
        if (!this._nativeObj || !this._subShader) return;
        this._registerRS();
        // postprocess / blit 等 standalone element 不在 LayaXRender2DPass::doRender
        // 的 syncRenderState 循环里，必须由 TS 主动触发一次 apply。主 pass element
        // 每帧会再调一次，但 C++ 有 _cachedRSHandle 去重，不会重复下发。
        this._nativeObj.syncRenderState?.();
    }

    /** 子类覆盖以提供 material → primitive 兜底（对齐 Web primitive 三层选择）。 */
    protected _pickMaterialSD(): LayaXShaderData | null {
        return this._materialShaderData ?? null;
    }

    private _registerRS(): void {
        const sd = this._pickMaterialSD();
        if (!sd) return;
        const pass = (this._subShader as any)._passes?.[0] ?? null;
        const rs = pass?.renderState ?? null;
        const statefirst = pass?.statefirst ?? false;
        const D = RenderState.Default;

        const p = (passVal: any, sdKey: number, def: any) => {
            if (statefirst && passVal != null) return passVal;
            const v = sd.getInt(sdKey);
            return (v != null && v !== undefined) ? v : def;
        };

        this._nativeObj.registerMaterialRenderState(
            p(rs?.blend,               Shader3D.BLEND,                D.blend),
            p(rs?.srcBlend,            Shader3D.BLEND_SRC,            D.srcBlend),
            p(rs?.dstBlend,            Shader3D.BLEND_DST,            D.dstBlend),
            p(rs?.blendEquation,       Shader3D.BLEND_EQUATION,       D.blendEquation),
            p(rs?.srcBlendRGB,         Shader3D.BLEND_SRC_RGB,        D.srcBlendRGB),
            p(rs?.dstBlendRGB,         Shader3D.BLEND_DST_RGB,        D.dstBlendRGB),
            p(rs?.srcBlendAlpha,       Shader3D.BLEND_SRC_ALPHA,      D.srcBlendAlpha),
            p(rs?.dstBlendAlpha,       Shader3D.BLEND_DST_ALPHA,      D.dstBlendAlpha),
            p(rs?.blendEquationRGB,    Shader3D.BLEND_EQUATION_RGB,   D.blendEquationRGB),
            p(rs?.blendEquationAlpha,  Shader3D.BLEND_EQUATION_ALPHA, D.blendEquationAlpha));
    }

    // type
    set type(v: number) { this._nativeObj.type = v; }
    get type(): number { return this._nativeObj.type; }

    // geometry
    private _geometry: IRenderGeometryElement;
    set geometry(d: IRenderGeometryElement) {
        this._geometry = d;
        this._nativeObj.setGeometry(d ? (d as any)._nativeObj : null);
    }
    get geometry(): IRenderGeometryElement { return this._geometry; }

    // materialShaderData
    protected _materialShaderData: LayaXShaderData;
    set materialShaderData(d: ShaderData) {
        if (this._materialShaderData) this._materialShaderData._removeRenderStateListener(this);
        this._materialShaderData = d as LayaXShaderData;
        this._nativeObj.setMaterialShaderData(d ? (d as any)._nativeObj : null);
        if (this._materialShaderData) {
            this._materialShaderData._addRenderStateListener(this);
            this._onRenderStateChanged();
        }
    }
    get materialShaderData(): ShaderData { return this._materialShaderData; }

    // value2DShaderData
    protected _value2DShaderData: LayaXShaderData;
    set value2DShaderData(d: ShaderData) {
        if (this._value2DShaderData) this._value2DShaderData._removeRenderStateListener(this);
        this._value2DShaderData = d as LayaXShaderData;
        this._nativeObj.setValue2DShaderData(d ? (d as any)._nativeObj : null);
        if (this._value2DShaderData) {
            this._value2DShaderData._addRenderStateListener(this);
        }
    }
    get value2DShaderData(): ShaderData { return this._value2DShaderData; }

    // globalShaderData
    private _globalShaderData: ShaderData;
    set globalShaderData(d: ShaderData) {
        this._globalShaderData = d;
        this._nativeObj.setGlobalShaderData(d ? (d as any)._nativeObj : null);
    }
    get globalShaderData(): ShaderData { return this._globalShaderData; }

    // subShader — pass.renderState / statefirst 随之变化，需要重算
    protected _subShader: SubShader;
    get subShader(): SubShader { return this._subShader; }
    set subShader(v: SubShader) {
        this._subShader = v;
        if (v) this._nativeObj.setSubShader((v.moduleData as any as RTSubShader)._nativeObj);
        this._onRenderStateChanged();
    }

    // owner
    _owner: IRenderStruct2D;
    get owner(): IRenderStruct2D { return this._owner; }
    set owner(v: IRenderStruct2D) {
        this._owner = v;
        this._nativeObj.setOwner(v ? (v as any)._nativeObj : null);
    }

    // nodeCommonMap
    private _nodeCommonMap: string[];
    get nodeCommonMap(): string[] { return this._nodeCommonMap; }
    set nodeCommonMap(v: string[]) {
        this._nodeCommonMap = v;
        this._nativeObj.setCommonUniformMap(v);
    }

    // renderStateIsBySprite — C++ setter 内部自动切换 handle，无需 TS 重算
    private _renderStateIsBySprite: boolean = true;
    get renderStateIsBySprite(): boolean { return this._renderStateIsBySprite; }
    set renderStateIsBySprite(v: boolean) {
        if (this._renderStateIsBySprite === v) return;
        this._renderStateIsBySprite = v;
        this._nativeObj.renderStateIsBySprite = v;
    }

    destroy(): void {
        if (this._materialShaderData) this._materialShaderData._removeRenderStateListener(this);
        if (this._value2DShaderData) this._value2DShaderData._removeRenderStateListener(this);
        this._nativeObj.destroy();
    }
}
