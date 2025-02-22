import { RenderInfo } from "../../renders/RenderInfo";
import { BaseShader } from "../shader/BaseShader";
import { Buffer } from "../../RenderEngine/Buffer";

export class Buffer2D {

    static FLOAT32: number = 4;
    static SHORT: number = 2;

    protected _maxsize: number = 0;

    _upload: boolean = true;
    protected _uploadSize: number = 0;
    protected _bufferSize: number = 0;
    protected _u8Array: Uint8Array = null;		//反正常常要拷贝老的数据，所以保留这个可以提高效率
    _floatArray32: Float32Array;
    _uint32Array: Uint32Array;
    _uint16Array: Uint16Array;

    private constBuffer: Buffer;

    get bufferLength(): number {
        return this.constBuffer._buffer.byteLength;
    }

    set byteLength(value: number) {
        this.setByteLength(value);
    }

    setByteLength(value: number): void {
        if (this.constBuffer._byteLength !== value) {
            value <= this._bufferSize || (this._resizeBuffer(value * 2 + 256, true));
            this.constBuffer._byteLength = value;
        }
    }

    /**
     * 在当前的基础上需要多大空间，单位是byte
     * @param sz
     * @return  增加大小之前的写位置。单位是byte
     */
    needSize(sz: number): number {
        var old: number = this.constBuffer._byteLength;
        if (sz) {
            var needsz: number = this.constBuffer._byteLength + sz;
            needsz <= this._bufferSize || (this._resizeBuffer(needsz << 1, true));
            this.constBuffer._byteLength = needsz;
        }
        return old;
    }

    constructor(buffer: Buffer) {
        this.constBuffer = buffer;
    }

    getFloat32Array(): Float32Array {
        if (!this._floatArray32) {
            this._floatArray32 = new Float32Array(this.constBuffer._buffer.buffer);
        }
        return this._floatArray32;
    }

    protected _bufferData(): void {
        this._maxsize = Math.max(this._maxsize, this.constBuffer._byteLength);
        if (RenderInfo.loopCount % 30 == 0) {//每30帧缩小一下buffer	。TODO 这个有问题。不知道_maxsize和_byteLength是怎么维护的，这里会导致重新分配64字节
            if (this.constBuffer._buffer.byteLength > (this._maxsize + 64)) {
                //_setGPUMemory(_buffer.byteLength);
                this.constBuffer._buffer = this.constBuffer._buffer.slice(0, this._maxsize + 64);
                this._bufferSize = this.constBuffer._buffer.byteLength;
                this._checkArrayUse();
                let buff = this.constBuffer._buffer.buffer;
                ((this._bufferSize % 4) == 0) && (this._floatArray32 = new Float32Array(buff));
                ((this._bufferSize % 4) == 0) && (this._uint32Array = new Uint32Array(buff));
                this._uint16Array = new Uint16Array(buff);
            }
            this._maxsize = this.constBuffer._byteLength;
        }
        if (this._uploadSize < this.constBuffer._buffer.byteLength) {
            this._uploadSize = this.constBuffer._buffer.byteLength;

            this.constBuffer._glBuffer.setDataLength(this._uploadSize);
        }
        this.constBuffer._glBuffer.setData(new Uint8Array(this.constBuffer._buffer.buffer, 0, this.constBuffer._byteLength), 0);
        this.constBuffer.unbind();
    }

    //TODO:coverage
    protected _bufferSubData(offset: number = 0, dataStart: number = 0, dataLength: number = 0): void {
        this._maxsize = Math.max(this._maxsize, this.constBuffer._byteLength);
        if (RenderInfo.loopCount % 30 == 0) {
            if (this.constBuffer._buffer.byteLength > (this._maxsize + 64)) {
                //_setGPUMemory(_buffer.byteLength);
                this.constBuffer._buffer = this.constBuffer._buffer.slice(0, this._maxsize + 64);
                this._bufferSize = this.constBuffer._buffer.byteLength;
                this._checkArrayUse();
            }
            this._maxsize = this.constBuffer._byteLength;
        }

        if (this._uploadSize < this.constBuffer._buffer.byteLength) {
            this._uploadSize = this.constBuffer._buffer.byteLength;
            this.constBuffer._glBuffer.setDataLength(this._uploadSize);
            //_setGPUMemory(_uploadSize);
        }

        if (dataStart || dataLength) {
            var subBuffer: ArrayBuffer = this.constBuffer._buffer.buffer.slice(dataStart, dataLength);
            this.constBuffer._glBuffer.setData(subBuffer, offset);
        } else {
            this.constBuffer._glBuffer.setData(this.constBuffer._buffer.buffer, offset);
        }
    }

    /**
     * buffer重新分配了，继承类根据需要做相应的处理。
     */
    protected _checkArrayUse(): void {

    }

    // /**
    //  * 给vao使用的 _bind_upload函数。不要与已经绑定的判断是否相同
    //  * @return
    //  */
    // _bind_uploadForVAO(): boolean {
    // 	if (!this._upload)
    // 		return false;
    // 	this._upload = false;
    // 	this.constBuffer.bind();
    // 	this._bufferData();
    // 	return true;
    // }

    _bind_upload(): boolean {
        if (!this._upload)
            return false;
        this._upload = false;
        this.constBuffer.bind();
        this._bufferData();
        return true;
    }

    //TODO:coverage
    _bind_subUpload(offset: number = 0, dataStart: number = 0, dataLength: number = 0): boolean {
        if (!this._upload)
            return false;

        this._upload = false;
        this.constBuffer.bind();
        this._bufferSubData(offset, dataStart, dataLength);
        return true;
    }

    /**
     * 重新分配buffer大小，如果nsz比原来的小则什么都不做。
     * @param nsz		buffer大小，单位是byte。
     * @param copy	是否拷贝原来的buffer的数据。
     * @return
     */
    _resizeBuffer(nsz: number, copy: boolean): Buffer2D //是否修改了长度
    {
        var buff: any = this.constBuffer._buffer;
        if (buff && nsz <= buff.byteLength)
            return this;
        var u8buf: Uint8Array = this._u8Array;
        //_setGPUMemory(nsz);
        if (copy && buff && buff.byteLength > 0) {
            var oldU8Arr: Uint8Array = new Uint8Array(buff.buffer);
            var newbuffer: Uint8Array = new Uint8Array(nsz);
            newbuffer.set(oldU8Arr, 0);
            buff = this.constBuffer._buffer = newbuffer;
            this._u8Array = new Uint8Array(this.constBuffer._buffer.buffer);
        } else {
            var data = new ArrayBuffer(nsz);
            buff = this.constBuffer._buffer = new Uint8Array(data);
            this._u8Array = new Uint8Array(buff.buffer);
        }
        buff = this.constBuffer._buffer.buffer;
        ((nsz % 4) == 0) && (this._floatArray32 = new Float32Array(buff));
        ((nsz % 4) == 0) && (this._uint32Array = new Uint32Array(buff));
        this._uint16Array = new Uint16Array(buff);
        this._checkArrayUse();
        this._upload = true;
        this._bufferSize = buff.byteLength;
        return this;
    }

    append(data: any): void {
        this._upload = true;
        var byteLen: number, n: any;
        byteLen = data.byteLength;
        if (data instanceof Uint8Array) {
            this._resizeBuffer(this.constBuffer._byteLength + byteLen, true);
            n = new Uint8Array(this.constBuffer._buffer.buffer, this.constBuffer._byteLength);
        } else if (data instanceof Uint16Array) {
            this._resizeBuffer(this.constBuffer._byteLength + byteLen, true);
            n = new Uint16Array(this.constBuffer._buffer.buffer, this.constBuffer._byteLength);
        } else if (data instanceof Float32Array) {
            this._resizeBuffer(this.constBuffer._byteLength + byteLen, true);
            n = new Float32Array(this.constBuffer._buffer.buffer, this.constBuffer._byteLength);
        }
        n.set(data, 0);
        this.constBuffer._byteLength += byteLen;
        this._checkArrayUse();
    }

    /**
     * 附加Uint16Array的数据。数据长度是len。byte的话要*2
     * @param data
     * @param len
     */
    appendU16Array(data: Uint16Array, len: number): void {
        this._resizeBuffer(this.constBuffer._byteLength + len * 2, true);
        //(new Uint16Array(_buffer, _byteLength, len)).set(data.slice(0, len));
        //下面这种写法比上面的快多了
        var u: Uint16Array = new Uint16Array(this.constBuffer._buffer.buffer, this.constBuffer._byteLength, len);	//TODO 怎么能不用new
        if (len == 6) {
            u[0] = data[0]; u[1] = data[1]; u[2] = data[2];
            u[3] = data[3]; u[4] = data[4]; u[5] = data[5];
        } else if (len >= 100) {
            u.set(new Uint16Array(data.buffer, 0, len));
        } else {
            for (var i: number = 0; i < len; i++) {
                u[i] = data[i];
            }
        }
        this.constBuffer._byteLength += len * 2;
        this._checkArrayUse();
    }

    //TODO:coverage
    getBuffer(): ArrayBuffer {
        return this.constBuffer._buffer.buffer;
    }

    setNeedUpload(): void {
        this._upload = true;
    }


    //TODO:coverage
    subUpload(offset: number = 0, dataStart: number = 0, dataLength: number = 0): boolean {
        var scuess: boolean = this._bind_subUpload();
        this.constBuffer.unbind();
        //gl.bindBuffer(this._bufferType, null);
        //if (this._bufferType == gl.ARRAY_BUFFER) Buffer._bindedVertexBuffer = null;
        //if (this._bufferType == gl.ELEMENT_ARRAY_BUFFER) Buffer._bindedIndexBuffer = null;
        BaseShader.activeShader = null
        return scuess;
    }

    _disposeResource(): void {
        this._upload = true;
        this._uploadSize = 0;
        this._floatArray32 = null;
        this._uint32Array = null;
        this._u8Array = null;
    }


    /**
     * 清理数据。保留ArrayBuffer
     */
    clear(): void {
        this.constBuffer._byteLength = 0;
        this._upload = true;
    }
}



