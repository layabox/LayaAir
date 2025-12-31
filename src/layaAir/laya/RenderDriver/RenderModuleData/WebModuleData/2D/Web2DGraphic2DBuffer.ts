import { Vector2 } from "../../../../maths/Vector2";
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { I2DGraphicWholeBuffer } from "../../Design/2D/IRender2DDataHandle";
import { Web2DGraphicsBufferDataView, Web2DGraphic2DVertexDataView, Web2DGraphic2DIndexDataView, Web2DGraphic2DIndexCloneDataView } from "./Web2DGraphic2DBufferDataView";

export abstract class Web2DGraphicWholeBuffer implements I2DGraphicWholeBuffer {
    buffer: IIndexBuffer | IVertexBuffer;
    _dataView: Float32Array | Uint16Array;
    arrayBuffer: ArrayBuffer;
    _needResetData: boolean;
    _inPass: boolean;

    protected _num: number = 0;
    /** @internal */
    _first: Web2DGraphicsBufferDataView;
    /** @internal */
    _last: Web2DGraphicsBufferDataView;

    /** @internal */
    _updateRange: Vector2 = new Vector2(100000000, -100000000);

    //所有的DataView
    abstract resetData(byteLength: number): void;

    abstract _upload(): void;

    _modifyOneView(view: Web2DGraphicsBufferDataView) {
        this._updateRange.y = Math.max(view.start + view.length, this._updateRange.y);
        this._updateRange.x = Math.min(view.start, this._updateRange.x);
    }

    addDataView(view: Web2DGraphicsBufferDataView) {
        view._next = null;
        view._prev = null;

        if (!this._first) {
            this._first = view;
        }

        if (this._last) {
            this._last._next = view;
            view._prev = this._last;
        }

        view.owner = this;
        this._last = view;
        this._num++;
    }



    //收益存疑
    removeDataView(view: Web2DGraphicsBufferDataView): void {
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
        this._dataView = null;
        this.arrayBuffer = null;
    }
}

export class Web2DGraphicsVertexBuffer extends Web2DGraphicWholeBuffer {

    declare buffer: IVertexBuffer;

    declare _dataView: Float32Array;
    /** @internal */
    declare _first: Web2DGraphic2DVertexDataView;
    /** @internal */
    declare _last: Web2DGraphic2DVertexDataView;

    //所有的DataView
    resetData(byteLength: number) {
        this.arrayBuffer = new ArrayBuffer(byteLength);
        //copy Buffer
        let newData = new Float32Array(this.arrayBuffer);
        if (this._dataView) {
            newData.set(this._dataView);
        }
        this._dataView = newData;
        this._needResetData = true;
    }

    _upload() {
        if (this._needResetData) {
            let view = this._first;
            while (view) {
                view._updateView(this._dataView);//先更新偏移再提交
                view = view._next;
            }

            this.buffer.setData(this.arrayBuffer, 0, 0, this.arrayBuffer.byteLength);
            this._needResetData = false;
        } else {
            if (this._updateRange.y <= this._updateRange.x) return;
            this.buffer.setData(this.arrayBuffer, this._updateRange.x * 4, this._updateRange.x * 4, (this._updateRange.y - this._updateRange.x) * 4);
        }
        this._updateRange.setValue(100000000, -100000000);
    }
}

export class Web2DGraphicsIndexBuffer extends Web2DGraphicWholeBuffer {
    declare buffer: IIndexBuffer;

    declare _dataView: Uint16Array;
    
    /** @internal */
    declare _first: Web2DGraphic2DIndexDataView;
    /** @internal */
    declare _last: Web2DGraphic2DIndexDataView;

    resetData(byteLength: number) {
        this.arrayBuffer = new ArrayBuffer(byteLength);

        let newData = new Uint16Array(this.arrayBuffer);
        if (this._dataView) {
            newData.set(this._dataView);
        }
        this._dataView = newData;
        this._needResetData = true;

    }

    _upload() {
        if (!this._num) return;
        let view = this._first;
        let start = 0;
        let length = 0;
        let geometry = view._geometry;
        let needUpdate = false;
        let uploadStart = this._needResetData ? 0 : this._updateRange.x;

        // let mark = 0 ;
        while (view) {
            // mark++;
            if (geometry != view._geometry) {//切换geometry时，检查上一个是否需要提交
                if (needUpdate) {// 设置上一个的绘制状态
                    geometry.clearRenderParams();
                    geometry.setDrawElemenParams(length, start * 2);
                }

                geometry = view._geometry;
                start = start + length;
                length = 0;
            }

            start = start + length;
            //在需要更新的段落内
            needUpdate = this._needResetData || start >= uploadStart;

            if (needUpdate) {
                view.start = start;
                view._updateView(this._dataView);
            }

            length += view.length;
            view = view._next;
        }

        if (needUpdate) {
            geometry.clearRenderParams();
            geometry.setDrawElemenParams(length, start * 2);
        }

        let len = this._last.start + this._last.length - uploadStart;

        let offset = uploadStart * 2;

        offset = Math.floor(offset / 4) * 4;

        this.buffer.setData(this.arrayBuffer, offset, offset, len * 2 + (uploadStart * 2 - offset));
        this._needResetData = false;
    }

    _modifyOneView(view: Web2DGraphic2DIndexDataView): void {

        if (view._prev) {
            view.start = view._prev.start + view._prev.length;
        } else {
            view.start = 0;
        }

        super._modifyOneView(view);
    }
}


export class Web2DGraphicsIndexBatchBuffer extends Web2DGraphicsIndexBuffer {

    declare _first: Web2DGraphic2DIndexCloneDataView;
    declare _last: Web2DGraphic2DIndexCloneDataView;
    /** @internal */
    // _uploadMask: Record<number, number> = {};

    _upload() {
        let view = this._first;
        let uploadStart = this._needResetData ? 0 : this._updateRange.x;

        // let mark = 0 ;
        while (view) {
            
            if (this._needResetData || view.start >= uploadStart) {
                view._updateView(this._dataView );
                // let result = view._updateCloneView(this._dataView , this._uploadMask );
                // if (!result && view.start == uploadStart) {
                //    uploadStart = view.start + view.length;
                // }
            }

            view = view._next;
        }

        let len = this._last.start + this._last.length - uploadStart;
        if (len == 0) return;

        let offset = uploadStart * 2;

        offset = Math.floor(offset / 4) * 4;

        let dataLength = len * 2 + (uploadStart * 2 - offset);

        if (dataLength + offset > this.arrayBuffer.byteLength) { 
            offset -= (dataLength + offset - this.arrayBuffer.byteLength);
        }

        this.buffer.setData(this.arrayBuffer, offset, offset, dataLength);

        this._needResetData = false;
    }

    _modifyOneView(view: Web2DGraphic2DIndexCloneDataView): void {

        this.addDataView(view);

        // let startTimer = Date.now();
        super._modifyOneView(view);
        // let modifyOneViewTime = Date.now();
        // TimeStatistics.instance.addToFrameTime("Web2DGraphic2DBuffer.super._modifyOneView", modifyOneViewTime - startTimer);
        if (view._geometry) {
            view._geometry.clearRenderParams();
            // let clearRenderParamsTime = Date.now();
            // TimeStatistics.instance.addToFrameTime("Web2DGraphic2DBuffer.clearRenderParams", clearRenderParamsTime - modifyOneViewTime);
            view._geometry.setDrawElemenParams(view.length, view.start * 2);
            // let setDrawElemenParamsTime = Date.now();
            // TimeStatistics.instance.addToFrameTime("Web2DGraphic2DBuffer.setDrawElemenParams", setDrawElemenParamsTime - clearRenderParamsTime);
            // TimeStatistics.instance.addToFrameTime("Web2DGraphic2DBuffer._modifyOneView", setDrawElemenParamsTime - startTimer);
        }
    }
    
    clearBufferViews() {//不清理,添加时处理
        this._first = null;
        this._last = null;
        this._num = 0;
        this._updateRange.setValue(100000000, -100000000);
    }

    _resetData(byteLength: number) {
        super.resetData(byteLength);
    }
}
