import { Rectangle } from "../../maths/Rectangle"
import { Dragging } from "../../utils/Dragging"
import { Pool } from "../../utils/Pool"

/**
 * 元素样式
 */
export class SpriteStyle {

    static EMPTY: SpriteStyle = new SpriteStyle();
    /**水平缩放 */
    scaleX: number;
    /**垂直缩放 */
    scaleY: number;
    /**水平倾斜角度 */
    skewX: number;
    /**垂直倾斜角度 */
    skewY: number;
    /**X轴心点 */
    pivotX: number;
    /**Y轴心点 */
    pivotY: number;
    /**旋转角度 */
    rotation: number;
    /**透明度 */
    alpha: number;
    /**滚动区域 */
    scrollRect: Rectangle;
    /**视口 */
    viewport: Rectangle;
    /**点击区域 */
    hitArea: any;
    /**滑动 */
    dragging: Dragging;
    /**混合模式 */
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

