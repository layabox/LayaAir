import { Vector2 } from "../../../../maths/Vector2";
import { GraphicsDefines } from "../../../../webgl/shader/d2/GraphicsDefines";
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { Web2DGraphicsBufferDataView, Web2DGraphic2DVertexDataView, Web2DGraphic2DIndexDataView } from "./Web2DGraphic2DBufferDataView";

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
            let capacity = scratch && (scratch as any).constructor === arrayType ? Math.max(length, scratch.length * 2) : length;
            Web2DGraphicsIndexBuffer._uploadScratch = scratch = new arrayType(capacity);
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
        while (view && view.start + view.length <= rangeStart)
            view = view._next;

        // Keep scratch in whole-buffer coordinates so each owned view can be copied directly.
        while (view && view.start < rangeEnd) {
            scratch.set(view._getData(), view.start);
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
        let scratch = Web2DGraphicsIndexBuffer._getUploadScratch(uploadEnd);

        this._copyViewsToScratch(alignedStart, uploadEnd, scratch);
        this.buffer.setData(scratch.buffer as ArrayBuffer, alignedByteStart, alignedByteStart, dataLength);
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

    private _batchData: Uint16Array | Uint32Array;
    private _uploadData: Uint16Array | Uint32Array;
    private _writeLength: number = 0;
    /** @internal */
    // _uploadMask: Record<number, number> = {};

    /** @internal */
    appendIndexData(data: Uint16Array | Uint32Array, geometry: IRenderGeometryElement): number {
        let start = this._writeLength;
        let end = start + data.length;
        this._ensureBatchData(end);
        this._batchData.set(data, start);
        this._writeLength = end;
        this._updateRange.x = Math.min(start, this._updateRange.x);
        this._updateRange.y = Math.max(end, this._updateRange.y);

        if (geometry) {
            geometry.clearRenderParams();
            geometry.setDrawElemenParams(data.length, start * GraphicsDefines.GRAPHICS_INDEX_BYTE_SIZE);
        }
        return start;
    }

    private _ensureBatchData(requiredLength: number): void {
        let arrayType = GraphicsDefines.GRAPHICS_INDEX_ARRAY_TYPE;
        let batchData = this._batchData;
        if (batchData && batchData.length >= requiredLength && (batchData as any).constructor === arrayType)
            return;

        let capacity = batchData && (batchData as any).constructor === arrayType
            ? Math.max(requiredLength, batchData.length * 2)
            : requiredLength;
        let newData = new arrayType(capacity);
        if (batchData && (batchData as any).constructor === arrayType)
            newData.set(batchData);
        this._batchData = newData;
        this._uploadData = null;
    }

    private _getUploadData(length: number): Uint16Array | Uint32Array {
        let uploadData = this._uploadData;
        if (!uploadData || uploadData.buffer !== this._batchData.buffer || uploadData.length !== length) {
            let arrayType = GraphicsDefines.GRAPHICS_INDEX_ARRAY_TYPE;
            this._uploadData = uploadData = new arrayType(this._batchData.buffer, 0, length);
        }
        return uploadData;
    }

    _upload() {
        if (!this._writeLength) {
            this._needResetData = false;
            this._updateRange.setValue(100000000, -100000000);
            return;
        }

        if (!this._needResetData && this._updateRange.y <= this._updateRange.x)
            return;

        let indexByteSize = GraphicsDefines.GRAPHICS_INDEX_BYTE_SIZE;
        let uploadStart = this._needResetData ? 0 : this._updateRange.x;
        let uploadEnd = Math.min(this._writeLength, this._updateRange.y);

        uploadStart = Math.max(0, Math.min(uploadStart, uploadEnd));

        if (uploadEnd > uploadStart) {
            if (uploadStart === 0) {
                this.buffer._setIndexData(this._getUploadData(uploadEnd), 0);
            } else {
                let uploadByteStart = uploadStart * indexByteSize;
                let alignedByteStart = Math.floor(uploadByteStart / 4) * 4;
                let dataLength = uploadEnd * indexByteSize - alignedByteStart;
                this.buffer.setData(this._batchData.buffer as ArrayBuffer, alignedByteStart, alignedByteStart, dataLength);
            }
        }
        this._needResetData = false;
        this._updateRange.setValue(100000000, -100000000);

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
        this._writeLength = 0;
        this._updateRange.setValue(100000000, -100000000);
    }

    _resetData(byteLength: number) {
        super.resetData(byteLength);
    }

    destroy(): void {
        this._batchData = null;
        this._uploadData = null;
        this._writeLength = 0;
        super.destroy();
    }
}
