import { ShadowCascadesMode } from "../../../../../d3/core/light/ShadowCascadesMode";
import { ShadowMapFormat, ShadowUtils } from "../../../../../d3/core/light/ShadowUtils";
import { Plane } from "../../../../../d3/math/Plane";
import { ShadowCullInfo, ShadowSliceData } from "../../../../../d3/shadowMap/ShadowSliceData";
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
import { IDirShadowRP, IRenderContext3D } from "../../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { ISceneRenderManager } from "../../../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { InternalRenderTarget } from "../../../../DriverDesign/RenderDevice/InternalRenderTarget";
import { ShaderData } from "../../../../DriverDesign/RenderDevice/ShaderData";
import { WebGLShaderData } from "../../WebGLShaderData";
import { WebDirectLight } from "../WebDirectLight";
import { WebCameraNodeData, WebSceneNodeData } from "../WebModuleData";
import { RenderListQueue } from "../../../../DriverCommon/RenderListQueue";
import { ShadowMode } from "../../../../../d3/core/light/ShadowMode";
import { ShadowCasterPass } from "../../../../../d3/shadowMap/ShadowCasterPass";
import { BaseCamera } from "../../../../../d3/core/BaseCamera";
import { WebBaseRenderNode } from "../WebBaseRenderNode";
import { SingletonList } from "../../../../../utils/SingletonList";
import { Scene3DShaderDeclaration } from "../../../../../d3/core/scene/Scene3DShaderDeclaration";
import { CommandBuffer } from "../../../../../d3/core/render/command/CommandBuffer";
import { Scene3D } from "../../../../../d3/core/scene/Scene3D";
import { RenderTexture } from "../../../../../resource/RenderTexture";
import { BatchCullMode } from "../../../../DriverDesign/3DRenderPass/IBatchModuleAgent";

export class WebDirCascadeShadowRP implements IDirShadowRP {
    /** @internal 最大cascade*/
    private static _maxCascades: number = 4;

    private _light: WebDirectLight;
    /**@internal */
    private _lightup: Vector3;
    /**@internal */
    private _lightSide: Vector3;
    /**@internal */
    private _lightForward: Vector3;

    //caculate data
    /**@internal 分割distance*/
    private _cascadesSplitDistance: number[] = new Array(WebDirCascadeShadowRP._maxCascades + 1);
    /** @internal */
    private _frustumPlanes: Plane[];
    /** @internal */
    private _shadowMatrices: Float32Array = new Float32Array(16 * (WebDirCascadeShadowRP._maxCascades));
    /**@internal */
    private _splitBoundSpheres: Float32Array = new Float32Array(WebDirCascadeShadowRP._maxCascades * 4);
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
    private _shadowCullInfo: ShadowCullInfo[] = [new ShadowCullInfo(), new ShadowCullInfo(), new ShadowCullInfo(), new ShadowCullInfo()];

    private _shadowCastMode: ShadowCascadesMode;

    private _camera: WebCameraNodeData;

    private _destShadowRT: RenderTexture;

    /**@internal */
    private _renderQueue: RenderListQueue;

    private _shadowCasterCommanBuffer: CommandBuffer[];

    private _defaultShadowMap: RenderTexture;

    constructor() {
        this._lightup = new Vector3();
        this._lightSide = new Vector3();
        this._lightForward = new Vector3();
        this._cascadesSplitDistance = new Array(WebDirCascadeShadowRP._maxCascades + 1);
        this._frustumPlanes = new Array(new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0));
        this._renderQueue = new RenderListQueue(false);

    }

    private _setLight(value: WebDirectLight) {
        this._light = value;
        var lightWorld: Matrix4x4 = Matrix4x4.TEMP;
        var lightWorldE: Float32Array = lightWorld.elements;
        var lightUp: Vector3 = this._lightup;
        var lightSide: Vector3 = this._lightSide;
        var lightForward: Vector3 = this._lightForward;
        Matrix4x4.createFromQuaternion(this._light.transform.rotation, lightWorld);
        lightSide.setValue(lightWorldE[0], lightWorldE[1], lightWorldE[2]);
        lightUp.setValue(lightWorldE[4], lightWorldE[5], lightWorldE[6]);
        lightForward.setValue(-lightWorldE[8], -lightWorldE[9], -lightWorldE[10]);
        //设置分辨率
        var atlasResolution = this._light.shadowResolution;
        var cascadesMode = this._shadowCastMode = this._light.shadowCascadesMode;

        if (cascadesMode == ShadowCascadesMode.NoCascades) {
            this._cascadeCount = 1;
            this._shadowTileResolution = atlasResolution;
            this._shadowMapWidth = atlasResolution;
            this._shadowMapHeight = atlasResolution;
        }
        else {
            this._cascadeCount = cascadesMode == ShadowCascadesMode.TwoCascades ? 2 : 4;
            let shadowTileResolution = ShadowUtils.getMaxTileResolutionInAtlas(atlasResolution, atlasResolution, this._cascadeCount);
            this._shadowTileResolution = shadowTileResolution;
            this._shadowMapWidth = shadowTileResolution * 2;
            this._shadowMapHeight = cascadesMode == ShadowCascadesMode.TwoCascades ? shadowTileResolution : shadowTileResolution * 2;
        }
    }


    private _getShadowBias(shadowProjectionMatrix: Matrix4x4, shadowResolution: number, out: Vector4) {
        var frustumSize: number;

        // Frustum size is guaranteed to be a cube as we wrap shadow frustum around a sphere
        // elements[0] = 2.0 / (right - left)
        frustumSize = 2.0 / shadowProjectionMatrix.elements[0];


        // depth and normal bias scale is in shadowmap texel size in world space
        var texelSize: number = frustumSize / shadowResolution;
        var depthBias: number = -this._light.shadowDepthBias * texelSize;
        var normalBias: number = -this._light.shadowNormalBias * texelSize;

        if (this._light.shadowMode == ShadowMode.SoftHigh) {
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

    /**
    * 设置阴影级联数据模式
    * @internal
    */
    private _setupShadowCasterShaderValues(shaderValues: ShaderData, shadowSliceData: ShadowSliceData, LightParam: Vector3, shadowBias: Vector4): void {
        shaderValues.setVector(ShadowCasterPass.SHADOW_BIAS, shadowBias);
        shaderValues.setVector3(ShadowCasterPass.SHADOW_LIGHT_DIRECTION, LightParam);

        var cameraSV = shadowSliceData.cameraShaderValue;
        cameraSV.setMatrix4x4(BaseCamera.VIEWMATRIX, shadowSliceData.viewMatrix);
        cameraSV.setMatrix4x4(BaseCamera.PROJECTMATRIX, shadowSliceData.projectionMatrix);
        cameraSV.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, shadowSliceData.viewProjectMatrix);
        shaderValues.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, shadowSliceData.viewProjectMatrix);
    }

    /**
     * set shaderData after Render shadow
     * @param scene 
     * @param camera 
     */
    private _applyRenderData(scene: ShaderData, camera: ShaderData) {
        var light = this._light;
        if (light.shadowCascadesMode !== ShadowCascadesMode.NoCascades)
            scene.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_CASCADE);
        else
            scene.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_CASCADE);
        switch (light.shadowMode) {
            case ShadowMode.Hard:
                scene.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_LOW);
                scene.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_HIGH);
                break;
            case ShadowMode.SoftLow:
                scene.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_LOW);
                scene.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_HIGH);
                break;
            case ShadowMode.SoftHigh:
                scene.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_HIGH);
                scene.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_LOW);
                break;
        }
        scene.setBuffer(ShadowCasterPass.SHADOW_MATRICES, this._shadowMatrices);
        scene.setVector(ShadowCasterPass.SHADOW_MAP_SIZE, this._shadowMapSize);
        scene.setBuffer(ShadowCasterPass.SHADOW_SPLIT_SPHERES, this._splitBoundSpheres);
    }

    /**
     * apply shadowCast cmd array
     */
    private _applyCasterPassCommandBuffer(context: IRenderContext3D) {
        if (!this._shadowCasterCommanBuffer || this._shadowCasterCommanBuffer.length == 0)
            return;
        this._shadowCasterCommanBuffer.forEach(function (value) {
            value._apply();
        });
    }

    setShadowCasterCommanBuffer(cmd: CommandBuffer[]): void {
        this._shadowCasterCommanBuffer = cmd;
    }

    private _caculateDirCullInfo() {
        var splitDistance: number[] = this._cascadesSplitDistance;
        var frustumPlanes: Plane[] = this._frustumPlanes;
        var cameraNear: number = this._camera.nearplane;
        var shadowFar: number = Math.min(this._camera.farplane, this._light.shadowDistance);
        var shadowMatrices: Float32Array = this._shadowMatrices;
        var boundSpheres: Float32Array = this._splitBoundSpheres;
        ShadowUtils.getCascadesSplitDistance(this._light.shadowTwoCascadeSplits, this._light._shadowFourCascadeSplits, cameraNear, shadowFar, this._camera.fieldOfView * MathUtils3D.Deg2Rad, this._camera.aspectRatio, this._shadowCastMode, splitDistance);
        ShadowUtils.getCameraFrustumPlanes(this._camera._projectViewMatrix, frustumPlanes);
        var forward: Vector3 = Vector3.TEMP;
        this._camera.transform.getForward(forward);
        Vector3.normalize(forward, forward);
        for (var i: number = 0; i < this._cascadeCount; i++) {
            var sliceData: ShadowSliceData = this._shadowSliceDatas[i];
            sliceData.sphereCenterZ = ShadowUtils.getBoundSphereByFrustum(splitDistance[i], splitDistance[i + 1], this._camera.fieldOfView * MathUtils3D.Deg2Rad, this._camera.aspectRatio, this._camera.transform.position, forward, sliceData.splitBoundSphere);
            ShadowUtils.getDirectionLightShadowCullPlanes(frustumPlanes, i, splitDistance, cameraNear, this._lightForward, sliceData);
            ShadowUtils.getDirectionalLightMatrices(this._lightup, this._lightSide, this._lightForward, i, this._light.shadowNearPlane, this._shadowTileResolution, sliceData, shadowMatrices);
            if (this._cascadeCount > 1)
                ShadowUtils.applySliceTransform(sliceData, this._shadowMapWidth, this._shadowMapHeight, i, shadowMatrices);
        }
        ShadowUtils.prepareShadowReceiverShaderValues(this._shadowMapWidth, this._shadowMapHeight, this._shadowSliceDatas, this._cascadeCount, this._shadowMapSize, shadowMatrices, boundSpheres);

        for (var i: number = 0, n: number = this._cascadeCount; i < n; i++) {
            var shadowCullInfo = this._shadowCullInfo[i];
            var sliceData: ShadowSliceData = this._shadowSliceDatas[i];
            shadowCullInfo.cameraPosition = this._camera.transform.position;
            shadowCullInfo.position = sliceData.position;
            shadowCullInfo.cullPlanes = sliceData.cullPlanes;
            shadowCullInfo.cullPlaneCount = sliceData.cullPlaneCount;
            shadowCullInfo.cullSphere = sliceData.splitBoundSphere;
            shadowCullInfo.direction = this._lightForward;
        }
    }

    setCameraCullInfo(sceneManager: ISceneRenderManager): void {
        let cullInfos = this._shadowCullInfo.slice(0, this._cascadeCount);
        let agent = sceneManager.batchAgentList;
        for (var [key, value] of agent) {
            value.setDirLightCullInfo(cullInfos);
        }
    }


    setRPData(dirLight: WebDirectLight, camera: WebCameraNodeData, context: IRenderContext3D): void {
        this._setLight(dirLight);
        this._camera = camera;
        this._destShadowRT = Scene3D._shadowCasterPass.getDirectLightShadowMap(dirLight);
        let v4 = context.sceneData.getVector(ShadowCasterPass.SHADOW_PARAMS);
        v4 = v4 ? v4 : new Vector4();
        v4.x = dirLight.shadowStrength;
        context.sceneData.setVector(ShadowCasterPass.SHADOW_PARAMS, v4);
        context.sceneData.setTexture(ShadowCasterPass.SHADOW_MAP, this._defaultShadowMap);
        this._caculateDirCullInfo();

    }

    update(context: IRenderContext3D): void {
        context.sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
        context.sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
    }

    render(context: IRenderContext3D, manager: ISceneRenderManager): void {
        let shaderValues: ShaderData = context.sceneData;
        context.pipelineMode = "ShadowCaster";
        var shadowMap = this._destShadowRT;
        context.setRenderTarget(shadowMap._renderTarget, RenderClearFlag.Depth);
        context.setClearData(RenderClearFlag.Depth, Color.BLACK, 1, 0);

        let originCameraData = context.cameraData;
        let originInvertY = context.invertY;

        //需要把shadowmap clear Depth;
        for (var i: number = 0, n: number = this._cascadeCount; i < n; i++) {
            var sliceData: ShadowSliceData = this._shadowSliceDatas[i];
            this._getShadowBias(sliceData.projectionMatrix, sliceData.resolution, this._shadowBias);
            this._setupShadowCasterShaderValues(shaderValues, sliceData, this._lightForward, this._shadowBias);
            var shadowCullInfo: ShadowCullInfo = this._shadowCullInfo[i];
            //cull
            let list = manager.baseRenderList as SingletonList<WebBaseRenderNode>;
            var time = Browser.now();//T_ShadowMapCull Stat
            RenderCullUtil.cullDirectLightShadow(shadowCullInfo, list.elements, list.length, this._renderQueue, context);
            let agent = manager.batchAgentList;
            for (var [key, agentModule] of agent) {
                let agentrenderList = agentModule.appendRenderElement(BatchCullMode.DirectLight, i, context).opaqueList;
                let element = agentrenderList.elements;
                for (var jj = 0; jj < agentrenderList.length; jj++) {
                    this._renderQueue.addRenderElement(element[jj]);
                }
            }
            LayaGL.statAgent.recordTimeData(StatElement.T_CullShadow, performance.now() - time);

            context.cameraData = sliceData.cameraShaderValue as WebGLShaderData;
            context.invertY = false;
            context.cameraUpdateMask++;

            var resolution: number = sliceData.resolution;
            var offsetX: number = sliceData.offsetX;
            var offsetY: number = sliceData.offsetY;

            Viewport.TEMP.set(offsetX, offsetY, resolution, resolution);
            Vector4.TEMP.setValue(offsetX + 1, offsetY + 1, resolution - 2, resolution - 2);
            context.setViewPort(Viewport.TEMP);
            context.setScissor(Vector4.TEMP);

            if (this._renderQueue.elements.length > 0) {// if one cascade have anything to render.
                this._renderQueue.renderQueue(context);
            }
            else {
                context.clearRenderTarget();
            }

            // context.setClearData(RenderClearFlag.Depth, Color.BLACK, 1, 0);
            LayaGL.statAgent.recordCTData(StatElement.CT_ShadowDrawCall, this._renderQueue.elements.length);
            this._applyCasterPassCommandBuffer(context);
        }
        this._applyRenderData(context.sceneData, context.cameraData);
        context.cameraData = originCameraData;
        context.invertY = originInvertY;
        context.cameraUpdateMask++;
    }

    useRPResource(context: IRenderContext3D): void {
        context.sceneData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
        context.sceneData.setTexture(ShadowCasterPass.SHADOW_MAP, this._destShadowRT);
    }

    unuseRPResource(context: IRenderContext3D): void {
        context.sceneData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
    }

    destory(): void {
        throw new Error("Method not implemented.");
    }

}