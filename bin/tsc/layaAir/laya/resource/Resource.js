import { ILaya } from "../../ILaya";
import { EventDispatcher } from "../events/EventDispatcher";
import { URL } from "../net/URL";
/**
 * <code>Resource</code> 资源存取类。
 */
export class Resource extends EventDispatcher {
    /**
     * 创建一个 <code>Resource</code> 实例。
     */
    constructor() {
        super();
        /**@private */
        this._id = 0;
        /**@private */
        this._url = null;
        /**@private */
        this._cpuMemory = 0;
        /**@private */
        this._gpuMemory = 0;
        /**@private */
        this._destroyed = false;
        /**@private */
        this._referenceCount = 0;
        /**是否加锁，如果true为不能使用自动释放机制。*/
        this.lock = false;
        /**名称。 */
        this.name = null;
        this._id = ++Resource._uniqueIDCounter;
        this._destroyed = false;
        this._referenceCount = 0;
        Resource._idResourcesMap[this.id] = this;
        this.lock = false;
    }
    /**
     * 当前内存，以字节为单位。
     */
    static get cpuMemory() {
        return Resource._cpuMemory;
    }
    /**
     * 当前显存，以字节为单位。
     */
    static get gpuMemory() {
        return Resource._gpuMemory;
    }
    /**
     * @internal
     */
    static _addCPUMemory(size) {
        Resource._cpuMemory += size;
    }
    /**
     * @internal
     */
    static _addGPUMemory(size) {
        Resource._gpuMemory += size;
    }
    /**
     * @internal
     */
    static _addMemory(cpuSize, gpuSize) {
        Resource._cpuMemory += cpuSize;
        Resource._gpuMemory += gpuSize;
    }
    /**
     * 通过资源ID返回已载入资源。
     * @param id 资源ID
     * @return 资源 <code>Resource</code> 对象。
     */
    static getResourceByID(id) {
        return Resource._idResourcesMap[id];
    }
    /**
     * 通过url返回已载入资源。
     * @param url 资源URL
     * @param index 索引
     * @return 资源 <code>Resource</code> 对象。
     */
    static getResourceByURL(url, index = 0) {
        return Resource._urlResourcesMap[url][index];
    }
    /**
     * 销毁当前没有被使用的资源,该函数会忽略lock=true的资源。
     * @param group 指定分组。
     */
    static destroyUnusedResources() {
        for (var k in Resource._idResourcesMap) {
            var res = Resource._idResourcesMap[k];
            if (!res.lock && res._referenceCount === 0)
                res.destroy();
        }
    }
    /**
     * 获取唯一标识ID,通常用于识别。
     */
    get id() {
        return this._id;
    }
    /**
     * 获取资源的URL地址。
     * @return URL地址。
     */
    get url() {
        return this._url;
    }
    /**
     * 内存大小。
     */
    get cpuMemory() {
        return this._cpuMemory;
    }
    /**
     * 显存大小。
     */
    get gpuMemory() {
        return this._gpuMemory;
    }
    /**
     * 是否已处理。
     */
    get destroyed() {
        return this._destroyed;
    }
    /**
     * 获取资源的引用计数。
     */
    get referenceCount() {
        return this._referenceCount;
    }
    /**
     * @internal
     */
    _setCPUMemory(value) {
        var offsetValue = value - this._cpuMemory;
        this._cpuMemory = value;
        Resource._addCPUMemory(offsetValue);
    }
    /**
     * @internal
     */
    _setGPUMemory(value) {
        var offsetValue = value - this._gpuMemory;
        this._gpuMemory = value;
        Resource._addGPUMemory(offsetValue);
    }
    /**
     */
    _setCreateURL(url) {
        url = URL.formatURL(url); //需要序列化为绝对路径
        if (this._url !== url) {
            var resList;
            if (this._url) {
                resList = Resource._urlResourcesMap[this._url];
                resList.splice(resList.indexOf(this), 1);
                (resList.length === 0) && (delete Resource._urlResourcesMap[this._url]);
            }
            if (url) {
                resList = Resource._urlResourcesMap[url];
                (resList) || (Resource._urlResourcesMap[url] = resList = []);
                resList.push(this);
            }
            this._url = url;
        }
    }
    /**
     * @internal
     */
    _addReference(count = 1) {
        this._referenceCount += count;
    }
    /**
     * @internal
     */
    _removeReference(count = 1) {
        this._referenceCount -= count;
    }
    /**
     * @internal
     */
    _clearReference() {
        this._referenceCount = 0;
    }
    /**
     * @private
     */
    _recoverResource() {
    }
    /**
     * @private
     */
    _disposeResource() {
    }
    /**
     * @private
     */
    _activeResource() {
    }
    /**
     * 销毁资源,销毁后资源不能恢复。
     */
    destroy() {
        if (this._destroyed)
            return;
        this._destroyed = true;
        this.lock = false; //解锁资源，强制清理
        this._disposeResource();
        delete Resource._idResourcesMap[this.id];
        var resList;
        if (this._url) {
            resList = Resource._urlResourcesMap[this._url];
            if (resList) {
                resList.splice(resList.indexOf(this), 1);
                (resList.length === 0) && (delete Resource._urlResourcesMap[this._url]);
            }
            var resou = ILaya.Loader.getRes(this._url);
            (resou == this) && (delete ILaya.Loader.loadedMap[this._url]);
        }
    }
}
/** @private */
Resource._uniqueIDCounter = 0;
/** @private */
Resource._idResourcesMap = {};
/** @private */
Resource._urlResourcesMap = {};
/** @private 以字节为单位。*/
Resource._cpuMemory = 0;
/** @private 以字节为单位。*/
Resource._gpuMemory = 0;
