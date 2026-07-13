import { Vector2 } from "../../../../maths/Vector2";
import { GraphicsDefines } from "../../../../webgl/shader/d2/GraphicsDefines";
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { Web2DGraphicsBufferDataView, Web2DGraphic2DVertexDataView, Web2DGraphic2DIndexDataView, Web2DGraphic2DIndexCloneDataView } from "./Web2DGraphic2DBufferDataView";

export abstract class Web2DGraphicWholeBuffer {
    buffer: IIndexBuffer | IVertexBuffer;
    _dataView: Float32Array | Uint16Array | Uint32Array;
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
        let view = this._first;
        while (view) {
            let next = view._next;
            view.owner = null;
            view._prev = null;
            view._next = null;
            view = next;
        }
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
    private static _uploadScratch: Uint16Array | Uint32Array;

    declare buffer: IIndexBuffer;
    
    /** @internal */
    declare _first: Web2DGraphic2DIndexDataView;
    /** @internal */
    declare _last: Web2DGraphic2DIndexDataView;

    resetData(_byteLength: number) {
        this.arrayBuffer = null;
        this._dataView = null;
        this._needResetData = true;
    }

    protected static _getUploadScratch(length: number): Uint16Array | Uint32Array {
        let arrayType = GraphicsDefines.GRAPHICS_INDEX_ARRAY_TYPE;
        let scratch = Web2DGraphicsIndexBuffer._uploadScratch;
        if (!scratch || scratch.length < length || (scratch as any).constructor !== arrayType) {
            Web2DGraphicsIndexBuffer._uploadScratch = scratch = new arrayType(length);
        }
        return scratch;
    }

    protected _updateStartsAndDrawParams(indexByteSize: number): number {
        let view = this._first;
        let start = 0;

        let geometry = view ? view._geometry : null;
        let geometryStart = 0;
        let geometryLength = 0;

        while (view) {
            if (geometry != view._geometry) {
                if (geometry && geometryLength > 0) {
                    geometry.clearRenderParams();
                    geometry.setDrawElemenParams(geometryLength, geometryStart * indexByteSize);
                }
                geometry = view._geometry;
                geometryStart = start;
                geometryLength = 0;
            }

            view.start = start;
            geometryLength += view.length;
            start += view.length;
            view = view._next;
        }

        if (geometry && geometryLength > 0) {
            geometry.clearRenderParams();
            geometry.setDrawElemenParams(geometryLength, geometryStart * indexByteSize);
        }

        return start;
    }

    protected _copyViewsToScratch(rangeStart: number, rangeEnd: number, scratch: Uint16Array | Uint32Array): void {
        let view = this._first;
        while (view) {
            let viewStart = view.start;
            let viewEnd = viewStart + view.length;
            if (viewEnd > rangeStart && viewStart < rangeEnd) {
                let copyStart = Math.max(rangeStart, viewStart);
                let copyEnd = Math.min(rangeEnd, viewEnd);
                view._writeTo(scratch, copyStart - rangeStart, copyStart - viewStart, copyEnd - viewStart);
            }
            view = view._next;
        }
    }

    protected _uploadScratchRange(uploadStart: number, uploadEnd: number, indexByteSize: number): void {
        if (uploadEnd <= uploadStart)
            return;

        let uploadByteStart = uploadStart * indexByteSize;
        let alignedByteStart = Math.floor(uploadByteStart / 4) * 4;
        let alignedStart = alignedByteStart / indexByteSize;
        let dataLength = uploadEnd * indexByteSize - alignedByteStart;
        let scratch = Web2DGraphicsIndexBuffer._getUploadScratch(uploadEnd - alignedStart);

        this._copyViewsToScratch(alignedStart, uploadEnd, scratch);
        this.buffer.setData(scratch.buffer as ArrayBuffer, alignedByteStart, 0, dataLength);
    }

    _upload() {
        if (!this._num) {
            this._needResetData = false;
            this._updateRange.setValue(100000000, -100000000);
            return;
        }

        if (!this._needResetData && this._updateRange.y <= this._updateRange.x)
            return;

        let indexByteSize = GraphicsDefines.GRAPHICS_INDEX_BYTE_SIZE;
        let uploadStart = this._needResetData ? 0 : this._updateRange.x;
        let totalLength = this._updateStartsAndDrawParams(indexByteSize);

        uploadStart = Math.max(0, Math.min(uploadStart, totalLength));

        this._uploadScratchRange(uploadStart, totalLength, indexByteSize);
        this._needResetData = false;
        this._updateRange.setValue(100000000, -100000000);

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
        if (!this._num) {
            this._needResetData = false;
            this._updateRange.setValue(100000000, -100000000);
            return;
        }

        if (!this._needResetData && this._updateRange.y <= this._updateRange.x)
            return;

        let indexByteSize = GraphicsDefines.GRAPHICS_INDEX_BYTE_SIZE;
        let uploadStart = this._needResetData ? 0 : this._updateRange.x;
        let totalLength = this._last.start + this._last.length;

        uploadStart = Math.max(0, Math.min(uploadStart, totalLength));

        this._uploadScratchRange(uploadStart, totalLength, indexByteSize);
        this._needResetData = false;
        this._updateRange.setValue(100000000, -100000000);

    }

    _modifyOneView(view: Web2DGraphic2DIndexCloneDataView): void {

        if (view.owner === this && (view._prev || view._next || this._first === view || this._last === view))
            this.removeDataView(view);
        this.addDataView(view);

        // let startTimer = Date.now();
        super._modifyOneView(view);
        // let modifyOneViewTime = Date.now();
        // TimeStatistics.instance.addToFrameTime("Web2DGraphic2DBuffer.super._modifyOneView", modifyOneViewTime - startTimer);
        if (view._geometry) {
            view._geometry.clearRenderParams();
            // let clearRenderParamsTime = Date.now();
            // TimeStatistics.instance.addToFrameTime("Web2DGraphic2DBuffer.clearRenderParams", clearRenderParamsTime - modifyOneViewTime);
            view._geometry.setDrawElemenParams(view.length, view.start * GraphicsDefines.GRAPHICS_INDEX_BYTE_SIZE);
            // let setDrawElemenParamsTime = Date.now();
            // TimeStatistics.instance.addToFrameTime("Web2DGraphic2DBuffer.setDrawElemenParams", setDrawElemenParamsTime - clearRenderParamsTime);
            // TimeStatistics.instance.addToFrameTime("Web2DGraphic2DBuffer._modifyOneView", setDrawElemenParamsTime - startTimer);
        }
    }
    
    clearBufferViews() {//不清理,添加时处理
        let view = this._first;
        while (view) {
            let next = view._next;
            view.owner = null;
            view._prev = null;
            view._next = null;
            view = next;
        }
        this._first = null;
        this._last = null;
        this._num = 0;
        this._updateRange.setValue(100000000, -100000000);
    }

    _resetData(byteLength: number) {
        super.resetData(byteLength);
    }
}
