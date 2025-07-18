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
import { IGraphicsCmd } from "../display/IGraphics";
import { GRoot } from "./GRoot";
import { Event } from "../events/Event";
import { DragSupport } from "../utils/DragSupport";
import { Scene } from "../display/Scene";
import { GrayscaleEffect2D } from "../display/effect2d/ColorEffect2D";

/**
 * @en GWidget is the base class for all UI widgets in the New UI system.
 * @zh GWidget 是新 UI 系统中所有 UI 小部件的基类。
 * @blueprintInheritable
 */
export class GWidget extends Sprite {
    /**
     * @en The data associated with this widget, which can be used to store custom information.
     * @zh 与此小部件关联的数据，可用于存储自定义信息。
     */
    data: any;

    /** 
     * @en The tree node associated with this widget.
     * @zh 与此小部件关联的树节点。
     */
    readonly treeNode: GTreeNode;

    private _tooltips: string;
    private _grayed: boolean = false;
    private _background: IGraphicsCmd;

    private _draggable: boolean = false;

    private _controllers: Record<string, Controller>;
    private _controllerCount: number;
    private _gears: Array<Gear>;
    private _relations: Array<Relation>;
    private _forceSizeFlag: boolean;

    /** @internal */
    _rawWidth: number = 0;
    /** @internal */
    _rawHeight: number = 0;
    /** @internal */
    _deltaWidth: number = 0;
    /** @internal */
    _deltaHeight: number = 0;

    /** @ignore */
    _giveWidth: number = 0;
    /** @ignore */
    _giveHeight: number = 0;

    /** @ignore */
    sourceWidth: number = 0;
    /** @ignore */
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

    /**
     * @en The leftmost x-coordinate of the widget, calculated based on the anchor point.
     * @zh 小部件最左侧的 x 坐标，根据锚点计算。
     */
    get left(): number {
        return this._x - this._width * this._anchorX;
    }

    set left(value: number) {
        this.pos(value + this._width * this._anchorX, this.y);
    }

    /**
     * @en The topmost y-coordinate of the widget, calculated based on the anchor point.
     * @zh 小部件最上方的 y 坐标，根据锚点
     */
    get top(): number {
        return this._y - this._height * this._anchorY;
    }

    set top(value: number) {
        this.pos(this._x, value + this._height * this._anchorY);
    }

    /**
     * @en Sets the position of the widget based on its anchor point.
     * @param xv The x-coordinate to set.
     * @param yv The y-coordinate to set.
     * @zh 根据锚点设置小部件的位置。
     * @param xv 要设置的 x 坐标.
     * @param yv 要设置的 y 坐标.
     */
    setLeftTop(xv: number, yv: number): void {
        xv = xv != null ? xv + this._width * this._anchorX : this._x;
        yv = yv != null ? yv + this._height * this._anchorY : this._y;
        this.pos(xv, yv);
    }

    /**
     * @en Centers the widget within the specified target or its parent.
     * If no target is specified, it will center within the parent or stage.
     * @param target The target widget or scene to center within. If not provided, it defaults to the parent or stage.
     * @returns Returns the current GWidget instance for method chaining.
     * @zh 在指定的目标或其父级中居中小部件。
     * 如果未指定目标，则默认在父级或舞台中居中。
     * @param target 要在其中居中的目标小部件或场景。如果未提供，则默认为父级或舞台。
     * @returns 返回当前的 GWidget 实例，以便进行方法链调用。
     */
    center(target?: GWidget): this {
        let r: Sprite = target;
        if (!r) {
            if (this.parent)
                r = this.parent;
            else
                r = GWidget._defaultRoot;
        }

        this.setLeftTop(Math.floor((r.width - this.width) * 0.5), Math.floor((r.height - this.height) * 0.5));

        return this;
    }

    /** @ignore @blueprintIgnore */
    pos(x: number, y: number): this {
        if (this._x != x || this._y != y) {
            super.pos(x, y);

            if (this.parent?._nodeType == 2)
                (<GWidget>this.parent).setLayoutChangedFlag?.(LayoutChangedReason.Pos);
            this.event(Event.MOVED);
        }

        return this;
    }

    /** @ignore @blueprintIgnore */
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

    /**
     * @en Makes the widget fill the entire size of the specified target or its parent.
     * If no target is specified, it will fill the parent or stage.
     * @param target The target widget to fill. If not provided, it defaults to the parent node, or the default root node (GRoot) if the scene node also does not exist.
     * @param constraints Whether to add Size constraints. Default is false.
     * @returns Returns the current GWidget instance for method chaining.
     * @zh 使小部件填充指定目标或其父级的整个大小。
     * 如果未指定目标，则默认填充父级或舞台。
     * @param target 要填充的目标小部件。如果未提供，则使用父级节点，如果父级节点不存在，则使用默认根节点（GRoot)。     
     * @param constraints 是否添加Size关联。默认为false。
     * @returns 返回当前的 GWidget 实例，以便进行方法链调用。 
     */
    makeFullSize(target?: GWidget, constraints?: boolean): this {
        let r: GWidget | Scene = target;
        if (!r) {
            if (this.parent instanceof GWidget)
                r = this.parent;
            else
                r = GWidget._defaultRoot;
        }
        this.size(r.width, r.height);
        if (constraints)
            this.addRelation(r, RelationType.Size);
        return this;
    }

    /**
     * @en Indicates whether the widget is grayed out.
     * @zh 指示小部件是否被灰显。
     */
    get grayed(): boolean {
        return this._grayed;
    }

    set grayed(value: boolean) {
        value = !!value;
        if (this._grayed !== value) {
            this._grayed = value;
            let postProcess = this.getPostProcess(value);
            if (value) {
                let effect = postProcess.getEffect(GrayscaleEffect2D);
                if (!effect)
                    effect = postProcess.addEffect(new GrayscaleEffect2D());
            } else {
                if (postProcess) {
                    let effect = postProcess.getEffect(GrayscaleEffect2D);
                    if (effect)
                        postProcess.removeEffect(effect);
                }
            }
        }
    }

    /**
     * @en Indicates whether the widget is enabled.
     * @zh 指示小部件是否启用。
     */
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

    /**
     * @en The tooltips text displayed when the mouse hovers over the widget.
     * @zh 鼠标悬停在小部件上时显示的工具提示文本。
     */
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

    /**
     * @en The text content of the widget.
     * @zh 小部件的文本内容。
     */
    get text(): string {
        return "";
    }

    set text(value: string) {
    }

    /**
     * @en The icon of the widget.
     * @zh 小部件的图标。
     */
    get icon(): string {
        return null;
    }

    set icon(value: string) {
    }

    /**
     * @en The background graphics command of the widget.
     * @zh 小部件的背景图形命令。
     */
    get background(): IGraphicsCmd {
        return this._background;
    }

    set background(value: IGraphicsCmd) {
        if (this._background)
            this.graphics.removeCmd(this._background, true);
        this._background = value;
        if (value) {
            value.lock = true;
            this.graphics.addCmd(value, 0);
        }
    }

    /**
     * @en Indicates whether the widget can be dragged.
     * @zh 指示小部件是否可以被拖动。
     */
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

    /**
     * @en The relations of the widget, which define how it relates to other widgets or scenes.
     * @zh 小部件的关系，定义它与其他小部件或场景的关系。
     */
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

    /**
     * @en Adds a relation to the widget.
     * @param target The target widget or scene to relate to. 
     * @param type The type of relation to add, such as size, position, etc. 
     * @param percent Optional. If true, the relation is treated as a percentage of the target's size. 
     * @returns Returns the current GWidget instance for method chaining.
     * @zh 向小部件添加关联。
     * @param target 要关联的目标小部件或场景。 
     * @param type 要添加的关系类型，例如大小、位置等。
     * @param percent 可选。如果为 true，则将关系视为目标大小的百分比。
     * @returns 返回当前的 GWidget 实例，以便进行方法链调用。
     */
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

    /**
     * @en Removes a relation from the widget.
     * @param target The target widget or scene to remove the relation from.
     * @param type The type of relation to remove, such as size, position, etc.
     * @returns Returns the current GWidget instance for method chaining.
     * @zh 从小部件中移除关联。
     * @param target 要从中移除关联的目标小部件或场景。
     * @param type 要移除的关系类型，例如大小、位置等。
     * @returns 返回当前的 GWidget 实例，以便进行方法链调用。
     */
    removeRelation(target: GWidget | Scene, type: RelationType): this {
        let item = this._relations.find(i => i.target == target);
        if (item)
            item.remove(type);
        return this;
    }

    /**
     * @en Clears all relations of the widget.
     * @returns Returns the current GWidget instance for method chaining.
     * @zh 清除小部件的所有关联。
     * @returns 返回当前的 GWidget 实例，以便进行方法链调用。
     */
    clearRelations(): this {
        this._relations.length = 0;
        return this;
    }

    /**
     * @en The controllers of the widget.
     * @zh 小部件的控制器。
     */
    get controllers(): Readonly<Record<string, Controller>> {
        return this._controllers;
    }

    /**
     * @en The number of controllers associated with the widget.
     * @zh 与小部件关联的控制器数量。
     */
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

    /**
     * @en Adds a new controller to the widget.
     * @param name The name of the controller to add. 
     * @param pageCount Optional. The number of pages in the controller. If not provided, it defaults to 0. 
     * @returns Returns the newly created Controller instance.
     * @zh 向小部件添加一个新的控制器。
     * @param name 要添加的控制器的名称。
     * @param pageCount 可选。控制器中的页面数量。如果未提供，则默认为为 0。
     * @returns 返回新创建的 Controller 实例。
     */
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

    /**
     * @en Gets a controller by its name.
     * @param name The name of the controller to retrieve. 
     * @returns The Controller instance associated with the specified name, or null if not found.
     * @zh 根据名称获取控制器。
     * @param name 要检索的控制器的名称。
     * @returns 与指定名称关联的 Controller 实例，如果未找到则返回 null。 
     */
    getController(name: string): Controller | null {
        return this._controllers[name];
    }

    /**
     * @en Sets the current page of a controller by its name.
     * @param controllerName The name of the controller whose page is to be set.
     * @param pageName The name of the page to set as the current page.
     * @zh 根据名称设置控制器的当前页面。
     * @param controllerName 要设置页面的控制器名称。
     * @param pageName 要设置为当前页面的页面名称。
     */
    setPage(controllerName: string, pageName: string): void;

    /**
     * @en Sets the current page of a controller by its index.
     * @param controllerName The name of the controller whose page is to be set. 
     * @param pageIndex The index of the page to set as the current page.
     * @zh 根据索引设置控制器的当前页面。
     * @param controllerName 要设置页面的控制器名称。
     * @param pageIndex 要设置为当前页面的页面索引。
     */
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

    /**
     * @en The gears of the widget.
     */
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

    /**
     * @en Adds a new gear to the widget.
     * @param value The gear to add to the widget.
     * @zh 向小部件添加一个新的齿轮。
     * @param value 要添加到小部件的齿轮。 
     */
    addGear(value: Gear) {
        this._gears.push(value);
        value.owner = this;
    }

    /**
     * @en Removes a gear from the widget.
     * @param value The gear to remove from the widget.
     * @zh 从小部件中移除一个齿轮。
     * @param value 要从小部件中移除的齿轮。 
     */
    removeGear(value: Gear) {
        let i = this._gears.indexOf(value);
        if (i != -1) {
            this._gears.splice(i, 1);
            value.owner = null;
        }
    }

    /** @ignore */
    destroy(): void {
        if (this._background) //去除lock标志，让它在destroy时被回收
            this._background.lock = false;

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

    /** @ignore */
    _processVisible(): boolean {
        if (super._processVisible()) {
            if (this.parent?._nodeType == 2)
                (<GWidget>this.parent).setLayoutChangedFlag?.(LayoutChangedReason.Visible);
            return true;
        }
        else
            return false;
    }

    /**
     * @en Sets the layout changed flag for the widget.
     * @param reason Optional. The reason for the layout change, such as size, position, etc.
     * @zh 设置小部件的布局更改标志。
     * @param reason 可选。布局更改的原因，例如大小、位置等。 
     */
    setLayoutChangedFlag(reason?: LayoutChangedReason): void {
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

    /** 
     * @en Called when the widget is constructed.
     * This method is invoked after the widget is created and its properties are initialized.
     * @zh 当小部件被构造时调用。
     * 此方法在小部件创建并初始化其属性后调用。
     * @blueprintIgnore 
     */
    onConstruct() {
    }

    /** @ignore @blueprintIgnore */
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