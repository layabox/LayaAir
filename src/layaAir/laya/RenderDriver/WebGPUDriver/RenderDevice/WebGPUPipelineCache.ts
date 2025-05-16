import { WebGPUBindGroup } from "./WebGPUBindGroupCache";
import { WebGPUBindGroup1 } from "./WebGPUBindGroupHelper";
import { WebGPUInternalRT } from "./WebGPUInternalRT";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { IRenderPipelineInfo, WebGPUPrimitiveState } from "./WebGPURenderPipelineHelper";
import { WebGPUShaderInstance } from "./WebGPUShaderInstance";

export class WebGPUPipelineCache {

    getPipelinelayout(bindGroups: Map<number, WebGPUBindGroup>): GPUPipelineLayout {

        const device = WebGPURenderEngine._instance.getDevice();

        let bindGroupLayouts: GPUBindGroupLayout[] = [];

        bindGroups.forEach((bindGroup) => {
            bindGroupLayouts.push(bindGroup.layout);
        });

        let descriptor: GPUPipelineLayoutDescriptor = {
            label: "pipelineLayout",
            bindGroupLayouts: bindGroupLayouts
        };

        let pipelineLayout = device.createPipelineLayout(descriptor);

        return pipelineLayout;
    }

    // todo
    // cache pipeline
    getPipeline(bindGroups: Map<number, WebGPUBindGroup>, info: IRenderPipelineInfo, shaderInstance: WebGPUShaderInstance, renderTarget: WebGPUInternalRT): GPURenderPipeline {
        const device = WebGPURenderEngine._instance.getDevice();

        let layout = this.getPipelinelayout(bindGroups);

        const primitive = WebGPUPrimitiveState.getGPUPrimitiveState(info.geometry.mode, info.frontFace, info.cullMode);

        const blendState = info.blendState.state;
        const depthState = info.depthStencilState?.state;
        const primitiveState = primitive.state;
        const vertexState = info.geometry.bufferState.vertexState;

        let descriptor = shaderInstance.getRenderPipelineDescriptor();
        descriptor.vertex.buffers = vertexState;
        const textureNum = renderTarget._textures.length;
        if (renderTarget._textures[0]._webGPUFormat === 'depth16unorm'
            || renderTarget._textures[0]._webGPUFormat === 'depth24plus-stencil8'
            || renderTarget._textures[0]._webGPUFormat === 'depth32float') {
            renderTarget._colorStates.length = 0;
            renderTarget._colorStates[0] = {
                format: renderTarget._depthTexture._webGPUFormat,
                writeMask: GPUColorWrite.ALL,
            };
            blendState && (renderTarget._colorStates[0].blend = blendState);
        } else {
            if (renderTarget._colorStates.length === textureNum) {
                for (let i = renderTarget._colorStates.length - 1; i > -1; i--) {
                    delete renderTarget._colorStates[i].blend;
                    renderTarget._colorStates[i].format = renderTarget._textures[i]._webGPUFormat;
                    blendState && (renderTarget._colorStates[i].blend = blendState);
                }
            } else {
                renderTarget._colorStates.length = textureNum;
                for (let i = 0; i < textureNum; i++) {
                    renderTarget._colorStates[i] = {
                        format: renderTarget._textures[i]._webGPUFormat,
                        writeMask: GPUColorWrite.ALL,
                    };
                    blendState && (renderTarget._colorStates[i].blend = blendState);
                }
            }
        }
        descriptor.fragment.targets = renderTarget._colorStates;
        descriptor.primitive = primitiveState;
        if (renderTarget._textures[0]._webGPUFormat === 'depth16unorm'
            || renderTarget._textures[0]._webGPUFormat === 'depth24plus-stencil8'
            || renderTarget._textures[0]._webGPUFormat === 'depth32float') {
            descriptor.depthStencil = {
                format: renderTarget._textures[0]._webGPUFormat,
                depthWriteEnabled: true,
                depthCompare: 'less',
            };
        } else {
            if (depthState)
                descriptor.depthStencil = depthState;
            else delete descriptor.depthStencil;
        }
        descriptor.layout = layout;
        descriptor.multisample.count = renderTarget._samples;

        let pipeline = device.createRenderPipeline(descriptor);

        return pipeline;
    }

}
