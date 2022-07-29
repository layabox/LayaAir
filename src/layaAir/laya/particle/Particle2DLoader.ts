import { ILoadTask, IResourceLoader, Loader } from "../net/Loader";
import { Texture } from "../resource/Texture";
import { checkSetting } from "./ParticleSetting";
import { ParticleTemplate2D } from "./ParticleTemplate2D";

class Particle2DLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.2), task.options).then(data => {
            if (!data)
                return null;

            let settings = checkSetting(data);

            return task.loader.load(settings.textureName, task.options, task.progress.createCallback()).then((tex: Texture) => {
                if (!tex)
                    return null;

                return new ParticleTemplate2D(settings, tex);
            });

        });
    }
}

Loader.registerLoader(["part"], Particle2DLoader);