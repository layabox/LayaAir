import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { Texture2D } from "../../resource/Texture2D";

class SimpleAnimatorTextureLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            let tex = Texture2D._SimpleAnimatorTextureParse(data, task.options.propertyParams, task.options.constructParams);
            tex._setCreateURL(task.url);
            return tex;
        });
    }
}

Loader.registerLoader([Loader.SIMPLEANIMATORBIN, "lanit.ls"], SimpleAnimatorTextureLoader);