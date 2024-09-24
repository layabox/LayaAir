import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferTargetType, BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { LayaGL } from "../../layagl/LayaGL";


/**
 * @en The `VertexBuffer3D` class is used to create vertex buffers. To create an instance of `VertexBuffer3D`, use `LayaGL.RenderOBJCreate.createIndexBuffer3D`.
 * @zh `VertexBuffer3D` 类用于创建顶点缓冲。要创建 `VertexBuffer3D` 的实例，请使用 `LayaGL.RenderOBJCreate.createIndexBuffer3D`。
 */
export class VertexBuffer3D {

	/** @internal */
	private _canRead: boolean;
	_byteLength: number;
	/**@internal */
	_deviceBuffer: IVertexBuffer;
	_buffer: Float32Array | Uint16Array | Uint8Array | Uint32Array;
	/** @internal */
	_float32Reader: Float32Array | null = null;

	bufferUsage:BufferUsage;

	/**
	 * @en The vertex declaration.
	 * @zh 顶点声明。
	 */
	get vertexDeclaration(): VertexDeclaration | null {
		return this._deviceBuffer.vertexDeclaration;
	}

	set vertexDeclaration(value: VertexDeclaration | null) {
		this._deviceBuffer.vertexDeclaration = value;
	}

	/**
	 * @en Whether this is an instance buffer.
	 * @zh 是否是实例缓冲区。
	 */
	get instanceBuffer(): boolean {
		return this._deviceBuffer.instanceBuffer;
	}

	set instanceBuffer(value: boolean) {
		this._deviceBuffer.instanceBuffer = value;
	}

	/**
	 * @en Whether the buffer is readable.
	 * @zh 缓冲区是否可读。
	 */
	get canRead(): boolean {
		return this._canRead;
	}

	/**
	 * @en Constructor method.
	 * @param byteLength The byte length of the buffer.
	 * @param bufferUsage The usage type of the VertexBuffer3D.
	 * @param canRead Whether the buffer is readable.
	 * @zh 构造方法。
	 * @param byteLength 字节长度。
	 * @param bufferUsage VertexBuffer3D用途类型。
	 * @param canRead 是否可读。
	 */
	constructor(byteLength: number, bufferUsage: BufferUsage, canRead: boolean = false) {
		//super(BufferTargetType.ARRAY_BUFFER, bufferUsage);
		this._deviceBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(bufferUsage);
		this._canRead = canRead;
		this._byteLength = byteLength;
		this._deviceBuffer.setDataLength(byteLength)
		this.bufferUsage = bufferUsage;
		if (this._canRead) {
			this._buffer = new Uint8Array(byteLength);
			this._float32Reader = new Float32Array(this._buffer.buffer);
		}
	}

	// /**
	//  * 剥离内存块存储。
	//  */
	// orphanStorage(): void {
	// 	this.bind();
	// 	this._glBuffer.setDataLength(this._byteLength);
	// }

	/**
	 * @en Sets the data for the vertex buffer.
	 * @param buffer The data to set.
	 * @param bufferOffset The offset within the vertex buffer, in bytes.
	 * @param dataStartIndex The starting index within the data, in bytes.
	 * @param dataCount The number of bytes to set.
	 * @zh 设置顶点缓冲区的数据。
	 * @param buffer 要设置的数据。
	 * @param bufferOffset 顶点缓冲中的偏移,以字节为单位。
	 * @param dataStartIndex 顶点数据的偏移,以字节为单位。
	 * @param dataCount 顶点数据的长度,以字节为单位。
	 */
	setData(buffer: ArrayBuffer, bufferOffset: number = 0, dataStartIndex: number = 0, dataCount: number = Number.MAX_SAFE_INTEGER): void {
		this._deviceBuffer.setData(buffer, bufferOffset, dataStartIndex, dataCount);
		var needSubData: boolean = dataStartIndex !== 0 || dataCount !== Number.MAX_SAFE_INTEGER;
		if (needSubData) {
			var subData: Uint8Array = new Uint8Array(buffer, dataStartIndex, dataCount);
			if (this._canRead)
				this._buffer.set(subData, bufferOffset);
		}
		else {
			if (this._canRead)
				this._buffer.set(new Uint8Array(buffer), bufferOffset);
		}
	}

	/**
	 * @en Gets the vertex data as a `Uint8Array`.
	 * @zh 以 `Uint8Array` 形式获取顶点数据。
	 */
	getUint8Data(): Uint8Array {
		if (this._canRead)
			return <Uint8Array>this._buffer;
		else
			throw new Error("Can't read data from VertexBuffer with only write flag!");
	}

	/**
	 * @ignore
	 * @en Gets the vertex data as a `Float32Array`, if the buffer is readable.
	 * @zh 如果缓冲区可读，以 `Float32Array` 形式获取顶点数据。
	 */
	getFloat32Data(): Float32Array | null {
		if (this._canRead)
			return this._float32Reader;
		else
			throw new Error("Can't read data from VertexBuffer with only write flag!");
	}

	/**
	 * @ignore
	 * @en Marks the buffer as unreadable and releases the data.
	 * @zh 将缓冲区标记为不可读并释放数据。
	 */
	markAsUnreadbale(): void {
		this._canRead = false;
		this._buffer = null;
		this._float32Reader = null;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @en Destroys the vertex buffer and releases the resources.
	 * @zh 销毁顶点缓冲区并释放资源。
	 */
	destroy(): void {
		this._deviceBuffer.destroy();
		this._buffer = null;
		this._float32Reader = null;
		this._byteLength = 0;
	}
}




