import { Color } from "../../../maths/Color";
import { WebGPUInternalRT } from "./WebGPUInternalRT";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";

export class WebGPURenderPassHelper {

    static getDescriptor(rt: WebGPUInternalRT, clearflag: RenderClearFlag,
        clearColor: Color = null, clearDepthValue: number = 1, clearStencilValue = 0): GPURenderPassDescriptor {

        clearColor = clearColor || Color.BLACK;

        let colorAttachments: GPURenderPassColorAttachment[] = [];
        let desc: GPURenderPassDescriptor = {
            colorAttachments: colorAttachments,
        };

        let isClearColor = clearflag & RenderClearFlag.Color;
        let isClearDepth = clearflag & RenderClearFlag.Depth;

        if (rt.colorFormat == RenderTargetFormat.DEPTH_16 || rt.colorFormat == RenderTargetFormat.DEPTH_32 || rt.colorFormat == RenderTargetFormat.DEPTHSTENCIL_24_8 || rt.colorFormat == RenderTargetFormat.DEPTHSTENCIL_24_Plus || rt.colorFormat == RenderTargetFormat.STENCIL_8) {

            let tex = rt._textures[0];
            if (tex.multiSamplers > 1) {
                tex = rt._texturesResolve[0];
            }

            desc.depthStencilAttachment = {
                view: tex.getTextureView(),
                depthClearValue: isClearDepth ? clearDepthValue : 1,
                depthLoadOp: isClearDepth ? 'clear' : 'load',
                depthStoreOp: 'store'
            };

            if (rt.colorFormat == RenderTargetFormat.DEPTHSTENCIL_24_8 || rt.colorFormat == RenderTargetFormat.DEPTHSTENCIL_24_Plus || rt.colorFormat == RenderTargetFormat.STENCIL_8) {
                desc.depthStencilAttachment.stencilClearValue = isClearDepth ? clearStencilValue : 0;
                desc.depthStencilAttachment.stencilLoadOp = isClearDepth ? 'clear' : 'load';
                desc.depthStencilAttachment.stencilStoreOp = 'store';
            }
        }
        else {
            for (let index = 0; index < rt._textures.length; index++) {
                let tex = rt._textures[index];

                let attachment: GPURenderPassColorAttachment = {
                    view: tex.getTextureView(),
                    loadOp: isClearColor ? 'clear' : 'load',
                    storeOp: 'store'
                };
                if (tex.multiSamplers > 1) {
                    attachment.resolveTarget = rt._texturesResolve[index].getTextureView();
                }

                if (isClearColor) {
                    attachment.clearValue = {
                        r: clearColor.r,
                        g: clearColor.g,
                        b: clearColor.b,
                        a: clearColor.a
                    };
                }

                colorAttachments.push(attachment);
            }

            if (rt._depthTexture) {
                desc.depthStencilAttachment = {
                    view: rt._depthTexture.getTextureView(),
                    depthClearValue: isClearDepth ? clearDepthValue : 1,
                    depthLoadOp: isClearDepth ? 'clear' : 'load',
                    depthStoreOp: 'store'
                };

                if (rt.depthStencilFormat == RenderTargetFormat.DEPTHSTENCIL_24_8 || rt.depthStencilFormat == RenderTargetFormat.DEPTHSTENCIL_24_Plus || rt.depthStencilFormat == RenderTargetFormat.STENCIL_8) {
                    desc.depthStencilAttachment.stencilClearValue = isClearDepth ? clearStencilValue : 0;
                    desc.depthStencilAttachment.stencilLoadOp = isClearDepth ? 'clear' : 'load';
                    desc.depthStencilAttachment.stencilStoreOp = 'store';
                }
            }
        }

        rt._renderPassDescriptor = desc;

        return desc;
    }
}