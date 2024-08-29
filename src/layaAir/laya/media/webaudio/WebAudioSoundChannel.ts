import { Event } from "../../events/Event"
import { SoundChannel } from "../SoundChannel"
import { Browser } from "../../utils/Browser"
import { ILaya } from "../../../ILaya";
import { SoundManager } from "../SoundManager";
import { WebAudioSound } from "./WebAudioSound";

/**
 * @en Sound track control for playing sounds using Web Audio API
 * @zh 使用 Web Audio API 方式播放声音的音轨控制
 */
export class WebAudioSoundChannel extends SoundChannel {
    /**
     * @en Original audio file data
     * @zh 声音原始文件数据
     */
    audioBuffer: any;

    /**
     * @en Gain node for audio processing.
     * @zh gain 节点
     */
    private gain: any;

    /**
     * @en Buffer source for playback.
     * @zh 播放用的数据
     */
    private bufferSource: any = null;

    /**
     * @en The current playback time.
     * @zh 当前时间
     */
    private _currentTime: number = 0;

    /**
     * @en The current volume level.
     * @zh 当前音量
     */
    private _volume: number = 1;

    /**
     * @en Timestamp when playback starts.
     * @zh 播放开始时的时间戳
     */
    private _startTime: number = 0;

    private _pauseTime: number = 0;

    /**
     * @en The audio playback device.
     * @zh 播放设备
     */
    private context: AudioContext;


    private _onPlayEnd: Function;
    private static _tryCleanFailed: boolean = false;
    /**
     * @en Target delay for audio playback (in seconds)
     * @zh 音频播放的目标延迟时间（以秒为单位）
     */
    static SetTargetDelay: number = 0.001;

    /**@ignore */
    constructor() {
        super();

        this.context = WebAudioSound.ctx;

        this._onPlayEnd = this.__onPlayEnd.bind(this);
        if (this.context["createGain"]) {
            this.gain = this.context["createGain"]();
        } else {
            this.gain = (<any>this.context)["createGainNode"]();
        }
    }
    /**
     * @en Play the sound
     * @zh 播放声音
     */
    play(): void {
        SoundManager.addChannel(this);
        this.isStopped = false;
        this._clearBufferSource();
        if (!this.audioBuffer) return;
        if (this.startTime >= this.duration) return this.stop();
        var context: any = this.context;
        var gain: any = this.gain;
        var bufferSource: any = context.createBufferSource();
        this.bufferSource = bufferSource;
        bufferSource.buffer = this.audioBuffer;
        bufferSource.connect(gain);
        if (gain)
            gain.disconnect();
        gain.connect(context.destination);
        bufferSource.onended = this._onPlayEnd;
        // if (this.startTime >= this.duration) this.startTime = 0;
        this._startTime = Browser.now();
        if (this.gain.gain.setTargetAtTime) {
            this.gain.gain.setTargetAtTime(this._volume, this.context.currentTime, WebAudioSoundChannel.SetTargetDelay);
        } else
            this.gain.gain.value = this._volume;
        if (this.loops == 0) {
            bufferSource.loop = true;
        }
        if (bufferSource.playbackRate.setTargetAtTime) {
            bufferSource.playbackRate.setTargetAtTime(SoundManager.playbackRate, this.context.currentTime, WebAudioSoundChannel.SetTargetDelay)
        } else
            bufferSource.playbackRate.value = SoundManager.playbackRate;
        bufferSource.start(0, this.startTime);
        this._currentTime = 0;
    }

    private __onPlayEnd(): void {
        if (this.loops == 1) {

            if (this.completeHandler) {
                ILaya.timer.once(10, this, this.__runComplete, [this.completeHandler], false);
                this.completeHandler = null;
            }
            this.stop();
            this.event(Event.COMPLETE);
            return;
        }
        if (this.loops > 0) {
            this.loops--;
        }
        this.startTime = 0;
        this.play();
    }

    /**
     * @en The current playback position in seconds
     * @zh 当前播放位置，以秒为单位
     */
    get position(): number {
        if (this.bufferSource) {
            return (Browser.now() - this._startTime) / 1000 + this.startTime;
        }
        return 0;
    }
    /**
     * @en The duration of the audio in seconds
     * @zh 音频的持续时间，以秒为单位
     */
    get duration(): number {
        if (this.audioBuffer) {
            return this.audioBuffer.duration;
        }
        return 0;
    }

    private _clearBufferSource(): void {
        if (this.bufferSource) {
            var sourceNode: any = this.bufferSource;
            if (sourceNode.stop) {
                sourceNode.stop(0);
            } else {
                sourceNode.noteOff(0);
            }
            sourceNode.disconnect(0);
            sourceNode.onended = null;
            if (!WebAudioSoundChannel._tryCleanFailed) this._tryClearBuffer(sourceNode);
            this.bufferSource = null;
        }
    }

    private _tryClearBuffer(sourceNode: any): void {
        try {//已经支持buffer=null
            sourceNode.buffer = null;
        } catch (e) {
            WebAudioSoundChannel._tryCleanFailed = true;
        }
    }

    /**
     * @en Stop playing 
     * @zh 停止播放
     */
    stop(): void {
        super.stop();
        this._clearBufferSource();
        this.audioBuffer = null;
        if (this.gain)
            this.gain.disconnect();
        this.isStopped = true;
        SoundManager.removeChannel(this);
        this.completeHandler = null;
        if (SoundManager.autoReleaseSound)
            SoundManager.disposeSoundLater(this.url);
    }
    /**
     * @en Pause the audio playback
     * @zh 暂停音频播放
     */
    pause(): void {
        if (!this.isStopped) {
            this._pauseTime = this.position;
        }
        this._clearBufferSource();
        if (this.gain)
            this.gain.disconnect();
        this.isStopped = true;
        SoundManager.removeChannel(this);
        if (SoundManager.autoReleaseSound)
            SoundManager.disposeSoundLater(this.url);
    }
    /**
     * @en Resume the audio playback
     * @zh 恢复音频播放
     */
    resume(): void {
        this.startTime = this._pauseTime;
        this.play();
    }

    /**
     * @en The volume of the audio
     * @zh 音频的音量
     */
    get volume(): number {
        return this._volume;
    }

    set volume(v: number) {
        this._volume = v;
        if (this.isStopped) {
            return;
        }
        if (this.gain.gain.setTargetAtTime) {
            this.gain.gain.setTargetAtTime(v, this.context.currentTime, WebAudioSoundChannel.SetTargetDelay);
        } else
            this.gain.gain.value = v;
    }
}


