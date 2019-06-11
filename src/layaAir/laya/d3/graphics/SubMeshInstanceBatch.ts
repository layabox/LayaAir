import { LayaGL } from "laya/layagl/LayaGL";
import { Stat } from "laya/utils/Stat";
import { WebGLContext } from "laya/webgl/WebGLContext";
import { GeometryElement } from "../core/GeometryElement";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { SubMeshRenderElement } from "../core/render/SubMeshRenderElement";
import { SubMesh } from "../resource/models/SubMesh";
import { VertexBuffer3D } from "././VertexBuffer3D";
import { VertexMesh } from "./Vertex/VertexMesh";
	
	/**
	 * @private
	 */
	export class SubMeshInstanceBatch extends GeometryElement {
		/** @private */
		static instance:SubMeshInstanceBatch;

		/**
		 * @private
		 */
		static __init__():void{
			SubMeshInstanceBatch.instance = new SubMeshInstanceBatch();
		}
		
		/** @private */
		maxInstanceCount:number = 1024;
		
		/** @private */
		instanceWorldMatrixData:Float32Array = new Float32Array(this.maxInstanceCount * 16);
		/** @private */
		 instanceMVPMatrixData:Float32Array = new Float32Array(this.maxInstanceCount * 16);
		/** @private */
		 instanceWorldMatrixBuffer:VertexBuffer3D = new VertexBuffer3D(this.instanceWorldMatrixData.length * 4, WebGLContext.DYNAMIC_DRAW);
		/** @private */
		 instanceMVPMatrixBuffer:VertexBuffer3D = new VertexBuffer3D(this.instanceMVPMatrixData.length * 4, WebGLContext.DYNAMIC_DRAW);
		
		/**
		 * 创建一个 <code>InstanceSubMesh</code> 实例。
		 */
		constructor(){
			super();
			this.instanceWorldMatrixBuffer.vertexDeclaration = VertexMesh.instanceWorldMatrixDeclaration;
			this.instanceMVPMatrixBuffer.vertexDeclaration = VertexMesh.instanceMVPMatrixDeclaration;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _render(state:RenderContext3D):void {
			var element:SubMeshRenderElement = (<SubMeshRenderElement>state.renderElement );
			var subMesh:SubMesh = element.instanceSubMesh;
			var count:number = element.instanceBatchElementList.length;
			var indexCount:number = subMesh._indexCount;
			subMesh._mesh._instanceBufferState.bind();
			LayaGL.layaGPUInstance.drawElementsInstanced(WebGLContext.TRIANGLES, indexCount, WebGLContext.UNSIGNED_SHORT, subMesh._indexStart * 2, count);
			Stat.renderBatches++;
			Stat.savedRenderBatches += count - 1;
			Stat.trianglesFaces += indexCount * count / 3;
		}
	}

