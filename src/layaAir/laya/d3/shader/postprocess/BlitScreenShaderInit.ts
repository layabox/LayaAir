import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { VertexMesh } from "../../graphics/Vertex/VertexMesh";
import { SubShader } from "../SubShader";

import { RenderState } from "../../core/material/RenderState";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";

import BlitVS from "./BlitScreen.vs";
import BlitFS from "./BlitScreen.fs";
import FXAA from "./FastApproximateAntiAliasing.glsl";

export class BlitScreenShaderInit {

    static init() {
        Shader3D.addInclude("FastApproximateAntiAliasing.glsl", FXAA);
        
        let attributeMap: { [name: string]: [number, ShaderDataType] } = {
            "a_PositionTexcoord": [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
        };

        let uniformMap = {
            "u_OffsetScale": ShaderDataType.Vector4,
            "u_MainTex": ShaderDataType.Texture2D,
            "u_MainTex_TexelSize":ShaderDataType.Vector4,//x:width,y:height,z:1/width,w:1/height
        };

        let shader = Shader3D.add("BlitScreen");
        let subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        let blitPass = subShader.addShaderPass(BlitVS, BlitFS);
        let blitState = blitPass.renderState;
        blitState.depthTest = RenderState.DEPTHTEST_ALWAYS;
        blitState.depthWrite = false;
        blitState.cull = RenderState.CULL_NONE;
        blitState.blend = RenderState.BLEND_DISABLE;
    }

}