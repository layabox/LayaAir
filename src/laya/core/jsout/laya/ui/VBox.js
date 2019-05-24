import { LayoutBox } from "././LayoutBox";
/**
     * <code>VBox</code> 是一个垂直布局容器类。
     */
export class VBox extends LayoutBox {
    /*override*/ set width(value) {
        if (this._width != value) {
            super.width = value;
            this.callLater(this.changeItems);
        }
    }
    /** @inheritDoc	*/
    /*override*/ changeItems() {
        this._itemChanged = false;
        var items = [];
        var maxWidth = 0;
        for (var i = 0, n = this.numChildren; i < n; i++) {
            var item = this.getChildAt(i);
            if (item) {
                items.push(item);
                maxWidth = this._width ? this._width : Math.max(maxWidth, item.width * item.scaleX);
            }
        }
        this.sortItem(items);
        var top = 0;
        for (i = 0, n = items.length; i < n; i++) {
            item = items[i];
            item.y = top;
            top += item.height * item.scaleY + this._space;
            if (this._align == VBox.LEFT) {
                item.x = 0;
            }
            else if (this._align == VBox.CENTER) {
                item.x = (maxWidth - item.width * item.scaleX) * 0.5;
            }
            else if (this._align == VBox.RIGHT) {
                item.x = maxWidth - item.width * item.scaleX;
            }
        }
        this._sizeChanged();
    }
}
/**
 * 无对齐。
 */
VBox.NONE = "none";
/**
 * 左对齐。
 */
VBox.LEFT = "left";
/**
 * 居中对齐。
 */
VBox.CENTER = "center";
/**
 * 右对齐。
 */
VBox.RIGHT = "right";
