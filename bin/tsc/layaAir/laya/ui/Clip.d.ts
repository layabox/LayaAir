import { UIComponent } from "./UIComponent";
import { AutoBitmap } from "./AutoBitmap";
import { Texture } from "../resource/Texture";
import { Handler } from "../utils/Handler";
/**
 * 图片加载完成后调度。
 * @eventType Event.LOADED
 */
/**
 * 当前帧发生变化后调度。
 * @eventType laya.events.Event
 */
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
export declare class Clip extends UIComponent {
    /**@private */
    protected _sources: any[];
    /**@private */
    protected _bitmap: AutoBitmap;
    /**@private */
    protected _skin: string;
    /**@private */
    protected _clipX: number;
    /**@private */
    protected _clipY: number;
    /**@private */
    protected _clipWidth: number;
    /**@private */
    protected _clipHeight: number;
    /**@private */
    protected _autoPlay: boolean;
    /**@private */
    protected _interval: number;
    /**@private */
    protected _complete: Handler;
    /**@private */
    protected _isPlaying: boolean;
    /**@private */
    protected _index: number;
    /**@private */
    protected _clipChanged: boolean;
    /**@private */
    protected _group: string;
    /**@private */
    protected _toIndex: number;
    /**
     * 创建一个新的 <code>Clip</code> 示例。
     * @param url 资源类库名或者地址
     * @param clipX x方向分割个数
     * @param clipY y方向分割个数
     */
    constructor(url?: string, clipX?: number, clipY?: number);
    /**@inheritDoc */
    destroy(destroyChild?: boolean): void;
    /**
     * 销毁对象并释放加载的皮肤资源。
     */
    dispose(): void;
    /**@inheritDoc */
    protected createChildren(): void;
    /**@private	 */
    protected _onDisplay(e?: boolean): void;
    /**
     * @copy laya.ui.Image#skin
     */
    skin: string;
    protected _skinLoaded(): void;
    /**X轴（横向）切片数量。*/
    clipX: number;
    /**Y轴(竖向)切片数量。*/
    clipY: number;
    /**
     * 横向分割时每个切片的宽度，与 <code>clipX</code> 同时设置时优先级高于 <code>clipX</code> 。
     */
    clipWidth: number;
    /**
     * 竖向分割时每个切片的高度，与 <code>clipY</code> 同时设置时优先级高于 <code>clipY</code> 。
     */
    clipHeight: number;
    /**
     * @private
     * 改变切片的资源、切片的大小。
     */
    protected changeClip(): void;
    /**
     * @private
     * 加载切片图片资源完成函数。
     * @param url 资源地址。
     * @param img 纹理。
     */
    protected loadComplete(url: string, img: Texture): void;
    /**
     * 源数据。
     */
    sources: any[];
    /**
     * 资源分组。
     */
    group: string;
    /**@inheritDoc */
    width: number;
    /**@inheritDoc */
    height: number;
    /**@inheritDoc */
    protected measureWidth(): number;
    /**@inheritDoc */
    protected measureHeight(): number;
    /**
     * <p>当前实例的位图 <code>AutoImage</code> 实例的有效缩放网格数据。</p>
     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
     * @see laya.ui.AutoBitmap.sizeGrid
     */
    sizeGrid: string;
    /**
     * 当前帧索引。
     */
    index: number;
    /**
     * 切片动画的总帧数。
     */
    readonly total: number;
    /**
     * 表示是否自动播放动画，若自动播放值为true,否则值为false;
     * <p>可控制切片动画的播放、停止。</p>
     */
    autoPlay: boolean;
    /**
     * 表示动画播放间隔时间(以毫秒为单位)。
     */
    interval: number;
    /**
     * 表示动画的当前播放状态。
     * 如果动画正在播放中，则为true，否则为flash。
     */
    isPlaying: boolean;
    /**
     * 播放动画。
     * @param	from	开始索引
     * @param	to		结束索引，-1为不限制
     */
    play(from?: number, to?: number): void;
    /**
     * @private
     */
    protected _loop(): void;
    /**
     * 停止动画。
     */
    stop(): void;
    /**@inheritDoc */
    dataSource: any;
    /**
     * <code>AutoBitmap</code> 位图实例。
     */
    readonly bitmap: AutoBitmap;
    /**@private */
    protected _setClipChanged(): void;
}
