import { Handler } from "../utils/Handler";
import { Sprite } from "../display/Sprite";
import { Tween } from "../utils/Tween";
import { Component } from "../components/Component";

/**
 * @en Effect plugin base class, managed based on the object pool.
 * @zh 效果插件基类，基于对象池管理。
 */
export class EffectBase extends Component {
    /**
     * @en The duration of the animation in milliseconds.
     * @zh 动画持续时间，单位为毫秒。
     */
    duration: number = 1000;
    /**
     * @en The delay time of the animation in milliseconds.
     * @zh 动画延迟时间，单位为毫秒。
     */
    delay: number = 0;
    /**
     * @en The repeat count of the animation. Default is to play once.
     * @zh 动画的重复次数。默认为播放一次。
     */
    repeat: number = 0;
    /**
     * @en The type of easing. If empty, it defaults to uniform speed playback.
     * @zh 缓动类型，如果为空，则默认为匀速播放。
     */
    ease: string;
    /**
     * @en The event that triggers the effect. If empty, it triggers upon creation.
     * @zh 触发事件，如果为空，则创建时触发。
     */
    eventName: string;
    /**
     * @en The target object of the effect. If empty, it is the node where the script is located.
     * @zh 效用作用的目标对象，如果为空，则是脚本所在的节点本身。
     */
    target: Sprite;
    /**
     * @en Whether to automatically remove the node when the effect is complete.
     * @zh 效果结束后，是否自动移除节点。
     */
    autoDestroyAtComplete: boolean = true;

    protected _comlete: Handler;
    protected _tween: Tween;

    protected _onAwake(): void {
        this.target = this.target || (<Sprite>this.owner);
        if (this.autoDestroyAtComplete) 
            this._comlete = Handler.create(this.target, this.target.destroy, null, false);
        if (this.eventName) 
            this.owner.on(this.eventName, this, this._exeTween);
        else 
            this._exeTween();
    }

    protected _exeTween(): void {
        this._tween = this._doTween();
        this._tween.repeat = this.repeat;
    }

    protected _doTween(): Tween {
        return null;
    }

    /**
     * @en Reset the effect properties to their default values.
     * @zh 重置效果属性到默认值。
     */
    onReset(): void {
        this.duration = 1000;
        this.delay = 0;
        this.repeat = 0;
        this.ease = null;
        this.target = null;
        if (this.eventName) {
            this.owner.off(this.eventName, this, this._exeTween);
            this.eventName = null;
        }
        if (this._comlete) {
            this._comlete.recover();
            this._comlete = null;
        }
        if (this._tween) {
            this._tween.clear();
            this._tween = null;
        }
    }
}

