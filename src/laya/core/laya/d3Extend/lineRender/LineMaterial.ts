import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { BaseMaterial } from "laya/d3/core/material/BaseMaterial"
	import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh"
	import { SubShader } from "laya/d3/shader/SubShader"
	import { ShaderDefines } from "laya/d3/shader/ShaderDefines"
	
	/**
	 * ...
	 * @author
	 */
	export class LineMaterial extends BaseMaterial {
		
		/** 默认材质，禁止修改*/
		 static defaultMaterial:LineMaterial = new LineMaterial();
		
		/**@private */
		 static shaderDefines:ShaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
		
		/**
		 * @private
		 */
		 static __init__():void {
		}
		
		 static initShader():void {
			
			var attributeMap:any = {
				'a_Position': VertexMesh.MESH_POSITION0, 
				'a_Color': VertexMesh.MESH_COLOR0, 
				'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0};
			var uniformMap:any = {
				'u_MvpMatrix': [Sprite3D.MVPMATRIX, SubShader.PERIOD_SPRITE], 
				'u_WorldMat': [Sprite3D.WORLDMATRIX, SubShader.PERIOD_SPRITE]};
			
			var vs:string = this.__INCLUDESTR__("shader/line.vs");
			var ps:string = this.__INCLUDESTR__("shader/line.ps");
			
			var lineShaderCompile3D:SubShader = SubShader.add("LineShader", attributeMap, uniformMap);
			lineShaderCompile3D.addShaderPass(vs, ps);
		}
		
		constructor(){
			this.setShaderName("LineShader");
			super(1);
		}
	
	}


