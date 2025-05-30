import { MediaAdapter } from "../../laya/platform/MediaAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { MgInnerAudioChannel } from "./MgInnerAudioChannel";
import { MgVideoPlayer } from "./MgVideoPlayer";
import { MgWebAudioChannel } from "./MgWebAudioChannel";

export class MgMediaAdapter extends MediaAdapter {

    protected init() {
        if (PAL.g.createWebAudioContext) //weixin
            this.audioCtx = <any>PAL.g.createWebAudioContext();
        else if (PAL.g.getAudioContext) //douyin
            this.audioCtx = PAL.g.getAudioContext();

        this.longAudioClass = MgInnerAudioChannel;
        this.shortAudioClass = MgWebAudioChannel;

        this.videoPlayerClass = PAL.g.createVideo ? MgVideoPlayer : null;
        this.videoTextureClass = null;
    }
}

PAL.register("media", MgMediaAdapter);