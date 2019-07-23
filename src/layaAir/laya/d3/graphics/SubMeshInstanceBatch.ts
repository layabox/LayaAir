import { LayaGL } from "../../layagl/LayaGL";
import { Stat } from "../../utils/Stat";
import { GeometryElement } from "../core/GeometryElement";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { SubMeshRenderElement } from "../core/render/SubMeshRenderElement";
import { SubMesh } from "../resource/models/SubMesh";
import { VertexBuffer3D } from "./VertexBuffer3D";
import { VertexMesh } from "./Vertex/VertexMesh";

/**
 * @internal
 */
export class SubMeshInstanceBatch extends GeometryElement {
	/** @internal */
	static instance: SubMeshInstanceBatch;

	/**
	 * @internal
	 */
	static __init__(): void {
		SubMeshInstanceBatch.instance = new SubMeshInstanceBatch();
	}

	/** @internal */
	maxInstanceCount: number = 1024;

	/** @internal */
	instanceWorldMatrixData: Float32Array = new Float32Array(this.maxInstanceCount * 16);
	/** @internal */
	instanceMVPMatrixData: Float32Array = new Float32Array(this.maxInstanceCount * 16);
	/** @internal */
	instanceWorldMatrixBuffer: VertexBuffer3D;
	/** @internal */
	instanceMVPMatrixBuffer: VertexBuffer3D;

	/**
	 * 创建一个 <code>InstanceSubMesh</code> 实例。
	 */
	constructor() {
		super();
		var gl: WebGLRenderingContext = LayaGL.instance;
		this.instanceWorldMatrixBuffer = new VertexBuffer3D(this.instanceWorldMatrixData.length * 4, gl.DYNAMIC_DRAW);
		this.instanceMVPMatrixBuffer = new VertexBuffer3D(this.instanceMVPMatrixData.length * 4, gl.DYNAMIC_DRAW);
		this.instanceWorldMatrixBuffer.vertexDeclaration = VertexMesh.instanceWorldMatrixDeclaration;
		this.instanceMVPMatrixBuffer.vertexDeclaration = VertexMesh.instanceMVPMatrixDeclaration;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	_render(state: RenderContext3D): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		var element: SubMeshRenderElement = (<SubMeshRenderElement>state.renderElement);
		var subMesh: SubMesh = element.instanceSubMesh;
		var count: number = element.instanceBatchElementList.length;
		var indexCount: number = subMesh._indexCount;
		subMesh._mesh._instanceBufferState.bind();
		LayaGL.layaGPUInstance.drawElementsInstanced(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, subMesh._indexStart * 2, count);
		Stat.renderBatches++;
		Stat.savedRenderBatches += count - 1;
		Stat.trianglesFaces += indexCount * count / 3;
	}
}

