import { BufferState } from "../BufferState"
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D"
import { VertexDeclaration } from "../../graphics/VertexDeclaration"
import { VertexElement } from "../../graphics/VertexElement"
import { VertexElementFormat } from "../../graphics/VertexElementFormat"
import { LayaGL } from "../../../layagl/LayaGL"
import { Resource } from "../../../resource/Resource"
import { Stat } from "../../../utils/Stat"


/**
 * <code>ScreenTriangle</code> 类用于创建全屏三角形。
 */
export class ScreenTriangle extends Resource {
	/** @internal */
	static SCREENTRIANGLE_POSITION_UV: number = 0;
	/** @internal */
	private static _vertexDeclaration: VertexDeclaration;
	/** @internal */
	private static _vertices: Float32Array = new Float32Array([-1, -1, 0, 0, -1, 3, 0, 2, 3, -1, 2, 0]);//the rule of OpenGL
	/** @internal */
	private static _verticesInvertUV: Float32Array = new Float32Array([-1, -1, 0, 1, -1, 3, 0, -1, 3, -1, 2, 1]);

	/**@internal */
	static instance: ScreenTriangle;

	/**
	 * @internal
	 */
	static __init__(): void {
		ScreenTriangle._vertexDeclaration = new VertexDeclaration(16, [new VertexElement(0, VertexElementFormat.Vector4, ScreenTriangle.SCREENTRIANGLE_POSITION_UV)]);
		ScreenTriangle.instance = new ScreenTriangle();
		ScreenTriangle.instance.lock = true;
	}

	/** @internal */
	private _vertexBuffer: VertexBuffer3D;
	/** @internal */
	private _bufferState: BufferState = new BufferState();
	/** @internal */
	private _vertexBufferInvertUV: VertexBuffer3D;
	/** @internal */
	private _bufferStateInvertUV: BufferState = new BufferState();

	/**
	 * 创建一个 <code>ScreenTriangle</code> 实例,禁止使用。
	 */
	constructor() {
		super();
		var gl: WebGLRenderingContext = LayaGL.instance;
		this._vertexBuffer = new VertexBuffer3D(12 * 4, gl.STATIC_DRAW, false);
		this._vertexBuffer.vertexDeclaration = ScreenTriangle._vertexDeclaration;
		this._vertexBuffer.setData(ScreenTriangle._vertices.buffer);
		this._bufferState.bind();
		this._bufferState.applyVertexBuffer(this._vertexBuffer);
		this._bufferState.unBind();

		this._vertexBufferInvertUV = new VertexBuffer3D(12 * 4, gl.STATIC_DRAW, false);
		this._vertexBufferInvertUV.vertexDeclaration = ScreenTriangle._vertexDeclaration;
		this._vertexBufferInvertUV.setData(ScreenTriangle._verticesInvertUV.buffer);
		this._bufferStateInvertUV.bind();
		this._bufferStateInvertUV.applyVertexBuffer(this._vertexBufferInvertUV);
		this._bufferStateInvertUV.unBind();

		this._setGPUMemory(this._vertexBuffer._byteLength + this._vertexBufferInvertUV._byteLength);
	}

	/**
	 * @internal
	 */
	render(): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		this._bufferState.bind();
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		Stat.renderBatches++;
	}

	/**
	 * @internal
	 */
	renderInvertUV(): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		this._bufferStateInvertUV.bind();
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		Stat.renderBatches++;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	destroy(): void {
		super.destroy();
		this._bufferState.destroy();
		this._vertexBuffer.destroy();
		this._bufferStateInvertUV.destroy();
		this._vertexBufferInvertUV.destroy();
		this._setGPUMemory(0);
	}

}


