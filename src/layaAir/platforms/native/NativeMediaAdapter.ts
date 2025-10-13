import { HTMLAudioChannel } from "../../laya/media/HTMLAudioChannel";
import { MediaAdapter } from "../../laya/platform/MediaAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { NativeVideoPlayer } from "./NativeVideoPlayer";
import { NativeVideoTexture } from "./NativeVideoTexture";

export class NativeMediaAdapter extends MediaAdapter {

    protected init() {
        this.shortAudioClass = HTMLAudioChannel;
        this.longAudioClass = HTMLAudioChannel;
        this.videoPlayerClass = PAL.hasAPI("createVideo") ? NativeVideoPlayer : null;;
        this.videoTextureClass = NativeVideoTexture;
    }
}

PAL.register("media", NativeMediaAdapter);