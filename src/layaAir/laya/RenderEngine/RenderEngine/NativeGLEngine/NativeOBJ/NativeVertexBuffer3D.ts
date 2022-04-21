import { VertexBuffer3D } from "../../../../d3/graphics/VertexBuffer3D";
import { BufferUsage } from "../../../RenderEnum/BufferTargetType";
import { VertexDeclaration } from "../../../VertexDeclaration";

export class NativeVertexBuffer3D extends VertexBuffer3D {
    /**
     * 获取顶点声明。
     */
    get vertexDeclaration(): VertexDeclaration | null {
        return this._vertexDeclaration;
    }

    set vertexDeclaration(value: VertexDeclaration | null) {
        this.serilizeVertexDeclaration(value);
        this._vertexDeclaration = value;
    }

    serilizeVertexDeclaration(value: VertexDeclaration): Int32Array {
        let array = new Int32Array(value._vertexElements.length * 6);
        let offset = 0;
        var valueData: any = value._shaderValues;
        for (var k in valueData) {
            var loc: number = parseInt(k);
            var attribute: Int32Array = valueData[k];
            array[offset++] = loc;
            array.set(attribute, offset);
            offset += 5;
        }
        return array;
    }


    /**
     * 创建一个 <code>VertexBuffer3D</code> 实例。
     * @param	byteLength 字节长度。
     * @param	bufferUsage VertexBuffer3D用途类型。
     * @param	canRead 是否可读。
     */
    constructor(byteLength: number, bufferUsage: BufferUsage, canRead: boolean = false) {
        super(byteLength, bufferUsage, canRead);
        //Native init
    }
}