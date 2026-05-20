import { VFXAsset } from "./VFXAsset";
import { VFXAssetParser } from "./VFXAssetParser";
import { ILoadTask, IResourceLoader, Loader } from "../net/Loader";

export class VFXLoader implements IResourceLoader {

    load(task: ILoadTask): Promise<VFXAsset> {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.5), task.options).then(data => {
            return new VFXAssetParser().parse(data);
        });
    }

}

Loader.registerLoader(["lvfx"], VFXLoader, "LVFX");