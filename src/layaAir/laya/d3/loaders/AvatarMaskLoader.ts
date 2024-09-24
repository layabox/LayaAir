import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { AvatarMask } from "../component/Animator/AvatarMask";

/**
 * @ignore
 * @en User for loading avatar masks(.lavm).
 * @zh 加载动画遮罩资源（.lavm）。
 */
class AvatarMaskLoader implements IResourceLoader {
    /**
     * @ignore
     * @en Loads the avatar mask resource for the given task.
     * @param task The load task.
     * @returns A promise that resolves with the loaded avatar mask or null if the data is not available.
     * @zh 为给定任务加载动画遮罩资源。
     * @param task 加载任务。
     * @returns 一个 Promise，该 Promise 将在资源可用时解析为已加载的 AvatarMask，否则为 null。
     */
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            return new AvatarMask(data);
        });
    }
}

Loader.registerLoader(["lavm"], AvatarMaskLoader);