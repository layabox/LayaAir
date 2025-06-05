
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { I2DGraphicBufferDataView, BufferModifyType, I2DGraphicWholeBuffer } from "../../Design/2D/IRender2DDataHandle";
import { GLESRenderGeometryElement } from "../../../OpenGLESDriver/RenderDevice/GLESRenderGeometryElement";


export class RT2DGraphicWholeBuffer implements I2DGraphicWholeBuffer {
    get bufferData(): Float32Array | Uint16Array {
        return this._nativeObj.bufferData;
    }
    set bufferData(value: Float32Array | Uint16Array) {
        this._nativeObj.bufferData = value;
    }
    get buffer(): IIndexBuffer | IVertexBuffer {
        return this._nativeObj.buffer;
    }
    set buffer(value: IIndexBuffer | IVertexBuffer) {
        this._nativeObj.buffer = value;
    }
    get modifyType(): BufferModifyType {
        return this._nativeObj.modifyType;
    }
    set modifyType(value: BufferModifyType) {
        this._nativeObj.modifyType = value;
    }
    get _needResetData(): boolean {
        return this._nativeObj._needResetData;
    }
    set _needResetData(value: boolean) {
        this._nativeObj._needResetData = value;
    }   
    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchRT2DGraphicWholeBuffer();
     }
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
        this._nativeObj.needResetData = true;
    }

    addDataView(view: RT2DGraphic2DBufferDataView) {
        this._nativeObj.addDataView(view ? view._nativeObj : null);
    }   
    clearBufferViews() {
        this._nativeObj.clearBufferViews();
    }

    destroy() {
        this._nativeObj.destroy();
    }

}

export class RT2DGraphic2DBufferDataView implements I2DGraphicBufferDataView {
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
    _owner: RT2DGraphicWholeBuffer;
    get owner(): RT2DGraphicWholeBuffer {
        return this._owner;
    }
    set owner(value: RT2DGraphicWholeBuffer) {
        this._owner = value;
        this._nativeObj.setOwner(value ? value._nativeObj : null);
    }   
    get modifyType(): BufferModifyType {
        return this._nativeObj.modifyType;
    }
    set modifyType(value: BufferModifyType) {
        this._nativeObj.modifyType = value;
    }
    get isModified(): boolean {
        return this._nativeObj.isModified;
    }
    set isModified(value: boolean) {
        this._nativeObj.isModified = value;
    }
    _geometry: GLESRenderGeometryElement;
    get geometry(): GLESRenderGeometryElement {    
        return this._geometry;
    }
    
    set geometry(value: GLESRenderGeometryElement) {
        this._geometry = value;
        this._nativeObj.setGeometry(value ? value._nativeObj : null);
    }
  

    
    getData(): Float32Array | Uint16Array {
        return this._nativeObj.getData();
    }

    modify() {
        this._nativeObj.modify();   
    }
    _nativeObj: any;
    constructor(owner: RT2DGraphicWholeBuffer, type: BufferModifyType, start: number, length: number, stride: number = 1) {
        this._nativeObj = new (window as any).conchRT2DGraphic2DBufferDataView(type, start, length, stride);
        this.owner = owner;

        if (this.modifyType == BufferModifyType.Index) {
            this._nativeObj._data = new Uint16Array(length);
        } else {
            this._nativeObj.updateView(owner.bufferData);
            owner.addDataView(this);
        }
    }
}
