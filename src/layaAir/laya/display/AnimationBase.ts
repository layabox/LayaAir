import { Sprite } from "./Sprite";
import { Config } from "./../../Config";
import { NodeFlags } from "../Const"
import { Event } from "../events/Event"

/**
 * @en Base class for animations, providing basic animation playback control methods and frame label event-related functionality.
 * This class can be inherited, but should not be instantiated directly as some methods need to be implemented by subclasses.
 * - Event.COMPLETE dispatched when the animation playback is complete.
 * - Event.LABEL dispatched when a specific label is reached during playback.
 * @zh 动画基类，提供了基础的动画播放控制方法和帧标签事件相关功能。
 * 可以继承此类，但不要直接实例化此类，因为有些方法需要由子类实现。
 * - Event.COMPLETE 动画播放完毕后调度。
 * - Event.LABEL 播放到某标签后调度。
 */
export class AnimationBase extends Sprite {
    /**
     * @en Animation playback order type: Forward playback.
     * @zh 动画播放顺序类型：正序播放。
     */
    static WRAP_POSITIVE: number = 0;
    /**
     * @en Animation playback order type: Reverse playback.
     * @zh 动画播放顺序类型：逆序播放。
     */
    static WRAP_REVERSE: number = 1;
    /**
     * @en Animation playback order type: Ping-pong playback (changes playback direction after reaching the end when continuing to play).
     * @zh 动画播放顺序类型：pingpong播放(当按指定顺序播放完结尾后，如果继续播放，则会改变播放顺序)。
     */
    static WRAP_PINGPONG: number = 2;

    /**
     * @en Whether to loop playback. This value is set to the specified parameter value when calling the play(...) method.
     * @zh 是否循环播放，调用play(...)方法时，会将此值设置为指定的参数值。
     */
    loop: boolean;
    /**
     * @en Playback order type: AnimationBase.WRAP_POSITIVE for forward playback (default), AnimationBase.WRAP_REVERSE for reverse playback, AnimationBase.WRAP_PINGPONG for ping-pong playback.
     * @zh 播放顺序类型：AnimationBase.WRAP_POSITIVE为正序播放(默认值)，AnimationBase.WRAP_REVERSE为倒序播放，AnimationBase.WRAP_PINGPONG为pingpong播放(当按指定顺序播放完结尾后，如果继续播发，则会改变播放顺序)。
     */
    wrapMode: number = 0;
    /** 播放间隔(单位：毫秒)。*/
    protected _interval: number = Config.animationInterval;
    protected _index: number;
    protected _count: number;
    protected _isPlaying: boolean;
    protected _labels: any;
    /**是否是逆序播放*/
    protected _isReverse: boolean = false;
    protected _frameRateChanged: boolean = false;
    protected _actionName: string;
    private _controlNode: Sprite;

    /**
     * @en constructor method, This class can be extended, but should not be instantiated directly as some methods need to be implemented by subclasses.
     * @zh 构造方法，可以继承此类，但不要直接实例化此类，因为有些方法需要由子类实现。
     */
    constructor() {
        super();
        this._setBitUp(NodeFlags.DISPLAY);
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
    play(start: any = 0, loop: boolean = true, name: string = ""): void {
        this._isPlaying = true;
        this._actionName = name;
        this.index = (typeof (start) == 'string') ? this._getFrameByLabel(<string>start) : start;
        this.loop = loop;
        this._isReverse = this.wrapMode === AnimationBase.WRAP_REVERSE;
        if (this.index == 0 && this._isReverse) {
            this.index = this.count - 1;
        }
        if (this.interval > 0) this.timerLoop(this.interval, this, this._frameLoop, null, true, true);
    }

    /**
     * @en Gets or sets the frame interval time (in milliseconds) for animation playback.
     * The default value depends on Config.animationInterval=50, which can be modified through Config.animationInterval.
     * To set an independent frame interval time for a specific animation, you can use set interval.
     * Note: If the animation is currently playing, setting this will reset the frame loop timer's start time to the current time.
     * Frequent setting of interval may cause the animation frame update interval to be slower than expected, or even not update.
     * @zh 动画播放的帧间隔时间(单位：毫秒)。默认值依赖于Config.animationInterval=50，通过Config.animationInterval可以修改默认帧间隔时间。
     * 要想为某动画设置独立的帧间隔时间，可以使用set interval，注意：如果动画正在播放，设置后会重置帧循环定时器的起始时间为当前时间，也就是说，如果频繁设置interval，会导致动画帧更新的时间间隔会比预想的要慢，甚至不更新。
     */
    get interval(): number {
        return this._interval;
    }

    set interval(value: number) {
        if (this._interval != value) {
            this._frameRateChanged = true;
            this._interval = value;
            if (this._isPlaying && value > 0) {
                this.timerLoop(value, this, this._frameLoop, null, true, true);
            }
        }
    }

    protected _getFrameByLabel(label: string): number {
        for (var i: number = 0; i < this._count; i++) {
            var item: any = this._labels[i];
            if (item && ((<any[]>item)).indexOf(label) > -1) return i;
        }
        return 0;
    }

    protected _frameLoop(): void {
        if (!this._controlNode || this._controlNode._destroyed) {
            this.clearTimer(this, this._frameLoop);
            return;
        }
        if (this._isReverse) {
            this._index--;
            if (this._index < 0) {
                if (this.loop) {
                    if (this.wrapMode == AnimationBase.WRAP_PINGPONG) {
                        this._index = this._count > 0 ? 1 : 0;
                        this._isReverse = false;
                    } else {
                        this._index = this._count - 1;
                    }
                    this.event(Event.COMPLETE);
                } else {
                    this._index = 0;
                    this.stop();
                    this.event(Event.COMPLETE);
                    return;
                }
            }
        } else {
            this._index++;
            if (this._index >= this._count) {
                if (this.loop) {
                    if (this.wrapMode == AnimationBase.WRAP_PINGPONG) {
                        this._index = this._count - 2 >= 0 ? this._count - 2 : 0;
                        this._isReverse = true;
                    } else {
                        this._index = 0;
                    }
                    this.event(Event.COMPLETE);
                } else {
                    this._index--;
                    this.stop();
                    this.event(Event.COMPLETE);
                    return;
                }
            }
        }
        this.index = this._index;
    }

    /**@internal */
    _setControlNode(node: Sprite): void {
        if (this._controlNode) {
            this._controlNode.off(Event.DISPLAY, this, this._resumePlay);
            this._controlNode.off(Event.UNDISPLAY, this, this._resumePlay);
        }
        this._controlNode = node;
        if (node && node != this) {
            node.on(Event.DISPLAY, this, this._resumePlay);
            node.on(Event.UNDISPLAY, this, this._resumePlay);
        }
    }

    /**
     * @internal 
    */
    _setDisplay(value: boolean): void {
        super._setDisplay(value);
        this._resumePlay();
    }

    protected _resumePlay(): void {
        if (this._isPlaying) {
            if (this._controlNode.displayedInStage) this.play(this._index, this.loop, this._actionName);
            else this.clearTimer(this, this._frameLoop);
        }
    }

    /**
     * @en Stop the animation playback.
     * @zh 停止动画播放。
     */
    stop(): void {
        this._isPlaying = false;
        this.clearTimer(this, this._frameLoop);
    }

    /**
     * @en Whether the animation is currently playing.
     * @zh 是否正在播放中。
     */
    get isPlaying(): boolean {
        return this._isPlaying;
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
        if (!this._labels) this._labels = {};
        if (!this._labels[index]) this._labels[index] = [];
        this._labels[index].push(label);
    }

    /**
     * @en Remove the specified frame label.
     * @param label The name of the frame label. Note: If empty, all frame labels will be deleted!
     * @zh 删除指定的帧标签。
     * @param label 帧标签名称。注意：如果为空，则删除所有帧标签！
     */
    removeLabel(label: string): void {
        if (!label) this._labels = null;
        else if (this._labels) {
            for (var name in this._labels) {
                this._removeLabelFromList(this._labels[name], label);
            }
        }
    }

    private _removeLabelFromList(list: any[], label: string): void {
        if (!list) return;
        for (var i: number = list.length - 1; i >= 0; i--) {
            if (list[i] == label) {
                list.splice(i, 1);
            }
        }
    }

    /**
     * @en Switch the animation to the specified frame and stop there.
     * @param position Frame index or frame label.
     * @zh 将动画切换到指定帧并停在那里。
     * @param position 帧索引或帧标签。
     */
    gotoAndStop(position: any): void {
        this.index = (typeof (position) == 'string') ? this._getFrameByLabel(<string>position) : position;
        this.stop();
    }

    /**
     * @en The index of the current frame in the animation.
     * @zh 动画当前帧的索引。
     */
    get index(): number {
        return this._index;
    }

    set index(value: number) {
        this._index = value;
        this._displayToIndex(value);
        if (this._labels && this._labels[value]) {
            var tArr: any[] = this._labels[value];
            for (var i: number = 0, len: number = tArr.length; i < len; i++) {
                this.event(Event.LABEL, tArr[i]);
            }
        }
    }

    /**
     * @en Displays the specified frame.
     * @param value The index of the frame to display.
     * @zh 显示到某帧
     * @param value 帧索引
     */
    protected _displayToIndex(value: number): void {
    }

    /**
     * @en The total number of frames in the current animation.
     * @zh 当前动画中帧的总数。
     */
    get count(): number {
        return this._count;
    }

    /**
     * @en Stop the animation playback and clear object properties. After this, the object can be stored in the object pool for reuse.
     * @returns The object itself.
     * @zh 停止动画播放，并清理对象属性。之后可存入对象池，方便对象复用。
     * @returns 返回对象本身。
     */
    clear(): AnimationBase {
        this.stop();
        this._labels = null;
        return this;
    }
}