import { BaseTexture } from "../../../resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { BaseMaterial } from "./BaseMaterial";
/**
 * <code>PBRStandardMaterial</code> 类用于实现PBR(Standard)材质。
 */
export declare class PBRStandardMaterial extends BaseMaterial {
    /**光滑度数据源_金属度贴图的Alpha通道。*/
    static SmoothnessSource_MetallicGlossTexture_Alpha: number;
    /**光滑度数据源_反射率贴图的Alpha通道。*/
    static SmoothnessSource_AlbedoTexture_Alpha: number;
    /**渲染状态_不透明。*/
    static RENDERMODE_OPAQUE: number;
    /**渲染状态_透明测试。*/
    static RENDERMODE_CUTOUT: number;
    /**渲染状态_透明混合_游戏中经常使用的透明。*/
    static RENDERMODE_FADE: number;
    /**渲染状态_透明混合_物理上看似合理的透明。*/
    static RENDERMODE_TRANSPARENT: number;
    static SHADERDEFINE_ALBEDOTEXTURE: number;
    static SHADERDEFINE_NORMALTEXTURE: number;
    static SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA: number;
    static SHADERDEFINE_METALLICGLOSSTEXTURE: number;
    static SHADERDEFINE_OCCLUSIONTEXTURE: number;
    static SHADERDEFINE_PARALLAXTEXTURE: number;
    static SHADERDEFINE_EMISSION: number;
    static SHADERDEFINE_EMISSIONTEXTURE: number;
    static SHADERDEFINE_REFLECTMAP: number;
    static SHADERDEFINE_TILINGOFFSET: number;
    static SHADERDEFINE_ALPHAPREMULTIPLY: number;
    static ALBEDOTEXTURE: number;
    static METALLICGLOSSTEXTURE: number;
    static NORMALTEXTURE: number;
    static PARALLAXTEXTURE: number;
    static OCCLUSIONTEXTURE: number;
    static EMISSIONTEXTURE: number;
    static ALBEDOCOLOR: number;
    static EMISSIONCOLOR: number;
    static METALLIC: number;
    static SMOOTHNESS: number;
    static SMOOTHNESSSCALE: number;
    static SMOOTHNESSSOURCE: number;
    static OCCLUSIONSTRENGTH: number;
    static NORMALSCALE: number;
    static PARALLAXSCALE: number;
    static ENABLEEMISSION: number;
    static ENABLEREFLECT: number;
    static TILINGOFFSET: number;
    static CULL: number;
    static BLEND: number;
    static BLEND_SRC: number;
    static BLEND_DST: number;
    static DEPTH_TEST: number;
    static DEPTH_WRITE: number;
    /** 默认材质，禁止修改*/
    static defaultMaterial: PBRStandardMaterial;
    private _albedoColor;
    private _emissionColor;
    /**
     * 获取反射率颜色R分量。
     * @return 反射率颜色R分量。
     */
    /**
    * 设置反射率颜色R分量。
    * @param value 反射率颜色R分量。
    */
    albedoColorR: number;
    /**
     * 获取反射率颜色G分量。
     * @return 反射率颜色G分量。
     */
    /**
    * 设置反射率颜色G分量。
    * @param value 反射率颜色G分量。
    */
    albedoColorG: number;
    /**
     * 获取反射率颜色B分量。
     * @return 反射率颜色B分量。
     */
    /**
    * 设置反射率颜色B分量。
    * @param value 反射率颜色B分量。
    */
    albedoColorB: number;
    /**
     * 获取反射率颜色Z分量。
     * @return 反射率颜色Z分量。
     */
    /**
    * 设置反射率颜色alpha分量。
    * @param value 反射率颜色alpha分量。
    */
    albedoColorA: number;
    /**
     * 获取漫反射颜色。
     * @return 漫反射颜色。
     */
    /**
    * 设置漫反射颜色。
    * @param value 漫反射颜色。
    */
    albedoColor: Vector4;
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
     * 获取法线贴图。
     * @return 法线贴图。
     */
    /**
    * 设置法线贴图。
    * @param value 法线贴图。
    */
    normalTexture: BaseTexture;
    /**
     * 获取法线贴图缩放系数。
     * @return 法线贴图缩放系数。
     */
    /**
    * 设置法线贴图缩放系数。
    * @param value 法线贴图缩放系数。
    */
    normalTextureScale: number;
    /**
     * 获取视差贴图。
     * @return 视察贴图。
     */
    /**
    * 设置视差贴图。
    * @param value 视察贴图。
    */
    parallaxTexture: BaseTexture;
    /**
     * 获取视差贴图缩放系数。
     * @return 视差缩放系数。
     */
    /**
    * 设置视差贴图缩放系数。
    * @param value 视差缩放系数。
    */
    parallaxTextureScale: number;
    /**
     * 获取遮挡贴图。
     * @return 遮挡贴图。
     */
    /**
    * 设置遮挡贴图。
    * @param value 遮挡贴图。
    */
    occlusionTexture: BaseTexture;
    /**
     * 获取遮挡贴图强度。
     * @return 遮挡贴图强度,范围为0到1。
     */
    /**
    * 设置遮挡贴图强度。
    * @param value 遮挡贴图强度,范围为0到1。
    */
    occlusionTextureStrength: number;
    /**
     * 获取金属光滑度贴图。
     * @return 金属光滑度贴图。
     */
    /**
    * 设置金属光滑度贴图。
    * @param value 金属光滑度贴图。
    */
    metallicGlossTexture: BaseTexture;
    /**
     * 获取金属度。
     * @return 金属度,范围为0到1。
     */
    /**
    * 设置金属度。
    * @param value 金属度,范围为0到1。
    */
    metallic: number;
    /**
     * 获取光滑度。
     * @return 光滑度,范围为0到1。
     */
    /**
    * 设置光滑度。
    * @param value 光滑度,范围为0到1。
    */
    smoothness: number;
    /**
     * 获取光滑度缩放系数。
     * @return 光滑度缩放系数,范围为0到1。
     */
    /**
    * 设置光滑度缩放系数。
    * @param value 光滑度缩放系数,范围为0到1。
    */
    smoothnessTextureScale: number;
    /**
     * 获取光滑度数据源
     * @return 光滑滑度数据源,0或1。
     */
    /**
    * 设置光滑度数据源。
    * @param value 光滑滑度数据源,0或1。
    */
    smoothnessSource: number;
    /**
     * 获取是否激活放射属性。
     * @return 是否激活放射属性。
     */
    /**
    * 设置是否激活放射属性。
    * @param value 是否激活放射属性
    */
    enableEmission: boolean;
    /**
     * 获取放射颜色R分量。
     * @return 放射颜色R分量。
     */
    /**
    * 设置放射颜色R分量。
    * @param value 放射颜色R分量。
    */
    emissionColorR: number;
    /**
     * 获取放射颜色G分量。
     * @return 放射颜色G分量。
     */
    /**
    * 设置放射颜色G分量。
    * @param value 放射颜色G分量。
    */
    emissionColorG: number;
    /**
     * 获取放射颜色B分量。
     * @return 放射颜色B分量。
     */
    /**
    * 设置放射颜色B分量。
    * @param value 放射颜色B分量。
    */
    emissionColorB: number;
    /**
     * 获取放射颜色A分量。
     * @return 放射颜色A分量。
     */
    /**
    * 设置放射颜色A分量。
    * @param value 放射颜色A分量。
    */
    emissionColorA: number;
    /**
     * 获取放射颜色。
     * @return 放射颜色。
     */
    /**
    * 设置放射颜色。
    * @param value 放射颜色。
    */
    emissionColor: Vector4;
    /**
     * 获取放射贴图。
     * @return 放射贴图。
     */
    /**
    * 设置放射贴图。
    * @param value 放射贴图。
    */
    emissionTexture: BaseTexture;
    /**
     * 获取是否开启反射。
     * @return 是否开启反射。
     */
    /**
    * 设置是否开启反射。
    * @param value 是否开启反射。
    */
    enableReflection: boolean;
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
    /**
     * 创建一个 <code>PBRStandardMaterial</code> 实例。
     */
    constructor();
    /**
 * 克隆。
 * @return	 克隆副本。
 */
    clone(): any;
    /**
     * @inheritDoc
     */
    cloneTo(destObject: any): void;
}
