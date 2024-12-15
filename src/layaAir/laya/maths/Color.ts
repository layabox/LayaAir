import { IClone } from "../utils/IClone";

/**
 * @en The Color class is used to create color instances.
 * @zh Color类用于创建颜色实例。
 */
export class Color implements IClone {
    /**
     * @en Red color
     * @zh 红色
     */
    static readonly RED: Readonly<Color> = new Color(1, 0, 0, 1);
    /**
     * @en Green color
     * @zh 绿色
     */
    static readonly GREEN: Readonly<Color> = new Color(0, 1, 0, 1);
    /**
     * @en Blue color
     * @zh 蓝色
     */
    static readonly BLUE: Readonly<Color> = new Color(0, 0, 1, 1);
    /**
     * @en Cyan color
     * @zh 蓝绿色
     */
    static readonly CYAN: Readonly<Color> = new Color(0, 1, 1, 1);
    /**
     * @en Yellow color
     * @zh 黄色
     */
    static readonly YELLOW: Readonly<Color> = new Color(1, 0.92, 0.016, 1);
    /**
     * @en Magenta color
     * @zh 品红色
     */
    static readonly MAGENTA: Readonly<Color> = new Color(1, 0, 1, 1);
    /**
     * @en Gray color
     * @zh 灰色
     */
    static readonly GRAY: Readonly<Color> = new Color(0.5, 0.5, 0.5, 1);
    /**
     * @en White color
     * @zh 白色
     */
    static readonly WHITE: Readonly<Color> = new Color(1, 1, 1, 1);
    /**
     * @en Black color
     * @zh 黑色
     */
    static readonly BLACK: Readonly<Color> = new Color(0, 0, 0, 1);
    /**
     * @en Fully transparent
     * @zh 全透明
     */
    static readonly CLEAR: Readonly<Color> = new Color(0, 0, 0, 0);

    /**
    * @en Converts an unsigned integer color value to a string representation.
    * @param color The color value.
    * @returns A string representation of the color value.
    * @zh 将 uint 类型的颜色值转换为字符串型颜色值。
    * @param color 颜色值。
    * @return 字符串型颜色值。
    */
    static hexToString(color: number): string {
        if (color < 0 || isNaN(color)) return "#000000";
        let str = Math.floor(color).toString(16);
        while (str.length < 6) str = "0" + str;
        return "#" + str;
    }

    /**
     * @en Converts a string color value to a number color.
     * @param value The string color value.
     * @returns The color value as a number.
     * @zh 将字符串型颜色值转换为数字型颜色值。
     * @param value 字符串颜色值
     * @returns 作为数字的颜色值
     */
    static stringToHex(value: string): number {
        if (!value)
            return 0;

        if (value.indexOf("rgba(") >= 0 || value.indexOf("rgb(") >= 0) {
            let p1 = value.indexOf("(");
            let p2 = value.indexOf(")");
            if (p1 == -1 || p2 == -1)
                return 0;

            value = value.substring(p1 + 1, p2);
            let arr: any[] = value.split(",");
            let len = arr.length;
            for (let i = 0; i < len; i++) {
                arr[i] = parseFloat(arr[i]);
                if (isNaN(arr[i]))
                    arr[i] = 0;
            }
            if (arr.length == 4)
                return (arr[0] << 24) + (arr[1] << 16) + (arr[2] << 8) + Math.round(arr[3] * 255);
            else
                return (arr[0] << 16) + (arr[1] << 8) + arr[2];
        } else {
            value.charAt(0) === '#' && (value = value.substring(1));
            let len = value.length;
            if (len === 3 || len === 4) {
                let temp: string = "";
                for (let i = 0; i < len; i++) {
                    temp += (value[i] + value[i]);
                }
                value = temp;
            }
            return parseInt(value, 16);
        }
    }

    /**
     * @en Convert gamma space value to linear space.
     * @param value The value in gamma space.
     * @returns The value in linear space.
     * @zh 将 Gamma 空间值转换为线性空间值。
     * @param value Gamma 空间值。
     * @returns 线性空间值。
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
     * @en Convert linear space value to gamma space.
     * @param value The value in linear space.
     * @returns The value in gamma space.
     * @zh 将线性空间值转换为 Gamma 空间值。
     * @param value 线性空间值。
     * @returns Gamma 空间值。
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


    /**
     * @en Red component
     * @zh 红色分量
     */
    r: number;

    /**
     * @en Green component
     * @zh 绿色分量
     */
    g: number;

    /**
     * @en Blue component
     * @zh 蓝色分量
     */
    b: number;

    /**
     * @en Alpha component
     * @zh 透明度分量
     */
    a: number;

    /**
     * @en Constructor method Color.
     * @param r Red component (0-1).
     * @param g Green component (0-1).
     * @param b Blue component (0-1).
     * @param a Alpha component (0-1).
     * @zh 构造函数,初始化颜色实例。
     * @param r 红色分量（0-1）。
     * @param g 绿色分量（0-1）。
     * @param b 蓝色分量（0-1）。
     * @param a 透明度分量（0-1）。
     */
    constructor(r: number = 1, g: number = 1, b: number = 1, a: number = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    /**
     * @en Check if two colors are equal.
     * @param c The color to compare with.
     * @returns True if the colors are equal, false otherwise.
     * @zh 判断两个颜色是否相等。
     * @param c 要比较的颜色。
     * @returns 如果颜色相等则返回 true，否则返回 false。
     */
    equal(c: Color): boolean {
        if (!c) return false;
        const toFIxed = (a: number, b: number) => {
            var delta = 1e-5;
            return -delta < a - b && a - b < delta;
        }
        return toFIxed(c.r, this.r) && toFIxed(c.g, this.g) && toFIxed(c.b, this.b) && toFIxed(c.a, this.a);
    }

    /**
     * @en Convert from gamma space to linear space.
     * @param out The output color in linear space.
     * @zh 从 Gamma 空间转换到线性空间。
     * @param out 输出的线性空间颜色。
     */
    toLinear(out: Color): void {
        out.r = Color.gammaToLinearSpace(this.r);
        out.g = Color.gammaToLinearSpace(this.g);
        out.b = Color.gammaToLinearSpace(this.b);
        out.a = this.a;
    }

    /**
     * @en Convert from linear space to gamma space.
     * @param out The output color in gamma space.
     * @zh 从线性空间转换到 Gamma 空间。
     * @param out 输出的 Gamma 空间颜色。
     */
    toGamma(out: Color): void {
        out.r = Color.linearToGammaSpace(this.r);
        out.g = Color.linearToGammaSpace(this.g);
        out.b = Color.linearToGammaSpace(this.b);
        out.a = this.a;
    }

    /**
     * @en Clone the color to another object.
     * @param destObject The target object to clone to.
     * @zh 克隆颜色到目标对象。
     * @param destObject 目标克隆对象。
     */
    cloneTo(destObject: Color): void {
        destObject.r = this.r;
        destObject.g = this.g;
        destObject.b = this.b;
        destObject.a = this.a;
    }

    /**
     * @en Scale the color.
     * @param value The scale value.
     * @returns The scaled color.
     * @zh 缩放颜色。
     * @param value 缩放值。
     * @returns 缩放后的颜色。
     */
    scale(value: number): Color {
        this.r = this.r * value;
        this.g = this.g * value;
        this.b = this.b * value;
        return this;
    }

    /**
     * @en Set the color components (0-1).
     * @param r Red component.
     * @param g Green component.
     * @param b Blue component.
     * @param a Alpha component.
     * @zh 设置颜色分量（0-1）。
     * @param r 红色分量。
     * @param g 绿色分量。
     * @param b 蓝色分量。
     * @param a 透明度分量。
     */
    setValue(r: number, g: number, b: number, a: number): Color {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        return this;
    }

    /**
     * @en Convert from Array to color.
     * @param array The source array.
     * @param offset The offset of the array.
     * @zh 从Array数组拷贝值。
     * @param array 数组。
     * @param offset 数组偏移。
     */
    fromArray(array: any[], offset: number = 0): void {
        this.r = array[offset + 0];
        this.g = array[offset + 1];
        this.b = array[offset + 2];
        this.a = array[offset + 3];
    }

    /**
     * @en Convert to Array.
     * @returns An array representing the color [r, g, b, a].
     * @zh 转换为Array数组
     * @returns 表示颜色的数组 [r, g, b, a]。
     */
    toArray(): Array<number> {
        return [this.r, this.g, this.b, this.a];
    }

    /**
     * @en Writes the color rgb values to a array.
     * @param arr The target array.
     * @param offset The offset in the array. Default is 0.
     * @zh 将颜色rgb数值写入数组。
     * @zh arr 目标数组。
     * @zh offset 数组偏移。默认值为 0。
     */
    writeTo(arr: { [n: number]: number }, offset: number = 0): void {
        arr[offset + 0] = this.r;
        arr[offset + 1] = this.g;
        arr[offset + 2] = this.b;
        arr[offset + 3] = this.a;
    }

    /**
     * @en Clone the color.
     * @returns The cloned color.
     * @zh 克隆颜色。
     * @returns 克隆副本。
     */
    clone(): any {
        var dest: Color = new Color();
        this.cloneTo(dest);
        return dest;
    }
}


