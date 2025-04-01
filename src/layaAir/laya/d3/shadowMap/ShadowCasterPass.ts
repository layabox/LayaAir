import { ShadowCascadesMode } from "../core/light/ShadowCascadesMode";
import { ShadowMapFormat, ShadowUtils } from "../core/light/ShadowUtils";
import { SpotLightCom } from "../core/light/SpotLightCom";
import { Config3D } from "../../../Config3D";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { RenderTexture } from "../../resource/RenderTexture";
import { LayaGL } from "../../layagl/LayaGL";
import { DirectionLightCom } from "../core/light/DirectionLightCom";
import { ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Scene3D } from "../core/scene/Scene3D";
import { CommandUniformMap } from "../../RenderDriver/DriverDesign/RenderDevice/CommandUniformMap";
import { Config } from "../../../Config";

/**
 * @internal
 * @en ShadowCasterPass class used to implement the shadow rendering pipeline.
 * @zh ShadowCasterPass 类用于实现阴影渲染管线。
 */
export class ShadowCasterPass {

    static ShadowUniformMap: CommandUniformMap;
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

        const shadowUniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("Shadow");

        shadowUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_LIGHT_DIRECTION, "u_ShadowLightDirection", ShaderDataType.Vector3);
        shadowUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_BIAS, "u_ShadowBias", ShaderDataType.Vector4);
        shadowUniformMap.addShaderUniformArray(ShadowCasterPass.SHADOW_SPLIT_SPHERES, "u_ShadowSplitSpheres", ShaderDataType.Vector4, 4); //兼容WGSL
        shadowUniformMap.addShaderUniformArray(ShadowCasterPass.SHADOW_MATRICES, "u_ShadowMatrices", ShaderDataType.Matrix4x4, 4); //兼容WGSL
        shadowUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_MAP_SIZE, "u_ShadowMapSize", ShaderDataType.Vector4);
        shadowUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_MAP, "u_ShadowMap", ShaderDataType.Texture2D);
        shadowUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_PARAMS, "u_ShadowParams", ShaderDataType.Vector4);
        shadowUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_SPOTMAP_SIZE, "u_SpotShadowMapSize", ShaderDataType.Vector4);
        shadowUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_SPOTMAP, "u_SpotShadowMap", ShaderDataType.Texture2D);
        shadowUniformMap.addShaderUniform(ShadowCasterPass.SHADOW_SPOTMATRICES, "u_SpotViewProjectMatrix", ShaderDataType.Matrix4x4);

        this.ShadowUniformMap = shadowUniformMap;
    }

    /** @internal */
    private _shadowDirectLightMap: RenderTexture;
    /** @internal */
    private _shadowSpotLightMap: RenderTexture;

    /**
     * @en Create a new instance of ShadowCasterPass.
     * @zh 创建  ShadowCasterPass 类的新实例。
     */
    constructor() {
    }

    /**
     * @en Retrieve the shadow map for a directional light.
     * @param light The directional light component.
     * @returns The shadow map texture for the directional light.
     * @zh 获取方向光的阴影贴图。
     * @param light 方向光组件。
     * @returns 方向光的阴影贴图纹理。
     */
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
        this._shadowDirectLightMap = ShadowUtils.getTemporaryShadowTexture(shadowMapWidth, shadowMapHeight, ShadowMapFormat.bit16);
        return this._shadowDirectLightMap;
    }

    /**
     * @en Retrieve the shadow pass data for a spot light.
     * @param light The spot light component.
     * @returns The shadow map texture for the spot light.
     * @zh 获取聚光灯的阴影通道数据。
     * @param light 聚光灯组件。
     * @returns 聚光灯的阴影贴图纹理。
     */
    getSpotLightShadowPassData(light: SpotLightCom) {
        this._shadowSpotLightMap && RenderTexture.recoverToPool(this._shadowSpotLightMap);
        var shadowResolution: number = light.shadowResolution;
        var shadowMapWidth = shadowResolution;
        var shadowMapHeight = shadowResolution;
        this._shadowSpotLightMap = ShadowUtils.getTemporaryShadowTexture(shadowMapWidth, shadowMapHeight, ShadowMapFormat.bit16);
        return this._shadowSpotLightMap;
    }

    /**
     * @en Retrieve the shadow pass data for a point light.
     * @zh 获取点光源的阴影通道数据。
     */
    getPointLightShadowPassData() {
        //TODO
    }

    /**
     * @internal
     * @en Clean up shadow data.
     * @zh 清理阴影数据。
     */
    cleanUp(): void {
        this._shadowDirectLightMap && RenderTexture.recoverToPool(this._shadowDirectLightMap);
        this._shadowSpotLightMap && RenderTexture.recoverToPool(this._shadowSpotLightMap);
        this._shadowDirectLightMap = null;
        this._shadowSpotLightMap = null;
    }
}

