import { SpriteStyle } from "././SpriteStyle";
import { Pool } from "../../utils/Pool";
/**
 * 文本的样式类
 */
export class TextStyle extends SpriteStyle {
    constructor() {
        super(...arguments);
        /**
         * 表示使用此文本格式的文本是否为斜体。
         * @default false
         */
        this.italic = false;
    }
    /*override*/ reset() {
        super.reset();
        this.italic = false;
        this.align = "left";
        this.wordWrap = false;
        this.leading = 0;
        this.padding = [0, 0, 0, 0];
        this.bgColor = null;
        this.borderColor = null;
        this.asPassword = false;
        this.stroke = 0;
        this.strokeColor = "#000000";
        this.bold = false;
        this.underline = false;
        this.underlineColor = null;
        this.currBitmapFont = null;
        return this;
    }
    /*override*/ recover() {
        if (this === TextStyle.EMPTY)
            return;
        Pool.recover("TextStyle", this.reset());
    }
    /**
     * 从对象池中创建
     */
    static create() {
        return Pool.getItemByClass("TextStyle", TextStyle);
    }
    /**@inheritDoc	 */
    render(sprite, context, x, y) {
        (this.bgColor || this.borderColor) && context.drawRect(x, y, sprite.width, sprite.height, this.bgColor, this.borderColor, 1);
    }
}
/**
* 一个已初始化的 <code>TextStyle</code> 实例。
*/
TextStyle.EMPTY = new TextStyle();
