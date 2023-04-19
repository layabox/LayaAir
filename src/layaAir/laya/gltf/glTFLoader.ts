import * as glTF from "./glTFInterface";
import { IResourceLoader, ILoadTask, Loader } from "../net/Loader";
import { glTFResource } from "./glTFResource";
import { Byte } from "../utils/Byte";

class glTFLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.5), task.options).then((data: glTF.glTF) => {
            let glTF = new glTFResource();
            return glTF._parse(data, task.url, task.progress).then(() => glTF);
        });
    }
}

Loader.registerLoader(["gltf"], glTFLoader);

class glbLoader implements IResourceLoader {
    load(task: ILoadTask): Promise<any> {
        return task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(0.5), task.options).then((data: ArrayBuffer) => {
            let glTF = new glTFResource();
            return glTF._parseglb(data, task.url, task.progress).then(() => glTF);
        });
    }
}

Loader.registerLoader(["glb"], glbLoader);