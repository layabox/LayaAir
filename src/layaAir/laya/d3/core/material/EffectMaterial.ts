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
	/**@internal */
	static SHADERDEFINE_MAINTEXTURE: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_ADDTIVEFOG: ShaderDefine;
	/**@internal */
	static MAINTEXTURE: number = Shader3D.propertyNameToID("u_AlbedoTexture");
	/**@internal */
	static TINTCOLOR: number = Shader3D.propertyNameToID("u_AlbedoColor");
	/**@internal */
	static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		EffectMaterial.SHADERDEFINE_MAINTEXTURE = Shader3D.getDefineByName("MAINTEXTURE");
		EffectMaterial.SHADERDEFINE_ADDTIVEFOG = Shader3D.getDefineByName("ADDTIVEFOG");
	}


	/**
	 * @internal
	 * @deprecated
	 */
	get _TintColorR(): number {
		return this.color.x;
	}

	set _TintColorR(value: number) {
		let co = this.color;
		co.x = value;
		this.color = co;
	}

	/**
	 * @internal
	 * @deprecated
	 */
	get _TintColorG(): number {
		return this.color.y;
	}

	set _TintColorG(value: number) {
		let co = this.color;
		co.y = value;
		this.color = co;
	}

	/**
	 * @internal
	 * @deprecated
	 */
	get _TintColorB(): number {
		return this.color.z;
	}

	set _TintColorB(value: number) {
		let co = this.color;
		co.z= value;
		this.color = co;
	}

	/**
	 * @internal 
	 * @deprecated
	 */
	get _TintColorA(): number {
		return this.color.w;
	}

	set _TintColorA(value: number) {
		let co = this.color;
		co.w = value;
		this.color = co;
	}

	/**
	 * @internal
	 */
	get _TintColor(): Vector4 {
		return this._shaderValues.getVector(EffectMaterial.TINTCOLOR);
	}

	set _TintColor(value: Vector4) {
		this.color = value;
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
	 * @internal
	 */
	get _MainTex_ST(): Vector4 {
		return this._shaderValues.getVector(EffectMaterial.TILINGOFFSET);
	}

	set _MainTex_ST(value: Vector4) {
		this.tilingOffset = value;
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
			this._shaderValues.setVector(EffectMaterial.TILINGOFFSET, value);
		}
		else {
			this._shaderValues.getVector(EffectMaterial.TILINGOFFSET).setValue(1.0, 1.0, 0.0, 0.0);
		}
	}


	/**
	 * 创建一个 <code>EffectMaterial</code> 实例。
	 */
	constructor() {
		super();
		this.setShaderName("Effect");
		this._shaderValues.setVector(EffectMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
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

