import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import SkyPanoramicVS from "./SkyPanoramic.vs";
import SkyPanoramicFS from "./SkyPanoramic.fs";
import { Texture2D } from "../../../resource/Texture2D";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { RenderState } from "../../../RenderEngine/RenderShader/RenderState";
import { AttributeMapType, SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";

export class SkyPanoramicShaderInit {
    static init() {
        let attributeMap: AttributeMapType = {
            "a_Position": [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
        };

        let uniformMap = {
            'u_TintColor': ShaderDataType.Color,
            'u_TextureHDRParams': ShaderDataType.Vector4,
            'u_Rotation': ShaderDataType.Float,
            'u_Texture': ShaderDataType.Texture2D
        };

        let defaultValue = {
            'u_TintColor': new Color(0.5,0.5,0.5,1.0),
            'u_TextureHDRParams': new Vector4(1.0, 0.0, 0.0, 1.0),
            'u_Rotation': 0,
            'u_Texture': Texture2D.grayTexture,
        };
        let shader = Shader3D.add("SkyPanoramic");
        let subShader = new SubShader(attributeMap, uniformMap, defaultValue);
        shader.addSubShader(subShader);
        let pass = subShader.addShaderPass(SkyPanoramicVS, SkyPanoramicFS);
        pass.renderState.depthTest = RenderState.DEPTHTEST_LEQUAL;
        pass.statefirst = true;
    }
}