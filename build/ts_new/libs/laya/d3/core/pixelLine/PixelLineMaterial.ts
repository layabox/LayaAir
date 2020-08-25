import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { Material } from "../material/Material";

/**
 * <code>PixelLineMaterial</code> 类用于实现像素线材质。
 */
export class PixelLineMaterial extends Material {
	static COLOR: number = Shader3D.propertyNameToID("u_Color");

	/** 默认材质，禁止修改*/
	static defaultMaterial: PixelLineMaterial;


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

	}

	/**
	 * 获取颜色。
	 * @return 颜色。
	 */
	get color(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(PixelLineMaterial.COLOR));
	}

	/**
	 * 设置颜色。
	 * @param value 颜色。
	 */
	set color(value: Vector4) {
		this._shaderValues.setVector(PixelLineMaterial.COLOR, value);
	}

	/**
	 * 设置是否写入深度。
	 * @param value 是否写入深度。
	 */
	set depthWrite(value: boolean) {
		this._shaderValues.setBool(PixelLineMaterial.DEPTH_WRITE, value);
	}

	/**
	 * 获取是否写入深度。
	 * @return 是否写入深度。
	 */
	get depthWrite(): boolean {
		return this._shaderValues.getBool(PixelLineMaterial.DEPTH_WRITE);
	}

	/**
	 * 设置剔除方式。
	 * @param value 剔除方式。
	 */
	set cull(value: number) {
		this._shaderValues.setInt(PixelLineMaterial.CULL, value);
	}

	/**
	 * 获取剔除方式。
	 * @return 剔除方式。
	 */
	get cull(): number {
		return this._shaderValues.getInt(PixelLineMaterial.CULL);
	}

	/**
	 * 设置混合方式。
	 * @param value 混合方式。
	 */
	set blend(value: number) {
		this._shaderValues.setInt(PixelLineMaterial.BLEND, value);
	}

	/**
	 * 获取混合方式。
	 * @return 混合方式。
	 */
	get blend(): number {
		return this._shaderValues.getInt(PixelLineMaterial.BLEND);
	}

	/**
	 * 设置混合源。
	 * @param value 混合源
	 */
	set blendSrc(value: number) {
		this._shaderValues.setInt(PixelLineMaterial.BLEND_SRC, value);
	}

	/**
	 * 获取混合源。
	 * @return 混合源。
	 */
	get blendSrc(): number {
		return this._shaderValues.getInt(PixelLineMaterial.BLEND_SRC);
	}

	/**
	 * 设置混合目标。
	 * @param value 混合目标
	 */
	set blendDst(value: number) {
		this._shaderValues.setInt(PixelLineMaterial.BLEND_DST, value);
	}

	/**
	 * 获取混合目标。
	 * @return 混合目标。
	 */
	get blendDst(): number {
		return this._shaderValues.getInt(PixelLineMaterial.BLEND_DST);
	}

	/**
	 * 设置深度测试方式。
	 * @param value 深度测试方式
	 */
	set depthTest(value: number) {
		this._shaderValues.setInt(PixelLineMaterial.DEPTH_TEST, value);
	}

	/**
	 * 获取深度测试方式。
	 * @return 深度测试方式。
	 */
	get depthTest(): number {
		return this._shaderValues.getInt(PixelLineMaterial.DEPTH_TEST);
	}

	constructor() {
		super();
		this.setShaderName("LineShader");
		this._shaderValues.setVector(PixelLineMaterial.COLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
	}

	/**
	 * @internal
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var dest: PixelLineMaterial = new PixelLineMaterial();
		this.cloneTo(dest);
		return dest;
	}

}

