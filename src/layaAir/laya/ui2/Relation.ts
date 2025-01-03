import { LayaEnv } from "../../LayaEnv";
import { Event } from "../events/Event";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { RelationType } from "./Const";
import { GWidget } from "./GWidget";
import { UIEvent } from "./UIEvent";

const handlingFlag = Symbol();

export class Relation {
    private _owner: GWidget;
    private _target: GWidget;
    private _data: Array<number>;
    private _tx: number;
    private _ty: number;
    private _tw: number;
    private _th: number;
    /** @internal */
    _sw: number;
    /** @internal */
    _sh: number;

    constructor() {
        this._data = [];
    }

    public get owner(): GWidget {
        return this._owner;
    }

    public set owner(value: GWidget) {
        this._owner = value;
        if (this._target) {
            if (this._owner)
                this.setTarget();
            else
                this.unsetTarget();
        }
    }

    public set target(value: GWidget) {
        if (this._target != value) {
            if (this._target)
                this.unsetTarget();
            this._target = value;
            if (this._owner && this._target)
                this.setTarget();
        }
    }

    public get target(): GWidget {
        return this._target;
    }

    public get data(): Array<number> {
        return this._data;
    }

    public set data(value: Array<number>) {
        this._data = value;
    }

    public add(type: RelationType, percent: boolean): void {
        if (type == RelationType.Size) {
            this.add(RelationType.Width, percent);
            this.add(RelationType.Height, percent);
            return;
        }
        else if (type == RelationType.Pos) {
            this.add(RelationType.Left_Left, percent);
            this.add(RelationType.Top_Top, percent);
            return;
        }
        else if (type == RelationType.CenterAndMiddle) {
            this.add(RelationType.Center_Center, percent);
            this.add(RelationType.Middle_Middle, percent);
            return;
        }

        if (this._data.findIndex((v, i) => v == type && (i % 2) == 0) == -1)
            this._data.push(type, percent ? 1 : 0);
    }

    public remove(type: RelationType): void {
        if (type == RelationType.Size) {
            this.remove(RelationType.Width);
            this.remove(RelationType.Height);
            return;
        }

        for (let i = 0, n = this._data.length; i < n; i += 2) {
            if (this._data[i] == type) {
                this._data.splice(i, 2);
                break;
            }
        }
    }

    private setTarget(): void {
        let t = this._target;
        this._tx = t.x;
        this._ty = t.y;
        this._tw = t.width;
        this._th = t.height;

        t.on(Event.MOVED, this, this.posChanged);
        t.on(Event.RESIZE, this, this.sizeChanged);
        if (!LayaEnv.isPlaying)
            t.on(UIEvent.instance_reload, this, this.instReload);
    }

    private unsetTarget(): void {
        this._target.off(Event.MOVED, this, this.posChanged);
        this._target.off(Event.RESIZE, this, this.sizeChanged);
        if (!LayaEnv.isPlaying)
            this._target.off(UIEvent.instance_reload, this, this.instReload);
    }

    public applyOnSelfResized(): void {
        if (this._data.length == 0)
            return;

        for (let i = 0, n = this._data.length; i < n; i += 2) {
            switch (this._data[i]) {
                case RelationType.Center_Center:
                    this._owner.x -= (0.5 - this._owner.anchorX) * this._owner._deltaWidth;
                    break;

                case RelationType.Right_Center:
                case RelationType.Right_Left:
                case RelationType.Right_Right:
                    this._owner.x -= (1 - this._owner.anchorX) * this._owner._deltaWidth;
                    break;

                case RelationType.Middle_Middle:
                    this._owner.y -= (0.5 - this._owner.anchorY) * this._owner._deltaHeight;
                    break;

                case RelationType.Bottom_Middle:
                case RelationType.Bottom_Top:
                case RelationType.Bottom_Bottom:
                    this._owner.y -= (1 - this._owner.anchorY) * this._owner._deltaHeight;
                    break;
            }
        }
    }

    private applyOnPosChanged(type: RelationType, dx: number, dy: number): void {
        let tmp: number;
        switch (type) {
            case RelationType.Left_Left:
            case RelationType.Left_Center:
            case RelationType.Left_Right:
            case RelationType.Center_Center:
            case RelationType.Right_Left:
            case RelationType.Right_Center:
            case RelationType.Right_Right:
                this._owner.x += dx;
                break;

            case RelationType.Top_Top:
            case RelationType.Top_Middle:
            case RelationType.Top_Bottom:
            case RelationType.Middle_Middle:
            case RelationType.Bottom_Top:
            case RelationType.Bottom_Middle:
            case RelationType.Bottom_Bottom:
                this._owner.y += dy;
                break;

            case RelationType.Width:
            case RelationType.Height:
                break;

            case RelationType.LeftExt_Left:
            case RelationType.LeftExt_Right:
                tmp = this._owner.left;
                this._owner.width = this._owner._rawWidth - dx;
                this._owner.left = tmp + dx;
                break;

            case RelationType.RightExt_Left:
            case RelationType.RightExt_Right:
                tmp = this._owner.left;
                this._owner.width = this._owner._rawWidth + dx;
                this._owner.left = tmp;
                break;

            case RelationType.TopExt_Top:
            case RelationType.TopExt_Bottom:
                tmp = this._owner.top;
                this._owner.height = this._owner._rawHeight - dy;
                this._owner.top = tmp + dy;
                break;

            case RelationType.BottomExt_Top:
            case RelationType.BottomExt_Bottom:
                tmp = this._owner.top;
                this._owner.height = this._owner._rawHeight + dy;
                this._owner.top = tmp;
                break;
        }
    }

    private applyOnSizeChanged(ow: GWidget, type: RelationType, percent: boolean, tw: number, th: number, isAncestor: boolean): void {
        let pos: number = 0, anchor: number = 0, delta: number = 0;
        let v: number, tmp: number;
        let rw: number, rh: number;

        if (hRelations[type]) {
            if (!isAncestor) {
                pos = this._target.x;
                anchor = this._target.anchorX;
            }

            if (percent) {
                if (this._tw != 0)
                    delta = tw / this._tw;
            }
            else
                delta = tw - this._tw;
        }
        else {
            if (!isAncestor) {
                pos = this._target.y;
                anchor = this._target.anchorY;
            }

            if (percent) {
                if (this._th != 0)
                    delta = th / this._th;
            }
            else
                delta = th - this._th;
        }

        switch (type) {
            case RelationType.Left_Left:
                if (percent)
                    ow.left = pos + (ow.left - pos) * delta;
                else if (anchor != 0)
                    ow.x += delta * (-anchor);
                break;
            case RelationType.Left_Center:
                if (percent)
                    ow.left = pos + (ow.left - pos) * delta;
                else
                    ow.x += delta * (0.5 - anchor);
                break;
            case RelationType.Left_Right:
                if (percent)
                    ow.left = pos + (ow.left - pos) * delta;
                else
                    ow.x += delta * (1 - anchor);
                break;
            case RelationType.Center_Center:
                if (percent)
                    ow.left = pos + (ow.left + ow._rawWidth * 0.5 - pos) * delta - ow._rawWidth * 0.5;
                else
                    ow.x += delta * (0.5 - anchor);
                break;
            case RelationType.Right_Left:
                if (percent)
                    ow.left = pos + (ow.left + ow._rawWidth - pos) * delta - ow._rawWidth;
                else if (anchor != 0)
                    ow.x += delta * (-anchor);
                break;
            case RelationType.Right_Center:
                if (percent)
                    ow.left = pos + (ow.left + ow._rawWidth - pos) * delta - ow._rawWidth;
                else
                    ow.x += delta * (0.5 - anchor);
                break;
            case RelationType.Right_Right:
                if (percent)
                    ow.left = pos + (ow.left + ow._rawWidth - pos) * delta - ow._rawWidth;
                else
                    ow.x += delta * (1 - anchor);
                break;

            case RelationType.Top_Top:
                if (percent)
                    ow.top = pos + (ow.top - pos) * delta;
                else if (anchor != 0)
                    ow.y += delta * (-anchor);
                break;
            case RelationType.Top_Middle:
                if (percent)
                    ow.top = pos + (ow.top - pos) * delta;
                else
                    ow.y += delta * (0.5 - anchor);
                break;
            case RelationType.Top_Bottom:
                if (percent)
                    ow.top = pos + (ow.top - pos) * delta;
                else
                    ow.y += delta * (1 - anchor);
                break;
            case RelationType.Middle_Middle:
                if (percent)
                    ow.top = pos + (ow.top + ow._rawHeight * 0.5 - pos) * delta - ow._rawHeight * 0.5;
                else
                    ow.y += delta * (0.5 - anchor);
                break;
            case RelationType.Bottom_Top:
                if (percent)
                    ow.top = pos + (ow.top + ow._rawHeight - pos) * delta - ow._rawHeight;
                else if (anchor != 0)
                    ow.y += delta * (-anchor);
                break;
            case RelationType.Bottom_Middle:
                if (percent)
                    ow.top = pos + (ow.top + ow._rawHeight - pos) * delta - ow._rawHeight;
                else
                    ow.y += delta * (0.5 - anchor);
                break;
            case RelationType.Bottom_Bottom:
                if (percent)
                    ow.top = pos + (ow.top + ow._rawHeight - pos) * delta - ow._rawHeight;
                else
                    ow.y += delta * (1 - anchor);
                break;

            case RelationType.Width:
                if (ow._deltaWidth != 0)
                    break;
                if (this._sw != null) {
                    v = this._sw - this._tw;
                    this._sw = null;
                }
                else
                    v = ow._rawWidth - this._tw;
                if (percent)
                    v = v * delta;
                if (isAncestor) {
                    tmp = ow.left;
                    ow.size(tw + v, ow._rawHeight);
                    ow.left = tmp;
                }
                else
                    ow.width = tw + v;
                break;
            case RelationType.Height:
                if (ow._deltaHeight != 0)
                    break;
                if (this._sh != null) {
                    v = this._sh - this._th;
                    this._sh = null;
                }
                else
                    v = ow._rawHeight - this._th;
                if (percent)
                    v = v * delta;
                if (isAncestor) {
                    tmp = ow.top;
                    ow.size(ow._rawWidth, th + v);
                    ow.top = tmp;
                }
                else
                    ow.height = th + v;
                break;

            case RelationType.LeftExt_Left:
                tmp = ow.left;
                if (percent)
                    v = pos + (tmp - pos) * delta - tmp;
                else
                    v = delta * (-anchor);
                ow.width = ow._rawWidth - v;
                ow.left = tmp + v;
                break;
            case RelationType.LeftExt_Right:
                tmp = ow.left;
                if (percent)
                    v = pos + (tmp - pos) * delta - tmp;
                else
                    v = delta * (1 - anchor);
                ow.width = ow._rawWidth - v;
                ow.left = tmp + v;
                break;
            case RelationType.RightExt_Left:
                tmp = ow.left;
                if (percent)
                    v = pos + (tmp + ow._rawWidth - pos) * delta - (tmp + ow._rawWidth);
                else
                    v = delta * (-anchor);
                ow.width = ow._rawWidth + v;
                ow.left = tmp;
                break;
            case RelationType.RightExt_Right:
                if (ow._deltaWidth != 0)
                    break;
                tmp = ow.left;
                rw = ow._rawWidth;
                if (this._sw != null) {
                    rw = this._sw;
                    this._sw = null;
                }
                if (percent) {
                    v = pos + (tmp + rw - pos) * delta - (tmp + rw);
                    ow.width = rw + v;
                    ow.left = tmp;
                }
                else {
                    v = delta * (1 - anchor);
                    ow.width = rw + v;
                    ow.left = tmp;
                }
                break;
            case RelationType.TopExt_Top:
                tmp = ow.top;
                if (percent)
                    v = pos + (tmp - pos) * delta - tmp;
                else
                    v = delta * (-anchor);
                ow.height = ow._rawHeight - v;
                ow.top = tmp + v;
                break;
            case RelationType.TopExt_Bottom:
                tmp = ow.top;
                if (percent)
                    v = pos + (tmp - pos) * delta - tmp;
                else
                    v = delta * (1 - anchor);
                ow.height = ow._rawHeight - v;
                ow.top = tmp + v;
                break;
            case RelationType.BottomExt_Top:
                tmp = ow.top;
                if (percent)
                    v = pos + (tmp + ow._rawHeight - pos) * delta - (tmp + ow._rawHeight);
                else
                    v = delta * (-anchor);
                ow.height = ow._rawHeight + v;
                ow.top = tmp;
                break;
            case RelationType.BottomExt_Bottom:
                if (ow._deltaHeight != 0)
                    break;
                tmp = ow.top;
                rh = ow._rawHeight;
                if (this._sh != null) {
                    rh = this._sh;
                    this._sh = null;
                }
                if (percent) {
                    v = pos + (tmp + rh - pos) * delta - (tmp + rh);
                    ow.height = rh + v;
                    ow.top = tmp;
                }
                else {
                    v = delta * (1 - anchor);
                    ow.height = rh + v;
                    ow.top = tmp;
                }
                break;
        }
    }

    private posChanged(): void {
        if (!this._owner || (this._owner as any)[handlingFlag]) {
            this._tx = this._target.x;
            this._ty = this._target.y;
            return;
        }

        if (this._target.isAncestorOf(this._owner))
            return;

        let tmp = SerializeUtil.isDeserializing;
        if (tmp)
            SerializeUtil.isDeserializing = false;

        (this._owner as any)[handlingFlag] = true;
        let dx = this._target.x - this._tx;
        let dy = this._target.y - this._ty;
        for (let i = 0, n = this._data.length; i < n; i += 2)
            this.applyOnPosChanged(this._data[i], dx, dy);
        (this._owner as any)[handlingFlag] = false;

        if (tmp)
            SerializeUtil.isDeserializing = true;

        this._tx = this._target.x;
        this._ty = this._target.y;
    }

    private sizeChanged(): void {
        let tw = this._target.width, th = this._target.height;
        let ow = <GWidget & { [handlingFlag]: boolean }>this._owner;

        if (!ow || ow[handlingFlag]) {
            this._tw = tw;
            this._th = th;
            return;
        }

        let isAncestor = this._target.isAncestorOf(ow);
        let tmp = SerializeUtil.isDeserializing;
        if (tmp)
            SerializeUtil.isDeserializing = false;

        ow[handlingFlag] = true;
        for (let i = 0, n = this._data.length; i < n; i += 2)
            this.applyOnSizeChanged(ow, this._data[i], this._data[i + 1] == 1, tw, th, isAncestor);
        ow[handlingFlag] = false;

        if (tmp)
            SerializeUtil.isDeserializing = true;

        this._tw = tw;
        this._th = th;
    }

    private instReload(newIns: any) {
        this.target = newIns;
    }
}


const hRelations: Array<boolean> = [];
(function () {
    const arr = [
        RelationType.Width,
        RelationType.Left_Left,
        RelationType.Left_Center,
        RelationType.Left_Right,
        RelationType.Center_Center,
        RelationType.Right_Left,
        RelationType.Right_Center,
        RelationType.Right_Right,
        RelationType.LeftExt_Left,
        RelationType.LeftExt_Right,
        RelationType.RightExt_Left,
        RelationType.RightExt_Right
    ];
    for (let i of arr)
        hRelations[i] = true;
})();