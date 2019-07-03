/**
     * @private
     * <code>HTMLChar</code> 是一个 HTML 字符类。
     */
export declare class HTMLChar {
    private static _isWordRegExp;
    /** x坐标*/
    x: number;
    /** y坐标*/
    y: number;
    /** 宽*/
    width: number;
    /** 高*/
    height: number;
    /** 表示是否是正常单词(英文|.|数字)。*/
    isWord: boolean;
    /** 字符。*/
    char: string;
    /** 字符数量。*/
    charNum: number;
    /** CSS 样式。*/
    style: any;
    /**
     * 创建实例
     */
    constructor();
    /**
     * 根据指定的字符、宽高、样式，创建一个 <code>HTMLChar</code> 类的实例。
     * @param	char 字符。
     * @param	w 宽度。
     * @param	h 高度。
     * @param	style CSS 样式。
     */
    setData(char: string, w: number, h: number, style: any): HTMLChar;
    /**
     * 重置
     */
    reset(): HTMLChar;
    /**
     * 回收
     */
    recover(): void;
    /**
     * 创建
     */
    static create(): HTMLChar;
}
