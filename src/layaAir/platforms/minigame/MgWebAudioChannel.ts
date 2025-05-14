import { PAL } from "../../laya/platform/PlatformAdapters";
import { MgInnerAudioChannel } from "./MgInnerAudioChannel";

export class MgWebAudioChannel extends MgInnerAudioChannel {
    constructor(url: string) {
        super(url);
    }

    protected createContext(): WechatMinigame.InnerAudioContext {
        //目前应该只有微信支持useWebAudioImplement这个开关，其他平台直接fallback到原生的innerAudioContext
        return (<WechatMinigame.Wx>PAL.global).createInnerAudioContext({ useWebAudioImplement: true });
    }
}