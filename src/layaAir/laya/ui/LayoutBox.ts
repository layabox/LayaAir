import { Box } from "./Box";
import { Event } from "../events/Event"
import { Sprite } from "../display/Sprite";

/**
 * @en LayoutBox is a layout container class.
 * @zh LayoutBox 是一个布局容器类。
 */
export class LayoutBox extends Box {
    protected _space: number = 0;
    protected _align: string = "none";
    protected _itemChanged: boolean = false;

    /**
     * @en The space between child objects.
     * @zh 子对象的间隔。
     */
    get space(): number {
        return this._space;
    }

    set space(value: number) {
        this._space = value;
        this._setItemChanged();
    }

    /**
     * @en The alignment of child objects.
     * @zh 子对象对齐方式。
     */
    get align(): string {
        return this._align;
    }

    set align(value: string) {
        this._align = value;
        this._setItemChanged();
    }

    protected _setItemChanged(): void {
        if (!this._itemChanged) {
            this._itemChanged = true;
            this.callLater(this.changeItems);
        }
    }

    /**
     * @en Change the layout of child objects.
     * @zh 改变子对象的布局。
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
     * @en Refresh
     * @zh 刷新
     */
    refresh(): void {
        this._setItemChanged();
    }
}