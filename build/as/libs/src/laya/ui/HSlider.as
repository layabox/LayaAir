package laya.ui {
	import laya.ui.Slider;

	/**
	 * 使用 <code>HSlider</code> 控件，用户可以通过在滑块轨道的终点之间移动滑块来选择值。
	 * <p> <code>HSlider</code> 控件采用水平方向。滑块轨道从左向右扩展，而标签位于轨道的顶部或底部。</p>
	 * @example <caption>以下示例代码，创建了一个 <code>HSlider</code> 实例。</caption>package{import laya.ui.HSlider;import laya.utils.Handler;public class HSlider_Example{private var hSlider:HSlider;public function HSlider_Example(){Laya.init(640, 800);//设置游戏画布宽高。Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。Laya.loader.load(["resource/ui/hslider.png", "resource/ui/hslider$bar.png"], Handler.create(this, onLoadComplete));//加载资源。}private function onLoadComplete():void{hSlider = new HSlider();//创建一个 HSlider 类的实例对象 hSlider 。hSlider.skin = "resource/ui/hslider.png";//设置 hSlider 的皮肤。hSlider.min = 0;//设置 hSlider 最低位置值。hSlider.max = 10;//设置 hSlider 最高位置值。hSlider.value = 2;//设置 hSlider 当前位置值。hSlider.tick = 1;//设置 hSlider 刻度值。hSlider.x = 100;//设置 hSlider 对象的属性 x 的值，用于控制 hSlider 对象的显示位置。hSlider.y = 100;//设置 hSlider 对象的属性 y 的值，用于控制 hSlider 对象的显示位置。hSlider.changeHandler = new Handler(this, onChange);//设置 hSlider 位置变化处理器。Laya.stage.addChild(hSlider);//把 hSlider 添加到显示列表。}private function onChange(value:Number):void{trace("滑块的位置： value=" + value);}}}
	 * @example Laya.init(640, 800, "canvas");//设置游戏画布宽高、渲染模式Laya.stage.bgColor = "#efefef";//设置画布的背景颜色var hSlider;var res = ["resource/ui/hslider.png", "resource/ui/hslider$bar.png"];Laya.loader.load(res, laya.utils.Handler.create(this, onLoadComplete));function onLoadComplete() {    console.log("资源加载完成！");    hSlider = new laya.ui.HSlider();//创建一个 HSlider 类的实例对象 hSlider 。    hSlider.skin = "resource/ui/hslider.png";//设置 hSlider 的皮肤。    hSlider.min = 0;//设置 hSlider 最低位置值。    hSlider.max = 10;//设置 hSlider 最高位置值。    hSlider.value = 2;//设置 hSlider 当前位置值。    hSlider.tick = 1;//设置 hSlider 刻度值。    hSlider.x = 100;//设置 hSlider 对象的属性 x 的值，用于控制 hSlider 对象的显示位置。    hSlider.y = 100;//设置 hSlider 对象的属性 y 的值，用于控制 hSlider 对象的显示位置。    hSlider.changeHandler = new laya.utils.Handler(this, onChange);//设置 hSlider 位置变化处理器。    Laya.stage.addChild(hSlider);//把 hSlider 添加到显示列表。}function onChange(value){    console.log("滑块的位置： value=" + value);}
	 * @example import Handler = laya.utils.Handler;import HSlider = laya.ui.HSlider;class HSlider_Example {    private hSlider: HSlider;    constructor() {        Laya.init(640, 800);//设置游戏画布宽高。        Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。        Laya.loader.load(["resource/ui/hslider.png", "resource/ui/hslider$bar.png"], Handler.create(this, this.onLoadComplete));//加载资源。    }    private onLoadComplete(): void {        this.hSlider = new HSlider();//创建一个 HSlider 类的实例对象 hSlider 。        this.hSlider.skin = "resource/ui/hslider.png";//设置 hSlider 的皮肤。        this.hSlider.min = 0;//设置 hSlider 最低位置值。        this.hSlider.max = 10;//设置 hSlider 最高位置值。        this.hSlider.value = 2;//设置 hSlider 当前位置值。        this.hSlider.tick = 1;//设置 hSlider 刻度值。        this.hSlider.x = 100;//设置 hSlider 对象的属性 x 的值，用于控制 hSlider 对象的显示位置。        this.hSlider.y = 100;//设置 hSlider 对象的属性 y 的值，用于控制 hSlider 对象的显示位置。        this.hSlider.changeHandler = new Handler(this, this.onChange);//设置 hSlider 位置变化处理器。        Laya.stage.addChild(this.hSlider);//把 hSlider 添加到显示列表。    }    private onChange(value: number): void {        console.log("滑块的位置： value=" + value);    }}
	 * @see laya.ui.Slider
	 */
	public class HSlider extends Slider {

		/**
		 * 创建一个 <code>HSlider</code> 类实例。
		 * @param skin 皮肤。
		 */

		public function HSlider(skin:String = undefined){}
	}

}
