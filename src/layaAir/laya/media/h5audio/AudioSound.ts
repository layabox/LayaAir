import { AudioSoundChannel } from "./AudioSoundChannel";
import { Event } from "../../events/Event"
import { EventDispatcher } from "../../events/EventDispatcher"
import { SoundChannel } from "../SoundChannel"
import { URL } from "../../net/URL"
import { Browser } from "../../utils/Browser"
import { Pool } from "../../utils/Pool"
import { LayaEnv } from "../../../LayaEnv";
import { SoundManager } from "../SoundManager";
import { AssetDb } from "../../resource/AssetDb";

/**
 * @private
 * 使用Audio标签播放声音
 */
export class AudioSound extends EventDispatcher {

    /**@private */
    private static _audioCache: any = {};
    /**
     * 声音URL
     */
    url: string;
    /**
     * 播放用的audio标签
     */
    audio: HTMLAudioElement;
    /**
     * 是否已加载完成
     */
    loaded: boolean = false;
    /**@internal */
    static _musicAudio: HTMLAudioElement;
    /**
     * 释放声音
     *
     */
    dispose(): void {
        var ad: HTMLAudioElement = AudioSound._audioCache[this.url];
        Pool.clearBySign("audio:" + this.url);
        if (ad) {
            if (!LayaEnv.isConch) {
                ad.src = "";
            }
            delete AudioSound._audioCache[this.url];
        }
    }

    /**@internal */
    static _initMusicAudio(): void {
        if (AudioSound._musicAudio) return;
        if (!AudioSound._musicAudio) AudioSound._musicAudio = (<HTMLAudioElement>Browser.createElement("audio"));
        if (!LayaEnv.isConch) {
            Browser.document.addEventListener("mousedown", AudioSound._makeMusicOK);
        }
    }

    /**@private */
    private static _makeMusicOK(): void {
        Browser.document.removeEventListener("mousedown", AudioSound._makeMusicOK);
        if (!AudioSound._musicAudio.src) {
            AudioSound._musicAudio.src = "";
            AudioSound._musicAudio.load();
        } else {
            AudioSound._musicAudio.play();
        }
    }


    /**
     * 加载声音
     * @param url
     *
     */
    load(url: string): void {
        this.url = url;
        var ad: HTMLAudioElement;
        if (url == SoundManager._bgMusic) {
            AudioSound._initMusicAudio();
            ad = AudioSound._musicAudio;
            if ((<any>ad).originalUrl != url) {
                delete AudioSound._audioCache[(<any>ad).originalUrl];
                ad = null;
            }
        } else {
            ad = AudioSound._audioCache[url];
        }
        if (ad && ad.readyState >= 2) {
            this.event(Event.COMPLETE);
            return;
        }
        if (!ad) {
            if (url == SoundManager._bgMusic) {
                AudioSound._initMusicAudio();
                ad = AudioSound._musicAudio;
            } else {
                ad = (<HTMLAudioElement>Browser.createElement("audio"));
            }
            AudioSound._audioCache[url] = ad;
            AssetDb.inst.resolveURL(url, url => {
                ad.src = URL.postFormatURL(URL.formatURL(url));
            });
        }
        (<any>ad).originalUrl = url;

        ad.addEventListener("canplaythrough", onLoaded);
        ad.addEventListener("error", onErr);
        var me: AudioSound = this;
        function onLoaded(): void {
            offs();
            me.loaded = true;
            me.event(Event.COMPLETE);
        }

        function onErr(): void {
            ad.load = null;
            offs();
            me.event(Event.ERROR);
        }

        function offs(): void {
            ad.removeEventListener("canplaythrough", onLoaded);
            ad.removeEventListener("error", onErr);
        }

        this.audio = ad;
        if (ad.load) {
            ad.load();
        } else {
            onErr();
        }

    }

    /**
     * 播放声音
     * @param startTime 起始时间
     * @param loops 循环次数
     * @return
     *
     */
    play(startTime: number = 0, loops: number = 0): SoundChannel {
        //trace("playAudioSound");
        if (!this.url)
            return null;

        var ad: HTMLAudioElement;
        if (this.url == SoundManager._bgMusic) {
            ad = AudioSound._musicAudio;
            if (ad.src != "" && (<any>ad).originalUrl != this.url) {  //@fix 清除上一次记录 防止它释放时把音乐暂停了
                delete AudioSound._audioCache[(<any>ad).originalUrl];
                AudioSound._audioCache[this.url] = ad;
            }
        } else {
            ad = AudioSound._audioCache[this.url];
        }

        if (!ad) return null;
        var tAd: HTMLAudioElement;

        tAd = Pool.getItem("audio:" + this.url);

        if (LayaEnv.isConch) {
            if (!tAd) {
                tAd = (<HTMLAudioElement>Browser.createElement("audio"));
                AssetDb.inst.resolveURL(this.url, url => {
                    tAd.src = URL.postFormatURL(URL.formatURL(url));
                });
            }
        }
        else {
            if (this.url == SoundManager._bgMusic) {
                AudioSound._initMusicAudio();
                tAd = AudioSound._musicAudio;
                AssetDb.inst.resolveURL(this.url, url => {
                    tAd.src = URL.postFormatURL(URL.formatURL(url));
                });
            } else {
                tAd = tAd ? tAd : ad.cloneNode(true) as HTMLAudioElement;
            }
        }
        (<any>tAd).originalUrl = this.url;

        var channel: AudioSoundChannel = new AudioSoundChannel(tAd);
        channel.url = this.url;
        channel.loops = loops;
        channel.startTime = startTime;
        channel.play();
        SoundManager.addChannel(channel);
        return channel;
    }

    /**
     * 获取总时间。
     */
    get duration(): number {
        var ad: HTMLAudioElement;
        ad = AudioSound._audioCache[this.url];
        if (!ad)
            return 0;
        return ad.duration;
    }
}


