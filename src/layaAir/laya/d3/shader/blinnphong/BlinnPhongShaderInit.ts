import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../SubShader";

import BlinnPhongCommonGLSL from "./BlinnPhongCommon.glsl";
import BlinnPhongVertexGLSL from "./BlinnPhongVertex.glsl";
import BlinnPhongFragGLSL from "./BlinnPhongFrag.glsl";

import BlinnPhongVS from "./BlinnPhong.vs";
import BlinnPhongFS from "./BlinnPhong.fs";

import DepthVS from "../depth/Depth.vs";
import DepthFS from "../depth/Depth.fs";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import { Color } from "../../math/Color";
import { Vector4 } from "../../math/Vector4";

export class BlinnPhongShaderInit {

    static init() {

        Shader3D.addInclude("BlinnPhongCommon.glsl", BlinnPhongCommonGLSL);
        Shader3D.addInclude("BlinnPhongVertex.glsl", BlinnPhongVertexGLSL);
        Shader3D.addInclude("BlinnPhongFrag.glsl", BlinnPhongFragGLSL);

        let uniformMap = {
            "u_DiffuseTexture": ShaderDataType.Texture2D,
            "u_NormalTexture": ShaderDataType.Texture2D,
            "u_SpecularTexture": ShaderDataType.Texture2D,
            "u_DiffuseColor": ShaderDataType.Color,
            "u_MaterialSpecular": ShaderDataType.Color,
            "u_Shininess": ShaderDataType.Float,
            "u_TilingOffset": ShaderDataType.Vector4,
            "u_AlbedoIntensity": ShaderDataType.Float,
            "u_AlphaTestValue": ShaderDataType.Float
        };

        let defaultValue = {
            "u_AlbedoIntensity": 1.0,
            "u_DiffuseColor": Color.WHITE,
            "u_MaterialSpecular": Color.WHITE,
            "u_Shininess": 0.078125,
            "u_AlphaTestValue": 0.5,
            "u_TilingOffset": new Vector4(1, 1, 0, 0),
        }

        let shader = Shader3D.add("BLINNPHONG");
        let subShader = new SubShader(SubShader.DefaultAttributeMap, uniformMap, defaultValue);
        shader.addSubShader(subShader);
        let shadingPass = subShader.addShaderPass(BlinnPhongVS, BlinnPhongFS);
        let shadowPass = subShader.addShaderPass(DepthVS, DepthFS, "ShadowCaster");


    }

}