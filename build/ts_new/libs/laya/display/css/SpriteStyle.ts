import { Rectangle } from "../../maths/Rectangle"
import { Dragging } from "../../utils/Dragging"
import { Pool } from "../../utils/Pool"

/**
 * 元素样式
 */
export class SpriteStyle {

    static EMPTY: SpriteStyle = new SpriteStyle();
    scaleX: number;
    scaleY: number;
    skewX: number;
    skewY: number;
    pivotX: number;
    pivotY: number;
    rotation: number;
    alpha: number;
    scrollRect: Rectangle;
    viewport: Rectangle;
    hitArea: any;
    dragging: Dragging;
    blendMode: string;

    constructor() {
        this.reset();
    }

    /**
     * 重置，方便下次复用
     */
    reset(): SpriteStyle {
        this.scaleX = this.scaleY = 1;
        this.skewX = this.skewY = 0;
        this.pivotX = this.pivotY = this.rotation = 0;
        this.alpha = 1;
        if (this.scrollRect) this.scrollRect.recover();
        this.scrollRect = null;
        if (this.viewport) this.viewport.recover();
        this.viewport = null;
        this.hitArea = null;
        this.dragging = null;
        this.blendMode = null;
        return this
    }

    /**
     * 回收
     */
    recover(): void {
        if (this === SpriteStyle.EMPTY) return;
        Pool.recover("SpriteStyle", this.reset());
    }

    /**
     * 从对象池中创建
     */
    static create(): SpriteStyle {
        return Pool.getItemByClass("SpriteStyle", SpriteStyle);
    }
}

