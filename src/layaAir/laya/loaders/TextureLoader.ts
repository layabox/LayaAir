import { Texture2D, TexturePropertyParams } from "../resource/Texture2D";
import { Utils } from "../utils/Utils";
import { Texture } from "../resource/Texture";
import { IResourceLoader, ILoadTask, Loader } from "../net/Loader";
import { HDRTextureInfo } from "../RenderEngine/HDRTextureInfo";
import { KTXTextureInfo } from "../RenderEngine/KTXTextureInfo";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { ClassUtils } from "../utils/ClassUtils";
import { BaseTexture } from "../resource/BaseTexture";

const default2DOptions: TexturePropertyParams = { premultiplyAlpha: true };

class TextureLoader implements IResourceLoader {
    load(task: ILoadTask) {
        let ext: string = Utils.getFileExtension(task.url);
        let promise: Promise<BaseTexture>;
        let compress = compressedFormats.indexOf(ext) != -1 ? ext : (compressedFormats.indexOf(task.type) != -1 ? task.type : null);
        let propertyParams: TexturePropertyParams;
        if (task.type != Loader.TEXTURE2D) {
            if (!task.options.propertyParams)
                propertyParams = default2DOptions;
            else if (task.options.propertyParams.premultiplyAlpha == null)
                propertyParams = Object.assign({ premultiplyAlpha: true }, task.options.propertyParams);
        }
        if (compress != null) {
            promise = task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
                if (!data)
                    return null;

                let tex: BaseTexture;
                switch (compress) {
                    case "dds":
                        tex = Texture2D._parseDDS(data, propertyParams, task.options.constructParams);
                        break;

                    case "ktx":
                        let ktxInfo = KTXTextureInfo.getKTXTextureInfo(data);
                        if (ktxInfo.dimension = TextureDimension.Cube) {
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
                        else if (ktxInfo.dimension = TextureDimension.Tex2D) {
                            tex = Texture2D._parseKTX(data, propertyParams, task.options.constructParams);
                        }
                        tex = Texture2D._parseKTX(data, propertyParams, task.options.constructParams);
                        break;

                    case "pvr":
                        tex = Texture2D._parsePVR(data, propertyParams, task.options.constructParams);
                        break;

                    case "hdr":
                        tex = HDRTextureInfo._parseHDRTexture(data, propertyParams, task.options.constructParams);
                        break;
                }
                return tex;
            });
        }
        else {
            promise = task.loader.fetch(task.url, "image", task.progress.createCallback(), task.options).then(img => {
                if (!img)
                    return null;

                let tex2D = Texture2D._parseImage(img, propertyParams, task.options.constructParams);
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
            tex2D._setCreateURL(task.url);
            return tex;
        });
    }
}

const compressedFormats = ["ktx", "pvr", "dds", "hdr"];

Loader.registerLoader([Loader.IMAGE, Loader.TEXTURE2D, "png", "jpg", "jpeg", ...compressedFormats], TextureLoader);