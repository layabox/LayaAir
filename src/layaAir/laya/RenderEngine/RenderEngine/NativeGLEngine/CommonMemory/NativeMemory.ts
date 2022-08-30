import { CommonMemoryAllocater } from "./CommonMemoryAllocater";

export class NativeMemory {
    static NativeSourceID:number = 0;
    /**@internal 共享内存数据 */
    public _buffer: ArrayBuffer;
    /**@internal 显示数据 */
    static  _sharedBuffer: ArrayBuffer = new ArrayBuffer(64);
    /**@internal 显示数据 */
    protected _idata:Int32Array;
    protected _fdata:Float32Array;
    protected _f64data:Float64Array;
    protected _byteArray:Uint8Array;
    /**数据长度 */
    protected _byteLength: number;
    /**销毁标记 */
    protected _destroyed: boolean;
    /**数据资源 */
    protected _id:number;
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
        this._idata = new Int32Array(this._buffer);
        this._fdata = new Float32Array(this._buffer);
        this._f64data = new Float64Array(this._buffer);
        this._byteArray = new Uint8Array(this._buffer);
        this._byteLength = size;
    }

    /**
     * Float32Array Data
     */
    get float32Array(): Float32Array {
        return  this._fdata;
    }

    get float64Array(): Float64Array {
        return  this._f64data;
    }
    /**
     * Uint16Array Data
     */
    /*get uint16Array(): Uint16Array {
        if (!(this._bufferData instanceof Uint16Array))
            this._bufferData = new Uint16Array(this._buffer);
        return <Uint16Array>this._bufferData;
    }*/

    /**
     * Uint8Array Data
     */
    get uint8Array(): Uint8Array {
        return this._byteArray;
    }

    /**
     * Int32Array Data
     */
    get int32Array(): Int32Array {
        return this._idata;
    }

    /**
     * 设置数据
     * @param data 数据
     * @param stride 字节偏移
     * //TODO 字节对齐
     */
    /*setData(data:Uint8Array|Uint16Array|Uint32Array|Int32Array|Float32Array,stride:number):void{
        if(data instanceof Uint8Array){
           this.uint8Array.set(data,stride/2);
            return;
        }
        else if(data instanceof Uint16Array){
           this.uint16Array.set(data,stride/2);
            return;
        }else{
           this.float32Array.set(data,stride/4);
            return;
        }
    }*/

    /**
     * 设置多个参数
     * @param offset 
     * @param args 
     * 考虑字节对齐
     */
    /*setDataByParams(offset:number,...args: number[]):void{
        if(args)
        {
            for(let i=0,n:number=args.length;i<n;i++)
            this._bufferData[i+offset]=args[i];
        }
    }*/

    /**
     * 扩充buffer
     * @param size 
     * @returns 
     */
    /*expand(size: number) {
        if(size<=this._byteLength)
            return;
        this._byteLength = size;
        CommonMemoryAllocater.freeMemoryBlock(this._buffer);
        this.clear();
        this._buffer = CommonMemoryAllocater.creatBlock(size);
    }*/

    /**
     * 删除
     * @returns 
     */
    destroy() {
        if(this._destroyed)
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
        this._byteArray = null;
    }
}