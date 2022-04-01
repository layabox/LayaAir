import { LayoutBox } from "./LayoutBox";
import { UIComponent } from "./UIComponent";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
/**
	 * <code>VBox</code> 是一个垂直布局容器类。
	 */
export class VBox extends LayoutBox {
	/**
	 * 无对齐。
	 */
    static NONE: string = "none";
	/**
	 * 左对齐。
	 */
    static LEFT: string = "left";
	/**
	 * 居中对齐。
	 */
    static CENTER: string = "center";
	/**
	 * 右对齐。
	 */
    static RIGHT: string = "right";
    /**
     * @override
     */
    set width(value: number) {
        if (this._width != value) {
            super.width = value;
            this.callLater(this.changeItems);
        }
    }
    /**
     * @inheritDoc
     * @override
     */
    get width() {
        return super.width;
    }

    /** 兼容以前的changeItems逻辑，是否在发生变动时，使用 sortItem 排序所有item */
    public isSortItem:boolean = false;

    /** 
     * @inheritDoc	
     * @override
    */
    protected changeItems(): void {
        this._itemChanged = false;
        var items: any[] = [];
        var maxWidth = 0;

        for (var i = 0, n = this.numChildren; i < n; i++) {
            var item = (<UIComponent>this.getChildAt(i));
            if (item) {
                items.push(item);
                maxWidth = Math.max(maxWidth, item.width * item.scaleX);
            }
        }
        if (this.isSortItem) {
            this.sortItem(items);
        }
        var top = 0;
        for (i = 0, n = items.length; i < n; i++) {
            item = items[i];

            i && (top += (items[i - 1].height * items[i - 1].scaleX) + this._space);
            item.top = top;

            if (this._align == VBox.LEFT) {
                item.x = 0;
            } else if (this._align == VBox.CENTER) {
                item.x = (maxWidth - item.width * item.scaleX) * 0.5;
            } else if (this._align == VBox.RIGHT) {
                item.x = maxWidth - item.width * item.scaleX;
            }
             //@charley:修正轴心点偏移的位置处理
             item.pivotX && (item.x += item.pivotX * item.scaleX);
        }
        this._sizeChanged();
    }
}


ILaya.regClass(VBox);
ClassUtils.regClass("laya.ui.VBox", VBox);
ClassUtils.regClass("Laya.VBox", VBox);