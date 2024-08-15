import { IResourceLoader, ILoadTask, Loader, ILoadOptions } from "../net/Loader";
import { URL } from "../net/URL";
import { AssetDb } from "../resource/AssetDb";
import { Prefab } from "../resource/HierarchyResource";
import { IHierarchyParserAPI, PrefabImpl } from "../resource/PrefabImpl";
import { HierarchyParser } from "./HierarchyParser";
import { LegacyUIParser } from "./LegacyUIParser";

export class HierarchyLoader implements IResourceLoader {
    static v3: IHierarchyParserAPI = HierarchyParser;
    static v2: IHierarchyParserAPI = null;
    static legacySceneOrPrefab: IHierarchyParserAPI = LegacyUIParser;

    load(task: ILoadTask) {
        let url = task.url;
        let isModel = task.ext == "gltf" || task.ext == "fbx" || task.ext == "glb" || task.ext == "obj";
        if (isModel)
            url = AssetDb.inst.getSubAssetURL(url, task.uuid, "0", "lh");
        return task.loader.fetch(url, "json", task.progress.createCallback(0.2), task.options).then(data => {
            if (!data)
                return null;

            if (data._$ver != null)
                return this._load(HierarchyLoader.v3, task, data, 3);
            else if (task.ext == "ls" || task.ext == "lh")
                return this._load(HierarchyLoader.v2, task, data, 2);
            else if (task.ext == "scene" || task.ext == "prefab")
                return this._load(HierarchyLoader.legacySceneOrPrefab, task, data, 2);
            else
                return null;
        });
    }

    //@internal
    private _load(api: IHierarchyParserAPI, task: ILoadTask, data: any, version: number): Promise<Prefab> {
        let basePath = URL.getPath(task.url);
        let links = api.collectResourceLinks(data, basePath);
        let options: ILoadOptions = Object.assign({}, task.options);
        options.initiator = task;
        delete options.cache;
        delete options.ignoreCache;
        return task.loader.load(links, options, task.progress.createCallback()).then((resArray: any[]) => {
            let res = new PrefabImpl(api, data, version);
            res.addDeps(resArray);
            return res;
        });
    }
}

Loader.registerLoader(["lh", "ls", "scene", "prefab"], HierarchyLoader, Loader.HIERARCHY);