import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { RTSubShader } from "../../RenderModuleData/RuntimeModuleData/RTSubShader";
import { LayaXShaderData, IRenderStateListener } from "../RenderDevice/LayaXShaderData";

/**
 * 对齐 3D 的 LayaXRenderElement3D：当 material / value2D 的 blend/depth/stencil
 * 发生变化时，通过 listener 触发 _onRenderStateChanged → _nativeObj.syncRenderState，
 * 把状态下发到 pipeline。之前缺这套机制导致 Light2D 的 shadow 覆盖光斑。
 */
export class LayaXRenderElement2D implements IRenderElement2D, IRenderStateListener {

    /** C++ 原生对象 */
    _nativeObj: any;

    protected init(): void {
        this._nativeObj = new (window as any).conchLayaXRenderElement2D();
    }

    constructor() {
        this.init();
    }

    /** @internal IRenderStateListener — 由 materialShaderData / value2DShaderData 回调。 */
    _onRenderStateChanged(): void {
        if (this._nativeObj && this._nativeObj.syncRenderState) {
            this._nativeObj.syncRenderState();
        }
    }

    // ---- type ----
    set type(value: number) { this._nativeObj.type = value; }
    get type(): number { return this._nativeObj.type; }

    // ---- geometry ----
    private _geometry: IRenderGeometryElement;
    set geometry(data: IRenderGeometryElement) {
        this._geometry = data;
        this._nativeObj.setGeometry(data ? (data as any)._nativeObj : null);
    }
    get geometry(): IRenderGeometryElement { return this._geometry; }

    // ---- materialShaderData ----
    private _materialShaderData: LayaXShaderData;
    set materialShaderData(data: ShaderData) {
        if (this._materialShaderData) this._materialShaderData._removeRenderStateListener(this);
        this._materialShaderData = data as LayaXShaderData;
        this._nativeObj.setMaterialShaderData(data ? (data as any)._nativeObj : null);
        if (this._materialShaderData) {
            this._materialShaderData._addRenderStateListener(this);
            this._onRenderStateChanged();
        }
    }
    get materialShaderData(): ShaderData { return this._materialShaderData; }

    // ---- value2DShaderData ----
    private _value2DShaderData: LayaXShaderData;
    set value2DShaderData(data: ShaderData) {
        if (this._value2DShaderData) this._value2DShaderData._removeRenderStateListener(this);
        this._value2DShaderData = data as LayaXShaderData;
        this._nativeObj.setValue2DShaderData(data ? (data as any)._nativeObj : null);
        if (this._value2DShaderData) {
            this._value2DShaderData._addRenderStateListener(this);
            this._onRenderStateChanged();
        }
    }
    get value2DShaderData(): ShaderData { return this._value2DShaderData; }

    // ---- globalShaderData ----
    private _globalShaderData: ShaderData;
    set globalShaderData(data: ShaderData) {
        this._globalShaderData = data;
        this._nativeObj.setGlobalShaderData(data ? (data as any)._nativeObj : null);
    }
    get globalShaderData(): ShaderData { return this._globalShaderData; }

    // ---- subShader ----
    private _subShader: SubShader;
    get subShader(): SubShader { return this._subShader; }
    set subShader(value: SubShader) {
        this._subShader = value;
        if (value) {
            this._nativeObj.setSubShader(
                (value.moduleData as any as RTSubShader)._nativeObj
            );
        }
    }

    // ---- owner ----
    _owner: IRenderStruct2D;
    get owner(): IRenderStruct2D { return this._owner; }
    set owner(value: IRenderStruct2D) {
        this._owner = value;
        this._nativeObj.setOwner(value ? (value as any)._nativeObj : null);
    }

    // ---- nodeCommonMap ----
    private _nodeCommonMap: string[];
    get nodeCommonMap(): string[] { return this._nodeCommonMap; }
    set nodeCommonMap(value: string[]) {
        this._nodeCommonMap = value;
        this._nativeObj.setCommonUniformMap(value);
    }

    // ---- renderStateIsBySprite ----
    private _renderStateIsBySprite: boolean = true;
    get renderStateIsBySprite(): boolean { return this._renderStateIsBySprite; }
    set renderStateIsBySprite(value: boolean) {
        this._renderStateIsBySprite = value;
        this._nativeObj.renderStateIsBySprite = value;
    }

    destroy(): void {
        if (this._materialShaderData) this._materialShaderData._removeRenderStateListener(this);
        if (this._value2DShaderData) this._value2DShaderData._removeRenderStateListener(this);
        this._nativeObj.destroy();
    }
}
