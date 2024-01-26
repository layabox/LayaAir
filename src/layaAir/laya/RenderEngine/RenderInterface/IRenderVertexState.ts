// import { IIndexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
// import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
// import { VertexDeclaration } from "../VertexDeclaration";

// /**
//  * 接口用来描述绑定渲染顶点布局
//  */
// export interface IRenderVertexState{
//     _vertexDeclaration:VertexDeclaration[];
//     _bindedIndexBuffer:IIndexBuffer;
//     _vertexBuffers:IVertexBuffer[];
//     /**@internal */
//     bindVertexArray(): void;
//     /**@internal */
//     unbindVertexArray():void;
//     applyVertexBuffer(vertexBuffer:IVertexBuffer[]):void;
//     applyIndexBuffer(indexBuffer:IIndexBuffer|null):void;
//     /**@internal */
//     destroy():void;
// }