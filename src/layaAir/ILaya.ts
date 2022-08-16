import { Timer } from "./laya/utils/Timer";
import { Loader } from "./laya/net/Loader";
import { SoundManager } from "./laya/media/SoundManager";
import { WebAudioSound } from "./laya/media/webaudio/WebAudioSound";
import { Context } from "./laya/resource/Context";
import { Browser } from "./laya/utils/Browser";
import { AudioSound } from "./laya/media/h5audio/AudioSound";
import { Utils } from "./laya/utils/Utils";
import { Resource } from "./laya/resource/Resource";
import { Stage } from "./laya/display/Stage";

/**
 * @internal
 * 使用全局类的时候，避免引用其他模块
 */
export class ILaya {
    static Timer: typeof Timer = null;
    static Loader: typeof Loader = null;
    static SoundManager: typeof SoundManager = null;
    static WebAudioSound: typeof WebAudioSound = null;
    static AudioSound: typeof AudioSound = null;
    static Context: typeof Context = null;
    static Browser: typeof Browser = null;
    static Utils: typeof Utils = null;
    static Resource: typeof Resource = null;

    static Laya: any = null;
    static loader: Loader = null;
    static timer: Timer = null;
    static systemTimer: Timer = null;
    static physicsTimer: Timer = null;
    static stage: Stage = null;
}
