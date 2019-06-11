import { SingletonList } from "./SingletonList";
import { ISingletonElement } from "laya/resource/ISingletonElement";
/**
 * <code>SimpleSingletonList</code> 类用于实现单例队列。
 */
export declare class SimpleSingletonList extends SingletonList {
    /**
     * 创建一个新的 <code>SimpleSingletonList</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    add(element: ISingletonElement): void;
    /**
     * @private
     */
    remove(element: ISingletonElement): void;
}
