import { IResourceLoader, ILoadTask, Loader } from "../net/Loader";
import { PAL } from "../platform/PlatformAdapters";

/**
 * @ignore
 * @en Used for loading audio resources using Web Audio API
 * @zh 用于使用 Web Audio API 加载音频资源
 */
class WebAudioLoader implements IResourceLoader {

    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
            return PAL.media.decodeAudioData(task.url, data);
        });
    }
}

Loader.registerLoader(["mp3", "wav", "ogg"], WebAudioLoader, Loader.SOUND);