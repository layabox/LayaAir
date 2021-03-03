import * as glTF from "./glTFInterface";
import { LoaderManager } from "../net/LoaderManager";
import { Loader } from "../net/Loader";
import { Event } from "../events/Event";
import { Utils3D } from "../d3/utils/Utils3D";
import { URL } from "../net/URL";
import { Laya } from "../../Laya";
import { glTFBase64Tool } from "./glTFBase64Tool";
import { Handler } from "../utils/Handler";
import { Node } from "../display/Node";
import { Resource } from "../resource/Resource";
import { glTFUtils } from "./glTFUtils";
import { Texture2D } from "../resource/Texture2D";

/**
 * <code>glTFLoader</code> 类可用来加载 gltf 2.0 文件
 */
export class glTFLoader {

    /** glTF 资源 */
    static GLTF: string = "GLTF";

    /** glTF base64 Texture */
    static GLTFBASE64TEX: string = "GLTFBASE64TEX";

    /**
     * @internal
     * glTF buffer loaderManager
     */
    private static _innerBufferLoaderManager: LoaderManager = new LoaderManager();
    /**
     * @internal
     * glTF image loaderManager
     */
    private static _innerTextureLoaderManager: LoaderManager = new LoaderManager();

    /**
     * 初始化 glTF Loader
     */
    public static init() {
        // 指定 创建函数
        let createMap = LoaderManager.createMap;
        createMap["gltf"] = [glTFLoader.GLTF, glTFUtils._parse];

        // 指定 解析函数
        let parseMap = Loader.parserMap;
        parseMap[glTFLoader.GLTF] = glTFLoader._loadglTF;
        parseMap[glTFLoader.GLTFBASE64TEX] = glTFLoader._loadBase64Texture;

        // 加载错误 回调
        glTFLoader._innerBufferLoaderManager.on(Event.ERROR, null, glTFLoader._eventLoadManagerError);
        glTFLoader._innerTextureLoaderManager.on(Event.ERROR, null, glTFLoader._eventLoadManagerError);
    }

    /**
     * @internal
     * 加载 glTF
     * @param loader 
     */
    private static _loadglTF(loader: Loader): void {
        loader._originType = loader.type;
        loader.on(Event.LOADED, null, glTFLoader._onglTFLoaded, [loader]);
        loader.load(loader.url, Loader.JSON, false, null, true);
    }

    /**
     * @internal
     * 加载 base64 图片为 Textuer2D
     * @param loader 
     */
    private static _loadBase64Texture(loader: Loader): void {
        let url: string = loader.url;
        let type: string = "nativeimage";

        loader.on(Event.LOADED, null, function (image: any): void {
            loader._cache = loader._createCache;
            let tex: Texture2D = Texture2D._parse(image, loader._propertyParams, loader._constructParams);
            glTFLoader._endLoad(loader, tex);
        });
        loader.load(url, type, false, null, true);
    }

    /**
     * @internal
     * 解析 url 字符串
     * @param base 
     * @param value 
     */
    private static formatRelativePath(base: string, value: string): string {
        let path: string;
        path = base + value;
        let char1: string = value.charAt(0);
        if (char1 === ".") {
            let parts: any[] = path.split("/");
            for (let i = 0, len = parts.length; i < len; i++) {
                if (parts[i] == '..') {
                    let index: number = i - 1;
                    if (index > 0 && parts[index] !== '..') {
                        parts.splice(index, 2);
                        i -= 2;
                    }
                }
            }
            path = parts.join('/');
        }
        return path;
    }

    /**
     * @internal
     * 添加 url
     * @param urls 
     * @param urlMap 
     * @param urlVersion 
     * @param glTFBasePath 
     * @param path 
     * @param type 
     * @param constructParams 
     * @param propertyParams 
     */
    private static _addglTFInnerUrls(urls: any[], urlMap: any[], urlVersion: string, glTFBasePath: string, path: string, type: string, constructParams: any = null, propertyParams: any = null): string {
        let formatUrl: string = glTFLoader.formatRelativePath(glTFBasePath, path);
        (urlVersion) && (formatUrl = formatUrl + urlVersion);
        urls.push({ url: formatUrl, type: type, constructParams: constructParams, propertyParams: propertyParams });
        (urlMap) && (urlMap.push(formatUrl));
        return formatUrl;
    }

    /**
     * @internal
     * 获取 glTF 资源对象 数量
     * @param glTFData 
     */
    private static _getglTFInnerUrlsCount(glTFData: glTF.glTF): number {
        let urlCount: number = 0;
        // 收集 buffer url
        if (glTFData.buffers) {
            glTFData.buffers.forEach(buffer => {
                if (glTFBase64Tool.isBase64String(buffer.uri)) {

                }
                else {
                    urlCount++;
                }
            })
        }
        // 收集 texture url
        if (glTFData.textures) {
            urlCount += glTFData.textures.length;
        }

        return urlCount;
    }

    /**
     * @internal
     * 获取 glTF 内部 buffer 对象 url
     * @param glTFData 
     * @param bufferUrls 
     * @param urlVersion 
     * @param glTFBasePath 
     */
    private static _getglTFBufferUrls(glTFData: glTF.glTF, bufferUrls: any[], urlVersion: string, glTFBasePath: string): void {
        // 收集 buffer url
        if (glTFData.buffers) {
            glTFData.buffers.forEach(buffer => {
                if (glTFBase64Tool.isBase64String(buffer.uri)) {
                    let bin: ArrayBuffer = glTFBase64Tool.decode(buffer.uri.replace(glTFBase64Tool.reghead, ""));
                    Loader.cacheRes(buffer.uri, bin);
                }
                else {
                    buffer.uri = glTFLoader._addglTFInnerUrls(bufferUrls, null, urlVersion, glTFBasePath, buffer.uri, Loader.BUFFER);
                }
            })
        }
    }

    /**
     * @internal
     * 获取 glTF 内部 texture 对象 url
     * @param glTFData 
     * @param textureUrls 
     * @param subUrls 
     * @param urlVersion 
     * @param glTFBasePath 
     */
    private static _getglTFTextureUrls(glTFData: glTF.glTF, textureUrls: any[], subUrls: any[], urlVersion: string, glTFBasePath: string): void {
        // 收集 texture url
        if (glTFData.textures) {
            glTFData.textures.forEach(glTFTexture => {
                let glTFImage: glTF.glTFImage = glTFData.images[glTFTexture.source];
                let glTFSampler: glTF.glTFSampler = glTFData.samplers ? glTFData.samplers[glTFTexture.sampler] : undefined;
                let constructParams: any[] = glTFUtils.getTextureConstructParams(glTFImage, glTFSampler);
                let propertyParams: any[] = glTFUtils.getTexturePropertyParams(glTFSampler);
                if (glTFImage.bufferView != undefined || glTFImage.bufferView != null) {
                    let bufferView: glTF.glTFBufferView = glTFData.bufferViews[glTFImage.bufferView];
                    let glTFBuffer: glTF.glTFBuffer = glTFData.buffers[bufferView.buffer];
                    let buffer: ArrayBuffer = Loader.getRes(glTFBuffer.uri);
                    let byteOffset: number = (bufferView.byteOffset || 0);
                    let byteLength: number = bufferView.byteLength;
                    let arraybuffer: ArrayBuffer = buffer.slice(byteOffset, byteOffset + byteLength);
                    let base64: string = glTFBase64Tool.encode(arraybuffer);
                    let base64url: string = `data:${glTFImage.mimeType};base64,${base64}`;
                    glTFImage.uri = glTFLoader._addglTFInnerUrls(textureUrls, subUrls, urlVersion, "", base64url, glTFLoader.GLTFBASE64TEX, constructParams, propertyParams);
                }
                else if (glTFBase64Tool.isBase64String(glTFImage.uri)) {
                    glTFImage.uri = glTFLoader._addglTFInnerUrls(textureUrls, subUrls, urlVersion, "", glTFImage.uri, glTFLoader.GLTFBASE64TEX, constructParams, propertyParams);
                }
                else {
                    glTFImage.uri = glTFLoader._addglTFInnerUrls(textureUrls, subUrls, urlVersion, glTFBasePath, glTFImage.uri, Loader.TEXTURE2D, constructParams, propertyParams);
                }
            })
        }
    }

    /**
     * @internal
     * glTF 数据对象 加载完成回调
     * @param loader 
     * @param glTFData 
     */
    private static _onglTFLoaded(loader: Loader, glTFData: glTF.glTF): void {
        let url: string = loader.url;
        let urlVersion: string = Utils3D.getURLVerion(url);
        let glTFBasePath: string = URL.getPath(url);
        let bufferUrls: any[] = [];

        glTFLoader._getglTFBufferUrls(glTFData, bufferUrls, urlVersion, glTFBasePath);

        let urlCount: number = glTFLoader._getglTFInnerUrlsCount(glTFData);
        let totalProcessCount: number = urlCount + 1;
        let weight: number = 1 / totalProcessCount;
        glTFLoader._onProcessChange(loader, 0, weight, 1.0);
        let processCeil: number = urlCount / totalProcessCount;
        if (bufferUrls.length > 0) {
            let processHandler: Handler = Handler.create(null, glTFLoader._onProcessChange, [loader, weight, processCeil], false);
            glTFLoader._innerBufferLoaderManager._create(bufferUrls, false, Handler.create(null, glTFLoader._onglTFBufferResourceLoaded, [loader, processHandler, glTFData, urlVersion, glTFBasePath, weight + processCeil * bufferUrls.length, processCeil]), processHandler, null, null, null, 1, true);
        }
        else {
            glTFLoader._onglTFBufferResourceLoaded(loader, null, glTFData, urlVersion, glTFBasePath, weight, processCeil);
        }
    }

    /**
     * @internal
     * glTF buffer 加载完成 回调
     * @param loader 
     * @param processHandler 
     * @param glTFData 
     * @param urlVersion 
     * @param glTFBasePath 
     * @param processOffset 
     * @param processCeil 
     */
    private static _onglTFBufferResourceLoaded(loader: Loader, processHandler: Handler, glTFData: glTF.glTF, urlVersion: string, glTFBasePath: string, processOffset: number, processCeil: number): void {
        (processHandler) && (processHandler.recover());

        let textureUrls: any[] = [];
        let subUrls: any[] = [];

        glTFLoader._getglTFTextureUrls(glTFData, textureUrls, subUrls, urlVersion, glTFBasePath);

        if (textureUrls.length > 0) {
            let process: Handler = Handler.create(null, glTFLoader._onProcessChange, [loader, processOffset, processCeil], false);
            glTFLoader._innerTextureLoaderManager._create(textureUrls, false, Handler.create(null, glTFLoader._onglTFTextureResourceLoaded, [loader, process, glTFData, subUrls]), processHandler, null, null, null, 1, true);
        }
        else {
            glTFLoader._onglTFTextureResourceLoaded(loader, processHandler, glTFData, subUrls);
        }
    }

    /**
     * @internal
     * glTF texture 加载完成回调
     * @param loader 
     * @param processHandler 
     * @param glTFData 
     * @param subUrls 
     */
    private static _onglTFTextureResourceLoaded(loader: Loader, processHandler: Handler, glTFData: glTF.glTF, subUrls: any[]): void {
        (processHandler) && (processHandler.recover());
        loader._cache = loader._createCache;
        //  todo  glTF 加载为 Scene / Sprite3D ?
        let item: Node = glTFUtils._parse(glTFData, loader._propertyParams, loader._constructParams);
        glTFLoader._endLoad(loader, item, subUrls);
    }

    /**
     * @internal
     * 加载错误回调
     * @param msg 
     */
    private static _eventLoadManagerError(msg: string): void {
        Laya.loader.event(Event.ERROR, msg);
    }

    /**
     * @internal
     * 加载进度回调
     */
    private static _onProcessChange(loader: Loader, offset: number, weight: number, process: number): void {
        process = offset + process * weight;
        (process < 1.0) && (loader.event(Event.PROGRESS, process * 2 / 3 + 1 / 3));
    }

    /**
     * @internal
     * 加载结束
     * @param loader 
     * @param content 
     * @param subResource 
     */
    private static _endLoad(loader: Loader, content: any = null, subResource: any[] = null): void {
        if (subResource) {
            for (let i = 0; i < subResource.length; i++) {
                let resource: Resource = <Resource>Loader.getRes(subResource[i]);
                (resource) && (resource._removeReference());
            }
        }
        loader.endLoad(content);
    }

}
