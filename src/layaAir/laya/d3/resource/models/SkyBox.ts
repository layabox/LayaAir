import { LayaGL } from "../../../layagl/LayaGL";
import { Stat } from "../../../utils/Stat";
import { BufferState } from "../../core/BufferState";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexMesh } from "../../graphics/Vertex/VertexMesh";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { VertexDeclaration } from "../../graphics/VertexDeclaration";
import { SkyMesh } from "./SkyMesh";
import { IndexFormat } from "../../graphics/IndexFormat";

/**
 * <code>SkyBox</code> 类用于创建天空盒。
 */
export class SkyBox extends SkyMesh {
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
		super();
		var gl: WebGLRenderingContext = LayaGL.instance;
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
		this._vertexBuffer = new VertexBuffer3D(verDec.vertexStride * 8, gl.STATIC_DRAW, false);
		this._vertexBuffer.vertexDeclaration = verDec;
		this._indexBuffer = new IndexBuffer3D(IndexFormat.UInt8, 36, gl.STATIC_DRAW, false);
		this._vertexBuffer.setData(vertices.buffer);
		this._indexBuffer.setData(indices);

		var bufferState: BufferState = new BufferState();
		bufferState.bind();
		bufferState.applyVertexBuffer(this._vertexBuffer);
		bufferState.applyIndexBuffer(this._indexBuffer);
		bufferState.unBind();
		this._bufferState = bufferState;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_render(state: RenderContext3D): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
		Stat.trianglesFaces += 12;
		Stat.renderBatches++;
	}
}

