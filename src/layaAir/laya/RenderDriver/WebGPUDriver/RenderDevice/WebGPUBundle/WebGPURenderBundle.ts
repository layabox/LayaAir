import { WebGPUBindGroup } from "../WebGPUBindGroupHelper";
import { WebGPUInternalRT } from "../WebGPUInternalRT";
import { WebGPURenderEncoder } from "../WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "../WebGPURenderEngine";

/**
 * 渲染指令缓存
 * 用于缓存渲染指令，提高渲染效率
 * 一个渲染指令缓存对象缓存了若干个渲染节点的渲染指令
 * 如果下一帧渲染流程中，缓存的渲染节点命中率高于一定的程度，则可以直接使用缓存的渲染指令
 */
export class WebGPURenderBundle extends WebGPURenderEncoder {
    static bundleDescriptorMap: Map<number, GPURenderBundleEncoderDescriptor> = new Map();
    static getBundleDescriptor(rt: WebGPUInternalRT): GPURenderBundleEncoderDescriptor {
        if (WebGPURenderBundle.bundleDescriptorMap.has(rt.stateCacheID)) {
            return WebGPURenderBundle.bundleDescriptorMap.get(rt.stateCacheID);
        } else {
            //create
            const texs = rt._textures;
            let desc: GPURenderBundleEncoderDescriptor = {
                colorFormats: []
            };
            const colorFormats = desc.colorFormats as GPUTextureFormat[];
            colorFormats.length = rt._textures.length;
            for (let i = 0, len = rt._textures.length; i < len; i++) {
                if (rt._textures[0]._webGPUFormat === 'depth16unorm'
                    || rt._textures[0]._webGPUFormat === 'depth24plus-stencil8'
                    || rt._textures[0]._webGPUFormat === 'depth32float') {
                    colorFormats[i] = rt._depthTexture._webGPUFormat;
                } else colorFormats[i] = rt._textures[i]._webGPUFormat;
            }
            if (rt._textures[0]._webGPUFormat === 'depth16unorm'
                || rt._textures[0]._webGPUFormat === 'depth24plus-stencil8'
                || rt._textures[0]._webGPUFormat === 'depth32float') {
                desc.depthStencilFormat = rt._textures[0]._webGPUFormat;
            } else desc.depthStencilFormat = rt._depthTexture ? rt._depthTexture._webGPUFormat : undefined;
            desc.sampleCount = rt._samples;
            // desc.depthReadOnly = true;//怎么理解？？
            WebGPURenderBundle.bundleDescriptorMap.set(rt.stateCacheID, desc);
            return desc;
        }
    }

    private _engine: WebGPURenderEngine;

    private _device: GPUDevice;

    _gpuBundle: GPURenderBundle;

    encoder: GPURenderBundleEncoder; //渲染绑定编码器

    createMask: number = -1;//创建的时候生成的帧数

    constructor() {
        super();
        this._engine = WebGPURenderEngine._instance;
        this._device = this._engine.getDevice();
    }

    isNeedReCreate(resourceUpdateMask: number): boolean {
        return resourceUpdateMask >= this.createMask;
    }

    startRender(destRT: WebGPUInternalRT, lable: string, depthReadOnly?: boolean, stencilReadOnly?: boolean) {
        let descriptor = WebGPURenderBundle.getBundleDescriptor(destRT);
        descriptor.label = lable;
        this.encoder = this._device.createRenderBundleEncoder(descriptor);
    }

    /**
     * 设置绑定组
     * @param index 
     * @param bindGroup 
     * @param dynamicOffsets 
     */
    setBindGroup(index: GPUIndex32, bindGroup: WebGPUBindGroup, dynamicOffsets?: Iterable<GPUBufferDynamicOffset>) {
        dynamicOffsets ? this.encoder.setBindGroup(index, bindGroup.gpuRS) : this.encoder.setBindGroup(index, bindGroup.gpuRS, dynamicOffsets);
    }

    finish(lable: string) {
        this._gpuBundle = this.encoder.finish({ label: lable });
    }

    /**
     * 销毁
     */
    destroy() {
        this.encoder = null;
        this.createMask = -1;
    }
}