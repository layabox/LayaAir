import { LayaGL } from "../../../layagl/LayaGL";
import { IRenderQueue } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderQueue";
import { SkinRenderElementOBJ } from "../../../RenderEngine/RenderObj/SkinRenderElementOBJ";
import { SkinnedMeshRenderer } from "../SkinnedMeshRenderer";
import { RenderElement } from "./RenderElement"

export class SkinRenderElement extends RenderElement{
    	/**
	 * 可提交底层的渲染节点
	 */
	protected _renderElementOBJ:SkinRenderElementOBJ;


    	/**@internal */
	set render(value:SkinnedMeshRenderer){
		this._baseRender = value;
		this._renderElementOBJ._renderShaderData = value._shaderValues;
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
		this._renderElementOBJ = LayaGL.renderOBJCreate.createSkinRenderElement() as SkinRenderElementOBJ;
	}

    _render(renderqueue:IRenderQueue): void {
        // if( (this._baseRender as SkinnedMeshRenderer)._skinnedData){
        //     this._renderElementOBJ.skinnedData = (this._baseRender as SkinnedMeshRenderer)._skinnedData;
        // }
		this._renderElementOBJ._render(renderqueue);
    }
}