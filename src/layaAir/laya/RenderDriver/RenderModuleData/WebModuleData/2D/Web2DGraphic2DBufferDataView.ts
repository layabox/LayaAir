
import { Vector2 } from "../../../../maths/Vector2";
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { I2DGraphicBufferDataView, BufferModifyType, I2DGraphicWholeBuffer } from "../../Design/2D/IRender2DDataHandle";
import { WebRender2DPass } from "./WebRender2DPass";


export class Web2DGraphicWholeBuffer implements I2DGraphicWholeBuffer {
    buffers: IIndexBuffer | IVertexBuffer[];
    bufferData: Float32Array[] | Uint16Array;
    modifyType: BufferModifyType;
    _needResetData: boolean;
    _inPass: boolean;

    private _views: Web2DGraphic2DBufferDataView[] = [];
    private _updateRange: Vector2 = new Vector2(100000000, -100000000);
    //所有的DataView
    resetData(byteLength: number) {
        //copy Buffer
        this._needResetData = true;
        this._updateRange.setValue(0, byteLength);
        if (BufferModifyType.Index == this.modifyType) {
            let newData = new Uint16Array(byteLength / 2);
            if (this.bufferData) {
                newData.set(this.bufferData as Uint16Array);
            }
            this.bufferData = newData;
        } else {
            let newData = new Float32Array(byteLength / 4);
            if (this.bufferData) {
                newData.set((this.bufferData as Float32Array[])[0]);
            }
            this.bufferData = [newData];
        }
    }

    upload() {
        if (this._needResetData) {
            if (BufferModifyType.Index == this.modifyType) {
                (this.buffers as IIndexBuffer)._setIndexData((this.bufferData as Uint16Array), 0);
            } else {
                (this.buffers as IVertexBuffer[])[0].setData((this.bufferData as Float32Array[])[0].buffer, 0, 0, (this.bufferData as Float32Array[])[0].byteLength);
            }
            for (var i = 0; i < this._views.length; i++) {
                this._views[i].updateView(this.bufferData);
            }
            this._needResetData = false;
        } else {
            if (this._updateRange.y <= this._updateRange.x) return;
            if (BufferModifyType.Index != this.modifyType) {
                (this.buffers as IVertexBuffer[])[0].setData((this.bufferData as Float32Array[])[0].buffer, this._updateRange.x * 4, this._updateRange.x * 4, (this._updateRange.y - this._updateRange.x) * 4);
            } else {
                let tempView = new Uint16Array((this.bufferData as Uint16Array).buffer, this._updateRange.x * 2, this._updateRange.y - this._updateRange.x);
                (this.buffers as IIndexBuffer)._setIndexData(tempView, this._updateRange.x * 2);

            }
        }
        this._updateRange.setValue(100000000, -100000000);
    }

    modifyOneView(view: Web2DGraphic2DBufferDataView) {
        this._updateRange.y = Math.max(view.start + view.length, this._updateRange.y);
        this._updateRange.x = Math.min(view.start, this._updateRange.x);
    }

    addDataView(view: Web2DGraphic2DBufferDataView) {
        this._views.push(view);
    }

    destroy() {
        delete this._views;
        this.bufferData = null;
    }

}

export class Web2DGraphic2DBufferDataView implements I2DGraphicBufferDataView {
    private _data: Float32Array[] | Uint16Array;
    start: number;//element start
    length: number;//element length
    stride: number = 1;//element length
    owner: Web2DGraphicWholeBuffer;
    modifyType: BufferModifyType;
    isModified: boolean = false; // 标记数据是否被修改

    getData(): Float32Array[] | Uint16Array {
        //owner isReset  this._data;
        if (this.owner._needResetData) {
            this.updateView(this.owner.bufferData);
        }
        return this._data;
    }

    modify() {
        this.owner.modifyOneView(this);
        WebRender2DPass.setBuffer(this.owner);
    }

    constructor(owner: Web2DGraphicWholeBuffer, type: BufferModifyType, start: number, length: number, stride: number = 1) {
        this.owner = owner;
        this.start = start;
        this.length = length;
        this.stride = stride;
        this.modifyType = type;
        this.updateView(owner.bufferData);
        owner.addDataView(this);
    }

    // 更新数据视图
    updateView(wholeData: Float32Array[] | Uint16Array) {
        if (this.modifyType == BufferModifyType.Index) {
            let newData = wholeData as Uint16Array;
            this._data = new (newData.constructor as any)(newData.buffer, this.start * newData.BYTES_PER_ELEMENT, this.length);
        } else {
            this._data = [];
            let newData = (wholeData as Float32Array[])[0];
            this._data[0] = new (newData.constructor as any)(newData.buffer, this.start * newData.BYTES_PER_ELEMENT, this.length);
        }
    }

    getDataRange(): { start: number, length: number } {
        return {
            start: this.start,
            length: this.length
        };
    }
}
