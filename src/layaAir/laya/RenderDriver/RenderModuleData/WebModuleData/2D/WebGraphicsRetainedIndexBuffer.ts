import { LayaGL } from "../../../../layagl/LayaGL";
import { BufferUsage } from "../../../../RenderEngine/RenderEnum/BufferTargetType";
import { GraphicsDefines } from "../../../../webgl/shader/d2/GraphicsDefines";
import { IBufferState } from "../../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";

const INITIAL_CAPACITY = 1024;

type IndexData = Uint16Array | Uint32Array;

interface FreeIndexRange {
    start: number;
    end: number;
}

/**
 * Owns the index ranges of retained Graphics batches in a pass.
 * Ranges use index elements and keep their offsets when the backing buffer changes.
 * @internal
 */
export class WebGraphicsRetainedIndexBuffer {
    private readonly _indexBuffer: IIndexBuffer;
    private readonly _bufferStates = new Map<IVertexBuffer, IBufferState>();
    private readonly _freeRanges: FreeIndexRange[] = [];
    private readonly _arrayType = GraphicsDefines.GRAPHICS_INDEX_ARRAY_TYPE;
    private readonly _indexByteSize = GraphicsDefines.GRAPHICS_INDEX_BYTE_SIZE;
    private _data: IndexData;
    private _gpuCapacity = 0;
    private _end = 0;
    private _dirtyStart = Infinity;
    private _dirtyEnd = 0;

    constructor() {
        this._indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        this._indexBuffer.indexType = GraphicsDefines.GRAPHICS_INDEX_FORMAT;
    }

    allocate(indexCount: number): number {
        // Take a hole before extending the occupied span.
        for (let i = 0; indexCount > 0 && i < this._freeRanges.length; i++) {
            const range = this._freeRanges[i];
            const start = range.start;
            if (range.end - start < indexCount)
                continue;

            range.start += indexCount;
            if (range.start === range.end)
                this._freeRanges.splice(i, 1);
            return start;
        }

        const start = this._end;
        if (indexCount > 0) {
            const end = start + indexCount;
            if (!this._data || end > this._data.length)
                this._resizeData(Math.max(INITIAL_CAPACITY, end, (this._data?.length ?? 0) * 2));
            this._end = end;
        }
        return start;
    }

    release(start: number, indexCount: number): void {
        if (indexCount === 0)
            return;

        const end = start + indexCount;
        const ranges = this._freeRanges;
        let index = 0;
        while (index < ranges.length && ranges[index].start < start)
            index++;

        const previous = ranges[index - 1];
        const next = ranges[index];
        if (indexCount < 0 || start < 0 || end > this._end
            || (previous && previous.end > start) || (next && next.start < end))
            throw new Error("Invalid retained Graphics index range");

        if (end === this._end) {
            this._end = start;
            if (previous?.end === start) {
                this._end = previous.start;
                ranges.pop();
            }
            return;
        }

        if (previous?.end === start) {
            previous.end = end;
            if (next?.start === end) {
                previous.end = next.end;
                ranges.splice(index, 1);
            }
        } else if (next?.start === end) {
            next.start = start;
        } else {
            ranges.splice(index, 0, { start, end });
        }
    }

    write(start: number, data: IndexData): void {
        if (!data.length)
            return;

        this._data.set(data, start);
        this._dirtyStart = Math.min(this._dirtyStart, start);
        this._dirtyEnd = Math.max(this._dirtyEnd, start + data.length);
    }

    bindBuffer(vertexBuffer: IVertexBuffer): IBufferState {
        let state = this._bufferStates.get(vertexBuffer);
        if (!state) {
            state = LayaGL.renderDeviceFactory.createBufferState();
            state.applyState([vertexBuffer], this._indexBuffer);
            this._bufferStates.set(vertexBuffer, state);
        }
        return state;
    }

    flush(): void {
        if (!this._data)
            return;

        // Keep headroom when trimming a substantially smaller occupied span.
        if (this._data.length > INITIAL_CAPACITY && this._end * 4 <= this._data.length)
            this._resizeData(Math.max(INITIAL_CAPACITY, this._end * 2));

        let start = this._dirtyStart;
        let end = Math.min(this._dirtyEnd, this._end);
        if (this._gpuCapacity !== this._data.length) {
            this._indexBuffer._setIndexDataLength(this._data.byteLength);
            this._gpuCapacity = this._data.length;
            start = 0;
            end = this._end;
        }

        if (start < end) {
            const byteStart = Math.floor(start * this._indexByteSize / 4) * 4;
            const byteEnd = Math.ceil(end * this._indexByteSize / 4) * 4;
            this._data.fill(0, this._end, byteEnd / this._indexByteSize);
            this._indexBuffer.setData(this._data.buffer as ArrayBuffer, byteStart, byteStart, byteEnd - byteStart);
        }
        this._dirtyStart = Infinity;
        this._dirtyEnd = 0;
    }

    private _resizeData(capacity: number): void {
        const alignment = 4 / this._indexByteSize;
        const data = new this._arrayType(Math.ceil(capacity / alignment) * alignment);
        if (this._data)
            data.set(this._data.subarray(0, this._end));
        this._data = data;
    }

    destroy(): void {
        this._bufferStates.forEach(state => state.destroy());
        this._bufferStates.clear();
        this._indexBuffer.destroy();
        this._data = null;
        this._freeRanges.length = 0;
    }
}
