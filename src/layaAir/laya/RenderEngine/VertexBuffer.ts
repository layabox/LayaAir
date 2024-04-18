import { BufferTargetType, BufferUsage } from "./RenderEnum/BufferTargetType";
import { Buffer } from "./Buffer";
import { VertexDeclaration } from "./VertexDeclaration";

export class VertexBuffer extends Buffer {
	private _instanceBuffer: boolean = false;
	/** @internal */
	_vertexDeclaration: VertexDeclaration | null = null;
	_buffer: Float32Array|Uint16Array|Uint8Array|Uint32Array;
	/**
	 * 获取顶点声明。
	 */
	get vertexDeclaration(): VertexDeclaration | null {
		return this._vertexDeclaration;
	}

	set vertexDeclaration(value: VertexDeclaration | null) {
		this._vertexDeclaration = value;
	}
	get instanceBuffer(): boolean {
		return this._instanceBuffer;
	}

	set instanceBuffer(value: boolean) {
		this._instanceBuffer = value;
	}
	constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage) {
		super(targetType, bufferUsageType);
	}
}