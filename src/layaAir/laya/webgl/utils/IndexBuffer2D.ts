import { LayaGL } from "../../layagl/LayaGL";
import { BufferTargetType, BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { Buffer } from "./Buffer";
import { Buffer2D } from "./Buffer2D";

export class IndexBuffer2D extends Buffer2D {
    static create: Function = function (bufferUsage: number = BufferUsage.Static): IndexBuffer2D {
        return new IndexBuffer2D(bufferUsage);
    }

    protected _uint16Array: Uint16Array;

    constructor(bufferUsage: number = BufferUsage.Static) {
        super(BufferTargetType.ELEMENT_ARRAY_BUFFER,bufferUsage);
        this._bufferUsage = bufferUsage;
        this._bufferType = LayaGL.instance.ELEMENT_ARRAY_BUFFER;
        this._buffer = new Uint8Array(8);
    }
    /**
     * @override
     */
    protected _checkArrayUse(): void {
        this._uint16Array && (this._uint16Array = new Uint16Array(this._buffer));
    }

    getUint16Array(): Uint16Array {
        return this._uint16Array || (this._uint16Array = new Uint16Array(this._buffer));
    }

    /**
     * @inheritDoc
     * @override
     */
    _bindForVAO(): void {
        var gl: WebGLRenderingContext = LayaGL.instance;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glBuffer);
    }

    // /**
    //  * @inheritDoc
    //  * @override
    //  */
    // bind(): boolean {
    //     if (Buffer._bindedIndexBuffer !== this._glBuffer) {
    //         var gl: WebGLRenderingContext = LayaGL.instance;
    //         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glBuffer);
    //         Buffer._bindedIndexBuffer = this._glBuffer;
    //         return true;
    //     }
    //     return false;
    // }

    destory(): void {
        this._uint16Array = null;
        this._buffer = null;
    }

    disposeResource(): void {
        this._disposeResource();
    }
}

