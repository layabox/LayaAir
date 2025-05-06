import { Sprite } from "../../laya/display/Sprite";
import { SoundChannel } from "../../laya/media/SoundChannel";
import { VideoPlayer } from "../../laya/media/VideoPlayer";
import { VideoTexture } from "../../laya/media/VideoTexture";
import { MediaAdapter } from "../../laya/platform/MediaAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { ClassUtils } from "../../laya/utils/ClassUtils";
import { IPool, Pool } from "../../laya/utils/Pool";
import { MgInnerAudioChannel } from "./media/MgInnerAudioChannel";
import { MgVideoPlayer } from "./media/MgVideoPlayer";
import { MgVideoTexture } from "./media/MgVideoTexture";

var mg: WechatMinigame.Wx;

export class MgMediaAdapter extends MediaAdapter {
    innerCtxPool: IPool<WechatMinigame.InnerAudioContext>;
    webAudioCtxPool: IPool<WechatMinigame.InnerAudioContext>;
    touchToStart: boolean = false;
    supportWebAudio: boolean;

    protected init() {
        mg = PAL.global;
        this.innerCtxPool = Pool.createPool2(() => this.createInnerAudioContext(), null, ctx => this.resetInnerAudioContext(ctx));
        this.webAudioCtxPool = Pool.createPool2(() => this.createInnerAudioContext(true), null, ctx => this.resetInnerAudioContext(ctx));

        this.supportWebAudio = typeof (mg.createWebAudioContext) === "function";
    }

    createSoundChannel(url: string, useWebAudioImplement: boolean): SoundChannel {
        let channel: SoundChannel;
        if (this.supportWebAudio && useWebAudioImplement)
            channel = new MgInnerAudioChannel(url, true);
        else
            channel = new MgInnerAudioChannel(url);
        return channel;
    }

    private _warned: boolean = false;
    createVideoTexture(): VideoTexture {
        if (mg.createVideoDecoder)
            return new MgVideoTexture();
        else {
            if (!this._warned) {
                console.warn("VideoTexture is not supported in this platform.");
                this._warned = true;
            }
            return new VideoTexture();
        }
    }

    createVideoPlayer(owner: Sprite): VideoPlayer {
        return new MgVideoPlayer();
    }

    private createInnerAudioContext(useWebAudioImplement?: boolean): WechatMinigame.InnerAudioContext {
        return mg.createInnerAudioContext({ useWebAudioImplement });
    }

    private resetInnerAudioContext(ctx: WechatMinigame.InnerAudioContext) {
        ctx.offError();
        ctx.offEnded();
        ctx.offCanplay();
    }
}

ClassUtils.regClass("PAL.Media", MgMediaAdapter);