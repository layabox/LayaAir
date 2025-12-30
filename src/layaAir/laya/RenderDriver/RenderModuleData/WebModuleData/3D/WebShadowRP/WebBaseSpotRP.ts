import { BaseCamera } from "../../../../../d3/core/BaseCamera";
import { ShadowMode } from "../../../../../d3/core/light/ShadowMode";
import { CommandBuffer } from "../../../../../d3/core/render/command/CommandBuffer";
import { DepthPass } from "../../../../../d3/depthMap/DepthPass";
import { ShadowCasterPass } from "../../../../../d3/shadowMap/ShadowCasterPass";
import { ShadowSpotData } from "../../../../../d3/shadowMap/ShadowSliceData";
import { LayaGL } from "../../../../../layagl/LayaGL";
import { StatElement } from "../../../../../layagl/StatisticsContext";
import { Color } from "../../../../../maths/Color";
import { MathUtils3D } from "../../../../../maths/MathUtils3D";
import { Matrix4x4 } from "../../../../../maths/Matrix4x4";
import { Vector3 } from "../../../../../maths/Vector3";
import { Vector4 } from "../../../../../maths/Vector4";
import { Viewport } from "../../../../../maths/Viewport";
import { RenderClearFlag } from "../../../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Browser } from "../../../../../utils/Browser";
import { RenderCullUtil } from "../../../../DriverCommon/RenderCullUtil";
import { IRenderContext3D, ISpotShadowRP } from "../../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { ISceneRenderManager } from "../../../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { ShaderData } from "../../../../DriverDesign/RenderDevice/ShaderData";
import { WebSpotLight } from "../WebSpotLight";
import { RenderListQueue } from "../../../../DriverCommon/RenderListQueue";
import { Scene3DShaderDeclaration } from "../../../../../d3/core/scene/Scene3DShaderDeclaration";
import { WebBaseRenderNode } from "../WebBaseRenderNode";
import { SingletonList } from "../../../../../utils/SingletonList";
import { Scene3D } from "../../../../../d3/core/scene/Scene3D";
import { RenderTexture } from "../../../../../resource/RenderTexture";
import { BatchCullMode } from "../../../../DriverDesign/3DRenderPass/IBatchModuleAgent";

export class WebBaseSpotRP implements ISpotShadowRP {

    /**light */

    private _light: WebSpotLight;

    private _lightPos: Vector3;

    private _lightWorldMatrix: Matrix4x4;

    private _shadowResolution: number;

    private _spotAngle: number;

    private _spotRange: number;

    private _shadowStrength: number;

    private _shadowMode: ShadowMode;

    private _shadowCasterCommanBuffer: CommandBuffer[];

    private _shadowSpotData: ShadowSpotData;

    private _shadowSpotMatrices: Matrix4x4 = new Matrix4x4();

    private _shadowSpotMapSize: Vector4 = new Vector4();

    private _destShadowRT: RenderTexture;

    private _shadowBias: Vector4;

    private _renderQueue: RenderListQueue;
    constructor() {
        this._renderQueue = new RenderListQueue(false);
        this._shadowSpotData = new ShadowSpotData();
        this._lightWorldMatrix = new Matrix4x4();
        this._shadowBias = new Vector4();

    }


    private _setLight(value: WebSpotLight) {
        this._light = value;
        this._shadowResolution = this._light.shadowResolution;
        this._lightWorldMatrix = this._light.getWorldMatrix(this._lightWorldMatrix);
        this._lightPos = this._light.transform.position;
        this._spotAngle = this._light.spotAngle;
        this._spotRange = this._light.spotRange;
        this._shadowStrength = this._light.shadowStrength;
        this._shadowMode = this._light.shadowMode;
    }

    /**
     * 应用阴影渲染命令
     * @param context 
     */
    private _applyCasterPassCommandBuffer(context: IRenderContext3D) {
        if (this._shadowCasterCommanBuffer && this._shadowCasterCommanBuffer.length > 0)
            this._shadowCasterCommanBuffer.forEach(value => value._apply());
    }

    /** 
    * @internal
    */
    private _getSpotLightShadowData(shadowSpotData: ShadowSpotData, resolution: number, shadowSpotMatrices: Matrix4x4, shadowMapSize: Vector4) {
        var out: Vector3 = shadowSpotData.position = this._lightPos;
        shadowSpotData.resolution = resolution;
        shadowMapSize.setValue(1.0 / resolution, 1.0 / resolution, resolution, resolution);
        shadowSpotData.offsetX = 0;
        shadowSpotData.offsetY = 0;

        var spotWorldMatrix: Matrix4x4 = this._lightWorldMatrix;
        var viewMatrix: Matrix4x4 = shadowSpotData.viewMatrix;
        var projectMatrix: Matrix4x4 = shadowSpotData.projectionMatrix;
        var viewProjectMatrix: Matrix4x4 = shadowSpotData.viewProjectMatrix;
        var BoundFrustum = shadowSpotData.cameraCullInfo.boundFrustum;
        spotWorldMatrix.invert(viewMatrix);
        Matrix4x4.createPerspective(3.1416 * this._spotAngle / 180.0, 1, 0.1, this._spotRange, projectMatrix);
        Matrix4x4.multiply(projectMatrix, viewMatrix, viewProjectMatrix);
        BoundFrustum.matrix = viewProjectMatrix;
        viewProjectMatrix.cloneTo(shadowSpotMatrices);
        shadowSpotData.cameraCullInfo.position = out;
    }

    /**
   * get shadow bias
   * @param shadowResolution 
   * @param out 
   */
    private _getShadowBias(shadowResolution: number, out: Vector4): void {
        // For perspective projections, shadow texel size varies with depth
        // It will only work well if done in receiver side in the pixel shader. Currently We
        // do bias on caster side in vertex shader. When we add shader quality tiers we can properly
        // handle this. For now, as a poor approximation we do a constant bias and compute the size of
        // the frustum as if it was orthogonal considering the size at mid point between near and far planes.
        // Depending on how big the light range is, it will be good enough with some tweaks in bias
        var frustumSize = Math.tan(this._spotAngle * 0.5 * MathUtils3D.Deg2Rad) * this._spotRange;

        // depth and normal bias scale is in shadowmap texel size in world space
        var texelSize: number = frustumSize / shadowResolution;
        var depthBias: number = -this._light.shadowDepthBias * texelSize;
        var normalBias: number = -this._light.shadowNormalBias * texelSize;

        if (this._shadowMode == ShadowMode.SoftHigh) {
            // TODO: depth and normal bias assume sample is no more than 1 texel away from shadowmap
            // This is not true with PCF. Ideally we need to do either
            // cone base bias (based on distance to center sample)
            // or receiver place bias based on derivatives.
            // For now we scale it by the PCF kernel size (5x5)
            const kernelRadius: number = 2.5;
            depthBias *= kernelRadius;
            normalBias *= kernelRadius;
        }
        out.setValue(depthBias, normalBias, 0.0, 0.0);
    }

    private _setupShadowCasterShaderValues(shaderValues: ShaderData, shadowSliceData: ShadowSpotData, shadowBias: Vector4): void {
        shaderValues.setVector(ShadowCasterPass.SHADOW_BIAS, shadowBias);
        var cameraSV = <ShaderData>shadowSliceData.cameraShaderValue;//TODO:should optimization with shader upload.
        cameraSV.setMatrix4x4(BaseCamera.VIEWMATRIX, shadowSliceData.viewMatrix);
        cameraSV.setMatrix4x4(BaseCamera.PROJECTMATRIX, shadowSliceData.projectionMatrix);
        cameraSV.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, shadowSliceData.viewProjectMatrix);
        shaderValues.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, shadowSliceData.viewProjectMatrix);
    }


    /**
     * 设置聚光接受阴影的模式
     * @internal
     * @param shaderValues 渲染数据
     */
    private _applyRenderData(sceneData: ShaderData, cameraData: ShaderData): void {
        var spotLight: WebSpotLight = this._light;
        switch (spotLight.shadowMode) {
            case ShadowMode.Hard:
                sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_HIGH);
                sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_LOW);
                break;
            case ShadowMode.SoftLow:
                sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_LOW);
                sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_HIGH);
                break;
            case ShadowMode.SoftHigh:
                sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_HIGH);
                sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_LOW);
                break;
        }
        sceneData.setMatrix4x4(ShadowCasterPass.SHADOW_SPOTMATRICES, this._shadowSpotMatrices)
        sceneData.setVector(ShadowCasterPass.SHADOW_SPOTMAP_SIZE, this._shadowSpotMapSize);
    }

    setShadowCasterCommanBuffer(cmd: CommandBuffer[]): void {
        this._shadowCasterCommanBuffer = cmd;
    }

    setCameraCullInfo(sceneManager: ISceneRenderManager): void {
        const shadowSpotData = this._shadowSpotData;
        this._getSpotLightShadowData(shadowSpotData, this._shadowResolution, this._shadowSpotMatrices, this._shadowSpotMapSize);
        let agent = sceneManager.batchAgentList;
        for (var [key, value] of agent) {
            value.setSpotCullingDir([shadowSpotData.cameraCullInfo]);
        }
    }


    setRPData(spotLight: WebSpotLight, context: IRenderContext3D): void {
        this._setLight(spotLight);
        this._destShadowRT = Scene3D._shadowCasterPass.getSpotLightShadowPassData(spotLight);

        let v4 = context.sceneData.getVector(ShadowCasterPass.SHADOW_PARAMS);
        v4 = v4 ? v4 : new Vector4();
        v4.y = spotLight.shadowStrength;
        context.sceneData.setVector(ShadowCasterPass.SHADOW_PARAMS, v4);

    }


    update(context: IRenderContext3D): void {
        context.sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
        context.sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
    }
    
    render(context: IRenderContext3D, manager: ISceneRenderManager): void {
        const originCameraData = context.cameraData;
        const shadowSpotData = this._shadowSpotData;
        const shaderData = context.sceneData;
        context.pipelineMode = 'ShadowCaster';
        context.setRenderTarget(this._destShadowRT._renderTarget, RenderClearFlag.Depth);
        //context.saveViewPortAndScissor();

        this._getShadowBias(shadowSpotData.resolution, this._shadowBias);
        this._setupShadowCasterShaderValues(shaderData, shadowSpotData, this._shadowBias);

        //cull
        let list = manager.baseRenderList as SingletonList<WebBaseRenderNode>;
        var time = Browser.now();//T_ShadowMapCull Stat
        RenderCullUtil.cullSpotShadow(shadowSpotData.cameraCullInfo, list.elements, list.length, this._renderQueue, context);
        let agent = manager.batchAgentList;
        for (var [key, agentModule] of agent) {
            let agentrenderList = agentModule.appendRenderElement(BatchCullMode.Spot, 0, context).opaqueList;
            let element = agentrenderList.elements;
            for (var jj = 0; jj < agentrenderList.length; jj++) {
                this._renderQueue.addRenderElement(element[jj]);
            }
        }
        LayaGL.statAgent.recordTimeData(StatElement.T_CullShadow, Browser.now() - time);//Stat

        let cameraDepthTex = context.cameraData.getTexture(DepthPass.DEPTHTEXTURE);
        shadowSpotData.cameraShaderValue.setTexture(DepthPass.DEPTHTEXTURE, cameraDepthTex);

        context.cameraData = shadowSpotData.cameraShaderValue;
        context.cameraUpdateMask++;

        Viewport.TEMP.set(shadowSpotData.offsetX, shadowSpotData.offsetY, shadowSpotData.resolution, shadowSpotData.resolution);
        Vector4.TEMP.setValue(shadowSpotData.offsetX, shadowSpotData.offsetY, shadowSpotData.resolution, shadowSpotData.resolution);
        context.setViewPort(Viewport.TEMP);
        context.setScissor(Vector4.TEMP);


        context.setClearData(RenderClearFlag.Depth, Color.BLACK, 1, 0);
        this._renderQueue.renderQueue(context);
        LayaGL.statAgent.recordCTData(StatElement.CT_ShadowDrawCall, this._renderQueue.elements.length);
        this._applyCasterPassCommandBuffer(context);
        this._applyRenderData(context.sceneData, context.cameraData);

        context.cameraData = originCameraData;
        context.cameraUpdateMask++;
    }

    useRPResource(context: IRenderContext3D) {
        context.sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
        context.sceneData.setTexture(ShadowCasterPass.SHADOW_SPOTMAP, this._destShadowRT);
    }

    unuseRPResource(context: IRenderContext3D): void {
        context.sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
    }

    destory(): void {

    }
}