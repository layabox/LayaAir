import { Material } from "laya/d3/core/material/Material";
import { RenderState } from "laya/d3/core/material/RenderState";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Vector4 } from "laya/d3/math/Vector4";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { ShaderDefine } from "laya/d3/shader/ShaderDefine";
import { SubShader } from "laya/d3/shader/SubShader";
import { BaseTexture } from "laya/resource/BaseTexture";
import BOLLBOARDVS from "../EditorShader/BillboardVS.vs";
import BOLLBOARDFS from "../EditorShader/BillboardFS.fs"

export class BillboardMaterial extends Material{
    /**渲染状态_不透明。*/
	static RENDERMODE_OPAQUE: number = 0;
	/**渲染状态_阿尔法测试。*/
	static RENDERMODE_CUTOUT: number = 1;
	/**渲染状态__透明混合。*/
	static RENDERMODE_TRANSPARENT: number = 2;
	/**渲染状态__加色法混合。*/
	static RENDERMODE_ADDTIVE: number = 3;

    static ALBEDOTEXTURE: number = Shader3D.propertyNameToID("u_AlbedoTexture");
	static ALBEDOCOLOR: number = Shader3D.propertyNameToID("u_AlbedoColor");
	static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");


    static SHADERDEFINE_ALBEDOTEXTURE: ShaderDefine;
	static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;
  
    /**
     * 初始化Mateiral
     */
	static init(): void {
		BillboardMaterial.SHADERDEFINE_ALBEDOTEXTURE = Shader3D.getDefineByName("ALBEDOTEXTURE");
		BillboardMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");
        //创建shader
        let attributeMap = {
			'a_Position': VertexMesh.MESH_POSITION0,
			'a_Color': VertexMesh.MESH_COLOR0,
			'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0
		};
		let uniformMap = {
			'u_AlbedoTexture': Shader3D.PERIOD_MATERIAL,
			'u_AlbedoColor': Shader3D.PERIOD_MATERIAL,
			'u_TilingOffset': Shader3D.PERIOD_MATERIAL,
			'u_AlphaTestValue': Shader3D.PERIOD_MATERIAL,
			'u_MvpMatrix': Shader3D.PERIOD_SPRITE,
            'u_WorldMat':Shader3D.PERIOD_SPRITE,

            'u_CameraPos': Shader3D.PERIOD_CAMERA,
			'u_CameraDirection': Shader3D.PERIOD_CAMERA,
			'u_CameraUp': Shader3D.PERIOD_CAMERA,
            'u_View': Shader3D.PERIOD_CAMERA,
			'u_ViewProjection': Shader3D.PERIOD_CAMERA,
            'u_Projection': Shader3D.PERIOD_CAMERA
		};
		let stateMap = {
			's_Cull': Shader3D.RENDER_STATE_CULL,
			's_Blend': Shader3D.RENDER_STATE_BLEND,
			's_BlendSrc': Shader3D.RENDER_STATE_BLEND_SRC,
			's_BlendDst': Shader3D.RENDER_STATE_BLEND_DST,
			's_DepthTest': Shader3D.RENDER_STATE_DEPTH_TEST,
			's_DepthWrite': Shader3D.RENDER_STATE_DEPTH_WRITE
		}
		let shader = Shader3D.add("BILLBOARDMAT", null, null,false,false);
		let subShader = new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		subShader.addShaderPass(BOLLBOARDVS, BOLLBOARDFS, stateMap);
	}


    get albedoColor():Vector4{
        return this._shaderValues.getVector(BillboardMaterial.ALBEDOCOLOR);
    }

    set albedoColor(value:Vector4){
        this._shaderValues.setVector(BillboardMaterial.ALBEDOCOLOR,value);
    }

    get albedoTexture():BaseTexture{
        return this._shaderValues.getTexture(BillboardMaterial.ALBEDOTEXTURE);
    }

    set albedoTexture(value:BaseTexture){
        if (value)
			this._shaderValues.addDefine(BillboardMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		else
			this._shaderValues.removeDefine(BillboardMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		this._shaderValues.setTexture(BillboardMaterial.ALBEDOTEXTURE, value);
    }

    get tilingOffset():Vector4{
        return this._shaderValues.getVector(BillboardMaterial.TILINGOFFSET);
    }

    set tilingOffset(value:Vector4){
        this._shaderValues.setVector(BillboardMaterial.TILINGOFFSET,value);
    }

    	/**
	 * 渲染模式。
	 */
	set renderMode(value: number) {
		switch (value) {
			case BillboardMaterial.RENDERMODE_OPAQUE:
				this.alphaTest = false;
				this.renderQueue = Material.RENDERQUEUE_OPAQUE;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case BillboardMaterial.RENDERMODE_CUTOUT:
				this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
				this.alphaTest = true;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case BillboardMaterial.RENDERMODE_TRANSPARENT:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				this.depthWrite = false;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			default:
				throw new Error("BillboardMaterial : renderMode value error.");
		}
	}

    constructor(){
        super();
        this.setShaderName("BILLBOARDMAT");
        this._shaderValues.setVector(BillboardMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
		this._shaderValues.setVector(BillboardMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
		this.renderMode = BillboardMaterial.RENDERMODE_OPAQUE;
    }




}