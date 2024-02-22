import { IRender3DProcess } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebGLForwardAddRP } from "./WebGLForwardAddRP";
import { WebGLRenderContext3D } from "./WebGLRenderContext3D";


export class WebGLRender3DProcess implements IRender3DProcess {
    renderFowarAddCameraPass(context: WebGLRenderContext3D, renderpass: WebGLForwardAddRP, list: WebBaseRenderNode[], count: number): void {
        //先渲染ShadowTexture
        if (renderpass.shadowCastPass) {
            if (renderpass.enableDirectLightShadow) {
                renderpass.directLightShadowPass.update(context);
                renderpass.directLightShadowPass.render(context, list, count);
            }
            if (renderpass.enableSpotLightShadowPass) {
                renderpass.spotLightShadowPass.update(context);
                renderpass.spotLightShadowPass.render(context, list, count);
            }
        }
        renderpass.renderpass.render(context, list, count);

        renderpass.beforeImageEffect && renderpass.beforeImageEffect.forEach(element => {
            context.runCMDList(element._renderCMDs);
        });

        renderpass.afterEventCmd && renderpass.afterEventCmd.forEach(element => {
            context.runCMDList(element._renderCMDs);
        });
    }
}