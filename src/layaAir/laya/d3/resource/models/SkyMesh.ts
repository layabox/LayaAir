import { BufferState } from "../../core/BufferState"
import { RenderContext3D } from "../../core/render/RenderContext3D"
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D"
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D"

/**
 * <code>SkyMesh</code> 类用于实现天空网格。
 */
export class SkyMesh {

	/**@private */
	protected _vertexBuffer: VertexBuffer3D;
	/**@private */
	protected _indexBuffer: IndexBuffer3D;

	/**@private */
	_bufferState: BufferState;

	/**
	 * 创建一个新的 <code>SkyMesh</code> 实例。
	 */
	constructor() {

	}

	/**
	 * @private
	 */
	_render(state: RenderContext3D): void {

	}

}


