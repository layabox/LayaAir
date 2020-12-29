import { Box } from "./Box";
import { Node } from "../display/Node"
import { Event } from "../events/Event"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

/**
 * <code>LayoutBox</code> 是一个布局容器类。
 */
export class LayoutBox extends Box {
    /**@private */
    protected _space: number = 0;
    /**@private */
    protected _align: string = "none";
    /**@private */
    protected _itemChanged: boolean = false;

    /** 
     * @inheritDoc	
     * @override
    */
    addChild(child: Node): Node {
        child.on(Event.RESIZE, this, this.onResize);
        this._setItemChanged();
        return super.addChild(child);
    }

    private onResize(e: Event): void {
        this._setItemChanged();
    }

    /** 
     * @inheritDoc	
     * @override
    */
    addChildAt(child: Node, index: number): Node {
        child.on(Event.RESIZE, this, this.onResize);
        this._setItemChanged();
        return super.addChildAt(child, index);
    }

    /**
     *  @inheritDoc	
     * @override
    */
    removeChildAt(index: number): Node {
        this.getChildAt(index).off(Event.RESIZE, this, this.onResize);
        this._setItemChanged();
        return super.removeChildAt(index);
    }

    /** 刷新。*/
    refresh(): void {
        this._setItemChanged();
    }

    /**
     * 改变子对象的布局。
     */
    protected changeItems(): void {
        this._itemChanged = false;
    }

    /** 子对象的间隔。*/
    get space(): number {
        return this._space;
    }

    set space(value: number) {
        this._space = value;
        this._setItemChanged();
    }

    /** 子对象对齐方式。*/
    get align(): string {
        return this._align;
    }

    set align(value: string) {
        this._align = value;
        this._setItemChanged();
    }

    /**
     * 排序项目列表。可通过重写改变默认排序规则。
     * @param items  项目列表。
     */
    protected sortItem(items: any[]): void {
        if (items) items.sort(function (a: any, b: any): number { return a.y - b.y; });
    }

    protected _setItemChanged(): void {
        if (!this._itemChanged) {
            this._itemChanged = true;
            this.callLater(this.changeItems);
        }
    }
}

ILaya.regClass(LayoutBox);
ClassUtils.regClass("laya.ui.LayoutBox", LayoutBox);
ClassUtils.regClass("Laya.LayoutBox", LayoutBox);