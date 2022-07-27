import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { Texture2D } from "../../resource/Texture2D";

class SimpleAnimatorTextureLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            return Texture2D._SimpleAnimatorTextureParse(data, task.options.propertyParams, task.options.constructParams);
        });
    }
}

Loader.registerLoader([Loader.SIMPLEANIMATORBIN, "lanit.ls"], SimpleAnimatorTextureLoader);