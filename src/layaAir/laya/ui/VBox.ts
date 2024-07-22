import { LayoutBox } from "./LayoutBox";
import { UIComponent } from "./UIComponent";

/**
 * @en VBox is a vertical layout container class.
 * @zh VBox 是一个垂直布局容器类。
 */
export class VBox extends LayoutBox {
    /**
     * @en No alignment.
     * @zh 无对齐。
     */
    static NONE: string = "none";
    /**
     * @en Left aligned.
     * @zh 左对齐。
     */
    static LEFT: string = "left";
    /**
     * @en Center alignment.
     * @zh 居中对齐。
     */
    static CENTER: string = "center";
    /**
     * @en Right aligned.
     * @zh 右对齐。
     */
    static RIGHT: string = "right";

    /** 
     * @en Compatible with previous changeItems logic, whether to use sortItem to sort all items when changes occur.
     * @zh 兼容以前的changeItems逻辑，是否在发生变动时，使用 sortItem 排序所有item。
    */
    public isSortItem: boolean = false;

    /**
     * @internal
     */
    _setWidth(value: number) {
        super._setWidth(value);
        this.callLater(this.changeItems);
    }

    /** 
     * @internal
     * @inheritDoc	
     * @override
    */
    protected changeItems(): void {
        this._itemChanged = false;
        let items: any[] = [];
        let maxWidth = 0;

        for (let i = 0, n = this.numChildren; i < n; i++) {
            let item = (<UIComponent>this.getChildAt(i));
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