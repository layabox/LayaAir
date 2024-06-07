import { IRenderContext2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { Render2DSimple } from "../renders/Render2D";
import { FastSinglelist } from "../utils/SingletonList";
import { Stat } from "../utils/Stat";
import { BaseRenderNode2D } from "./BaseRenderNode2D";

export interface IBatch2DRender {
    /**合批范围，合批的RenderElement2D直接add进list中 */
    batchRenderElement(list: FastSinglelist<IRenderElement2D>, start: number, length: number): void;
}
export class Batch2DInfo {
    batchFun: IBatch2DRender = null;
    batch: boolean = false;
    indexStart: number = -1;
    elementLenth: number = 0;
    constructor() {
    }

    static _pool: Batch2DInfo[] = [];
    static create(): Batch2DInfo {
        if (this._pool.length != 0) {
            return this._pool.pop();
        } else
            return new Batch2DInfo();
    }
    static recover(info: Batch2DInfo) {
        this._pool.push(info);
    }
}
export class RenderManager2D {

    /**
     * 根据不同的RenderNode注册合批方式，来优化性能
     */
    private static _batchMapManager: { [key: number]: IBatch2DRender } = {};

    /**
     * 注册渲染节点之间的合批
     * @param firstRenderElementType 
     * @param lastRenderElementType 
     * @param batch 
     */
    static regisBatch(renderElementType: number, batch: IBatch2DRender): void {
        if (RenderManager2D._batchMapManager[renderElementType])
            throw "Overlapping batch optimization";
        else
            RenderManager2D._batchMapManager[renderElementType] = batch;

    }

    private _lastRenderNodeType: number = -1;
    private _lastbatch2DInfo: Batch2DInfo

    /**
     * @internal
     */
    _list: FastSinglelist<BaseRenderNode2D>;

    /**
     * @internal
     */
    _renderElementList: FastSinglelist<IRenderElement2D>;


    _batchInfoList: FastSinglelist<Batch2DInfo>;

    /**
     * 渲染结束标签
     */
    _renderEnd: boolean = true;

    /**
    * RenderList
    */
    get list(): FastSinglelist<BaseRenderNode2D> {
        return this._list;
    }

    set list(value: FastSinglelist<BaseRenderNode2D>) {
        this._list = value;
    }

    constructor() {
        this.list = new FastSinglelist<BaseRenderNode2D>();
        this._renderElementList = new FastSinglelist<IRenderElement2D>();
        this._batchInfoList = new FastSinglelist<Batch2DInfo>();
        this._lastbatch2DInfo = Batch2DInfo.create();
    }

    /**
    * add Render Node
    * @param object 
    */
    addRenderObject(object: BaseRenderNode2D): void {
        this.list.add(object);
    }

    /**
     * remove Render Node
     * @param object 
     */
    removeRenderObject(object: BaseRenderNode2D): void {
        this.list.remove(object);
    }

    /**
     * clear list
     */
    clearList() {
        this._list.clear();
        this._renderElementList.clear();
        for (var i = 0, n = this._batchInfoList.length; i < n; i++) {
            Batch2DInfo.recover(this._batchInfoList.elements[i]);
        }
        this._batchInfoList.clear();
    }


    /**
     * 帧更新
     */
    renderUpdate(): void {
        var context: IRenderContext2D = Render2DSimple.rendercontext2D;
        let lists = this._list.elements;
        for (let i = 0, n = this._list.length; i < n; i++) {
            let render = lists[i];
            if (render.renderUpdate && render._renderUpdateMask != Stat.loopCount) {
                render.renderUpdate(context);
                render._renderUpdateMask = Stat.loopCount;
            }
        }
    }

    /**
     * 渲染
     * @param context 
     */
    render(context: IRenderContext2D) {
        this.renderUpdate();
        for (var i = 0, n = this._list.length; i < n; i++) {
            this._cull(this._list.elements[i], context);
        }
        this._batch();
        context.drawRenderElementList(this._renderElementList);
        this.endRender();
    }

    private _cull(renderNode: BaseRenderNode2D, context: IRenderContext2D) {
        if (false) {
            //没有camera和layer的代码 暂时先保留
            //Cull TODO
            return;
        } else {
            //cull 通过
            if (renderNode.preRenderUpdate)
                renderNode.preRenderUpdate(context);
            let n = renderNode._renderElements.length;
            if (n == 1) {
                this._renderElementList.add(renderNode._renderElements[0]);
                this._batchStart(renderNode._renderType, 1);

            } else {
                for (var i = 0; i < n; i++) {
                    this._renderElementList.add(renderNode._renderElements[i]);
                }
                this._batchStart(renderNode._renderType, n);
            }
        }
    }


    /**
     * 合批总循环
     */
    private _batch() {
        this._batchInfoList.add(this._lastbatch2DInfo);
        this._renderElementList.length = 0;
        for (var i = 0, n = this._batchInfoList.length; i < n; i++) {
            let info = this._batchInfoList.elements[i];
            if (info.batch) {
                info.batchFun.batchRenderElement(this._renderElementList, info.indexStart, info.elementLenth);
            } else {
                for (var i = info.indexStart, n = info.elementLenth + info.indexStart; i < n; i++)
                    this._renderElementList.add(this._renderElementList.elements[i]);
            }
        }
    }

    /**
     * 开启一个Batch
     */
    private _batchStart(renderNodeType: number, elementLength: number) {
        if (this._lastRenderNodeType == -1) {
            //first renderNode
            this._lastbatch2DInfo.batch = false;
            this._lastbatch2DInfo.batchFun = RenderManager2D._batchMapManager[renderNodeType];
            this._lastbatch2DInfo.indexStart = 0;
            this._lastbatch2DInfo.elementLenth = elementLength;
            this._lastRenderNodeType = renderNodeType
            return;
        }
        if (this._lastRenderNodeType == renderNodeType) {
            this._lastbatch2DInfo.batch = !!(this._lastbatch2DInfo.batchFun);
            this._lastbatch2DInfo.elementLenth += elementLength;
        } else {
            this._batchInfoList.add(this._lastbatch2DInfo);
            this._lastbatch2DInfo = Batch2DInfo.create();
            this._lastbatch2DInfo.batch = false;
            this._lastbatch2DInfo.batchFun = RenderManager2D._batchMapManager[renderNodeType];
            this._lastbatch2DInfo.indexStart = this._renderElementList.length;
            this._lastbatch2DInfo.elementLenth = elementLength;
        }
    }

    endRender() {
        this.clearList();
        this._renderEnd = true;//结束Render
        this._lastRenderNodeType = -1;
    }

}