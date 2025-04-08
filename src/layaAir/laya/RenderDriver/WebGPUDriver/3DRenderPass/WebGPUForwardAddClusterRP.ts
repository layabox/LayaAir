import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { ForwardAddClusterRP } from "../../DriverCommon/ForwardAddClusterRP";
import { RenderPassUtil } from "../../DriverCommon/RenderPassUtil";
import { IRenderContext3D, IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { WebGPU3DRenderPassFactory } from "./WebGPU3DRenderPassFactory";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";

/**
 * WebGPU前向渲染流程
 */
export class WebGPUForwardAddClusterRP extends ForwardAddClusterRP {
    constructor() {
        super();
        let context = WebGPURenderContext3D._instance;
        context._preDrawUniformMaps.add("Scene3D");

        context._preDrawUniformMaps.add("Global");
    }
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

       
        this.clearFlag = RenderClearFlag.Depth | RenderClearFlag.Stencil;

        context.setClearData(this.clearFlag, this.clearColor, 1, 0);
        if (this.enableOpaque) {
            this._opaqueList.renderQueue(context);
            this._opaqueTexturePass();
        }

        if (this.skyRenderNode) {
            const skyRenderElement = this.skyRenderNode.renderelements[0] as IRenderElement3D;
            if (skyRenderElement.subShader) {
                context.drawRenderElementOne(skyRenderElement);
            }
        }
        this.enableOpaque&&this._opaqueTexturePass();
        RenderPassUtil.renderCmd(this.beforeTransparentCmds, context);
        RenderPassUtil.recoverRenderContext3D(context, this.destTarget);

        context.setClearData(RenderClearFlag.Nothing, this.clearColor, 1, 0);
        this._transparent.renderQueue(context);
    }
}