import UnlitVS from "./Unlit.vs";
import UnlitFS from "./Unlit.fs";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../SubShader";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import { Vector4 } from "../../math/Vector4";

export class UnlitShaderInit {

    static init() {

        let uniformMap = {
            "UnlitBlock": {
                // "u_DiffuseColor": ShaderDataType.Color,
                "u_TillOffset": ShaderDataType.Vector4
            },
            "u_DiffuseColor": ShaderDataType.Vector4,
        };

        type UniformItem = { [typename: number]: any };

        let uniformTest: UniformItem = { [ShaderDataType.Vector4]: new Vector4(0.5, 0.5, 0.5, 1.0) };

        let test: { [name: string]: { [typename: number]: any } } = {
            "u_DiffuseColor": {
                [ShaderDataType.Vector4]: new Vector4(0.5, 0.5, 0.5, 1.0)
            }
        };

        console.log("test", test);


        let shader = Shader3D.add("Unlit");
        let subShader = new SubShader(SubShader.DefaultAttributeMap, uniformMap);
        shader.addSubShader(subShader);
        let pass = subShader.addShaderPass(UnlitVS, UnlitFS);
    }

}