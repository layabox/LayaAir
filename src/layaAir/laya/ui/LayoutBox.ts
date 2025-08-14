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
    /** 排序和布局时是否跳过隐藏（不可见）的子节点。 */
    protected _skipHidden: boolean = false;

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
    }

    /**
     * @en Sort the item list. Default sorting rules can be changed by overriding.
     * @param items The item list.
     * @zh 排序项目列表。可通过重写改变默认排序规则。
     * @param items  项目列表。
     */
    protected sortItem(items: any[]): void {
        if (items) items.sort(function (a: any, b: any): number { return a.y - b.y; });
    }

    private onResize(e: Event): void {
        this._setItemChanged();
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