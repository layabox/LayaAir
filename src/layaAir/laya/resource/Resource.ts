import { ILaya } from "../../ILaya";
import { EventDispatcher } from "../events/EventDispatcher";

var _idCounter: number = 0;
var _disposingCounter: number = 0;
var _clearRetry: number = 0;

/**
 * <code>Resource</code> 资源存取类。
 */
export class Resource extends EventDispatcher {
    /** @private */
    static _idResourcesMap: any = {};
    /** @private 以字节为单位。*/
    private static _cpuMemory: number = 0;
    /** @private 以字节为单位。*/
    private static _gpuMemory: number = 0;
    /**是否开启debug模式 */
    static DEBUG: boolean = false;

    /**
     * 当前内存，以字节为单位。
     */
    static get cpuMemory(): number {
        return Resource._cpuMemory;
    }

    /**
     * 当前显存，以字节为单位。
     */
    static get gpuMemory(): number {
        return Resource._gpuMemory;
    }

    /**
     * @internal
     */
    static _addCPUMemory(size: number): void {
        Resource._cpuMemory += size;
    }

    /**
     * @internal
     */
    static _addGPUMemory(size: number): void {
        Resource._gpuMemory += size;
    }

    /**
     * @internal
     */
    static _addMemory(cpuSize: number, gpuSize: number): void {
        Resource._cpuMemory += cpuSize;
        Resource._gpuMemory += gpuSize;
    }

    /**
     * 销毁当前没有被使用的资源,该函数会忽略lock=true的资源。
     */
    static destroyUnusedResources(): void {
        _disposingCounter = 0; //复位一下，避免异常造成的标志错误
        _clearRetry = 0;

        if (!ILaya.loader.loading)
            Resource._destroyUnusedResources(true);
        else
            ILaya.timer.frameLoop(1, Resource, Resource._destroyUnusedResources);
    }

    /** @private */
    private static _destroyUnusedResources(force: boolean): void {
        if (!force && ILaya.loader.loading)
            return;

        ILaya.timer.clear(Resource, Resource._destroyUnusedResources);
        let destroyCnt = 0;

        for (let k in Resource._idResourcesMap) {
            let res: Resource = Resource._idResourcesMap[k];
            if (!res.lock && res._referenceCount === 0) {
                res.destroy();
                destroyCnt++;
            }
        }

        if (Resource.DEBUG && destroyCnt > 0)
            console.debug(`destroyUnusedResources(${destroyCnt})`);

        if (destroyCnt > 0 && _clearRetry < 5) {
            _clearRetry++;
            ILaya.timer.frameLoop(1, Resource, Resource._destroyUnusedResources);
        }
    }

    private _cpuMemory: number = 0;
    private _gpuMemory: number = 0;
    protected _id: number = 0;
    protected _destroyed?: boolean;
    protected _referenceCount: number = 0;
    protected _obsolute: boolean;

    /**是否加锁，如果true为不能使用自动释放机制。*/
    lock?: boolean;
    /**名称。 */
    name?: string;
    /**获取资源的URL地址。 */
    url: string;
    /**获取资源的UUID。 */
    uuid: string;

    /**是否在引用计数为0的时候立马删除他 */
    destroyedImmediately: boolean;

    /**
     * 获取唯一标识ID,通常用于识别。
     */
    get id(): number {
        return this._id;
    }

    /**
     * 内存大小。
     */
    get cpuMemory(): number {
        return this._cpuMemory;
    }

    /**
     * 显存大小。
     */
    get gpuMemory(): number {
        return this._gpuMemory;
    }

    /**
     * 是否已销毁。
     */
    get destroyed(): boolean {
        return this._destroyed;
    }


    /** 如果设置一个已缓存的资源obsolute为true，则
     * 1）getRes仍然可以返回这个资源；
     * 2）下次加载时会忽略这个缓存而去重新加载。。
     */
    get obsolute(): boolean {
        return this._obsolute;
    }

    set obsolute(value: boolean) {
        this._obsolute = value;
    }

    /**
     * 获取资源的引用计数。
     */
    get referenceCount(): number {
        return this._referenceCount;
    }

    /**
     * 创建一个 <code>Resource</code> 实例。
     * @param managed 如果设置为true，则在destroyUnusedResources时会检测引用计数并自动释放如果计数为0。默认为true。
     */
    protected constructor(managed?: boolean) {
        super();

        this._id = ++_idCounter;
        this._destroyed = false;
        this._referenceCount = 0;
        if (managed == null || managed)
            Resource._idResourcesMap[this.id] = this;
        this.lock = false;
        this.destroyedImmediately = true;
    }

    _setCPUMemory(value: number): void {
        var offsetValue: number = value - this._cpuMemory;
        this._cpuMemory = value;
        Resource._addCPUMemory(offsetValue);
    }

    _setGPUMemory(value: number): void {
        var offsetValue: number = value - this._gpuMemory;
        this._gpuMemory = value;
        Resource._addGPUMemory(offsetValue);
    }

    _setCreateURL(url: string, uuid?: string): void {
        this.url = url;
        this.uuid = uuid;
    }

    /**
     * 返回资源是否从指定url创建
     */
    isCreateFromURL(url: string): boolean {
        return this.uuid && url.length === this.uuid.length + 6 && url.endsWith(this.uuid)
            || this.url === url;
    }

    _addReference(count: number = 1): void {
        this._referenceCount += count;
    }

    _removeReference(count: number = 1): void {
        this._referenceCount -= count;
        //如果_removeReference发生在destroy中，可能是在collect或者处理内嵌资源的释放
        if (_disposingCounter > 0 && this._referenceCount <= 0 && !this.lock && this.destroyedImmediately) {
            this.destroy();
        }
    }

    /**
     * 清除引用
     */
    _clearReference(): void {
        this._referenceCount = 0;
    }

    protected _recoverResource(): void {
    }

    protected _disposeResource(): void {
    }

    protected _activeResource(): void {

    }

    /**
     * 销毁资源,销毁后资源不能恢复。
     */
    destroy(): void {
        if (this._destroyed)
            return;

        this._destroyed = true;
        this.lock = false; //解锁资源，强制清理
        _disposingCounter++;
        this._disposeResource();
        _disposingCounter--;
        this.offAll();
        delete Resource._idResourcesMap[this.id];
        if (this.url) {
            if (Resource.DEBUG)
                console.debug(`destroy ${Object.getPrototypeOf(this).constructor.name} ${this.url}`);
            ILaya.loader.clearRes(this.url, this);
        }
    }
}