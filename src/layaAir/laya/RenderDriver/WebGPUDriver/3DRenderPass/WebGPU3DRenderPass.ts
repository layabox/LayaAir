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
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPUStatis } from "../RenderDevice/WebGPUStatis/WebGPUStatis";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";

export class WebGPU3DRenderPass implements IRender3DProcess {
    private _renderPass: WebGLForwardAddRP = new WebGLForwardAddRP();

    globalId: number;
    objectName: string = 'WebGPU3DRenderPass';

    constructor() {
        this.globalId = WebGPUGlobal.getId(this);
    }

    /**
     * 初始化渲染流程
     * @param camera 
     * @param context 
     */
    initRenderPass(camera: Camera, context: WebGPURenderContext3D) {
        const renderPass = this._renderPass.renderpass;
        const renderRT = camera._getRenderTexture();
        const viewport = camera.viewport;

        // clear
        let clearConst = 0;
        const clearFlag: CameraClearFlags = camera.clearFlag;
        const hasStencil = renderRT.depthStencilFormat === RenderTargetFormat.DEPTHSTENCIL_24_8;
        const stencilFlag = hasStencil ? RenderClearFlag.Stencil : 0;

        switch (clearFlag) {
            case CameraClearFlags.DepthOnly:
            case CameraClearFlags.Sky:
                clearConst = RenderClearFlag.Depth | stencilFlag;
                break;
            case CameraClearFlags.Nothing:
                clearConst = RenderClearFlag.Nothing;
                break;
            case CameraClearFlags.ColorOnly:
                clearConst = RenderClearFlag.Color;
                break;
            case CameraClearFlags.SolidColor:
            default:
                clearConst = RenderClearFlag.Color | RenderClearFlag.Depth | stencilFlag;
                break;
        }

        const clearValue = renderRT._texture.gammaCorrection !== 1 ? camera.clearColor : camera._linearClearColor;
        renderPass.camera = <WebCameraNodeData>camera._renderDataModule;

        renderPass.destTarget = renderRT._renderTarget;
        renderPass.clearFlag = clearConst;
        renderPass.clearColor = clearValue;

        renderPass.setViewPort(viewport);
        const scissor = Vector4.tempVec4;
        scissor.setValue(viewport.x, viewport.y, viewport.width, viewport.height);
        renderPass.setScissor(scissor);

        renderPass.enableOpaque = Stat.enableOpaque;
        renderPass.enableTransparent = Stat.enableTransparent;
        renderPass.enableCMD = Stat.enableCameraCMD;
        renderPass.setBeforeSkyboxCmds(camera._cameraEventCommandBuffer[CameraEventFlags.BeforeSkyBox]);
        renderPass.setBeforeForwardCmds(camera._cameraEventCommandBuffer[CameraEventFlags.BeforeForwardOpaque]);
        renderPass.setBeforeTransparentCmds(camera._cameraEventCommandBuffer[CameraEventFlags.BeforeTransparent]);
        this._renderPass.setBeforeImageEffect(camera._cameraEventCommandBuffer[CameraEventFlags.BeforeImageEffect]);
        this._renderPass.setAfterEventCmd(camera._cameraEventCommandBuffer[CameraEventFlags.AfterEveryThing]);

        renderPass.setCameraCullInfo(camera);

        if (camera.clearFlag === CameraClearFlags.Sky)
            renderPass.skyRenderNode = <WebBaseRenderNode>camera.scene.skyRenderer._baseRenderNode;
        else renderPass.skyRenderNode = null;

        renderPass.pipelineMode = RenderContext3D._instance.configPipeLineMode;

        const enableShadow = Scene3D._updateMark % camera.scene._ShadowMapupdateFrequency === 0 && Stat.enableShadow;
        this._renderPass.shadowCastPass = enableShadow;

        if (enableShadow) {
            // direction light shadow
            const mainDirectionLight = camera.scene._mainDirectionLight;
            const needDirectionShadow = mainDirectionLight && mainDirectionLight.shadowMode !== ShadowMode.None;
            if (needDirectionShadow)
                camera.scene._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
            else camera.scene._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);

            this._renderPass.enableDirectLightShadow = needDirectionShadow;
            if (needDirectionShadow) {
                this._renderPass.directLightShadowPass.camera = <WebCameraNodeData>camera._renderDataModule;
                this._renderPass.directLightShadowPass.light = <WebDirectLight>mainDirectionLight._dataModule;
                let directionShadowMap = ILaya3D.Scene3D._shadowCasterPass.getDirectLightShadowMap(mainDirectionLight);
                this._renderPass.directLightShadowPass.destTarget = directionShadowMap._renderTarget as any;
                camera.scene._shaderValues.setTexture(ShadowCasterPass.SHADOW_MAP, directionShadowMap);
            }
            // spot light shadow
            const mainSpotLight = camera.scene._mainSpotLight;
            const needSpotShadow = mainSpotLight && mainSpotLight.shadowMode !== ShadowMode.None;
            if (needSpotShadow)
                camera.scene._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
            else camera.scene._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
            this._renderPass.enableSpotLightShadowPass = needSpotShadow;
            if (needSpotShadow) {
                this._renderPass.spotLightShadowPass.light = mainSpotLight;
                const spotShadowMap = ILaya3D.Scene3D._shadowCasterPass.getSpotLightShadowPassData(mainSpotLight);
                this._renderPass.spotLightShadowPass.destTarget = spotShadowMap._renderTarget;
                camera.scene._shaderValues.setTexture(ShadowCasterPass.SHADOW_SPOTMAP, spotShadowMap);
            }
        }
    }

    fowardRender(context: WebGPURenderContext3D, camera: Camera): void {
        WebGPUStatis.startFrame();
        this.initRenderPass(camera, context);
        const renderList = <WebBaseRenderNode[]>camera.scene.sceneRenderableManager.renderBaselist.elements;
        this._renderPass.renderpass.render(context as any, renderList, renderList.length);
    }

    destroy() {
        WebGPUGlobal.releaseId(this);
    }
}