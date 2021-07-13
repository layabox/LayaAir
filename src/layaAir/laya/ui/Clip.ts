import { UIComponent } from "./UIComponent";
import { AutoBitmap } from "./AutoBitmap";
import { UIUtils } from "./UIUtils";
import { Styles } from "./Styles";
import { Const } from "../Const"
import { Event } from "../events/Event"
import { Loader } from "../net/Loader"
import { Texture } from "../resource/Texture"
import { Handler } from "../utils/Handler"
import { Utils } from "../utils/Utils"
import { WeakObject } from "../utils/WeakObject"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

/**
 * 图片加载完成后调度。
 * @eventType Event.LOADED
 */
/*[Event(name = "loaded", type = "laya.events.Event")]*/
/**
 * 当前帧发生变化后调度。
 * @eventType laya.events.Event
 */
/*[Event(name = "change", type = "laya.events.Event")]*/

/**
 * <p> <code>Clip</code> 类是位图切片动画。</p>
 * <p> <code>Clip</code> 可将一张图片，按横向分割数量 <code>clipX</code> 、竖向分割数量 <code>clipY</code> ，
 * 或横向分割每个切片的宽度 <code>clipWidth</code> 、竖向分割每个切片的高度 <code>clipHeight</code> ，
 * 从左向右，从上到下，分割组合为一个切片动画。</p>
 * Image和Clip组件是唯一支持异步加载的两个组件，比如clip.skin = "abc/xxx.png"，其他UI组件均不支持异步加载。
 *
 * @example <caption>以下示例代码，创建了一个 <code>Clip</code> 实例。</caption>
 * package
 *	{
 *		import laya.ui.Clip;
 *		public class Clip_Example
 *		{
 *			private var clip:Clip;
 *			public function Clip_Example()
 *			{
 *				Laya.init(640, 800);//设置游戏画布宽高。
 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *				onInit();
 *			}
 *			private function onInit():void
 *			{
 *				clip = new Clip("resource/ui/clip_num.png", 10, 1);//创建一个 Clip 类的实例对象 clip ,传入它的皮肤skin和横向分割数量、竖向分割数量。
 *				clip.autoPlay = true;//设置 clip 动画自动播放。
 *				clip.interval = 100;//设置 clip 动画的播放时间间隔。
 *				clip.x = 100;//设置 clip 对象的属性 x 的值，用于控制 clip 对象的显示位置。
 *				clip.y = 100;//设置 clip 对象的属性 y 的值，用于控制 clip 对象的显示位置。
 *				clip.on(Event.CLICK, this, onClick);//给 clip 添加点击事件函数侦听。
 *				Laya.stage.addChild(clip);//将此 clip 对象添加到显示列表。
 *			}
 *			private function onClick():void
 *			{
 *				trace("clip 的点击事件侦听处理函数。clip.total="+ clip.total);
 *				if (clip.isPlaying == true)
 *				{
 *					clip.stop();//停止动画。
 *				}else {
 *					clip.play();//播放动画。
 *				}
 *			}
 *		}
 *	}
 * @example
 * Laya.init(640, 800);//设置游戏画布宽高
 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
 * var clip;
 * Laya.loader.load("resource/ui/clip_num.png",laya.utils.Handler.create(this,loadComplete));//加载资源
 * function loadComplete() {
 *     console.log("资源加载完成！");
 *     clip = new laya.ui.Clip("resource/ui/clip_num.png",10,1);//创建一个 Clip 类的实例对象 clip ,传入它的皮肤skin和横向分割数量、竖向分割数量。
 *     clip.autoPlay = true;//设置 clip 动画自动播放。
 *     clip.interval = 100;//设置 clip 动画的播放时间间隔。
 *     clip.x =100;//设置 clip 对象的属性 x 的值，用于控制 clip 对象的显示位置。
 *     clip.y =100;//设置 clip 对象的属性 y 的值，用于控制 clip 对象的显示位置。
 *     clip.on(Event.CLICK,this,onClick);//给 clip 添加点击事件函数侦听。
 *     Laya.stage.addChild(clip);//将此 clip 对象添加到显示列表。
 * }
 * function onClick()
 * {
 *     console.log("clip 的点击事件侦听处理函数。");
 *     if(clip.isPlaying == true)
 *     {
 *         clip.stop();
 *     }else {
 *         clip.play();
 *     }
 * }
 * @example
 * import Clip = laya.ui.Clip;
 * import Handler = laya.utils.Handler;
 * class Clip_Example {
 *     private clip: Clip;
 *     constructor() {
 *         Laya.init(640, 800);//设置游戏画布宽高。
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         this.onInit();
 *     }
 *     private onInit(): void {
 *         this.clip = new Clip("resource/ui/clip_num.png", 10, 1);//创建一个 Clip 类的实例对象 clip ,传入它的皮肤skin和横向分割数量、竖向分割数量。
 *         this.clip.autoPlay = true;//设置 clip 动画自动播放。
 *         this.clip.interval = 100;//设置 clip 动画的播放时间间隔。
 *         this.clip.x = 100;//设置 clip 对象的属性 x 的值，用于控制 clip 对象的显示位置。
 *         this.clip.y = 100;//设置 clip 对象的属性 y 的值，用于控制 clip 对象的显示位置。
 *         this.clip.on(laya.events.Event.CLICK, this, this.onClick);//给 clip 添加点击事件函数侦听。
 *         Laya.stage.addChild(this.clip);//将此 clip 对象添加到显示列表。
 *     }
 *     private onClick(): void {
 *         console.log("clip 的点击事件侦听处理函数。clip.total=" + this.clip.total);
 *         if (this.clip.isPlaying == true) {
 *             this.clip.stop();//停止动画。
 *         } else {
 *             this.clip.play();//播放动画。
 *         }
 *     }
 * }
 *
 */
export class Clip extends UIComponent {
    /**@private */
    protected _sources: any[];
    /**@private */
    protected _bitmap: AutoBitmap;
    /**@private */
    protected _skin: string;
    /**@private */
    protected _clipX: number = 1;
    /**@private */
    protected _clipY: number = 1;
    /**@private */
    protected _clipWidth: number = 0;
    /**@private */
    protected _clipHeight: number = 0;
    /**@private */
    protected _autoPlay: boolean;
    /**@private */
    protected _interval: number = 50;
    /**@private */
    protected _complete: Handler;
    /**@private */
    protected _isPlaying: boolean;
    /**@private */
    protected _index: number = 0;
    /**@private */
    protected _clipChanged: boolean;
    /**@private */
    protected _group: string;
    /**@private */
    protected _toIndex: number = -1;

    /**
     * 创建一个新的 <code>Clip</code> 示例。
     * @param url 资源类库名或者地址
     * @param clipX x方向分割个数
     * @param clipY y方向分割个数
     */
    constructor(url: string = null, clipX: number = 1, clipY: number = 1) {
        super();
        this._clipX = clipX;
        this._clipY = clipY;
        this.skin = url;
    }

    /**
     * @inheritDoc 
     * @override
     */
	destroy(destroyChild: boolean = true): void {
        super.destroy(true);
        this._bitmap && this._bitmap.destroy();
        this._bitmap = null;
        this._sources = null;
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
    }

    /**@private	 @override*/
    protected _onDisplay(e?: boolean): void {
        if (this._isPlaying) {
            if (this._getBit(Const.DISPLAYED_INSTAGE)) this.play();
            else this.stop();
        } else if (this._autoPlay) {
            this.play();
        }
    }

    /**
     * @copy laya.ui.Image#skin
     */
    get skin(): string {
        return this._skin;
    }

    set skin(value: string) {
        if (this._skin != value) {
            this._skin = value;
            if (value) {
                if (!Loader.getRes(value)) {
                    ILaya.loader.load(this._skin, Handler.create(this, this._skinLoaded), null, Loader.IMAGE, 1);
                } else {
                    this._skinLoaded();
                }
            } else {
                this._bitmap.source = null;
            }
        }
    }

    protected _skinLoaded(): void {
        this._setClipChanged();
        this._sizeChanged();
        this.event(Event.LOADED);
    }

    /**X轴（横向）切片数量。*/
    get clipX(): number {
        return this._clipX;
    }

    set clipX(value: number) {
        this._clipX = value || 1;
        this._setClipChanged()
    }

    /**Y轴(竖向)切片数量。*/
    get clipY(): number {
        return this._clipY;
    }

    set clipY(value: number) {
        this._clipY = value || 1;
        this._setClipChanged()
    }

    /**
     * 横向分割时每个切片的宽度，与 <code>clipX</code> 同时设置时优先级高于 <code>clipX</code> 。
     */
    get clipWidth(): number {
        return this._clipWidth;
    }

    set clipWidth(value: number) {
        this._clipWidth = value;
        this._setClipChanged()
    }

    /**
     * 竖向分割时每个切片的高度，与 <code>clipY</code> 同时设置时优先级高于 <code>clipY</code> 。
     */
    get clipHeight(): number {
        return this._clipHeight;
    }

    set clipHeight(value: number) {
        this._clipHeight = value;
        this._setClipChanged()
    }

    /**
     * @private
     * 改变切片的资源、切片的大小。
     */
    protected changeClip(): void {
        this._clipChanged = false;
        if (!this._skin || this.destroyed) return;
        var img: any = Loader.getRes(this._skin);
        if (img) {
            this.loadComplete(this._skin, img);
        } else {
            ILaya.loader.load(this._skin, Handler.create(this, this.loadComplete, [this._skin]));
        }
    }

    /**
     * @private
     * 加载切片图片资源完成函数。
     * @param url 资源地址。
     * @param img 纹理。
     */
    protected loadComplete(url: string, img: Texture): void {
        if (url === this._skin && img) {
            var w: number = this._clipWidth || Math.ceil(img.sourceWidth / this._clipX);
            var h: number = this._clipHeight || Math.ceil(img.sourceHeight / this._clipY);

            var key: string = this._skin + w + h;
            var clips: any[] = WeakObject.I.get(key);
            if (!Utils.isOkTextureList(clips)) {
                clips = null;
            }
            if (clips) this._sources = clips;
            else {
                this._sources = [];
                for (var i: number = 0; i < this._clipY; i++) {
                    for (var j: number = 0; j < this._clipX; j++) {
                        this._sources.push(Texture.createFromTexture(img, w * j, h * i, w, h));
                    }
                }
                WeakObject.I.set(key, this._sources);
            }

            this.index = this._index;
            this.event(Event.LOADED);
            this.onCompResize();
        }
    }

    /**
     * 源数据。
     */
    get sources(): any[] {
        return this._sources;
    }

    set sources(value: any[]) {
        this._sources = value;
        this.index = this._index;
        this.event(Event.LOADED);
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
     * @inheritDoc 
     * @override
     */
	set width(value: number) {
        super.width = value;
        this._bitmap.width = value;
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
        this._bitmap.height = value;
    }
    /**
     * @inheritDoc 
     * @override
     */
    get height() {
        return super.height;
    }

    /**
     * @inheritDoc 
     * @override
     */
	protected measureWidth(): number {
        this.runCallLater(this.changeClip);
        return this._bitmap.width;
    }

    /**
     * @inheritDoc 
     * @override
     */
	protected measureHeight(): number {
        this.runCallLater(this.changeClip);
        return this._bitmap.height;
    }

    /**
     * <p>当前实例的位图 <code>AutoImage</code> 实例的有效缩放网格数据。</p>
     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
     * @see laya.ui.AutoBitmap.sizeGrid
     */
    get sizeGrid(): string {
        if (this._bitmap.sizeGrid) return this._bitmap.sizeGrid.join(",");
        return null;
    }

    set sizeGrid(value: string) {
        this._bitmap.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
    }

    /**
     * 当前帧索引。
     */
    get index(): number {
        return this._index;
    }

    set index(value: number) {
        this._index = value;
        this._bitmap && this._sources && (this._bitmap.source = this._sources[value]);
        this.event(Event.CHANGE);
    }

    /**
     * 切片动画的总帧数。
     */
    get total(): number {
        this.runCallLater(this.changeClip);
        return this._sources ? this._sources.length : 0;
    }

    /**
     * 表示是否自动播放动画，若自动播放值为true,否则值为false;
     * <p>可控制切片动画的播放、停止。</p>
     */
    get autoPlay(): boolean {
        return this._autoPlay;
    }

    set autoPlay(value: boolean) {
        if (this._autoPlay != value) {
            this._autoPlay = value;
            value ? this.play() : this.stop();
        }
    }

    /**
     * 表示动画播放间隔时间(以毫秒为单位)。
     */
    get interval(): number {
        return this._interval;
    }

    set interval(value: number) {
        if (this._interval != value) {
            this._interval = value;
            if (this._isPlaying) this.play();
        }
    }

    /**
     * 表示动画的当前播放状态。
     * 如果动画正在播放中，则为true，否则为flash。
     */
    get isPlaying(): boolean {
        return this._isPlaying;
    }

    set isPlaying(value: boolean) {
        this._isPlaying = value;
    }

    /**
     * 播放动画。
     * @param	from	开始索引
     * @param	to		结束索引，-1为不限制
     */
    play(from: number = 0, to: number = -1): void {
        this._isPlaying = true;
        this.index = from;
        this._toIndex = to;
        this._index++;
        ILaya.timer.loop(this.interval, this, this._loop);

        this.on(Event.DISPLAY, this, this._onDisplay);
        this.on(Event.UNDISPLAY, this, this._onDisplay);
    }

    /**
     * @private
     */
    protected _loop(): void {
        if (this._visible && this._sources) {
            this._index++;
            if (this._toIndex > -1 && this._index >= this._toIndex) this.stop();
            else if (this._index >= this._sources.length) this._index = 0;
            this.index = this._index;
        }
    }

    /**
     * 停止动画。
     */
    stop(): void {
        this._isPlaying = false;
        ILaya.timer.clear(this, this._loop);
        this.event(Event.COMPLETE);
    }

    /**
     * @inheritDoc 
     * @override
     */
    set dataSource(value: any) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string') this.index = parseInt(value as string);
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
     * <code>AutoBitmap</code> 位图实例。
     */
    get bitmap(): AutoBitmap {
        return this._bitmap;
    }

    /**@private */
    protected _setClipChanged(): void {
        if (!this._clipChanged) {
            this._clipChanged = true;
            this.callLater(this.changeClip);
        }
    }
}

ILaya.regClass(Clip);
ClassUtils.regClass("laya.ui.Clip", Clip);
ClassUtils.regClass("Laya.Clip", Clip);