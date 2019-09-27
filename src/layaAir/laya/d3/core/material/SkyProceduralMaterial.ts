import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { Material } from "./Material";
import { ShaderDefine } from "../../shader/ShaderDefine";

/**
 * <code>SkyProceduralMaterial</code> 类用于实现SkyProceduralMaterial材质。
 */
export class SkyProceduralMaterial extends Material {
	/** 太阳_无*/
	static SUN_NODE: number = 0;
	/** 太阳_精简*/
	static SUN_SIMPLE: number = 1;
	/** 太阳_高质量*/
	static SUN_HIGH_QUALITY: number = 2;

	/**@internal */
	static SUNSIZE: number = Shader3D.propertyNameToID("u_SunSize");
	/**@internal */
	static SUNSIZECONVERGENCE: number = Shader3D.propertyNameToID("u_SunSizeConvergence");
	/**@internal */
	static ATMOSPHERETHICKNESS: number = Shader3D.propertyNameToID("u_AtmosphereThickness");
	/**@internal */
	static SKYTINT: number = Shader3D.propertyNameToID("u_SkyTint");
	/**@internal */
	static GROUNDTINT: number = Shader3D.propertyNameToID("u_GroundTint");
	/**@internal */
	static EXPOSURE: number = Shader3D.propertyNameToID("u_Exposure");

	/**@internal */
	static SHADERDEFINE_SUN_HIGH_QUALITY: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SUN_SIMPLE: ShaderDefine;

	/** 默认材质，禁止修改*/
	static defaultMaterial: SkyProceduralMaterial;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		SkyProceduralMaterial.SHADERDEFINE_SUN_HIGH_QUALITY = Shader3D.getDefineByName("SUN_HIGH_QUALITY");
		SkyProceduralMaterial.SHADERDEFINE_SUN_SIMPLE = Shader3D.getDefineByName("SUN_SIMPLE");
	}

	/**@internal */
	private _sunDisk: number;

	/**
	 * 太阳状态。
	 */
	get sunDisk(): number {
		return this._sunDisk;
	}

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
	 * 太阳尺寸,范围是0到1。
	 */
	get sunSize(): number {
		return this._shaderValues.getNumber(SkyProceduralMaterial.SUNSIZE);
	}

	set sunSize(value: number) {
		value = Math.min(Math.max(0.0, value), 1.0);
		this._shaderValues.setNumber(SkyProceduralMaterial.SUNSIZE, value);
	}

	/**
	 * 太阳尺寸收缩,范围是0到20。
	 */
	get sunSizeConvergence(): number {
		return this._shaderValues.getNumber(SkyProceduralMaterial.SUNSIZECONVERGENCE);
	}

	set sunSizeConvergence(value: number) {
		value = Math.min(Math.max(0.0, value), 20.0);
		this._shaderValues.setNumber(SkyProceduralMaterial.SUNSIZECONVERGENCE, value);
	}

	/**
	 * 大气厚度,范围是0到5。
	 */
	get atmosphereThickness(): number {
		return this._shaderValues.getNumber(SkyProceduralMaterial.ATMOSPHERETHICKNESS);
	}

	set atmosphereThickness(value: number) {
		value = Math.min(Math.max(0.0, value), 5.0);
		this._shaderValues.setNumber(SkyProceduralMaterial.ATMOSPHERETHICKNESS, value);
	}

	/**
	 * 天空颜色。
	 */
	get skyTint(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(SkyProceduralMaterial.SKYTINT));
	}

	set skyTint(value: Vector4) {
		this._shaderValues.setVector(SkyProceduralMaterial.SKYTINT, value);
	}

	/**
	 * 地面颜色。
	 */
	get groundTint(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(SkyProceduralMaterial.GROUNDTINT));
	}

	set groundTint(value: Vector4) {
		this._shaderValues.setVector(SkyProceduralMaterial.GROUNDTINT, value);
	}

	/**
	 * 曝光强度,范围是0到8。
	 */
	get exposure(): number {
		return this._shaderValues.getNumber(SkyProceduralMaterial.EXPOSURE);
	}

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
	 * @override
	 */
	clone(): any {
		var dest: SkyProceduralMaterial = new SkyProceduralMaterial();
		this.cloneTo(dest);
		return dest;
	}

}


