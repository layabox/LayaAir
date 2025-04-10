import { Vector4 } from "../maths/Vector4";
import { IRenderContext2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { Render2DSimple } from "../renders/Render2D";
import { FastSinglelist } from "../utils/SingletonList";
import { Stat } from "../utils/Stat";
import { BaseRenderNode2D } from "./BaseRenderNode2D";

export interface IBatch2DRender {
    /**合批范围，合批的RenderElement2D直接add进list中 */
    batchRenderElement(list: FastSinglelist<IRenderElement2D>, start: number, length: number): void;

    recover():void;
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

/** @ignore */
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
     * 渲染层掩码，用于裁剪规则一
     */
    private _renderLayerMask: number = 0xFFFFFFFF;

    /**
     * 裁剪矩形，用于裁剪规则二
     */
    private _cullRect: Vector4 = new Vector4();

    /**
     * 设置渲染层掩码
     */
    set renderLayerMask(value: number) {
        this._renderLayerMask = value;
    }

    /**
     * 设置裁剪矩形
     */
    set cullRect(value: Vector4) {
        this._cullRect = value;
    }

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
            let element = this._batchInfoList.elements[i];
            if (element.batch) {
                element.batchFun.recover();
            }
            Batch2DInfo.recover(element);
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
        // 裁剪规则一：检查渲染层掩码
        // if ((renderNode.renderLayer & this._renderLayerMask) === 0) {
        //     return;
        // }

        // // 裁剪规则二：检查矩形相交
        // const nodeRect = renderNode.rect;
        // if (!this._isRectIntersect(nodeRect, this._cullRect)) {
        //     return;
        // }

        if (renderNode.preRenderUpdate)
            renderNode.preRenderUpdate(context);
        let n = renderNode._renderElements.length;
        if (n == 1) {
            this._batchStart(renderNode._renderType, 1);
            this._renderElementList.add(renderNode._renderElements[0]);
        } else {
            this._batchStart(renderNode._renderType, n);
            for (var i = 0; i < n; i++) {
                this._renderElementList.add(renderNode._renderElements[i]);
            }
        }
    }

    /**
     * 检查两个矩形是否相交
     */
    private _isRectIntersect(rect1: Vector4, rect2: Vector4): boolean {
        return !(rect1.x > rect2.z || rect1.z < rect2.x || rect1.y > rect2.w || rect1.w < rect2.y);
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
                for (let j = info.indexStart, m = info.elementLenth + info.indexStart; j < m; j++)
                    this._renderElementList.add(this._renderElementList.elements[j]);
            }
        }
    }

    /**
     * 开启一个Batch
     */
    private _batchStart(renderNodeType: number, elementLength: number) {
        if (this._lastRenderNodeType == -1) {
            this._lastbatch2DInfo = Batch2DInfo.create();
            //first renderNode
            this._lastbatch2DInfo.batch = false;
            this._lastbatch2DInfo.batchFun = RenderManager2D._batchMapManager[renderNodeType];
            this._lastbatch2DInfo.indexStart = 0;
            this._lastbatch2DInfo.elementLenth = elementLength;
            this._lastRenderNodeType = renderNodeType;
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
            this._lastRenderNodeType = renderNodeType;
        }
    }

    endRender() {
        this.clearList();
        this._renderEnd = true;//结束Render
        this._lastRenderNodeType = -1;
    }

}