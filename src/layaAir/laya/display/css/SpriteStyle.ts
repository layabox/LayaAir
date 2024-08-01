import { Rectangle } from "../../maths/Rectangle"
import { Dragging } from "../../utils/Dragging"
import { IHitArea } from "../../utils/IHitArea";
import { Pool } from "../../utils/Pool"

/**
 * @en Sprite style
 * @zh 精灵样式
 */
export class SpriteStyle {

    static readonly EMPTY: Readonly<SpriteStyle> = new SpriteStyle();

    /**
     * @en Horizontal scaling
     * @zh 水平缩放
     */
    scaleX: number;
    /**
     * @en Vertical scaling
     * @zh 垂直缩放
     */
    scaleY: number;
    /**
     * @en Horizontal skew angle
     * @zh 水平倾斜角度
     */
    skewX: number;
    /**
     * @en Vertical skew angle
     * @zh 垂直倾斜角度
     */
    skewY: number;
    /**
     * @en X-axis pivot point
     * @zh X轴心点
     */
    pivotX: number;
    /**
     * @en Y-axis pivot point
     * @zh Y轴心点
     */
    pivotY: number;
    /**
     * @en Rotation angle
     * @zh 旋转角度
     */
    rotation: number;
    /**
     * @en Transparency
     * @zh 透明度
     */
    alpha: number;
    /**
     * @en Scroll area
     * @zh 滚动区域
     */
    scrollRect: Rectangle;
    /**
     * @en Viewport
     * @zh 视口
     */
    viewport: Rectangle;
    /**
     * @en Hit area
     * @zh 点击区域
     */
    hitArea: IHitArea;
    /**
     * @en Dragging
     * @zh 滑动
     */
    dragging: Dragging;
    /**
     * @en Blend mode
     * @zh 混合模式
     */
    blendMode: string;

    constructor() {
        this.reset();
    }

    /**
     * @en Reset for easy reuse next time
     * @zh 重置，方便下次复用
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
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {
        if (this === SpriteStyle.EMPTY) return;
        Pool.recover("SpriteStyle", this.reset());
    }

    /**
     * @en Create SpriteStyle object pool instance
     * @zh 创建SpriteStyle对象池实例
     */
    static create(): SpriteStyle {
        return Pool.getItemByClass("SpriteStyle", SpriteStyle);
    }
}

