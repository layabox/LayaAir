import { Sprite } from "./Sprite";
import { Widget } from "../components/Widget";
import { Event } from "../events/Event"
import { Resource } from "../resource/Resource"
import { Handler } from "../utils/Handler"
import { Timer } from "../utils/Timer"
import { ILaya } from "../../ILaya";
import { Prefab } from "../resource/HierarchyResource";
import { LegacyUIParser } from "../loaders/LegacyUIParser";
import { NodeFlags } from "../Const";
import { ILaya3D } from "../../ILaya3D";

/**
 * 场景类，负责场景创建，加载，销毁等功能
 * 场景被从节点移除后，并不会被自动垃圾机制回收，如果想回收，请调用destroy接口，可以通过unDestroyedScenes属性查看还未被销毁的场景列表
 */
export class Scene extends Sprite {
    /**创建后，还未被销毁的场景列表，方便查看还未被销毁的场景列表，方便内存管理，本属性只读，请不要直接修改*/
    static readonly unDestroyedScenes: Set<Scene> = new Set();
    /**获取根节点*/
    private static _root: Sprite;
    /**@private */
    private static _loadPage: Sprite;

    /**场景被关闭后，是否自动销毁（销毁节点和使用到的资源），默认为false*/
    autoDestroyAtClosed: boolean = false;
    /**@internal */
    _idMap?: any;
    _scene3D:any;

    /**@private 相对布局组件*/
    protected _widget: Widget;
    /**X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。*/
    protected _anchorX: number = null;
    /**Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。*/
    protected _anchorY: number = null;

    /**场景时钟*/
    private _timer: Timer;
    /**@private */
    private _viewCreated: boolean = false;

    constructor(createChildren = true) {
        super();

        this._timer = ILaya.timer;
        this._widget = Widget.EMPTY;

        this._scene = this;
        if (createChildren)
            this.createChildren();
    }

    /**
     * @private 兼容老项目
     */
    protected createChildren(): void {
    }

    /**
     * 兼容加载模式
     * 加载模式设置uimap
     * @param url uimapJosn的url
     */
    static setUIMap(url: string): void {
        let uimap = ILaya.loader.getRes(url);
        if (uimap) {
            for (let key in uimap) {
                ILaya.Loader.loadedMap[key + ".scene"] = uimap[key];
            }
        } else {
            throw "请提前加载uimap的json，再使用该接口设置！";
        }
    }

    /**
     * @private 兼容老项目
     * 装载场景视图。用于加载模式。
     * @param path 场景地址。
     */
    loadScene(path: string): void {
        Scene.unDestroyedScenes.add(this);
        let url: string = path.indexOf(".") > -1 ? path : path + ".scene";
        let content: Prefab = ILaya.loader.getRes(url);
        if (content) {
            if (!this._viewCreated) {
                content.create({ root: this });
                this._viewCreated = true;
                Scene.unDestroyedScenes.add(this);
            }
        } else {
            this._setBit(NodeFlags.NOT_READY, true);
            ILaya.loader.load(url, null, value => {
                if (Scene._loadPage) Scene._loadPage.event("progress", value);
            }).then((content: Prefab) => {
                if (!content) throw "Can not find scene:" + path;
                if (!this._viewCreated) {
                    this.url = url;
                    Scene.hideLoadingPage();

                    content.create({ root: this });
                    this._viewCreated = true;
                    Scene.unDestroyedScenes.add(this);
                }
                else
                    this._setBit(NodeFlags.NOT_READY, false);
            });
        }
    }

    /**
     * @private 兼容老项目
     * 通过视图数据创建视图。
     * @param uiView 视图数据信息。
     */
    createView(view: any): void {
        if (view && !this._viewCreated) {
            this._viewCreated = true;
            LegacyUIParser.createByData(this, view);
        }
    }

    /**
    * 根据IDE内的节点id，获得节点实例
    */
    getNodeByID(id: number): any {
        if (this._idMap) return this._idMap[id];
        return null;
    }

    /**
     * 打开场景。【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
     * @param	closeOther	是否关闭其他场景，默认为true（可选）
     * @param	param		打开页面的参数，会传递给onOpened方法（可选）
     */
    open(closeOther: boolean = true, param: any = null): void {
        if (closeOther) Scene.closeAll();
        Scene.root.addChild(this);
        if (this._scene3D)
            ILaya.stage.addChildAt(this._scene3D, 0);
        this.onOpened(param);
    }

    /**场景打开完成后，调用此方法（如果有弹出动画，则在动画完成后执行）*/
    onOpened(param: any): void {
        //trace("onOpened");
    }

    /**
     * 关闭场景
     * 【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
     * @param type 关闭的原因，会传递给onClosed函数
     */
    close(type: string = null): void {
        this.onClosed(type);
        if (this.autoDestroyAtClosed) {
            this.destroy();
            if (this._scene3D)
                this._scene3D.destroy();
        }
        else {
            this.removeSelf();
            if (this._scene3D)
                this._scene3D.removeSelf();
        }
    }

    /**
     * 关闭完成后，调用此方法（如果有关闭动画，则在动画完成后执行）
     * @param type 如果是点击默认关闭按钮触发，则传入关闭按钮的名字(name)，否则为null。
     */
    onClosed(type: string = null): void {
        //trace("onClosed");
    }

    /**
     * @inheritDoc 
     * @override
     */
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        if (this._scene3D) {
            this._scene3D.destroy();
            this._scene3D = null;
        }

        this._idMap = null;
        Scene.unDestroyedScenes.delete(this);
    }

    /**
     * @inheritDoc 
     * @override
     */
    set scaleX(value: number) {
        if (super.get_scaleX() == value) return;
        super.set_scaleX(value);
        this.event(Event.RESIZE);
    }
    /**
     * @inheritDoc 
     * @override
     */
    get scaleX() {
        return super.scaleX;
    }

    /**
     * @inheritDoc 
     * @override
     */
    set scaleY(value: number) {
        if (super.get_scaleY() == value) return;
        super.set_scaleY(value);
        this.event(Event.RESIZE);
    }
    /**
     * @inheritDoc 
     * @override
     */
    get scaleY() {
        return super.scaleY;
    }

    /**
     * @inheritDoc 
     * @override
     */
    get width(): number {
        if (this._width) return this._width;
        var max: number = 0;
        for (var i: number = this.numChildren - 1; i > -1; i--) {
            var comp: Sprite = (<Sprite>this.getChildAt(i));
            if (comp._visible) {
                max = Math.max(comp._x + comp.width * comp.scaleX, max);
            }
        }
        return max;
    }

    /**
     * @inheritDoc 
     * @override
     */
    set width(value: number) {
        if (super.get_width() == value) return;
        super.set_width(value);
        this.callLater(this._sizeChanged);
    }

    /**
     * @inheritDoc 
     * @override
     */
    get height(): number {
        if (this._height) return this._height;
        var max: number = 0;
        for (var i: number = this.numChildren - 1; i > -1; i--) {
            var comp: Sprite = (<Sprite>this.getChildAt(i));
            if (comp._visible) {
                max = Math.max(comp._y + comp.height * comp.scaleY, max);
            }
        }
        return max;
    }

    /**
     * @inheritDoc 
     * @override
     */
    set height(value: number) {
        if (super.get_height() == value) return;
        super.set_height(value);
        this.callLater(this._sizeChanged);
    }

    /**
     * 场景时钟
     * @override
     */
    get timer(): Timer {
        return this._timer;
    }

    set timer(value: Timer) {
        this._timer = value;
    }

    get scene3D() {
        return this._scene3D;
    }

    /**
     * <p>从组件顶边到其内容区域顶边之间的垂直距离（以像素为单位）。</p>
     */
    get top(): number {
        return this._widget.top;
    }

    set top(value: number) {
        if (value != this._widget.top) {
            this._getWidget().top = value;
        }
    }

    /**
     * <p>从组件底边到其内容区域底边之间的垂直距离（以像素为单位）。</p>
     */
    get bottom(): number {
        return this._widget.bottom;
    }

    set bottom(value: number) {
        if (value != this._widget.bottom) {
            this._getWidget().bottom = value;
        }
    }

    /**
     * <p>从组件左边到其内容区域左边之间的水平距离（以像素为单位）。</p>
     */
    get left(): number {
        return this._widget.left;
    }

    set left(value: number) {
        if (value != this._widget.left) {
            this._getWidget().left = value;
        }
    }

    /**
     * <p>从组件右边到其内容区域右边之间的水平距离（以像素为单位）。</p>
     */
    get right(): number {
        return this._widget.right;
    }

    set right(value: number) {
        if (value != this._widget.right) {
            this._getWidget().right = value;
        }
    }

    /**
     * <p>在父容器中，此对象的水平方向中轴线与父容器的水平方向中心线的距离（以像素为单位）。</p>
     */
    get centerX(): number {
        return this._widget.centerX;
    }

    set centerX(value: number) {
        if (value != this._widget.centerX) {
            this._getWidget().centerX = value;
        }
    }

    /**
     * <p>在父容器中，此对象的垂直方向中轴线与父容器的垂直方向中心线的距离（以像素为单位）。</p>
     */
    get centerY(): number {
        return this._widget.centerY;
    }

    set centerY(value: number) {
        if (value != this._widget.centerY) {
            this._getWidget().centerY = value;
        }
    }

    /**X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。*/
    get anchorX(): number {
        return this._anchorX;
    }

    set anchorX(value: number) {
        if (this._anchorX != value) {
            this._anchorX = value;
            this.callLater(this._sizeChanged);
        }
    }

    /**Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。*/
    get anchorY(): number {
        return this._anchorY;
    }

    set anchorY(value: number) {
        if (this._anchorY != value) {
            this._anchorY = value
            this.callLater(this._sizeChanged);
        }
    }

    /**
     * @private 
     * @override
    */
    protected _sizeChanged(): void {
        if (this._anchorX != null) this.pivotX = this.anchorX * this.width;
        if (this._anchorY != null) this.pivotY = this.anchorY * this.height;
        this.event(Event.RESIZE);
        if (this._widget != Widget.EMPTY) {
            this._widget.resetLayout();
        }
    }

    /**
     * 重新排版
     */
    freshLayout() {
        if (this._widget != Widget.EMPTY) {
            this._widget.resetLayout();
        }
    }

    /**
     * @private
     * <p>获取对象的布局样式。请不要直接修改此对象</p>
     */
    private _getWidget(): Widget {
        this._widget === Widget.EMPTY && (this._widget = this.addComponent(Widget));
        return this._widget;
    }

    //////////////////////////////////////静态方法//////////////////////////////////////////

    /**获取场景根容器*/
    static get root(): Sprite {
        let root = Scene._root;
        if (!root) {
            root = Scene._root = (<Sprite>ILaya.stage.addChild(new Sprite()));
            root.name = "root";
            root.mouseThrough = true;
            ILaya.stage.on("resize", null, () => {
                root.size(ILaya.stage.width, ILaya.stage.height);
                root.event(Event.RESIZE);
            });
            root.size(ILaya.stage.width, ILaya.stage.height);
            root.event(Event.RESIZE);
        }
        return root;
    }

    /**
     * 加载场景及场景使用到的资源
     * @param	url			场景地址
     * @param	complete	加载完成回调，返回场景实例（可选）
     * @param	progress	加载进度回调（可选）
     */
    static load(url: string, complete: Handler = null, progress: Handler = null): Promise<Scene> {
        return ILaya.loader.load(url, null, value => {
            if (Scene._loadPage) Scene._loadPage.event("progress", value);
            progress && progress.runWith(value);
        }).then((content: Prefab) => {
            if (!content) throw "Can not find scene:" + url;

            let scene: Scene;
            let errors: Array<any> = [];
            let ret = content.create(null, errors);
            if (errors.length > 0)
                console.warn(`Error loading ${url}: \n${errors}`);

            if (ret instanceof Scene)
                scene = ret;
            else if (ret instanceof ILaya3D.Scene3D) {
                scene = new Scene();
                scene.left = scene.right = scene.top = scene.bottom = 0;
                scene._scene3D = ret;
            }
            else
                throw "Not a scene:" + url;

            scene._viewCreated = true;
            Scene.hideLoadingPage();
            complete && complete.runWith(scene);

            return scene;
        });
    }

    /**
     * 加载并打开场景
     * @param	url			场景地址
     * @param	closeOther	是否关闭其他场景，默认为true（可选），【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
     * @param	param		打开页面的参数，会传递给onOpened方法（可选）
     * @param	complete	打开完成回调，返回场景实例（可选）
     * @param	progress	加载进度回调（可选）
     */
    static open(url: string, closeOther: boolean = true, param: any = null, complete: Handler = null, progress: Handler = null): Promise<Scene> {
        //兼容处理
        if (param instanceof Handler) {
            var temp: any = complete;
            complete = param;
            param = temp;
        }
        Scene.showLoadingPage();
        return Scene.load(url, Handler.create(null, this._onSceneLoaded, [closeOther, complete, param]), progress);
    }

    /**@private */
    private static _onSceneLoaded(closeOther: boolean, complete: Handler, param: any, scene: Scene): void {
        scene.open(closeOther, param);
        if (complete) complete.runWith(scene);
    }

    /**
     * 根据地址，关闭场景（包括对话框）
     * @param	url		场景地址
     * @param	name	如果name不为空，name必须相同才能关闭
     * @return	返回是否关闭成功，如果url找不到，则不成功
     */
    static close(url: string, name?: string): boolean {
        let flag: boolean = false;
        for (let scene of Scene.unDestroyedScenes) {
            if (scene && scene.parent && scene.url === url && (name == null || scene.name == name)) {
                scene.close();
                flag = true;
                break;
            }
        }
        return flag;
    }

    /**
     * 关闭所有场景，不包括对话框，如果关闭对话框，请使用Dialog.closeAll()
     * 【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
     */
    static closeAll(): void {
        let root: Sprite = Scene.root;
        for (let i = 0, n = root.numChildren; i < n; i++) {
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
    static destroy(url: string, name?: string): boolean {
        let flag: boolean = false;
        for (let scene of Scene.unDestroyedScenes) {
            if (scene.url === url && (name == null || scene.name == name) && !scene._destroyed) {
                scene.destroy();
                flag = true;
                break;
            }
        }
        return flag;
    }

    /**
     * 销毁当前没有被使用的资源,该函数会忽略lock=true的资源。
     */
    static gc(): void {
        Resource.destroyUnusedResources();
    }

    /**
     * 设置loading界面，引擎会在调用open方法后，延迟打开loading界面，在页面添加到舞台之后，关闭loading界面
     * @param	loadPage 	load界面实例
     */
    static setLoadingPage(loadPage: Sprite): void {
        Scene._loadPage = loadPage;
    }

    /**
     * 显示loading界面
     * @param	param 打开参数，如果是scene，则会传递给onOpened方法
     * @param	delay 延迟打开时间，默认500毫秒
     */
    static showLoadingPage(param: any = null, delay: number = 500): void {
        if (Scene._loadPage) {
            ILaya.systemTimer.clear(null, Scene._showLoading);
            ILaya.systemTimer.clear(null, Scene._hideLoading);
            ILaya.systemTimer.once(delay, null, Scene._showLoading, [param], false);
        }
    }

    private static _showLoading(param: any): void {
        ILaya.stage.addChild(Scene._loadPage);
        if (Scene._loadPage instanceof Scene)
            Scene._loadPage.onOpened(param);
    }

    private static _hideLoading(): void {
        if (Scene._loadPage instanceof Scene)
            Scene._loadPage.close();
        else
            Scene._loadPage.removeSelf();
    }

    /**
     * 隐藏loading界面
     * @param	delay 延迟关闭时间，默认500毫秒
     */
    static hideLoadingPage(delay: number = 500): void {
        if (Scene._loadPage) {
            ILaya.systemTimer.clear(null, Scene._showLoading);
            ILaya.systemTimer.clear(null, Scene._hideLoading);
            ILaya.systemTimer.once(delay, null, Scene._hideLoading);
        }
    }
}