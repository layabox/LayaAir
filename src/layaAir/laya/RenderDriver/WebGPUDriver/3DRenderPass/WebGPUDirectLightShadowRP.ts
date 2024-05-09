import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { BaseCamera } from "../../../d3/core/BaseCamera";
import { ShadowCascadesMode } from "../../../d3/core/light/ShadowCascadesMode";
import { ShadowMode } from "../../../d3/core/light/ShadowMode";
import { ShadowUtils } from "../../../d3/core/light/ShadowUtils";
import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { Scene3DShaderDeclaration } from "../../../d3/core/scene/Scene3DShaderDeclaration";
import { BoundSphere } from "../../../d3/math/BoundSphere";
import { Plane } from "../../../d3/math/Plane";
import { ShadowCasterPass } from "../../../d3/shadowMap/ShadowCasterPass";
import { ShadowSliceData } from "../../../d3/shadowMap/ShadowSliceData";
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
import { WebDirectLight } from "../../RenderModuleData/WebModuleData/3D/WebDirectLight";
import { WebCameraNodeData } from "../../RenderModuleData/WebModuleData/3D/WebModuleData";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";

/**
 * 阴影裁剪信息
 */
export class ShadowCullInfo {
    position: Vector3;
    direction: Vector3;
    cullPlanes: Plane[];
    cullSphere: BoundSphere;
    cullPlaneCount: number;
}

/**
 * 线性光源阴影渲染流程
 */
export class WebGPUDirectLightShadowRP {
    /**@internal 最大cascade*/
    private static _maxCascades: number = 4;
    /**@internal */
    shadowCastMode: ShadowCascadesMode;

    camera: WebCameraNodeData;
    destTarget: InternalRenderTarget;

    private _shadowCasterCommanBuffer: CommandBuffer[];
    get shadowCasterCommanBuffer() {
        return this._shadowCasterCommanBuffer;
    }
    set shadowCasterCommanBuffer(value: CommandBuffer[]) {
        this._shadowCasterCommanBuffer = value;
    }

    /**@internal */
    private _light: WebDirectLight
    /**@internal */
    private _lightUp: Vector3;
    /**@internal */
    private _lightSide: Vector3;
    /**@internal */
    private _lightForward: Vector3;

    /** @internal 分割distance*/
    private _cascadesSplitDistance: number[] = new Array(WebGPUDirectLightShadowRP._maxCascades + 1);
    /** @internal */
    private _frustumPlanes: Plane[] = [];
    /** @internal */
    private _shadowMatrices: Float32Array = new Float32Array(WebGPUDirectLightShadowRP._maxCascades * 16);
    /**@internal */
    private _splitBoundSpheres: Float32Array = new Float32Array(WebGPUDirectLightShadowRP._maxCascades * 4);
    /** @internal */
    private _shadowSliceDatas: ShadowSliceData[] = [new ShadowSliceData(), new ShadowSliceData(), new ShadowSliceData(), new ShadowSliceData()];
    /** @internal */
    private _shadowMapSize: Vector4 = new Vector4();
    /** @internal */
    private _shadowBias: Vector4 = new Vector4();
    /** @internal */
    private _cascadeCount: number = 0;
    /** @internal */
    private _shadowMapWidth: number = 0;
    /** @internal */
    private _shadowMapHeight: number = 0;
    /** @internal */
    private _shadowTileResolution: number = 0;
    /** @internal */
    private _shadowCullInfo: ShadowCullInfo;

    /** @internal */
    private _renderQueue: RenderListQueue;

    set light(value: WebDirectLight) {
        this._light = value;
        const lightWorld = Matrix4x4.TEMPMatrix0;
        const lightWorldE = lightWorld.elements;
        const lightUp = this._lightUp;
        const lightSide = this._lightSide;
        const lightForward = this._lightForward;
        Matrix4x4.createFromQuaternion(this._light.transform.rotation, lightWorld);
        lightSide.setValue(lightWorldE[0], lightWorldE[1], lightWorldE[2]);
        lightUp.setValue(lightWorldE[4], lightWorldE[5], lightWorldE[6]);
        lightForward.setValue(-lightWorldE[8], -lightWorldE[9], -lightWorldE[10]);
        //设置分辨率
        const atlasResolution = this._light.shadowResolution;
        const cascadesMode = this.shadowCastMode = this._light.shadowCascadesMode;

        if (cascadesMode === ShadowCascadesMode.NoCascades) {
            this._cascadeCount = 1;
            this._shadowTileResolution = atlasResolution;
            this._shadowMapWidth = atlasResolution;
            this._shadowMapHeight = atlasResolution;
        } else {
            this._cascadeCount = cascadesMode === ShadowCascadesMode.TwoCascades ? 2 : 4;
            let shadowTileResolution = ShadowUtils.getMaxTileResolutionInAtlas(atlasResolution, atlasResolution, this._cascadeCount);
            this._shadowTileResolution = shadowTileResolution;
            this._shadowMapWidth = shadowTileResolution * 2;
            this._shadowMapHeight = cascadesMode === ShadowCascadesMode.TwoCascades ? shadowTileResolution : shadowTileResolution * 2;
        }
    }

    get light(): WebDirectLight {
        return this._light;
    }

    constructor() {
        this._lightUp = new Vector3();
        this._lightSide = new Vector3();
        this._lightForward = new Vector3();
        this._renderQueue = new RenderListQueue(false);
        for (let i = 0; i < 6; i++)
            this._frustumPlanes.push(new Plane(new Vector3(), 0));
        this._shadowCullInfo = new ShadowCullInfo();
    }

    /**
     * 更新
     * @param context 
     */
    update(context: WebGPURenderContext3D) {
        const light = this._light;
        const camera = this.camera;
        const splitDistance = this._cascadesSplitDistance;
        const frustumPlanes = this._frustumPlanes;
        const cameraNear = camera.nearplane;
        const shadowFar = Math.min(camera.farplane, light.shadowDistance);
        const shadowMatrices = this._shadowMatrices;
        const boundSpheres = this._splitBoundSpheres;
        ShadowUtils.getCascadesSplitDistance(light.shadowTwoCascadeSplits, light._shadowFourCascadeSplits,
            cameraNear, shadowFar, camera.fieldOfView * MathUtils3D.Deg2Rad, camera.aspectRatio, this.shadowCastMode, splitDistance);
        ShadowUtils.getCameraFrustumPlanes(camera._projectViewMatrix, frustumPlanes);
        const forward = Vector3._tempVector3;
        camera.transform.getForward(forward);
        Vector3.normalize(forward, forward);
        let sliceData: ShadowSliceData;
        for (let i = 0; i < this._cascadeCount; i++) {
            sliceData = this._shadowSliceDatas[i];
            sliceData.sphereCenterZ = ShadowUtils.getBoundSphereByFrustum(splitDistance[i], splitDistance[i + 1],
                camera.fieldOfView * MathUtils3D.Deg2Rad, camera.aspectRatio, camera.transform.position, forward, sliceData.splitBoundSphere);
            ShadowUtils.getDirectionLightShadowCullPlanes(frustumPlanes, i, splitDistance, cameraNear, this._lightForward, sliceData);
            ShadowUtils.getDirectionalLightMatrices(this._lightUp, this._lightSide, this._lightForward,
                i, light.shadowNearPlane, this._shadowTileResolution, sliceData, shadowMatrices);
            if (this._cascadeCount > 1)
                ShadowUtils.applySliceTransform(sliceData, this._shadowMapWidth, this._shadowMapHeight, i, shadowMatrices);
        }
        //ShadowUtils.prepareShadowReceiverShaderValues(light.shadowStrength, this._shadowMapWidth, this._shadowMapHeight, this._shadowSliceDatas,
        //    this._cascadeCount, this._shadowMapSize, this._shadowParams, shadowMatrices, boundSpheres);
    }

    /**
     * 渲染
     * @param context 
     * @param list 
     * @param count 
     */
    render(context: WebGPURenderContext3D, list: WebBaseRenderNode[], count: number) {
        const sceneData = context.sceneData;
        const originCameraData = context.cameraData;
        const shadowMap = this.destTarget;
        context.pipelineMode = 'ShadowCaster';
        context.setRenderTarget(shadowMap as WebGPUInternalRT, RenderClearFlag.Depth);
        context.saveViewPortAndScissor();

        //清除阴影深度信息
        Viewport._tempViewport.set(0, 0, this._shadowMapWidth, this._shadowMapHeight);
        Vector4.tempVec4.setValue(0, 0, this._shadowMapWidth, this._shadowMapHeight);
        context.setViewPort(Viewport._tempViewport);
        context.setScissor(Vector4.tempVec4);
        context.setClearData(RenderClearFlag.Depth, Color.BLACK, 1, 0);
        context.clearRenderTarget();

        //渲染阴影深度信息
        context.setClearData(RenderClearFlag.Nothing, Color.BLACK, 1, 0);
        for (let i = 0, n = this._cascadeCount; i < n; i++) {
            const sliceData = this._shadowSliceDatas[i];
            this._getShadowBias(sliceData.projectionMatrix, sliceData.resolution, this._shadowBias);
            this._setupShadowCasterShaderValues(sceneData, sliceData, this._lightForward, this._shadowBias);
            const shadowCullInfo = this._shadowCullInfo;
            shadowCullInfo.position = sliceData.position;
            shadowCullInfo.cullPlanes = sliceData.cullPlanes;
            shadowCullInfo.cullPlaneCount = sliceData.cullPlaneCount;
            shadowCullInfo.cullSphere = sliceData.splitBoundSphere;
            shadowCullInfo.direction = this._lightForward;
            RenderCullUtil.cullDirectLightShadow(shadowCullInfo, list, count, this._renderQueue, context);

            context.cameraData = sliceData.cameraShaderValue as WebGPUShaderData;
            context.cameraUpdateMask++;

            const resolution = sliceData.resolution;
            const offsetX = sliceData.offsetX;
            const offsetY = sliceData.offsetY;

            if (this._renderQueue.elements.length > 0) {
                Viewport._tempViewport.set(offsetX, offsetY, resolution, resolution);
                Vector4.tempVec4.setValue(offsetX + 1, offsetY + 1, resolution - 2, resolution - 2);
                context.setViewPort(Viewport._tempViewport);
                context.setScissor(Vector4.tempVec4);
            } else {
                Viewport._tempViewport.set(offsetX, offsetY, resolution, resolution);
                Vector4.tempVec4.setValue(offsetX, offsetY, resolution, resolution);
                context.setViewPort(Viewport._tempViewport);
                context.setScissor(Vector4.tempVec4);
            }

            this._renderQueue.renderQueue(context);
            this._applyCasterPassCommandBuffer(context);
        }
        this._applyRenderData(context.sceneData, context.cameraData);

        context.restoreViewPortAndScissor();
        context.cameraData = originCameraData;
        context.cameraUpdateMask++;
    }

    /**
     * 设置渲染数据
     * @param sceneData 
     * @param cameraData 
     */
    private _applyRenderData(sceneData: WebGPUShaderData, cameraData: WebGPUShaderData) {
        const light = this._light;
        if (light.shadowCascadesMode !== ShadowCascadesMode.NoCascades)
            sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_CASCADE);
        else sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_CASCADE);
        switch (light.shadowMode) {
            case ShadowMode.Hard:
                sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_LOW);
                sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_HIGH);
                break;
            case ShadowMode.SoftLow:
                sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_LOW);
                sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_HIGH);
                break;
            case ShadowMode.SoftHigh:
                sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_HIGH);
                sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_LOW);
                break;
        }
        sceneData.setBuffer(ShadowCasterPass.SHADOW_MATRICES, this._shadowMatrices);
        sceneData.setVector(ShadowCasterPass.SHADOW_MAP_SIZE, this._shadowMapSize);
        sceneData.setBuffer(ShadowCasterPass.SHADOW_SPLIT_SPHERES, this._splitBoundSpheres);
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
     * 获取阴影偏移
     * @param shadowProjectionMatrix 
     * @param shadowResolution 
     * @param out 
     */
    private _getShadowBias(shadowProjectionMatrix: Matrix4x4, shadowResolution: number, out: Vector4) {
        // Frustum size is guaranteed to be a cube as we wrap shadow frustum around a sphere
        // elements[0] = 2.0 / (right - left)
        const frustumSize = 2 / shadowProjectionMatrix.elements[0];

        // depth and normal bias scale is in shadowmap texel size in world space
        const texelSize = frustumSize / shadowResolution;
        let depthBias = -this._light.shadowDepthBias * texelSize;
        let normalBias = -this._light.shadowNormalBias * texelSize;

        if (this._light.shadowMode === ShadowMode.SoftHigh) {
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
     * @param lightParam 
     * @param shadowBias 
     */
    private _setupShadowCasterShaderValues(shaderData: WebGPUShaderData, shadowSliceData: ShadowSliceData, lightParam: Vector3, shadowBias: Vector4) {
        shaderData.setVector(ShadowCasterPass.SHADOW_BIAS, shadowBias);
        shaderData.setVector3(ShadowCasterPass.SHADOW_LIGHT_DIRECTION, lightParam);
        shaderData.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, shadowSliceData.viewProjectMatrix);
        const cameraShaderData = shadowSliceData.cameraShaderValue as WebGPUShaderData;
        cameraShaderData.setMatrix4x4(BaseCamera.VIEWMATRIX, shadowSliceData.viewMatrix);
        cameraShaderData.setMatrix4x4(BaseCamera.PROJECTMATRIX, shadowSliceData.projectionMatrix);
        cameraShaderData.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, shadowSliceData.viewProjectMatrix);
    }
}