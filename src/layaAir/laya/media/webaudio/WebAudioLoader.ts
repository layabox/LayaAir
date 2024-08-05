import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { WebAudioSound } from "./WebAudioSound";

/**
 * @en Used for loading audio resources using Web Audio API
 * @zh 用于使用 Web Audio API 加载音频资源
 */
class WebAudioLoader implements IResourceLoader {
    /**
     * @en Load audio resource
     * @param task The load task containing information about the resource to be loaded
     * @returns A promise that resolves with the decoded audio data
     * @zh 加载音频资源
     * @param task 包含要加载的资源信息的加载任务
     * @returns 一个 Promise，解析为解码后的音频数据
     */
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            return WebAudioSound.ctx.decodeAudioData(data);
        });
    }
}

Loader.registerLoader(["mp3", "wav", "ogg"], WebAudioLoader, Loader.SOUND);