import { UIConfig2 } from "./UIConfig";
import { Sprite } from "../display/Sprite";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { LayoutChangedReason, RelationType } from "./Const";
import { Controller } from "./Controller";
import { Relation } from "./Relation";
import type { GTreeNode } from "./GTreeNode";
import { Gear } from "./gear/Gear";
import { GearDisplay } from "./gear/GearDisplay";
import { NodeFlags } from "../Const";
import { UIEvent } from "./UIEvent";
import { ILaya } from "../../ILaya";
import { IGraphicsCmd } from "../display/IGraphics";
import { GRoot } from "./GRoot";
import { Event } from "../events/Event";
import { DragSupport } from "../utils/DragSupport";
import { Scene } from "../display/Scene";
import { ColorEffect2D } from "../display/effect2d/ColorEffect2D";
import { PostProcess2D } from "../display/PostProcess2D";

/**
 * @blueprintInheritable
 */
export class GWidget extends Sprite {
    data: any;

    private _tooltips: string;
    private _asGroup: boolean = false;
    private _grayed: boolean = false;
    private _background: IGraphicsCmd;

    private _draggable: boolean = false;

    private _controllers: Record<string, Controller>;
    private _controllerCount: number;
    private _gears: Array<Gear>;
    private _relations: Array<Relation>;
    private _forceSizeFlag: boolean;

    /** @internal */
    _treeNode: GTreeNode;
    /** @internal */
    _rawWidth: number = 0;
    /** @internal */
    _rawHeight: number = 0;
    /** @internal */
    _deltaWidth: number = 0;
    /** @internal */
    _deltaHeight: number = 0;

    _giveWidth: number = 0;
    _giveHeight: number = 0;

    sourceWidth: number = 0;
    sourceHeight: number = 0;

    /** @internal */
    static _defaultRoot: GRoot;

    constructor() {
        super();

        this._nodeType = 2;
        this._controllers = {};
        this._gears = [];
        this._relations = [];
        this._controllerCount = 0;

        this._initialize();
    }

    get left(): number {
        return this._x - this._width * this._anchorX;
    }

    set left(value: number) {
        this.pos(value + this._width * this._anchorX, this.y);
    }

    get top(): number {
        return this._y - this._height * this._anchorY;
    }

    set top(value: number) {
        this.pos(this._x, value + this._height * this._anchorY);
    }

    setLeftTop(xv: number, yv: number): void {
        xv = xv != null ? xv + this._width * this._anchorX : this._x;
        yv = yv != null ? yv + this._height * this._anchorY : this._y;
        this.pos(xv, yv);
    }

    center(target?: GWidget): this {
        let r: Sprite = target;
        if (!r) {
            if (this.parent)
                r = this.parent;
            else
                r = ILaya.stage;
        }

        this.setLeftTop(Math.floor((r.width - this.width) * 0.5), Math.floor((r.height - this.height) * 0.5));

        return this;
    }

    pos(x: number, y: number): this {
        if (this._x != x || this._y != y) {
            super.pos(x, y);

            if (this.parent?._nodeType == 2)
                (<GWidget>this.parent).setLayoutChangedFlag?.(LayoutChangedReason.Pos);
            this.event(Event.MOVED);
        }

        return this;
    }

    size(wv: number, hv: number, changeByLayout?: boolean): this {
        if (this._width == wv && this._height == hv) {
            if (this._forceSizeFlag)
                this._forceSizeFlag = false;
            else
                return this;
        }

        this._rawWidth = wv;
        this._rawHeight = hv;
        if (!changeByLayout) {
            this._giveWidth = wv;
            this._giveHeight = hv;
        }
        if (wv < 0) wv = 0;
        if (hv < 0) hv = 0;
        this._deltaWidth = wv - this._width;
        this._deltaHeight = hv - this._height;

        super.size(wv, hv);

        this.setLayoutChangedFlag();

        this._sizeChanged(changeByLayout);

        if (this.parent) {
            if (this._relations.length > 0) {
                for (let item of this._relations)
                    item.applyOnSelfResized();
            }
            if (this.parent?._nodeType == 2)
                (<GWidget>this.parent).setLayoutChangedFlag(LayoutChangedReason.Size);
        }

        this.event(Event.RESIZE);

        this._deltaWidth = 0;
        this._deltaHeight = 0;

        return this;
    }

    makeFullSize(target?: GWidget): this {
        let r: Sprite = target;
        if (!r) {
            if (this.parent)
                r = this.parent;
            else
                r = ILaya.stage;
        }
        this.size(r.width, r.height);
        return this;
    }

    private _grayEffect:ColorEffect2D;

    get grayed(): boolean {
        return this._grayed;
    }

    set grayed(value: boolean) {
        if (this._grayed != value) {
            this._grayed = value;

            let postProcess = this._getPostProcess(value);
            if (value) {
                this._grayEffect ||= new ColorEffect2D([0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0, 0, 0, 1, 0]);
                postProcess.addEffect(this._grayEffect);
            }
            else {
                if (postProcess) {
                    postProcess.removeEffect(this._grayEffect)
                }
            }
        }
    }

    get enabled(): boolean {
        return !this.grayed && this.mouseEnabled;
    }

    set enabled(value: boolean) {
        this.grayed = !value;
        this.mouseEnabled = value;
    }

    /** @internal */
    get internalVisible() {
        return !this._getBit(NodeFlags.NOT_IN_PAGE);
    }

    /** @internal */
    set internalVisible(value: boolean) {
        if (((this._bits & NodeFlags.NOT_IN_PAGE) === 0) !== value) {
            this._setBit(NodeFlags.NOT_IN_PAGE, !value);
            this._processVisible();
            if (this._parent?.activeInHierarchy && this.active)
                this._processActive(value, true);
        }
    }

    get treeNode(): GTreeNode {
        return this._treeNode;
    }

    get tooltips(): string {
        return this._tooltips;
    }

    set tooltips(value: string) {
        if (this._tooltips) {
            this.off(Event.ROLL_OVER, this, this._rollOver);
            this.off(Event.ROLL_OUT, this, this._rollOut);
        }

        this._tooltips = value;
        if (this._tooltips) {
            this.on(Event.ROLL_OVER, this, this._rollOver);
            this.on(Event.ROLL_OUT, this, this._rollOut);
        }
    }

    private _rollOver(): void {
        GWidget._defaultRoot.popupMgr.showTooltips(this._tooltips, UIConfig2.defaultTooltipsShowDelay);
    }

    private _rollOut(): void {
        GWidget._defaultRoot.popupMgr.hideTooltips();
    }

    get text(): string {
        return "";
    }

    set text(value: string) {
    }

    get icon(): string {
        return null;
    }

    set icon(value: string) {
    }

    get background(): IGraphicsCmd {
        return this._background;
    }

    set background(value: IGraphicsCmd) {
        if (this._background)
            this._graphics.removeCmd(this._background);
        this._background = value;
        if (value)
            this.graphics.addCmd(value, 0);
    }

    get draggable(): boolean {
        return this._draggable;
    }

    set draggable(value: boolean) {
        if (this._draggable != value) {
            this._draggable = value;

            if (value) {
                if (!this._dragSupport)
                    this._dragSupport = new DragSupport(this);
            }
            if (this._dragSupport)
                this._dragSupport.autoStart = value;
        }
    }

    get relations(): Array<Relation> {
        return this._relations;
    }

    /** @internal */
    set relations(value: Array<Relation>) {
        if (this._relations.length > 0)
            this._relations.filter(g => !value.includes(g)).forEach(g => g.owner = null);
        this._relations = value;
        value.forEach(g => g.owner = this);
    }

    /** @internal */
    _addRelations(value: Array<Relation>) {
        for (let v of value) {
            v.owner = this;
            this._relations.push(v);
        }
    }

    addRelation(target: GWidget | Scene, type: RelationType, percent?: boolean): this {
        let item = this._relations.find(i => i.target == target);
        if (!item) {
            item = new Relation();
            item.owner = this;
            item.target = target;
            this._relations.push(item);
        }
        item.add(type, percent);
        return this;
    }

    removeRelation(target: GWidget | Scene, type: RelationType): this {
        let item = this._relations.find(i => i.target == target);
        if (item)
            item.remove(type);
        return this;
    }

    clearRelations(): this {
        this._relations.length = 0;
        return this;
    }

    get controllers(): Readonly<Record<string, Controller>> {
        return this._controllers;
    }

    get controllerCount(): number {
        return this._controllerCount;
    }

    /** @internal */
    set controllers(value: Readonly<Record<string, Controller>>) {
        this._controllers = value;
        let i = 0;
        for (let k in value) {
            value[k].name = k;
            value[k].owner = this;
            i++;
        }
        this._controllerCount = i;
        this._controllersChanged();
    }

    addController(name: string, pageCount?: number): Controller {
        if (this._controllers[name]) {
            console.warn(`controller ${name} already exists`);
            return this._controllers[name];
        }
        let c = new Controller();
        c.name = name;
        c.owner = this;
        if (pageCount != null)
            c.numPages = pageCount;
        this._controllers[name] = c;
        this._controllerCount++;
        this._controllersChanged();
        return c;
    }

    getController(name: string): Controller {
        return this._controllers[name];
    }

    setPage(controllerName: string, pageName: string): void;
    setPage(controllerName: string, pageIndex: number): void;
    setPage(controllerName: string, page: number | string): void {
        let c = this._controllers[controllerName];
        if (!c)
            return;

        if (typeof (page) === "number")
            c.selectedIndex = page;
        else
            c.selectedPage = page;
    }

    protected _controllersChanged() {
        this.event(UIEvent.ControllersChanged);
    }

    get gears(): Array<Gear> {
        return this._gears;
    }

    /** @internal */
    set gears(value: Array<Gear>) {
        let visChanged: boolean;
        if (this._gears.length > 0) {

            this._gears.filter(g => !value.includes(g)).forEach(g => {
                if (g instanceof GearDisplay)
                    visChanged = true;
                g.owner = null;
            });
        }
        this._gears = value;
        value.forEach(g => g.owner = this);

        if (visChanged)
            GearDisplay.check(this);
    }

    /** @internal */
    _addGears(value: Array<Gear>) {
        this._gears.push(...value);
        value.forEach(g => g.owner = this);
    }

    addGear(value: Gear) {
        this._gears.push(value);
        value.owner = this;
    }

    removeGear(value: Gear) {
        let i = this._gears.indexOf(value);
        if (i != -1) {
            this._gears.splice(i, 1);
            value.owner = null;
        }
    }

    destroy(): void {
        super.destroy();

        for (let k in this._controllers)
            this._controllers[k].offAll();
        for (let g of this._gears)
            g.owner = null;
    }

    protected _sizeChanged(changeByLayout?: boolean): void {
    }

    protected _childChanged(child?: Sprite): void {
        super._childChanged(child);

        this.setLayoutChangedFlag(LayoutChangedReason.Hierarchy);
    }

    /**
     * @ignore
     * @returns 
     */
    _processVisible(): boolean {
        if (super._processVisible()) {
            if (this.parent?._nodeType == 2)
                (<GWidget>this.parent).setLayoutChangedFlag?.(LayoutChangedReason.Visible);
            return true;
        }
        else
            return false;
    }

    setLayoutChangedFlag(reason?: LayoutChangedReason): void {
    }

    get asGroup(): boolean {
        return !!this._asGroup;
    }

    set asGroup(value: boolean) {
        this._asGroup = !!value;
    }

    /** @internal */
    _onConstruct(inPrefab?: boolean): void {
        if (inPrefab && this._relations.length > 0) {
            for (let r of this._relations) {
                r._sw = this._width;
                r._sh = this._height;
                if (r.target)
                    (<GWidget>r.target)._forceSizeFlag = true;
            }
        }
        this.onConstruct();
    }

    /** @blueprintIgnore */
    onConstruct() {
    }

    /** @blueprintIgnore */
    onAfterDeserialize() {
        super.onAfterDeserialize();
        if (SerializeUtil.hasProp("_startPages")) {
            let col: Record<string, number> = (<any>this)._startPages;
            if (col) {
                for (let k in col) {
                    let c = this.getController(k);
                    if (c)
                        c.selectedIndex = col[k];
                }
            }
        }
    }
}

// const grayFilter = new ColorFilter([
//     0.3086, 0.6094, 0.082, 0, 0,
//     0.3086, 0.6094, 0.082, 0, 0,
//     0.3086, 0.6094, 0.082, 0, 0,
//     0, 0, 0, 1, 0
// ]);