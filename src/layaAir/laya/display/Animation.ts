import { Sprite } from "./Sprite";
import { AnimationWrapMode, FrameAnimation } from "../components/FrameAnimation";
import { HideFlags } from "../Const";
import { ILaya } from "../../ILaya";

/**
 * @en The Animation class is used to play frame animation.
 * @zh Animation 是用于播放序列帧动画的类。
 */
export class Animation extends Sprite {
    private _comp: FrameAnimation;
    private _labels: string[];

    /**
     * @deprecated
     * @en The animation template cache pool, stored as key-value pairs. 
     * @zh 动画模版缓存池，以key-value键值对存储
     */
    static readonly framesMap: Record<string, string[]> = {};

    /**
     * @en Constructor method of Animation.
     * @zh 动画类的构造方法
     */
    constructor() {
        super();

        this._comp = this.addComponent(FrameAnimation);
        this._comp.hideFlags |= HideFlags.HideAndDontSave;
        this._comp.autoPlay = false;
    }

    /**
     * @en Whether to loop playback. Default is true.
     * @zh 是否循环播放。默认为 true。
     */
    get loop() {
        return this._comp.loop;
    }

    set loop(value: boolean) {
        this._comp.loop = value;
    }

    /**
     * @en Playback order type.
     * @zh 播放顺序类型.
     */
    get wrapMode(): AnimationWrapMode {
        return this._comp.wrapMode;
    }

    set wrapMode(value: AnimationWrapMode) {
        this._comp.wrapMode = value;
    }

    /**
     * @en The interval between frame changes, in milliseconds.
     * @zh 帧改变之间的间隔时间，单位为毫秒。
     */
    get interval(): number {
        return this._comp.interval;
    }

    set interval(value: number) {
        this._comp.interval = value;
    }

    /**
     * @en The index of the current frame in the animation.
     * @zh 动画当前帧的索引。
     */
    get index(): number {
        return this._comp.index;
    }

    set index(value: number) {
        this._comp.index = value;
    }

    /**
     * @en The total number of frames in the current animation.
     * @zh 当前动画中帧的总数。
     */
    get count(): number {
        return this._comp.frames.length;
    }

    /**
     * @en Atlas path.
     * @zh 图集路径。
     */
    get source(): string {
        return this._comp.source;
    }

    set source(value: string) {
        this._comp.source = value;
    }

    /**
     * @en The image path array of the animation.
     * @zh 动画的图片路径数组。
     */
    get images(): string[] {
        return this._comp.images;
    }

    set images(value: string[]) {
        this._comp.images = value;
    }

    /**
     * @en Whether the animation is currently playing.
     * @zh 是否正在播放中。
     */
    get isPlaying(): boolean {
        return this._comp.isPlaying;
    }

    /**
     * @en Whether to auto-play, default is false. If set to true, the animation will automatically play after being created and added to the stage.
     * @zh 是否自动播放，默认为false。如果设置为true，则动画被创建并添加到舞台后自动播放。
     */
    set autoPlay(value: boolean) {
        this._comp.autoPlay = value;
    }

    get autoPlay() {
        return this._comp.autoPlay;
    }

    /**
    * @en Starts playing the animation. The play(...) method is designed to be called at any time after creating an instance.
    * When the corresponding resources are loaded, the animation frame filling method (set frames) is called, or the instance is displayed on the stage,
    * it will check if it's currently playing, and if so, it will start playing.
    * Combined with the wrapMode property, you can set the animation playback order type.
    * @param start (Optional) Specifies the starting index (int) or frame label (String) for animation playback. Frame labels can be added and removed using addLabel(...) and removeLabel(...).
    * @param loop (Optional) Whether to loop playback.
    * @param name (Optional) Animation name.
    * @zh 开始播放动画。play(...)方法被设计为在创建实例后的任何时候都可以被调用，当相应的资源加载完毕、调用动画帧填充方法(set frames)或者将实例显示在舞台上时，会判断是否正在播放中，如果是，则进行播放。
    * 配合wrapMode属性，可设置动画播放顺序类型。
    * @param start （可选）指定动画播放开始的索引(int)或帧标签(String)。帧标签可以通过addLabel(...)和removeLabel(...)进行添加和删除。
    * @param loop （可选）是否循环播放。
    * @param name （可选）动画名称。
    */
    play(start?: string | number, loop?: boolean, name: string = ""): void {
        if (name)
            this._setFramesFromCache(name, true);
        if (start != null)
            this._comp.index = (typeof (start) == 'string') ? this.getFrameByLabel(<string>start) : start;
        if (loop != null)
            this._comp.loop = loop;
        this._comp.play();
    }

    /**
     * @en Stops animation playback and clears object properties. It can then be stored in the object pool for easy object reuse.
     * @returns AnimationBase
     * @zh 停止动画播放，并清理对象属性。之后可存入对象池，方便对象复用。
     * @returns AnimationBase
     */
    clear(): this {
        this._comp.stop();
        this._comp.frames = null;
        this._labels = null;
        return this;
    }

    /**
     * @en Stop the animation playback.
     * @zh 停止动画播放。
     */
    stop(): void {
        this._comp.stop();
    }

    /**
     * @en Switch the animation to the specified frame and stop there.
     * @param position Frame index or frame label.
     * @zh 将动画切换到指定帧并停在那里。
     * @param position 帧索引或帧标签。
     */
    gotoAndStop(position: number | string): void {
        this.index = (typeof (position) == 'string') ? this.getFrameByLabel(position) : position;
        this.stop();
    }

    /**
     * @en Add a frame label to the specified frame index. When the animation plays to this frame, it will dispatch an Event.LABEL event after updating the current frame.
     * @param label The name of the frame label.
     * @param index The frame index.
     * @zh 增加一个帧标签到指定索引的帧上。当动画播放到此索引的帧时会派发Event.LABEL事件，派发事件是在完成当前帧画面更新之后。
     * @param label 帧标签名称。
     * @param index 帧索引。
     */
    addLabel(label: string, index: number): void {
        if (!this._labels)
            this._labels = [];
        this._labels[index] = label;
    }

    /**
     * @en Remove the specified frame label.
     * @param label The name of the frame label. Note: If empty, all frame labels will be deleted!
     * @zh 删除指定的帧标签。
     * @param label 帧标签名称。注意：如果为空，则删除所有帧标签！
     */
    removeLabel(label: string): void {
        if (!this._labels)
            return;

        for (let i = 0, n = this._labels.length; i < n; i++) {
            if (this._labels[i] == label) {
                delete this._labels[i];
            }
        }
    }

    /**
     * @en Load a series of images.
     * @param urls Image path collection. 
     * @returns Returns the Animation object itself.
     * @zh 载入一系列的图片。
     * @param urls 图片路径集合。
     * @returns 返回动画本身。
     */
    loadImages(urls: string[]): this {
        this._comp.images = urls;
        return this;
    }

    /**
     * @en Load the atlas.
     * @param url Atlas path.
     * @returns Returns the Animation object itself.
     * @zh 载入图集。
     * @param url 图集路径。
     * @return 返回动画本身。
     */
    loadAtlas(url: string): this {
        this._comp.source = url;
        return this;
    }

    protected getFrameByLabel(label: string): number {
        if (!this._labels)
            return 0;

        let i = this._labels.indexOf(label);
        return i != -1 ? i : 0;
    }

    /**
     * @deprecated
     * @en Creates an animation template. Multiple animations can share the same animation template without having to create a new one each time, thus saving the overhead of creating a Graphics collection.
     * @param url Atlas path or image path array. If it's an atlas path, the corresponding atlas needs to be preloaded. If it's not preloaded, it will cause creation failure.
     * @param name The key of the animation template in the animation template cache pool. If it's not empty, the animation template is cached with this as the key, otherwise it's not cached.
     * @returns Animation template.
     * @zh 创建动画模板，多个动画可共享同一份动画模板，而不必每次都创建一份新的，从而节省创建Graphics集合的开销。
     * @param	url	图集路径或者图片路径数组。如果是图集路径，需要相应图集已经被预加载，如果没有预加载，会导致创建失败。
     * @param	name 动画模板在动画模版缓存池中的key。如果不为空，则以此为key缓存动画模板，否则不缓存。
     * @return	动画模板。
     */
    static createFrames(urls: string[], key: string): void {
        Animation.framesMap[key] = urls;
        ILaya.loader.load(urls);
    }

    /**
     * @deprecated
     * @en Clears the animation data with the specified key value from the animation template cache pool.
     * When calling the function to create an animation template, developers can manually specify this value. For animation sets created by LayaAir IDE, the parsed key format is: "url#": represents the default animation template of the animation set, if this value is used as a parameter, it will clear the entire animation set data; "url#aniName": represents the animation template with the corresponding name.
     * @param key The key of the animation template in the animation template cache pool.
     * @zh 从动画模版缓存池中清除指定key值的动画数据。
     * 开发者在调用创建动画模版函数时，可以手动指定此值。而如果是由LayaAir IDE创建的动画集，解析后的key格式为："url#"：表示动画集的默认动画模版，如果以此值为参数，会清除整个动画集数据；"url#aniName"：表示相应名称的动画模版。
     * @param key 动画模板在动画模版缓存池中的key。
     */
    static clearCache(key: string): void {
        delete Animation.framesMap[key];
    }

    protected _setFramesFromCache(name: string, showWarn: boolean = false): boolean {
        let urls = Animation.framesMap[name];
        if (urls) {
            this.images = urls;
            return true;
        } else {
            if (showWarn) console.log("ani not found:", name);
        }
        return false;
    }
}