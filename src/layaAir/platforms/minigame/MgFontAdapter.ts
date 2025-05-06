import { ILoadTask } from "../../laya/net/Loader";
import { FontAdapter } from "../../laya/platform/FontAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { ClassUtils } from "../../laya/utils/ClassUtils";

export class MgFontAdapter extends FontAdapter {

    loadFont(task: ILoadTask): Promise<{ family: string } | null> {
        return task.loader.fetch(task.url, <any>"filePath", task.progress.createCallback(), task.options).then((filePath: string) => {
            if (filePath) {
                let fontFamily = (<WechatMinigame.Wx>PAL.global).loadFont(filePath);
                return fontFamily ? { family: fontFamily } : null;
            }
            else
                return null;
        });
    }
}

ClassUtils.regClass("PAL.Font", MgFontAdapter);