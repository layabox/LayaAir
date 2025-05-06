import { ILoadTask } from "../../laya/net/Loader";
import { FontAdapter } from "../../laya/platform/FontAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { ClassUtils } from "../../laya/utils/ClassUtils";
import { Utils } from "../../laya/utils/Utils";

export class NativeFontAdapter extends FontAdapter {

    loadFont(task: ILoadTask): Promise<{ family: string } | null> {
        let fontName = Utils.replaceFileExtension(Utils.getBaseName(task.url), "");
        return task.loader.fetch(task.url, "arraybuffer").then(data => {
            if (data)
                PAL.global.registerFont(fontName, data);
            return { family: fontName };
        });
    }
}

ClassUtils.regClass("PAL.Font", NativeFontAdapter);