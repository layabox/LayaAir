import { Graphic2DDynamicVIBuffer } from "../../display/Scene2DSpecial/Graphic2DDynamicVIBuffer";
import { LayaGL } from "../../layagl/LayaGL";
import { IBufferState } from "../../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { I2DGraphicBufferDataView } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../renders/VertexElement";
import { VertexElementFormat } from "../../renders/VertexElementFormat";

export type MeshBlockInfo = {
   mesh: GraphicsMesh,
   positions?: number[],
   vertexViews?: I2DGraphicBufferDataView[],
   vertexBlocks?: number[],
   indexView?: I2DGraphicBufferDataView,
}

export class GraphicsMesh {
   //顶点结构大小。每个mesh的顶点结构是固定的。
   static stride = 0;

   static vertexDeclarition: VertexDeclaration;

   static __init__(): void {
      GraphicsMesh.vertexDeclarition = new VertexDeclaration(48, [
         new VertexElement(0, VertexElementFormat.Vector4, 0),//pos,uv
         new VertexElement(16, VertexElementFormat.Vector4, 1),//color,alpha
         new VertexElement(32, VertexElementFormat.Vector4, 2),//
      ]);
      GraphicsMesh.stride = GraphicsMesh.vertexDeclarition.vertexStride / 4;
   }

   /** @internal */
   _buffer: Graphic2DDynamicVIBuffer;

   get bufferState(): IBufferState {
      return this._buffer.bufferState;
   }

   constructor() {
      //1次4个vb 6个ib
      this._buffer = new Graphic2DDynamicVIBuffer( 4 , GraphicsMesh.vertexDeclarition);
   }

   /**
    * @en Check vertex buffer
    * @param vertexCount vertex count
    * @returns vertex buffer info
    * @zh 检查顶点缓冲区
    * @param vertexCount 顶点数量
    * @returns 顶点缓冲区信息
    */
   checkVertex(vertexCount: number): MeshBlockInfo {
      let vbResult = this._buffer.checkVertexBuffer(vertexCount);
      if (!vbResult) return null;
      return {
         mesh: this,
         vertexBlocks: vbResult.vertexBlocks,
         vertexViews: vbResult.vertexViews
      }
   }

   /**
    * @en Check index buffer
    * @param indexCount index count
    * @returns index buffer info
    * @zh 检查索引缓冲区
    * @param indexCount 索引数量
    * @returns 索引缓冲区信息
    */
   checkIndex(indexCount: number): I2DGraphicBufferDataView {
      return this._buffer.checkIndexBuffer(indexCount);
   }

   /**
    * @en Clear index view map
    * @zh 清除索引视图映射
    */
   // clearIndexViewMap(): void {
   //    this._buffer.clearIndexViewMap();
   // }

   /**
    * @en Clear blocks
    * @param vertexBlocks vertex blocks
    * @param indexView index view
    * @zh 清除块
    * @param vertexBlocks 顶点块
    * @param indexView 索引视图
    */
   clearBlocks(vertexBlocks: number[], indexView: I2DGraphicBufferDataView): void {
      this._buffer.releaseVertexBlocks(vertexBlocks);
      this._buffer.releaseIndexView(indexView);
   }

   /**
    * @en Clear
    * @zh 清除
    */
   clear(): void {
      this._buffer.clear();
   }

   /**
    * @en Destroy
    * @zh 销毁
    */
   destroy(): void {
      this._buffer.destroy();
      this._buffer = null;
   }
}

