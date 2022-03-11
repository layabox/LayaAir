import { Buffer2D } from "./Buffer2D";
import { LayaGL } from "../../layagl/LayaGL"
import { BufferTargetType, BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";

export class VertexBuffer2D extends Buffer2D {
    static create: Function = function (vertexStride: number, bufferUsage: number = BufferUsage.Dynamic): VertexBuffer2D {
        return new VertexBuffer2D(vertexStride, bufferUsage);
    }

    _floatArray32: Float32Array;
    _uint32Array: Uint32Array;

    private _vertexStride: number;

    get vertexStride(): number {
        return this._vertexStride;
    }

    constructor(vertexStride: number, bufferUsage: number) {
        super(BufferTargetType.ARRAY_BUFFER,bufferUsage);
        this._vertexStride = vertexStride;
        this._bufferUsage = bufferUsage;
        this._buffer = new Uint8Array(8);
        this._floatArray32 = new Float32Array(this._buffer);
        this._uint32Array = new Uint32Array(this._buffer);
    }

    getFloat32Array(): Float32Array {
        return this._floatArray32;
    }

    /**
     * 在当前位置插入float数组。
     * @param	data
     * @param	pos
     */
    appendArray(data: any[]): void {
        var oldoff: number = this._byteLength >> 2;
        this.setByteLength(this._byteLength + data.length * 4);
        var vbdata: Float32Array = this.getFloat32Array();
        vbdata.set(data, oldoff);
        this._upload = true;
    }
		/**
		 * @override
		 */
		/*override*/ protected _checkArrayUse(): void {
        this._floatArray32 && (this._floatArray32 = new Float32Array(this._buffer));
        this._uint32Array && (this._uint32Array = new Uint32Array(this._buffer));
    }

    //只删除buffer，不disableVertexAttribArray
    deleteBuffer(): void {
        super._disposeResource();
    }

		/**
		 * @inheritDoc
		 * @override
		 */
		/*override*/  _bindForVAO(): void {
        this._glBuffer.bindBuffer();
    }
    /**
     * @override
     * override
     */
    destroy(): void {
        super.destroy();
        this._byteLength = 0;
        this._upload = true;
        this._buffer = null;
        this._floatArray32 = null;
    }

}


