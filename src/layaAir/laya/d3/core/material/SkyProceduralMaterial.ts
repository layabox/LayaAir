import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { BaseMaterial } from "././BaseMaterial";

/**
 * <code>SkyProceduralMaterial</code> 类用于实现SkyProceduralMaterial材质。
 */
export class SkyProceduralMaterial extends BaseMaterial {
	/** 太阳_无*/
	static SUN_NODE: number = 0;
	/** 太阳_精简*/
	static SUN_SIMPLE: number = 1;
	/** 太阳_高质量*/
	static SUN_HIGH_QUALITY: number = 2;

	/**@private */
	static SUNSIZE: number = Shader3D.propertyNameToID("u_SunSize");
	/**@private */
	static SUNSIZECONVERGENCE: number = Shader3D.propertyNameToID("u_SunSizeConvergence");
	/**@private */
	static ATMOSPHERETHICKNESS: number = Shader3D.propertyNameToID("u_AtmosphereThickness");
	/**@private */
	static SKYTINT: number = Shader3D.propertyNameToID("u_SkyTint");
	/**@private */
	static GROUNDTINT: number = Shader3D.propertyNameToID("u_GroundTint");
	/**@private */
	static EXPOSURE: number = Shader3D.propertyNameToID("u_Exposure");

	/**@private */
	static SHADERDEFINE_SUN_HIGH_QUALITY: number;
	/**@private */
	static SHADERDEFINE_SUN_SIMPLE: number;

	/** 默认材质，禁止修改*/
	static defaultMaterial: SkyProceduralMaterial;
	/**@private */
	static shaderDefines: ShaderDefines =null;

	/**
	 * @private
	 */
	static __initDefine__(): void {
		SkyProceduralMaterial.shaderDefines= new ShaderDefines(BaseMaterial.shaderDefines);
		SkyProceduralMaterial.SHADERDEFINE_SUN_HIGH_QUALITY = SkyProceduralMaterial.shaderDefines.registerDefine("SUN_HIGH_QUALITY");
		SkyProceduralMaterial.SHADERDEFINE_SUN_SIMPLE = SkyProceduralMaterial.shaderDefines.registerDefine("SUN_SIMPLE");
	}

	/**@private */
	private _sunDisk: number;

	/**
	 * 获取太阳状态。
	 * @return  太阳状态。
	 */
	get sunDisk(): number {
		return this._sunDisk;
	}

	/**
	 * 设置太阳状态。
	 * @param value 太阳状态。
	 */
	set sunDisk(value: number) {
		switch (value) {
			case SkyProceduralMaterial.SUN_HIGH_QUALITY:
				this._shaderValues.removeDefine(SkyProceduralMaterial.SHADERDEFINE_SUN_SIMPLE);
				this._shaderValues.addDefine(SkyProceduralMaterial.SHADERDEFINE_SUN_HIGH_QUALITY);
				break;
			case SkyProceduralMaterial.SUN_SIMPLE:
				this._shaderValues.removeDefine(SkyProceduralMaterial.SHADERDEFINE_SUN_HIGH_QUALITY);
				this._shaderValues.addDefine(SkyProceduralMaterial.SHADERDEFINE_SUN_SIMPLE);
				break;
			case SkyProceduralMaterial.SUN_NODE:
				this._shaderValues.removeDefine(SkyProceduralMaterial.SHADERDEFINE_SUN_HIGH_QUALITY);
				this._shaderValues.removeDefine(SkyProceduralMaterial.SHADERDEFINE_SUN_SIMPLE);
				break;
			default:
				throw "SkyBoxProceduralMaterial: unknown sun value.";
		}
		this._sunDisk = value;
	}

	/**
	 * 获取太阳尺寸,范围是0到1。
	 * @return  太阳尺寸。
	 */
	get sunSize(): number {
		return this._shaderValues.getNumber(SkyProceduralMaterial.SUNSIZE);
	}

	/**
	 * 设置太阳尺寸,范围是0到1。
	 * @param value 太阳尺寸。
	 */
	set sunSize(value: number) {
		value = Math.min(Math.max(0.0, value), 1.0);
		this._shaderValues.setNumber(SkyProceduralMaterial.SUNSIZE, value);
	}

	/**
	 * 获取太阳尺寸收缩,范围是0到20。
	 * @return  太阳尺寸收缩。
	 */
	get sunSizeConvergence(): number {
		return this._shaderValues.getNumber(SkyProceduralMaterial.SUNSIZECONVERGENCE);
	}

	/**
	 * 设置太阳尺寸收缩,范围是0到20。
	 * @param value 太阳尺寸收缩。
	 */
	set sunSizeConvergence(value: number) {
		value = Math.min(Math.max(0.0, value), 20.0);
		this._shaderValues.setNumber(SkyProceduralMaterial.SUNSIZECONVERGENCE, value);
	}

	/**
	 * 获取大气厚度,范围是0到5。
	 * @return  大气厚度。
	 */
	get atmosphereThickness(): number {
		return this._shaderValues.getNumber(SkyProceduralMaterial.ATMOSPHERETHICKNESS);
	}

	/**
	 * 设置大气厚度,范围是0到5。
	 * @param value 大气厚度。
	 */
	set atmosphereThickness(value: number) {
		value = Math.min(Math.max(0.0, value), 5.0);
		this._shaderValues.setNumber(SkyProceduralMaterial.ATMOSPHERETHICKNESS, value);
	}

	/**
	 * 获取天空颜色。
	 * @return  天空颜色。
	 */
	get skyTint(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(SkyProceduralMaterial.SKYTINT));
	}

	/**
	 * 设置天空颜色。
	 * @param value 天空颜色。
	 */
	set skyTint(value: Vector4) {
		this._shaderValues.setVector(SkyProceduralMaterial.SKYTINT, value);
	}

	/**
	 * 获取地面颜色。
	 * @return  地面颜色。
	 */
	get groundTint(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(SkyProceduralMaterial.GROUNDTINT));
	}

	/**
	 * 设置地面颜色。
	 * @param value 地面颜色。
	 */
	set groundTint(value: Vector4) {
		this._shaderValues.setVector(SkyProceduralMaterial.GROUNDTINT, value);
	}

	/**
	 * 获取曝光强度,范围是0到8。
	 * @return 曝光强度。
	 */
	get exposure(): number {
		return this._shaderValues.getNumber(SkyProceduralMaterial.EXPOSURE);
	}

	/**
	 * 设置曝光强度,范围是0到8。
	 * @param value 曝光强度。
	 */
	set exposure(value: number) {
		value = Math.min(Math.max(0.0, value), 8.0);
		this._shaderValues.setNumber(SkyProceduralMaterial.EXPOSURE, value);
	}

	/**
	 * 创建一个 <code>SkyProceduralMaterial</code> 实例。
	 */
	constructor() {
		super();
		this.setShaderName("SkyBoxProcedural");
		this.sunDisk = SkyProceduralMaterial.SUN_HIGH_QUALITY;
		this.sunSize = 0.04;
		this.sunSizeConvergence = 5;
		this.atmosphereThickness = 1.0;
		this.skyTint = new Vector4(0.5, 0.5, 0.5, 1.0);
		this.groundTint = new Vector4(0.369, 0.349, 0.341, 1.0);
		this.exposure = 1.3;
	}

		/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var dest: SkyProceduralMaterial = new SkyProceduralMaterial();
		this.cloneTo(dest);
		return dest;
	}

}


