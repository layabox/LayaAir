import { LayoutBox } from "./LayoutBox";
import { UIComponent } from "./UIComponent";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
/**
	 * <code>HBox</code> 是一个水平布局容器类。
	 */
export class HBox extends LayoutBox {
    /**
     * 无对齐。
     */
    static NONE: string = "none";
    /**
     * 居顶部对齐。
     */
    static TOP: string = "top";
    /**
     * 居中对齐。
     */
    static MIDDLE: string = "middle";
    /**
     * 居底部对齐。
     */
    static BOTTOM: string = "bottom";

    /** 
     * @inheritDoc	
     * @override
     */
	protected sortItem(items: any[]): void {
        if (items) items.sort(function (a: any, b: any): number { return a.x - b.x; });
    }
    /**
     * @inheritDoc	
     * @override
     */
	set height(value: number) {
        if (this._height != value) {
            super.height = value;
            this.callLater(this.changeItems);
        }
    }
    /**
     * @inheritDoc	
     * @override
     */
    get height() {
        return super.height;
    }

    /** 
     * @inheritDoc	
     * @override
     */
	protected changeItems(): void {
        this._itemChanged = false;
        var items: any[] = [];
        var maxHeight = 0;
        for (var i = 0, n = this.numChildren; i < n; i++) {
            var item = (<UIComponent>this.getChildAt(i));
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
            } else if (this._align == HBox.MIDDLE) {
                item.y = (maxHeight - item.height * item.scaleY) * 0.5;
            } else if (this._align == HBox.BOTTOM) {
                item.y = maxHeight - item.height * item.scaleY;
            }
        }
        this._sizeChanged();
    }
}

ILaya.regClass(HBox);
ClassUtils.regClass("laya.ui.HBox", HBox);
ClassUtils.regClass("Laya.HBox", HBox);