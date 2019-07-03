import { Rectangle } from "../../maths/Rectangle";
import { Dragging } from "../../utils/Dragging";
/**
 * 元素样式
 */
export declare class SpriteStyle {
    static EMPTY: SpriteStyle;
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
    constructor();
    /**
     * 重置，方便下次复用
     */
    reset(): SpriteStyle;
    /**
     * 回收
     */
    recover(): void;
    /**
     * 从对象池中创建
     */
    static create(): SpriteStyle;
}
