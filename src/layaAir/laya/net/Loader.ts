import { ILaya } from "../../ILaya";
import { Event } from "../events/Event";
import { URL } from "../net/URL";
import { Texture } from "../resource/Texture";
import { Browser } from "../utils/Browser";
import { Delegate } from "../utils/Delegate";
import { AtlasInfoManager } from "./AtlasInfoManager";
import { WorkerLoader } from "./WorkerLoader";
import { Utils } from "../utils/Utils";
import { HttpRequest } from "./HttpRequest";
import { AtlasResource } from "../resource/AtlasResource";
import { Texture2D, TextureConstructParams, TexturePropertyParams } from "../resource/Texture2D";
import { IBatchProgress, ProgressCallback, BatchProgress } from "./BatchProgress";
import { Handler } from "../utils/Handler";
import { EventDispatcher } from "../events/EventDispatcher";
import { HierarchyResource } from "../resource/HierarchyResource";
import { Node } from "../display/Node";
import { ImgUtils } from "../utils/ImgUtils";
import { Resource } from "../resource/Resource";

export interface ILoadTask {
    readonly type: string;
    readonly url: string;
    readonly loader: Loader;
    readonly options: Readonly<ILoadOptions>;
    readonly progress: IBatchProgress;
}

export interface IResourceLoader {
    load(task: ILoadTask): Promise<any>;
}

export interface ILoadOptions {
    type?: string;
    priority?: number;
    isID?: boolean;
    group?: string;
    cache?: boolean;
    useWorkerLoader?: boolean;
    constructParams?: TextureConstructParams;
    propertyParams?: TexturePropertyParams;
    blob?: ArrayBuffer;
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
    /**prefab 类型，加载完成后返回Prefab实例。*/
    static PREFAB = "prefab";
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
    /** 预加载文件类型，加载完成后自动解析到preLoadedMap。*/
    static PLF = "plf";
    /** 二进制预加载文件类型，加载完成后自动解析到preLoadedMap。*/
    static PLFB = "plfb";
    /**Hierarchy资源。*/
    static HIERARCHY = "HIERARCHY";
    /**Mesh资源。*/
    static MESH = "MESH";
    /**Material资源。*/
    static MATERIAL = "MATERIAL";
    /**Texture2D资源。*/
    static TEXTURE2D = "TEXTURE2D";
    /**TextureCube资源。*/
    static TEXTURECUBE = "TEXTURECUBE";
    static TEXTURECUBEBIN: string = "TEXTURECUBEBIN";
    /**AnimationClip资源。*/
    static ANIMATIONCLIP = "ANIMATIONCLIP";
    /**SimpleAnimator资源。 */
    static SIMPLEANIMATORBIN: string = "SIMPLEANIMATOR";
    /**Terrain资源。*/
    static TERRAINHEIGHTDATA = "TERRAINHEIGHTDATA";
    /**Terrain资源。*/
    static TERRAINRES = "TERRAIN";
    /** glTF 资源 */
    static GLTF: string = "GLTF";

    /** 加载出错后的重试次数，默认重试一次*/
    retryNum: number = 1;
    /** 延迟时间多久再进行错误重试，默认立即重试*/
    retryDelay: number = 0;
    /** 最大下载线程，默认为5个*/
    maxLoader: number = 5;

    static readonly typeMap: { [key: string]: new () => IResourceLoader } = {};

    static registerLoader(types: string[], cls: new () => IResourceLoader) {
        for (let type of types)
            Loader.typeMap[type] = cls;
    }

    /**资源分组对应表。*/
    static groupMap: { [key: string]: Set<string> } = {};
    /**已加载的资源池。*/
    static loadedMap: { [key: string]: any } = {};

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
     * <p>加载资源。</p>
     * @param url 要加载的单个资源地址或资源地址数组。
     * @return 加载成功返回资源对象，加载失败返回null。
     */
    load(url: string | ILoadURL | (string | Readonly<ILoadURL>)[], type?: string, onProgress?: ProgressCallback): Promise<any>;
    load(url: string | ILoadURL | (string | Readonly<ILoadURL>)[], options?: Readonly<ILoadOptions>, onProgress?: ProgressCallback): Promise<any>;
    /**
     * <p>这是兼容2.0引擎的加载接口</p>
     * <p>加载资源。</p>
     * @param url			要加载的单个资源地址或资源信息数组。比如：简单数组：["a.png","b.png"]；复杂数组[{url:"a.png",type:Loader.IMAGE,size:100,priority:1},{url:"b.json",type:Loader.JSON,size:50,priority:1}]。
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

        let startFrame = ILaya.timer.currFrame;

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
                    promises.push(this._load1(url2.url, type,
                        options !== dummyOptions ? Object.assign({}, options, url2) : url2, pd?.createCallback()));
                }
            }

            promise = Promise.all(promises);
        }
        else if (typeof (url) === "string")
            promise = this._load1(url, type, options, onProgress);
        else
            promise = this._load1(url.url, type,
                options !== dummyOptions ? Object.assign({}, options, url) : url, onProgress);

        if (complete)
            return promise.then(result => {
                if (ILaya.timer.currFrame == startFrame)
                    ILaya.systemTimer.frameOnce(1, complete, complete.runWith, [result]);
                else
                    complete.runWith(result);
                return result;
            });
        else
            return promise;
    }

    /**
    * <p>这是兼容2.0引擎的加载接口，推荐使用load。</p>
    * <p>加载资源。</p>
    * @param url 资源地址或者数组。
    * @param complete 加载结束回调。根据url类型不同分为2种情况：1. url为String类型，也就是单个资源地址，如果加载成功，则回调参数值为加载完成的资源，否则为null；2. url为数组类型，指定了一组要加载的资源，回调参数是一个数组，包含加载完成的资源，其中如果失败的是null。
    * @param progress 资源加载进度回调，回调参数值为当前资源加载的进度信息(0-1)。
    * @param type 资源类型。
    * @param constructParams 资源构造函数参数。
    * @param propertyParams 资源属性参数。
    * @param priority (default = 0)加载的优先级，数字越大优先级越高，优先级高的优先加载。
    * @param cache 是否缓存资源。
    * @return Promise对象
    */
    create(url: string | (string | Readonly<ILoadURL>)[], complete: Handler | null = null, progress: Handler | null = null, type: string | null = null, constructParams: TextureConstructParams | null = null, propertyParams: TexturePropertyParams = null, priority: number = 0, cache: boolean = true): Promise<any> {
        let onProgress: ProgressCallback;
        if (progress)
            onProgress = (value: number) => progress.runWith(value);

        let options: ILoadOptions;
        if (type != null || priority != null || constructParams != null || propertyParams != null || cache != null)
            options = { type, priority, constructParams, propertyParams, cache };

        return this.load(url, options, onProgress).then(content => {
            if (Array.isArray(content)) {
                for (let i = 0; i < content.length; i++) {
                    if (content[i] instanceof HierarchyResource)
                        content[i] = content[i].createNodes();
                }

                if (complete)
                    complete.runWith([content]);
            }
            else {
                if (content instanceof HierarchyResource)
                    content = content.createNodes();

                if (complete)
                    complete.runWith(content);
            }

            return content;
        });
    }

    private _load1(url: string, type: string, options: ILoadOptions, onProgress: ProgressCallback): Promise<any> {
        let uuid: string;
        if (options.isID)
            uuid = url;
        else if (url.startsWith("res://"))
            uuid = url.substring(6);

        if (uuid != null) {
            url = URL.UUID_to_URL(uuid);
            if (!url) {
                console.error(`unknown uuid: ${uuid}`);
                return Promise.resolve(null);
            }

            return this._load2(url, uuid, type, options, onProgress);
        }
        else
            return this._load2(url, null, type, options, onProgress);
    }

    private _load2(url: string, uuid: string, type: string, options: ILoadOptions, onProgress: ProgressCallback): Promise<any> {
        if (options.type)
            type = options.type;
        if (!type) {
            if (url.indexOf("data:") === 0)
                type = Loader.IMAGE;
            else {
                type = Utils.getFileExtension(url);
                if (type && !Loader.typeMap[type])
                    type = Utils.getFileExtension(url, (type as any).length);
            }
        }

        let formattedUrl = URL.formatURL(url);

        if (options.group) {
            let set = Loader.groupMap[options.group];
            if (!set)
                set = Loader.groupMap[options.group] = new Set();
            set.add(formattedUrl);
        }

        let cacheRes = Loader.loadedMap[formattedUrl];
        if (cacheRes) {
            if (cacheRes instanceof Texture) {
                if (cacheRes.bitmap && !cacheRes.bitmap.destroyed)
                    return Promise.resolve(Loader.ensureTextureFormat(cacheRes, type));
            }
            else
                return Promise.resolve(cacheRes);
        }

        let task = this._loadings.get(formattedUrl);
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

        let cls = Loader.typeMap[type];
        if (!cls) {
            console.warn(`Not recognize the resource suffix: '${url}'`);
            return Promise.resolve(null);
        }

        if (loadTaskPool.length > 0)
            task = loadTaskPool.pop();
        else
            task = new LoadTask();
        task.type = type;
        task.url = url;
        options = Object.assign(task.options, options);
        delete options.type;
        if (options.priority == null)
            options.priority = 0;
        if (options.useWorkerLoader == null)
            options.useWorkerLoader = ILaya.WorkerLoader.enable;
        if (onProgress)
            task.onProgress.add(onProgress);
        task.loader = this;

        let assetLoader = new cls();
        this._loadings.set(formattedUrl, task);

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
                Loader.loadedMap[formattedUrl] = content;

            content = Loader.ensureTextureFormat(content, type);
            task.onComplete.invoke(content);

            this._loadings.delete(formattedUrl);
            task.reset();
            loadTaskPool.push(task);
            if (this._loadings.size == 0)
                this.event(Event.COMPLETE);

            //console.log("[Loader]Loaded " + url);

            return content;
        });
    }

    /**
     * 从指定URL下载。这是较为底层的下载资源的方法，它和load方法不同，不对返回的数据进行解析，也不会缓存下载的内容。
     * 成功则返回下载的数据，失败返回null。
     */
    fetch<K extends keyof ContentTypeMap>(url: string, contentType: K, onProgress?: (progress: number) => void, options?: Readonly<ILoadOptions>): Promise<ContentTypeMap[K]> {
        options = options || dummyOptions;
        return new Promise((resolve) => {
            let task: DownloadItem = {
                originalUrl: url,
                url: URL.formatURL(url),
                contentType: contentType,
                priority: options.priority ?? 1,
                retryCnt: 0,
                onProgress: onProgress,
                onComplete: resolve,
            }
            if (options.useWorkerLoader)
                task.useWorkerLoader = true;
            if (options.blob)
                task.blob = options.blob;
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
            if (item.blob) {
                url = ImgUtils.arrayBufferToURL(item.originalUrl, item.blob);
                item.retryCnt = -1; //失败无需重试
            }
            else if (item.useWorkerLoader) {
                WorkerLoader.enableWorkerLoader();
                if (WorkerLoader.enable) {
                    let workerLoader = WorkerLoader.I;
                    workerLoader.once(url, null, (imageData: any) => {
                        if (imageData != null)
                            this.completeItem(item, imageData);
                        else {
                            item.useWorkerLoader = false;
                            this.completeItem(item, null, "workerloader failed!");
                        }
                    });
                    workerLoader.worker.postMessage(url);
                    return;
                }
            }

            let image: HTMLImageElement = new Browser.window.Image();
            image.crossOrigin = "";
            image.onload = () => {
                image.onload = null;
                image.onerror = null;
                this.completeItem(item, image);
            };
            image.onerror = () => {
                image.onload = null;
                image.onerror = null;

                this.completeItem(item, null, "");
            };
            image.src = url;
            item.temp = image;
        }
        else if (item.contentType == "sound") {
            let audio = (<HTMLAudioElement>Browser.createElement("audio"));
            audio.crossOrigin = "";
            audio.src = url;
            audio.oncanplaythrough = () => {
                audio.oncanplaythrough = null;
                audio.onerror = null;
                this.completeItem(item, audio);
            };
            audio.onerror = () => {
                audio.oncanplaythrough = null;
                audio.onerror = null;

                this.completeItem(item, null, "");
            };
            item.temp = audio;
        }
        else {
            let http: HttpRequest = getRequestInst();
            http.on(Event.COMPLETE, () => {
                let data = http.data;
                returnRequestInst(http);

                this.completeItem(item, data);
            });
            http.on(Event.ERROR, null, (error: string) => {
                returnRequestInst(http);

                this.completeItem(item, null, error);
            });
            if (item.onProgress)
                http.on(Event.PROGRESS, item.onProgress);
            http.send(url, null, "get", <any>item.contentType);
            item.temp = http;
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
            console.debug(`[Loader]Retry to load: ${item.url} (${item.retryCnt})`);
            ILaya.systemTimer.once(this.retryDelay, this, this.queueToDownload, [item], false);
        }
        else {
            console.warn(`[Loader]Failed to load: ${item.url}`);

            if (this._downloadings.size < this.maxLoader && this._queue.length > 0)
                this.download(this._queue.shift());

            item.onComplete(null);
        }
    }

    /**
     * @private
     */
    private static ensureTextureFormat(content: any, type: string) {
        if ((content instanceof Texture) && type == Loader.TEXTURE2D)
            return (<Texture>content).bitmap;
        else
            return content;
    }

    /**
     * 获取指定资源地址的资源。
     * @param url 资源地址。
     * @return 返回资源。
     */
    static getRes(url: string, type?: string): any {
        url = URL.formatURL(url);
        return Loader.ensureTextureFormat(Loader.loadedMap[url], type);
    }

    static getTexture2D(url: string): Texture2D {
        url = URL.formatURL(url);
        return Loader.ensureTextureFormat(Loader.loadedMap[url], Loader.TEXTURE2D);
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
    static cacheRes(url: string, data: any, replace?: boolean): void {
        url = URL.formatURL(url);
        if (Loader.loadedMap[url]) {
            if (!replace)
                console.warn("Resources already exist,is repeated loading:", url);
        }

        Loader.loadedMap[url] = data;
    }

    cacheRes(url: string, data: any, replace?: boolean): void {
        Loader.cacheRes(url, data, replace);
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
        let res = Loader.loadedMap[url];
        if (res && (checkObj == null || res === checkObj)) {
            if (res instanceof Resource) {
                try {
                    res.destroy();
                }
                catch (err: any) {
                    console.error(err);
                }
            }

            delete Loader.loadedMap[url];
        }
    }

    /**
     * 兼容旧版本接口。建议直接使用getRes。
     * 获取指定资源地址的图集地址列表。
     * @param url 图集地址。
     * @return 返回地址集合。
     */
    static getAtlas(url: string): AtlasResource {
        return Loader.getRes(url);
    }

    /**
     * 销毁Texture使用的图片资源，保留texture壳，如果下次渲染的时候，发现texture使用的图片资源不存在，则会自动恢复
     * 相比clearRes，clearTextureRes只是清理texture里面使用的图片资源，并不销毁texture，再次使用到的时候会自动恢复图片资源
     * 而clearRes会彻底销毁texture，导致不能再使用；clearTextureRes能确保立即销毁图片资源，并且不用担心销毁错误，clearRes则采用引用计数方式销毁
     * @param url 图集地址或者texture地址，比如 Loader.clearTextureRes("res/atlas/comp.atlas"); Loader.clearTextureRes("hall/bg.jpg");
     */
    clearTextureRes(url: string): void {
        url = URL.formatURL(url);
        let res = Loader.loadedMap[url];
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
    options: ILoadOptions;
    loader: Loader;
    progress: BatchProgress;

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
    temp?: any;
    onComplete: (content: any) => void;
    onProgress: (progress: number) => void;
}

const httpRequestPool: Array<HttpRequest> = [];
function getRequestInst() {
    if (httpRequestPool.length == 0
        || Browser.onVVMiniGame || Browser.onHWMiniGame /*临时修复vivo复用xmlhttprequest的bug*/) {
        return new HttpRequest();
    } else {
        return httpRequestPool.pop();
    }
}

function returnRequestInst(inst: HttpRequest) {
    inst.reset();
    if (httpRequestPool.length < 10)
        httpRequestPool.push(inst);
}