import { LayoutBox } from "././LayoutBox";
import { ILaya } from "ILaya";
/**
     * <code>HBox</code> 是一个水平布局容器类。
     */
export class HBox extends LayoutBox {
    /** @inheritDoc	*/
    /*override*/ sortItem(items) {
        if (items)
            items.sort(function (a, b) { return a.x - b.x; });
    }
    /*override*/ set height(value) {
        if (this._height != value) {
            super.height = value;
            this.callLater(this.changeItems);
        }
    }
    get height() {
        return super.height;
    }
    /** @inheritDoc	*/
    /*override*/ changeItems() {
        this._itemChanged = false;
        var items = [];
        var maxHeight = 0;
        for (var i = 0, n = this.numChildren; i < n; i++) {
            var item = this.getChildAt(i);
            if (item) {
                items.push(item);
                maxHeight = this._height ? this._height : Math.max(maxHeight, item.height * item.scaleY);
            }
        }
        this.sortItem(items);
        var left = 0;
        for (i = 0, n = items.length; i < n; i++) {
            item = items[i];
            item.x = left;
            left += item.width * item.scaleX + this._space;
            if (this._align == HBox.TOP) {
                item.y = 0;
            }
            else if (this._align == HBox.MIDDLE) {
                item.y = (maxHeight - item.height * item.scaleY) * 0.5;
            }
            else if (this._align == HBox.BOTTOM) {
                item.y = maxHeight - item.height * item.scaleY;
            }
        }
        this._sizeChanged();
    }
}
/**
 * 无对齐。
 */
HBox.NONE = "none";
/**
 * 居顶部对齐。
 */
HBox.TOP = "top";
/**
 * 居中对齐。
 */
HBox.MIDDLE = "middle";
/**
 * 居底部对齐。
 */
HBox.BOTTOM = "bottom";
ILaya.regClass(HBox);
