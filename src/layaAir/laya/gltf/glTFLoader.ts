import * as glTF from "./glTFInterface";
import { IResourceLoader, ILoadTask, Loader } from "../net/Loader";
import { glTFResource } from "./glTFResource";

class glTFLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.5), task.options.priority).then((data: glTF.glTF) => {
            if (!data.asset || data.asset.version !== "2.0") {
                console.warn("glTF version wrong!");
                return null;
            }

            return glTFResource._parse(data, task.url, task.progress);
        });
    }
}

Loader.registerLoader(["gltf"], glTFLoader);