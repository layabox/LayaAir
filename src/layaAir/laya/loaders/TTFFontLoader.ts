import { IResourceLoader, ILoadTask, Loader } from "../net/Loader";
import { PAL } from "../platform/PlatformAdapters";

class TTFFontLoader implements IResourceLoader {

    load(task: ILoadTask) {
        return PAL.font.loadFont(task);
    }
}

Loader.registerLoader(["ttf", "woff", "woff2", "otf"], TTFFontLoader, Loader.TTF);