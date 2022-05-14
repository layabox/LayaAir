import { SingletonList } from "../../d3/component/SingletonList";
import { Transform3D } from "../../d3/core/Transform3D";
import { ShaderInstance } from "../../d3/shader/ShaderInstance";
import { LayaGL } from "../../layagl/LayaGL";
import { IBaseRenderNode } from "../RenderInterface/RenderPipelineInterface/IBaseRenderNode";
import { IRenderContext3D } from "../RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { IRenderElement } from "../RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { ShaderData } from "../RenderShader/ShaderData";

export class NativeRenderElementOBJ implements IRenderElement {
    
    private geometry: IRenderGeometryElement;

    //private shaderInstances: SingletonList<ShaderInstance>;

    private materialShaderData: ShaderData;

    private renderShaderData: ShaderData;

    private transform: Transform3D;

    //private isRender: boolean;

    private owner: IBaseRenderNode;

    set _geometry(data: IRenderGeometryElement) {
        this.geometry = data;
        this._nativeObj._geometry = data._nativeObj;
    }

    get _geometry(): IRenderGeometryElement {
        return this.geometry;
    }

    set _materialShaderData(data: ShaderData) {
        this.materialShaderData = data;
        this._nativeObj._materialShaderData = data._nativeObj;
    }

    get _materialShaderData(): ShaderData {
        return this.materialShaderData;
    }

    set _renderShaderData(data: ShaderData) {
        this.renderShaderData = data;
        this._nativeObj._renderShaderData = data._nativeObj;
    }

    get _renderShaderData(): ShaderData {
        return this.renderShaderData;
    }

    set _transform(data: Transform3D) {
        this.transform = data;
        this._nativeObj._transform = data._nativeObj;
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

    _nativeObj: any;

    constructor(){
        this._nativeObj = new (window as any).conchRenderElement();
    }

    _addShaderInstance(shader:ShaderInstance){
        this._nativeObj._addShaderInstance((shader as any)._nativeObj);
    }

    _clearShaderInstance(){
        this._nativeObj._clearShaderInstance();
    }

    /**
     * @internal
     */
    getInvertFront(): boolean {
        //return this._transform?this._transform._isFrontFaceInvert:false;
        //return this._nativeObj.getInvertFront()
        return false;
    }

    /**
     * render RenderElement
     * @param renderqueue 
     */
    _render(context: IRenderContext3D): void {
        this._nativeObj._render((context as any)._nativeObj);
    }

    /*drawGeometry(shaderIns:ShaderInstance){
        LayaGL.renderDrawConatext.drawGeometryElement(this._geometry);
    }*/

    _destroy() {
        this._nativeObj._destroy();
    }
}