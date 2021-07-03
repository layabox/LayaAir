import { Box } from "./Box";
import { IRender } from "./IRender";
import { List } from "./List";
import { ScrollBar } from "./ScrollBar";
import { Clip } from "./Clip";
import { Event } from "../events/Event"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

/**@private */
interface ITreeDataSource{
    x:number;
    hasChild:boolean;
    isOpen:boolean;
    isDirectory:boolean;
}

/**
 * 实例的 <code>selectedIndex</code> 属性发生变化时调度。
 * @eventType laya.events.Event
 */
/*[Event(name = "change", type = "laya.events.Event")]*/
/**
 * 节点打开关闭时触发。
 * @eventType laya.events.Event
 */
/*[Event(name = "open", type = "laya.events.Event")]*/

/**
 * <code>Tree</code> 控件使用户可以查看排列为可扩展树的层次结构数据。
 *
 * @example
 * package
 *	{
 *		import laya.ui.Tree;
 *		import laya.utils.Browser;
 *		import laya.utils.Handler;
	
 *		public class Tree_Example
 *		{
	
 *			public function Tree_Example()
 *			{
 *				Laya.init(640, 800);
 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *				Laya.loader.load(["resource/ui/vscroll.png", "resource/ui/vscroll$bar.png", "resource/ui/vscroll$down.png", "resource/ui/vscroll$up.png", "resource/ui/clip_selectBox.png", "resource/ui/clip_tree_folder.png", "resource/ui/clip_tree_arrow.png"], Handler.create(this, onLoadComplete));
 *			}
	
 *			private function onLoadComplete():void
 *			{
 *				var xmlString:String;//创建一个xml字符串，用于存储树结构数据。
 *				xmlString = "&lt;root&gt;&lt;item label='box1'&gt;&lt;abc label='child1'/&gt;&lt;abc label='child2'/&gt;&lt;abc label='child3'/&gt;&lt;abc label='child4'/&gt;&lt;abc label='child5'/&gt;&lt;/item&gt;&lt;item label='box2'&gt;&lt;abc label='child1'/&gt;&lt;abc label='child2'/&gt;&lt;abc label='child3'/&gt;&lt;abc label='child4'/&gt;&lt;/item&gt;&lt;/root&gt;";
 *				var domParser:* = new Browser.window.DOMParser();//创建一个DOMParser实例domParser。
 *				var xml:* = domParser.parseFromString(xmlString, "text/xml");//解析xml字符。
	
 *				var tree:Tree = new Tree();//创建一个 Tree 类的实例对象 tree 。
 *				tree.scrollBarSkin = "resource/ui/vscroll.png";//设置 tree 的皮肤。
 *				tree.itemRender = Item;//设置 tree 的项渲染器。
 *				tree.xml = xml;//设置 tree 的树结构数据。
 *				tree.x = 100;//设置 tree 对象的属性 x 的值，用于控制 tree 对象的显示位置。
 *				tree.y = 100;//设置 tree 对象的属性 y 的值，用于控制 tree 对象的显示位置。
 *				tree.width = 200;//设置 tree 的宽度。
 *				tree.height = 100;//设置 tree 的高度。
 *				Laya.stage.addChild(tree);//将 tree 添加到显示列表。
 *			}
 *		}
 *	}
	
 * import laya.ui.Box;
 * import laya.ui.Clip;
 * import laya.ui.Label;
 *	class Item extends Box
 *	{
 *		public function Item()
 *		{
 *			this.name = "render";
 *			this.right = 0;
 *			this.left = 0;
	
 *			var selectBox:Clip = new Clip("resource/ui/clip_selectBox.png", 1, 2);
 *			selectBox.name = "selectBox";
 *			selectBox.height = 24;
 *			selectBox.x = 13;
 *			selectBox.y = 0;
 *			selectBox.left = 12;
 *			addChild(selectBox);
	
 *			var folder:Clip = new Clip("resource/ui/clip_tree_folder.png", 1, 3);
 *			folder.name = "folder";
 *			folder.x = 14;
 *			folder.y = 4;
 *			addChild(folder);
	
 *			var label:Label = new Label("treeItem");
 *			label.name = "label";
 *			label.color = "#ffff00";
 *			label.width = 150;
 *			label.height = 22;
 *			label.x = 33;
 *			label.y = 1;
 *			label.left = 33;
 *			label.right = 0;
 *			addChild(label);
	
 *			var arrow:Clip = new Clip("resource/ui/clip_tree_arrow.png", 1, 2);
 *			arrow.name = "arrow";
 *			arrow.x = 0;
 *			arrow.y = 5;
 *			addChild(arrow);
 *		}
 *	 }
 * @example
 * Laya.init(640, 800);//设置游戏画布宽高、渲染模式
 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
 * var res = ["resource/ui/vscroll.png", "resource/ui/vscroll$bar.png", "resource/ui/vscroll$down.png", "resource/ui/vscroll$up.png", "resource/ui/clip_selectBox.png", "resource/ui/clip_tree_folder.png", "resource/ui/clip_tree_arrow.png"];
 * Laya.loader.load(res, new laya.utils.Handler(this, onLoadComplete));
 * function onLoadComplete() {
 *     var xmlString;//创建一个xml字符串，用于存储树结构数据。
 *     xmlString = "&lt;root&gt;&lt;item label='box1'&gt;&lt;abc label='child1'/&gt;&lt;abc label='child2'/&gt;&lt;abc label='child3'/&gt;&lt;abc label='child4'/&gt;&lt;abc label='child5'/&gt;&lt;/item&gt;&lt;item label='box2'&gt;&lt;abc label='child1'/&gt;&lt;abc label='child2'/&gt;&lt;abc label='child3'/&gt;&lt;abc label='child4'/&gt;&lt;/item&gt;&lt;/root&gt;";
 *     var domParser = new laya.utils.Browser.window.DOMParser();//创建一个DOMParser实例domParser。
 *     var xml = domParser.parseFromString(xmlString, "text/xml");//解析xml字符。
	
 *     var tree = new laya.ui.Tree();//创建一个 Tree 类的实例对象 tree 。
 *     tree.scrollBarSkin = "resource/ui/vscroll.png";//设置 tree 的皮肤。
 *     tree.itemRender = mypackage.treeExample.Item;//设置 tree 的项渲染器。
 *     tree.xml = xml;//设置 tree 的树结构数据。
 *     tree.x = 100;//设置 tree 对象的属性 x 的值，用于控制 tree 对象的显示位置。
 *     tree.y = 100;//设置 tree 对象的属性 y 的值，用于控制 tree 对象的显示位置。
 *     tree.width = 200;//设置 tree 的宽度。
 *     tree.height = 100;//设置 tree 的高度。
 *     Laya.stage.addChild(tree);//将 tree 添加到显示列表。
 * }
 * (function (_super) {
 *     function Item() {
 *         Item.__super.call(this);//初始化父类。
 *         this.right = 0;
 *         this.left = 0;
	
 *         var selectBox = new laya.ui.Clip("resource/ui/clip_selectBox.png", 1, 2);
 *         selectBox.name = "selectBox";//设置 selectBox 的name 为“selectBox”时，将被识别为树结构的项的背景。2帧：悬停时背景、选中时背景。
 *         selectBox.height = 24;
 *         selectBox.x = 13;
 *         selectBox.y = 0;
 *         selectBox.left = 12;
 *         this.addChild(selectBox);//需要使用this.访问父类的属性或方法。
	
 *         var folder = new laya.ui.Clip("resource/ui/clip_tree_folder.png", 1, 3);
 *         folder.name = "folder";//设置 folder 的name 为“folder”时，将被识别为树结构的文件夹开启状态图表。2帧：折叠状态、打开状态。
 *         folder.x = 14;
 *         folder.y = 4;
 *         this.addChild(folder);
	
 *         var label = new laya.ui.Label("treeItem");
 *         label.name = "label";//设置 label 的name 为“label”时，此值将用于树结构数据赋值。
 *         label.color = "#ffff00";
 *         label.width = 150;
 *         label.height = 22;
 *         label.x = 33;
 *         label.y = 1;
 *         label.left = 33;
 *         label.right = 0;
 *         this.addChild(label);
	
 *         var arrow = new laya.ui.Clip("resource/ui/clip_tree_arrow.png", 1, 2);
 *         arrow.name = "arrow";//设置 arrow 的name 为“arrow”时，将被识别为树结构的文件夹开启状态图表。2帧：折叠状态、打开状态。
 *         arrow.x = 0;
 *         arrow.y = 5;
 *         this.addChild(arrow);
 *     };
 *     Laya.class(Item,"mypackage.treeExample.Item",_super);//注册类 Item 。
 * })(laya.ui.Box);
 * @example
 * import Tree = laya.ui.Tree;
 * import Browser = laya.utils.Browser;
 * import Handler = laya.utils.Handler;
 * class Tree_Example {
	
 *     constructor() {
 *         Laya.init(640, 800);
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         Laya.loader.load(["resource/ui/vscroll.png", "resource/ui/vscroll$bar.png", "resource/ui/vscroll$down.png", "resource/ui/vscroll$up.png", "resource/ui/vscroll$up.png", "resource/ui/clip_selectBox.png", "resource/ui/clip_tree_folder * . * png", "resource/ui/clip_tree_arrow.png"], Handler.create(this, this.onLoadComplete));
 *     }
 *     private onLoadComplete(): void {
 *         var xmlString: String;//创建一个xml字符串，用于存储树结构数据。
 *         xmlString = "&lt;root&gt;&lt;item label='box1'&gt;&lt;abc label='child1'/&gt;&lt;abc label='child2'/&gt;&lt;abc label='child3'/&gt;&lt;abc label='child4'/&gt;&lt;abc label='child5'/&gt;&lt;/item&gt;&lt;item label='box2'&gt;&lt;abc  * label='child1'/&gt;&lt;abc label='child2'/&gt;&lt;abc label='child3'/&gt;&lt;abc label='child4'/&gt;&lt;/item&gt;&lt;/root&gt;";
 *         var domParser: any = new Browser.window.DOMParser();//创建一个DOMParser实例domParser。
 *         var xml: any = domParser.parseFromString(xmlString, "text/xml");//解析xml字符。
	
 *         var tree: Tree = new Tree();//创建一个 Tree 类的实例对象 tree 。
 *         tree.scrollBarSkin = "resource/ui/vscroll.png";//设置 tree 的皮肤。
 *         tree.itemRender = Item;//设置 tree 的项渲染器。
 *         tree.xml = xml;//设置 tree 的树结构数据。
 *         tree.x = 100;//设置 tree 对象的属性 x 的值，用于控制 tree 对象的显示位置。
 *         tree.y = 100;//设置 tree 对象的属性 y 的值，用于控制 tree 对象的显示位置。
 *         tree.width = 200;//设置 tree 的宽度。
 *         tree.height = 100;//设置 tree 的高度。
 *         Laya.stage.addChild(tree);//将 tree 添加到显示列表。
 *     }
 * }
 * import Box = laya.ui.Box;
 * import Clip = laya.ui.Clip;
 * import Label = laya.ui.Label;
 * class Item extends Box {
 *     constructor() {
 *         super();
 *         this.name = "render";
 *         this.right = 0;
 *         this.left = 0;
 *         var selectBox: Clip = new Clip("resource/ui/clip_selectBox.png", 1, 2);
 *         selectBox.name = "selectBox";
 *         selectBox.height = 24;
 *         selectBox.x = 13;
 *         selectBox.y = 0;
 *         selectBox.left = 12;
 *         this.addChild(selectBox);
	
 *         var folder: Clip = new Clip("resource/ui/clip_tree_folder.png", 1, 3);
 *         folder.name = "folder";
 *         folder.x = 14;
 *         folder.y = 4;
 *         this.addChild(folder);
	
 *         var label: Label = new Label("treeItem");
 *         label.name = "label";
 *         label.color = "#ffff00";
 *         label.width = 150;
 *         label.height = 22;
 *         label.x = 33;
 *         label.y = 1;
 *         label.left = 33;
 *         label.right = 0;
 *         this.addChild(label);
	
 *         var arrow: Clip = new Clip("resource/ui/clip_tree_arrow.png", 1, 2);
 *         arrow.name = "arrow";
 *         arrow.x = 0;
 *         arrow.y = 5;
 *         this.addChild(arrow);
 *     }
 * }
 */
export class Tree extends Box implements IRender {
    /**@private */
    protected _list: List;
    /**@private */
    protected _source: any[];
    /**@private */
    protected _renderHandler: Handler;
    /**@private */
    protected _spaceLeft: number = 10;
    /**@private */
    protected _spaceBottom: number = 0;
    /**@private */
    protected _keepStatus: boolean = true;

    /**
     * 创建一个新的 <code>Tree</code> 类实例。
     * <p>在 <code>Tree</code> 构造函数中设置属性width、height的值都为200。</p>
     */
    constructor() {
        super();
        this.width = this.height = 200;
    }

    /**
     * @inheritDoc 
     * @override
    */
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._list && this._list.destroy(destroyChild);
        this._list = null;
        this._source = null;
        this._renderHandler = null;
    }
    /**
     * @override
     */
    protected createChildren(): void {
        this.addChild(this._list = new List());
        this._list.renderHandler = Handler.create(this, this.renderItem, null, false);
        this._list.repeatX = 1;
        this._list.on(Event.CHANGE, this, this.onListChange);
    }

    /**
     * @private
     * 此对象包含的<code>List</code>实例的<code>Event.CHANGE</code>事件侦听处理函数。
     */
    protected onListChange(e: Event = null): void {
        this.event(Event.CHANGE);
    }

    /**
     * 数据源发生变化后，是否保持之前打开状态，默认为true。
     * <p><b>取值：</b>
     * <li>true：保持之前打开状态。</li>
     * <li>false：不保持之前打开状态。</li>
     * </p>
     */
    get keepStatus(): boolean {
        return this._keepStatus;
    }

    set keepStatus(value: boolean) {
        this._keepStatus = value;
    }

    /**
     * 列表数据源，只包含当前可视节点数据。
     */
    get array(): any[] {
        return this._list.array;
    }

    set array(value: any[]) {
        if (this._keepStatus && this._list.array && value) {
            this.parseOpenStatus(this._list.array, value);
        }
        this._source = value;
        this._list.array = this.getArray();
    }

    /**
     * 数据源，全部节点数据。
     */
    get source(): any[] {
        return this._source;
    }

    /**
     * 此对象包含的<code>List</code>实例对象。
     */
    get list(): List {
        return this._list;
    }

    /**
     * 此对象包含的<code>List</code>实例的单元格渲染器。
     * <p><b>取值：</b>
     * <ol>
     * <li>单元格类对象。</li>
     * <li> UI 的 JSON 描述。</li>
     * </ol></p>
     * @implements
     */
    get itemRender(): any {
        return this._list.itemRender;
    }

    set itemRender(value: any) {
        this._list.itemRender = value;
    }

    /**
     * 滚动条皮肤。
     */
    get scrollBarSkin(): string {
        return this._list.vScrollBarSkin;
    }

    set scrollBarSkin(value: string) {
        this._list.vScrollBarSkin = value;
    }

    /**滚动条*/
    get scrollBar(): ScrollBar {
        return this._list.scrollBar;
    }

    /**
     * 单元格鼠标事件处理器。
     * <p>默认返回参数（e:Event,index:int）。</p>
     */
    get mouseHandler(): Handler {
        return this._list.mouseHandler;
    }

    set mouseHandler(value: Handler) {
        this._list.mouseHandler = value;
    }

    /**
     * <code>Tree</code> 实例的渲染处理器。
     */
    get renderHandler(): Handler {
        return this._renderHandler;
    }

    set renderHandler(value: Handler) {
        this._renderHandler = value;
    }

    /**
     * 左侧缩进距离（以像素为单位）。
     */
    get spaceLeft(): number {
        return this._spaceLeft;
    }

    set spaceLeft(value: number) {
        this._spaceLeft = value;
    }

    /**
     * 每一项之间的间隔距离（以像素为单位）。
     */
    get spaceBottom(): number {
        return this._list.spaceY;
    }

    set spaceBottom(value: number) {
        this._list.spaceY = value;
    }

    /**
     * 表示当前选择的项索引。
     */
    get selectedIndex(): number {
        return this._list.selectedIndex;
    }

    set selectedIndex(value: number) {
        this._list.selectedIndex = value;
    }

    /**
     * 当前选中的项对象的数据源。
     */
    get selectedItem(): any {
        return this._list.selectedItem;
    }

    set selectedItem(value: any) {
        this._list.selectedItem = value;
    }

    /**
     * @inheritDoc
     * @override
     */
    set width(value: number) {
        super.width = value;
        this._list.width = value;
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
        super.height = value;
        this._list.height = value;
    }

    /**
     * @inheritDoc 
     * @override
     */
    get height() {
        return super.height;
    }

    /**
     * @private
     * 获取数据源集合。
     */
    protected getArray(): any[] {
        var arr: any[] = [];
        for (let key in this._source) {//TODO TS
            let item = this._source[key];
            if (this.getParentOpenStatus(item)) {
                item.x = this._spaceLeft * this.getDepth(item);
                arr.push(item);
            }
        }
        return arr;
    }

    /**
     * @private
     * 获取项对象的深度。
     */
    protected getDepth(item: any, num: number = 0): number {
        if (item.nodeParent == null) return num;
        else return this.getDepth(item.nodeParent, num + 1);
    }

    /**
     * @private
     * 获取项对象的上一级的打开状态。
     */
    protected getParentOpenStatus(item: any): boolean {
        var parent: any = item.nodeParent;
        if (parent == null) {
            return true;
        } else {
            if (parent.isOpen) {
                if (parent.nodeParent != null) return this.getParentOpenStatus(parent);
                else return true;
            } else {
                return false;
            }
        }
    }

    /**
     * @private
     * 渲染一个项对象。
     * @param cell 一个项对象。
     * @param index 项的索引。
     */
    protected renderItem(cell: Box, index: number): void {
        var item: ITreeDataSource = cell.dataSource;
        if (item) {
            cell.left = item.x;
            var arrow = cell.getChildByName("arrow") as Clip;
            if (arrow) {
                if (item.hasChild) {
                    arrow.visible = true;
                    arrow.index = item.isOpen ? 1 : 0;
                    arrow.tag = index;
                    arrow.off(Event.CLICK, this, this.onArrowClick);
                    arrow.on(Event.CLICK, this, this.onArrowClick);
                } else {
                    arrow.visible = false;
                }
            }
            var folder = cell.getChildByName("folder") as Clip;
            if (folder) {
                if (folder.clipY == 2) {
                    folder.index = item.isDirectory ? 0 : 1;
                } else {
                    folder.index = item.isDirectory ? item.isOpen ? 1 : 0 : 2;
                }
            }
            this._renderHandler && this._renderHandler.runWith([cell, index]);
        }
    }

    /**
     * @private
     */
    private onArrowClick(e: Event): void {
        var arrow = (<Clip>e.currentTarget);
        var index = arrow.tag;
        this._list.array[index].isOpen = !this._list.array[index].isOpen;
        this.event(Event.OPEN);
        this._list.array = this.getArray();
    }

    /**
     * 设置指定项索引的项对象的打开状态。
     * @param index 项索引。
     * @param isOpen 是否处于打开状态。
     */
    setItemState(index: number, isOpen: boolean): void {
        if (!this._list.array[index]) return;
        this._list.array[index].isOpen = isOpen;
        this._list.array = this.getArray();
    }

    /**
     * 刷新项列表。
     */
    fresh(): void {
        this._list.array = this.getArray();
        this.repaint();
    }

    /**
     * @inheritDoc 
     * @override
     */
    set dataSource(value: any) {
        this._dataSource = value;
        //if (value is XmlDom) xml = value as XmlDom;
        super.dataSource = value;
    }
    /**
     * @inheritDoc 
     * @override 
     */
    get dataSource() {
        return super.dataSource;
    }

    /**
     *  xml结构的数据源。
     */
    set xml(value: XMLDocument) {
        var arr: any[] = [];
        this.parseXml(value.childNodes[0], arr, null, true);

        this.array = arr;
    }

    /**
     * @private
     * 解析并处理XML类型的数据源。
     */
    protected parseXml(xml: ChildNode, source: any[], nodeParent: any, isRoot: boolean): void {
        var obj: any;
        var list = xml.childNodes;
        var childCount = list.length;
        if (!isRoot) {
            obj = {};
            var list2 = (xml as any).attributes;
            for (let key in list2) {
                var attrs = list2[key];
                var prop: string = attrs.nodeName;
                var value: string = attrs.nodeValue;
                obj[prop] = value == "true" ? true : value == "false" ? false : value;
            }
            obj.nodeParent = nodeParent;
            if (childCount > 0) obj.isDirectory = true;
            obj.hasChild = childCount > 0;
            source.push(obj);
        }
        for (var i = 0; i < childCount; i++) {
            var node = list[i];
            this.parseXml(node, source, obj, false);
        }
    }

    /**
     * @private
     * 处理数据项的打开状态。
     */
    protected parseOpenStatus(oldSource: any[], newSource: any[]): void {
        for (var i = 0, n = newSource.length; i < n; i++) {
            var newItem = newSource[i];
            if (newItem.isDirectory) {
                for (var j = 0, m = oldSource.length; j < m; j++) {
                    var oldItem = oldSource[j];
                    if (oldItem.isDirectory && this.isSameParent(oldItem, newItem) && newItem.label == oldItem.label) {
                        newItem.isOpen = oldItem.isOpen;
                        break;
                    }
                }
            }
        }
    }

    /**
     * @private
     * 判断两个项对象在树结构中的父节点是否相同。
     * @param item1 项对象。
     * @param item2 项对象。
     * @return 如果父节点相同值为true，否则值为false。
     */
    protected isSameParent(item1: any, item2: any): boolean {
        if (item1.nodeParent == null && item2.nodeParent == null) return true;
        else if (item1.nodeParent == null || item2.nodeParent == null) return false
        else {
            if (item1.nodeParent.label == item2.nodeParent.label) return this.isSameParent(item1.nodeParent, item2.nodeParent);
            else return false;
        }
    }

    /**
     * 表示选择的树节点项的<code>path</code>属性值。
     */
    get selectedPath(): string {
        if (this._list.selectedItem) {
            return this._list.selectedItem.path;
        }
        return null;
    }

    /**
     * 更新项列表，显示指定键名的数据项。
     * @param	key 键名。
     */
    filter(key: string): void {
        if (Boolean(key)) {
            var result: any[] = [];
            this.getFilterSource(this._source, result, key);
            this._list.array = result;
        } else {
            this._list.array = this.getArray();
        }
    }

    /**
     * @private
     * 获取数据源中指定键名的值。
     */
    private getFilterSource(array: any[], result: any[], key: string): void {
        key = key.toLocaleLowerCase();
        for (let item of array) {
            if (!item.isDirectory && String(item.label).toLowerCase().indexOf(key) > -1) {
                item.x = 0;
                result.push(item);
            }
            if (item.child && item.child.length > 0) {
                this.getFilterSource(item.child, result, key);
            }
        }
    }
}

ILaya.regClass(Tree);
ClassUtils.regClass("laya.ui.Tree", Tree);
ClassUtils.regClass("Laya.Tree", Tree);