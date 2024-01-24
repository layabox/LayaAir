import { IRenderContext3D, IRenderElement3D } from "../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { WebGLSkinRenderElement3D } from "../../../RenderDriver/WebglDriver/3DRenderPass/WebGLSkinRenderElement3D";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { RenderElement } from "./RenderElement"
/**
 * @internal
 */
export class SkinRenderElement extends RenderElement{
	/**
	 * 可提交底层的渲染节点
	 */
	_renderElementOBJ:WebGLSkinRenderElement3D;

    setSkinData(value:Float32Array[]){
        this._renderElementOBJ.skinnedData = value;
    }

    constructor(){
        super();
    }

    protected _createRenderElementOBJ(){
		this._renderElementOBJ = Laya3DRender.Render3DPassFactory.createSkinRenderElement() as WebGLSkinRenderElement3D;
	}

    _render(context:IRenderContext3D): void {
		//this._renderElementOBJ._render(context);
    }
}