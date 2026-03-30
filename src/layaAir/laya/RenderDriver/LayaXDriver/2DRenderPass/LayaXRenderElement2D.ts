import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { RTSubShader } from "../../RenderModuleData/RuntimeModuleData/RTSubShader";

export class LayaXRenderElement2D implements IRenderElement2D {

    /** C++ 原生对象 */
    _nativeObj: any;

    protected init(): void {
        this._nativeObj = new (window as any).conchLayaXRenderElement2D();
    }

    constructor() {
        this.init();
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
    private _materialShaderData: ShaderData;
    set materialShaderData(data: ShaderData) {
        this._materialShaderData = data;
        this._nativeObj.setMaterialShaderData(data ? (data as any)._nativeObj : null);
    }
    get materialShaderData(): ShaderData { return this._materialShaderData; }

    // ---- value2DShaderData ----
    private _value2DShaderData: ShaderData;
    set value2DShaderData(data: ShaderData) {
        this._value2DShaderData = data;
        this._nativeObj.setValue2DShaderData(data ? (data as any)._nativeObj : null);
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
        this._nativeObj.destroy();
    }
}
