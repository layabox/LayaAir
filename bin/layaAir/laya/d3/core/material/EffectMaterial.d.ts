import { BaseTexture } from "laya/resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { BaseMaterial } from "./BaseMaterial";
/**
 * <code>EffectMaterial</code> 类用于实现Mesh特效材质。
 */
export declare class EffectMaterial extends BaseMaterial {
    /**渲染状态_加色法混合。*/
    static RENDERMODE_ADDTIVE: number;
    /**渲染状态_透明混合。*/
    static RENDERMODE_ALPHABLENDED: number;
    /** 默认材质，禁止修改*/
    static defaultMaterial: EffectMaterial;
    static SHADERDEFINE_MAINTEXTURE: number;
    static SHADERDEFINE_TILINGOFFSET: number;
    static SHADERDEFINE_ADDTIVEFOG: number;
    static MAINTEXTURE: number;
    static TINTCOLOR: number;
    static TILINGOFFSET: number;
    static CULL: number;
    static BLEND: number;
    static BLEND_SRC: number;
    static BLEND_DST: number;
    static DEPTH_TEST: number;
    static DEPTH_WRITE: number;
    /**@private */
    static shaderDefines: ShaderDefines;
    /**
     * @private
     */
    static __initDefine__(): void;
    /**@private */
    private _color;
    /**
     * @private
     */
    /**
    * @private
    */
    _TintColorR: number;
    /**
     * @private
     */
    /**
    * @private
    */
    _TintColorG: number;
    /**
     * @private
     */
    /**
    * @private
    */
    _TintColorB: number;
    /**@private */
    /**
    * @private
    */
    _TintColorA: number;
    /**
     * @private
     */
    /**
    * @private
    */
    _MainTex_STX: number;
    /**
     * @private
     */
    /**
    * @private
    */
    _MainTex_STY: number;
    /**
     * @private
     */
    /**
    * @private
    */
    _MainTex_STZ: number;
    /**
     * @private
     */
    /**
    * @private
    */
    _MainTex_STW: number;
    /**
     * 设置渲染模式。
     * @return 渲染模式。
     */
    renderMode: number;
    /**
     * 获取颜色R分量。
     * @return 颜色R分量。
     */
    /**
    * 设置颜色R分量。
    * @param value 颜色R分量。
    */
    colorR: number;
    /**
     * 获取颜色G分量。
     * @return 颜色G分量。
     */
    /**
    * 设置颜色G分量。
    * @param value 颜色G分量。
    */
    colorG: number;
    /**
     * 获取颜色B分量。
     * @return 颜色B分量。
     */
    /**
    * 设置颜色B分量。
    * @param value 颜色B分量。
    */
    colorB: number;
    /**
     * 获取颜色Z分量。
     * @return 颜色Z分量。
     */
    /**
    * 设置颜色alpha分量。
    * @param value 颜色alpha分量。
    */
    colorA: number;
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
     * 获取贴图。
     * @return 贴图。
     */
    /**
    * 设置贴图。
    * @param value 贴图。
    */
    texture: BaseTexture;
    /**
     * 获取纹理平铺和偏移X分量。
     * @return 纹理平铺和偏移X分量。
     */
    /**
    * 获取纹理平铺和偏移X分量。
    * @param x 纹理平铺和偏移X分量。
    */
    tilingOffsetX: number;
    /**
     * 获取纹理平铺和偏移Y分量。
     * @return 纹理平铺和偏移Y分量。
     */
    /**
    * 获取纹理平铺和偏移Y分量。
    * @param y 纹理平铺和偏移Y分量。
    */
    tilingOffsetY: number;
    /**
     * 获取纹理平铺和偏移Z分量。
     * @return 纹理平铺和偏移Z分量。
     */
    /**
    * 获取纹理平铺和偏移Z分量。
    * @param z 纹理平铺和偏移Z分量。
    */
    tilingOffsetZ: number;
    /**
     * 获取纹理平铺和偏移W分量。
     * @return 纹理平铺和偏移W分量。
     */
    /**
    * 获取纹理平铺和偏移W分量。
    * @param w 纹理平铺和偏移W分量。
    */
    tilingOffsetW: number;
    /**
     * 获取纹理平铺和偏移。
     * @return 纹理平铺和偏移。
     */
    /**
    * 设置纹理平铺和偏移。
    * @param value 纹理平铺和偏移。
    */
    tilingOffset: Vector4;
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
