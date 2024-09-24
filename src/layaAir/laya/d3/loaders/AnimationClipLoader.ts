import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { AssetDb } from "../../resource/AssetDb";
import { AnimationClip } from "../animation/AnimationClip";

/**
 * @ignore
 * @en Used for loading and parsing 3D animation (.lani) resources.
 * @zh 用于加载并解析3D动画(.lani)资源。
 */
class AnimationClipLoader implements IResourceLoader {
    /**
     * @ignore
     * @en Loads the resource for the given task.
     * @param task The load task.
     * @returns A promise that resolves with the loaded AnimationClip or null if loading fails.
     * @zh 为给定的任务加载资源。
     * @param task 加载任务。
     * @returns 一个 Promise，解析为加载的 AnimationClip 对象，如果加载失败则返回 null。
     */
    load(task: ILoadTask) {
        let url = AssetDb.inst.getSubAssetURL(task.url, task.uuid, null, "lani");
        return task.loader.fetch(url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
            if (!data) {
                return null;
            }
            return AnimationClip._parse(data);
        });
    }
}

Loader.registerLoader(["lani"], AnimationClipLoader, Loader.ANIMATIONCLIP);