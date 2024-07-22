/**
 * @private
 * @en WordText class for managing text content and rendering.
 * @zh WordText 类，用于管理文本内容和渲染。
 */
export class WordText {
    /**
     * @en The text content.
     * @zh 文本内容。
     */
    text: string;
    /**
     * @en The width of the entire WordText. -1 indicates it hasn't been calculated yet.
     * @zh 整个 WordText 的宽度。-1 表示还没有计算。
     */
    width: number;
    /**
     * @en The text information saved by grouping the characters of this object into texture groups. Inside is another array. The specific meaning can be found in the place of use.
     * @zh 把本对象的字符按照texture分组保存的文字信息。里面又是一个数组。具体含义见使用的地方。
     */
    pageChars: any[];	
    /**
     * @en The ctx used for caching above. When crossing ctx (such as drawToTexture), it needs to be cleaned up, (because the settings for different ctx are different?). Set to any to indicate no concern for specific types, only for comparison purposes
     * @zh 上面缓存的时候用的ctx。跨ctx的时候（例如drawToTexture）要清理，（因为不同的ctx的设置不同？）。设置为any表示不关心具体类型，只是用来比较的
     */
    pagecharsCtx: any = null;  
    /**
     * @en Horizontal scale cached during rendering.
     * @zh 渲染时缓存的水平缩放。
     */
    scalex;	
    /**
     * @en Vertical scale cached during rendering.
     * @zh 渲染时缓存的垂直缩放。
     */
    scaley;

    _nativeObj: any;
    _splitRender: boolean;	// 强制拆分渲染

    constructor() {
        this.width = -1;
        this.pageChars = [];
        this.scalex = 1;
        this.scaley = 1;
    }

    /**
     * @en Set the text content.
     * @param txt The text to set.
     * @zh 设置文本内容。
     * @param txt 要设置的文本。
     */
    setText(txt: string): void {
        this.text = txt;
        if (this._nativeObj)
            this._nativeObj._text = txt;
        else
            this.width = -1;
        this.cleanCache();
    }

    /**
     * @en Convert the WordText to a string.
     * @returns The text content.
     * @zh 将 WordText 转换为字符串。
     * @returns 文本内容。
     */
    toString(): string {
        return this.text;
    }

    /**
     * @en The length of the text.
     * @zh 文本的长度。
     */
    get length(): number {
        return this.text ? this.text.length : 0;
    }

    /**
     * @en Clean the cache. This method will delete associated textures.
     * It's okay not to do it, textrender will automatically clean up the unused ones
     * @zh 清理缓存。此方法会删除关联的贴图。
     * 不做也可以，textrender会自动清理不用的
     * TODO 重用
     */
    cleanCache(): void {
        if (this._nativeObj) {
            this._nativeObj.cleanCache();
            return;
        }

        // 如果是独占文字贴图的，需要删掉
        //TODO 这个效果不对。会造成文字错乱
        let chars = this.pageChars;
        if (chars.length > 0) {
            for (var i in chars) {
                //should use for in since chars maybe sparse 
                let p = chars[i];
                if (!p) continue;
                let tex = p.tex;
                let words = p.words;
                if (words.length == 1 && tex && tex.ri) {// 如果有ri表示是独立贴图
                    tex.destroy();
                }
            }

            this.pageChars = [];
        }
        this.scalex = 1;
        this.scaley = 1;
    }

    /**
     * @en The split render status.
     * @zh 拆分渲染状态。
     */
    get splitRender() {
        return this._splitRender;
    }

    set splitRender(value: boolean) {
        this._splitRender = value;
        if (this._nativeObj)
            this._nativeObj.splitRender = value;
    }
}