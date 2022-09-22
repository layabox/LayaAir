import { SingletonList } from "../../../../utils/SingletonList";
import { Transform3D } from "../../../../d3/core/Transform3D";
import { ShaderInstance } from "../../../../d3/shader/ShaderInstance";
import { LayaGL } from "../../../../layagl/LayaGL";
import { IBaseRenderNode } from "../../../RenderInterface/RenderPipelineInterface/IBaseRenderNode";
import { IRenderContext3D } from "../../../RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { IRenderElement } from "../../../RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../../../RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { NativeShaderData } from "./NativeShaderData";
export enum RenderElementType {
    Base = 0,
    Skin = 1,
    Instance = 2,
}
export class NativeRenderElementOBJ implements IRenderElement {

    private geometry: IRenderGeometryElement;

    //private shaderInstances: SingletonList<ShaderInstance>;

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

    constructor() {
        this.init();
    }
    init(): void {
        this._nativeObj = new (window as any).conchRenderElement(RenderElementType.Base, (LayaGL.renderEngine as any)._nativeObj);
    }
    _shaderInstances: SingletonList<ShaderInstance>;
    _owner: IBaseRenderNode;

    _addShaderInstance(shader: ShaderInstance) {
        this._nativeObj._addShaderInstance((shader as any)._nativeObj);
    }

    _clearShaderInstance() {
        this._nativeObj._clearShaderInstance();
    }
    /**
     * render RenderElement
     * @param renderqueue 
     */
    _render(context: IRenderContext3D): void {
        this._nativeObj._render((context as any)._nativeObj);
    }

    _destroy() {
        this._nativeObj._destroy();
        this.transform = null;
    }
}