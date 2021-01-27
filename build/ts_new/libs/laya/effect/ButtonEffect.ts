import { Sprite } from "../display/Sprite";
import { Tween } from "../utils/Tween";
import { Event } from "../events/Event";
import { Ease } from "../utils/Ease";
import { Handler } from "../utils/Handler";

/**
 * @Script {name:ButtonEffect}
 * @author ww
 */
export class ButtonEffect {

    private _tar: Sprite;
    private _curState: number = 0;
    private _curTween: Tween;
    /**
     * effectScale
     * @prop {name:effectScale,type:number, tips:"缩放值",default:"1.5"}
     */
    effectScale: number = 1.5;
    /**
     * tweenTime
     * @prop {name:tweenTime,type:number, tips:"缓动时长",default:"300"}
     */
    tweenTime: number = 300;
    /**
     * effectEase
     * @prop {name:effectEase,type:ease, tips:"效果缓动类型"}
     */
    effectEase: string;
    /**
     * backEase
     * @prop {name:backEase,type:ease, tips:"恢复缓动类型"}
     */
    backEase: string;

    /**
     * 设置控制对象 
     * @param tar
     */
    set target(tar: Sprite) {
        this._tar = tar;
        tar.on(Event.MOUSE_DOWN, this, this.toChangedState);
        tar.on(Event.MOUSE_UP, this, this.toInitState);
        tar.on(Event.MOUSE_OUT, this, this.toInitState);
    }

    private toChangedState(): void {
        this._curState = 1;
        if (this._curTween) Tween.clear(this._curTween);
        this._curTween = Tween.to(this._tar, { scaleX: this.effectScale, scaleY: this.effectScale }, this.tweenTime, (Ease as any)[this.effectEase], Handler.create(this, this.tweenComplete));
    }

    private toInitState(): void {
        if (this._curState == 2) return;
        if (this._curTween) Tween.clear(this._curTween);
        this._curState = 2;
        this._curTween = Tween.to(this._tar, { scaleX: 1, scaleY: 1 }, this.tweenTime, (Ease as any)[this.backEase], Handler.create(this, this.tweenComplete));
    }
    private tweenComplete(): void {
        this._curState = 0;
        this._curTween = null;
    }
}


