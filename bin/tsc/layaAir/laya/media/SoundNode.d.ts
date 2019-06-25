import { Sprite } from "../display/Sprite";
import { Handler } from "../utils/Handler";
/**
 * @private
 */
export declare class SoundNode extends Sprite {
    url: string;
    private _channel;
    private _tar;
    private _playEvents;
    private _stopEvents;
    constructor();
    /**@private */
    private _onParentChange;
    /**
     * 播放
     * @param loops 循环次数
     * @param complete 完成回调
     *
     */
    play(loops?: number, complete?: Handler): void;
    /**
     * 停止播放
     *
     */
    stop(): void;
    /**@private */
    private _setPlayAction;
    /**@private */
    private _setPlayActions;
    /**
     * 设置触发播放的事件
     * @param events
     *
     */
    playEvent: string;
    /**
     * 设置控制播放的对象
     * @param tar
     *
     */
    target: Sprite;
    /**
     * 设置触发停止的事件
     * @param events
     *
     */
    stopEvent: string;
}
