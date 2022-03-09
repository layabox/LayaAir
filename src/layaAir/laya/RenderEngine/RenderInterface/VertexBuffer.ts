import { VertexDeclaration } from "../../d3/graphics/VertexDeclaration";
import { Buffer } from "../Buffer"
import { BufferTargetType, BufferUsage } from "../RenderEnum/BufferTargetType";
export class VertexBuffer extends Buffer{
    _instanceBuffer:boolean = false;
    /** @internal */
	_vertexDeclaration: VertexDeclaration|null = null;

    /**
	 * 获取顶点声明。
	 */
	get vertexDeclaration(): VertexDeclaration|null {
		return this._vertexDeclaration;
	}

	set vertexDeclaration(value: VertexDeclaration|null) {
		this._vertexDeclaration = value;
	}

    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage){
        super(targetType,bufferUsageType);
    }
}