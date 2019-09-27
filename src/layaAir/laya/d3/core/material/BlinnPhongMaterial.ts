import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderData } from "../../shader/ShaderData";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { Material } from "./Material";
import { RenderState } from "./RenderState";
import { BaseTexture } from "../../../resource/BaseTexture";
import { ShaderDefine } from "../../shader/ShaderDefine";

/**
 * <code>BlinnPhongMaterial</code> 类用于实现Blinn-Phong材质。
 */
export class BlinnPhongMaterial extends Material {
	/**高光强度数据源_漫反射贴图的Alpha通道。*/
	static SPECULARSOURCE_DIFFUSEMAPALPHA: number;
	/**高光强度数据源_高光贴图的RGB通道。*/
	static SPECULARSOURCE_SPECULARMAP: number;

	/**渲染状态_不透明。*/
	static RENDERMODE_OPAQUE: number = 0;
	/**渲染状态_阿尔法测试。*/
	static RENDERMODE_CUTOUT: number = 1;
	/**渲染状态_透明混合。*/
	static RENDERMODE_TRANSPARENT: number = 2;

	static SHADERDEFINE_DIFFUSEMAP: ShaderDefine;
	static SHADERDEFINE_NORMALMAP: ShaderDefine;
	static SHADERDEFINE_SPECULARMAP: ShaderDefine;
	static SHADERDEFINE_TILINGOFFSET: ShaderDefine;
	static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;

	static ALBEDOTEXTURE: number = Shader3D.propertyNameToID("u_DiffuseTexture");
	static NORMALTEXTURE: number = Shader3D.propertyNameToID("u_NormalTexture");
	static SPECULARTEXTURE: number = Shader3D.propertyNameToID("u_SpecularTexture");
	static ALBEDOCOLOR: number = Shader3D.propertyNameToID("u_DiffuseColor");
	static MATERIALSPECULAR: number = Shader3D.propertyNameToID("u_MaterialSpecular");
	static SHININESS: number = Shader3D.propertyNameToID("u_Shininess");
	static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");
	static CULL: number = Shader3D.propertyNameToID("s_Cull");
	static BLEND: number = Shader3D.propertyNameToID("s_Blend");
	static BLEND_SRC: number = Shader3D.propertyNameToID("s_BlendSrc");
	static BLEND_DST: number = Shader3D.propertyNameToID("s_BlendDst");
	static DEPTH_TEST: number = Shader3D.propertyNameToID("s_DepthTest");
	static DEPTH_WRITE: number = Shader3D.propertyNameToID("s_DepthWrite");

	/** 默认材质，禁止修改*/
	static defaultMaterial: BlinnPhongMaterial;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP = Shader3D.getDefineByName("DIFFUSEMAP");
		BlinnPhongMaterial.SHADERDEFINE_NORMALMAP = Shader3D.getDefineByName("NORMALMAP");
		BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP = Shader3D.getDefineByName("SPECULARMAP");
		BlinnPhongMaterial.SHADERDEFINE_TILINGOFFSET = Shader3D.getDefineByName("TILINGOFFSET");
		BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");
	}

	private _albedoColor: Vector4;
	private _albedoIntensity: number;
	private _enableLighting: boolean;
	private _enableVertexColor: boolean = false;

	/**
	 * @internal
	 */
	get _ColorR(): number {
		return this._albedoColor.x;
	}

	set _ColorR(value: number) {
		this._albedoColor.x = value;
		this.albedoColor = this._albedoColor;
	}

	/**
	 * @internal
	 */
	get _ColorG(): number {
		return this._albedoColor.y;
	}

	set _ColorG(value: number) {
		this._albedoColor.y = value;
		this.albedoColor = this._albedoColor;
	}

	/**
	 * @internal
	 */
	get _ColorB(): number {
		return this._albedoColor.z;
	}

	set _ColorB(value: number) {
		this._albedoColor.z = value;
		this.albedoColor = this._albedoColor;
	}

	/**
	 * @internal
	 */
	get _ColorA(): number {
		return this._albedoColor.w;
	}

	set _ColorA(value: number) {
		this._albedoColor.w = value;
		this.albedoColor = this._albedoColor;
	}

	/**
	 * @internal
	 */
	get _SpecColorR(): number {
		return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).x;
	}

	set _SpecColorR(value: number) {
		this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).x = value;
	}

	/**
	 * @internal
	 */
	get _SpecColorG(): number {
		return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).y;
	}

	set _SpecColorG(value: number) {
		this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).y = value;
	}

	/**
	 * @internal
	 */
	get _SpecColorB(): number {
		return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).z;
	}

	set _SpecColorB(value: number) {
		this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).z = value;
	}

	/**
	 * @internal
	 */
	get _SpecColorA(): number {
		return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).w;
	}

	set _SpecColorA(value: number) {
		this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).w = value;
	}

	/**
	 * @internal
	 */
	get _AlbedoIntensity(): number {
		return this._albedoIntensity;
	}

	set _AlbedoIntensity(value: number) {
		if (this._albedoIntensity !== value) {
			var finalAlbedo: Vector4 = (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.ALBEDOCOLOR));
			Vector4.scale(this._albedoColor, value, finalAlbedo);
			this._albedoIntensity = value;
			this._shaderValues.setVector(BlinnPhongMaterial.ALBEDOCOLOR, finalAlbedo);//修改值后必须调用此接口,否则NATIVE不生效
		}
	}

	/**
	 * @internal
	 */
	get _Shininess(): number {
		return this._shaderValues.getNumber(BlinnPhongMaterial.SHININESS);
	}

	set _Shininess(value: number) {
		value = Math.max(0.0, Math.min(1.0, value));
		this._shaderValues.setNumber(BlinnPhongMaterial.SHININESS, value);
	}

	/**
	 * @internal
	 */
	get _MainTex_STX(): number {
		return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).x;
	}

	set _MainTex_STX(x: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET));
		tilOff.x = x;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STY(): number {
		return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).y;
	}

	set _MainTex_STY(y: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET));
		tilOff.y = y;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STZ(): number {
		return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).z;
	}

	set _MainTex_STZ(z: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET));
		tilOff.z = z;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STW(): number {
		return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).w;
	}

	set _MainTex_STW(w: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET));
		tilOff.w = w;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _Cutoff(): number {
		return this.alphaTestValue;
	}

	set _Cutoff(value: number) {
		this.alphaTestValue = value;
	}

	/**
	 * 设置渲染模式。
	 */
	set renderMode(value: number) {
		switch (value) {
			case BlinnPhongMaterial.RENDERMODE_OPAQUE:
				this.alphaTest = false;
				this.renderQueue = Material.RENDERQUEUE_OPAQUE;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case BlinnPhongMaterial.RENDERMODE_CUTOUT:
				this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
				this.alphaTest = true;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case BlinnPhongMaterial.RENDERMODE_TRANSPARENT:
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
				throw new Error("Material:renderMode value error.");
		}
	}

	/**
	 * 是否支持顶点色。
	 */
	get enableVertexColor(): boolean {
		return this._enableVertexColor;
	}

	set enableVertexColor(value: boolean) {
		this._enableVertexColor = value;
		if (value)
			this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
		else
			this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	}

	/**
	 * 纹理平铺和偏移X分量。
	 */
	get tilingOffsetX(): number {
		return this._MainTex_STX;
	}

	set tilingOffsetX(x: number) {
		this._MainTex_STX = x;
	}

	/**
	 * 纹理平铺和偏移Y分量。
	 */
	get tilingOffsetY(): number {
		return this._MainTex_STY;
	}

	set tilingOffsetY(y: number) {
		this._MainTex_STY = y;
	}

	/**
	 * 纹理平铺和偏移Z分量。
	 */
	get tilingOffsetZ(): number {
		return this._MainTex_STZ;
	}

	set tilingOffsetZ(z: number) {
		this._MainTex_STZ = z;
	}

	/**
	 * 纹理平铺和偏移W分量。
	 */
	get tilingOffsetW(): number {
		return this._MainTex_STW;
	}

	set tilingOffsetW(w: number) {
		this._MainTex_STW = w;
	}

	/**
	 * 纹理平铺和偏移。
	 */
	get tilingOffset(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET));
	}

	set tilingOffset(value: Vector4) {
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
	 * 反照率颜色R分量。
	 */
	get albedoColorR(): number {
		return this._ColorR;
	}

	set albedoColorR(value: number) {
		this._ColorR = value;
	}

	/**
	 * 反照率颜色G分量。
	 */
	get albedoColorG(): number {
		return this._ColorG;
	}

	set albedoColorG(value: number) {
		this._ColorG = value;
	}

	/**
	 * 反照率颜色B分量。
	 */
	get albedoColorB(): number {
		return this._ColorB;
	}

	set albedoColorB(value: number) {
		this._ColorB = value;
	}

	/**
	 * 反照率颜色Z分量。
	 */
	get albedoColorA(): number {
		return this._ColorA;
	}

	set albedoColorA(value: number) {
		this._ColorA = value;
	}

	/**
	 * 反照率颜色。
	 */
	get albedoColor(): Vector4 {
		return this._albedoColor;
	}

	set albedoColor(value: Vector4) {
		var finalAlbedo: Vector4 = (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.ALBEDOCOLOR));
		Vector4.scale(value, this._albedoIntensity, finalAlbedo);
		this._albedoColor = value;
		this._shaderValues.setVector(BlinnPhongMaterial.ALBEDOCOLOR, finalAlbedo);//修改值后必须调用此接口,否则NATIVE不生效
	}

	/**
	 * 反照率强度。
	 */
	get albedoIntensity(): number {
		return this._albedoIntensity;
	}

	set albedoIntensity(value: number) {
		this._AlbedoIntensity = value;
	}

	/**
	 * 高光颜色R轴分量。
	 */
	get specularColorR(): number {
		return this._SpecColorR;
	}

	set specularColorR(value: number) {
		this._SpecColorR = value;
	}

	/**
	 * 高光颜色G分量。
	 */
	get specularColorG(): number {
		return this._SpecColorG;
	}

	set specularColorG(value: number) {
		this._SpecColorG = value;
	}

	/**
	 * 高光颜色B分量。
	 */
	get specularColorB(): number {
		return this._SpecColorB;
	}

	set specularColorB(value: number) {
		this._SpecColorB = value;
	}

	/**
	 * 高光颜色A分量。
	 */
	get specularColorA(): number {
		return this._SpecColorA;
	}

	set specularColorA(value: number) {
		this._SpecColorA = value;
	}

	/**
	 * 高光颜色。
	 */
	get specularColor(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR));
	}

	set specularColor(value: Vector4) {
		this._shaderValues.setVector(BlinnPhongMaterial.MATERIALSPECULAR, value);
	}

	/**
	 * 高光强度,范围为0到1。
	 */
	get shininess(): number {
		return this._Shininess;
	}

	set shininess(value: number) {
		this._Shininess = value;
	}

	/**
	 * 反照率贴图。
	 */
	get albedoTexture(): BaseTexture {
		return this._shaderValues.getTexture(BlinnPhongMaterial.ALBEDOTEXTURE);
	}

	set albedoTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP);
		else
			this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP);
		this._shaderValues.setTexture(BlinnPhongMaterial.ALBEDOTEXTURE, value);
	}

	/**
	 * 法线贴图。
	 */
	get normalTexture(): BaseTexture {
		return this._shaderValues.getTexture(BlinnPhongMaterial.NORMALTEXTURE);
	}

	set normalTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_NORMALMAP);
		else
			this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_NORMALMAP);
		this._shaderValues.setTexture(BlinnPhongMaterial.NORMALTEXTURE, value);
	}

	/**
	 * 高光贴图。
	 */
	get specularTexture(): BaseTexture {
		return this._shaderValues.getTexture(BlinnPhongMaterial.SPECULARTEXTURE);
	}

	set specularTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP);
		else
			this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP);

		this._shaderValues.setTexture(BlinnPhongMaterial.SPECULARTEXTURE, value);
	}

	/**
	 * 是否启用光照。
	 */
	get enableLighting(): boolean {
		return this._enableLighting;
	}

	set enableLighting(value: boolean) {
		if (this._enableLighting !== value) {
			if (value) {
				this._disablePublicDefineDatas.remove(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
				this._disablePublicDefineDatas.remove(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT);
				this._disablePublicDefineDatas.remove(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
			}
			else {
				this._disablePublicDefineDatas.add(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
				this._disablePublicDefineDatas.add(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT);
				this._disablePublicDefineDatas.add(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
			}
			this._enableLighting = value;
		}
	}



	/**
	 * 是否写入深度。
	 */
	get depthWrite(): boolean {
		return this._shaderValues.getBool(BlinnPhongMaterial.DEPTH_WRITE);
	}

	set depthWrite(value: boolean) {
		this._shaderValues.setBool(BlinnPhongMaterial.DEPTH_WRITE, value);
	}

	/**
	 * 剔除方式。
	 */
	get cull(): number {
		return this._shaderValues.getInt(BlinnPhongMaterial.CULL);
	}

	set cull(value: number) {
		this._shaderValues.setInt(BlinnPhongMaterial.CULL, value);
	}


	/**
	 * 混合方式。
	 */
	get blend(): number {
		return this._shaderValues.getInt(BlinnPhongMaterial.BLEND);
	}

	set blend(value: number) {
		this._shaderValues.setInt(BlinnPhongMaterial.BLEND, value);
	}


	/**
	 * 混合源。
	 */
	get blendSrc(): number {
		return this._shaderValues.getInt(BlinnPhongMaterial.BLEND_SRC);
	}

	set blendSrc(value: number) {
		this._shaderValues.setInt(BlinnPhongMaterial.BLEND_SRC, value);
	}

	/**
	 * 混合目标。
	 */
	get blendDst(): number {
		return this._shaderValues.getInt(BlinnPhongMaterial.BLEND_DST);
	}

	set blendDst(value: number) {
		this._shaderValues.setInt(BlinnPhongMaterial.BLEND_DST, value);
	}

	/**
	 * 深度测试方式。
	 */
	get depthTest(): number {
		return this._shaderValues.getInt(BlinnPhongMaterial.DEPTH_TEST);
	}

	set depthTest(value: number) {
		this._shaderValues.setInt(BlinnPhongMaterial.DEPTH_TEST, value);
	}


	/**
	 * 创建一个 <code>BlinnPhongMaterial</code> 实例。
	 */
	constructor() {
		super();
		this.setShaderName("BLINNPHONG");
		this._albedoIntensity = 1.0;
		this._albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
		var sv: ShaderData = this._shaderValues;
		sv.setVector(BlinnPhongMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
		sv.setVector(BlinnPhongMaterial.MATERIALSPECULAR, new Vector4(1.0, 1.0, 1.0, 1.0));
		sv.setNumber(BlinnPhongMaterial.SHININESS, 0.078125);
		sv.setNumber(Material.ALPHATESTVALUE, 0.5);
		sv.setVector(BlinnPhongMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
		this._enableLighting = true;
		this.renderMode = BlinnPhongMaterial.RENDERMODE_OPAQUE;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
	clone(): any {
		var dest: BlinnPhongMaterial = new BlinnPhongMaterial();
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		var destMaterial: BlinnPhongMaterial = (<BlinnPhongMaterial>destObject);
		destMaterial._enableLighting = this._enableLighting;
		destMaterial._albedoIntensity = this._albedoIntensity;
		destMaterial._enableVertexColor = this._enableVertexColor;
		this._albedoColor.cloneTo(destMaterial._albedoColor);
	}
}


