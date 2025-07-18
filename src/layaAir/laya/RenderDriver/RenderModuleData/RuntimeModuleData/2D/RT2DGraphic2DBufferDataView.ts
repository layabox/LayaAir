
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { I2DGraphicBufferDataView, I2DGraphicIndexDataView, I2DGraphicVertexDataView, I2DGraphicWholeBuffer } from "../../Design/2D/IRender2DDataHandle";
import { GLESRenderGeometryElement } from "../../../OpenGLESDriver/RenderDevice/GLESRenderGeometryElement";
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";


export class RT2DGraphicVertexBuffer implements I2DGraphicWholeBuffer {
    private _arrayBuffer: ArrayBuffer;
    private _bufferData: Float32Array;
    private _buffer: IVertexBuffer;
    _nativeObj: any;

    get arrayBuffer(): ArrayBuffer {
        return this._arrayBuffer;
    }

    get bufferData(): Float32Array {
        return this._bufferData;
    }

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

    removeDataView(dataView: I2DGraphicBufferDataView) {
        this._nativeObj.removeDataView(dataView ? (dataView as any)._nativeObj : null);
    }

    addDataView(dataView: I2DGraphicBufferDataView) {
        this._nativeObj.addDataView(dataView ? (dataView as any)._nativeObj : null);
    }

    destroy() {
        this._nativeObj.destroy();
    }

    resetData(byteLength: number) {
        let arrayBuffer = new ArrayBuffer(byteLength);
        let newData = new Float32Array(arrayBuffer);

        if (this._bufferData) {
            newData.set(this._bufferData);
        }

        this._bufferData = newData;
        this._arrayBuffer = arrayBuffer;

        // todo
        this._nativeObj.arrayBuffer = this._arrayBuffer;
        this._nativeObj.bufferData = this._bufferData;
        this._nativeObj._needResetData = true;
    }
}

export class RT2DGraphicIndexBuffer implements I2DGraphicWholeBuffer {
    private _arrayBuffer: ArrayBuffer;
    private _bufferData: Uint16Array;
    private _buffer: IIndexBuffer;

    _nativeObj: any;
    get arrayBuffer(): ArrayBuffer {
        return this._arrayBuffer;
    }

    get bufferData(): Uint16Array {
        return this._bufferData;
    }

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
        this._arrayBuffer = new ArrayBuffer(byteLength);
        let newData = new Uint16Array(this._arrayBuffer);
        if (this._bufferData) {
            newData.set(this._bufferData);
        }

        this._bufferData = newData;
        // todo
        this._nativeObj.arrayBuffer = this._arrayBuffer;
        this._nativeObj.buffer = this._bufferData;
        this._nativeObj._needResetData = true;
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
    private _view: Float32Array;

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

    getData(): Float32Array {
        return this._view;
    }

    constructor(owner: RT2DGraphicVertexBuffer, start: number, length: number, stride: number) {
        this._owner = owner;
        this._start = start;
        this._length = length;
        this._stride = stride;
        this.updateView(owner.bufferData);
        this._nativeObj = new (window as any).conchRT2DGraphic2DBufferDataView(owner ? owner._nativeObj : null, start, length, stride);
        this._nativeObj.view = this._view;
    }

    setData(data: ArrayLike<number>): void {
        this._view.set(data);
        this._nativeObj.modify();
    }

    // 更新数据视图
    updateView(wholeData: Float32Array) {
        if (!this._view || this._view.buffer !== wholeData.buffer) {
            this._view = new Float32Array(wholeData.buffer, this.start * 4 /** Float32Array.BYTES_PER_ELEMENT */, this.length);
        }
    }
}


export class RT2DGraphic2DIndexDataView implements I2DGraphicIndexDataView {
    private _geometry: IRenderGeometryElement;
    private _view: Uint16Array;
    private _arrayBuffer: ArrayBuffer;
    private _owner: RT2DGraphicIndexBuffer;
    private _length: number;
    _nativeObj: any;

    get view(): Uint16Array {
        return this._view;
    }

    get length(): number {
        return this._length;
    }

    constructor(owner: RT2DGraphicIndexBuffer, length: number) {
        this._owner = owner;
        this._length = length;
        this._arrayBuffer = new ArrayBuffer(length * 2);
        this._view = new Uint16Array(this._arrayBuffer);
        this._nativeObj = new (window as any).conchRT2DGraphic2DIndexDataView(owner ? owner._nativeObj : null, length);
        //todo
        this._nativeObj.arrayBuffer = this._arrayBuffer;
        this._nativeObj.view = this._view;
    }

    setData(data: ArrayLike<number>): void {
        this._view.set(data);
        this._nativeObj.modify();
    }

    setGeometry(value: IRenderGeometryElement): void {
        this._geometry = value;
        this._nativeObj.setGeometry(value ? (value as any)._nativeObj : null);
    }

}