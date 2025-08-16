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
     * @zh 自适应模式 - 仅高适配
     * @en AUTO_SIZE_HEIGHT - Height adaptive only.
     */
    static readonly AUTO_SIZE_HEIGHT: string = "height";
    /** 
     * @zh 兼容以前的changeItems逻辑，是否在发生变动时，使用 sortItem 排序所有item。
     * @en Compatible with previous changeItems logic, whether to use sortItem to sort all items when changes occur.
    */
    public isSortItem: boolean = false;
    /**
     * @zh 自适应模式。
     * - none：无自适应模式。
     * - both：宽高自适应模式。
     * - height：高度自适应模式。
     * @en Adaptive mode.
     * - none: No adaptive mode.
     * - both: Both width and height are adaptive.
     * - height: Height adaptive.
     */
    get autoSizeMode(): string {
        return this._autoSizeMode;
    }
    set autoSizeMode(value: string) {
        if (this._autoSizeMode !== value) {
            this._autoSizeMode = value;
            this.callLater(this.changeItems);
        }
    }
    /**
     * @ignore
     */
    protected _transChanged(kind: TransformKind) {
        super._transChanged(kind);

        if ((kind & TransformKind.Width) != 0)
            this.callLater(this.changeItems);
    }
    /**
     * @zh 排序项目列表。可通过重写改变默认排序规则。
     * @param items  项目列表。
     * @en Sort the item list. Default sorting rules can be changed by overriding.
     * @param items The item list.
     */
    private sortItem(items: UIComponent[]): void {
        if (items) items.sort(function (a: any, b: any): number { return a.y - b.y; });
    }

    protected changeItems(): void {
        this._itemChanged = false;

        const items: UIComponent[] = [];
        let maxChildWidth = 0;       // 子项最大宽（用于对齐/可能用于自适应宽）
        let totalChildHeight = 0;    // 子项总高（用于自适应高）

        // 收集子项并统计基础数据
        for (let i = 0, n = this.numChildren; i < n; i++) {
            const item = this.getChildAt(i) as UIComponent;
            if (this.skipHidden && !item.visible) continue;
            if (!item) continue;

            item.y = 0;
            items.push(item);

            const iw = item.width * item.scaleX;
            const ih = item.height * item.scaleY;
            if (iw > maxChildWidth) maxChildWidth = iw;
            totalChildHeight += ih;
        }

        if (this.isSortItem) {
            this.sortItem(items);
        }

        // 计算用于对齐的“参考宽度”
        // 规则：若显式设置了容器宽(_isWidthSet)，默认或仅高适配时用容器宽；宽高适配时改为用子项最大宽
        const alignWidth = (this._autoSizeMode === VBox.AUTO_SIZE_BOTH) ? maxChildWidth : (this._isWidthSet ? this._width : maxChildWidth);

        // 摆放
        let top = 0;
        for (let i = 0, n = items.length; i < n; i++) {
            const item = items[i];
            const iw = item.width * item.scaleX;
            const ih = item.height * item.scaleY;

            item.y = top;
            top += ih + this._space;

            switch (this._align) {  // 对齐
                case VBox.LEFT:
                    item.x = 0; break;
                case VBox.CENTER:
                    item.x = (alignWidth - iw) * 0.5; break;
                case VBox.RIGHT:
                    item.x = alignWidth - iw; break;
            }
        }

        // 仅在需要适配时，修改容器尺寸
        if (this._autoSizeMode === VBox.AUTO_SIZE_BOTH) {
            this.size(maxChildWidth, this._calcSizeWithSpace(totalChildHeight, items.length));
        } else if (this._autoSizeMode === VBox.AUTO_SIZE_HEIGHT) {
            this.size(this.width, this._calcSizeWithSpace(totalChildHeight, items.length));
        }

        this._sizeChanged();
    }
}