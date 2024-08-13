import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { AssetDb } from "../../resource/AssetDb";
import { MeshReader } from "./MeshReader";

/**
 * @ignore
 * @en Used for loading mesh resources.
 * @zh 用于加载模型网格资源(.lm)。
 */
class MeshLoader implements IResourceLoader {

    /**
     * @ignore
     * @en Load mesh data from the specified URL.
     * @param task The load task that contains the URL and other loading options.
     * @returns A Promise, when loaded successfully, it is resolves with the loaded mesh data or null if loading fails.
     * @zh 加载指定的模型网格数据。
     * @param task 包含 URL 和其他加载选项的加载任务。
     * @returns 一个Promise，当加载成功时解析为加载的网格数据，加载失败时为 null。
     */
    load(task: ILoadTask) {
        let url = AssetDb.inst.getSubAssetURL(task.url, task.uuid, null, "lm");
        return task.loader.fetch(url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            return MeshReader._parse(data);
        });
    }
}

Loader.registerLoader(["lm"], MeshLoader, Loader.MESH);