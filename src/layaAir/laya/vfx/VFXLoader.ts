import { VFXAsset } from "./VFXAsset";
import { VFXAssetParser } from "./VFXAssetParser";
import { ILoadTask, IResourceLoader, Loader } from "../net/Loader";
import { URL } from "../net/URL";
import { AssetDb } from "../resource/AssetDb";

export class VFXLoader implements IResourceLoader {

    load(task: ILoadTask): Promise<VFXAsset> {
        let url = AssetDb.inst.getSubAssetURL(task.url, task.uuid, "0", "lvfx");
        return task.loader.fetch(url, "json", task.progress.createCallback(), task.options).then(data => {
            return new VFXAssetParser().parse(data, URL.getPath(task.url));
        });
    }

}

Loader.registerLoader(["vfx"], VFXLoader, "VFXGraph");
