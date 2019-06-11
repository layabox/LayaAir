import { Vector4 } from "../../math/Vector4";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { BaseMaterial } from "../material/BaseMaterial";
/**
 * ...
 * @author
 */
export declare class PixelLineMaterial extends BaseMaterial {
    static COLOR: number;
    /** 默认材质，禁止修改*/
    static defaultMaterial: PixelLineMaterial;
    /**@private */
    static shaderDefines: ShaderDefines;
    static CULL: number;
    static BLEND: number;
    static BLEND_SRC: number;
    static BLEND_DST: number;
    static DEPTH_TEST: number;
    static DEPTH_WRITE: number;
    /**
    * @private
    */
    static __initDefine__(): void;
    /**
     * 获取颜色。
     * @return 颜色。
     */
    /**
    * 设置颜色。
    * @param value 颜色。
    */
    color: Vector4;
    /**
     * 设置是否写入深度。
     * @param value 是否写入深度。
     */
    /**
    * 获取是否写入深度。
    * @return 是否写入深度。
    */
    depthWrite: boolean;
    /**
     * 设置剔除方式。
     * @param value 剔除方式。
     */
    /**
    * 获取剔除方式。
    * @return 剔除方式。
    */
    cull: number;
    /**
     * 设置混合方式。
     * @param value 混合方式。
     */
    /**
    * 获取混合方式。
    * @return 混合方式。
    */
    blend: number;
    /**
     * 设置混合源。
     * @param value 混合源
     */
    /**
    * 获取混合源。
    * @return 混合源。
    */
    blendSrc: number;
    /**
     * 设置混合目标。
     * @param value 混合目标
     */
    /**
    * 获取混合目标。
    * @return 混合目标。
    */
    blendDst: number;
    /**
     * 设置深度测试方式。
     * @param value 深度测试方式
     */
    /**
    * 获取深度测试方式。
    * @return 深度测试方式。
    */
    depthTest: number;
    constructor();
    /**
 * 克隆。
 * @return	 克隆副本。
 */
    clone(): any;
}
