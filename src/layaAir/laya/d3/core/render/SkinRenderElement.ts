import { IRenderContext3D } from "../../RenderDriverLayer/IRenderContext3D";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { SkinRenderElementOBJ } from "../../RenderObjs/RenderObj/SkinRenderElementOBJ";
import { SkinnedMeshRenderer } from "../SkinnedMeshRenderer";
import { RenderElement } from "./RenderElement"
/**
 * @internal
 */
export class SkinRenderElement extends RenderElement{
	/**
	 * 可提交底层的渲染节点
	 */
	_renderElementOBJ:SkinRenderElementOBJ;


    /**@internal */
	set render(value:SkinnedMeshRenderer){
		this._baseRender = value;
		//this._renderElementOBJ._renderShaderData = value._baseRenderNode.shaderData; TODO miner
	}

    get render():SkinnedMeshRenderer{
		return this._baseRender as SkinnedMeshRenderer;
	}

    setSkinData(value:Float32Array[]){
        this._renderElementOBJ.skinnedData = value;
    }

    constructor(){
        super();
    }

    protected _createRenderElementOBJ(){
		this._renderElementOBJ = Laya3DRender.renderOBJCreate.createSkinRenderElement() as SkinRenderElementOBJ;
	}

    _render(context:IRenderContext3D): void {
		//this._renderElementOBJ._render(context);
    }
}