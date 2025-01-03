import { StretchParam } from "../StretchParam";
import type { GBox } from "../GBox";
import { AlignType, LayoutChangedReason, LayoutType, PageMode, StretchMode, VAlignType } from "../Const";
import type { GPanel } from "../GPanel";
import type { GWidget } from "../GWidget";
import { ILayout } from "./ILayout";
import { SerializeUtil } from "../../loaders/SerializeUtil";
import { Point } from "../../maths/Point";
import { Rectangle } from "../../maths/Rectangle";
import { ILaya } from "../../../ILaya";
import { NodeFlags } from "../../Const";
import { Pool } from "../../utils/Pool";
import { UIEvent } from "../UIEvent";

export class Layout implements ILayout {
    protected _owner: GBox;
    protected _type: LayoutType = 0;
    protected _rows: number = 0;
    protected _columns: number = 0;
    protected _rowGap: number = 0;
    protected _columnGap: number = 0;
    protected _stretchX: StretchMode = 0;
    protected _stretchY: StretchMode = 0;
    protected _pageMode: PageMode = 0;
    protected _layoutChanged: boolean;
    protected _padding: Array<number>;
    protected _align: AlignType = 0;
    protected _valign: VAlignType = 0;
    protected _foldInvisibles: boolean;
    protected _stretchParamsX: Array<StretchParam>;
    protected _stretchParamsY: Array<StretchParam>;
    protected _minChildSize: number = 0;
    protected _childSizeChangedFlag: boolean;
    protected _contentWidth: number = 0;
    protected _contentHeight: number = 0;
    protected _refreshing: boolean;

    _disabled: boolean;

    constructor(owner: GBox) {
        this._owner = owner;

        this._padding = [0, 0, 0, 0];
        this._stretchParamsX = [];
        this._stretchParamsY = [];
    }

    public get type(): LayoutType {
        return this._type;
    }

    public set type(value: LayoutType) {
        if (this._type != value) {
            this._type = value;
            if (!SerializeUtil.isDeserializing) {
                (<GPanel>this._owner).scroller?._setDefaultDirection();

                switch (value) {
                    case LayoutType.SingleColumn:
                    case LayoutType.FlowX:
                        this._stretchY = StretchMode.None;
                        break;
                    case LayoutType.SingleRow:
                    case LayoutType.FlowY:
                        this._stretchX = StretchMode.None;
                        break;
                }
            }
            this.setChangedFlag();
        }
    }

    public get rows(): number {
        return this._rows;
    }

    public set rows(value: number) {
        if (this._rows != value) {
            this._rows = value;
            this.setChangedFlag();
        }
    }

    public get columns(): number {
        return this._columns;
    }

    public set columns(value: number) {
        if (this._columns != value) {
            this._columns = value;
            this.setChangedFlag();
        }
    }

    public get rowGap(): number {
        return this._rowGap;
    }

    public set rowGap(value: number) {
        if (this._rowGap != value) {
            this._rowGap = value;
            this.setChangedFlag();
        }
    }

    public get columnGap(): number {
        return this._columnGap;
    }

    public set columnGap(value: number) {
        if (this._columnGap != value) {
            this._columnGap = value;
            this.setChangedFlag();
        }
    }

    public get padding(): Array<number> {
        return this._padding;
    }

    public set padding(value: Array<number>) {
        if (value == null || !Array.isArray(value)) value = [0, 0, 0, 0];
        this._padding = value;
        this.setChangedFlag();
        (<GPanel>this._owner).scroller?._ownerSizeChanged();
    }

    public get align(): AlignType {
        return this._align;
    }

    public set align(value: AlignType) {
        if (this._align != value) {
            this._align = value;
            this.setChangedFlag();
        }
    }

    public get valign(): VAlignType {
        return this._valign;
    }

    public set valign(value: VAlignType) {
        if (this._valign != value) {
            this._valign = value;
            this.setChangedFlag();
        }
    }

    public get stretchX(): StretchMode {
        return this._stretchX;
    }

    public set stretchX(value: StretchMode) {
        if (this._stretchX != value) {
            this._stretchX = value;
            this.setChangedFlag();
        }
    }

    public get stretchY(): StretchMode {
        return this._stretchY;
    }

    public set stretchY(value: StretchMode) {
        if (this._stretchY != value) {
            this._stretchY = value;
            this.setChangedFlag();
        }
    }

    public get stretchParamsX(): Array<StretchParam> {
        return this._stretchParamsX;
    }

    /** @internal */
    private set stretchParamsX(value: Array<StretchParam>) {
        this._stretchParamsX.length = 0;
        this._stretchParamsX.push(...value);
    }

    public get stretchParamsY(): Array<StretchParam> {
        return this._stretchParamsY;
    }

    /** @internal */
    public set stretchParamsY(value: Array<StretchParam>) {
        this._stretchParamsY.length = 0;
        this._stretchParamsY.push(...value);
    }

    public get foldInvisibles(): boolean {
        return this._foldInvisibles;
    }

    public set foldInvisibles(value: boolean) {
        if (this._foldInvisibles != value) {
            this._foldInvisibles = value;
            this.setChangedFlag();
        }
    }

    public get minChildSize(): number {
        return this._minChildSize;
    }
    public set minChildSize(value: number) {
        if (this._minChildSize != value) {
            this._minChildSize = value;
            this.setChangedFlag();
        }
    }

    public get pageMode(): PageMode {
        return this._pageMode;
    }
    public set pageMode(value: PageMode) {
        if (this._pageMode != value) {
            this._pageMode = value;
            this.setChangedFlag();
        }
    }

    /**
     * dir正数表示右移或者下移，负数表示左移或者上移
     */
    public getSnappingPosition(xValue: number, yValue: number, xDir: number, yDir: number, resultPoint?: Point): Point {
        if (!resultPoint)
            resultPoint = new Point();

        let children = <GWidget[]>this._owner.children;
        let cnt = children.length;
        if (cnt == 0) {
            resultPoint.x = 0;
            resultPoint.y = 0;
            return resultPoint;
        }

        this.refresh();

        let obj: GWidget = null;
        let prev: GWidget = null;
        let i = 0;
        if (yValue != 0) {
            for (; i < cnt; i++) {
                obj = children[i];
                if (yValue < obj.y) {
                    if (i == 0) {
                        yValue = 0;
                        break;
                    }
                    else {
                        prev = children[i - 1];
                        if (yValue < prev.y + prev.height / 2) //top half part
                            yValue = prev.y;
                        else //bottom half part
                            yValue = obj.y;
                        break;
                    }
                }
            }

            if (i == cnt)
                yValue = obj.y;
        }

        if (xValue != 0) {
            if (i > 0)
                i--;
            for (; i < cnt; i++) {
                obj = children[i];
                if (xValue < obj.x) {
                    if (i == 0) {
                        xValue = 0;
                        break;
                    }
                    else {
                        prev = children[i - 1];
                        if (xValue < prev.x + prev.width / 2) //top half part
                            xValue = prev.x;
                        else //bottom half part
                            xValue = obj.x;
                        break;
                    }
                }
            }

            if (i == cnt)
                xValue = obj.x;
        }

        resultPoint.x = xValue;
        resultPoint.y = yValue;
        return resultPoint;
    }

    public setChangedFlag(reason?: LayoutChangedReason) {
        if (this._layoutChanged)
            return;

        let layout = this._type;

        if (layout == LayoutType.None && !(<GPanel>this._owner).scroller)
            return;

        if (reason == LayoutChangedReason.Visible && !this._foldInvisibles)
            return;

        if (reason == LayoutChangedReason.Pos && layout != LayoutType.None)
            return;

        if (reason == LayoutChangedReason.Size)
            this._childSizeChangedFlag = true;

        this._layoutChanged = true;

        if (_dirtyLayouts.indexOf(this) == -1) {
            _dirtyLayouts.push(this);

            if (!_timerAdded) {
                _timerAdded = true;
                ILaya.timer.callLater(null, Layout.refreshAllLayouts);
            }
        }
    }

    public refresh(force?: boolean) {
        if (force) {
            if (!this._layoutChanged) this._childSizeChangedFlag = true;
            this._layoutChanged = true;
        }

        if (!this._layoutChanged || this._owner.destroyed || this._disabled || this._refreshing)
            return;

        this._refreshing = true;

        switch (this._type) {
            case LayoutType.None:
                this.applyNone();
                break;
            case LayoutType.SingleRow:
                this.applyFlowX(true);
                break;
            case LayoutType.SingleColumn:
                this.applyFlowY(true);
                break;
            case LayoutType.FlowX:
                this.applyFlowX();
                break;
            case LayoutType.FlowY:
                this.applyFlowY();
                break;
        }

        this._refreshing = false;
        this._layoutChanged = false;
        this._childSizeChangedFlag = false;
    }

    public get viewWidth(): number {
        let v = (<GPanel>this._owner).scroller?.viewWidth;
        if (v == null)
            v = this._owner.width - this._padding[3] - this._padding[1];
        return v;
    }

    public set viewWidth(value: number) {
        if ((<GPanel>this._owner).scroller)
            (<GPanel>this._owner).scroller.setViewSize(value, (<GPanel>this._owner).scroller.viewHeight);
        else
            this._owner.width = value + this._padding[3] + this._padding[1];
    }

    public get viewHeight(): number {
        let v = (<GPanel>this._owner).scroller?.viewHeight;
        if (v == null)
            v = this._owner.height - this._padding[0] - this._padding[2];
        return v;
    }

    public set viewHeight(value: number) {
        if ((<GPanel>this._owner).scroller)
            (<GPanel>this._owner).scroller.setViewSize((<GPanel>this._owner).scroller.viewWidth, value);
        else
            this._owner.height = value + this._padding[0] + this._padding[2];
    }

    public get contentWidth() {
        return this._contentWidth;
    }

    public get contentHeight() {
        return this._contentHeight;
    }

    public setContentSize(aw: number, ah: number): void {
        this._contentWidth = aw;
        this._contentHeight = ah;

        if (aw != 0 && ah != 0) {
            if (this._stretchX == StretchMode.ResizeToFit && this._stretchY == StretchMode.ResizeToFit) {
                if ((<GPanel>this._owner).scroller)
                    (<GPanel>this._owner).scroller.setViewSize(aw, ah);
                else
                    this._owner.size(aw + this._padding[3] + this._padding[1], ah + this._padding[0] + this._padding[2]);
            }
            else if (this._stretchX == StretchMode.ResizeToFit)
                this.viewWidth = aw;
            else if (this._stretchY == StretchMode.ResizeToFit)
                this.viewHeight = ah;
        }

        (<GPanel>this._owner).scroller?._ownerContentSizeChanged();

        this._owner.event(UIEvent.content_size_changed);
    }

    public resizeToFit(childCount?: number, minSize?: number): void {
        this.refresh();

        let curCount: number = this._owner.numChildren;
        if (childCount == null || childCount > curCount)
            childCount = curCount;
        minSize = minSize || 0;

        if (childCount == 0) {
            if (this._type == LayoutType.SingleColumn || this._type == LayoutType.FlowX)
                this.viewHeight = minSize;
            else
                this.viewWidth = minSize;
        }
        else {
            let i = childCount - 1;
            let obj: GWidget = null;
            while (i >= 0) {
                obj = this._owner.getChildAt(i);
                if ((!this._foldInvisibles || obj._getBit(NodeFlags.ACTUAL_VISIBLE)) && !obj._getBit(NodeFlags.ESCAPE_LAYOUT))
                    break;
                i--;
            }
            if (i < 0) {
                if (this._type == LayoutType.SingleColumn || this._type == LayoutType.FlowX)
                    this.viewHeight = minSize;
                else
                    this.viewWidth = minSize;
            }
            else {
                let size = 0;
                if (this._type == LayoutType.SingleColumn || this._type == LayoutType.FlowX) {
                    size = obj.y + obj.height;
                    if (size < minSize)
                        size = minSize;
                    this.viewHeight = size;
                }
                else {
                    size = obj.x + obj.width;
                    if (size < minSize)
                        size = minSize;
                    this.viewWidth = size;
                }
            }
        }
    }

    protected applyNone() {
        this._owner.getChildrenBounds(false, this._foldInvisibles, false, s_rect);
        this.setContentSize(Math.max(0, Math.ceil(s_rect.right)), Math.max(0, Math.ceil(s_rect.bottom)));
    }

    private applyFlowX(singleRow?: boolean) {
        let rows = this._rows;
        let cols = this._columns;
        if (singleRow) {
            rows = 1;
            if (cols == 0)
                cols = 1000000;
        }
        let rowGap = this._rowGap;
        let colGap = this._columnGap;
        let stretchX = this._stretchX == StretchMode.Stretch;
        let stretchY = this._stretchY == StretchMode.Stretch;
        let pageMode = this._pageMode;
        let align = stretchX ? 0 : this._align;
        let data = tempDataPool.take();
        let cnt = this.getLayoutChildren(data);
        let children = data.children;
        let vw = this.viewWidth, vh = this.viewHeight;
        let cx = 0, cy = 0;
        let px = 0, py = 0;
        let ci = 0, ri = 0;
        let cw = 0, ch = 0;
        let mh = 0;

        if (stretchX) {
            if (cols == 0 || cnt < cols)
                cols = cnt;
            let stretchParamsX = this.checkStretchParams(this._stretchParamsX, data);
            for (let i = 0; i < cols; i++)
                data.swidth[i] = this._childSizeChangedFlag ? children[i].width : children[i]._giveWidth;
            this.handleStrecth(vw, cols, colGap, stretchParamsX, data.swidth, data.width);
        }

        if (cnt > 0 && stretchY) {
            if (rows == 0)
                rows = 1;
            for (let i = 0; i < rows; i++)
                data.sheight[i] = this._childSizeChangedFlag ? children[0].height : children[0]._giveHeight;
            this.handleStrecth(vh, rows, rowGap, this._stretchParamsY, data.sheight, data.height);
        }

        function newLine(i: number) {
            mh = Math.ceil(mh);

            if (cy != 0)
                cy += rowGap;

            if (cx > cw)
                cw = cx;

            if (align == 1)
                cx = (vw - cx) * 0.5;
            else if (align == 2)
                cx = vw - cx;
            else
                cx = 0;

            if (pageMode != 0) {
                if (cy + mh > vh && cy != 0) {
                    if (pageMode == PageMode.Horizontal)
                        px += vw;
                    else {
                        py += vh;
                        cy = 0;
                    }
                }
            }

            for (let j = i - ci; j < i; j++) {
                data.posx[j] += px + cx;
                data.posy[j] = py + cy;
            }

            cx = 0;
            cy += mh;
            mh = 0;
            ci = 0;
            ri++;
        }

        for (let x = 0; x < 2; x++) {
            for (let i = 0; i < cnt; i++) {
                let child = children[i];
                child.size(stretchX ? data.width[ci % cols] : child._giveWidth, stretchY ? data.height[ri % rows] : child._giveHeight, true);
                let sw = Math.ceil(child.width);

                if (cols == 0 && cx + colGap + sw > vw && cx != 0) {
                    newLine(i);

                    child.size(stretchX ? data.width[ci] : child._giveWidth, stretchY ? data.height[ri % rows] : child._giveHeight, true);
                    sw = Math.ceil(child.width);
                }

                if (cx != 0)
                    cx += colGap;
                data.posx[i] = cx;
                cx += sw;

                if (child.height > mh)
                    mh = child.height;

                ci++;
                if (ci == cols && !singleRow || i == cnt - 1)
                    newLine(i + 1);
            }

            ch = py + cy;

            let checkOverflow = (<GPanel>this._owner).scroller?._shouldCheckOverflow();
            if (checkOverflow == null)
                break;

            if (ch <= vh && stretchX && (checkOverflow & 1) != 0) {
                vw += (<GPanel>this._owner).scroller.vScrollBar.width;
                this.handleStrecth(vw, cols, colGap, this._stretchParamsX, data.swidth, data.width);
            }
            else
                checkOverflow &= ~1;
            if (cw <= vw && stretchY && (checkOverflow & 2) != 0) {
                vh += (<GPanel>this._owner).scroller.hScrollBar.height;
                this.handleStrecth(vh, rows, rowGap, this._stretchParamsY, data.sheight, data.height);
            }
            else
                checkOverflow &= ~2;

            if (checkOverflow == 0)
                break;

            cx = cy = px = py = ci = ri = cw = ch = mh = 0;
        }

        cy = 0;
        if (ch < vh && this._stretchY != StretchMode.ResizeToFit) {
            if (this._valign == 1)
                cy = (vh - ch) / 2;
            else if (this._valign == 2)
                cy = vh - ch;
        }

        cx = 0;
        if (this._stretchX == StretchMode.ResizeToFit) {
            if (align == 1 || align == 2) {
                cx = Math.floor((cw - vw) / 2);
                if (cx > 0)
                    cx = 0;
            }
        }

        if (!(<GPanel>this._owner).scroller) {
            cx += this._padding[3];
            cy += this._padding[0];
        }

        if (singleRow && !stretchY && this._valign == 3) {
            for (let i = 0; i < cnt; i++)
                children[i].left = data.posx[i] + cx;
        }
        else {
            for (let i = 0; i < cnt; i++)
                children[i].setLeftTop(data.posx[i] + cx, data.posy[i] + cy);
        }

        this.setContentSize(cw, ch);

        tempDataPool.recover(data);
    }

    private applyFlowY(singleColumn?: boolean) {
        let rows = this._rows;
        let cols = this._columns;
        if (singleColumn) {
            cols = 1;
            if (rows == 0)
                rows = 1000000;
        }
        let rowGap = this._rowGap;
        let colGap = this._columnGap;
        let stretchX = this._stretchX == StretchMode.Stretch;
        let stretchY = this._stretchY == StretchMode.Stretch;
        let pageMode = this._pageMode;
        let valign = stretchY ? 0 : this._valign;
        let data = tempDataPool.take();
        let cnt = this.getLayoutChildren(data);
        let children = data.children;
        let vw = this.viewWidth, vh = this.viewHeight;
        let cx = 0, cy = 0;
        let px = 0, py = 0;
        let ci = 0, ri = 0;
        let cw = 0, ch = 0;
        let mw = 0;

        if (cnt > 0 && stretchX) {
            if (cols == 0)
                cols = 1;
            for (let i = 0; i < cols; i++)
                data.swidth[i] = this._childSizeChangedFlag ? children[0].width : children[0]._giveWidth;
            this.handleStrecth(vw, cols, colGap, this._stretchParamsX, data.swidth, data.width);
        }

        if (stretchY) {
            if (rows == 0 || cnt < rows)
                rows = cnt;
            let stretchParamsY = this.checkStretchParams(this._stretchParamsY, data);
            for (let i = 0; i < rows; i++)
                data.sheight[i] = this._childSizeChangedFlag ? children[i].height : children[i]._giveHeight;
            this.handleStrecth(vh, rows, rowGap, stretchParamsY, data.sheight, data.height);
        }

        function newLine(i: number) {
            mw = Math.ceil(mw);

            if (cx != 0)
                cx += colGap;

            if (cy > ch)
                ch = cy;

            if (valign == 1)
                cy = (vh - cy) * 0.5;
            else if (valign == 2)
                cy = vh - cy;
            else
                cy = 0;

            if (pageMode != 0) {
                if (cx + mw > vw && cx != 0) {
                    if (pageMode == PageMode.Horizontal)
                        px += vw;
                    else {
                        py += vh;
                        cx = 0;
                    }
                }
            }

            for (let j = i - ri; j < i; j++) {
                data.posx[j] = px + cx;
                data.posy[j] += py + cy;
            }

            cy = 0;
            cx += mw;
            mw = 0;
            ri = 0;
            ci++;
        }

        for (let x = 0; x < 2; x++) {
            for (let i = 0; i < cnt; i++) {
                let child = children[i];
                child.size(stretchX ? data.width[ci % cols] : child._giveWidth, stretchY ? data.height[ri % rows] : child._giveHeight, true);
                let sh = Math.ceil(child.height);

                if (rows == 0 && cy + rowGap + sh > vh && cy != 0) {
                    newLine(i);

                    child.size(stretchX ? data.width[ci % cols] : child._giveWidth, stretchY ? data.height[ri] : child._giveHeight, true);
                    sh = Math.ceil(child.height);
                }

                if (cy != 0)
                    cy += rowGap;
                data.posy[i] = cy;
                cy += sh;

                if (child.width > mw)
                    mw = child.width;

                ri++;
                if (ri == rows && !singleColumn || i == cnt - 1)
                    newLine(i + 1);
            }

            cw = px + cx;

            let checkOverflow = (<GPanel>this._owner).scroller?._shouldCheckOverflow();
            if (checkOverflow == null)
                break;

            if (ch <= vh && stretchX && (checkOverflow & 1) != 0) {
                vw += (<GPanel>this._owner).scroller.vScrollBar.width;
                this.handleStrecth(vw, cols, colGap, this._stretchParamsX, data.swidth, data.width);
            }
            else
                checkOverflow &= ~1;
            if (cw <= vw && stretchY && (checkOverflow & 2) != 0) {
                vh += (<GPanel>this._owner).scroller.hScrollBar.height;
                this.handleStrecth(vh, rows, rowGap, this._stretchParamsY, data.sheight, data.height);
            }
            else
                checkOverflow &= ~2;

            if (checkOverflow == 0)
                break;

            cx = cy = px = py = ci = ri = cw = ch = mw = 0;
        }

        cx = 0;
        if (cw < vw && this._stretchX != StretchMode.ResizeToFit) {
            if (this._align == 1)
                cx = (vw - cw) / 2;
            else if (this._align == 2)
                cx = vw - cw;
            else
                cx = 0;
        }

        cy = 0;
        if (this._stretchY == StretchMode.ResizeToFit) {
            if (valign == 1 || valign == 2) {
                cy = Math.floor((ch - vh) / 2);
                if (cy > 0)
                    cy = 0;
            }
        }

        if (!(<GPanel>this._owner).scroller) {
            cx += this._padding[3];
            cy += this._padding[0];
        }

        if (singleColumn && !stretchX && this._align == 3) {
            for (let i = 0; i < cnt; i++)
                children[i].top = data.posy[i] + cy;
        }
        else {
            for (let i = 0; i < cnt; i++)
                children[i].setLeftTop(data.posx[i] + cx, data.posy[i] + cy);
        }

        this.setContentSize(cw, ch);

        tempDataPool.recover(data);
    }

    protected getLayoutChildren(data: TempData) {
        let i = 0, j = 0;
        data.invisibleCnt = 0;
        for (let child of <GWidget[]>this._owner.children) {
            if (this._foldInvisibles && !child._getBit(NodeFlags.ACTUAL_VISIBLE) || child._getBit(NodeFlags.ESCAPE_LAYOUT))
                data.invisibles[data.invisibleCnt++] = i;
            else
                data.children[j++] = child;
            i++;
        }
        return j;
    }

    protected checkStretchParams(src: Array<StretchParam>, data: TempData) {
        if (data.invisibleCnt == 0)
            return src;

        let out = data.stretchParams;
        let j = 0, k = 0;
        let test = data.invisibles[j];
        for (let i = 0; i < src.length; i++) {
            if (i != test)
                out[k++] = src[i];
            else {
                j++;
                if (j >= data.invisibleCnt)
                    test = -1;
                else
                    test = data.invisibles[j];
            }
        }
        return out;
    }

    protected handleStrecth(size: number, count: number, gap: number, params: Array<StretchParam>,
        sourceSizes: Array<number>, outSizes?: Array<number>) {
        outSizes = outSizes || sourceSizes;
        if (count == 1 && !params[0]) {
            outSizes[0] = size;
            return;
        }

        let lineSize = Math.max(0, size - gap * (count - 1));
        let minChildSize = this._minChildSize;
        let lineSize2 = 0;
        let lineSize3 = 0;
        let ratio = 0;
        let hasRatio: boolean;

        for (let i = 0; i < count; i++) {
            let param = params[i] || defParam;
            if (param.ratio != 0) {
                hasRatio = true;
                ratio += param.ratio;
            }
            else
                lineSize3 += sourceSizes[i];
        }
        ratio = Math.max(0, 1 - ratio);

        for (let i = 0; i < count; i++) {
            let param = params[i] || defParam;
            let itemSize = sourceSizes[i];
            if (hasRatio) {
                if (param.ratio != 0)
                    itemSize = Math.floor(lineSize * param.ratio);
                else
                    itemSize = ratio * (itemSize / lineSize3);
            }

            if (!param.fixed) {
                let min = param.min != 0 ? param.min : minChildSize;
                if (itemSize < min)
                    itemSize = min;

                if (param.max > 0 && itemSize > param.max)
                    itemSize = param.max;
            }

            outSizes[i] = itemSize;
            lineSize2 += itemSize;
        }

        let dist = lineSize2 - lineSize;
        if (dist > 0) { //need reduce size
            let round = 0;
            while (dist > 0) {
                let k = 0;
                let lineSize3 = 0;
                for (let i = 0; i < count; i++) {
                    let param = params[i] || defParam;
                    if (param.fixed) {
                        limit[i] = null;
                        continue;
                    }

                    let min = param.min != 0 ? param.min : minChildSize;
                    let ts = outSizes[i];
                    if (ts > min
                        && (round >= 2
                            || round == 0 && param.priority > 0
                            || round == 1 && (param == defParam || param.ratio == 0 && param.priority >= 0))) {
                        limit[i] = min;
                        lineSize3 += ts;
                        k++;
                    }
                    else
                        limit[i] = null;
                }

                if (k == 0) {
                    round++;
                    if (round > 2)
                        break;
                    else
                        continue;
                }

                let ps = dist / k;
                let ps2 = 0;
                for (let i = 0; i < count; i++) {
                    let min = limit[i];
                    if (min == null)
                        continue;

                    ps2 += ps;
                    k--;
                    if (ps2 < 0) {
                        if (k != 0)
                            continue;
                        else
                            ps2 = Math.floor(ps2);
                    }

                    let ts = outSizes[i];
                    ps2 = Math.ceil(ps2);
                    ts = Math.max(ts - ps2, min);
                    ps2 = ps - ps2;
                    dist -= (outSizes[i] - ts);
                    outSizes[i] = ts;
                }
                dist = Math.floor(dist);
                round++;
            }
        }
        else if (dist < 0) {
            let round = 0;
            dist = -dist;
            while (dist > 0) {
                let k = 0;
                let lineSize3 = 0;
                for (let i = 0; i < count; i++) {
                    let param = params[i] || defParam;;
                    if (param.fixed) {
                        limit[i] = null;
                        continue;
                    }

                    let max = param.max != 0 ? param.max : 1000000;
                    let ts = outSizes[i];
                    if (ts < max
                        && (round >= 2
                            || round == 0 && param.priority > 0
                            || round == 1 && (param == defParam || param.ratio == 0 && param.priority >= 0))) {
                        limit[i] = max;
                        lineSize3 += ts;
                        k++;
                    }
                    else
                        limit[i] = null;
                }

                if (k == 0) {
                    round++;
                    if (round > 2)
                        break;
                    else
                        continue;
                }

                let ps = dist / k;
                let ps2 = 0;
                for (let i = 0; i < count; i++) {
                    let max = limit[i];
                    if (max == null)
                        continue;

                    ps2 += ps;
                    k--;
                    if (ps2 < 1) {
                        if (k != 0)
                            continue;
                        else
                            ps2 = 1;
                    }

                    let ts = outSizes[i];
                    ps2 = Math.floor(ps2);
                    ts = Math.min(ts + ps2, max);
                    ps2 = ps - ps2;
                    dist -= (ts - outSizes[i]);
                    outSizes[i] = ts;
                }

                dist = Math.ceil(dist);
                round++;
            }
        }
    }

    protected static refreshAllLayouts(caller?: GWidget) {
        let len = _dirtyLayouts.length;
        if (len == 0)
            return;

        if (caller) {
            for (let i = 0; i < len; i++) {
                let layout = _dirtyLayouts[i];
                if (layout && caller.isAncestorOf(layout._owner)) {
                    _dirtyLayouts[i] = null;
                    layout.refresh();
                }
            }
        }
        else {
            _timerAdded = false;
            for (let i = 0; i < len; i++) {
                let layout = _dirtyLayouts[i];
                if (layout) {
                    _dirtyLayouts[i] = null;
                    layout.refresh();
                }
            }
            if (_dirtyLayouts.length > len)
                _dirtyLayouts.splice(0, len);
            else
                _dirtyLayouts.length = 0;
        }
    }
}

var _timerAdded = false;
var _dirtyLayouts: Array<Layout> = [];

class TempData {
    children: Array<GWidget> = [];
    invisibles: Array<number> = [];
    invisibleCnt: number = 0;
    stretchParams: Array<StretchParam> = [];
    posx: Array<number> = [];
    posy: Array<number> = [];
    width: Array<number> = [];
    swidth: Array<number> = [];
    height: Array<number> = [];
    sheight: Array<number> = [];
}

const tempDataPool = Pool.createPool(TempData);
const limit: Array<number> = [];
const s_rect = new Rectangle();
const defParam = new StretchParam();