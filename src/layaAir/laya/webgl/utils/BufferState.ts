import { LayaGL } from "../../layagl/LayaGL";
import { IndexBuffer } from "../../RenderEngine/IndexBuffer";
import { IRenderVertexState } from "../../RenderEngine/RenderInterface/IRenderVertexState";
import { VertexAttributeLayout } from "../../RenderEngine/VertexAttributeLayout";
import { VertexBuffer } from "../../RenderEngine/VertexBuffer";



/**
 * <code>BufferState</code> 类用于实现渲染所需的Buffer状态集合。
 */
export class BufferState {
	static _curBindedBufferState: BufferState;
	/**@private [只读]*/
	protected _nativeVertexArrayObject: IRenderVertexState;

	/**@internal [只读]*/
	_bindedIndexBuffer: IndexBuffer;

	/**@internal */
	_vertexBuffers: VertexBuffer[];

	/**@internal */
	vertexlayout: VertexAttributeLayout;

	/**
	 * 创建一个 <code>BufferState</code> 实例。
	 */
	constructor() {
		this._nativeVertexArrayObject = LayaGL.renderEngine.createVertexState();
	}

	protected applyVertexBuffers(): void {
		this._nativeVertexArrayObject&&this._nativeVertexArrayObject.applyVertexBuffer(this._vertexBuffers);
	}

	protected applyIndexBuffers(): void {
		this._nativeVertexArrayObject&&this._nativeVertexArrayObject.applyIndexBuffer(this._bindedIndexBuffer);
	}


	applyState(vertexBuffers: VertexBuffer[], indexBuffer: IndexBuffer | null) {
		this.vertexlayout = VertexAttributeLayout.getVertexLayoutByPool(vertexBuffers);
		this._vertexBuffers = vertexBuffers;
		this._bindedIndexBuffer = indexBuffer;
		if(!this._nativeVertexArrayObject)
			return;
		indexBuffer && indexBuffer.unbind();//清空绑定
		this.bind();
		this.applyVertexBuffers();
		this.applyIndexBuffers();
		this.unBind();
		indexBuffer && indexBuffer.unbind();//清空绑定
		

	}

	/**
	 * @private
	 */
	bind(): void {
		if(!this._nativeVertexArrayObject)
			return;
		this._nativeVertexArrayObject.bindVertexArray();
		BufferState._curBindedBufferState = this;
	}

	/**
	 * @private
	 */
	unBind(): void {
		if(!this._nativeVertexArrayObject)
			return;
		if (BufferState._curBindedBufferState == this) {
			this._nativeVertexArrayObject.unbindVertexArray();
			BufferState._curBindedBufferState = null;
		} else {
			throw "BufferState: must call bind() function first.";
		}
	}

	isbind(): boolean {
		return (BufferState._curBindedBufferState == this);
	}

	static clearbindBufferState() {
		LayaGL.renderEngine.unbindVertexState();
		BufferState._curBindedBufferState = null;
	}

	/**
	 * @private
	 */
	destroy(): void {
		if(!this._nativeVertexArrayObject)
			return;
		this._nativeVertexArrayObject.destroy();
		this._nativeVertexArrayObject = null;
	}
}


