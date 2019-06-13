import { LayaGL } from "../../../layagl/LayaGL";
import { Stat } from "../../../utils/Stat";
import { WebGLContext } from "../../../webgl/WebGLContext";
import { BufferState } from "../../core/BufferState";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexMesh } from "../../graphics/Vertex/VertexMesh";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { VertexDeclaration } from "../../graphics/VertexDeclaration";
import { SkyMesh } from "././SkyMesh";

/**
 * <code>SkyBox</code> 类用于创建天空盒。
 */
export class SkyBox extends SkyMesh {
	/**@private */
	static instance: SkyBox;

	/**
	 * @private
	 */
	static __init__(): void {
		SkyBox.instance = new SkyBox();//TODO:移植为标准Mesh后需要加锁
	}

	/**
	 * 创建一个 <code>SkyBox</code> 实例。
	 */
	constructor() {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		super();
		var halfHeight: number = 0.5;
		var halfWidth: number = 0.5;
		var halfDepth: number = 0.5;
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
		this._vertexBuffer = new VertexBuffer3D(verDec.vertexStride * 8, WebGLContext.STATIC_DRAW, false);
		this._vertexBuffer.vertexDeclaration = verDec;
		this._indexBuffer = new IndexBuffer3D(IndexBuffer3D.INDEXTYPE_UBYTE, 36, WebGLContext.STATIC_DRAW, false);
		this._vertexBuffer.setData(vertices);
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
		 */
		/*override*/  _render(state: RenderContext3D): void {
		LayaGL.instance.drawElements(WebGLContext.TRIANGLES, 36, WebGLContext.UNSIGNED_BYTE, 0);
		Stat.trianglesFaces += 12;
		Stat.renderBatches++;
	}
}

