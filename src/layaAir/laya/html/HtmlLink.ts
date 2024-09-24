import { Sprite } from "../display/Sprite";
import { Text } from "../display/Text";
import { Event } from "../events/Event";
import { Rectangle } from "../maths/Rectangle";
import { IHitArea } from "../utils/IHitArea";
import { HtmlElement } from "./HtmlElement";
import { IHtmlObject } from "./IHtmlObject";

/**
 * @en The `HtmlLink` class represents a clickable link area within an HTML element.
 * @zh `HtmlLink` 类表示 HTML 元素内可点击的链接区域。
 */
export class HtmlLink implements IHtmlObject, IHitArea {
    private _owner: Text;
    private _element: HtmlElement;
    private _shape: Sprite;
    private _rects: Array<Rectangle>;
    private _rectCnt: number;

    /**
     * @en Creates a new instance of the `HtmlLink` class.
     * @zh 创建  HtmlLink 类的新实例
     */
    public constructor() {
        this._shape = new Sprite();
        this._shape.hitArea = this;
        this._shape.on(Event.CLICK, () => {
            this._owner.bubbleEvent(Event.LINK, this._element.getAttrString("href"));
        });

        this._rects = [];
        this._rectCnt = 0;
    }

    /**
     * @en The associated HTML element.
     * @zh 关联的 HTML 元素。
     */
    public get element(): HtmlElement {
        return this._element;
    }

    /**
     * @en The width of the link area. 
     * @zh 链接区域的宽度。
     */
    public get width(): number {
        return 0;
    }
    /**
     * @en The height of the link area.
     * @zh 链接区域的高度。
     */
    public get height(): number {
        return 0;
    }

    /**
     * @en Creates the link with the specified owner text and HTML element.
     * @param owner The owner text object.
     * @param element The HTML element associated with the link.
     * @zh 使用指定的文本所有者和 HTML 元素创建链接。
     * @param owner 所有者文本对象。
     * @param element 与链接关联的 HTML 元素。
     */
    public create(owner: Text, element: HtmlElement): void {
        this._owner = owner;
        this._element = element;
        this._owner.objContainer.addChild(this._shape);
    }
    /**
     * @en Resets the link area.
     * @zh 重置链接区域。
     */
    public resetArea() {
        this._rectCnt = 0;
    }

    /**
     * @en Adds a rectangle to the hit area.
     * @param x The x-coordinate of the rectangle.
     * @param y The y-coordinate of the rectangle.
     * @param width The width of the rectangle.
     * @param height The height of the rectangle.
     * @zh 向点击区域添加一个矩形。
     * @param x 矩形的 x 坐标。
     * @param y 矩形的 y 坐标。
     * @param width 矩形的宽度。
     * @param height 矩形的高度。
     */
    public addRect(x: number, y: number, width: number, height: number) {
        let rect = this._rects[this._rectCnt];
        if (!rect)
            rect = this._rects[this._rectCnt] = new Rectangle();
        this._rectCnt++;
        rect.setTo(x, y, width, height);
    }

    /**
     * @en Checks if the specified point is within the hit area.
     * @param x The x-coordinate of the point.
     * @param y The y-coordinate of the point.
     * @returns `true` if the point is within the hit area, otherwise `false`.
     * @zh 检查指定的点是否在点击区域内。
     * @param x 点的 x 坐标。
     * @param y 点的 y 坐标。
     * @returns 如果点在点击区域内，则返回 `true`，否则返回 `false`。
     */
    public contains(x: number, y: number): boolean {
        for (let i = 0; i < this._rectCnt; i++) {
            if (this._rects[i].contains(x, y))
                return true;
        }
        return false;
    }

    /**
     * @en Positions the link area at the specified coordinates. This method does nothing.
     * @param x The x-coordinate.
     * @param y The y-coordinate.
     * @zh 将链接区域定位到指定的坐标。此方法不执行任何操作。
     * @param x x 坐标。
     * @param y y 坐标。
     */
    public pos(x: number, y: number): void {
    }

    /**
     * @en Releases resources and removes the link area from its parent container.
     * @zh 释放资源并从父容器中移除链接区域。
     */
    public release(): void {
        this._shape.removeSelf();
        this._owner = null;
        this._element = null;
    }

    /**
     * @en Destroys the link area and its associated sprite.
     * @zh 销毁链接区域及其关联的精灵。
     */
    public destroy(): void {
        this._shape.destroy();
    }
}