import { Node } from "../display/Node";
import { IDestroy } from "../resource/IDestroy";
import { ISingletonElement } from "../resource/ISingletonElement";
/**
 * <code>Component</code> 类用于创建组件的基类。
 */
export declare class Component implements ISingletonElement, IDestroy {
    /** @private [实现IListPool接口]*/
    _destroyed: boolean;
    /** @private [实现IListPool接口]*/
    private _indexInList;
    /** @private */
    _id: number;
    /** @private */
    _enabled: boolean;
    /** @private */
    private _awaked;
    /**
     * [只读]获取所属Node节点。
     * @readonly
     */
    owner: Node;
    /**
     * 创建一个新的 <code>Component</code> 实例。
     */
    constructor();
    /**
     * 获取唯一标识ID。
     */
    readonly id: number;
    /**
     * 获取是否启用组件。
     */
    enabled: boolean;
    /**
     * 获取是否为单实例组件。
     */
    readonly isSingleton: boolean;
    /**
     * 获取是否已经销毁 。
     */
    readonly destroyed: boolean;
    /**
     * @private
     */
    _isScript(): boolean;
    /**
     * @private
     */
    private _resetComp;
    /**
     * [实现IListPool接口]
     * @private
     */
    _getIndexInList(): number;
    /**
     * [实现IListPool接口]
     * @private
     */
    _setIndexInList(index: number): void;
    /**
     * 被添加到节点后调用，可根据需要重写此方法
     * @private
     */
    _onAdded(): void;
    /**
     * 被激活后调用，可根据需要重写此方法
     * @private
     */
    protected _onAwake(): void;
    /**
     * 被激活后调用，可根据需要重写此方法
     * @private
     */
    protected _onEnable(): void;
    /**
     * 被禁用时调用，可根据需要重写此方法
     * @private
     */
    protected _onDisable(): void;
    /**
     * 被销毁时调用，可根据需要重写此方法
     * @private
     */
    protected _onDestroy(): void;
    /**
     * 重置组件参数到默认值，如果实现了这个函数，则组件会被重置并且自动回收到对象池，方便下次复用
     * 如果没有重置，则不进行回收复用
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onReset(): void;
    /**
     * @private
     */
    _parse(data: any): void;
    /**
     * @private
     */
    _cloneTo(dest: Component): void;
    /**
     * @private
     */
    _setActive(value: boolean): void;
    /**
     * 销毁组件
     */
    destroy(): void;
    /**
     * @private
     */
    _destroy(): void;
}
