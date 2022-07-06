import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { URL } from "../../net/URL";
import { FilterMode } from "../../RenderEngine/RenderEnum/FilterMode";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { WrapMode } from "../../RenderEngine/RenderEnum/WrapMode";
import { Byte } from "../../utils/Byte";
import { TextureCube } from "../resource/TextureCube";

class CubemapLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.2), task.options.priority).then(data => {
            if (!data)
                return null;

            let ltcBasePath: string = URL.getPath(task.url);
            let urls: any[] = [
                URL.formatRelativePath(ltcBasePath, data.front),
                URL.formatRelativePath(ltcBasePath, data.back),
                URL.formatRelativePath(ltcBasePath, data.left),
                URL.formatRelativePath(ltcBasePath, data.right),
                URL.formatRelativePath(ltcBasePath, data.up),
                URL.formatRelativePath(ltcBasePath, data.down)
            ];

            return Promise.all(urls.map(url => {
                if (url)
                    return task.loader.fetch(url, "image", task.progress.createCallback(), task.options.priority);
                else
                    return Promise.resolve(null);
            })).then(images => {
                let cubemap = TextureCube._parse(images);
                cubemap._setCreateURL(task.url);
                return cubemap;
            });
        });
    }
}

class CubemapBinLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(), task.options.priority).then(data => {
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

            let cubemap: TextureCube = new TextureCube(size, format, mipCount > 1 ? true : false);
            cubemap.filterMode = filterMode;
            cubemap.wrapModeU = wrapModeU;
            cubemap.wrapModeV = wrapModev;
            cubemap.anisoLevel = anisoLevel;
            let pos: number = byte.pos;
            let mipSize: number = size;
            for (let i = 0; i < mipCount; i++) {
                let uint8Arrays: Array<Uint8Array> = new Array<Uint8Array>(6);
                let mipPixelLength: number = mipSize * mipSize * cubemap._getFormatByteCount();
                for (let j = 0; j < 6; j++) {
                    uint8Arrays[j] = new Uint8Array(data, pos, mipPixelLength);
                    pos += mipPixelLength;
                }
                // todo  自动生成 mipmap 与 手动设置 mipmap
                cubemap.updateSubPixelsData(uint8Arrays, 0, 0, mipSize, mipSize, i, false, false, false);
                mipSize /= 2;
            }

            cubemap._setCreateURL(task.url);
            return cubemap;
        });
    }
}

Loader.registerLoader([Loader.TEXTURECUBE, "ltc"], CubemapLoader);
Loader.registerLoader([Loader.TEXTURECUBEBIN, "ltcb", "ltcb.ls"], CubemapBinLoader);