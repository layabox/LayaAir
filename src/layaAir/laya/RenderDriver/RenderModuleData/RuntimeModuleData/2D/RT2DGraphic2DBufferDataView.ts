
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { I2DGraphicBufferDataView, I2DGraphicIndexDataView, I2DGraphicVertexDataView, I2DGraphicWholeBuffer } from "../../Design/2D/IRender2DDataHandle";
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { NativeMemory } from "../NativeMemory";


export class RT2DGraphicVertexBuffer implements I2DGraphicWholeBuffer {
    private _buffer: IVertexBuffer;
    private _nativeMemory: NativeMemory;
    _nativeObj: any;


    get buffer(): IVertexBuffer {
        return this._buffer;
    }

    set buffer(value: IVertexBuffer) {
        this._buffer = value;
        this._nativeObj.setVertexBuffer(value ? (value as any)._nativeObj : null);
    }

    constructor() {
        this._nativeObj = new (window as any).conchRT2DGraphicVertexBuffer();
    }

    /**
     * @internal
     */
    _setData(data: ArrayLike<number>, view: RT2DGraphic2DVertexDataView) {
        this._nativeMemory.float32Array.set(data, view.start * 4);
    }

    removeDataView(dataView: I2DGraphicBufferDataView) {
        this._nativeObj.removeDataView(dataView ? (dataView as any)._nativeObj : null);
    }

    addDataView(dataView: I2DGraphicBufferDataView) {
        this._nativeObj.addDataView(dataView ? (dataView as any)._nativeObj : null);
    }

    destroy() {
        this._nativeObj.destroy();
        this._nativeMemory.destroy();
    }

    //
    resetData(byteLength: number) {
        if (this._nativeMemory._buffer.byteLength != byteLength) {//重创NativeMemory
            //换Buffer
            let oldMemory = this._nativeMemory;
            this._nativeMemory = new NativeMemory(byteLength, false);
            this._nativeObj.resetData(this._nativeMemory._buffer);
            oldMemory && oldMemory.destroy();
        }

    }
}

export class RT2DGraphicIndexBuffer implements I2DGraphicWholeBuffer {
    private _buffer: IIndexBuffer;
    _nativeObj: any;

    get buffer(): IIndexBuffer {
        return this._buffer;
    }

    set buffer(value: IIndexBuffer) {
        this._buffer = value;
        this._nativeObj.setIndexBuffer(value ? (value as any)._nativeObj : null);
    }

    constructor() {
        this._nativeObj = new (window as any).conchRT2DGraphicWholeBuffer();
    }

    resetData(byteLength: number) {
        this._nativeObj.resetData(byteLength);//重创indexBuf
    }

    addDataView(dataView: I2DGraphicBufferDataView) {
        this._nativeObj.addDataView(dataView ? (dataView as any)._nativeObj : null);
    }

    removeDataView(dataView: I2DGraphicBufferDataView) {
        this._nativeObj.removeDataView(dataView ? (dataView as any)._nativeObj : null);
    }

    destroy() {
        this._nativeObj.destroy();
    }

}

export class RT2DGraphic2DVertexDataView implements I2DGraphicVertexDataView {
    private _owner: RT2DGraphicVertexBuffer;
    private _start: number;
    private _length: number;
    private _stride: number;

    _nativeObj: any;

    get start(): number {
        return this._start;
    }

    get length(): number {
        return this._length;
    }

    get stride(): number {
        return this._stride;
    }

    constructor(owner: RT2DGraphicVertexBuffer, start: number, length: number, stride: number) {
        this._owner = owner;
        this._start = start;
        this._length = length;
        this._stride = stride;
        // this.updateView(owner.bufferData);
        this._nativeObj = new (window as any).conchRT2DGraphic2DBufferDataView(owner ? owner._nativeObj : null, start, length, stride);
        // this._nativeObj.view = this._view;
    }

    setData(data: ArrayLike<number>): void {
        this._owner._setData(data, this);
        this._nativeObj.modify();
    }

    // 更新数据视图
    // updateView(wholeData: Float32Array) {
    //     if (!this._view || this._view.buffer !== wholeData.buffer) {
    //         this._view = new Float32Array(wholeData.buffer, this.start * 4 /** Float32Array.BYTES_PER_ELEMENT */, this.length);
    //     }
    // }

    destroy() {
        //??
    }
}

export class RT2DGraphic2DIndexDataView implements I2DGraphicIndexDataView {
    private _geometry: IRenderGeometryElement;
    private _owner: RT2DGraphicIndexBuffer;
    private _length: number;
    private _memoryData: NativeMemory;
    _nativeObj: any;

    get length(): number {
        return this._length;
    }

    constructor(owner: RT2DGraphicIndexBuffer, length: number) {
        this._owner = owner;
        this._length = length;
        this._nativeObj = new (window as any).conchRT2DGraphic2DIndexDataView(owner ? owner._nativeObj : null, length);
        this._memoryData = new NativeMemory(this.length * 2, false);
        this._nativeObj.setIndexShareMemory(this._memoryData._buffer);
    }

    setData(data: ArrayLike<number>): void {
        this._memoryData.Uint16Array.set(data);
        this._nativeObj.modify();
    }

    setGeometry(value: IRenderGeometryElement): void {
        this._geometry = value;
        this._nativeObj.setGeometry(value ? (value as any)._nativeObj : null);
    }

    destroy() {
        this._memoryData.destroy();
    }
}