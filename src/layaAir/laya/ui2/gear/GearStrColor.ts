import { Ease } from "../../tween/Ease";
import { Tween } from "../../tween/Tween";
import { Gear } from "./Gear";

export class GearStrColor extends Gear<string> {
    protected doTween(obj: any, key: string, oldValue: string, newValue: string): void {
        let tc = this._tweenCfg;
        if (this._tween) {
            let tweener = this._tween.findTweener(null);
            if (tweener && newValue == (tweener.endValue.getAt(0)))
                return;
            this._tween.kill(true);
        }

        this._tween = Tween.create(obj)
            .duration(tc.duration)
            .delay(tc.delay)
            .ease(Ease[tc.easeType])
            .go(key, oldValue, newValue)
            .interp(Tween.seperateChannel)
            .then(() => {
                this._tween.recover();
                this._tween = null;
            });
    }
}