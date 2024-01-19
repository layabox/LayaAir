import { SoundChannel } from "./SoundChannel";
import { SoundManager } from "./SoundManager";
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
import { Handler } from "../utils/Handler"
import { LayaEnv } from "../../LayaEnv";

/**
 * 用于播放背景音乐或者音效的节点
 */
export class SoundNode extends Sprite {
    private _channel: SoundChannel;
    private _tar: Sprite;
    private _playEvents: string;
    private _stopEvents: string;
    private _source: string;
    private _isMusic: boolean;
    private _autoPlay: boolean;
    private _loop: number;

    constructor() {
        super();

        this._loop = 1;

        this.on(Event.ADDED, this, this._onParentChange);
        this.on(Event.REMOVED, this, this._onParentChange);
    }

    /**
     * 音频源
     */
    get source() {
        return this._source;
    }

    set source(value: string) {
        this._source = value;
        if (value) {
            if (this._autoPlay && (!this._channel || this._channel.isStopped) && LayaEnv.isPlaying)
                this.play();
        }
        else
            this.stop();
    }

    /**
     * 如果是，音乐类型为背景音乐，否则为音效
     */
    get isMusic() {
        return this._isMusic;
    }

    set isMusic(value: boolean) {
        this._isMusic = value;
    }

    /**
     * 循环次数
     */
    get loop() {
        return this._loop;
    }

    set loop(value: number) {
        this._loop = value;
    }

    /**
     * 是否自动播放
     */
    get autoPlay() {
        return this._autoPlay;
    }

    set autoPlay(value: boolean) {
        this._autoPlay = value;
        if (value && this._source && (!this._channel || this._channel.isStopped) && LayaEnv.isPlaying)
            this.play();
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
    play(loops?: number, complete?: Handler): void {
        if (!this._source) return;

        if (loops == null || isNaN(loops))
            loops = this._loop;

        this.stop();

        if (this._isMusic)
            this._channel = SoundManager.playMusic(this._source, loops, complete);
        else
            this._channel = SoundManager.playSound(this._source, loops, complete);
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
        let eventArr = events.split(",");
        let len = eventArr.length;
        for (let i = 0; i < len; i++) {
            this._setPlayAction(tar, eventArr[i], action, add);
        }
    }

    /**
     * 设置触发播放的事件
     * @param events
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
