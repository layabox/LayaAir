import { LayaGL } from "../../layagl/LayaGL";
import { BufferStateBase } from "../../webgl/BufferStateBase";
import { WebGLContext } from "../../webgl/WebGLContext";
import { Buffer } from "../../webgl/utils/Buffer";
/**
 * <code>IndexBuffer3D</code> 类用于创建索引缓冲。
 */
export class IndexBuffer3D extends Buffer {
    /**
     * 创建一个 <code>IndexBuffer3D,不建议开发者使用并用IndexBuffer3D.create()代替</code> 实例。
     * @param	indexType 索引类型。
     * @param	indexCount 索引个数。
     * @param	bufferUsage IndexBuffer3D用途类型。
     * @param	canRead 是否可读。
     */
    constructor(indexType, indexCount, bufferUsage = 0x88E4 /*WebGLContext.STATIC_DRAW*/, canRead = false) {
        super();
        this._indexType = indexType;
        this._indexCount = indexCount;
        this._bufferUsage = bufferUsage;
        this._bufferType = WebGLContext.ELEMENT_ARRAY_BUFFER;
        this._canRead = canRead;
        var byteLength;
        if (indexType == IndexBuffer3D.INDEXTYPE_USHORT)
            this._indexTypeByteCount = 2;
        else if (indexType == IndexBuffer3D.INDEXTYPE_UBYTE)
            this._indexTypeByteCount = 1;
        else
            throw new Error("unidentification index type.");
        byteLength = this._indexTypeByteCount * indexCount;
        this._byteLength = byteLength;
        var curBufSta = BufferStateBase._curBindedBufferState;
        if (curBufSta) {
            if (curBufSta._bindedIndexBuffer === this) {
                LayaGL.instance.bufferData(this._bufferType, byteLength, this._bufferUsage);
            }
            else {
                curBufSta.unBind(); //避免影响VAO
                this.bind();
                LayaGL.instance.bufferData(this._bufferType, byteLength, this._bufferUsage);
                curBufSta.bind();
            }
        }
        else {
            this.bind();
            LayaGL.instance.bufferData(this._bufferType, byteLength, this._bufferUsage);
        }
        if (canRead) {
            if (indexType == IndexBuffer3D.INDEXTYPE_USHORT)
                this._buffer = new Uint16Array(indexCount);
            else if (indexType == IndexBuffer3D.INDEXTYPE_UBYTE)
                this._buffer = new Uint8Array(indexCount);
        }
    }
    /**
     * 获取索引类型。
     *   @return	索引类型。
     */
    get indexType() {
        return this._indexType;
    }
    /**
     * 获取索引类型字节数量。
     *   @return	索引类型字节数量。
     */
    get indexTypeByteCount() {
        return this._indexTypeByteCount;
    }
    /**
     * 获取索引个数。
     *   @return	索引个数。
     */
    get indexCount() {
        return this._indexCount;
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
    /*override*/ _bindForVAO() {
        if (BufferStateBase._curBindedBufferState) {
            LayaGL.instance.bindBuffer(WebGLContext.ELEMENT_ARRAY_BUFFER, this._glBuffer);
        }
        else {
            throw "IndexBuffer3D: must bind current BufferState.";
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ bind() {
        if (BufferStateBase._curBindedBufferState) {
            throw "IndexBuffer3D: must unbind current BufferState.";
        }
        else {
            if (Buffer._bindedIndexBuffer !== this._glBuffer) {
                LayaGL.instance.bindBuffer(WebGLContext.ELEMENT_ARRAY_BUFFER, this._glBuffer);
                Buffer._bindedIndexBuffer = this._glBuffer;
                return true;
            }
            else {
                return false;
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
    setData(data, bufferOffset = 0, dataStartIndex = 0, dataCount = 4294967295 /*uint.MAX_VALUE*/) {
        var byteCount;
        if (this._indexType == IndexBuffer3D.INDEXTYPE_USHORT) {
            byteCount = 2;
            if (dataStartIndex !== 0 || dataCount !== 4294967295 /*uint.MAX_VALUE*/)
                data = new Uint16Array(data.buffer, dataStartIndex * byteCount, dataCount);
        }
        else if (this._indexType == IndexBuffer3D.INDEXTYPE_UBYTE) {
            byteCount = 1;
            if (dataStartIndex !== 0 || dataCount !== 4294967295 /*uint.MAX_VALUE*/)
                data = new Uint8Array(data.buffer, dataStartIndex * byteCount, dataCount);
        }
        var curBufSta = BufferStateBase._curBindedBufferState;
        if (curBufSta) {
            if (curBufSta._bindedIndexBuffer === this) {
                LayaGL.instance.bufferSubData(this._bufferType, bufferOffset * byteCount, data); //offset==0情况下，某些特殊设备或情况下直接bufferData速度是否优于bufferSubData
            }
            else {
                curBufSta.unBind(); //避免影响VAO
                this.bind();
                LayaGL.instance.bufferSubData(this._bufferType, bufferOffset * byteCount, data);
                curBufSta.bind();
            }
        }
        else {
            this.bind();
            LayaGL.instance.bufferSubData(this._bufferType, bufferOffset * byteCount, data);
        }
        if (this._canRead) {
            if (bufferOffset !== 0 || dataStartIndex !== 0 || dataCount !== 4294967295 /*uint.MAX_VALUE*/) {
                var maxLength = this._buffer.length - bufferOffset;
                if (dataCount > maxLength)
                    dataCount = maxLength;
                for (var i = 0; i < dataCount; i++)
                    this._buffer[bufferOffset + i] = data[i];
            }
            else {
                this._buffer = data;
            }
        }
    }
    /**
     * 获取索引数据。
     *   @return	索引数据。
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
    }
}
/** 8位ubyte无符号索引类型。*/
IndexBuffer3D.INDEXTYPE_UBYTE = "ubyte";
/** 16位ushort无符号索引类型。*/
IndexBuffer3D.INDEXTYPE_USHORT = "ushort";
