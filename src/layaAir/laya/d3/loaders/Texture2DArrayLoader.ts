import { ILoadTask, IResourceLoader, Loader } from "../../net/Loader";
import { Texture2DArray } from "../../resource/Texture2DArray";
import { URL } from "../../net/URL";

class Texture2DArrayLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;
            let textures = data.textures;
            if (textures) {
                let urls: string[] = [];
                let basePath: string = URL.getPath(task.url);
                for (let i = textures.length - 1; i >= 0; i--) {
                    urls.unshift(URL.join(basePath, textures[i]));
                }
                return Promise.all(urls.map(url => {
                    if (url)
                        return task.loader.fetch(url, "image", task.progress.createCallback(), task.options);
                    else
                        return Promise.resolve(null);
                })).then(images => {
                    let rt = new Texture2DArray(data.width, data.height, data.depth, data.format, data.mipmap, false, data.sRGB);
                    rt.setImageData(images, data.premultiplyAlpha, data.invertY);
                    return rt;
                });
            } else {
                return new Texture2DArray(data.width, data.height, data.depth, data.format, data.mipmap, false, data.sRGB);
            }
        });
    }
}

Loader.registerLoader(["tex2darray"], Texture2DArrayLoader, Loader.TEXTURECUBE);