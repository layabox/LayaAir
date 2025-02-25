import { ILoadTask, IResourceLoader, Loader } from "../net/Loader";
class TTFFontLoader implements IResourceLoader {

    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "font", task.progress.createCallback(), task.options);
    }
}

Loader.registerLoader(["ttf", "woff", "woff2", "otf"], TTFFontLoader, Loader.TTF);
