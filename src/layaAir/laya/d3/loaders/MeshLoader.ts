import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { MeshReader } from "./MeshReader";

class MeshLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            let mesh = MeshReader._parse(data);
            mesh._setCreateURL(task.url);
            return mesh;
        });
    }
}

Loader.registerLoader([Loader.MESH, "lm"], MeshLoader);