import { BaseTexture } from "../../../resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { Material } from "./Material";
import { RenderState } from "./RenderState";
import { ShaderDefine } from "../../shader/ShaderDefine";

/**
 * <code>EffectMaterial</code> 类用于实现Mesh特效材质。
 */
export class EffectMaterial extends Material {
	/**渲染状态_加色法混合。*/
	static RENDERMODE_ADDTIVE: number = 0;
	/**渲染状态_透明混合。*/
	static RENDERMODE_ALPHABLENDED: number = 1;

	/** 默认材质，禁止修改*/
	static defaultMaterial: EffectMaterial;

	static SHADERDEFINE_MAINTEXTURE: ShaderDefine;
	static SHADERDEFINE_TILINGOFFSET: ShaderDefine;
	static SHADERDEFINE_ADDTIVEFOG: ShaderDefine;

	static MAINTEXTURE: number = Shader3D.propertyNameToID("u_AlbedoTexture");
	static TINTCOLOR: number = Shader3D.propertyNameToID("u_AlbedoColor");
	static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");
	static CULL: number = Shader3D.propertyNameToID("s_Cull");
	static BLEND: number = Shader3D.propertyNameToID("s_Blend");
	static BLEND_SRC: number = Shader3D.propertyNameToID("s_BlendSrc");
	static BLEND_DST: number = Shader3D.propertyNameToID("s_BlendDst");
	static DEPTH_TEST: number = Shader3D.propertyNameToID("s_DepthTest");
	static DEPTH_WRITE: number = Shader3D.propertyNameToID("s_DepthWrite");

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		EffectMaterial.SHADERDEFINE_MAINTEXTURE = Shader3D.getDefineByName("MAINTEXTURE");
		EffectMaterial.SHADERDEFINE_TILINGOFFSET = Shader3D.getDefineByName("TILINGOFFSET");
		EffectMaterial.SHADERDEFINE_ADDTIVEFOG = Shader3D.getDefineByName("ADDTIVEFOG");
	}

	private _color: Vector4;

	/**
	 * @internal
	 */
	get _TintColorR(): number {
		return this._color.x;
	}

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

	set _TintColorB(value: number) {
		this._color.z = value;
		this.color = this._color;
	}

	/**@internal */
	get _TintColorA(): number {
		return this._color.w;
	}

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

	set _MainTex_STW(w: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(EffectMaterial.TILINGOFFSET));
		tilOff.w = w;
		this.tilingOffset = tilOff;
	}

	/**
	 * 设置渲染模式。
	 */
	set renderMode(value: number) {
		switch (value) {
			case EffectMaterial.RENDERMODE_ADDTIVE:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
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
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
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
	 * 颜色R分量。
	 */
	get colorR(): number {
		return this._TintColorR;
	}

	set colorR(value: number) {
		this._TintColorR = value;
	}

	/**
	 * 颜色G分量。
	 */
	get colorG(): number {
		return this._TintColorG;
	}

	set colorG(value: number) {
		this._TintColorG = value;
	}

	/**
	 * 颜色B分量。
	 */
	get colorB(): number {
		return this._TintColorB;
	}

	set colorB(value: number) {
		this._TintColorB = value;
	}

	/**
	 * 颜色A分量。
	 */
	get colorA(): number {
		return this._TintColorA;
	}

	set colorA(value: number) {
		this._TintColorA = value;
	}

	/**
	 * 获取颜色。
	 */
	get color(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(EffectMaterial.TINTCOLOR));
	}

	set color(value: Vector4) {
		this._shaderValues.setVector(EffectMaterial.TINTCOLOR, value);
	}

	/**
	 * 贴图。
	 */
	get texture(): BaseTexture {
		return this._shaderValues.getTexture(EffectMaterial.MAINTEXTURE);
	}

	set texture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(EffectMaterial.SHADERDEFINE_MAINTEXTURE);
		else
			this._shaderValues.removeDefine(EffectMaterial.SHADERDEFINE_MAINTEXTURE);
		this._shaderValues.setTexture(EffectMaterial.MAINTEXTURE, value);
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
		return (<Vector4>this._shaderValues.getVector(EffectMaterial.TILINGOFFSET));
	}

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
	 * 是否写入深度。
	 */
	get depthWrite(): boolean {
		return this._shaderValues.getBool(EffectMaterial.DEPTH_WRITE);
	}

	set depthWrite(value: boolean) {
		this._shaderValues.setBool(EffectMaterial.DEPTH_WRITE, value);
	}

	/**
	 * 剔除方式。
	 */
	get cull(): number {
		return this._shaderValues.getInt(EffectMaterial.CULL);
	}

	set cull(value: number) {
		this._shaderValues.setInt(EffectMaterial.CULL, value);
	}

	/**
	 * 混合方式。
	 */
	get blend(): number {
		return this._shaderValues.getInt(EffectMaterial.BLEND);
	}

	set blend(value: number) {
		this._shaderValues.setInt(EffectMaterial.BLEND, value);
	}

	/**
	 * 混合源。
	 */
	get blendSrc(): number {
		return this._shaderValues.getInt(EffectMaterial.BLEND_SRC);
	}


	set blendSrc(value: number) {
		this._shaderValues.setInt(EffectMaterial.BLEND_SRC, value);
	}

	/**
	 * 混合目标。
	 */
	get blendDst(): number {
		return this._shaderValues.getInt(EffectMaterial.BLEND_DST);
	}

	set blendDst(value: number) {
		this._shaderValues.setInt(EffectMaterial.BLEND_DST, value);
	}

	/**
	 * 深度测试方式。
	 */
	get depthTest(): number {
		return this._shaderValues.getInt(EffectMaterial.DEPTH_TEST);
	}

	set depthTest(value: number) {
		this._shaderValues.setInt(EffectMaterial.DEPTH_TEST, value);
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
	 * @override
	 */
	clone(): any {
		var dest: EffectMaterial = new EffectMaterial();
		this.cloneTo(dest);
		return dest;
	}
}

