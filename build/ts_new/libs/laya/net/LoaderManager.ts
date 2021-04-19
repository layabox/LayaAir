import { ILaya } from "../../ILaya";
import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { URL } from "../net/URL";
import { ICreateResource } from "../resource/ICreateResource";
import { Resource } from "../resource/Resource";
import { Texture } from "../resource/Texture";
import { Handler } from "../utils/Handler";
import { Utils } from "../utils/Utils";
import { AtlasInfoManager } from "./AtlasInfoManager";
import { Loader } from "./Loader";

/**
 * 所有资源加载完成时调度。
 * @eventType Event.COMPLETE
 * */
/*[Event(name = "complete", type = "laya.events.Event")]*/

/**
 * 任何资源加载出错时调度。
 * @eventType Event.ERROR
 * */
/*[Event(name = "error", type = "laya.events.Event")]*/

/**
 * <p> <code>LoaderManager</code> 类用于用于批量加载资源。此类是单例，不要手动实例化此类，请通过Laya.loader访问。</p>
 * <p>全部队列加载完成，会派发 Event.COMPLETE 事件；如果队列中任意一个加载失败，会派发 Event.ERROR 事件，事件回调参数值为加载出错的资源地址。</p>
 * <p> <code>LoaderManager</code> 类提供了以下几种功能：<br/>
 * 多线程：默认5个加载线程，可以通过maxLoader属性修改线程数量；<br/>
 * 多优先级：有0-4共5个优先级，优先级高的优先加载。0最高，4最低；<br/>
 * 重复过滤：自动过滤重复加载（不会有多个相同地址的资源同时加载）以及复用缓存资源，防止重复加载；<br/>
 * 错误重试：资源加载失败后，会重试加载（以最低优先级插入加载队列），retryNum设定加载失败后重试次数，retryDelay设定加载重试的时间间隔。</p>
 * @see laya.net.Loader
 */
export class LoaderManager extends EventDispatcher {
    /**@private */
    private static _resMap: {[key:string]:ResInfo} = {};
    /**@private */
    static createMap: any = { atlas: [null, Loader.ATLAS] };

    /** 加载出错后的重试次数，默认重试一次*/
    retryNum: number = 1;
    /** 延迟时间多久再进行错误重试，默认立即重试*/
    retryDelay: number = 0;
    /** 最大下载线程，默认为5个*/
    maxLoader: number = 5;

    /**@private */
    private _loaders: any[] = [];
    /**@private */
    private _loaderCount: number = 0;
    /**@private */
    private _resInfos: ResInfo[][] = [];

    /**@private */
    private _infoPool: any[] = [];
    /**@private */
    private _maxPriority: number = 5;
    /**@private */
    private _failRes: any = {};
    /**@private */
    private _statInfo: any = { count: 1, loaded: 1 };

    /**@private */
    getProgress(): number {
        return this._statInfo.loaded / this._statInfo.count;
    }

    /**@private */
    resetProgress(): void {
        this._statInfo.count = this._statInfo.loaded = 1;
    }

    /**
     * <p>创建一个新的 <code>LoaderManager</code> 实例。</p>
     * <p><b>注意：</b>请使用Laya.loader加载资源，这是一个单例，不要手动实例化此类，否则会导致不可预料的问题。</p>
     */
    constructor() {
        super();
        for (var i = 0; i < this._maxPriority; i++) this._resInfos[i] = [];
    }

    /**
     * <p>根据clas类型创建一个未初始化资源的对象，随后进行异步加载，资源加载完成后，初始化对象的资源，并通过此对象派发 Event.LOADED 事件，事件回调参数值为此对象本身。套嵌资源的子资源会保留资源路径"?"后的部分。</p>
     * <p>如果url为数组，返回true；否则返回指定的资源类对象，可以通过侦听此对象的 Event.LOADED 事件来判断资源是否已经加载完毕。</p>
     * <p><b>注意：</b>cache参数只能对文件后缀为atlas的资源进行缓存控制，其他资源会忽略缓存，强制重新加载。</p>
     * @param	url			资源地址或者数组。如果url和clas同时指定了资源类型，优先使用url指定的资源类型。参数形如：[{url:xx,clas:xx,priority:xx,params:xx},{url:xx,clas:xx,priority:xx,params:xx}]。
     * @param	complete	加载结束回调。根据url类型不同分为2种情况：1. url为String类型，也就是单个资源地址，如果加载成功，则回调参数值为加载完成的资源，否则为null；2. url为数组类型，指定了一组要加载的资源，如果全部加载成功，则回调参数值为true，否则为false。
     * @param	progress	资源加载进度回调，回调参数值为当前资源加载的进度信息(0-1)。
     * @param	type	资源类型。
     * @param	constructParams		资源构造函数参数。
     * @param	propertyParams		资源属性参数。
     * @param	priority	(default = 1)加载的优先级，优先级高的优先加载。有0-4共5个优先级，0最高，4最低。
     * @param	cache		是否缓存加载的资源。
     * @return	如果url为数组，返回true；否则返回指定的资源类对象。
     */
    create(url: string|(string|createItem)[], complete: Handler|null = null, progress: Handler|null = null, type: string|null = null, constructParams: any[]|null = null, propertyParams: any = null, priority: number = 1, cache: boolean = true): void {
        this._create(url, true, complete, progress, type, constructParams, propertyParams, priority, cache);
    }

    /**
     * @internal
     */
    _create(url: string|(string|createItem)[], mainResou: boolean, complete: Handler|null = null, progress: Handler|null = null, type: string|null = null, constructParams: any[]|null = null, propertyParams: any = null, priority: number = 1, cache: boolean = true): void {
        if (url instanceof Array) {
            var allScuess: boolean = true;
            var items: (string|createItem)[] = url;
            var itemCount: number = items.length;
            var loadedCount: number = 0;
            if (progress) {
                var progress2: Handler = Handler.create(progress.caller, progress?progress.method:null, progress.args, false);
            }

            for (var i: number = 0; i < itemCount; i++) {
                var item: string|createItem = items[i];
                if (typeof (item) == 'string')
                    item = items[i] = { url: item };
                item.progress = 0;
            }
            for (i = 0; i < itemCount; i++) {
                item = items[i] as createItem;
                var progressHandler = progress ? Handler.create(null, function (item: createItem, value: number): void {
                    item.progress = value;
                    var num: number = 0;
                    for (var j: number = 0; j < itemCount; j++) {
                        var item1: any = items[j];
                        num += item1.progress;
                    }
                    var v: number = num / itemCount;
                    progress2.runWith(v);
                }, [item], false) : null;
                var completeHandler = (progress || complete) ? Handler.create(null, function (item: createItem, content: any = null): void {
                    loadedCount++;
                    item.progress = 1;
                    content || (allScuess = false);//资源加载失败
                    if (loadedCount === itemCount && complete) {
                        complete.runWith(allScuess);
                    }
                }, [item]) : null;
                this._createOne(item.url, mainResou, completeHandler, progressHandler, item.type || type, item.constructParams || constructParams, item.propertyParams || propertyParams, item.priority || priority, cache);
            }
        } else {
            this._createOne(url, mainResou, complete, progress, type, constructParams, propertyParams, priority, cache);
        }
    }

    /**
     * @private
     */
    private _createOne(url: string, mainResou: boolean, complete: Handler|null = null, progress: Handler|null = null, type: string|null = null, constructParams: any[]|null = null, propertyParams: any = null, priority: number = 1, cache: boolean = true): void {
        var item: any = this.getRes(url);
        if (!item) {
            var extension: string =(LoaderManager.createMap[Utils.getFilecompatibleExtension(url)])?Utils.getFilecompatibleExtension(url):Utils.getFileExtension(url);
            
            (type) || (type = LoaderManager.createMap[extension] ? LoaderManager.createMap[extension][0] : null);

            if (!type) {
                this.load(url, complete, progress, type, priority, cache);
                return;
            }
            var parserMap: any = Loader.parserMap;
            if (!parserMap[type]) {//not custom parse type
                this.load(url, complete, progress, type, priority, cache);
                return;
            }
            this._createLoad(url, Handler.create(null, function (createRes: ICreateResource): void {//加载失败createRes为空
                if (createRes) {
                    if (!mainResou && createRes instanceof Resource)
                        ((<Resource>createRes))._addReference();
                    createRes._setCreateURL(url);
                }
                complete && complete.runWith(createRes);
                ILaya.loader.event(url);
            }), progress, type, constructParams, propertyParams, priority, cache, true);
        } else {
            if (!mainResou && item instanceof Resource)
                item._addReference();
            progress && progress.runWith(1);
            complete && complete.runWith(item);
        }
    }

    /**
     * <p>加载资源。资源加载错误时，本对象会派发 Event.ERROR 事件，事件回调参数值为加载出错的资源地址。</p>
     * <p>因为返回值为 LoaderManager 对象本身，所以可以使用如下语法：loaderManager.load(...).load(...);</p>
     * @param	url			要加载的单个资源地址或资源信息数组。比如：简单数组：["a.png","b.png"]；复杂数组[{url:"a.png",type:Loader.IMAGE,size:100,priority:1},{url:"b.json",type:Loader.JSON,size:50,priority:1}]。
     * @param	complete	加载结束回调。根据url类型不同分为2种情况：1. url为String类型，也就是单个资源地址，如果加载成功，则回调参数值为加载完成的资源，否则为null；2. url为数组类型，指定了一组要加载的资源，如果全部加载成功，则回调参数值为true，否则为false。
     * @param	progress	加载进度回调。回调参数值为当前资源的加载进度信息(0-1)。
     * @param	type		资源类型。比如：Loader.IMAGE。
     * @param	priority	(default = 1)加载的优先级，优先级高的优先加载。有0-4共5个优先级，0最高，4最低。
     * @param	cache		是否缓存加载结果。
     * @param	group		分组，方便对资源进行管理。
     * @param	ignoreCache	是否忽略缓存，强制重新加载。
     * @param	useWorkerLoader(default = false)是否使用worker加载（只针对IMAGE类型和ATLAS类型，并且浏览器支持的情况下生效）
     * @return 此 LoaderManager 对象本身。
     */
    load(url: string|(string|loadItem)[], complete: Handler|null = null, progress: Handler|null = null, type: string|null = null, priority: number = 1, cache: boolean = true, group: string|null = null, ignoreCache: boolean = false, useWorkerLoader: boolean = ILaya.WorkerLoader.enable): LoaderManager {
        if (url instanceof Array) {
            return this._loadAssets(url, complete, progress, type, priority, cache, group);
        }

        if (!type) {
            if (url.indexOf("data:image") === 0) type = Loader.IMAGE;
            else type = Loader.getTypeFromUrl(url);
        }
        
        var content: any;
        if (type === Loader.IMAGE){
            content = Loader.textureMap[URL.formatURL(url)];
            if (content && (content as Texture).bitmap && (content as Texture).bitmap.destroyed) {
                content = null;
            }
        }
        else
            content = Loader.loadedMap[URL.formatURL(url)];

        if (!ignoreCache && content != null) {
            //增加延迟回掉，防止快速回掉导致执行顺序错误
            ILaya.systemTimer.callLater(this, function (this:LoaderManager): void {
                progress && progress.runWith(1);
                complete && complete.runWith(content instanceof Array ? [content] : content);
                //判断是否全部加载，如果是则抛出complete事件
                this._loaderCount|| this.event(Event.COMPLETE);
            });
        } else {
            var original: string|null;
            original = url;
            url = AtlasInfoManager.getFileLoadPath(url);
            if (url != original && type !== "nativeimage") {
                type = Loader.ATLAS;
            } else {
                original = null;
            }
            var info: ResInfo = LoaderManager._resMap[url];
            if (!info) {
                info = this._infoPool.length ? this._infoPool.pop() : new ResInfo();
                info.url = url;
                info.type = type;
                info.cache = cache;
                info.group = group;
                info.ignoreCache = ignoreCache;
                info.useWorkerLoader = useWorkerLoader;
                info.originalUrl = original;
                complete && info.on(Event.COMPLETE, complete.caller, complete.method, complete.args);
                progress && info.on(Event.PROGRESS, progress.caller, progress.method, progress.args);
                LoaderManager._resMap[url] = info;
                priority = priority < this._maxPriority ? priority : this._maxPriority - 1;
                this._resInfos[priority].push(info);
                this._statInfo.count++;
                this.event(Event.PROGRESS, this.getProgress());
                this._next();
            } else {
                if (complete) {
                    if (original) {
                        complete && info._createListener(Event.COMPLETE, this, this._resInfoLoaded, [original, complete], false, false);
                    } else {
                        complete && info._createListener(Event.COMPLETE, complete.caller, complete.method, complete.args, false, false);
                    }
                }
                progress && info._createListener(Event.PROGRESS, progress.caller, progress.method, progress.args, false, false);
            }
        }
        return this;
    }

    private _resInfoLoaded(original: string, complete: Handler): void {
        complete.runWith(Loader.getRes(original));
    }

    /**
     * @internal
     */
    _createLoad(url: any, complete: Handler|null = null, progress: Handler|null = null, type: string|null = null, constructParams: any[]|null = null, propertyParams: any = null, priority: number = 1, cache: boolean = true, ignoreCache: boolean = false): LoaderManager {
        if (url instanceof Array) return this._loadAssets((<any[]>url), complete, progress, type, priority, cache);
        var content: any = Loader.getRes(url);
        if (content != null) {
            //增加延迟回掉
            ILaya.systemTimer.frameOnce(1, this, function (this:LoaderManager): void {
                progress && progress.runWith(1);
                complete && complete.runWith(content);
                //判断是否全部加载，如果是则抛出complete事件
                this._loaderCount || this.event(Event.COMPLETE);
            });
        } else {
            var info: ResInfo = LoaderManager._resMap[url];
            if (!info) {
                info = this._infoPool.length ? this._infoPool.pop() : new ResInfo();
                info.url = url;
                info.type = type;
                info.cache = false;
                info.ignoreCache = ignoreCache;
                info.originalUrl = null;
                info.group = null;
                info.createCache = cache;
                info.createConstructParams = constructParams;
                info.createPropertyParams = propertyParams;
                complete && info.on(Event.COMPLETE, complete.caller, complete.method, complete.args);
                progress && info.on(Event.PROGRESS, progress.caller, progress.method, progress.args);
                LoaderManager._resMap[url] = info;
                priority = priority < this._maxPriority ? priority : this._maxPriority - 1;
                this._resInfos[priority].push(info);
                this._statInfo.count++;
                this.event(Event.PROGRESS, this.getProgress());
                this._next();
            } else {
                complete && info._createListener(Event.COMPLETE, complete.caller, complete.method, complete.args, false, false);
                progress && info._createListener(Event.PROGRESS, progress.caller, progress.method, progress.args, false, false);
            }
        }
        return this;
    }

    private _next(): void {
        if (this._loaderCount >= this.maxLoader) return;
        for (var i: number = 0; i < this._maxPriority; i++) {
            var infos: any[] = this._resInfos[i];
            while (infos.length > 0) {
                var info: ResInfo = infos.shift();
                if (info) return this._doLoad(info);
            }
        }
        this._loaderCount || this.event(Event.COMPLETE);
    }

    private _doLoad(resInfo: ResInfo): void {
        this._loaderCount++;
        var loader: Loader = this._loaders.length ? this._loaders.pop() : new Loader();
        loader.on(Event.COMPLETE, null, onLoaded);
        loader.on(Event.PROGRESS, null, function (num: number): void {
            resInfo.event(Event.PROGRESS, num);
        });
        loader.on(Event.ERROR, null, function (msg: any): void {
            onLoaded(null);
        });

        var _me: LoaderManager = this;
        function onLoaded(data: any = null): void {
            loader.offAll();
            loader._data = null;
            loader._customParse = false;
            _me._loaders.push(loader);
            _me._endLoad(resInfo, data instanceof Array ? [data] : data);
            _me._loaderCount--;
            _me._next();
        }

        loader._constructParams = resInfo.createConstructParams;
        loader._propertyParams = resInfo.createPropertyParams;
        loader._createCache = resInfo.createCache;
        loader.load(resInfo.url, resInfo.type, resInfo.cache, resInfo.group, resInfo.ignoreCache, resInfo.useWorkerLoader);
    }

    private _endLoad(resInfo: ResInfo, content: any): void {
        //如果加载后为空，放入队列末尾重试
        var url: string = resInfo.url;
        if (content == null) {
            var errorCount: number = this._failRes[url] || 0;
            if (errorCount < this.retryNum) {
                console.warn("[warn]Retry to load:", url);
                this._failRes[url] = errorCount + 1;
                ILaya.systemTimer.once(this.retryDelay, this, this._addReTry, [resInfo], false);
                return;
            } else {
                Loader.clearRes(url);//使用create加载失败需要清除资源
                console.warn("[error]Failed to load:", url);
                this.event(Event.ERROR, url);
            }
        }
        if (this._failRes[url]) this._failRes[url] = 0;
        delete LoaderManager._resMap[url];
        if (resInfo.originalUrl) {
            content = Loader.getRes(resInfo.originalUrl);
        }
        resInfo.event(Event.COMPLETE, content);
        resInfo.offAll();
        this._infoPool.push(resInfo);
        this._statInfo.loaded++;
        this.event(Event.PROGRESS, this.getProgress());
    }

    private _addReTry(resInfo: ResInfo): void {
        this._resInfos[this._maxPriority - 1].push(resInfo);
        this._next();
    }

    /**
     * 清理指定资源地址缓存。
     * @param	url 资源地址。
     */
    clearRes(url: string): void {
        Loader.clearRes(url);
    }

    /**
     * 销毁Texture使用的图片资源，保留texture壳，如果下次渲染的时候，发现texture使用的图片资源不存在，则会自动恢复
     * 相比clearRes，clearTextureRes只是清理texture里面使用的图片资源，并不销毁texture，再次使用到的时候会自动恢复图片资源
     * 而clearRes会彻底销毁texture，导致不能再使用；clearTextureRes能确保立即销毁图片资源，并且不用担心销毁错误，clearRes则采用引用计数方式销毁
     * 【注意】如果图片本身在自动合集里面（默认图片小于512*512），内存是不能被销毁的，此图片被大图合集管理器管理
     * @param	url	图集地址或者texture地址，比如 Loader.clearTextureRes("res/atlas/comp.atlas"); Loader.clearTextureRes("hall/bg.jpg");
     */
    clearTextureRes(url: string): void {
        Loader.clearTextureRes(url);
    }

    /**
     * 获取指定资源地址的资源。
     * @param	url 资源地址。
     * @return	返回资源。
     */
    getRes(url: string): any {
        return Loader.getRes(url);
    }

    /**
     * 缓存资源。
     * @param	url 资源地址。
     * @param	data 要缓存的内容。
     */
    cacheRes(url: string, data: any): void {
        Loader.cacheRes(url, data);
    }

    /**
     * 设置资源分组。
     * @param url 资源地址。
     * @param group 分组名
     */
    setGroup(url: string, group: string): void {
        Loader.setGroup(url, group);
    }

    /**
     * 根据分组清理资源。
     * @param group 分组名
     */
    clearResByGroup(group: string): void {
        Loader.clearResByGroup(group);
    }

    /**
     * @private
     * 缓存资源。
     * @param	url 资源地址。
     * @param	data 要缓存的内容。
     */
    static cacheRes(url: string, data: any): void {
        Loader.cacheRes(url, data);
    }

    /** 清理当前未完成的加载，所有未加载的内容全部停止加载。*/
    clearUnLoaded(): void {
        //回收Handler
        for (var i: number = 0; i < this._maxPriority; i++) {
            var infos: any[] = this._resInfos[i];
            for (var j: number = infos.length - 1; j > -1; j--) {
                var info: ResInfo = infos[j];
                if (info) {
                    info.offAll();
                    this._infoPool.push(info);
                }
            }
            infos.length = 0;
        }
        this._loaderCount = 0;
        LoaderManager._resMap = {};
    }

    /**
     * 根据地址集合清理掉未加载的内容
     * @param	urls 资源地址集合
     */
    cancelLoadByUrls(urls: any[]): void {
        if (!urls) return;
        for (var i: number = 0, n: number = urls.length; i < n; i++) {
            this.cancelLoadByUrl(urls[i]);
        }
    }

    /**
     * 根据地址清理掉未加载的内容
     * @param	url 资源地址
     */
    cancelLoadByUrl(url: string): void {
        for (var i: number = 0; i < this._maxPriority; i++) {
            var infos: any[] = this._resInfos[i];
            for (var j: number = infos.length - 1; j > -1; j--) {
                var info: ResInfo = infos[j];
                if (info && info.url === url) {
                    infos[j] = null;
                    info.offAll();
                    this._infoPool.push(info);
                }
            }
        }
        if (LoaderManager._resMap[url]) delete LoaderManager._resMap[url];
    }

    /**
     * @private
     * 加载数组里面的资源。
     * @param arr 简单：["a.png","b.png"]，复杂[{url:"a.png",type:Loader.IMAGE,size:100,priority:1,useWorkerLoader:true},{url:"b.json",type:Loader.JSON,size:50,priority:1}]*/
    private _loadAssets(arr:(string|loadItem)[], complete: Handler|null = null, progress: Handler|null = null, type: string|null = null, priority: number = 1, cache: boolean = true, group: string|null = null): LoaderManager {
        var itemCount = arr.length;
        var loadedCount = 0;
        var totalSize = 0;
        var items: loadItem[] = [];
        var success = true;
        for (var i = 0; i < itemCount; i++) {
            let url = arr[i];
            let item:loadItem;
            if (typeof (url) == 'string') item = { url: url, type: type, size: 1, priority: priority };
            else
                item = url;
            if (!item.size) item.size = 1;
            item.progress = 0;
            totalSize += item.size;
            items.push(item);
            var progressHandler = progress ? Handler.create(null, loadProgress, [item], false) : null;
            var completeHandler = (complete || progress) ? Handler.create(null, loadComplete, [item]) : null;
            this.load(item.url, completeHandler, progressHandler, item.type, item.priority || 1, cache, item.group || group, false, item.useWorkerLoader);
        }

        function loadComplete(item: loadItem, content: any = null): void {
            loadedCount++;
            item.progress = 1;
            if (!content) success = false;
            if (loadedCount === itemCount && complete) {
                complete.runWith(success);
            }
        }

        function loadProgress(item: loadItem, value: number): void {
            if (progress != null) {
                item.progress = value;
                var num = 0;
                for (var j = 0; j < items.length; j++) {
					var item1 = items[j];
					if(item1){
                    	let prog = item1.progress==undefined?0:item1.progress;
						num += item1.size==undefined?0:item1.size * prog;
					}
                }
                var v = num / totalSize;
                progress.runWith(v);
            }
        }
        return this;
    }

    /**
     * 解码Texture或者图集
     * @param	urls texture地址或者图集地址集合
     */
    //TODO:TESTs
    decodeBitmaps(urls: any[]): void {
        var i: number, len: number = urls.length;
        var ctx: any;
        //ctx = Browser.context;
        ctx = ILaya.Render._context;
        //经测试需要画到主画布上才能只解码一次
        //当前用法下webgl模式会报错
        for (i = 0; i < len; i++) {
            var atlas: any[];
            atlas = Loader.getAtlas(urls[i]);
            if (atlas) {
                this._decodeTexture(atlas[0], ctx);
            } else {
                var tex: Texture;
                tex = this.getRes(urls[i]);
                if (tex && tex instanceof Texture) {
                    this._decodeTexture(tex, ctx);
                }
            }
        }
    }

    private _decodeTexture(tex: Texture, ctx: any): void {
        var bitmap: any = tex.bitmap;
        if (!tex || !bitmap) return;
        var tImg: any = bitmap.source || bitmap.image;
        if (!tImg) return;
        if (tImg instanceof HTMLImageElement) {
            ctx.drawImage(tImg, 0, 0, 1, 1);
            var info: any = ctx.getImageData(0, 0, 1, 1);
        }
    }
}

/** @internal */
class ResInfo extends EventDispatcher {
    url: string;
    type: string|null;
    cache: boolean;
    group: string|null;
    ignoreCache: boolean;
    useWorkerLoader: boolean;
    originalUrl: string|null;

    createCache: boolean;
    createConstructParams: any[]|null;
    createPropertyParams: any;
}

export interface loadItem{
    /**@internal */
    url:string;
    /**@internal */
    type?:string;
    /**@internal */
    size?:number;
    /**@internal */
    priority?:number;
    /**@internal */
    useWorkerLoader?:boolean;
    /**@internal */
    progress?:number;
    /**@internal */
    group?:string;
}

export interface createItem{
    url:string;
    /** 资源类型 */
    type?:string;
    priority?:number;
    group?:string;
    /** 资源属性参数。 */
    propertyParams?:any[];
    /** 资源构造函数参数。 */
    constructParams?:any[];
    progress?:number;
}
