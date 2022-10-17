import { IResourceLoader, ILoadTask, Loader } from "../net/Loader";
import { Utils } from "../utils/Utils";
import { SpineTemplet } from "./SpineTemplet";

class SpineTempletLoader implements IResourceLoader {
    load(task: ILoadTask) {
        let atlasUrl = Utils.replaceFileExtension(task.url, "atlas");

        return Promise.all([
            task.loader.fetch(task.url, task.ext == "skel" ? "arraybuffer" : "json", task.progress.createCallback()),
            task.loader.fetch(atlasUrl, "text", task.progress.createCallback())
        ]).then(res => {
            if (!res[0] || !res[1])
                return null;

            let templet = new SpineTemplet();
            return templet._parse(res[0], res[1], task.url, task.progress).then(() => templet);
        });
    }
}

Loader.registerLoader(["skel"], SpineTempletLoader, Loader.SPINE);