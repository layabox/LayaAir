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
     * @zh 自适应模式 - 宽适配 
     * @en AUTO_SIZE_WIDTH - Width adaptive.
     */
    static readonly AUTO_SIZE_WIDTH: string = "width";
    /**
     * @zh 自适应模式。
     * - none：无自适应模式。
     * - both：宽高自适应模式。
     * - width：宽度自适应模式。
     * @en Adaptive mode.
     * - none: No adaptive mode.
     * - both: Both width and height are adaptive.
     * - width: Width adaptive.
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

        if ((kind & TransformKind.Height) != 0)
            this.callLater(this.changeItems);
    }
    /**
     * @zh 排序项目列表。可通过重写改变默认排序规则。
     * @param items  项目列表。
     * @en Sort the item list. Default sorting rules can be changed by overriding.
     * @param items The item list.
     */
    private sortItem(items: any[]): void {
        if (items) items.sort(function (a: any, b: any): number { return a.x - b.x; });
    }

    protected changeItems(): void {
        this._itemChanged = false;

        const items: UIComponent[] = [];
        let maxChildHeight = 0;      // 子项最大高度（用于对齐/可能用于自适应高）
        let totalChildWidth = 0;     // 子项总宽（用于自适应宽）

        // 收集子项并统计基础数据（不改变默认尺寸）
        for (let i = 0, n = this.numChildren; i < n; i++) {
            const item = this.getChildAt(i) as UIComponent;
            if (!item) continue;
            if (this.skipHidden && !item.visible) continue;// 过滤隐藏的子项节点逻辑
            item.x = 0;
            items.push(item);

            // 统计子项实际显示尺寸（考虑缩放）
            const iw = item.width * item.scaleX;
            const ih = item.height * item.scaleY;
            totalChildWidth += iw;
            if (ih > maxChildHeight) maxChildHeight = ih;
        }

        this.sortItem(items);

        // 计算用于对齐的“参考高度”
        // 规则：若显式设置了容器高度(_isHeightSet)，默认或仅宽适配时用容器高；宽高适配时改为用子项最大高
        const alignHeight = (this._autoSizeMode === HBox.AUTO_SIZE_BOTH) ? maxChildHeight : (this._isHeightSet ? this._height : maxChildHeight);
        let left = 0;
        for (let i = 0, n = items.length; i < n; i++) {
            const item = items[i];
            const iw = item.width * item.scaleX;
            const ih = item.height * item.scaleY;

            item.x = left;
            left += iw + this._space;

            switch (this._align) {
                case HBox.TOP:
                    item.y = 0; break;
                case HBox.MIDDLE:
                    item.y = (alignHeight - ih) * 0.5; break;
                case HBox.BOTTOM:
                    item.y = alignHeight - ih; break;
            }
        }

        // 仅在需要适配时，修改容器尺寸
        if (this._autoSizeMode === HBox.AUTO_SIZE_BOTH) {
            this.size(this._calcSizeWithSpace(totalChildWidth, items.length), maxChildHeight);
        } else if (this._autoSizeMode === HBox.AUTO_SIZE_WIDTH) {
            this.size(this._calcSizeWithSpace(totalChildWidth, items.length), this._height);
        }

        this._sizeChanged();
    }
}