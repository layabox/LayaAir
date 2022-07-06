import UnlitVS from "./Unlit.vs";
import UnlitFS from "./Unlit.fs";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../SubShader";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";

export class UnlitShaderInit {

    static init() {

        let uniformMap = {
            "UnlitBlock": {
                "u_DiffuseColor": ShaderDataType.Vector4,
                "u_TillOffset": ShaderDataType.Vector4
            }
        };
        let shader = Shader3D.add("Unlit");
        let subShader = new SubShader(SubShader.DefaultAttributeMap, uniformMap);
        shader.addSubShader(subShader);
        let pass = subShader.addShaderPass(UnlitVS, UnlitFS);
    }

}