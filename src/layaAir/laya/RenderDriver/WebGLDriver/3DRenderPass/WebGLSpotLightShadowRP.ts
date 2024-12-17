import { Config3D } from "../../../../Config3D";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { RenderPassStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { BaseCamera } from "../../../d3/core/BaseCamera";
import { ShadowMode } from "../../../d3/core/light/ShadowMode";
import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { Scene3DShaderDeclaration } from "../../../d3/core/scene/Scene3DShaderDeclaration";
import { ShadowCasterPass } from "../../../d3/shadowMap/ShadowCasterPass";
import { ShadowSpotData } from "../../../d3/shadowMap/ShadowSliceData";
import { Color } from "../../../maths/Color";
import { MathUtils3D } from "../../../maths/MathUtils3D";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { Stat } from "../../../utils/Stat";
import { RenderCullUtil } from "../../DriverCommon/RenderCullUtil";
import { RenderListQueue } from "../../DriverCommon/RenderListQueue";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebSpotLight } from "../../RenderModuleData/WebModuleData/3D/WebSpotLight";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebGLRenderContext3D } from "./WebGLRenderContext3D";


export class WebGLSpotLightShadowRP {
    destTarget: InternalRenderTarget;
    /**@internal */
    shadowCasterCommanBuffer: CommandBuffer[];
    /**light */
    /**@internal */
    private _light: WebSpotLight;
    /**@internal */
    private _lightPos: Vector3;
    /**@internal */
    private _lightWorldMatrix: Matrix4x4;
    /**@internal */
    private _shadowResolution: number;
    /**@internal */
    private _spotAngle: number;
    /**@internal */
    private _spotRange: number;
    /**@internal */
    private _shadowStrength: number;
    /**@internal */
    private _shadowDepthBias: number;
    /**@internal */
    private _shadowNormalBias: number;
    /**@internal */
    private _shadowMode: ShadowMode;

    //caculate
    /** @internal */
    private _shadowSpotData: ShadowSpotData;
    /** @internal */
    private _shadowSpotMapSize: Vector4 = new Vector4();
    /** @internal */
    private _shadowSpotMatrices: Matrix4x4 = new Matrix4x4();
    /**@internal */
    private _shadowBias: Vector4;

    private _renderQueue: RenderListQueue;

    set light(value: WebSpotLight) {
        this._light = value;
        this._shadowResolution = this._light.shadowResolution;
        this._lightWorldMatrix = this._light.getWorldMatrix(this._lightWorldMatrix);
        this._lightPos = this._light.transform.position;
        this._spotAngle = this._light.spotAngle;
        this._spotRange = this._light.spotRange;
        this._shadowStrength = this._light.shadowStrength;
        // this.destTarget && RenderTexture.recoverToPool(this.destTarget);// TODO 优化
        //this.destTarget = ShadowUtils.getTemporaryShadowTexture(this._shadowResolution, this._shadowResolution, ShadowMapFormat.bit16);
    }

    get light(): WebSpotLight {
        return this._light;
    }

    constructor() {
        this._renderQueue = new RenderListQueue(false);
        this._shadowSpotData = new ShadowSpotData();
        this._lightWorldMatrix = new Matrix4x4();
        this._shadowBias = new Vector4();
    }

    /**
    * 更新阴影数据
    */
    update(context: WebGLRenderContext3D): void {
        var shadowSpotData: ShadowSpotData = this._shadowSpotData;
        this._getSpotLightShadowData(shadowSpotData, this._shadowResolution, this._shadowSpotMatrices, this._shadowSpotMapSize);
    }

    /**
     * render
     * @param context 
     * @param list
     */
    render(context: WebGLRenderContext3D, list: WebBaseRenderNode[], count: number): void {

        let originCameraData = context.cameraData;

        var shaderValues: WebGLShaderData = context.sceneData;
        context.pipelineMode = "ShadowCaster";
        context.setRenderTarget(this.destTarget, RenderClearFlag.Depth);
        var shadowSpotData: ShadowSpotData = this._shadowSpotData;
        this._getShadowBias(shadowSpotData.resolution, this._shadowBias);
        this._setupShadowCasterShaderValues(shaderValues, shadowSpotData, this._shadowBias);
        //cull
        var time = performance.now();//T_ShadowMapCull Stat
        RenderCullUtil.cullSpotShadow(shadowSpotData.cameraCullInfo, list, count, this._renderQueue, context);
        Stat.renderPassStatArray[RenderPassStatisticsInfo.T_ShadowMapCull] += (performance.now() - time);//Stat

        context.cameraData = <WebGLShaderData>shadowSpotData.cameraShaderValue;
        context.cameraUpdateMask++;;
        //if (this._renderQueue._elements.length > 0) {
        Viewport.TEMP.set(shadowSpotData.offsetX, shadowSpotData.offsetY, shadowSpotData.resolution, shadowSpotData.resolution);
        Vector4.TEMP.setValue(shadowSpotData.offsetX, shadowSpotData.offsetY, shadowSpotData.resolution, shadowSpotData.resolution);
        //} else {
        //    Viewport._tempViewport.set(shadowSpotData.offsetX, shadowSpotData.offsetY, shadowSpotData.resolution, shadowSpotData.resolution);
        //    Vector4.tempVec4.setValue(shadowSpotData.offsetX, shadowSpotData.offsetY, shadowSpotData.resolution, shadowSpotData.resolution);
        //}
        context.setViewPort(Viewport.TEMP);
        context.setScissor(Vector4.TEMP);

        if (Config3D._uniformBlock) {
            shadowSpotData.cameraShaderValue.updateUBOBuffer(BaseCamera.UBONAME_CAMERA);
        }

        context.setClearData(RenderClearFlag.Depth, Color.BLACK, 1, 0);
        this._renderQueue.renderQueue(context);
        Stat.shadowMapDrawCall += this._renderQueue.elements.length;
        this._applyCasterPassCommandBuffer(context);
        this._applyRenderData(context.sceneData, context.cameraData);
        this._renderQueue._batch.recoverData();
        context.cameraData = originCameraData;
        context.cameraUpdateMask++;
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

    private _setupShadowCasterShaderValues(shaderValues: WebGLShaderData, shadowSliceData: ShadowSpotData, shadowBias: Vector4): void {
        shaderValues.setVector(ShadowCasterPass.SHADOW_BIAS, shadowBias);
        var cameraSV = <WebGLShaderData>shadowSliceData.cameraShaderValue;//TODO:should optimization with shader upload.
        cameraSV.setMatrix4x4(BaseCamera.VIEWMATRIX, shadowSliceData.viewMatrix);
        cameraSV.setMatrix4x4(BaseCamera.PROJECTMATRIX, shadowSliceData.projectionMatrix);
        cameraSV.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, shadowSliceData.viewProjectMatrix);
        shaderValues.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, shadowSliceData.viewProjectMatrix);
    }

    /**
     * apply shadowCast cmd array
     */
    private _applyCasterPassCommandBuffer(context: WebGLRenderContext3D) {
        if (!this.shadowCasterCommanBuffer || this.shadowCasterCommanBuffer.length == 0)
            return;
        this.shadowCasterCommanBuffer.forEach(function (value) {
            //value._context = context;TODO
            value._apply();
        });
    }

    /**
     * 设置聚光接受阴影的模式
     * @internal
     * @param shaderValues 渲染数据
     */
    private _applyRenderData(sceneData: WebGLShaderData, cameraData: WebGLShaderData): void {
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
}