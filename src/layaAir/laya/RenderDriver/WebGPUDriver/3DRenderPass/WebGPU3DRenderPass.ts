import { ILaya3D } from "../../../../ILaya3D";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { Camera, CameraClearFlags, CameraEventFlags } from "../../../d3/core/Camera";
import { ShadowMode } from "../../../d3/core/light/ShadowMode";
import { RenderContext3D } from "../../../d3/core/render/RenderContext3D";
import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { Scene3D } from "../../../d3/core/scene/Scene3D";
import { Scene3DShaderDeclaration } from "../../../d3/core/scene/Scene3DShaderDeclaration";
import { DepthPass } from "../../../d3/depthMap/DepthPass";
import { ShadowCasterPass } from "../../../d3/shadowMap/ShadowCasterPass";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { DepthTextureMode, RenderTexture } from "../../../resource/RenderTexture";
import { Stat } from "../../../utils/Stat";
import { IRender3DProcess } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebDirectLight } from "../../RenderModuleData/WebModuleData/3D/WebDirectLight";
import { WebCameraNodeData } from "../../RenderModuleData/WebModuleData/3D/WebModuleData";
import { WebSpotLight } from "../../RenderModuleData/WebModuleData/3D/WebSpotLight";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPUStatis } from "../RenderDevice/WebGPUStatis/WebGPUStatis";
import { WebGPUForwardAddRP } from "./WebGPUForwardAddRP";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";

const viewport = new Viewport(0, 0, 0, 0);

export class WebGPU3DRenderPass implements IRender3DProcess {
    private _renderPass: WebGPUForwardAddRP;

    globalId: number;
    objectName: string = 'WebGPU3DRenderPass';

    constructor() {
        this._renderPass = new WebGPUForwardAddRP();
        this.globalId = WebGPUGlobal.getId(this);
    }

    /**
     * 初始化渲染流程
     * @param camera 
     * @param context 
     */
    private _initRenderPass(camera: Camera, context: WebGPURenderContext3D) {
        const renderPass = this._renderPass.renderPass;
        const renderRT = camera._getRenderTexture();

        let clearConst = 0;
        const clearFlag: CameraClearFlags = camera.clearFlag;
        const hasStencil = renderRT.depthStencilFormat === RenderTargetFormat.DEPTHSTENCIL_24_8;
        const stencilFlag = hasStencil ? RenderClearFlag.Stencil : 0;

        switch (clearFlag) {
            case CameraClearFlags.DepthOnly:
                clearConst = RenderClearFlag.Depth | stencilFlag;
                break;
            case CameraClearFlags.Nothing:
                clearConst = RenderClearFlag.Nothing;
                break;
            case CameraClearFlags.ColorOnly:
                clearConst = RenderClearFlag.Color;
                break;
            case CameraClearFlags.Sky:
            case CameraClearFlags.SolidColor:
            default:
                clearConst = RenderClearFlag.Color | RenderClearFlag.Depth | stencilFlag;
                break;
        }

        const clearValue = renderRT._texture.gammaCorrection !== 1 ? camera.clearColor : camera._linearClearColor;
        renderPass.camera = camera._renderDataModule;

        renderPass.destTarget = renderRT._renderTarget;
        renderPass.clearFlag = clearConst;
        renderPass.clearColor = clearValue;

        viewport.set(0, 0, renderRT.width, renderRT.height);
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

        const enableShadow = (Scene3D._updateMark % camera.scene._ShadowMapupdateFrequency === 0) && Stat.enableShadow;
        this._renderPass.shadowCastPass = enableShadow;

        if (enableShadow) {
            const shadowParams = this._renderPass.shadowParams;
            shadowParams.setValue(0, 0, 0, 0);

            //直线光源阴影
            const mainDirectionLight = camera.scene._mainDirectionLight;
            const needDirectionShadow = mainDirectionLight && mainDirectionLight.shadowMode !== ShadowMode.None;
            this._renderPass.enableDirectLightShadow = needDirectionShadow;
            if (needDirectionShadow) {
                this._renderPass.directLightShadowPass.camera = <WebCameraNodeData>camera._renderDataModule;
                this._renderPass.directLightShadowPass.light = <WebDirectLight>mainDirectionLight._dataModule;
                const directionShadowMap = ILaya3D.Scene3D._shadowCasterPass.getDirectLightShadowMap(mainDirectionLight);
                this._renderPass.directLightShadowPass.destTarget = directionShadowMap._renderTarget;
                shadowParams.x = this._renderPass.directLightShadowPass.light.shadowStrength;
                camera.scene._shaderValues.setTexture(ShadowCasterPass.SHADOW_MAP, directionShadowMap);
            }

            //聚光灯阴影
            const mainSpotLight = camera.scene._mainSpotLight;
            const needSpotShadow = mainSpotLight && mainSpotLight.shadowMode !== ShadowMode.None;
            this._renderPass.enableSpotLightShadowPass = needSpotShadow;
            if (needSpotShadow) {
                this._renderPass.spotLightShadowPass.light = <WebSpotLight>mainSpotLight._dataModule;
                const spotShadowMap = ILaya3D.Scene3D._shadowCasterPass.getSpotLightShadowPassData(mainSpotLight);
                this._renderPass.spotLightShadowPass.destTarget = spotShadowMap._renderTarget;
                shadowParams.y = this._renderPass.spotLightShadowPass.light.shadowStrength;
                camera.scene._shaderValues.setTexture(ShadowCasterPass.SHADOW_SPOTMAP, spotShadowMap);
            }
            camera.scene._shaderValues.setVector(ShadowCasterPass.SHADOW_PARAMS, shadowParams);
        }

        if (Stat.enablePostprocess && camera.postProcess && camera.postProcess.enable) {
            this._renderPass.enablePostProcess = Stat.enablePostprocess;
            this._renderPass.postProcess = camera.postProcess._context.command;
            camera.postProcess._render(camera);
            this._renderPass.postProcess._apply(false);
        } else this._renderPass.enablePostProcess = false;
    }

    /**
     * 渲染深度图设置
     * @param camera 
     */
    private _renderDepth(camera: Camera) {
        let depthMode = camera.depthTextureMode;
        if (camera.postProcess && camera.postProcess.enable)
            depthMode |= camera.postProcess.cameraDepthTextureMode;
        if ((depthMode & DepthTextureMode.Depth) != 0) {
            const needDepthTex = camera.canblitDepth && camera._internalRenderTexture.depthStencilTexture;
            if (needDepthTex) {
                camera.depthTexture = camera._cacheDepthTexture.depthStencilTexture; // @ts-ignore
                Camera.depthPass._depthTexture = camera.depthTexture;
                camera._shaderValues.setTexture(DepthPass.DEPTHTEXTURE, camera.depthTexture);
                Camera.depthPass._setupDepthModeShaderValue(DepthTextureMode.Depth, camera);
                depthMode &= ~DepthTextureMode.Depth;
            }
            else {
                Camera.depthPass.getTarget(camera, DepthTextureMode.Depth, camera.depthTextureFormat);
                this._renderPass.renderPass.depthTarget = (<RenderTexture>camera.depthTexture)._renderTarget;
                camera._shaderValues.setTexture(DepthPass.DEPTHTEXTURE, camera.depthTexture);
            }
        }
        if ((depthMode & DepthTextureMode.DepthNormals) != 0) {
            Camera.depthPass.getTarget(camera, DepthTextureMode.DepthNormals, camera.depthTextureFormat);
            this._renderPass.renderPass.depthNormalTarget = (<RenderTexture>camera.depthNormalTexture)._renderTarget;
            camera._shaderValues.setTexture(DepthPass.DEPTHNORMALSTEXTURE, camera.depthNormalTexture);
        }
        this._renderPass.renderPass.depthTextureMode = depthMode;
    }

    /**
     * 前向渲染流程
     * @param context 
     * @param renderPass 
     * @param list 
     * @param count 
     */
    private _renderForwardAddCameraPass(context: WebGPURenderContext3D, renderPass: WebGPUForwardAddRP, list: WebBaseRenderNode[], count: number) {
        if (renderPass.shadowCastPass) {
            if (renderPass.enableDirectLightShadow) {
                context.sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
                context.sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
                renderPass.directLightShadowPass.update(context);
                renderPass.directLightShadowPass.render(context, list, count);
            }
            if (renderPass.enableSpotLightShadowPass) {
                context.sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
                context.sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
                renderPass.spotLightShadowPass.update(context);
                renderPass.spotLightShadowPass.render(context, list, count);
            }
        }
        if (renderPass.enableDirectLightShadow)
            context.sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
        else context.sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
        if (renderPass.enableSpotLightShadowPass)
            context.sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
        else context.sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
        renderPass.renderPass.render(context, list, count);
        renderPass._beforeImageEffectCMDS && this._renderCmd(renderPass._beforeImageEffectCMDS, context);

        if (renderPass.enablePostProcess && renderPass.postProcess)
            this._renderPostProcess(renderPass.postProcess, context);

        renderPass._afterAllRenderCMDS && this._renderCmd(renderPass._afterAllRenderCMDS, context);
    }

    /**
     * 渲染命令
     * @param cmds 
     * @param context 
     */
    private _renderCmd(cmds: CommandBuffer[], context: WebGPURenderContext3D) {
        if (cmds && cmds.length > 0)
            cmds.forEach(value => context.runCMDList(value._renderCMDs));
    }

    /**
     * 渲染后处理效果
     * @param postprocessCMD 
     * @param context 
     */
    private _renderPostProcess(postprocessCMD: CommandBuffer, context: WebGPURenderContext3D) {
        context.runCMDList(postprocessCMD._renderCMDs);
    }

    /**
     * 前向渲染
     * @param context 
     * @param camera 
     */
    fowardRender(context: WebGPURenderContext3D, camera: Camera): void {
        WebGPUStatis.startFrame();
        this._initRenderPass(camera, context);
        this._renderDepth(camera);
        const renderList = <WebBaseRenderNode[]>camera.scene.sceneRenderableManager.renderBaselist.elements;
        const count = camera.scene.sceneRenderableManager.renderBaselist.length;
        this._renderForwardAddCameraPass(context, this._renderPass, renderList, count);
        Camera.depthPass.cleanUp();
    }

    /**
     * 销毁
     */
    destroy() {
        WebGPUGlobal.releaseId(this);
    }
}