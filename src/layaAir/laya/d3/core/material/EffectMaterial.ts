import { BaseTexture } from "../../../resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { BaseMaterial } from "./BaseMaterial";
import { RenderState } from "./RenderState";

/**
 * <code>EffectMaterial</code> 类用于实现Mesh特效材质。
 */
export class EffectMaterial extends BaseMaterial {
	/**渲染状态_加色法混合。*/
	static RENDERMODE_ADDTIVE: number = 0;
	/**渲染状态_透明混合。*/
	static RENDERMODE_ALPHABLENDED: number = 1;

	/** 默认材质，禁止修改*/
	static defaultMaterial: EffectMaterial;

	static SHADERDEFINE_MAINTEXTURE: number;
	static SHADERDEFINE_TILINGOFFSET: number;
	static SHADERDEFINE_ADDTIVEFOG: number;

	static MAINTEXTURE: number = Shader3D.propertyNameToID("u_AlbedoTexture");
	static TINTCOLOR: number = Shader3D.propertyNameToID("u_AlbedoColor");
	static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");
	static CULL: number = Shader3D.propertyNameToID("s_Cull");
	static BLEND: number = Shader3D.propertyNameToID("s_Blend");
	static BLEND_SRC: number = Shader3D.propertyNameToID("s_BlendSrc");
	static BLEND_DST: number = Shader3D.propertyNameToID("s_BlendDst");
	static DEPTH_TEST: number = Shader3D.propertyNameToID("s_DepthTest");
	static DEPTH_WRITE: number = Shader3D.propertyNameToID("s_DepthWrite");

	/**@internal */
	static shaderDefines: ShaderDefines = null;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		EffectMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
		EffectMaterial.SHADERDEFINE_MAINTEXTURE = EffectMaterial.shaderDefines.registerDefine("MAINTEXTURE");
		EffectMaterial.SHADERDEFINE_TILINGOFFSET = EffectMaterial.shaderDefines.registerDefine("TILINGOFFSET");
		EffectMaterial.SHADERDEFINE_ADDTIVEFOG = EffectMaterial.shaderDefines.registerDefine("ADDTIVEFOG");
	}

	/**@internal */
	private _color: Vector4;

	/**
	 * @internal
	 */
	get _TintColorR(): number {
		return this._color.x;
	}

	/**
	 * @internal
	 */
	set _TintColorR(value: number) {
		this._color.x = value;
		this.color = this._color;
	}

	/**
	 * @internal
	 */
	get _TintColorG(): number {
		return this._color.y;
	}

	/**
	 * @internal
	 */
	set _TintColorG(value: number) {
		this._color.y = value;
		this.color = this._color;
	}

	/**
	 * @internal
	 */
	get _TintColorB(): number {
		return this._color.z;
	}

	/**
	 * @internal
	 */
	set _TintColorB(value: number) {
		this._color.z = value;
		this.color = this._color;
	}

	/**@internal */
	get _TintColorA(): number {
		return this._color.w;
	}

	/**
	 * @internal
	 */
	set _TintColorA(value: number) {
		this._color.w = value;
		this.color = this._color;
	}

	/**
	 * @internal
	 */
	get _MainTex_STX(): number {
		return this._shaderValues.getVector(EffectMaterial.TILINGOFFSET).x;
	}

	/**
	 * @internal
	 */
	set _MainTex_STX(x: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(EffectMaterial.TILINGOFFSET));
		tilOff.x = x;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STY(): number {
		return this._shaderValues.getVector(EffectMaterial.TILINGOFFSET).y;
	}

	/**
	 * @internal
	 */
	set _MainTex_STY(y: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(EffectMaterial.TILINGOFFSET));
		tilOff.y = y;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STZ(): number {
		return this._shaderValues.getVector(EffectMaterial.TILINGOFFSET).z;
	}

	/**
	 * @internal
	 */
	set _MainTex_STZ(z: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(EffectMaterial.TILINGOFFSET));
		tilOff.z = z;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STW(): number {
		return this._shaderValues.getVector(EffectMaterial.TILINGOFFSET).w;
	}

	/**
	 * @internal
	 */
	set _MainTex_STW(w: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(EffectMaterial.TILINGOFFSET));
		tilOff.w = w;
		this.tilingOffset = tilOff;
	}

	/**
	 * 设置渲染模式。
	 * @return 渲染模式。
	 */
	set renderMode(value: number) {
		switch (value) {
			case EffectMaterial.RENDERMODE_ADDTIVE:
				this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				this.depthWrite = false;
				this.cull = RenderState.CULL_NONE;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				this._shaderValues.addDefine(EffectMaterial.SHADERDEFINE_ADDTIVEFOG);
				break;
			case EffectMaterial.RENDERMODE_ALPHABLENDED:
				this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				this.depthWrite = false;
				this.cull = RenderState.CULL_NONE;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				this._shaderValues.removeDefine(EffectMaterial.SHADERDEFINE_ADDTIVEFOG);
				break;
			default:
				throw new Error("MeshEffectMaterial : renderMode value error.");
		}
	}

	/**
	 * 获取颜色R分量。
	 * @return 颜色R分量。
	 */
	get colorR(): number {
		return this._TintColorR;
	}

	/**
	 * 设置颜色R分量。
	 * @param value 颜色R分量。
	 */
	set colorR(value: number) {
		this._TintColorR = value;
	}

	/**
	 * 获取颜色G分量。
	 * @return 颜色G分量。
	 */
	get colorG(): number {
		return this._TintColorG;
	}

	/**
	 * 设置颜色G分量。
	 * @param value 颜色G分量。
	 */
	set colorG(value: number) {
		this._TintColorG = value;
	}

	/**
	 * 获取颜色B分量。
	 * @return 颜色B分量。
	 */
	get colorB(): number {
		return this._TintColorB;
	}

	/**
	 * 设置颜色B分量。
	 * @param value 颜色B分量。
	 */
	set colorB(value: number) {
		this._TintColorB = value;
	}

	/**
	 * 获取颜色Z分量。
	 * @return 颜色Z分量。
	 */
	get colorA(): number {
		return this._TintColorA;
	}

	/**
	 * 设置颜色alpha分量。
	 * @param value 颜色alpha分量。
	 */
	set colorA(value: number) {
		this._TintColorA = value;
	}

	/**
	 * 获取颜色。
	 * @return 颜色。
	 */
	get color(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(EffectMaterial.TINTCOLOR));
	}

	/**
	 * 设置颜色。
	 * @param value 颜色。
	 */
	set color(value: Vector4) {
		this._shaderValues.setVector(EffectMaterial.TINTCOLOR, value);
	}

	/**
	 * 获取贴图。
	 * @return 贴图。
	 */
	get texture(): BaseTexture {
		return this._shaderValues.getTexture(EffectMaterial.MAINTEXTURE);
	}

	/**
	 * 设置贴图。
	 * @param value 贴图。
	 */
	set texture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(EffectMaterial.SHADERDEFINE_MAINTEXTURE);
		else
			this._shaderValues.removeDefine(EffectMaterial.SHADERDEFINE_MAINTEXTURE);
		this._shaderValues.setTexture(EffectMaterial.MAINTEXTURE, value);
	}

	/**
	 * 获取纹理平铺和偏移X分量。
	 * @return 纹理平铺和偏移X分量。
	 */
	get tilingOffsetX(): number {
		return this._MainTex_STX;
	}

	/**
	 * 获取纹理平铺和偏移X分量。
	 * @param x 纹理平铺和偏移X分量。
	 */
	set tilingOffsetX(x: number) {
		this._MainTex_STX = x;
	}

	/**
	 * 获取纹理平铺和偏移Y分量。
	 * @return 纹理平铺和偏移Y分量。
	 */
	get tilingOffsetY(): number {
		return this._MainTex_STY;
	}

	/**
	 * 获取纹理平铺和偏移Y分量。
	 * @param y 纹理平铺和偏移Y分量。
	 */
	set tilingOffsetY(y: number) {
		this._MainTex_STY = y;
	}

	/**
	 * 获取纹理平铺和偏移Z分量。
	 * @return 纹理平铺和偏移Z分量。
	 */
	get tilingOffsetZ(): number {
		return this._MainTex_STZ;
	}

	/**
	 * 获取纹理平铺和偏移Z分量。
	 * @param z 纹理平铺和偏移Z分量。
	 */
	set tilingOffsetZ(z: number) {
		this._MainTex_STZ = z;
	}

	/**
	 * 获取纹理平铺和偏移W分量。
	 * @return 纹理平铺和偏移W分量。
	 */
	get tilingOffsetW(): number {
		return this._MainTex_STW;
	}

	/**
	 * 获取纹理平铺和偏移W分量。
	 * @param w 纹理平铺和偏移W分量。
	 */
	set tilingOffsetW(w: number) {
		this._MainTex_STW = w;
	}

	/**
	 * 获取纹理平铺和偏移。
	 * @return 纹理平铺和偏移。
	 */
	get tilingOffset(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(EffectMaterial.TILINGOFFSET));
	}

	/**
	 * 设置纹理平铺和偏移。
	 * @param value 纹理平铺和偏移。
	 */
	set tilingOffset(value: Vector4) {
		if (value) {
			if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
				this._shaderValues.addDefine(EffectMaterial.SHADERDEFINE_TILINGOFFSET);
			else
				this._shaderValues.removeDefine(EffectMaterial.SHADERDEFINE_TILINGOFFSET);
		} else {
			this._shaderValues.removeDefine(EffectMaterial.SHADERDEFINE_TILINGOFFSET);
		}
		this._shaderValues.setVector(EffectMaterial.TILINGOFFSET, value);
	}

	/**
	 * 设置是否写入深度。
	 * @param value 是否写入深度。
	 */
	set depthWrite(value: boolean) {
		this._shaderValues.setBool(EffectMaterial.DEPTH_WRITE, value);
	}

	/**
	 * 获取是否写入深度。
	 * @return 是否写入深度。
	 */
	get depthWrite(): boolean {
		return this._shaderValues.getBool(EffectMaterial.DEPTH_WRITE);
	}

	/**
	 * 设置剔除方式。
	 * @param value 剔除方式。
	 */
	set cull(value: number) {
		this._shaderValues.setInt(EffectMaterial.CULL, value);
	}

	/**
	 * 获取剔除方式。
	 * @return 剔除方式。
	 */
	get cull(): number {
		return this._shaderValues.getInt(EffectMaterial.CULL);
	}

	/**
	 * 设置混合方式。
	 * @param value 混合方式。
	 */
	set blend(value: number) {
		this._shaderValues.setInt(EffectMaterial.BLEND, value);
	}

	/**
	 * 获取混合方式。
	 * @return 混合方式。
	 */
	get blend(): number {
		return this._shaderValues.getInt(EffectMaterial.BLEND);
	}

	/**
	 * 设置混合源。
	 * @param value 混合源
	 */
	set blendSrc(value: number) {
		this._shaderValues.setInt(EffectMaterial.BLEND_SRC, value);
	}

	/**
	 * 获取混合源。
	 * @return 混合源。
	 */
	get blendSrc(): number {
		return this._shaderValues.getInt(EffectMaterial.BLEND_SRC);
	}

	/**
	 * 设置混合目标。
	 * @param value 混合目标
	 */
	set blendDst(value: number) {
		this._shaderValues.setInt(EffectMaterial.BLEND_DST, value);
	}

	/**
	 * 获取混合目标。
	 * @return 混合目标。
	 */
	get blendDst(): number {
		return this._shaderValues.getInt(EffectMaterial.BLEND_DST);
	}

	/**
	 * 设置深度测试方式。
	 * @param value 深度测试方式
	 */
	set depthTest(value: number) {
		this._shaderValues.setInt(EffectMaterial.DEPTH_TEST, value);
	}

	/**
	 * 获取深度测试方式。
	 * @return 深度测试方式。
	 */
	get depthTest(): number {
		return this._shaderValues.getInt(EffectMaterial.DEPTH_TEST);
	}

	constructor() {
		super();
		this.setShaderName("Effect");
		this._color = new Vector4(1.0, 1.0, 1.0, 1.0);
		this._shaderValues.setVector(EffectMaterial.TINTCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
		this.renderMode = EffectMaterial.RENDERMODE_ADDTIVE;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var dest: EffectMaterial = new EffectMaterial();
		this.cloneTo(dest);
		return dest;
	}
}

