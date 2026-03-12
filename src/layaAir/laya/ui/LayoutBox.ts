import { Box } from "./Box";
import { Event } from "../events/Event"
import { Sprite } from "../display/Sprite";

/**
 * @zh LayoutBox 是一个布局容器类。
 * @en LayoutBox is a layout container class.
 */
export class LayoutBox extends Box {
    protected _space: number = 0;
    protected _align: string = "none";
    protected _itemChanged: boolean = false;
    /** 
     * @zh 自适应模式 - 无
     * @en AUTO_SIZE_NONE - No adaptive mode.
     */
    static readonly AUTO_SIZE_NONE: string = "none";
    /** 
     * @zh 自适应模式 - 宽高适配 
     * @en AUTO_SIZE_BOTH - Both width and height are adaptive.
     */
    static readonly AUTO_SIZE_BOTH: string = "both";
    /** 排序和布局时是否跳过隐藏（不可见）的子节点。 */
    protected _skipHidden: boolean = false;
    /** 自适应模式, 默认值为 AUTO_SIZE_NONE。*/
    protected _autoSizeMode: string = LayoutBox.AUTO_SIZE_NONE;
    /** @internal */
    private _childVisibleStates: boolean[] | null = null;
    /**
     * @zh 子对象的间隔。
     * @en The space between child objects.
     */
    get space(): number {
        return this._space;
    }

    set space(value: number) {
        this._space = value;
        this._setItemChanged();
    }

    /**
     * @zh 子对象对齐方式。
     * @en The alignment of child objects.
     */
    get align(): string {
        return this._align;
    }
    set align(value: string) {
        this._align = value;
        this._setItemChanged();
    }

    /**
     * @zh 排序和布局时是否跳过隐藏（不可见）的子节点。
     * @en Whether to skip hidden (invisible) items during sorting and layout.
     */
    get skipHidden(): boolean {
        return this._skipHidden;
    }
    set skipHidden(value: boolean) {
        if (this._skipHidden !== value) {
            this._skipHidden = value;
            this._setItemChanged(); // 自动刷新布局
        }
    }


    protected _setItemChanged(): void {
        if (!this._itemChanged) {
            this._itemChanged = true;
            this.callLater(this.changeItems);
        }
    }

    /**
     * @zh 改变子对象的布局。
     * @en Change the layout of child objects.
     */
    protected changeItems(): void {
        this._itemChanged = false;
        if (this._skipHidden && this.numChildren > 0) {
            this._snapshotVisibility();
            this.callLater(this._detectVisibilityChange);
        }
    }

    /** 
     * @zh 计算包含间距的总大小（宽或高）
     * @param totalChildSize 子项总大小（宽或高）
     * @param count 子项数量
     * @returns 包含间距的总大小（宽或高）
     * @en Calculate the total size with spacing.
     * @param totalChildSize The total size of child items.
     * @param count The number of child items.
     * @returns The total size with spacing.
     */
    protected _calcSizeWithSpace(totalChildSize: number, count: number): number {
        return count > 0 ? totalChildSize + (count - 1) * this._space : 0;
    }

    private onResize(e: Event): void {
        this._setItemChanged();
    }

    private _snapshotVisibility(): void {
        let n = this.numChildren;
        if (!this._childVisibleStates)
            this._childVisibleStates = [];
        this._childVisibleStates.length = n;
        for (let i = 0; i < n; i++) {
            this._childVisibleStates[i] = (this.getChildAt(i) as Sprite).visible;
        }
    }

    private _detectVisibilityChange(): void {
        if (!this._skipHidden || !this._childVisibleStates || this._destroyed) return;
        let n = this.numChildren;
        let states = this._childVisibleStates;
        if (n !== states.length) return;
        for (let i = 0; i < n; i++) {
            if ((this.getChildAt(i) as Sprite).visible !== states[i]) {
                this._setItemChanged();
                return;
            }
        }
        this.callLater(this._detectVisibilityChange);
    }

    /**
     * @ignore
     */
    protected _childChanged(child?: Sprite): void {
        super._childChanged(child);

        if (child) {
            if (child.parent == this)
                child.on(Event.RESIZE, this, this.onResize);
            else
                child.off(Event.RESIZE, this, this.onResize);
            this._setItemChanged();
        }
    }

    /**
     * @zh 刷新布局
     * @en Refresh
     */
    refresh(): void {
        this._setItemChanged();
    }
}