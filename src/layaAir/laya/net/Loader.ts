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
import { HierarchyResource } from "../resource/HierarchyResource";
import { Node } from "../display/Node";
import { Resource } from "../resource/Resource";
import { Downloader } from "./Downloader";
import { AssetDb } from "../resource/AssetDb";
import { BaseTexture } from "../resource/BaseTexture";

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
}

export interface ILoadOptions {
    type?: string;
    priority?: number;
    group?: string;
    cache?: boolean;
    noRetry?: boolean;
    silent?: boolean;
    useWorkerLoader?: boolean;
    constructParams?: TextureConstructParams;
    propertyParams?: TexturePropertyParams;
    blob?: ArrayBuffer;
    hasMeta?: boolean;
    [key: string]: any;
}

export interface ILoadURL extends ILoadOptions {
    url: string;
}

interface ContentTypeMap {
    "text": string,
    "json": any,
    "xml": XMLDocument,
    "arraybuffer": ArrayBuffer,
    "image": HTMLImageElement | ImageBitmap,
    "sound": HTMLAudioElement
}

var typeIdCounter = 0;
type TypeMapEntry = { typeId: number, loaderType: new () => IResourceLoader };

interface URLInfo {
    ext: string,
    typeId: number,
    main: boolean,
    loaderType: new () => IResourceLoader,
}
const NullURLInfo: Readonly<URLInfo> = { ext: null, typeId: null, main: false, loaderType: null };

/**
 * <code>Loader</code> 类可用来加载文本、JSON、XML、二进制、图像等资源。
 */
export class Loader extends EventDispatcher {
    /**文本类型，加载完成后返回string。*/
    static TEXT = "text";
    /**JSON 类型，加载完成后返回json数据。*/
    static JSON = "json";
    /**XML 类型，加载完成后返回domXML。*/
    static XML = "xml";
    /**二进制类型，加载完成后返回arraybuffer。*/
    static BUFFER = "arraybuffer";
    /**纹理类型，加载完成后返回Texture。*/
    static IMAGE = "image";
    /**声音类型，加载完成后返回Sound。*/
    static SOUND = "sound";
    /**视频类型，加载完成后返回VideoTexture。*/
    static VIDEO = "video";
    /**图集类型，加载完成后返回图集json信息(并创建图集内小图Texture)。*/
    static ATLAS = "atlas";
    /**位图字体类型，加载完成后返回BitmapFont，加载后，会根据文件名自动注册为位图字体。*/
    static FONT = "font";
    /** TTF字体类型，加载完成后返回一个对象。*/
    static TTF = "ttf";
    /**Hierarchy资源。*/
    static HIERARCHY = "HIERARCHY";
    /**Mesh资源。*/
    static MESH = "MESH";
    /**Material资源。*/
    static MATERIAL = "MATERIAL";
    /**Texture2D资源。*/
    static TEXTURE2D = "TEXTURE2D"; //这里是为了兼容，实际应该是BaseTexture
    /**TextureCube资源。*/
    static TEXTURECUBE = "TEXTURE2D"; //兼容处理，现在TEXTURE2D类型可以载入Texture或者TextureCube
    /**AnimationClip资源。*/
    static ANIMATIONCLIP = "ANIMATIONCLIP";
    /**Terrain资源。*/
    static TERRAINHEIGHTDATA = "TERRAINHEIGHTDATA";
    /**Terrain资源。*/
    static TERRAINRES = "TERRAIN";
    /** Spine 资源 */
    static SPINE = "SPINE";

    /** 加载出错后的重试次数，默认重试一次*/
    retryNum: number = 1;
    /** 延迟时间多久再进行错误重试，默认立即重试*/
    retryDelay: number = 0;
    /** 最大下载线程，默认为5个*/
    maxLoader: number = 5;

    static readonly extMap: { [ext: string]: Array<TypeMapEntry> } = {};
    static readonly typeMap: { [type: string]: TypeMapEntry } = {};

    static downloader = new Downloader();

    /**
     * 注册一种资源装载器。
     * @param exts 扩展名
     * @param cls
     * @param type 类型标识。如果这种资源需要支持识别没有扩展名的情况，或者一个扩展名对应了多种资源类型的情况，那么指定type参数是个最优实践。
     */
    static registerLoader(exts: string[], cls: new () => IResourceLoader, type?: string) {
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

    /**资源分组对应表。*/
    static groupMap: { [name: string]: Set<string> } = {};
    /**已加载的资源池。*/
    static loadedMap: { [url: string]: Array<any> } = {};
    /** 预加载的数据文件。如果一个url在这里有记录，则请求时直接使用这里的数据，放弃网络加载。*/
    static preLoadedMap: { [url: string]: any } = {};

    /**@private */
    private _loadings: Map<string, LoadTask>;
    /**@private */
    private _queue: Array<DownloadItem>;
    /**@private */
    private _downloadings: Set<DownloadItem>;

    /**
     * <p>创建一个新的 <code>Loader</code> 实例。</p>
     * <p><b>注意：</b>请使用Laya.loader加载资源，这是一个单例，不要手动实例化此类，否则会导致不可预料的问题。</p>
     */
    constructor() {
        super();

        this._loadings = new Map();
        this._queue = [];
        this._downloadings = new Set();
    }

    /**
     * 是否有任何的加载任务在进行
     */
    public get loading(): boolean {
        return this._loadings.size > 0;
    }

    /**
     * <p>加载资源。</p>
     * @param url 要加载的单个资源地址或资源地址数组。
     * @return 加载成功返回资源对象，加载失败返回null。
     */
    load(url: string | ILoadURL | (string | Readonly<ILoadURL>)[], type?: string, onProgress?: ProgressCallback): Promise<any>;
    load(url: string | ILoadURL | (string | Readonly<ILoadURL>)[], options?: Readonly<ILoadOptions>, onProgress?: ProgressCallback): Promise<any>;
    /**
     * <p>这是兼容2.0引擎的加载接口</p>
     * <p>加载资源。</p>
     * @param url		要加载的单个资源地址或资源信息数组。比如：简单数组：["a.png","b.png"]；复杂数组[{url:"a.png",type:Loader.IMAGE,size:100,priority:1},{url:"b.json",type:Loader.JSON,size:50,priority:1}]。
     * @param complete	加载结束回调。根据url类型不同分为2种情况：1. url为String类型，也就是单个资源地址，如果加载成功，则回调参数值为加载完成的资源，否则为null；2. url为数组类型，指定了一组要加载的资源，如果全部加载成功，则回调参数值为true，否则为false。
     * @param progress	加载进度回调。回调参数值为当前资源的加载进度信息(0-1)。
     * @param type		资源类型。比如：Loader.IMAGE。
     * @param priority	(default = 0)加载的优先级，数字越大优先级越高，优先级高的优先加载。
     * @param cache		是否缓存。
     * @param group		分组，方便对资源进行管理。
     * @param ignoreCache	参数已废弃。
     * @param useWorkerLoader(default = false)是否使用worker加载（只针对IMAGE类型和ATLAS类型，并且浏览器支持的情况下生效）
     * @return Promise对象
     */
    load(url: string | ILoadURL | (string | Readonly<ILoadURL>)[], complete?: Handler, progress?: Handler, type?: string, priority?: number, cache?: boolean, group?: string, ignoreCache?: boolean, useWorkerLoader?: boolean): Promise<any>;
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

        if (priority != null || cache != null || group != null || useWorkerLoader != null) {
            if (options === dummyOptions)
                options = { priority, cache, group, useWorkerLoader };
            else
                options = Object.assign(options, { priority, cache, group, useWorkerLoader });
        }

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

    private _load1(url: string, type: string, options: ILoadOptions, onProgress: ProgressCallback): Promise<any> {
        let uuid: string = null;
        if (url.startsWith("res://")) {
            uuid = url.substring(6);
            url = AssetDb.inst.UUID_to_URL(uuid);
            if (!url) {
                let promise = AssetDb.inst.UUID_to_URL_async(uuid);
                if (!promise)
                    return Promise.resolve(null);

                return promise.then(url => {
                    if (url)
                        return this._load2(url, uuid, type, options, onProgress);
                    else
                        return null;
                });
            }
        }
        else {
            let promise = AssetDb.inst.URL_to_UUID_async(url);
            if (promise) {
                return promise.then(uuid => {
                    return this._load2(url, uuid, type, options, onProgress);
                });
            }
        }

        return this._load2(url, uuid, type, options, onProgress);
    }

    private _load2(url: string, uuid: string, type: string, options: ILoadOptions, onProgress: ProgressCallback): Promise<any> {
        let { ext, typeId, main, loaderType } = Loader.getURLInfo(url, type);
        if (!loaderType) {
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
        if (options.cache == null || options.cache) {
            let cacheRes = Loader.getRes(formattedUrl, type);
            if (cacheRes) {
                if (!(cacheRes instanceof Resource))
                    return Promise.resolve(cacheRes);

                if (cacheRes.obsolute)
                    obsoluteRes = cacheRes;

                if (!obsoluteRes && (!cacheRes.uuid || !uuid || uuid == cacheRes.uuid))
                    return Promise.resolve(cacheRes);
            }
        }

        let loadingKey = formattedUrl;
        if (!main)
            loadingKey += "@" + typeId;
        let task = this._loadings.get(loadingKey);
        if (task) {
            if (onProgress)
                task.onProgress.add(onProgress);
            return new Promise((resolve) => task.onComplete.add(resolve));
        }

        let atlasUrl = AtlasInfoManager.getFileLoadPath(url);
        if (atlasUrl) {
            return this.load(atlasUrl, Loader.ATLAS).then(() => {
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
            promise = assetLoader.load(task);
        }
        catch (err: any) {
            console.log(err);

            promise = Promise.resolve(null);
        }

        return promise.then(content => {
            if (content instanceof Resource) {
                content._setCreateURL(url, uuid);
            }

            if (task.options.cache == null || task.options.cache)
                Loader._cacheRes(formattedUrl, content, typeId, main);

            //console.log("[Loader]Loaded " + url);
            task.onComplete.invoke(content);
            return content;
        }).catch(error => {
            console.warn(`[Loader]Failed to load ${url}: ${error}`);
            task.onComplete.invoke(null);
            return null;
        }).finally(() => {
            this._loadings.delete(loadingKey);
            task.reset();
            loadTaskPool.push(task);
            if (this._loadings.size == 0)
                this.event(Event.COMPLETE);
        });
    }

    /**
     * 从指定URL下载。这是较为底层的下载资源的方法，它和load方法不同，不对返回的数据进行解析，也不会缓存下载的内容。
     * 成功则返回下载的数据，失败返回null。
     */
    fetch<K extends keyof ContentTypeMap>(url: string, contentType: K, onProgress?: (progress: number) => void, options?: Readonly<ILoadOptions>): Promise<ContentTypeMap[K]> {
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
        if (options.useWorkerLoader)
            task.useWorkerLoader = true;
        if (options.blob)
            task.blob = options.blob;
        if (options.noRetry)
            task.retryCnt = -1;
        if (options.silent)
            task.silent = true;

        if (url.startsWith("res://")) {
            let uuid = url.substring(6);
            url = AssetDb.inst.UUID_to_URL(uuid);
            if (!url) {
                let promise = AssetDb.inst.UUID_to_URL_async(uuid);
                if (!promise)
                    return Promise.resolve(null);

                return promise.then(url => {
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
        }

        return new Promise((resolve) => {
            task.url = URL.formatURL(url);
            task.onComplete = resolve;
            this.queueToDownload(task);
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
        if (content) {
            if (this._downloadings.size < this.maxLoader && this._queue.length > 0)
                this.download(this._queue.shift());

            item.onComplete(content);
        }
        else if (item.retryCnt != -1 && item.retryCnt < this.retryNum) {
            item.retryCnt++;
            if (!item.silent)
                console.debug(`[Loader]Retry to load: ${item.url} (${item.retryCnt})`);
            ILaya.systemTimer.once(this.retryDelay, this, this.queueToDownload, [item], false);
        }
        else {
            if (!item.silent)
                console.warn(`[Loader]Failed to load: ${item.url}`);

            if (this._downloadings.size < this.maxLoader && this._queue.length > 0)
                this.download(this._queue.shift());

            item.onComplete(null);
        }
    }

    private static getURLInfo(url: string, type?: string): URLInfo {
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
            if (!typeEntry) {
                console.warn(`not recognize type: '${type}'`);
                return NullURLInfo;
            }
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
                main = false;
                loaderType = typeEntry.loaderType;
            }
        }
        else {
            if (!extEntry) {
                console.warn(`not recognize the resource suffix: '${url}'`);
                return NullURLInfo;
            }

            //没有自定类型，则认为是主资源
            main = true;
            typeId = extEntry[0].typeId;
            loaderType = extEntry[0].loaderType;
        }

        return { ext, main, typeId, loaderType };
    }

    /**
     * 获取指定资源地址的资源。
     * @param url 资源地址。
     * @return 返回资源。
     */
    static getRes(url: string, type?: string): any {
        url = URL.formatURL(url);
        let resArr = Loader.loadedMap[url];
        if (!resArr)
            return null;

        let ret: any;
        if (type) {
            let typeEntry = <TypeMapEntry>Loader.typeMap[type];
            if (!typeEntry)
                return null;

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
            return null;
        else
            return ret;
    }

    /**
     * 
     */
    static getTexture2D(url: string): Texture2D {
        return Loader.getRes(url, Loader.TEXTURE2D);
    }

    /**
     * 
     */
    static getBaseTexture<T extends BaseTexture>(url: string): T {
        return Loader.getRes(url, Loader.TEXTURE2D);
    }

    /**
     * 获取指定资源地址的图集地址列表。
     * @param url 图集地址。
     * @return 返回地址集合。
     */
    static getAtlas(url: string): AtlasResource {
        return Loader.getRes(url, Loader.ATLAS);
    }

    getRes(url: string, type?: string): any {
        return Loader.getRes(url, type);
    }

    static createNodes<T extends Node>(url: string): T {
        return <T>(<HierarchyResource>Loader.getRes(url))?.createNodes();
    }

    /**
     * 缓存资源。
     * @param url 资源地址。
     * @param data 要缓存的内容。
     */
    static cacheRes(url: string, data: any, type?: string): void {
        url = URL.formatURL(url);
        let urlInfo = Loader.getURLInfo(url, type);
        if (urlInfo.typeId != null)
            Loader._cacheRes(url, data, urlInfo.typeId, urlInfo.main);
    }

    /**
     * @private
     */
    private static _cacheRes(url: string, data: any, typeId: number, main: boolean) {
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
                entry = Loader.loadedMap[url] = [null, null, typeId, data];
        }
    }

    cacheRes(url: string, data: any, type?: string): void {
        Loader.cacheRes(url, data, type);
    }

    /**
     * 清理指定资源地址缓存。
     * @param url 资源地址。
     * @param checkObj 如果缓存中的对象是这个，才清除，否则不清除
     */
    static clearRes(url: string, checkObj?: any): void {
        url = URL.formatURL(url);
        Loader._clearRes(url, checkObj);
    }

    /**
     * 清理指定资源地址缓存。
     * @param url 资源地址。
     * @param checkObj 如果缓存中的对象是这个，才清除，否则不清除
     */
    clearRes(url: string, checkObj?: any): void {
        url = URL.formatURL(url);
        Loader._clearRes(url, checkObj);
    }

    /**
     * @private
     */
    private static _clearRes(url: string, checkObj?: any) {
        let entry = Loader.loadedMap[url];
        if (!entry)
            return;

        if (checkObj) {
            if (entry[1] == checkObj) {
                if (entry.length == 2)
                    delete Loader.loadedMap[url];
                else
                    entry[1] = null;
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
     * 销毁Texture使用的图片资源，保留texture壳，如果下次渲染的时候，发现texture使用的图片资源不存在，则会自动恢复
     * 相比clearRes，clearTextureRes只是清理texture里面使用的图片资源，并不销毁texture，再次使用到的时候会自动恢复图片资源
     * 而clearRes会彻底销毁texture，导致不能再使用；clearTextureRes能确保立即销毁图片资源，并且不用担心销毁错误
     * @param url 图集地址或者texture地址，比如 "res/atlas/comp.atlas"或"hall/bg.jpg"
     */
    clearTextureRes(url: string): void {
        url = URL.formatURL(url);
        let entry = Loader.loadedMap[url];
        if (!entry)
            return;
        let res = entry[0];
        if (res instanceof Texture) {
            res.disposeBitmap();
        }
        else if (res instanceof AtlasResource) {
            for (let tex of res.textures)
                tex.disposeBitmap();
        }
    }

    /**
     * 设置资源分组。
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
     * 根据分组清理资源。
     * @param group 分组名
     */
    static clearResByGroup(group: string): void {
        let set = Loader.groupMap[group];
        if (set) {
            for (let k of set)
                Loader._clearRes(k);
        }
    }

    /** 清理当前未完成的加载，所有未加载的内容全部停止加载。*/
    clearUnLoaded(): void {
        if (this._queue.length == 0)
            return;

        let arr = this._queue.concat();
        this._queue.length = 0;
        for (let item of arr)
            item.onComplete(null);
    }

    /**
     * 根据地址集合清理掉未加载的内容
     * @param urls 资源地址集合
     */
    cancelLoadByUrls(urls: any[]): void {
        if (!urls) return;
        for (var i: number = 0, n: number = urls.length; i < n; i++) {
            this.cancelLoadByUrl(urls[i]);
        }
    }

    /**
     * 根据地址清理掉未加载的内容
     * @param url 资源地址
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
}

class LoadTask implements ILoadTask {
    type: string;
    url: string;
    uuid: string;
    ext: string;
    options: ILoadOptions;
    loader: Loader;
    progress: BatchProgress;
    obsoluteInst: Resource;

    onProgress: Delegate;
    onComplete: Delegate;

    constructor() {
        this.options = {};
        this.onProgress = new Delegate();
        this.onComplete = new Delegate();
        this.progress = new BatchProgress((progress: number) => this.onProgress.invoke(progress));
    }

    public reset() {
        for (let k in this.options)
            delete this.options[k];
        this.onProgress.clear();
        this.onComplete.clear();
        this.progress.reset();
        this.obsoluteInst = null;
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
    blob?: ArrayBuffer;
    retryCnt?: number;
    silent?: boolean;
    onComplete: (content: any) => void;
    onProgress: (progress: number) => void;
}