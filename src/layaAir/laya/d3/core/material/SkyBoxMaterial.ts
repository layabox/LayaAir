import { Color } from "../../../maths/Color";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { TextureCube } from "../../../resource/TextureCube";
import { Material } from "../../../resource/Material";

/**
 * @en The SkyBoxMaterial class is used to implement the SkyBoxMaterial material.
 * @zh SkyBoxMaterial 类用于实现天空盒材质。
 */
export class SkyBoxMaterial extends Material {
	static TINTCOLOR: number;
	static EXPOSURE: number;
	static ROTATION: number;
	static TEXTURECUBE: number;

	/** 
	 * @en Default material, no modification allowed
	 * @zh 默认材质，禁止修改
	 */
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
	 * @en Tint color of the skybox.
	 * @zh 天空盒的颜色。
	 */
	get tintColor(): Color {
		return this._shaderValues.getColor(SkyBoxMaterial.TINTCOLOR);
	}

	set tintColor(value: Color) {
		this._shaderValues.setColor(SkyBoxMaterial.TINTCOLOR, value);
	}

	/**
	 * @en Exposure intensity of the skybox.
	 * @zh 天空盒的曝光强度。
	 */
	get exposure(): number {
		return this._shaderValues.getNumber(SkyBoxMaterial.EXPOSURE);
	}

	set exposure(value: number) {
		this._shaderValues.setNumber(SkyBoxMaterial.EXPOSURE, value);
	}

	/**
	 * @en Rotation angle of the skybox.
	 * @zh 天空盒的旋转角度。
	 */
	get rotation(): number {
		return this._shaderValues.getNumber(SkyBoxMaterial.ROTATION);
	}

	set rotation(value: number) {
		this._shaderValues.setNumber(SkyBoxMaterial.ROTATION, value);
	}

	/**
	 * @en Texture of the skybox.
	 * @zh 天空盒的纹理。
	 */
	get textureCube(): TextureCube {
		return (<TextureCube>this._shaderValues.getTexture(SkyBoxMaterial.TEXTURECUBE));
	}

	set textureCube(value: TextureCube) {
		this._shaderValues.setTexture(SkyBoxMaterial.TEXTURECUBE, value);
	}

	/**
	 * @override
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var dest: SkyBoxMaterial = new SkyBoxMaterial();
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * @ignore
	 * @en Creates an instance of SkyBoxMaterial.
	 * @zh 创建一个 SkyBoxMaterial 实例。
	 */
	constructor() {
		super();
		this.setShaderName("SkyBox");
	}

}


