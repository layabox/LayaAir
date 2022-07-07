import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { Material, MaterialRenderMode } from "../material/Material";

/**
 * <code>TrailMaterial</code> 类用于实现拖尾材质。
 */
export class TrailMaterial extends Material {
	/** 默认材质，禁止修改*/
	static defaultMaterial: TrailMaterial;

	static MAINTEXTURE: number;
	static TINTCOLOR: number;
	static TILINGOFFSET: number;


	/**
	 * @internal
	 */
	static __initDefine__(): void {
		
		TrailMaterial.MAINTEXTURE = Shader3D.propertyNameToID("u_MainTexture");
		TrailMaterial.TINTCOLOR = Shader3D.propertyNameToID("u_MainColor");
		TrailMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");

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
		return this._shaderValues.getVector(TrailMaterial.TILINGOFFSET).x;
	}

	/**
	 * @internal
	 */
	set _MainTex_STX(x: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(TrailMaterial.TILINGOFFSET));
		tilOff.x = x;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STY(): number {
		return this._shaderValues.getVector(TrailMaterial.TILINGOFFSET).y;
	}

	/**
	 * @internal
	 */
	set _MainTex_STY(y: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(TrailMaterial.TILINGOFFSET));
		tilOff.y = y;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STZ(): number {
		return this._shaderValues.getVector(TrailMaterial.TILINGOFFSET).z;
	}

	/**
	 * @internal
	 */
	set _MainTex_STZ(z: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(TrailMaterial.TILINGOFFSET));
		tilOff.z = z;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STW(): number {
		return this._shaderValues.getVector(TrailMaterial.TILINGOFFSET).w;
	}

	/**
	 * @internal
	 */
	set _MainTex_STW(w: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(TrailMaterial.TILINGOFFSET));
		tilOff.w = w;
		this.tilingOffset = tilOff;
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
		return (<Vector4>this._shaderValues.getVector(TrailMaterial.TINTCOLOR));
	}

	/**
	 * 设置颜色。
	 * @param value 颜色。
	 */
	set color(value: Vector4) {
		this._shaderValues.setVector(TrailMaterial.TINTCOLOR, value);
	}

	/**
	 * 获取贴图。
	 * @return 贴图。
	 */
	get texture(): BaseTexture {
		return this._shaderValues.getTexture(TrailMaterial.MAINTEXTURE);
	}

	/**
	 * 设置贴图。
	 * @param value 贴图。
	 */
	set texture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(TrailMaterial.SHADERDEFINE_MAINTEXTURE);
		else
			this._shaderValues.removeDefine(TrailMaterial.SHADERDEFINE_MAINTEXTURE);
		this._shaderValues.setTexture(TrailMaterial.MAINTEXTURE, value);
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
		return (<Vector4>this._shaderValues.getVector(TrailMaterial.TILINGOFFSET));
	}

	/**
	 * 设置纹理平铺和偏移。
	 * @param value 纹理平铺和偏移。
	 */
	set tilingOffset(value: Vector4) {
		if (value) {
			this._shaderValues.setVector(TrailMaterial.TILINGOFFSET, value);
		}
		else {
			this._shaderValues.getVector(TrailMaterial.TILINGOFFSET).setValue(1.0, 1.0, 0.0, 0.0);
		}
	}

	constructor() {
		super();
		this.setShaderName("Trail");
		this._color = new Vector4(1.0, 1.0, 1.0, 1.0);
		this._shaderValues.setVector(TrailMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
		this._shaderValues.setVector(TrailMaterial.TINTCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
		this.renderMode = MaterialRenderMode.RENDERMODE_ALPHABLENDED;
	}

	/**
	 * @inheritdoc
	 * @override
	 */
	clone(): any {
		var dest: TrailMaterial = new TrailMaterial();
		this.cloneTo(dest);
		return dest;
	}
}

