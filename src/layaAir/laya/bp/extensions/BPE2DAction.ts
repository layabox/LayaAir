import { Sprite } from "../../display/Sprite";
import { Ease } from "../../utils/Ease";
import { Handler } from "../../utils/Handler";
import { Tween } from "../../utils/Tween";

/**
 * 
 * @ brief: BPE2DAction
 * @ author: zyh
 * @ data: 2024-04-03 11:24
 */
export class BPE2DAction {
    static translationTween(item: Sprite, x: number = 0, y: number = 0, second: number = 0, ease?: EEaseFunctions, completed: Function = null): Tween {
        const props = { x: x, y: y };
        return this._appleTween(item, props, ease, second, completed);
    }

    static scaleTween(item: Sprite, x: number = 0, y: number = 0, second: number = 0, ease?: EEaseFunctions, completed: Function = null): Tween {
        const props = { scaleX: x, scaleY: y };
        return this._appleTween(item, props, ease, second, completed);
    }

    static rotationTween(item: Sprite, rotation: number = 0, second: number = 0, ease?: EEaseFunctions, completed: Function = null): Tween {
        const props = { rotation: rotation };
        return this._appleTween(item, props, ease, second, completed);
    }

    static alphaTween(item: Sprite, alpha: number = 1, second: number = 0, ease?: EEaseFunctions, completed: Function = null): Tween {
        const props = { alpha: alpha };
        return this._appleTween(item, props, ease, second, completed);
    }

    /** @internal */
    static _appleTween(target: Sprite, props: any, ease: EEaseFunctions, second: number, completed: Function): Tween {
        const tween = Tween.to(target, props, second * 1000, ease && Ease[ease], Handler.create(this, () => {
            if (completed) completed();
        }));
        return tween;
    }

}