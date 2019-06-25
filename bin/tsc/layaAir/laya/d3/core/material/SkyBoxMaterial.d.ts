import { Vector4 } from "../../math/Vector4";
import { TextureCube } from "../../resource/TextureCube";
import { BaseMaterial } from "././BaseMaterial";
/**
 * <code>SkyBoxMaterial</code> 类用于实现SkyBoxMaterial材质。
 */
export declare class SkyBoxMaterial extends BaseMaterial {
    static TINTCOLOR: number;
    static EXPOSURE: number;
    static ROTATION: number;
    static TEXTURECUBE: number;
    /** 默认材质，禁止修改*/
    static defaultMaterial: SkyBoxMaterial;
    /**
    * @private
    */
    static __initDefine__(): void;
    /**
     * 获取颜色。
     * @return  颜色。
     */
    /**
    * 设置颜色。
    * @param value 颜色。
    */
    tintColor: Vector4;
    /**
     * 获取曝光强度。
     * @return 曝光强度。
     */
    /**
    * 设置曝光强度。
    * @param value 曝光强度。
    */
    exposure: number;
    /**
     * 获取曝光强度。
     * @return 曝光强度。
     */
    /**
    * 设置曝光强度。
    * @param value 曝光强度。
    */
    rotation: number;
    /**
     * 获取天空盒纹理。
     */
    /**
    * 设置天空盒纹理。
    */
    textureCube: TextureCube;
    /**
 * 克隆。
 * @return	 克隆副本。
 */
    clone(): any;
    /**
     * 创建一个 <code>SkyBoxMaterial</code> 实例。
     */
    constructor();
}
