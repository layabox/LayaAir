import { SoundChannel } from "../../laya/media/SoundChannel";
import { VideoPlayer } from "../../laya/media/VideoPlayer";
import { VideoTexture } from "../../laya/media/VideoTexture";
import { MediaAdapter } from "../../laya/platform/MediaAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { ClassUtils } from "../../laya/utils/ClassUtils";
import { MgInnerAudioChannel, MgWebAudioChannel } from "./MgInnerAudioChannel";
import { MgVideoPlayer } from "./MgVideoPlayer";
import { WxVideoTexture } from "../weixin/WxVideoTexture";

var mg: WechatMinigame.Wx;

export class MgMediaAdapter extends MediaAdapter {
    touchToStart: boolean = false;

    innerAudioClass: new (url: string) => SoundChannel;
    webAudioClass: new (url: string) => SoundChannel;
    videoTextureClass: new () => VideoTexture;
    videoPlayerClass: new () => VideoPlayer;

    protected init() {
        mg = PAL.global;

        this.innerAudioClass = MgInnerAudioChannel;
        this.webAudioClass = mg.createWebAudioContext ? MgWebAudioChannel : MgInnerAudioChannel;

        this.videoPlayerClass = mg.createVideo ? MgVideoPlayer : VideoPlayer;
        this.videoTextureClass = mg.createVideoDecoder ? WxVideoTexture : VideoTexture;
    }

    createSoundChannel(url: string, useWebAudioImplement: boolean): SoundChannel {
        let channel: SoundChannel;
        if (useWebAudioImplement)
            channel = new this.webAudioClass(url);
        else
            channel = new this.innerAudioClass(url);
        return channel;
    }

    private _warned: boolean = false;
    createVideoTexture(): VideoTexture {
        if (this.videoTextureClass === VideoTexture && !this._warned) {
            console.warn("VideoTexture is not supported in this platform.");
            this._warned = true;
        }
        return new this.videoTextureClass();
    }

    private _warned2: boolean = false;
    createVideoPlayer(): VideoPlayer {
        if (this.videoPlayerClass === VideoPlayer && !this._warned2) {
            console.warn("VideoPlayer is not supported in this platform.");
            this._warned2 = true;
        }
        return new this.videoPlayerClass();
    }
}

ClassUtils.regClass("PAL.Media", MgMediaAdapter);