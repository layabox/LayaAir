import { BaseCamera } from "laya/d3/core/BaseCamera"
	import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D"
	import { SkinnedMeshSprite3D } from "laya/d3/core/SkinnedMeshSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { BaseMaterial } from "laya/d3/core/material/BaseMaterial"
	import { RenderState } from "laya/d3/core/material/RenderState"
	import { Scene3D } from "laya/d3/core/scene/Scene3D"
	import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh"
	import { Vector4 } from "laya/d3/math/Vector4"
	import { Shader3D } from "laya/d3/shader/Shader3D"
	import { ShaderData } from "laya/d3/shader/ShaderData"
	import { ShaderDefines } from "laya/d3/shader/ShaderDefines"
	import { SubShader } from "laya/d3/shader/SubShader"
	import { BaseTexture } from "laya/resource/BaseTexture"
	
	/**
	 * <code>CubeMaterial</code> 类用于实现Blinn-Phong材质。
	 */
	export class CubeMaterial extends BaseMaterial {
		/**高光强度数据源_漫反射贴图的Alpha通道。*/
		 static SPECULARSOURCE_DIFFUSEMAPALPHA:number;
		/**高光强度数据源_高光贴图的RGB通道。*/
		 static SPECULARSOURCE_SPECULARMAP:number;
		
		/**渲染状态_不透明。*/
		 static RENDERMODE_OPAQUE:number = 0;
		/**渲染状态_阿尔法测试。*/
		 static RENDERMODE_CUTOUT:number = 1;
		/**渲染状态_透明混合。*/
		 static RENDERMODE_TRANSPARENT:number = 2;
		
		 static SHADERDEFINE_DIFFUSEMAP:number;
		 static SHADERDEFINE_NORMALMAP:number;
		 static SHADERDEFINE_SPECULARMAP:number;
		 static SHADERDEFINE_TILINGOFFSET:number;
		 static SHADERDEFINE_ENABLEVERTEXCOLOR:number;
		 static SHADERDEFINE_MODENABLEVERTEXCOLOR:number;
		 static SHADERDEFINE_SOLIDCOLORTEXTURE:number;
		
		
		 static ALBEDOTEXTURE:number = Shader3D.propertyNameToID("u_DiffuseTexture");
		 static NORMALTEXTURE:number = Shader3D.propertyNameToID("u_NormalTexture");
		 static SPECULARTEXTURE:number = Shader3D.propertyNameToID("u_SpecularTexture");
		 static ALBEDOCOLOR:number = Shader3D.propertyNameToID("u_DiffuseColor");
		 static MATERIALSPECULAR:number = Shader3D.propertyNameToID("u_MaterialSpecular");
		 static SHININESS:number = Shader3D.propertyNameToID("u_Shininess");
		 static TILINGOFFSET:number = Shader3D.propertyNameToID("u_TilingOffset");
		
		/** 默认材质，禁止修改*/
		 static defaultMaterial:CubeMaterial = new CubeMaterial();
		
		/**@private */
		 static shaderDefines:ShaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
		
		/**
		 * @private
		 */
		 static __init__():void {
			CubeMaterial.SHADERDEFINE_DIFFUSEMAP = CubeMaterial.shaderDefines.registerDefine("DIFFUSEMAP");
			CubeMaterial.SHADERDEFINE_NORMALMAP = CubeMaterial.shaderDefines.registerDefine("NORMALMAP");
			CubeMaterial.SHADERDEFINE_SPECULARMAP = CubeMaterial.shaderDefines.registerDefine("SPECULARMAP");
			CubeMaterial.SHADERDEFINE_TILINGOFFSET = CubeMaterial.shaderDefines.registerDefine("TILINGOFFSET");
			CubeMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = CubeMaterial.shaderDefines.registerDefine("ENABLEVERTEXCOLOR");
			CubeMaterial.SHADERDEFINE_MODENABLEVERTEXCOLOR = CubeMaterial.shaderDefines.registerDefine("MODENABLEVERTEXCOLOR");
			CubeMaterial.SHADERDEFINE_SOLIDCOLORTEXTURE = CubeMaterial.shaderDefines.registerDefine("SOLIDCOLORTEXTURE");
			
			var vs:string, ps:string;
			var attributeMap:any = {
				'a_Position': VertexMesh.MESH_POSITION0, 
				'a_Color': VertexMesh.MESH_COLOR0, 
				'a_Normal': VertexMesh.MESH_NORMAL0, 
				'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0, 
				'a_Texcoord1': VertexMesh.MESH_TEXTURECOORDINATE1, 
				'a_BoneWeights': VertexMesh.MESH_BLENDWEIGHT0, 
				'a_BoneIndices': VertexMesh.MESH_BLENDINDICES0, 
				'a_Tangent0': VertexMesh.MESH_TANGENT0};
			var uniformMap:any = {
				'u_Bones': Shader3D.PERIOD_CUSTOM, 
				'u_DiffuseTexture':  Shader3D.PERIOD_MATERIAL, 
				'u_SpecularTexture': Shader3D.PERIOD_MATERIAL, 
				'u_NormalTexture':  Shader3D.PERIOD_MATERIAL, 
				'u_AlphaTestValue':  Shader3D.PERIOD_MATERIAL, 
				'u_DiffuseColor':Shader3D.PERIOD_MATERIAL, 
				'u_MaterialSpecular':  Shader3D.PERIOD_MATERIAL, 
				'u_Shininess':  Shader3D.PERIOD_MATERIAL, 
				'u_TilingOffset':  Shader3D.PERIOD_MATERIAL,
				
				'u_WorldMat': Shader3D.PERIOD_SPRITE, 
				'u_MvpMatrix': Shader3D.PERIOD_SPRITE, 
				'u_LightmapScaleOffset':  Shader3D.PERIOD_SPRITE, 
				'u_LightMap': Shader3D.PERIOD_SPRITE,
				
				'u_CameraPos':  Shader3D.PERIOD_CAMERA, 
				
				'u_ReflectTexture':  Shader3D.PERIOD_SCENE, 
				'u_ReflectIntensity': Shader3D.PERIOD_SCENE, 
				'u_FogStart': Shader3D.PERIOD_SCENE, 
				'u_FogRange': Shader3D.PERIOD_SCENE, 
				'u_FogColor':Shader3D.PERIOD_SCENE, 
				'u_DirectionLight.Color':Shader3D.PERIOD_SCENE,
				'u_DirectionLight.Direction': Shader3D.PERIOD_SCENE,  
				'u_PointLight.Position':  Shader3D.PERIOD_SCENE, 
				'u_PointLight.Range':  Shader3D.PERIOD_SCENE, 
				'u_PointLight.Color': Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Position':  Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Direction': Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Range':  Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Spot':  Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Color':  Shader3D.PERIOD_SCENE, 
				'u_AmbientColor':  Shader3D.PERIOD_SCENE,
				'u_shadowMap1':  Shader3D.PERIOD_SCENE, 
				'u_shadowMap2':  Shader3D.PERIOD_SCENE, 
				'u_shadowMap3':  Shader3D.PERIOD_SCENE, 
				'u_shadowPSSMDistance':  Shader3D.PERIOD_SCENE, 
				'u_lightShadowVP':  Shader3D.PERIOD_SCENE, 
				'u_shadowPCFoffset':  Shader3D.PERIOD_SCENE};
			
			vs = this.__INCLUDESTR__("CubeShader/CubeShader.vs");
			ps = this.__INCLUDESTR__("CubeShader/CubeShader.ps");
			var shader:Shader3D = Shader3D.add("CUBESHADER");
			var subShader:SubShader = new SubShader(attributeMap, uniformMap, SkinnedMeshSprite3D.shaderDefines, CubeMaterial.shaderDefines);
			shader.addSubShader(subShader);
			subShader.addShaderPass(vs,ps);
		}
		
		/**@private */
		private _albedoColor:Vector4;
		/**@private */
		private _albedoIntensity:number;
		/**@private */
		private _enableLighting:boolean;
		/**@private */
		private _enableVertexColor:boolean = false;
		
		/**
		 * @private
		 */
		 get _ColorR():number {
			return this._albedoColor.elements[0];
		}
		
		/**
		 * @private
		 */
		 set _ColorR(value:number) {
			this._albedoColor.elements[0] = value;
			this.albedoColor = this._albedoColor;
		}
		
		/**
		 * @private
		 */
		 get _ColorG():number {
			return this._albedoColor.elements[1];
		}
		
		/**
		 * @private
		 */
		 set _ColorG(value:number) {
			this._albedoColor.elements[1] = value;
			this.albedoColor = this._albedoColor;
		}
		
		/**
		 * @private
		 */
		 get _ColorB():number {
			return this._albedoColor.elements[2];
		}
		
		/**
		 * @private
		 */
		 set _ColorB(value:number) {
			this._albedoColor.elements[2] = value;
			this.albedoColor = this._albedoColor;
		}
		
		/**@private */
		 get _ColorA():number {
			return this._albedoColor.elements[3];
		}
		
		/**
		 * @private
		 */
		 set _ColorA(value:number) {
			this._albedoColor.elements[3] = value;
			this.albedoColor = this._albedoColor;
		}
		
		/**
		 * @private
		 */
		 get _SpecColorR():number {
			return this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR).elements[0];
		}
		
		/**
		 * @private
		 */
		 set _SpecColorR(value:number) {
			this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR).elements[0] = value;
		}
		
		/**
		 * @private
		 */
		 get _SpecColorG():number {
			return this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR).elements[1];
		}
		
		/**
		 * @private
		 */
		 set _SpecColorG(value:number) {
			this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR).elements[1] = value;
		}
		
		/**
		 * @private
		 */
		 get _SpecColorB():number {
			return this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR).elements[2];
		}
		
		/**
		 * @private
		 */
		 set _SpecColorB(value:number) {
			this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR).elements[2] = value;
		}
		
		/**
		 * @private
		 */
		 get _SpecColorA():number {
			return this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR).elements[3];
		}
		
		/**
		 * @private
		 */
		 set _SpecColorA(value:number) {
			this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR).elements[3] = value;
		}
		
		/**
		 * @private
		 */
		 get _AlbedoIntensity():number {
			return this._albedoIntensity;
		}
		
		/**
		 * @private
		 */
		 set _AlbedoIntensity(value:number) {
			if (this._albedoIntensity !== value) {
				var finalAlbedo:Vector4 = (<Vector4>this._shaderValues.getVector(CubeMaterial.ALBEDOCOLOR) );
				Vector4.scale(this._albedoColor, value, finalAlbedo);
				this._albedoIntensity = value;
				this._shaderValues.setVector(CubeMaterial.ALBEDOCOLOR, finalAlbedo);//修改值后必须调用此接口,否则NATIVE不生效
			}
		}
		
		/**
		 * @private
		 */
		 get _Shininess():number {
			return this._shaderValues.getNumber(CubeMaterial.SHININESS);
		}
		
		/**
		 * @private
		 */
		 set _Shininess(value:number) {
			value = Math.max(0.0, Math.min(1.0, value));
			this._shaderValues.setNumber(CubeMaterial.SHININESS, value);
		}
		
		/**
		 * @private
		 */
		 get _MainTex_STX():number {
			return this._shaderValues.getVector(CubeMaterial.TILINGOFFSET).elements[0];
		}
		
		/**
		 * @private
		 */
		 set _MainTex_STX(x:number) {
			var tilOff:Vector4 = (<Vector4>this._shaderValues.getVector(CubeMaterial.TILINGOFFSET) );
			tilOff.elements[0] = x;
			this.tilingOffset = tilOff;
		}
		
		/**
		 * @private
		 */
		 get _MainTex_STY():number {
			return this._shaderValues.getVector(CubeMaterial.TILINGOFFSET).elements[1];
		}
		
		/**
		 * @private
		 */
		 set _MainTex_STY(y:number) {
			var tilOff:Vector4 = (<Vector4>this._shaderValues.getVector(CubeMaterial.TILINGOFFSET) );
			tilOff.elements[1] = y;
			this.tilingOffset = tilOff;
		}
		
		/**
		 * @private
		 */
		 get _MainTex_STZ():number {
			return this._shaderValues.getVector(CubeMaterial.TILINGOFFSET).elements[2];
		}
		
		/**
		 * @private
		 */
		 set _MainTex_STZ(z:number) {
			var tilOff:Vector4 = (<Vector4>this._shaderValues.getVector(CubeMaterial.TILINGOFFSET) );
			tilOff.elements[2] = z;
			this.tilingOffset = tilOff;
		}
		
		/**
		 * @private
		 */
		 get _MainTex_STW():number {
			return this._shaderValues.getVector(CubeMaterial.TILINGOFFSET).elements[3];
		}
		
		/**
		 * @private
		 */
		 set _MainTex_STW(w:number) {
			var tilOff:Vector4 = (<Vector4>this._shaderValues.getVector(CubeMaterial.TILINGOFFSET) );
			tilOff.elements[3] = w;
			this.tilingOffset = tilOff;
		}
		
		/**
		 * @private
		 */
		 get _Cutoff():number {
			return this.alphaTestValue;
		}
		
		/**
		 * @private
		 */
		 set _Cutoff(value:number) {
			this.alphaTestValue = value;
		}
		
		/**
		 * 设置渲染模式。
		 * @return 渲染模式。
		 */
		 set renderMode(value:number) {
			var renderState:RenderState = this.getRenderState();
			switch (value) {
			case CubeMaterial.RENDERMODE_OPAQUE: 
				this.alphaTest = false;
				this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
				renderState.depthWrite = true;
				renderState.cull = RenderState.CULL_BACK;
				renderState.blend = RenderState.BLEND_DISABLE;
				renderState.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case CubeMaterial.RENDERMODE_CUTOUT: 
				this.renderQueue = BaseMaterial.RENDERQUEUE_ALPHATEST;
				this.alphaTest = true;
				renderState.depthWrite = true;
				renderState.cull = RenderState.CULL_BACK;
				renderState.blend = RenderState.BLEND_DISABLE;
				renderState.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case CubeMaterial.RENDERMODE_TRANSPARENT: 
				this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				renderState.depthWrite = false;
				renderState.cull = RenderState.CULL_BACK;
				renderState.blend = RenderState.BLEND_ENABLE_ALL;
				renderState.srcBlend = RenderState.BLENDPARAM_SRC_ALPHA;
				renderState.dstBlend = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				renderState.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			default: 
				throw new Error("Material:renderMode value error.");
			}
		}
		
		/**
		 * 获取是否支持顶点色。
		 * @return  是否支持顶点色。
		 */
		 get enableVertexColor():boolean {
			return this._enableVertexColor;
		}
		
		/**
		 * 设置是否支持顶点色。
		 * @param value  是否支持顶点色。
		 */
		 set enableVertexColor(value:boolean) {
			this._enableVertexColor = value;
			if (value)
				this._defineDatas.add(CubeMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
			else
				this._defineDatas.remove(CubeMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
		}
		
		 set modEnableVertexColor(value:boolean) {
			if (value)
				this._defineDatas.add(CubeMaterial.SHADERDEFINE_MODENABLEVERTEXCOLOR);
			else
				this._defineDatas.remove(CubeMaterial.SHADERDEFINE_MODENABLEVERTEXCOLOR);
		}
		
		 set solidColorTexture(value:boolean) {
			if (value)
				this._defineDatas.add(CubeMaterial.SHADERDEFINE_SOLIDCOLORTEXTURE);
			else
				this._defineDatas.remove(CubeMaterial.SHADERDEFINE_SOLIDCOLORTEXTURE);
		}
	
		
		/**
		 * 获取纹理平铺和偏移X分量。
		 * @return 纹理平铺和偏移X分量。
		 */
		 get tilingOffsetX():number {
			return this._MainTex_STX;
		}
		
		/**
		 * 获取纹理平铺和偏移X分量。
		 * @param x 纹理平铺和偏移X分量。
		 */
		 set tilingOffsetX(x:number) {
			this._MainTex_STX = x;
		}
		
		/**
		 * 获取纹理平铺和偏移Y分量。
		 * @return 纹理平铺和偏移Y分量。
		 */
		 get tilingOffsetY():number {
			return this._MainTex_STY;
		}
		
		/**
		 * 获取纹理平铺和偏移Y分量。
		 * @param y 纹理平铺和偏移Y分量。
		 */
		 set tilingOffsetY(y:number) {
			this._MainTex_STY = y;
		}
		
		/**
		 * 获取纹理平铺和偏移Z分量。
		 * @return 纹理平铺和偏移Z分量。
		 */
		 get tilingOffsetZ():number {
			return this._MainTex_STZ;
		}
		
		/**
		 * 获取纹理平铺和偏移Z分量。
		 * @param z 纹理平铺和偏移Z分量。
		 */
		 set tilingOffsetZ(z:number) {
			this._MainTex_STZ = z;
		}
		
		/**
		 * 获取纹理平铺和偏移W分量。
		 * @return 纹理平铺和偏移W分量。
		 */
		 get tilingOffsetW():number {
			return this._MainTex_STW;
		}
		
		/**
		 * 获取纹理平铺和偏移W分量。
		 * @param w 纹理平铺和偏移W分量。
		 */
		 set tilingOffsetW(w:number) {
			this._MainTex_STW = w;
		}
		
		/**
		 * 获取纹理平铺和偏移。
		 * @return 纹理平铺和偏移。
		 */
		 get tilingOffset():Vector4 {
			return (<Vector4>this._shaderValues.getVector(CubeMaterial.TILINGOFFSET) );
		}
		
		/**
		 * 获取纹理平铺和偏移。
		 * @param value 纹理平铺和偏移。
		 */
		 set tilingOffset(value:Vector4) {
			if (value) {
				var valueE:Float32Array = value.elements;
				if (valueE[0] != 1 || valueE[1] != 1 || valueE[2] != 0 || valueE[3] != 0)
					this._defineDatas.add(CubeMaterial.SHADERDEFINE_TILINGOFFSET);
				else
					this._defineDatas.remove(CubeMaterial.SHADERDEFINE_TILINGOFFSET);
			} else {
				this._defineDatas.remove(CubeMaterial.SHADERDEFINE_TILINGOFFSET);
			}
			this._shaderValues.setVector(CubeMaterial.TILINGOFFSET, value);
		}
		
		/**
		 * 获取反照率颜色R分量。
		 * @return 反照率颜色R分量。
		 */
		 get albedoColorR():number {
			return this._ColorR;
		}
		
		/**
		 * 设置反照率颜色R分量。
		 * @param value 反照率颜色R分量。
		 */
		 set albedoColorR(value:number) {
			this._ColorR = value;
		}
		
		/**
		 * 获取反照率颜色G分量。
		 * @return 反照率颜色G分量。
		 */
		 get albedoColorG():number {
			return this._ColorG;
		}
		
		/**
		 * 设置反照率颜色G分量。
		 * @param value 反照率颜色G分量。
		 */
		 set albedoColorG(value:number) {
			this._ColorG = value;
		}
		
		/**
		 * 获取反照率颜色B分量。
		 * @return 反照率颜色B分量。
		 */
		 get albedoColorB():number {
			return this._ColorB;
		}
		
		/**
		 * 设置反照率颜色B分量。
		 * @param value 反照率颜色B分量。
		 */
		 set albedoColorB(value:number) {
			this._ColorB = value;
		}
		
		/**
		 * 获取反照率颜色Z分量。
		 * @return 反照率颜色Z分量。
		 */
		 get albedoColorA():number {
			return this._ColorA;
		}
		
		/**
		 * 设置反照率颜色alpha分量。
		 * @param value 反照率颜色alpha分量。
		 */
		 set albedoColorA(value:number) {
			this._ColorA = value;
		}
		
		/**
		 * 获取反照率颜色。
		 * @return 反照率颜色。
		 */
		 get albedoColor():Vector4 {
			return this._albedoColor;
		}
		
		/**
		 * 设置反照率颜色。
		 * @param value 反照率颜色。
		 */
		 set albedoColor(value:Vector4) {
			var finalAlbedo:Vector4 = (<Vector4>this._shaderValues.getVector(CubeMaterial.ALBEDOCOLOR) );
			Vector4.scale(value, this._albedoIntensity, finalAlbedo);
			this._albedoColor = value;
			this._shaderValues.setVector(CubeMaterial.ALBEDOCOLOR, finalAlbedo);//修改值后必须调用此接口,否则NATIVE不生效
		}
		
		/**
		 * 获取反照率强度。
		 * @return 反照率强度。
		 */
		 get albedoIntensity():number {
			return this._albedoIntensity;
		}
		
		/**
		 * 设置反照率强度。
		 * @param value 反照率强度。
		 */
		 set albedoIntensity(value:number) {
			this._AlbedoIntensity = value;
		}
		
		/**
		 * 获取高光颜色R轴分量。
		 * @return 高光颜色R轴分量。
		 */
		 get specularColorR():number {
			return this._SpecColorR;
		}
		
		/**
		 * 设置高光颜色R分量。
		 * @param value 高光颜色R分量。
		 */
		 set specularColorR(value:number) {
			this._SpecColorR = value;
		}
		
		/**
		 * 获取高光颜色G分量。
		 * @return 高光颜色G分量。
		 */
		 get specularColorG():number {
			return this._SpecColorG;
		}
		
		/**
		 * 设置高光颜色G分量。
		 * @param value 高光颜色G分量。
		 */
		 set specularColorG(value:number) {
			this._SpecColorG = value;
		}
		
		/**
		 * 获取高光颜色B分量。
		 * @return 高光颜色B分量。
		 */
		 get specularColorB():number {
			return this._SpecColorB;
		}
		
		/**
		 * 设置高光颜色B分量。
		 * @param value 高光颜色B分量。
		 */
		 set specularColorB(value:number) {
			this._SpecColorB = value;
		}
		
		/**
		 * 获取高光颜色A分量。
		 * @return 高光颜色A分量。
		 */
		 get specularColorA():number {
			return this._SpecColorA;
		}
		
		/**
		 * 设置高光颜色A分量。
		 * @param value 高光颜色A分量。
		 */
		 set specularColorA(value:number) {
			this._SpecColorA = value;
		}
		
		/**
		 * 获取高光颜色。
		 * @return 高光颜色。
		 */
		 get specularColor():Vector4 {
			return (<Vector4>this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR) );
		}
		
		/**
		 * 设置高光颜色。
		 * @param value 高光颜色。
		 */
		 set specularColor(value:Vector4) {
			this._shaderValues.setVector(CubeMaterial.MATERIALSPECULAR, value);
		}
		
		/**
		 * 获取高光强度,范围为0到1。
		 * @return 高光强度。
		 */
		 get shininess():number {
			return this._Shininess;
		}
		
		/**
		 * 设置高光强度,范围为0到1。
		 * @param value 高光强度。
		 */
		 set shininess(value:number) {
			this._Shininess = value;
		}
		
		/**
		 * 获取反照率贴图。
		 * @return 反照率贴图。
		 */
		 get albedoTexture():BaseTexture {
			return this._shaderValues.getTexture(CubeMaterial.ALBEDOTEXTURE);
		}
		
		/**
		 * 设置反照率贴图。
		 * @param value 反照率贴图。
		 */
		 set albedoTexture(value:BaseTexture) {
			if (value)
				this._defineDatas.add(CubeMaterial.SHADERDEFINE_DIFFUSEMAP);
			else
				this._defineDatas.remove(CubeMaterial.SHADERDEFINE_DIFFUSEMAP);
			this._shaderValues.setTexture(CubeMaterial.ALBEDOTEXTURE, value);
		}
		
		/**
		 * 获取法线贴图。
		 * @return 法线贴图。
		 */
		 get normalTexture():BaseTexture {
			return this._shaderValues.getTexture(CubeMaterial.NORMALTEXTURE);
		}
		
		/**
		 * 设置法线贴图。
		 * @param value 法线贴图。
		 */
		 set normalTexture(value:BaseTexture) {
			if (value)
				this._defineDatas.add(CubeMaterial.SHADERDEFINE_NORMALMAP);
			else
				this._defineDatas.remove(CubeMaterial.SHADERDEFINE_NORMALMAP);
			this._shaderValues.setTexture(CubeMaterial.NORMALTEXTURE, value);
		}
		
		/**
		 * 获取高光贴图。
		 * @return 高光贴图。
		 */
		 get specularTexture():BaseTexture {
			return this._shaderValues.getTexture(CubeMaterial.SPECULARTEXTURE);
		}
		
		/**
		 * 设置高光贴图，高光强度则从该贴图RGB值中获取,如果该值为空则从漫反射贴图的Alpha通道获取。
		 * @param value  高光贴图。
		 */
		 set specularTexture(value:BaseTexture) {
			if (value)
				this._defineDatas.add(CubeMaterial.SHADERDEFINE_SPECULARMAP);
			else
				this._defineDatas.remove(CubeMaterial.SHADERDEFINE_SPECULARMAP);
			
			this._shaderValues.setTexture(CubeMaterial.SPECULARTEXTURE, value);
		}
		
		/**
		 * 获取是否启用光照。
		 * @return 是否启用光照。
		 */
		 get enableLighting():boolean {
			return this._enableLighting;
		}
		
		/**
		 * 设置是否启用光照。
		 * @param value 是否启用光照。
		 */
		 set enableLighting(value:boolean) {
			if (this._enableLighting !== value) {
				if (value)
					this._disablePublicDefineDatas.remove(Scene3D.SHADERDEFINE_POINTLIGHT | Scene3D.SHADERDEFINE_SPOTLIGHT | Scene3D.SHADERDEFINE_DIRECTIONLIGHT);
				else
					this._disablePublicDefineDatas.add(Scene3D.SHADERDEFINE_POINTLIGHT | Scene3D.SHADERDEFINE_SPOTLIGHT | Scene3D.SHADERDEFINE_DIRECTIONLIGHT);
				this._enableLighting = value;
			}
		}
		
		/**
		 * 禁用雾化。
		 */
		 disableFog():void {
			this._disablePublicDefineDatas.add(Scene3D.SHADERDEFINE_FOG);
		}
		
		/**
		 * 创建一个 <code>CubeMaterial</code> 实例。
		 */
		constructor(){
			/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
			super(12);
			this.setShaderName("CUBESHADER");
			this._albedoIntensity = 1.0;
			this._albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
			var sv:ShaderData = this._shaderValues;
			sv.setVector(CubeMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
			sv.setVector(CubeMaterial.MATERIALSPECULAR, new Vector4(1.0, 1.0, 1.0, 1.0));
			sv.setNumber(CubeMaterial.SHININESS, 0.078125);
			sv.setNumber(BaseMaterial.ALPHATESTVALUE, 0.5);
			sv.setVector(CubeMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
			this._enableLighting = true;
			this.renderMode = CubeMaterial.RENDERMODE_OPAQUE;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  cloneTo(destObject:any):void {
			super.cloneTo(destObject);
			var destMaterial:CubeMaterial = (<CubeMaterial>destObject );
			destMaterial._enableLighting = this._enableLighting;
			destMaterial._albedoIntensity = this._albedoIntensity;
			this._albedoColor.cloneTo(destMaterial._albedoColor);
		}
	}


