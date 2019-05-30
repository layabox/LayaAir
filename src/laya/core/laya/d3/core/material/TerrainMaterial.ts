import { BaseMaterial } from "././BaseMaterial";
import { RenderState } from "././RenderState";
import { Scene3D } from "../scene/Scene3D"
	import { Vector2 } from "../../math/Vector2"
	import { Vector3 } from "../../math/Vector3"
	import { Vector4 } from "../../math/Vector4"
	import { Shader3D } from "../../shader/Shader3D"
	import { ShaderDefines } from "../../shader/ShaderDefines"
	import { BaseTexture } from "laya/resource/BaseTexture"
	
	/**
	 * ...
	 * @author ...
	 */
	export class TerrainMaterial extends BaseMaterial {
		/**渲染状态_不透明。*/
		 static RENDERMODE_OPAQUE:number = 1;
		/**渲染状态_透明混合。*/
		 static RENDERMODE_TRANSPARENT:number = 2;
		
		/**渲染状态_透明混合。*/
		 static SPLATALPHATEXTURE:number = 0;
		 static NORMALTEXTURE:number = 1;
		 static DIFFUSETEXTURE1:number = 2;
		 static DIFFUSETEXTURE2:number = 3;
		 static DIFFUSETEXTURE3:number = 4;
		 static DIFFUSETEXTURE4:number = 5;
		 static DIFFUSESCALE1:number = 6;
		 static DIFFUSESCALE2:number = 7;
		 static DIFFUSESCALE3:number = 8;
		 static DIFFUSESCALE4:number = 9;
		 static MATERIALAMBIENT:number = 10;
		 static MATERIALDIFFUSE:number = 11;
		 static MATERIALSPECULAR:number = 12;
		
		 static CULL:number = Shader3D.propertyNameToID("s_Cull");
		 static BLEND:number = Shader3D.propertyNameToID("s_Blend");
		 static BLEND_SRC:number = Shader3D.propertyNameToID("s_BlendSrc");
		 static BLEND_DST:number = Shader3D.propertyNameToID("s_BlendDst");
		 static DEPTH_TEST:number = Shader3D.propertyNameToID("s_DepthTest");
		 static DEPTH_WRITE:number = Shader3D.propertyNameToID("s_DepthWrite");
		
		/**地形细节宏定义。*/
		 static SHADERDEFINE_DETAIL_NUM1:number;
		 static SHADERDEFINE_DETAIL_NUM2:number;
		 static SHADERDEFINE_DETAIL_NUM3:number;
		 static SHADERDEFINE_DETAIL_NUM4:number;
		
		private _diffuseScale1:Vector2;
		private _diffuseScale2:Vector2;
		private _diffuseScale3:Vector2;
		private _diffuseScale4:Vector2;
		
		/** 默认材质，禁止修改*/
		 static defaultMaterial:TerrainMaterial = new TerrainMaterial();
		
		/**@private */
		 static shaderDefines:ShaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
		
		/**
		 * @private
		 */
		 static __init__():void {
			TerrainMaterial.SHADERDEFINE_DETAIL_NUM1 = TerrainMaterial.shaderDefines.registerDefine("DETAIL_NUM1");
			TerrainMaterial.SHADERDEFINE_DETAIL_NUM2 = TerrainMaterial.shaderDefines.registerDefine("DETAIL_NUM2");
			TerrainMaterial.SHADERDEFINE_DETAIL_NUM4 = TerrainMaterial.shaderDefines.registerDefine("DETAIL_NUM4");
			TerrainMaterial.SHADERDEFINE_DETAIL_NUM3 = TerrainMaterial.shaderDefines.registerDefine("DETAIL_NUM3");
		}
		
		 setDiffuseScale1(x:number, y:number):void {
			this._diffuseScale1.x = x;
			this._diffuseScale1.y = y;
			this._shaderValues.setVector2(TerrainMaterial.DIFFUSESCALE1, this._diffuseScale1);
		}
		
		 setDiffuseScale2(x:number, y:number):void {
			this._diffuseScale2.x = x;
			this._diffuseScale2.y = y;
			this._shaderValues.setVector2(TerrainMaterial.DIFFUSESCALE2, this._diffuseScale2);
		}
		
		 setDiffuseScale3(x:number, y:number):void {
			this._diffuseScale3.x = x;
			this._diffuseScale3.y = y;
			this._shaderValues.setVector2(TerrainMaterial.DIFFUSESCALE3, this._diffuseScale3);
		}
		
		 setDiffuseScale4(x:number, y:number):void {
			this._diffuseScale4.x = x;
			this._diffuseScale4.y = y;
			this._shaderValues.setVector2(TerrainMaterial.DIFFUSESCALE4, this._diffuseScale4);
		}
		
		 setDetailNum(value:number):void {
			switch (value) {
			case 1: 
				this._shaderValues.addDefine(TerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
				this._shaderValues.removeDefine(TerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
				this._shaderValues.removeDefine(TerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
				this._shaderValues.removeDefine(TerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
				break;
			case 2: 
				this._shaderValues.addDefine(TerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
				this._shaderValues.removeDefine(TerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
				this._shaderValues.removeDefine(TerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
				this._shaderValues.removeDefine(TerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
				break;
			case 3: 
				this._shaderValues.addDefine(TerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
				this._shaderValues.removeDefine(TerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
				this._shaderValues.removeDefine(TerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
				this._shaderValues.removeDefine(TerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
				break;
			case 4: 
				this._shaderValues.addDefine(TerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
				this._shaderValues.removeDefine(TerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
				this._shaderValues.removeDefine(TerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
				this._shaderValues.removeDefine(TerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
				break;
			}
		}
		
		 get ambientColor():Vector3 {
			return (<Vector3>this._shaderValues.getVector3(TerrainMaterial.MATERIALAMBIENT) );
		}
		
		 set ambientColor(value:Vector3) {
			this._shaderValues.setVector3(TerrainMaterial.MATERIALAMBIENT, value);
		}
		
		 get diffuseColor():Vector3 {
			return (<Vector3>this._shaderValues.getVector3(TerrainMaterial.MATERIALDIFFUSE) );
		}
		
		 set diffuseColor(value:Vector3) {
			this._shaderValues.setVector3(TerrainMaterial.MATERIALDIFFUSE, value);
		}
		
		 get specularColor():Vector4 {
			return (<Vector4>this._shaderValues.getVector(TerrainMaterial.MATERIALSPECULAR) );
		}
		
		 set specularColor(value:Vector4) {
			this._shaderValues.setVector(TerrainMaterial.MATERIALSPECULAR, value);
		}
		
		/**
		 * 设置渲染模式。
		 * @return 渲染模式。
		 */
		 set renderMode(value:number) {
			switch (value) {
			case TerrainMaterial.RENDERMODE_OPAQUE: 
				this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case TerrainMaterial.RENDERMODE_TRANSPARENT: 
				this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
				this.depthWrite = false;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.depthTest = RenderState.DEPTHTEST_LEQUAL;
				break;
			default: 
				throw new Error("TerrainMaterial:renderMode value error.");
			}
		}
		
		/**
		 * 获取第一层贴图。
		 * @return 第一层贴图。
		 */
		 get diffuseTexture1():BaseTexture {
			return this._shaderValues.getTexture(TerrainMaterial.DIFFUSETEXTURE1);
		}
		
		/**
		 * 设置第一层贴图。
		 * @param value 第一层贴图。
		 */
		 set diffuseTexture1(value:BaseTexture) {
			this._shaderValues.setTexture(TerrainMaterial.DIFFUSETEXTURE1, value);
		}
		
		/**
		 * 获取第二层贴图。
		 * @return 第二层贴图。
		 */
		 get diffuseTexture2():BaseTexture {
			return this._shaderValues.getTexture(TerrainMaterial.DIFFUSETEXTURE2);
		}
		
		/**
		 * 设置第二层贴图。
		 * @param value 第二层贴图。
		 */
		 set diffuseTexture2(value:BaseTexture) {
			this._shaderValues.setTexture(TerrainMaterial.DIFFUSETEXTURE2, value);
		}
		
		/**
		 * 获取第三层贴图。
		 * @return 第三层贴图。
		 */
		 get diffuseTexture3():BaseTexture {
			return this._shaderValues.getTexture(TerrainMaterial.DIFFUSETEXTURE3);
		}
		
		/**
		 * 设置第三层贴图。
		 * @param value 第三层贴图。
		 */
		 set diffuseTexture3(value:BaseTexture) {
			this._shaderValues.setTexture(TerrainMaterial.DIFFUSETEXTURE3, value);
		}
		
		/**
		 * 获取第四层贴图。
		 * @return 第四层贴图。
		 */
		 get diffuseTexture4():BaseTexture {
			return this._shaderValues.getTexture(TerrainMaterial.DIFFUSETEXTURE4);
		}
		
		/**
		 * 设置第四层贴图。
		 * @param value 第四层贴图。
		 */
		 set diffuseTexture4(value:BaseTexture) {
			this._shaderValues.setTexture(TerrainMaterial.DIFFUSETEXTURE4, value);
		}
		
		/**
		 * 获取splatAlpha贴图。
		 * @return splatAlpha贴图。
		 */
		 get splatAlphaTexture():BaseTexture {
			return this._shaderValues.getTexture(TerrainMaterial.SPLATALPHATEXTURE);
		}
		
		/**
		 * 设置splatAlpha贴图。
		 * @param value splatAlpha贴图。
		 */
		 set splatAlphaTexture(value:BaseTexture) {
			this._shaderValues.setTexture(TerrainMaterial.SPLATALPHATEXTURE, value);
		}
		
		 get normalTexture():BaseTexture {
			return this._shaderValues.getTexture(TerrainMaterial.NORMALTEXTURE);
		}
		
		 set normalTexture(value:BaseTexture) {
			this._shaderValues.setTexture(TerrainMaterial.NORMALTEXTURE, value);
		}
		
		 disableLight():void {
			this._disablePublicDefineDatas.add(Scene3D.SHADERDEFINE_POINTLIGHT | Scene3D.SHADERDEFINE_SPOTLIGHT | Scene3D.SHADERDEFINE_DIRECTIONLIGHT);
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  setShaderName(name:string):void {
			super.setShaderName(name);
		}
		
		/**
		 * 设置是否写入深度。
		 * @param value 是否写入深度。
		 */
		 set depthWrite(value:boolean) {
			this._shaderValues.setBool(TerrainMaterial.DEPTH_WRITE, value);
		}
		
		/**
		 * 获取是否写入深度。
		 * @return 是否写入深度。
		 */
		 get depthWrite():boolean {
			return this._shaderValues.getBool(TerrainMaterial.DEPTH_WRITE);
		}
		
		/**
		 * 设置剔除方式。
		 * @param value 剔除方式。
		 */
		 set cull(value:number) {
			this._shaderValues.setInt(TerrainMaterial.CULL, value);
		}
		
		/**
		 * 获取剔除方式。
		 * @return 剔除方式。
		 */
		 get cull():number {
			return this._shaderValues.getInt(TerrainMaterial.CULL);
		}
		
		/**
		 * 设置混合方式。
		 * @param value 混合方式。
		 */
		 set blend(value:number) {
			this._shaderValues.setInt(TerrainMaterial.BLEND, value);
		}
		
		/**
		 * 获取混合方式。
		 * @return 混合方式。
		 */
		 get blend():number {
			return this._shaderValues.getInt(TerrainMaterial.BLEND);
		}
		
		/**
		 * 设置混合源。
		 * @param value 混合源
		 */
		 set blendSrc(value:number) {
			this._shaderValues.setInt(TerrainMaterial.BLEND_SRC, value);
		}
		
		/**
		 * 获取混合源。
		 * @return 混合源。
		 */
		 get blendSrc():number {
			return this._shaderValues.getInt(TerrainMaterial.BLEND_SRC);
		}
		
		/**
		 * 设置混合目标。
		 * @param value 混合目标
		 */
		 set blendDst(value:number) {
			this._shaderValues.setInt(TerrainMaterial.BLEND_DST, value);
		}
		
		/**
		 * 获取混合目标。
		 * @return 混合目标。
		 */
		 get blendDst():number {
			return this._shaderValues.getInt(TerrainMaterial.BLEND_DST);
		}
		
		/**
		 * 设置深度测试方式。
		 * @param value 深度测试方式
		 */
		 set depthTest(value:number) {
			this._shaderValues.setInt(TerrainMaterial.DEPTH_TEST, value);
		}
		
		/**
		 * 获取深度测试方式。
		 * @return 深度测试方式。
		 */
		 get depthTest():number {
			return this._shaderValues.getInt(TerrainMaterial.DEPTH_TEST);
		}
		
		constructor(){
			super();
			this.setShaderName("Terrain");
			this.renderMode = TerrainMaterial.RENDERMODE_OPAQUE;
			this._diffuseScale1 = new Vector2();
			this._diffuseScale2 = new Vector2();
			this._diffuseScale3 = new Vector2();
			this._diffuseScale4 = new Vector2();
			this.ambientColor = new Vector3(0.6, 0.6, 0.6);
			this.diffuseColor = new Vector3(1.0, 1.0, 1.0);
			this.specularColor = new Vector4(0.2, 0.2, 0.2, 32.0);
		}
	
	}


