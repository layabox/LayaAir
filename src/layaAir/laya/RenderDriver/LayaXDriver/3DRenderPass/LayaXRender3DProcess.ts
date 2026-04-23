import { Camera, CameraClearFlags, CameraEventFlags } from "../../../d3/core/Camera";
import { ShadowMode } from "../../../d3/core/light/ShadowMode";
import { ShadowMapFormat, ShadowUtils } from "../../../d3/core/light/ShadowUtils";
import { RenderContext3D } from "../../../d3/core/render/RenderContext3D";
import { Scene3D } from "../../../d3/core/scene/Scene3D";
import { DepthPass } from "../../../d3/depthMap/DepthPass";
import { ShadowCasterPass } from "../../../d3/shadowMap/ShadowCasterPass";
import { LayaGL } from "../../../layagl/LayaGL";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { DepthTextureMode, RenderTexture } from "../../../resource/RenderTexture";
import { Stat } from "../../../utils/Stat";
import { IRender3DProcess, IRenderContext3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { LayaXCameraNodeData } from "../RenderModuleData/LayaXCameraNodeData";
import { LayaXDirectLight } from "../RenderModuleData/LayaXDirectLight";
import { LayaXSpotLight } from "../RenderModuleData/LayaXSpotLight";
import { LayaXReflectionProbe } from "../RenderModuleData/LayaXReflectionProbe";
import { LayaXVolumetricGI } from "../RenderModuleData/LayaXVolumetricGI";
import { LayaXForwardAddRP } from "./LayaXForwardAddRP";

const viewport = new Viewport(0, 0, 0, 0);
const offsetScale = new Vector4();

export class LayaXRender3DProcess implements IRender3DProcess {
    private _nativeObj: any;

    private _renderPass: LayaXForwardAddRP = new LayaXForwardAddRP();

    protected _defaultDepthTex: RenderTexture;
    protected _defaultShadowMap: RenderTexture;

    constructor() {
        this._nativeObj = new (window as any).conchLayaXRT3DRenderProcess();
        this._defaultDepthTex = RenderTexture.createFromPool(1, 1, RenderTargetFormat.DEPTH_32, RenderTargetFormat.None, false, 1);
        this._defaultShadowMap = ShadowUtils.getTemporaryShadowTexture(1, 1, ShadowMapFormat.bit16);
        this._nativeObj.setDefaultShadowMap((this._defaultShadowMap._renderTarget as any)._nativeObj);
        let shadowMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("Shadow");
        shadowMap.setDefaultTextureData(ShadowCasterPass.SHADOW_MAP, this._defaultShadowMap);
        shadowMap.setDefaultTextureData(ShadowCasterPass.SHADOW_SPOTMAP, this._defaultShadowMap);
    }

    private _render3DManager: ISceneRenderManager;
    public get render3DManager(): ISceneRenderManager {
        return this._render3DManager;
    }
    public set render3DManager(value: ISceneRenderManager) {
        this._render3DManager = value;
        this._nativeObj.renderManager = (value as any)._nativeObj;
    }

    destroy(): void {
        this._renderPass = null;
    }

    initRenderpass(camera: Camera, context: IRenderContext3D) {
        // Sync camera projection params (fov/near/far/aspect) to Rust ECS for culling
        (<LayaXCameraNodeData>camera._renderDataModule).syncProjection();

        let renderpass = this._renderPass.mainRenderpass;
        let renderRT = camera._getRenderTexture();
        // clear
        let clearConst = 0;
        let clearFlag = camera.clearFlag;

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

        renderpass.camera = <LayaXCameraNodeData>camera._renderDataModule;

        renderpass.destTarget = renderRT._renderTarget;
        renderpass.clearFlag = clearConst;
        renderpass.clearColor = clearValue;

        let needInternalRT = camera._needInternalRenderTexture();

        renderpass.setCameraCullInfo(camera, this.render3DManager);

        if (needInternalRT) {
            viewport.set(0, 0, renderRT.width, renderRT.height);
        }
        else {
            camera.viewport.cloneTo(viewport);
        }

        renderpass.setViewPort(viewport);
        let scissor = Vector4.TEMP;
        scissor.setValue(viewport.x, viewport.y, viewport.width, viewport.height);
        renderpass.setScissor(scissor);

        renderpass.enableOpaque = Stat.enableOpaque;
        renderpass.enableTransparent = Stat.enableTransparent;
        renderpass.enableCMD = Stat.enableCameraCMD;
        renderpass.setBeforeForwardCmds(camera._cameraEventCommandBuffer[CameraEventFlags.BeforeForwardOpaque]);
        renderpass.setBeforeSkyboxCmds(camera._cameraEventCommandBuffer[CameraEventFlags.BeforeSkyBox]);
        renderpass.setBeforeTransparentCmds(camera._cameraEventCommandBuffer[CameraEventFlags.BeforeTransparent]);

        // Skybox render node
        if (clearFlag == CameraClearFlags.Sky) {
            renderpass.setSkyRenderNode(camera.scene.skyRenderer._baseRenderNode);
        } else {
            renderpass.setSkyRenderNode(null);
        }
        this._renderPass.setBeforeImageEffect(camera._cameraEventCommandBuffer[CameraEventFlags.BeforeImageEffect]);
        this._renderPass.setAfterEventCmd(camera._cameraEventCommandBuffer[CameraEventFlags.AfterEveryThing]);

        // todo
        renderpass.pipelineMode = RenderContext3D._instance.configPipeLineMode;

        let enableShadow = Scene3D._updateMark % camera.scene._ShadowMapupdateFrequency == 0 && Stat.enableShadow;
        this._renderPass.shadowCastPass = enableShadow;
        (window as any).conchLayaXRT3DRenderProcess._addPreDrawUniformMap("Scene3D", (context as any)._nativeObj);
        (window as any).conchLayaXRT3DRenderProcess._addPreDrawUniformMap("Global", (context as any)._nativeObj);
        context.preDrawUniformMaps = context.preDrawUniformMaps;
        if (enableShadow) {
            // direction light shadow
            let mainDirectionLight = camera.scene._mainDirectionLight;
            let needDirectionShadow = mainDirectionLight && mainDirectionLight.shadowMode != ShadowMode.None;

            this._renderPass.enableDirectLightShadow = needDirectionShadow;
            if (needDirectionShadow) {
                let dirLight = <LayaXDirectLight>mainDirectionLight._dataModule;
                let camData = <LayaXCameraNodeData>camera._renderDataModule;
                dirLight.syncShadow();
                this._renderPass.dirShadowRenderPass.setRPData(dirLight, camData, context);
                this._renderPass.dirShadowRenderPass.setCameraCullInfo(this._render3DManager);
            }

            // spot light shadow
            let mainSpotLight = camera.scene._mainSpotLight;
            let needSpotShadow = mainSpotLight && mainSpotLight.shadowMode != ShadowMode.None;
            this._renderPass.enableSpotLightShadowPass = needSpotShadow;
            if (needSpotShadow) {
                this._renderPass.spotShadowRenderPass.setRPData(
                    <LayaXSpotLight>mainSpotLight._dataModule,
                    context
                );
                this._renderPass.spotShadowRenderPass.setCameraCullInfo(this.render3DManager);
            }
            if (needDirectionShadow || needSpotShadow) {
                (window as any).conchLayaXRT3DRenderProcess._addPreDrawUniformMap("Shadow", (context as any)._nativeObj);
            }
        } else {
            (window as any).conchLayaXRT3DRenderProcess._removePreDrawUniformMap("Shadow", (context as any)._nativeObj);
        }
        context.preDrawUniformMaps = context.preDrawUniformMaps;

        if (Stat.enablePostprocess && camera.postProcess && camera.postProcess.enable && camera.postProcess.effects.length > 0) {
            this._renderPass.enablePostProcess = camera.postProcess.enable;
            camera.postProcess._render(camera);
            this._renderPass.postProcess = camera.postProcess._context.command;
        } else {
            this._renderPass.enablePostProcess = false;
        }

        this._renderPass.finalize.clear();
        this._renderPass.finalize._camera = camera;
        if (!this._renderPass.enablePostProcess && needInternalRT && camera._offScreenRenderTexture) {
            let dst = camera._offScreenRenderTexture;
            offsetScale.setValue(camera.normalizedViewport.x, 1.0 - camera.normalizedViewport.y, renderRT.width / dst.width, -renderRT.height / dst.height);
            this._renderPass.finalize.blitScreenQuad(renderRT, camera._offScreenRenderTexture, offsetScale);
        }
        this._renderPass.finalize = this._renderPass.finalize; // update
    }

    renderDepth(camera: Camera) {
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

    fowardRender(context: IRenderContext3D, camera: Camera): void {
        // 帧渲染前统一 flush 本帧变化的 probe 数据到 ShaderData
        LayaXRender3DProcess._flushDirtyProbes();

        Camera.depthPass.cleanUp(camera);
        this.renderDepth(camera);
        this.initRenderpass(camera, context);
        this.renderFowarAddCameraPass(context, this._renderPass);
    }

    /** @internal Bridge3DRenderProcess 也需在 fowardRender 开头调用，把 dirty ReflectionProbe/VolumetricGI 数据 flush 到 ShaderData */
    static _flushDirtyProbes(): void {
        // ReflectionProbe
        let rpDirty = LayaXReflectionProbe._dirtySet;
        if (rpDirty.size > 0) {
            rpDirty.forEach(probe => probe.applyRenderData());
            rpDirty.clear();
        }
        // VolumetricGI
        let giDirty = LayaXVolumetricGI._dirtySet;
        if (giDirty.size > 0) {
            giDirty.forEach(gi => gi.applyRenderData());
            giDirty.clear();
        }
    }

    renderFowarAddCameraPass(context: IRenderContext3D, renderpass: LayaXForwardAddRP): void {
        this._nativeObj.renderForwardAddCameraPass((context as any)._nativeObj, renderpass._nativeObj);
    }
}
