
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { I2DGraphicBufferDataView, BufferModifyType, I2DGraphicWholeBuffer } from "../../Design/2D/IRender2DDataHandle";
import { GLESRenderGeometryElement } from "../../../OpenGLESDriver/RenderDevice/GLESRenderGeometryElement";


export class RT2DGraphicWholeBuffer implements I2DGraphicWholeBuffer {

    _nativeObj: any;
    private _modifyType: BufferModifyType;

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

    get modifyType(): BufferModifyType {
        return this._modifyType;
    }

    set modifyType(value: BufferModifyType) {
        this._modifyType = value;
        this._nativeObj.modifyType = value;
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

export class RT2DGraphic2DBufferDataView implements I2DGraphicBufferDataView {
    private _owner: RT2DGraphicWholeBuffer;
    private _geometry: GLESRenderGeometryElement;
    _nativeObj: any;

    get start(): number {
        return this._nativeObj.start;
    }
    set start(value: number) {
        this._nativeObj.start = value;
    }
    get length(): number {
        return this._nativeObj.length;
    }
    set length(value: number) {
        this._nativeObj.length = value;
    }
    get stride(): number {
        return this._nativeObj.stride;
    }
    set stride(value: number) {
        this._nativeObj.stride = value;
    }

    get modifyType(): BufferModifyType {
        return this._nativeObj.modifyType;
    }

    set modifyType(value: BufferModifyType) {
        this._nativeObj.modifyType = value;
    }
    setGeometry(value: GLESRenderGeometryElement) {
        this._geometry = value;
        this._nativeObj.setGeometry(value ? value._nativeObj : null);
    }

    getData(): Float32Array | Uint16Array {
        return this._nativeObj.getData();
    }

    setData(data: ArrayLike<number>) {
        this._nativeObj.setData(data);
    }

    constructor(owner: RT2DGraphicWholeBuffer, type: BufferModifyType, start: number, length: number, stride: number = 1, create: boolean = true) {
        this._owner = owner;
        this._nativeObj = new (window as any).conchRT2DGraphic2DBufferDataView(owner ? owner._nativeObj : null, type, start, length, stride, create);
        
    }
  
}
