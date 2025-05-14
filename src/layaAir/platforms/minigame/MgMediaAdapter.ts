import { VideoPlayer } from "../../laya/media/VideoPlayer";
import { VideoTexture } from "../../laya/media/VideoTexture";
import { MediaAdapter } from "../../laya/platform/MediaAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { MgInnerAudioChannel } from "./MgInnerAudioChannel";
import { MgVideoPlayer } from "./MgVideoPlayer";
import { WxVideoTexture } from "../weixin/WxVideoTexture";
import { MgWebAudioChannel } from "./MgWebAudioChannel";

var mg: WechatMinigame.Wx;

export class MgMediaAdapter extends MediaAdapter {

    protected init() {
        mg = PAL.global;

        if (mg.createWebAudioContext) //weixin
            this.ctx = <any>mg.createWebAudioContext();
        else if ((mg as any).getAudioContext) //douyin
            this.ctx = (mg as any).getAudioContext();

        this.longAudioClass = MgInnerAudioChannel;
        this.shortAudioClass = MgWebAudioChannel;

        this.videoPlayerClass = mg.createVideo ? MgVideoPlayer : VideoPlayer;
        this.videoTextureClass = mg.createVideoDecoder ? WxVideoTexture : VideoTexture;
    }
}

PAL.register("media", MgMediaAdapter);