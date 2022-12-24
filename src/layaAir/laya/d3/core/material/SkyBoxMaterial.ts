import { Color } from "../../../maths/Color";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { TextureCube } from "../../resource/TextureCube";
import { Material } from "./Material";

/**
 * <code>SkyBoxMaterial</code> 类用于实现SkyBoxMaterial材质。
 */
export class SkyBoxMaterial extends Material {
	static TINTCOLOR: number;
	static EXPOSURE: number;
	static ROTATION: number;
	static TEXTURECUBE: number;

	/** 默认材质，禁止修改*/
	static defaultMaterial: SkyBoxMaterial;

	/**
	* @internal
	*/
	static __initDefine__(): void {
		SkyBoxMaterial.TINTCOLOR = Shader3D.propertyNameToID("u_TintColor");
		SkyBoxMaterial.EXPOSURE = Shader3D.propertyNameToID("u_Exposure");
		SkyBoxMaterial.ROTATION = Shader3D.propertyNameToID("u_Rotation");
		SkyBoxMaterial.TEXTURECUBE = Shader3D.propertyNameToID("u_CubeTexture");
	}

	/**
	 * 颜色。
	 */
	get tintColor(): Color {
		return this._shaderValues.getColor(SkyBoxMaterial.TINTCOLOR);
	}

	set tintColor(value: Color) {
		this._shaderValues.setColor(SkyBoxMaterial.TINTCOLOR, value);
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
	}

}


