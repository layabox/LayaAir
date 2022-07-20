import { Color } from "../../math/Color";
import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D"
import { SubShader } from "../SubShader";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";

import PBRVS from "./pbr.vs";
import PBRFS from "./pbr.fs";

import DepthVS from "../depth/Depth.vs";
import DepthFS from "../depth/Depth.fs";


export class PBRShaderInit {

    static init() {
        let uniformMap = {
            "u_DiffuseColor": ShaderDataType.Color,
            "u_DiffuseMap": ShaderDataType.Texture2D,
            "u_NormalMap": ShaderDataType.Texture2D,
            "u_Metallic": ShaderDataType.Float,
            "u_Roughness": ShaderDataType.Float,
            "u_Reflectance": ShaderDataType.Float,
            "u_TilingOffset": ShaderDataType.Vector4,
            "u_AlphaTest": ShaderDataType.Float
        };

        let defaultValue = {
            "u_DiffuseColor": Color.WHITE,
            "u_Metallic": 0.0,
            "u_Roughness": 0.5,
            "u_Reflectance": 0.5,
            "u_TilingOffset": new Vector4(1, 1, 0, 0),
            "u_AlphaTest": 0.5
        };

        let shader = Shader3D.add("pbr", true);
        let subShader = new SubShader(SubShader.DefaultAttributeMap, uniformMap, defaultValue);
        shader.addSubShader(subShader);
        let shadingPass = subShader.addShaderPass(PBRVS, PBRFS);
        let shadowPass = subShader.addShaderPass(DepthVS, DepthFS, "ShadowCaster");
    }

}