import { Vector4 } from "../../math/Vector4";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { BaseMaterial } from "././BaseMaterial";
/**
 * <code>SkyProceduralMaterial</code> 类用于实现SkyProceduralMaterial材质。
 */
export declare class SkyProceduralMaterial extends BaseMaterial {
    /** 太阳_无*/
    static SUN_NODE: number;
    /** 太阳_精简*/
    static SUN_SIMPLE: number;
    /** 太阳_高质量*/
    static SUN_HIGH_QUALITY: number;
    /**@private */
    static SUNSIZE: number;
    /**@private */
    static SUNSIZECONVERGENCE: number;
    /**@private */
    static ATMOSPHERETHICKNESS: number;
    /**@private */
    static SKYTINT: number;
    /**@private */
    static GROUNDTINT: number;
    /**@private */
    static EXPOSURE: number;
    /**@private */
    static SHADERDEFINE_SUN_HIGH_QUALITY: number;
    /**@private */
    static SHADERDEFINE_SUN_SIMPLE: number;
    /** 默认材质，禁止修改*/
    static defaultMaterial: SkyProceduralMaterial;
    /**@private */
    static shaderDefines: ShaderDefines;
    /**
     * @private
     */
    static __initDefine__(): void;
    /**@private */
    private _sunDisk;
    /**
     * 获取太阳状态。
     * @return  太阳状态。
     */
    /**
    * 设置太阳状态。
    * @param value 太阳状态。
    */
    sunDisk: number;
    /**
     * 获取太阳尺寸,范围是0到1。
     * @return  太阳尺寸。
     */
    /**
    * 设置太阳尺寸,范围是0到1。
    * @param value 太阳尺寸。
    */
    sunSize: number;
    /**
     * 获取太阳尺寸收缩,范围是0到20。
     * @return  太阳尺寸收缩。
     */
    /**
    * 设置太阳尺寸收缩,范围是0到20。
    * @param value 太阳尺寸收缩。
    */
    sunSizeConvergence: number;
    /**
     * 获取大气厚度,范围是0到5。
     * @return  大气厚度。
     */
    /**
    * 设置大气厚度,范围是0到5。
    * @param value 大气厚度。
    */
    atmosphereThickness: number;
    /**
     * 获取天空颜色。
     * @return  天空颜色。
     */
    /**
    * 设置天空颜色。
    * @param value 天空颜色。
    */
    skyTint: Vector4;
    /**
     * 获取地面颜色。
     * @return  地面颜色。
     */
    /**
    * 设置地面颜色。
    * @param value 地面颜色。
    */
    groundTint: Vector4;
    /**
     * 获取曝光强度,范围是0到8。
     * @return 曝光强度。
     */
    /**
    * 设置曝光强度,范围是0到8。
    * @param value 曝光强度。
    */
    exposure: number;
    /**
     * 创建一个 <code>SkyProceduralMaterial</code> 实例。
     */
    constructor();
    /**
 * 克隆。
 * @return	 克隆副本。
 */
    clone(): any;
}
