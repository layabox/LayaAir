
import { Camera, CameraClearFlags, CameraEventFlags } from "../../../../../d3/core/Camera";
import { ShadowMode } from "../../../../../d3/core/light/ShadowMode";
import { ShadowMapFormat, ShadowUtils } from "../../../../../d3/core/light/ShadowUtils";
import { RenderContext3D } from "../../../../../d3/core/render/RenderContext3D";
import { Scene3D } from "../../../../../d3/core/scene/Scene3D";
import { DepthPass } from "../../../../../d3/depthMap/DepthPass";
import { ShadowCasterPass } from "../../../../../d3/shadowMap/ShadowCasterPass";
import { LayaGL } from "../../../../../layagl/LayaGL";
import { StatElement } from "../../../../../layagl/StatisticsContext";
import { Vector4 } from "../../../../../maths/Vector4";
import { Viewport } from "../../../../../maths/Viewport";
import { RenderClearFlag } from "../../../../../RenderEngine/RenderEnum/RenderClearFlag";
import { RenderTargetFormat } from "../../../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { DepthTextureMode, RenderTexture } from "../../../../../resource/RenderTexture";
import { Browser } from "../../../../../utils/Browser";
import { Stat } from "../../../../../utils/Stat";
import { IForwardAddRP, IRender3DProcess, IRenderContext3D } from "../../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { WebBaseRenderNode } from "../WebBaseRenderNode";
import { WebSceneRenderManager } from "../WebScene3DRenderManager";
import { CommandBuffer } from "../../../../../d3/core/render/command/CommandBuffer";

const viewport = new Viewport(0, 0, 0, 0);
const offsetScale = new Vector4();
export class WebRender3DProcess implements IRender3DProcess {
    render3DManager: WebSceneRenderManager;

    _renderPass: IForwardAddRP;

    protected _defaultDepthTex: RenderTexture;
    protected _defaultShadowMap: RenderTexture;
    constructor() {
        this._defaultDepthTex = RenderTexture.createFromPool(1, 1, RenderTargetFormat.DEPTH_32, RenderTargetFormat.None, false, 1);
        this._defaultShadowMap = ShadowUtils.getTemporaryShadowTexture(1, 1, ShadowMapFormat.bit16);
        let shadowMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("Shadow");
        shadowMap.setDefaultTextureData(ShadowCasterPass.SHADOW_MAP, this._defaultShadowMap);
        shadowMap.setDefaultTextureData(ShadowCasterPass.SHADOW_SPOTMAP, this._defaultShadowMap);
    }

    /**
    * 渲染命令
    * @param cmds 
    * @param context 
    */
    protected _renderCmd(cmds: CommandBuffer[], context: IRenderContext3D) {
        if (cmds && cmds.length > 0)
            cmds.forEach(value => context.runCMDList(value._renderCMDs));
    }

    /**
     * 渲染后处理效果
     * @param postprocessCMD 
     * @param context 
     */
    protected _renderPostProcess(postprocessCMD: CommandBuffer, context: IRenderContext3D) {
        context.runCMDList(postprocessCMD._renderCMDs);
    }

    protected _initRenderPass(camera: Camera, context: IRenderContext3D) {

        const renderPass = this._renderPass.mainRenderpass;
        const renderRT = camera._getRenderTexture();

        //renderpass clear set
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

        renderPass.camera = camera;
        renderPass.destTarget = renderRT._renderTarget;
        renderPass.clearFlag = clearConst;
        renderPass.clearColor = clearValue;

        let needInternalRT = camera._needInternalRenderTexture();

        //设置合批流程里面的裁剪数据
        renderPass.setCameraCullInfo(this.render3DManager);

        if (needInternalRT) {
            viewport.set(0, 0, renderRT.width, renderRT.height);
        }
        else {
            camera.viewport.cloneTo(viewport);
        }

        renderPass.setViewPort(viewport);
        let scissor = Vector4.TEMP;
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

        if (camera.clearFlag === CameraClearFlags.Sky)
            renderPass.skyRenderNode = <WebBaseRenderNode>camera.scene.skyRenderer._baseRenderNode;
        else renderPass.skyRenderNode = null;

        renderPass.pipelineMode = RenderContext3D._instance.configPipeLineMode;

        const enableShadow = (Scene3D._updateMark % camera.scene._ShadowMapupdateFrequency === 0) && Stat.enableShadow;
        this._renderPass.shadowCastPass = enableShadow;
        context.preDrawUniformMaps.add("Scene3D");
        context.preDrawUniformMaps.add("Global");
        //shadow set
        if (enableShadow) {

            //直线光源阴影
            const mainDirectionLight = camera.scene._mainDirectionLight;
            const needDirectionShadow = mainDirectionLight && mainDirectionLight.shadowMode !== ShadowMode.None;
            this._renderPass.enableDirectLightShadow = needDirectionShadow;
            if (needDirectionShadow) {
                this._renderPass.dirShadowRenderPass.setRPData(mainDirectionLight._dataModule, camera._renderDataModule, context, this.render3DManager)
                this._renderPass.dirShadowRenderPass.setCameraCullInfo(this.render3DManager);
            }
            const mainSpotLight = camera.scene._mainSpotLight;
            const needSpotShadow = mainSpotLight && mainSpotLight.shadowMode !== ShadowMode.None;
            this._renderPass.enableSpotLightShadowPass = needSpotShadow;
            if (needSpotShadow) {
                this._renderPass.spotShadowRenderPass.setRPData(mainSpotLight._dataModule, context, this.render3DManager);
                this._renderPass.spotShadowRenderPass.setCameraCullInfo(this.render3DManager);
            }
            if (needDirectionShadow || needSpotShadow) {
                context.preDrawUniformMaps.add("Shadow");
            }

        } else {
            context.preDrawUniformMaps.delete("Shadow");
        }


        if (Stat.enablePostprocess && camera.postProcess && camera.postProcess.enable && camera.postProcess.effects.length > 0) {
            this._renderPass.enablePostProcess = camera.postProcess.enable;
            this._renderPass.postProcess = camera.postProcess._context.command;
            camera.postProcess._render(camera);
            this._renderPass.postProcess._apply(false);
        }
        else
            this._renderPass.enablePostProcess = false;

        this._renderPass.finalize.clear();

        if (!this._renderPass.enablePostProcess && needInternalRT && camera._offScreenRenderTexture) {

            let dst = camera._offScreenRenderTexture;

            if (LayaGL.renderEngine._screenInvertY) {
                offsetScale.setValue(camera.normalizedViewport.x, camera.normalizedViewport.y, renderRT.width / dst.width, renderRT.height / dst.height);
            } else
                offsetScale.setValue(camera.normalizedViewport.x, 1.0 - camera.normalizedViewport.y, renderRT.width / dst.width, -renderRT.height / dst.height);

            this._renderPass.finalize.blitScreenQuad(renderRT, camera._offScreenRenderTexture, offsetScale);
        }
    }

    protected _renderDepth(camera: Camera) {
        let depthMode = camera.depthTextureMode;
        if (camera.postProcess && camera.postProcess.enable) {
            depthMode |= camera.postProcess.cameraDepthTextureMode;
        }
        if ((depthMode & DepthTextureMode.Depth) != 0) {

            Camera.depthPass.getTarget(camera, DepthTextureMode.Depth, camera.depthTextureFormat);
            this._renderPass.mainRenderpass.depthTarget = (<RenderTexture>camera.depthTexture)._renderTarget;
            Camera.depthPass._setupDepthModeShaderValue(DepthTextureMode.Depth, camera);
        }
        if ((depthMode & DepthTextureMode.DepthNormals) != 0) {
            Camera.depthPass.getTarget(camera, DepthTextureMode.DepthNormals, camera.depthTextureFormat);
            this._renderPass.mainRenderpass.depthNormalTarget = (<RenderTexture>camera.depthNormalTexture)._renderTarget;
            camera._shaderValues.setTexture(DepthPass.DEPTHNORMALSTEXTURE, camera.depthNormalTexture);
            Camera.depthPass._setupDepthModeShaderValue(DepthTextureMode.DepthNormals, camera);
        }
        this._renderPass.mainRenderpass.depthTextureMode = depthMode;
    }

    /**
     * 前向渲染流程
     * @param context 
     * @param renderPass 
     * @param list 
     * @param count 
     */
    protected _renderForwardAddCameraPass(context: IRenderContext3D, renderPass: IForwardAddRP) {

        var time = Browser.now();//T_Render_ShadowPassMode Stat

        context.cameraData.setTexture(DepthPass.DEPTHTEXTURE, this._defaultDepthTex);
        if (renderPass.shadowCastPass) {

            context.sceneData.setTexture(ShadowCasterPass.SHADOW_MAP, this._defaultShadowMap);
            context.sceneData.setTexture(ShadowCasterPass.SHADOW_SPOTMAP, this._defaultShadowMap);
            if (renderPass.enableDirectLightShadow) {
                renderPass.dirShadowRenderPass.update(context);
                renderPass.dirShadowRenderPass.render(context, this.render3DManager);
            }
            if (renderPass.enableSpotLightShadowPass) {
                renderPass.spotShadowRenderPass.update(context);
                renderPass.spotShadowRenderPass.render(context, this.render3DManager);
            }
        }
        if (renderPass.enableDirectLightShadow) {
            renderPass.dirShadowRenderPass.useRPResource(context);
        }
        else {
            renderPass.dirShadowRenderPass.unuseRPResource(context);
        }

        if (renderPass.enableSpotLightShadowPass) {
            renderPass.spotShadowRenderPass.useRPResource(context);
        }
        else {
            renderPass.spotShadowRenderPass.unuseRPResource(context);

        }
        LayaGL.statAgent.recordTimeData(StatElement.T_ShadowPass, Browser.now() - time);//Stat

        renderPass.mainRenderpass.render(context, this.render3DManager);
        renderPass.runBeforeImageEffectCMD(context);

        if (renderPass.enablePostProcess && renderPass.postProcess) {
            time = Browser.now();
            this._renderPostProcess(renderPass.postProcess, context);
            LayaGL.statAgent.recordTimeData(StatElement.T_Render_PostProcess, Browser.now() - time);//Stat
        }


        renderPass.runAfterEventCMD(context);
        renderPass.finalize._apply(false);
        context.runCMDList(renderPass.finalize._renderCMDs);
    }

    fowardRender(context: IRenderContext3D, camera: Camera): void {
        Camera.depthPass.cleanUp(camera);
        this._renderDepth(camera);
        this._initRenderPass(camera, context);
        this._renderForwardAddCameraPass(context, this._renderPass);
    }



    destroy(): void {
        this._defaultDepthTex.destroy();
        this._defaultDepthTex = null;

        this._renderPass.destroy();
    }

}
