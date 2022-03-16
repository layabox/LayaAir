import { BufferStateBase } from "../../RenderEngine/BufferStateBase";
import { IndexBuffer } from "../../RenderEngine/IndexBuffer";
import { VertexBuffer } from "../../RenderEngine/VertexBuffer";



/**
 * @internal
 * <code>BufferState</code> 类用于实现渲染所需的Buffer状态集合。
 */
export class BufferState extends BufferStateBase {
	/**
	 * 创建一个 <code>BufferState</code> 实例。
	 */
	constructor() {
		super();
	}

	applyState(vertexBuffers:VertexBuffer[],indexBuffer:IndexBuffer|null){
		this._vertexBuffers = vertexBuffers;
		this._bindedIndexBuffer = indexBuffer;
		indexBuffer&&indexBuffer.unbind();//清空绑定
		this.bind();
		this.applyVertexBuffers();
		this.applyIndexBuffers();
		this.unBind();
		indexBuffer&&indexBuffer.unbind();//清空绑定
	}
}


