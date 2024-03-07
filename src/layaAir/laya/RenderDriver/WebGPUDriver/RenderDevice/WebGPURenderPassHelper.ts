import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Color } from "../../../maths/Color";
import { WebGPUInternalRT } from "./WebGPUInternalRT";
import { WebGPUInternalTex } from "./WebGPUInternalTex";

export class WebGPURenderPassHelper {
    static getDescriptor(rt: WebGPUInternalRT, clearflag: RenderClearFlag, clearcolor: Color = null, clearDepth: number = 1, clearStencilValue = 0): GPURenderPassDescriptor {
        WebGPURenderPassHelper.setColorAttachments(rt._renderPassDescriptor, rt._textures, !!(clearflag & RenderClearFlag.Color), clearcolor);
        WebGPURenderPassHelper.setDepthAttachments(rt._renderPassDescriptor, rt._depthTexture, !!(clearflag & RenderClearFlag.Depth), clearDepth);//default 1.0
        return rt._renderPassDescriptor;
    }

    static setColorAttachments(des: GPURenderPassDescriptor, textures: WebGPUInternalTex[], clear: boolean, clearColor: Color = Color.BLACK) {
        //TODO mutisampled
        let colorArray = des.colorAttachments as Array<GPURenderPassColorAttachment>;
        (colorArray as Array<GPURenderPassColorAttachment>).length = textures.length;
        for (let i = 0, n = textures.length; i < n; i++) {
            let attachment = colorArray[i];
            if (!attachment)
                attachment = colorArray[i] = { view: textures[i].getTextureView(), loadOp: "clear", storeOp: "store" };
            if (clear) {
                attachment.loadOp = "clear";
                attachment.clearValue = { r: clearColor.r, g: clearColor.g, b: clearColor.b, a: clearColor.a };
            } else
                attachment.loadOp = "load";
        }
    }

    static setDepthAttachments(des: GPURenderPassDescriptor, depthTex: WebGPUInternalTex, clear: boolean, clearDepthValue: number = 1.0) {
        if (depthTex) {
            let depthStencil: GPURenderPassDepthStencilAttachment = des.depthStencilAttachment = { view: depthTex.getTextureView() };
            if (clear) {
                depthStencil.depthClearValue = clearDepthValue;
                depthStencil.depthLoadOp = "clear";
                depthStencil.depthStoreOp = "store";
            } else {
                depthStencil.depthClearValue = clearDepthValue;
                depthStencil.depthLoadOp = "load";
                depthStencil.depthStoreOp = "store";
            }
        } else {
            delete des.depthStencilAttachment;
        }

    }
}