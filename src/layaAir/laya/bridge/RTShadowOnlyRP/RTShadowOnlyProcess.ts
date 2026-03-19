import { Config3D } from "../../../Config3D";
import { Camera } from "../../d3/core/Camera";
import { ShadowMode } from "../../d3/core/light/ShadowMode";
import { ShadowUtils, ShadowMapFormat } from "../../d3/core/light/ShadowUtils";
import { Scene3D } from "../../d3/core/scene/Scene3D";
import { Cluster } from "../../d3/graphics/renderPath/Cluster";
import { ShadowCasterPass } from "../../d3/shadowMap/ShadowCasterPass";
import { IRender3DProcess, IRenderContext3D } from "../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { ISceneRenderManager } from "../../RenderDriver/DriverDesign/3DRenderPass/ISceneRenderManager";
import { RTDirCascadeShadowRP } from "../../RenderDriver/RenderModuleData/RuntimeModuleData/3D/3DRenderProcess/RTDirCascadeShadowRP";
import { RTBaseSpotRP } from "../../RenderDriver/RenderModuleData/RuntimeModuleData/3D/3DRenderProcess/RTBaseSpotRP";
import { RTDirectLight } from "../../RenderDriver/RenderModuleData/RuntimeModuleData/3D/RTDirectLight";
import { RTCameraNodeData } from "../../RenderDriver/RenderModuleData/RuntimeModuleData/3D/RT3DRenderModuleData";
import { RTSpotLight } from "../../RenderDriver/RenderModuleData/RuntimeModuleData/3D/RTSpotLight";
import { RenderClearFlag } from "../../RenderEngine/RenderEnum/RenderClearFlag";
import { RenderTexture } from "../../resource/RenderTexture";

/**
 * RTShadowOnlyProcess - Native shadow-only render process
 *
 * Uses native RTDirCascadeShadowRP and RTBaseSpotRP for shadow rendering.
 * Mirrors WebShadowOnlyProcess but delegates to C++ shadow implementations.
 */
export class RTShadowOnlyProcess implements IRender3DProcess {

    /** Native directional shadow render pass */
    private _dirShadowRP: RTDirCascadeShadowRP;

    /** Native spot shadow render pass */
    private _spotShadowRP: RTBaseSpotRP;

    /** Scene render manager */
    render3DManager: ISceneRenderManager;

    protected _defaultShadowMap: RenderTexture;

    constructor() {
        this._defaultShadowMap = ShadowUtils.getTemporaryShadowTexture(1, 1, ShadowMapFormat.bit16);
        this._dirShadowRP = new RTDirCascadeShadowRP();
        this._spotShadowRP = new RTBaseSpotRP();
    }

    /**
     * Shadow-only forward render
     */
    fowardRender(context: IRenderContext3D, camera: Camera): void {
        const scene = camera._scene as Scene3D;

        if (!scene) {
            return;
        }

        // Update light clusters if multi-lighting enabled
        if (Config3D._multiLighting) {
            Cluster.instance.update(camera, scene);
        }

        // Check shadow update frequency
        const enableShadow = (Scene3D._updateMark % scene._ShadowMapupdateFrequency === 0);
        if (!enableShadow) {
            return;
        }

        // Add shadow uniform map
        (window as any).conchRT3DRenderProcess._addPreDrawUniformMap("Shadow", (context as any)._nativeObj);

        context.sceneData.setTexture(ShadowCasterPass.SHADOW_SPOTMAP, this._defaultShadowMap);

        // Render directional light shadows
        const mainDirLight = scene._mainDirectionLight;
        const needDirectionShadow = mainDirLight && mainDirLight.shadowMode !== ShadowMode.None;

        if (needDirectionShadow) {
            this._dirShadowRP.setRPData(
                mainDirLight._dataModule as RTDirectLight,
                camera._renderDataModule as RTCameraNodeData,
                context
            );
            this._dirShadowRP.setCameraCullInfo(this.render3DManager);
        }

        // Render spot light shadows
        const mainSpotLight = scene._mainSpotLight;
        const needSpotShadow = mainSpotLight && mainSpotLight.shadowMode !== ShadowMode.None;

        if (needSpotShadow) {
            this._spotShadowRP.setRPData(
                mainSpotLight._dataModule as RTSpotLight,
                context
            );
            this._spotShadowRP.setCameraCullInfo(this.render3DManager);
        }

        // Remove shadow uniform map if no shadows
        if (!needDirectionShadow && !needSpotShadow) {
            (window as any).conchRT3DRenderProcess._removePreDrawUniformMap("Shadow", (context as any)._nativeObj);
        }

        context.setRenderTarget(null, RenderClearFlag.Nothing);
    }

    destroy(): void {
        if (this._dirShadowRP) {
            this._dirShadowRP.destroy();
            this._dirShadowRP = null;
        }

        if (this._spotShadowRP) {
            this._spotShadowRP.destroy();
            this._spotShadowRP = null;
        }

        if (this._defaultShadowMap) {
            this._defaultShadowMap.destroy();
            this._defaultShadowMap = null;
        }
        this.render3DManager = null;
    }
}
