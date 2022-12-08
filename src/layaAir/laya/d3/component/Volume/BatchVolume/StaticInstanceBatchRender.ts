import { SingletonList } from "../../../../utils/SingletonList";
import { Camera } from "../../../core/Camera";
import { BaseRender, RenderBitFlag } from "../../../core/render/BaseRender";
import { BatchMark } from "../../../core/render/BatchMark";
import { InstanceRenderElement } from "../../../core/render/InstanceRenderElement";
import { RenderElement } from "../../../core/render/RenderElement";
import { Scene3D } from "../../../core/scene/Scene3D";
import { InstanceBatchManager } from "../../../graphics/Batch/InstanceBatchManager";
import { MeshInstanceGeometry } from "../../../graphics/MeshInstanceGeometry";
import { Bounds } from "../../../math/Bounds";
import { Vector3 } from "../../../math/Vector3";
import { SubMesh } from "../../../resource/models/SubMesh";
import { BatchRender } from "./BatchRender";
const tempVec = new Vector3();
const tempVec1 = new Vector3();
/**
 * <code>StaticInstanceBatchRender</code> 类用于创建动作状态。
 */
export class StaticInstanceBatchRender extends BatchRender {
    private _batchManager: InstanceBatchManager;
    private _insBatchMarksNums: number[] = [];//记录每个BatchMask对应的Instance的数量
    private _insElementMarksArray: InstanceRenderElement[] = [];
    private _instanceBatchminNums: number = 10;
    private _updateChangeElement: InstanceRenderElement[] = [];
    private _lodsize:number;
    /**
     * 创建一个 <code>StaticInstanceBatchRender</code> 实例。
     */
    constructor() {
        super();
        this.checkLOD = true;
        this._batchManager = new InstanceBatchManager();
        this._RenderBitFlag = RenderBitFlag.RenderBitFlag_InstanceBatch;
    }

    /**
     * 判断这个Render是否支持InstanceBatch
     */
    private _isRenderNodeAllCanInstanceBatch(render: BaseRender): boolean {
        let elements = render._renderElements;
        for (var i = 0, n = elements.length; i < n; i++) {
            let element = elements[i];
            if (!element.material._shader._enableInstancing || element.render.lightmapIndex > 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * 是否满足自定义的batch条件
     */
    protected _canBatch(render: BaseRender): boolean {
        let elements = render._renderElements;
        for (var i = 0, n = elements.length; i < n; i++) {
            let element = elements[i];
            var insBatchMarks = this._batchManager.getInstanceBatchOpaquaMark(element.render.receiveShadow, element.material.id, element._geometry._id, element.transform ? element.transform._isFrontFaceInvert : false, element.render._probReflection ? element.render._probReflection.id : -1);
            if (this._insBatchMarksNums[insBatchMarks.indexInList] < this._instanceBatchminNums || element.material.renderQueue >= 3000) {
                return false;
            }
        }
        return true;
    }

    /**
     * 计算Instance合并数量
     * @param render 
     */
    private _sumInstanceBatch(render: BaseRender) {
        let elements = render._renderElements;
        for (var i = 0, n = elements.length; i < n; i++) {
            let element = elements[i];
            var insBatchMarks = this._batchManager.getInstanceBatchOpaquaMark(element.render.receiveShadow, element.material.id, element._geometry._id, element.transform ? element.transform._isFrontFaceInvert : false, element.render._probReflection ? element.render._probReflection.id : -1);
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
        var insBatchMarks = this._batchManager.getInstanceBatchOpaquaMark(element.render.receiveShadow, element.material.id, element._geometry._id, element.transform ? element.transform._isFrontFaceInvert : false, element.render._probReflection ? element.render._probReflection.id : -1);
        if (insBatchMarks.indexInList == -1)
            return;
        //TODO LOD
        let instanceelement: InstanceRenderElement = this._insElementMarksArray[insBatchMarks.indexInList];
        if (!instanceelement) {
            instanceelement = this._createInstanceElement(element, render, insBatchMarks);
        }
        let list = instanceelement._instanceBatchElementList;
        if (list.length == InstanceRenderElement.maxInstanceCount) {
            this._insBatchMarksNums.push(this._insBatchMarksNums[insBatchMarks.indexInList]);
            insBatchMarks.indexInList = this._insBatchMarksNums.length - 1;
            instanceelement = this._createInstanceElement(element, render, insBatchMarks);
        }
        if (list.indexof(element) == -1) {
            list.add(element);
            instanceelement._isUpdataData = true;
            this._updateChangeElement.push(instanceelement);
            element._batchElement = instanceelement;
        }
    }

    /**
     * remove one element
     * @param element 
     * @param render 
     * @returns 
     */
    private _removeOneElement(element: RenderElement, render: BaseRender) {
        var insBatchMarks = this._batchManager.getInstanceBatchOpaquaMark(element.render.receiveShadow, element.material.id, element._geometry._id, element.transform ? element.transform._isFrontFaceInvert : false, element.render._probReflection ? element.render._probReflection.id : -1);
        if (insBatchMarks.indexInList == -1)
            return;
        let instanceelement: InstanceRenderElement = element._batchElement as InstanceRenderElement;
        if (!instanceelement || this._renderElements.indexOf(instanceelement) == -1) {
            return;
        }
        let list = instanceelement._instanceBatchElementList;
        if (list.indexof(element) != -1) {
            list.remove(element);
            instanceelement._isUpdataData = true;
            this._updateChangeElement.push(instanceelement);
            element._batchElement = null;
        }
    }

    /**
     * update one element
     * @param element 
     * @param render 
     * @returns 
     */
    private _updateOneElement(element: RenderElement, render: BaseRender) {
        let instanceelement: InstanceRenderElement = element._batchElement as InstanceRenderElement;
        if (!instanceelement || this._renderElements.indexOf(instanceelement) == -1) {
            return;
        }
        let list = instanceelement._instanceBatchElementList;
        if (list.indexof(element) != -1) {
            instanceelement._isUpdataData = true;
            this._updateChangeElement.push(instanceelement);
        }
    }


    /**
     * 合批队列传入
     * @param renderNodes 
     */
    addList(renderNodes: BaseRender[]) {
        if (!this._batchList) {
            this._batchList = new SingletonList<BaseRender>();
        }
        let renders: BaseRender[] = [];
        for (var i = 0; i < renderNodes.length; i++) {
            let baseRender = renderNodes[i];
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
     * 根据_batchList合批
     */
    reBatch() {
        let renderNums = this._batchList.length;
        let renders = this._batchList.elements;
        for (var i = 0; i < renderNums; i++) {
            let render = renders[i];
            this._batchOneRender(render);
        }
    }

    /**
     * 添加合批到render
     * @param render 
     * @returns 
     */
    _batchOneRender(render: BaseRender) {
        if (!this._canBatch(render)) return;
        this.boundsChange = true;
        let elements = render._renderElements;
        for (let i = 0, n = elements.length; i < n; i++) {
            let renderelement = elements[i];
            this._batchOneElement(renderelement, render);
        }
        render._batchRender = this;
        render.setRenderbitFlag(RenderBitFlag.RenderBitFlag_InstanceBatch, true);

    }

    /**
     * 删除合批
     * @Override
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
     * @Override
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
     * create instanceElement
     * @param element 
     * @param render 
     * @param batchMark 
     * @returns 
     */
    private _createInstanceElement(element: RenderElement, render: BaseRender, batchMark: BatchMark) {
        let instanceRenderElement = new InstanceRenderElement();
        instanceRenderElement.render = render;
        instanceRenderElement.renderType = RenderElement.RENDERTYPE_INSTANCEBATCH;
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
        if (this._checkLOD) {
            if (!this._lodInstanceRenderElement[render._LOD]) {
                this._lodInstanceRenderElement[render._LOD] = [];
            }
            this._lodInstanceRenderElement[render._LOD].push(instanceRenderElement);
        }
        return instanceRenderElement;
    }

    /**
     * 渲染之后执行
     */
    callPostRender() {
        //返回
        for (let i = 0, n = this._updateChangeElement.length; i < n; i++) {
            this._updateChangeElement[i]._isUpdataData = false;
        }
    }

    onPreRender() {
        if (!this.checkLOD || !this._lodRateArray || this._lodRateArray.length < 1) {
            this._changeLOD(0);
        } else {
            let checkCamera = (this.owner.scene as Scene3D).cullInfoCamera as Camera;
            let maxYDistance = checkCamera.maxlocalYDistance;
            let cameraFrustum = checkCamera.boundFrustum;
            Vector3.subtract(this._bounds.getCenter(), checkCamera.transform.position, tempVec);
            //大于farplane,或者不在视锥内.不做lod操作
            let length = tempVec.length();
            checkCamera.transform.worldMatrix.getForward(tempVec1);
            Vector3.normalize(tempVec, tempVec);
            Vector3.normalize(tempVec1, tempVec1);
            let rateYDistance = length * Vector3.dot(tempVec, tempVec1) / checkCamera.farPlane * maxYDistance;
            let rate = (this._lodsize / rateYDistance);
            for(let i = 0;i<this._lodRateArray.length;i++){
                if(rate<this._lodRateArray[i])
                    continue;
                this._changeLOD(i);
                break;
            }
        }
    }


    /**
     * 重新计算包围盒
     */
    protected _calculateBoundingBox() {
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
     * 恢复batch之前的渲染
     */
    _restorRenderNode() {
        for (let i = 0, n = this._batchList.length; i < n; i++) {
            this._removeOneRender(this._batchList.elements[i]);
        }
    }

    /**
     * 清理
     */
    _clear() {
        this._restorRenderNode();
        for (let i = 0, n = this._insElementMarksArray.length; i < n; i++) {
            this._insElementMarksArray[i].destroy();
        }
        this._insElementMarksArray = [];
        this._updateChangeElement = [];
        this._insBatchMarksNums = [];
        this._renderElements = [];
    }

    protected _onDestroy() {
        super._onDestroy();
    }
}