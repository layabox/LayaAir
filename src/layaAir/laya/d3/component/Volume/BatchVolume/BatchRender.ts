import { SingletonList } from "../../../../utils/SingletonList";
import { BaseRender, RenderBitFlag } from "../../../core/render/BaseRender";
/**
 * 类用来描述合批的渲染节点
 */
export class BatchRender extends BaseRender {
    /**@internal */
    protected _checkLOD: boolean;

    protected _lodCount: number;

    protected _lodRateArray: Float32Array;


    protected _batchList: SingletonList<BaseRender>;
    protected _batchbit: RenderBitFlag;
    protected _RenderBitFlag: RenderBitFlag;

    constructor() {
        super();
        this._RenderBitFlag = RenderBitFlag.RenderBitFlag_Batch;
    }
    /**
     * 是否根据lod来合批
     */
    get chekckLOD() {
        return this._checkLOD;
    }

    set checkLOD(value: boolean) {
        this._checkLOD = value;
    }

    /**
     * 
     */
    set lodRateArray(value: Float32Array) {
        this._lodRateArray = new Float32Array(value);
        this._lodRateArray.sort();
    }

    get lodRateArray() {
        return this._lodRateArray;
    }


    /**
     *  是否满足batch条件
     */
    protected _canBatch(render: BaseRender): boolean {
        return false;
    }

    protected _onEnable(): void {
        super._onEnable();
        for (let i = 0, n = this._batchList.length; i < n; i++) {
            this._batchList.elements[i].setRenderbitFlag(this._RenderBitFlag, true);
        }
    }

    protected _onDisable(): void {
        super._onDisable();
        for (let i = 0, n = this._batchList.length; i < n; i++) {
            this._batchList.elements[i].setRenderbitFlag(this._RenderBitFlag, false);
        }
    }

    /**
     * 根据lod的改变
     */
    protected _changeLOD() {
        //TODO
    }

    /**
     * @param render 
     */
    _batchOneRender(render: BaseRender) {

    }

    /**
     * @param render 
     */
    _removeOneRender(render: BaseRender) {

    }

    /**
     * @param render 
     */
    _updateOneRender(render: BaseRender) {

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

    }

    _clear() {

    }
}