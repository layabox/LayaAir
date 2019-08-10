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
    get width() {
        return super.width;
    }

    /** 
     * @inheritDoc	
     * @override
    */
    protected changeItems(): void {
        this._itemChanged = false;
        var items: any[] = [];
        var maxWidth: number = 0;

        for (var i: number = 0, n: number = this.numChildren; i < n; i++) {
            var item: UIComponent = (<UIComponent>this.getChildAt(i));
            if (item) {
                items.push(item);
                maxWidth = this._width ? this._width : Math.max(maxWidth, item.width * item.scaleX);
            }
        }

        this.sortItem(items);
        var top: number = 0;
        for (i = 0, n = items.length; i < n; i++) {
            item = items[i];
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


ILaya.regClass(VBox);
ClassUtils.regClass("laya.ui.VBox", VBox);
ClassUtils.regClass("Laya.VBox", VBox);