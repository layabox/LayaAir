import { Box } from "././Box";
import { Event } from "../events/Event";
import { ILaya } from "../../ILaya";
/**
 * <code>LayoutBox</code> 是一个布局容器类。
 */
export class LayoutBox extends Box {
    constructor() {
        super(...arguments);
        /**@private */
        this._space = 0;
        /**@private */
        this._align = "none";
        /**@private */
        this._itemChanged = false;
    }
    /** @inheritDoc	*/
    /*override*/ addChild(child) {
        child.on(Event.RESIZE, this, this.onResize);
        this._setItemChanged();
        return super.addChild(child);
    }
    onResize(e) {
        this._setItemChanged();
    }
    /** @inheritDoc	*/
    /*override*/ addChildAt(child, index) {
        child.on(Event.RESIZE, this, this.onResize);
        this._setItemChanged();
        return super.addChildAt(child, index);
    }
    /** @inheritDoc	*/
    /*override*/ removeChildAt(index) {
        this.getChildAt(index).off(Event.RESIZE, this, this.onResize);
        this._setItemChanged();
        return super.removeChildAt(index);
    }
    /** 刷新。*/
    refresh() {
        this._setItemChanged();
    }
    /**
     * 改变子对象的布局。
     */
    changeItems() {
        this._itemChanged = false;
    }
    /** 子对象的间隔。*/
    get space() {
        return this._space;
    }
    set space(value) {
        this._space = value;
        this._setItemChanged();
    }
    /** 子对象对齐方式。*/
    get align() {
        return this._align;
    }
    set align(value) {
        this._align = value;
        this._setItemChanged();
    }
    /**
     * 排序项目列表。可通过重写改变默认排序规则。
     * @param items  项目列表。
     */
    sortItem(items) {
        if (items)
            items.sort(function (a, b) { return a.y - b.y; });
    }
    _setItemChanged() {
        if (!this._itemChanged) {
            this._itemChanged = true;
            this.callLater(this.changeItems);
        }
    }
}
ILaya.regClass(LayoutBox);
