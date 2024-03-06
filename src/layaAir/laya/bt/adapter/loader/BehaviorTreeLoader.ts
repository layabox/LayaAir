import { HierarchyLoader } from "../../../loaders/HierarchyLoader";
import { ILoadTask, IResourceLoader, Loader } from "../../../net/Loader";
import { URL } from "../../../net/URL";
import { BTConst } from "../../core/BTConst";
import { BehaviorTreeImpl } from "../resource/BehaviorTreeImpl";

/**
 * 
 * @ brief: BehaviorTreeLoader
 * @ author: zyh
 * @ data: 2024-02-23 15:49
 */
export class BehaviorTreeLoader implements IResourceLoader {

    load(task: ILoadTask): Promise<any> {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.2), task.options).then(data => {
            if (!data) return null;
            if (data._$ver != null) {
                return this._parse(task, data, data._$ver);
            } else {
                console.error("Unknow Version!");
                return null;
            }
        });
    }

    private _parse(task: ILoadTask, data: any, version: number): Promise<BehaviorTreeImpl> {
        // return new Sprite3D;
        let basePath = URL.getPath(task.url);
        //引擎精灵解析
        let links = HierarchyLoader.v3.collectResourceLinks(data, basePath);

        return task.loader.load(links, null, task.progress.createCallback()).then((resArray: any[]) => {
            return new BehaviorTreeImpl(data, task, version);
        });
    }
}

Loader.registerLoader([BTConst.EXT], BehaviorTreeLoader, BTConst.TYPE); 