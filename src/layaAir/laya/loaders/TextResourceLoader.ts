import { IResourceLoader, ILoadTask, Loader } from "../net/Loader";
import { TextResource, TextResourceFormat } from "../resource/TextResource";

class TextAssetLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "text", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            return new TextResource(data, TextResourceFormat.Plain);
        });
    }
}

class BytesAssetLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            return new TextResource(data, TextResourceFormat.Buffer);
        });
    }
}

class JsonAssetLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            return new TextResource(data, TextResourceFormat.JSON);
        });
    }
}

class XMLAssetLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "xml", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            return new TextResource(data, TextResourceFormat.XML);
        });
    }
}

Loader.registerLoader([Loader.TEXT, "txt", "csv"], TextAssetLoader);
Loader.registerLoader([Loader.BUFFER, "bin", "bytes"], BytesAssetLoader);
Loader.registerLoader([Loader.JSON, "json"], JsonAssetLoader);
Loader.registerLoader([Loader.XML, "xml", "fnt"], XMLAssetLoader);