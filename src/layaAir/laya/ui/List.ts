import { Box } from "./Box";
import { IRender } from "./IRender";
import { IItem } from "./IItem";
import { ScrollBar } from "./ScrollBar";
import { VScrollBar } from "./VScrollBar";
import { HScrollBar } from "./HScrollBar";
import { Clip } from "./Clip";
import { UIUtils } from "./UIUtils";
import { Node } from "../display/Node"
import { Event } from "../events/Event"
import { Point } from "../maths/Point"
import { Rectangle } from "../maths/Rectangle"
import { Handler } from "../utils/Handler"
import { SceneUtils } from "../utils/SceneUtils"
import { Tween } from "../utils/Tween"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

/**
 * 当对象的 <code>selectedIndex</code> 属性发生变化时调度。
 * @eventType laya.events.Event
 */
/*[Event(name = "change", type = "laya.events.Event")]*/

/**
 * 渲染列表的单元项对象时调度。
 * @eventType Event.RENDER
 */
/*[Event(name = "render", type = "laya.events.Event")]*/

/**
 * <code>List</code> 控件可显示项目列表。默认为垂直方向列表。可通过UI编辑器自定义列表。
 *
 * @example <caption>以下示例代码，创建了一个 <code>List</code> 实例。</caption>
 * package
 *	{
 *		import laya.ui.List;
 *		import laya.utils.Handler;
 *		public class List_Example
 *		{
 *			public function List_Example()
 *			{
 *				Laya.init(640, 800, "false");//设置游戏画布宽高、渲染模式。
 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *				Laya.loader.load(["resource/ui/vscroll.png", "resource/ui/vscroll$bar.png", "resource/ui/vscroll$down.png", "resource/ui/vscroll$up.png"], Handler.create(this, onLoadComplete));
 *			}
 *			private function onLoadComplete():void
 *			{
 *				var arr:Array = [];//创建一个数组，用于存贮列表的数据信息。
 *				for (var i:int = 0; i &lt; 20; i++)
 *				{
 *					arr.push({label: "item" + i});
 *				}
 *				var list:List = new List();//创建一个 List 类的实例对象 list 。
 *				list.itemRender = Item;//设置 list 的单元格渲染器。
 *				list.repeatX = 1;//设置 list 的水平方向单元格数量。
 *				list.repeatY = 10;//设置 list 的垂直方向单元格数量。
 *				list.vScrollBarSkin = "resource/ui/vscroll.png";//设置 list 的垂直方向滚动条皮肤。
 *				list.array = arr;//设置 list 的列表数据源。
 *				list.pos(100, 100);//设置 list 的位置。
 *				list.selectEnable = true;//设置 list 可选。
 *				list.selectHandler = new Handler(this, onSelect);//设置 list 改变选择项执行的处理器。
 *				Laya.stage.addChild(list);//将 list 添加到显示列表。
 *			}
 *			private function onSelect(index:int):void
 *			{
 *				trace("当前选择的项目索引： index= ", index);
 *			}
 *		}
 *	}
 *	import laya.ui.Box;
 *	import laya.ui.Label;
 *	class Item extends Box
 *	{
 *		public function Item()
 *		{
 *			graphics.drawRect(0, 0, 100, 20,null, "#ff0000");
 *			var label:Label = new Label();
 *			label.text = "100000";
 *			label.name = "label";//设置 label 的name属性值。
 *			label.size(100, 20);
 *			addChild(label);
 *		}
 *	}
 * @example
 * (function (_super){
 *     function Item(){
 *         Item.__super.call(this);//初始化父类
 *         this.graphics.drawRect(0, 0, 100, 20, "#ff0000");
 *         var label = new laya.ui.Label();//创建一个 Label 类的实例对象 label 。
 *         label.text = "100000";//设置 label 的文本内容。
 *         label.name = "label";//设置 label 的name属性值。
 *         label.size(100, 20);//设置 label 的宽度、高度。
 *         this.addChild(label);//将 label 添加到显示列表。
 *     };
 *     Laya.class(Item,"mypackage.listExample.Item",_super);//注册类 Item 。
 * })(laya.ui.Box);
	
 * Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 * var res = ["resource/ui/vscroll.png", "resource/ui/vscroll$bar.png", "resource/ui/vscroll$down.png", "resource/ui/vscroll$up.png"];
 * Laya.loader.load(res, new laya.utils.Handler(this, onLoadComplete));//加载资源。
	
 * function onLoadComplete() {
 *     var arr = [];//创建一个数组，用于存贮列表的数据信息。
 *     for (var i = 0; i &lt; 20; i++) {
 *         arr.push({label: "item" + i});
 *     }
	
 *     var list = new laya.ui.List();//创建一个 List 类的实例对象 list 。
 *     list.itemRender = mypackage.listExample.Item;//设置 list 的单元格渲染器。
 *     list.repeatX = 1;//设置 list 的水平方向单元格数量。
 *     list.repeatY = 10;//设置 list 的垂直方向单元格数量。
 *     list.vScrollBarSkin = "resource/ui/vscroll.png";//设置 list 的垂直方向滚动条皮肤。
 *     list.array = arr;//设置 list 的列表数据源。
 *     list.pos(100, 100);//设置 list 的位置。
 *     list.selectEnable = true;//设置 list 可选。
 *     list.selectHandler = new laya.utils.Handler(this, onSelect);//设置 list 改变选择项执行的处理器。
 *     Laya.stage.addChild(list);//将 list 添加到显示列表。
 * }
	
 * function onSelect(index)
 * {
 *     console.log("当前选择的项目索引： index= ", index);
 * }
 *
 * @example
 * import List = laya.ui.List;
 * import Handler = laya.utils.Handler;
 * public class List_Example {
 *     public List_Example() {
 *         Laya.init(640, 800);//设置游戏画布宽高。
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         Laya.loader.load(["resource/ui/vscroll.png", "resource/ui/vscroll$bar.png", "resource/ui/vscroll$down.png", "resource/ui/vscroll$up.png"], Handler.create(this, this.onLoadComplete));
 *     }
 *     private onLoadComplete(): void {
 *         var arr= [];//创建一个数组，用于存贮列表的数据信息。
 *         for (var i: number = 0; i &lt; 20; i++)
 *         {
 *             arr.push({ label: "item" + i });
 *         }
 *         var list: List = new List();//创建一个 List 类的实例对象 list 。
 *         list.itemRender = Item;//设置 list 的单元格渲染器。
 *         list.repeatX = 1;//设置 list 的水平方向单元格数量。
 *         list.repeatY = 10;//设置 list 的垂直方向单元格数量。
 *         list.vScrollBarSkin = "resource/ui/vscroll.png";//设置 list 的垂直方向滚动条皮肤。
 *         list.array = arr;//设置 list 的列表数据源。
 *         list.pos(100, 100);//设置 list 的位置。
 *         list.selectEnable = true;//设置 list 可选。
 *         list.selectHandler = new Handler(this, this.onSelect);//设置 list 改变选择项执行的处理器。
 *         Laya.stage.addChild(list);//将 list 添加到显示列表。
 *     }
 *     private onSelect(index: number): void {
 *         console.log("当前选择的项目索引： index= ", index);
 *     }
 * }
 * import Box = laya.ui.Box;
 * import Label = laya.ui.Label;
 * class Item extends Box {
 *     constructor() {
 *         this.graphics.drawRect(0, 0, 100, 20, null, "#ff0000");
 *         var label: Label = new Label();
 *         label.text = "100000";
 *         label.name = "label";//设置 label 的name属性值。
 *         label.size(100, 20);
 *         this.addChild(label);
 *     }
 * }
 */
export class List extends Box implements IRender, IItem {

	/**改变 <code>List</code> 的选择项时执行的处理器，(默认返回参数： 项索引（index:int）)。*/
	selectHandler: Handler|null;
	/**单元格渲染处理器(默认返回参数cell:Box,index:int)。*/
	renderHandler: Handler|null;
	/**单元格鼠标事件处理器(默认返回参数e:Event,index:int)。*/
	mouseHandler: Handler|null;
	/**指定是否可以选择，若值为true则可以选择，否则不可以选择。 @default false*/
	selectEnable: boolean = false;
	/**最大分页数。*/
	totalPage: number = 0;
	/**@internal */
	_$componentType: string = "List";

	/**@private */
	protected _content!: Box;
	/**@private */
	protected _scrollBar: ScrollBar|null;
	/**@private */
	protected _itemRender: any;
	/**@private */
	protected _repeatX: number = 0;
	/**@private */
	protected _repeatY: number = 0;
	/**@private */
	protected _repeatX2: number = 0;
	/**@private */
	protected _repeatY2: number = 0;
	/**@private */
	protected _spaceX: number = 0;
	/**@private */
	protected _spaceY: number = 0;
	/**@private */
	protected _cells: Box[] = [];
	/**@private */
	protected _array: any[]|null;
	/**@private */
	protected _startIndex: number = 0;
	/**@private */
	protected _selectedIndex: number = -1;
	/**@private */
	protected _page: number = 0;
	/**@private */
	protected _isVertical: boolean = true;
	/**@private */
	protected _cellSize: number = 20;
	/**@private */
	protected _cellOffset: number = 0;
	/**@private */
	protected _isMoved: boolean;
	/**是否缓存内容，如果数据源较少，并且list内无动画，设置此属性为true能大大提高性能 */
	cacheContent: boolean;
	/**@private */
	protected _createdLine: number = 0;
	/**@private */
	protected _cellChanged: boolean;
	/**@private */
	protected _offset: Point = new Point();
	/**@private */
	protected _usedCache: string|null = null;
	/**@private */
	protected _elasticEnabled: boolean = false;

	/**
	 * @inheritDoc 
	 * @override
	 */
	destroy(destroyChild: boolean = true): void {
		this._content && this._content.destroy(destroyChild);
		this._scrollBar && this._scrollBar.destroy(destroyChild);
		super.destroy(destroyChild);
		//@ts-ignore
		this._content = null;
		this._scrollBar = null;
		this._itemRender = null;
		//@ts-ignore
		this._cells = null;
		this._array = null;
		this.selectHandler = this.renderHandler = this.mouseHandler = null;
	}

	/**
	 * @inheritDoc 
	 * @override
	 */
	protected createChildren(): void {
		this.addChild(this._content = new Box());
	}

	/**
	 * @inheritDoc 
	 * @override
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
	 * @inheritDoc 
	 * @override
	 */
	get cacheAs() {
		return super.cacheAs;
	}

	private onScrollStart(): void {
		this._usedCache || (this._usedCache = super.cacheAs);
		super.cacheAs = "none";
		this._scrollBar!.once(Event.END, this, this.onScrollEnd);
	}

	private onScrollEnd(): void {
		super.cacheAs = this._usedCache||'none';
	}

	/**
	 * 获取对 <code>List</code> 组件所包含的内容容器 <code>Box</code> 组件的引用。
	 */
	get content() {
		return this._content;
	}

	/**
	 * 垂直方向滚动条皮肤。
	 */
	get vScrollBarSkin(): string {
		/**@ts-ignore */
		return this._scrollBar ? this._scrollBar.skin : null;
	}

	set vScrollBarSkin(value: string) {
		this._removePreScrollBar();
		var scrollBar = new VScrollBar();
		scrollBar.name = "scrollBar";
		scrollBar.right = 0;
		scrollBar.skin = value;
		scrollBar.elasticDistance = this._elasticEnabled ? 200 : 0;
		this.scrollBar = scrollBar;
		this.addChild(scrollBar);
		this._setCellChanged();
	}

	private _removePreScrollBar(): void {
		var preNode = this.removeChildByName("scrollBar");
		if (preNode) preNode.destroy(true);
	}

	/**
	 * 水平方向滚动条皮肤。
	 */
	get hScrollBarSkin(): string {
		//@ts-ignore
		return this._scrollBar ? this._scrollBar.skin : null;
	}

	set hScrollBarSkin(value: string) {
		this._removePreScrollBar();
		var scrollBar = new HScrollBar();
		scrollBar.name = "scrollBar";
		scrollBar.bottom = 0;
		scrollBar.skin = value;
		scrollBar.elasticDistance = this._elasticEnabled ? 200 : 0;
		this.scrollBar = scrollBar;
		this.addChild(scrollBar);
		this._setCellChanged();
	}

	/**
	 * 获取对 <code>List</code> 组件所包含的滚动条 <code>ScrollBar</code> 组件的引用。
	 */
	get scrollBar(): ScrollBar|null {
		return this._scrollBar;
	}

	set scrollBar(value: ScrollBar|null) {
		if (this._scrollBar != value) {
			this._scrollBar = value;
			if (value) {
				this._isVertical = this._scrollBar!.isVertical;
				this.addChild(this._scrollBar!);
				this._scrollBar!.on(Event.CHANGE, this, this.onScrollBarChange);
			}
		}
	}

	/**
	 * 单元格渲染器。
	 * <p><b>取值：</b>
	 * <ol>
	 * <li>单元格类对象。</li>
	 * <li> UI 的 JSON 描述。</li>
	 * </ol></p>
	 * @implements
	 */
	get itemRender(): any {
		return this._itemRender;
	}

	set itemRender(value: any) {
		if (this._itemRender != value) {
			this._itemRender = value;
			//销毁老单元格
			for (var i = this._cells!.length - 1; i > -1; i--) {
				this._cells![i].destroy();
			}
			this._cells!.length = 0;
			this._setCellChanged();
		}
	}

	/**
	 * @inheritDoc 
	 * @override
	*/
	set width(value: number) {
		if (value != this._width) {
			super.width = value;
			this._setCellChanged();
		}
	}
	/**
	 * @inheritDoc 
	 * @override
	 */
	get width() {
		return super.width;
	}

	/**
	 * @inheritDoc 
	 * @override
	*/
	set height(value: number) {
		if (value != this._height) {
			super.height = value;
			this._setCellChanged();
		}
	}
	/**
	 * @inheritDoc 
	 * @override
	 */
	get height() {
		return super.height;
	}

	/**
	 * 水平方向显示的单元格数量。
	 */
	get repeatX(): number {
		return this._repeatX > 0 ? this._repeatX : this._repeatX2 > 0 ? this._repeatX2 : 1;
	}

	set repeatX(value: number) {
		this._repeatX = value;
		this._setCellChanged();
	}

	/**
	 * 垂直方向显示的单元格数量。
	 */
	get repeatY(): number {
		return this._repeatY > 0 ? this._repeatY : this._repeatY2 > 0 ? this._repeatY2 : 1;
	}

	set repeatY(value: number) {
		this._repeatY = value;
		this._setCellChanged();
	}

	/**
	 * 水平方向显示的单元格之间的间距（以像素为单位）。
	 */
	get spaceX(): number {
		return this._spaceX;
	}

	set spaceX(value: number) {
		this._spaceX = value;
		this._setCellChanged();
	}

	/**
	 * 垂直方向显示的单元格之间的间距（以像素为单位）。
	 */
	get spaceY(): number {
		return this._spaceY;
	}

	set spaceY(value: number) {
		this._spaceY = value;
		this._setCellChanged();
	}

	/**
	 * @private
	 * 更改单元格的信息。
	 * 在此销毁、创建单元格，并设置单元格的位置等属性。相当于此列表内容发送改变时调用此函数。
	 */
	protected changeCells(): void {
		this._cellChanged = false;
		if (this._itemRender) {
			//获取滚动条
			this.scrollBar = (<ScrollBar>this.getChildByName("scrollBar"));

			//自适应宽高				
			var cell = this._getOneCell();

			var cellWidth = (cell.width + this._spaceX) || 1;
			var cellHeight = (cell.height + this._spaceY) || 1;
			if (this._width > 0) this._repeatX2 = this._isVertical ? Math.round(this._width / cellWidth) : Math.ceil(this._width / cellWidth);
			if (this._height > 0) this._repeatY2 = this._isVertical ? Math.ceil(this._height / cellHeight) : Math.round(this._height / cellHeight);

			var listWidth = this._width ? this._width : (cellWidth * this.repeatX - this._spaceX);
			var listHeight = this._height ? this._height : (cellHeight * this.repeatY - this._spaceY);
			this._cellSize = this._isVertical ? cellHeight : cellWidth;
			this._cellOffset = this._isVertical ? (cellHeight * Math.max(this._repeatY2, this._repeatY) - listHeight - this._spaceY) : (cellWidth * Math.max(this._repeatX2, this._repeatX) - listWidth - this._spaceX);

			if (this._isVertical && this.vScrollBarSkin) this._scrollBar!.height = listHeight;
			else if (!this._isVertical && this.hScrollBarSkin) this._scrollBar!.width = listWidth;
			this.setContentSize(listWidth, listHeight);

			//创建新单元格				
			var numX = this._isVertical ? this.repeatX : this.repeatY;
			var numY = (this._isVertical ? this.repeatY : this.repeatX) + (this._scrollBar ? 1 : 0);
			this._createItems(0, numX, numY);
			this._createdLine = numY;

			if (this._array) {
				this.array = this._array;
				this.runCallLater(this.renderItems);
			}
		}
	}

	private _getOneCell(): Box {
		if (this._cells.length === 0) {
			var item = this.createItem();
			this._offset.setTo(item._x, item._y);
			if (this.cacheContent) return item;
			this._cells.push(item);
		}
		return this._cells[0];
	}

	private _createItems(startY: number, numX: number, numY: number): void {
		var box = this._content;
		var cell = this._getOneCell();
		var cellWidth = cell.width + this._spaceX;
		var cellHeight = cell.height + this._spaceY;

		if (this.cacheContent) {
			var cacheBox = new Box();
			cacheBox.cacheAs = "normal";
			cacheBox.pos((this._isVertical ? 0 : startY) * cellWidth, (this._isVertical ? startY : 0) * cellHeight);
			this._content.addChild(cacheBox);
			box = cacheBox;
		} else {
			var arr = [];
			for (var i = this._cells.length - 1; i > -1; i--) {
				var item = this._cells[i];
				item.removeSelf();
				arr.push(item);
			}
			this._cells.length = 0;
		}

		for (var k = startY; k < numY; k++) {
			for (var l = 0; l < numX; l++) {
				if (arr && arr.length) {
					cell = arr.pop() as Box;
				} else {
					cell = this.createItem();
				}
				cell.x = (this._isVertical ? l : k) * cellWidth - box._x;
				cell.y = (this._isVertical ? k : l) * cellHeight - box._y;
				cell.name = "item" + (k * numX + l);
				box.addChild(cell);
				this.addCell(cell);
			}
		}
	}

	protected createItem(): Box {
		var arr: any[] = [];
		if (typeof (this._itemRender) == "function") {//TODO:
			var box = new this._itemRender();
		} else {
			//box = View.createComp(_itemRender, null, null, arr)
			box = SceneUtils.createComp(this._itemRender, null, null, arr)
		}
		if (arr.length == 0 && (box as any)["_watchMap"]) {
			var watchMap = (box as any)["_watchMap"];
			for (var name in watchMap) {
				var a: any[] = watchMap[name];
				for (var i = 0; i < a.length; i++) {
					var watcher = a[i];
					arr.push(watcher.comp, watcher.prop, watcher.value)
				}
			}
		}
		if (arr.length) (box as any)["_$bindData"] = arr;
		return box;
	}

	/**
	 * @private
	 * 添加单元格。
	 * @param cell 需要添加的单元格对象。
	 */
	protected addCell(cell: Box): void {
		cell.on(Event.CLICK, this, this.onCellMouse);
		cell.on(Event.RIGHT_CLICK, this, this.onCellMouse);
		cell.on(Event.MOUSE_OVER, this, this.onCellMouse);
		cell.on(Event.MOUSE_OUT, this, this.onCellMouse);
		cell.on(Event.MOUSE_DOWN, this, this.onCellMouse);
		cell.on(Event.MOUSE_UP, this, this.onCellMouse);
		this._cells.push(cell);
	}
	/**@internal */
	_afterInited(): void {
		this.initItems();
	}

	/**
	 * 初始化单元格信息。
	 */
	initItems(): void {
		if (!this._itemRender && this.getChildByName("item0") != null) {
			this.repeatX = 1;
			var count: number;
			count = 0;
			for (var i = 0; i < 10000; i++) {
				var cell = (<Box>this.getChildByName("item" + i));
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
	 * 设置可视区域大小。
	 * <p>以（0，0，width参数，height参数）组成的矩形区域为可视区域。</p>
	 * @param width 可视区域宽度。
	 * @param height 可视区域高度。
	 */
	setContentSize(width: number, height: number): void {
		this._content.width = width;
		this._content.height = height;
		if (this._scrollBar || this._offset.x != 0 || this._offset.y != 0) {
			this._content._style.scrollRect || (this._content.scrollRect = Rectangle.create());
			this._content._style.scrollRect.setTo(-this._offset.x, -this._offset.y, width, height);
			this._content.scrollRect = this._content.scrollRect;
		}
		this.event(Event.RESIZE);
	}

	/**
	 * @private
	 * 单元格的鼠标事件侦听处理函数。
	 */
	protected onCellMouse(e: Event): void {
		if (e.type === Event.MOUSE_DOWN) this._isMoved = false;
		var cell = (<Box>e.currentTarget);
		var index = this._startIndex + this._cells.indexOf(cell);
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
	 * @private
	 * 改变单元格的可视状态。
	 * @param cell 单元格对象。
	 * @param visable 是否显示。
	 * @param index 单元格的属性 <code>index</code> 值。
	 */
	protected changeCellState(cell: Box, visible: boolean, index: number): void {
		var selectBox = (<Clip>cell.getChildByName("selectBox"));
		if (selectBox) {
			this.selectEnable = true;
			selectBox.visible = visible;
			selectBox.index = index;
		}
	}

	/** 
	 * @inheritDoc 
	 * @override
	*/
	protected _sizeChanged(): void {
		super._sizeChanged();
		this.setContentSize(this.width, this.height);
		if (this._scrollBar) this.callLater(this.onScrollBarChange);
	}

	/**
	 * @private
	 * 滚动条的 <code>Event.CHANGE</code> 事件侦听处理函数。
	 */
	protected onScrollBarChange(e: Event|null = null): void {
		this.runCallLater(this.changeCells);
		var scrollValue = this._scrollBar!.value;
		var lineX = (this._isVertical ? this.repeatX : this.repeatY);
		var lineY = (this._isVertical ? this.repeatY : this.repeatX);
		var scrollLine = Math.floor(scrollValue / this._cellSize);

		if (!this.cacheContent) {
			var index = scrollLine * lineX;
			var num = 0;
			let down = true;
			var toIndex=0;
			if (index > this._startIndex) {
				num = index - this._startIndex;
				//var down = true;
				toIndex = this._startIndex + lineX * (lineY + 1);
				this._isMoved = true;
			} else if (index < this._startIndex) {
				num = this._startIndex - index;
				down = false;
				toIndex = this._startIndex - 1;
				this._isMoved = true;
			}

			for (var i = 0; i < num; i++) {
				if (down) {
					var cell = this._cells.shift() as Box;
					this._cells[this._cells.length] = cell;
					var cellIndex = toIndex + i;
				} else {
					cell = this._cells.pop() as Box;
					this._cells.unshift(cell);
					cellIndex = toIndex - i;
				}
				var pos = Math.floor(cellIndex / lineX) * this._cellSize;
				this._isVertical ? cell.y = pos : cell.x = pos;
				this.renderItem(cell, cellIndex);
			}
			this._startIndex = index;
			this.changeSelectStatus();
		} else {
			num = (lineY + 1);
			if (this._createdLine - scrollLine < num) {
				this._createItems(this._createdLine, lineX, this._createdLine + num);
				this.renderItems(this._createdLine * lineX, 0);
				this._createdLine += num;
			}
		}

		var r = this._content._style.scrollRect;
		if (this._isVertical) {
			r.y = scrollValue - this._offset.y;
			r.x = -this._offset.x;
		} else {
			r.y = -this._offset.y;
			r.x = scrollValue - this._offset.x;
		}
		this._content.scrollRect = r;
	}

	private posCell(cell: Box, cellIndex: number): void {
		if (!this._scrollBar) return;
		var lineX = (this._isVertical ? this.repeatX : this.repeatY);
		//var lineY = (this._isVertical ? this.repeatY : this.repeatX);
		var pos = Math.floor(cellIndex / lineX) * this._cellSize;
		this._isVertical ? cell._y = pos : cell.x = pos;
	}

	/**
	 * 表示当前选择的项索引。selectedIndex值更改会引起list重新渲染
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
	 * @private
	 * 改变单元格的选择状态。
	 */
	protected changeSelectStatus(): void {
		for (var i: number = 0, n: number = this._cells.length; i < n; i++) {
			this.changeCellState(this._cells[i], this._selectedIndex === this._startIndex + i, 1);
		}
	}

	/**
	 * 当前选中的单元格数据源。
	 */
	get selectedItem(): any {
		if(!this._array)return null;
		return this._selectedIndex != -1 ? this._array[this._selectedIndex] : null;
	}

	set selectedItem(value: any) {
		this._array && (this.selectedIndex = this._array.indexOf(value));
	}

	/**
	 * 获取或设置当前选择的单元格对象。
	 */
	get selection(): Box {
		return this.getCell(this._selectedIndex) as Box;
	}

	set selection(value: Box) {
		this.selectedIndex = this._startIndex + this._cells.indexOf(value);
	}

	/**
	 * 当前显示的单元格列表的开始索引。
	 */
	get startIndex(): number {
		return this._startIndex;
	}

	set startIndex(value: number) {
		this._startIndex = value > 0 ? value : 0;
		this.callLater(this.renderItems);
	}

	/**
	 * @private
	 * 渲染单元格列表。
	 */
	protected renderItems(from: number = 0, to: number = 0): void {
		for (var i = from, n = to || this._cells.length; i < n; i++) {
			this.renderItem(this._cells[i], this._startIndex + i);
		}
		this.changeSelectStatus();
	}

	/**
	 * 渲染一个单元格。
	 * @param cell 需要渲染的单元格对象。
	 * @param index 单元格索引。
	 */
	protected renderItem(cell: Box, index: number): void {
		if (this._array && index >= 0 && index < this._array.length) {
			cell.visible = true;

			if ((cell as any)["_$bindData"]) {
				cell["_dataSource"] = this._array[index];
				this._bindData(cell, this._array[index]);
			} else cell.dataSource = this._array[index];

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

	private _bindData(cell: any, data: any): void {
		var arr: any[] = cell._$bindData;
		for (var i = 0, n = arr.length; i < n; i++) {
			var ele: any = arr[i++];
			var prop: string = arr[i++];
			var value: string = arr[i];
			var fun = UIUtils.getBindFun(value);
			ele[prop] = fun.call(this, data);
		}
	}

	/**
	 * 列表数据源。
	 */
	get array(): any[] {
		return this._array as any[];
	}

	private _preLen = 0;

	set array(value: any[]) {
		this.runCallLater(this.changeCells);
		this._array = value || [];
		this._preLen = this._array.length;
		var length = this._array.length;
		this.totalPage = Math.ceil(length / (this.repeatX * this.repeatY));
		//重设selectedIndex
		this._selectedIndex = this._selectedIndex < length ? this._selectedIndex : length - 1;
		//重设startIndex
		this.startIndex = this._startIndex;
		//重设滚动条
		if (this._scrollBar) {
			this._scrollBar.stopScroll();
			//自动隐藏滚动条
			var numX = this._isVertical ? this.repeatX : this.repeatY;
			var numY = this._isVertical ? this.repeatY : this.repeatX;
			var lineCount = Math.ceil(length / numX);
			var total = this._cellOffset > 0 ? this.totalPage + 1 : this.totalPage;
			if (total > 1 && lineCount >= numY) {
				this._scrollBar.scrollSize = this._cellSize;
				this._scrollBar.thumbPercent = numY / lineCount;
				this._scrollBar.setScroll(0, (lineCount - numY) * this._cellSize + this._cellOffset, this._scrollBar.value);
				this._scrollBar.target = this._content;
			} else {
				this._scrollBar.setScroll(0, 0, 0);
				this._scrollBar.target = this._content;
			}
		}
	}

	/**
	 * 更新数据源，不刷新list，只增加滚动长度
	 * @param	array 数据源
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
			var length = array.length;
			var numX = this._isVertical ? this.repeatX : this.repeatY;
			var numY = this._isVertical ? this.repeatY : this.repeatX;
			var lineCount = Math.ceil(length / numX);
			if (lineCount >= numY) {
				this._scrollBar.thumbPercent = numY / lineCount;
				this._scrollBar.slider["_max"] = (lineCount - numY) * this._cellSize + this._cellOffset;
			}

		}
	}

	/**
	 * 列表的当前页码。
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
	 * 列表的数据总个数。
	 */
	get length(): number {
		return this._array ? this._array.length : 0;
	}

	/**
	 * @inheritDoc 
	 * @override
	*/
	set dataSource(value: any) {
		this._dataSource = value;
		if (typeof (value) == 'number' || typeof (value) == 'string') this.selectedIndex = parseInt(value as string);
		else if (value instanceof Array) this.array = (<any[]>value)
		else super.dataSource = value;
	}
	/**
	 * @inheritDoc 
	 * @override
	 */
	get dataSource() {
		return super.dataSource;
	}

	/**
	 * 单元格集合。
	 */
	get cells(): Box[] {
		this.runCallLater(this.changeCells);
		return this._cells;
	}

	/**是否开启橡皮筋效果*/
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
	 * 刷新列表数据源。
	 */
	refresh(): void {
		this.array = this._array as any[];
		//startIndex = _startIndex;
	}

	/**
	 * 获取单元格数据源。
	 * @param index 单元格索引。
	 */
	getItem(index: number): any {
		if(!this._array)
			return null;
		if (index > -1 && index < this._array.length) {
			return this._array[index];
		}
		return null;
	}

	/**
	 * 修改单元格数据源。
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
	 * 设置单元格数据源。
	 * @param index 单元格索引。
	 * @param source 单元格数据源。
	 */
	setItem(index: number, source: any): void {
		this.changeItem(index, source);
	}

	/**
	 * 添加单元格数据源。
	 * @param source 数据源。
	 */
	addItem(source: any): void {
		if(!this.array){
			this.array=[source];
		}else{
			this._array!.push(source);
		}
		this.array = this._array as any[];
	}

	/**
	 * 添加单元格数据源到对应的数据索引处。
	 * @param souce 单元格数据源。
	 * @param index 索引。
	 */
	addItemAt(souce: any, index: number): void {
		this._array!.splice(index, 0, souce);
		this.array = this._array!;
	}

	/**
	 * 通过数据源索引删除单元格数据源。
	 * @param index 需要删除的数据源索引值。
	 */
	deleteItem(index: number): void {
		if(this._array){
			this._array.splice(index, 1);
			this.array = this._array;
		}
	}

	/**
	 * 通过可视单元格索引，获取单元格。
	 * @param index 可视单元格索引。
	 * @return 单元格对象。
	 */
	getCell(index: number): Box|null {
		this.runCallLater(this.changeCells);
		if (index > -1 && this._cells) {
			return this._cells[(index - this._startIndex) % this._cells.length];
		}
		return null;
	}

	/**
	 * <p>滚动列表，以设定的数据索引对应的单元格为当前可视列表的第一项。</p>
	 * @param index 单元格在数据列表中的索引。
	 */
	scrollTo(index: number): void {
		if (this._scrollBar) {
			var numX = this._isVertical ? this.repeatX : this.repeatY;
			this._scrollBar.value = Math.floor(index / numX) * this._cellSize;
		} else {
			this.startIndex = index;
		}
	}

	/**
	 * <p>缓动滚动列表，以设定的数据索引对应的单元格为当前可视列表的第一项。</p>
	 * @param index 单元格在数据列表中的索引。
	 * @param time	缓动时间。
	 * @param complete	缓动结束回掉
	 */
	tweenTo(index: number, time: number = 200, complete: Handler|null = null): void {
		if (this._scrollBar) {
			this._scrollBar.stopScroll();
			var numX = this._isVertical ? this.repeatX : this.repeatY;
			Tween.to(this._scrollBar, { value: Math.floor(index / numX) * this._cellSize }, time, null, complete, 0, true);
		} else {
			this.startIndex = index;
			if (complete) complete.run();
		}
	}

	/**@private */
	protected _setCellChanged(): void {
		if (!this._cellChanged) {
			this._cellChanged = true;
			this.callLater(this.changeCells);
		}
	}
	/**@override */
	protected commitMeasure(): void {
		this.runCallLater(this.changeCells);
	}
}

ILaya.regClass(List);
ClassUtils.regClass("laya.ui.List", List);
ClassUtils.regClass("Laya.List", List);