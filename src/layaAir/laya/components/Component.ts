//@ts-nocheck
import { Node } from "../display/Node"
import { IDestroy } from "../resource/IDestroy"
import { ISingletonElement } from "../resource/ISingletonElement"
import { Pool } from "../utils/Pool"
import { Utils } from "../utils/Utils";

/**
 * <code>Component</code> 类用于创建组件的基类。
 */
export class Component implements ISingletonElement, IDestroy {
	/** @internal [实现IListPool接口]*/
	private _indexInList: number;

	/** @internal [实现IListPool接口]*/
	_destroyed: boolean;
	/** @internal */
	_id: number;
	/** @internal */
	_enabled: boolean;
	/** @internal */
	_awaked: boolean;

	/**
	 * [只读]获取所属Node节点。
	 * @readonly
	 */
	owner: Node;

	/**
	 * 创建一个新的 <code>Component</code> 实例。
	 */
	constructor() {
		this._id = Utils.getGID();
		this._resetComp();
	}

	/**
	 * 唯一标识ID。
	 */
	get id(): number {
		return this._id;
	}

	/**
	 * 是否启用组件。
	 */
	get enabled(): boolean {
		return this._enabled;
	}

	set enabled(value: boolean) {
		if (this._enabled != value) {
			this._enabled = value;
			if (this.owner) {
				if (value)
					this.owner.activeInHierarchy && this._onEnable();
				else
					this.owner.activeInHierarchy && this._onDisable();
			}
		}
	}

	/**
	 * 是否为单实例组件。
	 */
	get isSingleton(): boolean {
		return true;
	}

	/**
	 * 是否已经销毁 。
	 */
	get destroyed(): boolean {
		//[实现IListPool接口]
		return this._destroyed;
	}

	/**
	 * @internal
	 */
	_isScript(): boolean {
		return false;
	}

	/**
	 * @internal
	 */
	private _resetComp(): void {
		this._indexInList = -1;
		this._enabled = true;
		this._awaked = false;
		this.owner = null;
	}

	/**
	 * [实现IListPool接口]
	 */
	_getIndexInList(): number {
		return this._indexInList;
	}

	/**
	 * [实现IListPool接口]
	 */
	_setIndexInList(index: number): void {
		this._indexInList = index;
	}

	/**
	 * 被添加到节点后调用，可根据需要重写此方法
	 * @internal
	 */
	_onAdded(): void {
		//override it.
	}

	/**
	 * 被激活后调用，可根据需要重写此方法
	 * @internal
	 */
	_onAwake(): void {
		//override it.
	}

	/**
	 * 被激活后调用，可根据需要重写此方法
	 * @internal
	 */
	_onEnable(): void {
		//override it.
	}

	/**
	 * 被禁用时调用，可根据需要重写此方法
	 * @internal
	 */
	protected _onDisable(): void {
		//override it.
	}

	/**
	 * 被销毁时调用，可根据需要重写此方法
	 * @internal
	 */
	protected _onDestroy(): void {
		//override it.
	}

	/**
	 * 重置组件参数到默认值，如果实现了这个函数，则组件会被重置并且自动回收到对象池，方便下次复用
	 * 如果没有重置，则不进行回收复用
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onReset(): void {
		//override it.
	}

	/**
	 * @internal
	 */
	_parse(data: any,interactMap:any = null): void {
		//override it.
	}

	/**
	 * @internal
	 */
	_parseInteractive(data:any = null,spriteMap:any = null){
		//override it.
	}

	/**
	 * @internal
	 */
	_cloneTo(dest: Component): void {
		//override it.
	}

	/**
	 * @internal
	 */
	_setActive(value: boolean): void {
		if (value) {
			if (!this._awaked) {
				this._awaked = true;
				this._onAwake();
			}
			this._enabled && this._onEnable();
		} else {
			this._enabled && this._onDisable();
		}
	}

	/**
	 * 销毁组件
	 */
	destroy(): void {
		if (this.owner) this.owner._destroyComponent(this);
	}

	/**
	 * @internal
	 */
	_destroy(): void {
		if (this.owner.activeInHierarchy && this._enabled)
			this._setActive(false);

		this._onDestroy();
		this._destroyed = true;
		if (this.onReset !== Component.prototype.onReset) {
			this.onReset();
			this._resetComp();
			Pool.recoverByClass(this);
		} else {
			this._resetComp();
		}
	}
}

