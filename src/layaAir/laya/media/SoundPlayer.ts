import { SoundChannel } from "./SoundChannel";
import { SoundManager } from "./SoundManager";
import { LayaEnv } from "../../LayaEnv";
import { Component } from "../components/Component";

/**
 * @en Component used for playing background music or sound effects
 * @zh 用于播放背景音乐或者音效的组件
 */
export class SoundPlayer extends Component {
    private _channel: SoundChannel;
    private _source: string;
    private _isMusic: boolean;
    private _autoPlay: boolean;
    private _loop: number;

    constructor() {
        super();

        this._loop = 1;
    }

    /**
     * @en Audio source
     * @zh 音频源
     */
    get source() {
        return this._source;
    }

    set source(value: string) {
        this._source = value;
        if (value) {
            if (this.owner?.activeInHierarchy && (this._autoPlay || this._channel) && LayaEnv.isPlaying)
                this.play(this._loop);
        }
        else
            this.stop();
    }

    /**
     * @en Determines if the audio type is background music. If true, it's background music; otherwise, it's a sound effect.
     * @zh 确定音频类型是否为背景音乐。如果为true，音乐类型为背景音乐，否则为音效
     */
    get isMusic() {
        return this._isMusic;
    }

    set isMusic(value: boolean) {
        this._isMusic = value;
    }

    /**
     * @en The number of times the audio should loop
     * @zh 循环次数
     */
    get loop() {
        return this._loop;
    }

    set loop(value: number) {
        this._loop = value;
    }

    /**
     * @en Determines if the audio should auto-play
     * @zh 是否自动播放
     */
    get autoPlay() {
        return this._autoPlay;
    }

    set autoPlay(value: boolean) {
        this._autoPlay = value;
        if (this.owner?.activeInHierarchy && value && !this._channel && LayaEnv.isPlaying)
            this.play(this._loop);
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
    play(loops?: number, complete?: (success: boolean) => void, startTime?: number): void {
        if (!this._source)
            return;

        if (loops == null || isNaN(loops))
            loops = this._loop;

        this.stop();

        if (this._isMusic)
            this._channel = SoundManager.playMusic(this._source, loops, <any>complete, startTime);
        else
            this._channel = SoundManager.playSound(this._source, loops, <any>complete, startTime);
    }

    /**
     * @en Stop playing the audio
     * @zh 停止播放音频
     */
    stop(): void {
        if (this._channel)
            this._channel.stop();
        this._channel = null;
    }

    protected _onEnable(): void {
        if (this._autoPlay && !this._channel)
            this.play(this._loop);

        super._onEnable();
    }

    protected _onDisable(): void {
        this.stop();

        super._onDisable();
    }
}
