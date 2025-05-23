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
   indexViews?: I2DGraphicBufferDataView[],
   indexBlocks?: number[],
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
      // 4 * GraphicsMesh.stride / 4 1次4个点
      this._buffer = new Graphic2DDynamicVIBuffer(GraphicsMesh.stride * 4 /** * 4 / 4 */, 6);
      this._buffer.vertexDeclaration = GraphicsMesh.vertexDeclarition;
   }

   checkVertex(vertexCount: number): MeshBlockInfo {
      let vbResult = this._buffer.checkVertexBuffer(vertexCount * GraphicsMesh.stride);
      if (!vbResult) return null;
      return {
         mesh: this,
         vertexBlocks: vbResult.vertexBlocks,
         vertexViews: vbResult.vertexViews
      }
   }

   checkIndex(indexCount: number): MeshBlockInfo {
      let ibResult = this._buffer.checkIndexBuffer(indexCount);
      if (!ibResult) return null;
      return {
         mesh: this,
         indexBlocks: ibResult.indexBlocks,
         indexViews: ibResult.indexViews
      }
   }

   clearBlocks(vertexBlocks: number[], indexBlocks: number[]): void {
      this._buffer.releaseVertexBlocks(vertexBlocks);
      this._buffer.releaseIndexBlocks(indexBlocks);
   }

   clear(): void {
      this._buffer.clear();
   }

   destroy(): void {
      this._buffer.destroy();
      this._buffer = null;
   }
}

