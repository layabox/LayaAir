import { LayaGL } from "../../../../layagl/LayaGL";
import { StatisticsElement } from "../../../../layagl/StatisticsContext";
import { BufferTargetType, BufferUsage } from "../../../../RenderEngine/RenderEnum/BufferTargetType";
import { WebGLEngine } from "../WebGLEngine";
import { GLObject } from "./GLObject";


export class GLBuffer extends GLObject {
    //GLParams
    _glBuffer: WebGLBuffer;
    _glTarget: number;
    _glUsage: number;
    //Common Enum
    _glTargetType: BufferTargetType;
    _glBufferUsageType: BufferUsage;
    private _statistics_M_Buffer: StatisticsElement;
    private _statistics_RC_Buffer: StatisticsElement;
    //size
    _byteLength: number = 0;

    constructor(engine: WebGLEngine, targetType: BufferTargetType, bufferUsageType: BufferUsage) {
        super(engine)
        this._glTargetType = targetType;
        this._glBufferUsageType = bufferUsageType;
        this._getGLTarget(this._glTargetType);
        this._getGLUsage(this._glBufferUsageType);
        this._glBuffer = this._gl.createBuffer();

        switch (targetType) {
            case BufferTargetType.ARRAY_BUFFER:
                this._statistics_M_Buffer = StatisticsElement.M_VertexBuffer;
                this._statistics_RC_Buffer = StatisticsElement.C_VertexBuffer;
                break;
            case BufferTargetType.ELEMENT_ARRAY_BUFFER:
                this._statistics_M_Buffer = StatisticsElement.M_IndexBuffer;
                this._statistics_RC_Buffer = StatisticsElement.C_IndexBuffer;
                break;
            case BufferTargetType.UNIFORM_BUFFER:
                this._statistics_M_Buffer = StatisticsElement.M_UBOBuffer;
                this._statistics_RC_Buffer = StatisticsElement.C_UBOBuffer;
                break;
        }
        LayaGL.statAgent.recordCountData(StatisticsElement.C_GPUBuffer, 1);
        LayaGL.statAgent.recordCountData(this._statistics_RC_Buffer, 1);
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

    private _memorychange(bytelength: number) {
        LayaGL.statAgent.recordMemoryData(StatisticsElement.M_GPUBuffer, -this._byteLength + bytelength);
        LayaGL.statAgent.recordMemoryData(StatisticsElement.M_GPUMemory, -this._byteLength + bytelength);
        LayaGL.statAgent.recordMemoryData(this._statistics_M_Buffer, -this._byteLength + bytelength);
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
        this._memorychange(srcData);
        this._byteLength = srcData;
        gl.bufferData(this._glTarget, this._byteLength, this._glUsage);
        this.unbindBuffer();

    }

    setData(srcData: ArrayBuffer, offset: number): void {
        let gl = this._gl;
        this.bindBuffer();
        gl.bufferSubData(this._glTarget, offset, srcData);
        LayaGL.statAgent.recordCTData(StatisticsElement.CT_BufferUploadCount, 1);
        this.unbindBuffer();
    }

    setDataEx(srcData: ArrayBuffer | ArrayBufferView, offset: number, length: number): void {
        let gl = this._gl;
        this.bindBuffer();
        gl.bufferSubData(this._glTarget, offset, srcData as ArrayBufferView, 0, length);
        LayaGL.statAgent.recordCTData(StatisticsElement.CT_BufferUploadCount, 1);
        this.unbindBuffer();
    }

    bindBufferBase(glPointer: number) {
        const gl = <WebGL2RenderingContext>this._gl;
        let bindInfo = this._engine._uboBindingMap[glPointer];
        if (bindInfo && bindInfo.buffer != this._glBuffer) {
            if (this._engine._getbindBuffer(this._glTargetType) != this) {
                this._engine._setbindBuffer(this._glTargetType, this);
            }
            gl.bindBufferBase(this._glTarget, glPointer, this._glBuffer);
            bindInfo.buffer = this._glBuffer;
            bindInfo.offset = 0;
            bindInfo.size = this._byteLength;
        }
    }

    bindBufferRange(glPointer: number, offset: number, byteCount: number) {
        const gl = <WebGL2RenderingContext>this._gl;
        let bindInfo = this._engine._uboBindingMap[glPointer];
        if (bindInfo) {
            if (bindInfo.buffer != this._glBuffer || bindInfo.offset != offset || bindInfo.size != byteCount) {
                if (this._engine._getbindBuffer(this._glTargetType) != this) {
                    this._engine._setbindBuffer(this._glTargetType, this);
                }
                gl.bindBufferRange(this._glTarget, glPointer, this._glBuffer, offset, byteCount);
                bindInfo.buffer = this._glBuffer;
                bindInfo.offset = offset;
                bindInfo.size = byteCount;
            }
        }
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
        this._memorychange(0);
        LayaGL.statAgent.recordCountData(StatisticsElement.C_GPUBuffer, -1);
        LayaGL.statAgent.recordCountData(this._statistics_RC_Buffer, -1);
        this._byteLength = 0;
        this._engine = null;
        this._glBuffer = null;
        this._glTarget = null;
        this._glUsage = null;
        this._gl = null;

    }
}