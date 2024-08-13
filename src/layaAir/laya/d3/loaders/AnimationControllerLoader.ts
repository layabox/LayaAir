import { TypeAnimatorLayer, TypeAnimatorState } from "../../components/AnimatorControllerParse";
import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { AnimatorController } from "../component/Animator/AnimatorController";
import { URL } from "../../net/URL";
/**
 * @ignore
 * @en Used for loading and handling 3D animation controllers.
 * @zh 用于加载与处理3D动画状态机。
 */
class AnimationControllerLoader implements IResourceLoader {
    /**
     * @ignore
     * @en Loads the animation controller resource for the given task.
     * @param task The load task.
     * @returns A promise that resolves with the loaded AnimatorController.
     * @zh 为给定任务加载3D动画状态机资源
     * @param task 加载任务。
     * @returns 一个 Promise，解析为加载的 AnimatorController 对象。
     */
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.2), task.options).then(data => {
            let ret = new AnimatorController(data);
            if (ret.data && ret.data.controllerLayers) {
                let layers = ret.data.controllerLayers;
                let promises: Array<any> = [];
                for (let i = layers.length - 1; i >= 0; i--) {
                    if (layers[i].avatarMask) {
                        this.loadAvatarMask(layers[i], promises, task);
                    }
                    let states = layers[i].states;
                    this.loadStates(states, promises, task);

                }
                return Promise.all(promises).then(() => ret);
            }
            else
                return ret;
        });
    }
    /**
     * @ignore
     * @en Loads the avatar mask for a given animator layer.
     * @param l The animator layer.
     * @param promises The list of promises for asynchronous loading.
     * @param task The load task.
     * @zh 为给定的动画层加载动画遮罩。
     * @param l 动画层。
     * @param promises 异步加载的 Promise 列表。
     * @param task 加载任务。
     */
    loadAvatarMask(l: TypeAnimatorLayer, promises: Array<any>, task: ILoadTask) {
        let basePath = URL.getPath(task.url);
        if (l.avatarMask && l.avatarMask._$uuid && '' != l.avatarMask._$uuid) {
            let url = URL.getResURLByUUID(l.avatarMask._$uuid);
            if (!url.startsWith("res://"))
                url = URL.join(basePath, url);
            promises.push(task.loader.load(url).then(res => {
                l.avatarMask = res;
            }));
        } else {
            l.avatarMask = null;
        }
    }

    /**
     * @ignore
     * @en Recursively loads states for animator states.
     * @param states The animator states.
     * @param promises The list of promises for asynchronous loading.
     * @param task The load task.
     * @zh 递归地加载动画状态。
     * @param states 动画状态。
     * @param promises 异步加载的 Promise 列表。
     * @param task 加载任务。
     */
    loadStates(states: TypeAnimatorState[], promises: Array<any>, task: ILoadTask) {
        let basePath = URL.getPath(task.url);
        for (let j = states.length - 1; j >= 0; j--) {
            if (states[j].clip && states[j].clip._$uuid) {
                let url = URL.getResURLByUUID(states[j].clip._$uuid);
                if (!url.startsWith("res://"))
                    url = URL.join(basePath, url);
                promises.push(task.loader.load(url).then(res => {
                    states[j].clip = res;
                }));

                // promises.push(task.loader.load("res://" + states[j].clip._$uuid).then(res => {
                //     states[j].clip = res;
                // }));
            }

            if (states[j].states) {
                this.loadStates(states[j].states, promises, task);
            }
        }
    }
}

Loader.registerLoader(["controller"], AnimationControllerLoader);