import { Vector2 } from "./math/Vector2";
import { ISingletonElement } from "../resource/ISingletonElement";
/**
 * <code>Touch</code> 类用于实现触摸描述。
 */
export declare class Touch implements ISingletonElement {
    /**[实现IListPool接口]*/
    private _indexInList;
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
     *  [实现ISingletonElement接口]
     */
    _getIndexInList(): number;
    /**
     *  [实现ISingletonElement接口]
     */
    _setIndexInList(index: number): void;
}
