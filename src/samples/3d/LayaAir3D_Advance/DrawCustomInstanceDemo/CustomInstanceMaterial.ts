import { Material } from "laya/resource/Material";
import CustomInstanceVS from "./customInstance.vs";
import CustomInstanceFS from "./customInstance.fs";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { RenderState } from "laya/RenderEngine/RenderShader/RenderState";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "laya/RenderEngine/RenderShader/VertexMesh";
import { ShaderDataType } from "laya/RenderEngine/RenderInterface/ShaderData";

export class CustomInstanceMaterial extends Material {

    static init() {
        var attributeMap: any = {
            'a_Position': [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4],
            'a_Normal': [VertexMesh.MESH_NORMAL0, ShaderDataType.Vector3],
            'a_Texcoord0': [VertexMesh.MESH_TEXTURECOORDINATE0, ShaderDataType.Vector2],
            'a_Tangent0': [VertexMesh.MESH_TANGENT0, ShaderDataType.Vector4],
            'a_WorldMat': [VertexMesh.MESH_WORLDMATRIX_ROW0, ShaderDataType.Matrix4x4],
            'a_InstanceColor': [VertexMesh.MESH_CUSTOME0, ShaderDataType.Color],
        };

        var uniformMap: any = {

        }
        var shader: Shader3D = Shader3D.add("CustomInstanceMat", false);
        var subShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        subShader.addShaderPass(CustomInstanceVS, CustomInstanceFS, "Forward");
    }

    constructor() {
        super();
        this.setShaderName("CustomInstanceMat");
        this.renderModeSet();
    }

    //渲染模式
    renderModeSet() {
        this.alphaTest = true;//深度测试关闭
        this.renderQueue = Material.RENDERQUEUE_OPAQUE;//渲染顺序放在后面
        this.depthWrite = true;
        this.cull = RenderState.CULL_BACK;
        this.blend = RenderState.BLEND_DISABLE;
        this.depthTest = RenderState.DEPTHTEST_LESS;
    }

}