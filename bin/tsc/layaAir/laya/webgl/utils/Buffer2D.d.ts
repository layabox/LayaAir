import { WebGLContext } from "../WebGLContext";
import { Buffer } from "./Buffer";
export declare class Buffer2D extends Buffer {
    static FLOAT32: number;
    static SHORT: number;
    static __int__(gl: WebGLContext): void;
    protected _maxsize: number;
    _upload: boolean;
    protected _uploadSize: number;
    protected _bufferSize: number;
    protected _u8Array: Uint8Array;
    readonly bufferLength: number;
    byteLength: number;
    setByteLength(value: number): void;
    /**
     * 在当前的基础上需要多大空间，单位是byte
     * @param	sz
     * @return  增加大小之前的写位置。单位是byte
     */
    needSize(sz: number): number;
    constructor();
    protected _bufferData(): void;
    protected _bufferSubData(offset?: number, dataStart?: number, dataLength?: number): void;
    /**
     * buffer重新分配了，继承类根据需要做相应的处理。
     */
    protected _checkArrayUse(): void;
    /**
     * 给vao使用的 _bind_upload函数。不要与已经绑定的判断是否相同
     * @return
     */
    _bind_uploadForVAO(): boolean;
    _bind_upload(): boolean;
    _bind_subUpload(offset?: number, dataStart?: number, dataLength?: number): boolean;
    /**
     * 重新分配buffer大小，如果nsz比原来的小则什么都不做。
     * @param	nsz		buffer大小，单位是byte。
     * @param	copy	是否拷贝原来的buffer的数据。
     * @return
     */
    _resizeBuffer(nsz: number, copy: boolean): Buffer2D;
    append(data: any): void;
    /**
     * 附加Uint16Array的数据。数据长度是len。byte的话要*2
     * @param	data
     * @param	len
     */
    appendU16Array(data: Uint16Array, len: number): void;
    appendEx(data: any, type: new (buf: any, len: any) => any): void;
    appendEx2(data: any, type: new (buff: any, len: any) => any, dataLen: number, perDataLen?: number): void;
    getBuffer(): ArrayBuffer;
    setNeedUpload(): void;
    getNeedUpload(): boolean;
    upload(): boolean;
    subUpload(offset?: number, dataStart?: number, dataLength?: number): boolean;
    protected _disposeResource(): void;
    /**
     * 清理数据。保留ArrayBuffer
     */
    clear(): void;
}
