import { Config } from "../../../../Config";
import { ILaya3D } from "../../../../ILaya3D";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { RenderPassStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
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
import { WebSceneRenderManager } from "../../RenderModuleData/WebModuleData/3D/WebScene3DRenderManager";
import { WebSpotLight } from "../../RenderModuleData/WebModuleData/3D/WebSpotLight";
import { WebGLCommandUniformMap } from "../RenderDevice/WebGLCommandUniformMap";
import { WebGLInternalRT } from "../RenderDevice/WebGLInternalRT";
import { WebGLForwardAddRP } from "./WebGLForwardAddRP";
import { WebGLRenderContext3D } from "./WebGLRenderContext3D";

const viewport = new Viewport(0, 0, 0, 0);
const offsetScale = new Vector4();

export class WebGLRender3DProcess implements IRender3DProcess {
    render3DManager: WebSceneRenderManager;

    private renderpass: WebGLForwardAddRP = new WebGLForwardAddRP();

    initRenderpass(camera: Camera, context: WebGLRenderContext3D) {
        let renderpass = this.renderpass.renderpass;

        let renderRT = camera._getRenderTexture();

        // clear
        let clearConst = 0;
        let clearFlag: CameraClearFlags = camera.clearFlag;

        if (clearFlag == CameraClearFlags.Sky && !camera.scene.skyRenderer._isAvailable()) {
            clearFlag = CameraClearFlags.SolidColor;
        }

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
        clearValue = renderRT.gammaCorrection != 1 ? camera.clearColor : camera._linearClearColor;

        renderpass.camera = <WebCameraNodeData>camera._renderDataModule;

        renderpass.destTarget = renderRT._renderTarget;
        renderpass.clearFlag = clearConst;
        renderpass.clearColor = clearValue;

        let needInternalRT = camera._needInternalRenderTexture();

        if (needInternalRT) {
            viewport.set(0, 0, renderRT.width, renderRT.height);
        }
        else {
            camera.viewport.cloneTo(viewport);
        }

        renderpass.setViewPort(viewport);
        let scissor = Vector4.TEMP;
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

        if (clearFlag == CameraClearFlags.Sky) {
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
            let shadowParams = this.renderpass.shadowParams;
            shadowParams.setValue(0, 0, 0, 0);

            // direction light shadow
            let sceneShaderData = context.sceneData;

            let mainDirectionLight = camera.scene._mainDirectionLight;
            let needDirectionShadow = mainDirectionLight && mainDirectionLight.shadowMode != ShadowMode.None;
            this.renderpass.enableDirectLightShadow = needDirectionShadow;
            if (needDirectionShadow) {
                this.renderpass.directLightShadowPass.camera = <WebCameraNodeData>camera._renderDataModule;
                this.renderpass.directLightShadowPass.light = <WebDirectLight>mainDirectionLight._dataModule;
                let directionShadowMap = ILaya3D.Scene3D._shadowCasterPass.getDirectLightShadowMap(mainDirectionLight);
                this.renderpass.directLightShadowPass.destTarget = directionShadowMap._renderTarget as WebGLInternalRT;
                shadowParams.x = this.renderpass.directLightShadowPass.light.shadowStrength;

                sceneShaderData.setTexture(ShadowCasterPass.SHADOW_MAP, directionShadowMap);
            }

            // spot light shadow
            let mainSpotLight = camera.scene._mainSpotLight;
            let needSpotShadow = mainSpotLight && mainSpotLight.shadowMode != ShadowMode.None;
            this.renderpass.enableSpotLightShadowPass = needSpotShadow;
            if (needSpotShadow) {
                this.renderpass.spotLightShadowPass.light = <WebSpotLight>mainSpotLight._dataModule;
                let spotShadowMap = ILaya3D.Scene3D._shadowCasterPass.getSpotLightShadowPassData(mainSpotLight);
                this.renderpass.spotLightShadowPass.destTarget = spotShadowMap._renderTarget;
                shadowParams.y = this.renderpass.spotLightShadowPass.light.shadowStrength;

                sceneShaderData.setTexture(ShadowCasterPass.SHADOW_SPOTMAP, spotShadowMap);
            }
            sceneShaderData.setVector(ShadowCasterPass.SHADOW_PARAMS, this.renderpass.shadowParams);
        }

        renderpass.blitOpaqueBuffer.clear();
        let needBlitOpaque = camera.opaquePass;
        renderpass.enableOpaqueTexture = needBlitOpaque;
        if (needBlitOpaque) {
            renderpass.opaqueTexture = camera._opaqueTexture._renderTarget;
            renderpass.blitOpaqueBuffer.blitScreenQuad(renderRT, camera._opaqueTexture);
        }

        if (Stat.enablePostprocess && camera.postProcess && camera.postProcess.enable && camera.postProcess.effects.length > 0) {
            this.renderpass.enablePostProcess = Stat.enablePostprocess;
            this.renderpass.postProcess = camera.postProcess._context.command;
            camera.postProcess._render(camera);
            this.renderpass.postProcess._apply(false);
        } else {
            this.renderpass.enablePostProcess = false;
        }

        this.renderpass.finalize.clear();
        if (!this.renderpass.enablePostProcess && needInternalRT && camera._offScreenRenderTexture) {
            let dst = camera._offScreenRenderTexture;

            offsetScale.setValue(camera.normalizedViewport.x, 1.0 - camera.normalizedViewport.y, renderRT.width / dst.width, -renderRT.height / dst.height);
            this.renderpass.finalize.blitScreenQuad(renderRT, camera._offScreenRenderTexture, offsetScale);
        }

        if (this.renderpass.enableDirectLightShadow || this.renderpass.enableSpotLightShadowPass) {
            let sceneShaderData = context.sceneData;
            let shadowUniformMap = <WebGLCommandUniformMap>ShadowCasterPass.ShadowUniformMap;
            if (Config._uniformBlock) {
                let shadowBuffer = sceneShaderData.createSubUniformBuffer("Shadow", "Shadow", shadowUniformMap._idata);
            }
        }

    }

    renderDepth(camera: Camera) {
        let depthMode = camera.depthTextureMode;
        if (camera.postProcess && camera.postProcess.enable) {
            depthMode |= camera.postProcess.cameraDepthTextureMode;
        }
        if ((depthMode & DepthTextureMode.Depth) != 0) {
            let needDepthTex = camera.canblitDepth && camera._internalRenderTexture.depthStencilTexture;
            if (needDepthTex) {
                camera.depthTexture = camera._cacheDepthTexture.depthStencilTexture;
                // @ts-ignore
                Camera.depthPass._depthTexture = camera.depthTexture;
                camera._shaderValues.setTexture(DepthPass.DEPTHTEXTURE, camera.depthTexture);
                Camera.depthPass._setupDepthModeShaderValue(DepthTextureMode.Depth, camera);
                depthMode &= ~DepthTextureMode.Depth;
            }
            else {
                Camera.depthPass.getTarget(camera, DepthTextureMode.Depth, camera.depthTextureFormat);
                this.renderpass.renderpass.depthTarget = (<RenderTexture>camera.depthTexture)._renderTarget;
                camera._shaderValues.setTexture(DepthPass.DEPTHTEXTURE, camera.depthTexture);
            }
        }
        if ((depthMode & DepthTextureMode.DepthNormals) != 0) {
            Camera.depthPass.getTarget(camera, DepthTextureMode.DepthNormals, camera.depthTextureFormat);
            this.renderpass.renderpass.depthNormalTarget = (<RenderTexture>camera.depthNormalTexture)._renderTarget;
            camera._shaderValues.setTexture(DepthPass.DEPTHNORMALSTEXTURE, camera.depthNormalTexture);
        }
        this.renderpass.renderpass.depthTextureMode = depthMode;
    }

    fowardRender(context: WebGLRenderContext3D, camera: Camera): void {
        let time: number;
        this.initRenderpass(camera, context);

        this.renderDepth(camera);

        let renderList = this.render3DManager.baseRenderList.elements;
        let count = this.render3DManager.baseRenderList.length;

        this.renderFowarAddCameraPass(context, this.renderpass, renderList, count);

        Camera.depthPass.cleanUp();
    }

    renderFowarAddCameraPass(context: WebGLRenderContext3D, renderpass: WebGLForwardAddRP, list: WebBaseRenderNode[], count: number): void {
        //先渲染ShadowTexture
        var time = performance.now();//T_Render_ShadowPassMode Stat
        if (renderpass.shadowCastPass) {
            if (renderpass.enableDirectLightShadow) {
                context.sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
                context.sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
                renderpass.directLightShadowPass.update(context);
                renderpass.directLightShadowPass.render(context, list, count);
            }
            if (renderpass.enableSpotLightShadowPass) {
                context.sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
                context.sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
                renderpass.spotLightShadowPass.update(context);
                renderpass.spotLightShadowPass.render(context, list, count);
            }

            if (renderpass.enableDirectLightShadow) {
                context.sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
            }
            else {
                context.sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
            }
            if (renderpass.enableSpotLightShadowPass) {
                context.sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
            }
            else {
                context.sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
            }
        }
        Stat.renderPassStatArray[RenderPassStatisticsInfo.T_Render_ShadowPassMode] += (performance.now() - time);//Stat

        renderpass.renderpass.render(context, list, count);
        renderpass._beforeImageEffectCMDS && this._rendercmd(renderpass._beforeImageEffectCMDS, context)

        if (renderpass.enablePostProcess) {
            time = performance.now();//T_Render_PostProcess Stat
            renderpass.postProcess && this._renderPostProcess(renderpass.postProcess, context);
            Stat.renderPassStatArray[RenderPassStatisticsInfo.T_Render_PostProcess] += (performance.now() - time);//Stat
        }
        renderpass._afterAllRenderCMDS && this._rendercmd(renderpass._afterAllRenderCMDS, context);

        renderpass.finalize._apply(false);
        context.runCMDList(renderpass.finalize._renderCMDs);
    }

    /**
     * @param cmds
     * @param context
     * @private
     */
    private _rendercmd(cmds: CommandBuffer[], context: WebGLRenderContext3D) {
        if (!cmds || cmds.length == 0)
            return;

        var time = performance.now();//T_Render_CameraEventCMD Stat
        cmds.forEach(function (value) {
            context.runCMDList(value._renderCMDs);
        });
        Stat.renderPassStatArray[RenderPassStatisticsInfo.T_Render_CameraEventCMD] += (performance.now() - time);//Stat
    }

    /**
     * @param postprocessCMD
     * @param context
     * @private
     */
    private _renderPostProcess(postprocessCMD: CommandBuffer, context: WebGLRenderContext3D) {
        context.runCMDList(postprocessCMD._renderCMDs);
    }

    destroy(): void {
        this.renderpass.destroy();
    }

}