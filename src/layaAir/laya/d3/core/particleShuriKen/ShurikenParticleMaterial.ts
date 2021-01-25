import { Material } from "../material/Material"
import { RenderState } from "../material/RenderState"
import { Vector4 } from "../../math/Vector4"
import { Shader3D } from "../../shader/Shader3D"
import { BaseTexture } from "../../../resource/BaseTexture"
import { ShaderDefine } from "../../shader/ShaderDefine";


/**
 * <code>ShurikenParticleMaterial</code> 类用于实现粒子材质。
 */
export class ShurikenParticleMaterial extends Material {
	/**渲染状态_透明混合。*/
	static RENDERMODE_ALPHABLENDED: number = 0;
	/**渲染状态_加色法混合。*/
	static RENDERMODE_ADDTIVE: number = 1;

	/**@internal */
	static SHADERDEFINE_DIFFUSEMAP: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_TINTCOLOR: ShaderDefine;
	/**@interanl */
	static SHADERDEFINE_ADDTIVEFOG: ShaderDefine;

	/**@internal */
	static DIFFUSETEXTURE: number = Shader3D.propertyNameToID("u_texture");
	/**@internal */
	static TINTCOLOR: number = Shader3D.propertyNameToID("u_Tintcolor");
	/**@internal */
	static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");

	/** 默认材质，禁止修改*/
	static defaultMaterial: ShurikenParticleMaterial;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		ShurikenParticleMaterial.SHADERDEFINE_DIFFUSEMAP = Shader3D.getDefineByName("DIFFUSEMAP");
		ShurikenParticleMaterial.SHADERDEFINE_TINTCOLOR = Shader3D.getDefineByName("TINTCOLOR");
		ShurikenParticleMaterial.SHADERDEFINE_ADDTIVEFOG = Shader3D.getDefineByName("ADDTIVEFOG");
	}

	/**@internal */
	private _color: Vector4;

	/**
	 * @internal
	 */
	get _TintColor(): Vector4 {
		return this.color;
	}

	/**
	 * @internal
	 */
	set _TintColor(value: Vector4) {
		this.color = value;
	}


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
	get _MainTex_ST(): Vector4 {
		return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET)
	}

	/**
	 * @internal
	 */
	set _MainTex_ST(value: Vector4) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET));
		tilOff.setValue(value.x, value.y, value.z, value.w);
		this.tilingOffset = tilOff;
	}


	/**
	 * @internal
	 */
	get _MainTex_STX(): number {
		return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).x;
	}

	/**
	 * @internal
	 */
	set _MainTex_STX(x: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET));
		tilOff.x = x;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STY(): number {
		return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).y;
	}

	/**
	 * @internal
	 */
	set _MainTex_STY(y: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET));
		tilOff.y = y;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STZ(): number {
		return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).z;
	}

	/**
	 * @internal
	 */
	set _MainTex_STZ(z: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET));
		tilOff.z = z;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STW(): number {
		return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).w;
	}

	/**
	 * @internal
	 */
	set _MainTex_STW(w: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET));
		tilOff.w = w;
		this.tilingOffset = tilOff;
	}

	/**
	 * 渲染模式。
	 */
	set renderMode(value: number) {
		switch (value) {
			case ShurikenParticleMaterial.RENDERMODE_ADDTIVE:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.depthWrite = false;
				this.cull = RenderState.CULL_NONE;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE;
				this.alphaTest = false;
				this._shaderValues.addDefine(ShurikenParticleMaterial.SHADERDEFINE_ADDTIVEFOG);
				break;
			case ShurikenParticleMaterial.RENDERMODE_ALPHABLENDED:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.depthWrite = false;
				this.cull = RenderState.CULL_NONE;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.alphaTest = false;
				this._shaderValues.removeDefine(ShurikenParticleMaterial.SHADERDEFINE_ADDTIVEFOG);
				break;
			default:
				throw new Error("ShurikenParticleMaterial : renderMode value error.");
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
	 * 颜色Z分量。
	 */
	get colorA(): number {
		return this._TintColorA;
	}

	set colorA(value: number) {
		this._TintColorA = value;
	}

	/**
	 * 颜色。
	 */
	get color(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(ShurikenParticleMaterial.TINTCOLOR));
	}

	set color(value: Vector4) {
		if (value)
			this._shaderValues.addDefine(ShurikenParticleMaterial.SHADERDEFINE_TINTCOLOR);
		else
			this._shaderValues.removeDefine(ShurikenParticleMaterial.SHADERDEFINE_TINTCOLOR);

		this._shaderValues.setVector(ShurikenParticleMaterial.TINTCOLOR, value);
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
		return (<Vector4>this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET));
	}

	set tilingOffset(value: Vector4) {
		if (value) {
			this._shaderValues.setVector(ShurikenParticleMaterial.TILINGOFFSET, value);
		}
		else {
			this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).setValue(1.0, 1.0, 0.0, 0.0);
		}
	}

	/**
	 * 漫反射贴图。
	 */
	get texture(): BaseTexture {
		return this._shaderValues.getTexture(ShurikenParticleMaterial.DIFFUSETEXTURE);
	}

	set texture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(ShurikenParticleMaterial.SHADERDEFINE_DIFFUSEMAP);
		else
			this._shaderValues.removeDefine(ShurikenParticleMaterial.SHADERDEFINE_DIFFUSEMAP);

		this._shaderValues.setTexture(ShurikenParticleMaterial.DIFFUSETEXTURE, value);
	}


	/**
	 * 创建一个 <code>ShurikenParticleMaterial</code> 实例。
	 */
	constructor() {
		super();
		this.setShaderName("PARTICLESHURIKEN");
		this._color = new Vector4(1.0, 1.0, 1.0, 1.0);
		this._shaderValues.setVector(ShurikenParticleMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
		this.renderMode = ShurikenParticleMaterial.RENDERMODE_ALPHABLENDED;//默认加色法会自动加上雾化宏定义，导致非加色法从材质读取完后未移除宏定义。
	}

	/**
	* 克隆。
	* @return	 克隆副本。
	* @override
	*/
	clone(): any {
		var dest: ShurikenParticleMaterial = new ShurikenParticleMaterial();
		this.cloneTo(dest);
		return dest;
	}

}


