/**
 * <code>Collision</code> 类用于创建物理碰撞信息。
 */
export class Collision {
    /**
     * 创建一个 <code>Collision</code> 实例。
     */
    constructor() {
        /**@internal */
        this._lastUpdateFrame = -2147483648 /*int.MIN_VALUE*/;
        /**@internal */
        this._updateFrame = -2147483648 /*int.MIN_VALUE*/;
        /**@internal */
        this._isTrigger = false;
        /**@readonly*/
        this.contacts = [];
    }
    /**
     * @internal
     */
    _setUpdateFrame(farme) {
        this._lastUpdateFrame = this._updateFrame; //TODO:为啥整两个
        this._updateFrame = farme;
    }
}
