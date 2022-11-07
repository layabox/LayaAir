import { ILoadTask, IResourceLoader, Loader } from "../net/Loader";

export class NullLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return Promise.resolve(null);
    }
}

Loader.registerLoader(["lighting"], NullLoader);