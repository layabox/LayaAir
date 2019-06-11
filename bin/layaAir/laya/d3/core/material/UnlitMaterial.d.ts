import { BaseTexture } from "laya/resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { BaseMaterial } from "././BaseMaterial";
/**
 * <code>UnlitMaterial</code> 类用于实现不受光照影响的材质。
 */
export declare class UnlitMaterial extends BaseMaterial {
    /**渲染状态_不透明。*/
    static RENDERMODE_OPAQUE: number;
    /**渲染状态_阿尔法测试。*/
    static RENDERMODE_CUTOUT: number;
    /**渲染状态__透明混合。*/
    static RENDERMODE_TRANSPARENT: number;
    /**渲染状态__加色法混合。*/
    static RENDERMODE_ADDTIVE: number;
    static SHADERDEFINE_ALBEDOTEXTURE: number;
    static SHADERDEFINE_TILINGOFFSET: number;
    static SHADERDEFINE_ENABLEVERTEXCOLOR: number;
    static ALBEDOTEXTURE: number;
    static ALBEDOCOLOR: number;
    static TILINGOFFSET: number;
    static CULL: number;
    static BLEND: number;
    static BLEND_SRC: number;
    static BLEND_DST: number;
    static DEPTH_TEST: number;
    static DEPTH_WRITE: number;
    /** 默认材质，禁止修改*/
    static defaultMaterial: UnlitMaterial;
    /**@private */
    static shaderDefines: ShaderDefines;
    /**
     * @private
     */
    static __initDefine__(): void;
    /**@private */
    private _albedoColor;
    /**@private */
    private _albedoIntensity;
    /**@private */
    private _enableVertexColor;
    /**
     * @private
     */
    /**
    * @private
    */
    _ColorR: number;
    /**
     * @private
     */
    /**
    * @private
    */
    _ColorG: number;
    /**
     * @private
     */
    /**
    * @private
    */
    _ColorB: number;
    /**@private */
    /**
    * @private
    */
    _ColorA: number;
    /**
     * @private
     */
    /**
    * @private
    */
    _AlbedoIntensity: number;
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
     * @private
     */
    /**
    * @private
    */
    _Cutoff: number;
    /**
     * 获取反照率颜色R分量。
     * @return 反照率颜色R分量。
     */
    /**
    * 设置反照率颜色R分量。
    * @param value 反照率颜色R分量。
    */
    albedoColorR: number;
    /**
     * 获取反照率颜色G分量。
     * @return 反照率颜色G分量。
     */
    /**
    * 设置反照率颜色G分量。
    * @param value 反照率颜色G分量。
    */
    albedoColorG: number;
    /**
     * 获取反照率颜色B分量。
     * @return 反照率颜色B分量。
     */
    /**
    * 设置反照率颜色B分量。
    * @param value 反照率颜色B分量。
    */
    albedoColorB: number;
    /**
     * 获取反照率颜色Z分量。
     * @return 反照率颜色Z分量。
     */
    /**
    * 设置反照率颜色alpha分量。
    * @param value 反照率颜色alpha分量。
    */
    albedoColorA: number;
    /**
     * 获取反照率颜色。
     * @return 反照率颜色。
     */
    /**
    * 设置反照率颜色。
    * @param value 反照率颜色。
    */
    albedoColor: Vector4;
    /**
     * 获取反照率强度。
     * @return 反照率强度。
     */
    /**
    * 设置反照率强度。
    * @param value 反照率强度。
    */
    albedoIntensity: number;
    /**
     * 获取反照率贴图。
     * @return 反照率贴图。
     */
    /**
    * 设置反照率贴图。
    * @param value 反照率贴图。
    */
    albedoTexture: BaseTexture;
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
    * 获取纹理平铺和偏移。
    * @param value 纹理平铺和偏移。
    */
    tilingOffset: Vector4;
    /**
     * 获取是否支持顶点色。
     * @return  是否支持顶点色。
     */
    /**
    * 设置是否支持顶点色。
    * @param value  是否支持顶点色。
    */
    enableVertexColor: boolean;
    /**
     * 设置渲染模式。
     * @return 渲染模式。
     */
    renderMode: number;
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
