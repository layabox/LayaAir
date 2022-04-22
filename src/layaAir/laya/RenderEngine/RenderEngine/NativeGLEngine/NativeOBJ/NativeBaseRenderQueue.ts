import { SingletonList } from "../../../../d3/component/SingletonList";
import { RenderContext3D } from "../../../../d3/core/render/RenderContext3D";
import { RenderElement } from "../../../../d3/core/render/RenderElement";
import { IRenderContext3D } from "../../../RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { IRenderQueue } from "../../../RenderInterface/RenderPipelineInterface/IRenderQueue";
import { ISortPass } from "../../../RenderInterface/RenderPipelineInterface/ISortPass";
import { QuickSort } from "../../../RenderObj/QuickSort";

export class NativeBaseRenderQueue implements IRenderQueue {
   /** @internal */
   elements: SingletonList<RenderElement> = new SingletonList<RenderElement>();
   /**sort function*/
   _sortPass: ISortPass;
   /** context*/
   _context:IRenderContext3D;
   private _nativeObj: any;
    set sortPass(value: ISortPass) {
        this._nativeObj.sortPass = value;
    }
    constructor(isTransparent: boolean) {
        this._nativeObj = new (window as any).conchRenderQueue(isTransparent);
    }

    set context(value:RenderContext3D){
        this._context = value._contextOBJ;
    }

  

    addRenderElement(renderelement: RenderElement) {
        this._nativeObj.addRenderElement(renderelement._renderElementOBJ);
        this.elements.add(renderelement);
    }

    clear(): void {
        this._nativeObj.clear();
        this.elements.length = 0;
    }

    renderQueue(context:RenderContext3D) {
        this.context = context;
        this._context.applyContext();
        
        var elements: RenderElement[] = this.elements.elements;
		this._batchQueue();
        for (var i: number = 0, n: number = this.elements.length; i < n; i++){
            elements[i]._renderUpdatePre(context);//Update Data
            
        }
        //更新所有大buffer数据 nativeTODO

        this._nativeObj.renderQueue(this._context);
        
    }

    private _batchQueue() {

    }
}