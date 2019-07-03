import { Node } from "./Node";
import { Const } from "../Const";
import { Sprite } from "./Sprite";
import { Event } from "../events/Event";
import { SceneLoader } from "../net/SceneLoader";
import { Resource } from "../resource/Resource";
import { Handler } from "../utils/Handler";
import { SceneUtils } from "../utils/SceneUtils";
import { ILaya } from "../../ILaya";
/**
 * 场景类，负责场景创建，加载，销毁等功能
 * 场景被从节点移除后，并不会被自动垃圾机制回收，如果想回收，请调用destroy接口，可以通过unDestroyedScenes属性查看还未被销毁的场景列表
 */
export class Scene extends Sprite {
    constructor() {
        super();
        /**场景被关闭后，是否自动销毁（销毁节点和使用到的资源），默认为false*/
        this.autoDestroyAtClosed = false;
        /**场景地址*/
        this.url = null;
        /**@private */
        this._viewCreated = false;
        /**@internal */
        this._$componentType = "Scene";
        this._setBit(Const.NOT_READY, true);
        Scene.unDestroyedScenes.push(this);
        this._scene = this;
        this.createChildren();
    }
    /**
     * @private 兼容老项目
     */
    createChildren() {
    }
    /**
     * @private 兼容老项目
     * 装载场景视图。用于加载模式。
     * @param path 场景地址。
     */
    loadScene(path) {
        var url = path.indexOf(".") > -1 ? path : path + ".scene";
        var view = ILaya.loader.getRes(url);
        if (view) {
            this.createView(view);
        }
        else {
            ILaya.loader.resetProgress();
            var loader = new SceneLoader();
            loader.on(Event.COMPLETE, this, this._onSceneLoaded, [url]);
            loader.load(url);
            //Laya.loader.load(url, Handler.create(this, createView), null, Loader.JSON);
        }
    }
    _onSceneLoaded(url) {
        this.createView(ILaya.Loader.getRes(url));
    }
    /**
     * @private 兼容老项目
     * 通过视图数据创建视图。
     * @param uiView 视图数据信息。
     */
    createView(view) {
        if (view && !this._viewCreated) {
            this._viewCreated = true;
            SceneUtils.createByData(this, view);
        }
    }
    /**
     * 根据IDE内的节点id，获得节点实例
     */
    getNodeByID(id) {
        if (this._idMap)
            return this._idMap[id];
        return null;
    }
    /**
     * 打开场景。【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
     * @param	closeOther	是否关闭其他场景，默认为true（可选）
     * @param	param		打开页面的参数，会传递给onOpened方法（可选）
     */
    open(closeOther = true, param = null) {
        if (closeOther)
            Scene.closeAll();
        Scene.root.addChild(this);
        this.onOpened(param);
    }
    /**场景打开完成后，调用此方法（如果有弹出动画，则在动画完成后执行）*/
    onOpened(param) {
        //trace("onOpened");
    }
    /**
     * 关闭场景
     * 【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
     * @param type 关闭的原因，会传递给onClosed函数
     */
    close(type = null) {
        this.onClosed(type);
        if (this.autoDestroyAtClosed)
            this.destroy();
        else
            this.removeSelf();
    }
    /**关闭完成后，调用此方法（如果有关闭动画，则在动画完成后执行）
     * @param type 如果是点击默认关闭按钮触发，则传入关闭按钮的名字(name)，否则为null。
     */
    onClosed(type = null) {
        //trace("onClosed");
    }
    /**@inheritDoc */
    /*override*/ destroy(destroyChild = true) {
        this._idMap = null;
        super.destroy(destroyChild);
        var list = Scene.unDestroyedScenes;
        for (var i = list.length - 1; i > -1; i--) {
            if (list[i] === this) {
                list.splice(i, 1);
                return;
            }
        }
    }
    /**@inheritDoc */
    /*override*/ set scaleX(value) {
        if (super.get_scaleX() == value)
            return;
        super.set_scaleX(value);
        this.event(Event.RESIZE);
    }
    get scaleX() {
        return super.scaleX;
    }
    /**@inheritDoc */
    /*override*/ set scaleY(value) {
        if (super.get_scaleY() == value)
            return;
        super.set_scaleY(value);
        this.event(Event.RESIZE);
    }
    get scaleY() {
        return super.scaleY;
    }
    /**@inheritDoc */
    /*override*/ get width() {
        if (this._width)
            return this._width;
        var max = 0;
        for (var i = this.numChildren - 1; i > -1; i--) {
            var comp = this.getChildAt(i);
            if (comp._visible) {
                max = Math.max(comp._x + comp.width * comp.scaleX, max);
            }
        }
        return max;
    }
    /**@inheritDoc */
    /*override*/ set width(value) {
        if (super.get_width() == value)
            return;
        super.set_width(value);
        this.callLater(this._sizeChanged);
    }
    /**@inheritDoc */
    /*override*/ get height() {
        if (this._height)
            return this._height;
        var max = 0;
        for (var i = this.numChildren - 1; i > -1; i--) {
            var comp = this.getChildAt(i);
            if (comp._visible) {
                max = Math.max(comp._y + comp.height * comp.scaleY, max);
            }
        }
        return max;
    }
    /**@inheritDoc */
    /*override*/ set height(value) {
        if (super.get_height() == value)
            return;
        super.set_height(value);
        this.callLater(this._sizeChanged);
    }
    /**@private */
    _sizeChanged() {
        this.event(Event.RESIZE);
    }
    //////////////////////////////////////静态方法//////////////////////////////////////////
    /**获取场景根容器*/
    static get root() {
        if (!Scene._root) {
            Scene._root = ILaya.stage.addChild(new Sprite());
            Scene._root.name = "root";
            ILaya.stage.on("resize", null, () => {
                Scene._root.size(ILaya.stage.width, ILaya.stage.height);
                Scene._root.event(Event.RESIZE);
            });
            Scene._root.size(ILaya.stage.width, ILaya.stage.height);
            Scene._root.event(Event.RESIZE);
        }
        return Scene._root;
    }
    /**场景时钟*/
    /*override*/ get timer() {
        return this._timer || ILaya.timer;
    }
    set timer(value) {
        this._timer = value;
    }
    /**
     * 加载场景及场景使用到的资源
     * @param	url			场景地址
     * @param	complete	加载完成回调，返回场景实例（可选）
     * @param	progress	加载进度回调（可选）
     */
    static load(url, complete = null, progress = null) {
        ILaya.loader.resetProgress();
        var loader = new SceneLoader();
        loader.on(Event.PROGRESS, null, onProgress);
        loader.once(Event.COMPLETE, null, create);
        loader.load(url);
        function onProgress(value) {
            if (Scene._loadPage)
                Scene._loadPage.event("progress", value);
            progress && progress.runWith(value);
        }
        function create() {
            loader.off(Event.PROGRESS, null, onProgress);
            var obj = ILaya.Loader.getRes(url);
            if (!obj)
                throw "Can not find scene:" + url;
            if (!obj.props)
                throw "Scene data is error:" + url;
            var runtime = obj.props.runtime ? obj.props.runtime : obj.type;
            var clas = ILaya.ClassUtils.getClass(runtime);
            if (obj.props.renderType == "instance") {
                var scene = clas.instance || (clas.instance = new clas());
            }
            else {
                scene = new clas();
            }
            if (scene && scene instanceof Node) {
                scene.url = url;
                if (!scene._getBit(Const.NOT_READY)) {
                    complete && complete.runWith(scene);
                }
                else {
                    scene.on("onViewCreated", null, function () {
                        complete && complete.runWith(scene);
                    });
                    scene.createView(obj);
                }
                Scene.hideLoadingPage();
            }
            else {
                throw "Can not find scene:" + runtime;
            }
        }
    }
    /**
     * 加载并打开场景
     * @param	url			场景地址
     * @param	closeOther	是否关闭其他场景，默认为true（可选），【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
     * @param	param		打开页面的参数，会传递给onOpened方法（可选）
     * @param	complete	打开完成回调，返回场景实例（可选）
     * @param	progress	加载进度回调（可选）
     */
    static open(url, closeOther = true, param = null, complete = null, progress = null) {
        //兼容处理
        if (param instanceof Handler) {
            var temp = complete;
            complete = param;
            param = temp;
        }
        Scene.showLoadingPage();
        Scene.load(url, Handler.create(null, this._onSceneLoaded, [closeOther, complete, param]), progress);
    }
    /**@private */
    static _onSceneLoaded(closeOther, complete, param, scene) {
        scene.open(closeOther, param);
        if (complete)
            complete.runWith(scene);
    }
    /**
     * 根据地址，关闭场景（包括对话框）
     * @param	url		场景地址
     * @param	name	如果name不为空，name必须相同才能关闭
     * @return	返回是否关闭成功，如果url找不到，则不成功
     */
    static close(url, name = "") {
        var flag = false;
        var list = Scene.unDestroyedScenes;
        for (var i = 0, n = list.length; i < n; i++) {
            var scene = list[i];
            if (scene && scene.parent && scene.url === url && scene.name == name) {
                scene.close();
                flag = true;
            }
        }
        return flag;
    }
    /**
     * 关闭所有场景，不包括对话框，如果关闭对话框，请使用Dialog.closeAll()
     * 【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
     */
    static closeAll() {
        var root = Scene.root;
        for (var i = 0, n = root.numChildren; i < n; i++) {
            var scene = root.getChildAt(0);
            if (scene instanceof Scene)
                scene.close();
            else
                scene.removeSelf();
        }
    }
    /**
     * 根据地址，销毁场景（包括对话框）
     * @param	url		场景地址
     * @param	name	如果name不为空，name必须相同才能关闭
     * @return	返回是否销毁成功，如果url找不到，则不成功
     */
    static destroy(url, name = "") {
        var flag = false;
        var list = Scene.unDestroyedScenes;
        for (var i = 0, n = list.length; i < n; i++) {
            var scene = list[i];
            if (scene.url === url && scene.name == name) {
                scene.destroy();
                flag = true;
            }
        }
        return flag;
    }
    /**
     * 销毁当前没有被使用的资源,该函数会忽略lock=true的资源。
     */
    static gc() {
        Resource.destroyUnusedResources();
    }
    /**
     * 设置loading界面，引擎会在调用open方法后，延迟打开loading界面，在页面添加到舞台之后，关闭loading界面
     * @param	loadPage 	load界面实例
     */
    static setLoadingPage(loadPage) {
        if (Scene._loadPage != loadPage) {
            Scene._loadPage = loadPage;
        }
    }
    /**
     * 显示loading界面
     * @param	param 打开参数，如果是scene，则会传递给onOpened方法
     * @param	delay 延迟打开时间，默认500毫秒
     */
    static showLoadingPage(param = null, delay = 500) {
        if (Scene._loadPage) {
            ILaya.systemTimer.clear(null, Scene._showLoading);
            ILaya.systemTimer.clear(null, Scene._hideLoading);
            ILaya.systemTimer.once(delay, null, Scene._showLoading, [param], false);
        }
    }
    static _showLoading(param) {
        ILaya.stage.addChild(Scene._loadPage);
        Scene._loadPage.onOpened(param);
    }
    static _hideLoading() {
        Scene._loadPage.close();
    }
    /**
     * 隐藏loading界面
     * @param	delay 延迟关闭时间，默认500毫秒
     */
    static hideLoadingPage(delay = 500) {
        if (Scene._loadPage) {
            ILaya.systemTimer.clear(null, Scene._showLoading);
            ILaya.systemTimer.clear(null, Scene._hideLoading);
            ILaya.systemTimer.once(delay, null, Scene._hideLoading);
        }
    }
}
/**创建后，还未被销毁的场景列表，方便查看还未被销毁的场景列表，方便内存管理，本属性只读，请不要直接修改*/
Scene.unDestroyedScenes = [];
