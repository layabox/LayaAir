import { ILoadTask, IResourceLoader, Loader } from "../../net/Loader";
import { ShaderCompile } from "../../webgl/utils/ShaderCompile";

class GLSLLoader implements IResourceLoader {
    load(task: ILoadTask) {
        let url = task.url;
        return task.loader.fetch(url, "text", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            return ShaderCompile.addInclude(task.url, data, true);
        });
    }
}

Loader.registerLoader(["glsl", "vs", "fs"], GLSLLoader);