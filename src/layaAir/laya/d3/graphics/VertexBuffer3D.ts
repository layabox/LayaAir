import { LayaGL } from "../../layagl/LayaGL";
import { Buffer } from "../../webgl/utils/Buffer";
import { VertexDeclaration } from "./VertexDeclaration";


/**
 * <code>VertexBuffer3D</code> 类用于创建顶点缓冲。
 */
export class VertexBuffer3D extends Buffer {
	/**数据类型_Float32Array类型。*/
	static DATATYPE_FLOAT32ARRAY: number = 0;
	/**数据类型_Uint8Array类型。*/
	static DATATYPE_UINT8ARRAY: number = 1;

	/** @internal */
	private _vertexCount: number = 0;
	/** @internal */
	private _canRead: boolean;

	/** @internal */
	_vertexDeclaration: VertexDeclaration = null;
	/** @internal */
	_float32Reader: Float32Array = null;

	/**
	 * 获取顶点声明。
	 */
	get vertexDeclaration(): VertexDeclaration {
		return this._vertexDeclaration;
	}

	/**
	 * 获取顶点声明。
	 */
	set vertexDeclaration(value: VertexDeclaration) {
		if (this._vertexDeclaration !== value) {
			this._vertexDeclaration = value;
			this._vertexCount = value ? this._byteLength / value.vertexStride : -1;
		}
	}

	/**
	 * 获取顶点个数。
	 *   @return	顶点个数。
	 */
	get vertexCount(): number {
		return this._vertexCount;
	}

	/**
	 * 获取是否可读。
	 *   @return	是否可读。
	 */
	get canRead(): boolean {
		return this._canRead;
	}

	/**
	 * 创建一个 <code>VertexBuffer3D</code> 实例。
	 * @param	vertexCount 顶点个数。
	 * @param	bufferUsage VertexBuffer3D用途类型。
	 * @param	canRead 是否可读。
	 * @param   dateType 数据类型。
	 */
	constructor(byteLength: number, bufferUsage: number, canRead: boolean = false) {
		super();
		this._vertexCount = -1;
		this._bufferUsage = bufferUsage;
		this._bufferType = WebGL2RenderingContext.ARRAY_BUFFER;
		this._canRead = canRead;

		this._byteLength = byteLength;
		this.bind();
		LayaGL.instance.bufferData(this._bufferType, this._byteLength, this._bufferUsage);
		if (canRead) {
			this._buffer = new Uint8Array(byteLength);
			this._float32Reader = new Float32Array(this._buffer.buffer);
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	bind(): boolean {
		if (Buffer._bindedVertexBuffer !== this._glBuffer) {
			LayaGL.instance.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this._glBuffer);
			Buffer._bindedVertexBuffer = this._glBuffer;
			return true;
		} else {
			return false;
		}
	}

	/**
	 * 设置数据。
	 * @param	data 顶点数据。
	 * @param	bufferOffset 顶点缓冲中的偏移,以字节为单位。
	 * @param	dataStartIndex 顶点数据的偏移,以字节为单位。
	 * @param	dataCount 顶点数据的长度,以字节为单位。
	 */
	setData(buffer: ArrayBuffer, bufferOffset: number = 0, dataStartIndex: number = 0, dataCount: number = 4294967295/*uint.MAX_VALUE*/): void {
		;
		this.bind();
		var needSubData: boolean = dataStartIndex !== 0 || dataCount !== 4294967295/*uint.MAX_VALUE*/;
		if (needSubData) {
			var subData: Uint8Array = new Uint8Array(buffer, dataStartIndex, dataCount);
			LayaGL.instance.bufferSubData(this._bufferType, bufferOffset, subData);
			if (this._canRead)
				this._buffer.set(subData, bufferOffset);
		}
		else {
			LayaGL.instance.bufferSubData(this._bufferType, bufferOffset, buffer);
			if (this._canRead)
				this._buffer.set(new Uint8Array(buffer), bufferOffset);
		}
	}

	/**
	 * 获取顶点数据。
	 * @return	顶点数据。
	 */
	getUint8Data(): Uint8Array {
		if (this._canRead)
			return this._buffer;
		else
			throw new Error("Can't read data from VertexBuffer with only write flag!");
	}

	/**
	 * @ignore
	 */
	getFloat32Data(): Float32Array {
		if (this._canRead)
			return this._float32Reader;
		else
			throw new Error("Can't read data from VertexBuffer with only write flag!");
	}

	/**
	 * @ignore
	 */
	markAsUnreadbale(): void {
		this._canRead = false;
		this._buffer = null;
		this._float32Reader = null;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	destroy(): void {
		super.destroy();
		this._buffer = null;
		this._float32Reader = null;
		this._vertexDeclaration = null;
	}
}




