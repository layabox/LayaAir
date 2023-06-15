import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ShaderDataType } from "../../RenderEngine/RenderShader/ShaderData";
import { ShaderDefine } from "../../RenderEngine/RenderShader/ShaderDefine";
import { SubShader } from "../../RenderEngine/RenderShader/SubShader";
import { Vector3 } from "../../maths/Vector3";
import { Vector4 } from "../../maths/Vector4";
import { Texture2D } from "../../resource/Texture2D";

import glTFMetallicRoughnessGLSL from "./glTFMetallicRoughness.glsl";
import glTFPBRVS from "./glTFPBR.vs";
import glTFPBRFS from "./glTFPBR.fs";
import DepthVS from "./glTFPBRDepth.vs";
import DephtFS from "./glTFPBRDepth.fs";
import DepthNormalVS from "./glTFPBRDepthNormal.vs";
import DepthNormalFS from "./glTFPBRDepthNormal.fs";

/**
 * @internal
 */
export class glTFShader {

    static ShaderName: string = "glTFPBR";

    static Define_BaseColorMap: ShaderDefine;
    static Define_BaseColorMapTransform: ShaderDefine;

    static Define_MetallicRoughnessMap: ShaderDefine;
    static Define_MetallicRoughnessMapTransform: ShaderDefine;

    static Define_NormalMap: ShaderDefine;
    static Define_NormalMapTransform: ShaderDefine;

    static Define_OcclusionMap: ShaderDefine;
    static Define_OcclusionMapTransform: ShaderDefine;

    static Define_EmissionMap: ShaderDefine;
    static Define_EmissionMapTransform: ShaderDefine;

    // clear coat
    static Define_ClearCoatMap: ShaderDefine;
    static Define_ClearCoatMapTransform: ShaderDefine;
    static Define_ClearCoatRoughnessMap: ShaderDefine;
    static Define_ClearCoatRoughnessMapTransform: ShaderDefine;
    static Define_ClearCoatNormalMapTransform: ShaderDefine;

    // anisotropy
    static Define_AnisotropyMap: ShaderDefine;
    static Define_AnisotropyMapTransform: ShaderDefine;

    // iridescence
    static Define_IridescenceMap: ShaderDefine;
    static Define_IridescenceMapTransform: ShaderDefine;
    static Define_IridescenceThicknessMap: ShaderDefine;
    static Define_IridescenceThicknessMapTransform: ShaderDefine;

    // sheen
    static Define_SheenColorMap: ShaderDefine;
    static Define_SheenColorMapTransform: ShaderDefine;
    static Define_SheenRoughnessMap: ShaderDefine;
    static Define_SheenRoughnessMapTransform: ShaderDefine;

    // transmission
    static Define_TransmissionMap: ShaderDefine;
    static Define_TransmissionMapTransform: ShaderDefine;

    // volume
    // todo 
    static Define_Volume: ShaderDefine;
    static Define_VolumeThicknessMap: ShaderDefine;
    static Define_VolumeThicknessMapTransform: ShaderDefine;

    // specular
    static Define_SpecularFactorMap: ShaderDefine;
    static Define_SpecularFactorMapTransform: ShaderDefine;
    static Define_SpecularColorMap: ShaderDefine;
    static Define_SpecularColorMapTransform: ShaderDefine;

    // todo
    static init() {

        Shader3D.addInclude("glTFMetallicRoughness.glsl", glTFMetallicRoughnessGLSL);

        this.Define_BaseColorMap = Shader3D.getDefineByName("BASECOLORMAP");
        this.Define_BaseColorMapTransform = Shader3D.getDefineByName("BASECOLORMAP_TRANSFORM");

        this.Define_MetallicRoughnessMap = Shader3D.getDefineByName("METALLICROUGHNESSMAP");
        this.Define_MetallicRoughnessMapTransform = Shader3D.getDefineByName("METALLICROUGHNESSMAP_TRANSFORM");
        this.Define_NormalMap = Shader3D.getDefineByName("NORMALMAP");
        this.Define_NormalMapTransform = Shader3D.getDefineByName("NORMALMAP_TRANSFORM");
        this.Define_OcclusionMap = Shader3D.getDefineByName("OCCLUSIONMAP");
        this.Define_OcclusionMapTransform = Shader3D.getDefineByName("OCCLUSIONMAP_TRANSFORM");
        this.Define_EmissionMap = Shader3D.getDefineByName("EMISSIONMAP");
        this.Define_EmissionMapTransform = Shader3D.getDefineByName("EMISSIONMAP_TRANSFORM");

        this.Define_ClearCoatMap = Shader3D.getDefineByName("CLEARCOATMAP");
        this.Define_ClearCoatMapTransform = Shader3D.getDefineByName("CLEARCOATMAP_TRANSFORM");
        this.Define_ClearCoatRoughnessMap = Shader3D.getDefineByName("CLEARCOAT_ROUGHNESSMAP");
        this.Define_ClearCoatRoughnessMapTransform = Shader3D.getDefineByName("CLEARCOAT_ROUGHNESSMAP_TRANSFORM");
        this.Define_ClearCoatNormalMapTransform = Shader3D.getDefineByName("CLEARCOAT_NORMALMAP_TRANSFORM");

        this.Define_AnisotropyMap = Shader3D.getDefineByName("ANISOTROPYMAP");
        this.Define_AnisotropyMapTransform = Shader3D.getDefineByName("ANISOTROPYMAP_TRANSFORM");

        this.Define_IridescenceMap = Shader3D.getDefineByName("IRIDESCENCEMAP");
        this.Define_IridescenceMapTransform = Shader3D.getDefineByName("IRIDESCENCEMAP_TRANSFORM");
        this.Define_IridescenceThicknessMap = Shader3D.getDefineByName("IRIDESCENCE_THICKNESSMAP");
        this.Define_IridescenceThicknessMapTransform = Shader3D.getDefineByName("IRIDESCENCE_THICKNESSMAP_TRANSFORM");

        this.Define_SheenColorMap = Shader3D.getDefineByName("SHEENCOLORMAP");
        this.Define_SheenColorMapTransform = Shader3D.getDefineByName("SHEENCOLORMAP_TRANSFORM");
        this.Define_SheenRoughnessMap = Shader3D.getDefineByName("SHEEN_ROUGHNESSMAP");
        this.Define_SheenRoughnessMapTransform = Shader3D.getDefineByName("SHEEN_ROUGHNESSMAP_TRANSFORM");

        this.Define_TransmissionMap = Shader3D.getDefineByName("TRANSMISSIONMAP");
        this.Define_TransmissionMapTransform = Shader3D.getDefineByName("TRANSMISSIONMAP_TRANSFORM");

        this.Define_Volume = Shader3D.getDefineByName("VOLUME");
        this.Define_VolumeThicknessMap = Shader3D.getDefineByName("VOLUME_THICKNESSMAP");
        this.Define_VolumeThicknessMapTransform = Shader3D.getDefineByName("VOLUME_THICKNESSMAP_TRANSFORM");

        this.Define_SpecularFactorMap = Shader3D.getDefineByName("SPECULARFACTORMAP");
        this.Define_SpecularFactorMapTransform = Shader3D.getDefineByName("SPECULARFACTORMAP_TRANSFORM");
        this.Define_SpecularColorMap = Shader3D.getDefineByName("SPECULARCOLORMAP");
        this.Define_SpecularColorMapTransform = Shader3D.getDefineByName("SPECULARCOLORMAP_TRANSFORM");

        let uniformMap = {
            // render 
            "u_AlphaTestValue": ShaderDataType.Float,
            // surface
            // metallic roughness
            "u_BaseColorFactor": ShaderDataType.Vector4,
            "u_BaseColorTexture": ShaderDataType.Texture2D,
            "u_BaseColorMapTransform": ShaderDataType.Matrix3x3,
            "u_Specular": ShaderDataType.Float,
            "u_MetallicFactor": ShaderDataType.Float,
            "u_RoughnessFactor": ShaderDataType.Float,
            "u_MetallicRoughnessTexture": ShaderDataType.Texture2D,
            "u_MetallicRoughnessMapTransform": ShaderDataType.Matrix3x3,

            "u_NormalTexture": ShaderDataType.Texture2D,
            "u_NormalMapTransform": ShaderDataType.Matrix3x3,
            "u_NormalScale": ShaderDataType.Float,

            "u_OcclusionTexture": ShaderDataType.Texture2D,
            "u_OcclusionMapTransform": ShaderDataType.Matrix3x3,
            "u_OcclusionStrength": ShaderDataType.Float,

            "u_EmissionFactor": ShaderDataType.Vector3,
            "u_EmissionTexture": ShaderDataType.Texture2D,
            "u_EmissionMapTransform": ShaderDataType.Matrix3x3,
            "u_EmissionStrength": ShaderDataType.Float,

            // clear coat
            "u_ClearCoatFactor": ShaderDataType.Float,
            "u_ClearCoatTexture": ShaderDataType.Texture2D,
            "u_ClearCoatMapTransform": ShaderDataType.Matrix3x3,
            "u_ClearCoatRoughness": ShaderDataType.Float,
            "u_ClearCoatRoughnessTexture": ShaderDataType.Texture2D,
            "u_ClearCoatRoughnessMapTransform": ShaderDataType.Matrix3x3,
            "u_ClearCoatNormalTexture": ShaderDataType.Texture2D,
            "u_ClearCoatNormalMapTransform": ShaderDataType.Matrix3x3,
            "u_ClearCoatNormalScale": ShaderDataType.Float,

            // anisotropy
            "u_AnisotropyStrength": ShaderDataType.Float,
            "u_AnisotropyRotation": ShaderDataType.Float,
            "u_AnisotropyTexture": ShaderDataType.Texture2D,
            "u_AnisotropyMapTransform": ShaderDataType.Matrix3x3,

            // ior
            "u_Ior": ShaderDataType.Float,

            // iridescence
            "u_IridescenceFactor": ShaderDataType.Float,
            "u_IridescenceTexture": ShaderDataType.Texture2D,
            "u_IridescenceMapTransform": ShaderDataType.Matrix3x3,
            "u_IridescenceIor": ShaderDataType.Float,
            "u_IridescenceThicknessMinimum": ShaderDataType.Float,
            "u_IridescenceThicknessMaximum": ShaderDataType.Float,
            "u_IridescenceThicknessTexture": ShaderDataType.Texture2D,
            "u_IridescenceThicknessMapTransform": ShaderDataType.Matrix3x3,

            // sheen
            "u_SheenColorFactor": ShaderDataType.Vector3,
            "u_SheenColorTexture": ShaderDataType.Texture2D,
            "u_SheenColorMapTransform": ShaderDataType.Matrix3x3,
            "u_SheenRoughness": ShaderDataType.Float,
            "u_SheenRoughnessTexture": ShaderDataType.Texture2D,
            "u_SheenRoughnessMapTransform": ShaderDataType.Matrix3x3,

            // transmission
            "u_TransmissionFactor": ShaderDataType.Float,
            "u_TransmissionTexture": ShaderDataType.Texture2D,
            "u_TransmissionMapTransform": ShaderDataType.Matrix3x3,

            // volume
            "u_VolumeThicknessFactor": ShaderDataType.Float,
            "u_VolumeThicknessTexture": ShaderDataType.Texture2D,
            "u_VoluemThicknessMapTransform": ShaderDataType.Matrix3x3,
            "u_VolumeAttenuationDistance": ShaderDataType.Float,
            "u_VolumeAttenuationColor": ShaderDataType.Vector3,

            // specular
            "u_SpecularFactor": ShaderDataType.Float,
            "u_SpecularFactorTexture": ShaderDataType.Texture2D,
            "u_SpecularFactorMapTransfrom": ShaderDataType.Matrix3x3,

            "u_SpecularColorFactor": ShaderDataType.Vector3,
            "u_SpecularColorTexture": ShaderDataType.Texture2D,
            "u_SpecularColorMapTransform": ShaderDataType.Matrix3x3,

        }

        let defaultValue = {
            // render 
            "u_AlphaTestValue": 0.5,
            // surface
            "u_BaseColorFactor": Vector4.ONE,
            "u_BaseColorTexture": Texture2D.whiteTexture,
            "u_Specular": 0.5,
            "u_MetallicFactor": 1.0,
            "u_RoughnessFactor": 1.0,
            "u_NormalScale": 1.0,
            "u_OcclusionStrength": 1.0,
            "u_EmissionFactor": Vector3.ZERO,
            "u_EmissionStrength": 1.0,

            // specular
            "u_SpecularFactor": 1.0,
            "u_SpecularColorFactor": Vector3.ONE,

            "u_Ior": 1.5,

            // clear coat
            "u_ClearcoatFactor": 0.0,
            "u_ClearCoatRoughness": 0.0,
            "u_ClearCoatNormalScale": 1.0,

            // anisotropy
            "u_AnisotropyStrength": 0.0,
            "u_AnisotropyRotation": 0.0
        }

        let shader = Shader3D.add("glTFPBR", true, true);
        let subShader = new SubShader(SubShader.DefaultAttributeMap, uniformMap, defaultValue);
        shader.addSubShader(subShader);

        let shadingPass = subShader.addShaderPass(glTFPBRVS, glTFPBRFS);
        let depthPass = subShader.addShaderPass(DepthVS, DephtFS, "ShadowCaster");
        let dephtNormalPass = subShader.addShaderPass(DepthNormalVS, DepthNormalFS, "DepthNormal");

    }

}