import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { ForwardAddClusterRP } from "../../DriverCommon/ForwardAddClusterRP";
import { RenderPassUtil } from "../../DriverCommon/RenderPassUtil";
import { IRenderContext3D, IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";

/**
 * WebGPU前向渲染流程
 */
export class WebGPUForwardAddClusterRP extends ForwardAddClusterRP {
    /**
     * 主渲染流程
     * @param context 
     */
    protected _mainPass(context: IRenderContext3D): void {
        context.pipelineMode = this.pipelineMode; //@ts-ignore
        context.setClearData(this.clearFlag, this.clearColor, 1, 0);
        context.setRenderTarget(this.destTarget, this.clearFlag);
        (context as WebGPURenderContext3D).clearRenderTarget();

        RenderPassUtil.renderCmd(this.beforeForwardCmds, context);
        RenderPassUtil.recoverRenderContext3D(context, this.destTarget);
        RenderPassUtil.renderCmd(this.beforeSkyboxCmds, context);
        RenderPassUtil.recoverRenderContext3D(context, this.destTarget);

        if (this.skyRenderNode) {
            context.setClearData(RenderClearFlag.Depth, this.clearColor, 1, 0);
            const skyRenderElement = this.skyRenderNode.renderelements[0] as IRenderElement3D;
            if (skyRenderElement.subShader)
                context.drawRenderElementOne(skyRenderElement);
        }
        this.clearFlag = RenderClearFlag.Depth | RenderClearFlag.Stencil;

        context.setClearData(this.clearFlag, this.clearColor, 1, 0);
        if (this.enableOpaque) {
            this._opaqueList.renderQueue(context);
            this._opaqueTexturePass();
        }
        RenderPassUtil.renderCmd(this.beforeTransparentCmds, context);
        RenderPassUtil.recoverRenderContext3D(context, this.destTarget);

        context.setClearData(RenderClearFlag.Nothing, this.clearColor, 1, 0);
        this._transparent.renderQueue(context);
    }
}