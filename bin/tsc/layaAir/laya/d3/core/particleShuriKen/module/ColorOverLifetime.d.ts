import { GradientColor } from "./GradientColor";
/**
 * <code>ColorOverLifetime</code> 类用于粒子的生命周期颜色。
 */
export declare class ColorOverLifetime {
    private _color;
    /**是否启用。*/
    enbale: boolean;
    /**
     *获取颜色。
     */
    readonly color: GradientColor;
    /**
     * 创建一个 <code>ColorOverLifetime</code> 实例。
     */
    constructor(color: GradientColor);
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
