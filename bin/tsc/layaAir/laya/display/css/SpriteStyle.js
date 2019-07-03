import { Pool } from "../../utils/Pool";
/**
 * 元素样式
 */
export class SpriteStyle {
    constructor() {
        this.reset();
    }
    /**
     * 重置，方便下次复用
     */
    reset() {
        this.scaleX = this.scaleY = 1;
        this.skewX = this.skewY = 0;
        this.pivotX = this.pivotY = this.rotation = 0;
        this.alpha = 1;
        if (this.scrollRect)
            this.scrollRect.recover();
        this.scrollRect = null;
        if (this.viewport)
            this.viewport.recover();
        this.viewport = null;
        this.hitArea = null;
        this.dragging = null;
        this.blendMode = null;
        return this;
    }
    /**
     * 回收
     */
    recover() {
        if (this === SpriteStyle.EMPTY)
            return;
        Pool.recover("SpriteStyle", this.reset());
    }
    /**
     * 从对象池中创建
     */
    static create() {
        return Pool.getItemByClass("SpriteStyle", SpriteStyle);
    }
}
SpriteStyle.EMPTY = new SpriteStyle();
