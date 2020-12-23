import { LayaGL } from "../../../layagl/LayaGL"
import { Resource } from "../../../resource/Resource"
import { Stat } from "../../../utils/Stat"
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D"
import { VertexDeclaration } from "../../graphics/VertexDeclaration"
import { VertexElement } from "../../graphics/VertexElement"
import { VertexElementFormat } from "../../graphics/VertexElementFormat"
import { BufferState } from "../BufferState"

/**
 * <code>ScreenQuad</code> 类用于创建全屏四边形。
 */
export class ScreenQuad extends Resource {
	/** @internal */
	static SCREENQUAD_POSITION_UV: number = 0;
	/** @internal */
	private static _vertexDeclaration: VertexDeclaration;
	/** @internal */
	private static _vertices: Float32Array = new Float32Array([1, 1, 1, 1, 1, -1, 1, 0, -1, 1, 0, 1, -1, -1, 0, 0]);//the rule of OpenGL
	/** @internal */
	private static _verticesInvertUV: Float32Array = new Float32Array([1, 1, 1, 0, 1, -1, 1, 1, -1, 1, 0, 0, -1, -1, 0, 1]);

	/**@internal */
	static instance: ScreenQuad;

	/**
	 * @internal
	 */
	static __init__(): void {
		ScreenQuad._vertexDeclaration = new VertexDeclaration(16, [new VertexElement(0, VertexElementFormat.Vector4, ScreenQuad.SCREENQUAD_POSITION_UV)]);
		ScreenQuad.instance = new ScreenQuad();
		ScreenQuad.instance.lock = true;
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
	 * 创建一个 <code>ScreenQuad</code> 实例,禁止使用。
	 */
	constructor() {
		super();
		var gl: WebGLRenderingContext = LayaGL.instance;
		this._vertexBuffer = new VertexBuffer3D(16 * 4, gl.STATIC_DRAW, false);
		this._vertexBuffer.vertexDeclaration = ScreenQuad._vertexDeclaration;
		this._vertexBuffer.setData(ScreenQuad._vertices.buffer);
		this._bufferState.bind();
		this._bufferState.applyVertexBuffer(this._vertexBuffer);
		this._bufferState.unBind();

		this._vertexBufferInvertUV = new VertexBuffer3D(16 * 4, gl.STATIC_DRAW, false);
		this._vertexBufferInvertUV.vertexDeclaration = ScreenQuad._vertexDeclaration;
		this._vertexBufferInvertUV.setData(ScreenQuad._verticesInvertUV.buffer);
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
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		Stat.renderBatches++;
	}

	/**
	 * @internal
	 */
	renderInvertUV(): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		this._bufferStateInvertUV.bind();
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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


