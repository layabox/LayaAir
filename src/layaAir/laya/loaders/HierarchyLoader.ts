import { Node } from "../display/Node";
import { IResourceLoader, ILoadTask, Loader, ILoadURL } from "../net/Loader";
import { URL } from "../net/URL";
import { HierarchyResource } from "../resource/HierarchyResource";
import { HierarchyParser } from "./HierarchyParser";
import { LegacyUIParser } from "./LegacyUIParser";

type HierarchyParserAPI = {
    collectResourceLinks: (data: any, basePath: string) => (string | ILoadURL)[],
    parse: (data: any, options?: Record<string, any>, errors?: Array<any>) => Array<Node> | Node;
}

export class HierarchyLoader implements IResourceLoader {
    static v3: HierarchyParserAPI = {
        collectResourceLinks: HierarchyParser.collectResourceLinks,
        parse: HierarchyParser.parse,
    };

    static v2: HierarchyParserAPI = null;

    static legacySceneOrPrefab: HierarchyParserAPI = {
        collectResourceLinks: LegacyUIParser.collectResourceLinks,
        parse: LegacyUIParser.parse
    };

    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.2), task.options).then(data => {
            if (!data)
                return null;

            let version: string = data.version || "";
            if (version.startsWith("LAYASCENE:")
                || version.startsWith("LAYAHIERARCHY:03") || version.startsWith("LAYAUI:"))
                return this._load(HierarchyLoader.v3, task, data);
            else if (version.startsWith("LAYAHIERARCHY:") || version.startsWith("LAYASCENE3D:"))
                return this._load(HierarchyLoader.v2, task, data);
            else if (data.type && data.props) {
                if (data.type.indexOf("3D") != -1 || data.child && data.child[0] && data.child[0].type.indexOf("3D") != -1)
                    return this._load(HierarchyLoader.v2, task, data);
                else
                    return this._load(HierarchyLoader.legacySceneOrPrefab, task, data);
            }
            else
                return null;
        });
    }

    //@internal
    private _load(api: HierarchyParserAPI, item: ILoadTask, data: any): Promise<HierarchyResource> {
        let basePath = URL.getPath(item.url);
        let links = api.collectResourceLinks(data, basePath);
        return Promise.all(links.map(link => item.loader.load(link, null, item.progress.createCallback()))).then(() => {
            return new MyHierarchyResource(api, item.url, data);
        });
    }
}

class MyHierarchyResource extends HierarchyResource {
    data: any;
    api: HierarchyParserAPI;

    constructor(api: HierarchyParserAPI, url: string, data: any) {
        super();

        this.api = api;
        this._setCreateURL(url);
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
            ret[0].url = this.url;
            return ret[0];
        }
        else {
            ret.url = this.url;
            return ret;
        }
    }
}

Loader.registerLoader([Loader.HIERARCHY, Loader.PREFAB, "lh", "ls", "scene", "ui", "prefab"], HierarchyLoader);