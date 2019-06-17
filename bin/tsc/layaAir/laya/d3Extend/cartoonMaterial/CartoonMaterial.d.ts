import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { Vector4 } from "laya/d3/math/Vector4";
import { ShaderDefines } from "laya/d3/shader/ShaderDefines";
import { BaseTexture } from "laya/resource/BaseTexture";
export declare class CartoonMaterial extends BaseMaterial {
    static ALBEDOTEXTURE: number;
    static BLENDTEXTURE: number;
    static OUTLINETEXTURE: number;
    static SHADOWCOLOR: number;
    static SHADOWRANGE: number;
    static SHADOWINTENSITY: number;
    static SPECULARRANGE: number;
    static SPECULARINTENSITY: number;
    static OUTLINEWIDTH: number;
    static OUTLINELIGHTNESS: number;
    static TILINGOFFSET: number;
    static SHADERDEFINE_ALBEDOTEXTURE: number;
    static SHADERDEFINE_BLENDTEXTURE: number;
    static SHADERDEFINE_OUTLINETEXTURE: number;
    static SHADERDEFINE_TILINGOFFSET: number;
    /**@private */
    static shaderDefines: ShaderDefines;
    /**
     * @private
     */
    static __init__(): void;
    static initShader(): void;
    /**
     * 获取漫反射贴图。
     * @return 漫反射贴图。
     */
    /**
    * 设置漫反射贴图。
    * @param value 漫反射贴图。
    */
    albedoTexture: BaseTexture;
    /**
     * 获取混合贴图。
     * @return 混合贴图。
     */
    /**
    * 设置混合贴图。
    * @param value 混合贴图。
    */
    blendTexture: BaseTexture;
    /**
     * 获取漫轮廓贴图。
     * @return 轮廓贴图。
     */
    /**
    * 设置轮廓贴图。
    * @param value 轮廓贴图。
    */
    outlineTexture: BaseTexture;
    /**
     * 获取阴影颜色。
     * @return 阴影颜色。
     */
    /**
    * 设置阴影颜色。
    * @param value 阴影颜色。
    */
    shadowColor: Vector4;
    /**
     * 获取阴影范围。
     * @return 阴影范围,范围为0到1。
     */
    /**
    * 设置阴影范围。
    * @param value 阴影范围,范围为0到1。
    */
    shadowRange: number;
    /**
     * 获取阴影强度。
     * @return 阴影强度,范围为0到1。
     */
    /**
    * 设置阴影强度。
    * @param value 阴影强度,范围为0到1。
    */
    shadowIntensity: number;
    /**
     * 获取高光范围。
     * @return 高光范围,范围为0.9到1。
     */
    /**
    * 设置高光范围。
    * @param value 高光范围,范围为0.9到1。
    */
    specularRange: number;
    /**
     * 获取高光强度。
     * @return 高光强度,范围为0到1。
     */
    /**
    * 设置高光强度。
    * @param value 高光范围,范围为0到1。
    */
    specularIntensity: number;
    /**
     * 获取轮廓宽度。
     * @return 轮廓宽度,范围为0到0.05。
     */
    /**
    * 设置轮廓宽度。
    * @param value 轮廓宽度,范围为0到0.05。
    */
    outlineWidth: number;
    /**
     * 获取轮廓亮度。
     * @return 轮廓亮度,范围为0到1。
     */
    /**
    * 设置轮廓亮度。
    * @param value 轮廓亮度,范围为0到1。
    */
    outlineLightness: number;
    /**
     * 获取纹理平铺和偏移。
     * @return 纹理平铺和偏移。
     */
    /**
    * 设置纹理平铺和偏移。
    * @param value 纹理平铺和偏移。
    */
    tilingOffset: Vector4;
    constructor();
    /**
 * 克隆。
 * @return	 克隆副本。
 */
    clone(): any;
}
