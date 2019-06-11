import { IClone } from "../core/IClone";
/**
 * <code>Color</code> 类用于创建颜色实例。
 */
export declare class Color implements IClone {
    /**
     * 红色
     */
    static RED: Color;
    /**
     * 绿色
     */
    static GREEN: Color;
    /**
     * 蓝色
     */
    static BLUE: Color;
    /**
     * 蓝绿色
     */
    static CYAN: Color;
    /**
     * 黄色
     */
    static YELLOW: Color;
    /**
     * 品红色
     */
    static MAGENTA: Color;
    /**
     * 灰色
     */
    static GRAY: Color;
    /**
     * 白色
     */
    static WHITE: Color;
    /**
     * 黑色
     */
    static BLACK: Color;
    static gammaToLinearSpace(value: number): number;
    static linearToGammaSpace(value: number): number;
    /**red分量*/
    r: number;
    /**green分量*/
    g: number;
    /**blue分量*/
    b: number;
    /**alpha分量*/
    a: number;
    /**
     * 创建一个 <code>Color</code> 实例。
     * @param	r  颜色的red分量。
     * @param	g  颜色的green分量。
     * @param	b  颜色的blue分量。
     * @param	a  颜色的alpha分量。
     */
    constructor(r?: number, g?: number, b?: number, a?: number);
    /**
     * Gamma空间转换到线性空间。
     * @param	linear 线性空间颜色。
     */
    toLinear(out: Color): void;
    /**
     * 线性空间转换到Gamma空间。
     * @param	gamma Gamma空间颜色。
     */
    toGamma(out: Color): void;
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
    forNativeElement(): void;
}
