import { IResourceLoader, ILoadTask, Loader, ILoadOptions } from "../net/Loader";
import { URL } from "../net/URL";
import { AssetDb } from "../resource/AssetDb";
import { Prefab } from "../resource/HierarchyResource";
import { IHierarchyParserAPI, PrefabImpl } from "../resource/PrefabImpl";

export class HierarchyLoader implements IResourceLoader {

    load(task: ILoadTask) {
        let url = task.url;
        let fromDCC = task.ext == "gltf" || task.ext == "fbx" || task.ext == "glb" || task.ext == "obj";
        if (fromDCC)
            url = AssetDb.inst.getSubAssetURL(url, task.uuid, "0", "lh");
        return task.loader.fetch(url, "json", task.progress.createCallback(0.2), task.options).then(data => {
            if (!data)
                return null;

            if (data._$ver != null)
                return this._load(PrefabImpl.v3, task, data, fromDCC);
            else if (task.ext == "ls" || task.ext == "lh")
                return this._load(PrefabImpl.v2, task, data, fromDCC);
            else if (task.ext == "scene" || task.ext == "prefab")
                return this._load(PrefabImpl.legacySceneOrPrefab, task, data, fromDCC);
            else
                return null;
        });
    }

    protected _load(api: IHierarchyParserAPI, task: ILoadTask, data: any, fromDCC: boolean): Promise<Prefab> {
        let basePath = URL.getPath(task.url);
        let links = api.collectResourceLinks(data, basePath);
        let options: ILoadOptions = Object.assign({}, task.options);
        options.initiator = task;
        delete options.cache;
        delete options.ignoreCache;
        let preloadLinks = links.filter(link => (link as any).preload);
        let p: Promise<any>;
        if (preloadLinks.length > 0) {
            links = links.filter(link => !(link as any).preload);
            p = task.loader.load(preloadLinks, options, task.progress.createCallback(0.2)).then((resArray: any[]) => {
                return task.loader.load(links, options, task.progress.createCallback(0.8)).then((resArray2: any[]) => {
                    resArray.push(...resArray2);
                    return resArray;
                });
            });
        }
        else {
            p = task.loader.load(links, options, task.progress.createCallback());
        }

        return p.then((resArray: any[]) => {
            if (resArray && resArray.some(r => r == null)) {
                console.warn(`[HierarchyLoader] Some dependencies failed to load for: ${task.url}`);
                return null;
            }
            let res = new PrefabImpl(api, data);
            res.fromDCC = fromDCC;
            res.onLoad();
            res.addDeps(resArray);
            return res;
        });
    }
}

Loader.registerLoader(["lh", "ls", "scene", "prefab"], HierarchyLoader, Loader.HIERARCHY);