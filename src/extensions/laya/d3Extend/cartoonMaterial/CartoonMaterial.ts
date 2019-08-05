import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { RenderState } from "laya/d3/core/material/RenderState";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Vector4 } from "laya/d3/math/Vector4";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { ShaderPass } from "laya/d3/shader/ShaderPass";
import { SubShader } from "laya/d3/shader/SubShader";
import { BaseTexture } from "laya/resource/BaseTexture";
import { ShaderDefine } from "laya/d3/shader/ShaderDefine";
import CartoonFS from "./shader/cartoon.fs";
import CartoonVS from "./shader/cartoon.vs";
import OutlineFS from "./shader/outline.fs";
import OutlineVS from "./shader/outline.vs";

export class CartoonMaterial extends BaseMaterial {

	static ALBEDOTEXTURE: number = Shader3D.propertyNameToID("u_AlbedoTexture");
	static BLENDTEXTURE: number = Shader3D.propertyNameToID("u_BlendTexture");
	static OUTLINETEXTURE: number = Shader3D.propertyNameToID("u_OutlineTexture");
	static SHADOWCOLOR: number = Shader3D.propertyNameToID("u_ShadowColor");
	static SHADOWRANGE: number = Shader3D.propertyNameToID("u_ShadowRange");
	static SHADOWINTENSITY: number = Shader3D.propertyNameToID("u_ShadowIntensity");
	static SPECULARRANGE: number = Shader3D.propertyNameToID("u_SpecularRange");
	static SPECULARINTENSITY: number = Shader3D.propertyNameToID("u_SpecularIntensity");
	static OUTLINEWIDTH: number = Shader3D.propertyNameToID("u_OutlineWidth");
	static OUTLINELIGHTNESS: number = Shader3D.propertyNameToID("u_OutlineLightness");
	static TILINGOFFSET: number;

	static SHADERDEFINE_ALBEDOTEXTURE: ShaderDefine;
	static SHADERDEFINE_BLENDTEXTURE: ShaderDefine;
	static SHADERDEFINE_OUTLINETEXTURE: ShaderDefine;
	static SHADERDEFINE_TILINGOFFSET: ShaderDefine;

	/**
	 * @private
	 */
	static __init__(): void {
		CartoonMaterial.SHADERDEFINE_ALBEDOTEXTURE = Shader3D.getDefineByName("ALBEDOTEXTURE");
		CartoonMaterial.SHADERDEFINE_BLENDTEXTURE = Shader3D.getDefineByName("BLENDTEXTURE");
		CartoonMaterial.SHADERDEFINE_OUTLINETEXTURE = Shader3D.getDefineByName("OUTLINETEXTURE");
		CartoonMaterial.SHADERDEFINE_TILINGOFFSET = Shader3D.getDefineByName("TILINGOFFSET");
	}

	static initShader(): void {

		CartoonMaterial.__init__();

		var attributeMap: any =
		{
			'a_Position': VertexMesh.MESH_POSITION0,
			'a_Normal': VertexMesh.MESH_NORMAL0,
			'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0
		};
		var uniformMap: any =
		{
			'u_MvpMatrix': Shader3D.PERIOD_SPRITE,
			'u_WorldMat': Shader3D.PERIOD_SPRITE,
			'u_CameraPos': Shader3D.PERIOD_CAMERA,
			'u_AlbedoTexture': Shader3D.PERIOD_MATERIAL,
			'u_BlendTexture': Shader3D.PERIOD_MATERIAL,
			'u_OutlineTexture': Shader3D.PERIOD_MATERIAL,
			'u_ShadowColor': Shader3D.PERIOD_MATERIAL,
			'u_ShadowRange': Shader3D.PERIOD_MATERIAL,
			'u_ShadowIntensity': Shader3D.PERIOD_MATERIAL,
			'u_SpecularRange': Shader3D.PERIOD_MATERIAL,
			'u_SpecularIntensity': Shader3D.PERIOD_MATERIAL,
			'u_OutlineWidth': Shader3D.PERIOD_MATERIAL,
			'u_OutlineLightness': Shader3D.PERIOD_MATERIAL,
			'u_DirectionLight.Direction': Shader3D.PERIOD_SCENE,
			'u_DirectionLight.Color': Shader3D.PERIOD_SCENE
		};
		var cartoonShader3D: Shader3D = Shader3D.add("CartoonShader");
		var subShader: SubShader = new SubShader(attributeMap, uniformMap);
		cartoonShader3D.addSubShader(subShader);
		var pass1: ShaderPass = subShader.addShaderPass(OutlineVS, OutlineFS);
		pass1.renderState.cull = RenderState.CULL_FRONT;

		subShader.addShaderPass(CartoonVS, CartoonFS);
	}

	/**
	 * 获取漫反射贴图。
	 * @return 漫反射贴图。
	 */
	get albedoTexture(): BaseTexture {
		return this._shaderValues.getTexture(CartoonMaterial.ALBEDOTEXTURE);
	}

	/**
	 * 设置漫反射贴图。
	 * @param value 漫反射贴图。
	 */
	set albedoTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(CartoonMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		else
			this._shaderValues.removeDefine(CartoonMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		this._shaderValues.setTexture(CartoonMaterial.ALBEDOTEXTURE, value);
	}

	/**
	 * 获取混合贴图。
	 * @return 混合贴图。
	 */
	get blendTexture(): BaseTexture {
		return this._shaderValues.getTexture(CartoonMaterial.BLENDTEXTURE);
	}

	/**
	 * 设置混合贴图。
	 * @param value 混合贴图。
	 */
	set blendTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(CartoonMaterial.SHADERDEFINE_BLENDTEXTURE);
		else
			this._shaderValues.removeDefine(CartoonMaterial.SHADERDEFINE_BLENDTEXTURE);
		this._shaderValues.setTexture(CartoonMaterial.BLENDTEXTURE, value);
	}

	/**
	 * 获取漫轮廓贴图。
	 * @return 轮廓贴图。
	 */
	get outlineTexture(): BaseTexture {
		return this._shaderValues.getTexture(CartoonMaterial.OUTLINETEXTURE);
	}

	/**
	 * 设置轮廓贴图。
	 * @param value 轮廓贴图。
	 */
	set outlineTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(CartoonMaterial.SHADERDEFINE_OUTLINETEXTURE);
		else
			this._shaderValues.removeDefine(CartoonMaterial.SHADERDEFINE_OUTLINETEXTURE);
		this._shaderValues.setTexture(CartoonMaterial.OUTLINETEXTURE, value);
	}

	/**
	 * 获取阴影颜色。
	 * @return 阴影颜色。
	 */
	get shadowColor(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(CartoonMaterial.SHADOWCOLOR));
	}

	/**
	 * 设置阴影颜色。
	 * @param value 阴影颜色。
	 */
	set shadowColor(value: Vector4) {
		this._shaderValues.setVector(CartoonMaterial.SHADOWCOLOR, value);
	}

	/**
	 * 获取阴影范围。
	 * @return 阴影范围,范围为0到1。
	 */
	get shadowRange(): number {
		return this._shaderValues.getNumber(CartoonMaterial.SHADOWRANGE);
	}

	/**
	 * 设置阴影范围。
	 * @param value 阴影范围,范围为0到1。
	 */
	set shadowRange(value: number) {
		value = Math.max(0.0, Math.min(1.0, value));
		this._shaderValues.setNumber(CartoonMaterial.SHADOWRANGE, value);
	}

	/**
	 * 获取阴影强度。
	 * @return 阴影强度,范围为0到1。
	 */
	get shadowIntensity(): number {
		return this._shaderValues.getNumber(CartoonMaterial.SHADOWINTENSITY);
	}

	/**
	 * 设置阴影强度。
	 * @param value 阴影强度,范围为0到1。
	 */
	set shadowIntensity(value: number) {
		value = Math.max(0.0, Math.min(1.0, value));
		this._shaderValues.setNumber(CartoonMaterial.SHADOWINTENSITY, value);
	}

	/**
	 * 获取高光范围。
	 * @return 高光范围,范围为0.9到1。
	 */
	get specularRange(): number {
		return this._shaderValues.getNumber(CartoonMaterial.SPECULARRANGE);
	}

	/**
	 * 设置高光范围。
	 * @param value 高光范围,范围为0.9到1。
	 */
	set specularRange(value: number) {
		value = Math.max(0.9, Math.min(1.0, value));
		this._shaderValues.setNumber(CartoonMaterial.SPECULARRANGE, value);
	}

	/**
	 * 获取高光强度。
	 * @return 高光强度,范围为0到1。
	 */
	get specularIntensity(): number {
		return this._shaderValues.getNumber(CartoonMaterial.SPECULARINTENSITY);
	}

	/**
	 * 获取轮廓宽度。
	 * @return 轮廓宽度,范围为0到0.05。
	 */
	get outlineWidth(): number {
		return this._shaderValues.getNumber(CartoonMaterial.OUTLINEWIDTH);
	}

	/**
	 * 设置轮廓宽度。
	 * @param value 轮廓宽度,范围为0到0.05。
	 */
	set outlineWidth(value: number) {
		value = Math.max(0.0, Math.min(0.05, value));
		this._shaderValues.setNumber(CartoonMaterial.OUTLINEWIDTH, value);
	}

	/**
	 * 获取轮廓亮度。
	 * @return 轮廓亮度,范围为0到1。
	 */
	get outlineLightness(): number {
		return this._shaderValues.getNumber(CartoonMaterial.OUTLINELIGHTNESS);
	}

	/**
	 * 设置轮廓亮度。
	 * @param value 轮廓亮度,范围为0到1。
	 */
	set outlineLightness(value: number) {
		value = Math.max(0.0, Math.min(1.0, value));
		this._shaderValues.setNumber(CartoonMaterial.OUTLINELIGHTNESS, value);
	}

	/**
	 * 设置高光强度。
	 * @param value 高光范围,范围为0到1。
	 */
	set specularIntensity(value: number) {
		value = Math.max(0.0, Math.min(1.0, value));
		this._shaderValues.setNumber(CartoonMaterial.SPECULARINTENSITY, value);
	}

	/**
	 * 获取纹理平铺和偏移。
	 * @return 纹理平铺和偏移。
	 */
	get tilingOffset(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(CartoonMaterial.TILINGOFFSET));
	}

	/**
	 * 设置纹理平铺和偏移。
	 * @param value 纹理平铺和偏移。
	 */
	set tilingOffset(value: Vector4) {
		if (value) {
			if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
				this._shaderValues.addDefine(CartoonMaterial.SHADERDEFINE_TILINGOFFSET);
			else
				this._shaderValues.removeDefine(CartoonMaterial.SHADERDEFINE_TILINGOFFSET);
		} else {
			this._shaderValues.removeDefine(CartoonMaterial.SHADERDEFINE_TILINGOFFSET);
		}
		this._shaderValues.setVector(CartoonMaterial.TILINGOFFSET, value);
	}

	constructor() {
		super();
		this.setShaderName("CartoonShader");
		this._shaderValues.setVector(CartoonMaterial.SHADOWCOLOR, new Vector4(0.6663285, 0.6544118, 1, 1));
		this._shaderValues.setNumber(CartoonMaterial.SHADOWRANGE, 0);
		this._shaderValues.setNumber(CartoonMaterial.SHADOWINTENSITY, 0.7956449);
		this._shaderValues.setNumber(CartoonMaterial.SPECULARRANGE, 0.9820514);
		this._shaderValues.setNumber(CartoonMaterial.SPECULARINTENSITY, 1);
		this._shaderValues.setNumber(CartoonMaterial.OUTLINEWIDTH, 0.01581197);
		this._shaderValues.setNumber(CartoonMaterial.OUTLINELIGHTNESS, 1);
	}

	/**
	 * @override
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var dest: CartoonMaterial = new CartoonMaterial();
		this.cloneTo(dest);
		return dest;
	}
}

