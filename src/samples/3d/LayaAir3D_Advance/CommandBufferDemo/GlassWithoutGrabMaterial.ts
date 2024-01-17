import { Material } from "laya/resource/Material";
import GlassShaderVS from "./GlassShader.vs";
import GlassShaderFS from "./GlassShader.fs";
import { BaseTexture } from "laya/resource/BaseTexture";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Vector4 } from "laya/maths/Vector4";
import { RenderState } from "laya/RenderEngine/RenderShader/RenderState";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "laya/RenderEngine/RenderShader/VertexMesh";
import { ShaderDataType } from "laya/RenderEngine/RenderInterface/ShaderData";

export class GlassWithoutGrabMaterial extends Material {
    /** tintTexure */
    static TINTTEXTURE: number;
    /** normalTexture" */
    static NORMALTEXTURE: number;
    /** TilingOffset */
    static TILINGOFFSET: number;
    /** tintAmount */
    static ALBEDOCOLOR: number;

    static init() {
        var attributeMap: any = {
            'a_Position': [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4],
            'a_Normal': [VertexMesh.MESH_NORMAL0, ShaderDataType.Vector3],
            'a_Texcoord0': [VertexMesh.MESH_TEXTURECOORDINATE0, ShaderDataType.Vector2],
            'a_Tangent0': [VertexMesh.MESH_TANGENT0, ShaderDataType.Vector4],
        };

        var uniformMap: any = {
            "u_tintTexure": ShaderDataType.Texture2D,
            "u_screenTexture": ShaderDataType.Texture2D,
            "u_normalTexture": ShaderDataType.Texture2D,
            "u_TilingOffset": ShaderDataType.Vector4,
            "u_tintAmount": ShaderDataType.Color,
        }
        var shader: Shader3D = Shader3D.add("GlassShader", false);
        var subShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        subShader.addShaderPass(GlassShaderVS, GlassShaderFS);

        GlassWithoutGrabMaterial.TINTTEXTURE = Shader3D.propertyNameToID("u_tintTexure");
        GlassWithoutGrabMaterial.NORMALTEXTURE = Shader3D.propertyNameToID("u_normalTexture");
        GlassWithoutGrabMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
        GlassWithoutGrabMaterial.ALBEDOCOLOR = Shader3D.propertyNameToID("u_tintAmount");
    }

    /**
     * @param texture 
     */
    constructor(texture: BaseTexture) {
        super();
        this.setShaderName("GlassShader");
        this.renderModeSet();
        this._shaderValues.setVector(GlassWithoutGrabMaterial.TILINGOFFSET, new Vector4(1, 1, 0, 0));
        this._shaderValues.setTexture(GlassWithoutGrabMaterial.TINTTEXTURE, texture);
    }

    /**
     * RenderMode
     */
    renderModeSet() {
        this.alphaTest = false;//深度测试关闭
        this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;//渲染顺序放在后面
        this.depthWrite = true;
        this.cull = RenderState.CULL_BACK;
        this.blend = RenderState.BLEND_DISABLE;
        this.depthTest = RenderState.DEPTHTEST_LESS;
    }



}