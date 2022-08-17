import { Timer } from "./laya/utils/Timer";
import { Loader } from "./laya/net/Loader";
import { Context } from "./laya/resource/Context";
import { Browser } from "./laya/utils/Browser";
import { Stage } from "./laya/display/Stage";

/**
 * @internal
 * 使用全局类的时候，避免引用其他模块
 */
export class ILaya {
    static Loader: typeof Loader = null;
    static Context: typeof Context = null;
    static Browser: typeof Browser = null;

    static Laya: any = null;
    static loader: Loader = null;
    static timer: Timer = null;
    static systemTimer: Timer = null;
    static physicsTimer: Timer = null;
    static stage: Stage = null;
}
