import { LayaEnv } from "../../LayaEnv";
import { ILaya } from "../../ILaya";
import { EventDispatcher } from "../events/EventDispatcher";

var _idCounter: number = 0;
var _disposingCounter: number = 0;
var _clearRetry: number = 0;

/**
 * @en The `Resource` class used for resource access.
 * @zh `Resource` 类用于资源存取。
 */
export class Resource extends EventDispatcher {
    /**@ignore */
    static _idResourcesMap: any = {};
    /** 以字节为单位。*/
    private static _cpuMemory: number = 0;
    /** 以字节为单位。*/
    private static _gpuMemory: number = 0;
    /**
     * @en Whether the debug mode is enabled.
     * @zh 是否开启调试模式。
     */
    static DEBUG: boolean = false;

    /**
     * @en The current CPU memory, in bytes.
     * @zh 当前内存，以字节为单位。
     */
    static get cpuMemory(): number {
        return Resource._cpuMemory;
    }

    /**
     * @en The current GPU memory, in bytes.
     * @zh 当前显存，以字节为单位。
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
     * @en Destroy unused resources, this function will ignore resources with lock=true.
     * @zh 销毁当前没有被使用的资源,该函数会忽略lock=true的资源。
     */
    static destroyUnusedResources(): void {
        _disposingCounter = 0; //复位一下，避免异常造成的标志错误
        _clearRetry = 0;

        if (!ILaya.loader.loading)
            Resource._destroyUnusedResources(true);
        else
            ILaya.timer.frameLoop(1, Resource, Resource._destroyUnusedResources);
    }

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
    _id: number = 0;
    protected _destroyed?: boolean;
    protected _referenceCount: number = 0;
    protected _obsolute: boolean;
    protected _deps: Array<Resource>;
    /** 是否建立引用跟踪链。 */
    protected _traceDeps: boolean;

    /**
     * @en Whether to lock the resource, if true, the resource cannot be automatically released.
     * @zh 是否加锁，如果true为不能使用自动释放机制。
     */
    lock?: boolean;
    /**
     * @en The name of the resource.
     * @zh 资源名称。
     */
    name?: string;
    /**
     * @en The URL of the resource.
     * @zh 获取资源的URL地址。
     */
    url: string;
    /**
     * @en The UUID of the resource.
     * @zh 获取资源的UUID。
     */
    uuid: string;

    /**
     * @en Whether to delete the resource immediately when the reference count is 0.
     * @zh 是否在引用计数为0的时候立马删除他 
     */
    destroyedImmediately: boolean;

    /**
     * @en Unique identifier ID, usually used for identification.
     * @zh 唯一标识ID,通常用于识别。
     */
    get id(): number {
        return this._id;
    }

    /**
     * @en CPU memory size.
     * @zh 内存大小。
     */
    get cpuMemory(): number {
        return this._cpuMemory;
    }

    /**
     * @en GPU memory size.
     * @zh 显存大小。
     */
    get gpuMemory(): number {
        return this._gpuMemory;
    }

    /**
     * @en Whether the resource has been destroyed.
     * @zh 是否已销毁。
     */
    get destroyed(): boolean {
        return this._destroyed;
    }

    /** 
     * @en If a cached resource observer is set to true, then:
     * - 1) getRes will still return this resource;
     * - 2) next time loading will ignore this cached resource and reload it.
     * @zh 如果设置一个已缓存的资源obsolute为true，则
     * - 1）getRes仍然可以返回这个资源；
     * - 2）下次加载时会忽略这个缓存而去重新加载。。
     */
    get obsolute(): boolean {
        return this._obsolute;
    }

    set obsolute(value: boolean) {
        if (this._obsolute != value) {
            this._obsolute = value;

            if (value && !LayaEnv.isPlaying)
                this.event("obsolute");
        }
    }

    /**
     * @en The list of dependencies for the resource.
     * @zh 资源的依赖列表。
     */
    get deps(): ReadonlyArray<Resource> {
        return this._deps;
    }

    /**
     * @en The reference count of the resource.
     * @zh 资源的引用计数。
     */
    get referenceCount(): number {
        return this._referenceCount;
    }

    /**
     * @en Creates an instance of Resource.
     * @param managed If set to true, the resource will be automatically released when the reference count is 0. Default is true.
     * @zh 创建一个 Resource 实例。
     * @param managed 如果设置为true，则在destroyUnusedResources时会检测引用计数并自动释放如果计数为0。默认为true。
     */
    protected constructor(managed?: boolean) {
        super();

        this._id = ++_idCounter;
        this._destroyed = false;
        this._referenceCount = 0;
        if (managed == null || managed)
            Resource._idResourcesMap[this._id] = this;
        this.lock = false;
        this.destroyedImmediately = true;
        this._deps = [];
        this._traceDeps = false;
    }

    /**
     * @en Adjusts the cpu memory usage by the specified value.
     * @param value The amount by which to adjust the CPU memory usage.
     * @zh 根据指定的值调整内存使用量。
     * @param value 要调整的内存使用量。
     */
    _setCPUMemory(value: number): void {
        var offsetValue: number = value - this._cpuMemory;
        this._cpuMemory = value;
        Resource._addCPUMemory(offsetValue);
    }

    /**
     * @en Adjusts the GPU memory usage by the specified value.
     * @param value The amount by which to adjust the GPU memory usage.
     * @zh 根据指定的值调整显存使用量。
     * @param value 要调整的显存使用量。
     */
    _setGPUMemory(value: number): void {
        var offsetValue: number = value - this._gpuMemory;
        this._gpuMemory = value;
        Resource._addGPUMemory(offsetValue);
    }

    /**
     * @en Sets the URL and UUID used to create this resource.
     * @param url The URL used to create the resource.
     * @param uuid The optional UUID of the resource.
     * @zh 设置用于创建此资源的 URL 和 UUID。
     * @param url 用于创建资源的 URL。
     * @param uuid 资源的可选UUID。
     */
    _setCreateURL(url: string, uuid?: string): void {
        this.url = url;
        this.uuid = uuid;
    }

    /**
     * @en Checks if the resource is created from the specified URL.
     * @param url The URL to check against the resource's creation URL.
     * @returns True if the resource is created from the specified URL, otherwise false.
     * @zh 检查资源是否从指定的 URL 创建。
     * @param url 要检查的资源创建 URL。
     * @returns 如果资源是从指定的 URL 创建的，则返回 true，否则返回 false。
     */
    isCreateFromURL(url: string): boolean {
        return this.uuid && url.length === this.uuid.length + 6 && url.endsWith(this.uuid)
            || this.url === url;
    }

    /**
     * @en Increments the reference count of the resource by the specified amount.
     * @param count The amount by which to increment the reference count, default is 1.
     * @zh 按指定数量增加资源的引用计数。
     * @param count 要增加的引用计数，默认为1。
     */
    _addReference(count: number = 1): void {
        this._referenceCount += count;
    }

    /**
     * @en Decrements the reference count of the resource by the specified amount. If the reference count reaches zero and certain conditions are met, the resource may be destroyed.
     * @param count The amount by which to decrement the reference count, default is 1.
     * @zh 按指定数量减少资源的引用计数。如果引用计数达到零并且满足特定条件，资源可能会被销毁。
     * @param count 要减少的引用计数，默认为1。
     */
    _removeReference(count: number = 1): void {
        this._referenceCount -= count;
        //如果_removeReference发生在destroy中，可能是在collect或者处理内嵌资源的释放
        if (_disposingCounter > 0 && this._referenceCount <= 0 && !this.lock && this.destroyedImmediately) {
            this.destroy();
        }
    }

    /**
     * @en Clears the reference count of the resource.
     * @zh 清除引用
     */
    _clearReference(): void {
        this._referenceCount = 0;
    }

    /**
     * 增加一个依赖内容
     * @param res 依赖内容
     */
    addDep(res: Resource) {
        if (res instanceof Resource) {
            res._addReference();
            this._deps.push(res);

            if (!LayaEnv.isPlaying && res._traceDeps)
                res.on("obsolute", this, this.onDepObsolute);
        }
    }

    /**
     * 增加多个依赖内容
     * @param resArr 依赖内容
     */
    addDeps(resArr: Array<Resource>) {
        for (let res of resArr) {
            if (res instanceof Resource) {
                res._addReference();
                this._deps.push(res);

                if (!LayaEnv.isPlaying && res._traceDeps)
                    res.on("obsolute", this, this.onDepObsolute);
            }
        }
    }

    private onDepObsolute() {
        this.obsolute = true;
    }

    protected _disposeResource(): void {
    }

    /**
     * @en Destroys the resource, the resource cannot be recovered.
     * @zh 销毁资源,销毁后资源不能恢复。
     */
    destroy(): void {
        if (this._destroyed)
            return;

        this._destroyed = true;
        this.lock = false; //解锁资源，强制清理
        _disposingCounter++;
        this._disposeResource();
        for (let res of this._deps) {
            res._removeReference();

            if (!LayaEnv.isPlaying && res._traceDeps)
                res.off("obsolute", this, this.onDepObsolute);
        }
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