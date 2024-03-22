
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { WebGLBufferState } from "./WebGLBufferState";
import { WebGLEngine } from "./WebGLEngine";
import { GLBuffer } from "./WebGLEngine/GLBuffer";

export class WebGLIndexBuffer implements IIndexBuffer {
    _glBuffer: GLBuffer;
    indexType: IndexFormat;
    indexCount: number;

    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage) {
        this._glBuffer = this._glBuffer = WebGLEngine.instance.createBuffer(targetType, bufferUsageType) as GLBuffer;
        WebGLEngine.instance._addStatisticsInfo(GPUEngineStatisticsInfo.RC_IndexBuffer, 1);
    }

    private _changeMemory(bytelength: number) {
        WebGLEngine.instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_IndexBuffer, -this._glBuffer._byteLength + bytelength);
    }
    
    _setIndexDataLength(data: number): void {
        this._changeMemory(data);
        var curBufSta = WebGLBufferState._curBindedBufferState;
        if (curBufSta) {
            curBufSta.unBind();//避免影响VAO
            this._glBuffer.bindBuffer()
            this._glBuffer.setDataLength(data);
            curBufSta.bind();
        } else {
            this._glBuffer.bindBuffer()
            this._glBuffer.setDataLength(data);
        }
    }

    _setIndexData(data: Uint32Array | Uint16Array | Uint8Array, bufferOffset: number): void {
        var curBufSta = WebGLBufferState._curBindedBufferState;
        if (curBufSta) {
            curBufSta.unBind();//避免影响VAO
            this._glBuffer.bindBuffer()
            this._glBuffer.setData(data, bufferOffset);
            curBufSta.bind();
        } else {
            this._glBuffer.bindBuffer()
            this._glBuffer.setData(data, bufferOffset)
        }
    }

    destroy(): void {
        this._glBuffer.destroy();
        this._changeMemory(0);
        WebGLEngine.instance._addStatisticsInfo(GPUEngineStatisticsInfo.RC_IndexBuffer, -1);
    }
}