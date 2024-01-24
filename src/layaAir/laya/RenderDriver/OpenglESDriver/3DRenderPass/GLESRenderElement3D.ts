import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { NativeRenderGeometryElementOBJ } from "../../../d3/RenderObjs/NativeOBJ/NativeRenderGeometryElementOBJ";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { NativeTransform3D } from "../../RenderModuleData/RuntimeModuleData/3D/NativeTransform3D";
import { RTBaseRenderNode } from "../../RenderModuleData/RuntimeModuleData/3D/RTBaseRenderNode";
import { RTShaderData } from "../../RenderModuleData/RuntimeModuleData/RTShaderData";

export enum RenderElementType {
    Base = 0,
    Skin = 1,
    Instance = 2,
}
export class GLESRenderElement3D implements IRenderElement3D {

    private _geometry: NativeRenderGeometryElementOBJ;

    private _materialShaderData: RTShaderData;

    private _renderShaderData: RTShaderData;

    private _transform: NativeTransform3D;

    _isRender: boolean;

    set geometry(data: NativeRenderGeometryElementOBJ) {
        this._geometry = data;
        this._nativeObj._geometry = (data as any)._nativeObj;
    }


    get geometry(): NativeRenderGeometryElementOBJ {
        return this._geometry;
    }

    set materialShaderData(data: RTShaderData) {
        this._materialShaderData = data;
        this._nativeObj._materialShaderData = data ? (data as any)._nativeObj : null;
    }

    get materialShaderData(): RTShaderData {
        return this._materialShaderData;
    }

    set renderShaderData(data: RTShaderData) {
        this._renderShaderData = data;
        this._nativeObj._renderShaderData = data ? (data as any)._nativeObj : null;
    }

    get renderShaderData(): RTShaderData {
        return this._renderShaderData;
    }

    set transform(data: NativeTransform3D) {
        this._transform = data;
        this._nativeObj._transform = data ? (data as any)._nativeObj : null;
    }

    get transform(): NativeTransform3D {
        return this._transform;
    }

    get isRender(): boolean {
        return this._nativeObj._isRender;
    }

    set isRender(data: boolean) {
        this._nativeObj._isRender = data;
    }

    private _materialRenderQueue: number;
    public get materialRenderQueue(): number {
        return this._materialRenderQueue;
    }
    public set materialRenderQueue(value: number) {
        this._materialRenderQueue = value;
    }

    private _owner: RTBaseRenderNode;
    public get owner(): RTBaseRenderNode {
        return this._owner;
    }
    public set owner(value: RTBaseRenderNode) {
        this._owner = value;
    }

    private _subShader: SubShader;
    public get subShader(): SubShader {
        return this._subShader;
    }
    public set subShader(value: SubShader) {
        this._subShader = value;
    }

    _nativeObj: any;

    constructor() {
        this.init();
    }

    destroy(): void {
        throw new Error("Method not implemented.");
    }

    protected init(): void {
        //this._nativeObj = new (window as any).conchRenderElement(RenderElementType.Base, (LayaGL.renderEngine as any)._nativeObj);
    }


    _destroy() {
        this._nativeObj._destroy();
        this.geometry = null;
        this.materialShaderData = null;
        this.renderShaderData = null;
        this.transform = null;
    }
}