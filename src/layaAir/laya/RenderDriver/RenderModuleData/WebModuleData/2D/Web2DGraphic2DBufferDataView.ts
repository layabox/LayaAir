
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

    // 更新标记计数
    // _mark: number = -1;

    private _num: number = 0;
    /** @internal */
    _first: Web2DGraphic2DBufferDataView;
    /** @internal */
    _last: Web2DGraphic2DBufferDataView;

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
            let view = this._first;
            let start = 0;
            let length = 0;
            let geometry = view.geometry;
            let needUpdate = false;
            let uploadStart = this._needResetData ? 0 : this._updateRange.x;

            // let mark = 0 ;
            while (view) {
                // mark++;
                if (geometry != view.geometry) {//切换geometry时，检查上一个是否需要提交
                    if (needUpdate) {// 设置上一个的绘制状态
                        geometry.clearRenderParams();
                        geometry.setDrawElemenParams(length, start * 2);
                    }
                    geometry = view.geometry;
                    start = start + length;
                    length = 0;
                }

                start = start + length;
                //在需要更新的段落内
                needUpdate = this._needResetData || start >= uploadStart;

                if (needUpdate) {
                    view.start = start;
                    view.updateView(this.bufferData);
                }

                length += view.length;
                view = view._next;
            }

            if (needUpdate) {
                geometry.clearRenderParams();
                geometry.setDrawElemenParams(length, start * 2);
            }

            let len = this._last.start + this._last.length - uploadStart;
            let tempUint16Array = new Uint16Array(this.bufferData.buffer, uploadStart * 2, len);
            (this.buffer as IIndexBuffer)._setIndexData(tempUint16Array, uploadStart * 2);
            this._needResetData = false;

            // this.clearBufferViews();
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
        }
        this._updateRange.setValue(100000000, -100000000);
    }

    modifyOneView(view: Web2DGraphic2DBufferDataView) {
        if (this.modifyType == BufferModifyType.Index) {
            this.addDataView(view);
        }
        this._updateRange.y = Math.max(view.start + view.length, this._updateRange.y);
        this._updateRange.x = Math.min(view.start, this._updateRange.x);
    }

    addDataView(view: Web2DGraphic2DBufferDataView) {
        view._next = null;
        view._prev = null;

        if (!this._first) {
            this._first = view;
            this._first.start = 0;
        }

        if (this._last) {
            this._last._next = view;
            view._prev = this._last;
        }

        view.owner = this;
        this._last = view;
        this._num++;
    }

    clearBufferViews() {//不清理,添加时处理
        this._first = null;
        this._last = null;
        this._num = 0;
        this._updateRange.setValue(100000000, -100000000);
    }

    //收益存疑
    removeDataView(view: Web2DGraphic2DBufferDataView): void {
        view.owner = null;
        //ib 调用
        // let index = this._views.indexOf(view);
        // this._views.splice(index, 1);
        // this._needResetData = true;
        if (view._prev) {
            view._prev._next = view._next;
        }
        if (view._next) {
            view._next._prev = view._prev;
        }
        if (view == this._first) {
            this._first = view._next;
        }
        if (view == this._last) {
            this._last = view._prev;
        }

        view._next = null;
        view._prev = null;

        this._updateRange.x = Math.min(view.start, this._updateRange.x);
        this._updateRange.y = Math.max(view.start + view.length, this._updateRange.y);
        this._num--;
    }

    destroy() {
        this._first = null;
        this._last = null;
        this.bufferData = null;
    }

}

export class Web2DGraphic2DBufferDataView implements I2DGraphicBufferDataView {
    private _data: Float32Array | Uint16Array;
    /** IB 的 start 不可信，只有在提交时百分百正确 */
    start: number;//element start
    length: number;//element length
    stride: number = 1;//element length
    owner: Web2DGraphicWholeBuffer;
    modifyType: BufferModifyType;
    isModified: boolean = false; // 标记数据是否被修改
    geometry: IRenderGeometryElement;

    /** @internal */
    _next: Web2DGraphic2DBufferDataView;
    /** @internal */
    _prev: Web2DGraphic2DBufferDataView;
    /** @internal */
    // private _mark: number = 0;

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
        if (this.modifyType == BufferModifyType.Index) {
            this.owner.modifyOneView(this);
            WebRender2DPass.setBuffer(this.owner);
        } else {
            this.owner.modifyOneView(this);
            WebRender2DPass.setBuffer(this.owner);
        }
    }

    constructor(owner: Web2DGraphicWholeBuffer, type: BufferModifyType, start: number, length: number, stride: number = 1, create = true) {
        this.owner = owner;
        this.start = start;
        this.length = length;
        this.stride = stride;
        this.modifyType = type;

        if (create) {
            if (this.modifyType == BufferModifyType.Index) {
                this._data = new Uint16Array(length);
            } else {
                this.updateView(owner.bufferData);
                owner.addDataView(this);
            }
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

    /**
     * 只有 IB 的能clone
     * @param cloneOwner 
     * @param create 
     * @returns 
     */
    clone(cloneOwner = true, create = true) {
        if (this.modifyType !== BufferModifyType.Index) {
            // console.log();
            return null;
        }
        let owner = cloneOwner ? this.owner : null
        // start 不确定， length 是固定的
        let nview = new Web2DGraphic2DBufferDataView(owner, this.modifyType, this.start, this.length, this.stride, create);
        if (!create) {
            nview._data = this._data;
        }
        return nview;
    }
}
