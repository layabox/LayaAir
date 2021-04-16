import { Event } from "../../events/Event"
import { SoundChannel } from "../SoundChannel"
//import { SoundManager } from "../SoundManager"
import { Browser } from "../../utils/Browser"
import { Utils } from "../../utils/Utils"
import { ILaya } from "../../../ILaya";
//import { WebAudioSound } from "./WebAudioSound";

/**
 * @private
 * web audio api方式播放声音的音轨控制
 */
export class WebAudioSoundChannel extends SoundChannel {
    /**
     * 声音原始文件数据
     */
    audioBuffer: any;

    /**
     * gain节点
     */
    private gain: any;

    /**
     * 播放用的数据
     */
    private bufferSource: any = null;
    /**
     * 当前时间
     */
    private _currentTime: number = 0;

    /**
     * 当前音量
     */
    private _volume: number = 1;

    /**
     * 播放开始时的时间戳
     */
    private _startTime: number = 0;

    private _pauseTime: number = 0;

    /**
     * 播放设备
     */
    private context: any = ILaya.WebAudioSound.ctx;

    private _onPlayEnd: Function;
    private static _tryCleanFailed: boolean = false;
    static SetTargetDelay: number = 0.001;
    constructor() {
        super();
        this._onPlayEnd = Utils.bind(this.__onPlayEnd, this);
        if (this.context["createGain"]) {
            this.gain = this.context["createGain"]();
        } else {
            this.gain = this.context["createGainNode"]();
        }
    }
    /**
     * 播放声音
     * @override
     */
    play(): void {
        ILaya.SoundManager.addChannel(this);
        this.isStopped = false;
        this._clearBufferSource();
        if (!this.audioBuffer) return;
        if (this.startTime >= this.duration) return stop();
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
            bufferSource.playbackRate.setTargetAtTime(ILaya.SoundManager.playbackRate, this.context.currentTime, WebAudioSoundChannel.SetTargetDelay)
        } else
            bufferSource.playbackRate.value = ILaya.SoundManager.playbackRate;
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
     * 获取当前播放位置
     * @override
     */
    get position(): number {
        if (this.bufferSource) {
            return (Browser.now() - this._startTime) / 1000 + this.startTime;
        }
        return 0;
    }
    /**
     * @override
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
     * 停止播放
     * @override
     */
    stop(): void {
        super.stop();
        this._clearBufferSource();
        this.audioBuffer = null;
        if (this.gain)
            this.gain.disconnect();
        this.isStopped = true;
        ILaya.SoundManager.removeChannel(this);
        this.completeHandler = null;
        if (ILaya.SoundManager.autoReleaseSound)
            ILaya.SoundManager.disposeSoundLater(this.url);
    }
    /**
     * @override
     */
    pause(): void {
        if (!this.isStopped) {
            this._pauseTime = this.position;
        }
        this._clearBufferSource();
        if (this.gain)
            this.gain.disconnect();
        this.isStopped = true;
        ILaya.SoundManager.removeChannel(this);
        if (ILaya.SoundManager.autoReleaseSound)
            ILaya.SoundManager.disposeSoundLater(this.url);
    }
    /**
     * @override
     */
    resume(): void {
        this.startTime = this._pauseTime;
        this.play();
    }

    /**
     * 设置音量
     * @override
     */
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

    /**
     * 获取音量
     * @override
     */
    get volume(): number {
        return this._volume;
    }

}


