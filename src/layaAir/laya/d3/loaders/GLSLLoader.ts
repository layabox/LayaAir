import { ILoadTask, IResourceLoader, Loader } from "../../net/Loader";
import { ShaderParser } from "./ShaderParser";

class GLSLLoader implements IResourceLoader {
    load(task: ILoadTask) {
        let url = task.url;
        return task.loader.fetch(url, "text", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;
            return ShaderParser.GLSLPrase(task.url, data);
        });
    }
}

Loader.registerLoader(["glsl"], GLSLLoader);