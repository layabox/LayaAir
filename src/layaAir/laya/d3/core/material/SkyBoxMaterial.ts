import { Vector4 } from "../../math/Vector4";
import { TextureCube } from "../../resource/TextureCube";
import { Shader3D } from "../../shader/Shader3D";
import { Material } from "./Material";

/**
 * <code>SkyBoxMaterial</code> 类用于实现SkyBoxMaterial材质。
 */
export class SkyBoxMaterial extends Material {
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
	 * 颜色。
	 */
	get tintColor(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(SkyBoxMaterial.TINTCOLOR));
	}

	set tintColor(value: Vector4) {
		this._shaderValues.setVector(SkyBoxMaterial.TINTCOLOR, value);
	}

	/**
	 * 曝光强度。
	 */
	get exposure(): number {
		return this._shaderValues.getNumber(SkyBoxMaterial.EXPOSURE);
	}

	set exposure(value: number) {
		this._shaderValues.setNumber(SkyBoxMaterial.EXPOSURE, value);
	}

	/**
	 * 旋转角度。
	 */
	get rotation(): number {
		return this._shaderValues.getNumber(SkyBoxMaterial.ROTATION);
	}

	set rotation(value: number) {
		this._shaderValues.setNumber(SkyBoxMaterial.ROTATION, value);
	}

	/**
	 * 天空盒纹理。
	 */
	get textureCube(): TextureCube {
		return (<TextureCube>this._shaderValues.getTexture(SkyBoxMaterial.TEXTURECUBE));
	}

	set textureCube(value: TextureCube) {
		this._shaderValues.setTexture(SkyBoxMaterial.TEXTURECUBE, value);
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
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
		super();
		this.setShaderName("SkyBox");
		this.tintColor = new Vector4(0.5, 0.5, 0.5, 0.5);
		this.exposure = 1.0;
		this.rotation = 0;
	}

}


