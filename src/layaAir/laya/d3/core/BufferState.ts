import { LayaGL } from "../../layagl/LayaGL";
import { IndexBuffer } from "../../RenderEngine/IndexBuffer";
import { IRenderVertexState } from "../../RenderEngine/RenderInterface/IRenderVertexState";
import { VertexBuffer } from "../../RenderEngine/VertexBuffer";



/**
 * @internal
 * <code>BufferState</code> 类用于实现渲染所需的Buffer状态集合。
 */
export class BufferState {
	static _curBindedBufferState:BufferState;
	/**@private [只读]*/
	protected _nativeVertexArrayObject: IRenderVertexState;

	/**@internal [只读]*/
	_bindedIndexBuffer: IndexBuffer;

	/**@internal */
	_vertexBuffers: VertexBuffer[];

	/**
	 * 创建一个 <code>BufferState</code> 实例。
	 */
	constructor() {
		this._nativeVertexArrayObject = LayaGL.renderEngine.createVertexState();
	}

	protected applyVertexBuffers(): void {
		this._nativeVertexArrayObject.applyVertexBuffer(this._vertexBuffers);
	}

	protected applyIndexBuffers(): void {
		this._nativeVertexArrayObject.applyIndexBuffer(this._bindedIndexBuffer);
	}


	applyState(vertexBuffers: VertexBuffer[], indexBuffer: IndexBuffer | null) {
		this._vertexBuffers = vertexBuffers;
		this._bindedIndexBuffer = indexBuffer;
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
		this._nativeVertexArrayObject.bindVertexArray();
		BufferState._curBindedBufferState = this;
	}

	/**
	 * @private
	 */
	unBind(): void {
		if (LayaGL.renderEngine.getCurVertexState()==this._nativeVertexArrayObject) {
			this._nativeVertexArrayObject.unbindVertexArray();
			BufferState._curBindedBufferState = null;
		} else {
			throw "BufferState: must call bind() function first.";
		}
	}

	isbind():boolean{
		return (LayaGL.renderEngine.getCurVertexState()==this._nativeVertexArrayObject);
	}



	/**
	 * @private
	 */
	destroy(): void {
		this._nativeVertexArrayObject.destroy();
		this._nativeVertexArrayObject = null;
	}
}


