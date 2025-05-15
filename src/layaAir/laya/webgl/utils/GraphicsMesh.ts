import { LayaGL } from "../../layagl/LayaGL";
import { Matrix } from "../../maths/Matrix";
import { IBufferState } from "../../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { IBufferDataView, IDynamicVIBuffer } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../renders/VertexElement";
import { VertexElementFormat } from "../../renders/VertexElementFormat";

export type MeshBlockInfo = {
   mesh: GraphicsMesh,
   vertexViews?: IBufferDataView[],
   vertexBlocks?: number[],
   indexViews?: IBufferDataView[],
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
   _buffer: IDynamicVIBuffer;

   get bufferState(): IBufferState {
      return this._buffer.bufferState;
   }

   constructor() {
      // 4 * GraphicsMesh.stride / 4 1次4个点
      this._buffer = LayaGL.render2DRenderPassFactory.createDynamicVIBuffer(GraphicsMesh.stride * 4 /** * 4 / 4 */, 6 );
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

