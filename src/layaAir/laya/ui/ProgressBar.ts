import { Event } from "../events/Event"
import { UIComponent } from "./UIComponent"
import { Image } from "./Image"
import { Handler } from "../utils/Handler"
import { HideFlags } from "../Const"
import { URL } from "../net/URL"
import { Utils } from "../utils/Utils"
import { AssetDb } from "../resource/AssetDb"

/**
 * 值发生改变后调度。
 * @eventType laya.events.Event
 */
/*[Event(name = "change", type = "laya.events.Event")]*/

/**
 * <code>ProgressBar</code> 组件显示内容的加载进度。
 * @example <caption>以下示例代码，创建了一个新的 <code>ProgressBar</code> 实例，设置了它的皮肤、位置、宽高、网格等信息，并添加到舞台上。</caption>
 * package
 *	{
 *		import laya.ui.ProgressBar;
 *		import laya.utils.Handler;
 *		public class ProgressBar_Example
 *		{
 *			private var progressBar:ProgressBar;
 *			public function ProgressBar_Example()
 *			{
 *				Laya.init(640, 800);//设置游戏画布宽高。
 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *				Laya.loader.load(["resource/ui/progress.png", "resource/ui/progress$bar.png"], Handler.create(this, onLoadComplete));//加载资源。
 *			}
 *			private function onLoadComplete():void
 *			{
 *				progressBar = new ProgressBar("resource/ui/progress.png");//创建一个 ProgressBar 类的实例对象 progressBar 。
 *				progressBar.x = 100;//设置 progressBar 对象的属性 x 的值，用于控制 progressBar 对象的显示位置。
 *				progressBar.y = 100;//设置 progressBar 对象的属性 y 的值，用于控制 progressBar 对象的显示位置。
 *				progressBar.value = 0.3;//设置 progressBar 的进度值。
 *				progressBar.width = 200;//设置 progressBar 的宽度。
 *				progressBar.height = 50;//设置 progressBar 的高度。
 *				progressBar.sizeGrid = "5,10,5,10";//设置 progressBar 的网格信息。
 *				progressBar.changeHandler = new Handler(this, onChange);//设置 progressBar 的value值改变时执行的处理器。
 *				Laya.stage.addChild(progressBar);//将 progressBar 添加到显示列表。
 *				Laya.timer.once(3000, this, changeValue);//设定 3000ms（毫秒）后，执行函数changeValue。
 *			}
 *			private function changeValue():void
 *			{
 *				trace("改变进度条的进度值。");
 *				progressBar.value = 0.6;
 *			}
 *			private function onChange(value:Number):void
 *			{
 *				trace("进度发生改变： value=" ,value);
 *			}
 *		}
 *	}
 * @example
 * Laya.init(640, 800);//设置游戏画布宽高
 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
 * var res = ["resource/ui/progress.png", "resource/ui/progress$bar.png"];
 * Laya.loader.load(res, laya.utils.Handler.create(this, onLoadComplete));//加载资源。
 * function onLoadComplete()
 * {
 *     progressBar = new laya.ui.ProgressBar("resource/ui/progress.png");//创建一个 ProgressBar 类的实例对象 progressBar 。
 *     progressBar.x = 100;//设置 progressBar 对象的属性 x 的值，用于控制 progressBar 对象的显示位置。
 *     progressBar.y = 100;//设置 progressBar 对象的属性 y 的值，用于控制 progressBar 对象的显示位置。
 *     progressBar.value = 0.3;//设置 progressBar 的进度值。
 *     progressBar.width = 200;//设置 progressBar 的宽度。
 *     progressBar.height = 50;//设置 progressBar 的高度。
 *     progressBar.sizeGrid = "10,5,10,5";//设置 progressBar 的网格信息。
 *     progressBar.changeHandler = new laya.utils.Handler(this, onChange);//设置 progressBar 的value值改变时执行的处理器。
 *     Laya.stage.addChild(progressBar);//将 progressBar 添加到显示列表。
 *     Laya.timer.once(3000, this, changeValue);//设定 3000ms（毫秒）后，执行函数changeValue。
 * }
 * function changeValue()
 * {
 *     console.log("改变进度条的进度值。");
 *     progressBar.value = 0.6;
 * }
 * function onChange(value)
 * {
 *     console.log("进度发生改变： value=" ,value);
 * }
 * @example
 * import ProgressBar = laya.ui.ProgressBar;
 * import Handler = laya.utils.Handler;
 * class ProgressBar_Example {
 *     private progressBar: ProgressBar;
 *     public ProgressBar_Example() {
 *         Laya.init(640, 800);//设置游戏画布宽高。
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         Laya.loader.load(["resource/ui/progress.png", "resource/ui/progress$bar.png"], Handler.create(this, this.onLoadComplete));//加载资源。
 *     }
 *     private onLoadComplete(): void {
 *         this.progressBar = new ProgressBar("resource/ui/progress.png");//创建一个 ProgressBar 类的实例对象 progressBar 。
 *         this.progressBar.x = 100;//设置 progressBar 对象的属性 x 的值，用于控制 progressBar 对象的显示位置。
 *         this.progressBar.y = 100;//设置 progressBar 对象的属性 y 的值，用于控制 progressBar 对象的显示位置。
 *         this.progressBar.value = 0.3;//设置 progressBar 的进度值。
 *         this.progressBar.width = 200;//设置 progressBar 的宽度。
 *         this.progressBar.height = 50;//设置 progressBar 的高度。
 *         this.progressBar.sizeGrid = "5,10,5,10";//设置 progressBar 的网格信息。
 *         this.progressBar.changeHandler = new Handler(this, this.onChange);//设置 progressBar 的value值改变时执行的处理器。
 *         Laya.stage.addChild(this.progressBar);//将 progressBar 添加到显示列表。
 *         Laya.timer.once(3000, this, this.changeValue);//设定 3000ms（毫秒）后，执行函数changeValue。
 *     }
 *     private changeValue(): void {
 *         console.log("改变进度条的进度值。");
 *         this.progressBar.value = 0.6;
 *     }
 *     private onChange(value: number): void {
 *         console.log("进度发生改变： value=", value);
 *     }
 * }
 */
export class ProgressBar extends UIComponent {
    /**
     * 当 <code>ProgressBar</code> 实例的 <code>value</code> 属性发生变化时的函数处理器。
     * <p>默认返回参数<code>value</code> 属性（进度值）。</p>
     */
    changeHandler: Handler;
    /**@private */
    protected _bg: Image;
    /**@private */
    protected _bar: Image;
    /**@private */
    protected _skin: string;
    /**@private */
    protected _value: number = 0.5;

    /**
     * 创建一个新的 <code>ProgressBar</code> 类实例。
     * @param skin 皮肤地址。
     */
    constructor(skin: string = null) {
        super();
        this.skin = skin;
    }

    /**
     * @inheritDoc 
     * @override
    */
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._bg && this._bg.destroy(destroyChild);
        this._bar && this._bar.destroy(destroyChild);
        this._bg = this._bar = null;
        this.changeHandler = null;
    }

    /**
     * @inheritDoc 
     * @override
    */
    protected createChildren(): void {
        this._bg = new Image();
        this._bg.left = 0;
        this._bg.right = 0;
        this._bg.top = 0;
        this._bg.bottom = 0;
        this._bg.hideFlags = HideFlags.HideAndDontSave;
        this.addChild(this._bg);

        this._bar = new Image();
        this._bar.hideFlags = HideFlags.HideAndDontSave;
        this._bar.top = 0;
        this._bar.bottom = 0;
        this.addChild(this._bar);
    }

    /**
     * @copy laya.ui.Image#skin
     */
    get skin(): string {
        return this._skin;
    }

    set skin(value: string) {
        if (this._skin == value)
            return;

        this._setSkin(value);
    }

    _setSkin(url: string): Promise<void> {
        this._skin = url;

        if (url) {
            return AssetDb.inst.resolveURL(url).then(url => {
                if (this._destroyed)
                    return null;

                if (this._skinBaseUrl)
                    url = URL.formatURL(url, this._skinBaseUrl);

                return Promise.all([
                    this._bg._setSkin(url),
                    this._bar._setSkin(Utils.replaceFileExtension(url, "$bar.png", true))
                ]).then(() => this._skinLoaded());
            });
        }
        else {
            this._bg.skin = null;
            this._bar.skin = null;
            this._skinLoaded();
            return Promise.resolve();
        }
    }

    protected _skinLoaded(): void {
        if (this._destroyed)
            return;

        this.callLater(this.changeValue);
        this._sizeChanged();
        this.event(Event.LOADED);
    }

    /**
     * @inheritDoc 
     * @override
    */
    protected measureWidth(): number {
        return this._bg.width;
    }

    /**
     * @inheritDoc 
     * @override
    */
    protected measureHeight(): number {
        return this._bg.height;
    }

    /**
     * 当前的进度量。
     * <p><b>取值：</b>介于0和1之间。</p>
     */
    get value(): number {
        return this._value;
    }

    set value(num: number) {
        if (this._value != num) {
            num = num > 1 ? 1 : num < 0 ? 0 : num;
            this._value = num;
            this.callLater(this.changeValue);
            this.event(Event.CHANGE);
            this.changeHandler && this.changeHandler.runWith(num);
        }
    }

    /**
     * @private
     * 更改进度值的显示。
     */
    protected changeValue(): void {
        if (this.sizeGrid) {
            let grid = this.sizeGrid.split(",");
            let left = parseInt(grid[3]);
            if (isNaN(left))
                left = 0;
            let right = parseInt(grid[1]);
            if (isNaN(right))
                right = 0;
            let max = this.width - left - right;
            let sw = max * this._value;
            this._bar.width = left + right + sw;
            this._bar.visible = this._bar.width > left + right;
        } else {
            this._bar.width = this.width * this._value;
        }
    }

    /**
     * 获取进度条对象。
     */
    get bar(): Image {
        return this._bar;
    }

    /**
     * 获取背景条对象。
     */
    get bg(): Image {
        return this._bg;
    }

    /**
     * <p>当前 <code>ProgressBar</code> 实例的进度条背景位图（ <code>Image</code> 实例）的有效缩放网格数据。</p>
     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
     */
    get sizeGrid(): string {
        return this._bg.sizeGrid;
    }

    set sizeGrid(value: string) {
        this._bg.sizeGrid = this._bar.sizeGrid = value;
    }

    /**
     * @inheritDoc 
     * @override
    */
    set_width(value: number): void {
        super.set_width(value);
        this.callLater(this.changeValue);
    }

    /**
     * @inheritDoc 
     * @override
    */
    set_dataSource(value: any): void {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.value = Number(value);
        else
            super.set_dataSource(value);
    }
}