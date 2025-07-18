
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { I2DGraphicVertexDataView, I2DGraphicIndexDataView } from "../../Design/2D/IRender2DDataHandle";
import { Web2DGraphicsIndexBuffer, Web2DGraphicsVertexBuffer, Web2DGraphicWholeBuffer } from "./Web2DGraphic2DBuffer";
import { WebRender2DPass } from "./WebRender2DPass";

export abstract class Web2DGraphicsBufferDataView {
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

    getData(): Float32Array {
        // if (this.owner._needResetData) {
        //     this.updateView(this.owner._dataView);
        // }
        return this._view;
    }

    /** @private */
    _modify() {
        this.owner.modifyOneView(this);
        WebRender2DPass.setBuffer(this.owner);
    }

    constructor(owner: Web2DGraphicsVertexBuffer, start: number, length: number, stride: number = 1) {
        super();
        this.owner = owner;
        this.start = start;
        this.length = length;
        this.stride = stride;
        this.updateView(owner._dataView);
        owner.addDataView(this);
    }

    // 更新数据视图
    updateView(wholeData: Float32Array) {
        if (!this._view || this._view.buffer !== wholeData.buffer) {
            this._view = new Float32Array(wholeData.buffer, this.start * 4 /** Float32Array.BYTES_PER_ELEMENT */, this.length);
        }
    }
}

export class Web2DGraphic2DIndexDataView extends Web2DGraphicsBufferDataView implements I2DGraphicIndexDataView {
    private _view: Uint16Array;

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

    /** @private */
    _modify() {
        this.owner.modifyOneView(this);
        WebRender2DPass.setBuffer(this.owner);
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
    updateView(wholeData: Uint16Array) {
        wholeData.set(this._view, this.start);
    }

    /**
     * 只有 IB 的能clone
     * @param cloneOwner 
     * @param create 
     * @returns 
     */
    clone(cloneOwner = true, create = true) {
        let owner = cloneOwner ? this.owner : null
        // start 不确定， length 是固定的
        let nview = new Web2DGraphic2DIndexDataView(owner, this.length, create);
        if (!create) {
            this.cloneView(nview);
        }
        return nview;
    }

    /**
     * 克隆视图
     * @param view 
     */
    cloneView(view: Web2DGraphic2DIndexDataView) {
        view._view = this._view;
        view.length = this.length;
    }
}