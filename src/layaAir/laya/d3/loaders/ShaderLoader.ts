import { ILoadTask, IResourceLoader, Loader } from "../../net/Loader";
import { AssetDb } from "../../resource/AssetDb";
import { ShaderParser } from "./ShaderParser";

class ShaderLoader implements IResourceLoader {
    load(task: ILoadTask) {
        let url = task.url;
        if (task.ext === "bps")
            url = AssetDb.inst.getSubAssetURL(url, task.uuid, "0", "shader");

        return task.loader.fetch(url, "text", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            return ShaderParser.parse(data);
        });
    }
}

Loader.registerLoader(["shader", "bps"], ShaderLoader);