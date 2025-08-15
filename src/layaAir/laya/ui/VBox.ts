import { TransformKind } from "../display/SpriteConst";
import { LayoutBox } from "./LayoutBox";
import { UIComponent } from "./UIComponent";

/**
 * @zh VBox 是一个垂直布局容器类。
 * @en VBox is a vertical layout container class.
 * @blueprintInheritable
 */
export class VBox extends LayoutBox {
    /**
     * @zh 无对齐。
     * @en No alignment.
     */
    static readonly NONE: string = "none";
    /**
     * @zh 左对齐。
     * @en Left aligned.
     */
    static readonly LEFT: string = "left";
    /**
     * @zh 居中对齐。
     * @en Center alignment.
     */
    static readonly CENTER: string = "center";
    /**
     * @zh 右对齐。
     * @en Right aligned.
     */
    static readonly RIGHT: string = "right";

    /** 
     * @zh 兼容以前的changeItems逻辑，是否在发生变动时，使用 sortItem 排序所有item。
     * @en Compatible with previous changeItems logic, whether to use sortItem to sort all items when changes occur.
    */
    public isSortItem: boolean = false;

    /**
     * @ignore
     */
    protected _transChanged(kind: TransformKind) {
        super._transChanged(kind);

        if ((kind & TransformKind.Width) != 0)
            this.callLater(this.changeItems);
    }

    protected changeItems(): void {
        this._itemChanged = false;
        let items: any[] = [];
        let maxWidth = 0;

        for (let i = 0, n = this.numChildren; i < n; i++) {
            let item = (<UIComponent>this.getChildAt(i));
            if (this.skipHidden && !item.visible) continue; // ← 新增过滤隐藏的子项节点逻辑
            if (item) {
                item.y = 0;
                items.push(item);
                maxWidth = this._isWidthSet ? this._width : Math.max(maxWidth, item.width * item.scaleX);
            }
        }
        if (this.isSortItem) {
            this.sortItem(items);
        }
        let top = 0;
        for (let i = 0, n = items.length; i < n; i++) {
            let item = items[i];
            item.y = top;
            top += item.height * item.scaleY + this._space;
            if (this._align == VBox.LEFT) {
                item.x = 0;
            } else if (this._align == VBox.CENTER) {
                item.x = (maxWidth - item.width * item.scaleX) * 0.5;
            } else if (this._align == VBox.RIGHT) {
                item.x = maxWidth - item.width * item.scaleX;
            }
        }
        this._sizeChanged();
    }
}