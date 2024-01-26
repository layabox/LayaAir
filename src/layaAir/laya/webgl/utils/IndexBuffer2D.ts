import { IndexBuffer } from "../../RenderEngine/IndexBuffer";
import { BufferTargetType, BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { Buffer2D } from "./Buffer2D";

export class IndexBuffer2D extends IndexBuffer {
    static create: Function = function (bufferUsage: number = BufferUsage.Static): IndexBuffer2D {
        return new IndexBuffer2D(bufferUsage);
    }

    protected _uint16Array: Uint16Array;
    buffer2D:Buffer2D;
    constructor(bufferUsage: number = BufferUsage.Static) {
        super(BufferTargetType.ELEMENT_ARRAY_BUFFER,bufferUsage);
        this.buffer2D = new Buffer2D(this);
        this._bufferUsage = bufferUsage;
        this._buffer = new Uint8Array(8);
    }
    /**
     * @override
     */
    // protected _checkArrayUse(): void {
    //     this._uint16Array && (this._uint16Array = new Uint16Array(this._buffer));
    // }

    // getUint16Array(): Uint16Array {
    //     return this._uint16Array || (this._uint16Array = new Uint16Array(this._buffer));
    // }

    /**
     * @inheritDoc
     * @override
     */
    _bindForVAO(): void {
        
        //this._glBuffer.bindBuffer()
    }

    destory(): void {
        this._uint16Array = null;
        this._buffer = null;
    }

    disposeResource(): void {
        this.buffer2D._disposeResource();
    }
}

