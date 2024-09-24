import { UIComponent } from "./UIComponent";
import { AutoBitmap } from "./AutoBitmap";
import { UIUtils } from "./UIUtils";
import { Styles } from "./Styles";
import { NodeFlags } from "../Const"
import { Event } from "../events/Event"
import { Loader } from "../net/Loader"
import { Texture } from "../resource/Texture"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";
import { URL } from "../net/URL";
/**
 * @en The `Clip` class is a bitmap slice animation.
 * `Clip` can split an image into a slice animation by horizontal split count `clipX`, vertical split count `clipY`, 
 * or horizontal split width `clipWidth`, vertical split height `clipHeight`, 
 * from left to right, from top to bottom.
 * The Image and Clip components are the only two components that support asynchronous loading, such as clip.skin = "abc/xxx.png". Other UI components do not support asynchronous loading.
 * @zh `Clip` 类是位图切片动画。
 * `Clip` 可将一张图片，按横向分割数量 `clipX` 、竖向分割数量 `clipY` ，
 * 或横向分割每个切片的宽度 `clipWidth` 、竖向分割每个切片的高度 `clipHeight` ，
 * 从左向右，从上到下，分割组合为一个切片动画。
 * Image和Clip组件是唯一支持异步加载的两个组件，比如clip.skin = "abc/xxx.png"，其他UI组件均不支持异步加载。
 */
export class Clip extends UIComponent {   
    protected _sources: Texture[];
    protected _skin: string;
    protected _clipX: number = 1;
    protected _clipY: number = 1;
    protected _clipWidth: number = 0;
    protected _clipHeight: number = 0;
    protected _autoPlay: boolean;
    protected _interval: number = 50;
    protected _complete: Handler;
    protected _isPlaying: boolean;
    protected _index: number = 0;
    protected _clipChanged: boolean;
    protected _group: string;
    protected _toIndex: number = -1;
    /**@internal */
    declare _graphics: AutoBitmap;

    /**
     * @en The address of the skin resource.
     * @zh 皮肤资源地址
     */
    get skin(): string {
        return this._skin;
    }
    set skin(value: string) {
        if (this._skin == value)
            return;

        this._setSkin(value);
    }

    /**
     * @en Number of slices on the X-axis (horizontal).
     * @zh X轴（横向）切片数量。
     */
    get clipX(): number {
        return this._clipX;
    }

    set clipX(value: number) {
        this._clipX = value || 1;
        this._setClipChanged()
    }

    /**
     * @en Number of slices on the Y-axis (vertical).
     * @zh Y轴(竖向)切片数量。
     */
    get clipY(): number {
        return this._clipY;
    }

    set clipY(value: number) {
        this._clipY = value || 1;
        this._setClipChanged()
    }

    /**
     * @en Width of each slice when dividing horizontally. Takes precedence over `clipX` when set together with `clipX`.
     * @zh 横向分割时每个切片的宽度，与 `clipX` 同时设置时优先级高于 `clipX` 。
     */
    get clipWidth(): number {
        return this._clipWidth;
    }

    set clipWidth(value: number) {
        this._clipWidth = value;
        this._setClipChanged()
    }

     /**
     * @en Height of each slice when dividing vertically. Takes precedence over `clipY` when set together with `clipY`.
     * @zh 竖向分割时每个切片的高度，与 `clipY` 同时设置时优先级高于 `clipY` 。
     */
    get clipHeight(): number {
        return this._clipHeight;
    }

    set clipHeight(value: number) {
        this._clipHeight = value;
        this._setClipChanged()
    }

    /**
     * @en Source data.
     * @zh 源数据。
     */
    get sources(): Texture[] {
        return this._sources;
    }

    set sources(value: Texture[]) {
        this._sources = value;
        this.index = this._index;
        this.event(Event.LOADED);
    }

     /**
     * @en Resource group.
     * @zh 资源分组。
     */
    get group(): string {
        return this._group;
    }

    set group(value: string) {
        if (value && this._skin) Loader.setGroup(this._skin, value);
        this._group = value;
    }

    /**
     * @en The size grid of the texture.
     * The size grid is a 3x3 division of the texture, allowing it to be scaled without distorting the corners and edges. 
     * The array contains five values representing the top, right, bottom, and left margins, and whether to repeat the fill (0: no repeat, 1: repeat). 
     * The values are separated by commas. For example: "6,6,6,6,1".
     * @zh 纹理的九宫格数据。
     * 九宫格是一种将纹理分成3x3格的方式，使得纹理缩放时保持角和边缘不失真。
     * 数组包含五个值，分别代表上边距、右边距、下边距、左边距以及是否重复填充（0：不重复填充，1：重复填充）。
     * 值以逗号分隔。例如："6,6,6,6,1"。
     */
    get sizeGrid(): string {
        if (this._graphics.sizeGrid) return this._graphics.sizeGrid.join(",");
        return null;
    }

    set sizeGrid(value: string) {
        if (value)
            this._graphics.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
        else
            this._graphics.sizeGrid = null;
    }

    /**
     * @en Current frame index.
     * @zh 当前帧索引。
     */
    get index(): number {
        return this._index;
    }

    set index(value: number) {
        this._index = value;
        this._graphics && (this._graphics.source = this._sources[value]);
        this.event(Event.CHANGE);
    }

    /**
     * @en Total frames of the slice animation.
     * @zh 切片动画的总帧数。
     */
    get total(): number {
        this.runCallLater(this.changeClip);
        return this._sources.length;
    }

    /**
     * @en Indicates whether the slice animation is automatically played. If true, the slice animation is automatically played; otherwise, it is not.
     * It can control the playback and stop of the slice animation.
     * @zh 是否自动播放切片动画，若自动播放值为true,否则值为false。
     * 可控制切片动画的播放、停止。
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
     * @en Indicates the interval (in milliseconds) at which the slice animation is played.
     * @zh 切片动画播放间隔时间（以毫秒为单位）。
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
     * @en Indicates the current playback state of the slice animation.
     * If the slice animation is playing, the value is true; otherwise, it is false.
     * @zh 切片动画的当前播放状态。
     * 如果切片动画正在播放中，则为true，否则为false。
     */
    get isPlaying(): boolean {
        return this._isPlaying;
    }

    set isPlaying(value: boolean) {
        this._isPlaying = value;
    }

    /**
     * @en 'Clip' constructor.
     * @param url Resource address.
     * @param clipX Number of divisions in the X direction.
     * @param clipY Number of divisions in the Y direction.
     * @zh  `Clip` 构造函数。
     * @param url 资源地址。
     * @param clipX X方向分割数量。
     * @param clipY Y方向分割数量。
     */
    constructor(url: string = null, clipX: number = 1, clipY: number = 1) {
        super();

        this._sources = [];
        this._clipX = clipX;
        this._clipY = clipY;
        this.skin = url;
    }

    protected _onDisplay(e?: boolean): void {
        if (this._isPlaying) {
            if (this._getBit(NodeFlags.DISPLAYED_INSTAGE)) this.play();
            else this.stop();
        } else if (this._autoPlay) {
            this.play();
        }
    }

    /**@internal */
    _setSkin(url: string): Promise<void> {
        this._skin = url;
        if (url) {
            if (this._skinBaseUrl)
                url = URL.formatURL(url, this._skinBaseUrl);
            if (!Loader.getRes(url))
                return ILaya.loader.load(url, Loader.IMAGE).then(() => this._skinLoaded());
            else {
                this._skinLoaded();
                return Promise.resolve();
            }
        }
        else {
            this._graphics.source = null;
            return Promise.resolve();
        }
    }

    protected _skinLoaded(): void {
        if (this._destroyed)
            return;

        this._setClipChanged();
        this._sizeChanged();
        this.event(Event.LOADED);
    }

    protected _setClipChanged(): void {
        if (!this._clipChanged) {
            this._clipChanged = true;
            this.callLater(this.changeClip);
        }
    }

    /**
     * @internal
     */
    _setWidth(value: number) {
        super._setWidth(value);
        this._graphics.width = value;
    }

    /**
     * @internal
     */
    _setHeight(value: number) {
        super._setHeight(value);
        this._graphics.height = value;
    }

    protected _loop(): void {
        if (this._visible) {
            this._index++;
            if (this._toIndex > -1 && this._index >= this._toIndex)
                this.stop();
            else if (this._index >= this._sources.length)
                this._index = 0;
            this.index = this._index;
        }
    }
    protected createChildren(): void {
        this.setGraphics(new AutoBitmap(), true);
    }

    /**
     * @en Changes the resources and size of the slices.
     * @zh 改变切片的资源、切片的大小。
     */
    protected changeClip(): void {
        this._clipChanged = false;
        if (!this._skin || this._destroyed) return;

        let url = this._skinBaseUrl ? URL.formatURL(this._skin, this._skinBaseUrl) : this._skin;

        let img: any = Loader.getRes(url);
        if (img) {
            this.loadComplete(this._skin, img);
        } else {
            ILaya.loader.load(url, Handler.create(this, this.loadComplete, [this._skin]), null, Loader.IMAGE);
        }
    }

    /**
     * @en Callback function when the sliced image resources are loaded.
     * @param url Resource URL.
     * @param img Texture.
     * @zh 加载切片图片资源完成函数。
     * @param url 资源地址。
     * @param img 纹理。
     */
    protected loadComplete(url: string, img: Texture): void {
        if (url !== this._skin)
            return;

        this._sources.length = 0;
        if (img) {
            var w: number = this._clipWidth || Math.ceil(img.sourceWidth / this._clipX);
            var h: number = this._clipHeight || Math.ceil(img.sourceHeight / this._clipY);

            for (let i = 0; i < this._clipY; i++) {
                for (let j = 0; j < this._clipX; j++) {
                    this._sources.push(img.getCachedClip(w * j, h * i, w, h));
                }
            }
        }

        this.index = this._index;
        this.event(Event.LOADED);
        this.onCompResize();
    }

    protected measureWidth(): number {
        this.runCallLater(this.changeClip);
        return this._graphics.width;
    }

    protected measureHeight(): number {
        this.runCallLater(this.changeClip);
        return this._graphics.height;
    }

    /**
     * @en Plays the slice animation.
     * @param from Start index.
     * @param to End index, -1 is not limited.
     * @zh 播放切片动画。
     * @param	from	开始索引
     * @param	to		结束索引，-1为不限制
     */
    play(from: number = 0, to: number = -1): void {
        this._setClipChanged();
        this._isPlaying = true;
        this.index = from;
        this._toIndex = to;
        // this._index++;
        //修复clip重复播放丢失帧的问题
        ILaya.timer.loop(this.interval, this, this._loop);

        this.on(Event.DISPLAY, this, this._onDisplay);
        this.on(Event.UNDISPLAY, this, this._onDisplay);
    }

    /**
     * @en Stops the slice animation.
     * @zh 停止切片动画。
     */
    stop(): void {
        this._isPlaying = false;
        ILaya.timer.clear(this, this._loop);
        this.event(Event.COMPLETE);
    }
    set_dataSource(value: any): void {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.index = parseInt(value as string);
        else
            super.set_dataSource(value);
    }

}