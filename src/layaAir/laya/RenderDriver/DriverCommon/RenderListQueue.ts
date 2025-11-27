import { LayaGL } from "../../layagl/LayaGL";
import { StatElement } from "../../layagl/StatisticsContext";
import { FastSinglelist, SingletonList } from "../../utils/SingletonList";
import { IRenderContext3D, IRenderElement3D } from "../DriverDesign/3DRenderPass/I3DRenderPass";
import { IModuleAgentResource } from "../DriverDesign/3DRenderPass/IBatchModuleAgent";
import { RenderQuickSort } from "./RenderQuickSort";

/**
 * 渲染节点队列
 */
export class RenderListQueue {
    private _elements: FastSinglelist<IRenderElement3D> = new FastSinglelist<IRenderElement3D>();

    private batchModule: SingletonList<IModuleAgentResource> = new SingletonList();

    get elements() { return this._elements; }
    private _quickSort: RenderQuickSort;
    private _isTransparent: boolean;


    constructor(isTransParent: boolean) {
        this._isTransparent = isTransParent;
        this._quickSort = new RenderQuickSort();
    }

    /**
     * 添加渲染元素
     * @param renderelement 
     */
    addRenderElement(renderelement: IRenderElement3D) {
        renderelement.materialShaderData && this._elements.add(renderelement);
    }

    addBatchAgent(agent: IModuleAgentResource) {
        this.batchModule.add(agent);
    }

    /**
     * 渲染队列
     * @param context 
     */
    renderQueue(context: IRenderContext3D) {
        this.sort();
        if (!this._isTransparent && this.batchModule.length > 0) {
            for (var i = 0, n = this.batchModule.length; i < n; i++) {
                let list = this.batchModule.elements[i].opaqueList;
                for (var j = 0, m = list.length; j < m; j++) {
                    let elements = list.elements;
                    this._elements.add(elements[j]);
                }
            }
        }
        context.drawRenderElementList(this._elements);
        LayaGL.statAgent.recordCTData(this._isTransparent ? StatElement.CT_TransDrawCall : StatElement.CT_OpaqueDrawCall, this.elements.length)
    }

    mergeQueue() {
        this.sort();
        if (!this._isTransparent && this.batchModule.length > 0) {
            for (var i = 0, n = this.batchModule.length; i < n; i++) {
                let list = this.batchModule.elements[i].opaqueList;
                for (var j = 0, m = list.length; j < m; j++) {
                    let elements = list.elements;
                    this._elements.add(elements[j]);
                }
            }
        }
    }

    renderQueueOnly(context: IRenderContext3D) {
        context.drawRenderElementList(this._elements);
        LayaGL.statAgent.recordCTData(this._isTransparent ? StatElement.CT_TransDrawCall : StatElement.CT_OpaqueDrawCall, this.elements.length)
    }

    sort() {
        const count = this._elements.length;
        this._quickSort.sort(this._elements, this._isTransparent, 0, count - 1);
    }
    /**
     * 清空队列
     */
    clear() {
        this._elements.elements.fill(null); //避免引用js对象导致无法gc
        this._elements.length = 0;
        this.batchModule.length = 0;
    }

    /**
     * 销毁
     */
    destroy() {
        this.clear();
        this._elements = null;
    }
}