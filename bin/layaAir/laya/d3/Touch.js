import { Vector2 } from "./math/Vector2";
/**
 * <code>Touch</code> 类用于实现触摸描述。
 */
export class Touch {
    /**
     * @private
     * 创建一个 <code>Touch</code> 实例。
     */
    constructor() {
        /** @private  [实现IListPool接口]*/
        this._indexInList = -1;
        /** @private */
        this._identifier = -1;
        /** @private */
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
     * @private [实现ISingletonElement接口]
     */
    _getIndexInList() {
        return this._indexInList;
    }
    /**
     * @private [实现ISingletonElement接口]
     */
    _setIndexInList(index) {
        this._indexInList = index;
    }
}
