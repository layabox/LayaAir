import { RenderCapable } from "../../RenderEngine/RenderEnum/RenderCapable";
import { LayaGL } from "../../layagl/LayaGL";
import { ILoadTask, IResourceLoader, Loader } from "../../net/Loader";
import { Texture2DArray } from "../../resource/Texture2DArray";
import { Utils } from "../../utils/Utils";

var internalResources: Record<string, any> = {};

export class Texture2DArrayLoader implements IResourceLoader {

    constructor() {
        if (!internalResources) {
            internalResources = {
                "default": Texture2DArray.defaultTexture
            };
        }
    }

    load(task: ILoadTask) {
        // todo internal resources
        if (task.url.indexOf("internal/") != -1) {
            const tex = internalResources[Utils.getBaseName(task.url)];
            if (tex) {
                return Promise.resolve(tex);
            }
        }

        return task.loader.fetch(task.url, "json", task.progress.createCallback(), task.options).then((data) => {
            if (!data) {
                return null;
            }

            let width = data.width;
            let height = data.height;
            let depth = data.depth;
            let format = data.format;
            let mipmap = data.mipmap;
            let sRGB = data.sRGB;
            let premultiplyAlpha = !!data.premultiplyAlpha;
            let invertY = !!data.invertY;

            let textures: Array<string> = data.textures;

            let urls = [];
            for (let index = 0; index < textures.length; index++) {
                urls.push(textures[index]);
            }

            return Promise.all(urls.map((url) => {
                if (url) {
                    return task.loader.fetch(url, "image", task.progress.createCallback(), task.options);
                }
                else {
                    return Promise.resolve(null);
                }
            })).then(images => {

                if (LayaGL.renderEngine.getCapable(RenderCapable.Texture3D)) {
                    let tex = new Texture2DArray(width, height, depth, format, mipmap, sRGB);
                    tex.setImageData(images, premultiplyAlpha, invertY);
                    return tex;
                }
                else {
                    return null;
                }
            });
        });
    }
}

Loader.registerLoader(["tex2darray"], Texture2DArrayLoader, Loader.TEXTURE2DARRAY);