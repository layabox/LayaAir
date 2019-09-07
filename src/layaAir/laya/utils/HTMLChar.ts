import { Pool } from "./Pool";
/**
 * @private
 * <code>HTMLChar</code> 是一个 HTML 字符类。
 */
export class HTMLChar {

    private static _isWordRegExp: RegExp = new RegExp("[\\w\.]", "");

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
    char: string|null;
    /** 字符数量。*/
    charNum: number;
    /** CSS 样式。*/
    style: any;

    /**
     * 创建实例
     */
    constructor() {
        this.reset();
    }

    /**
     * 根据指定的字符、宽高、样式，创建一个 <code>HTMLChar</code> 类的实例。
     * @param	char 字符。
     * @param	w 宽度。
     * @param	h 高度。
     * @param	style CSS 样式。
     */
    setData(char: string, w: number, h: number, style: any): HTMLChar {
        this.char = char;
        this.charNum = char.charCodeAt(0);
        this.x = this.y = 0;
        this.width = w;
        this.height = h;
        this.style = style;
        this.isWord = !HTMLChar._isWordRegExp.test(char);
        return this;
    }

    /**
     * 重置
     */
    reset(): HTMLChar {
        this.x = this.y = this.width = this.height = 0;
        this.isWord = false;
        this.char = null;
        this.charNum = 0;
        this.style = null;
        return this;
    }

    /**
     * 回收
     */
    //TODO:coverage
    recover(): void {
        Pool.recover("HTMLChar", this.reset());
    }

    /**
     * 创建
     */
    static create(): HTMLChar {
        return Pool.getItemByClass("HTMLChar", HTMLChar);
    }

    /** @internal */
    _isChar(): boolean {
        return true;
    }

    /** @internal */
    _getCSSStyle(): any {
        return this.style;
    }
}

