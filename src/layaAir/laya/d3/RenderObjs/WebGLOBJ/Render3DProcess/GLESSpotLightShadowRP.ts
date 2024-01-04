
import { RenderClearFlag } from "../../../../RenderEngine/RenderEnum/RenderClearFlag";
import { ShaderData } from "../../../../RenderEngine/RenderShader/ShaderData";
import { Color } from "../../../../maths/Color";
import { MathUtils3D } from "../../../../maths/MathUtils3D";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { ISpotLightShadowRP } from "../../../RenderDriverLayer/Render3DProcess/ISpotLightShadowRP";
import { BaseCamera } from "../../../core/BaseCamera";
import { Camera } from "../../../core/Camera";
import { Sprite3D } from "../../../core/Sprite3D";
import { ShadowMode } from "../../../core/light/ShadowMode";
import { ShadowMapFormat, ShadowUtils } from "../../../core/light/ShadowUtils";
import { SpotLightCom } from "../../../core/light/SpotLightCom";
import { CommandBuffer } from "../../../core/render/command/CommandBuffer";
import { Scene3DShaderDeclaration } from "../../../core/scene/Scene3DShaderDeclaration";
import { Viewport } from "../../../math/Viewport";
import { ShadowCasterPass } from "../../../shadowMap/ShadowCasterPass";
import { CameraCullInfo } from "../../RenderObj/CameraCullInfo";
import { GLESRenderContext3D } from "../GLESRenderContext3D";
import { GLESBaseRenderNode } from "../Render3DNode/GLESBaseRenderNode";
import { GLESSpotLight } from "../RenderModuleData/GLESSpotLight";
import { GLESCullUtil } from "./GLESRenderUtil.ts/GLESCullUtil";
import { GLESRenderQueueList } from "./GLESRenderUtil.ts/GLESRenderListQueue";
export class ShadowSpotData {
    cameraShaderValue: ShaderData;
    position: Vector3 = new Vector3;
    offsetX: number;
    offsetY: number;
    resolution: number;
    viewMatrix: Matrix4x4 = new Matrix4x4();
    projectionMatrix: Matrix4x4 = new Matrix4x4();
    viewProjectMatrix: Matrix4x4 = new Matrix4x4();
    cameraCullInfo: CameraCullInfo;
}
export class GLESSpotLightShadowRP implements ISpotLightShadowRP {
    /**@internal */
    destTarget: RenderTexture;
    /**@internal */
    shadowCasterCommanBuffer: CommandBuffer[];
    /**light */
    /**@internal */
    private _light: GLESSpotLight;
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
    private _shadowParams: Vector4;
    /** @internal */
    private _shadowSpotMapSize: Vector4 = new Vector4();
    /** @internal */
    private _shadowSpotMatrices: Matrix4x4 = new Matrix4x4();
    /**@internal */
    private _shadowBias: Vector4;

    private _renderQueue: GLESRenderQueueList;

    set light(value: SpotLightCom) {
        this._light = value._getRenderDataModule() as GLESSpotLight;
        this._shadowResolution = this._light.shadowResolution;
        this._lightWorldMatrix = this._light.getWorldMatrix(this._lightWorldMatrix);
        this._lightPos = this._light.transform.position;
        this._spotAngle = this._light.spotAngle;
        this._spotRange = this._light.spotRange;
        this._shadowStrength = this._light.shadowStrength;
        this.destTarget && RenderTexture.recoverToPool(this.destTarget);// TODO 优化
        this.destTarget = ShadowUtils.getTemporaryShadowTexture(this._shadowResolution, this._shadowResolution, ShadowMapFormat.bit16);
    }

    constructor() {
        this._renderQueue = new GLESRenderQueueList(false);
    }

    /**
    * 更新阴影数据
    */
    update(context: GLESRenderContext3D): void {
        var shadowSpotData: ShadowSpotData = this._shadowSpotData;
        this._getSpotLightShadowData(shadowSpotData, this._shadowResolution, this._shadowParams, this._shadowSpotMatrices, this._shadowSpotMapSize);
    }

    /**
     * render
     * @param context 
     * @param list 
     */
    render(context: GLESRenderContext3D, list: GLESBaseRenderNode[], count: number): void {
        var shaderValues: ShaderData = context.sceneData;
        context.pipelineMode = "ShadowCaster";
        context.setRenderTarget(this.destTarget);
        var shadowSpotData: ShadowSpotData = this._shadowSpotData;
        this._getShadowBias(shadowSpotData.resolution, this._shadowBias);
        this._setupShadowCasterShaderValues(shaderValues, shadowSpotData, this._shadowParams, this._shadowBias);
        //cull
        GLESCullUtil.cullingSpotShadow(shadowSpotData.cameraCullInfo, list, count, this._renderQueue, context);
        context.cameraData = shadowSpotData.cameraShaderValue;
        Camera._updateMark++;
        context.cameraUpdateMask = Camera._updateMark;
        if (this._renderQueue._elements.length > 0) {
            Viewport._tempViewport.set(shadowSpotData.offsetX, shadowSpotData.offsetY, shadowSpotData.resolution, shadowSpotData.resolution);
            Vector4.tempVec4.setValue(shadowSpotData.offsetX, shadowSpotData.offsetY, shadowSpotData.resolution, shadowSpotData.resolution);
        } else {
            Viewport._tempViewport.set(shadowSpotData.offsetX, shadowSpotData.offsetY, shadowSpotData.resolution, shadowSpotData.resolution);
            Vector4.tempVec4.setValue(shadowSpotData.offsetX, shadowSpotData.offsetY, shadowSpotData.resolution, shadowSpotData.resolution);
        }
        context.setClearData(RenderClearFlag.Depth, Color.BLACK, 1, 0);
        this._renderQueue.renderQueue(context);
        this._applyCasterPassCommandBuffer(context);
        this._applyRenderData(context.sceneData, context.cameraData);
    }


    /** 
    * @internal
    */
    private _getSpotLightShadowData(shadowSpotData: ShadowSpotData, resolution: number, shadowParams: Vector4, shadowSpotMatrices: Matrix4x4, shadowMapSize: Vector4) {
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
        shadowParams.y = this._shadowStrength;
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
        var depthBias: number = -this._shadowDepthBias * texelSize;
        var normalBias: number = -this._shadowNormalBias * texelSize;

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

    private _setupShadowCasterShaderValues(shaderValues: ShaderData, shadowSliceData: ShadowSpotData, shadowparams: Vector4, shadowBias: Vector4): void {
        shaderValues.setVector(ShadowCasterPass.SHADOW_BIAS, shadowBias);
        shaderValues.setVector(ShadowCasterPass.SHADOW_PARAMS, shadowparams);
        var cameraSV: ShaderData = shadowSliceData.cameraShaderValue;//TODO:should optimization with shader upload.
        cameraSV.setMatrix4x4(BaseCamera.VIEWMATRIX, shadowSliceData.viewMatrix);
        cameraSV.setMatrix4x4(BaseCamera.PROJECTMATRIX, shadowSliceData.projectionMatrix);
        cameraSV.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, shadowSliceData.viewProjectMatrix);
        shaderValues.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, shadowSliceData.viewProjectMatrix);
    }

    /**
     * apply shadowCast cmd array
     */
    private _applyCasterPassCommandBuffer(context: GLESRenderContext3D) {
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
    private _applyRenderData(sceneData: ShaderData, cameraData: ShaderData): void {
        var spotLight: GLESSpotLight = this._light;
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
        sceneData.setTexture(ShadowCasterPass.SHADOW_SPOTMAP, this.destTarget);
        sceneData.setMatrix4x4(ShadowCasterPass.SHADOW_SPOTMATRICES, this._shadowSpotMatrices)
        sceneData.setVector(ShadowCasterPass.SHADOW_SPOTMAP_SIZE, this._shadowSpotMapSize);
        sceneData.setVector(ShadowCasterPass.SHADOW_PARAMS, this._shadowParams);
    }
}