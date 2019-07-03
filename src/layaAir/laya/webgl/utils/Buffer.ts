import { LayaGL } from "../../layagl/LayaGL"

export class Buffer {
	static _bindedVertexBuffer: any;	//当前gl绑定的VertexBuffer
	static _bindedIndexBuffer: any;		//当前gl绑定的indexBuffer

	protected _glBuffer: any;
	protected _buffer: any;//可能为Float32Array、Uint16Array、Uint8Array、ArrayBuffer等。

	protected _bufferType: number;
	protected _bufferUsage: number;

	_byteLength: number = 0;

	get bufferUsage(): number {
		return this._bufferUsage;
	}

	constructor() {
		this._glBuffer = LayaGL.instance.createBuffer()
	}

	/**
	 * @private
	 * 绕过全局状态判断,例如VAO局部状态设置
	 */
	_bindForVAO(): void {
	}

	/**
	 * @private
	 */
	bind(): boolean {
		return false;
	}

	/**
	 * @private
	 */
	destroy(): void {
		if (this._glBuffer) {
			LayaGL.instance.deleteBuffer(this._glBuffer);
			this._glBuffer = null;
		}
	}
}

