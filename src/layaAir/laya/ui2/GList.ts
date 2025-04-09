import { GButton } from "./GButton";
import { LayoutType, ScrollBounceBackEffect, SelectionMode } from "./Const";
import { GWidget } from "./GWidget";
import { WidgetPool } from "./WidgetPool";
import { ListLayout } from "./layout/ListLayout";
import { ListSelection } from "./selection/ListSelection";
import { IListLayout } from "./layout/IListLayout";
import { GPanel } from "./GPanel";
import { Prefab } from "../resource/HierarchyResource";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { LayaEnv } from "../../LayaEnv";
import { HideFlags } from "../Const";

export class GList extends GPanel {
    public itemRenderer: (index: number, item: any) => void;
    public itemProvider: (index: number) => string;

    declare _layout: IListLayout;

    private _pool: WidgetPool;
    private _initItemNum: number;
    private _itemData: Array<IListItemData>;
    private _isDemo: boolean;

    _templateNode: GWidget;

    constructor() {
        super(ListLayout, ListSelection);

        this._layout.type = LayoutType.SingleColumn;
        this._selection.mode = SelectionMode.Single;

        this._pool = new WidgetPool();
    }

    public destroy(): void {
        this._pool.clear();

        super.destroy();
    }

    public get layout(): IListLayout {
        return <IListLayout>this._layout;
    }

    public get itemTemplate(): Prefab {
        return this._pool.defaultRes;
    }

    public set itemTemplate(value: Prefab) {
        this._pool.defaultRes = value;
    }

    public get itemPool(): WidgetPool {
        return this._pool;
    }

    public getFromPool(url?: string): GWidget {
        let obj = this._pool.getObject(url);
        if (obj)
            obj.visible = true;
        return obj;
    }

    public returnToPool(obj: GWidget): void {
        this._pool.returnObject(obj);
    }

    public addItemFromPool(url?: string): GWidget {
        let child = this.getFromPool(url);
        if (child instanceof GButton)
            child.selected = false;
        return this.addChild(child);
    }

    public removeChildToPoolAt(index: number): void {
        let child = <GWidget>this.removeChildAt(index);
        this.returnToPool(child);
    }

    public removeChildToPool(child: GWidget): void {
        this.removeChild(child);
        this.returnToPool(child);
    }

    public removeChildrenToPool(beginIndex?: number, endIndex?: number): void {
        beginIndex = beginIndex || 0;
        if (endIndex == null) endIndex = -1;
        if (endIndex < 0 || endIndex >= this.children.length)
            endIndex = this.children.length - 1;

        for (let i = beginIndex; i <= endIndex; ++i)
            this.removeChildToPoolAt(beginIndex);
    }

    public get numItems(): number {
        return this._layout.numItems;
    }

    public set numItems(value: number) {
        this._layout.numItems = value;
    }

    public resizeToFit(itemCount?: number, minSize?: number): void {
        this._layout.resizeToFit(itemCount, minSize);
    }

    public childIndexToItemIndex(index: number): number {
        return this._layout.childIndexToItemIndex(index);
    }

    public itemIndexToChildIndex(index: number): number {
        return this._layout.itemIndexToChildIndex(index);
    }

    public refreshVirtualList(): void {
        this._layout.refreshVirtualList();
    }

    public setVirtual(): void {
        this._setVirtual(false);
    }

    /**
     * Set the list to be virtual list, and has loop behavior.
     */
    public setVirtualAndLoop(): void {
        this._setVirtual(true);
    }

    private _setVirtual(loop: boolean): void {
        if (!this._layout._virtual) {
            if (this.scroller == null)
                throw new Error("Virtual list must be scrollable!");

            if (loop) {
                if (this._layout.type == LayoutType.FlowX || this._layout.type == LayoutType.FlowY)
                    throw new Error("Loop list does not support flowX or flowY layout!");

                this.scroller.bouncebackEffect = ScrollBounceBackEffect.Off;
            }
        }

        this._layout._setVirtual(loop);
    }

    public onAfterDeserialize(): void {
        super.onAfterDeserialize();

        if (SerializeUtil.hasProp("_initItemNum", "_itemData") && (LayaEnv.isPreview || !this._isDemo))
            this._buildInitItems();
    }

    /** @internal */
    _buildInitItems() {
        for (let i = this.children.length - 1; i >= 0; i--) {
            let child = this.getChildAt(i);
            if (child.hasHideFlag(HideFlags.HideAndDontSave))
                child.destroy();
        }

        if (this.itemTemplate == null)
            return;

        let itemData = this._itemData;
        for (let i = 0; i < this._initItemNum; i++) {
            let m: IListItemData = (itemData && i < itemData.length) ? itemData[i] : null;
            if (m != null) {
                let child = <GWidget>(m.res ? m.res.create() : this.getFromPool());
                child.hideFlags |= HideFlags.HideAndDontSave;
                child.text = m.title;
                child.icon = m.icon;
                if (child instanceof GButton) {
                    if (m.selectedTitle)
                        child.selectedTitle = m.selectedTitle;
                    if (m.selectedIcon)
                        child.selectedIcon = m.selectedIcon;
                    child.selected = false;
                }
                if (m.name != null)
                    child.name = m.name;
                this.addChild(child);
            }
            else
                this.addItemFromPool();
        }

        this.selection._refresh();
    }
}

interface IListItemData {
    res: Prefab;
    name: string;
    title: string;
    selectedTitle: string;
    icon: string;
    selectedIcon: string;
}