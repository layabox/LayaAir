import { EventDispatcher } from "../events/EventDispatcher";
import { ICreateResource } from "./ICreateResource";
import { IDestroy } from "./IDestroy";
/**
 * <code>Resource</code> 资源存取类。
 */
export declare class Resource extends EventDispatcher implements ICreateResource, IDestroy {
    /** @private */
    private static _uniqueIDCounter;
    /** @private */
    private static _idResourcesMap;
    /** @private */
    private static _urlResourcesMap;
    /** @private 以字节为单位。*/
    private static _cpuMemory;
    /** @private 以字节为单位。*/
    private static _gpuMemory;
    /**
     * 当前内存，以字节为单位。
     */
    static readonly cpuMemory: number;
    /**
     * 当前显存，以字节为单位。
     */
    static readonly gpuMemory: number;
    /**
     * 通过资源ID返回已载入资源。
     * @param id 资源ID
     * @return 资源 <code>Resource</code> 对象。
     */
    static getResourceByID(id: number): Resource;
    /**
     * 通过url返回已载入资源。
     * @param url 资源URL
     * @param index 索引
     * @return 资源 <code>Resource</code> 对象。
     */
    static getResourceByURL(url: string, index?: number): Resource;
    /**
     * 销毁当前没有被使用的资源,该函数会忽略lock=true的资源。
     * @param group 指定分组。
     */
    static destroyUnusedResources(): void;
    /**@private */
    protected _id: number;
    /**@private */
    private _url;
    /**@private */
    private _cpuMemory;
    /**@private */
    private _gpuMemory;
    /**@private */
    private _destroyed;
    /**@private */
    protected _referenceCount: number;
    /**是否加锁，如果true为不能使用自动释放机制。*/
    lock: boolean;
    /**名称。 */
    name: string;
    /**
     * 获取唯一标识ID,通常用于识别。
     */
    readonly id: number;
    /**
     * 获取资源的URL地址。
     * @return URL地址。
     */
    readonly url: string;
    /**
     * 内存大小。
     */
    readonly cpuMemory: number;
    /**
     * 显存大小。
     */
    readonly gpuMemory: number;
    /**
     * 是否已处理。
     */
    readonly destroyed: boolean;
    /**
     * 获取资源的引用计数。
     */
    readonly referenceCount: number;
    /**
     * 创建一个 <code>Resource</code> 实例。
     */
    constructor();
    /**
     */
    _setCreateURL(url: string): void;
    /**
     * @private
     */
    protected _recoverResource(): void;
    /**
     * @private
     */
    protected _disposeResource(): void;
    /**
     * @private
     */
    protected _activeResource(): void;
    /**
     * 销毁资源,销毁后资源不能恢复。
     */
    destroy(): void;
}
