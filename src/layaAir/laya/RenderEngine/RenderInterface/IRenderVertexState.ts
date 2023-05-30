import { IndexBuffer } from "../IndexBuffer";
import { VertexBuffer } from "../VertexBuffer";
import { VertexDeclaration } from "../VertexDeclaration";

/**
 * 接口用来描述绑定渲染顶点布局
 */
export interface IRenderVertexState{
    _vertexDeclaration:VertexDeclaration[];
    _bindedIndexBuffer:IndexBuffer;
    _vertexBuffers:VertexBuffer[];
    /**@internal */
    bindVertexArray(): void;
    /**@internal */
    unbindVertexArray():void;
    applyVertexBuffer(vertexBuffer:VertexBuffer[]):void;
    applyIndexBuffer(indexBuffer:IndexBuffer|null):void;
    /**@internal */
    destroy():void;
}