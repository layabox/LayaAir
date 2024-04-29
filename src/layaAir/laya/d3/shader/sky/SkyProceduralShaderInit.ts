import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import SkyProceduralVS from "./SkyProceduralShader.vs";
import SkyProceduralFS from "./SkyProceduralShader.fs";
import { Color } from "../../../maths/Color";
import { RenderState } from "../../../RenderEngine/RenderShader/RenderState";
import { AttributeMapType, SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";
import { CullMode } from "../../../RenderEngine/RenderEnum/CullMode";

export class SkyProceduralShaderInit {
    static init() {
        let attributeMap: AttributeMapType = {
            "a_Position": [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
        };

        let uniformMap = {
            "u_SunSize": ShaderDataType.Float,
            "u_SunSizeConvergence": ShaderDataType.Float,
            "u_AtmosphereThickness": ShaderDataType.Float,
            "u_SkyTint": ShaderDataType.Color,
            "u_GroundTint": ShaderDataType.Color,
            "u_Exposure": ShaderDataType.Float,
        };

        let defaultValue = {
            "u_SunSize": 0.04,
            "u_SunSizeConvergence": 5,
            "u_AtmosphereThickness": 1.0,
            "u_SkyTint": new Color(0.5, 0.5, 0.5, 1.0),
            "u_GroundTint": new Color(0.369, 0.349, 0.341, 1.0),
            "u_Exposure": 1.3,
        };
        let shader = Shader3D.add("SkyProcedural");
        shader.shaderType = ShaderFeatureType.Sky;
        let subShader = new SubShader(attributeMap, uniformMap, defaultValue);
        shader.addSubShader(subShader);
        let pass = subShader.addShaderPass(SkyProceduralVS, SkyProceduralFS);
        pass.renderState.depthTest = RenderState.DEPTHTEST_LEQUAL;
        pass.renderState.cull = CullMode.Back;
        pass.renderState.depthWrite = false;
        pass.renderState.stencilWrite = false;
        pass.statefirst = true;
    }
}