import { Vector4 } from "../../math/Vector4";
import { TextureCube } from "../../resource/TextureCube";
import { Shader3D } from "../../shader/Shader3D";
import { BaseMaterial } from "./BaseMaterial";

/**
 * <code>SkyBoxMaterial</code> 类用于实现SkyBoxMaterial材质。
 */
export class SkyBoxMaterial extends BaseMaterial {
	static TINTCOLOR: number = Shader3D.propertyNameToID("u_TintColor");
	static EXPOSURE: number = Shader3D.propertyNameToID("u_Exposure");
	static ROTATION: number = Shader3D.propertyNameToID("u_Rotation");
	static TEXTURECUBE: number = Shader3D.propertyNameToID("u_CubeTexture");

	/** 默认材质，禁止修改*/
	static defaultMaterial: SkyBoxMaterial;

	/**
	* @internal
	*/
	static __initDefine__(): void {

	}

	/**
	 * 获取颜色。
	 * @return  颜色。
	 */
	get tintColor(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(SkyBoxMaterial.TINTCOLOR));
	}

	/**
	 * 设置颜色。
	 * @param value 颜色。
	 */
	set tintColor(value: Vector4) {
		this._shaderValues.setVector(SkyBoxMaterial.TINTCOLOR, value);
	}

	/**
	 * 获取曝光强度。
	 * @return 曝光强度。
	 */
	get exposure(): number {
		return this._shaderValues.getNumber(SkyBoxMaterial.EXPOSURE);
	}

	/**
	 * 设置曝光强度。
	 * @param value 曝光强度。
	 */
	set exposure(value: number) {
		this._shaderValues.setNumber(SkyBoxMaterial.EXPOSURE, value);
	}

	/**
	 * 获取曝光强度。
	 * @return 曝光强度。
	 */
	get rotation(): number {
		return this._shaderValues.getNumber(SkyBoxMaterial.ROTATION);
	}

	/**
	 * 设置曝光强度。
	 * @param value 曝光强度。
	 */
	set rotation(value: number) {
		this._shaderValues.setNumber(SkyBoxMaterial.ROTATION, value);
	}

	/**
	 * 获取天空盒纹理。
	 */
	get textureCube(): TextureCube {
		return (<TextureCube>this._shaderValues.getTexture(SkyBoxMaterial.TEXTURECUBE));
	}

	/**
	 * 设置天空盒纹理。
	 */
	set textureCube(value: TextureCube) {
		this._shaderValues.setTexture(SkyBoxMaterial.TEXTURECUBE, value);
	}

	/**
 * 克隆。
 * @return	 克隆副本。
 */
	clone(): any {
		var dest: SkyBoxMaterial = new SkyBoxMaterial();
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * 创建一个 <code>SkyBoxMaterial</code> 实例。
	 */
	constructor() {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		super();
		this.setShaderName("SkyBox");
	}

}


