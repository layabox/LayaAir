
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
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
        engine.on("startFrame",this,this.startFrame)
    }

    createGPUBuffer(size: number, name?: string): GLBuffer {
        
        let buffer = this.engine.createBuffer(BufferTargetType.UNIFORM_BUFFER, BufferUsage.Dynamic);
        buffer.bindBuffer();
        buffer.setDataLength(size);
        return buffer;
    }

    writeBuffer(buffer: GLBuffer, data: ArrayBuffer, offset: number, size: number): void {
        buffer.bindBuffer();
        let gl = <WebGL2RenderingContext>this.engine.gl;
        gl.bufferSubData(buffer._glTarget, offset, new Float32Array(data, offset, size / 4));

    }

    statisGPUMemory(bytes: number): void {
        this.engine._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUMemory, bytes);
        this.engine._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUBuffer, bytes);
    }

    statisUpload(count: number, bytes: number): void {
        this.engine._addStatisticsInfo(GPUEngineStatisticsInfo.C_UniformBufferUploadCount, count);
    }

}