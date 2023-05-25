import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ShaderDataType } from "../../RenderEngine/RenderShader/ShaderData";
import { ShaderDefine } from "../../RenderEngine/RenderShader/ShaderDefine";
import { SubShader } from "../../RenderEngine/RenderShader/SubShader";
import { ShadingVS } from "../../d3/shader/ShaderInit3D";
import { Vector3 } from "../../maths/Vector3";
import { Vector4 } from "../../maths/Vector4";
import { Texture2D } from "../../resource/Texture2D";

import glTFPBRFS from "./glTFPBR.fs";

/**
 * @internal
 */
export class glTFShader {

    static ShaderName: string = "glTFPBR";

    static Define_MetallicRoughnessMap: ShaderDefine;

    static Define_NormalMap: ShaderDefine;

    static Define_OcclusionMap: ShaderDefine;

    static Define_EmissionMap: ShaderDefine;

    // clear coat
    static Define_ClearCoatMap: ShaderDefine;
    static Define_ClearCoatRoughnessMap: ShaderDefine;
    static Define_ClearCoatNormalMap: ShaderDefine;

    // anisotropy
    static Define_AnisotropyMap: ShaderDefine;

    // todo
    static init() {

        this.Define_MetallicRoughnessMap = Shader3D.getDefineByName("METALLICROUGHNESSMAP");
        this.Define_NormalMap = Shader3D.getDefineByName("NORMALMAP");
        this.Define_OcclusionMap = Shader3D.getDefineByName("OCCLUSIONMAP");
        this.Define_EmissionMap = Shader3D.getDefineByName("EMISSIONMAP");

        this.Define_ClearCoatMap = Shader3D.getDefineByName("CLEARCOATMAP");
        this.Define_ClearCoatRoughnessMap = Shader3D.getDefineByName("CLEARCOAT_ROUGHNESSMAP");
        this.Define_ClearCoatNormalMap = Shader3D.getDefineByName("CLEARCOAT_NORMAL");

        this.Define_AnisotropyMap = Shader3D.getDefineByName("ANISOTROPYMAP");

        let uniformMap = {
            // render 
            "u_AlphaTestValue": ShaderDataType.Float,
            // surface
            // metallic roughness
            "u_BaseColorFactor": ShaderDataType.Vector4,
            "u_BaseColorTexture": ShaderDataType.Texture2D,
            "u_MetallicFactor": ShaderDataType.Float,
            "u_RoughnessFactor": ShaderDataType.Float,
            "u_MetallicRoughnessTexture": ShaderDataType.Texture2D,

            "u_NormalTexture": ShaderDataType.Texture2D,
            "u_NormalScale": ShaderDataType.Float,

            "u_OcclusionTexture": ShaderDataType.Texture2D,
            "u_OcclusionStrength": ShaderDataType.Float,

            "u_EmissionFactor": ShaderDataType.Vector3,
            "u_EmissionTexture": ShaderDataType.Texture2D,
            "u_EmissionStrength": ShaderDataType.Float,

            // clear coat
            "u_ClearCoatFactor": ShaderDataType.Float,
            "u_ClearCoatTexture": ShaderDataType.Texture2D,
            "u_ClearCoatRoughness": ShaderDataType.Float,
            "u_ClearCoatRoughnessTexture": ShaderDataType.Texture2D,
            "u_ClearCoatNormalTexture": ShaderDataType.Texture2D,
            "u_ClearCoatNormalScale": ShaderDataType.Float,

            // anisotropy
            "u_AnisotropyStrength": ShaderDataType.Float,
            "u_AnisotropyRotation": ShaderDataType.Float,
            "u_AnisotropyTexture": ShaderDataType.Texture2D,
        }

        let defaultValue = {
            // render 
            "u_AlphaTestValue": 0.5,
            // surface
            "u_BaseColorFactor": Vector4.ONE,
            "u_BaseColorTexture": Texture2D.whiteTexture,
            "u_MetallicFactor": 1.0,
            "u_RoughnessFactor": 1.0,
            "u_NormalScale": 1.0,
            "u_OcclusionStrength": 1.0,
            "u_EmissionFactor": Vector3.ZERO,
            "u_EmissionStrength": 1.0,

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

        let shadingPass = subShader.addShaderPass(ShadingVS, glTFPBRFS);
        // todo depth pass

    }

}