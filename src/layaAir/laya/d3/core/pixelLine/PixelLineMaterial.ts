import { Vector4 } from "../../../maths/Vector4";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Material } from "../../../resource/Material";

/**
 * @en The PixelLineMaterial class is used to implement pixel line material.
 * @zh PixelLineMaterial 类用于实现像素线材质。
 */
export class PixelLineMaterial extends Material {
	/**@internal */
	static COLOR: number;

	/** 
	 * @en Default material, no modification allowed
	 * @zh 默认材质，禁止修改
	 */
	static defaultMaterial: Material;

	/**
	* @internal
	*/
	static __initDefine__(): void {
		PixelLineMaterial.COLOR = Shader3D.propertyNameToID("u_Color");
	}

	/**
	 * @en The color of the pixel line.
	 * @zh 像素线的颜色。
	 */
	get color(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(PixelLineMaterial.COLOR));
	}

	set color(value: Vector4) {
		this._shaderValues.setVector(PixelLineMaterial.COLOR, value);
	}

	/**
	 * @ignore
	 * @en Initialize PixelLineMaterial instance.
	 * @zh 初始化PixelLineMaterial实例
	 */
	constructor() {
		super();
		this.setShaderName("LineShader");
		this._shaderValues.setVector(PixelLineMaterial.COLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
	}

	/**
	 * @internal
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var dest: PixelLineMaterial = new PixelLineMaterial();
		this.cloneTo(dest);
		return dest;
	}

}

