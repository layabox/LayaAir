import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { RTShaderPass } from "../../RenderModuleData/RuntimeModuleData/RTShaderPass";
import { RTSubShader } from "../../RenderModuleData/RuntimeModuleData/RTSubShader";
import { GLESRenderGeometryElement } from "../RenderDevice/GLESRenderGeometryElement";
import { GLESShaderData } from "../RenderDevice/GLESShaderData";

export class GLESRenderElement2D implements IRenderElement2D {
    private _geometry: GLESRenderGeometryElement;
    private _materialShaderData: GLESShaderData;
    private _value2DShaderData: GLESShaderData;
    private _subShader: SubShader;
    set type(value: number) {
        this._nativeObj.type = value;
    }

    get type(): number {
        return this._nativeObj.type;
    }
    set geometry(data: GLESRenderGeometryElement) {
        this._geometry = data;
        this._nativeObj.setGeometry(data ? (data as any)._nativeObj : null);
    }

    get geometry(): GLESRenderGeometryElement {
        return this._geometry;
    }

    set materialShaderData(data: GLESShaderData) {
        this._materialShaderData = data;
        this._nativeObj.setMaterialShaderData(data ? (data as any)._nativeObj : null);
    }

    get materialShaderData(): GLESShaderData {
        return this._materialShaderData;
    }


    set value2DShaderData(data: GLESShaderData) {
        this._value2DShaderData = data;
        this._nativeObj.setValue2DShaderData(data ? (data as any)._nativeObj : null);
    }

    get value2DShaderData(): GLESShaderData {
        return this._value2DShaderData;
    }


    public get subShader(): SubShader {
        return this._subShader;
    }
    public set subShader(value: SubShader) {
        this._subShader = value;
        this._nativeObj.setSubShader((value.moduleData as any as RTSubShader)._nativeObj);
    }

    /**@internal */
    _nativeObj: any;
    protected init(): void {
        this._nativeObj = new (window as any).conchGLESRenderElement2D();
        (window as any).conchGLESRenderElement2D.setCompileDefine(RTShaderPass.getGlobalCompileDefine()._nativeObj);
    }
    constructor() {
        this.init();
    }
    _owner: IRenderStruct2D;
    public get owner(): IRenderStruct2D {
        return this._owner;
    }
    public set owner(value: IRenderStruct2D) {
        this._owner = value;
        this._nativeObj.setOwner(value ? (value as any)._nativeObj : null);
    }

    private _nodeCommonMap: string[];//TODO
    public get nodeCommonMap(): string[] {
        return this._nodeCommonMap;
    }
    public set nodeCommonMap(value: string[]) {
        //TODO
        this._nodeCommonMap = value;
       this._nativeObj.setCommonUniformMap(value);
    }
    private _renderStateIsBySprite: boolean = true;//TODO
    public get renderStateIsBySprite(): boolean {
        return this._renderStateIsBySprite;
    }
    public set renderStateIsBySprite(value: boolean) {
        this._renderStateIsBySprite = value;
        this._nativeObj.renderStateIsBySprite = value;
    }

    destroy(): void {
        this._nativeObj.destroy();
        this.geometry = null;
    }
}