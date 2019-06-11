import { PostProcessEffect } from "././PostProcessEffect";
import { PostProcessRenderContext } from "././PostProcessRenderContext";
import { Color } from "../../math/Color";
import { Texture2D } from "laya/resource/Texture2D";
/**
 * <code>BloomEffect</code> 类用于创建泛光效果。
 */
export declare class BloomEffect extends PostProcessEffect {
    /** @private */
    static SHADERVALUE_MAINTEX: number;
    /**@private */
    static SHADERVALUE_AUTOEXPOSURETEX: number;
    /**@private */
    static SHADERVALUE_SAMPLESCALE: number;
    /**@private */
    static SHADERVALUE_THRESHOLD: number;
    /**@private */
    static SHADERVALUE_PARAMS: number;
    /**@private */
    static SHADERVALUE_BLOOMTEX: number;
    /**@private */
    private static SUBSHADER_PREFILTER13;
    /**@private */
    private static SUBSHADER_PREFILTER4;
    /**@private */
    private static SUBSHADER_DOWNSAMPLE13;
    /**@private */
    private static SUBSHADER_DOWNSAMPLE4;
    /**@private */
    private static SUBSHADER_UPSAMPLETENT;
    /**@private */
    private static SUBSHADER_UPSAMPLEBOX;
    /**@private */
    private static MAXPYRAMIDSIZE;
    /**@private */
    private _shader;
    /**@private */
    private _shaderData;
    /**@private */
    private _linearColor;
    /**@private */
    private _bloomTextureTexelSize;
    /**@private */
    private _shaderThreshold;
    /**@private */
    private _shaderParams;
    /**@private */
    private _pyramid;
    /**@private */
    private _intensity;
    /**@private */
    private _threshold;
    /**@private */
    private _softKnee;
    /**@private */
    private _diffusion;
    /**@private */
    private _anamorphicRatio;
    /**@private */
    private _dirtIntensity;
    /**@private */
    private _shaderSetting;
    /**@private */
    private _dirtTileOffset;
    /**限制泛光像素的数量,该值在伽马空间。*/
    clamp: number;
    /**泛光颜色。*/
    color: Color;
    /**是否开启快速模式。该模式通过降低质量来提升性能。*/
    fastMode: boolean;
    /**镜头污渍纹路,用于为泛光特效增加污渍灰尘效果*/
    dirtTexture: Texture2D;
    /**
     * 获取泛光过滤器强度,最小值为0。
     * @return 强度。
     */
    /**
    * 设置泛光过滤器强度,最小值为0。
    * @param value 强度。
    */
    intensity: number;
    /**
     * 设置泛光阈值,在该阈值亮度以下的像素会被过滤掉,该值在伽马空间。
     * @return 阈值。
     */
    /**
    * 获取泛光阈值,在该阈值亮度以下的像素会被过滤掉,该值在伽马空间。
    * @param value 阈值。
    */
    threshold: number;
    /**
     * 获取软膝盖过渡强度,在阈值以下进行渐变过渡(0为完全硬过度,1为完全软过度)。
     * @return 软膝盖值。
     */
    /**
    * 设置软膝盖过渡强度,在阈值以下进行渐变过渡(0为完全硬过度,1为完全软过度)。
    * @param value 软膝盖值。
    */
    softKnee: number;
    /**
     * 获取扩散值,改变泛光的扩散范围,最好使用整数值保证效果,该值会改变内部的迭代次数,范围是1到10。
     * @return 光晕的扩散范围。
     */
    /**
    * 设置扩散值,改变泛光的扩散范围,最好使用整数值保证效果,该值会改变内部的迭代次数,范围是1到10。
    * @param value 光晕的扩散范围。
    */
    diffusion: number;
    /**
     * 获取形变比,通过扭曲泛光产生视觉上形变,负值为垂直扭曲,正值为水平扭曲。
     * @return 形变比。
     */
    /**
    * 设置形变比,通过扭曲泛光产生视觉上形变,负值为垂直扭曲,正值为水平扭曲。
    * @param value 形变比。
    */
    anamorphicRatio: number;
    /**
     * 获取污渍强度。
     * @return 污渍强度。
     */
    /**
    * 设置污渍强度。
    * @param value 污渍强度。
    */
    dirtIntensity: number;
    /**
     * 创建一个 <code>BloomEffect</code> 实例。
     */
    constructor();
    /**
     * @inheritDoc
     */
    render(context: PostProcessRenderContext): void;
}
