import { RenderTargetFormat } from "../../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { WebGPUBindGroup } from "../WebGPUBindGroupCache";
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

    static bundleDescriptorMap: Map<string, GPURenderBundleEncoderDescriptor> = new Map();

    static getBundleDescriptor(rt: WebGPUInternalRT): GPURenderBundleEncoderDescriptor {
        if (WebGPURenderBundle.bundleDescriptorMap.has(rt.stateCacheKey)) {
            return WebGPURenderBundle.bundleDescriptorMap.get(rt.stateCacheKey);
        }
        else {
            const colorFormats: GPUTextureFormat[] = [];

            let desc: GPURenderBundleEncoderDescriptor = {
                colorFormats: colorFormats
            };

            if (rt.colorFormat == RenderTargetFormat.DEPTH_16 || rt.colorFormat == RenderTargetFormat.DEPTH_32 || rt.colorFormat == RenderTargetFormat.DEPTHSTENCIL_24_8 || rt.colorFormat == RenderTargetFormat.DEPTHSTENCIL_24_Plus || rt.colorFormat == RenderTargetFormat.STENCIL_8) {
                let tex = rt._textures[0];
                if (tex.multiSamplers > 1) {
                    tex = rt._texturesResolve[0];
                }
                desc.depthStencilFormat = tex._webGPUFormat;
            }
            else {
                for (let index = 0; index < rt._textures.length; index++) {
                    let tex = rt._textures[index];

                    colorFormats.push(tex._webGPUFormat);
                }
            }

            desc.sampleCount = rt._samples;

            WebGPURenderBundle.bundleDescriptorMap.set(rt.stateCacheKey, desc);
            return desc;
        }
    }

    private _engine: WebGPURenderEngine;

    private _device: GPUDevice;

    _gpuBundle: GPURenderBundle;

    encoder: GPURenderBundleEncoder; //渲染绑定编码器

    createMask: number = -1;//创建的时候生成的帧数

    constructor() {
        super(true);
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

    finish(lable: string) {
        this.onFinish();
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