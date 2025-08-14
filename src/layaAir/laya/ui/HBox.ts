import { TransformKind } from "../display/SpriteConst";
import { LayoutBox } from "./LayoutBox";
import { UIComponent } from "./UIComponent";

/**
 * @zh `HBox` 是一个水平布局容器类。
 * @en The `HBox` class is a horizontal layout container.
 * @blueprintInheritable
 */
export class HBox extends LayoutBox {
    /**
     * @zh 无对齐。
     * @en No alignment.
     */
    static readonly NONE: string = "none";
    /**
     * @zh 居顶部对齐。
     * @en Align to the top.
     */
    static readonly TOP: string = "top";
    /**
     * @zh 居中对齐。
     * @en Align to the center.
     */
    static readonly MIDDLE: string = "middle";
    /**
     * @zh 居底部对齐。
     * @en Align to the bottom.
     */
    static readonly BOTTOM: string = "bottom";

    /**
     * @ignore
     */
    protected _transChanged(kind: TransformKind) {
        super._transChanged(kind);

        if ((kind & TransformKind.Height) != 0)
            this.callLater(this.changeItems);
    }

    protected sortItem(items: any[]): void {
        if (items) items.sort(function (a: any, b: any): number { return a.x - b.x; });
    }

    protected changeItems(): void {
        this._itemChanged = false;
        let items: UIComponent[] = [];
        let maxHeight = 0;
        for (let i = 0, n = this.numChildren; i < n; i++) {
            let item = (<UIComponent>this.getChildAt(i));
            if (this.skipHidden && !item.visible) continue; // ← 新增过滤隐藏的子项节点逻辑
            if (item) {
                item.x = 0;
                items.push(item);
                maxHeight = this._isHeightSet ? this._height : Math.max(maxHeight, item.height * item.scaleY);
            }
        }
        this.sortItem(items);
        let left = 0;
        for (let i = 0, n = items.length; i < n; i++) {
            let item = items[i];
            item.x = left;
            left += item.width * item.scaleX + this._space;
            if (this._align == HBox.TOP) {
                item.y = 0;
            } else if (this._align == HBox.MIDDLE) {
                item.y = (maxHeight - item.height * item.scaleY) * 0.5;
            } else if (this._align == HBox.BOTTOM) {
                item.y = maxHeight - item.height * item.scaleY;
            }
        }
        this._sizeChanged();
    }
}