import { Box } from "././Box";
import { IRender } from "././IRender";
import { IItem } from "././IItem";
import { ScrollBar } from "././ScrollBar";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { Handler } from "../utils/Handler";
/**
 * 当对象的 <code>selectedIndex</code> 属性发生变化时调度。
 * @eventType laya.events.Event
 */
/**
 * 渲染列表的单元项对象时调度。
 * @eventType Event.RENDER
 */
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
export declare class List extends Box implements IRender, IItem {
    /**改变 <code>List</code> 的选择项时执行的处理器，(默认返回参数： 项索引（index:int）)。*/
    selectHandler: Handler;
    /**单元格渲染处理器(默认返回参数cell:Box,index:int)。*/
    renderHandler: Handler;
    /**单元格鼠标事件处理器(默认返回参数e:Event,index:int)。*/
    mouseHandler: Handler;
    /**指定是否可以选择，若值为true则可以选择，否则不可以选择。 @default false*/
    selectEnable: boolean;
    /**最大分页数。*/
    totalPage: number;
    /**@private */
    _$componentType: string;
    /**@private */
    protected _content: Box;
    /**@private */
    protected _scrollBar: ScrollBar;
    /**@private */
    protected _itemRender: any;
    /**@private */
    protected _repeatX: number;
    /**@private */
    protected _repeatY: number;
    /**@private */
    protected _repeatX2: number;
    /**@private */
    protected _repeatY2: number;
    /**@private */
    protected _spaceX: number;
    /**@private */
    protected _spaceY: number;
    /**@private */
    protected _cells: Box[];
    /**@private */
    protected _array: any[];
    /**@private */
    protected _startIndex: number;
    /**@private */
    protected _selectedIndex: number;
    /**@private */
    protected _page: number;
    /**@private */
    protected _isVertical: boolean;
    /**@private */
    protected _cellSize: number;
    /**@private */
    protected _cellOffset: number;
    /**@private */
    protected _isMoved: boolean;
    /**是否缓存内容，如果数据源较少，并且list内无动画，设置此属性为true能大大提高性能 */
    cacheContent: boolean;
    /**@private */
    protected _createdLine: number;
    /**@private */
    protected _cellChanged: boolean;
    /**@private */
    protected _offset: Point;
    /**@private */
    protected _usedCache: string;
    /**@private */
    protected _elasticEnabled: boolean;
    /**@inheritDoc */
    destroy(destroyChild?: boolean): void;
    /**@inheritDoc */
    protected createChildren(): void;
    /**@inheritDoc */
    cacheAs: string;
    private onScrollStart;
    private onScrollEnd;
    /**
     * 获取对 <code>List</code> 组件所包含的内容容器 <code>Box</code> 组件的引用。
     */
    readonly content: Box;
    /**
     * 垂直方向滚动条皮肤。
     */
    vScrollBarSkin: string;
    private _removePreScrollBar;
    /**
     * 水平方向滚动条皮肤。
     */
    hScrollBarSkin: string;
    /**
     * 获取对 <code>List</code> 组件所包含的滚动条 <code>ScrollBar</code> 组件的引用。
     */
    scrollBar: ScrollBar;
    /**
     * 单元格渲染器。
     * <p><b>取值：</b>
     * <ol>
     * <li>单元格类对象。</li>
     * <li> UI 的 JSON 描述。</li>
     * </ol></p>
     */
    itemRender: any;
    /**@inheritDoc */
    width: number;
    /**@inheritDoc */
    height: number;
    /**
     * 水平方向显示的单元格数量。
     */
    repeatX: number;
    /**
     * 垂直方向显示的单元格数量。
     */
    repeatY: number;
    /**
     * 水平方向显示的单元格之间的间距（以像素为单位）。
     */
    spaceX: number;
    /**
     * 垂直方向显示的单元格之间的间距（以像素为单位）。
     */
    spaceY: number;
    /**
     * @private
     * 更改单元格的信息。
     * @internal 在此销毁、创建单元格，并设置单元格的位置等属性。相当于此列表内容发送改变时调用此函数。
     */
    protected changeCells(): void;
    private _getOneCell;
    private _createItems;
    protected createItem(): Box;
    /**
     * @private
     * 添加单元格。
     * @param cell 需要添加的单元格对象。
     */
    protected addCell(cell: Box): void;
    _afterInited(): void;
    /**
     * 初始化单元格信息。
     */
    initItems(): void;
    /**
     * 设置可视区域大小。
     * <p>以（0，0，width参数，height参数）组成的矩形区域为可视区域。</p>
     * @param width 可视区域宽度。
     * @param height 可视区域高度。
     */
    setContentSize(width: number, height: number): void;
    /**
     * @private
     * 单元格的鼠标事件侦听处理函数。
     */
    protected onCellMouse(e: Event): void;
    /**
     * @private
     * 改变单元格的可视状态。
     * @param cell 单元格对象。
     * @param visable 是否显示。
     * @param index 单元格的属性 <code>index</code> 值。
     */
    protected changeCellState(cell: Box, visible: boolean, index: number): void;
    /** @inheritDoc */
    protected _sizeChanged(): void;
    /**
     * @private
     * 滚动条的 <code>Event.CHANGE</code> 事件侦听处理函数。
     */
    protected onScrollBarChange(e?: Event): void;
    private posCell;
    /**
     * 表示当前选择的项索引。selectedIndex值更改会引起list重新渲染
     */
    selectedIndex: number;
    /**
     * @private
     * 改变单元格的选择状态。
     */
    protected changeSelectStatus(): void;
    /**
     * 当前选中的单元格数据源。
     */
    selectedItem: any;
    /**
     * 获取或设置当前选择的单元格对象。
     */
    selection: Box;
    /**
     * 当前显示的单元格列表的开始索引。
     */
    startIndex: number;
    /**
     * @private
     * 渲染单元格列表。
     */
    protected renderItems(from?: number, to?: number): void;
    /**
     * 渲染一个单元格。
     * @param cell 需要渲染的单元格对象。
     * @param index 单元格索引。
     */
    protected renderItem(cell: Box, index: number): void;
    private _bindData;
    /**
     * 列表数据源。
     */
    array: any[];
    private _preLen;
    /**
     * 更新数据源，不刷新list，只增加滚动长度
     * @param	array 数据源
     */
    updateArray(array: any[]): void;
    /**
     * 列表的当前页码。
     */
    page: number;
    /**
     * 列表的数据总个数。
     */
    readonly length: number;
    /**@inheritDoc */
    dataSource: any;
    /**
     * 单元格集合。
     */
    readonly cells: Box[];
    /**是否开启橡皮筋效果*/
    elasticEnabled: boolean;
    /**
     * 刷新列表数据源。
     */
    refresh(): void;
    /**
     * 获取单元格数据源。
     * @param index 单元格索引。
     */
    getItem(index: number): any;
    /**
     * 修改单元格数据源。
     * @param index 单元格索引。
     * @param source 单元格数据源。
     */
    changeItem(index: number, source: any): void;
    /**
     * 设置单元格数据源。
     * @param index 单元格索引。
     * @param source 单元格数据源。
     */
    setItem(index: number, source: any): void;
    /**
     * 添加单元格数据源。
     * @param souce 数据源。
     */
    addItem(souce: any): void;
    /**
     * 添加单元格数据源到对应的数据索引处。
     * @param souce 单元格数据源。
     * @param index 索引。
     */
    addItemAt(souce: any, index: number): void;
    /**
     * 通过数据源索引删除单元格数据源。
     * @param index 需要删除的数据源索引值。
     */
    deleteItem(index: number): void;
    /**
     * 通过可视单元格索引，获取单元格。
     * @param index 可视单元格索引。
     * @return 单元格对象。
     */
    getCell(index: number): Box;
    /**
     * <p>滚动列表，以设定的数据索引对应的单元格为当前可视列表的第一项。</p>
     * @param index 单元格在数据列表中的索引。
     */
    scrollTo(index: number): void;
    /**
     * <p>缓动滚动列表，以设定的数据索引对应的单元格为当前可视列表的第一项。</p>
     * @param index 单元格在数据列表中的索引。
     * @param time	缓动时间。
     * @param complete	缓动结束回掉
     */
    tweenTo(index: number, time?: number, complete?: Handler): void;
    /**@private */
    protected _setCellChanged(): void;
    protected commitMeasure(): void;
}
