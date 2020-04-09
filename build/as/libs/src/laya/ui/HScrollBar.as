package laya.ui {
	import laya.ui.ScrollBar;

	/**
	 * 使用 <code>HScrollBar</code> （水平 <code>ScrollBar</code> ）控件，可以在因数据太多而不能在显示区域完全显示时控制显示的数据部分。
	 * @example <caption>以下示例代码，创建了一个 <code>HScrollBar</code> 实例。</caption>package{import laya.ui.HScrollBar;import laya.utils.Handler;public class HScrollBar_Example{private var hScrollBar:HScrollBar;public function HScrollBar_Example(){Laya.init(640, 800);//设置游戏画布宽高。Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。Laya.loader.load(["resource/ui/hscroll.png", "resource/ui/hscroll$bar.png", "resource/ui/hscroll$down.png", "resource/ui/hscroll$up.png"], Handler.create(this, onLoadComplete));//加载资源。}private function onLoadComplete():void{hScrollBar = new HScrollBar();//创建一个 HScrollBar 类的实例对象 hScrollBar 。hScrollBar.skin = "resource/ui/hscroll.png";//设置 hScrollBar 的皮肤。hScrollBar.x = 100;//设置 hScrollBar 对象的属性 x 的值，用于控制 hScrollBar 对象的显示位置。hScrollBar.y = 100;//设置 hScrollBar 对象的属性 y 的值，用于控制 hScrollBar 对象的显示位置。hScrollBar.changeHandler = new Handler(this, onChange);//设置 hScrollBar 的滚动变化处理器。Laya.stage.addChild(hScrollBar);//将此 hScrollBar 对象添加到显示列表。}private function onChange(value:Number):void{trace("滚动条的位置： value=" + value);}}}
	 * @example Laya.init(640, 800);//设置游戏画布宽高Laya.stage.bgColor = "#efefef";//设置画布的背景颜色var hScrollBar;var res  = ["resource/ui/hscroll.png", "resource/ui/hscroll$bar.png", "resource/ui/hscroll$down.png", "resource/ui/hscroll$up.png"];Laya.loader.load(res,laya.utils.Handler.create(this, onLoadComplete));//加载资源。function onLoadComplete() {    console.log("资源加载完成！");    hScrollBar = new laya.ui.HScrollBar();//创建一个 HScrollBar 类的实例对象 hScrollBar 。    hScrollBar.skin = "resource/ui/hscroll.png";//设置 hScrollBar 的皮肤。    hScrollBar.x = 100;//设置 hScrollBar 对象的属性 x 的值，用于控制 hScrollBar 对象的显示位置。    hScrollBar.y = 100;//设置 hScrollBar 对象的属性 y 的值，用于控制 hScrollBar 对象的显示位置。    hScrollBar.changeHandler = new laya.utils.Handler(this, onChange);//设置 hScrollBar 的滚动变化处理器。    Laya.stage.addChild(hScrollBar);//将此 hScrollBar 对象添加到显示列表。}function onChange(value){    console.log("滚动条的位置： value=" + value);}
	 * @example import HScrollBar = laya.ui.HScrollBar;import Handler = laya.utils.Handler;class HScrollBar_Example {    private hScrollBar: HScrollBar;    constructor() {        Laya.init(640, 800);//设置游戏画布宽高。        Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。        Laya.loader.load(["resource/ui/hscroll.png", "resource/ui/hscroll$bar.png", "resource/ui/hscroll$down.png", "resource/ui/hscroll$up.png"], Handler.create(this, this.onLoadComplete));//加载资源。    }    private onLoadComplete(): void {        this.hScrollBar = new HScrollBar();//创建一个 HScrollBar 类的实例对象 hScrollBar 。        this.hScrollBar.skin = "resource/ui/hscroll.png";//设置 hScrollBar 的皮肤。        this.hScrollBar.x = 100;//设置 hScrollBar 对象的属性 x 的值，用于控制 hScrollBar 对象的显示位置。        this.hScrollBar.y = 100;//设置 hScrollBar 对象的属性 y 的值，用于控制 hScrollBar 对象的显示位置。        this.hScrollBar.changeHandler = new Handler(this, this.onChange);//设置 hScrollBar 的滚动变化处理器。        Laya.stage.addChild(this.hScrollBar);//将此 hScrollBar 对象添加到显示列表。    }    private onChange(value: number): void {        console.log("滚动条的位置： value=" + value);    }}
	 */
	public class HScrollBar extends ScrollBar {

		/**
		 * @override 
		 * @inheritDoc 
		 */
		override protected function initialize():void{}
	}

}
