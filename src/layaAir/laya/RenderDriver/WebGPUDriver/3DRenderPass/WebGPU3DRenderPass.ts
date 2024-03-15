import { ILaya3D } from "../../../../ILaya3D";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { Camera, CameraClearFlags, CameraEventFlags } from "../../../d3/core/Camera";
import { ShadowMode } from "../../../d3/core/light/ShadowMode";
import { RenderContext3D } from "../../../d3/core/render/RenderContext3D";
import { Scene3D } from "../../../d3/core/scene/Scene3D";
import { Scene3DShaderDeclaration } from "../../../d3/core/scene/Scene3DShaderDeclaration";
import { ShadowCasterPass } from "../../../d3/shadowMap/ShadowCasterPass";
import { Vector4 } from "../../../maths/Vector4";
import { Stat } from "../../../utils/Stat";
import { IRender3DProcess } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebDirectLight } from "../../RenderModuleData/WebModuleData/3D/WebDirectLight";
import { WebCameraNodeData } from "../../RenderModuleData/WebModuleData/3D/WebModuleData";
import { WebGLForwardAddRP } from "../../WebGLDriver/3DRenderPass/WebGLForwardAddRP";
import { WebGLRenderContext3D } from "../../WebGLDriver/3DRenderPass/WebGLRenderContext3D";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";

export class WebGPU3DRenderPass implements IRender3DProcess {
    private renderpass: WebGLForwardAddRP = new WebGLForwardAddRP();

    globalId: number;
    objectName: string = 'WebGPU3DRenderPass';

    constructor() {
        this.globalId = WebGPUGlobal.getId(this);
    }

    initRenderPass(camera: Camera, context: WebGLRenderContext3D) {
        let renderpass = this.renderpass.renderpass;

        let renderRT = camera._getRenderTexture();
        let viewport = camera.viewport;

        // clear
        let clearConst = 0;
        let clearFlag: CameraClearFlags = camera.clearFlag;
        let hasStencil = renderRT.depthStencilFormat == RenderTargetFormat.DEPTHSTENCIL_24_8;
        let stencilFlag = hasStencil ? RenderClearFlag.Stencil : 0;

        switch (clearFlag) {
            case CameraClearFlags.DepthOnly:
            case CameraClearFlags.Sky:
                clearConst = RenderClearFlag.Depth | stencilFlag;
                break;
            case CameraClearFlags.Nothing:
                clearConst = 0;
                break;
            case CameraClearFlags.ColorOnly:
                clearConst = RenderClearFlag.Color;
                break;
            case CameraClearFlags.SolidColor:
            default:
                clearConst = RenderClearFlag.Color | RenderClearFlag.Depth | stencilFlag;
                break;
        }

        let clearValue = camera._linearClearColor;
        clearValue = renderRT._texture.gammaCorrection != 1 ? camera.clearColor : camera._linearClearColor;

        renderpass.camera = <WebCameraNodeData>camera._renderDataModule;

        renderpass.destTarget = renderRT._renderTarget;
        renderpass.clearFlag = clearConst;
        renderpass.clearColor = clearValue;

        renderpass.setViewPort(viewport);
        let scissor = Vector4.tempVec4;
        scissor.setValue(viewport.x, viewport.y, viewport.width, viewport.height);
        // todo
        renderpass.setScissor(scissor);

        renderpass.enableOpaque = Stat.enableOpaque;
        renderpass.enableTransparent = Stat.enableTransparent;
        renderpass.enableCMD = Stat.enableCameraCMD;
        renderpass.setBeforeSkyboxCmds(camera._cameraEventCommandBuffer[CameraEventFlags.BeforeSkyBox]);
        renderpass.setBeforeForwardCmds(camera._cameraEventCommandBuffer[CameraEventFlags.BeforeForwardOpaque]);
        renderpass.setBeforeTransparentCmds(camera._cameraEventCommandBuffer[CameraEventFlags.BeforeTransparent]);
        this.renderpass.setBeforeImageEffect(camera._cameraEventCommandBuffer[CameraEventFlags.BeforeImageEffect]);
        this.renderpass.setAfterEventCmd(camera._cameraEventCommandBuffer[CameraEventFlags.AfterEveryThing]);

        renderpass.setCameraCullInfo(camera);

        if (camera.clearFlag == CameraClearFlags.Sky) {
            renderpass.skyRenderNode = <WebBaseRenderNode>camera.scene.skyRenderer._baseRenderNode;
        }
        else {
            renderpass.skyRenderNode = null;
        }

        // todo 
        renderpass.pipelineMode = RenderContext3D._instance.configPipeLineMode;

        let enableShadow = Scene3D._updateMark % camera.scene._ShadowMapupdateFrequency == 0 && Stat.enableShadow;
        this.renderpass.shadowCastPass = enableShadow;

        if (enableShadow) {
            // direction light shadow
            let mainDirectionLight = camera.scene._mainDirectionLight;
            let needDirectionShadow = mainDirectionLight && mainDirectionLight.shadowMode != ShadowMode.None;
            if (needDirectionShadow) {
                camera.scene._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
            }
            else {
                camera.scene._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
            }

            this.renderpass.enableDirectLightShadow = needDirectionShadow;
            if (needDirectionShadow) {
                this.renderpass.directLightShadowPass.camera = <WebCameraNodeData>camera._renderDataModule;
                this.renderpass.directLightShadowPass.light = <WebDirectLight>mainDirectionLight._dataModule;
                let directionShadowMap = ILaya3D.Scene3D._shadowCasterPass.getDirectLightShadowMap(mainDirectionLight);
                this.renderpass.directLightShadowPass.destTarget = directionShadowMap._renderTarget;

                camera.scene._shaderValues.setTexture(ShadowCasterPass.SHADOW_MAP, directionShadowMap);
            }

            // spot light shadow
            let mainSpotLight = camera.scene._mainSpotLight;
            let needSpotShadow = mainSpotLight && mainSpotLight.shadowMode != ShadowMode.None;
            if (needSpotShadow) {
                camera.scene._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
            }
            else {
                camera.scene._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
            }
            this.renderpass.enableSpotLightShadowPass = needSpotShadow;
            if (needSpotShadow) {
                this.renderpass.spotLightShadowPass.light = mainSpotLight;
                let spotShadowMap = ILaya3D.Scene3D._shadowCasterPass.getSpotLightShadowPassData(mainSpotLight);
                this.renderpass.spotLightShadowPass.destTarget = spotShadowMap._renderTarget;

                camera.scene._shaderValues.setTexture(ShadowCasterPass.SHADOW_SPOTMAP, spotShadowMap);
            }
        }
    }

    fowardRender(context: WebGPURenderContext3D, camera: Camera): void {
        //@ts-ignore
        this.initRenderPass(camera, context);
        let renderList = <WebBaseRenderNode[]>camera.scene.sceneRenderableManager.renderBaselist.elements;
        //@ts-ignore
        this.renderpass.renderpass.render(context, renderList, renderList.length);
    }

    destroy() {
        WebGPUGlobal.releaseId(this);
    }
}