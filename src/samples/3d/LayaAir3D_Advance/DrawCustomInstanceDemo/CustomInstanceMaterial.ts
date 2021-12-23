import { Material } from "laya/d3/core/material/Material";
import { RenderState } from "laya/d3/core/material/RenderState";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { SubShader } from "laya/d3/shader/SubShader";
import CustomInstanceVS from "./customInstance.vs";
import CustomInstanceFS from "./customInstance.fs";

export class CustomInstanceMaterial extends Material{



    static init(){
        var attributeMap: any = {
			'a_Position': VertexMesh.MESH_POSITION0,
			'a_Normal': VertexMesh.MESH_NORMAL0,
			'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0,
            'a_Tangent0': VertexMesh.MESH_TANGENT0,
            /** 必须保留的attribute*/
            'a_WorldMat':VertexMesh.MESH_WORLDMATRIX_ROW0,
            /** 自定义的Color */
            'a_InstanceColor':VertexMesh.MESH_CUSTOME0
        };
        var uniformMap = {
            'u_ViewProjection': Shader3D.PERIOD_CAMERA,
            'u_MvpMatrix':Shader3D.PERIOD_CAMERA
            
		};
		var stateMap = {
			's_Cull': Shader3D.RENDER_STATE_CULL,
			's_Blend': Shader3D.RENDER_STATE_BLEND,
			's_BlendSrc': Shader3D.RENDER_STATE_BLEND_SRC,
			's_BlendDst': Shader3D.RENDER_STATE_BLEND_DST,
			's_DepthTest': Shader3D.RENDER_STATE_DEPTH_TEST,
			's_DepthWrite': Shader3D.RENDER_STATE_DEPTH_WRITE
		}
        var shader: Shader3D = Shader3D.add("CustomInstanceMat", null, null,false);
		var subShader: SubShader = new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		subShader.addShaderPass(CustomInstanceVS, CustomInstanceFS, stateMap, "Forward");
    }

    constructor(){
        super();
        this.setShaderName("CustomInstanceMat");
        this.renderModeSet();
    }

    //渲染模式
    renderModeSet(){
        this.alphaTest = true;//深度测试关闭
        this.renderQueue = Material.RENDERQUEUE_OPAQUE;//渲染顺序放在后面
        this.depthWrite = true;
        this.cull = RenderState.CULL_BACK;
        this.blend = RenderState.BLEND_DISABLE;
        this.depthTest = RenderState.DEPTHTEST_LESS;
    }

}