import { LayaGL } from "../../../layagl/LayaGL";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { BufferState } from "../../core/BufferState";
import { GeometryElement } from "../../core/GeometryElement";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { VertexMesh } from "../../graphics/Vertex/VertexMesh";


/**
 * <code>SkyBox</code> 类用于创建天空盒。
 */
export class SkyBox extends GeometryElement {
	static instance: SkyBox;
	/**
	 * @internal
	 */
	static __init__(): void {
		SkyBox.instance = new SkyBox();//TODO:移植为标准Mesh后需要加锁
	}

	/**
	 * 创建一个 <code>SkyBox</code> 实例。
	 */
	constructor() {
		super(MeshTopology.Triangles,DrawType.DrawElement);
		var halfHeight: number = 1.0;
		var halfWidth: number = 1.0;
		var halfDepth: number = 1.0;
		var vertices: Float32Array = new Float32Array([-halfDepth, halfHeight, -halfWidth, halfDepth, halfHeight, -halfWidth, halfDepth, halfHeight, halfWidth, -halfDepth, halfHeight, halfWidth,//上
		-halfDepth, -halfHeight, -halfWidth, halfDepth, -halfHeight, -halfWidth, halfDepth, -halfHeight, halfWidth, -halfDepth, -halfHeight, halfWidth]);//下
		var indices: Uint8Array = new Uint8Array([
			0, 1, 2, 2, 3, 0, //上
			4, 7, 6, 6, 5, 4, //下
			0, 3, 7, 7, 4, 0, //左
			1, 5, 6, 6, 2, 1,//右
			3, 2, 6, 6, 7, 3, //前
			0, 4, 5, 5, 1, 0]);//后
		var verDec: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION");
		let vertexBuffer = LayaGL.renderOBJCreate.createVertexBuffer3D(verDec.vertexStride * 8, BufferUsage.Static, false);
		vertexBuffer.vertexDeclaration = verDec;
		let indexBuffer = LayaGL.renderOBJCreate.createIndexBuffer3D(IndexFormat.UInt8, 36, BufferUsage.Static, false);
		vertexBuffer.setData(vertices.buffer);
		indexBuffer.setData(indices);
		this.bufferState = new BufferState();
		this.bufferState.applyState([vertexBuffer],indexBuffer);
		this._geometryElementOBj.setDrawElemenParams(36,0);
		this.indexFormat = IndexFormat.UInt8;
	}

	/**
	 * @internal
	 * UpdateGeometry Data
	 */
	 _updateRenderParams(state: RenderContext3D): void {
		
	}
}

