import { BaseCamera } from "../core/BaseCamera";
import { ShadowCascadesMode } from "../core/light/ShadowCascadesMode";
import { ShadowMapFormat, ShadowUtils } from "../core/light/ShadowUtils";
import { SpotLightCom } from "../core/light/SpotLightCom";
import { Config3D } from "../../../Config3D";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { UnifromBufferData } from "../../RenderEngine/UniformBufferData";
import { UniformBufferObject } from "../../RenderEngine/UniformBufferObject";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DepthCasterData } from "../depthMap/DepthCasterData";
import { RenderTexture } from "../../resource/RenderTexture";
import { LayaGL } from "../../layagl/LayaGL";
import { DirectionLightCom } from "../core/light/DirectionLightCom";
import { ShaderDataType } from "../../RenderDriver/RenderModuleData/Design/ShaderData";

/**
 * @internal
 * <code>ShadowCasterPass</code> 类用于实现阴影渲染管线
 */
export class ShadowCasterPass {
    /** @internal */
    static SHADOW_BIAS: number;
    /** @internal */
    static SHADOW_LIGHT_DIRECTION: number;
    /** @internal */
    static SHADOW_SPLIT_SPHERES: number;
    /** @internal */
    static SHADOW_MATRICES: number;
    /** @internal */
    static SHADOW_MAP_SIZE: number;
    /** @internal */
    static SHADOW_MAP: number;
    /** @internal */
    static SHADOW_PARAMS: number;
    /** @internal */
    static SHADOW_SPOTMAP_SIZE: number;
    /** @internal */
    static SHADOW_SPOTMAP: number;
    /** @internal */
    static SHADOW_SPOTMATRICES: number;

    /**
     * @internal
     * init Scene UniformMap
     */
    static __init__() {
        ShadowCasterPass.SHADOW_BIAS = Shader3D.propertyNameToID("u_ShadowBias");
        ShadowCasterPass.SHADOW_LIGHT_DIRECTION = Shader3D.propertyNameToID("u_ShadowLightDirection");
        ShadowCasterPass.SHADOW_SPLIT_SPHERES = Shader3D.propertyNameToID("u_ShadowSplitSpheres");
        ShadowCasterPass.SHADOW_MATRICES = Shader3D.propertyNameToID("u_ShadowMatrices");
        ShadowCasterPass.SHADOW_MAP_SIZE = Shader3D.propertyNameToID("u_ShadowMapSize");
        ShadowCasterPass.SHADOW_MAP = Shader3D.propertyNameToID("u_ShadowMap");
        ShadowCasterPass.SHADOW_PARAMS = Shader3D.propertyNameToID("u_ShadowParams");
        ShadowCasterPass.SHADOW_SPOTMAP_SIZE = Shader3D.propertyNameToID("u_SpotShadowMapSize");
        ShadowCasterPass.SHADOW_SPOTMAP = Shader3D.propertyNameToID("u_SpotShadowMap");
        ShadowCasterPass.SHADOW_SPOTMATRICES = Shader3D.propertyNameToID("u_SpotViewProjectMatrix");

        const sceneUniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("Scene3D");

        if (Config3D._uniformBlock) {
            sceneUniformMap.addShaderBlockUniform(Shader3D.propertyNameToID(UniformBufferObject.UBONAME_SHADOW), UniformBufferObject.UBONAME_SHADOW, [
                {
                    id: ShadowCasterPass.SHADOW_BIAS,
                    propertyName: "u_ShadowBias",
                    uniformtype: ShaderDataType.Vector4

                },
                {
                    id: ShadowCasterPass.SHADOW_LIGHT_DIRECTION,
                    propertyName: "u_ShadowLightDirection",
                    uniformtype: ShaderDataType.Vector3
                }
            ])
        } else {
            sceneUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_BIAS, "u_ShadowBias", ShaderDataType.Vector4);
            sceneUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_LIGHT_DIRECTION, "u_ShadowLightDirection", ShaderDataType.Vector3);
        }



        sceneUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_SPLIT_SPHERES, "u_ShadowSplitSpheres", ShaderDataType.Vector4);
        sceneUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_MATRICES, "u_ShadowMatrices", ShaderDataType.Matrix4x4);
        sceneUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_MAP_SIZE, "u_ShadowMapSize", ShaderDataType.Vector4);
        sceneUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_MAP, "u_ShadowMap", ShaderDataType.Texture2D);
        sceneUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_PARAMS, "u_ShadowParams", ShaderDataType.Vector4);
        sceneUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_SPOTMAP_SIZE, "u_SpotShadowMapSize", ShaderDataType.Vector4);
        sceneUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_SPOTMAP, "u_SpotShadowMap", ShaderDataType.Texture2D);
        sceneUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_SPOTMATRICES, "u_SpotViewProjectMatrix", ShaderDataType.Matrix4x4);
        //sceneUniformMap.addShaderUniform(Shader3D.propertyNameToID(UniformBufferObject.UBONAME_SHADOW), UniformBufferObject.UBONAME_SHADOW);
    }


    /** @internal */
    _castDepthBufferData: UnifromBufferData;
    _castDepthBufferOBJ: UniformBufferObject;

    _castDepthCameraBufferData: UnifromBufferData;
    _castDepthCameraBufferOBJ: UniformBufferObject;

    /** @internal */
    private _shadowDirectLightMap: RenderTexture;
    /** @internal */
    private _shadowSpotLightMap: RenderTexture;

    constructor() {
        if (Config3D._uniformBlock) {
            this._castDepthBufferData = DepthCasterData.createDepthCasterUniformBlock();
            this._castDepthBufferOBJ = UniformBufferObject.getBuffer(UniformBufferObject.UBONAME_SHADOW, 0);
            if (!this._castDepthBufferOBJ) {
                this._castDepthBufferOBJ = UniformBufferObject.create(UniformBufferObject.UBONAME_SHADOW, BufferUsage.Dynamic, this._castDepthBufferData.getbyteLength(), true);
            }
            BaseCamera.createCameraUniformBlock();
            this._castDepthCameraBufferData = BaseCamera.CameraUBOData.clone();
            this._castDepthCameraBufferOBJ = UniformBufferObject.getBuffer(UniformBufferObject.UBONAME_CAMERA, 1);
            if (!this._castDepthCameraBufferOBJ) {
                this._castDepthCameraBufferOBJ = UniformBufferObject.create(UniformBufferObject.UBONAME_CAMERA, BufferUsage.Dynamic, this._castDepthCameraBufferData.getbyteLength(), false);
            }
        }

    }

    getDirectLightShadowMap(light: DirectionLightCom) {
        var shadowMapWidth;
        var shadowMapHeight;
        var atlasResolution: number = light.shadowResolution;
        var cascadesMode: ShadowCascadesMode = light.shadowCascadesMode;
        var cascadesCount: number;
        var shadowTileResolution: number;
        if (cascadesMode == ShadowCascadesMode.NoCascades) {
            shadowTileResolution = atlasResolution;
            shadowMapWidth = atlasResolution;
            shadowMapHeight = atlasResolution;
        }
        else {
            cascadesCount = cascadesMode == ShadowCascadesMode.TwoCascades ? 2 : 4;
            shadowTileResolution = ShadowUtils.getMaxTileResolutionInAtlas(atlasResolution, atlasResolution, cascadesCount);
            shadowMapWidth = shadowTileResolution * 2;
            shadowMapHeight = cascadesMode == ShadowCascadesMode.TwoCascades ? shadowTileResolution : shadowTileResolution * 2;
        }
        this._shadowDirectLightMap && RenderTexture.recoverToPool(this._shadowDirectLightMap);
        this._shadowDirectLightMap = ShadowUtils.getTemporaryShadowTexture(shadowMapHeight, shadowMapWidth, ShadowMapFormat.bit16);
        return this._shadowDirectLightMap;
    }

    getSpotLightShadowPassData(light: SpotLightCom) {
        this._shadowSpotLightMap && RenderTexture.recoverToPool(this._shadowSpotLightMap);
        var shadowResolution: number = light.shadowResolution;
        var shadowMapWidth = shadowResolution;
        var shadowMapHeight = shadowResolution;
        this._shadowSpotLightMap = ShadowUtils.getTemporaryShadowTexture(shadowMapWidth, shadowMapHeight, ShadowMapFormat.bit16);
        return this._shadowSpotLightMap;
    }

    getPointLightShadowPassData() {
        //TODO
    }

    /**
     * 清理阴影数据
     * @internal
     */
    cleanUp(): void {
        this._shadowDirectLightMap && RenderTexture.recoverToPool(this._shadowDirectLightMap);
        this._shadowSpotLightMap && RenderTexture.recoverToPool(this._shadowSpotLightMap);
        this._shadowDirectLightMap = null;
        this._shadowSpotLightMap = null;
    }
}

