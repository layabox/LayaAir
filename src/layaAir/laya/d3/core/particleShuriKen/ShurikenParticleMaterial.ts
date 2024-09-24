import { Material } from "../../../resource/Material";
import { BaseTexture } from "../../../resource/BaseTexture"
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";


/**
 * @en ShurikenParticleMaterial class is used to implement particle materials.
 * @zh ShurikenParticleMaterial 类用于实现粒子材质。
 */
export class ShurikenParticleMaterial extends Material {
	/**
	 * @en Render mode for transparent blending.
	 * @zh 渲染状态_透明混合。
	 */
	static RENDERMODE_ALPHABLENDED: number = 0;
	/**
	 * @en Render mode for additive blending.
	 * @zh 渲染状态_加色法混合。
	 */
	static RENDERMODE_ADDTIVE: number = 1;

	/**@internal */
	static SHADERDEFINE_DIFFUSEMAP: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_TINTCOLOR: ShaderDefine;
	/**@interanl */
	static SHADERDEFINE_ADDTIVEFOG: ShaderDefine;

	/**@internal */
	static DIFFUSETEXTURE: number;
	/**@internal */
	static TINTCOLOR: number;
	/**@internal */
	static TILINGOFFSET: number;

	/**
	 * @en Default material, modification prohibited.
	 * @zh 默认材质，禁止修改。
	 */
	static defaultMaterial: ShurikenParticleMaterial;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		ShurikenParticleMaterial.SHADERDEFINE_DIFFUSEMAP = Shader3D.getDefineByName("DIFFUSEMAP");
		ShurikenParticleMaterial.SHADERDEFINE_TINTCOLOR = Shader3D.getDefineByName("TINTCOLOR");
		ShurikenParticleMaterial.SHADERDEFINE_ADDTIVEFOG = Shader3D.getDefineByName("ADDTIVEFOG");
		ShurikenParticleMaterial.DIFFUSETEXTURE = Shader3D.propertyNameToID("u_texture");
		ShurikenParticleMaterial.TINTCOLOR = Shader3D.propertyNameToID("u_Tintcolor");
		ShurikenParticleMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
	}

	/**
	 * @en Color of the particle material.
	 * @zh 粒子材质的颜色。
	 */
	get color(): Color {
		return this._shaderValues.getColor(ShurikenParticleMaterial.TINTCOLOR);
	}

	set color(value: Color) {
		if (value)
			this._shaderValues.addDefine(ShurikenParticleMaterial.SHADERDEFINE_TINTCOLOR);
		else
			this._shaderValues.removeDefine(ShurikenParticleMaterial.SHADERDEFINE_TINTCOLOR);

		this._shaderValues.setColor(ShurikenParticleMaterial.TINTCOLOR, value);
	}



	/**
	 * @en Texture tiling and offset.
	 * @zh 纹理平铺和偏移。
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
	 * @en Diffuse texture.
	 * @zh 漫反射贴图。
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
	 * @ignore
	 * @en creates a new instance of the ShurikenParticleMaterial class.
	 * @zh 创建ShurikenParticleMaterial类的新实例。
	 */
	constructor() {
		super();
		this.setShaderName("PARTICLESHURIKEN");
		// this._shaderValues.setColor(ShurikenParticleMaterial.TINTCOLOR, new Color(0.5, 0.5, 0.5, 0.5));
		// this._shaderValues.setVector(ShurikenParticleMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
		this.renderMode = ShurikenParticleMaterial.RENDERMODE_ALPHABLENDED;//默认加色法会自动加上雾化宏定义，导致非加色法从材质读取完后未移除宏定义。
	}

	/**
	 * @override
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var dest: ShurikenParticleMaterial = new ShurikenParticleMaterial();
		this.cloneTo(dest);
		return dest;
	}


	//----------------deprecated----------------
	/**
	 * @deprecated
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
	 * @deprecated
	 * 纹理平铺和偏移X分量。
	 */
	get tilingOffsetX(): number {
		return this._MainTex_STX;
	}

	set tilingOffsetX(x: number) {
		this._MainTex_STX = x;
	}

	/**
	 * @deprecated
	 * 纹理平铺和偏移Y分量。
	 */
	get tilingOffsetY(): number {
		return this._MainTex_STY;
	}

	set tilingOffsetY(y: number) {
		this._MainTex_STY = y;
	}

	/**
	 * @deprecated
	 * 纹理平铺和偏移Z分量。
	 */
	get tilingOffsetZ(): number {
		return this._MainTex_STZ;
	}

	set tilingOffsetZ(z: number) {
		this._MainTex_STZ = z;
	}

	/**
	 * @deprecated
	 * 纹理平铺和偏移W分量。
	 */
	get tilingOffsetW(): number {
		return this._MainTex_STW;
	}

	set tilingOffsetW(w: number) {
		this._MainTex_STW = w;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	get _TintColor(): Color {
		return this.color;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	set _TintColor(value: Color) {
		this.color = value;
	}


	/**
	 * @deprecated
	 * @internal
	 */
	get _TintColorR(): number {
		return this.color.r;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	set _TintColorR(value: number) {
		this.color.r = value;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	get _TintColorG(): number {
		return this.color.g;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	set _TintColorG(value: number) {
		this.color.g = value;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	get _TintColorB(): number {
		return this.color.b;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	set _TintColorB(value: number) {
		this.color.b = value;
	}

	/**
	 * @deprecated
	 * @internal 
	 */
	get _TintColorA(): number {
		return this.color.a;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	set _TintColorA(value: number) {
		this.color.a = value;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	get _MainTex_ST(): Vector4 {
		return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET)
	}

	/**
	 * @deprecated
	 * @internal
	 */
	set _MainTex_ST(value: Vector4) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET));
		tilOff.setValue(value.x, value.y, value.z, value.w);
		this.tilingOffset = tilOff;
	}


	/**
	 * @deprecated
	 * @internal
	 */
	get _MainTex_STX(): number {
		return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).x;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	set _MainTex_STX(x: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET));
		tilOff.x = x;
		this.tilingOffset = tilOff;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	get _MainTex_STY(): number {
		return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).y;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	set _MainTex_STY(y: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET));
		tilOff.y = y;
		this.tilingOffset = tilOff;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	get _MainTex_STZ(): number {
		return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).z;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	set _MainTex_STZ(z: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET));
		tilOff.z = z;
		this.tilingOffset = tilOff;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	get _MainTex_STW(): number {
		return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).w;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	set _MainTex_STW(w: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET));
		tilOff.w = w;
		this.tilingOffset = tilOff;
	}



	/**
	 * @deprecated
	 * 颜色R分量。
	 */
	get colorR(): number {
		return this._TintColorR;
	}

	set colorR(value: number) {
		this._TintColorR = value;
	}

	/**
	 * @deprecated
	 * 颜色G分量。
	 */
	get colorG(): number {
		return this._TintColorG;
	}

	set colorG(value: number) {
		this._TintColorG = value;
	}

	/**
	 * @deprecated
	 * 颜色B分量。
	 */
	get colorB(): number {
		return this._TintColorB;
	}

	set colorB(value: number) {
		this._TintColorB = value;
	}

	/**
	 * @deprecated
	 * 颜色Z分量。
	 */
	get colorA(): number {
		return this._TintColorA;
	}

	set colorA(value: number) {
		this._TintColorA = value;
	}
}


