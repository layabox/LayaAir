import { IndexBuffer } from "../../RenderEngine/IndexBuffer";
import { BufferTargetType, BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
/**
 * @internal
 * 请使用LayaGL.RenderOBJCreate.createIndexBuffer3D来创建
 * <code>IndexBuffer3D</code> 类用于创建索引缓冲。
 */
export class IndexBuffer3D extends IndexBuffer {
	/** @internal */
	private _canRead: boolean;

	/**
	 * 索引类型。
	 */
	get indexType(): IndexFormat {
		return this._indexType;
	}

	/**
	 * 索引类型字节数量。
	 */
	get indexTypeByteCount(): number {
		return this._indexTypeByteCount;
	}

	/**
	 * 索引个数。
	 */
	get indexCount(): number {
		return this._indexCount;
	}

	/**
	 * 是否可读。
	 */
	get canRead(): boolean {
		return this._canRead;
	}

	/**
	 * 创建一个 <code>IndexBuffer3D,不建议开发者使用并用IndexBuffer3D.create()代替</code> 实例。
	 * @param	indexType 索引类型。
	 * @param	indexCount 索引个数。
	 * @param	bufferUsage IndexBuffer3D用途类型。
	 * @param	canRead 是否可读。
	 */
	constructor(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage = BufferUsage.Static, canRead: boolean = false) {
		super(BufferTargetType.ELEMENT_ARRAY_BUFFER, bufferUsage);
		this._indexType = indexType;
		this._indexCount = indexCount;

		this._canRead = canRead;

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
				throw new Error("unidentification index type.");
		}
		var byteLength: number = this._indexTypeByteCount * indexCount;
		this._byteLength = byteLength;
		this._setIndexData(byteLength);
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
	 * 设置数据。
	 * @param	data 索引数据。
	 * @param	bufferOffset 索引缓冲中的偏移。
	 * @param	dataStartIndex 索引数据的偏移。
	 * @param	dataCount 索引数据的数量。
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

		this._setIndexData(data, bufferOffset * byteCount);

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
	 * 获取索引数据。
	 * @return	索引数据。
	 */
	getData(): Uint16Array {
		if (this._canRead)
			return <Uint16Array>this._buffer;
		else
			throw new Error("Can't read data from VertexBuffer with only write flag!");
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	destroy(): void {
		super.destroy();
		this._buffer = null;
		this._byteLength = 0;
		this._indexCount = 0;
	}

}


