import { Color } from "../maths/Color";

/**
 * @en The ColorUtils is a class for color value processing.
 * @zh ColorUtils 是一个用于处理颜色值的类。
 */
export class ColorUtils {
    private static _SAVE: any = {};
    private static _SAVE_SIZE: number = 0;

    /**
     * @en An array representing the color in RGBA format, Value range 0-1
     * @zh 以 RGBA 格式表示颜色的数组，取值范围0-1
     */
    arrColor: number[] = [];
    /**
     * @en The string representation of the color value.
     * @zh 字符串型颜色值。
     */
    strColor: string;
    /**
     * @en The uint representation of the color value.
     * @zh uint 型颜色值。
     */
    numColor: number;

    /**
     * @internal
    */
    _drawStyle: any;

    /**
     * @en Constructor method.
     * @param value The color value, which can be a string (e.g., "#ff0000") or a hexadecimal color (e.g., 0xff0000).
     * @zh 构造方法
     * @param value 颜色值，可以是字符串（例如 "#ff0000"）或16进制颜色值（例如 0xff0000）。
     */
    constructor(value: string | number) {
        if (value == null || value == 'none') {
            this.strColor = "#00000000";
            this.numColor = 0;
            this.arrColor = [0, 0, 0, 0];
            return;
        }

        tmpColor.parse(value);

        if (typeof (value) == 'string')
            this.strColor = value;
        else
            this.strColor = tmpColor.getStyleString();
        tmpColor.writeTo(this.arrColor);
        this.numColor = tmpColor.getABGR();
    }

    /**
     * @en Clears the cache if it gets too large.
     * @zh 如果缓存太大，则清理缓存。
     */
    private static _initSaveMap(): void {
        ColorUtils._SAVE_SIZE = 0;
        ColorUtils._SAVE = {};
    }

    /**
     * @en Creates and returns an instance of the Color class based on the specified color value.
     * @param value The color value, which can be a string (e.g., "#ff0000") or a hexadecimal color (e.g., 0xff0000).
     * @returns An instance of the Color class.
     * @zh 根据指定的颜色值创建并返回一个 Color 类的实例，可以是字符串（例如 "#ff0000"）或16进制颜色值（例如 0xff0000）。
     * @param value 颜色值，可以是字符串："#ff0000"或者16进制颜色 0xff0000。
     * @returns Color 类的一个实例。
     */
    static create(value: string | number): ColorUtils {
        let key: string = value + "";
        let color: ColorUtils = ColorUtils._SAVE[key];
        if (color != null)
            return color;

        if (ColorUtils._SAVE_SIZE > 500)
            ColorUtils._initSaveMap();
        ColorUtils._SAVE_SIZE++;
        return ColorUtils._SAVE[key] = new ColorUtils(value);
    }
}

const tmpColor = new Color();