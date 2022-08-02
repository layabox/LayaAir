import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { AnimationClip } from "../animation/AnimationClip";

class AnimationClipLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            return AnimationClip._parse(data);
        });
    }
}

Loader.registerLoader(["lani"], AnimationClipLoader, Loader.ANIMATIONCLIP);