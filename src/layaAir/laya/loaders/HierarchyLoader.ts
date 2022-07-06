import { ILaya } from "../../ILaya";
import { Node } from "../display/Node";
import { IResourceLoader, ILoadTask, Loader } from "../net/Loader";
import { URL } from "../net/URL";
import { HierarchyResource } from "../resource/HierarchyResource";
import { HierarchyParser } from "./HierarchyParser";
import { LegacyUIParser } from "./LegacyUIParser";

export class HierarchyLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.2), task.options.priority).then(data => {
            if (!data)
                return null;

            let version: string = data.version || "";
            if (version.startsWith("LAYASCENE:")
                || version.startsWith("LAYAHIERARCHY:03") || version.startsWith("LAYAUI:"))
                return this.loadHierarchy3D_v3(task, data);
            else if (version.startsWith("LAYAHIERARCHY:") || version.startsWith("LAYASCENE3D:"))
                return this.loadHierarchy3D_v2(task, data);
            else if (data.type && data.props) {
                if (data.type.indexOf("3D") != -1 || data.child && data.child[0] && data.child[0].type.indexOf("3D") != -1)
                    return this.loadHierarchy3D_v2(task, data);
                else
                    return this.loadLegacySceneOrPrefab(task, data);
            }
            else
                return null;
        });
    }

    protected loadHierarchy3D_v3(item: ILoadTask, data: any): Promise<HierarchyResource> {
        let links = HierarchyParser.collectResourceLinks(data);
        return Promise.all(links.map(link => item.loader.load(link, null, item.progress.createCallback()))).then(() => {
            return new MyHierarchyResource(3, item.url, data);
        });
    }

    protected loadHierarchy3D_v2(item: ILoadTask, data: any): Promise<HierarchyResource> {
        let basePath = URL.getPath(item.url);
        let links: Array<string> = (<any>ILaya).HierarchyParserV2.collectResourceLinks(data, basePath);
        return Promise.all(links.map(link => item.loader.load(link, null, item.progress.createCallback()))).then(() => {
            return new MyHierarchyResource(2, item.url, data);
        });
    }

    protected loadLegacySceneOrPrefab(item: ILoadTask, data: any): Promise<HierarchyResource> {
        let links = LegacyUIParser.collectResourceLinks(data);
        return Promise.all(links.map(link => item.loader.load(link, null, item.progress.createCallback()))).then(() => {
            return new MyHierarchyResource(1, item.url, data);
        });
    }
}

class MyHierarchyResource extends HierarchyResource {
    data: any;
    ver: number;

    constructor(ver: number, url: string, data: any) {
        super();

        this.ver = ver;
        this._setCreateURL(url);
        this.data = data;
    }

    createNodes(multipleNodesReceiver?: Array<Node>): Node {
        if (this.ver == 1) {
            let node = LegacyUIParser.createByData(null, this.data);
            if (multipleNodesReceiver)
                multipleNodesReceiver.push(node);
            return node;
        }
        else if (this.ver == 2) {
            let node = (<any>ILaya).HierarchyParserV2._parse(this.data);
            if (multipleNodesReceiver)
                multipleNodesReceiver.push(node);
            return node;
        }
        else {
            let nodes = HierarchyParser.parse(this.data);
            if (multipleNodesReceiver)
                multipleNodesReceiver.push(...nodes);
            return nodes[0];
        }
    }
}

Loader.registerLoader([Loader.HIERARCHY, Loader.PREFAB, "lh", "ls", "scene", "ui", "prefab"], HierarchyLoader);