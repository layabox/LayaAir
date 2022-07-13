import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D"
import { SubShader } from "../SubShader";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";

import BRDFGLSL from "./BRDF.glsl";
import PBRGIGLSL from "./pbrGI.glsl";

import PBRCommonGLSL from "./pbrCommon.glsl";
import PBRVertexGLSL from "./pbrVertex.glsl";
import PBRFragGLSL from "./pbrFrag.glsl";

import PBRVS from "./pbr.vs";
import PBRFS from "./pbr.fs";

import DepthVS from "../depth/Depth.vs";
import DepthFS from "../depth/Depth.fs";

export class PBRShaderInit {

    static init() {
        // pbr lib
        Shader3D.addInclude("BRDF.glsl", BRDFGLSL);
        Shader3D.addInclude("PBRGI.glsl", PBRGIGLSL);

        Shader3D.addInclude("PBRCommon.glsl", PBRCommonGLSL);
        Shader3D.addInclude("PBRVertex.glsl", PBRVertexGLSL);
        Shader3D.addInclude("PBRFrag.glsl", PBRFragGLSL);

        let uniformMap = {
            "u_DiffuseColor": ShaderDataType.Color,
            "u_DiffuseMap": ShaderDataType.Texture2D,
            "u_NormalMap": ShaderDataType.Texture2D,
            "u_Metallic": ShaderDataType.Float,
            "u_Roughness": ShaderDataType.Float,
            "u_Reflectance": ShaderDataType.Float,
        }

        let shader = Shader3D.add("pbr");
        let subShader = new SubShader(SubShader.DefaultAttributeMap, uniformMap);
        shader.addSubShader(subShader);
        let shadingPass = subShader.addShaderPass(PBRVS, PBRFS);
        let shadowPass = subShader.addShaderPass(DepthVS, DepthFS, "ShadowCaster");
    }

}