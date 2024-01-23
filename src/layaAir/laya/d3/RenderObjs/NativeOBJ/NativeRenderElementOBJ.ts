import { NativeSubShader } from "../../../RenderEngine/RenderEngine/NativeGLEngine/NativeModuleData";
import { NativeShaderData } from "../../../RenderEngine/RenderEngine/NativeGLEngine/NativeShaderData";
import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { LayaGL } from "../../../layagl/LayaGL";
import { RTBaseRenderNode } from "../RuntimeOBJ/Render3DNode/RTBaseRenderNode";
import { NativeRenderGeometryElementOBJ } from "./NativeRenderGeometryElementOBJ";
import { NativeTransform3D } from "./NativeTransform3D";
/*export enum RenderElementType {
    Base = 0,
    Skin = 1,
    Instance = 2,
}*/
export class NativeRenderElementOBJ implements IRenderElement {

    private _geometry: NativeRenderGeometryElementOBJ;

    private _materialShaderData: NativeShaderData;

    private _renderShaderData: NativeShaderData;

    private _transform: NativeTransform3D;

    _isRender: boolean;

    set geometry(data: NativeRenderGeometryElementOBJ) {
        this._geometry = data;
        this._nativeObj.setGeometry((data as any)._nativeObj);
    }

    get geometry(): NativeRenderGeometryElementOBJ {
        return this._geometry;
    }

    set materialShaderData(data: NativeShaderData) {
        this._materialShaderData = data;
        this._nativeObj.setMaterialShaderData(data ? (data as any)._nativeObj : null);
    }

    get materialShaderData(): NativeShaderData {
        return this._materialShaderData;
    }

    set renderShaderData(data: NativeShaderData) {
        this._renderShaderData = data;
        this._nativeObj.setRenderShaderData(data ? (data as any)._nativeObj : null);
    }

    get renderShaderData(): NativeShaderData {
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
    public get materialRenderQueue(): number {
        return this._nativeObj._materialRenderQueue;
    }
    public set materialRenderQueue(value: number) {
        this._nativeObj._materialRenderQueue = value;
    }

    private _owner: RTBaseRenderNode;
    public get owner(): RTBaseRenderNode {
        return this._owner;
    }
    public set owner(value: RTBaseRenderNode) {
        this._owner = value;
        this._nativeObj.setOwner(value._nativeObj);
    }

    private _subShader: SubShader;
    public get subShader(): SubShader {
        return this._subShader;
    }
    public set subShader(value: SubShader) {
        this._subShader = value;
        this._nativeObj.setSubShader((value.moduleData as any as NativeSubShader)._nativeObj);
        //这里绑定compileShader的方法 todo
    }

    _nativeObj: any;

    constructor() {
        this.init();
    }

    destroy(): void {
        this._nativeObj.destroy();
        this.geometry = null;
        this.materialShaderData = null;
        this.renderShaderData = null;
        this.transform = null;
    }

    protected init(): void {
        this._nativeObj = new (window as any).conchRenderElementOBJ();
    }
}