import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { URL } from "../../net/URL";
import { LensFlareData } from "../postProcessEffect/LensFlares/LensFlareEffect";
import { ObjDecoder } from "../../loaders/ObjDecoder";

/**
 * @ignore
 * @en Usedfor loading lens flare.
 * @zh 用于加载镜头光晕数据资源。
 */
export class LensFlareSettingsLoader implements IResourceLoader {
    /**
     * @en Load lens flare from a specified URL.
     * @param task The load task that contains the URL and other loading options.
     * @returns A Promise, when loaded successfully, it is resolves with the loaded `LensFlareData` object or null if loading fails.
     * @zh 加载指定的镜头光晕数据资源。
     * @param task 包含 URL 和其他加载选项的加载任务。
     * @returns 一个Promise，加载成功时解析为加载的 `LensFlareData` 对象，加载失败时为 null。
     */
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;
            let ret = new LensFlareData();
            let elements = data.elements;
            if (!elements)
                return ret;

            let basePath = URL.getPath(task.url);
            let textures: Array<string> = elements.map((e: any) => URL.join(basePath, e.texture?._$uuid)).filter((url: string) => url != "");

            return Promise.all(textures.map(url => task.loader.load(url, task.options))).then(() => {
                ret.elements = new ObjDecoder().decodeObj(elements);
                return ret;
            });
        });
    }
}

Loader.registerLoader(["lensflare"], LensFlareSettingsLoader);