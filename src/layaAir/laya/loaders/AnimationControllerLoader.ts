import { AnimatorController2D } from "../components/AnimatorController2D";
import { AnimatorController } from "../d3/component/Animator/AnimatorController";
import { ILoadTask, IResourceLoader, Loader } from "../net/Loader";
class AnimationControllerLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.2), task.options).then(async data => {
            let ret = new AnimatorController(data);

            if (ret && ret.data && ret.data.controllerLayers) {
                let layers = ret.data.controllerLayers;
                for (let i = layers.length - 1; i >= 0; i--) {
                    let states = layers[i].states;

                    for (let j = states.length - 1; j >= 0; j--) {
                        if (states[j].clip && states[j].clip._$uuid) {
                            states[j].clip = await task.loader.load("res://" + states[j].clip._$uuid);
                        }
                    }
                }

            }

            return ret;
        });
    }
}
Loader.registerLoader(["controller"], AnimationControllerLoader, "AnimationController");


class AnimationControllerLoader2D implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.2), task.options).then(async data => {
            let ret = new AnimatorController2D(data);

            if (ret && ret.data && ret.data.controllerLayers) {
                let layers = ret.data.controllerLayers;
                for (let i = layers.length - 1; i >= 0; i--) {
                    let states = layers[i].states;

                    for (let j = states.length - 1; j >= 0; j--) {
                        if (states[j].clip && states[j].clip._$uuid) {
                            states[j].clip = await task.loader.load("res://" + states[j].clip._$uuid);
                        }
                    }
                }

            }

            return ret;
        });
    }
}
Loader.registerLoader(["mcc"], AnimationControllerLoader2D, "AnimationController2D");