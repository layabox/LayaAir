import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { Handler } from "../utils/Handler";
import { LayaEnv } from "../../LayaEnv";
import { SoundPlayer } from "./SoundPlayer";
import { HideFlags } from "../Const";

/**
 * @en Node used for playing background music or sound effects
 * @zh 用于播放背景音乐或者音效的节点
 */
export class SoundNode extends Sprite {
    private _comp: SoundPlayer;
    private _tar: Sprite;
    private _playEvents: string;
    private _stopEvents: string;

    constructor() {
        super();

        this._comp = this.addComponent(SoundPlayer);
        this._comp.hideFlags |= HideFlags.HideAndDontSave;

        if (LayaEnv.isPlaying) {
            this.on(Event.ADDED, () => { this.target = this.parent; });
            this.on(Event.REMOVED, () => { this.target = null; });
        }
    }

    /**
     * @en Audio source
     * @zh 音频源
     */
    get source() {
        return this._comp.source;
    }

    set source(value: string) {
        this._comp.source = value;
    }

    /**
     * @en Determines if the audio type is background music. If true, it's background music; otherwise, it's a sound effect.
     * @zh 确定音频类型是否为背景音乐。如果为true，音乐类型为背景音乐，否则为音效
     */
    get isMusic() {
        return this._comp.isMusic;
    }

    set isMusic(value: boolean) {
        this._comp.isMusic = value;
    }

    /**
     * @en The number of times the audio should loop
     * @zh 循环次数
     */
    get loop() {
        return this._comp.loop;
    }

    set loop(value: number) {
        this._comp.loop = value;
    }

    /**
     * @en Determines if the audio should auto-play
     * @zh 是否自动播放
     */
    get autoPlay() {
        return this._comp.autoPlay;
    }

    set autoPlay(value: boolean) {
        this._comp.autoPlay = value;
    }

    /**
     * @en Play the audio
     * @param loops The number of times to loop the audio
     * @param complete The callback function to be called when playback is complete
     * @param startTime The time to start playing the audio from
     * @zh 播放音频
     * @param loops 循环次数
     * @param complete 完成回调函数
     * @param startTime 播放开始时间
     */
    play(loops?: number, complete?: (success: boolean) => void, startTime?: number): void;
    /** @deprecated */
    play(loops?: number, complete?: Handler, startTime?: number): void;
    play(loops?: number, complete?: Handler | ((success: boolean) => void), startTime?: number): void {
        this._comp.play(loops, complete as any, startTime);
    }

    /**
     * @en Stop playing the audio
     * @zh 停止播放音频
     */
    stop(): void {
        this._comp.stop();
    }

    private _setPlayAction(tar: Sprite, event: string, action: string, add: boolean = true): void {
        if (!(this as any)[action]) return;
        if (!tar) return;
        if (add) {
            tar.on(event, this, (this as any)[action]);
        } else {
            tar.off(event, this, (this as any)[action]);
        }
    }

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
     * @en The events string that trigger audio playback
     * @zh 触发播放的事件字符串
     */
    set playEvent(events: string) {
        this._playEvents = events;
        if (!events) return;
        if (this._tar) {
            this._setPlayActions(this._tar, events, "play");
        }
    }

    /**
     * @en The target sprite object that controls audio playback
     * @zh 控制播放的精灵对象
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
     * @en Set the events string that trigger audio stop
     * @zh 设置触发停止的事件字符串
     */
    set stopEvent(events: string) {
        this._stopEvents = events;
        if (!events) return;
        if (this._tar) {
            this._setPlayActions(this._tar, events, "stop");
        }
    }
}
