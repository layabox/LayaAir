import { Graphic2DDynamicVIBuffer } from "../../display/Scene2DSpecial/Graphic2DDynamicVIBuffer";
import { IBufferState } from "../../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { I2DGraphicVertexDataView, I2DGraphicIndexDataView } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { GraphicsDefines } from "../shader/d2/GraphicsDefines";

export type MeshBlockInfo = {
   mesh: GraphicsMesh,
   vertexViews?: I2DGraphicVertexDataView[],
   vertexBlocks?: number[],
}

/** @ignore */
export class GraphicsMesh {

   static IDCounter:number = 0;
   
   id:number = GraphicsMesh.IDCounter++;

   /** @internal */
   _buffer: Graphic2DDynamicVIBuffer;

   get bufferState(): IBufferState {
      return this._buffer.bufferState;
   }

   constructor(vertexBlockSize: number) {
      //1次4个vb 6个ib
      this._buffer = new Graphic2DDynamicVIBuffer(vertexBlockSize, GraphicsDefines.vertexDeclarition);
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
      vbResult.mesh = this;
      return vbResult;
   }

   /**
    * @en Check index buffer
    * @param indexCount index count
    * @returns index buffer info
    * @zh 检查索引缓冲区
    * @param indexCount 索引数量
    * @returns 索引缓冲区信息
    */
   checkIndex(indexCount: number): I2DGraphicIndexDataView {
      return this._buffer.checkIndexBuffer(indexCount);
   }

   /**
    * @en Clear blocks
    * @param vertexBlocks vertex blocks
    * @zh 清除块
    * @param vertexBlocks 顶点块
    */
   clearBlocks(vertexBlocks: number[]): void {
      this._buffer.releaseVertexBlocks(vertexBlocks);
   }

   /**
    * @en Clear index view
    * @param indexView index view
    * @zh 清除索引视图
    * @param indexView 索引视图
    */
   clearIndexView(indexView: I2DGraphicIndexDataView): void {
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

