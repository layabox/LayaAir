import { Texture2D } from "../resource/Texture2D";
import { Utils } from "../utils/Utils";
import { Texture } from "../resource/Texture";
import { IResourceLoader, ILoadTask, Loader } from "../net/Loader";
import { HDRTextureInfo } from "../RenderEngine/HDRTextureInfo";

class TextureLoader implements IResourceLoader {
    load(task: ILoadTask) {
        let ext: string = Utils.getFileExtension(task.url);
        let promise: Promise<Texture2D>;
        let compress = compressedFormats.indexOf(ext) != -1 ? ext : (compressedFormats.indexOf(task.type) != -1 ? task.type : null);
        if (compress != null) {
            promise = task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(), task.options.priority).then(data => {
                if (!data)
                    return null;

                let tex2D: Texture2D;
                switch (compress) {
                    case "dds":
                        tex2D = Texture2D._parseDDS(data, task.options.propertyParams, task.options.constructParams);
                        break;

                    case "ktx":
                        tex2D = Texture2D._parseKTX(data, task.options.propertyParams, task.options.constructParams);
                        break;

                    case "pvr":
                        tex2D = Texture2D._parsePVR(data, task.options.propertyParams, task.options.constructParams);
                        break;

                    case "hdr":
                        tex2D = HDRTextureInfo._parseHDRTexture(data, task.options.propertyParams, task.options.constructParams);
                        break;
                }
                tex2D._setCreateURL(task.url);
                return tex2D;
            });
        }
        else {
            promise = task.loader.fetch(task.url, "image", task.progress.createCallback(), task.options.priority, task.options.useWorkerLoader).then(img => {
                if (!img)
                    return null;

                let tex2D = Texture2D._parseImage(img, task.options.propertyParams, task.options.constructParams);
                tex2D._setCreateURL(task.url);
                return tex2D;
            });
        }

        return promise.then(tex2D => {
            if (!tex2D)
                return null;

            let tex: Texture = task.loader.getRes(task.url);
            if (tex) //recover
                tex.bitmap = tex2D;
            else
                tex = new Texture(tex2D);
            tex.url = task.url;
            return tex;
        });
    }
}

const compressedFormats = ["ktx", "pvr", "dds", "hdr"];

Loader.registerLoader([Loader.IMAGE, Loader.TEXTURE2D, "png", "jpg", "jpeg", ...compressedFormats], TextureLoader);