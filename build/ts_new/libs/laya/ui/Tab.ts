import { Sprite } from "../display/Sprite"
import { Button } from "./Button"
import { UIGroup } from "./UIGroup"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

/**
 * 当 <code>Group</code> 实例的 <code>selectedIndex</code> 属性发生变化时调度。
 * @eventType laya.events.Event
 */
/*[Event(name = "change", type = "laya.events.Event")]*/

/**
 * <code>Tab</code> 组件用来定义选项卡按钮组。	 *
 * <p>属性：<code>selectedIndex</code> 的默认值为-1。</p>
 *
 * @example <caption>以下示例代码，创建了一个 <code>Tab</code> 实例。</caption>
 * package
 *	{
 *		import laya.ui.Tab;
 *		import laya.utils.Handler;
 *		public class Tab_Example
 *		{
 *			public function Tab_Example()
 *			{
 *				Laya.init(640, 800);//设置游戏画布宽高。
 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *				Laya.loader.load(["resource/ui/tab.png"], Handler.create(this, onLoadComplete));//加载资源。
 *			}
 *			private function onLoadComplete():void
 *			{
 *				var tab:Tab = new Tab();//创建一个 Tab 类的实例对象 tab 。
 *				tab.skin = "resource/ui/tab.png";//设置 tab 的皮肤。
 *				tab.labels = "item0,item1,item2";//设置 tab 的标签集。
 *				tab.x = 100;//设置 tab 对象的属性 x 的值，用于控制 tab 对象的显示位置。
 *				tab.y = 100;//设置 tab 对象的属性 y 的值，用于控制 tab 对象的显示位置。
 *				tab.selectHandler = new Handler(this, onSelect);//设置 tab 的选择项发生改变时执行的处理器。
 *				Laya.stage.addChild(tab);//将 tab 添到显示列表。
 *			}
 *			private function onSelect(index:int):void
 *			{
 *				trace("当前选择的表情页索引: index= ", index);
 *			}
 *		}
 *	}
 * @example
 * Laya.init(640, 800);//设置游戏画布宽高
 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
 * Laya.loader.load(["resource/ui/tab.png"], laya.utils.Handler.create(this, onLoadComplete));
 * function onLoadComplete() {
 *     var tab = new laya.ui.Tab();//创建一个 Tab 类的实例对象 tab 。
 *     tab.skin = "resource/ui/tab.png";//设置 tab 的皮肤。
 *     tab.labels = "item0,item1,item2";//设置 tab 的标签集。
 *     tab.x = 100;//设置 tab 对象的属性 x 的值，用于控制 tab 对象的显示位置。
 *     tab.y = 100;//设置 tab 对象的属性 y 的值，用于控制 tab 对象的显示位置。
 *     tab.selectHandler = new laya.utils.Handler(this, onSelect);//设置 tab 的选择项发生改变时执行的处理器。
 *     Laya.stage.addChild(tab);//将 tab 添到显示列表。
 * }
 * function onSelect(index) {
 *     console.log("当前选择的标签页索引: index= ", index);
 * }
 * @example
 * import Tab = laya.ui.Tab;
 * import Handler = laya.utils.Handler;
 * class Tab_Example {
 *     constructor() {
 *         Laya.init(640, 800);//设置游戏画布宽高。
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         Laya.loader.load(["resource/ui/tab.png"], Handler.create(this, this.onLoadComplete));//加载资源。
 *     }
 *     private onLoadComplete(): void {
 *         var tab: Tab = new Tab();//创建一个 Tab 类的实例对象 tab 。
 *         tab.skin = "resource/ui/tab.png";//设置 tab 的皮肤。
 *         tab.labels = "item0,item1,item2";//设置 tab 的标签集。
 *         tab.x = 100;//设置 tab 对象的属性 x 的值，用于控制 tab 对象的显示位置。
 *         tab.y = 100;//设置 tab 对象的属性 y 的值，用于控制 tab 对象的显示位置。
 *         tab.selectHandler = new Handler(this, this.onSelect);//设置 tab 的选择项发生改变时执行的处理器。
 *         Laya.stage.addChild(tab);//将 tab 添到显示列表。
 *     }
 *     private onSelect(index: number): void {
 *         console.log("当前选择的表情页索引: index= ", index);
 *     }
 * }
 */
export class Tab extends UIGroup {

    /**
     * @private
     * @inheritDoc
     * @override
     */
    protected createItem(skin: string, label: string): Sprite {
        return new Button(skin, label);
    }
}

ILaya.regClass(Tab);
ClassUtils.regClass("laya.ui.Tab", Tab);
ClassUtils.regClass("Laya.Tab", Tab);