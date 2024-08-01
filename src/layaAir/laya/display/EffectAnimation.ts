import { FrameAnimation } from "./FrameAnimation";
import { ClassUtils } from "../utils/ClassUtils"
import { Ease } from "../utils/Ease"

/**
 * @en Effect template. Used to add animation effects to specified target objects. Each effect has a unique target object, while the same object can add multiple effects. When one effect starts playing, other effects will automatically stop playing.
 * @zh 动效模板。用于为指定目标对象添加动画效果。每个动效有唯一的目标对象，而同一个对象可以添加多个动效。当一个动效开始播放时，其他动效会自动停止播放。
 */
export class EffectAnimation extends FrameAnimation {
    /**
     * @private
     * 动效开始事件。
     */
    private static EFFECT_BEGIN: string = "effectbegin";

    /**@internal */
    private _target: any;
    /**@internal */
    private _playEvent: string;
    /**@internal */
    private _initData: any = {};
    /**@internal */
    private _aniKeys: any[];
    /**@internal */
    private _effectClass: new () => any;

    /**
     * @en The target object of this instance. Controls the property changes of the target object through this instance.
     * @zh 本实例的目标对象。通过本实例控制目标对象的属性变化。
     */
    get target(): any {
        return this._target;
    }

    set target(v: any) {
        if (this._target) this._target.off(EffectAnimation.EFFECT_BEGIN, this, this._onOtherBegin);
        this._target = v;
        if (this._target) this._target.on(EffectAnimation.EFFECT_BEGIN, this, this._onOtherBegin);
        this._addEvent();
    }

    /**@private */
    private _onOtherBegin(effect: any): void {
        if (effect === this) return;
        this.stop();
    }

    /**
     * @en The event name to trigger the animation. This instance will listen for the specified event of the target object and play the corresponding animation effect when triggered.
     * @zh 触发动画的事件名称。本实例会侦听目标对象的指定事件，触发后播放相应动画效果。
     */
    set playEvent(event: string) {
        this._playEvent = event;
        if (!event) return;
        this._addEvent();
    }

    /**@internal */
    private _addEvent(): void {
        if (!this._target || !this._playEvent) return;
        this._setControlNode(this._target);
        this._target.on(this._playEvent, this, this._onPlayAction);
    }

    /**@internal */
    private _onPlayAction(): void {
        this.play(0, false);
    }

    /**
     * @override
     * @en Play the animation effect.
     * @param start The starting position of the animation. Default is 0.
     * @param loop Whether to loop the animation. Default is true.
     * @param name The name of the animation to play. Default is an empty string.
     * @zh 播放动画效果。
     * @param start 动画的起始位置。默认为0。
     * @param loop 是否循环播放动画。默认为true。
     * @param name 要播放的动画名称。默认为空字符串。
     */
    play(start: any = 0, loop: boolean = true, name: string = ""): void {
        if (!this._target)
            return;
        this._target.event(EffectAnimation.EFFECT_BEGIN, [this]);
        this._recordInitData();
        super.play(start, loop, name);
    }

    /**@private */
    private _recordInitData(): void {
        if (!this._aniKeys) return;
        var i: number, len: number;
        len = this._aniKeys.length;
        var key: string;
        for (i = 0; i < len; i++) {
            key = this._aniKeys[i];
            this._initData[key] = this._target[key];
        }
    }

    /**
     * @en Provide the path of the class that provides the data.
     * @zh 提供数据的类的路径。
     */
    set effectClass(classStr: string) {
        this._effectClass = ClassUtils.getClass(classStr);
        if (this._effectClass) {
            var uiData: any = (this._effectClass as any)["uiView"];
            if (uiData) {
                var aniData: any[] = uiData["animations"];
                if (aniData && aniData[0]) {
                    var data: any = aniData[0];
                    this._setUp({}, data);
                    if (data.nodes && data.nodes[0]) {
                        this._aniKeys = data.nodes[0].keys;
                    }
                }
            }
        }
    }

    /**
     * @en The UI data containing animation information.
     * @zh 包含动画信息的UI数据。
     */
    set effectData(uiData: any) {
        if (uiData) {
            var aniData: any[] = uiData["animations"];
            if (aniData && aniData[0]) {
                var data: any = aniData[0];
                this._setUp({}, data);
                if (data.nodes && data.nodes[0]) {
                    this._aniKeys = data.nodes[0].keys;
                }
            }
        }
    }

    /**
     * @internal
    */
    protected _displayToIndex(value: number): void {
        if (!this._animationData) return;
        if (value < 0) value = 0;
        if (value > this._count) value = this._count;
        var nodes: any[] = this._animationData.nodes, i: number, len: number = nodes.length;
        len = len > 1 ? 1 : len;
        for (i = 0; i < len; i++) {
            this._displayNodeToFrame(nodes[i], value);
        }
    }

    /**
     * @override
    */
    protected _displayNodeToFrame(node: any, frame: number, targetDic: any = null): void {
        if (!this._target) return;
        var target: any = this._target;
        var frames: any = node.frames, key: string, propFrames: any[], value: any;
        var keys: any[] = node.keys, i: number, len: number = keys.length;
        var secondFrames: any = node.secondFrames;
        var tSecondFrame: number;
        var easeFun: Function;
        var tKeyFrames: any[];
        var startFrame: any;
        var endFrame: any;
        for (i = 0; i < len; i++) {
            key = keys[i];
            propFrames = frames[key];
            tSecondFrame = secondFrames[key];
            if (tSecondFrame == -1) {
                value = this._initData[key];
            } else {
                if (frame < tSecondFrame) {
                    tKeyFrames = node.keyframes[key];
                    startFrame = tKeyFrames[0];
                    if (startFrame.tween) {
                        easeFun = (Ease as any)[startFrame.tweenMethod];
                        if (easeFun == null) easeFun = Ease.linearNone;
                        endFrame = tKeyFrames[1];
                        value = easeFun(frame, this._initData[key], endFrame.value - this._initData[key], endFrame.index);
                    } else {
                        value = this._initData[key];
                    }

                } else {
                    if (propFrames.length > frame) value = propFrames[frame];
                    else value = propFrames[propFrames.length - 1];
                }
            }
            target[key] = value;
        }
    }

    /**
     * @internal
    */
    protected _calculateKeyFrames(node: any): void {
        super._calculateKeyFrames(node);
        var keyFrames: any = node.keyframes, key: string, tKeyFrames: any[], target: number = node.target;

        var secondFrames: any = {};
        node.secondFrames = secondFrames;
        for (key in keyFrames) {
            tKeyFrames = keyFrames[key];
            if (tKeyFrames.length <= 1) secondFrames[key] = -1;
            else secondFrames[key] = tKeyFrames[1].index;
        }
    }
}