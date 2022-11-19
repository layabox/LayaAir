import { AnimatorController } from "../d3/component/Animator/AnimatorController";
import { ILoadTask, IResourceLoader, Loader } from "../net/Loader";
class AnimationControllerLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.2), task.options).then(data => {
            return new AnimatorController(data);
        });
    }
}
Loader.registerLoader(["controller"], AnimationControllerLoader, "AnimationController");