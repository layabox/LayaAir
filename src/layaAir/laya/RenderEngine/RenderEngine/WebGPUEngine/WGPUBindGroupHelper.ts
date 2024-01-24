import { WGPUShaderVariable } from "./WGPUShaderVariable";
import { WebGPUInternalTex } from "./WebGPUInternalTex";
import { WGPUShaderData } from "../../../d3/RenderObjs/WebGPUOBJ/WGPUShaderData";
import { WebGPUBuffer } from "./WebGPUBuffer";
import { ShaderDataType } from "../../../RenderDriver/RenderModuleData/Design/ShaderData";
export class WGPUBindGroupHelper {
    static device: GPUDevice;

    /**create BindGroup by ShaderVariable */
    static getBindGroupbyUniformMap(shaderVariable: WGPUShaderVariable, shaderData: WGPUShaderData): GPUBindGroup {
        let sourceMap = shaderData._dataBindGroupResourceMap;
        let bindgroup: GPUBindGroup;
        if (shaderVariable.block) {
            let entrys = [];
            let map = shaderVariable.blockProperty;
            let bindIndex = 0;
            for (var i = 0, n = map.length; i < n; i++) {
                let property = map[i];
                switch (property.uniformtype) {
                    case ShaderDataType.Buffer:
                    case ShaderDataType.Matrix4x4:
                    case ShaderDataType.Vector4:
                    case ShaderDataType.Color:
                    case ShaderDataType.Vector3:
                    case ShaderDataType.Vector2:
                    case ShaderDataType.Bool:
                    case ShaderDataType.Float:
                        entrys.push(WGPUBindGroupHelper.createBufferBindGroupEntry(bindIndex++, (sourceMap[shaderVariable.dataOffset] as WebGPUBuffer)._gpuBuffer,(sourceMap[shaderVariable.dataOffset] as WebGPUBuffer)._size));
                        break;
                    case ShaderDataType.Texture2D:
                    case ShaderDataType.TextureCube:
                        entrys.push(WGPUBindGroupHelper.createTextureBindGroupEntry(bindIndex++, (sourceMap[shaderVariable.dataOffset] as WebGPUInternalTex).textureView));
                        entrys.push(WGPUBindGroupHelper.createSamplerBindGroupEntry(bindIndex++, (sourceMap[shaderVariable.dataOffset] as WebGPUInternalTex).webgpuSampler));
                        break;
                }
            }
            let descriptor: GPUBindGroupDescriptor = {
                layout: shaderVariable.groupLayout,
                entries: entrys
            }
            bindgroup = this.device.createBindGroup(descriptor);
        } else {
            switch (shaderVariable.type) {
                case ShaderDataType.Buffer:
                case ShaderDataType.Matrix4x4:
                case ShaderDataType.Vector4:
                case ShaderDataType.Color:
                case ShaderDataType.Vector3:
                case ShaderDataType.Vector2:
                case ShaderDataType.Bool:
                case ShaderDataType.Float:
                    bindgroup = WGPUBindGroupHelper.getBufferBindGroup(shaderVariable, (sourceMap[shaderVariable.dataOffset] as WebGPUBuffer)._gpuBuffer,(sourceMap[shaderVariable.dataOffset] as WebGPUBuffer)._size);
                    break;
                case ShaderDataType.Texture2D:
                case ShaderDataType.TextureCube:
                    bindgroup = WGPUBindGroupHelper.getTextureBindGroup(shaderVariable, (sourceMap[shaderVariable.dataOffset] as WebGPUInternalTex));
                    break;
            }
        }
        return bindgroup;
    }

    /**Buffer BindGroup */
    static getBufferBindGroup(shaderVariable: WGPUShaderVariable, databuffer: GPUBuffer, size: number, offset: number = 0): GPUBindGroup {
        let descriptor: GPUBindGroupDescriptor = {
            layout: shaderVariable.groupLayout,
            entries: [WGPUBindGroupHelper.createBufferBindGroupEntry(0, databuffer, size, offset)]
        }
        let bindgroup = this.device.createBindGroup(descriptor);
        bindgroup.label = "buffer: \n \tsize:"+size.toString() + "\n\t name:"+shaderVariable.name+ "\n\t location"+shaderVariable.location;
        return bindgroup
    }

    /**Texture BindGroup */
    static getTextureBindGroup(shaderVariable: WGPUShaderVariable, internalTexture: WebGPUInternalTex): GPUBindGroup {
        let descriptor: GPUBindGroupDescriptor = {
            layout: shaderVariable.groupLayout,
            entries: [WGPUBindGroupHelper.createTextureBindGroupEntry(0, internalTexture.textureView),
            WGPUBindGroupHelper.createSamplerBindGroupEntry(1, internalTexture.webgpuSampler)
            ]
        }
        return this.device.createBindGroup(descriptor);
    }

    /**Buffer BindGroup Entry */
    static createBufferBindGroupEntry(bindIndex: number, databuffer: GPUBuffer, size: number , offset: number = 0): GPUBindGroupEntry {
        let gpubufferResource: GPUBufferBinding = {
            buffer: databuffer,
            offset: offset
        }
        if (size < 0) {
            gpubufferResource.size = size;
        }
        let entry: GPUBindGroupEntry = {
            binding: bindIndex,
            resource: gpubufferResource
        }
        return entry;
    }

    /**Sampler BindGroup Entry */
    static createSamplerBindGroupEntry(bindIndex: number, sampler: GPUSampler) {
        let entry: GPUBindGroupEntry = {
            binding: bindIndex,
            resource: sampler
        }
        return entry;
    }

    /**TextureView BindGroup Entry */
    static createTextureBindGroupEntry(bindIndex: number, texture: GPUTextureView) {
        let entry: GPUBindGroupEntry = {
            binding: bindIndex,
            resource: texture
        }
        return entry;
    }

    /**todo */
    static createExternalTextureBindGroupEntry() {
        //TODO
    }





}