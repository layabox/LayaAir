import { Texture2D, TextureConstructParams, TexturePropertyParams } from "../resource/Texture2D";
import { Texture } from "../resource/Texture";
import { IResourceLoader, ILoadTask, Loader, ILoadURL } from "../net/Loader";
import { HDRTextureInfo } from "../RenderEngine/HDRTextureInfo";
import { KTXTextureInfo } from "../RenderEngine/KTXTextureInfo";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { ClassUtils } from "../utils/ClassUtils";
import { BaseTexture } from "../resource/BaseTexture";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";

class Texture2DLoader implements IResourceLoader {
    load(task: ILoadTask) {
        let compress = compressedFormats.indexOf(task.ext) != -1 ? task.ext : (compressedFormats.indexOf(task.type) != -1 ? task.type : null);
        if (compress != null) {
            return task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
                if (!data)
                    return null;

                let tex: BaseTexture;
                switch (compress) {
                    case "dds":
                        tex = Texture2D._parseDDS(data, task.options.propertyParams, task.options.constructParams);
                        break;

                    case "ktx":
                        let ktxInfo = KTXTextureInfo.getKTXTextureInfo(data);
                        if (ktxInfo.dimension == TextureDimension.Cube) {
                            //这里在core模块，不能直接引用d3里的TextureCube
                            let cls = ClassUtils.getClass("Laya.TextureCube");
                            if (cls) {
                                let tc = new cls(ktxInfo.width, ktxInfo.format, ktxInfo.mipmapCount > 1, ktxInfo.sRGB);
                                tc.setKTXData(ktxInfo);
                                tex = tc;
                            }
                            else
                                return null;
                        }
                        else if (ktxInfo.dimension == TextureDimension.Tex2D) {
                            tex = Texture2D._parseKTX(data, task.options.propertyParams, task.options.constructParams);
                        }
                        tex = Texture2D._parseKTX(data, task.options.propertyParams, task.options.constructParams);
                        break;

                    case "pvr":
                        tex = Texture2D._parsePVR(data, task.options.propertyParams, task.options.constructParams);
                        break;

                    case "hdr":
                        tex = HDRTextureInfo._parseHDRTexture(data, task.options.propertyParams, task.options.constructParams);
                        break;
                }
                return tex;
            });
        }
        else {
            return task.loader.fetch(task.url, "image", task.progress.createCallback(), task.options).then(img => {
                if (!img)
                    return null;

                return Texture2D._parseImage(img, task.options.propertyParams, task.options.constructParams);
            });
        }
    }
}

const propertyParams2d: TexturePropertyParams = { premultiplyAlpha: true };
const constructParams2d: TextureConstructParams = [null, null, TextureFormat.R8G8B8A8, false, false, true];

class TextureLoader implements IResourceLoader {
    wrapTex2D(task: ILoadTask, tex2D: Texture2D) {
        if (!tex2D)
            return null;

        let tex: Texture = task.loader.getRes(task.url);
        if (tex) //recover
            tex.bitmap = tex2D;
        else
            tex = new Texture(tex2D);
        return tex;
    }

    load(task: ILoadTask) {
        let tex2D = task.loader.getRes(task.url, Loader.TEXTURE2D);
        if (!tex2D) {
            let url: ILoadURL = { url: task.url, type: Loader.TEXTURE2D };

            if (!task.options.propertyParams)
                url.propertyParams = propertyParams2d;
            else if (task.options.propertyParams.premultiplyAlpha == null)
                url.propertyParams = Object.assign({}, propertyParams2d, task.options.propertyParams);

            if (!task.options.constructParams)
                url.constructParams = constructParams2d;
            else if (task.options.constructParams[5] == null)
                url.constructParams = Object.assign([], constructParams2d, task.options.constructParams);
            return task.loader.load(url, task.options, task.progress.createCallback()).then(tex2D => {
                return this.wrapTex2D(task, tex2D);
            });
        }
        else
            return Promise.resolve(this.wrapTex2D(task, tex2D));
    }
}

const compressedFormats = ["ktx", "pvr", "dds", "hdr"];

Loader.registerLoader([ "png", "jpg", "jpeg", ...compressedFormats], TextureLoader, Loader.IMAGE);
Loader.registerLoader([], Texture2DLoader, Loader.TEXTURE2D);