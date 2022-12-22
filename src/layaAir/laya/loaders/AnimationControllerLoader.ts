import { AnimatorController2D } from "../components/AnimatorController2D";
import { TypeAnimatorState } from "../components/AnimatorControllerParse";
import { AnimatorController } from "../d3/component/Animator/AnimatorController";
import { ILoadTask, IResourceLoader, Loader } from "../net/Loader";
import { URL } from "../net/URL";

class AnimationControllerLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.2), task.options).then(data => {
            let ret = task.ext == "controller" ? new AnimatorController(data) : new AnimatorController2D(data);

            if (ret && ret.data && ret.data.controllerLayers) {
                let layers = ret.data.controllerLayers;
                let promises: Array<any> = [];
                for (let i = layers.length - 1; i >= 0; i--) {
                    let states = layers[i].states;
                    this.loadStates(states, promises, task);

                }
                return Promise.all(promises).then(() => ret);
            }
            else
                return ret;
        });
    }


    loadStates(states: TypeAnimatorState[], promises: Array<any>, task: ILoadTask) {
        for (let j = states.length - 1; j >= 0; j--) {
            if (states[j].clip && states[j].clip._$uuid) {
                let url = URL.getResURLByUUID(states[j].clip._$uuid);
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