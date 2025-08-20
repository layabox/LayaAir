
import { LayaGL } from "../../../layagl/LayaGL";
import { StatElement } from "../../../layagl/StatisticsContext";
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
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
      
    }

    

    _setIndexDataLength(data: number): void {
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

    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void {
        let curBufSta = WebGLBufferState._curBindedBufferState;
        if (curBufSta) {
            curBufSta.unBind();//避免影响VAO
        }
        this._glBuffer.bindBuffer()
        var needSubData: boolean = dataStartIndex !== 0 || dataCount !== Number.MAX_SAFE_INTEGER;
        if (needSubData) {
            var subData: Uint8Array = new Uint8Array(buffer, dataStartIndex, dataCount);
            this._glBuffer.setData(subData, bufferOffset);
        } else {
            this._glBuffer.setData(buffer, bufferOffset);
        }
        if (curBufSta)
            curBufSta.bind();
        LayaGL.statAgent.recordCTData(StatElement.CT_GeometryBufferUploadCount, 1);
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
        LayaGL.statAgent.recordCTData(StatElement.CT_GeometryBufferUploadCount, 1);
    }

    destroy(): void {
        this._glBuffer.destroy();
    }
}