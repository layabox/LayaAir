import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { URL } from "../../net/URL";
import { KTXTextureInfo } from "../../RenderEngine/KTXTextureInfo";
import { FilterMode } from "../../RenderEngine/RenderEnum/FilterMode";
import { TextureDimension } from "../../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { WrapMode } from "../../RenderEngine/RenderEnum/WrapMode";
import { AssetDb } from "../../resource/AssetDb";
import { Resource } from "../../resource/Resource";
import { Byte } from "../../utils/Byte";
import { Utils } from "../../utils/Utils";
import { TextureCube } from "../../resource/TextureCube";

var internalResources: Record<string, TextureCube>;

export class CubemapLoader implements IResourceLoader {
    constructor() {
        if (!internalResources) {
            internalResources = {
                "WhiteTextureCube.ltc": TextureCube.whiteTexture,
                "BlackTextureCube.ltc": TextureCube.blackTexture,
                "GrayTextureCube.ltc": TextureCube.grayTexture,
            };
        }
    }

    load(task: ILoadTask) {
        if (task.url.indexOf("internal/") != -1) {
            let tex = internalResources[Utils.getBaseName(task.url)];
            if (tex)
                return Promise.resolve(tex);
        }

        if (task.ext == "ktx" || task.ext == "cubemap") {
            let url = task.url;
            if (task.ext == "cubemap")
                url = AssetDb.inst.getSubAssetURL(url, task.uuid, "0", "ktx");

            return task.loader.fetch(url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
                if (!data)
                    return null;

                let ktxInfo = KTXTextureInfo.getKTXTextureInfo(data);
                if (ktxInfo.dimension != TextureDimension.Cube) {
                    Loader.warn("ktxInfo.dimension != TextureDimension.Cube! " + task.url);
                    return null;
                }

                let tex = new TextureCube(ktxInfo.width, ktxInfo.format, ktxInfo.mipmapCount > 1, ktxInfo.sRGB);
                tex.setKTXData(ktxInfo);

                let obsoluteInst = task.obsoluteInst;
                if (obsoluteInst && (obsoluteInst instanceof TextureCube))
                    tex = this.move(obsoluteInst, tex);

                return tex;
            });
        }
        else if (task.ext == "ltcb" || task.ext == "ltcb.ls") {
            return task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
                if (!data)
                    return null;

                let byte: Byte = new Byte(data);
                let version: string = byte.readUTFString();
                if (version !== "LAYATEXTURECUBE:0000") {
                    console.warn(`CubemapBinLoader: unknow version. ${version}`);
                    return null;
                }
                let format: TextureFormat = <TextureFormat>byte.readUint8();
                let mipCount: number = byte.getUint8();
                let size: number = byte.readUint16();
                let filterMode: FilterMode = <FilterMode>byte.getUint8();
                let wrapModeU: WrapMode = <WrapMode>byte.getUint8();
                let wrapModev: WrapMode = <WrapMode>byte.getUint8();
                let anisoLevel: FilterMode = byte.getUint8();

                let tex: TextureCube = new TextureCube(size, format, mipCount > 1 ? true : false);
                tex.setPixelsData(null, false, false);
                tex.filterMode = filterMode;
                tex.wrapModeU = wrapModeU;
                tex.wrapModeV = wrapModev;
                tex.anisoLevel = anisoLevel;
                let pos: number = byte.pos;
                let mipSize: number = size;
                for (let i = 0; i < mipCount; i++) {
                    let uint8Arrays: Array<Uint8Array> = new Array<Uint8Array>(6);
                    let mipPixelLength: number = mipSize * mipSize * tex._getFormatByteCount();
                    for (let j = 0; j < 6; j++) {
                        uint8Arrays[j] = new Uint8Array(data, pos, mipPixelLength);
                        pos += mipPixelLength;
                    }
                    // todo  自动生成 mipmap 与 手动设置 mipmap
                    tex.updateSubPixelsData(uint8Arrays, 0, 0, mipSize, mipSize, i, false, false, false);
                    mipSize /= 2;
                }

                let obsoluteInst = task.obsoluteInst;
                if (obsoluteInst && (obsoluteInst instanceof TextureCube))
                    tex = this.move(obsoluteInst, tex);
                return tex;
            });
        }
        else {
            return task.loader.fetch(task.url, "json", task.progress.createCallback(0.2), task.options).then(data => {
                if (!data)
                    return null;

                let ltcBasePath: string = URL.getPath(task.url);
                let urls: any[] = [
                    URL.join(ltcBasePath, data.front),
                    URL.join(ltcBasePath, data.back),
                    URL.join(ltcBasePath, data.left),
                    URL.join(ltcBasePath, data.right),
                    URL.join(ltcBasePath, data.up),
                    URL.join(ltcBasePath, data.down)
                ];

                return Promise.all(urls.map(url => {
                    if (url)
                        return task.loader.fetch(url, "image", task.progress.createCallback(), task.options);
                    else
                        return Promise.resolve(null);
                })).then(images => {
                    let constructParams = task.options.constructParams;
                    let size = constructParams ? constructParams[0] : ((images[0]?.width) ?? 1);
                    let format = constructParams ? constructParams[1] : TextureFormat.R8G8B8A8;
                    let mipmap = constructParams ? constructParams[3] : false;
                    let srgb = constructParams ? constructParams[5] : true;
                    let tex = new TextureCube(size, format, mipmap, srgb);
                    tex.setImageData(images, false, false);

                    let obsoluteInst = task.obsoluteInst;
                    if (obsoluteInst && (obsoluteInst instanceof TextureCube))
                        tex = this.move(obsoluteInst, tex);
                    return tex;
                });
            });
        }
    }

    private move(obsoluteInst: TextureCube, tex: TextureCube) {
        obsoluteInst._texture = tex._texture;
        (<any>obsoluteInst)._format = tex.format;
        obsoluteInst.width = tex.width;
        obsoluteInst.height = tex.height;
        obsoluteInst.obsolute = false;
        delete Resource._idResourcesMap[tex.id];
        return obsoluteInst;
    }
}

Loader.registerLoader(["ltc", "ltcb", "ltcb.ls", "cubemap"], CubemapLoader, Loader.TEXTURECUBE);