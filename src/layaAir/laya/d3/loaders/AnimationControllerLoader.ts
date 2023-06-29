import { AnimatorController2D } from "../../components/AnimatorController2D";
import { TypeAnimatorLayer, TypeAnimatorState } from "../../components/AnimatorControllerParse";
import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { AnimatorController } from "../component/Animator/AnimatorController";
import { URL } from "../../net/URL";

class AnimationControllerLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.2), task.options).then(data => {
            let ret = task.ext == "controller" ? new AnimatorController(data) : new AnimatorController2D(data);

            if (ret && ret.data && ret.data.controllerLayers) {
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

    loadAvatarMask(l: TypeAnimatorLayer, promises: Array<any>, task: ILoadTask) {
        let basePath = URL.getPath(task.url);
        if (l.avatarMask && l.avatarMask._$uuid) {
            let url = URL.getResURLByUUID(l.avatarMask._$uuid);
            if (!url.startsWith("res://"))
                url = URL.join(basePath, url);
            promises.push(task.loader.load(url).then(res => {
                l.avatarMask = res;
            }));
        }
    }


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
Loader.registerLoader(["controller"], AnimationControllerLoader, "AnimationController");
Loader.registerLoader(["mcc"], AnimationControllerLoader, "AnimationController2D");