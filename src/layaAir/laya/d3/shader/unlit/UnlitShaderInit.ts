import UnlitVS from "./Unlit.vs";
import UnlitFS from "./Unlit.fs";
import DepthVS from "../depth/Depth.vs";
import DepthFS from "../depth/Depth.fs";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../SubShader";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";


export class UnlitShaderInit {

    static init() {

        let uniformMap = {
            "UnlitBlock": {
                "u_AlbedoColor": ShaderDataType.Color,
                "u_TilingOffset": ShaderDataType.Vector4,
            },
            "u_AlbedoTexture": ShaderDataType.Texture2D,
            "u_AlphaTestValue": ShaderDataType.Float
        };
        let shader = Shader3D.add("Unlit", true, false);
        let subShader = new SubShader(SubShader.DefaultAttributeMap, uniformMap);
        shader.addSubShader(subShader);
        let forwardPass = subShader.addShaderPass(UnlitVS, UnlitFS);
        let shadowPass = subShader.addShaderPass(DepthVS, DepthFS, "ShadowCaster");
    }

}