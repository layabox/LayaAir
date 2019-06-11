import { Event as LayaEvent } from "../../events/Event";
import { SoundChannel } from "../SoundChannel";
//import { SoundManager } from "../SoundManager"
import { Render } from "../../renders/Render";
import { Browser } from "../../utils/Browser";
import { ILaya } from "../../../ILaya";
/**
 * @private
 * audio标签播放声音的音轨控制
 */
export class AudioSoundChannel extends SoundChannel {
    constructor(audio) {
        super();
        /**
         * 播放用的audio标签
         */
        this._audio = null;
        this._onEnd = this.__onEnd.bind(this);
        this._resumePlay = this.__resumePlay.bind(this);
        audio.addEventListener("ended", this._onEnd);
        this._audio = audio;
    }
    __onEnd(evt) {
        if (this.loops == 1) {
            if (this.completeHandler) {
                ILaya.systemTimer.once(10, this, this.__runComplete, [this.completeHandler], false);
                this.completeHandler = null;
            }
            this.stop();
            this.event(LayaEvent.COMPLETE);
            return;
        }
        if (this.loops > 0) {
            this.loops--;
        }
        this.startTime = 0;
        this.play();
    }
    __resumePlay() {
        if (this._audio)
            this._audio.removeEventListener("canplay", this._resumePlay);
        if (this.isStopped)
            return;
        try {
            this._audio.currentTime = this.startTime;
            Browser.container.appendChild(this._audio);
            this._audio.play();
        }
        catch (e) {
            //this.audio.play();
            this.event(LayaEvent.ERROR);
        }
    }
    /**
     * 播放
     */
    /*override*/ play() {
        this.isStopped = false;
        try {
            this._audio.playbackRate = ILaya.SoundManager.playbackRate;
            this._audio.currentTime = this.startTime;
        }
        catch (e) {
            this._audio.addEventListener("canplay", this._resumePlay);
            return;
        }
        ILaya.SoundManager.addChannel(this);
        Browser.container.appendChild(this._audio);
        if ("play" in this._audio)
            this._audio.play();
    }
    /**
     * 当前播放到的位置
     * @return
     *
     */
    /*override*/ get position() {
        if (!this._audio)
            return 0;
        return this._audio.currentTime;
    }
    /**
     * 获取总时间。
     */
    /*override*/ get duration() {
        if (!this._audio)
            return 0;
        return this._audio.duration;
    }
    /**
     * 停止播放
     *
     */
    /*override*/ stop() {
        //trace("stop and remove event");
        super.stop();
        this.isStopped = true;
        ILaya.SoundManager.removeChannel(this);
        this.completeHandler = null;
        if (!this._audio)
            return;
        if ("pause" in this._audio)
            //理论上应该全部使用stop，但是不知为什么，使用pause，为了安全我只修改在加速器模式下再调用一次stop
            if (Render.isConchApp) {
                this._audio.stop();
            }
        this._audio.pause();
        this._audio.removeEventListener("ended", this._onEnd);
        this._audio.removeEventListener("canplay", this._resumePlay);
        //ie下使用对象池可能会导致后面的声音播放不出来
        if (!ILaya.Browser.onIE) {
            if (this._audio != ILaya.AudioSound._musicAudio) {
                ILaya.Pool.recover("audio:" + this.url, this._audio);
            }
        }
        Browser.removeElement(this._audio);
        this._audio = null;
    }
    /*override*/ pause() {
        this.isStopped = true;
        ILaya.SoundManager.removeChannel(this);
        if ("pause" in this._audio)
            this._audio.pause();
    }
    /*override*/ resume() {
        if (!this._audio)
            return;
        this.isStopped = false;
        ILaya.SoundManager.addChannel(this);
        if ("play" in this._audio)
            this._audio.play();
    }
    /**
     * 设置音量
     * @param v
     *
     */
    /*override*/ set volume(v) {
        if (!this._audio)
            return;
        this._audio.volume = v;
    }
    /**
     * 获取音量
     * @return
     *
     */
    /*override*/ get volume() {
        if (!this._audio)
            return 1;
        return this._audio.volume;
    }
}
