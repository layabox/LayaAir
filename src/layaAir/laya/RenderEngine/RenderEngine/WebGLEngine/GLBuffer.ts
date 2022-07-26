import { BufferTargetType, BufferUsage } from "../../RenderEnum/BufferTargetType";
import { IRenderBuffer } from "../../RenderInterface/IRenderBuffer";
import { GLObject } from "./GLObject";
import { WebGLEngine } from "./WebGLEngine";

export class GLBuffer extends GLObject implements IRenderBuffer {
    //GLParams
    _glBuffer: WebGLBuffer;
    _glTarget: number;
    _glUsage: number;
    //Common Enum
    _glTargetType: BufferTargetType;
    _glBufferUsageType: BufferUsage;
    //size
    _byteLength: number = 0;

    constructor(engine: WebGLEngine, targetType: BufferTargetType, bufferUsageType: BufferUsage) {
        super(engine)
        this._glTargetType = targetType;
        this._glBufferUsageType = bufferUsageType;
        this._getGLTarget(this._glTargetType);
        this._getGLUsage(this._glBufferUsageType);
        this._glBuffer = this._gl.createBuffer();
    }

    private _getGLUsage(usage: BufferUsage) {
        switch (usage) {
            case BufferUsage.Static:
                this._glUsage = this._gl.STATIC_DRAW;
                break;
            case BufferUsage.Dynamic:
                this._glUsage = this._gl.DYNAMIC_DRAW;
                break;
            case BufferUsage.Stream:
                this._glUsage = this._gl.STREAM_DRAW;
                break;
            default:
                console.error("usage is not standard");
                break;
        }
    }

    private _getGLTarget(target: BufferTargetType) {
        switch (target) {
            case BufferTargetType.ARRAY_BUFFER:
                this._glTarget = this._gl.ARRAY_BUFFER
                break;
            case BufferTargetType.UNIFORM_BUFFER:
                this._glTarget = (<WebGL2RenderingContext>this._gl).UNIFORM_BUFFER;
                break;
            case BufferTargetType.ELEMENT_ARRAY_BUFFER:
                this._glTarget = this._gl.ELEMENT_ARRAY_BUFFER
                break;
            default:
                break;
        }
    }


    bindBuffer(): boolean {
        if (this._engine._getbindBuffer(this._glTargetType) != this) {
            this._gl.bindBuffer(this._glTarget, this._glBuffer);
            this._engine._setbindBuffer(this._glTargetType, this);
            return true;
        }
        return false;
    }

    unbindBuffer() {
        if (this._engine._getbindBuffer(this._glTargetType) == this) {
            this._gl.bindBuffer(this._glTarget, null);
            this._engine._setbindBuffer(this._glTargetType, null);
        }
    }

    orphanStorage() {
        this.bindBuffer();
        this.setDataLength(this._byteLength);
    }

    setDataLength(srcData: number): void {
        let gl = this._gl;
        this.bindBuffer();
        this._byteLength = srcData;
        gl.bufferData(this._glTarget, this._byteLength, this._glUsage);
        this.unbindBuffer();
    }

    setData(srcData: ArrayBuffer | ArrayBufferView, offset: number): void {
        let gl = this._gl;
        this.bindBuffer();
        gl.bufferSubData(this._glTarget, offset, <ArrayBufferView>srcData);
        this.unbindBuffer();
    }
    setDataEx(srcData: ArrayBuffer | ArrayBufferView, offset: number, length: number): void {
        let gl = this._gl;
        this.bindBuffer();
        gl.bufferSubData(this._glTarget, offset, srcData as ArrayBufferView, 0, length);
        this.unbindBuffer();
    }
    // setData(srcData: ArrayBuffer | ArrayBufferView | number, offset?: number, length?: number): void {
    //     let gl = this._gl;
    //     this.bindBuffer();
    //     if (typeof srcData == "number") {
    //         this._byteLength = srcData as number;
    //         gl.bufferData(this._glTarget, this._byteLength, this._glUsage);
    //     }
    //     if (offset != undefined && length == undefined) {
    //         gl.bufferSubData(this._glTarget, offset, <ArrayBufferView>srcData);
    //     }
    //     if(offset != undefined && length != undefined) {
    //         gl.bufferSubData(this._glTarget, offset, srcData as ArrayBufferView, 0, length);
    //     }
    //     this.unbindBuffer();
    // }


    //TODO:
    bindBufferBase(glPointer: number) {
        if(this._engine._getBindUBOBuffer(glPointer)!=this){
            const gl = <WebGL2RenderingContext>this._gl;
            gl.bindBufferBase(this._glTarget, glPointer, this._glBuffer);
            this._engine._setBindUBOBuffer(glPointer,this);
        }
    }

    //TODO:
    bindBufferRange(glPointer: number, offset: number, byteCount: number) {
        const gl = <WebGL2RenderingContext>this._gl;
        gl.bindBufferRange(this._glTarget, glPointer, this._glBuffer, offset, byteCount);
    }

    resizeBuffer(dataLength: number) {
        this.bindBuffer();
        const gl = this._gl;
        this._byteLength = dataLength;
        gl.bufferData(this._glTarget, this._byteLength, this._glUsage);
    }

    destroy() {
        super.destroy();
        const gl = this._gl;
        gl.deleteBuffer(this._glBuffer);
        this._byteLength = 0;
        this._engine = null;
        this._glBuffer = null;
        this._glTarget = null;
        this._glUsage = null;
        this._gl = null;
    }
}