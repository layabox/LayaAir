import { LayaGL } from "../../layagl/LayaGL"
import { RenderCapable } from "../../RenderEngine/RenderEnum/RenderCapable"
import { IndexBuffer } from "../../RenderEngine/RenderInterface/IndexBuffer"
import { VertexBuffer } from "../../RenderEngine/RenderInterface/VertexBuffer"
import { BufferStateBase } from "../../webgl/BufferStateBase"
import { IndexBuffer3D } from "../graphics/IndexBuffer3D"
import { VertexBuffer3D } from "../graphics/VertexBuffer3D"
import { VertexDeclaration } from "../graphics/VertexDeclaration"


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

	applyState(vertexBuffers:VertexBuffer3D[],indexBuffer:IndexBuffer3D|null){
		this._vertexBuffers = vertexBuffers;
		this._bindedIndexBuffer = indexBuffer;
		indexBuffer&&indexBuffer.unbind();//清空绑定
		this.bind();
		this.applyVertexBuffers();
		this.applyIndexBuffers();
		this.unBind();
	}
}


