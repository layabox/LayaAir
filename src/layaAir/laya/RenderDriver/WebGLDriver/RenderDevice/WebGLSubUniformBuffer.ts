import { ShaderData, ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { IUniformBufferUser } from "../../DriverDesign/RenderDevice/UniformBufferManager/IUniformBufferUser";
import { UniformBufferAlone } from "../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferAlone";
import { UniformBufferBlock } from "../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferBlock";
import { WebGLUniformBufferManager } from "./WebGLUniformBufferManager";
import { GLBuffer } from "./WebGLEngine/GLBuffer";
import { WebGLUniformBufferBase } from "./WebGLUniformBufferBase";
import { WebGLUniformBufferDescriptor } from "./WebGLUniformBufferDescriptor";

export class WebGLSubUniformBuffer extends WebGLUniformBufferBase implements IUniformBufferUser {

    uniformMap: Map<number, { id: number, propertyName: string, uniformtype: ShaderDataType, arrayLength: number }>;

    upload(): void {
        // sub buffer value alread upload in buffer manager
    }
    bind(location: number): void {
        let buffer = <GLBuffer>this.bufferBlock.cluster.buffer;
        buffer.bindBufferRange(location, this.bufferBlock.offset, this.bufferBlock.size);
    }

    bufferBlock: UniformBufferBlock;
    bufferAlone: UniformBufferAlone;
    manager: WebGLUniformBufferManager;
    data: ShaderData;
    offset: number;

    name: string;
    size: number;

    constructor(name: string, uniformMap: Map<number, { id: number, propertyName: string, uniformtype: ShaderDataType, arrayLength: number }>, mgr: WebGLUniformBufferManager, data: ShaderData) {
        super();
        this.name = name;
        this.manager = mgr;
        this.data = data;
        this.uniformMap = uniformMap;

        let descriptor = new WebGLUniformBufferDescriptor(name);
        uniformMap.forEach(uniform => {
            descriptor.addUniform(uniform.id, uniform.uniformtype, uniform.arrayLength);
        });
        descriptor.finish(this.manager.byteAlign / 4);
        let bufferSize = descriptor.byteLength;
        this.descriptor = descriptor;

        this.size = bufferSize;
        this.bufferBlock = mgr.getBlock(bufferSize, this);
        this.needUpload = true;
    }

    clearGPUBufferBind(): void {
        // throw new Error("Method not implemented.");
    }

    notifyGPUBufferChange(): void {

        this.offset = this.bufferBlock.offset;
        this.needUpload = true;

        this.descriptor.uniforms.forEach(uniform => {

            let size = uniform.viewByteLength / uniform.dataView.BYTES_PER_ELEMENT;
            let offset = uniform.offset + this.bufferBlock.offset;

            uniform.view = new uniform.dataView(this.bufferBlock.cluster.data, offset, size);
        });
        // this.needUpload = true;
        //this.bufferBlock.cluster.upload();
        this.needUpload = true;
    }

    destroy(): void {
        this.name = null;
        this.data = null;
        this.uniformMap = null;
        this.descriptor.destroy();
        this.descriptor = null;
        this.manager.freeBlock(this.bufferBlock);
    }
}