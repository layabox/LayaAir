import { AnimationBase } from "./AnimationBase";
import { Graphics } from "./Graphics";
import { Loader } from "../net/Loader"
import { GraphicAnimation } from "./GraphicAnimation"
import { Handler } from "../utils/Handler"
import { Utils } from "../utils/Utils"
import { ILaya } from "../../ILaya";
import { AtlasResource } from "../resource/AtlasResource";

/**
 * @en Dispatched when the animation playback is complete.
 * @zh 动画播放完毕后调度。
 * @eventType Event.COMPLETE
 */
/*[Event(name = "complete", type = "laya.events.Event")]*/

/**
 * @en Dispatched when a specific label is reached during playback.
 * @zh 播放到某标签后调度。
 * @eventType Event.LABEL
 */
/*[Event(name = "label", type = "laya.events.Event")]*/

/**
 * @en The Animation class is a Graphics-based animation class. It implements interfaces for creating, playing, and controlling animations based on Graphics.
 * The animation template cache pool stores key-value pairs, where the key can be customized or read from a specified configuration file, and the value is the corresponding animation template, which is an array of Graphics objects. Each Graphics object corresponds to a frame image, and the essence of animation playback is switching Graphics objects at regular intervals.
 * This class uses an animation template cache pool, which trades some memory overhead for CPU savings. When the same animation template is used multiple times, compared to creating a new animation template each time, using the animation template cache pool only requires creation once, caching it for multiple reuses, thus saving the overhead of creating animation templates.
 * Use the set source, loadImages(...), loadAtlas(...), loadAnimation(...) methods to create animation templates. Use play(...) to play the specified animation.
 * @zh Animation 是基于 Graphics 的动画类。实现了基于 Graphics 的动画创建、播放、控制接口。
 * 本类使用了动画模版缓存池，它以一定的内存开销来节省CPU开销，当相同的动画模版被多次使用时，相比于每次都创建新的动画模版，使用动画模版缓存池，只需创建一次，缓存之后多次复用，从而节省了动画模版创建的开销。
 * 动画模版缓存池，以key-value键值对存储，key可以自定义，也可以从指定的配置文件中读取，value为对应的动画模版，是一个Graphics对象数组，每个Graphics对象对应一个帧图像，动画的播放实质就是定时切换Graphics对象。
 * 使用set source、loadImages(...)、loadAtlas(...)、loadAnimation(...)方法可以创建动画模版。使用play(...)可以播放指定动画。
 */
export class Animation extends AnimationBase {
    /**
     * @en The animation template cache pool, stored as key-value pairs. The key can be customized or read from a specified configuration file, and the value is the corresponding animation template, which is an array of Graphics objects. Each Graphics object corresponds to a frame image, and the essence of animation playback is switching Graphics objects at regular intervals.
     * Use loadImages(...), loadAtlas(...), loadAnimation(...), set source methods to create animation templates. Use play(...) to play the specified animation.
     * @zh 动画模版缓存池，以key-value键值对存储，key可以自定义，也可以从指定的配置文件中读取，value为对应的动画模版，是一个Graphics对象数组，每个Graphics对象对应一个帧图像，动画的播放实质就是定时切换Graphics对象。
     * 使用loadImages(...)、loadAtlas(...)、loadAnimation(...)、set source方法可以创建动画模版。使用play(...)可以播放指定动画。
     */
    static framesMap: any = {};
    /**
     * @private
     * @internal
     */
    protected _frames: any[];

    private _source: string;

    private _autoPlay = false;

    /**
     * @en The currently used atlas resources.
     * @zh 当前正在使用的图集资源
     */
    private _atlasCatch: AtlasResource[];


    /**
     * @en Constructor method of Animation.
     * @zh 动画类的构造方法
     */
    constructor() {
        super();
        this._setControlNode(this);
    }

    /**
     * @inheritDoc
     * @override
     * @en Destroys the object.
     * @param destroyChild Whether to destroy child nodes
     * @zh 销毁对象。
     * @param destroyChild 是否销毁子节点
     */
    destroy(destroyChild: boolean = true): void {
        this.stop();
        super.destroy(destroyChild);
        if (this._atlasCatch) {
            for (let alias of this._atlasCatch) {
                alias._removeReference();
                if (0 == alias.referenceCount) {
                    alias.destroy();
                }
            }
        }
        this._atlasCatch = null;
        this._frames = null;
        this._labels = null;
    }

    /**
     * @override
     * @en Starts playing the animation. It will search for an animation template with the key value "name" in the animation template cache pool. If it exists, it will initialize the current sequence frame with this animation template. If it doesn't exist, it will use the current sequence frame.
     * The play(...) method is designed to be called at any time after creating an instance. After calling, it will be in a playing state. When the corresponding resources are loaded, the animation frame filling method (set frames) is called, or the instance is displayed on the stage, it will determine whether it is in a playing state. If so, it will start playing.
     * Combined with the wrapMode property, you can set the animation playback order type.
     * @param start (Optional) Specifies the index (int) or frame label (String) where the animation playback starts. Frame labels can be added and removed using addLabel(...) and removeLabel(...).
     * @param loop (Optional) Whether to loop playback.
     * @param name (Optional) The key of the animation template in the animation template cache pool, which can also be considered as the animation name. If name is empty, it will play the current animation sequence frame; if it is not empty, it will look for an animation template with the key value "name" in the animation template cache pool. If it exists, it will initialize the current sequence frame with this animation template and play it. If it doesn't exist, it will still play the current animation sequence frame. If there is no frame data for the current animation, it will not play, but the instance will still be in a playing state.
     * @zh 开始播放动画。会在动画模版缓存池中查找key值为name的动画模版，存在则用此动画模版初始化当前序列帧， 如果不存在，则使用当前序列帧。
     * play(...)方法被设计为在创建实例后的任何时候都可以被调用，调用后就处于播放状态，当相应的资源加载完毕、调用动画帧填充方法(set frames)或者将实例显示在舞台上时，会判断是否处于播放状态，如果是，则开始播放。
     * 配合wrapMode属性，可设置动画播放顺序类型。
     * @param start （可选）指定动画播放开始的索引(int)或帧标签(String)。帧标签可以通过addLabel(...)和removeLabel(...)进行添加和删除。
     * @param loop （可选）是否循环播放。
     * @param name （可选）动画模板在动画模版缓存池中的key，也可认为是动画名称。如果name为空，则播放当前动画序列帧；如果不为空，则在动画模版缓存池中寻找key值为name的动画模版，如果存在则用此动画模版初始化当前序列帧并播放，如果不存在，则仍然播放当前动画序列帧；如果没有当前动画的帧数据，则不播放，但该实例仍然处于播放状态。
     */
    play(start: any = 0, loop: boolean = true, name: string = ""): void {
        if (name) this._setFramesFromCache(name, true);
        super.play(start, loop, name);
    }

    /**
     * @private
     * @internal
     */
    protected _setFramesFromCache(name: string, showWarn: boolean = false): boolean {
        if (this._url) name = this._url + "#" + name;
        if (name && Animation.framesMap[name]) {
            var tAniO: any = Animation.framesMap[name];
            if (tAniO instanceof Array) {
                this._frames = Animation.framesMap[name];
                this._count = this._frames.length;
            } else {
                if (tAniO.nodeRoot) {
                    //如果动画数据未解析过,则先进行解析
                    Animation.framesMap[name] = GraphicAnimation.parseAnimationByData(tAniO);
                    tAniO = Animation.framesMap[name];
                }
                this._frames = tAniO.frames;
                this._count = this._frames.length;
                //如果读取的是动画配置信息，帧率按照动画设置的帧率播放
                if (!this._frameRateChanged) this._interval = tAniO.interval;
                this._labels = this._copyLabels(tAniO.labels);
            }
            return true;
        } else {
            if (showWarn) console.log("ani not found:", name);
        }
        return false;
    }

    /**@private */
    private _copyLabels(labels: any): any {
        if (!labels) return null;
        var rst: any;
        rst = {};
        var key: string;
        for (key in labels) {
            rst[key] = Utils.copyArray([], labels[key]);
        }
        return rst;
    }

    /**
     * @private 
     * @override
     * @internal
    */
    protected _frameLoop(): void {
        if (this._visible && this._style.alpha > 0.01 && this._frames) {
            super._frameLoop();
        }
    }

    /**
     * @private 
     * @override
     * @internal
    */
    protected _displayToIndex(value: number): void {
        if (this._frames) this.graphics = this._frames[value];
    }

    /**
     * @en The current animation frame image array. In this class, each frame image is a Graphics object, and animation playback is essentially the process of switching Graphics objects at regular intervals.
     * @zh 当前动画的帧图像数组。本类中，每个帧图像是一个Graphics对象，而动画播放就是定时切换Graphics对象的过程。
     */
    get frames(): any[] {
        return this._frames;
    }

    set frames(value: any[]) {
        this._frames = value;
        if (value) {
            this._count = value.length;
            //if (_isPlaying) play(_index, loop, _actionName);
            if (this._actionName) this._setFramesFromCache(this._actionName, true);
            this.index = this._index;
        }
    }

    /**
     * @en Animation data source.
     * Types are as follows:
     * 1. LayaAir IDE animation file path: Using this type requires preloading the required atlas resources, otherwise it will fail to create. If you don't want to preload or need a callback when creation is complete, please use the loadAnimation(...) method.
     * 2. Atlas path: Animation templates created using this type will not be cached in the animation template cache pool. If you need caching or a callback when creation is complete, please use the loadAtlas(...) method.
     * 3. Image path collection: Animation templates created using this type will not be cached in the animation template cache pool. If you need caching, please use the loadImages(...) method.
     * @param value Data source. For example: Atlas: "xx/a1.atlas"; Image collection: "a1.png,a2.png,a3.png"; LayaAir IDE animation: "xx/a1.ani".
     * @zh 动画数据源。
     * 类型如下：
     * 1. LayaAir IDE动画文件路径：使用此类型需要预加载所需的图集资源，否则会创建失败，如果不想预加载或者需要创建完毕的回调，请使用loadAnimation(...)方法；
     * 2. 图集路径：使用此类型创建的动画模版不会被缓存到动画模版缓存池中，如果需要缓存或者创建完毕的回调，请使用loadAtlas(...)方法；
     * 3. 图片路径集合：使用此类型创建的动画模版不会被缓存到动画模版缓存池中，如果需要缓存，请使用loadImages(...)方法。
     * @param value 数据源。例如：图集："xx/a1.atlas"; 图片集合："a1.png,a2.png,a3.png"; LayaAir IDE动画："xx/a1.ani"。
     */
    get source(): string {
        return this._source;
    }

    set source(value: string) {
        this._source = value;

        if (!value)
            this.clear();
        else if (value.indexOf(".ani") > -1)
            this.loadAnimation(value);
        else if (value.startsWith("res://") || value.indexOf(".json") > -1 || value.indexOf("als") > -1 || value.indexOf("atlas") > -1)
            this.loadAtlas(value);
        else
            this.loadImages(value.split(","));
    }

    /**
     * @en Whether to auto-play, default is false. If set to true, the animation will automatically play after being created and added to the stage.
     * @zh 是否自动播放，默认为false。如果设置为true，则动画被创建并添加到舞台后自动播放。
     */
    set autoPlay(value: boolean) {
        this._autoPlay = value;
        if (value)
            this.play();
        else
            this.stop();
    }

    get autoPlay() {
        return this._autoPlay;
    }

    /**
     * @override
     * @en Stops animation playback and clears object properties. It can then be stored in the object pool for easy object reuse.
     * @returns AnimationBase
     * @zh 停止动画播放，并清理对象属性。之后可存入对象池，方便对象复用。
     * @returns AnimationBase
     */
    clear(): AnimationBase {
        super.clear();
        this.stop();
        this.graphics = null;
        this._frames = null;
        this._labels = null;
        return this;
    }

    /**
     * @en Initializes the current animation sequence frame based on the specified animation template. The process of selecting an animation template is as follows: 1. The animation template with the key cacheName in the animation template cache pool; 2. If it doesn't exist, load the specified image collection and create an animation template. Note: Only when a non-empty cacheName is specified can the created animation template be cached in the animation template cache pool with this as the key, otherwise no caching is performed.
     * The animation template cache pool trades a certain memory overhead for CPU savings. When the same animation template is used multiple times, compared to creating a new animation template each time, using the animation template cache pool only needs to be created once, cached, and reused multiple times, thus saving the overhead of creating animation templates.
     * Because the return value is the Animation object itself, you can use the following syntax: loadImages(...).loadImages(...).play(...);
     * @param urls Image path collection. When creating an animation template, this will be used as the data source. The parameter is in the form: [url1,url2,url3,...].
     * @param cacheName (Optional) The key of the animation template in the animation template cache pool. If this parameter is not empty, it means using the animation template cache pool. If an animation template with the key cacheName exists in the animation template cache pool, this template is used. Otherwise, a new animation template is created. If cacheName is not empty, it is cached in the animation template cache pool with cacheName as the key. If cacheName is empty, no caching is performed.
     * @returns Returns the Animation object itself.
     * @zh 根据指定的动画模版初始化当前动画序列帧。选择动画模版的过程如下：1. 动画模版缓存池中key为cacheName的动画模版；2. 如果不存在，则加载指定的图片集合并创建动画模版。注意：只有指定不为空的cacheName，才能将创建好的动画模版以此为key缓存到动画模版缓存池，否则不进行缓存。
     * 动画模版缓存池是以一定的内存开销来节省CPU开销，当相同的动画模版被多次使用时，相比于每次都创建新的动画模版，使用动画模版缓存池，只需创建一次，缓存之后多次复用，从而节省了动画模版创建的开销。
     * 因为返回值为Animation对象本身，所以可以使用如下语法：loadImages(...).loadImages(...).play(...);。
     * @param urls 图片路径集合。创建动画模版时，将以此为数据源。参数形式为：[url1,url2,url3,...]。
     * @param cacheName （可选）动画模板在动画模版缓存池中的key。如果此参数不为空，表示使用动画模版缓存池。如果动画模版缓存池中存在key为cacheName的动画模版，则使用此模版。否则，创建新的动画模版，如果cacheName不为空，则以cacheName为key缓存到动画模版缓存池中，如果cacheName为空，不进行缓存。
     * @returns 返回动画本身。
     */
    loadImages(urls: any[], cacheName: string = ""): Animation {
        this._url = "";
        if (!this._setFramesFromCache(cacheName)) {
            this.frames = Animation.framesMap[cacheName] ? Animation.framesMap[cacheName] : Animation.createFrames(urls, cacheName);
        }
        if (!this._isPlaying && this._autoPlay)
            this.play();
        return this;
    }


    /**
     * @en Initializes the current animation sequence frame based on the specified animation template. The process of selecting an animation template is as follows: 1. The animation template with the key cacheName in the animation template cache pool; 2. If it doesn't exist, load the specified atlas and create an animation template.
     * Note: Only when a non-empty cacheName is specified can the created animation template be cached in the animation template cache pool with this as the key, otherwise no caching is performed.
     * The animation template cache pool trades a certain memory overhead for CPU savings. When the same animation template is used multiple times, compared to creating a new animation template each time, using the animation template cache pool only needs to be created once, cached, and reused multiple times, thus saving the overhead of creating animation templates.
     * Because the return value is the Animation object itself, you can use the following syntax: loadAtlas(...).loadAtlas(...).play(...);
     * @param url Atlas path. When creating an animation template, this will be used as the data source.
     * @param loaded (Optional) Callback when the animation is initialized using the specified atlas.
     * @param cacheName (Optional) The key of the animation template in the animation template cache pool. If this parameter is not empty, it means using the animation template cache pool. If an animation template with the key cacheName exists in the animation template cache pool, this template is used. Otherwise, a new animation template is created. If cacheName is not empty, it is cached in the animation template cache pool with cacheName as the key. If cacheName is empty, no caching is performed.
     * @returns Returns the Animation object itself.
     * @zh 根据指定的动画模版初始化当前动画序列帧。选择动画模版的过程如下：1. 动画模版缓存池中key为cacheName的动画模版；2. 如果不存在，则加载指定的图集并创建动画模版。
     * 注意：只有指定不为空的cacheName，才能将创建好的动画模版以此为key缓存到动画模版缓存池，否则不进行缓存。
     * 动画模版缓存池是以一定的内存开销来节省CPU开销，当相同的动画模版被多次使用时，相比于每次都创建新的动画模版，使用动画模版缓存池，只需创建一次，缓存之后多次复用，从而节省了动画模版创建的开销。
     * 因为返回值为Animation对象本身，所以可以使用如下语法：loadAtlas(...).loadAtlas(...).play(...);。
     * @param	url	图集路径。需要创建动画模版时，会以此为数据源。
     * @param	loaded（可选）使用指定图集初始化动画完毕的回调。
     * @param	cacheName（可选）动画模板在动画模版缓存池中的key。如果此参数不为空，表示使用动画模版缓存池。如果动画模版缓存池中存在key为cacheName的动画模版，则使用此模版。否则，创建新的动画模版，如果cacheName不为空，则以cacheName为key缓存到动画模版缓存池中，如果cacheName为空，不进行缓存。
     * @return 	返回动画本身。
     */
    loadAtlas(url: string, loaded: Handler = null, cacheName: string = ""): Animation {
        this._url = "";
        if (!this._setFramesFromCache(cacheName)) {
            let onLoaded = (loadUrl: string, data: AtlasResource) => {
                if (null == this._atlasCatch) this._atlasCatch = [];
                if (0 > this._atlasCatch.indexOf(data)) {
                    this._atlasCatch.push(data);
                    data._addReference();
                }
                if (url === loadUrl) {
                    this.frames = Animation.framesMap[cacheName] ? Animation.framesMap[cacheName] : Animation.createFrames(url, cacheName);
                    if (!this._isPlaying && this._autoPlay)
                        this.play();
                    if (loaded) loaded.run();
                }
            }
            let atlas: AtlasResource = Loader.getAtlas(url);
            if (atlas) onLoaded(url, atlas);
            else ILaya.loader.load(url, Handler.create(null, onLoaded, [url]), null, Loader.ATLAS);
        }
        return this;
    }

    /**
     * @deprecated
     * @en Loads and parses an animation file created by LayaAir IDE, which may contain multiple animations. The default frame rate is the frame rate designed in the IDE. If set interval has been called, the frame rate corresponding to this frame interval is used. After loading, it creates an animation template and caches it in the animation template cache pool. The key "url#animation name" corresponds to the animation template of the corresponding animation name, and the key "url#" corresponds to the default animation template of the animation template collection.
     * Note: If you haven't preloaded the atlas used by the animation before calling this method, please specify the atlas parameter as the corresponding atlas path, otherwise it will cause the animation creation to fail.
     * The animation template cache pool trades a certain memory overhead for CPU savings. When the same animation template is used multiple times, compared to creating a new animation template each time, using the animation template cache pool only needs to be created once, cached, and reused multiple times, thus saving the overhead of creating animation templates.
     * Because the return value is the Animation object itself, you can use the following syntax: loadAnimation(...).loadAnimation(...).play(...);
     * @param url Animation file path. Can be created and published by LayaAir IDE.
     * @param loaded (Optional) Callback when the animation is initialized using the specified animation resource.
     * @param atlas (Optional) The atlas address used by the animation (optional).
     * @returns Returns the Animation object itself.
     * @zh 加载并解析由LayaAir IDE制作的动画文件，此文件中可能包含多个动画。默认帧率为在IDE中设计的帧率，如果调用过set interval，则使用此帧间隔对应的帧率。加载后创建动画模版，并缓存到动画模版缓存池，key "url#动画名称" 对应相应动画名称的动画模板，key "url#" 对应动画模版集合的默认动画模版。
     * 注意：如果调用本方法前，还没有预加载动画使用的图集，请将atlas参数指定为对应的图集路径，否则会导致动画创建失败。
     * 动画模版缓存池是以一定的内存开销来节省CPU开销，当相同的动画模版被多次使用时，相比于每次都创建新的动画模版，使用动画模版缓存池，只需创建一次，缓存之后多次复用，从而节省了动画模版创建的开销。
     * 因为返回值为Animation对象本身，所以可以使用如下语法：loadAnimation(...).loadAnimation(...).play(...);。
     * @param	url 动画文件路径。可由LayaAir IDE创建并发布。
     * @param	loaded（可选）使用指定动画资源初始化动画完毕的回调。
     * @param	atlas（可选）动画用到的图集地址（可选）。
     * @return 	返回动画本身。
     */
    loadAnimation(url: string, loaded: Handler = null, atlas: string = null): Animation {
        this._url = url;
        var _this: Animation = this;
        if (!this._actionName) this._actionName = "";
        if (!_this._setFramesFromCache(this._actionName)) {
            if (!atlas || Loader.getAtlas(atlas)) {
                this._loadAnimationData(url, loaded, atlas);
            } else {
                ILaya.loader.load(atlas, Handler.create(this, this._loadAnimationData, [url, loaded, atlas]), null, Loader.ATLAS)
            }
        } else {
            _this._setFramesFromCache(this._actionName, true);
            this.index = 0;
            if (loaded) loaded.run();
        }
        return this;
    }

    /**@private */
    private _loadAnimationData(url: string, loaded: Handler = null, atlas: string = null): void {
        if (atlas && !Loader.getAtlas(atlas)) {
            console.warn("atlas load fail:" + atlas);
            return;
        }

        ILaya.loader.fetch(url, "json").then(data => {
            if (this._url !== url)
                return;

            if (!data) {
                // 如果getRes失败了，有可能是相同的文件已经被删掉了，因为下面在用完后会立即删除
                // 这时候可以取frameMap中去找，如果找到了，走正常流程。--王伟
                if (Animation.framesMap[url + "#"]) {
                    this._setFramesFromCache(this._actionName, true);
                    this.index = 0;
                    this._resumePlay();
                    if (loaded) loaded.run();
                }
                return;
            }

            let tAniO: any;
            if (!Animation.framesMap[url + "#"]) {
                //此次解析仅返回动画数据，并不真正解析动画graphic数据
                let aniData: any = GraphicAnimation.parseAnimationData(data);
                if (!aniData) return;
                //缓存动画数据
                let aniList: any[] = aniData.animationList;
                let len: number = aniList.length;
                let defaultO: any;
                for (let i = 0; i < len; i++) {
                    tAniO = aniList[i];
                    Animation.framesMap[url + "#" + tAniO.name] = tAniO;
                    if (!defaultO) defaultO = tAniO;
                }
                if (defaultO) {
                    Animation.framesMap[url + "#"] = defaultO;
                    this._setFramesFromCache(this._actionName, true);
                    this.index = 0;
                }
                this._resumePlay();
            } else {
                this._setFramesFromCache(this._actionName, true);
                this.index = 0;
                this._resumePlay();
            }
            if (loaded) loaded.run();
        });
    }

    /**
     * @en Creates an animation template. Multiple animations can share the same animation template without having to create a new one each time, thus saving the overhead of creating a Graphics collection.
     * @param url Atlas path or image path array. If it's an atlas path, the corresponding atlas needs to be preloaded. If it's not preloaded, it will cause creation failure.
     * @param name The key of the animation template in the animation template cache pool. If it's not empty, the animation template is cached with this as the key, otherwise it's not cached.
     * @returns Animation template.
     * @zh 创建动画模板，多个动画可共享同一份动画模板，而不必每次都创建一份新的，从而节省创建Graphics集合的开销。
     * @param	url	图集路径或者图片路径数组。如果是图集路径，需要相应图集已经被预加载，如果没有预加载，会导致创建失败。
     * @param	name 动画模板在动画模版缓存池中的key。如果不为空，则以此为key缓存动画模板，否则不缓存。
     * @return	动画模板。
     */
    static createFrames(url: string | string[], name: string): any[] {
        var arr: any[];
        if (typeof (url) == 'string') {
            var atlas: AtlasResource = Loader.getAtlas(<string>url);
            if (atlas && atlas.frames.length) {
                let frames = atlas.frames;
                arr = [];
                for (var i: number = 0, n: number = frames.length; i < n; i++) {
                    var g: Graphics = new Graphics();
                    g.drawImage(frames[i], 0, 0);
                    arr.push(g);
                }
            }
        } else if (url instanceof Array) {
            arr = [];
            for (i = 0, n = url.length; i < n; i++) {
                g = new Graphics();
                g.loadImage(url[i], 0, 0);
                arr.push(g);
            }
        }
        if (name) Animation.framesMap[name] = arr;
        return arr;
    }

    /**
     * @en Clears the animation data with the specified key value from the animation template cache pool.
     * When calling the function to create an animation template, developers can manually specify this value. For animation sets created by LayaAir IDE, the parsed key format is: "url#": represents the default animation template of the animation set, if this value is used as a parameter, it will clear the entire animation set data; "url#aniName": represents the animation template with the corresponding name.
     * @param key The key of the animation template in the animation template cache pool.
     * @zh 从动画模版缓存池中清除指定key值的动画数据。
     * 开发者在调用创建动画模版函数时，可以手动指定此值。而如果是由LayaAir IDE创建的动画集，解析后的key格式为："url#"：表示动画集的默认动画模版，如果以此值为参数，会清除整个动画集数据；"url#aniName"：表示相应名称的动画模版。
     * @param key 动画模板在动画模版缓存池中的key。
     */
    static clearCache(key: string): void {
        var cache: any = Animation.framesMap;
        var val: string;
        var key2: string = key + "#";
        for (val in cache) {
            if (val === key || val.indexOf(key2) === 0) {
                delete Animation.framesMap[val];
            }
        }
    }

    /**
     * @internal
     * @en Called after the object is deserialized.
     * @zh 在对象反序列化后调用。
     */
    onAfterDeserialize(): void {
        super.onAfterDeserialize();

        if ((<any>this).images) {
            if (!this._source)
                this.loadImages((<any>this).images);
            delete (<any>this).images;
        }
    }
}

