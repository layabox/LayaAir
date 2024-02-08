import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";

export class GLESBufferState implements IBufferState {
    _bindedIndexBuffer: IIndexBuffer;
    _vertexBuffers: IVertexBuffer[];
    _nativeObj:any;
    constructor(){
        this._nativeObj = new (window as any).conchGLESBufferState();
    }
    applyState(vertexBuffers: IVertexBuffer[], indexBuffer: IIndexBuffer): void {
        this._vertexBuffers = vertexBuffers;
        this._bindedIndexBuffer = indexBuffer;

        let tempVertexBuffers: any = [];
        vertexBuffers.forEach((element) => {
            tempVertexBuffers.push((element as any)._nativeObj);
        });
        this._nativeObj.applyState(tempVertexBuffers, indexBuffer ? (indexBuffer as any)._nativeObj : null)
    }
    destroy(): void {
        this._nativeObj.destroy();
    }
}