import { RenderClearFlag } from "../../RenderEngine/RenderEnum/RenderClearFlag";
import { CommandBuffer } from "../../d3/core/render/command/CommandBuffer";
import { Vector4 } from "../../maths/Vector4";
import { Viewport } from "../../maths/Viewport";
import { IRenderContext3D } from "../DriverDesign/3DRenderPass/I3DRenderPass";
import { InternalRenderTarget } from "../DriverDesign/RenderDevice/InternalRenderTarget";

/**
 * 渲染流程通用工具类
 */
export class RenderPassUtil {
    static contextViewPortCache: Viewport = new Viewport();
    static contextScissorCache: Vector4 = new Vector4();

    /**
     * 执行渲染命令
     * @param cmds 
     * @param context 
     */
    static renderCmd(cmds: CommandBuffer[], context: IRenderContext3D) {
        if (cmds && cmds.length > 0)
            cmds.forEach(value => context.runCMDList(value._renderCMDs));
    }

    /**
     * 恢复渲染上下文
     * @param context 
     * @param renderTarget 
     */
    static recoverRenderContext3D(context: IRenderContext3D, renderTarget: InternalRenderTarget) {
        context.setViewPort(this.contextViewPortCache);
        context.setScissor(this.contextScissorCache);
        context.setRenderTarget(renderTarget, RenderClearFlag.Nothing);
    }
}