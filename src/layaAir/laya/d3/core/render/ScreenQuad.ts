import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType"
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType"
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode"
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration"
import { LayaGL } from "../../../layagl/LayaGL"
import { VertexElement } from "../../../renders/VertexElement"
import { VertexElementFormat } from "../../../renders/VertexElementFormat"
import { BufferState } from "../../../webgl/utils/BufferState"
import { Laya3DRender } from "../../RenderObjs/Laya3DRender"
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D"
import { GeometryElement } from "../GeometryElement"
import { RenderContext3D } from "./RenderContext3D"

/**
 * @en The `ScreenQuad` class is used to create a fullscreen quad.
 * @zh `ScreenQuad` 类用于创建全屏四边形。
 */
export class ScreenQuad extends GeometryElement {
	/** @internal */
	static SCREENQUAD_POSITION_UV: number = 0;
	/** @internal */
	private static _vertexDeclaration: VertexDeclaration;
	/** @internal */
	private static _vertices: Float32Array = new Float32Array([
		1, 1, 1, 1,
		1, -1, 1, 0,
		-1, 1, 0, 1,
		-1, -1, 0, 0]);//the rule of OpenGL
	/** @internal */
	private static _verticesInvertUV: Float32Array = new Float32Array([
		1, 1, 1, 0,
		1, -1, 1, 1,
		-1, 1, 0, 0,
		-1, -1, 0, 1]);
	/**@internal */
	static instance: ScreenQuad;
	static InvertInstance: ScreenQuad;

	/**
	 * @internal
	 */
	static __init__(): void {
		ScreenQuad._vertexDeclaration = new VertexDeclaration(16, [new VertexElement(0, VertexElementFormat.Vector4, ScreenQuad.SCREENQUAD_POSITION_UV)]);
		ScreenQuad.instance = new ScreenQuad();
		ScreenQuad.instance.invertY = true;
		ScreenQuad.InvertInstance = new ScreenQuad();
		ScreenQuad.InvertInstance.invertY = false;
	}

	/** @internal */
	private _vertexBuffer: VertexBuffer3D;
	/** @internal */
	protected _bufferState: BufferState = new BufferState();
	/** @internal */
	private _vertexBufferInvertUV: VertexBuffer3D;
	/** @internal */
	private _bufferStateInvertUV: BufferState = new BufferState();

	/**
	 * @ignore
	 * @en Construcutor method, do not use.
	 * @zh 构造方法，禁止使用。
	 */
	constructor() {
		super(MeshTopology.TriangleStrip, DrawType.DrawArray);
		this.setDrawArrayParams(0, 4);
		//顶点buffer
		this._vertexBuffer = Laya3DRender.renderOBJCreate.createVertexBuffer3D(16 * 4, BufferUsage.Static, false);
		this._vertexBuffer.vertexDeclaration = ScreenQuad._vertexDeclaration;
		this._vertexBuffer.setData(ScreenQuad._vertices.buffer);
		this._bufferState.applyState([this._vertexBuffer], null);

		this._vertexBufferInvertUV = Laya3DRender.renderOBJCreate.createVertexBuffer3D(16 * 4, BufferUsage.Static, false);
		this._vertexBufferInvertUV.vertexDeclaration = ScreenQuad._vertexDeclaration;
		this._vertexBufferInvertUV.setData(ScreenQuad._verticesInvertUV.buffer);
		this._bufferStateInvertUV.applyState([this._vertexBufferInvertUV], null);

		this.invertY = false;
	}

	/**
	 * @en Sets whether to invert the Y-axis and selects the corresponding buffer state.
	 * @param value Whether to invert the Y-axis 
	 * @zh 设置Y轴是否反转，并选择相应的缓冲状态。
	 * @param value 是否反转Y轴
	 */
	set invertY(value: boolean) {
		value = LayaGL.renderEngine._screenInvertY ? !value : value;
		this.bufferState = value ? this._bufferStateInvertUV : this._bufferState;
	}

	/**
	 * @internal
	 * UpdateGeometry Data
	 */
	_updateRenderParams(state: RenderContext3D): void {
	}

	/**
	 * @inheritDoc
	 * @override
	 * @en Destroys the ScreenQuad instance.
	 * @zh 销毁ScreenQuad实例。
	 */
	destroy(): void {
		super.destroy();
		this._bufferState.destroy();
		this._vertexBuffer.destroy();
		this._bufferStateInvertUV.destroy();
		this._vertexBufferInvertUV.destroy();

	}

}


