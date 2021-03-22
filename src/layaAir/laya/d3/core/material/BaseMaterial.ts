import { Laya } from "../../../../Laya";
import { Handler } from "../../../utils/Handler";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefine } from "../../shader/ShaderDefine";
import { Material } from "./Material";


/**
 * BaseMaterial has deprecated,please use Material instead废弃的类，请使用Material类.
 * @deprecated
 */
export class BaseMaterial {
	/**  @deprecated 废弃请使用Material类 use Material.MATERIAL instead*/
	static MATERIAL: string = "MATERIAL";
	/** @deprecated 废弃请使用Material类 use Material.RENDERQUEUE_OPAQUE instead*/
	static RENDERQUEUE_OPAQUE: number = 2000;
	/** @deprecated 废弃请使用Material类 use Material.RENDERQUEUE_ALPHATEST instead*/
	static RENDERQUEUE_ALPHATEST: number = 2450;
	/** @deprecated 废弃请使用Material类 use Material.RENDERQUEUE_TRANSPARENT instead*/
	static RENDERQUEUE_TRANSPARENT: number = 3000;
	/** @deprecated 废弃请使用Material类 use Material.ALPHATESTVALUE instead*/
	static ALPHATESTVALUE: number = Shader3D.propertyNameToID("u_AlphaTestValue");
	/** @deprecated 废弃请使用Material类 use Material.SHADERDEFINE_ALPHATEST instead*/
	static SHADERDEFINE_ALPHATEST: ShaderDefine;

	/**
	 * @deprecated 
	 *	废弃请使用Material类 BaseMaterial has deprecated,please use Material instead.
	 * @param 资源路径
	 * @param 处理句柄
	 */
	static load(url: string, complete: Handler): void {
		Laya.loader.create(url, complete, null, Material.MATERIAL);
	}

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		BaseMaterial.SHADERDEFINE_ALPHATEST = Material.SHADERDEFINE_ALPHATEST;
	}
}




