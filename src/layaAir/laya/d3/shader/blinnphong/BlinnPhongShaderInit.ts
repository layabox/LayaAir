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

export class BlinnPhongShaderInit {

    static init() {

        Shader3D.addInclude("BlinnPhongCommon.glsl", BlinnPhongCommonGLSL);
        Shader3D.addInclude("BlinnPhongVertex.glsl", BlinnPhongVertexGLSL);
        Shader3D.addInclude("BlinnPhongFrag.glsl", BlinnPhongFragGLSL);

        let uniformMap = {
            "u_DiffuseTexture": ShaderDataType.Texture2D,
            "u_NormalTexture": ShaderDataType.Texture2D,
            "u_SpecularTexture": ShaderDataType.Texture2D,
            "u_DiffuseColor": ShaderDataType.Vector4,
            "u_MaterialSpecular": ShaderDataType.Vector4,
            "u_Shininess": ShaderDataType.Float,
            "u_TilingOffset": ShaderDataType.Vector4,
            "u_AlbedoIntensity": ShaderDataType.Float,
            "u_AlphaTestValue": ShaderDataType.Float
        };

        let shader = Shader3D.add("BLINNPHONG");
        let subShader = new SubShader(SubShader.DefaultAttributeMap, uniformMap);
        shader.addSubShader(subShader);
        let shadingPass = subShader.addShaderPass(BlinnPhongVS, BlinnPhongFS);
        let shadowPass = subShader.addShaderPass(DepthVS, DepthFS, "ShadowCaster");


    }

}