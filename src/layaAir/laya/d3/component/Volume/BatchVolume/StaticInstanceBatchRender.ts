import { SingletonList } from "../../../../utils/SingletonList";
import { BaseRender, RenderBitFlag } from "../../../core/render/BaseRender";
import { BatchMark } from "../../../core/render/BatchMark";
import { InstanceRenderElement } from "../../../core/render/InstanceRenderElement";
import { RenderElement } from "../../../core/render/RenderElement";
import { InstanceBatchManager } from "../../../graphics/Batch/InstanceBatchManager";
import { MeshInstanceGeometry } from "../../../graphics/MeshInstanceGeometry";
import { Bounds } from "../../../math/Bounds";
import { SubMesh } from "../../../resource/models/SubMesh";
import { BatchRender } from "./BatchRender";

/**
 * @en used to create static instance batch rendering.
 * @zh 用于创建静态实例批处理渲染。
 */
export class StaticInstanceBatchRender extends BatchRender {

    /**@internal instanceBatchManager*/
    private _batchManager: InstanceBatchManager;

    /**@internal  记录每个BatchMask对应的Instance的数量*/
    private _insBatchMarksNums: number[] = [];

    /**@interal */
    private _insElementMarksArray: InstanceRenderElement[] = [];

    /**@interal batch rule:Batch min count*/
    private _instanceBatchminNums: number = 10;

    /**@interal cache udpate element*/
    private _updateChangeElement: InstanceRenderElement[] = [];

    /**
     * @en constructor, initialize static instance batch rendering.
     * @zh 构造方法, 初始化静态实例批处理渲染。
     */
    constructor() {
        super();
        this.checkLOD = true;
        this._batchManager = new InstanceBatchManager();
        this._RenderBitFlag = RenderBitFlag.RenderBitFlag_InstanceBatch;
    }

    /**
     * @en Determines whether this render supports instance batching.
     * @param render The render object to be checked.
     * @returns A boolean value indicating whether instance batching is supported.
     * @zh 判断这个 Render 是否支持 InstanceBatch。
     * @param render 要检查的渲染对象。
     * @returns 一个布尔值，指示是否支持实例批处理。
     */
    private _isRenderNodeAllCanInstanceBatch(render: BaseRender): boolean {
        let elements = render._renderElements;
        for (var i = 0, n = elements.length; i < n; i++) {
            let element = elements[i];
            if (!element.material._shader._enableInstancing) {
                return false;
            }
        }
        return true;
    }

    /**
     * @en Calculates the number of instances to be batched.
     * @param render The render object containing the elements to be batched.
     * @zh 计算实例合并的数量。
     * @param render 包含要合并元素的渲染对象。
     */
    private _sumInstanceBatch(render: BaseRender) {
        let elements = render._renderElements;
        for (var i = 0, n = elements.length; i < n; i++) {
            let element = elements[i];
            var insBatchMarks = this._batchManager.getInstanceBatchOpaquaMark(element);
            if (insBatchMarks.indexInList == -1) {
                insBatchMarks.indexInList = this._insBatchMarksNums.length;
                this._insBatchMarksNums.push(0);
            }
            this._insBatchMarksNums[insBatchMarks.indexInList] += 1;
        }
    }

    /**
     * batch one element
     * @param element 
     * @param render 
     * @returns 
     */
    private _batchOneElement(element: RenderElement, render: BaseRender) {
        var insBatchMarks = this._batchManager.getInstanceBatchOpaquaMark(element);
        if (insBatchMarks.indexInList == -1)
            return;
        let instanceelement: InstanceRenderElement = this._insElementMarksArray[insBatchMarks.indexInList];
        if (!instanceelement) {
            instanceelement = this._createInstanceElement(element, render, insBatchMarks);
        }
        let list = instanceelement._instanceBatchElementList;
        if (list.length == InstanceRenderElement.maxInstanceCount) {
            this._insBatchMarksNums.push(this._insBatchMarksNums[insBatchMarks.indexInList]);
            insBatchMarks.indexInList = this._insBatchMarksNums.length - 1;
            instanceelement = this._createInstanceElement(element, render, insBatchMarks);
            list = instanceelement._instanceBatchElementList;
        }
        if (list.indexof(element) == -1) {
            list.add(element);
            instanceelement._isUpdataData = true;
            (this._updateChangeElement.indexOf(instanceelement) == -1) && this._updateChangeElement.push(instanceelement);
            //element._batchElement = instanceelement;
        }
    }

    /**
     * remove one element
     * @param element 
     * @param render 
     * @returns 
     */
    private _removeOneElement(element: RenderElement, render: BaseRender) {
        var insBatchMarks = this._batchManager.getInstanceBatchOpaquaMark(element);
        if (insBatchMarks.indexInList == -1)
            return;
        // let instanceelement: InstanceRenderElement = element._batchElement as InstanceRenderElement;
        // if (!instanceelement || this._renderElements.indexOf(instanceelement) == -1) {
        //     return;
        // }
        // let list = instanceelement._instanceBatchElementList;
        // if (list.indexof(element) != -1) {
        //     list.remove(element);
        //     instanceelement._isUpdataData = true;
        //     (this._updateChangeElement.indexOf(instanceelement) == -1) && this._updateChangeElement.push(instanceelement);
        //     element._batchElement = null;
        // }
    }

    /**
     * update one element
     * @param element 
     * @param render 
     * @returns 
     */
    private _updateOneElement(element: RenderElement, render: BaseRender) {
        //let instanceelement: InstanceRenderElement = element._batchElement as InstanceRenderElement;
        // if (!instanceelement || this._renderElements.indexOf(instanceelement) == -1) {
        //     return;
        // }
        // let list = instanceelement._instanceBatchElementList;
        // if (list.indexof(element) != -1) {
        //     instanceelement._isUpdataData = true;
        //     (this._updateChangeElement.indexOf(instanceelement) == -1) && this._updateChangeElement.push(instanceelement);
        // }
    }

    /**
     * create instanceElement
     * @param element 
     * @param render 
     * @param batchMark 
     * @returns 
     */
    private _createInstanceElement(element: RenderElement, render: BaseRender, batchMark: BatchMark) {
        let instanceRenderElement = new InstanceRenderElement();
        instanceRenderElement.render = render;
        //instanceRenderElement.renderType = RenderElement.RENDERTYPE_INSTANCEBATCH;
        //Geometry updaste
        (instanceRenderElement._geometry as MeshInstanceGeometry).subMesh = (element._geometry as SubMesh);
        instanceRenderElement.material = element.material;
        instanceRenderElement.setTransform(null);
        instanceRenderElement.renderSubShader = element.renderSubShader;
        let list = instanceRenderElement._instanceBatchElementList;
        list.length = 0;
        list.add(element);
        this._insElementMarksArray[batchMark.indexInList] = instanceRenderElement;
        batchMark.batched = true;
        if (!this._lodInstanceRenderElement[render._LOD]) {
            this._lodInstanceRenderElement[render._LOD] = [];
        }
        this._lodInstanceRenderElement[render._LOD].push(instanceRenderElement);
        return instanceRenderElement;
    }

    /**
     * @internal
     * @override
     * @en Determines whether the render instance meets the batch conditions.
     * @param render The base render object to check for batching conditions.
     * @returns boolean True if the render instance meets the batching conditions; otherwise, false.
     * @zh 判断渲染实例是否满足批处理条件。
     * @param render 要检查批处理条件的基础渲染对象。
     * @returns boolean 如果渲染实例满足批处理条件，则返回 true；否则返回 false。
     */

    protected _canBatch(render: BaseRender): boolean {
        let elements = render._renderElements;
        for (var i = 0, n = elements.length; i < n; i++) {
            let element = elements[i];
            var insBatchMarks = this._batchManager.getInstanceBatchOpaquaMark(element);
            if (this._insBatchMarksNums[insBatchMarks.indexInList] < this._instanceBatchminNums || element.material.renderQueue >= 3000) {
                return false;
            }
        }
        return true;
    }

    /**
     * @override
     * @internal
     * @en Recalculate the bounding box
     * @zh 重新计算包围盒
     */
    _calculateBoundingBox() {
        let bound = this._bounds;
        for (let i = 0, n = this._batchList.length; i < n; i++) {
            if (i == 0) {
                this._batchList.elements[i].bounds.cloneTo(bound);
            } else {
                Bounds.merge(bound, this._batchList.elements[i].bounds, bound);
            }
        }
        let extend = this._bounds.getExtent();
        this._lodsize = 2 * Math.max(extend.x, extend.y, extend.z);
        return this._bounds;
    }

    /**
     * @internal
     * @protected
     * destroy
     */
    protected _onDestroy() {
        super._onDestroy();
    }

    /**
     * 添加合批到render
     * @param render 
     * @internal
     * @returns 
     */
    _batchOneRender(render: BaseRender) {
        if (!this._canBatch(render)) return false;
        this.boundsChange = true;
        let elements = render._renderElements;
        for (let i = 0, n = elements.length; i < n; i++) {
            let renderelement = elements[i];
            this._batchOneElement(renderelement, render);
        }
        render._batchRender = this;
        render.setRenderbitFlag(RenderBitFlag.RenderBitFlag_InstanceBatch, true);
        return true;
    }

    /**
     * 删除合批
     * @Override
     * @internal
     * @param render 
     * @returns 
     */
    _removeOneRender(render: BaseRender) {
        if (!this._canBatch(render)) return;
        if (this._batchList.indexof(render) != -1) {
            this.boundsChange = true;
            let elements = render._renderElements;
            for (let i = 0, n = elements.length; i < n; i++) {
                let renderelement = elements[i];
                this._removeOneElement(renderelement, render);
            }
            render._batchRender = null;
            render.setRenderbitFlag(RenderBitFlag.RenderBitFlag_InstanceBatch, false);
        }
    }

    /**
     * 合批过的更新数据
     * @override
     * @internal
     * @param render 
     * @returns 
     */
    _updateOneRender(render: BaseRender) {
        if (!this._canBatch(render)) return;
        if (this._batchList.indexof(render) != -1) {
            this.boundsChange = true;
            let elements = render._renderElements;
            for (let i = 0, n = elements.length; i < n; i++) {
                let renderelement = elements[i];
                this._updateOneElement(renderelement, render);
            }
        }
    }

    /**
     * @internal
     * @en Clean up all renderings
     * @zh 清理所有渲染
     */
    _clear() {
        super._clear();
        this._insElementMarksArray.forEach(element => {
            element && element.destroy();
        });

        this._insElementMarksArray = [];
        this._updateChangeElement = [];
        this._insBatchMarksNums = [];
    }



    /**
     * @en Add a list of renders to the batch queue
     * @param renderNodes  The render queue to be added
     * @zh 将渲染队列添加到批处理队列
     * @param renderNodes  要添加的渲染队列
     */
    addList(renderNodes: BaseRender[]) {
        if (!this._batchList) {
            this._batchList = new SingletonList<BaseRender>();
        }
        let renders: BaseRender[] = [];
        for (var i = 0; i < renderNodes.length; i++) {
            let baseRender = renderNodes[i];
            if (baseRender._batchRender) {
                continue;
            }
            if (this._isRenderNodeAllCanInstanceBatch(baseRender)) {
                // this._batchList.add(baseRender);
                renders.push(baseRender);
                this._sumInstanceBatch(baseRender);
            }
        }
        for (var i = 0, n = renders.length; i < n; i++) {
            let baseRender = renders[i];
            if (this._canBatch(baseRender)) {
                this._batchList.add(baseRender);
            }
        }
    }
    /**
     * @en Rebatch based on the _batchList
     * @zh 根据_batchList重新进行批处理
     */
    reBatch() {
        let renderNums = this._batchList.length;
        let renders = this._batchList.elements;
        for (var i = 0; i < renderNums; i++) {
            let render = renders[i];
            this._batchOneRender(render);
        }
    }

}