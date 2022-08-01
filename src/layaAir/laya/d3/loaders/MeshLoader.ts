import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { MeshReader } from "./MeshReader";

class MeshLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            return MeshReader._parse(data);
        });
    }
}

Loader.registerLoader(["lm"], MeshLoader, Loader.MESH);