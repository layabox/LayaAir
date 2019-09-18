import { AnimationBase } from "./AnimationBase";
import { Graphics } from "./Graphics";
import { Loader } from "../net/Loader"
import { GraphicAnimation } from "../utils/GraphicAnimation"
import { Handler } from "../utils/Handler"
import { Utils } from "../utils/Utils"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

/**
 * 动画播放完毕后调度。
 * @eventType Event.COMPLETE
 */
/*[Event(name = "complete", type = "laya.events.Event")]*/

/**
 * 播放到某标签后调度。
 * @eventType Event.LABEL
 */
/*[Event(name = "label", type = "laya.events.Event")]*/

/**
 * <p> <code>Animation</code> 是Graphics动画类。实现了基于Graphics的动画创建、播放、控制接口。</p>
 * <p>本类使用了动画模版缓存池，它以一定的内存开销来节省CPU开销，当相同的动画模版被多次使用时，相比于每次都创建新的动画模版，使用动画模版缓存池，只需创建一次，缓存之后多次复用，从而节省了动画模版创建的开销。</p>
 * <p>动画模版缓存池，以key-value键值对存储，key可以自定义，也可以从指定的配置文件中读取，value为对应的动画模版，是一个Graphics对象数组，每个Graphics对象对应一个帧图像，动画的播放实质就是定时切换Graphics对象。</p>
 * <p>使用set source、loadImages(...)、loadAtlas(...)、loadAnimation(...)方法可以创建动画模版。使用play(...)可以播放指定动画。</p>
 * @example <caption>以下示例代码，创建了一个 <code>Text</code> 实例。</caption>
 * package
 * {
 * 	import laya.display.Animation;
 * 	import laya.net.Loader;
 * 	import laya.utils.Handler;
 * 	public class Animation_Example
 * 	{
 * 		public function Animation_Example()
 * 		{
 * 			Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 * 			Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 * 			init();//初始化
 * 		}
 * 		private function init():void
 * 		{
 * 			var animation:Animation = new Animation();//创建一个 Animation 类的实例对象 animation 。
 * 			animation.loadAtlas("resource/ani/fighter.json");//加载图集并播放
 * 			animation.x = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。
 * 			animation.y = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。
 * 			animation.interval = 50;//设置 animation 对象的动画播放间隔时间，单位：毫秒。
 * 			animation.play();//播放动画。
 * 			Laya.stage.addChild(animation);//将 animation 对象添加到显示列表。
 * 		}
 * 	}
 * }
 *
 * @example
 * Animation_Example();
 * function Animation_Example(){
 *     Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 *     Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *     init();//初始化
 * }
 * function init()
 * {
 *     var animation = new Laya.Animation();//创建一个 Animation 类的实例对象 animation 。
 *     animation.loadAtlas("resource/ani/fighter.json");//加载图集并播放
 *     animation.x = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。
 *     animation.y = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。
 *     animation.interval = 50;//设置 animation 对象的动画播放间隔时间，单位：毫秒。
 *     animation.play();//播放动画。
 *     Laya.stage.addChild(animation);//将 animation 对象添加到显示列表。
 * }
 *
 * @example
 * import Animation = laya.display.Animation;
 * class Animation_Example {
 *     constructor() {
 *         Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         this.init();
 *     }
 *     private init(): void {
 *         var animation:Animation = new Laya.Animation();//创建一个 Animation 类的实例对象 animation 。
 *         animation.loadAtlas("resource/ani/fighter.json");//加载图集并播放
 *         animation.x = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。
 *         animation.y = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。
 *         animation.interval = 50;//设置 animation 对象的动画播放间隔时间，单位：毫秒。
 *         animation.play();//播放动画。
 *         Laya.stage.addChild(animation);//将 animation 对象添加到显示列表。
 *     }
 * }
 * new Animation_Example();
 */
export class Animation extends AnimationBase {
    /**
     * <p>动画模版缓存池，以key-value键值对存储，key可以自定义，也可以从指定的配置文件中读取，value为对应的动画模版，是一个Graphics对象数组，每个Graphics对象对应一个帧图像，动画的播放实质就是定时切换Graphics对象。</p>
     * <p>使用loadImages(...)、loadAtlas(...)、loadAnimation(...)、set source方法可以创建动画模版。使用play(...)可以播放指定动画。</p>
     */
    static framesMap: any = {};
    /**@private */
    protected _frames: any[];
    /**@private */
    protected _url: string;

    /**
     * 创建一个新的 <code>Animation</code> 实例。
     */
    constructor() {
        super();
        this._setControlNode(this);
    }

    /** @inheritDoc
     *  @override
     */
    destroy(destroyChild: boolean = true): void {
        this.stop();
        super.destroy(destroyChild);
        this._frames = null;
        this._labels = null;
    }

    /**
     * <p>开始播放动画。会在动画模版缓存池中查找key值为name的动画模版，存在则用此动画模版初始化当前序列帧， 如果不存在，则使用当前序列帧。</p>
     * <p>play(...)方法被设计为在创建实例后的任何时候都可以被调用，调用后就处于播放状态，当相应的资源加载完毕、调用动画帧填充方法(set frames)或者将实例显示在舞台上时，会判断是否处于播放状态，如果是，则开始播放。</p>
     * <p>配合wrapMode属性，可设置动画播放顺序类型。</p>
     * @param	start	（可选）指定动画播放开始的索引(int)或帧标签(String)。帧标签可以通过addLabel(...)和removeLabel(...)进行添加和删除。
     * @param	loop	（可选）是否循环播放。
     * @param	name	（可选）动画模板在动画模版缓存池中的key，也可认为是动画名称。如果name为空，则播放当前动画序列帧；如果不为空，则在动画模版缓存池中寻找key值为name的动画模版，如果存在则用此动画模版初始化当前序列帧并播放，如果不存在，则仍然播放当前动画序列帧；如果没有当前动画的帧数据，则不播放，但该实例仍然处于播放状态。
     * @override
     */
    play(start: any = 0, loop: boolean = true, name: string = ""): void {
        if (name) this._setFramesFromCache(name, true);
        super.play(start, loop, name);
    }

    /**@private */
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

    /**@private 
    *  @override
    */
    protected _frameLoop(): void {
        if (this._visible && this._style.alpha > 0.01 && this._frames) {
            super._frameLoop();
        }
    }

    /**@private 
     * @override
    */
    protected _displayToIndex(value: number): void {
        if (this._frames) this.graphics = this._frames[value];
    }

    /**
     * 当前动画的帧图像数组。本类中，每个帧图像是一个Graphics对象，而动画播放就是定时切换Graphics对象的过程。
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
     * <p>动画数据源。</p>
     * <p>类型如下：<br/>
     * 1. LayaAir IDE动画文件路径：使用此类型需要预加载所需的图集资源，否则会创建失败，如果不想预加载或者需要创建完毕的回调，请使用loadAnimation(...)方法；<br/>
     * 2. 图集路径：使用此类型创建的动画模版不会被缓存到动画模版缓存池中，如果需要缓存或者创建完毕的回调，请使用loadAtlas(...)方法；<br/>
     * 3. 图片路径集合：使用此类型创建的动画模版不会被缓存到动画模版缓存池中，如果需要缓存，请使用loadImages(...)方法。</p>
     * @param value	数据源。比如：图集："xx/a1.atlas"；图片集合："a1.png,a2.png,a3.png"；LayaAir IDE动画"xx/a1.ani"。
     */
    set source(value: string) {
        if (value.indexOf(".ani") > -1) this.loadAnimation(value);
        else if (value.indexOf(".json") > -1 || value.indexOf("als") > -1 || value.indexOf("atlas") > -1) this.loadAtlas(value);
        else this.loadImages(value.split(","));
    }

    /**
     * 设置自动播放的动画名称，在LayaAir IDE中可以创建的多个动画组成的动画集合，选择其中一个动画名称进行播放。
     */
    set autoAnimation(value: string) {
        this.play(0, true, value);
    }

    /**
     * 是否自动播放，默认为false。如果设置为true，则动画被创建并添加到舞台后自动播放。
     */
    set autoPlay(value: boolean) {
        if (value) this.play();
        else this.stop();
    }

    /**
     * 停止动画播放，并清理对象属性。之后可存入对象池，方便对象复用。
     * @override
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
     * <p>根据指定的动画模版初始化当前动画序列帧。选择动画模版的过程如下：1. 动画模版缓存池中key为cacheName的动画模版；2. 如果不存在，则加载指定的图片集合并创建动画模版。注意：只有指定不为空的cacheName，才能将创建好的动画模版以此为key缓存到动画模版缓存池，否则不进行缓存。</p>
     * <p>动画模版缓存池是以一定的内存开销来节省CPU开销，当相同的动画模版被多次使用时，相比于每次都创建新的动画模版，使用动画模版缓存池，只需创建一次，缓存之后多次复用，从而节省了动画模版创建的开销。</p>
     * <p>因为返回值为Animation对象本身，所以可以使用如下语法：loadImages(...).loadImages(...).play(...);。</p>
     * @param	urls		图片路径集合。需要创建动画模版时，会以此为数据源。参数形如：[url1,url2,url3,...]。
     * @param	cacheName	（可选）动画模板在动画模版缓存池中的key。如果此参数不为空，表示使用动画模版缓存池。如果动画模版缓存池中存在key为cacheName的动画模版，则使用此模版。否则，创建新的动画模版，如果cacheName不为空，则以cacheName为key缓存到动画模版缓存池中，如果cacheName为空，不进行缓存。
     * @return 	返回Animation对象本身。
     */
    loadImages(urls: any[], cacheName: string = ""): Animation {
        this._url = "";
        if (!this._setFramesFromCache(cacheName)) {
            this.frames = Animation.framesMap[cacheName] ? Animation.framesMap[cacheName] : Animation.createFrames(urls, cacheName);
        }
        return this;
    }

    /**
     * <p>根据指定的动画模版初始化当前动画序列帧。选择动画模版的过程如下：1. 动画模版缓存池中key为cacheName的动画模版；2. 如果不存在，则加载指定的图集并创建动画模版。</p>
     * <p>注意：只有指定不为空的cacheName，才能将创建好的动画模版以此为key缓存到动画模版缓存池，否则不进行缓存。</p>
     * <p>动画模版缓存池是以一定的内存开销来节省CPU开销，当相同的动画模版被多次使用时，相比于每次都创建新的动画模版，使用动画模版缓存池，只需创建一次，缓存之后多次复用，从而节省了动画模版创建的开销。</p>
     * <p>因为返回值为Animation对象本身，所以可以使用如下语法：loadAtlas(...).loadAtlas(...).play(...);。</p>
     * @param	url			图集路径。需要创建动画模版时，会以此为数据源。
     * @param	loaded		（可选）使用指定图集初始化动画完毕的回调。
     * @param	cacheName	（可选）动画模板在动画模版缓存池中的key。如果此参数不为空，表示使用动画模版缓存池。如果动画模版缓存池中存在key为cacheName的动画模版，则使用此模版。否则，创建新的动画模版，如果cacheName不为空，则以cacheName为key缓存到动画模版缓存池中，如果cacheName为空，不进行缓存。
     * @return 	返回动画本身。
     */
    loadAtlas(url: string, loaded: Handler = null, cacheName: string = ""): Animation {
        this._url = "";
        var _this: Animation = this;
        if (!_this._setFramesFromCache(cacheName)) {
            function onLoaded(loadUrl: string): void {
                if (url === loadUrl) {
                    _this.frames = Animation.framesMap[cacheName] ? Animation.framesMap[cacheName] : Animation.createFrames(url, cacheName);
                    if (loaded) loaded.run();
                }
            }
            if (Loader.getAtlas(url)) onLoaded(url);
            else ILaya.loader.load(url, Handler.create(null, onLoaded, [url]), null, Loader.ATLAS);
        }
        return this;
    }

    /**
     * <p>加载并解析由LayaAir IDE制作的动画文件，此文件中可能包含多个动画。默认帧率为在IDE中设计的帧率，如果调用过set interval，则使用此帧间隔对应的帧率。加载后创建动画模版，并缓存到动画模版缓存池，key "url#动画名称" 对应相应动画名称的动画模板，key "url#" 对应动画模版集合的默认动画模版。</p>
     * <p>注意：如果调用本方法前，还没有预加载动画使用的图集，请将atlas参数指定为对应的图集路径，否则会导致动画创建失败。</p>
     * <p>动画模版缓存池是以一定的内存开销来节省CPU开销，当相同的动画模版被多次使用时，相比于每次都创建新的动画模版，使用动画模版缓存池，只需创建一次，缓存之后多次复用，从而节省了动画模版创建的开销。</p>
     * <p>因为返回值为Animation对象本身，所以可以使用如下语法：loadAnimation(...).loadAnimation(...).play(...);。</p>
     * @param	url 	动画文件路径。可由LayaAir IDE创建并发布。
     * @param	loaded	（可选）使用指定动画资源初始化动画完毕的回调。
     * @param	atlas	（可选）动画用到的图集地址（可选）。
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
        var _this: Animation = this;

        function onLoaded(loadUrl: string): void {
            if (!Loader.getRes(loadUrl)) {
                // 如果getRes失败了，有可能是相同的文件已经被删掉了，因为下面在用完后会立即删除
                // 这时候可以取frameMap中去找，如果找到了，走正常流程。--王伟
                if (Animation.framesMap[url + "#"]) {
                    _this._setFramesFromCache(_this._actionName, true);
                    _this.index = 0;
                    _this._resumePlay();
                    if (loaded) loaded.run();
                }
                return;
            }
            if (url === loadUrl) {
                var tAniO: any;
                if (!Animation.framesMap[url + "#"]) {
                    //此次解析仅返回动画数据，并不真正解析动画graphic数据
                    var aniData: any = GraphicAnimation.parseAnimationData(Loader.getRes(url));
                    if (!aniData) return;
                    //缓存动画数据
                    var aniList: any[] = aniData.animationList;
                    var i: number, len: number = aniList.length;
                    var defaultO: any;
                    for (i = 0; i < len; i++) {
                        tAniO = aniList[i];
                        Animation.framesMap[url + "#" + tAniO.name] = tAniO;
                        if (!defaultO) defaultO = tAniO;
                    }
                    if (defaultO) {
                        Animation.framesMap[url + "#"] = defaultO;
                        _this._setFramesFromCache(_this._actionName, true);
                        _this.index = 0;
                    }
                    _this._resumePlay();
                } else {
                    _this._setFramesFromCache(_this._actionName, true);
                    _this.index = 0;
                    _this._resumePlay();
                }
                if (loaded) loaded.run();
            }
            //清理掉配置
            Loader.clearRes(url);
        }
        if (Loader.getRes(url)) onLoaded(url);
        else ILaya.loader.load(url, Handler.create(null, onLoaded, [url]), null, Loader.JSON);


    }

    /**
     * <p>创建动画模板，多个动画可共享同一份动画模板，而不必每次都创建一份新的，从而节省创建Graphics集合的开销。</p>
     * @param	url			图集路径或者图片路径数组。如果是图集路径，需要相应图集已经被预加载，如果没有预加载，会导致创建失败。
     * @param	name		动画模板在动画模版缓存池中的key。如果不为空，则以此为key缓存动画模板，否则不缓存。
     * @return	动画模板。
     */
    static createFrames(url: string | string[], name: string): any[] {
        var arr: any[];
        if (typeof (url) == 'string') {
            var atlas: any[] = Loader.getAtlas(<string>url);
            if (atlas && atlas.length) {
                arr = [];
                for (var i: number = 0, n: number = atlas.length; i < n; i++) {
                    var g: Graphics = new Graphics();
                    g.drawImage(Loader.getRes(atlas[i]), 0, 0);
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
     * <p>从动画模版缓存池中清除指定key值的动画数据。</p>
     * <p>开发者在调用创建动画模版函数时，可以手动指定此值。而如果是由LayaAir IDE创建的动画集，解析后的key格式为："url#"：表示动画集的默认动画模版，如果以此值为参数，会清除整个动画集数据；"url#aniName"：表示相应名称的动画模版。</p>
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
}

ILaya.regClass(Animation);
ClassUtils.regClass("laya.display.Animation", Animation);
ClassUtils.regClass("Laya.Animation", Animation);