import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { AvatarMask } from "../component/AvatarMask";

class AvatarMaskLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(), task.options.priority).then(data => {
            if (!data)
                return null;

            return new AvatarMask(data);
        });
}
}

Loader.registerLoader(["lavm"], AvatarMaskLoader);