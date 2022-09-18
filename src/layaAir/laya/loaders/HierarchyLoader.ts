import { Node } from "../display/Node";
import { IResourceLoader, ILoadTask, Loader, ILoadURL } from "../net/Loader";
import { URL } from "../net/URL";
import { AssetDb } from "../resource/AssetDb";
import { HierarchyResource } from "../resource/HierarchyResource";
import { HierarchyParser } from "./HierarchyParser";
import { LegacyUIParser } from "./LegacyUIParser";

interface HierarchyParserAPI {
    collectResourceLinks: (data: any, basePath: string) => (string | ILoadURL)[],
    parse: (data: any, options?: Record<string, any>, errors?: Array<any>) => Array<Node> | Node;
}

export class HierarchyLoader implements IResourceLoader {
    static v3: HierarchyParserAPI = HierarchyParser;
    static v2: HierarchyParserAPI = null;
    static legacySceneOrPrefab: HierarchyParserAPI = LegacyUIParser;

    load(task: ILoadTask) {
        let url = task.url;
        let isModel = task.ext == "gltf" || task.ext == "fbx";
        if (isModel)
            url = AssetDb.inst.getSubAssetURL(url, task.uuid, "00001", "lh");
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
    private _load(api: HierarchyParserAPI, task: ILoadTask, data: any, version: number): Promise<HierarchyResource> {
        let basePath = URL.getPath(task.url);
        let links = api.collectResourceLinks(data, basePath);
        return Promise.all(links.map(link => task.loader.load(link, null, task.progress.createCallback()))).then((resArray: any[]) => {
            let res = new MyHierarchyResource(api, data, version);
            res.addDeps(resArray);
            return res;
        });
    }
}

class MyHierarchyResource extends HierarchyResource {
    data: any;
    api: HierarchyParserAPI;

    constructor(api: HierarchyParserAPI, data: any, version: number) {
        super(version);

        this.api = api;
        this.data = data;
    }

    createScene(options?: Record<string, any>, errors?: Array<any>): Array<Node> {
        let ret = this.api.parse(this.data, options, errors);
        if (Array.isArray(ret))
            return ret;
        else if (ret != null)
            return [ret];
        else
            return null;
    }

    createNodes(options?: Record<string, any>, errors?: any[]): Node {
        let ret = this.api.parse(this.data, options, errors);
        if (Array.isArray(ret)) {
            if (ret.length == 1) {
                ret[0].url = this.url;
            }
            return ret[0];
        }
        else {
            ret.url = this.url;
            return ret;
        }
    }
}

Loader.registerLoader(["lh", "ls", "scene", "prefab"], HierarchyLoader, Loader.HIERARCHY);