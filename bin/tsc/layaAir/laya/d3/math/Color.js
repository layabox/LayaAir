/**
 * <code>Color</code> 类用于创建颜色实例。
 */
export class Color {
    /**
     * 创建一个 <code>Color</code> 实例。
     * @param	r  颜色的red分量。
     * @param	g  颜色的green分量。
     * @param	b  颜色的blue分量。
     * @param	a  颜色的alpha分量。
     */
    constructor(r = 1, g = 1, b = 1, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    // http://www.opengl.org/registry/specs/EXT/framebuffer_sRGB.txt
    // http://www.opengl.org/registry/specs/EXT/texture_sRGB_decode.txt
    // {  cs / 12.92,                 cs <= 0.04045 }
    // {  ((cs + 0.055)/1.055)^2.4,   cs >  0.04045 }
    static gammaToLinearSpace(value) {
        if (value <= 0.04045)
            return value / 12.92;
        else if (value < 1.0)
            return Math.pow((value + 0.055) / 1.055, 2.4);
        else
            return Math.pow(value, 2.4);
    }
    // http://www.opengl.org/registry/specs/EXT/framebuffer_sRGB.txt
    // http://www.opengl.org/registry/specs/EXT/texture_sRGB_decode.txt
    // {  0.0,                          0         <= cl
    // {  12.92 * c,                    0         <  cl < 0.0031308
    // {  1.055 * cl^0.41666 - 0.055,   0.0031308 <= cl < 1
    // {  1.0,                                       cl >= 1  <- This has been adjusted since we want to maintain HDR colors
    static linearToGammaSpace(value) {
        if (value <= 0.0)
            return 0.0;
        else if (value <= 0.0031308)
            return 12.92 * value;
        else if (value <= 1.0)
            return 1.055 * Math.pow(value, 0.41666) - 0.055;
        else
            return Math.pow(value, 0.41666);
    }
    /**
     * Gamma空间转换到线性空间。
     * @param	linear 线性空间颜色。
     */
    toLinear(out) {
        out.r = Color.gammaToLinearSpace(this.r);
        out.g = Color.gammaToLinearSpace(this.g);
        out.b = Color.gammaToLinearSpace(this.b);
    }
    /**
     * 线性空间转换到Gamma空间。
     * @param	gamma Gamma空间颜色。
     */
    toGamma(out) {
        out.r = Color.linearToGammaSpace(this.r);
        out.g = Color.linearToGammaSpace(this.g);
        out.b = Color.linearToGammaSpace(this.b);
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destColor = destObject;
        destColor.r = this.r;
        destColor.g = this.g;
        destColor.b = this.b;
        destColor.a = this.a;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest = new Color();
        this.cloneTo(dest);
        return dest;
    }
    forNativeElement() {
        /*if (nativeElements) {
            this.elements = nativeElements;
            this.elements[0] = this.r;
            this.elements[1] = this.g;
            this.elements[2] = this.b;
            this.elements[3] = this.a;
        } else {
            this.elements = new Float32Array([this.r,this.g,this.b,this.a]);
        }
        Vector2.rewriteNumProperty(this, "r", 0);
        Vector2.rewriteNumProperty(this, "g", 1);
        Vector2.rewriteNumProperty(this, "b", 2);
        Vector2.rewriteNumProperty(this, "a", 3);*/
    }
}
/**
 * 红色
 */
Color.RED = new Color(1, 0, 0, 1);
/**
 * 绿色
 */
Color.GREEN = new Color(0, 1, 0, 1);
/**
 * 蓝色
 */
Color.BLUE = new Color(0, 0, 1, 1);
/**
 * 蓝绿色
 */
Color.CYAN = new Color(0, 1, 1, 1);
/**
 * 黄色
 */
Color.YELLOW = new Color(1, 0.92, 0.016, 1);
/**
 * 品红色
 */
Color.MAGENTA = new Color(1, 0, 1, 1);
/**
 * 灰色
 */
Color.GRAY = new Color(0.5, 0.5, 0.5, 1);
/**
 * 白色
 */
Color.WHITE = new Color(1, 1, 1, 1);
/**
 * 黑色
 */
Color.BLACK = new Color(0, 0, 0, 1);
