import { Utils } from "./Utils";
/**
 * @private
 * <code>ColorUtils</code> 是一个颜色值处理类。
 */
export class ColorUtils {
    /**
     * 根据指定的属性值，创建一个 <code>Color</code> 类的实例。
     * @param	value 颜色值，可以是字符串："#ff0000"或者16进制颜色 0xff0000。
     */
    constructor(value) {
        /**rgba 取值范围0-1*/
        //TODO:delete？
        this.arrColor = [];
        if (value == null) {
            this.strColor = "#00000000";
            this.numColor = 0;
            this.arrColor = [0, 0, 0, 0];
            return;
        }
        var i, len;
        var color;
        if (typeof (value) == 'string') {
            if (value.indexOf("rgba(") >= 0 || value.indexOf("rgb(") >= 0) {
                var tStr = value;
                var beginI, endI;
                beginI = tStr.indexOf("(");
                endI = tStr.indexOf(")");
                tStr = tStr.substring(beginI + 1, endI);
                this.arrColor = tStr.split(",");
                len = this.arrColor.length;
                for (i = 0; i < len; i++) {
                    this.arrColor[i] = parseFloat(this.arrColor[i]);
                    if (i < 3) {
                        this.arrColor[i] = Math.round(this.arrColor[i]);
                    }
                }
                if (this.arrColor.length == 4) {
                    color = ((this.arrColor[0] * 256 + this.arrColor[1]) * 256 + this.arrColor[2]) * 256 + Math.round(this.arrColor[3] * 255);
                }
                else {
                    color = ((this.arrColor[0] * 256 + this.arrColor[1]) * 256 + this.arrColor[2]);
                }
                this.strColor = value;
            }
            else {
                this.strColor = value;
                value.charAt(0) === '#' && (value = value.substr(1));
                len = value.length;
                if (len === 3 || len === 4) {
                    var temp = "";
                    for (i = 0; i < len; i++) {
                        temp += (value[i] + value[i]);
                    }
                    value = temp;
                }
                color = parseInt(value, 16);
            }
        }
        else {
            color = value;
            this.strColor = Utils.toHexColor(color);
        }
        if (this.strColor.indexOf("rgba") >= 0 || this.strColor.length === 9) {
            //color:0xrrggbbaa numColor此时为负数
            this.arrColor = [((0xFF000000 & color) >>> 24) / 255, ((0xFF0000 & color) >> 16) / 255, ((0xFF00 & color) >> 8) / 255, (0xFF & color) / 255];
            this.numColor = (0xff000000 & color) >>> 24 | (color & 0xff0000) >> 8 | (color & 0x00ff00) << 8 | ((color & 0xff) << 24); //to 0xffbbggrr
        }
        else {
            this.arrColor = [((0xFF0000 & color) >> 16) / 255, ((0xFF00 & color) >> 8) / 255, (0xFF & color) / 255, 1];
            this.numColor = 0xff000000 | (color & 0xff0000) >> 16 | (color & 0x00ff00) | (color & 0xff) << 16; //to 0xffbbggrr
        }
        this.arrColor.__id = ++ColorUtils._COLODID;
    }
    /**@private */
    static _initDefault() {
        ColorUtils._DEFAULT = {};
        for (var i in ColorUtils._COLOR_MAP)
            ColorUtils._SAVE[i] = ColorUtils._DEFAULT[i] = new ColorUtils(ColorUtils._COLOR_MAP[i]);
        return ColorUtils._DEFAULT;
    }
    /**@private 缓存太大，则清理缓存*/
    static _initSaveMap() {
        ColorUtils._SAVE_SIZE = 0;
        ColorUtils._SAVE = {};
        for (var i in ColorUtils._DEFAULT)
            ColorUtils._SAVE[i] = ColorUtils._DEFAULT[i];
    }
    /**
     * 根据指定的属性值，创建并返回一个 <code>Color</code> 类的实例。
     * @param	value 颜色值，可以是字符串："#ff0000"或者16进制颜色 0xff0000。
     * @return 一个 <code>Color</code> 类的实例。
     */
    static create(value) {
        var key = value + "";
        var color = ColorUtils._SAVE[key];
        if (color != null)
            return color;
        if (ColorUtils._SAVE_SIZE < 1000)
            ColorUtils._initSaveMap();
        return ColorUtils._SAVE[key] = new ColorUtils(value);
    }
}
/*[FILEINDEX:10000]*/
/**@private */
ColorUtils._SAVE = {};
/**@private */
ColorUtils._SAVE_SIZE = 0;
/**@private */
ColorUtils._COLOR_MAP = { "purple": "#800080", "orange": "#ffa500", "white": '#FFFFFF', "red": '#FF0000', "green": '#00FF00', "blue": '#0000FF', "black": '#000000', "yellow": '#FFFF00', 'gray': '#808080' };
/**@private */
ColorUtils._DEFAULT = ColorUtils._initDefault();
/**@private */
ColorUtils._COLODID = 1;
