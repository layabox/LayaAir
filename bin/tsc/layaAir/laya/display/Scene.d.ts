import { Sprite } from "./Sprite";
import { Handler } from "../utils/Handler";
import { Timer } from "../utils/Timer";
/**
 * 场景类，负责场景创建，加载，销毁等功能
 * 场景被从节点移除后，并不会被自动垃圾机制回收，如果想回收，请调用destroy接口，可以通过unDestroyedScenes属性查看还未被销毁的场景列表
 */
export declare class Scene extends Sprite {
    /**创建后，还未被销毁的场景列表，方便查看还未被销毁的场景列表，方便内存管理，本属性只读，请不要直接修改*/
    static unDestroyedScenes: any[];
    /**获取根节点*/
    private static _root;
    /**@private */
    private static _loadPage;
    /**场景被关闭后，是否自动销毁（销毁节点和使用到的资源），默认为false*/
    autoDestroyAtClosed: boolean;
    /**场景地址*/
    url: string;
    /**场景时钟*/
    private _timer;
    /**@private */
    private _viewCreated;
    /**@private */
    _idMap: any;
    /**@private */
    _$componentType: string;
    constructor();
    /**
     * @private 兼容老项目
     */
    protected createChildren(): void;
    /**
     * @private 兼容老项目
     * 装载场景视图。用于加载模式。
     * @param path 场景地址。
     */
    loadScene(path: string): void;
    private _onSceneLoaded;
    /**
     * @private 兼容老项目
     * 通过视图数据创建视图。
     * @param uiView 视图数据信息。
     */
    createView(view: any): void;
    /**
     * 根据IDE内的节点id，获得节点实例
     */
    getNodeByID(id: number): any;
    /**
     * 打开场景。【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
     * @param	closeOther	是否关闭其他场景，默认为true（可选）
     * @param	param		打开页面的参数，会传递给onOpened方法（可选）
     */
    open(closeOther?: boolean, param?: any): void;
    /**场景打开完成后，调用此方法（如果有弹出动画，则在动画完成后执行）*/
    onOpened(param: any): void;
    /**
     * 关闭场景
     * 【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
     * @param type 关闭的原因，会传递给onClosed函数
     */
    close(type?: string): void;
    /**关闭完成后，调用此方法（如果有关闭动画，则在动画完成后执行）
     * @param type 如果是点击默认关闭按钮触发，则传入关闭按钮的名字(name)，否则为null。
     */
    onClosed(type?: string): void;
    /**@inheritDoc */
    destroy(destroyChild?: boolean): void;
    /**@inheritDoc */
    scaleX: number;
    /**@inheritDoc */
    scaleY: number;
    /**@inheritDoc */
    /**@inheritDoc */
    /*override*/ width: number;
    /**@inheritDoc */
    /**@inheritDoc */
    /*override*/ height: number;
    /**@private */
    protected _sizeChanged(): void;
    /**获取场景根容器*/
    static readonly root: Sprite;
    /**场景时钟*/
    timer: Timer;
    /**
     * 加载场景及场景使用到的资源
     * @param	url			场景地址
     * @param	complete	加载完成回调，返回场景实例（可选）
     * @param	progress	加载进度回调（可选）
     */
    static load(url: string, complete?: Handler, progress?: Handler): void;
    /**
     * 加载并打开场景
     * @param	url			场景地址
     * @param	closeOther	是否关闭其他场景，默认为true（可选），【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
     * @param	param		打开页面的参数，会传递给onOpened方法（可选）
     * @param	complete	打开完成回调，返回场景实例（可选）
     * @param	progress	加载进度回调（可选）
     */
    static open(url: string, closeOther?: boolean, param?: any, complete?: Handler, progress?: Handler): void;
    /**@private */
    private static _onSceneLoaded;
    /**
     * 根据地址，关闭场景（包括对话框）
     * @param	url		场景地址
     * @param	name	如果name不为空，name必须相同才能关闭
     * @return	返回是否关闭成功，如果url找不到，则不成功
     */
    static close(url: string, name?: string): boolean;
    /**
     * 关闭所有场景，不包括对话框，如果关闭对话框，请使用Dialog.closeAll()
     * 【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
     */
    static closeAll(): void;
    /**
     * 根据地址，销毁场景（包括对话框）
     * @param	url		场景地址
     * @param	name	如果name不为空，name必须相同才能关闭
     * @return	返回是否销毁成功，如果url找不到，则不成功
     */
    static destroy(url: string, name?: string): boolean;
    /**
     * 销毁当前没有被使用的资源,该函数会忽略lock=true的资源。
     */
    static gc(): void;
    /**
     * 设置loading界面，引擎会在调用open方法后，延迟打开loading界面，在页面添加到舞台之后，关闭loading界面
     * @param	loadPage 	load界面实例
     */
    static setLoadingPage(loadPage: Scene): void;
    /**
     * 显示loading界面
     * @param	param 打开参数，如果是scene，则会传递给onOpened方法
     * @param	delay 延迟打开时间，默认500毫秒
     */
    static showLoadingPage(param?: any, delay?: number): void;
    private static _showLoading;
    private static _hideLoading;
    /**
     * 隐藏loading界面
     * @param	delay 延迟关闭时间，默认500毫秒
     */
    static hideLoadingPage(delay?: number): void;
}
