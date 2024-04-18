import UnlitVS from "./Unlit.vs";
import UnlitFS from "./Unlit.fs";
import DepthVS from "../depth/Depth.vs";
import DepthFS from "../depth/Depth.fs";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";


export class UnlitShaderInit {

    static init() {

        let uniformMap = {
            "UnlitBlock": {
                "u_AlbedoColor": ShaderDataType.Color,
                "u_TilingOffset": ShaderDataType.Vector4,
            },
            "u_AlbedoTexture": ShaderDataType.Texture2D,
            "u_AlphaTestValue": ShaderDataType.Float,
        };

        let defaultValue = {
            "u_AlbedoColor": Color.WHITE,
            "u_TilingOffset": new Vector4(1, 1, 0, 0),
            "u_AlphaTestValue": 0.5
        }

        let shader = Shader3D.add("Unlit", true, false);
        let subShader = new SubShader(SubShader.DefaultAttributeMap, uniformMap, defaultValue);
        shader.addSubShader(subShader);
        let forwardPass = subShader.addShaderPass(UnlitVS, UnlitFS);
        let shadowPass = subShader.addShaderPass(DepthVS, DepthFS, "ShadowCaster");
    }
}