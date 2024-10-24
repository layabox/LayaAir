import { Box } from "./Box";
import { ScrollBar } from "./ScrollBar";
import { VScrollBar } from "./VScrollBar";
import { HScrollBar } from "./HScrollBar";
import { Clip } from "./Clip";
import { UIUtils } from "./UIUtils";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { Handler } from "../utils/Handler";
import { Tween } from "../utils/Tween";
import { HideFlags } from "../Const";
import { HierarchyParser } from "../loaders/HierarchyParser";
import { UIComponent } from "./UIComponent";
import { ScrollType } from "./Styles";
import { HierarchyLoader } from "../loaders/HierarchyLoader";


/**
 * @en The List control can display a list of items. The default is a vertical list. The list can be customized through the UI editor.
 * - Event.RENDER: When rendering the unit item object of a list, it is dispatched.
 * - change event: When the selectedIndex property of an object changes, it is dispatched.
 * @zh List 控件可显示项目列表。默认为垂直方向列表。可通过UI编辑器自定义列表。
 * - Event.RENDER事件: 渲染列表的单元项对象时调度。
 * - change事件: 当对象的 selectedIndex 属性发生变化时调度。
 */
export class List extends Box {

    /**
     * @en The processor executed when changing the selection of a List. (Default return parameters: Item index(index:int))
     * @zh 改变 List 的选择项时执行的处理器。(默认返回参数： 项索引（index:int）)。
     */
    selectHandler: Handler | null;
    /**
     * @en Cell rendering processor(Default return parameters  cell:UIComponent,index:int)
     * @zh 单元格渲染处理器(默认返回参数cell:UIComponent,index:int)。
     */
    renderHandler: Handler | null;
    /**
     * @en Cell Mouse Event Processor(Default return parameters  e:Event,index:int)
     * @zh 单元格鼠标事件处理器(默认返回参数e:Event,index:int)。
     */
    mouseHandler: Handler | null;
    /**
     * @en Specify whether it is selectable. If the value is true, you can choose; Otherwise, you cannot choose.
     * @zh 指定是否可以选择。若值为 true，则可以选择；否则不可以选择。
     * @default false
     */
    selectEnable: boolean = false;
    /**
     * @en The maximum number of pages for pagination.
     * @zh 最大分页数。
     */
    totalPage: number = 0;
    /**
     * @en Disable scrollbar stop.
     * @zh 禁用滚动条停止。
     */
    disableStopScroll: boolean = false;

    protected _content!: Box;
    protected _scrollBar: ScrollBar | null;
    protected _itemRender: any;
    protected _repeatX: number = 0;
    protected _repeatY: number = 0;
    protected _repeatX2: number = 0;
    protected _repeatY2: number = 0;
    protected _spaceX: number = 0;
    protected _spaceY: number = 0;
    protected _cells: UIComponent[] = [];
    protected _array: any[] | null;
    protected _startIndex: number = 0;
    protected _selectedIndex: number = -1;
    protected _page: number = 0;
    protected _isVertical: boolean = true;
    protected _cellSize: number = 20;
    protected _cellOffset: number = 0;
    protected _isMoved: boolean;
    protected _createdLine: number = 0;
    protected _cellChanged: boolean;
    protected _offset: Point = new Point();
    protected _usedCache: string | null = null;
    protected _elasticEnabled: boolean = false;
    protected _scrollType: ScrollType = 0;
    protected _vScrollBarSkin: string;
    protected _hScrollBarSkin: string;
    private _preLen = 0;

    /**
     * @en Determines whether the content is cached for performance optimization.
     * Setting this property to true can greatly improve performance if the data source is small and there are no animations within the list.
     * @zh 是否缓存内容。如果数据源较少，并且列表内无动画，设置此属性为 true 能大大提高性能。
     */
    cacheContent: boolean;

    /**
     * @en The current page number of the list.
     * @zh 列表的当前页码。
     */
    get page(): number {
        return this._page;
    }

    set page(value: number) {
        this._page = value
        if (this._array) {
            this._page = value > 0 ? value : 0;
            this._page = this._page < this.totalPage ? this._page : this.totalPage - 1;
            this.startIndex = this._page * this.repeatX * this.repeatY;
        }
    }

    /**
     * @en The total number of items in the list.
     * @zh 列表的数据总个数。
     */
    get length(): number {
        return this._array ? this._array.length : 0;
    }

    /**
     * @en The collection of cells in the list.
     * @zh 单元格集合。
     */
    get cells(): UIComponent[] {
        this.runCallLater(this.changeCells);
        return this._cells;
    }

    /**
     * @en If the elastic effect is enabled.
     * @zh 是否开启橡皮筋效果。
     */
    get elasticEnabled(): boolean {
        return this._elasticEnabled;
    }

    set elasticEnabled(value: boolean) {
        this._elasticEnabled = value;
        if (this._scrollBar) {
            this._scrollBar.elasticDistance = value ? 200 : 0;
        }
    }

    /**
     * @en The caching mode for the list.
     * @zh 列表的缓存模式。
     */
    set cacheAs(value: string) {
        super.cacheAs = value;
        if (this._scrollBar) {
            this._usedCache = null;
            if (value !== "none") this._scrollBar.on(Event.START, this, this.onScrollStart);
            else this._scrollBar.off(Event.START, this, this.onScrollStart);
        }
    }

    /**
     * @en The caching mode of the list.
     * @zh 列表的缓存模式。
     */
    get cacheAs() {
        return super.cacheAs;
    }

    /**
     * @en Reference to the content container Box component of the List component.
     * @zh List 组件所包含的内容容器 Box 组件的引用。
     */
    get content() {
        return this._content;
    }

    /**
     * @en Scrollbar type. Options include:
      - ScrollType.None (0): No scrollbar
      - ScrollType.Horizontal (1): Horizontal scrollbar.
      - Others: such as ScrollType.Vertical (2) indicates a vertical scrollbar
     * @zh 滚动条类型。可选值包括：
     * - ScrollType.None（0）：无滚动条
     * - ScrollType.Horizontal（1）：水平方向滚动条。
     * - 其它：如 ScrollType.Vertical（2） 表示垂直方向滚动条
     */
    get scrollType() {
        return this._scrollType;
    }

    set scrollType(value: ScrollType) {
        this._scrollType = value;

        if (this._scrollType == ScrollType.None) {
            if (this._scrollBar) {
                this._scrollBar.destroy();
                this._scrollBar = null;
                this._content.scrollRect = null;
            }
        }
        else if (this._scrollType == ScrollType.Horizontal) {
            if (this._scrollBar && !this._scrollBar.isVertical) {
                this._scrollBar.skin = this._hScrollBarSkin;
                return;
            }

            if (this._scrollBar) {
                this._scrollBar.destroy();
                this._scrollBar = null;
            }

            let scrollBar = new HScrollBar();
            scrollBar.name = "scrollBar";
            scrollBar.bottom = 0;
            scrollBar._skinBaseUrl = this._skinBaseUrl;
            scrollBar.skin = this._hScrollBarSkin;
            scrollBar.elasticDistance = this._elasticEnabled ? 200 : 0;
            scrollBar.hideFlags = HideFlags.HideAndDontSave;
            this.scrollBar = scrollBar;
            this._setCellChanged();
        }
        else {
            if (this._scrollBar && this._scrollBar.isVertical) {
                this._scrollBar.skin = this._vScrollBarSkin;
                return;
            }

            if (this._scrollBar) {
                this._scrollBar.destroy();
                this._scrollBar = null;
            }

            let scrollBar = new VScrollBar();
            scrollBar.name = "scrollBar";
            scrollBar.right = 0;
            scrollBar._skinBaseUrl = this._skinBaseUrl;
            scrollBar.skin = this._vScrollBarSkin;
            scrollBar.elasticDistance = this._elasticEnabled ? 200 : 0;
            scrollBar.hideFlags = HideFlags.HideAndDontSave;
            this.scrollBar = scrollBar;
            this._setCellChanged();
        }
    }

    /**
     * @en The skin of the vertical scroll bar.
     * @zh 垂直方向滚动条皮肤。
     */
    get vScrollBarSkin(): string {
        return this._vScrollBarSkin;
    }

    set vScrollBarSkin(value: string) {
        if (value == "") value = null;
        if (this._vScrollBarSkin != value) {
            this._vScrollBarSkin = value;
            if (this._scrollType == 0)
                this.scrollType = ScrollType.Vertical;
            else
                this.scrollType = this._scrollType;
        }

    }

    /**
     * @en The skin of the horizontal scroll bar.
     * @zh 水平方向滚动条皮肤。
     */
    get hScrollBarSkin(): string {
        return this._hScrollBarSkin;
    }

    set hScrollBarSkin(value: string) {
        if (value == "") value = null;
        if (this._hScrollBarSkin != value) {
            this._hScrollBarSkin = value;
            if (this._scrollType == 0)
                this.scrollType = ScrollType.Horizontal;
            else
                this.scrollType = this._scrollType;
        }
    }

    /**
     * @en The reference to the ScrollBar component contained within the List component.
     * @zh List 组件所包含的 ScrollBar 组件的引用。
     */
    get scrollBar(): ScrollBar | null {
        return this._scrollBar;
    }

    set scrollBar(value: ScrollBar | null) {
        if (this._scrollBar != value) {
            this._scrollBar = value;
            if (value) {
                this._isVertical = this._scrollBar.isVertical;
                this._scrollBar.target = this._content;
                this._scrollBar.on(Event.CHANGE, this, this.onScrollBarChange);
                this.addChild(this._scrollBar);
                this._content.scrollRect = Rectangle.create();
            }
        }
    }

    /**
     * @en The cell renderer for the List component.
     * value:  The value can be a cell class object or a UI JSON description.
     * @zh 单元格渲染器。
     * 取值：单元格类对象 或 UI的JSON描述。
     */
    get itemRender(): any {
        return this._itemRender;
    }

    set itemRender(value: any) {
        if (this._itemRender != value) {
            this._itemRender = value;
            //销毁老单元格
            for (let i = this._cells!.length - 1; i > -1; i--) {
                this._cells![i].destroy();
            }
            this._cells!.length = 0;
            this._setCellChanged();
        }
    }

    /**
     * @en The number of cells displayed horizontally.
     * @zh 水平方向显示的单元格数量。
     */
    get repeatX(): number {
        return this._repeatX > 0 ? this._repeatX : this._repeatX2 > 0 ? this._repeatX2 : 1;
    }

    set repeatX(value: number) {
        this._repeatX = value;
        this._setCellChanged();
    }

    /**
     * @en The number of cells displayed vertically.
     * @zh 垂直方向显示的单元格数量。
     */
    get repeatY(): number {
        return this._repeatY > 0 ? this._repeatY : this._repeatY2 > 0 ? this._repeatY2 : 1;
    }

    set repeatY(value: number) {
        this._repeatY = value;
        this._setCellChanged();
    }

    /**
     * @en The horizontal spacing between cells in pixels.
     * @zh 水平方向显示的单元格之间的间距（以像素为单位）。
     */
    get spaceX(): number {
        return this._spaceX;
    }

    set spaceX(value: number) {
        this._spaceX = value;
        this._setCellChanged();
    }

    /**
     * @en The vertical spacing between cells in pixels.
     * @zh 垂直方向显示的单元格之间的间距（以像素为单位）。
     */
    get spaceY(): number {
        return this._spaceY;
    }

    set spaceY(value: number) {
        this._spaceY = value;
        this._setCellChanged();
    }

    /**
     * @en Represents the index of the currently selected item. Changing the selectedIndex value will cause the list to re-render.
     * @zh 表示当前选择的项索引。selectedIndex值更改会引起列表重新渲染。
     */
    get selectedIndex(): number {
        return this._selectedIndex;
    }

    set selectedIndex(value: number) {
        if (this._selectedIndex != value) {
            this._selectedIndex = value;
            this.changeSelectStatus();
            this.event(Event.CHANGE);
            this.selectHandler && this.selectHandler.runWith(value);
            //选择发生变化，自动渲染一次
            this.startIndex = this._startIndex;
        }
    }

    /**
     * @en List data source
     * @zh 列表数据源。
     */
    get array(): any[] {
        return this._array as any[];
    }

    set array(value: any[]) {
        this.runCallLater(this.changeCells);
        this._array = value || [];
        this._preLen = this._array.length;
        let length = this._array.length;
        this.totalPage = Math.ceil(length / (this.repeatX * this.repeatY));
        //重设selectedIndex
        this._selectedIndex = this._selectedIndex < length ? this._selectedIndex : length - 1;
        //重设startIndex
        this.startIndex = this._startIndex;
        //重设滚动条
        if (this._scrollBar) {
            //根据开关决定滚动条是否停止，默认在重设的时候会停止滚动
            (!this.disableStopScroll && this._scrollBar.stopScroll());
            let numX = this._isVertical ? this.repeatX : this.repeatY;
            let numY = this._isVertical ? this.repeatY : this.repeatX;
            let lineCount = Math.ceil(length / numX);
            let total = this._cellOffset > 0 ? this.totalPage + 1 : this.totalPage;
            if (total > 1 && lineCount >= numY) {
                this._scrollBar.scrollSize = this._cellSize;
                this._scrollBar.thumbPercent = numY / lineCount;
                this._scrollBar.setScroll(0, (lineCount - numY) * this._cellSize + this._cellOffset, this._scrollBar.value);
            } else {
                this._scrollBar.setScroll(0, 0, 0);
            }
        }
    }

    /**
     * @en The data source of the currently selected cell.
     * @zh 当前选中的单元格数据源。
     */
    get selectedItem(): any {
        if (!this._array) return null;
        return this._selectedIndex != -1 ? this._array[this._selectedIndex] : null;
    }

    set selectedItem(value: any) {
        this._array && (this.selectedIndex = this._array.indexOf(value));
    }

    /**
     * @en The currently selected cell object.
     * @zh 当前选择的单元格对象。
     */
    get selection(): UIComponent {
        return this.getCell(this._selectedIndex);
    }

    set selection(value: UIComponent) {
        this.selectedIndex = this._startIndex + this._cells.indexOf(value);
    }

    /**
     * @en The start index of the currently displayed list of cells.
     * @zh 当前显示的单元格列表的开始索引。
     */
    get startIndex(): number {
        return this._startIndex;
    }

    set startIndex(value: number) {
        this._startIndex = value > 0 ? value : 0;
        this.callLater(this.renderItems);
    }

    protected createChildren(): void {
        this._content = new Box();
        this._content.hideFlags = HideFlags.HideAndDontSave;
        this.addChild(this._content);
    }

    /**
     * @internal
    */
    _setWidth(value: number) {
        super._setWidth(value);
        this._setCellChanged();
    }

    /**
     * @internal
    */
    _setHeight(value: number) {
        super._setHeight(value);
        this._setCellChanged();
    }

    private _getOneCell(): UIComponent {
        if (this._cells.length === 0) {
            let item = this.createItem();
            this._offset.setTo(item._x, item._y);
            if (this.cacheContent) return item;
            this._cells.push(item);
        }
        return this._cells[0];
    }

    private _createItems(startY: number, numX: number, numY: number): void {
        let box = this._content;
        let cell = this._getOneCell();
        let cellWidth = cell.width + this._spaceX;
        let cellHeight = cell.height + this._spaceY;
        let arr: Array<UIComponent>;

        if (this.cacheContent) {
            let cacheBox = new Box();
            cacheBox.hideFlags = HideFlags.HideAndDontSave;
            cacheBox.cacheAs = "normal";
            cacheBox.pos((this._isVertical ? 0 : startY) * cellWidth, (this._isVertical ? startY : 0) * cellHeight);
            this._content.addChild(cacheBox);
            box = cacheBox;
        } else {
            arr = [];
            for (let i = this._cells.length - 1; i > -1; i--) {
                let item = this._cells[i];
                item.removeSelf();
                arr.push(item);
            }
            this._cells.length = 0;
        }

        for (let k = startY; k < numY; k++) {
            for (let l = 0; l < numX; l++) {
                if (arr && arr.length) {
                    cell = arr.pop();
                } else {
                    cell = this.createItem();
                    cell.hideFlags = HideFlags.HideAndDontSave;
                }
                cell.x = (this._isVertical ? l : k) * cellWidth - box._x;
                cell.y = (this._isVertical ? k : l) * cellHeight - box._y;
                cell.name = "item" + (k * numX + l);
                box.addChild(cell);
                this.addCell(cell);
            }
        }

        if (arr && arr.length > 0) {
            for (let e of arr)
                e.destroy();
        }
    }

    /**@internal */
    _afterInited(): void {
        this.initItems();
    }

    private _bindData(cell: any, data: any): void {
        let arr: any[] = cell._$bindData;
        for (let i = 0, n = arr.length; i < n; i++) {
            let ele: any = arr[i++];
            let prop: string = arr[i++];
            let value: string = arr[i];
            let fun = UIUtils.getBindFun(value);
            ele[prop] = fun.call(this, data);
        }
    }

    protected _sizeChanged(): void {
        super._sizeChanged();
        this.setContentSize(this.width, this.height);
        if (this._scrollBar) this.callLater(this.onScrollBarChange);
    }

    protected _setCellChanged(): void {
        if (!this._cellChanged) {
            this._cellChanged = true;
            this.callLater(this.changeCells);
        }
    }
    private onScrollStart(): void {
        this._usedCache || (this._usedCache = super.cacheAs);
        super.cacheAs = "none";
        this._scrollBar!.once(Event.END, this, this.onScrollEnd);
    }

    private onScrollEnd(): void {
        super.cacheAs = this._usedCache || 'none';
    }

    protected createItem(): UIComponent {
        let arr: any[] = [];
        let box: UIComponent;
        if (typeof (this._itemRender) == "function") {//TODO:
            box = new this._itemRender();
            box._skinBaseUrl = this._skinBaseUrl;
        } else {
            if (this._itemRender._$type || this._itemRender._$prefab)
                box = <UIComponent>HierarchyParser.parse(this._itemRender, { skinBaseUrl: this._skinBaseUrl })[0];
            else
                box = HierarchyLoader.legacySceneOrPrefab.createComp(this._itemRender, null, null, arr);
            if (!box) {
                console.warn("cannot create item");
                box = new Box();
            }
        }
        box.hideFlags = HideFlags.HideAndDontSave;

        if (arr.length == 0 && (<any>box)["_watchMap"]) {
            let watchMap = (<any>box)["_watchMap"];
            for (let name in watchMap) {
                let a: any[] = watchMap[name];
                for (let i = 0; i < a.length; i++) {
                    let watcher = a[i];
                    arr.push(watcher.comp, watcher.prop, watcher.value)
                }
            }
        }
        if (arr.length) (<any>box)["_$bindData"] = arr;

        return box;
    }

    /**
     * @internal
     * 更改单元格的信息。
     * 在此销毁、创建单元格，并设置单元格的位置等属性。相当于此列表内容发送改变时调用此函数。
     */
    protected changeCells(): void {
        this._cellChanged = false;
        if (this._itemRender) {
            //获取滚动条
            this.scrollBar = (<ScrollBar>this.getChildByName("scrollBar"));

            //自适应宽高
            let cell = this._getOneCell();

            let cellWidth = (cell.width + this._spaceX) || 1;
            let cellHeight = (cell.height + this._spaceY) || 1;
            if (this._width > 0) this._repeatX2 = this._isVertical ? Math.round(this._width / cellWidth) : Math.ceil(this._width / cellWidth);
            if (this._height > 0) this._repeatY2 = this._isVertical ? Math.ceil(this._height / cellHeight) : Math.round(this._height / cellHeight);

            let listWidth = this._isWidthSet ? this._width : (cellWidth * this.repeatX - this._spaceX);
            let listHeight = this._isHeightSet ? this._height : (cellHeight * this.repeatY - this._spaceY);
            this._cellSize = this._isVertical ? cellHeight : cellWidth;
            this._cellOffset = this._isVertical ? (cellHeight * Math.max(this._repeatY2, this._repeatY) - listHeight - this._spaceY) : (cellWidth * Math.max(this._repeatX2, this._repeatX) - listWidth - this._spaceX);

            if (this._scrollBar) {
                if (this._isVertical)
                    this._scrollBar.height = listHeight;
                else
                    this._scrollBar.width = listWidth;
            }
            this.setContentSize(listWidth, listHeight);

            //创建新单元格
            let numX = this._isVertical ? this.repeatX : this.repeatY;
            let numY = (this._isVertical ? this.repeatY : this.repeatX) + (this._scrollBar ? 1 : 0);
            this._createItems(0, numX, numY);
            this._createdLine = numY;

            if (this._array) {
                this.array = this._array;
                this.runCallLater(this.renderItems);
            }
            else
                this.changeSelectStatus();
        }
    }

    /**
     * @en Adds a cell to the list.
     * @param cell The cell object to be added.
     * @zh 添加单元格。
     * @param cell 需要添加的单元格对象。
     */
    protected addCell(cell: UIComponent): void {
        cell.on(Event.CLICK, this, this.onCellMouse);
        cell.on(Event.RIGHT_CLICK, this, this.onCellMouse);
        cell.on(Event.MOUSE_OVER, this, this.onCellMouse);
        cell.on(Event.MOUSE_OUT, this, this.onCellMouse);
        cell.on(Event.MOUSE_DOWN, this, this.onCellMouse);
        cell.on(Event.MOUSE_UP, this, this.onCellMouse);
        this._cells.push(cell);
    }

    /**
     * @en Handles mouse events for cells.
     * @param e The event object.
     * @zh 单元格的鼠标事件侦听处理函数。
     * @param e 事件对象。
     */
    protected onCellMouse(e: Event): void {
        if (e.type === Event.MOUSE_DOWN) this._isMoved = false;
        let cell = (<UIComponent>e.currentTarget);
        let index = this._startIndex + this._cells.indexOf(cell);
        if (index < 0) return;
        if (e.type === Event.CLICK || e.type === Event.RIGHT_CLICK) {
            if (this.selectEnable && !this._isMoved) this.selectedIndex = index;
            else this.changeCellState(cell, true, 0);
        } else if ((e.type === Event.MOUSE_OVER || e.type === Event.MOUSE_OUT) && this._selectedIndex !== index) {
            this.changeCellState(cell, e.type === Event.MOUSE_OVER, 0);
        }
        this.mouseHandler && this.mouseHandler.runWith([e, index]);
    }

    /**
     * @en Changes the visual state of a cell.
     * @param cell The cell object.
     * @param visible Indicates whether the cell should be visible.
     * @param index The cell's property index value.
     * @zh 改变单元格的可视状态。
     * @param cell 单元格对象
     * @param visible 是否显示。
     * @param index 单元格的属性 index 值。
     */
    protected changeCellState(cell: UIComponent, visible: boolean, index: number): void {
        let selectBox = (<Clip>cell.getChildByName("selectBox"));
        if (selectBox) {
            this.selectEnable = true;
            selectBox.visible = visible;
            selectBox.index = index;
        }
    }

    /**
     * @en Event handler for the scrollbar's Event.CHANGE event.
     * @zh 滚动条的 Event.CHANGE 事件侦听处理函数。
     */
    protected onScrollBarChange(e: Event | null = null): void {
        this.runCallLater(this.changeCells);
        let scrollValue = this._scrollBar!.value;
        let lineX = (this._isVertical ? this.repeatX : this.repeatY);
        let lineY = (this._isVertical ? this.repeatY : this.repeatX);
        let scrollLine = Math.floor(scrollValue / this._cellSize);

        if (!this.cacheContent) {
            let index = scrollLine * lineX;
            let num = 0;
            let down = true;
            let toIndex = 0;
            if (index > this._startIndex) {
                num = index - this._startIndex;
                //let down = true;
                toIndex = this._startIndex + lineX * (lineY + 1);
                this._isMoved = true;
            } else if (index < this._startIndex) {
                num = this._startIndex - index;
                down = false;
                toIndex = this._startIndex - 1;
                this._isMoved = true;
            }

            let cell: UIComponent;
            let cellIndex: number;
            for (let i = 0; i < num; i++) {
                if (down) {
                    cell = this._cells.shift();
                    this._cells[this._cells.length] = cell;
                    cellIndex = toIndex + i;
                } else {
                    cell = this._cells.pop();
                    this._cells.unshift(cell);
                    cellIndex = toIndex - i;
                }
                let pos = Math.floor(cellIndex / lineX) * this._cellSize;
                this._isVertical ? cell.y = pos : cell.x = pos;
                this.renderItem(cell, cellIndex);
            }
            this._startIndex = index;
            this.changeSelectStatus();
        } else {
            let num = (lineY + 1);
            if (this._createdLine - scrollLine < num) {
                this._createItems(this._createdLine, lineX, this._createdLine + num);
                this.renderItems(this._createdLine * lineX, 0);
                this._createdLine += num;
            }
        }

        let r = this._content._style.scrollRect;
        if (this._isVertical) {
            r.y = scrollValue - this._offset.y;
            r.x = -this._offset.x;
        } else {
            r.y = -this._offset.y;
            r.x = scrollValue - this._offset.x;
        }
        this._content.scrollRect = r;
    }

    private posCell(cell: UIComponent, cellIndex: number): void {
        if (!this._scrollBar) return;
        let lineX = (this._isVertical ? this.repeatX : this.repeatY);
        //let lineY = (this._isVertical ? this.repeatY : this.repeatX);
        let pos = Math.floor(cellIndex / lineX) * this._cellSize;
        this._isVertical ? cell._y = pos : cell.x = pos;
    }

    /**
     * @en Changes the selection state of the cells.
     * @zh 改变单元格的选择状态。
     */
    protected changeSelectStatus(): void {
        for (let i: number = 0, n: number = this._cells.length; i < n; i++) {
            this.changeCellState(this._cells[i], this._selectedIndex === this._startIndex + i, 1);
        }
    }

    /**
     * @en Renders the list of cells.
     * @param from The start index to begin rendering from.
     * @param to The end index to stop rendering. If not provided, it renders to the end of the list.
     * @zh 渲染单元格列表。
     * @param from 渲染开始的索引。
     * @param to 停止渲染的结束索引。如果没有提供，它将渲染到列表末尾。
     */
    protected renderItems(from: number = 0, to: number = 0): void {
        for (let i = from, n = to || this._cells.length; i < n; i++) {
            this.renderItem(this._cells[i], this._startIndex + i);
        }
        this.changeSelectStatus();
    }

    /**
     * @en Renders a single cell.
     * @param cell The cell object that needs to be rendered.
     * @param index The index of the cell.
     * @zh 渲染一个单元格。
     * @param cell 需要渲染的单元格对象。
     * @param index 单元格索引。
     */
    protected renderItem(cell: UIComponent, index: number): void {
        if (!this._array || index >= 0 && index < this._array.length) {
            cell.visible = true;

            if (this._array) {
                if ((cell as any)["_$bindData"]) {
                    cell["_dataSource"] = this._array[index];
                    this._bindData(cell, this._array[index]);
                } else
                    cell.dataSource = this._array[index];
            }

            if (!this.cacheContent) {
                //TODO:
                this.posCell(cell, index);
            }
            if (this.hasListener(Event.RENDER)) this.event(Event.RENDER, [cell, index]);
            if (this.renderHandler) this.renderHandler.runWith([cell, index]);
        } else {
            cell.visible = false;
            cell.dataSource = null;
        }
    }

    protected commitMeasure(): void {
        this.runCallLater(this.changeCells);
    }

    /**
     * @en Updates the data source without refreshing the entire list, only increasing the scroll length.
     * @param array The data source to update.
     * @zh 更新数据源，不刷新list，只增加滚动长度。
     * @param array 数据源。
     */
    updateArray(array: any[]): void {
        this._array = array;
        if (this._array) {
            let freshStart = this._preLen - this._startIndex;
            if (freshStart >= 0)
                this.renderItems(freshStart);
            this._preLen = this._array.length;
        }
        if (this._scrollBar) {
            let length = array.length;
            let numX = this._isVertical ? this.repeatX : this.repeatY;
            let numY = this._isVertical ? this.repeatY : this.repeatX;
            let lineCount = Math.ceil(length / numX);
            if (lineCount >= numY) {
                this._scrollBar.thumbPercent = numY / lineCount;
                this._scrollBar.slider["_max"] = (lineCount - numY) * this._cellSize + this._cellOffset;
            }

        }
    }

    /**
     * @en Called after deserialization to perform additional setup.
     * @zh 反序列化后调用以执行额外的设置。
     */
    onAfterDeserialize() {
        super.onAfterDeserialize();
        this.initItems();
    }

    /**
     * @en Initializes cell information.
     * @zh 初始化单元格信息。
     */
    initItems(): void {
        if (!this._itemRender && this.getChildByName("item0") != null) {
            this.repeatX = 1;
            let count: number;
            count = 0;
            for (let i = 0; i < 10000; i++) {
                let cell = <UIComponent>this.getChildByName("item" + i);
                if (cell) {
                    this.addCell(cell);
                    count++;
                    continue;
                }
                break;
            }
            this.repeatY = count;
        }
    }

    /**
     * @en Sets the size of the viewable area.
     * The viewable area is defined by a rectangle with the top-left corner at (0,0) and the specified width and height.
     * @param width The width of the viewable area.
     * @param height The height of the viewable area.
     * @zh 设置可视区域大小。
     * 以（0，0，width参数，height参数）组成的矩形区域为可视区域。
     * @param width 可视区域宽度。
     * @param height 可视区域高度。
     */
    setContentSize(width: number, height: number): void {
        this._content.width = width;
        this._content.height = height;
        if (this._scrollBar) {
            let r = this._content.scrollRect;
            if (!r)
                r = Rectangle.create();
            r.setTo(-this._offset.x, -this._offset.y, width, height);
            this._content.scrollRect = r;
        }
        this.event(Event.RESIZE);
    }

    /**
     * @en Sets the data source for the component, overriding the base class's method to handle different data types.
     * @param value The new data source.
     * @zh 设置数据源，覆盖基类方法以处理不同类型的数据。
     * @param value 新的数据源。
     */
    set_dataSource(value: any) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.selectedIndex = parseInt(value as string);
        else if (value instanceof Array)
            this.array = (<any[]>value)
        else
            super.set_dataSource(value);
    }

    /**
     * @en Refreshes the list data source.
     * @zh 刷新列表数据源。
     */
    refresh(): void {
        this.array = this._array as any[];
        //startIndex = _startIndex;
    }

    /**
     * @en Get the cell data source.
     * @param index The index of the cell.
     * @zh 获取单元格数据源。
     * @param index 单元格索引。
     */
    getItem(index: number): any {
        if (!this._array)
            return null;
        if (index > -1 && index < this._array.length) {
            return this._array[index];
        }
        return null;
    }

    /**
     * @en Changes the data source of a cell at a specified index.
     * @param index The index of the cell.
     * @param source The data source for the cell.
     * @zh 修改单元格数据源。
     * @param index 单元格索引。
     * @param source 单元格数据源。
     */
    changeItem(index: number, source: any): void {
        if (index > -1 && this._array && index < this._array.length) {
            this._array[index] = source;
            //如果是可视范围，则重新渲染
            if (index >= this._startIndex && index < this._startIndex + this._cells.length) {
                this.renderItem(this.getCell(index)!, index);
            }
        }
    }

    /**
     * @en Sets the data source for a cell at a specified index.
     * @param index The cell index.
     * @param source The data source for the cell.
     * @zh 设置单元格数据源。
     * @param index 单元格索引。
     * @param source 单元格数据源。
     */
    setItem(index: number, source: any): void {
        this.changeItem(index, source);
    }

    /**
     * @en Adds a new data source to the cell list.
     * @param source The data source to add.
     * @zh 添加单元格数据源。
     * @param source 数据源。
     */
    addItem(source: any): void {
        if (!this.array) {
            this.array = [source];
        } else {
            this._array!.push(source);
        }
        this.array = this._array as any[];
    }

    /**
     * @en Adds a new data source to the cell list at a specified index.
     * @param source The data source to add.
     * @param index The index at which to insert the data source.
     * @zh 添加单元格数据源到对应的数据索引处。
     * @param souce 单元格数据源。
     * @param index 索引。
     */
    addItemAt(souce: any, index: number): void {
        this._array!.splice(index, 0, souce);
        this.array = this._array!;
    }

    /**
     * @en Deletes a data source from the cell list by its index.
     * @param index The index of the data source to delete.
     * @zh 通过数据源索引删除单元格数据源。
     * @param index 需要删除的数据源索引值。
     */
    deleteItem(index: number): void {
        if (this._array) {
            this._array.splice(index, 1);
            this.array = this._array;
        }
    }

    /**
     * @en Gets the cell object by its visible index.
     * @param index The visible index of the cell.
     * @return The cell object.
     * @zh 通过可视单元格索引，获取单元格。
     * @param index 可视单元格索引。
     * @return 单元格对象。
     */
    getCell(index: number): UIComponent | null {
        this.runCallLater(this.changeCells);
        if (index > -1 && this._cells) {
            return this._cells[(index - this._startIndex) % this._cells.length];
        }
        return null;
    }

    /**
     * @en Scrolls the list so that the cell corresponding to the specified data index becomes the first visible item in the list.
     * @param index The index of the cell in the data list.
     * @zh 滚动列表，以设定的数据索引对应的单元格为当前可视列表的第一项。
     * @param index 单元格在数据列表中的索引。
     */
    scrollTo(index: number): void {
        if (this._scrollBar) {
            let numX = this._isVertical ? this.repeatX : this.repeatY;
            this._scrollBar.value = Math.floor(index / numX) * this._cellSize;
        } else {
            this.startIndex = index;
        }
    }

    /**
     * @en Scrolls the list with tweening to make the cell corresponding to the specified data index the first visible item in the list.
     * @param index The index of the cell in the data list.
     * @param time The duration of the tweening effect in milliseconds.
     * @param complete An optional callback function to call when the tweening completes.
     * @zh 缓动滚动列表，以设定的数据索引对应的单元格为当前可视列表的第一项。
     * @param index 单元格在数据列表中的索引。
     * @param time	缓动时间。
     * @param complete	缓动结束回调.
     */
    tweenTo(index: number, time: number = 200, complete: Handler | null = null): void {
        if (this._scrollBar) {
            this._scrollBar.stopScroll();
            let numX = this._isVertical ? this.repeatX : this.repeatY;
            Tween.to(this._scrollBar, { value: Math.floor(index / numX) * this._cellSize }, time, null, complete, 0, true);
        } else {
            this.startIndex = index;
            if (complete) complete.run();
        }
    }

    /**
     * @en Destroys the instance and its child elements.
     * @param destroyChild Specifies whether to destroy child elements.
     * @zh 销毁实例及其子元素。
     * @param destroyChild 指定是否销毁子元素。
     */
    destroy(destroyChild: boolean = true): void {
        this._content && this._content.destroy(destroyChild);
        this._scrollBar && this._scrollBar.destroy(destroyChild);
        super.destroy(destroyChild);
        this._content = null;
        this._scrollBar = null;
        this._itemRender = null;
        this._cells = null;
        this._array = null;
        this.selectHandler = this.renderHandler = this.mouseHandler = null;
    }


}