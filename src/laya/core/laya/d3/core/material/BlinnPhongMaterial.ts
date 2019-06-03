import { BaseTexture } from "laya/resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderData } from "../../shader/ShaderData";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { BaseMaterial } from "./BaseMaterial";
import { RenderState } from "./RenderState";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
	
	/**
	 * <code>BlinnPhongMaterial</code> 类用于实现Blinn-Phong材质。
	 */
	export class BlinnPhongMaterial extends BaseMaterial {
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
		
		 static ALBEDOTEXTURE:number = Shader3D.propertyNameToID("u_DiffuseTexture");
		 static NORMALTEXTURE:number = Shader3D.propertyNameToID("u_NormalTexture");
		 static SPECULARTEXTURE:number = Shader3D.propertyNameToID("u_SpecularTexture");
		 static ALBEDOCOLOR:number = Shader3D.propertyNameToID("u_DiffuseColor");
		 static MATERIALSPECULAR:number = Shader3D.propertyNameToID("u_MaterialSpecular");
		 static SHININESS:number = Shader3D.propertyNameToID("u_Shininess");
		 static TILINGOFFSET:number = Shader3D.propertyNameToID("u_TilingOffset");
		 static CULL:number = Shader3D.propertyNameToID("s_Cull");
		 static BLEND:number = Shader3D.propertyNameToID("s_Blend");
		 static BLEND_SRC:number = Shader3D.propertyNameToID("s_BlendSrc");
		 static BLEND_DST:number = Shader3D.propertyNameToID("s_BlendDst");
		 static DEPTH_TEST:number = Shader3D.propertyNameToID("s_DepthTest");
		 static DEPTH_WRITE:number = Shader3D.propertyNameToID("s_DepthWrite");
		
		/** 默认材质，禁止修改*/
		 static defaultMaterial:BlinnPhongMaterial;
		
		/**@private */
		 static shaderDefines:ShaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
		
		/**
		 * @private
		 */
		 static __init__():void {
			//BlinnPhongMaterial.defaultMaterial= new BlinnPhongMaterial();
			BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP = BlinnPhongMaterial.shaderDefines.registerDefine("DIFFUSEMAP");
			BlinnPhongMaterial.SHADERDEFINE_NORMALMAP = BlinnPhongMaterial.shaderDefines.registerDefine("NORMALMAP");
			BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP = BlinnPhongMaterial.shaderDefines.registerDefine("SPECULARMAP");
			BlinnPhongMaterial.SHADERDEFINE_TILINGOFFSET = BlinnPhongMaterial.shaderDefines.registerDefine("TILINGOFFSET");
			BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = BlinnPhongMaterial.shaderDefines.registerDefine("ENABLEVERTEXCOLOR");
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
			return this._albedoColor.x;
		}
		
		/**
		 * @private
		 */
		 set _ColorR(value:number) {
			this._albedoColor.x = value;
			this.albedoColor = this._albedoColor;
		}
		
		/**
		 * @private
		 */
		 get _ColorG():number {
			return this._albedoColor.y;
		}
		
		/**
		 * @private
		 */
		 set _ColorG(value:number) {
			this._albedoColor.y = value;
			this.albedoColor = this._albedoColor;
		}
		
		/**
		 * @private
		 */
		 get _ColorB():number {
			return this._albedoColor.z;
		}
		
		/**
		 * @private
		 */
		 set _ColorB(value:number) {
			this._albedoColor.z = value;
			this.albedoColor = this._albedoColor;
		}
		
		/**@private */
		 get _ColorA():number {
			return this._albedoColor.w;
		}
		
		/**
		 * @private
		 */
		 set _ColorA(value:number) {
			this._albedoColor.w = value;
			this.albedoColor = this._albedoColor;
		}
		
		/**
		 * @private
		 */
		 get _SpecColorR():number {
			return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).x;
		}
		
		/**
		 * @private
		 */
		 set _SpecColorR(value:number) {
			this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).x = value;
		}
		
		/**
		 * @private
		 */
		 get _SpecColorG():number {
			return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).y;
		}
		
		/**
		 * @private
		 */
		 set _SpecColorG(value:number) {
			this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).y = value;
		}
		
		/**
		 * @private
		 */
		 get _SpecColorB():number {
			return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).z;
		}
		
		/**
		 * @private
		 */
		 set _SpecColorB(value:number) {
			this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).z = value;
		}
		
		/**
		 * @private
		 */
		 get _SpecColorA():number {
			return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).w;
		}
		
		/**
		 * @private
		 */
		 set _SpecColorA(value:number) {
			this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).w = value;
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
				var finalAlbedo:Vector4 = (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.ALBEDOCOLOR) );
				Vector4.scale(this._albedoColor, value, finalAlbedo);
				this._albedoIntensity = value;
				this._shaderValues.setVector(BlinnPhongMaterial.ALBEDOCOLOR, finalAlbedo);//修改值后必须调用此接口,否则NATIVE不生效
			}
		}
		
		/**
		 * @private
		 */
		 get _Shininess():number {
			return this._shaderValues.getNumber(BlinnPhongMaterial.SHININESS);
		}
		
		/**
		 * @private
		 */
		 set _Shininess(value:number) {
			value = Math.max(0.0, Math.min(1.0, value));
			this._shaderValues.setNumber(BlinnPhongMaterial.SHININESS, value);
		}
		
		/**
		 * @private
		 */
		 get _MainTex_STX():number {
			return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).x;
		}
		
		/**
		 * @private
		 */
		 set _MainTex_STX(x:number) {
			var tilOff:Vector4 = (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET) );
			tilOff.x = x;
			this.tilingOffset = tilOff;
		}
		
		/**
		 * @private
		 */
		 get _MainTex_STY():number {
			return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).y;
		}
		
		/**
		 * @private
		 */
		 set _MainTex_STY(y:number) {
			var tilOff:Vector4 = (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET) );
			tilOff.y = y;
			this.tilingOffset = tilOff;
		}
		
		/**
		 * @private
		 */
		 get _MainTex_STZ():number {
			return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).z;
		}
		
		/**
		 * @private
		 */
		 set _MainTex_STZ(z:number) {
			var tilOff:Vector4 = (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET) );
			tilOff.z = z;
			this.tilingOffset = tilOff;
		}
		
		/**
		 * @private
		 */
		 get _MainTex_STW():number {
			return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).w;
		}
		
		/**
		 * @private
		 */
		 set _MainTex_STW(w:number) {
			var tilOff:Vector4 = (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET) );
			tilOff.w = w;
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
			switch (value) {
			case BlinnPhongMaterial.RENDERMODE_OPAQUE: 
				this.alphaTest = false;
				this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case BlinnPhongMaterial.RENDERMODE_CUTOUT: 
				this.renderQueue = BaseMaterial.RENDERQUEUE_ALPHATEST;
				this.alphaTest = true;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case BlinnPhongMaterial.RENDERMODE_TRANSPARENT: 
				this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				this.depthWrite = false;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.depthTest = RenderState.DEPTHTEST_LESS;
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
				this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
			else
				this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
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
			return (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET) );
		}
		
		/**
		 * 获取纹理平铺和偏移。
		 * @param value 纹理平铺和偏移。
		 */
		 set tilingOffset(value:Vector4) {
			if (value) {
				if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
					this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_TILINGOFFSET);
				else
					this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_TILINGOFFSET);
			} else {
				this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_TILINGOFFSET);
			}
			this._shaderValues.setVector(BlinnPhongMaterial.TILINGOFFSET, value);
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
			var finalAlbedo:Vector4 = (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.ALBEDOCOLOR) );
			Vector4.scale(value, this._albedoIntensity, finalAlbedo);
			this._albedoColor = value;
			this._shaderValues.setVector(BlinnPhongMaterial.ALBEDOCOLOR, finalAlbedo);//修改值后必须调用此接口,否则NATIVE不生效
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
			return (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR) );
		}
		
		/**
		 * 设置高光颜色。
		 * @param value 高光颜色。
		 */
		 set specularColor(value:Vector4) {
			this._shaderValues.setVector(BlinnPhongMaterial.MATERIALSPECULAR, value);
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
			return this._shaderValues.getTexture(BlinnPhongMaterial.ALBEDOTEXTURE);
		}
		
		/**
		 * 设置反照率贴图。
		 * @param value 反照率贴图。
		 */
		 set albedoTexture(value:BaseTexture) {
			if (value)
				this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP);
			else
				this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP);
			this._shaderValues.setTexture(BlinnPhongMaterial.ALBEDOTEXTURE, value);
		}
		
		/**
		 * 获取法线贴图。
		 * @return 法线贴图。
		 */
		 get normalTexture():BaseTexture {
			return this._shaderValues.getTexture(BlinnPhongMaterial.NORMALTEXTURE);
		}
		
		/**
		 * 设置法线贴图。
		 * @param value 法线贴图。
		 */
		 set normalTexture(value:BaseTexture) {
			if (value)
				this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_NORMALMAP);
			else
				this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_NORMALMAP);
			this._shaderValues.setTexture(BlinnPhongMaterial.NORMALTEXTURE, value);
		}
		
		/**
		 * 获取高光贴图。
		 * @return 高光贴图。
		 */
		 get specularTexture():BaseTexture {
			return this._shaderValues.getTexture(BlinnPhongMaterial.SPECULARTEXTURE);
		}
		
		/**
		 * 设置高光贴图，高光强度则从该贴图RGB值中获取,如果该值为空则从漫反射贴图的Alpha通道获取。
		 * @param value  高光贴图。
		 */
		 set specularTexture(value:BaseTexture) {
			if (value)
				this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP);
			else
				this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP);
			
			this._shaderValues.setTexture(BlinnPhongMaterial.SPECULARTEXTURE, value);
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
					this._disablePublicDefineDatas.remove(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT | Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT | Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
				else
					this._disablePublicDefineDatas.add(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT | Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT | Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
				this._enableLighting = value;
			}
		}
		
		/**
		 * 设置是否写入深度。
		 * @param value 是否写入深度。
		 */
		 set depthWrite(value:boolean) {
			this._shaderValues.setBool(BlinnPhongMaterial.DEPTH_WRITE, value);
		}
		
		/**
		 * 获取是否写入深度。
		 * @return 是否写入深度。
		 */
		 get depthWrite():boolean {
			return this._shaderValues.getBool(BlinnPhongMaterial.DEPTH_WRITE);
		}
		
		/**
		 * 设置剔除方式。
		 * @param value 剔除方式。
		 */
		 set cull(value:number) {
			this._shaderValues.setInt(BlinnPhongMaterial.CULL, value);
		}
		
		/**
		 * 获取剔除方式。
		 * @return 剔除方式。
		 */
		 get cull():number {
			return this._shaderValues.getInt(BlinnPhongMaterial.CULL);
		}
		
		/**
		 * 设置混合方式。
		 * @param value 混合方式。
		 */
		 set blend(value:number) {
			this._shaderValues.setInt(BlinnPhongMaterial.BLEND, value);
		}
		
		/**
		 * 获取混合方式。
		 * @return 混合方式。
		 */
		 get blend():number {
			return this._shaderValues.getInt(BlinnPhongMaterial.BLEND);
		}
		
		/**
		 * 设置混合源。
		 * @param value 混合源
		 */
		 set blendSrc(value:number) {
			this._shaderValues.setInt(BlinnPhongMaterial.BLEND_SRC, value);
		}
		
		/**
		 * 获取混合源。
		 * @return 混合源。
		 */
		 get blendSrc():number {
			return this._shaderValues.getInt(BlinnPhongMaterial.BLEND_SRC);
		}
		
		/**
		 * 设置混合目标。
		 * @param value 混合目标
		 */
		 set blendDst(value:number) {
			this._shaderValues.setInt(BlinnPhongMaterial.BLEND_DST, value);
		}
		
		/**
		 * 获取混合目标。
		 * @return 混合目标。
		 */
		 get blendDst():number {
			return this._shaderValues.getInt(BlinnPhongMaterial.BLEND_DST);
		}
		
		/**
		 * 设置深度测试方式。
		 * @param value 深度测试方式
		 */
		 set depthTest(value:number) {
			this._shaderValues.setInt(BlinnPhongMaterial.DEPTH_TEST, value);
		}
		
		/**
		 * 获取深度测试方式。
		 * @return 深度测试方式。
		 */
		 get depthTest():number {
			return this._shaderValues.getInt(BlinnPhongMaterial.DEPTH_TEST);
		}
		
		/**
		 * 创建一个 <code>BlinnPhongMaterial</code> 实例。
		 */
		constructor(){
			/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
			super();
			this.setShaderName("BLINNPHONG");
			this._albedoIntensity = 1.0;
			this._albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
			var sv:ShaderData = this._shaderValues;
			sv.setVector(BlinnPhongMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
			sv.setVector(BlinnPhongMaterial.MATERIALSPECULAR, new Vector4(1.0, 1.0, 1.0, 1.0));
			sv.setNumber(BlinnPhongMaterial.SHININESS, 0.078125);
			sv.setNumber(BaseMaterial.ALPHATESTVALUE, 0.5);
			sv.setVector(BlinnPhongMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
			this._enableLighting = true;
			this.renderMode = BlinnPhongMaterial.RENDERMODE_OPAQUE;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  cloneTo(destObject:any):void {
			super.cloneTo(destObject);
			var destMaterial:BlinnPhongMaterial = (<BlinnPhongMaterial>destObject );
			destMaterial._enableLighting = this._enableLighting;
			destMaterial._albedoIntensity = this._albedoIntensity;
			destMaterial._enableVertexColor = this._enableVertexColor;
			this._albedoColor.cloneTo(destMaterial._albedoColor);
		}
	}


