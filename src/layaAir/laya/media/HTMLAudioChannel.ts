import { SoundChannel } from "./SoundChannel"
import { PAL } from "../platform/PlatformAdapters";
import { URL } from "../net/URL";
import { Browser } from "../utils/Browser";
import { IPool, Pool } from "../utils/Pool";

/**
 * @ignore
 */
export class HTMLAudioChannel extends SoundChannel {
    private _ele: HTMLAudioElement;

    private static elementPool: IPool<HTMLAudioElement> = Pool.createPool2(() => createAudioElement(), null, ele => resetAudioElement(ele));

    get position(): number {
        if (this._ele)
            return this._ele.currentTime;
        else
            return 0;
    }

    get duration(): number {
        if (this._ele)
            return this._ele.duration;
        else
            return 0;
    }

    protected onPlay(url: string): void {
        this._ele = HTMLAudioChannel.elementPool.take();
        Browser.container.appendChild(this._ele);

        this._loaded = true;
        let ele = this._ele;
        ele.onerror = (event: Event | string) => {
            console.error("HTMLAudioChannel: ", event);
            this.stop();
        };
        ele.onended = () => this.onPlayEnd();
        ele.src = URL.postFormatURL(URL.formatURL(url));
        ele.playbackRate = this.playbackRate;
        ele.currentTime = this.startTime;
        ele.loop = this.loops === 0;
        ele.volume = this._volume;
        ele.muted = this._muted;
        if (!this._paused) {
            this._ele.play().catch(e => {
                if (e.name === "NotAllowedError" && this._isMusic)
                    PAL.media.resumeUntilGotFocus(this);
                else
                    console.warn(e);
            });
        }
    }

    protected onPlayAgain(): void {
        this._ele.currentTime = this.startTime;
        this._ele.play().catch(e => { });
    }

    protected onStop(): void {
        this._ele.pause();
        HTMLAudioChannel.elementPool.recover(this._ele);
        this._ele = null;
    }

    protected onPause(): void {
        this._ele.pause();
    }

    protected onResume(): void {
        if (this._ele.readyState === 0) //当音频放到后台一定时间后，会被卸载，音频会断开连接，并将readyState重置为0 ??是这样吗，遗留代码，未知效果
            this._ele.load();
        this._ele.play().catch(e => { });
    }

    protected onVolumeChanged(): void {
        this._ele.volume = this._volume;
    }

    protected onMuted(): void {
        this._ele.muted = this._muted;
    }
}

//pool support

function createAudioElement() {
    return Browser.createElement("audio");
}

function resetAudioElement(ele: HTMLAudioElement) {
    ele.remove();
    ele.src = "";
    ele.onended = null;
    ele.onerror = null;
    ele.oncanplay = null;
    ele.oncanplaythrough = null;
}