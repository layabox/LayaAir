import { Vector3 } from "../../../../maths/Vector3";
import { FastSinglelist, SingletonList } from "../../../../utils/SingletonList";
import { Camera } from "../../../core/Camera";
import { BaseRender, RenderBitFlag } from "../../../core/render/BaseRender";
import { InstanceRenderElement } from "../../../core/render/InstanceRenderElement";
import { Scene3D } from "../../../core/scene/Scene3D";


/**
 * @en Class used to describe batched rendering nodes.
 * @zh 类用来描述合批的渲染节点。
 */
export class BatchRender extends BaseRender {
    /**@internal */
    protected _checkLOD: boolean;
    /**@internal */
    protected _lodCount: number;
    /**@internal */
    protected _lodRateArray: number[];
    /**@internal*/
    protected _batchList: FastSinglelist<BaseRender>;
    /**@internal*/
    protected _batchbit: RenderBitFlag;
    /**@internal*/
    protected _RenderBitFlag: RenderBitFlag;
    /**@internal*/
    protected _lodInstanceRenderElement: { [key: number]: InstanceRenderElement[] } = {};
    /**@internal*/
    protected _lodsize: number;
    /**@internal*/
    private _cacheLod: number;

    /**
     * @en constructor, initialize the batch rendering node.
     * @zh 构造方法, 初始化合批渲染节点。
     */
    constructor() {
        super();
        this._RenderBitFlag = RenderBitFlag.RenderBitFlag_Batch;
        this._renderElements = [];
        this._lodInstanceRenderElement[-1] = [];
        this._batchList = new SingletonList<BaseRender>();
    }

    /**
     * @en Whether to batch based on LOD (Level of Detail).
     * @zh 是否根据 LOD（细节层次）来进行合批。
     */
    get checkLOD() {
        return this._checkLOD;
    }

    set checkLOD(value: boolean) {
        this._checkLOD = value;
    }

    /**
     * @en Sets the LOD culling rate array for filtering.
     * @zh 设置 LOD 裁剪率数组用于过滤。
     */
    get lodCullRateArray() {
        return this._lodRateArray;
    }

    set lodCullRateArray(value: number[]) {
        if (!this._checkLOD) {
            return;
        }
        value.sort((a, b) => b - a);
        this._lodRateArray = value;
    }


    /**
     * @internal
     * @protected
     * Overrid it
     *  是否满足batch条件
     */
    protected _canBatch(render: BaseRender): boolean {
        if (render._batchRender) {
            return false;
        }
        return false;
    }

    /**
     * @internal
     * @protected
     */
    protected _onEnable(): void {
        super._onEnable();
        if (this._batchList) {
            for (let i = 0, n = this._batchList.length; i < n; i++) {
                this._batchList.elements[i].setRenderbitFlag(this._RenderBitFlag, true);
            }
        }
    }

    /**
     * @internal
     * @protected
     */
    protected _onDisable(): void {
        super._onDisable();
        if (this._batchList) {
            for (let i = 0, n = this._batchList.length; i < n; i++) {
                this._batchList.elements[i].setRenderbitFlag(this._RenderBitFlag, false);
            }
        }
    }

    /**
     * @internal
     * @protected
     * 根据lod的改变
     */
    protected _changeLOD(lod: number) {
        if (this._cacheLod == lod) {
            return;
        }

        if (this._cacheLod == this.lodCullRateArray.length - 1) {
            lod = -1;
        }

        this._renderElements = this._lodInstanceRenderElement[lod];
        if (this._lodInstanceRenderElement[lod] && lod != -1) {
            this._renderElements || (this._renderElements = []);
            this._renderElements = this._renderElements.concat(this._lodInstanceRenderElement[-1]);
        } else {
            this._renderElements = this._lodInstanceRenderElement[-1];
        }

    }

    /**
     * @en Called before rendering. Handles LOD (Level of Detail) calculations and changes.
     * @zh 渲染前调用。处理 LOD（细节级别）计算和变更。
     */
    onPreRender() {
        if (!this.checkLOD || !this._lodRateArray || this._lodRateArray.length < 1) {
            this._changeLOD(0);
        } else {
            let checkCamera = (this.owner.scene as Scene3D).cullInfoCamera as Camera;
            let maxYDistance = checkCamera.maxlocalYDistance;
            Vector3.subtract(this._bounds._imp.getCenter(), checkCamera.transform.position, tempVec);
            //大于farplane,或者不在视锥内.不做lod操作
            let length = tempVec.length();
            let rateYDistance = length / checkCamera.farPlane * maxYDistance;
            let rate = (this._lodsize / rateYDistance);
            for (let i = 0; i < this._lodRateArray.length; i++) {
                if (rate < this._lodRateArray[i])
                    continue;
                this._changeLOD(i);
                break;
            }
        }
    }

    /**
     * @internal
     * @param render 
     */
    _batchOneRender(render: BaseRender): boolean {
        //TODO
        return false
    }

    /**
     * @internal
     * @param render 
     */
    _removeOneRender(render: BaseRender) {
        //TODO
    }

    /**
     * @internal
     * @param render 
     */
    _updateOneRender(render: BaseRender) {
        //TODO
    }

    /**
     * @en Adds a list of render nodes to the batch queue.
     * @param renderNode An array of BaseRender objects to be added to the batch.
     * @zh 将渲染节点队列添加到合批队列中。
     * @param renderNode 要添加到合批的 BaseRender 对象数组。
     */
    addList(renderNode: BaseRender[]) {
        for (var i = 0, n = renderNode.length; i < n; i++) {
            let baseRender = renderNode[i];
            if (this._canBatch(baseRender)) {
                this._batchList.add(baseRender);
            }
        }
    }

    /**
     * @en Performs batching based on the _batchList.
     * This method iterates through the _batchList and batches each render node.
     * @zh 根据 _batchList 执行合批操作。
     * 此方法遍历 _batchList 并对每个渲染节点进行合批。
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
     * @internal
     * @en Restoring the Batch Render State
     * @zh 恢复批处理渲染状态
     */
    _restorRenderNode() {
        for (let i = 0, n = this._batchList.length; i < n; i++) {
            this._removeOneRender(this._batchList.elements[i]);
        }
    }

    /**
     * @internal
     */
    _clear() {
        this._restorRenderNode();
        this._renderElements = [];
        this._batchList.destroy();
        this._batchList = new SingletonList<BaseRender>();
        this._lodInstanceRenderElement = {};
        this._lodInstanceRenderElement[-1] = [];

    }
}

const tempVec = new Vector3();