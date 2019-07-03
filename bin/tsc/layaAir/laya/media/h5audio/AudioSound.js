import { AudioSoundChannel } from "./AudioSoundChannel";
import { Event } from "../../events/Event";
import { EventDispatcher } from "../../events/EventDispatcher";
//import { SoundManager } from "../SoundManager"
import { URL } from "../../net/URL";
import { Render } from "../../renders/Render";
import { Browser } from "../../utils/Browser";
import { Pool } from "../../utils/Pool";
import { ILaya } from "../../../ILaya";
/**
 * @private
 * 使用Audio标签播放声音
 */
export class AudioSound extends EventDispatcher {
    constructor() {
        super(...arguments);
        /**
         * 是否已加载完成
         */
        this.loaded = false;
    }
    /**
     * 释放声音
     *
     */
    dispose() {
        var ad = AudioSound._audioCache[this.url];
        Pool.clearBySign("audio:" + this.url);
        if (ad) {
            if (!Render.isConchApp) {
                ad.src = "";
            }
            delete AudioSound._audioCache[this.url];
        }
    }
    /**@internal */
    static _initMusicAudio() {
        if (AudioSound._musicAudio)
            return;
        if (!AudioSound._musicAudio)
            AudioSound._musicAudio = Browser.createElement("audio");
        if (!Render.isConchApp) {
            Browser.document.addEventListener("mousedown", AudioSound._makeMusicOK);
        }
    }
    /**@private */
    static _makeMusicOK() {
        Browser.document.removeEventListener("mousedown", AudioSound._makeMusicOK);
        if (!AudioSound._musicAudio.src) {
            AudioSound._musicAudio.src = "";
            AudioSound._musicAudio.load();
        }
        else {
            AudioSound._musicAudio.play();
        }
    }
    /**
     * 加载声音
     * @param url
     *
     */
    load(url) {
        url = URL.formatURL(url);
        this.url = url;
        var ad;
        if (url == ILaya.SoundManager._bgMusic) {
            AudioSound._initMusicAudio();
            ad = AudioSound._musicAudio;
            if (ad.src != url) {
                AudioSound._audioCache[ad.src] = null;
                ad = null;
            }
        }
        else {
            ad = AudioSound._audioCache[url];
        }
        if (ad && ad.readyState >= 2) {
            this.event(Event.COMPLETE);
            return;
        }
        if (!ad) {
            if (url == ILaya.SoundManager._bgMusic) {
                AudioSound._initMusicAudio();
                ad = AudioSound._musicAudio;
            }
            else {
                ad = Browser.createElement("audio");
            }
            AudioSound._audioCache[url] = ad;
            ad.src = url;
        }
        ad.addEventListener("canplaythrough", onLoaded);
        ad.addEventListener("error", onErr);
        var me = this;
        function onLoaded() {
            offs();
            me.loaded = true;
            me.event(Event.COMPLETE);
        }
        function onErr() {
            ad.load = null;
            offs();
            me.event(Event.ERROR);
        }
        function offs() {
            ad.removeEventListener("canplaythrough", onLoaded);
            ad.removeEventListener("error", onErr);
        }
        this.audio = ad;
        if (ad.load) {
            ad.load();
        }
        else {
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
    play(startTime = 0, loops = 0) {
        //trace("playAudioSound");
        if (!this.url)
            return null;
        var ad;
        if (this.url == ILaya.SoundManager._bgMusic) {
            ad = AudioSound._musicAudio;
        }
        else {
            ad = AudioSound._audioCache[this.url];
        }
        if (!ad)
            return null;
        var tAd;
        tAd = Pool.getItem("audio:" + this.url);
        if (Render.isConchApp) {
            if (!tAd) {
                tAd = Browser.createElement("audio");
                tAd.src = this.url;
            }
        }
        else {
            if (this.url == ILaya.SoundManager._bgMusic) {
                AudioSound._initMusicAudio();
                tAd = AudioSound._musicAudio;
                tAd.src = this.url;
            }
            else {
                tAd = tAd ? tAd : ad.cloneNode(true);
            }
        }
        var channel = new AudioSoundChannel(tAd);
        channel.url = this.url;
        channel.loops = loops;
        channel.startTime = startTime;
        channel.play();
        ILaya.SoundManager.addChannel(channel);
        return channel;
    }
    /**
     * 获取总时间。
     */
    get duration() {
        var ad;
        ad = AudioSound._audioCache[this.url];
        if (!ad)
            return 0;
        return ad.duration;
    }
}
/**@private */
AudioSound._audioCache = {};
