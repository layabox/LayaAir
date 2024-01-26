import { IBufferState } from "../../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { VertexAttributeLayout } from "../../RenderEngine/VertexAttributeLayout";
import { IndexBuffer3D } from "../../d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../d3/graphics/VertexBuffer3D";
import { LayaGL } from "../../layagl/LayaGL";
import { IndexBuffer2D } from "./IndexBuffer2D";
import { VertexBuffer2D } from "./VertexBuffer2D";



/**
 * <code>BufferState</code> 类用于实现渲染所需的Buffer状态集合。
 */
export class BufferState {
	private static vertexBufferArray: IVertexBuffer[] = [];
	/**@private [只读]*/
	_deviceBufferState: IBufferState;

	/**@internal [只读]*/
	_bindedIndexBuffer: IndexBuffer3D | IndexBuffer2D;

	/**@internal */
	_vertexBuffers: VertexBuffer3D[] | VertexBuffer2D[];

	/**@internal */
	vertexlayout: VertexAttributeLayout;//WGPU 先不管

	/**
	 * 创建一个 <code>BufferState</code> 实例。
	 */
	constructor() {
		this._deviceBufferState = LayaGL.renderDeviceFactory.createBufferState();
	}

	applyState(vertexBuffers: VertexBuffer3D[] | VertexBuffer2D[], indexBuffer: IndexBuffer3D | IndexBuffer2D | null) {
		//this.vertexlayout = VertexAttributeLayout.getVertexLayoutByPool(vertexBuffers);
		this._vertexBuffers = vertexBuffers;
		this._bindedIndexBuffer = indexBuffer;
		if (!this._deviceBufferState)
			return;

		if (vertexBuffers.length == 1) {
			BufferState.vertexBufferArray.length = 1;
			BufferState.vertexBufferArray[0] = (vertexBuffers[0] as VertexBuffer3D)._deviceBuffer;
		} else {
			BufferState.vertexBufferArray.length = 0;
			vertexBuffers.forEach(element => {
				BufferState.vertexBufferArray.push((element as VertexBuffer3D)._deviceBuffer);
			});
		}
		this._deviceBufferState.applyState(BufferState.vertexBufferArray, indexBuffer ? (indexBuffer as IndexBuffer3D)._deviceBuffer : null);
	}

	/**
	 * @private
	 */
	destroy(): void {
		if (!this._deviceBufferState)
			return;
		this._deviceBufferState.destroy();
		this._deviceBufferState = null;
	}
}