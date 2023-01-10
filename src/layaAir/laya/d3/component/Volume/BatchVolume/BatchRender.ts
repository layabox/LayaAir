import { Vector3 } from "../../../../maths/Vector3";
import { SingletonList } from "../../../../utils/SingletonList";
import { Camera } from "../../../core/Camera";
import { BaseRender, RenderBitFlag } from "../../../core/render/BaseRender";
import { InstanceRenderElement } from "../../../core/render/InstanceRenderElement";
import { Scene3D } from "../../../core/scene/Scene3D";
const tempVec = new Vector3();
const tempVec1 = new Vector3();
/**
 * 类用来描述合批的渲染节点
 */
export class BatchRender extends BaseRender {
    /**@internal */
    protected _checkLOD: boolean;
    protected _lodCount: number;
    protected _lodRateArray: number[];
    protected _batchList: SingletonList<BaseRender>;
    protected _batchbit: RenderBitFlag;
    protected _RenderBitFlag: RenderBitFlag;
    protected _lodInstanceRenderElement: { [key: number]: InstanceRenderElement[] } = {};
    protected _lodsize: number;
    private _cacheLod: number;

    /**
     * 创建一个 <code>BatchRender</code> 实例。
     */
    constructor() {
        super();
        this._RenderBitFlag = RenderBitFlag.RenderBitFlag_Batch;
        this._renderElements = [];
        this._lodInstanceRenderElement[-1] = [];
        this._batchList = new SingletonList<BaseRender>();
    }

    /**
     * 是否根据lod来合批
     */
    get checkLOD() {
        return this._checkLOD;
    }

    set checkLOD(value: boolean) {
        this._checkLOD = value;
    }

    /**
     * lod裁剪过滤
     */
    set lodCullRateArray(value: number[]) {
        if (!this._checkLOD) {
            return;
        }
        value.sort((a, b) => b - a);
        this._lodRateArray = value;
    }

    get lodCullRateArray() {
        return this._lodRateArray;
    }


    /**
     * Overrid it
     *  是否满足batch条件
     */
    protected _canBatch(render: BaseRender): boolean {
        if (render._batchRender) {
            return false;
        }
        return false;
    }

    protected _onEnable(): void {
        super._onEnable();
        if (this._batchList) {
            for (let i = 0, n = this._batchList.length; i < n; i++) {
                this._batchList.elements[i].setRenderbitFlag(this._RenderBitFlag, true);
            }
        }
    }

    protected _onDisable(): void {
        super._onDisable();
        if (this._batchList) {
            for (let i = 0, n = this._batchList.length; i < n; i++) {
                this._batchList.elements[i].setRenderbitFlag(this._RenderBitFlag, false);
            }
        }
    }

    /**
     * 根据lod的改变
     */
    protected _changeLOD(lod: number) {
        if (this._cacheLod == lod) {
            return;
        }

        if(this._cacheLod == this.lodCullRateArray.length - 1)
        {
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
            let rateYDistance = length * Math.abs(Vector3.dot(tempVec, tempVec1)) / checkCamera.farPlane * maxYDistance;
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
     * @param render 
     */
    _batchOneRender(render: BaseRender): boolean {
        //TODO
        return false
    }

    /**
     * @param render 
     */
    _removeOneRender(render: BaseRender) {
        //TODO
    }

    /**
     * @param render 
     */
    _updateOneRender(render: BaseRender) {
        //TODO
    }

    /**
     * 合批队列传入
     * @param renderNodes 
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
     * Restoring the Batch Render State
     */
    _restorRenderNode() {
        for (let i = 0, n = this._batchList.length; i < n; i++) {
            this._removeOneRender(this._batchList.elements[i]);
        }
    }

    _clear() {
        this._restorRenderNode();
        this._renderElements = [];
        this._batchList.destroy();
        this._batchList = new SingletonList<BaseRender>();
        this._lodInstanceRenderElement = {};
        this._lodInstanceRenderElement[-1] = [];

    }
}