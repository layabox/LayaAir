import { Color } from "../../../maths/Color";
import { WebGPUInternalRT } from "./WebGPUInternalRT";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { WebGPURenderEngine } from "./WebGPURenderEngine";

export class WebGPURenderPassHelper {
    static getDescriptor(rt: WebGPUInternalRT, clearflag: RenderClearFlag,
        clearColor: Color = null, clearDepthValue: number = 1, clearStencilValue = 0): GPURenderPassDescriptor {

        rt = rt ?? WebGPURenderEngine._instance._screenRT;
        this.setColorAttachments(rt._renderPassDescriptor, rt, !!(clearflag & RenderClearFlag.Color), clearColor);
        this.setDepthAttachments(rt._renderPassDescriptor, rt, !!(clearflag & RenderClearFlag.Depth), clearDepthValue, clearStencilValue);
        return rt._renderPassDescriptor;
    }

    static setColorAttachments(desc: GPURenderPassDescriptor, rt: WebGPUInternalRT, clear: boolean, clearColor: Color = Color.BLACK) {
        desc.colorAttachments = [];
        const colorArray = desc.colorAttachments as GPURenderPassColorAttachment[];
        if (rt._textures[0]._webGPUFormat === 'depth16unorm'
            || rt._textures[0]._webGPUFormat === 'depth24plus-stencil8'
            || rt._textures[0]._webGPUFormat === 'depth32float') {
            colorArray[0] = {
                view: rt._depthTexture.getTextureView(),
                loadOp: clear ? 'clear' : 'load',
                storeOp: 'store',
                clearValue: {
                    r: clearColor.r,
                    g: clearColor.g,
                    b: clearColor.b,
                    a: clearColor.a
                }
            };
        } else {
            colorArray.length = rt._textures.length;
            for (let i = 0, len = rt._textures.length; i < len; i++) {
                let attachment: GPURenderPassColorAttachment;
                if (rt._textures[i].multiSamplers > 1)
                    attachment = colorArray[i] = {
                        view: rt._textures[i].getTextureView(),
                        resolveTarget: rt._texturesResolve[i].getTextureView(),
                        loadOp: 'clear',
                        storeOp: 'store'
                    };
                else attachment = colorArray[i] = {
                    view: rt._textures[i].getTextureView(),
                    loadOp: 'clear',
                    storeOp: 'store'
                };
                if (clear) {
                    attachment.loadOp = 'clear';
                    attachment.clearValue = {
                        r: clearColor.r,
                        g: clearColor.g,
                        b: clearColor.b,
                        a: clearColor.a
                    };
                } else attachment.loadOp = 'load';
            }
        }
    }

    static setDepthAttachments(desc: GPURenderPassDescriptor, rt: WebGPUInternalRT, clear: boolean, clearDepthValue: number = 1, clearStencilValue = 0) {
        if (rt._textures[0]._webGPUFormat === 'depth16unorm'
            || rt._textures[0]._webGPUFormat === 'depth24plus-stencil8'
            || rt._textures[0]._webGPUFormat === 'depth32float') {
            const depthStencil: GPURenderPassDepthStencilAttachment
                = desc.depthStencilAttachment = { view: rt._textures[0].getTextureView() };
            depthStencil.depthClearValue = clearDepthValue;
            depthStencil.depthLoadOp = clear ? 'clear' : 'load';
            depthStencil.depthStoreOp = 'store';
            delete depthStencil.stencilClearValue;
            delete depthStencil.stencilLoadOp;
            delete depthStencil.stencilStoreOp;
        } else if (rt._depthTexture) {
            const hasStencil = rt._depthTexture._webGPUFormat.indexOf('stencil8') !== -1;
            const depthStencil: GPURenderPassDepthStencilAttachment
                = desc.depthStencilAttachment = { view: rt._depthTexture.getTextureView() };
            if (clear) {
                depthStencil.depthClearValue = clearDepthValue;
                depthStencil.depthLoadOp = 'clear';
                depthStencil.depthStoreOp = 'store';
                if (hasStencil) {
                    depthStencil.stencilClearValue = clearStencilValue;
                    depthStencil.stencilLoadOp = 'clear';
                    depthStencil.stencilStoreOp = 'store';
                } else {
                    delete depthStencil.stencilClearValue;
                    delete depthStencil.stencilLoadOp;
                    delete depthStencil.stencilStoreOp;
                }
            } else {
                depthStencil.depthClearValue = clearDepthValue;
                depthStencil.depthLoadOp = 'load';
                depthStencil.depthStoreOp = 'store';
                if (hasStencil) {
                    depthStencil.stencilClearValue = clearStencilValue;
                    depthStencil.stencilLoadOp = 'load';
                    depthStencil.stencilStoreOp = 'store';
                } else {
                    delete depthStencil.stencilClearValue;
                    delete depthStencil.stencilLoadOp;
                    delete depthStencil.stencilStoreOp;
                }
            }
        } else delete desc.depthStencilAttachment;
    }
}