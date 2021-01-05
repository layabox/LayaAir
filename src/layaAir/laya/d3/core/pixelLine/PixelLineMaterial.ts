import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { Material } from "../material/Material";

/**
 * <code>PixelLineMaterial</code> 类用于实现像素线材质。
 */
export class PixelLineMaterial extends Material {
	/**@internal */
	static COLOR: number = Shader3D.propertyNameToID("u_Color");

	/** 默认材质，禁止修改*/
	static defaultMaterial: PixelLineMaterial;

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
	 *  创建一个 <code>PixelLineMaterial</code> 实例。
	 */
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

