import { ILaya } from "../../../ILaya";
import { Point } from "../../maths/Point";
import { Rectangle } from "../../maths/Rectangle";
import { GButton } from "../GButton";
import { LayoutChangedReason, LayoutType, PageMode, StretchMode } from "../Const";
import type { GList } from "../GList";
import { UIConfig2 } from "../UIConfig";
import type { GWidget } from "../GWidget";
import { Layout } from "./Layout";
import { UIEvent } from "../UIEvent";
import { Sprite } from "../../display/Sprite";

export class ListLayout extends Layout {
    declare _owner: GList;

    _virtual: boolean;
    _loop: boolean;
    _realNumItems: number;
    _lineItemCnt: number = 0; //item count in one line
    _lineItemCnt2: number; //只用在页面模式，表示垂直方向的项目数
    _items: Array<ItemInfo>;

    private _numItems: number = 0;
    private _itemSize: Point = new Point();
    private _firstIndex: number = 0; //the top left index
    private _changed: number = 0; //1-content changed, 2-size changed
    private _eventLocked: boolean;
    private _itemInfoVer: number = 0; //用来标志item是否在本次处理中已经被重用了
    private _itemSizes: Array<number>;
    private _offsetX: number;
    private _offsetY: number;

    public get numItems(): number {
        if (this._virtual)
            return this._numItems;
        else
            return this._owner.children.length;
    }

    public set numItems(value: number) {
        if (this._virtual) {
            if (this._owner.itemRenderer == null)
                throw new Error("set itemRenderer first!");

            this._numItems = value;
            if (this._loop)
                this._realNumItems = this._numItems * 6;//设置6倍数量，用于循环滚动
            else
                this._realNumItems = this._numItems;

            //_virtualItems的设计是只增不减的
            let oldCount = this._items.length;
            if (this._realNumItems > oldCount) {
                for (let i = oldCount; i < this._realNumItems; i++) {
                    let ii = { width: 0, height: 0, flag: 0 };
                    ii.width = this._itemSize.x;
                    ii.height = this._itemSize.y;

                    this._items.push(ii);
                }
            }
            else {
                for (let i = this._realNumItems; i < oldCount; i++)
                    this._items[i].selected = false;
            }

            if (this._changed != 0)
                ILaya.timer.clear(this, this._refreshVirtualList);

            //立即刷新
            this._refreshVirtualList();
        }
        else {
            let cnt = this._owner.children.length;
            if (value > cnt) {
                for (let i = cnt; i < value; i++) {
                    if (this._owner.itemProvider)
                        this._owner.addItemFromPool(this._owner.itemProvider(i));
                    else
                        this._owner.addItemFromPool();
                }
            }
            else {
                this._owner.removeChildrenToPool(value, cnt);
            }

            if (this._owner.itemRenderer) {
                for (let i = 0; i < value; i++)
                    this._owner.itemRenderer(i, this._owner.getChildAt(i));
            }
        }
    }

    public get itemSize(): Point {
        return this._itemSize;
    }

    public set itemSize(value: Point) {
        this._itemSize.setTo(value.x, value.y);
        if (this._virtual) {
            if (this._type == LayoutType.SingleColumn || this._type == LayoutType.FlowX)
                this._owner.scroller.step = this._itemSize.y;
            else
                this._owner.scroller.step = this._itemSize.x;
            this._changed = 2;
            ILaya.timer.callLater(this, this._refreshVirtualList);
        }
    }

    /** @internal */
    public _setVirtual(loop: boolean): void {
        if (this._virtual)
            return;

        this._virtual = true;
        this._loop = loop;
        this._items = [];
        this._itemSizes = [];
        this._owner.removeChildrenToPool();

        if (this._itemSize.x == 0 && this._itemSize.y == 0) {
            let obj = this._owner.getFromPool();
            if (obj == null) {
                throw new Error("Virtual List must have a default list item resource.");
            }
            else {
                this._itemSize.x = obj.width;
                this._itemSize.y = obj.height;
            }
            this._owner.returnToPool(obj);
        }

        if (this._type == LayoutType.SingleColumn || this._type == LayoutType.FlowX) {
            this._owner.scroller.step = this._itemSize.y;
            if (this._loop)
                (<any>this._owner.scroller)._loop = 2;
        }
        else {
            this._owner.scroller.step = this._itemSize.x;
            if (this._loop)
                (<any>this._owner.scroller)._loop = 1;
        }

        this._owner.on(UIEvent.Scroll, this, this._scrolled);
        this._changed = 2;
        ILaya.timer.callLater(this, this._refreshVirtualList);
    }

    public childIndexToItemIndex(index: number): number {
        if (!this._virtual)
            return index;

        // if (this._pageMode != 0) {
        //     for (let i = this._firstIndex; i < this._realNumItems; i++) {
        //         if (this._items[i].obj) {
        //             index--;
        //             if (index < 0)
        //                 return i;
        //         }
        //     }

        //     return index;
        // }
        // else {
        index += this._firstIndex;
        if (this._loop && this._numItems > 0)
            index = index % this._numItems;

        return index;
        //}
    }

    public itemIndexToChildIndex(index: number): number {
        if (!this._virtual)
            return index;

        // if (this._pageMode != 0) {
        //     return this.getChildIndex(this._items[index].obj);
        // }
        // else {
        if (this._loop && this._numItems > 0) {
            let j = this._firstIndex % this._numItems;
            if (index >= j)
                index = index - j;
            else
                index = this._numItems - j + index;
        }
        else
            index -= this._firstIndex;

        return index;
        //}
    }

    private shouldSnapToNext(dir: number, delta: number, size: number): boolean {
        return dir < 0 && delta > UIConfig2.defaultScrollSnappingThreshold * size
            || dir > 0 && delta > (1 - UIConfig2.defaultScrollSnappingThreshold) * size
            || dir == 0 && delta > size / 2;
    }

    public getSnappingPosition(xValue: number, yValue: number, xDir: number, yDir: number, resultPoint?: Point): Point {
        if (this._virtual) {
            if (!resultPoint)
                resultPoint = new Point();

            if (this._type == LayoutType.SingleColumn || this._type == LayoutType.FlowX) {
                let saved = yValue;
                s_n = yValue;
                let index = this.getIndexOnPos1(false);
                yValue = s_n;
                if (index < this._items.length && index < this._realNumItems) {
                    let size = this._items[index].height;
                    if (this.shouldSnapToNext(yDir, saved - yValue, size))
                        yValue += size + this._rowGap;
                }
            }
            else {
                let saved = xValue;
                s_n = xValue;
                let index = this.getIndexOnPos2(false);
                xValue = s_n;
                if (index < this._items.length && index < this._realNumItems) {
                    let size = this._items[index].width;
                    if (this.shouldSnapToNext(xDir, saved - xValue, size))
                        xValue += size + this._columnGap;
                }
            }

            // else {
            //     let saved = xValue;
            //     s_n = xValue;
            //     let index = this.getIndexOnPos3(false);
            //     xValue = s_n;
            //     if (index < this._items.length && index < this._realNumItems) {
            //         let size = this._items[index].width;
            //         if (this.shouldSnapToNext(xDir, saved - xValue, size))
            //             xValue += size + this._columnGap;
            //     }
            // }

            resultPoint.x = xValue;
            resultPoint.y = yValue;
            return resultPoint;
        }
        else
            return super.getSnappingPosition(xValue, yValue, xDir, yDir, resultPoint);
    }

    public getRectByItemIndex(index: number): Rectangle {
        if (!this._virtual || this._numItems == 0)
            return new Rectangle();

        this._checkVirtualList();

        if (index >= this._items.length)
            throw new Error("Invalid child index: " + index + ">" + this._items.length);

        if (this._loop)
            index = Math.floor(this._firstIndex / this._numItems) * this._numItems + index;

        let rect: Rectangle;
        let ii = this._items[index];
        let pos = 0;
        if (this._type == LayoutType.SingleColumn || this._type == LayoutType.FlowX) {
            for (let i = this._lineItemCnt - 1; i < index; i += this._lineItemCnt)
                pos += this._items[i].height + this._rowGap;
            rect = new Rectangle(0, pos, this._itemSize.x, ii.height);
        }
        else {
            for (let i = this._lineItemCnt - 1; i < index; i += this._lineItemCnt)
                pos += this._items[i].width + this._columnGap;
            rect = new Rectangle(pos, 0, ii.width, this._itemSize.y);
        }

        return rect;
    }

    public setChangedFlag(reason?: LayoutChangedReason) {
        super.setChangedFlag(reason);

        if (this._layoutChanged && reason == null && this._virtual) {
            this._changed = 2;
            ILaya.timer.callLater(this, this._refreshVirtualList);
        }
    }

    public refresh(force?: boolean) {
        if (!this._virtual)
            super.refresh(force);
    }

    /** @internal */
    public _checkVirtualList(): void {
        if (this._changed != 0) {
            this._refreshVirtualList();
            ILaya.timer.clear(this, this._refreshVirtualList);
        }
    }

    public refreshVirtualList(): void {
        if (this._changed == 0)
            this._changed = 1;

        ILaya.timer.callLater(this, this._refreshVirtualList);
    }

    private _refreshVirtualList(): void {
        if (this._owner.destroyed)
            return;

        let layoutChanged: boolean = this._changed == 2;
        this._changed = 0;
        this._eventLocked = true;

        let vw = this.viewWidth;
        let vh = this.viewHeight;

        if (layoutChanged) {
            this._lineItemCnt = 1;
            this._lineItemCnt2 = 1;

            if (this._type == LayoutType.FlowX) {
                if (this._columns > 0)
                    this._lineItemCnt = this._columns;
                else {
                    this._lineItemCnt = Math.floor((vw + this._columnGap) / (this._itemSize.x + this._columnGap));
                    if (this._lineItemCnt <= 0)
                        this._lineItemCnt = 1;
                }
            }
            else if (this._type == LayoutType.FlowY) {
                if (this._rows > 0)
                    this._lineItemCnt = this._rows;
                else {
                    this._lineItemCnt = Math.floor((this._owner.scroller.viewHeight + this._rowGap) / (this._itemSize.y + this._rowGap));
                    if (this._lineItemCnt <= 0)
                        this._lineItemCnt = 1;
                }
            }

            // if (this._pageMode != 0) {
            //     if (this._type == LayoutType.SingleColumn || this._type == LayoutType.FlowX) {
            //         if (this._rows > 0)
            //             this._lineItemCnt2 = this._rows;
            //         else {
            //             this._lineItemCnt2 = Math.floor((vh + this._rowGap) / (this._itemSize.y + this._rowGap));
            //             if (this._lineItemCnt2 <= 0)
            //                 this._lineItemCnt2 = 1;
            //         }
            //     }
            //     else if (this._layout == LayoutType.SingleRow || this._layout == LayoutType.FlowY) {
            //         if (this._columns > 0)
            //             this._lineItemCnt2 = this._columns;
            //         else {
            //             this._lineItemCnt2 = Math.floor((vw + this._columnGap) / (this._itemSize.x + this._columnGap));
            //             if (this._lineItemCnt2 <= 0)
            //                 this._lineItemCnt2 = 1;
            //         }
            //     }
            // }

            this._itemSizes.length = 0;
            if (this._type == LayoutType.SingleColumn || this._type == LayoutType.FlowX) {
                if (this._stretchX == StretchMode.Stretch) {
                    for (let i = 0; i < this._lineItemCnt; i++)
                        this._itemSizes[i] = this._itemSize.x;
                    this.handleStrecth(vw, this._lineItemCnt, this._columnGap, this.stretchParamsX, this._itemSizes);
                }
            }
            else {
                if (this._stretchY == StretchMode.Stretch) {
                    for (let i = 0; i < this._lineItemCnt; i++)
                        this._itemSizes[i] = this._itemSize.y;
                    this.handleStrecth(vh, this._lineItemCnt, this._rowGap, this.stretchParamsY, this._itemSizes);
                }
            }
        }

        let ch: number = 0, cw: number = 0;
        if (this._realNumItems > 0) {
            let len = Math.ceil(this._realNumItems / this._lineItemCnt) * this._lineItemCnt;
            let len2 = Math.min(this._lineItemCnt, this._realNumItems);

            if (this._pageMode == PageMode.Horizontal) {
                let pageCount = Math.ceil(len / (this._lineItemCnt * this._lineItemCnt2));
                cw = pageCount * vw;
                ch = vh;
            }
            else if (this._pageMode == PageMode.Vertical) {
                let pageCount = Math.ceil(len / (this._lineItemCnt * this._lineItemCnt2));
                cw = vw;
                ch = pageCount * vh;
            }
            else if (this._type == LayoutType.SingleColumn || this._type == LayoutType.FlowX) {
                for (let i = 0; i < len; i += this._lineItemCnt)
                    ch += this._items[i].height + this._rowGap;
                if (ch > 0)
                    ch -= this._rowGap;

                if (this._stretchX == StretchMode.Stretch)
                    cw = vw;
                else {
                    for (let i = 0; i < len2; i++)
                        cw += this._items[i].width + this._columnGap;
                    if (cw > 0)
                        cw -= this._columnGap;
                }
            }
            else {
                for (let i = 0; i < len; i += this._lineItemCnt)
                    cw += this._items[i].width + this._columnGap;
                if (cw > 0)
                    cw -= this._columnGap;

                if (this._stretchY == StretchMode.Stretch)
                    ch = vh;
                else {
                    for (let i = 0; i < len2; i++)
                        ch += this._items[i].height + this._rowGap;
                    if (ch > 0)
                        ch -= this._rowGap;
                }
            }

            this._offsetX = 0;
            this._offsetY = 0;

            if (cw < vw) {
                if (this._align == 1)
                    this._offsetX = (vw - cw) / 2;
                else if (this._align == 2)
                    this._offsetX = vw - cw;
                if (!this._owner.scroller)
                    this._offsetX += this._padding[3];
            }

            if (ch < vh) {
                if (this._valign == 1)
                    this._offsetY = (vh - ch) / 2;
                else if (this._valign == 2)
                    this._offsetY = vh - ch;
                if (!this._owner.scroller)
                    this._offsetY += this._padding[0];
            }
        }

        this.setContentSize(cw, ch);

        this._eventLocked = false;

        this.handleScroll(true);
    }

    private _scrolled(): void {
        this.handleScroll(false);
    }

    private getIndexOnPos1(forceUpdate: boolean): number {
        if (this._realNumItems < this._lineItemCnt) {
            s_n = 0;
            return 0;
        }

        if (this._owner.numChildren > 0 && !forceUpdate) {
            let pos2 = (<GWidget>this._owner.getChildAt(0)).y;
            if (pos2 > s_n) {
                for (let i = this._firstIndex - this._lineItemCnt; i >= 0; i -= this._lineItemCnt) {
                    pos2 -= (this._items[i].height + this._rowGap);
                    if (pos2 <= s_n) {
                        s_n = pos2;
                        return i;
                    }
                }

                s_n = 0;
                return 0;
            }
            else {
                for (let i = this._firstIndex; i < this._realNumItems; i += this._lineItemCnt) {
                    let pos3 = pos2 + this._items[i].height + this._rowGap;
                    if (pos3 > s_n) {
                        s_n = pos2;
                        return i;
                    }
                    pos2 = pos3;
                }

                s_n = pos2;
                return this._realNumItems - this._lineItemCnt;
            }
        }
        else {
            let pos2 = 0;
            for (let i = 0; i < this._realNumItems; i += this._lineItemCnt) {
                let pos3 = pos2 + this._items[i].height + this._rowGap;
                if (pos3 > s_n) {
                    s_n = pos2;
                    return i;
                }
                pos2 = pos3;
            }

            s_n = pos2;
            return this._realNumItems - this._lineItemCnt;
        }
    }

    private getIndexOnPos2(forceUpdate: boolean): number {
        if (this._realNumItems < this._lineItemCnt) {
            s_n = 0;
            return 0;
        }

        if (this._owner.numChildren > 0 && !forceUpdate) {
            let pos2 = (<GWidget>this._owner.getChildAt(0)).x;
            if (pos2 > s_n) {
                for (let i = this._firstIndex - this._lineItemCnt; i >= 0; i -= this._lineItemCnt) {
                    pos2 -= (this._items[i].width + this._columnGap);
                    if (pos2 <= s_n) {
                        s_n = pos2;
                        return i;
                    }
                }

                s_n = 0;
                return 0;
            }
            else {
                for (let i = this._firstIndex; i < this._realNumItems; i += this._lineItemCnt) {
                    let pos3 = pos2 + this._items[i].width + this._columnGap;
                    if (pos3 > s_n) {
                        s_n = pos2;
                        return i;
                    }
                    pos2 = pos3;
                }

                s_n = pos2;
                return this._realNumItems - this._lineItemCnt;
            }
        }
        else {
            let pos2 = 0;
            for (let i = 0; i < this._realNumItems; i += this._lineItemCnt) {
                let pos3 = pos2 + this._items[i].width + this._columnGap;
                if (pos3 > s_n) {
                    s_n = pos2;
                    return i;
                }
                pos2 = pos3;
            }

            s_n = pos2;
            return this._realNumItems - this._lineItemCnt;
        }
    }

    private getIndexOnPos3(forceUpdate: boolean): number {
        if (this._realNumItems < this._lineItemCnt) {
            s_n = 0;
            return 0;
        }

        let vw = this.viewWidth;
        let page = Math.floor(s_n / vw);
        let startIndex = page * (this._lineItemCnt * this._lineItemCnt2);
        let pos2 = page * vw;
        for (let i = 0; i < this._lineItemCnt; i++) {
            let pos3 = pos2 + this._items[startIndex + i].width + this._columnGap;
            if (pos3 > s_n) {
                s_n = pos2;
                return startIndex + i;
            }
            pos2 = pos3;
        }

        s_n = pos2;
        return startIndex + this._lineItemCnt - 1;
    }

    private handleScroll(forceUpdate: boolean): void {
        if (this._eventLocked)
            return;

        if (this._pageMode != 0) {
            this.handleScroll3(forceUpdate);
        }
        else if (this._type == LayoutType.SingleColumn || this._type == LayoutType.FlowX) {
            let enterCounter: number = 0;
            while (this.handleScroll1(forceUpdate)) {
                enterCounter++;
                forceUpdate = false;
                if (enterCounter > 20) {
                    console.log("list will never be <the> filled item renderer function always returns a different size.");
                    break;
                }
            }
        }
        else {
            let enterCounter = 0;
            while (this.handleScroll2(forceUpdate)) {
                enterCounter++;
                forceUpdate = false;
                if (enterCounter > 20) {
                    console.log("list will never be <the> filled item renderer function always returns a different size.");
                    break;
                }
            }
        }

        this._layoutChanged = false;
    }

    private handleScroll1(forceUpdate: boolean): boolean {
        let scroller = this._owner.scroller;
        let pos: number = scroller.scrollingPosY;
        let max: number = pos + scroller.viewHeight;
        let end: boolean = max == scroller.contentHeight;//这个标志表示当前需要滚动到最末，无论内容变化大小

        //寻找当前位置的第一条项目
        s_n = pos;
        let newFirstIndex: number = this.getIndexOnPos1(forceUpdate);
        pos = s_n;
        if (newFirstIndex == this._firstIndex && !forceUpdate)
            return false;

        let oldFirstIndex: number = this._firstIndex;
        this._firstIndex = newFirstIndex;
        let curIndex: number = newFirstIndex;
        let forward: boolean = oldFirstIndex > newFirstIndex;
        let childCount: number = this._owner.numChildren;
        let lastIndex: number = oldFirstIndex + childCount - 1;
        let reuseIndex: number = forward ? lastIndex : oldFirstIndex;
        let curX: number = 0, curY: number = pos;
        let needRender: boolean;
        let deltaHeight: number = 0;
        let firstItemDeltaSize: number = 0;
        let pool = this._owner.itemPool;
        let url = pool.defaultRes.url;

        this._itemInfoVer++;

        while (curIndex < this._realNumItems && (end || curY < max)) {
            let ii = this._items[curIndex];

            if (ii.obj == null || forceUpdate) {
                if (this._owner.itemProvider) {
                    url = this._owner.itemProvider(curIndex % this._numItems);
                    if (!url)
                        url = pool.defaultRes.url;
                }

                if (ii.obj && ii.obj.url != url) {
                    if (ii.obj instanceof GButton)
                        ii.selected = ii.obj.selected;
                    this._owner.removeChildToPool(ii.obj);
                    ii.obj = null;
                }
            }

            if (ii.obj == null) {
                //搜索最适合的重用item，保证每次刷新需要新建或者重新render的item最少
                if (forward) {
                    for (let j = reuseIndex; j >= oldFirstIndex; j--) {
                        let ii2 = this._items[j];
                        if (ii2.obj && ii2.flag != this._itemInfoVer && ii2.obj.url == url) {
                            if (ii2.obj instanceof GButton)
                                ii2.selected = ii2.obj.selected;
                            ii.obj = ii2.obj;
                            ii2.obj = null;
                            if (j == reuseIndex)
                                reuseIndex--;
                            break;
                        }
                    }
                }
                else {
                    for (let j = reuseIndex; j <= lastIndex; j++) {
                        let ii2 = this._items[j];
                        if (ii2.obj && ii2.flag != this._itemInfoVer && ii2.obj.url == url) {
                            if (ii2.obj instanceof GButton)
                                ii2.selected = ii2.obj.selected;
                            ii.obj = ii2.obj;
                            ii2.obj = null;
                            if (j == reuseIndex)
                                reuseIndex++;
                            break;
                        }
                    }
                }

                if (ii.obj) {
                    this._owner.setChildIndex(ii.obj, forward ? curIndex - newFirstIndex : this._owner.numChildren);
                }
                else {
                    ii.obj = pool.getObject(url);
                    if (forward)
                        this._owner.addChildAt(ii.obj, curIndex - newFirstIndex);
                    else
                        this._owner.addChild(ii.obj);
                }
                if (ii.obj instanceof GButton)
                    ii.obj.selected = ii.selected;

                needRender = true;
            }
            else
                needRender = forceUpdate;

            if (needRender) {
                let k = curIndex % this._lineItemCnt;
                if (this._stretchX == StretchMode.Stretch)
                    ii.obj.size(this._itemSizes[k], ii.obj.height);

                this._owner.itemRenderer(curIndex % this._numItems, ii.obj);
                Layout.refreshAllLayouts(this._owner);

                if (k == 0) {
                    deltaHeight += Math.ceil(ii.obj.height) - ii.height;
                    if (curIndex == newFirstIndex && oldFirstIndex > newFirstIndex) {
                        //当内容向下滚动时，如果新出现的项目大小发生变化，需要做一个位置补偿，才不会导致滚动跳动
                        firstItemDeltaSize = Math.ceil(ii.obj.height) - ii.height;
                    }
                }
                ii.width = Math.ceil(ii.obj.width);
                ii.height = Math.ceil(ii.obj.height);
            }

            ii.flag = this._itemInfoVer;
            ii.obj.pos(this._offsetX + curX, curY);
            if (curIndex == newFirstIndex) //要显示多一条才不会穿帮
                max += ii.height;

            curX += ii.width + this._columnGap;

            if (curIndex % this._lineItemCnt == this._lineItemCnt - 1) {
                curX = 0;
                curY += ii.height + this._rowGap;
            }
            curIndex++;
        }

        for (let i = 0; i < childCount; i++) {
            let ii = this._items[oldFirstIndex + i];
            if (ii.flag != this._itemInfoVer && ii.obj) {
                if (ii.obj instanceof GButton)
                    ii.selected = ii.obj.selected;
                this._owner.removeChildToPool(ii.obj);
                ii.obj = null;
            }
        }

        childCount = this._owner.children.length;
        let maxWidth = 0;
        for (let i = 0; i < childCount; i++) {
            let obj = this._items[newFirstIndex + i].obj;
            if (this._owner.children[i] != obj)
                this._owner.setChildIndex(obj, i);
            let w = obj.width;
            if (w > maxWidth)
                maxWidth = w;
        }

        let deltaWidth = 0;
        let checkOverflow: number;
        if (this._type == LayoutType.SingleColumn && (checkOverflow = scroller._shouldCheckOverflow()) != 0) {
            let resize: boolean;
            if ((checkOverflow & 2) != 0) {
                deltaWidth = maxWidth - scroller.contentWidth;
                resize = Math.abs(deltaWidth) >= 1;
            }

            if ((checkOverflow & 1) != 0 && scroller.contentHeight < scroller.viewHeight && maxWidth <= scroller.viewWidth) {
                maxWidth = scroller.viewWidth + scroller.vScrollBar.width;
                resize = true;
            }

            if (resize) {
                for (let i = 0; i < childCount; i++) {
                    let obj = <GWidget>this._owner.children[i];
                    obj.width = maxWidth;
                }
            }
        }

        if (deltaWidth != 0 || deltaHeight != 0 || firstItemDeltaSize != 0)
            scroller._changeContentSizeOnScrolling(deltaWidth, deltaHeight, 0, firstItemDeltaSize);

        if (curIndex > 0 && this._owner.numChildren > 0 && (<Sprite>this._owner._$container).y <= 0 && (<GWidget>this._owner.getChildAt(0)).y > -(<Sprite>this._owner._$container).y)//最后一页没填满！
            return true;
        else
            return false;
    }

    private handleScroll2(forceUpdate: boolean): boolean {
        let pos: number = this._owner.scroller.scrollingPosX;
        let max: number = pos + this._owner.scroller.viewWidth;
        let end: boolean = pos == this._owner.scroller.contentWidth;//这个标志表示当前需要滚动到最末，无论内容变化大小

        //寻找当前位置的第一条项目
        s_n = pos;
        let newFirstIndex: number = this.getIndexOnPos2(forceUpdate);
        pos = s_n;
        if (newFirstIndex == this._firstIndex && !forceUpdate)
            return false;

        let oldFirstIndex: number = this._firstIndex;
        this._firstIndex = newFirstIndex;
        let curIndex: number = newFirstIndex;
        let forward: boolean = oldFirstIndex > newFirstIndex;
        let childCount: number = this._owner.numChildren;
        let lastIndex: number = oldFirstIndex + childCount - 1;
        let reuseIndex: number = forward ? lastIndex : oldFirstIndex;
        let curX: number = pos, curY: number = 0;
        let needRender: boolean;
        let deltaSize: number = 0;
        let firstItemDeltaSize: number = 0;
        let pool = this._owner.itemPool;
        let url = pool.defaultRes.url;

        this._itemInfoVer++;

        while (curIndex < this._realNumItems && (end || curX < max)) {
            let ii = this._items[curIndex];

            if (ii.obj == null || forceUpdate) {
                if (this._owner.itemProvider) {
                    url = this._owner.itemProvider(curIndex % this._numItems);
                    if (!url)
                        url = pool.defaultRes.url;
                }

                if (ii.obj && ii.obj.url != url) {
                    if (ii.obj instanceof GButton)
                        ii.selected = ii.obj.selected;
                    this._owner.removeChildToPool(ii.obj);
                    ii.obj = null;
                }
            }

            if (ii.obj == null) {
                if (forward) {
                    for (let j = reuseIndex; j >= oldFirstIndex; j--) {
                        let ii2 = this._items[j];
                        if (ii2.obj && ii2.flag != this._itemInfoVer && ii2.obj.url == url) {
                            if (ii2.obj instanceof GButton)
                                ii2.selected = ii2.obj.selected;
                            ii.obj = ii2.obj;
                            ii2.obj = null;
                            if (j == reuseIndex)
                                reuseIndex--;
                            break;
                        }
                    }
                }
                else {
                    for (let j = reuseIndex; j <= lastIndex; j++) {
                        let ii2 = this._items[j];
                        if (ii2.obj && ii2.flag != this._itemInfoVer && ii2.obj.url == url) {
                            if (ii2.obj instanceof GButton)
                                ii2.selected = ii2.obj.selected;
                            ii.obj = ii2.obj;
                            ii2.obj = null;
                            if (j == reuseIndex)
                                reuseIndex++;
                            break;
                        }
                    }
                }

                if (ii.obj) {
                    this._owner.setChildIndex(ii.obj, forward ? curIndex - newFirstIndex : this._owner.numChildren);
                }
                else {
                    ii.obj = pool.getObject(url);
                    if (forward)
                        this._owner.addChildAt(ii.obj, curIndex - newFirstIndex);
                    else
                        this._owner.addChild(ii.obj);
                }
                if (ii.obj instanceof GButton)
                    ii.obj.selected = ii.selected;

                needRender = true;
            }
            else
                needRender = forceUpdate;

            if (needRender) {
                let k = curIndex % this._lineItemCnt;
                if (this._stretchY == StretchMode.Stretch)
                    ii.obj.size(ii.obj.width, this._itemSizes[k]);

                this._owner.itemRenderer(curIndex % this._numItems, ii.obj);
                Layout.refreshAllLayouts(this._owner);

                if (k == 0) {
                    deltaSize += Math.ceil(ii.obj.width) - ii.width;
                    if (curIndex == newFirstIndex && oldFirstIndex > newFirstIndex) {
                        //当内容向下滚动时，如果新出现的一个项目大小发生变化，需要做一个位置补偿，才不会导致滚动跳动
                        firstItemDeltaSize = Math.ceil(ii.obj.width) - ii.width;
                    }
                }
                ii.width = Math.ceil(ii.obj.width);
                ii.height = Math.ceil(ii.obj.height);
            }

            ii.flag = this._itemInfoVer;
            ii.obj.pos(curX, this._offsetY + curY);
            if (curIndex == newFirstIndex) //要显示多一条才不会穿帮
                max += ii.width;

            curY += ii.height + this._rowGap;

            if (curIndex % this._lineItemCnt == this._lineItemCnt - 1) {
                curY = 0;
                curX += ii.width + this._columnGap;
            }
            curIndex++;
        }

        for (let i = 0; i < childCount; i++) {
            let ii = this._items[oldFirstIndex + i];
            if (ii.flag != this._itemInfoVer && ii.obj) {
                if (ii.obj instanceof GButton)
                    ii.selected = ii.obj.selected;
                this._owner.removeChildToPool(ii.obj);
                ii.obj = null;
            }
        }

        childCount = this._owner.numChildren;
        for (let i = 0; i < childCount; i++) {
            let obj = this._items[newFirstIndex + i].obj;
            if (this._owner.children[i] != obj)
                this._owner.setChildIndex(obj, i);
        }

        if (deltaSize != 0 || firstItemDeltaSize != 0)
            this._owner.scroller._changeContentSizeOnScrolling(deltaSize, 0, firstItemDeltaSize, 0);

        if (curIndex > 0 && this._owner.numChildren > 0 && (<Sprite>this._owner._$container).x <= 0 && (<GWidget>this._owner.getChildAt(0)).x > - (<Sprite>this._owner._$container).x)//最后一页没填满！
            return true;
        else
            return false;
    }

    private handleScroll3(forceUpdate: boolean): void {
        let pos: number = this._owner.scroller.scrollingPosX;

        //寻找当前位置的第一条项目
        s_n = pos;
        let newFirstIndex: number = this.getIndexOnPos3(forceUpdate);
        pos = s_n;
        if (newFirstIndex == this._firstIndex && !forceUpdate)
            return;

        let oldFirstIndex: number = this._firstIndex;
        this._firstIndex = newFirstIndex;

        //分页模式不支持不等高，所以渲染满一页就好了

        let reuseIndex: number = oldFirstIndex;
        let virtualItemCount: number = this._items.length;
        let pageSize: number = this._lineItemCnt * this._lineItemCnt2;
        let startCol: number = newFirstIndex % this._lineItemCnt;
        let vw: number = this.viewWidth;
        let vh: number = this.viewHeight;
        let page: number = Math.floor(newFirstIndex / pageSize);
        let startIndex: number = page * pageSize;
        let lastIndex: number = startIndex + pageSize * 2; //测试两页
        let needRender: boolean;
        let partWidth: number = (vw - this._columnGap * (this._lineItemCnt - 1)) / this._lineItemCnt;
        let partHeight: number = (vh - this._rowGap * (this._lineItemCnt2 - 1)) / this._lineItemCnt2;
        let pool = this._owner.itemPool;
        let url = pool.defaultRes.url;

        this._itemInfoVer++;

        //先标记这次要用到的项目
        for (let i = startIndex; i < lastIndex; i++) {
            if (i >= this._realNumItems)
                continue;

            let col = i % this._lineItemCnt;
            if (i - startIndex < pageSize) {
                if (col < startCol)
                    continue;
            }
            else {
                if (col > startCol)
                    continue;
            }

            let ii = this._items[i];
            ii.flag = this._itemInfoVer;
        }

        let lastObj: GWidget = null;
        let insertIndex: number = 0;
        for (let i = startIndex; i < lastIndex; i++) {
            if (i >= this._realNumItems)
                continue;

            let ii = this._items[i];
            if (ii.flag != this._itemInfoVer)
                continue;

            if (ii.obj == null) {
                //寻找看有没有可重用的
                while (reuseIndex < virtualItemCount) {
                    let ii2 = this._items[reuseIndex];
                    if (ii2.obj && ii2.flag != this._itemInfoVer) {
                        if (ii2.obj instanceof GButton)
                            ii2.selected = ii2.obj.selected;
                        ii.obj = ii2.obj;
                        ii2.obj = null;
                        break;
                    }
                    reuseIndex++;
                }

                if (insertIndex == -1)
                    insertIndex = this._owner.getChildIndex(lastObj) + 1;

                if (ii.obj == null) {
                    if (this._owner.itemProvider) {
                        url = this._owner.itemProvider(i % this._numItems);
                        if (!url)
                            url = pool.defaultRes.url;
                    }

                    ii.obj = pool.getObject(url);
                    this._owner.addChildAt(ii.obj, insertIndex);
                }
                else {
                    insertIndex = this._owner.setChildIndexBefore(ii.obj, insertIndex);
                }
                insertIndex++;

                if (ii.obj instanceof GButton)
                    ii.obj.selected = ii.selected;

                needRender = true;
            }
            else {
                needRender = forceUpdate;
                insertIndex = -1;
                lastObj = ii.obj;
            }

            if (needRender) {
                if (this._stretchX == StretchMode.Stretch || this._stretchY == StretchMode.Stretch) {
                    if (this._lineItemCnt == this._columns && this._lineItemCnt2 == this._rows)
                        ii.obj.size(partWidth, partHeight);
                    else if (this._lineItemCnt == this._columns)
                        ii.obj.size(partWidth, ii.obj.height);
                    else if (this._lineItemCnt2 == this._rows)
                        ii.obj.size(ii.obj.width, partHeight);
                }

                this._owner.itemRenderer(i % this._numItems, ii.obj);
                Layout.refreshAllLayouts(this._owner);

                ii.width = Math.ceil(ii.obj.width);
                ii.height = Math.ceil(ii.obj.height);
            }
        }

        //排列item
        let borderX: number = (startIndex / pageSize) * vw;
        let xx: number = borderX;
        let yy: number = 0;
        let lineHeight: number = 0;
        for (let i = startIndex; i < lastIndex; i++) {
            if (i >= this._realNumItems)
                continue;

            let ii = this._items[i];
            if (ii.flag == this._itemInfoVer)
                ii.obj.pos(xx, yy);

            if (ii.height > lineHeight)
                lineHeight = ii.height;
            if (i % this._lineItemCnt == this._lineItemCnt - 1) {
                xx = borderX;
                yy += lineHeight + this._rowGap;
                lineHeight = 0;

                if (i == startIndex + pageSize - 1) {
                    borderX += vw;
                    xx = borderX;
                    yy = 0;
                }
            }
            else
                xx += ii.width + this._columnGap;
        }

        //释放未使用的
        for (let i = reuseIndex; i < virtualItemCount; i++) {
            let ii = this._items[i];
            if (ii.flag != this._itemInfoVer && ii.obj) {
                if (ii.obj instanceof GButton)
                    ii.selected = ii.obj.selected;
                this._owner.removeChildToPool(ii.obj);
                ii.obj = null;
            }
        }
    }

}

interface ItemInfo {
    width: number;
    height: number;
    obj?: GWidget;
    flag: number;
    selected?: boolean;
}

let s_n: number = 0;