import { Vector2 } from "./math/Vector2";
import { ISingletonElement } from "../resource/ISingletonElement";
/**
 * <code>Touch</code> 类用于实现触摸描述。
 */
export declare class Touch implements ISingletonElement {
    /** @private  [实现IListPool接口]*/
    private _indexInList;
    /** @private */
    _identifier: number;
    /** @private */
    _position: Vector2;
    /**
     * 获取唯一识别ID。
     * @return 唯一识别ID。
     */
    readonly identifier: number;
    /**
     * 获取触摸点的像素坐标。
     * @return 触摸点的像素坐标 [只读]。
     */
    readonly position: Vector2;
    /**
     * @private
     * 创建一个 <code>Touch</code> 实例。
     */
    constructor();
    /**
     * @private [实现ISingletonElement接口]
     */
    _getIndexInList(): number;
    /**
     * @private [实现ISingletonElement接口]
     */
    _setIndexInList(index: number): void;
}
