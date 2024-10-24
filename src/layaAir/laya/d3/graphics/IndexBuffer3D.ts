import { IIndexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { LayaGL } from "../../layagl/LayaGL";
import { NotReadableError } from "../../utils/Error";
/**
 * @en IndexBuffer3D class is used to create index buffer. Please use LayaGL.RenderOBJCreate.createIndexBuffer3D to create.
 * @zh IndexBuffer3D 类用于创建索引缓冲。请使用LayaGL.RenderOBJCreate.createIndexBuffer3D来创建。
 */
export class IndexBuffer3D {
	/** @internal */
	private _canRead: boolean;
	private _indexType: IndexFormat = IndexFormat.UInt16;
	/** @internal */
	private _indexTypeByteCount: number;
	/** @internal */
	private _indexCount: number;
	_byteLength: number;
	_buffer: Float32Array | Uint16Array | Uint8Array | Uint32Array;
	/**@internal */
	_deviceBuffer: IIndexBuffer;
	bufferUsage: BufferUsage;

	/**
	 * @en The index type.
	 * @zh 索引类型。
	 */
	get indexType(): IndexFormat {
		return this._indexType;
	}

	/**
	 * @en The byte count of the index type.
	 * @zh 索引类型字节数量。
	 */
	get indexTypeByteCount(): number {
		return this._indexTypeByteCount;
	}

	/**
	 * @en The number of indices.
	 * @zh 索引个数。
	 */
	get indexCount(): number {
		return this._indexCount;
	}

	/**
	 * @en Whether the buffer can be read.
	 * @zh 是否可读。
	 */
	get canRead(): boolean {
		return this._canRead;
	}

	/**
	 * @en Constructor method, create index buffer.
	 * @param	indexType Index type.
	 * @param	indexCount Index count.
	 * @param	bufferUsage IndexBuffer3D usage type.
	 * @param	canRead Whether the buffer can be read.
	 * @zh 构造方法,创建索引缓冲。
	 * @param	indexType 索引类型。
	 * @param	indexCount 索引个数。
	 * @param	bufferUsage IndexBuffer3D用途类型。
	 * @param	canRead 是否可读。
	 */
	constructor(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage = BufferUsage.Static, canRead: boolean = false) {
		this._deviceBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(bufferUsage);
		this._deviceBuffer.indexType = this._indexType = indexType;
		this._deviceBuffer.indexCount = this._indexCount = indexCount;
		this._canRead = canRead;
		this.bufferUsage = bufferUsage;
		switch (indexType) {
			case IndexFormat.UInt32:
				this._indexTypeByteCount = 4;
				break;
			case IndexFormat.UInt16:
				this._indexTypeByteCount = 2;
				break;
			case IndexFormat.UInt8:
				this._indexTypeByteCount = 1;
				break;
			default:
				throw new Error("unknown index type: " + indexType);
		}
		var byteLength: number = this._indexTypeByteCount * indexCount;
		this._byteLength = byteLength;
		this._deviceBuffer._setIndexDataLength(byteLength);
		if (canRead) {
			switch (indexType) {
				case IndexFormat.UInt32:
					this._buffer = new Uint32Array(indexCount);
					break;
				case IndexFormat.UInt16:
					this._buffer = new Uint16Array(indexCount);
					break;
				case IndexFormat.UInt8:
					this._buffer = new Uint8Array(indexCount);
					break;
			}
		}
	}

	/**
	 * @en Sets the data for the index buffer.
	 * @param data The index data.
	 * @param bufferOffset The offset within the index buffer.
	 * @param dataStartIndex The offset within the data.
	 * @param dataCount The number of indices to set.
	 * @zh 设置索引缓冲区的数据。
	 * @param data 索引数据。
	 * @param bufferOffset 索引缓冲中的偏移。
	 * @param dataStartIndex 索引数据的偏移。
	 * @param dataCount 索引数据的数量。
	 */
	setData(data: any, bufferOffset: number = 0, dataStartIndex: number = 0, dataCount: number = 4294967295/*uint.MAX_VALUE*/): void {
		var byteCount: number = this._indexTypeByteCount;
		if (dataStartIndex !== 0 || dataCount !== 4294967295/*uint.MAX_VALUE*/) {
			switch (this._indexType) {
				case IndexFormat.UInt32:
					data = new Uint32Array(data.buffer, dataStartIndex * byteCount, dataCount);
					break;
				case IndexFormat.UInt16:
					data = new Uint16Array(data.buffer, dataStartIndex * byteCount, dataCount);
					break;
				case IndexFormat.UInt8:
					data = new Uint8Array(data.buffer, dataStartIndex * byteCount, dataCount);
					break;
			}
		}

		this._deviceBuffer._setIndexData(data, bufferOffset * byteCount);

		if (this._canRead) {
			if (bufferOffset !== 0 || dataStartIndex !== 0 || dataCount !== 4294967295/*uint.MAX_VALUE*/) {
				var maxLength: number = this._buffer.length - bufferOffset;
				if (dataCount > maxLength)
					dataCount = maxLength;
				if (typeof data == typeof this._buffer && data.length == dataCount)
					this._buffer.set(data, bufferOffset);
				else
					for (var i: number = 0; i < dataCount; i++)
						this._buffer[bufferOffset + i] = data[i];
			} else {
				this._buffer = data;
			}
		}
	}

	/**
	 * @en Gets the index data.
	 * @returns The index data.
	 * @zh 获取索引数据。
	 * @returns 返回索引数据。
	 */
	getData(): Uint16Array | Uint32Array {
		if (this._canRead)
			return <Uint16Array>this._buffer;
		else
		throw new NotReadableError();
	}

	/**
	 * @inheritDoc
	 * @override
	 * @en Destroys this IndexBuffer3D.
	 * @zh 销毁此索引缓冲。
	 */
	destroy(): void {
		this._deviceBuffer.destroy();
		this._buffer = null;
		this._byteLength = 0;
		this._indexCount = 0;
	}

}


