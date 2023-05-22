import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderData, ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";

import PBRStandardVS from "./pbrStandard.vs";
import PBRStandardFS from "./pbrStandard.fs";

import DepthVS from "../depth/Depth.vs";
import DepthFS from "../depth/Depth.fs";
import DepthNormalVS from "../depth/DepthNormal.vs";
import DepthNormalFS from "../depth/DepthNormal.fs";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";


export class PBRStandardShaderInit {

    static init() {

        let uniformMap = {
            "u_AlbedoColor": ShaderDataType.Color,
            "u_TilingOffset": ShaderDataType.Vector4,
            "u_NormalScale": ShaderDataType.Float,
            "u_Metallic": ShaderDataType.Float,
            "u_Smoothness": ShaderDataType.Float,
            "u_OcclusionStrength": ShaderDataType.Float,
            "u_AlphaTestValue": ShaderDataType.Float,
            "u_EmissionColor": ShaderDataType.Color,
            "u_EmissionIntensity": ShaderDataType.Float,
            "u_AlbedoTexture": ShaderDataType.Texture2D,
            "u_NormalTexture": ShaderDataType.Texture2D,
            "u_OcclusionTexture": ShaderDataType.Texture2D,
            "u_EmissionTexture": ShaderDataType.Texture2D,
            "u_MetallicGlossTexture": ShaderDataType.Texture2D,
            // anisotrioy
            "u_Anisotropy": ShaderDataType.Float,
            "u_TangentTexture": ShaderDataType.Texture2D,
            // clear coat
            "u_ClearCoat": ShaderDataType.Float,
            "u_ClearCoatTexture": ShaderDataType.Texture2D,
            "u_ClearCoatRoughness": ShaderDataType.Float,
            "u_ClearCoatRoughnessTexture": ShaderDataType.Texture2D,
            "u_ClearCoatNormalTexture": ShaderDataType.Texture2D,
            //detail 
            "u_DetailAlbedoTexture": ShaderDataType.Texture2D,
            "u_DetailNormalTexture": ShaderDataType.Texture2D,
            "u_DetailNormalScale": ShaderDataType.Float,
            "u_DetailTillingOffset": ShaderDataType.Vector4
        };

        let defaultValue = {
            "u_AlbedoColor": Color.WHITE,
            "u_TilingOffset": new Vector4(1, 1, 0, 0),
            "u_DetailTillingOffset": new Vector4(1, 1, 0, 0),
            "u_NormalScale": 1,
            "u_DetailNormalScale": 1,
            "u_Metallic": 0,
            "u_Smoothness": 0.5,
            "u_OcclusionStrength": 1,
            "u_EmissionColor": Color.WHITE,
            "u_EmissionIntensity": 1,
            "u_Anisotropy": 0,
            "u_AlphaTestValue": 0.5
        };

        let shader = Shader3D.add("PBR", true, true);
        let subShader = new SubShader(SubShader.DefaultAttributeMap, uniformMap, defaultValue);
        shader.addSubShader(subShader);
        let shadingPass = subShader.addShaderPass(PBRStandardVS, PBRStandardFS);
        let shadowPass = subShader.addShaderPass(DepthVS, DepthFS, "ShadowCaster");
        let depthNormal = subShader.addShaderPass(DepthNormalVS, DepthNormalFS, "DepthNormal");
    }

}