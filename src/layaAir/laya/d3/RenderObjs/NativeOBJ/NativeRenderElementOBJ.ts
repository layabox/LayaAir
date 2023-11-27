import { UploadMemoryManager } from "../../../RenderEngine/RenderEngine/NativeGLEngine/CommonMemory/UploadMemoryManager";
import { NativeShaderData } from "../../../RenderEngine/RenderEngine/NativeGLEngine/NativeShaderData";
import { IBaseRenderNode } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IBaseRenderNode";
import { IRenderContext3D } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { LayaGL } from "../../../layagl/LayaGL";
import { SingletonList } from "../../../utils/SingletonList";
import { Transform3D } from "../../core/Transform3D";
export enum RenderElementType {
    Base = 0,
    Skin = 1,
    Instance = 2,
}
export class NativeRenderElementOBJ implements IRenderElement {

    private geometry: IRenderGeometryElement;

    private materialShaderData: NativeShaderData;

    private renderShaderData: NativeShaderData;

    private transform: Transform3D;

    //private isRender: boolean;

    private owner: IBaseRenderNode;

    set _geometry(data: IRenderGeometryElement) {
        this.geometry = data;
        this._nativeObj._geometry = (data as any)._nativeObj;
    }

    get _geometry(): IRenderGeometryElement {
        return this.geometry;
    }

    set _materialShaderData(data: NativeShaderData) {
        this.materialShaderData = data;
        this._nativeObj._materialShaderData = data ? (data as any)._nativeObj : null;
    }

    get _materialShaderData(): NativeShaderData {
        return this.materialShaderData;
    }

    set _renderShaderData(data: NativeShaderData) {
        this.renderShaderData = data;
        this._nativeObj._renderShaderData = data ? (data as any)._nativeObj : null;
    }

    get _renderShaderData(): NativeShaderData {
        return this.renderShaderData;
    }

    set _transform(data: Transform3D) {
        this.transform = data;
        this._nativeObj._transform = data ? (data as any)._nativeObj : null;
    }

    get _transform(): Transform3D {
        return this.transform;
    }

    get _isRender(): boolean {
        return this._nativeObj._isRender;
    }

    set _isRender(data: boolean) {
        this._nativeObj._isRender = data;
    }

    get _invertFront(): boolean {
        return this._nativeObj._invertFront;
    }

    set _invertFront(data: boolean) {
        this._nativeObj._invertFront = data;
    }

    _nativeObj: any;
    _shaderInstances: SingletonList<ShaderInstance>;
    constructor() { 
        this._shaderInstances = new SingletonList();
        this.init();
    }
    init(): void {
       
        this._nativeObj = new (window as any).conchRenderElement(RenderElementType.Base, (LayaGL.renderEngine as any)._nativeObj);
    }

    _owner: IBaseRenderNode;

    _addShaderInstance(shader: ShaderInstance) {
        this._shaderInstances.add(shader);
        this._nativeObj._addShaderInstance((shader as any)._nativeObj);
    }

    _clearShaderInstance() {
        this._shaderInstances.length = 0;
        this._nativeObj._clearShaderInstance();
    }
    /**
     * render RenderElement
     * @param renderqueue 
     */
    _render(context: IRenderContext3D): void {
        UploadMemoryManager.syncRenderMemory();//同步数据
        this._nativeObj._render((context as any)._nativeObj);
    }

    _destroy() {
        this._nativeObj._destroy();
        this.geometry = null;
        this._shaderInstances = null; 
        this.materialShaderData = null;
        this.renderShaderData = null;
        this.transform = null;
    }
}