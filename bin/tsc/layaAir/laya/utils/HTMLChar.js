import { Pool } from "././Pool";
/**
     * @private
     * <code>HTMLChar</code> 是一个 HTML 字符类。
     */
export class HTMLChar {
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
    setData(char, w, h, style) {
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
    reset() {
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
    recover() {
        Pool.recover("HTMLChar", this.reset());
    }
    /**
     * 创建
     */
    static create() {
        return Pool.getItemByClass("HTMLChar", HTMLChar);
    }
    /** @private */
    _isChar() {
        return true;
    }
    /** @private */
    _getCSSStyle() {
        return this.style;
    }
}
HTMLChar._isWordRegExp = new RegExp("[\\w\.]", "");
