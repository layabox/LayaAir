import { Texture2D, TextureConstructParams, TexturePropertyParams } from "../resource/Texture2D";
import { Texture } from "../resource/Texture";
import { IResourceLoader, ILoadTask, Loader, ILoadURL } from "../net/Loader";
import { HDRTextureInfo } from "../RenderEngine/HDRTextureInfo";
import { KTXTextureInfo } from "../RenderEngine/KTXTextureInfo";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { ClassUtils } from "../utils/ClassUtils";
import { BaseTexture } from "../resource/BaseTexture";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { Browser } from "../utils/Browser";
import { AssetDb } from "../resource/AssetDb";
import { Resource } from "../resource/Resource";
import { Utils } from "../utils/Utils";
import { RenderTexture } from "../resource/RenderTexture";
import { VideoTexture } from "../media/VideoTexture";

const metaFetchingOptions = { noRetry: true, silent: true };

var internalResources: Record<string, Texture2D>;

class Texture2DLoader implements IResourceLoader {
    constructor() {
        if (!internalResources) {
            internalResources = {
                "WhiteTexture.png": Texture2D.whiteTexture,
                "BlackTexture.png": Texture2D.blackTexture,
                "GrayTexture.png": Texture2D.grayTexture,
                "NormalTexture.png": Texture2D.normalTexture,
            };
        }
    }

    load(task: ILoadTask) {
        if (task.url.indexOf("internal/") != -1) {
            let tex = internalResources[Utils.getBaseName(task.url)];
            if (tex)
                return Promise.resolve(tex);
        }

        let meta = AssetDb.inst.getMeta(task.url, task.uuid);
        if (!meta || typeof (meta) === "object")
            return this.load2(task, meta);
        else if (!task.options.noMetaFile)
            return task.loader.fetch(meta, "json", task.progress.createCallback(0.1), metaFetchingOptions)
                .then(meta => this.load2(task, meta));
        else
            return this.load2(task, null);
    }

    protected load2(task: ILoadTask, meta: any) {
        let constructParams: TextureConstructParams;
        let propertyParams: TexturePropertyParams;
        let ext = task.ext;
        let url = task.url;
        if (meta) {
            let platform = Browser.platform;
            let fileIndex = meta.platforms?.[platform] || 0;
            let fileInfo = meta.files[fileIndex];
            if (fileInfo.file) {
                url = AssetDb.inst.getSubAssetURL(url, task.uuid, fileInfo.file, fileInfo.ext);
                ext = fileInfo.ext;
            }

            constructParams = [0, 0, fileInfo.format, meta.mipmap, meta.readWrite, meta.sRGB];
            propertyParams = {
                wrapModeU: meta.wrapMode,
                wrapModeV: meta.wrapMode,
                filterMode: meta.filterMode,
                anisoLevel: meta.anisoLevel,
                premultiplyAlpha: meta.pma,
                hdrEncodeFormat: meta.hdrEncodeFormat,
            };
        }
        else {
            constructParams = task.options.constructParams;
            propertyParams = task.options.propertyParams;
        }

        let compress = compressedFormats.indexOf(ext) != -1 ? ext : null;
        if (compress != null) {
            return task.loader.fetch(url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
                if (!data)
                    return null;

                let tex: BaseTexture;
                switch (compress) {
                    case "dds":
                        tex = Texture2D._parseDDS(data, propertyParams, constructParams);
                        break;

                    case "ktx":
                        let ktxInfo = KTXTextureInfo.getKTXTextureInfo(data);
                        if (ktxInfo.dimension == TextureDimension.Cube) {
                            //这里在core模块，不能直接引用d3里的TextureCube
                            let cls = ClassUtils.getClass("TextureCube");
                            if (cls) {
                                let tc = new cls(ktxInfo.width, ktxInfo.format, ktxInfo.mipmapCount > 1, ktxInfo.sRGB);
                                tc.setKTXData(ktxInfo);
                                tex = tc;
                            }
                            else
                                return null;
                        }
                        else if (ktxInfo.dimension == TextureDimension.Tex2D) {
                            tex = Texture2D._parseKTX(data, propertyParams, constructParams);
                        }
                        break;
                    case "pvr":
                        tex = Texture2D._parsePVR(data, propertyParams, constructParams);
                        break;

                    case "hdr":
                        tex = HDRTextureInfo._parseHDRTexture(data, propertyParams, constructParams);
                        break;

                    case "lanit.ls":
                        tex = Texture2D._SimpleAnimatorTextureParse(data, propertyParams, constructParams);
                        break;
                }

                let obsoluteInst = <Texture2D>task.obsoluteInst;
                if (obsoluteInst && Object.getPrototypeOf(obsoluteInst) == Object.getPrototypeOf(tex))
                    tex = this.move(obsoluteInst, tex);

                if (propertyParams && propertyParams.hdrEncodeFormat)
                    tex.hdrEncodeFormat = propertyParams.hdrEncodeFormat;
                return tex;
            });
        }
        else {
            return task.loader.fetch(url, "image", task.progress.createCallback(), task.options).then(img => {
                if (!img)
                    return null;

                let tex: BaseTexture = Texture2D._parseImage(img, propertyParams, constructParams);
                let obsoluteInst = <Texture2D>task.obsoluteInst;
                if (obsoluteInst && Object.getPrototypeOf(obsoluteInst) == Object.getPrototypeOf(tex))
                    tex = this.move(obsoluteInst, tex);
                return tex;
            });
        }
    }

    private move(obsoluteInst: BaseTexture, tex: BaseTexture) {
        obsoluteInst._texture = tex._texture;
        obsoluteInst.width = tex.width;
        obsoluteInst.height = tex.height;
        obsoluteInst.obsolute = false;
        delete Resource._idResourcesMap[tex.id];
        return obsoluteInst;
    }
}

class RenderTextureLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            let obsoluteInst = <RenderTexture>task.obsoluteInst;
            if (obsoluteInst) {
                obsoluteInst.recreate(data.width, data.height, data.colorFormat, data.depthFormat,
                    data.generateMipmap, data.multiSamples, false, data.sRGB);
                return obsoluteInst;
            }
            else
                return new RenderTexture(data.width, data.height, data.colorFormat, data.depthFormat,
                    data.generateMipmap, data.multiSamples, false, data.sRGB);
        });
    }
}


class VideoTextureLoader implements IResourceLoader {
    load(task: ILoadTask) {
        let inst = <VideoTexture>task.obsoluteInst || new VideoTexture();
        inst.source = task.url;
        return Promise.resolve(inst);
    }
}

const propertyParams2d: TexturePropertyParams = { premultiplyAlpha: true };
const constructParams2d: TextureConstructParams = [null, null, TextureFormat.R8G8B8A8, false, false, true];

class TextureLoader implements IResourceLoader {
    wrapTex2D(task: ILoadTask, tex2D: Texture2D) {
        if (!tex2D)
            return null;

        let tex = <Texture>task.obsoluteInst;
        if (tex) { //recover
            tex.setTo(tex2D);
            tex.obsolute = false;
        }
        else
            tex = new Texture(tex2D);
        return tex;
    }

    load(task: ILoadTask) {
        let tex2D = <Texture2D>task.loader.getRes(task.url, Loader.TEXTURE2D);
        if (!tex2D || tex2D.obsolute) {
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

const compressedFormats = ["ktx", "pvr", "dds", "hdr", "lanit.ls"];
const videoFormats = ["mp4", "webm"];

Loader.registerLoader(["png", "jpg", "jpeg", "rendertexture", ...videoFormats, ...compressedFormats], TextureLoader, Loader.IMAGE);
Loader.registerLoader([], Texture2DLoader, Loader.TEXTURE2D);
Loader.registerLoader(["rendertexture"], RenderTextureLoader, Loader.TEXTURE2D);
Loader.registerLoader(videoFormats, VideoTextureLoader, Loader.TEXTURE2D);