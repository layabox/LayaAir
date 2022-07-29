import { ILoadTask, IResourceLoader, Loader } from "../net/Loader";
import { Utils } from "../utils/Utils";
import { Templet } from "./bone/Templet";

export class TempletLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return Promise.all([
            task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(), task.options),
            task.loader.load(Utils.replaceFileExtension(task.url, "png"), null, task.progress.createCallback())
        ]).then(res => {
            if (!res[0] || !res[1])
                return null;

            let templet = new Templet();
            templet.parseData(res[1], task.url, res[0], task.options["playbackRate"]);
            return templet;
        });
    }
}

Loader.registerLoader(["sk"], TempletLoader);