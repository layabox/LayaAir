import { FastSinglelist } from "../../utils/SingletonList";
import { IRenderContext3D, IRenderElement3D } from "../DriverDesign/3DRenderPass/I3DRenderPass";
import { InstanceRenderBatch } from "./InstanceRenderBatch";
import { RenderQuickSort } from "./RenderQuickSort";

/**
 * 渲染节点队列
 */
export class RenderListQueue {
    private _elements: FastSinglelist<IRenderElement3D> = new FastSinglelist<IRenderElement3D>();
    get elements() { return this._elements; }
    private _quickSort: RenderQuickSort;
    private _isTransparent: boolean;

    _batch: InstanceRenderBatch;

    constructor(isTransParent: boolean) {
        this._isTransparent = isTransParent;
        this._quickSort = new RenderQuickSort();
        this._batch = new InstanceRenderBatch(); 
    }

    /**
     * 添加渲染元素
     * @param renderelement 
     */
    addRenderElement(renderelement: IRenderElement3D) {
        renderelement.materialShaderData && this._elements.add(renderelement);
    }

    /**
     * 合并渲染队列
     */
    private _batchQueue() {
        if (!this._isTransparent)
            this._batch.batch(this._elements);
    }

    /**
     * 渲染队列
     * @param context 
     */
    renderQueue(context: IRenderContext3D) {
        this._batchQueue(); //合并的地方
        const count = this._elements.length;
        this._quickSort.sort(this._elements, this._isTransparent, 0, count - 1);
        context.drawRenderElementList(this._elements);
        this._batch.clearRenderData();
    }

    /**
     * 清空队列
     */
    clear() {
        this._elements.length = 0;
    }

    /**
     * 销毁
     */
    destroy() {
        this.clear();
    }
}