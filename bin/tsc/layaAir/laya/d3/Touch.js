import { Vector2 } from "./math/Vector2";
/**
 * <code>Touch</code> 类用于实现触摸描述。
 */
export class Touch {
    /**
     * @internal
     * 创建一个 <code>Touch</code> 实例。
     */
    constructor() {
        /**[实现IListPool接口]*/
        this._indexInList = -1;
        /** @internal */
        this._identifier = -1;
        /** @internal */
        this._position = new Vector2();
    }
    /**
     * 获取唯一识别ID。
     * @return 唯一识别ID。
     */
    get identifier() {
        return this._identifier;
    }
    /**
     * 获取触摸点的像素坐标。
     * @return 触摸点的像素坐标 [只读]。
     */
    get position() {
        return this._position;
    }
    /**
     *  [实现ISingletonElement接口]
     */
    _getIndexInList() {
        return this._indexInList;
    }
    /**
     *  [实现ISingletonElement接口]
     */
    _setIndexInList(index) {
        this._indexInList = index;
    }
}
