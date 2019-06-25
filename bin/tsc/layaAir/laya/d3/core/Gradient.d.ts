import { IClone } from "./IClone";
import { Color } from "../math/Color";
/**
 * <code>Gradient</code> 类用于创建颜色渐变。
 */
export declare class Gradient implements IClone {
    /**@private */
    private _mode;
    /**@private */
    private _maxColorRGBKeysCount;
    /**@private */
    private _maxColorAlphaKeysCount;
    /**@private */
    private _colorRGBKeysCount;
    /**@private */
    private _colorAlphaKeysCount;
    /**@private */
    _alphaElements: Float32Array;
    /**@private */
    _rgbElements: Float32Array;
    /**
     * 获取梯度模式。
     * @return  梯度模式。
     */
    /**
    * 设置梯度模式。
    * @param value 梯度模式。
    */
    mode: number;
    /**
     * 获取颜色RGB数量。
     * @return 颜色RGB数量。
     */
    readonly colorRGBKeysCount: number;
    /**
     * 获取颜色Alpha数量。
     * @return 颜色Alpha数量。
     */
    readonly colorAlphaKeysCount: number;
    /**
     * 获取最大颜色RGB帧数量。
     * @return 最大RGB帧数量。
     */
    readonly maxColorRGBKeysCount: number;
    /**
     * 获取最大颜色Alpha帧数量。
     * @return 最大Alpha帧数量。
     */
    readonly maxColorAlphaKeysCount: number;
    /**
     * 创建一个 <code>Gradient</code> 实例。
     * @param maxColorRGBKeyCount 最大RGB帧个数。
     * @param maxColorAlphaKeyCount 最大Alpha帧个数。
     */
    constructor(maxColorRGBKeyCount: number, maxColorAlphaKeyCount: number);
    /**
     * 增加颜色RGB帧。
     * @param	key 生命周期，范围为0到1。
     * @param	value RGB值。
     */
    addColorRGB(key: number, value: Color): void;
    /**
     * 增加颜色Alpha帧。
     * @param	key 生命周期，范围为0到1。
     * @param	value Alpha值。
     */
    addColorAlpha(key: number, value: number): void;
    /**
     * 更新颜色RGB帧。
     * @param   index 索引。
     * @param	key 生命周期，范围为0到1。
     * @param	value RGB值。
     */
    updateColorRGB(index: number, key: number, value: Color): void;
    /**
     * 更新颜色Alpha帧。
     * @param   index 索引。
     * @param	key 生命周期，范围为0到1。
     * @param	value Alpha值。
     */
    updateColorAlpha(index: number, key: number, value: number): void;
    /**
     * 通过插值获取RGB颜色。
     * @param  lerpFactor 插值因子。
     * @param  out 颜色结果。
     * @param  开始查找索引。
     * @return 结果索引。
     */
    evaluateColorRGB(lerpFactor: number, out: Color, startSearchIndex?: number, reverseSearch?: boolean): number;
    /**
     * 通过插值获取透明值。
     * @param  lerpFactor 插值因子。
     * @param  out 颜色结果。
     * @param  开始查找索引。
     * @return 结果索引 。
     */
    evaluateColorAlpha(lerpFactor: number, outColor: Color, startSearchIndex?: number, reverseSearch?: boolean): number;
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
}
