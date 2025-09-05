
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { I2DGraphicVertexDataView, I2DGraphicIndexDataView, I2DGraphicBufferDataView } from "../../Design/2D/IRender2DDataHandle";
import { Web2DGraphicsIndexBatchBuffer, Web2DGraphicsIndexBuffer, Web2DGraphicsVertexBuffer, Web2DGraphicWholeBuffer } from "./Web2DGraphic2DBuffer";
import { WebRender2DPass } from "./WebRender2DPass";

export abstract class Web2DGraphicsBufferDataView implements I2DGraphicBufferDataView {
    abstract setData(data: ArrayLike<number>): void;

    /** IB 的 start 不可信，只有在提交时百分百正确 */
    start: number;//element start
    length: number;//element length

    owner: Web2DGraphicWholeBuffer;

    /** @internal */
    _next: Web2DGraphicsBufferDataView;
    /** @internal */
    _prev: Web2DGraphicsBufferDataView;
}

export class Web2DGraphic2DVertexDataView extends Web2DGraphicsBufferDataView implements I2DGraphicVertexDataView {
    private _view: Float32Array

    stride: number = 1;//element length

    declare owner: Web2DGraphicsVertexBuffer;
    /** @internal */
    declare _next: Web2DGraphic2DVertexDataView;
    /** @internal */
    declare _prev: Web2DGraphic2DVertexDataView;

    /**
     * @internal
     * @returns 
     */
    _getData(): Float32Array {
        return this._view;
    }

    /** @private */
    _modify() {
        this.owner._modifyOneView(this);
        WebRender2DPass.setBuffer(this.owner);
    }

    // 更新数据视图
    _updateView(wholeData: Float32Array) {
        if (!this._view || this._view.buffer !== wholeData.buffer) {
            this._view = new Float32Array(wholeData.buffer, this.start * 4 /** Float32Array.BYTES_PER_ELEMENT */, this.length);
        }
    }

    setData(data: ArrayLike<number>): void {
        this._view.set(data);
        this._modify();
    }

    constructor(owner: Web2DGraphicsVertexBuffer, start: number, length: number, stride: number = 1) {
        super();
        this.owner = owner;
        this.start = start;
        this.length = length;
        this.stride = stride;
        this._updateView(owner._dataView);
        owner.addDataView(this);
    }


}

export class Web2DGraphic2DIndexDataView extends Web2DGraphicsBufferDataView implements I2DGraphicIndexDataView {

    protected _view: Uint16Array;

    declare owner: Web2DGraphicsIndexBuffer;

    _geometry: IRenderGeometryElement;

    setGeometry(value: IRenderGeometryElement): void {
        this._geometry = value;
    }

    /** @internal */
    declare _next: Web2DGraphic2DIndexDataView;
    /** @internal */
    declare _prev: Web2DGraphic2DIndexDataView;

    setData(data: Float32Array | Uint16Array) {
        this._view.set(data);
        this._modify();
    }

    constructor(owner: Web2DGraphicsIndexBuffer, length: number, create: boolean = true) {
        super();
        this.owner = owner;
        this.length = length;

        if (create) {
            this._view = new Uint16Array(length);
        }
    }

    // 更新数据视图
    _updateView(wholeData: Uint16Array) {
        wholeData.set(this._view, this.start);
    }


    /** @private */
    _modify() {
        this.owner._modifyOneView(this);
        WebRender2DPass.setBuffer(this.owner);
    }

    /**
     * 只有 IB 的能clone
     * @param cloneOwner 
     * @param create 
     * @returns 
     */
    _clone(cloneOwner = true, create = true) {
        let owner = cloneOwner ? this.owner : null
        // start 不确定， length 是固定的
        let nview = new Web2DGraphic2DIndexCloneDataView(owner, this.length, create);
        if (!create) {
            this._cloneView(nview);
        }
        return nview;
    }

    /**
     * 克隆视图
     * @param view 
     */
    _cloneView(view: Web2DGraphic2DIndexDataView) {
        view._view = this._view;
        view.length = this.length;
    }

    destroy(): void {
        this._view = null;
        this._geometry = null;
        this.owner = null;
        this._next = null;
        this._prev = null;
    }
}

export class Web2DGraphic2DIndexCloneDataView extends Web2DGraphic2DIndexDataView {
    /** @internal */
    private static _idCounter = 0;
    declare owner: Web2DGraphicsIndexBatchBuffer;
    declare _next: Web2DGraphic2DIndexCloneDataView;
    declare _prev: Web2DGraphic2DIndexCloneDataView;

    /** @internal */
    _lastWholeData: Uint16Array;
    /** @internal */
    _lastStart: number = -1;
    /** @internal */
    _id = ++ Web2DGraphic2DIndexCloneDataView._idCounter;
    
    // 更新数据视图
    _updateCloneView(wholeData: Uint16Array , mask:Record<number , number>) {
        if (
            this._lastWholeData !== wholeData
            || this._lastStart !== this.start
            || this._id != mask[this.start]
        ) {
            wholeData.set(this._view, this.start);
            this._lastWholeData = wholeData;
            this._lastStart = this.start;
            mask[this.start] = this._id;
            return true;
        }

        return false;
    }

    destroy(): void {
        super.destroy();
        this._lastWholeData = null;
        this._lastStart = 0;
        this._next = null;
        this._prev = null;
    }

}
