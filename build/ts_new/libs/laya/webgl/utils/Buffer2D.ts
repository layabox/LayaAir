import { LayaGL } from "../../layagl/LayaGL";
import { RenderInfo } from "../../renders/RenderInfo";
import { BaseShader } from "../shader/BaseShader";
import { WebGLContext } from "../WebGLContext";
import { Buffer } from "./Buffer";

export class Buffer2D extends Buffer {

	static FLOAT32: number = 4;
	static SHORT: number = 2;

	static __int__(gl: WebGLContext): void {
	}

	protected _maxsize: number = 0;

	_upload: boolean = true;
	protected _uploadSize: number = 0;
	protected _bufferSize: number = 0;
	protected _u8Array: Uint8Array = null;		//反正常常要拷贝老的数据，所以保留这个可以提高效率

	get bufferLength(): number {
		return this._buffer.byteLength;
	}

	set byteLength(value: number) {
		this.setByteLength(value);
	}

	setByteLength(value: number): void {
		if (this._byteLength !== value) {
			value <= this._bufferSize || (this._resizeBuffer(value * 2 + 256, true));
			this._byteLength = value;
		}
	}

	/**
	 * 在当前的基础上需要多大空间，单位是byte
	 * @param	sz
	 * @return  增加大小之前的写位置。单位是byte
	 */
	needSize(sz: number): number {
		var old: number = this._byteLength;
		if (sz) {
			var needsz: number = this._byteLength + sz;
			needsz <= this._bufferSize || (this._resizeBuffer(needsz << 1, true));
			this._byteLength = needsz;
		}
		return old;
	}

	constructor() {
		super();
	}

	protected _bufferData(): void {
		this._maxsize = Math.max(this._maxsize, this._byteLength);
		if (RenderInfo.loopCount % 30 == 0) {//每30帧缩小一下buffer	。TODO 这个有问题。不知道_maxsize和_byteLength是怎么维护的，这里会导致重新分配64字节
			if (this._buffer.byteLength > (this._maxsize + 64)) {
				//_setGPUMemory(_buffer.byteLength);
				this._buffer = this._buffer.slice(0, this._maxsize + 64);
				this._bufferSize = this._buffer.byteLength;
				this._checkArrayUse();
			}
			this._maxsize = this._byteLength;
		}
		if (this._uploadSize < this._buffer.byteLength) {
			this._uploadSize = this._buffer.byteLength;

			LayaGL.instance.bufferData(this._bufferType, this._uploadSize, this._bufferUsage);
			//_setGPUMemory(_uploadSize);
		}
		LayaGL.instance.bufferSubData(this._bufferType, 0, new Uint8Array(this._buffer, 0, this._byteLength));
	}

	//TODO:coverage
	protected _bufferSubData(offset: number = 0, dataStart: number = 0, dataLength: number = 0): void {
		this._maxsize = Math.max(this._maxsize, this._byteLength);
		if (RenderInfo.loopCount % 30 == 0) {
			if (this._buffer.byteLength > (this._maxsize + 64)) {
				//_setGPUMemory(_buffer.byteLength);
				this._buffer = this._buffer.slice(0, this._maxsize + 64);
				this._bufferSize = this._buffer.byteLength;
				this._checkArrayUse();
			}
			this._maxsize = this._byteLength;
		}

		if (this._uploadSize < this._buffer.byteLength) {
			this._uploadSize = this._buffer.byteLength;
			LayaGL.instance.bufferData(this._bufferType, this._uploadSize, this._bufferUsage);
			//_setGPUMemory(_uploadSize);
		}

		if (dataStart || dataLength) {
			var subBuffer: ArrayBuffer = this._buffer.slice(dataStart, dataLength);
			LayaGL.instance.bufferSubData(this._bufferType, offset, subBuffer);
		} else {
			LayaGL.instance.bufferSubData(this._bufferType, offset, this._buffer);
		}
	}

	/**
	 * buffer重新分配了，继承类根据需要做相应的处理。
	 */
	protected _checkArrayUse(): void {
	}

	/**
	 * 给vao使用的 _bind_upload函数。不要与已经绑定的判断是否相同
	 * @return
	 */
	_bind_uploadForVAO(): boolean {
		if (!this._upload)
			return false;
		this._upload = false;
		this._bindForVAO();
		this._bufferData();
		return true;
	}

	_bind_upload(): boolean {
		if (!this._upload)
			return false;
		this._upload = false;
		this.bind();
		this._bufferData();
		return true;
	}

	//TODO:coverage
	_bind_subUpload(offset: number = 0, dataStart: number = 0, dataLength: number = 0): boolean {
		if (!this._upload)
			return false;

		this._upload = false;
		this.bind();
		this._bufferSubData(offset, dataStart, dataLength);
		return true;
	}

	/**
	 * 重新分配buffer大小，如果nsz比原来的小则什么都不做。
	 * @param	nsz		buffer大小，单位是byte。
	 * @param	copy	是否拷贝原来的buffer的数据。
	 * @return
	 */
	_resizeBuffer(nsz: number, copy: boolean): Buffer2D //是否修改了长度
	{
		var buff: any = this._buffer;
		if (nsz <= buff.byteLength)
			return this;
		var u8buf: Uint8Array = this._u8Array;
		//_setGPUMemory(nsz);
		if (copy && buff && buff.byteLength > 0) {
			var newbuffer: ArrayBuffer = new ArrayBuffer(nsz);
			var oldU8Arr: Uint8Array = (u8buf && u8buf.buffer == buff) ? u8buf : new Uint8Array(buff);
			u8buf = this._u8Array = new Uint8Array(newbuffer);
			u8buf.set(oldU8Arr, 0);
			buff = this._buffer = newbuffer;
		} else {
			buff = this._buffer = new ArrayBuffer(nsz);
			this._u8Array = null;
		}
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
			this._resizeBuffer(this._byteLength + byteLen, true);
			n = new Uint8Array(this._buffer, this._byteLength);
		} else if (data instanceof Uint16Array) {
			this._resizeBuffer(this._byteLength + byteLen, true);
			n = new Uint16Array(this._buffer, this._byteLength);
		} else if (data instanceof Float32Array) {
			this._resizeBuffer(this._byteLength + byteLen, true);
			n = new Float32Array(this._buffer, this._byteLength);
		}
		n.set(data, 0);
		this._byteLength += byteLen;
		this._checkArrayUse();
	}

	/**
	 * 附加Uint16Array的数据。数据长度是len。byte的话要*2
	 * @param	data
	 * @param	len
	 */
	appendU16Array(data: Uint16Array, len: number): void {
		this._resizeBuffer(this._byteLength + len * 2, true);
		//(new Uint16Array(_buffer, _byteLength, len)).set(data.slice(0, len));
		//下面这种写法比上面的快多了
		var u: Uint16Array = new Uint16Array(this._buffer, this._byteLength, len);	//TODO 怎么能不用new
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
		this._byteLength += len * 2;
		this._checkArrayUse();
	}

	//TODO:coverage
	appendEx(data: any, type: new (buf:any, len:any) => any): void {
		this._upload = true;
		var byteLen: number, n: any;
		byteLen = data.byteLength;
		this._resizeBuffer(this._byteLength + byteLen, true);
		n = new type(this._buffer, this._byteLength);
		n.set(data, 0);
		this._byteLength += byteLen;
		this._checkArrayUse();
	}

	//TODO:coverage
	appendEx2(data: any, type: new (buff:any, len:any) => any, dataLen: number, perDataLen: number = 1): void {
		this._upload = true;
		var byteLen: number, n: any;
		byteLen = dataLen * perDataLen;
		this._resizeBuffer(this._byteLength + byteLen, true);
		n = new type(this._buffer, this._byteLength);
		var i: number;
		for (i = 0; i < dataLen; i++) {
			n[i] = data[i];
		}
		this._byteLength += byteLen;
		this._checkArrayUse();
	}


	//TODO:coverage
	getBuffer(): ArrayBuffer {
		return this._buffer;
	}

	setNeedUpload(): void {
		this._upload = true;
	}

	//TODO:coverage
	getNeedUpload(): boolean {
		return this._upload;
	}

	//TODO:coverage
	upload(): boolean {
		var gl:WebGLRenderingContext=LayaGL.instance;
		var scuess: boolean = this._bind_upload();
		gl.bindBuffer(this._bufferType, null);
		if (this._bufferType == gl.ARRAY_BUFFER) Buffer._bindedVertexBuffer = null;
		if (this._bufferType == gl.ELEMENT_ARRAY_BUFFER) Buffer._bindedIndexBuffer = null;
		BaseShader.activeShader = null
		return scuess;
	}

	//TODO:coverage
	subUpload(offset: number = 0, dataStart: number = 0, dataLength: number = 0): boolean {
		var gl:WebGLRenderingContext=LayaGL.instance;
		var scuess: boolean = this._bind_subUpload();
		gl.bindBuffer(this._bufferType, null);
		if (this._bufferType == gl.ARRAY_BUFFER) Buffer._bindedVertexBuffer = null;
		if (this._bufferType == gl.ELEMENT_ARRAY_BUFFER) Buffer._bindedIndexBuffer = null;
		BaseShader.activeShader = null
		return scuess;
	}

	protected _disposeResource(): void {
		this._upload = true;
		this._uploadSize = 0;
	}


	/**
	 * 清理数据。保留ArrayBuffer
	 */
	clear(): void {
		this._byteLength = 0;
		this._upload = true;
	}
}


