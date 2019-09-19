package laya.ui {
	import laya.ui.Button;

	/**
	 * 当按钮的选中状态（ <code>selected</code> 属性）发生改变时调度。
	 * @eventType laya.events.Event
	 */

	/**
	 * <code>CheckBox</code> 组件显示一个小方框，该方框内可以有选中标记。
	 * <code>CheckBox</code> 组件还可以显示可选的文本标签，默认该标签位于 CheckBox 右侧。
	 * <p><code>CheckBox</code> 使用 <code>dataSource</code>赋值时的的默认属性是：<code>selected</code>。</p>
	 * @example <caption>以下示例代码，创建了一个 <code>CheckBox</code> 实例。</caption>package{import laya.ui.CheckBox;import laya.utils.Handler;public class CheckBox_Example{public function CheckBox_Example(){Laya.init(640, 800);//设置游戏画布宽高。Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。Laya.loader.load("resource/ui/check.png", Handler.create(this,onLoadComplete));//加载资源。}private function onLoadComplete():void{trace("资源加载完成！");var checkBox:CheckBox = new CheckBox("resource/ui/check.png", "这个是一个CheckBox组件。");//创建一个 CheckBox 类的实例对象 checkBox ,传入它的皮肤skin和标签label。checkBox.x = 100;//设置 checkBox 对象的属性 x 的值，用于控制 checkBox 对象的显示位置。checkBox.y = 100;//设置 checkBox 对象的属性 y 的值，用于控制 checkBox 对象的显示位置。checkBox.clickHandler = new Handler(this, onClick, [checkBox]);//设置 checkBox 的点击事件处理器。Laya.stage.addChild(checkBox);//将此 checkBox 对象添加到显示列表。}private function onClick(checkBox:CheckBox):void{trace("输出选中状态: checkBox.selected = " + checkBox.selected);}}}
	 * @example Laya.init(640, 800);//设置游戏画布宽高Laya.stage.bgColor = "#efefef";//设置画布的背景颜色Laya.loader.load("resource/ui/check.png",laya.utils.Handler.create(this,loadComplete));//加载资源function loadComplete(){    console.log("资源加载完成！");    var checkBox:laya.ui.CheckBox= new laya.ui.CheckBox("resource/ui/check.png", "这个是一个CheckBox组件。");//创建一个 CheckBox 类的类的实例对象 checkBox ,传入它的皮肤skin和标签label。    checkBox.x =100;//设置 checkBox 对象的属性 x 的值，用于控制 checkBox 对象的显示位置。    checkBox.y =100;//设置 checkBox 对象的属性 y 的值，用于控制 checkBox 对象的显示位置。    checkBox.clickHandler = new laya.utils.Handler(this,this.onClick,[checkBox],false);//设置 checkBox 的点击事件处理器。    Laya.stage.addChild(checkBox);//将此 checkBox 对象添加到显示列表。}function onClick(checkBox){    console.log("checkBox.selected = ",checkBox.selected);}
	 * @example import CheckBox= laya.ui.CheckBox;import Handler=laya.utils.Handler;class CheckBox_Example{    constructor()    {        Laya.init(640, 800);        Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。        Laya.loader.load("resource/ui/check.png", Handler.create(this,this.onLoadComplete));//加载资源。    }    private onLoadComplete()    {        var checkBox:CheckBox = new CheckBox("resource/ui/check.png", "这个是一个CheckBox组件。");//创建一个 CheckBox 类的实例对象 checkBox ,传入它的皮肤skin和标签label。        checkBox.x = 100;//设置 checkBox 对象的属性 x 的值，用于控制 checkBox 对象的显示位置。        checkBox.y = 100;//设置 checkBox 对象的属性 y 的值，用于控制 checkBox 对象的显示位置。        checkBox.clickHandler = new Handler(this, this.onClick,[checkBox]);//设置 checkBox 的点击事件处理器。        Laya.stage.addChild(checkBox);//将此 checkBox 对象添加到显示列表。    }    private onClick(checkBox:CheckBox):void    {        console.log("输出选中状态: checkBox.selected = " + checkBox.selected);    }}
	 */
	public class CheckBox extends Button {

		/**
		 * 创建一个新的 <code>CheckBox</code> 组件实例。
		 * @param skin 皮肤资源地址。
		 * @param label 文本标签的内容。
		 */

		public function CheckBox(skin:String = undefined,label:String = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function preinitialize():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function initialize():void{}
	}

}
