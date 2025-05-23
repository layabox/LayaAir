import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { UniformProperty } from "../../../DriverDesign/RenderDevice/CommandUniformMap";
import { IUniformBufferUser } from "../../../DriverDesign/RenderDevice/UniformBufferManager/IUniformBufferUser";
import { UniformBufferAlone } from "../../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferAlone";
import { UniformBufferBlock } from "../../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferBlock";
import { WebGPURenderEngine } from "../WebGPURenderEngine";
import { WebGPUShaderData } from "../WebGPUShaderData";
import { WebGPUBufferManager } from "./WebGPUBufferManager";
import { WebGPUUniformBufferBase, WebGPUUniformBufferDescriptor } from "./WebGPUUniformBufferBase";

export class WebGPUSubUniformBuffer extends WebGPUUniformBufferBase implements IUniformBufferUser {

    bufferBlock: UniformBufferBlock;

    bufferAlone: UniformBufferAlone;

    manager: WebGPUBufferManager;

    offset: number;

    private _owner: WebGPUShaderData;

    private _uniformName: string;

    constructor(lable: string, uniformMap: Map<number, UniformProperty>, owner: WebGPUShaderData) {
        super();
        this._uniformName = lable;
        let descriptor = this.descriptor = new WebGPUUniformBufferDescriptor(lable);
        descriptor.setUniforms(uniformMap);
        this.bytelength = descriptor.byteLength;
        let uboManager = this.manager = WebGPURenderEngine._instance.gpuBufferMgr;
        this.bufferBlock = uboManager.getBlock(this.bytelength, this);
        this._reSetBindGroupEntry();
        this._owner = owner;
        this.notifyGPUBufferChange();

    }

    private _reSetBindGroupEntry() {
        this._gpuBuffer = this.bufferBlock.cluster.buffer
        this._GPUBindGroupEntry = {
            binding: 0,//后续自己改
            resource: {
                buffer: this._gpuBuffer,
                offset: this.bufferBlock.offset,
                size: this.descriptor.byteLength,
            }
        }
    }


    getBindGroupEntry(binding: number): GPUBindGroupEntry {
        this._GPUBindGroupEntry.binding = binding;
        return this._GPUBindGroupEntry;
    }

    upload(): void {
        this.needUpload && this.bufferBlock.needUpload();
    }


    notifyGPUBufferChange(info?: string): void {

        this.offset = this.bufferBlock.offset;
        this.needUpload = true;

        this.descriptor.uniforms.forEach(uniform => {

            let size = uniform.viewByteLength / uniform.dataView.BYTES_PER_ELEMENT;
            let offset = uniform.offset + this.bufferBlock.offset;

            uniform.view = new uniform.dataView(this.bufferBlock.cluster.data, offset, size);
        });
        this.needUpload = true;
        if (info) {
            this._reSetBindGroupEntry();
        }
    }

    updateOver(): void {
        this.needUpload = false;
    }

    destroy(): void {
        //TODO destroy Buffer
        this.manager.freeBlock(this.bufferBlock);
    }

}