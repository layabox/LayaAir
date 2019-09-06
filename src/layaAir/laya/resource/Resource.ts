import { ILaya } from "../../ILaya";
import { EventDispatcher } from "../events/EventDispatcher";
import { URL } from "../net/URL";
import { ICreateResource } from "./ICreateResource";
import { IDestroy } from "./IDestroy";

/**
 * <code>Resource</code> 资源存取类。
 */
export class Resource extends EventDispatcher implements ICreateResource, IDestroy {
	/** @private */
	private static _uniqueIDCounter: number = 0;
	/** @private */
	private static _idResourcesMap: any = {};
	/** @private */
	private static _urlResourcesMap: any = {};
	/** @private 以字节为单位。*/
	private static _cpuMemory: number = 0;
	/** @private 以字节为单位。*/
	private static _gpuMemory: number = 0;

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
	 * 通过资源ID返回已载入资源。
	 * @param id 资源ID
	 * @return 资源 <code>Resource</code> 对象。
	 */
	static getResourceByID(id: number): Resource {
		return Resource._idResourcesMap[id];
	}

	/**
	 * 通过url返回已载入资源。
	 * @param url 资源URL
	 * @param index 索引
	 * @return 资源 <code>Resource</code> 对象。
	 */
	static getResourceByURL(url: string, index: number = 0): Resource {
		return Resource._urlResourcesMap[url][index];
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
	protected _id: number = 0;
	/**@private */
	private _url: string = null;
	/**@private */
	private _cpuMemory: number = 0;
	/**@private */
	private _gpuMemory: number = 0;
	/**@private */
	private _destroyed: boolean = false;

	/**@private */
	protected _referenceCount: number = 0;

	/**是否加锁，如果true为不能使用自动释放机制。*/
	lock: boolean = false;
	/**名称。 */
	name: string = null;

	/**
	 * 获取唯一标识ID,通常用于识别。
	 */
	get id(): number {
		return this._id;
	}

	/**
	 * 获取资源的URL地址。
	 * @return URL地址。
	 */
	get url(): string {
		return this._url;
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
	 * 是否已处理。
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
	 */
	constructor() {
		super();
		this._id = ++Resource._uniqueIDCounter;
		this._destroyed = false;
		this._referenceCount = 0;
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
	_setCreateURL(url: string): void {
		url = URL.formatURL(url);//需要序列化为绝对路径
		if (this._url !== url) {
			var resList: Resource[];
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
	protected _disposeResource(): void {
	}

	/**
	 * @private
	 */
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
		this._disposeResource();
		delete Resource._idResourcesMap[this.id];
		var resList: Resource[];
		if (this._url) {
			resList = Resource._urlResourcesMap[this._url];
			if (resList) {
				resList.splice(resList.indexOf(this), 1);
				(resList.length === 0) && (delete Resource._urlResourcesMap[this._url]);
			}

			var resou: Resource = ILaya.Loader.loadedMap[this._url];
			(resou == this) && (delete ILaya.Loader.loadedMap[this._url]);
		}
	}
}

