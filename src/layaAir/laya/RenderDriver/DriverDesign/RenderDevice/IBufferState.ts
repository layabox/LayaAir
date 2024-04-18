import { IIndexBuffer } from "./IIndexBuffer";
import { IVertexBuffer } from "./IVertexBuffer";

export interface IBufferState{
    _bindedIndexBuffer:IIndexBuffer;
    _vertexBuffers:IVertexBuffer[];
    applyState(vertexBuffers: IVertexBuffer[], indexBuffer: IIndexBuffer | null):void
    destroy():void;
}