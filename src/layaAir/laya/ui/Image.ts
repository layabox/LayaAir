import { Styles } from "./Styles";
import { Event } from "../events/Event"
import { Loader } from "../net/Loader"
import { Texture } from "../resource/Texture"
import { AutoBitmap } from "./AutoBitmap"
import { UIComponent } from "./UIComponent"
import { UIUtils } from "./UIUtils"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

/**
 * 资源加载完成后调度。
 * @eventType Event.LOADED
 */
/*[Event(name = "loaded", type = "laya.events.Event")]*/

/**
 * <code>Image</code> 类是用于表示位图图像或绘制图形的显示对象。
 * Image和Clip组件是唯一支持异步加载的两个组件，比如img.skin = "abc/xxx.png"，其他UI组件均不支持异步加载。
 * 
 * @example <caption>以下示例代码，创建了一个新的 <code>Image</code> 实例，设置了它的皮肤、位置信息，并添加到舞台上。</caption>
 *	package
 *	 {
 *		import laya.ui.Image;
 *		public class Image_Example
 *		{
 *			public function Image_Example()
 *			{
 *				Laya.init(640, 800);//设置游戏画布宽高。
 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *				onInit();
 *			}
 *			private function onInit():void
 *	 		{
 *				var bg:Image = new Image("resource/ui/bg.png");//创建一个 Image 类的实例对象 bg ,并传入它的皮肤。
 *				bg.x = 100;//设置 bg 对象的属性 x 的值，用于控制 bg 对象的显示位置。
 *				bg.y = 100;//设置 bg 对象的属性 y 的值，用于控制 bg 对象的显示位置。
 *				bg.sizeGrid = "40,10,5,10";//设置 bg 对象的网格信息。
 *				bg.width = 150;//设置 bg 对象的宽度。
 *				bg.height = 250;//设置 bg 对象的高度。
 *				Laya.stage.addChild(bg);//将此 bg 对象添加到显示列表。
 *				var image:Image = new Image("resource/ui/image.png");//创建一个 Image 类的实例对象 image ,并传入它的皮肤。
 *				image.x = 100;//设置 image 对象的属性 x 的值，用于控制 image 对象的显示位置。
 *				image.y = 100;//设置 image 对象的属性 y 的值，用于控制 image 对象的显示位置。
 *				Laya.stage.addChild(image);//将此 image 对象添加到显示列表。
 *			}
 *		}
 *	 }
 * @example
 * Laya.init(640, 800);//设置游戏画布宽高
 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
 * onInit();
 * function onInit() {
 *     var bg = new laya.ui.Image("resource/ui/bg.png");//创建一个 Image 类的实例对象 bg ,并传入它的皮肤。
 *     bg.x = 100;//设置 bg 对象的属性 x 的值，用于控制 bg 对象的显示位置。
 *     bg.y = 100;//设置 bg 对象的属性 y 的值，用于控制 bg 对象的显示位置。
 *     bg.sizeGrid = "40,10,5,10";//设置 bg 对象的网格信息。
 *     bg.width = 150;//设置 bg 对象的宽度。
 *     bg.height = 250;//设置 bg 对象的高度。
 *     Laya.stage.addChild(bg);//将此 bg 对象添加到显示列表。
 *     var image = new laya.ui.Image("resource/ui/image.png");//创建一个 Image 类的实例对象 image ,并传入它的皮肤。
 *     image.x = 100;//设置 image 对象的属性 x 的值，用于控制 image 对象的显示位置。
 *     image.y = 100;//设置 image 对象的属性 y 的值，用于控制 image 对象的显示位置。
 *     Laya.stage.addChild(image);//将此 image 对象添加到显示列表。
 * }
 * @example
 * class Image_Example {
 *     constructor() {
 *         Laya.init(640, 800);//设置游戏画布宽高。
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         this.onInit();
 *     }
 *     private onInit(): void {
 *         var bg: laya.ui.Image = new laya.ui.Image("resource/ui/bg.png");//创建一个 Image 类的实例对象 bg ,并传入它的皮肤。
 *         bg.x = 100;//设置 bg 对象的属性 x 的值，用于控制 bg 对象的显示位置。
 *         bg.y = 100;//设置 bg 对象的属性 y 的值，用于控制 bg 对象的显示位置。
 *         bg.sizeGrid = "40,10,5,10";//设置 bg 对象的网格信息。
 *         bg.width = 150;//设置 bg 对象的宽度。
 *         bg.height = 250;//设置 bg 对象的高度。
 *         Laya.stage.addChild(bg);//将此 bg 对象添加到显示列表。
 *         var image: laya.ui.Image = new laya.ui.Image("resource/ui/image.png");//创建一个 Image 类的实例对象 image ,并传入它的皮肤。
 *         image.x = 100;//设置 image 对象的属性 x 的值，用于控制 image 对象的显示位置。
 *         image.y = 100;//设置 image 对象的属性 y 的值，用于控制 image 对象的显示位置。
 *         Laya.stage.addChild(image);//将此 image 对象添加到显示列表。
 *     }
 * }
 * @see laya.ui.AutoBitmap
 */
export class Image extends UIComponent {
    /**@internal */
    _bitmap: AutoBitmap;
    /**@private */
    protected _skin: string;
    /**@private */
    protected _group: string;

    /**
     * 创建一个 <code>Image</code> 实例。
     * @param skin 皮肤资源地址。
     */
    constructor(skin: string|null = null) {
        super();
        this.skin = skin;
    }

    /**
     * @inheritDoc 
     * @override
     */
	destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._bitmap && this._bitmap.destroy();
        this._bitmap = null;
    }

    /**
     * 销毁对象并释放加载的皮肤资源。
     */
    dispose(): void {
        this.destroy(true);
        ILaya.loader.clearRes(this._skin);
    }

    /**
     * @inheritDoc 
     * @override
     */
	protected createChildren(): void {
        this.graphics = this._bitmap = new AutoBitmap();
        this._bitmap.autoCacheCmd = false;
    }

    /**
     * <p>对象的皮肤地址，以字符串表示。</p>
     * <p>如果资源未加载，则先加载资源，加载完成后应用于此对象。</p>
     * <b>注意：</b>资源加载完成后，会自动缓存至资源库中。
     */
    get skin(): string {
        return this._skin;
    }

    set skin(value: string) {
        if (this._skin != value) {
            this._skin = value;
            if (value) {
                var source = Loader.getRes(value) as Texture;
                if (source) {
                    this.source = source;
                    this.onCompResize();
                } else ILaya.loader.load(this._skin, Handler.create(this, this.setSource, [this._skin]), null, Loader.IMAGE, 1, true, this._group);
            } else {
                this.source = null;
            }
        }
    }

    /**
     * @copy laya.ui.AutoBitmap#source
     */
    get source(): Texture {
        return this._bitmap.source;
    }

    set source(value: Texture) {
        if (!this._bitmap) return;
        this._bitmap.source = value;
        this.event(Event.LOADED);
        this.repaint();
    }

    /**
     * 资源分组。
     */
    get group(): string {
        return this._group;
    }

    set group(value: string) {
        if (value && this._skin) Loader.setGroup(this._skin, value);
        this._group = value;
    }
    /**
     * @private
     * 设置皮肤资源。
     */
    protected setSource(url: string, img: any = null): void {
        if (url === this._skin && img) {
            this.source = img
            this.onCompResize();
        }
    }

    /**
     * @inheritDoc 
     * @override
     */
	protected measureWidth(): number {
        return this._bitmap.width;
    }

    /**
     * @inheritDoc 
     * @override
     */
	protected measureHeight(): number {
        return this._bitmap.height;
    }

    /**
     * @inheritDoc 
     * @override
     */
	set width(value: number) {
        super.width = value;
        this._bitmap.width = value == 0 ? 0.0000001 : value;
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
        this._bitmap.height = value == 0 ? 0.0000001 : value;
    }
    /**
     * @inheritDoc 
     * @override
     */
    get height() {
        return super.height;
    }

    /**
     * <p>当前实例的位图 <code>AutoImage</code> 实例的有效缩放网格数据。</p>
     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
     * <ul><li>例如："4,4,4,4,1"。</li></ul></p>
     * @see laya.ui.AutoBitmap#sizeGrid
     */
    get sizeGrid(): string {
        if (this._bitmap.sizeGrid) return this._bitmap.sizeGrid.join(",");
        return null;
    }

    set sizeGrid(value: string) {
        this._bitmap.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
    }

    /**
     * @inheritDoc 
     * @override
     */
    set dataSource(value: any) {
        this._dataSource = value;
        if (typeof (value) == 'string') this.skin = value as string;
        else super.dataSource = value;
    }
    /**
     * @inheritDoc 
     * @override
     */
    get dataSource() {
        return super.dataSource;
    }
}


ILaya.regClass(Image);
ClassUtils.regClass("laya.ui.Image", Image);
ClassUtils.regClass("Laya.Image", Image);