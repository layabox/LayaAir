import { ILaya } from "../../ILaya";
import { EventDispatcher } from "../events/EventDispatcher";
import { URL } from "../net/URL";

var _uniqueIDCounter: number = 0;

/**
 * <code>Resource</code> 资源存取类。
 */
export class Resource extends EventDispatcher {
    /** @private */
    private static _idResourcesMap: any = {};
    /** @private 以字节为单位。*/
    private static _cpuMemory: number = 0;
    /** @private 以字节为单位。*/
    private static _gpuMemory: number = 0;

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
     * @param group 指定分组。
     */
    static destroyUnusedResources(): void {
        for (var k in Resource._idResourcesMap) {
            var res: Resource = Resource._idResourcesMap[k];
            if (!res.lock && res._referenceCount === 0)
                res.destroy();
        }
    }

    /**@private */
    private _cpuMemory: number = 0;
    /**@private */
    private _gpuMemory: number = 0;

    /**@private */
    protected _id: number = 0;
    /**@private */
    protected _destroyed?: boolean;
    /**@private */
    protected _referenceCount: number = 0;

    /**是否加锁，如果true为不能使用自动释放机制。*/
    lock?: boolean;
    /**名称。 */
    name?: string;
    /**获取资源的URL地址。 */
    url: string;
    /**获取资源的UUID。 */
    uuid: string;

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

        this._id = ++_uniqueIDCounter;
        this._destroyed = false;
        this._referenceCount = 0;
        if (managed == null || managed)
            Resource._idResourcesMap[this.id] = this;
        this.lock = false;
    }

    /**
     * @internal
     */
    _setCPUMemory(value: number): void {
        var offsetValue: number = value - this._cpuMemory;
        this._cpuMemory = value;
        Resource._addCPUMemory(offsetValue);
    }

    /**
     * @internal
     */
    _setGPUMemory(value: number): void {
        var offsetValue: number = value - this._gpuMemory;
        this._gpuMemory = value;
        Resource._addGPUMemory(offsetValue);
    }

    /**
     * @private
     */
    _setCreateURL(url: string, uuid?: string): void {
        this.url = url;
        this.uuid = uuid;
    }

    /**
     * 返回资源是否从指定url创建
     */
    isCreateFromURL(url: string): boolean {
        return this.uuid && this.uuid.length === url.length + 6 && url.endsWith(this.uuid)
            || this.url === URL.formatURL(url);
    }

    /**
     * @internal
     * @implements IReferenceCounter
     */
    _addReference(count: number = 1): void {
        this._referenceCount += count;
    }

    /**
     * @internal
     * @implements IReferenceCounter
     */
    _removeReference(count: number = 1): void {
        this._referenceCount -= count;
    }

    /**
     * @internal
     * @implements IReferenceCounter
     */
    _clearReference(): void {
        this._referenceCount = 0;
    }

    /**
     * @private
     */
    protected _recoverResource(): void {
    }

    /**
     * @private
     */
    protected _disposeResource(force?: boolean): void {
    }

    /**
     * @private
     */
    protected _activeResource(): void {

    }

    /**
     * 销毁资源,销毁后资源不能恢复。
     */
    destroy(force?: boolean): void {
        if (this._destroyed)
            return;

        if (Resource.DEBUG)
            console.debug(`destroy ${Object.getPrototypeOf(this).constructor.name} ${this.url}`);

        this._destroyed = true;
        this.lock = false; //解锁资源，强制清理
        this._disposeResource(force);
        this.offAll();
        delete Resource._idResourcesMap[this.id];
        if (this.url)
            ILaya.loader.clearRes(this.url, this);
    }
}

