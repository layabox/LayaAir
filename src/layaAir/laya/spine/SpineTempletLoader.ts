import { Laya } from "../../Laya";
import { IResourceLoader, ILoadTask, Loader, ILoadURL } from "../net/Loader";
import { Texture2D } from "../resource/Texture2D";
import { Utils } from "../utils/Utils";
import { SpineConst } from "./SpineConst";

/**
 * @en SpineTempletLoader class used for loading Spine skeleton data and atlas.
 * @zh SpineTempletLoader 类用于加载 Spine 骨骼数据和图集。
 */
export class SpineTempletLoader implements IResourceLoader {

    /**
     * @en Load Spine skeleton data and atlas.
     * @param task The load task.
     * @zh 加载 Spine 骨骼数据和图集。
     * @param task 加载任务。
     */
    load(task: ILoadTask) {
        let atlasUrl = Utils.replaceFileExtension(task.url, "atlas");

        return Promise.all([
            task.loader.fetch(task.url, task.ext == "skel" ? "arraybuffer" : "json", task.progress.createCallback()),
            task.loader.fetch(atlasUrl, "text", task.progress.createCallback())
        ]).then(res => {
            if (!res[0] || !res[1])
                return null;

            let parser = SpineConst.factory.createSpineTempletParser();
            let urls = parser.collectTextures( res[1], task);
            return Laya.loader.load(urls, null, task.progress.createCallback()).then((textures: Array<Texture2D>) => {
                return parser.create(res[0], textures);
            });
        });
    }
}

Loader.registerLoader(["skel"], SpineTempletLoader, Loader.SPINE);
