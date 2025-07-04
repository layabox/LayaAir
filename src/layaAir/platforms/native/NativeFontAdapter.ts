import { ILoadTask } from "../../laya/net/Loader";
import { FontAdapter } from "../../laya/platform/FontAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Utils } from "../../laya/utils/Utils";

export class NativeFontAdapter extends FontAdapter {

    loadFont(task: ILoadTask): Promise<{ family: string } | null> {
        let fontName = Utils.replaceFileExtension(Utils.getBaseName(task.url), "");
        return task.loader.fetch(task.url, "arraybuffer").then(data => {
            if (data)
                PAL.g.registerFont(fontName, data);
            return { family: fontName };
        });
    }
}

PAL.register("font", NativeFontAdapter);