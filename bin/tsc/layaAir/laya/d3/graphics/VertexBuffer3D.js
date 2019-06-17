import { LayaGL } from "../../layagl/LayaGL";
import { WebGLContext } from "../../webgl/WebGLContext";
import { Buffer } from "../../webgl/utils/Buffer";
/**
 * <code>VertexBuffer3D</code> 类用于创建顶点缓冲。
 */
export class VertexBuffer3D extends Buffer {
    /**
     * 创建一个 <code>VertexBuffer3D,不建议开发者使用并用VertexBuffer3D.create()代替</code> 实例。
     * @param	vertexCount 顶点个数。
     * @param	bufferUsage VertexBuffer3D用途类型。
     * @param	canRead 是否可读。
     * @param   dateType 数据类型。
     */
    constructor(byteLength, bufferUsage, canRead = false, dateType = VertexBuffer3D.DATATYPE_FLOAT32ARRAY) {
        super();
        this._vertexCount = -1;
        this._bufferUsage = bufferUsage;
        this._bufferType = WebGLContext.ARRAY_BUFFER;
        this._canRead = canRead;
        this._dataType = dateType;
        this._byteLength = byteLength;
        this.bind();
        LayaGL.instance.bufferData(this._bufferType, this._byteLength, this._bufferUsage);
        if (canRead) {
            switch (dateType) {
                case VertexBuffer3D.DATATYPE_FLOAT32ARRAY:
                    this._buffer = new Float32Array(byteLength / 4);
                    break;
                case VertexBuffer3D.DATATYPE_UINT8ARRAY:
                    this._buffer = new Uint8Array(byteLength);
                    break;
            }
        }
    }
    /**
     * 获取顶点声明。
     */
    get vertexDeclaration() {
        return this._vertexDeclaration;
    }
    /**
     * 获取顶点声明。
     */
    set vertexDeclaration(value) {
        if (this._vertexDeclaration !== value) {
            this._vertexDeclaration = value;
            this._vertexCount = value ? this._byteLength / value.vertexStride : -1;
        }
    }
    /**
     * 获取顶点个数。
     *   @return	顶点个数。
     */
    get vertexCount() {
        return this._vertexCount;
    }
    /**
     * 获取是否可读。
     *   @return	是否可读。
     */
    get canRead() {
        return this._canRead;
    }
    /**
     * @inheritDoc
     */
    /*override*/ bind() {
        if (Buffer._bindedVertexBuffer !== this._glBuffer) {
            LayaGL.instance.bindBuffer(WebGLContext.ARRAY_BUFFER, this._glBuffer);
            Buffer._bindedVertexBuffer = this._glBuffer;
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * 设置数据。
     * @param	data 顶点数据。
     * @param	bufferOffset 顶点缓冲中的偏移。
     * @param	dataStartIndex 顶点数据的偏移。
     * @param	dataCount 顶点数据的数量。
     */
    setData(data, bufferOffset = 0, dataStartIndex = 0, dataCount = 4294967295 /*uint.MAX_VALUE*/) {
        this.bind();
        var needSubData = dataStartIndex !== 0 || dataCount !== 4294967295 /*uint.MAX_VALUE*/;
        if (needSubData) {
            switch (this._dataType) {
                case VertexBuffer3D.DATATYPE_FLOAT32ARRAY:
                    data = new Float32Array(data.buffer, dataStartIndex * 4, dataCount);
                    break;
                case VertexBuffer3D.DATATYPE_UINT8ARRAY:
                    data = new Uint8Array(data.buffer, dataStartIndex, dataCount);
                    break;
            }
        }
        switch (this._dataType) {
            case VertexBuffer3D.DATATYPE_FLOAT32ARRAY:
                LayaGL.instance.bufferSubData(this._bufferType, bufferOffset * 4, data);
                break;
            case VertexBuffer3D.DATATYPE_UINT8ARRAY:
                LayaGL.instance.bufferSubData(this._bufferType, bufferOffset, data);
                break;
        }
        if (this._canRead)
            this._buffer.set(data, bufferOffset);
    }
    /**
     * 获取顶点数据。
     * @return	顶点数据。
     */
    getData() {
        if (this._canRead)
            return this._buffer;
        else
            throw new Error("Can't read data from VertexBuffer with only write flag!");
    }
    /**
     * @inheritDoc
     */
    /*override*/ destroy() {
        super.destroy();
        this._buffer = null;
        this._vertexDeclaration = null;
    }
}
/**数据类型_Float32Array类型。*/
VertexBuffer3D.DATATYPE_FLOAT32ARRAY = 0;
/**数据类型_Uint8Array类型。*/
VertexBuffer3D.DATATYPE_UINT8ARRAY = 1;
