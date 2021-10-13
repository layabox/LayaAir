import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { SubShader } from "laya/d3/shader/SubShader";
import { Material } from "laya/d3/core/material/Material";
import GlassShaderVS from "./GlassShader.vs";
import GlassShaderFS from "./GlassShader.fs";
import { RenderState } from "laya/d3/core/material/RenderState";
import { Vector4 } from "laya/d3/math/Vector4";
import { BaseTexture } from "laya/resource/BaseTexture";

export class GlassWithoutGrabMaterial extends Material{
    static TINTTEXTURE:number = Shader3D.propertyNameToID("u_tintTexure");
    static NORMALTEXTURE:number = Shader3D.propertyNameToID("u_normalTexture");
    static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");
    static ALBEDOCOLOR: number = Shader3D.propertyNameToID("u_tintAmount");
    static init(){
        var attributeMap: any = {
			'a_Position': VertexMesh.MESH_POSITION0,
			'a_Normal': VertexMesh.MESH_NORMAL0,
			'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0,
			'a_Tangent0': VertexMesh.MESH_TANGENT0,
        };
        var uniformMap = {
            'u_tintTexure': Shader3D.PERIOD_MATERIAL,
            'u_normalTexture': Shader3D.PERIOD_MATERIAL,
			'u_tintAmount': Shader3D.PERIOD_MATERIAL,
			'u_TilingOffset': Shader3D.PERIOD_MATERIAL,
			'u_MvpMatrix': Shader3D.PERIOD_SPRITE
		};
		var stateMap = {
			's_Cull': Shader3D.RENDER_STATE_CULL,
			's_Blend': Shader3D.RENDER_STATE_BLEND,
			's_BlendSrc': Shader3D.RENDER_STATE_BLEND_SRC,
			's_BlendDst': Shader3D.RENDER_STATE_BLEND_DST,
			's_DepthTest': Shader3D.RENDER_STATE_DEPTH_TEST,
			's_DepthWrite': Shader3D.RENDER_STATE_DEPTH_WRITE
		}
        var shader: Shader3D = Shader3D.add("GlassShader", null, null,false);
		var subShader: SubShader = new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		subShader.addShaderPass(GlassShaderVS, GlassShaderFS, stateMap, "Forward");
    }

    constructor(texture:BaseTexture){
        super();
        this.setShaderName("GlassShader");
        this.renderModeSet();
        this._shaderValues.setVector(GlassWithoutGrabMaterial.TILINGOFFSET,new Vector4(1,1,0,0));
        this._shaderValues.setTexture(GlassWithoutGrabMaterial.TINTTEXTURE,texture);
    }

    //渲染模式
    renderModeSet(){
        this.alphaTest = false;//深度测试关闭
        this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;//渲染顺序放在后面
        this.depthWrite = true;
        this.cull = RenderState.CULL_BACK;
        this.blend = RenderState.BLEND_DISABLE;
        this.depthTest = RenderState.DEPTHTEST_LESS;
    }

    

}