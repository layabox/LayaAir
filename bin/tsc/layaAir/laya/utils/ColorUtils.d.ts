/**
 * @private
 * <code>ColorUtils</code> 是一个颜色值处理类。
 */
export declare class ColorUtils {
    /**@private */
    static _SAVE: any;
    /**@private */
    static _SAVE_SIZE: number;
    /**@private */
    private static _COLOR_MAP;
    /**@private */
    private static _DEFAULT;
    /**@private */
    private static _COLODID;
    /**rgba 取值范围0-1*/
    arrColor: any[];
    /** 字符串型颜色值。*/
    strColor: string;
    /** uint 型颜色值。*/
    numColor: number;
    /**
     * 根据指定的属性值，创建一个 <code>Color</code> 类的实例。
     * @param	value 颜色值，可以是字符串："#ff0000"或者16进制颜色 0xff0000。
     */
    constructor(value: any);
    /**@private */
    static _initDefault(): any;
    /**@private 缓存太大，则清理缓存*/
    static _initSaveMap(): void;
    /**
     * 根据指定的属性值，创建并返回一个 <code>Color</code> 类的实例。
     * @param	value 颜色值，可以是字符串："#ff0000"或者16进制颜色 0xff0000。
     * @return 一个 <code>Color</code> 类的实例。
     */
    static create(value: any): ColorUtils;
}
