import { Config3D } from "../../../../Config3D";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { UnifromBufferData } from "../../../RenderEngine/UniformBufferData";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { BaseCamera } from "../../../d3/core/BaseCamera";
import { ShadowMode } from "../../../d3/core/light/ShadowMode";
import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { Scene3DShaderDeclaration } from "../../../d3/core/scene/Scene3DShaderDeclaration";
import { ShadowCasterPass } from "../../../d3/shadowMap/ShadowCasterPass";
import { CameraCullInfo } from "../../../d3/shadowMap/ShadowSliceData";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { MathUtils3D } from "../../../maths/MathUtils3D";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { RenderCullUtil } from "../../DriverCommon/RenderCullUtil";
import { RenderListQueue } from "../../DriverCommon/RenderListQueue";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebSpotLight } from "../../RenderModuleData/WebModuleData/3D/WebSpotLight";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";

/**
 * 聚光灯阴影数据
 */
export class ShadowSpotData {
    cameraShaderData: WebGPUShaderData;
    position: Vector3 = new Vector3();
    offsetX: number;
    offsetY: number;
    resolution: number;
    viewMatrix: Matrix4x4 = new Matrix4x4();
    projectionMatrix: Matrix4x4 = new Matrix4x4();
    viewProjectMatrix: Matrix4x4 = new Matrix4x4();
    cameraCullInfo: CameraCullInfo;
    cameraUBO: UniformBufferObject;
    cameraUBData: UnifromBufferData;

    constructor() {
        this.cameraShaderData = <WebGPUShaderData>LayaGL.renderDeviceFactory.createShaderData(null);
        this.cameraCullInfo = new CameraCullInfo();
        if (Config3D._uniformBlock) {
            let cameraUBO = UniformBufferObject.getBuffer(UniformBufferObject.UBONAME_CAMERA, 0);
            const cameraUBData = BaseCamera.createCameraUniformBlock();
            if (!cameraUBO)
                cameraUBO = UniformBufferObject.create(UniformBufferObject.UBONAME_CAMERA, BufferUsage.Dynamic, cameraUBData.getbyteLength(), false);
            this.cameraShaderData._addCheckUBO(UniformBufferObject.UBONAME_CAMERA, cameraUBO, cameraUBData);
            this.cameraShaderData.setUniformBuffer(BaseCamera.CAMERAUNIFORMBLOCK, cameraUBO);
            this.cameraUBO = cameraUBO;
            this.cameraUBData = cameraUBData;
        }
    }
}

/**
 * 聚光灯阴影渲染流程
 */
export class WebGPUSpotLightShadowRP {

    protected static _invertYScaleMatrix: Matrix4x4 = new Matrix4x4(1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

    destTarget: InternalRenderTarget;
    /**@internal */
    shadowCasterCommanBuffer: CommandBuffer[];
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

    /** @internal */
    private _shadowSpotData: ShadowSpotData;
    /** @internal */
    private _shadowSpotMapSize: Vector4 = new Vector4();
    /** @internal */
    private _shadowSpotMatrices: Matrix4x4 = new Matrix4x4();
    /** @internal */
    private _shadowBias: Vector4;

    /** @internal */
    private _renderQueue: RenderListQueue;

    set light(value: WebSpotLight) {
        this._light = value;
        this._shadowResolution = this._light.shadowResolution;
        this._lightWorldMatrix = this._light.getWorldMatrix(this._lightWorldMatrix);
        this._lightPos = this._light.transform.position;
        this._spotAngle = this._light.spotAngle;
        this._spotRange = this._light.spotRange;
        this._shadowStrength = this._light.shadowStrength;
        //this.destTarget && RenderTexture.recoverToPool(this.destTarget); //TODO 优化
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
     * @param context 
     */
    update(context: WebGPURenderContext3D) {
        const shadowSpotData = this._shadowSpotData;
        this._getSpotLightShadowData(shadowSpotData, this._shadowResolution, this._shadowSpotMatrices, this._shadowSpotMapSize);
    }

    /**
     * 渲染
     * @param context 
     * @param list 
     * @param count 
     */
    render(context: WebGPURenderContext3D, list: WebBaseRenderNode[], count: number) {
        const originCameraData = context.cameraData;
        const shadowSpotData = this._shadowSpotData;
        const shaderData: WebGPUShaderData = context.sceneData;
        context.pipelineMode = 'ShadowCaster';
        context.setRenderTarget(this.destTarget as WebGPUInternalRT, RenderClearFlag.Depth);
        context.saveViewPortAndScissor();

        this._getShadowBias(shadowSpotData.resolution, this._shadowBias);
        this._setupShadowCasterShaderValues(shaderData, shadowSpotData, this._shadowBias);
        RenderCullUtil.cullSpotShadow(shadowSpotData.cameraCullInfo, list, count, this._renderQueue, context);
        context.cameraData = shadowSpotData.cameraShaderData;
        context.cameraUpdateMask++;

        Viewport._tempViewport.set(shadowSpotData.offsetX, shadowSpotData.offsetY, shadowSpotData.resolution, shadowSpotData.resolution);
        Vector4.tempVec4.setValue(shadowSpotData.offsetX, shadowSpotData.offsetY, shadowSpotData.resolution, shadowSpotData.resolution);
        context.setViewPort(Viewport._tempViewport);
        context.setScissor(Vector4.tempVec4);

        if (shadowSpotData.cameraUBO && shadowSpotData.cameraUBData) //这里可能会有问题
            shadowSpotData.cameraUBO.setDataByUniformBufferData(shadowSpotData.cameraUBData);

        context.setClearData(RenderClearFlag.Depth, Color.BLACK, 1, 0);
        this._renderQueue.renderQueue(context);
        this._applyCasterPassCommandBuffer(context);
        this._applyRenderData(context.sceneData, context.cameraData);

        context.restoreViewPortAndScissor();
        context.cameraData = originCameraData;
        context.cameraUpdateMask++;
    }

    /** 
     * @internal
     */
    private _getSpotLightShadowData(shadowSpotData: ShadowSpotData, resolution: number, shadowSpotMatrices: Matrix4x4, shadowMapSize: Vector4) {
        const out = shadowSpotData.position = this._lightPos;
        shadowSpotData.resolution = resolution;
        shadowMapSize.setValue(1 / resolution, 1 / resolution, resolution, resolution);
        shadowSpotData.offsetX = 0;
        shadowSpotData.offsetY = 0;

        const spotWorldMatrix = this._lightWorldMatrix;
        const viewMatrix = shadowSpotData.viewMatrix;
        const projectMatrix = shadowSpotData.projectionMatrix;
        const viewProjectMatrix = shadowSpotData.viewProjectMatrix;
        const BoundFrustum = shadowSpotData.cameraCullInfo.boundFrustum;
        spotWorldMatrix.invert(viewMatrix);
        Matrix4x4.createPerspective(3.14159 * this._spotAngle / 180, 1, 0.1, this._spotRange, projectMatrix);
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
    private _getShadowBias(shadowResolution: number, out: Vector4) {
        // For perspective projections, shadow texel size varies with depth
        // It will only work well if done in receiver side in the pixel shader. Currently We
        // do bias on caster side in vertex shader. When we add shader quality tiers we can properly
        // handle this. For now, as a poor approximation we do a constant bias and compute the size of
        // the frustum as if it was orthogonal considering the size at mid point between near and far planes.
        // Depending on how big the light range is, it will be good enough with some tweaks in bias
        const frustumSize = Math.tan(this._spotAngle * 0.5 * MathUtils3D.Deg2Rad) * this._spotRange;

        // depth and normal bias scale is in shadowmap texel size in world space
        const texelSize = frustumSize / shadowResolution;
        let depthBias = -this._light.shadowDepthBias * texelSize;
        let normalBias = -this._light.shadowNormalBias * texelSize;

        if (this._shadowMode == ShadowMode.SoftHigh) {
            // TODO: depth and normal bias assume sample is no more than 1 texel away from shadowmap
            // This is not true with PCF. Ideally we need to do either
            // cone base bias (based on distance to center sample)
            // or receiver place bias based on derivatives.
            // For now we scale it by the PCF kernel size (5x5)
            const kernelRadius = 2.5;
            depthBias *= kernelRadius;
            normalBias *= kernelRadius;
        }
        out.setValue(depthBias, normalBias, 0, 0);
    }

    /**
     * 设置阴影级联数据模式
     * @param shaderData 
     * @param shadowSliceData 
     * @param shadowParams 
     * @param shadowBias 
     */
    private _setupShadowCasterShaderValues(shaderData: WebGPUShaderData, shadowSliceData: ShadowSpotData, shadowBias: Vector4): void {
        shaderData.setVector(ShadowCasterPass.SHADOW_BIAS, shadowBias);
        shaderData.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, shadowSliceData.viewProjectMatrix);
        const cameraData = shadowSliceData.cameraShaderData;
        cameraData.setMatrix4x4(BaseCamera.VIEWMATRIX, shadowSliceData.viewMatrix);
        cameraData.setMatrix4x4(BaseCamera.PROJECTMATRIX, shadowSliceData.projectionMatrix);
        cameraData.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, shadowSliceData.viewProjectMatrix);
    }

    /**
     * 应用阴影渲染命令
     * @param context 
     */
    private _applyCasterPassCommandBuffer(context: WebGPURenderContext3D) {
        if (this.shadowCasterCommanBuffer && this.shadowCasterCommanBuffer.length > 0)
            this.shadowCasterCommanBuffer.forEach(value => value._apply());
    }

    /**
     * 设置聚光接受阴影的模式
     * @param shaderData 渲染数据
     * @param cameraData 相机数据
     */
    private _applyRenderData(sceneData: WebGPUShaderData, cameraData: WebGPUShaderData) {
        const spotLight = this._light;
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

        Matrix4x4.multiply(WebGPUSpotLightShadowRP._invertYScaleMatrix, this._shadowSpotMatrices, this._shadowSpotMatrices);

        sceneData.setMatrix4x4(ShadowCasterPass.SHADOW_SPOTMATRICES, this._shadowSpotMatrices);
        sceneData.setVector(ShadowCasterPass.SHADOW_SPOTMAP_SIZE, this._shadowSpotMapSize);
    }
}