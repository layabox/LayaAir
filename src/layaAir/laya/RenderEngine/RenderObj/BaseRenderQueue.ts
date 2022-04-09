import { SingletonList } from "../../d3/component/SingletonList";
import { Camera } from "../../d3/core/Camera";
import { RenderContext3D } from "../../d3/core/render/RenderContext3D";
import { RenderElement } from "../../d3/core/render/RenderElement";
import { Vector4 } from "../../d3/math/Vector4";
import { Viewport } from "../../d3/math/Viewport";
import { LayaGL } from "../../layagl/LayaGL";
import { IRenderTarget } from "../RenderInterface/IRenderTarget";
import { IRenderContext3D } from "../RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { IRenderQueue } from "../RenderInterface/RenderPipelineInterface/IRenderQueue";
import { ISortPass } from "../RenderInterface/RenderPipelineInterface/ISortPass";
import { ShaderData } from "../RenderShader/ShaderData";
import { QuickSort } from "./QuickSort";


export class BaseRenderQueue implements IRenderQueue {
    /** @interanl */
    _isTransparent: boolean = false;
    /** @internal */
    elements: SingletonList<RenderElement> = new SingletonList<RenderElement>();
    /**sort function*/
    _sortPass: ISortPass;
    /** context*/
    _context:IRenderContext3D;

    set sortPass(value: ISortPass) {
        this._sortPass = value;
    }
    constructor(isTransparent: boolean) {
        this._isTransparent = isTransparent;
        this.sortPass =new QuickSort();
    }

    set context(value:RenderContext3D){
        this._context = value._contextOBJ;
    }

  

    addRenderElement(renderelement: RenderElement) {
        this.elements.add(renderelement);
    }

    clear(): void {
        this.elements.length = 0;
    }

    renderQueue(context:RenderContext3D) {
        this.context = context;
        this._preRender();
        this._context.applyContext();
        // this._context.destTarget._start();
        // this._context.cameraUpdateMark = Camera._updateMark;
        // LayaGL.renderEngine.viewport(this._viewPort.x,this._viewPort.y,this._viewPort.width,this._viewPort.height);
        // LayaGL.renderEngine.scissor(this._scissor.x,this._scissor.y,this._scissor.z,this._scissor.w);
        var elements: RenderElement[] = this.elements.elements;
		for (var i: number = 0, n: number = this.elements.length; i < n; i++){
            elements[i]._renderUpdatePre(context,this);//Update Data
            
        }
			
		// for (var i: number = 0, n: number = this.elements.length; i < n; i++)
		// 	elements[i]._render(context);
        //更新所有大buffer数据 nativeTODO

        for (var i: number = 0, n: number = this.elements.length; i < n; i++)
			elements[i]._render(this._context);//Update Data
        //UpdateRender All
        //UpdateGeometry All
        //RenderRenderElement All
    }

    private _preRender(): void {
        //batchQueue TODO:
        this._batchQueue();
        //quick sort or material sort
        this._sort();
    }


    private _batchQueue() {
        //static batch
        //instance batch
    }

    private _sort() {
        var count: number = this.elements.length;
        this._sortPass.sort(this.elements, this._isTransparent, 0, count - 1);
    }






}