import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";

export class GLESBufferState implements IBufferState {
    _bindedIndexBuffer: IIndexBuffer;
    _vertexBuffers: IVertexBuffer[];
    _nativeObj:any;
    constructor(){
        //
    }
    applyState(vertexBuffers: IVertexBuffer[], indexBuffer: IIndexBuffer): void {
        throw new Error("Method not implemented.");
    }
    destroy(): void {
        throw new Error("Method not implemented.");
    }


}