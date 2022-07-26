import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { AttributeMapType, SubShader } from "../SubShader";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import { VertexMesh } from "../../graphics/Vertex/VertexMesh";

import SkyboxVS from "./SkyBox.vs";
import SkyboxFS from "./SkyBox.fs";
import { Color } from "../../math/Color";

export class SkyBoxShaderInit {

    static init() {

        let attributeMap: AttributeMapType = {
            "a_Position": [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
        };

        let uniformMap = {
            "u_TintColor": ShaderDataType.Color,
            "u_Exposure": ShaderDataType.Float,
            "u_Rotation": ShaderDataType.Float,
            "u_CubeTexture": ShaderDataType.TextureCube
        };

        let defaultValue = {
            "u_TintColor": new Color(0.5, 0.5, 0.5, 0.5),
            "u_Exposure": 1,
            "u_Rotation": 0
        };

        let shader = Shader3D.add("SkyBox");
        let subShader = new SubShader(attributeMap, uniformMap, defaultValue);
        shader.addSubShader(subShader);
        let pass = subShader.addShaderPass(SkyboxVS, SkyboxFS);

    }

}