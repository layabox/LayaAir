package laya.ui {
	import laya.ui.UIGroup;
	import laya.display.Sprite;

	/**
	 * 当 <code>Group</code> 实例的 <code>selectedIndex</code> 属性发生变化时调度。
	 * @eventType laya.events.Event
	 */

	/**
	 * <code>RadioGroup</code> 控件定义一组 <code>Radio</code> 控件，这些控件相互排斥；
	 * 因此，用户每次只能选择一个 <code>Radio</code> 控件。
	 * @example <caption>以下示例代码，创建了一个 <code>RadioGroup</code> 实例。</caption>package{import laya.ui.Radio;import laya.ui.RadioGroup;import laya.utils.Handler;public class RadioGroup_Example{public function RadioGroup_Example(){Laya.init(640, 800);//设置游戏画布宽高。Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。Laya.loader.load(["resource/ui/radio.png"], Handler.create(this, onLoadComplete));//加载资源。}private function onLoadComplete():void{var radioGroup:RadioGroup = new RadioGroup();//创建一个 RadioGroup 类的实例对象 radioGroup 。radioGroup.pos(100, 100);//设置 radioGroup 的位置信息。radioGroup.labels = "item0,item1,item2";//设置 radioGroup 的标签集。radioGroup.skin = "resource/ui/radio.png";//设置 radioGroup 的皮肤。radioGroup.space = 10;//设置 radioGroup 的项间隔距离。radioGroup.selectHandler = new Handler(this, onSelect);//设置 radioGroup 的选择项发生改变时执行的处理器。Laya.stage.addChild(radioGroup);//将 radioGroup 添加到显示列表。}private function onSelect(index:int):void{trace("当前选择的单选按钮索引: index= ", index);}}}
	 * @example Laya.init(640, 800);//设置游戏画布宽高、渲染模式Laya.stage.bgColor = "#efefef";//设置画布的背景颜色Laya.loader.load(["resource/ui/radio.png"], laya.utils.Handler.create(this, onLoadComplete));function onLoadComplete() {    var radioGroup= new laya.ui.RadioGroup();//创建一个 RadioGroup 类的实例对象 radioGroup 。    radioGroup.pos(100, 100);//设置 radioGroup 的位置信息。    radioGroup.labels = "item0,item1,item2";//设置 radioGroup 的标签集。    radioGroup.skin = "resource/ui/radio.png";//设置 radioGroup 的皮肤。    radioGroup.space = 10;//设置 radioGroup 的项间隔距离。    radioGroup.selectHandler = new laya.utils.Handler(this, onSelect);//设置 radioGroup 的选择项发生改变时执行的处理器。    Laya.stage.addChild(radioGroup);//将 radioGroup 添加到显示列表。}function onSelect(index) {    console.log("当前选择的单选按钮索引: index= ", index);}
	 * @example import Radio = laya.ui.Radio;import RadioGroup = laya.ui.RadioGroup;import Handler = laya.utils.Handler;class RadioGroup_Example {    constructor() {        Laya.init(640, 800);//设置游戏画布宽高。        Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。        Laya.loader.load(["resource/ui/radio.png"], Handler.create(this, this.onLoadComplete));//加载资源。    }    private onLoadComplete(): void {        var radioGroup: RadioGroup = new RadioGroup();//创建一个 RadioGroup 类的实例对象 radioGroup 。        radioGroup.pos(100, 100);//设置 radioGroup 的位置信息。        radioGroup.labels = "item0,item1,item2";//设置 radioGroup 的标签集。        radioGroup.skin = "resource/ui/radio.png";//设置 radioGroup 的皮肤。        radioGroup.space = 10;//设置 radioGroup 的项间隔距离。        radioGroup.selectHandler = new Handler(this, this.onSelect);//设置 radioGroup 的选择项发生改变时执行的处理器。        Laya.stage.addChild(radioGroup);//将 radioGroup 添加到显示列表。    }    private onSelect(index: number): void {        console.log("当前选择的单选按钮索引: index= ", index);    }}
	 */
	public class RadioGroup extends UIGroup {

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function createItem(skin:String,label:String):Sprite{
			return null;
		}
	}

}
