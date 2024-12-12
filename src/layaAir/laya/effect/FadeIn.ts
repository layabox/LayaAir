import { EffectBase } from "././EffectBase";
import { Tween } from "../tween/Tween";
import { Ease } from "../tween/Ease";

/**
 * @en Fade in effect
 * @zh 淡入效果
 */
export class FadeIn extends EffectBase {
    /**
     * @override
     */
    protected _doTween(): Tween {
        this.target.alpha = 0;
        return Tween.to(this.target, { alpha: 1 }, this.duration, (Ease as any)[this.ease], this._comlete, this.delay);
    }
}

