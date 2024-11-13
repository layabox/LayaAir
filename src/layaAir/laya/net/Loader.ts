import { ILaya } from "../../ILaya";
import { Event } from "../events/Event";
import { URL } from "../net/URL";
import { Texture } from "../resource/Texture";
import { Delegate } from "../utils/Delegate";
import { AtlasInfoManager } from "./AtlasInfoManager";
import { WorkerLoader } from "./WorkerLoader";
import { Utils } from "../utils/Utils";
import { AtlasResource } from "../resource/AtlasResource";
import { Texture2D, TextureConstructParams, TexturePropertyParams } from "../resource/Texture2D";
import { IBatchProgress, ProgressCallback, BatchProgress } from "./BatchProgress";
import { Handler } from "../utils/Handler";
import { EventDispatcher } from "../events/EventDispatcher";
import { Prefab } from "../resource/HierarchyResource";
import { Node } from "../display/Node";
import { Resource } from "../resource/Resource";
import { Downloader } from "./Downloader";
import { AssetDb } from "../resource/AssetDb";
import { BaseTexture } from "../resource/BaseTexture";
import { LayaEnv } from "../../LayaEnv";
import { XML } from "../html/XML";

export interface ILoadTask {
    readonly type: string;
    readonly url: string;
    readonly uuid: string;
    readonly ext: string;
    readonly loader: Loader;
    readonly obsoluteInst: Resource;
    readonly options: Readonly<ILoadOptions>;
    readonly progress: IBatchProgress;
}

export interface IResourceLoader {
    load(task: ILoadTask): Promise<any>;
    postLoad?(task: ILoadTask, content: any): Promise<void>;
}

export interface ILoadOptions {
    type?: string;
    priority?: number;
    group?: string;
    cache?: boolean;
    ignoreCache?: boolean;
    noRetry?: boolean;
    silent?: boolean;
    useWorkerLoader?: boolean;
    constructParams?: TextureConstructParams;
    propertyParams?: TexturePropertyParams;
    blob?: ArrayBuffer;
    initiator?: ILoadTask;
    [key: string]: any;
}

export interface ILoadURL extends ILoadOptions {
    url: string;
}

interface ContentTypeMap {
    "text": string,
    "json": any,
    "xml": XML,
    "arraybuffer": ArrayBuffer,
    "image": HTMLImageElement | ImageBitmap,
    "sound": HTMLAudioElement
}

var typeIdCounter = 0;
type TypeMapEntry = { typeId: number, loaderType: new () => IResourceLoader, hotReloadable?: boolean };

interface URLInfo {
    ext: string,
    typeId: number,
    main: boolean,
    loaderType: new () => IResourceLoader,
}
const NullURLInfo: Readonly<URLInfo> = { ext: null, typeId: null, main: false, loaderType: null };

/**
 * @en The `Loader` class can be used to load resources such as text, JSON, XML, binary, images, etc.
 * @zh `Loader` 类可用来加载文本、JSON、XML、二进制、图像等资源。
 */
export class Loader extends EventDispatcher {
    /**
     * @en Text type, returns a TextResource object containing a string after loading is complete.
     * @zh 文本类型，加载完成后返回包含 string 的 TextResource 对象。
     */
    static TEXT = "text";
    /**
     * @en JSON type, returns a TextResource object containing JSON data after loading is complete.
     * @zh JSON 类型，加载完成后返回包含 json 数据的 TextResource 对象。
     */
    static JSON = "json";
    /**
     * @en XML type, returns a TextResource object containing domXML after loading is complete.
     * @zh XML 类型，加载完成后返回包含 domXML 的 TextResource 对象。
     */
    static XML = "xml";
    /**
     * @en Binary type, returns a TextResource object containing arraybuffer after loading is complete.
     * @zh 二进制类型，加载完成后返回包含 arraybuffer 的 TextResource 对象。
     */
    static BUFFER = "arraybuffer";
    /**
     * @en Texture type, returns a Texture after loading is complete.
     * @zh 纹理类型，加载完成后返回 Texture。
     */
    static IMAGE = "image";
    /**
     * @en Sound type, returns a Sound after loading is complete.
     * @zh 声音类型，加载完成后返回 Sound。
     */
    static SOUND = "sound";
    /**
     * @en Video type, returns a VideoTexture after loading is complete.
     * @zh 视频类型，加载完成后返回 VideoTexture。
     */
    static VIDEO = "video";
    /**
     * @en Atlas type, returns atlas JSON information (and creates small Textures within the atlas) after loading is complete.
     * @zh 图集类型，加载完成后返回图集 json 信息（并创建图集内小图 Texture）。
     */
    static ATLAS = "atlas";
    /**
     * @en Bitmap font type, returns a BitmapFont after loading is complete. It will be automatically registered as a bitmap font based on the file name.
     * @zh 位图字体类型，加载完成后返回 BitmapFont，加载后，会根据文件名自动注册为位图字体。
     */
    static FONT = "font";
    /**
     * @en TTF font type, returns an object after loading is complete.
     * @zh TTF 字体类型，加载完成后返回一个对象。
     */
    static TTF = "ttf";
    /**
     * @en Hierarchy resource.
     * @zh Hierarchy 资源。
     */
    static HIERARCHY = "HIERARCHY";
    /**
     * @en Mesh resource.
     * @zh Mesh 资源。
     */
    static MESH = "MESH";
    /**
     * @en Material resource.
     * @zh Material 资源。
     */
    static MATERIAL = "MATERIAL";
    /**
     * @en Texture2D resource. This is for compatibility, it should actually be BaseTexture.
     * @zh Texture2D 资源。这里是为了兼容，实际应该是 BaseTexture。
     */
    static TEXTURE2D = "TEXTURE2D"; //这里是为了兼容，实际应该是BaseTexture
    /**
     * @en TextureCube resource. For compatibility, now TEXTURE2D type can load Texture or TextureCube.
     * @zh TextureCube 资源。兼容处理，现在 TEXTURE2D 类型可以载入 Texture 或者 TextureCube。
     */
    static TEXTURECUBE = "TEXTURE2D"; //兼容处理，现在TEXTURE2D类型可以载入Texture或者TextureCube
    /**
     * @en TEXTURE2DARRAY resource.
     * @zh TEXTURE2DARRAY 资源。
     */
    static TEXTURE2DARRAY = "TEXTURE2D";
    /**
     * @en AnimationClip resource.
     * @zh AnimationClip 资源。
     */
    static ANIMATIONCLIP = "ANIMATIONCLIP";
    /**
     * @en Terrain height data resource.
     * @zh Terrain 高度数据资源。
     */
    static TERRAINHEIGHTDATA = "TERRAINHEIGHTDATA";
    /**
     * @en Terrain resource.
     * @zh Terrain 资源。
     */
    static TERRAINRES = "TERRAIN";
    /**
     * @en Spine resource.
     * @zh Spine 资源。
     */
    static SPINE = "SPINE";
    // Loader ResourceTime  
    /**
     * @en Resource download + parse time.
     * @zh 资源下载 + 解析时间。
     */
    static LoaderStat_LoadResourceTime: number;
    /**
     * @en Number of resource downloads.
     * @zh 资源下载次数。  
     */
    static LoaderStat_LoaderResourceCount: number;
    /**
     * @en Number of network file requests.
     * @zh 网络文件请求次数。
     */
    static LoaderStat_LoadRequestCount: number;//网络文件请求次数
    /**
     * @en Network download time.
     * @zh 网络下载时间。
     */
    static LoaderStat_LoadRequestTime: number;//网络下载时间

    /**
     * @en Number of retry attempts after loading fails, default is 1.
     * @zh 加载出错后的重试次数，默认重试一次。
     */
    retryNum: number = 1;
    /**
     * @en Delay time before retrying after an error, default is to retry immediately.
     * @zh 延迟时间多久再进行错误重试，默认立即重试。
     */
    retryDelay: number = 0;
    /**
     * @en Maximum number of download threads, default is 5.
     * @zh 最大下载线程，默认为 5 个。
     */
    maxLoader: number = 5;

    /**
     * @en List of resource loaders.
     * @zh 资源加载器列表。
     */
    static readonly extMap: { [ext: string]: Array<TypeMapEntry> } = {};
    /**
     * @en Resource type mapping table.
     * @zh 资源类型对应表。
     */
    static readonly typeMap: { [type: string]: TypeMapEntry } = {};
    /**
     * @en Hot overload identification.
     * @zh 热重载标识。
     */
    static readonly hotReloadableFlags: Record<number, boolean> = {};
    /**
     * @en The downloader used to download resources.
     * @zh 下载器，用来下载资源。
     */
    static downloader = new Downloader();

    /**
     * @en Register a resource loader.
     * @param exts Extensions
     * @param cls Loader class
     * @param type Type identifier. If this kind of resource needs to support identification without extension, or if one extension corresponds to multiple resource types, specifying the type parameter is the best practice.
     * @param hotReloadable Whether to support hot reload
     * @zh 注册一种资源装载器。
     * @param exts 扩展名
     * @param cls 加载器类
     * @param type 类型标识。如果这种资源需要支持识别没有扩展名的情况，或者一个扩展名对应了多种资源类型的情况，那么指定 type 参数是个最优实践。
     * @param hotReloadable 是否支持热重载
     */
    static registerLoader(exts: string[], cls: new () => IResourceLoader, type?: string, hotReloadable?: boolean) {
        let typeEntry: TypeMapEntry;
        if (type) {
            typeEntry = <TypeMapEntry>Loader.typeMap[type];
            if (!typeEntry)
                Loader.typeMap[type] = typeEntry = { typeId: typeIdCounter++, loaderType: cls };
            else if (typeEntry.loaderType != cls)
                typeEntry = { typeId: typeEntry.typeId, loaderType: cls };
        }
        else
            typeEntry = { typeId: typeIdCounter++, loaderType: cls };
        if (hotReloadable)
            Loader.hotReloadableFlags[typeEntry.typeId] = true;

        for (let ext of exts) {
            let entry = Loader.extMap[ext];
            if (entry && type) { //这个扩展名已经被注册为其他资源类型
                let i = entry.findIndex(e => e.typeId == typeEntry.typeId);
                if (i == -1) //注册为次类型
                    entry.push(typeEntry);
                else //覆盖旧的设置
                    entry[i].loaderType = cls;
            }
            else {
                Loader.extMap[ext] = [typeEntry];
            }
        }
    }

    /**
     * @en Resource group mapping table.
     * @zh 资源分组对应表。
     */
    static groupMap: { [name: string]: Set<string> } = {};
    /**
     * @en Pool of loaded resources.
     * @zh 已加载的资源池。
     */
    static loadedMap: { [url: string]: Array<any> } = {};
    /**
     * @en Preloaded data files. If a url has a record here, the data here will be used directly when requested, abandoning network loading.
     * @zh 预加载的数据文件。如果一个 url 在这里有记录，则请求时直接使用这里的数据，放弃网络加载。
     */
    static preLoadedMap: { [url: string]: any } = {};

    private _loadings: Map<string, LoadTask>;
    private _queue: Array<DownloadItem>;
    private _downloadings: Set<DownloadItem>;
    private _tempTime: number;
    /** @ignore */
    constructor() {
        super();

        this._loadings = new Map();
        this._queue = [];
        this._downloadings = new Set();
    }

    /**
     * @en Indicates whether there are any loading tasks in progress.
     * @zh 是否有任何的加载任务在进行。
     */
    public get loading(): boolean {
        return this._loadings.size > 0;
    }

    /**
     * @en Loads resources.
     * @param url The URL or array of URLs of the resource(s) to load.
     * @param type The type of resource. For example: Loader.IMAGE.
     * @param onProgress The progress callback function.
     * @returns A Promise that resolves with the loaded resource(s). If url is a single resource, it returns the loaded resource or null if failed. If url is an array, it returns an array of loaded resources or null for each failed load.
     * @zh 加载资源。
     * @param url 要加载的资源地址或资源地址数组。
     * @param type 资源类型。比如：Loader.IMAGE。
     * @param onProgress 进度回调函数。
     * @returns 返回一个 Promise。根据 url 类型不同分为两种情况：1. url 为字符串或 ILoadURL 类型时，如果加载成功，则返回加载完成的资源，否则为 null；2. url 为数组类型时，返回一个数组，数组每个元素为加载完成的资源或 null。
     */
    load(url: string | ILoadURL | (string | Readonly<ILoadURL>)[], type?: string, onProgress?: ProgressCallback): Promise<any>;
    /**
     * @en Loads resources with options.
     * @param url The URL or array of URLs of the resource(s) to load.
     * @param options The loading options.
     * @param onProgress The progress callback function.
     * @returns A Promise that resolves with the loaded resource(s). If url is a single resource, it returns the loaded resource or null if failed. If url is an array, it returns an array of loaded resources or null for each failed load.
     * @zh 使用选项加载资源。
     * @param url 要加载的资源地址或资源地址数组。
     * @param options 加载选项。
     * @param onProgress 进度回调函数。
     * @returns 返回一个 Promise。根据 url 类型不同分为两种情况：1. url 为字符串或 ILoadURL 类型时，如果加载成功，则返回加载完成的资源，否则为 null；2. url 为数组类型时，返回一个数组，数组每个元素为加载完成的资源或 null。
     */
    load(url: string | ILoadURL | (string | Readonly<ILoadURL>)[], options?: Readonly<ILoadOptions>, onProgress?: ProgressCallback): Promise<any>;
    /**
     * @en Loads resources (compatible with engine 2.0 loading interface).
     * @param url The URL or array of URLs of the resource(s) to load. Can be a simple array ["a.png", "b.png"] or a complex array [{url:"a.png",type:Loader.IMAGE,size:100,priority:1},{url:"b.json",type:Loader.JSON,size:50,priority:1}].
     * @param complete The completion callback. Returns the loaded resource if url is a string, or an array of loaded resources (or null for failed loads) if url is an array.
     * @param progress The progress callback. The callback parameter is the current resource loading progress (0-1).
     * @param type The resource type. For example: Loader.IMAGE.
     * @param priority The loading priority. Higher numbers indicate higher priority. Default is 0.
     * @param cache Whether to cache the resource. Default is true.
     * @param group The group name for resource management.
     * @param ignoreCache Whether to ignore the cache. Default is false.
     * @param useWorkerLoader Whether to use worker loading (only for IMAGE and ATLAS types, and when browser supports it). Default is false.
     * @returns A Promise object.
     * @zh 加载资源（兼容 2.0 引擎的加载接口）。
     * @param url 要加载的单个资源地址或资源信息数组。可以是简单数组 ["a.png", "b.png"] 或复杂数组 [{url:"a.png",type:Loader.IMAGE,size:100,priority:1},{url:"b.json",type:Loader.JSON,size:50,priority:1}]。
     * @param complete 加载完成回调。如果 url 是字符串，返回加载完成的资源；如果 url 是数组，返回加载完成的资源数组（加载失败的项为 null）。
     * @param progress 加载进度回调。回调参数为当前资源的加载进度（0-1）。
     * @param type 资源类型。比如：Loader.IMAGE。
     * @param priority 加载优先级，数字越大优先级越高。默认为 0。
     * @param cache 是否缓存资源。默认为 true。
     * @param group 分组名称，用于资源管理。
     * @param ignoreCache 是否忽略缓存。默认为 false。
     * @param useWorkerLoader 是否使用 worker 加载（仅针对 IMAGE 和 ATLAS 类型，且浏览器支持时生效）。默认为 false。
     * @returns Promise 对象。
     */
    load(url: string | ILoadURL | (string | Readonly<ILoadURL>)[], complete?: Handler, progress?: Handler, type?: string, priority?: number, cache?: boolean, group?: string, ignoreCache?: boolean, useWorkerLoader?: boolean): Promise<any>;
    /**
     * @en Loads resources with various options and configurations.
     * @param url The URL or array of URLs of the resource(s) to load.
     * @param arg1 Can be a string (resource type), an ILoadOptions object, or a Handler for completion callback.
     * @param arg2 Can be a ProgressCallback function or a Handler for progress callback.
     * @param arg3 Resource type (used when arg1 is a Handler).
     * @param priority Loading priority.
     * @param cache Whether to cache the resource.
     * @param group Resource group name.
     * @param ignoreCache Whether to ignore cache.
     * @param useWorkerLoader Whether to use worker for loading.
     * @returns A Promise that resolves with the loaded resource(s).
     * @zh 加载资源，支持多种选项和配置。
     * @param url 要加载的资源 URL 或 URL 数组。
     * @param arg1 可以是字符串（资源类型）、ILoadOptions 对象或用于完成回调的 Handler。
     * @param arg2 可以是 ProgressCallback 函数或用于进度回调的 Handler。
     * @param arg3 资源类型（当 arg1 为 Handler 时使用）。
     * @param priority 加载优先级。
     * @param cache 是否缓存资源。
     * @param group 资源组名称。
     * @param ignoreCache 是否忽略缓存。
     * @param useWorkerLoader 是否使用 worker 进行加载。
     * @returns 返回一个 Promise，解析为加载的资源。
     */
    load(url: string | ILoadURL | (string | Readonly<ILoadURL>)[], arg1?: string | Readonly<ILoadOptions> | Handler, arg2?: ProgressCallback | Handler, arg3?: string, priority?: number, cache?: boolean, group?: string, ignoreCache?: boolean, useWorkerLoader?: boolean): Promise<any> {
        let complete: Handler;
        let type: string;
        let options: ILoadOptions = dummyOptions;
        if (arg1 instanceof Handler) {
            complete = arg1;
            type = arg3;
        }
        else if (typeof (arg1) === "string")
            type = arg1;
        else if (arg1 != null) {
            type = arg1.type;
            options = arg1;
        }

        if (priority != null || cache != null || ignoreCache != null || group != null || useWorkerLoader != null) {
            if (options === dummyOptions)
                options = { priority, cache, ignoreCache, group, useWorkerLoader };
            else
                options = Object.assign(options, { priority, cache, ignoreCache, group, useWorkerLoader });
        }
        if (options.cache === false)
            options.ignoreCache = true;

        let onProgress: ProgressCallback;
        if (arg2 instanceof Handler)
            onProgress = (value: number) => arg2.runWith(value);
        else
            onProgress = arg2;

        let promise: Promise<any>;
        if (Array.isArray(url)) {
            let pd: BatchProgress;
            if (onProgress)
                pd = new BatchProgress(onProgress);

            let promises: Array<Promise<any>> = [];
            for (let i = 0; i < url.length; i++) {
                let url2 = url[i];
                if (!url2)
                    continue;

                if (typeof (url2) === "string") {
                    promises.push(this._load1(url2, type, options, pd?.createCallback()));
                }
                else {
                    promises.push(this._load1(url2.url, url2.type || type,
                        options !== dummyOptions ? Object.assign({}, options, url2) : url2, pd?.createCallback()));
                }
            }

            promise = Promise.all(promises);
        }
        else if (typeof (url) === "string")
            promise = this._load1(url, type, options, onProgress);
        else
            promise = this._load1(url.url, url.type || type,
                options !== dummyOptions ? Object.assign({}, options, url) : url, onProgress);

        if (complete)
            return promise.then(result => {
                complete.runWith(result);
                return result;
            });
        else
            return promise;
    }

    /** @internal */
    _load1(url: string, type: string, options: ILoadOptions, onProgress: ProgressCallback): Promise<any> {
        if (LayaEnv.isPreview) {
            if (url.startsWith("res://")) {
                let uuid = url.substring(6);
                return AssetDb.inst.UUID_to_URL_async(uuid).then(url2 => {
                    if (url2)
                        return this._load2(url2, uuid, type, options, onProgress);
                    else {
                        !options.silent && Loader.warnFailed(url, undefined, options.initiator?.url);
                        return Promise.resolve(null);
                    }
                });
            }
            else {
                return AssetDb.inst.URL_to_UUID_async(url).then(uuid => {
                    return this._load2(url, uuid, type, options, onProgress);
                });
            }
        }
        else
            return this._load2(url, null, type, options, onProgress);
    }

    /** @internal */
    _load2(url: string, uuid: string, type: string, options: ILoadOptions, onProgress: ProgressCallback): Promise<any> {
        let { ext, typeId, main, loaderType } = Loader.getURLInfo(url, type);
        if (!loaderType) {
            !options.silent && Loader.warnFailed(url, undefined, options.initiator?.url);
            return Promise.resolve(null);
        }
        let formattedUrl = URL.formatURL(url);

        if (options.group) {
            let set = Loader.groupMap[options.group];
            if (!set)
                set = Loader.groupMap[options.group] = new Set();
            set.add(formattedUrl);
        }

        let obsoluteRes: Resource;
        if (!options.ignoreCache) {
            let cacheRes = Loader._getRes(formattedUrl, type);
            if (cacheRes !== undefined) {
                if (cacheRes == null)
                    return Promise.resolve(null);
                else {
                    if (!(cacheRes instanceof Resource))
                        return Promise.resolve(cacheRes);

                    if (cacheRes.obsolute)
                        obsoluteRes = cacheRes;

                    if (!obsoluteRes && (!cacheRes.uuid || !uuid || uuid == cacheRes.uuid))
                        return Promise.resolve(cacheRes);
                }
            }
        }

        let loadingKey = formattedUrl;
        if (!main)
            loadingKey += "@" + typeId;
        let task = this._loadings.get(loadingKey);
        if (task) {
            //fix recursive dependency
            let p = options.initiator;
            while (p) {
                if (p === task)
                    return Promise.resolve();
                p = p.options.initiator;
            }

            if (task.result != null)
                return task.result;

            if (onProgress)
                task.onProgress.add(onProgress);
            return new Promise((resolve) => task.onComplete.add(resolve));
        }

        //判断是否在自动图集里
        let atlasInfo = AtlasInfoManager.getFileLoadPath(formattedUrl);
        if (atlasInfo) {
            return this.load(atlasInfo.url, { type: Loader.ATLAS, baseUrl: atlasInfo.baseUrl }).then(() => {
                return Loader.getRes(url, type);
            });
        }

        if (loadTaskPool.length > 0)
            task = loadTaskPool.pop();
        else
            task = new LoadTask();
        task.type = type;
        task.url = url;
        task.uuid = uuid;
        task.ext = ext;
        options = Object.assign(task.options, options);
        delete options.type;
        if (options.priority == null)
            options.priority = 0;
        if (options.useWorkerLoader == null)
            options.useWorkerLoader = WorkerLoader.enable;
        if (onProgress)
            task.onProgress.add(onProgress);
        task.loader = this;
        task.obsoluteInst = obsoluteRes;

        let assetLoader = new loaderType();
        this._loadings.set(loadingKey, task);

        let promise: Promise<any>;

        try {
            Loader.LoaderStat_LoaderResourceCount++;
            this._tempTime = performance.now();
            promise = assetLoader.load(task);
        }
        catch (err: any) {
            !options.silent && Loader.warnFailed(url, err, options.initiator?.url);

            promise = Promise.resolve(null);
        }

        return promise.then(content => {
            Loader.LoaderStat_LoadResourceTime += performance.now() - this._tempTime;
            if (content instanceof Resource) {
                content.obsolute = false;
                content._setCreateURL(url, uuid);
            }

            if (task.options.cache !== false)
                Loader._cacheRes(formattedUrl, content, typeId, main);

            if (content != null && assetLoader.postLoad != null) {
                task.result = content;
                return assetLoader.postLoad(task, content).then(() => {
                    task.progress.update(-1, 1);
                    task.onComplete.invoke(content);
                    return content;
                });
            }
            else {
                task.progress.update(-1, 1);
                task.onComplete.invoke(content);
                return content;
            }
        }).catch(error => {
            !options.silent && Loader.warnFailed(url, error, options.initiator?.url);

            if (task.options.cache !== false)
                Loader._cacheRes(formattedUrl, null, typeId, main);

            task.onComplete.invoke(null);
            return null;
        }).then(content => {
            this._loadings.delete(loadingKey);
            task.reset();
            loadTaskPool.push(task);
            if (this._loadings.size == 0)
                this.event(Event.COMPLETE);
            return content;
        });
    }

    /**
     * @en Download from the specified URL. This is a low-level method for downloading resources. Unlike the load method, it doesn't parse the returned data or cache the downloaded content. Returns the downloaded data on success, null on failure.
     * @param url The URL to download from.
     * @param contentType The expected content type of the resource.
     * @param onProgress Optional callback for progress updates.
     * @param options Optional loading options.
     * @returns A promise that resolves with the downloaded content. If the download fails, the promise resolves with null.
     * @zh 从指定URL下载。这是较为底层的下载资源的方法，它和load方法不同，不对返回的数据进行解析，也不会缓存下载的内容。成功则返回下载的数据，失败返回null。
     * @param url 要下载的URL。
     * @param contentType 预期的资源内容类型。
     * @param onProgress 可选的进度更新回调。
     * @param options 可选的加载选项。
     * @returns 解析为下载内容的Promise，加载失败则返回null
     */
    fetch<K extends keyof ContentTypeMap>(url: string, contentType: K, onProgress?: ProgressCallback, options?: Readonly<ILoadOptions>): Promise<ContentTypeMap[K]> {
        options = options || dummyOptions;
        let task: DownloadItem = {
            originalUrl: url,
            url: url,
            contentType: contentType,
            priority: options.priority ?? 1,
            retryCnt: 0,
            onProgress: onProgress,
            onComplete: null,
        };
        if (options.useWorkerLoader) {
            task.useWorkerLoader = true;
            task.workerLoaderOptions = options.workerLoaderOptions;
        }
        if (options.blob)
            task.blob = options.blob;
        if (options.noRetry)
            task.retryCnt = -1;
        if (options.silent)
            task.silent = true;

        return AssetDb.inst.resolveURL(url).then(url => {
            if (url)
                return new Promise((resolve) => {
                    task.url = URL.formatURL(url);
                    task.onComplete = resolve;
                    this.queueToDownload(task);
                });
            else
                return null;
        });
    }

    private queueToDownload(item: DownloadItem) {
        if (this._downloadings.size < this.maxLoader) {
            this.download(item);
            return;
        }

        let priority = item.priority;
        if (priority == 0)
            this._queue.push(item);
        else {
            let i = this._queue.findIndex(e => e.priority < priority);
            if (i != -1)
                this._queue.splice(i, 0, item);
            else
                this._queue.push(item);
        }
    }

    private download(item: DownloadItem) {
        this._downloadings.add(item);
        Loader.LoaderStat_LoadRequestCount++;
        item.startTime = performance.now();
        let url = URL.postFormatURL(item.url);

        if (item.contentType == "image") {
            let preloadedContent = Loader.preLoadedMap[item.url];
            if (preloadedContent) {
                if (!(preloadedContent instanceof ArrayBuffer)) {
                    this.completeItem(item, preloadedContent);
                    return;
                }

                //cache as arraybuffer
                item.blob = preloadedContent;
            }

            if (item.blob) {
                Loader.downloader.imageWithBlob(item, item.blob, item.originalUrl, item.onProgress, (data: any, error: string) => {
                    if (!data)
                        item.retryCnt = -1; //失败无需重试
                    this.completeItem(item, data, error);
                });
            }
            else if (item.useWorkerLoader) {
                Loader.downloader.imageWithWorker(item, url, item.originalUrl, item.onProgress, (data: any, error: string) => {
                    if (!data)
                        item.useWorkerLoader = false; //重试不用worker
                    this.completeItem(item, data, error);
                });
            }
            else {
                Loader.downloader.image(item, url, item.originalUrl, item.onProgress, (data: any, error: string) =>
                    this.completeItem(item, data, error));
            }
        }
        else if (item.contentType == "sound") {
            Loader.downloader.audio(item, url, item.originalUrl, item.onProgress, (data: any, error: string) =>
                this.completeItem(item, data, error));
        }
        else {
            let preloadedContent = Loader.preLoadedMap[item.url];
            if (preloadedContent) {
                this.completeItem(item, preloadedContent);
                return;
            }

            Loader.downloader.common(item, url, item.originalUrl, item.contentType, item.onProgress, (data: any, error: string) =>
                this.completeItem(item, data, error));
        }
    }

    private completeItem(item: DownloadItem, content: any, error?: string) {
        this._downloadings.delete(item);
        Loader.LoaderStat_LoadRequestTime += performance.now() - item.startTime;
        if (content) {
            if (this._downloadings.size < this.maxLoader && this._queue.length > 0)
                this.download(this._queue.shift());

            if (item.onProgress)
                item.onProgress(1);

            item.onComplete(content);
        }
        else if (item.retryCnt != -1 && item.retryCnt < this.retryNum) {
            item.retryCnt++;
            if (!item.silent)
                console.debug(`Retry to load ${item.url} (${item.retryCnt})`);
            ILaya.systemTimer.once(this.retryDelay, this, this.queueToDownload, [item], false);
        }
        else {
            !item.silent && Loader.warnFailed(item.url);
            if (item.onProgress)
                item.onProgress(1);

            if (this._downloadings.size < this.maxLoader && this._queue.length > 0)
                this.download(this._queue.shift());

            item.onComplete(null);
        }
    }

    /**
     * @en Get URL information based on the provided URL and optional type.
     * @param url The URL to analyze.
     * @param type Optional type specification.
     * @returns URLInfo object containing extension, main flag, typeId, and loaderType.
     * @zh 根据提供的URL和可选类型获取URL信息。
     * @param url 要分析的URL。
     * @param type 可选的类型规范。
     * @returns 包含扩展名、主要标志、类型ID和加载器类型的URLInfo对象。
     */
    public static getURLInfo(url: string, type?: string): URLInfo {
        //先根据扩展名获得注册信息A
        let ext = url.startsWith("data:") ? "png" : Utils.getFileExtension(url);
        let extEntry: Array<TypeMapEntry>;
        if (ext.length > 0)
            extEntry = Loader.extMap[ext];

        let typeId: number;
        let main: boolean;
        let loaderType: new () => IResourceLoader;

        if (type) { //指定了类型
            let typeEntry = Loader.typeMap[type];
            if (!typeEntry)
                return NullURLInfo;

            typeId = typeEntry.typeId;

            let i: number = 0;
            if (extEntry) {
                if (extEntry[0].typeId === typeId //优化，大部分情况均为如此
                    || (i = extEntry.findIndex(e => e.typeId === typeId)) != -1) {
                    main = i == 0;
                    loaderType = extEntry[i].loaderType;
                }
                else {
                    //未与扩展名匹配的情况，例如a.lh试图以Loader.JSON类型加载，这种组合没有注册，但仍然允许加载为副资源
                    main = false;
                    loaderType = typeEntry.loaderType;
                }
            }
            else { //扩展名没有注册的情况
                main = type != Loader.TEXTURE2D;
                loaderType = typeEntry.loaderType;
            }
        }
        else {
            if (!extEntry)
                return NullURLInfo;

            //没有自定类型，则认为是主资源
            main = true;
            typeId = extEntry[0].typeId;
            loaderType = extEntry[0].loaderType;
        }

        return { ext, main, typeId, loaderType };
    }

    /**
     * @en Log a warning about a failed resource load, optionally including the initiator URL.
     * @param url The URL of the resource that failed to load.
     * @param err Optional error object or message.
     * @param initiatorUrl Optional URL of the resource that initiated the load.
     * @zh 记录资源加载失败的警告，可选择包含启动器URL。
     * @param url 加载失败的资源URL。
     * @param err 可选的错误对象或消息。
     * @param initiatorUrl 可选的启动加载的资源URL。
     */
    public static warnFailed(url: string, err?: any, initiatorUrl?: string) {
        if (initiatorUrl)
            this.warn(`Failed to load '${url}' (in '${initiatorUrl}')`, err);
        else
            this.warn(`Failed to load '${url}'`, err);
    }

    /**
     * @en Log a warning message, optionally including an error object.
     * @param msg The warning message to log.
     * @param err Optional error object to include in the warning.
     * @zh 记录警告消息，可选择包含错误对象。
     * @param msg 要记录的警告消息。
     * @param err 可选的要包含在警告中的错误对象。
     */
    public static warn(msg: string, err?: any) {
        if (err)
            console.warn(msg, err);
        else
            console.warn(msg);
    }

    /**
     * @en Retrieve resources from the specified resource address.
     * @param url The resource address.
     * @return Returns the resource.
     * @zh 获取指定资源地址的资源。
     * @param url 资源地址。
     * @return 返回资源。
     */
    static getRes(url: string, type?: string): any {
        url = URL.formatURL(url);
        let ret = Loader._getRes(url, type);
        return ret || null;
    }

    /** @internal */
    static _getRes(url: string, type?: string): any {
        let resArr = Loader.loadedMap[url];
        if (!resArr)
            return undefined;

        let ret: any;
        if (type) {
            let typeEntry = <TypeMapEntry>Loader.typeMap[type];
            if (!typeEntry)
                return undefined;

            if (resArr.length == 2) { //优化，大部分情况都是只有主资源，也就是两个元素
                if (resArr[0] == typeEntry.typeId)
                    ret = resArr[1];
            }
            else {
                let i = resArr.indexOf(typeEntry.typeId);
                if (i != -1)
                    ret = resArr[i + 1];
            }
        }
        else
            ret = resArr[1]; //主资源

        if ((ret instanceof Resource) && ret.destroyed)
            return undefined;
        else
            return ret;
    }

    /**
     * @en Get a Texture2D resource by URL.
     * @param url The URL of the Texture2D resource.
     * @returns The Texture2D resource.
     * @zh 通过 URL 获取 Texture2D 资源。
     * @param url Texture2D 资源的 URL。
     * @returns Texture2D 资源。
     */
    static getTexture2D(url: string): Texture2D {
        return Loader.getRes(url, Loader.TEXTURE2D);
    }

    /**
     * @en Get a BaseTexture resource by URL.
     * @param url The URL of the BaseTexture resource.
     * @returns The BaseTexture resource.
     * @zh 通过 URL 获取 BaseTexture 资源。
     * @param url BaseTexture 资源的 URL。
     * @returns BaseTexture 资源。
     */
    static getBaseTexture<T extends BaseTexture>(url: string): T {
        return Loader.getRes(url, Loader.TEXTURE2D);
    }

    /**
     * @en Get the atlas resource by URL.
     * @param url The URL of the atlas.
     * @returns Return the set of addresses.
     * @zh 获取指定资源地址的图集资源。
     * @param url 图集地址。
     * @returns 返回地址集合。
     */
    static getAtlas(url: string): AtlasResource {
        return Loader.getRes(url, Loader.ATLAS);
    }

    /**
     * @en Get a resource by URL and type.
     * @param url The URL of the resource.
     * @param type The type of the resource.
     * @returns The resource.
     * @zh 通过 URL 和类型获取资源。
     * @param url 资源的 URL。
     * @param type 资源的类型。
     * @returns 资源。
     */
    getRes(url: string, type?: string): any {
        return Loader.getRes(url, type);
    }

    /**
     * @en Create nodes from a prefab resource.
     * @param url The URL of the prefab resource.
     * @returns The created node.
     * @zh 从预制资源创建节点。
     * @param url 预制资源的 URL。
     * @returns 创建的节点。
     */
    static createNodes<T extends Node>(url: string): T {
        return <T>(<Prefab>Loader.getRes(url))?.create();
    }

    /**
     * @en Cache a resource.
     * @param url The URL of the resource.
     * @param data The content to be cached.
     * @param type The type of the resource.
     * @zh 缓存资源。
     * @param url 资源地址。
     * @param data 要缓存的内容。
     * @param type 资源类型。
     */
    static cacheRes(url: string, data: any, type?: string): void {
        url = URL.formatURL(url);
        let urlInfo = Loader.getURLInfo(url, type);
        if (urlInfo.typeId != null)
            Loader._cacheRes(url, data, urlInfo.typeId, urlInfo.main);
    }

    /** @internal */
    static _cacheRes(url: string, data: any, typeId: number, main: boolean) {
        let entry: Array<any> = Loader.loadedMap[url];
        if (main) {
            if (entry) {
                entry[0] = typeId;
                entry[1] = data;
            }
            else
                entry = Loader.loadedMap[url] = [typeId, data];
        }
        else {
            if (entry) {
                let i = entry.findIndex(e => e === typeId);
                if (i != -1)
                    entry[i + 1] = data;
                else
                    entry.push(typeId, data);
            }
            else
                entry = Loader.loadedMap[url] = [null, undefined, typeId, data];
        }
    }

    /**
     * @en Cache a resource.
     * @param url The URL of the resource.
     * @param data The content to be cached.
     * @param type The type of the resource.
     * @zh 缓存资源。
     * @param url 资源地址。
     * @param data 要缓存的内容。
     * @param type 资源类型。
     */
    cacheRes(url: string, data: any, type?: string): void {
        Loader.cacheRes(url, data, type);
    }

    /**
     * @en Clear the cached resource at the specified URL.
     * @param url The URL of the resource.
     * @param checkObj If provided, only clear the resource if it matches this object.
     * @zh 清理指定资源地址的缓存。
     * @param url 资源地址。
     * @param checkObj 如果提供，只有缓存中的对象匹配这个才清除，否则不清除。
     */
    static clearRes(url: string, checkObj?: any): void {
        url = URL.formatURL(url);
        Loader._clearRes(url, checkObj);
    }

    /**
     * @en Clear the cached resource at the specified URL.
     * @param url The URL of the resource.
     * @param checkObj If provided, only clear the resource if it matches this object.
     * @zh 清理指定资源地址的缓存。
     * @param url 资源地址。
     * @param checkObj 如果提供，只有缓存中的对象匹配这个才清除，否则不清除。
     */
    clearRes(url: string, checkObj?: any): void {
        url = URL.formatURL(url);
        Loader._clearRes(url, checkObj);
    }

    /**
     * @internal
     */
    static _clearRes(url: string, checkObj?: any) {
        let entry = Loader.loadedMap[url];
        if (!entry)
            return;

        if (checkObj) {
            if (entry[1] == checkObj) {
                if (entry.length == 2)
                    delete Loader.loadedMap[url];
                else
                    entry[1] = undefined;
            }
            else {
                let i = entry.indexOf(checkObj);
                if (i == -1)
                    return;

                if (entry.length == 4 && entry[0] == null)
                    delete Loader.loadedMap[url];
                else
                    entry.splice(i - 1, 2);
            }

            if ((checkObj instanceof Resource) && !checkObj.destroyed) {
                checkObj.destroy();
            }
        }
        else {
            delete Loader.loadedMap[url];

            if (entry.length > 2) {
                for (let i = 1; i < entry.length; i += 2) {
                    let obj = entry[i];
                    if ((obj instanceof Resource) && !obj.destroyed) {
                        obj.destroy();
                    }
                }
            }
            else {
                let obj = entry[1];
                if ((obj instanceof Resource) && !obj.destroyed) {
                    obj.destroy();
                }
            }
        }
    }

    /**
     * @en Destroy the image resource used by a Texture, keeping the texture shell. If the texture's image resource is found to be missing during the next render, it will be automatically restored. Compared to clearRes, clearTextureRes only clears the image resource used in the texture without destroying the texture itself. The image resource will be automatically restored when used again. While clearRes completely destroys the texture, making it unusable, clearTextureRes ensures immediate destruction of the image resource without worrying about incorrect destruction.
     * @param url The URL of the atlas or texture, e.g., "res/atlas/comp.atlas" or "hall/bg.jpg".
     * @zh 销毁 Texture 使用的图片资源，保留 texture 壳。如果下次渲染时发现 texture 使用的图片资源不存在，则会自动恢复。相比 clearRes，clearTextureRes 只是清理 texture 里面使用的图片资源，并不销毁 texture，再次使用到的时候会自动恢复图片资源。而 clearRes 会彻底销毁 texture，导致不能再使用；clearTextureRes 能确保立即销毁图片资源，并且不用担心销毁错误。
     * @param url 图集地址或者 texture 地址，比如 "res/atlas/comp.atlas" 或 "hall/bg.jpg"。
     */
    clearTextureRes(url: string): void {
        url = URL.formatURL(url);
        let entry = Loader.loadedMap[url];
        if (!entry)
            return;
        let res = entry[1];
        if (res instanceof Texture) {
            res.disposeBitmap();
        }
        else if (res instanceof AtlasResource) {
            for (let tex of res.textures)
                tex.disposeBitmap();
        }
    }

    /**
     * @en Set the resource group.
     * @param url The URL of the resource.
     * @param group The name of the group.
     * @zh 设置资源分组。
     * @param url 资源地址。
     * @param group 分组名。
     */
    static setGroup(url: string, group: string): void {
        url = URL.formatURL(url);
        let set = Loader.groupMap[group];
        if (!set)
            set = Loader.groupMap[group] = new Set();
        set.add(url);
    }

    /**
     * @en Clean up resources based on grouping.
     * @param group The name of the group.
     * @zh 根据分组清理资源。
     * @param group 分组名
     */
    static clearResByGroup(group: string): void {
        let set = Loader.groupMap[group];
        if (set) {
            for (let k of set)
                Loader._clearRes(k);
        }
    }

    /**
     * @en Clears all unfinished loading tasks. All unloaded content will stop loading.
     * @zh 清理当前未完成的加载，所有未加载的内容全部停止加载。
     */
    clearUnLoaded(): void {
        if (this._queue.length == 0)
            return;

        let arr = this._queue.concat();
        this._queue.length = 0;
        for (let item of arr)
            item.onComplete(null);
    }

    /**
     * @en Clears unloaded content based on a collection of URLs.
     * @param urls An array of resource URLs.
     * @zh 根据地址集合清理掉未加载的内容。
     * @param urls 资源地址集合。
     */
    cancelLoadByUrls(urls: any[]): void {
        if (!urls) return;
        for (var i: number = 0, n: number = urls.length; i < n; i++) {
            this.cancelLoadByUrl(urls[i]);
        }
    }

    /**
     * @en Clears unloaded content based on a specific URL.
     * @param url The resource URL.
     * @zh 根据地址清理掉未加载的内容。
     * @param url 资源地址。
     */
    cancelLoadByUrl(url: string): void {
        url = URL.formatURL(url);
        let i = this._queue.findIndex(item => item.url == url);
        if (i != -1) {
            let item = this._queue[i];
            this._queue.splice(i, 1);
            item.onComplete(null);
        }
    }

    /**
     * @en Loads a sub-package.
     * @param path The path of the sub-package in mini-game.
     * @param onProgress The callback for loading progress.
     * @returns A Promise that resolves when the package is loaded.
     * @zh 载入一个分包。
     * @param path 小游戏的分包路径。
     * @param onProgress 加载进度回调。
     * @returns 当包加载完成时解析的 Promise。
     */
    loadPackage(path: string, onProgress?: ProgressCallback): Promise<void>;
    /**
     * @en Loads a sub-package.
     * @param path The path of the sub-package.
     * @param remoteUrl If the package is a remote package, provide the remote resource server address, e.g., "http://cdn.com/"
     * @param onProgress The callback for loading progress.
     * @returns A Promise that resolves when the package is loaded.
     * @zh 载入一个分包。
     * @param path 分包路径。
     * @param remoteUrl 如果分包是一个远程包，那需要提供远程资源服务器的地址，例如"http://cdn.com/"
     * @param onProgress 加载进度回调。
     * @returns 当包加载完成时解析的 Promise。
     */
    loadPackage(path: string, remoteUrl?: string, onProgress?: ProgressCallback): Promise<void>;
    /**
     * @en Loads a sub-package. This method can handle both remote packages and local mini-game packages.
     * @param path The path of the sub-package.
     * @param arg2 Optional. Can be either a remote URL for the package or a progress callback function.
     * @param arg3 Optional. A progress callback function when arg2 is a remote URL.
     * @returns A Promise that resolves when the package is loaded.
     * @zh 载入一个分包。此方法可以处理远程包和本地小游戏分包。
     * @param path 分包路径。
     * @param arg2 可选。可以是包的远程 URL 或进度回调函数。
     * @param arg3 可选。当 arg2 是远程 URL 时的进度回调函数。
     * @returns 当包加载完成时解析的 Promise。
     */
    loadPackage(path: string, arg2?: string | ProgressCallback, arg3?: ProgressCallback): Promise<void> {
        let progress: ProgressCallback;
        let remoteUrl: string;

        if (typeof (arg2) === "string") {
            remoteUrl = arg2;
            progress = arg3;
        } else {
            progress = arg3 || arg2;
        }

        if (remoteUrl) {
            if (!remoteUrl.endsWith("/"))
                remoteUrl += "/";
            URL.basePaths[path.length > 0 ? (path + "/") : path] = remoteUrl;
            return this._loadSubFileConfig(path, null, progress);
        } else {
            if (LayaEnv.isPreview)
                return Promise.resolve();

            let mini = ILaya.Browser.miniGameContext;

            if (mini == null) {
                return this._loadSubFileConfig(path, null, progress);
            }
            else {
                return this._loadMiniPackage(mini, path, progress).then(() =>
                    this._loadSubFileConfig(path, mini, progress)
                );
            }
        }
    }

    private _loadMiniPackage(mini: any, packName: string, progress?: ProgressCallback): Promise<any> {
        if (mini.subPkgNameSeperator)
            packName = packName.replace(/\//g, mini.subPkgNameSeperator);
        if (!(packName.length > 0)) return Promise.resolve();
        return new Promise((resolve: (value: any) => void, reject: (reason?: any) => void) => {
            let loadTask: any = mini.loadSubpackage({
                name: packName,
                success: (res: any) => {
                    resolve(res);
                },
                fail: (res: any) => {
                    reject(res);
                }
            });

            loadTask.onProgressUpdate && loadTask.onProgressUpdate((res: any) => {
                progress && progress(res);
            });
        })
    }

    private _loadSubFileConfig(path: string, mini: any, onProgress: ProgressCallback): Promise<any> {
        if (mini && mini.subPkgPathSeperator)
            path = path.replace(/\//g, mini.subPkgPathSeperator);
        if (path.length > 0)
            path += "/";

        return this.fetch(path + "fileconfig.json", "json", onProgress).then(fileConfig => {
            let files: Array<string> = [];
            let col = fileConfig.files;
            for (let k in col) {
                if (k.length > 0) {
                    for (let file of col[k])
                        files.push(k + "/" + file);
                }
                else {
                    for (let file of col[k])
                        files.push(file);
                }
            }

            if (fileConfig.hash) {
                let i = 0;
                let version = URL.version;
                for (let k of fileConfig.hash) {
                    if (k != null)
                        version[files[i]] = k;
                    i++;
                }
            }

            let configs: Array<any> = fileConfig.config;
            let len = configs.length;
            let i = 0, j = 0, m = 0, k = 0, n = 0;
            let indice: Array<number>;
            let c: any;
            let metaMap = AssetDb.inst.metaMap;
            while (true) {
                if (indice == null) {
                    if (i >= len)
                        break;
                    c = configs[i];
                    indice = c.i;
                    if (Array.isArray(indice))
                        n = indice.length;
                    else {
                        m = indice;
                        n = 0;
                        k = 1;
                    }
                    j = 0;
                }
                if (k == 0) {
                    if (j >= n) {
                        i++;
                        indice = null;
                        continue;
                    }
                    k = indice[j++];
                    if (k > 0) {
                        m = k;
                        k = 0;
                    }
                    else
                        k = -k;
                }
                else
                    k--;

                let file = files[m + k];
                switch (c.t) {
                    case 0: //图片
                        metaMap[file] = c;
                        break;
                    case 1: //自动图集
                        AtlasInfoManager.addAtlas(file, c.prefix, c.frames);
                        break;
                    case 2: //Shader
                        AssetDb.inst.shaderNameMap[c.shaderName] = file;
                        break;
                    case 3: //render texture
                        Loader.preLoadedMap[URL.formatURL(file)] = c;
                        break;
                }
            }

            if (!mini && fileConfig.entry)
                return ILaya.Browser.loadLib(URL.formatURL(path + fileConfig.entry));
            else
                return Promise.resolve();
        });
    }
}

class LoadTask implements ILoadTask {
    /**
     * @en The type of the resource.
     * @zh 资源的类型。
     */
    type: string;
    /**
     * @en The URL of the resource.
     * @zh 资源的 URL。
     */
    url: string;
    /**
     * @en The UUID of the resource.
     * @zh 资源的 UUID。
     */
    uuid: string;
    /**
     * @en The file extension of the resource.
     * @zh 资源的文件扩展名。
     */
    ext: string;
    /**
     * @en The options for loading the resource.
     * @zh 加载资源的选项。
     */
    options: ILoadOptions;
    /**
     * @en The loader used for this task.
     * @zh 用于此任务的加载器。
     */
    loader: Loader;
    /**
     * @en The progress tracker for batch operations.
     * @zh 批量操作的进度跟踪器。
     */
    progress: BatchProgress;
    /**
     * @en The obsolete instance of the resource, if any.
     * @zh 资源的过时实例（如果有）。
     */
    obsoluteInst: Resource;
    result: any;
    onProgress: Delegate;
    /**
     * @en The delegate for completion callback.
     * @zh 完成回调的委托。
     */
    onComplete: Delegate;

    /** @ignore */
    constructor() {
        this.options = {};
        this.onProgress = new Delegate();
        this.onComplete = new Delegate();
        this.progress = new BatchProgress((progress: number) => this.onProgress.invoke(progress));
    }

    /**
     * @en Resets the LoadTask to its initial state.
     * @zh 将 LoadTask 重置为初始状态。
     */
    public reset() {
        for (let k in this.options)
            delete this.options[k];
        this.onProgress.clear();
        this.onComplete.clear();
        this.progress.reset();
        this.obsoluteInst = null;
        this.result = null;
    }
}

const loadTaskPool: Array<LoadTask> = [];
const dummyOptions: ILoadOptions = {};

interface DownloadItem {
    url: string;
    originalUrl: string;
    contentType: string;
    priority: number;
    useWorkerLoader?: boolean;
    workerLoaderOptions?: Record<string, any>;
    blob?: ArrayBuffer;
    retryCnt?: number;
    silent?: boolean;
    startTime?: number;
    onComplete: (content: any) => void;
    onProgress: ProgressCallback;
}