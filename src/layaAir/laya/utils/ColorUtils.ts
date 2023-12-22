import { Utils } from "./Utils"

const _COLOR_MAP: Record<string, string> = { "purple": "#800080", "orange": "#ffa500", "white": '#FFFFFF', "red": '#FF0000', "green": '#00FF00', "blue": '#0000FF', "black": '#000000', "yellow": '#FFFF00', 'gray': '#808080' };

/**
 * @private
 * <code>ColorUtils</code> 是一个颜色值处理类。
 */
export class ColorUtils {
    /**@private */
    static _SAVE: any = {};
    /**@private */
    static _SAVE_SIZE: number = 0;
    /**@private */

    /**@private */
    private static _DEFAULT: any = ColorUtils._initDefault();

    /**rgba 取值范围0-1*/
    //TODO:delete？
    arrColor: any[] = [];
    /** 字符串型颜色值。*/
    strColor: string;
    /** uint 型颜色值。*/
    numColor: number;
    /**@internal TODO:*/
    _drawStyle: any;

    /**
     * 根据指定的属性值，创建一个 <code>Color</code> 类的实例。
     * @param	value 颜色值，可以是字符串："#ff0000"或者16进制颜色 0xff0000。
     */
    constructor(value: any) {
        if (value == null || value == 'none') {
            this.strColor = "#00000000";
            this.numColor = 0;
            this.arrColor = [0, 0, 0, 0];
            return;
        }

        let color: number;
        if (typeof (value) == 'string') {
            color = Utils.fromStringColor(value);
            this.strColor = value;
        } else {
            color = value;
            this.strColor = Utils.toHexColor(color);
        }

        if (this.strColor.indexOf("rgba") >= 0 || this.strColor.length === 9) {
            //color:0xrrggbbaa numColor此时为负数
            this.arrColor = [((0xFF000000 & color) >>> 24) / 255, ((0xFF0000 & color) >> 16) / 255, ((0xFF00 & color) >> 8) / 255, (0xFF & color) / 255];
            this.numColor = (0xff000000 & color) >>> 24 | (color & 0xff0000) >> 8 | (color & 0x00ff00) << 8 | ((color & 0xff) << 24);//to 0xffbbggrr
        } else {
            this.arrColor = [((0xFF0000 & color) >> 16) / 255, ((0xFF00 & color) >> 8) / 255, (0xFF & color) / 255, 1];
            this.numColor = 0xff000000 | (color & 0xff0000) >> 16 | (color & 0x00ff00) | (color & 0xff) << 16;//to 0xffbbggrr
        }
    }

    /**@private */
    static _initDefault(): any {
        ColorUtils._DEFAULT = {};
        for (var i in _COLOR_MAP) ColorUtils._SAVE[i] = ColorUtils._DEFAULT[i] = new ColorUtils(_COLOR_MAP[i]);
        return ColorUtils._DEFAULT;
    }

    /**@private 缓存太大，则清理缓存*/
    static _initSaveMap(): void {
        ColorUtils._SAVE_SIZE = 0;
        ColorUtils._SAVE = Object.assign({}, ColorUtils._DEFAULT);
    }

    /**
     * 根据指定的属性值，创建并返回一个 <code>Color</code> 类的实例。
     * @param	value 颜色值，可以是字符串："#ff0000"或者16进制颜色 0xff0000。
     * @return 一个 <code>Color</code> 类的实例。
     */
    static create(value: any): ColorUtils {
        let key: string = value + "";
        let color: ColorUtils = ColorUtils._SAVE[key];
        if (color != null) return color;
        if (ColorUtils._SAVE_SIZE > 500) ColorUtils._initSaveMap();
        ColorUtils._SAVE_SIZE++;
        return ColorUtils._SAVE[key] = new ColorUtils(value);
    }
}

