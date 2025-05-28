
import { Vector2 } from "../../../../maths/Vector2";
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { I2DGraphicBufferDataView, BufferModifyType, I2DGraphicWholeBuffer } from "../../Design/2D/IRender2DDataHandle";
import { WebRender2DPass } from "./WebRender2DPass";


export class Web2DGraphicWholeBuffer implements I2DGraphicWholeBuffer {
    buffer: IIndexBuffer | IVertexBuffer;
    bufferData: Float32Array | Uint16Array;
    modifyType: BufferModifyType;
    _needResetData: boolean;
    _inPass: boolean;
    private _num: number = 0;

    _first: Web2DGraphic2DBufferDataView;
    _last: Web2DGraphic2DBufferDataView;
    // private _views: Web2DGraphic2DBufferDataView[] = [];
    private _updateRange: Vector2 = new Vector2(100000000, -100000000);
    //所有的DataView
    resetData(byteLength: number) {
        //copy Buffer
        if (BufferModifyType.Index == this.modifyType) {
            let newData = new Uint16Array(byteLength / 2);
            if (this.bufferData) {
                newData.set(this.bufferData);
            }
            this.bufferData = newData;
        } else {
            let newData = new Float32Array(byteLength / 4);
            if (this.bufferData) {
                newData.set(this.bufferData);
            }
            this.bufferData = newData;
        }
        this._needResetData = true;
    }

    upload() {
        if (BufferModifyType.Index === this.modifyType) {
            let start = 0;
            let length = 0;
            let geometry: IRenderGeometryElement;
            //geometry 相同一定是紧凑的
            let view = this._first;
            while (view) {
                if (!view.geometry) {
                    start = view.length;
                    length = view.length;
                    view.updateView(this.bufferData);//先更新偏移再提交
                    view = view._next;
                    continue;
                }

                if (geometry != view.geometry) {
                    if (length && geometry) {
                        geometry.clearRenderParams();
                        geometry.setDrawElemenParams(length, start * 2);
                    }
                    geometry = view.geometry;
                    start = start + length;
                    length = 0;
                }

                view.start = start + length;
                length += view.length;

                view.updateView(this.bufferData);
                view = view._next;
            }

            if (length && geometry) {
                geometry.clearRenderParams();
                geometry.setDrawElemenParams(length, start * 2);
            }

            let tempLength = this._last.start + this._last.length;
            let tempUint16Array = new Uint16Array(this.bufferData.buffer , 0 , tempLength );
            (this.buffer as IIndexBuffer)._setIndexData(tempUint16Array, 0);
            
            this._first = null;
            this._last = null;
            this._num = 0;
        } else {
            if (this._needResetData) {
                let view = this._first;
                while (view) {
                    view.updateView(this.bufferData);//先更新偏移再提交
                    view = view._next;
                }

                (this.buffer as IVertexBuffer).setData((this.bufferData as Float32Array).buffer, 0, 0, (this.bufferData as Float32Array).byteLength);
                this._needResetData = false;
            } else {
                if (this._updateRange.y <= this._updateRange.x) return;
                (this.buffer as IVertexBuffer).setData((this.bufferData as Float32Array).buffer, this._updateRange.x * 4, this._updateRange.x * 4, (this._updateRange.y - this._updateRange.x) * 4);
            }
            this._updateRange.setValue(100000000, -100000000);
        }
    }

    modifyOneView(view: Web2DGraphic2DBufferDataView) {
        if (this.modifyType == BufferModifyType.Index) {
            this.addDataView(view);
        }
        else {
            this._updateRange.y = Math.max(view.start + view.length, this._updateRange.y);
            this._updateRange.x = Math.min(view.start, this._updateRange.x);
        }
    }

    addDataView(view: Web2DGraphic2DBufferDataView) {
        // this._views.push(view);
        if (!this._first) {
            this._first = view;
        }
        if (this._last) {
            this._last._next = view;
            view._prev = this._last;
            // view.start = this._last.start + this._last.length;
        }
        this._last = view;
        this._num++;
    }

    //收益存疑
    // removeDataView(view: Web2DGraphic2DBufferDataView): void {
    //     //ib 调用
    //     // let index = this._views.indexOf(view);
    //     // this._views.splice(index, 1);
    //     // this._needResetData = true;
    //     if (view._prev) {
    //         view._prev._next = view._next;
    //     }
    //     if (view._next) {
    //         view._next._prev = view._prev;
    //     }
    //     if (view == this._first) {
    //         this._first = view._next;
    //     }
    //     if (view == this._last) {
    //         this._last = view._prev;
    //     }
    //     view._next = null;
    //     view._prev = null;
        
    //     // this._updateRange.x = Math.min(view.start, this._updateRange.x);
    //     // this._updateRange.y = this.bufferData.length;
    //     this._num--;
    // }

    destroy() {
        this._first = null;
        this._last = null;
        this.bufferData = null;
    }

}

export class Web2DGraphic2DBufferDataView implements I2DGraphicBufferDataView {
    private _data: Float32Array | Uint16Array;
    start: number;//element start
    length: number;//element length
    stride: number = 1;//element length
    owner: Web2DGraphicWholeBuffer;
    modifyType: BufferModifyType;
    isModified: boolean = false; // 标记数据是否被修改
    geometry: IRenderGeometryElement;

    _next: Web2DGraphic2DBufferDataView;
    _prev: Web2DGraphic2DBufferDataView;

    getData(): Float32Array | Uint16Array {
        //owner isReset  this._data;
        if (this.modifyType == BufferModifyType.Vertex
            && this.owner._needResetData
        ) {
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

        if (this.modifyType == BufferModifyType.Index) {
            this._data = new Uint16Array(length);
        } else {
            this.updateView(owner.bufferData);
            owner.addDataView(this);
        }
    }

    // 更新数据视图
    updateView(wholeData: Float32Array | Uint16Array) {
        if (this.modifyType == BufferModifyType.Index) {
            wholeData.set(this._data, this.start);
        } else {
            this._data = new (wholeData.constructor as any)(wholeData.buffer, this.start * wholeData.BYTES_PER_ELEMENT, this.length);
        }
    }

    getDataRange(): { start: number, length: number } {
        return {
            start: this.start,
            length: this.length
        };
    }
}
