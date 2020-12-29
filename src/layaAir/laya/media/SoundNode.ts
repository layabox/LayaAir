import { SoundChannel } from "./SoundChannel";
import { SoundManager } from "./SoundManager";
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
import { Handler } from "../utils/Handler"
import { ClassUtils } from "../utils/ClassUtils";

/**
 * @private
 */
export class SoundNode extends Sprite {
    url: string;
    private _channel: SoundChannel;
    private _tar: Sprite;
    private _playEvents: string;
    private _stopEvents: string;

    constructor() {
        super();
        this.visible = false;
        this.on(Event.ADDED, this, this._onParentChange);
        this.on(Event.REMOVED, this, this._onParentChange);
    }

    /**@private */
    private _onParentChange(): void {

        this.target = (<Sprite>this.parent);
    }

    /**
     * 播放
     * @param loops 循环次数
     * @param complete 完成回调
     *
     */
    play(loops: number = 1, complete: Handler = null): void {
        if (isNaN(loops)) {
            loops = 1;
        }
        if (!this.url) return;
        this.stop();
        this._channel = SoundManager.playSound(this.url, loops, complete);
    }

    /**
     * 停止播放
     *
     */
    stop(): void {
        if (this._channel && !this._channel.isStopped) {
            this._channel.stop();
        }
        this._channel = null;
    }

    /**@private */
    private _setPlayAction(tar: Sprite, event: string, action: string, add: boolean = true): void {
        if (!(this as any)[action]) return;
        if (!tar) return;
        if (add) {
            tar.on(event, this, (this as any)[action]);
        } else {
            tar.off(event, this, (this as any)[action]);
        }

    }

    /**@private */
    private _setPlayActions(tar: Sprite, events: string, action: string, add: boolean = true): void {
        if (!tar) return;
        if (!events) return;
        var eventArr: any[] = events.split(",");
        var i: number, len: number;
        len = eventArr.length;
        for (i = 0; i < len; i++) {
            this._setPlayAction(tar, eventArr[i], action, add);
        }
    }

    /**
     * 设置触发播放的事件
     * @param events
     *
     */
    set playEvent(events: string) {
        this._playEvents = events;
        if (!events) return;
        if (this._tar) {
            this._setPlayActions(this._tar, events, "play");
        }
    }

    /**
     * 设置控制播放的对象
     * @param tar
     *
     */
    set target(tar: Sprite) {
        if (this._tar) {
            this._setPlayActions(this._tar, this._playEvents, "play", false);
            this._setPlayActions(this._tar, this._stopEvents, "stop", false);
        }
        this._tar = tar;
        if (this._tar) {
            this._setPlayActions(this._tar, this._playEvents, "play", true);
            this._setPlayActions(this._tar, this._stopEvents, "stop", true);
        }
    }

    /**
     * 设置触发停止的事件
     * @param events
     *
     */
    set stopEvent(events: string) {
        this._stopEvents = events;
        if (!events) return;
        if (this._tar) {
            this._setPlayActions(this._tar, events, "stop");
        }
    }
}

ClassUtils.regClass("laya.media.SoundNode", SoundNode);
ClassUtils.regClass("Laya.SoundNode", SoundNode);
