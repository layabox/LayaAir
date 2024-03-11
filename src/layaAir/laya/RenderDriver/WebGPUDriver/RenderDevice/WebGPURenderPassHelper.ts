import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Color } from "../../../maths/Color";
import { WebGPUInternalRT } from "./WebGPUInternalRT";
import { WebGPUInternalTex } from "./WebGPUInternalTex";

export class WebGPURenderPassHelper {
    static getDescriptor(rt: WebGPUInternalRT, clearflag: RenderClearFlag, clearColor: Color = null, clearDepth: number = 1, clearStencilValue = 0): GPURenderPassDescriptor {
        WebGPURenderPassHelper.setColorAttachments(rt._renderPassDescriptor, rt._textures, !!(clearflag & RenderClearFlag.Color), clearColor);
        WebGPURenderPassHelper.setDepthAttachments(rt._renderPassDescriptor, rt._depthTexture, !!(clearflag & RenderClearFlag.Depth), clearDepth);
        return rt._renderPassDescriptor;
    }

    static setColorAttachments(desc: GPURenderPassDescriptor, textures: WebGPUInternalTex[], clear: boolean, clearColor: Color = Color.BLACK) {
        //TODO mutisampled
        let colorArray = desc.colorAttachments as Array<GPURenderPassColorAttachment>;
        (colorArray as Array<GPURenderPassColorAttachment>).length = textures.length;
        for (let i = 0, n = textures.length; i < n; i++) {
            let attachment = colorArray[i];
            if (!attachment)
                attachment = colorArray[i] = { view: textures[i].getTextureView(), loadOp: "clear", storeOp: "store" };
            if (clear) {
                attachment.loadOp = "clear";
                attachment.clearValue = { r: clearColor.r, g: clearColor.g, b: clearColor.b, a: clearColor.a };
            } else attachment.loadOp = "load";
        }
    }

    static setDepthAttachments(desc: GPURenderPassDescriptor, depthTex: WebGPUInternalTex, clear: boolean, clearDepthValue: number = 1) {
        if (depthTex) {
            const hasStencil = depthTex._webGPUFormat.indexOf("stencil8") != -1;
            const depthStencil: GPURenderPassDepthStencilAttachment = desc.depthStencilAttachment = { view: depthTex.getTextureView() };
            if (clear) {
                depthStencil.depthClearValue = clearDepthValue;
                depthStencil.depthLoadOp = "clear";
                depthStencil.depthStoreOp = "store";
                if (hasStencil) {
                    depthStencil.stencilLoadOp = "clear";
                    depthStencil.stencilStoreOp = "store";
                }
            } else {
                depthStencil.depthClearValue = clearDepthValue;
                depthStencil.depthLoadOp = "load";
                depthStencil.depthStoreOp = "store";
                if (hasStencil) {
                    depthStencil.stencilLoadOp = "load";
                    depthStencil.stencilStoreOp = "store";
                }
            }
        } else delete desc.depthStencilAttachment;
    }
}