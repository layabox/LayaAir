import { Filter } from "./Filter";
import { IFilter } from "./IFilter";
/**
 * <p><code>ColorFilter</code> 是颜色滤镜。使用 ColorFilter 类可以将 4 x 5 矩阵转换应用于输入图像上的每个像素的 RGBA 颜色和 Alpha 值，以生成具有一组新的 RGBA 颜色和 Alpha 值的结果。该类允许饱和度更改、色相旋转、亮度转 Alpha 以及各种其他效果。您可以将滤镜应用于任何显示对象（即，从 Sprite 类继承的对象）。</p>
 * <p>注意：对于 RGBA 值，最高有效字节代表红色通道值，其后的有效字节分别代表绿色、蓝色和 Alpha 通道值。</p>
 */
export declare class ColorFilter extends Filter implements IFilter {
    /**对比度列表*/
    private static DELTA_INDEX;
    /**灰色矩阵*/
    private static GRAY_MATRIX;
    /**单位矩阵,表示什么效果都没有*/
    private static IDENTITY_MATRIX;
    /**标准矩阵长度*/
    private static LENGTH;
    /**当前使用的矩阵*/
    private _matrix;
    /**
     * 创建一个 <code>ColorFilter</code> 实例。
     * @param mat	（可选）由 20 个项目（排列成 4 x 5 矩阵）组成的数组，用于颜色转换。
     */
    constructor(mat?: any[]);
    /**
     * 设置为灰色滤镜
     */
    gray(): ColorFilter;
    /**
     * 设置为变色滤镜
     * @param red 红色增量,范围:0~255
     * @param green 绿色增量,范围:0~255
     * @param blue 蓝色增量,范围:0~255
     * @param alpha alpha,范围:0~1
     */
    color(red?: number, green?: number, blue?: number, alpha?: number): ColorFilter;
    /**
     * 设置滤镜色
     * @param	color 颜色值
     */
    setColor(color: string): ColorFilter;
    /**
     * 设置矩阵数据
     * @param matrix 由 20 个项目（排列成 4 x 5 矩阵）组成的数组
     * @return this
     */
    setByMatrix(matrix: any[]): ColorFilter;
    /**@private */
    readonly type: number;
    /**
     * 调整颜色，包括亮度，对比度，饱和度和色调
     * @param brightness 亮度,范围:-100~100
     * @param contrast 对比度,范围:-100~100
     * @param saturation 饱和度,范围:-100~100
     * @param hue 色调,范围:-180~180
     * @return this
     */
    adjustColor(brightness: number, contrast: number, saturation: number, hue: number): ColorFilter;
    /**
     * 调整亮度
     * @param brightness 亮度,范围:-100~100
     * @return this
     */
    adjustBrightness(brightness: number): ColorFilter;
    /**
     * 调整对比度
     * @param contrast 对比度,范围:-100~100
     * @return this
     */
    adjustContrast(contrast: number): ColorFilter;
    /**
     * 调整饱和度
     * @param saturation 饱和度,范围:-100~100
     * @return this
     */
    adjustSaturation(saturation: number): ColorFilter;
    /**
     * 调整色调
     * @param hue 色调,范围:-180~180
     * @return this
     */
    adjustHue(hue: number): ColorFilter;
    /**
     * 重置成单位矩阵，去除滤镜效果
     */
    reset(): ColorFilter;
    /**
     * 矩阵乘法
     * @param matrix
     * @return this
     */
    private _multiplyMatrix;
    /**
     * 规范值的范围
     * @param val 当前值
     * @param limit 值的范围-limit~limit
     */
    private _clampValue;
    /**
     * 规范矩阵,将矩阵调整到正确的大小
     * @param matrix 需要调整的矩阵
     */
    private _fixMatrix;
    /**
     * 复制矩阵
     */
    private _copyMatrix;
}
