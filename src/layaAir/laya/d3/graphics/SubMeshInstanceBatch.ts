import { GeometryElement } from "../core/GeometryElement";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { SubMeshRenderElement } from "../core/render/SubMeshRenderElement";
import { SubMesh } from "../resource/models/SubMesh";
import { VertexBuffer3D } from "./VertexBuffer3D";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { VertexMesh } from "../../RenderEngine/RenderShader/VertexMesh";
import { Laya3DRender } from "../RenderObjs/Laya3DRender";

/**
 * 是否要删除
 * @internal
 */
export class SubMeshInstanceBatch extends GeometryElement {
	/** @internal */
	static instance: SubMeshInstanceBatch;
	/** @internal */
	static maxInstanceCount: number = 1024;

	/**
	 * @internal
	 */
	static __init__(): void {
		SubMeshInstanceBatch.instance = new SubMeshInstanceBatch();
	}

	/** @internal */
	instanceWorldMatrixData: Float32Array = new Float32Array(SubMeshInstanceBatch.maxInstanceCount * 16);
	/** @internal */
	instanceWorldMatrixBuffer: VertexBuffer3D;
	/**SimpleAnimator */
	/** @internal */
	instanceSimpleAnimatorData: Float32Array = new Float32Array(SubMeshInstanceBatch.maxInstanceCount * 4);
	/** @internal */
	instanceSimpleAnimatorBuffer: VertexBuffer3D;

	/**
	 * 创建一个 <code>InstanceSubMesh</code> 实例。
	 */
	constructor() {
		super(MeshTopology.Triangles, DrawType.DrawElementInstance);
		this.indexFormat = IndexFormat.UInt16;
		this.instanceWorldMatrixBuffer = Laya3DRender.renderOBJCreate.createVertexBuffer3D(this.instanceWorldMatrixData.length * 4, BufferUsage.Dynamic, false);
		this.instanceWorldMatrixBuffer.vertexDeclaration = VertexMesh.instanceWorldMatrixDeclaration;
		this.instanceWorldMatrixBuffer.instanceBuffer = true;
		//SImpleAnimator
		this.instanceSimpleAnimatorBuffer = Laya3DRender.renderOBJCreate.createVertexBuffer3D(this.instanceSimpleAnimatorData.length * 4, BufferUsage.Dynamic, false);
		this.instanceSimpleAnimatorBuffer.vertexDeclaration = VertexMesh.instanceSimpleAnimatorDeclaration;
		this.instanceSimpleAnimatorBuffer.instanceBuffer = true;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	_updateRenderParams(state: RenderContext3D): void {
		var element: SubMeshRenderElement = (<SubMeshRenderElement>state.renderElement);
		var subMesh: SubMesh = element.instanceSubMesh;
		var count: number = element.instanceBatchElementList.length;
		var indexCount: number = subMesh._indexCount;
		//subMesh._mesh._instanceBufferState.bind();
		this.clearRenderParams();
		this.bufferState = subMesh._mesh._instanceBufferState;
		this.instanceCount = count;
		this.setDrawElemenParams(indexCount, subMesh._indexStart * 2);
		//LayaGL.renderDrawConatext.drawElementsInstanced(MeshTopology.Triangles, indexCount, IndexFormat.UInt16, subMesh._indexStart * 2, count);
		//Stat.renderBatches++;
		//Stat.savedRenderBatches += count - 1;
		//Stat.trianglesFaces += indexCount * count / 3;
	}


}

