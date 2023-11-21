import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { LayaGL } from "../../../layagl/LayaGL";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";


export class NativeVertexBuffer3D extends VertexBuffer3D {


    _conchVertexBuffer3D:any = null;

    /**
     * 获取顶点声明。
     */
    get vertexDeclaration(): VertexDeclaration | null {
        return this._vertexDeclaration;
    }

    set vertexDeclaration(value: VertexDeclaration | null) {
        this._vertexDeclaration = value;
        this._conchVertexBuffer3D.setVertexDeclaration( this.serilizeVertexDeclaration(value) );
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

    get instanceBuffer(): boolean {
		return this._conchVertexBuffer3D._instanceBuffer;
	}

	set instanceBuffer(value: boolean) {
		this._conchVertexBuffer3D._instanceBuffer = value;
	}
    /**
     * 创建一个 <code>VertexBuffer3D</code> 实例。
     * @param	byteLength 字节长度。
     * @param	bufferUsage VertexBuffer3D用途类型。
     * @param	canRead 是否可读。
     */
    constructor(byteLength: number, bufferUsage: BufferUsage, canRead: boolean = false) {
        super(byteLength, bufferUsage, canRead);
        this._conchVertexBuffer3D = new (window as any).conchVertexBuffer3D( (LayaGL.renderEngine as any)._nativeObj,byteLength,bufferUsage,false);
        this._conchVertexBuffer3D.setGLBuffer(this._glBuffer);
    }
}