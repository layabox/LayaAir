import { ILoadTask, IResourceLoader, Loader } from "../net/Loader";
import { URL } from "../net/URL";
import { ComputeShaderParser } from "./ComputeShaderParser";

class ComputeShaderLoader implements IResourceLoader {

    load(task: ILoadTask): Promise<any> {
        let url = task.url;

        return task.loader.fetch(url, "text", task.progress.createCallback(), task.options).then(data => {
            if (!data) {
                return null;
            }

            return ComputeShaderParser.parse(data, URL.getPath(task.url));
        });

    }

}

Loader.registerLoader(["computeshader"], ComputeShaderLoader, "COMPUTESHADER");
