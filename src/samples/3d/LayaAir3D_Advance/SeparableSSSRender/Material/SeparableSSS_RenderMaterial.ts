import { Material } from "laya/d3/core/material/Material";
import SSSSRenderVS from "./../shader/SeparableSSS_Render.vs";
import SSSSRenderFS from "./../shader/SeparableSSS_Render.fs";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { ShaderDataType } from "laya/RenderEngine/RenderShader/ShaderData";
import { Vector4 } from "laya/maths/Vector4";
import { RenderState } from "laya/RenderEngine/RenderShader/RenderState";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "laya/RenderEngine/RenderShader/VertexMesh";

export class SeparableSSSRenderMaterial extends Material {

    static SSSSDIFUSETEX: number;
    static SSSSSPECULARTEX: number;
    static TILINGOFFSET: number;

    static init() {
        SeparableSSSRenderMaterial.SSSSDIFUSETEX = Shader3D.propertyNameToID("sssssDiffuseTexture");
        SeparableSSSRenderMaterial.SSSSSPECULARTEX = Shader3D.propertyNameToID("sssssSpecularTexture");
        SeparableSSSRenderMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
        var shader: Shader3D = Shader3D.add("SeparableRender", false);
        var attributeMap: any = {
            'a_Position': [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4],
			'a_Normal': [VertexMesh.MESH_NORMAL0, ShaderDataType.Vector3],
			'a_Texcoord0': [VertexMesh.MESH_TEXTURECOORDINATE0, ShaderDataType.Vector2],
			'a_Tangent0': [VertexMesh.MESH_TANGENT0, ShaderDataType.Vector4],
        };

        var uniformMap: any = {
            'sssssDiffuseTexture': ShaderDataType.Texture2D,
            'sssssSpecularTexture': ShaderDataType.Texture2D,
			'u_TilingOffset': ShaderDataType.Vector4,
			'u_MvpMatrix': ShaderDataType.Matrix4x4
        };
        var subShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        subShader.addShaderPass(SSSSRenderVS, SSSSRenderFS, "Forward");
    }

    constructor() {
        super();
        this.setShaderName("SeparableRender");
        this.renderModeSet();
        this._shaderValues.setVector(SeparableSSSRenderMaterial.TILINGOFFSET, new Vector4(1, 1, 0, 0));
    }

    //渲染模式
    renderModeSet() {
        this.alphaTest = false;//深度测试关闭
        this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;//渲染顺序放在后面
        this.depthWrite = true;
        this.cull = RenderState.CULL_BACK;
        this.blend = RenderState.BLEND_DISABLE;
        this.depthTest = RenderState.DEPTHTEST_LESS;
    }
}