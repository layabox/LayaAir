
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { I2DGraphicBufferDataView, I2DGraphicIndexDataView, I2DGraphicVertexDataView, I2DGraphicWholeBuffer } from "../../Design/2D/IRender2DDataHandle";
import { GLESRenderGeometryElement } from "../../../OpenGLESDriver/RenderDevice/GLESRenderGeometryElement";
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";


export class RT2DGraphicWholeBuffer implements I2DGraphicWholeBuffer {

    _nativeObj: any;
    get arrayBuffer(): ArrayBuffer {
        return this._nativeObj.arrayBuffer;
    }
    set arrayBuffer(value: ArrayBuffer) {
        this._nativeObj.arrayBuffer = value;
    }
    get buffer(): IIndexBuffer | IVertexBuffer {
        return this._nativeObj.buffer;
    }

    set buffer(value: IIndexBuffer | IVertexBuffer) {
        this._nativeObj.buffer = value;
    }

    constructor() {
        this._nativeObj = new (window as any).conchRT2DGraphicWholeBuffer();
    }

    resetData(byteLength: number) {
        this._nativeObj.resetData(byteLength);
    }
    removeDataView(dataView: I2DGraphicBufferDataView) {
        this._nativeObj.removeDataView(dataView ? (dataView as any)._nativeObj : null);
    }

    clearBufferViews() {
        this._nativeObj.clearBufferViews();
    }

    destroy() {
        this._nativeObj.destroy();
    }

}

export class RT2DGraphic2DBufferDataView implements I2DGraphicVertexDataView {
    private _data: Float32Array;
    private _owner: RT2DGraphicWholeBuffer;
    private _start: number;
    private _length: number;
    private _stride: number;
    _nativeObj: any;

    get start(): number {
        return this._start;
    }

    set start(value: number) {
        this._start = value;
        this._nativeObj.start = value;
    }

    get length(): number {
        return this._length;
    }

    set length(value: number) {
        this._length = value;
        this._nativeObj.length = value;
    }

    get stride(): number {
        return this._stride;
    }

    set stride(value: number) {
        this._stride = value;
        this._nativeObj.stride = value;
    }

    getData(): Float32Array {
        return this._nativeObj.getData();
    }

    constructor(owner: RT2DGraphicWholeBuffer, start: number, length: number, stride: number) {
        this._owner = owner;
        this._start = start;
        this._length = length;
        this._stride = stride;
        this._nativeObj = new (window as any).conchRT2DGraphic2DBufferDataView(owner ? owner._nativeObj : null, start, length, stride);
    }

}


export class RT2DGraphic2DIndexDataView implements I2DGraphicIndexDataView {
    private _geometry: IRenderGeometryElement;
    private _data: Uint16Array;
    private _owner: RT2DGraphicWholeBuffer;
    private _length: number;
    _nativeObj: any;

    get length(): number {
        return this._length;
    }

    set length(value: number) {
        this._length = value;
        this._nativeObj.length = value;
    }

    constructor(owner: RT2DGraphicWholeBuffer, length: number) {
        this._owner = owner;
        this._length = length;
        this._data = new Uint16Array(length);
        this._nativeObj = new (window as any).conchRT2DGraphic2DIndexDataView(owner ? owner._nativeObj : null, length);
    }

    setData(data: ArrayLike<number>): void {
        this._data.set(data);
    }

    setGeometry(value: IRenderGeometryElement): void {
        this._geometry = value;
        this._nativeObj.setGeometry(value ? (value as any)._nativeObj : null);
    }

}