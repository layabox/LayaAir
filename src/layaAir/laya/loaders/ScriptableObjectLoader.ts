import { ILoadOptions, ILoadTask, IResourceLoader, Loader } from "../net/Loader";
import { URL } from "../net/URL";
import { PrefabImpl } from "../resource/PrefabImpl";
import { ScriptableObject } from "../resource/ScriptableObject";
import { ClassUtils } from "../utils/ClassUtils";
import { SerializeUtil } from "./SerializeUtil";

/** @internal */
export class ScriptableObjectLoader implements IResourceLoader {
    load(task: ILoadTask): Promise<ScriptableObject> {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.2), task.options).then(data => {
            if (!data)
                return null;

            if (data._$ver !== 1) {
                Loader.warn(`Unsupported ScriptableObject version '${data._$ver}' in '${task.url}'.`);
                return null;
            }

            let type = data._$type;
            if (!type) {
                Loader.warn(`Missing ScriptableObject type in '${task.url}'.`);
                return null;
            }

            let links = PrefabImpl.v3.collectResourceLinks(data, URL.getPath(task.url));
            let options: ILoadOptions = Object.assign({}, task.options);
            options.initiator = task;
            delete options.cache;
            delete options.ignoreCache;

            return task.loader.load(links, options, task.progress.createCallback(0.8)).then((resArray: any[]) => {
                let cls = ClassUtils.getClass(type);
                if (!cls) {
                    Loader.warn(`Unknown ScriptableObject type '${type}' in '${task.url}'.`);
                    return null;
                }
                if (!(cls.prototype instanceof ScriptableObject)) {
                    Loader.warn(`Type '${type}' in '${task.url}' must extend ScriptableObject.`);
                    return null;
                }

                let res: any;
                try {
                    res = SerializeUtil.decodeObj(data);
                }
                catch (error: any) {
                    Loader.warn(`Failed to deserialize ScriptableObject '${task.url}': ${error?.message || error}`);
                    return null;
                }
                if (!(res instanceof ScriptableObject)) {
                    Loader.warn(`Failed to deserialize ScriptableObject '${task.url}'.`);
                    return null;
                }

                res.addDeps(resArray);
                return res;
            });
        });
    }
}

Loader.registerLoader(["sco"], ScriptableObjectLoader);
