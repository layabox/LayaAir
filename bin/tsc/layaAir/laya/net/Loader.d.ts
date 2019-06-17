import { HttpRequest } from "././HttpRequest";
import { EventDispatcher } from "../events/EventDispatcher";
/**
 * 加载进度发生改变时调度。
 * @eventType Event.PROGRESS
 * */
/**
 * 加载完成后调度。
 * @eventType Event.COMPLETE
 * */
/**
 * 加载出错时调度。
 * @eventType Event.ERROR
 * */
/**
 * <code>Loader</code> 类可用来加载文本、JSON、XML、二进制、图像等资源。
 */
export declare class Loader extends EventDispatcher {
    /**文本类型，加载完成后返回文本。*/
    static TEXT: string;
    /**JSON 类型，加载完成后返回json数据。*/
    static JSON: string;
    /**prefab 类型，加载完成后返回Prefab实例。*/
    static PREFAB: string;
    /**XML 类型，加载完成后返回domXML。*/
    static XML: string;
    /**二进制类型，加载完成后返回arraybuffer二进制数据。*/
    static BUFFER: string;
    /**纹理类型，加载完成后返回Texture。*/
    static IMAGE: string;
    /**声音类型，加载完成后返回sound。*/
    static SOUND: string;
    /**图集类型，加载完成后返回图集json信息(并创建图集内小图Texture)。*/
    static ATLAS: string;
    /**位图字体类型，加载完成后返回BitmapFont，加载后，会根据文件名自动注册为位图字体。*/
    static FONT: string;
    /** TTF字体类型，加载完成后返回null。*/
    static TTF: string;
    /** 预加载文件类型，加载完成后自动解析到preLoadedMap。*/
    static PLF: string;
    /** 二进制预加载文件类型，加载完成后自动解析到preLoadedMap。*/
    static PLFB: string;
    /**Hierarchy资源。*/
    static HIERARCHY: string;
    /**Mesh资源。*/
    static MESH: string;
    /**Material资源。*/
    static MATERIAL: string;
    /**Texture2D资源。*/
    static TEXTURE2D: string;
    /**TextureCube资源。*/
    static TEXTURECUBE: string;
    /**AnimationClip资源。*/
    static ANIMATIONCLIP: string;
    /**Avatar资源。*/
    static AVATAR: string;
    /**Terrain资源。*/
    static TERRAINHEIGHTDATA: string;
    /**Terrain资源。*/
    static TERRAINRES: string;
    /**文件后缀和类型对应表。*/
    static typeMap: any;
    /**资源解析函数对应表，用来扩展更多类型的资源加载解析。*/
    static parserMap: any;
    /**每帧加载完成回调使用的最大超时时间，如果超时，则下帧再处理，防止帧卡顿。*/
    static maxTimeOut: number;
    /**资源分组对应表。*/
    static groupMap: any;
    /**已加载的资源池。*/
    static loadedMap: any;
    /**已加载的图集资源池。*/
    protected static atlasMap: any;
    /** @private 已加载的数据文件。*/
    static preLoadedMap: any;
    /**@private 引用image对象，防止垃圾回收*/
    protected static _imgCache: any;
    /**@private */
    protected static _loaders: any[];
    /**@private */
    protected static _isWorking: boolean;
    /**@private */
    protected static _startIndex: number;
    /**
     * 获取指定资源地址的数据类型。
     * @param	url 资源地址。
     * @return 数据类型。
     */
    static getTypeFromUrl(url: string): string;
    /**@private 加载后的数据对象，只读*/
    _data: any;
    /**@private */
    protected _url: string;
    /**@private */
    protected _type: string;
    /**@private */
    _cache: boolean;
    /**@private */
    protected _http: HttpRequest;
    /**@private */
    protected _useWorkerLoader: boolean;
    /**@private 自定义解析不派发complete事件，但会派发loaded事件，手动调用endLoad方法再派发complete事件*/
    _customParse: boolean;
    /**@private */
    _constructParams: any[];
    /**@private */
    _propertyParams: any;
    /**@private */
    _createCache: boolean;
    /**
     * 加载资源。加载错误会派发 Event.ERROR 事件，参数为错误信息。
     * @param	url			资源地址。
     * @param	type		(default = null)资源类型。可选值为：Loader.TEXT、Loader.JSON、Loader.XML、Loader.BUFFER、Loader.IMAGE、Loader.SOUND、Loader.ATLAS、Loader.FONT。如果为null，则根据文件后缀分析类型。
     * @param	cache		(default = true)是否缓存数据。
     * @param	group		(default = null)分组名称。
     * @param	ignoreCache (default = false)是否忽略缓存，强制重新加载。
     * @param	useWorkerLoader(default = false)是否使用worker加载（只针对IMAGE类型和ATLAS类型，并且浏览器支持的情况下生效）
     */
    load(url: string, type?: string, cache?: boolean, group?: string, ignoreCache?: boolean, useWorkerLoader?: boolean): void;
    /**
     * @private
     * onload、onprocess、onerror必须写在本类
     */
    private _loadHttpRequest;
    /**
     * @private
     */
    private _loadHtmlImage;
    /**
     * @private
     */
    protected _loadHttpRequestWhat(url: string, contentType: string): void;
    /**
     * @private
     * 加载TTF资源。
     * @param	url 资源地址。
     */
    protected _loadTTF(url: string): void;
    /**
     * @private
     */
    protected _loadImage(url: string): void;
    /**
     * @private
     * 加载声音资源。
     * @param	url 资源地址。
     */
    protected _loadSound(url: string): void;
    /**@private */
    protected onProgress(value: number): void;
    /**@private */
    protected onError(message: string): void;
    /**
     * 资源加载完成的处理函数。
     * @param	data 数据。
     */
    protected onLoaded(data?: any): void;
    private parsePLFData;
    private parsePLFBData;
    private parseOnePLFBFile;
    /**
     * 加载完成。
     * @param	data 加载的数据。
     */
    protected complete(data: any): void;
    /**@private */
    private static checkNext;
    /**
     * 结束加载，处理是否缓存及派发完成事件 <code>Event.COMPLETE</code> 。
     * @param	content 加载后的数据
     */
    endLoad(content?: any): void;
    /**加载地址。*/
    readonly url: string;
    /**加载类型。*/
    readonly type: string;
    /**是否缓存。*/
    readonly cache: boolean;
    /**返回的数据。*/
    readonly data: any;
    /**
     * 清理指定资源地址的缓存。
     * @param	url 资源地址。
     */
    static clearRes(url: string): void;
    /**
     * 销毁Texture使用的图片资源，保留texture壳，如果下次渲染的时候，发现texture使用的图片资源不存在，则会自动恢复
     * 相比clearRes，clearTextureRes只是清理texture里面使用的图片资源，并不销毁texture，再次使用到的时候会自动恢复图片资源
     * 而clearRes会彻底销毁texture，导致不能再使用；clearTextureRes能确保立即销毁图片资源，并且不用担心销毁错误，clearRes则采用引用计数方式销毁
     * 【注意】如果图片本身在自动合集里面（默认图片小于512*512），内存是不能被销毁的，此图片被大图合集管理器管理
     * @param	url	图集地址或者texture地址，比如 Loader.clearTextureRes("res/atlas/comp.atlas"); Loader.clearTextureRes("hall/bg.jpg");
     */
    static clearTextureRes(url: string): void;
    /**
     * 获取指定资源地址的资源。
     * @param	url 资源地址。
     * @return	返回资源。
     */
    static getRes(url: string): any;
    /**
     * 获取指定资源地址的图集地址列表。
     * @param	url 图集地址。
     * @return	返回地址集合。
     */
    static getAtlas(url: string): any[];
    /**
     * 缓存资源。
     * @param	url 资源地址。
     * @param	data 要缓存的内容。
     */
    static cacheRes(url: string, data: any): void;
    /**
     * 设置资源分组。
     * @param url 资源地址。
     * @param group 分组名。
     */
    static setGroup(url: string, group: string): void;
    /**
     * 根据分组清理资源。
     * @param group 分组名。
     */
    static clearResByGroup(group: string): void;
}
