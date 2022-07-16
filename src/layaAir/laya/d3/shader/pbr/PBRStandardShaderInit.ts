import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../SubShader";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";

import PBRStandardVS from "./pbrStandard.vs";
import PBRStandardFS from "./pbrStandard.fs";

import DepthVS from "../depth/Depth.vs";
import DepthFS from "../depth/Depth.fs";
import { Color } from "../../math/Color";
import { Vector4 } from "../../math/Vector4";


export class PBRStandardShaderInit {

    static init() {

        let uniformMap = {
            "u_AlbedoColor": ShaderDataType.Color,
            "u_TilingOffset": ShaderDataType.Vector4,
            "u_NormalScale": ShaderDataType.Float,
            "u_Metallic": ShaderDataType.Float,
            "u_Smoothness": ShaderDataType.Float,
            "u_SmoothnessScale": ShaderDataType.Float,
            "u_OcclusionStrength": ShaderDataType.Float,
            "u_AlphaTestValue": ShaderDataType.Float,
            "u_EmissionColor": ShaderDataType.Color,
            "u_AlbedoTexture": ShaderDataType.Texture2D,
            "u_NormalTexture": ShaderDataType.Texture2D,
            "u_OcclusionTexture": ShaderDataType.Texture2D,
            "u_EmissionTexture": ShaderDataType.Texture2D,
            "u_MetallicGlossTexture": ShaderDataType.Texture2D
        };

        let defaultValue = {
            "u_AlbedoColor": Color.WHITE,
            "u_TilingOffset": new Vector4(1, 1, 0, 0),
            "u_NormalScale": 1,
            "u_Metallic": 0,
            "u_Smoothness": 0.5,
            "u_SmoothnessScale": 1,
            "u_OcclusionStrength": 1,
            "u_EmissionColor": Color.WHITE
        };

        let shader = Shader3D.add("PBR");
        let subShader = new SubShader(SubShader.DefaultAttributeMap, uniformMap, defaultValue);
        shader.addSubShader(subShader);
        let shadingPass = subShader.addShaderPass(PBRStandardVS, PBRStandardFS);
        let shadowPass = subShader.addShaderPass(DepthVS, DepthFS, "ShadowCaster");

    }

}