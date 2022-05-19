import { SingletonList } from "../../../../d3/component/SingletonList";
import { Camera } from "../../../../d3/core/Camera";
import { RenderContext3D } from "../../../../d3/core/render/RenderContext3D";
import { RenderElement } from "../../../../d3/core/render/RenderElement";
import { RenderElementBatch } from "../../../../d3/graphics/Batch/RenderElementBatch";
import { IRenderContext3D } from "../../../RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { IRenderQueue } from "../../../RenderInterface/RenderPipelineInterface/IRenderQueue";
import { ISortPass } from "../../../RenderInterface/RenderPipelineInterface/ISortPass";

export class NativeBaseRenderQueue implements IRenderQueue {
   /** @interanl */
    _isTransparent: boolean = false;
   /** @internal */
   elements: SingletonList<RenderElement> = new SingletonList<RenderElement>();
   /**sort function*/
   _sortPass: ISortPass;
   /** context*/
   _context: IRenderContext3D;
   _batch: RenderElementBatch;
    private _nativeObj: any;
    set sortPass(value: ISortPass) {
        this._nativeObj.sortPass = value;
    }
    constructor(isTransparent: boolean) {
        this._isTransparent = isTransparent;
        this._nativeObj = new (window as any).conchRenderQueue(isTransparent);
 	this._batch = RenderElementBatch.instance ? RenderElementBatch.instance : new RenderElementBatch();
    }

    set context(value:RenderContext3D){
        this._context = value._contextOBJ;
    }

  

    addRenderElement(renderelement: RenderElement) {
        this._nativeObj.addRenderElement((renderelement._renderElementOBJ as any)._nativeObj, 
             renderelement.render.renderNode,
             renderelement.material.renderQueue, 
             renderelement.render.sortingFudge);
        this.elements.add(renderelement);
    }

    clear(): void {
        this._nativeObj.clear();
        this.elements.length = 0;
    }

    renderQueue(context:RenderContext3D) {
        this.context = context;
        this._context.applyContext(Camera._updateMark);
        
        var elements: RenderElement[] = this.elements.elements;
		this._batchQueue();
        for (var i: number = 0, n: number = this.elements.length; i < n; i++){
            elements[i]._renderUpdatePre(context);//Update Data
            
        }
        //更新所有大buffer数据 nativeTODO

        this._nativeObj.renderQueue((this._context as any)._nativeObj);
        
        this._batch.recoverData();
    }

    private _batchQueue() {
       this._isTransparent|| this._batch.batch(this.elements);
    }

    }
}