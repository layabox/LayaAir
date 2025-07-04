import { WebAudioChannel } from "../../laya/media/WebAudioChannel";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { MgBrowserAdapter } from "../minigame/MgBrowserAdapter";
import { MgVideoPlayer } from "../minigame/MgVideoPlayer";
import { TtVideoTexture } from "./TtVideoTexture";

MgBrowserAdapter.beforeInit = function () {
    Browser.onTTMiniGame = true;
    Browser.isIOSHighPerformanceMode = GameGlobal.isIOSHighPerformanceMode;
    Browser.isIOSHighPerformanceModePlus = GameGlobal.isIOSHighPerformanceModePlus;
    PAL.g = (window as any).tt;
};

MgBrowserAdapter.afterInit = function () {
    PAL.media.shortAudioClass = WebAudioChannel; //抖音支持标准的WebAudio API，所以用这个，不用innerAudio

    if (Browser.onDevTools) { //devtools下报错，而且报错会使主循环失效，只能屏蔽
        PAL.media.videoTextureClass = null;
        PAL.media.videoPlayerClass = null;
    }
    else {
        PAL.media.videoTextureClass = TtVideoTexture;
        PAL.media.videoPlayerClass = MgVideoPlayer;
    }
};