
import { LayaGL } from "../../../layagl/LayaGL";
import { StatElement } from "../../../layagl/StatisticsContext";
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { UniformBufferManager } from "../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferManager";
import { WebGLEngine } from "./WebGLEngine";
import { GLBuffer } from "./WebGLEngine/GLBuffer";

export class WebGLUniformBufferManager extends UniformBufferManager {

    engine: WebGLEngine;

    constructor(engine: WebGLEngine, offsetAlignment: number) {
        super(true);
        this.engine = engine;

        this.byteAlign = offsetAlignment;
        engine.on("endFrame", this, this.endFrame);
        engine.on("startFrame", this, this.startFrame)
    }

    createGPUBuffer(size: number, name?: string, data?: ArrayBuffer): GLBuffer {
        let buffer = this.engine.createBuffer(BufferTargetType.UNIFORM_BUFFER, BufferUsage.Dynamic);
        buffer.bindBuffer();
        buffer.setDataLength(size);
        if (data) {
            buffer.setData(data, 0);
        }
        return buffer;
    }

    writeBuffer(buffer: GLBuffer, data: ArrayBuffer, offset: number, size: number): void {
        buffer.bindBuffer();
        let gl = <WebGL2RenderingContext>this.engine.gl;
        gl.bufferSubData(buffer._glTarget, offset, new Float32Array(data, offset, size / 4));
        LayaGL.statAgent.recordCTData(StatElement.CT_UBOBufferUploadCount, 1);
        LayaGL.statAgent.recordCTData(StatElement.CT_UBOBufferUploadMemory, size / 1048576);
    }
}