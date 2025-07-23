import { CommonMemoryAllocater } from "./CommonMemoryAllocater";

export class NativeMemory {
    static NativeSourceID: number = 0;
    /**@internal 共享内存数据 */
    public _buffer: ArrayBuffer;
    /**@internal 显示数据 */
    static _sharedBuffer: ArrayBuffer = new ArrayBuffer(256);
    /**@internal 显示数据 */
    protected _idata: Int32Array;
    protected _uidata: Uint32Array;
    protected _uint16data: Uint16Array;
    protected _fdata: Float32Array;
    protected _byteArray: Uint8Array;
    /**数据长度 */
    protected _byteLength: number;
    /**销毁标记 */
    protected _destroyed: boolean;
    /**数据资源 */
    protected _id: number;
    /**
     * 实例化一个共享内存
     * @param size byteLength
     */
    constructor(size: number, shared: boolean) {
        if (shared) {
            if (size > NativeMemory._sharedBuffer.byteLength) {
                throw new Error("NativeMemory:shared buffer not enough");
            }
            this._buffer = NativeMemory._sharedBuffer;
        }
        else {
            this._buffer = CommonMemoryAllocater.creatBlock(size);
        }
        this._byteLength = size;
    }

    /**
     * Float32Array Data
     */
    get float32Array(): Float32Array {
        if (!this._fdata) {
             this._fdata = new Float32Array(this._buffer);
        }
        return this._fdata;
    }
    /**
     * Uint8Array Data
     */
    get uint8Array(): Uint8Array {
        if (!this._byteArray) {
            this._byteArray = new Uint8Array(this._buffer);
        }
        return this._byteArray;
    }

    /**
     * Int32Array Data
     */
    get int32Array(): Int32Array {
        if (!this._idata) {
            this._idata = new Int32Array(this._buffer);
        }
        return this._idata;
    }

    get Uint32Array(): Uint32Array {
        if (!this._uidata) {
              this._uidata = new Uint32Array(this._buffer);
        }
        return this._uidata;
    }

    /**
     * Int32Array Data
     */
    get Uint16Array(): Uint16Array {
        if (!this._uint16data) {
            this._uint16data = new Uint16Array(this._buffer);
        }
        return this._uint16data;
    }


    /**
     * 删除
     * @returns 
     */
    destroy() {
        if (this._destroyed)
            return;
        this.clear();
        CommonMemoryAllocater.freeMemoryBlock(this._buffer);
        this._destroyed = true;
    }

    /**
     * 清楚
     */
    clear(): void {
        this._idata = null;
        this._fdata = null;
        this._uidata = null;
        this._uint16data = null;
        this._byteArray = null;
    }
}