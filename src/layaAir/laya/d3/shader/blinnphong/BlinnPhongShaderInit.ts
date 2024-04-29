import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import BlinnPhongCommonGLSL from "./BlinnPhongCommon.glsl";
import BlinnPhongVertexGLSL from "./BlinnPhongVertex.glsl";
import BlinnPhongFragGLSL from "./BlinnPhongFrag.glsl";
import BlinnPhongVS from "./BlinnPhong.vs";
import BlinnPhongFS from "./BlinnPhong.fs";
import DepthVS from "../depth/Depth.vs";
import DepthFS from "../depth/Depth.fs";
import DepthNormalVS from "./BlinnPhongDepthNormal.vs";
import DepthNormalFS from "./BlinnPhongDepthNormal.fs";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";

export class BlinnPhongShaderInit {

    static init() {

        Shader3D.addInclude("BlinnPhongCommon.glsl", BlinnPhongCommonGLSL);
        Shader3D.addInclude("BlinnPhongVertex.glsl", BlinnPhongVertexGLSL);
        Shader3D.addInclude("BlinnPhongFrag.glsl", BlinnPhongFragGLSL);

        let uniformMap = {
            "u_AlphaTestValue": ShaderDataType.Float,
            "u_TilingOffset": ShaderDataType.Vector4,

            "u_DiffuseColor": ShaderDataType.Color,
            "u_DiffuseTexture": ShaderDataType.Texture2D,
            "u_AlbedoIntensity": ShaderDataType.Float,

            "u_MaterialSpecular": ShaderDataType.Color,
            "u_SpecularTexture": ShaderDataType.Texture2D,

            "u_Shininess": ShaderDataType.Float,

            "u_NormalTexture": ShaderDataType.Texture2D,
        };

        let defaultValue = {
            "u_AlbedoIntensity": 1.0,
            "u_DiffuseColor": Color.WHITE,
            "u_MaterialSpecular": Color.WHITE,
            "u_Shininess": 0.078125,
            "u_AlphaTestValue": 0.5,
            "u_TilingOffset": new Vector4(1, 1, 0, 0),
        };

        let shader = Shader3D.add("BLINNPHONG", true, true);
        shader._ShaderType = ShaderFeatureType.D3;
        let subShader = new SubShader(SubShader.DefaultAttributeMap, uniformMap, defaultValue);
        shader.addSubShader(subShader);
        let shadingPass = subShader.addShaderPass(BlinnPhongVS, BlinnPhongFS);
        let shadowPass = subShader.addShaderPass(DepthVS, DepthFS, "ShadowCaster");
        let depthNormal = subShader.addShaderPass(DepthNormalVS, DepthNormalFS, "DepthNormal");
    }

}