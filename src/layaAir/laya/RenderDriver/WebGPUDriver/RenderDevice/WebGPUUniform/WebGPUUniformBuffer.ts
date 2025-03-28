import { UniformProperty } from "../../../DriverDesign/RenderDevice/CommandUniformMap";
import { WebGPURenderEngine } from "../WebGPURenderEngine";
import { WebGPUUniformBufferBase, WebGPUUniformBufferDescriptor } from "./WebGPUUniformBufferBase";
export class WebGPUUniformBuffer extends WebGPUUniformBufferBase {

    lable: string;
    private _data: Float32Array;
   
    constructor(lable: string, uniformMap: Map<number, UniformProperty>) {
        super();
        let descriptor = new WebGPUUniformBufferDescriptor(lable);
        descriptor.setUniforms(uniformMap);
        let _data = new Float32Array(descriptor.byteLength);
        let buffer = _data.buffer;
        for (const [key, uniform] of descriptor.uniforms) {
            uniform.view = new uniform.dataView(buffer, uniform.offset, uniform.viewByteLength / uniform.dataView.BYTES_PER_ELEMENT);
        }

        this._gpuBuffer = WebGPURenderEngine._instance.getDevice().createBuffer({
            label: this.lable,
            size: buffer.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this._GPUBindGroupEntry = {
            binding: 0,//后续自己改
            resource: {
                buffer: this._gpuBuffer,
                offset: 0,
                size: this.bytelength,
            }
        }
        this.needUpload = true;
    }

    getBindGroupEntry(binding: number): GPUBindGroupEntry {
        this._GPUBindGroupEntry.binding = binding;
        return this._GPUBindGroupEntry;
    }


    upload(): void {
        if (this.needUpload) {
            WebGPUUniformBufferBase.device.queue.writeBuffer(this._gpuBuffer, 0, this._data, 0, this._data.byteLength);
            this.needUpload = false;
        }
    }

    destroy(): void {
        //destroy Buffer
        this._data = null;
    }

}