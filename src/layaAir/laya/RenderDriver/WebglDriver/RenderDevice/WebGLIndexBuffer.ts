import { GLBuffer } from "../../../RenderEngine/RenderEngine/WebGLEngine/GLBuffer";
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { LayaGL } from "../../../layagl/LayaGL";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { WebGLBufferState } from "./WebGLBufferState";

export class WebGLIndexBuffer implements IIndexBuffer {
    _glBuffer: GLBuffer;
    indexType: IndexFormat;
    indexCount: number;

    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage) {
        this._glBuffer = this._glBuffer = LayaGL.renderEngine.createBuffer(targetType, bufferUsageType) as GLBuffer;
    }

   
    _setIndexData(data: number): void;
    _setIndexData(data: Uint32Array | Uint16Array | Uint8Array, bufferOffset: number): void;
    _setIndexData(data: Uint32Array | Uint16Array | Uint8Array | number, bufferOffset?: number): void {

        var curBufSta = WebGLBufferState._curBindedBufferState;

        if (curBufSta) {
            if (curBufSta._bindedIndexBuffer === this) {
                this._glBuffer.setDataLength(0);
            } else {
                curBufSta.unBind();//避免影响VAO
                this._glBuffer.bindBuffer()
                if (typeof data === "number")
                    this._glBuffer.setDataLength(data);
                else
                    this._glBuffer.setData(data, bufferOffset);
                curBufSta.bind();
            }
        } else {
            this._glBuffer.bindBuffer()
            if (typeof data === "number")
                this._glBuffer.setDataLength(data);
            else
                this._glBuffer.setData(data, bufferOffset)
        }
    }

    destroy(): void {
        this._glBuffer.destroy();
     }


}