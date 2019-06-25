import { Event } from "../../events/Event";
import { SoundChannel } from "../SoundChannel";
//import { SoundManager } from "../SoundManager"
import { Browser } from "../../utils/Browser";
import { Utils } from "../../utils/Utils";
import { ILaya } from "../../../ILaya";
//import { WebAudioSound } from "./WebAudioSound";
/**
 * @private
 * web audio api方式播放声音的音轨控制
 */
export class WebAudioSoundChannel extends SoundChannel {
    constructor() {
        super();
        /**
         * 播放用的数据
         */
        this.bufferSource = null;
        /**
         * 当前时间
         */
        this._currentTime = 0;
        /**
         * 当前音量
         */
        this._volume = 1;
        /**
         * 播放开始时的时间戳
         */
        this._startTime = 0;
        this._pauseTime = 0;
        /**
         * 播放设备
         */
        this.context = ILaya.WebAudioSound.ctx;
        this._onPlayEnd = Utils.bind(this.__onPlayEnd, this);
        if (this.context["createGain"]) {
            this.gain = this.context["createGain"]();
        }
        else {
            this.gain = this.context["createGainNode"]();
        }
    }
    /**
     * 播放声音
     */
    /*override*/ play() {
        ILaya.SoundManager.addChannel(this);
        this.isStopped = false;
        this._clearBufferSource();
        if (!this.audioBuffer)
            return;
        var context = this.context;
        var gain = this.gain;
        var bufferSource = context.createBufferSource();
        this.bufferSource = bufferSource;
        bufferSource.buffer = this.audioBuffer;
        bufferSource.connect(gain);
        if (gain)
            gain.disconnect();
        gain.connect(context.destination);
        bufferSource.onended = this._onPlayEnd;
        if (this.startTime >= this.duration)
            this.startTime = 0;
        this._startTime = Browser.now();
        if (this.gain.gain.setTargetAtTime) {
            this.gain.gain.setTargetAtTime(this._volume, this.context.currentTime, WebAudioSoundChannel.SetTargetDelay);
        }
        else
            this.gain.gain.value = this._volume;
        if (this.loops == 0) {
            bufferSource.loop = true;
        }
        if (bufferSource.playbackRate.setTargetAtTime) {
            bufferSource.playbackRate.setTargetAtTime(ILaya.SoundManager.playbackRate, this.context.currentTime, WebAudioSoundChannel.SetTargetDelay);
        }
        else
            bufferSource.playbackRate.value = ILaya.SoundManager.playbackRate;
        bufferSource.start(0, this.startTime);
        this._currentTime = 0;
    }
    __onPlayEnd() {
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
     */
    /*override*/ get position() {
        if (this.bufferSource) {
            return (Browser.now() - this._startTime) / 1000 + this.startTime;
        }
        return 0;
    }
    /*override*/ get duration() {
        if (this.audioBuffer) {
            return this.audioBuffer.duration;
        }
        return 0;
    }
    _clearBufferSource() {
        if (this.bufferSource) {
            var sourceNode = this.bufferSource;
            if (sourceNode.stop) {
                sourceNode.stop(0);
            }
            else {
                sourceNode.noteOff(0);
            }
            sourceNode.disconnect(0);
            sourceNode.onended = null;
            if (!WebAudioSoundChannel._tryCleanFailed)
                this._tryClearBuffer(sourceNode);
            this.bufferSource = null;
        }
    }
    _tryClearBuffer(sourceNode) {
        if (!Browser.onMac) {
            try {
                sourceNode.buffer = null;
            }
            catch (e) {
                WebAudioSoundChannel._tryCleanFailed = true;
            }
            return;
        }
        try {
            sourceNode.buffer = ILaya.WebAudioSound._miniBuffer;
        }
        catch (e) {
            WebAudioSoundChannel._tryCleanFailed = true;
        }
    }
    /**
     * 停止播放
     */
    /*override*/ stop() {
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
    /*override*/ pause() {
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
    /*override*/ resume() {
        this.startTime = this._pauseTime;
        this.play();
    }
    /**
     * 设置音量
     */
    /*override*/ set volume(v) {
        this._volume = v;
        if (this.isStopped) {
            return;
        }
        if (this.gain.gain.setTargetAtTime) {
            this.gain.gain.setTargetAtTime(v, this.context.currentTime, WebAudioSoundChannel.SetTargetDelay);
        }
        else
            this.gain.gain.value = v;
    }
    /**
     * 获取音量
     */
    /*override*/ get volume() {
        return this._volume;
    }
}
WebAudioSoundChannel._tryCleanFailed = false;
WebAudioSoundChannel.SetTargetDelay = 0.001;
