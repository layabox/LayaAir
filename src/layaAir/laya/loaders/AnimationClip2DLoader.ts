import { AnimationClip2D } from "../components/AnimationClip2D";
import { IResourceLoader, ILoadTask, Loader } from "../net/Loader";

class AnimationClip2DLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            return AnimationClip2D._parse(data);
        });
    }
}
Loader.registerLoader(["mc"], AnimationClip2DLoader);