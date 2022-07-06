import { Event as LayaEvent } from "../../events/Event"
import { SoundChannel } from "../SoundChannel"
//import { SoundManager } from "../SoundManager"
import { Render } from "../../renders/Render"
import { Browser } from "../../utils/Browser"
import { ILaya } from "../../../ILaya";

/**
 * @private
 * audio标签播放声音的音轨控制
 */
export class AudioSoundChannel extends SoundChannel {

    /**
     * 播放用的audio标签
     */
    private _audio: HTMLAudioElement = null;
    private _onEnd: (evt: Event) => void;
    private _resumePlay: (evt: Event) => void;

    constructor(audio: HTMLAudioElement) {
        super();
        this._onEnd = this.__onEnd.bind(this);
        this._resumePlay = this.__resumePlay.bind(this);
        audio.addEventListener("ended", this._onEnd);
        this._audio = audio;
    }

    private __onEnd(evt: Event): void {
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

    private __resumePlay(): void {
        if (this._audio) this._audio.removeEventListener("canplay", this._resumePlay as any);
        if (this.isStopped) return;
        try {
            this._audio.currentTime = this.startTime;
            Browser.container.appendChild(this._audio);
            this._audio.play();
        } catch (e) {
            //this.audio.play();
            this.event(LayaEvent.ERROR);
        }
    }

    /**
     * 播放
     * @override
     */
    play(): void {
        this.isStopped = false;
        try {
            this._audio.playbackRate = ILaya.SoundManager.playbackRate;
            this._audio.currentTime = this.startTime;
        } catch (e) {
            this._audio.addEventListener("canplay", this._resumePlay as any);
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
     * @override
     *
     */
    get position(): number {
        if (!this._audio)
            return 0;
        return this._audio.currentTime;
    }

    /**
     * 获取总时间。
     * @override
     */
    get duration(): number {
        if (!this._audio)
            return 0;
        return this._audio.duration;
    }

    /**
     * 停止播放
     * @override
     */
    stop(): void {
        //trace("stop and remove event");
        super.stop();
        this.isStopped = true;
        ILaya.SoundManager.removeChannel(this);
        this.completeHandler = null;
        if (!this._audio)
            return;
        if ("pause" in this._audio)
            //理论上应该全部使用stop，但是不知为什么，使用pause，为了安全我只修改在加速器模式下再调用一次stop
            if (ILaya.Render.isConchApp) {
                (this._audio as any).stop();
            }
        this._audio.pause();
        this._audio.removeEventListener("ended", this._onEnd as EventListener);
        this._audio.removeEventListener("canplay", this._resumePlay);
        //ie下使用对象池可能会导致后面的声音播放不出来
        if (!ILaya.Browser.onIE) {
            if (this._audio != ILaya.AudioSound._musicAudio) {
                ILaya.Pool.recover("audio:" + this.url, this._audio);
            }
        }
        Browser.removeElement(this._audio);
        this._audio = null;
        if (ILaya.SoundManager.autoReleaseSound)
            ILaya.SoundManager.disposeSoundLater(this.url);
    }
    /**
     * @override
     */
    pause(): void {
        this.isStopped = true;
        ILaya.SoundManager.removeChannel(this);
        if (!this._audio)
            return;
        if ("pause" in this._audio)
            this._audio.pause();
        if (ILaya.SoundManager.autoReleaseSound)
            ILaya.SoundManager.disposeSoundLater(this.url);
    }
    /**
     * @override
     */
    resume(): void {
        var audio = this._audio;
        if (!audio)
            return;
        this.isStopped = false;
        if (audio.readyState == 0) { //当音频放到后台一定时间后，会被卸载，音频会断开连接，并将readyState重置为0
            audio.src = this.url;
            audio.addEventListener("canplay", this._resumePlay as any);
            audio.load();
        }
        ILaya.SoundManager.addChannel(this);
        if ("play" in audio) {
            audio.play();
        }
    }

    /**
     * 设置音量
     * @param v
     * @override
     *
     */
    set volume(v: number) {
        if (!this._audio) return;
        this._audio.volume = v;
    }

    /**
     * 获取音量
     * @return
     * @override
     *
     */
    get volume(): number {
        if (!this._audio) return 1;
        return this._audio.volume;
    }

}


