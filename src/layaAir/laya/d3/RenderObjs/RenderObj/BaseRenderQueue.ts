import { IRenderContext3D } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { IRenderQueue } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderQueue";
import { ISortPass } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISortPass";
import { SingletonList } from "../../../utils/SingletonList";
import { BufferState } from "../../../webgl/utils/BufferState";
import { Camera } from "../../core/Camera";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { RenderElement } from "../../core/render/RenderElement";
import { RenderElementBatch } from "../../graphics/Batch/RenderElementBatch";

export class BaseRenderQueue implements IRenderQueue {
    /** @interanl */
    _isTransparent: boolean = false;
    /** @internal */
    elements: SingletonList<RenderElement> = new SingletonList<RenderElement>();
    /**sort function*/
    _sortPass: ISortPass;
    /** context*/
    _context: IRenderContext3D;

    _batch: RenderElementBatch;

    set sortPass(value: ISortPass) {
        this._sortPass = value;
    }
    constructor(isTransparent: boolean) {
        this._isTransparent = isTransparent;
        this._batch = RenderElementBatch.instance ? RenderElementBatch.instance : new RenderElementBatch();
    }


    set context(value: RenderContext3D) {
        this._context = value._contextOBJ;
    }

    addRenderElement(renderelement: RenderElement) {
        this.elements.add(renderelement);
    }

    clear(): void {
        this.elements.length = 0;
    }

    renderQueue(context: RenderContext3D): number {
        this.context = context;
        this._context.applyContext(Camera._updateMark);

        var elements: RenderElement[] = this.elements.elements;

        this._batchQueue();//合并的地方
        for (var i: number = 0, n = this.elements.length; i < n; i++) {
            elements[i]._renderUpdatePre(context);//Update Data
        }
        //更新所有大buffer数据 nativeTODO

        this._sort();
        for (var i: number = 0, n: number = this.elements.length; i < n; i++)
            elements[i]._render(this._context);//Update Data
        BufferState._curBindedBufferState && BufferState._curBindedBufferState.unBind();
        this._batch.recoverData();
        this._context.end()
        return n;
    }

    private _batchQueue() {
        this._isTransparent || this._batch.batch(this.elements);
    }

    private _sort() {
        var count: number = this.elements.length;
        this._sortPass.sort(this.elements, this._isTransparent, 0, count - 1);
    }

    destroy(): void {
        this.elements.destroy();
    }
}