import { WebGPUBindGroup } from "./WebGPUBindGroupCache";
import { WebGPUInternalRT } from "./WebGPUInternalRT";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { IRenderPipelineInfo, WebGPUPrimitiveState } from "./WebGPURenderPipelineHelper";
import { WebGPUShaderInstance } from "./WebGPUShaderInstance";

class WebGPUPipelineLayout {

    private static _idCounter: number = 0;

    readonly id: number;

    layout: GPUPipelineLayout;

    constructor(layout: GPUPipelineLayout) {
        this.id = WebGPUPipelineLayout._idCounter++;
        this.layout = layout;
    }
}


export class WebGPUPipelineCache {

    private pipelineLayoutCache: Map<string, WebGPUPipelineLayout> = new Map();

    private pipelineCache: Map<string, GPURenderPipeline> = new Map();

    private getPipelineLayoutCacheKey(bindGroups: Map<number, WebGPUBindGroup>) {
        // 对键进行排序以确保一致性
        const sortedKeys = Array.from(bindGroups.keys()).sort((a, b) => a - b);

        // 创建包含所有绑定组信息的字符串
        let key = '';
        for (const bindingIndex of sortedKeys) {
            const bindGroup = bindGroups.get(bindingIndex);
            // 使用绑定索引和绑定组的ID（或布局哈希）
            key += `${bindingIndex}:${bindGroup.info.id}_`;
        }

        return key;
    }

    getPipelinelayout(bindGroups: Map<number, WebGPUBindGroup>): WebGPUPipelineLayout {

        const cacheKey = this.getPipelineLayoutCacheKey(bindGroups);
        if (this.pipelineLayoutCache.has(cacheKey)) {
            return this.pipelineLayoutCache.get(cacheKey);
        }

        let bindGroupLayouts: GPUBindGroupLayout[] = [];

        bindGroups.forEach((bindGroup, index) => {
            bindGroupLayouts[index] = bindGroup.layout;
        });

        let descriptor: GPUPipelineLayoutDescriptor = {
            label: "pipelineLayout",
            bindGroupLayouts: bindGroupLayouts
        };

        const device = WebGPURenderEngine._instance.getDevice();
        let pipelineLayout = device.createPipelineLayout(descriptor);

        let layout = new WebGPUPipelineLayout(pipelineLayout);

        this.pipelineLayoutCache.set(cacheKey, layout);

        return layout;
    }

    getPipeline(bindGroups: Map<number, WebGPUBindGroup>, info: IRenderPipelineInfo, shaderInstance: WebGPUShaderInstance, renderTarget: WebGPUInternalRT): GPURenderPipeline {
        const device = WebGPURenderEngine._instance.getDevice();

        let layout = this.getPipelinelayout(bindGroups);

        // 生成描述性键
        const descKey = `${info.blendState.id}_${info.depthStencilState?.id || 0}_${info.cullMode}_${info.frontFace}_${layout.id}_${renderTarget.stateCacheID}`;
        if (this.pipelineCache.has(descKey)) {
            return this.pipelineCache.get(descKey);
        }

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
        descriptor.layout = layout.layout;
        descriptor.multisample.count = renderTarget._samples;

        let pipeline = device.createRenderPipeline(descriptor);
        this.pipelineCache.set(descKey, pipeline);

        return pipeline;
    }

}
