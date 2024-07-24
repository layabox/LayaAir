import { ILoadTask, IResourceLoader, Loader } from "../net/Loader";
import { Utils } from "../utils/Utils";
import { Templet } from "./bone/Templet";

/**
 * @en Loader class for Templet resources
 * @zh Templet资源的加载器类
 */
class TempletLoader implements IResourceLoader {
    /**
     * @en Loads and parses an animation template and its associated texture.
     * @param task The load task containing the URL of the animation file and other loading parameters.
     * @returns A promise that resolves to a parsed Templet object, or null if either the animation data or texture fails to load.
     * @zh 加载并解析动画模板及其关联的纹理。
     * @param task 包含动画文件URL和其他加载参数的加载任务对象。
     * @returns 返回一个Promise，解析为已解析的Templet对象，如果动画数据或纹理加载失败则为null。
     */
    load(task: ILoadTask) {
        return Promise.all([
            task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(), task.options),
            task.loader.load(Utils.replaceFileExtension(task.url, "png"), null, task.progress.createCallback())
        ]).then(res => {
            if (!res[0] || !res[1])
                return null;

            let templet = new Templet();
            templet._parse(res[1], task.url, res[0]);
            return templet;
        });
    }
}

Loader.registerLoader(["sk"], TempletLoader);