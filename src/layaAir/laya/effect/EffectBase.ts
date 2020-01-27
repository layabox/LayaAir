import { Handler } from "../utils/Handler";
import { Sprite } from "../display/Sprite";
import { Tween } from "../utils/Tween";
import { Component } from "../components/Component";

/**
 * 效果插件基类，基于对象池管理
 */
export class EffectBase extends Component {
    /**动画持续时间，单位为毫秒*/
    duration: number = 1000;
    /**动画延迟时间，单位为毫秒*/
    delay: number = 0;
    /**重复次数，默认为播放一次*/
    repeat: number = 0;
    /**缓动类型，如果为空，则默认为匀速播放*/
    ease: string;
    /**触发事件，如果为空，则创建时触发*/
    eventName: string;
    /**效用作用的目标对象，如果为空，则是脚本所在的节点本身*/
    target: Sprite;
    /**效果结束后，是否自动移除节点*/
    autoDestroyAtComplete: boolean = true;

    protected _comlete: Handler;
    protected _tween: Tween;
    /**
     * @internal
     * @override
     */
    _onAwake(): void {
        this.target = this.target || (<Sprite>this.owner);
        if (this.autoDestroyAtComplete) this._comlete = Handler.create(this.target, this.target.destroy, null, false);
        if (this.eventName) this.owner.on(this.eventName, this, this._exeTween);
        else this._exeTween();
    }

    protected _exeTween(): void {
        this._tween = this._doTween();
        this._tween.repeat = this.repeat;
    }

    protected _doTween(): Tween {
        return null;
    }
    /**
     * @override
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

