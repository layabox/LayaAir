import { IClone } from "../utils/IClone";

/**
 * <code>Color</code> 类用于创建颜色实例。
 */
export class Color implements IClone {
    /**
     * 红色
     */
    static RED: Color = new Color(1, 0, 0, 1);
    /**
     * 绿色
     */
    static GREEN: Color = new Color(0, 1, 0, 1);
    /**
     * 蓝色
     */
    static BLUE: Color = new Color(0, 0, 1, 1);
    /**
     * 蓝绿色
     */
    static CYAN: Color = new Color(0, 1, 1, 1);
    /**
     * 黄色
     */
    static YELLOW: Color = new Color(1, 0.92, 0.016, 1);
    /**
     * 品红色
     */
    static MAGENTA: Color = new Color(1, 0, 1, 1);
    /**
     * 灰色
     */
    static GRAY: Color = new Color(0.5, 0.5, 0.5, 1);
    /**
     * 白色
     */
    static WHITE: Color = new Color(1, 1, 1, 1);
    /**
     * 黑色
     */
    static BLACK: Color = new Color(0, 0, 0, 1);
    /**
     * 全透明
     */
    static CLEAR: Color = new Color(0, 0, 0, 0);

    /**
     * Gamma空间值转换到线性空间。
     * @param value gamma空间值。
     */
    static gammaToLinearSpace(value: number): number {
        // http://www.opengl.org/registry/specs/EXT/framebuffer_sRGB.txt
        // http://www.opengl.org/registry/specs/EXT/texture_sRGB_decode.txt
        // {  cs / 12.92,                 cs <= 0.04045 }
        // {  ((cs + 0.055)/1.055)^2.4,   cs >  0.04045 }
        if (value <= 0.04045)
            return value / 12.92;
        else if (value < 1.0)
            return Math.pow((value + 0.055) / 1.055, 2.4);
        else
            return Math.pow(value, 2.4);
    }

    /**
     * 线性空间值转换到Gamma空间。
     * @param value 线性空间值。
     */
    static linearToGammaSpace(value: number): number {
        // http://www.opengl.org/registry/specs/EXT/framebuffer_sRGB.txt
        // http://www.opengl.org/registry/specs/EXT/texture_sRGB_decode.txt
        // {  0.0,                          0         <= cl
        // {  12.92 * c,                    0         <  cl < 0.0031308
        // {  1.055 * cl^0.41666 - 0.055,   0.0031308 <= cl < 1
        // {  1.0,                                       cl >= 1  <- This has been adjusted since we want to maintain HDR colors
        if (value <= 0.0)
            return 0.0;
        else if (value <= 0.0031308)
            return 12.92 * value;
        else if (value <= 1.0)
            return 1.055 * Math.pow(value, 0.41666) - 0.055;
        else
            return Math.pow(value, 0.41666);
    }


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
    constructor(r: number = 1, g: number = 1, b: number = 1, a: number = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    equal(c: Color): boolean {
        if (!c) return false;
        const toFIxed = (a: number, b: number) => {
            var delta = 1e-5;
            return -delta < a - b && a - b < delta;
        }
        return toFIxed(c.r, this.r) && toFIxed(c.g, this.g) && toFIxed(c.b, this.b) && toFIxed(c.a, this.a);
    }

    /**
     * Gamma空间转换到线性空间。
     * @param	linear 线性空间颜色。
     */
    toLinear(out: Color): void {
        out.r = Color.gammaToLinearSpace(this.r);
        out.g = Color.gammaToLinearSpace(this.g);
        out.b = Color.gammaToLinearSpace(this.b);
        out.a = this.a;
    }

    /**
     * 线性空间转换到Gamma空间。
     * @param	gamma Gamma空间颜色。
     */
    toGamma(out: Color): void {
        out.r = Color.linearToGammaSpace(this.r);
        out.g = Color.linearToGammaSpace(this.g);
        out.b = Color.linearToGammaSpace(this.b);
        out.a = this.a;
    }

    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void {
        var destColor: Color = (<Color>destObject);
        destColor.r = this.r;
        destColor.g = this.g;
        destColor.b = this.b;
        destColor.a = this.a;
    }

    scale(value: number): Color {
        this.r = this.r * value;
        this.g = this.g * value;
        this.b = this.b * value;
        return this;
    }

    setValue(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    /**
     * 从Array数组拷贝值。
     * @param  array 数组。
     * @param  offset 数组偏移。
     */
    fromArray(array: any[], offset: number = 0): void {
        this.r = array[offset + 0];
        this.g = array[offset + 1];
        this.b = array[offset + 2];
        this.a = array[offset + 3];
    }

    /**
     * 转换为Array数组
     * @return
     */
    toArray(): Array<number> {
        return [this.r, this.g, this.b, this.a];
    }

    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any {
        var dest: Color = new Color();
        this.cloneTo(dest);
        return dest;
    }
}


