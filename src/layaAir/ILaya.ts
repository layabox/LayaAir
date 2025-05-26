import type { Timer } from "./laya/utils/Timer";
import type { Loader } from "./laya/net/Loader";
import type { Context } from "./laya/renders/Context";
import type { Stage } from "./laya/display/Stage";
import type { InputManager } from "./laya/events/InputManager";
import type { Laya } from "./Laya";
import type { Scene3D } from "./laya/d3/core/scene/Scene3D";
import type { Laya3D } from "./Laya3D";

/**
 * @internal
 * 使用全局类的时候，避免引用其他模块
 */
export class ILaya {
    static Laya: typeof Laya = null;
    static Loader: typeof Loader = null;
    static Context: typeof Context = null;
    static InputManager: typeof InputManager = null;

    static Scene3D: typeof Scene3D = null;
    static Laya3D: typeof Laya3D = null;

    static loader: Loader = null;
    static timer: Timer = null;
    static systemTimer: Timer = null;
    static physicsTimer: Timer = null;
    static stage: Stage = null;
}

/**
 * @internal
 */
export declare type Mutable<T> = {
    -readonly [P in keyof T]: T[P]
};